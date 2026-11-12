import type { ReactNode } from "react";

interface ActionRowProps {
  readonly children: ReactNode;
  /** Extra class for the placement of the row inside a screen. */
  readonly className?: string;
}

/**
 * A row of buttons that fills the width: every button is equally wide and equally high. Put them in
 * the fixed order confirm (green), remove (red), cancel (red); the row does not reorder them.
 */
export function ActionRow({ children, className = "" }: ActionRowProps) {
  return <div className={`kit-action-row ${className}`.trim()}>{children}</div>;
}
