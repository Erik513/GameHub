import { describe, expect, it } from "vitest";
import type { Difficulty, TabooCard } from "./model";
import {
  createRaceGame,
  getRaceNextTeam,
  comparableRaceTotals,
  getRaceTurn,
  maxRaceRounds,
  maxRaceTarget,
  racePlayedCardIds,
  raceRounds,
  raceTimeTenths,
  raceTotals,
  rankRaceTotals,
  transitionRace,
  type RaceConfiguration,
  type RaceEvent,
  type RaceState,
} from "./race";

const teams = [
  { id: "red", name: "Red" },
  { id: "blue", name: "Blue" },
];

const configuration: RaceConfiguration = { cardLanguage: "en", target: 2, teams };

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

function setup(overrides: Partial<RaceConfiguration> = {}): RaceState {
  const result = createRaceGame({ ...configuration, ...overrides });
  if (!result.valid) throw new Error("The test setup is invalid.");
  return result.value;
}

function run(state: RaceState, events: readonly RaceEvent[]): RaceState {
  return events.reduce(transitionRace, state);
}

describe("createRaceGame", () => {
  it("starts in the overview with no runs and no used cards", () => {
    const state = setup();
    expect(state).toMatchObject({ status: "overview", attempts: [], usedCardIds: [] });
    expect(getRaceNextTeam(state)).toBe(0);
  });

  it("cleans the teams and refuses invalid input", () => {
    const named = createRaceGame({
      ...configuration,
      teams: [
        { id: " red ", name: "  Red  ", players: [" Anna ", ""] },
        { id: "blue", name: "Blue" },
      ],
    });
    expect(named.valid && named.value.configuration.teams[0]).toEqual({
      id: "red",
      name: "Red",
      players: ["Anna"],
    });

    const issues = (input: Partial<RaceConfiguration>) => {
      const result = createRaceGame({ ...configuration, ...input });
      return result.valid ? [] : result.issues;
    };
    expect(issues({ teams: [teams[0]!] })).toEqual([{ field: "teams", code: "minimum_two" }]);
    expect(issues({ teams: [teams[0]!, { id: "x", name: "red" }] })).toContainEqual({
      field: "teams.name",
      code: "duplicate",
    });
    expect(issues({ target: 0 })).toEqual([{ field: "target", code: "positive_integer_required" }]);
    expect(issues({ target: 2.5 })).toHaveLength(1);
    expect(issues({ target: maxRaceTarget + 1 })).toHaveLength(1);
    expect(issues({ cardLanguage: "fr" as "en" })).toEqual([
      { field: "cardLanguage", code: "unsupported_language" },
    ]);
  });
});

