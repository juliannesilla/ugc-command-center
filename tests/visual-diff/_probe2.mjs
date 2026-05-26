import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
const page = await ctx.newPage();
await page.goto('http://localhost:3002/ugc-command-center/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const out = await page.evaluate(() => {
  const aside = document.querySelector('aside');
  const main = document.querySelector('main');
  const header = document.querySelector('header');
  return {
    asideDisplay: aside ? getComputedStyle(aside).display : 'no-aside',
    asideClasses: aside?.className?.slice(0, 200),
    mainPaddingLeft: main ? getComputedStyle(main).paddingLeft : null,
    headerExists: !!header,
    headerHeight: header ? header.getBoundingClientRect().height : null,
    bodyWidth: document.body.getBoundingClientRect().width,
    firstVisibleH1: document.querySelector('h1')?.innerText?.slice(0, 80),
    cssLoaded: !!Array.from(document.styleSheets).find(s => {
      try { return Array.from(s.cssRules || []).length > 10; } catch { return false; }
    }),
  };
});
console.log(JSON.stringify(out, null, 2));
await browser.close();
