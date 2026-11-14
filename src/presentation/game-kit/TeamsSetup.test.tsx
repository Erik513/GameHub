import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { I18nextProvider } from "react-i18next";
import { expect, it, vi } from "vitest";
import {
  buildTeams,
  defaultTeamRules,
  initialTeamSetup,
  type SetupTeam,
  type TeamRules,
  type TeamSetupValue,
} from "../../business/shared/teamSetup";
import { defaultLineup, type PlayersMode } from "../../business/shared/lineup";
import { createGameHubI18n } from "../../i18n";
import { LineupSetup } from "./LineupSetup";

const texts = {
  en: {
    teams: "Teams",
    name: (n: number) => `Name of team ${n}`,
    defaultName: (n: number) => `Team ${n}`,
    order: "Team order",
    entered: "As entered",
    add: "Add player",
    addButton: "Add",
    remove: (player: string) => `Remove ${player}`,
    noTeam: "No team",
    draw: "Draw teams",
    redraw: "Shuffle again",
    pick: (player: string) => `Team of ${player}`,
    chip: (player: string, team: string) => `${player}, ${team}`,
    edit: (team: string) => `Edit ${team}`,
    done: (team: string) => `Finish editing ${team}`,
  },
  de: {
    teams: "Teams",
    name: (n: number) => `Name von Team ${n}`,
    defaultName: (n: number) => `Team ${n}`,
    order: "Teamreihenfolge",
    entered: "Wie eingegeben",
    add: "Spieler hinzufügen",
    addButton: "Hinzufügen",
    remove: (player: string) => `${player} entfernen`,
    noTeam: "Ohne Team",
    draw: "Teams auslosen",
    redraw: "Neu mischen",
    pick: (player: string) => `Team für ${player}`,
    chip: (player: string, team: string) => `${player}, ${team}`,
    edit: (team: string) => `${team} bearbeiten`,
    done: (team: string) => `Bearbeiten von ${team} beenden`,
  },
} as const;

/** Holds the controlled value like a game would and reports the latest one. */
async function setup(
  language: "en" | "de",
  props: { players?: PlayersMode; rules?: TeamRules } = {},
) {
  const i18n = await createGameHubI18n(language);
  const latest: { value: TeamSetupValue } = { value: initialTeamSetup(props.rules) };
  function Host() {
    const [value, setValue] = useState(latest.value);
    return (
      <LineupSetup
        config={{
          ...defaultLineup,
          maxPlayers: 99,
          minPlayers: 0,
          players: props.players ?? "required",
          teams: props.rules ?? defaultTeamRules,
        }}
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

const teamBox = (number: number) => document.querySelectorAll<HTMLElement>(".kit-team")[number - 1];
const namesIn = (box: HTMLElement | undefined) =>
  [...(box?.querySelectorAll(".kit-name") ?? [])].map((name) => name.textContent);

/** Taps a name and chooses a team in the window that opens. */
async function assign(user: ReturnType<typeof userEvent.setup>, player: string, team: string) {
  await user.click(screen.getByRole("button", { name: player }));
  await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: team }));
}

it.each(["en", "de"] as const)(
  "adds players, draws them into teams and moves one by a tap on the name in %s",
  async (language) => {
    const random = vi.spyOn(Math, "random").mockReturnValue(0);
    const { latest, user, text } = await setup(language);
    // Nobody to draw yet.
    expect(screen.queryByRole("button", { name: text.draw })).not.toBeInTheDocument();

    // Several names at once; the first letter becomes a capital letter.
    await user.type(screen.getByLabelText(text.add), "anna, ben{enter}cara");
    await user.click(screen.getByRole("button", { name: text.addButton }));
    expect(latest.value.playersText).toBe("Anna\nBen\nCara");
    // They wait in a card "No team" until the teams are drawn.
    expect(
      namesIn(
        screen.getByRole("heading", { name: text.noTeam }).closest<HTMLElement>(".kit-team") ??
          undefined,
      ),
    ).toEqual(["Anna", "Ben", "Cara"]);

    await user.click(screen.getByRole("button", { name: text.draw }));
    expect(Object.keys(latest.value.assignment).sort()).toEqual(["Anna", "Ben", "Cara"]);
    expect(screen.queryByRole("heading", { name: text.noTeam })).not.toBeInTheDocument();
    // After the draw the same button shuffles again.
    expect(screen.getByRole("button", { name: text.redraw })).toBeEnabled();
    const team = latest.value.assignment.Ben ?? 0;
    expect(namesIn(teamBox(team + 1))).toContain("Ben");

    // A tap on the name opens the choice of the team of that player.
    await user.click(screen.getByRole("button", { name: "Ben" }));
    expect(screen.getByRole("dialog", { name: text.pick("Ben") })).toBeVisible();
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: text.defaultName(2 - team) }),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(latest.value.assignment.Ben).toBe(1 - team);

    // "No team" takes him out again, and he waits in the card.
    await assign(user, "Ben", text.noTeam);
    expect(latest.value.assignment.Ben).toBeUndefined();
    expect(screen.getByRole("heading", { name: text.noTeam })).toBeVisible();
    random.mockRestore();
  },
);

