import { useEffect, useState } from "react";

interface StopwatchOptions {
  /** While paused the clock stands still. */
  readonly pausedAt: number | undefined;
  /** Total time spent paused before, so pauses do not count. */
  readonly pausedMs: number;
  readonly startedAt: number;
}

/** Measures the elapsed time of an attempt in milliseconds, excluding pauses. */
export function useStopwatch({ pausedAt, pausedMs, startedAt }: StopwatchOptions): number {
  const [now, setNow] = useState(() => Date.now());
  const paused = pausedAt !== undefined;

  useEffect(() => {
    if (paused) return;
    const clock = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(clock);
  }, [paused]);

  return Math.max(0, (pausedAt ?? now) - startedAt - pausedMs);
}
