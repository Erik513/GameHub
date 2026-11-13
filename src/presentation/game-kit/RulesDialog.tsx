import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { Button, Dialog } from "../components";

/** The button that opens the rules window; it belongs at the top of the game settings. */
export function RulesButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button className="kit-rules-button" variant="secondary" onClick={onClick}>
      <svg aria-hidden="true" focusable="false" height="18" viewBox="0 0 24 24" width="18">
        <path
          d="M12 6.5C10.5 5.4 8.3 5 5 5v12.5c3.3 0 5.5.4 7 1.5 1.5-1.1 3.7-1.5 7-1.5V5c-3.3 0-5.5.4-7 1.5ZM12 6.5V19"
          fill="none"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
      {label}
    </Button>
  );
}

/** The rules of one game mode, shown behind its tab. */
export interface RulesTab {
  readonly content: ReactNode;
  readonly id: string;
  readonly label: string;
}

interface RulesDialogProps {
  closeLabel: string;
  /** Rules that are the same in every game mode, as short bullet points above the tabs. */
  intro: readonly string[];
  onClose: () => void;
  /** Shows another tab; this does not choose a game mode. */
  onTabChange: (id: string) => void;
  open: boolean;
  /** The id of the tab that is shown. */
  tab: string;
  tabs: readonly RulesTab[];
  /** Accessible name of the row of tabs, for example "Game mode". */
  tabsLabel: string;
  title: string;
}

/**
 * One window with all the rules of a game: what is the same in every game mode, then the game
 * modes side by side as tabs with the rules of the selected one below. All tabs stay in the layout
 * on top of each other and only the chosen one is visible, so the window keeps one size and the
 * tabs never move. The arrow keys move between the tabs.
 */
export function RulesDialog({
  closeLabel,
  intro,
  onClose,
  onTabChange,
  open,
  tab,
  tabs,
  tabsLabel,
  title,
}: RulesDialogProps) {
  const prefix = useId();
  const tabRefs = useRef(new Map<string, HTMLButtonElement | null>());

  function move(event: KeyboardEvent, id: string) {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (step === 0) return;
    event.preventDefault();
    const index = tabs.findIndex((item) => item.id === id);
    const next = tabs[(index + step + tabs.length) % tabs.length];
    if (!next) return;
    onTabChange(next.id);
    tabRefs.current.get(next.id)?.focus();
  }

  return (
    <Dialog closeLabel={closeLabel} onClose={onClose} open={open} title={title}>
      <ul className="kit-rules-list">
        {intro.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <div aria-label={tabsLabel} className="kit-rules-tabs" role="tablist">
        {tabs.map((item) => (
          <button
            aria-controls={`${prefix}-panel-${item.id}`}
            aria-selected={item.id === tab}
            className="kit-rules-tab"
            id={`${prefix}-tab-${item.id}`}
            key={item.id}
            ref={(element) => {
              tabRefs.current.set(item.id, element);
            }}
            role="tab"
            tabIndex={item.id === tab ? 0 : -1}
            type="button"
            onClick={() => onTabChange(item.id)}
            onKeyDown={(event) => move(event, item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="kit-rules-panels">
        {tabs.map((item) => (
          <div
            aria-hidden={item.id !== tab}
            aria-labelledby={`${prefix}-tab-${item.id}`}
            id={`${prefix}-panel-${item.id}`}
            key={item.id}
            role="tabpanel"
            style={item.id === tab ? undefined : { visibility: "hidden" }}
          >
            {item.content}
          </div>
        ))}
      </div>
    </Dialog>
  );
}
