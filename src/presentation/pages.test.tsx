import { fireEvent, render, screen, within } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { describe, expect, it, vi } from "vitest";
import { gameCatalog, type GameModuleDescriptor } from "../app/gameCatalog";
import { createGameHubI18n } from "../i18n";
import { AppShell } from "./AppShell";
import { GamePreviewPage } from "./GamePreviewPage";
import { PlayerRosterProvider } from "./game-kit";
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

  it("sorts the games: ready first, then in development, planned last, alphabetical in each group", async () => {
    await renderWithI18n(
      "en",
      <GameSelectionPage games={[...gameCatalog].reverse()} onSelect={vi.fn()} />,
    );
    const titles = screen
      .getAllByRole("heading", { level: 2 })
      .map((heading) => heading.textContent);
    expect(titles).toEqual([
      "Taboo",
      "Werewolf",
      "Imposter",
      "Liar’s Bar",
      "Schwimmen",
      "Word bomb",
    ]);
  });

  it("tints the box of every game that can be played, and labels only the one in development", async () => {
    await renderWithI18n("en", <GameSelectionPage games={gameCatalog} onSelect={vi.fn()} />);
    const tabooCard = screen.getByRole("heading", { name: "Taboo" }).closest("section")!;
    expect(tabooCard.querySelector(".game-status")).toBeNull();
    expect(tabooCard).toHaveAttribute("data-playable", "true");
    expect(tabooCard).toHaveAttribute("data-accent", "blue");
    const werewolfCard = screen.getByRole("heading", { name: "Werewolf" }).closest("section")!;
    expect(werewolfCard.querySelector(".game-status")).toHaveTextContent("In development");
    // The game in development can be played, too: its box is tinted like the finished one.
    expect(werewolfCard).toHaveAttribute("data-playable", "true");
    const plannedCard = screen.getByRole("heading", { name: "Imposter" }).closest("section")!;
    expect(plannedCard).not.toHaveAttribute("data-playable");
  });

  it("opens a game in development in the published app, too, with its label", async () => {
    vi.stubEnv("DEV", false);
    try {
      await renderWithI18n("en", <GameSelectionPage games={gameCatalog} onSelect={vi.fn()} />);
      // The finished game and the game in development come first and can be opened; the planned ones cannot.
      const buttons = screen.getAllByRole("button", { name: "Play" });
      expect(buttons[0]).toBeEnabled();
      expect(buttons[1]).toBeEnabled();
      for (const closed of buttons.slice(2)) expect(closed).toBeDisabled();
      // Games that cannot be opened are darker; the others are not. The game in development keeps its label.
      const cards = screen.getAllByRole("heading", { level: 2 }).map((h) => h.closest("section")!);
      expect(cards[0]).not.toHaveAttribute("data-locked");
      expect(cards[1]).not.toHaveAttribute("data-locked");
      expect(cards[1]).toHaveTextContent("In development");
      for (const card of cards.slice(2)) expect(card).toHaveAttribute("data-locked", "true");
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("only lets players open games that are not merely planned", async () => {
    const onSelect = vi.fn();
    await renderWithI18n("en", <GameSelectionPage games={gameCatalog} onSelect={onSelect} />);
    for (const planned of screen.getAllByRole("button", { name: "Play" }).slice(2)) {
      expect(planned).toBeDisabled();
      fireEvent.click(planned);
    }
    expect(onSelect).not.toHaveBeenCalled();
    fireEvent.click(screen.getAllByRole("button", { name: "Play" }).at(0)!);
    expect(onSelect).toHaveBeenCalledWith(taboo);
  });
});

describe("AppShell", () => {
  it("opens the settings, closes them again and keeps the page content", async () => {
    await renderWithI18n(
      "en",
      <AppShell onLanguageChange={vi.fn()}>
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
      <AppShell gameTitle="Taboo" onCloseGame={onCloseGame} onLanguageChange={vi.fn()}>
        <p>Game</p>
      </AppShell>,
    );
    expect(screen.getByText("Taboo")).toBeVisible();
    expect(screen.queryByRole("link", { name: "GameHub" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close game" }));
    expect(onCloseGame).toHaveBeenCalledOnce();
  });
});

describe("header of the app", () => {
  const store = { read: () => ["Anna"], write: () => undefined };
  const buttons = () =>
    within(document.querySelector<HTMLElement>("header")!)
      .getAllByRole("button")
      .map((button) => button.getAttribute("aria-label") ?? button.textContent);

  it("has the settings at the top right and the players button next to it in the hub", async () => {
    await renderWithI18n(
      "en",
      <PlayerRosterProvider store={store}>
        <AppShell onLanguageChange={vi.fn()}>
          <p>Page</p>
        </AppShell>
      </PlayerRosterProvider>,
    );
    expect(buttons()).toEqual(["Player list", "Settings"]);
    expect(document.querySelector(".brand__mark")).toBeNull();
  });

  it("has the home button last at the top right in the main menu of a game, without a dot and without the player list", async () => {
    await renderWithI18n(
      "en",
      <PlayerRosterProvider store={store}>
        <AppShell gameTitle="Taboo" onCloseGame={vi.fn()} onLanguageChange={vi.fn()}>
          <p>Game</p>
        </AppShell>
      </PlayerRosterProvider>,
    );
    // The name is at the left; the buttons at the right end with the settings and then home.
    // The player list belongs to the GameHub; inside a game it is not offered.
    expect(buttons()).toEqual(["Settings", "Close game"]);
    const header = document.querySelector<HTMLElement>("header")!;
    expect(within(header).getByText("Taboo").closest(".brand")).not.toBeNull();
    expect(document.querySelector(".brand__mark")).toBeNull();
  });
});
