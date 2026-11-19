import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createBalancedWerewolf, createRandomWerewolf } from "./balancedSetup";
import {
  automaticWerewolfSettings,
  drawAutomaticWerewolfLineup,
  resolveAutomaticWerewolfLineup,
} from "./automaticSetup";
import {
  availableWerewolfCounts,
  availableWerewolfRoles,
  type WerewolfSettings,
  type WerewolfSpecialRole,
} from "./configuration";
const names = (count: number) => Array.from({ length: count }, (_, i) => `Player ${i}`).join(",");
const core: WerewolfSpecialRole[] = ["witch", "hunter", "idiot", "bodyguard"];

describe("automatic wolf assignment", () => {
  it.each([6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20])(
    "uses approved counts and ignores client wolf settings at %i",
    (players) => {
      const baseline = resolveAutomaticWerewolfLineup(players, core)!;
      expect(baseline).not.toBeNull();
      expect(availableWerewolfCounts(players)).toContain(baseline.balance.recommendedWolfCount);
      for (const wolfCount of [-1, 1, 9, NaN]) {
        expect(
          resolveAutomaticWerewolfLineup(players, core, { wolfCount, wolfCountMode: "balanced" }),
        ).toEqual(baseline);
        const match = createBalancedWerewolf(names(players), "Narrator", () => 0.99, core, {
          wolfCount,
        });
        expect(match?.settings.wolfCount).toBe(baseline.balance.recommendedWolfCount);
        expect(match?.settings.wolfCountMode).toBeUndefined();
      }
      const random = createRandomWerewolf(names(players), "Narrator", () => 0.99, core, 4, {
        wolfCount: 99,
      });
      expect(random?.settings.wolfCount).toBe(baseline.balance.recommendedWolfCount);
    },
  );
  it.each([9, 10])("keeps exactly two wolves for every legal role subset at %i", (players) => {
    const pool = availableWerewolfRoles(players);
    for (let mask = 0; mask < 2 ** pool.length; mask++) {
      const roles = pool.filter((_, i) => Boolean(mask & (1 << i)));
      const choice = resolveAutomaticWerewolfLineup(players, roles);
      if (choice) expect(choice.balance.recommendedWolfCount).toBe(2);
    }
  });
  it("keeps plain small villages different from strong special-role villages", () => {
    for (const players of [7, 8]) {
      expect(resolveAutomaticWerewolfLineup(players, [])?.balance.recommendedWolfCount).toBe(1);
      expect(resolveAutomaticWerewolfLineup(players, core)?.balance.recommendedWolfCount).toBe(2);
    }
    expect(resolveAutomaticWerewolfLineup(11, [])?.balance.recommendedWolfCount).toBe(2);
    expect(
      resolveAutomaticWerewolfLineup(11, ["magician", "hunter", "idiot", "bodyguard"])?.balance
        .recommendedWolfCount,
    ).toBe(3);
    expect(resolveAutomaticWerewolfLineup(12, [])?.balance.recommendedWolfCount).toBe(2);
    expect(resolveAutomaticWerewolfLineup(12, ["magician"])?.balance.recommendedWolfCount).toBe(3);
    for (const players of [14, 15, 16, 17, 18, 19, 20]) {
      expect(resolveAutomaticWerewolfLineup(players, [])?.balance.recommendedWolfCount).toBe(3);
      expect(
        resolveAutomaticWerewolfLineup(players, ["witch", "magician"])?.balance
          .recommendedWolfCount,
      ).toBeGreaterThanOrEqual(4);
    }
  });
  it("does not mutate inputs and canonicalizes equivalent role pools", () => {
    const settings = Object.freeze({ wolfCount: 99, mayor: "hammer" as const });
    const roles = Object.freeze(["mayor", "witch"] as const);
    expect(resolveAutomaticWerewolfLineup(10, roles, settings)).toEqual(
      resolveAutomaticWerewolfLineup(10, ["witch", "mayor"], settings),
    );
    expect(settings.wolfCount).toBe(99);
    expect(drawAutomaticWerewolfLineup(13, ["magician", "witch", "bodyguard"], 2, () => 0)).toEqual(
      drawAutomaticWerewolfLineup(13, ["bodyguard", "witch", "magician"], 2, () => 0),
    );
  });
  it.each([
    [5, [], {}],
    [21, [], {}],
    [8, ["witch", "witch"], {}],
    [8, ["magician"], {}],
    [10, ["bodyguard", "nightGuest"], {}],
    [13, ["witch", "magician"], {}],
    [8, [], { drunk: true }],
    [9, [], { amulet: true }],
    [9, ["mayor"], { mayor: "hammer" }],
  ] as const)("rejects unavailable automatic setup %s %s", (players, roles, settings) => {
    expect(resolveAutomaticWerewolfLineup(players, roles, settings)).toBeNull();
  });
  it.each([{ mayor: "bad" }, { hunterShot: "bad" }, { tanner: "bad" }, { drunk: 1 }])(
    "rejects invalid runtime options %s",
    (settings) => {
      expect(automaticWerewolfSettings(settings as Partial<WerewolfSettings>)).toBeNull();
    },
  );
  it.each([NaN, Infinity, -1, 1])("rejects invalid random values %s", (value) => {
    expect(drawAutomaticWerewolfLineup(8, ["witch"], 1, () => value)).toBeNull();
  });
  it("rejects invalid exact draws and infeasible roles without consuming randomness", () => {
    const fail = () => {
      throw Error("Unexpected random draw");
    };
    expect(drawAutomaticWerewolfLineup(8, ["witch", "witch"], 1, fail)).toBeNull();
    expect(drawAutomaticWerewolfLineup(8, ["witch"], -1, fail)).toBeNull();
    expect(drawAutomaticWerewolfLineup(8, ["witch"], 2, fail)).toBeNull();
    expect(drawAutomaticWerewolfLineup(8, ["bodyguard", "nightGuest"], 2, fail)).toBeNull();
  });
});

