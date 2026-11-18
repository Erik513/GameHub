import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { afterEach, expect, it, vi } from "vitest";
import { tabooStandardCards } from "../../data/tabooStandardCards";
import { createGameHubI18n } from "../../i18n";
import { App } from "../App";
import { closeGameSettings, openGameSettings } from "../testing/gameSettings";
import { createTabooModule } from "./tabooModule";

afterEach(() => {
  vi.useRealTimers();
  window.location.hash = "#/";
});

const modes = [
  { mode: "Classic", start: "Start round" },
  { mode: "Race", start: "Start run" },
  { mode: "Against the clock", start: "Start turn" },
] as const;

it.each(modes)(
  "gives the game up from the pause card in the mode $mode",
  async ({ mode, start }) => {
    window.location.hash = "#/";
    vi.useFakeTimers();
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
    fireEvent.click(screen.getAllByRole("button", { name: "Play" }).at(0)!);
    openGameSettings();
    const group = screen.getByRole("group", { name: "Game mode" });
    fireEvent.click(within(group).getByRole("radio", { name: mode }));
    closeGameSettings();
    fireEvent.click(screen.getByRole("button", { name: "Start game" }));
    fireEvent.click(screen.getByRole("button", { name: start }));

    // The header only pauses; ending the game is on the pause card.
    expect(screen.queryByRole("button", { name: "End game" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    const endGame = screen.getByRole("button", { name: "End game" });
    fireEvent.click(endGame);
    // The first tap only asks; the game goes on.
    expect(screen.getByRole("button", { name: "Tap again to end" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Paused" })).toBeVisible();

    await act(() => vi.advanceTimersByTimeAsync(600));
    fireEvent.click(screen.getByRole("button", { name: "Tap again to end" }));
    // Back in the main menu with the setup still filled in.
    expect(screen.queryByRole("heading", { name: "Paused" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start game" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Close game" })).toBeVisible();
  },
);
