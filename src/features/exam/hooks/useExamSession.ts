import { useMutation, useQuery } from '@tanstack/react-query';
import { examApi } from '../api/examApi';

export const examKeys = {
  all: ['exam'] as const,
  resume: (submission_id: string) =>
    [...examKeys.all, 'resume', submission_id] as const,
};

/** Start (or re-enter) an exam session. */
export function useStartExam() {
  return useMutation({
    mutationFn: (test_of_class_id: string) => examApi.start(test_of_class_id),
  });
}

/** Resume an in-progress submission (loads draft from server). */
export function useResumeExam(submission_id: string | null) {
  return useQuery({
    queryKey: examKeys.resume(submission_id ?? ''),
    queryFn: () => examApi.resume(submission_id!),
    enabled: !!submission_id,
    staleTime: Infinity,
  });
}

export function useSubmitExam() {
  return useMutation({
    mutationFn: (input: {
      submission_id: string;
      answers: Parameters<typeof examApi.submit>[1];
    }) => examApi.submit(input.submission_id, input.answers),
  });
}
