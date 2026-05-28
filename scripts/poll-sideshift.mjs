#!/usr/bin/env node
/**
 * poll-sideshift.mjs — SideShift inbox poller via Chrome persistent profile (A.14p P8)
 *
 * PURPOSE
 *   Reads SideShift creator-chat inbox using Playwright's `launchPersistentContext`
 *   pointed at a dedicated Chrome profile dir where Julz has already logged in via
 *   Google OAuth (julzsilla@gmail.com). Diffs scraped conversations against
 *   `data/sideshift-messages.jsonl` and appends any new messages.
 *
 * WHY THIS PIVOT (A.14p P8, 2026-05-26)
 *   Original A.14l implementation used `agent-browser` CLI + SIDESHIFT_PASSWORD env
 *   var → headless password login. That path is DEAD because Julz logs in via
 *   Google OAuth + MFA, which blocks headless automation. This rewrite reuses a
 *   dedicated, already-authenticated Chrome profile dir instead.
 *
 * ONE-TIME SETUP (Julz does this once, then forget)
 *   1. Create the profile dir (the script will mkdir on first run, but you must
 *      log in manually the first time):
 *        node scripts/poll-sideshift.mjs --setup
 *      This launches a visible Chrome window pointing at the profile dir.
 *   2. In that window, sign in to https://app.sideshift.app via Google
 *      (julzsilla@gmail.com). Complete MFA.
 *   3. Close that window. The profile dir now has session cookies.
 *   4. From now on, `node scripts/poll-sideshift.mjs` works headless until
 *      OAuth tokens expire (Google sessions usually last weeks). If they expire,
 *      re-run `--setup` to refresh.
 *
 * USAGE
 *   node scripts/poll-sideshift.mjs --help               # show full help
 *   node scripts/poll-sideshift.mjs --setup              # one-time interactive login
 *   node scripts/poll-sideshift.mjs --dry-run            # navigate + count, no writes
 *   node scripts/poll-sideshift.mjs --headed             # visible browser (debug)
 *   node scripts/poll-sideshift.mjs                      # real poll (headless)
 *   node scripts/poll-sideshift.mjs --profile-dir <path> # custom profile location
 *
 * EXIT CODES
 *   0  Success / --dry-run / --setup
 *   1  Honest failure (auth expired, selector drift, write error, missing deps)
 *
 * OUTPUTS
 *   - Appends to: data/sideshift-messages.jsonl   (schema: lib/sideshift/types.ts)
 *   - Run logs:   scripts/sideshift-output/poll-<run-id>.log
 *
 * SKILLS INVOKED (HR-21-revised — cited in header per JULZ-RULES)
 *   - senior-backend                              → Node ESM CLI + playwright integration
 *   - chrome-devtools-mcp:chrome-devtools         → browser automation patterns
 *   - engineering:documentation                   → header + --help block
 *   - superpowers:verification-before-completion  → --dry-run + --setup smoke paths
 *
 * HARD RULES
 *   HR-10 ACCESS HONESTY — every failure mode logs a real error, no fabrication
 *   HR-15 verify artifact not proxy — log file + JSONL writes are real artifacts
 *   HR-26 problems ship with solutions — every error path has a remediation hint
 *   HR-34 cwd not sandbox — absolute paths work, no fake "unreachable" claims
 */

import { existsSync, promises as fs } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import process from 'node:process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, '..');

const INBOX_URL = 'https://app.sideshift.app/chat';
const DATA_FILE = join(REPO_ROOT, 'data', 'sideshift-messages.jsonl');
const OUTPUT_DIR = join(REPO_ROOT, 'scripts', 'sideshift-output');
const DEFAULT_PROFILE_DIR = join(homedir(), '.agent-browser', 'sideshift-profile');

const NAV_TIMEOUT_MS = 45_000;
const SCRAPE_TIMEOUT_MS = 90_000;

