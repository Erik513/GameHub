import { expect, it } from "vitest";
import { describeNarratorCard } from "./narratorCard";
import { roleVariantOf } from "./roleVariant";
import { describePlayers, variantsOf } from "./selectors";
import { createWerewolf, type WerewolfState } from "./stateMachine";

/** The way a role is played in this game: on the person, on the card of the awake role and in the legend. */

const settings = {
  allowSelfSilence: false,
  hunterShot: "required",
  mayor: "hammer",
  tanner: "voteOnly",
  toughGuy: "anyAttack",
} as const;

it("names the variant of every role that has options, and nothing for the others", () => {
  expect(roleVariantOf("toughGuy", settings)).toBe("anyAttack");
  expect(roleVariantOf("hunter", settings)).toBe("required");
  expect(roleVariantOf("tanner", settings)).toBe("voteOnly");
  expect(roleVariantOf("mayor", settings)).toBe("hammer");
  expect(roleVariantOf("spellcaster", settings)).toBe("forbidden");
  expect(roleVariantOf("spellcaster", { ...settings, allowSelfSilence: true })).toBe("allowed");
  expect(roleVariantOf("wolf", settings)).toBeNull();
  expect(roleVariantOf("witch", settings)).toBeNull();
});

const game = () =>
  createWerewolf("A,B,C,D,E,F,G,H,I,J,K,L", "Max", () => 0.3, ["toughGuy", "hunter", "mayor"], {
    hunterShot: "required",
    mayor: "doubleVote",
    toughGuy: "anyAttack",
    wolfCount: 2,
  })!;

it("hands the variant over with every person and lists each variant once for the legend", () => {
  const players = describePlayers(game());
  expect(players.find((person) => person.role === "toughGuy")?.variant).toBe("anyAttack");
  expect(players.find((person) => person.role === "hunter")?.variant).toBe("required");
  expect(players.find((person) => person.role === "wolf")?.variant).toBeNull();
  expect(variantsOf(players).sort()).toEqual(["anyAttack", "doubleVote", "required"]);
});

it("puts the variant on the card of the awake role, and not on a role without options", () => {
  const base = game();
  const hunter = base.players.find((player) => player.role === "hunter");
  const state = { ...base, hunter, next: "day", status: "hunter" } as unknown as WerewolfState;
  expect(describeNarratorCard(state)?.variant).toBe("required");
  const wolves = { ...game(), status: "wolves" } as unknown as WerewolfState;
  expect(describeNarratorCard(wolves)).not.toHaveProperty("variant");
});
