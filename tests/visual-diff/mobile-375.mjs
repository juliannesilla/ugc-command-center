// Quick mobile 375px responsive capture - 4 representative routes
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const BASE = 'https://juliannesilla.github.io/ugc-command-center/';
const OUT = resolve('_meta/mockups/post-a14m-visual-diff-live/mobile-375');
mkdirSync(OUT, { recursive: true });

const routes = [
  { slug: 'root', path: '' },
  { slug: 'pipeline-board', path: 'pipeline/board' },
  { slug: 'analytics', path: 'analytics' },
  { slug: 'sow-breakdown', path: 'sow-breakdown' },
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
const page = await ctx.newPage();

for (const r of routes) {
  const url = new URL(r.path, BASE).toString();
  console.log(`[mobile-375] -> ${url}`);
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(800);
    const file = resolve(OUT, `${r.slug}.375.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log(`  saved ${file}`);
  } catch (e) {
    console.error(`  FAIL ${r.slug}: ${e.message}`);
  }
}

await browser.close();
console.log('[mobile-375] done');
