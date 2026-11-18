import { describe, expect, it } from "vitest";
import type { GameConfiguration, TabooCard } from "./model";
import {
  createTabooGame,
  getNextTabooTurn,
  reviseOutcome,
  tiebreakFollows,
  transitionTaboo,
  type TabooEvent,
  type TabooState,
} from "./stateMachine";

const configuration: GameConfiguration = {
  teams: [
    { id: "a", name: "Owls" },
    { id: "b", name: "Foxes" },
    { id: "c", name: "Bears" },
  ],
  roundDurationSeconds: 60,
  roundsPerTeam: 2,
  cardLanguage: "en",
};
const card: TabooCard = {
  id: "one",
  term: "Moon",
  forbiddenWords: ["night", "sky", "orbit", "space"],
  language: "en",
  difficulty: "easy",
  categoryId: "space",
};
const start = { type: "startRound", card } as const;
const finish = { type: "finishGame" } as const;

function setup(input = configuration) {
  const result = createTabooGame(input);
  if (!result.valid) throw new Error("Invalid test setup");
  return result.value;
}

describe("Taboo state machine", () => {
  it("records results and lets a finished round be revised only for its own turn", () => {
    const turn = { round: 1, teamIndex: 0 };
    const second = { ...card, id: "second" };
    const revise = {
      type: "reviseResult",
      turn,
      cardId: card.id,
      outcome: "forbiddenWord",
    } as const;
    const initial = setup();
    expect(transitionTaboo(initial, revise)).toBe(initial);
    const running = transitionTaboo(initial, { ...start, remainingCards: [second] });
    expect(transitionTaboo(running, revise)).toBe(running);
    const resolve = { type: "resolveCard", turn, cardId: card.id, outcome: "correct" } as const;
    const afterFirst = transitionTaboo(running, resolve);
    const ended = transitionTaboo(afterFirst, {
      ...resolve,
      cardId: second.id,
      outcome: "forbiddenWord",
    });
    expect(ended).toMatchObject({
      status: "roundEnded",
      roundPoints: 1,
      scores: [1, 0, 0],
      results: [
        { card: { id: card.id }, outcome: "correct" },
        { card: { id: second.id }, outcome: "forbiddenWord" },
      ],
    });
    expect(transitionTaboo(ended, { ...revise, turn: { round: 2, teamIndex: 0 } })).toBe(ended);
    expect(transitionTaboo(ended, { ...revise, turn: { round: 1, teamIndex: 1 } })).toBe(ended);
    expect(transitionTaboo(ended, { ...revise, cardId: "unknown" })).toBe(ended);
    expect(transitionTaboo(ended, { ...revise, outcome: "correct" })).toBe(ended);
    const wrong = transitionTaboo(ended, revise);
    expect(wrong).toMatchObject({ roundPoints: 0, scores: [0, 0, 0] });
    // A card that was marked wrong during the turn can never become correct afterwards.
    expect(transitionTaboo(wrong, { ...revise, cardId: second.id, outcome: "correct" })).toBe(
      wrong,
    );
    // A card that was marked correct can be turned wrong and back again.
    const back = transitionTaboo(wrong, { ...revise, outcome: "correct" });
    expect(back).toMatchObject({ roundPoints: 1, scores: [1, 0, 0] });
    expect(back).toMatchObject({ resolvedCardIds: [card.id, second.id] });

    // Skipped cards stay in the list but are final.
    const third = { ...card, id: "third" };
    const skippedRound = transitionTaboo(
      transitionTaboo(transitionTaboo(setup(), { ...start, remainingCards: [third] }), {
        ...resolve,
        outcome: "skipped",
      }),
      { ...resolve, cardId: third.id, outcome: "correct" },
    );
    expect(skippedRound).toMatchObject({ status: "roundEnded", scores: [1, 0, 0] });
    expect(transitionTaboo(skippedRound, { ...revise, outcome: "correct" })).toBe(skippedRound);
    expect(transitionTaboo(skippedRound, { ...revise, cardId: third.id, outcome: "skipped" })).toBe(
      skippedRound,
    );
  });

  it("awards a sole win to the second team after one round per team", () => {
    const initial = setup({
      ...configuration,
      teams: configuration.teams.slice(0, 2),
      roundsPerTeam: 1,
    });
    const first = transitionTaboo(initial, start);
    const firstEnded = transitionTaboo(first, {
      type: "endRound",
      turn: { round: 1, teamIndex: 0 },
    });
    expect(transitionTaboo(firstEnded, finish)).toBe(firstEnded);
    const nextCard = { ...card, id: "next" };
    const second = transitionTaboo(firstEnded, { type: "startRound", card: nextCard });
    expect(second).toMatchObject({ status: "roundRunning", turn: { round: 1, teamIndex: 1 } });
    const secondEnded = transitionTaboo(second, {
      type: "resolveCard",
      turn: { round: 1, teamIndex: 1 },
      cardId: nextCard.id,
      outcome: "correct",
    });
    expect(transitionTaboo(secondEnded, start)).toBe(secondEnded);
    expect(transitionTaboo(secondEnded, finish)).toMatchObject({
      status: "gameEnded",
      scores: [0, 1],
      winnerIds: ["b"],
    });
  });

  it("scores only correct answers, advances cards and ends the round when exhausted", () => {
    const turn = { round: 1, teamIndex: 0 };
    const second = { ...card, id: "two" };
    const third = { ...card, id: "three" };
    const initial = setup();
    expect(transitionTaboo(initial, { ...start, remainingCards: [card] })).toBe(initial);
    const running = transitionTaboo(initial, { ...start, remainingCards: [second, third] });
    const correct = { type: "resolveCard", turn, cardId: card.id, outcome: "correct" } as const;
    expect(transitionTaboo(initial, correct)).toBe(initial);
    expect(transitionTaboo(running, { ...correct, turn: { ...turn, round: 2 } })).toBe(running);
    expect(transitionTaboo(running, { ...correct, turn: { ...turn, teamIndex: 1 } })).toBe(running);
    const afterCorrect = transitionTaboo(running, correct);
    expect(afterCorrect).toMatchObject({ card: second, scores: [1, 0, 0] });
    expect(transitionTaboo(afterCorrect, correct)).toBe(afterCorrect);
    const afterSkip = transitionTaboo(afterCorrect, {
      ...correct,
      cardId: second.id,
      outcome: "skipped",
    });
    expect(afterSkip).toMatchObject({ card: third, scores: [1, 0, 0] });
    const ended = transitionTaboo(afterSkip, {
      ...correct,
      cardId: third.id,
      outcome: "forbiddenWord",
    });
    expect(ended).toMatchObject({ status: "roundEnded", scores: [1, 0, 0] });
    expect(ended).not.toHaveProperty("card");
    expect(transitionTaboo(ended, { ...start, remainingCards: [card] })).toBe(ended);
    // Cards from earlier turns may be replayed in a later turn.
    expect(transitionTaboo(ended, start)).toMatchObject({ status: "roundRunning", card });
    const next = transitionTaboo(ended, { ...start, card: { ...card, id: "four" } });
    expect(next).toMatchObject({
      status: "roundRunning",
      scores: [1, 0, 0],
      turn: { teamIndex: 1 },
    });
  });

  it("rejects an invalid setup", () => {
    expect(createTabooGame({ ...configuration, teams: [] })).toMatchObject({ valid: false });
  });

  it("rejects cards with invalid content or the wrong language", () => {
    const state = setup();
    for (const replacement of [
      { ...card, term: " " },
      { ...card, language: "de" as const },
    ]) {
      expect(transitionTaboo(state, { ...start, card: replacement })).toBe(state);
    }
  });

  it("plays two rounds with three teams and rejects invalid transitions", () => {
    const first = setup();
    const endFirst = { type: "endRound", turn: { round: 1, teamIndex: 0 } } as const;
    for (const event of [finish, endFirst]) expect(transitionTaboo(first, event)).toBe(first);

    let state = transitionTaboo(first, start);
    const order = [
      [1, 0],
      [1, 1],
      [1, 2],
      [2, 0],
      [2, 1],
      [2, 2],
    ] as const;
    for (const [index, [round, teamIndex]] of order.entries()) {
      const turn = { round, teamIndex };
      expect(state).toMatchObject({
        status: "roundRunning",
        turn,
        card: { id: String(index || "one") },
      });
      for (const event of [
        start,
        finish,
        { type: "endRound", turn: { round: round - 1, teamIndex } },
        { type: "endRound", turn: { round, teamIndex: teamIndex - 1 } },
      ] satisfies TabooEvent[])
        expect(transitionTaboo(state, event)).toBe(state);
      const end = { type: "endRound", turn } as const;
      const ended = transitionTaboo(state, end);
      expect(ended).toMatchObject({ status: "roundEnded", turn });
      expect(ended).not.toHaveProperty("card");
      expect(transitionTaboo(ended, end)).toBe(ended);
      if (index < order.length - 1) {
        expect(transitionTaboo(ended, finish)).toBe(ended);
        state = transitionTaboo(ended, { ...start, card: { ...card, id: String(index + 1) } });
      } else {
        expect(transitionTaboo(ended, start)).toBe(ended);
        state = transitionTaboo(ended, finish);
        expect(state).toMatchObject({
          status: "gameEnded",
          turn,
          scores: [0, 0, 0],
          winnerIds: ["a", "b", "c"],
        });
      }
    }
    for (const event of [start, finish, endFirst])
      expect(transitionTaboo(state, event)).toBe(state);
  });

  it("appends valid new cards to a running round and ignores invalid or known ones", () => {
    const turn = { round: 1, teamIndex: 0 };
    const running = transitionTaboo(setup(), start);
    const fresh = { ...card, id: "two", term: "Sun" };
    const next = transitionTaboo(running, {
      type: "addCards",
      turn,
      cards: [fresh, card, { ...fresh, id: "bad", language: "de" }, { ...fresh, id: "" }],
    });
    expect(next.status === "roundRunning" && next.remainingCards.map((c) => c.id)).toEqual(["two"]);
    const unchanged = { type: "addCards", turn, cards: [card] } as const;
    expect(transitionTaboo(next, unchanged)).toBe(next);
    expect(transitionTaboo(next, { ...unchanged, turn: { round: 2, teamIndex: 0 } })).toBe(next);
    expect(transitionTaboo(setup(), { ...unchanged, cards: [fresh] })).toEqual(setup());
  });

  it("limits skips per turn and lets unlimited configurations skip freely", () => {
    const turn = { round: 1, teamIndex: 0 };
    const cards = ["a", "b", "c"].map((id) => ({ ...card, id }));
    const skip = (cardId: string) =>
      ({ type: "resolveCard", turn, cardId, outcome: "skipped" }) as const;
    const limited = transitionTaboo(setup({ ...configuration, skipsPerRound: 1 }), {
      type: "startRound",
      card: cards[0]!,
      remainingCards: [cards[1]!, cards[2]!],
    });
    const afterSkip = transitionTaboo(limited, skip("a"));
    expect(afterSkip).toMatchObject({ card: { id: "b" } });
    expect(transitionTaboo(afterSkip, skip("b"))).toBe(afterSkip);
    expect(
      transitionTaboo(afterSkip, { type: "resolveCard", turn, cardId: "b", outcome: "correct" }),
    ).toMatchObject({ card: { id: "c" }, scores: [1, 0, 0] });

    const none = transitionTaboo(setup({ ...configuration, skipsPerRound: 0 }), start);
    expect(transitionTaboo(none, skip(card.id))).toBe(none);

    const free = transitionTaboo(setup(), {
      type: "startRound",
      card: cards[0]!,
      remainingCards: [cards[1]!, cards[2]!],
    });
    expect(transitionTaboo(transitionTaboo(free, skip("a")), skip("b"))).toMatchObject({
      card: { id: "c" },
    });
  });

  it("restarts a running turn with new cards and without its points and results", () => {
    const turn = { round: 1, teamIndex: 0 };
    const second = { ...card, id: "second" };
    const third = { ...card, id: "third" };
    const fourth = { ...card, id: "fourth" };
    const restart = { type: "restartRound", turn, card: fourth } as const;
    const initial = setup();
    expect(transitionTaboo(initial, restart)).toBe(initial);
    const running = transitionTaboo(initial, { ...start, remainingCards: [second, third] });
    const scored = transitionTaboo(running, {
      type: "resolveCard",
      turn,
      cardId: card.id,
      outcome: "correct",
    });
    expect(scored).toMatchObject({ scores: [1, 0, 0], roundPoints: 1, card: { id: "second" } });
    expect(transitionTaboo(scored, { ...restart, turn: { round: 1, teamIndex: 1 } })).toBe(scored);
    // Cards already shown in this turn cannot come back after a restart.
    expect(transitionTaboo(scored, { ...restart, card: second })).toBe(scored);
    expect(transitionTaboo(scored, { ...restart, card })).toBe(scored);
    expect(transitionTaboo(scored, { ...restart, remainingCards: [fourth] })).toBe(scored);
    expect(transitionTaboo(scored, { ...restart, card: { ...fourth, language: "de" } })).toBe(
      scored,
    );
    const restarted = transitionTaboo(scored, { ...restart, remainingCards: [third] });
    expect(restarted).toMatchObject({
      status: "roundRunning",
      scores: [0, 0, 0],
      roundPoints: 0,
      results: [],
      card: { id: "fourth" },
      remainingCards: [{ id: "third" }],
      resolvedCardIds: [card.id, "second"],
    });
    const ended = transitionTaboo(restarted, { type: "endRound", turn });
    expect(transitionTaboo(ended, restart)).toBe(ended);
  });

  describe("tiebreak", () => {
    const makeCards = (prefix: string, count = 3) =>
      Array.from({ length: count }, (_, index) => ({ ...card, id: `${prefix}${index}` }));

    function tiedAtTheEnd(extra: Partial<GameConfiguration> = {}, teamCount = 2) {
      const config = {
        ...configuration,
        teams: [...configuration.teams, { id: "d", name: "Wolves" }].slice(0, teamCount),
        roundsPerTeam: 1,
        ...extra,
      };
      let state: TabooState = setup(config);
      for (let teamIndex = 0; teamIndex < teamCount; teamIndex += 1) {
        state = transitionTaboo(state, {
          type: "startRound",
          card: { ...card, id: `t${teamIndex}` },
        });
        state = transitionTaboo(state, { type: "endRound", turn: { round: 1, teamIndex } });
      }
      return state;
    }

    function startedAttempt(cards = makeCards("a")) {
      const tied = transitionTaboo(tiedAtTheEnd({ tiebreak: true }), finish);
      return transitionTaboo(tied, { type: "beginTiebreakAttempt", cards });
    }

    it("only plays a tiebreak when enabled and two or more teams share the lead", () => {
      expect(transitionTaboo(tiedAtTheEnd(), finish)).toMatchObject({
        status: "gameEnded",
        winnerIds: ["a", "b"],
      });
      expect(transitionTaboo(tiedAtTheEnd({ tiebreak: true }), finish)).toMatchObject({
        status: "tiebreak",
        contenders: [0, 1],
        attempts: [],
      });
      expect(transitionTaboo(tiedAtTheEnd({ tiebreak: true }, 3), finish)).toMatchObject({
        status: "tiebreak",
        contenders: [0, 1, 2],
      });
      // Four or more teams play off, too.
      expect(transitionTaboo(tiedAtTheEnd({ tiebreak: true }, 4), finish)).toMatchObject({
        status: "tiebreak",
        contenders: [0, 1, 2, 3],
      });
      // Without the tiebreak they share the win.
      expect(transitionTaboo(tiedAtTheEnd({}, 4), finish)).toMatchObject({
        status: "gameEnded",
        winnerIds: ["a", "b", "c", "d"],
      });
    });

    it("ignores tiebreak events outside of a tiebreak", () => {
      const initial = setup();
      const cards = makeCards("a");
      expect(transitionTaboo(initial, { type: "beginTiebreakAttempt", cards })).toBe(initial);
      expect(
        transitionTaboo(initial, { type: "answerTiebreak", outcome: "correct", elapsedMs: 1 }),
      ).toBe(initial);
      expect(transitionTaboo(initial, { type: "endTiebreakAttempt", elapsedMs: 1 })).toBe(initial);
    });

    it("validates the cards of an attempt and starts the next contender", () => {
      const tied = transitionTaboo(tiedAtTheEnd({ tiebreak: true }), finish);
      const begin = (cards: readonly TabooCard[]) =>
        transitionTaboo(tied, { type: "beginTiebreakAttempt", cards });
      expect(begin(makeCards("a", 2))).toBe(tied);
      expect(begin([...makeCards("a", 2), { ...card, id: "a0" }])).toBe(tied);
      expect(begin([...makeCards("a", 2), { ...card, id: "x", language: "de" }])).toBe(tied);
      expect(begin([...makeCards("a", 2), { ...card, id: "" }])).toBe(tied);
      const started = begin(makeCards("a"));
      expect(started).toMatchObject({
        active: { teamIndex: 0, index: 0, solved: 0, skipUsed: false, wrong: 0 },
        usedCardIds: ["a0", "a1", "a2"],
      });
      // An attempt is already running.
      expect(
        transitionTaboo(started, { type: "beginTiebreakAttempt", cards: makeCards("b") }),
      ).toBe(started);
    });

    it("replaces a card after a forbidden word or a skip, with a single skip allowed", () => {
      const started = startedAttempt();
      const answer = (outcome: "correct" | "skipped" | "forbiddenWord", extra = {}) =>
        ({ type: "answerTiebreak", outcome, elapsedMs: 4000, ...extra }) as const;
      const replacement = (id: string) => ({ replacement: { ...card, id } });
      // A replacement card is needed for both outcomes and may not be a used card.
      expect(transitionTaboo(started, answer("skipped"))).toBe(started);
      expect(transitionTaboo(started, answer("forbiddenWord"))).toBe(started);
      expect(transitionTaboo(started, answer("skipped", replacement("a0")))).toBe(started);
      expect(transitionTaboo(started, answer("forbiddenWord", replacement("a1")))).toBe(started);

      // A forbidden word only counts as wrong (no penalty) and can happen any number of times.
      const wrong = transitionTaboo(started, answer("forbiddenWord", replacement("w1")));
      expect(wrong).toMatchObject({
        active: {
          wrong: 1,
          index: 0,
          solved: 0,
          cards: [{ id: "w1" }, { id: "a1" }, { id: "a2" }],
        },
        usedCardIds: ["a0", "a1", "a2", "w1"],
      });
      const wrongAgain = transitionTaboo(wrong, answer("forbiddenWord", replacement("w2")));
      expect(wrongAgain).toMatchObject({ active: { wrong: 2, skipUsed: false } });

      const skipped = transitionTaboo(wrongAgain, answer("skipped", replacement("r1")));
      expect(skipped).toMatchObject({
        active: { skipUsed: true, wrong: 2, cards: [{ id: "r1" }, { id: "a1" }, { id: "a2" }] },
      });
      expect(transitionTaboo(skipped, answer("skipped", replacement("r2")))).toBe(skipped);
      expect(transitionTaboo(skipped, answer("forbiddenWord", replacement("w3")))).toMatchObject({
        active: { wrong: 3 },
      });
      expect(transitionTaboo(skipped, answer("correct"))).toMatchObject({
        active: { solved: 1, index: 1 },
      });
    });

    it("finishes an attempt after three solved cards", () => {
      const solve = (state: TabooState, elapsedMs: number) =>
        transitionTaboo(state, { type: "answerTiebreak", outcome: "correct", elapsedMs });
      let state = startedAttempt();
      state = solve(solve(state, 3000), 6000);
      state = transitionTaboo(state, {
        type: "answerTiebreak",
        outcome: "forbiddenWord",
        elapsedMs: 7000,
        replacement: { ...card, id: "w1" },
      });
      state = solve(state, 10000);
      expect(state).toMatchObject({
        status: "tiebreak",
        attempts: [{ teamIndex: 0, solved: 3, timeMs: 10000 }],
      });
      expect(state).not.toHaveProperty("active");
      // Answers without a running attempt do nothing.
      expect(solve(state, 1)).toBe(state);
      expect(transitionTaboo(state, { type: "endTiebreakAttempt", elapsedMs: 1 })).toBe(state);
    });

    it("ranks by solved cards first, then by time, and lets equal results share the win", () => {
      const play = (state: TabooState, prefix: string, solved: number, elapsedMs: number) => {
        let next = transitionTaboo(state, {
          type: "beginTiebreakAttempt",
          cards: makeCards(prefix),
        });
        for (let index = 0; index < solved; index += 1) {
          next = transitionTaboo(next, { type: "answerTiebreak", outcome: "correct", elapsedMs });
        }
        return next.status === "tiebreak" && next.active
          ? transitionTaboo(next, { type: "endTiebreakAttempt", elapsedMs })
          : next;
      };
      const tied = transitionTaboo(tiedAtTheEnd({ tiebreak: true }), finish);
      expect(play(play(tied, "a", 3, 20000), "b", 3, 15000)).toMatchObject({
        status: "gameEnded",
        winnerIds: ["b"],
        tiebreak: [
          { teamIndex: 0, solved: 3, timeMs: 20000 },
          { teamIndex: 1, solved: 3, timeMs: 15000 },
        ],
      });
      expect(play(play(tied, "a", 2, 90000), "b", 1, 10000)).toMatchObject({ winnerIds: ["a"] });
      expect(play(play(tied, "a", 3, 12000), "b", 3, 12000)).toMatchObject({
        winnerIds: ["a", "b"],
      });
      // Cards of the first attempt cannot be reused by the second contender.
      const first = play(tied, "a", 0, 1000);
      expect(transitionTaboo(first, { type: "beginTiebreakAttempt", cards: makeCards("a") })).toBe(
        first,
      );
    });
  });

  describe("unlimited rounds", () => {
    const unlimited = {
      ...configuration,
      teams: configuration.teams.slice(0, 2),
      roundsPerTeam: "unlimited",
    } as const;

    function afterTurn(state: TabooState, id: string, teamIndex: number, round: number) {
      const running = transitionTaboo(state, { type: "startRound", card: { ...card, id } });
      return transitionTaboo(running, { type: "endRound", turn: { round, teamIndex } });
    }

    it("always offers another turn, but lets the group finish after a completed round", () => {
      const first = afterTurn(setup(unlimited), "c1", 0, 1);
      // In the middle of a round the game cannot be finished.
      expect(transitionTaboo(first, finish)).toBe(first);
      expect(getNextTabooTurn(first as Extract<TabooState, { status: "roundEnded" }>)).toEqual({
        round: 1,
        teamIndex: 1,
      });
      const second = afterTurn(first, "c2", 1, 1);
      // After the last team of a round there is still a next turn, and finishing is allowed.
      expect(getNextTabooTurn(second as Extract<TabooState, { status: "roundEnded" }>)).toEqual({
        round: 2,
        teamIndex: 0,
      });
      const third = afterTurn(second, "c3", 0, 2);
      expect(third).toMatchObject({ status: "roundEnded", turn: { round: 2, teamIndex: 0 } });
      expect(transitionTaboo(second, finish)).toMatchObject({ status: "gameEnded" });
      expect(transitionTaboo(second, { ...start, card: { ...card, id: "c4" } })).toMatchObject({
        status: "roundRunning",
        turn: { round: 2, teamIndex: 0 },
      });
    });

    it("validates the rounds setting", () => {
      expect(createTabooGame(unlimited)).toMatchObject({ valid: true });
      expect(createTabooGame({ ...unlimited, roundsPerTeam: 0 })).toMatchObject({ valid: false });
      expect(
        createTabooGame({ ...unlimited, roundsPerTeam: "many" as unknown as "unlimited" }),
      ).toMatchObject({ valid: false });
    });
  });
});

