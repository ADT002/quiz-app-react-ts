import { beforeEach, describe, expect, it } from 'vitest';
import { useExamDraftStore } from './examDraftStore';
import type { SingleAnswer } from '../types';

const single = (qid: string, opt: string): SingleAnswer => ({
  question_id: qid,
  type: 'single',
  selected_id: opt,
});

describe('examDraftStore', () => {
  beforeEach(() => {
    useExamDraftStore.getState().clear();
    window.localStorage.clear();
  });

  it('hydrate replaces submission_id and seeds answers', () => {
    useExamDraftStore.getState().hydrate('s1', [single('q1', 'a')]);
    const s = useExamDraftStore.getState();
    expect(s.submission_id).toBe('s1');
    expect(s.answers['q1']).toEqual(single('q1', 'a'));
  });

  it('setAnswer overwrites previous answer for same question', () => {
    useExamDraftStore.getState().setAnswer(single('q1', 'a'));
    useExamDraftStore.getState().setAnswer(single('q1', 'b'));
    expect(useExamDraftStore.getState().answers['q1']).toEqual(single('q1', 'b'));
  });

  it('toArray returns inserted answers', () => {
    useExamDraftStore.getState().setAnswer(single('q1', 'a'));
    useExamDraftStore.getState().setAnswer(single('q2', 'x'));
    const arr = useExamDraftStore.getState().toArray();
    expect(arr).toHaveLength(2);
    expect(arr.map((a) => a.question_id).sort()).toEqual(['q1', 'q2']);
  });

  it('clear resets submission_id and answers', () => {
    useExamDraftStore.getState().hydrate('s1', [single('q1', 'a')]);
    useExamDraftStore.getState().clear();
    const s = useExamDraftStore.getState();
    expect(s.submission_id).toBeNull();
    expect(s.answers).toEqual({});
  });

  it('persists to localStorage under key "exam-draft"', () => {
    useExamDraftStore.getState().hydrate('s1', [single('q1', 'a')]);
    const raw = window.localStorage.getItem('exam-draft');
    expect(raw).not.toBeNull();
    expect(raw).toContain('s1');
  });
});
