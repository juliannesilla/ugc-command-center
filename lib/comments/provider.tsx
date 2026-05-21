'use client';

/**
 * React Context provider for global "comment mode" state.
 *
 * `enabled` toggles the comment overlay (C3). When true, clicks on the page
 * surface a comment composer instead of triggering normal UI behavior.
 *
 * Persists to localStorage under `ugc-cc-comment-mode` so the mode
 * survives reloads — useful while iterating on a single page.
 */

import * as React from 'react';

const STORAGE_KEY = 'ugc-cc-comment-mode';

interface CommentModeContextValue {
  enabled: boolean;
  toggle: () => void;
  setEnabled: (next: boolean) => void;
  openCount: number;
  setOpenCount: (n: number) => void;
  refresh: () => void;
  refreshTick: number;
}

const CommentModeContext = React.createContext<CommentModeContextValue | null>(null);

export function CommentModeProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabledState] = React.useState<boolean>(false);
  const [openCount, setOpenCount] = React.useState<number>(0);
  const [refreshTick, setRefreshTick] = React.useState<number>(0);

  // Hydrate from localStorage once on mount (client only).
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === '1') setEnabledState(true);
    } catch {
      // Ignore storage errors (private mode, etc.).
    }
  }, []);

  const setEnabled = React.useCallback((next: boolean) => {
    setEnabledState(next);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
      } catch {
        // Ignore.
      }
    }
  }, []);

  const toggle = React.useCallback(() => {
    setEnabled(!enabled);
  }, [enabled, setEnabled]);

  const refresh = React.useCallback(() => {
    setRefreshTick(t => t + 1);
  }, []);

  const value = React.useMemo<CommentModeContextValue>(
    () => ({ enabled, toggle, setEnabled, openCount, setOpenCount, refresh, refreshTick }),
    [enabled, toggle, setEnabled, openCount, refresh, refreshTick]
  );

  return (
    <CommentModeContext.Provider value={value}>{children}</CommentModeContext.Provider>
  );
}

export function useCommentMode(): CommentModeContextValue {
  const ctx = React.useContext(CommentModeContext);
  if (!ctx) {
    throw new Error('useCommentMode must be used within <CommentModeProvider>');
  }
  return ctx;
}
