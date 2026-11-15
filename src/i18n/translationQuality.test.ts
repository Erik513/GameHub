import { describe, expect, it } from "vitest";
import { common as germanCommon } from "./resources/de/common";
import { common as englishCommon } from "./resources/en/common";
import { findIdenticalValues, findPlaceholderMismatches } from "./translationParity";

/**
 * Keys whose text is legitimately the same in German and English (names, symbols, numbers,
 * placeholders-only texts and shared words). Every new identical key must be added consciously.
 */
const allowedIdenticalValues = [
  "app.title",
  "games.quiz.title",
  "kitSetup.teamsTab",
  "kitTeams.defaultName",
  "kitTeams.legend",
  "navigation.pause",
  "tabooList.count",
  "tabooList.views.standard",
  "tabooRace.time",
  "tabooRound.teamTotal",
  "tabooSetup.categoryGroups.standard",
  "tabooSetup.roundOptions.unlimited",
  "tabooSetup.skipOptions.1",
  "tabooSetup.skipOptions.2",
  "tabooSetup.skipOptions.3",
  "tabooSetup.skipOptions.unlimited",
];

/** Keys that are only read by tests or kept for the project foundation. */
const keysUsedOutsideTheApp = ["app.eyebrow", "app.intro", "app.metaDescription", "app.title"];

function collectKeys(resource: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(resource).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return value && typeof value === "object"
      ? collectKeys(value as Record<string, unknown>, path)
      : [path];
  });
}

const sources = import.meta.glob<string>(
  ["../**/*.{ts,tsx}", "!../**/*.test.{ts,tsx}", "!../i18n/resources/**"],
  { eager: true, import: "default", query: "?raw" },
);

function sourceText(): string {
  return Object.values(sources).join(" ");
}

describe("translation quality", () => {
  it("uses the same interpolation placeholders in German and English", () => {
    expect(findPlaceholderMismatches(englishCommon, germanCommon)).toEqual([]);
  });

  it("has no text that is accidentally identical in both languages", () => {
    expect(findIdenticalValues(englishCommon, germanCommon)).toEqual(allowedIdenticalValues);
  });

  it("has no translation key that the application never uses", () => {
    const source = sourceText();
    const unused = collectKeys(englishCommon).filter((key) => {
      if (keysUsedOutsideTheApp.includes(key)) return false;
      const parent = key.slice(0, key.lastIndexOf("."));
      // Dynamic keys such as `games.${name}.title` are referenced by their prefix.
      return (
        !source.includes(key) &&
        !source.includes(`${parent}.\${`) &&
        !source.includes(`${parent.slice(0, parent.lastIndexOf("."))}.\${`)
      );
    });
    expect(unused).toEqual([]);
  });
});
