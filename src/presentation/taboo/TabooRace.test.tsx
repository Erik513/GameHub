import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { afterEach, expect, it, vi } from "vitest";
import { tabooStandardCards } from "../../data/tabooStandardCards";
import { createGameHubI18n } from "../../i18n";
import { TabooSetup } from "./TabooSetup";

const texts = {
  en: {
    mode: "Game mode",
    race: "Race",
    target: "Cards per team",
    rounds: "Rounds per team",
    start: "Start",
    startGame: "Start game",
    overview: "Race overview",
    startRun: "Start run",
    run: "Race run",
    correct: "Correct",
    skip: "Skip",
    wrong: "Forbidden word",
    result: "Game over",
    times: "Final times",
    winner: /Winner: /,
    pending: "still to play",
    newSetup: "Set up a new game",
  },
  de: {
    mode: "Spielmodus",
    race: "Auf Zeit",
    target: "Karten pro Team",
    rounds: "Runden pro Team",
    start: "Starten",
    startGame: "Spiel starten",
    overview: "Übersicht Auf Zeit",
    startRun: "Lauf starten",
    run: "Lauf Auf Zeit",
    correct: "Richtig",
    skip: "Überspringen",
    wrong: "Verbotenes Wort",
    result: "Spiel beendet",
    times: "Endzeiten",
    winner: /Gewinner: /,
    pending: "noch nicht gespielt",
    newSetup: "Neue Partie konfigurieren",
  },
} as const;

afterEach(() => {
  vi.restoreAllMocks();
});

async function startRace(language: "en" | "de") {
  const text = texts[language];
  const user = userEvent.setup();
  const i18n = await createGameHubI18n(language);
  render(
    <I18nextProvider i18n={i18n}>
      <TabooSetup cardLanguage={language} cards={tabooStandardCards} />
    </I18nextProvider>,
  );
  const mode = screen.getByRole("group", { name: text.mode });
  await user.click(within(mode).getByRole("radio", { name: text.race }));
  return { text, user };
}

it.each(["en", "de"] as const)(
  "offers the race settings instead of the round settings in %s",
  async (language) => {
    const { text, user } = await startRace(language);
    expect(screen.queryByRole("group", { name: text.rounds })).not.toBeInTheDocument();
    const target = screen.getByRole("group", { name: text.target });
    expect(
      within(target)
        .getAllByRole("radio")
        .map((radio) => (radio as HTMLInputElement).value),
    ).toEqual(["5", "10", "15"]);
    expect(within(target).getByRole("radio", { name: "5" })).toBeChecked();
    // Going back to the classic mode brings the round settings back.
    await user.click(
      within(screen.getByRole("group", { name: text.mode })).getByRole("radio", {
        name: language === "en" ? "Classic" : "Klassisch",
      }),
    );
    expect(screen.getByRole("group", { name: text.rounds })).toBeVisible();
    expect(screen.queryByRole("group", { name: text.target })).not.toBeInTheDocument();
  },
);

it.each(["en", "de"] as const)(
  "plays a race with two teams and shows the shortest time as the winner in %s",
  async (language) => {
    let now = 1_000_000;
    vi.spyOn(Date, "now").mockImplementation(() => now);
    const { text, user } = await startRace(language);
    await user.click(
      within(screen.getByRole("group", { name: text.target })).getByRole("radio", { name: "5" }),
    );
    await user.click(screen.getByRole("button", { name: text.start }));
    await user.click(screen.getByRole("button", { name: text.startGame }));

    const overview = await screen.findByRole("region", { name: text.overview });
    expect(within(overview).getAllByText(text.pending)).toHaveLength(2);

    // The first team needs 5 seconds, the second one 3 seconds.
    for (const seconds of [5, 3]) {
      await user.click(screen.getByRole("button", { name: text.startRun }));
      expect(screen.getByRole("region", { name: text.run })).toBeVisible();
      for (let card = 0; card < 5; card += 1) {
        now += (seconds * 1000) / 5;
        await user.click(screen.getByRole("button", { name: new RegExp(`^${text.correct}`) }));
      }
      if (seconds === 5) {
        expect(await screen.findByRole("region", { name: text.overview })).toBeVisible();
      }
    }

    const result = await screen.findByRole("region", { name: text.result });
    expect(within(result).getByRole("status")).toHaveTextContent(text.winner);
    const rows = within(within(result).getByRole("list", { name: text.times })).getAllByRole(
      "listitem",
    );
    // The fastest team is listed first.
    expect(rows[0]).toHaveTextContent(language === "en" ? "3.0 s" : "3,0 s");
    expect(rows[1]).toHaveTextContent(language === "en" ? "5.0 s" : "5,0 s");
    expect(rows[0]).toHaveAttribute("data-winner", "true");
    expect(rows[1]).not.toHaveAttribute("data-winner");

    await user.click(screen.getByRole("button", { name: text.newSetup }));
    expect(screen.getByRole("group", { name: text.mode })).toBeVisible();
    // The final screen is gone, only the setup is left.
    expect(screen.queryByRole("region", { name: text.result })).not.toBeInTheDocument();
  },
);