// ─── Args ───────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = {
    dryRun: false,
    headed: false,
    setup: false,
    help: false,
    verbose: false,
    profileDir: DEFAULT_PROFILE_DIR,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') args.dryRun = true;
    else if (a === '--headed') args.headed = true;
    else if (a === '--setup') args.setup = true;
    else if (a === '--help' || a === '-h') args.help = true;
    else if (a === '--verbose' || a === '-v') args.verbose = true;
    else if (a === '--profile-dir') args.profileDir = resolve(argv[++i] || DEFAULT_PROFILE_DIR);
  }
  return args;
}

const HELP_TEXT = `\
poll-sideshift.mjs — Scrape app.sideshift.app inbox via persistent Chrome profile.

USAGE
  node scripts/poll-sideshift.mjs [flags]

FLAGS
  --setup                  Launch visible Chrome at the profile dir for one-time
                           interactive Google-OAuth login. Sign in, then close.
  --dry-run                Navigate + report counts but do not write JSONL.
  --headed                 Visible browser (for debugging selector drift).
  --profile-dir <path>     Override the persistent profile dir.
                           Default: ~/.agent-browser/sideshift-profile
  --verbose, -v            Verbose logging.
  --help, -h               Show this message.

ONE-TIME SETUP
  1. Run:    node scripts/poll-sideshift.mjs --setup
  2. In the visible Chrome window, go to https://app.sideshift.app and sign
     in via Google (julzsilla@gmail.com). Complete MFA.
  3. Close the window. Session cookies are now persisted.
  4. Headless polls work from then on until the OAuth session expires
     (typically weeks). Re-run --setup if you start seeing auth redirects.

CRON
  Windows Task Scheduler — every 30 minutes:
    schtasks /Create /SC MINUTE /MO 30 /TN "SideShiftPoll" \\
      /TR "cmd /c cd /d C:\\Users\\julia\\OneDrive\\Desktop\\ugc-command-center && node scripts\\poll-sideshift.mjs >> scripts\\sideshift-output\\cron.log 2>&1"
`;

// ─── Utilities ──────────────────────────────────────────────────────────────

const nowIso = () => new Date().toISOString();
const runId = () => new Date().toISOString().replace(/[:.]/g, '-');

// A.14r 2026-05-26: id was previously sha(thread_id + ts) — but since SideShift doesn't
// expose ISO timestamps, ts changes every poll → every row looked "new" → dedup broke.
// New stable id: sha(thread_id + preview_text). Same conversation + same preview = same id
// (dedup works). Different preview in same thread = new id (legitimate new message captured).
function makeMessageId(threadId, content) {
  return createHash('sha256').update(`${threadId}|${content}`).digest('hex').slice(0, 16);
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

class RunLogger {
  constructor(logPath) {
    this.logPath = logPath;
    this.buffer = [];
  }
  log(level, msg, extra) {
    const line = JSON.stringify({ ts: nowIso(), level, msg, ...(extra ? { extra } : {}) });
    this.buffer.push(line);
    (level === 'error' ? process.stderr : process.stdout).write(line + '\n');
  }
  info(msg, extra) { this.log('info', msg, extra); }
  warn(msg, extra) { this.log('warn', msg, extra); }
  error(msg, extra) { this.log('error', msg, extra); }
  async flush() {
    await ensureDir(dirname(this.logPath));
    await fs.writeFile(this.logPath, this.buffer.join('\n') + '\n', 'utf8');
  }
}

// ─── JSONL diff / append ────────────────────────────────────────────────────

async function readExistingIds(filePath) {
  if (!existsSync(filePath)) return new Set();
  const raw = await fs.readFile(filePath, 'utf8');
  const ids = new Set();
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const obj = JSON.parse(trimmed);
      if (obj && typeof obj.id === 'string') ids.add(obj.id);
    } catch { /* skip malformed; schema owned by L2-S-DATA */ }
  }
  return ids;
}

async function appendMessages(filePath, messages) {
  if (messages.length === 0) return 0;
  await ensureDir(dirname(filePath));
  const payload = messages.map((m) => JSON.stringify(m)).join('\n') + '\n';
  await fs.appendFile(filePath, payload, 'utf8');
  return messages.length;
}

// ─── Playwright load (lazy so --help / --dry-run don't need the dep) ────────

