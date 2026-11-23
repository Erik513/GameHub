import { expect, it } from "vitest";
import {
  drawSimulationNominees,
  drawSimulationBallots,
  drawSimulationVoteCounts,
} from "./simulationVoting";
import { votingPlayers } from "./selectors";
import {
  createWerewolf,
  transitionWerewolf,
  voteTotal,
  voteNeeded,
  type WerewolfState,
} from "./stateMachine";
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

it("models counted yes and no votes rather than forcing a sole candidate out", () => {
  const state = { ...vote(), candidates: ["P0"] };
  if (state.status !== "vote") throw Error("Missing vote");
  const no = drawSimulationVoteCounts(state, () => 0.99);
  const yes = drawSimulationVoteCounts(state, () => 0);
  expect(no).toEqual({ P0: 0 });
  expect(yes).toEqual({ P0: voteTotal(state) });
  expect(voteNeeded(state)).toBe(Math.floor(voteTotal(state) / 2) + 1);
  for (const [counts, status] of [
    [no, "day"],
    [yes, "exile"],
  ] as const)
    expect(
      transitionWerewolf(state, {
        type: "voteCount",
        night: 1,
        nomination: state.nomination,
        counts,
      }).status,
    ).toBe(status);
  expect(drawSimulationVoteCounts(state, () => 0.6, new Map([["P0", 10]]))).toEqual(yes);
});
it("aggregates named choices with the mayor weight before submitting counts", () => {
  const state = { ...vote(["mayor"]), silencedPlayer: "P9" };
  if (state.status !== "vote") throw Error("Missing vote");
  const ballots = drawSimulationBallots(state, () => 0.25);
  const expected: Record<string, number> = { P0: 0, P1: 0 };
  for (const voter of votingPlayers(state))
    if (ballots[voter.name]) expected[ballots[voter.name]!]! += voter.weight;
  const counts = drawSimulationVoteCounts(state, () => 0.25);
  expect(counts).toEqual(expected);
  expect(Object.values(counts).reduce((sum, count) => sum + count, 0)).toBe(voteTotal(state));
  expect(
    transitionWerewolf(state, {
      type: "voteCount",
      night: 1,
      nomination: state.nomination,
      counts,
    }),
  ).not.toBe(state);
  expect(drawSimulationVoteCounts({ ...state, status: "day" }, () => 0)).toEqual({});
});
it("counts a nominated mayor's votes only in the denominator and ignores a silenced mayor", () => {
  const initial = vote(["mayor"]);
  const mayor = initial.players.find((p) => p.role === "mayor")!.name;
  const state = { ...initial, candidates: [mayor] };
  expect(voteTotal(state)).toBe(9);
  expect(voteNeeded(state)).toBe(Math.floor(voteTotal(state) / 2) + 1);
  expect(drawSimulationVoteCounts(state, () => 0)).toEqual({ [mayor]: 9 });
  const muted = { ...state, silencedPlayer: mayor };
  expect(voteNeeded(muted)).toBe(5);
  expect(drawSimulationVoteCounts(muted, () => 0)).toEqual({ [mayor]: 9 });
});
it("rejects invalid counted-vote randomness and weights", () => {
  const state = { ...vote(), candidates: ["P0"] };
  expect(() => drawSimulationVoteCounts(state, () => NaN)).toThrow(RangeError);
  expect(() => drawSimulationVoteCounts(state, () => 0, new Map([["P0", Infinity]]))).toThrow(
    RangeError,
  );
});
