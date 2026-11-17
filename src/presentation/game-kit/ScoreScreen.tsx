import type { ReactNode } from "react";
import { Confetti } from "./Confetti";
import { Scoreboard } from "./Scoreboard";
import { SetupTabs } from "./SetupTabs";
import { StartBar } from "./StartBar";

interface ScoreScreenProps {
  /** The buttons of the start bar at the bottom; the main action is the last one. */
  readonly actions: ReactNode;
  /** Accessible name of the whole screen. */
  readonly ariaLabel: string;
  /** More content below the standings, for example a message or the results of a tiebreak. */
  readonly children?: ReactNode;
  /** A shower of confetti over the screen, for the final screen of a game that has a winner. */
  readonly celebrate?: boolean;
  /** A small heading above everything, for example "Round 2 of 3". */
  readonly eyebrow?: string;
  /**
   * A second tab next to the standings or results, for example the cards of the turn that just ended.
   * Without it everything shares one box.
   */
  readonly extraTab?: { readonly content: ReactNode; readonly label: string };
  /** Opens the `extraTab` first, for example the tiebreak that decided the game. */
  readonly extraTabFirst?: boolean;
  /** The name of the first tab when there is an `extraTab` (default: the title of the standings). */
  readonly tabLabel?: string;
  /** Text or messages between the eyebrow and the standings. */
  readonly intro?: ReactNode;
  /** A thin progress bar above the eyebrow, for example the turns played of all turns. */
  readonly progress?: { readonly max: number; readonly value: number };
  /** Stacks several actions below each other. */
  readonly stackedActions?: boolean;
  readonly standings?: {
    /** The points of the turn that just ended, by team (see `Scoreboard`). */
    readonly gains?: readonly (number | undefined)[];
    readonly scores: readonly number[];
    readonly teams: readonly { readonly id: string; readonly name: string }[];
    readonly title: string;
    /** The name of the first tab when there is an `extraTab`, for example "Scores". */
    readonly tabLabel?: string;
    readonly winnerIds?: readonly string[];
  };
  /** The winner block of the final screen. */
  readonly winner?: { readonly label: string; readonly names: string };
}

/**
 * The screens between and after the turns of every game: the standings during the game and the
 * final standings at the end. Like every screen it is one page: the content scrolls inside its box
 * (or its tab), the main action sits in the start bar at the bottom.
 */
export function ScoreScreen({
  actions,
  ariaLabel,
  celebrate = false,
  children,
  eyebrow,
  extraTab,
  extraTabFirst = false,
  intro,
  progress,
  stackedActions = false,
  standings,
  tabLabel,
  winner,
}: ScoreScreenProps) {
  const board = standings && (
    <Scoreboard
      label={standings.title}
      {...(standings.gains ? { gains: standings.gains } : {})}
      scores={standings.scores}
      teams={standings.teams}
      {...(standings.winnerIds ? { winnerIds: standings.winnerIds } : {})}
    />
  );

  return (
    <section aria-label={ariaLabel} className="kit-score-screen kit-onepage">
      {celebrate && <Confetti />}
      {progress && (
        <div
          aria-label={eyebrow ?? ariaLabel}
          aria-valuemax={progress.max}
          aria-valuemin={0}
          aria-valuenow={progress.value}
          className="kit-progress"
          role="progressbar"
        >
          <span style={{ width: `${Math.min(100, (progress.value / progress.max) * 100)}%` }} />
        </div>
      )}
      {eyebrow && <p className="kit-score-screen__eyebrow">{eyebrow}</p>}
      {winner && (
        <div className="kit-winner" role="status">
          <span>{winner.label}</span>
          <span className="visually-hidden">: </span>
          <strong>{winner.names}</strong>
        </div>
      )}
      {intro}
      {extraTab ? (
        <SetupTabs
          ariaLabel={tabLabel ?? standings?.title ?? ariaLabel}
          initial={extraTabFirst ? "extra" : "standings"}
          tabs={[
            {
              id: "standings",
              label: tabLabel ?? standings?.tabLabel ?? standings?.title ?? ariaLabel,
              content: (
                <>
                  {board}
                  {children}
                </>
              ),
            },
            { id: "extra", label: extraTab.label, content: extraTab.content },
          ]}
        />
      ) : (
        <div className="kit-score-box">
          {standings && <h2>{standings.title}</h2>}
          {board}
          {children}
        </div>
      )}
      <StartBar stacked={stackedActions}>{actions}</StartBar>
    </section>
  );
}
