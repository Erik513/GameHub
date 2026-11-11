import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { describe, expect, it, vi } from "vitest";
import type {
  TabooCardGenerator,
  TabooGenerationResult,
} from "../../business/games/taboo/cardGenerator";
import { createGameHubI18n } from "../../i18n";
import { tabooStandardCards } from "../../data/tabooStandardCards";
import { generateHiddenCards } from "./TabooGeneration";
import { TabooSetup } from "./TabooSetup";

it("adds new cards to the active deck without revealing them during setup", async () => {
  const i18n = await createGameHubI18n("en");
  const user = userEvent.setup();
  const generate = vi.fn<TabooCardGenerator["generate"]>().mockResolvedValue({
    status: "complete",
    candidates: [
      {
        language: "en",
        categoryId: "nature",
        difficulty: "easy",
        term: "Otter",
        forbiddenWords: ["river", "fur", "swim", "animal"],
      },
      {
        language: "en",
        categoryId: "nature",
        difficulty: "easy",
        term: "Orca",
        forbiddenWords: ["ocean", "whale", "black", "mammal"],
      },
    ],
  });
  const generator: TabooCardGenerator = {
    capabilities: { languages: ["en"], maxCardsPerRequest: 10, worksOffline: false },
    generate,
  };
  render(
    <I18nextProvider i18n={i18n}>
      <TabooSetup
        roundChoices={[1, 3]}
        cardLanguage="en"
        cards={[]}
        generators={{ local: generator }}
      />
    </I18nextProvider>,
  );
  await user.click(
    screen.getByRole("group", { name: "Rounds per team" }).querySelector("input[value='1']")!,
  );
  await user.click(screen.getByRole("checkbox", { name: "Everyday life" }));
  await user.click(screen.getByRole("checkbox", { name: "Culture" }));
  await user.click(screen.getByRole("radio", { name: "Both" }));
  await user.click(screen.getByRole("button", { name: "Start" }));
  await user.click(await screen.findByRole("button", { name: "Start round" }));
  expect(generate.mock.calls[0]?.[0]).toEqual({
    language: "en",
    categoryId: "nature",
    difficulty: "easy",
    count: 2,
  });
  expect(await screen.findByRole("heading", { name: /Otter|Orca/ })).toBeVisible();
});

async function renderWithGenerator(cards: Parameters<typeof TabooSetup>[0]["cards"]) {
  const i18n = await createGameHubI18n("en");
  const generate = vi.fn<TabooCardGenerator["generate"]>().mockResolvedValue({
    status: "complete",
    candidates: [
      {
        language: "en",
        categoryId: "nature",
        difficulty: "easy",
        term: "Otter",
        forbiddenWords: ["river", "fur", "swim", "animal"],
      },
      {
        language: "en",
        categoryId: "nature",
        difficulty: "easy",
        term: "Orca",
        forbiddenWords: ["ocean", "whale", "black", "mammal"],
      },
    ],
  });
  const generator: TabooCardGenerator = {
    capabilities: { languages: ["en"], maxCardsPerRequest: 10, worksOffline: false },
    generate,
  };
  const user = userEvent.setup();
  render(
    <I18nextProvider i18n={i18n}>
      <TabooSetup
        roundChoices={[1, 3]}
        cardLanguage="en"
        cards={cards}
        generators={{ local: generator }}
      />
    </I18nextProvider>,
  );
  await user.click(
    screen.getByRole("group", { name: "Rounds per team" }).querySelector("input[value='1']")!,
  );
  await user.click(screen.getByRole("checkbox", { name: "Everyday life" }));
  await user.click(screen.getByRole("checkbox", { name: "Culture" }));
  return { generate, user };
}

it("does not call the generator when only local cards are selected", async () => {
  const { generate, user } = await renderWithGenerator(tabooStandardCards);
  await user.click(screen.getByRole("radio", { name: "Local only" }));
  await user.click(screen.getByRole("button", { name: "Start" }));
  await user.click(await screen.findByRole("button", { name: "Start round" }));
  expect(generate).not.toHaveBeenCalled();
  expect(await screen.findByRole("region", { name: "Active round" })).toBeVisible();
});

it("builds the deck from generated cards only when AI only is selected", async () => {
  const { generate, user } = await renderWithGenerator(tabooStandardCards);
  await user.click(screen.getByRole("radio", { name: "AI only" }));
  await user.click(screen.getByRole("button", { name: "Start" }));
  await user.click(await screen.findByRole("button", { name: "Start round" }));
  expect(generate).toHaveBeenCalled();
  expect(await screen.findByRole("heading", { name: /Otter|Orca/ })).toBeVisible();
});

