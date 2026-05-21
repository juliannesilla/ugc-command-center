'use client';

/**
 * Client-side SWR hook for fetching `/api/comments`.
 * Polls every 30s so the overlay/inbox stay roughly in sync with the JSONL.
 *
 * `filters` is appended as query params. Pass `{ status: 'open' }` to only
 * load active comments — cheaper for the overlay than fetching all.
 */

import useSWR from 'swr';
import type { Comment, CommentFilters } from './types';

const REFRESH_MS = 30_000;

async function fetcher(url: string): Promise<{ comments: Comment[] }> {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`GET ${url} failed: ${res.status}`);
  }
  return res.json();
}

function buildUrl(filters?: CommentFilters): string {
  const base = '/api/comments';
  if (!filters) return base;
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.route) params.set('route', filters.route);
  if (filters.priority) params.set('priority', filters.priority);
  const qs = params.toString();
  return qs.length > 0 ? `${base}?${qs}` : base;
}

export function useComments(filters?: CommentFilters) {
  const url = buildUrl(filters);
  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    refreshInterval: REFRESH_MS,
    revalidateOnFocus: true,
  });

  return {
    comments: data?.comments ?? [],
    isLoading,
    error,
    mutate,
  };
}
