import { expect, it } from "vitest";
import {
  answerQuestion,
  chooseAbility,
  choosePlayer,
  continueGuide,
  createGuide,
  describeGuide,
} from "./narratorGuide";
import { createWerewolfSession } from "./session";
import { describePlayers } from "./selectors";
import { createWerewolf, transitionWerewolf, type WerewolfState } from "./stateMachine";

/** The overview of all players is up to date after EVERY decision, not only when the next role is called. */

const names = Array.from({ length: 12 }, (_, index) => "P" + index).join(",");
const base = (roles: Parameters<typeof createWerewolf>[3] = []) =>
  createWerewolf(names, "Max", () => 0.3, roles, {
    amulet: true,
    attackOnFirstNight: true,
    wolfCount: 2,
  })!;
const villagers = (state: WerewolfState) => state.players.filter((p) => p.role === "villager");

it("shows the lovers in the overview as soon as the list of Cupid is confirmed", () => {
  const start = base(["cupid"]);
  const [one, two] = villagers(start);
  const state = { ...start, status: "cupid" } as unknown as WerewolfState;
  let guide = continueGuide(createGuide(createWerewolfSession(state)));
  guide = chooseAbility(guide, "bond");
  guide = choosePlayer(choosePlayer(guide, one!.name), two!.name);
  // The list is still open: nothing is decided yet.
  expect(describeGuide(guide).overviewState.lovers).toBeNull();
  // The list is confirmed: the lovers are in the overview, the game itself waits for the end of the step.
  guide = continueGuide(guide);
  const view = describeGuide(guide);
  expect(view.overviewState.lovers).toEqual([one!.name, two!.name]);
  expect(view.state.lovers).toBeNull();
  expect(describePlayers(view.overviewState).find((p) => p.name === one!.name)?.partner).toBe(
    two!.name,
  );
});

it("shows the new holder of the amulet in the overview once the holder has decided", () => {
  const start = base();
  const [holder, other] = villagers(start);
  const state = {
    ...start,
    amulet: { holder: holder!.name, mustPass: true },
    night: 2,
    poisoned: null,
    status: "amuletPass",
    victim: null,
  } as unknown as WerewolfState;
  let guide = continueGuide(createGuide(createWerewolfSession(state)));
  guide = choosePlayer(chooseAbility(guide, "passAmulet"), other!.name);
  expect(describeGuide(guide).overviewState.amulet?.holder).toBe(holder!.name);
  guide = continueGuide(guide);
  const view = describeGuide(guide);
  expect(view.overviewState.amulet?.holder).toBe(other!.name);
  expect(view.state.amulet?.holder).toBe(holder!.name);
});

it("shows the person the witch saved as saved in the overview after the first answer", () => {
  const start = base(["witch"]);
  const victim = villagers(start)[0]!;
  const state = {
    ...start,
    status: "witch",
    victim,
    wolfTarget: victim,
  } as unknown as WerewolfState;
  let guide = continueGuide(createGuide(createWerewolfSession(state)));
  const toneOf = (view: ReturnType<typeof describeGuide>) =>
    describePlayers(view.overviewState).find((p) => p.name === victim.name)?.tone;
  // Before the answer the victim is marked to die.
  expect(toneOf(describeGuide(guide))).toBe("attacked");
  // The witch heals: the overview shows him saved at once, the step itself is not finished.
  guide = chooseAbility(guide, "heal");
  expect(describeGuide(guide).state.status).toBe("witch");
  expect(toneOf(describeGuide(guide))).toBe("saved");
  // The healed person carries the mark of the healing until the next night, also through the day.
  const healed = (current: WerewolfState) =>
    describePlayers(current)
      .filter((p) => p.healed)
      .map((p) => p.name);
  const afterHeal = transitionWerewolf(state, {
    heal: true,
    night: state.night,
    poison: null,
    type: "potions",
  });
  expect(healed(afterHeal)).toEqual([victim.name]);
  expect(healed({ ...afterHeal, status: "day" } as unknown as WerewolfState)).toEqual([
    victim.name,
  ]);
  expect(healed(state)).toEqual([]);
  // (The second question still stands.)
  expect(describeGuide(guide).question).toBe("poison");
  void answerQuestion;
});

