import type { PickEvent, RoleStepSpec, RoleStepVariant } from "../roleStep";
import type { WerewolfState } from "../stateMachine";

export const spec = (
  variant: RoleStepVariant,
  kind: RoleStepSpec["kind"],
  more: Partial<Omit<RoleStepSpec, "variant" | "kind">> = {},
): RoleStepSpec => ({
  kind,
  showsVictim: false,
  skip: { label: "skip", summary: "noChoice" },
  skippable: false,
  variant,
  ...more,
});

export const pick = (event: PickEvent) => ({ event, nobody: false, skipTarget: null });

export type RoleSteps = {
  readonly [Status in WerewolfState["status"]]?: (
    state: WerewolfState & { status: Status },
    usable: boolean,
  ) => RoleStepSpec;
};

export function describeDefinedStep<Status extends WerewolfState["status"]>(
  steps: RoleSteps,
  state: WerewolfState & { status: Status },
  usable: boolean,
): RoleStepSpec | undefined {
  return steps[state.status]?.(state, usable);
}
