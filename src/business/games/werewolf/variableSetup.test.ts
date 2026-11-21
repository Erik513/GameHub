import { expect, it, vi } from "vitest";
import * as balance from "./lineupBalance";
import {
  availableWerewolfCounts,
  availableWerewolfRoles,
  standardWerewolfCount,
  type WerewolfSettings,
  type WerewolfSpecialRole,
} from "./configuration";
import { hasFeasibleAutomaticWerewolfLineup } from "./automaticSetup";
import { transitionWerewolf, type WerewolfState } from "./stateMachine";
import { nightScript } from "./nightScript";
import {
  analyzeVariableWerewolfSelection,
  createVariableWerewolf,
  drawVariableWerewolfLineup,
  recommendVariableWerewolfCount,
  type VariableWerewolfSelection,
  type VariableWerewolfFailureReason,
  type WerewolfItem,
} from "./variableSetup";

const names = (players: number) =>
  Array.from({ length: players }, (_, i) => `Player ${i}`).join(",");
const empty: VariableWerewolfSelection = {
  rolePool: [],
  roleRange: { minimum: 0, maximum: 0 },
  itemPool: [],
  wolfCounts: [2],
};
const select = (overrides: Partial<VariableWerewolfSelection> = {}): VariableWerewolfSelection => ({
  ...empty,
  ...overrides,
});
const noDraw = (): number => {
  throw Error("Unexpected randomness");
};
function analyze(
  players: number,
  selection: VariableWerewolfSelection,
  settings: Partial<WerewolfSettings> = {},
) {
  const result = analyzeVariableWerewolfSelection(players, selection, settings);
  if (!result.ok) throw Error(result.reason);
  return result;
}
function draw(
  players: number,
  selection: VariableWerewolfSelection,
  values: number[] = [],
  settings: Partial<WerewolfSettings> = {},
) {
  const draws = [...values];
  const result = drawVariableWerewolfLineup(
    players,
    selection,
    () => {
      if (!draws.length) throw Error("Unexpected extra draw");
      return draws.shift()!;
    },
    settings,
  );
  if (!result.ok) throw Error(result.reason);
  expect(draws).toHaveLength(0);
  return result;
}

it("weights wolves, optional counts and role families uniformly, independently of variant counts", () => {
  const selection = select({
    requiredRoles: ["idiot"],
    requiredItems: ["amulet"],
    rolePool: ["hunter", "witch"],
    roleRange: { minimum: 0, maximum: 2 },
    roleOptions: { hunterShot: ["optional", "required"] },
    itemPool: ["drunk"],
    wolfCounts: [2, 3],
  });
  const wolfWeight = [0, 0],
    countWeight = [0, 0, 0];
  let hunterWeight = 0,
    optionalShotWeight = 0,
    drunkWeight = 0;
  for (let w = 0; w < 2; w++)
    for (let count = 0; count <= 2; count++) {
      const subsets =
        count === 0 ? [[]] : count === 1 ? [["hunter"], ["witch"]] : [["hunter", "witch"]];
      for (const [subsetIndex, subset] of subsets.entries())
        for (let mode = 0; mode < (subset.includes("hunter") ? 2 : 1); mode++)
          for (let item = 0; item < 2; item++) {
            const values = [(w + 0.5) / 2, (count + 0.5) / 3];
            // One of two families: a random order of the two, then the starting point decides.
            if (subsets.length > 1) values.push(0.75, subsetIndex === 0 ? 0.25 : 0.75);
            if (subset.includes("hunter")) values.push((mode + 0.5) / 2);
            values.push((item + 0.5) / 2);
            const result = draw(12, selection, values);
            expect(result.lineup.roles).toEqual([...subset, "idiot"].sort());
            expect(result.lineup.settings.wolfCount).toBe(w + 2);
            expect(result.items).toContain("amulet");
            const probability =
              1 / 2 / 3 / subsets.length / (subset.includes("hunter") ? 2 : 1) / 2;
            wolfWeight[w]! += probability;
            countWeight[count]! += probability;
            hunterWeight += Number(subset.includes("hunter")) * probability;
            optionalShotWeight +=
              Number(
                subset.includes("hunter") && result.lineup.settings.hunterShot === "optional",
              ) * probability;
            drunkWeight += Number(result.items.includes("drunk")) * probability;
          }
    }
  for (const weight of wolfWeight) expect(weight).toBeCloseTo(0.5);
  for (const weight of countWeight) expect(weight).toBeCloseTo(1 / 3);
  expect(hunterWeight).toBeCloseTo(0.5);
  expect(optionalShotWeight).toBeCloseTo(0.25);
  expect(drunkWeight).toBeCloseTo(0.5);
});

