import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { IDBFactory } from "fake-indexeddb";
import { I18nextProvider } from "react-i18next";
import { expect, it, vi } from "vitest";
import { parseTabooCardFile, serializeTabooCards } from "../../business/games/taboo/cardExchange";
import type { TabooCard } from "../../business/games/taboo/model";
import { IndexedDbTabooCardRepository } from "../../data/indexedDbTabooCardRepository";
import { createGameHubI18n } from "../../i18n";
import { AppShell } from "../AppShell";
import type { TabooCardPack } from "../../business/games/taboo/cardPack";
import { TabooLibrary } from "./TabooLibrary";

const card: TabooCard = {
  id: "own-moon",
  language: "en",
  term: "Moon",
  forbiddenWords: ["night", "sky", "orbit", "space"],
  categoryId: "nature",
  difficulty: "easy",
};

function upload(text: string) {
  const file = Object.assign(new File([], "cards.json"), { text: () => Promise.resolve(text) });
  fireEvent.change(screen.getByLabelText("Import cards"), { target: { files: [file] } });
}

it("imports once, keeps own cards after a standard deck update and exports a restorable backup", async () => {
  const i18n = await createGameHubI18n("en");
  const factory = new IDBFactory();
  const repository = new IndexedDbTabooCardRepository(factory);
  const view = (repo: IndexedDbTabooCardRepository, cards: readonly TabooCard[]) => (
    <I18nextProvider i18n={i18n}>
      <TabooLibrary repository={repo} cardLanguage="en" cards={cards} />
    </I18nextProvider>
  );
  const { unmount } = render(view(repository, []));
  fireEvent.click(screen.getByRole("button", { name: "Cards" }));
  upload("invalid");
  expect(await screen.findByRole("alert")).toHaveTextContent("not a valid");
  upload(serializeTabooCards([card]));
  expect(await screen.findByText(/Imported cards: 1/)).toBeVisible();
  upload(serializeTabooCards([card]));
  expect(await screen.findByText(/Imported cards: 0/)).toBeVisible();
  unmount();
  const reopened = new IndexedDbTabooCardRepository(factory);
  render(view(reopened, [{ ...card, id: "standard-sun", term: "Sun" }]));
  fireEvent.click(screen.getByRole("button", { name: "Cards" }));
  fireEvent.click(await screen.findByText("Nature", { selector: "summary span" }));
  const exportButton = await screen.findByRole("button", { name: "Export category Nature" });
  const createUrl = vi.fn<(blob: Blob) => string>().mockReturnValue("blob:test");
  vi.stubGlobal(
    "URL",
    Object.assign(class extends URL {}, {
      createObjectURL: createUrl,
      revokeObjectURL: vi.fn(),
    }),
  );
  const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
  try {
    fireEvent.click(exportButton);
    expect(click).toHaveBeenCalledOnce();
    const blob = createUrl.mock.calls[0]![0];
    const text = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
      reader.readAsText(blob);
    });
    expect(parseTabooCardFile(text)).toEqual([card]);
    expect(await reopened.list()).toEqual([card]);
  } finally {
    vi.unstubAllGlobals();
  }
});

it("reports a storage error when the saved cards cannot be read or written", async () => {
  const i18n = await createGameHubI18n("en");
  const failing = {
    list: vi.fn().mockRejectedValue(new Error("no storage")),
    addAll: vi.fn().mockRejectedValue(new Error("no storage")),
    update: vi.fn().mockRejectedValue(new Error("no storage")),
    remove: vi.fn().mockRejectedValue(new Error("no storage")),
  };
  render(
    <I18nextProvider i18n={i18n}>
      <TabooLibrary repository={failing} cardLanguage="en" cards={[]} />
    </I18nextProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Cards" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Local cards could not be accessed.");
  // Importing fails the same way and no category offers an export without own cards.
  upload(serializeTabooCards([card]));
  await waitFor(() => expect(failing.list).toHaveBeenCalledTimes(2));
  expect(await screen.findByRole("alert")).toBeVisible();
  expect(screen.queryByRole("button", { name: /^Export category/ })).not.toBeInTheDocument();
});

