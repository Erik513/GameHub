import { describe, expect, it } from "vitest";
import { common as germanCommon } from "./resources/de/common";
import { common as englishCommon } from "./resources/en/common";

/**
 * The help of the app is short: an info button explains one setting in a sentence or two, the rules
 * window has short parts (`docs/GAMEHUB_UI_RULES.md`, section 2.5). This keeps new texts short.
 */
const maxLinesOfInfo = 2;
const maxCharactersOfLine = 100;
const maxCharactersOfInfo = 190;

const languages = { de: germanCommon, en: englishCommon } as const;

for (const [language, resources] of Object.entries(languages)) {
  const infos = {
    ...Object.fromEntries(
      Object.entries(resources.tabooSetup.info)
        // The source of the cards is switched off (ADR-024), its info is not shown.
        .filter(([key]) => key !== "cardSource")
        .map(([key, text]) => [`tabooSetup.info.${key}`, text]),
    ),
    "tabooMode.classicInfo": resources.tabooMode.classicInfo,
    "tabooMode.raceInfo": resources.tabooMode.raceInfo,
  } as Record<string, string>;

  describe(`short help texts in ${language}`, () => {
    it.each(Object.entries(infos))("keeps the info %s to a sentence or two", (_key, text) => {
      const lines = text.split("\n");
      expect(lines.length).toBeLessThanOrEqual(maxLinesOfInfo);
      expect(text.length).toBeLessThanOrEqual(maxCharactersOfInfo);
      for (const line of lines) expect(line.length).toBeLessThanOrEqual(maxCharactersOfLine);
    });

    it("keeps every part of the rules window short", () => {
      const rules = resources.tabooRules;
      const parts = Object.entries(rules).filter(
        ([key]) => !["title", "all", "cardTerm", "cardWords"].includes(key),
      );
      for (const [, text] of parts) {
        for (const line of String(text).split("\n")) {
          expect(line.length).toBeLessThanOrEqual(maxCharactersOfLine);
        }
      }
    });
  });
}
