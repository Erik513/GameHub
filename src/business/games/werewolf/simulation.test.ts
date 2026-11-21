/// <reference types="node" />
import assert from "node:assert/strict";
import { it } from "vitest";
import {
  createWerewolf,
  transitionWerewolf,
  werewolfAnnouncement,
  type WerewolfEvent,
  type WerewolfSettings,
  type WerewolfSpecialRole,
  type WerewolfState,
} from "./stateMachine";

const roles = [
  "bodyguard",
  "witch",
  "hunter",
  "cupid",
  "idiot",
  "spellcaster",
  "mayor",
  "toughGuy",
  "apprenticeSeer",
  "paranormalInvestigator",
] as const;
type VoteState = Extract<WerewolfState, { status: "vote" }>;
type Decision = readonly [WerewolfEvent, WerewolfState["status"] | null];
const missing = "Narrator";

function seededRandom(seed: number) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
}

function subsets<T>(items: readonly T[]): T[][] {
  return Array.from({ length: 2 ** items.length }, (_, mask) =>
    items.filter((_, index) => (mask & (1 << index)) !== 0),
  );
}

function masked(state: WerewolfState, name: string): boolean {
  return state.drunk?.player === name && !state.drunk.revealed;
}

function ballots(state: VoteState, exhaustive: boolean): Decision[] {
  const voters = state.alive.filter((player) => player.name !== state.silencedPlayer);
  const votersWithPowers = voters.filter((player) => !masked(state, player.name));
  const mayor = votersWithPowers.find(
    (player) => player.role === "mayor" && state.settings.mayor === "doubleVote",
  );
  const idiot = votersWithPowers.find((player) => player.role === "idiot");
  const special = voters.filter((player) => player === mayor || player === idiot);
  const ordinary = voters.filter((player) => !special.includes(player));
  const groups = exhaustive
    ? subsets(voters)
    : subsets(special).flatMap((group) =>
        Array.from({ length: ordinary.length + 1 }, (_, count) => [
          ...group,
          ...ordinary.slice(0, count),
        ]),
      );
  const total = voters.length + Number(Boolean(mayor));
  const outcome = (yes: number) => (yes * 2 > total ? "exile" : "day");
  const base = { type: "vote", night: state.night, nomination: state.nomination } as const;
  const decisions: Decision[] = groups.map((group) => {
    const yes =
      group.length +
      Number(Boolean(mayor && group.includes(mayor))) +
      Number(Boolean(idiot && !group.includes(idiot)));
    return [{ ...base, yesVoters: group.map((player) => player.name) }, outcome(yes)];
  });
  if (!mayor && !idiot) {
    for (let yes = 0; yes <= total; yes++) decisions.push([{ ...base, yes }, outcome(yes)]);
  }
  decisions.push(
    [{ ...base, yes: -1 }, null],
    [{ ...base, yes: total + 1 }, null],
    [{ ...base, yes: 1.5 }, null],
    [{ ...base, yesVoters: [missing] }, null],
    [{ ...base, yesVoters: [], nomination: state.nomination - 1 }, null],
  );
  if (mayor || idiot) decisions.push([{ ...base, yes: total }, null]);
  if (voters[0]) decisions.push([{ ...base, yesVoters: [voters[0].name, voters[0].name] }, null]);
  if (state.silencedPlayer) decisions.push([{ ...base, yesVoters: [state.silencedPlayer] }, null]);
  return decisions;
}

