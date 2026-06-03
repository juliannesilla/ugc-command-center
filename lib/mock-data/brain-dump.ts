// Brain Dump / Hook Bank — capture-tool data layer.
//
// 2026-06-03 HR-49 NO MOCK DATA + HR-10 ACCESS HONESTY (Julz: "NO MOCK DATA
// ANYMORE"): this module was previously a fabricated mockup dataset — fake
// "47 hooks captured this week", invented skincare/collagen hook texts Julz
// never wrote, "captured 2h ago", and "used 14×" pattern-usage counts that
// implied tracked activity that never happened.
//
// The Hook Bank has NO persisted capture store yet (QuickCapture is not wired
// to a backend), so the HONEST state is empty. Every "your activity" array
// below is emitted empty; the page + components render genuine empty states
// ("nothing captured yet") instead of fabricated samples. Drag-and-drop and
// capture still work — the board fills as Julz actually captures ideas.
//
// KEPT (pure UI scaffolding, not fabricated data):
//   - SMART_CHIPS         → idea-type filter buttons (Pain Point Hook, POV, …)
//   - BOARD_COLUMNS       → column labels/emojis (counts now derive from real cards)
//   - IDEA_TO_SCRIPT_STEPS→ the "how the converter works" explainer steps

export interface BrainStat {
  id: string;
  label: string;
  value: string;
  delta: string;
}

// Honest-empty: no capture store yet, so no real stats to show.
export const BRAIN_STATS: BrainStat[] = [];

export interface IdeaChip {
  id: string;
  label: string;
  icon?: string; // emoji
  shuffle?: boolean;
}

// UI scaffolding — idea-type quick-filters, not fabricated data.
export const SMART_CHIPS: IdeaChip[] = [
  { id: 'pain',      label: 'Pain Point Hook',   icon: '🎯' },
  { id: 'beforeaft', label: 'Before/After',      icon: '🔄' },
  { id: 'pov',       label: 'POV/Relatable',     icon: '👀' },
  { id: 'myth',      label: 'Myth Busting',      icon: '💥' },
  { id: 'story',     label: 'Story Starter',     icon: '📖' },
  { id: 'demo',      label: 'Product Demo',      icon: '🧪' },
  { id: 'transform', label: 'Transformation',    icon: '✨' },
  { id: 'shuffle',   label: 'Shuffle',           icon: '🎲', shuffle: true },
];

export type ColumnId =
  | 'hooks'
  | 'angles'
  | 'phrases'
  | 'broll'
  | 'prompts'
  | 'patterns';

export interface IdeaCard {
  id: string;
  columnId: ColumnId;
  text: string;
  isNew?: boolean;
  starred?: boolean;
  tag?: string; // optional pill on card
}

export interface BoardColumn {
  id: ColumnId;
  label: string;
  emoji: string;
  count: number;
}

// Column scaffolding. `count` is a fallback only — the board derives live counts
// from the real card distribution (0 until Julz captures ideas).
export const BOARD_COLUMNS: BoardColumn[] = [
  { id: 'hooks',    label: 'Hook Ideas',         emoji: '🎣', count: 0 },
  { id: 'angles',   label: 'Personal Stories',   emoji: '🎤', count: 0 },
  { id: 'phrases',  label: 'Reusable Phrases',   emoji: '💬', count: 0 },
  { id: 'broll',    label: 'B-Roll Ideas',       emoji: '🎬', count: 0 },
  { id: 'prompts',  label: 'Story Patterns',     emoji: '📝', count: 0 },
  { id: 'patterns', label: 'Winning Patterns',   emoji: '🏆', count: 0 },
];

// Honest-empty: the board starts empty and fills as ideas are captured.
export const INITIAL_CARDS: IdeaCard[] = [];

export interface BestNewIdea {
  id: string;
  text: string;
  chips: string[];
  capturedAgo: string;
  badge?: string;
}

// Honest-empty: no captured ideas yet → no "best" idea to surface.
export const BEST_NEW_IDEA: BestNewIdea | null = null;

export interface IdeaToScriptItem {
  id: string;
  text: string;
  chip: string;
}

// Honest-empty: populated from real captured ideas once they exist.
export const IDEAS_TO_SCRIPTS: IdeaToScriptItem[] = [];

export interface ReusablePattern {
  id: string;
  pattern: string;
  used: number;
}

// Honest-empty: usage counts require real tracked activity (none yet).
export const REUSABLE_PATTERNS: ReusablePattern[] = [];

// Honest-empty: same — no fabricated "× used" counts.
export const CONTENT_PATTERN_LIBRARY: ReusablePattern[] = [];

// Honest-empty: phrases vault fills from Julz's own saved phrases.
export const REUSABLE_PHRASES: string[] = [];

// UI scaffolding — explains how the Idea→Script converter works. Not data.
export const IDEA_TO_SCRIPT_STEPS = [
  { id: 1, label: 'Select idea from your bank' },
  { id: 2, label: 'AI structures it into a hook + flow' },
  { id: 3, label: 'Customize tone, CTAs, length' },
  { id: 4, label: 'Save to Docs or start recording' },
  { id: 5, label: 'Track performance back to the idea' },
];
