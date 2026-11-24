import { current, frameOf } from "./guideFrames";
import type { Guide, GuideBack } from "./guideTypes";
import { undoWerewolfSession } from "./session";

/** Where the step of the current role starts in the trail: announcement, choice and falling asleep belong together. */
function roleStart(guide: Guide): number {
  const length = guide.session.past.length;
  let start = guide.trail.length - 1;
  while (
    start > 1 &&
    guide.trail[start]!.phase !== "ready" &&
    guide.trail[start - 1]!.pastLength === length &&
    guide.trail[start - 1]!.phase !== "ready"
  )
    start -= 1;
  return start;
}

/**
 * Back may leave the step of a role (go to the previous role) only once: after coming back to a role the narrator
 * decides again (or goes forward); further back is not possible until the game has moved on and the narrator comes
 * back from the next role. Inside one role (announcement, choice, falling asleep) back is always possible.
 */
export function backIsBlocked(guide: Guide): boolean {
  // The role reveal has nothing to do with the game: back and forward are free until the narrator begins the game.
  if (guide.session.present.status === "roles" || current(guide).phase === "ready") return false;
  const length = guide.session.past.length;
  const previous = guide.trail[roleStart(guide) - 1];
  const leavesRole = previous ? previous.pastLength < length : length > 0;
  return (
    leavesRole &&
    guide.trail.some((frame) => frame.returned === true && frame.pastLength === length)
  );
}

/** "Back": to the previous role (a step that the game already took is undone in the game), but only one role back. */
export function backGuide(guide: Guide, confirmed = false): GuideBack {
  // The vote can always be broken off: back to the nomination, however often the narrator has come back to it.
  if (guide.session.present.status !== "vote" && backIsBlocked(guide))
    return { ok: false, reason: "limit" };
  if (guide.trail.length > 1) {
    // Back leaves the whole step of the current role (announcement, choice, falling asleep) at once: it only moves
    // between the roles. A decision is taken back with the button in the summary (see `reopenDecision`).
    const start = roleStart(guide);
    const trail = guide.trail.slice(0, start);
    const previous = trail[trail.length - 1]!;
    let session = guide.session;
    while (previous.pastLength < session.past.length) {
      const undone = undoWerewolfSession(session, confirmed);
      if (!undone.ok)
        return { ok: false, reason: undone.reason === "emptyHistory" ? "atStart" : undone.reason };
      session = undone.session;
    }
    // Coming back into the role reveal is not marked: there the way back has no limit.
    const crossed = session !== guide.session && session.present.status !== "roles";
    return {
      guide: {
        session,
        // All steps of the role are marked, so the mark stays while the narrator goes back inside the role.
        trail: crossed
          ? trail.map((frame) =>
              frame.pastLength === previous.pastLength ? { ...frame, returned: true } : frame,
            )
          : trail,
      },
      ok: true,
    };
  }
  const undone = undoWerewolfSession(guide.session, confirmed);
  if (!undone.ok)
    return { ok: false, reason: undone.reason === "emptyHistory" ? "atStart" : undone.reason };
  const { present } = undone.session;
  // The steps before the reload are not known any more: the step starts again with its content open.
  const frame = frameOf(present, undone.session.past.length);
  return {
    guide: {
      session: undone.session,
      trail: [
        {
          ...(frame.phase === "intro" ? { ...frame, phase: "act" as const } : frame),
          returned: true,
        },
      ],
    },
    ok: true,
  };
}