function decisions(state: WerewolfState): Decision[] {
  const { night, alive } = state;
  const names = [...state.players.map((player) => player.name), missing];
  const player = (name: string) => alive.find((candidate) => candidate.name === name);
  const active = alive.filter((candidate) => !masked(state, candidate.name));
  const beforeWolves =
    active
      .map((player) => player.role)
      .find((role) => role === "bodyguard" || role === "nightGuest") ?? "wolves";
  switch (state.status) {
    case "nightCall":
      return [[{ type: "acknowledgeCall", night }, state.resume.status]];
    case "roles":
      return names.map((name) => [
        { type: "roleSeen", player: name },
        name === state.players[state.index]?.name
          ? state.index + 1 < state.players.length
            ? "roles"
            : state.amulet
              ? "amuletIntro"
              : alive.some((p) => p.role === "cupid")
                ? "cupid"
                : beforeWolves
          : null,
      ]);
    case "amuletIntro":
      return [[{ type: "amuletReady", night }, state.status]];
    case "amuletPass":
      return names.map((target) => [
        { type: "passAmulet", night, target },
        player(target) && (!state.amulet.mustPass || target !== state.amulet.holder)
          ? "morning"
          : null,
      ]);
    case "cupid":
      return names.flatMap((first, index) =>
        names
          .slice(index)
          .map((second): Decision => [
            { type: "bond", night, players: [first, second] },
            first !== second && player(first) && player(second) ? "lovers" : null,
          ]),
      );
    case "lovers":
      return [[{ type: "loversReady", night }, beforeWolves]];
    case "drunkReveal":
      return [[{ type: "drunkReady", night }, state.status]];
    case "drunkHunter":
      return [[{ type: "drunkReady", night }, "hunter"]];
    case "mayor":
      return [null, ...names].map((target) => [
        { type: "hammer", night, target },
        target === null ||
        (!state.hammerUsed &&
          active.some((p) => p.role === "mayor") &&
          player(target) &&
          player(target)?.role !== "mayor")
          ? state.status
          : null,
      ]);
    case "bodyguard":
      return names.map((target) => [
        { type: "protect", night, target },
        player(target) && player(target)?.role !== "bodyguard" && target !== state.protectedPlayer
          ? active.some((p) => p.role === "wolf")
            ? "wolves"
            : state.status
          : null,
      ]);
    case "nightGuest":
      return names.map((target) => [
        { type: "stayWith", night, target },
        player(target) && player(target)?.role !== "nightGuest" && target !== state.hostPlayer
          ? active.some((p) => p.role === "wolf")
            ? "wolves"
            : state.status
          : null,
      ]);
    case "wolves":
      return [
        [
          { type: "wolvesReady", night },
          night === 1 && !state.settings.attackOnFirstNight ? state.status : null,
        ],
        ...[null, ...names].map((target): Decision => [
          { type: "attack", night, target },
          (night > 1 || state.settings.attackOnFirstNight) &&
          (target === null || (player(target) && player(target)?.role !== "wolf"))
            ? state.status
            : null,
        ]),
      ];
    case "seer": {
      const seer = alive.some((p) => p.role === "seer") ? "seer" : "apprenticeSeer";
      return names.map((target) => [
        { type: "inspect", night, target },
        player(target) && player(target)?.role !== seer ? "vision" : null,
      ]);
    }
    case "vision":
      return [[{ type: "closeVision", night }, state.status]];
    case "investigator":
      return [
        [{ type: "investigate", night, target: null }, state.status],
        ...names.map((target): Decision => [
          { type: "investigate", night, target },
          player(target) ? "investigation" : null,
        ]),
      ];
    case "investigation":
      return [[{ type: "closeInvestigation", night }, state.status]];
    case "witch":
      return [false, true].flatMap((heal) =>
        [null, ...names].map((poison): Decision => [
          { type: "potions", night, heal, poison },
          (!heal || (state.potions.heal && state.victim)) &&
          (poison === null || (state.potions.poison && player(poison)))
            ? state.status
            : null,
        ]),
      );
    case "magician": {
      const kills = [
        [],
        ...names.map((name) => [name]),
        ...names.flatMap((name, index) => names.slice(index).map((other) => [name, other])),
      ];
      return [false, true].flatMap((heal) =>
        kills.map((kill): Decision => [
          { type: "castSpells", night, heal, kill },
          kill.length + Number(heal) <= state.spellsRemaining &&
          (!heal || state.victim) &&
          new Set(kill).size === kill.length &&
          kill.every(player)
            ? state.status
            : null,
        ]),
      );
    }
    case "spellcaster":
      return [null, ...names].map((target) => [
        { type: "silence", night, target },
        target === null ||
        (target !== state.silencedPlayer &&
          player(target) &&
          (state.settings.allowSelfSilence || player(target)?.role !== "spellcaster"))
          ? state.amulet
            ? "amuletPass"
            : "morning"
          : null,
      ]);
    case "morning":
      return [[{ type: "announceMorning", night }, state.status]];
    case "day":
      return [
        [{ type: "endDay", night }, state.status],
        ...names.map((target): Decision => {
          const supporters = alive.filter(
            (p) => p.name !== target && p.name !== state.silencedPlayer,
          );
          return [
            {
              type: "nominate",
              night,
              target,
              nominator: supporters[0]?.name ?? missing,
              seconder: supporters[1]?.name ?? missing,
            },
            player(target) && supporters.length >= 2 ? "vote" : null,
          ];
        }),
      ];
    case "vote":
      return ballots(state, false);
    case "exile":
      return [[{ type: "announceExile", night }, state.status]];
    case "hunter":
      return [null, ...names].map((target) => [
        { type: "shot", night, target },
        (
          target === null
            ? state.settings.hunterShot !== "required" || state.alive.length === 0
            : player(target)
        )
          ? state.status
          : null,
      ]);
    case "finished":
      return [[{ type: "endDay", night }, null]];
  }
}

