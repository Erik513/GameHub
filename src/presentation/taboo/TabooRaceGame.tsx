import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Difficulty, TabooCard } from "../../business/games/taboo/model";
import {
  comparableRaceTotals,
  getRaceTurn,
  racePlayedCardIds,
  raceRounds,
  raceTiebreakFollows,
  raceTotals,
  transitionRace,
  type RaceEvent,
  type RaceState,
} from "../../business/games/taboo/race";
import { pickRaceCards, pickRaceReplacement } from "../../business/games/taboo/raceCards";
import { Button, Toast, useNotice } from "../components";
import { useGameExit } from "../GameChrome";
import { ScoreScreen, TurnStrip } from "../game-kit";
import { TabooAttemptReviews } from "./TabooAttemptReviews";
import { TabooRaceResults, type RaceRow } from "./TabooRaceResults";
import { TabooRaceRun } from "./TabooRaceRun";
import { TabooRaceTiebreak } from "./TabooRaceTiebreak";
import { TabooTiebreakResults } from "./TabooTiebreakResults";

interface Clock {
  readonly pausedAt?: number | undefined;
  readonly pausedMs: number;
  readonly startedAt: number;
}

interface TabooRaceGameProps {
  /** Every card the game knows; the tiebreak takes its cards of the card language from here. */
  cards: readonly TabooCard[];
  /** The difficulties of the game; every team gets the same mix of them. */
  difficulties: readonly Difficulty[];
  /** The game as it was set up, in the overview before the first run. */
  initial: RaceState;
  /** Leaves the game and returns to the main menu with the setup still filled in. */
  onExit: () => void;
  onNewSetup: () => void;
  onSameSetup: () => void;
  /** All cards the runs can take; a card is never used twice in a game. */
  pool: readonly TabooCard[];
}

/**
 * The whole game of the mode "Auf Zeit": overview before every run, the run with the stopwatch, the
 * tiebreak when the win is tied and the final total times. Every round each team plays one run. The
 * rules are in `race.ts` and `tiebreak.ts`; this view only drives them with the clock.
 */
