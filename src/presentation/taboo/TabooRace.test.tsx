import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { afterEach, expect, it, vi } from "vitest";
import { tabooStandardCards } from "../../data/tabooStandardCards";
import { createGameHubI18n } from "../../i18n";
import { TabooSetup } from "./TabooSetup";
import { closeGameSettings, openGameSettings } from "../testing/gameSettings";

const texts = {
  en: {
    mode: "Game mode",
    race: "Race",
    target: "Cards per team per round",
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
    finalTimes: "Final total times",
    totalTimes: "Total times",
    winner: /Winner: /,
    pending: "still to play",
    show: "Show final results",
    reviewTab: /^Last run/,
    newSetup: "Back to the main menu",
  },
  de: {
    mode: "Spielmodus",
    race: "Auf Zeit",
    target: "Karten pro Team pro Runde",
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
    finalTimes: "Gesamtzeiten am Ende",
    totalTimes: "Gesamtzeiten",
    winner: /Gewinner: /,
    pending: "noch offen",
    show: "Endergebnis anzeigen",
    reviewTab: /^Letzter Lauf/,
    newSetup: "Zurück zum Hauptmenü",
  },
} as const;

afterEach(() => {
  vi.restoreAllMocks();
});

/** Starts a race setup; `rounds` is the number of rounds to choose (one by default), null keeps the setting as it is. */
async function startRace(language: "en" | "de", rounds: number | null = 1) {
  const text = texts[language];
  const user = userEvent.setup();
  const i18n = await createGameHubI18n(language);
  render(
    <I18nextProvider i18n={i18n}>
      <TabooSetup cardLanguage={language} cards={tabooStandardCards} />
    </I18nextProvider>,
  );
  openGameSettings();
  const mode = screen.getByRole("group", { name: text.mode });
  await user.click(within(mode).getByRole("radio", { name: text.race }));
  // The tests play one run per team unless they ask for more rounds.
  if (rounds !== null) {
    await user.click(
      within(screen.getByRole("group", { name: text.rounds })).getByRole("radio", {
        name: String(rounds),
      }),
    );
  }
  return { text, user };
}

