/// <reference types="node" />
import assert from "node:assert/strict";
import { it } from "vitest";
import { availableWerewolfRoles } from "./configuration";
import {
  createWerewolf,
  transitionWerewolf,
  wakingPlayers,
  werewolfAnnouncement,
  type WerewolfEvent,
  type WerewolfSettings,
  type WerewolfSpecialRole,
  type WerewolfState,
} from "./stateMachine";

const lineup = ["witch", "cupid", "hunter", "bodyguard", "idiot", "tanner"] as const;
const playerNames = (count: number) =>
  Array.from({ length: count }, (_, index) => `Player ${index + 1}`).join(",");
const gamesPerLineup = 10_000;
type Model =
  | "random"
  | "clues"
  | "cautious"
  | "quietFirstDay"
  | "carefulWitch"
  | "credibleSeer"
  | "sharedKnowledge"
  | "sharedKnowledgeAndIdiot"
  | "combinedInvestigation"
  | "earlyAttack"
  | "earlyAttackQuietSecondDay";
type Winner = Extract<WerewolfState, { status: "finished" }>["winner"];
interface Clues {
  seer: string | undefined;
  checked: Set<string>;
  wolves: Set<string>;
  investigation: { neighbors: string[]; positive: boolean } | null;
  livingWolves: number;
  possibleDefenders: number;
  skippedRiskyVotes: number;
  waitsOnQuietFirstDay: boolean;
  morningDeaths: number | undefined;
  skippedFirstDayVote: boolean;
  publicSuspicion: Map<string, number>;
  reportedWolves: Set<string>;
  reportedNonwolves: Set<string>;
  savedByWitch: Set<string>;
  confirmedNominations: number;
  idiotCandidates: Set<string>;
  inferredIdiot: string | undefined;
  waitsOnQuietSecondDay: boolean;
  reachedQuietSecondDay: boolean;
  nominatedOnQuietSecondDay: boolean;
  exiledOnQuietSecondDay: boolean;
}

const usesEarlyAttack = (model: Model) =>
  model === "earlyAttack" || model === "earlyAttackQuietSecondDay";
const usesIdiotInference = (model: Model) =>
  model === "sharedKnowledgeAndIdiot" ||
  model === "combinedInvestigation" ||
  usesEarlyAttack(model);
const sharesWitchKnowledge = (model: Model) =>
  model === "sharedKnowledge" || usesIdiotInference(model);
const usesCredibleSeer = (model: Model) => model === "credibleSeer" || sharesWitchKnowledge(model);
const usesCarefulWitch = (model: Model) => model === "carefulWitch" || usesCredibleSeer(model);

function shouldWait(
  players: number,
  clues: Pick<Clues, "livingWolves" | "possibleDefenders">,
): boolean {
  const parity = 2 * clues.livingWolves;
  // Waiting for a night kill does not improve an already outnumbered village.
  return (
    players > parity &&
    players - 2 <= parity &&
    (players - 1 > parity || clues.possibleDefenders > 0)
  );
}

function randomFrom(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let value = Math.imul(seed ^ (seed >>> 15), seed | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 2 ** 32;
  };
}

function phaseRandom(seed: number, state: WerewolfState) {
  // Extra phases must not change the random decisions shared by both lineups.
  let key = Math.imul(seed, 0x9e3779b1) ^ state.night;
  const phase =
    state.status === "magician" && !state.players.some((player) => player.role === "witch")
      ? "witch"
      : state.status;
  for (const character of phase) key = Math.imul(key ^ character.charCodeAt(0), 16777619);
  return randomFrom(key);
}

function pick<T>(items: readonly T[], random: () => number): T {
  const item = items[Math.floor(random() * items.length)];
  assert(item !== undefined);
  return item;
}

function nominationPool(state: WerewolfState, clues: Clues, model: Model, random: () => number) {
  if (model === "random") return state.alive;
  const useSeer = random() < 0.45 && state.alive.some((player) => player.name === clues.seer);
  if (useSeer && usesCarefulWitch(model)) {
    for (const suspect of clues.wolves) clues.publicSuspicion.set(suspect, 2);
  }
  const useInvestigator =
    random() < 0.45 && state.alive.some((player) => player.role === "paranormalInvestigator");
  const clue = useInvestigator ? clues.investigation : null;
  return state.alive.flatMap((player) => {
    const seerWeight = useSeer && clues.wolves.has(player.name) ? 3 : 0;
    const witnessWeight = clue?.neighbors.includes(player.name) ? (clue.positive ? 1 : -1) : 0;
    return Array.from({ length: 2 + seerWeight + witnessWeight }, () => player);
  });
}

function voteChance(
  state: Extract<WerewolfState, { status: "vote" }>,
  voter: string,
  model: Model,
  clues: Clues,
) {
  if (model === "random") return 0.65;
  const player = state.alive.find((candidate) => candidate.name === voter);
  assert(player);
  const isMasked = (name: string) => state.drunk?.player === name && !state.drunk.revealed;
  const role = isMasked(voter) ? "villager" : player.role;
  if (voter === state.target) return role === "tanner" ? 0.95 : 0.05;
  if (state.lovers?.includes(voter) && state.lovers.includes(state.target)) return 0.1;
  if (role === "wolf") {
    return state.alive.some(
      (target) => target.name === state.target && target.role === "wolf" && !isMasked(target.name),
    )
      ? 0.25
      : 0.8;
  }
  if (usesCredibleSeer(model) && clues.reportedWolves.has(state.target))
    return voter === clues.seer ? 0.95 : 0.85;
  if (
    usesCredibleSeer(model) &&
    (clues.reportedNonwolves.has(state.target) ||
      (sharesWitchKnowledge(model) && role === "witch" && clues.savedByWitch.has(state.target)))
  )
    return 0.2;
  if (voter === clues.seer && clues.checked.has(state.target)) {
    return clues.wolves.has(state.target) ? 0.95 : 0.2;
  }
  if (role === "paranormalInvestigator" && clues.investigation?.neighbors.includes(state.target)) {
    return clues.investigation.positive ? 0.75 : 0.2;
  }
  return 0.65;
}

