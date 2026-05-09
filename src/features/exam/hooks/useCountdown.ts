import { useEffect, useRef, useState } from 'react';

export interface CountdownParts {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isOver: boolean;
}

const ZERO: CountdownParts = {
  hours: 0,
  minutes: 0,
  seconds: 0,
  totalSeconds: 0,
  isOver: false,
};

/**
 * Server-anchored countdown.
 *
 * Captures `offset = serverNow - localNow` in state at sync time, then
 * computes `remaining = serverEnd - (Date.now() + offset)` every second.
 * Authoritative against server clock; resyncs whenever caller passes a
 * fresh `serverNowIso` (typically from useHeartbeat).
 */
export function useCountdown(
  serverEndIso: string | null,
  serverNowIso: string | null,
  onTimeUp?: () => void,
): CountdownParts {
  const [tick, setTick] = useState(() => Date.now());
  const [offset, setOffset] = useState(() =>
    serverNowIso ? new Date(serverNowIso).getTime() - Date.now() : 0,
  );
  const firedRef = useRef(false);

  // Resync offset when server reference times change.
  useEffect(() => {
    if (serverNowIso) {
      setOffset(new Date(serverNowIso).getTime() - Date.now());
    }
    firedRef.current = false;
  }, [serverNowIso, serverEndIso]);

  useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  let parts = ZERO;
  if (serverEndIso && serverNowIso) {
    const serverNow = tick + offset;
    const remaining = Math.max(
      0,
      Math.floor((new Date(serverEndIso).getTime() - serverNow) / 1000),
    );
    parts = {
      hours: Math.floor(remaining / 3600),
      minutes: Math.floor((remaining % 3600) / 60),
      seconds: remaining % 60,
      totalSeconds: remaining,
      isOver: remaining === 0,
    };
  }

  useEffect(() => {
    if (parts.isOver && !firedRef.current && onTimeUp) {
      firedRef.current = true;
      onTimeUp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parts.isOver]);

  return parts;
}
