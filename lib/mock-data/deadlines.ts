// Mock deadlines seed — overdue / today / week / next-week deliverables.
// TODO(D-5 live swap): replace with Linear "UGC Pipeline" deadline pulls.
// A.14u F2: dates anchored via lib/date-anchor (slides forward at build time).

import type {
  BrandFollowup,
  Deliverable,
  FilmingDate,
  PaymentDue,
  TodoItem,
} from '@/lib/data-sync/types';
import {
  daysFromNow,
  dayShort,
  dayNum,
  monthShort,
} from '@/lib/date-anchor';

const _addDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};
const _shortLabel = (n: number) => {
  const d = _addDays(n);
  return `${monthShort(d)} ${dayNum(d)}`;
};
const _dayShort = (n: number) => dayShort(_addDays(n));
const _dayNum = (n: number) => dayNum(_addDays(n));

export const TODAY_ISO = daysFromNow(0);

export const MOCK_DELIVERABLES: Deliverable[] = [
  {
    id: 'd1',
    brand: 'Glossier',
    campaign: 'Glossier UGC Video',
    dueDate: daysFromNow(-9),
    status: 'overdue',
    type: 'video',
    brandLogo: 'G',
  },
  {
    id: 'd2',
    brand: 'Skims',
    campaign: 'Skims Try-On Haul',
    dueDate: daysFromNow(0),
    status: 'due-today',
    type: 'video',
    brandLogo: 'S',
  },
  {
    id: 'd3',
    brand: 'Yeti',
    campaign: 'Yeti Product Demo',
    dueDate: daysFromNow(0),
    status: 'due-today',
    type: 'video',
    brandLogo: 'Y',
  },
  {
    id: 'd4',
    brand: 'Brooklinen',
    campaign: 'Brooklinen Unboxing Video',
    dueDate: daysFromNow(1),
    status: 'due-tomorrow',
    type: 'video',
    brandLogo: 'B',
  },
  {
    id: 'd5',
    brand: 'Tower 28',
    campaign: 'Tower 28 Product Photos',
    dueDate: daysFromNow(1),
    status: 'due-tomorrow',
    type: 'photo',
    brandLogo: 'T',
  },
];

// Heatmap day counts for the 10-cell strip (last 10 days through today).
// Each entry: { dateISO, dayLabel, dayNum, deliverableCount, isToday }
const _heatmapOffsets = [-9, -8, -7, -6, -5, -4, -3, -2, -1, 0];
const _heatmapCounts = [1, 0, 3, 4, 5, 2, 1, 1, 3, 2];
export const HEATMAP_DAYS = _heatmapOffsets.map((n, i) => ({
  dateISO: daysFromNow(n),
  dayLabel: _dayShort(n),
  dayNum: _dayNum(n),
  count: _heatmapCounts[i],
  isToday: n === 0,
}));

export const DEADLINE_STATS = {
  overdue: 5,
  dueToday: 8,
  dueThisWeek: 24,    // current week
  dueNextWeek: 18,    // next week
  completedThisWeek: 17,
};

export const MOCK_BRAND_FOLLOWUPS: BrandFollowup[] = [
  {
    id: 'f1',
    brand: 'Glossier',
    topic: 'Final cut feedback overdue',
    lastContact: daysFromNow(-11),
    priority: 'High',
  },
  {
    id: 'f2',
    brand: 'Skims',
    topic: 'Confirm posting window',
    lastContact: daysFromNow(-4),
    priority: 'High',
  },
  {
    id: 'f3',
    brand: 'Yeti',
    topic: 'Approve script revision v2',
    lastContact: daysFromNow(-3),
    priority: 'Medium',
  },
  {
    id: 'f4',
    brand: 'Brooklinen',
    topic: 'Shipping label for product',
    lastContact: daysFromNow(-2),
    priority: 'Medium',
  },
  {
    id: 'f5',
    brand: 'Olipop',
    topic: 'New campaign brief request',
    lastContact: daysFromNow(-7),
    priority: 'Low',
  },
];

export const MOCK_FILMING_DATES: FilmingDate[] = [
  {
    id: 'fd1',
    brand: 'Brooklinen',
    campaign: 'Unboxing Video',
    date: daysFromNow(2),
    daysUntil: 2,
    location: 'Home studio',
  },
  {
    id: 'fd2',
    brand: 'Tower 28',
    campaign: 'Product Photos',
    date: daysFromNow(3),
    daysUntil: 3,
    location: 'Natural light setup',
  },
  {
    id: 'fd3',
    brand: 'Skims',
    campaign: 'Try-On Haul Pt. 2',
    date: daysFromNow(6),
    daysUntil: 6,
    location: 'Home studio',
  },
  {
    id: 'fd4',
    brand: 'Olipop',
    campaign: 'Routine Reel',
    date: daysFromNow(8),
    daysUntil: 8,
    location: 'Kitchen',
  },
  {
    id: 'fd5',
    brand: 'Magic Spoon',
    campaign: 'Morning Routine UGC',
    date: daysFromNow(11),
    daysUntil: 11,
    location: 'Home studio',
  },
];

export const MOCK_TODOS: TodoItem[] = [
  { id: 't1', label: 'Send Glossier final cut + apology note', due: 'Today',     priority: 'High'   },
  { id: 't2', label: 'Upload Skims raw footage to Dropbox',     due: 'Today',     priority: 'High'   },
  { id: 't3', label: 'Yeti script v2 revision pass',            due: 'Tomorrow',  priority: 'Medium' },
  { id: 't4', label: 'Brooklinen prep — unbox staging',         due: `${_dayShort(2)} ${_shortLabel(2)}`, priority: 'Medium' },
  { id: 't5', label: 'Olipop creative brief reply',             due: `${_dayShort(3)} ${_shortLabel(3)}`, priority: 'Low'    },
];

export const MOCK_PAYMENTS_DUE: PaymentDue[] = [
  { id: 'p1', brand: 'Skims',       amount: 4500, dueDate: daysFromNow(1),  invoiceId: 'INV-2026-052', status: 'pending' },
  { id: 'p2', brand: 'Yeti',        amount: 3200, dueDate: daysFromNow(2),  invoiceId: 'INV-2026-053', status: 'pending' },
  { id: 'p3', brand: 'Brooklinen',  amount: 2800, dueDate: daysFromNow(4),  invoiceId: 'INV-2026-054', status: 'pending' },
  { id: 'p4', brand: 'Glossier',    amount: 6000, dueDate: daysFromNow(-7), invoiceId: 'INV-2026-049', status: 'overdue' },
  { id: 'p5', brand: 'Tower 28',    amount: 1900, dueDate: daysFromNow(6),  invoiceId: 'INV-2026-055', status: 'pending' },
  { id: 'p6', brand: 'Olipop',      amount: 3500, dueDate: daysFromNow(9),  invoiceId: 'INV-2026-056', status: 'pending' },
];

// Horizontal "What's Next At A Glance" — 5 day columns × deliverables count.
const _timelineCounts = [2, 4, 3, 5, 1];
export const WHATS_NEXT_TIMELINE = [0, 1, 2, 3, 4].map((n) => ({
  dateISO: daysFromNow(n),
  label: _dayShort(n),
  shortLabel: _shortLabel(n),
  count: _timelineCounts[n],
  isToday: n === 0,
}));

export const NEXT_7_DAYS_SUMMARY = {
  total: 24,
  deliverables: 15,
  followUps: 6,
  payments: 3,
};
