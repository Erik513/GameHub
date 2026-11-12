import type { PoolPrompt } from "./poolGeneration";
import { normalizeText, type TabooCard } from "./model";

/**
 * Rules for reviewing generated pool cards: a second AI pass gives every card a score, a person
 * looks at a sample and at the doubtful cards, and only cards that pass are merged into the pool.
 * Nothing here talks to a provider or to files.
 */

export interface PoolVerdict {
  /** Why the judge doubts the card; empty for a clean card. */
  readonly problem: string;
  /** 1 (unusable) to 5 (good). */
  readonly score: number;
}

export type PoolVerdicts = Readonly<Record<string, PoolVerdict>>;

const languageNames = { de: "German", en: "English" } as const;

export function buildJudgePrompt(card: TabooCard, categoryName: string): PoolPrompt {
  const language = languageNames[card.language];
  return {
    system: [
      `You check cards of the party game Taboo in ${language}.`,
      "A card has a term and four forbidden words that players may not say while explaining the term.",
      "Check: Is the term a real, common word or phrase in the language that most players know at the stated difficulty? Are the four forbidden words real words of the language that people would say first when explaining the term (and no nonsense words)? Do they fit the category? Is the difficulty plausible? Is the card family friendly?",
      "Score 5 = good card, 4 = small flaw but usable, 3 = doubtful, 2 = weak, 1 = unusable (nonsense, wrong language, inappropriate).",
      'Answer only with JSON {"score":1-5,"problem":"short reason, empty if the card is fine"}.',
    ].join("\n"),
    user: JSON.stringify({
      language,
      category: categoryName,
      difficulty: card.difficulty,
      term: card.term,
      forbiddenWords: card.forbiddenWords,
    }),
  };
}

/** JSON schema of the judge's answer, for providers that can force a structure. */
export const poolJudgeSchema = {
  type: "object",
  required: ["score", "problem"],
  properties: {
    score: { type: "integer", minimum: 1, maximum: 5 },
    problem: { type: "string" },
  },
} as const;

/** Reads the judge's answer; text around the JSON is ignored. Anything unusable gives `undefined`. */
export function parseJudgeResponse(text: string): PoolVerdict | undefined {
  const match = /\{[\s\S]*\}/u.exec(text);
  if (!match) return undefined;
  try {
    const parsed: unknown = JSON.parse(match[0]);
    if (typeof parsed !== "object" || parsed === null || !("score" in parsed)) return undefined;
    const { score } = parsed;
    if (typeof score !== "number" || !Number.isInteger(score) || score < 1 || score > 5) {
      return undefined;
    }
    const problem =
      "problem" in parsed && typeof parsed.problem === "string"
        ? normalizeText(parsed.problem).slice(0, 300)
        : "";
    return { problem, score };
  } catch {
    return undefined;
  }
}

/** The cards that still need a verdict, in their order. */
export function cardsToJudge(
  cards: readonly TabooCard[],
  verdicts: PoolVerdicts,
): readonly TabooCard[] {
  return cards.filter((card) => verdicts[card.id] === undefined);
}

export interface SampleOptions {
  /** Cards below this score are always part of the sample. */
  readonly belowScore: number;
  /** How many good cards to look at per category and difficulty. */
  readonly perCell: number;
  readonly random: () => number;
}

/**
 * The cards a person should look at: every judged card below the score limit, plus a random
 * sample of the others in each category and difficulty. Unjudged cards are included as well,
 * because nobody has checked them yet. The result keeps the order of the input.
 */
export function selectReviewSample(
  cards: readonly TabooCard[],
  verdicts: PoolVerdicts,
  options: SampleOptions,
): readonly TabooCard[] {
  const chosen = new Set<string>();
  const cells = new Map<string, TabooCard[]>();
  for (const card of cards) {
    const verdict = verdicts[card.id];
    if (!verdict || verdict.score < options.belowScore) {
      chosen.add(card.id);
      continue;
    }
    const key = `${card.categoryId}/${card.difficulty}`;
    cells.set(key, [...(cells.get(key) ?? []), card]);
  }
  for (const group of cells.values()) {
    const pool = [...group];
    for (let take = 0; take < options.perCell && pool.length > 0; take += 1) {
      const index = Math.min(pool.length - 1, Math.floor(options.random() * pool.length));
      chosen.add(pool.splice(index, 1)[0]!.id);
    }
  }
  return cards.filter((card) => chosen.has(card.id));
}

/** Reads a list of card ids, one per line; empty lines and lines starting with `#` are ignored. */
export function parseDropList(text: string): ReadonlySet<string> {
  return new Set(
    text
      .split(/\r?\n/u)
      .map((line) => line.replace(/\s+#.*$/u, "").trim())
      .filter((line) => line !== "" && !line.startsWith("#")),
  );
}

export interface MergeSelection {
  readonly merge: readonly TabooCard[];
  readonly skipped: readonly { readonly id: string; readonly reason: string }[];
}

/**
 * Decides which working cards go into the shipped pool: judged with at least the minimum score,
 * not on the drop list and not in the pool yet. With `allowUnjudged` cards without a verdict pass.
 */
export function selectCardsToMerge(
  cards: readonly TabooCard[],
  verdicts: PoolVerdicts,
  drops: ReadonlySet<string>,
  options: {
    readonly allowUnjudged: boolean;
    readonly minScore: number;
    readonly poolIds: ReadonlySet<string>;
  },
): MergeSelection {
  const merge: TabooCard[] = [];
  const skipped: { id: string; reason: string }[] = [];
  for (const card of cards) {
    const verdict = verdicts[card.id];
    if (options.poolIds.has(card.id)) skipped.push({ id: card.id, reason: "already in the pool" });
    else if (drops.has(card.id)) skipped.push({ id: card.id, reason: "dropped by the review" });
    else if (!verdict && !options.allowUnjudged)
      skipped.push({ id: card.id, reason: "not judged" });
    else if (verdict && verdict.score < options.minScore) {
      skipped.push({ id: card.id, reason: `score ${verdict.score} below ${options.minScore}` });
    } else merge.push(card);
  }
  return { merge, skipped };
}
