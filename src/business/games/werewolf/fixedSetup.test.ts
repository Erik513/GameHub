import { describe, expect, it } from "vitest";
import { createFixedWerewolf, resolveFixedWerewolfLineup } from "./fixedSetup";
import {
  availableWerewolfCounts,
  standardWerewolfCount,
  type WerewolfSettings,
} from "./configuration";

const names = (count: number) => Array.from({ length: count }, (_, i) => `Player ${i}`).join(",");

describe("fixed-role setup", () => {
  it("preserves every approved count from six to twenty and fills the remaining seats", () => {
    for (let players = 6; players <= 20; players++) {
      expect(resolveFixedWerewolfLineup(players, [])?.settings.wolfCount).toBe(
        standardWerewolfCount(players),
      );
      for (const wolfCount of availableWerewolfCounts(players)) {
        const game = createFixedWerewolf(names(players), "Narrator", () => 0.5, [], { wolfCount });
        expect(game?.settings.wolfCount).toBe(wolfCount);
        expect(game?.players).toHaveLength(players);
        expect(game?.players.filter((p) => p.role === "wolf")).toHaveLength(wolfCount);
        expect(game?.players.filter((p) => p.role === "seer")).toHaveLength(1);
        expect(game?.players.filter((p) => p.role === "villager")).toHaveLength(
          players - wolfCount - 1,
        );
      }
    }
  });

  it("keeps the recommendation independent of the chosen count without mutating input", () => {
    const roles = Object.freeze(["witch", "hunter", "idiot", "bodyguard"] as const);
    const settings = Object.freeze({ wolfCount: 1, wolfCountMode: "balanced" as const });
    const lineup = resolveFixedWerewolfLineup(7, roles, settings)!;
    expect(lineup.settings.wolfCount).toBe(1);
    expect(lineup.balance.recommendedWolfCount).toBe(2);
    expect(lineup.settings.wolfCountMode).toBeUndefined();
    expect(settings.wolfCount).toBe(1);
    expect(
      createFixedWerewolf(names(7), "Narrator", () => 0, roles, settings)?.settings.wolfCount,
    ).toBe(1);
  });

  it("rejects unavailable counts, roles, items, settings and conflicts before drawing cards", () => {
    for (const count of [5, 21, 6.5]) expect(resolveFixedWerewolfLineup(count, [])).toBeNull();
    for (const wolfCount of [0, 2, 3, NaN, Infinity, 1.5]) {
      expect(resolveFixedWerewolfLineup(6, [], { wolfCount })).toBeNull();
    }
    for (const players of [9, 10]) {
      for (const wolfCount of [1, 3])
        expect(resolveFixedWerewolfLineup(players, [], { wolfCount })).toBeNull();
    }
    expect(resolveFixedWerewolfLineup(6, ["cupid"])).toBeNull();
    expect(resolveFixedWerewolfLineup(9, ["mayor"], { mayor: "hammer" })).toBeNull();
    expect(resolveFixedWerewolfLineup(8, [], { drunk: true })).toBeNull();
    expect(resolveFixedWerewolfLineup(9, [], { amulet: true })).toBeNull();
    expect(resolveFixedWerewolfLineup(10, ["bodyguard", "nightGuest"])).toBeNull();
    expect(resolveFixedWerewolfLineup(13, ["witch", "magician"])).toBeNull();
    expect(resolveFixedWerewolfLineup(14, ["witch", "magician"], { wolfCount: 3 })).toBeNull();
    expect(resolveFixedWerewolfLineup(14, ["witch", "magician"], { wolfCount: 4 })).not.toBeNull();
    expect(
      resolveFixedWerewolfLineup(6, ["witch", "hunter", "idiot", "bodyguard"], { wolfCount: 2 }),
    ).toBeNull();
    expect(
      resolveFixedWerewolfLineup(7, ["witch", "hunter", "idiot", "bodyguard", "cupid"], {
        wolfCount: 2,
      }),
    ).toBeNull();
    expect(
      resolveFixedWerewolfLineup(10, [], {
        revealRoles: "bad",
      } as unknown as Partial<WerewolfSettings>),
    ).toBeNull();
    let draws = 0;
    expect(
      createFixedWerewolf(
        names(6),
        "Narrator",
        () => {
          draws++;
          return 0;
        },
        ["magician"],
      ),
    ).toBeNull();
    expect(draws).toBe(0);
  });

  it("validates narrator and every random draw including item assignment", () => {
    for (const narrator of ["", " PLAYER 0 "]) {
      expect(createFixedWerewolf(names(10), narrator, () => 0, [])).toBeNull();
    }
    for (const invalid of [NaN, Infinity, -1, 1]) {
      expect(createFixedWerewolf(names(10), "Narrator", () => invalid, [])).toBeNull();
      let draw = 0;
      expect(
        createFixedWerewolf(names(10), "Narrator", () => (++draw === 11 ? invalid : 0), [], {
          drunk: true,
          amulet: true,
        }),
      ).toBeNull();
    }
    const game = createFixedWerewolf(names(10), " Narrator ", () => 0, [], {
      drunk: true,
      amulet: true,
    });
    expect(game?.narrator).toBe("Narrator");
    expect(game?.drunk).not.toBeNull();
    expect(game?.amulet).not.toBeNull();
    expect(game?.players.find((p) => p.name === game?.amulet?.holder)?.role).not.toBe("wolf");
  });
});
