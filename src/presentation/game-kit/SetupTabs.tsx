import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

export interface SetupTab {
  /** The content of the tab; it stays in the form while the tab is not shown. */
  readonly content: ReactNode;
  /** Unique within the tabs; used to choose the tab that is open at first. */
  readonly id: string;
  /** The visible name, for example "Teams (2)". */
  readonly label: string;
}

interface SetupTabsProps {
  /** Accessible name of the row of tabs, for example "Line-up". */
  readonly ariaLabel: string;
  /** The id of the tab that is open at first; the first tab by default. */
  readonly initial?: string;
  /** Called when a tab was chosen. */
  readonly onSelect?: (id: string) => void;
  /** Makes the tabs controlled: the shown tab is always `selected`. */
  readonly selected?: string;
  readonly tabs: readonly SetupTab[];
}

/**
 * Tabs like in a browser: a row of tabs on top, below it the content of the chosen tab in a box that
 * is joined to the tab. All tabs stay in the page (the inactive ones are only hidden by the style),
 * so a form reads the values of every tab, also of those that are not shown. The arrow keys, Home
 * and End move between the tabs.
 */
export function SetupTabs({ ariaLabel, initial, onSelect, selected, tabs }: SetupTabsProps) {
  const base = useId();
  const [own, setOwn] = useState(initial ?? tabs[0]?.id);
  const chosen = selected ?? own;
  const setChosen = (id: string) => {
    setOwn(id);
    onSelect?.(id);
  };
  const buttons = useRef(new Map<string, HTMLButtonElement>());

  function onKeyDown(event: KeyboardEvent, index: number) {
    const last = tabs.length - 1;
    const target =
      event.key === "ArrowRight"
        ? index === last
          ? 0
          : index + 1
        : event.key === "ArrowLeft"
          ? index === 0
            ? last
            : index - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : undefined;
    const tab = target === undefined ? undefined : tabs[target];
    if (!tab) return;
    event.preventDefault();
    setChosen(tab.id);
    buttons.current.get(tab.id)?.focus();
  }

  return (
    <div className="kit-tabs">
      <div aria-label={ariaLabel} className="kit-tabs__list" role="tablist">
        {tabs.map((tab, index) => {
          const selected = tab.id === chosen;
          return (
            <button
              aria-controls={`${base}-panel-${tab.id}`}
              aria-selected={selected}
              className="kit-tab"
              id={`${base}-tab-${tab.id}`}
              key={tab.id}
              onClick={() => setChosen(tab.id)}
              onKeyDown={(event) => onKeyDown(event, index)}
              ref={(button) => {
                if (button) buttons.current.set(tab.id, button);
                else buttons.current.delete(tab.id);
              }}
              role="tab"
              tabIndex={selected ? 0 : -1}
              type="button"
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => (
        <div
          aria-labelledby={`${base}-tab-${tab.id}`}
          className="kit-tabpanel"
          data-active={tab.id === chosen}
          id={`${base}-panel-${tab.id}`}
          key={tab.id}
          role="tabpanel"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
