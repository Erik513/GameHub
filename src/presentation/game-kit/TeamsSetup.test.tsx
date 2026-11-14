import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { I18nextProvider } from "react-i18next";
import { afterEach, expect, it, vi } from "vitest";
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
    orderDefault: "Default",
    orderRandom: "Random",
    move: (place: number, team: string) => `Move ${team}, place ${place}`,
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
    orderDefault: "Standard",
    orderRandom: "Zufällig",
    move: (place: number, team: string) => `${team} verschieben, Platz ${place}`,
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

/** Pretends that the rows of the order are 50 px high one below the other, as jsdom has no layout. */
function stackRows() {
  return vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
    this: HTMLElement,
  ) {
    const at = this.parentElement ? [...this.parentElement.children].indexOf(this) : 0;
    return { bottom: (at + 1) * 50, top: at * 50 } as DOMRect;
  });
}

const placeNames = (text: { order: string }) =>
  within(screen.getByRole("group", { name: text.order }))
    .getAllByRole("listitem")
    .map((item) => item.textContent);

it.each(["en", "de"] as const)("sets the playing order of the teams in %s", async (language) => {
  const random = vi.spyOn(Math, "random").mockReturnValue(0);
  const { latest, user, text } = await setup(language);
  await user.click(
    within(screen.getByRole("group", { name: "Teams" })).getByRole("radio", { name: "3" }),
  );

  // The normal order, one below the other with fixed places; the button for it cannot be used.
  expect(placeNames(text)).toEqual(["1.Team 1", "2.Team 2", "3.Team 3"]);
  expect(screen.getByRole("button", { name: text.orderDefault })).toBeDisabled();

  // The arrow keys on the handle move a team by one place.
  screen.getByRole("button", { name: text.move(3, "Team 3") }).focus();
  await user.keyboard("{ArrowUp}");
  expect(placeNames(text)).toEqual(["1.Team 1", "2.Team 3", "3.Team 2"]);
  expect(latest.value.order).toEqual([0, 2, 1]);
  await user.keyboard("{ArrowUp}{ArrowUp}");
  expect(latest.value.order).toEqual([2, 0, 1]);
  expect(teamsOf(latest.value).map((team) => team.name)).toEqual(["Team 3", "Team 1", "Team 2"]);

  // "Default" stands left of "Random".
  expect(
    [...document.querySelectorAll<HTMLElement>(".kit-players__actions button")]
      .slice(-2)
      .map((button) => button.textContent),
  ).toEqual([text.orderDefault, text.orderRandom]);
  // "Random" mixes all teams, "Default" brings back the normal order.
  await user.click(screen.getByRole("button", { name: text.orderRandom }));
  expect([...latest.value.order].sort()).toEqual([0, 1, 2]);
  await user.click(screen.getByRole("button", { name: text.orderDefault }));
  expect(latest.value.order).toEqual([]);
  expect(placeNames(text)).toEqual(["1.Team 1", "2.Team 2", "3.Team 3"]);
  random.mockRestore();
});

it("drags a team to another place by its handle", async () => {
  const rows = stackRows();
  const { latest, user, text } = await setup("en");
  await user.click(
    within(screen.getByRole("group", { name: "Teams" })).getByRole("radio", { name: "3" }),
  );
  const handle = screen.getByRole("button", { name: text.move(3, "Team 3") });
  fireEvent.pointerDown(handle, { button: 0 });
  expect(handle.closest("li")).toHaveAttribute("data-dragging");
  // Up to the first place: the team jumps there, the others move down.
  fireEvent.pointerMove(window, { clientY: 10 });
  expect(latest.value.order).toEqual([2, 0, 1]);
  // Further down again to the middle place.
  fireEvent.pointerMove(window, { clientY: 75 });
  expect(latest.value.order).toEqual([0, 2, 1]);
  // Below the last row it is the last place.
  fireEvent.pointerMove(window, { clientY: 400 });
  expect(latest.value.order).toEqual([0, 1, 2]);
  fireEvent.pointerUp(window);
  expect(handle.closest("li")).not.toHaveAttribute("data-dragging");
  // After the end of the drag the pointer does not move the team any more.
  fireEvent.pointerMove(window, { clientY: 10 });
  expect(latest.value.order).toEqual([0, 1, 2]);
  // Another mouse button does not start a drag.
  fireEvent.pointerDown(handle, { button: 2 });
  fireEvent.pointerMove(window, { clientY: 10 });
  expect(latest.value.order).toEqual([0, 1, 2]);
  rows.mockRestore();
});

