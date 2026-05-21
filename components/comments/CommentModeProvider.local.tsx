'use client';

// Phase A.14j Wave 3 shim: wraps C4's canonical `CommentModeProvider` from
// `@/lib/comments/provider` + adds the optimistic-update helpers + comment
// list that C3's stub components (Wave 1b) expected on the context.
//
// API surface presented to C3 components:
//   - mode (boolean)           → C4: enabled
//   - toggleMode               → C4: toggle
//   - openCount                → derived from useComments({ status: 'open' })
//   - inProgressCount          → derived from useComments({ status: 'in_progress' })
//   - comments                 → useComments() result (server) + optimistic rows
//   - addOptimistic(draft)     → optimistic-row append before server confirm
//   - reconcile(id, server)    → swap optimistic row for server row by id
//   - refresh                  → C4: refresh + SWR mutate
//
// TODO(A.14k): rewrite C3 components to use C4's split API natively
//   (`useCommentMode` + `useComments`) and delete this shim.

import * as React from 'react';
import {
  CommentModeProvider as CanonicalProvider,
  useCommentMode as useCanonicalCommentMode,
} from '@/lib/comments/provider';
import { useComments } from '@/lib/comments/use-comments';
import type { Comment, CommentInput } from '@/lib/comments/types';

interface ShimContextValue {
  mode: boolean;
  toggleMode: () => void;
  openCount: number;
  inProgressCount: number;
  comments: Comment[];
  addOptimistic: (draft: CommentInput) => Comment;
  reconcile: (optimisticId: string, server: Comment) => void;
  refresh: () => void;
}

const ShimContext = React.createContext<ShimContextValue | null>(null);

function InnerShim({ children }: { children: React.ReactNode }) {
  const { enabled, toggle, refresh: canonicalRefresh } = useCanonicalCommentMode();
  const { comments: serverComments, mutate } = useComments();
  const [optimistic, setOptimistic] = React.useState<Comment[]>([]);

  const merged = React.useMemo<Comment[]>(() => {
    // Optimistic rows show until reconciled by server response.
    return [...serverComments, ...optimistic];
  }, [serverComments, optimistic]);

  const openCount = merged.filter(c => c.status === 'open').length;
  const inProgressCount = merged.filter(c => c.status === 'in_progress').length;

  const addOptimistic = React.useCallback((draft: CommentInput): Comment => {
    const row: Comment = {
      id: `optimistic-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      schema_version: 1,
      route: draft.route,
      x_pct: draft.x_pct,
      y_pct: draft.y_pct,
      target_selector: draft.target_selector,
      text: draft.text,
      priority: draft.priority,
      status: 'open',
      ts: new Date().toISOString(),
    };
    setOptimistic(prev => [...prev, row]);
    return row;
  }, []);

  const reconcile = React.useCallback((optimisticId: string, server: Comment) => {
    setOptimistic(prev => prev.filter(r => r.id !== optimisticId));
    void mutate();
  }, [mutate]);

  const refresh = React.useCallback(() => {
    canonicalRefresh();
    void mutate();
  }, [canonicalRefresh, mutate]);

  const value: ShimContextValue = {
    mode: enabled,
    toggleMode: toggle,
    openCount,
    inProgressCount,
    comments: merged,
    addOptimistic,
    reconcile,
    refresh,
  };

  // Reflect comment-mode state on <html> so global CSS crosshair rule applies.
  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-comment-mode', enabled ? 'on' : 'off');
  }, [enabled]);

  return <ShimContext.Provider value={value}>{children}</ShimContext.Provider>;
}

export function CommentModeProvider({ children }: { children: React.ReactNode }) {
  return (
    <CanonicalProvider>
      <InnerShim>{children}</InnerShim>
    </CanonicalProvider>
  );
}

export function useCommentMode(): ShimContextValue {
  const ctx = React.useContext(ShimContext);
  if (!ctx) {
    throw new Error('useCommentMode (shim) must be used within <CommentModeProvider>');
  }
  return ctx;
}
