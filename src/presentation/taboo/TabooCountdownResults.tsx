import { useTranslation } from "react-i18next";
import type { CountdownState } from "../../business/games/taboo/countdown";
import { rankCountdownTeams } from "../../business/games/taboo/countdown";
import { ResultList, type ResultRow } from "../game-kit";
import { formatMinutes } from "./formatTime";

/**
 * The time accounts of the mode "Gegen die Zeit": one row per team with the time it has left or
 * "out" when its account is empty. The teams are ranked as `rankCountdownTeams` says, so a team that
 * dropped out later is better placed. The winners get the crown.
 */
export function TabooCountdownResults({
  label,
  state,
  winnerIds,
}: {
  readonly label: string;
  readonly state: CountdownState;
  readonly winnerIds?: readonly string[];
}) {
  const { t } = useTranslation();
  const { budgetMs, teams } = state.configuration;
  const ranking = rankCountdownTeams(state);

  const rows: ResultRow[] = teams.map((team, index) => {
    const account = state.teams[index];
    const out = account?.eliminated ?? false;
    return {
      bar: out ? 0 : Math.min(1, (account?.remainingMs ?? 0) / budgetMs),
      id: team.id,
      name: team.name,
      note: out
        ? t("tabooCountdown.out")
        : t("tabooCountdown.solved", { count: account?.solved ?? 0 }),
      // Teams with the same time left share a rank; a team that is out has the place it dropped out in.
      rank: out
        ? ranking.indexOf(index) + 1
        : 1 +
          state.teams.filter(
            (other) => !other.eliminated && other.remainingMs > (account?.remainingMs ?? 0),
          ).length,
      value: out ? "0:00" : formatMinutes((account?.remainingMs ?? 0) / 1000),
      ...(winnerIds?.includes(team.id) ? { winner: true } : {}),
    };
  });

  return <ResultList label={label} pendingLabel={t("tabooRace.pending")} rows={rows} />;
}
