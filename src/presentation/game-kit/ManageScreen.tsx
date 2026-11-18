import { useId, type ReactNode } from "react";
import { SetupTabs, type SetupTab } from "./SetupTabs";
import { useFocusOnShow } from "./useFocusOnShow";

interface ManageScreenProps {
  /** Accessible name of the row of tabs. */
  readonly tabsLabel: string;
  /** Messages shown above the tabs, for example the result of an import. */
  readonly messages?: ReactNode;
  /** The parts of the editor as tabs, for example "Cards" and "Add card". */
  readonly tabs: readonly SetupTab[];
  readonly title: string;
}

/**
 * The frame of the editor of a game: the title, and the parts as tabs. Each tab can keep its own
 * controls in place (`TabPane`). Like every screen it is one page: only the box of the chosen tab scrolls. Every game with
 * own content (cards, questions, words) uses it.
 */
export function ManageScreen({ messages, tabs, tabsLabel, title }: ManageScreenProps) {
  const titleId = useId();
  const focus = useFocusOnShow<HTMLElement>();
  return (
    <section
      aria-labelledby={titleId}
      className="kit-manage kit-onepage focus-target"
      ref={focus}
      tabIndex={-1}
    >
      {/* The header already names the game; the title is only for screen readers. */}
      <h2 className="visually-hidden" id={titleId}>
        {title}
      </h2>
      {messages}
      <SetupTabs ariaLabel={tabsLabel} tabs={tabs} />
    </section>
  );
}
