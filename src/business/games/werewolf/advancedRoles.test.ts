import { expect, it } from "vitest";
import {
  createWerewolf,
  transitionWerewolf,
  wakingPlayers,
  werewolfAnnouncement,
  type WerewolfEvent,
  type WerewolfSettings,
  type WerewolfSpecialRole,
  type WerewolfState,
} from "./stateMachine";

const names = ["Ada", "Bea", "Cam", "Dan", "Eva", "Flo"];
const act = (state: WerewolfState, ...events: WerewolfEvent[]) =>
  events.reduce(transitionWerewolf, state);

function deal(roles: readonly WerewolfSpecialRole[], settings: Partial<WerewolfSettings> = {}) {
  const initial = createWerewolf(names.join(","), "Narrator", () => 0.99, roles, settings)!;
  return act(initial, ...names.map((player) => ({ type: "roleSeen", player }) as const));
}

function couple(state: WerewolfState, players: readonly [string, string]) {
  return act(state, { type: "bond", night: 1, players }, { type: "loversReady", night: 1 });
}

function see(state: WerewolfState, target = "Ada") {
  const { night } = state;
  return act(state, { type: "inspect", night, target }, { type: "closeVision", night });
}

const wolves = (state: WerewolfState) => act(state, { type: "wolvesReady", night: 1 });
const day = (state: WerewolfState) => act(state, { type: "announceMorning", night: state.night });
const dusk = (state: WerewolfState) => act(state, { type: "endDay", night: state.night });
/** The werewolves have to attack: where a test used to attack nobody, the first living non-wolf is the victim. */
function firstVictim(state: WerewolfState): string {
  return state.alive.find((player) => player.role !== "wolf")!.name;
}

const attack = (state: WerewolfState, target: string | null) =>
  act(state, { type: "attack", night: state.night, target: target ?? firstVictim(state) });
const silence = (state: WerewolfState, target: string | null) =>
  act(state, { type: "silence", night: state.night, target });
const hammer = (state: WerewolfState, target: string | null) =>
  act(state, { type: "hammer", night: state.night, target });
const nominate = (state: WerewolfState, ...nominees: string[]) =>
  act(state, {
    type: "nominate",
    night: state.night,
    nominees: nominees.length ? nominees : ["Flo"],
  });
const vote = (state: WerewolfState, ballots: Record<string, string>, nomination = 1) =>
  act(state, { type: "vote", night: state.night, nomination, ballots });

it("pairs distinct living players exactly once in the first night", () => {
  const state = deal(["cupid"]);
  expect(wakingPlayers(state)).toEqual(["Cam"]);
  expect(act(state, { type: "loversReady", night: 1 })).toBe(state);
  expect(act(state, { type: "bond", night: 1, players: ["Cam", "Cam"] })).toBe(state);
  expect(act(state, { type: "bond", night: 1, players: ["Cam", "Missing"] })).toBe(state);
  const paired = act(state, { type: "bond", night: 1, players: ["Cam", "Dan"] });
  expect(wakingPlayers(paired)).toEqual(["Cam", "Dan"]);
  expect(act(paired, { type: "bond", night: 1, players: ["Ada", "Bea"] })).toBe(paired);
  expect(act(paired, { type: "loversReady", night: 1 }).status).toBe("wolves");
  expect(
    createWerewolf(names.join(","), "Narrator", () => 0.99, [
      "bodyguard",
      "witch",
      "hunter",
      "cupid",
      "idiot",
    ]),
  ).toBeNull();
});

it("awards the wolves the win when a mixed couple is the last two", () => {
  let state = day(see(wolves(couple(deal(["cupid"]), ["Ada", "Bea"]))));
  for (const victim of ["Cam", "Dan", "Eva"]) {
    state = day(see(attack(dusk(state), victim)));
    expect(state.status).toBe("day");
  }
  expect(state.alive.map((player) => player.name)).toEqual(["Ada", "Bea", "Flo"]);
  state = day(see(attack(dusk(state), "Flo")));
  expect(state).toMatchObject({ status: "finished", winner: "wolves" });
});

