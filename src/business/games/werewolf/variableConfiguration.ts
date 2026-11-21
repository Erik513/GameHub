import {
  availableWerewolfCounts,
  standardWerewolfCount,
  werewolfRoleMinimums,
  type WerewolfSpecialRole,
} from "./configuration";
import { isConfigurablePlayerCount } from "./fixedConfiguration";
import {
  analyzeVariableWerewolfSelection,
  recommendVariableWerewolfCount,
  type VariableWerewolfBlockReason,
  type VariableWerewolfOptionKey,
  type VariableWerewolfSelection,
  type VariableWerewolfSummary,
  type WerewolfItem,
  type WerewolfSelectionRange,
} from "./variableSetup";

/** Where an entry stands: it must be in the game, it may be (the system draws), or it should not be. */
export type VariableState = "may" | "must" | "not";

/** One entry of the boxes: a role, or one option of a role (the hunter with the duty to shoot is its own entry). */
export interface VariableEntry {
  readonly id: string;
  readonly role: WerewolfSpecialRole;
  /** The option of the role this entry stands for; roles without options have none. */
  readonly option?: { readonly key: VariableWerewolfOptionKey; readonly value: string | boolean };
}

/** The roles in the order of the screen, with the options of the roles that have some as entries of their own. */
export const variableEntries: readonly VariableEntry[] = [
  { id: "witch", role: "witch" },
  { id: "hunter:required", role: "hunter", option: { key: "hunterShot", value: "required" } },
  { id: "hunter:optional", role: "hunter", option: { key: "hunterShot", value: "optional" } },
  { id: "idiot", role: "idiot" },
  { id: "bodyguard", role: "bodyguard" },
  { id: "nightGuest", role: "nightGuest" },
  { id: "cupid", role: "cupid" },
  { id: "toughGuy:wolfOnly", role: "toughGuy", option: { key: "toughGuy", value: "wolfOnly" } },
  { id: "toughGuy:anyAttack", role: "toughGuy", option: { key: "toughGuy", value: "anyAttack" } },
  { id: "tanner:anyDeath", role: "tanner", option: { key: "tanner", value: "anyDeath" } },
  { id: "tanner:voteOnly", role: "tanner", option: { key: "tanner", value: "voteOnly" } },
  { id: "apprenticeSeer", role: "apprenticeSeer" },
  {
    id: "spellcaster:allowed",
    role: "spellcaster",
    option: { key: "allowSelfSilence", value: true },
  },
  {
    id: "spellcaster:forbidden",
    role: "spellcaster",
    option: { key: "allowSelfSilence", value: false },
  },
  { id: "mayor:doubleVote", role: "mayor", option: { key: "mayor", value: "doubleVote" } },
  { id: "mayor:hammer", role: "mayor", option: { key: "mayor", value: "hammer" } },
  { id: "paranormalInvestigator", role: "paranormalInvestigator" },
  { id: "magician", role: "magician" },
];

export const variableItems: readonly WerewolfItem[] = ["drunk", "amulet"];

/** The game rules that are no part of the draw. */
export interface VariableRules {
  readonly attackOnFirstNight: boolean;
}

/**
 * The draft of the variable configuration. Fixed and variable drafts are kept apart. The number of the "may" roles
 * has no maximum of its own until the player sets one (null: as many as there are); the wolf counts are the
 * standard count of the players until the narrator picks some (null).
 */
export interface VariableDraft {
  readonly items: Readonly<Record<WerewolfItem, VariableState>>;
  readonly roleRange: { readonly minimum: number; readonly maximum: number | null };
  readonly rules: VariableRules;
  /** The state of every entry; an entry that is not here should not be in the game. */
  readonly states: Readonly<Record<string, VariableState>>;
  readonly wolfCounts: readonly number[] | null;
}

export const emptyVariableDraft: VariableDraft = {
  items: { amulet: "not", drunk: "not" },
  roleRange: { maximum: null, minimum: 0 },
  rules: { attackOnFirstNight: false },
  states: {},
  wolfCounts: null,
};

const stateOf = (draft: VariableDraft, id: string): VariableState => draft.states[id] ?? "not";

/** The entries that belong together: the options of one role, or the two guard roles (at most one of them). */
function siblingsOf(entry: VariableEntry): readonly VariableEntry[] {
  const group = (candidate: VariableEntry) =>
    candidate.role === "bodyguard" || candidate.role === "nightGuest"
      ? entry.role === "bodyguard" || entry.role === "nightGuest"
      : candidate.role === entry.role;
  return variableEntries.filter((candidate) => candidate.id !== entry.id && group(candidate));
}

