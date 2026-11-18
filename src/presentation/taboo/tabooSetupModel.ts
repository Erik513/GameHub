import type { useTranslation } from "react-i18next";
import type { Difficulty, ValidationIssue } from "../../business/games/taboo/model";
import { defaultCountdownBudgetMs } from "../../business/games/taboo/countdown";
import { defaultRaceRounds } from "../../business/games/taboo/race";
import {
  TIEBREAK_CARD_COUNT,
  type createTabooGame,
  type TabooState,
  type TiebreakAttempt,
} from "../../business/games/taboo/stateMachine";
import type { ChoiceOption } from "../game-kit";
import type { AttemptReview } from "./TabooAttemptReviews";
import type { TiebreakRow } from "./TabooTiebreakResults";

/** The screens of a Taboo game that the host cares about: the menu is the one to come back to. */
export type TabooScreen = "menu" | "lineup" | "preparing" | "game" | "race" | "countdown";

export const difficulties = ["easy", "medium", "hard"] as const;
export const cardSources = ["both", "local", "ai"] as const;
/** The game modes the player can choose in the setup. */
export const tabooModes = ["classic", "countdown", "race"] as const;
export type TabooMode = (typeof tabooModes)[number];
export type RoundChoice = number | "unlimited";
export const defaultRoundChoices: readonly RoundChoice[] = [3, 5, 10, "unlimited"];
export type SetupState = Extract<ReturnType<typeof createTabooGame>, { valid: true }>["value"];
export type EndedState = Extract<TabooState, { status: "roundEnded" }>;
export type FinishedState = Extract<TabooState, { status: "gameEnded" }>;
export type TiebreakView = Extract<TabooState, { status: "tiebreak" }>;

/** What the tiebreak screens read of a game: the teams and the tiebreak itself. Every mode has it. */
export interface TiebreakData {
  readonly attempts: readonly TiebreakAttempt[];
  readonly configuration: {
    readonly teams: readonly { readonly id: string; readonly name: string }[];
  };
  readonly contenders: readonly number[];
}

/** A finished game as the tiebreak screens read it: the teams and the attempts of the tiebreak. */
export interface TiebreakFinished {
  readonly configuration: TiebreakData["configuration"];
  readonly tiebreak?: readonly TiebreakAttempt[] | undefined;
  readonly winnerIds: readonly string[];
}

/** What the turn overview needs: the game, its scores and the turn that is up next (if any). */
export interface OverviewData {
  readonly configuration: TabooState["configuration"];
  readonly scores: readonly number[];
  readonly turn: { readonly round: number; readonly teamIndex: number } | null;
}

export function issueMessageKey(issue: ValidationIssue) {
  switch (issue.field) {
    case "teams.name":
      return issue.code === "duplicate" ? "tabooSetup.duplicateTeam" : "tabooSetup.emptyTeam";
    case "roundDurationSeconds":
      return "tabooSetup.invalidDuration";
    case "roundsPerTeam":
      return "tabooSetup.invalidRounds";
    case "categories":
      return "tabooSetup.selectCategory";
    default:
      return "tabooSetup.invalidSetup";
  }
}

