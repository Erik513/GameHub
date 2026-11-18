import { useMemo, useState } from "react";
import type { TabooCard } from "../../business/games/taboo/model";
import {
  racePlayedCardIds,
  transitionRace,
  type RaceEvent,
  type RaceState,
} from "../../business/games/taboo/race";
import type { TabooOutcome } from "../../business/games/taboo/stateMachine";
import { pickTiebreakCard, pickTiebreakCards } from "../../business/games/taboo/tiebreakCards";
import { TabooTiebreakOverview } from "./TabooTiebreakOverview";
import { TabooTiebreakRound } from "./TabooTiebreakRound";
import { TabooTiebreakWrapUp } from "./TabooTiebreakWrapUp";

/** The clock of the attempt that is going on: when it started and how long it was paused. */
export interface TiebreakClock {
  readonly pausedAt?: number | undefined;
  readonly pausedMs: number;
  readonly startedAt: number;
}

interface TabooRaceTiebreakProps {
  /** Every card the game knows; the tiebreak takes its cards of the card language from here. */
  cards: readonly TabooCard[];
  clock: TiebreakClock | undefined;
  dispatch: (event: RaceEvent) => void;
  /** Gives the game up and returns to the main menu. */
  onEndGame: () => void;
  /** Back to the main menu with an empty setup (offered when the cards are not enough). */
  onNewSetup: () => void;
  onResume: () => void;
  /** Goes on to the final screen. */
  onShowResult: () => void;
  /** Starts the clock of a new attempt. */
  onStartClock: () => void;
  /** The cards of the runs of the game; they are the first choice for the tiebreak, too. */
  pool: readonly TabooCard[];
  state: Extract<RaceState, { status: "tiebreak" | "finished" }>;
}

/**
 * The screens of the tiebreak of a tied race: the overview between the attempts, an attempt with its
 * clock, and after the last attempt a look at its cards before the final screen. The rules are in
 * `tiebreak.ts`; the screens are the same as in the classic mode.
 */
export function TabooRaceTiebreak({
  cards,
  clock,
  dispatch,
  onEndGame,
  onNewSetup,
  onResume,
  onShowResult,
  onStartClock,
  pool,
  state,
}: TabooRaceTiebreakProps) {
  const [noCards, setNoCards] = useState(false);
  const { configuration } = state;

  // All cards of the card language are available for the tiebreak, whatever the filters were.
  const available = useMemo(() => {
    const unique = new Map<string, TabooCard>();
    for (const card of [...pool, ...cards]) {
      if (card.language === configuration.cardLanguage) unique.set(card.id, card);
    }
    return [...unique.values()];
  }, [cards, configuration.cardLanguage, pool]);

  const revise = (teamIndex: number, cardId: string, outcome: TabooOutcome) =>
    dispatch({ type: "reviseTiebreakResult", teamIndex, cardId, outcome });

  if (state.status === "finished") {
    // After the last attempt, before the final screen.
    return <TabooTiebreakWrapUp finished={state} onRevise={revise} onShow={onShowResult} />;
  }

  const part = state.tiebreak;
  const played = racePlayedCardIds(state);

  if (part.active && clock) {
    return (
      <TabooTiebreakRound
        active={part.active}
        dispatch={dispatch}
        onEndGame={onEndGame}
        onResume={onResume}
        pausedAt={clock.pausedAt}
        pausedMs={clock.pausedMs}
        pickReplacement={(card) =>
          pickTiebreakCard(available, card.difficulty, new Set(part.usedCardIds), played)
        }
        startedAt={clock.startedAt}
        teamName={configuration.teams[part.active.teamIndex]?.name ?? ""}
      />
    );
  }

  function begin() {
    const picked = pickTiebreakCards(available, new Set(part.usedCardIds), played);
    // The rules decide whether the cards fit; the screen never starts an attempt they refuse.
    const event: RaceEvent = { type: "beginTiebreakAttempt", cards: picked ?? [] };
    if (!picked || transitionRace(state, event) === state) {
      setNoCards(true);
      return;
    }
    setNoCards(false);
    onStartClock();
    dispatch(event);
  }

  return (
    <TabooTiebreakOverview
      noCards={noCards}
      onBegin={begin}
      onNewSetup={onNewSetup}
      onRevise={revise}
      state={{ configuration, ...part }}
    />
  );
}
