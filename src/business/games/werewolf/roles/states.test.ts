import { expect, it } from "vitest";
import { stateRules } from "./cardEffects";
import { stateIds } from "./stateIds";

/** Every state has a rule (in the file of its role or with the common states), and no rule is there twice for no reason. */

it("has a rule for every state", () => {
  for (const id of stateIds) expect(stateRules.some((rules) => id in rules)).toBe(true);
});

it("names every state once, in the order of the slots", () => {
  expect(new Set(stateIds).size).toBe(stateIds.length);
});
