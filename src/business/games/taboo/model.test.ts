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
  forbiddenWords: ["Wald", "Tier", "Honig"],
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
      forbiddenWords: [" Wald ", "Tier", "Honig"],
    });
    expect(result.valid).toBe(true);
    if (result.valid) expect(result.value).toEqual({ ...card, language });
    expect(card.forbiddenWords).toEqual(["Wald", "Tier", "Honig"]);
  });
  it.for([
    [],
    ["a", "b"],
    ["a", "b", "c", "d"],
    ["a", " ", "c"],
    ["Wald", " WALD ", "Tier"],
    ["Bär", "Ba\u0308r", "Tier"],
    [" BÄR ", "Wald", "Tier"],
  ])("rejects invalid forbidden words %j", (forbiddenWords) => {
    expect(validateCard({ ...card, forbiddenWords }).valid).toBe(false);
  });
  it.each(["id", "term", "categoryId"] as const)("rejects empty card %s", (field) => {
    expect(validateCard({ ...card, [field]: " " }).valid).toBe(false);
  });
  it("rejects unsupported card metadata", () => {
    expect(validateCard({ ...card, language: "fr" as "en" }).valid).toBe(false);
    expect(validateCard({ ...card, difficulty: "extreme" as "easy" }).valid).toBe(false);
  });
});