function decision(
  state: WerewolfState,
  clues: Clues,
  model: Model,
  random: () => number,
): WerewolfEvent {
  const { night, alive } = state;
  switch (state.status) {
    case "nightCall":
      return { type: "acknowledgeCall", night };
    case "roles":
      return { type: "roleSeen", player: state.players[state.index]!.name };
    case "amuletIntro":
      return { type: "amuletReady", night };
    case "amuletPass": {
      const { holder, mustPass } = state.amulet;
      const target =
        mustPass || random() < 0.5
          ? pick(
              alive.filter((player) => player.name !== holder),
              random,
            ).name
          : holder;
      return { type: "passAmulet", night, target };
    }
    case "cupid": {
      const first = pick(alive, random);
      const second = pick(
        alive.filter((player) => player !== first),
        random,
      );
      return { type: "bond", night, players: [first.name, second.name] };
    }
    case "lovers":
      return { type: "loversReady", night };
    case "drunkReveal":
    case "drunkHunter":
      return { type: "drunkReady", night };
    case "mayor": {
      const actor = wakingPlayers(state)[0];
      const targets = alive.filter((player) => player.name !== actor);
      const confirmed =
        model === "combinedInvestigation"
          ? targets.filter(({ name }) => clues.reportedWolves.has(name))
          : [];
      const target =
        actor && random() < 0.4 ? pick(confirmed.length ? confirmed : targets, random).name : null;
      return { type: "hammer", night, target };
    }
    case "bodyguard":
      return {
        type: "protect",
        night,
        target: pick(
          alive.filter((p) => p.role !== "bodyguard" && p.name !== state.protectedPlayer),
          random,
        ).name,
      };
    case "nightGuest":
      return {
        type: "stayWith",
        night,
        target: pick(
          alive.filter((p) => p.role !== "nightGuest" && p.name !== state.hostPlayer),
          random,
        ).name,
      };
    case "wolves": {
      if (night === 1 && !state.settings.attackOnFirstNight) return { type: "wolvesReady", night };
      const targets = alive.filter((player) => player.role !== "wolf");
      return { type: "attack", night, target: pick(targets, random).name };
    }
    case "seer": {
      const actor = wakingPlayers(state)[0];
      if (clues.seer !== actor) {
        clues.seer = actor;
        clues.checked.clear();
        clues.wolves.clear();
      }
      const targets = alive.filter((player) => player.name !== actor);
      const unchecked = targets.filter((player) => !clues.checked.has(player.name));
      return {
        type: "inspect",
        night,
        target: pick(unchecked.length ? unchecked : targets, random).name,
      };
    }
    case "vision":
      clues.checked.add(state.target);
      if (state.isWolf) clues.wolves.add(state.target);
      return { type: "closeVision", night };
    case "investigator":
      return { type: "investigate", night, target: night === 1 ? null : pick(alive, random).name };
    case "investigation": {
      const seat = alive.findIndex((player) => player.name === state.target);
      clues.investigation = {
        neighbors: [-1, 0, 1].map(
          (offset) => alive[(seat + offset + alive.length) % alive.length]!.name,
        ),
        positive: state.isWolfNearby,
      };
      return { type: "closeInvestigation", night };
    }
    case "witch":
    case "magician": {
      const magician = state.status === "magician";
      const careful = usesCarefulWitch(model);
      const healChance = careful ? (state.victim?.role === state.status ? 1 : 0.9) : 0.7;
      const canHeal = magician ? state.spellsRemaining > 0 : state.potions.heal;
      const heal = canHeal && !!state.victim && random() < healChance;
      if (heal && state.victim && sharesWitchKnowledge(model)) {
        clues.savedByWitch.add(state.victim.name);
      }
      const targets = alive.filter(
        (player) =>
          player.role !== state.status &&
          player !== state.victim &&
          (!careful || (clues.publicSuspicion.get(player.name) ?? 0) >= 2),
      );
      const canHarm = magician ? state.spellsRemaining > Number(heal) : state.potions.poison;
      const poison =
        night > 1 && canHarm && targets.length && random() < (careful ? 0.2 : 0.4)
          ? pick(targets, random).name
          : null;
      return magician
        ? { type: "castSpells", night, heal, kill: poison ? [poison] : [] }
        : { type: "potions", night, heal, poison };
    }
    case "spellcaster": {
      const targets = alive.filter(
        (player) =>
          (state.settings.allowSelfSilence || player.role !== "spellcaster") &&
          player.name !== state.silencedPlayer,
      );
      return { type: "silence", night, target: targets.length ? pick(targets, random).name : null };
    }
    case "morning":
      return { type: "announceMorning", night };
    case "day": {
      const speakers = alive.filter((player) => player.name !== state.silencedPlayer);
      const quietSecondDay = night === 2 && clues.morningDeaths === 0;
      if (quietSecondDay) clues.reachedQuietSecondDay = true;
      if (state.nomination > 0 || alive.length < 3 || speakers.length < 2) {
        return { type: "endDay", night };
      }
      if (usesCredibleSeer(model)) {
        if (alive.some((player) => player.name === clues.seer) && random() < 0.85) {
          for (const suspect of clues.wolves) {
            clues.reportedWolves.add(suspect);
            clues.publicSuspicion.set(suspect, 2);
          }
          for (const checked of clues.checked) {
            if (!clues.wolves.has(checked)) clues.reportedNonwolves.add(checked);
          }
        }
        const witchReports = random() < 0.5;
        if (
          witchReports &&
          sharesWitchKnowledge(model) &&
          alive.some((player) => player.role === "witch" || player.role === "magician")
        ) {
          for (const saved of clues.savedByWitch) clues.reportedNonwolves.add(saved);
        }
      }
      if (usesIdiotInference(model)) {
        const candidates = alive.filter((player) => clues.idiotCandidates.has(player.name));
        if (candidates.length === 1 && candidates[0]) {
          assert.equal(candidates[0].role, "idiot");
          clues.inferredIdiot = candidates[0].name;
          clues.reportedNonwolves.add(candidates[0].name);
        }
      }
      const investigation = clues.investigation;
      if (
        model === "combinedInvestigation" &&
        investigation &&
        alive.some((player) => player.role === "paranormalInvestigator") &&
        random() < 0.45
      ) {
        if (!investigation.positive) {
          for (const name of investigation.neighbors) clues.reportedNonwolves.add(name);
        } else if (
          investigation.neighbors.every((name) => alive.some((player) => player.name === name))
        ) {
          const possibleWolves = investigation.neighbors.filter(
            (name) => !clues.reportedNonwolves.has(name),
          );
          if (possibleWolves.length === 1 && possibleWolves[0]) {
            clues.reportedWolves.add(possibleWolves[0]);
            clues.publicSuspicion.set(possibleWolves[0], 2);
          }
        }
      }
      const canNominate = (player: (typeof alive)[number]) =>
        speakers.length >= 3 || player.name === state.silencedPlayer;
      const confirmed = alive.filter(
        (player) => canNominate(player) && clues.reportedWolves.has(player.name),
      );
      if (
        !confirmed.length &&
        night === 1 &&
        clues.waitsOnQuietFirstDay &&
        clues.morningDeaths === 0
      ) {
        clues.skippedFirstDayVote = true;
        return { type: "endDay", night };
      }
      if (!confirmed.length && quietSecondDay && clues.waitsOnQuietSecondDay) {
        return { type: "endDay", night };
      }
      let pool = confirmed.length
        ? confirmed
        : nominationPool(state, clues, model, random).filter(canNominate);
      const uncleared = pool.filter((player) => !clues.reportedNonwolves.has(player.name));
      if (uncleared.length) pool = uncleared;
      if (confirmed.length) {
        clues.confirmedNominations++;
      } else if (model !== "random" && model !== "clues" && shouldWait(alive.length, clues)) {
        const seerReports =
          !usesCredibleSeer(model) &&
          random() < 0.45 &&
          alive.some((player) => player.name === clues.seer);
        pool = seerReports ? pool.filter((player) => clues.wolves.has(player.name)) : [];
        if (pool.length === 0) {
          clues.skippedRiskyVotes++;
          return { type: "endDay", night };
        }
        if (usesCarefulWitch(model)) {
          for (const suspect of pool) clues.publicSuspicion.set(suspect.name, 2);
        }
      }
      const target = pick(pool, random);
      if (quietSecondDay) clues.nominatedOnQuietSecondDay = true;
      if (usesCarefulWitch(model)) {
        clues.publicSuspicion.set(target.name, (clues.publicSuspicion.get(target.name) ?? 0) + 1);
      }
      const potential = speakers.filter((player) => player !== target);
      const nominator = pick(potential, random);
      const seconder = pick(
        potential.filter((player) => player !== nominator),
        random,
      );
      return {
        type: "nominate",
        night,
        target: target.name,
        nominator: nominator.name,
        seconder: seconder.name,
      };
    }
    case "vote":
      return {
        type: "vote",
        night,
        nomination: state.nomination,
        yesVoters: alive
          .filter(({ name }) => name !== state.silencedPlayer)
          .filter(({ name }) => random() < voteChance(state, name, model, clues))
          .map(({ name }) => name),
      };
    case "exile":
      return { type: "announceExile", night };
    case "hunter":
      return { type: "shot", night, target: alive.length ? pick(alive, random).name : null };
    default:
      throw new Error(`Unexpected phase for this lineup: ${state.status}`);
  }
}

function play(
  initial: WerewolfState,
  model: Model,
  seed: number,
): {
  winner: Winner;
  lastNight: number;
  tannerWon: boolean;
  skippedRiskyVotes: number;
  skippedFirstDayVote: boolean;
  healUsed: boolean;
  poisonUsed: boolean;
  confirmedNominations: number;
  inferredIdiot: boolean;
  reachedQuietSecondDay: boolean;
  nominatedOnQuietSecondDay: boolean;
  exiledOnQuietSecondDay: boolean;
} {
  let state = initial;
  const clues: Clues = {
    seer: undefined,
    checked: new Set(),
    wolves: new Set(),
    investigation: null,
    livingWolves: initial.settings.wolfCount,
    possibleDefenders: initial.players.filter(
      (player) =>
        player.role === "witch" ||
        player.role === "magician" ||
        player.role === "bodyguard" ||
        player.role === "nightGuest",
    ).length,
    skippedRiskyVotes: 0,
    waitsOnQuietFirstDay:
      (model === "quietFirstDay" || usesCarefulWitch(model)) &&
      randomFrom(seed ^ 0x2a57e9c1)() < 0.8,
    morningDeaths: undefined,
    skippedFirstDayVote: false,
    publicSuspicion: new Map(),
    reportedWolves: new Set(),
    reportedNonwolves: new Set(),
    savedByWitch: new Set(),
    confirmedNominations: 0,
    idiotCandidates: new Set(
      usesIdiotInference(model) &&
        !initial.settings.drunk &&
        initial.players.some((player) => player.role === "idiot")
        ? initial.players.map((player) => player.name)
        : [],
    ),
    inferredIdiot: undefined,
    waitsOnQuietSecondDay:
      model === "earlyAttackQuietSecondDay" && randomFrom(seed ^ 0x5273c9a3)() < 0.8,
    reachedQuietSecondDay: false,
    nominatedOnQuietSecondDay: false,
    exiledOnQuietSecondDay: false,
  };
  for (let step = 0; step < 500; step++) {
    if (state.status === "finished") {
      return {
        winner: state.winner,
        lastNight: state.night,
        tannerWon: state.tannerWinner !== null,
        skippedRiskyVotes: clues.skippedRiskyVotes,
        skippedFirstDayVote: clues.skippedFirstDayVote,
        healUsed: !state.potions.heal,
        poisonUsed: !state.potions.poison,
        confirmedNominations: clues.confirmedNominations,
        inferredIdiot: clues.inferredIdiot !== undefined,
        reachedQuietSecondDay: clues.reachedQuietSecondDay,
        nominatedOnQuietSecondDay: clues.nominatedOnQuietSecondDay,
        exiledOnQuietSecondDay: clues.exiledOnQuietSecondDay,
      };
    }
    const event = decision(state, clues, model, phaseRandom(seed, state));
    const next = transitionWerewolf(state, event);
    if (next === state)
      throw new Error(JSON.stringify({ seed, event, phase: state.status, model }));
    if (
      event.type === "announceExile" &&
      state.night === 2 &&
      clues.reachedQuietSecondDay &&
      next.alive.length < state.alive.length
    )
      clues.exiledOnQuietSecondDay = true;
    if (usesIdiotInference(model) && event.type === "vote" && "yesVoters" in event) {
      // The table sees the person's actual vote, including the compulsory yes.
      const yes = new Set(event.yesVoters);
      for (const player of state.alive) {
        if (
          player.name !== state.silencedPlayer &&
          player.role !== "idiot" &&
          !yes.has(player.name)
        ) {
          clues.idiotCandidates.delete(player.name);
        }
      }
    }
    if (model !== "random" && model !== "clues") {
      const announcements =
        event.type === "shot"
          ? werewolfAnnouncement(next)
          : event.type === "announceMorning" || event.type === "announceExile"
            ? werewolfAnnouncement(state)
            : [];
      if (event.type === "announceMorning") clues.morningDeaths = announcements.length;
      // The village learns roles only from a person who left in the day and chose to reveal it: the vote or the
      // hunter shot. The names of the night are announced without a role.
      for (const { name } of event.type === "announceMorning" ? [] : announcements) {
        const role = state.players.find((player) => player.name === name)?.role;
        if (role === "wolf") clues.livingWolves--;
        if (role === "idiot") clues.idiotCandidates.clear();
        if (
          role === "witch" ||
          role === "magician" ||
          role === "bodyguard" ||
          role === "nightGuest"
        ) {
          clues.possibleDefenders--;
        }
      }
    }
    state = next;
  }
  throw new Error(
    JSON.stringify({
      seed,
      model,
      roles: initial.players,
      settings: initial.settings,
      night: state.night,
      survivors: state.alive,
      lovers: state.lovers,
      clues: { livingWolves: clues.livingWolves, possibleDefenders: clues.possibleDefenders },
    }),
  );
}

