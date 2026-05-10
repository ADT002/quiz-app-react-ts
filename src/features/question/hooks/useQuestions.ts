import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { questionApi } from '../api/questionApi';
import type { Question, QuestionFilters } from '../types';

export const questionKeys = {
  all: ['questions'] as const,
  list: (f: QuestionFilters) => [...questionKeys.all, 'list', f] as const,
};

export function useQuestions(filters: QuestionFilters = {}) {
  return useQuery({
    queryKey: questionKeys.list(filters),
    queryFn: () => questionApi.list(filters),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

export function useCreateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (q: Question) => questionApi.create(q),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: questionKeys.all });
    },
  });
}

export function useUpdateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (q: Question) => questionApi.update(q),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: questionKeys.all });
    },
  });
}

export function useDeleteQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => questionApi.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: questionKeys.all });
    },
  });
}
