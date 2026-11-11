import { normalizeText, type TabooCard } from "./model";

export interface ForbiddenWordsRequest {
  readonly language: TabooCard["language"];
  readonly term: string;
  /** Optional hint that helps a provider pick fitting words. */
  readonly categoryId?: string;
}

export type ForbiddenWordsResult =
  | { readonly status: "complete"; readonly words: unknown }
  | { readonly status: "failed"; readonly code: "cancelled" | "unavailable" | "invalid_response" };

/** Suggests forbidden words for a term. Providers return untrusted values that are reviewed here. */
export interface TabooWordSuggester {
  suggest(
    request: ForbiddenWordsRequest,
    cancellation?: { readonly aborted: boolean },
  ): Promise<ForbiddenWordsResult>;
}

/**
 * Turns untrusted provider output into exactly four usable forbidden words: text only, trimmed,
 * no repeats and none equal to the term. Extra words are dropped; too few give `undefined`.
 */
export function reviewForbiddenWords(
  term: string,
  candidate: unknown,
): TabooCard["forbiddenWords"] | undefined {
  if (!Array.isArray(candidate)) return undefined;
  const termKey = normalizeText(term).toLowerCase();
  const seen = new Set<string>([termKey]);
  const words: string[] = [];
  for (const item of candidate as unknown[]) {
    if (typeof item !== "string") continue;
    const word = normalizeText(item);
    const key = word.toLowerCase();
    if (word === "" || word.length > 40 || seen.has(key)) continue;
    seen.add(key);
    words.push(word);
  }
  const [first, second, third, fourth] = words;
  return first && second && third && fourth ? [first, second, third, fourth] : undefined;
}
