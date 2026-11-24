import { expect, it } from "vitest";
import { emptyFixedDraft } from "./fixedConfiguration";
import {
  answerQuestion,
  chooseAbility,
  setVoteBonus,
  setVoteCount,
  chooseNobody,
  choosePlayer,
  continueGuide,
  createGuide,
  describeGuide,
  type Guide,
} from "./narratorGuide";
import { startWerewolfGame } from "./narratorGame";
import { createWerewolfSession } from "./session";
import { transitionWerewolf, wakingPlayers, type WerewolfState } from "./stateMachine";
import {
  describeVariableConfiguration,
  emptyVariableDraft,
  normalizeVariableDraft,
  setVariableEntryState,
  setVariableItemState,
  setVariableRoleRange,
  setVariableRule,
  toggleVariableWolfCount,
  variableEntries,
  variableSelectionOf,
  type VariableDraft,
  type VariableState,
} from "./variableConfiguration";

/**
 * The variable mode, tested like a narrator and the configuration screen would use it: random drafts that the screen
 * allows are drawn into games, the game has to follow the draft (must roles in, "not" roles out, counts inside the
 * ranges, extras as chosen), and every game that starts can be played to the end with the guide alone.
 */

function seeded(seed: number) {
  let word = seed;
  return () => {
    word = (Math.imul(word, 1664525) + 1013904223) >>> 0;
    return word / 2 ** 32;
  };
}

/** A draft the way the screen builds it: only what the screen allows is set, then normalized. */
function randomDraft(players: number, random: () => number): VariableDraft {
  let draft = emptyVariableDraft;
  for (let round = 0; round < 2; round++) {
    const entries = describeVariableConfiguration(players, draft).entries;
    for (const shown of [...entries].sort(() => random() - 0.5)) {
      const roll = random();
      const wanted: VariableState = roll < 0.45 ? "not" : roll < 0.8 ? "may" : "must";
      if (wanted === "not") {
        draft = setVariableEntryState(draft, shown.entry.id, "not");
        continue;
      }
      const now = describeVariableConfiguration(players, draft).entries.find(
        (entry) => entry.entry.id === shown.entry.id,
      );
      if (now?.lock !== null) continue;
      draft = setVariableEntryState(
        draft,
        shown.entry.id,
        wanted === "must" && now.mustBlocked ? "may" : wanted,
      );
    }
  }
  for (const shown of describeVariableConfiguration(players, draft).items) {
    const roll = random();
    const wanted: VariableState = roll < 0.5 ? "not" : roll < 0.8 ? "may" : "must";
    if (wanted !== "not" && shown.lock === null)
      draft = setVariableItemState(
        draft,
        shown.item,
        wanted === "must" && shown.mustBlocked ? "may" : wanted,
      );
  }
  for (const option of describeVariableConfiguration(players, draft).wolf.options)
    if (random() < 0.3) draft = toggleVariableWolfCount(draft, players, option.count);
  draft = setVariableRule(draft, "attackOnFirstNight", random() < 0.5);
  const may = describeVariableConfiguration(players, draft).mayRoleCount;
  const minimum = Math.floor(random() * (may + 1));
  draft = setVariableRoleRange(
    draft,
    minimum,
    random() < 0.5 ? null : minimum + Math.floor(random() * (may + 1)),
  );
  return normalizeVariableDraft(players, draft);
}

function specialRoles(state: WerewolfState): string[] {
  return state.players
    .map((player) => player.role as string)
    .filter((role) => role !== "wolf" && role !== "seer" && role !== "villager");
}

