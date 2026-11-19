import { expect, it, vi } from "vitest";
import * as balance from "./lineupBalance";
import { drawAutomaticWerewolfLineup, hasFeasibleAutomaticWerewolfLineup } from "./automaticSetup";
import {
  availableWerewolfCounts,
  availableWerewolfRoles,
  type WerewolfSettings,
  type WerewolfSpecialRole,
} from "./configuration";
import { transitionWerewolf } from "./stateMachine";
import {
  analyzeVariableWerewolfSelection,
  createVariableWerewolf,
  drawVariableWerewolfLineup,
  type VariableWerewolfSelection,
  type WerewolfItem,
} from "./variableSetup";
const names = (players: number) =>
  Array.from({ length: players }, (_, i) => `Player ${i}`).join(",");
const empty: VariableWerewolfSelection = {
  rolePool: [],
  roleRange: { minimum: 0, maximum: 0 },
  itemPool: [],
  itemRange: { minimum: 0, maximum: 0 },
};
const select = (
  roles: readonly WerewolfSpecialRole[],
  minimum: number,
  maximum: number,
  items: readonly WerewolfItem[] = [],
  itemMin = 0,
  itemMax = 0,
): VariableWerewolfSelection => ({
  rolePool: roles,
  roleRange: { minimum, maximum },
  itemPool: items,
  itemRange: { minimum: itemMin, maximum: itemMax },
});
const noDraw = () => {
  throw Error("Unexpected randomness");
};

it("weights feasible role/item count pairs equally instead of preferring larger pools", () => {
  const selection = select(["witch", "hunter"], 0, 2, ["amulet", "drunk"], 0, 2);
  const summary = analyzeVariableWerewolfSelection(12, selection);
  expect(summary.ok).toBe(true);
  if (!summary.ok) throw Error("Invalid summary");
  expect(summary.groups).toHaveLength(9);
  expect(JSON.stringify(summary)).not.toMatch(/witch|hunter|amulet|drunk/);
  let amuletProbability = 0,
    drunkProbability = 0;
  const roleProbability = [0, 0, 0],
    itemProbability = [0, 0, 0];
  for (const [groupIndex, group] of summary.groups.entries()) {
    const seen = new Set<string>();
    for (let choice = 0; choice < group.choices; choice++) {
      const draws = [(groupIndex + 0.5) / 9, (choice + 0.5) / group.choices];
      const result = drawVariableWerewolfLineup(12, selection, () => draws.shift()!);
      expect(result.ok).toBe(true);
      if (!result.ok) throw Error(result.reason);
      const weight = 1 / 9 / group.choices;
      roleProbability[result.lineup.roles.length]! += weight;
      itemProbability[result.items.length]! += weight;
      amuletProbability += Number(result.items.includes("amulet")) * weight;
      drunkProbability += Number(result.items.includes("drunk")) * weight;
      seen.add(JSON.stringify([result.lineup.roles, result.items]));
    }
    expect(seen.size).toBe(group.choices);
  }
  for (const probability of [...roleProbability, ...itemProbability])
    expect(probability).toBeCloseTo(1 / 3);
  expect(amuletProbability).toBeCloseTo(0.5);
  expect(drunkProbability).toBeCloseTo(0.5);
});

it("excludes impossible subsets while retaining feasible values in a configured range", () => {
  const selection = select(["bodyguard", "nightGuest"], 0, 2);
  expect(analyzeVariableWerewolfSelection(10, selection)).toEqual({
    ok: true,
    groups: [
      { roleCount: 0, itemCount: 0, choices: 1 },
      { roleCount: 1, itemCount: 0, choices: 2 },
    ],
  });
  expect(drawVariableWerewolfLineup(10, select(["bodyguard", "nightGuest"], 2, 2), noDraw)).toEqual(
    { ok: false, reason: "noFeasibleLineup" },
  );
  expect(drawVariableWerewolfLineup(11, select(["witch", "magician"], 2, 2), noDraw)).toEqual({
    ok: false,
    reason: "noFeasibleLineup",
  });
  const combined = drawVariableWerewolfLineup(14, select(["witch", "magician"], 2, 2), () => 0);
  expect(combined.ok && combined.lineup.balance.recommendedWolfCount).toBe(4);
});

