import {
  availableWerewolfCounts,
  standardWerewolfCount,
  validWerewolfRoles,
  werewolfPlayerLimits,
  werewolfRoleMinimums,
  type WerewolfSettings,
  type WerewolfSpecialRole,
} from "./configuration";
import { resolveAutomaticWerewolfLineup } from "./automaticSetup";
import { resolveFixedWerewolfLineup } from "./fixedSetup";

/** The party options the fixed configuration sets; the wolf count is kept apart (it follows the players). */
export type FixedSettings = Pick<
  WerewolfSettings,
  | "allowSelfSilence"
  | "amulet"
  | "attackOnFirstNight"
  | "drunk"
  | "hunterShot"
  | "mayor"
  | "revealRoles"
  | "tanner"
  | "toughGuy"
>;

/**
 * The draft of the fixed configuration: the roles that are chosen, the party options and the wolf count
 * the narrator picked (`null` until one is picked: then the standard count of the players is meant).
 * The draft is never changed by itself; a choice that no longer fits shows up as an issue.
 */
export interface FixedDraft {
  readonly roles: readonly WerewolfSpecialRole[];
  readonly settings: FixedSettings;
  readonly wolfCount: number | null;
}

export const defaultFixedSettings: FixedSettings = {
  allowSelfSilence: false,
  amulet: false,
  attackOnFirstNight: false,
  drunk: false,
  hunterShot: "optional",
  mayor: "doubleVote",
  revealRoles: true,
  tanner: "anyDeath",
  toughGuy: "wolfOnly",
};

export const emptyFixedDraft: FixedDraft = {
  roles: [],
  settings: defaultFixedSettings,
  wolfCount: null,
};

/** The ids of the choices on the screen: a role, or "guard" for the alternative bodyguard / night guest. */
export type FixedItemId =
  | "apprenticeSeer"
  | "cupid"
  | "guard"
  | "hunter"
  | "idiot"
  | "magician"
  | "mayor"
  | "paranormalInvestigator"
  | "spellcaster"
  | "tanner"
  | "toughGuy"
  | "witch";

export interface FixedItemDefinition {
  readonly id: FixedItemId;
  /**
   * "toggle": the role is chosen or not. "variant": the role is chosen by picking one of its variants
   * (nothing picked: no role). "alternative": at most one of the roles.
   */
  readonly kind: "alternative" | "toggle" | "variant";
  readonly minimum: number;
  readonly roles: readonly WerewolfSpecialRole[];
}

const item = (
  id: FixedItemId,
  kind: FixedItemDefinition["kind"],
  ...roles: WerewolfSpecialRole[]
): FixedItemDefinition => ({
  id,
  kind,
  minimum: Math.min(...roles.map((role) => werewolfRoleMinimums[role])),
  roles,
});

/** All choices in the order of the unlocking: the rows of the grid are the minimum numbers of players. */
export const fixedItems: readonly FixedItemDefinition[] = [
  item("witch", "toggle", "witch"),
  item("hunter", "variant", "hunter"),
  item("idiot", "toggle", "idiot"),
  item("guard", "alternative", "bodyguard", "nightGuest"),
  item("cupid", "toggle", "cupid"),
  item("toughGuy", "variant", "toughGuy"),
  item("tanner", "variant", "tanner"),
  item("apprenticeSeer", "toggle", "apprenticeSeer"),
  item("spellcaster", "variant", "spellcaster"),
  item("mayor", "variant", "mayor"),
  item("paranormalInvestigator", "toggle", "paranormalInvestigator"),
  item("magician", "toggle", "magician"),
];

/** The extras that belong to no role card. */
export const fixedAddons = [
  { id: "drunk", minimum: 9 },
  { id: "amulet", minimum: 10 },
] as const;

export type FixedAddonId = (typeof fixedAddons)[number]["id"];

/** Why a choice cannot be made now: too few players, no free place, or two roles that cannot play together. */
export type FixedLock = "combination" | "minimumPlayers" | "noSeat";

export interface FixedItemView {
  readonly id: FixedItemId;
  readonly kind: FixedItemDefinition["kind"];
  readonly lock: FixedLock | null;
  readonly minimum: number;
  readonly roles: readonly WerewolfSpecialRole[];
  readonly selected: boolean;
  /** The role of an alternative that is chosen. */
  readonly chosenRole: WerewolfSpecialRole | null;
  /** The variant of a variant item that is chosen (nothing: no role). */
  readonly variant: string | null;
  /** The variants that cannot be picked now. */
  readonly lockedVariants: readonly string[];
  /**
   * The chosen role that keeps this one out (the witch and the magician exclude each other in most line-ups),
   * or nothing. Only set when the role would be allowed without that other role.
   */
  readonly blockedBy: WerewolfSpecialRole | null;
}

