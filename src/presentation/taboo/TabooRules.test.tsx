import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { expect, it } from "vitest";
import { tabooStandardCards } from "../../data/tabooStandardCards";
import { createGameHubI18n } from "../../i18n";
import { App } from "../App";
import { PlayerRosterProvider } from "../game-kit";
import { createTabooModule } from "./tabooModule";

const texts = {
  de: {
    open: "Spielen",
    rules: "Spielregeln",
    title: "Spielregeln Tabu",
    players: "Spielerliste",
    close: "Schließen",
    headings: ["Ziel", "Die Karte", "Ein Zug", "Spielmodi", "Einstellungen"],
    buttons: ["Richtig", "Überspringen", "Verbotenes Wort"],
    example: "Strand",
    tiebreak: "Stechen",
    mode: "Klassisch",
  },
  en: {
    open: "Play",
    rules: "Rules",
    title: "Taboo rules",
    players: "Player list",
    close: "Close",
    headings: ["Goal", "The card", "One turn", "Game modes", "Settings"],
    buttons: ["Correct", "Skip", "Forbidden word"],
    example: "Beach",
    tiebreak: "tiebreak",
    mode: "Classic",
  },
} as const;

it.each(["de", "en"] as const)(
  "puts the rules into the header of the game and explains everything in short parts in %s",
  async (language) => {
    const text = texts[language];
    // Each test starts at the GameHub, whatever the last test opened.
    window.location.hash = "#/";
    const user = userEvent.setup();
    const i18n = await createGameHubI18n(language);
    render(
      <I18nextProvider i18n={i18n}>
        <PlayerRosterProvider store={{ read: () => [], write: () => undefined }}>
          <App
            cardLanguage={language}
            modules={[createTabooModule({ cards: tabooStandardCards })]}
            onCardLanguageChange={() => undefined}
          />
        </PlayerRosterProvider>
      </I18nextProvider>,
    );

    // The GameHub has the button "Player list" in the header, not the rules.
    expect(screen.getByRole("button", { name: text.players })).toBeVisible();
    expect(screen.queryByRole("button", { name: text.rules })).not.toBeInTheDocument();

    // The main menu of a game has the button "Rules" instead of "Player list".
    await user.click(screen.getAllByRole("button", { name: text.open }).at(0)!);
    expect(screen.queryByRole("button", { name: text.players })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: text.rules }));
    const dialog = screen.getByRole("dialog", { name: text.title });

    // Short parts with a heading each, in the order of a game.
    const headings = within(dialog).getAllByRole("heading", { level: 3 });
    expect(headings.map((heading) => heading.textContent)).toEqual(text.headings);
    // The card is shown with an example, and the three buttons of a turn are explained.
    expect(dialog.querySelector(".taboo-rules-card")).toHaveTextContent(text.example);
    expect(dialog.querySelectorAll(".taboo-rules-card li")).toHaveLength(4);
    const pills = [...dialog.querySelectorAll(".kit-rules-pill")].map((pill) => pill.textContent);
    expect(pills).toEqual(text.buttons);
    // Both game modes are explained, without any choice to make in the window.
    expect(dialog).toHaveTextContent(text.mode);
    expect(within(dialog).queryByRole("radio")).not.toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: text.close }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  },
);
