import { parsePlayers } from "../../shared/players";
import {
  automaticWerewolfSettings,
  resolveAutomaticWerewolfLineup,
  validAutomaticRolePool,
} from "./automaticSetup";
import { createCheckedWerewolf } from "./balancedSetup";
import {
  availableWerewolfCounts,
  validWerewolfRoles,
  werewolfRoleMinimums,
  type WerewolfSettings,
  type WerewolfSpecialRole,
} from "./configuration";
import type { WerewolfBalance } from "./lineupBalance";
import type { WerewolfState } from "./stateMachine";

export type WerewolfItem = "amulet" | "drunk";
export interface WerewolfSelectionRange {
  readonly minimum: number;
  readonly maximum: number;
}
const optionRules = [
  { role: "hunter", key: "hunterShot", values: ["optional", "required"] },
  { role: "mayor", key: "mayor", values: ["doubleVote", "hammer"] },
  { role: "spellcaster", key: "allowSelfSilence", values: [false, true] },
  { role: "tanner", key: "tanner", values: ["anyDeath", "voteOnly"] },
  { role: "toughGuy", key: "toughGuy", values: ["wolfOnly", "anyAttack"] },
] as const;
export type VariableWerewolfOptionKey = (typeof optionRules)[number]["key"];
type OptionValue = string | boolean;
type OptionSets = Readonly<Record<VariableWerewolfOptionKey, readonly OptionValue[]>>;
export type VariableWerewolfRoleOptions = {
  readonly [K in VariableWerewolfOptionKey]?: readonly WerewolfSettings[K][];
};
export interface VariableWerewolfSelection {
  readonly requiredRoles?: readonly WerewolfSpecialRole[];
  readonly requiredItems?: readonly WerewolfItem[];
  readonly rolePool: readonly WerewolfSpecialRole[];
  readonly roleOptions?: VariableWerewolfRoleOptions;
  readonly roleRange: WerewolfSelectionRange;
  readonly itemPool: readonly WerewolfItem[];
  readonly wolfCounts: readonly number[];
}
export type VariableWerewolfFailureReason =
  | "invalidSelection"
  | "invalidPlayers"
  | "invalidRolePool"
  | "invalidItemPool"
  | "invalidRoleRange"
  | "invalidRoleOptions"
  | "invalidWolfCounts"
  | "obsoleteItemRange"
  | "invalidSettings"
  | "noFeasibleLineup"
  | "invalidRandom";
