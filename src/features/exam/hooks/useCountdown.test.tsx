import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useCountdown } from './useCountdown';

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns zeroed parts when no inputs', () => {
    const { result } = renderHook(() => useCountdown(null, null));
    expect(result.current.totalSeconds).toBe(0);
    expect(result.current.isOver).toBe(false);
  });

  it('computes remaining seconds against server clock', () => {
    const now = new Date('2026-05-09T03:00:00Z');
    vi.setSystemTime(now);
    const serverNow = now.toISOString();
    const serverEnd = new Date(now.getTime() + 60_000).toISOString();

    const { result } = renderHook(() => useCountdown(serverEnd, serverNow));
    expect(result.current.totalSeconds).toBe(60);
    expect(result.current.minutes).toBe(1);
    expect(result.current.seconds).toBe(0);
  });

  it('ticks down by 1s every second', () => {
    const now = new Date('2026-05-09T03:00:00Z');
    vi.setSystemTime(now);
    const serverNow = now.toISOString();
    const serverEnd = new Date(now.getTime() + 5_000).toISOString();

    const { result } = renderHook(() => useCountdown(serverEnd, serverNow));
    expect(result.current.totalSeconds).toBe(5);

    act(() => {
      vi.advanceTimersByTime(2_000);
    });
    expect(result.current.totalSeconds).toBe(3);
  });

  it('marks isOver when remaining hits zero', () => {
    const now = new Date('2026-05-09T03:00:00Z');
    vi.setSystemTime(now);
    const serverNow = now.toISOString();
    const serverEnd = new Date(now.getTime() + 1_000).toISOString();

    const { result } = renderHook(() => useCountdown(serverEnd, serverNow));
    act(() => {
      vi.advanceTimersByTime(2_000);
    });
    expect(result.current.totalSeconds).toBe(0);
    expect(result.current.isOver).toBe(true);
  });

  it('fires onTimeUp once when boundary reached', () => {
    const now = new Date('2026-05-09T03:00:00Z');
    vi.setSystemTime(now);
    const serverNow = now.toISOString();
    const serverEnd = new Date(now.getTime() + 1_000).toISOString();
    const onTimeUp = vi.fn();

    renderHook(() => useCountdown(serverEnd, serverNow, onTimeUp));
    act(() => {
      vi.advanceTimersByTime(2_000);
    });
    expect(onTimeUp).toHaveBeenCalledTimes(1);

    // Further ticks should not re-fire — boundary is one event.
    act(() => {
      vi.advanceTimersByTime(2_000);
    });
    expect(onTimeUp).toHaveBeenCalledTimes(1);
  });

  it('compensates for skewed client clock via server-now offset', () => {
    // Real time = 03:00, but server says it's 03:05 → 5 min ahead.
    const realNow = new Date('2026-05-09T03:00:00Z');
    vi.setSystemTime(realNow);
    const serverNowIso = new Date(realNow.getTime() + 300_000).toISOString();
    const serverEndIso = new Date(realNow.getTime() + 360_000).toISOString();

    const { result } = renderHook(() =>
      useCountdown(serverEndIso, serverNowIso),
    );
    // Remaining server-side: end - server_now = 60s.
    expect(result.current.totalSeconds).toBe(60);
  });
});
