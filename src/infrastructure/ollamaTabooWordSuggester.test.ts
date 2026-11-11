import { expect, it, vi } from "vitest";
import {
  createOllamaTabooWordSuggester,
  discoverOllamaTabooWordSuggester,
} from "./ollamaTabooWordSuggester";

const request = { language: "de", term: "Mond", categoryId: "nature" } as const;

it("discovers a local model and asks it for words in the card language", async () => {
  const fetch = vi
    .fn<typeof globalThis.fetch>()
    .mockResolvedValueOnce(Response.json({ models: [{ name: "gemma4" }] }))
    .mockResolvedValueOnce(
      Response.json({ response: JSON.stringify({ words: ["Nacht", "Himmel", "Orbit", "Erde"] }) }),
    );
  const suggester = await discoverOllamaTabooWordSuggester(new AbortController().signal, fetch);
  expect(await suggester?.suggest(request)).toEqual({
    status: "complete",
    words: ["Nacht", "Himmel", "Orbit", "Erde"],
  });
  const sent = fetch.mock.calls[1]?.[1]?.body;
  const body = typeof sent === "string" ? sent : "";
  expect(body).toContain('"model":"gemma4"');
  expect(body).toContain("German");
  expect(body).toContain("Mond");
  expect(fetch.mock.calls[1]?.[0]).toBe("http://127.0.0.1:11434/api/generate");
});

it("finds no suggester when Ollama is not reachable", async () => {
  const fetch = vi.fn<typeof globalThis.fetch>().mockRejectedValue(new Error("offline"));
  expect(await discoverOllamaTabooWordSuggester(new AbortController().signal, fetch)).toBe(
    undefined,
  );
});

it("reports cancellation, unavailable service and unusable answers as typed results", async () => {
  const noFetch = vi.fn<typeof globalThis.fetch>();
  expect(
    await createOllamaTabooWordSuggester({ model: "m", fetch: noFetch }).suggest(request, {
      aborted: true,
    }),
  ).toEqual({ status: "failed", code: "cancelled" });
  expect(noFetch).not.toHaveBeenCalled();

  const outcome = async (reply: () => Promise<Response>) =>
    createOllamaTabooWordSuggester({
      model: "m",
      fetch: vi.fn<typeof globalThis.fetch>().mockImplementation(reply),
    }).suggest({ ...request, language: "en" });

  expect(await outcome(() => Promise.resolve(new Response("no", { status: 500 })))).toEqual({
    status: "failed",
    code: "unavailable",
  });
  expect(await outcome(() => Promise.reject(new Error("boom")))).toEqual({
    status: "failed",
    code: "unavailable",
  });
  expect(await outcome(() => Promise.resolve(Response.json({ nothing: true })))).toEqual({
    status: "failed",
    code: "invalid_response",
  });
  expect(await outcome(() => Promise.resolve(Response.json({ response: "[1]" })))).toEqual({
    status: "failed",
    code: "invalid_response",
  });
});
