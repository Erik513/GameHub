import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IDBFactory } from "fake-indexeddb";
import { I18nextProvider } from "react-i18next";
import { expect, it, vi } from "vitest";
import type { TabooCard } from "../../business/games/taboo/model";
import { IndexedDbTabooCardRepository } from "../../data/indexedDbTabooCardRepository";
import { createGameHubI18n } from "../../i18n";
import { TabooCardList } from "./TabooCardList";
import { TabooLibrary } from "./TabooLibrary";

const moon: TabooCard = {
  id: "own-moon",
  language: "en",
  term: "Moon",
  forbiddenWords: ["night", "sky", "orbit", "space"],
  categoryId: "nature",
  difficulty: "easy",
};
const goal: TabooCard = {
  id: "own-goal",
  language: "en",
  term: "Goal",
  forbiddenWords: ["ball", "net", "score", "keeper"],
  categoryId: "Sport",
  difficulty: "medium",
};
const sun: TabooCard = {
  id: "std-sun",
  language: "en",
  term: "Sun",
  forbiddenWords: ["star", "hot", "day", "light"],
  categoryId: "nature",
  difficulty: "hard",
};
const mond: TabooCard = { ...sun, id: "std-mond", language: "de", term: "Mond" };

async function renderList(
  overrides: Partial<Parameters<typeof TabooCardList>[0]> = {},
  language: "en" | "de" = "en",
) {
  const user = userEvent.setup();
  const i18n = await createGameHubI18n(language);
  const onUpdate = vi.fn(() => Promise.resolve());
  const onRemove = vi.fn(() => Promise.resolve());
  const onRenameCategory = vi.fn(() => Promise.resolve());
  render(
    <I18nextProvider i18n={i18n}>
      <TabooCardList
        allCards={[moon, goal, sun, mond]}
        cardLanguage="en"
        disabled={false}
        onRemove={onRemove}
        onRenameCategory={onRenameCategory}
        onUpdate={onUpdate}
        ownCards={[moon, goal]}
        standardCards={[sun, mond]}
        {...overrides}
      />
    </I18nextProvider>,
  );
  return { user, onUpdate, onRemove, onRenameCategory };
}

/** The names of the categories in the list that is shown. */
function categoryNames() {
  return [...document.querySelectorAll(".kit-nav-row > span:first-child")].map(
    (item) => item.textContent,
  );
}

/** Opens a category: goes back to the list, chooses its view (Standard or Own) and taps its row. */
async function openCategory(
  user: ReturnType<typeof userEvent.setup>,
  name: string,
  view: "Standard" | "Own" = "Standard",
) {
  const back = screen.queryByRole("button", {
    name: /Back to the categories|Zurück zu den Kategorien/,
  });
  if (back) await user.click(back);
  await user.click(
    screen.getByRole("radio", { name: view === "Own" ? /^(Own|Eigene)$/ : "Standard" }),
  );
  const row = [...document.querySelectorAll<HTMLElement>(".kit-nav-row")].find(
    (item) => item.querySelector("span")?.textContent === name,
  );
  await user.click(row!);
}

it("shows the standard and the own categories as two views and the cards of an opened category from easy to hard", async () => {
  const { user } = await renderList();
  expect(screen.getByRole("group", { name: "Cards by category" })).toBeVisible();
  // Standard categories first, alphabetical, only with the count: no chapters to fold out.
  expect(categoryNames()).toEqual(["Culture", "Everyday life", "Nature"]);
  expect(document.querySelector("details")).toBeNull();
  expect(screen.getByRole("radio", { name: "Standard" })).toBeChecked();
  const nature = [...document.querySelectorAll(".kit-nav-row")].find((row) =>
    row.textContent?.startsWith("Nature"),
  )!;
  expect(nature).toHaveTextContent("2");

  // The second view lists the own categories with their language.
  await user.click(screen.getByRole("radio", { name: "Own" }));
  expect(categoryNames()).toEqual(["Sport (EN)"]);

  await openCategory(user, "Nature");
  const rows = screen.getAllByRole("listitem");
  expect(rows.map((row) => row.querySelector("strong")?.textContent)).toEqual(["Moon", "Sun"]);
  // Own and built-in cards of a category are separate blocks with labels.
  const labels = [...document.querySelectorAll(".taboo-card-list__label")].map(
    (label) => label.textContent,
  );
  expect(labels).toEqual(["Own cards", "Built-in cards"]);
  expect(rows[0]).toHaveTextContent("night · sky · orbit · space");
  expect(rows[1]).toHaveTextContent("Hard");
  // Only own cards can be edited, and cards of the other language are not shown.
  expect(within(rows[0]!).getByRole("button", { name: "Edit card Moon" })).toBeVisible();
  expect(within(rows[1]!).queryByRole("button")).toBeNull();
  expect(screen.queryByText("Mond")).not.toBeInTheDocument();
  // The way back stays in the header; it leads to the list of the view.
  await user.click(screen.getByRole("button", { name: "Back to the categories" }));
  expect(categoryNames()).toEqual(["Culture", "Everyday life", "Nature"]);
});