function entryById(id: string): VariableEntry | undefined {
  return variableEntries.find((entry) => entry.id === id);
}

/** Moves an entry to a state. A "must" entry puts the other options of its role (or the other guard) to "not". */
export function setVariableEntryState(
  draft: VariableDraft,
  id: string,
  state: VariableState,
): VariableDraft {
  const entry = entryById(id);
  if (!entry) return draft;
  const states: Record<string, VariableState> = { ...draft.states };
  if (state === "not") delete states[id];
  else states[id] = state;
  if (state === "must") for (const sibling of siblingsOf(entry)) delete states[sibling.id];
  return { ...draft, states };
}

export function setVariableItemState(
  draft: VariableDraft,
  item: WerewolfItem,
  state: VariableState,
): VariableDraft {
  return { ...draft, items: { ...draft.items, [item]: state } };
}

export function setVariableRule(
  draft: VariableDraft,
  key: keyof VariableRules,
  value: boolean,
): VariableDraft {
  return { ...draft, rules: { ...draft.rules, [key]: value } };
}

/** Sets the least and the most "may" roles that are drawn (null for the most: as many as there are). */
export function setVariableRoleRange(
  draft: VariableDraft,
  minimum: number,
  maximum: number | null,
): VariableDraft {
  const least = Math.max(0, Math.trunc(minimum));
  const most = maximum === null ? null : Math.max(least, Math.trunc(maximum));
  return { ...draft, roleRange: { maximum: most, minimum: least } };
}

/** Takes a wolf count in or out of the choice; at least one stays chosen. */
export function toggleVariableWolfCount(
  draft: VariableDraft,
  players: number,
  count: number,
): VariableDraft {
  const allowed = availableWerewolfCounts(players);
  if (!allowed.includes(count)) return draft;
  const chosen = draft.wolfCounts ?? [standardWerewolfCount(players)];
  const next = chosen.includes(count)
    ? chosen.filter((value) => value !== count)
    : [...chosen, count];
  if (next.length === 0) return draft;
  return { ...draft, wolfCounts: [...next].sort((a, b) => a - b) };
}

/** How many roles can be drawn from a pool: the bodyguard and the night guest are one role (one of them). */
const roleFamilyCount = (roles: readonly WerewolfSpecialRole[]): number =>
  new Set(roles.map((role) => (role === "nightGuest" ? "bodyguard" : role))).size;

/**
 * The draft in the form of the game logic for this number of players. The number of "may" roles is kept inside what
 * the seats allow: a range that the musts and the wolves leave no room for would block the start, so it is cut to the
 * possible range (the draft keeps what the player set).
 */
export function variableSelectionOf(
  players: number,
  draft: VariableDraft,
): VariableWerewolfSelection {
  const selection = rawSelectionOf(players, draft);
  const wide = {
    ...selection,
    roleRange: { maximum: roleFamilyCount(selection.rolePool), minimum: 0 },
  };
  const analysis = analyzeVariableWerewolfSelection(players, wide, { ...draft.rules });
  const bounds = analysis.ok ? seatBounds(analysis) : null;
  if (!bounds) return selection;
  const maximum = Math.max(
    Math.min(selection.roleRange.maximum, bounds.maximumTop),
    bounds.maximumBottom,
  );
  const minimum = Math.min(selection.roleRange.minimum, bounds.minimumTop, maximum);
  return { ...selection, roleRange: { maximum, minimum } };
}

/**
 * What the seats allow for the number of "may" roles that are drawn. The draw takes one of the chosen wolf counts
 * and needs a lineup with it, so every chosen wolf count must find a number of roles inside the range: the least may
 * not exceed what the tightest wolf count allows at most, the most may not fall below what the widest one needs at
 * least.
 */
function seatBounds(analysis: VariableWerewolfSummary): {
  readonly maximumBottom: number;
  readonly maximumTop: number;
  readonly minimumTop: number;
} | null {
  const chosen = analysis.wolfCounts.filter((wolf) => wolf.selected);
  if (chosen.length === 0 || chosen.some((wolf) => wolf.possibleRoleCounts.length === 0))
    return null;
  return {
    maximumBottom: Math.max(...chosen.map((wolf) => Math.min(...wolf.possibleRoleCounts))),
    maximumTop: Math.max(...chosen.map((wolf) => Math.max(...wolf.possibleRoleCounts))),
    minimumTop: Math.min(...chosen.map((wolf) => Math.max(...wolf.possibleRoleCounts))),
  };
}

