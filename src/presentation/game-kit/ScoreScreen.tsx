import type { ReactNode } from "react";
import { Scoreboard } from "./Scoreboard";
import { StartBar } from "./StartBar";

interface ScoreScreenProps {
  /** The buttons of the start bar at the bottom; the main action is the last one. */
  readonly actions: ReactNode;
  /** Accessible name of the whole screen. */
  readonly ariaLabel: string;
  /** More content below the standings, for example a review of the last turn. */
  readonly children?: ReactNode;
  /** A small heading above everything, for example "Round 2 of 3". */
  readonly eyebrow?: string;
  /** Text or messages between the eyebrow and the standings. */
  readonly intro?: ReactNode;
  /** Stacks several actions below each other. */
  readonly stackedActions?: boolean;
  readonly standings?: {
    readonly scores: readonly number[];
    readonly teams: readonly { readonly id: string; readonly name: string }[];
    readonly title: string;
    readonly winnerIds?: readonly string[];
  };
  /** The winner block of the final screen. */
  readonly winner?: { readonly label: string; readonly names: string };
}

/**
 * The screens between and after the turns of every game: the standings during the game and the
 * final standings at the end. The main action sits in the start bar at the bottom.
 */
export function ScoreScreen({
  actions,
  ariaLabel,
  children,
  eyebrow,
  intro,
  stackedActions = false,
  standings,
  winner,
}: ScoreScreenProps) {
  return (
    <section aria-label={ariaLabel} className="kit-score-screen">
      {eyebrow && <p className="kit-score-screen__eyebrow">{eyebrow}</p>}
      {winner && (
        <div className="kit-winner" role="status">
          <span>{winner.label}</span>
          <span className="visually-hidden">: </span>
          <strong>{winner.names}</strong>
        </div>
      )}
      {intro}
      {standings && (
        <>
          <h2>{standings.title}</h2>
          <Scoreboard
            label={standings.title}
            scores={standings.scores}
            teams={standings.teams}
            {...(standings.winnerIds ? { winnerIds: standings.winnerIds } : {})}
          />
        </>
      )}
      {children}
      <StartBar stacked={stackedActions}>{actions}</StartBar>
    </section>
  );
}
