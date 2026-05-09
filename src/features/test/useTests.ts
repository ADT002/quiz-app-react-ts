import { useEffect, useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '~/app/hooks';
import {
  fetchTestTemplates,
  fetchTestOfClass,
  createTest,
  saveTest,
  deleteTest,
  createTestOfClass,
  saveTestOfClass,
  deleteTestOfClass,
  resetTest,
  clearTestOfClass,
  CreateTestOfClassPayload,
} from './testSlice';
import type { TestFormData } from './pages/ManageTestModal';

export function useTestTemplates(autoFetch = true) {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.tests.allTestTemplates);
  const status = useAppSelector((s) => s.tests.status);
  const error = useAppSelector((s) => s.tests.error);

  useEffect(() => {
    if (autoFetch) dispatch(fetchTestTemplates());
  }, [autoFetch, dispatch]);

  const refresh = useCallback(() => dispatch(fetchTestTemplates()), [dispatch]);
  const create = useCallback(
    (values: TestFormData) => dispatch(createTest({ values })).unwrap(),
    [dispatch],
  );
  const update = useCallback(
    (values: TestFormData) => dispatch(saveTest({ values })).unwrap(),
    [dispatch],
  );
  const remove = useCallback(
    (_id: string) => dispatch(deleteTest({ _id })).unwrap(),
    [dispatch],
  );

  return useMemo(
    () => ({
      items,
      isLoading: status === 'loading',
      isError: status === 'failed',
      error,
      refresh,
      create,
      update,
      remove,
    }),
    [items, status, error, refresh, create, update, remove],
  );
}

export function useTestsOfClass(class_id?: string, autoFetch = true) {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.tests.allTestOfClass);
  const status = useAppSelector((s) => s.tests.status);
  const error = useAppSelector((s) => s.tests.error);

  useEffect(() => {
    dispatch(clearTestOfClass());
    if (autoFetch && class_id) {
      dispatch(fetchTestOfClass({ class_id }));
    }
  }, [autoFetch, class_id, dispatch]);

  const refresh = useCallback(() => {
    if (class_id) dispatch(fetchTestOfClass({ class_id }));
  }, [class_id, dispatch]);

  const create = useCallback(
    (values: CreateTestOfClassPayload) => dispatch(createTestOfClass({ values })).unwrap(),
    [dispatch],
  );
  const update = useCallback(
    (values: CreateTestOfClassPayload) => dispatch(saveTestOfClass({ values })).unwrap(),
    [dispatch],
  );
  const remove = useCallback(
    (_id: string) => dispatch(deleteTestOfClass({ _id })).unwrap(),
    [dispatch],
  );
  const reset = useCallback(
    (test_id: string) => {
      if (!class_id) return Promise.reject(new Error('class_id missing'));
      return dispatch(resetTest({ values: { class_id, test_id } })).unwrap();
    },
    [class_id, dispatch],
  );

  return useMemo(
    () => ({
      items,
      isLoading: status === 'loading',
      isError: status === 'failed',
      error,
      refresh,
      create,
      update,
      remove,
      reset,
    }),
    [items, status, error, refresh, create, update, remove, reset],
  );
}