describe("reviseOutcome", () => {
  const result = (outcome: "correct" | "forbiddenWord" | "skipped") => ({ card, outcome });

  it("lets a correct card become wrong and back, but never a wrong card become correct", () => {
    const wrong = reviseOutcome(result("correct"), "forbiddenWord");
    expect(wrong).toMatchObject({ outcome: "forbiddenWord", original: "correct" });
    expect(reviseOutcome(wrong!, "correct")).toMatchObject({
      outcome: "correct",
      original: "correct",
    });
    expect(reviseOutcome(result("forbiddenWord"), "correct")).toBeUndefined();
    // Also after it was corrected once, the original wrong mark stays.
    expect(
      reviseOutcome({ ...result("forbiddenWord"), original: "forbiddenWord" }, "correct"),
    ).toBe(undefined);
    // Skipped cards are final and nothing can become skipped.
    expect(reviseOutcome(result("skipped"), "correct")).toBeUndefined();
    expect(reviseOutcome(result("correct"), "skipped")).toBeUndefined();
    expect(reviseOutcome(result("correct"), "correct")).toBeUndefined();
  });
});

describe("tiebreakFollows", () => {
  const withTiebreak = { ...configuration, tiebreak: true };

  it("tells whether ending the game leads to a tiebreak", () => {
    // Two or more teams share the lead.
    expect(tiebreakFollows(withTiebreak, [2, 2, 0])).toBe(true);
    expect(tiebreakFollows(withTiebreak, [0, 0, 0])).toBe(true);
    // A single leader wins at once.
    expect(tiebreakFollows(withTiebreak, [3, 2, 2])).toBe(false);
    // The tiebreak is off.
    expect(tiebreakFollows(configuration, [2, 2, 0])).toBe(false);
    expect(tiebreakFollows({ ...configuration, tiebreak: false }, [2, 2, 0])).toBe(false);
  });

  it("agrees with the state machine", () => {
    const state = setup(withTiebreak);
    expect(tiebreakFollows(state.configuration, state.scores)).toBe(true);
  });
});