it("allows one skip per run and replaces a card with a forbidden word", async () => {
  vi.spyOn(Date, "now").mockImplementation(() => 5_000_000);
  const { text, user } = await startRace("en");
  await user.click(screen.getByRole("button", { name: text.start }));
  await user.click(screen.getByRole("button", { name: text.startGame }));
  await user.click(await screen.findByRole("button", { name: text.startRun }));

  const run = screen.getByRole("region", { name: text.run });
  const term = () => within(run).getByRole("heading", { level: 2 }).textContent;
  const first = term();
  await user.click(within(run).getByRole("button", { name: new RegExp(`^${text.skip}`) }));
  expect(term()).not.toBe(first);
  // The skip is used up, the button is gone.
  expect(
    within(run).queryByRole("button", { name: new RegExp(`^${text.skip}`) }),
  ).not.toBeInTheDocument();

  const second = term();
  await user.click(within(run).getByRole("button", { name: new RegExp(`^${text.wrong}`) }));
  expect(term()).not.toBe(second);
  expect(within(run).getByRole("timer")).toBeVisible();
});

it("keeps the settings of both modes when the mode is changed and changed back", async () => {
  const user = userEvent.setup();
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <TabooSetup cardLanguage="en" cards={tabooStandardCards} />
    </I18nextProvider>,
  );
  const radio = (group: string, name: string | RegExp) =>
    within(screen.getByRole("group", { name: group })).getByRole("radio", { name });

  const box = (group: string, name: string) =>
    within(screen.getByRole("group", { name: group })).getByRole("checkbox", { name });

  // Classic settings, a shared setting and the settings of the race.
  await user.click(radio("Rounds per team", /^Long/));
  await user.click(radio("Round duration (seconds)", "90"));
  await user.click(box("Difficulty", "Easy"));
  await user.click(radio("Game mode", "Race"));
  await user.click(radio("Cards per team", "15"));
  expect(screen.queryByRole("group", { name: "Rounds per team" })).not.toBeInTheDocument();

  await user.click(radio("Game mode", "Classic"));
  expect(radio("Rounds per team", /^Long/)).toBeChecked();
  expect(radio("Round duration (seconds)", "90")).toBeChecked();
  expect(box("Difficulty", "Easy")).toBeChecked();

  await user.click(radio("Game mode", "Race"));
  expect(radio("Cards per team", "15")).toBeChecked();
  expect(box("Difficulty", "Easy")).toBeChecked();
});

it("gives every team exactly the same mix of difficulties", async () => {
  vi.spyOn(Date, "now").mockImplementation(() => 7_000_000);
  const { text, user } = await startRace("en");
  await user.click(
    within(screen.getByRole("group", { name: text.target })).getByRole("radio", { name: "5" }),
  );
  await user.click(screen.getByRole("button", { name: text.start }));
  await user.click(screen.getByRole("button", { name: text.startGame }));

  const mixes: string[][] = [];
  for (let team = 0; team < 2; team += 1) {
    await user.click(await screen.findByRole("button", { name: text.startRun }));
    const levels: string[] = [];
    for (let card = 0; card < 5; card += 1) {
      const run = screen.getByRole("region", { name: text.run });
      levels.push(run.querySelector(".taboo-round__difficulty")?.textContent ?? "");
      await user.click(within(run).getByRole("button", { name: new RegExp(`^${text.correct}`) }));
    }
    mixes.push(levels.sort());
  }
  // Five cards are two easy, two medium and one hard for each team, in any order.
  expect(mixes[0]).toEqual(["Easy", "Easy", "Hard", "Medium", "Medium"]);
  expect(mixes[1]).toEqual(mixes[0]);
});

