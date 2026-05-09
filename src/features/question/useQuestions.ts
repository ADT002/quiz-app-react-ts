import { useEffect, useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '~/app/hooks';
import {
  fetchQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  incrementPage,
  resetQuestions,
} from './questionSlice';
import type { Question } from '~/shared/types/question';

export function useQuestions(autoFetch = true) {
  const dispatch = useAppDispatch();
  const questionsByPage = useAppSelector((s) => s.questions.questionsByPage);
  const hasMoreQuestions = useAppSelector((s) => s.questions.hasMoreQuestions);
  const statusQuestion = useAppSelector((s) => s.questions.statusQuestion);
  const errorQuestion = useAppSelector((s) => s.questions.errorQuestion);

  useEffect(() => {
    if (autoFetch) dispatch(fetchQuestions());
  }, [autoFetch, dispatch]);

  const items = useMemo<Question[]>(
    () => Object.values(questionsByPage).flat(),
    [questionsByPage],
  );

  const loadMore = useCallback(() => {
    if (!hasMoreQuestions || statusQuestion === 'loading') return;
    dispatch(incrementPage());
    dispatch(fetchQuestions());
  }, [dispatch, hasMoreQuestions, statusQuestion]);

  const refresh = useCallback(() => {
    dispatch(resetQuestions());
    dispatch(fetchQuestions());
  }, [dispatch]);

  const create = useCallback(
    (q: Question) => dispatch(createQuestion(q)).unwrap(),
    [dispatch],
  );
  const update = useCallback(
    (q: Question) => dispatch(updateQuestion(q)).unwrap(),
    [dispatch],
  );
  const remove = useCallback(
    (_id: string) => dispatch(deleteQuestion(_id)).unwrap(),
    [dispatch],
  );

  return useMemo(
    () => ({
      items,
      isLoading: statusQuestion === 'loading',
      isError: statusQuestion === 'failed',
      error: errorQuestion,
      hasMore: hasMoreQuestions,
      loadMore,
      refresh,
      create,
      update,
      remove,
    }),
    [
      items,
      statusQuestion,
      errorQuestion,
      hasMoreQuestions,
      loadMore,
      refresh,
      create,
      update,
      remove,
    ],
  );
}
