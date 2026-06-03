#!/usr/bin/env node
// dedup-sideshift.mjs - collapse data/sideshift-messages.jsonl to ONE row per brand
// (newest ts wins). Guards against cross-format / thread-id-change duplicates so
// brand-responses (keyed by brand name) never shows doubled conversations.
import { readFileSync, writeFileSync } from 'node:fs';
const p = 'data/sideshift-messages.jsonl';
const rows = readFileSync(p,'utf8').split(/\r?\n/).filter(l=>l.trim()).map(l=>{try{return JSON.parse(l)}catch{return null}}).filter(Boolean);
const norm = s => String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
const m = new Map();
for (const r of rows){ const k = norm(r.brand) || r.thread_id || r.id; const e = m.get(k); if(!e || String(r.ts||'') > String(e.ts||'')) m.set(k,r); }
const out = [...m.values()].sort((a,b)=>String(b.ts||'').localeCompare(String(a.ts||'')));
writeFileSync(p, out.map(r=>JSON.stringify(r)).join('\n')+'\n');
console.log('dedup-sideshift: '+rows.length+' -> '+out.length+' rows ('+m.size+' brands)');