import type { ReactNode } from "react";

interface SplitScreenProps {
  /** The area on the right, for example the settings; it scrolls by itself. */
  readonly end: ReactNode;
  /** The main action over the whole width below both areas (`StartBar`), if the screen has one. */
  readonly footer?: ReactNode;
  /** Accessible name of the screen. */
  readonly label: string;
  /** The area on the left, for example the line-up; it scrolls by itself. */
  readonly start: ReactNode;
}

/**
 * Two areas side by side with the main action below them, for the PC layout (from 64 rem). The screen
 * is one page like every screen of a game: the page does not scroll, each area scrolls by itself.
 * A game shows it instead of two views one after the other when `useIsDesktop` says so.
 */
export function SplitScreen({ end, footer, label, start }: SplitScreenProps) {
  return (
    <section aria-label={label} className="kit-split kit-onepage">
      <div className="kit-split__area kit-split__area--start">{start}</div>
      <div className="kit-split__area kit-split__area--end">{end}</div>
      {footer && <div className="kit-split__footer">{footer}</div>}
    </section>
  );
}
