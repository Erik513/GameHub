import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { expect, it } from "vitest";
import { tabooStandardCards } from "../../data/tabooStandardCards";
import { createGameHubI18n } from "../../i18n";
import { TabooSetup } from "./TabooSetup";

it.each([
  ["de", "Regeln", "Regeln für den Spielmodus", "Auf jeder Karte", "Auf Zeit", "Klassisch"],
  ["en", "Rules", "Rules for the game mode", "Every card shows", "Race", "Classic"],
] as const)(
  "explains the card and the forbidden words above the game modes in the rules tab in %s",
  async (language, tabName, modes, general, raceMode, classicMode) => {
    const user = userEvent.setup();
    const i18n = await createGameHubI18n(language);
    render(
      <I18nextProvider i18n={i18n}>
        <TabooSetup cardLanguage={language} cards={tabooStandardCards} />
      </I18nextProvider>,
    );

    // The rules are a tab of the main menu now, not a window.
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: tabName }));
    const tab = screen.getByRole("tab", { name: tabName });
    expect(tab).toHaveAttribute("aria-selected", "true");
    const panel = document.getElementById(tab.getAttribute("aria-controls") ?? "")!;
    expect(panel).toHaveAttribute("data-active", "true");

    // Two rules for every game mode stand above the game modes.
    const items = within(panel).getAllByRole("listitem");
    expect(items[0]).toHaveTextContent(general);
    expect(items[1]).toHaveTextContent(/4/);

    // The game modes are buttons; the chosen one is filled and its rules stand below.
    const group = within(panel).getByRole("group", { name: modes });
    const buttons = within(group).getAllByRole("button");
    expect(buttons.map((button) => button.textContent)).toEqual([classicMode, raceMode]);
    expect(buttons[0]).toHaveAttribute("aria-pressed", "true");
    await user.click(buttons[1]!);
    expect(buttons[1]).toHaveAttribute("aria-pressed", "true");
    expect(buttons[0]).toHaveAttribute("aria-pressed", "false");
  },
);