describe("a run", () => {
  it("only starts with exactly the target number of valid, unused cards of the card language", () => {
    const state = setup();
    expect(transitionRace(state, { type: "beginRun", cards: [card("a")] })).toBe(state);
    expect(transitionRace(state, { type: "beginRun", cards: [card("a"), card("a")] })).toBe(state);
    expect(
      transitionRace(state, { type: "beginRun", cards: [card("a"), card("b", "easy", "de")] }),
    ).toBe(state);
    expect(
      transitionRace(state, {
        type: "beginRun",
        cards: [card("a"), { ...card("b"), forbiddenWords: ["x", "x", "y", "z"] }],
      }),
    ).toBe(state);

    const running = transitionRace(state, { type: "beginRun", cards: [card("a"), card("b")] });
    expect(running).toMatchObject({
      status: "running",
      usedCardIds: ["a", "b"],
      active: { teamIndex: 0, solved: 0, skipUsed: false, wrong: 0 },
    });
    // A run cannot be started while another one is going on.
    expect(transitionRace(running, { type: "beginRun", cards: [card("c"), card("d")] })).toBe(
      running,
    );
  });

  it("ends when the target is reached and records the time of the last solved card", () => {
    const state = run(setup(), [
      { type: "beginRun", cards: [card("a"), card("b")] },
      { type: "answerCard", outcome: "correct", elapsedMs: 4000 },
      { type: "answerCard", outcome: "correct", elapsedMs: 9500 },
    ]);
    expect(state).toMatchObject({
      status: "overview",
      attempts: [{ teamIndex: 0, timeMs: 9500, skipUsed: false, wrong: 0 }],
    });
    expect(getRaceNextTeam(state)).toBe(1);
  });

  it("allows one skip per team with a replacement and counts wrong cards as lost time only", () => {
    const state = run(setup(), [
      { type: "beginRun", cards: [card("a"), card("b")] },
      { type: "answerCard", outcome: "skipped", elapsedMs: 1000, replacement: card("c") },
    ]);
    expect(state).toMatchObject({
      status: "running",
      usedCardIds: ["a", "b", "c"],
      active: { solved: 0, skipUsed: true, wrong: 0 },
    });
    if (state.status !== "running") throw new Error("expected a running state");
    expect(state.active.cards.map((item) => item.id)).toEqual(["c", "b"]);

    // The second skip of the same run and a skip without a card change nothing.
    expect(
      transitionRace(state, {
        type: "answerCard",
        outcome: "skipped",
        elapsedMs: 2000,
        replacement: card("d"),
      }),
    ).toBe(state);

    const wrong = transitionRace(state, {
      type: "answerCard",
      outcome: "forbiddenWord",
      elapsedMs: 2000,
      replacement: card("d"),
    });
    expect(wrong).toMatchObject({ status: "running", active: { wrong: 1, skipUsed: true } });
    if (wrong.status !== "running") throw new Error("expected a running state");
    expect(wrong.active.cards.map((item) => item.id)).toEqual(["d", "b"]);
    expect(
      transitionRace(wrong, { type: "answerCard", outcome: "forbiddenWord", elapsedMs: 3000 }),
    ).toBe(wrong);
  });

  it("refuses replacements that are used, invalid or in the wrong language", () => {
    const running = run(setup(), [{ type: "beginRun", cards: [card("a"), card("b")] }]);
    for (const replacement of [card("a"), card("b"), card("z", "easy", "de")]) {
      expect(
        transitionRace(running, {
          type: "answerCard",
          outcome: "skipped",
          elapsedMs: 1,
          replacement,
        }),
      ).toBe(running);
    }
  });

  it("ignores broken clock values and clamps negative ones to zero", () => {
    const running = run(setup(), [{ type: "beginRun", cards: [card("a"), card("b")] }]);
    for (const elapsedMs of [Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(transitionRace(running, { type: "answerCard", outcome: "correct", elapsedMs })).toBe(
        running,
      );
    }
    const done = run(running, [
      { type: "answerCard", outcome: "correct", elapsedMs: -5 },
      { type: "answerCard", outcome: "correct", elapsedMs: -1 },
    ]);
    expect(done).toMatchObject({ attempts: [{ timeMs: 0 }] });
  });

  it("throws a restarted run away but keeps its cards used", () => {
    const state = run(setup(), [
      { type: "beginRun", cards: [card("a"), card("b")] },
      { type: "answerCard", outcome: "correct", elapsedMs: 1000 },
      { type: "restartRun" },
    ]);
    expect(state).toEqual({
      status: "overview",
      configuration: expect.anything() as unknown,
      attempts: [],
      usedCardIds: ["a", "b"],
    });
    expect("active" in state).toBe(false);
    // The same team plays again, with different cards.
    expect(getRaceNextTeam(state)).toBe(0);
    expect(transitionRace(state, { type: "beginRun", cards: [card("a"), card("c")] })).toBe(state);
    expect(transitionRace(state, { type: "beginRun", cards: [card("c"), card("d")] }).status).toBe(
      "running",
    );
  });

  it("ignores events that do not fit the state", () => {
    const overview = setup();
    expect(transitionRace(overview, { type: "answerCard", outcome: "correct", elapsedMs: 1 })).toBe(
      overview,
    );
    expect(transitionRace(overview, { type: "restartRun" })).toBe(overview);
  });
});

describe("the end of the game", () => {
  const play = (timesMs: readonly number[]): RaceState => {
    let state = setup({ teams: [...teams, { id: "green", name: "Green" }], target: 1 });
    timesMs.forEach((timeMs, index) => {
      state = run(state, [
        { type: "beginRun", cards: [card(`card-${index}`)] },
        { type: "answerCard", outcome: "correct", elapsedMs: timeMs },
      ]);
    });
    return state;
  };

  it("lets the shortest time win", () => {
    const state = play([9000, 7000, 8000]);
    expect(state).toMatchObject({ status: "finished", winnerIds: ["blue"] });
    expect(getRaceNextTeam(state)).toBeUndefined();
    expect(
      rankRaceTotals(raceTotals(state.configuration, state.attempts)).map(
        (total) => total.teamIndex,
      ),
    ).toEqual([1, 2, 0]);
  });

  it("shares the win when the times are equal to the tenth of a second", () => {
    const state = play([7040, 7000, 9000]);
    expect(state).toMatchObject({ status: "finished", winnerIds: ["red", "blue"] });
    // Times a tenth apart are no tie.
    expect(play([7000, 7100, 9000])).toMatchObject({ winnerIds: ["red"] });
  });

  it("is final", () => {
    const state = play([1000, 2000, 3000]);
    expect(transitionRace(state, { type: "restartRun" })).toBe(state);
    expect(transitionRace(state, { type: "beginRun", cards: [card("late")] })).toBe(state);
  });
});

describe("raceTimeTenths", () => {
  it("rounds to tenths of a second", () => {
    expect(raceTimeTenths(7040)).toBe(70);
    expect(raceTimeTenths(7050)).toBe(71);
  });
});

describe("a game with several rounds", () => {
  /** Plays the given runs (milliseconds, in playing order); every run is one card of the card "round-team". */
  const play = (timesMs: readonly number[], rounds = 2): RaceState => {
    let state = setup({ target: 1, rounds });
    timesMs.forEach((timeMs, index) => {
      state = run(state, [
        { type: "beginRun", cards: [card(`card-${index}`)] },
        { type: "answerCard", outcome: "correct", elapsedMs: timeMs },
      ]);
    });
    return state;
  };

  it("has one round when nothing is set and validates the number of rounds", () => {
    expect(raceRounds(configuration)).toBe(1);
    expect(raceRounds({ ...configuration, rounds: 4 })).toBe(4);
    for (const rounds of [0, -1, 1.5, Number.NaN, maxRaceRounds + 1]) {
      expect(createRaceGame({ ...configuration, rounds })).toEqual({
        valid: false,
        issues: [{ field: "rounds", code: "positive_integer_required" }],
      });
    }
    expect(createRaceGame({ ...configuration, rounds: maxRaceRounds }).valid).toBe(true);
  });

  it("lets every team play once per round and ends after the last run of the last round", () => {
    let state = setup({ target: 1, rounds: 2 });
    const turns: unknown[] = [];
    for (let index = 0; index < 4; index += 1) {
      turns.push(getRaceTurn(state));
      state = run(state, [
        { type: "beginRun", cards: [card(`card-${index}`)] },
        { type: "answerCard", outcome: "correct", elapsedMs: 1000 },
      ]);
    }
    expect(turns).toEqual([
      { round: 1, teamIndex: 0 },
      { round: 1, teamIndex: 1 },
      { round: 2, teamIndex: 0 },
      { round: 2, teamIndex: 1 },
    ]);
    expect(state.status).toBe("finished");
    expect(getRaceTurn(state)).toBeUndefined();
    expect(state.attempts.map((attempt) => [attempt.round, attempt.teamIndex])).toEqual([
      [1, 0],
      [1, 1],
      [2, 0],
      [2, 1],
    ]);
  });

  it("goes back to the overview between the runs and starts the next round with the first team", () => {
    const afterRound = play([1000, 2000]);
    expect(afterRound.status).toBe("overview");
    expect(getRaceTurn(afterRound)).toEqual({ round: 2, teamIndex: 0 });
  });

  it("adds the times of all runs and lets the shortest total time win", () => {
    // Red: 9.0 s + 3.0 s = 12.0 s, Blue: 8.0 s + 5.0 s = 13.0 s. Blue won the first round only.
    const state = play([9000, 8000, 3000, 5000]);
    expect(state).toMatchObject({ status: "finished", winnerIds: ["red"] });
    const totals = raceTotals(state.configuration, state.attempts);
    expect(totals).toEqual([
      { teamIndex: 0, runs: 2, solved: 2, tenths: 120 },
      { teamIndex: 1, runs: 2, solved: 2, tenths: 130 },
    ]);
    expect(rankRaceTotals(totals).map((total) => total.teamIndex)).toEqual([0, 1]);
  });

  it("adds the times as they are shown, so the total equals the sum of the shown times", () => {
    // 3.04 s is shown as 3.0 s, so two such runs make 6.0 s and not 6.1 s.
    const state = play([3040, 3000, 3040, 3000]);
    expect(raceTotals(state.configuration, state.attempts)[0]?.tenths).toBe(60);
    // The same total is a tie, however the single times fall.
    expect(state).toMatchObject({ winnerIds: ["red", "blue"] });
  });

  it("counts the solved cards before the time: a team with fewer solved cards is behind", () => {
    const state = play([1000, 9000, 1000, 9000]);
    const revised = run(state, [
      {
        type: "reviseRunResult",
        teamIndex: 0,
        round: 1,
        cardId: "card-0",
        outcome: "forbiddenWord",
      },
    ]);
    expect(revised).toMatchObject({ winnerIds: ["blue"] });
    expect(raceTotals(revised.configuration, revised.attempts)[0]).toMatchObject({ solved: 1 });
  });

  it("corrects only the run of the given round", () => {
    const state = play([1000, 9000, 1000, 9000]);
    // Round 2 has no card-0, and a team's run of another round is not the run that was meant.
    const wrong = run(state, [
      {
        type: "reviseRunResult",
        teamIndex: 0,
        round: 3,
        cardId: "card-0",
        outcome: "forbiddenWord",
      },
    ]);
    expect(wrong).toBe(state);
    const other = run(state, [
      {
        type: "reviseRunResult",
        teamIndex: 0,
        round: 2,
        cardId: "card-0",
        outcome: "forbiddenWord",
      },
    ]);
    expect(other).toBe(state);
  });

  it("ranks only the teams that have played the same number of runs in the middle of a round", () => {
    const state = play([1000, 2000, 3000]);
    const totals = raceTotals(state.configuration, state.attempts);
    expect(totals.map((total) => total.runs)).toEqual([2, 1]);
    expect(comparableRaceTotals(totals).map((total) => total.teamIndex)).toEqual([0]);
    expect(comparableRaceTotals(raceTotals(configuration, []))).toEqual([]);
  });

  it("never gives a card twice in a round, but lets a new round use it again", () => {
    let state = setup({ target: 1, rounds: 2 });
    state = run(state, [
      { type: "beginRun", cards: [card("a")] },
      { type: "answerCard", outcome: "correct", elapsedMs: 1000 },
    ]);
    // The second team of the same round must not get the card of the first one.
    expect(transitionRace(state, { type: "beginRun", cards: [card("a")] })).toBe(state);
    state = run(state, [
      { type: "beginRun", cards: [card("b")] },
      { type: "answerCard", outcome: "correct", elapsedMs: 1000 },
    ]);
    // A new round starts with no card used; the cards of the earlier round count as played.
    expect(state.usedCardIds).toEqual([]);
    expect([...racePlayedCardIds(state)].sort()).toEqual(["a", "b"]);
    expect(transitionRace(state, { type: "beginRun", cards: [card("a")] }).status).toBe("running");
  });

  it("keeps the cards of a thrown away run used for the rest of the round", () => {
    let state = setup({ target: 1, rounds: 2 });
    state = run(state, [{ type: "beginRun", cards: [card("a")] }, { type: "restartRun" }]);
    expect(state.usedCardIds).toEqual(["a"]);
    expect(transitionRace(state, { type: "beginRun", cards: [card("a")] })).toBe(state);
  });
});