it("draws optional items with independent fair coins instead of uniform item counts", () => {
  const selection = select({ itemPool: ["drunk", "amulet"] });
  const counts = [0, 0, 0];
  const seen = new Set<string>();
  for (const a of [0.25, 0.75])
    for (const d of [0.25, 0.75]) {
      const result = draw(10, selection, [a, d]);
      expect(result.items.includes("amulet")).toBe(a < 0.5);
      expect(result.items.includes("drunk")).toBe(d < 0.5);
      counts[result.items.length]!++;
      seen.add(result.items.join(","));
    }
  expect(counts).toEqual([1, 2, 1]);
  expect(seen.size).toBe(4);
  const required = draw(10, select({ requiredItems: ["amulet", "drunk"] }));
  expect(required.items).toEqual(["amulet", "drunk"]);
});

it("groups bodyguard and night guest as one optional role and gives every single role the same chance", () => {
  const selection = select({
    rolePool: ["hunter", "nightGuest", "bodyguard"],
    roleRange: { minimum: 1, maximum: 1 },
  });
  const summary = analyze(10, selection);
  expect(summary.groups).toEqual([{ wolfCount: 2, roleCount: 1, choices: 2 }]);
  expect(summary.possibleRoleRange).toEqual({ minimum: 0, maximum: 2 });
  // One of three roles is drawn: each of them with a third, the two guards are one family with two variants.
  let seed = 11;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const hits: Record<string, number> = {};
  const draws = 9000;
  for (let index = 0; index < draws; index += 1) {
    const result = drawVariableWerewolfLineup(10, selection, random);
    if (!result.ok) throw Error(result.reason);
    const role = result.lineup.roles[0]!;
    hits[role] = (hits[role] ?? 0) + 1;
  }
  for (const role of ["hunter", "bodyguard", "nightGuest"]) {
    expect(Math.abs((hits[role] ?? 0) / draws - 1 / 3)).toBeLessThan(0.03);
  }
  const onlyGuard = select({
    rolePool: ["bodyguard", "nightGuest"],
    roleRange: { minimum: 0, maximum: 1 },
  });
  expect(analyze(10, onlyGuard).possibleRoleRange).toEqual({ minimum: 0, maximum: 1 });
});

it("counts required cards outside the optional range and reports locked alternatives", () => {
  const selection = select({
    requiredRoles: ["bodyguard", "hunter"],
    rolePool: ["nightGuest", "witch"],
    roleRange: { minimum: 0, maximum: 2 },
    roleOptions: { hunterShot: ["required"] },
  });
  const summary = analyze(10, selection);
  expect(summary.canStart).toBe(true);
  expect(summary.possibleRoleRange).toEqual({ minimum: 0, maximum: 1 });
  expect(summary.roles.find((r) => r.role === "nightGuest")).toMatchObject({
    possible: false,
    reason: "requiredAlternative",
  });
  expect(summary.roles.find((r) => r.role === "hunter")?.options).toEqual([
    { value: "optional", possible: false, selected: false, reason: "requiredOption" },
    { value: "required", possible: true, selected: true, reason: null },
  ]);
  const result = draw(10, selection, [0.75]);
  expect(result.lineup.roles).toEqual(["bodyguard", "hunter", "witch"]);
  expect(result.lineup.settings.hunterShot).toBe("required");
});

