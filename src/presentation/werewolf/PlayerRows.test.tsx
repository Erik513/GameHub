import { fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { afterEach, beforeEach, expect, it } from "vitest";
import {
  createWerewolf,
  transitionWerewolf,
  type WerewolfState,
} from "../../business/games/werewolf/stateMachine";
import { createGameHubI18n } from "../../i18n";
import { WinnerList } from "./GuidePlainBox";
import { WerewolfEndScreen } from "./WerewolfEndScreen";
import { PlayerRows } from "./PlayerRows";

/** The rows of all players: the color says the state, a frame says the amulet or the drunk. */

const names = Array.from({ length: 12 }, (_, index) => "P" + index).join(",");

async function show(state: WerewolfState, language: "en" | "de" = "en", announce = true) {
  const i18n = await createGameHubI18n(language);
  const { container } = render(
    <I18nextProvider i18n={i18n}>
      <PlayerRows announce={announce} state={state} />
    </I18nextProvider>,
  );
  return [...container.querySelectorAll<HTMLElement>(".ww-overview__row")];
}

const game = () =>
  createWerewolf(names, "Max", () => 0.3, ["toughGuy"], { drunk: true, wolfCount: 2 })!;

/** The width of the window: the PC shows the whole legend, a phone folds it below the list. */
function setDesktop(desktop: boolean) {
  window.matchMedia = ((query: string) => ({
    addEventListener: () => undefined,
    matches: desktop,
    media: query,
    removeEventListener: () => undefined,
  })) as unknown as typeof window.matchMedia;
}

const originalMatchMedia = Object.getOwnPropertyDescriptor(window, "matchMedia");
// The tests of the contents of the legend look at it the way the PC shows it: always open.
beforeEach(() => setDesktop(true));
afterEach(() => {
  if (originalMatchMedia) Object.defineProperty(window, "matchMedia", originalMatchMedia);
  else Reflect.deleteProperty(window, "matchMedia");
});

it("folds the legend below the list on a phone and opens it with a tap, in both languages", async () => {
  for (const [language, title] of [
    ["en", "Legend"],
    ["de", "Legende"],
  ] as const) {
    document.body.innerHTML = "";
    setDesktop(false);
    const i18n = await createGameHubI18n(language);
    render(
      <I18nextProvider i18n={i18n}>
        <PlayerRows state={game()} />
      </I18nextProvider>,
    );
    const legend = screen.getByRole("group", { name: title });
    const toggle = screen.getByRole("button", { name: title });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(legend.querySelector(".ww-overview__legend-group")).toBeNull();
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(legend.querySelector(".ww-overview__legend-group")).not.toBeNull();
    fireEvent.click(toggle);
    expect(legend.querySelector(".ww-overview__legend-group")).toBeNull();
  }
});

it("shows the whole legend on the PC without a button to fold it", async () => {
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <PlayerRows state={game()} />
    </I18nextProvider>,
  );
  expect(screen.queryByRole("button", { name: "Legend" })).toBeNull();
  expect(
    screen.getByRole("group", { name: "Legend" }).querySelector(".ww-overview__legend-group"),
  ).not.toBeNull();
});

it("gives the drunk who does not know his role the green frame and shows his true role", async () => {
  const state = game();
  const drunk = state.drunk!.player;
  const rows = await show(state);
  const row = rows.find((entry) => entry.querySelector("strong")?.textContent === drunk)!;
  expect(row).toHaveAttribute("data-drunk");
  // The true role stands there, never the drunk.
  const role = state.players.find((player) => player.name === drunk)!.role;
  expect(row.querySelector("small")?.textContent?.length).toBeGreaterThan(0);
  expect(role).not.toBe("drunk");
  expect(rows.filter((entry) => entry.hasAttribute("data-drunk"))).toHaveLength(1);
});

it("shows the variant of a role as a small sign next to the role, with its short text in the legend", async () => {
  const rows = await show(game());
  const withVariant = rows.filter((row) => row.querySelector(".ww-variant"));
  // Only the tough guy has an option in this game.
  expect(withVariant).toHaveLength(1);
  const mark = withVariant[0]!.querySelector(".ww-variant")!;
  expect(mark).toHaveAttribute("aria-label", "Wolf only");
  // The legend names the variant too, once, without a second label.
  const legend = document.querySelector(".ww-overview__legend")!;
  expect(legend.textContent).toContain("Wolf only");
  expect(legend.querySelectorAll(".ww-variant")).toHaveLength(1);
  expect(legend.querySelector(".ww-variant")).not.toHaveAttribute("aria-label");
});

