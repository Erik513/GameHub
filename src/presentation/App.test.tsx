import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createGameHubI18n, type SupportedLanguage } from "../i18n";
import { tabooStandardCards } from "../data/tabooStandardCards";
import { App } from "./App";

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
        <App cardLanguage="en" onCardLanguageChange={vi.fn()} tabooCards={tabooStandardCards} />
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

  it("pauses and stops only the running round from the header", async () => {
    vi.useFakeTimers();
    const i18n = await createGameHubI18n("en");
    render(
      <I18nextProvider i18n={i18n}>
        <App cardLanguage="en" onCardLanguageChange={vi.fn()} tabooCards={tabooStandardCards} />
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

    // Stopping ends only the round (two-step red confirmation) and shows the round overview.
    fireEvent.click(screen.getByRole("button", { name: "Stop round" }));
    act(() => void vi.advanceTimersByTime(600));
    fireEvent.click(screen.getByRole("button", { name: "Tap again to stop" }));
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Round overview" })).toBeVisible();
    expect(screen.getByText("Round 1/3")).toBeVisible();
    expect(screen.queryByRole("button", { name: "Pause" })).not.toBeInTheDocument();

    // Only from the overview can the whole game be ended.
    fireEvent.click(screen.getByRole("button", { name: "End game" }));
    act(() => void vi.advanceTimersByTime(600));
    fireEvent.click(screen.getByRole("button", { name: "Tap again to end" }));
    expect(screen.getByRole("button", { name: "Start" })).toBeVisible();
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
    await user.selectOptions(screen.getByRole("combobox", { name: "Interface language" }), "de");

    expect(await screen.findByRole("combobox", { name: "Oberflächensprache" })).toHaveValue("de");
    expect(screen.getByRole("heading", { name: "Wähle ein Spiel" })).toBeVisible();
    expect(onLanguageChange).toHaveBeenCalledWith("de");
  });

  it("reports card language changes without changing the UI language", async () => {
    const user = userEvent.setup();
    const i18n = await createGameHubI18n("en");
    const onCardLanguageChange = vi.fn();

    render(
      <I18nextProvider i18n={i18n}>
        <App cardLanguage="de" onCardLanguageChange={onCardLanguageChange} />
      </I18nextProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Settings" }));
    await user.selectOptions(screen.getByRole("combobox", { name: "Card language" }), "en");

    expect(screen.getByRole("combobox", { name: "Interface language" })).toHaveValue("en");
    expect(onCardLanguageChange).toHaveBeenCalledWith("en");
  });

  it.each([
    ["en", "Settings", "Settings", "Choose the interface and card languages independently."],
    [
      "de",
      "Einstellungen",
      "Einstellungen",
      "Wähle Oberflächen- und Kartensprache unabhängig voneinander.",
    ],
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
