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
const attack = (state: WerewolfState, target: string) =>
  act(state, { type: "attack", night: state.night, target });
const silence = (state: WerewolfState, target: string | null) =>
  act(state, { type: "silence", night: state.night, target });
const hammer = (state: WerewolfState, target: string | null) =>
  act(state, { type: "hammer", night: state.night, target });
const nominate = (state: WerewolfState, target = "Flo") =>
  act(state, { type: "nominate", night: state.night, target, nominator: "Ada", seconder: "Bea" });
const vote = (state: WerewolfState, yesVoters: readonly string[], nomination = 1) =>
  act(state, { type: "vote", night: state.night, nomination, yesVoters });

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
  expect(werewolfAnnouncement(state)).toEqual([
    { name: "Dan", role: "hunter" },
    { name: "Flo", role: "villager" },
  ]);
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

it("counts the village idiot's mandatory yes and the secret double vote", () => {
  const state = nominate(day(see(wolves(deal(["idiot", "mayor"])))));
  expect(act(state, { type: "vote", night: 1, nomination: 1, yes: 5 })).toBe(state);
  expect(vote(state, ["Ada", "Ada"])).toBe(state);
  expect(vote(state, ["Nobody"])).toBe(state);
  const ties = vote(state, ["Ada", "Bea"]);
  expect(ties.status).toBe("day");
  // Dan's vote counts twice. Cam must vote yes, making four of seven weighted votes.
  const exile = vote(state, ["Ada", "Dan"]);
  expect(exile).toMatchObject({ status: "exile", victim: { name: "Flo" } });
  expect(werewolfAnnouncement(exile)).toEqual([{ name: "Flo", role: "villager" }]);
});

it("applies silence to nominations and voting, including the village idiot's mandatory yes", () => {
  let state = see(wolves(deal(["spellcaster", "idiot"])));
  expect(wakingPlayers(state)).toEqual(["Cam"]);
  expect(silence(state, "Cam")).toBe(state);
  expect(silence(state, "Unknown")).toBe(state);
  state = day(silence(state, "Dan"));
  expect(
    act(state, { type: "nominate", night: 1, target: "Eva", nominator: "Dan", seconder: "Ada" }),
  ).toBe(state);
  expect(
    act(state, { type: "nominate", night: 1, target: "Eva", nominator: "Ada", seconder: "Dan" }),
  ).toBe(state);
  const mutedTarget = nominate(state, "Dan");
  expect(mutedTarget.status).toBe("vote");
  expect(vote(mutedTarget, ["Ada", "Dan"])).toBe(mutedTarget);
  expect(vote(mutedTarget, ["Ada", "Bea"]).status).toBe("day");
  expect(vote(mutedTarget, ["Ada", "Bea", "Cam"]).status).toBe("exile");
  state = see(attack(dusk(state), "Flo"));
  expect(silence(state, "Dan")).toBe(state);
  expect(day(silence(state, null)).silencedPlayer).toBeNull();
  const self = see(wolves(deal(["spellcaster"], { allowSelfSilence: true })));
  expect(day(silence(self, "Cam")).silencedPlayer).toBe("Cam");
});

it("keeps the hammer private and allows it after a skipped day", () => {
  const config = { mayor: "hammer", revealRoles: false } as const;
  const first = deal(["mayor"], config);
  expect(first.status).toBe("wolves");
  const next = dusk(day(see(wolves(first))));
  expect(wakingPlayers(next)).toEqual(["Cam"]);
  expect(hammer(next, "Cam")).toBe(next);
  expect(hammer(next, "Unknown")).toBe(next);
  const waiting = hammer(next, null);
  expect(waiting).toMatchObject({ status: "wolves", hammerUsed: false });
  expect(dusk(day(see(attack(waiting, "Flo")))).status).toBe("mayor");
  const hit = hammer(next, "Ada");
  expect(hit).toMatchObject({ status: "morning", hammerUsed: true });
  expect(werewolfAnnouncement(hit)).toEqual([{ name: "Ada", role: null }]);
  expect(day(hit)).toMatchObject({ status: "finished", winner: "village" });

  let miss = hammer(next, "Dan");
  expect(miss.alive.map((player) => player.name)).toContain("Dan");
  expect(wakingPlayers(miss)).toEqual(["Ada"]);
  miss = see(attack(miss, "Flo"));
  expect(werewolfAnnouncement(miss)).toEqual([
    { name: "Cam", role: null },
    { name: "Flo", role: null },
  ]);
  const nextNight = dusk(day(miss));
  expect(nextNight.status).toBe("mayor");
  expect(wakingPlayers(nextNight)).toEqual([]);
  expect(hammer(nextNight, null).status).toBe("wolves");
});

