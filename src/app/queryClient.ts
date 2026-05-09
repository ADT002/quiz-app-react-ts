import { QueryClient } from '@tanstack/react-query';

/**
 * Single QueryClient for the whole app.
 * Defaults follow CLAUDE.md mục 10: staleTime 30s, no refetch-on-window-focus
 * for data that's not visibly stale (we'll override per-query when needed).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});