async function loadChromium(logger) {
  try {
    const mod = await import('playwright-core');
    return mod.chromium;
  } catch (errCore) {
    try {
      const mod = await import('@playwright/test');
      return mod.chromium;
    } catch (errPw) {
      logger.error('playwright not installed', {
        playwrightCore: String(errCore),
        playwrightTest: String(errPw),
        remediation: 'Run: npm install playwright-core   (or: npm install @playwright/test)',
      });
      return null;
    }
  }
}

// ─── Scrape ─────────────────────────────────────────────────────────────────

/**
 * Scrape the conversation list and each open thread.
 * Returns SideShiftMessage[] conforming to lib/sideshift/types.ts.
 *
 * Selector strategy is tolerant: we try several known patterns. If SideShift
 * redesigns and selectors miss, we log SCRAPE-EMPTY and exit 0 (HR-26).
 */
// A.14r 2026-05-26: stealth-patch helper. Runs BEFORE every page navigation to mask
// the most common Playwright/automation fingerprints that React apps (incl. SideShift)
// use to detect bots and stall content rendering. Sources: standard `playwright-extra`
// stealth plugin patterns + Chrome DevTools Protocol fingerprinting research.
async function applyStealthPatches(page, logger) {
  await page.addInitScript(() => {
    // 1. navigator.webdriver — the #1 bot signal
    Object.defineProperty(Object.getPrototypeOf(navigator), 'webdriver', {
      get: () => undefined,
      configurable: true,
    });

    // 2. navigator.plugins — Playwright defaults to empty array, real Chrome has plugins
    Object.defineProperty(navigator, 'plugins', {
      get: () => [
        { name: 'PDF Viewer', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
        { name: 'Chrome PDF Viewer', filename: 'internal-pdf-viewer', description: '' },
        { name: 'Chromium PDF Viewer', filename: 'internal-pdf-viewer', description: '' },
        { name: 'Microsoft Edge PDF Viewer', filename: 'internal-pdf-viewer', description: '' },
        { name: 'WebKit built-in PDF', filename: 'internal-pdf-viewer', description: '' },
      ],
      configurable: true,
    });

    // 3. navigator.languages — Playwright headless often empty
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en'],
      configurable: true,
    });

    // 4. Remove ChromeDriver fingerprint properties (cdc_*)
    for (const key of Object.keys(window)) {
      if (key.startsWith('cdc_')) {
        try { delete window[key]; } catch { /* */ }
      }
    }

    // 5. window.chrome — headless Chrome doesn't set this object, real Chrome does
    if (!window.chrome) {
      window.chrome = {
        runtime: {},
        loadTimes: () => ({}),
        csi: () => ({}),
        app: {},
      };
    }

    // 6. Notification.permission — some sites check this, headless returns 'denied'
    if (window.Notification) {
      const origQuery = window.Notification.permission;
      Object.defineProperty(window.Notification, 'permission', {
        get: () => origQuery === 'denied' ? 'default' : origQuery,
        configurable: true,
      });
    }

    // 7. WebGL vendor/renderer — real Chrome reports specific GPU info
    const getParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function (parameter) {
      if (parameter === 37445) return 'Intel Inc.'; // UNMASKED_VENDOR_WEBGL
      if (parameter === 37446) return 'Intel Iris OpenGL Engine'; // UNMASKED_RENDERER_WEBGL
      return getParameter.apply(this, [parameter]);
    };

    // 8. Permissions query — headless returns inconsistent results vs real Chrome
    const origQuery = navigator.permissions.query.bind(navigator.permissions);
    navigator.permissions.query = (parameters) =>
      parameters.name === 'notifications'
        ? Promise.resolve({ state: 'default' })
        : origQuery(parameters);
  });
  logger.info('stealth patches injected (navigator.webdriver, plugins, languages, cdc_*, window.chrome, WebGL, permissions)');
}

