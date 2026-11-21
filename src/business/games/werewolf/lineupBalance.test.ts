import { describe, expect, it, vi } from "vitest";
import { createBalancedWerewolf, createRandomWerewolf } from "./balancedSetup";
import { resolveAutomaticWerewolfLineup } from "./automaticSetup";
import {
  availableWerewolfCounts,
  calculatedWerewolfCounts,
  werewolfPlayerLimits,
  availableWerewolfRoles,
  validWerewolfRoles,
  type WerewolfSpecialRole,
} from "./configuration";
import { drawWerewolfLineup, evaluateWerewolfLineup, scoreWerewolfVillage } from "./lineupBalance";
import { createWerewolf } from "./stateMachine";

const names = (players: number) =>
  Array.from({ length: players }, (_, i) => `Player ${i + 1}`).join(",");

describe("werewolf role points", () => {
  it("counts the seer once and reports every contribution", () => {
    const result = evaluateWerewolfLineup(12, ["witch", "bodyguard"]);
    expect(result).not.toBeNull();
    expect(result?.contributions.filter((entry) => entry.id === "seer")).toHaveLength(1);
    expect(result?.villagePoints).toBe(
      result?.contributions.reduce((sum, item) => sum + item.points, 0),
    );
  });

  it("accounts for item settings, altered night rules and role combinations", () => {
    const base = evaluateWerewolfLineup(14, [
      "magician",
      "nightGuest",
      "apprenticeSeer",
      "paranormalInvestigator",
    ]);
    expect(base?.contributions.map((item) => item.id)).toContain("magician+nightGuest");
    expect(base?.contributions.map((item) => item.id)).toContain(
      "apprenticeSeer+paranormalInvestigator",
    );
    const changed = evaluateWerewolfLineup(
      14,
      ["magician", "nightGuest", "apprenticeSeer", "paranormalInvestigator"],
      {
        amulet: true,
        drunk: true,
        attackOnFirstNight: true,
      },
    );
    expect(changed?.contributions.map((item) => item.id)).toEqual(
      expect.arrayContaining(["amulet", "drunk", "earlyAttack"]),
    );
    expect(changed?.villagePoints).not.toBe(base?.villagePoints);
  });

  it("counts only the selected mayor variant and silence setting", () => {
    const double = scoreWerewolfVillage(["mayor", "spellcaster"]);
    const hammer = scoreWerewolfVillage(["mayor", "spellcaster"], {
      mayor: "hammer",
      allowSelfSilence: true,
    });
    expect(hammer.find((item) => item.id === "mayor")?.points).not.toBe(
      double.find((item) => item.id === "mayor")?.points,
    );
    expect(hammer.map((item) => item.id)).toContain("selfSilence");
    expect(scoreWerewolfVillage([], { mayor: "hammer", allowSelfSilence: true })).toHaveLength(1);
  });

  it("can explain the score of a hypothetical combined healer lineup", () => {
    const points = scoreWerewolfVillage(["witch", "magician"]);
    expect(points.map((item) => item.id)).toEqual(["seer", "witch", "magician"]);
    expect(evaluateWerewolfLineup(14, ["witch", "magician"])?.recommendedWolfCount).toBe(4);
    expect(evaluateWerewolfLineup(14, ["witch", "magician"], { wolfCount: 3 })).toBeNull();
    expect(evaluateWerewolfLineup(15, ["witch", "magician"])?.recommendedWolfCount).toBe(4);
    expect(evaluateWerewolfLineup(15, ["witch", "magician"], { wolfCount: 3 })).toBeNull();
  });
});