it.each([
  ["en", "Not enough Medium cards"],
  ["de", "Zu wenige Karten der Schwierigkeit Mittel"],
] as const)(
  "reports a missing difficulty instead of giving the teams unequal cards in %s",
  async (language, message) => {
    const text = texts[language];
    const user = userEvent.setup();
    const i18n = await createGameHubI18n(language);
    // Only easy and hard cards: a fair race with all difficulties is not possible.
    const cards = tabooStandardCards.filter((card) => card.difficulty !== "medium");
    render(
      <I18nextProvider i18n={i18n}>
        <TabooSetup cardLanguage={language} cards={cards} />
      </I18nextProvider>,
    );
    await user.click(
      within(screen.getByRole("group", { name: text.mode })).getByRole("radio", {
        name: text.race,
      }),
    );
    await user.click(screen.getByRole("button", { name: text.start }));
    await user.click(screen.getByRole("button", { name: text.startGame }));
    expect(await screen.findByRole("alert")).toHaveTextContent(message);
    expect(screen.queryByRole("region", { name: text.overview })).not.toBeInTheDocument();
  },
);

const rulesTexts = {
  en: {
    legend: "Game mode",
    title: "Taboo rules",
    modes: "Rules for the game mode",
    close: "Close",
    classic: {
      label: "Info about Classic",
      tab: "Classic",
      text: "The team with the most points wins",
    },
    race: { label: "Info about Race", tab: "Race", text: "guesses all cards the fastest wins" },
    tiebreak: { title: "Tiebreak", text: "Every team gets 3 cards" },
  },
  de: {
    legend: "Spielmodus",
    title: "Spielregeln Tabu",
    modes: "Regeln für den Spielmodus",
    close: "Schließen",
    classic: {
      label: "Info zu Klassisch",
      tab: "Klassisch",
      text: "Das Team mit den meisten Punkten gewinnt",
    },
    race: { label: "Info zu Auf Zeit", tab: "Auf Zeit", text: "am schnellsten errät, gewinnt" },
    tiebreak: { title: "Stechen", text: "Jedes Team bekommt 3 Karten" },
  },
} as const;

async function renderSetup(language: "en" | "de") {
  const user = userEvent.setup();
  const i18n = await createGameHubI18n(language);
  render(
    <I18nextProvider i18n={i18n}>
      <TabooSetup cardLanguage={language} cards={tabooStandardCards} />
    </I18nextProvider>,
  );
  return { text: rulesTexts[language], user };
}

