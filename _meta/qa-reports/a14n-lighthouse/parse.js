// Parse Lighthouse JSON reports and emit summary
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const FILES = [
  { slug: 'home', url: '/', baselineA11y: null },
  { slug: 'pipeline-board', url: '/pipeline/board/', baselineA11y: 90 },
  { slug: 'sow-breakdown', url: '/sow-breakdown/', baselineA11y: 94 },
  { slug: 'sow-breakdown-elf', url: '/sow-breakdown/elf/', baselineA11y: null },
  { slug: 'brand-responses', url: '/brand-responses/', baselineA11y: null },
  { slug: 'analytics', url: '/analytics/', baselineA11y: 94 },
  { slug: 'inbox', url: '/inbox/', baselineA11y: null },
  { slug: 'scheduling', url: '/scheduling/', baselineA11y: 87 },
];

const A11Y_RULES = [
  'button-name', 'color-contrast', 'heading-order', 'aria-prohibited-attr',
  'label-content-name-mismatch', 'aria-allowed-attr', 'aria-required-attr',
  'aria-roles', 'aria-valid-attr', 'aria-valid-attr-value', 'image-alt',
  'link-name', 'label', 'list', 'listitem', 'meta-viewport', 'html-has-lang',
  'document-title', 'duplicate-id-aria', 'frame-title', 'tabindex',
  'aria-allowed-role', 'aria-hidden-body', 'aria-hidden-focus',
  'aria-input-field-name', 'aria-toggle-field-name', 'aria-tooltip-name',
  'aria-treeitem-name', 'aria-command-name', 'aria-dialog-name',
  'aria-meter-name', 'aria-progressbar-name', 'aria-required-children',
  'aria-required-parent', 'aria-text', 'definition-list', 'dlitem',
  'empty-heading', 'form-field-multiple-labels', 'input-button-name',
  'input-image-alt', 'object-alt', 'select-name', 'skip-link',
  'td-headers-attr', 'th-has-data-cells', 'valid-lang', 'video-caption',
  'target-size',
];

const results = [];

for (const file of FILES) {
  const p = path.join(DIR, `${file.slug}.json`);
  if (!fs.existsSync(p)) {
    results.push({ ...file, error: 'JSON missing' });
    continue;
  }
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  const cats = data.categories;
  const scores = {
    perf: Math.round((cats.performance?.score ?? 0) * 100),
    a11y: Math.round((cats.accessibility?.score ?? 0) * 100),
    bp: Math.round((cats['best-practices']?.score ?? 0) * 100),
    seo: Math.round((cats.seo?.score ?? 0) * 100),
  };

  // Collect failing a11y audits
  const violations = [];
  for (const ruleId of A11Y_RULES) {
    const audit = data.audits[ruleId];
    if (!audit) continue;
    // score === 0 means failure; score === null with details means N/A; null = passed/NA
    if (audit.score === 0 || (audit.score !== null && audit.score < 1)) {
      const items = audit.details?.items || [];
      const selectors = items.map((it) => {
        return it.node?.selector || it.node?.snippet?.slice(0, 80) || '(no selector)';
      });
      violations.push({
        rule: ruleId,
        title: audit.title,
        count: items.length || 1,
        selectors: selectors.slice(0, 10),
      });
    }
  }

  results.push({ ...file, scores, violations });
}

// Emit summary.md
const baselines = {
  home: { perf: null, a11y: null, bp: null, seo: null },
  'pipeline-board': { perf: null, a11y: 90, bp: null, seo: null },
  'sow-breakdown': { perf: null, a11y: 94, bp: null, seo: null },
  'sow-breakdown-elf': { perf: null, a11y: null, bp: null, seo: null },
  'brand-responses': { perf: null, a11y: null, bp: null, seo: null },
  analytics: { perf: null, a11y: 94, bp: null, seo: null },
  inbox: { perf: null, a11y: null, bp: null, seo: null },
  scheduling: { perf: null, a11y: 87, bp: null, seo: null },
};

let md = `# A.14n Wave 1 Lighthouse Recheck — SUMMARY\n\n`;
md += `**Run date:** 2026-05-25\n**Source:** live production URLs (https://juliannesilla.github.io/ugc-command-center/...)\n**Tool:** \`npx lighthouse\` per-URL fallback (lhci hard-failed on Windows EPERM — J21)\n**Preset:** desktop, single run per URL\n\n`;
md += `## Per-URL Scores + Delta vs A.14m M2-V2\n\n`;
md += `| URL | Perf | A11y | BP | SEO | A.14m a11y | Δ a11y | Verdict |\n`;
md += `|---|---|---|---|---|---|---|---|\n`;
for (const r of results) {
  const baseline = baselines[r.slug].a11y;
  const delta = baseline !== null ? (r.scores.a11y - baseline) : '—';
  let verdict;
  if (baseline === null) {
    verdict = r.scores.a11y >= 95 ? '✅ ≥95' : '🔴 <95';
  } else if (r.scores.a11y >= 95) {
    verdict = '✅ NOW ≥95';
  } else if (r.scores.a11y > baseline) {
    verdict = '🟡 closer but still <95';
  } else {
    verdict = '🔴 unchanged/regressed';
  }
  md += `| ${r.url} | ${r.scores.perf} | **${r.scores.a11y}** | ${r.scores.bp} | ${r.scores.seo} | ${baseline ?? '—'} | ${delta} | ${verdict} |\n`;
}

md += `\n## Per-Route Remaining A11y Violations\n\n`;
for (const r of results) {
  if (r.violations.length === 0) {
    md += `### ${r.url} — ✅ no a11y violations\n\n`;
    continue;
  }
  md += `### ${r.url} (a11y=${r.scores.a11y})\n\n`;
  for (const v of r.violations) {
    md += `- **\`${v.rule}\`** (${v.count} instance${v.count > 1 ? 's' : ''}): ${v.title}\n`;
    for (const sel of v.selectors.slice(0, 5)) {
      md += `  - \`${sel.replace(/\n/g, ' ').slice(0, 120)}\`\n`;
    }
  }
  md += `\n`;
}

fs.writeFileSync(path.join(DIR, 'SUMMARY.md'), md);
console.log('Wrote SUMMARY.md');

// Also emit JSON snapshot for downstream
fs.writeFileSync(path.join(DIR, 'scores.json'), JSON.stringify(results, null, 2));
console.log('Wrote scores.json');

// Quick console table
console.log('\n=== SCORES ===');
for (const r of results) {
  const b = baselines[r.slug].a11y;
  console.log(`${r.url.padEnd(28)} perf=${r.scores.perf} a11y=${r.scores.a11y} bp=${r.scores.bp} seo=${r.scores.seo} (baseline a11y=${b ?? '—'}, delta=${b !== null ? r.scores.a11y - b : '—'})`);
}
console.log('\n=== A11Y VIOLATIONS BY ROUTE ===');
for (const r of results) {
  if (r.violations.length === 0) continue;
  console.log(`\n${r.url}:`);
  for (const v of r.violations) {
    console.log(`  ${v.rule} (${v.count}x): ${v.selectors[0]?.slice(0, 100)}`);
  }
}
