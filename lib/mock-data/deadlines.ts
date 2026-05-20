// Mock deadlines seed — overdue / today / week / next-week deliverables.
// TODO(D-5 live swap): replace with Linear "UGC Pipeline" deadline pulls.

import type {
  BrandFollowup,
  Deliverable,
  FilmingDate,
  PaymentDue,
  TodoItem,
} from '@/lib/data-sync/types';

export const TODAY_ISO = '2026-05-19';

export const MOCK_DELIVERABLES: Deliverable[] = [
  {
    id: 'd1',
    brand: 'Glossier',
    campaign: 'Glossier UGC Video',
    dueDate: '2026-05-10',
    status: 'overdue',
    type: 'video',
    brandLogo: 'G',
  },
  {
    id: 'd2',
    brand: 'Skims',
    campaign: 'Skims Try-On Haul',
    dueDate: '2026-05-19',
    status: 'due-today',
    type: 'video',
    brandLogo: 'S',
  },
  {
    id: 'd3',
    brand: 'Yeti',
    campaign: 'Yeti Product Demo',
    dueDate: '2026-05-19',
    status: 'due-today',
    type: 'video',
    brandLogo: 'Y',
  },
  {
    id: 'd4',
    brand: 'Brooklinen',
    campaign: 'Brooklinen Unboxing Video',
    dueDate: '2026-05-20',
    status: 'due-tomorrow',
    type: 'video',
    brandLogo: 'B',
  },
  {
    id: 'd5',
    brand: 'Tower 28',
    campaign: 'Tower 28 Product Photos',
    dueDate: '2026-05-20',
    status: 'due-tomorrow',
    type: 'photo',
    brandLogo: 'T',
  },
];

// Heatmap day counts for the 10-cell strip (May 10–19, 2026).
// Each entry: { dateISO, dayLabel, dayNum, deliverableCount, isToday }
export const HEATMAP_DAYS = [
  { dateISO: '2026-05-10', dayLabel: 'Sat', dayNum: 10, count: 1, isToday: false },
  { dateISO: '2026-05-11', dayLabel: 'Sun', dayNum: 11, count: 0, isToday: false },
  { dateISO: '2026-05-12', dayLabel: 'Mon', dayNum: 12, count: 3, isToday: false },
  { dateISO: '2026-05-13', dayLabel: 'Tue', dayNum: 13, count: 4, isToday: false },
  { dateISO: '2026-05-14', dayLabel: 'Wed', dayNum: 14, count: 5, isToday: false },
  { dateISO: '2026-05-15', dayLabel: 'Thu', dayNum: 15, count: 2, isToday: false },
  { dateISO: '2026-05-16', dayLabel: 'Fri', dayNum: 16, count: 1, isToday: false },
  { dateISO: '2026-05-17', dayLabel: 'Sat', dayNum: 17, count: 1, isToday: false },
  { dateISO: '2026-05-18', dayLabel: 'Sun', dayNum: 18, count: 3, isToday: false },
  { dateISO: '2026-05-19', dayLabel: 'Mon', dayNum: 19, count: 2, isToday: true },
];

export const DEADLINE_STATS = {
  overdue: 5,
  dueToday: 8,
  dueThisWeek: 24,    // May 13–19
  dueNextWeek: 18,    // May 20–26
  completedThisWeek: 17,
};

export const MOCK_BRAND_FOLLOWUPS: BrandFollowup[] = [
  {
    id: 'f1',
    brand: 'Glossier',
    topic: 'Final cut feedback overdue',
    lastContact: '2026-05-08',
    priority: 'High',
  },
  {
    id: 'f2',
    brand: 'Skims',
    topic: 'Confirm posting window',
    lastContact: '2026-05-15',
    priority: 'High',
  },
  {
    id: 'f3',
    brand: 'Yeti',
    topic: 'Approve script revision v2',
    lastContact: '2026-05-16',
    priority: 'Medium',
  },
  {
    id: 'f4',
    brand: 'Brooklinen',
    topic: 'Shipping label for product',
    lastContact: '2026-05-17',
    priority: 'Medium',
  },
  {
    id: 'f5',
    brand: 'Olipop',
    topic: 'New campaign brief request',
    lastContact: '2026-05-12',
    priority: 'Low',
  },
];