it("shows the attack of the night as a slot in the morning (not a second time as the cause), and names it in the legend", async () => {
  const base = game();
  const victim = base.players.find((player) => player.role === "villager")!;
  const state = {
    ...base,
    poisoned: null,
    status: "morning",
    victim,
    wolfTarget: victim,
  } as unknown as WerewolfState;
  // The preview of a decision: the victim is marked, not announced.
  const rows = await show(state, "en", false);
  const row = rows.find((entry) => entry.querySelector("strong")?.textContent === victim.name)!;
  // Until the announcement is confirmed the morning still shows the slots of the night.
  expect(row.querySelector('.ww-overview__slot[data-effect="attacked"]')).not.toBeNull();
  expect(row.querySelector('[aria-label="Werewolf attack"]')).toBeNull();
  expect(document.querySelector(".ww-overview__legend")?.textContent).toContain("Attacked");
});

it("shows every state of a person as the same colored slot as on the card, and names it in the legend", async () => {
  const base = game();
  const person = base.players.find((player) => player.role === "villager")!;
  // The night: the bodyguard protects him and the night guest sleeps at his place.
  const state = {
    ...base,
    hostNight: base.night,
    hostPlayer: person.name,
    protectedNight: base.night,
    protectedPlayer: person.name,
  } as WerewolfState;
  const rows = await show(state);
  const row = rows.find((entry) => entry.querySelector("strong")?.textContent === person.name)!;
  const slots = [...row.querySelectorAll(".ww-overview__slot")].map((slot) =>
    slot.getAttribute("data-effect"),
  );
  expect(slots).toEqual(["protected", "guest"]);
  // The wolves attack him: both protections saved him, so the slots turn dark green.
  const attacked = await show({ ...state, wolfChoice: person.name, wolfTarget: person });
  const saved = attacked.find(
    (entry) => entry.querySelector("strong")?.textContent === person.name,
  )!;
  expect(
    [...saved.querySelectorAll(".ww-overview__slot")].map((slot) =>
      slot.getAttribute("data-effect"),
    ),
  ).toEqual(["protectedSaved", "guestSaved", "attacked"]);
  const legend = document.querySelector(".ww-overview__legend")!.textContent;
  expect(legend).toContain("Protected");
  expect(legend).toContain("Guest");
});

it("names the winners and the losers with their side in the headings of the end, without a block of the winner, in both languages", async () => {
  for (const [language, title, winners, losers] of [
    ["en", "Game over", "Winners – Werewolves", "Losers – Villagers"],
    ["de", "Spielende", "Gewinner – Werwölfe", "Verlierer – Dorfbewohner"],
  ] as const) {
    document.body.innerHTML = "";
    const i18n = await createGameHubI18n(language);
    const state = { ...game(), status: "finished", winner: "wolves" } as unknown as WerewolfState;
    render(
      <I18nextProvider i18n={i18n}>
        <WerewolfEndScreen
          canGoBack
          onBack={() => undefined}
          onNewGame={() => undefined}
          state={state}
        />
      </I18nextProvider>,
    );
    expect(screen.getByRole("region", { name: title })).toBeInTheDocument();
    // The side stands in the heading of the green box of the winners, not in a block of its own.
    expect(document.querySelector(".kit-winner")).toBeNull();
    // Back and new game stand side by side in one row.
    expect(document.querySelectorAll(".kit-start-bar .kit-action-row .button")).toHaveLength(2);
    const headings = [...document.querySelectorAll(".ww-winners__group h4")].map((heading) =>
      heading.textContent?.trim(),
    );
    expect(headings).toEqual([winners, losers]);
  }
});

it("puts several groups of winners one below the other in the one box of the winners, divided by a line", async () => {
  const i18n = await createGameHubI18n("en");
  const base = game();
  const pair = base.players.filter((player) => player.role !== "wolf");
  const state = {
    ...base,
    // The tanner has won on his own: a second group of winners next to the werewolves.
    tannerWinner: pair[0]!.name,
    status: "finished",
    winner: "wolves",
  } as unknown as WerewolfState;
  render(
    <I18nextProvider i18n={i18n}>
      <WinnerList state={state} />
    </I18nextProvider>,
  );
  const box = document.querySelector('.ww-winners__group[data-kind="winners"]')!;
  // The wolves and the tanner: two lists in the same box, one line between them, one heading above.
  expect(box.querySelectorAll("ul.ww-overview")).toHaveLength(2);
  expect(box.querySelectorAll(".ww-winners__divider")).toHaveLength(1);
  expect(box.querySelectorAll("h4")).toHaveLength(1);
});

