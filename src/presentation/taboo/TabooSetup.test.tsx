import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { expect, it, vi } from "vitest";
import { createGameHubI18n } from "../../i18n";
import { TeamSetupMemoryProvider } from "../game-kit";
import { TabooSetup } from "./TabooSetup";
import { tabooStandardCards } from "../../data/tabooStandardCards";
import { rowText } from "../testing/scoreRows";
import { closeGameSettings, openGameSettings } from "../testing/gameSettings";

it("blocks a six-turn setup when the chosen filters match only five cards", async () => {
  const user = userEvent.setup();
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <TabooSetup roundChoices={[1, 3]} cardLanguage="en" cards={tabooStandardCards} />
    </I18nextProvider>,
  );
  openGameSettings();
  await user.click(screen.getByRole("checkbox", { name: "Everyday life" }));
  await user.click(screen.getByRole("checkbox", { name: "Culture" }));
  // Only Easy is chosen at first and leaves 5 cards.
  closeGameSettings();
  await user.click(screen.getByRole("button", { name: "Start game" }));
  expect(screen.getByRole("alert")).toHaveTextContent("The filters match 5 cards");
  expect(screen.queryByRole("button", { name: "Start round" })).not.toBeInTheDocument();
});

it("asks for a category before the line-up opens", async () => {
  const user = userEvent.setup();
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <TabooSetup roundChoices={[1, 3]} cardLanguage="en" cards={tabooStandardCards} />
    </I18nextProvider>,
  );
  openGameSettings();
  for (const category of ["Everyday life", "Culture", "Nature"]) {
    await user.click(screen.getByRole("checkbox", { name: category }));
  }
  closeGameSettings();
  expect(screen.getByRole("alert")).toHaveTextContent("Select at least one category.");
  expect(screen.queryByRole("region", { name: "Line-up" })).not.toBeInTheDocument();
});

it("opens on the line-up, keeps the settings on their own screen and starts the game from the line-up", async () => {
  const user = userEvent.setup();
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <TabooSetup roundChoices={[1, 3]} cardLanguage="en" cards={tabooStandardCards} />
    </I18nextProvider>,
  );
  // The first view is the line-up; the settings are not shown.
  const lineup = screen.getByRole("region", { name: "Line-up" });
  expect(screen.queryByRole("group", { name: "Rounds per team" })).not.toBeInTheDocument();
  const tabs = within(lineup).getAllByRole("tab");
  expect(tabs.map((tab) => tab.textContent)).toEqual(["Players (0)", "Teams (2)"]);
  expect(tabs[1]).toHaveAttribute("aria-selected", "true");
  expect(within(lineup).getByRole("textbox", { name: "Name of team 1" })).toBeVisible();
  expect(screen.queryByRole("region", { name: "Round overview" })).not.toBeInTheDocument();
  // The button above the tabs opens the settings as their own screen, "Done" leads back.
  openGameSettings();
  expect(screen.getByRole("group", { name: "Rounds per team" })).toBeVisible();
  expect(screen.queryByRole("region", { name: "Line-up" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Start game" })).not.toBeInTheDocument();
  closeGameSettings();
  expect(screen.getByRole("region", { name: "Line-up" })).toBeVisible();
  await user.click(
    within(screen.getByRole("region", { name: "Line-up" })).getByRole("button", {
      name: "Start game",
    }),
  );
  expect(screen.getByRole("region", { name: "Round overview" })).toBeVisible();
  expect(screen.queryByRole("region", { name: "Line-up" })).not.toBeInTheDocument();
});

it("keeps the changed settings when the line-up is shown again and uses them in the game", async () => {
  const user = userEvent.setup();
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <TabooSetup roundChoices={[1, 3]} cardLanguage="en" cards={tabooStandardCards} />
    </I18nextProvider>,
  );
  openGameSettings();
  await user.click(
    within(screen.getByRole("group", { name: "Rounds per team" })).getByRole("radio", {
      name: "1",
    }),
  );
  closeGameSettings();
  openGameSettings();
  expect(
    within(screen.getByRole("group", { name: "Rounds per team" })).getByRole("radio", {
      name: "1",
    }),
  ).toBeChecked();
  closeGameSettings();
  await user.click(screen.getByRole("button", { name: "Start game" }));
  expect(screen.getByText("Round 1/1")).toBeVisible();
});

it("starts although players that were added have no team, because Taboo does not need names", async () => {
  const user = userEvent.setup();
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <TabooSetup roundChoices={[1, 3]} cardLanguage="en" cards={tabooStandardCards} />
    </I18nextProvider>,
  );
  openGameSettings();
  closeGameSettings();
  const lineup = screen.getByRole("region", { name: "Line-up" });
  await user.type(within(lineup).getByLabelText("Add player"), "Anna, Ben{enter}");
  await user.click(within(lineup).getByRole("button", { name: "Start game" }));
  expect(screen.getByRole("region", { name: "Round overview" })).toBeVisible();
  expect(screen.queryByText(/Players without a team/)).not.toBeInTheDocument();
});

