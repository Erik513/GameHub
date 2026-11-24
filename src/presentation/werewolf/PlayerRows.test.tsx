import { render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { expect, it } from "vitest";
import { createWerewolf, type WerewolfState } from "../../business/games/werewolf/stateMachine";
import { createGameHubI18n } from "../../i18n";
import { PlayerRows } from "./PlayerRows";

/** The rows of all players: the color says the state, a frame says the amulet or the drunk, the order puts the dead last. */

const names = Array.from({ length: 12 }, (_, index) => "P" + index).join(",");

async function show(
  state: WerewolfState,
  order: "name" | "aliveFirst" = "name",
  language: "en" | "de" = "en",
) {
  const i18n = await createGameHubI18n(language);
  const { container } = render(
    <I18nextProvider i18n={i18n}>
      <PlayerRows order={order} state={state} />
    </I18nextProvider>,
  );
  return [...container.querySelectorAll<HTMLElement>(".ww-overview__row")];
}

const game = () =>
  createWerewolf(names, "Max", () => 0.3, ["toughGuy"], { drunk: true, wolfCount: 2 })!;

it("puts the living first and the dead last at the end of the game, each part by name", async () => {
  const state = game();
  const dead = state.alive.slice(0, 3).map((player) => player.name);
  const rows = await show({ ...state, alive: state.alive.slice(3) }, "aliveFirst");
  const order = rows.map((row) => row.querySelector("strong")?.textContent);
  const tones = rows.map((row) => row.dataset.tone);
  expect(tones.slice(-3)).toEqual(["dead", "dead", "dead"]);
  expect(tones.slice(0, -3)).not.toContain("dead");
  expect(order.slice(-3)).toEqual([...dead].sort((one, other) => one.localeCompare(other)));
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

it("explains the colors and frames in both languages", async () => {
  const state = game();
  await show(state, "name", "en");
  expect(document.querySelector(".ww-overview__legend")?.textContent).toContain("Saved tonight");
  document.body.innerHTML = "";
  await show(state, "name", "de");
  expect(document.querySelector(".ww-overview__legend")?.textContent).toContain(
    "In dieser Nacht gerettet",
  );
});
