import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { expect, it, vi } from "vitest";
import type { TabooCardGenerator } from "../../business/games/taboo/cardGenerator";
import { createGameHubI18n } from "../../i18n";
import { tabooStandardCards } from "../../data/tabooStandardCards";
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