it.each([
  [5, empty, {}, "invalidPlayers"],
  [21, empty, {}, "invalidPlayers"],
  [10, select(["witch", "witch"], 0, 1), {}, "invalidRolePool"],
  [6, select(["cupid"], 0, 1), {}, "invalidRolePool"],
  [9, select(["mayor"], 0, 1), { mayor: "hammer" }, "invalidRolePool"],
  [9, select([], 0, 0, ["amulet"], 0, 1), {}, "invalidItemPool"],
  [8, select([], 0, 0, ["drunk"], 0, 1), {}, "invalidItemPool"],
  [12, select([], 0, 0, ["amulet", "amulet"], 0, 1), {}, "invalidItemPool"],
  [12, select([], 0, 0, ["bad" as WerewolfItem], 0, 1), {}, "invalidItemPool"],
  [12, select(["witch"], -1, 1), {}, "invalidRoleRange"],
  [12, select(["witch"], 0, 2), {}, "invalidRoleRange"],
  [12, select(["witch"], 1, 0), {}, "invalidRoleRange"],
  [12, select(["witch"], 0.5, 1), {}, "invalidRoleRange"],
  [12, select(["witch"], 0, Infinity), {}, "invalidRoleRange"],
  [12, select([], 0, 0, [], 0, 1), {}, "invalidItemRange"],
  [12, empty, { hunterShot: "bad" }, "invalidSettings"],
] as const)("rejects invalid variable selection %s %s", (players, selection, settings, reason) => {
  expect(
    drawVariableWerewolfLineup(players, selection, noDraw, settings as Partial<WerewolfSettings>),
  ).toEqual({ ok: false, reason });
  expect(
    analyzeVariableWerewolfSelection(players, selection, settings as Partial<WerewolfSettings>),
  ).toEqual({ ok: false, reason });
});

it.each([NaN, Infinity, -0.1, 1])(
  "rejects invalid random draw %s in either selection stage",
  (value) => {
    expect(drawVariableWerewolfLineup(10, empty, () => value)).toEqual({
      ok: false,
      reason: "invalidRandom",
    });
    const draws = [0, value];
    expect(drawVariableWerewolfLineup(10, empty, () => draws.shift()!)).toEqual({
      ok: false,
      reason: "invalidRandom",
    });
  },
);

it("allows zero roles/items and ignores externally forced wolves or item flags", () => {
  const result = drawVariableWerewolfLineup(10, empty, () => 0.99, {
    wolfCount: 99,
    wolfCountMode: "balanced",
    amulet: true,
    drunk: true,
  });
  expect(result.ok).toBe(true);
  if (!result.ok) throw Error(result.reason);
  expect(result.items).toEqual([]);
  expect(result.lineup.roles).toEqual([]);
  expect(result.lineup.settings).toMatchObject({ amulet: false, drunk: false });
  expect(result.lineup.balance.recommendedWolfCount).toBe(2);
});

it("is deterministic for equivalent pools without mutating selections or settings", () => {
  const selection = select(["witch", "hunter"], 0, 2, ["drunk", "amulet"], 0, 2);
  const before = JSON.stringify(selection);
  const settings = Object.freeze({ wolfCount: 99, hunterShot: "required" as const });
  const first = drawVariableWerewolfLineup(12, selection, () => 0.45, settings);
  const second = drawVariableWerewolfLineup(
    12,
    { ...selection, rolePool: ["hunter", "witch"], itemPool: ["amulet", "drunk"] },
    () => 0.45,
    settings,
  );
  expect(first).toEqual(second);
  expect(JSON.stringify(selection)).toBe(before);
});

it("supports forced amulet participation and keeps the selected setup fixed through role reveal", () => {
  let draws = 0;
  const result = createVariableWerewolf(
    names(10),
    "Narrator",
    () => {
      draws++;
      return 0.99;
    },
    select(["cupid"], 1, 1, ["amulet", "drunk"], 2, 2),
  );
  expect(result.ok).toBe(true);
  if (!result.ok) throw Error(result.reason);
  const game = result.game;
  expect(game.amulet).not.toBeNull();
  expect(game.drunk).not.toBeNull();
  expect(game.players.find((p) => p.name === game.amulet?.holder)?.role).not.toBe("wolf");
  expect(game.players.find((p) => p.name === game.drunk?.player)?.role).not.toBe("cupid");
  let state = game;
  const count = draws;
  for (const player of game.players)
    state = transitionWerewolf(state, { type: "roleSeen", player: player.name });
  expect(state.players).toEqual(game.players);
  expect(draws).toBe(count);
  expect(state.settings.wolfCount).toBe(2);
});

