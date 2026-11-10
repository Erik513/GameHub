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
  forbiddenWords: ["night", "sky", "orbit"],
  language: "en",
  difficulty: "easy",
  categoryId: "space",
};
const start = { type: "startRound", card } as const;
const finish = { type: "finishGame" } as const;

function setup() {
  const result = createTabooGame(configuration);
  if (!result.valid) throw new Error("Invalid test setup");
  return result.value;
}

describe("Taboo state machine", () => {
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
        expect(state).toMatchObject({ status: "gameEnded", turn });
      }
    }
    for (const event of [start, finish, endFirst])
      expect(transitionTaboo(state, event)).toBe(state);
  });
});
