import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Confetti } from "./Confetti";

function mockMotion(reduce: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: reduce && query.includes("prefers-reduced-motion"),
  }));
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it("shows pieces of confetti that only decorate and disappear by themselves", () => {
  mockMotion(false);
  render(<Confetti />);
  const shower = screen.getByTestId("confetti");
  // Decoration only: hidden from screen readers and without any content to read.
  expect(shower).toHaveAttribute("aria-hidden", "true");
  expect(shower.querySelectorAll(".kit-confetti__piece").length).toBeGreaterThan(50);
  // It lasts a few seconds: still there after five, gone after eight.
  act(() => void vi.advanceTimersByTime(5000));
  expect(screen.getByTestId("confetti")).toBeInTheDocument();
  act(() => void vi.advanceTimersByTime(3000));
  expect(screen.queryByTestId("confetti")).not.toBeInTheDocument();
});

it("shows nothing when the device asks for less motion", () => {
  mockMotion(true);
  render(<Confetti />);
  expect(screen.queryByTestId("confetti")).not.toBeInTheDocument();
});
