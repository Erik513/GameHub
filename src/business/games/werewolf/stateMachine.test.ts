import { expect, it } from "vitest";
import {
  createWerewolf,
  currentWerewolfRole,
  getWerewolfWinner,
  transitionWerewolf,
  wakingPlayers,
} from "./stateMachine";
import { allVoteFor } from "./voteTesting";

const names = ["Ada", "Bea", "Cam", "Dan", "Eva", "Flo"];
function start(attackOnFirstNight?: boolean) {
  const settings = attackOnFirstNight === undefined ? {} : { attackOnFirstNight };
  const initial = createWerewolf(names.join(","), "Narrator", () => 0.99, [], settings)!;
  return names.reduce(
    (state, player) => transitionWerewolf(state, { type: "roleSeen", player }),
    initial,
  );
}

it("resolves the first wolf attack when the experimental setting is enabled", () => {
  let state = start(true);
  expect(wakingPlayers(state)).toEqual(["Ada"]);
  expect(transitionWerewolf(state, { type: "wolvesReady", night: 1 })).toBe(state);
  expect(transitionWerewolf(state, { type: "attack", night: 1, target: "Ada" })).toBe(state);
  state = transitionWerewolf(state, { type: "attack", night: 1, target: "Cam" });
  expect(state).toMatchObject({ status: "seer", victim: { name: "Cam" } });
  state = transitionWerewolf(state, { type: "inspect", night: 1, target: "Ada" });
  state = transitionWerewolf(state, { type: "closeVision", night: 1 });
  state = transitionWerewolf(state, { type: "announceMorning", night: 1 });
  expect(state.alive.map((player) => player.name)).toEqual(["Ada", "Bea", "Dan", "Eva", "Flo"]);
});

it("protects the first night and exiles the person with the most votes", () => {
  let state = start();
  expect(transitionWerewolf(state, { type: "attack", night: 1, target: "Cam" })).toBe(state);
  state = transitionWerewolf(state, { type: "wolvesReady", night: 1 });
  state = transitionWerewolf(state, { type: "inspect", night: 1, target: "Ada" });
  expect(state).toMatchObject({ status: "vision", isWolf: true });
  state = transitionWerewolf(state, { type: "closeVision", night: 1 });
  state = transitionWerewolf(state, { type: "announceMorning", night: 1 });
  // Two people are named; the one with the most votes leaves the game (the wolf Ada: Cam, Dan, Flo and Bea against Eva and Ada).
  state = transitionWerewolf(state, { type: "nominate", night: 1, nominees: ["Ada", "Bea"] });
  expect(state).toMatchObject({ status: "vote", candidates: ["Ada", "Bea"], round: 1 });
  state = transitionWerewolf(state, {
    type: "vote",
    night: 1,
    nomination: 1,
    ballots: { Ada: "Bea", Bea: "Ada", Cam: "Ada", Dan: "Ada", Eva: "Bea", Flo: "Ada" },
  });
  expect(state.status).toBe("exile");
  expect(transitionWerewolf(state, { type: "announceExile", night: 1 })).toMatchObject({
    winner: "village",
  });
});

it("counts the seer as a villager at parity and reveals a later victim only in the morning", () => {
  let state = start();
  expect(getWerewolfWinner(state.alive.slice(0, 2))).toBe("wolves");
  state = transitionWerewolf(state, { type: "wolvesReady", night: 1 });
  state = transitionWerewolf(state, { type: "inspect", night: 1, target: "Ada" });
  state = transitionWerewolf(state, { type: "closeVision", night: 1 });
  state = transitionWerewolf(state, { type: "announceMorning", night: 1 });
  state = transitionWerewolf(state, { type: "endDay", night: 1 });
  state = transitionWerewolf(state, { type: "attack", night: 2, target: "Bea" });
  expect(state.alive).toHaveLength(6);
  state = transitionWerewolf(state, { type: "inspect", night: 2, target: "Ada" });
  state = transitionWerewolf(state, { type: "closeVision", night: 2 });
  expect(transitionWerewolf(state, { type: "announceMorning", night: 2 }).alive).toHaveLength(5);
});

it("keeps parity separate from nomination validation and skips an eliminated seer", () => {
  expect(createWerewolf(names.join(","), "ada", () => 0.99)).toBeNull();
  expect(createWerewolf("Ada", "Narrator", () => 0.99)).toBeNull();
  let state = start();
  state = transitionWerewolf(state, { type: "wolvesReady", night: 1 });
  expect(transitionWerewolf(state, { type: "inspect", night: 1, target: "Bea" })).toBe(state);
  state = transitionWerewolf(state, { type: "inspect", night: 1, target: "Cam" });
  expect(state).toMatchObject({ status: "vision", isWolf: false });
  state = transitionWerewolf(state, { type: "closeVision", night: 1 });
  state = transitionWerewolf(state, { type: "announceMorning", night: 1 });
  expect(transitionWerewolf(state, { type: "nominate", night: 1, nominees: [] })).toBe(state);
  expect(transitionWerewolf(state, { type: "nominate", night: 1, nominees: ["Bea", "Bea"] })).toBe(
    state,
  );
  state = transitionWerewolf(state, { type: "nominate", night: 1, nominees: ["Bea"] });
  // The ballots are not complete: Cam has not voted.
  const complete = allVoteFor(state, "Bea");
  expect(
    transitionWerewolf(state, { type: "vote", night: 1, nomination: 1, ballots: { Ada: "Bea" } }),
  ).toBe(state);
  state = transitionWerewolf(state, { type: "vote", night: 1, nomination: 1, ballots: complete });
  state = transitionWerewolf(state, { type: "announceExile", night: 1 });
  expect(transitionWerewolf(state, { type: "attack", night: 2, target: "Ada" })).toBe(state);
  state = transitionWerewolf(state, { type: "attack", night: 2, target: null });
  expect(state).toMatchObject({ status: "morning", victim: null });
});

