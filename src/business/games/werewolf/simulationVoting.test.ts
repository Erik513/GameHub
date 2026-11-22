import { expect, it } from "vitest";
import { drawSimulationNominees, drawSimulationBallots } from "./simulationVoting";
import { votingPlayers } from "./selectors";
import { createWerewolf, transitionWerewolf, type WerewolfState } from "./stateMachine";
const names = Array.from({ length: 10 }, (_, i) => `P${i}`);
function vote(roles: Parameters<typeof createWerewolf>[3] = []) {
  const setup = createWerewolf(names.join(","), "Narrator", () => 0.99, roles)!;
  return transitionWerewolf(
    { ...setup, status: "day", nomination: 0 },
    { type: "nominate", night: 1, nominees: ["P0", "P1"] },
  );
}
it.each([
  [0, 1],
  [0.4, 2],
  [0.99, 3],
])("draws a bounded distinct nomination set with %s", (value, count) => {
  const pool = ["A", "A", "B", "C", "D"];
  const before = [...pool];
  const result = drawSimulationNominees(pool, () => value);
  expect(result).toHaveLength(count);
  expect(new Set(result).size).toBe(count);
  expect(pool).toEqual(before);
  expect(drawSimulationNominees([], () => value)).toEqual([]);
  expect(drawSimulationNominees(["A"], () => value)).toEqual(["A"]);
});
it("gives every legal voter exactly one legal choice and never a self vote", () => {
  const state = { ...vote(["mayor", "idiot"]), silencedPlayer: "P9" };
  let seed = 0;
  const ballots = drawSimulationBallots(state, () => (seed++ % 10) / 10);
  for (const voter of votingPlayers(state)) {
    expect(ballots[voter.name] === undefined).toBe(voter.choices.length === 0);
    if (voter.choices.length) {
      expect(voter.choices).toContain(ballots[voter.name]);
      expect(ballots[voter.name]).not.toBe(voter.name);
    }
  }
  expect(ballots).not.toHaveProperty("P9");
  expect(votingPlayers(state).some((v) => v.weight === 2)).toBe(true);
  expect(votingPlayers(state).some((v) => v.setByNarrator)).toBe(true);
  if (state.status !== "vote") throw Error("Missing vote");
  expect(
    transitionWerewolf(state, { type: "vote", night: 1, nomination: state.nomination, ballots }),
  ).not.toBe(state);
});
it("uses public suspicion while keeping the random model reproducible", () => {
  const state = vote();
  const flat = drawSimulationBallots(state, () => 0.5);
  expect(drawSimulationBallots(state, () => 0.5)).toEqual(flat);
  const weighted = drawSimulationBallots(state, () => 0.5, new Map([["P0", 20]]));
  expect(flat.P2).toBe("P1");
  expect(weighted.P2).toBe("P0");
});
it("lets a modeled vote tie, run off and continue the day after a second tie", () => {
  let state: WerewolfState = vote();
  const ballots = Object.fromEntries(
    names.map((name, i) => [name, i === 0 || i >= 6 ? "P1" : "P0"]),
  );
  for (let round = 1; round <= 2; round++) {
    if (state.status !== "vote") throw Error("Missing vote");
    expect(state.round).toBe(round);
    state = transitionWerewolf(state, {
      type: "vote",
      night: 1,
      nomination: state.nomination,
      ballots,
    });
  }
  expect(state.status).toBe("day");
});
it("handles a sole candidate without a ballot for that candidate", () => {
  const setup = createWerewolf(names.join(","), "Narrator", () => 0.99)!;
  const state = transitionWerewolf(
    { ...setup, status: "day", nomination: 0 },
    { type: "nominate", night: 1, nominees: ["P0"] },
  );
  const ballots = drawSimulationBallots(state, () => 0);
  expect(ballots).not.toHaveProperty("P0");
  expect(Object.values(ballots)).toEqual(Array(9).fill("P0"));
});
it.each([NaN, -1, 1, Infinity])("rejects invalid model randomness %s", (value) => {
  expect(() => drawSimulationNominees(["A"], () => value)).toThrow(RangeError);
  expect(() => drawSimulationBallots(vote(), () => value)).toThrow(RangeError);
});
it("rejects invalid public suspicion weights", () => {
  expect(() => drawSimulationBallots(vote(), () => 0, new Map([["P0", NaN]]))).toThrow(RangeError);
});