describe("wolf recommendation", () => {
  it("recommends fewer wolves for a plain twelve-player village and more with the magician", () => {
    expect(evaluateWerewolfLineup(12, [])?.recommendedWolfCount).toBe(2);
    expect(evaluateWerewolfLineup(12, ["magician"])?.recommendedWolfCount).toBe(3);
    expect(
      evaluateWerewolfLineup(12, ["magician"], { attackOnFirstNight: true })?.recommendedWolfCount,
    ).toBe(3);
  });

  it("recommends four wolves for a strong fourteen-player village", () => {
    expect(evaluateWerewolfLineup(14, [])?.recommendedWolfCount).toBe(2);
    const roles: WerewolfSpecialRole[] = [
      "magician",
      "hunter",
      "idiot",
      "bodyguard",
      "toughGuy",
      "apprenticeSeer",
      "paranormalInvestigator",
    ];
    expect(evaluateWerewolfLineup(14, roles)?.recommendedWolfCount).toBe(4);
    expect(evaluateWerewolfLineup(14, roles, { wolfCount: 3 })?.recommendedWolfCount).toBe(3);
  });

  it("distinguishes the calculated recommendation from standard mode and marks weaker evidence", () => {
    expect(evaluateWerewolfLineup(6, [], { wolfCount: 1 })).toMatchObject({
      recommendedWolfCount: 1,
      evidence: "baselineOnly",
    });
    expect(
      evaluateWerewolfLineup(11, ["magician"])
        ?.candidates.map((candidate) => candidate.wolfCount)
        .sort(),
    ).toEqual([2, 3]);
    expect(evaluateWerewolfLineup(6, [])?.evidence).toBe("provisional");
    expect(evaluateWerewolfLineup(10, ["hunter"], { hunterShot: "required" })?.evidence).toBe(
      "provisional",
    );
    expect(evaluateWerewolfLineup(15, [])?.evidence).toBe("provisional");
    expect(availableWerewolfCounts(8)).toEqual([1, 2]);
  });

  it("compares permitted starting minorities for fifteen players with the witch", () => {
    const result = evaluateWerewolfLineup(15, ["witch"]);
    expect(result?.candidates.map((item) => item.wolfCount).sort((a, b) => a - b)).toEqual([
      1, 2, 3, 4,
    ]);
    expect(result).toMatchObject({
      recommendedWolfCount: 3,
      villagePoints: 8.5,
      evidence: "provisional",
    });
    expect(result?.candidates[0]).toEqual({ wolfCount: 3, villageTarget: 9.5, difference: -1 });
  });

  it("filters wolf counts that leave too few role slots", () => {
    const roles = availableWerewolfRoles(12).filter(
      (role) => !["nightGuest", "magician", "cupid", "tanner"].includes(role),
    );
    expect(roles).toHaveLength(9);
    expect(evaluateWerewolfLineup(12, roles)?.candidates.map((item) => item.wolfCount)).toEqual([
      2, 1,
    ]);
  });

  it.each([
    [5, []],
    [21, []],
    [12.5, []],
    [NaN, []],
    [12, ["witch", "witch"]],
    [12, ["bodyguard", "nightGuest"]],
    [10, ["magician"]],
    [6, ["paranormalInvestigator"]],
    [12, ["unknown"]],
  ] as const)("rejects invalid setup %s %s", (players, roles) => {
    expect(evaluateWerewolfLineup(players, roles as readonly WerewolfSpecialRole[])).toBeNull();
  });

  it.each([
    [8, { drunk: true }],
    [9, { amulet: true }],
    [9, { mayor: "hammer" }],
    [12, { wolfCount: 6 }],
    [8, { wolfCount: 4 }],
  ] as const)("rejects unavailable settings for %s players", (players, settings) => {
    const roles: WerewolfSpecialRole[] = "mayor" in settings ? ["mayor"] : [];
    expect(evaluateWerewolfLineup(players, roles, settings)).toBeNull();
  });
});

describe("random setup", () => {
  it("chooses each compatible subset from a pool containing both healing roles", () => {
    const pool: WerewolfSpecialRole[] = ["witch", "magician", "bodyguard"];
    expect(drawWerewolfLineup(13, pool, 2, () => 0)?.roles).toEqual(["witch", "bodyguard"]);
    expect(drawWerewolfLineup(13, pool, 2, () => 0.499)?.roles).toEqual(["witch", "bodyguard"]);
    expect(drawWerewolfLineup(13, pool, 2, () => 0.5)?.roles).toEqual(["magician", "bodyguard"]);
    expect(drawWerewolfLineup(13, pool, 2, () => 0.999)?.roles).toEqual(["magician", "bodyguard"]);
  });

  it("allows a filler-only draw and rejects impossible pools before using randomness", () => {
    const random = vi.fn(() => 0);
    expect(drawWerewolfLineup(12, [], 0, random)?.roles).toEqual([]);
    random.mockClear();
    expect(drawWerewolfLineup(12, ["witch", "magician"], 2, random)).toBeNull();
    expect(random).not.toHaveBeenCalled();
  });

  it.each([-1, 0.5, 2])("rejects an unavailable selected role count %s", (count) => {
    expect(drawWerewolfLineup(12, ["witch"], count, () => 0)).toBeNull();
  });

  it("rejects duplicates, unavailable roles and oversized pools", () => {
    expect(drawWerewolfLineup(12, ["witch", "witch"], 1, () => 0)).toBeNull();
    expect(drawWerewolfLineup(6, ["cupid"], 1, () => 0)).toBeNull();
    expect(
      drawWerewolfLineup(12, Array<WerewolfSpecialRole>(14).fill("witch"), 1, () => 0),
    ).toBeNull();
  });

  it.each([NaN, Infinity, -0.1, 1])("rejects invalid random value %s", (value) => {
    expect(drawWerewolfLineup(12, [], 0, () => value)).toBeNull();
  });
});

