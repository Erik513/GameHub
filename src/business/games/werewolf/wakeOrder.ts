import type { FixedDraft } from "./fixedConfiguration";

/** The roles and extras that are woken at night, in the order of the night. */
export type WakeStepId =
  | "amulet"
  | "cupid"
  | "drunk"
  | "guard"
  | "magician"
  | "mayor"
  | "paranormalInvestigator"
  | "seer"
  | "spellcaster"
  | "witch"
  | "wolves";

/** When a step happens, if it does not happen every night. */
export type WakeTiming = "firstNight" | "fromSecondNight" | "thirdNight";

export interface WakeStep {
  readonly id: WakeStepId;
  /** Whether the step is part of the game with this configuration. */
  readonly inGame: boolean;
  readonly timing: WakeTiming | null;
}

/** The fixed order in which the narrator wakes the roles. The amulet holder is asked last. */
const order: readonly { readonly id: WakeStepId; readonly timing: WakeTiming | null }[] = [
  { id: "cupid", timing: "firstNight" },
  { id: "drunk", timing: "thirdNight" },
  { id: "guard", timing: null },
  { id: "wolves", timing: null },
  { id: "seer", timing: null },
  { id: "paranormalInvestigator", timing: null },
  { id: "witch", timing: null },
  { id: "magician", timing: null },
  { id: "mayor", timing: "fromSecondNight" },
  { id: "spellcaster", timing: null },
  { id: "amulet", timing: null },
];

/**
 * The order in which the roles wake up every night, for the roles and extras of a configuration.
 * Every step of the order is listed; `inGame` says which of them take part. The wolves and the seer are
 * always in the game; the mayor wakes only with the hammer.
 */
export function wakeOrder(draft: FixedDraft): readonly WakeStep[] {
  const has = (...roles: FixedDraft["roles"][number][]) =>
    roles.some((role) => draft.roles.includes(role));
  const inGame: Record<WakeStepId, boolean> = {
    amulet: draft.settings.amulet,
    cupid: has("cupid"),
    drunk: draft.settings.drunk,
    guard: has("bodyguard", "nightGuest"),
    magician: has("magician"),
    mayor: has("mayor") && draft.settings.mayor === "hammer",
    paranormalInvestigator: has("paranormalInvestigator"),
    seer: true,
    spellcaster: has("spellcaster"),
    witch: has("witch"),
    wolves: true,
  };
  return order.map((step) => ({ ...step, inGame: inGame[step.id] }));
}