it("draws each role option independently without adding role cards", () => {
  const selection = select({
    rolePool: ["hunter", "mayor", "spellcaster", "tanner", "toughGuy"],
    roleRange: { minimum: 5, maximum: 5 },
    wolfCounts: [4],
    roleOptions: {
      hunterShot: ["optional", "required"],
      mayor: ["doubleVote", "hammer"],
      allowSelfSilence: [false, true],
      tanner: ["anyDeath", "voteOnly"],
      toughGuy: ["wolfOnly", "anyAttack"],
    },
  });
  const seen = new Set<string>();
  for (let mask = 0; mask < 32; mask++) {
    const result = draw(
      18,
      selection,
      Array.from({ length: 5 }, (_, i) => (mask & (1 << i) ? 0.75 : 0.25)),
    );
    expect(result.lineup.roles).toHaveLength(5);
    expect(new Set(result.lineup.roles).size).toBe(5);
    expect(result.lineup.settings).toMatchObject({
      hunterShot: mask & 1 ? "required" : "optional",
      mayor: mask & 2 ? "hammer" : "doubleVote",
      allowSelfSilence: Boolean(mask & 4),
      tanner: mask & 8 ? "voteOnly" : "anyDeath",
      toughGuy: mask & 16 ? "anyAttack" : "wolfOnly",
    });
    seen.add(JSON.stringify(result.lineup.settings));
  }
  expect(seen.size).toBe(32);
});

it("samples wolves before feasible counts and rejects a selected wolf value that cannot start", () => {
  const selection = select({
    requiredRoles: ["witch"],
    rolePool: ["magician"],
    roleRange: { minimum: 0, maximum: 1 },
    wolfCounts: [3, 4],
  });
  const summary = analyze(14, selection);
  expect(summary.canStart).toBe(true);
  expect(summary.wolfCounts).toMatchObject([
    { wolfCount: 3, possibleRoleCounts: [0] },
    { wolfCount: 4, possibleRoleCounts: [0, 1] },
  ]);
  expect(draw(14, selection, [0.25]).lineup).toMatchObject({
    roles: ["witch"],
    settings: { wolfCount: 3 },
  });
  expect(draw(14, selection, [0.75, 0.75]).lineup).toMatchObject({
    roles: ["magician", "witch"],
    settings: { wolfCount: 4 },
  });
  const impossibleRange = { ...selection, roleRange: { minimum: 1, maximum: 1 } };
  expect(analyze(14, impossibleRange)).toMatchObject({
    canStart: false,
    possibleRoleRange: { minimum: 0, maximum: 1 },
  });
  expect(drawVariableWerewolfLineup(14, impossibleRange, noDraw)).toEqual({
    ok: false,
    reason: "noFeasibleLineup",
  });
  const requiredBoth = select({ requiredRoles: ["witch", "magician"], wolfCounts: [3, 4] });
  expect(analyze(14, requiredBoth).canStart).toBe(false);
  expect(drawVariableWerewolfLineup(14, requiredBoth, noDraw)).toEqual({
    ok: false,
    reason: "noFeasibleLineup",
  });
});

it("reports possible bounds before clamping the entered range and keeps excluded entries selectable", () => {
  const summary = analyze(9, empty);
  expect(summary.canStart).toBe(true);
  expect(summary.roles.find((r) => r.role === "mayor")).toMatchObject({
    available: true,
    possible: true,
    required: false,
    optional: false,
    options: [
      { value: "doubleVote", possible: true },
      { value: "hammer", possible: false, reason: "minimumPlayers" },
    ],
  });
  expect(summary.roles.find((r) => r.role === "magician")).toMatchObject({
    available: false,
    possible: false,
    reason: "minimumPlayers",
  });
  expect(summary.items.find((i) => i.item === "amulet")).toMatchObject({
    available: false,
    possible: false,
    reason: "minimumPlayers",
  });
  expect(summary.items.find((i) => i.item === "drunk")).toMatchObject({
    available: true,
    possible: true,
  });
  const crowded = select({
    requiredRoles: ["witch", "hunter", "idiot", "bodyguard"],
    wolfCounts: [1],
  });
  expect(analyze(6, crowded).roles.find((r) => r.role === "nightGuest")?.reason).toBe(
    "requiredAlternative",
  );
  const seven = analyze(7, { ...crowded, requiredRoles: [...crowded.requiredRoles!, "cupid"] });
  expect(seven.roles.find((r) => r.role === "toughGuy")?.reason).toBe("insufficientSeats");
  const conflict = analyze(11, select({ requiredRoles: ["witch"] }));
  expect(conflict.roles.find((r) => r.role === "magician")?.reason).toBe("incompatibleRoles");
  const invalidRequired = analyze(10, select({ requiredRoles: ["bodyguard", "nightGuest"] }));
  expect(invalidRequired.canStart).toBe(false);
  expect(invalidRequired.possibleRoleRange).toBeNull();
  expect(invalidRequired.items.every((i) => i.possible === false)).toBe(true);
});

