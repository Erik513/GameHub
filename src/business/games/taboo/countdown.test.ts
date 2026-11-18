import { describe, expect, it } from "vitest";
import {
  countdownBudgetChoices,
  countdownRemainingTeams,
  createCountdownGame,
  getCountdownNextTeam,
  maxCountdownBudgetMs,
  rankCountdownTeams,
  transitionCountdown,
  type CountdownConfiguration,
  type CountdownEvent,
  type CountdownState,
} from "./countdown";
import {
  countdownCardShortage,
  countdownDifficultyForTurn,
  pickCountdownCard,
} from "./countdownCards";
import type { Difficulty, TabooCard } from "./model";

const teams = [
  { id: "red", name: "Red" },
  { id: "blue", name: "Blue" },
  { id: "green", name: "Green" },
];

const configuration: CountdownConfiguration = { cardLanguage: "en", budgetMs: 10_000, teams };

function card(
  id: string,
  difficulty: Difficulty = "easy",
  language: "en" | "de" = "en",
): TabooCard {
  return {
    id,
    language,
    term: `Term ${id}`,
    forbiddenWords: [`a ${id}`, `b ${id}`, `c ${id}`, `d ${id}`],
    categoryId: "everyday",
    difficulty,
  };
}

function setup(overrides: Partial<CountdownConfiguration> = {}): CountdownState {
  const result = createCountdownGame({ ...configuration, ...overrides });
  if (!result.valid) throw new Error("The test setup is invalid.");
  return result.value;
}

function play(state: CountdownState, events: readonly CountdownEvent[]): CountdownState {
  return events.reduce(transitionCountdown, state);
}

const begin = (id: string): CountdownEvent => ({ type: "beginTurn", card: card(id) });
const correct = (elapsedMs: number): CountdownEvent => ({
  type: "answerCard",
  outcome: "correct",
  elapsedMs,
});

describe("createCountdownGame", () => {
  it("gives every team the same account and starts in the overview", () => {
    const state = setup();
    expect(state.status).toBe("overview");
    expect(state.teams.map((team) => team.remainingMs)).toEqual([10_000, 10_000, 10_000]);
    expect(getCountdownNextTeam(state)).toBe(0);
    expect(countdownBudgetChoices).toEqual([120_000, 180_000, 300_000]);
  });

  it("rejects wrong accounts, languages and teams", () => {
    for (const budgetMs of [0, -1, 1.5, maxCountdownBudgetMs + 1, Number.NaN]) {
      expect(createCountdownGame({ ...configuration, budgetMs }).valid).toBe(false);
    }
    expect(
      createCountdownGame({ ...configuration, cardLanguage: "fr" as unknown as "en" }).valid,
    ).toBe(false);
    expect(createCountdownGame({ ...configuration, teams: [teams[0]!] }).valid).toBe(false);
  });
});

describe("a turn", () => {
  it("only runs down the account of the playing team and passes on to the next team", () => {
    const state = play(setup(), [begin("a"), correct(3_000)]);
    expect(state.status).toBe("overview");
    expect(state.teams.map((team) => team.remainingMs)).toEqual([7_000, 10_000, 10_000]);
    expect(state.teams[0]?.solved).toBe(1);
    expect(getCountdownNextTeam(state)).toBe(1);
  });

  it("ignores a card of the wrong language, a used card and a turn in the wrong status", () => {
    const state = setup();
    expect(transitionCountdown(state, { type: "beginTurn", card: card("a", "easy", "de") })).toBe(
      state,
    );
    expect(transitionCountdown(state, correct(1_000))).toBe(state);
    const running = play(state, [begin("a")]);
    expect(transitionCountdown(running, begin("b"))).toBe(running);
    // A game can last longer than the cards, so a card that was used may be played again.
    const next = play(running, [correct(1_000)]);
    expect(transitionCountdown(next, begin("a")).status).toBe("running");
  });

  it("replaces a wrong card and lets the clock run on", () => {
    const state = play(setup(), [
      begin("a"),
      { type: "answerCard", outcome: "forbiddenWord", elapsedMs: 2_000, replacement: card("b") },
    ]);
    expect(state.status).toBe("running");
    expect(state.status === "running" && state.active.card.id).toBe("b");
    // The account is only charged when the turn ends, with the whole clock of the turn.
    expect(state.teams[0]?.remainingMs).toBe(10_000);
    const done = transitionCountdown(state, correct(5_000));
    expect(done.teams[0]?.remainingMs).toBe(5_000);
  });

  it("does not replace a card by itself", () => {
    const running = play(setup(), [begin("a")]);
    const same: CountdownEvent = {
      type: "answerCard",
      outcome: "forbiddenWord",
      elapsedMs: 1_000,
      replacement: card("a"),
    };
    expect(transitionCountdown(running, same)).toBe(running);
  });

  it("allows one skip per team in the whole game and needs a replacement of the same difficulty", () => {
    const skip = (id: string, difficulty: Difficulty = "easy"): CountdownEvent => ({
      type: "answerCard",
      outcome: "skipped",
      elapsedMs: 1_000,
      replacement: card(id, difficulty),
    });
    const running = play(setup(), [begin("a")]);
    expect(transitionCountdown(running, { ...skip("b"), replacement: undefined } as never)).toBe(
      running,
    );
    expect(transitionCountdown(running, skip("b", "hard"))).toBe(running);
    const skipped = transitionCountdown(running, skip("b"));
    expect(skipped.teams[0]?.skipUsed).toBe(true);
    expect(transitionCountdown(skipped, skip("c"))).toBe(skipped);
    // The second turn of the same team may not skip again.
    const later = play(skipped, [
      correct(1_000),
      begin("d"),
      correct(1_000),
      begin("e"),
      correct(1_000),
      begin("f"),
    ]);
    expect(later.status === "running" && later.active.teamIndex).toBe(0);
    expect(transitionCountdown(later, skip("g"))).toBe(later);
  });

  it("ignores broken clock values", () => {
    const running = play(setup(), [begin("a")]);
    for (const elapsedMs of [Number.NaN, Number.POSITIVE_INFINITY, -1]) {
      expect(transitionCountdown(running, correct(elapsedMs))).toBe(running);
    }
  });
});

