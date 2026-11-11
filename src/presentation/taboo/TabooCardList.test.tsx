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

async function renderList(overrides: Partial<Parameters<typeof TabooCardList>[0]> = {}) {
  const user = userEvent.setup();
  const i18n = await createGameHubI18n("en");
  const onUpdate = vi.fn(() => Promise.resolve());
  const onRemove = vi.fn(() => Promise.resolve());
  render(
    <I18nextProvider i18n={i18n}>
      <TabooCardList
        allCards={[moon, goal, { ...moon, id: "std", term: "Sun" }]}
        disabled={false}
        onRemove={onRemove}
        onUpdate={onUpdate}
        ownCards={[moon, goal]}
        {...overrides}
      />
    </I18nextProvider>,
  );
  return { user, onUpdate, onRemove };
}

it("filters the cards and shows an empty state", async () => {
  const { user } = await renderList();
  expect(screen.getByRole("heading", { name: "My cards (2)" })).toBeVisible();
  await user.type(screen.getByRole("searchbox", { name: "Search cards" }), "sport");
  expect(screen.getByText("Goal")).toBeVisible();
  expect(screen.queryByText("Moon")).not.toBeInTheDocument();
  await user.clear(screen.getByRole("searchbox", { name: "Search cards" }));
  await user.type(screen.getByRole("searchbox", { name: "Search cards" }), "zzz");
  expect(screen.getByText("No card matches the search.")).toBeVisible();
});

it("shows a hint when there are no own cards", async () => {
  await renderList({ ownCards: [] });
  expect(screen.getByText(/no own cards yet/)).toBeVisible();
});

it("edits a card, validates the input and saves a new category", async () => {
  const { user, onUpdate } = await renderList();
  await user.click(screen.getByRole("button", { name: "Edit card Moon" }));

  await user.clear(screen.getByLabelText("Forbidden word 4"));
  await user.type(screen.getByLabelText("Forbidden word 4"), "night");
  await user.click(screen.getByRole("button", { name: "Save" }));
  expect(screen.getByRole("alert")).toHaveTextContent("four different forbidden words");

  await user.clear(screen.getByLabelText("Term"));
  await user.type(screen.getByLabelText("Term"), "Sun");
  await user.clear(screen.getByLabelText("Forbidden word 4"));
  await user.type(screen.getByLabelText("Forbidden word 4"), "space");
  await user.click(screen.getByRole("button", { name: "Save" }));
  expect(screen.getByRole("alert")).toHaveTextContent("already exists");
  expect(onUpdate).not.toHaveBeenCalled();

  await user.clear(screen.getByLabelText("Term"));
  await user.type(screen.getByLabelText("Term"), "Full moon");
  await user.selectOptions(screen.getByLabelText("Category"), "New category …");
  await user.click(screen.getByRole("button", { name: "Save" }));
  expect(screen.getByRole("alert")).toHaveTextContent("Enter a name");
  await user.type(screen.getByLabelText("Name of the new category"), "Space");
  await user.selectOptions(screen.getByLabelText("Difficulty"), "Hard");
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
  await user.click(screen.getByRole("button", { name: "Edit card Goal" }));
  await user.click(screen.getByRole("button", { name: "Cancel" }));
  expect(screen.queryByLabelText("Term")).not.toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Edit card Goal" }));
  await user.click(screen.getByRole("button", { name: "Save" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("could not be saved");
});

it("deletes a card only after a second tap", async () => {
  const { user, onRemove } = await renderList();
  const row = screen.getByText("Moon").closest("li")!;
  await user.click(within(row).getByRole("button", { name: "Delete card Moon" }));
  expect(onRemove).not.toHaveBeenCalled();
  await new Promise((resolve) => setTimeout(resolve, 450));
  await user.click(within(row).getByRole("button", { name: "Tap again to delete Moon" }));
  expect(onRemove).toHaveBeenCalledWith("own-moon");
});

it.each([
  ["en", "Manage own cards", "Edit card Moon", "Save"],
  ["de", "Eigene Karten verwalten", "Karte Moon bearbeiten", "Speichern"],
] as const)(
  "edits and deletes a stored card from the card page in %s",
  async (language, manage, edit, save) => {
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
    await user.click(await screen.findByRole("button", { name: edit }));
    await user.type(screen.getByRole("textbox", { name: /Begriff|Term/ }), "s");
    await user.click(screen.getByRole("button", { name: save }));
    await waitFor(async () => {
      expect((await repository.list())[0]?.term).toBe("Moons");
    });
    expect(await screen.findByText("Moons")).toBeVisible();

    await user.click(
      screen.getByRole("button", {
        name: /Moons (löschen|löschen)|Delete card Moons|Karte Moons löschen/,
      }),
    );
    await new Promise((resolve) => setTimeout(resolve, 450));
    await user.click(
      screen.getByRole("button", { name: /Tap again to delete|Nochmal tippen, um/ }),
    );
    await waitFor(async () => {
      expect(await repository.list()).toEqual([]);
    });
  },
);