it("ends the game at two wolves against two village players with a surviving mixed couple", () => {
  const seats = [...names, "Gia", "Hal", "Ivy"];
  const initial = createWerewolf(seats.join(","), "Narrator", () => 0.99, ["cupid", "nightGuest"])!;
  const dealt = act(initial, ...seats.map((player) => ({ type: "roleSeen", player }) as const));
  let state = couple(dealt, ["Ada", "Eva"]);
  state = day(see(wolves(act(state, { type: "stayWith", night: 1, target: "Ada" }))));

  for (const victim of ["Dan", "Flo", "Gia", "Hal", "Ivy"]) {
    state = dusk(state);
    state = act(state, {
      type: "stayWith",
      night: state.night,
      target: state.night % 2 === 0 ? "Bea" : "Ada",
    });
    state = day(see(attack(state, victim)));
  }

  expect(state.alive.map(({ name }) => name)).toEqual(["Ada", "Bea", "Cam", "Eva"]);
  expect(state.lovers).toEqual(["Ada", "Eva"]);
  expect(state).toMatchObject({ status: "finished", winner: "wolves" });
});

it("announces both partners once and resolves the hunter before checking a winner", () => {
  let state = day(see(wolves(couple(deal(["cupid", "hunter"]), ["Dan", "Flo"]))));
  state = see(attack(dusk(state), "Flo"));
  // By the time of death: the victim of the wolves first, the lover right after.
  expect(werewolfAnnouncement(state)).toEqual([{ name: "Flo" }, { name: "Dan" }]);
  state = day(state);
  expect(state).toMatchObject({ status: "hunter", hunter: { name: "Dan" } });
  expect(act(state, { type: "shot", night: 2, target: "Ada" })).toMatchObject({
    winner: "village",
  });
});

it("makes the village win when the last wolf dies together with a lover", () => {
  let state = day(see(wolves(couple(deal(["cupid", "hunter"]), ["Ada", "Eva"]))));
  state = day(see(attack(dusk(state), "Dan")));
  const finished = act(state, { type: "shot", night: 2, target: "Eva" });
  expect(finished).toMatchObject({ status: "finished", winner: "village" });
  expect(finished.alive.map((player) => player.name)).toEqual(["Bea", "Cam", "Flo"]);
});

it("counts every ballot, the secret double vote of the mayor, and a tie votes again among the tied people", () => {
  const state = nominate(day(see(wolves(deal(["idiot", "mayor"])))), "Flo", "Eva");
  expect(state).toMatchObject({ status: "vote", candidates: ["Flo", "Eva"], round: 1 });
  // Every voter needs a ballot; nobody votes for himself; only the candidates can be chosen.
  expect(vote(state, {})).toBe(state);
  const full = { Ada: "Flo", Bea: "Flo", Cam: "Eva", Dan: "Eva", Eva: "Flo", Flo: "Eva" };
  expect(vote(state, { ...full, Eva: "Eva" })).toBe(state);
  expect(vote(state, { ...full, Ada: "Dan" })).toBe(state);
  expect(vote(state, { ...full, Nobody: "Flo" })).toBe(state);
  expect(vote(state, { ...full, Flo: undefined as unknown as string })).toBe(state);
  expect(vote(state, full, 2)).toBe(state);
  // Dan is the mayor: his vote counts twice, so Eva has 4 votes (Cam, Dan twice, Flo) against 3 for Flo.
  const exile = vote(state, full);
  expect(exile).toMatchObject({ status: "exile", victim: { name: "Eva" } });
  expect(werewolfAnnouncement(exile)).toEqual([{ name: "Eva" }]);
  // Dan votes for Flo instead: Flo has 5 votes (Dan counts twice), Eva 2.
  expect(vote(state, { ...full, Dan: "Flo" })).toMatchObject({
    status: "exile",
    victim: { name: "Flo" },
  });
});

it("votes again once after a tie among the tied people, and a second tie leaves everybody in the game", () => {
  const state = nominate(day(see(wolves(deal([])))), "Flo", "Eva");
  // Six voters without a mayor: 3 votes for each.
  const tied = { Ada: "Flo", Bea: "Flo", Cam: "Eva", Dan: "Eva", Eva: "Flo", Flo: "Eva" };
  const again = vote(state, tied);
  expect(again).toMatchObject({ status: "vote", candidates: ["Flo", "Eva"], round: 2 });
  const second = vote(again, tied);
  expect(second.status).toBe("day");
  expect(second.alive).toHaveLength(6);
  // After the new vote one of them is out.
  expect(vote(again, { ...tied, Cam: "Flo" })).toMatchObject({
    status: "exile",
    victim: { name: "Flo" },
  });
});

