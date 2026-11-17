import { useTranslation } from "react-i18next";
import { ResultList, type ResultRow } from "../game-kit";
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

/** Lists the times of the runs of the mode "Auf Zeit": one row per team, the fastest gets the crown. */
export function TabooRaceResults({
  label,
  rows,
}: {
  readonly label: string;
  readonly rows: readonly RaceRow[];
}) {
  const { t, i18n } = useTranslation();

  // Most solved cards first, then the fastest; the same result shares a rank.
  const played = rows.filter((row) => row.timeMs !== undefined);
  // Times count in tenths of a second (as they are shown), so equal times have equal bars.
  const tenths = (ms: number) => Math.round(ms / 100);
  const better = (a: RaceRow, b: RaceRow) =>
    (a.solved ?? a.total ?? 0) > (b.solved ?? b.total ?? 0) ||
    ((a.solved ?? a.total ?? 0) === (b.solved ?? b.total ?? 0) &&
      tenths(a.timeMs ?? 0) < tenths(b.timeMs ?? 0));
  const fastest = Math.min(...played.map((row) => tenths(row.timeMs ?? Number.POSITIVE_INFINITY)));

  const list: ResultRow[] = rows.map((row) => {
    const { id, name, solved, timeMs, total, winner } = row;
    if (timeMs === undefined) return { id, name };
    const partial = solved !== undefined && total !== undefined && solved < total;
    return {
      bar:
        tenths(timeMs) > 0
          ? Math.min(1, fastest / tenths(timeMs)) * (partial ? solved / total : 1)
          : 1,
      id,
      name,
      ...(partial ? { note: t("tabooRace.partialCards", { solved, total }) } : {}),
      rank: 1 + played.filter((other) => better(other, row)).length,
      value: t("tabooRace.time", { time: formatSeconds(timeMs, i18n.language) }),
      ...(winner ? { winner } : {}),
    };
  });

  return <ResultList label={label} pendingLabel={t("tabooRace.pending")} rows={list} />;
}