function checkTransition(state: WerewolfState, [event, expected]: Decision) {
  if ("night" in event) {
    assert.equal(
      transitionWerewolf(state, { ...event, night: event.night - 1 }),
      state,
      "Accepted a stale event",
    );
  }
  const next = transitionWerewolf(state, event);
  if (expected === null) {
    assert.equal(next, state, "Accepted an illegal decision");
    return null;
  }
  assert.notEqual(next, state, "Rejected a legal decision");
  if (expected !== state.status) {
    let actual = next;
    while (actual.status === "nightCall" && actual.call !== expected) actual = actual.resume;
    assert.equal(actual.status === "nightCall" ? actual.call : actual.status, expected);
  }
  assert.equal(next.players, state.players);
  assert(next.night === state.night || next.night === state.night + 1);
  assert.equal(new Set(next.alive).size, next.alive.length);
  assert(
    next.alive.every((player) => state.alive.includes(player)),
    "A dead player returned",
  );
  assert(!next.potions.heal || state.potions.heal);
  assert(!next.potions.poison || state.potions.poison);
  if (event.type === "castSpells") {
    assert.equal(
      next.spellsRemaining,
      state.spellsRemaining - event.kill.length - Number(event.heal),
    );
    assert.deepEqual(
      next.spellVictims.map((player) => player.name).sort(),
      event.kill
        .filter((name) => name !== state.protectedPlayer && name !== state.amulet?.holder)
        .sort(),
    );
  }
  assert(!state.hammerUsed || next.hammerUsed);
  assert(!state.investigationUsed || next.investigationUsed);
  if (next.amulet) {
    assert(next.alive.some((player) => player.name === next.amulet?.holder));
    assert.equal(
      next.amulet.holder,
      event.type === "passAmulet" ? event.target : state.amulet?.holder,
    );
    if (event.type === "passAmulet") assert.equal(next.amulet.mustPass, false);
  } else if (state.amulet) {
    assert(!next.alive.some((player) => player.name === state.amulet?.holder));
  }
  if (next.alive.length !== state.alive.length) {
    const tanner = state.alive.find((player) => player.role === "tanner");
    const votedOut =
      event.type === "announceExile" && state.status === "exile" && state.victim === tanner;
    const wins =
      tanner && !next.alive.includes(tanner) && (votedOut || state.settings.tanner === "anyDeath");
    assert.equal(next.tannerWinner, wins ? tanner.name : state.tannerWinner);
  } else {
    assert.equal(next.tannerWinner, state.tannerWinner);
  }
  if (state.shotDeaths) assert.equal(next.shotDeaths, undefined, "The shot was announced twice");
  if (event.type === "attack") {
    assert("victim" in next);
    let expected = event.target;
    const guest = state.alive.find((p) => p.role === "nightGuest")?.name;
    if (
      expected === state.protectedPlayer ||
      expected === state.amulet?.holder ||
      (state.hostPlayer && expected === guest)
    ) {
      expected = null;
    } else if (expected && expected === state.hostPlayer) {
      expected = guest === state.amulet?.holder ? null : (guest ?? null);
    }
    assert.equal(next.victim?.name ?? null, expected, "Wrong wolf victim after protection");
  }
  if (next.lovers) {
    assert.notEqual(next.lovers[0], next.lovers[1]);
    assert.equal(
      next.alive.filter((p) => next.lovers?.includes(p.name)).length % 2,
      0,
      "Only one lover died",
    );
  }
  if (next.status === "vision") {
    assert.equal(
      next.isWolf,
      next.alive.some((p) => p.name === next.target && p.role === "wolf"),
    );
  }
  if (next.status === "finished" || next.status === "day" || next.status === "amuletPass") {
    const wolves = next.alive.filter((player) => player.role === "wolf");
    const village = next.alive.filter((player) => player.role !== "wolf");
    const winner =
      wolves.length === 0 ? "village" : wolves.length >= village.length ? "wolves" : null;
    assert.equal(next.status === "finished" ? next.winner : null, winner);
  }
  if (event.type === "announceMorning" || event.type === "announceExile" || event.type === "shot") {
    const losses = state.players.filter(
      (p) =>
        (state.alive.includes(p) && !next.alive.includes(p)) ||
        (event.type === "announceMorning" && state.nightDeaths.includes(p)),
    );
    assert.deepEqual(
      werewolfAnnouncement(event.type === "shot" ? next : state),
      losses.map(({ name }) => ({ name })),
      "The public announcement does not match the deaths",
    );
  }
  return next;
}

