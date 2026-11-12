import { describe, expect, it } from "vitest";
import type { TabooCard } from "./model";
import {
  buildJudgePrompt,
  cardsToJudge,
  parseDropList,
  parseJudgeResponse,
  selectCardsToMerge,
  selectReviewSample,
  type PoolVerdicts,
} from "./poolReview";

const card = (
  id: string,
  categoryId = "food",
  difficulty: TabooCard["difficulty"] = "easy",
): TabooCard => ({
  id,
  language: "de",
  term: id.toUpperCase(),
  forbiddenWords: ["a", "b", "c", "d"],
  categoryId,
  difficulty,
});

describe("buildJudgePrompt", () => {
  it("describes the checks and passes the card as data", () => {
    const prompt = buildJudgePrompt(card("pizza"), "Food and drink");
    expect(prompt.system).toContain("in German");
    expect(prompt.system).toContain("Score 5 = good card");
    const data = JSON.parse(prompt.user) as Record<string, unknown>;
    expect(data).toMatchObject({
      language: "German",
      category: "Food and drink",
      difficulty: "easy",
      term: "PIZZA",
      forbiddenWords: ["a", "b", "c", "d"],
    });
  });
});

describe("parseJudgeResponse", () => {
  it("reads a score and a short problem, also from text around the JSON", () => {
    expect(parseJudgeResponse('{"score":4,"problem":" word  is weak "}')).toEqual({
      problem: "word is weak",
      score: 4,
    });
    expect(parseJudgeResponse('Sure: {"score":5}')).toEqual({ problem: "", score: 5 });
  });

  it("shortens a very long problem text", () => {
    const verdict = parseJudgeResponse(JSON.stringify({ score: 2, problem: "x".repeat(500) }));
    expect(verdict?.problem).toHaveLength(300);
  });

  it.each([
    ["no JSON", "fine"],
    ["broken JSON", "{ nope"],
    ["a list", "[1]"],
    ["a missing score", '{"problem":"x"}'],
    ["a score that is not a number", '{"score":"5"}'],
    ["a fractional score", '{"score":4.5}'],
    ["a score above 5", '{"score":6}'],
    ["a score below 1", '{"score":0}'],
  ])("gives nothing for %s", (_name, text) => {
    expect(parseJudgeResponse(text)).toBeUndefined();
  });
});

describe("cardsToJudge and selectReviewSample", () => {
  const cards = [
    card("a1"),
    card("a2"),
    card("a3"),
    card("b1", "food", "hard"),
    card("b2", "food", "hard"),
    card("c1", "tech"),
  ];
  const verdicts: PoolVerdicts = {
    a1: { score: 5, problem: "" },
    a2: { score: 3, problem: "doubtful" },
    a3: { score: 4, problem: "" },
    b1: { score: 5, problem: "" },
    b2: { score: 5, problem: "" },
  };

  it("lists the cards without a verdict", () => {
    expect(cardsToJudge(cards, verdicts).map((item) => item.id)).toEqual(["c1"]);
    expect(cardsToJudge(cards, {})).toHaveLength(6);
  });

  it("always includes doubtful and unjudged cards and samples the rest per cell", () => {
    const sample = selectReviewSample(cards, verdicts, {
      belowScore: 4,
      perCell: 1,
      random: () => 0,
    });
    // a2 (score 3) and c1 (not judged) are always in; one good card per cell on top.
    expect(sample.map((item) => item.id)).toEqual(["a1", "a2", "b1", "c1"]);
  });

  it("takes everything of a cell when it is smaller than the sample and keeps the input order", () => {
    const sample = selectReviewSample(cards, verdicts, {
      belowScore: 4,
      perCell: 10,
      random: () => 0.99,
    });
    expect(sample.map((item) => item.id)).toEqual(["a1", "a2", "a3", "b1", "b2", "c1"]);
  });

  it("looks at doubtful cards only when the sample size is zero", () => {
    const sample = selectReviewSample(cards, verdicts, {
      belowScore: 4,
      perCell: 0,
      random: () => 0,
    });
    expect(sample.map((item) => item.id)).toEqual(["a2", "c1"]);
  });
});

describe("parseDropList", () => {
  it("reads one id per line and ignores comments and blank lines", () => {
    const drops = parseDropList("pool-de-food-a\r\n\n# a comment\n  pool-de-food-b  # not funny\n");
    expect([...drops]).toEqual(["pool-de-food-a", "pool-de-food-b"]);
  });
});

describe("selectCardsToMerge", () => {
  const cards = [card("ok"), card("low"), card("dropped"), card("unjudged"), card("present")];
  const verdicts: PoolVerdicts = {
    ok: { score: 5, problem: "" },
    low: { score: 2, problem: "bad" },
    dropped: { score: 5, problem: "" },
    present: { score: 5, problem: "" },
  };
  const base = { minScore: 4, poolIds: new Set(["present"]) };

  it("merges only judged, good, not dropped cards that are not in the pool yet", () => {
    const selection = selectCardsToMerge(cards, verdicts, new Set(["dropped"]), {
      ...base,
      allowUnjudged: false,
    });
    expect(selection.merge.map((item) => item.id)).toEqual(["ok"]);
    expect(selection.skipped).toEqual([
      { id: "low", reason: "score 2 below 4" },
      { id: "dropped", reason: "dropped by the review" },
      { id: "unjudged", reason: "not judged" },
      { id: "present", reason: "already in the pool" },
    ]);
  });

  it("lets unjudged cards pass when asked", () => {
    const selection = selectCardsToMerge(cards, verdicts, new Set(), {
      ...base,
      allowUnjudged: true,
    });
    expect(selection.merge.map((item) => item.id)).toEqual(["ok", "dropped", "unjudged"]);
  });
});