export interface FixedAddonView {
  readonly id: FixedAddonId;
  readonly lock: "minimumPlayers" | "wolves" | null;
  readonly minimum: number;
  readonly selected: boolean;
}

export interface FixedWolfOption {
  readonly count: number;
  readonly recommended: boolean;
  readonly selected: boolean;
  /** False when this wolf count would make the chosen roles impossible (it cannot be picked then). */
  readonly selectable: boolean;
}

/** What is wrong with the draft; nothing is changed silently, the narrator corrects it. */
export type FixedIssue =
  | { readonly code: "addonMinimum"; readonly addon: FixedAddonId; readonly minimum: number }
  | { readonly code: "combination"; readonly roles: readonly WerewolfSpecialRole[] }
  | { readonly code: "drunkWolves" }
  | { readonly code: "hammerMinimum"; readonly minimum: number }
  | { readonly code: "invalid" }
  | { readonly code: "noSeat"; readonly roles: number }
  | { readonly code: "players"; readonly count: number }
  | { readonly code: "roleMinimum"; readonly minimum: number; readonly role: WerewolfSpecialRole }
  | { readonly code: "wolfCount"; readonly count: number };

export interface FixedConfigurationView {
  readonly addons: readonly FixedAddonView[];
  readonly hammerAvailable: boolean;
  readonly issues: readonly FixedIssue[];
  readonly items: readonly FixedItemView[];
  readonly players: number;
  readonly ready: boolean;
  /** The wolf count that fits and is closest to the choice, to offer with one tap; nothing when none helps. */
  readonly suggestedWolfCount: number | null;
  readonly supported: boolean;
  /** The normal villagers that fill the free places; null while the draft has more roles than places. */
  readonly villagers: number | null;
  readonly wolf: {
    readonly fixed: boolean;
    readonly options: readonly FixedWolfOption[];
    /** The wolf count that is meant: the chosen one, or the standard count of the players. */
    readonly selected: number;
  };
}

/** True when the number of players can be configured at all. */
export function isConfigurablePlayerCount(players: number): boolean {
  return (
    Number.isInteger(players) &&
    players >= werewolfPlayerLimits.minimum &&
    players <= werewolfPlayerLimits.supportedMaximum
  );
}

/** The wolf count meant by the draft for this number of players. */
export function selectedWolfCount(draft: FixedDraft, players: number): number {
  return draft.wolfCount ?? standardWerewolfCount(players);
}

function withRole(roles: readonly WerewolfSpecialRole[], role: WerewolfSpecialRole) {
  return roles.includes(role) ? roles : [...roles, role];
}

function withoutRoles(
  roles: readonly WerewolfSpecialRole[],
  remove: readonly WerewolfSpecialRole[],
) {
  return roles.filter((role) => !remove.includes(role));
}

/** The settings as the logic reads them, with the wolf count in place. */
export function fixedConfigurationSettings(
  draft: FixedDraft,
  players: number,
): Partial<WerewolfSettings> {
  return { ...draft.settings, wolfCount: selectedWolfCount(draft, players) };
}

/** True when the roles can be played with this wolf count and these options. */
function playable(
  players: number,
  roles: readonly WerewolfSpecialRole[],
  wolves: number,
  settings: FixedSettings,
): boolean {
  return (
    roles.length + wolves + 1 <= players &&
    validWerewolfRoles(players, roles, wolves) &&
    (!settings.drunk || wolves >= 2) &&
    resolveFixedWerewolfLineup(players, roles, { ...settings, wolfCount: wolves }) !== null
  );
}

/**
 * Why a role cannot be added to the chosen roles now. What is chosen always stays playable: a role that
 * would leave no place, or would not play with the chosen roles and the chosen wolf count, is locked.
 */