it("validates role and phase access and applies the larger group role counts", () => {
  const bigger = Array.from({ length: 15 }, (_, index) => "P" + index);
  const deal = (size: number) =>
    createWerewolf(bigger.slice(0, size).join(","), "Narrator", () => 0.99)!;
  expect(deal(9).players.filter((player) => player.role === "wolf")).toHaveLength(2);
  expect(deal(12).players.filter((player) => player.role === "wolf")).toHaveLength(3);
  expect(createWerewolf(names.join(","), "", () => 0.99)).toBeNull();
  const initial = deal(6);
  expect(currentWerewolfRole(initial)).toMatchObject({ name: "P0", role: "wolf" });
  expect(wakingPlayers(initial)).toEqual([]);
  expect(transitionWerewolf(initial, { type: "roleSeen", player: "P1" })).toBe(initial);
  let state = start();
  expect(currentWerewolfRole(state)).toBeNull();
  expect(wakingPlayers(state)).toEqual(["Ada"]);
  expect(transitionWerewolf(state, { type: "wolvesReady", night: 2 })).toBe(state);
  state = transitionWerewolf(state, { type: "wolvesReady", night: 1 });
  expect(wakingPlayers(state)).toEqual(["Bea"]);
  expect(transitionWerewolf(state, { type: "closeVision", night: 1 })).toBe(state);
});

it("supports the approved eight-player wolf choices and first allows the drunk at nine seats", () => {
  const seats = [...names, "Gia", "Hugo"].join(",");
  const deal = (wolfCount: number, drunk = false) =>
    createWerewolf(seats, "Narrator", () => 0.99, [], { wolfCount, drunk });
  expect(deal(1)?.players.filter((player) => player.role === "wolf")).toHaveLength(1);
  expect(deal(2)?.players.filter((player) => player.role === "wolf")).toHaveLength(2);
  expect(deal(2, true)).toBeNull();
  expect(createWerewolf(seats, "Narrator", () => 0.99)?.settings.wolfCount).toBe(2);
  expect(deal(1, true)).toBeNull();
  expect(deal(3)).toBeNull();
  expect(deal(1.5)).toBeNull();
  expect(createWerewolf(names.join(","), "Narrator", () => 0.99, [], { wolfCount: 2 })).toBeNull();
  const nineSeats = seats + ",Ira";
  const nine = createWerewolf(nineSeats, "Narrator", () => 0.99, [], { wolfCount: 2, drunk: true });
  expect(nine?.players.filter((player) => player.role === "wolf")).toHaveLength(2);
  expect(nine?.drunk).not.toBeNull();
  expect(createWerewolf(nineSeats, "Narrator", () => 0.99, [], { wolfCount: 1 })).toBeNull();
});

it("ignores out-of-phase commands and rejects nominations and ballots without valid participants", () => {
  let state = start();
  expect(transitionWerewolf(state, { type: "endDay", night: 1 })).toBe(state);
  state = transitionWerewolf(state, { type: "wolvesReady", night: 1 });
  state = transitionWerewolf(state, { type: "inspect", night: 1, target: "Cam" });
  expect(transitionWerewolf(state, { type: "announceMorning", night: 1 })).toBe(state);
  state = transitionWerewolf(state, { type: "closeVision", night: 1 });
  expect(transitionWerewolf(state, { type: "endDay", night: 1 })).toBe(state);
  state = transitionWerewolf(state, { type: "announceMorning", night: 1 });
  const nominate = { type: "nominate", night: 1, nominees: ["Ada"] } as const;
  expect(transitionWerewolf(state, { ...nominate, nominees: ["Unknown"] })).toBe(state);
  expect(transitionWerewolf(state, { ...nominate, nominees: ["Ada", "Bea", "Cam", "Dan"] })).toBe(
    state,
  );
  state = transitionWerewolf(state, nominate);
  const ballots = allVoteFor(state, "Ada");
  expect(transitionWerewolf(state, { type: "vote", night: 1, nomination: 2, ballots })).toBe(state);
  expect(
    transitionWerewolf(state, {
      type: "vote",
      night: 1,
      nomination: 1,
      ballots: { ...ballots, Ada: "Ada" },
    }),
  ).toBe(state);
  expect(
    transitionWerewolf(state, {
      type: "vote",
      night: 1,
      nomination: 1,
      ballots: { ...ballots, Bea: "Cam" },
    }),
  ).toBe(state);
  state = transitionWerewolf(state, { type: "vote", night: 1, nomination: 1, ballots });
  expect(transitionWerewolf(state, { type: "endDay", night: 1 })).toBe(state);
  state = transitionWerewolf(state, { type: "announceExile", night: 1 });
  expect(transitionWerewolf(state, { type: "endDay", night: 1 })).toBe(state);
});