describe("normal game entry points", () => {
  it("supports the final twenty-player limit and rejects larger tables", () => {
    expect(werewolfPlayerLimits).toEqual({ minimum: 6, supportedMaximum: 20, targetMaximum: 20 });
    expect(createWerewolf(names(18), "Narrator", () => 0.99)?.settings.wolfCount).toBe(4);
    expect(availableWerewolfCounts(18)).toEqual([3, 4, 5]);
    expect(calculatedWerewolfCounts(18)).toEqual([3, 4, 5]);
    for (const players of [21, 22]) {
      expect(availableWerewolfCounts(players)).toEqual([]);
      expect(createWerewolf(names(players), "Narrator", () => 0.99)).toBeNull();
    }
    for (const wolfCount of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
      const permitted = wolfCount >= 3 && wolfCount <= 5;
      for (const wolfCountMode of ["standard", "balanced"] as const) {
        expect(
          createWerewolf(names(18), "Narrator", () => 0, [], { wolfCount, wolfCountMode }) !== null,
        ).toBe(permitted);
      }
      expect(evaluateWerewolfLineup(18, [], { wolfCount }) !== null).toBe(permitted);
    }
    expect(evaluateWerewolfLineup(18, ["witch"])?.evidence).toBe("provisional");
  });

  it("keeps the two protection roles exclusive at eighteen players and fills remaining seats", () => {
    expect(createWerewolf(names(18), "Narrator", () => 0, ["bodyguard", "nightGuest"])).toBeNull();
    expect(drawWerewolfLineup(18, ["bodyguard", "nightGuest"], 2, () => 0)).toBeNull();
    const roles = availableWerewolfRoles(18).filter((role) => role !== "nightGuest");
    for (const wolfCount of [4, 5]) {
      const game = createWerewolf(names(18), "Narrator", () => 0.99, roles, { wolfCount });
      expect(game?.players.filter((player) => player.role === "villager")).toHaveLength(
        5 - wolfCount,
      );
    }
  });
  it("evaluates seventeen-player wolf counts independently of the earlier four-wolf limit", () => {
    expect(availableWerewolfCounts(17)).toEqual([3, 4, 5]);
    expect(createWerewolf(names(17), "Narrator", () => 0.99)?.settings.wolfCount).toBe(4);
    expect(createWerewolf(names(16), "Narrator", () => 0.99)?.settings.wolfCount).toBe(4);
    expect(
      evaluateWerewolfLineup(17, [])
        ?.candidates.map((candidate) => candidate.wolfCount)
        .sort((a, b) => a - b),
    ).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    for (const wolfCount of [3, 4, 5]) {
      expect(
        createWerewolf(names(17), "Narrator", () => 0.99, [], { wolfCount })?.players,
      ).toHaveLength(17);
      const match = createRandomWerewolf(names(17), "Narrator", () => 0, ["witch", "magician"], 2, {
        wolfCount,
      });
      expect(match?.settings.wolfCount).toBeGreaterThanOrEqual(4);
    }
    expect(evaluateWerewolfLineup(17, ["witch"], { wolfCount: 5 })?.evidence).toBe("provisional");
    expect(createWerewolf(names(16), "Narrator", () => 0, [], { wolfCount: 5 })).toBeNull();
    expect(evaluateWerewolfLineup(15, [], { wolfCount: 5 })).toBeNull();
  });
  it("supports sixteen-player manual, balanced and random setups within the wolf limit", () => {
    expect(availableWerewolfCounts(16)).toEqual([3, 4]);
    expect(createWerewolf(names(16), "Narrator", () => 0.99)?.settings.wolfCount).toBe(4);
    expect(evaluateWerewolfLineup(16, [])?.evidence).toBe("provisional");
    for (const wolfCount of [3, 4, 5]) {
      const settings = { wolfCount };
      expect(createWerewolf(names(16), "Narrator", () => 0.99, [], settings) !== null).toBe(
        wolfCount <= 4,
      );
    }
    const rating = evaluateWerewolfLineup(16, ["witch"]);
    expect(rating?.candidates.every((candidate) => Number.isFinite(candidate.difference))).toBe(
      true,
    );
    expect(createWerewolf(names(21), "Narrator", () => 0.99)).toBeNull();
  });
  it.each([5, 6, 7])("rejects %i wolves through every setup entry point", (wolfCount) => {
    for (const wolfCountMode of ["standard", "balanced"] as const) {
      expect(
        createWerewolf(names(15), "Narrator", () => 0.99, [], { wolfCount, wolfCountMode }),
      ).toBeNull();
    }
    expect(evaluateWerewolfLineup(15, [], { wolfCount })).toBeNull();
    expect(drawWerewolfLineup(15, ["witch"], 1, () => 0, { wolfCount })).toBeNull();
  });
  it("offers tested fifteen-player wolf counts and keeps healer conflicts consistent", () => {
    expect(availableWerewolfCounts(15)).toEqual([3, 4]);
    for (const wolfCount of [3, 4, 5, 6]) {
      const match = createWerewolf(names(15), "Narrator", () => 0.99, ["witch", "magician"], {
        wolfCount,
      });
      expect(match !== null).toBe(wolfCount === 4);
      expect(validWerewolfRoles(15, ["witch", "magician"], wolfCount, "balanced")).toBe(
        wolfCount === 4,
      );
    }
    expect(createWerewolf(names(15), "Narrator", () => 0.99)?.settings.wolfCount).toBe(3);
  });
  it.each([6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18])(
    "starts every recommended role selection at %i players",
    (players) => {
      const pool = availableWerewolfRoles(players);
      for (let mask = 0; mask < 2 ** pool.length; mask++) {
        const roles = pool.filter((_, index) => (mask & (1 << index)) !== 0);
        const assessment = resolveAutomaticWerewolfLineup(players, roles)?.balance;
        if (!assessment) continue;
        expect(assessment.recommendedWolfCount).toBeLessThanOrEqual(players >= 17 ? 5 : 4);
        const match = createBalancedWerewolf(names(players), "Narrator", () => 0.99, roles);
        expect(match?.players).toHaveLength(players);
        expect(match?.players.filter((player) => player.role === "wolf")).toHaveLength(
          assessment.recommendedWolfCount,
        );
        expect(match?.players.filter((player) => player.role === "seer")).toHaveLength(1);
        expect(match?.players.filter((player) => player.role === "villager")).toHaveLength(
          players - roles.length - assessment.recommendedWolfCount - 1,
        );
      }
    },
  );

  it("starts with the recommended count and fills the remaining seats", () => {
    const match = createBalancedWerewolf(names(12), "Narrator", () => 0.99, []);
    expect(match?.players.filter((player) => player.role === "wolf")).toHaveLength(2);
    expect(match?.players.filter((player) => player.role === "villager")).toHaveLength(9);
    expect(match?.players.filter((player) => player.role === "seer")).toHaveLength(1);
    expect(createWerewolf(names(12), "Narrator", () => 0.99)?.settings.wolfCount).toBe(3);
    expect(createBalancedWerewolf(names(10), "Narrator", () => 0.99, ["magician"])).toBeNull();
  });

  it("starts a private random game with only the chosen number of special roles", () => {
    const match = createRandomWerewolf(
      names(14),
      "Narrator",
      () => 0.99,
      ["witch", "magician", "bodyguard"],
      2,
    );
    expect(match?.status).toBe("roles");
    expect(
      match?.players.filter((player) => ["witch", "magician", "bodyguard"].includes(player.role)),
    ).toHaveLength(2);
    expect(match?.players).toEqual(
      createRandomWerewolf(names(14), "Narrator", () => 0.99, ["bodyguard", "magician", "witch"], 2)
        ?.players,
    );
    expect(createRandomWerewolf(names(14), " ", () => 0, [], 0)).toBeNull();
    expect(createRandomWerewolf(names(14), " PLAYER 1 ", () => 0, [], 0)).toBeNull();
  });

  it("refuses every setup with more selected roles than seats", () => {
    const roles = availableWerewolfRoles(14).filter(
      (role) => !["nightGuest", "magician"].includes(role),
    );
    expect(validWerewolfRoles(14, roles, 4)).toBe(false);
    expect(availableWerewolfCounts(Infinity)).toEqual([]);
  });
});

