/**
 * Lighthouse CI configuration for UGC Command Center
 * ----------------------------------------------------
 * Owner: A14I-5b LIGHTHOUSE
 * Phase: A.14i (QA infrastructure)
 *
 * Run modes:
 *   Static build :  npm run build && npx lhci autorun
 *   Live deploy  :  LHCI_TARGET_URL=https://<prod-url> npx lhci autorun --collect.url=...
 *
 * Budgets enforced via `lighthouse-budgets.json` + category assertions below.
 * Build fails (exit non-zero) if any URL drops below threshold.
 */

const TARGET_URL = process.env.LHCI_TARGET_URL || 'http://localhost:3000';

const ROUTES = [
  '/',
  '/pipeline/board',
  '/pipeline/database',
  '/brand-responses',
  '/analytics',
  '/payments',
  '/sow-breakdown',
  '/script-production',
];

module.exports = {
  ci: {
    collect: {
      // When running against built static export, lhci will serve `out/` automatically
      // via `staticDistDir`. When LHCI_TARGET_URL is set, it audits the live deploy.
      staticDistDir: process.env.LHCI_TARGET_URL ? undefined : './out',
      url: ROUTES.map((r) => `${TARGET_URL}${r}`),
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        // Throttling preset 'desktop' approximates a typical broadband connection.
        // Override per-run with --collect.settings.throttlingMethod=devtools if needed.
        budgetsPath: './lighthouse-budgets.json',
        skipAudits: [
          // skip flaky/network-dependent audits that don't apply to a static export
          'uses-http2',
          'redirects-http',
        ],
      },
    },
    assert: {
      assertions: {
        // Category-level budgets (HR-25: budget config rejects builds below threshold)
        'categories:performance': ['error', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.85 }],

        // Specific high-signal audits surfaced as warnings (don't fail build but
        // visible in report). Tighten to 'error' once baseline is stable.
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        'interactive': ['warn', { maxNumericValue: 3500 }],

        // Accessibility hard floors (HR-25 a11y ≥95)
        'color-contrast': 'error',
        'image-alt': 'error',
        'label': 'error',
        'link-name': 'error',
        'button-name': 'error',
        'meta-viewport': 'error',
        'html-has-lang': 'error',
        'document-title': 'error',
      },
    },
    upload: {
      // Public temporary storage — no auth needed, link expires in ~7 days.
      // Swap to LHCI server target once team standups a permanent host.
      target: 'temporary-public-storage',
    },
  },
};