it("compares the village filler and the investigator in paired ten-player games", () => {
  const names = playerNames(10);
  const investigatorLineup: readonly WerewolfSpecialRole[] = [...lineup, "paranormalInvestigator"];
  for (const model of ["random", "clues"] as const) {
    const without = { village: 0, wolves: 0 };
    const withInvestigator = { village: 0, wolves: 0 };
    let wolvesOnlyWithout = 0;
    let wolvesOnlyWith = 0;
    for (let seed = 1; seed <= gamesPerLineup; seed++) {
      const base = createWerewolf(names, "Narrator", randomFrom(seed), lineup);
      const varied = createWerewolf(names, "Narrator", randomFrom(seed), investigatorLineup);
      assert(base && varied);
      assert(
        base.players.every((player, index) => {
          const other = varied.players[index];
          return (
            player.name === other?.name &&
            (player.role === other.role ||
              (player.role === "villager" && other.role === "paranormalInvestigator"))
          );
        }),
      );
      const left = play(base, model, seed).winner;
      const right = play(varied, model, seed).winner;
      without[left]++;
      withInvestigator[right]++;
      if (left === "wolves" && right !== "wolves") wolvesOnlyWithout++;
      if (right === "wolves" && left !== "wolves") wolvesOnlyWith++;
    }
    if (model === "random") assert.deepEqual(without, withInvestigator);
    process.stdout.write(
      `${JSON.stringify({ model, gamesPerLineup, without, withInvestigator, wolvesOnlyWithout, wolvesOnlyWith })}\n`,
    );
  }
}, 30_000);

interface Variant {
  id: string;
  roles: readonly WerewolfSpecialRole[];
  settings?: Partial<WerewolfSettings>;
}

function compareVariants(
  playerCount: number,
  comparison: string,
  variants: readonly [Variant, ...Variant[]],
  models: readonly Model[] = ["random", "clues"],
  sampleSize = gamesPerLineup,
  checkEvidencePerLineup = true,
) {
  const names = playerNames(playerCount);
  const [baseline] = variants;
  for (const model of models) {
    const deal = (variant: Variant, seed: number) =>
      createWerewolf(names, "Narrator", randomFrom(seed), variant.roles, {
        ...(playerCount === 8 ? { wolfCount: 1 } : {}),
        ...variant.settings,
        attackOnFirstNight: usesEarlyAttack(model),
      });
    const stats = variants.map(({ id, roles, settings }) => ({
      id,
      roles,
      settings,
      wolves: 0,
      village: 0,
      tannerWins: 0,
      totalNights: 0,
      skippedRiskyVotes: 0,
      skippedFirstDayVotes: 0,
      healUses: 0,
      poisonUses: 0,
      confirmedNominations: 0,
      inferredIdiots: 0,
      quietSecondDays: 0,
      nominationsOnQuietSecondDays: 0,
      exilesOnQuietSecondDays: 0,
    }));
    for (let seed = 1; seed <= sampleSize; seed++) {
      const basic = deal(baseline, seed);
      assert(basic);
      for (const [index, variant] of variants.entries()) {
        const setup: WerewolfState | null = index === 0 ? basic : deal(variant, seed);
        assert(setup);
        assert(
          basic.players.every(
            (player, seat) =>
              player.role === "villager" || player.role === setup.players[seat]?.role,
          ),
        );
        const result = play(setup, model, seed);
        const stat = stats[index];
        assert(stat);
        stat[result.winner]++;
        stat.tannerWins += Number(result.tannerWon);
        stat.totalNights += result.lastNight;
        stat.skippedRiskyVotes += result.skippedRiskyVotes;
        stat.skippedFirstDayVotes += Number(result.skippedFirstDayVote);
        stat.healUses += Number(result.healUsed);
        stat.poisonUses += Number(result.poisonUsed);
        stat.confirmedNominations += result.confirmedNominations;
        stat.inferredIdiots += Number(result.inferredIdiot);
        stat.quietSecondDays += Number(result.reachedQuietSecondDay);
        stat.nominationsOnQuietSecondDays += Number(result.nominatedOnQuietSecondDay);
        stat.exilesOnQuietSecondDays += Number(result.exiledOnQuietSecondDay);
      }
    }
    for (const [index, stat] of stats.entries()) {
      const variant = variants[index];
      assert(variant);
      const canPreventAttack =
        variant.roles.includes("witch") ||
        variant.roles.includes("magician") ||
        variant.settings?.amulet === true ||
        variant.roles.includes("bodyguard") ||
        variant.roles.includes("nightGuest");
      assert.equal(stat.wolves + stat.village, sampleSize);
      if (checkEvidencePerLineup && (model === "quietFirstDay" || usesCarefulWitch(model))) {
        assert(stat.skippedFirstDayVotes < sampleSize);
        if (!usesEarlyAttack(model) || canPreventAttack) assert(stat.skippedFirstDayVotes > 0);
      }
      if (checkEvidencePerLineup && usesCredibleSeer(model)) assert(stat.confirmedNominations > 0);
      if (usesEarlyAttack(model)) {
        if (checkEvidencePerLineup && canPreventAttack) assert(stat.quietSecondDays > 0);
        assert(stat.nominationsOnQuietSecondDays <= stat.quietSecondDays);
        assert(stat.exilesOnQuietSecondDays <= stat.nominationsOnQuietSecondDays);
      }
    }
    process.stdout.write(
      `${JSON.stringify({ players: playerCount, comparison, model, gamesPerLineup: sampleSize, stats })}\n`,
    );
  }
}

const singleRoleVariants = [
  { id: "basic", roles: [] },
  { id: "idiot", roles: ["idiot"] },
  { id: "bodyguardBlock", roles: ["bodyguard"] },
  { id: "nightGuest", roles: ["nightGuest"] },
  { id: "witch", roles: ["witch"] },
  { id: "hunter", roles: ["hunter"] },
  { id: "cupid", roles: ["cupid"] },
  { id: "spellcaster", roles: ["spellcaster"] },
  { id: "mayorDoubleVote", roles: ["mayor"] },
  { id: "mayorHammer", roles: ["mayor"], settings: { mayor: "hammer" } },
  { id: "toughGuy", roles: ["toughGuy"] },
  { id: "apprenticeSeer", roles: ["apprenticeSeer"] },
  { id: "investigator", roles: ["paranormalInvestigator"] },
  { id: "tannerAnyDeath", roles: ["tanner"] },
  { id: "tannerVoteOnly", roles: ["tanner"], settings: { tanner: "voteOnly" } },
  { id: "amulet", roles: [], settings: { amulet: true } },
] as const satisfies readonly [Variant, ...Variant[]];

it("compares six-player variants one role or item at a time", () => {
  const names = playerNames(6);
  assert.equal(createWerewolf(names, "Narrator", randomFrom(1), ["magician"]), null);
  assert.equal(createWerewolf(names, "Narrator", randomFrom(1), [], { drunk: true }), null);
  compareVariants(6, "single", singleRoleVariants);
}, 30_000);

const witchVariants = [
  { id: "witch", roles: ["witch"] },
  { id: "withIdiot", roles: ["witch", "idiot"] },
  { id: "withBlock", roles: ["witch", "bodyguard"] },
  { id: "withNightGuest", roles: ["witch", "nightGuest"] },
  { id: "withBothBlock", roles: ["witch", "bodyguard", "idiot"] },
  {
    id: "withBothNightGuest",
    roles: ["witch", "nightGuest", "idiot"],
  },
] as const satisfies readonly [Variant, ...Variant[]];

it("compares the witch at six players with each combination of idiot and bodyguard", () => {
  compareVariants(6, "witch", witchVariants, [
    "random",
    "clues",
    "cautious",
    "quietFirstDay",
    "carefulWitch",
    "credibleSeer",
    "sharedKnowledge",
    "sharedKnowledgeAndIdiot",
  ]);
}, 30_000);

it("compares first-night attacks and fewer nominations after a quiet second night", () => {
  compareVariants(6, "witchFirstNightAttack", witchVariants, [
    "earlyAttack",
    "earlyAttackQuietSecondDay",
  ]);
}, 30_000);

it("compares the hunter with every combination of the witch, idiot and bodyguard", () => {
  const variants: readonly [Variant, ...Variant[]] = [
    { id: "hunter", roles: ["hunter"] },
    { id: "idiot", roles: ["hunter", "idiot"] },
    { id: "block", roles: ["hunter", "bodyguard"] },
    { id: "nightGuest", roles: ["hunter", "nightGuest"] },
    { id: "idiotBlock", roles: ["hunter", "bodyguard", "idiot"] },
    {
      id: "idiotNightGuest",
      roles: ["hunter", "nightGuest", "idiot"],
    },
    { id: "witch", roles: ["hunter", "witch"] },
    { id: "witchIdiot", roles: ["hunter", "witch", "idiot"] },
    { id: "witchBlock", roles: ["hunter", "witch", "bodyguard"] },
    {
      id: "witchNightGuest",
      roles: ["hunter", "witch", "nightGuest"],
    },
    { id: "witchIdiotBlock", roles: ["hunter", "witch", "bodyguard", "idiot"] },
    {
      id: "witchIdiotNightGuest",
      roles: ["hunter", "witch", "nightGuest", "idiot"],
    },
  ];
  compareVariants(6, "hunter", variants, [
    "random",
    "carefulWitch",
    "sharedKnowledgeAndIdiot",
    "earlyAttackQuietSecondDay",
  ]);
}, 30_000);

const sevenPlayerModels = [
  "random",
  "carefulWitch",
  "sharedKnowledgeAndIdiot",
  "earlyAttackQuietSecondDay",
] as const;

