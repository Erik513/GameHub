import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { I18nextProvider } from "react-i18next";
import { afterEach, expect, it, vi } from "vitest";
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
    add: "Add player",
    addButton: "Add",
    remove: (player: string) => `Remove ${player}`,
    noTeam: "No team",
    draw: "Split randomly into teams",
    chip: (player: string, team: string) => `${player}, ${team}`,
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
    draw: "Zufällig auf Teams verteilen",
    chip: (player: string, team: string) => `${player}, ${team}`,
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
  "adds players, splits them randomly and takes them out with a tap in %s",
  async (language) => {
    const random = vi.spyOn(Math, "random").mockReturnValue(0);
    const { latest, user, text } = await setup(language);
    // Nobody to split yet.
    expect(screen.getByRole("button", { name: text.draw })).toBeDisabled();

    // Several names at once; the first letter becomes a capital letter.
    await user.type(screen.getByLabelText(text.add), "anna, ben{enter}cara");
    await user.click(screen.getByRole("button", { name: text.addButton }));
    expect(latest.value.playersText).toBe("Anna\nBen\nCara");
    // They wait without a team.
    const waiting = screen.getByRole("list", { name: text.noTeam });
    expect(within(waiting).getAllByRole("listitem")).toHaveLength(3);

    await user.click(screen.getByRole("button", { name: text.draw }));
    expect(Object.keys(latest.value.assignment).sort()).toEqual(["Anna", "Ben", "Cara"]);
    expect(screen.queryByRole("list", { name: text.noTeam })).not.toBeInTheDocument();

    // A tap takes a player out of his team; another tap puts him into the smallest team.
    const label = (team: number | undefined) =>
      text.chip("Ben", team === undefined ? text.noTeam : text.defaultName(team + 1));
    const ben = latest.value.assignment.Ben ?? 0;
    await user.click(screen.getByRole("button", { name: label(ben) }));
    expect(latest.value.assignment.Ben).toBeUndefined();
    await user.click(screen.getByRole("button", { name: label(undefined) }));
    expect(latest.value.assignment.Ben).toBeDefined();
    random.mockRestore();
  },
);

it("shows who is in which team and uses the typed team names", async () => {
  const { latest, user, text } = await setup("en");
  await user.type(screen.getByRole("textbox", { name: "Name of team 1" }), "Red");
  await user.type(screen.getByLabelText(text.add), "Anna, Ben");
  await user.click(screen.getByRole("button", { name: text.addButton }));
  // One tap puts Anna into the first team, which is called Red now.
  await user.click(screen.getByRole("button", { name: text.chip("Anna", text.noTeam) }));
  expect(latest.value.assignment).toEqual({ Anna: 0 });
  const red = screen.getByRole("list", { name: "Red" });
  expect(within(red).getByRole("button", { name: text.chip("Anna", "Red") })).toBeVisible();
  expect(teamsOf({ ...latest.value, order: "entered" })[0]).toMatchObject({
    name: "Red",
    players: ["Anna"],
  });
});

it("drops the assignment of a player who is removed", async () => {
  const { latest, user, text } = await setup("en");
  await user.type(screen.getByLabelText(text.add), "Anna, Ben");
  await user.click(screen.getByRole("button", { name: text.addButton }));
  await user.click(screen.getByRole("button", { name: text.chip("Anna", text.noTeam) }));
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
        <TeamsSetup onChange={setValue} value={value} />
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
  expect(screen.getByRole("button", { name: "Anna, No team" })).toBeVisible();
});

it("shows only the teams with `off`", async () => {
  const off = await setup("en", { players: "off" });
  expect(screen.queryByLabelText("Add player")).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Split randomly into teams" }),
  ).not.toBeInTheDocument();
  expect(off.latest.value.playersText).toBe("");
});

afterEach(() => {
  vi.restoreAllMocks();
  Reflect.deleteProperty(document, "elementFromPoint");
});

/** Pretends that the pointer is over the element, as jsdom has no layout. */
function pointerOver(element: Element | null) {
  Object.defineProperty(document, "elementFromPoint", { configurable: true, value: () => element });
}

it("drags a player into a team and back out of it", async () => {
  const { latest, user, text } = await setup("en");
  await user.type(screen.getByLabelText(text.add), "Anna");
  await user.click(screen.getByRole("button", { name: text.addButton }));
  expect(screen.getAllByText("Drag players here")).toHaveLength(2);

  const anna = screen.getByRole("button", { name: text.chip("Anna", text.noTeam) });
  const secondTeam = screen.getAllByText("Drag players here")[1]?.closest("[data-drop]") ?? null;
  fireEvent.pointerDown(anna, { button: 0, clientX: 10, clientY: 10 });
  pointerOver(secondTeam);
  fireEvent.pointerMove(window, { clientX: 60, clientY: 60 });
  // The tag follows the pointer and the field under it is marked.
  expect(secondTeam).toHaveAttribute("data-over");
  expect(document.querySelector(".kit-chip--ghost")).toHaveTextContent("Anna");
  fireEvent.pointerUp(window, { clientX: 60, clientY: 60 });
  expect(latest.value.assignment).toEqual({ Anna: 1 });
  expect(document.querySelector(".kit-chip--ghost")).toBeNull();

  // Dropped outside of every field nothing changes; dropped on "No team" he leaves the team.
  const inTeam = screen.getByRole("button", { name: text.chip("Anna", text.defaultName(2)) });
  fireEvent.pointerDown(inTeam, { button: 0, clientX: 10, clientY: 10 });
  pointerOver(null);
  fireEvent.pointerMove(window, { clientX: 60, clientY: 60 });
  const none = document.querySelector("[data-drop='none']");
  pointerOver(none);
  fireEvent.pointerMove(window, { clientX: 70, clientY: 70 });
  fireEvent.pointerUp(window, { clientX: 70, clientY: 70 });
  expect(latest.value.assignment).toEqual({});
});

it("does not change anything when a drag is cancelled or only a tiny move", async () => {
  const { latest, user, text } = await setup("en");
  await user.type(screen.getByLabelText(text.add), "Anna");
  await user.click(screen.getByRole("button", { name: text.addButton }));
  const anna = screen.getByRole("button", { name: text.chip("Anna", text.noTeam) });
  const team = screen.getAllByText("Drag players here")[0]?.closest("[data-drop]") ?? null;
  pointerOver(team);

  fireEvent.pointerDown(anna, { button: 0, clientX: 10, clientY: 10 });
  fireEvent.pointerMove(window, { clientX: 12, clientY: 12 });
  expect(document.querySelector(".kit-chip--ghost")).toBeNull();
  fireEvent.pointerUp(window, { clientX: 12, clientY: 12 });

  fireEvent.pointerDown(anna, { button: 0, clientX: 10, clientY: 10 });
  fireEvent.pointerMove(window, { clientX: 80, clientY: 80 });
  fireEvent.pointerCancel(window, { clientX: 80, clientY: 80 });
  fireEvent.pointerDown(anna, { button: 2, clientX: 10, clientY: 10 });
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
  const anna = screen.getByRole("button", { name: text.chip("Anna", text.noTeam) });
  pointerOver(null);

  const run = () => frames.splice(0).forEach((frame) => frame(0));
  fireEvent.pointerDown(anna, { button: 0, clientX: 10, clientY: 300 });
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
