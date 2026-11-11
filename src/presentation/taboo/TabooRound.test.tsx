import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createGameHubI18n } from "../../i18n";
import { TabooSetup } from "./TabooSetup";
import { tabooStandardCards } from "../../data/tabooStandardCards";

beforeEach(() => {
  // Always pick the last slot so the shuffled team order stays Team 1, Team 2, ...
  vi.spyOn(Math, "random").mockReturnValue(0.99);
});

afterEach(() => {
  vi.restoreAllMocks();
});

function standingsRow(index: number) {
  return within(screen.getByRole("list", { name: "Total scores" })).getAllByRole("listitem")[
    index
  ]!;
}

function upNext() {
  return document.querySelector(".kit-turn-strip strong")!;
}

it.each([
  { correct: true, result: "Winner: Team 1" },
  { correct: false, result: "Shared win: Team 1, Team 2" },
])("shows $result and resets the game on restart", async ({ correct, result }) => {
  const i18n = await createGameHubI18n("en");
  vi.useFakeTimers();
  try {
    render(
      <I18nextProvider i18n={i18n}>
        <TabooSetup roundChoices={[1, 3]} cardLanguage="en" cards={tabooStandardCards} />
      </I18nextProvider>,
    );
    fireEvent.click(
      within(screen.getByRole("group", { name: "Rounds per team" })).getByRole("radio", {
        name: "1",
      }),
    );
    const duration = within(screen.getByRole("group", { name: "Round duration (seconds)" }));
    expect(duration.getAllByRole("radio")).toHaveLength(3);
    expect(duration.getByRole("radio", { name: /^60$/ })).toBeChecked();
    fireEvent.click(duration.getByRole("radio", { name: /^90$/ }));
    expect(duration.getByRole("radio", { name: /^120$/ })).toBeVisible();
    // This test covers the shared win, so the tiebreak is switched off for the tie.
    if (!correct) {
      fireEvent.click(
        within(screen.getByRole("group", { name: "Tiebreak on a tie" })).getByRole("radio", {
          name: "Off",
        }),
      );
    }
    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    fireEvent.click(screen.getByRole("button", { name: "Start round" }));
    if (correct) fireEvent.click(screen.getByRole("button", { name: "Correct" }));
    void act(() => {
      vi.advanceTimersByTime(90000);
    });
    fireEvent.click(screen.getByRole("button", { name: "Start round" }));
    void act(() => {
      vi.advanceTimersByTime(90000);
    });
    fireEvent.click(screen.getByRole("button", { name: "Show final results" }));
    expect(screen.getByRole("status")).toHaveTextContent(result);
    expect(standingsRow(0)).toHaveTextContent(correct ? "Team 1: 1" : "Team 1: 0");
    fireEvent.click(
      screen.getByRole("button", {
        name: correct ? "Play again with the same setup" : "Set up a new game",
      }),
    );
    if (correct) {
      fireEvent.click(screen.getByRole("button", { name: "Start round" }));
      expect(screen.getByRole("region", { name: "Active round" })).toHaveTextContent("Score: 0");
      expect(screen.getByRole("timer")).toHaveTextContent(/^90$/);
    } else {
      expect(
        within(screen.getByRole("group", { name: "Rounds per team" })).getByRole("radio", {
          name: /3/,
        }),
      ).toBeChecked();
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
        <TabooSetup roundChoices={[1, 3]} cardLanguage="en" cards={tabooStandardCards} />
      </I18nextProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    fireEvent.click(screen.getByRole("button", { name: "Start round" }));
    const round = screen.getByRole("region", { name: "Active round" });
    expect(within(round).getAllByRole("listitem")).toHaveLength(4);
    expect(within(round).getByRole("timer")).toHaveTextContent(/^60$/);
    expect(round).toHaveTextContent("Team 1");
    void act(() => {
      vi.advanceTimersByTime(1000);
    });
    const firstTerm = within(round).getByRole("heading").textContent;
    fireEvent.click(within(round).getByRole("button", { name: "Correct" }));
    expect(within(round).getByRole("heading").textContent).not.toBe(firstTerm);
    fireEvent.click(within(round).getByRole("button", { name: "Skip" }));
    // The single skip per round is used up, so the button disappears.
    expect(within(round).queryByRole("button", { name: "Skip" })).not.toBeInTheDocument();
    fireEvent.click(within(round).getByRole("button", { name: "Forbidden word" }));
    expect(round).toHaveTextContent("Score: 1");
    expect(within(round).getByRole("timer")).toHaveTextContent(/^59$/);
    void act(() => {
      vi.advanceTimersByTime(59000);
    });
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
    void act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    const review = within(screen.getByRole("region", { name: "Played round: Team 1" }));
    const items = review.getAllByRole("button");
    // The skipped card stays visible but neutral and cannot be changed.
    expect(review.getAllByRole("listitem")).toHaveLength(3);
    expect(review.getByText("Skipped")).toBeVisible();
    expect(items.map((item) => item.getAttribute("aria-pressed"))).toEqual(["true", "false"]);
    fireEvent.click(items[1]!);
    expect(standingsRow(0)).toHaveTextContent("Team 1: 2");
    expect(items[1]).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(items[0]!);
    expect(standingsRow(0)).toHaveTextContent("Team 1: 1");
    fireEvent.click(items[0]!);
    fireEvent.click(items[1]!);
    expect(standingsRow(0)).toHaveTextContent("Team 1: 1");
    expect(standingsRow(1)).toHaveTextContent("Team 2: 0");
    expect(upNext()).toHaveTextContent("Team 2");
    expect(screen.getByText("Round 1/3")).toBeVisible();
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Start round" }));
    const nextRound = screen.getByRole("region", { name: "Active round" });
    expect(nextRound).toHaveTextContent("Team 2");
    expect(within(nextRound).getByRole("timer")).toHaveTextContent(/^60$/);
    expect(within(nextRound).getByRole("heading").textContent).not.toBe(firstTerm);
    void act(() => {
      vi.advanceTimersByTime(60000);
    });
    expect(screen.getByText("No card was played in this round.")).toBeVisible();
    expect(standingsRow(0)).toHaveTextContent("Team 1: 1");
    expect(upNext()).toHaveTextContent("Team 1");
    expect(screen.getByText("Round 2/3")).toBeVisible();
  } finally {
    vi.useRealTimers();
  }
});

it("shows the remaining time as a shrinking bar", async () => {
  const i18n = await createGameHubI18n("en");
  vi.useFakeTimers();
  try {
    render(
      <I18nextProvider i18n={i18n}>
        <TabooSetup roundChoices={[1, 3]} cardLanguage="en" cards={tabooStandardCards} />
      </I18nextProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    fireEvent.click(screen.getByRole("button", { name: "Start round" }));
    const bar = () => document.querySelector<HTMLElement>(".taboo-round__bar span")!;
    expect(bar().style.transform).toBe("scaleX(1)");
    void act(() => {
      vi.advanceTimersByTime(30000);
    });
    const scale = Number(/scaleX\(([\d.]+)\)/.exec(bar().style.transform)?.[1]);
    expect(scale).toBeCloseTo(0.5, 1);
    expect(document.querySelector(".taboo-round__bar")).toHaveAttribute("data-low", "false");
    void act(() => {
      vi.advanceTimersByTime(25000);
    });
    expect(document.querySelector(".taboo-round__bar")).toHaveAttribute("data-low", "true");
  } finally {
    vi.useRealTimers();
  }
});
