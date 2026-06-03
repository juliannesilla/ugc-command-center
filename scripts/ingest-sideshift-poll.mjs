#!/usr/bin/env node
/**
 * ingest-sideshift-poll.mjs — A.AB live SideShift poll → canonical poll file.
 *
 * Source: LIVE read of app.sideshift.app/chat via Claude_in_Chrome on Julz's
 * authenticated "JULZ | PC" browser session (2026-06-03). The conversation list
 * (brand · relative-time · last-message preview · direction) was scraped from
 * the a11y tree and pasted below verbatim. HR-10: only real threads, no
 * fabrication. Relative time labels are resolved to ISO using the real clock
 * at run time (so "Wed"/"Yesterday"/"4:37 PM" map to actual dates).
 *
 * Writes data/sideshift-messages.jsonl (+ regenerates .json) — the file the
 * dashboard's brand-responses + sideshift-growth activity read.
 * Run: node scripts/ingest-sideshift-poll.mjs
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';

const REPO = path.resolve(
  path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'),
  '..',
);
const DATA = path.join(REPO, 'data');
const THREAD_URL = 'https://app.sideshift.app/chat';

// ── LIVE scrape (2026-06-03) — order = SideShift recency (newest first) ──────
// [brand, timeLabel, preview]. direction inferred: preview starting "You:" =
// outbound (Julz sent last), else inbound (brand sent last).
const ROWS = [
  ['Clicky', '4:37 PM', 'Thank you for applying to the Heyclicky Creator Program! The next step in the application process is…'],
  ['Mirage', '11:24 AM', 'You: Hi Julianne, thank you! Here is the brief: https://www.notion.so/captions/Captions-TikTok-Infl…'],
  ['Ethereal Media', '9:55 AM', 'You: Hi there, Thank you so much for reaching out — I really appreciate it! I’d be open to learning…'],
  ['Adly', '9:40 AM', 'Hi, just sent you an email. Kindly check your inbox. Thanks!'],
  ['Wiingy', '7:26 AM', 'Hi JULIANNE, Thank you so much for showing interest in the program. Here’s a quick glimpse of th…'],
  ['Infinite Pulse Media', '6:19 AM', 'You: Hi there, Thank you so much for sending this over — I really appreciate it! I’m definitely op…'],
  ['VYXO', '6:13 AM', 'You: Hi rawvein, Thank you so much for reaching out — I really appreciate it! For VYXO, I’d create…'],
  ['KarmaTech OU', '6:12 AM', 'You: Hi Ayca, Thank you so much for clarifying the compensation and campaign structure — I really a…'],
  ['Craze Software, LLC', '5:33 AM', 'You: Hi Ally, Thank you so much for reaching out — I really appreciate it! I’d be open to learning…'],
  ['Masterhooks', 'Yesterday', 'You: Hi Julianne! Thank you so much for getting back with me! I am so glad to have you and excited t…'],
  ['MyCal: AI Calorie Tracker', 'Yesterday', 'You: Hi Julianne, thank you for the kind words. Looking forward to receiving your handles. Please m…'],
  ['Tailgate', 'Sun', 'You: @Julianne ! LMK what you think :)'],
  ['Heyoka LLC', 'Fri', 'You: you applied for a $1,000 base but your does not align, we would like to try you out for the fir…'],
  ['Veed', 'Fri', 'You: Hi Mahathi, Thank you again for sending over the campaign details — I really appreciate it! I…'],
  ['PromptArmor', 'Thu', 'You: Hi Julianne, wanted to follow up here if you were able to review?'],
  ['Granola', 'Wed', 'You: Hi Sneha, Thank you so much for clarifying everything — I really appreciate it! After reviewi…'],
  ['The Impressions Corporation', 'Wed', 'You: Hi Larine! I just wanted to send a quick update and apologize for the delay…'],
  ['Momentary', 'Wed', 'You: Hi there, Thank you so much for reaching out — I really appreciate it. I am open to creating…'],
  ['Hunch', 'Wed', 'You: Hey! Just following up in case my last message got buried. You can earn up to $200/month fixed…'],
  ['Goodie AI', 'Wed', 'You: Hi Dimitri! No worries at all, I just rescheduled our call for Friday at 10:30 AM PT…'],
  ['Blint', 'Wed', 'Hi JULIANNE, thanks for applying for the Blint creator role. We’d be happy to explore working togeth…'],
  ['Aniwell', 'Tue', 'You: The sample video will be used solely to evaluate the creator and ensure it aligns with the bran…'],
  ['Tsenta', 'Tue', 'You: Hi Agnay, Thank you again for reaching out — I really appreciate it. I went ahead and booked…'],
  ['Phobaxx', '5/26', 'You: Hi Jayson, Thank you again for the opportunity — I really appreciate it. I went ahead and com…'],
  ['Sherlock', '5/26', 'You: Hi there, Thank you again for sending everything over — I really appreciate it. I went ahead…'],
  ['MWM.ai', '5/26', 'You: Hi Alicia, Thank you again for this opportunity. I went ahead and completed and signed the ag…'],
  ['Megprime Pay', '5/26', 'You: could you please send over GC examples i cant find them in your portfolio'],
  ['Lovable', '5/26', 'You: Hi Daisy, Thank you so much for reaching out — I really appreciate it, and I’m definitely inte…'],
  ['Minee Wipes', '5/26', 'You: Hi! Sorry for the late response, I was out sick last week. I am interested, would you be able t…'],
  ['Natural Write', '5/21', 'You: To move forward, we ask all applicants to create a short test video, recreating our top-perform…'],
  ['Chance AI', '5/20', 'You: Reached out on iMessage!'],
  ['Triips.com', '5/19', 'Hey Julianne! Omar here, founder of Triips 👋 You’ve been selected to join the Triips Creator Progra…'],
  ['Wand', '5/19', 'You: yes that’s okay. Just tell him to app via the same job posting and we’ll look over.'],
  ['Astor', '5/19', 'You: Exactly correct. $5 base pay per qualifying video + $1 per 1,000 views is the payment structure…'],
  ['madduck', '5/19', 'You: Hi! Just wanted to follow up on the VILO creator program. I’m still interested and would love…'],
  ['HiveScales', '5/19', 'You: Hi! Thank you for sending everything over — I’m definitely interested, and the creator network…'],
  ['Lollapaloozalab', '5/19', 'You: Hi there, Thank you for sending over the FureverDock / Desktop Pet campaign details — I review…'],
  ['Project Bullhorn', '5/19', 'You: Hi Tommy, Thank you for reaching out — I appreciate it. I’m interested and open to learning m…'],
  ['EnterMaurs', '5/19', 'You: Hi Matej, Thank you for sending this over — I appreciate it! I’ll review the doc…'],
  ['Loopsy', '5/19', 'You: Hi Nipun, Perfect — thank you for clarifying! That all makes sense. I’ll start everything tom…'],
  ['Lotus Shop', '5/19', 'You: Hi! Thank you for sending this over — I reviewed the Vidmor brief and I’m interested in moving…'],
  ['CA Campaign', '5/15', 'You: After you’ve followed the instructions above you can sign the contract and submit your handles…'],
  ['ParakeetAI', '5/15', 'You: Hi Sofija! Thank you so much, I really appreciate it, and I’m definitely interested…'],
];

const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function resolveTs(label, now) {
  const lower = label.toLowerCase().trim();
  const d = new Date(now);
  // "4:37 PM" / "11:24 AM" → today at that time
  const tm = label.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (tm) {
    let h = parseInt(tm[1], 10) % 12;
    if (/pm/i.test(tm[3])) h += 12;
    d.setHours(h, parseInt(tm[2], 10), 0, 0);
    return d.toISOString();
  }
  if (lower === 'yesterday') {
    d.setDate(d.getDate() - 1);
    return d.toISOString();
  }
  // weekday name → most recent past occurrence (not today)
  const wi = WEEKDAYS.indexOf(lower);
  if (wi >= 0) {
    let back = (d.getDay() - wi + 7) % 7;
    if (back === 0) back = 7;
    d.setDate(d.getDate() - back);
    return d.toISOString();
  }
  // "5/26" → that month/day, current year (prior year if it'd be in the future)
  const md = label.match(/^(\d{1,2})\/(\d{1,2})$/);
  if (md) {
    const y = now.getFullYear();
    let dt = new Date(y, parseInt(md[1], 10) - 1, parseInt(md[2], 10), 12, 0, 0);
    if (dt.getTime() > now.getTime()) dt = new Date(y - 1, parseInt(md[1], 10) - 1, parseInt(md[2], 10), 12, 0, 0);
    return dt.toISOString();
  }
  return now.toISOString();
}

function hashId(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h.toString(16).padStart(8, '0');
}

const now = new Date();
const records = ROWS.map(([brand, label, preview]) => {
  const direction = preview.startsWith('You:') ? 'outbound' : 'inbound';
  return {
    id: hashId(brand),
    schema_version: 1,
    thread_id: hashId('thread:' + brand),
    brand,
    campaign_title: '',
    message_text: preview,
    last_message_preview: preview,
    ts: resolveTs(label, now),
    ts_label: label,
    direction,
    status: direction === 'outbound' ? 'awaiting-brand' : 'awaiting-julz',
    thread_url: THREAD_URL,
    polled_at: now.toISOString(),
  };
});

await fs.writeFile(
  path.join(DATA, 'sideshift-messages.jsonl'),
  records.map((r) => JSON.stringify(r)).join('\n') + '\n',
  'utf8',
);
await fs.writeFile(
  path.join(DATA, 'sideshift-messages.json'),
  JSON.stringify(records, null, 2),
  'utf8',
);
const inbound = records.filter((r) => r.direction === 'inbound').length;
console.log(
  `[sideshift-poll] ${records.length} threads written · ${inbound} awaiting your reply (inbound) · polled ${now.toISOString()}`,
);
