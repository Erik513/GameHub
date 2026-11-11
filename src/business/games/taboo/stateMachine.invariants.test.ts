import { describe, expect, it } from "vitest";
import type { Difficulty, GameConfiguration, TabooCard } from "./model";
import {
  TIEBREAK_CARD_COUNT,
  createTabooGame,
  transitionTaboo,
  type TabooEvent,
  type TabooOutcome,
  type TabooState,
} from "./stateMachine";

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

function unique(ids: readonly string[]) {
  return new Set(ids).size === ids.length;
}

function checkInvariants(state: TabooState) {
  const { configuration, scores, resolvedCardIds } = state;
  expect(scores).toHaveLength(configuration.teams.length);
  expect(scores.every((score) => Number.isInteger(score) && score >= 0)).toBe(true);
  expect(unique(resolvedCardIds)).toBe(true);

  if (state.status === "roundRunning" || state.status === "roundEnded") {
    const correct = state.results.filter((result) => result.outcome === "correct").length;
    expect(state.roundPoints).toBe(correct);
    expect(scores[state.turn.teamIndex] ?? -1).toBeGreaterThanOrEqual(state.roundPoints);
    expect(unique(state.results.map((result) => result.card.id))).toBe(true);
    const { skipsPerRound } = configuration;
    if (skipsPerRound !== undefined) {
      expect(state.results.filter((r) => r.outcome === "skipped").length).toBeLessThanOrEqual(
        skipsPerRound,
      );
    }
  }
  if (state.status === "roundRunning") {
    const ids = [state.card.id, ...state.remainingCards.map((card) => card.id)];
    expect(unique(ids)).toBe(true);
    for (const result of state.results) expect(ids).not.toContain(result.card.id);
  }
  if (state.status === "tiebreak") {
    expect(state.attempts.length).toBeLessThanOrEqual(state.contenders.length);
    expect(unique(state.usedCardIds)).toBe(true);
    if (state.active) {
      expect(state.active.teamIndex).toBe(state.contenders[state.attempts.length]);
      expect(state.active.index).toBeLessThan(TIEBREAK_CARD_COUNT);
      expect(state.active.solved).toBe(state.active.index);
      expect(state.active.cards).toHaveLength(TIEBREAK_CARD_COUNT);
      expect(unique(state.active.cards.map((card) => card.id))).toBe(true);
      expect(state.active.cards.every((card) => state.usedCardIds.includes(card.id))).toBe(true);
    }
    for (const attempt of state.attempts) {
      expect(Number.isFinite(attempt.timeMs) && attempt.timeMs >= 0).toBe(true);
      expect(attempt.solved).toBeGreaterThanOrEqual(0);
      expect(attempt.solved).toBeLessThanOrEqual(TIEBREAK_CARD_COUNT);
    }
  }
  if (state.status === "gameEnded") {
    const ids = configuration.teams.map((team) => team.id);
    expect(state.winnerIds.length).toBeGreaterThan(0);
    expect(state.winnerIds.every((id) => ids.includes(id))).toBe(true);
  }
}

const legalSuccessors: Record<TabooState["status"], readonly TabooState["status"][]> = {
  setup: ["setup", "roundRunning"],
  roundRunning: ["roundRunning", "roundEnded"],
  roundEnded: ["roundEnded", "roundRunning", "gameEnded", "tiebreak"],
  tiebreak: ["tiebreak", "gameEnded"],
  gameEnded: ["gameEnded"],
};

const coverage = {
  tiebreakStarted: 0,
  tiebreakFinished: 0,
  unlimited: 0,
  restarts: 0,
  revisions: 0,
};