it("uses no randomness or score for feasibility and no score during drawing", () => {
  const score = vi.spyOn(balance, "evaluateWerewolfLineup");
  try {
    const selection = select({
      rolePool: ["hunter", "witch"],
      roleRange: { minimum: 0, maximum: 2 },
      wolfCounts: [2, 3],
      itemPool: ["amulet", "drunk"],
    });
    expect(analyze(12, selection).canStart).toBe(true);
    expect(score).not.toHaveBeenCalled();
    expect(drawVariableWerewolfLineup(12, selection, () => 0.75).ok).toBe(true);
    expect(score).not.toHaveBeenCalled();
    expect(drawVariableWerewolfLineup(12, selection, () => NaN)).toEqual({
      ok: false,
      reason: "invalidRandom",
    });
    expect(score).not.toHaveBeenCalled();
  } finally {
    score.mockRestore();
  }
});

it("recommends using only required entries and their fixed options, independently of the draw", () => {
  const score = vi.spyOn(balance, "evaluateWerewolfLineup");
  try {
    const selection = select({
      requiredRoles: ["hunter", "mayor"],
      requiredItems: ["amulet"],
      roleOptions: {
        hunterShot: ["required"],
        mayor: ["hammer"],
        toughGuy: ["wolfOnly", "anyAttack"],
      },
      rolePool: ["witch", "toughGuy"],
      roleRange: { minimum: 0, maximum: 2 },
      itemPool: ["drunk"],
      wolfCounts: [2, 3],
    });
    const recommendation = recommendVariableWerewolfCount(11, selection, { wolfCount: 99 });
    expect(recommendation.ok).toBe(true);
    for (const call of score.mock.calls) {
      expect(call[1]).toEqual(["hunter", "mayor"]);
      expect(call[2]).toMatchObject({
        hunterShot: "required",
        mayor: "hammer",
        amulet: true,
        drunk: false,
      });
    }
    const same = recommendVariableWerewolfCount(11, {
      requiredRoles: selection.requiredRoles ?? [],
      requiredItems: selection.requiredItems ?? [],
      roleOptions: { hunterShot: ["required"], mayor: ["hammer"] },
    });
    expect(same).toEqual(recommendation);
    if (recommendation.ok) {
      expect(availableWerewolfCounts(11)).toContain(recommendation.recommendedWolfCount);
      expect(recommendation.balance.evidence).toBe("provisional");
    }
    const requiredHealers = recommendVariableWerewolfCount(14, {
      requiredRoles: ["witch", "magician"],
    });
    expect(requiredHealers).toMatchObject({ ok: true, recommendedWolfCount: 4 });
  } finally {
    score.mockRestore();
  }
});

it.each([6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20])(
  "creates valid private games and preserves selected wolf values at %i players",
  (players) => {
    const roles = availableWerewolfRoles(players);
    const familyCount = new Set(roles.map((r) => (r === "nightGuest" ? "bodyguard" : r))).size;
    const items: WerewolfItem[] =
      players >= 10 ? ["amulet", "drunk"] : players >= 9 ? ["drunk"] : [];
    const selection = select({
      rolePool: roles,
      roleRange: { minimum: 0, maximum: familyCount },
      wolfCounts: availableWerewolfCounts(players),
      requiredItems: items,
    });
    let calls = 0;
    const result = createVariableWerewolf(
      names(players),
      " Narrator ",
      () => {
        calls++;
        return 0.999;
      },
      selection,
      { wolfCount: 99 },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) throw Error(result.reason);
    const game = result.game;
    expect(game.narrator).toBe("Narrator");
    expect(game.players).toHaveLength(players);
    expect(game.players.filter((p) => p.role === "seer")).toHaveLength(1);
    expect(game.settings.wolfCount).toBe(Math.max(...availableWerewolfCounts(players)));
    expect(game.players.filter((p) => p.role === "wolf")).toHaveLength(game.settings.wolfCount);
    expect(
      game.players.some((p) => p.role === "bodyguard") &&
        game.players.some((p) => p.role === "nightGuest"),
    ).toBe(false);
    if (items.includes("amulet")) {
      expect(game.amulet).not.toBeNull();
      expect(game.players.find((p) => p.name === game.amulet?.holder)?.role).not.toBe("wolf");
    }
    if (items.includes("drunk")) {
      expect(game.drunk).not.toBeNull();
      expect(game.players.find((p) => p.name === game.drunk?.player)?.role).not.toBe("cupid");
    }
    const before = calls;
    let s: WerewolfState = game;
    for (const player of game.players)
      s = transitionWerewolf(s, { type: "roleSeen", player: player.name });
    expect(calls).toBe(before);
    expect(s.players).toEqual(game.players);
  },
);

