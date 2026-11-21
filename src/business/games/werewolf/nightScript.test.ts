import { expect, it } from "vitest";
import { createRandomWerewolf } from "./balancedSetup";
import { availableWerewolfRoles } from "./configuration";
import { nightScript, type NightRole } from "./nightScript";
import { createWerewolf, transitionWerewolf, type WerewolfState } from "./stateMachine";
import { createVariableWerewolf } from "./variableSetup";

const names = Array.from({ length: 20 }, (_, i) => `Player ${i}`).join(",");
const mode = (state: WerewolfState, role: NightRole) =>
  nightScript(state).find((call) => call.id === role)?.mode;
function base() {
  return createWerewolf(names, "Narrator", () => 0.99, [], { wolfCount: 4 })!;
}

it("skips every undrawn role and item, even with obsolete pool fields from a saved match", () => {
  const selection = {
    rolePool: availableWerewolfRoles(20),
    roleRange: { minimum: 0, maximum: 0 },
    roleOptions: { mayor: ["doubleVote", "hammer"] as const },
    itemPool: ["drunk", "amulet"] as const,
    wolfCounts: [4],
  };
  const result = createVariableWerewolf(names, "Narrator", () => 0.99, selection);
  if (!result.ok) throw Error(result.reason);
  expect(result.game).not.toHaveProperty("nightRolePool");
  expect(result.game).not.toHaveProperty("nightItemPool");
  expect(result.game).not.toHaveProperty("nightMayUseHammer");
  const stale = {
    ...result.game,
    nightRolePool: selection.rolePool,
    nightItemPool: selection.itemPool,
    nightMayUseHammer: true,
  };
  for (const night of [1, 2, 3, 4]) {
    const calls = nightScript({ ...stale, night });
    expect(calls.filter((call) => call.mode !== "skip").map((call) => call.id)).toEqual([
      "wolves",
      "seer",
    ]);
  }
  let state = result.game;
  for (const player of state.players)
    state = transitionWerewolf(state, { type: "roleSeen", player: player.name });
  expect(state.status).toBe("wolves");
  const randomGame = createRandomWerewolf(names, "Narrator", () => 0.99, ["cupid", "witch"], 0)!;
  expect(randomGame).not.toHaveProperty("nightRolePool");
  expect(mode(randomGame, "cupid")).toBe("skip");
});

it("does not call an absent apprentice after the seer dies, regardless of role disclosure", () => {
  const initial = base();
  for (const revealRoles of [false, true]) {
    const state = {
      ...initial,
      alive: initial.alive.filter((p) => p.role !== "seer"),
      settings: { ...initial.settings, revealRoles },
    };
    expect(mode(state, "seer")).toBe(revealRoles ? "skip" : "cover");
    expect(nightScript(state).find((call) => call.id === "seer")?.announcementRole).toBe("seer");
  }
});

it("retains calls for actual hidden deaths, masked roles and spent abilities", () => {
  const initial = createWerewolf(
    names,
    "Narrator",
    () => 0.99,
    ["bodyguard", "witch", "magician", "mayor", "apprenticeSeer"],
    { wolfCount: 4, mayor: "hammer" },
  )!;
  const guard = initial.players.find((p) => p.role === "bodyguard")!;
  expect(mode({ ...initial, drunk: { player: guard.name, revealed: false } }, "bodyguard")).toBe(
    "cover",
  );
  expect(mode({ ...initial, drunk: { player: guard.name, revealed: true } }, "bodyguard")).toBe(
    "active",
  );
  const deadGuard = { ...initial, alive: initial.alive.filter((p) => p !== guard) };
  expect(mode(deadGuard, "bodyguard")).toBe("skip");
  expect(
    mode({ ...deadGuard, settings: { ...initial.settings, revealRoles: false } }, "bodyguard"),
  ).toBe("cover");
  expect(mode({ ...initial, potions: { heal: false, poison: false } }, "witch")).toBe("cover");
  expect(mode({ ...initial, spellsRemaining: 0 }, "magician")).toBe("cover");
  expect(mode({ ...initial, night: 2, hammerUsed: true }, "mayor")).toBe("cover");
  expect(
    mode({ ...initial, night: 2, settings: { ...initial.settings, mayor: "doubleVote" } }, "mayor"),
  ).toBe("skip");
  const apprentice = initial.players.find((p) => p.role === "apprenticeSeer")!;
  const noSeer = { ...initial, alive: initial.alive.filter((p) => p.role !== "seer") };
  expect(mode(noSeer, "seer")).toBe("active");
  expect(mode({ ...noSeer, drunk: { player: apprentice.name, revealed: false } }, "seer")).toBe(
    "cover",
  );
});

it("calls the actual drunk only in night three and respects disclosure after death", () => {
  const initial = base();
  const player = initial.players.find((p) => p.role === "villager")!.name;
  const drunk = { ...initial, drunk: { player, revealed: false } };
  for (const night of [1, 2, 4]) expect(mode({ ...drunk, night }, "drunkReveal")).toBe("skip");
  expect(mode({ ...drunk, night: 3 }, "drunkReveal")).toBe("active");
  const dead = { ...drunk, night: 3, alive: initial.alive.filter((p) => p.name !== player) };
  expect(mode(dead, "drunkReveal")).toBe("skip");
  expect(mode({ ...dead, settings: { ...dead.settings, revealRoles: false } }, "drunkReveal")).toBe(
    "cover",
  );
});
