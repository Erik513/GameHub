import { expect, it } from "vitest";
import { eventChoices } from "./eventChoices";
import {
  createWerewolf,
  transitionWerewolf,
  werewolfAnnouncement,
  type WerewolfEvent,
  type WerewolfSpecialRole,
  type WerewolfState,
} from "./stateMachine";

/*
 * The order of the dead in the morning, played through the game itself: a whole night with the wolves, the witch, the
 * magician and the lovers, and a night after a wounded tough guy. (The rule itself is tested in deathOrder.test.ts.)
 */

const names = Array.from({ length: 12 }, (_, index) => "P" + index);

/** Deals the roles; the roles stand at the seats the game chose, found by `roleOf`. */
function deal(roles: readonly WerewolfSpecialRole[]): WerewolfState {
  const setup = createWerewolf(names.join(","), "Narrator", () => 0.99, roles, {
    attackOnFirstNight: true,
    wolfCount: 2,
  })!;
  return names.reduce(
    (state, player) => transitionWerewolf(state, { type: "roleSeen", player }),
    setup,
  );
}

const roleOf = (state: WerewolfState, role: string): string =>
  state.players.find((player) => player.role === role)!.name;

/** Plays the night to the morning: `choose` decides what it cares about, everything else is the first accepted event. */
function nightToMorning(
  start: WerewolfState,
  choose: (state: WerewolfState) => WerewolfEvent | undefined,
): WerewolfState {
  let state = start;
  for (let guard = 0; guard < 60 && state.status !== "morning"; guard += 1) {
    const event = choose(state) ?? eventChoices(state)[0]!;
    const next = transitionWerewolf(state, event);
    if (next === state) throw new Error("the game refused " + JSON.stringify(event));
    state = next;
  }
  expect(state.status).toBe("morning");
  return state;
}

const toNextNight = (state: WerewolfState): WerewolfState =>
  transitionWerewolf(transitionWerewolf(state, { night: state.night, type: "announceMorning" }), {
    night: state.night,
    type: "endDay",
  });

/** Two lovers (the first has a lower seat than the second); the second is the one the wolves attack. */
function lovers(
  dealt: WerewolfState,
  taken: readonly string[],
): { partner: string; lover: string; other: string } {
  const free = names.filter(
    (name) =>
      !taken.includes(dealt.players.find((player) => player.name === name)!.role) &&
      !["wolf", "seer"].includes(dealt.players.find((player) => player.name === name)!.role),
  );
  return { lover: free[free.length - 1]!, other: free[1]!, partner: free[0]! };
}

it("names the dead by their time of death: the lover of the wolves, his partner right after (the later spell does not move him), then the next victim", () => {
  // The magician and the witch are never in one game, so the night is played once with each of them.
  const dealt = deal(["cupid", "magician"]);
  const { lover, other, partner } = lovers(dealt, ["cupid", "magician"]);
  const state = nightToMorning(dealt, (current) => {
    const night = current.night;
    switch (current.status) {
      case "cupid":
        return { night, players: [partner, lover], type: "bond" };
      case "wolves":
        // The lover has the higher seat: the seat order would name him last.
        return { night, target: lover, type: "attack" };
      case "magician":
        // Both death spells: the partner of the lover (a second attack on a person who dies of heartbreak anyway) and another.
        return { heal: false, kill: [partner, other], night, type: "castSpells" };
      default:
        return undefined;
    }
  });
  expect(werewolfAnnouncement(state).map((entry) => entry.name)).toEqual([lover, partner, other]);
});

it("names the victim of the witch after the victim of the wolves and keeps the partner right after his lover", () => {
  const dealt = deal(["cupid", "witch"]);
  const { lover, partner } = lovers(dealt, ["cupid", "witch"]);
  const state = nightToMorning(dealt, (current) => {
    const night = current.night;
    switch (current.status) {
      case "cupid":
        return { night, players: [partner, lover], type: "bond" };
      case "wolves":
        return { night, target: lover, type: "attack" };
      case "witch":
        return { heal: false, night, poison: partner, type: "potions" };
      default:
        return undefined;
    }
  });
  expect(werewolfAnnouncement(state).map((entry) => entry.name)).toEqual([lover, partner]);
});

it("names the delayed death of the tough guy first, before the victim of the wolves", () => {
  const dealt = deal(["toughGuy"]);
  const toughGuy = roleOf(dealt, "toughGuy");
  const villagers = names.filter(
    (name) => dealt.players.find((p) => p.name === name)!.role === "villager",
  );
  const victim = villagers[0]!;
  // Night 1: the wolves wound him (he is not saved); in the morning nobody died.
  const firstMorning = nightToMorning(dealt, (current) =>
    current.status === "wolves"
      ? { night: current.night, target: toughGuy, type: "attack" }
      : undefined,
  );
  expect(werewolfAnnouncement(firstMorning)).toEqual([]);
  // Night 2: the wolves attack somebody else; the tough guy dies of his wound, and he is named first although his seat
  // may be behind the victim's.
  const secondMorning = nightToMorning(toNextNight(firstMorning), (current) =>
    current.status === "wolves"
      ? { night: current.night, target: victim, type: "attack" }
      : undefined,
  );
  expect(werewolfAnnouncement(secondMorning).map((entry) => entry.name)).toEqual([
    toughGuy,
    victim,
  ]);
});
