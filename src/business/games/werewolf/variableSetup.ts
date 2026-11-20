import { parsePlayers } from "../../shared/players";
import {
  automaticWerewolfSettings,
  resolveAutomaticWerewolfLineup,
  hasFeasibleAutomaticWerewolfLineup,
  validAutomaticRolePool,
  type AutomaticWerewolfLineup,
} from "./automaticSetup";
import { createResolvedWerewolf } from "./balancedSetup";
import {
  availableWerewolfCounts,
  type WerewolfSettings,
  type WerewolfSpecialRole,
} from "./configuration";
import type { WerewolfState } from "./stateMachine";

export type WerewolfItem = "amulet" | "drunk";
export interface WerewolfSelectionRange {
  readonly minimum: number;
  readonly maximum: number;
}
export interface VariableWerewolfSelection {
  readonly rolePool: readonly WerewolfSpecialRole[];
  readonly roleRange: WerewolfSelectionRange;
  readonly itemPool: readonly WerewolfItem[];
  readonly itemRange: WerewolfSelectionRange;
}
export type VariableWerewolfFailureReason =
  | "invalidPlayers"
  | "invalidRolePool"
  | "invalidItemPool"
  | "invalidRoleRange"
  | "invalidItemRange"
  | "invalidSettings"
  | "noFeasibleLineup"
  | "invalidRandom";
export interface VariableWerewolfFailure {
  readonly ok: false;
  readonly reason: VariableWerewolfFailureReason;
}
interface Candidate {
  readonly roles: readonly WerewolfSpecialRole[];
  readonly items: readonly WerewolfItem[];
}
interface ChoiceGroup {
  readonly roleCount: number;
  readonly itemCount: number;
  readonly choices: Candidate[];
}
interface Choices {
  readonly ok: true;
  readonly groups: ChoiceGroup[];
  readonly settings: Partial<WerewolfSettings>;
}
const fail = (reason: VariableWerewolfFailureReason): VariableWerewolfFailure => ({
  ok: false,
  reason,
});
const validRange = (range: WerewolfSelectionRange, size: number) =>
  Number.isInteger(range.minimum) &&
  Number.isInteger(range.maximum) &&
  range.minimum >= 0 &&
  range.maximum >= range.minimum &&
  range.maximum <= size;

/** Complete finite enumeration: at most 8192 role subsets and four item subsets. */
function variableChoices(
  players: number,
  selection: VariableWerewolfSelection,
  settings: Partial<WerewolfSettings>,
): Choices | VariableWerewolfFailure {
  if (!availableWerewolfCounts(players).length) return fail("invalidPlayers");
  if (!validAutomaticRolePool(players, selection.rolePool)) return fail("invalidRolePool");
  if (
    selection.itemPool.length > 2 ||
    new Set(selection.itemPool).size !== selection.itemPool.length ||
    selection.itemPool.some(
      (item) =>
        !["amulet", "drunk"].includes(item) || (item === "amulet" ? players < 10 : players < 9),
    )
  )
    return fail("invalidItemPool");
  if (!validRange(selection.roleRange, selection.rolePool.length)) return fail("invalidRoleRange");
  if (!validRange(selection.itemRange, selection.itemPool.length)) return fail("invalidItemRange");
  const normalized = automaticWerewolfSettings({ ...settings, amulet: false, drunk: false });
  if (!normalized) return fail("invalidSettings");
  if (selection.rolePool.includes("mayor") && normalized.mayor === "hammer" && players < 10)
    return fail("invalidRolePool");
  const roles = [...selection.rolePool].sort();
  const items = [...selection.itemPool].sort();
  const itemChoices: { items: WerewolfItem[]; settings: Partial<WerewolfSettings> }[] = [];
  for (let mask = 0; mask < 2 ** items.length; mask++) {
    const chosen = items.filter((_, i) => Boolean(mask & (1 << i)));
    if (chosen.length < selection.itemRange.minimum || chosen.length > selection.itemRange.maximum)
      continue;
    itemChoices.push({
      items: chosen,
      settings: {
        ...normalized,
        amulet: chosen.includes("amulet"),
        drunk: chosen.includes("drunk"),
      },
    });
  }
  const groups = new Map<string, ChoiceGroup>();
  for (let mask = 0; mask < 2 ** roles.length; mask++) {
    const chosen = roles.filter((_, i) => Boolean(mask & (1 << i)));
    if (chosen.length < selection.roleRange.minimum || chosen.length > selection.roleRange.maximum)
      continue;
    for (const itemChoice of itemChoices) {
      if (!hasFeasibleAutomaticWerewolfLineup(players, chosen, itemChoice.settings)) continue;
      const key = chosen.length + ":" + itemChoice.items.length;
      let group = groups.get(key);
      if (!group) {
        group = { roleCount: chosen.length, itemCount: itemChoice.items.length, choices: [] };
        groups.set(key, group);
      }
      group.choices.push({ roles: chosen, items: itemChoice.items });
    }
  }
  if (!groups.size) return fail("noFeasibleLineup");
  return {
    ok: true,
    settings: normalized,
    groups: [...groups.values()].sort(
      (a, b) => a.roleCount - b.roleCount || a.itemCount - b.itemCount,
    ),
  };
}

