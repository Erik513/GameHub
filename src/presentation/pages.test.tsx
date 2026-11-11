import { fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { describe, expect, it, vi } from "vitest";
import { gameCatalog, type GameModuleDescriptor } from "../app/gameCatalog";
import { createGameHubI18n } from "../i18n";
import { AppShell } from "./AppShell";
import { GamePreviewPage } from "./GamePreviewPage";
import { GameSelectionPage } from "./GameSelectionPage";

async function renderWithI18n(language: "en" | "de", ui: React.ReactNode) {
  const i18n = await createGameHubI18n(language);
  return render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);
}

const taboo = gameCatalog.find((game) => game.id === "taboo") as GameModuleDescriptor;

describe("GamePreviewPage", () => {
  it("shows the development description for a game without a playable screen", async () => {
    await renderWithI18n("en", <GamePreviewPage game={taboo} />);
    expect(screen.getByRole("heading", { name: "Taboo" })).toBeVisible();
    expect(screen.getByText(/already part of GameHub/)).toBeVisible();
  });

  it("shows the playable screen instead of the description when one is provided", async () => {
    await renderWithI18n(
      "de",
      <GamePreviewPage game={taboo}>
        <p>Spielinhalt</p>
      </GamePreviewPage>,
    );
    expect(screen.getByText("Spielinhalt")).toBeVisible();
    expect(screen.queryByText(/bereits Teil von GameHub/)).not.toBeInTheDocument();
  });
});

describe("GameSelectionPage", () => {
  it("shows an empty state when no game is registered", async () => {
    await renderWithI18n("en", <GameSelectionPage games={[]} onSelect={vi.fn()} />);
    expect(screen.getByText("No games available")).toBeVisible();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("only lets players open games that are not merely planned", async () => {
    const onSelect = vi.fn();
    await renderWithI18n("en", <GameSelectionPage games={gameCatalog} onSelect={onSelect} />);
    for (const planned of screen.getAllByRole("button", { name: "Coming later" })) {
      expect(planned).toBeDisabled();
      fireEvent.click(planned);
    }
    expect(onSelect).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "View progress" }));
    expect(onSelect).toHaveBeenCalledWith(taboo);
  });
});

describe("AppShell", () => {
  it("opens the settings, closes them again and keeps the page content", async () => {
    await renderWithI18n(
      "en",
      <AppShell
        cardLanguage="en"
        currentRoute="/"
        onCardLanguageChange={vi.fn()}
        onLanguageChange={vi.fn()}
      >
        <p>Page content</p>
      </AppShell>,
    );
    expect(screen.getByText("Page content")).toBeVisible();
    expect(screen.queryByRole("button", { name: "Close game" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    expect(screen.getByRole("dialog", { name: "Settings" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows the game title and the way back to the hub inside a game", async () => {
    const onCloseGame = vi.fn();
    await renderWithI18n(
      "en",
      <AppShell
        cardLanguage="en"
        currentRoute="/games/taboo"
        gameTitle="Taboo"
        onCardLanguageChange={vi.fn()}
        onCloseGame={onCloseGame}
        onLanguageChange={vi.fn()}
      >
        <p>Game</p>
      </AppShell>,
    );
    expect(screen.getByText("Taboo")).toBeVisible();
    expect(screen.queryByRole("link", { name: "GameHub" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close game" }));
    expect(onCloseGame).toHaveBeenCalledOnce();
  });
});
