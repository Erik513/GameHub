import { requiredCards } from "../../business/games/taboo/cardPlan";
import type { DeckCriteria } from "../../business/games/taboo/deck";
import type {
  Difficulty,
  Team,
  TabooCard,
  ValidationIssue,
} from "../../business/games/taboo/model";
import { createCountdownGame, type CountdownState } from "../../business/games/taboo/countdown";
import { countdownCardShortage } from "../../business/games/taboo/countdownCards";
import { createRaceGame, type RaceState } from "../../business/games/taboo/race";
import { raceCardShortage } from "../../business/games/taboo/raceCards";
import { createTabooGame } from "../../business/games/taboo/stateMachine";
import type { SupportedLanguage } from "../../i18n";
import { difficulties, type SetupState, type TabooSettings } from "./tabooSetupModel";

/** The cards a game still needs: how many, and for a race of which difficulty. */
export interface CardShortage {
  readonly available: number;
  readonly difficulty?: Difficulty;
  readonly required: number;
}

/** The game of the mode "Auf Zeit" as the container keeps it. */
export interface TabooRaceSession {
  /** The difficulties of the game; every team gets the same mix of them. */
  readonly difficulties: readonly Difficulty[];
  /** Starts the game anew when the same setup is played again. */
  readonly key: number;
  readonly pool: readonly TabooCard[];
  readonly state: RaceState;
}

/** The game of the mode "Gegen die Zeit" as the container keeps it. */
export interface TabooCountdownSession {
  /** The difficulties of the game; every team gets the same difficulty in its n-th turn. */
  readonly difficulties: readonly Difficulty[];
  /** Starts the game anew when the same setup is played again. */
  readonly key: number;
  readonly pool: readonly TabooCard[];
  readonly state: CountdownState;
}

/** What a start needs to know before the cards are prepared. */
export interface TabooStartPlan {
  readonly cardSource: TabooSettings["cardSource"];
  readonly chosenDifficulties: readonly Difficulty[];
  /** The prepared game of the mode "Klassisch" (exactly one of `classic`, `race` and `countdown` is set). */
  readonly classic?: SetupState;
  readonly countdown?: CountdownState;
  readonly filters: DeckCriteria;
  readonly mode: "classic" | "race" | "countdown";
  readonly race?: RaceState;
  readonly raceTarget: number;
  /** How many cards the game needs to start (see `requiredCards`). */
  readonly required: number;
  readonly selectedCategories: readonly string[];
  readonly teamCount: number;
}

interface PlanInput {
  /** Every category that exists for the card language; choosing all of them means no filter. */
  readonly categoryIds: readonly string[];
  readonly cardLanguage: SupportedLanguage;
  readonly settings: TabooSettings;
  readonly teams: readonly Team[];
}

/**
 * Turns the settings and the teams into the game that is to be played, or says what is wrong with
 * them. No cards are chosen here. With unlimited rounds one card per team is enough to start (cards
 * are reused later); a race never uses a card twice, so it needs the cards of all runs.
 */
export function planTabooStart({
  categoryIds,
  cardLanguage,
  settings,
  teams,
}: PlanInput):
  | { readonly valid: true; readonly plan: TabooStartPlan }
  | { readonly valid: false; readonly issues: readonly ValidationIssue[] } {
  const raceTarget = settings.raceTarget;
  const classic =
    settings.mode === "classic"
      ? createTabooGame({
          teams,
          roundsPerTeam: settings.rounds,
          roundDurationSeconds: settings.duration,
          ...(settings.tiebreak ? { tiebreak: true } : {}),
          ...(settings.skips === undefined ? {} : { skipsPerRound: settings.skips }),
          cardLanguage,
        })
      : undefined;
  const race =
    settings.mode === "race"
      ? createRaceGame({
          teams,
          cardLanguage,
          rounds: settings.raceRounds,
          target: raceTarget,
          ...(settings.raceTiebreak ? { tiebreak: true } : {}),
        })
      : undefined;
  const countdown =
    settings.mode === "countdown"
      ? createCountdownGame({ teams, cardLanguage, budgetMs: settings.countdownBudgetMs })
      : undefined;
  const checked = classic ?? race ?? countdown;
  if (!checked?.valid) return { valid: false, issues: checked?.issues ?? [] };

  const selectedCategories = settings.categories;
  const teamCount = checked.value.configuration.teams.length;
  const mode = race?.valid ? "race" : countdown?.valid ? "countdown" : "classic";
  const required = requiredCards({
    mode,
    raceTarget,
    roundsPerTeam: classic?.valid ? classic.value.configuration.roundsPerTeam : 1,
    teamCount,
  });
  const filters: DeckCriteria = {
    language: checked.value.configuration.cardLanguage,
    minimumCards: 1,
    categoryIds: selectedCategories.length === categoryIds.length ? [] : selectedCategories,
    difficulties: settings.difficulties,
  };
  return {
    valid: true,
    plan: {
      cardSource: settings.cardSource,
      chosenDifficulties: filters.difficulties?.length ? filters.difficulties : difficulties,
      ...(classic?.valid ? { classic: classic.value } : {}),
      ...(countdown?.valid ? { countdown: countdown.value } : {}),
      filters,
      mode,
      ...(race?.valid ? { race: race.value } : {}),
      raceTarget,
      required,
      selectedCategories,
      teamCount,
    },
  };
}

/**
 * Whether the cards are enough for the game. A race needs enough cards of every difficulty it uses,
 * so every team gets the same mix.
 */
export function cardShortageFor(
  plan: TabooStartPlan,
  candidate: readonly TabooCard[],
): CardShortage | undefined {
  if (plan.mode === "race") {
    return raceCardShortage(candidate, plan.teamCount, plan.raceTarget, plan.chosenDifficulties);
  }
  if (plan.mode === "countdown") {
    return countdownCardShortage(candidate, plan.teamCount, plan.chosenDifficulties);
  }
  return candidate.length < plan.required
    ? { available: candidate.length, required: plan.required }
    : undefined;
}