it("compares both protection roles with every other six-player option", () => {
  const optionalRoles = ["witch", "hunter", "idiot"] as const;
  const variants: [Variant, ...Variant[]] = [{ id: "basic", roles: [] }];
  for (let mask = 0; mask < 2 ** optionalRoles.length; mask++) {
    const roles = optionalRoles.filter((_, index) => (mask & (1 << index)) !== 0);
    if (roles.length) variants.push({ id: roles.join("+"), roles });
    for (const protector of ["bodyguard", "nightGuest"] as const) {
      const lineup = [...roles, protector];
      variants.push({ id: lineup.join("+"), roles: lineup });
    }
  }
  compareVariants(6, "sixProtection", variants, sevenPlayerModels);
}, 120_000);

it("compares seven-player variants one role or item at a time", () => {
  const names = playerNames(7);
  assert.equal(createWerewolf(names, "Narrator", randomFrom(1), ["magician"]), null);
  assert.equal(createWerewolf(names, "Narrator", randomFrom(1), [], { drunk: true }), null);
  compareVariants(7, "sevenSingle", singleRoleVariants, sevenPlayerModels);
}, 60_000);

it("compares additions to the full six-player lineup at seven players", () => {
  const core: readonly WerewolfSpecialRole[] = ["witch", "hunter", "idiot", "bodyguard"];
  const additions = singleRoleVariants
    .filter(
      (variant: Variant) =>
        variant.id !== "basic" &&
        variant.roles.every((role) => role !== "nightGuest" && !core.includes(role)),
    )
    .map((variant: Variant): Variant => ({ ...variant, roles: [...core, ...variant.roles] }));
  compareVariants(7, "sevenAdded", [{ id: "core", roles: core }, ...additions], sevenPlayerModels);
}, 60_000);

const proposedSevenPlayerRoles = [
  "witch",
  "hunter",
  "idiot",
  "bodyguard",
  "cupid",
  "toughGuy",
] as const;

function allProposedSevenPlayerVariants(): [Variant, ...Variant[]] {
  const variants: [Variant, ...Variant[]] = [{ id: "basic", roles: [] }];
  for (let mask = 1; mask < 2 ** proposedSevenPlayerRoles.length - 1; mask++) {
    const roles = proposedSevenPlayerRoles.filter((_, index) => (mask & (1 << index)) !== 0);
    const id = roles.join("+");
    variants.push({ id, roles });
    if (roles.includes("bodyguard")) {
      variants.push({
        id: id.replace("bodyguard", "nightGuest"),
        roles: roles.map((role) => (role === "bodyguard" ? "nightGuest" : role)),
      });
    }
  }
  return variants;
}

it.each(sevenPlayerModels)(
  "checks every proposed seven-player combination in model %s",
  (model) => {
    const variants = allProposedSevenPlayerVariants();
    assert.equal(variants.length, 94);
    assert.equal(new Set(variants.map((variant) => variant.id)).size, 94);
    assert.equal(variants.filter((variant) => variant.roles.length === 5).length, 11);
    assert.equal(
      createWerewolf(playerNames(7), "Narrator", randomFrom(1), proposedSevenPlayerRoles),
      null,
    );
    compareVariants(7, "sevenFull", variants, [model]);
  },
  120_000,
);

it("compares eight-player lineups with one wolf", () => {
  const core: readonly WerewolfSpecialRole[] = ["witch", "hunter", "idiot", "bodyguard"];
  const additions = singleRoleVariants
    .filter(
      (variant) =>
        variant.id !== "basic" &&
        variant.roles.every((role) => role !== "nightGuest" && !core.includes(role)),
    )
    .map((variant): Variant => ({ ...variant, roles: [...core, ...variant.roles] }));
  additions.push({ id: "allConfirmedRoles", roles: [...core, "cupid", "toughGuy"] });
  compareVariants(8, "eightSingle1", singleRoleVariants, sevenPlayerModels);
  compareVariants(8, "eightAdded1", [{ id: "core", roles: core }, ...additions], sevenPlayerModels);
}, 120_000);

it("compares the tanner and apprentice seer at eight players", () => {
  const backgrounds = [
    { id: "basic", roles: [] },
    { id: "bodyguard", roles: ["witch", "hunter", "idiot", "bodyguard"] },
    { id: "nightGuest", roles: ["witch", "hunter", "idiot", "nightGuest"] },
    { id: "lovers", roles: ["witch", "hunter", "cupid", "toughGuy"] },
  ] as const satisfies readonly Variant[];

  for (const { id, roles } of backgrounds) {
    const variants: readonly [Variant, ...Variant[]] = [
      { id: "baseline", roles },
      { id: "apprentice", roles: [...roles, "apprenticeSeer"] },
      { id: "tannerAnyDeath", roles: [...roles, "tanner"] },
      { id: "tannerVoteOnly", roles: [...roles, "tanner"], settings: { tanner: "voteOnly" } },
      { id: "bothAnyDeath", roles: [...roles, "apprenticeSeer", "tanner"] },
      {
        id: "bothVoteOnly",
        roles: [...roles, "apprenticeSeer", "tanner"],
        settings: { tanner: "voteOnly" },
      },
    ];
    compareVariants(8, "eightOptional-" + id, variants, sevenPlayerModels);
  }
}, 120_000);

const proposedEightPlayerRoles = [
  ...proposedSevenPlayerRoles,
  "nightGuest",
  "tanner",
  "apprenticeSeer",
] as const;

const eightPlayerVariants: [Variant, ...Variant[]] = [{ id: "basic", roles: [] }];
const invalidEightPlayerSelections: WerewolfSpecialRole[][] = [];
for (let mask = 1; mask < 2 ** proposedEightPlayerRoles.length; mask++) {
  const roles = proposedEightPlayerRoles.filter((_, index) => (mask & (1 << index)) !== 0);
  if (roles.length > 6 || (roles.includes("bodyguard") && roles.includes("nightGuest"))) {
    invalidEightPlayerSelections.push(roles);
    continue;
  }
  const id = roles.join("+");
  eightPlayerVariants.push({ id, roles });
  if (roles.includes("tanner")) {
    eightPlayerVariants.push({ id: id + "+voteOnly", roles, settings: { tanner: "voteOnly" } });
  }
}

it("rejects overfilled or conflicting eight-player selections", () => {
  const names = playerNames(8);
  assert.equal(invalidEightPlayerSelections.length, 145);
  for (const roles of invalidEightPlayerSelections) {
    assert.equal(createWerewolf(names, "Narrator", randomFrom(1), roles), null, roles.join("+"));
  }
});

it.each(sevenPlayerModels)(
  "checks every proposed eight-player combination in model %s",
  (model) => {
    assert.equal(eightPlayerVariants.length, 544);
    assert.equal(new Set(eightPlayerVariants.map((variant) => variant.id)).size, 544);
    compareVariants(8, "eightFull", eightPlayerVariants, [model], 2_000);
  },
  120_000,
);

const ninePlayerBackgrounds = [
  { id: "basic", roles: [] },
  { id: "idiot", roles: ["witch", "hunter", "idiot"] },
  { id: "bodyguard", roles: ["witch", "bodyguard", "apprenticeSeer"] },
  { id: "nightGuest", roles: ["witch", "nightGuest", "apprenticeSeer"] },
] as const satisfies readonly Variant[];

it("screens nine-player roles, the drunk mask and the amulet", () => {
  const sampleSize = 3_000;
  compareVariants(
    9,
    "nineSingle",
    [
      singleRoleVariants[0],
      ...singleRoleVariants.slice(1).filter(({ id }) => id !== "mayorHammer"),
    ],
    sevenPlayerModels,
    sampleSize,
  );

  for (const { id, roles } of ninePlayerBackgrounds) {
    const variants: [Variant, ...Variant[]] = [
      { id: "baseline", roles },
      { id: "amulet", roles, settings: { amulet: true } },
    ];
    for (const mayor of [false, true]) {
      for (const investigator of [false, true]) {
        for (const spellcaster of ["off", "other", "self"] as const) {
          const selected: WerewolfSpecialRole[] = [...roles];
          if (mayor) selected.push("mayor");
          if (investigator) selected.push("paranormalInvestigator");
          if (spellcaster !== "off") selected.push("spellcaster");

          for (const drunk of [false, true]) {
            if (selected.length === roles.length && !drunk) continue;
            const variantId = [
              mayor && "mayor",
              investigator && "investigator",
              spellcaster === "other" && "spellcaster",
              spellcaster === "self" && "spellcasterSelf",
              drunk && "drunk",
            ]
              .filter(Boolean)
              .join("+");
            variants.push({
              id: variantId,
              roles: selected,
              settings: { drunk, allowSelfSilence: spellcaster === "self" },
            });
          }
        }
      }
    }
    assert.equal(variants.length, 25);
    compareVariants(9, "nineCandidates-" + id, variants, sevenPlayerModels, sampleSize);
  }
}, 150_000);

it("checks the mayor hammer at nine players", () => {
  for (const { id, roles } of ninePlayerBackgrounds) {
    const mayor: readonly WerewolfSpecialRole[] = [...roles, "mayor"];
    compareVariants(
      9,
      "nineMayor-" + id,
      [
        { id: "hammer", roles: mayor, settings: { mayor: "hammer" } },
        { id: "hammerDrunk", roles: mayor, settings: { mayor: "hammer", drunk: true } },
      ],
      sevenPlayerModels,
      3_000,
    );
  }
}, 90_000);

const proposedNinePlayerRoles = [...proposedEightPlayerRoles, "mayor", "spellcaster"] as const;
const ninePlayerVariants: [Variant, ...Variant[]] = [{ id: "basic", roles: [] }];
const invalidNinePlayerSelections: WerewolfSpecialRole[][] = [];