it("keeps a fixed default count and ignores external wolf/item settings without calculating fairness", () => {
  const selection = select({ wolfCounts: [standardWerewolfCount(16)] });
  expect(
    draw(16, selection, [], { wolfCount: 99, wolfCountMode: "balanced", amulet: true, drunk: true })
      .lineup,
  ).toMatchObject({ roles: [], settings: { wolfCount: 4, amulet: false, drunk: false } });
});

it("preserves deterministic draws across equivalent input orders without mutating input", () => {
  const selection = select({
    requiredRoles: ["cupid", "idiot"],
    requiredItems: ["drunk", "amulet"],
    rolePool: ["nightGuest", "hunter", "bodyguard"],
    roleRange: { minimum: 0, maximum: 2 },
    wolfCounts: [3, 2],
    roleOptions: { hunterShot: ["required", "optional"] },
  });
  const before = JSON.stringify(selection);
  const options = Object.freeze({ wolfCount: 99 });
  const first = drawVariableWerewolfLineup(12, selection, () => 0.75, options);
  const second = drawVariableWerewolfLineup(
    12,
    {
      ...selection,
      requiredRoles: ["idiot", "cupid"],
      requiredItems: ["amulet", "drunk"],
      rolePool: ["bodyguard", "hunter", "nightGuest"],
      wolfCounts: [2, 3],
      roleOptions: { hunterShot: ["optional", "required"] },
    },
    () => 0.75,
    options,
  );
  expect(first).toEqual(second);
  expect(JSON.stringify(selection)).toBe(before);
  expect(options.wolfCount).toBe(99);
});

it("validates every used random draw and never returns a partial match", () => {
  const selection = select({
    rolePool: ["bodyguard", "nightGuest", "hunter", "mayor"],
    roleRange: { minimum: 0, maximum: 3 },
    roleOptions: { hunterShot: ["optional", "required"], mayor: ["doubleVote", "hammer"] },
    itemPool: ["amulet", "drunk"],
    wolfCounts: [3, 4],
  });
  let total = 0;
  expect(
    drawVariableWerewolfLineup(14, selection, () => {
      total++;
      return 0.25;
    }).ok,
  ).toBe(true);
  for (const bad of [NaN, Infinity, -1, 1])
    for (let index = 1; index <= total; index++) {
      let calls = 0;
      expect(
        drawVariableWerewolfLineup(14, selection, () => (++calls === index ? bad : 0.25)),
      ).toEqual({ ok: false, reason: "invalidRandom" });
    }
  let draws = 0;
  const game = createVariableWerewolf(
    names(14),
    "Narrator",
    () => {
      draws++;
      return 0.75;
    },
    selection,
  );
  expect(game.ok).toBe(true);
  for (let index = 1; index <= draws; index++) {
    let calls = 0;
    expect(
      createVariableWerewolf(
        names(14),
        "Narrator",
        () => (++calls === index ? NaN : 0.75),
        selection,
      ),
    ).toEqual({ ok: false, reason: "invalidRandom" });
  }
  expect(() =>
    drawVariableWerewolfLineup(14, selection, () => {
      throw Error("RNG unavailable");
    }),
  ).toThrow("RNG unavailable");
});

