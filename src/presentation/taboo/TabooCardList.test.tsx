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

async function renderList(overrides: Partial<Parameters<typeof TabooCardList>[0]> = {}) {
  const user = userEvent.setup();
  const i18n = await createGameHubI18n("en");
  const onUpdate = vi.fn(() => Promise.resolve());
  const onRemove = vi.fn(() => Promise.resolve());
  render(
    <I18nextProvider i18n={i18n}>
      <TabooCardList
        allCards={[moon, goal, sun, mond]}
        cardLanguage="en"
        disabled={false}
        onRemove={onRemove}
        onUpdate={onUpdate}
        ownCards={[moon, goal]}
        standardCards={[sun, mond]}
        {...overrides}
      />
    </I18nextProvider>,
  );
  return { user, onUpdate, onRemove };
}

function category(name: string) {
  return screen.getByText(name, { selector: "summary span" }).closest("details")!;
}

it("groups cards by category with counts and lists own cards before standard cards", async () => {
  const { user } = await renderList();
  expect(screen.getByRole("heading", { name: "Cards by category" })).toBeVisible();
  const names = [...document.querySelectorAll("summary span")].map((item) => item.textContent);
  expect(names).toEqual(["Everyday life", "Nature", "Culture", "Sport"]);
  expect(within(category("Nature")).getByText("2 (1 own)")).toBeInTheDocument();
  expect(within(category("Sport")).getByText("1 (1 own)")).toBeInTheDocument();

  await user.click(screen.getByText("Nature", { selector: "summary span" }));
  const rows = within(category("Nature")).getAllByRole("listitem");
  expect(rows.map((row) => row.querySelector("strong")?.textContent)).toEqual(["Moon", "Sun"]);
  expect(rows[0]).toHaveTextContent("night · sky · orbit · space");
  expect(rows[1]).toHaveTextContent("Hard");
  // Only own cards can be edited, and cards of the other language are not shown.
  expect(within(rows[0]!).getByRole("button", { name: "Edit card Moon" })).toBeVisible();
  expect(within(rows[1]!).queryByRole("button")).toBeNull();
  expect(screen.queryByText("Mond")).not.toBeInTheDocument();
});

it("edits a card, validates the input and saves a new category", async () => {
  const { user, onUpdate } = await renderList();
  await user.click(screen.getByText("Nature", { selector: "summary span" }));
  await user.click(screen.getByRole("button", { name: "Edit card Moon" }));
  const words = () => screen.getByLabelText("Four forbidden words, separated by commas");

  await user.clear(words());
  await user.type(words(), "night, sky, orbit");
  await user.click(screen.getByRole("button", { name: "Save" }));
  expect(screen.getByRole("alert")).toHaveTextContent("four different forbidden words");

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
  await user.selectOptions(screen.getByLabelText("Difficulty"), "hard");
  await user.click(screen.getByRole("button", { name: "Save" }));

  expect(onUpdate).toHaveBeenCalledWith({
    ...moon,
    term: "Full moon",
    categoryId: "Space",
    difficulty: "hard",
  });
  expect(screen.queryByLabelText("Term")).not.toBeInTheDocument();
});

it("cancels editing and reports a storage failure", async () => {
  const { user } = await renderList({ onUpdate: () => Promise.reject(new Error("disk")) });
  await user.click(screen.getByText("Sport", { selector: "summary span" }));
  await user.click(screen.getByRole("button", { name: "Edit card Goal" }));
  await user.click(screen.getByRole("button", { name: "Cancel" }));
  expect(screen.queryByLabelText("Term")).not.toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Edit card Goal" }));
  await user.click(screen.getByRole("button", { name: "Save" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("could not be saved");
});

it("deletes a card from the editor only after a second tap", async () => {
  const { user, onRemove } = await renderList();
  await user.click(screen.getByText("Nature", { selector: "summary span" }));
  await user.click(screen.getByRole("button", { name: "Edit card Moon" }));
  await user.click(screen.getByRole("button", { name: "Delete card Moon" }));
  expect(onRemove).not.toHaveBeenCalled();
  await new Promise((resolve) => setTimeout(resolve, 450));
  await user.click(screen.getByRole("button", { name: "Tap again to delete Moon" }));
  expect(onRemove).toHaveBeenCalledWith("own-moon");
});

it.each([
  ["en", "Manage own cards", "Edit card Moon", "Save", "Nature"],
  ["de", "Eigene Karten verwalten", "Karte Moon bearbeiten", "Speichern", "Natur"],
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
    await user.click(screen.getByText(nature, { selector: "summary span" }));
    await user.click(await screen.findByRole("button", { name: edit }));
    await user.type(screen.getAllByRole("textbox", { name: /Begriff|Term/ }).at(-1)!, "s");
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
