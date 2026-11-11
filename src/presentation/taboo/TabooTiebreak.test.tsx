import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { tabooStandardCards } from "../../data/tabooStandardCards";
import { createGameHubI18n } from "../../i18n";
import { TabooSetup } from "./TabooSetup";

async function renderGame() {
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <TabooSetup roundChoices={[1, 3]} cardLanguage="en" cards={tabooStandardCards} />
    </I18nextProvider>,
  );
}

function press(name: string) {
  fireEvent.click(screen.getByRole("button", { name }));
}

function advance(ms: number) {
  act(() => void vi.advanceTimersByTime(ms));
}

/** Plays a one-round game in which both teams stay at zero points and opens the tiebreak. */
function reachTiebreak() {
  fireEvent.click(
    screen.getByRole("group", { name: "Rounds per team" }).querySelector("input[value='1']")!,
  );
  press("Start");
  press("Start round");
  advance(60000);
  press("Start round");
  advance(60000);
  press("Show final results");
}

function resultRows() {
  return within(screen.getByRole("list", { name: "Tiebreak results" }))
    .getAllByRole("listitem")
    .map((row) => row.textContent);
}

beforeEach(() => {
  vi.useFakeTimers();
  // Keep the shuffled team order stable: Team 1 plays first.
  vi.spyOn(Math, "random").mockReturnValue(0.99);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("Taboo tiebreak", () => {
  it("lets the tied teams play a timed attempt and awards the faster one", async () => {
    await renderGame();
    reachTiebreak();

    expect(screen.getByRole("region", { name: "Tiebreak" })).toBeVisible();
    expect(resultRows()).toEqual(["Team 1: still to play", "Team 2: still to play"]);
    press("Start tiebreak");

    // Team 1 solves three cards; a forbidden word only costs the time for a new card.
    const attempt = screen.getByRole("region", { name: "Tiebreak attempt" });
    expect(within(attempt).getByRole("timer")).toHaveTextContent("0.0");
    expect(attempt).toHaveTextContent("Card 1/3");
    advance(4000);
    const firstTerm = within(attempt).getByRole("heading").textContent;
    fireEvent.click(within(attempt).getByRole("button", { name: "Forbidden word" }));
    expect(within(attempt).getByRole("timer")).toHaveTextContent("4.0");
    expect(within(attempt).getByRole("heading").textContent).not.toBe(firstTerm);
    expect(attempt).toHaveTextContent("Card 1/3");
    for (let card = 0; card < 3; card += 1) {
      advance(2000);
      fireEvent.click(within(attempt).getByRole("button", { name: "Correct" }));
    }
    expect(resultRows()[0]).toBe("Team 1: 3/3 cards · 10.0 s");
    expect(resultRows()[1]).toBe("Team 2: still to play");

    // Team 2 only solves one card before the 90 seconds are over.
    press("Start tiebreak");
    advance(3000);
    fireEvent.click(screen.getByRole("button", { name: "Correct" }));
    advance(95000);
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();

    expect(screen.getByRole("status")).toHaveTextContent("Winner: Team 1");
    expect(resultRows()).toEqual(["Team 1: 3/3 cards · 10.0 s", "Team 2: 1/3 cards · 90.0 s"]);
    press("Play again with the same setup");
    expect(screen.getByRole("region", { name: "Round overview" })).toBeVisible();
  });

  it("shows the difficulty and allows a single skip with a card of the same difficulty", async () => {
    await renderGame();
    reachTiebreak();
    press("Start tiebreak");
    const attempt = screen.getByRole("region", { name: "Tiebreak attempt" });

    expect(within(attempt).getByText("Easy")).toBeVisible();
    const firstTerm = within(attempt).getByRole("heading").textContent;
    fireEvent.click(within(attempt).getByRole("button", { name: "Skip" }));
    expect(within(attempt).getByText("Easy")).toBeVisible();
    expect(within(attempt).getByRole("heading").textContent).not.toBe(firstTerm);
    expect(within(attempt).queryByRole("button", { name: "Skip" })).not.toBeInTheDocument();

    // Hints about the rules stay visible on the buttons.
    const forbidden = within(attempt).getByRole("button", { name: "Forbidden word" });
    expect(forbidden).toHaveTextContent("counts as wrong");
    // A forbidden word brings another card of the same difficulty and can happen repeatedly.
    const secondTerm = within(attempt).getByRole("heading").textContent;
    fireEvent.click(forbidden);
    expect(within(attempt).getByText("Easy")).toBeVisible();
    expect(within(attempt).getByRole("heading").textContent).not.toBe(secondTerm);
    fireEvent.click(within(attempt).getByRole("button", { name: "Forbidden word" }));
    expect(within(attempt).getByText("Easy")).toBeVisible();
  });
});
