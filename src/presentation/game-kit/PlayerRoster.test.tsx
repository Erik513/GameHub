import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { I18nextProvider } from "react-i18next";
import { expect, it } from "vitest";
import type { PlayerGroup, PlayerGroupStore } from "../../business/shared/playerGroups";
import type { PlayerRosterStore } from "../../business/shared/playerRoster";
import { initialTeamSetup } from "../../business/shared/teamSetup";
import { createGameHubI18n } from "../../i18n";
import { PlayerRosterButton } from "./PlayerRosterButton";
import { PlayerRosterProvider } from "./PlayerRosterProvider";
import { PlayersSetup } from "./PlayersSetup";
import { RosterPicker } from "./RosterPicker";

const texts = {
  en: {
    open: "Player list",
    newGroup: "New group",
    groupName: "Name of the group",
    playerName: "Name of the player",
    add: "Add",
    back: (group: string) => `Back to the groups from ${group}`,
    deleteGroup: (group: string) => `Delete group ${group}`,
    deleteGroupConfirm: (group: string) => `Tap again to delete ${group}`,
    remove: (name: string) => `Remove ${name} from the group`,
    removeConfirm: (name: string) => `Tap again to remove ${name}`,
    noGroups: "No groups yet.",
    emptyGroup: "Nobody is in this group yet.",
    duplicateGroup: "This group exists already.",
    duplicatePlayer: "This player is in the group already.",
    pick: "Choose from player list",
    chooseAll: "Choose all",
    chooseNone: "Choose none",
    apply: "Apply",
    cancel: "Cancel",
    manage: "Manage player list",
    pickEmpty: "There are no players yet",
    defaultGroup: "Players",
  },
  de: {
    open: "Spielerliste",
    newGroup: "Neue Gruppe",
    groupName: "Name der Gruppe",
    playerName: "Name des Spielers",
    add: "Hinzufügen",
    back: (group: string) => `Zurück zu den Gruppen von ${group}`,
    deleteGroup: (group: string) => `Gruppe ${group} löschen`,
    deleteGroupConfirm: (group: string) => `Nochmal tippen, um ${group} zu löschen`,
    remove: (name: string) => `${name} aus der Gruppe entfernen`,
    removeConfirm: (name: string) => `Nochmal tippen, um ${name} zu entfernen`,
    noGroups: "Noch keine Gruppen.",
    emptyGroup: "In dieser Gruppe ist noch niemand.",
    duplicateGroup: "Diese Gruppe gibt es schon.",
    duplicatePlayer: "Dieser Spieler ist schon in der Gruppe.",
    pick: "Aus Spielerliste wählen",
    chooseAll: "Alle wählen",
    chooseNone: "Keinen wählen",
    apply: "Übernehmen",
    cancel: "Abbrechen",
    manage: "Spielerliste verwalten",
    pickEmpty: "Es gibt noch keine Spieler",
    defaultGroup: "Spieler",
  },
} as const;

function stores(players: readonly string[] = [], groups: readonly PlayerGroup[] = []) {
  const state = { players, groups };
  const store: PlayerRosterStore = {
    read: () => state.players,
    write: (names) => {
      state.players = names;
    },
  };
  const groupStore: PlayerGroupStore = {
    read: () => state.groups,
    write: (next) => {
      state.groups = next;
    },
  };
  return { groupStore, state, store };
}

async function renderWith(
  language: "en" | "de",
  setup: ReturnType<typeof stores>,
  children: React.ReactNode,
) {
  const i18n = await createGameHubI18n(language);
  render(
    <I18nextProvider i18n={i18n}>
      <PlayerRosterProvider
        defaultGroupName={texts[language].defaultGroup}
        groupStore={setup.groupStore}
        store={setup.store}
      >
        {children}
      </PlayerRosterProvider>
    </I18nextProvider>,
  );
  return userEvent.setup();
}

const waitForGuard = () => new Promise((resolve) => setTimeout(resolve, 450));

