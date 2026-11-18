import { useEffect, useRef, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { planGenerationRequests } from "../../business/games/taboo/cardPlan";
import { buildDeck } from "../../business/games/taboo/deck";
import type { TabooCard, ValidationIssue } from "../../business/games/taboo/model";
import { tabooLineup } from "../../business/games/taboo/lineup";
import { resolveLineup, validateLineup, type LineupIssue } from "../../business/shared/lineup";
import { hasTeamSetupContent } from "../../business/shared/savedTeamSetup";
import { shuffle } from "../../business/shared/shuffle";
import { buildTeams, type TeamSetupValue } from "../../business/shared/teamSetup";
import type { SupportedLanguage } from "../../i18n";
import { useTeamSetupMemory } from "../game-kit";
import { generateHiddenCards, type TabooGenerators } from "./TabooGeneration";
import {
  cardShortageFor,
  planTabooStart,
  type CardShortage,
  type TabooCountdownSession,
  type TabooRaceSession,
} from "./tabooStartPlan";
import type { TabooSettings } from "./tabooSetupModel";
import type { TabooClassicGame } from "./useTabooClassicGame";

interface StartOptions {
  readonly cardLanguage: SupportedLanguage;
  readonly cards: readonly TabooCard[];
  /** Every category of the card language; choosing all of them means no filter. */
  readonly categoryIds: readonly string[];
  /** Counts a start attempt, so a message that is still true is shown again as a notification. */
  readonly countAttempt: () => void;
  readonly game: TabooClassicGame;
  readonly generators: TabooGenerators | undefined;
  /** Tells the player that the line-up cannot start (too few players and so on). */
  readonly notifyLineup: (issue: LineupIssue) => void;
  /** The settings as the form holds them; nothing when they are incomplete (the form says why). */
  readonly readSettings: () => TabooSettings | undefined;
  readonly setIssues: (issues: readonly ValidationIssue[]) => void;
  readonly setCountdownSession: (session: TabooCountdownSession) => void;
  readonly setRaceSession: (session: TabooRaceSession) => void;
  readonly teamSetup: TeamSetupValue;
}

/**
 * Starts a game from the line-up: checks the line-up and the settings, plans the game, gets the
 * cards (the ones before when the same game is played again, the local ones and, if wanted, new ones
 * from the card generators) and hands the prepared game to the mode. Messages about missing cards
 * and the state of a preparation that is still running belong here.
 */
export function useTabooStart({
  cardLanguage,
  cards,
  categoryIds,
  countAttempt,
  game,
  generators,
  notifyLineup,
  readSettings,
  setIssues,
  setCountdownSession,
  setRaceSession,
  teamSetup,
}: StartOptions) {
  const { t } = useTranslation();
  const memory = useTeamSetupMemory();
  const [shortage, setShortage] = useState<CardShortage>();
  const [generating, setGenerating] = useState(false);
  const [generationEmpty, setGenerationEmpty] = useState(false);
  const activeGeneration = useRef<AbortController | undefined>(undefined);
  // The cards of the game that was just played; a replay with the same settings reuses them.
  const replayDeck = useRef<readonly TabooCard[] | undefined>(undefined);
  useEffect(() => () => activeGeneration.current?.abort(), []);

  /** Stops a card preparation that is running (the setup changed, a view was left). */
  function abort() {
    activeGeneration.current?.abort();
  }

  async function startGame(event: FormEvent<HTMLFormElement>) {
    countAttempt();
    event.preventDefault();
    if (activeGeneration.current) return;
    const settings = readSettings();
    if (!settings) return;
    // The game's own rules for the line-up (Taboo leaves players without a team out).
    const lineupIssue = validateLineup(tabooLineup, teamSetup)[0];
    if (lineupIssue) {
      notifyLineup(lineupIssue);
      return;
    }
    setGenerationEmpty(false);
    game.setDeckEmpty(false);
    setShortage(undefined);
    game.setSession(undefined);
    const reusable = replayDeck.current;
    replayDeck.current = undefined;
    const teams = buildTeams(resolveLineup(tabooLineup, teamSetup), {
      defaultName: (number) => t("kitTeams.defaultName", { number }),
    });
    const planned = planTabooStart({ categoryIds, cardLanguage, settings, teams });
    if (!planned.valid) {
      setIssues(planned.issues);
      return;
    }
    setIssues([]);
    const { plan } = planned;
    // The group is remembered for the next game, of any game.
    if (hasTeamSetupContent(teamSetup)) memory?.write(teamSetup);
    game.refill.configure(
      plan.cardSource === "ai"
        ? {
            language: plan.filters.language,
            categories: plan.selectedCategories,
            difficulties: plan.chosenDifficulties,
          }
        : undefined,
    );
    // A replay reuses the cards of the game before when they are enough for the new line-up.
    let deck: readonly TabooCard[] | undefined =
      reusable && !cardShortageFor(plan, reusable) ? shuffle(reusable) : undefined;
    if (!deck) {
      let additions: readonly TabooCard[] = [];
      if (generators && (plan.cardSource === "ai" || plan.cardSource === "both")) {
        const controller = new AbortController();
        activeGeneration.current = controller;
        setGenerating(true);
        const requests = planGenerationRequests({
          categories: plan.selectedCategories,
          difficulties: plan.chosenDifficulties,
          language: plan.filters.language,
          mode: plan.mode,
          required: plan.required,
          source: plan.cardSource,
        });
        try {
          additions = await generateHiddenCards(generators, requests, cards, controller.signal);
        } catch {
          additions = [];
        } finally {
          activeGeneration.current = undefined;
          setGenerating(false);
        }
        if (controller.signal.aborted) return;
        setGenerationEmpty(additions.length === 0);
      }
      const pool = plan.cardSource === "ai" ? additions : [...cards, ...additions];
      deck = buildDeck(pool, plan.filters, Math.random).cards;
    }
    const missing = cardShortageFor(plan, deck);
    if (missing) {
      setShortage(missing);
      return;
    }
    if (plan.countdown) {
      setCountdownSession({
        difficulties: plan.chosenDifficulties,
        key: 0,
        pool: deck,
        state: plan.countdown,
      });
      return;
    }
    if (plan.race) {
      setRaceSession({
        difficulties: plan.chosenDifficulties,
        key: 0,
        pool: deck,
        state: plan.race,
      });
      return;
    }
    if (plan.classic) game.setSession({ state: plan.classic, deck });
  }

  return {
    abort,
    generating,
    generationEmpty,
    /** The cards of a game that is over, for the same setup played again. */
    rememberDeck: (deck: readonly TabooCard[]) => {
      replayDeck.current = deck;
    },
    setGenerationEmpty,
    setShortage,
    shortage,
    startGame,
  };
}
