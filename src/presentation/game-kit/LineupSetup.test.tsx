import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { I18nextProvider } from "react-i18next";
import { expect, it } from "vitest";
import { defaultLineup, type LineupConfig } from "../../business/shared/lineup";
import { defaultTeamRules, initialTeamSetup } from "../../business/shared/teamSetup";
import { createGameHubI18n } from "../../i18n";
import { LineupSetup } from "./LineupSetup";

async function renderLineup(language: "en" | "de", config: LineupConfig) {
  const i18n = await createGameHubI18n(language);
  function Host() {
    const [value, setValue] = useState(initialTeamSetup());
    return <LineupSetup config={config} onChange={setValue} value={value} />;
  }
  render(
    <I18nextProvider i18n={i18n}>
      <Host />
    </I18nextProvider>,
  );
  return userEvent.setup();
}

const chapter = (name: string) => screen.queryByRole("region", { name })?.querySelector("details");

it.each([
  ["en", "Players", "Teams", "Players: 0", "Teams: 2"],
  ["de", "Spieler", "Teams", "Spieler: 0", "Teams: 2"],
] as const)(
  "shows a players box and a teams box for a game with both in %s",
  async (language, players, teams, playersSummary, teamsSummary) => {
    await renderLineup(language, {
      ...defaultLineup,
      players: "optional",
      teams: defaultTeamRules,
    });
    // Names are optional: the box of the players is collapsed, the box of the teams is open.
    expect(chapter(players)).not.toHaveAttribute("open");
    expect(chapter(teams)).toHaveAttribute("open");
    // The short status stays visible next to the heading.
    expect(screen.getByText(playersSummary)).toBeInTheDocument();
    expect(screen.getByText(teamsSummary)).toBeInTheDocument();
  },
);

it("shows the player box open when players are required", async () => {
  await renderLineup("en", { ...defaultLineup, players: "required", teams: defaultTeamRules });
  expect(chapter("Players")).toHaveAttribute("open");
});

it("shows only the players, with a list to remove them, for a game without teams", async () => {
  const user = await renderLineup("en", { ...defaultLineup, players: "required", teams: "off" });
  expect(screen.queryByRole("region", { name: "Teams" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Draw teams" })).toBeNull();
  await user.type(screen.getByLabelText("Add player"), "Anna, Ben{enter}");
  const players = screen.getByRole("region", { name: "Players" });
  expect(within(players).getByRole("button", { name: "Remove Anna" })).toBeVisible();
  expect(screen.getByText("Players: 2", { selector: ".kit-chapter__summary" })).toBeVisible();
  await user.click(within(players).getByRole("button", { name: "Remove Anna" }));
  expect(within(players).queryByRole("button", { name: "Remove Anna" })).toBeNull();
  expect(within(players).getByRole("button", { name: "Remove Ben" })).toBeVisible();
});

it("shows only the teams for a game that has no player list", async () => {
  await renderLineup("en", { ...defaultLineup, players: "off", teams: defaultTeamRules });
  expect(screen.queryByRole("region", { name: "Players" })).not.toBeInTheDocument();
  expect(screen.queryByLabelText("Add player")).not.toBeInTheDocument();
  expect(screen.getByRole("region", { name: "Teams" })).toBeVisible();
  expect(screen.getByRole("textbox", { name: "Name of team 1" })).toBeVisible();
});

it("shows nothing for a game without players and without teams", async () => {
  await renderLineup("en", { ...defaultLineup, players: "off", teams: "off" });
  expect(screen.queryByRole("region")).not.toBeInTheDocument();
});
