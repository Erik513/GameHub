import type { TabooGenerationRequest } from "./cardGenerator";
import type { Difficulty } from "./model";

/** The most cards one request to a card generator asks for. */
export const maxCardsPerRequest = 10;
/** AI-only decks are made with this many cards per turn, so a full timed round never runs dry. */
export const aiCardsPerTurn = 8;
/** A running classic round asks for more AI cards when this few are left. */
export const refillThreshold = 8;
/** A race never uses a card twice; every team gets this many spare cards for replacements. */
export const raceSpareCardsPerTeam = 2;

interface RequiredCardsInput {
  readonly mode: "classic" | "race";
  readonly raceTarget: number;
  /** Rounds in which every team plays once; with "unlimited" one card per team is enough to start. */
  readonly roundsPerTeam: number | "unlimited";
  readonly teamCount: number;
}

/**
 * How many cards a game needs to start. A classic game needs one card per turn (with unlimited
 * rounds one per team, the cards are reused later). A race needs the cards of all runs and a few
 * spare ones per team.
 */
export function requiredCards({
  mode,
  raceTarget,
  roundsPerTeam,
  teamCount,
}: RequiredCardsInput): number {
  if (mode === "race") return teamCount * (raceTarget + raceSpareCardsPerTeam);
  return teamCount * (roundsPerTeam === "unlimited" ? 1 : roundsPerTeam);
}

interface GenerationPlanInput {
  readonly categories: readonly string[];
  readonly difficulties: readonly Difficulty[];
  readonly language: TabooGenerationRequest["language"];
  readonly mode: "classic" | "race";
  /** From where the cards come: "ai" makes the whole deck, "both" only adds a few extra cards. */
  readonly source: "ai" | "both";
  readonly required: number;
}

/**
 * The requests that ask a card generator for cards before the game starts: a few extras per
 * category for mixed decks, or enough for the whole game for AI-only decks. Every request asks for
 * at most `maxCardsPerRequest` cards; the difficulties take turns.
 */
export function planGenerationRequests({
  categories,
  difficulties,
  language,
  mode,
  required,
  source,
}: GenerationPlanInput): TabooGenerationRequest[] {
  const perCategory =
    source === "ai"
      ? Math.max(
          2,
          Math.ceil((required * (mode === "race" ? 2 : aiCardsPerTurn)) / categories.length),
        )
      : 2;
  return categories.flatMap((categoryId) =>
    Array.from({ length: Math.ceil(perCategory / maxCardsPerRequest) }, (_, index) => ({
      language,
      categoryId,
      difficulty: difficulties[index % difficulties.length] ?? "easy",
      count: Math.min(maxCardsPerRequest, perCategory - index * maxCardsPerRequest),
    })),
  );
}
