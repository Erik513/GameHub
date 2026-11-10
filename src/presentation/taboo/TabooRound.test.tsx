import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { expect, it, vi } from "vitest";
import { createGameHubI18n } from "../../i18n";
import { TabooSetup } from "./TabooSetup";
import { tabooStandardCards } from "../../data/tabooStandardCards";

it.each([
  { correct: true, result: "Winner: Owls" },
  { correct: false, result: "Shared win: Owls, Foxes" },
])("shows $result and resets the game on restart", async ({ correct, result }) => {
  const i18n = await createGameHubI18n("en");
  vi.useFakeTimers();
  try {
    render(
      <I18nextProvider i18n={i18n}>
        <TabooSetup cardLanguage="en" cards={tabooStandardCards} />
      </I18nextProvider>,
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Team 1" }), {
      target: { value: "Owls" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Team 2" }), {
      target: { value: "Foxes" },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Rounds per team" }), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Round duration (seconds)" }), {
      target: { value: "1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Prepare game" }));
    fireEvent.click(screen.getByRole("button", { name: "Start round" }));
    if (correct) fireEvent.click(screen.getByRole("button", { name: "Correct" }));
    void act(() => {
      vi.advanceTimersByTime(1000);
    });
    fireEvent.click(screen.getByRole("button", { name: "Start round" }));
    void act(() => {
      vi.advanceTimersByTime(1000);
    });
    fireEvent.click(screen.getByRole("button", { name: "Show final results" }));
    expect(screen.getByRole("status")).toHaveTextContent(result);
    expect(screen.getByText(correct ? "Owls: 1" : "Owls: 0")).toBeVisible();
    fireEvent.click(
      screen.getByRole("button", {
        name: correct ? "Play again with the same setup" : "Set up a new game",
      }),
    );
    if (correct) {
      fireEvent.click(screen.getByRole("button", { name: "Start round" }));
      expect(screen.getByRole("region", { name: "Active round" })).toHaveTextContent("Score: 0");
      expect(screen.getByRole("timer")).toHaveTextContent("1 seconds left");
    } else {
      expect(screen.getByRole("textbox", { name: "Team 1" })).toHaveValue("");
      expect(screen.getByRole("spinbutton", { name: "Rounds per team" })).toHaveValue(3);
      expect(screen.queryByRole("button", { name: "Start round" })).not.toBeInTheDocument();
    }
  } finally {
    vi.useRealTimers();
  }
});

it("plays cards without resetting the countdown and ends the round on time", async () => {
  const i18n = await createGameHubI18n("en");
  vi.useFakeTimers();
  try {
    render(
      <I18nextProvider i18n={i18n}>
        <TabooSetup cardLanguage="en" cards={tabooStandardCards} />
      </I18nextProvider>,
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Team 1" }), {
      target: { value: "Owls" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Team 2" }), {
      target: { value: "Foxes" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Prepare game" }));
    fireEvent.click(screen.getByRole("button", { name: "Start round" }));
    const round = screen.getByRole("region", { name: "Active round" });
    expect(within(round).getAllByRole("listitem")).toHaveLength(3);
    expect(within(round).getByRole("timer")).toHaveTextContent("60 seconds left");
    expect(round).toHaveTextContent("Team: Owls");
    void act(() => {
      vi.advanceTimersByTime(1000);
    });
    const firstTerm = within(round).getByRole("heading").textContent;
    fireEvent.click(within(round).getByRole("button", { name: "Correct" }));
    expect(within(round).getByRole("heading").textContent).not.toBe(firstTerm);
    fireEvent.click(within(round).getByRole("button", { name: "Skip" }));
    fireEvent.click(within(round).getByRole("button", { name: "Forbidden word" }));
    expect(round).toHaveTextContent("Score: 1");
    expect(within(round).getByRole("timer")).toHaveTextContent("59 seconds left");
    void act(() => {
      vi.advanceTimersByTime(59000);
    });
    expect(screen.getByRole("status")).toHaveTextContent("Round ended");
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
    void act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByRole("status")).toHaveTextContent("Round points: 1");
    expect(screen.getByText("Owls: 1")).toBeVisible();
    expect(screen.getByText("Foxes: 0")).toBeVisible();
    expect(screen.getByText("Next team: Foxes")).toBeVisible();
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Start round" }));
    const nextRound = screen.getByRole("region", { name: "Active round" });
    expect(nextRound).toHaveTextContent("Team: Foxes");
    expect(within(nextRound).getByRole("timer")).toHaveTextContent("60 seconds left");
    expect(within(nextRound).getByRole("heading").textContent).not.toBe(firstTerm);
    void act(() => {
      vi.advanceTimersByTime(60000);
    });
    expect(screen.getByRole("status")).toHaveTextContent("Round points: 0");
    expect(screen.getByText("Owls: 1")).toBeVisible();
    expect(screen.getByText("Next team: Owls")).toBeVisible();
  } finally {
    vi.useRealTimers();
  }
});
