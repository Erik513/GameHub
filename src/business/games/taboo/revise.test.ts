import { describe, expect, it } from "vitest";
import type { Difficulty, TabooCard } from "./model";
import { createRaceGame, transitionRace, type RaceEvent, type RaceState } from "./race";
import { createTabooGame, transitionTaboo, type TabooState } from "./stateMachine";

function card(id: string, difficulty: Difficulty = "easy"): TabooCard {
  return {
    id,
    language: "en",
    term: `Term ${id}`,
    forbiddenWords: [`a ${id}`, `b ${id}`, `c ${id}`, `d ${id}`],
    categoryId: "everyday",
    difficulty,
  };
}

const teams = [
  { id: "red", name: "Red" },
  { id: "blue", name: "Blue" },
];

type Outcome = "correct" | "forbiddenWord" | "skipped";

describe("correcting a finished tiebreak attempt", () => {
  function tiebreakStart(): TabooState {
    const created = createTabooGame({
      cardLanguage: "en",
      roundDurationSeconds: 60,
      roundsPerTeam: 1,
      teams,
      tiebreak: true,
    });
    if (!created.valid) throw new Error("Invalid test setup");
    let state: TabooState = created.value;
    for (let teamIndex = 0; teamIndex < teams.length; teamIndex += 1) {
      state = transitionTaboo(state, { type: "startRound", card: card(`t${teamIndex}`) });
      state = transitionTaboo(state, { type: "endRound", turn: { round: 1, teamIndex } });
    }
    return transitionTaboo(state, { type: "finishGame" });
  }

  function playTiebreak(solvedByTeam: readonly number[], times: readonly number[]): TabooState {
    let state = tiebreakStart();
    solvedByTeam.forEach((solved, teamIndex) => {
      const prefix = `p${teamIndex}`;
      state = transitionTaboo(state, {
        type: "beginTiebreakAttempt",
        cards: [card(`${prefix}1`), card(`${prefix}2`), card(`${prefix}3`)],
      });
      const elapsedMs = times[teamIndex] ?? 0;
      for (let index = 0; index < solved; index += 1) {
        state = transitionTaboo(state, { type: "answerTiebreak", outcome: "correct", elapsedMs });
      }
      if (state.status === "tiebreak" && state.active) {
        state = transitionTaboo(state, { type: "endTiebreakAttempt", elapsedMs });
      }
    });
    return state;
  }

  const revise = (state: TabooState, teamIndex: number, cardId: string, outcome: Outcome) =>
    transitionTaboo(state, { type: "reviseTiebreakResult", teamIndex, cardId, outcome });

  it("records every card of an attempt with its outcome", () => {
    expect(playTiebreak([3, 3], [20000, 30000])).toMatchObject({
      status: "gameEnded",
      winnerIds: ["red"],
      tiebreak: [
        { results: [{ outcome: "correct" }, { outcome: "correct" }, { outcome: "correct" }] },
        {},
      ],
    });
  });

  it("shares the win when the times are the same to the tenth of a second", () => {
    // 11 249 ms and 11 151 ms are both shown as 11.2 s: the same time, so both win.
    expect(playTiebreak([3, 3], [11249, 11151])).toMatchObject({ winnerIds: ["red", "blue"] });
    // One tenth more is slower: the team with 11.3 s loses against 11.2 s.
    expect(playTiebreak([3, 3], [11349, 11151])).toMatchObject({ winnerIds: ["blue"] });
  });

  it("changes the ranking and the winner after the game ended", () => {
    const ended = playTiebreak([3, 3], [20000, 30000]);
    const fixed = revise(ended, 0, "p01", "forbiddenWord");
    expect(fixed).toMatchObject({
      status: "gameEnded",
      winnerIds: ["blue"],
      tiebreak: [
        { teamIndex: 0, solved: 2, timeMs: 20000 },
        { teamIndex: 1, solved: 3 },
      ],
    });
    // The mistake can be taken back.
    expect(revise(fixed, 0, "p01", "correct")).toMatchObject({ winnerIds: ["red"] });
  });

  it("can turn a lead into a shared win", () => {
    const ended = playTiebreak([2, 3], [10000, 10000]);
    expect(ended).toMatchObject({ winnerIds: ["blue"] });
    expect(revise(ended, 1, "p11", "forbiddenWord")).toMatchObject({ winnerIds: ["red", "blue"] });
  });

  it("corrects between two attempts", () => {
    const between = playTiebreak([3], [9000]);
    expect(between.status).toBe("tiebreak");
    expect(revise(between, 0, "p01", "forbiddenWord")).toMatchObject({
      status: "tiebreak",
      attempts: [{ teamIndex: 0, solved: 2 }],
    });
  });

  it("ignores unknown cards, equal outcomes and a skipped card", () => {
    const ended = playTiebreak([3, 3], [20000, 30000]);
    expect(revise(ended, 0, "p01", "correct")).toBe(ended);
    expect(revise(ended, 0, "p01", "skipped")).toBe(ended);
    expect(revise(ended, 0, "missing", "forbiddenWord")).toBe(ended);
    expect(revise(ended, 5, "p01", "forbiddenWord")).toBe(ended);
  });

  it("keeps skipped and forbidden cards in the record, and a forbidden card cannot count over the limit", () => {
    let state = tiebreakStart();
    state = transitionTaboo(state, {
      type: "beginTiebreakAttempt",
      cards: [card("x1"), card("x2"), card("x3")],
    });
    state = transitionTaboo(state, {
      type: "answerTiebreak",
      outcome: "skipped",
      elapsedMs: 1000,
      replacement: card("r1"),
    });
    state = transitionTaboo(state, {
      type: "answerTiebreak",
      outcome: "forbiddenWord",
      elapsedMs: 2000,
      replacement: card("r2"),
    });
    for (let index = 0; index < 3; index += 1) {
      state = transitionTaboo(state, {
        type: "answerTiebreak",
        outcome: "correct",
        elapsedMs: 3000,
      });
    }
    expect(state).toMatchObject({
      attempts: [
        {
          solved: 3,
          results: [
            { card: { id: "x1" }, outcome: "skipped" },
            { card: { id: "r1" }, outcome: "forbiddenWord" },
            { card: { id: "r2" }, outcome: "correct" },
            { card: { id: "x2" }, outcome: "correct" },
            { card: { id: "x3" }, outcome: "correct" },
          ],
        },
      ],
    });
  });

  it("does not let a forbidden card count when three other cards already do", () => {
    let state = tiebreakStart();
    state = transitionTaboo(state, {
      type: "beginTiebreakAttempt",
      cards: [card("w1"), card("w2"), card("w3")],
    });
    state = transitionTaboo(state, {
      type: "answerTiebreak",
      outcome: "forbiddenWord",
      elapsedMs: 1000,
      replacement: card("w4"),
    });
    for (let index = 0; index < 3; index += 1) {
      state = transitionTaboo(state, {
        type: "answerTiebreak",
        outcome: "correct",
        elapsedMs: 2000,
      });
    }
    expect(revise(state, 0, "w1", "correct")).toBe(state);
  });

  it("does nothing while an attempt is running or outside a tiebreak", () => {
    const running = transitionTaboo(tiebreakStart(), {
      type: "beginTiebreakAttempt",
      cards: [card("y1"), card("y2"), card("y3")],
    });
    expect(revise(running, 0, "y1", "forbiddenWord")).toBe(running);
    const setup = createTabooGame({
      cardLanguage: "en",
      roundDurationSeconds: 60,
      roundsPerTeam: 1,
      teams,
    });
    if (!setup.valid) throw new Error("Invalid test setup");
    expect(revise(setup.value, 0, "y1", "forbiddenWord")).toBe(setup.value);
  });
});

