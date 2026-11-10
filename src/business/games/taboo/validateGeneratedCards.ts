import { selectNewTabooCards } from "./cardExchange";
import type { TabooCardCandidate, TabooGenerationRequest } from "./cardGenerator";
import type { TabooCardRepository } from "./cardRepository";
import { normalizeText, validateCard, type TabooCard, type ValidationIssue } from "./model";

interface RejectedCandidate {
  readonly index: number;
  readonly issues: readonly ValidationIssue[];
}

interface GeneratedCardReview {
  readonly accepted: readonly TabooCard[];
  readonly rejected: readonly RejectedCandidate[];
}

export function reviewGeneratedCards(
  request: TabooGenerationRequest,
  candidates: readonly unknown[],
  existing: readonly TabooCard[],
  createId: () => string,
): GeneratedCardReview {
  const valid: { index: number; card: TabooCard }[] = [];
  const rejected: RejectedCandidate[] = [];

  for (const [index, candidate] of candidates.entries()) {
    if (typeof candidate !== "object" || candidate === null) {
      rejected.push({ index, issues: [{ field: "card", code: "invalid_schema" }] });
      continue;
    }
    const { language, categoryId, difficulty, term, forbiddenWords } =
      candidate as TabooCardCandidate;
    const issues: ValidationIssue[] = [];
    if (language !== request.language) issues.push({ field: "language", code: "request_mismatch" });
    if (typeof categoryId !== "string" || normalizeText(categoryId) !== request.categoryId)
      issues.push({ field: "categoryId", code: "request_mismatch" });
    if (difficulty !== request.difficulty)
      issues.push({ field: "difficulty", code: "request_mismatch" });
    if (
      typeof term !== "string" ||
      !Array.isArray(forbiddenWords) ||
      !forbiddenWords.every((word): word is string => typeof word === "string")
    ) {
      rejected.push({ index, issues: [...issues, { field: "card", code: "invalid_schema" }] });
      continue;
    }
    const result = validateCard({
      id: createId(),
      language: request.language,
      categoryId: request.categoryId,
      difficulty: request.difficulty,
      term,
      forbiddenWords,
    });
    if (!result.valid) issues.push(...result.issues);
    if (result.valid && issues.length === 0) valid.push({ index, card: result.value });
    else rejected.push({ index, issues });
  }

  const accepted = selectNewTabooCards(
    valid.map(({ card }) => card),
    existing,
  );
  const acceptedCards = new Set(accepted);
  for (const { index, card } of valid) {
    if (!acceptedCards.has(card))
      rejected.push({ index, issues: [{ field: "card", code: "duplicate" }] });
  }
  return { accepted, rejected: rejected.sort((left, right) => left.index - right.index) };
}

/** Call with the reviewed cards the user selected. The repository commits the batch atomically. */
export async function saveGeneratedCards(
  repository: TabooCardRepository,
  selected: readonly TabooCard[],
  standardCards: readonly TabooCard[],
): Promise<readonly TabooCard[]> {
  const stored = await repository.list();
  const additions = selectNewTabooCards(selected, [...standardCards, ...stored]);
  if (additions.length > 0) await repository.addAll(additions);
  return additions;
}
