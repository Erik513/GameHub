import { transitionWerewolf, type WerewolfEvent, type WerewolfState } from "./stateMachine";

export interface WerewolfSession {
  readonly present: WerewolfState;
  readonly past: readonly WerewolfState[];
}

export function createWerewolfSession(state: WerewolfState): WerewolfSession {
  return { present: state, past: [] };
}

/** Stores immutable snapshots, including the private event log; never rerolls roles. */
export function advanceWerewolfSession(
  session: WerewolfSession,
  event: WerewolfEvent,
): WerewolfSession {
  const present = transitionWerewolf(session.present, event);
  return present === session.present
    ? session
    : { present, past: [...session.past, session.present] };
}

export function undoWerewolfSession(
  session: WerewolfSession,
  confirmed = false,
):
  | { readonly ok: true; readonly session: WerewolfSession }
  | { readonly ok: false; readonly reason: "emptyHistory" | "confirmationRequired" } {
  const previous = session.past[session.past.length - 1];
  if (!previous) return { ok: false, reason: "emptyHistory" };
  if (!confirmed && (previous.status === "morning" || previous.status === "exile"))
    return { ok: false, reason: "confirmationRequired" };
  return { ok: true, session: { present: previous, past: session.past.slice(0, -1) } };
}
