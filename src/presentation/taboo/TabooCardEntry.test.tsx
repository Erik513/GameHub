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
    title: "Add card (English)",
    add: "Add card",
    category: "Category",
    newCategory: "New category …",
    newName: "Name of the new category",
    term: "Term",
    words: "Four forbidden words, separated by commas",
    added: "Card added.",
    invalid: "A card needs a term",
    noCategory: "Enter a name for the new category.",
    exists: "This card already exists.",
  },
  de: {
    title: "Karte hinzufügen (Deutsch)",
    add: "Karte hinzufügen",
    category: "Kategorie",
    newCategory: "Neue Kategorie …",
    newName: "Name der neuen Kategorie",
    term: "Begriff",
    words: "Vier verbotene Wörter, mit Komma getrennt",
    added: "Karte hinzugefügt.",
    invalid: "Es braucht einen Begriff",
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
        <TabooCardEntry cardLanguage={language} cards={[]} disabled={false} onAdd={onAdd} />
      </I18nextProvider>,
    );
    expect(screen.getByRole("heading", { name: text.title })).toBeVisible();

    await user.click(screen.getByRole("button", { name: text.add }));
    expect(screen.getByRole("alert")).toHaveTextContent(text.invalid);

    await user.selectOptions(screen.getByLabelText(text.category), text.newCategory);
    await user.type(screen.getByLabelText(text.term), "Goal");
    await user.type(screen.getByLabelText(text.words), "a, b, c, d");
    await user.click(screen.getByRole("button", { name: text.add }));
    expect(screen.getByRole("alert")).toHaveTextContent(text.noCategory);

    await user.type(screen.getByLabelText(text.newName), "  Sport ");
    await user.selectOptions(screen.getByLabelText(/Difficulty|Schwierigkeit/), "hard");
    await user.click(screen.getByRole("button", { name: text.add }));
    expect(onAdd).toHaveBeenCalledOnce();
    expect(onAdd.mock.calls[0]?.[0]).toMatchObject([
      {
        term: "Goal",
        forbiddenWords: ["a", "b", "c", "d"],
        categoryId: "Sport",
        difficulty: "hard",
        language,
      },
    ]);
    expect(screen.getByRole("status")).toHaveTextContent(text.added);
    expect(screen.getByLabelText(text.term)).toHaveValue("");
    expect(screen.getByLabelText(text.term)).toHaveFocus();

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
      <TabooCardEntry cardLanguage="en" cards={[]} disabled={false} onAdd={onAdd} />
    </I18nextProvider>,
  );
  await user.type(screen.getByLabelText("Term"), "Goal");
  await user.type(screen.getByLabelText(/Four forbidden/), "a, b, c");
  await user.click(screen.getByRole("button", { name: "Add card" }));
  expect(screen.getByRole("alert")).toHaveTextContent("four different forbidden words");
  await user.clear(screen.getByLabelText(/Four forbidden/));
  await user.type(screen.getByLabelText(/Four forbidden/), "a, a, b, c");
  await user.click(screen.getByRole("button", { name: "Add card" }));
  expect(screen.getByRole("alert")).toHaveTextContent("four different forbidden words");
  expect(onAdd).not.toHaveBeenCalled();

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
      <TabooCardEntry
        cardLanguage="en"
        cards={[]}
        disabled={false}
        onAdd={() => Promise.reject(new Error("disk"))}
      />
    </I18nextProvider>,
  );
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
  expect(groups[1]).toContainElement(screen.getByRole("checkbox", { name: "Sport" }));
  expect(groups[0]).toContainElement(screen.getByRole("checkbox", { name: "Nature" }));
  expect(screen.getByRole("checkbox", { name: "Sport" })).toBeChecked();
  await user.click(screen.getByRole("checkbox", { name: "Sport" }));
  expect(screen.getByRole("checkbox", { name: "Sport" })).not.toBeChecked();
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
