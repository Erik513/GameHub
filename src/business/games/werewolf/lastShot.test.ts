import { expect, it } from "vitest";
import { eventChoices } from "./eventChoices";
import { describePlayers } from "./selectors";
import { createWerewolf, transitionWerewolf, type WerewolfState } from "./stateMachine";

const names = Array.from({ length: 12 }, (_, index) => "P" + index);

function toMorningWithDeadHunter(): { state: WerewolfState; hunter: string } {
  let state = createWerewolf(names.join(","), "Max", () => 0.3, ["hunter"], {
    attackOnFirstNight: true,
    wolfCount: 2,
  })!;
  state = names.reduce(
    (current, player) => transitionWerewolf(current, { type: "roleSeen", player }),
    state,
  );
  const hunter = state.players.find((player) => player.role === "hunter")!.name;
  for (let guard = 0; guard < 60 && state.status !== "morning"; guard += 1) {
    const events = eventChoices(state).filter(
      (event) => !(event.type === "attack" && event.target !== hunter),
    );
    state = transitionWerewolf(state, events[0]!);
  }
  return { hunter, state };
}

it("marks the hunter who has died but still has to decide about his shot, until the shot is made", () => {
  const { hunter, state } = toMorningWithDeadHunter();
  const asked = transitionWerewolf(state, { night: state.night, type: "announceMorning" });
  expect(asked.status).toBe("hunter");
  const row = describePlayers(asked).find((player) => player.name === hunter)!;
  // Out of the game, but not finished: the overview must not show him as dead yet.
  expect(row).toMatchObject({ alive: false, lastShot: true });
  expect(describePlayers(asked).filter((player) => player.lastShot)).toHaveLength(1);
  // After his decision he is dead like everybody else.
  const shot = transitionWerewolf(asked, { night: asked.night, target: null, type: "shot" });
  expect(shot.status).not.toBe("hunter");
  expect(describePlayers(shot).find((player) => player.name === hunter)).toMatchObject({
    alive: false,
    lastShot: false,
  });
});
