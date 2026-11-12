import { selectNewTabooCards } from "./cardExchange";
import type { TabooCategoryInfo } from "./categories";
import { normalizeText, validateCard, type Difficulty, type TabooCard } from "./model";

/**
 * Rules for generating the large card pool with a computer-side AI. Nothing here talks to a
 * provider: it builds the prompt, reads the untrusted answer and decides which cards are accepted.
 */

export interface PoolRequest {
  readonly category: TabooCategoryInfo;
  readonly count: number;
  readonly difficulty: Difficulty;
  readonly language: TabooCard["language"];
  /** Terms that exist already in this category; the AI is asked to avoid them. */
  readonly avoidTerms: readonly string[];
}

export interface PoolPrompt {
  readonly system: string;
  readonly user: string;
}

/** What each category covers, written for the AI (English works well for every model). */
export const poolCategoryBriefs: Readonly<Record<string, string>> = {
  everyday: "objects and routines of the household and of everyday life",
  nature: "landscapes, weather, plants and natural phenomena (not individual animal species)",
  culture: "art, festivals, customs, traditions and education",
  food: "dishes, drinks, ingredients and the kitchen",
  animals: "animal species and animal behaviour",
  sport: "sports, sports equipment, hobbies, games and leisure activities",
  jobs: "occupations and the tools they use",
  places: "places, buildings, transport and travel",
  media:
    "films, music, books, television and video games as general concepts (no brand names, no names of real people)",
  tech: "devices, computers, the internet and inventions",
};

const difficultyBriefs: Readonly<Record<Difficulty, string>> = {
  easy: "almost everybody knows the term and can describe it without difficulty",
  medium: "the term is well known but a little harder to explain",
  hard: "a specialised or abstract term that is hard to explain without the obvious words",
};

const languageNames = { de: "German", en: "English" } as const;

export const maxAvoidTerms = 80;

export function buildPoolPrompt(request: PoolRequest): PoolPrompt {
  const language = languageNames[request.language];
  const brief = poolCategoryBriefs[request.category.id] ?? request.category.names.en;
  const avoid = request.avoidTerms.slice(-maxAvoidTerms);
  return {
    system: [
      `You create cards for the party game Taboo in ${language}.`,
      "A card has one term and exactly four forbidden words. The forbidden words are the words people would say first when explaining the term; saying them is not allowed in the game.",
      "Rules: Everything is in the requested language. The game is family friendly: no violence, sex, drugs, politics, religion as a topic of dispute, no brand names and no names of real people. A term is a common noun or a short phrase of at most three words.",
      "The four forbidden words are single words, all different. None of them may be the term, contain the term or be part of the term. One of the four should be a broader umbrella word for the term.",
      'Answer only with JSON of the form {"cards":[{"term":"...","forbiddenWords":["...","...","...","..."]}]}.',
    ].join("\n"),
    user: [
      `Create ${request.count} different cards.`,
      `Category: ${request.category.names.en} (${brief}).`,
      `Difficulty: ${request.difficulty}: ${difficultyBriefs[request.difficulty]}.`,
      `Language: ${language}.`,
      avoid.length > 0 ? `Do not use these terms, they exist already: ${avoid.join(", ")}.` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  };
}

/** JSON schema of the answer, for providers that can force a structure. */
export const poolResponseSchema = {
  type: "object",
  required: ["cards"],
  properties: {
    cards: {
      type: "array",
      items: {
        type: "object",
        required: ["term", "forbiddenWords"],
        properties: {
          term: { type: "string" },
          forbiddenWords: { type: "array", minItems: 4, maxItems: 4, items: { type: "string" } },
        },
      },
    },
  },
} as const;

/** Reads the cards out of an AI answer; text around the JSON is ignored. Returns untrusted values. */
export function parsePoolResponse(text: string): unknown[] {
  const start = text.search(/[{[]/u);
  if (start < 0) return [];
  const candidates = [text.slice(start), text.slice(start, text.lastIndexOf("}") + 1)];
  for (const candidate of candidates) {
    try {
      const parsed: unknown = JSON.parse(candidate);
      const list =
        typeof parsed === "object" && parsed !== null && "cards" in parsed ? parsed.cards : parsed;
      if (Array.isArray(list)) return list as unknown[];
    } catch {
      // try the next cut of the text
    }
  }
  return [];
}

/** A stable id: the same term in the same category and language always gets the same id. */
export function poolCardId(language: string, categoryId: string, term: string): string {
  const slug = normalizeText(term)
    .toLowerCase()
    .replace(/ä/gu, "ae")
    .replace(/ö/gu, "oe")
    .replace(/ü/gu, "ue")
    .replace(/ß/gu, "ss")
    .normalize("NFD")
    .replace(/[̀-ͯ]/gu, "")
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "");
  return `pool-${language}-${categoryId}-${slug || "card"}`;
}

export interface RejectedPoolCard {
  readonly reason: string;
  readonly term: string;
}

export interface PoolReview {
  readonly accepted: readonly TabooCard[];
  readonly rejected: readonly RejectedPoolCard[];
}

const longestAllowedTerm = 40;
const longestAllowedWord = 30;

function textOf(value: unknown): string | undefined {
  return typeof value === "string" ? normalizeText(value) : undefined;
}

/** Whether one of two texts is contained in the other (ignoring case) for words of 3+ letters. */
function overlaps(left: string, right: string): boolean {
  const a = left.toLowerCase();
  const b = right.toLowerCase();
  return (a.length >= 3 && b.includes(a)) || (b.length >= 3 && a.includes(b));
}

/**
 * Decides which candidates become cards. Stricter than the plain card rules: words may not
 * contain the term or the other way round, no digits in words, sensible lengths. Existing cards
 * (any category) block repeated terms. Rejections carry a reason for the log.
 */
export function reviewPoolCards(
  request: Pick<PoolRequest, "category" | "difficulty" | "language">,
  candidates: readonly unknown[],
  existing: readonly TabooCard[],
): PoolReview {
  const accepted: TabooCard[] = [];
  const rejected: RejectedPoolCard[] = [];
  for (const candidate of candidates) {
    const item = typeof candidate === "object" && candidate !== null ? candidate : {};
    const term = textOf("term" in item ? item.term : undefined) ?? "";
    const reject = (reason: string) => rejected.push({ reason, term });
    const words =
      "forbiddenWords" in item && Array.isArray(item.forbiddenWords)
        ? (item.forbiddenWords as unknown[]).map(textOf)
        : [];
    if (!term || term.length > longestAllowedTerm) {
      reject("term missing or too long");
      continue;
    }
    if (words.length !== 4 || words.some((word) => !word)) {
      reject("not four forbidden words");
      continue;
    }
    const checked = words as string[];
    if (checked.some((word) => word.length > longestAllowedWord || /\d/u.test(word))) {
      reject("word too long or with digits");
      continue;
    }
    if (checked.some((word) => overlaps(word, term))) {
      reject("a forbidden word contains the term or is part of it");
      continue;
    }
    const result = validateCard({
      id: poolCardId(request.language, request.category.id, term),
      language: request.language,
      term,
      forbiddenWords: checked,
      categoryId: request.category.id,
      difficulty: request.difficulty,
    });
    if (!result.valid) {
      reject(`invalid card (${result.issues.map((issue) => issue.code).join(", ")})`);
      continue;
    }
    if (selectNewTabooCards([result.value], [...existing, ...accepted]).length === 0) {
      reject("term or id exists already");
      continue;
    }
    accepted.push(result.value);
  }
  return { accepted, rejected };
}
