import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TimerHud } from "./TimerHud";

function renderHud(remainingSeconds: number, fraction = 0.5) {
  return render(
    <TimerHud
      fraction={fraction}
      meta="Round 1/3"
      remainingSeconds={remainingSeconds}
      time={String(remainingSeconds)}
      timerLabel={`${remainingSeconds} seconds left`}
      title="Team 1"
    />,
  );
}

describe("TimerHud", () => {
  it("shows title, meta line and an accessible timer", () => {
    renderHud(42);
    expect(screen.getByText("Team 1")).toBeVisible();
    expect(screen.getByText("Round 1/3")).toBeVisible();
    expect(screen.getByRole("timer", { name: "42 seconds left" })).toHaveTextContent("42");
  });

  it.each([
    [30, "false", "false"],
    [20, "true", "false"],
    [11, "true", "false"],
    [10, "false", "true"],
    [0, "false", "true"],
  ])("marks %s seconds left as warn=%s low=%s", (seconds, warn, low) => {
    renderHud(seconds);
    const timer = screen.getByRole("timer");
    expect(timer).toHaveAttribute("data-warn", warn);
    expect(timer).toHaveAttribute("data-low", low);
  });

  it("scales the bar with the remaining fraction and never below zero", () => {
    const { container, rerender } = renderHud(30, 0.25);
    const bar = () => container.querySelector<HTMLElement>(".kit-hud__bar span")!;
    expect(bar().style.transform).toBe("scaleX(0.25)");
    rerender(
      <TimerHud fraction={-0.1} meta="" remainingSeconds={0} time="0" timerLabel="0" title="T" />,
    );
    expect(bar().style.transform).toBe("scaleX(0)");
  });
});