describe("correcting a finished run of the mode Auf Zeit", () => {
  function raceStart(): RaceState {
    const created = createRaceGame({ cardLanguage: "en", target: 2, teams });
    if (!created.valid) throw new Error("Invalid test setup");
    return created.value;
  }

  function playRace(timesMs: readonly number[]): RaceState {
    let state = raceStart();
    timesMs.forEach((timeMs, index) => {
      const events: RaceEvent[] = [
        { type: "beginRun", cards: [card(`r${index}1`), card(`r${index}2`)] },
        { type: "answerCard", outcome: "correct", elapsedMs: 1000 },
        { type: "answerCard", outcome: "correct", elapsedMs: timeMs },
      ];
      state = events.reduce(transitionRace, state);
    });
    return state;
  }

  const revise = (state: RaceState, teamIndex: number, cardId: string, outcome: Outcome) =>
    transitionRace(state, { type: "reviseRunResult", teamIndex, round: 1, cardId, outcome });

  it("records every card of a run and how many counted", () => {
    expect(playRace([9000, 12000])).toMatchObject({
      status: "finished",
      winnerIds: ["red"],
      attempts: [{ solved: 2, results: [{ outcome: "correct" }, { outcome: "correct" }] }, {}],
    });
  });

  it("ranks a team with fewer solved cards behind a slower team with all cards", () => {
    const fixed = revise(playRace([9000, 12000]), 0, "r01", "forbiddenWord");
    expect(fixed).toMatchObject({
      status: "finished",
      winnerIds: ["blue"],
      attempts: [
        { teamIndex: 0, solved: 1, timeMs: 9000 },
        { teamIndex: 1, solved: 2 },
      ],
    });
    // The mistake can be taken back.
    expect(revise(fixed, 0, "r01", "correct")).toMatchObject({ winnerIds: ["red"] });
  });

  it("corrects in the overview between two runs", () => {
    const between = playRace([9000]);
    expect(between.status).toBe("overview");
    expect(revise(between, 0, "r01", "forbiddenWord")).toMatchObject({
      status: "overview",
      attempts: [{ solved: 1 }],
    });
  });

  it("ignores unknown cards, equal outcomes, skipped cards and a running run", () => {
    const finished = playRace([9000, 12000]);
    expect(revise(finished, 0, "r01", "correct")).toBe(finished);
    expect(revise(finished, 0, "r01", "skipped")).toBe(finished);
    expect(revise(finished, 0, "missing", "forbiddenWord")).toBe(finished);
    expect(revise(finished, 7, "r01", "forbiddenWord")).toBe(finished);
    const running = transitionRace(raceStart(), {
      type: "beginRun",
      cards: [card("z1"), card("z2")],
    });
    expect(revise(running, 0, "z1", "forbiddenWord")).toBe(running);
  });

  it("keeps skipped and forbidden cards in the record and caps corrections at the target", () => {
    let state = transitionRace(raceStart(), {
      type: "beginRun",
      cards: [card("s1"), card("s2")],
    });
    state = transitionRace(state, {
      type: "answerCard",
      outcome: "skipped",
      elapsedMs: 500,
      replacement: card("s3"),
    });
    state = transitionRace(state, {
      type: "answerCard",
      outcome: "forbiddenWord",
      elapsedMs: 800,
      replacement: card("s4"),
    });
    state = transitionRace(state, { type: "answerCard", outcome: "correct", elapsedMs: 1500 });
    state = transitionRace(state, { type: "answerCard", outcome: "correct", elapsedMs: 2500 });
    expect(state).toMatchObject({
      attempts: [
        {
          solved: 2,
          results: [
            { card: { id: "s1" }, outcome: "skipped" },
            { card: { id: "s3" }, outcome: "forbiddenWord" },
            { card: { id: "s4" }, outcome: "correct" },
            { card: { id: "s2" }, outcome: "correct" },
          ],
        },
      ],
    });
    // The forbidden card cannot count while the target is already reached.
    expect(revise(state, 0, "s3", "correct")).toBe(state);
  });
});
