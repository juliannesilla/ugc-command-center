// tier2-review.mjs
// ELON Tier-2 independent review per CAPA-007 (separation of duties).
// Second Anthropic API call with reviewer persona that DID NOT author the patches.
// Returns structured JSON verdict for inclusion in the PR body.

const REVIEWER_SYSTEM = `You are ELON Tier-2 reviewer per CAPA-007 (separation of duties).
You did NOT author these patches. You are independent.

Grade the patches against Julz's hard rules:
- HR-15: verify the artifact, not the proxy (build-green ≠ user-facing change works)
- HR-19: source ≠ artifact (rendered output, not just diff text)
- HR-21: cite = invoke — if a skill was named, it must have actually been called
- HR-25: use ALL applicable skills, not just the primary
- HR-26: problems ship with solutions (any finding requires a remediation path)

Also grade:
- Visual fidelity (does the change preserve layout/intent?)
- Code clarity (readable, minimal, no dead branches)

Return ONLY a single JSON object on the FINAL line of your response, no prose after:
{
  "verdict": "PASS" | "PARTIAL" | "FAIL",
  "findings": [{ "rule": "HR-XX", "severity": "low|med|high", "detail": "..." }],
  "suggested_fixes": [{ "for": "HR-XX or area", "action": "..." }],
  "summary": "1-2 sentence bottom line"
}`;

/**
 * Run independent Tier-2 review of generated patches.
 *
 * @param {Object} opts
 * @param {Array<{path:string, diff:string, rationale?:string}>} opts.patches
 * @param {object} opts.anthropic                - Initialized Anthropic SDK client (caller-owned).
 * @param {string} [opts.model='claude-opus-4-7'] - Anthropic model id.
 * @param {number} [opts.maxTokens=2048]
 * @returns {Promise<{verdict:string, findings:Array, suggested_fixes:Array, summary:string, raw:string, usage:object}>}
 */
export async function tier2Review({
  patches,
  anthropic,
  model = 'claude-opus-4-7',
  maxTokens = 2048,
} = {}) {
  if (!Array.isArray(patches) || patches.length === 0) {
    throw new TypeError('tier2Review: patches[] is required and non-empty');
  }
  if (!anthropic || typeof anthropic.messages?.create !== 'function') {
    throw new TypeError('tier2Review: anthropic SDK client with messages.create required');
  }

  const userContent = buildUserPrompt(patches);

  const response = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    system: REVIEWER_SYSTEM,
    messages: [{ role: 'user', content: userContent }],
  });

  const text = extractText(response);
  const parsed = parseVerdict(text);

  return {
    verdict: parsed.verdict,
    findings: parsed.findings,
    suggested_fixes: parsed.suggested_fixes,
    summary: parsed.summary,
    raw: text,
    usage: response.usage ?? null,
  };
}

function buildUserPrompt(patches) {
  const blocks = patches.map((p, i) => {
    const rationale = p.rationale ? `\nRationale: ${p.rationale}` : '';
    return `### Patch ${i + 1}: ${p.path}${rationale}\n\`\`\`diff\n${p.diff}\n\`\`\``;
  });
  return [
    `Review the following ${patches.length} patch(es) independently.`,
    `Return ONLY the JSON object on the final line.`,
    '',
    ...blocks,
  ].join('\n');
}

function extractText(response) {
  if (!response?.content) return '';
  if (Array.isArray(response.content)) {
    return response.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n');
  }
  return String(response.content);
}

function parseVerdict(text) {
  const fallback = {
    verdict: 'FAIL',
    findings: [
      { rule: 'parse', severity: 'high', detail: 'Could not parse Tier-2 reviewer JSON output' },
    ],
    suggested_fixes: [{ for: 'parse', action: 'Re-run Tier-2 review with stricter prompt' }],
    summary: 'Tier-2 verdict unparseable — treat as FAIL.',
  };
  if (!text) return fallback;

  // Find the last JSON object in the response (reviewer is told to put it last).
  const match = text.match(/\{[\s\S]*\}\s*$/);
  if (!match) return fallback;
  try {
    const obj = JSON.parse(match[0]);
    return {
      verdict: obj.verdict ?? 'FAIL',
      findings: Array.isArray(obj.findings) ? obj.findings : [],
      suggested_fixes: Array.isArray(obj.suggested_fixes) ? obj.suggested_fixes : [],
      summary: obj.summary ?? '',
    };
  } catch {
    return fallback;
  }
}

export const _internals = { REVIEWER_SYSTEM, buildUserPrompt, parseVerdict, extractText };
