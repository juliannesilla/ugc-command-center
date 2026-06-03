// A.AA Wave B6 — GitHub-Issue-backed feedback (live · persistent · reaches ELON).
//
// Why: on the static GitHub-Pages build there is no server, so the old
// "Leave feedback" path saved only to the visitor's localStorage — comments were
// trapped in the browser and never reached the repo or ELON. This routes each
// comment to a real GitHub Issue (permanent, timestamped, readable anywhere via
// `gh issue list --label dashboard-feedback`), and lets the Feedback Hub read
// them back live from GitHub's PUBLIC issues API (public repo → no auth needed).
//
// HR-10 (honest: real persistence, no fake) · HR-49 (real data) · HR-50 (complete loop).

export const FEEDBACK_REPO = 'juliannesilla/ugc-command-center';
export const FEEDBACK_LABEL = 'dashboard-feedback';

export interface FeedbackDraft {
  route: string;
  text: string;
  priority: string;
  x_pct?: number;
  y_pct?: number;
  target_selector?: string;
}

/** Build a pre-filled "new issue" URL. User clicks Submit → permanent issue. */
export function buildFeedbackIssueUrl(d: FeedbackDraft): string {
  const stamp = new Date().toISOString();
  const title = `[feedback] ${d.priority} · ${d.route} — ${d.text.slice(0, 48).replace(/\s+/g, ' ').trim()}`;
  const body = [
    d.text,
    '',
    '---',
    `- **Route:** \`${d.route}\``,
    `- **Priority:** ${d.priority}`,
    d.target_selector ? `- **Element:** \`${d.target_selector}\`` : '',
    d.x_pct != null && d.y_pct != null ? `- **Position:** ${d.x_pct.toFixed(0)}%, ${d.y_pct.toFixed(0)}%` : '',
    `- **Logged:** ${stamp}`,
    '',
    '_Filed from the UGC Command Center “Leave feedback” button._',
  ]
    .filter(Boolean)
    .join('\n');

  const u = new URL(`https://github.com/${FEEDBACK_REPO}/issues/new`);
  u.searchParams.set('title', title);
  u.searchParams.set('body', body);
  u.searchParams.set('labels', FEEDBACK_LABEL);
  return u.toString();
}

export interface FeedbackIssue {
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed' | string;
  created_at: string;
  html_url: string;
  route: string;
  priority: string;
}

function parseField(body: string, label: string): string {
  const m = body?.match(new RegExp(`\\*\\*${label}:\\*\\*\\s*\`?([^\`\\n]+)\`?`, 'i'));
  return m ? m[1].trim() : '';
}

/** Live-read feedback issues from GitHub's PUBLIC API (no token; public repo). */
export async function fetchFeedbackIssues(): Promise<FeedbackIssue[]> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${FEEDBACK_REPO}/issues?labels=${FEEDBACK_LABEL}&state=all&per_page=50&sort=created&direction=desc`,
      { headers: { Accept: 'application/vnd.github+json' }, cache: 'no-store' },
    );
    if (!res.ok) return [];
    const data: unknown = await res.json();
    if (!Array.isArray(data)) return [];
    return data
      .filter((i: Record<string, unknown>) => !i.pull_request)
      .map((i: Record<string, unknown>) => {
        const body = String(i.body ?? '');
        return {
          number: Number(i.number),
          title: String(i.title ?? ''),
          body,
          state: String(i.state ?? 'open'),
          created_at: String(i.created_at ?? ''),
          html_url: String(i.html_url ?? ''),
          route: parseField(body, 'Route'),
          priority: parseField(body, 'Priority') || 'P1',
        };
      });
  } catch {
    return [];
  }
}
