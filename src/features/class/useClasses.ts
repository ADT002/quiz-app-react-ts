import { useEffect, useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '~/app/hooks';
import {
  fetchClasses,
  createClass,
  saveClass,
  deleteClass,
} from './classSlice';
import type { ClassFormData } from './pages/ManageClass';

/**
 * Facade hook cho Class management.
 * Dùng split selectors để tránh re-render thừa khi field không liên quan thay đổi.
 */
export function useClasses(autoFetch = true) {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.classes.allClass);
  const status = useAppSelector((s) => s.classes.status);
  const error = useAppSelector((s) => s.classes.error);

  useEffect(() => {
    if (autoFetch && status === 'idle') {
      dispatch(fetchClasses());
    }
  }, [autoFetch, status, dispatch]);

  const refresh = useCallback(() => dispatch(fetchClasses()), [dispatch]);
  const create = useCallback(
    (values: Partial<ClassFormData>) => dispatch(createClass({ values })).unwrap(),
    [dispatch],
  );
  const update = useCallback(
    (values: Partial<ClassFormData>) => dispatch(saveClass({ values })).unwrap(),
    [dispatch],
  );
  const remove = useCallback(
    (_id: string) => dispatch(deleteClass({ _id })).unwrap(),
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
