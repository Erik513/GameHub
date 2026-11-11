import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { expect, it, vi } from "vitest";
import { createGameHubI18n } from "../../i18n";
import { TabooSetup } from "./TabooSetup";
import { tabooStandardCards } from "../../data/tabooStandardCards";

it("blocks a six-turn setup when the chosen filters match only five cards", async () => {
  const user = userEvent.setup();
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <TabooSetup roundChoices={[1, 3]} cardLanguage="en" cards={tabooStandardCards} />
    </I18nextProvider>,
  );
  await user.click(screen.getByRole("checkbox", { name: "Everyday life" }));
  await user.click(screen.getByRole("checkbox", { name: "Culture" }));
  await user.click(screen.getByRole("radio", { name: "Easy" }));
  await user.click(screen.getByRole("button", { name: "Start" }));
  expect(screen.getByRole("alert")).toHaveTextContent("The filters match 5 cards");
  expect(screen.queryByRole("button", { name: "Start round" })).not.toBeInTheDocument();
  await user.click(screen.getByRole("checkbox", { name: "Nature" }));
  await user.click(screen.getByRole("button", { name: "Start" }));
  expect(screen.getByRole("alert")).toHaveTextContent("Select at least one category.");
});

it.each([
  ["en", "Start"],
  ["de", "Starten"],
] as const)("starts the first round directly in %s", async (language, start) => {
  const user = userEvent.setup();
  const i18n = await createGameHubI18n(language);
  render(
    <I18nextProvider i18n={i18n}>
      <TabooSetup roundChoices={[1, 3]} cardLanguage={language} cards={tabooStandardCards} />
    </I18nextProvider>,
  );
  await user.click(screen.getByRole("group", { name: "Teams" }).querySelector("input[value='3']")!);
  await user.click(screen.getByRole("button", { name: start }));
  expect(
    screen.getByRole("region", { name: language === "en" ? "Round overview" : "Rundenübersicht" }),
  ).toBeVisible();
  expect(screen.queryByRole("timer")).not.toBeInTheDocument();
});

it("uses custom team names and falls back to defaults for blank fields", async () => {
  const user = userEvent.setup();
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <TabooSetup roundChoices={[1, 3]} cardLanguage="en" cards={tabooStandardCards} />
    </I18nextProvider>,
  );
  await user.click(screen.getByRole("group", { name: "Teams" }).querySelector("input[value='3']")!);
  await user.type(screen.getByRole("textbox", { name: "Name of team 1" }), "Foxes");
  await user.type(screen.getByRole("textbox", { name: "Name of team 3" }), "  Owls ");
  await user.click(screen.getByRole("button", { name: "Start" }));
  const standings = within(screen.getByRole("list", { name: "Total scores" })).getAllByRole(
    "listitem",
  );
  expect(standings.map((row) => row.textContent).sort()).toEqual([
    "Foxes: 0",
    "Owls: 0",
    "Team 2: 0",
  ]);
});

it("rejects duplicate custom team names", async () => {
  const user = userEvent.setup();
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <TabooSetup roundChoices={[1, 3]} cardLanguage="en" cards={tabooStandardCards} />
    </I18nextProvider>,
  );
  await user.type(screen.getByRole("textbox", { name: "Name of team 1" }), "Same");
  await user.type(screen.getByRole("textbox", { name: "Name of team 2" }), "Same");
  await user.click(screen.getByRole("button", { name: "Start" }));
  expect(screen.getByRole("alert")).toHaveTextContent("Use a different name for each team.");
});

it("randomizes the team order once and keeps it for the whole game", async () => {
  const random = vi.spyOn(Math, "random").mockReturnValue(0);
  const user = userEvent.setup();
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <TabooSetup roundChoices={[1, 3]} cardLanguage="en" cards={tabooStandardCards} />
    </I18nextProvider>,
  );
  await user.click(screen.getByRole("group", { name: "Teams" }).querySelector("input[value='3']")!);
  await user.click(screen.getByRole("button", { name: "Start" }));
  expect(screen.getByText("Round 1/3")).toBeVisible();
  expect(document.querySelector(".kit-turn-strip strong")).toHaveTextContent("Team 2");
  expect(
    within(screen.getByRole("list", { name: "Total scores" }))
      .getAllByRole("listitem")
      .map((row) => row.textContent),
  ).toEqual(["Team 2: 0", "Team 3: 0", "Team 1: 0"]);
  random.mockRestore();
});