it("ignores an empty file selection and works without a repository", async () => {
  const i18n = await createGameHubI18n("en");
  const { unmount } = render(
    <I18nextProvider i18n={i18n}>
      <TabooLibrary repository={undefined} cardLanguage="en" cards={[]} />
    </I18nextProvider>,
  );
  expect(screen.queryByRole("button", { name: "Cards" })).not.toBeInTheDocument();
  unmount();
  const repository = {
    list: vi.fn().mockResolvedValue([]),
    addAll: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };
  render(
    <I18nextProvider i18n={i18n}>
      <TabooLibrary repository={repository} cardLanguage="en" cards={[]} />
    </I18nextProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Cards" }));
  fireEvent.change(screen.getByLabelText("Import cards"), { target: { files: [] } });
  expect(repository.addAll).not.toHaveBeenCalled();
});

it("shows the card tools on their own page with the back button in the app header", async () => {
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <AppShell
        cardLanguage="en"
        currentRoute="/games/taboo"
        gameTitle="Taboo"
        onCardLanguageChange={vi.fn()}
        onCloseGame={vi.fn()}
        onLanguageChange={vi.fn()}
      >
        <TabooLibrary
          cardLanguage="en"
          cards={[]}
          repository={new IndexedDbTabooCardRepository(new IDBFactory())}
        />
      </AppShell>
    </I18nextProvider>,
  );
  const header = within(screen.getByRole("banner"));
  // The setup shows settings and home in the header; the back button is not there yet.
  expect(header.getByRole("button", { name: "Settings" })).toBeVisible();
  expect(header.getByRole("button", { name: "Close game" })).toBeVisible();
  expect(header.queryByRole("button", { name: "Back" })).not.toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "Custom Taboo cards" })).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Cards" }));
  expect(screen.getByRole("heading", { name: "Custom Taboo cards" })).toBeVisible();
  expect(header.getByRole("button", { name: "Back" })).toBeVisible();
  expect(header.queryByRole("button", { name: "Settings" })).not.toBeInTheDocument();
  expect(header.queryByRole("button", { name: "Close game" })).not.toBeInTheDocument();

  fireEvent.click(header.getByRole("button", { name: "Back" }));
  expect(screen.queryByRole("heading", { name: "Custom Taboo cards" })).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Cards" })).toBeVisible();
  expect(header.getByRole("button", { name: "Settings" })).toBeVisible();
});

it("opens the file chooser from the import button", async () => {
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <TabooLibrary
        cardLanguage="en"
        cards={[]}
        repository={new IndexedDbTabooCardRepository(new IDBFactory())}
      />
    </I18nextProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Cards" }));
  const chooser = vi.spyOn(HTMLInputElement.prototype, "click").mockImplementation(() => undefined);
  fireEvent.click(screen.getByRole("button", { name: "Import cards" }));
  expect(chooser).toHaveBeenCalledOnce();
  chooser.mockRestore();
});

const foodPack = (language: "de" | "en"): TabooCardPack => ({
  language,
  categories: [
    { id: "everyday", names: { de: "Alltag", en: "Everyday life" } },
    { id: "food", names: { de: "Essen und Trinken", en: "Food and drink" } },
    { id: "animals", names: { de: "Tiere", en: "Animals" } },
  ],
  cards: [
    {
      id: `pool-pizza-${language}`,
      language,
      term: "Pizza",
      forbiddenWords: ["cheese", "dough", "Italy", "oven"],
      categoryId: "food",
      difficulty: "easy",
    },
  ],
});

it.each([
  ["en", "Food and drink", "Animals"],
  ["de", "Essen und Trinken", "Tiere"],
] as const)(
  "offers categories of the loaded card pack once they have cards in %s",
  async (language, food, animals) => {
    const i18n = await createGameHubI18n(language);
    const loadCardPack = vi.fn((requested: "de" | "en") => Promise.resolve(foodPack(requested)));
    render(
      <I18nextProvider i18n={i18n}>
        <TabooLibrary
          cardLanguage={language}
          cards={[]}
          loadCardPack={loadCardPack}
          repository={new IndexedDbTabooCardRepository(new IDBFactory())}
        />
      </I18nextProvider>,
    );
    // The category with a pack card appears in the setup, the empty one does not.
    expect(await screen.findByRole("checkbox", { name: food })).toBeChecked();
    expect(screen.queryByRole("checkbox", { name: animals })).not.toBeInTheDocument();
    expect(loadCardPack).toHaveBeenCalledWith(language);

    // On the card page every pack category can be chosen for a new card.
    fireEvent.click(screen.getByRole("button", { name: language === "de" ? "Karten" : "Cards" }));
    const select = screen.getAllByRole("combobox")[0]!;
    expect(within(select).getByRole("option", { name: animals })).toBeInTheDocument();
    expect(screen.getByText(food, { selector: "summary span" })).toBeInTheDocument();
    expect(screen.queryByText(animals, { selector: "summary span" })).not.toBeInTheDocument();
  },
);

it("keeps the built-in cards when the pack is missing, fails or is for another language", async () => {
  const i18n = await createGameHubI18n("en");
  const view = (load: (language: "de" | "en") => Promise<TabooCardPack | undefined>) => (
    <I18nextProvider i18n={i18n}>
      <TabooLibrary cardLanguage="en" cards={[card]} loadCardPack={load} repository={undefined} />
    </I18nextProvider>
  );
  const { rerender } = render(view(() => Promise.resolve(undefined)));
  expect(screen.getByRole("checkbox", { name: "Nature" })).toBeChecked();
  rerender(view(() => Promise.reject(new Error("offline"))));
  await waitFor(() => expect(screen.getByRole("checkbox", { name: "Nature" })).toBeChecked());
  rerender(view(() => Promise.resolve(foodPack("de"))));
  await new Promise((resolve) => setTimeout(resolve, 20));
  expect(screen.queryByRole("checkbox", { name: "Food and drink" })).not.toBeInTheDocument();
});
