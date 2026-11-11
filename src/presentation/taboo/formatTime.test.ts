import { describe, expect, it } from "vitest";
import { formatSeconds } from "./formatTime";

describe("formatSeconds", () => {
  it("uses the decimal separator of the language", () => {
    expect(formatSeconds(12340, "en")).toBe("12.3");
    expect(formatSeconds(12340, "de")).toBe("12,3");
  });

  it("always shows one decimal and never goes below zero", () => {
    expect(formatSeconds(0, "en")).toBe("0.0");
    expect(formatSeconds(-500, "de")).toBe("0,0");
    expect(formatSeconds(90000, "en")).toBe("90.0");
  });

  it("uses a thousands separator only for very long times", () => {
    expect(formatSeconds(1234500, "en")).toBe("1,234.5");
    expect(formatSeconds(1234500, "de")).toBe("1.234,5");
  });
});