for (let mask = 0; mask < 2 ** proposedNinePlayerRoles.length; mask++) {
  const roles = proposedNinePlayerRoles.filter((_, index) => (mask & (1 << index)) !== 0);
  if (roles.length > 6 || (roles.includes("bodyguard") && roles.includes("nightGuest"))) {
    invalidNinePlayerSelections.push(roles);
    continue;
  }
  for (const tanner of roles.includes("tanner")
    ? (["anyDeath", "voteOnly"] as const)
    : (["anyDeath"] as const)) {
    for (const allowSelfSilence of roles.includes("spellcaster") ? [false, true] : [false]) {
      for (const drunk of [false, true]) {
        if (!roles.length && !drunk) continue;
        const id = [
          roles.length ? roles.join("+") : "basic",
          tanner === "voteOnly" && "voteOnly",
          allowSelfSilence && "allowSelfSilence",
          drunk && "drunk",
        ]
          .filter(Boolean)
          .join("+");
        ninePlayerVariants.push({ id, roles, settings: { tanner, allowSelfSilence, drunk } });
      }
    }
  }
}

it("rejects overfilled or conflicting nine-player selections", () => {
  const names = playerNames(9);
  assert.equal(invalidNinePlayerSelections.length, 818);
  for (const roles of invalidNinePlayerSelections) {
    assert.equal(createWerewolf(names, "Narrator", randomFrom(1), roles), null, roles.join("+"));
  }
});

it.each(sevenPlayerModels)(
  "checks every agreed nine-player combination in model %s",
  (model) => {
    assert.equal(ninePlayerVariants.length, 5_094);
    assert.equal(new Set(ninePlayerVariants.map(({ id }) => id)).size, 5_094);
    compareVariants(9, "nineFull", ninePlayerVariants, [model], 250);
  },
  150_000,
);

const tenPlayerModels = [...sevenPlayerModels, "combinedInvestigation"] as const;

it("compares the hammer, investigator and amulet at ten players", () => {
  const backgrounds = [
    { id: "basic", roles: [] },
    { id: "idiot", roles: ["witch", "hunter", "idiot"] },
    { id: "bodyguard", roles: ["witch", "bodyguard", "apprenticeSeer"] },
    { id: "nightGuest", roles: ["witch", "nightGuest", "apprenticeSeer", "cupid", "toughGuy"] },
  ] as const satisfies readonly Variant[];
  for (const { id, roles } of backgrounds) {
    const variants: [Variant, ...Variant[]] = [{ id: "baseline", roles }];
    for (const mayor of ["off", "doubleVote", "hammer"] as const) {
      for (const investigator of [false, true]) {
        for (const amulet of [false, true]) {
          for (const drunk of [false, true]) {
            const options = [
              mayor !== "off" && mayor,
              investigator && "investigator",
              amulet && "amulet",
              drunk && "drunk",
            ]
              .filter(Boolean)
              .join("+");
            if (!options) continue;
            const selected: WerewolfSpecialRole[] = [...roles];
            if (mayor !== "off") selected.push("mayor");
            if (investigator) selected.push("paranormalInvestigator");
            variants.push({
              id: options,
              roles: selected,
              settings: { mayor: mayor === "hammer" ? "hammer" : "doubleVote", amulet, drunk },
            });
          }
        }
      }
    }
    assert.equal(variants.length, 24);
    compareVariants(10, "tenCandidates-" + id, variants, tenPlayerModels, 3_000);
  }
}, 180_000);

const proposedTenPlayerRoles = [...proposedNinePlayerRoles, "paranormalInvestigator"] as const;
const tenPlayerVariants: [Variant, ...Variant[]] = [{ id: "basic", roles: [] }];
const invalidTenPlayerSelections: WerewolfSpecialRole[][] = [];

for (let mask = 0; mask < 2 ** proposedTenPlayerRoles.length; mask++) {
  const roles = proposedTenPlayerRoles.filter((_, index) => (mask & (1 << index)) !== 0);
  if (roles.length > 7 || (roles.includes("bodyguard") && roles.includes("nightGuest"))) {
    invalidTenPlayerSelections.push(roles);
    continue;
  }
  const tannerOptions = roles.includes("tanner")
    ? (["anyDeath", "voteOnly"] as const)
    : (["anyDeath"] as const);
  const silenceOptions = roles.includes("spellcaster") ? [false, true] : [false];
  const mayorOptions = roles.includes("mayor")
    ? (["doubleVote", "hammer"] as const)
    : (["doubleVote"] as const);
  for (const tanner of tannerOptions) {
    for (const allowSelfSilence of silenceOptions) {
      for (const mayor of mayorOptions) {
        for (const amulet of [false, true]) {
          for (const drunk of [false, true]) {
            if (!roles.length && !amulet && !drunk) continue;
            const id = [
              roles.length ? roles.join("+") : "basic",
              tanner === "voteOnly" && "voteOnly",
              allowSelfSilence && "allowSelfSilence",
              mayor === "hammer" && "hammer",
              amulet && "amulet",
              drunk && "drunk",
            ]
              .filter(Boolean)
              .join("+");
            tenPlayerVariants.push({
              id,
              roles,
              settings: { tanner, allowSelfSilence, mayor, amulet, drunk },
            });
          }
        }
      }
    }
  }
}

it("rejects overfilled or conflicting ten-player selections", () => {
  const names = playerNames(10);
  assert.equal(invalidTenPlayerSelections.length, 1_432);
  for (const roles of invalidTenPlayerSelections) {
    assert.equal(createWerewolf(names, "Narrator", randomFrom(1), roles), null, roles.join("+"));
  }
});

it.each(tenPlayerModels)(
  "checks every agreed ten-player combination in model %s",
  (model) => {
    assert.equal(tenPlayerVariants.length, 32_864);
    assert.equal(new Set(tenPlayerVariants.map(({ id }) => id)).size, tenPlayerVariants.length);
    // This small sample checks each lineup for completion; uncommon events need not appear in each lineup.
    compareVariants(10, "tenFull", tenPlayerVariants, [model], 40, false);
  },
  240_000,
);

const twelvePlayerBackgrounds = [
  { id: "basic", roles: [] },
  { id: "scouts", roles: ["hunter", "bodyguard", "apprenticeSeer", "paranormalInvestigator"] },
  {
    id: "tanner",
    roles: ["hunter", "bodyguard", "tanner", "spellcaster", "paranormalInvestigator"],
  },
  {
    id: "nightGuest",
    roles: ["hunter", "idiot", "nightGuest", "cupid", "toughGuy", "spellcaster"],
  },
] as const satisfies readonly Variant[];

it.each(twelvePlayerBackgrounds)(
  "checks twelve-player healer and mayor options in the $id lineup",
  ({ id, roles }) => {
    const variants: [Variant, ...Variant[]] = [{ id: "baseline", roles }];
    for (const healer of ["off", "witch", "magician"] as const) {
      for (const mayor of ["off", "doubleVote", "hammer"] as const) {
        for (const amulet of [false, true]) {
          for (const drunk of [false, true]) {
            const options = [
              healer !== "off" && healer,
              mayor !== "off" && mayor,
              amulet && "amulet",
              drunk && "drunk",
            ]
              .filter(Boolean)
              .join("+");
            if (!options) continue;
            const selected: WerewolfSpecialRole[] = [...roles];
            if (healer !== "off") selected.push(healer);
            if (mayor !== "off") selected.push("mayor");
            variants.push({
              id: options,
              roles: selected,
              settings: { mayor: mayor === "hammer" ? "hammer" : "doubleVote", amulet, drunk },
            });
          }
        }
      }
    }
    assert.equal(variants.length, 36);
    compareVariants(12, "twelveCandidates-" + id, variants, tenPlayerModels, 2_000);
  },
  150_000,
);

const proposedThirteenPlayerRoles = [...proposedTenPlayerRoles, "magician"] as const;
const thirteenPlayerVariants: [Variant, ...Variant[]] = [{ id: "basic", roles: [] }];
const invalidThirteenPlayerSelections: WerewolfSpecialRole[][] = [];
for (let mask = 0; mask < 2 ** proposedThirteenPlayerRoles.length; mask++) {
  const roles = proposedThirteenPlayerRoles.filter((_, index) => (mask & (1 << index)) !== 0);
  if (
    roles.length > 9 ||
    (roles.includes("bodyguard") && roles.includes("nightGuest")) ||
    (roles.includes("witch") && roles.includes("magician"))
  ) {
    invalidThirteenPlayerSelections.push(roles);
    continue;
  }
  const tannerOptions = roles.includes("tanner")
    ? (["anyDeath", "voteOnly"] as const)
    : (["anyDeath"] as const);
  const silenceOptions = roles.includes("spellcaster") ? [false, true] : [false];
  const mayorOptions = roles.includes("mayor")
    ? (["doubleVote", "hammer"] as const)
    : (["doubleVote"] as const);
  for (const tanner of tannerOptions) {
    for (const allowSelfSilence of silenceOptions) {
      for (const mayor of mayorOptions) {
        for (const amulet of [false, true]) {
          for (const drunk of [false, true]) {
            if (!roles.length && !amulet && !drunk) continue;
            const id = [
              roles.length ? roles.join("+") : "basic",
              tanner === "voteOnly" && "voteOnly",
              allowSelfSilence && "allowSelfSilence",
              mayor === "hammer" && "hammer",
              amulet && "amulet",
              drunk && "drunk",
            ]
              .filter(Boolean)
              .join("+");
            thirteenPlayerVariants.push({
              id,
              roles,
              settings: { tanner, allowSelfSilence, mayor, amulet, drunk },
            });
          }
        }
      }
    }
  }
}

it("rejects overfilled or conflicting thirteen-player selections", () => {
  const names = playerNames(13);
  assert.equal(invalidThirteenPlayerSelections.length, 3_628);
  for (const roles of invalidThirteenPlayerSelections) {
    assert.equal(createWerewolf(names, "Narrator", randomFrom(1), roles), null, roles.join("+"));
  }
});

it.each(tenPlayerModels)(
  "checks every agreed thirteen-player combination in model %s",
  (model) => {
    assert.equal(thirteenPlayerVariants.length, 60_992);
    assert.equal(new Set(thirteenPlayerVariants.map(({ id }) => id)).size, 60_992);
    // Broad coverage complements the archived comparisons with 2,000 starts per lineup.
    compareVariants(13, "thirteenFull", thirteenPlayerVariants, [model], 24, false);
  },
  600_000,
);

