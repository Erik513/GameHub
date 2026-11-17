import { describe, expect, it } from "vitest";
import type { Difficulty, TabooCard } from "./model";
import {
  createRaceGame,
  comparableRaceTotals,
  racePlayedCardIds,
  raceRounds,
  raceTiebreakFollows,
  raceTotals,
  rankRaceTotals,
  transitionRace,
  type RaceEvent,
  type RaceState,
} from "./race";
import { pickRaceCards, pickRaceReplacement } from "./raceCards";
import { TIEBREAK_CARD_COUNT, tiebreakWinnerIds } from "./tiebreak";
import { pickTiebreakCard, pickTiebreakCards } from "./tiebreakCards";
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
  const rounds = raceRounds(configuration);
  expect(unique(usedCardIds)).toBe(true);
  expect(attempts.length).toBeLessThanOrEqual(teams.length * rounds);
  // The runs follow the playing order: round by round, every team once.
  expect(attempts.map((attempt) => attempt.teamIndex)).toEqual(
    attempts.map((_, index) => index % teams.length),
  );
  expect(attempts.map((attempt) => attempt.round)).toEqual(
    attempts.map((_, index) => Math.floor(index / teams.length) + 1),
  );
  for (const attempt of attempts) {
    expect(Number.isFinite(attempt.timeMs) && attempt.timeMs >= 0).toBe(true);
    expect(attempt.wrong).toBeGreaterThanOrEqual(0);
    expect(attempt.solved).toBeLessThanOrEqual(target);
  }
  if (state.status === "running") {
    const { active } = state;
    expect(active.teamIndex).toBe(attempts.length % teams.length);
    expect(active.round).toBe(Math.floor(attempts.length / teams.length) + 1);
    expect(active.cards).toHaveLength(target);
    expect(active.solved).toBeGreaterThanOrEqual(0);
    expect(active.solved).toBeLessThan(target);
    expect(unique(active.cards.map((card) => card.id))).toBe(true);
    expect(active.cards.every((card) => usedCardIds.includes(card.id))).toBe(true);
    expect(active.cards.every((card) => card.language === configuration.cardLanguage)).toBe(true);
    // The hard cards of a run are at the end, the run is never mixed up.
    const rank = { easy: 0, medium: 1, hard: 2 } as const;
    const order = active.cards.map((card) => rank[card.difficulty]);
    expect(order).toEqual([...order].sort((x, y) => x - y));
  } else {
    expect("active" in state).toBe(false);
  }
  if (state.status === "overview") expect(attempts.length).toBeLessThan(teams.length * rounds);
  if (state.status === "tiebreak") {
    const { tiebreak: part } = state;
    // Two or three teams play off; every run is played.
    expect(attempts).toHaveLength(teams.length * rounds);
    expect(part.contenders.length).toBeGreaterThanOrEqual(2);
    expect(part.contenders.length).toBeLessThanOrEqual(3);
    expect(unique(part.contenders.map(String))).toBe(true);
    expect(part.attempts.map((attempt) => attempt.teamIndex)).toEqual(
      part.contenders.slice(0, part.attempts.length),
    );
    expect(unique(part.usedCardIds)).toBe(true);
    if (part.active) {
      expect(part.active.teamIndex).toBe(part.contenders[part.attempts.length]);
      expect(part.active.cards).toHaveLength(TIEBREAK_CARD_COUNT);
      expect(part.active.solved).toBeLessThan(TIEBREAK_CARD_COUNT);
    }
  }
  if (state.status === "finished" && state.tiebreak) {
    // The tiebreak decided: its winners are the winners, and only tied teams played it.
    expect(state.winnerIds).toEqual(tiebreakWinnerIds(teams, state.tiebreak));
    expect(state.tiebreak.length).toBeGreaterThanOrEqual(2);
    expect(state.tiebreak.length).toBeLessThanOrEqual(3);
  } else if (state.status === "finished") {
    expect(attempts).toHaveLength(teams.length * rounds);
    const totals = comparableRaceTotals(raceTotals(configuration, attempts));
    const best = rankRaceTotals(totals)[0]!;
    const winners = totals.filter(
      (total) => total.solved === best.solved && total.tenths === best.tenths,
    );
    expect(state.winnerIds).toEqual(winners.map((total) => teams[total.teamIndex]?.id));
    expect(state.winnerIds.length).toBeGreaterThanOrEqual(1);
  }
}

/** How many random games reached the tiebreak and how many finished with it; the check below needs both. */
const reached = { tiebreak: 0, decided: 0 };