export interface VariableWerewolfFailure {
  readonly ok: false;
  readonly reason: VariableWerewolfFailureReason;
}
const fail = (reason: VariableWerewolfFailureReason): VariableWerewolfFailure => ({
  ok: false,
  reason,
});
const familyOf = (role: WerewolfSpecialRole) => (role === "nightGuest" ? "bodyguard" : role);
type RoleFamily = ReturnType<typeof familyOf>;
interface Family {
  readonly id: RoleFamily;
  readonly variants: readonly WerewolfSpecialRole[];
}
interface NormalizedSelection {
  readonly players: number;
  readonly requiredRoles: readonly WerewolfSpecialRole[];
  readonly requiredItems: readonly WerewolfItem[];
  readonly rolePool: readonly WerewolfSpecialRole[];
  readonly itemPool: readonly WerewolfItem[];
  readonly roleRange: WerewolfSelectionRange;
  readonly wolfCounts: readonly number[];
  readonly options: OptionSets;
  readonly families: readonly Family[];
  readonly settings: Partial<WerewolfSettings>;
}
interface ChoiceGroup {
  readonly roleCount: number;
  readonly choices: readonly (readonly RoleFamily[])[];
}
interface WolfPlan {
  readonly wolfCount: number;
  /** The roles that count as one role of the draw with this wolf count (see familiesForWolves). */
  readonly families: readonly Family[];
  readonly allGroups: readonly ChoiceGroup[];
  readonly groups: readonly ChoiceGroup[];
}
interface Choices {
  readonly ok: true;
  readonly selection: NormalizedSelection;
  readonly wolves: readonly WolfPlan[];
}
function isArray(value: unknown): boolean {
  return Array.isArray(value);
}
function defaultEntries<T>(entries: readonly T[] | undefined): readonly T[] {
  if (entries === undefined) return [];
  return entries;
}
function validRange(range: WerewolfSelectionRange, size: number): boolean {
  return (
    Boolean(range) &&
    Number.isInteger(range.minimum) &&
    Number.isInteger(range.maximum) &&
    range.minimum >= 0 &&
    range.maximum >= range.minimum &&
    range.maximum <= size
  );
}
function validItems(players: number, items: readonly WerewolfItem[]): boolean {
  return (
    isArray(items) &&
    new Set(items).size === items.length &&
    items.every((item) => (item === "amulet" ? players >= 10 : item === "drunk" && players >= 9))
  );
}
function normalizedOptions(
  players: number,
  requiredRoles: readonly WerewolfSpecialRole[],
  rolePool: readonly WerewolfSpecialRole[],
  input: VariableWerewolfRoleOptions | undefined,
  settings: Partial<WerewolfSettings>,
): OptionSets | null {
  if (
    input !== undefined &&
    (!input ||
      typeof input !== "object" ||
      isArray(input) ||
      Object.keys(input).some((key) => !optionRules.some((rule) => rule.key === key)))
  )
    return null;
  const result = {} as Record<VariableWerewolfOptionKey, readonly OptionValue[]>;
  for (const rule of optionRules) {
    const domain: readonly OptionValue[] = rule.values;
    const supplied = input?.[rule.key];
    if (
      supplied !== undefined &&
      (!isArray(supplied) ||
        !supplied.length ||
        new Set<OptionValue>(supplied).size !== supplied.length ||
        supplied.some((value) => !domain.includes(value)))
    )
      return null;
    const values: readonly OptionValue[] = supplied ?? [settings[rule.key]!];
    if (requiredRoles.includes(rule.role) && values.length !== 1) return null;
    if (
      (supplied !== undefined ||
        requiredRoles.includes(rule.role) ||
        rolePool.includes(rule.role)) &&
      rule.role === "mayor" &&
      players < 10 &&
      values.includes("hammer")
    )
      return null;
    result[rule.key] = domain.filter((value) => values.includes(value));
  }
  return result;
}
function normalizeSelection(
  players: number,
  input: VariableWerewolfSelection,
  settings: Partial<WerewolfSettings>,
): { readonly ok: true; readonly selection: NormalizedSelection } | VariableWerewolfFailure {
  if (!availableWerewolfCounts(players).length) return fail("invalidPlayers");
  if (!input || typeof input !== "object" || isArray(input)) return fail("invalidSelection");
  if ("itemRange" in input) return fail("obsoleteItemRange");
  const requiredRoles = defaultEntries(input.requiredRoles);
  const requiredItems = defaultEntries(input.requiredItems);
  if (
    !isArray(requiredRoles) ||
    !isArray(input.rolePool) ||
    !validAutomaticRolePool(players, [...requiredRoles, ...input.rolePool])
  )
    return fail("invalidRolePool");
  if (
    !validItems(players, requiredItems) ||
    !validItems(players, input.itemPool) ||
    new Set([...requiredItems, ...input.itemPool]).size !==
      requiredItems.length + input.itemPool.length
  )
    return fail("invalidItemPool");
  if (
    !isArray(input.wolfCounts) ||
    !input.wolfCounts.length ||
    new Set(input.wolfCounts).size !== input.wolfCounts.length ||
    input.wolfCounts.some((count) => !availableWerewolfCounts(players).includes(count))
  )
    return fail("invalidWolfCounts");
  if (!validRange(input.roleRange, new Set(input.rolePool.map(familyOf)).size))
    return fail("invalidRoleRange");
  if (!settings || typeof settings !== "object" || isArray(settings))
    return fail("invalidSettings");
  const normalized = automaticWerewolfSettings({ ...settings, amulet: false, drunk: false });
  if (!normalized) return fail("invalidSettings");
  const options = normalizedOptions(
    players,
    requiredRoles,
    input.rolePool,
    input.roleOptions,
    normalized,
  );
  if (!options) return fail("invalidRoleOptions");
  const requiredFamilies = new Set(requiredRoles.map(familyOf));
  const groups = new Map<RoleFamily, WerewolfSpecialRole[]>();
  for (const role of [...input.rolePool].sort()) {
    const family = familyOf(role);
    if (requiredFamilies.has(family)) continue;
    groups.set(family, [...(groups.get(family) ?? []), role]);
  }
  return {
    ok: true,
    selection: {
      players,
      requiredRoles: [...requiredRoles].sort(),
      requiredItems: [...requiredItems].sort(),
      rolePool: [...input.rolePool].sort(),
      itemPool: [...input.itemPool].sort(),
      roleRange: { ...input.roleRange },
      wolfCounts: [...input.wolfCounts].sort((a, b) => a - b),
      options,
      families: [...groups.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([id, variants]) => ({ id, variants })),
      settings: normalized,
    },
  };
}
function fitsRoles(
  plan: NormalizedSelection,
  roles: readonly WerewolfSpecialRole[],
  wolves: number,
): boolean {
  return (
    (!(plan.requiredItems.includes("drunk") || plan.itemPool.includes("drunk")) || wolves >= 2) &&
    validWerewolfRoles(plan.players, roles, wolves)
  );
}
/**
 * The families of the draw for one wolf count. The witch and the magician play together only with some wolf counts
 * (see validWerewolfRoles): where they may play together they are two roles of the draw, where they may not and both
 * are allowed they count as one role (one of them is drawn, never both).
 */
