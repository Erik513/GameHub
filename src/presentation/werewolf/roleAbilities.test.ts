import { describe, expect, it } from "vitest";
import { variantOfRole } from "./roleAbilities";

const settings = {
  allowSelfSilence: false,
  hunterShot: "optional",
  tanner: "anyDeath",
  toughGuy: "wolfOnly",
} as const;

describe("variantOfRole", () => {
  it("names the option the role is played with", () => {
    expect(variantOfRole("hunter", settings)).toBe("optional");
    expect(variantOfRole("hunter", { ...settings, hunterShot: "required" })).toBe("required");
    expect(variantOfRole("toughGuy", { ...settings, toughGuy: "anyAttack" })).toBe("anyAttack");
    expect(variantOfRole("tanner", { ...settings, tanner: "voteOnly" })).toBe("voteOnly");
    expect(variantOfRole("spellcaster", settings)).toBe("forbidden");
    expect(variantOfRole("spellcaster", { ...settings, allowSelfSilence: true })).toBe("allowed");
  });

  it("has no option for the other roles", () => {
    for (const role of ["wolf", "seer", "villager", "witch", "mayor", "drunk"] as const)
      expect(variantOfRole(role, settings)).toBeNull();
  });
});
