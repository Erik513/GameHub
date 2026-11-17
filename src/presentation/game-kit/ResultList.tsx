import { Icon } from "../components";

export interface ResultRow {
  readonly id: string;
  readonly name: string;
  /** Length of the bar from 0 to 1; without it the row has no bar. */
  readonly bar?: number;
  /** A small text before the value, for example "4/5 cards". */
  readonly note?: string;
  /** The rank (1 is the best); without it the row shows an empty badge, for a result still to come. */
  readonly rank?: number;
  /** The result in large letters, for example "12.3 s"; without it `pendingLabel` is shown. */
  readonly value?: string;
  /** Rows of the winners get a green frame. */
  readonly winner?: boolean;
}

interface ResultListProps {
  /** Accessible name of the list. */
  readonly label: string;
  /** What is shown for a row without a value, for example "still to play". */
  readonly pendingLabel: string;
  readonly rows: readonly ResultRow[];
}

/**
 * Results that are no points, for example the times of a race: the same rows as the scoreboard (bar,
 * rank with a crown for the best, name), but with a result text instead of a number.
 */
export function ResultList({ label, pendingLabel, rows }: ResultListProps) {
  return (
    <ol className="kit-scoreboard" aria-label={label}>
      {rows.map(({ bar, id, name, note, rank, value, winner }) => (
        <li
          data-rank={rank === undefined ? undefined : Math.min(rank, 4)}
          data-winner={winner ? true : undefined}
          key={id}
        >
          {bar !== undefined && (
            <span
              aria-hidden="true"
              className="kit-scoreboard__bar"
              style={{ width: `${Math.max(0, Math.min(1, bar)) * 100}%` }}
            />
          )}
          <span aria-hidden="true" className="kit-scoreboard__rank" data-empty={rank === undefined}>
            {rank === 1 ? <Icon name="crown" /> : rank}
          </span>
          <span className="kit-scoreboard__name">{name}</span>
          <span className="visually-hidden">: </span>
          <span className="kit-scoreboard__score" data-pending={value === undefined || undefined}>
            {note && (
              <>
                <small className="kit-scoreboard__note">{note}</small>
                <span className="visually-hidden"> · </span>
              </>
            )}
            {value ?? pendingLabel}
          </span>
        </li>
      ))}
    </ol>
  );
}
