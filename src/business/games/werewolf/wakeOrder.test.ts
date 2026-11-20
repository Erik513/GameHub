import { describe, expect, it } from "vitest";
import { defaultFixedSettings, emptyFixedDraft, type FixedDraft } from "./fixedConfiguration";
import { wakeOrder } from "./wakeOrder";

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