function rawSelectionOf(players: number, draft: VariableDraft): VariableWerewolfSelection {
  const requiredRoles: WerewolfSpecialRole[] = [];
  const rolePool: WerewolfSpecialRole[] = [];
  const options: Record<string, (string | boolean)[]> = {};
  const roles = [...new Set(variableEntries.map((entry) => entry.role))];
  for (const role of roles) {
    const entries = variableEntries.filter((entry) => entry.role === role);
    const musts = entries.filter((entry) => stateOf(draft, entry.id) === "must");
    const mays = entries.filter((entry) => stateOf(draft, entry.id) === "may");
    const target = musts.length > 0 ? requiredRoles : mays.length > 0 ? rolePool : undefined;
    if (!target) continue;
    target.push(role);
    const key = entries[0]?.option?.key;
    if (key) {
      const chosen = musts.length > 0 ? [musts[0]!] : mays;
      options[key] = chosen.map((entry) => entry.option!.value);
    }
  }
  const wolfCounts = (draft.wolfCounts ?? [standardWerewolfCount(players)]).filter((count) =>
    availableWerewolfCounts(players).includes(count),
  );
  const poolSize = roleFamilyCount(rolePool);
  const maximum = draft.roleRange.maximum ?? poolSize;
  return {
    itemPool: variableItems.filter((item) => draft.items[item] === "may"),
    requiredItems: variableItems.filter((item) => draft.items[item] === "must"),
    requiredRoles,
    roleOptions: options,
    rolePool,
    roleRange: {
      maximum: Math.min(maximum, poolSize),
      // Drawing every role of the pool is the same as "must": at least one of them stays open.
      minimum: Math.min(draft.roleRange.minimum, maximum, Math.max(0, poolSize - 1)),
    },
    wolfCounts: wolfCounts.length > 0 ? wolfCounts : [standardWerewolfCount(players)],
  };
}

export interface VariableEntryView {
  readonly entry: VariableEntry;
  /** Why the entry cannot be moved to "must" or "may" now (it can always be moved to "not"). */
  readonly lock: VariableWerewolfBlockReason | null;
  /** True when no seat is left for it as a "must" role, although it may stay or go to "may". */
  readonly mustBlocked: boolean;
  readonly state: VariableState;
}

export interface VariableItemView {
  readonly item: WerewolfItem;
  readonly lock: VariableWerewolfBlockReason | null;
  /** True when no seat is left for it as a "must" extra. */
  readonly mustBlocked: boolean;
  readonly state: VariableState;
}

export interface VariableWolfOption {
  readonly canStart: boolean;
  readonly count: number;
  readonly recommended: boolean;
  readonly selected: boolean;
}

export interface VariableConfigurationView {
  /** The entries that exist for this number of players (the others are not shown at all). */
  readonly entries: readonly VariableEntryView[];
  readonly items: readonly VariableItemView[];
  /** The least and most "may" roles that are possible at all, or null while none is possible. */
  readonly possibleRange: WerewolfSelectionRange | null;
  /** The number of "may" roles that is drawn: the range of the draft, kept inside what is possible. */
  readonly range: WerewolfSelectionRange;
  /** The number of "may" roles (options of one role count once). */
  readonly mayRoleCount: number;
  /** The highest value of "at least": below the number of "may" roles, as all of them would be "must" roles. */
  readonly minimumCeiling: number;
  /**
   * How many villagers are left when the wolves, the seer, the "must" roles and the drawn "may" roles have their
   * seats: the fewest (most wolves, most roles) and the most (fewest wolves, fewest roles).
   */
  readonly villagers: { readonly maximum: number; readonly minimum: number };
  /** The lowest value of "at most": the wolf counts need at least this many roles. */
  readonly maximumFloor: number;
  readonly supported: boolean;
  readonly canStart: boolean;
  readonly wolf: {
    readonly choice: boolean;
    readonly options: readonly VariableWolfOption[];
  };
  /** Why the start is blocked although the draft is valid, or a failure of the logic. */
  readonly problem: "invalid" | "noLineup" | null;
}

const emptyView = (supported: boolean): VariableConfigurationView => ({
  canStart: false,
  entries: [],
  items: [],
  mayRoleCount: 0,
  maximumFloor: 0,
  villagers: { maximum: 0, minimum: 0 },
  minimumCeiling: 0,
  possibleRange: null,
  problem: supported ? "invalid" : null,
  range: { maximum: 0, minimum: 0 },
  supported,
  wolf: { choice: false, options: [] },
});