it("skips the hammer call when no mayor or the double-vote variant is drawn", () => {
  for (const range of [
    { minimum: 0, maximum: 1 },
    { minimum: 1, maximum: 1 },
  ]) {
    const selection = select({
      rolePool: ["mayor"],
      roleRange: range,
      roleOptions: { mayor: ["doubleVote", "hammer"] },
    });
    const result = createVariableWerewolf(names(10), "Narrator", () => 0.25, selection);
    if (!result.ok) throw Error(result.reason);
    expect(result.game.settings.mayor).toBe("doubleVote");
    const script = nightScript({ ...result.game, night: 2 });
    expect(script.find((c) => c.id === "mayor")).toMatchObject({ mode: "skip", actors: [] });
  }
  const doubleOnly = createVariableWerewolf(
    names(9),
    "Narrator",
    () => 0.75,
    select({
      rolePool: ["mayor"],
      roleRange: { minimum: 1, maximum: 1 },
      roleOptions: { mayor: ["doubleVote"] },
    }),
  );
  if (!doubleOnly.ok) throw Error(doubleOnly.reason);
  expect(nightScript({ ...doubleOnly.game, night: 2 }).find((c) => c.id === "mayor")?.mode).toBe(
    "skip",
  );
});

it("rejects invalid narrators before drawing and impossible required combinations without RNG", () => {
  for (const narrator of [" ", " PLAYER 0 "])
    expect(createVariableWerewolf(names(10), narrator, noDraw, empty)).toEqual({
      ok: false,
      reason: "invalidPlayers",
    });
  const invalid = select({ requiredRoles: ["bodyguard", "nightGuest"] });
  expect(createVariableWerewolf(names(10), "Narrator", noDraw, invalid)).toEqual({
    ok: false,
    reason: "noFeasibleLineup",
  });
});

const invalidSelections: readonly [
  number,
  unknown,
  Partial<WerewolfSettings>,
  VariableWerewolfFailureReason,
][] = [
  [5, empty, {}, "invalidPlayers"],
  [21, empty, {}, "invalidPlayers"],
  [10, null, {}, "invalidSelection"],
  [10, [], {}, "invalidSelection"],
  [10, { ...empty, itemRange: { minimum: 0, maximum: 0 } }, {}, "obsoleteItemRange"],
  [10, select({ rolePool: ["witch", "witch"] }), {}, "invalidRolePool"],
  [6, select({ rolePool: ["cupid"], wolfCounts: [1] }), {}, "invalidRolePool"],
  [10, select({ requiredRoles: ["hunter"], rolePool: ["hunter"] }), {}, "invalidRolePool"],
  [10, { ...empty, requiredRoles: null }, {}, "invalidRolePool"],
  [10, { ...empty, rolePool: null }, {}, "invalidRolePool"],
  [10, select({ requiredRoles: ["bad" as WerewolfSpecialRole] }), {}, "invalidRolePool"],
  [9, select({ itemPool: ["amulet"] }), {}, "invalidItemPool"],
  [8, select({ requiredItems: ["drunk"], wolfCounts: [1] }), {}, "invalidItemPool"],
  [10, select({ requiredItems: ["amulet"], itemPool: ["amulet"] }), {}, "invalidItemPool"],
  [10, select({ itemPool: ["amulet", "amulet"] }), {}, "invalidItemPool"],
  [10, select({ itemPool: ["bad" as WerewolfItem] }), {}, "invalidItemPool"],
  [10, { ...empty, itemPool: null }, {}, "invalidItemPool"],
  [10, { ...empty, requiredItems: null }, {}, "invalidItemPool"],
  [10, select({ wolfCounts: [] }), {}, "invalidWolfCounts"],
  [10, select({ wolfCounts: [2, 2] }), {}, "invalidWolfCounts"],
  [10, select({ wolfCounts: [3] }), {}, "invalidWolfCounts"],
  [10, select({ wolfCounts: [NaN] }), {}, "invalidWolfCounts"],
  [10, { ...empty, wolfCounts: null }, {}, "invalidWolfCounts"],
  [10, select({ roleRange: { minimum: -1, maximum: 0 } }), {}, "invalidRoleRange"],
  [10, select({ roleRange: { minimum: 1, maximum: 0 } }), {}, "invalidRoleRange"],
  [10, select({ roleRange: { minimum: 0.5, maximum: 1 } }), {}, "invalidRoleRange"],
  [10, select({ roleRange: { minimum: 0, maximum: 1 } }), {}, "invalidRoleRange"],
  [10, { ...empty, roleRange: null }, {}, "invalidRoleRange"],
  [10, empty, { hunterShot: "bad" as "optional" }, "invalidSettings"],
  [10, empty, null as unknown as Partial<WerewolfSettings>, "invalidSettings"],
  [10, empty, [] as unknown as Partial<WerewolfSettings>, "invalidSettings"],
  [10, select({ roleOptions: { hunterShot: [] } }), {}, "invalidRoleOptions"],
  [10, select({ roleOptions: { hunterShot: ["optional", "optional"] } }), {}, "invalidRoleOptions"],
  [10, select({ roleOptions: { hunterShot: ["bad" as "optional"] } }), {}, "invalidRoleOptions"],
  [
    10,
    select({ requiredRoles: ["hunter"], roleOptions: { hunterShot: ["optional", "required"] } }),
    {},
    "invalidRoleOptions",
  ],
  [
    9,
    select({ rolePool: ["mayor"], roleOptions: { mayor: ["doubleVote", "hammer"] } }),
    {},
    "invalidRoleOptions",
  ],
  [9, select({ requiredRoles: ["mayor"] }), { mayor: "hammer" }, "invalidRoleOptions"],
  [10, { ...empty, roleOptions: null }, {}, "invalidRoleOptions"],
  [10, { ...empty, roleOptions: [] }, {}, "invalidRoleOptions"],
  [10, { ...empty, roleOptions: { unknown: true } }, {}, "invalidRoleOptions"],
];
it.each(invalidSelections)(
  "rejects invalid selections without drawing (%s, %s)",
  (players, input, settings, reason) => {
    const selection = input as VariableWerewolfSelection;
    expect(analyzeVariableWerewolfSelection(players, selection, settings)).toEqual({
      ok: false,
      reason,
    });
    expect(drawVariableWerewolfLineup(players, selection, noDraw, settings)).toEqual({
      ok: false,
      reason,
    });
  },
);

