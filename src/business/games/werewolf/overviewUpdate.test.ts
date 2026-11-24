import { expect, it } from "vitest";
import {
  answerQuestion,
  chooseAbility,
  choosePlayer,
  continueGuide,
  createGuide,
  describeGuide,
} from "./narratorGuide";
import { createWerewolfSession } from "./session";
import { describePlayers } from "./selectors";
import { createWerewolf, type WerewolfState } from "./stateMachine";

/** The overview of all players is up to date after EVERY decision, not only when the next role is called. */

const names = Array.from({ length: 12 }, (_, index) => "P" + index).join(",");
const base = (roles: Parameters<typeof createWerewolf>[3] = []) =>
  createWerewolf(names, "Max", () => 0.3, roles, {
    amulet: true,
    attackOnFirstNight: true,
    wolfCount: 2,
  })!;
const villagers = (state: WerewolfState) => state.players.filter((p) => p.role === "villager");

it("shows the lovers in the overview as soon as the list of Cupid is confirmed", () => {
  const start = base(["cupid"]);
  const [one, two] = villagers(start);
  const state = { ...start, status: "cupid" } as unknown as WerewolfState;
  let guide = continueGuide(createGuide(createWerewolfSession(state)));
  guide = chooseAbility(guide, "bond");
  guide = choosePlayer(choosePlayer(guide, one!.name), two!.name);
  // The list is still open: nothing is decided yet.
  expect(describeGuide(guide).overviewState.lovers).toBeNull();
  // The list is confirmed: the lovers are in the overview, the game itself waits for the end of the step.
  guide = continueGuide(guide);
  const view = describeGuide(guide);
  expect(view.overviewState.lovers).toEqual([one!.name, two!.name]);
  expect(view.state.lovers).toBeNull();
  expect(describePlayers(view.overviewState).find((p) => p.name === one!.name)?.partner).toBe(
    two!.name,
  );
});

it("shows the new holder of the amulet in the overview once the holder has decided", () => {
  const start = base();
  const [holder, other] = villagers(start);
  const state = {
    ...start,
    amulet: { holder: holder!.name, mustPass: true },
    night: 2,
    poisoned: null,
    status: "amuletPass",
    victim: null,
  } as unknown as WerewolfState;
  let guide = continueGuide(createGuide(createWerewolfSession(state)));
  guide = choosePlayer(chooseAbility(guide, "passAmulet"), other!.name);
  expect(describeGuide(guide).overviewState.amulet?.holder).toBe(holder!.name);
  guide = continueGuide(guide);
  const view = describeGuide(guide);
  expect(view.overviewState.amulet?.holder).toBe(other!.name);
  expect(view.state.amulet?.holder).toBe(holder!.name);
});

it("shows the person the witch saved as saved in the overview after the first answer", () => {
  const start = base(["witch"]);
  const victim = villagers(start)[0]!;
  const state = {
    ...start,
    status: "witch",
    victim,
    wolfTarget: victim,
  } as unknown as WerewolfState;
  let guide = continueGuide(createGuide(createWerewolfSession(state)));
  const toneOf = (view: ReturnType<typeof describeGuide>) =>
    describePlayers(view.overviewState).find((p) => p.name === victim.name)?.tone;
  // Before the answer the victim is marked to die.
  expect(toneOf(describeGuide(guide))).toBe("attacked");
  // The witch heals: the overview shows him saved at once, the step itself is not finished.
  guide = chooseAbility(guide, "heal");
  expect(describeGuide(guide).state.status).toBe("witch");
  expect(toneOf(describeGuide(guide))).toBe("saved");
  // (The second question still stands.)
  expect(describeGuide(guide).question).toBe("poison");
  void answerQuestion;
});

it("keeps the victims of the night marked, not dead, in the overview until the morning is announced", () => {
  // Without the amulet the witch is the last role of the night: her decision leads to the morning.
  const start = createWerewolf(names, "Max", () => 0.3, ["witch"], {
    attackOnFirstNight: true,
    wolfCount: 2,
  })!;
  const [victim, poisoned] = villagers(start);
  const state = {
    ...start,
    status: "witch",
    victim,
    wolfTarget: victim,
  } as unknown as WerewolfState;
  let guide = continueGuide(createGuide(createWerewolfSession(state)));
  // The witch does not heal and poisons a second person; the last role of the night is decided.
  guide = answerQuestion(guide, "skip");
  guide = choosePlayer(chooseAbility(guide, "poison"), poisoned!.name);
  guide = continueGuide(guide);
  const view = describeGuide(guide);
  expect(view.phase).toBe("outro");
  const tones = (announce: boolean) =>
    describePlayers(view.overviewState, announce)
      .filter((person) => [victim!.name, poisoned!.name].includes(person.name))
      .map((person) => person.tone);
  // The night is not over: both are marked to die (red), nobody is announced dead yet.
  expect(tones(false)).toEqual(["attacked", "attacked"]);
  // Only the announcement of the morning shows them as dead.
  expect(tones(true)).toEqual(["dead", "dead"]);
});