it("divides the legend into groups with a heading each, and leaves out an empty group", async () => {
  await show(game());
  const titles = [...document.querySelectorAll(".ww-overview__legend-title")].map(
    (title) => title.textContent,
  );
  // At the start nobody died: no group for the causes (the drunk already carries his state).
  expect(titles).toEqual(["Row background", "Row frame", "States", "Role variants"]);
});

it("explains only the backgrounds and frames the rows show now", async () => {
  // A game without the tough guy, the amulet and the drunk, before the first night: nobody is wounded, saved or dead.
  const plain = createWerewolf(names, "Max", () => 0.3, [], { wolfCount: 2 })!;
  await show(plain);
  const tones = () =>
    [...document.querySelectorAll(".ww-overview__legend [data-tone]")].map((swatch) =>
      swatch.getAttribute("data-tone"),
    );
  expect(tones()).toEqual(["alive", "wolf"]);
  expect(document.querySelectorAll(".ww-overview__legend [data-frame]")).toHaveLength(0);
  // With the drunk who does not know his role yet: his frame is explained.
  document.body.innerHTML = "";
  await show(game());
  expect(document.querySelector('.ww-overview__legend [data-frame="drunk"]')).not.toBeNull();
});

it("explains the colors and frames in both languages", async () => {
  // A living person and the holder of the amulet: the background and the frame they show are explained.
  const state = createWerewolf(names, "Max", () => 0.3, ["toughGuy"], {
    amulet: true,
    wolfCount: 2,
  })!;
  for (const [language, alive, amulet] of [
    ["en", "Alive", "Amulet"],
    ["de", "Lebt", "Amulett"],
  ] as const) {
    document.body.innerHTML = "";
    await show(state, language);
    const legend = document.querySelector(".ww-overview__legend")?.textContent;
    expect(legend).toContain(alive);
    expect(legend).toContain(amulet);
  }
});

it("puts the gravestone of a person who is out at the very right, with the cause of death right next to it", async () => {
  const base = game();
  const victim = base.players.find((player) => player.role === "villager")!;
  const state = {
    ...base,
    poisoned: null,
    status: "morning",
    victim,
    wolfTarget: victim,
  } as unknown as WerewolfState;
  const rows = await show(state);
  const row = rows.find((entry) => entry.querySelector("strong")?.textContent === victim.name)!;
  // The line fills from the right: its first sign stands at the very right.
  const marks = [...row.querySelector(".ww-overview__marks")!.children];
  expect(row).toHaveAttribute("data-tone", "dead");
  expect(marks[0]).toHaveAttribute("aria-label", "Dead");
  expect(marks[1]).toHaveAttribute("data-effect", "attacked");
});

it("explains a slot that names a cause of death with the causes only, not a second time with the states", async () => {
  const base = game();
  const victim = base.players.find((player) => player.role === "villager")!;
  const state = {
    ...base,
    poisoned: null,
    status: "morning",
    victim,
    wolfTarget: victim,
  } as unknown as WerewolfState;
  await show(state);
  const legend = document.querySelector(".ww-overview__legend")!;
  // The attack stands next to the gravestone, so the legend names it once, as the cause.
  expect(legend.querySelectorAll('[data-effect="attacked"]')).toHaveLength(1);
});

it("shows the vote of the village as a yellow slot next to the gravestone", async () => {
  const base = game();
  const victim = base.players.find((player) => player.role === "villager")!;
  const state = { ...base, status: "exile", victim } as unknown as WerewolfState;
  const rows = await show(state);
  const row = rows.find((entry) => entry.querySelector("strong")?.textContent === victim.name)!;
  const marks = [...row.querySelector(".ww-overview__marks")!.children];
  expect(marks[0]).toHaveAttribute("aria-label", "Dead");
  expect(marks[1]).toHaveAttribute("data-cause", "vote");
  expect((marks[1] as HTMLElement).style.getPropertyValue("--slot-bg")).toBe(
    "var(--slot-hammered)",
  );
});

