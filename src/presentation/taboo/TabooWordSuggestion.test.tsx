import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IDBFactory } from "fake-indexeddb";
import { I18nextProvider } from "react-i18next";
import { expect, it, vi } from "vitest";
import type { TabooCard } from "../../business/games/taboo/model";
import type {
  ForbiddenWordsResult,
  TabooWordSuggester,
} from "../../business/games/taboo/wordSuggester";
import { IndexedDbTabooCardRepository } from "../../data/indexedDbTabooCardRepository";
import { createGameHubI18n } from "../../i18n";
import { TabooCardEntry } from "./TabooCardEntry";
import { TabooLibrary } from "./TabooLibrary";

const texts = {
  en: {
    suggest: "Suggest words with AI",
    term: "Term",
    words: "Four forbidden words, separated by commas",
    needTerm: "Enter a term first.",
    failed: "The AI could not suggest suitable words.",
    manage: "Manage own cards",
  },
  de: {
    suggest: "Wörter mit KI vorschlagen",
    term: "Begriff",
    words: "Vier verbotene Wörter, mit Komma getrennt",
    needTerm: "Gib zuerst einen Begriff ein.",
    failed: "Die KI konnte keine passenden Wörter vorschlagen.",
    manage: "Eigene Karten verwalten",
  },
} as const;

function suggesterReturning(result: ForbiddenWordsResult) {
  return { suggest: vi.fn(() => Promise.resolve(result)) } satisfies TabooWordSuggester;
}

async function renderEntry(language: "en" | "de", suggester?: TabooWordSuggester) {
  const i18n = await createGameHubI18n(language);
  render(
    <I18nextProvider i18n={i18n}>
      <TabooCardEntry
        cardLanguage={language}
        cards={[]}
        disabled={false}
        onAdd={() => Promise.resolve(1)}
        suggester={suggester}
      />
    </I18nextProvider>,
  );
  return userEvent.setup();
}

it("shows no suggestion button without a local AI", async () => {
  await renderEntry("en");
  expect(screen.queryByRole("button", { name: texts.en.suggest })).not.toBeInTheDocument();
});

it.each(["en", "de"] as const)(
  "fills the forbidden words from the AI suggestion in %s",
  async (language) => {
    const text = texts[language];
    const suggester = suggesterReturning({
      status: "complete",
      words: [" night ", "sky", "Moon", "orbit", "space", "star"],
    });
    const user = await renderEntry(language, suggester);

    await user.click(screen.getByRole("button", { name: text.suggest }));
    expect(screen.getByRole("alert")).toHaveTextContent(text.needTerm);
    expect(suggester.suggest).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText(text.term), "Moon");
    await user.click(screen.getByRole("button", { name: text.suggest }));
    expect(suggester.suggest).toHaveBeenCalledWith({
      categoryId: "everyday",
      language,
      term: "Moon",
    });
    expect(await screen.findByDisplayValue("night, sky, orbit, space")).toBeVisible();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  },
);

it.each([
  ["failed", { status: "failed", code: "unavailable" }],
  ["unusable", { status: "complete", words: ["only", "two"] }],
] as const)("explains a %s AI answer and keeps the words field", async (_name, result) => {
  const user = await renderEntry("en", suggesterReturning(result));
  await user.type(screen.getByLabelText(texts.en.term), "Moon");
  await user.type(screen.getByLabelText(texts.en.words), "keep");
  await user.click(screen.getByRole("button", { name: texts.en.suggest }));
  expect(await screen.findByRole("alert")).toHaveTextContent(texts.en.failed);
  expect(screen.getByLabelText(texts.en.words)).toHaveValue("keep");
});

it("looks for the AI when the card page opens and offers it in the editor", async () => {
  const user = userEvent.setup();
  const i18n = await createGameHubI18n("en");
  const repository = new IndexedDbTabooCardRepository(new IDBFactory());
  const own: TabooCard = {
    id: "own-moon",
    language: "en",
    term: "Moon",
    forbiddenWords: ["night", "sky", "orbit", "space"],
    categoryId: "Space",
    difficulty: "easy",
  };
  await repository.addAll([own]);
  const suggester = suggesterReturning({
    status: "complete",
    words: ["dark", "planet", "crater", "tide"],
  });
  const find = vi.fn(() => Promise.resolve<TabooWordSuggester | undefined>(suggester));
  render(
    <I18nextProvider i18n={i18n}>
      <TabooLibrary cardLanguage="en" cards={[]} findWordSuggester={find} repository={repository} />
    </I18nextProvider>,
  );
  expect(find).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: texts.en.manage }));
  expect(find).toHaveBeenCalledOnce();

  await user.click(await screen.findByText("Space", { selector: "summary span" }));
  await user.click(screen.getByRole("button", { name: "Edit card Moon" }));
  const suggestButtons = screen.getAllByRole("button", { name: texts.en.suggest });
  await user.click(suggestButtons.at(-1)!);
  expect(suggester.suggest).toHaveBeenCalledWith({
    categoryId: "Space",
    language: "en",
    term: "Moon",
  });
  expect(await screen.findByDisplayValue("dark, planet, crater, tide")).toBeVisible();
});

it("keeps the card page working when no local AI is found", async () => {
  const user = userEvent.setup();
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <TabooLibrary
        cardLanguage="en"
        cards={[]}
        findWordSuggester={() => Promise.resolve(undefined)}
        repository={new IndexedDbTabooCardRepository(new IDBFactory())}
      />
    </I18nextProvider>,
  );
  await user.click(screen.getByRole("button", { name: texts.en.manage }));
  expect(screen.getByRole("heading", { name: "Add card (English)" })).toBeVisible();
  expect(screen.queryByRole("button", { name: texts.en.suggest })).not.toBeInTheDocument();
});
