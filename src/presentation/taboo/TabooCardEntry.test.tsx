import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { expect, it, vi } from "vitest";
import type { TabooCard } from "../../business/games/taboo/model";
import { createGameHubI18n } from "../../i18n";
import { tabooStandardCards } from "../../data/tabooStandardCards";
import { TabooCardEntry } from "./TabooCardEntry";
import { TabooSetup } from "./TabooSetup";

const labels = {
  en: {
    title: "Add card",
    add: "Add card",
    category: "Category",
    newCategory: "New category …",
    newName: "Name of the new category",
    term: "Term",
    words: "Four forbidden words, separated by commas",
    added: "Card added.",
    invalid: "Enter a term.",
    noCategory: "Enter a name for the new category.",
    exists: "This card already exists.",
  },
  de: {
    title: "Karte hinzufügen",
    add: "Karte hinzufügen",
    category: "Kategorie",
    newCategory: "Neue Kategorie …",
    newName: "Name der neuen Kategorie",
    term: "Begriff",
    words: "Vier verbotene Wörter, mit Komma getrennt",
    added: "Karte hinzugefügt.",
    invalid: "Gib einen Begriff ein.",
    noCategory: "Gib einen Namen für die neue Kategorie ein.",
    exists: "Diese Karte gibt es schon.",
  },
} as const;

it.each(["en", "de"] as const)(
  "adds a card to a new category and validates the input in %s",
  async (language) => {
    const text = labels[language];
    const user = userEvent.setup();
    const i18n = await createGameHubI18n(language);
    let known = 0;
    const onAdd = vi.fn((cards: readonly TabooCard[]) => {
      known += 1;
      return Promise.resolve(known === 1 ? cards.length : 0);
    });
    render(
      <I18nextProvider i18n={i18n}>
        <TabooCardEntry cards={[]} disabled={false} onAdd={onAdd} />
      </I18nextProvider>,
    );
    expect(screen.getByRole("heading", { name: text.title })).toBeVisible();

    // Without an own category the form starts with a new one, which needs a name first.
    expect(screen.getByLabelText(text.category)).toHaveDisplayValue(text.newCategory);
    await user.click(screen.getByRole("button", { name: text.add }));
    expect(screen.getByRole("alert")).toHaveTextContent(text.noCategory);

    await user.type(screen.getByLabelText(text.newName), "  Sport ");
    await user.click(screen.getByRole("button", { name: text.add }));
    expect(screen.getByRole("alert")).toHaveTextContent(text.invalid);

    await user.type(screen.getByLabelText(text.term), "Goal");
    await user.type(screen.getByLabelText(text.words), "a, b, c, d");
    await user.selectOptions(screen.getByLabelText(/Difficulty|Schwierigkeit/), "hard");
    await user.click(screen.getByRole("button", { name: text.add }));
    expect(onAdd).toHaveBeenCalledOnce();
    expect(onAdd.mock.calls[0]?.[0]).toMatchObject([
      {
        term: "Goal",
        // The first letters are capital letters automatically.
        forbiddenWords: ["A", "B", "C", "D"],
        categoryId: "Sport",
        difficulty: "hard",
        // English is the primary language, so a new category starts with English.
        language: "en",
      },
    ]);
    expect(screen.getByRole("status")).toHaveTextContent(text.added);
    expect(screen.getByLabelText(text.term)).toHaveValue("");
    expect(screen.getByLabelText(text.term)).toHaveFocus();

    // The cards of this test do not change, so the new category is typed again.
    await user.type(screen.getByLabelText(text.newName), "Sport");
    await user.type(screen.getByLabelText(text.term), "Goal");
    await user.type(screen.getByLabelText(text.words), "a, b, c, d");
    await user.click(screen.getByRole("button", { name: text.add }));
    expect(screen.getByRole("alert")).toHaveTextContent(text.exists);
    expect(screen.getByLabelText(text.term)).toHaveValue("Goal");
  },
);