function whyLocked(
  players: number,
  role: WerewolfSpecialRole,
  others: readonly WerewolfSpecialRole[],
  settings: FixedSettings,
  wolves: readonly number[],
): FixedLock | null {
  if (players < werewolfRoleMinimums[role]) return "minimumPlayers";
  const hypothetical = withRole(others, role);
  if (wolves.every((count) => hypothetical.length + count + 1 > players)) return "noSeat";
  if (!wolves.some((count) => playable(players, hypothetical, count, settings))) {
    return "combination";
  }
  return null;
}

/** The view of the draft for this number of players: what can be chosen, what is locked and what is wrong. */
export function describeFixedConfiguration(
  players: number,
  draft: FixedDraft,
): FixedConfigurationView {
  const wolves = selectedWolfCount(draft, players);
  const supported = isConfigurablePlayerCount(players);
  const counts = supported ? availableWerewolfCounts(players) : [];
  const { roles, settings } = draft;

  const items = fixedItems.map((definition): FixedItemView => {
    const { id, kind, minimum } = definition;
    const own = definition.roles;
    const chosen = own.filter((role) => roles.includes(role));
    const others = withoutRoles(roles, own);
    // An item is locked when none of its roles could be added to the other chosen roles (with the
    // chosen wolf count; with a wolf count that does not fit, with any allowed one).
    const basis = counts.includes(wolves) ? [wolves] : counts;
    const locks = own.map((role) => whyLocked(players, role, others, settings, basis));
    const everyLocked = locks.every((lock) => lock !== null);
    const lock = everyLocked ? (locks[0] ?? null) : null;
    const selected = chosen.length > 0;
    // The witch and the magician: the other one is what locks this one, if it does.
    const rival = id === "witch" ? "magician" : id === "magician" ? "witch" : null;
    const blockedBy =
      rival !== null &&
      !selected &&
      lock === "combination" &&
      others.includes(rival) &&
      own.every(
        (role) =>
          whyLocked(
            players,
            role,
            others.filter((other) => other !== rival),
            settings,
            basis,
          ) !== "combination",
      )
        ? rival
        : null;
    return {
      blockedBy,
      chosenRole: kind === "alternative" ? (chosen[0] ?? null) : null,
      id,
      kind,
      // A chosen role is never shown locked: the issue list explains what no longer fits.
      lock: selected ? null : lock,
      lockedVariants: id === "mayor" && players < 10 ? ["hammer"] : [],
      minimum,
      roles: own,
      selected,
      variant:
        !selected || kind !== "variant"
          ? null
          : id === "hunter"
            ? settings.hunterShot
            : id === "tanner"
              ? settings.tanner
              : id === "mayor"
                ? settings.mayor
                : id === "toughGuy"
                  ? settings.toughGuy
                  : settings.allowSelfSilence
                    ? "allowed"
                    : "forbidden",
    };
  });

  const addons = fixedAddons.map(({ id, minimum }): FixedAddonView => {
    const selected = settings[id];
    const lock =
      players < minimum ? "minimumPlayers" : id === "drunk" && wolves < 2 ? "wolves" : null;
    return { id, lock: selected ? null : lock, minimum, selected };
  });

  const issues: FixedIssue[] = [];
  if (!supported) issues.push({ code: "players", count: players });
  else {
    if (!counts.includes(wolves)) issues.push({ code: "wolfCount", count: wolves });
    for (const role of roles) {
      const minimum = werewolfRoleMinimums[role];
      if (players < minimum) issues.push({ code: "roleMinimum", minimum, role });
    }
    if (roles.length + wolves + 1 > players) issues.push({ code: "noSeat", roles: roles.length });
    if (
      counts.includes(wolves) &&
      roles.length + wolves + 1 <= players &&
      !validWerewolfRoles(players, roles, wolves)
    ) {
      // Chosen roles that do not play together with this wolf count.
      const clash = roles.filter(
        (role) =>
          role === "witch" || role === "magician" || role === "bodyguard" || role === "nightGuest",
      );
      if (!issues.some((issue) => issue.code === "roleMinimum")) {
        issues.push({ code: "combination", roles: clash });
      }
    }
    if (roles.includes("mayor") && settings.mayor === "hammer" && players < 10) {
      issues.push({ code: "hammerMinimum", minimum: 10 });
    }
    for (const { id, minimum } of fixedAddons) {
      if (settings[id] && players < minimum)
        issues.push({ addon: id, code: "addonMinimum", minimum });
    }
    if (settings.drunk && wolves < 2 && players >= 9) issues.push({ code: "drunkWolves" });
  }

  const resolved = supported
    ? resolveFixedWerewolfLineup(players, roles, fixedConfigurationSettings(draft, players))
    : null;
  if (supported && issues.length === 0 && resolved === null) issues.push({ code: "invalid" });

  // The recommendation exists only when there is a real choice (more than one allowed wolf count).
  const recommendation =
    supported && counts.length > 1 && roles.length + Math.min(...counts) + 1 <= players
      ? (resolveAutomaticWerewolfLineup(players, roles, draft.settings)?.balance
          .recommendedWolfCount ?? null)
      : null;

  // The wolf count that would make the draft valid, the recommended one first.
  const fitting = counts.filter(
    (count) =>
      roles.length + count + 1 <= players &&
      validWerewolfRoles(players, roles, count) &&
      (!settings.drunk || count >= 2) &&
      resolveFixedWerewolfLineup(players, roles, { ...draft.settings, wolfCount: count }) !== null,
  );
  const suggestedWolfCount =
    issues.length === 0
      ? null
      : recommendation !== null && fitting.includes(recommendation)
        ? recommendation
        : (fitting[0] ?? null);

  const villagers = supported ? players - wolves - 1 - roles.length : null;
  return {
    addons,
    hammerAvailable: players >= 10,
    issues,
    items,
    players,
    ready: supported && issues.length === 0 && resolved !== null,
    suggestedWolfCount,
    supported,
    villagers: villagers !== null && villagers >= 0 ? villagers : null,
    wolf: {
      fixed: counts.length === 1,
      options: counts.map((count) => ({
        count,
        recommended: recommendation === count,
        selected: count === wolves,
        selectable: count === wolves || playable(players, roles, count, settings),
      })),
      selected: wolves,
    },
  };
}

