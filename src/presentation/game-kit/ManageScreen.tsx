import { useId, type ReactNode } from "react";
import { ActionRow } from "./ActionRow";

interface ManageScreenProps {
  /** Buttons at the bottom of the screen, for example import and export; they share the width. */
  readonly actions?: ReactNode;
  /** The chapters of the screen, usually `SetupSection`s. */
  readonly children: ReactNode;
  /** A short text below the title. */
  readonly hint?: string;
  /** Messages shown below the actions, for example the result of an import. */
  readonly messages?: ReactNode;
  readonly title: string;
}

/**
 * The frame of the editor of a game: title and hint, the chapters, a row of actions and messages.
 * Every game with own content (cards, questions, words) uses it.
 */
export function ManageScreen({ actions, children, hint, messages, title }: ManageScreenProps) {
  const titleId = useId();
  return (
    <section aria-labelledby={titleId} className="kit-manage">
      <h2 id={titleId}>{title}</h2>
      {hint && <p>{hint}</p>}
      {children}
      {actions && <ActionRow>{actions}</ActionRow>}
      {messages}
    </section>
  );
}
