import { expect, it, vi } from "vitest";
import { monotonicNow } from "./monotonicClock";

it("goes on when the system time jumps back or forward", async () => {
  // The tests make `performance.now` follow `Date.now`; here the real clock is needed.
  vi.restoreAllMocks();
  const first = monotonicNow();
  // The user (or the network) sets the clock back by an hour, then forward by a day.
  const real = Date.now();
  vi.spyOn(Date, "now").mockReturnValue(real - 3_600_000);
  await new Promise((resolve) => setTimeout(resolve, 20));
  const afterBack = monotonicNow();
  vi.spyOn(Date, "now").mockReturnValue(real + 86_400_000);
  const afterForward = monotonicNow();
  // Only the real time that went by counts, a little more than 20 ms and far less than an hour.
  expect(afterBack - first).toBeGreaterThanOrEqual(15);
  expect(afterBack - first).toBeLessThan(5_000);
  expect(afterForward).toBeGreaterThanOrEqual(afterBack);
  expect(afterForward - first).toBeLessThan(5_000);
});

it("never goes backwards", () => {
  vi.restoreAllMocks();
  let previous = monotonicNow();
  for (let step = 0; step < 1000; step += 1) {
    const current = monotonicNow();
    expect(current).toBeGreaterThanOrEqual(previous);
    previous = current;
  }
});
