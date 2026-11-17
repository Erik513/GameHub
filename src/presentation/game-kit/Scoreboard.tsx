import { Icon } from "../components";

interface ScoreboardEntry {
  readonly id: string;
  readonly name: string;
}

interface ScoreboardProps {
  /** Accessible name of the list. */
  readonly label: string;
  /** The points a team got in the turn that just ended, by team; a missing entry shows nothing. */
  readonly gains?: readonly (number | undefined)[];
  readonly scores: readonly number[];
  readonly teams: readonly ScoreboardEntry[];
  readonly winnerIds?: readonly string[];
}

/**
 * Lists all teams below each other, most points first (ties keep the playing order). Every row has
 * a bar that is as long as the points compared to the leader, a rank (the leader gets a crown) and
 * the points in large numbers; a team that just played shows what it got in that turn (+3).
 */
export function Scoreboard({ gains = [], label, scores, teams, winnerIds = [] }: ScoreboardProps) {
  const rows = teams
    .map((team, index) => ({ team, score: scores[index] ?? 0, gain: gains[index], index }))
    .sort((a, b) => b.score - a.score || a.index - b.index);
  const top = rows[0]?.score ?? 0;

  return (
    <ol className="kit-scoreboard" aria-label={label}>
      {rows.map(({ team, score, gain }) => {
        // Equal points share a rank.
        const rank = 1 + rows.filter((row) => row.score > score).length;
        const leads = rank === 1 && top > 0;
        return (
          <li
            data-rank={Math.min(rank, 4)}
            data-winner={winnerIds.includes(team.id) || undefined}
            key={team.id}
          >
            <span
              aria-hidden="true"
              className="kit-scoreboard__bar"
              style={{ width: `${top > 0 ? (score / top) * 100 : 0}%` }}
            />
            <span aria-hidden="true" className="kit-scoreboard__rank">
              {leads ? <Icon name="crown" /> : rank}
            </span>
            <span className="kit-scoreboard__name">{team.name}</span>
            <span className="visually-hidden">: </span>
            <span className="kit-scoreboard__score">
              {gain !== undefined && (
                <small className="kit-scoreboard__gain" data-zero={gain === 0 || undefined}>
                  +{gain}
                </small>
              )}
              {score}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
