import { resolveAutomaticWerewolfLineup } from "./automaticSetup";
import {
  standardWerewolfCount,
  type WerewolfSettings,
  type WerewolfSpecialRole,
} from "./configuration";
import { scoreWerewolfVillage } from "./lineupBalance";
import type { VariableWerewolfSelection } from "./variableSetup";

/** The setting that an option of a role changes. */
const optionKeyOf = {
  hunter: "hunterShot",
  mayor: "mayor",
  spellcaster: "allowSelfSilence",
  tanner: "tanner",
  toughGuy: "toughGuy",
} as const satisfies Partial<Record<WerewolfSpecialRole, keyof WerewolfSettings>>;

/** The bodyguard and the night guest are one role of the draw. */
const familyOf = (role: WerewolfSpecialRole): string =>
  role === "nightGuest" ? "bodyguard" : role;

const total = (
  roles: readonly WerewolfSpecialRole[],
  settings: Partial<WerewolfSettings>,
): number => scoreWerewolfVillage(roles, settings).reduce((sum, entry) => sum + entry.points, 0);

const mean = (values: readonly number[]): number =>
  values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;

/**
 * The wolf count to recommend for a selection with roles that are drawn. The strength of the village is the sum of
 * the values of its roles, so it can be worked out without a draw: the roles on "must" count in full, the roles on
 * "may" with the average value of all of them times the average number that is drawn (between the least and the
 * most), and every extra on "may" with half its value (it is drawn with the same chance to be in or not). The
 * recommendation is the wolf count whose target that strength comes closest to, with the rules of the logic for a
 * tie. The values of roles that only work together (a bonus of a pair) are not included for the drawn roles.
 * Returns nothing where the "must" roles alone cannot be rated.
 */
export function recommendWolfCountForSelection(
  players: number,
  selection: VariableWerewolfSelection,
  rules: Partial<WerewolfSettings>,
): number | undefined {
  const mustRoles = selection.requiredRoles ?? [];
  const mustItems = selection.requiredItems ?? [];
  const options = selection.roleOptions ?? {};
  let base: Partial<WerewolfSettings> = {
    ...rules,
    amulet: mustItems.includes("amulet"),
    drunk: mustItems.includes("drunk"),
  };
  // The option of a role that must be in the game is the one that was picked.
  for (const role of mustRoles) {
    const key = optionKeyOf[role as keyof typeof optionKeyOf];
    const first = key ? options[key]?.[0] : undefined;
    if (key && first !== undefined) base = { ...base, [key]: first };
  }
  const rating = resolveAutomaticWerewolfLineup(players, mustRoles, base);
  if (!rating) return undefined;
  const baseTotal = total(mustRoles, base);

  // The value a drawn role adds to the roles on "must", averaged over its options and over the roles of its family.
  const valueOf = (role: WerewolfSpecialRole): number => {
    const key = optionKeyOf[role as keyof typeof optionKeyOf];
    const choices = key ? (options[key] ?? []) : [];
    const settings =
      choices.length > 0 ? choices.map((choice) => ({ ...base, [key]: choice })) : [base];
    return mean(settings.map((setting) => total([...mustRoles, role], setting) - baseTotal));
  };
  const families = new Map<string, WerewolfSpecialRole[]>();
  for (const role of selection.rolePool) {
    families.set(familyOf(role), [...(families.get(familyOf(role)) ?? []), role]);
  }
  const roleValue = mean([...families.values()].map((variants) => mean(variants.map(valueOf))));
  const drawn = (selection.roleRange.minimum + selection.roleRange.maximum) / 2;
  const itemValues = selection.itemPool.map(
    (item) => (total(mustRoles, { ...base, [item]: true }) - baseTotal) / 2,
  );
  const change = drawn * roleValue + itemValues.reduce((sum, value) => sum + value, 0);

  const standard = standardWerewolfCount(players);
  return rating.balance.candidates
    .map((candidate) => ({
      distance: Math.abs(candidate.difference + change),
      wolfCount: candidate.wolfCount,
    }))
    .sort(
      (a, b) =>
        a.distance - b.distance ||
        Math.abs(a.wolfCount - standard) - Math.abs(b.wolfCount - standard) ||
        a.wolfCount - b.wolfCount,
    )[0]?.wolfCount;
}