it("withdraws a hit wolf before the other wolves act and keeps the empty mayor phase", () => {
  const table = [...names, "Gia", "Hugo", "Ira"];
  let state = createWerewolf(table.join(","), "Narrator", () => 0.99, ["mayor"], {
    mayor: "hammer",
  })!;
  state = act(state, ...table.map((player) => ({ type: "roleSeen", player }) as const));
  state = dusk(day(see(wolves(state))));
  state = hammer(state, "Ada");
  expect(wakingPlayers(state)).toEqual(["Bea"]);
  expect(hammer(state, "Bea")).toBe(state);
  state = see(attack(state, "Ira"), "Bea");
  expect(werewolfAnnouncement(state)).toEqual([
    { name: "Ada", role: "wolf" },
    { name: "Ira", role: "villager" },
  ]);
  const nextNight = dusk(day(state));
  expect(nextNight.status).toBe("mayor");
  expect(wakingPlayers(nextNight)).toEqual([]);
  expect(hammer(nextNight, "Bea")).toBe(nextNight);
  expect(hammer(nextNight, null).status).toBe("wolves");
});

it("defers a hunter linked to a hammer victim until the morning", () => {
  let state = dusk(
    day(
      see(wolves(couple(deal(["cupid", "mayor", "hunter"], { mayor: "hammer" }), ["Dan", "Eva"]))),
    ),
  );
  state = hammer(state, "Flo");
  expect(state.status).toBe("wolves");
  state = day(see(attack(state, "Flo")));
  expect(state).toMatchObject({ status: "hunter", hunter: { name: "Eva" } });
  expect(act(state, { type: "shot", night: 2, target: "Ada" })).toMatchObject({
    winner: "village",
  });
});

it("orders simultaneous morning announcements by seating so their order hides the cause", () => {
  const first = deal(["mayor"], { mayor: "hammer", revealRoles: false });
  const next = dusk(day(see(wolves(first))));
  const morning = see(attack(hammer(next, "Flo"), "Bea"));
  expect(werewolfAnnouncement(morning)).toEqual([
    { name: "Bea", role: null },
    { name: "Cam", role: null },
  ]);
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

  state = hammer(dusk(state), null);
  state = day(passHealers(see(attack(state, named("toughGuy")), named("wolf"))));
  expect(state).toMatchObject({ status: "day", night: 2, toughGuyDiesOn: 3 });
  expect(state.alive).toHaveLength(18);
  expect(state.spellsRemaining).toBe(2);
  expect(state.potions.poison).toBe(true);

  state = hammer(dusk(state), wrongTarget);
  expect(state.night).toBe(3);
  expect(state.alive).toHaveLength(16);
  expect(state.alive.map((player) => player.name)).not.toContain(named("mayor"));
  expect(state.alive.map((player) => player.name)).not.toContain(partner);
  expect(state.alive.map((player) => player.name)).toContain(wrongTarget);

  state = see(attack(state, named("hunter")), named("wolf"));
  expect(state).toMatchObject({ status: "witch", victim: { name: named("hunter") } });
  state = act(state, { type: "potions", night: 3, heal: false, poison: poisoned });
  expect(state).toMatchObject({ status: "magician", spellsRemaining: 2 });
  state = act(state, { type: "castSpells", night: 3, heal: false, kill: spellTargets });
  expect(state.status).toBe("morning");
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