it("lists the players of a team in alphabetical order", async () => {
  const { latest, user, text } = await setup("en");
  await user.type(screen.getByLabelText(text.add), "Cara, anna, Ben");
  await user.click(screen.getByRole("button", { name: text.addButton }));
  // The list of the players is alphabetical, too.
  const rows = within(screen.getByRole("list", { name: /: 3$/ })).getAllByRole("listitem");
  expect(rows.map((row) => row.querySelector(".kit-member__name")?.textContent)).toEqual([
    "Anna",
    "Ben",
    "Cara",
  ]);
  await assign(user, "Cara", "Team 1");
  await assign(user, "Ben", "Team 1");
  await assign(user, "Anna", "Team 2");
  expect(latest.value.assignment).toEqual({ Anna: 1, Ben: 0, Cara: 0 });
  expect(namesIn(teamBox(1))).toEqual(["Ben", "Cara"]);
  expect(namesIn(teamBox(2))).toEqual(["Anna"]);
});

it("uses the typed team names in the team choice", async () => {
  const { latest, user, text } = await setup("en");
  await user.type(screen.getByRole("textbox", { name: "Name of team 1" }), "Red");
  await user.type(screen.getByLabelText(text.add), "Anna");
  await user.click(screen.getByRole("button", { name: text.addButton }));
  await assign(user, "Anna", "Red");
  expect(latest.value.assignment).toEqual({ Anna: 0 });
  expect(teamsOf({ ...latest.value, order: "entered" })[0]).toMatchObject({
    name: "Red",
    players: ["Anna"],
  });
});

it("closes the team choice with the close button", async () => {
  const { latest, user, text } = await setup("en");
  await user.type(screen.getByLabelText(text.add), "Anna");
  await user.click(screen.getByRole("button", { name: text.addButton }));
  await user.click(screen.getByRole("button", { name: "Anna" }));
  await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Close" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(latest.value.assignment).toEqual({});
});

it("drops the assignment of a player who is removed", async () => {
  const { latest, user, text } = await setup("en");
  await user.type(screen.getByLabelText(text.add), "Anna, Ben");
  await user.click(screen.getByRole("button", { name: text.addButton }));
  await assign(user, "Anna", "Team 1");
  expect(latest.value.assignment).toEqual({ Anna: 0 });

  await user.click(screen.getByRole("button", { name: text.remove("Anna") }));
  expect(latest.value.playersText).toBe("Ben");
  expect(latest.value.assignment).toEqual({});
});

it("does not start anything when Enter is pressed in the field", async () => {
  const onSubmit = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
  const i18n = await createGameHubI18n("en");
  function Host() {
    const [value, setValue] = useState(initialTeamSetup());
    return (
      <form onSubmit={onSubmit}>
        <LineupSetup
          config={{ ...defaultLineup, players: "required", teams: defaultTeamRules }}
          onChange={setValue}
          value={value}
        />
      </form>
    );
  }
  render(
    <I18nextProvider i18n={i18n}>
      <Host />
    </I18nextProvider>,
  );
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Add player"), "Anna{enter}");
  expect(onSubmit).not.toHaveBeenCalled();
  expect(screen.getByRole("button", { name: "Remove Anna" })).toBeVisible();
});

it("shows only the teams when the game has no player list", async () => {
  const off = await setup("en", { players: "off" });
  expect(screen.queryByLabelText("Add player")).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Draw teams" })).not.toBeInTheDocument();
  expect(document.querySelector(".kit-name")).toBeNull();
  expect(off.latest.value.playersText).toBe("");
});
