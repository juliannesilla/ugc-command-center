// open-pr.mjs
// Octokit-based draft-PR creation for dashboard-comment automation.
// Idempotent: reuses an existing open PR for the same head branch.
// HR-25/26: problem (duplicate PRs) ships with solution (head-branch lookup before create).

/**
 * Open (or reuse) a draft PR for the given branch.
 *
 * @param {Object} opts
 * @param {string} opts.branch          - Head branch name (must already be pushed).
 * @param {string} [opts.base='main']   - Base branch for the PR.
 * @param {string} opts.title           - PR title.
 * @param {string} opts.body            - PR body (markdown).
 * @param {string[]} [opts.labels]      - Labels to apply (created if missing on repo).
 * @param {string} [opts.owner]         - Repo owner; falls back to GITHUB_REPOSITORY env.
 * @param {string} [opts.repo]          - Repo name; falls back to GITHUB_REPOSITORY env.
 * @param {string} [opts.token]         - GitHub token; falls back to GITHUB_TOKEN / GH_TOKEN env.
 * @param {object} [opts.octokit]       - Pre-constructed Octokit instance (for tests).
 * @returns {Promise<{pr_number:number, pr_url:string, head_sha:string, reused:boolean}>}
 */
export async function openDraftPR({
  branch,
  base = 'main',
  title,
  body,
  labels = ['dashboard-comment', 'automated'],
  owner,
  repo,
  token,
  octokit,
} = {}) {
  if (!branch) throw new TypeError('openDraftPR: branch is required');
  if (!title) throw new TypeError('openDraftPR: title is required');
  if (!body) throw new TypeError('openDraftPR: body is required');

  const { ownerResolved, repoResolved } = resolveRepo({ owner, repo });
  const client = octokit ?? (await buildOctokit(token));

  // 1. Look for an already-open PR with this head branch (idempotency).
  const existing = await client.rest.pulls.list({
    owner: ownerResolved,
    repo: repoResolved,
    state: 'open',
    head: `${ownerResolved}:${branch}`,
    per_page: 10,
  });

  if (existing.data.length > 0) {
    const pr = existing.data[0];
    await safeApplyLabels(client, ownerResolved, repoResolved, pr.number, labels);
    return {
      pr_number: pr.number,
      pr_url: pr.html_url,
      head_sha: pr.head.sha,
      reused: true,
    };
  }

  // 2. Create a fresh draft PR.
  const created = await client.rest.pulls.create({
    owner: ownerResolved,
    repo: repoResolved,
    head: branch,
    base,
    title,
    body,
    draft: true,
  });

  await safeApplyLabels(client, ownerResolved, repoResolved, created.data.number, labels);

  return {
    pr_number: created.data.number,
    pr_url: created.data.html_url,
    head_sha: created.data.head.sha,
    reused: false,
  };
}

function resolveRepo({ owner, repo }) {
  if (owner && repo) return { ownerResolved: owner, repoResolved: repo };
  const slug = process.env.GITHUB_REPOSITORY;
  if (slug && slug.includes('/')) {
    const [o, r] = slug.split('/');
    return { ownerResolved: owner ?? o, repoResolved: repo ?? r };
  }
  throw new Error(
    'openDraftPR: owner+repo not provided and GITHUB_REPOSITORY env not set'
  );
}

async function buildOctokit(token) {
  const ghToken = token ?? process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
  if (!ghToken) {
    throw new Error('openDraftPR: GITHUB_TOKEN env required (or pass opts.token)');
  }
  // Dynamic import keeps the module load-time light and avoids hard-failing
  // when consumers (or unit tests) don't have @octokit/rest installed yet.
  const { Octokit } = await import('@octokit/rest');
  return new Octokit({ auth: ghToken });
}

async function safeApplyLabels(client, owner, repo, issue_number, labels) {
  if (!labels || labels.length === 0) return;
  try {
    await client.rest.issues.addLabels({ owner, repo, issue_number, labels });
  } catch (err) {
    // Labels may not exist yet; surface but don't block PR creation.
    // X2's main script logs this — we just don't throw.
    if (err?.status !== 404 && err?.status !== 422) throw err;
  }
}
