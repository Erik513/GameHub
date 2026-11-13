import { expect, it } from "vitest";
import { longestReadingTime, readingTime, shortestReadingTime } from "./readingTime";

it("lets longer messages stay longer, within limits", () => {
  expect(readingTime(0)).toBe(shortestReadingTime);
  expect(readingTime(18)).toBe(shortestReadingTime);
  // 130 characters need 10.8 seconds.
  expect(readingTime(130)).toBe(10800);
  expect(readingTime(130)).toBeGreaterThan(readingTime(60));
  expect(readingTime(5000)).toBe(longestReadingTime);
  expect(readingTime(-5)).toBe(shortestReadingTime);
});
