import { describe, expect, it } from "vitest";
import type { TabooCard } from "../../business/games/taboo/model";
import { cardShortageFor, planTabooStart } from "./tabooStartPlan";
import type { TabooSettings } from "./tabooSetupModel";

const teams = [
  { id: "team-1", name: "Red" },
  { id: "team-2", name: "Blue" },
];
const categoryIds = ["everyday", "culture", "nature"];

const classic: TabooSettings = {
  cardSource: "local",
  categories: categoryIds,
  difficulties: [],
  duration: 60,
  mode: "classic",
  raceRounds: 3,
  raceTiebreak: true,
  raceTarget: 5,
  rounds: 3,
  skips: 1,
  tiebreak: true,
};

function card(id: string, difficulty: TabooCard["difficulty"]): TabooCard {
  return {
    id,
    language: "en",
    term: `Term ${id}`,
    forbiddenWords: ["a one", "b two", "c three", "d four"],
    categoryId: "everyday",
    difficulty,
  };
}

describe("planTabooStart", () => {
  it("plans a classic game with its settings and the number of cards it needs", () => {
    const planned = planTabooStart({ categoryIds, cardLanguage: "en", settings: classic, teams });
    if (!planned.valid) throw new Error("expected a valid plan");
    const { plan } = planned;
    expect(plan.mode).toBe("classic");
    expect(plan.race).toBeUndefined();
    expect(plan.classic?.configuration).toMatchObject({
      roundDurationSeconds: 60,
      roundsPerTeam: 3,
      skipsPerRound: 1,
      tiebreak: true,
    });
    // Two teams, three rounds: one card per turn.
    expect(plan.required).toBe(6);
    expect(plan.teamCount).toBe(2);
  });

  it("needs only one card per team when the rounds are unlimited", () => {
    const planned = planTabooStart({
      categoryIds,
      cardLanguage: "en",
      settings: { ...classic, rounds: "unlimited" },
      teams,
    });
    if (!planned.valid) throw new Error("expected a valid plan");
    expect(planned.plan.required).toBe(2);
  });

  it("leaves the skips and the tiebreak out when they are not set", () => {
    const planned = planTabooStart({
      categoryIds,
      cardLanguage: "en",
      settings: { ...classic, skips: undefined, tiebreak: false },
      teams,
    });
    if (!planned.valid) throw new Error("expected a valid plan");
    expect(planned.plan.classic?.configuration.skipsPerRound).toBeUndefined();
    expect(planned.plan.classic?.configuration.tiebreak).toBeUndefined();
  });

  it("plans a race that needs the cards of all runs and two spare ones per team", () => {
    const planned = planTabooStart({
      categoryIds,
      cardLanguage: "en",
      settings: { ...classic, mode: "race", raceTarget: 10 },
      teams,
    });
    if (!planned.valid) throw new Error("expected a valid plan");
    expect(planned.plan.mode).toBe("race");
    expect(planned.plan.classic).toBeUndefined();
    expect(planned.plan.race?.configuration.target).toBe(10);
    // The rounds of the race come from their own setting, not from the rounds of the classic mode.
    expect(planned.plan.race?.configuration.rounds).toBe(3);
    expect(planned.plan.required).toBe(2 * (10 + 2));
  });

  it("sets no category filter when every category is chosen, and the filter otherwise", () => {
    const all = planTabooStart({ categoryIds, cardLanguage: "en", settings: classic, teams });
    const some = planTabooStart({
      categoryIds,
      cardLanguage: "en",
      settings: { ...classic, categories: ["nature"] },
      teams,
    });
    if (!all.valid || !some.valid) throw new Error("expected valid plans");
    expect(all.plan.filters.categoryIds).toEqual([]);
    expect(some.plan.filters.categoryIds).toEqual(["nature"]);
    expect(some.plan.selectedCategories).toEqual(["nature"]);
    expect(all.plan.filters.language).toBe("en");
  });

  it("takes every difficulty when none is chosen, and the chosen ones otherwise", () => {
    const none = planTabooStart({ categoryIds, cardLanguage: "en", settings: classic, teams });
    const hard = planTabooStart({
      categoryIds,
      cardLanguage: "en",
      settings: { ...classic, difficulties: ["hard"] },
      teams,
    });
    if (!none.valid || !hard.valid) throw new Error("expected valid plans");
    expect(none.plan.chosenDifficulties).toEqual(["easy", "medium", "hard"]);
    expect(hard.plan.chosenDifficulties).toEqual(["hard"]);
  });

  it("reports what is wrong with the teams and gives no plan", () => {
    const planned = planTabooStart({
      categoryIds,
      cardLanguage: "en",
      settings: classic,
      teams: [
        { id: "team-1", name: "Same" },
        { id: "team-2", name: "same " },
      ],
    });
    if (planned.valid) throw new Error("expected issues");
    expect(planned.issues).toContainEqual({ field: "teams.name", code: "duplicate" });
  });

  it("reports an invalid setting of the mode, for example a duration of zero", () => {
    const planned = planTabooStart({
      categoryIds,
      cardLanguage: "en",
      settings: { ...classic, duration: 0 },
      teams,
    });
    expect(planned.valid).toBe(false);
  });
});

describe("cardShortageFor", () => {
  const classicPlan = () => {
    const planned = planTabooStart({ categoryIds, cardLanguage: "en", settings: classic, teams });
    if (!planned.valid) throw new Error("expected a valid plan");
    return planned.plan;
  };
  const racePlan = () => {
    const planned = planTabooStart({
      categoryIds,
      cardLanguage: "en",
      settings: { ...classic, mode: "race", raceTarget: 5, difficulties: ["easy", "hard"] },
      teams,
    });
    if (!planned.valid) throw new Error("expected a valid plan");
    return planned.plan;
  };

  it("says how many cards are missing in a classic game, and nothing when there are enough", () => {
    const cards = Array.from({ length: 6 }, (_, index) => card(`c${index}`, "easy"));
    expect(cardShortageFor(classicPlan(), cards.slice(0, 4))).toEqual({
      available: 4,
      required: 6,
    });
    expect(cardShortageFor(classicPlan(), cards)).toBeUndefined();
  });

  it("names the difficulty that is short in a race, so every team gets the same mix", () => {
    const easy = Array.from({ length: 20 }, (_, index) => card(`e${index}`, "easy"));
    const shortage = cardShortageFor(racePlan(), easy);
    expect(shortage).toMatchObject({ difficulty: "hard" });
    const enough = [
      ...easy,
      ...Array.from({ length: 20 }, (_, index) => card(`h${index}`, "hard")),
    ];
    expect(cardShortageFor(racePlan(), enough)).toBeUndefined();
  });
});
