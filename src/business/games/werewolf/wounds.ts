import type { WerewolfState } from "./stateMachine";

export type WoundCause = "wolves" | "witchPoison" | "magicianKill" | "hunter";

/** The hidden role has no defensive ability until the drunk is revealed. */
export function delaysToughGuyAttack(
  state: Pick<WerewolfState, "drunk" | "settings">,
  target: { readonly name: string; readonly role: string },
  cause: WoundCause,
): boolean {
  return (
    target.role === "toughGuy" &&
    !(state.drunk?.player === target.name && !state.drunk.revealed) &&
    (cause === "wolves" || state.settings.toughGuy === "anyAttack")
  );
}