/** What the screen shows for this number of players: entries, locks, wolf counts and the possible range. */
export function describeVariableConfiguration(
  players: number,
  draft: VariableDraft,
): VariableConfigurationView {
  if (!isConfigurablePlayerCount(players)) return emptyView(false);
  const selection = variableSelectionOf(players, draft);
  const settings = { ...draft.rules };
  const analysis = analyzeVariableWerewolfSelection(players, selection, settings);
  if (!analysis.ok) return emptyView(true);
  return viewOf(players, draft, selection, analysis, settings);
}

function viewOf(
  players: number,
  draft: VariableDraft,
  selection: VariableWerewolfSelection,
  analysis: VariableWerewolfSummary,
  settings: VariableRules,
): VariableConfigurationView {
  // Whether the game can still be played when something moves to "must": the seats of the "must" roles are
  // limited by the number of players (the maximum of roles for the players).
  // Every chosen wolf count must keep a possible lineup, as the draw refuses the game otherwise.
  const baseFits = analysis.canStart;
  const fitsAsMust = (moved: VariableDraft): boolean => {
    if (!baseFits) return true;
    const moved2 = analyzeVariableWerewolfSelection(
      players,
      variableSelectionOf(players, moved),
      settings,
    );
    return moved2.ok && moved2.canStart;
  };
  const entries: VariableEntryView[] = [];
  for (const entry of variableEntries) {
    const role = analysis.roles.find((candidate) => candidate.role === entry.role);
    if (!role?.available) continue;
    const option = entry.option
      ? role.options.find((candidate) => candidate.value === entry.option?.value)
      : undefined;
    // An option that the number of players does not allow (the hammer below ten players) is not shown.
    if (option?.reason === "minimumPlayers") continue;
    const state = stateOf(draft, entry.id);
    // A role that is in the game already is not locked; the others are, when it cannot be added to what stands.
    const lock = state === "not" ? (option ? option.reason : role.reason) : null;
    const mustBlocked =
      state !== "must" &&
      lock === null &&
      !fitsAsMust(setVariableEntryState(draft, entry.id, "must"));
    entries.push({ entry, lock, mustBlocked, state });
  }
  const items = variableItems.flatMap((item): VariableItemView[] => {
    const info = analysis.items.find((candidate) => candidate.item === item);
    if (!info?.available) return [];
    const state = draft.items[item];
    const lock = state === "not" && !info.possible ? (info.reason ?? "incompatibleRoles") : null;
    const mustBlocked =
      state !== "must" && lock === null && !fitsAsMust(setVariableItemState(draft, item, "must"));
    return [{ item, lock, mustBlocked, state }];
  });
  const counts = availableWerewolfCounts(players);
  const recommended = recommendVariableWerewolfCount(
    players,
    {
      requiredItems: selection.requiredItems ?? [],
      requiredRoles: selection.requiredRoles ?? [],
      ...(selection.roleOptions ? { roleOptions: selection.roleOptions } : {}),
    },
    settings,
  );
  const chosen = selection.wolfCounts;
  const wolfOptions = counts.map((count) => ({
    canStart: analysis.wolfCounts.find((info) => info.wolfCount === count)?.canStart ?? false,
    count,
    recommended: recommended.ok && recommended.recommendedWolfCount === count,
    selected: chosen.includes(count),
  }));
  const possible = analysis.possibleRoleRange;
  const bounds = seatBounds(analysis);
  const top = bounds?.maximumTop ?? possible?.maximum ?? 0;
  const bottom = bounds?.maximumBottom ?? 0;
  const most = possible ? Math.max(Math.min(draft.roleRange.maximum ?? top, top), bottom) : 0;
  // The least number stays below the number of "may" roles (drawing all of them would make them "must" roles) and
  // below what the tightest wolf count allows.
  const ceiling = Math.min(
    bounds?.minimumTop ?? 0,
    Math.max(possible?.minimum ?? 0, roleFamilyCount(selection.rolePool) - 1),
  );
  const least = possible ? Math.min(Math.max(draft.roleRange.minimum, 0), most, ceiling) : 0;
  // The seats left for villagers: the players without the wolves, the seer, the "must" roles and the drawn roles.
  const chosenWolves = counts.filter((count) => chosen.includes(count));
  const fewestWolves = chosenWolves.length > 0 ? Math.min(...chosenWolves) : 0;
  const mostWolves = chosenWolves.length > 0 ? Math.max(...chosenWolves) : 0;
  const musts = selection.requiredRoles?.length ?? 0;
  const villagers = {
    maximum: Math.max(0, players - fewestWolves - 1 - musts - least),
    minimum: Math.max(0, players - mostWolves - 1 - musts - most),
  };
  return {
    canStart: analysis.canStart,
    entries,
    items,
    mayRoleCount: roleFamilyCount(selection.rolePool),
    maximumFloor: bottom,
    villagers,
    minimumCeiling: ceiling,
    possibleRange: possible,
    problem: analysis.canStart ? null : "noLineup",
    range: { maximum: most, minimum: least },
    supported: true,
    wolf: { choice: counts.length > 1, options: wolfOptions },
  };
}