function familiesForWolves(plan: NormalizedSelection, wolfCount: number): readonly Family[] {
  const witch = plan.families.find((family) => family.id === "witch");
  const magician = plan.families.find((family) => family.id === "magician");
  if (!witch || !magician) return plan.families;
  if (validWerewolfRoles(plan.players, ["witch", "magician"], wolfCount)) return plan.families;
  const merged: Family = {
    id: "witch",
    variants: [...witch.variants, ...magician.variants],
  };
  return plan.families
    .filter((family) => family.id !== "magician")
    .map((family) => (family.id === "witch" ? merged : family));
}

interface WolfChoices {
  readonly wolfCount: number;
  readonly families: readonly Family[];
  readonly allGroups: readonly ChoiceGroup[];
}

/**
 * The enumeration of the possible subsets is the costly part of every analysis and does not depend on the range of
 * the number of roles, so it is remembered: the screen asks again after every tap, mostly with the same roles.
 */
const choicesCache = new Map<string, readonly WolfChoices[]>();
const choicesCacheSize = 200;

function enumerateChoices(plan: NormalizedSelection): readonly WolfChoices[] {
  const key = JSON.stringify([
    plan.players,
    plan.requiredRoles,
    plan.rolePool,
    plan.requiredItems,
    plan.itemPool,
  ]);
  const known = choicesCache.get(key);
  if (known) return known;
  const computed = availableWerewolfCounts(plan.players).map((wolfCount) => {
    const families = familiesForWolves(plan, wolfCount);
    const subsets = Array.from({ length: 2 ** families.length }, (_, mask) =>
      families.filter((_, index) => Boolean(mask & (1 << index))),
    );
    const groups = new Map<number, (readonly RoleFamily[])[]>();
    for (const subset of subsets) {
      const roles = [...plan.requiredRoles, ...subset.map((family) => family.variants[0]!)];
      if (!fitsRoles(plan, roles, wolfCount)) continue;
      const choice = subset.map((family) => family.id);
      const existing = groups.get(subset.length);
      if (existing) existing.push(choice);
      else groups.set(subset.length, [choice]);
    }
    const allGroups = [...groups.entries()]
      .sort(([a], [b]) => a - b)
      .map(([roleCount, choices]) => ({ roleCount, choices }));
    return { wolfCount, families, allGroups };
  });
  if (choicesCache.size >= choicesCacheSize) {
    const oldest = choicesCache.keys().next().value;
    if (oldest !== undefined) choicesCache.delete(oldest);
  }
  choicesCache.set(key, computed);
  return computed;
}

/** Enumerates role families only. Options and optional items never multiply a role's drawing weight. */
function variableChoices(
  players: number,
  input: VariableWerewolfSelection,
  settings: Partial<WerewolfSettings>,
): Choices | VariableWerewolfFailure {
  const result = normalizeSelection(players, input, settings);
  if (!result.ok) return result;
  const plan = result.selection;
  const wolves = enumerateChoices(plan).map((wolf) => ({
    ...wolf,
    groups: wolf.allGroups.filter(
      (group) =>
        group.roleCount >= plan.roleRange.minimum && group.roleCount <= plan.roleRange.maximum,
    ),
  }));
  return { ok: true, selection: plan, wolves };
}
export type VariableWerewolfBlockReason =
  | "minimumPlayers"
  | "requiredAlternative"
  | "requiredOption"
  | "insufficientSeats"
  | "incompatibleRoles";
