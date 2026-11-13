import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Difficulty, TabooCard } from "../../business/games/taboo/model";
import {
  getRaceNextTeam,
  rankRaceAttempts,
  transitionRace,
  type RaceEvent,
  type RaceState,
} from "../../business/games/taboo/race";
import { pickRaceCards, pickRaceReplacement } from "../../business/games/taboo/raceCards";
import { Button, StatusMessage } from "../components";
import { useGameExit } from "../GameChrome";
import { ScoreScreen, TurnStrip } from "../game-kit";
import { TabooAttemptReviews } from "./TabooAttemptReviews";
import { TabooRaceResults, type RaceRow } from "./TabooRaceResults";
import { TabooRaceRun } from "./TabooRaceRun";

interface Clock {
  readonly pausedAt?: number | undefined;
  readonly pausedMs: number;
  readonly startedAt: number;
}

interface TabooRaceGameProps {
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
 * The whole game of the mode "Auf Zeit": overview before every run, the run with the stopwatch and
 * the final times. The rules are in `race.ts`; this view only drives them with the clock.
 */
export function TabooRaceGame({
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
  const [noCards, setNoCards] = useState(false);
  const { configuration } = state;
  const running = state.status === "running" ? state : undefined;

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

  useGameExit(
    true,
    onExit,
    running && clock ? { paused: clock.pausedAt !== undefined, onToggle: togglePause } : undefined,
  );

  function beginRun() {
    const cards = pickRaceCards(
      pool,
      configuration.target,
      new Set(state.usedCardIds),
      new Set(),
      Math.random,
      difficulties,
    );
    const next = cards ? transitionRace(state, { type: "beginRun", cards }) : state;
    if (next === state) {
      setNoCards(true);
      return;
    }
    setNoCards(false);
    setClock({ pausedMs: 0, startedAt: Date.now() });
    setState(next);
  }

  const teamName = (index: number) => configuration.teams[index]?.name ?? "";
  // Skipping and a forbidden word need a new card of the same difficulty, so the mix stays fair.
  const onTable = running?.active.cards[running.active.solved];
  const canReplace =
    onTable === undefined ||
    pickRaceReplacement(pool, onTable, new Set(state.usedCardIds), new Set()) !== undefined;

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
          pickRaceReplacement(pool, card, new Set(state.usedCardIds), new Set())
        }
        startedAt={clock.startedAt}
        target={configuration.target}
        teamName={teamName(running.active.teamIndex)}
      />
    );
  }

  // A wrong result can be fixed after every run and on the final screen.
  const reviews = (
    <TabooAttemptReviews
      attempts={state.attempts.map((attempt) => ({
        id: String(attempt.teamIndex),
        maxCorrect: configuration.target,
        results: attempt.results,
        teamIndex: attempt.teamIndex,
        teamName: teamName(attempt.teamIndex),
      }))}
      onRevise={(teamIndex, cardId, outcome) =>
        dispatch({ type: "reviseRunResult", teamIndex, cardId, outcome })
      }
    />
  );

  if (state.status === "finished") {
    const winners = state.winnerIds;
    const rows: RaceRow[] = rankRaceAttempts(state.attempts).map((attempt) => {
      const team = configuration.teams[attempt.teamIndex];
      return {
        id: team?.id ?? String(attempt.teamIndex),
        name: team?.name ?? "",
        timeMs: attempt.timeMs,
        solved: attempt.solved,
        total: configuration.target,
        winner: team ? winners.includes(team.id) : false,
      };
    });
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
        eyebrow={t("tabooResult.title")}
        stackedActions
        winner={{
          label: t(winners.length === 1 ? "tabooResult.winner" : "tabooResult.tie"),
          names: configuration.teams
            .filter((team) => winners.includes(team.id))
            .map((team) => team.name)
            .join(", "),
        }}
      >
        <h2>{t("tabooRace.finalTimes")}</h2>
        <TabooRaceResults label={t("tabooRace.finalTimes")} rows={rows} />
        {reviews}
      </ScoreScreen>
    );
  }

  const next = getRaceNextTeam(state);
  const rows: RaceRow[] = configuration.teams.map((team, index) => {
    const attempt = state.attempts.find((candidate) => candidate.teamIndex === index);
    return {
      id: team.id,
      name: team.name,
      ...(attempt
        ? { timeMs: attempt.timeMs, solved: attempt.solved, total: configuration.target }
        : {}),
    };
  });

  return (
    <ScoreScreen
      actions={
        <>
          <TurnStrip
            hiddenLabel={t("tabooRound.upNext")}
            name={next === undefined ? "" : teamName(next)}
          />
          <Button variant="success" onClick={beginRun}>
            {t("tabooRace.start")}
          </Button>
        </>
      }
      ariaLabel={t("tabooRace.overview")}
      eyebrow={t("tabooRace.title")}
      intro={<p>{t("tabooRace.intro", { count: configuration.target })}</p>}
    >
      <h2>{t("tabooRace.times")}</h2>
      <TabooRaceResults label={t("tabooRace.times")} rows={rows} />
      {reviews}
      {noCards && (
        <StatusMessage title={t("tabooRound.empty")} tone="error">
          {t("tabooRace.noCards")}
        </StatusMessage>
      )}
    </ScoreScreen>
  );
}