it.each([19, 20])("validates %i-player setup boundaries through every entry point", (players) => {
  expect(createWerewolf(names(players), "Narrator", () => 0.99)?.settings.wolfCount).toBe(4);
  expect(availableWerewolfCounts(players)).toEqual([3, 4, 5]);
  expect(calculatedWerewolfCounts(players)).toEqual([3, 4, 5]);
  for (const wolfCount of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
    const allowed = wolfCount >= 3 && wolfCount <= 5;
    for (const wolfCountMode of ["standard", "balanced"] as const)
      expect(
        createWerewolf(names(players), "Narrator", () => 0, [], { wolfCount, wolfCountMode }) !==
          null,
      ).toBe(allowed);
    expect(evaluateWerewolfLineup(players, [], { wolfCount }) !== null).toBe(allowed);
    expect(
      createWerewolf(names(players), "Narrator", () => 0, ["witch", "magician"], { wolfCount }) !==
        null,
    ).toBe(allowed && wolfCount >= 4);
  }
  expect(
    createWerewolf(names(players), "Narrator", () => 0, ["bodyguard", "nightGuest"]),
  ).toBeNull();
  const roles = availableWerewolfRoles(players).filter((role) => role !== "nightGuest");
  for (const wolfCount of [4, 5]) {
    const game = createWerewolf(names(players), "Narrator", () => 0.99, roles, { wolfCount });
    expect(game?.players.filter((p) => p.role === "villager")).toHaveLength(
      players - 13 - wolfCount,
    );
  }
  const rating = evaluateWerewolfLineup(players, ["witch"]);
  expect(rating?.evidence).toBe("provisional");
  expect(
    rating?.candidates.every(
      (candidate) =>
        Number.isFinite(candidate.difference) && Number.isFinite(candidate.villageTarget),
    ),
  ).toBe(true);
});

