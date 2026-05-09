import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { examApi } from '../api/examApi';
import type { StudentAnswer } from '../types';

export type AutosaveState = 'idle' | 'saving' | 'saved' | 'error' | 'offline';

const DEBOUNCE_MS = 2000;

/**
 * Debounced autosave for exam draft. Saves to BE Redis via PATCH /exam/draft
 * after `DEBOUNCE_MS` of inactivity since the last answer change.
 *
 * Local persistence is handled by examDraftStore (Zustand persist),
 * so a network error here does NOT lose answers — they remain in localStorage.
 */
export function useAutosave(
  submission_id: string | null,
  answers: StudentAnswer[],
) {
  const [state, setState] = useState<AutosaveState>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSerialized = useRef<string>('[]');

  const mutation = useMutation({
    mutationFn: ({
      id,
      list,
    }: {
      id: string;
      list: StudentAnswer[];
    }) => examApi.saveDraft(id, list),
    onMutate: () => setState('saving'),
    onSuccess: (data) => {
      setLastSavedAt(data.last_saved_at);
      setState('saved');
    },
    onError: () => {
      setState(navigator.onLine ? 'error' : 'offline');
    },
  });

  useEffect(() => {
    if (!submission_id) return;
    const serialized = JSON.stringify(answers);
    if (serialized === lastSerialized.current) return;
    lastSerialized.current = serialized;

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      mutation.mutate({ id: submission_id, list: answers });
    }, DEBOUNCE_MS);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission_id, answers]);

  return { state, lastSavedAt };
}