const table = (count: number) =>
  Array.from({ length: count }, (_, index) => `Player ${index + 1}`).join(",");

function play(
  count: number,
  selected: readonly WerewolfSpecialRole[],
  settings: Partial<WerewolfSettings>,
  seed: number,
) {
  const random = seededRandom(seed);
  const initial = createWerewolf(table(count), missing, random, selected, {
    ...(count === 8 ? { wolfCount: 1 } : {}),
    ...settings,
  });
  assert(initial);
  if (initial.amulet) {
    assert(
      initial.alive.some(
        (player) => player.name === initial.amulet?.holder && player.role !== "wolf",
      ),
    );
  }
  let state = initial;
  const trace: WerewolfEvent[] = [];
  try {
    for (let step = 0; step < 400; step++) {
      if (state.status === "finished") return state.winner;
      const options = decisions(state).flatMap((decision) => {
        try {
          const next = checkTransition(state, decision);
          return next ? [{ event: decision[0], next }] : [];
        } catch (cause) {
          throw new Error(`Failed decision: ${JSON.stringify(decision[0])}`, { cause });
        }
      });
      const choice = options[Math.floor(random() * options.length)];
      assert(choice, `No legal move in ${state.status}`);
      trace.push(choice.event);
      state = choice.next;
    }
    assert.fail("The game did not finish within 400 moves");
  } catch (cause) {
    throw new Error(
      JSON.stringify({ count, selected, settings, seed, phase: state.status, trace }),
      { cause },
    );
  }
}

it.each([6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18])(
  "simulates all legal role sets with standard protection for %i players",
  (count) => {
    const winners = new Set<string>();
    let seed = count * 10_000;
    const wolves = count < 9 ? 1 : count < 12 ? 2 : 3;
    for (const selected of subsets(roles)) {
      if (selected.length > count - wolves - 1) continue;
      for (let flags = 0; flags < 8; flags++) {
        const settings: Partial<WerewolfSettings> = {
          mayor: flags & 1 ? "hammer" : "doubleVote",
          allowSelfSilence: Boolean(flags & 2),
          drunk: false,
        };
        winners.add(play(count, selected, settings, ++seed));
      }
    }
    assert.deepEqual(winners, new Set(["village", "wolves"]));
  },
  120_000,
);

it.each([9, 10, 11, 12, 13, 14, 15, 16, 17, 18])(
  "simulates the drunk mask with all role sets for %i players",
  (count) => {
    const wolves = count < 12 ? 2 : 3;
    let seed = count * 100_000;
    for (const selected of subsets(roles)) {
      if (selected.length > count - wolves - 1) continue;
      seed++;
      play(
        count,
        selected,
        {
          mayor: seed & 1 ? "hammer" : "doubleVote",
          allowSelfSilence: Boolean(seed & 2),
          drunk: true,
        },
        seed,
      );
    }
  },
  120_000,
);