it("tells where to create an own category while there is none", async () => {
  const { user } = await renderList({ allCards: [sun], ownCards: [], standardCards: [sun] });
  await user.click(screen.getByRole("radio", { name: "Own" }));
  expect(screen.getByText(/You do not have any own categories yet/)).toBeVisible();
});

it("edits a card, validates the input and saves a new category", async () => {
  const { user, onUpdate } = await renderList();
  await openCategory(user, "Nature");
  await user.click(screen.getByRole("button", { name: "Edit card Moon" }));
  const words = () => screen.getByLabelText("Four forbidden words, separated by commas");

  await user.clear(words());
  await user.type(words(), "night, sky, orbit");
  await user.click(screen.getByRole("button", { name: "Save" }));
  expect(screen.getByRole("alert")).toHaveTextContent("Enter exactly four forbidden words");

  await user.clear(screen.getByLabelText("Term"));
  await user.type(screen.getByLabelText("Term"), "Sun");
  await user.clear(words());
  await user.type(words(), "night, sky, orbit, space");
  await user.click(screen.getByRole("button", { name: "Save" }));
  expect(screen.getByRole("alert")).toHaveTextContent("already exists");
  expect(onUpdate).not.toHaveBeenCalled();

  await user.clear(screen.getByLabelText("Term"));
  await user.type(screen.getByLabelText("Term"), "Full moon");
  await user.selectOptions(screen.getByLabelText("Category"), "New category …");
  await user.click(screen.getByRole("button", { name: "Save" }));
  expect(screen.getByRole("alert")).toHaveTextContent("Enter a name");
  await user.type(screen.getByLabelText("Name of the new category"), "Space");
  await user.click(screen.getByRole("radio", { name: "Hard" }));
  await user.click(screen.getByRole("button", { name: "Save" }));

  expect(onUpdate).toHaveBeenCalledWith({
    ...moon,
    term: "Full moon",
    forbiddenWords: ["Night", "Sky", "Orbit", "Space"],
    categoryId: "Space",
    difficulty: "hard",
  });
  expect(screen.queryByLabelText("Term")).not.toBeInTheDocument();
  // The change is confirmed by a message at the bottom.
  expect(screen.getByRole("status")).toHaveTextContent("Card saved.");
});

