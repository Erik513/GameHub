import { describe, expect, it } from "vitest";
import {
  backGuide,
  chooseAbility,
  chooseNobody,
  choosePlayer,
  continueGuide,
  createGuide,
  describeGuide,
  describeWinners,
  undoSelection,
  unchoosePlayer,
  type Guide,
} from "./narratorGuide";
import { createWerewolfSession } from "./session";
import { createWerewolf, type WerewolfState } from "./stateMachine";

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

  describe("the day", () => {
    function toDay(roles: Parameters<typeof game>[0] = ["idiot"]): Guide {
      let guide = game(roles, { attackOnFirstNight: true });
      for (let step = 0; step < 300 && guide.session.present.status !== "day"; step += 1)
        guide = forward(guide)!;
      expect(guide.session.present.status).toBe("day");
      return guide;
    }

    it("opens the day card at once and ends the day with the next button", () => {
      const guide = toDay();
      const view = describeGuide(guide);
      expect(view.phase).toBe("act");
      expect(view.card?.role).toBe("day");
      expect(view.nextKind).toBe("endDay");
      expect(view.canContinue).toBe(true);
      const night = continueGuide(guide);
      expect(night.session.present.status).not.toBe("day");
      // The first role of the night is announced, not shown: its intro comes first.
      expect(describeGuide(night).phase).toBe("intro");
      const back = backGuide(night);
      expect(back.ok && back.guide.session.present.status).toBe("day");
    });

    it("nominates in three choices, starts the vote and counts the yes voters", () => {
      let guide = toDay();
      guide = chooseAbility(guide, "vote");
      const first = describeGuide(guide);
      expect(first.targets.length).toBeGreaterThan(2);
      expect(first.nextKind).toBe("endDay");
      guide = choosePlayer(guide, first.targets[0]!);
      const nominee = describeGuide(guide).selection.picks[0]!;
      expect(describeGuide(guide).targets).not.toContain(nominee);
      expect(describeGuide(guide).canContinue).toBe(false);
      guide = choosePlayer(guide, describeGuide(guide).targets[0]!);
      guide = choosePlayer(guide, describeGuide(guide).targets[0]!);
      expect(describeGuide(guide).nextKind).toBe("startVote");
      expect(describeGuide(guide).canContinue).toBe(true);
      guide = continueGuide(guide);
      const vote = describeGuide(guide);
      expect(vote.state.status).toBe("vote");
      expect(vote.card?.actors).toEqual([nominee]);
      expect(vote.nextKind).toBe("endVote");
      expect(vote.targets.length).toBeGreaterThan(2);
      // The village idiot has to vote yes and cannot be taken back.
      const idiot = vote.state.alive.find((p) => p.role === "idiot")?.name;
      if (idiot) {
        expect(vote.selection.picks).toContain(idiot);
        expect(describeGuide(unchoosePlayer(guide, idiot)).selection.picks).toContain(idiot);
      }
      guide = choosePlayer(guide, vote.targets[0]!);
      expect(describeGuide(guide).canUndo).toBe(true);
      guide = undoSelection(guide);
      expect(describeGuide(guide).canUndo).toBe(false);
      guide = continueGuide(guide);
      expect(["day", "exile"]).toContain(guide.session.present.status);
      // Back from the result goes into the vote again.
      const back = backGuide(guide);
      expect(back.ok && describeGuide(back.guide).state.status).toBe("vote");
    });

    it("takes a nomination back from the chosen person on", () => {
      let guide = chooseAbility(toDay(), "vote");
      guide = choosePlayer(guide, describeGuide(guide).targets[0]!);
      guide = choosePlayer(guide, describeGuide(guide).targets[0]!);
      const [nominee, nominator] = describeGuide(guide).selection.picks;
      guide = unchoosePlayer(guide, nominator!);
      expect(describeGuide(guide).selection.picks).toEqual([nominee]);
    });
  });

  it("announces the amulet holder at the start and lets the holder pass the amulet at the end of the night", () => {
    let guide = game([], { amulet: true, attackOnFirstNight: true });
    const holder = guide.session.present.amulet!.holder;
    for (let step = 0; step < 300 && guide.session.present.status !== "amuletIntro"; step += 1)
      guide = forward(guide)!;
    expect(guide.session.present.status).toBe("amuletIntro");
    expect(describeGuide(guide).card?.role).toBe("amulet");
    expect(describeGuide(guide).card?.actors).toEqual([holder]);
    guide = continueGuide(guide);
    expect(describeGuide(guide).phase).toBe("act");
    expect(describeGuide(guide).canContinue).toBe(true);
    // The night goes on until the end step: the holder passes the amulet, the next morning follows.
    for (let step = 0; step < 300 && guide.session.present.status !== "amuletPass"; step += 1) {
      const next = forward(guide);
      if (!next) break;
      guide = next;
    }
    if (guide.session.present.status === "amuletPass") {
      expect(describeGuide(guide).card?.role).toBe("amuletPass");
      guide = continueGuide(guide);
      expect(describeGuide(guide).phase).toBe("act");
      const before = guide.session.present.amulet!.holder;
      guide = chooseAbility(guide, "passAmulet");
      // The holder may keep the amulet unless the game says it has to be passed on.
      expect(describeGuide(guide).targets.length).toBeGreaterThan(1);
      expect(describeGuide(guide).targets.includes(before)).toBe(
        !guide.session.present.amulet!.mustPass,
      );
    }
  });

  it("names who leaves the game with the shot of the hunter before the hunter falls asleep", () => {
    const base = game(["hunter"]).session.present;
    const hunter = base.players.find((p) => p.role === "hunter")!;
    const shooting = {
      ...base,
      hunter,
      next: "day",
      status: "hunter",
    } as unknown as WerewolfState;
    let guide = createGuide(createWerewolfSession(shooting));
    expect(describeGuide(guide).card?.role).toBe("hunter");
    // No effect of the night is shown in the day.
    expect(describeGuide(guide).card?.effects).not.toContain("protected");
    guide = continueGuide(guide);
    guide = chooseAbility(guide, "shot");
    const target = describeGuide(guide).targets[0]!;
    guide = choosePlayer(guide, target);
    guide = continueGuide(guide);
    const view = describeGuide(guide);
    expect(view.phase).toBe("outro");
    expect(view.outcome).toContain(target);
    // The shot reaches the game only with the next confirmation.
    expect(guide.session.present.status).toBe("hunter");
    guide = continueGuide(guide);
    expect(guide.session.present.alive.some((p) => p.name === target)).toBe(false);
  });

  describe("the winners", () => {
    const finish = (winner: "village" | "wolves", extra: Record<string, unknown> = {}) => {
      const base = game(["tanner"]).session.present;
      const wolves = base.players.filter((p) => p.role === "wolf");
      const alive = winner === "wolves" ? wolves : base.players.filter((p) => p.role !== "wolf");
      return { ...base, alive, status: "finished", winner, ...extra } as unknown as WerewolfState;
    };

    it("lists the whole winning side, also the players who left the game", () => {
      const wolves = describeWinners(finish("wolves"));
      expect(wolves).toHaveLength(1);
      expect(wolves[0]?.kind).toBe("wolves");
      expect(wolves[0]?.players.length).toBeGreaterThan(1);
      const village = describeWinners(finish("village"));
      expect(village[0]?.kind).toBe("village");
      expect(village[0]?.players.some((name) => wolves[0]!.players.includes(name))).toBe(false);
    });

    it("adds the lovers who are both still in the game and the tanner in a group of his own", () => {
      const base = finish("village");
      const [one, two] = base.alive.map((p) => p.name);
      const tanner = base.players.find((p) => p.role === "tanner")!.name;
      const groups = describeWinners({
        ...base,
        lovers: [one!, two!],
        tannerWinner: tanner,
      });
      expect(groups.map((g) => g.kind)).toEqual(["village", "lovers", "tanner"]);
      expect(groups[0]?.players).not.toContain(tanner);
      expect(groups[1]?.players).toEqual([one, two]);
      expect(groups[2]?.players).toEqual([tanner]);
      // Lovers of whom one left the game are no winners.
      const half = describeWinners({
        ...base,
        alive: base.alive.filter((p) => p.name !== one),
        lovers: [one!, two!],
      });
      expect(half.map((g) => g.kind)).toEqual(["village"]);
    });

    it("has no winners before the end", () => {
      expect(describeWinners(game().session.present)).toEqual([]);
    });
  });
});
