import { expect, it } from "vitest";
import { capitalizeFirst } from "./model";

it("makes the first letter a capital letter and cleans the text", () => {
  expect(capitalizeFirst("  tor  ", "de")).toBe("Tor");
  expect(capitalizeFirst("fußball  platz", "de")).toBe("Fußball platz");
  expect(capitalizeFirst("ice cream", "en")).toBe("Ice cream");
  expect(capitalizeFirst("Ball", "de")).toBe("Ball");
  expect(capitalizeFirst("élan", "en")).toBe("Élan");
  // Only the first letter changes, the rest stays as typed.
  expect(capitalizeFirst("iPhone", "en")).toBe("IPhone");
  expect(capitalizeFirst("   ", "en")).toBe("");
});