it.each(["en", "de"] as const)(
  "creates groups, adds players to them and removes them again in %s",
  async (language) => {
    const text = texts[language];
    const setup = stores();
    const user = await renderWith(language, setup, <PlayerRosterButton />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: text.open }));
    const dialog = screen.getByRole("dialog");
    // There is no list of loose players: first a group has to be created.
    expect(dialog).toHaveTextContent(text.noGroups);
    expect(within(dialog).queryByRole("textbox")).not.toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: text.newGroup }));
    await user.type(within(dialog).getByRole("textbox", { name: text.groupName }), "family{enter}");
    expect(setup.state.groups).toEqual([{ name: "Family", members: [] }]);
    // A group name that exists already is refused with a message.
    await user.click(within(dialog).getByRole("button", { name: text.newGroup }));
    await user.type(within(dialog).getByRole("textbox", { name: text.groupName }), "FAMILY");
    await user.click(within(dialog).getByRole("button", { name: text.add }));
    expect(within(dialog).getByRole("alert")).toHaveTextContent(text.duplicateGroup);
    await user.clear(within(dialog).getByRole("textbox", { name: text.groupName }));
    await user.type(within(dialog).getByRole("textbox", { name: text.groupName }), "Work{enter}");
    expect(setup.state.groups.map((group) => group.name)).toEqual(["Family", "Work"]);

    // The groups are listed; a tap on a group shows its players.
    await user.click(within(dialog).getByRole("button", { name: /^Family/ }));
    expect(dialog).toHaveTextContent(text.emptyGroup);
    await user.type(within(dialog).getByRole("textbox", { name: text.playerName }), "anna{enter}");
    await user.type(within(dialog).getByRole("textbox", { name: text.playerName }), "ben{enter}");
    expect(setup.state.players).toEqual(["Anna", "Ben"]);
    expect(setup.state.groups[0]).toEqual({ name: "Family", members: ["Anna", "Ben"] });
    await user.type(within(dialog).getByRole("textbox", { name: text.playerName }), "ANNA");
    await user.click(within(dialog).getByRole("button", { name: text.add }));
    expect(within(dialog).getByRole("alert")).toHaveTextContent(text.duplicatePlayer);

    // The same person can be in a second group.
    await user.click(within(dialog).getByRole("button", { name: text.back("Family") }));
    await user.click(within(dialog).getByRole("button", { name: /^Work/ }));
    await user.type(within(dialog).getByRole("textbox", { name: text.playerName }), "anna{enter}");
    expect(setup.state.players).toEqual(["Anna", "Ben"]);
    expect(setup.state.groups[1]).toEqual({ name: "Work", members: ["Anna"] });

    // Removing needs a second tap; a player who leaves the last group leaves the list.
    await user.click(within(dialog).getByRole("button", { name: text.remove("Anna") }));
    expect(setup.state.groups[1]?.members).toEqual(["Anna"]);
    const armed = within(dialog).getByRole("button", { name: text.removeConfirm("Anna") });
    expect(armed).toHaveAttribute("data-armed", "true");
    await waitForGuard();
    await user.click(armed);
    expect(setup.state.groups[1]?.members).toEqual([]);
    expect(setup.state.players).toEqual(["Anna", "Ben"]);

    // Deleting a group needs a second tap, too, and takes the players who were only in it along.
    await user.click(within(dialog).getByRole("button", { name: text.back("Work") }));
    await user.click(within(dialog).getByRole("button", { name: /^Family/ }));
    await user.click(within(dialog).getByRole("button", { name: text.deleteGroup("Family") }));
    expect(setup.state.groups).toHaveLength(2);
    await waitForGuard();
    await user.click(
      within(dialog).getByRole("button", { name: text.deleteGroupConfirm("Family") }),
    );
    expect(setup.state.groups.map((group) => group.name)).toEqual(["Work"]);
    expect(setup.state.players).toEqual([]);
    // After the delete the list of groups is shown again.
    expect(within(dialog).getByRole("button", { name: /^Work/ })).toBeInTheDocument();
  },
);

it("shows nothing without a player list in the app", async () => {
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <PlayerRosterProvider store={undefined}>
        <PlayerRosterButton />
      </PlayerRosterProvider>
    </I18nextProvider>,
  );
  expect(screen.queryByRole("button", { name: "Player list" })).not.toBeInTheDocument();
});

it.each(["en", "de"] as const)(
  "puts players saved without a group into a group of their own in %s",
  async (language) => {
    const text = texts[language];
    const setup = stores(["Anna", "Ben"]);
    const user = await renderWith(language, setup, <PlayerRosterButton />);
    expect(setup.state.groups).toEqual([{ name: text.defaultGroup, members: ["Anna", "Ben"] }]);
    await user.click(screen.getByRole("button", { name: text.open }));
    expect(
      within(screen.getByRole("dialog")).getByRole("button", { name: /^(Players|Spieler)/ }),
    ).toHaveTextContent("2");
  },
);