it.each([
  [5, {}, {}, "invalidPlayers"],
  [10, null, {}, "invalidSelection"],
  [10, [], {}, "invalidSelection"],
  [10, { requiredRoles: ["hunter", "hunter"] }, {}, "invalidRolePool"],
  [9, { requiredItems: ["amulet"] }, {}, "invalidItemPool"],
  [10, {}, { toughGuy: "bad" }, "invalidSettings"],
  [10, {}, null, "invalidSettings"],
  [10, { roleOptions: null }, {}, "invalidRoleOptions"],
  [10, { requiredRoles: ["hunter"], roleOptions: { hunterShot: [] } }, {}, "invalidRoleOptions"],
  [10, { requiredRoles: ["bodyguard", "nightGuest"] }, {}, "noFeasibleLineup"],
] as const)(
  "rejects invalid recommendation inputs (%s, %s)",
  (players, input, settings, reason) => {
    expect(
      recommendVariableWerewolfCount(
        players,
        input as unknown as VariableWerewolfSelection,
        settings as Partial<WerewolfSettings>,
      ),
    ).toEqual({ ok: false, reason });
  },
);
it.each([
  [8, [], { mayor: "bad" }, false],
  [5, [], {}, false],
  [8, ["magician"], {}, false],
  [9, [], { amulet: true }, false],
  [8, [], { drunk: true }, false],
  [9, ["mayor"], { mayor: "hammer" }, false],
  [11, ["witch", "magician"], {}, false],
  [11, ["witch", "bodyguard"], {}, true],
  [14, ["witch", "magician"], {}, true],
  [10, [], { amulet: true, drunk: true }, true],
] as const)("checks only feasibility for %s %s", (players, roles, settings, expected) => {
  expect(
    hasFeasibleAutomaticWerewolfLineup(players, roles, settings as Partial<WerewolfSettings>),
  ).toBe(expected);
});

