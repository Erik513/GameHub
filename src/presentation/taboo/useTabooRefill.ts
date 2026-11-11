import { useCallback, useEffect, useRef, useState } from "react";
import type { Difficulty, TabooCard } from "../../business/games/taboo/model";
import type { TabooEvent, TabooState } from "../../business/games/taboo/stateMachine";
import { shuffle } from "../../business/shared/shuffle";
import type { SupportedLanguage } from "../../i18n";
import { generateHiddenCards, type TabooGenerators } from "./TabooGeneration";
import { maxCardsPerRequest, refillThreshold } from "./tabooSetupModel";

export interface RefillPlan {
  readonly categories: readonly string[];
  /** Difficulties the player allowed; the refill cycles through them. */
  readonly difficulties: readonly Difficulty[];
  readonly language: SupportedLanguage;
}

interface RefillState {
  added: TabooCard[];
  attempts: Map<string, number>;
  busy: boolean;
  counter: number;
}

const freshState = (): RefillState => ({ added: [], attempts: new Map(), busy: false, counter: 0 });

interface RefillOptions {
  readonly cards: readonly TabooCard[];
  readonly deck: readonly TabooCard[] | undefined;
  readonly dispatch: (event: TabooEvent) => void;
  readonly generators: TabooGenerators | undefined;
  readonly running: Extract<TabooState, { status: "roundRunning" }> | undefined;
}

/**
 * Adds generated cards to a running round in the background so the deck cannot run dry.
 * Returns controls to start a new game (`configure`) and to forget the current one (`reset`).
 */
export function useTabooRefill({ cards, deck, dispatch, generators, running }: RefillOptions) {
  const plan = useRef<RefillPlan | undefined>(undefined);
  const state = useRef<RefillState>(freshState());
  const controller = useRef<AbortController | undefined>(undefined);
  const [tick, setTick] = useState(0);
  useEffect(() => () => controller.current?.abort(), []);

  const reset = useCallback(() => {
    controller.current?.abort();
    state.current = freshState();
  }, []);
  const configure = useCallback((next: RefillPlan | undefined) => {
    plan.current = next;
    state.current = freshState();
  }, []);

  useEffect(() => {
    const current = plan.current;
    const control = state.current;
    if (!generators || !current || !running || control.busy) return;
    if (running.remainingCards.length > refillThreshold) return;
    const { turn } = running;
    const turnKey = `${turn.round}:${turn.teamIndex}`;
    if ((control.attempts.get(turnKey) ?? 0) >= current.categories.length) return;
    const index = control.counter;
    control.counter = index + 1;
    const request = {
      language: current.language,
      categoryId: current.categories[index % current.categories.length] ?? "everyday",
      difficulty: current.difficulties[index % current.difficulties.length] ?? "easy",
      count: maxCardsPerRequest,
    };
    const abort = new AbortController();
    controller.current = abort;
    control.busy = true;
    void generateHiddenCards(
      generators,
      [request],
      [...cards, ...(deck ?? []), ...control.added],
      abort.signal,
    )
      .catch(() => [] as readonly TabooCard[])
      .then((generated) => {
        control.busy = false;
        if (abort.signal.aborted) return;
        const additions = shuffle(generated);
        control.added.push(...additions);
        control.attempts.set(
          turnKey,
          additions.length > 0 ? 0 : (control.attempts.get(turnKey) ?? 0) + 1,
        );
        // Re-render so the effect can request further batches if the deck is still short.
        dispatch({ type: "addCards", turn, cards: additions });
        setTick((value) => value + 1);
      });
  }, [cards, deck, dispatch, generators, running, tick]);

  return { configure, reset };
}
