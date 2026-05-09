import { create } from 'zustand';
import { persist, type PersistStorage } from 'zustand/middleware';
import type { StudentAnswer } from '../types';

interface ExamDraftState {
  submission_id: string | null;
  answers: Record<string, StudentAnswer>;
  hydrate: (submission_id: string, answers: StudentAnswer[]) => void;
  setAnswer: (a: StudentAnswer) => void;
  clear: () => void;
  toArray: () => StudentAnswer[];
}

/**
 * Per-submission draft cache, persisted to localStorage so that a hard reload
 * (or app crash before the next autosave fires) does not lose answers.
 *
 * Keyed by submission_id — switching exams clears via `hydrate`.
 */
export const useExamDraftStore = create<ExamDraftState>()(
  persist(
    (set, get) => ({
      submission_id: null,
      answers: {},
      hydrate: (submission_id, list) => {
        const answers: Record<string, StudentAnswer> = {};
        for (const a of list) answers[a.question_id] = a;
        set({ submission_id, answers });
      },
      setAnswer: (a) =>
        set((s) => ({ answers: { ...s.answers, [a.question_id]: a } })),
      clear: () => set({ submission_id: null, answers: {} }),
      toArray: () => Object.values(get().answers),
    }),
    {
      name: 'exam-draft',
      storage: localStorageDriver<ExamDraftState>(),
    },
  ),
);

function localStorageDriver<T>(): PersistStorage<T> {
  return {
    getItem: (name) => {
      if (typeof window === 'undefined' || !window.localStorage) return null;
      const raw = window.localStorage.getItem(name);
      return raw ? JSON.parse(raw) : null;
    },
    setItem: (name, value) => {
      if (typeof window === 'undefined' || !window.localStorage) return;
      window.localStorage.setItem(name, JSON.stringify(value));
    },
    removeItem: (name) => {
      if (typeof window === 'undefined' || !window.localStorage) return;
      window.localStorage.removeItem(name);
    },
  };
}
