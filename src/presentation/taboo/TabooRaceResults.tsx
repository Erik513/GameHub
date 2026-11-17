import { useTranslation } from "react-i18next";
import { ResultList, type ResultRow } from "../game-kit";
import { formatSeconds } from "./formatTime";

export interface RaceRow {
  readonly id: string;
  readonly name: string;
  /** Undefined while the team has not played its run yet. */
  readonly timeMs?: number;
  /** The time of the latest run, shown next to the total when there are several rounds. */
  readonly lastTimeMs?: number;
  /**
   * False for a team that cannot be compared with the others yet (in the middle of a round it has
   * played one run less): its time is shown, but it gets no rank and no bar. Default: true.
   */
  readonly ranked?: boolean;
  /** Cards that counted in all runs; fewer than `total` after a correction. */
  readonly solved?: number;
  /** Cards that were to be solved in all runs so far. */
  readonly total?: number;
  readonly winner?: boolean;
}

/**
 * Lists the times of the mode "Auf Zeit": one row per team with the total time of all its runs, the
 * fastest gets the crown. Most solved cards come first, then the shortest time; the same result
 * shares a rank.
 */
export function TabooRaceResults({
  label,
  rows,
}: {
  readonly label: string;
  readonly rows: readonly RaceRow[];
}) {
  const { t, i18n } = useTranslation();

  const played = rows.filter((row) => row.timeMs !== undefined && row.ranked !== false);
  // Times count in tenths of a second (as they are shown), so equal times have equal bars.
  const tenths = (ms: number) => Math.round(ms / 100);
  const better = (a: RaceRow, b: RaceRow) =>
    (a.solved ?? a.total ?? 0) > (b.solved ?? b.total ?? 0) ||
    ((a.solved ?? a.total ?? 0) === (b.solved ?? b.total ?? 0) &&
      tenths(a.timeMs ?? 0) < tenths(b.timeMs ?? 0));
  const fastest = Math.min(...played.map((row) => tenths(row.timeMs ?? Number.POSITIVE_INFINITY)));

  const list: ResultRow[] = rows.map((row) => {
    const { id, name, lastTimeMs, solved, timeMs, total, winner } = row;
    if (timeMs === undefined) return { id, name };
    const partial = solved !== undefined && total !== undefined && solved < total;
    const notes = [
      partial ? t("tabooRace.partialCards", { solved, total }) : undefined,
      lastTimeMs === undefined
        ? undefined
        : t("tabooRace.lastRun", { time: formatSeconds(lastTimeMs, i18n.language) }),
    ].filter((note) => note !== undefined);
    const ranked = row.ranked !== false;
    return {
      ...(ranked
        ? {
            bar:
              tenths(timeMs) > 0
                ? Math.min(1, fastest / tenths(timeMs)) * (partial ? solved / total : 1)
                : 1,
            rank: 1 + played.filter((other) => better(other, row)).length,
          }
        : {}),
      id,
      name,
      ...(notes.length > 0 ? { note: notes.join(" · ") } : {}),
      value: t("tabooRace.time", { time: formatSeconds(timeMs, i18n.language) }),
      ...(winner ? { winner } : {}),
    };
  });

  return <ResultList label={label} pendingLabel={t("tabooRace.pending")} rows={list} />;
}