it("keeps the victims of the night marked, not dead, in the overview until the morning is announced", () => {
  // Without the amulet the witch is the last role of the night: her decision leads to the morning.
  const start = createWerewolf(names, "Max", () => 0.3, ["witch"], {
    attackOnFirstNight: true,
    wolfCount: 2,
  })!;
  const [victim, poisoned] = villagers(start);
  const state = {
    ...start,
    status: "witch",
    victim,
    wolfTarget: victim,
  } as unknown as WerewolfState;
  let guide = continueGuide(createGuide(createWerewolfSession(state)));
  // The witch does not heal and poisons a second person; the last role of the night is decided.
  guide = answerQuestion(guide, "skip");
  guide = choosePlayer(chooseAbility(guide, "poison"), poisoned!.name);
  guide = continueGuide(guide);
  const view = describeGuide(guide);
  expect(view.phase).toBe("outro");
  const tones = (announce: boolean) =>
    describePlayers(view.overviewState, announce)
      .filter((person) => [victim!.name, poisoned!.name].includes(person.name))
      .map((person) => person.tone);
  // The night is not over: both are marked to die (red), nobody is announced dead yet.
  expect(tones(false)).toEqual(["attacked", "attacked"]);
  // Only the announcement of the morning shows them as dead.
  expect(tones(true)).toEqual(["dead", "dead"]);
});

it("marks the person the seer looked at as looked at through the night and the day, until the next night", () => {
  const start = base();
  const target = villagers(start)[0]!;
  const state = { ...start, status: "seer", victim: null } as unknown as WerewolfState;
  const looked = (current: WerewolfState) =>
    describePlayers(current)
      .filter((person) => person.inspected)
      .map((person) => person.name);
  // Before the choice nobody is marked.
  expect(looked(state)).toEqual([]);
  // The choice is made (the overview shows it at once, still inside the step of the seer).
  let guide = continueGuide(createGuide(createWerewolfSession(state)));
  guide = choosePlayer(chooseAbility(guide, "inspect"), target.name);
  expect(looked(describeGuide(guide).overviewState)).toEqual([]);
  guide = continueGuide(guide);
  expect(looked(describeGuide(guide).overviewState)).toEqual([target.name]);
  // The game itself remembers it until the next night starts.
  const after = transitionWerewolf(state, {
    night: state.night,
    target: target.name,
    type: "inspect",
  });
  expect(looked(after)).toEqual([target.name]);
  const seer = start.players.find((p) => p.role === "seer")!;
  expect(after.inspections).toEqual([{ by: seer.name, kind: "seer", target: target.name }]);
  // The mark stays in the day.
  expect(looked({ ...after, status: "day" } as unknown as WerewolfState)).toEqual([target.name]);
});

it("marks the mayor of a game with the double vote, and nobody in a game with the hammer", () => {
  const mayorsOf = (mayor: "doubleVote" | "hammer") => {
    const state = createWerewolf(names, "Max", () => 0.3, ["mayor"], { mayor, wolfCount: 2 })!;
    return describePlayers(state)
      .filter((person) => person.twoVotes)
      .map((person) => person.role);
  };
  expect(mayorsOf("doubleVote")).toEqual(["mayor"]);
  expect(mayorsOf("hammer")).toEqual([]);
});