it.each([6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20])(
  "creates a valid private variable game at %i players",
  (players) => {
    const pool = availableWerewolfRoles(players);
    const items: WerewolfItem[] =
      players >= 10 ? ["amulet", "drunk"] : players >= 9 ? ["drunk"] : [];
    const result = createVariableWerewolf(
      names(players),
      "Narrator",
      () => 0.999,
      select(pool, 0, pool.length, items, 0, items.length),
      { wolfCount: 99 },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) throw Error(result.reason);
    const game = result.game;
    expect(game.players).toHaveLength(players);
    expect(game.players.filter((p) => p.role === "seer")).toHaveLength(1);
    expect(availableWerewolfCounts(players)).toContain(game.settings.wolfCount);
    const specials = game.players.filter((p) => !["seer", "wolf", "villager"].includes(p.role));
    expect(new Set(specials.map((p) => p.role)).size).toBe(specials.length);
    expect(
      game.players.some((p) => p.role === "bodyguard") &&
        game.players.some((p) => p.role === "nightGuest"),
    ).toBe(false);
    if (players === 9 || players === 10) expect(game.settings.wolfCount).toBe(2);
    if (players === 11)
      expect(
        game.players.some((p) => p.role === "witch") &&
          game.players.some((p) => p.role === "magician"),
      ).toBe(false);
  },
);

it("rejects invalid narrators, impossible selections and late invalid shuffle draws", () => {
  expect(createVariableWerewolf(names(10), " ", noDraw, empty)).toEqual({
    ok: false,
    reason: "invalidPlayers",
  });
  expect(createVariableWerewolf(names(10), " PLAYER 0 ", noDraw, empty)).toEqual({
    ok: false,
    reason: "invalidPlayers",
  });
  expect(
    createVariableWerewolf(
      names(10),
      "Narrator",
      noDraw,
      select(["bodyguard", "nightGuest"], 2, 2),
    ),
  ).toEqual({ ok: false, reason: "noFeasibleLineup" });
  let draws = 0;
  expect(
    createVariableWerewolf(names(10), "Narrator", () => (++draws <= 2 ? 0 : NaN), empty),
  ).toEqual({ ok: false, reason: "invalidRandom" });
});

it("scores only the drawn roles and items after both random choices", () => {
  const score = vi.spyOn(balance, "evaluateWerewolfLineup");
  try {
    const selection = select(["witch", "hunter", "bodyguard"], 0, 3, ["amulet", "drunk"], 0, 2);
    expect(analyzeVariableWerewolfSelection(12, selection).ok).toBe(true);
    expect(score).not.toHaveBeenCalled();
    let draws = 0;
    const result = drawVariableWerewolfLineup(12, selection, () => {
      expect(score).not.toHaveBeenCalled();
      draws++;
      return 0.999;
    });
    expect(draws).toBe(2);
    expect(result.ok).toBe(true);
    if (!result.ok) throw Error(result.reason);
    expect(score).toHaveBeenCalled();
    for (const call of score.mock.calls) {
      expect(call[1]).toEqual(result.lineup.roles);
      expect(call[2]).toMatchObject({
        amulet: result.items.includes("amulet"),
        drunk: result.items.includes("drunk"),
      });
    }
    score.mockClear();
    const exact = drawAutomaticWerewolfLineup(12, ["witch", "hunter", "bodyguard"], 1, () => {
      expect(score).not.toHaveBeenCalled();
      return 0.99;
    });
    expect(exact).not.toBeNull();
    for (const call of score.mock.calls) expect(call[1]).toEqual(exact?.roles);
  } finally {
    score.mockRestore();
  }
});

it("does not calculate a wolf score when the random choice is invalid", () => {
  const score = vi.spyOn(balance, "evaluateWerewolfLineup");
  try {
    expect(drawVariableWerewolfLineup(12, select(["witch"], 0, 1), () => NaN)).toEqual({
      ok: false,
      reason: "invalidRandom",
    });
    expect(drawAutomaticWerewolfLineup(12, ["witch"], 1, () => NaN)).toBeNull();
    expect(score).not.toHaveBeenCalled();
  } finally {
    score.mockRestore();
  }
});

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
