import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { I18nextProvider } from "react-i18next";
import { expect, it } from "vitest";
import { emptyFixedDraft } from "../../business/games/werewolf/fixedConfiguration";
import {
  describeVariableConfiguration,
  emptyVariableDraft,
  setVariableEntryState,
  setVariableItemState,
  type VariableDraft,
  type VariableState,
} from "../../business/games/werewolf/variableConfiguration";
import { createGameHubI18n } from "../../i18n";
import { WerewolfConfiguration, type RolesMode } from "./WerewolfConfiguration";

type Language = "de" | "en";

const put = (draft: VariableDraft, entries: Record<string, VariableState>) =>
  Object.entries(entries).reduce(
    (current, [id, state]) => setVariableEntryState(current, id, state),
    draft,
  );

/** The example of the narrator: eight players, witch, hunter (both options) and Cupid may, the tough guy must. */
const example = put(emptyVariableDraft, {
  cupid: "may",
  "hunter:optional": "may",
  "hunter:required": "may",
  "toughGuy:wolfOnly": "must",
  witch: "may",
});

async function renderVariable(language: Language, players: number, start = emptyVariableDraft) {
  const i18n = await createGameHubI18n(language);
  const latest = { variable: start };
  function Host() {
    const [variable, setVariable] = useState(start);
    const [mode, setMode] = useState<RolesMode>("fixed");
    latest.variable = variable;
    return (
      <WerewolfConfiguration
        draft={emptyFixedDraft}
        mode={mode}
        onChange={() => undefined}
        onDone={() => undefined}
        onModeChange={setMode}
        onVariableChange={setVariable}
        players={players}
        variableDraft={variable}
      />
    );
  }
  render(
    <I18nextProvider i18n={i18n}>
      <Host />
    </I18nextProvider>,
  );
  const user = userEvent.setup();
  // The variable view is chosen with the switch at the top.
  await user.click(
    screen.getByRole("radio", { name: language === "en" ? "Variable roles" : "Variable Rollen" }),
  );
  return { latest, user };
}

const roles = { de: "Rollen und Zusätze", en: "Roles and extras" } as const;
const box = (name: string) => screen.getByRole("region", { name });
const chips = (name: string) =>
  [...box(name).querySelectorAll(".ww-chip__main")].map((chip) => chip.getAttribute("aria-label"));

it.each([
  ["en", "Must be in the game", "May be in the game"],
  ["de", "Muss ins Spiel", "Darf ins Spiel"],
] as const)(
  "shows three boxes for the roles, all in the last one at first (%s)",
  async (language, must, may) => {
    await renderVariable(language, 12);
    expect(chips(`${roles[language]}: ${must}`)).toEqual([]);
    expect(chips(`${roles[language]}: ${may}`)).toEqual([]);
    // Every role that exists for twelve players waits in the box for the roles that should not be in the game.
    const waiting = [
      ...document.querySelectorAll('.ww-vbox[data-state="not"] .ww-chip[data-kind="role"]'),
    ];
    expect(waiting.length).toBeGreaterThan(10);
  },
);

it("shows only the roles that exist for the number of players", async () => {
  await renderVariable("en", 8);
  const all = [...document.querySelectorAll(".ww-chip__main")].map((chip) =>
    chip.getAttribute("aria-label"),
  );
  expect(all).toContain("Witch");
  expect(all).toContain("Tough guy · Wolf attack only");
  expect(all).not.toContain("Magician");
  expect(all).not.toContain("Paranormal investigator");
  // No extra: there are none below nine players.
  expect(document.querySelector('.ww-chip[data-kind="item"]')).toBeNull();
});

it("puts every option of a role in its box on its own, and the extras in the same boxes with their own color", async () => {
  await renderVariable("en", 12, setVariableItemState(example, "amulet", "may"));
  expect(chips("Roles and extras: Must be in the game")).toContain("Tough guy · Wolf attack only");
  expect(chips("Roles and extras: May be in the game")).toEqual(
    expect.arrayContaining([
      "Hunter · Duty to shoot",
      "Hunter · No duty to shoot",
      "Witch",
      "Cupid",
    ]),
  );
  // Three boxes only: an extra stands in the box of its state, and its chip is marked as an extra.
  expect(document.querySelectorAll(".ww-vbox")).toHaveLength(3);
  expect(chips("Roles and extras: May be in the game")).toContain("Protective amulet");
  expect(
    [...document.querySelectorAll('.ww-chip[data-kind="item"]')].map((chip) => chip.textContent),
  ).toEqual(["Protective amulet", "Drunk"]);
  expect(
    [...document.querySelectorAll('.ww-vbox[data-state="not"] .ww-chip[data-kind="item"]')].map(
      (chip) => chip.textContent,
    ),
  ).toEqual(["Drunk"]);
});

