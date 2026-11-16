import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { expect, it, vi } from "vitest";
import type { TabooCard } from "../../business/games/taboo/model";
import { createGameHubI18n } from "../../i18n";
import { TabooCardExport } from "./TabooCardExport";

const card = (id: string, term: string, categoryId: string, language: "en" | "de" = "en") =>
  ({
    id,
    language,
    term,
    forbiddenWords: ["a", "b", "c", "d"],
    categoryId,
    difficulty: "easy",
  }) satisfies TabooCard;

const cards = [
  card("1", "Goal", "Sport trip"),
  card("2", "Bike", "Sport trip"),
  card("3", "Moon", "Astro"),
  card("4", "Sun", "nature"),
  card("5", "Mond", "Astro", "de"),
];

async function setup(language: "en" | "de", allCards: readonly TabooCard[] = cards) {
  const i18n = await createGameHubI18n(language);
  const onExport = vi.fn();
  render(
    <I18nextProvider i18n={i18n}>
      <TabooCardExport allCards={allCards} cardLanguage="en" disabled={false} onExport={onExport} />
    </I18nextProvider>,
  );
  return { onExport, user: userEvent.setup() };
}

it.each([
  ["en", "Export", "Tap the own category"],
  ["de", "Exportieren", "Tippe auf die eigene Kategorie"],
] as const)(
  "opens a window with an info text and the own categories as buttons in %s",
  async (language, label, info) => {
    const { onExport, user } = await setup(language);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: label }));
    const dialog = screen.getByRole("dialog", { name: label });
    expect(within(dialog).getByText(new RegExp(info))).toBeVisible();
    // Only own categories of the card language, sorted, each with its card count.
    expect(
      within(dialog)
        .getAllByRole("button")
        .map((button) => button.textContent)
        .filter((text) => text.includes("(")),
    ).toEqual(["Astro (1)", "Sport trip (2)"]);
    await user.click(within(dialog).getByRole("button", { name: "Sport trip (2)" }));
    expect(onExport).toHaveBeenCalledExactlyOnceWith("Sport trip", [cards[0], cards[1]]);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  },
);

it("says so when there is no own category", async () => {
  const { user } = await setup("en", [card("4", "Sun", "nature")]);
  await user.click(screen.getByRole("button", { name: "Export" }));
  expect(screen.getByText(/do not have any own categories/)).toBeVisible();
});
