import { fireEvent, render, screen, within } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { expect, it } from "vitest";
import { createGameHubI18n } from "../../i18n";
import { TabooRules } from "./TabooRules";

it.each([
  ["de", "Spielregeln", "Spielregeln Tabu", "Auf jeder Karte", "Schließen"],
  ["en", "Rules", "Taboo rules", "Every card shows", "Close"],
] as const)(
  "opens and closes the rules dialog in %s",
  async (language, open, title, goal, close) => {
    const i18n = await createGameHubI18n(language);
    render(
      <I18nextProvider i18n={i18n}>
        <TabooRules />
      </I18nextProvider>,
    );

    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: open }));
    const dialog = screen.getByRole("dialog", { name: title });
    expect(within(dialog).getAllByRole("listitem")).toHaveLength(2);
    expect(within(dialog).getByText(new RegExp(`^${goal}`))).toBeTruthy();
    fireEvent.click(within(dialog).getByRole("button", { name: close }));
    expect(screen.queryByRole("dialog")).toBeNull();
  },
);