it("gives the tanner who wins with his death a gold trophy right next to the gravestone", async () => {
  const base = createWerewolf(names, "Max", () => 0.3, ["tanner"], { wolfCount: 2 })!;
  const tanner = base.players.find((player) => player.role === "tanner")!;
  const state = {
    ...base,
    poisoned: null,
    status: "morning",
    victim: tanner,
    wolfTarget: tanner,
  } as unknown as WerewolfState;
  const rows = await show(state);
  const row = rows.find((entry) => entry.querySelector("strong")?.textContent === tanner.name)!;
  const marks = [...row.querySelector(".ww-overview__marks")!.children];
  expect(marks[0]).toHaveAttribute("aria-label", "Dead");
  expect(marks[1]).toHaveAttribute("data-won", "tanner");
  expect(marks[2]).toHaveAttribute("data-effect", "attacked");
  expect(document.querySelector(".ww-overview__legend")?.textContent).toContain("Tanner has won");
});

it("explains at the end of the game only the backgrounds and frames the rows of the end show", async () => {
  const i18n = await createGameHubI18n("en");
  // Nobody died: the end shows living villagers and werewolves and the drunk, nothing else.
  const state = { ...game(), status: "finished", winner: "wolves" } as unknown as WerewolfState;
  render(
    <I18nextProvider i18n={i18n}>
      <WinnerList state={state} />
    </I18nextProvider>,
  );
  const legend = document.querySelector(".ww-winners .ww-overview__legend")!;
  const tones = [...legend.querySelectorAll("[data-tone]")].map((swatch) =>
    swatch.getAttribute("data-tone"),
  );
  expect(tones).toEqual(["alive", "wolf"]);
  expect(
    [...legend.querySelectorAll("[data-frame]")].map((swatch) => swatch.getAttribute("data-frame")),
  ).toEqual(["drunk"]);
});

it("shows the cause of death in its color at the end of the game, too", async () => {
  const i18n = await createGameHubI18n("en");
  const base = game();
  const victim = base.players.find((player) => player.role === "villager")!;
  const exile = { ...base, status: "exile", victim } as unknown as WerewolfState;
  const after = transitionWerewolf(exile, { night: base.night, type: "announceExile" });
  const state = { ...after, status: "finished", winner: "wolves" } as unknown as WerewolfState;
  render(
    <I18nextProvider i18n={i18n}>
      <WinnerList state={state} />
    </I18nextProvider>,
  );
  const row = [...document.querySelectorAll<HTMLElement>(".ww-winners .ww-overview__row")].find(
    (entry) => entry.querySelector("strong")?.textContent === victim.name,
  )!;
  const marks = [...row.querySelector(".ww-overview__marks")!.children];
  expect(marks[0]).toHaveAttribute("aria-label", "Dead");
  expect(marks[1]).toHaveAttribute("data-cause", "vote");
  // The legend explains the vote with the same slot.
  expect(
    document.querySelector('.ww-winners .ww-overview__legend [data-cause="vote"]'),
  ).not.toBeNull();
});

it("shows the tough guy who survives the attack as wounded in the morning, before the announcement is confirmed", async () => {
  const base = game();
  const toughGuy = base.players.find((player) => player.role === "toughGuy")!;
  const state = {
    ...base,
    poisoned: null,
    status: "morning",
    victim: toughGuy,
    wolfTarget: toughGuy,
  } as unknown as WerewolfState;
  const rows = await show(state);
  const row = rows.find((entry) => entry.querySelector("strong")?.textContent === toughGuy.name)!;
  // Nobody dies this morning: the tough guy is dark red (wounded, dies later) with the slot of his wound.
  expect(row).toHaveAttribute("data-tone", "wounded");
  expect(row.querySelector('.ww-overview__slot[data-effect="wounded"]')).not.toBeNull();
});

it("keeps the frame of the amulet on the row of the person who died with it", async () => {
  const base = createWerewolf(names, "Max", () => 0.3, [], { amulet: true, wolfCount: 2 })!;
  const holder = base.players.find((player) => player.name === base.amulet!.holder)!;
  const morning = {
    ...base,
    poisoned: null,
    status: "morning",
    victim: holder,
    wolfTarget: holder,
  } as unknown as WerewolfState;
  // The morning is confirmed: the holder is out, the amulet is lost.
  const after = transitionWerewolf(morning, { night: morning.night, type: "announceMorning" });
  expect(after.amulet).toBeNull();
  const rows = await show(after);
  const row = rows.find((entry) => entry.querySelector("strong")?.textContent === holder.name)!;
  expect(row).toHaveAttribute("data-tone", "dead");
  expect(row).toHaveAttribute("data-amulet", "true");
  expect(document.querySelector(".ww-overview__legend")?.textContent).toContain(
    "Amulet (when dead: died with it)",
  );
});
