import { useMemo, useState } from "react";
import type { TabooCard } from "../../business/games/taboo/model";
import {
  transitionTaboo,
  type TabooEvent,
  type TabooOutcome,
  type TabooState,
} from "../../business/games/taboo/stateMachine";
import { pickTiebreakCard, pickTiebreakCards } from "../../business/games/taboo/tiebreakCards";
import type { SupportedLanguage } from "../../i18n";
import { monotonicNow } from "../monotonicClock";

/** The running game as the container keeps it. */
export interface ActiveGame {
  readonly deadline: number;
  readonly pausedAt?: number | undefined;
  readonly pausedMs?: number;
  /** Tiebreak stopwatch: start of the attempt and total time spent paused. */
  readonly startedAt?: number;
  readonly state: TabooState;
}

interface TiebreakInput {
  /** All known cards; the tiebreak uses the ones of the card language, whatever the filters. */
  cards: readonly TabooCard[];
  cardLanguage: SupportedLanguage;
  /** The cards of the running game, so the tiebreak can use them, too. */
  deck: readonly TabooCard[] | undefined;
  dispatch: (event: TabooEvent) => void;
  round: ActiveGame | undefined;
  setRound: (round: ActiveGame) => void;
}

/** The parts of a tiebreak that need the cards: start an attempt, replace a card, fix a result. */
export function useTabooTiebreak({
  cards,
  cardLanguage,
  deck,
  dispatch,
  round,
  setRound,
}: TiebreakInput) {
  const [noCards, setNoCards] = useState(false);
  const language = round?.state.configuration.cardLanguage ?? cardLanguage;

  // All cards of the card language are available for the tiebreak, independent of the filters.
  const pool = useMemo(() => {
    const unique = new Map<string, TabooCard>();
    for (const card of [...(deck ?? []), ...cards]) {
      if (card.language === language) unique.set(card.id, card);
    }
    return [...unique.values()];
  }, [cards, deck, language]);

  function begin() {
    if (round?.state.status !== "tiebreak") return;
    const picked = pickTiebreakCards(
      pool,
      new Set(round.state.usedCardIds),
      new Set(round.state.resolvedCardIds),
    );
    const state = picked
      ? transitionTaboo(round.state, { type: "beginTiebreakAttempt", cards: picked })
      : round.state;
    if (state === round.state) {
      setNoCards(true);
      return;
    }
    setNoCards(false);
    setRound({ state, deadline: 0, startedAt: monotonicNow(), pausedMs: 0 });
  }

  /** A card of the same difficulty that was not used yet, for a skip or a forbidden word. */
  function pickReplacement(card: TabooCard) {
    if (round?.state.status !== "tiebreak") return undefined;
    return pickTiebreakCard(
      pool,
      card.difficulty,
      new Set(round.state.usedCardIds),
      new Set(round.state.resolvedCardIds),
    );
  }

  function revise(teamIndex: number, cardId: string, outcome: TabooOutcome) {
    dispatch({ type: "reviseTiebreakResult", teamIndex, cardId, outcome });
  }

  return { begin, noCards, pickReplacement, revise };
}