it("applies silence to the vote: the silenced person can be named but does not vote", () => {
  let state = see(wolves(deal(["spellcaster", "idiot"])));
  expect(wakingPlayers(state)).toEqual(["Cam"]);
  expect(silence(state, "Cam")).toBe(state);
  expect(silence(state, "Unknown")).toBe(state);
  state = day(silence(state, "Dan"));
  // One to three different living people can be named; the silenced person is allowed.
  expect(act(state, { type: "nominate", night: 1, nominees: [] })).toBe(state);
  expect(act(state, { type: "nominate", night: 1, nominees: ["Ada", "Bea", "Cam", "Eva"] })).toBe(
    state,
  );
  expect(act(state, { type: "nominate", night: 1, nominees: ["Ada", "Ada"] })).toBe(state);
  expect(act(state, { type: "nominate", night: 1, nominees: ["Nobody"] })).toBe(state);
  const mutedTarget = nominate(state, "Dan");
  expect(mutedTarget.status).toBe("vote");
  // Dan is silenced and does not vote: a ballot of his is refused, the others vote.
  const others = { Ada: "Dan", Bea: "Dan", Cam: "Dan", Eva: "Dan", Flo: "Dan" };
  expect(vote(mutedTarget, { ...others, Dan: "Dan" })).toBe(mutedTarget);
  expect(vote(mutedTarget, { Ada: "Dan" })).toBe(mutedTarget);
  expect(vote(mutedTarget, others).status).toBe("exile");
  state = see(attack(dusk(state), "Flo"));
  expect(silence(state, "Dan")).toBe(state);
  expect(silence(state, null)).toBe(state);
  expect(day(silence(state, "Eva")).silencedPlayer).toBe("Eva");
  const self = see(wolves(deal(["spellcaster"], { allowSelfSilence: true })));
  expect(day(silence(self, "Cam")).silencedPlayer).toBe("Cam");
});

it("places the private hammer after all attacks and permits a dying mayor to act", () => {
  const first = deal(["mayor"], { mayor: "hammer" });
  const next = see(attack(dusk(day(see(wolves(first)))), "Cam"));
  expect(next.status).toBe("mayor");
  expect(wakingPlayers(next)).toEqual(["Cam"]);
  expect(hammer(next, "Cam")).toBe(next);
  expect(hammer(next, "Unknown")).toBe(next);
  expect(hammer(next, null)).toMatchObject({ status: "morning", hammerUsed: false });
  const hit = hammer(next, "Ada");
  expect(hit.alive).toHaveLength(6);
  // The wolves first, then the hammer.
  expect(werewolfAnnouncement(hit)).toEqual([{ name: "Cam" }, { name: "Ada" }]);
  expect(day(hit)).toMatchObject({ status: "finished", winner: "village" });
  const miss = hammer(next, "Dan");
  expect(werewolfAnnouncement(miss)).toEqual([{ name: "Cam" }]);
  // The mayor is dead: the night goes on without a call for him.
  const nextNight = see(attack(dusk(day(miss)), null));
  expect(nextNight.status).toBe("morning");
  expect(hammer(nextNight, "Ada")).toBe(nextNight);
});

it("resolves the hammer only at morning and keeps spent living calls as cover", () => {
  const table = [...names, "Gia", "Hugo", "Ira"];
  let state = createWerewolf(table.join(","), "Narrator", () => 0.99, ["mayor"], {
    mayor: "hammer",
  })!;
  state = act(state, ...table.map((player) => ({ type: "roleSeen", player }) as const));
  state = see(attack(dusk(day(see(wolves(state)))), "Ira"));
  const hit = hammer(state, "Ada");
  expect(hit.alive.map((p) => p.name)).toContain("Ada");
  expect(werewolfAnnouncement(hit)).toEqual([{ name: "Ira" }, { name: "Ada" }]);
  const nextNight = see(attack(dusk(day(hit)), null), "Bea");
  // The used hammer: the mayor is called with his whole script all the same (skipped), and the hammer is refused.
  expect(nextNight.status).toBe("mayor");
  expect(hammer(nextNight, "Bea")).toBe(nextNight);
});

it("defers a hunter linked to a failed hammer until morning", () => {
  let state = dusk(
    day(
      see(wolves(couple(deal(["cupid", "mayor", "hunter"], { mayor: "hammer" }), ["Dan", "Eva"]))),
    ),
  );
  state = hammer(see(attack(state, "Flo")), "Flo");
  expect(state.status).toBe("morning");
  state = day(state);
  expect(state).toMatchObject({ status: "hunter", hunter: { name: "Eva" } });
  expect(act(state, { type: "shot", night: 2, target: "Ada" })).toMatchObject({
    winner: "village",
  });
});

it("orders simultaneous announcements by seats rather than cause", () => {
  const first = deal(["mayor"], { mayor: "hammer" });
  const next = see(attack(dusk(day(see(wolves(first)))), "Bea"));
  expect(werewolfAnnouncement(hammer(next, "Flo"))).toEqual([{ name: "Bea" }, { name: "Cam" }]);
});

