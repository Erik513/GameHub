import type { ReactNode } from "react";
import { Button } from "../components";

/** The rules of one game mode, shown when its button is chosen. */
export interface RulesItem {
  readonly content: ReactNode;
  readonly id: string;
  readonly label: string;
}

interface RulesViewProps {
  /** Rules that are the same in every game mode, as short bullet points on top. */
  readonly intro: readonly string[];
  readonly items: readonly RulesItem[];
  /** Accessible name of the row of game modes, for example "Game mode". */
  readonly label: string;
  readonly onSelect: (id: string) => void;
  /** The id of the game mode whose rules are shown. */
  readonly selected: string;
}

/**
 * All the rules of a game on one page, for a tab of the main menu: first what is the same in every
 * game mode, then the game modes side by side as buttons (the chosen one is filled) and below them the
 * rules of the chosen game mode. Choosing here only shows other rules; it does not choose the game
 * mode of the game.
 */
export function RulesView({ intro, items, label, onSelect, selected }: RulesViewProps) {
  const chosen = items.find((item) => item.id === selected) ?? items[0];
  return (
    <>
      <ul className="kit-rules-list">
        {intro.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <div aria-label={label} className="kit-rules-modes" role="group">
        {items.map((item) => (
          <Button
            aria-pressed={item.id === chosen?.id}
            key={item.id}
            onClick={() => onSelect(item.id)}
            variant={item.id === chosen?.id ? "primary" : "secondary"}
          >
            {item.label}
          </Button>
        ))}
      </div>
      {chosen?.content}
    </>
  );
}
