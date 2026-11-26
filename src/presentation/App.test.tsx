import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createGameHubI18n, type SupportedLanguage } from "../i18n";
import { tabooStandardCards } from "../data/tabooStandardCards";
import { App } from "./App";
import type { GameModule } from "./gameModule";
import { createTabooModule } from "./taboo/tabooModule";
import { createWerewolfModule } from "./werewolf/werewolfModule";
import { closeGameSettings, openGameSettings } from "./testing/gameSettings";

const languageCases = [
  {
    language: "en",
    heading: "Choose a game",
    intro: "Pick what fits the table. New games join the same library as they become ready.",
  },
  {
    language: "de",
    heading: "Wähle ein Spiel",
    intro:
      "Wähle, was zu eurer Runde passt. Neue Spiele kommen in dieselbe Sammlung, sobald sie bereit sind.",
  },
] satisfies readonly {
  language: SupportedLanguage;
  heading: string;
  intro: string;
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
    async ({ language, heading, intro }) => {
      const i18n = await createGameHubI18n(language);

      render(
        <I18nextProvider i18n={i18n}>
          <App cardLanguage={language} onCardLanguageChange={vi.fn()} />
        </I18nextProvider>,
      );

      expect(screen.getByRole("link", { name: "GameHub" })).toBeVisible();
      expect(screen.getByRole("heading", { name: heading })).toBeVisible();
      expect(screen.getByText(intro)).toBeVisible();
      expect(
        within(screen.getByRole("list", { name: heading })).getAllByRole("listitem"),
      ).toHaveLength(6);
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

    expect(screen.getAllByRole("button", { name: "Play" })).toHaveLength(6);
    expect(screen.getAllByRole("button", { name: "Play" })[0]).toBeEnabled();
    expect(screen.getAllByRole("button", { name: "Play" })[1]).toBeEnabled();
    expect(screen.getAllByRole("button", { name: "Play" })[2]).toBeDisabled();

    await user.click(screen.getAllByRole("button", { name: "Play" }).at(0)!);

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

    fireEvent.click(screen.getAllByRole("button", { name: "Play" }).at(0)!);
    // Main window of the game: settings and the way back to the hub are available.
    expect(screen.getByRole("button", { name: "Settings" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "End game" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Start game" }));

    // During the game: no hub navigation, no settings.
    expect(screen.queryByRole("button", { name: "Settings" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Close game" })).not.toBeInTheDocument();
    // First press arms the button, a second press within a few seconds confirms.
    fireEvent.click(screen.getByRole("button", { name: "End game" }));
    expect(screen.getByRole("button", { name: "Tap again to end" })).toHaveAttribute(
      "data-armed",
      "true",
    );
    // It asks with the same short word as the bar of Werewolf.
    expect(screen.getByRole("button", { name: "Tap again to end" })).toHaveTextContent("End?");
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
    expect(screen.getByRole("button", { name: "Start game" })).toBeVisible();
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
    fireEvent.click(screen.getAllByRole("button", { name: "Play" }).at(0)!);
    fireEvent.click(screen.getByRole("button", { name: "Start game" }));
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
    // Round and points are not shown during the turn.
    expect(screen.queryByText(/Score:/)).not.toBeInTheDocument();

    // Restarting a turn needs a second tap, discards its points and shows new cards.
    const shownBeforeRestart = [term, screen.getByRole("heading", { level: 2 }).textContent];
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    fireEvent.click(screen.getByRole("button", { name: "Restart round" }));
    act(() => void vi.advanceTimersByTime(600));
    fireEvent.click(screen.getByRole("button", { name: "Tap again to restart" }));
    act(() => void vi.advanceTimersByTime(200));
    expect(screen.getByRole("timer")).toHaveTextContent("60");
    expect(screen.queryByRole("heading", { name: "Paused" })).not.toBeInTheDocument();
    expect(shownBeforeRestart).not.toContain(screen.getByRole("heading", { level: 2 }).textContent);

    // Ending the round keeps its result and shows the overview; only there can the game end.
    fireEvent.click(screen.getByRole("button", { name: "Correct" }));
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    fireEvent.click(screen.getByRole("button", { name: "End round" }));
    // The first tap only asks again; the round is still paused and nothing has ended.
    expect(screen.getByRole("heading", { name: "Paused" })).toBeVisible();
    expect(screen.queryByRole("region", { name: "Round overview" })).not.toBeInTheDocument();
    act(() => void vi.advanceTimersByTime(600));
    fireEvent.click(screen.getByRole("button", { name: "Tap again to end" }));
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Round overview" })).toBeVisible();
    // The restart discarded the first point: the turn brought exactly the one point after it.
    expect(document.querySelector(".kit-scoreboard__gain")).toHaveTextContent("+1");
    fireEvent.click(screen.getByRole("button", { name: "End game" }));
    act(() => void vi.advanceTimersByTime(600));
    fireEvent.click(screen.getByRole("button", { name: "Tap again to end" }));
    expect(screen.getByRole("button", { name: "Start game" })).toBeVisible();
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
    fireEvent.click(screen.getAllByRole("button", { name: "Play" }).at(0)!);
    openGameSettings();
    // Only Easy is chosen at first; these cards need all difficulties.
    fireEvent.click(screen.getByRole("checkbox", { name: "Medium" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Hard" }));
    closeGameSettings();
    fireEvent.click(screen.getByRole("button", { name: "Start game" }));
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
    fireEvent.click(screen.getAllByRole("button", { name: "Play" }).at(0)!);
    fireEvent.click(screen.getByRole("button", { name: "Start game" }));
    // Three short rounds for two teams: six turns that nobody scores in.
    for (let turn = 0; turn < 6; turn += 1) {
      fireEvent.click(screen.getByRole("button", { name: "Start round" }));
      act(() => void vi.advanceTimersByTime(60000));
    }
    // All teams are tied: the button leads to the tiebreak, not to the final result.
    fireEvent.click(screen.getByRole("button", { name: "Start tiebreak" }));
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
    // The first tap only asks again; the second one ends the attempt.
    act(() => void vi.advanceTimersByTime(600));
    fireEvent.click(screen.getByRole("button", { name: "Tap again to end" }));
    const results = within(screen.getByRole("list", { name: "Tiebreak results" })).getAllByRole(
      "listitem",
    );
    expect(results.some((row) => row.textContent.endsWith(": 0/3 cards · 5.0 s"))).toBe(true);
  });

  it("does not count the time of a pause in a race run", async () => {
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
    fireEvent.click(screen.getAllByRole("button", { name: "Play" }).at(0)!);
    openGameSettings();
    fireEvent.click(
      within(screen.getByRole("group", { name: "Game mode" })).getByRole("radio", { name: "Race" }),
    );
    closeGameSettings();
    fireEvent.click(screen.getByRole("button", { name: "Start game" }));
    fireEvent.click(screen.getByRole("button", { name: "Start run" }));

    act(() => void vi.advanceTimersByTime(3000));
    expect(screen.getByRole("timer")).toHaveTextContent("3.0");
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    act(() => void vi.advanceTimersByTime(20000));
    // While paused the clock stands still and the buttons for the cards cannot be used.
    expect(screen.getByRole("timer")).toHaveTextContent("3.0");
    expect(screen.getByRole("button", { name: /^Correct/ })).toBeDisabled();
    fireEvent.click(screen.getAllByRole("button", { name: "Resume" })[0]!);
    act(() => void vi.advanceTimersByTime(2000));
    expect(screen.getByRole("timer")).toHaveTextContent("5.0");

    // Solving the three cards now gives 5.0 s: the 20 seconds of the pause are not part of the time.
    for (let card = 0; card < 3; card += 1) {
      fireEvent.click(screen.getByRole("button", { name: /^Correct/ }));
    }
    const overview = screen.getByRole("region", { name: "Race overview" });
    expect(overview).toHaveTextContent("5.0 s");
    expect(overview).not.toHaveTextContent("25.0 s");
  });

  it("opens the settings at the categories when the game is started without a category", async () => {
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
    fireEvent.click(screen.getAllByRole("button", { name: "Play" }).at(0)!);
    openGameSettings();
    for (const category of ["Everyday life", "Culture", "Nature"]) {
      fireEvent.click(screen.getByRole("checkbox", { name: category }));
    }
    // Leaving the settings with the Back key does not check them; the game does when it starts.
    await act(async () => {
      window.history.back();
      await new Promise((resolve) => setTimeout(resolve, 40));
    });
    expect(screen.getByRole("region", { name: "Line-up" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Start game" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Select at least one category.");
    expect(screen.queryByRole("region", { name: "Round overview" })).not.toBeInTheDocument();
    // The settings are open again, at the categories.
    expect(screen.getByRole("checkbox", { name: "Nature" })).toBeVisible();
    expect(screen.queryByRole("region", { name: "Line-up" })).not.toBeInTheDocument();
  });

  describe("the Back key of the system", () => {
    /** The Back key: the history moves back one entry; the events arrive a moment later. */
    async function pressSystemBack() {
      await act(async () => {
        window.history.back();
        await new Promise((resolve) => setTimeout(resolve, 40));
      });
    }

    async function renderTaboo() {
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
      fireEvent.click(screen.getAllByRole("button", { name: "Play" }).at(0)!);
      // The navigation that opened the game finishes first.
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 40));
      });
    }

    it("asks before it leaves a running game, pauses the round meanwhile and can keep playing", async () => {
      await renderTaboo();
      fireEvent.click(screen.getByRole("button", { name: "Start game" }));
      fireEvent.click(screen.getByRole("button", { name: "Start round" }));
      expect(screen.getByRole("button", { name: "Pause" })).toBeVisible();

      await pressSystemBack();
      // The game is still there, the question is open and the round stands still.
      const question = screen.getByRole("dialog", { name: "End the game?" });
      expect(question).toHaveTextContent("The game that is running will be lost.");
      expect(screen.getByRole("heading", { name: "Paused" })).toBeVisible();
      expect(window.location.hash).toBe("#/games/taboo");

      // Keep playing: the question closes and the round goes on.
      fireEvent.click(within(question).getByRole("button", { name: "Keep playing" }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.queryByRole("heading", { name: "Paused" })).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Pause" })).toBeVisible();

      // Asked again, the game can be ended: it returns to the line-up of the game, not to the hub.
      await pressSystemBack();
      fireEvent.click(
        within(screen.getByRole("dialog", { name: "End the game?" })).getByRole("button", {
          name: "End game",
        }),
      );
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.getByRole("region", { name: "Line-up" })).toBeVisible();
      expect(window.location.hash).toBe("#/games/taboo");

      // On the line-up one Back leaves the game for the hub; the guard left no entry behind.
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 40));
      });
      await pressSystemBack();
      expect(window.location.hash).toBe("#/");
      expect(screen.queryByRole("region", { name: "Line-up" })).not.toBeInTheDocument();
    });

    it("goes back from the configuration of Werewolf to its main menu, not to the hub", async () => {
      const i18n = await createGameHubI18n("en");
      render(
        <I18nextProvider i18n={i18n}>
          <App
            cardLanguage="en"
            modules={[createWerewolfModule()]}
            onCardLanguageChange={vi.fn()}
          />
        </I18nextProvider>,
      );
      fireEvent.click(
        screen
          .getByRole("heading", { name: "Werewolf" })
          .closest("section")!
          .querySelector("button")!,
      );
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 40));
      });
      fireEvent.click(screen.getByRole("button", { name: "Configuration" }));
      expect(screen.getByRole("region", { name: "Configuration" })).toBeVisible();

      await pressSystemBack();
      // Back in the main menu of Werewolf: the button of the configuration is there again, the hub is not.
      expect(screen.queryByRole("region", { name: "Configuration" })).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Configuration" })).toBeVisible();
      expect(window.location.hash).toBe("#/games/werewolf");
    });

    it("closes the settings window of the app with the Back key and stays in the game", async () => {
      await renderTaboo();
      fireEvent.click(screen.getByRole("button", { name: "Settings" }));
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      await pressSystemBack();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.getByRole("region", { name: "Line-up" })).toBeVisible();
      expect(window.location.hash).toBe("#/games/taboo");
    });

    it("asks before the Back key ends a running game of Werewolf", async () => {
      const i18n = await createGameHubI18n("en");
      const user = userEvent.setup();
      render(
        <I18nextProvider i18n={i18n}>
          <App
            cardLanguage="en"
            modules={[createWerewolfModule()]}
            onCardLanguageChange={vi.fn()}
          />
        </I18nextProvider>,
      );
      await user.click(
        screen
          .getByRole("heading", { name: "Werewolf" })
          .closest("section")!
          .querySelector("button")!,
      );
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 40));
      });
      await user.type(
        screen.getByLabelText("Add player"),
        "Anna, Ben, Cleo, Dora, Emil, Finn, Gina{enter}",
      );
      await user.click(screen.getByRole("button", { name: /Choose\s+narrator/ }));
      await user.click(
        within(await screen.findByRole("dialog")).getByRole("button", { name: "Anna" }),
      );
      await user.click(screen.getByRole("button", { name: "Start game" }));
      expect(await screen.findByText(/Hand the device to this person/)).toBeInTheDocument();

      // The Back key asks first; the game goes on when the narrator keeps playing.
      await pressSystemBack();
      const question = screen.getByRole("dialog", { name: "End the game?" });
      fireEvent.click(within(question).getByRole("button", { name: "Keep playing" }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.getByText(/Hand the device to this person/)).toBeInTheDocument();

      // Asked again, the game can be ended: back in the main menu of Werewolf, not in the hub.
      await pressSystemBack();
      fireEvent.click(
        within(screen.getByRole("dialog", { name: "End the game?" })).getByRole("button", {
          name: "End game",
        }),
      );
      expect(await screen.findByRole("button", { name: "Start game" })).toBeInTheDocument();
      expect(window.location.hash).toBe("#/games/werewolf");
    });

    it("closes the rules of Werewolf with the Back key and stays in its main menu", async () => {
      const i18n = await createGameHubI18n("en");
      render(
        <I18nextProvider i18n={i18n}>
          <App
            cardLanguage="en"
            modules={[createWerewolfModule()]}
            onCardLanguageChange={vi.fn()}
          />
        </I18nextProvider>,
      );
      fireEvent.click(
        screen
          .getByRole("heading", { name: "Werewolf" })
          .closest("section")!
          .querySelector("button")!,
      );
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 40));
      });
      fireEvent.click(screen.getByRole("button", { name: "Rules" }));
      expect(screen.getByRole("dialog", { name: "Werewolf rules" })).toBeInTheDocument();

      await pressSystemBack();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Configuration" })).toBeVisible();
      expect(window.location.hash).toBe("#/games/werewolf");
    });

    it("goes one step back in the settings of a game, like the arrow in the header", async () => {
      await renderTaboo();
      openGameSettings();
      expect(screen.getByRole("group", { name: "Rounds per team" })).toBeVisible();

      await pressSystemBack();
      expect(screen.getByRole("region", { name: "Line-up" })).toBeVisible();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(window.location.hash).toBe("#/games/taboo");
    });

    it("leaves the game for the hub from its line-up", async () => {
      await renderTaboo();
      expect(screen.getByRole("region", { name: "Line-up" })).toBeVisible();
      await pressSystemBack();
      expect(window.location.hash).toBe("#/");
      expect(screen.queryByRole("region", { name: "Line-up" })).not.toBeInTheDocument();
    });
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
    await user.click(screen.getAllByRole("button", { name: "Spielen" }).at(0)!);
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
    await user.click(screen.getAllByRole("button", { name: "Play" }).at(0)!);
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
