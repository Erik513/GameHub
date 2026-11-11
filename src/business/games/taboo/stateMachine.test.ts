import { describe, expect, it } from "vitest";
import type { GameConfiguration, TabooCard } from "./model";
import { createTabooGame, transitionTaboo, type TabooEvent } from "./stateMachine";

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
    const bothRight = transitionTaboo(wrong, { ...revise, cardId: second.id, outcome: "correct" });
    expect(bothRight).toMatchObject({ roundPoints: 1, scores: [1, 0, 0] });
    expect(bothRight).toMatchObject({ resolvedCardIds: [card.id, second.id] });

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
});