/**
 * Brings a draft back into line after the number of players changed: entries that do not exist for the players
 * leave the boxes, two musts of one role or of the guards keep the first, the wolf counts that are not allowed
 * leave the choice, and the range stays inside what is possible.
 */
export function normalizeVariableDraft(players: number, draft: VariableDraft): VariableDraft {
  if (!isConfigurablePlayerCount(players)) return draft;
  // First the entries and extras that need more players than there are leave the boxes: the logic would
  // refuse a draft that still holds them.
  const states: Record<string, VariableState> = {};
  for (const [id, state] of Object.entries(draft.states)) {
    const entry = entryById(id);
    if (!entry || state === "not") continue;
    if (players < werewolfRoleMinimums[entry.role]) continue;
    if (entry.id === "mayor:hammer" && players < 10) continue;
    states[id] = state;
  }
  const view = describeVariableConfiguration(players, { ...draft, states });
  const shown = new Set(view.entries.map((entry) => entry.entry.id));
  for (const id of Object.keys(states)) if (!shown.has(id)) delete states[id];
  // Two musts of one role (or both guards) cannot stand together: the first one stays.
  for (const entry of variableEntries) {
    if (states[entry.id] !== "must") continue;
    for (const sibling of siblingsOf(entry)) {
      if (
        states[sibling.id] !== undefined &&
        variableEntries.indexOf(sibling) > variableEntries.indexOf(entry)
      ) {
        delete states[sibling.id];
      }
    }
  }
  const items = { ...draft.items };
  const shownItems = new Set(view.items.map((item) => item.item));
  for (const item of variableItems) if (!shownItems.has(item)) items[item] = "not";
  const allowed = availableWerewolfCounts(players);
  const kept = draft.wolfCounts?.filter((count) => allowed.includes(count)) ?? null;
  return {
    ...draft,
    items,
    states,
    wolfCounts: kept && kept.length > 0 ? kept : null,
  };
}

/**
 * Reads a saved draft (storage can hold anything). Returns nothing unless every part has the expected shape, so a
 * broken save never reaches the configuration.
 */
export function parseSavedVariableDraft(raw: unknown): VariableDraft | undefined {
  if (typeof raw !== "object" || raw === null) return undefined;
  const { items, roleRange, rules, states, wolfCounts } = raw as Record<string, unknown>;
  const isState = (value: unknown): value is VariableState =>
    value === "must" || value === "may" || value === "not";
  if (typeof states !== "object" || states === null || Array.isArray(states)) return undefined;
  const cleanStates: Record<string, VariableState> = {};
  for (const [id, state] of Object.entries(states)) {
    if (!entryById(id) || !isState(state)) return undefined;
    if (state !== "not") cleanStates[id] = state;
  }
  if (typeof items !== "object" || items === null) return undefined;
  const savedItems = items as Record<string, unknown>;
  if (!isState(savedItems.amulet) || !isState(savedItems.drunk)) return undefined;
  if (typeof rules !== "object" || rules === null) return undefined;
  const savedRules = rules as Record<string, unknown>;
  // An older save also holds the choice "reveal roles", which no longer exists: it is dropped.
  if (typeof savedRules.attackOnFirstNight !== "boolean") return undefined;
  if (typeof roleRange !== "object" || roleRange === null) return undefined;
  const range = roleRange as Record<string, unknown>;
  const whole = (value: unknown): value is number =>
    typeof value === "number" && Number.isInteger(value) && value >= 0;
  if (!whole(range.minimum) || (range.maximum !== null && !whole(range.maximum))) return undefined;
  if (
    wolfCounts !== null &&
    !(Array.isArray(wolfCounts) && wolfCounts.length > 0 && wolfCounts.every(whole))
  ) {
    return undefined;
  }
  return {
    items: { amulet: savedItems.amulet, drunk: savedItems.drunk },
    roleRange: { maximum: range.maximum, minimum: range.minimum },
    rules: { attackOnFirstNight: savedRules.attackOnFirstNight },
    states: cleanStates,
    wolfCounts: wolfCounts === null ? null : [...new Set(wolfCounts)].sort((a, b) => a - b),
  };
}
