import { describe, expect, it } from "vitest";
import {
  backGuide,
  chooseAbility,
  closeAbility,
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
  // The narrator begins the game on purpose after the role reveal.
  if (view.phase === "ready") return continueGuide(guide);
  const prepared = view.phase === "act" && !view.canContinue ? decide(guide) : guide;
  if (!describeGuide(prepared).canContinue) return null;
  const next = continueGuide(prepared);
  return next === prepared ? null : next;
}

describe("narrator guide", () => {
  it("hands out the roles one player after the other, then waits for the narrator, then wakes the first role", () => {
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
    // The last player has looked: the game is dealt, but nothing of it is shown.
    const ready = describeGuide(guide);
    expect(ready.phase).toBe("ready");
    expect(ready.card).toBeNull();
    // The button below says "begin" and starts the game.
    expect(ready.canContinue).toBe(true);
    expect(ready.nextKind).toBe("begin");
    expect(guide.session.past.length).toBe(count);
    // Begin: the first role is announced, the button says "next" again.
    const begun = continueGuide(guide);
    expect(describeGuide(begun).nextKind).toBe("next");
    expect(describeGuide(begun).phase).toBe("intro");
    expect(describeGuide(begun).card).not.toBeNull();
    // Back from the first role goes back to the waiting step, then to the last player.
    const back = backGuide(begun);
    expect(back.ok && describeGuide(back.guide).phase).toBe("ready");
    const backAgain = back.ok ? backGuide(back.guide) : back;
    expect(backAgain.ok && describeGuide(backAgain.guide).state.status).toBe("roles");
    expect(backAgain.ok && backAgain.guide.session.past.length).toBe(count - 1);
  });

  it("waits for the narrator also after the game was loaded right after the role reveal", () => {
    let guide = game();
    const count = guide.session.present.players.length;
    for (let index = 0; index < count; index += 1) guide = continueGuide(guide);
    const loaded = createGuide(guide.session);
    expect(describeGuide(loaded).phase).toBe("ready");
    expect(describeGuide(loaded).card).toBeNull();
    // Once the narrator has begun and something has happened, a loaded game goes on as usual.
    let later = continueGuide(loaded);
    later = continueGuide(later);
    expect(describeGuide(createGuide(later.session)).phase).not.toBe("plain");
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

  it("does not call the amulet holder at the start, only at the end of the night, where the holder passes the amulet", () => {
    let guide = game([], { amulet: true, attackOnFirstNight: true });
    // The holder knows it from the card of the role reveal: the first call of the night is a role, not the amulet.
    for (let step = 0; step < 300 && describeGuide(guide).phase !== "ready"; step += 1)
      guide = forward(guide)!;
    guide = continueGuide(guide);
    expect(describeGuide(guide).phase).toBe("intro");
    expect(describeGuide(guide).card?.role).not.toBe("amuletPass");
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
    expect(view.deaths.map((d) => d.name)).toContain(target);
    expect(view.deaths.find((d) => d.name === target)?.causes).toContain("hunter");
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

  describe("what the narrator has to know", () => {
    it("tells why somebody dies in the morning, for the narrator only", () => {
      let guide = game([], { attackOnFirstNight: true });
      for (let step = 0; step < 300 && guide.session.present.status !== "morning"; step += 1)
        guide = forward(guide)!;
      const view = describeGuide(guide);
      expect(view.state.status).toBe("morning");
      expect(view.deaths.length).toBeGreaterThan(0);
      expect(view.deaths[0]?.causes).toContain("wolves");
      // The names that are read out come from the game; the reasons are only additional.
      expect(view.nextKind).toBe("next");
    });

    it("names the person who is silenced or wounded during the day", () => {
      const base = game(["toughGuy"]).session.present;
      const tough = base.players.find((p) => p.role === "toughGuy")!;
      const other = base.players.find((p) => p.role === "villager")!;
      const day = {
        ...base,
        silencedPlayer: other.name,
        status: "day",
        toughGuyDiesOn: 3,
      } as unknown as WerewolfState;
      const view = describeGuide(createGuide(createWerewolfSession(day)));
      expect(view.notes.silenced).toBe(other.name);
      expect(view.notes.wounded).toEqual([tough.name]);
    });

    it("says whom the bodyguard and the night guest may not choose again", () => {
      const base = game(["bodyguard"]).session.present;
      const target = base.players.find((p) => p.role === "villager")!;
      const state = {
        ...base,
        protectedPlayer: target.name,
        status: "bodyguard",
      } as unknown as WerewolfState;
      let guide = createGuide(createWerewolfSession(state));
      guide = continueGuide(guide);
      guide = chooseAbility(guide, "protect");
      expect(describeGuide(guide).notes.restricted).toBe(target.name);
      expect(describeGuide(guide).targets).not.toContain(target.name);
    });

    it("marks the votes that count twice or have to be yes", () => {
      let guide = game(["idiot", "mayor"], { attackOnFirstNight: true });
      for (let step = 0; step < 300 && guide.session.present.status !== "day"; step += 1)
        guide = forward(guide)!;
      guide = chooseAbility(guide, "vote");
      for (let i = 0; i < 3; i += 1) guide = choosePlayer(guide, describeGuide(guide).targets[0]!);
      guide = continueGuide(guide);
      const notes = describeGuide(guide).voterNotes;
      const values = Object.values(notes);
      expect(values.length).toBeGreaterThan(0);
      for (const value of values) expect(["double", "mustYes"]).toContain(value);
    });

    it("lets the narrator leave from the winners and keeps the game going otherwise", () => {
      const base = game().session.present;
      const finished = {
        ...base,
        alive: base.players.filter((p) => p.role !== "wolf"),
        status: "finished",
        winner: "village",
      } as unknown as WerewolfState;
      const view = describeGuide(createGuide(createWerewolfSession(finished)));
      expect(view.nextKind).toBe("finish");
      expect(view.canContinue).toBe(true);
      expect(describeGuide(game()).nextKind).toBe("next");
    });
  });

  it("closes the list of people again when an ability was tapped by mistake", () => {
    let guide = continueGuide(game([], { attackOnFirstNight: true }));
    for (let step = 0; step < 100 && describeGuide(guide).card?.role !== "seer"; step += 1)
      guide = forward(guide)!;
    guide = continueGuide(guide);
    expect(describeGuide(guide).canCloseAbility).toBe(false);
    guide = chooseAbility(guide, "inspect");
    expect(describeGuide(guide).canCloseAbility).toBe(true);
    guide = choosePlayer(guide, describeGuide(guide).targets[0]!);
    const closed = closeAbility(guide);
    const view = describeGuide(closed);
    expect(view.selection.ability).toBeNull();
    expect(view.selection.picks).toEqual([]);
    expect(view.targets).toEqual([]);
    expect(view.canCloseAbility).toBe(false);
    expect(view.canContinue).toBe(false);
    // The ability can be opened again.
    expect(describeGuide(chooseAbility(closed, "inspect")).targets.length).toBeGreaterThan(2);
    // Nothing to close without an open ability.
    expect(closeAbility(closed)).toBe(closed);
  });

  it("lets the button next change the role only: not in the announcement and not inside the step of a role", () => {
    let guide = game([], { attackOnFirstNight: true });
    for (let step = 0; step < 100 && describeGuide(guide).card?.role !== "wolf"; step += 1)
      guide = forward(guide)!;
    // Announcement: the box is tapped, "next" waits.
    expect(describeGuide(guide).phase).toBe("intro");
    expect(describeGuide(guide).canNext).toBe(false);
    guide = continueGuide(guide);
    // Inside the step: the choice is made and confirmed in the box, "next" still waits.
    expect(describeGuide(guide).phase).toBe("act");
    expect(describeGuide(guide).canNext).toBe(false);
    guide = chooseAbility(guide, "attack");
    guide = choosePlayer(guide, describeGuide(guide).targets[0]!);
    expect(describeGuide(guide).canContinue).toBe(true);
    expect(describeGuide(guide).canNext).toBe(false);
    guide = continueGuide(guide);
    // The role is asleep: now "next" changes to the next role.
    expect(describeGuide(guide).phase).toBe("outro");
    expect(describeGuide(guide).canNext).toBe(true);
    // The steps without a role (the role reveal, the morning) are left with "next", too.
    expect(describeGuide(game()).canNext).toBe(true);
  });

  it("restores the saved checkpoints: the steps and the choices come back after a reload, and can be changed", () => {
    let guide = game([], { attackOnFirstNight: true });
    for (let step = 0; step < 100 && describeGuide(guide).card?.role !== "seer"; step += 1)
      guide = forward(guide)!;
    guide = continueGuide(guide);
    guide = chooseAbility(guide, "inspect");
    guide = choosePlayer(guide, describeGuide(guide).targets[0]!);
    const first = describeGuide(guide).selection.picks[0]!;
    expect(first).toBeDefined();
    guide = continueGuide(guide);
    guide = continueGuide(guide);
    // Reload: the trail goes through JSON and comes back with the game.
    const saved = JSON.parse(JSON.stringify(guide.trail)) as unknown;
    const restored = createGuide(guide.session, saved);
    expect(restored.trail).toEqual(guide.trail);
    // Going back finds the choice of the wolves again; another person overwrites it.
    let back = restored;
    for (let i = 0; i < 4 && describeGuide(back).selection.picks[0] !== first; i += 1) {
      const result = backGuide(back, true);
      if (!result.ok) break;
      back = result.guide;
    }
    expect(describeGuide(back).selection.picks).toEqual([first]);
    const other = describeGuide(back).targets.find((name) => name !== first)!;
    back = choosePlayer(unchoosePlayer(back, first), other);
    expect(describeGuide(back).selection.picks).toEqual([other]);
  });

  it("ignores saved checkpoints that do not belong to the game", () => {
    const guide = game();
    const other = forward(forward(guide)!)!;
    expect(createGuide(guide.session, other.trail).trail).toEqual(guide.trail);
    expect(createGuide(guide.session, "garbage").trail).toEqual(guide.trail);
    expect(createGuide(guide.session, []).trail).toEqual(guide.trail);
    expect(createGuide(guide.session, [{ phase: "x" }]).trail).toEqual(guide.trail);
  });

  it("goes back one role at most: from role 2 to role 1, then no further until the game has moved on again", () => {
    let guide = game([], { attackOnFirstNight: true });
    const roles: string[] = [];
    for (let step = 0; step < 200 && roles.length < 2; step += 1) {
      guide = forward(guide)!;
      const view = describeGuide(guide);
      if (view.phase === "intro" && view.card && !roles.includes(view.card.role))
        roles.push(view.card.role);
    }
    expect(roles).toHaveLength(2);
    // Back to the start of the third role, then into the second role: that is one role back.
    const goBackUntil = (from: Guide, role: string): Guide => {
      let g = from;
      for (let i = 0; i < 20 && describeGuide(g).card?.role !== role; i += 1) {
        const result = backGuide(g, true);
        if (!result.ok) break;
        g = result.guide;
      }
      return g;
    };
    let back = goBackUntil(guide, roles[0]!);
    expect(describeGuide(back).card?.role).toBe(roles[0]);
    // Inside the second role back still works (the choice, the announcement) ...
    while (describeGuide(back).phase !== "intro") {
      const result = backGuide(back, true);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      back = result.guide;
    }
    // ... up to the waiting step before the first role, but the role reveal cannot be reached from there.
    const waiting = backGuide(back, true);
    expect(waiting.ok).toBe(true);
    if (!waiting.ok) return;
    back = waiting.guide;
    expect(describeGuide(back).phase).toBe("ready");
    expect(describeGuide(back).canGoBack).toBe(false);
    expect(backGuide(back, true)).toEqual({ ok: false, reason: "limit" });
    // After the game moved on, the narrator may go back one role again.
    let ahead = back;
    for (let i = 0; i < 20 && describeGuide(ahead).card?.role !== roles[1]; i += 1)
      ahead = forward(ahead) ?? ahead;
    expect(describeGuide(ahead).canGoBack).toBe(true);
  });

  it("lets the narrator tap the ability again after the choice was confirmed and replaces the choice", () => {
    let guide = game([], { attackOnFirstNight: true });
    for (let step = 0; step < 100 && describeGuide(guide).card?.role !== "wolf"; step += 1)
      guide = forward(guide)!;
    guide = continueGuide(guide);
    guide = chooseAbility(guide, "attack");
    const targets = describeGuide(guide).targets;
    guide = choosePlayer(guide, targets[0]!);
    guide = continueGuide(guide);
    expect(describeGuide(guide).phase).toBe("outro");
    // The ability opens the choice again; nothing of the game has moved yet.
    guide = chooseAbility(guide, "attack");
    expect(describeGuide(guide).phase).toBe("act");
    expect(describeGuide(guide).selection.picks).toEqual([]);
    guide = choosePlayer(guide, targets[1]!);
    guide = continueGuide(guide);
    guide = continueGuide(guide);
    const events = guide.session.past.length;
    expect(events).toBeGreaterThan(0);
    expect(JSON.stringify(guide.session.present.history)).toContain(targets[1]!);
  });
});
