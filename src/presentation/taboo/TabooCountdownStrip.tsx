import { useTranslation } from "react-i18next";
import { formatMinutes } from "./formatTime";

/** The time turns amber at 20 seconds and red at 10, like the large clock of the turn. */
const warnSeconds = 20;
const lowSeconds = 10;

export interface CountdownStripTeam {
  readonly eliminated: boolean;
  readonly id: string;
  readonly name: string;
  /** What is left on the account, in milliseconds. */
  readonly remainingMs: number;
}

/**
 * The time accounts of all teams in one row above the card, for the automatic change of teams where
 * there is no overview between the turns. The team on the move is marked and its time runs down; a
 * team that is out is crossed out.
 */
export function TabooCountdownStrip({
  active,
  teams,
}: {
  /** The index of the team on the move. */
  readonly active: number;
  readonly teams: readonly CountdownStripTeam[];
}) {
  const { t } = useTranslation();
  return (
    <ul className="taboo-countdown-strip" aria-label={t("tabooCountdown.accounts")}>
      {teams.map((team, index) => (
        <li
          data-active={index === active}
          data-out={team.eliminated}
          key={team.id}
          // The time of the team on the move is read from the large clock; this row is for looking.
        >
          <span className="taboo-countdown-strip__name">{team.name}</span>
          <span
            className="taboo-countdown-strip__time"
            data-low={!team.eliminated && Math.ceil(team.remainingMs / 1000) <= lowSeconds}
            data-warn={
              !team.eliminated &&
              Math.ceil(team.remainingMs / 1000) > lowSeconds &&
              Math.ceil(team.remainingMs / 1000) <= warnSeconds
            }
          >
            {team.eliminated
              ? t("tabooCountdown.outShort")
              : formatMinutes(team.remainingMs / 1000)}
          </span>
        </li>
      ))}
    </ul>
  );
}
