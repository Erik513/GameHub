import { expect, it } from "vitest";
import { effectsOfPerson } from "./narratorCard";
import { createGuide, describeGuide } from "./narratorGuide";
import { describePlayers } from "./selectors";
import { createWerewolfSession } from "./session";
import {
  createWerewolf,
  transitionWerewolf,
  type WerewolfEvent,
  type WerewolfState,
} from "./stateMachine";

function deal(roles: Parameters<typeof createWerewolf>[3]): WerewolfState {
  let state = createWerewolf(
    Array.from({ length: 12 }, (_, seat) => "P" + seat).join(","),
    "Narrator",
    () => 0.3,
    roles,
    { attackOnFirstNight: true, mayor: "doubleVote", wolfCount: 2 },
  )!;
  for (const player of state.players)
    state = advance(state, { type: "roleSeen", player: player.name });
  return state;
}

function advance(state: WerewolfState, event: WerewolfEvent) {
  const next = transitionWerewolf(state, event);
  expect(next).not.toBe(state);
  return next;
}

function villagers(state: WerewolfState) {
  return state.players.filter((player) => player.role === "villager").map((player) => player.name);
}

function viewOf(state: WerewolfState, name: string) {
  return describePlayers(state).find((player) => player.name === name)!;
}

function advanceToWitch(state: WerewolfState, target: string, inspected: string) {
  state = advance(state, { type: "attack", night: 1, target });
  state = advance(state, { type: "inspect", night: 1, target: inspected });
  return advance(state, { type: "closeVision", night: 1 });
}

// Keep these regressions executable while the decisions about their fixes are pending.
it.fails("drops the previous poison slot when the next night begins", () => {
  let state = deal(["witch"]);
  const [wolfTarget, poisonTarget, inspected] = villagers(state) as [string, string, string];
  state = advanceToWitch(state, wolfTarget, inspected);
  const morning = advance(state, { type: "potions", night: 1, heal: false, poison: poisonTarget });
  expect(morning.status).toBe("morning");
  expect(effectsOfPerson(morning, viewOf(morning, poisonTarget))).toContain("poisoned");
  state = advance(morning, { type: "announceMorning", night: 1 });
  const night = advance(state, { type: "endDay", night: 1 });
  expect(night.night).toBe(2);
  expect(effectsOfPerson(night, viewOf(night, poisonTarget))).not.toContain("poisoned");
});

it.fails("marks the host as saved when the night guest takes the wolf attack", () => {
  let state = deal(["nightGuest"]);
  const [host, inspected] = villagers(state) as [string, string];
  const guest = state.players.find((player) => player.role === "nightGuest")!.name;
  state = advance(state, { type: "stayWith", night: 1, target: host });
  state = advance(state, { type: "attack", night: 1, target: host });
  state = advance(state, { type: "inspect", night: 1, target: inspected });
  const morning = advance(state, { type: "closeVision", night: 1 });
  expect(morning.status).toBe("morning");
  expect(viewOf(morning, host).alive).toBe(true);
  expect(viewOf(morning, guest).causes).toContain("wolves");
  expect(effectsOfPerson(morning, viewOf(morning, host))).toContain("guestSaved");
});

it.fails(
  "shows heartbreak as a cause on the morning overview before confirming the announcement",
  () => {
    let state = deal(["cupid"]);
    const [victim, partner, inspected] = villagers(state) as [string, string, string];
    state = advance(state, { type: "bond", night: 1, players: [victim, partner] });
    state = advance(state, { type: "loversReady", night: 1 });
    state = advance(state, { type: "attack", night: 1, target: victim });
    state = advance(state, { type: "inspect", night: 1, target: inspected });
    const morning = advance(state, { type: "closeVision", night: 1 });
    const guide = describeGuide(createGuide(createWerewolfSession(morning)));
    expect(guide.deaths.find((death) => death.name === partner)?.causes).toEqual(["heartbreak"]);
    expect(viewOf(morning, partner).alive).toBe(false);
    expect(viewOf(morning, partner).causes).toEqual(["heartbreak"]);
  },
);

it.fails("stops reporting a player as silenced in the guide at the next night", () => {
  let state = deal(["spellcaster"]);
  const [victim, inspected, silenced] = villagers(state) as [string, string, string];
  state = advance(state, { type: "attack", night: 1, target: victim });
  state = advance(state, { type: "inspect", night: 1, target: inspected });
  state = advance(state, { type: "closeVision", night: 1 });
  state = advance(state, { type: "silence", night: 1, target: silenced });
  state = advance(state, { type: "announceMorning", night: 1 });
  expect(describeGuide(createGuide(createWerewolfSession(state))).notes.silenced).toBe(silenced);
  const night = advance(state, { type: "endDay", night: 1 });
  expect(viewOf(night, silenced).silenced).toBe(false);
  expect(describeGuide(createGuide(createWerewolfSession(night))).notes.silenced).toBeNull();
});

it.fails("rejects a tally that can only split the mayor's vote or count it for the mayor", () => {
  const start = deal(["mayor"]);
  const mayor = start.players.find((player) => player.role === "mayor")!;
  const others = start.players.filter((player) => player.role === "villager").slice(0, 2);
  const wolf = start.players.find((player) => player.role === "wolf")!;
  const [one, two] = others as [typeof mayor, typeof mayor];
  const day: WerewolfState = {
    ...start,
    alive: [mayor, one, two, wolf],
    nomination: 0,
    silencedPlayer: wolf.name,
    silencedNight: 1,
    status: "day",
  };
  const vote = advance(day, {
    type: "nominate",
    night: 1,
    nominees: [mayor.name, one.name, two.name],
  });
  expect(
    transitionWerewolf(vote, {
      type: "voteCount",
      night: 1,
      nomination: 1,
      counts: { [mayor.name]: 2, [one.name]: 1, [two.name]: 1 },
    }),
  ).toBe(vote);
});