export interface VariableWerewolfRoleAvailability {
  readonly role: WerewolfSpecialRole;
  readonly family: RoleFamily;
  readonly available: boolean;
  readonly possible: boolean;
  readonly required: boolean;
  readonly optional: boolean;
  readonly reason: VariableWerewolfBlockReason | null;
  readonly options: readonly {
    readonly value: OptionValue;
    readonly possible: boolean;
    readonly selected: boolean;
    readonly reason: VariableWerewolfBlockReason | null;
  }[];
}
function roleAvailability(
  plan: NormalizedSelection,
  role: WerewolfSpecialRole,
): VariableWerewolfRoleAvailability {
  const required = plan.requiredRoles.includes(role);
  const optional = plan.rolePool.includes(role);
  const roles = required ? plan.requiredRoles : [...plan.requiredRoles, role];
  let reason: VariableWerewolfBlockReason | null = null;
  if (plan.players < werewolfRoleMinimums[role]) reason = "minimumPlayers";
  else if (plan.requiredRoles.some((r) => r !== role && familyOf(r) === familyOf(role)))
    reason = "requiredAlternative";
  else if (plan.wolfCounts.every((count) => roles.length + count + 1 > plan.players))
    reason = "insufficientSeats";
  else if (!plan.wolfCounts.some((count) => fitsRoles(plan, roles, count)))
    reason = "incompatibleRoles";
  const rule = optionRules.find((r) => r.role === role);
  const domain: readonly OptionValue[] = rule?.values ?? [];
  const options = domain.map((value) => {
    const blocked: VariableWerewolfBlockReason | null =
      reason ??
      (rule?.key === "mayor" && value === "hammer" && plan.players < 10
        ? "minimumPlayers"
        : required && rule && plan.options[rule.key][0] !== value
          ? "requiredOption"
          : null);
    return {
      value,
      possible: blocked === null,
      reason: blocked,
      selected: Boolean(rule && (required || optional) && plan.options[rule.key].includes(value)),
    };
  });
  return {
    role,
    family: familyOf(role),
    available: plan.players >= werewolfRoleMinimums[role],
    possible: reason === null,
    required,
    optional,
    reason,
    options,
  };
}
export interface VariableWerewolfSummary {
  readonly ok: true;
  readonly canStart: boolean;
  readonly possibleRoleRange: WerewolfSelectionRange | null;
  readonly possibleRoleCounts: readonly number[];
  readonly groups: readonly {
    readonly wolfCount: number;
    readonly roleCount: number;
    readonly choices: number;
  }[];
  readonly wolfCounts: readonly {
    readonly wolfCount: number;
    readonly selected: boolean;
    readonly possibleRoleCounts: readonly number[];
    readonly canStart: boolean;
  }[];
  readonly roles: readonly VariableWerewolfRoleAvailability[];
  readonly items: readonly {
    readonly item: WerewolfItem;
    readonly available: boolean;
    readonly possible: boolean;
    readonly required: boolean;
    readonly optional: boolean;
    readonly reason: VariableWerewolfBlockReason | null;
  }[];
}
/** Public draft metadata: no randomness, scoring, selected roles or hidden draw. Bounds ignore the entered range. */
export function analyzeVariableWerewolfSelection(
  players: number,
  selection: VariableWerewolfSelection,
  settings: Partial<WerewolfSettings> = {},
): VariableWerewolfSummary | VariableWerewolfFailure {
  const result = variableChoices(players, selection, settings);
  if (!result.ok) return result;
  const plan = result.selection;
  const selected = result.wolves.filter((wolf) => plan.wolfCounts.includes(wolf.wolfCount));
  const counts = [
    ...new Set(selected.flatMap((wolf) => wolf.allGroups.map((group) => group.roleCount))),
  ].sort((a, b) => a - b);
  return {
    ok: true,
    canStart: selected.every((wolf) => wolf.groups.length > 0),
    possibleRoleRange: counts.length
      ? { minimum: counts[0]!, maximum: counts[counts.length - 1]! }
      : null,
    possibleRoleCounts: counts,
    groups: selected.flatMap((wolf) =>
      wolf.groups.map((group) => ({
        wolfCount: wolf.wolfCount,
        roleCount: group.roleCount,
        choices: group.choices.length,
      })),
    ),
    wolfCounts: result.wolves.map((wolf) => ({
      wolfCount: wolf.wolfCount,
      selected: plan.wolfCounts.includes(wolf.wolfCount),
      possibleRoleCounts: wolf.allGroups.map((group) => group.roleCount),
      canStart: wolf.groups.length > 0,
    })),
    roles: (Object.keys(werewolfRoleMinimums) as WerewolfSpecialRole[]).map((role) =>
      roleAvailability(plan, role),
    ),
    items: (["amulet", "drunk"] as const).map((item) => {
      const available = players >= (item === "amulet" ? 10 : 9);
      const possible =
        available &&
        plan.wolfCounts.some(
          (wolves) =>
            (item !== "drunk" || wolves >= 2) && fitsRoles(plan, plan.requiredRoles, wolves),
        );
      return {
        item,
        available,
        possible,
        required: plan.requiredItems.includes(item),
        optional: plan.itemPool.includes(item),
        reason: !available ? "minimumPlayers" : possible ? null : "incompatibleRoles",
      };
    }),
  };
}
export interface VariableWerewolfLineup {
  readonly roles: readonly WerewolfSpecialRole[];
  readonly settings: Partial<WerewolfSettings> & Pick<WerewolfSettings, "wolfCount">;
}
export interface VariableWerewolfDraw {
  readonly ok: true;
  readonly lineup: VariableWerewolfLineup;
  readonly items: readonly WerewolfItem[];
}
class InvalidRandom extends Error {}
function randomValue(random: () => number): number {
  const value = random();
  if (!Number.isFinite(value) || value < 0 || value >= 1) throw new InvalidRandom();
  return value;
}
function pick<T>(values: readonly T[], random: () => number): T {
  return values.length === 1
    ? values[0]!
    : values[Math.floor(randomValue(random) * values.length)]!;
}
/**
 * The chance of every family to be among the drawn ones, so that every single role has the same chance: a family
 * with several variants (bodyguard or night guest) counts as many times as it has variants, and the chances add up to
 * the number of families to draw. A family cannot be more likely than certain; what it cannot take is shared by the
 * others.
 */