it.each(["en", "de"] as const)(
  "shows the rules of all game modes in one window in %s",
  async (language) => {
    const { text, user } = await renderSetup(language);
    // The info button of a game mode opens the window at the rules of this game mode.
    const group = screen.getByRole("group", { name: text.legend });
    await user.click(within(group).getByRole("button", { name: text.classic.label }));
    const dialog = screen.getByRole("dialog", { name: text.title });
    // What is the same in every game mode stands above the game modes.
    expect(within(dialog).getAllByRole("listitem").length).toBeGreaterThanOrEqual(2);
    const modes = within(within(dialog).getByRole("group", { name: text.modes })).getAllByRole(
      "button",
    );
    expect(modes.map((mode) => mode.textContent)).toEqual([text.classic.tab, text.race.tab]);
    expect(modes[0]).toHaveAttribute("aria-pressed", "true");
    // The rules of the other game modes stay in the layout, hidden, so the window keeps its size.
    expect(within(dialog).getByRole("region")).toHaveTextContent(text.classic.text);
    expect(dialog.querySelectorAll("[role=region]")).toHaveLength(2);

    // Another game mode shows its rules; the chosen game mode of the game stays as it is.
    await user.click(modes[1]!);
    expect(modes[1]).toHaveAttribute("aria-pressed", "true");
    expect(within(dialog).getByRole("region")).toHaveTextContent(text.race.text);
    expect(within(dialog).getByRole("region")).not.toHaveTextContent(text.classic.text);
    await user.click(within(dialog).getByRole("button", { name: text.close }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(
      within(group).getByRole("radio", { name: new RegExp(`^${text.classic.tab}`) }),
    ).toBeChecked();
  },
);

it.each(["en", "de"] as const)(
  "opens the rules at the game mode of the info button without choosing the mode in %s",
  async (language) => {
    const { text, user } = await renderSetup(language);
    const group = screen.getByRole("group", { name: text.legend });
    const mode = (tab: string) => within(group).getByRole("radio", { name: new RegExp(`^${tab}`) });
    // One info button per game mode, inside the mode group.
    expect(within(group).getAllByRole("button")).toHaveLength(2);
    expect(mode(text.classic.tab)).toBeChecked();

    await user.click(within(group).getByRole("button", { name: text.race.label }));
    const dialog = screen.getByRole("dialog", { name: text.title });
    expect(within(dialog).getByRole("region")).toHaveTextContent(text.race.text);
    await user.click(within(dialog).getByRole("button", { name: text.close }));
    // The info button only shows the rules: the game mode that was chosen stays chosen.
    expect(mode(text.classic.tab)).toBeChecked();
    expect(mode(text.race.tab)).not.toBeChecked();

    // After the mode was chosen on purpose, the info button of the other mode does not change it.
    await user.click(mode(text.race.tab));
    await user.click(within(group).getByRole("button", { name: text.classic.label }));
    const again = screen.getByRole("dialog", { name: text.title });
    expect(within(again).getByRole("region")).toHaveTextContent(text.classic.text);
    await user.click(within(again).getByRole("button", { name: text.close }));
    expect(mode(text.race.tab)).toBeChecked();
    expect(mode(text.classic.tab)).not.toBeChecked();
  },
);

it.each(["en", "de"] as const)(
  "refers from the classic rules to the tiebreak window in %s",
  async (language) => {
    const { text, user } = await renderSetup(language);
    // Open the classic rules, then the tiebreak from the link in the last bullet.
    await user.click(screen.getByRole("button", { name: text.classic.label }));
    const items = within(screen.getByRole("dialog")).getAllByRole("listitem");
    await user.click(
      within(items[items.length - 1]!).getByRole("button", {
        name: new RegExp(`^${text.tiebreak.title}$`, "i"),
      }),
    );
    // The rules window closes and the tiebreak window takes its place.
    const tiebreak = screen.getByRole("dialog");
    expect(tiebreak).toHaveAccessibleName(text.tiebreak.title);
    expect(tiebreak).toHaveTextContent(text.tiebreak.text);
    await user.click(within(tiebreak).getByRole("button", { name: text.close }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  },
);

it.each([
  ["en", /check the cards/, "Wrong", /Winner: /],
  ["de", /Karten prüfen/, "Falsch", /Gewinner: /],
] as const)(
  "lets the players correct a run on the final screen of the race in %s",
  async (language, summary, wrongLabel, winner) => {
    let now = 1_000_000;
    vi.spyOn(Date, "now").mockImplementation(() => now);
    const { text, user } = await startRace(language);
    await user.click(screen.getByRole("button", { name: text.start }));
    await user.click(screen.getByRole("button", { name: text.startGame }));
    // The first team needs 5 seconds, the second one 3 seconds and wins.
    for (const seconds of [5, 3]) {
      await user.click(screen.getByRole("button", { name: text.startRun }));
      for (let card = 0; card < 5; card += 1) {
        now += (seconds * 1000) / 5;
        await user.click(screen.getByRole("button", { name: new RegExp(`^${text.correct}`) }));
      }
    }
    const result = await screen.findByRole("region", { name: text.result });
    const before = within(result).getByRole("status").textContent;
    expect(before).toMatch(winner);

    // The winner of the run said a forbidden word on one card: it must not count.
    const reviews = within(result).getAllByText(summary);
    expect(reviews).toHaveLength(2);
    await user.click(reviews[1]!);
    const card = within(reviews[1]!.closest("details")!).getAllByRole("button")[0]!;
    expect(card).toHaveAttribute("aria-pressed", "true");
    await user.click(card);
    expect(card).toHaveAttribute("aria-pressed", "false");
    expect(card).toHaveTextContent(wrongLabel);
    // Four of five cards now rank behind the slower team with all cards.
    expect(within(result).getByRole("status").textContent).not.toBe(before);
    expect(within(result).getByRole("list", { name: text.times })).toHaveTextContent("4/5");

    // The correction can be taken back.
    await user.click(card);
    expect(within(result).getByRole("status").textContent).toBe(before);
  },
);
