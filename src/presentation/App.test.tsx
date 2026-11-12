import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createGameHubI18n, type SupportedLanguage } from "../i18n";
import { tabooStandardCards } from "../data/tabooStandardCards";
import { App } from "./App";
import type { GameModule } from "./gameModule";
import { createTabooModule } from "./taboo/tabooModule";

const languageCases = [
  {
    language: "en",
    heading: "Choose a game",
    intro: "Pick what fits the table. New games join the same library as they become ready.",
    navigation: "Games",
  },
  {
    language: "de",
    heading: "Wähle ein Spiel",
    intro:
      "Wähle, was zu eurer Runde passt. Neue Spiele kommen in dieselbe Sammlung, sobald sie bereit sind.",
    navigation: "Spiele",
  },
] satisfies readonly {
  language: SupportedLanguage;
  heading: string;
  intro: string;
  navigation: string;
}[];

afterEach(() => {
  vi.useRealTimers();
});

beforeEach(() => {
  window.location.hash = "#/";
});

describe("App", () => {
  it.each(languageCases)(
    "renders the $language game selection",
    async ({ language, heading, intro, navigation }) => {
      const i18n = await createGameHubI18n(language);

      render(
        <I18nextProvider i18n={i18n}>
          <App cardLanguage={language} onCardLanguageChange={vi.fn()} />
        </I18nextProvider>,
      );

      expect(screen.getByRole("link", { name: "GameHub" })).toBeVisible();
      expect(screen.getByRole("link", { name: navigation })).toHaveAttribute(
        "aria-current",
        "page",
      );
      expect(screen.getByRole("heading", { name: heading })).toBeVisible();
      expect(screen.getByText(intro)).toBeVisible();
      expect(
        within(screen.getByRole("list", { name: heading })).getAllByRole("listitem"),
      ).toHaveLength(5);
    },
  );

  it("marks unfinished games and opens the Taboo preview", async () => {
    const user = userEvent.setup();
    const i18n = await createGameHubI18n("en");

    render(
      <I18nextProvider i18n={i18n}>
        <App cardLanguage="en" onCardLanguageChange={vi.fn()} />
      </I18nextProvider>,
    );

    expect(screen.getAllByRole("button", { name: "Coming later" })).toHaveLength(4);
    expect(screen.getAllByRole("button", { name: "Coming later" })[0]).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "View progress" }));

    expect(screen.getByRole("heading", { name: "Taboo" })).toBeVisible();
    expect(window.location.hash).toBe("#/games/taboo");

    await user.click(screen.getByRole("button", { name: "Close game" }));
    expect(screen.getByRole("heading", { name: "Choose a game" })).toBeVisible();
  });

  it("offers only an end-game action during a game and returns to the game's main window", async () => {
    vi.useFakeTimers({ toFake: ["Date", "setTimeout", "clearTimeout"] });
    const i18n = await createGameHubI18n("en");
    render(
      <I18nextProvider i18n={i18n}>
        <App
          cardLanguage="en"
          onCardLanguageChange={vi.fn()}
          modules={[createTabooModule({ cards: tabooStandardCards })]}
        />
      </I18nextProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "View progress" }));
    // Main window of the game: settings and the way back to the hub are available.
    expect(screen.getByRole("button", { name: "Settings" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "End game" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Start" }));

    // During the game: no hub navigation, no settings.
    expect(screen.queryByRole("button", { name: "Settings" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Close game" })).not.toBeInTheDocument();
    // First press arms the button, a second press within a few seconds confirms.
    fireEvent.click(screen.getByRole("button", { name: "End game" }));
    expect(screen.getByRole("button", { name: "Tap again to end" })).toHaveAttribute(
      "data-armed",
      "true",
    );
    // A quick double tap must not confirm by accident.
    fireEvent.click(screen.getByRole("button", { name: "Tap again to end" }));
    expect(screen.getByRole("region", { name: "Round overview" })).toBeVisible();
    // Without a second press the button relaxes again.
    await act(() => vi.advanceTimersByTimeAsync(3500));
    expect(screen.getByRole("button", { name: "End game" })).toBeVisible();
    expect(screen.getByRole("region", { name: "Round overview" })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "End game" }));
    await act(() => vi.advanceTimersByTimeAsync(600));
    fireEvent.click(screen.getByRole("button", { name: "Tap again to end" }));
    expect(screen.queryByRole("region", { name: "Round overview" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Settings" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Close game" })).toBeVisible();
  });

  it("pauses a running round and can restart or end it from the pause screen", async () => {
    vi.useFakeTimers();
    const i18n = await createGameHubI18n("en");
    render(
      <I18nextProvider i18n={i18n}>
        <App
          cardLanguage="en"
          onCardLanguageChange={vi.fn()}
          modules={[createTabooModule({ cards: tabooStandardCards })]}
        />
      </I18nextProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "View progress" }));
    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    // Between turns only the end-game action exists; there is nothing to pause.
    expect(screen.queryByRole("button", { name: "Pause" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Start round" }));

    expect(screen.queryByRole("button", { name: "Settings" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Close game" })).not.toBeInTheDocument();
    const term = screen.getByRole("heading", { level: 2 }).textContent;
    act(() => void vi.advanceTimersByTime(5000));
    expect(screen.getByRole("timer")).toHaveTextContent("55");

    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    expect(screen.getByRole("button", { name: "Resume", pressed: true })).toBeVisible();
    // While paused the card is hidden and no outcome can be chosen.
    expect(screen.getByRole("heading", { name: "Paused" })).toBeVisible();
    expect(screen.queryByText(term)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Correct" })).toBeDisabled();
    act(() => void vi.advanceTimersByTime(30000));
    expect(screen.getByRole("timer")).toHaveTextContent("55");

    // Resuming continues with the remaining time.
    fireEvent.click(screen.getAllByRole("button", { name: "Resume" })[0]!);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(term);
    act(() => void vi.advanceTimersByTime(5000));
    expect(screen.getByRole("timer")).toHaveTextContent("50");

    // The header offers no way to end the game during a round, only to pause it.
    expect(screen.queryByRole("button", { name: "End game" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Correct" }));
    expect(screen.getByText(/Score: 1/)).toBeVisible();

    // Restarting a turn needs a second tap, discards its points and shows new cards.
    const shownBeforeRestart = [term, screen.getByRole("heading", { level: 2 }).textContent];
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    fireEvent.click(screen.getByRole("button", { name: "Restart round" }));
    act(() => void vi.advanceTimersByTime(600));
    fireEvent.click(screen.getByRole("button", { name: "Tap again to restart" }));
    act(() => void vi.advanceTimersByTime(200));
    expect(screen.getByRole("timer")).toHaveTextContent("60");
    expect(screen.getByText(/Score: 0/)).toBeVisible();
    expect(screen.queryByRole("heading", { name: "Paused" })).not.toBeInTheDocument();
    expect(shownBeforeRestart).not.toContain(screen.getByRole("heading", { level: 2 }).textContent);

    // Ending the round keeps its result and shows the overview; only there can the game end.
    fireEvent.click(screen.getByRole("button", { name: "Correct" }));
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    fireEvent.click(screen.getByRole("button", { name: "End round" }));
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Round overview" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "End game" }));
    act(() => void vi.advanceTimersByTime(600));
    fireEvent.click(screen.getByRole("button", { name: "Tap again to end" }));
    expect(screen.getByRole("button", { name: "Start" })).toBeVisible();
  });

  it("tells the players when a restarted round has no new cards left", async () => {
    vi.useFakeTimers();
    const i18n = await createGameHubI18n("en");
    // Short games need six cards (two teams, three rounds); all of them are shown in one turn.
    const sixCards = tabooStandardCards.filter((card) => card.language === "en").slice(0, 6);
    render(
      <I18nextProvider i18n={i18n}>
        <App
          cardLanguage="en"
          onCardLanguageChange={vi.fn()}
          modules={[createTabooModule({ cards: sixCards })]}
        />
      </I18nextProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "View progress" }));
    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    fireEvent.click(screen.getByRole("button", { name: "Start round" }));
    for (let shown = 0; shown < 5; shown += 1) {
      fireEvent.click(screen.getByRole("button", { name: "Correct" }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    fireEvent.click(screen.getByRole("button", { name: "Restart round" }));
    act(() => void vi.advanceTimersByTime(600));
    fireEvent.click(screen.getByRole("button", { name: "Tap again to restart" }));
    expect(screen.getByRole("alert")).toHaveTextContent("No new cards available.");
    expect(screen.getByRole("heading", { name: "Paused" })).toBeVisible();
    // The message disappears once the round continues.
    fireEvent.click(screen.getAllByRole("button", { name: "Resume" })[0]!);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("pauses a tiebreak attempt without counting the pause", async () => {
    vi.useFakeTimers();
    const i18n = await createGameHubI18n("en");
    render(
      <I18nextProvider i18n={i18n}>
        <App
          cardLanguage="en"
          onCardLanguageChange={vi.fn()}
          modules={[createTabooModule({ cards: tabooStandardCards })]}
        />
      </I18nextProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "View progress" }));
    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    // Three short rounds for two teams: six turns that nobody scores in.
    for (let turn = 0; turn < 6; turn += 1) {
      fireEvent.click(screen.getByRole("button", { name: "Start round" }));
      act(() => void vi.advanceTimersByTime(60000));
    }
    fireEvent.click(screen.getByRole("button", { name: "Show final results" }));
    fireEvent.click(screen.getByRole("button", { name: "Start tiebreak" }));

    act(() => void vi.advanceTimersByTime(3000));
    expect(screen.getByRole("timer")).toHaveTextContent("3.0");
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    expect(screen.getByRole("heading", { name: "Paused" })).toBeVisible();
    act(() => void vi.advanceTimersByTime(20000));
    expect(screen.getByRole("timer")).toHaveTextContent("3.0");
    fireEvent.click(screen.getAllByRole("button", { name: "Resume" })[0]!);
    act(() => void vi.advanceTimersByTime(2000));
    expect(screen.getByRole("timer")).toHaveTextContent("5.0");

    // Ending the attempt from the pause screen records the solved cards and the time.
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    fireEvent.click(screen.getByRole("button", { name: "End attempt" }));
    const results = within(screen.getByRole("list", { name: "Tiebreak results" })).getAllByRole(
      "listitem",
    );
    expect(results.some((row) => row.textContent.endsWith(": 0/3 cards · 5.0 s"))).toBe(true);
  });

  it("renders whatever module is registered for a game and nothing else of it", async () => {
    const user = userEvent.setup();
    const i18n = await createGameHubI18n("de");
    const seen: string[] = [];
    // A minimal stand-in proves that the app only needs the module contract.
    const example: GameModule = {
      id: "taboo",
      Screen: ({ cardLanguage }) => {
        seen.push(cardLanguage);
        return <p>Beispielspiel</p>;
      },
    };
    render(
      <I18nextProvider i18n={i18n}>
        <App cardLanguage="en" modules={[example]} onCardLanguageChange={vi.fn()} />
      </I18nextProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Fortschritt ansehen" }));
    expect(screen.getByText("Beispielspiel")).toBeVisible();
    expect(seen).toContain("en");
  });

  it("shows the development preview when a game has no module yet", async () => {
    const user = userEvent.setup();
    const i18n = await createGameHubI18n("en");
    render(
      <I18nextProvider i18n={i18n}>
        <App cardLanguage="en" onCardLanguageChange={vi.fn()} />
      </I18nextProvider>,
    );
    await user.click(screen.getByRole("button", { name: "View progress" }));
    expect(screen.getByText(/already part of GameHub/)).toBeVisible();
  });

  it("changes the language and reports the selection", async () => {
    const user = userEvent.setup();
    const i18n = await createGameHubI18n("en");
    const onLanguageChange = vi.fn();

    render(
      <I18nextProvider i18n={i18n}>
        <App cardLanguage="en" onCardLanguageChange={vi.fn()} onLanguageChange={onLanguageChange} />
      </I18nextProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Settings" }));
    await user.click(
      within(screen.getByRole("group", { name: "Interface language" })).getByRole("radio", {
        name: "German",
      }),
    );

    expect(
      within(await screen.findByRole("group", { name: "Oberflächensprache" })).getByRole("radio", {
        name: "Deutsch",
      }),
    ).toBeChecked();
    expect(screen.getByRole("heading", { name: "Wähle ein Spiel" })).toBeVisible();
    expect(onLanguageChange).toHaveBeenCalledWith("de");
  });

  it("gives a game its card language and lets it change it, apart from the UI language", async () => {
    const user = userEvent.setup();
    const i18n = await createGameHubI18n("en");
    const onCardLanguageChange = vi.fn();
    const example: GameModule = {
      id: "taboo",
      Screen: ({ cardLanguage, onCardLanguageChange: change }) => (
        <button onClick={() => change("en")} type="button">
          Cards in {cardLanguage}
        </button>
      ),
    };
    window.location.hash = "#/games/taboo";

    render(
      <I18nextProvider i18n={i18n}>
        <App cardLanguage="de" modules={[example]} onCardLanguageChange={onCardLanguageChange} />
      </I18nextProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Cards in de" }));
    expect(onCardLanguageChange).toHaveBeenCalledWith("en");
    // The settings only hold the interface language.
    await user.click(screen.getByRole("button", { name: "Settings" }));
    expect(screen.queryByRole("group", { name: "Card language" })).not.toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Interface language" })).toBeVisible();
  });

  it.each([
    ["en", "Settings", "Settings", "Choose the language of the interface."],
    ["de", "Einstellungen", "Einstellungen", "Wähle die Sprache der Oberfläche."],
  ] as const)("opens localized settings in %s", async (language, openLabel, title, description) => {
    const user = userEvent.setup();
    const i18n = await createGameHubI18n(language);

    render(
      <I18nextProvider i18n={i18n}>
        <App cardLanguage={language} onCardLanguageChange={vi.fn()} />
      </I18nextProvider>,
    );

    await user.click(screen.getByRole("button", { name: openLabel }));

    expect(screen.getByRole("dialog", { name: title })).toHaveAccessibleDescription(description);
  });
});
