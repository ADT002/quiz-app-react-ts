import { useEffect, useState } from 'react';
import { examApi } from '../api/examApi';

const HEARTBEAT_MS = 30_000;

/**
 * Periodic heartbeat — refreshes server_end_at and server_now from BE every 30s
 * so that the countdown does not drift if the client clock is wrong.
 *
 * Returns the latest synced timestamps. Caller passes them into useCountdown.
 */
export function useHeartbeat(submission_id: string | null) {
  const [serverEndAt, setServerEndAt] = useState<string | null>(null);
  const [serverNow, setServerNow] = useState<string | null>(null);

  useEffect(() => {
    if (!submission_id) return;
    let cancelled = false;

    const tick = async () => {
      try {
        const r = await examApi.heartbeat(submission_id);
        if (cancelled) return;
        setServerEndAt(r.server_end_at);
        setServerNow(r.server_now);
      } catch {
        // Network blip — keep last-known timestamps. Countdown still ticks locally.
      }
    };

    void tick();
    const id = setInterval(tick, HEARTBEAT_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [submission_id]);

  return { serverEndAt, serverNow, setSync: (end: string, now: string) => {
    setServerEndAt(end);
    setServerNow(now);
  } };
}