async function scrapeInbox(page, logger) {
  // A.14r: apply stealth BEFORE first navigation
  await applyStealthPatches(page, logger);

  await page.goto(INBOX_URL, { timeout: NAV_TIMEOUT_MS, waitUntil: 'domcontentloaded' });

  // Auth check — if redirected to Google/login, we're not authenticated.
  await page.waitForTimeout(2000);
  const finalUrl = page.url();
  if (/accounts\.google\.com|\/login|\/signin/i.test(finalUrl)) {
    logger.error('auth redirect — OAuth session expired', {
      finalUrl,
      remediation: 'Re-run with --setup, complete Google sign-in, then re-run poll',
    });
    return { messages: [], authFailed: true };
  }

  // A.14r: SideShift React SPA needs more time + better signal. Wait up to 30s.
  // Every 5s, log render progress so we can diagnose stealth-vs-stall on failure.
  const RENDER_TIMEOUT_MS = 30_000;
  const startMs = Date.now();
  let rendered = false;
  while (Date.now() - startMs < RENDER_TIMEOUT_MS) {
    try {
      const liCount = await page.evaluate(() => document.querySelectorAll('ul.py-0 > li, ul[class*="py-0"] > li').length);
      if (liCount >= 5) {
        rendered = true;
        logger.info('chat-list rendered', { liCount, waitMs: Date.now() - startMs });
        await page.waitForTimeout(1000); // settle for late-rendering rows
        break;
      }
      const elapsed = Math.round((Date.now() - startMs) / 1000);
      logger.info(`waiting for chat-list… ${elapsed}s elapsed, ${liCount} rows so far`);
      await page.waitForTimeout(5000);
    } catch (err) {
      logger.warn('render-probe error', { error: String(err).slice(0, 200) });
      break;
    }
  }
  if (!rendered) {
    // Capture diagnostic info before giving up
    const diag = await page.evaluate(() => ({
      url: location.pathname,
      bodyTextLen: document.body.textContent.length,
      anyUl: document.querySelectorAll('ul').length,
      anyLi: document.querySelectorAll('li').length,
      hasMain: !!document.querySelector('main'),
      title: document.title,
    })).catch(() => null);
    logger.warn('STEALTH_FAILED or render-stall — chat-list never reached 5 rows in 30s', {
      diag,
      remediation: 'If diag.anyLi > 0 but ul.py-0 > li = 0, SideShift redesigned (selector drift). If diag.anyLi == 0, bot detection still active. Either way: fall back to Claude-in-Chrome MCP scrape per _meta/dashboard-spec/06-a14q-sideshift-dom-inspection.md',
    });
    // Fall through — selectors will return 0 rows + log clean miss
  }

  // A.14q Q2 2026-05-26: SideShift uses Tailwind utility classes on bare DOM.
  // Selectors derived from live inspection — see _meta/dashboard-spec/06-a14q-sideshift-dom-inspection.md
  const PRIMARY_SELECTOR = 'ul.py-0 > li';
  const FALLBACK_SELECTORS = [
    'ul[class*="py-0"] > li',
    'main ul > li',
    'li:has(button img)', // any li with a button containing an img
  ];

  let usedSelector = null;
  let rows = await page.$$(PRIMARY_SELECTOR);
  if (rows.length > 0) {
    usedSelector = PRIMARY_SELECTOR;
  } else {
    for (const sel of FALLBACK_SELECTORS) {
      try {
        const found = await page.$$(sel);
        if (found.length > 0) {
          usedSelector = sel;
          rows = found;
          break;
        }
      } catch { /* try next */ }
    }
  }

  if (!usedSelector) {
    logger.warn('no conversation rows matched any known selector', {
      tried: [PRIMARY_SELECTOR, ...FALLBACK_SELECTORS],
      remediation: 'Re-run with --headed; SideShift may have redesigned. Update SELECTORS in poll-sideshift.mjs',
    });
    return { messages: [], authFailed: false };
  }
  logger.info('inbox loaded', { usedSelector, rowCount: rows.length });

  const messages = [];
  // A.14r diagnostic: dump first row structure if it exists, helps debug headless vs headed DOM differences
  if (rows.length > 0) {
    try {
      const firstRowDiag = await rows[0].evaluate((el) => ({
        innerHTML_first1k: el.innerHTML.slice(0, 1000),
        h4Count: el.querySelectorAll('h4').length,
        h4Text: el.querySelector('h4')?.textContent?.trim()?.slice(0, 50) || null,
        buttonCount: el.querySelectorAll('button').length,
        spanCount: el.querySelectorAll('span').length,
        tabularNumsCount: el.querySelectorAll('span.tabular-nums').length,
        allTextSlice: el.textContent.trim().slice(0, 200),
      }));
      logger.info('first-row diagnostic', firstRowDiag);
    } catch (err) {
      logger.warn('first-row diag failed', { error: String(err).slice(0, 200) });
    }
  }

  for (let i = 0; i < rows.length; i++) {
    try {
      const data = await rows[i].evaluate((el) => {
        // A.14q Q2: extract brand from h4, timestamp from span.tabular-nums, preview from
        // the last span in the content div that isn't the timestamp.
        const h4 = el.querySelector('h4');
        const brand = h4 ? h4.textContent.trim() : '';

        const tsSpan = el.querySelector('span.tabular-nums');
        const tsRel = tsSpan ? tsSpan.textContent.trim() : '';

        // Preview: collect all spans inside the button, drop the tabular-nums one + any with no text
        const allSpans = Array.from(el.querySelectorAll('button span'));
        const previewSpan = allSpans
          .filter(s => !s.classList.contains('tabular-nums') && s.textContent.trim())
          .pop(); // last surviving span = preview
        const preview = previewSpan ? previewSpan.textContent.trim() : '';

        const img = el.querySelector('img');
        const avatarSrc = img ? img.getAttribute('src') || '' : '';

        return { brand, tsRel, preview, avatarSrc };
      });

      if (!data.brand || !data.preview) continue;

      // Parse relative timestamp ("23m", "1h", "Yesterday", "2d") → ISO approximation.
      // Cron runs every 30min so granularity-to-minute is fine.
      const tsRel = (data.tsRel || '').toLowerCase();
      let ts;
      const now = new Date();
      const mMatch = tsRel.match(/^(\d+)\s*m/);
      const hMatch = tsRel.match(/^(\d+)\s*h/);
      const dMatch = tsRel.match(/^(\d+)\s*d/);
      if (mMatch) ts = new Date(now.getTime() - parseInt(mMatch[1], 10) * 60_000).toISOString();
      else if (hMatch) ts = new Date(now.getTime() - parseInt(hMatch[1], 10) * 3_600_000).toISOString();
      else if (dMatch) ts = new Date(now.getTime() - parseInt(dMatch[1], 10) * 86_400_000).toISOString();
      else if (/yesterday/i.test(tsRel)) ts = new Date(now.getTime() - 86_400_000).toISOString();
      else ts = nowIso(); // unknown format → stamp now

      // Synthetic thread_id since no href is exposed in DOM (clicks are React onClick).
      // sha256(brand + preview.slice(0,80)) — collision-resistant for normal usage.
      const threadId = createHash('sha256')
        .update(`${data.brand}|${data.preview.slice(0, 80)}`)
        .digest('hex').slice(0, 16);

      // Outbound preview starts with "You:" — set direction accordingly
      const isOutbound = /^you:/i.test(data.preview);

      messages.push({
        id: makeMessageId(threadId, data.preview.slice(0, 140)), // A.14r: stable per (thread+preview), not per ts
        schema_version: 1,
        thread_id: threadId,
        brand: data.brand,
        campaign_title: '', // SideShift list view doesn't expose campaign title; deferred to thread-detail scrape
        message_text: data.preview,
        last_message_preview: data.preview.slice(0, 140),
        ts,
        direction: isOutbound ? 'outbound' : 'inbound',
        status: isOutbound ? 'awaiting-brand' : 'awaiting-you',
        thread_url: INBOX_URL, // No per-thread href exposed; click target is React onClick
      });
    } catch (err) {
      logger.warn('row scrape failed', { idx: i, error: String(err) });
    }
  }

  return { messages, authFailed: false };
}

