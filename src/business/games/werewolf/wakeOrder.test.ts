import { describe, expect, it } from "vitest";
import { defaultFixedSettings, emptyFixedDraft, type FixedDraft } from "./fixedConfiguration";
import { emptyVariableDraft, type VariableDraft } from "./variableConfiguration";
import { wakeOrder, wakeOrderVariable } from "./wakeOrder";

const draft = (roles: FixedDraft["roles"], settings: Partial<FixedDraft["settings"]> = {}) => ({
  ...emptyFixedDraft,
  roles,
  settings: { ...defaultFixedSettings, ...settings },
});
const ids = (value: FixedDraft) =>
  wakeOrder(value)
    .filter((step) => step.inGame)
    .map((step) => step.id);

describe("the wake-up order", () => {
  it("lists every step in the fixed order of the night", () => {
    expect(wakeOrder(emptyFixedDraft).map((step) => step.id)).toEqual([
      "cupid",
      "drunk",
      "guard",
      "wolves",
      "seer",
      "paranormalInvestigator",
      "witch",
      "magician",
      "mayor",
      "spellcaster",
      "amulet",
    ]);
  });

  it("has only the wolves and the seer in the game without further roles", () => {
    expect(ids(emptyFixedDraft)).toEqual(["wolves", "seer"]);
  });

  it("puts the chosen roles and extras in their place", () => {
    const full = draft(
      ["cupid", "nightGuest", "paranormalInvestigator", "witch", "spellcaster", "mayor"],
      { amulet: true, drunk: true, mayor: "hammer" },
    );
    expect(ids(full)).toEqual([
      "cupid",
      "drunk",
      "guard",
      "wolves",
      "seer",
      "paranormalInvestigator",
      "witch",
      "mayor",
      "spellcaster",
      "amulet",
    ]);
  });

  it("wakes the mayor only with the hammer, after the magician and before the old hag", () => {
    expect(ids(draft(["mayor"], { mayor: "doubleVote" }))).not.toContain("mayor");
    const hammer = ids(draft(["magician", "mayor", "spellcaster"], { mayor: "hammer" }));
    expect(hammer.indexOf("magician")).toBeLessThan(hammer.indexOf("mayor"));
    expect(hammer.indexOf("mayor")).toBeLessThan(hammer.indexOf("spellcaster"));
  });

  it("counts the bodyguard and the night guest as the same step", () => {
    expect(ids(draft(["bodyguard"]))).toContain("guard");
    expect(ids(draft(["nightGuest"]))).toContain("guard");
  });

  it("says when a step does not happen every night", () => {
    const timings = Object.fromEntries(
      wakeOrder(emptyFixedDraft).map((step) => [step.id, step.timing]),
    );
    expect(timings).toMatchObject({
      cupid: "firstNight",
      drunk: "thirdNight",
      mayor: "fromSecondNight",
      wolves: null,
    });
  });
});

describe("the wake-up order for variable roles", () => {
  const variable = (
    states: Record<string, "may" | "must" | "not">,
    items: Partial<VariableDraft["items"]> = {},
  ): VariableDraft => ({
    ...emptyVariableDraft,
    items: { ...emptyVariableDraft.items, ...items },
    states,
  });
  const presence = (draft: VariableDraft) =>
    Object.fromEntries(wakeOrderVariable(draft).map((step) => [step.id, step.presence]));

  it("has only the wolves and the seer for certain without any choice", () => {
    expect(presence(emptyVariableDraft)).toMatchObject({
      cupid: "not",
      seer: "must",
      witch: "not",
      wolves: "must",
    });
  });

  it("calls a role that may be in the game as well as one that must be", () => {
    const steps = wakeOrderVariable(variable({ cupid: "may", witch: "must" }));
    expect(steps.filter((step) => step.inGame).map((step) => step.id)).toEqual([
      "cupid",
      "wolves",
      "seer",
      "witch",
    ]);
    expect(presence(variable({ cupid: "may", witch: "must" }))).toMatchObject({
      cupid: "may",
      witch: "must",
    });
  });

  it("takes the stronger state of the two guards and of the options of a role", () => {
    expect(presence(variable({ nightGuest: "may" })).guard).toBe("may");
    expect(presence(variable({ bodyguard: "must", nightGuest: "not" })).guard).toBe("must");
    expect(
      presence(variable({ "spellcaster:allowed": "may", "spellcaster:forbidden": "may" }))
        .spellcaster,
    ).toBe("may");
  });

  it("wakes the mayor only with the hammer, and the extras by their own state", () => {
    expect(presence(variable({ "mayor:doubleVote": "must" })).mayor).toBe("not");
    expect(presence(variable({ "mayor:hammer": "may" })).mayor).toBe("may");
    expect(presence(variable({}, { amulet: "may", drunk: "must" }))).toMatchObject({
      amulet: "may",
      drunk: "must",
    });
  });

  it("keeps the fixed order of the night", () => {
    expect(wakeOrderVariable(emptyVariableDraft).map((step) => step.id)).toEqual(
      wakeOrder(emptyFixedDraft).map((step) => step.id),
    );
  });
});
