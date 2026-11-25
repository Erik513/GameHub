import { render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { expect, it } from "vitest";
import { createGuide, describeGuide } from "../../business/games/werewolf/narratorGuide";
import { createWerewolfSession } from "../../business/games/werewolf/session";
import { createWerewolf, type WerewolfState } from "../../business/games/werewolf/stateMachine";
import { createGameHubI18n } from "../../i18n";
import { PlainBox } from "./GuidePlainBox";
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
  const attacked = await show({ ...state, wolfTarget: person });
  const saved = attacked.find(
    (entry) => entry.querySelector("strong")?.textContent === person.name,
  )!;
  expect(
    [...saved.querySelectorAll(".ww-overview__slot")].map((slot) =>
      slot.getAttribute("data-effect"),
    ),
  ).toEqual(["attacked", "protectedSaved", "guestSaved"]);
  const legend = document.querySelector(".ww-overview__legend")!.textContent;
  expect(legend).toContain("Protected");
  expect(legend).toContain("Guest");
});

it("names the winners in the headings of the end screen, in both languages", async () => {
  for (const [language, winners, losers] of [
    ["en", "Winners", "Losers"],
    ["de", "Gewinner", "Verlierer"],
  ] as const) {
    document.body.innerHTML = "";
    const i18n = await createGameHubI18n(language);
    const state = { ...game(), status: "finished", winner: "wolves" } as unknown as WerewolfState;
    const view = describeGuide(createGuide(createWerewolfSession(state)));
    render(
      <I18nextProvider i18n={i18n}>
        <PlainBox view={view} />
      </I18nextProvider>,
    );
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
      <PlainBox view={describeGuide(createGuide(createWerewolfSession(state)))} />
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

it("explains only the backgrounds and frames this game can have", async () => {
  // A game without the tough guy, the amulet and the drunk and without anything that can save.
  const plain = createWerewolf(names, "Max", () => 0.3, [], { wolfCount: 2 })!;
  await show(plain);
  const legend = () => document.querySelector(".ww-overview__legend")!.textContent;
  expect(legend()).not.toContain("Wounded");
  expect(legend()).not.toContain("Saved tonight");
  expect(legend()).not.toContain("Amulet");
  expect(document.querySelectorAll(".ww-overview__swatch[data-frame]")).toHaveLength(0);
  expect(legend()).toContain("Alive");
  expect(legend()).toContain("Dead");
  // With the tough guy and the drunk: wounded and the frame of the drunk are explained.
  document.body.innerHTML = "";
  await show(game());
  expect(legend()).toContain("Wounded");
  expect(document.querySelector('.ww-overview__swatch[data-frame="drunk"]')).not.toBeNull();
});

it("explains the colors and frames in both languages", async () => {
  // The amulet can save: the legend explains the saved row.
  const state = createWerewolf(names, "Max", () => 0.3, ["toughGuy"], {
    amulet: true,
    wolfCount: 2,
  })!;
  await show(state, "en");
  expect(document.querySelector(".ww-overview__legend")?.textContent).toContain("Saved tonight");
  document.body.innerHTML = "";
  await show(state, "de");
  expect(document.querySelector(".ww-overview__legend")?.textContent).toContain(
    "In dieser Nacht gerettet",
  );
});
