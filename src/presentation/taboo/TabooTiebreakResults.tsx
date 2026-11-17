import { useTranslation } from "react-i18next";
import { TIEBREAK_CARD_COUNT } from "../../business/games/taboo/stateMachine";
import { ResultList, type ResultRow } from "../game-kit";
import { formatSeconds } from "./formatTime";

export interface TiebreakRow {
  readonly id: string;
  readonly name: string;
  /** Undefined while the team has not played its attempt yet. */
  readonly result?: { readonly solved: number; readonly timeMs: number };
  readonly winner?: boolean;
}

/** Lists the tiebreak attempts: solved cards and time per team, the best one gets the crown. */
export function TabooTiebreakResults({ rows }: { readonly rows: readonly TiebreakRow[] }) {
  const { t, i18n } = useTranslation();

  // The most cards win, then the shortest time; the same result shares a rank.
  const played = rows.filter((row) => row.result);
  const better = (a: TiebreakRow, b: TiebreakRow) =>
    a.result !== undefined &&
    b.result !== undefined &&
    (a.result.solved > b.result.solved ||
      (a.result.solved === b.result.solved &&
        Math.round(a.result.timeMs / 100) < Math.round(b.result.timeMs / 100)));

  const list: ResultRow[] = rows.map((row) => {
    const { id, name, result, winner } = row;
    if (!result) return { id, name };
    return {
      bar: result.solved / TIEBREAK_CARD_COUNT,
      id,
      name,
      note: t("tabooTiebreak.resultCards", { solved: result.solved, total: TIEBREAK_CARD_COUNT }),
      rank: 1 + played.filter((other) => better(other, row)).length,
      value: t("tabooRace.time", { time: formatSeconds(result.timeMs, i18n.language) }),
      ...(winner ? { winner } : {}),
    };
  });

  return (
    <ResultList
      label={t("tabooTiebreak.results")}
      pendingLabel={t("tabooTiebreak.pending")}
      rows={list}
    />
  );
}