function simulate(seed: number) {
  const random = createRandom(seed);
  const pick = <T>(items: readonly T[]): T => items[Math.floor(random() * items.length)] as T;
  let counter = 0;
  const makeCard = (difficulty: Difficulty = pick(difficulties)): TabooCard => {
    counter += 1;
    return {
      id: `c${counter}`,
      term: `Term ${counter}`,
      forbiddenWords: ["a", "b", "c", "d"],
      language: "en",
      difficulty,
      categoryId: "x",
    };
  };
  // A few cards are reused on purpose to provoke duplicate handling.
  const known: TabooCard[] = Array.from({ length: 6 }, () => makeCard());
  const anyCard = () => (random() < 0.3 ? pick(known) : makeCard());

  const teamCount = 2 + Math.floor(random() * 3);
  const config: GameConfiguration = {
    teams: Array.from({ length: teamCount }, (_, index) => ({
      id: `t${index}`,
      name: `Team ${index}`,
    })),
    roundDurationSeconds: 60,
    roundsPerTeam: random() < 0.25 ? "unlimited" : 1 + Math.floor(random() * 3),
    cardLanguage: "en",
    ...(random() < 0.7 ? { skipsPerRound: Math.floor(random() * 3) } : {}),
    ...(random() < 0.8 ? { tiebreak: true } : {}),
  };
  const created = createTabooGame(config);
  if (!created.valid) throw new Error("The generated configuration must be valid.");
  let state: TabooState = created.value;
  let reachedEnd = false;

  for (let step = 0; step < 300; step += 1) {
    const event = nextEvent(state);
    const next = transitionTaboo(state, event);
    // Invalid or rejected events must return the very same state object.
    if (next === state) {
      checkInvariants(next);
      continue;
    }
    expect(legalSuccessors[state.status]).toContain(next.status);
    if (state.status === "roundEnded" && next.status === "tiebreak") coverage.tiebreakStarted += 1;
    if (state.status === "tiebreak" && next.status === "gameEnded") coverage.tiebreakFinished += 1;
    if (event.type === "restartRound") coverage.restarts += 1;
    if (event.type === "reviseResult") coverage.revisions += 1;
    checkInvariants(next);
    state = next;
    if (state.status === "gameEnded") {
      reachedEnd = true;
      // The final state is terminal for every event.
      for (const probe of [nextEvent(state), { type: "finishGame" } as const]) {
        expect(transitionTaboo(state, probe)).toBe(state);
      }
      break;
    }
  }
  return reachedEnd;

  function nextEvent(current: TabooState): TabooEvent {
    const turn =
      current.status === "roundRunning" || current.status === "roundEnded"
        ? current.turn
        : { round: 1, teamIndex: 0 };
    const junk = random() < 0.12;
    if (junk) {
      // Events that do not fit the state or the turn.
      return pick<TabooEvent>([
        { type: "endRound", turn: { round: 9, teamIndex: 9 } },
        { type: "resolveCard", turn, cardId: "unknown", outcome: pick(outcomes) },
        { type: "reviseResult", turn, cardId: "unknown", outcome: "correct" },
        { type: "answerTiebreak", outcome: "correct", elapsedMs: Number.NaN },
        { type: "endTiebreakAttempt", elapsedMs: Number.POSITIVE_INFINITY },
        { type: "addCards", turn, cards: [pick(known)] },
        { type: "startRound", card: pick(known) },
      ]);
    }
    switch (current.status) {
      case "setup":
        return { type: "startRound", card: anyCard(), remainingCards: [anyCard(), anyCard()] };
      case "roundRunning": {
        const roll = random();
        if (roll < 0.62) {
          return { type: "resolveCard", turn, cardId: current.card.id, outcome: pick(outcomes) };
        }
        if (roll < 0.72) return { type: "endRound", turn };
        if (roll < 0.82) return { type: "addCards", turn, cards: [makeCard(), pick(known)] };
        if (roll < 0.92) {
          return { type: "restartRound", turn, card: makeCard(), remainingCards: [makeCard()] };
        }
        return { type: "restartRound", turn, card: current.card };
      }
      case "roundEnded": {
        const roll = random();
        if (roll < 0.25 && current.results.length > 0) {
          return {
            type: "reviseResult",
            turn,
            cardId: pick(current.results).card.id,
            outcome: pick(outcomes),
          };
        }
        if (roll < 0.6) return { type: "finishGame" };
        return { type: "startRound", card: anyCard(), remainingCards: [anyCard()] };
      }
      case "tiebreak": {
        if (!current.active) {
          return {
            type: "beginTiebreakAttempt",
            cards:
              random() < 0.2
                ? [pick(known)]
                : [makeCard("easy"), makeCard("medium"), makeCard("hard")],
          };
        }
        const roll = random();
        const elapsedMs = Math.floor(random() * 100000) - 500;
        if (roll < 0.5) return { type: "answerTiebreak", outcome: "correct", elapsedMs };
        if (roll < 0.9) {
          return {
            type: "answerTiebreak",
            outcome: pick(["skipped", "forbiddenWord"] as const),
            elapsedMs,
            ...(random() < 0.85 ? { replacement: makeCard() } : {}),
          };
        }
        return { type: "endTiebreakAttempt", elapsedMs };
      }
      case "gameEnded":
        return { type: "finishGame" };
    }
  }
}

describe("Taboo state machine invariants", () => {
  it("keeps scores, cards and tiebreak data consistent over random games", () => {
    let finished = 0;
    for (let seed = 1; seed <= 400; seed += 1) {
      if (simulate(seed)) finished += 1;
    }
    // Most simulated games run to the end, so the end-game paths are exercised too.
    expect(finished).toBeGreaterThan(150);
    // The interesting paths were really visited.
    expect(coverage.tiebreakStarted).toBeGreaterThan(5);
    expect(coverage.tiebreakFinished).toBeGreaterThan(5);
    expect(coverage.restarts).toBeGreaterThan(20);
    expect(coverage.revisions).toBeGreaterThan(20);
  });
});
