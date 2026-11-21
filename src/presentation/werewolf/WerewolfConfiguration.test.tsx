import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { I18nextProvider } from "react-i18next";
import { expect, it, vi } from "vitest";
import { emptyFixedDraft, type FixedDraft } from "../../business/games/werewolf/fixedConfiguration";
import {
  emptyVariableDraft,
  type VariableDraft,
} from "../../business/games/werewolf/variableConfiguration";
import { createGameHubI18n } from "../../i18n";
import { WerewolfConfiguration, type RolesMode } from "./WerewolfConfiguration";

type Language = "de" | "en";

async function renderConfiguration(
  language: Language,
  players: number,
  start: FixedDraft = emptyFixedDraft,
  onDone: () => void = () => undefined,
  startVariable: VariableDraft = emptyVariableDraft,
) {
  const i18n = await createGameHubI18n(language);
  const latest: { draft: FixedDraft; variable: VariableDraft } = {
    draft: start,
    variable: startVariable,
  };
  function Host() {
    const [draft, setDraft] = useState(start);
    const [variable, setVariable] = useState(startVariable);
    const [mode, setMode] = useState<RolesMode>("fixed");
    latest.draft = draft;
    latest.variable = variable;
    return (
      <WerewolfConfiguration
        draft={draft}
        mode={mode}
        onChange={setDraft}
        onDone={onDone}
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
  return { latest, user: userEvent.setup() };
}

const text = {
  de: {
    done: "Fertig",
    hunter: "Jäger",
    free: "Freier Schuss",
    tooFew: /mindestens 6 Spieler/,
    witch: "Hexe",
  },
  en: {
    done: "Done",
    hunter: "Hunter",
    free: "No duty to shoot",
    tooFew: /at least 6 players/,
    witch: "Witch",
  },
} as const;

/** The number of villagers, as the big number in its box. */
const villagers = () => document.querySelector(".ww-villagers__number")?.textContent;
/** The wolf count that is chosen. */
const wolves = () => document.querySelector(".ww-wolves__button[aria-pressed='true']")?.textContent;

it.each(["en", "de"] as const)(
  "shows the wolves, the seer and the villagers and says the line-up can be played in %s",
  async (language) => {
    await renderConfiguration(language, 9);
    expect(wolves()).toBe("2");
    expect(villagers()).toBe("6");
    // To read only: the seer (always one) and the villagers, no buttons to set them.
    const stat = (name: string) =>
      screen.getByRole("group", { name }).querySelector(".ww-stat__value");
    // The number of players is not shown here any more.
    expect(
      screen.queryByRole("group", { name: language === "en" ? "Players" : "Spieler" }),
    ).toBeNull();
    expect(stat(language === "en" ? "Seer" : "Seherin")?.textContent).toBe("1");
    const seer = screen.getByRole("group", { name: language === "en" ? "Seer" : "Seherin" });
    // Its "i" button explains the seer.
    expect(
      within(seer).getByRole("button", {
        name: language === "en" ? "Info about Seer" : "Info zu Seherin",
      }),
    ).toBeInTheDocument();
    // Nothing is wrong, so no box of issues is shown.
    expect(document.querySelector(".ww-issues")).toBeNull();
  },
);

it.each(["en", "de"] as const)("asks for more players below six in %s", async (language) => {
  await renderConfiguration(language, 4);
  expect(screen.getByText(text[language].tooFew)).toBeInTheDocument();
  expect(screen.queryByRole("tab")).not.toBeInTheDocument();
});

it.each(["en", "de"] as const)("returns with the button at the bottom in %s", async (language) => {
  const onDone = vi.fn();
  const { user } = await renderConfiguration(language, 8, emptyFixedDraft, onDone);
  await user.click(screen.getByRole("button", { name: text[language].done }));
  expect(onDone).toHaveBeenCalledOnce();
});

it("takes a role and shows one villager less", async () => {
  const { latest, user } = await renderConfiguration("en", 9);
  await user.click(screen.getByRole("checkbox", { name: /^Witch/ }));
  expect(latest.draft.roles).toEqual(["witch"]);
  expect(villagers()).toBe("5");
  await user.click(screen.getByRole("checkbox", { name: /^Witch/ }));
  expect(latest.draft.roles).toEqual([]);
  expect(villagers()).toBe("6");
});

/** A role with options: one joined button, a half for every option (each half is a checkbox). */
const split = (role: string) => within(screen.getByRole("group", { name: role }));

it("takes the hunter with one joined button that shows both options and leaves him out with a second tap", async () => {
  const { latest, user } = await renderConfiguration("en", 9);
  const halves = split("Hunter").getAllByRole("checkbox");
  // Both halves carry the name of the role as the main text and their option as the second line.
  expect(halves).toHaveLength(2);
  expect(halves.map((half) => half.closest("label")?.textContent)).toEqual([
    "HunterDuty to shoot",
    "HunterNo duty to shoot",
  ]);
  await user.click(halves[0]!);
  expect(latest.draft.roles).toEqual(["hunter"]);
  expect(latest.draft.settings.hunterShot).toBe("required");
  expect(halves[0]).toBeChecked();
  await user.click(halves[1]!);
  expect(latest.draft.settings.hunterShot).toBe("optional");
  expect(halves[0]).not.toBeChecked();
  await user.click(halves[1]!);
  expect(latest.draft.roles).toEqual([]);
});

it("holds at most one of the bodyguard and the night guest in one joined button", async () => {
  const { latest, user } = await renderConfiguration("en", 9);
  const guard = split("Bodyguard / night guest");
  await user.click(guard.getByRole("checkbox", { name: /Bodyguard$/ }));
  await user.click(guard.getByRole("checkbox", { name: /Night guest$/ }));
  expect(latest.draft.roles).toEqual(["nightGuest"]);
  await user.click(guard.getByRole("checkbox", { name: /Night guest$/ }));
  expect(latest.draft.roles).toEqual([]);
});

it("sets the option of the tanner, the mayor and the old hag, and the hammer is locked below ten", async () => {
  const { latest, user } = await renderConfiguration("en", 9);
  const hammer = split("Mayor").getByRole("checkbox", { name: /Hammer/ });
  expect(hammer).toBeDisabled();
  await user.click(split("Mayor").getByRole("checkbox", { name: /Double vote/ }));
  await user.click(split("Tanner").getByRole("checkbox", { name: /Win by vote only/ }));
  await user.click(split("Old hag").getByRole("checkbox", { name: /Self-pick allowed/ }));
  expect(latest.draft.settings).toMatchObject({
    allowSelfSilence: true,
    mayor: "doubleVote",
    tanner: "voteOnly",
  });
});

it("locks a role that needs more players, says why, and keeps its info reachable", async () => {
  const { user } = await renderConfiguration("en", 6);
  const cupid = screen.getByRole("checkbox", { name: /^Cupid/ });
  expect(cupid).toBeDisabled();
  expect(screen.getByText("Not available (more players needed)")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Info about Cupid" }));
  const dialog = await screen.findByRole("dialog");
  expect(within(dialog).getByText("From 7 players")).toBeInTheDocument();
  // The info does not take the role.
  expect(cupid).not.toBeChecked();
});

it("has three boxes with a main heading each, and sets the roles in rows by the unlocking", async () => {
  await renderConfiguration("en", 8);
  const boxes = [...document.querySelectorAll(".ww-box")];
  expect(boxes.map((box) => box.querySelector(".ww-box__title")?.textContent)).toEqual([
    "Basic roles and extras",
    "Available roles",
    "Not available (more players needed)",
  ]);
  const [core, available, locked] = boxes as [Element, Element, Element];
  // The extras are the second row of the first box.
  expect(core.querySelector(".ww-row__title")?.textContent).toBe("Extras");
  expect(core.querySelectorAll("input[type='checkbox']")).toHaveLength(2);
  // Available roles: the rows of 6, 7 and 8 players, set apart by lines but without titles.
  expect(available.querySelectorAll(".ww-row")).toHaveLength(3);
  expect(available.querySelectorAll(".ww-row__title")).toHaveLength(0);
  // Locked roles: the rows are set apart by lines only; every tile says in its second line from how
  // many players it is available (a role with options has two halves).
  expect(locked.querySelectorAll(".ww-row")).toHaveLength(3);
  expect(locked.querySelectorAll(".ww-row__title")).toHaveLength(0);
  // The buttons do not tell it any more (the window of the role does), and the text of the role stays.
  expect(locked.querySelectorAll(".ww-tile__lock")).toHaveLength(0);
  expect(locked.querySelector(".ww-tile-wrap small")?.textContent).toBe("Self-pick allowed");
});

it("offers the wolf counts, keeps the pick, and marks the recommendation once", async () => {
  const strong: FixedDraft = { ...emptyFixedDraft, roles: ["witch", "hunter", "cupid"] };
  const { latest, user } = await renderConfiguration("en", 7, strong);
  const group = screen.getByRole("group", { name: "Werewolves" });
  const buttons = within(group).getAllByRole("button");
  expect(buttons.map((button) => button.textContent)).toEqual(["1", "2"]);
  expect(buttons[0]).toHaveAttribute("aria-pressed", "true");
  expect(group.querySelectorAll("[data-recommended]")).toHaveLength(1);
  expect(within(group).getAllByText("recommended")).toHaveLength(1);
  await user.click(buttons[1]!);
  expect(latest.draft.wolfCount).toBe(2);
  expect(villagers()).toBe("1");
});

it("shows a conflict and fixes it only when the button is pressed", async () => {
  const draft: FixedDraft = { ...emptyFixedDraft, roles: ["witch", "magician"], wolfCount: 3 };
  const { latest, user } = await renderConfiguration("en", 14, draft);
  expect(screen.getByText(/do not play together/)).toBeInTheDocument();
  expect(document.querySelector(".ww-issues")).not.toBeNull();
  // Nothing changed by itself.
  expect(latest.draft.wolfCount).toBe(3);
  await user.click(screen.getByRole("button", { name: "Use wolf count 4" }));
  expect(latest.draft.wolfCount).toBe(4);
  expect(document.querySelector(".ww-issues")).toBeNull();
});

it("explains the issues in German", async () => {
  const draft: FixedDraft = { ...emptyFixedDraft, roles: ["magician"] };
  await renderConfiguration("de", 8, draft);
  expect(screen.getByText(/Magier braucht mindestens 11 Spieler/)).toBeInTheDocument();
});

it("sets the extras and the game rules", async () => {
  const { latest, user } = await renderConfiguration("en", 10);
  await user.click(screen.getByRole("checkbox", { name: /^Drunk/ }));
  await user.click(screen.getByRole("checkbox", { name: /^Protective amulet/ }));
  await user.click(screen.getByRole("tab", { name: "Settings" }));
  await user.click(screen.getByRole("radio", { name: "From night 1" }));
  expect(latest.draft.settings).toMatchObject({
    amulet: true,
    attackOnFirstNight: true,
    drunk: true,
  });
  await user.click(screen.getByRole("radio", { name: "From night 2" }));
  expect(latest.draft.settings).toMatchObject({ attackOnFirstNight: false });
  // The roles of people who are out are never revealed by the game: there is nothing to choose.
  expect(screen.queryByRole("radio", { name: "Reveal" })).not.toBeInTheDocument();
});

it("locks the extras below their minimum", async () => {
  await renderConfiguration("en", 8);
  expect(screen.getByRole("checkbox", { name: /^Drunk/ })).toBeDisabled();
  expect(screen.getByRole("checkbox", { name: /^Protective amulet/ })).toBeDisabled();
});

it("locks the other roles when all places are used and frees them when one is dropped", async () => {
  const full: FixedDraft = {
    ...emptyFixedDraft,
    roles: ["witch", "hunter", "idiot", "cupid", "toughGuy"],
  };
  const { user } = await renderConfiguration("en", 7, full);
  // The rest of the roles stay in the box of the available ones, dimmed, with the reason.
  const guard = split("Bodyguard / night guest");
  expect(guard.getAllByRole("checkbox").every((half) => (half as HTMLInputElement).disabled)).toBe(
    true,
  );
  expect(guard.getAllByText(/no place free/)).toHaveLength(2);
  // The second wolf would leave no place for the chosen roles.
  const wolves = within(screen.getByRole("group", { name: "Werewolves" }));
  expect(wolves.getByRole("button", { name: "2" })).toBeDisabled();
  await user.click(screen.getByRole("checkbox", { name: /^Witch/ }));
  expect(wolves.getByRole("button", { name: "2" })).toBeEnabled();
  expect(guard.getByRole("checkbox", { name: /Bodyguard$/ })).toBeEnabled();
});

it("gives every role one row with one info button outside of the button, also a role with options", async () => {
  await renderConfiguration("en", 9);
  // A role with options has one "i" for both options, and it is outside of the joined button.
  const hunter = screen.getAllByRole("button", { name: "Info about Hunter" });
  expect(hunter).toHaveLength(1);
  expect(screen.getByRole("group", { name: "Hunter" })).not.toContainElement(hunter[0]!);
  expect(screen.getAllByRole("button", { name: /^Info about Bodyguard/ })).toHaveLength(1);
  // Every role is one row of the list.
  expect(document.querySelectorAll(".ww-list > .ww-role").length).toBeGreaterThan(8);
});

it.each([
  [6, "Cupid", "From 7 players", "locked"],
  [9, "Witch", "From 6 players", "ok"],
] as const)(
  "shows in the window of a role from how many players it is available (%s players, %s)",
  async (players, role, text, state) => {
    const { user } = await renderConfiguration("en", players);
    await user.click(screen.getByRole("button", { name: `Info about ${role}` }));
    const dialog = await screen.findByRole("dialog");
    const box = dialog.querySelector(".ww-available");
    expect(box).toHaveTextContent(text);
    // Red while the role is not available, green while it is.
    expect(box).toHaveAttribute("data-state", state);
  },
);

const headingsOf = (dialog: HTMLElement) =>
  [...dialog.querySelectorAll(".ww-info__heading")].map((heading) => heading.textContent);

it.each([
  ["en", "Info about Hunter", ["Tasks", "Options"], "Duty to shoot"],
  ["de", "Info zu Jäger", ["Aufgaben", "Optionen"], "Schusspflicht"],
] as const)(
  "explains a role in parts: general, tasks, options (%s)",
  async (language, label, headings, option) => {
    const { user } = await renderConfiguration(language, 9);
    await user.click(screen.getByRole("button", { name: label }));
    const dialog = await screen.findByRole("dialog");
    // In this order, and only the parts the role has (the hunter has no special notes).
    expect(headingsOf(dialog)).toEqual(headings);
    // Every option is explained on its own line with its name in bold.
    const names = [...dialog.querySelectorAll(".kit-info-list strong")].map((n) => n.textContent);
    expect(names).toHaveLength(2);
    expect(names[0]).toBe(option);
  },
);

it("has a part of special notes only for a role that has some", async () => {
  const { user } = await renderConfiguration("en", 9);
  await user.click(screen.getByRole("button", { name: "Info about Witch" }));
  const dialog = await screen.findByRole("dialog");
  expect(headingsOf(dialog)).toEqual(["Tasks", "Special notes"]);
});

it("shows only the box of the players in the window of an extra", async () => {
  const { user } = await renderConfiguration("en", 12);
  await user.click(screen.getByRole("button", { name: "Info about Drunk" }));
  const dialog = await screen.findByRole("dialog");
  expect(dialog.querySelectorAll(".ww-available")).toHaveLength(1);
  expect(dialog.querySelector(".ww-available")).toHaveTextContent("From 9 players");
});

it.each([
  ["en", "Info about Protective amulet", /drawn randomly/, /pass it/, /can still die/],
  ["de", "Info zu Schutzamulett", /zufällig/, /weitergeben/, /kann trotzdem sterben/],
] as const)(
  "explains the amulet in general, tasks and special cases (%s)",
  async (language, label, general, task, note) => {
    const { user } = await renderConfiguration(language, 12);
    await user.click(screen.getByRole("button", { name: label }));
    const dialog = await screen.findByRole("dialog");
    const parts = [...dialog.querySelectorAll(".ww-info__part")];
    expect(parts).toHaveLength(3);
    expect(parts[0]).toHaveTextContent(general);
    expect(parts[1]).toHaveTextContent(task);
    expect(parts[2]).toHaveTextContent(note);
    // The reasons the amulet is lost stand as single points below the introduction.
    expect(parts[2]?.querySelectorAll("li")).toHaveLength(6);
  },
);

it.each([
  [9, ["ok", "locked"]],
  [12, ["ok", "ok"]],
] as const)(
  "shows a second box for the hammer in the window of the mayor (%s players)",
  async (players, states) => {
    const { user } = await renderConfiguration("en", players);
    await user.click(screen.getByRole("button", { name: "Info about Mayor" }));
    const dialog = await screen.findByRole("dialog");
    const boxes = [...dialog.querySelectorAll(".ww-available")];
    expect(boxes.map((box) => box.textContent)).toEqual([
      "From 9 players",
      "Hammer from 10 players",
    ]);
    expect(boxes.map((box) => box.getAttribute("data-state"))).toEqual(states);
  },
);

it.each([
  ["en", 21, /Too many players: at most 20 \(now 21\)/],
  ["de", 21, /Zu viele Spieler: höchstens 20 \(bisher 21\)/],
  ["en", 5, /Add at least 6 players first \(now 5\)/],
  ["de", 4, /Füge zuerst mindestens 6 Spieler hinzu \(bisher 4\)/],
] as const)(
  "tells what is wrong with the number of players (%s, %s)",
  async (language, players, text) => {
    await renderConfiguration(language, players);
    expect(screen.getByText(text)).toBeInTheDocument();
  },
);

it.each([
  ["en", "Info about Hunter", "Village role"],
  ["en", "Info about Werewolves", "Enemy of the village"],
  ["en", "Info about Tanner", "Village role with a goal of its own"],
  ["en", "Info about Drunk", "Extra"],
  ["en", "Info about Magician", "Village role"],
  ["en", "Info about Witch", "Village role"],
  ["de", "Info zu Jäger", "Dorfrolle"],
  ["de", "Info zu Werwölfe", "Gegner des Dorfes"],
  ["de", "Info zu Gerber", "Dorfrolle mit eigenem Ziel"],
  ["de", "Info zu Magier", "Dorfrolle"],
] as const)("names the side right under the role (%s: %s)", async (language, label, team) => {
  const { user } = await renderConfiguration(language, 12);
  await user.click(screen.getByRole("button", { name: label }));
  const dialog = await screen.findByRole("dialog");
  expect(dialog.querySelector(".dialog__subtitle")).toHaveTextContent(team);
});

it.each([
  ["en", "Magician", "Witch", "(not together with Witch)"],
  ["en", "Witch", "Magician", "(not together with Magician)"],
  ["de", "Magier", "Hexe", "(nicht zusammen mit Hexe)"],
  ["de", "Hexe", "Magier", "(nicht zusammen mit Magier)"],
] as const)(
  "says in the button of the %s that it does not play with the %s, but only while that is so",
  async (language, name, other, note) => {
    const { user } = await renderConfiguration(language, 12);
    const box = () => screen.getByRole("checkbox", { name }).closest("label");
    // Nothing chosen: the role is free, so there is nothing to warn about.
    expect(box()).not.toHaveTextContent(/\(.*\)/);
    await user.click(screen.getByRole("checkbox", { name: other }));
    // The other one is chosen and keeps this one out.
    expect(box()).toHaveTextContent(note);
    await user.click(screen.getByRole("checkbox", { name: other }));
    expect(box()).not.toHaveTextContent(/\(.*\)/);
  },
);

it("opens the window of a card with its name, like the button does", async () => {
  const { user } = await renderConfiguration("en", 12);
  await user.click(screen.getByRole("button", { name: "Seer" }));
  const dialog = await screen.findByRole("dialog");
  expect(dialog).toHaveTextContent("Village role");
});

const wakeSteps = (dialog: HTMLElement) =>
  [...dialog.querySelectorAll(".ww-wake__step")].map((step) => ({
    inGame: step.getAttribute("data-in-game") === "true",
    text: step.textContent ?? "",
  }));

it.each([
  ["en", "Wake-up order", "Werewolves", "Seer", "not in the game"],
  ["de", "Aufwachreihenfolge", "Werwölfe", "Seherin", "nicht im Spiel"],
] as const)(
  "shows the order in which the roles wake up in a window (%s)",
  async (language, label, wolves, seer, notIn) => {
    const { user } = await renderConfiguration(language, 12);
    await user.click(screen.getByRole("button", { name: label }));
    const dialog = await screen.findByRole("dialog", { name: label });
    const steps = wakeSteps(dialog);
    // Without further roles only the wolves and the seer take part, numbered 1 and 2.
    expect(steps.filter((step) => step.inGame).map((step) => step.text)).toEqual([
      expect.stringContaining(wolves),
      expect.stringContaining(seer),
    ]);
    expect(steps[steps.length - 1]?.text).toContain(notIn);
    expect(
      dialog.querySelector(".ww-wake__step[data-in-game='true'] .ww-wake__number"),
    ).toHaveTextContent("1");
  },
);

it("numbers the chosen roles in the order of the night", async () => {
  const { user } = await renderConfiguration("en", 12);
  await user.click(screen.getByRole("checkbox", { name: "Witch" }));
  await user.click(screen.getByRole("checkbox", { name: "Cupid" }));
  await user.click(screen.getByRole("button", { name: "Wake-up order" }));
  const dialog = await screen.findByRole("dialog", { name: "Wake-up order" });
  const names = [...dialog.querySelectorAll(".ww-wake__step[data-in-game='true'] strong")].map(
    (name) => name.textContent,
  );
  expect(names).toEqual(["Cupid", "Werewolves", "Seer", "Witch"]);
});

it.each([
  ["en", "Tough guy", "Every attack", "Wolf attack only"],
  ["de", "Harter Bursche", "Jeder Angriff", "Nur Wolfsangriff"],
] as const)(
  "offers the tough guy with two options and takes the one that is tapped (%s)",
  async (language, role, every, wolves) => {
    const { latest, user } = await renderConfiguration(language, 12);
    const half = (option: string) => screen.getByRole("checkbox", { name: `${role}, ${option}` });
    expect(half(wolves)).not.toBeChecked();
    await user.click(half(every));
    expect(half(every)).toBeChecked();
    expect(latest.draft.roles).toContain("toughGuy");
    expect(latest.draft.settings.toughGuy).toBe("anyAttack");
    // A tap on the other half changes the option, a tap on the chosen one leaves the role out.
    await user.click(half(wolves));
    expect(latest.draft.settings.toughGuy).toBe("wolfOnly");
    await user.click(half(wolves));
    expect(latest.draft.roles).not.toContain("toughGuy");
  },
);

it("explains both options of the tough guy in its window", async () => {
  const { user } = await renderConfiguration("en", 12);
  await user.click(screen.getByRole("button", { name: "Info about Tough guy" }));
  const dialog = await screen.findByRole("dialog");
  const names = [...dialog.querySelectorAll(".kit-info-list strong")].map((n) => n.textContent);
  expect(names).toEqual(["Wolf attack only", "Every attack"]);
});
