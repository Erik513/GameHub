import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { I18nextProvider } from "react-i18next";
import { expect, it, vi } from "vitest";
import {
  buildTeams,
  initialTeamSetup,
  type SetupTeam,
  type TeamRules,
  type TeamSetupValue,
} from "../../business/shared/teamSetup";
import { createGameHubI18n } from "../../i18n";
import { TeamsSetup } from "./TeamsSetup";

const texts = {
  en: {
    teams: "Teams",
    name: (n: number) => `Name of team ${n}`,
    defaultName: (n: number) => `Team ${n}`,
    order: "Team order",
    entered: "As entered",
    heading: "Players (optional)",
    headingRequired: "Players",
    opener: "Enter names and split",
    players: "Player names",
    draw: "Split randomly into teams",
    teamOf: (player: string) => `Team of ${player}`,
    assignment: "Teams",
  },
  de: {
    teams: "Teams",
    name: (n: number) => `Name von Team ${n}`,
    defaultName: (n: number) => `Team ${n}`,
    order: "Teamreihenfolge",
    entered: "Wie eingegeben",
    heading: "Spieler (optional)",
    headingRequired: "Spieler",
    opener: "Namen eintragen und verteilen",
    players: "Spielernamen",
    draw: "Zufällig auf Teams verteilen",
    teamOf: (player: string) => `Team von ${player}`,
    assignment: "Teams",
  },
} as const;

