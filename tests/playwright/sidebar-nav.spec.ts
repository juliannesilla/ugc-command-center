import { test, expect, type Page } from '@playwright/test';

/**
 * Sidebar navigation smoke test.
 *
 * Verifies every sidebar item routes to a page that responds without a
 * Next.js error overlay. Mirrors the SIDEBAR_ITEMS array in
 * components/ui/sidebar.tsx — keep in sync if items are added/removed.
 */
const SIDEBAR_ITEMS: Array<{ label: string; href: string }> = [
  { label: 'Overview',             href: '/' },
  { label: 'Campaign Pipeline',    href: '/pipeline/board' },
  { label: 'Needs Attention',      href: '/pipeline/needs-attention' },
  { label: 'Ready to Execute',     href: '/pipeline/ready-to-execute' },
  { label: 'Production Queue',     href: '/pipeline/production-queue' },
  { label: 'Content Hub',          href: '/content-hub' },
  { label: 'Brand Responses',      href: '/brand-responses' },
  { label: 'Scheduling',           href: '/scheduling' },
  { label: 'Analytics',            href: '/analytics' },
  { label: 'Payments',             href: '/payments' },
  { label: 'Templates',            href: '/templates' },
  { label: 'Brand Relationships',  href: '/contacts' },
  { label: 'Creative Strategy',    href: '/creative-strategy' },
  { label: 'QA',                   href: '/qa' },
  { label: 'SideShift Growth',     href: '/sideshift-growth' },
  { label: 'Documents',            href: '/documents' },
  { label: 'Brain Dump',           href: '/brain-dump' },
  { label: 'Settings',             href: '/settings' },
];

async function bypassAuth(page: Page) {
  // Pre-set the auth storage so the password gate doesn't redirect us to /login.
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem('ugc-cc-auth', 'ok');
    } catch {
      /* storage may be unavailable in some contexts */
    }
  });
}

test.describe('sidebar navigation', () => {
  test.beforeEach(async ({ page }) => {
    await bypassAuth(page);
  });

  test('sidebar renders all expected items on the Overview page', async ({ page }) => {
    // HR-33 / A.14m fix: empty string + trailing-slash baseURL resolves to the
    // dashboard root, preserving the basePath when deployed under one.
    const response = await page.goto('');
    expect(response?.status(), 'Overview page must respond 2xx').toBeLessThan(400);

    for (const item of SIDEBAR_ITEMS) {
      // Each label should appear in the rendered sidebar (case-insensitive
      // exact match guards against partial collisions).
      const link = page.getByRole('link', { name: item.label, exact: true }).first();
      await expect(link, `sidebar item "${item.label}" must render`).toBeVisible();
    }
  });

  for (const item of SIDEBAR_ITEMS) {
    test(`navigates to ${item.label} (${item.href})`, async ({ page }) => {
      // HR-33 / A.14m fix: strip leading slash so WHATWG URL resolution
      // preserves the deployed basePath (sidebar item.href stays as /foo for
      // routing semantics in the app).
      const relHref = item.href.replace(/^\//, '');
      const response = await page.goto(relHref);
      expect(
        response?.status(),
        `${item.href} must return a non-error status`,
      ).toBeLessThan(400);

      // No Next.js dev error overlay.
      const errorOverlay = page.locator('nextjs-portal');
      await expect(errorOverlay).toHaveCount(0);

      // Page renders some content (body has text or the sidebar at minimum).
      await expect(page.locator('body')).toBeVisible();
    });
  }
});