it("keeps adding generated cards to a running round in AI only mode", async () => {
  const i18n = await createGameHubI18n("en");
  const user = userEvent.setup();
  let counter = 0;
  const generate = vi.fn<TabooCardGenerator["generate"]>().mockImplementation((request) => {
    const candidates = Array.from({ length: Math.min(request.count, 3) }, () => {
      counter += 1;
      return {
        language: request.language,
        categoryId: request.categoryId,
        difficulty: request.difficulty,
        term: `Term${counter}`,
        forbiddenWords: [`alpha${counter}`, `beta${counter}`, `gamma${counter}`, `delta${counter}`],
      };
    });
    return Promise.resolve({ status: "complete", candidates });
  });
  const generator: TabooCardGenerator = {
    capabilities: { languages: ["en"], maxCardsPerRequest: 10, worksOffline: false },
    generate,
  };
  render(
    <I18nextProvider i18n={i18n}>
      <TabooSetup
        roundChoices={[1, 3]}
        cardLanguage="en"
        cards={[]}
        generators={{ local: generator }}
      />
    </I18nextProvider>,
  );
  await user.click(
    screen.getByRole("group", { name: "Rounds per team" }).querySelector("input[value='1']")!,
  );
  await user.click(screen.getByRole("radio", { name: "AI only" }));
  await user.click(screen.getByRole("button", { name: "Start" }));
  await user.click(await screen.findByRole("button", { name: "Start round" }));
  // Three categories are pre-generated; the running round then requests one more batch.
  await vi.waitFor(() => expect(generate.mock.calls.length).toBeGreaterThanOrEqual(4));
  expect(generate.mock.calls.at(-1)?.[0].count).toBe(10);
});

describe("generateHiddenCards", () => {
  const request = { language: "en", categoryId: "nature", difficulty: "easy", count: 1 } as const;
  const candidate = (term: string) => ({
    language: "en",
    categoryId: "nature",
    difficulty: "easy",
    term,
    forbiddenWords: [`${term}1`, `${term}2`, `${term}3`, `${term}4`],
  });
  const generatorReturning = (...results: TabooGenerationResult[]) => {
    const generate = vi.fn<TabooCardGenerator["generate"]>();
    for (const result of results) generate.mockResolvedValueOnce(result);
    const generator: TabooCardGenerator = {
      capabilities: { languages: ["en"], maxCardsPerRequest: 10, worksOffline: true },
      generate,
    };
    return { generate, generator };
  };

  it("prefers a discovered generator, otherwise the local one", async () => {
    const { generate: localGenerate, generator: local } = generatorReturning({
      status: "complete",
      candidates: [candidate("Local")],
    });
    const { generator: remote } = generatorReturning({
      status: "complete",
      candidates: [candidate("Remote")],
    });
    const signal = new AbortController().signal;
    const viaRemote = await generateHiddenCards(
      { local, discover: () => Promise.resolve(remote) },
      [request],
      [],
      signal,
    );
    expect(viaRemote.map((card) => card.term)).toEqual(["Remote"]);
    expect(localGenerate).not.toHaveBeenCalled();
    const viaLocal = await generateHiddenCards(
      { local, discover: () => Promise.resolve(undefined) },
      [request],
      [],
      signal,
    );
    expect(viaLocal.map((card) => card.term)).toEqual(["Local"]);
  });

  it("skips failed requests and does not accept duplicates across requests", async () => {
    const { generator } = generatorReturning(
      { status: "failed", code: "unavailable" },
      { status: "partial", candidates: [candidate("Otter")] },
      { status: "complete", candidates: [candidate("Otter"), candidate("Orca")] },
    );
    const cards = await generateHiddenCards(
      { local: generator },
      [request, request, request],
      [],
      new AbortController().signal,
    );
    expect(cards.map((card) => card.term).sort()).toEqual(["Orca", "Otter"]);
  });

  it("stops as soon as the signal is aborted and reports the cancellation to the generator", async () => {
    const controller = new AbortController();
    const seen: boolean[] = [];
    const generate = vi
      .fn<TabooCardGenerator["generate"]>()
      .mockImplementation((_, cancellation) => {
        const onAbort = vi.fn();
        const unsubscribe = cancellation?.subscribe(onAbort);
        seen.push(cancellation?.aborted ?? true);
        controller.abort();
        seen.push(cancellation?.aborted ?? false);
        unsubscribe?.();
        return Promise.resolve({ status: "complete", candidates: [candidate("Late")] });
      });
    const generator: TabooCardGenerator = {
      capabilities: { languages: ["en"], maxCardsPerRequest: 10, worksOffline: true },
      generate,
    };
    const cards = await generateHiddenCards(
      { local: generator },
      [request, request],
      [],
      controller.signal,
    );
    // The first request ran, the second one was never started.
    expect(generate).toHaveBeenCalledTimes(1);
    expect(seen).toEqual([false, true]);
    expect(cards.map((card) => card.term)).toEqual(["Late"]);
    const none = await generateHiddenCards({ local: generator }, [request], [], controller.signal);
    expect(none).toEqual([]);
    expect(generate).toHaveBeenCalledTimes(1);
  });
});
