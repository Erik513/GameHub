import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { expect, it, vi } from "vitest";
import { createGameHubI18n } from "../../i18n";
import { TabooPlayers } from "./TabooPlayers";

it.each([
  [
    "en",
    "Players and teams (optional)",
    "Player names",
    "Split randomly into teams",
    "Team of Ben",
    "Teams",
  ],
  [
    "de",
    "Spieler und Teams (optional)",
    "Spielernamen",
    "Zufällig auf Teams verteilen",
    "Team von Ben",
    "Teams",
  ],
] as const)(
  "splits players randomly and lets them be moved by hand in %s",
  async (language, summary, label, draw, teamOfBen, teamsLabel) => {
    const random = vi.spyOn(Math, "random").mockReturnValue(0);
    const user = userEvent.setup();
    const i18n = await createGameHubI18n(language);
    render(
      <I18nextProvider i18n={i18n}>
        <TabooPlayers teamCount={2} />
      </I18nextProvider>,
    );
    await user.click(screen.getByText(summary));
    expect(screen.queryByRole("button", { name: draw })).toBeNull();
    await user.type(screen.getByLabelText(label), "Anna{enter}Ben{enter}Cara");
    await user.click(screen.getByRole("button", { name: draw }));
    const teams = screen.getByRole("list", { name: teamsLabel });
    const text = within(teams)
      .getAllByRole("listitem")
      .map((item) => item.textContent ?? "")
      .join("|");
    for (const name of ["Anna", "Ben", "Cara"]) expect(text).toContain(name);
    await user.selectOptions(screen.getByLabelText(teamOfBen), "1");
    expect(within(teams).getAllByRole("listitem")[1]).toHaveTextContent("Ben");
    await user.selectOptions(screen.getByLabelText(teamOfBen), "");
    expect(within(teams).getAllByRole("listitem")[1]).not.toHaveTextContent("Ben");
    random.mockRestore();
  },
);
