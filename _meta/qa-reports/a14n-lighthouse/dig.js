// Extract detailed selector + snippet + contrast values for breach routes
const fs = require('fs');
const path = require('path');

const ROUTES = [
  { slug: 'pipeline-board', url: '/pipeline/board/' },
  { slug: 'sow-breakdown', url: '/sow-breakdown/' },
];

for (const r of ROUTES) {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, `${r.slug}.json`), 'utf8'));
  console.log(`\n===== ${r.url} (a11y=${Math.round(data.categories.accessibility.score * 100)}) =====`);
  for (const ruleId of ['color-contrast', 'heading-order', 'aria-prohibited-attr', 'label-content-name-mismatch']) {
    const a = data.audits[ruleId];
    if (!a || a.score === 1 || a.score === null) continue;
    console.log(`\n[${ruleId}] ${a.title}`);
    const items = a.details?.items || [];
    for (const it of items.slice(0, 5)) {
      const node = it.node || {};
      console.log(`  selector: ${node.selector}`);
      console.log(`  snippet : ${(node.snippet || '').slice(0, 250)}`);
      console.log(`  explain : ${(node.explanation || '').slice(0, 200)}`);
      console.log(`  ---`);
    }
  }
}

// Also scheduling label-content-name-mismatch detail
const sched = JSON.parse(fs.readFileSync(path.join(__dirname, 'scheduling.json'), 'utf8'));
console.log(`\n===== /scheduling/ label-content-name-mismatch detail =====`);
const lcnm = sched.audits['label-content-name-mismatch'];
if (lcnm && lcnm.details) {
  for (const it of lcnm.details.items.slice(0, 5)) {
    const n = it.node || {};
    console.log(`  selector: ${n.selector}`);
    console.log(`  snippet : ${(n.snippet || '').slice(0, 250)}`);
    console.log(`  explain : ${(n.explanation || '').slice(0, 200)}`);
    console.log(`  ---`);
  }
}

// Home color-contrast detail (since 32x is biggest hit)
const home = JSON.parse(fs.readFileSync(path.join(__dirname, 'home.json'), 'utf8'));
console.log(`\n===== / color-contrast top 3 detail =====`);
const cc = home.audits['color-contrast'];
if (cc && cc.details) {
  for (const it of cc.details.items.slice(0, 3)) {
    const n = it.node || {};
    console.log(`  selector: ${n.selector}`);
    console.log(`  snippet : ${(n.snippet || '').slice(0, 200)}`);
    console.log(`  explain : ${(n.explanation || '').slice(0, 300)}`);
    console.log(`  ---`);
  }
}
