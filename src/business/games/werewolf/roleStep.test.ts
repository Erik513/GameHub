import { describe, expect, it } from "vitest";
import { describeRoleStep, pickLimitOf } from "./roleStep";
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
    // The old hag has to silence somebody: no skipping while somebody can be chosen.
    expect(describeRoleStep(at({ status: "spellcaster" })).skippable).toBe(false);
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
    // Nothing to use, but the questions are asked all the same: "skip" answers them.
    expect(empty).toMatchObject({ skippable: true, variant: "witchEmpty" });
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

  it("lets the old hag skip only when nobody can be chosen", () => {
    const base = at({ status: "spellcaster" }, { allowSelfSilence: false });
    const [hag, other] = base.players.map((player, index) => ({
      ...player,
      role: index === 0 ? "spellcaster" : player.role,
    }));
    const alone = {
      ...base,
      alive: [hag!, other!],
      players: [hag!, other!],
      silencedPlayer: other!.name,
    };
    expect(describeRoleStep(alone).skippable).toBe(true);
    expect(describeRoleStep({ ...alone, silencedPlayer: null }).skippable).toBe(false);
  });

  it("says for every step that names one person which event it hands to the game, and what skip stands for", () => {
    expect(describeRoleStep(at({ status: "seer", victim: null })).pick).toMatchObject({
      event: "inspect",
      nobody: false,
    });
    expect(describeRoleStep(at({ night: 2, status: "wolves" })).pick).toMatchObject({
      event: "attack",
      nobody: false,
    });
    expect(describeRoleStep(at({ status: "wolves" })).pick).toBeUndefined();
    expect(describeRoleStep(at({ status: "investigator", victim: null })).pick).toMatchObject({
      event: "investigate",
      skipTarget: null,
    });
    expect(describeRoleStep(at({ status: "morning" })).pick).toBeUndefined();
  });

  it("names the steps with a choice of several parts and how many people an ability takes", () => {
    expect(describeRoleStep(at({ status: "witch", victim: null })).compound).toBe("potions");
    expect(
      describeRoleStep(at({ status: "magician", poisoned: null, victim: null })).compound,
    ).toBe("castSpells");
    expect(describeRoleStep(at({ status: "cupid" })).compound).toBe("bond");
    expect(describeRoleStep(at({ status: "seer", victim: null })).compound).toBeUndefined();
    const magician = at({ poisoned: null, spellsRemaining: 2, status: "magician", victim: null });
    expect(pickLimitOf(magician, "kill", false)).toBe(2);
    // A healing spell takes one of the two spells.
    expect(pickLimitOf(magician, "kill", true)).toBe(1);
    expect(pickLimitOf(magician, "bond", false)).toBe(2);
    expect(pickLimitOf(magician, "poison", false)).toBe(1);
  });

  it("names the event of a step that the narrator only confirms, and of the day and the vote", () => {
    expect(describeRoleStep(at({ status: "vision" })).confirm).toBe("closeVision");
    expect(describeRoleStep(at({ status: "morning" })).confirm).toBe("announceMorning");
    expect(describeRoleStep(at({ status: "wolves" })).confirm).toBe("wolvesReady");
    expect(describeRoleStep(at({ night: 2, status: "wolves" })).confirm).toBeUndefined();
    expect(describeRoleStep(at({ status: "day" })).compound).toBe("nominate");
    expect(describeRoleStep(at({ candidates: ["Ada"], round: 1, status: "vote" })).compound).toBe(
      "vote",
    );
  });

  it("lets the day be skipped (no vote), but not the vote itself", () => {
    expect(describeRoleStep(at({ status: "day" }))).toMatchObject({
      skip: { label: "noVote" },
      skippable: true,
    });
    expect(describeRoleStep(at({ candidates: ["Ada"], round: 1, status: "vote" })).skippable).toBe(
      false,
    );
  });
});
