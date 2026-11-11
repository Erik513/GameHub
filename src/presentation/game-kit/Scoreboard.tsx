interface ScoreboardEntry {
  readonly id: string;
  readonly name: string;
}

interface ScoreboardProps {
  /** Accessible name of the list. */
  readonly label: string;
  readonly scores: readonly number[];
  readonly teams: readonly ScoreboardEntry[];
  readonly winnerIds?: readonly string[];
}

/** Lists all teams below each other, most points first. Ties keep the playing order. */
export function Scoreboard({ label, scores, teams, winnerIds = [] }: ScoreboardProps) {
  const rows = teams
    .map((team, index) => ({ team, score: scores[index] ?? 0, index }))
    .sort((a, b) => b.score - a.score || a.index - b.index);

  return (
    <ol className="kit-scoreboard" aria-label={label}>
      {rows.map(({ team, score }) => (
        <li data-winner={winnerIds.includes(team.id) || undefined} key={team.id}>
          <span className="kit-scoreboard__name">{team.name}</span>
          <span className="visually-hidden">: </span>
          <span className="kit-scoreboard__score">{score}</span>
        </li>
      ))}
    </ol>
  );
}