function withNightGuest(roles: readonly WerewolfSpecialRole[]): WerewolfSpecialRole[] {
  return roles.map((role) => (role === "bodyguard" ? "nightGuest" : role));
}

it.each([6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18])(
  "compares both protection roles with matching seeds for %i players",
  (count) => {
    const wolves = count < 9 ? 1 : count < 12 ? 2 : 3;
    let seed = count * 10_000_000;
    for (const selected of subsets(roles)) {
      if (selected.length > count - wolves - 1 || !selected.includes("bodyguard")) continue;
      seed++;
      const settings = {
        mayor: seed & 1 ? "hammer" : "doubleVote",
        allowSelfSilence: Boolean(seed & 2),
        drunk: wolves >= 2 && Boolean(seed & 8),
      } satisfies Partial<WerewolfSettings>;
      play(count, selected, settings, seed);
      play(count, withNightGuest(selected), settings, seed);
    }
  },
  120_000,
);

it("checks every named ballot at the largest table, with mandatory and weighted votes", () => {
  let state = createWerewolf(table(18), missing, () => 0.99, roles);
  assert(state);
  while (state.status !== "vote") {
    const decision: Decision | undefined = decisions(state).find(
      ([event, expected]) => expected && event.type !== "endDay",
    );
    assert(decision);
    state = transitionWerewolf(state, decision[0]);
  }
  const votes = ballots(state, true);
  assert.equal(votes.filter(([, expected]) => expected !== null).length, 2 ** 18);
  for (const decision of votes) checkTransition(state, decision);
}, 120_000);

it.each([11, 12, 13, 14, 15, 16, 17, 18])(
  "simulates the magician with every compatible role set for %i players",
  (count) => {
    const compatibleRoles = roles.filter((role) => role !== "witch");
    const wolves = count < 12 ? 2 : 3;
    let seed = count * 100_000_000;
    for (const selected of subsets(compatibleRoles)) {
      if (selected.length > count - wolves - 2) continue;
      seed++;
      play(
        count,
        [...(seed & 16 ? withNightGuest(selected) : selected), "magician"],
        {
          mayor: seed & 1 ? "hammer" : "doubleVote",
          allowSelfSilence: Boolean(seed & 2),
          drunk: Boolean(seed & 8),
        },
        seed,
      );
    }
  },
  120_000,
);

it.each([6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18])(
  "simulates both tanner goals with every compatible role set for %i players",
  (count) => {
    const wolves = count < 9 ? 1 : count < 12 ? 2 : 3;
    const availableRoles = count >= 11 ? ([...roles, "magician"] as const) : roles;
    let seed = count * 70_000_000;
    for (const selected of subsets(availableRoles)) {
      if (selected.length > count - wolves - 2) continue;
      if (selected.includes("magician") && selected.includes("witch")) continue;
      seed++;
      for (const tanner of ["anyDeath", "voteOnly"] as const) {
        play(
          count,
          [...(seed & 16 ? withNightGuest(selected) : selected), "tanner"],
          {
            mayor: seed & 1 ? "hammer" : "doubleVote",
            allowSelfSilence: Boolean(seed & 2),
            drunk: wolves >= 2 && Boolean(seed & 8),
            tanner,
          },
          seed,
        );
      }
    }
  },
  120_000,
);

it.each([6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18])(
  "simulates the amulet with every compatible role set for %i players",
  (count) => {
    const wolves = count < 9 ? 1 : count < 12 ? 2 : 3;
    const availableRoles =
      count >= 11 ? ([...roles, "tanner", "magician"] as const) : ([...roles, "tanner"] as const);
    let seed = count * 110_000_000;
    for (const selected of subsets<WerewolfSpecialRole>(availableRoles)) {
      if (selected.length > count - wolves - 1) continue;
      if (selected.includes("magician") && selected.includes("witch")) continue;
      seed++;
      play(
        count,
        seed & 16 ? withNightGuest(selected) : selected,
        {
          mayor: seed & 1 ? "hammer" : "doubleVote",
          allowSelfSilence: Boolean(seed & 2),
          drunk: wolves >= 2 && Boolean(seed & 8),
          tanner: seed & 32 ? "voteOnly" : "anyDeath",
          amulet: true,
        },
        seed,
      );
    }
  },
  120_000,
);