export interface VariableWerewolfSummary {
  readonly ok: true;
  readonly groups: readonly {
    readonly roleCount: number;
    readonly itemCount: number;
    readonly choices: number;
  }[];
}
/** Public feasibility metadata contains no selected cards and never consumes randomness. */
export function analyzeVariableWerewolfSelection(
  players: number,
  selection: VariableWerewolfSelection,
  settings: Partial<WerewolfSettings> = {},
): VariableWerewolfSummary | VariableWerewolfFailure {
  const plan = variableChoices(players, selection, settings);
  if (!plan.ok) return plan;
  return {
    ok: true,
    groups: plan.groups.map((group) => ({
      roleCount: group.roleCount,
      itemCount: group.itemCount,
      choices: group.choices.length,
    })),
  };
}
export interface VariableWerewolfDraw {
  readonly ok: true;
  readonly lineup: AutomaticWerewolfLineup;
  readonly items: readonly WerewolfItem[];
}
/** Uniform feasible count-pair first, then uniform compatible role/item subset within that pair. */
export function drawVariableWerewolfLineup(
  players: number,
  selection: VariableWerewolfSelection,
  random: () => number,
  settings: Partial<WerewolfSettings> = {},
): VariableWerewolfDraw | VariableWerewolfFailure {
  const plan = variableChoices(players, selection, settings);
  if (!plan.ok) return plan;
  const groupDraw = random();
  if (!Number.isFinite(groupDraw) || groupDraw < 0 || groupDraw >= 1) return fail("invalidRandom");
  const group = plan.groups[Math.floor(groupDraw * plan.groups.length)]!;
  const choiceDraw = random();
  if (!Number.isFinite(choiceDraw) || choiceDraw < 0 || choiceDraw >= 1)
    return fail("invalidRandom");
  const choice = group.choices[Math.floor(choiceDraw * group.choices.length)]!;
  const lineup = resolveAutomaticWerewolfLineup(players, choice.roles, {
    ...plan.settings,
    amulet: choice.items.includes("amulet"),
    drunk: choice.items.includes("drunk"),
  })!;
  return { ok: true, lineup, items: choice.items };
}
export interface VariableWerewolfGame {
  readonly ok: true;
  readonly game: WerewolfState;
}
/** The returned game is private narrator state; the actual draw is fixed before role reveal. */
export function createVariableWerewolf(
  playersText: string,
  narrator: string,
  random: () => number,
  selection: VariableWerewolfSelection,
  settings: Partial<WerewolfSettings> = {},
): VariableWerewolfGame | VariableWerewolfFailure {
  const players = parsePlayers(playersText);
  if (
    !narrator.trim() ||
    players.some((player) => player.toLocaleLowerCase() === narrator.trim().toLocaleLowerCase())
  )
    return fail("invalidPlayers");
  const draw = drawVariableWerewolfLineup(players.length, selection, random, settings);
  if (!draw.ok) return draw;
  const game = createResolvedWerewolf(playersText, narrator, random, draw.lineup);
  return game
    ? {
        ok: true,
        game: {
          ...game,
          nightRolePool: [...selection.rolePool],
          nightItemPool: [...selection.itemPool],
        },
      }
    : fail("invalidRandom");
}