function familyChances(weights: readonly number[], count: number): readonly number[] {
  const chances = weights.map(() => 0);
  const open = new Set(weights.keys());
  let left = count;
  while (open.size > 0) {
    const total = [...open].reduce((sum, index) => sum + weights[index]!, 0);
    const capped = [...open].filter((index) => (weights[index]! * left) / total >= 1);
    if (capped.length === 0) {
      for (const index of open) chances[index] = (weights[index]! * left) / total;
      break;
    }
    for (const index of capped) {
      chances[index] = 1;
      open.delete(index);
      left -= 1;
    }
  }
  return chances;
}

/**
 * Draws the families of the "may" roles. Every role has the same chance to be drawn (a family with two variants is
 * twice as likely, then one variant is drawn), which no uniform choice among the subsets can give when two roles
 * exclude each other. The families are put in a random order and walked with one random starting point, so exactly
 * `group.roleCount` of them are taken with their chances. A subset that may not be played is drawn again.
 */
function pickFamilies(
  families: readonly Family[],
  group: ChoiceGroup,
  random: () => number,
): readonly RoleFamily[] {
  const feasible = new Set(group.choices.map((choice) => [...choice].sort().join("|")));
  const eligible = families.filter((family) =>
    group.choices.some((choice) => choice.includes(family.id)),
  );
  if (group.roleCount === 0) return [];
  if (group.roleCount >= eligible.length) return eligible.map((family) => family.id);
  const chances = familyChances(
    eligible.map((family) => family.variants.length),
    group.roleCount,
  );
  for (let attempt = 0; attempt < 200; attempt += 1) {
    // Fisher-Yates: a random order of the families.
    const order = eligible.map((_, index) => index);
    for (let index = order.length - 1; index > 0; index -= 1) {
      const other = Math.floor(randomValue(random) * (index + 1));
      [order[index], order[other]] = [order[other]!, order[index]!];
    }
    const start = randomValue(random);
    const chosen: RoleFamily[] = [];
    let before = 0;
    for (const index of order) {
      const after = before + chances[index]!;
      // A point start + k (k = 0, 1, ...) inside [before, after) takes the family.
      if (Math.ceil(after - start - 1e-12) > Math.ceil(before - start - 1e-12)) {
        chosen.push(eligible[index]!.id);
      }
      before = after;
    }
    if (chosen.length === group.roleCount && feasible.has([...chosen].sort().join("|")))
      return chosen;
  }
  return pick(group.choices, random);
}