it.each([1, 2, 3, 4])(
  "checks fifteen-player witch games with %i wolves",
  (wolfCount) => {
    compareVariants(
      15,
      "fifteenWitch-" + wolfCount,
      [
        {
          id: "witch",
          roles: ["witch"],
          settings: { wolfCount, wolfCountMode: "balanced" },
        },
      ],
      tenPlayerModels,
      3_000,
      wolfCount < 7,
    );
  },
  60_000,
);

const fourteenPlayerVariants = new Map<number, [Variant, ...Variant[]]>();
const invalidFourteenPlayerSelections = new Map<number, WerewolfSpecialRole[][]>();
for (const wolfCount of [3, 4]) {
  const variants: [Variant, ...Variant[]] = [{ id: "basic", roles: [], settings: { wolfCount } }];
  const invalid: WerewolfSpecialRole[][] = [];
  for (let mask = 0; mask < 2 ** proposedThirteenPlayerRoles.length; mask++) {
    const roles = proposedThirteenPlayerRoles.filter((_, index) => (mask & (1 << index)) !== 0);
    if (
      roles.length > 13 - wolfCount ||
      (roles.includes("bodyguard") && roles.includes("nightGuest")) ||
      (wolfCount === 3 && roles.includes("witch") && roles.includes("magician"))
    ) {
      invalid.push(roles);
      continue;
    }
    const tannerOptions = roles.includes("tanner")
      ? (["anyDeath", "voteOnly"] as const)
      : (["anyDeath"] as const);
    const silenceOptions = roles.includes("spellcaster") ? [false, true] : [false];
    const mayorOptions = roles.includes("mayor")
      ? (["doubleVote", "hammer"] as const)
      : (["doubleVote"] as const);
    for (const tanner of tannerOptions)
      for (const allowSelfSilence of silenceOptions)
        for (const mayor of mayorOptions) {
          for (const amulet of [false, true])
            for (const drunk of [false, true]) {
              if (!roles.length && !amulet && !drunk) continue;
              const id = [
                roles.length ? roles.join("+") : "basic",
                tanner === "voteOnly" && "voteOnly",
                allowSelfSilence && "allowSelfSilence",
                mayor === "hammer" && "hammer",
                amulet && "amulet",
                drunk && "drunk",
              ]
                .filter(Boolean)
                .join("+");
              variants.push({
                id,
                roles,
                settings: { wolfCount, tanner, allowSelfSilence, mayor, amulet, drunk },
              });
            }
        }
  }
  fourteenPlayerVariants.set(wolfCount, variants);
  invalidFourteenPlayerSelections.set(wolfCount, invalid);
}

it.each([3, 4])("rejects conflicting fourteen-player selections with %i wolves", (wolfCount) => {
  const invalid = invalidFourteenPlayerSelections.get(wolfCount)!;
  assert.equal(invalid.length, wolfCount === 3 ? 3_588 : 2_194);
  for (const roles of invalid) {
    assert.equal(
      createWerewolf(playerNames(14), "Narrator", randomFrom(1), roles, { wolfCount }),
      null,
      roles.join("+"),
    );
  }
});

const fourteenModels = [3, 4].flatMap((wolfCount) =>
  tenPlayerModels.map((model) => ({ wolfCount, model })),
);
it.each(fourteenModels)(
  "checks every fourteen-player combination with $wolfCount wolves in model $model",
  ({ wolfCount, model }) => {
    const variants = fourteenPlayerVariants.get(wolfCount)!;
    assert.equal(variants.length, wolfCount === 3 ? 62_080 : 79_328);
    assert.equal(new Set(variants.map((variant) => variant.id)).size, variants.length);
    compareVariants(14, "fourteenFull-" + wolfCount, variants, [model], 8, false);
  },
  900_000,
);

const fifteenPlayerVariants = new Map<number, [Variant, ...Variant[]]>();
const invalidFifteenPlayerSelections = new Map<number, WerewolfSpecialRole[][]>();
for (const wolfCount of [3, 4]) {
  const variants: [Variant, ...Variant[]] = [{ id: "basic", roles: [], settings: { wolfCount } }];
  const invalid: WerewolfSpecialRole[][] = [];
  for (let mask = 0; mask < 2 ** proposedThirteenPlayerRoles.length; mask++) {
    const roles = proposedThirteenPlayerRoles.filter((_, index) => (mask & (1 << index)) !== 0);
    if (
      roles.length > 14 - wolfCount ||
      (roles.includes("bodyguard") && roles.includes("nightGuest")) ||
      (wolfCount === 3 && roles.includes("witch") && roles.includes("magician"))
    ) {
      invalid.push(roles);
      continue;
    }
    const tannerOptions = roles.includes("tanner")
      ? (["anyDeath", "voteOnly"] as const)
      : (["anyDeath"] as const);
    const silenceOptions = roles.includes("spellcaster") ? [false, true] : [false];
    const mayorOptions = roles.includes("mayor")
      ? (["doubleVote", "hammer"] as const)
      : (["doubleVote"] as const);
    for (const tanner of tannerOptions)
      for (const allowSelfSilence of silenceOptions)
        for (const mayor of mayorOptions) {
          for (const amulet of [false, true])
            for (const drunk of [false, true]) {
              if (!roles.length && !amulet && !drunk) continue;
              const id = [
                roles.length ? roles.join("+") : "basic",
                tanner === "voteOnly" && "voteOnly",
                allowSelfSilence && "allowSelfSilence",
                mayor === "hammer" && "hammer",
                amulet && "amulet",
                drunk && "drunk",
              ]
                .filter(Boolean)
                .join("+");
              variants.push({
                id,
                roles,
                settings: { wolfCount, tanner, allowSelfSilence, mayor, amulet, drunk },
              });
            }
        }
  }
  fifteenPlayerVariants.set(wolfCount, variants);
  invalidFifteenPlayerSelections.set(wolfCount, invalid);
}

it.each([3, 4])("rejects conflicting fifteen-player selections with %i wolves", (wolfCount) => {
  const invalid = invalidFifteenPlayerSelections.get(wolfCount)!;
  assert.equal(invalid.length, { 3: 3_584, 4: 2_073 }[wolfCount as 3 | 4]);
  for (const roles of invalid) {
    assert.equal(
      createWerewolf(playerNames(15), "Narrator", randomFrom(1), roles, { wolfCount }),
      null,
      roles.join("+"),
    );
  }
});

const fifteenModels = [3, 4].flatMap((wolfCount) =>
  tenPlayerModels.map((model) => ({ wolfCount, model })),
);
it.each(fifteenModels)(
  "checks every fifteen-player combination with $wolfCount wolves in model $model",
  ({ wolfCount, model }) => {
    const variants = fifteenPlayerVariants.get(wolfCount)!;
    assert.equal(variants.length, { 3: 62_208, 4: 82_240 }[wolfCount as 3 | 4]);
    assert.equal(new Set(variants.map((variant) => variant.id)).size, variants.length);
    compareVariants(15, "fifteenFull-" + wolfCount, variants, [model], 8, false);
  },
  900_000,
);

const sixteenPlayerVariants = new Map<number, [Variant, ...Variant[]]>();
const invalidSixteenPlayerSelections = new Map<number, WerewolfSpecialRole[][]>();
for (const wolfCount of [3, 4]) {
  const variants: [Variant, ...Variant[]] = [{ id: "basic", roles: [], settings: { wolfCount } }];
  const invalid: WerewolfSpecialRole[][] = [];
  for (let mask = 0; mask < 2 ** proposedThirteenPlayerRoles.length; mask++) {
    const roles = proposedThirteenPlayerRoles.filter((_, index) => (mask & (1 << index)) !== 0);
    if (
      roles.length > 15 - wolfCount ||
      (roles.includes("bodyguard") && roles.includes("nightGuest")) ||
      (wolfCount === 3 && roles.includes("witch") && roles.includes("magician"))
    ) {
      invalid.push(roles);
      continue;
    }
    const tannerOptions = roles.includes("tanner")
      ? (["anyDeath", "voteOnly"] as const)
      : (["anyDeath"] as const);
    const silenceOptions = roles.includes("spellcaster") ? [false, true] : [false];
    const mayorOptions = roles.includes("mayor")
      ? (["doubleVote", "hammer"] as const)
      : (["doubleVote"] as const);
    for (const tanner of tannerOptions)
      for (const allowSelfSilence of silenceOptions)
        for (const mayor of mayorOptions) {
          for (const amulet of [false, true])
            for (const drunk of [false, true]) {
              if (!roles.length && !amulet && !drunk) continue;
              const id = [
                roles.length ? roles.join("+") : "basic",
                tanner === "voteOnly" && "voteOnly",
                allowSelfSilence && "allowSelfSilence",
                mayor === "hammer" && "hammer",
                amulet && "amulet",
                drunk && "drunk",
              ]
                .filter(Boolean)
                .join("+");
              variants.push({
                id,
                roles,
                settings: { wolfCount, tanner, allowSelfSilence, mayor, amulet, drunk },
              });
            }
        }
  }
  sixteenPlayerVariants.set(wolfCount, variants);
  invalidSixteenPlayerSelections.set(wolfCount, invalid);
}

it.each([3, 4])("rejects conflicting sixteen-player selections with %i wolves", (wolfCount) => {
  const invalid = invalidSixteenPlayerSelections.get(wolfCount)!;
  assert.equal(invalid.length, { 3: 3_584, 4: 2_050 }[wolfCount as 3 | 4]);
  for (const roles of invalid) {
    assert.equal(
      createWerewolf(playerNames(16), "Narrator", randomFrom(1), roles, { wolfCount }),
      null,
      roles.join("+"),
    );
  }
});