it.each(["en", "de"] as const)(
  "chooses players from the groups into the players field in %s",
  async (language) => {
    const text = texts[language];
    const setup = stores(
      ["Anna", "Ben", "Cara"],
      [
        { name: "Family", members: ["Anna", "Cara"] },
        { name: "Work", members: ["Ben", "Cara"] },
        { name: "Club", members: [] },
      ],
    );
    function Host() {
      const [value, setValue] = useState({ ...initialTeamSetup(), playersText: "Dora, ben" });
      return <PlayersSetup onChange={setValue} value={value} />;
    }
    const user = await renderWith(language, setup, <Host />);
    await user.click(screen.getByRole("button", { name: text.pick }));
    const dialog = screen.getByRole("dialog");
    // At first only the groups are listed; Ben is in the field already.
    expect(within(dialog).queryByRole("checkbox")).not.toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: /^Work/ })).toHaveTextContent("1/2");

    await user.click(within(dialog).getByRole("button", { name: /^Family/ }));
    expect(
      within(dialog)
        .getAllByRole("checkbox")
        .map((box) => box.closest("label")?.textContent),
    ).toEqual(["Anna", "Cara"]);
    // "Choose all" covers the players that are shown.
    await user.click(within(dialog).getByRole("button", { name: text.chooseAll }));
    expect(within(dialog).getByRole("button", { name: text.chooseNone })).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: text.back("Family") }));
    expect(within(dialog).getByRole("button", { name: /^Family/ })).toHaveTextContent("2/2");

    // The choice of a player counts in every group the player is in.
    await user.click(within(dialog).getByRole("button", { name: /^Work/ }));
    expect(within(dialog).getByRole("checkbox", { name: "Cara" })).toBeChecked();
    await user.click(within(dialog).getByRole("checkbox", { name: "Ben" }));
    await user.click(within(dialog).getByRole("button", { name: text.back("Work") }));
    await user.click(within(dialog).getByRole("button", { name: text.apply }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    // Hand-typed Dora stays, deselected Ben goes, ticked Anna and Cara are added.
    const names = within(screen.getByRole("list", { name: /: 3$/ }))
      .getAllByRole("listitem")
      .map((item) => item.textContent?.replace("×", "").trim());
    expect(names).toEqual(["Anna", "Cara", "Dora"]);
  },
);

