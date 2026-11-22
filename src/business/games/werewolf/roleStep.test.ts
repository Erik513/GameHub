import { describe, expect, it } from "vitest";
import { describeRoleStep } from "./roleStep";
import { createWerewolf } from "./stateMachine";

const names = "Anna,Ben,Cleo,Dora,Emil,Finn,Gina,Hans,Ida,Jan,Kim,Lea";

function at(step: Record<string, unknown>, settings: Parameters<typeof createWerewolf>[4] = {}) {
  const state = createWerewolf(names, "Max", () => 0.3, [], settings)!;
  return { ...state, ...step };
}

describe("describeRoleStep", () => {
  it("has two views for the wolves: an attack, and the first night without one", () => {
    expect(describeRoleStep(at({ status: "wolves" })).variant).toBe("wolvesNoAttack");
    expect(describeRoleStep(at({ night: 2, status: "wolves" })).variant).toBe("wolvesAttack");
    expect(describeRoleStep(at({ status: "wolves" }, { attackOnFirstNight: true })).variant).toBe(
      "wolvesAttack",
    );
  });

  it("separates what is chosen, what is read out and what the role may skip", () => {
    expect(describeRoleStep(at({ status: "seer", victim: null }))).toMatchObject({
      kind: "choose",
      skippable: false,
    });
    expect(describeRoleStep(at({ status: "vision" })).kind).toBe("result");
    expect(describeRoleStep(at({ status: "investigator", victim: null }))).toMatchObject({
      kind: "choose",
      skippable: true,
    });
    expect(describeRoleStep(at({ status: "spellcaster" })).skippable).toBe(true);
    expect(describeRoleStep(at({ status: "bodyguard" })).skippable).toBe(false);
    expect(describeRoleStep(at({ lovers: ["Anna", "Ben"], status: "lovers" })).kind).toBe("info");
    expect(describeRoleStep(at({ status: "morning" })).kind).toBe("plain");
  });

  it("shows the victim for the witch and the magician, and has an empty view without potions", () => {
    const witch = describeRoleStep(at({ status: "witch", victim: null }));
    expect(witch.showsVictim).toBe(true);
    const empty = describeRoleStep(
      at({ potions: { heal: false, poison: false }, status: "witch", victim: null }),
    );
    expect(empty).toMatchObject({ skippable: false, variant: "witchEmpty" });
  });

  it("has two views for the hunter: the shot may be left out, or is required", () => {
    const hunter = { hunter: { name: "Anna", role: "hunter" }, next: "day", status: "hunter" };
    expect(describeRoleStep(at(hunter))).toMatchObject({
      skippable: true,
      variant: "hunterOptional",
    });
    expect(describeRoleStep(at(hunter, { hunterShot: "required" }))).toMatchObject({
      skippable: false,
      variant: "hunterRequired",
    });
  });
});
