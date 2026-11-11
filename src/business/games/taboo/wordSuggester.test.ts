import { describe, expect, it } from "vitest";
import { reviewForbiddenWords } from "./wordSuggester";

describe("reviewForbiddenWords", () => {
  it("keeps the first four distinct words and trims them", () => {
    expect(reviewForbiddenWords("Moon", [" night ", "sky", "orbit", "space", "star"])).toEqual([
      "night",
      "sky",
      "orbit",
      "space",
    ]);
  });

  it("drops the term itself, repeated, blank, overlong and non-text entries", () => {
    expect(
      reviewForbiddenWords(" moon ", [
        "Moon",
        "night",
        "NIGHT",
        "",
        42,
        null,
        "x".repeat(41),
        "sky",
        "orbit",
        "space",
      ]),
    ).toEqual(["night", "sky", "orbit", "space"]);
  });

  it("returns nothing when fewer than four usable words remain or the input is not a list", () => {
    expect(reviewForbiddenWords("Moon", ["night", "sky", "Moon"])).toBeUndefined();
    expect(reviewForbiddenWords("Moon", "night, sky, orbit, space")).toBeUndefined();
    expect(reviewForbiddenWords("Moon", undefined)).toBeUndefined();
  });
});
