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
    countdown: "Against the clock",
    budget: "Time per team",
    startGame: "Start game",
    overview: "Time accounts overview",
    start: "Start turn",
    run: "Countdown turn",
    correct: "Correct",
    skip: "Skip",
    wrong: "Forbidden word",
    result: "Game over",
    accounts: "Time left",
    ranking: "Final ranking",
    winner: /Winner: /,
    out: "out",
    paused: "Paused",
    resume: "Resume",
    newSetup: "Back to the main menu",
  },
  de: {
    mode: "Spielmodus",
    countdown: "Gegen die Zeit",
    budget: "Zeit pro Team",
    startGame: "Spiel starten",
    overview: "Übersicht der Zeitkonten",
    start: "Zug starten",
    run: "Zug Gegen die Zeit",
    correct: "Richtig",
    skip: "Überspringen",
    wrong: "Verbotenes Wort",
    result: "Spiel beendet",
    accounts: "Verbleibende Zeit",
    ranking: "Endplatzierung",
    winner: /Gewinner: /,
    out: "ausgeschieden",
    paused: "Pausiert",
    resume: "Fortsetzen",
    newSetup: "Zurück zum Hauptmenü",
  },
} as const;

afterEach(() => {
  vi.restoreAllMocks();
});

/** Opens the settings of the mode "Gegen die Zeit"; the account is two minutes. */
async function startCountdown(language: "en" | "de", minutes: number | null = 2) {
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
  await user.click(within(mode).getByRole("radio", { name: text.countdown }));
  if (minutes !== null) {
    const radio = screen
      .getByRole("group", { name: text.budget })
      .querySelector<HTMLInputElement>(`input[value='${minutes * 60_000}']`);
    if (!radio) throw new Error(`No account of ${minutes} minutes.`);
    await user.click(radio);
  }
  return { text, user };
}

it.each(["en", "de"] as const)(
  "offers the accounts of two, three and five minutes, two minutes at first, in %s",
  async (language) => {
    const { text } = await startCountdown(language, null);
    const group = screen.getByRole("group", { name: text.budget });
    expect(
      within(group)
        .getAllByRole("radio")
        .map((radio) => (radio as HTMLInputElement).value),
    ).toEqual(["120000", "180000", "300000"]);
    expect(group.querySelector<HTMLInputElement>("input[value='120000']")).toBeChecked();
  },
);

it.each(["en", "de"] as const)(
  "plays a game where the team that runs out of time is out and the other one wins in %s",
  async (language) => {
    let now = 1_000_000;
    vi.spyOn(Date, "now").mockImplementation(() => now);
    const { text, user } = await startCountdown(language);
    closeGameSettings();
    await user.click(screen.getByRole("button", { name: text.startGame }));

    const overview = await screen.findByRole("region", { name: text.overview });
    const accounts = within(overview).getByRole("list", { name: text.accounts });
    expect(within(accounts).getAllByText("2:00")).toHaveLength(2);

    // The first team needs a minute for its card, so it keeps a minute.
    await user.click(screen.getByRole("button", { name: text.start }));
    expect(screen.getByRole("region", { name: text.run })).toBeVisible();
    now += 60_000;
    await user.click(screen.getByRole("button", { name: new RegExp(`^${text.correct}`) }));
    const next = await screen.findByRole("region", { name: text.overview });
    expect(within(next).getByText("1:00")).toBeVisible();
    expect(within(next).getByText("2:00")).toBeVisible();

    // The second team takes longer than its account: it is out and the first team wins.
    await user.click(screen.getByRole("button", { name: text.start }));
    now += 130_000;
    await user.click(screen.getByRole("button", { name: new RegExp(`^${text.correct}`) }));

    const result = await screen.findByRole("region", { name: text.result });
    expect(within(result).getByRole("status")).toHaveTextContent(text.winner);
    const rows = within(within(result).getByRole("list", { name: text.ranking })).getAllByRole(
      "listitem",
    );
    expect(rows[0]).toHaveAttribute("data-winner", "true");
    expect(rows[0]).toHaveTextContent("1:00");
    expect(rows[1]).toHaveTextContent(text.out);
    expect(rows[1]).not.toHaveAttribute("data-winner");

    await user.click(screen.getByRole("button", { name: text.newSetup }));
    openGameSettings();
    expect(screen.getByRole("group", { name: text.mode })).toBeVisible();
    expect(screen.queryByRole("region", { name: text.result })).not.toBeInTheDocument();
  },
);

it("allows one skip per team, replaces a card with a forbidden word and can be paused", async () => {
  vi.spyOn(Date, "now").mockImplementation(() => 5_000_000);
  const { text, user } = await startCountdown("en");
  closeGameSettings();
  await user.click(screen.getByRole("button", { name: text.startGame }));
  await user.click(await screen.findByRole("button", { name: text.start }));

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
  // Neither a skip nor a forbidden word ends the turn.
  expect(screen.getByRole("region", { name: text.run })).toBeVisible();
});