interface ArchiveStat {
  id: string;
  roles: WerewolfSpecialRole[];
  settings?: Partial<WerewolfSettings>;
  wolves: number;
  village: number;
}
interface ArchiveRow {
  players: number;
  comparison: string;
  model: string;
  gamesPerLineup: number;
  stats: ArchiveStat[];
}
// The simulation archive (docs/simulations, about 80 MB) is not part of the repository; the audit only runs
// where the archive is present (for example in the working folder of the game logic).
const archiveAvailable = existsSync("docs/simulations/werewolf-eight-player-wolf-recheck.jsonl.gz");
it.skipIf(!archiveAvailable)(
  "audits the automatic policy against stored paired evidence without starting games",
  () => {
    const files = [
      "werewolf-eight-player-wolf-recheck.jsonl.gz",
      "werewolf-small-fixed-count-rechecks.jsonl.gz",
      "werewolf-nineteen-player-samples.jsonl.gz",
      "werewolf-twenty-player-samples.jsonl.gz",
    ];
    const results: unknown[] = [];
    for (const file of files) {
      const rows = gunzipSync(readFileSync(`docs/simulations/${file}`))
        .toString()
        .trim()
        .split("\n")
        .map((line) => JSON.parse(line) as ArchiveRow)
        .filter(
          (row) =>
            row.model === "sharedKnowledgeAndIdiot" || row.model === "earlyAttackQuietSecondDay",
        );
      const groups = new Map<
        string,
        {
          roles: WerewolfSpecialRole[];
          settings: Partial<WerewolfSettings>;
          counts: Map<number, number>;
          players: number;
        }
      >();
      for (const row of rows)
        for (const stat of row.stats) {
          const wolfCount = Number(row.comparison.split("-").at(-1));
          if (!availableWerewolfCounts(row.players).includes(wolfCount)) continue;
          const settings = {
            ...stat.settings,
            attackOnFirstNight: row.model === "earlyAttackQuietSecondDay",
          };
          const key = JSON.stringify([
            row.players,
            row.comparison.split("-")[0],
            row.model,
            stat.id,
          ]);
          let group = groups.get(key);
          if (!group) {
            group = { players: row.players, roles: stat.roles, settings, counts: new Map() };
            groups.set(key, group);
          }
          group.counts.set(wolfCount, stat.wolves / row.gamesPerLineup);
        }
      let checked = 0,
        comparable = 0,
        absoluteLoss = 0,
        regret = 0;
      for (const group of groups.values()) {
        const resolved = resolveAutomaticWerewolfLineup(group.players, group.roles, group.settings);
        expect(resolved).not.toBeNull();
        const wolfCount = resolved!.balance.recommendedWolfCount;
        expect(availableWerewolfCounts(group.players)).toContain(wolfCount);
        checked++;
        const probability = group.counts.get(wolfCount);
        if (probability === undefined) continue;
        const loss = Math.abs(probability - 0.5);
        absoluteLoss += loss;
        regret += loss - Math.min(...[...group.counts.values()].map((p) => Math.abs(p - 0.5)));
        comparable++;
      }
      expect(checked).toBeGreaterThan(0);
      results.push({
        file,
        checked,
        comparable,
        meanDistanceFromHalf: absoluteLoss / comparable,
        meanRegret: regret / comparable,
      });
    }
    writeFileSync(
      "docs/simulations/werewolf-automatic-policy-audit.json",
      JSON.stringify(
        {
          method:
            "Offline audit of archived paired model outcomes. No new games. Descriptive in-sample diagnostics; no guarantee of 50% human wins. Equal weight per archived configuration/model group; groups with no selected-count observation excluded from loss metrics.",
          targets: { 7: -4, 8: -4, 11: -7 },
          results,
        },
        null,
        2,
      ) + "\n",
    );
  },
);

it("rejects invalid options and random values throughout normal game creation", () => {
  expect(resolveAutomaticWerewolfLineup(8, [], { mayor: "bad" as "hammer" })).toBeNull();
  expect(createRandomWerewolf(names(8), "Narrator", () => 0, ["witch", "witch"], 1)).toBeNull();
  expect(createBalancedWerewolf(names(8), "Narrator", () => NaN, [])).toBeNull();
  let draws = 0;
  expect(
    createRandomWerewolf(names(10), "Narrator", () => (++draws === 1 ? 0 : Infinity), [], 0),
  ).toBeNull();
});
