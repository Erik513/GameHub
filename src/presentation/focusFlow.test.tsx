import { fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { beforeEach, expect, it, vi } from "vitest";
import { tabooStandardCards } from "../data/tabooStandardCards";
import { createGameHubI18n } from "../i18n";
import { App } from "./App";
import { createTabooModule } from "./taboo/tabooModule";
import { closeGameSettings, openGameSettings } from "./testing/gameSettings";

beforeEach(() => {
  window.location.hash = "#/";
});

it("leads the focus into every view on the way into a game, so the keyboard does not start at the top", async () => {
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <App
        cardLanguage="en"
        modules={[createTabooModule({ cards: tabooStandardCards })]}
        onCardLanguageChange={vi.fn()}
      />
    </I18nextProvider>,
  );
  // The game selection: the page is named by its title.
  expect(screen.getByRole("region", { name: "Choose a game" })).toHaveFocus();

  // The line-up of the game.
  fireEvent.click(screen.getAllByRole("button", { name: "Play" }).at(0)!);
  expect(document.activeElement).toHaveClass("kit-lineup");

  // The settings: the chosen tab, where the keys of the tab bar work.
  openGameSettings();
  expect(screen.getByRole("tab", { name: "Game settings", selected: true })).toHaveFocus();

  // Back in the line-up.
  closeGameSettings();
  expect(document.activeElement).toHaveClass("kit-lineup");

  // The overview before the first turn, then the turn itself.
  fireEvent.click(screen.getByRole("button", { name: "Start game" }));
  expect(screen.getByRole("region", { name: "Round overview" })).toHaveFocus();
  fireEvent.click(screen.getByRole("button", { name: "Start round" }));
  expect(document.activeElement).toHaveClass("taboo-round");
});
