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
    cards: "Cards",
    add: "Add cards",
    category: "Category",
    newCategory: "New category …",
    newName: "Name of the new category",
    added: "Added: 2, already existed: 0.",
    invalid: "These lines are invalid: 2.",
    noCategory: "Enter a name for the new category.",
    noCards: "Enter at least one card.",
  },
  de: {
    cards: "Karten",
    add: "Karten hinzufügen",
    category: "Kategorie",
    newCategory: "Neue Kategorie …",
    newName: "Name der neuen Kategorie",
    added: "Hinzugefügt: 2, schon vorhanden: 0.",
    invalid: "Diese Zeilen sind ungültig: 2.",
    noCategory: "Gib einen Namen für die neue Kategorie ein.",
    noCards: "Gib mindestens eine Karte ein.",
  },
} as const;

it.each(["en", "de"] as const)(
  "adds several cards to a new category and validates the input in %s",
  async (language) => {
    const text = labels[language];
    const user = userEvent.setup();
    const i18n = await createGameHubI18n(language);
    const onAdd = vi.fn((cards: readonly TabooCard[]) => Promise.resolve(cards.length));
    render(
      <I18nextProvider i18n={i18n}>
        <TabooCardEntry cardLanguage={language} cards={[]} disabled={false} onAdd={onAdd} />
      </I18nextProvider>,
    );

    await user.click(screen.getByRole("button", { name: text.add }));
    expect(screen.getByRole("alert")).toHaveTextContent(text.noCards);

    await user.selectOptions(screen.getByLabelText(text.category), text.newCategory);
    await user.type(screen.getByLabelText(text.cards), "Goal: a, b, c, d");
    await user.click(screen.getByRole("button", { name: text.add }));
    expect(screen.getByRole("alert")).toHaveTextContent(text.noCategory);

    await user.type(screen.getByLabelText(text.newName), "  Sport ");
    await user.clear(screen.getByLabelText(text.cards));
    await user.type(screen.getByLabelText(text.cards), "Goal: a, b, c, d{enter}Broken line");
    await user.click(screen.getByRole("button", { name: text.add }));
    expect(screen.getByRole("alert")).toHaveTextContent(text.invalid);
    expect(onAdd).not.toHaveBeenCalled();

    await user.clear(screen.getByLabelText(text.cards));
    await user.type(screen.getByLabelText(text.cards), "Goal: a, b, c, d{enter}Net: e, f, g, h");
    await user.click(screen.getByRole("button", { name: text.add }));
    expect(onAdd).toHaveBeenCalledOnce();
    const saved = onAdd.mock.calls[0]?.[0] ?? [];
    expect(saved.map((card) => [card.term, card.categoryId, card.language])).toEqual([
      ["Goal", "Sport", language],
      ["Net", "Sport", language],
    ]);
    expect(screen.getByRole("status")).toHaveTextContent(text.added);
  },
);

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
  await user.type(screen.getByLabelText("Cards"), "Goal: a, b, c, d");
  await user.click(screen.getByRole("button", { name: "Add cards" }));
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
  await user.click(screen.getByText("More options"));
  expect(screen.getByRole("checkbox", { name: "Sport" })).toBeChecked();
  await user.click(screen.getByRole("checkbox", { name: "Sport" }));
  expect(screen.getByRole("checkbox", { name: "Sport" })).not.toBeChecked();
});