it("rejects too few or repeated forbidden words and a term with a colon", async () => {
  const user = userEvent.setup();
  const i18n = await createGameHubI18n("en");
  const onAdd = vi.fn((cards: readonly TabooCard[]) => Promise.resolve(cards.length));
  render(
    <I18nextProvider i18n={i18n}>
      <TabooCardEntry cards={[]} disabled={false} onAdd={onAdd} />
    </I18nextProvider>,
  );
  await user.type(screen.getByLabelText("Name of the new category"), "Sport");
  await user.type(screen.getByLabelText("Term"), "Goal");
  await user.type(screen.getByLabelText(/Four forbidden/), "a, b, c");
  await user.click(screen.getByRole("button", { name: "Add card" }));
  expect(screen.getByRole("alert")).toHaveTextContent("Enter exactly four forbidden words");
  // The same word twice (also in another case or with spaces) is explained.
  await user.clear(screen.getByLabelText(/Four forbidden/));
  await user.type(screen.getByLabelText(/Four forbidden/), "a, A , b, c");
  await user.click(screen.getByRole("button", { name: "Add card" }));
  expect(screen.getByRole("alert")).toHaveTextContent("A forbidden word appears twice");
  // The term itself and a part of it are explained, too.
  await user.clear(screen.getByLabelText(/Four forbidden/));
  await user.type(screen.getByLabelText(/Four forbidden/), "goal, b, c, d");
  await user.click(screen.getByRole("button", { name: "Add card" }));
  expect(screen.getByRole("alert")).toHaveTextContent("A forbidden word is the term itself");
  await user.clear(screen.getByLabelText("Term"));
  await user.type(screen.getByLabelText("Term"), "Football");
  await user.clear(screen.getByLabelText(/Four forbidden/));
  await user.type(screen.getByLabelText(/Four forbidden/), "ball, b, c, d");
  await user.click(screen.getByRole("button", { name: "Add card" }));
  expect(screen.getByRole("alert")).toHaveTextContent("A forbidden word is part of the term");
  expect(onAdd).not.toHaveBeenCalled();
  await user.clear(screen.getByLabelText("Term"));
  await user.type(screen.getByLabelText("Term"), "Goal");

  await user.clear(screen.getByLabelText("Term"));
  await user.type(screen.getByLabelText("Term"), "Re: Goal");
  await user.clear(screen.getByLabelText(/Four forbidden/));
  await user.type(screen.getByLabelText(/Four forbidden/), "a, b, c, d");
  await user.click(screen.getByRole("button", { name: "Add card" }));
  expect(onAdd.mock.calls[0]?.[0]).toMatchObject([{ term: "Re Goal" }]);
});

