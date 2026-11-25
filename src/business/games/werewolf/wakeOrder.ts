import type { FixedDraft } from "./fixedConfiguration";
import { nightSteps, type NightStep, type WakeStepId, type WakeTiming } from "./roles/night";
import type { BasicRoleId, RoleId } from "./roles/roleIds";
import { variableEntries, type VariableDraft, type VariableState } from "./variableConfiguration";

export type { WakeStepId, WakeTiming };

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

/** The roles every game has: their steps are always part of the night. */
const basicRoles: readonly RoleId[] = ["wolf", "seer", "villager"] satisfies BasicRoleId[];

const isBasic = (step: NightStep) => step.roles.some((role) => basicRoles.includes(role));

/** The extras of the configuration that have a step of their own (the drunk is an extra, not a chosen role). */
const isExtra = (id: WakeStepId): id is "amulet" | "drunk" => id === "amulet" || id === "drunk";

const toStep = (step: NightStep, presence: WakePresence): WakeStep => ({
  id: step.id,
  timing: step.timing,
  inGame: presence !== "not",
  presence,
});

/**
 * The order in which the roles wake up every night, for the roles and extras of a configuration.
 * Every step of the order is listed; `inGame` says which of them take part. The wolves and the seer are
 * always in the game; the mayor wakes only with the hammer.
 */
export function wakeOrder(draft: FixedDraft): readonly WakeStep[] {
  return nightSteps().map((step) => {
    const inGame = isBasic(step)
      ? true
      : isExtra(step.id)
        ? draft.settings[step.id]
        : step.roles.some(
            (role) =>
              (draft.roles as readonly RoleId[]).includes(role) && step.wakes(role, draft.settings),
          );
    return toStep(step, inGame ? "must" : "not");
  });
}

const stronger = (...states: VariableState[]): WakePresence =>
  states.includes("must") ? "must" : states.includes("may") ? "may" : "not";

/**
 * The order of the night for variable roles: a role on "must" is part of the order, a role on "may" is shown
 * in it as a possible step (the narrator wakes it only if the draw took it), a role on "not" is not. The mayor
 * wakes only with the hammer.
 */
export function wakeOrderVariable(draft: VariableDraft): readonly WakeStep[] {
  const at = (id: string): VariableState => draft.states[id] ?? "not";
  return nightSteps().map((step) => {
    if (isBasic(step)) return toStep(step, "must");
    if (isExtra(step.id)) return toStep(step, stronger(draft.items[step.id]));
    // Every entry of a role of the step whose option wakes the role (the mayor only with the hammer).
    const entries = variableEntries.filter(
      (entry) =>
        step.roles.includes(entry.role) &&
        step.wakes(entry.role, entry.option ? { [entry.option.key]: entry.option.value } : {}),
    );
    return toStep(step, stronger(...entries.map((entry) => at(entry.id))));
  });
}
