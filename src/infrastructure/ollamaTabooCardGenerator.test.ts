import { expect, it, vi } from "vitest";
import type { TabooGenerationRequest } from "../business/games/taboo/cardGenerator";
import { reviewGeneratedCards } from "../business/games/taboo/validateGeneratedCards";
import { createOllamaTabooCardGenerator } from "./ollamaTabooCardGenerator";

const request: TabooGenerationRequest = {
  language: "en",
  categoryId: "nature",
  difficulty: "easy",
  count: 2,
};
const card = {
  language: "en",
  categoryId: "nature",
  difficulty: "easy",
  term: "Otter",
  forbiddenWords: ["river", "fur", "swim"],
};

it("uses loopback structured output and passes malformed candidates to validation", async () => {
  const fetch = vi
    .fn<typeof globalThis.fetch>()
    .mockImplementation(() =>
      Promise.resolve(Response.json({ response: JSON.stringify({ cards: [card, null] }) })),
    );
  const provider = createOllamaTabooCardGenerator({ model: "local-model", fetch });
  const result = await provider.generate(request);
  expect(result).toEqual({ status: "complete", candidates: [card, {}] });
  expect(fetch).toHaveBeenCalledWith(
    "http://127.0.0.1:11434/api/generate",
    expect.objectContaining({
      method: "POST",
      redirect: "error",
    }),
  );
  expect(fetch.mock.calls[0]?.[1]?.body).toContain('"stream":false');
  if (result.status === "failed") throw new Error("Expected candidates");
  const review = reviewGeneratedCards(request, result.candidates, [], () => "new");
  expect(review.accepted).toEqual([{ ...card, id: "new" }]);
  expect(review.rejected[0]?.index).toBe(1);
  fetch.mockResolvedValueOnce(Response.json({ response: JSON.stringify({ cards: [card] }) }));
  expect(await provider.generate(request)).toEqual({ status: "partial", candidates: [card] });
});

it.each([
  "invalid",
  "null",
  "{}",
  '{"response":"invalid"}',
  '{"response":"null"}',
  '{"response":"{}"}',
])("reports malformed responses: %s", async (body) => {
  const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response(body));
  expect(
    await createOllamaTabooCardGenerator({ model: "local-model", fetch }).generate(request),
  ).toEqual({ status: "failed", code: "invalid_response" });
});

it("reports network and HTTP errors as unavailable", async () => {
  const fetch = vi
    .fn<typeof globalThis.fetch>()
    .mockRejectedValueOnce(new TypeError("Network failure"))
    .mockResolvedValueOnce(new Response("", { status: 404 }));
  const provider = createOllamaTabooCardGenerator({ model: "local-model", fetch });
  for (let index = 0; index < 2; index += 1) {
    expect(await provider.generate(request)).toEqual({ status: "failed", code: "unavailable" });
  }
});

it("validates the request before connecting and skips already cancelled work", async () => {
  const fetch = vi.fn<typeof globalThis.fetch>();
  const provider = createOllamaTabooCardGenerator({ model: "local-model", fetch });
  for (const input of [
    { ...request, count: 0 },
    { ...request, count: 1.5 },
    { ...request, count: 11 },
    { ...request, language: "fr" as "en" },
  ]) {
    expect(await provider.generate(input)).toEqual({
      status: "failed",
      code: "unsupported_request",
    });
  }
  expect(await createOllamaTabooCardGenerator({ model: "", fetch }).generate(request)).toEqual({
    status: "failed",
    code: "unsupported_request",
  });
  expect(
    await provider.generate(request, { aborted: true, subscribe: () => () => undefined }),
  ).toEqual({ status: "failed", code: "cancelled" });
  expect(fetch).not.toHaveBeenCalled();
});

it("distinguishes timeout and cancellation and removes the subscription", async () => {
  const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(
    (_, options) =>
      new Promise<Response>((_, reject) => {
        options?.signal?.addEventListener("abort", () => reject(new Error("Aborted")), {
          once: true,
        });
      }),
  );
  vi.useFakeTimers();
  try {
    const provider = createOllamaTabooCardGenerator({ model: "local-model", timeoutMs: 20, fetch });
    const timed = provider.generate(request);
    await vi.advanceTimersByTimeAsync(20);
    expect(await timed).toEqual({ status: "failed", code: "timeout" });
    const controller = new AbortController();
    const unsubscribe = vi.fn();
    const cancelled = provider.generate(request, {
      aborted: false,
      subscribe(callback) {
        controller.signal.addEventListener("abort", callback);
        return unsubscribe;
      },
    });
    controller.abort();
    expect(await cancelled).toEqual({ status: "failed", code: "cancelled" });
    expect(unsubscribe).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