it("shows the number of 'may' roles in a field at the bottom, and what is possible", async () => {
  await renderVariable("en", 8, example);
  const range = screen.getByRole("region", { name: "Special roles from May" });
  expect(within(range).getByText("Possible: 0 to 3")).toBeInTheDocument();
  expect(within(range).getByRole("status", { name: "At least" })).toHaveTextContent("0");
  expect(within(range).getByRole("status", { name: "At most" })).toHaveTextContent("3");
});

it("changes the range with the buttons and keeps it inside what is possible", async () => {
  const { latest, user } = await renderVariable("en", 8, example);
  const range = screen.getByRole("region", { name: "Special roles from May" });
  await user.click(within(range).getByRole("button", { name: "At least: one more" }));
  await user.click(within(range).getByRole("button", { name: "At most: one less" }));
  expect(latest.variable.roleRange).toEqual({ maximum: 2, minimum: 1 });
  expect(within(range).getByRole("button", { name: "At least: one less" })).toBeEnabled();
  // The most cannot go below the least, and not above the possible number.
  await user.click(within(range).getByRole("button", { name: "At most: one less" }));
  expect(within(range).getByRole("button", { name: "At most: one less" })).toBeDisabled();
  expect(within(range).getByRole("button", { name: "At most: one more" })).toBeEnabled();
});

it("says to put roles on May while there is none", async () => {
  await renderVariable("en", 12);
  const range = screen.getByRole("region", { name: "Special roles from May" });
  expect(within(range).getByText("No role on May yet.")).toBeInTheDocument();
});

it("lets the wolf counts be chosen where the players allow it, with the standard chosen and a recommendation", async () => {
  const { latest, user } = await renderVariable("en", 7);
  const wolves = screen.getByRole("group", { name: "Werewolves" });
  const buttons = within(wolves).getAllByRole("button");
  expect(buttons).toHaveLength(2);
  expect(buttons.filter((button) => button.getAttribute("aria-pressed") === "true")).toHaveLength(
    1,
  );
  expect(wolves.querySelectorAll("[data-recommended]")).toHaveLength(1);
  await user.click(within(wolves).getByRole("button", { name: "2" }));
  expect(latest.variable.wolfCounts).toEqual([1, 2]);
});

it("has the wolf count fixed where the players allow only one", async () => {
  await renderVariable("en", 6);
  const wolves = screen.getByRole("group", { name: "Werewolves" });
  expect(within(wolves).getAllByRole("button")).toHaveLength(1);
  // The only count is shown as chosen and fixed (readable, like in the fixed mode), not as a locked button.
  const only = within(wolves).getByRole("button");
  expect(only).toHaveAttribute("aria-pressed", "true");
  expect(only).toHaveAttribute("data-fixed", "true");
  expect(only).toBeEnabled();
});

it("tells that the selection cannot be played when the logic says so", async () => {
  await renderVariable("en", 12, put(emptyVariableDraft, { magician: "must", witch: "must" }));
  expect(screen.getByRole("alert")).toHaveTextContent(
    "This selection cannot be played with 12 players.",
  );
});

it("keeps the general rules of the variable roles apart from the fixed ones", async () => {
  const { latest, user } = await renderVariable("en", 12);
  await user.click(screen.getByRole("radio", { name: "Night 1" }));
  expect(latest.variable.rules.attackOnFirstNight).toBe(true);
});

/** Pretends that the pointer is over the element, as jsdom has no layout. */
function pointerOver(element: Element | null) {
  Object.defineProperty(document, "elementFromPoint", { configurable: true, value: () => element });
}

/** Drags a chip into a box. */
function dragTo(name: string, boxElement: Element | null) {
  const chip = screen.getByRole("button", { name });
  fireEvent.pointerDown(chip, { button: 0, clientX: 10, clientY: 10 });
  pointerOver(boxElement);
  fireEvent.pointerMove(window, { clientX: 60, clientY: 60 });
  fireEvent.pointerUp(window, { clientX: 60, clientY: 60 });
}

const boxOf = (_kind: "item" | "role", state: VariableState) =>
  document.querySelector(`.ww-vbox[data-state="${state}"]`);