/** Holds the controlled value like a game would and reports the latest one. */
async function setup(
  language: "en" | "de",
  props: { players?: "off" | "optional" | "required"; rules?: TeamRules } = {},
) {
  const i18n = await createGameHubI18n(language);
  const latest: { value: TeamSetupValue } = { value: initialTeamSetup(props.rules) };
  function Host() {
    const [value, setValue] = useState(latest.value);
    return (
      <TeamsSetup
        {...props}
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
      <Host />
    </I18nextProvider>,
  );
  return { latest, user: userEvent.setup(), text: texts[language] };
}

const teamsOf = (value: TeamSetupValue): SetupTeam[] =>
  buildTeams(value, { defaultName: (n) => `Team ${n}` });

it.each(["en", "de"] as const)(
  "changes the number of teams and their names in %s",
  async (language) => {
    const { latest, user, text } = await setup(language);
    const group = screen.getByRole("group", { name: text.teams });
    expect(within(group).getAllByRole("radio")).toHaveLength(5);
    expect(screen.getAllByRole("textbox", { name: /Name/ })).toHaveLength(2);
    expect(screen.getByPlaceholderText(text.defaultName(2))).toBeVisible();

    await user.click(within(group).getByRole("radio", { name: "4" }));
    expect(latest.value.count).toBe(4);
    expect(screen.getAllByRole("textbox", { name: /Name/ })).toHaveLength(4);

    await user.type(screen.getByRole("textbox", { name: text.name(2) }), "Blue");
    await user.type(screen.getByRole("textbox", { name: text.name(4) }), "Green");
    expect(latest.value.names).toEqual(["", "Blue", "", "Green"]);
    expect(
      teamsOf(latest.value)
        .map((team) => team.name)
        .sort(),
    ).toEqual(["Blue", "Green", "Team 1", "Team 3"].sort());

    await user.click(within(group).getByRole("radio", { name: "2" }));
    expect(screen.getAllByRole("textbox", { name: /Name/ })).toHaveLength(2);
    expect(screen.getByRole("textbox", { name: text.name(2) })).toHaveValue("Blue");
  },
);

it.each(["en", "de"] as const)("chooses the team order in %s", async (language) => {
  const { latest, user, text } = await setup(language);
  expect(
    screen.getByRole("radio", { name: texts[language] === texts.en ? "Random" : "Zufällig" }),
  ).toBeChecked();
  await user.click(screen.getByRole("radio", { name: text.entered }));
  expect(latest.value.order).toBe("entered");
  await user.click(
    screen.getByRole("radio", { name: texts[language] === texts.en ? "Random" : "Zufällig" }),
  );
  expect(latest.value.order).toBe("random");
  expect(screen.getByRole("group", { name: text.order })).toBeVisible();
});

it("respects the limits of the game", async () => {
  const { user } = await setup("en", {
    rules: { defaultTeams: 3, maxNameLength: 5, maxTeams: 4, minTeams: 3 },
  });
  const group = screen.getByRole("group", { name: "Teams" });
  expect(
    within(group)
      .getAllByRole("radio")
      .map((radio) => (radio as HTMLInputElement).value),
  ).toEqual(["3", "4"]);
  expect(within(group).getByRole("radio", { name: "3" })).toBeChecked();
  await user.type(screen.getByRole("textbox", { name: "Name of team 1" }), "Longer name");
  expect(screen.getByRole("textbox", { name: "Name of team 1" })).toHaveValue("Longe");
});

it.each(["en", "de"] as const)(
  "splits players randomly and lets them be moved by hand in %s",
  async (language) => {
    const random = vi.spyOn(Math, "random").mockReturnValue(0);
    const { latest, user, text } = await setup(language);
    expect(screen.getByRole("heading", { name: text.heading })).toBeVisible();
    await user.click(screen.getByText(text.opener));
    expect(screen.queryByRole("button", { name: text.draw })).toBeNull();

    await user.type(screen.getByLabelText(text.players), "Anna{enter}Ben{enter}Cara");
    await user.click(screen.getByRole("button", { name: text.draw }));
    const assignment = Object.keys(latest.value.assignment).sort();
    expect(assignment).toEqual(["Anna", "Ben", "Cara"]);

    const teams = screen.getByRole("list", { name: text.assignment });
    await user.selectOptions(screen.getByLabelText(text.teamOf("Ben")), "1");
    expect(latest.value.assignment.Ben).toBe(1);
    expect(within(teams).getAllByRole("listitem")[1]).toHaveTextContent("Ben");
    expect(teamsOf({ ...latest.value, order: "entered" })[1]?.players).toContain("Ben");

    await user.selectOptions(screen.getByLabelText(text.teamOf("Ben")), "");
    expect("Ben" in latest.value.assignment).toBe(false);
    expect(within(teams).getAllByRole("listitem")[1]).not.toHaveTextContent("Ben");
    random.mockRestore();
  },
);

it("drops the assignment of a player who is removed from the list and shows typed team names", async () => {
  const { latest, user, text } = await setup("en");
  await user.type(screen.getByRole("textbox", { name: "Name of team 1" }), "Red");
  await user.click(screen.getByText(text.opener));
  await user.type(screen.getByLabelText(text.players), "Anna, Ben");
  await user.selectOptions(screen.getByLabelText(text.teamOf("Anna")), "0");
  // The team name that was typed is shown instead of "Team 1".
  expect(
    within(screen.getByLabelText(text.teamOf("Anna"))).getByRole("option", { name: "Red" }),
  ).toBeVisible();
  expect(latest.value.assignment).toEqual({ Anna: 0 });

  await user.clear(screen.getByLabelText(text.players));
  await user.type(screen.getByLabelText(text.players), "Ben");
  expect(latest.value.assignment).toEqual({});
});

it("hides the players with `off` and opens the list with `required`", async () => {
  const off = await setup("en", { players: "off" });
  expect(screen.queryByRole("heading", { name: "Players (optional)" })).not.toBeInTheDocument();
  expect(screen.queryByText("Enter names and split")).not.toBeInTheDocument();
  expect(off.latest.value.playersText).toBe("");
});

it("shows the players as required with an open list", async () => {
  const { text } = await setup("en", { players: "required" });
  expect(screen.getByRole("heading", { name: text.headingRequired })).toBeVisible();
  expect(screen.getByLabelText(text.players)).toBeVisible();
  expect(screen.getByText(/Every team needs at least one player/)).toBeVisible();
});
