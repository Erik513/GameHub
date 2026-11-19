import { useRef, type ReactNode } from "react";
import { useToastLift } from "./useToastLift";

interface StartBarProps {
  readonly children: ReactNode;
  /** Stacks several actions below each other instead of one button with a strip. */
  readonly stacked?: boolean;
  /** A small icon button left of the main button. */
  readonly sideAction?: ReactNode;
}

/**
 * The main action of a screen, pinned to the bottom edge within thumb reach. Notifications stand right
 * above it.
 */
export function StartBar({ children, stacked = false, sideAction }: StartBarProps) {
  const bar = useRef<HTMLDivElement>(null);
  useToastLift(bar);
  if (sideAction) {
    return (
      <div className="kit-start-bar kit-start-bar--row" ref={bar}>
        <span className="kit-start-bar__side">{sideAction}</span>
        {children}
      </div>
    );
  }
  return (
    <div className={stacked ? "kit-start-bar kit-start-bar--stack" : "kit-start-bar"} ref={bar}>
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
