import { act, render, screen, within } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { expect, it, vi } from "vitest";
import { createGameHubI18n } from "../i18n";
import { AppShell } from "./AppShell";
import { useGameScreen, type GameScreen } from "./GameChrome";

function Game({ shown, onBack }: { shown: GameScreen; onBack: () => void }) {
  useGameScreen(shown, onBack, { status: "Round 2/5" });
  return <p>{shown}</p>;
}

/** The Back key: the history moves back one entry; the events arrive a moment later. */
async function pressSystemBack() {
  await act(async () => {
    window.history.back();
    await new Promise((resolve) => setTimeout(resolve, 40));
  });
}

async function renderGame(shown: GameScreen) {
  const i18n = await createGameHubI18n("en");
  const onBack = vi.fn();
  render(
    <I18nextProvider i18n={i18n}>
      <AppShell gameTitle="Game" onCloseGame={vi.fn()} onLanguageChange={vi.fn()}>
        <Game onBack={onBack} shown={shown} />
      </AppShell>
    </I18nextProvider>,
  );
  // Let the guard of the Back key settle.
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 40));
  });
  return onBack;
}

it.each(["setup", "end"] as const)(
  "keeps the normal header in the %s screen and goes back to the main menu without asking",
  async (shown) => {
    const onBack = await renderGame(shown);
    const header = within(screen.getByRole("banner"));
    expect(header.getByRole("button", { name: "Settings" })).toBeVisible();
    expect(header.queryByRole("button", { name: "Back" })).not.toBeInTheDocument();

    await pressSystemBack();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(onBack).toHaveBeenCalledOnce();
  },
);

it("shows the bar of the game while it runs and asks before the Back key ends it", async () => {
  const onBack = await renderGame("game");
  expect(screen.getByText("Round 2/5")).toBeVisible();
  expect(screen.queryByRole("button", { name: "Settings" })).not.toBeInTheDocument();

  await pressSystemBack();
  expect(screen.getByRole("dialog", { name: "End the game?" })).toBeVisible();
  expect(onBack).not.toHaveBeenCalled();
});

it("leaves the main menu alone: nothing of the game is registered", async () => {
  const onBack = await renderGame("menu");
  expect(
    within(screen.getByRole("banner")).getByRole("button", { name: "Settings" }),
  ).toBeVisible();
  expect(screen.queryByText("Round 2/5")).not.toBeInTheDocument();
  expect(onBack).not.toHaveBeenCalled();
});
