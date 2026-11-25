import { roleDefinitions } from "./index";
import type { RoleId } from "./roleIds";
import type { RoleSettings } from "./types";

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

/** When a role is woken at night: its step (roles that share a step wake together) and the place of the step. */
export interface RoleNight {
  readonly step: WakeStepId;
  /** The place of the step in the night; every role of a step has the same place. */
  readonly place: number;
  readonly timing?: WakeTiming;
  /** Whether the role wakes up with these options (the mayor only with the hammer); without it the role always wakes. */
  readonly wakes?: (settings: Partial<RoleSettings>) => boolean;
}

/** One step of the night with the roles it wakes (the amulet is an extra without a role). */
export interface NightStep {
  readonly id: WakeStepId;
  readonly timing: WakeTiming | null;
  readonly roles: readonly RoleId[];
  readonly wakes: (role: RoleId, settings: Partial<RoleSettings>) => boolean;
}

/** The holder of the amulet is asked last, after every role. */
const amulet: NightStep = { id: "amulet", timing: null, roles: [], wakes: () => true };

let steps: readonly NightStep[] | undefined;

/**
 * The steps of the night in their order, read from the definitions of the roles when they are first needed (the
 * definitions import the game logic, so they are not ready when this file is loaded).
 */
export function nightSteps(): readonly NightStep[] {
  steps ??= build();
  return steps;
}

function build(): readonly NightStep[] {
  const byStep = new Map<
    WakeStepId,
    { place: number; timing: WakeTiming | null; roles: RoleId[] }
  >();
  for (const definition of Object.values(roleDefinitions)) {
    const night = definition.night;
    if (!night) continue;
    const entry = byStep.get(night.step);
    if (entry && entry.place !== night.place)
      throw new Error(`The roles of the step ${night.step} have different places.`);
    if (entry) entry.roles.push(definition.id);
    else
      byStep.set(night.step, {
        place: night.place,
        timing: night.timing ?? null,
        roles: [definition.id],
      });
  }
  const wakes = (role: RoleId, settings: Partial<RoleSettings>) =>
    roleDefinitions[role].night?.wakes?.(settings) ?? true;
  return [
    ...[...byStep.entries()]
      .sort(([, one], [, other]) => one.place - other.place)
      .map(([id, { timing, roles }]) => ({ id, timing, roles, wakes })),
    amulet,
  ];
}
