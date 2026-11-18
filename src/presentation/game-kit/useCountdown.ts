import { useEffect, useRef, useState } from "react";
import { monotonicNow } from "../monotonicClock";

interface CountdownOptions {
  /** Absolute end time in milliseconds (monotonicNow() based). */
  readonly deadline: number;
  readonly durationMs: number;
  /** Called once when the time has run out. */
  readonly onElapsed: () => void;
  /** While paused the display stands still; the caller moves the deadline on resume. */
  readonly paused: boolean;
}

/** Counts down to a deadline and reports the remaining whole seconds and the remaining fraction. */
export function useCountdown({ deadline, durationMs, onElapsed, paused }: CountdownOptions) {
  const [seconds, setSeconds] = useState(() =>
    Math.max(0, Math.ceil((deadline - monotonicNow()) / 1000)),
  );
  const [fraction, setFraction] = useState(() =>
    Math.min(1, Math.max(0, (deadline - monotonicNow()) / durationMs)),
  );
  const latest = useRef(onElapsed);

  useEffect(() => {
    latest.current = onElapsed;
  });

  useEffect(() => {
    if (paused) return;
    const clock = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadline - monotonicNow()) / 1000));
      setSeconds(remaining);
      setFraction(Math.min(1, Math.max(0, (deadline - monotonicNow()) / durationMs)));
      if (remaining === 0) {
        clearInterval(clock);
        latest.current();
      }
    }, 100);
    return () => clearInterval(clock);
  }, [deadline, durationMs, paused]);

  return { fraction, seconds };
}
