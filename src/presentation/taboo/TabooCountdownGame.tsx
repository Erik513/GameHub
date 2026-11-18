import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  countdownRemainingTeams,
  countdownTeamAfter,
  transitionCountdown,
  type CountdownEvent,
  type CountdownState,
} from "../../business/games/taboo/countdown";
import {
  countdownDifficultyForTurn,
  pickCountdownCard,
} from "../../business/games/taboo/countdownCards";
import type { Difficulty, TabooCard } from "../../business/games/taboo/model";
import { Button, Toast, useNotice } from "../components";
import { useGameExit } from "../GameChrome";
import { ScoreScreen, TurnStrip } from "../game-kit";
import { TabooCountdownResults } from "./TabooCountdownResults";
import { TabooCountdownRun } from "./TabooCountdownRun";

interface Clock {
  readonly pausedAt?: number | undefined;
  readonly pausedMs: number;
  readonly startedAt: number;
}

interface TabooCountdownGameProps {
  /** The difficulties of the game; every team gets the same difficulty in its n-th turn. */
  difficulties: readonly Difficulty[];
  /** The game as it was set up, in the overview before the first turn. */
  initial: CountdownState;
  /** Leaves the game and returns to the main menu with the setup still filled in. */
  onExit: () => void;
  onNewSetup: () => void;
  onSameSetup: () => void;
  /** All cards the turns can take; a card may come back when the game lasts longer than the cards. */
  pool: readonly TabooCard[];
}

/**
 * The whole game of the mode "Gegen die Zeit": an overview of the time accounts before every turn,
 * the turn with the account running down, and the final ranking. The rules are in `countdown.ts`;
 * this view only drives them with the clock.
 */
export function TabooCountdownGame({
  difficulties,
  initial,
  onExit,
  onNewSetup,
  onSameSetup,
  pool,
}: TabooCountdownGameProps) {
  const { t } = useTranslation();
  const [state, setState] = useState<CountdownState>(initial);
  const [clock, setClock] = useState<Clock>();
  const [noCards, notifyNoCards] = useNotice<true>();
  const [dropped, notifyDropped] = useNotice<string>();
  // The latest state, so events that follow each other quickly always build on the one before.
  const latest = useRef(initial);
  const { configuration } = state;
  const running = state.status === "running" ? state : undefined;

  /** Plays an event; with the automatic change of teams it brings the card of the next team along. */
  function dispatch(event: CountdownEvent) {
    const current = latest.current;
    let sent = event;
    const endsTurn =
      event.type === "timeUp" || (event.type === "answerCard" && event.outcome === "correct");
    if (current.configuration.autoSwitch === true && current.status === "running" && endsTurn) {
      const after = countdownTeamAfter(current);
      const account = after === undefined ? undefined : current.teams[after];
      const card =
        account &&
        pickCountdownCard(
          pool,
          countdownDifficultyForTurn(account.turns, difficulties),
          new Set(),
          new Set(current.usedCardIds),
        );
      if (card) sent = { ...event, nextCard: card };
    }
    const next = transitionCountdown(current, sent);
    if (next === current) return;
    latest.current = next;
    setState(next);
    // The next team starts at once: its clock begins when the turn before ended.
    if (next.status === "running" && current.status === "running") {
      if (next.active.teamIndex !== current.active.teamIndex) {
        setClock({ pausedMs: 0, startedAt: Date.now() });
      }
    }
    // A team that dropped out while the game goes on is announced; the final screen tells the rest.
    if (
      next.status !== "finished" &&
      next.eliminationOrder.length > current.eliminationOrder.length
    ) {
      const out = next.eliminationOrder.at(-1);
      notifyDropped(out === undefined ? "" : (next.configuration.teams[out]?.name ?? ""));
    }
  }

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

  const played = new Set(state.usedCardIds);
  const teamName = (index: number) => configuration.teams[index]?.name ?? "";

  function beginTurn() {
    const account = state.teams[state.teamIndex];
    const difficulty = countdownDifficultyForTurn(account?.turns ?? 0, difficulties);
    const card = pickCountdownCard(pool, difficulty, new Set(), played);
    const next = card ? transitionCountdown(state, { type: "beginTurn", card }) : state;
    if (next === state) {
      notifyNoCards(true);
      return;
    }
    setClock({ pausedMs: 0, startedAt: Date.now() });
    latest.current = next;
    setState(next);
  }

  if (running && clock) {
    const { active } = running;
    const account = running.teams[active.teamIndex];
    return (
      <>
        <TabooCountdownRun
          active={active}
          budgetMs={configuration.budgetMs}
          dispatch={dispatch}
          key={`${active.teamIndex}-${account?.turns ?? 0}`}
          onEndGame={onExit}
          onResume={togglePause}
          pausedAt={clock.pausedAt}
          pausedMs={clock.pausedMs}
          pickReplacement={(card) =>
            pickCountdownCard(pool, card.difficulty, new Set([card.id]), played)
          }
          remainingAtStartMs={account?.remainingMs ?? 0}
          skipUsed={account?.skipUsed ?? false}
          startedAt={clock.startedAt}
          teamName={teamName(active.teamIndex)}
          {...(configuration.autoSwitch === true
            ? {
                teams: configuration.teams.map((team, index) => ({
                  eliminated: running.teams[index]?.eliminated ?? false,
                  id: team.id,
                  name: team.name,
                  remainingMs: running.teams[index]?.remainingMs ?? 0,
                })),
              }
            : {})}
        />
        {dropped && (
          <Toast key={dropped.id} tone="info">
            {t("tabooCountdown.dropped", { team: dropped.value })}
          </Toast>
        )}
      </>
    );
  }

  if (state.status === "finished") {
    const winners = state.winnerIds;
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
        stackedActions
        winner={{
          label: t("tabooResult.winner"),
          names: configuration.teams
            .filter((team) => winners.includes(team.id))
            .map((team) => team.name)
            .join(", "),
        }}
      >
        <h2>{t("tabooCountdown.finalRanking")}</h2>
        <TabooCountdownResults
          label={t("tabooCountdown.finalRanking")}
          state={state}
          winnerIds={winners}
        />
      </ScoreScreen>
    );
  }

  const inGame = countdownRemainingTeams(state).length;
  return (
    <ScoreScreen
      actions={
        <>
          <TurnStrip hiddenLabel={t("tabooRound.upNext")} name={teamName(state.teamIndex)} />
          <Button variant="success" onClick={beginTurn}>
            {t("tabooCountdown.start")}
          </Button>
        </>
      }
      ariaLabel={t("tabooCountdown.overview")}
      eyebrow={t("tabooCountdown.inGame", { count: inGame })}
    >
      <h2>{t("tabooCountdown.accounts")}</h2>
      <TabooCountdownResults label={t("tabooCountdown.accounts")} state={state} />
      {noCards && (
        <Toast key={noCards.id} title={t("tabooRound.empty")} tone="error">
          {t("tabooCountdown.noCards")}
        </Toast>
      )}
    </ScoreScreen>
  );
}
