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

const tabNames = () => screen.getAllByRole("tab").map((tab) => tab.textContent);
const selected = () =>
  screen.getAllByRole("tab").find((tab) => tab.getAttribute("aria-selected") === "true")
    ?.textContent;

it.each([
  ["en", ["Players (0)", "Teams (2)"], "Teams (2)"],
  ["de", ["Spieler (0)", "Teams (2)"], "Teams (2)"],
] as const)(
  "shows a tab for the players and a tab for the teams, the teams open, in %s",
  async (language, names, open) => {
    await renderLineup(language, {
      ...defaultLineup,
      players: "optional",
      teams: defaultTeamRules,
    });
    // Names are optional: the teams come first, the number of players and teams is in the tabs.
    expect(tabNames()).toEqual(names);
    expect(selected()).toBe(open);
  },
);

it("shows the players first when they are required, and keeps both tabs in the page", async () => {
  const user = await renderLineup("en", {
    ...defaultLineup,
    players: "required",
    teams: defaultTeamRules,
  });
  expect(selected()).toBe("Players (0)");
  // The inactive tab stays in the page (the style hides it), so a form still reads it.
  expect(screen.getAllByRole("tabpanel")).toHaveLength(2);
  expect(document.querySelectorAll('.kit-tabpanel[data-active="true"]')).toHaveLength(1);
  await user.type(screen.getByLabelText("Add player"), "Anna, Ben{enter}");
  // The number in the tab follows.
  expect(tabNames()[0]).toBe("Players (2)");
});

it("changes the tab with a tap and with the arrow keys, Home and End", async () => {
  const user = await renderLineup("en", {
    ...defaultLineup,
    players: "required",
    teams: defaultTeamRules,
  });
  await user.click(screen.getByRole("tab", { name: "Teams (2)" }));
  expect(selected()).toBe("Teams (2)");
  // Only the chosen tab can be reached with the Tab key.
  expect(screen.getByRole("tab", { name: "Players (0)" })).toHaveAttribute("tabindex", "-1");
  await user.keyboard("{ArrowRight}");
  expect(selected()).toBe("Players (0)");
  await user.keyboard("{ArrowLeft}");
  expect(selected()).toBe("Teams (2)");
  await user.keyboard("{Home}");
  expect(selected()).toBe("Players (0)");
  await user.keyboard("{End}");
  expect(selected()).toBe("Teams (2)");
  // The focus follows, and other keys do nothing.
  expect(screen.getByRole("tab", { name: "Teams (2)" })).toHaveFocus();
  await user.keyboard("a");
  expect(selected()).toBe("Teams (2)");
  // Wrapping around at both ends.
  await user.keyboard("{ArrowRight}");
  expect(selected()).toBe("Players (0)");
  await user.keyboard("{ArrowLeft}");
  expect(selected()).toBe("Teams (2)");
});

it("shows only the players, with a list to remove them, for a game without teams", async () => {
  const user = await renderLineup("en", { ...defaultLineup, players: "required", teams: "off" });
  expect(tabNames()).toEqual(["Players (0)"]);
  expect(screen.queryByRole("button", { name: "Draw teams" })).toBeNull();
  await user.type(screen.getByLabelText("Add player"), "Anna, Ben{enter}");
  expect(screen.getByRole("tab", { name: "Players (2)" })).toBeVisible();
  const panel = screen.getByRole("tabpanel");
  expect(within(panel).getByRole("button", { name: "Remove Anna" })).toBeVisible();
  await user.click(within(panel).getByRole("button", { name: "Remove Anna" }));
  expect(within(panel).queryByRole("button", { name: "Remove Anna" })).toBeNull();
  expect(within(panel).getByRole("button", { name: "Remove Ben" })).toBeVisible();
});

it("shows only the teams for a game that has no player list", async () => {
  await renderLineup("en", { ...defaultLineup, players: "off", teams: defaultTeamRules });
  expect(tabNames()).toEqual(["Teams (2)"]);
  expect(screen.queryByLabelText("Add player")).not.toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: "Name of team 1" })).toBeVisible();
});

it("shows no tab for a game without players and without teams", async () => {
  await renderLineup("en", { ...defaultLineup, players: "off", teams: "off" });
  expect(screen.queryByRole("tab")).not.toBeInTheDocument();
});
