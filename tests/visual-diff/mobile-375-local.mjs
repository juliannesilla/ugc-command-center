// A.14o Wave 1 mobile capture — local dev server at 375px
// Captures /, /pipeline/board, /sow-breakdown, /analytics
// + records horizontalScroll bool + viewport widths of key elements
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const BASE = process.env.BASE_URL ?? 'http://localhost:3001';
const TAG  = process.env.TAG ?? 'before';
const OUT = resolve(`_meta/dashboard-spec/post-a14o-mobile/${TAG}`);
mkdirSync(OUT, { recursive: true });

const routes = [
  { slug: 'root',           path: '/' },
  { slug: 'pipeline-board', path: '/pipeline/board' },
  { slug: 'sow-breakdown',  path: '/sow-breakdown' },
  { slug: 'analytics',      path: '/analytics' },
];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 375, height: 812 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
const page = await ctx.newPage();

const results = [];
for (const r of routes) {
  const url = `${BASE}${r.path}`;
  console.log(`[mobile-375/${TAG}] -> ${url}`);
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(500);

    const file = resolve(OUT, `${r.slug}.375.png`);
    await page.screenshot({ path: file, fullPage: true });

    // Probe: does horizontal scroll exist? Sidebar visible? KPI cols?
    const probe = await page.evaluate(() => {
      const docW = document.documentElement.scrollWidth;
      const winW = window.innerWidth;
      const aside = document.querySelector('aside');
      const asideVisible = aside ? getComputedStyle(aside).display !== 'none' : false;
      const statStrip = document.querySelector('[role="list"][aria-label="Key stats"]');
      const statCols = statStrip ? getComputedStyle(statStrip).gridTemplateColumns.split(' ').length : 0;
      return { docW, winW, hScroll: docW > winW + 1, asideVisible, statCols };
    });
    results.push({ slug: r.slug, ...probe });
    console.log(`  saved + probe`, probe);
  } catch (e) {
    console.error(`  FAIL ${r.slug}: ${e.message}`);
    results.push({ slug: r.slug, error: e.message });
  }
}

writeFileSync(
  resolve(OUT, '_probe.json'),
  JSON.stringify({ tag: TAG, base: BASE, viewport: '375x812', results }, null, 2),
);
await browser.close();
console.log(`[mobile-375/${TAG}] done — ${results.length} routes`);
