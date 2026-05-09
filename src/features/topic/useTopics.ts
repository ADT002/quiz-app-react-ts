import { useEffect, useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '~/app/hooks';
import {
  fetchTopics,
  createTopic,
  updateTopic,
  deleteTopic,
  reorderTopics,
  moveTopicLocal,
} from './topicSlice';
import type { Topic } from './topicSlice';

export function useTopics(autoFetch = true) {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.topics.items);
  const status = useAppSelector((s) => s.topics.status);
  const error = useAppSelector((s) => s.topics.error);

  useEffect(() => {
    if (autoFetch && status === 'idle') dispatch(fetchTopics());
  }, [autoFetch, status, dispatch]);

  const create = useCallback(
    (topic_name: string) => {
      if (!topic_name.trim()) return Promise.reject(new Error('topic_name required'));
      return dispatch(
        createTopic({ topic_name: topic_name.trim(), topic_no: items.length + 1 }),
      ).unwrap();
    },
    [dispatch, items.length],
  );

  const update = useCallback(
    (id: string, topic_name: string) =>
      dispatch(updateTopic({ _id: id, topic_name })).unwrap(),
    [dispatch],
  );

  const remove = useCallback(
    (id: string) => dispatch(deleteTopic(id)).unwrap(),
    [dispatch],
  );

  const move = useCallback(
    (index: number, direction: 'up' | 'down') => {
      const to = direction === 'up' ? index - 1 : index + 1;
      dispatch(moveTopicLocal({ from: index, to }));
    },
    [dispatch],
  );

  const saveOrder = useCallback(() => dispatch(reorderTopics(items)).unwrap(), [dispatch, items]);

  const map = useMemo<Record<string, Topic>>(
    () => Object.fromEntries(items.map((t) => [t._id, t])),
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
      move,
      saveOrder,
    }),
    [items, map, status, error, create, update, remove, move, saveOrder],
  );
}
