import { describe, expect, it } from "vitest";
import { createGameHubI18n, fallbackLanguage, supportedLanguages } from "./index";

describe("GameHub i18n", () => {
  it.each([
    ["en", "Project foundation"],
    ["de", "Projektgrundlage"],
  ] as const)("initializes the %s resources", async (language, expectedText) => {
    const instance = await createGameHubI18n(language);

    expect(instance.t("app.eyebrow")).toBe(expectedText);
  });

  it("defines English as the fallback for all supported languages", async () => {
    const instance = await createGameHubI18n();

    expect(supportedLanguages).toEqual(["de", "en"]);
    expect(instance.language).toBe(fallbackLanguage);
    expect(instance.options.fallbackLng).toContain(fallbackLanguage);
  });
});
