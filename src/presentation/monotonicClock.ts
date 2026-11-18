/**
 * The clock for everything that is timed in a game: the turn, the run, the tiebreak attempt and the
 * pause. It counts milliseconds from an arbitrary start and never goes backwards. Unlike the wall
 * clock (`Date.now`) it ignores a change of the system time (daylight saving time, a clock that is
 * set by the user or by the network), which would otherwise add or take away time during a turn.
 * Only the difference of two readings means something.
 */
export function monotonicNow(): number {
  return performance.now();
}
