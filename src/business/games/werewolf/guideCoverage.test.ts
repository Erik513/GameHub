import { expect, it } from "vitest";
import { eventChoices } from "./eventChoices";
import {
  chooseAbility,
  chooseNobody,
  choosePlayer,
  continueGuide,
  createGuide,
  describeGuide,
  setBallot,
  type Guide,
} from "./narratorGuide";
import { createWerewolfSession } from "./session";
import { wakingPlayers } from "./stateMachine";
import { validTargets, votingPlayers } from "./selectors";
import {
  createWerewolf,
  transitionWerewolf,
  type WerewolfEvent,
  type WerewolfSpecialRole,
  type WerewolfState,
} from "./stateMachine";

/**
 * Coverage of the narrator guide: every event that the game accepts in a state has to be reachable through the
 * operations of the guide (open an ability, tap people, set ballots, confirm), and the guide has to hand exactly that
 * event to the game. If the guide cannot reach an event the game allows, the screen does not mirror the logic.
 */

const abilityOfEvent: Partial<Record<WerewolfEvent["type"], string>> = {
  attack: "attack",
  bond: "bond",
  hammer: "hammer",
  inspect: "inspect",
  investigate: "investigate",
  nominate: "vote",
  passAmulet: "passAmulet",
  protect: "protect",
  shot: "shot",
  silence: "silence",
  stayWith: "stayWith",
};

/** The way the narrator produces `event`: returns what the game would look like afterwards, or a reason why not. */
function viaGuide(state: WerewolfState, event: WerewolfEvent): WerewolfState | string {
  let guide: Guide = createGuide(createWerewolfSession(state));
  const open = (id: string): boolean => {
    const next = chooseAbility(guide, id as never);
    const changed = next !== guide;
    guide = next;
    return changed;
  };
  const pick = (name: string | null): string | null => {
    if (name === null) return null;
    const next = choosePlayer(guide, name);
    if (next === guide) return "cannot choose the person";
    guide = next;
    return null;
  };
  if (describeGuide(guide).phase === "intro") guide = continueGuide(guide);
  let failure: string | null = null;
  switch (event.type) {
    case "potions":
      if (event.heal && !open("heal")) failure = "heal not available";
      if (!failure && event.poison) {
        if (!open("poison")) failure = "poison not available";
        else failure = pick(event.poison);
      }
      break;
    case "castSpells":
      if (event.heal && !open("heal")) failure = "heal not available";
      if (!failure && event.kill.length > 0) {
        if (!open("kill")) failure = "kill not available";
        for (const name of event.kill) failure = failure ?? pick(name);
      }
      break;
    case "bond":
      if (!open("bond")) failure = "bond not available";
      for (const name of event.players) failure = failure ?? pick(name);
      break;
    case "nominate":
      if (!open("vote")) failure = "vote not available";
      for (const name of event.nominees) failure = failure ?? pick(name);
      break;
    case "vote":
      for (const [voter, choice] of Object.entries(event.ballots)) {
        const next = setBallot(guide, voter, choice);
        if (next === guide && describeGuide(guide).selection.ballots?.[voter] !== choice)
          failure = failure ?? "no ballot";
        guide = next;
      }
      break;
    default: {
      const id = abilityOfEvent[event.type];
      if (id && "target" in event) {
        // The holder who keeps the amulet names himself: that is the button "keep", not a person in the list.
        const keeps =
          event.type === "passAmulet" &&
          state.status === "amuletPass" &&
          state.amulet?.holder === event.target;
        if (keeps) {
          // nothing to open
        } else if (event.target !== null) {
          if (!open(id)) failure = `${id} not available`;
          else failure = pick(event.target);
        } else if (!describeGuide(guide).canContinue) {
          // "Nobody": through the button "skip" (no ability open) or through the choice "nobody".
          if (open(id)) {
            const next = chooseNobody(guide);
            if (next === guide) failure = "nobody not possible";
            guide = next;
          }
        }
      }
    }
  }
  if (failure) return failure;
  if (!describeGuide(guide).canContinue) return "cannot confirm";
  let next = continueGuide(guide);
  const frame = next.trail[next.trail.length - 1]!;
  // The role falls asleep first: the event waits in the frame and is handed to the game with the next "continue".
  if (frame.phase === "outro" && frame.event) return transitionWerewolf(state, frame.event);
  // A cover call or a step of its own: one more "continue".
  if (frame.phase === "act" && next.session.present === state && describeGuide(next).canContinue)
    next = continueGuide(next);
  return next.session.present;
}