it("counts the witch and the magician as one role where they may not play together, and as two where they may", () => {
  // 14 players: together only with four wolves (see validWerewolfRoles).
  const selection = select({
    rolePool: ["magician", "witch"],
    roleRange: { minimum: 0, maximum: 2 },
    wolfCounts: [3, 4],
  });
  const summary = analyze(14, selection);
  const three = summary.wolfCounts.find((wolf) => wolf.wolfCount === 3);
  const four = summary.wolfCounts.find((wolf) => wolf.wolfCount === 4);
  // With three wolves one of them at most (one role), with four wolves both can be drawn (two roles).
  expect(three?.possibleRoleCounts).toEqual([0, 1]);
  expect(four?.possibleRoleCounts).toEqual([0, 1, 2]);

  let seed = 5;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const withThree = { both: 0, magician: 0, none: 0, witch: 0 };
  let bothWithFour = 0;
  const wolfOnly = select({ ...selection, wolfCounts: [3] });
  for (let index = 0; index < 4000; index += 1) {
    const result = drawVariableWerewolfLineup(14, wolfOnly, random);
    if (!result.ok) throw Error(result.reason);
    const roles = result.lineup.roles;
    const key =
      roles.includes("witch") && roles.includes("magician")
        ? "both"
        : roles.includes("witch")
          ? "witch"
          : roles.includes("magician")
            ? "magician"
            : "none";
    withThree[key] += 1;
  }
  expect(withThree.both).toBe(0);
  // One role of the draw: zero or one is drawn with the same chance, and the one is the witch or the magician.
  expect(Math.abs(withThree.none / 4000 - 1 / 2)).toBeLessThan(0.04);
  expect(Math.abs(withThree.witch / 4000 - 1 / 4)).toBeLessThan(0.04);
  expect(Math.abs(withThree.magician / 4000 - 1 / 4)).toBeLessThan(0.04);
  const fourOnly = select({ ...selection, wolfCounts: [4] });
  for (let index = 0; index < 2000; index += 1) {
    const result = drawVariableWerewolfLineup(14, fourOnly, random);
    if (!result.ok) throw Error(result.reason);
    if (result.lineup.roles.includes("witch") && result.lineup.roles.includes("magician"))
      bothWithFour += 1;
  }
  expect(bothWithFour).toBeGreaterThan(300);
});

it("lets both the witch and the magician be required where they may play together", () => {
  const selection = select({ requiredRoles: ["magician", "witch"], wolfCounts: [4] });
  expect(analyze(14, selection).canStart).toBe(true);
  expect(analyze(14, select({ ...selection, wolfCounts: [3] })).canStart).toBe(false);
});

it("gives every single role the same chance, though the guards exclude each other", () => {
  let seed = 3;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const rates = (selection: VariableWerewolfSelection) => {
    const draws = 12000;
    const hits: Record<string, number> = {};
    let both = 0;
    for (let index = 0; index < draws; index += 1) {
      const result = drawVariableWerewolfLineup(12, selection, random);
      if (!result.ok) throw Error(result.reason);
      const roles = result.lineup.roles;
      if (roles.includes("bodyguard") && roles.includes("nightGuest")) both += 1;
      for (const role of roles) hits[role] = (hits[role] ?? 0) + 1;
    }
    return { both, rate: (role: string) => (hits[role] ?? 0) / draws };
  };
  // Four roles, two of them the guards, two drawn: each role is in with half the draws.
  const two = rates(
    select({
      rolePool: ["bodyguard", "cupid", "nightGuest", "witch"],
      roleRange: { minimum: 2, maximum: 2 },
      wolfCounts: [3],
    }),
  );
  expect(two.both).toBe(0);
  for (const role of ["bodyguard", "nightGuest", "cupid", "witch"]) {
    expect(Math.abs(two.rate(role) - 0.5)).toBeLessThan(0.03);
  }
  // One drawn: a quarter each.
  const one = rates(
    select({
      rolePool: ["bodyguard", "cupid", "nightGuest", "witch"],
      roleRange: { minimum: 1, maximum: 1 },
      wolfCounts: [3],
    }),
  );
  for (const role of ["bodyguard", "nightGuest", "cupid", "witch"]) {
    expect(Math.abs(one.rate(role) - 0.25)).toBeLessThan(0.03);
  }
  // Three drawn: the guards are one role, so they are always in (one of them), and the others are certain, too.
  const three = rates(
    select({
      rolePool: ["bodyguard", "cupid", "nightGuest", "witch"],
      roleRange: { minimum: 3, maximum: 3 },
      wolfCounts: [3],
    }),
  );
  expect(three.both).toBe(0);
  expect(three.rate("cupid")).toBe(1);
  expect(three.rate("witch")).toBe(1);
  expect(Math.abs(three.rate("bodyguard") - 0.5)).toBeLessThan(0.03);
});
