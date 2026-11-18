import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

// jsdom does not scroll; screens that restore the scroll position only need the call to exist.
beforeEach(() => {
  window.scrollTo = vi.fn() as typeof window.scrollTo;
  // Tests set the time with `Date.now` or fake timers; the monotonic clock of the game follows it.
  // Only differences count, so the start of the count does not matter.
  const origin = Date.now();
  vi.spyOn(performance, "now").mockImplementation(() => Date.now() - origin);
});

afterEach(() => {
  cleanup();
});
