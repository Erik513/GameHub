import type { TabooCard } from "./model";

/** How a card ended in a turn, a run or a tiebreak attempt. */
export type TabooOutcome = "correct" | "skipped" | "forbiddenWord";

export interface TabooResult {
  readonly card: TabooCard;
  readonly outcome: TabooOutcome;
  /** How the card was marked during the turn; set when the result was corrected afterwards. */
  readonly original?: TabooOutcome;
}

/**
 * The corrected result of a card, or nothing when the correction is not allowed. A card that was
 * marked wrong during the turn (forbidden word) can never become correct afterwards; a card that was
 * marked correct can be turned wrong and back again.
 */
export function reviseOutcome(
  previous: TabooResult,
  outcome: TabooOutcome,
): TabooResult | undefined {
  if (previous.outcome === "skipped" || outcome === "skipped") return undefined;
  if (previous.outcome === outcome) return undefined;
  const original = previous.original ?? previous.outcome;
  if (outcome === "correct" && original !== "correct") return undefined;
  return { ...previous, outcome, original };
}
