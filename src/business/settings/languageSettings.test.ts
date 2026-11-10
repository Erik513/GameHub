import { describe, expect, it } from "vitest";
import { changeCardLanguage, changeUiLanguage, createLanguageSettings } from "./languageSettings";

const languages = ["de", "en"] as const;

describe("language settings", () => {
  it.each(
    languages.flatMap((uiLanguage) =>
      languages.map((cardLanguage) => [uiLanguage, cardLanguage] as const),
    ),
  )(
    "keeps the %s UI language independent from the %s card language",
    (uiLanguage, cardLanguage) => {
      expect(createLanguageSettings(uiLanguage, cardLanguage)).toEqual({
        uiLanguage,
        cardLanguage,
      });
    },
  );

  it("defaults the card language to the initial UI language", () => {
    expect(createLanguageSettings("de")).toEqual({ uiLanguage: "de", cardLanguage: "de" });
  });

  it("preserves the card language when the UI language changes", () => {
    expect(changeUiLanguage(createLanguageSettings("en", "de"), "de")).toEqual({
      uiLanguage: "de",
      cardLanguage: "de",
    });
  });

  it("preserves the UI language when the card language changes", () => {
    expect(changeCardLanguage(createLanguageSettings("de", "de"), "en")).toEqual({
      uiLanguage: "de",
      cardLanguage: "en",
    });
  });
});