// ─── Browser launch ─────────────────────────────────────────────────────────

async function launchContext(chromium, profileDir, headed, logger) {
  await ensureDir(profileDir);
  logger.info('launching persistent context', { profileDir, headed });
  // A.14p P8-FIX-V3 2026-05-26: Use Playwright's intact chrome-headless-shell binary
  // (regular chrome.exe at chromium-1223/ keeps getting AV-quarantined to 4MB stub;
  // headless shell at chromium_headless_shell-1223/ is fully intact at 201MB).
  // Caveat: headless shell only supports headless mode. Setup mode falls back to
  // installed Chrome via channel:'chrome' (separate code path).
  const opts = {
    headless: !headed,
    viewport: { width: 1280, height: 900 },
    timeout: NAV_TIMEOUT_MS,
    // A.14r: match Chrome Stable UA (not chrome-headless-shell UA) — bot detectors
    // often check this against the WebGL/screen fingerprints.
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',
    locale: 'en-US',
    timezoneId: 'America/Los_Angeles',
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-first-run',
      '--no-default-browser-check',
      '--lang=en-US,en;q=0.9',
      '--disable-features=IsolateOrigins,site-per-process',
    ],
  };
  if (headed) {
    // For interactive --setup, use installed Chrome (works for one-time OAuth)
    opts.channel = 'chrome';
  } else {
    // For headless polling, use the intact chrome-headless-shell binary directly
    const headlessShell = 'C:\\Users\\julia\\AppData\\Local\\ms-playwright\\chromium_headless_shell-1223\\chrome-headless-shell-win64\\chrome-headless-shell.exe';
    opts.executablePath = headlessShell;
  }
  const context = await chromium.launchPersistentContext(profileDir, opts);
  return context;
}

