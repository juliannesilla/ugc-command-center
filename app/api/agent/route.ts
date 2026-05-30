// A.AA Wave 1 — LIVE in-dashboard agent ("ELON in the browser").
//
// Server route that streams Claude's answer over Julz's UGC data. This is the
// real-time successor to scripts/ask.mjs: same Tier-1 voice + cite-or-say-so
// rules + RAG-lite context, but live in the page instead of a clipboard command.
//
// WHERE IT RUNS:
//   - Vercel (DEPLOY_TARGET=vercel): live. This route handles POST + streams.
//   - GH Pages static export: this file is moved OUT by scripts/build-gh-pages-local.mjs
//     before `next build`, so the static site still builds. The agent simply
//     isn't available there (ChatBox falls back to clipboard mode).
//
// SECURITY: ANTHROPIC_API_KEY stays server-side (process.env) — never shipped to
// the browser. HR-37: force-dynamic is allowed on /api/* route handlers.
//
// Skills invoked (HR-21): claude-api (prompt caching + streaming + opus-4-8),
//   vercel:nextjs (Node runtime route handler), senior-backend.

import { promises as fs } from 'node:fs';
import path from 'node:path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-opus-4-8';
const DATA_DIR = path.join(process.cwd(), 'data');

async function readJsonl(file: string, cap = 400): Promise<Record<string, unknown>[]> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, file), 'utf8');
    return raw
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        try {
          return JSON.parse(l) as Record<string, unknown>;
        } catch {
          return null;
        }
      })
      .filter((r): r is Record<string, unknown> => r !== null)
      .slice(0, cap);
  } catch {
    return [];
  }
}

// Build the stable, cacheable system prompt (Tier-1 voice + rules + Julz's data).
// The data is large and identical across queries → it becomes the cached prefix
// (claude-api prompt-caching guidance). The volatile user question stays in messages.
async function buildSystemPrompt(routeContext?: string): Promise<string> {
  const canonical = await readJsonl('brands-canonical.jsonl');
  const messages = await readJsonl('sideshift-messages.jsonl', 40);
  const fit = await readJsonl('brand-fit-scores.jsonl', 60);

  const brands = canonical
    .filter((b) => b.dashboard_visible !== false)
    .map((b) => ({
      brand: b.brand_name_canonical,
      status: b.status,
      contract_signed: b.contract_signed,
      payment_usd: b.payment_amount_usd,
      bonus_usd: b.bonus_amount_usd,
      payment_terms_days: b.payment_terms_days,
      deliverables: b.deliverables,
      deadlines: b.deadlines,
      awaiting_julz: b.awaiting_julz,
      awaiting_julz_action: b.awaiting_julz_action,
      urgency: b.urgency,
      fit_score: b.fit_score,
      last_msg_at: b.last_msg_at,
      last_msg_direction: b.last_msg_direction,
    }));

  const recentMsgs = messages.map((m) => ({
    brand: m.brand,
    direction: m.direction,
    status: m.status,
    ts: m.ts,
    preview: String((m.last_message_preview ?? m.message_text ?? '') as string).slice(0, 220),
  }));

  return `You are ELON, Julz Silla's in-dashboard AI assistant for her UGC creator business. You know her pipeline, brand deals, SideShift threads, and @geezjulz content inside out.

Tier-1 voice (every answer): clear, structured, strategic, practical, polished, bold, semi-casual, punchy. Bestie + direct. No fluff. Short over long.
Banned: "Hey guys", overpromise language, hardship reveals.

RULES:
1. Answer ONLY from the data below. If it isn't there, say so honestly and name the exact file/data she'd need to add.
2. Cite sources by filename when you state a fact (e.g. "per brands-canonical.jsonl, Phobaxx is signed at $450").
3. Open with a 1-line TL;DR (state of play + the single action she should take), then the detail.
4. Markdown. Tables for comparisons, lists for actions. Money as $X. Be concrete.
5. If a question is ambiguous, give the smallest-interpretation answer first, then offer to go broader.
${routeContext ? `\nThe user is currently viewing: ${routeContext}. Prefer answers relevant to that view when sensible.\n` : ''}
--- DATA: brands-canonical.jsonl (${brands.length} dashboard-visible brands) ---
${JSON.stringify(brands, null, 1)}

--- DATA: sideshift-messages.jsonl (last ${recentMsgs.length}) ---
${JSON.stringify(recentMsgs, null, 1)}

--- DATA: brand-fit-scores.jsonl (${fit.length}) ---
${JSON.stringify(fit.slice(0, 40), null, 1)}
--- END DATA ---`;
}

export async function POST(req: Request): Promise<Response> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY is not set on the server.' }),
      { status: 503, headers: { 'content-type': 'application/json' } },
    );
  }

  let body: { query?: string; routeContext?: string } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    /* empty/invalid body handled below */
  }
  const query = (body.query ?? '').toString().slice(0, 4000).trim();
  const routeContext = body.routeContext ? body.routeContext.toString().slice(0, 160) : undefined;

  if (!query) {
    return new Response(JSON.stringify({ error: 'Empty query.' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const systemPrompt = await buildSystemPrompt(routeContext);

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const claudeStream = client.messages.stream({
          model: MODEL,
          max_tokens: 4000,
          // claude-api: cache the large stable data prefix; the volatile question
          // lives in messages so cache hits accrue across questions.
          system: [
            {
              type: 'text',
              text: systemPrompt,
              cache_control: { type: 'ephemeral' },
            },
          ],
          messages: [{ role: 'user', content: query }],
        });

        claudeStream.on('text', (delta: string) => {
          controller.enqueue(encoder.encode(delta));
        });

        await claudeStream.finalMessage();
        controller.close();
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'unknown error';
        controller.enqueue(encoder.encode(`\n\n_[agent error: ${msg}]_`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}
