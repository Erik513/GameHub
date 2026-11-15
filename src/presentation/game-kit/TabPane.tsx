import type { ReactNode } from "react";

interface TabPaneProps {
  /** The content that scrolls. */
  readonly children: ReactNode;
  /** Controls below the content that never scroll away, for example the main action of the tab. */
  readonly footer?: ReactNode;
  /** Controls above the content that never scroll away, for example a switch or a back button. */
  readonly header?: ReactNode;
}

/**
 * The content of a tab with fixed controls: the header and the footer stay in place, only the
 * content between them scrolls. Scrolling never hides a control.
 */
export function TabPane({ children, footer, header }: TabPaneProps) {
  return (
    <div className="kit-pane">
      {header && <div className="kit-pane__header">{header}</div>}
      <div className="kit-pane__body">{children}</div>
      {footer && <div className="kit-pane__footer">{footer}</div>}
    </div>
  );
}