it.each(["en", "de"] as const)(
  "offers the race settings instead of the round settings in %s",
  async (language) => {
    const { text, user } = await startRace(language, null);
    // The race has its own rounds (1 to 5, three at first), then the cards per team per round, in
    // the same order as the classic mode: rounds first.
    const rounds = screen.getByRole("group", { name: text.rounds });
    expect(
      within(rounds)
        .getAllByRole("radio")
        .map((radio) => (radio as HTMLInputElement).value),
    ).toEqual(["1", "2", "3", "4", "5"]);
    expect(within(rounds).getByRole("radio", { name: "3" })).toBeChecked();
    const target = screen.getByRole("group", { name: text.target });
    expect(rounds.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
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
    const classicRounds = screen.getByRole("group", { name: text.rounds });
    expect(classicRounds).toBeVisible();
    expect(
      within(classicRounds)
        .getAllByRole("radio")
        .map((radio) => (radio as HTMLInputElement).value),
    ).toEqual(["3", "5", "10", "unlimited"]);
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
    closeGameSettings();
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

    // After the last run an overview comes first (the cards can still be checked there).
    await user.click(await screen.findByRole("button", { name: text.show }));
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
    // The line-up comes first again; the settings are one tap away.
    openGameSettings();
    expect(screen.getByRole("group", { name: text.mode })).toBeVisible();
    // The final screen is gone, only the setup is left.
    expect(screen.queryByRole("region", { name: text.result })).not.toBeInTheDocument();
  },
);

it("allows one skip per run and replaces a card with a forbidden word", async () => {
  vi.spyOn(Date, "now").mockImplementation(() => 5_000_000);
  const { text, user } = await startRace("en");
  closeGameSettings();
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

it.each(["en", "de"] as const)(
  "plays two rounds and adds up the times of all runs in %s",
  async (language) => {
    let now = 1_000_000;
    vi.spyOn(Date, "now").mockImplementation(() => now);
    const { text, user } = await startRace(language, 2);
    closeGameSettings();
    await user.click(screen.getByRole("button", { name: text.startGame }));

    // Round 1: Team 1 needs 5 s, Team 2 3 s. Round 2: Team 1 1 s, Team 2 6 s. Team 2 wins the first
    // round, but Team 1 has the shorter total time (6 s against 9 s).
    const runTimes = [5, 3, 1, 6];
    for (const [index, seconds] of runTimes.entries()) {
      const overview = await screen.findByRole("region", { name: text.overview });
      // The overview says which round is next and shows the total times so far.
      expect(overview).toHaveTextContent(
        language === "en" ? `Round ${index < 2 ? 1 : 2}/2` : `Runde ${index < 2 ? 1 : 2}/2`,
      );
      await user.click(screen.getByRole("button", { name: text.startRun }));
      for (let card = 0; card < 5; card += 1) {
        now += (seconds * 1000) / 5;
        await user.click(screen.getByRole("button", { name: new RegExp(`^${text.correct}`) }));
      }
      if (index === 1) {
        // After round 1 both teams have played one run: Team 2 (3 s) is ahead of Team 1 (5 s).
        const done = await screen.findByRole("region", { name: text.overview });
        await user.click(within(done).getByRole("tab", { name: text.totalTimes }));
        const rows = within(within(done).getByRole("list", { name: text.totalTimes })).getAllByRole(
          "listitem",
        );
        expect(rows[0]).toHaveTextContent("Team 2");
        expect(rows[0]).toHaveTextContent(language === "en" ? "3.0 s" : "3,0 s");
      }
    }

    await user.click(await screen.findByRole("button", { name: text.show }));
    const result = await screen.findByRole("region", { name: text.result });
    expect(within(result).getByRole("status")).toHaveTextContent(text.winner);
    const rows = within(within(result).getByRole("list", { name: text.finalTimes })).getAllByRole(
      "listitem",
    );
    expect(rows[0]).toHaveTextContent("Team 1");
    expect(rows[0]).toHaveTextContent(language === "en" ? "6.0 s" : "6,0 s");
    expect(rows[1]).toHaveTextContent(language === "en" ? "9.0 s" : "9,0 s");
    expect(rows[0]).toHaveAttribute("data-winner", "true");
  },
);

it("puts the hard cards last in a run and gives every run the same mix", async () => {
  vi.spyOn(Date, "now").mockImplementation(() => 3_000_000);
  const { text, user } = await startRace("en", 2);
  await user.click(screen.getByRole("checkbox", { name: "Medium" }));
  await user.click(screen.getByRole("checkbox", { name: "Hard" }));
  closeGameSettings();
  await user.click(screen.getByRole("button", { name: text.startGame }));

  // Four runs (two teams, two rounds): in each one the cards go from easy to hard.
  for (let runNumber = 0; runNumber < 4; runNumber += 1) {
    await user.click(await screen.findByRole("button", { name: text.startRun }));
    const levels: string[] = [];
    for (let card = 0; card < 5; card += 1) {
      const run = screen.getByRole("region", { name: text.run });
      levels.push(run.querySelector(".taboo-round__difficulty")?.textContent ?? "");
      await user.click(within(run).getByRole("button", { name: new RegExp(`^${text.correct}`) }));
    }
    expect(levels).toEqual(["Easy", "Easy", "Medium", "Medium", "Hard"]);
  }
});

it("keeps the settings of both modes when the mode is changed and changed back", async () => {
  const user = userEvent.setup();
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <TabooSetup cardLanguage="en" cards={tabooStandardCards} />
    </I18nextProvider>,
  );
  openGameSettings();
  const radio = (group: string, name: string | RegExp) =>
    within(screen.getByRole("group", { name: group })).getByRole("radio", { name });

  const box = (group: string, name: string) =>
    within(screen.getByRole("group", { name: group })).getByRole("checkbox", { name });

  // Classic settings, a shared setting and the settings of the race.
  await user.click(radio("Rounds per team", /^Long/));
  await user.click(radio("Round duration (seconds)", "90"));
  // Only Easy is chosen at first; Medium is added.
  await user.click(box("Difficulty (several possible)", "Medium"));
  await user.click(radio("Game mode", "Race"));
  await user.click(radio("Cards per team per round", "15"));
  await user.click(radio("Rounds per team", "4"));

  await user.click(radio("Game mode", "Classic"));
  expect(radio("Rounds per team", /^Long/)).toBeChecked();
  expect(radio("Round duration (seconds)", "90")).toBeChecked();
  expect(box("Difficulty (several possible)", "Medium")).toBeChecked();

  await user.click(radio("Game mode", "Race"));
  expect(radio("Cards per team per round", "15")).toBeChecked();
  expect(radio("Rounds per team", "4")).toBeChecked();
  expect(box("Difficulty (several possible)", "Medium")).toBeChecked();
});

it("gives every team exactly the same mix of difficulties", async () => {
  vi.spyOn(Date, "now").mockImplementation(() => 7_000_000);
  const { text, user } = await startRace("en");
  await user.click(
    within(screen.getByRole("group", { name: text.target })).getByRole("radio", { name: "5" }),
  );
  // Only Easy is chosen at first; the mix needs all three difficulties.
  await user.click(screen.getByRole("checkbox", { name: "Medium" }));
  await user.click(screen.getByRole("checkbox", { name: "Hard" }));
  closeGameSettings();
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
    openGameSettings();
    await user.click(
      within(screen.getByRole("group", { name: text.mode })).getByRole("radio", {
        name: text.race,
      }),
    );
    // Medium is chosen on purpose: there are no Medium cards.
    await user.click(screen.getByRole("checkbox", { name: /^(Medium|Mittel)$/ }));
    closeGameSettings();
    await user.click(screen.getByRole("button", { name: text.startGame }));
    expect(await screen.findByRole("alert")).toHaveTextContent(message);
    expect(screen.queryByRole("region", { name: text.overview })).not.toBeInTheDocument();
  },
);

const rulesTexts = {
  en: {
    legend: "Game mode",
    title: "Taboo rules",
    all: "All rules",
    classicInfo: "Several rounds with a timer.",
    raceInfo: "each team solves the same number of cards",
    close: "Close",
    classic: {
      label: "Info about Classic",
      tab: "Classic",
      text: "The team with the most points wins",
    },
    race: { label: "Info about Race", tab: "Race", text: "The shortest total time wins" },
    tiebreak: { title: "Tiebreak", text: "the teams play 3 cards in 90 seconds" },
  },
  de: {
    legend: "Spielmodus",
    title: "Spielregeln Tabu",
    all: "Alle Regeln",
    classicInfo: "Mehrere Runden mit Zeit.",
    raceInfo: "löst jedes Team gleich viele Karten",
    close: "Schließen",
    classic: {
      label: "Info zu Klassisch",
      tab: "Klassisch",
      text: "Das Team mit den meisten Punkten gewinnt",
    },
    race: { label: "Info zu Auf Zeit", tab: "Auf Zeit", text: "Kürzeste Gesamtzeit gewinnt" },
    tiebreak: { title: "Stechen", text: "spielen die Teams 3 Karten in 90 Sekunden" },
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
  openGameSettings();
  return { text: rulesTexts[language], user };
}

it.each(["en", "de"] as const)(
  "explains a game mode in a sentence with its info button and leads to all rules in %s",
  async (language) => {
    const { text, user } = await renderSetup(language);
    const group = screen.getByRole("group", { name: text.legend });
    const mode = (tab: string) => within(group).getByRole("radio", { name: new RegExp(`^${tab}`) });
    // One info button per game mode, inside the mode group.
    expect(within(group).getAllByRole("button")).toHaveLength(2);
    expect(mode(text.classic.tab)).toBeChecked();

    // The info button explains only this game mode, in a sentence or two, without choosing it.
    await user.click(within(group).getByRole("button", { name: text.race.label }));
    const info = screen.getByRole("dialog", { name: text.race.tab });
    expect(info).toHaveTextContent(text.raceInfo);
    expect(info.querySelectorAll("p")).toHaveLength(1);
    expect(mode(text.classic.tab)).toBeChecked();
    expect(mode(text.race.tab)).not.toBeChecked();

    // The button "All rules" leads to the rules window.
    await user.click(within(info).getByRole("button", { name: text.all }));
    const rules = screen.getByRole("dialog", { name: text.title });
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    await user.click(within(rules).getByRole("button", { name: text.close }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // After the mode was chosen on purpose, the info button of the other mode does not change it.
    await user.click(mode(text.race.tab));
    await user.click(within(group).getByRole("button", { name: text.classic.label }));
    expect(screen.getByRole("dialog", { name: text.classic.tab })).toHaveTextContent(
      text.classicInfo,
    );
    await user.click(screen.getByRole("button", { name: text.close }));
    expect(mode(text.race.tab)).toBeChecked();
    expect(mode(text.classic.tab)).not.toBeChecked();
  },
);

it.each(["en", "de"] as const)(
  "refers from the rules of the classic mode to the tiebreak window in %s",
  async (language) => {
    const { text, user } = await renderSetup(language);
    // Open the rules through the info button of a game mode, then the tiebreak from the link.
    await user.click(screen.getByRole("button", { name: text.classic.label }));
    await user.click(screen.getByRole("button", { name: text.all }));
    const rules = screen.getByRole("dialog", { name: text.title });
    await user.click(
      within(rules).getByRole("button", { name: new RegExp(`^${text.tiebreak.title}$`, "i") }),
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
  ["en", "Wrong"],
  ["de", "Falsch"],
] as const)(
  "lets the players correct the last run before the final screen of the race in %s",
  async (language, wrongLabel) => {
    let now = 1_000_000;
    vi.spyOn(Date, "now").mockImplementation(() => now);
    const { text, user } = await startRace(language);
    closeGameSettings();
    await user.click(screen.getByRole("button", { name: text.startGame }));
    // The first team needs 5 seconds, the second one 3 seconds and wins.
    for (const seconds of [5, 3]) {
      await user.click(screen.getByRole("button", { name: text.startRun }));
      for (let card = 0; card < 5; card += 1) {
        now += (seconds * 1000) / 5;
        await user.click(screen.getByRole("button", { name: new RegExp(`^${text.correct}`) }));
      }
    }
    // The last run is checked on the overview before the final screen; there the winner changes.
    const overview = await screen.findByRole("region", { name: text.overview });
    await user.click(within(overview).getByRole("tab", { name: text.reviewTab }));

    // The winner of the run said a forbidden word on one card: it must not count.
    // Like the last round of the classic mode: only the run that was just played (Team 2) can be
    // corrected; the run before cannot be changed any more.
    expect(within(overview).queryByRole("radio")).not.toBeInTheDocument();
    expect(within(overview).getByRole("heading", { name: /Team 2$/ })).toBeVisible();
    const card = within(overview.querySelector<HTMLElement>(".taboo-review")!).getAllByRole(
      "button",
    )[0]!;
    expect(card).toHaveAttribute("aria-pressed", "true");
    await user.click(card);
    expect(card).toHaveAttribute("aria-pressed", "false");
    expect(card).toHaveTextContent(wrongLabel);
    // The correction can be taken back and made again.
    await user.click(card);
    expect(card).toHaveAttribute("aria-pressed", "true");
    await user.click(card);
    expect(card).toHaveAttribute("aria-pressed", "false");

    // Four of five cards now rank behind the slower team with all cards: the other team wins.
    await user.click(within(overview).getByRole("button", { name: text.show }));
    const result = await screen.findByRole("region", { name: text.result });
    expect(within(result).getByRole("status").textContent).toMatch(/Team 1/);
    expect(within(result).getByRole("list", { name: text.times })).toHaveTextContent("4/5");
    // The final screen only shows the result: there is nothing to correct any more.
    expect(within(result).queryByRole("tab")).not.toBeInTheDocument();
    expect(
      within(result).queryByRole("heading", { name: /^(Played run|Gespielter Lauf)/ }),
    ).not.toBeInTheDocument();
  },
);
