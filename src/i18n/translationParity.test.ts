import { describe, expect, it } from "vitest";
import { common as germanCommon } from "./resources/de/common";
import { common as englishCommon } from "./resources/en/common";
import { assertTranslationParity } from "./translationParity";

describe("translation parity", () => {
  it("accepts the complete German and English resources", () => {
    expect(() => assertTranslationParity("en", englishCommon, "de", germanCommon)).not.toThrow();
  });

  it("rejects a missing key", () => {
    const reference = { section: { title: "Title", description: "Description" } };
    const candidate = { section: { title: "Titel" } };

    expect(() => assertTranslationParity("en", reference, "de", candidate)).toThrowError(
      'de is missing key "section.description"',
    );
  });

  it("rejects an unexpected key", () => {
    const reference = { section: { title: "Title" } };
    const candidate = { section: { title: "Titel", description: "Beschreibung" } };

    expect(() => assertTranslationParity("en", reference, "de", candidate)).toThrowError(
      'de has unexpected key "section.description"',
    );
  });

  it.each(["", "   "])("rejects the empty value %j", (emptyValue) => {
    const reference = { section: { title: "Title" } };
    const candidate = { section: { title: emptyValue } };

    expect(() => assertTranslationParity("en", reference, "de", candidate)).toThrowError(
      'de has an empty value at "section.title"',
    );
  });

  it("rejects non-text leaf values", () => {
    const reference = { section: { title: "Title" } };
    const candidate = { section: { title: 42 } };

    expect(() => assertTranslationParity("en", reference, "de", candidate)).toThrowError(
      'de has a non-text value at "section.title"',
    );
  });
});