/** Chooses or drops a role that is a plain toggle. */
export function toggleFixedRole(draft: FixedDraft, role: WerewolfSpecialRole): FixedDraft {
  return {
    ...draft,
    roles: draft.roles.includes(role) ? withoutRoles(draft.roles, [role]) : [...draft.roles, role],
  };
}

/** Chooses the role of an alternative (bodyguard or night guest), or none; the other one is dropped. */
export function chooseFixedAlternative(
  draft: FixedDraft,
  roles: readonly WerewolfSpecialRole[],
  choice: WerewolfSpecialRole | null,
): FixedDraft {
  const rest = withoutRoles(draft.roles, roles);
  return { ...draft, roles: choice === null ? rest : [...rest, choice] };
}

/**
 * Picks a variant of a variant item: the role is chosen with its rule. Picking `null` takes the role
 * out again. The other options stay as they are.
 */
export function chooseFixedVariant(
  draft: FixedDraft,
  id: "hunter" | "mayor" | "spellcaster" | "tanner" | "toughGuy",
  variant: string | null,
): FixedDraft {
  const role: WerewolfSpecialRole = id;
  if (variant === null) return { ...draft, roles: withoutRoles(draft.roles, [role]) };
  const roles = withRole(draft.roles, role);
  switch (id) {
    case "hunter":
      return {
        ...draft,
        roles,
        settings: {
          ...draft.settings,
          hunterShot: variant === "required" ? "required" : "optional",
        },
      };
    case "tanner":
      return {
        ...draft,
        roles,
        settings: { ...draft.settings, tanner: variant === "voteOnly" ? "voteOnly" : "anyDeath" },
      };
    case "mayor":
      return {
        ...draft,
        roles,
        settings: { ...draft.settings, mayor: variant === "hammer" ? "hammer" : "doubleVote" },
      };
    case "spellcaster":
      return {
        ...draft,
        roles,
        settings: { ...draft.settings, allowSelfSilence: variant === "allowed" },
      };
    case "toughGuy":
      return {
        ...draft,
        roles,
        settings: {
          ...draft.settings,
          toughGuy: variant === "anyAttack" ? "anyAttack" : "wolfOnly",
        },
      };
  }
}

export function setFixedSetting<
  Key extends "amulet" | "attackOnFirstNight" | "drunk" | "revealRoles",
>(draft: FixedDraft, key: Key, value: boolean): FixedDraft {
  return { ...draft, settings: { ...draft.settings, [key]: value } };
}

export function setFixedWolfCount(draft: FixedDraft, count: number): FixedDraft {
  return { ...draft, wolfCount: count };
}

