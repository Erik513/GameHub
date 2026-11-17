import type { ReactNode } from "react";

interface TimerHudProps {
  /**
   * How full the bar is, from 0 to 1. A countdown shows the time that is left (the bar shrinks), a
   * task like "solve three cards as fast as possible" shows its progress (the bar fills up).
   */
  readonly fraction: number;
  /** Small second line, for example the card number; without it only the title is shown. */
  readonly meta?: ReactNode;
  /** Remaining time in seconds; the display turns amber at 20 and red at 10 seconds. */
  readonly remainingSeconds: number;
  /** The time as shown, for example "42" or "12.3". */
  readonly time: string;
  /** Accessible name of the timer. */
  readonly timerLabel: string;
  /** Name of the team or player whose turn it is. */
  readonly title: string;
}

/** A thin time bar at the very top (like the progress bar of the overview), below it a block with title, meta line and time. */
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
    <div className="kit-hud-wrap">
      <div className="kit-hud__bar" aria-hidden="true" data-low={low} data-warn={warn}>
        <span style={{ transform: `scaleX(${Math.max(0, fraction)})` }} />
      </div>
      <div className="kit-hud">
        <div className="kit-hud__row">
          <div>
            <p className="kit-hud__title">{title}</p>
            {meta !== undefined && <p className="kit-hud__meta">{meta}</p>}
          </div>
          <p role="timer" data-low={low} data-warn={warn} aria-label={timerLabel}>
            {time}
          </p>
        </div>
      </div>
    </div>
  );
}
