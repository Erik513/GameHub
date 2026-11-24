import { type GuideFrame, type GuideSelection } from "./guideTypes";
import type { WerewolfSession } from "./session";

/** The saved trail of the guide: what is written before a reload and how it is read back. */
const guidePhases: readonly unknown[] = ["intro", "act", "outro", "plain", "ready"];
const maxSavedTrail = 2000;

function isSavedFrame(value: unknown): value is GuideFrame {
  if (typeof value !== "object" || value === null) return false;
  const frame = value as Partial<GuideFrame>;
  const selection = frame.selection as Partial<GuideSelection> | undefined;
  return (
    guidePhases.includes(frame.phase) &&
    Number.isInteger(frame.pastLength) &&
    (frame.event === null || (typeof frame.event === "object" && frame.event !== undefined)) &&
    typeof selection === "object" &&
    selection !== null &&
    (selection.ability === null || typeof selection.ability === "string") &&
    typeof selection.heal === "boolean" &&
    typeof selection.none === "boolean" &&
    Array.isArray(selection.picks) &&
    selection.picks.every((pick) => typeof pick === "string")
  );
}

/**
 * Reads the saved trail of the guide (the checkpoints of the narrator: every step with its choice). It is only taken
 * when it belongs to the saved game, that is when its last step is the present of the game; otherwise undefined.
 */
export function parseSavedTrail(
  raw: unknown,
  session: WerewolfSession,
): readonly GuideFrame[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > maxSavedTrail) return undefined;
  if (!raw.every(isSavedFrame)) return undefined;
  const last = raw[raw.length - 1]!;
  return last.pastLength === session.past.length ? raw : undefined;
}
