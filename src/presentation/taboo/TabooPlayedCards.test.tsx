import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { expect, it } from "vitest";
import type { PlayedCardsStore } from "../../business/games/taboo/playedCards";
import { tabooStandardCards } from "../../data/tabooStandardCards";
import { createGameHubI18n } from "../../i18n";
import { closeGameSettings, openGameSettings } from "../testing/gameSettings";
import { PlayedCardsProvider } from "./PlayedCardsProvider";
import { TabooSetup } from "./TabooSetup";

/** A memory in the test, with the lists per language. */
function createStore(initial: readonly string[] = []): PlayedCardsStore & {
  readonly lists: Record<string, readonly string[]>;
} {
  const lists: Record<string, readonly string[]> = { en: initial, de: [] };
  return {
    lists,
    read: (language) => lists[language] ?? [],
    write: (language, ids) => {
      lists[language] = ids;
    },
  };
}

const easy = tabooStandardCards.filter(
  (card) => card.language === "en" && card.difficulty === "easy",
);

async function openCountdown(store: PlayedCardsStore | undefined) {
  const user = userEvent.setup();
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <PlayedCardsProvider store={store}>
        <TabooSetup cardLanguage="en" cards={tabooStandardCards} />
      </PlayedCardsProvider>
    </I18nextProvider>,
  );
  openGameSettings();
  await user.click(
    within(screen.getByRole("group", { name: "Game mode" })).getByRole("radio", {
      name: "Against the clock",
    }),
  );
  // The test plays turns one after the other.
  await user.click(
    within(screen.getByRole("group", { name: "Team change" })).getByRole("radio", {
      name: "Manual",
    }),
  );
  return user;
}

async function startTurn(user: ReturnType<typeof userEvent.setup>) {
  closeGameSettings();
  await user.click(screen.getByRole("button", { name: "Start game" }));
  await user.click(await screen.findByRole("button", { name: "Start turn" }));
  const region = screen.getByRole("region", { name: "Countdown turn" });
  return within(region).getByRole("heading", { level: 2 }).textContent;
}

it("has enough easy cards for the tests below", () => {
  expect(easy.length).toBeGreaterThanOrEqual(14);
});

it("remembers the cards that were shown and only offers the setting when the app has a memory", async () => {
  const without = await openCountdown(undefined);
  await without.click(screen.getByRole("tab", { name: "Categories" }));
  expect(screen.queryByRole("group", { name: "Remember played cards" })).not.toBeInTheDocument();
});

it("remembers a shown card, so the next game prefers cards that were not played", async () => {
  const store = createStore();
  const user = await openCountdown(store);
  const shown = await startTurn(user);
  const card = easy.find((candidate) => candidate.term === shown);
  expect(card).toBeDefined();
  expect(store.lists.en).toEqual([card?.id]);
});

it("does not remember cards when the setting is off", async () => {
  const store = createStore();
  const user = await openCountdown(store);
  await user.click(screen.getByRole("tab", { name: "Categories" }));
  const group = screen.getByRole("group", { name: "Remember played cards" });
  expect(within(group).getByRole("radio", { name: "On" })).toBeChecked();
  await user.click(within(group).getByRole("radio", { name: "Off" }));
  await user.click(screen.getByRole("tab", { name: "Game settings" }));
  await startTurn(user);
  expect(store.lists.en).toEqual([]);
});

it("takes only unplayed cards when they are enough", async () => {
  // All easy cards except ten were played: the game uses one of the ten.
  const fresh = easy.slice(0, 10);
  const store = createStore(easy.slice(10).map((card) => card.id));
  const user = await openCountdown(store);
  const shown = await startTurn(user);
  expect(fresh.map((card) => card.term)).toContain(shown);
});

it("starts the cards anew when the unplayed ones are not enough", async () => {
  // Every easy card was played: the game still starts and the cards count as unplayed again.
  const store = createStore(easy.map((card) => card.id));
  const user = await openCountdown(store);
  const shown = await startTurn(user);
  expect(easy.map((card) => card.term)).toContain(shown);
  // Only the card that is shown now is remembered; the others were forgotten.
  expect(store.lists.en).toHaveLength(1);
});

it("forgets every played card after a second tap on the reset button", async () => {
  const store = createStore(["a", "b", "c"]);
  const user = await openCountdown(store);
  await user.click(screen.getByRole("tab", { name: "Categories" }));
  await user.click(screen.getByRole("button", { name: "Forget played cards (3)" }));
  // A quick double tap does not confirm by accident.
  await new Promise((resolve) => setTimeout(resolve, 650));
  await user.click(screen.getByRole("button", { name: "Tap again to forget" }));
  expect(store.lists.en).toEqual([]);
  expect(screen.queryByRole("button", { name: /^Forget played cards/ })).not.toBeInTheDocument();
});