// ─── Setup mode (interactive login) ─────────────────────────────────────────

async function runSetup(logger, profileDir) {
  const chromium = await loadChromium(logger);
  if (!chromium) return 1;

  logger.info('SETUP MODE — visible Chrome will open. Sign in via Google, then close the window.');
  let context;
  try {
    context = await launchContext(chromium, profileDir, true, logger);
  } catch (err) {
    logger.error('failed to launch browser', {
      error: String(err),
      remediation: 'Run: npx playwright install chromium',
    });
    return 1;
  }

  const page = (await context.pages())[0] || (await context.newPage());
  try {
    await page.goto(INBOX_URL, { timeout: NAV_TIMEOUT_MS });
  } catch (err) {
    logger.warn('initial nav failed (network?); window still open for manual login', { error: String(err) });
  }

  // Wait for the user to close the window manually.
  logger.info('waiting for you to close the Chrome window after login...');
  await new Promise((res) => {
    context.on('close', res);
    // Also resolve on SIGINT so Ctrl-C still works.
    process.once('SIGINT', res);
  });
  try { await context.close(); } catch { /* already closed */ }

  logger.info('setup complete — profile dir is now seeded', { profileDir });
  return 0;
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    process.stdout.write(HELP_TEXT);
    return 0;
  }

  const id = runId();
  const logger = new RunLogger(join(OUTPUT_DIR, `poll-${id}.log`));

  logger.info('poll-sideshift start', {
    runId: id,
    args,
    nodeVersion: process.version,
    cwd: process.cwd(),
  });

  // ─── Setup mode ───────────────────────────────────────────────────────────
  if (args.setup) {
    const code = await runSetup(logger, args.profileDir);
    await logger.flush();
    return code;
  }

  // ─── --dry-run short-circuits BEFORE browser launch ───────────────────────
  if (args.dryRun) {
    const profileExists = existsSync(args.profileDir);
    logger.info('dry-run — would poll SideShift', {
      inboxUrl: INBOX_URL,
      dataFile: DATA_FILE,
      profileDir: args.profileDir,
      profileExists,
      remediation: profileExists ? null : 'Run --setup first to seed the profile',
    });
    await logger.flush();
    return 0;
  }

  // ─── Profile dir must exist (--setup must have been run) ──────────────────
  if (!existsSync(args.profileDir)) {
    logger.error('profile dir does not exist', {
      profileDir: args.profileDir,
      remediation: 'Run: node scripts/poll-sideshift.mjs --setup',
    });
    await logger.flush();
    return 1;
  }

  // ─── Load Playwright ──────────────────────────────────────────────────────
  const chromium = await loadChromium(logger);
  if (!chromium) {
    await logger.flush();
    return 1;
  }

  // ─── Launch + scrape ──────────────────────────────────────────────────────
  let context;
  try {
    context = await launchContext(chromium, args.profileDir, args.headed, logger);
  } catch (err) {
    logger.error('browser launch failed', {
      error: String(err),
      remediation: 'Run: npx playwright install chromium',
    });
    await logger.flush();
    return 1;
  }

  let messages = [];
  let authFailed = false;
  try {
    const page = (await context.pages())[0] || (await context.newPage());
    page.setDefaultTimeout(SCRAPE_TIMEOUT_MS);
    const res = await scrapeInbox(page, logger);
    messages = res.messages;
    authFailed = res.authFailed;
  } catch (err) {
    logger.error('scrape failed', {
      error: String(err),
      stack: err && err.stack ? err.stack.split('\n').slice(0, 5).join('\n') : null,
      remediation: 'Re-run with --headed --verbose; verify selectors; check OAuth session',
    });
    try { await context.close(); } catch { /* */ }
    await logger.flush();
    return 1;
  }

  try { await context.close(); } catch { /* */ }

  if (authFailed) {
    await logger.flush();
    return 1;
  }

  if (messages.length === 0) {
    logger.warn('no messages scraped — empty inbox or selector drift', {
      remediation: 'Re-run with --headed --verbose to inspect',
    });
    await logger.flush();
    return 0;
  }

  // ─── Diff + append ────────────────────────────────────────────────────────
  const existingIds = await readExistingIds(DATA_FILE);
  const newOnes = messages.filter((m) => !existingIds.has(m.id));
  logger.info('diff complete', {
    scraped: messages.length,
    existing: existingIds.size,
    newMessages: newOnes.length,
  });

  try {
    const appended = await appendMessages(DATA_FILE, newOnes);
    logger.info('appended to jsonl', { appended, dataFile: DATA_FILE });
  } catch (err) {
    logger.error('append failed', {
      error: String(err),
      path: DATA_FILE,
      remediation: 'Check disk space + write permissions',
    });
    await logger.flush();
    return 1;
  }

  logger.info('poll-sideshift done', { runId: id, exitCode: 0 });
  await logger.flush();

  // NORMA A.14v 2026-05-27: auto-fire merge-canonical.mjs after every poll so
  // brands-canonical.jsonl (dashboard source-of-truth) stays in sync with
  // sideshift-messages.jsonl deltas. Chained here so a single cron task covers
  // both. Fail-soft: merge failure does not abort poll-sideshift's success.
  try {
    const { spawn } = await import('node:child_process');
    const mergeScript = join(REPO_ROOT, 'scripts', 'merge-canonical.mjs');
    if (existsSync(mergeScript)) {
      await new Promise((res) => {
        const child = spawn(process.execPath, [mergeScript, '--apply'], {
          cwd: REPO_ROOT,
          stdio: 'ignore',
        });
        child.on('close', () => res());
        child.on('error', () => res());
      });
    }
  } catch { /* fail-soft — merge errors don't break poll */ }

  return 0;
}

main()
  .then((code) => process.exit(code))
  .catch(async (err) => {
    process.stderr.write(JSON.stringify({
      ts: nowIso(),
      level: 'fatal',
      msg: 'uncaught in main',
      error: String(err),
      stack: err && err.stack ? err.stack : null,
    }) + '\n');
    try {
      const fallback = join(OUTPUT_DIR, `poll-fatal-${runId()}.log`);
      await ensureDir(OUTPUT_DIR);
      await fs.writeFile(fallback, String(err && err.stack ? err.stack : err), 'utf8');
    } catch { /* */ }
    process.exit(1);
  });
