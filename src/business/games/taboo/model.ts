import type { GameHubLanguage } from "../../settings/languageSettings";

export type Difficulty = "easy" | "medium" | "hard";
export interface Team {
  readonly id: string;
  readonly name: string;
  /** The players of the team when the player entered them; the game does not need them. */
  readonly players?: readonly string[];
}
export interface TabooCard {
  readonly id: string;
  readonly language: GameHubLanguage;
  readonly term: string;
  readonly forbiddenWords: readonly [string, string, string, string];
  readonly categoryId: string;
  readonly difficulty: Difficulty;
}
export interface GameConfiguration {
  readonly teams: readonly Team[];
  readonly roundDurationSeconds: number;
  /** Rounds in which every team plays once; "unlimited" lets the group decide when to stop. */
  readonly roundsPerTeam: number | "unlimited";
  readonly cardLanguage: GameHubLanguage;
  /** Allowed skips per turn; undefined means unlimited. */
  readonly skipsPerRound?: number;
  /** Play a timed tiebreak when two or more teams share the lead at the end; undefined means off. */
  readonly tiebreak?: boolean;
}
export interface ValidationIssue {
  readonly field: string;
  readonly code: string;
}
export type ValidationResult<T> =
  | { readonly valid: true; readonly value: T }
  | { readonly valid: false; readonly issues: readonly ValidationIssue[] };

export function normalizeText(value: string): string {
  return value.normalize("NFC").trim().replace(/\s+/gu, " ");
}

function identity(value: string): string {
  return normalizeText(value).toLowerCase();
}

/** Cleans the text and makes its first letter a capital letter, in the rules of the language. */
export function capitalizeFirst(value: string, language: GameHubLanguage): string {
  const text = normalizeText(value);
  const first = Array.from(text)[0];
  return first === undefined ? text : first.toLocaleUpperCase(language) + text.slice(first.length);
}

/**
 * Cleans the teams of a game (trimmed names, only non-empty players) and reports what is wrong:
 * fewer than two teams, empty or duplicate ids and names. Every game mode uses the same rules.
 */
export function validateTeams(input: readonly Team[]): {
  readonly teams: readonly Team[];
  readonly issues: readonly ValidationIssue[];
} {
  const issues: ValidationIssue[] = [];
  const teams = input.map((team) => {
    const players = (team.players ?? []).map(normalizeText).filter(Boolean);
    return {
      id: normalizeText(team.id),
      name: normalizeText(team.name),
      ...(players.length > 0 ? { players } : {}),
    };
  });
  if (teams.length < 2) issues.push({ field: "teams", code: "minimum_two" });
  for (const field of ["id", "name"] as const) {
    if (teams.some((team) => !team[field]))
      issues.push({ field: `teams.${field}`, code: "required" });
    if (new Set(teams.map((team) => identity(team[field]))).size !== teams.length)
      issues.push({ field: `teams.${field}`, code: "duplicate" });
  }
  return { teams, issues };
}

export function validateConfiguration(
  input: GameConfiguration,
): ValidationResult<GameConfiguration> {
  const { teams, issues: teamIssues } = validateTeams(input.teams);
  const issues: ValidationIssue[] = [...teamIssues];
  if (!Number.isSafeInteger(input.roundDurationSeconds) || input.roundDurationSeconds <= 0)
    issues.push({ field: "roundDurationSeconds", code: "positive_integer_required" });
  if (
    input.roundsPerTeam !== "unlimited" &&
    (!Number.isSafeInteger(input.roundsPerTeam) || input.roundsPerTeam <= 0)
  )
    issues.push({ field: "roundsPerTeam", code: "positive_integer_required" });
  if (input.cardLanguage !== "de" && input.cardLanguage !== "en")
    issues.push({ field: "cardLanguage", code: "unsupported_language" });
  if (
    input.skipsPerRound !== undefined &&
    (!Number.isSafeInteger(input.skipsPerRound) || input.skipsPerRound < 0)
  )
    issues.push({ field: "skipsPerRound", code: "non_negative_integer_required" });
  if (input.tiebreak !== undefined && typeof input.tiebreak !== "boolean")
    issues.push({ field: "tiebreak", code: "boolean_required" });
  return issues.length ? { valid: false, issues } : { valid: true, value: { ...input, teams } };
}

export function validateCard(
  input: Omit<TabooCard, "forbiddenWords"> & { readonly forbiddenWords: readonly string[] },
): ValidationResult<TabooCard> {
  const issues: ValidationIssue[] = [];
  const id = normalizeText(input.id);
  const term = normalizeText(input.term);
  const categoryId = normalizeText(input.categoryId);
  const words = input.forbiddenWords.map(normalizeText);
  for (const [field, value] of [
    ["id", id],
    ["term", term],
    ["categoryId", categoryId],
  ] as const) {
    if (!value) issues.push({ field, code: "required" });
  }
  if (input.language !== "de" && input.language !== "en")
    issues.push({ field: "language", code: "unsupported_language" });
  if (!["easy", "medium", "hard"].includes(input.difficulty))
    issues.push({ field: "difficulty", code: "unsupported_difficulty" });
  if (words.length !== 4) issues.push({ field: "forbiddenWords", code: "exactly_four" });
  if (words.some((word) => !word)) issues.push({ field: "forbiddenWords", code: "required" });
  if (new Set(words.map(identity)).size !== words.length)
    issues.push({ field: "forbiddenWords", code: "duplicate" });
  if (words.some((word) => identity(word) === identity(term)))
    issues.push({ field: "forbiddenWords", code: "matches_term" });
  // A part of the term is forbidden anyway, so it must not take one of the four places
  // (for "Fußball" the word "Ball" is no forbidden word). Very short words are not checked.
  if (words.some((word) => identity(word).length >= 3 && identity(term).includes(identity(word))))
    issues.push({ field: "forbiddenWords", code: "part_of_term" });
  return issues.length
    ? { valid: false, issues }
    : {
        valid: true,
        value: {
          ...input,
          id,
          term,
          categoryId,
          forbiddenWords: words as [string, string, string, string],
        },
      };
}
