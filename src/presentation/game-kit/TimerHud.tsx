import type { ReactNode } from "react";

interface TimerHudProps {
  /** Fraction of the time that is left, from 0 to 1. */
  readonly fraction: number;
  /** Small second line, for example round and points. */
  readonly meta: ReactNode;
  /** Remaining time in seconds; the display turns amber at 20 and red at 10 seconds. */
  readonly remainingSeconds: number;
  /** The time as shown, for example "42" or "12.3". */
  readonly time: string;
  /** Accessible name of the timer. */
  readonly timerLabel: string;
  /** Name of the team or player whose turn it is. */
  readonly title: string;
}

/** One block with title, meta line, time and a shrinking time bar. */
export function TimerHud({
  fraction,
  meta,
  remainingSeconds,
  time,
  timerLabel,
  title,
}: TimerHudProps) {
  const low = remainingSeconds <= 10;
  const warn = remainingSeconds > 10 && remainingSeconds <= 20;

  return (
    <div className="kit-hud">
      <div className="kit-hud__row">
        <div>
          <p className="kit-hud__title">{title}</p>
          <p className="kit-hud__meta">{meta}</p>
        </div>
        <p role="timer" data-low={low} data-warn={warn} aria-label={timerLabel}>
          {time}
        </p>
      </div>
      <div className="kit-hud__bar" aria-hidden="true" data-low={low} data-warn={warn}>
        <span style={{ transform: `scaleX(${Math.max(0, fraction)})` }} />
      </div>
    </div>
  );
}
