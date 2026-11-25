import { useTranslation } from "react-i18next";
import { RosterPicker } from "./RosterPicker";

interface RosterRowProps {
  /** The names of the players as text (the value of the player list). */
  readonly value: string;
  readonly onChange: (text: string) => void;
  /** How many take part now. */
  readonly count: number;
  /** The most players the game allows; without it the box shows the number only. */
  readonly limit?: number;
  /** The fewest players the game needs: the number is red below it and green from it on; without it, neutral. */
  readonly minimum?: number;
  /** What a screen reader says about the number (the game may count the narrator, too). */
  readonly countLabel?: string;
}

/**
 * The first row of the players of every game: the button to choose players from the saved player list and the number
 * of the players next to it ("11/21" with a limit, "8" without one).
 */
export function RosterRow({ value, onChange, count, limit, minimum, countLabel }: RosterRowProps) {
  const { t } = useTranslation();
  return (
    <div className="kit-players__actions">
      <RosterPicker onChange={onChange} value={value} {...(limit === undefined ? {} : { limit })} />
      <span
        aria-label={countLabel ?? t("kitPlayers.count", { count })}
        className="kit-count"
        data-enough={minimum === undefined ? undefined : count >= minimum}
        role="status"
      >
        {limit === undefined ? count : `${count}/${limit}`}
      </span>
    </div>
  );
}
