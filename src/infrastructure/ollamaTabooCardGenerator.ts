import type {
  TabooCardCandidate,
  TabooCardGenerator,
  TabooGenerationErrorCode,
} from "../business/games/taboo/cardGenerator";

interface OllamaOptions {
  readonly model: string;
  readonly timeoutMs?: number;
  readonly fetch?: typeof fetch;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function discoverOllamaTabooCardGenerator(
  signal: AbortSignal,
  requestFetch: typeof fetch = fetch,
): Promise<TabooCardGenerator | undefined> {
  try {
    const response = await requestFetch("http://127.0.0.1:11434/api/tags", {
      redirect: "error",
      signal: AbortSignal.any([signal, AbortSignal.timeout(1500)]),
    });
    if (!response.ok) return;
    const payload: unknown = await response.json();
    if (!isRecord(payload) || !Array.isArray(payload.models)) return;
    for (const item of payload.models as unknown[]) {
      if (
        isRecord(item) &&
        typeof item.name === "string" &&
        item.name.trim() &&
        !/embed|[-:]cloud(?:$|:)/i.test(item.name)
      ) {
        return createOllamaTabooCardGenerator({ model: item.name, fetch: requestFetch });
      }
    }
  } catch {
    return;
  }
}

const schema = {
  type: "object",
  required: ["cards"],
  properties: {
    cards: {
      type: "array",
      items: {
        type: "object",
        required: ["language", "categoryId", "difficulty", "term", "forbiddenWords"],
        properties: {
          language: { type: "string" },
          categoryId: { type: "string" },
          difficulty: { type: "string" },
          term: { type: "string" },
          forbiddenWords: { type: "array", minItems: 3, maxItems: 3, items: { type: "string" } },
        },
      },
    },
  },
};

export function createOllamaTabooCardGenerator({
  model,
  timeoutMs = 60_000,
  fetch: requestFetch = fetch,
}: OllamaOptions): TabooCardGenerator {
  const capabilities = {
    languages: ["de", "en"],
    maxCardsPerRequest: 10,
    worksOffline: false,
  } as const;
  return {
    capabilities,
    async generate(request, cancellation) {
      if (cancellation?.aborted) return { status: "failed", code: "cancelled" };
      if (
        !model.trim() ||
        !Number.isSafeInteger(request.count) ||
        request.count < 1 ||
        request.count > capabilities.maxCardsPerRequest ||
        !capabilities.languages.includes(request.language)
      ) {
        return { status: "failed", code: "unsupported_request" };
      }
      const controller = new AbortController();
      let failure: TabooGenerationErrorCode = "unavailable";
      function abort(code: "cancelled" | "timeout") {
        if (controller.signal.aborted) return;
        failure = code;
        controller.abort();
      }
      const unsubscribe = cancellation?.subscribe(() => abort("cancelled"));
      const timer = setTimeout(() => abort("timeout"), timeoutMs);
      try {
        const response = await requestFetch("http://127.0.0.1:11434/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          redirect: "error",
          signal: controller.signal,
          body: JSON.stringify({
            model,
            stream: false,
            format: schema,
            system:
              "Create family-friendly Taboo word cards. Use the requested language, category and difficulty. Each card has exactly three distinct forbidden words, none equal to its term.",
            prompt: `Create ${request.count} cards for this specification: ${JSON.stringify(request)}`,
          }),
        });
        if (!response.ok) return { status: "failed", code: "unavailable" };
        failure = "invalid_response";
        const envelope: unknown = await response.json();
        if (!isRecord(envelope) || typeof envelope.response !== "string") {
          return { status: "failed", code: "invalid_response" };
        }
        const payload: unknown = JSON.parse(envelope.response);
        if (!isRecord(payload) || !Array.isArray(payload.cards)) {
          return { status: "failed", code: "invalid_response" };
        }
        const candidates: TabooCardCandidate[] = payload.cards
          .slice(0, request.count)
          .map((item: unknown) =>
            isRecord(item)
              ? {
                  language: item.language,
                  categoryId: item.categoryId,
                  difficulty: item.difficulty,
                  term: item.term,
                  forbiddenWords: item.forbiddenWords,
                }
              : {},
          );
        return { status: candidates.length === request.count ? "complete" : "partial", candidates };
      } catch {
        return { status: "failed", code: failure };
      } finally {
        clearTimeout(timer);
        unsubscribe?.();
      }
    },
  };
}