describe("running out of time", () => {
  it("eliminates a team whose clock reaches zero and skips it in the order", () => {
    const state = play(setup(), [begin("a"), { type: "timeUp" }]);
    expect(state.teams[0]).toMatchObject({ remainingMs: 0, eliminated: true, solved: 0 });
    expect(state.eliminationOrder).toEqual([0]);
    expect(countdownRemainingTeams(state)).toEqual([1, 2]);
    expect(getCountdownNextTeam(state)).toBe(1);
    const again = play(state, [begin("b"), correct(1_000), begin("c"), correct(1_000)]);
    expect(again.status === "overview" && again.teamIndex).toBe(1);
  });

  it("eliminates a team that presses a button after its account is used up", () => {
    const state = play(setup(), [begin("a"), correct(10_000)]);
    expect(state.teams[0]).toMatchObject({ eliminated: true, solved: 0, remainingMs: 0 });
  });

  it("finishes with the last team left and ranks by the order of dropping out", () => {
    const state = play(setup(), [
      begin("a"),
      { type: "timeUp" },
      begin("b"),
      correct(4_000),
      begin("c"),
      correct(7_000),
      begin("d"),
      { type: "timeUp" },
    ]);
    // Red dropped out first, then blue ran out of time in its second turn: green wins.
    expect(state.status).toBe("finished");
    if (state.status !== "finished") return;
    expect(state.winnerIds).toEqual(["green"]);
    expect(state.ranking).toEqual([2, 1, 0]);
    expect(rankCountdownTeams(state)).toEqual([2, 1, 0]);
    expect(getCountdownNextTeam(state)).toBeUndefined();
    expect(transitionCountdown(state, begin("z"))).toBe(state);
  });

  it("ranks the teams still in the game by the most time left", () => {
    const state = play(setup(), [begin("a"), correct(6_000), begin("b"), correct(2_000)]);
    expect(rankCountdownTeams(state)).toEqual([2, 1, 0]);
  });
});

describe("countdown cards", () => {
  const pool = [
    card("e1"),
    card("e2"),
    card("m1", "medium"),
    card("m2", "medium"),
    card("h1", "hard"),
  ];

  it("gives every team the same difficulty in its n-th turn", () => {
    expect([0, 1, 2, 3].map((turn) => countdownDifficultyForTurn(turn))).toEqual([
      "easy",
      "medium",
      "hard",
      "easy",
    ]);
    expect([0, 1, 2].map((turn) => countdownDifficultyForTurn(turn, ["hard", "easy"]))).toEqual([
      "easy",
      "hard",
      "easy",
    ]);
    expect(countdownDifficultyForTurn(1, [])).toBe("medium");
  });

  it("picks a card of exactly that difficulty, new cards first, never an excluded one", () => {
    expect(pickCountdownCard(pool, "medium", new Set(), new Set(["m1"]), () => 0)?.id).toBe("m2");
    expect(
      pickCountdownCard(pool, "medium", new Set(["m2"]), new Set(["m1"]), () => 0.99)?.id,
    ).toBe("m1");
    expect(pickCountdownCard(pool, "hard", new Set(["h1"]), new Set())).toBeUndefined();
  });

  it("reports the first difficulty with too few cards", () => {
    expect(countdownCardShortage(pool, 2)).toEqual({
      available: 2,
      difficulty: "easy",
      required: 8,
    });
    expect(countdownCardShortage(pool, 1, ["hard"])).toEqual({
      available: 1,
      difficulty: "hard",
      required: 4,
    });
    expect(countdownCardShortage(pool, 1, ["easy"])).toEqual({
      available: 2,
      difficulty: "easy",
      required: 4,
    });
    const many = Array.from({ length: 8 }, (_, index) => card(`x${index}`));
    expect(countdownCardShortage(many, 2, ["easy"])).toBeUndefined();
  });
});