/**
 * Corrects the draft for a new number of players, so it is always playable and nothing has to be fixed by
 * hand. Adding players needs no correction (the villagers fill the places). Removing players takes
 * back, from the bottom up (the roles that unlock last first): the roles and extras that need more
 * players than there are, the hammer of the mayor below ten players, a wolf count that is not allowed
 * any more, and then, while the roles do not fit the places or the wolf count, one role after the other.
 * It returns the same draft when nothing has to change. Below six players there is nothing to correct
 * against, so the draft is kept.
 */
export function normalizeFixedDraft(players: number, draft: FixedDraft): FixedDraft {
  if (!isConfigurablePlayerCount(players)) return draft;
  let roles = draft.roles.filter((role) => players >= werewolfRoleMinimums[role]);
  let settings: FixedSettings = {
    ...draft.settings,
    amulet: draft.settings.amulet && players >= 10,
    drunk: draft.settings.drunk && players >= 9,
    mayor: players < 10 ? "doubleVote" : draft.settings.mayor,
  };
  const counts = availableWerewolfCounts(players);
  let wolfCount =
    draft.wolfCount !== null && counts.includes(draft.wolfCount) ? draft.wolfCount : null;

  const order = (role: WerewolfSpecialRole) =>
    fixedItems.findIndex((entry) => entry.roles.includes(role));
  while (!playable(players, roles, wolfCount ?? standardWerewolfCount(players), settings)) {
    if (roles.length > 0) {
      // The role that unlocks last goes first.
      const last = roles.reduce((a, b) => (order(b) > order(a) ? b : a));
      roles = withoutRoles(roles, [last]);
    } else if (settings.drunk && (wolfCount ?? standardWerewolfCount(players)) < 2) {
      settings = { ...settings, drunk: false };
    } else if (wolfCount !== null) {
      wolfCount = null;
    } else {
      break;
    }
  }

  const unchanged =
    roles.length === draft.roles.length &&
    wolfCount === draft.wolfCount &&
    (Object.keys(settings) as (keyof FixedSettings)[]).every(
      (key) => settings[key] === draft.settings[key],
    );
  return unchanged ? draft : { roles, settings, wolfCount };
}

/**
 * Reads a saved draft (storage can hold anything). Returns nothing unless every part has the expected
 * shape, so a broken save never reaches the configuration; the roles that do not fit the players are
 * taken back by `normalizeFixedDraft` afterwards.
 */
export function parseSavedFixedDraft(raw: unknown): FixedDraft | undefined {
  if (typeof raw !== "object" || raw === null) return undefined;
  const { roles, settings, wolfCount } = raw as Record<string, unknown>;
  if (!Array.isArray(roles) || typeof settings !== "object" || settings === null) return undefined;
  const known = Object.keys(werewolfRoleMinimums);
  const savedRoles = roles.filter(
    (role): role is WerewolfSpecialRole => typeof role === "string" && known.includes(role),
  );
  if (savedRoles.length !== roles.length || new Set(savedRoles).size !== savedRoles.length) {
    return undefined;
  }
  const s = settings as Record<string, unknown>;
  const bool = (value: unknown) => typeof value === "boolean";
  if (
    !bool(s.allowSelfSilence) ||
    !bool(s.amulet) ||
    !bool(s.attackOnFirstNight) ||
    !bool(s.drunk) ||
    !bool(s.revealRoles) ||
    (s.hunterShot !== "optional" && s.hunterShot !== "required") ||
    (s.mayor !== "doubleVote" && s.mayor !== "hammer") ||
    (s.tanner !== "anyDeath" && s.tanner !== "voteOnly") ||
    // An older save has no option for the tough guy: it gets the usual one.
    (s.toughGuy !== undefined && s.toughGuy !== "wolfOnly" && s.toughGuy !== "anyAttack")
  ) {
    return undefined;
  }
  if (wolfCount !== null && !(typeof wolfCount === "number" && Number.isInteger(wolfCount))) {
    return undefined;
  }
  return {
    roles: savedRoles,
    settings: {
      allowSelfSilence: s.allowSelfSilence,
      amulet: s.amulet,
      attackOnFirstNight: s.attackOnFirstNight,
      drunk: s.drunk,
      hunterShot: s.hunterShot,
      mayor: s.mayor,
      revealRoles: s.revealRoles,
      tanner: s.tanner,
      toughGuy: s.toughGuy === "anyAttack" ? "anyAttack" : "wolfOnly",
    },
    wolfCount: wolfCount ?? null,
  };
}