it("reports a storage failure", async () => {
  const user = userEvent.setup();
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <TabooCardEntry cards={[]} disabled={false} onAdd={() => Promise.reject(new Error("disk"))} />
    </I18nextProvider>,
  );
  await user.type(screen.getByLabelText("Name of the new category"), "Sport");
  await user.type(screen.getByLabelText("Term"), "Goal");
  await user.type(screen.getByLabelText(/Four forbidden/), "a, b, c, d");
  await user.click(screen.getByRole("button", { name: "Add card" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("could not be saved");
});

it("offers a custom category as a filter in the setup", async () => {
  const user = userEvent.setup();
  const i18n = await createGameHubI18n("en");
  const own: TabooCard = {
    id: "own-1",
    language: "en",
    term: "Goal",
    forbiddenWords: ["a", "b", "c", "d"],
    categoryId: "Sport",
    difficulty: "easy",
  };
  render(
    <I18nextProvider i18n={i18n}>
      <TabooSetup cardLanguage="en" cards={[own, ...tabooStandardCards]} roundChoices={[1]} />
    </I18nextProvider>,
  );
  const groups = [...document.querySelectorAll(".taboo-category-group")];
  expect(groups.map((group) => group.querySelector("small")?.textContent)).toEqual([
    "Standard",
    "Own",
  ]);
  expect(groups[1]).toContainElement(screen.getByRole("checkbox", { name: "Sport (EN)" }));
  expect(groups[0]).toContainElement(screen.getByRole("checkbox", { name: "Nature" }));
  expect(screen.getByRole("checkbox", { name: "Sport (EN)" })).toBeChecked();
  await user.click(screen.getByRole("checkbox", { name: "Sport (EN)" }));
  expect(screen.getByRole("checkbox", { name: "Sport (EN)" })).not.toBeChecked();
});

it("shows no group labels while there are only standard categories", async () => {
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <TabooSetup cardLanguage="en" cards={tabooStandardCards} roundChoices={[1]} />
    </I18nextProvider>,
  );
  expect(document.querySelectorAll(".taboo-category-group")).toHaveLength(1);
  expect(document.querySelector(".taboo-category-group small")).toBeNull();
});

it("offers only own categories with their language and gives a card the language of its category", async () => {
  const user = userEvent.setup();
  const i18n = await createGameHubI18n("en");
  const own = (id: string, categoryId: string, language: "de" | "en"): TabooCard => ({
    id,
    language,
    term: `Term ${id}`,
    forbiddenWords: ["a", "b", "c", "d"],
    categoryId,
    difficulty: "easy",
  });
  const onAdd = vi.fn((cards: readonly TabooCard[]) => Promise.resolve(cards.length));
  render(
    <I18nextProvider i18n={i18n}>
      <TabooCardEntry
        cards={[own("1", "Sport", "de"), own("2", "Sport", "en"), ...tabooStandardCards]}
        disabled={false}
        onAdd={onAdd}
      />
    </I18nextProvider>,
  );
  // Standard categories cannot be chosen; the same name in two languages is two categories.
  const select = screen.getByLabelText("Category");
  const options = [...select.querySelectorAll("option")].map((option) => option.textContent);
  expect(options).toEqual(["Sport (DE)", "Sport (EN)", "New category …"]);

  // A card of an own category has the language of that category.
  await user.selectOptions(select, "Sport (DE)");
  await user.type(screen.getByLabelText("Term"), "Tor");
  await user.type(screen.getByLabelText(/Four forbidden/), "a, b, c, d");
  await user.click(screen.getByRole("button", { name: "Add card" }));
  expect(onAdd.mock.calls[0]?.[0]).toMatchObject([
    { term: "Tor", categoryId: "Sport", language: "de" },
  ]);

  // A new category gets its own language.
  await user.selectOptions(select, "New category …");
  await user.type(screen.getByLabelText("Name of the new category"), "Food");
  const languageSelect = screen.getByLabelText("Category language");
  expect(
    [...languageSelect.querySelectorAll("option")].map((option) => option.textContent),
  ).toEqual(["English", "German"]);
  expect(languageSelect).toHaveDisplayValue("English");
  await user.selectOptions(languageSelect, "German");
  await user.type(screen.getByLabelText("Term"), "Brot");
  await user.type(screen.getByLabelText(/Four forbidden/), "a, b, c, d");
  await user.click(screen.getByRole("button", { name: "Add card" }));
  expect(onAdd.mock.calls[1]?.[0]).toMatchObject([
    { term: "Brot", categoryId: "Food", language: "de" },
  ]);
});

it("shows the examples in the fields in the language of the category", async () => {
  const user = userEvent.setup();
  // The interface is German, the examples follow the language of the category.
  const i18n = await createGameHubI18n("de");
  const own: TabooCard = {
    id: "1",
    language: "en",
    term: "Goal",
    forbiddenWords: ["a", "b", "c", "d"],
    categoryId: "Sport",
    difficulty: "easy",
  };
  render(
    <I18nextProvider i18n={i18n}>
      <TabooCardEntry cards={[own]} disabled={false} onAdd={() => Promise.resolve(1)} />
    </I18nextProvider>,
  );
  // The first own category is English.
  expect(screen.getByLabelText("Begriff")).toHaveAttribute("placeholder", "Goal");
  expect(screen.getByLabelText(/Vier verbotene/)).toHaveAttribute(
    "placeholder",
    "ball, net, score, keeper",
  );

  // A new category: the examples follow the language that is chosen for it.
  await user.selectOptions(screen.getByLabelText("Kategorie"), "Neue Kategorie …");
  expect(screen.getByLabelText("Begriff")).toHaveAttribute("placeholder", "Goal");
  await user.selectOptions(screen.getByLabelText("Sprache der Kategorie"), "Deutsch");
  expect(screen.getByLabelText("Begriff")).toHaveAttribute("placeholder", "Tor");
  expect(screen.getByLabelText(/Vier verbotene/)).toHaveAttribute(
    "placeholder",
    "Ball, Netz, Treffer, Keeper",
  );
});

it("makes the first letter of the term and of the forbidden words a capital letter", async () => {
  const user = userEvent.setup();
  const i18n = await createGameHubI18n("en");
  const onAdd = vi.fn((cards: readonly TabooCard[]) => Promise.resolve(cards.length));
  render(
    <I18nextProvider i18n={i18n}>
      <TabooCardEntry cards={[]} disabled={false} onAdd={onAdd} />
    </I18nextProvider>,
  );
  await user.type(screen.getByLabelText("Name of the new category"), "Sport");
  await user.type(screen.getByLabelText("Term"), "football");
  await user.type(screen.getByLabelText(/Four forbidden/), "goal, net,keeper , referee");
  await user.click(screen.getByRole("button", { name: "Add card" }));
  expect(onAdd.mock.calls[0]?.[0]).toMatchObject([
    { term: "Football", forbiddenWords: ["Goal", "Net", "Keeper", "Referee"] },
  ]);
});

it("makes the first letter of a new category name a capital letter", async () => {
  const user = userEvent.setup();
  const i18n = await createGameHubI18n("en");
  const onAdd = vi.fn((cards: readonly TabooCard[]) => Promise.resolve(cards.length));
  render(
    <I18nextProvider i18n={i18n}>
      <TabooCardEntry cards={[]} disabled={false} onAdd={onAdd} />
    </I18nextProvider>,
  );
  await user.type(screen.getByLabelText("Name of the new category"), "ball games");
  await user.type(screen.getByLabelText("Term"), "Goal");
  await user.type(screen.getByLabelText(/Four forbidden/), "a, b, c, d");
  await user.click(screen.getByRole("button", { name: "Add card" }));
  expect(onAdd.mock.calls[0]?.[0]).toMatchObject([{ categoryId: "Ball games" }]);
});
