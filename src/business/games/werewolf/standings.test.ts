import { expect, it } from "vitest";
import { describeStandings } from "./guideWinners";
import { createWerewolf, type WerewolfState } from "./stateMachine";

/** The end of the game: every person once, winners first (by group), then the losers; the living first, the dead by death. */

const names = Array.from({ length: 12 }, (_, index) => "P" + index).join(",");
const base = createWerewolf(names, "Max", () => 0.3, [], { wolfCount: 2 })!;
const wolves = base.players.filter((player) => player.role === "wolf");
const others = base.players.filter((player) => player.role !== "wolf");

/** A finished game: who is still alive, and who died in which order (the history numbers them). */
function finished(
  winner: "village" | "wolves",
  alive: readonly string[],
  deaths: readonly string[],
  extra: Record<string, unknown> = {},
): WerewolfState {
  return {
    ...base,
    alive: base.players.filter((player) => alive.includes(player.name)),
    history: deaths.map((player, index) => ({
      diedMasked: false,
      id: index + 1,
      kind: "death",
      night: 1,
      period: "night",
      phase: "morning",
      player,
      role: base.players.find((p) => p.name === player)!.role,
      sources: [],
    })),
    status: "finished",
    winner,
    ...extra,
  } as unknown as WerewolfState;
}

const namesOf = (group: { players: readonly { name: string }[] } | undefined) =>
  group?.players.map((player) => player.name);

it("lists the winning side first and the losers below, each person once", () => {
  const [one, two, three] = others;
  const deaths = [one!.name, wolves[0]!.name, two!.name, wolves[1]!.name];
  const state = finished(
    "village",
    others.filter((player) => ![one!.name, two!.name].includes(player.name)).map((p) => p.name),
    deaths,
  );
  const groups = describeStandings(state);
  expect(groups.map((group) => group.kind)).toEqual(["village", "losers"]);
  const all = groups.flatMap((group) => namesOf(group)!);
  expect(all).toHaveLength(12);
  expect(new Set(all).size).toBe(12);
  expect(three).toBeDefined();
});

it("puts the living first by name and the dead after them, the one who died last first and the first dead last", () => {
  const [one, two] = others;
  const state = finished(
    "village",
    others.filter((player) => ![one!.name, two!.name].includes(player.name)).map((p) => p.name),
    [one!.name, wolves[0]!.name, two!.name, wolves[1]!.name],
  );
  const [village, losers] = describeStandings(state);
  const living = village!.players.filter((person) => person.tone !== "dead").map((p) => p.name);
  expect(namesOf(village)!.slice(0, living.length)).toEqual(
    [...living].sort((a, b) => a.localeCompare(b)),
  );
  // The dead of the winning side: the second one died after the first one, so he comes first.
  expect(namesOf(village)!.slice(living.length)).toEqual([two!.name, one!.name]);
  // The losers are the wolves, both dead: the later death first.
  expect(namesOf(losers)).toEqual([wolves[1]!.name, wolves[0]!.name]);
});

it("keeps lovers of the winning side in that side: there is no group of the lovers", () => {
  const [one, two] = others;
  const state = finished(
    "village",
    others.map((p) => p.name),
    wolves.map((p) => p.name),
    { lovers: [one!.name, two!.name] },
  );
  const groups = describeStandings(state);
  expect(groups.map((group) => group.kind)).toEqual(["village", "losers"]);
  // Both stand with the village, with the heart as the sign of the lovers.
  const lover = groups[0]!.players.find((person) => person.name === one!.name)!;
  expect(lover.partner).toBe(two!.name);
});

it("shows the tanner in a group of his own and not again in the winning side", () => {
  const tanner = others[0]!;
  const state = finished(
    "village",
    others.map((p) => p.name),
    wolves.map((p) => p.name),
    { tannerWinner: tanner.name },
  );
  const groups = describeStandings(state);
  expect(groups.map((group) => group.kind)).toEqual(["village", "tanner", "losers"]);
  expect(namesOf(groups[1])).toEqual([tanner.name]);
  expect(namesOf(groups[0])).not.toContain(tanner.name);
});

it("gives nothing before the game is finished", () => {
  expect(describeStandings(base)).toEqual([]);
});

it("groups a mixed couple by role: the werewolf with the werewolves, the villager in the group of the lovers", () => {
  const wolf = wolves[0]!;
  const villager = others[0]!;
  // The wolves win with a mixed couple as the last two: the lovers are alive, everybody else is dead.
  const rest = base.players
    .map((player) => player.name)
    .filter((n) => ![wolf.name, villager.name].includes(n));
  const state = finished("wolves", [wolf.name, villager.name], rest, {
    lovers: [wolf.name, villager.name],
  });
  const groups = describeStandings(state);
  expect(groups.map((group) => group.kind)).toEqual(["wolves", "lovers", "losers"]);
  // The werewolf stands with the werewolves (with his own role and the heart). The villager wins with his partner
  // without being on the winning side by his role: he stands alone in the group of the lovers.
  const lover = groups[0]!.players.find((person) => person.name === wolf.name)!;
  expect(lover.role).toBe("wolf");
  expect(lover.partner).toBe(villager.name);
  expect(lover.tone).toBe("wolf");
  expect(namesOf(groups[1])).toEqual([villager.name]);
  expect(namesOf(groups[2])).not.toContain(villager.name);
  // Everybody stands once.
  const all = groups.flatMap((group) => namesOf(group)!);
  expect(new Set(all).size).toBe(all.length);
});