it("keeps every mark of the seer until she leaves, and the apprentice starts anew", () => {
  const start = createWerewolf(names, "Max", () => 0.3, ["apprenticeSeer"], { wolfCount: 2 })!;
  const seer = start.players.find((p) => p.role === "seer")!;
  const apprentice = start.players.find((p) => p.role === "apprenticeSeer")!;
  const [one, two, three] = villagers(start);
  const looked = (current: WerewolfState) =>
    describePlayers(current)
      .filter((person) => person.inspected)
      .map((person) => person.name);
  const marks = {
    ...start,
    inspections: [
      { by: seer.name, kind: "seer", target: one!.name },
      { by: seer.name, kind: "seer", target: two!.name },
    ],
  } as unknown as WerewolfState;
  // Both people she looked at carry the mark, also in the next nights.
  expect(looked(marks)).toEqual([one!.name, two!.name]);
  // The seer leaves the game: her marks are gone.
  const gone = {
    ...marks,
    alive: marks.alive.filter((p) => p.name !== seer.name),
  } as WerewolfState;
  expect(looked(gone)).toEqual([]);
  // The apprentice looks at somebody: only his own mark shows.
  const anew = {
    ...gone,
    inspections: [...gone.inspections, { by: apprentice.name, kind: "seer", target: three!.name }],
  } as unknown as WerewolfState;
  expect(looked(anew)).toEqual([three!.name]);
});

it("marks the three people the investigator examined until he leaves", () => {
  const start = createWerewolf(names, "Max", () => 0.3, ["paranormalInvestigator"], {
    wolfCount: 2,
  })!;
  const investigator = start.players.find((p) => p.role === "paranormalInvestigator")!;
  const target = start.alive[5]!;
  const state = { ...start, status: "investigator", victim: null } as unknown as WerewolfState;
  const after = transitionWerewolf(state, {
    night: state.night,
    target: target.name,
    type: "investigate",
  });
  const seats = start.alive.map((p) => p.name);
  const expected = [4, 5, 6].map((index) => seats[index]);
  const examined = (current: WerewolfState) =>
    describePlayers(current)
      .filter((person) => person.investigated)
      .map((person) => person.name);
  expect(examined(after)).toEqual(expected);
  expect(after.inspections.every((entry) => entry.by === investigator.name)).toBe(true);
  // He leaves the game: the marks are gone.
  const gone = {
    ...after,
    alive: after.alive.filter((p) => p.name !== investigator.name),
  } as WerewolfState;
  expect(examined(gone)).toEqual([]);
});

it("marks the person the magician saved with the healing spell, apart from the healing potion of the witch", () => {
  const start = createWerewolf(names, "Max", () => 0.3, ["magician"], {
    attackOnFirstNight: true,
    wolfCount: 2,
  })!;
  const victim = villagers(start)[0]!;
  const state = {
    ...start,
    status: "magician",
    victim,
    wolfTarget: victim,
  } as unknown as WerewolfState;
  const after = transitionWerewolf(state, {
    heal: true,
    kill: [],
    night: state.night,
    type: "castSpells",
  });
  const view = describePlayers(after).find((person) => person.name === victim.name)!;
  expect(view.spellHealed).toBe(true);
  // The potion of the witch is another state with another drawing.
  expect(view.healed).toBe(false);
});

it("names the ability that hit each victim: the attack of the wolves, the poison, the vote", () => {
  const start = createWerewolf(names, "Max", () => 0.3, ["witch"], {
    attackOnFirstNight: true,
    wolfCount: 2,
  })!;
  const [victim, poisoned, voted] = villagers(start);
  const night = {
    ...start,
    poisoned,
    status: "magician",
    victim,
    wolfTarget: victim,
  } as unknown as WerewolfState;
  const causes = (state: WerewolfState, name: string) =>
    describePlayers(state).find((person) => person.name === name)?.causes;
  expect(causes(night, victim!.name)).toEqual(["wolves"]);
  expect(causes(night, poisoned!.name)).toEqual(["witchPoison"]);
  expect(causes(night, voted!.name)).toEqual([]);
  // Somebody who died: the causes come from the history of the game.
  const afterVote = {
    ...start,
    alive: start.alive.filter((person) => person.name !== voted!.name),
    history: [
      {
        diedMasked: false,
        id: 1,
        kind: "death",
        night: 1,
        period: "day",
        phase: "exile",
        player: voted!.name,
        role: voted!.role,
        sources: [{ actors: [], cause: "vote", originNight: 1 }],
      },
    ],
    status: "day",
  } as unknown as WerewolfState;
  expect(causes(afterVote, voted!.name)).toEqual(["vote"]);
});