it("respects both eight-player wolf choices and remaining role seats", () => {
  expect(calculatedWerewolfCounts(8)).toEqual([1, 2]);
  for (const wolfCount of [1, 2, 3]) {
    const allowed = wolfCount <= 2;
    expect(createWerewolf(names(8), "Narrator", () => 0, [], { wolfCount }) !== null).toBe(allowed);
  }
  const roles: WerewolfSpecialRole[] = [
    "witch",
    "hunter",
    "idiot",
    "bodyguard",
    "apprenticeSeer",
    "toughGuy",
  ];
  expect(createWerewolf(names(8), "Narrator", () => 0, roles, { wolfCount: 2 })).toBeNull();
  expect(
    createWerewolf(names(8), "Narrator", () => 0, roles, { wolfCount: 1 })?.settings.wolfCount,
  ).toBe(1);
});

it.each([
  { players: 7, counts: [1, 2], standard: 1 },
  { players: 11, counts: [2, 3], standard: 2 },
])("uses approved optional wolves at $players players", ({ players, counts, standard }) => {
  expect(availableWerewolfCounts(players)).toEqual(counts);
  expect(calculatedWerewolfCounts(players)).toEqual(counts);
  expect(createWerewolf(names(players), "Narrator", () => 0.99)?.settings.wolfCount).toBe(standard);
  for (const wolfCount of [1, 2, 3, 4]) {
    const allowed = counts.includes(wolfCount);
    for (const wolfCountMode of ["standard", "balanced"] as const)
      expect(
        createWerewolf(names(players), "Narrator", () => 0, [], { wolfCount, wolfCountMode }) !==
          null,
      ).toBe(allowed);
  }
  const maxWolves = Math.max(...counts);
  const pool = availableWerewolfRoles(players).filter(
    (role) => role !== "nightGuest" && role !== "magician",
  );
  const fitting = pool.slice(0, players - maxWolves - 1);
  expect(
    createWerewolf(names(players), "Narrator", () => 0, fitting, { wolfCount: maxWolves }),
  ).not.toBeNull();
  expect(
    createWerewolf(names(players), "Narrator", () => 0, pool.slice(0, players - maxWolves), {
      wolfCount: maxWolves,
    }),
  ).toBeNull();
  if (players === 7)
    expect(
      createWerewolf(names(players), "Narrator", () => 0, [], { wolfCount: 2, drunk: true }),
    ).toBeNull();
  else
    for (const wolfCount of counts) {
      expect(
        createWerewolf(names(players), "Narrator", () => 0, ["magician"], { wolfCount }),
      ).not.toBeNull();
      expect(
        createWerewolf(names(players), "Narrator", () => 0, ["witch", "magician"], { wolfCount }),
      ).toBeNull();
    }
});
