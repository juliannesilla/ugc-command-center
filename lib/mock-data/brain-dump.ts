// Mock data for Brain Dump / Hook Bank page (mockup #13).

export interface BrainStat {
  id: string;
  label: string;
  value: string;
  delta: string;
}

export const BRAIN_STATS: BrainStat[] = [
  { id: 's1', label: 'HOOKS CAPTURED THIS WEEK', value: '47', delta: '+18' },
  { id: 's2', label: 'TOP SAVED ANGLES',         value: '12', delta: '+4'  },
  { id: 's3', label: 'WINNING PATTERNS',         value: '23', delta: '+6'  },
  { id: 's4', label: 'IDEAS→SCRIPTS',            value: '9',  delta: '+3'  },
];

export interface IdeaChip {
  id: string;
  label: string;
  icon?: string; // emoji
  shuffle?: boolean;
}

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

export const BOARD_COLUMNS: BoardColumn[] = [
  { id: 'hooks',    label: 'Hook Ideas',         emoji: '🎣', count: 12 },
  { id: 'angles',   label: 'Personal Angles',    emoji: '🎤', count: 8  },
  { id: 'phrases',  label: 'Reusable Phrases',   emoji: '💬', count: 10 },
  { id: 'broll',    label: 'B-Roll Concepts',    emoji: '🎬', count: 9  },
  { id: 'prompts',  label: 'Story Prompts',      emoji: '📝', count: 7  },
  { id: 'patterns', label: 'Winning Patterns',   emoji: '🏆', count: 6  },
];

export const INITIAL_CARDS: IdeaCard[] = [
  // Hooks (4 visible)
  { id: 'h1', columnId: 'hooks',   text: 'POV: you keep forgetting to take your collagen until you see results',                isNew: true,  tag: 'POV' },
  { id: 'h2', columnId: 'hooks',   text: '3 things I wish I knew before starting my skincare routine',                          starred: true },
  { id: 'h3', columnId: 'hooks',   text: 'Wait — you\'re still doing it that way? Let me show you the easier version',         tag: 'Demo' },
  { id: 'h4', columnId: 'hooks',   text: 'The product that quietly fixed my dehydrated skin in 2 weeks',                       },

  // Angles (4 visible)
  { id: 'a1', columnId: 'angles',  text: 'Recovering perfectionist who finally accepted "good enough"',                         starred: true },
  { id: 'a2', columnId: 'angles',  text: 'Bay Area girlie who travels w/ 3 carry-ons because skincare',                          },
  { id: 'a3', columnId: 'angles',  text: 'Tired of being told to "just love yourself" — let\'s talk routines',                  isNew: true },
  { id: 'a4', columnId: 'angles',  text: 'Marketing nerd who reverse-engineers her own content',                                 },

  // Phrases (4 visible)
  { id: 'p1', columnId: 'phrases', text: '"Let me break this down for you real quick"',                                          },
  { id: 'p2', columnId: 'phrases', text: '"Game changer."',                                                                       },
  { id: 'p3', columnId: 'phrases', text: '"The messy middle is where growth happens."',                                          starred: true },
  { id: 'p4', columnId: 'phrases', text: '"Do this, not that."',                                                                  },

  // B-Roll (4 visible)
  { id: 'br1', columnId: 'broll',  text: 'Slow-pour shot of supplement into glass at golden hour',                               },
  { id: 'br2', columnId: 'broll',  text: 'Hands applying serum, close-up macro',                                                  starred: true },
  { id: 'br3', columnId: 'broll',  text: 'Walk-and-talk through SF Marina at sunset',                                            isNew: true },
  { id: 'br4', columnId: 'broll',  text: 'Time-lapse of morning routine across mirror',                                          },

  // Prompts (4 visible)
  { id: 'sp1', columnId: 'prompts', text: 'The moment I realized perfectionism was costing me clients',                          },
  { id: 'sp2', columnId: 'prompts', text: 'When I finally stopped overthinking my UGC scripts',                                  starred: true },
  { id: 'sp3', columnId: 'prompts', text: 'Why I almost quit content (and what changed)',                                        },
  { id: 'sp4', columnId: 'prompts', text: 'The brand deal that taught me to negotiate harder',                                   isNew: true },

  // Patterns (4 visible)
  { id: 'pt1', columnId: 'patterns', text: 'Hook → Story → Tip → CTA',                                                            },
  { id: 'pt2', columnId: 'patterns', text: 'Before → Process → After → Result',                                                    starred: true },
  { id: 'pt3', columnId: 'patterns', text: 'Problem → Agitate → Solution → Proof',                                                 },
  { id: 'pt4', columnId: 'patterns', text: 'Relatable Hook → Value → CTA',                                                          },
];

export interface BestNewIdea {
  id: string;
  text: string;
  chips: string[];
  capturedAgo: string;
  badge?: string;
}

export const BEST_NEW_IDEA: BestNewIdea = {
  id: 'best',
  text: 'POV: You\'re still doing it the hard way when there\'s an easier solution',
  chips: ['Hook Idea', 'POV/Relatable'],
  capturedAgo: '2h ago',
  badge: 'Most Potential',
};

export interface IdeaToScriptItem {
  id: string;
  text: string;
  chip: string;
}

export const IDEAS_TO_SCRIPTS: IdeaToScriptItem[] = [
  { id: 'is1', text: 'POV: you keep forgetting to take your collagen until you see results',  chip: 'POV' },
  { id: 'is2', text: '3 things I wish I knew before starting my skincare routine',            chip: 'List/Tips' },
  { id: 'is3', text: 'The product that quietly fixed my dehydrated skin in 2 weeks',          chip: 'Storytime' },
  { id: 'is4', text: 'Bay Area girlie who travels w/ 3 carry-ons because skincare',           chip: 'Angle' },
  { id: 'is5', text: 'Wait — you\'re still doing it that way? Easier version inside',          chip: 'Hook' },
];

export interface ReusablePattern {
  id: string;
  pattern: string;
  used: number;
}

export const REUSABLE_PATTERNS: ReusablePattern[] = [
  { id: 'rp1', pattern: 'Hook → Story → Tip → CTA',           used: 14 },
  { id: 'rp2', pattern: 'Before → Process → After → Result',  used: 11 },
  { id: 'rp3', pattern: 'Problem → Agitate → Solution → Proof', used: 9 },
  { id: 'rp4', pattern: 'Relatable Hook → Value → CTA',       used: 7 },
];

export const CONTENT_PATTERN_LIBRARY: ReusablePattern[] = [
  { id: 'cp1', pattern: 'Open w/ visual disruption · cut at 0.8s', used: 22 },
  { id: 'cp2', pattern: 'Pause + lean-in before reveal',           used: 17 },
  { id: 'cp3', pattern: 'Voiceover + on-screen text mismatch',     used: 14 },
  { id: 'cp4', pattern: 'Trail off + cut to result',                used: 10 },
];

export const REUSABLE_PHRASES = [
  '"Let me break this down for you real quick"',
  '"Game changer."',
  '"The messy middle is where growth happens."',
  '"Do this, not that."',
];

export const IDEA_TO_SCRIPT_STEPS = [
  { id: 1, label: 'Select idea from your bank' },
  { id: 2, label: 'AI structures it into a hook + flow' },
  { id: 3, label: 'Customize tone, CTAs, length' },
  { id: 4, label: 'Save to Docs or start recording' },
  { id: 5, label: 'Track performance back to the idea' },
];
