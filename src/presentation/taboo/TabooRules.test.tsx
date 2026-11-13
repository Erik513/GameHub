import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { expect, it } from "vitest";
import { tabooStandardCards } from "../../data/tabooStandardCards";
import { createGameHubI18n } from "../../i18n";
import { TabooSetup } from "./TabooSetup";

it.each([
  ["de", "Spielregeln", "Spielregeln Tabu", "Auf jeder Karte", "Auf Zeit"],
  ["en", "Rules", "Taboo rules", "Every card shows", "Race"],
] as const)(
  "explains the card and the forbidden words above the tabs and moves between tabs with the arrow keys in %s",
  async (language, open, title, general, raceTab) => {
    const user = userEvent.setup();
    const i18n = await createGameHubI18n(language);
    render(
      <I18nextProvider i18n={i18n}>
        <TabooSetup cardLanguage={language} cards={tabooStandardCards} />
      </I18nextProvider>,
    );

    await user.click(screen.getByRole("button", { name: open }));
    const dialog = screen.getByRole("dialog", { name: title });
    // Two rules for every game mode stand above the tabs.
    const general2 = within(dialog).getAllByRole("listitem").slice(0, 2);
    expect(general2[0]).toHaveTextContent(general);
    expect(general2[1]).toHaveTextContent(/4/);

    const tabs = within(dialog).getAllByRole("tab");
    tabs[0]!.focus();
    await user.keyboard("{ArrowRight}");
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    expect(tabs[1]).toHaveTextContent(raceTab);
    expect(tabs[1]).toHaveFocus();
    // The arrow keys go around.
    await user.keyboard("{ArrowRight}");
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(within(dialog).getByRole("tabpanel")).toHaveAttribute("aria-labelledby", tabs[0]!.id);
  },
);
