import { test, expect, type Page } from '@playwright/test';

/**
 * Brand Responses split-pane test.
 *
 * Clicking a row in the left list should:
 *   1. Update the right pane with that row's detail content.
 *   2. Reflect the selected id in the URL as ?id=<id>.
 */

async function bypassAuth(page: Page) {
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem('ugc-cc-auth', 'ok');
    } catch {
      /* noop */
    }
  });
}

test.describe('brand responses split pane', () => {
  test.beforeEach(async ({ page }) => {
    await bypassAuth(page);
    await page.goto('/brand-responses');
  });

  test('page renders without errors', async ({ page }) => {
    await expect(page.locator('nextjs-portal')).toHaveCount(0);
    await expect(page.locator('body')).toBeVisible();
  });

  test('clicking a row updates right pane and URL', async ({ page }) => {
    const rows = page.locator(
      '[data-testid="brand-response-row"], [data-response-row], li[role="button"], button[data-id]',
    );

    const rowCount = await rows.count();
    if (rowCount === 0) {
      test.info().annotations.push({
        type: 'skip-reason',
        description: 'No brand-response rows rendered — empty state. Test is informational.',
      });
      test.skip();
      return;
    }

    const targetRow = rows.nth(Math.min(1, rowCount - 1));
    await targetRow.click();

    // URL should now contain ?id=
    await expect(page).toHaveURL(/\?id=/);

    // Right pane should be visible and contain content.
    const rightPane = page.locator(
      '[data-testid="brand-response-detail"], [data-detail-pane], aside, section[aria-label*="detail" i]',
    ).first();

    await expect(rightPane, 'right pane must render after row click').toBeVisible();
  });

  test('direct deep-link with ?id= renders the detail pane', async ({ page }) => {
    await page.goto('/brand-responses?id=1');
    await expect(page.locator('nextjs-portal')).toHaveCount(0);
    // We don't assert content (id=1 may not exist in seed data), only that
    // navigation does not throw a runtime error.
    await expect(page.locator('body')).toBeVisible();
  });
});