it.each([3, 4, 5])(
  "samples nineteen-player decisions with %i wolves",
  (wolfCount) => {
    const random = seededRandom(19000 + wolfCount);
    const pool: WerewolfSpecialRole[] = [...roles, "nightGuest", "magician", "tanner"];
    let checked = 0;
    while (checked < 32) {
      const selected = pool.filter(() => random() < 0.5);
      if (selected.includes("bodyguard") && selected.includes("nightGuest")) continue;
      if (wolfCount === 3 && selected.includes("witch") && selected.includes("magician")) continue;
      const settings = {
        wolfCount,
        mayor: checked & 1 ? "hammer" : "doubleVote",
        allowSelfSilence: Boolean(checked & 2),
        drunk: Boolean(checked & 8),
        amulet: Boolean(checked & 16),
        hunterShot: checked & 1 ? "required" : "optional",
        attackOnFirstNight: Boolean(checked & 2),
        tanner: checked & 4 ? "voteOnly" : "anyDeath",
      } satisfies Partial<WerewolfSettings>;
      play(19, selected, settings, 190000 + wolfCount * 1000 + checked++);
    }
  },
  120_000,
);

it.each([3, 4, 5])(
  "samples twenty-player decisions with %i wolves",
  (wolfCount) => {
    const random = seededRandom(20000 + wolfCount);
    const pool: WerewolfSpecialRole[] = [...roles, "nightGuest", "magician", "tanner"];
    let checked = 0;
    while (checked < 32) {
      const selected = pool.filter(() => random() < 0.5);
      if (selected.includes("bodyguard") && selected.includes("nightGuest")) continue;
      if (wolfCount === 3 && selected.includes("witch") && selected.includes("magician")) continue;
      const settings = {
        wolfCount,
        mayor: checked & 1 ? "hammer" : "doubleVote",
        allowSelfSilence: Boolean(checked & 2),
        drunk: Boolean(checked & 8),
        amulet: Boolean(checked & 16),
        hunterShot: checked & 1 ? "required" : "optional",
        attackOnFirstNight: Boolean(checked & 2),
        tanner: checked & 4 ? "voteOnly" : "anyDeath",
      } satisfies Partial<WerewolfSettings>;
      play(20, selected, settings, 200000 + wolfCount * 1000 + checked++);
    }
  },
  120_000,
);

it("checks sampled named ballots at the twenty-player table", () => {
  let state = createWerewolf(table(20), missing, () => 0.99, roles);
  assert(state);
  while (state.status !== "vote") {
    const decision: Decision | undefined = decisions(state).find(
      ([event, expected]) => expected && event.type !== "endDay",
    );
    assert(decision);
    state = transitionWerewolf(state, decision[0]);
  }
  const votes = ballots(state, false);
  assert.equal(votes.filter(([, expected]) => expected !== null).length, 76);
  for (const decision of votes) checkTransition(state, decision);
});

it.each([1, 2])(
  "checks eight-player decisions under the approved %i-wolf option",
  (wolfCount) => {
    const random = seededRandom(580008 + wolfCount);
    const pool: WerewolfSpecialRole[] = [
      "witch",
      "hunter",
      "idiot",
      "bodyguard",
      "nightGuest",
      "cupid",
      "toughGuy",
      "tanner",
      "apprenticeSeer",
    ];
    let checked = 0;
    while (checked < 32) {
      const selected = pool.filter(() => random() < 0.5);
      if (
        selected.length > 7 - wolfCount ||
        (selected.includes("bodyguard") && selected.includes("nightGuest"))
      )
        continue;
      play(
        8,
        selected,
        {
          wolfCount,
          attackOnFirstNight: Boolean(checked & 2),
          hunterShot: checked & 4 ? "required" : "optional",
          tanner: checked & 8 ? "voteOnly" : "anyDeath",
        },
        580080 + wolfCount * 100 + checked++,
      );
    }
  },
  120_000,
);