describe("the race mode keeps its rules whatever happens", () => {
  it.each(Array.from({ length: 60 }, (_, index) => index + 1))(
    "keeps every invariant with random play (seed %i)",
    (seed) => {
      const random = createRandom(seed);
      const target = 1 + Math.floor(random() * 6);
      const teamCount = 2 + Math.floor(random() * 3);
      const rounds = 1 + Math.floor(random() * 3);
      const coarse = random() < 0.5;
      // In some games every card is right and takes a second: all teams tie, so the tiebreak is played.
      const tieMode = random() < 0.4;
      const created = createRaceGame({
        cardLanguage: "en",
        target,
        rounds,
        tiebreak: random() < 0.7,
        teams: Array.from({ length: teamCount }, (_, index) => ({
          id: `team-${index}`,
          name: `Team ${index}`,
        })),
      });
      if (!created.valid) throw new Error("The random setup is invalid.");
      let state: RaceState = created.value;
      let clock = 0;
      let finishedAt = -1;

      /** The next event of a tiebreak: start it, begin and play the attempts, now and then correct one. */
      const tiebreakEvent = (current: RaceState): RaceEvent => {
        if (current.status === "finished") return { type: "startTiebreak" };
        if (current.status !== "tiebreak") return { type: "startTiebreak" };
        const part = current.tiebreak;
        const played = racePlayedCardIds(current);
        if (random() < 0.1 && part.attempts.length > 0) {
          const attempt = part.attempts[Math.floor(random() * part.attempts.length)]!;
          const result = attempt.results[Math.floor(random() * attempt.results.length)];
          return {
            type: "reviseTiebreakResult",
            teamIndex: attempt.teamIndex,
            cardId: result?.card.id ?? "none",
            outcome: outcomes[Math.floor(random() * outcomes.length)]!,
          };
        }
        if (!part.active) {
          const cards = pickTiebreakCards(pool, new Set(part.usedCardIds), played, random);
          return { type: "beginTiebreakAttempt", cards: cards ?? [] };
        }
        clock += coarse ? 1000 * Math.floor(random() * 3) : Math.floor(random() * 3000);
        if (random() < 0.1) return { type: "endTiebreakAttempt", elapsedMs: clock };
        const outcome = outcomes[Math.floor(random() * outcomes.length)]!;
        const shown = part.active.cards[part.active.index];
        const replacement =
          shown && outcome !== "correct"
            ? pickTiebreakCard(pool, shown.difficulty, new Set(part.usedCardIds), played, random)
            : undefined;
        return {
          type: "answerTiebreak",
          outcome,
          elapsedMs: clock,
          ...(replacement ? { replacement } : {}),
        };
      };

      for (let step = 0; step < 400; step += 1) {
        const before = state;
        let event: RaceEvent;
        const roll = random();
        const tiebreakGoing =
          state.status === "tiebreak" ||
          (state.status === "finished" && raceTiebreakFollows(state));
        if (tiebreakGoing && roll < 0.85) {
          event = tiebreakEvent(state);
        } else if (state.status === "overview" || (!tieMode && roll < 0.05)) {
          const cards = pickRaceCards(
            pool,
            target,
            new Set(state.usedCardIds),
            racePlayedCardIds(state),
            random,
          );
          event =
            roll < 0.1 && cards
              ? { type: "beginRun", cards: cards.slice(1) } // wrong length
              : { type: "beginRun", cards: cards ?? [] };
        } else if (!tieMode && roll < 0.1) {
          event = { type: "restartRun" };
        } else {
          clock += tieMode
            ? 1000
            : coarse
              ? 1000 * Math.floor(random() * 3)
              : Math.floor(random() * 3000);
          const outcome = tieMode ? "correct" : outcomes[Math.floor(random() * outcomes.length)]!;
          const current =
            state.status === "running" ? state.active.cards[state.active.solved] : undefined;
          const replacement =
            current && outcome !== "correct"
              ? pickRaceReplacement(
                  pool,
                  current,
                  new Set(state.usedCardIds),
                  racePlayedCardIds(state),
                  random,
                )
              : undefined;
          const broken = !tieMode && random() < 0.03;
          event = {
            type: "answerCard",
            outcome,
            elapsedMs: broken ? Number.NaN : clock,
            ...(replacement ? { replacement } : {}),
          };
        }
        state = transitionRace(state, event);
        checkInvariants(state);
        if (state.status === "tiebreak" && before.status !== "tiebreak") reached.tiebreak += 1;
        if (state.status === "finished" && state.tiebreak && before.status === "tiebreak")
          reached.decided += 1;
        // The attempts and the used cards only ever grow.
        expect(state.attempts.length).toBeGreaterThanOrEqual(before.attempts.length);
        // A run that was just finished completes a round now and then; the next round starts with no
        // used cards. Inside a round the used cards only grow.
        if (
          state.attempts.length > before.attempts.length &&
          state.attempts.length % state.configuration.teams.length === 0
        ) {
          expect(state.usedCardIds).toEqual([]);
        } else {
          expect(state.usedCardIds.length).toBeGreaterThanOrEqual(before.usedCardIds.length);
        }
        if (state.status === "running" && before.status === "running") {
          expect(state.active.solved).toBeGreaterThanOrEqual(0);
        }
        if (state.status === "overview") clock = 0;
        if (state.status === "finished" && finishedAt < 0) finishedAt = step;
        // A finished game only moves on into its tiebreak; nothing else changes it.
        if (before.status === "finished" && !tiebreakGoing) expect(state).toBe(before);
      }
    },
  );
});

it("reaches the tiebreak and ends games with it in the random games above", () => {
  // Without this the checks of the tiebreak would never run.
  expect(reached.tiebreak).toBeGreaterThan(0);
  expect(reached.decided).toBeGreaterThan(0);
});