export const MOCK_FILMING_DATES: FilmingDate[] = [
  {
    id: 'fd1',
    brand: 'Brooklinen',
    campaign: 'Unboxing Video',
    date: '2026-05-21',
    daysUntil: 2,
    location: 'Home studio',
  },
  {
    id: 'fd2',
    brand: 'Tower 28',
    campaign: 'Product Photos',
    date: '2026-05-22',
    daysUntil: 3,
    location: 'Natural light setup',
  },
  {
    id: 'fd3',
    brand: 'Skims',
    campaign: 'Try-On Haul Pt. 2',
    date: '2026-05-25',
    daysUntil: 6,
    location: 'Home studio',
  },
  {
    id: 'fd4',
    brand: 'Olipop',
    campaign: 'Routine Reel',
    date: '2026-05-27',
    daysUntil: 8,
    location: 'Kitchen',
  },
  {
    id: 'fd5',
    brand: 'Magic Spoon',
    campaign: 'Morning Routine UGC',
    date: '2026-05-30',
    daysUntil: 11,
    location: 'Home studio',
  },
];

export const MOCK_TODOS: TodoItem[] = [
  { id: 't1', label: 'Send Glossier final cut + apology note', due: 'Today',     priority: 'High'   },
  { id: 't2', label: 'Upload Skims raw footage to Dropbox',     due: 'Today',     priority: 'High'   },
  { id: 't3', label: 'Yeti script v2 revision pass',            due: 'Tomorrow',  priority: 'Medium' },
  { id: 't4', label: 'Brooklinen prep — unbox staging',         due: 'Wed May 21',priority: 'Medium' },
  { id: 't5', label: 'Olipop creative brief reply',             due: 'Fri May 22',priority: 'Low'    },
];

export const MOCK_PAYMENTS_DUE: PaymentDue[] = [
  { id: 'p1', brand: 'Skims',       amount: 4500, dueDate: '2026-05-20', invoiceId: 'INV-2026-052', status: 'pending' },
  { id: 'p2', brand: 'Yeti',        amount: 3200, dueDate: '2026-05-21', invoiceId: 'INV-2026-053', status: 'pending' },
  { id: 'p3', brand: 'Brooklinen',  amount: 2800, dueDate: '2026-05-23', invoiceId: 'INV-2026-054', status: 'pending' },
  { id: 'p4', brand: 'Glossier',    amount: 6000, dueDate: '2026-05-12', invoiceId: 'INV-2026-049', status: 'overdue' },
  { id: 'p5', brand: 'Tower 28',    amount: 1900, dueDate: '2026-05-25', invoiceId: 'INV-2026-055', status: 'pending' },
  { id: 'p6', brand: 'Olipop',      amount: 3500, dueDate: '2026-05-28', invoiceId: 'INV-2026-056', status: 'pending' },
];

// Horizontal "What's Next At A Glance" — 5 day columns × deliverables count.
export const WHATS_NEXT_TIMELINE = [
  { dateISO: '2026-05-19', label: 'Mon',  shortLabel: 'May 19', count: 2, isToday: true  },
  { dateISO: '2026-05-20', label: 'Tue',  shortLabel: 'May 20', count: 4, isToday: false },
  { dateISO: '2026-05-21', label: 'Wed',  shortLabel: 'May 21', count: 3, isToday: false },
  { dateISO: '2026-05-22', label: 'Thu',  shortLabel: 'May 22', count: 5, isToday: false },
  { dateISO: '2026-05-23', label: 'Fri',  shortLabel: 'May 23', count: 1, isToday: false },
];

export const NEXT_7_DAYS_SUMMARY = {
  total: 24,
  deliverables: 15,
  followUps: 6,
  payments: 3,
};
