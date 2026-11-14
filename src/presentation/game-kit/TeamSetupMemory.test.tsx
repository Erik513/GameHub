import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { I18nextProvider } from "react-i18next";
import { expect, it } from "vitest";
import type { TeamSetupMemory } from "../../business/shared/savedTeamSetup";
import { defaultLineup } from "../../business/shared/lineup";
import {
  defaultTeamRules,
  initialTeamSetup,
  type TeamSetupValue,
} from "../../business/shared/teamSetup";
import { createGameHubI18n } from "../../i18n";
import { LineupSetup } from "./LineupSetup";
import { TeamSetupMemoryProvider } from "./TeamSetupMemoryProvider";

const remembered: TeamSetupValue = {
  assignment: { Anna: 1 },
  count: 9,
  names: ["Red", "Blue"],
  order: [1, 0],
  playersText: "Anna, Ben",
};
/** The second tap of a clear button counts only a moment after the first one. */
const pause = () => new Promise((resolve) => setTimeout(resolve, 450));
const teamGame = { ...defaultLineup, teams: defaultTeamRules };
const memory = (value: TeamSetupValue | undefined): TeamSetupMemory => ({
  read: () => value,
  write: () => undefined,
});

async function renderTeams(language: "en" | "de", stored: TeamSetupValue | undefined) {
  const i18n = await createGameHubI18n(language);
  const latest = { value: initialTeamSetup() };
  function Host() {
    const [value, setValue] = useState(latest.value);
    return (
      <LineupSetup
        config={teamGame}
        onChange={(next) => {
          latest.value = next;
          setValue(next);
        }}
        value={value}
      />
    );
  }
  render(
    <I18nextProvider i18n={i18n}>
      <TeamSetupMemoryProvider memory={memory(stored)}>
        <Host />
      </TeamSetupMemoryProvider>
    </I18nextProvider>,
  );
  return { latest, user: userEvent.setup() };
}

it.each([
  ["en", "Load last players", "Load last teams"],
  ["de", "Letzte Spieler laden", "Letzte Teams laden"],
] as const)(
  "loads the last players and the last teams separately in %s",
  async (language, playersLabel, teamsLabel) => {
    const { latest, user } = await renderTeams(language, remembered);
    // Both buttons are always there; they can be used because something was remembered.
    expect(screen.getByRole("button", { name: playersLabel })).toBeEnabled();
    expect(screen.getByRole("button", { name: teamsLabel })).toBeEnabled();
    // The players come first: the teams alone would have nobody to put into them.
    await user.click(screen.getByRole("button", { name: playersLabel }));
    expect(latest.value).toEqual({ ...initialTeamSetup(), playersText: "Anna, Ben" });
    expect(screen.getByRole("button", { name: playersLabel })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: teamsLabel }));
    // A count above the limit of the game is brought back into the limits.
    expect(latest.value).toEqual({ ...remembered, count: 6 });
    expect(screen.getByRole("button", { name: teamsLabel })).toBeDisabled();
  },
);

it.each([
  [
    "en",
    "Clear teams",
    "Really clear the teams? Tap again",
    "Load last teams",
    "Load last players",
  ],
  [
    "de",
    "Teams leeren",
    "Teams wirklich leeren? Nochmal tippen",
    "Letzte Teams laden",
    "Letzte Spieler laden",
  ],
] as const)(
  "clears the teams with a second tap and keeps the players in %s",
  async (language, clear, confirm, loadTeams, loadPlayers) => {
    const { latest, user } = await renderTeams(language, remembered);
    // Nothing to clear yet: the button is there but cannot be used.
    expect(screen.getByRole("button", { name: clear })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: loadPlayers }));
    await user.click(screen.getByRole("button", { name: loadTeams }));
    expect(screen.getByRole("button", { name: clear })).toBeEnabled();

    // The first tap only asks; the second one clears (after the short guard time).
    await user.click(screen.getByRole("button", { name: clear }));
    expect(latest.value.names).toEqual(["Red", "Blue"]);
    await pause();
    await user.click(screen.getByRole("button", { name: confirm }));
    // The teams are cleared: no names, nobody in a team, but the players stay.
    expect(latest.value).toMatchObject({ assignment: {}, names: [], playersText: "Anna, Ben" });
    expect(screen.getByRole("button", { name: clear })).toBeDisabled();
  },
);

it.each([
  ["en", "Load last teams"],
  ["de", "Letzte Teams laden"],
] as const)(
  "brings the players of the teams along when no players were added in %s",
  async (language, loadTeams) => {
    const { latest, user } = await renderTeams(language, remembered);
    // Nobody was added above, and the button still does something: the teams come with their players.
    expect(latest.value.playersText).toBe("");
    await user.click(screen.getByRole("button", { name: loadTeams }));
    expect(latest.value).toEqual({ ...remembered, count: 6, playersText: "Anna" });
    expect(screen.getByRole("button", { name: "Anna" })).toBeVisible();
    expect(screen.getByRole("button", { name: loadTeams })).toBeDisabled();
  },
);

it("has no clear button for the players", async () => {
  await renderTeams("en", remembered);
  expect(screen.queryByRole("button", { name: /Remove all players/ })).not.toBeInTheDocument();
});

it("cannot load anything when no group was remembered", async () => {
  await renderTeams("en", undefined);
  expect(screen.getByRole("button", { name: "Load last teams" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Load last players" })).toBeDisabled();
});

it("works without a memory provider", async () => {
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <LineupSetup config={teamGame} onChange={() => undefined} value={initialTeamSetup()} />
    </I18nextProvider>,
  );
  expect(screen.getByRole("button", { name: "Load last teams" })).toBeDisabled();
});

it.each([
  ["en", "Load last players"],
  ["de", "Letzte Spieler laden"],
] as const)("loads the last players into a game without teams in %s", async (language, label) => {
  const i18n = await createGameHubI18n(language);
  function Host() {
    const [value, setValue] = useState(initialTeamSetup());
    return (
      <LineupSetup
        config={{ ...defaultLineup, players: "required" }}
        onChange={setValue}
        value={value}
      />
    );
  }
  render(
    <I18nextProvider i18n={i18n}>
      <TeamSetupMemoryProvider memory={memory(remembered)}>
        <Host />
      </TeamSetupMemoryProvider>
    </I18nextProvider>,
  );
  await userEvent.click(screen.getByRole("button", { name: label }));
  // The remembered players are in the list now (each one has a button to remove him).
  const remove = (player: string) =>
    language === "en" ? `Remove ${player}` : `${player} entfernen`;
  expect(screen.getByRole("button", { name: remove("Anna") })).toBeVisible();
  expect(screen.getByRole("button", { name: remove("Ben") })).toBeVisible();
  expect(screen.getByRole("button", { name: label })).toBeDisabled();
});
