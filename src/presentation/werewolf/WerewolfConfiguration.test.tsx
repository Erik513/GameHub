import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { I18nextProvider } from "react-i18next";
import { expect, it, vi } from "vitest";
import { emptyFixedDraft, type FixedDraft } from "../../business/games/werewolf/fixedConfiguration";
import { createGameHubI18n } from "../../i18n";
import { WerewolfConfiguration } from "./WerewolfConfiguration";

type Language = "de" | "en";

async function renderConfiguration(
  language: Language,
  players: number,
  start: FixedDraft = emptyFixedDraft,
  onDone: () => void = () => undefined,
) {
  const i18n = await createGameHubI18n(language);
  const latest: { draft: FixedDraft } = { draft: start };
  function Host() {
    const [draft, setDraft] = useState(start);
    latest.draft = draft;
    return (
      <WerewolfConfiguration draft={draft} onChange={setDraft} onDone={onDone} players={players} />
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
  await user.click(screen.getByRole("tab", { name: "Game rules" }));
  await user.click(screen.getByRole("radio", { name: "From night 1" }));
  await user.click(screen.getByRole("radio", { name: "Keep secret" }));
  expect(latest.draft.settings).toMatchObject({
    amulet: true,
    attackOnFirstNight: true,
    drunk: true,
    revealRoles: false,
  });
  await user.click(screen.getByRole("radio", { name: "From night 2" }));
  await user.click(screen.getByRole("radio", { name: "Reveal" }));
  expect(latest.draft.settings).toMatchObject({ attackOnFirstNight: false, revealRoles: true });
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