it("shows only the card that is edited and brings the others back afterwards", async () => {
  const own = [moon, { ...moon, id: "own-star", term: "Star" }];
  const { user } = await renderList({
    allCards: [...own, sun],
    ownCards: own,
    standardCards: [sun],
  });
  await openCategory(user, "Nature");
  expect(screen.getByText("Star")).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Edit card Moon" }));
  // The other cards and the actions on the category are out of sight while one card is edited.
  expect(screen.queryByText("Star")).not.toBeInTheDocument();
  expect(screen.queryByText("Sun")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Cancel" }));
  expect(screen.getByText("Star")).toBeVisible();
  expect(screen.getByText("Sun")).toBeVisible();
});

it("cancels editing and reports a storage failure", async () => {
  const { user } = await renderList({ onUpdate: () => Promise.reject(new Error("disk")) });
  await openCategory(user, "Sport (EN)", "Own");
  await user.click(screen.getByRole("button", { name: "Edit card Goal" }));
  await user.click(screen.getByRole("button", { name: "Cancel" }));
  expect(screen.queryByLabelText("Term")).not.toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Edit card Goal" }));
  await user.click(screen.getByRole("button", { name: "Save" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("could not be saved");
});

it("deletes a card from the editor only after a second tap", async () => {
  const { user, onRemove } = await renderList();
  await openCategory(user, "Nature");
  await user.click(screen.getByRole("button", { name: "Edit card Moon" }));
  await user.click(screen.getByRole("button", { name: "Delete card Moon" }));
  expect(onRemove).not.toHaveBeenCalled();
  await new Promise((resolve) => setTimeout(resolve, 450));
  await user.click(screen.getByRole("button", { name: "Tap again to delete Moon" }));
  expect(onRemove).toHaveBeenCalledWith("own-moon");
  expect(await screen.findByRole("status")).toHaveTextContent("Card deleted.");
});

it("shows the editor buttons as save symbol, red delete symbol and a text cancel button", async () => {
  const { user } = await renderList();
  await openCategory(user, "Nature");
  await user.click(screen.getByRole("button", { name: "Edit card Moon" }));
  const actions = document.querySelector(".kit-action-row")!;
  const buttons = [...actions.querySelectorAll("button")];
  expect(buttons.map((button) => button.textContent)).toEqual(["", "", "Cancel"]);
  expect(buttons.map((button) => button.getAttribute("aria-label"))).toEqual([
    "Save",
    "Delete card Moon",
    null,
  ]);
  expect(buttons[1]).toHaveClass("button--danger");
  expect(buttons[2]).toHaveClass("button--danger");
});

it.each([
  ["en", "Delete category Sport (EN) with 1 cards", "Tap again to delete Sport (EN) with 1 cards"],
  [
    "de",
    "Kategorie Sport (EN) mit 1 Karten löschen",
    "Nochmal tippen, um Sport (EN) mit 1 Karten zu löschen",
  ],
] as const)(
  "deletes a custom category with all its own cards after a second tap in %s",
  async (language, idle, armed) => {
    const { user, onRemove } = await renderList({}, language);
    // Standard categories cannot be deleted.
    await openCategory(user, language === "en" ? "Nature" : "Natur");
    expect(
      screen.queryByRole("button", { name: /(Delete category|Kategorie) Nat/ }),
    ).not.toBeInTheDocument();
    await openCategory(user, "Sport (EN)", "Own");
    await user.click(screen.getByRole("button", { name: idle }));
    expect(onRemove).not.toHaveBeenCalled();
    await new Promise((resolve) => setTimeout(resolve, 450));
    await user.click(screen.getByRole("button", { name: armed }));
    expect(onRemove).toHaveBeenCalledExactlyOnceWith("own-goal");
    expect(await screen.findByRole("status")).toHaveTextContent(
      language === "en" ? "Category deleted." : "Kategorie gelöscht.",
    );
  },
);

it.each([
  ["en", "Cards", "Edit card Moon", "Save", "Nature"],
  ["de", "Karten", "Karte Moon bearbeiten", "Speichern", "Natur"],
] as const)(
  "edits and deletes a stored card from the card page in %s",
  async (language, manage, edit, save, nature) => {
    const user = userEvent.setup();
    const i18n = await createGameHubI18n(language);
    const repository = new IndexedDbTabooCardRepository(new IDBFactory());
    await repository.addAll([{ ...moon, language }]);
    render(
      <I18nextProvider i18n={i18n}>
        <TabooLibrary cardLanguage={language} cards={[]} repository={repository} />
      </I18nextProvider>,
    );
    await user.click(screen.getByRole("button", { name: manage }));
    await openCategory(user, nature);
    await user.click(await screen.findByRole("button", { name: edit }));
    // The tab "Add card" has a field for a term, too; the edit field is in the list.
    await user.type(
      within(document.querySelector<HTMLElement>(".taboo-card-list__edit")!).getByRole("textbox", {
        name: /Begriff|Term/,
      }),
      "s",
    );
    await user.click(screen.getByRole("button", { name: save }));
    await waitFor(async () => {
      expect((await repository.list())[0]?.term).toBe("Moons");
    });
    expect(await screen.findByText("Moons")).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: /Edit card Moons|Karte Moons bearbeiten/ }),
    );
    await user.click(screen.getByRole("button", { name: /Delete card Moons|Karte Moons löschen/ }));
    await new Promise((resolve) => setTimeout(resolve, 450));
    await user.click(
      screen.getByRole("button", { name: /Tap again to delete|Nochmal tippen, um/ }),
    );
    await waitFor(async () => {
      expect(await repository.list()).toEqual([]);
    });
  },
);

it("sorts custom categories among the others and the cards of a category by difficulty and name", async () => {
  const mk = (
    id: string,
    term: string,
    categoryId: string,
    difficulty: TabooCard["difficulty"],
  ): TabooCard => ({
    id,
    language: "en",
    term,
    forbiddenWords: ["a", "b", "c", "d"],
    categoryId,
    difficulty,
  });
  const own = [
    mk("o1", "Zeppelin", "Zebras", "hard"),
    mk("o2", "apple pie", "Zebras", "easy"),
    mk("o3", "Bagel", "Zebras", "easy"),
    mk("o4", "Fax", "aardvarks", "medium"),
  ];
  const standard = [mk("s1", "Anchor", "nature", "hard"), mk("s2", "Moss", "nature", "easy")];
  const { user } = await renderList({
    allCards: [...own, ...standard],
    ownCards: own,
    standardCards: standard,
  });
  expect(categoryNames()).toEqual(["Culture", "Everyday life", "Nature"]);
  await user.click(screen.getByRole("radio", { name: "Own" }));
  expect(categoryNames()).toEqual(["aardvarks (EN)", "Zebras (EN)"]);

  await openCategory(user, "Zebras (EN)", "Own");
  expect(
    screen.getAllByRole("listitem").map((row) => row.querySelector("strong")?.textContent),
  ).toEqual(["apple pie", "Bagel", "Zeppelin"]);

  await openCategory(user, "Nature");
  expect(
    screen.getAllByRole("listitem").map((row) => row.querySelector("strong")?.textContent),
  ).toEqual(["Moss", "Anchor"]);
});

it("shows own categories of both languages with their language and only the count", async () => {
  const mk = (id: string, language: "de" | "en"): TabooCard => ({
    id,
    language,
    term: `Term ${id}`,
    forbiddenWords: ["a", "b", "c", "d"],
    categoryId: "Sport",
    difficulty: "easy",
  });
  const own = [mk("1", "de"), mk("2", "en"), mk("3", "en")];
  const { user } = await renderList({ allCards: own, ownCards: own, standardCards: [] });
  await user.click(screen.getByRole("radio", { name: "Own" }));
  const rows = [...document.querySelectorAll(".kit-nav-row")].map((row) =>
    row.textContent?.replace(/\s+/g, " ").trim(),
  );
  // Each own category has its language in the name; the row shows only the count.
  expect(rows).toEqual(["Sport (DE)1", "Sport (EN)2"]);
});

it.each([
  ["en", "Rename category Sport (EN)", "New name of the category"],
  ["de", "Kategorie Sport (EN) umbenennen", "Neuer Name der Kategorie"],
] as const)(
  "renames an own category and refuses empty or taken names in %s",
  async (language, buttonName, inputName) => {
    const mk = (id: string, categoryId: string): TabooCard => ({
      id,
      language: "en",
      term: `Term ${id}`,
      forbiddenWords: ["a", "b", "c", "d"],
      categoryId,
      difficulty: "easy",
    });
    const own = [mk("1", "Sport"), mk("2", "Autos")];
    const { user, onRenameCategory } = await renderList(
      { allCards: own, ownCards: own, standardCards: [] },
      language,
    );
    await openCategory(user, "Sport (EN)", "Own");
    await user.click(screen.getByRole("button", { name: buttonName }));
    const input = screen.getByLabelText(inputName);
    expect(input).toHaveValue("Sport");
    const alertText = () => screen.getByRole("alert").textContent;
    const save = language === "en" ? "Save" : "Speichern";

    // An empty name and a name of another own category (in any case) are refused.
    await user.clear(input);
    await user.click(screen.getByRole("button", { name: save }));
    expect(alertText()).toBe(language === "en" ? "Enter a name." : "Gib einen Namen ein.");
    await user.type(input, "autos");
    await user.click(screen.getByRole("button", { name: save }));
    expect(alertText()).toBe(
      language === "en"
        ? "A category with this name already exists."
        : "Eine Kategorie mit diesem Namen gibt es schon.",
    );
    expect(onRenameCategory).not.toHaveBeenCalled();

    // A standard category name is taken as well.
    await user.clear(input);
    await user.type(input, "nature");
    await user.click(screen.getByRole("button", { name: save }));
    expect(onRenameCategory).not.toHaveBeenCalled();

    await user.clear(input);
    await user.type(input, "ball games");
    await user.click(screen.getByRole("button", { name: save }));
    expect(onRenameCategory).toHaveBeenCalledWith({ id: "Sport", language: "en" }, "Ball games");
    expect(
      screen.getByText(language === "en" ? "Category renamed." : "Kategorie umbenannt."),
    ).toBeVisible();
    // The form is closed again.
    expect(screen.queryByLabelText(inputName)).not.toBeInTheDocument();
  },
);

it("makes the first letter of a term and of the forbidden words a capital letter when editing", async () => {
  const { user, onUpdate } = await renderList();
  await openCategory(user, "Nature");
  await user.click(screen.getByRole("button", { name: "Edit card Moon" }));
  await user.clear(screen.getByLabelText("Term"));
  await user.type(screen.getByLabelText("Term"), "full moon");
  const words = screen.getByLabelText("Four forbidden words, separated by commas");
  await user.clear(words);
  await user.type(words, "night, sky , orbit,space");
  await user.click(screen.getByRole("button", { name: "Save" }));
  expect(onUpdate).toHaveBeenCalledWith(
    expect.objectContaining({
      term: "Full moon",
      forbiddenWords: ["Night", "Sky", "Orbit", "Space"],
    }),
  );
});