it("resolves eight distinct deaths in one night including the morning hunter shot", () => {
  const seats = Array.from({ length: 18 }, (_, index) => "Player " + (index + 1));
  const initial = createWerewolf(
    seats.join(","),
    "Narrator",
    () => 0.99,
    ["cupid", "mayor", "hunter", "witch", "magician", "toughGuy"],
    { wolfCount: 4, mayor: "hammer", attackOnFirstNight: false, amulet: false, drunk: false },
  )!;
  const named = (role: string) => initial.players.find((player) => player.role === role)!.name;
  const villagers = initial.players.filter((player) => player.role === "villager");
  const partner = villagers[0]!.name;
  const wrongTarget = villagers[1]!.name;
  const poisoned = villagers[2]!.name;
  const spellTargets = [villagers[3]!.name, villagers[4]!.name];
  const shotTarget = villagers[5]!.name;
  const passHealers = (state: WerewolfState) =>
    act(
      state,
      { type: "potions", night: state.night, heal: false, poison: null },
      { type: "castSpells", night: state.night, heal: false, kill: [] },
    );

  let state = act(initial, ...seats.map((player) => ({ type: "roleSeen", player }) as const));
  state = couple(state, [named("mayor"), partner]);
  state = day(passHealers(see(wolves(state), named("wolf"))));
  expect(state.alive).toHaveLength(18);

  state = day(
    hammer(passHealers(see(attack(dusk(state), named("toughGuy")), named("wolf"))), null),
  );
  expect(state).toMatchObject({ status: "day", night: 2, toughGuyDiesOn: 3 });
  expect(state.alive).toHaveLength(18);
  expect(state.spellsRemaining).toBe(2);
  expect(state.potions.poison).toBe(true);

  state = dusk(state);
  expect(state.night).toBe(3);
  state = see(attack(state, named("hunter")), named("wolf"));
  expect(state).toMatchObject({ status: "witch", victim: { name: named("hunter") } });
  state = act(state, { type: "potions", night: 3, heal: false, poison: poisoned });
  expect(state).toMatchObject({ status: "magician", spellsRemaining: 2 });
  state = act(state, { type: "castSpells", night: 3, heal: false, kill: spellTargets });
  expect(state.status).toBe("mayor");
  state = hammer(state, wrongTarget);
  expect(state.alive).toHaveLength(18);
  const morningNames = werewolfAnnouncement(state).map((player) => player.name);
  expect(new Set(morningNames).size).toBe(7);

  state = day(state);
  expect(state).toMatchObject({ status: "hunter", night: 3, hunter: { name: named("hunter") } });
  expect(state.alive).toHaveLength(11);
  state = act(state, { type: "shot", night: 3, target: shotTarget });
  expect(state).toMatchObject({ status: "day", night: 3 });
  expect(state.alive).toHaveLength(10);
  const deadNames = initial.players
    .filter((player) => !state.alive.some((living) => living.name === player.name))
    .map((player) => player.name);
  expect(deadNames.sort()).toEqual(
    [
      named("mayor"),
      partner,
      named("hunter"),
      poisoned,
      ...spellTargets,
      named("toughGuy"),
      shotTarget,
    ].sort(),
  );
  expect(
    new Set([...morningNames, ...werewolfAnnouncement(state).map((player) => player.name)]).size,
  ).toBe(8);
  expect(state.alive.map((player) => player.name)).toContain(wrongTarget);
});

it("lets the witch heal a mayor who is the wolf victim, who still dies for a wrong hammer", () => {
  let state = deal(["mayor", "witch"], { mayor: "hammer" });
  // The first night: nobody uses anything.
  state = see(wolves(state));
  state = act(state, { type: "potions", night: 1, heal: false, poison: null });
  state = dusk(day(state));
  // The second night: the wolves attack the mayor, the witch heals him.
  state = see(attack(state, "Cam"));
  expect(state).toMatchObject({ status: "witch", wolfTarget: { name: "Cam" } });
  state = act(state, { type: "potions", night: 2, heal: true, poison: null });
  expect(state).toMatchObject({ status: "mayor", victim: null, potions: { heal: false } });
  // The healed mayor strikes a villager: the penalty cannot be healed and he dies, the target stays alive.
  const morning = hammer(state, "Eva");
  expect(werewolfAnnouncement(morning)).toEqual([{ name: "Cam" }]);
  const next = day(morning);
  expect(next.alive.map((player) => player.name)).toEqual(["Ada", "Bea", "Dan", "Eva", "Flo"]);
});
