import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import type { AppDispatch, RootState } from './store';

export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Typed wrapper of useSelector. Pass `shallowEqual` (re-export below) when
 * selector returns object/array literals to avoid spurious re-renders.
 *
 * @example
 *   const items = useAppSelector(s => s.classes.allClass)
 *   const { items, status } = useAppSelector(s => ({ items: s.x.items, status: s.x.status }), shallowEqual)
 */
export const useAppSelector = <T>(
  selector: (state: RootState) => T,
  equalityFn?: (a: T, b: T) => boolean,
): T => useSelector(selector, equalityFn);

export { shallowEqual };