it.each([
  ["en", "Start game"],
  ["de", "Spiel starten"],
] as const)("starts the first round directly in %s", async (language, startGame) => {
  const user = userEvent.setup();
  const i18n = await createGameHubI18n(language);
  render(
    <I18nextProvider i18n={i18n}>
      <TabooSetup roundChoices={[1, 3]} cardLanguage={language} cards={tabooStandardCards} />
    </I18nextProvider>,
  );
  openGameSettings();
  closeGameSettings();
  await user.click(screen.getByRole("group", { name: "Teams" }).querySelector("input[value='3']")!);
  await user.click(screen.getByRole("button", { name: startGame }));
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
  openGameSettings();
  closeGameSettings();
  await user.click(screen.getByRole("group", { name: "Teams" }).querySelector("input[value='3']")!);
  await user.type(screen.getByRole("textbox", { name: "Name of team 1" }), "Foxes");
  await user.type(screen.getByRole("textbox", { name: "Name of team 3" }), "  Owls ");
  await user.click(screen.getByRole("button", { name: "Start game" }));
  const standings = within(screen.getByRole("list", { name: "Total scores" })).getAllByRole(
    "listitem",
  );
  expect(standings.map((row) => rowText(row)).sort()).toEqual(["Foxes: 0", "Owls: 0", "Team 2: 0"]);
});

it("rejects duplicate custom team names", async () => {
  const user = userEvent.setup();
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <TabooSetup roundChoices={[1, 3]} cardLanguage="en" cards={tabooStandardCards} />
    </I18nextProvider>,
  );
  openGameSettings();
  closeGameSettings();
  await user.type(screen.getByRole("textbox", { name: "Name of team 1" }), "Same");
  await user.type(screen.getByRole("textbox", { name: "Name of team 2" }), "Same");
  await user.click(screen.getByRole("button", { name: "Start game" }));
  expect(screen.getByRole("alert")).toHaveTextContent("Use a different name for each team.");
});

