// Markdown data-sync. Reads from data/ugc-mirror/ (populated by GitHub Action cron).
//
// ── Forbidden paths (HARD GUARDRAIL) ─────────────────────────────────────────
// This module MUST NOT read from:
//   - OneDrive/Desktop/julz-vault/**
//   - juliannesilla.github.io/julz-command-center/**
//   - OneDrive/Desktop/Julz & RJ — Command Center*.pdf
//   - Any *financial*, *household*, *identity-theft*, *post-hdmz*, *RJ* paths
//   - ~/Documents/ financial data
//   - ~/.claude/projects/*/memory/
//
// ── Allowed sources ──────────────────────────────────────────────────────────
//   - OneDrive/Desktop/UGC/** (origin, copied via cron rsync)
//   - data/ugc-mirror/** (in-repo mirror, the only path THIS file reads)
//
// ── Live swap (future) ───────────────────────────────────────────────────────
// 1. Run `.github/workflows/refresh-data.yml` to rsync UGC/** → data/ugc-mirror/.
// 2. This module parses the mirror's *.md files via gray-matter.
// 3. NEVER point this module at the raw UGC/ workspace — it must stay
//    behind the cron mirror to keep CI hermetic.

export const UGC_MIRROR_DIR = 'data/ugc-mirror';

const FORBIDDEN_FRAGMENTS = [
  'julz-vault',
  'julz-command-center',
  'household',
  'identity-theft',
  'post-hdmz',
  'financial',
  '/RJ',
  '/rj-',
  '.claude/projects',
];

export function assertAllowedPath(p: string): void {
  const lower = p.toLowerCase().replace(/\\/g, '/');
  for (const frag of FORBIDDEN_FRAGMENTS) {
    if (lower.includes(frag.toLowerCase())) {
      throw new Error(
        `[markdown.ts] Forbidden source path attempted: ${p} (matched: ${frag})`,
      );
    }
  }
  if (!lower.includes('ugc-mirror') && !lower.includes('ugc/')) {
    throw new Error(`[markdown.ts] Path outside allowed UGC scope: ${p}`);
  }
}

export interface ParsedMarkdownDoc {
  slug: string;
  frontmatter: Record<string, unknown>;
  body: string;
}

// Static-export safe stub. At runtime in a Node build step you could swap this
// for a real fs + gray-matter read; for the static export it returns [].
// TODO(D-5 live): implement once data/ugc-mirror/ is populated by the cron.
export async function readMirrorDocs(): Promise<ParsedMarkdownDoc[]> {
  return [];
}
