import type { TabooWordSuggester } from "../business/games/taboo/wordSuggester";
import { findOllamaModel } from "./ollamaModel";

interface OllamaWordOptions {
  readonly model: string;
  readonly timeoutMs?: number;
  readonly fetch?: typeof fetch;
}

const schema = {
  type: "object",
  required: ["words"],
  properties: { words: { type: "array", minItems: 4, maxItems: 4, items: { type: "string" } } },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Looks for a local Ollama text model and returns a suggester, or nothing without one. */
export async function discoverOllamaTabooWordSuggester(
  signal: AbortSignal,
  requestFetch: typeof fetch = fetch,
): Promise<TabooWordSuggester | undefined> {
  const model = await findOllamaModel(signal, requestFetch);
  return model ? createOllamaTabooWordSuggester({ model, fetch: requestFetch }) : undefined;
}

export function createOllamaTabooWordSuggester({
  model,
  timeoutMs = 30_000,
  fetch: requestFetch = fetch,
}: OllamaWordOptions): TabooWordSuggester {
  return {
    async suggest(request, cancellation) {
      if (cancellation?.aborted) return { status: "failed", code: "cancelled" };
      const language = request.language === "de" ? "German" : "English";
      try {
        const response = await requestFetch("http://127.0.0.1:11434/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          redirect: "error",
          signal: AbortSignal.timeout(timeoutMs),
          body: JSON.stringify({
            model,
            stream: false,
            format: schema,
            system:
              "You help to create Taboo cards. For the given term, list exactly four distinct words that people would most likely say to describe it. They are the forbidden words. Answer in the requested language. None may equal the term. One of the four should be a broader umbrella word for the term.",
            prompt: JSON.stringify({
              language,
              term: request.term,
              ...(request.categoryId ? { category: request.categoryId } : {}),
            }),
          }),
        });
        if (!response.ok) return { status: "failed", code: "unavailable" };
        const envelope: unknown = await response.json();
        if (!isRecord(envelope) || typeof envelope.response !== "string") {
          return { status: "failed", code: "invalid_response" };
        }
        const payload: unknown = JSON.parse(envelope.response);
        if (!isRecord(payload) || Array.isArray(payload)) {
          return { status: "failed", code: "invalid_response" };
        }
        return { status: "complete", words: payload.words };
      } catch {
        return { status: "failed", code: "unavailable" };
      }
    },
  };
}
