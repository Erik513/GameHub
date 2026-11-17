import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { tabooStandardCards } from "../../data/tabooStandardCards";
import { createGameHubI18n } from "../../i18n";
import { TabooSetup } from "./TabooSetup";
import { resultText } from "../testing/scoreRows";

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
  // Only Easy is chosen at first; the tiebreak tests use cards of every difficulty.
  fireEvent.click(screen.getByRole("checkbox", { name: "Medium" }));
  fireEvent.click(screen.getByRole("checkbox", { name: "Hard" }));
  press("Start");
  press("Start game");
  press("Start round");
  advance(60000);
  press("Start round");
  advance(60000);
  press("Show final results");
}

function resultRows() {
  return within(screen.getByRole("list", { name: "Tiebreak results" }))
    .getAllByRole("listitem")
    .map((row) => resultText(row));
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
    // Like a turn of the classic mode: only the team and the time above the card.
    expect(attempt).not.toHaveTextContent("Card 1/3");
    advance(4000);
    const firstTerm = within(attempt).getByRole("heading").textContent;
    fireEvent.click(within(attempt).getByRole("button", { name: "Forbidden word" }));
    expect(within(attempt).getByRole("timer")).toHaveTextContent("4.0");
    expect(within(attempt).getByRole("heading").textContent).not.toBe(firstTerm);
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

    // After the last attempt a summary comes first; the final screen follows on a tap.
    press("Show final results");
    expect(screen.getByRole("status")).toHaveTextContent("Winner: Team 1");
    expect(resultRows()).toEqual(["Team 1: 3/3 cards · 10.0 s", "Team 2: 1/3 cards · 90.0 s"]);
    press("Play again with the same setup");
    // The same settings lead to the line-up, the game starts again from there.
    press("Start game");
    expect(screen.getByRole("region", { name: "Round overview" })).toBeVisible();
  });

  it("lets the players correct a tiebreak attempt before and after the game ended", async () => {
    await renderGame();
    reachTiebreak();
    press("Start tiebreak");
    // Team 1 solves all three cards in 6 seconds.
    for (let card = 0; card < 3; card += 1) {
      advance(2000);
      fireEvent.click(screen.getByRole("button", { name: "Correct" }));
    }
    expect(resultRows()[0]).toBe("Team 1: 3/3 cards · 6.0 s");

    // Between the attempts: one card had a forbidden word after all.
    const review = screen.getByRole("region", { name: "Correct a result" });
    expect(within(review).getByRole("heading", { name: "Played attempt: Team 1" })).toBeVisible();
    const cards = within(review).getAllByRole("button");
    expect(cards).toHaveLength(3);
    fireEvent.click(cards[0]!);
    expect(resultRows()[0]).toBe("Team 1: 2/3 cards · 6.0 s");
    // Taking the correction back is possible.
    fireEvent.click(cards[0]!);
    expect(resultRows()[0]).toBe("Team 1: 3/3 cards · 6.0 s");

    // Team 2 is faster with the same number of cards and wins.
    press("Start tiebreak");
    for (let card = 0; card < 3; card += 1) {
      advance(1000);
      fireEvent.click(screen.getByRole("button", { name: "Correct" }));
    }
    // The summary after the last attempt: the winner's mistake is fixed here, before the final screen.
    fireEvent.click(screen.getByRole("tab", { name: /^Last attempt/ }));
    const finalReview = screen.getByRole("region", { name: "Correct a result" });
    // Only the attempt that was just played (Team 2) can be corrected, not the one before.
    expect(
      within(finalReview).getByRole("heading", { name: "Played attempt: Team 2" }),
    ).toBeVisible();
    const team2 = within(finalReview).getAllByRole("button");
    fireEvent.click(team2[0]!);
    expect(resultRows()).toEqual(["Team 1: 3/3 cards · 6.0 s", "Team 2: 2/3 cards · 3.0 s"]);
    press("Show final results");
    expect(screen.getByRole("status")).toHaveTextContent("Winner: Team 1");
    // The final screen shows the result only; nothing can be corrected any more.
    expect(screen.queryByRole("region", { name: "Correct a result" })).not.toBeInTheDocument();
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

  it("explains when there are too few cards for a tiebreak and offers a new setup", async () => {
    const i18n = await createGameHubI18n("en");
    const twoCards = tabooStandardCards.filter((card) => card.language === "en").slice(0, 2);
    render(
      <I18nextProvider i18n={i18n}>
        <TabooSetup roundChoices={[1, 3]} cardLanguage="en" cards={twoCards} />
      </I18nextProvider>,
    );
    reachTiebreak();
    press("Start tiebreak");
    expect(screen.getByRole("alert")).toHaveTextContent("Not enough cards are available");
    expect(screen.getByRole("button", { name: "Start tiebreak" })).toBeDisabled();
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
    press("Set up a new game");
    expect(screen.getByRole("button", { name: "Start" })).toBeVisible();
  });

  it("never uses cards of another language for a tiebreak", async () => {
    const i18n = await createGameHubI18n("en");
    const mixed = [
      ...tabooStandardCards.filter((card) => card.language === "en").slice(0, 4),
      ...tabooStandardCards.filter((card) => card.language === "de").slice(0, 12),
    ];
    render(
      <I18nextProvider i18n={i18n}>
        <TabooSetup roundChoices={[1, 3]} cardLanguage="en" cards={mixed} />
      </I18nextProvider>,
    );
    reachTiebreak();
    press("Start tiebreak");
    // Only four English cards exist, which is enough for three cards plus one replacement.
    const attempt = screen.getByRole("region", { name: "Tiebreak attempt" });
    expect(attempt.querySelector("[lang='de']")).toBeNull();
    fireEvent.click(within(attempt).getByRole("button", { name: "Skip" }));
    expect(attempt.querySelector("[lang='de']")).toBeNull();
    expect(within(attempt).getByRole("heading")).toBeVisible();
  });

  it("keeps the card when no replacement card is left", async () => {
    const i18n = await createGameHubI18n("en");
    const exactlyThree = tabooStandardCards.filter((card) => card.language === "en").slice(0, 3);
    render(
      <I18nextProvider i18n={i18n}>
        <TabooSetup roundChoices={[1, 3]} cardLanguage="en" cards={exactlyThree} />
      </I18nextProvider>,
    );
    reachTiebreak();
    press("Start tiebreak");
    const attempt = screen.getByRole("region", { name: "Tiebreak attempt" });
    const term = within(attempt).getByRole("heading").textContent;
    fireEvent.click(within(attempt).getByRole("button", { name: "Skip" }));
    fireEvent.click(within(attempt).getByRole("button", { name: "Forbidden word" }));
    // All three cards are in use, so nothing changes and the skip stays available.
    expect(within(attempt).getByRole("heading").textContent).toBe(term);
    expect(within(attempt).getByRole("button", { name: "Skip" })).toBeVisible();
  });
});
