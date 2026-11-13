import { useTranslation } from "react-i18next";
import { formatSeconds } from "./formatTime";

export interface RaceRow {
  readonly id: string;
  readonly name: string;
  /** Undefined while the team has not played its run yet. */
  readonly timeMs?: number;
  /** Cards that counted; fewer than `total` after a correction. */
  readonly solved?: number;
  readonly total?: number;
  readonly winner?: boolean;
}

/** Lists the times of the runs of the mode "Auf Zeit": one row per team. */
export function TabooRaceResults({
  label,
  rows,
}: {
  readonly label: string;
  readonly rows: readonly RaceRow[];
}) {
  const { t, i18n } = useTranslation();

  return (
    <ol className="kit-scoreboard taboo-tiebreak-results" aria-label={label}>
      {rows.map(({ id, name, solved, timeMs, total, winner }) => (
        <li data-winner={winner ? true : undefined} key={id}>
          <span className="kit-scoreboard__name">{name}</span>
          <span className="visually-hidden">: </span>
          <span className="kit-scoreboard__score">
            {timeMs === undefined
              ? t("tabooRace.pending")
              : solved !== undefined && total !== undefined && solved < total
                ? t("tabooRace.partial", {
                    solved,
                    total,
                    time: formatSeconds(timeMs, i18n.language),
                  })
                : t("tabooRace.time", { time: formatSeconds(timeMs, i18n.language) })}
          </span>
        </li>
      ))}
    </ol>
  );
}
