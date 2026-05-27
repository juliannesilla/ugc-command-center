// A.14u F2 — single source of truth for "today" across dashboard.
// Static export means this evaluates at BUILD time (cron rebuilds daily).
// For per-request dynamic use 'use client' + useEffect.

export const now = () => new Date();
export const today = () => new Date();

export const dayLong = (d: Date = new Date()) =>
  d.toLocaleDateString("en-US", { weekday: "long" });
export const dayShort = (d: Date = new Date()) =>
  d.toLocaleDateString("en-US", { weekday: "short" });
export const monthLong = (d: Date = new Date()) =>
  d.toLocaleDateString("en-US", { month: "long" });
export const monthShort = (d: Date = new Date()) =>
  d.toLocaleDateString("en-US", { month: "short" });
export const dayNum = (d: Date = new Date()) => d.getDate();

// "Wednesday · May 27 · Creator Campaign HQ"
export const pageEyebrow = (d: Date = new Date()) =>
  `${dayLong(d)} · ${monthLong(d)} ${dayNum(d)} · Creator Campaign HQ`;

// "Today's pulse · Wed May 27"
export const pulseEyebrow = (d: Date = new Date()) =>
  `Today's pulse · ${dayShort(d)} ${monthShort(d)} ${dayNum(d)}`;

// "May 27 – Jun 2" (current week range, Mon–Sun)
export const thisWeekRange = (d: Date = new Date()) => {
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (x: Date) => `${monthShort(x)} ${dayNum(x)}`;
  return `${fmt(monday)} – ${fmt(sunday)}`;
};

// Add N days from today, return ISO date "YYYY-MM-DD"
export const daysFromNow = (n: number, d: Date = new Date()) => {
  const r = new Date(d);
  r.setDate(d.getDate() + n);
  return r.toISOString().slice(0, 10);
};

// "X days ago" / "X hours ago" — for refreshed-ticker labels
export const relativeAgo = (then: Date | string, ref: Date = new Date()) => {
  const t = typeof then === "string" ? new Date(then) : then;
  const ms = ref.getTime() - t.getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "yesterday";
  return `${days} days ago`;
};
