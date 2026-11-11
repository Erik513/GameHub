import { useTranslation } from "react-i18next";

interface ScoreboardTeam {
  readonly id: string;
  readonly name: string;
}

interface TabooScoreboardProps {
  activeTeamId?: string | undefined;
  scores: readonly number[];
  teams: readonly ScoreboardTeam[];
  winnerIds?: readonly string[];
}

/** Lists all teams below each other, most points first. Ties keep the playing order. */
export function TabooScoreboard({
  activeTeamId,
  scores,
  teams,
  winnerIds = [],
}: TabooScoreboardProps) {
  const { t } = useTranslation();
  const rows = teams
    .map((team, index) => ({ team, score: scores[index] ?? 0, index }))
    .sort((a, b) => b.score - a.score || a.index - b.index);

  return (
    <ol className="taboo-scoreboard" aria-label={t("tabooRound.standings")}>
      {rows.map(({ team, score }) => (
        <li
          aria-current={team.id === activeTeamId ? "true" : undefined}
          data-winner={winnerIds.includes(team.id) || undefined}
          key={team.id}
        >
          <span className="taboo-scoreboard__name">{team.name}</span>
          <span className="visually-hidden">: </span>
          <span className="taboo-scoreboard__score">{score}</span>
        </li>
      ))}
    </ol>
  );
}
