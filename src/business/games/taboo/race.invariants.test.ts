import { describe, expect, it } from "vitest";
import type { Difficulty, TabooCard } from "./model";
import {
  createRaceGame,
  raceTimeTenths,
  transitionRace,
  type RaceEvent,
  type RaceState,
} from "./race";
import { pickRaceCards, pickRaceReplacement } from "./raceCards";
import type { TabooOutcome } from "./stateMachine";

/** Small deterministic generator so failures are reproducible. */
function createRandom(seed: number) {
  let state = seed >>> 0 || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

const difficulties: readonly Difficulty[] = ["easy", "medium", "hard"];
const outcomes: readonly TabooOutcome[] = ["correct", "skipped", "forbiddenWord"];

const pool: readonly TabooCard[] = Array.from({ length: 90 }, (_, index) => ({
  id: `card-${index}`,
  language: "en",
  term: `Term ${index}`,
  forbiddenWords: [`a ${index}`, `b ${index}`, `c ${index}`, `d ${index}`],
  categoryId: "everyday",
  difficulty: difficulties[index % 3]!,
}));

const unique = (ids: readonly string[]) => new Set(ids).size === ids.length;

function checkInvariants(state: RaceState) {
  const { attempts, configuration, usedCardIds } = state;
  const { target, teams } = configuration;
  expect(unique(usedCardIds)).toBe(true);
  expect(attempts.length).toBeLessThanOrEqual(teams.length);
  expect(attempts.map((attempt) => attempt.teamIndex)).toEqual(attempts.map((_, index) => index));
  for (const attempt of attempts) {
    expect(Number.isFinite(attempt.timeMs) && attempt.timeMs >= 0).toBe(true);
    expect(attempt.wrong).toBeGreaterThanOrEqual(0);
  }
  if (state.status === "running") {
    const { active } = state;
    expect(active.teamIndex).toBe(attempts.length);
    expect(active.cards).toHaveLength(target);
    expect(active.solved).toBeGreaterThanOrEqual(0);
    expect(active.solved).toBeLessThan(target);
    expect(unique(active.cards.map((card) => card.id))).toBe(true);
    expect(active.cards.every((card) => usedCardIds.includes(card.id))).toBe(true);
    expect(active.cards.every((card) => card.language === configuration.cardLanguage)).toBe(true);
  } else {
    expect("active" in state).toBe(false);
  }
  if (state.status === "overview") expect(attempts.length).toBeLessThan(teams.length);
  if (state.status === "finished") {
    expect(attempts).toHaveLength(teams.length);
    const best = Math.min(...attempts.map((attempt) => raceTimeTenths(attempt.timeMs)));
    const winners = attempts.filter((attempt) => raceTimeTenths(attempt.timeMs) === best);
    expect(state.winnerIds).toEqual(winners.map((attempt) => teams[attempt.teamIndex]?.id));
    expect(state.winnerIds.length).toBeGreaterThanOrEqual(1);
  }
}

describe("the race mode keeps its rules whatever happens", () => {
  it.each(Array.from({ length: 60 }, (_, index) => index + 1))(
    "keeps every invariant with random play (seed %i)",
    (seed) => {
      const random = createRandom(seed);
      const target = 1 + Math.floor(random() * 6);
      const teamCount = 2 + Math.floor(random() * 3);
      const created = createRaceGame({
        cardLanguage: "en",
        target,
        teams: Array.from({ length: teamCount }, (_, index) => ({
          id: `team-${index}`,
          name: `Team ${index}`,
        })),
      });
      if (!created.valid) throw new Error("The random setup is invalid.");
      let state: RaceState = created.value;
      let clock = 0;
      let finishedAt = -1;

      for (let step = 0; step < 400; step += 1) {
        const before = state;
        let event: RaceEvent;
        const roll = random();
        if (state.status === "overview" || roll < 0.05) {
          const cards = pickRaceCards(pool, target, new Set(state.usedCardIds), new Set(), random);
          event =
            roll < 0.1 && cards
              ? { type: "beginRun", cards: cards.slice(1) } // wrong length
              : { type: "beginRun", cards: cards ?? [] };
        } else if (roll < 0.1) {
          event = { type: "restartRun" };
        } else {
          clock += Math.floor(random() * 3000);
          const outcome = outcomes[Math.floor(random() * outcomes.length)]!;
          const current =
            state.status === "running" ? state.active.cards[state.active.solved] : undefined;
          const replacement =
            current && outcome !== "correct"
              ? pickRaceReplacement(pool, current, new Set(state.usedCardIds), new Set(), random)
              : undefined;
          const broken = random() < 0.03;
          event = {
            type: "answerCard",
            outcome,
            elapsedMs: broken ? Number.NaN : clock,
            ...(replacement ? { replacement } : {}),
          };
        }
        state = transitionRace(state, event);
        checkInvariants(state);
        // The attempts and the used cards only ever grow.
        expect(state.attempts.length).toBeGreaterThanOrEqual(before.attempts.length);
        expect(state.usedCardIds.length).toBeGreaterThanOrEqual(before.usedCardIds.length);
        if (state.status === "running" && before.status === "running") {
          expect(state.active.solved).toBeGreaterThanOrEqual(0);
        }
        if (state.status === "overview") clock = 0;
        if (state.status === "finished" && finishedAt < 0) finishedAt = step;
        if (before.status === "finished") expect(state).toBe(before);
      }
    },
  );
});
