import { describe, expect, it } from "vitest";
import {
  backGuide,
  answerQuestion,
  checkScript,
  chooseNoVote,
  chooseAbility,
  closeAbility,
  chooseNobody,
  choosePlayer,
  continueGuide,
  createGuide,
  describeGuide,
  describeWinners,
  setBallot,
  reopenDecision,
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
  // The wolves attack somebody (they could skip, but the game goes on with a victim).
  const wolvesToChoose =
    view.state.status === "wolves" &&
    view.selection.ability === null &&
    view.selection.picks.length === 0;
  const prepared =
    view.phase === "act" && (!view.canContinue || wolvesToChoose) ? decide(guide) : guide;
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
    // The wolves may skip (no attack): that is the only way to choose nobody.
    expect(describeGuide(guide).canContinue).toBe(true);
    guide = chooseAbility(guide, "attack");
    // An open list cannot be confirmed without a person.
    expect(describeGuide(guide).canContinue).toBe(false);
    expect(continueGuide(guide)).toBe(guide);
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
    // "Nobody" is no choice of its own in the list.
    expect(describeGuide(guide).canChooseNobody).toBe(false);
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
        // Back moves between the roles: walking forward again reaches the same game state.
        let again = back.guide;
        for (
          let i = 0;
          i < 20 && JSON.stringify(again.session.present) !== JSON.stringify(next.session.present);
          i += 1
        )
          again = forward(again) ?? again;
        expect(again.session.present).toEqual(next.session.present);
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

  it("asks the witch both questions, always: save the victim, then poison somebody", () => {
    const toWitch = () => {
      let guide = game(["witch"], { attackOnFirstNight: true });
      for (let step = 0; step < 200 && guide.session.present.status !== "witch"; step += 1)
        guide = forward(guide)!;
      expect(guide.session.present.status).toBe("witch");
      return continueGuide(guide);
    };
    const guide = toWitch();
    expect(describeGuide(guide).phase).toBe("act");
    // The first question is open: nothing can be confirmed before it is answered.
    expect(describeGuide(guide).question).toBe("heal");
    expect(describeGuide(guide).canContinue).toBe(false);
    // The poison belongs to the second question.
    expect(chooseAbility(guide, "poison")).toBe(guide);
    // "Skip" answers the first question with no; the second one follows.
    const skipped = answerQuestion(guide, "skip");
    expect(describeGuide(skipped).question).toBe("poison");
    expect(describeGuide(skipped).selection.heal).toBe(false);
    expect(describeGuide(skipped).canContinue).toBe(true);
    // The healing potion saves the victim, then the second question follows.
    const healed = answerQuestion(guide, "use");
    expect(describeGuide(healed).question).toBe("poison");
    expect(describeGuide(healed).selection.heal).toBe(true);
    // The second question: "use" opens the list of people; one person and the check mark finish the step.
    let poison = answerQuestion(healed, "use");
    expect(describeGuide(poison).selection.ability).toBe("poison");
    const victim = describeGuide(poison).targets[0]!;
    poison = choosePlayer(poison, victim);
    expect(describeGuide(poison).selection.picks).toEqual([victim]);
    poison = continueGuide(poison);
    expect(describeGuide(poison).phase).toBe("outro");
    expect(poison.trail.at(-1)?.event).toMatchObject({
      heal: true,
      poison: victim,
      type: "potions",
    });
    // "Skip" at the second question finishes the step without poison.
    const done = answerQuestion(skipped, "skip");
    expect(describeGuide(done).phase).toBe("outro");
    expect(done.trail.at(-1)?.event).toMatchObject({ heal: false, poison: null, type: "potions" });
  });

  it('asks the witch about the healing potion even when nobody was attacked, and only "skip" answers it', () => {
    let guide = game(["witch"], { attackOnFirstNight: false });
    for (let step = 0; step < 200 && guide.session.present.status !== "witch"; step += 1)
      guide = forward(guide)!;
    guide = continueGuide(guide);
    expect(describeGuide(guide).question).toBe("heal");
    // There is no victim: the potion cannot be used, the question is asked anyway.
    expect(describeGuide(guide).card?.abilities.find((a) => a.id === "heal")?.available).toBe(
      false,
    );
    expect(answerQuestion(guide, "use")).toBe(guide);
    expect(describeGuide(answerQuestion(guide, "skip")).question).toBe("poison");
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
      // The day cannot be ended before an option is chosen: "no vote" (the reset takes it back).
      expect(view.canContinue).toBe(false);
      expect(continueGuide(guide)).toBe(guide);
      const decided = chooseNoVote(guide);
      expect(describeGuide(decided)).toMatchObject({
        canContinue: true,
        canUndo: true,
        progress: 1,
      });
      const undone = undoSelection(decided);
      expect(describeGuide(undone)).toMatchObject({
        canContinue: false,
        canUndo: false,
        progress: 0,
      });
      const night = continueGuide(decided);
      expect(night.session.present.status).not.toBe("day");
      // The first role of the night is announced, not shown: its intro comes first.
      expect(describeGuide(night).phase).toBe("intro");
      const back = backGuide(night);
      expect(back.ok && back.guide.session.present.status).toBe("day");
    });

    it("names up to three people, confirms with the check mark and takes a vote with one ballot per voter", () => {
      let guide = toDay();
      guide = chooseAbility(guide, "vote");
      const first = describeGuide(guide);
      expect(first.targets.length).toBeGreaterThan(2);
      // Nothing named and the vote open: nothing can be confirmed, and the day cannot end.
      expect(first.canContinue).toBe(false);
      guide = choosePlayer(guide, first.targets[0]!);
      expect(describeGuide(guide).canContinue).toBe(true);
      expect(describeGuide(guide).nextKind).toBe("startVote");
      guide = choosePlayer(guide, describeGuide(guide).targets[0]!);
      guide = choosePlayer(guide, describeGuide(guide).targets[0]!);
      // At most three people.
      expect(describeGuide(guide).targets).toEqual([]);
      const nominees = describeGuide(guide).selection.picks;
      expect(nominees).toHaveLength(3);
      // A named person can be taken back, on its own.
      guide = unchoosePlayer(guide, nominees[1]!);
      expect(describeGuide(guide).selection.picks).toEqual([nominees[0], nominees[2]]);
      guide = continueGuide(guide);
      const vote = describeGuide(guide);
      expect(vote.state.status).toBe("vote");
      expect(vote.card?.actors).toEqual([nominees[0], nominees[2]]);
      expect(vote.nextKind).toBe("endVote");
      // Every voter has a row; the village idiot is marked as set by the narrator.
      expect(vote.ballotRows.length).toBe(vote.state.alive.length);
      const idiot = vote.state.alive.find((p) => p.role === "idiot")?.name;
      if (idiot) expect(vote.ballotRows.find((r) => r.name === idiot)?.setByNarrator).toBe(true);
      // The check mark waits until every voter has chosen.
      expect(vote.canContinue).toBe(false);
      for (const row of vote.ballotRows.slice(0, -1))
        guide = setBallot(guide, row.name, row.choices[0]!);
      expect(describeGuide(guide).canContinue).toBe(false);
      expect(describeGuide(guide).canUndo).toBe(true);
      const last = describeGuide(guide).ballotRows.at(-1)!;
      guide = setBallot(guide, last.name, last.choices[0]!);
      // Tapping the same choice again takes it back; tapping it again sets it.
      guide = setBallot(guide, last.name, last.choices[0]!);
      expect(describeGuide(guide).canContinue).toBe(false);
      guide = setBallot(guide, last.name, last.choices[0]!);
      expect(describeGuide(guide).canContinue).toBe(true);
      // Nobody can vote for himself.
      expect(setBallot(guide, last.name, last.name)).toBe(guide);
      guide = continueGuide(guide);
      expect(["day", "exile", "vote"]).toContain(guide.session.present.status);
    });

    it("takes a named person back and offers a new vote among the tied people after a tie", () => {
      let guide = chooseAbility(toDay([]), "vote");
      guide = choosePlayer(guide, describeGuide(guide).targets[0]!);
      guide = choosePlayer(guide, describeGuide(guide).targets[0]!);
      const [one, two] = describeGuide(guide).selection.picks;
      guide = continueGuide(guide);
      // Half of the voters choose one, the other half the other person: a tie (an even number of voters).
      let view = describeGuide(guide);
      const voters = view.ballotRows;
      voters.forEach((row, index) => {
        const wanted = index % 2 === 0 ? one! : two!;
        const choice = row.choices.includes(wanted) ? wanted : row.choices[0]!;
        guide = setBallot(guide, row.name, choice);
      });
      view = describeGuide(guide);
      expect(view.canContinue).toBe(true);
      guide = continueGuide(guide);
      expect(["vote", "day"]).toContain(guide.session.present.status);
    });
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
      for (const value of values) expect(["double", "setByNarrator"]).toContain(value);
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

  it("goes back from a role to the previous role at once, then to the waiting step", () => {
    let guide = game([], { attackOnFirstNight: true });
    const roles: string[] = [];
    for (let step = 0; step < 200 && roles.length < 2; step += 1) {
      guide = forward(guide)!;
      const view = describeGuide(guide);
      if (view.phase === "intro" && view.card && !roles.includes(view.card.role))
        roles.push(view.card.role);
    }
    expect(roles).toHaveLength(2);
    // One tap on back: from the announcement of role 2 into the step of role 1 (asleep, with its decision).
    const first = backGuide(guide, true);
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    expect(describeGuide(first.guide).card?.role).toBe(roles[0]);
    expect(describeGuide(first.guide).phase).toBe("outro");
    // The next back leaves role 1 as a whole: the waiting step before the first role.
    const second = backGuide(first.guide, true);
    expect(second.ok).toBe(true);
    if (!second.ok) return;
    expect(describeGuide(second.guide).phase).toBe("ready");
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

  it("lets the seer look again after the result: the step is taken back and another person can be chosen", () => {
    let guide = continueGuide(game([], { attackOnFirstNight: true }));
    for (let step = 0; step < 100 && describeGuide(guide).card?.role !== "seer"; step += 1)
      guide = forward(guide)!;
    guide = continueGuide(guide);
    guide = chooseAbility(guide, "inspect");
    const [first, second] = describeGuide(guide).targets;
    guide = choosePlayer(guide, first!);
    guide = continueGuide(guide);
    expect(describeGuide(guide).state.status).toBe("vision");
    guide = chooseAbility(guide, "inspect");
    const view = describeGuide(guide);
    expect(view.state.status).toBe("seer");
    expect(view.selection.picks).toEqual([]);
    guide = choosePlayer(guide, second!);
    guide = continueGuide(guide);
    expect(describeGuide(guide).state.status).toBe("vision");
  });

  it("lets the narrator go back and forth in the role reveal as often as wanted", () => {
    let guide = game();
    for (let round = 0; round < 3; round += 1) {
      const next = continueGuide(guide);
      const back = backGuide(next, true);
      expect(back.ok).toBe(true);
      if (!back.ok) return;
      guide = back.guide;
      const again = continueGuide(guide);
      const twice = backGuide(again, true);
      expect(twice.ok).toBe(true);
    }
  });

  it("lets the investigator skip: the step is complete without any choice, and the ability still works", () => {
    let guide = game(["paranormalInvestigator"], { attackOnFirstNight: true });
    for (
      let step = 0;
      step < 100 && describeGuide(guide).card?.role !== "paranormalInvestigator";
      step += 1
    )
      guide = forward(guide)!;
    guide = continueGuide(guide);
    expect(describeGuide(guide).selection.ability).toBeNull();
    expect(describeGuide(guide).canContinue).toBe(true);
    // Opening the ability asks for a choice again.
    const opened = chooseAbility(guide, "investigate");
    expect(describeGuide(opened).canContinue).toBe(false);
    // Skipping hands "nobody" to the game: no result is shown.
    const done = continueGuide(guide);
    expect(describeGuide(done).state.status).not.toBe("investigation");
  });

  it("takes a decision back with the reset of the summary: the spell is free again", () => {
    let guide = game(["magician"], { attackOnFirstNight: true });
    for (let step = 0; step < 200 && describeGuide(guide).card?.role !== "magician"; step += 1)
      guide = forward(guide)!;
    guide = continueGuide(guide);
    guide = chooseAbility(guide, "kill");
    guide = choosePlayer(guide, describeGuide(guide).targets[0]!);
    // The check mark closes the list of people (the choice stays); "done" confirms the step.
    guide = continueGuide(guide);
    expect(describeGuide(guide).phase).toBe("act");
    expect(describeGuide(guide).selection.picks).toHaveLength(1);
    guide = continueGuide(guide);
    expect(describeGuide(guide).phase).toBe("outro");
    guide = reopenDecision(guide);
    const view = describeGuide(guide);
    expect(view.phase).toBe("act");
    expect(view.selection.picks).toEqual([]);
    expect(view.card?.abilities.every((ability) => ability.available)).toBe(true);
    // Reset does nothing outside the step "asleep".
    expect(reopenDecision(guide)).toBe(guide);
  });

  it("goes back one role at most during the game, until the game has moved on again", () => {
    let guide = game(["witch", "bodyguard"], { attackOnFirstNight: true });
    let intros = 0;
    for (let step = 0; step < 300 && intros < 4; step += 1) {
      const next = forward(guide);
      if (!next) break;
      guide = next;
      if (describeGuide(guide).phase === "intro") intros += 1;
    }
    expect(intros).toBe(4);
    // One role back is possible ...
    const first = backGuide(guide, true);
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    // ... but not a second one: the button is off and back is refused.
    expect(describeGuide(first.guide).canGoBack).toBe(false);
    expect(backGuide(first.guide, true)).toEqual({ ok: false, reason: "limit" });
    // When the game has moved on again, one role back is possible again.
    const ahead = forward(forward(first.guide)!)!;
    expect(describeGuide(ahead).canGoBack).toBe(true);
  });

  it("asks the magician two questions: the healing spell or a death spell first, then a second death spell", () => {
    const toMagician = () => {
      let guide = game(["magician"], { attackOnFirstNight: true });
      for (let step = 0; step < 200 && describeGuide(guide).card?.role !== "magician"; step += 1)
        guide = forward(guide)!;
      // The victim is shown (the check of the first box); then the first question is open.
      return checkScript(continueGuide(guide));
    };
    // The healing spell answers the first question; the second one is a death spell.
    let guide = toMagician();
    expect(describeGuide(guide).question).toBe("heal");
    guide = chooseAbility(guide, "heal");
    expect(describeGuide(guide)).toMatchObject({ question: "poison" });
    // The healing spell cannot be cast in the second question, a death spell can.
    expect(chooseAbility(guide, "heal")).toBe(guide);
    guide = chooseAbility(guide, "kill");
    guide = choosePlayer(guide, describeGuide(guide).targets[0]!);
    // With the healing spell only one more spell is left: no second person.
    expect(describeGuide(guide).targets).toEqual([]);
    guide = continueGuide(guide);
    expect(describeGuide(guide).phase).toBe("outro");
    expect(guide.trail.at(-1)?.event).toMatchObject({ heal: true, type: "castSpells" });
    expect((guide.trail.at(-1)?.event as unknown as { kill: string[] }).kill).toHaveLength(1);
    // A death spell in the first question: the list closes with the check mark and the second question follows.
    guide = toMagician();
    guide = chooseAbility(guide, "kill");
    guide = choosePlayer(guide, describeGuide(guide).targets[0]!);
    // The first question takes one person only.
    expect(describeGuide(guide).targets.length).toBeGreaterThan(0);
    const first = describeGuide(guide).selection.picks[0]!;
    guide = continueGuide(guide);
    expect(describeGuide(guide)).toMatchObject({ phase: "act", question: "poison" });
    expect(describeGuide(guide).selection).toMatchObject({ ability: null, picks: [first] });
    // The second death spell adds one more person; the person of the first spell cannot be taken back here.
    guide = chooseAbility(guide, "kill");
    expect(describeGuide(guide).selection.picks).toEqual([first]);
    expect(unchoosePlayer(guide, first)).toBe(guide);
    guide = choosePlayer(guide, describeGuide(guide).targets[0]!);
    expect(describeGuide(guide).selection.picks).toHaveLength(2);
    guide = continueGuide(guide);
    expect(describeGuide(guide).phase).toBe("outro");
    expect((guide.trail.at(-1)?.event as unknown as { kill: string[] }).kill).toHaveLength(2);
    // Skipping both questions: nothing is cast.
    guide = toMagician();
    guide = answerQuestion(guide, "skip");
    guide = answerQuestion(guide, "skip");
    expect(describeGuide(guide).phase).toBe("outro");
    expect(guide.trail.at(-1)?.event).toMatchObject({ heal: false, kill: [], type: "castSpells" });
    // Undo: the second question is asked again, the first answer stays.
    guide = toMagician();
    guide = chooseAbility(guide, "kill");
    guide = choosePlayer(guide, describeGuide(guide).targets[0]!);
    guide = continueGuide(guide);
    guide = answerQuestion(guide, "use");
    guide = choosePlayer(guide, describeGuide(guide).targets[0]!);
    guide = undoSelection(guide);
    expect(describeGuide(guide).selection.picks).toHaveLength(1);
  });

  it("takes the decisions of the witch back one by one: the last question is asked again, then the one before", () => {
    let guide = game(["witch"], { attackOnFirstNight: true });
    for (let step = 0; step < 200 && guide.session.present.status !== "witch"; step += 1)
      guide = forward(guide)!;
    guide = continueGuide(guide);
    guide = answerQuestion(guide, "use");
    guide = answerQuestion(guide, "use");
    guide = choosePlayer(guide, describeGuide(guide).targets[0]!);
    guide = continueGuide(guide);
    expect(describeGuide(guide).phase).toBe("outro");
    // The reset of the summary: only the poison is asked again, the answer to the first question stays.
    guide = reopenDecision(guide);
    expect(describeGuide(guide)).toMatchObject({ phase: "act", question: "poison" });
    expect(describeGuide(guide).selection).toMatchObject({ heal: true, ability: null, picks: [] });
    // One more step back: the first question.
    expect(describeGuide(guide).canUndo).toBe(true);
    guide = undoSelection(guide);
    expect(describeGuide(guide)).toMatchObject({ question: "heal" });
    expect(describeGuide(guide).selection.heal).toBe(false);
    expect(describeGuide(guide).canUndo).toBe(false);
  });
});
