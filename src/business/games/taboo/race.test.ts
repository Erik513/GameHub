import { describe, expect, it } from "vitest";
import type { Difficulty, TabooCard } from "./model";
import {
  createRaceGame,
  getRaceNextTeam,
  maxRaceTarget,
  rankRaceAttempts,
  raceTimeTenths,
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
    expect(rankRaceAttempts(state.attempts).map((attempt) => attempt.teamIndex)).toEqual([1, 2, 0]);
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
