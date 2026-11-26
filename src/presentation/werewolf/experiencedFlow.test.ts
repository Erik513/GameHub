import type { TFunction } from "i18next";
import { describe, expect, it } from "vitest";
import {
  backGuide,
  chooseAbility,
  choosePlayer,
  chooseNobody,
  continueGuide,
  createGuide,
  describeGuide,
  type Guide,
} from "../../business/games/werewolf/narratorGuide";
import { describeRoleStep } from "../../business/games/werewolf/roleStep";
import { createWerewolfSession } from "../../business/games/werewolf/session";
import { createWerewolf } from "../../business/games/werewolf/stateMachine";
import { backToDecision, parseNarratorLevel, settleGuide } from "./experiencedFlow";
import { scriptOf } from "./stepText";

const names = "Anna,Ben,Cleo,Dora,Emil,Finn,Gina,Hans,Ida,Jan,Kim,Lea";
const keyOnly = ((key: string) => key) as unknown as TFunction;

/** The game after the role reveal, at the first role of the first night. */
function firstRole(): Guide {
  let guide = createGuide(
    createWerewolfSession(
      createWerewolf(names, "Max", () => 0.3, [], { attackOnFirstNight: true })!,
    ),
  );
  for (let step = 0; step < 20 && describeGuide(guide).phase !== "ready"; step += 1)
    guide = continueGuide(guide);
  return continueGuide(guide);
}

function openBox(guide: Guide) {
  const view = describeGuide(guide);
  return scriptOf(view, describeRoleStep(view.state), keyOnly)?.find(
    (box) => box.state === "active",
  );
}

/** The decision of the awake role, made the simplest way: the first usable ability and the first person. */
function decide(guide: Guide): Guide {
  const view = describeGuide(guide);
  const ability = view.card?.abilities.find((entry) => entry.available);
  let next = ability ? chooseAbility(guide, ability.id) : guide;
  const target = describeGuide(next).targets[0];
  if (target) next = choosePlayer(next, target);
  if (!describeGuide(next).canContinue) next = chooseNobody(next);
  return continueGuide(next);
}

describe("the experienced narrator", () => {
  it("wakes the role by itself and stops at its decision", () => {
    const start = firstRole();
    expect(describeGuide(start).phase).toBe("intro");
    const settled = settleGuide(start);
    expect(describeGuide(settled).phase).toBe("act");
    expect(openBox(settled)?.button).toBe("undo");
  });

  it("lets the role fall asleep by itself after the last decision, so only next is left", () => {
    let guide = settleGuide(firstRole());
    // Every decision of the role (the seer also looks at the result): afterwards the role is asleep.
    for (let step = 0; step < 5 && describeGuide(guide).phase === "act"; step += 1)
      guide = settleGuide(decide(guide));
    expect(describeGuide(guide).phase).toBe("outro");
    expect(describeGuide(guide).canNext).toBe(true);
  });

  it("never does what next does: the game does not move on by itself", () => {
    let guide = settleGuide(firstRole());
    for (let step = 0; step < 5 && describeGuide(guide).phase === "act"; step += 1)
      guide = settleGuide(decide(guide));
    const asleep = guide;
    expect(settleGuide(asleep)).toBe(asleep);
  });

  it("goes back like the beginner, but never stops at a task that is done by itself", () => {
    const decision = settleGuide(firstRole());
    let guide = decision;
    for (let step = 0; step < 5 && describeGuide(guide).phase === "act"; step += 1)
      guide = settleGuide(decide(guide));
    // From the sleeping role back to where the beginner lands (the step before the role), already settled.
    const beginnerBack = backGuide(guide, true);
    expect(beginnerBack.ok).toBe(true);
    if (!beginnerBack.ok) return;
    const back = backToDecision(guide);
    expect(back && describeGuide(back).phase).toBe(
      describeGuide(settleGuide(beginnerBack.guide)).phase,
    );
    expect(back && settleGuide(back)).toBe(back);
    // From the first decision of the night, the waking up (done by itself) is skipped: back leads to "begin".
    const first = backToDecision(decision);
    expect(first && describeGuide(first).phase).toBe("ready");
  });

  it("reads the saved level and falls back for anything else", () => {
    expect(parseNarratorLevel("experienced")).toBe("experienced");
    expect(parseNarratorLevel("beginner")).toBe("beginner");
    expect(parseNarratorLevel("expert")).toBeUndefined();
  });
});