it("can choose none and cancel without changing the field", async () => {
  const setup = stores(["Anna", "Ben"], [{ name: "Family", members: ["Anna", "Ben"] }]);
  function Host() {
    const [value, setValue] = useState("");
    return (
      <>
        <RosterPicker onChange={setValue} value={value} />
        <output>{value}</output>
      </>
    );
  }
  const user = await renderWith("en", setup, <Host />);
  await user.click(screen.getByRole("button", { name: texts.en.pick }));
  const dialog = screen.getByRole("dialog");
  // The list of groups has no "choose all": it has the button to manage the player list instead.
  expect(
    within(dialog).queryByRole("button", { name: texts.en.chooseAll }),
  ).not.toBeInTheDocument();
  expect(within(dialog).getByRole("button", { name: texts.en.manage })).toBeInTheDocument();
  // Inside a group "choose all" and "choose none" work on the players of the group.
  await user.click(within(dialog).getByRole("button", { name: /^Family/ }));
  await user.click(within(dialog).getByRole("button", { name: texts.en.chooseAll }));
  await user.click(within(dialog).getByRole("button", { name: texts.en.back("Family") }));
  expect(within(dialog).getByRole("button", { name: /^Family/ })).toHaveTextContent("2/2");
  await user.click(within(dialog).getByRole("button", { name: /^Family/ }));
  await user.click(within(dialog).getByRole("button", { name: texts.en.chooseNone }));
  await user.click(within(dialog).getByRole("button", { name: texts.en.back("Family") }));
  expect(within(dialog).getByRole("button", { name: /^Family/ })).toHaveTextContent("0/2");
  await user.click(within(dialog).getByRole("button", { name: texts.en.cancel }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.getByRole("status")).toBeEmptyDOMElement();
});

it("tells that a group is empty and offers nothing to choose", async () => {
  const setup = stores(
    ["Anna"],
    [
      { name: "Family", members: ["Anna"] },
      { name: "Work", members: [] },
    ],
  );
  const user = await renderWith("en", setup, <RosterPicker onChange={() => undefined} value="" />);
  await user.click(screen.getByRole("button", { name: texts.en.pick }));
  const dialog = screen.getByRole("dialog");
  await user.click(within(dialog).getByRole("button", { name: /^Work/ }));
  expect(dialog).toHaveTextContent(texts.en.emptyGroup);
  expect(within(dialog).queryByRole("checkbox")).not.toBeInTheDocument();
  expect(within(dialog).getByRole("button", { name: texts.en.chooseAll })).toBeDisabled();
});

it("tells the player to create a group first when there are no players", async () => {
  const setup = stores();
  const user = await renderWith("en", setup, <RosterPicker onChange={() => undefined} value="" />);
  await user.click(screen.getByRole("button", { name: texts.en.pick }));
  expect(screen.getByRole("dialog")).toHaveTextContent(texts.en.pickEmpty);
  expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
});

it.each(["en", "de"] as const)(
  "manages groups and players from the window to choose them in %s",
  async (language) => {
    const text = texts[language];
    const setup = stores();
    const user = await renderWith(
      language,
      setup,
      <RosterPicker onChange={() => undefined} value="" />,
    );
    // Even an empty list can be filled right there, without leaving the line-up.
    await user.click(screen.getByRole("button", { name: text.pick }));
    await user.click(screen.getByRole("button", { name: text.manage }));
    const dialogs = screen.getAllByRole("dialog");
    expect(dialogs).toHaveLength(2);
    const manage = within(dialogs[1]!);
    await user.click(manage.getByRole("button", { name: text.newGroup }));
    await user.type(manage.getByRole("textbox", { name: text.groupName }), "Family{enter}");
    await user.click(manage.getByRole("button", { name: /^Family/ }));
    await user.type(manage.getByRole("textbox", { name: text.playerName }), "Anna{enter}");
    // The window below shows the new group and its player at once.
    await user.click(within(dialogs[0]!).getByRole("button", { name: /^Family/ }));
    expect(within(dialogs[0]!).getByRole("checkbox", { name: "Anna" })).toBeInTheDocument();
  },
);

it("allows no more ticks than the limit of the field and says so", async () => {
  const setup = stores(
    ["Anna", "Ben", "Cleo", "Dora"],
    [{ name: "Family", members: ["Anna", "Ben", "Cleo", "Dora"] }],
  );
  const user = await renderWith(
    "en",
    setup,
    <RosterPicker limit={2} onChange={() => undefined} value="" />,
  );
  await user.click(screen.getByRole("button", { name: texts.en.pick }));
  const dialog = screen.getByRole("dialog");
  await user.click(within(dialog).getByRole("button", { name: /^Family/ }));
  await user.click(within(dialog).getByRole("checkbox", { name: "Anna" }));
  // The line for the limit is always there (so the buttons never move), but empty.
  expect(within(dialog).getByRole("status")).toBeEmptyDOMElement();
  await user.click(within(dialog).getByRole("checkbox", { name: "Ben" }));
  // Two are ticked: the others cannot be ticked any more, and the window tells why.
  expect(within(dialog).getByRole("checkbox", { name: "Cleo" })).toBeDisabled();
  expect(within(dialog).getByRole("status")).toHaveTextContent("at most 2 people");
  // Unticking one makes room again.
  await user.click(within(dialog).getByRole("checkbox", { name: "Ben" }));
  expect(within(dialog).getByRole("checkbox", { name: "Cleo" })).toBeEnabled();
});

it('takes only as many players with "Choose all" as the limit allows, names typed by hand included', async () => {
  const setup = stores(
    ["Anna", "Ben", "Cleo"],
    [{ name: "Family", members: ["Anna", "Ben", "Cleo"] }],
  );
  let applied = "";
  const user = await renderWith(
    "en",
    setup,
    <RosterPicker limit={3} onChange={(text) => (applied = text)} value="Zoe" />,
  );
  await user.click(screen.getByRole("button", { name: texts.en.pick }));
  const dialog = screen.getByRole("dialog");
  await user.click(within(dialog).getByRole("button", { name: /^Family/ }));
  await user.click(within(dialog).getByRole("button", { name: texts.en.chooseAll }));
  await user.click(within(dialog).getByRole("button", { name: texts.en.back("Family") }));
  await user.click(within(dialog).getByRole("button", { name: texts.en.apply }));
  // Zoe stays (typed by hand), so only two of the three fit.
  expect(applied.split(", ")).toHaveLength(3);
  expect(applied).toContain("Zoe");
});

it("offers the button to manage the player list at the top of the list of groups only", async () => {
  const setup = stores(["Anna"], [{ name: "Family", members: ["Anna"] }]);
  const user = await renderWith("en", setup, <RosterPicker onChange={() => undefined} value="" />);
  await user.click(screen.getByRole("button", { name: texts.en.pick }));
  const dialog = screen.getByRole("dialog");
  const manage = () => within(dialog).queryByRole("button", { name: texts.en.manage });
  // In the list of groups: at the top, above the groups and the buttons to apply and cancel.
  const before = (first: HTMLElement | null, second: HTMLElement) =>
    Boolean(first && first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING);
  expect(before(manage(), within(dialog).getByRole("button", { name: /^Family/ }))).toBe(true);
  expect(before(manage(), within(dialog).getByRole("button", { name: texts.en.apply }))).toBe(true);
  // Inside a group it is gone.
  await user.click(within(dialog).getByRole("button", { name: /^Family/ }));
  expect(manage()).not.toBeInTheDocument();
  await user.click(within(dialog).getByRole("button", { name: texts.en.back("Family") }));
  expect(manage()).toBeInTheDocument();
});
