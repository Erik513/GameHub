import { expect, it } from "vitest";
import type {
  GenerationCancellation,
  TabooCardGenerator,
  TabooGenerationRequest,
  TabooGenerationResult,
} from "./cardGenerator";

const request: TabooGenerationRequest = {
  language: "de",
  categoryId: "nature",
  difficulty: "easy",
  count: 1,
};

function fakeProvider(response: TabooGenerationResult): TabooCardGenerator {
  return {
    capabilities: { languages: ["de", "en"], maxCardsPerRequest: 10, worksOffline: true },
    generate: (_, cancellation) =>
      Promise.resolve(cancellation?.aborted ? { status: "failed", code: "cancelled" } : response),
  };
}

it("accepts an injected provider and receives unvalidated candidates", async () => {
  const candidates = [{ language: "de", term: "Mond", forbiddenWords: ["Nacht"] }];
  const provider = fakeProvider({ status: "partial", candidates });
  expect(provider.capabilities.languages).toContain(request.language);
  await expect(provider.generate(request)).resolves.toEqual({ status: "partial", candidates });
});

it("reports provider failures without transport details", async () => {
  await expect(
    fakeProvider({ status: "failed", code: "unavailable" }).generate(request),
  ).resolves.toEqual({
    status: "failed",
    code: "unavailable",
  });
});

it("supports an already cancelled request through a transport-neutral token", async () => {
  const cancellation: GenerationCancellation = { aborted: true, subscribe: () => () => undefined };
  await expect(
    fakeProvider({ status: "complete", candidates: [] }).generate(request, cancellation),
  ).resolves.toEqual({
    status: "failed",
    code: "cancelled",
  });
});
