import { describe, expect, it } from "vitest";
import {
  countdownRemainingTeams,
  createCountdownGame,
  rankCountdownTeams,
  transitionCountdown,
  type CountdownEvent,
  type CountdownState,
} from "./countdown";
import { countdownDifficultyForTurn, pickCountdownCard } from "./countdownCards";
import type { Difficulty, TabooCard } from "./model";

/** A small seeded random generator so a failing run can be repeated. */
function seeded(seed: number): () => number {
  let value = seed;
  return () => {
    value = (value * 1_664_525 + 1_013_904_223) % 4_294_967_296;
    return value / 4_294_967_296;
  };
}

const difficulties: readonly Difficulty[] = ["easy", "medium", "hard"];
const pool: readonly TabooCard[] = difficulties.flatMap((difficulty) =>
  Array.from({ length: 60 }, (_, index) => ({
    id: `${difficulty}-${index}`,
    language: "en" as const,
    term: `Term ${difficulty} ${index}`,
    forbiddenWords: [
      `a ${difficulty} ${index}`,
      `b ${difficulty} ${index}`,
      `c ${difficulty} ${index}`,
      `d ${difficulty} ${index}`,
    ] as const,
    categoryId: "everyday",
    difficulty,
  })),
);

describe("countdown invariants", () => {
  it.each(Array.from({ length: 60 }, (_, seed) => seed + 1))(
    "keeps the rules in the random game %i",
    (seed) => {
      const random = seeded(seed);
      const teamCount = 2 + Math.floor(random() * 4);
      const created = createCountdownGame({
        cardLanguage: "en",
        budgetMs: 5_000 + Math.floor(random() * 20_000),
        teams: Array.from({ length: teamCount }, (_, index) => ({
          id: `team-${index}`,
          name: `Team ${index}`,
        })),
      });
      if (!created.valid) throw new Error("The random setup is invalid.");
      let state: CountdownState = created.value;
      let events = 0;

      while (state.status !== "finished") {
        const before = state;
        const index = before.teamIndex;
        const own = before.teams[index];
        // Only a team that is still in the game is ever on the move.
        expect(own?.eliminated).toBe(false);
        const played = new Set(before.usedCardIds);
        const difficulty = countdownDifficultyForTurn(own?.turns ?? 0);
        const first = pickCountdownCard(pool, difficulty, played, played, random);
        if (!first) throw new Error("The pool is too small.");
        state = transitionCountdown(state, { type: "beginTurn", card: first });
        expect(state.status).toBe("running");

        // A turn lasts several actions; the clock only grows within the turn.
        let elapsedMs = 0;
        while (state.status === "running") {
          events += 1;
          if (events > 5_000) throw new Error("The game does not end.");
          elapsedMs += Math.floor(random() * 4_000);
          const roll = random();
          const shown = state.active.card;
          const taken = new Set(state.usedCardIds);
          const replacement = pickCountdownCard(pool, shown.difficulty, taken, taken, random);
          let event: CountdownEvent;
          if (roll < 0.05) event = { type: "timeUp" };
          else if (roll < 0.5) event = { type: "answerCard", outcome: "correct", elapsedMs };
          else if (roll < 0.75) {
            event = {
              type: "answerCard",
              outcome: "skipped",
              elapsedMs,
              ...(replacement && { replacement }),
            };
          } else {
            event = {
              type: "answerCard",
              outcome: "forbiddenWord",
              elapsedMs,
              ...(replacement && { replacement }),
            };
          }
          state = transitionCountdown(state, event);
        }

        // Accounts never grow and never go below zero; only the playing team was charged.
        state.teams.forEach((team, teamIndex) => {
          const old = before.teams[teamIndex];
          expect(team.remainingMs).toBeGreaterThanOrEqual(0);
          expect(team.remainingMs).toBeLessThanOrEqual(old?.remainingMs ?? 0);
          if (teamIndex !== index) expect(team).toEqual(old);
          expect(team.eliminated).toBe(team.remainingMs === 0);
          if (old?.skipUsed) expect(team.skipUsed).toBe(true);
        });
        // The order of the elimination has no team twice.
        expect(new Set(state.eliminationOrder).size).toBe(state.eliminationOrder.length);
      }

      expect(countdownRemainingTeams(state)).toHaveLength(1);
      const ranking = rankCountdownTeams(state);
      expect([...ranking].sort()).toEqual(Array.from({ length: teamCount }, (_, index) => index));
      expect(state.winnerIds).toEqual([`team-${ranking[0]}`]);
    },
  );
});