it("lets a turn use more than its fair share of cards and reuses cards in later turns", async () => {
  const user = userEvent.setup();
  const i18n = await createGameHubI18n("en");
  const cards = tabooStandardCards.filter((card) => card.language === "en").slice(0, 6);
  render(
    <I18nextProvider i18n={i18n}>
      <TabooSetup roundChoices={[1, 3]} cardLanguage="en" cards={cards} />
    </I18nextProvider>,
  );
  await user.click(
    screen.getByRole("group", { name: "Rounds per team" }).querySelector("input[value='1']")!,
  );
  await user.click(screen.getByRole("button", { name: "Start" }));
  await user.click(screen.getByRole("button", { name: "Start round" }));
  for (let played = 0; played < 5; played += 1) {
    await user.click(screen.getByRole("button", { name: "Correct" }));
  }
  expect(screen.getByRole("timer")).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Correct" }));
  expect(screen.queryByRole("timer")).not.toBeInTheDocument();
  // All six cards were used by the first team; the second team still gets a full deck.
  await user.click(screen.getByRole("button", { name: "Start round" }));
  expect(screen.getByRole("timer")).toBeVisible();
});

it.each([
  ["None", false, 0],
  ["Unlimited", true, 3],
])("applies the skip option %s", async (option, canSkipAgain, skips) => {
  const user = userEvent.setup();
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <TabooSetup roundChoices={[1, 3]} cardLanguage="en" cards={tabooStandardCards} />
    </I18nextProvider>,
  );
  await user.click(
    within(screen.getByRole("group", { name: "Skips per round" })).getByRole("radio", {
      name: option,
    }),
  );
  await user.click(screen.getByRole("button", { name: "Start" }));
  await user.click(screen.getByRole("button", { name: "Start round" }));
  for (let index = 0; index < skips; index += 1) {
    const skip = screen.queryByRole("button", { name: "Skip" });
    if (skip) await user.click(skip);
  }
  expect(Boolean(screen.queryByRole("button", { name: "Skip" }))).toBe(canSkipAgain);
});

it("offers short, medium, long and unlimited games with the short one preselected", async () => {
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <TabooSetup cardLanguage="en" cards={tabooStandardCards} />
    </I18nextProvider>,
  );
  const group = within(screen.getByRole("group", { name: "Rounds per team" }));
  expect(group.getAllByRole("radio").map((radio) => (radio as HTMLInputElement).value)).toEqual([
    "3",
    "5",
    "10",
    "unlimited",
  ]);
  expect(group.getByRole("radio", { name: /Short/ })).toBeChecked();
  expect(group.getByRole("radio", { name: "Unlimited" })).toBeVisible();
  // Difficulties carry their color in the menu already.
  const difficulty = screen.getByRole("group", { name: "Difficulty" });
  expect(difficulty.querySelector("[data-tone='easy']")).not.toBeNull();
  expect(difficulty.querySelector("[data-tone='hard']")).not.toBeNull();
});

it("lets the group finish an unlimited game after every completed round", async () => {
  vi.useFakeTimers();
  try {
    const i18n = await createGameHubI18n("en");
    render(
      <I18nextProvider i18n={i18n}>
        <TabooSetup cardLanguage="en" cards={tabooStandardCards} roundChoices={[3, "unlimited"]} />
      </I18nextProvider>,
    );
    fireEvent.click(
      within(screen.getByRole("group", { name: "Rounds per team" })).getByRole("radio", {
        name: "Unlimited",
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    expect(screen.getByText("Round 1")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Start round" }));
    act(() => void vi.advanceTimersByTime(60000));
    // In the middle of a round only the next turn can be started.
    expect(screen.queryByRole("button", { name: "Show final results" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Start round" }));
    act(() => void vi.advanceTimersByTime(60000));
    // After the last team of the round the group may stop or continue with round 2.
    expect(screen.getByRole("button", { name: "Show final results" })).toBeVisible();
    expect(screen.getByText("Round 2")).toBeVisible();
    // Both teams are still at zero, so finishing early leads into the tiebreak.
    fireEvent.click(screen.getByRole("button", { name: "Show final results" }));
    expect(screen.getByRole("region", { name: "Tiebreak" })).toBeVisible();
  } finally {
    vi.useRealTimers();
  }
});

it.each([
  ["Rounds per team", "A round is over when every team has had one turn."],
  ["Card source", "Local only uses the cards that ship with the app"],
  ["Tiebreak on a tie", "each of them explains three cards against the clock"],
  ["Skips per round", "without a point and without a penalty"],
  ["Difficulty", "The difficulty shows how hard a card is to explain."],
])("explains the setting %s in an info dialog", async (setting, excerpt) => {
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <TabooSetup
        cardLanguage="en"
        cards={tabooStandardCards}
        generators={{
          local: {
            capabilities: { languages: ["en"], maxCardsPerRequest: 10, worksOffline: true },
            generate: vi.fn(),
          },
        }}
      />
    </I18nextProvider>,
  );
  fireEvent.click(screen.getByText("More options", { selector: "summary" }));
  fireEvent.click(screen.getByRole("button", { name: `Info about ${setting}` }));
  const dialog = screen.getByRole("dialog", { name: setting });
  expect(dialog.textContent).toContain(excerpt);
  fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));
  // Reading the explanation neither starts nor changes the game.
  expect(screen.queryByRole("region", { name: "Round overview" })).not.toBeInTheDocument();
  expect(screen.getByRole("group", { name: setting })).toBeVisible();
});
