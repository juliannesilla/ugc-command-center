// Phase A.14j Wave 3 shim: re-exports canonical comment types from lib/comments
// with the alias names C3's stub components (CommentModeToggle / CommentPopover
// / ExistingCommentDots) imported during Wave 1b.
//
// TODO(A.14k): rewrite C3 components to import from '@/lib/comments/types'
// directly and delete this shim.

export type { Comment as CommentRecord, CommentInput as CommentDraft, CommentPriority, CommentStatus, CommentFilters } from '@/lib/comments/types';
