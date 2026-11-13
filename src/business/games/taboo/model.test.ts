import { describe, expect, it } from "vitest";
import {
  normalizeText,
  validateCard,
  validateCategory,
  validateConfiguration,
  type GameConfiguration,
  type TabooCard,
} from "./model";

const configuration: GameConfiguration = {
  teams: [
    { id: "a", name: "Owls" },
    { id: "b", name: "Foxes" },
  ],
  roundDurationSeconds: 60,
  roundsPerTeam: 3,
  cardLanguage: "en",
};
const card: TabooCard = {
  id: "one",
  language: "de",
  term: "Bär",
  forbiddenWords: ["Wald", "Tier", "Honig", "Bau"],
  categoryId: "nature",
  difficulty: "easy",
};

describe("Taboo domain validation", () => {
  it("normalizes whitespace and Unicode without altering meaningful letters", () => {
    expect(normalizeText("  Ba\u0308r\n  groß ")).toBe("Bär groß");
    expect(validateCategory({ id: " nature ", name: " Nature " })).toEqual({
      valid: true,
      value: { id: "nature", name: "Nature" },
    });
    expect(validateCategory({ id: " ", name: " " }).valid).toBe(false);
  });
  it("accepts minimal configuration and copies teams", () => {
    const result = validateConfiguration({
      ...configuration,
      roundDurationSeconds: 1,
      roundsPerTeam: 1,
    });
    expect(result.valid).toBe(true);
    if (result.valid) expect(result.value.teams).not.toBe(configuration.teams);
  });
  it.for([[], [configuration.teams[0]!]])("rejects fewer than two teams: %j", (teams) => {
    expect(validateConfiguration({ ...configuration, teams }).valid).toBe(false);
  });
  it.each(["id", "name"] as const)("rejects missing and normalized duplicate team %s", (field) => {
    for (const value of [" ", ` ${configuration.teams[0]![field].toUpperCase()} `]) {
      expect(
        validateConfiguration({
          ...configuration,
          teams: [configuration.teams[0]!, { ...configuration.teams[1]!, [field]: value }],
        }).valid,
      ).toBe(false);
    }
  });
  it.each([0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])(
    "rejects invalid duration and rounds: %s",
    (value) => {
      for (const field of ["roundDurationSeconds", "roundsPerTeam"] as const)
        expect(validateConfiguration({ ...configuration, [field]: value }).valid).toBe(false);
    },
  );
  it.each([-1, 1.5, NaN, Infinity])("rejects an invalid skip limit: %s", (skipsPerRound) => {
    expect(validateConfiguration({ ...configuration, skipsPerRound }).valid).toBe(false);
  });
  it.each([0, 1, 3, undefined])("accepts the skip limit %s", (skipsPerRound) => {
    expect(
      validateConfiguration({
        ...configuration,
        ...(skipsPerRound === undefined ? {} : { skipsPerRound }),
      }).valid,
    ).toBe(true);
  });
  it("accepts boolean tiebreak settings and rejects other values", () => {
    expect(validateConfiguration({ ...configuration, tiebreak: true }).valid).toBe(true);
    expect(validateConfiguration({ ...configuration, tiebreak: false }).valid).toBe(true);
    expect(
      validateConfiguration({ ...configuration, tiebreak: "yes" as unknown as boolean }).valid,
    ).toBe(false);
  });
  it("rejects unsupported configuration languages", () => {
    expect(validateConfiguration({ ...configuration, cardLanguage: "fr" as "en" }).valid).toBe(
      false,
    );
  });
  it.each(["de", "en"] as const)("accepts cards with explicit %s metadata", (language) => {
    const result = validateCard({
      ...card,
      language,
      term: " Ba\u0308r ",
      forbiddenWords: [" Wald ", "Tier", "Honig", "Bau"],
    });
    expect(result.valid).toBe(true);
    if (result.valid) expect(result.value).toEqual({ ...card, language });
    expect(card.forbiddenWords).toEqual(["Wald", "Tier", "Honig", "Bau"]);
  });
  it.for([
    [],
    ["a", "b"],
    ["a", "b", "c"],
    ["a", "b", "c", "d", "e"],
    ["a", " ", "c", "d"],
    ["Wald", " WALD ", "Tier", "Honig"],
    ["Bär", "Ba\u0308r", "Tier"],
    [" BÄR ", "Wald", "Tier", "Honig"],
  ])("rejects invalid forbidden words %j", (forbiddenWords) => {
    expect(validateCard({ ...card, forbiddenWords }).valid).toBe(false);
  });
  it.each([
    ["Fußball", ["Ball", "Tor", "Rasen", "Stadion"]],
    ["Fußball", ["Tor", "FUSS", "Rasen", "Fußball"]],
    ["Ice cream", ["cold", "ICE", "sweet", "cone"]],
    ["Regenbogen", ["Farben", "Sonne", "Regen", "Himmel"]],
  ] as const)("rejects the part of the term %s in %j", (term, forbiddenWords) => {
    const result = validateCard({ ...card, term, forbiddenWords: [...forbiddenWords] });
    expect(result.valid).toBe(false);
  });
  it("names the problem when a forbidden word is a part of the term", () => {
    const result = validateCard({
      ...card,
      term: "Fußball",
      forbiddenWords: ["Ball", "Tor", "Rasen", "Stadion"],
    });
    expect(result).toEqual({
      valid: false,
      issues: [{ field: "forbiddenWords", code: "part_of_term" }],
    });
  });
  it("accepts short words and words that only look alike", () => {
    // Words under three letters are not checked, and "Fuß" is no part of the word "Ball".
    expect(
      validateCard({ ...card, term: "Tor", forbiddenWords: ["Ball", "Fuß", "Netz", "Pfosten"] })
        .valid,
    ).toBe(true);
    expect(
      validateCard({ ...card, term: "Reis", forbiddenWords: ["Wald", "Tier", "Honig", "Es"] })
        .valid,
    ).toBe(true);
  });
  it.each(["id", "term", "categoryId"] as const)("rejects empty card %s", (field) => {
    expect(validateCard({ ...card, [field]: " " }).valid).toBe(false);
  });
  it("rejects unsupported card metadata", () => {
    expect(validateCard({ ...card, language: "fr" as "en" }).valid).toBe(false);
    expect(validateCard({ ...card, difficulty: "extreme" as "easy" }).valid).toBe(false);
  });
});

it("keeps the players of a team, cleaned up, and leaves them out when there are none", () => {
  const result = validateConfiguration({
    teams: [
      { id: "1", name: "Red", players: [" Anna ", "", "Ben"] },
      { id: "2", name: "Blue", players: [] },
    ],
    roundDurationSeconds: 60,
    roundsPerTeam: 3,
    cardLanguage: "en",
  });
  expect(result).toMatchObject({ valid: true });
  if (result.valid) {
    expect(result.value.teams).toEqual([
      { id: "1", name: "Red", players: ["Anna", "Ben"] },
      { id: "2", name: "Blue" },
    ]);
  }
});
