import { describe, expect, it } from "vitest";
import {
  backGuide,
  chooseAbility,
  chooseNobody,
  choosePlayer,
  continueGuide,
  createGuide,
  describeGuide,
  undoSelection,
  unchoosePlayer,
  type Guide,
} from "./narratorGuide";
import { createWerewolfSession } from "./session";
import { createWerewolf } from "./stateMachine";

const names = "Anna,Ben,Cleo,Dora,Emil,Finn,Gina,Hans,Ida,Jan,Kim,Lea";

function game(
  roles: Parameters<typeof createWerewolf>[3] = [],
  settings: Parameters<typeof createWerewolf>[4] = {},
  random = () => 0.3,
): Guide {
  return createGuide(createWerewolfSession(createWerewolf(names, "Max", random, roles, settings)!));
}

/** Plays the choice of the awake role the simplest way: the first usable ability, the first person. */
function decide(guide: Guide): Guide {
  const view = describeGuide(guide);
  let next = guide;
  for (const ability of view.card?.abilities ?? []) {
    if (!ability.available) continue;
    next = chooseAbility(next, ability.id);
    const after = describeGuide(next);
    if (after.targets[0] && ability.id !== "heal") next = choosePlayer(next, after.targets[0]);
    if (describeGuide(next).canContinue) break;
  }
  if (!describeGuide(next).canContinue) next = chooseNobody(next);
  return next;
}

/** Walks one step forward the way a narrator would; null when the guide cannot go on by itself. */
function forward(guide: Guide): Guide | null {
  const view = describeGuide(guide);
  const prepared = view.phase === "act" && !view.canContinue ? decide(guide) : guide;
  if (!describeGuide(prepared).canContinue) return null;
  const next = continueGuide(prepared);
  return next === prepared ? null : next;
}

