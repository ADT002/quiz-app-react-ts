import { useEffect, useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '~/app/hooks';
import { fetchLevels, createLevel, updateLevel, deleteLevel } from './levelSlice';
import type { Level } from './levelSlice';

export function useLevels(autoFetch = true) {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.levels.items);
  const status = useAppSelector((s) => s.levels.status);
  const error = useAppSelector((s) => s.levels.error);

  useEffect(() => {
    if (autoFetch && status === 'idle') dispatch(fetchLevels());
  }, [autoFetch, status, dispatch]);

  const create = useCallback(
    (level_name: string) => {
      if (!level_name.trim()) return Promise.reject(new Error('level_name required'));
      return dispatch(createLevel({ level_name: level_name.trim() })).unwrap();
    },
    [dispatch],
  );

  const update = useCallback(
    (_id: string, level_name: string) => dispatch(updateLevel({ _id, level_name })).unwrap(),
    [dispatch],
  );

  const remove = useCallback(
    (_id: string) => dispatch(deleteLevel(_id)).unwrap(),
    [dispatch],
  );

  const map = useMemo<Record<string, Level>>(
    () => Object.fromEntries(items.map((l) => [l._id, l])),
    [items],
  );

  return useMemo(
    () => ({
      items,
      map,
      isLoading: status === 'loading',
      isError: status === 'failed',
      error,
      create,
      update,
      remove,
    }),
    [items, map, status, error, create, update, remove],
  );
}