export function TabooRaceGame({
  cards,
  difficulties,
  initial,
  onExit,
  onNewSetup,
  onSameSetup,
  pool,
}: TabooRaceGameProps) {
  const { t } = useTranslation();
  const [state, setState] = useState<RaceState>(initial);
  const [clock, setClock] = useState<Clock>();
  const [noCards, notifyNoCards] = useNotice<true>();
  const { configuration } = state;
  const running = state.status === "running" ? state : undefined;

  // The last run is checked on an overview first; the final screen shows only the result.
  const [resultShown, setResultShown] = useState(false);

  const dispatch = useCallback((event: RaceEvent) => {
    setState((current) => transitionRace(current, event));
  }, []);

  const togglePause = useCallback(() => {
    setClock((current) => {
      if (!current) return current;
      if (current.pausedAt === undefined) return { ...current, pausedAt: Date.now() };
      return {
        pausedMs: current.pausedMs + (Date.now() - current.pausedAt),
        startedAt: current.startedAt,
      };
    });
  }, []);

  // A run and a tiebreak attempt are timed, so both can be paused.
  const attemptGoing =
    running !== undefined || (state.status === "tiebreak" && state.tiebreak.active);
  useGameExit(
    true,
    onExit,
    attemptGoing && clock
      ? { paused: clock.pausedAt !== undefined, onToggle: togglePause }
      : undefined,
  );

  function beginRun() {
    const cards = pickRaceCards(
      pool,
      configuration.target,
      new Set(state.usedCardIds),
      racePlayedCardIds(state),
      Math.random,
      difficulties,
    );
    const next = cards ? transitionRace(state, { type: "beginRun", cards }) : state;
    if (next === state) {
      notifyNoCards(true);
      return;
    }
    setClock({ pausedMs: 0, startedAt: Date.now() });
    setState(next);
  }

  const teamName = (index: number) => configuration.teams[index]?.name ?? "";
  // Skipping and a forbidden word need a new card of the same difficulty, so the mix stays fair.
  const onTable = running?.active.cards[running.active.solved];
  const canReplace =
    onTable === undefined ||
    pickRaceReplacement(pool, onTable, new Set(state.usedCardIds), racePlayedCardIds(state)) !==
      undefined;

  if (running && clock) {
    return (
      <TabooRaceRun
        active={running.active}
        canReplace={canReplace}
        dispatch={dispatch}
        onResume={togglePause}
        pausedAt={clock.pausedAt}
        pausedMs={clock.pausedMs}
        pickReplacement={(card) =>
          pickRaceReplacement(pool, card, new Set(state.usedCardIds), racePlayedCardIds(state))
        }
        startedAt={clock.startedAt}
        target={configuration.target}
        teamName={teamName(running.active.teamIndex)}
      />
    );
  }

  // The tiebreak: its overview, its attempts and a look at the last one before the final screen.
  if (
    state.status === "tiebreak" ||
    (state.status === "finished" && state.tiebreak && !resultShown)
  ) {
    return (
      <TabooRaceTiebreak
        cards={cards}
        clock={clock}
        dispatch={dispatch}
        onNewSetup={onNewSetup}
        onResume={togglePause}
        onShowResult={() => setResultShown(true)}
        onStartClock={() => setClock({ pausedMs: 0, startedAt: Date.now() })}
        pool={pool}
        state={state}
      />
    );
  }

  // Only the run that was just played can be corrected (also the last one, before the final screen).
  const lastAttempt = state.attempts.at(-1);
  const reviewTab = lastAttempt
    ? {
        content: (
          <TabooAttemptReviews
            attempt={{
              id: `${lastAttempt.round}-${lastAttempt.teamIndex}`,
              maxCorrect: configuration.target,
              results: lastAttempt.results,
              teamIndex: lastAttempt.teamIndex,
              teamName: teamName(lastAttempt.teamIndex),
            }}
            onRevise={(teamIndex, cardId, outcome) =>
              dispatch({
                type: "reviseRunResult",
                teamIndex,
                round: lastAttempt.round,
                cardId,
                outcome,
              })
            }
            titleKey="tabooReview.runTitle"
          />
        ),
        label: t("tabooReview.lastRun", { count: lastAttempt.results.length }),
      }
    : undefined;

  const rounds = raceRounds(configuration);
  const totals = raceTotals(configuration, state.attempts);
  const ownRows = (ranked: ReadonlySet<number> | undefined): RaceRow[] =>
    configuration.teams.map((team, index) => {
      const total = totals[index];
      if (!total || total.runs === 0) return { id: team.id, name: team.name };
      const lastRun = state.attempts.filter((attempt) => attempt.teamIndex === index).at(-1);
      return {
        id: team.id,
        name: team.name,
        timeMs: total.tenths * 100,
        solved: total.solved,
        total: configuration.target * total.runs,
        ...(ranked ? { ranked: ranked.has(index) } : {}),
        // From the second run on the row also tells the time of the latest run.
        ...(total.runs > 1 && lastRun ? { lastTimeMs: lastRun.timeMs } : {}),
      };
    });

  if (state.status === "finished" && resultShown) {
    const winners = state.winnerIds;
    // The list puts the best total on top by itself.
    const rows = ownRows(undefined).map((row) => ({ ...row, winner: winners.includes(row.id) }));
    const finalTitle = t(rounds > 1 ? "tabooRace.finalTotalTimes" : "tabooRace.finalTimes");
    return (
      <ScoreScreen
        actions={
          <>
            <Button variant="success" onClick={onSameSetup}>
              {t("tabooResult.sameSetup")}
            </Button>
            <Button variant="secondary" onClick={onNewSetup}>
              {t("tabooResult.newSetup")}
            </Button>
          </>
        }
        ariaLabel={t("tabooResult.title")}
        celebrate
        eyebrow={t("tabooResult.title")}
        {...(state.tiebreak
          ? {
              extraTab: {
                content: (
                  <TabooTiebreakResults
                    rows={state.tiebreak.map((attempt) => {
                      const team = configuration.teams[attempt.teamIndex];
                      return {
                        id: team?.id ?? String(attempt.teamIndex),
                        name: team?.name ?? "",
                        result: { solved: attempt.solved, timeMs: attempt.timeMs },
                        winner: team ? winners.includes(team.id) : false,
                      };
                    })}
                  />
                ),
                label: t("tabooTiebreak.title"),
              },
              // The tiebreak decided the game, so its result is shown first.
              extraTabFirst: true,
              tabLabel: finalTitle,
            }
          : {})}
        stackedActions
        winner={{
          label: t(winners.length === 1 ? "tabooResult.winner" : "tabooResult.tie"),
          names: configuration.teams
            .filter((team) => winners.includes(team.id))
            .map((team) => team.name)
            .join(", "),
        }}
      >
        {!state.tiebreak && <h2>{finalTitle}</h2>}
        <TabooRaceResults label={finalTitle} rows={rows} />
      </ScoreScreen>
    );
  }

  const turn = getRaceTurn(state);
  // In the middle of a round only the teams that played the same number of runs are ranked.
  const comparable = new Set(comparableRaceTotals(totals).map((total) => total.teamIndex));
  const rows = ownRows(comparable);
  const timesLabel = t(rounds > 1 ? "tabooRace.totalTimes" : "tabooRace.times");
  const next = turn?.teamIndex;
  // With a tie at the top the game goes on with the tiebreak, so the button must not promise the result.
  const toTiebreak = raceTiebreakFollows(state);

  return (
    <ScoreScreen
      actions={
        <>
          {next === undefined ? (
            <Button
              variant="success"
              onClick={() =>
                toTiebreak ? dispatch({ type: "startTiebreak" }) : setResultShown(true)
              }
            >
              {t(toTiebreak ? "tabooTiebreak.start" : "tabooResult.show")}
            </Button>
          ) : (
            <>
              <TurnStrip hiddenLabel={t("tabooRound.upNext")} name={teamName(next)} />
              <Button variant="success" onClick={beginRun}>
                {t("tabooRace.start")}
              </Button>
            </>
          )}
        </>
      }
      ariaLabel={t("tabooRace.overview")}
      // Like the round overview of the classic mode: a thin progress bar (runs played of all runs)
      // and "Run n/m" above the box.
      eyebrow={
        turn === undefined
          ? t("tabooRound.allRoundsPlayed")
          : t("tabooRound.roundOf", { round: turn.round, total: rounds })
      }
      intro={toTiebreak ? <p>{t("tabooRound.tieNext")}</p> : undefined}
      progress={{ max: configuration.teams.length * rounds, value: state.attempts.length }}
      {...(reviewTab ? { extraTab: reviewTab, tabLabel: timesLabel } : {})}
    >
      {!reviewTab && <h2>{timesLabel}</h2>}
      <TabooRaceResults label={timesLabel} rows={rows} />
      {noCards && (
        <Toast key={noCards.id} title={t("tabooRound.empty")} tone="error">
          {t("tabooRace.noCards")}
        </Toast>
      )}
    </ScoreScreen>
  );
}