/** Uniform wolves and feasible counts, weighted families, uniform variants and independent item coins. */
function drawPlannedLineup(
  plan: Choices,
  random: () => number,
): VariableWerewolfDraw | VariableWerewolfFailure {
  const normalized = plan.selection;
  const wolves = plan.wolves.filter((wolf) => normalized.wolfCounts.includes(wolf.wolfCount));
  if (wolves.some((wolf) => !wolf.groups.length)) return fail("noFeasibleLineup");
  try {
    const wolf = pick(wolves, random);
    const group = pick(wolf.groups, random);
    const families = pickFamilies(wolf.families, group, random);
    const roles = [...normalized.requiredRoles];
    for (const familyId of families)
      roles.push(pick(wolf.families.find((family) => family.id === familyId)!.variants, random));
    roles.sort();
    let settings: Partial<WerewolfSettings> = { ...normalized.settings };
    for (const rule of optionRules)
      settings = {
        ...settings,
        [rule.key]: roles.includes(rule.role)
          ? pick(normalized.options[rule.key], random)
          : normalized.options[rule.key][0],
      };
    const items = [...normalized.requiredItems];
    for (const item of normalized.itemPool) if (randomValue(random) < 0.5) items.push(item);
    items.sort();
    return {
      ok: true,
      lineup: {
        roles,
        settings: {
          ...settings,
          wolfCount: wolf.wolfCount,
          amulet: items.includes("amulet"),
          drunk: items.includes("drunk"),
        },
      },
      items,
    };
  } catch (error) {
    if (error instanceof InvalidRandom) return fail("invalidRandom");
    throw error;
  }
}
export function drawVariableWerewolfLineup(
  players: number,
  selection: VariableWerewolfSelection,
  random: () => number,
  settings: Partial<WerewolfSettings> = {},
): VariableWerewolfDraw | VariableWerewolfFailure {
  const plan = variableChoices(players, selection, settings);
  return plan.ok ? drawPlannedLineup(plan, random) : plan;
}
export interface VariableWerewolfGame {
  readonly ok: true;
  readonly game: WerewolfState;
}
/** One private draw, then checked distribution. A manually chosen wolf count is never overwritten by a score. */
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
  const plan = variableChoices(players.length, selection, settings);
  if (!plan.ok) return plan;
  const draw = drawPlannedLineup(plan, random);
  if (!draw.ok) return draw;
  const game = createCheckedWerewolf(
    playersText,
    narrator,
    random,
    draw.lineup.roles,
    draw.lineup.settings,
  );
  if (!game) return fail("invalidRandom");
  return { ok: true, game };
}
export interface VariableWerewolfRecommendation {
  readonly ok: true;
  readonly recommendedWolfCount: number;
  readonly balance: WerewolfBalance;
}
/** Rates required entries only. Optional pools, ranges, item coins and selected wolf counts have no influence. */
export function recommendVariableWerewolfCount(
  players: number,
  selection: Pick<VariableWerewolfSelection, "requiredRoles" | "requiredItems" | "roleOptions">,
  settings: Partial<WerewolfSettings> = {},
): VariableWerewolfRecommendation | VariableWerewolfFailure {
  if (!availableWerewolfCounts(players).length) return fail("invalidPlayers");
  if (!selection || typeof selection !== "object" || isArray(selection))
    return fail("invalidSelection");
  const roles = defaultEntries(selection.requiredRoles);
  const items = defaultEntries(selection.requiredItems);
  if (!isArray(roles) || !validAutomaticRolePool(players, roles)) return fail("invalidRolePool");
  if (!validItems(players, items)) return fail("invalidItemPool");
  if (!settings || typeof settings !== "object" || isArray(settings))
    return fail("invalidSettings");
  if (
    selection.roleOptions !== undefined &&
    (!selection.roleOptions ||
      typeof selection.roleOptions !== "object" ||
      isArray(selection.roleOptions))
  )
    return fail("invalidRoleOptions");
  const normalized = automaticWerewolfSettings({
    ...settings,
    amulet: items.includes("amulet"),
    drunk: items.includes("drunk"),
  });
  if (!normalized) return fail("invalidSettings");
  const requested: VariableWerewolfRoleOptions = Object.fromEntries(
    optionRules
      .filter(
        (rule) => roles.includes(rule.role) && selection.roleOptions?.[rule.key] !== undefined,
      )
      .map((rule) => [rule.key, selection.roleOptions![rule.key]]),
  );
  const options = normalizedOptions(players, roles, [], requested, normalized);
  if (!options) return fail("invalidRoleOptions");
  let evaluated = normalized;
  for (const rule of optionRules)
    if (roles.includes(rule.role)) evaluated = { ...evaluated, [rule.key]: options[rule.key][0] };
  const rating = resolveAutomaticWerewolfLineup(players, roles, evaluated);
  return rating
    ? {
        ok: true,
        recommendedWolfCount: rating.balance.recommendedWolfCount,
        balance: rating.balance,
      }
    : fail("noFeasibleLineup");
}
