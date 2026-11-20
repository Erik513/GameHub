import type { FixedDraft } from "./fixedConfiguration";
import type { VariableDraft, VariableState } from "./variableConfiguration";

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

/** Whether a step is certainly part of the game, may be (the draw decides) or is not. */
export type WakePresence = "may" | "must" | "not";

export interface WakeStep {
  readonly id: WakeStepId;
  /** Whether the step is called with this configuration (certainly or possibly). */
  readonly inGame: boolean;
  /** "may": the draw decides, the narrator calls the step either way so nobody learns the draw. */
  readonly presence: WakePresence;
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
  return order.map((step) => ({
    ...step,
    inGame: inGame[step.id],
    presence: inGame[step.id] ? "must" : "not",
  }));
}

const stronger = (...states: VariableState[]): WakePresence =>
  states.includes("must") ? "must" : states.includes("may") ? "may" : "not";

/**
 * The order of the night for variable roles: a role on "must" is called, a role on "may" is called, too (the
 * narrator calls it whether or not the draw took it, so the silence of a step does not give the draw away), a
 * role on "not" is not. The mayor wakes only with the hammer.
 */
export function wakeOrderVariable(draft: VariableDraft): readonly WakeStep[] {
  const at = (id: string): VariableState => draft.states[id] ?? "not";
  const presence: Record<WakeStepId, WakePresence> = {
    amulet: stronger(draft.items.amulet),
    cupid: stronger(at("cupid")),
    drunk: stronger(draft.items.drunk),
    guard: stronger(at("bodyguard"), at("nightGuest")),
    magician: stronger(at("magician")),
    mayor: stronger(at("mayor:hammer")),
    paranormalInvestigator: stronger(at("paranormalInvestigator")),
    seer: "must",
    spellcaster: stronger(at("spellcaster:allowed"), at("spellcaster:forbidden")),
    witch: stronger(at("witch")),
    wolves: "must",
  };
  return order.map((step) => ({
    ...step,
    inGame: presence[step.id] !== "not",
    presence: presence[step.id],
  }));
}
