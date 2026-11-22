import { expect, it } from "vitest";
import { createWerewolf, transitionWerewolf, type WerewolfState } from "./stateMachine";
import { validTargets } from "./selectors";
import { eventChoices } from "./eventChoices";
function night(): WerewolfState {
  let state = createWerewolf("A,B,C,D,E,F,G,H,I,J", "Narrator", () => 0.99, ["spellcaster"])!;
  for (const player of state.players)
    state = transitionWerewolf(state, { type: "roleSeen", player: player.name });
  state = transitionWerewolf(state, { type: "wolvesReady", night: 1 });
  state = transitionWerewolf(state, { type: "inspect", night: 1, target: "A" });
  return transitionWerewolf(state, { type: "closeVision", night: 1 });
}
it("requires a silence target when one is available, including pending night victims", () => {
  const state = night();
  expect(state.status).toBe("spellcaster");
  if (state.status !== "spellcaster") throw Error("Missing spellcaster step");
  expect(transitionWerewolf(state, { type: "silence", night: 1, target: null })).toBe(state);
  expect(
    eventChoices(state).some((event) => event.type === "silence" && event.target === null),
  ).toBe(false);
  const target = validTargets(state)[0]!;
  const victim = state.alive.find((p) => p.name === target)!;
  expect(
    transitionWerewolf({ ...state, victim }, { type: "silence", night: 1, target }).status,
  ).toBe("morning");
});
it("allows the null fallback only when no target is possible", () => {
  const base = night();
  const hag = base.players.find((p) => p.role === "spellcaster")!;
  const other = base.players.find((p) => p.role !== "spellcaster")!;
  const state = { ...base, alive: [hag, other], silencedPlayer: other.name };
  expect(validTargets(state)).toEqual([]);
  expect(transitionWerewolf(state, { type: "silence", night: 1, target: null }).status).toBe(
    "morning",
  );
  const selfAllowed = { ...state, settings: { ...state.settings, allowSelfSilence: true } };
  expect(validTargets(selfAllowed)).toEqual([hag.name]);
  expect(transitionWerewolf(selfAllowed, { type: "silence", night: 1, target: null })).toBe(
    selfAllowed,
  );
  expect(
    transitionWerewolf(selfAllowed, { type: "silence", night: 1, target: hag.name }).status,
  ).toBe("morning");
});
it("still rejects repeated and forbidden self choices", () => {
  const state = night();
  const hag = state.players.find((p) => p.role === "spellcaster")!;
  expect(transitionWerewolf(state, { type: "silence", night: 1, target: hag.name })).toBe(state);
  const target = validTargets(state)[0]!;
  const previous = { ...state, silencedPlayer: target };
  expect(transitionWerewolf(previous, { type: "silence", night: 1, target })).toBe(previous);
});
