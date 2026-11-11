import type { ReactNode } from "react";

interface StartBarProps {
  readonly children: ReactNode;
  /** Stacks several actions below each other instead of one button with a strip. */
  readonly stacked?: boolean;
}

/** The main action of a screen, pinned to the bottom edge within thumb reach. */
export function StartBar({ children, stacked = false }: StartBarProps) {
  return (
    <div className={stacked ? "kit-start-bar kit-start-bar--stack" : "kit-start-bar"}>
      {children}
    </div>
  );
}

interface TurnStripProps {
  /** Read by screen readers before the name, for example "Up next". */
  readonly hiddenLabel: string;
  readonly name: string;
}

/** Shows who is up next; it extends the start button upwards. */
export function TurnStrip({ hiddenLabel, name }: TurnStripProps) {
  return (
    <div className="kit-turn-strip">
      <span className="visually-hidden">{hiddenLabel}: </span>
      <strong>{name}</strong>
    </div>
  );
}