const sixteenModels = [3, 4].flatMap((wolfCount) =>
  tenPlayerModels.map((model) => ({ wolfCount, model })),
);
it.each(sixteenModels)(
  "checks every sixteen-player combination with $wolfCount wolves in model $model",
  ({ wolfCount, model }) => {
    const variants = sixteenPlayerVariants.get(wolfCount)!;
    assert.equal(variants.length, { 3: 62_208, 4: 82_880 }[wolfCount as 3 | 4]);
    assert.equal(new Set(variants.map((variant) => variant.id)).size, variants.length);
    compareVariants(16, "sixteenFull-" + wolfCount, variants, [model], 8, false);
  },
  900_000,
);

const seventeenPlayerVariants = new Map<number, [Variant, ...Variant[]]>();
const invalidSeventeenPlayerSelections = new Map<number, WerewolfSpecialRole[][]>();
for (const wolfCount of [3, 4, 5]) {
  const variants: [Variant, ...Variant[]] = [{ id: "basic", roles: [], settings: { wolfCount } }];
  const invalid: WerewolfSpecialRole[][] = [];
  for (let mask = 0; mask < 2 ** proposedThirteenPlayerRoles.length; mask++) {
    const roles = proposedThirteenPlayerRoles.filter((_, index) => (mask & (1 << index)) !== 0);
    if (
      roles.length > 16 - wolfCount ||
      (roles.includes("bodyguard") && roles.includes("nightGuest")) ||
      (wolfCount === 3 && roles.includes("witch") && roles.includes("magician"))
    ) {
      invalid.push(roles);
      continue;
    }
    const tannerOptions = roles.includes("tanner")
      ? (["anyDeath", "voteOnly"] as const)
      : (["anyDeath"] as const);
    const silenceOptions = roles.includes("spellcaster") ? [false, true] : [false];
    const mayorOptions = roles.includes("mayor")
      ? (["doubleVote", "hammer"] as const)
      : (["doubleVote"] as const);
    for (const tanner of tannerOptions)
      for (const allowSelfSilence of silenceOptions)
        for (const mayor of mayorOptions) {
          for (const amulet of [false, true])
            for (const drunk of [false, true]) {
              if (!roles.length && !amulet && !drunk) continue;
              const id = [
                roles.length ? roles.join("+") : "basic",
                tanner === "voteOnly" && "voteOnly",
                allowSelfSilence && "allowSelfSilence",
                mayor === "hammer" && "hammer",
                amulet && "amulet",
                drunk && "drunk",
              ]
                .filter(Boolean)
                .join("+");
              variants.push({
                id,
                roles,
                settings: { wolfCount, tanner, allowSelfSilence, mayor, amulet, drunk },
              });
            }
        }
  }
  seventeenPlayerVariants.set(wolfCount, variants);
  invalidSeventeenPlayerSelections.set(wolfCount, invalid);
}

it.each([3, 4, 5])(
  "rejects conflicting seventeen-player selections with %i wolves",
  (wolfCount) => {
    const invalid = invalidSeventeenPlayerSelections.get(wolfCount)!;
    assert.equal(invalid.length, { 3: 3_584, 4: 2_048, 5: 2_050 }[wolfCount as 3 | 4 | 5]);
    for (const roles of invalid) {
      assert.equal(
        createWerewolf(playerNames(17), "Narrator", randomFrom(1), roles, { wolfCount }),
        null,
        roles.join("+"),
      );
    }
  },
);

const seventeenModels = [3, 4, 5].flatMap((wolfCount) =>
  tenPlayerModels.map((model) => ({ wolfCount, model })),
);
it.each(seventeenModels)(
  "checks every seventeen-player combination with $wolfCount wolves in model $model",
  ({ wolfCount, model }) => {
    const variants = seventeenPlayerVariants.get(wolfCount)!;
    assert.equal(variants.length, { 3: 62_208, 4: 82_944, 5: 82_880 }[wolfCount as 3 | 4 | 5]);
    assert.equal(new Set(variants.map((variant) => variant.id)).size, variants.length);
    compareVariants(17, "seventeenFull-" + wolfCount, variants, [model], 8, false);
  },
  900_000,
);

const eighteenPlayerVariants = new Map<number, [Variant, ...Variant[]]>();
const invalidEighteenPlayerSelections = new Map<number, WerewolfSpecialRole[][]>();
for (const wolfCount of [3, 4, 5]) {
  const variants: [Variant, ...Variant[]] = [{ id: "basic", roles: [], settings: { wolfCount } }];
  const invalid: WerewolfSpecialRole[][] = [];
  for (let mask = 0; mask < 2 ** proposedThirteenPlayerRoles.length; mask++) {
    const roles = proposedThirteenPlayerRoles.filter((_, index) => (mask & (1 << index)) !== 0);
    if (
      roles.length > 17 - wolfCount ||
      (roles.includes("bodyguard") && roles.includes("nightGuest")) ||
      (wolfCount === 3 && roles.includes("witch") && roles.includes("magician"))
    ) {
      invalid.push(roles);
      continue;
    }
    const tannerOptions = roles.includes("tanner")
      ? (["anyDeath", "voteOnly"] as const)
      : (["anyDeath"] as const);
    const silenceOptions = roles.includes("spellcaster") ? [false, true] : [false];
    const mayorOptions = roles.includes("mayor")
      ? (["doubleVote", "hammer"] as const)
      : (["doubleVote"] as const);
    for (const tanner of tannerOptions)
      for (const allowSelfSilence of silenceOptions)
        for (const mayor of mayorOptions) {
          for (const amulet of [false, true])
            for (const drunk of [false, true]) {
              if (!roles.length && !amulet && !drunk) continue;
              const id = [
                roles.length ? roles.join("+") : "basic",
                tanner === "voteOnly" && "voteOnly",
                allowSelfSilence && "allowSelfSilence",
                mayor === "hammer" && "hammer",
                amulet && "amulet",
                drunk && "drunk",
              ]
                .filter(Boolean)
                .join("+");
              variants.push({
                id,
                roles,
                settings: { wolfCount, tanner, allowSelfSilence, mayor, amulet, drunk },
              });
            }
        }
  }
  eighteenPlayerVariants.set(wolfCount, variants);
  invalidEighteenPlayerSelections.set(wolfCount, invalid);
}

it.each([3, 4, 5])("rejects conflicting eighteen-player selections with %i wolves", (wolfCount) => {
  const invalid = invalidEighteenPlayerSelections.get(wolfCount)!;
  assert.equal(invalid.length, { 3: 3_584, 4: 2_048, 5: 2_048 }[wolfCount as 3 | 4 | 5]);
  for (const roles of invalid) {
    assert.equal(
      createWerewolf(playerNames(18), "Narrator", randomFrom(1), roles, { wolfCount }),
      null,
      roles.join("+"),
    );
  }
});

const eighteenModels = [3, 4, 5].flatMap((wolfCount) =>
  tenPlayerModels.map((model) => ({ wolfCount, model })),
);
it.each(eighteenModels)(
  "checks every eighteen-player combination with $wolfCount wolves in model $model",
  ({ wolfCount, model }) => {
    const variants = eighteenPlayerVariants.get(wolfCount)!;
    assert.equal(variants.length, { 3: 62_208, 4: 82_944, 5: 82_944 }[wolfCount as 3 | 4 | 5]);
    assert.equal(new Set(variants.map((variant) => variant.id)).size, variants.length);
    compareVariants(18, "eighteenFull-" + wolfCount, variants, [model], 8, false);
  },
  900_000,
);

it("waits only when a wrong exile is dangerous and there is a plausible way to survive the night", () => {
  const loneWolf = { livingWolves: 1, possibleDefenders: 0 };
  assert.equal(shouldWait(5, loneWolf), false);
  assert.equal(shouldWait(4, loneWolf), true);
  assert.equal(shouldWait(3, loneWolf), false);
  assert.equal(shouldWait(3, { livingWolves: 2, possibleDefenders: 1 }), false);
  assert.equal(shouldWait(3, { ...loneWolf, possibleDefenders: 1 }), true);
});

const largeLineupRoles: readonly WerewolfSpecialRole[] = [
  "bodyguard",
  "nightGuest",
  "witch",
  "hunter",
  "cupid",
  "idiot",
  "spellcaster",
  "mayor",
  "toughGuy",
  "apprenticeSeer",
  "paranormalInvestigator",
  "magician",
  "tanner",
];
const sampleLargeLineups = (
  jointHealers: boolean,
  size: number,
  seed: number,
): [Variant, ...Variant[]] => {
  const random = randomFrom(seed);
  const samples: [Variant, ...Variant[]] = [
    {
      id: jointHealers ? "joint-basic" : "basic",
      roles: [],
    },
  ];
  const seen = new Set<string>();
  while (samples.length <= size) {
    const roles = largeLineupRoles.filter(() => random() < 0.5);
    if (roles.includes("bodyguard") && roles.includes("nightGuest")) continue;
    if ((roles.includes("witch") && roles.includes("magician")) !== jointHealers) continue;
    const settings: Partial<WerewolfSettings> = {
      mayor: random() < 0.5 ? "doubleVote" : "hammer",
      allowSelfSilence: random() < 0.5,
      tanner: random() < 0.5 ? "anyDeath" : "voteOnly",
      amulet: random() < 0.5,
      drunk: random() < 0.5,
      hunterShot: random() < 0.5 ? "optional" : "required",
    };
    const key = JSON.stringify({ roles, settings });
    if (seen.has(key)) continue;
    seen.add(key);
    samples.push({ id: (jointHealers ? "joint-" : "sample-") + samples.length, roles, settings });
  }
  return samples;
};
const nineteenCommon = sampleLargeLineups(false, 64, 19001);
const nineteenJoint = sampleLargeLineups(true, 16, 19002);
const largeLineupEdges: [Variant, ...Variant[]] = [
  { id: "basic", roles: [] },
  { id: "witch", roles: ["witch"] },
  { id: "witchBodyguard", roles: ["witch", "bodyguard"] },
  { id: "information", roles: ["apprenticeSeer", "paranormalInvestigator", "mayor"] },
  { id: "healing", roles: ["magician", "bodyguard", "toughGuy"], settings: { amulet: true } },
  {
    id: "denseWitch",
    roles: largeLineupRoles.filter((role) => role !== "nightGuest" && role !== "magician"),
    settings: { amulet: true, drunk: true, mayor: "hammer" },
  },
  {
    id: "denseMagician",
    roles: largeLineupRoles.filter((role) => role !== "bodyguard" && role !== "witch"),
    settings: { amulet: true, drunk: true },
  },
  {
    id: "denseNoItems",
    roles: largeLineupRoles.filter((role) => role !== "nightGuest" && role !== "magician"),
  },
];
it.each([3, 4, 5])(
  "samples nineteen-player wolf counts with %i wolves",
  (wolfCount) => {
    const withWolves = (variants: readonly [Variant, ...Variant[]]): [Variant, ...Variant[]] =>
      variants.map((variant) => ({ ...variant, settings: { ...variant.settings, wolfCount } })) as [
        Variant,
        ...Variant[],
      ];
    compareVariants(
      19,
      "nineteenCommon-" + wolfCount,
      withWolves(nineteenCommon),
      tenPlayerModels,
      128,
      false,
    );
    compareVariants(
      19,
      "nineteenEdges-" + wolfCount,
      withWolves(largeLineupEdges),
      tenPlayerModels,
      1000,
      false,
    );
    if (wolfCount >= 4)
      compareVariants(
        19,
        "nineteenJoint-" + wolfCount,
        withWolves(nineteenJoint),
        tenPlayerModels,
        128,
        false,
      );
  },
  120_000,
);

