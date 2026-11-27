import type { TFunction } from "i18next";
import {
  backGuide,
  checkScript,
  continueGuide,
  describeGuide,
  type Guide,
} from "../../business/games/werewolf/narratorGuide";
import { describeRoleStep } from "../../business/games/werewolf/roleStep";
import { scriptOf, type ScriptBox } from "./stepText";

/** How much the narrator has to tap: every task (beginner) or only the decisions (experienced). */
export type NarratorLevel = "beginner" | "experienced";

export function parseNarratorLevel(raw: unknown): NarratorLevel | undefined {
  return raw === "beginner" || raw === "experienced" ? raw : undefined;
}

// Only the ids, buttons and states of the boxes matter here, not their words.
const keyOnly = ((key: string) => key) as unknown as TFunction;

/** The boxes whose check is a task of the script (the check of `checkScript`), not the step of the role. */
const scriptChecks: ReadonlySet<ScriptBox["id"]> = new Set(["asleep", "discuss", "show", "touch"]);

/**
 * Whether a box of the script is a task without a decision (wake up, show, fall asleep, touch): for an experienced
 * narrator it is done by itself. The true role of the drunk is shown on purpose, so its box stays a task to confirm.
 */
export function isAutomaticBox(box: ScriptBox, guide: Guide): boolean {
  return box.button === "check" && guide.session.present.status !== "drunkReveal";
}

/**
 * One task of the script done by itself for an experienced narrator: the open box is a task without a decision and
 * can be confirmed. Never more than the script: a step that changes the game (what "next" does) is not taken.
 */
function automaticStep(guide: Guide): Guide | null {
  const view = describeGuide(guide);
  if ((view.phase !== "intro" && view.phase !== "act" && view.phase !== "outro") || !view.card)
    return null;
  const boxes = scriptOf(view, describeRoleStep(view.state), keyOnly);
  const open = boxes?.find((box) => box.state === "active");
  if (!open || !open.enabled || !isAutomaticBox(open, guide)) return null;
  // In the outro only a task of the script is done (touching the new holder of the amulet), never "next".
  if (view.phase === "outro" && !scriptChecks.has(open.id)) return null;
  const next = scriptChecks.has(open.id) ? checkScript(guide) : continueGuide(guide);
  if (next === guide || next.session.past.length !== guide.session.past.length) return null;
  return next;
}

/** Does every task of the script without a decision, up to the next decision (or up to "next"). */
export function settleGuide(guide: Guide): Guide {
  let current = guide;
  for (let step = 0; step < 20; step += 1) {
    const next = automaticStep(current);
    if (!next) break;
    current = next;
  }
  return current;
}

function sameSpot(one: Guide, other: Guide): boolean {
  return (
    one.trail.length === other.trail.length &&
    one.session.past.length === other.session.past.length &&
    JSON.stringify(one.trail[one.trail.length - 1]) ===
      JSON.stringify(other.trail[other.trail.length - 1])
  );
}

/**
 * "Back" for an experienced narrator: back over the tasks that were done by themselves, to the decision before (or to
 * the step before a role, where "next" was due). null when there is nothing to go back to.
 */
export function backToDecision(guide: Guide): Guide | null {
  let current = guide;
  for (let step = 0; step < 50; step += 1) {
    const result = backGuide(current, true);
    if (!result.ok) return null;
    current = result.guide;
    const settled = settleGuide(current);
    if (!sameSpot(settled, guide)) return settled;
  }
  return null;
}