it("draws games that follow the draft: must roles in, other roles out, counts and extras as chosen", () => {
  let started = 0;
  const problems: string[] = [];
  for (let seed = 1; seed <= 300; seed++) {
    const random = seeded(seed);
    const players = 6 + Math.floor(random() * 15);
    const draft = randomDraft(players, random);
    const view = describeVariableConfiguration(players, draft);
    if (!view.canStart) continue;
    const raw = variableSelectionOf(players, draft);
    const selection = {
      ...raw,
      requiredItems: raw.requiredItems ?? [],
      requiredRoles: raw.requiredRoles ?? [],
    };
    const seats = Array.from({ length: players }, (_, index) => "P" + index);
    for (let draw = 0; draw < 3; draw++) {
      const session = startWerewolfGame({
        fixedDraft: emptyFixedDraft,
        lineup: { narrator: "Max", participants: ["Max", ...seats], seats },
        mode: "variable",
        random: seeded(seed * 31 + draw),
        variableDraft: draft,
      });
      if (!session) {
        problems.push(
          "seed " +
            seed +
            " (" +
            players +
            " players): the screen allows the start, the logic does not",
        );
        continue;
      }
      started++;
      const game = session.present;
      const roles = specialRoles(game);
      const families = new Set(roles.map((role) => (role === "nightGuest" ? "bodyguard" : role)));
      for (const role of selection.requiredRoles)
        if (!roles.includes(role))
          problems.push("seed " + seed + ": must role " + role + " missing");
      const allowed = new Set<string>([...selection.requiredRoles, ...selection.rolePool]);
      for (const role of roles)
        if (!allowed.has(role))
          problems.push("seed " + seed + ": role " + role + " is not in the draft");
      const drawn = [...families].filter(
        (role) =>
          !(selection.requiredRoles as readonly string[]).some(
            (must) => must === role || (role === "bodyguard" && must === "nightGuest"),
          ),
      ).length;
      if (drawn < selection.roleRange.minimum || drawn > selection.roleRange.maximum)
        problems.push(
          "seed " +
            seed +
            ": " +
            drawn +
            " drawn roles outside " +
            JSON.stringify(selection.roleRange),
        );
      const wolves = game.players.filter((player) => player.role === "wolf").length;
      if (!selection.wolfCounts.includes(wolves))
        problems.push(
          "seed " + seed + ": " + wolves + " wolves, chosen " + selection.wolfCounts.join(),
        );
      if (selection.requiredItems.includes("drunk") && !game.drunk)
        problems.push("seed " + seed + ": drunk must");
      if (selection.requiredItems.includes("amulet") && !game.amulet)
        problems.push("seed " + seed + ": amulet must");
      if (
        !selection.requiredItems.includes("drunk") &&
        !selection.itemPool.includes("drunk") &&
        game.drunk
      )
        problems.push("seed " + seed + ": drunk without choice");
      if (
        !selection.requiredItems.includes("amulet") &&
        !selection.itemPool.includes("amulet") &&
        game.amulet
      )
        problems.push("seed " + seed + ": amulet without choice");
      if (game.settings.attackOnFirstNight !== draft.rules.attackOnFirstNight)
        problems.push("seed " + seed + ": rule attackOnFirstNight not taken over");
      // The chosen options of a role (hunter, mayor, ...) are among the entries the draft allowed.
      const optionsOk = variableEntries
        .filter((entry) => entry.option && roles.includes(entry.role))
        .some(
          (entry) =>
            (game.settings as unknown as Record<string, unknown>)[entry.option!.key] ===
            entry.option!.value,
        );
      if (
        roles.some((role) =>
          ["hunter", "mayor", "toughGuy", "tanner", "spellcaster"].includes(role),
        ) &&
        !optionsOk
      )
        problems.push("seed " + seed + ": option of a role not taken over");
    }
  }
  expect(started).toBeGreaterThan(100);
  expect(problems).toEqual([]);
}, 120000);

it("plays games of the variable mode to the end with the guide alone, without a dead end", () => {
  const stuck: string[] = [];
  let finished = 0;
  for (let seed = 1; seed <= 40; seed++) {
    const random = seeded(seed * 13);
    const players = 6 + Math.floor(random() * 11);
    const draft = randomDraft(players, random);
    if (!describeVariableConfiguration(players, draft).canStart) continue;
    const seats = Array.from({ length: players }, (_, index) => "P" + index);
    const session = startWerewolfGame({
      fixedDraft: emptyFixedDraft,
      lineup: { narrator: "Max", participants: ["Max", ...seats], seats },
      mode: "variable",
      random: seeded(seed),
      variableDraft: draft,
    });
    if (!session) continue;
    let guide: Guide = createGuide(createWerewolfSession(session.present));
    for (let step = 0; step < 6000; step++) {
      const view = describeGuide(guide);
      if (view.state.status === "finished") {
        finished++;
        break;
      }
      if (
        view.card &&
        !view.card.cover &&
        view.card.role !== "day" &&
        view.state.status !== "vote"
      ) {
        const waking = wakingPlayers(view.state);
        if (JSON.stringify([...view.card.actors].sort()) !== JSON.stringify([...waking].sort()))
          stuck.push("seed " + seed + ": actors differ at " + view.state.status);
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
        if (view.question !== null) add(answerQuestion(guide, "skip"));
        for (const ability of view.card?.abilities ?? [])
          if (ability.available) add(chooseAbility(guide, ability.id));
        for (const name of view.targets) add(choosePlayer(guide, name));
        if (view.state.status === "vote") {
          // The counted votes: one more or one less for a nominee, and the second vote of the mayor.
          for (const name of view.state.candidates) {
            add(setVoteCount(guide, name, (view.voteCounts[name] ?? 0) + 1));
            add(setVoteCount(guide, name, (view.voteCounts[name] ?? 0) - 1));
          }
          for (const name of view.voteBonus?.choices ?? []) add(setVoteBonus(guide, name));
        }
        if (view.canChooseNobody) add(chooseNobody(guide));
      }
      if (options.length === 0) {
        stuck.push("seed " + seed + ": stuck at " + view.state.status + " / " + view.phase);
        break;
      }
      guide = options[Math.floor(random() * options.length)]!;
      // The game itself never rejects what the guide hands over.
      expect(transitionWerewolf(guide.session.present, { type: "endDay", night: -1 })).toBe(
        guide.session.present,
      );
    }
  }
  expect(finished).toBeGreaterThan(10);
  expect(stuck).toEqual([]);
}, 170000);