const twentyCommon = sampleLargeLineups(false, 64, 20001);
const twentyJoint = sampleLargeLineups(true, 16, 20002);
it.each([3, 4, 5])(
  "samples twenty-player wolf counts with %i wolves",
  (wolfCount) => {
    const withWolves = (variants: readonly [Variant, ...Variant[]]): [Variant, ...Variant[]] =>
      variants.map((variant) => ({ ...variant, settings: { ...variant.settings, wolfCount } })) as [
        Variant,
        ...Variant[],
      ];
    compareVariants(
      20,
      "twentyCommon-" + wolfCount,
      withWolves(twentyCommon),
      tenPlayerModels,
      128,
      false,
    );
    compareVariants(
      20,
      "twentyEdges-" + wolfCount,
      withWolves(largeLineupEdges),
      tenPlayerModels,
      1000,
      false,
    );
    if (wolfCount >= 4)
      compareVariants(
        20,
        "twentyJoint-" + wolfCount,
        withWolves(twentyJoint),
        tenPlayerModels,
        128,
        false,
      );
  },
  120_000,
);

const eightWolfRecheck: [Variant, ...Variant[]] = [{ id: "basic", roles: [] }];
for (let mask = 1; mask < 2 ** proposedEightPlayerRoles.length; mask++) {
  const roles = proposedEightPlayerRoles.filter((_, index) => (mask & (1 << index)) !== 0);
  if (roles.length > 5 || (roles.includes("bodyguard") && roles.includes("nightGuest"))) continue;
  eightWolfRecheck.push({ id: roles.join("+"), roles });
  if (roles.includes("tanner"))
    eightWolfRecheck.push({
      id: roles.join("+") + "+voteOnly",
      roles,
      settings: { tanner: "voteOnly" },
    });
}
const eightWolfRecheckEdges: [Variant, ...Variant[]] = [
  { id: "basic", roles: [] },
  { id: "witch", roles: ["witch"] },
  { id: "witchHunter", roles: ["witch", "hunter"] },
  { id: "coreBodyguard", roles: ["witch", "hunter", "idiot", "bodyguard"] },
  { id: "coreNightGuest", roles: ["witch", "hunter", "idiot", "nightGuest"] },
  { id: "coreApprentice", roles: ["witch", "hunter", "idiot", "bodyguard", "apprenticeSeer"] },
  { id: "coreToughGuy", roles: ["witch", "hunter", "idiot", "bodyguard", "toughGuy"] },
  { id: "coreLovers", roles: ["witch", "hunter", "idiot", "bodyguard", "cupid"] },
  { id: "coreTanner", roles: ["witch", "hunter", "idiot", "bodyguard", "tanner"] },
  {
    id: "tannerVoteOnly",
    roles: ["witch", "hunter", "idiot", "bodyguard", "tanner"],
    settings: { tanner: "voteOnly" },
  },
];
it.each([1, 2])(
  "rechecks eight-player balance with %i wolves",
  (wolfCount) => {
    const withWolves = (variants: readonly [Variant, ...Variant[]]): [Variant, ...Variant[]] =>
      variants.map((v) => ({
        ...v,
        settings: { ...v.settings, wolfCount, wolfCountMode: "balanced" as const },
      })) as [Variant, ...Variant[]];
    compareVariants(
      8,
      "eightRecheckCommon-" + wolfCount,
      withWolves(eightWolfRecheck),
      sevenPlayerModels,
      128,
      false,
    );
    compareVariants(
      8,
      "eightRecheckEdges-" + wolfCount,
      withWolves(eightWolfRecheckEdges),
      sevenPlayerModels,
      4000,
      false,
    );
  },
  180_000,
);

function smallTableRecheckVariants(players: number, maximumWolves: number) {
  const pool = availableWerewolfRoles(players);
  const eligible: Variant[] = [];
  for (let mask = 1; mask < 2 ** pool.length; mask++) {
    const roles = pool.filter((_, index) => Boolean(mask & (1 << index)));
    if (
      roles.length > players - maximumWolves - 1 ||
      (roles.includes("bodyguard") && roles.includes("nightGuest")) ||
      (roles.includes("witch") && roles.includes("magician"))
    )
      continue;
    eligible.push({ id: roles.join("+"), roles });
    if (roles.includes("tanner"))
      eligible.push({ id: roles.join("+") + "+voteOnly", roles, settings: { tanner: "voteOnly" } });
  }
  const random = randomFrom(58000 + players);
  for (let i = eligible.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [eligible[i], eligible[j]] = [eligible[j]!, eligible[i]!];
  }
  const sample: [Variant, ...Variant[]] = [{ id: "basic", roles: [] }, ...eligible.slice(0, 256)];
  return sample;
}
const smallTableCandidates = [
  { players: 7, counts: [1, 2] },
  { players: 9, counts: [1, 2, 3] },
  { players: 10, counts: [1, 2, 3] },
  { players: 11, counts: [2, 3] },
] as const;
const smallTableRechecks = smallTableCandidates.flatMap(({ players, counts }) =>
  counts.map((wolfCount) => ({ players, wolfCount, maximumWolves: Math.max(...counts) })),
);
it.each(smallTableRechecks)(
  "rechecks fixed small-table counts at $players players with $wolfCount wolves",
  ({ players, wolfCount, maximumWolves }) => {
    const pool = availableWerewolfRoles(players);
    const common = smallTableRecheckVariants(players, maximumWolves);
    const edges: [Variant, ...Variant[]] = [{ id: "basic", roles: [] }];
    const additions: Variant[] = [
      ...eightWolfRecheckEdges.slice(1),
      { id: "mayor", roles: ["witch", "hunter", "idiot", "bodyguard", "mayor"] },
      { id: "spellcaster", roles: ["witch", "hunter", "idiot", "bodyguard", "spellcaster"] },
      {
        id: "investigator",
        roles: ["witch", "hunter", "idiot", "bodyguard", "paranormalInvestigator"],
      },
      { id: "magician", roles: ["magician"] },
      { id: "magicianCore", roles: ["magician", "hunter", "idiot", "bodyguard"] },
      {
        id: "denseInformation",
        roles: [
          "witch",
          "hunter",
          "bodyguard",
          "apprenticeSeer",
          "paranormalInvestigator",
          "mayor",
        ],
      },
    ];
    edges.push(
      ...additions.filter(
        (v) =>
          v.roles.length <= players - maximumWolves - 1 && v.roles.every((r) => pool.includes(r)),
      ),
    );
    const withWolves = (variants: readonly [Variant, ...Variant[]]): [Variant, ...Variant[]] =>
      variants.map((v) => ({
        ...v,
        settings: { ...v.settings, wolfCount, wolfCountMode: "balanced" as const },
      })) as [Variant, ...Variant[]];
    compareVariants(
      players,
      "smallFixedCommon-" + wolfCount,
      withWolves(common),
      sevenPlayerModels,
      128,
      false,
    );
    compareVariants(
      players,
      "smallFixedEdges-" + wolfCount,
      withWolves(edges),
      sevenPlayerModels,
      4000,
      false,
    );
    const variants: [Variant, ...Variant[]] = [{ id: "basic", roles: [] }];
    const core: WerewolfSpecialRole[] = ["witch", "hunter", "idiot", "bodyguard"];
    if (players >= 9 && wolfCount >= 2)
      variants.push(
        { id: "drunkBasic", roles: [], settings: { drunk: true } },
        { id: "drunkCore", roles: core, settings: { drunk: true } },
      );
    if (players >= 10)
      variants.push(
        { id: "amuletBasic", roles: [], settings: { amulet: true } },
        { id: "amuletCore", roles: core, settings: { amulet: true } },
        {
          id: "mayorHammer",
          roles: ["witch", "hunter", "bodyguard", "mayor"],
          settings: { mayor: "hammer" },
        },
        {
          id: "mayorDouble",
          roles: ["witch", "hunter", "bodyguard", "mayor"],
          settings: { mayor: "doubleVote" },
        },
      );
    if (players >= 9)
      variants.push(
        {
          id: "selfSilence",
          roles: ["witch", "hunter", "bodyguard", "spellcaster"],
          settings: { allowSelfSilence: true },
        },
        {
          id: "noSelfSilence",
          roles: ["witch", "hunter", "bodyguard", "spellcaster"],
          settings: { allowSelfSilence: false },
        },
      );
    if (variants.length > 1)
      compareVariants(
        players,
        "smallFixedOptions-" + wolfCount,
        withWolves(variants),
        sevenPlayerModels,
        2000,
        false,
      );
  },
  180_000,
);