export function teamNameFrom(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export function tiebreakTeamName(state: TiebreakData) {
  const teamIndex = state.contenders[state.attempts.length];
  return teamIndex === undefined ? "" : (state.configuration.teams[teamIndex]?.name ?? "");
}

/** The cards of every finished tiebreak attempt, ready for corrections. */
export function tiebreakReviews(
  attempts: readonly TiebreakAttempt[],
  configuration: TiebreakData["configuration"],
): readonly AttemptReview[] {
  return attempts.map((attempt) => ({
    id: String(attempt.teamIndex),
    maxCorrect: TIEBREAK_CARD_COUNT,
    results: attempt.results,
    teamIndex: attempt.teamIndex,
    teamName: configuration.teams[attempt.teamIndex]?.name ?? "",
  }));
}

export function tiebreakRows(state: TiebreakData): readonly TiebreakRow[] {
  return state.contenders.map((teamIndex) => {
    const team = state.configuration.teams[teamIndex];
    const attempt = state.attempts.find((candidate) => candidate.teamIndex === teamIndex);
    return {
      id: team?.id ?? String(teamIndex),
      name: team?.name ?? "",
      ...(attempt ? { result: { solved: attempt.solved, timeMs: attempt.timeMs } } : {}),
    };
  });
}

export function roundOption(
  value: RoundChoice,
  t: ReturnType<typeof useTranslation>["t"],
): ChoiceOption {
  if (value === "unlimited") {
    return {
      value,
      label: t("tabooSetup.roundOptions.unlimited"),
      ariaLabel: t("tabooSetup.unlimited"),
    };
  }
  const names: Record<number, "short" | "medium" | "long"> = {
    3: "short",
    5: "medium",
    10: "long",
  };
  const name = names[value];
  return name
    ? { value: String(value), label: t(`tabooSetup.roundOptions.${name}`), hint: String(value) }
    : { value: String(value), label: String(value) };
}

/** The names of the lengths of a game of the mode "Auf Zeit": 1, 3 or 5 rounds are short, medium or long. */
export function raceRoundOption(
  value: number,
  t: ReturnType<typeof useTranslation>["t"],
): ChoiceOption {
  const names: Record<number, "short" | "medium" | "long"> = { 1: "short", 3: "medium", 5: "long" };
  const name = names[value];
  return name
    ? { value: String(value), label: t(`tabooSetup.roundOptions.${name}`), hint: String(value) }
    : { value: String(value), label: String(value) };
}

/** The settings of the main menu, read once when "Start" is pressed. */
export interface TabooSettings {
  readonly cardSource: (typeof cardSources)[number];
  /** The time account of every team in the mode "Gegen die Zeit", in milliseconds. */
  readonly countdownBudgetMs: number;
  /** Whether the next team of the mode "Gegen die Zeit" starts by itself when a turn ends. */
  readonly countdownAutoSwitch: boolean;
  /** The chosen categories; never empty. */
  readonly categories: readonly string[];
  /** The chosen difficulties; empty means every difficulty. */
  readonly difficulties: readonly Difficulty[];
  readonly duration: number;
  readonly mode: TabooMode;
  /** Rounds of the mode "Auf Zeit": every team plays one run per round. */
  readonly raceRounds: number;
  /** Whether the cards of the game are remembered, so new games prefer unplayed ones. */
  readonly rememberPlayed: boolean;
  /** Whether a tie of the race is decided by a tiebreak. */
  readonly raceTiebreak: boolean;
  readonly raceTarget: number;
  readonly rounds: number | "unlimited";
  /** Skips per round; undefined means as many as you like. */
  readonly skips: number | undefined;
  readonly tiebreak: boolean;
}

/** Reads the form of the main menu. Settings of the mode that is not chosen are read too, but unused. */
export function readTabooSettings(
  data: FormData,
  options: { categoryIds: readonly string[]; hasGenerators: boolean; mode: TabooMode },
): TabooSettings {
  const source = data.get("cardSource");
  const rounds = data.get("rounds");
  const skips = data.get("skips");
  const raceRounds = Number(data.get("raceRounds"));
  const countdownBudget = Number(data.get("countdownBudget"));
  return {
    cardSource: options.hasGenerators
      ? (cardSources.find((candidate) => candidate === source) ?? "both")
      : "local",
    countdownAutoSwitch: data.get("countdownSwitch") !== "manual",
    countdownBudgetMs:
      Number.isSafeInteger(countdownBudget) && countdownBudget >= 1
        ? countdownBudget
        : defaultCountdownBudgetMs,
    categories: options.categoryIds.filter((category) =>
      data.getAll("category").includes(category),
    ),
    difficulties: difficulties.filter((difficulty) =>
      data.getAll("difficulty").includes(difficulty),
    ),
    duration: Number(data.get("duration")),
    mode: options.mode,
    // A missing or broken value is the default, so the setup never starts a game without rounds.
    raceRounds:
      Number.isSafeInteger(raceRounds) && raceRounds >= 1 ? raceRounds : defaultRaceRounds,
    raceTarget: Number(data.get("raceTarget")),
    raceTiebreak: data.get("raceTiebreak") !== "off",
    rememberPlayed: data.get("rememberPlayed") !== "off",
    rounds: rounds === "unlimited" ? "unlimited" : Number(rounds),
    skips: skips === "unlimited" || skips === null ? undefined : Number(skips),
    tiebreak: data.get("tiebreak") !== "off",
  };
}