it("shows the typed team names in the order and keeps it when the number of teams changes", async () => {
  const { latest, user, text } = await setup("en");
  await user.type(screen.getByRole("textbox", { name: "Name of team 2" }), "Blue");
  screen.getByRole("button", { name: text.move(2, "Blue") }).focus();
  await user.keyboard("{ArrowUp}");
  expect(latest.value.order).toEqual([1, 0]);
  // With more teams the new ones follow, with fewer the missing ones are left out.
  await user.click(
    within(screen.getByRole("group", { name: "Teams" })).getByRole("radio", { name: "3" }),
  );
  expect(placeNames(text)).toEqual(["1.Blue", "2.Team 1", "3.Team 3"]);
  // The first place cannot go further up and the last cannot go down.
  screen.getByRole("button", { name: text.move(1, "Blue") }).focus();
  await user.keyboard("{ArrowUp}");
  expect(latest.value.order).toEqual([1, 0, 2]);
  screen.getByRole("button", { name: text.move(3, "Team 3") }).focus();
  await user.keyboard("{ArrowDown}{Enter}");
  expect(placeNames(text)).toEqual(["1.Blue", "2.Team 1", "3.Team 3"]);
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
const dropField = (team: number | "none") =>
  document.querySelector<HTMLElement>(`[data-drop="${team}"]`);
const namesIn = (box: HTMLElement | null | undefined) =>
  [...(box?.querySelectorAll(".kit-name") ?? [])].map((name) => name.textContent);

afterEach(() => {
  vi.restoreAllMocks();
  Reflect.deleteProperty(document, "elementFromPoint");
});

/** Pretends that the pointer is over the element, as jsdom has no layout. */
function pointerOver(element: Element | null) {
  Object.defineProperty(document, "elementFromPoint", { configurable: true, value: () => element });
}

/** Drags the name of a player onto a field (a team or "No team"). */
function dragTo(player: string, field: Element | null) {
  const name = screen.getByRole("button", { name: player });
  fireEvent.pointerDown(name, { button: 0, clientX: 10, clientY: 10 });
  pointerOver(field);
  fireEvent.pointerMove(window, { clientX: 60, clientY: 60 });
  fireEvent.pointerUp(window, { clientX: 60, clientY: 60 });
}

it.each(["en", "de"] as const)(
  "adds players, draws them into teams and moves them by dragging in %s",
  async (language) => {
    const random = vi.spyOn(Math, "random").mockReturnValue(0);
    const { latest, user, text } = await setup(language);
    // Nobody to draw yet.
    expect(screen.queryByRole("button", { name: text.draw })).not.toBeInTheDocument();

    // Several names at once; the first letter becomes a capital letter.
    await user.type(screen.getByLabelText(text.add), "anna, ben{enter}cara");
    await user.click(screen.getByRole("button", { name: text.addButton }));
    expect(latest.value.playersText).toBe("Anna\nBen\nCara");
    // They wait in the card "No team" until they are dragged into a team or drawn.
    expect(namesIn(dropField("none"))).toEqual(["Anna", "Ben", "Cara"]);

    await user.click(screen.getByRole("button", { name: text.draw }));
    expect(Object.keys(latest.value.assignment).sort()).toEqual(["Anna", "Ben", "Cara"]);
    expect(dropField("none")).toBeNull();
    // After the draw the same button shuffles again.
    expect(screen.getByRole("button", { name: text.redraw })).toBeEnabled();
    const team = latest.value.assignment.Ben ?? 0;
    expect(namesIn(teamBox(team + 1))).toContain("Ben");

    // A player is dragged into another team.
    dragTo("Ben", dropField(1 - team));
    expect(latest.value.assignment.Ben).toBe(1 - team);
    expect(namesIn(teamBox(2 - team))).toContain("Ben");

    // A tap on a player in a team takes him out again; he waits in the card "No team".
    await user.click(screen.getByRole("button", { name: "Ben" }));
    expect(latest.value.assignment.Ben).toBeUndefined();
    expect(namesIn(dropField("none"))).toEqual(["Ben"]);
    // A tap on a player without a team does nothing.
    await user.click(screen.getByRole("button", { name: "Ben" }));
    expect(latest.value.assignment.Ben).toBeUndefined();
    random.mockRestore();
  },
);

it("shows the highlight and the name under the pointer while dragging", async () => {
  const { latest, user, text } = await setup("en");
  await user.type(screen.getByLabelText(text.add), "Anna");
  await user.click(screen.getByRole("button", { name: text.addButton }));
  const secondTeam = dropField(1);
  const anna = screen.getByRole("button", { name: "Anna" });
  fireEvent.pointerDown(anna, { button: 0, clientX: 10, clientY: 10 });
  pointerOver(secondTeam);
  fireEvent.pointerMove(window, { clientX: 60, clientY: 60 });
  expect(secondTeam).toHaveAttribute("data-over");
  expect(document.querySelector(".kit-name--ghost")).toHaveTextContent("Anna");
  fireEvent.pointerUp(window, { clientX: 60, clientY: 60 });
  expect(latest.value.assignment).toEqual({ Anna: 1 });
  expect(document.querySelector(".kit-name--ghost")).toBeNull();
  expect(secondTeam).not.toHaveAttribute("data-over");
});

it("drags a player from a team to another one and out of every team", async () => {
  const { latest, user, text } = await setup("en");
  await user.type(screen.getByLabelText(text.add), "Anna");
  await user.click(screen.getByRole("button", { name: text.addButton }));
  dragTo("Anna", dropField(0));
  expect(latest.value.assignment).toEqual({ Anna: 0 });
  dragTo("Anna", dropField(1));
  expect(latest.value.assignment).toEqual({ Anna: 1 });
  // While a name is dragged the card "No team" is there as a field, even when it was empty.
  const anna = screen.getByRole("button", { name: "Anna" });
  fireEvent.pointerDown(anna, { button: 0, clientX: 10, clientY: 10 });
  fireEvent.pointerMove(window, { clientX: 60, clientY: 60 });
  expect(dropField("none")).not.toBeNull();
  pointerOver(dropField("none"));
  fireEvent.pointerUp(window, { clientX: 60, clientY: 60 });
  expect(latest.value.assignment).toEqual({});
});

it("does not change anything when a drag ends outside, is cancelled or is only a tiny move", async () => {
  const { latest, user, text } = await setup("en");
  await user.type(screen.getByLabelText(text.add), "Anna");
  await user.click(screen.getByRole("button", { name: text.addButton }));
  const anna = () => screen.getByRole("button", { name: "Anna" });
  pointerOver(dropField(0));

  fireEvent.pointerDown(anna(), { button: 0, clientX: 10, clientY: 10 });
  fireEvent.pointerMove(window, { clientX: 12, clientY: 12 });
  expect(document.querySelector(".kit-name--ghost")).toBeNull();
  fireEvent.pointerUp(window, { clientX: 12, clientY: 12 });

  fireEvent.pointerDown(anna(), { button: 0, clientX: 10, clientY: 10 });
  fireEvent.pointerMove(window, { clientX: 80, clientY: 80 });
  fireEvent.pointerCancel(window, { clientX: 80, clientY: 80 });

  pointerOver(null);
  fireEvent.pointerDown(anna(), { button: 0, clientX: 10, clientY: 10 });
  fireEvent.pointerMove(window, { clientX: 80, clientY: 80 });
  fireEvent.pointerUp(window, { clientX: 80, clientY: 80 });

  fireEvent.pointerDown(anna(), { button: 2, clientX: 10, clientY: 10 });
  expect(latest.value.assignment).toEqual({});
});

it("scrolls the page while a player is held near the edge", async () => {
  const frames: FrameRequestCallback[] = [];
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => frames.push(callback));
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
  const scrollBy = vi.spyOn(window, "scrollBy").mockImplementation(() => undefined);
  const { user, text } = await setup("en");
  await user.type(screen.getByLabelText(text.add), "Anna");
  await user.click(screen.getByRole("button", { name: text.addButton }));
  pointerOver(null);

  const run = () => frames.splice(0).forEach((frame) => frame(0));
  fireEvent.pointerDown(screen.getByRole("button", { name: "Anna" }), {
    button: 0,
    clientX: 10,
    clientY: 300,
  });
  // In the middle of the screen the page stays where it is.
  fireEvent.pointerMove(window, { clientX: 50, clientY: 300 });
  run();
  expect(scrollBy).not.toHaveBeenCalled();
  // At the top it scrolls up, at the bottom down.
  fireEvent.pointerMove(window, { clientX: 50, clientY: 10 });
  run();
  expect(scrollBy).toHaveBeenLastCalledWith(0, -14);
  fireEvent.pointerMove(window, { clientX: 50, clientY: window.innerHeight - 10 });
  run();
  expect(scrollBy).toHaveBeenLastCalledWith(0, 14);
  fireEvent.pointerUp(window, { clientX: 50, clientY: 10 });
});

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
  dragTo("Cara", dropField(0));
  dragTo("Ben", dropField(0));
  dragTo("Anna", dropField(1));
  expect(latest.value.assignment).toEqual({ Anna: 1, Ben: 0, Cara: 0 });
  expect(namesIn(teamBox(1))).toEqual(["Ben", "Cara"]);
  expect(namesIn(teamBox(2))).toEqual(["Anna"]);
});

it("uses the typed team names in the built teams", async () => {
  const { latest, user, text } = await setup("en");
  await user.type(screen.getByRole("textbox", { name: "Name of team 1" }), "Red");
  await user.type(screen.getByLabelText(text.add), "Anna");
  await user.click(screen.getByRole("button", { name: text.addButton }));
  dragTo("Anna", dropField(0));
  expect(latest.value.assignment).toEqual({ Anna: 0 });
  expect(teamsOf(latest.value)[0]).toMatchObject({ name: "Red", players: ["Anna"] });
});

it("drops the assignment of a player who is removed", async () => {
  const { latest, user, text } = await setup("en");
  await user.type(screen.getByLabelText(text.add), "Anna, Ben");
  await user.click(screen.getByRole("button", { name: text.addButton }));
  dragTo("Anna", dropField(0));
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
  expect(document.querySelector("[data-drop]")).toBeNull();
  expect(off.latest.value.playersText).toBe("");
});
