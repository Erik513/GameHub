import type { GameHubLanguage } from "../../settings/languageSettings";

export type Difficulty = "easy" | "medium" | "hard";
export interface Team {
  readonly id: string;
  readonly name: string;
}
export interface Category {
  readonly id: string;
  readonly name: string;
}
export interface TabooCard {
  readonly id: string;
  readonly language: GameHubLanguage;
  readonly term: string;
  readonly forbiddenWords: readonly [string, string, string];
  readonly categoryId: string;
  readonly difficulty: Difficulty;
}
export interface GameConfiguration {
  readonly teams: readonly Team[];
  readonly roundDurationSeconds: number;
  readonly roundsPerTeam: number;
  readonly cardLanguage: GameHubLanguage;
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

export function validateCategory(input: Category): ValidationResult<Category> {
  const value = { id: normalizeText(input.id), name: normalizeText(input.name) };
  const issues: ValidationIssue[] = [];
  if (!value.id) issues.push({ field: "id", code: "required" });
  if (!value.name) issues.push({ field: "name", code: "required" });
  return issues.length ? { valid: false, issues } : { valid: true, value };
}

export function validateConfiguration(
  input: GameConfiguration,
): ValidationResult<GameConfiguration> {
  const issues: ValidationIssue[] = [];
  const teams = input.teams.map((team) => ({
    id: normalizeText(team.id),
    name: normalizeText(team.name),
  }));
  if (teams.length < 2) issues.push({ field: "teams", code: "minimum_two" });
  for (const field of ["id", "name"] as const) {
    if (teams.some((team) => !team[field]))
      issues.push({ field: `teams.${field}`, code: "required" });
    if (new Set(teams.map((team) => identity(team[field]))).size !== teams.length)
      issues.push({ field: `teams.${field}`, code: "duplicate" });
  }
  for (const field of ["roundDurationSeconds", "roundsPerTeam"] as const) {
    if (!Number.isSafeInteger(input[field]) || input[field] <= 0)
      issues.push({ field, code: "positive_integer_required" });
  }
  if (input.cardLanguage !== "de" && input.cardLanguage !== "en")
    issues.push({ field: "cardLanguage", code: "unsupported_language" });
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
  if (words.length !== 3) issues.push({ field: "forbiddenWords", code: "exactly_three" });
  if (words.some((word) => !word)) issues.push({ field: "forbiddenWords", code: "required" });
  if (new Set(words.map(identity)).size !== words.length)
    issues.push({ field: "forbiddenWords", code: "duplicate" });
  if (words.some((word) => identity(word) === identity(term)))
    issues.push({ field: "forbiddenWords", code: "matches_term" });
  return issues.length
    ? { valid: false, issues }
    : {
        valid: true,
        value: {
          ...input,
          id,
          term,
          categoryId,
          forbiddenWords: words as [string, string, string],
        },
      };
}