/** The events of the game plus a few richer ones that the narrator can also make (three nominees, mixed ballots). */
function eventsToCheck(state: WerewolfState): WerewolfEvent[] {
  const events = eventChoices(state);
  if (state.status === "day") {
    const names = validTargets(state, "nominate");
    if (names.length >= 2)
      events.push({ night: state.night, nominees: names.slice(0, 2), type: "nominate" });
    if (names.length >= 3)
      events.push({ night: state.night, nominees: names.slice(0, 3), type: "nominate" });
  }
  if (state.status === "vote") {
    const ballots = Object.fromEntries(
      votingPlayers(state)
        .filter((voter) => voter.choices.length > 0)
        .map((voter, index) => [voter.name, voter.choices[index % voter.choices.length]!]),
    );
    const event: WerewolfEvent = {
      ballots,
      night: state.night,
      nomination: state.nomination,
      type: "vote",
    };
    if (transitionWerewolf(state, event) !== state) events.push(event);
  }
  return events;
}

function sample<T>(items: readonly T[], count: number, random: () => number): T[] {
  if (items.length <= count) return [...items];
  const chosen = new Set<number>();
  while (chosen.size < count) chosen.add(Math.floor(random() * items.length));
  return [...chosen].map((index) => items[index]!);
}

it("reaches every event of the game through the operations of the guide, in random games with all roles", () => {
  const roles: WerewolfSpecialRole[] = [
    "cupid",
    "witch",
    "hunter",
    "mayor",
    "spellcaster",
    "idiot",
    "toughGuy",
    "apprenticeSeer",
    "paranormalInvestigator",
    "tanner",
  ];
  const problems = new Map<string, string>();
  const checked = new Set<string>();
  for (let seed = 1; seed <= 60; seed++) {
    let word = seed;
    const random = () => {
      word = (Math.imul(word, 1664525) + 1013904223) >>> 0;
      return word / 2 ** 32;
    };
    const magician = seed % 3 === 0;
    let state: WerewolfState = createWerewolf(
      Array.from({ length: 20 }, (_, i) => "P" + i).join(","),
      "Narrator",
      random,
      magician ? [...roles.filter((r) => r !== "witch"), "magician"] : roles,
      {
        amulet: seed % 2 === 0,
        attackOnFirstNight: seed % 2 === 1,
        drunk: seed % 4 === 0,
        hunterShot: seed % 2 ? "required" : "optional",
        mayor: seed % 2 ? "hammer" : "doubleVote",
        wolfCount: 4,
      },
    )!;
    for (let step = 0; state.status !== "finished" && step < 600; step++) {
      if (state.status !== "roles") {
        for (const event of sample(eventsToCheck(state), 12, random)) {
          // The old hag has to silence somebody: the logic keeps "nobody" only as an emergency exit (decision 22.11.2026).
          if (event.type === "silence" && event.target === null) continue;
          const key = state.status + ":" + event.type;
          checked.add(key);
          const outcome = viaGuide(state, event);
          if (typeof outcome === "string") {
            if (!problems.has(key + ":" + outcome))
              problems.set(key + ":" + outcome, JSON.stringify(event).slice(0, 160));
          } else {
            const expected = transitionWerewolf(state, event);
            try {
              expect(outcome).toEqual(expected);
            } catch {
              if (!problems.has(key + ":different"))
                problems.set(key + ":different", JSON.stringify(event).slice(0, 160));
            }
          }
        }
      }
      const events = eventChoices(state);
      state = transitionWerewolf(state, events[Math.floor(random() * events.length)]!);
    }
  }
  expect(checked.size).toBeGreaterThan(20);
  expect([...problems.entries()]).toEqual([]);
}, 120000);

