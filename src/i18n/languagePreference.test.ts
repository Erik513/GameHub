import { describe, expect, it } from "vitest";
import { parseSupportedLanguage, resolveInitialLanguage } from "./languagePreference";

describe("language preference", () => {
  it.each([
    ["de", "de"],
    ["de-DE", "de"],
    ["EN-us", "en"],
    ["fr", null],
    [null, null],
  ] as const)("parses %s as %s", (input, expectedLanguage) => {
    expect(parseSupportedLanguage(input)).toBe(expectedLanguage);
  });

  it("prefers a stored language over browser languages", () => {
    expect(resolveInitialLanguage("de", ["en-US"])).toBe("de");
  });

  it("uses the first supported browser language", () => {
    expect(resolveInitialLanguage(null, ["fr-FR", "de-DE", "en-US"])).toBe("de");
  });

  it("falls back to English for unknown languages", () => {
    expect(resolveInitialLanguage("fr", ["es-ES"])).toBe("en");
  });
});
