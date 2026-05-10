import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { levelApi, topicApi } from '../api/questionApi';
import type { Level, Topic } from '../types';

export const taxonomyKeys = {
  topics: ['question', 'topics'] as const,
  levels: ['question', 'levels'] as const,
};

export function useTopics() {
  return useQuery({
    queryKey: taxonomyKeys.topics,
    queryFn: () => topicApi.list(),
    staleTime: 5 * 60_000,
  });
}

export function useLevels() {
  return useQuery({
    queryKey: taxonomyKeys.levels,
    queryFn: () => levelApi.list(),
    staleTime: 5 * 60_000,
  });
}

/* ── Topic mutations ──────────────────────────────────────────────────── */

export function useCreateTopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (t: Pick<Topic, 'topic_name' | 'topic_no'>) =>
      topicApi.create(t),
    onSuccess: () => qc.invalidateQueries({ queryKey: taxonomyKeys.topics }),
  });
}

export function useUpdateTopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (t: Topic) => topicApi.update(t),
    onSuccess: () => qc.invalidateQueries({ queryKey: taxonomyKeys.topics }),
  });
}

export function useDeleteTopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => topicApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: taxonomyKeys.topics }),
  });
}

export function useReorderTopics() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderedIDs: string[]) => topicApi.reorder(orderedIDs),
    /**
     * Optimistic update: rewrite cached order immediately so up/down click
     * feels instant. Roll back on error.
     */
    onMutate: async (orderedIDs) => {
      await qc.cancelQueries({ queryKey: taxonomyKeys.topics });
      const prev = qc.getQueryData<Topic[]>(taxonomyKeys.topics) ?? [];
      const byId = new Map(prev.map((t) => [t._id, t]));
      const next: Topic[] = [];
      orderedIDs.forEach((id, i) => {
        const t = byId.get(id);
        if (t) next.push({ ...t, topic_no: i + 1 });
      });
      qc.setQueryData(taxonomyKeys.topics, next);
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(taxonomyKeys.topics, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: taxonomyKeys.topics }),
  });
}

/* ── Level mutations ──────────────────────────────────────────────────── */

export function useCreateLevel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (l: Pick<Level, 'level_name'>) => levelApi.create(l),
    onSuccess: () => qc.invalidateQueries({ queryKey: taxonomyKeys.levels }),
  });
}

export function useUpdateLevel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (l: Level) => levelApi.update(l),
    onSuccess: () => qc.invalidateQueries({ queryKey: taxonomyKeys.levels }),
  });
}

export function useDeleteLevel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => levelApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: taxonomyKeys.levels }),
  });
}
