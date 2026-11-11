import { useTranslation } from "react-i18next";
import { TIEBREAK_CARD_COUNT } from "../../business/games/taboo/stateMachine";
import { formatSeconds } from "./formatTime";

export interface TiebreakRow {
  readonly id: string;
  readonly name: string;
  /** Undefined while the team has not played its attempt yet. */
  readonly result?: { readonly solved: number; readonly timeMs: number };
  readonly winner?: boolean;
}

/** Lists the tiebreak attempts: solved cards and time per team. */
export function TabooTiebreakResults({ rows }: { rows: readonly TiebreakRow[] }) {
  const { t, i18n } = useTranslation();

  return (
    <ol className="kit-scoreboard taboo-tiebreak-results" aria-label={t("tabooTiebreak.results")}>
      {rows.map(({ id, name, result, winner }) => (
        <li data-winner={winner ? true : undefined} key={id}>
          <span className="kit-scoreboard__name">{name}</span>
          <span className="visually-hidden">: </span>
          <span className="kit-scoreboard__score">
            {result
              ? t("tabooTiebreak.result", {
                  solved: result.solved,
                  total: TIEBREAK_CARD_COUNT,
                  time: formatSeconds(result.timeMs, i18n.language),
                })
              : t("tabooTiebreak.pending")}
          </span>
        </li>
      ))}
    </ol>
  );
}