it("plays the teams in the order that was set for the whole game", async () => {
  const user = userEvent.setup();
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <TabooSetup roundChoices={[1, 3]} cardLanguage="en" cards={tabooStandardCards} />
    </I18nextProvider>,
  );
  openGameSettings();
  closeGameSettings();
  await user.click(screen.getByRole("group", { name: "Teams" }).querySelector("input[value='3']")!);
  // Team 3 is moved to the top place with the keyboard, the others move down.
  screen.getByRole("button", { name: "Move Team 3, place 3" }).focus();
  await user.keyboard("{ArrowUp}{ArrowUp}");
  await user.click(screen.getByRole("button", { name: "Start game" }));
  expect(screen.getByText("Round 1/3")).toBeVisible();
  expect(document.querySelector(".kit-turn-strip strong")).toHaveTextContent("Team 3");
  expect(
    within(screen.getByRole("list", { name: "Total scores" }))
      .getAllByRole("listitem")
      .map((row) => rowText(row)),
  ).toEqual(["Team 3: 0", "Team 1: 0", "Team 2: 0"]);
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
  openGameSettings();
  await user.click(
    screen.getByRole("group", { name: "Rounds per team" }).querySelector("input[value='1']")!,
  );
  // Only Easy is chosen at first; these cards need all difficulties.
  await user.click(screen.getByRole("checkbox", { name: "Medium" }));
  await user.click(screen.getByRole("checkbox", { name: "Hard" }));
  closeGameSettings();
  await user.click(screen.getByRole("button", { name: "Start game" }));
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
  openGameSettings();
  await user.click(
    within(screen.getByRole("group", { name: "Skips per round" })).getByRole("radio", {
      name: option,
    }),
  );
  closeGameSettings();
  await user.click(screen.getByRole("button", { name: "Start game" }));
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
  openGameSettings();
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
  // The legend says that several can be chosen; only Easy is chosen at first, so the active choice is clear.
  const difficulty = screen.getByRole("group", { name: "Difficulty (several possible)" });
  expect(within(difficulty).getAllByRole("checkbox")).toHaveLength(3);
  expect(within(difficulty).getByRole("checkbox", { name: "Easy" })).toBeChecked();
  expect(within(difficulty).getByRole("checkbox", { name: "Medium" })).not.toBeChecked();
  expect(within(difficulty).getByRole("checkbox", { name: "Hard" })).not.toBeChecked();
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
    openGameSettings();
    fireEvent.click(
      within(screen.getByRole("group", { name: "Rounds per team" })).getByRole("radio", {
        name: "Unlimited",
      }),
    );
    closeGameSettings();
    fireEvent.click(screen.getByRole("button", { name: "Start game" }));
    expect(screen.getByText("Round 1")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Start round" }));
    act(() => void vi.advanceTimersByTime(60000));
    // In the middle of a round only the next turn can be started.
    expect(screen.queryByRole("button", { name: "Show final results" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Start round" }));
    act(() => void vi.advanceTimersByTime(60000));
    // After the last team of the round the group may stop or continue with round 2.
    expect(screen.getByText("Round 2")).toBeVisible();
    // Both teams are still at zero, so finishing early leads into the tiebreak: the button says so.
    expect(screen.queryByRole("button", { name: "Show final results" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Start tiebreak" }));
    expect(screen.getByRole("region", { name: "Tiebreak" })).toBeVisible();
  } finally {
    vi.useRealTimers();
  }
});

it.each([
  ["Card source", "Local only: the cards that come with the app", "Card source"],
  // The tiebreak has its own window with its own title.
  ["Tiebreak on a tie", "the teams play 3 cards in 90 seconds", "Tiebreak"],
  ["Skips per round", "How often a team may skip a card per round.", "Skips per round"],
  ["Difficulty", "How hard a card is to explain.", "Difficulty"],
])("explains the setting %s in an info dialog", async (setting, excerpt, title) => {
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
  openGameSettings();
  fireEvent.click(screen.getByRole("button", { name: `Info about ${setting}` }));
  const dialog = screen.getByRole("dialog", { name: title });
  expect(dialog.textContent).toContain(excerpt);
  fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));
  // Reading the explanation neither starts nor changes the game.
  expect(screen.queryByRole("region", { name: "Round overview" })).not.toBeInTheDocument();
  expect(screen.getByRole("group", { name: new RegExp(`^${setting}`) })).toBeVisible();
});

it.each([
  ["en", "Start game"],
  ["de", "Spiel starten"],
] as const)(
  "starts with team 1 when the order was not changed in %s",
  async (language, startGame) => {
    const user = userEvent.setup();
    const i18n = await createGameHubI18n(language);
    render(
      <I18nextProvider i18n={i18n}>
        <TabooSetup roundChoices={[1, 3]} cardLanguage={language} cards={tabooStandardCards} />
      </I18nextProvider>,
    );
    openGameSettings();
    closeGameSettings();
    await user.click(
      screen.getByRole("group", { name: "Teams" }).querySelector("input[value='3']")!,
    );
    await user.click(screen.getByRole("button", { name: startGame }));
    expect(document.querySelector(".kit-turn-strip strong")).toHaveTextContent("Team 1");
  },
);

it("remembers the group for the next game when a game starts, but not an empty setup", async () => {
  const user = userEvent.setup();
  const i18n = await createGameHubI18n("en");
  const written: unknown[] = [];
  const memory = { read: () => undefined, write: (value: unknown) => written.push(value) };
  const view = () => (
    <I18nextProvider i18n={i18n}>
      <TeamSetupMemoryProvider memory={memory}>
        <TabooSetup roundChoices={[1, 3]} cardLanguage="en" cards={tabooStandardCards} />
      </TeamSetupMemoryProvider>
    </I18nextProvider>
  );
  const first = render(view());
  await user.click(screen.getByRole("button", { name: "Start game" }));
  expect(written).toEqual([]);
  first.unmount();

  render(view());
  await user.type(screen.getByRole("textbox", { name: "Name of team 1" }), "Foxes");
  await user.click(screen.getByRole("button", { name: "Start game" }));
  expect(written).toHaveLength(1);
  expect(written[0]).toMatchObject({ count: 2, names: ["Foxes", ""], order: [] });
});

it.each([
  ["en", "Card language", "German"],
  ["de", "Kartensprache", "Deutsch"],
] as const)(
  "offers the card language in the game settings and reports a change in %s",
  async (language, legend, german) => {
    const user = userEvent.setup();
    const i18n = await createGameHubI18n(language);
    const onCardLanguageChange = vi.fn();
    render(
      <I18nextProvider i18n={i18n}>
        <TabooSetup
          cardLanguage="en"
          cards={tabooStandardCards}
          onCardLanguageChange={onCardLanguageChange}
          roundChoices={[1, 3]}
        />
      </I18nextProvider>,
    );
    openGameSettings();
    const group = screen.getByRole("group", { name: legend });
    // English is the left option and the chosen one here.
    const radios = within(group).getAllByRole("radio");
    expect(radios).toHaveLength(2);
    expect(radios[0]).toBeChecked();
    await user.click(within(group).getByRole("radio", { name: german }));
    expect(onCardLanguageChange).toHaveBeenCalledWith("de");
  },
);

it("does not offer the card language without a way to change it", async () => {
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <TabooSetup cardLanguage="en" cards={tabooStandardCards} roundChoices={[1, 3]} />
    </I18nextProvider>,
  );
  openGameSettings();
  expect(screen.queryByRole("group", { name: "Card language" })).not.toBeInTheDocument();
});
