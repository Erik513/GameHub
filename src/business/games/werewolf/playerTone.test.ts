import { expect, it } from "vitest";
import { eventChoices } from "./eventChoices";
import { describePlayers } from "./selectors";
import { createWerewolf, transitionWerewolf, type WerewolfState } from "./stateMachine";

/** The tone of a person in the overview: dead, wounded, attacked, saved, werewolf or alive. */

const names = Array.from({ length: 12 }, (_, index) => "P" + index).join(",");

function toDay(): WerewolfState {
  let state = createWerewolf(names, "Max", () => 0.3, ["toughGuy"], {
    attackOnFirstNight: true,
    wolfCount: 2,
  })!;
  for (let step = 0; step < 100 && state.status !== "day"; step++) {
    const events = eventChoices(state).filter(
      (event) => !(event.type === "attack" && event.target === null),
    );
    state = transitionWerewolf(state, events[0]!);
  }
  return state;
}

const toneOf = (state: WerewolfState, name: string) =>
  describePlayers(state).find((player) => player.name === name)!.tone;

/** The same game in the night with the given facts (the tests only need the fields the overview reads). */
const night = (state: WerewolfState, facts: Record<string, unknown>) =>
  ({ ...state, status: "witch", victim: null, ...facts }) as unknown as WerewolfState;

it("shows living people blue and living werewolves gray", () => {
  const day = toDay();
  const wolf = day.alive.find((player) => player.role === "wolf")!.name;
  const villager = day.alive.find((player) => player.role === "villager")!.name;
  expect(toneOf(day, wolf)).toBe("wolf");
  expect(toneOf(day, villager)).toBe("alive");
});

it("shows the people who are marked to die red until they die, and the dead black", () => {
  const day = toDay();
  const [first, second, third] = day.alive.filter((player) => player.role === "villager");
  const marked = night(day, {
    poisoned: second,
    victim: first,
    wolfTarget: first,
    alive: day.alive.filter((player) => player.name !== third!.name),
  });
  expect(toneOf(marked, first!.name)).toBe("attacked");
  expect(toneOf(marked, second!.name)).toBe("attacked");
  expect(toneOf(marked, third!.name)).toBe("dead");
});

it("shows a person green when the attack was stopped, but only during that night", () => {
  const day = toDay();
  const person = day.alive.find((player) => player.role === "villager")!;
  // Attacked and healed: the wolves attacked him, but nobody is marked to die any more.
  const healed = night(day, { wolfTarget: person });
  expect(toneOf(healed, person.name)).toBe("saved");
  // Marked again later in the night (the witch poisons him, too): red goes before green.
  expect(toneOf(night(day, { poisoned: person, wolfTarget: person }), person.name)).toBe(
    "attacked",
  );
  // With the day the green is gone.
  expect(
    toneOf({ ...healed, status: "day", nomination: 0 } as unknown as WerewolfState, person.name),
  ).toBe("alive");
});

it("shows the wounded tough guy dark red, also at the day, and before the attacked red", () => {
  const day = toDay();
  const tough = day.alive.find((player) => player.role === "toughGuy")!;
  const wounded = { ...day, toughGuyDiesOn: day.night + 1 } as WerewolfState;
  expect(toneOf(wounded, tough.name)).toBe("wounded");
  // Attacked again the same night: the dark red stays (it is the stronger state).
  expect(toneOf(night(wounded, { victim: tough, wolfTarget: tough }), tough.name)).toBe("wounded");
});