it("shows an ability as ready exactly when the game accepts an event with it", () => {
  const roles: WerewolfSpecialRole[] = [
    "cupid",
    "bodyguard",
    "witch",
    "hunter",
    "mayor",
    "spellcaster",
    "idiot",
    "toughGuy",
    "apprenticeSeer",
    "paranormalInvestigator",
    "tanner",
  ];
  const problems = new Map<string, string>();
  for (let seed = 1; seed <= 40; seed++) {
    let word = seed;
    const random = () => {
      word = (Math.imul(word, 1664525) + 1013904223) >>> 0;
      return word / 2 ** 32;
    };
    let state: WerewolfState = createWerewolf(
      Array.from({ length: 20 }, (_, i) => "P" + i).join(","),
      "Narrator",
      random,
      seed % 3 === 0 ? [...roles.filter((r) => r !== "witch"), "magician"] : roles,
      {
        amulet: seed % 2 === 0,
        attackOnFirstNight: seed % 2 === 1,
        hunterShot: seed % 2 ? "required" : "optional",
        mayor: seed % 2 ? "hammer" : "doubleVote",
        wolfCount: 4,
      },
    )!;
    for (let step = 0; state.status !== "finished" && step < 600; step++) {
      const view = describeGuide(createGuide(createWerewolfSession(state)));
      const events = eventChoices(state);
      const accepts = (test: (event: WerewolfEvent) => boolean) => events.some(test);
      for (const ability of view.card?.abilities ?? []) {
        // The result of the seer: "look again" takes the result step back first (a decision of the narrator's view).
        if (view.card?.cover || state.status === "vision") continue;
        const expected: boolean | null =
          {
            attack: accepts((e) => e.type === "attack" && e.target !== null),
            bond: accepts((e) => e.type === "bond"),
            hammer: accepts((e) => e.type === "hammer" && e.target !== null),
            heal: accepts(
              (e) => (e.type === "potions" && e.heal) || (e.type === "castSpells" && e.heal),
            ),
            inspect: accepts((e) => e.type === "inspect"),
            investigate: accepts((e) => e.type === "investigate" && e.target !== null),
            kill: accepts((e) => e.type === "castSpells" && e.kill.length > 0),
            passAmulet: accepts((e) => e.type === "passAmulet"),
            poison: accepts((e) => e.type === "potions" && e.poison !== null),
            protect: accepts((e) => e.type === "protect"),
            shot: accepts((e) => e.type === "shot" && e.target !== null),
            silence: accepts((e) => e.type === "silence" && e.target !== null),
            stayWith: accepts((e) => e.type === "stayWith"),
            vote: accepts((e) => e.type === "nominate"),
          }[ability.id] ?? null;
        if (expected !== null && expected !== ability.available)
          problems.set(
            state.status + ":" + ability.id + ":" + (ability.available ? "ready" : "blocked"),
            "the game " + (expected ? "accepts" : "does not accept") + " an event with it",
          );
      }
      state = transitionWerewolf(state, events[Math.floor(random() * events.length)]!);
    }
  }
  expect([...problems.entries()]).toEqual([]);
}, 120000);

it("lets a narrator play whole games with the guide alone: never stuck, who wakes is who the game wakes", () => {
  const stuck = new Map<string, string>();
  let finished = 0;
  for (let seed = 1; seed <= 25; seed++) {
    let word = seed * 7;
    const random = () => {
      word = (Math.imul(word, 1664525) + 1013904223) >>> 0;
      return word / 2 ** 32;
    };
    const state = createWerewolf(
      Array.from({ length: 12 }, (_, i) => "P" + i).join(","),
      "Narrator",
      random,
      seed % 3 === 0
        ? ["magician", "hunter", "idiot", "mayor"]
        : ["witch", "hunter", "bodyguard", "cupid", "spellcaster", "tanner", "toughGuy"],
      {
        amulet: seed % 2 === 0,
        attackOnFirstNight: seed % 2 === 1,
        hunterShot: seed % 2 ? "required" : "optional",
        mayor: seed % 2 ? "hammer" : "doubleVote",
        wolfCount: 2,
      },
    );
    if (!state) continue;
    let guide = createGuide(createWerewolfSession(state));
    for (let step = 0; step < 6000; step++) {
      const view = describeGuide(guide);
      if (view.state.status === "finished") {
        finished++;
        break;
      }
      // The people who wake up in the card are the people the game wakes.
      if (
        view.card &&
        !view.card.cover &&
        view.card.role !== "day" &&
        view.state.status !== "vote"
      ) {
        const waking = wakingPlayers(view.state);
        if (JSON.stringify([...view.card.actors].sort()) !== JSON.stringify([...waking].sort()))
          stuck.set("actors:" + view.state.status, view.card.actors.join() + " / " + waking.join());
      }
      const options: Guide[] = [];
      const add = (next: Guide) => {
        if (next !== guide) options.push(next);
      };
      if (view.canContinue) {
        const next = continueGuide(guide);
        if (random() < 0.55 || view.phase !== "act") {
          guide = next;
          continue;
        }
        add(next);
      }
      if (view.phase === "act") {
        for (const ability of view.card?.abilities ?? [])
          if (ability.available) add(chooseAbility(guide, ability.id));
        for (const name of view.targets) add(choosePlayer(guide, name));
        for (const row of view.ballotRows)
          for (const choice of row.choices)
            if (row.choice === null) add(setBallot(guide, row.name, choice));
        if (view.canChooseNobody) add(chooseNobody(guide));
      }
      if (options.length === 0) {
        stuck.set("stuck:" + view.state.status + ":" + view.phase, "step " + step);
        break;
      }
      guide = options[Math.floor(random() * options.length)]!;
    }
  }
  expect(finished).toBeGreaterThan(5);
  expect([...stuck.entries()]).toEqual([]);
}, 170000);
