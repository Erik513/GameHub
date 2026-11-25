import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { expect, it } from "vitest";
import { createGameHubI18n } from "../../i18n";
import { App } from "../App";
import { PlayerRosterProvider } from "../game-kit";
import { createWerewolfModule } from "./werewolfModule";

const texts = {
  de: {
    rules: "Spielregeln",
    title: "Spielanleitung Werwolf",
    tabs: ["Spiel", "Rollen", "Optionen", "Symbole"],
    gameHeadings: ["Ziel", "Vorbereitung", "Die Nacht", "Der Morgen", "Der Tag", "Wer gewinnt"],
    rolesHeadings: ["Grundrollen", "Sonderrollen"],
    firstRole: "Werwölfe",
    magician: "Magier",
    configuration: "Konfiguration",
    close: "Schließen",
    variable: "Variable Rollen",
  },
  en: {
    rules: "Rules",
    title: "Werewolf rules",
    tabs: ["Game", "Roles", "Options", "Symbols"],
    gameHeadings: ["Goal", "Preparation", "The night", "The morning", "The day", "Who wins"],
    rolesHeadings: ["Basic roles", "Special roles"],
    firstRole: "Werewolves",
    magician: "Magician",
    configuration: "Configuration",
    close: "Close",
    variable: "Variable roles",
  },
} as const;

async function renderApp(language: "en" | "de") {
  window.location.hash = "#/games/werewolf";
  const i18n = await createGameHubI18n(language);
  render(
    <I18nextProvider i18n={i18n}>
      <PlayerRosterProvider store={{ read: () => [], write: () => undefined }}>
        <App
          cardLanguage={language}
          modules={[createWerewolfModule()]}
          onCardLanguageChange={() => undefined}
        />
      </PlayerRosterProvider>
    </I18nextProvider>,
  );
  return userEvent.setup();
}

it.each(["de", "en"] as const)(
  "puts the rules into the header, in the line-up and in the configuration, in %s",
  async (language) => {
    const text = texts[language];
    const user = await renderApp(language);
    // The line-up has the button in the header.
    await user.click(await screen.findByRole("button", { name: text.rules }));
    expect(screen.getByRole("dialog", { name: text.title })).toBeInTheDocument();
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: text.close }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    // The configuration has it, too.
    await user.click(screen.getByRole("button", { name: text.configuration }));
    await user.click(screen.getByRole("button", { name: text.rules }));
    expect(screen.getByRole("dialog", { name: text.title })).toBeInTheDocument();
  },
);

it.each(["de", "en"] as const)(
  "explains the game, every role and the options in three tabs in %s",
  async (language) => {
    const text = texts[language];
    const user = await renderApp(language);
    await user.click(await screen.findByRole("button", { name: text.rules }));
    const dialog = screen.getByRole("dialog", { name: text.title });
    expect(
      within(dialog)
        .getAllByRole("tab")
        .map((tab) => tab.textContent),
    ).toEqual(text.tabs);

    // The game: short parts in the order of a game.
    const panel = (index: number) =>
      within(dialog).getAllByRole("tabpanel", { hidden: true })[index]!;
    const heading = (index: number) =>
      within(panel(index))
        .getAllByRole("heading", { level: 3, hidden: true })
        .map((entry) => entry.textContent);
    expect(heading(0)).toEqual(text.gameHeadings);

    // The roles: the basic roles first, then every special role in the order of the minimum number of players.
    await user.click(within(dialog).getByRole("tab", { name: text.tabs[1] }));
    const rolesPanel = panel(1);
    const groups = within(rolesPanel)
      .getAllByRole("heading", { level: 3 })
      .filter((entry) => (text.rolesHeadings as readonly string[]).includes(entry.textContent));
    expect(groups.map((entry) => entry.textContent)).toEqual(text.rolesHeadings);
    const roleNames = within(rolesPanel)
      .getAllByRole("heading", { level: 4 })
      .map((entry) => entry.querySelector("span")?.textContent);
    // Three basic roles and the twelve choices of the special roles (the guards are one choice).
    expect(roleNames).toHaveLength(15);
    expect(roleNames[0]).toBe(text.firstRole);
    expect(roleNames.at(-1)).toBe(text.magician);
    // A role shows its side and from how many players it can play; its explanation is the same as in the "i" window.
    expect(rolesPanel.querySelectorAll(".ww-rules-role__team")).toHaveLength(15);
    expect(rolesPanel.querySelectorAll(".ww-rules-role__meta")).toHaveLength(12);
    expect(rolesPanel.querySelectorAll(".ww-info__part").length).toBeGreaterThan(15);

    // The options: the extras, the settings and both kinds of roles.
    await user.click(within(dialog).getByRole("tab", { name: text.tabs[2] }));
    const optionsPanel = panel(2);
    expect(
      within(optionsPanel)
        .getAllByRole("heading", { level: 4 })
        .map((entry) => entry.textContent),
    ).toHaveLength(2);
    expect(optionsPanel).toHaveTextContent(text.variable);
  },
);

it.each(["de", "en"] as const)(
  "shows the legend of the symbols as the last tab in %s",
  async (language) => {
    const text = texts[language];
    const user = await renderApp(language);
    await user.click(await screen.findByRole("button", { name: text.rules }));
    const dialog = screen.getByRole("dialog", { name: text.title });
    await user.click(within(dialog).getByRole("tab", { name: text.tabs[3] }));
    const panel = within(dialog).getAllByRole("tabpanel", { hidden: true })[3]!;
    // Every symbol (34: roles, extras, states) and every ability in its circle (14) is there with its drawing, and the attribution of the wolf head is shown.
    expect(panel.querySelectorAll(".ww-legend__item")).toHaveLength(48);
    expect(panel.querySelectorAll(".ww-legend__item svg")).toHaveLength(48);
    expect(panel.querySelector('[data-symbol="wolf"]')).not.toBeNull();
    expect(panel.querySelectorAll(".ww-legend__item svg[data-ring]")).toHaveLength(14);
    expect(panel.querySelector(".ww-legend__credits")).toHaveTextContent("CC BY 3.0");
  },
);
