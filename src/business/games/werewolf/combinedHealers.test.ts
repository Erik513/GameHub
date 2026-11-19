import { describe, expect, it } from "vitest";
import {
  createWerewolf,
  transitionWerewolf,
  werewolfAnnouncement,
  type WerewolfEvent,
} from "./stateMachine";

describe.each([
  [14, 4],
  [15, 4],
  [16, 4],
  [17, 4],
  [17, 5],
  [18, 4],
  [18, 5],
  [19, 4],
  [19, 5],
  [20, 4],
  [20, 5],
])("combined healers at %i players with %i wolves", (players, wolfCount) => {
  it("retains witch poison when the magician casts later that night", () => {
    const seats = Array.from({ length: players }, (_, i) => "Player " + (i + 1));
    const game = createWerewolf(seats.join(","), "Narrator", () => 0.99, ["witch", "magician"], {
      wolfCount,
    })!;
    const events: WerewolfEvent[] = [
      ...seats.map((player) => ({ type: "roleSeen", player }) as const),
      { type: "wolvesReady", night: 1 },
      { type: "inspect", night: 1, target: "Player 1" },
      { type: "closeVision", night: 1 },
      { type: "potions", night: 1, heal: false, poison: "Player 8" },
    ];
    const magician = events.reduce(transitionWerewolf, game);
    expect(magician).toMatchObject({ status: "magician", victim: null });
    expect(
      transitionWerewolf(magician, { type: "castSpells", night: 1, heal: true, kill: [] }),
    ).toBe(magician);
    const morning = transitionWerewolf(magician, {
      type: "castSpells",
      night: 1,
      heal: false,
      kill: ["Player 9"],
    });
    expect(
      werewolfAnnouncement(morning)
        .map(({ name }) => name)
        .sort(),
    ).toEqual(["Player 8", "Player 9"]);
  });

  it("passes the wolf victim to the magician only if the witch has not healed it", () => {
    const seats = Array.from({ length: players }, (_, i) => "Player " + (i + 1));
    const game = createWerewolf(seats.join(","), "Narrator", () => 0.99, ["witch", "magician"], {
      attackOnFirstNight: true,
      wolfCount,
    })!;
    const events: WerewolfEvent[] = [
      ...seats.map((player) => ({ type: "roleSeen", player }) as const),
      { type: "attack", night: 1, target: "Player 8" },
      { type: "inspect", night: 1, target: "Player 1" },
      { type: "closeVision", night: 1 },
    ];
    const witch = events.reduce(transitionWerewolf, game);
    expect(
      transitionWerewolf(witch, { type: "potions", night: 1, heal: true, poison: null }),
    ).toMatchObject({ status: "magician", victim: null });
    const magician = transitionWerewolf(witch, {
      type: "potions",
      night: 1,
      heal: false,
      poison: null,
    });
    expect(magician).toMatchObject({ status: "magician", victim: { name: "Player 8" } });
    const morning = transitionWerewolf(magician, {
      type: "castSpells",
      night: 1,
      heal: true,
      kill: [],
    });
    expect(werewolfAnnouncement(morning)).toEqual([]);
  });
});