it.each([
  ["en", "Witch", "May be in the game", "Roles and extras: May be in the game"],
  ["de", "Hexe", "Darf ins Spiel", "Rollen und Zusätze: Darf ins Spiel"],
] as const)(
  "opens the choice with a tap and moves the role there (%s)",
  async (language, role, choice, area) => {
    const { latest, user } = await renderVariable(language, 12);
    await user.click(screen.getByRole("button", { name: role }));
    const dialog = await screen.findByRole("dialog", { name: role });
    expect(within(dialog).getAllByRole("button", { name: /./ }).length).toBeGreaterThanOrEqual(3);
    await user.click(within(dialog).getByRole("button", { name: choice }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(latest.variable.states).toEqual({ witch: "may" });
    expect(chips(area)).toEqual([role]);
  },
);

it("marks the state of an entry in the choice", async () => {
  const { user } = await renderVariable("en", 12, put(emptyVariableDraft, { witch: "must" }));
  await user.click(screen.getByRole("button", { name: "Witch" }));
  const dialog = await screen.findByRole("dialog", { name: "Witch" });
  expect(within(dialog).getByRole("button", { name: "Must be in the game" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(within(dialog).getByRole("button", { name: "Should not be in the game" })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
});

it("lets an entry that is locked only leave the game, and says why", async () => {
  const { latest, user } = await renderVariable(
    "en",
    12,
    put(emptyVariableDraft, { bodyguard: "must" }),
  );
  await user.click(screen.getByRole("button", { name: "Night guest" }));
  const dialog = await screen.findByRole("dialog", { name: "Night guest" });
  expect(
    within(dialog).getByText("The other role of this pair must be in the game."),
  ).toBeVisible();
  expect(within(dialog).getByRole("button", { name: "Must be in the game" })).toBeDisabled();
  expect(within(dialog).getByRole("button", { name: "May be in the game" })).toBeDisabled();
  expect(within(dialog).getByRole("button", { name: "Should not be in the game" })).toBeEnabled();
  await user.click(within(dialog).getByRole("button", { name: "Should not be in the game" }));
  expect(latest.variable.states).toEqual({ bodyguard: "must" });
});

it("moves a role by dragging it into a box", async () => {
  const { latest } = await renderVariable("en", 12);
  dragTo("Cupid", boxOf("role", "must"));
  expect(latest.variable.states).toEqual({ cupid: "must" });
  dragTo("Cupid", boxOf("role", "may"));
  expect(latest.variable.states).toEqual({ cupid: "may" });
  dragTo("Cupid", boxOf("role", "not"));
  expect(latest.variable.states).toEqual({});
});

it("puts the other options of a role to 'not' when one is dragged to 'must'", async () => {
  const { latest } = await renderVariable(
    "en",
    12,
    put(emptyVariableDraft, { "hunter:optional": "may", "hunter:required": "may" }),
  );
  dragTo("Hunter · Duty to shoot", boxOf("role", "must"));
  expect(latest.variable.states).toEqual({ "hunter:required": "must" });
});

it("moves an extra into the same boxes as the roles", async () => {
  const { latest } = await renderVariable("en", 12);
  dragTo("Protective amulet", boxOf("item", "may"));
  expect(latest.variable.items.amulet).toBe("may");
  dragTo("Protective amulet", boxOf("role", "must"));
  expect(latest.variable.items.amulet).toBe("must");
  // A role dropped there moves as well, and the extra stays where it is.
  dragTo("Cupid", boxOf("item", "may"));
  expect(latest.variable.states).toEqual({ cupid: "may" });
  expect(latest.variable.items.amulet).toBe("must");
});

it("does nothing when a role is dropped outside the boxes, and ignores a locked one for 'must' and 'may'", async () => {
  const { latest } = await renderVariable("en", 12, put(emptyVariableDraft, { bodyguard: "must" }));
  dragTo("Cupid", null);
  expect(latest.variable.states).toEqual({ bodyguard: "must" });
  dragTo("Night guest", boxOf("role", "may"));
  expect(latest.variable.states).toEqual({ bodyguard: "must" });
});

it("shows the role that is dragged under the pointer", async () => {
  await renderVariable("en", 12);
  const chip = screen.getByRole("button", { name: "Cupid" });
  fireEvent.pointerDown(chip, { button: 0, clientX: 10, clientY: 10 });
  pointerOver(boxOf("role", "may"));
  fireEvent.pointerMove(window, { clientX: 60, clientY: 60 });
  expect(document.querySelector(".ww-chip--ghost")).toHaveTextContent("Cupid");
  expect(boxOf("role", "may")).toHaveAttribute("data-over");
  fireEvent.pointerUp(window, { clientX: 60, clientY: 60 });
  expect(document.querySelector(".ww-chip--ghost")).toBeNull();
});

it("explains the role in the window of its choice", async () => {
  const { user } = await renderVariable("en", 12);
  await user.click(screen.getByRole("button", { name: "Hunter · Duty to shoot" }));
  const dialog = await screen.findByRole("dialog", { name: "Hunter · Duty to shoot" });
  await user.click(
    within(dialog).getByRole("button", { name: "Info about Hunter · Duty to shoot" }),
  );
  // The explanation opens on top of the choice and tells what the hunter does.
  const dialogs = screen.getAllByRole("dialog");
  expect(dialogs).toHaveLength(2);
  expect(dialogs[1]).toHaveTextContent("Tasks");
});

it("explains an extra in the window of its choice", async () => {
  const { user } = await renderVariable("en", 12);
  await user.click(screen.getByRole("button", { name: "Protective amulet" }));
  const dialog = await screen.findByRole("dialog", { name: "Protective amulet" });
  expect(
    within(dialog).getByRole("button", { name: "Info about Protective amulet" }),
  ).toBeInTheDocument();
});

it("shows the wake-up order of the variable roles, with the roles that may be in the game called as well", async () => {
  const { user } = await renderVariable(
    "en",
    12,
    put(emptyVariableDraft, { cupid: "may", witch: "must" }),
  );
  await user.click(screen.getByRole("button", { name: "Wake-up order" }));
  const dialog = await screen.findByRole("dialog", { name: "Wake-up order" });
  const steps = [...dialog.querySelectorAll(".ww-wake__step")].map((step) => ({
    name: step.querySelector("strong")?.textContent,
    presence: step.getAttribute("data-presence"),
  }));
  expect(steps.filter((step) => step.presence !== "not").map((step) => step.name)).toEqual([
    "Cupid",
    "Werewolves",
    "Seer",
    "Witch",
  ]);
  expect(steps.find((step) => step.name === "Cupid")?.presence).toBe("may");
  expect(
    within(dialog).getByText("May be in the game: only woken if it is drawn"),
  ).toBeInTheDocument();
  expect(dialog).toHaveTextContent("only if the draw took it");
});

it("shows the fixed order again when the fixed roles are chosen", async () => {
  const { user } = await renderVariable("en", 12, put(emptyVariableDraft, { cupid: "may" }));
  await user.click(screen.getByRole("radio", { name: "Fixed roles" }));
  await user.click(screen.getByRole("button", { name: "Wake-up order" }));
  const dialog = await screen.findByRole("dialog", { name: "Wake-up order" });
  // Nothing of the variable draft shows in the fixed order.
  expect(dialog.querySelector('[data-presence="may"]')).toBeNull();
});

it("gives every role and extra its info button", async () => {
  await renderVariable("en", 12, put(emptyVariableDraft, { cupid: "may", witch: "must" }));
  const chips = [...document.querySelectorAll(".ww-chip")];
  expect(chips.length).toBeGreaterThan(10);
  for (const chip of chips) {
    expect(chip.querySelector(".ww-chip__info")).not.toBeNull();
  }
  expect(screen.getByRole("button", { name: "Info about Protective amulet" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Info about Cupid" })).toBeInTheDocument();
});

it("cannot drag an entry that is locked, as another option of its role must be in the game", async () => {
  const { latest } = await renderVariable(
    "en",
    12,
    put(emptyVariableDraft, { "hunter:required": "must" }),
  );
  const locked = screen.getByRole("button", { name: "Hunter · No duty to shoot" });
  expect(locked.closest(".ww-chip")).toHaveAttribute("data-lock");
  fireEvent.pointerDown(locked, { button: 0, clientX: 10, clientY: 10 });
  pointerOver(boxOf("role", "may"));
  fireEvent.pointerMove(window, { clientX: 60, clientY: 60 });
  expect(document.querySelector(".ww-chip--ghost")).toBeNull();
  fireEvent.pointerUp(window, { clientX: 60, clientY: 60 });
  expect(latest.variable.states).toEqual({ "hunter:required": "must" });
});

it("has the same top as the fixed roles: the wolves with the first attack in one box, the villagers and the seer", async () => {
  await renderVariable("en", 12);
  const core = document.querySelector(".ww-core");
  const left = core?.querySelector(".ww-core__wolves");
  expect(left?.querySelector(".ww-card--wolves")).not.toBeNull();
  expect(within(left as HTMLElement).getByRole("radio", { name: "Night 2" })).toBeChecked();
  const seer = within(core as HTMLElement).getByRole("group", { name: "Seer" });
  expect(seer.querySelector(".ww-stat__value")).toHaveTextContent("1");
  // The number of villagers is the range the draw can leave: twelve players, wolves, seer and the roles.
  const villagers = within(core as HTMLElement).getByRole("group", { name: "Villagers" });
  expect(villagers.querySelector(".ww-stat__value")?.textContent).toMatch(/^\d+(–\d+)?$/);
});

it("takes no further role into 'must' once the seats are full, by dragging or by the choice", async () => {
  // Witch and Cupid wait on "may"; the other roles move to "must" until no seat is left.
  let draft = put(emptyVariableDraft, { cupid: "may", witch: "may" });
  for (let step = 0; step < 30; step += 1) {
    const next = describeVariableConfiguration(8, draft).entries.find(
      (view) =>
        view.state === "not" &&
        view.lock === null &&
        !view.mustBlocked &&
        view.entry.id !== "cupid" &&
        view.entry.id !== "witch",
    );
    if (!next) break;
    draft = setVariableEntryState(draft, next.entry.id, "must");
  }
  const { latest, user } = await renderVariable("en", 8, draft);
  dragTo("Witch", boxOf("role", "must"));
  expect(latest.variable.states.witch).toBe("may");
  await user.click(screen.getByRole("button", { name: "Witch" }));
  const dialog = await screen.findByRole("dialog", { name: "Witch" });
  expect(within(dialog).getByRole("button", { name: "Must be in the game" })).toBeDisabled();
  expect(within(dialog).getByRole("button", { name: "Should not be in the game" })).toBeEnabled();
  expect(dialog).toHaveTextContent("No place is free for it.");
});

it("starts the drag by itself when a role is held for a moment, without moving it", async () => {
  // jsdom has no layout: scrolling an element is a no-op here.
  Object.defineProperty(Element.prototype, "scrollBy", {
    configurable: true,
    value: () => undefined,
  });
  const { latest } = await renderVariable("en", 12);
  const chip = screen.getByRole("button", { name: "Cupid" });
  pointerOver(boxOf("role", "may"));
  fireEvent.pointerDown(chip, { button: 0, clientX: 10, clientY: 10 });
  // Right after the press nothing is dragged: it could still be a tap.
  expect(document.querySelector(".ww-chip--ghost")).toBeNull();
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));
  });
  expect(document.querySelector(".ww-chip--ghost")).toHaveTextContent("Cupid");
  expect(boxOf("role", "may")).toHaveAttribute("data-over");
  fireEvent.pointerUp(window, { clientX: 10, clientY: 10 });
  expect(latest.variable.states).toEqual({ cupid: "may" });
  expect(document.querySelector(".ww-chip--ghost")).toBeNull();
});

it("keeps a quick press without moving a tap that opens the choice", async () => {
  await renderVariable("en", 12);
  const chip = screen.getByRole("button", { name: "Cupid" });
  fireEvent.pointerDown(chip, { button: 0, clientX: 10, clientY: 10 });
  fireEvent.pointerUp(window, { clientX: 10, clientY: 10 });
  fireEvent.click(chip);
  expect(await screen.findByRole("dialog", { name: "Cupid" })).toBeInTheDocument();
  // The timer of the hold is gone: no drag starts later.
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));
  });
  expect(document.querySelector(".ww-chip--ghost")).toBeNull();
});

it("does not recommend the only wolf count there is", async () => {
  await renderVariable("en", 6);
  const wolves = screen.getByRole("group", { name: "Werewolves" });
  expect(within(wolves).getByRole("button")).not.toHaveAttribute("data-recommended");
  expect(wolves.parentElement?.textContent).not.toContain("recommended");
});

it.each([
  ["en", "Hunter · Duty to shoot", "Hunter"],
  ["de", "Jäger · Schusspflicht", "Jäger"],
] as const)(
  "shows an option of a role as its dashed sign next to the name, the words stay in the name of the button (%s)",
  async (language, name, visible) => {
    await renderVariable(language, 12);
    const chip = screen.getByRole("button", { name });
    expect(chip).toHaveTextContent(new RegExp(`^${visible}$`));
    expect(chip.querySelector('.ww-variant[data-variant="required"]')).not.toBeNull();
    document.body.innerHTML = "";
  },
);

it("keeps the heading of the boxes in place: only the boxes scroll", async () => {
  await renderVariable("de", 12);
  const heading = screen.getByRole("heading", { name: "Rollen und Zusätze" });
  expect(heading.closest(".kit-pane__header")).not.toBeNull();
  expect(heading.closest(".kit-pane__body")).toBeNull();
  expect(document.querySelector(".kit-pane__body .ww-vboxes")).not.toBeNull();
});