describe("narrator guide", () => {
  it("hands out the roles one player after the other and then wakes the first role", () => {
    const start = game();
    expect(describeGuide(start).phase).toBe("plain");
    expect(describeGuide(start).canGoBack).toBe(false);
    let guide = start;
    const count = start.session.present.players.length;
    for (let index = 0; index < count; index += 1) {
      const { state } = describeGuide(guide);
      expect(state.status === "roles" && state.index).toBe(index);
      expect(describeGuide(guide).canContinue).toBe(true);
      guide = continueGuide(guide);
    }
    expect(describeGuide(guide).phase).toBe("intro");
    expect(describeGuide(guide).card).not.toBeNull();
    // Back from the first role goes back to the last player of the role reveal.
    const back = backGuide(guide);
    expect(back.ok && describeGuide(back.guide).state.status).toBe("roles");
    expect(back.ok && back.guide.session.past.length).toBe(count - 1);
  });

  it("goes through intro, act and outro of the wolves, handing the choice to the game at the outro", () => {
    let guide = continueGuide(game([], { attackOnFirstNight: true }));
    // Skip to the wolves.
    for (let guard = 0; guard < 100 && describeGuide(guide).card?.role !== "wolf"; guard += 1)
      guide = forward(guide)!;
    expect(describeGuide(guide).card?.role).toBe("wolf");
    expect(describeGuide(guide).phase).toBe("intro");
    guide = continueGuide(guide);
    expect(describeGuide(guide).phase).toBe("act");
    expect(describeGuide(guide).canContinue).toBe(false);
    guide = chooseAbility(guide, "attack");
    const victim = describeGuide(guide).targets[0]!;
    expect(describeGuide(guide).targets).not.toContain("Max");
    guide = choosePlayer(guide, victim);
    expect(describeGuide(guide).canUndo).toBe(true);
    expect(describeGuide(guide).canContinue).toBe(true);
    const before = guide.session.past.length;
    guide = continueGuide(guide);
    expect(describeGuide(guide).phase).toBe("outro");
    expect(guide.session.past.length).toBe(before);
    guide = continueGuide(guide);
    expect(guide.session.past.length).toBe(before + 1);
  });

  it("takes back a choice without leaving the step", () => {
    let guide = continueGuide(game([], { attackOnFirstNight: true }));
    for (let guard = 0; guard < 100 && describeGuide(guide).card?.role !== "wolf"; guard += 1)
      guide = forward(guide)!;
    guide = continueGuide(guide);
    guide = chooseAbility(guide, "attack");
    guide = choosePlayer(guide, describeGuide(guide).targets[0]!);
    guide = undoSelection(guide);
    expect(describeGuide(guide).selection.picks).toEqual([]);
    expect(describeGuide(guide).canContinue).toBe(false);
    guide = chooseNobody(guide);
    expect(describeGuide(guide).canContinue).toBe(true);
    guide = choosePlayer(guide, describeGuide(guide).targets[0]!);
    expect(describeGuide(guide).selection.none).toBe(false);
    const person = describeGuide(guide).selection.picks[0]!;
    guide = unchoosePlayer(guide, person);
    expect(describeGuide(guide).selection.picks).toEqual([]);
  });

  it("does not let a closed ability or a stranger be chosen", () => {
    let guide = continueGuide(game());
    guide = continueGuide(guide);
    const before = guide;
    expect(chooseAbility(guide, "witchPotion" as never)).toBe(before);
    expect(choosePlayer(guide, "Nobody")).toBe(before);
    expect(chooseNobody(guide)).toBe(before);
  });

  it("walks forward and back through whole nights: back always returns to the step before", () => {
    for (const [roles, seed] of [
      [[], 0.3],
      [["witch", "bodyguard", "cupid"], 0.5],
      [["magician", "paranormalInvestigator", "mayor"], 0.7],
      [["nightGuest", "spellcaster", "toughGuy"], 0.2],
    ] as const) {
      let guide = game(roles, { attackOnFirstNight: true, mayor: "hammer" }, () => seed);
      for (let step = 0; step < 200; step += 1) {
        const next = forward(guide);
        if (!next) break;
        const back = backGuide(next, true);
        expect(back.ok).toBe(true);
        if (!back.ok) break;
        expect(back.guide.session.present).toEqual(guide.session.present);
        expect(back.guide.trail.at(-1)?.phase).toBe(describeGuide(guide).phase);
        guide = next;
      }
      expect(guide.session.past.length).toBeGreaterThan(0);
    }
  });

  it("reaches the morning and asks for a confirmation before it takes the morning back", () => {
    let guide = game(["witch"], { attackOnFirstNight: true });
    for (let step = 0; step < 200 && guide.session.present.status !== "morning"; step += 1)
      guide = forward(guide)!;
    expect(guide.session.present.status).toBe("morning");
    expect(describeGuide(guide).phase).toBe("plain");
    const day = continueGuide(guide);
    expect(day.session.present.status).not.toBe("morning");
    const refused = backGuide(day);
    expect(refused).toEqual({ ok: false, reason: "confirmationRequired" });
    const back = backGuide(day, true);
    expect(back.ok && back.guide.session.present.status).toBe("morning");
  });

  it("cannot go back from the very start", () => {
    const refused = backGuide(game());
    expect(refused).toEqual({ ok: false, reason: "atStart" });
  });

  it("keeps the healing potion as a switch of the witch", () => {
    let guide = game(["witch"], { attackOnFirstNight: true });
    for (let step = 0; step < 200 && guide.session.present.status !== "witch"; step += 1)
      guide = forward(guide)!;
    expect(guide.session.present.status).toBe("witch");
    guide = continueGuide(guide);
    expect(describeGuide(guide).phase).toBe("act");
    expect(describeGuide(guide).canContinue).toBe(true);
    const healed = chooseAbility(guide, "heal");
    expect(describeGuide(healed).selection.heal).toBe(true);
    expect(describeGuide(chooseAbility(healed, "heal")).selection.heal).toBe(false);
    const poison = chooseAbility(guide, "poison");
    const victim = describeGuide(poison).targets[0]!;
    expect(describeGuide(choosePlayer(poison, victim)).selection.picks).toEqual([victim]);
  });
});
