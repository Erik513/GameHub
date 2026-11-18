import { expect, test, type Page } from "@playwright/test";
import { snapshotStyles } from "./styleSnapshot";

const labels = {
  en: {
    open: "Play",
    settings: "Settings",
    close: "Close",
    done: "Done",
    startGame: "Start game",
    startRound: "Start round",
    forbidden: "Forbidden word",
    skip: "Skip",
    correct: "Correct",
    pause: "Pause",
    resume: "Resume",
    endRound: "End round",
    endRoundConfirm: "Tap again to end",
    show: "Show final results",
    startTiebreak: "Start tiebreak",
    endAttempt: "End attempt",
    endAttemptConfirm: "Tap again to end",
    interfaceLanguage: "Interface language",
    players: "Players",
    addPlayer: "Add player",
    addButton: "Add",
    draw: "Draw teams",
    noTeam: "No team",
    cards: "Cards",
    categories: "Categories",
    manage: "Categories and cards",
    rules: "Rules",
    settingsTab: "Game settings",
  },
  de: {
    open: "Spielen",
    settings: "Einstellungen",
    close: "Schließen",
    done: "Fertig",
    startGame: "Spiel starten",
    startRound: "Runde starten",
    forbidden: "Verbotenes Wort",
    skip: "Überspringen",
    correct: "Richtig",
    pause: "Pause",
    resume: "Fortsetzen",
    endRound: "Runde beenden",
    endRoundConfirm: "Nochmal tippen zum Beenden",
    show: "Endergebnis anzeigen",
    startTiebreak: "Stechen starten",
    endAttempt: "Versuch beenden",
    endAttemptConfirm: "Nochmal tippen zum Beenden",
    interfaceLanguage: "Oberflächensprache",
    players: "Spieler",
    addPlayer: "Spieler hinzufügen",
    addButton: "Hinzufügen",
    draw: "Teams auslosen",
    noTeam: "Ohne Team",
    cards: "Karten",
    categories: "Kategorien",
    manage: "Kategorien und Karten",
    rules: "Spielregeln",
    settingsTab: "Spieleinstellungen",
  },
} as const;

/** The phones the other checks run at, from the small one to the tiny one. */
const smallPhones = [
  { name: "small phone", width: 360, height: 640 },
  { name: "tiny phone", width: 320, height: 568 },
] as const;

const viewports = [
  { name: "tiny phone", width: 320, height: 568 },
  { name: "small phone", width: 360, height: 640 },
  { name: "large phone", width: 412, height: 915 },
] as const;

/** Smallest comfortable touch target in CSS pixels. */
const minimumTarget = 44;

interface Violation {
  readonly kind: string;
  readonly detail: string;
}

/** Looks for layout problems that make a screen hard to use with one hand. */
async function audit(page: Page, screen: string): Promise<string[]> {
  await snapshotStyles(page, screen);
  const violations = await page.evaluate<Violation[], number>((minimum) => {
    const found: Violation[] = [];
    const describe = (element: Element) =>
      `${element.tagName.toLowerCase()}${element.className ? `.${String(element.className).split(" ")[0]}` : ""} "${(element.textContent ?? "").trim().slice(0, 30)}"`;
    const visible = (element: Element) => {
      const rect = element.getBoundingClientRect();
      // Visually hidden helpers (1px) are not part of the visible layout.
      if (rect.width <= 2 || rect.height <= 2) return false;
      if (element.closest("[hidden], .visually-hidden")) return false;
      const style = getComputedStyle(element);
      return style.visibility !== "hidden" && style.display !== "none";
    };

    if (document.documentElement.scrollWidth > window.innerWidth) {
      found.push({
        kind: "horizontal scroll",
        detail: `${document.documentElement.scrollWidth} > ${window.innerWidth}`,
      });
    }

    // One page: the setup screens never scroll as a page, only the box of the chosen tab does.
    if (
      document.querySelector(".kit-onepage, .game-library") &&
      document.documentElement.scrollHeight > window.innerHeight
    ) {
      found.push({
        kind: "page scroll on a one-page screen",
        detail: `${document.documentElement.scrollHeight} > ${window.innerHeight}`,
      });
    }

    // The tab fills the area and ends above the pinned button: nothing sticks out of the screen.
    for (const page of document.querySelectorAll(".kit-onepage")) {
      if (!visible(page)) continue;
      const rect = page.getBoundingClientRect();
      if (rect.bottom > window.innerHeight + 1) {
        found.push({
          kind: "one-page area taller than the screen",
          detail: `${rect.bottom} > ${window.innerHeight}`,
        });
      }
      const panel = page.querySelector(".kit-tabpanel[data-active=true]");
      const bar = page.querySelector(".kit-start-bar");
      if (
        panel &&
        bar &&
        panel.getBoundingClientRect().bottom > bar.getBoundingClientRect().top + 1
      ) {
        found.push({ kind: "tab covered by the start button", detail: describe(panel) });
      }
    }

    // A card with its forbidden words is never covered by the buttons and never cut off.
    const turnCard = document.querySelector(".taboo-round__card");
    if (turnCard && turnCard.scrollHeight > turnCard.clientHeight + 1) {
      found.push({
        kind: "card of the turn scrolls",
        detail: `${turnCard.scrollHeight} > ${turnCard.clientHeight}`,
      });
    }
    const outcomeBar = document.querySelector(".taboo-round__actions");
    for (const word of document.querySelectorAll(".taboo-round__card li")) {
      if (!visible(word) || !outcomeBar) continue;
      const rect = word.getBoundingClientRect();
      if (rect.bottom > outcomeBar.getBoundingClientRect().top + 1) {
        found.push({ kind: "forbidden word covered by the buttons", detail: describe(word) });
      }
    }

    const targets = document.querySelectorAll(
      "button, a[href], summary, select, input[type=text], label.kit-choice, .taboo-review__item",
    );
    for (const element of targets) {
      if (!visible(element)) continue;
      // A link inside a sentence may be as small as its text (an inline link is exempt from the target size).
      if (element.matches(".kit-link-button")) continue;
      const rect = element.getBoundingClientRect();
      // A button next to a heading is flat; its invisible tap layer reaches 6 px over it (12 px in total).
      const flat = element.matches(".kit-heading-button");
      const height = rect.height + (flat ? 12 : 0);
      const width = rect.width + (flat ? 8 : 0);
      if (height < minimum - 0.5 || width < minimum - 0.5) {
        found.push({
          kind: "small touch target",
          detail: `${describe(element)} ${Math.round(rect.width)}x${Math.round(rect.height)}`,
        });
      }
      const name =
        element.getAttribute("aria-label") ??
        (element.textContent ?? "").trim() ??
        element.getAttribute("title");
      if (!name && element.matches("button, a[href], summary")) {
        found.push({ kind: "control without a name", detail: describe(element) });
      }
      if (rect.left < -0.5 || rect.right > window.innerWidth + 0.5) {
        found.push({ kind: "outside the screen", detail: describe(element) });
      }
    }

    // Clipped or overflowing text inside buttons, chips and list rows.
    for (const element of document.querySelectorAll(
      "button, label.kit-choice span, li, h1, h2, p",
    )) {
      if (!visible(element)) continue;
      if (
        element.scrollWidth > element.clientWidth + 1 &&
        getComputedStyle(element).overflowX !== "visible"
      ) {
        found.push({ kind: "clipped text", detail: describe(element) });
      }
      const rect = element.getBoundingClientRect();
      if (rect.right > window.innerWidth + 1) {
        found.push({ kind: "text outside the screen", detail: describe(element) });
      }
    }

    // The pinned main action must be reachable without scrolling the page.
    const bar = document.querySelector(".kit-start-bar");
    if (bar && visible(bar)) {
      const rect = bar.getBoundingClientRect();
      if (rect.bottom > window.innerHeight + 1) {
        found.push({
          kind: "action bar below the screen",
          detail: `${Math.round(rect.bottom)} > ${window.innerHeight}`,
        });
      }
    }
    return found;
  }, minimumTarget);
  return violations.map((item) => `${screen}: ${item.kind} - ${item.detail}`);
}

for (const language of ["en", "de"] as const) {
  for (const viewport of viewports) {
    test(`every Taboo screen fits a ${viewport.name} in ${language}`, async ({
      page,
    }, testInfo) => {
      test.skip(
        testInfo.project.name !== "mobile-chromium",
        "The layout audit runs on mobile only.",
      );
      const t = labels[language];
      const problems: string[] = [];
      const check = async (screen: string) => problems.push(...(await audit(page, screen)));
      const press = (name: string, exact = true) =>
        page.getByRole("button", { name, exact }).first().click();

      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.clock.install();
      // Keep the shuffled order stable: Team 1 plays first.
      await page.addInitScript(() => {
        Math.random = () => 0.99;
      });
      await page.goto("/");
      if (language === "de") {
        await press(labels.en.settings);
        await page
          .getByRole("group", { name: labels.en.interfaceLanguage })
          .getByRole("radio", { name: "German" })
          .check({ force: true });
        await page.getByRole("dialog").getByRole("button", { name: labels.de.close }).click();
      }
      await check("game selection");
      await press(t.settings);
      await check("settings dialog");
      await page.getByRole("dialog").getByRole("button", { name: t.close }).click();

      await press(t.open);
      // The game opens on its line-up; the settings are their own screen above it.
      await check("line-up");
      // The rules are one tap away on the line-up (the settings have the back arrow in the header).
      await press(t.rules);
      await check("rules dialog");
      await page.getByRole("dialog").getByRole("button", { name: t.close }).click();
      await press(t.settingsTab);
      await check("setup");
      await page.getByRole("tab", { name: t.categories, exact: true }).click();
      await check("setup cards");
      await page.getByRole("tab", { name: t.settingsTab, exact: true }).click();
      await press(t.done);
      // The same screen with players in the boxes: some drawn into teams, one waiting without a team.
      await page.getByRole("tab", { name: new RegExp(`^${t.players}`) }).click();
      await page
        .getByRole("textbox", { name: t.addPlayer })
        .fill("Anna, Benedikt, Cara, Dorothea, Emil");
      await page.getByRole("button", { name: t.addButton, exact: true }).click();
      await check("line-up with players");
      await page.getByRole("tab", { name: /^Teams/ }).click();
      await check("line-up, tab teams");
      await press(t.draw);
      await page.getByRole("button", { name: "Emil", exact: true }).first().click();
      await page.getByRole("dialog").getByRole("button", { name: t.noTeam }).click();
      await check("line-up with teams and a player without a team");
      await press(t.startGame);
      await check("overview before the first turn");

      // First turn with one wrong, one skipped and several scored cards for a long review.
      await press(t.startRound);
      await check("running round");
      await press(t.forbidden);
      await press(t.skip);
      for (let card = 0; card < 4; card += 1) await press(t.correct);
      await press(t.pause);
      await check("paused round");
      await press(t.resume);
      await press(t.pause);
      await press(t.endRound);
      // A second tap confirms; it counts only after a short moment.
      await page.clock.fastForward(500);
      await press(t.endRoundConfirm);
      await check("round review");

      for (let turn = 0; turn < 5; turn += 1) {
        await press(t.startRound);
        await page.clock.fastForward(60_000);
      }
      await press(t.show);
      await check("final result or tiebreak overview");
      // Team 1 scored in the first turn, so there is a single winner and no tiebreak.
      expect(problems, problems.join("\n")).toEqual([]);
    });
  }
}

for (const size of smallPhones)
  test(`the tiebreak screens fit a small phone in both languages (${size.name})`, async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-chromium", "The layout audit runs on mobile only.");
    const problems: string[] = [];
    for (const language of ["en", "de"] as const) {
      const t = labels[language];
      await page.setViewportSize({ width: size.width, height: size.height });
      await page.clock.install();
      await page.addInitScript(() => {
        Math.random = () => 0.99;
      });
      await page.goto("/");
      if (language === "de") {
        await page.getByRole("button", { name: labels.en.settings }).click();
        await page
          .getByRole("group", { name: labels.en.interfaceLanguage })
          .getByRole("radio", { name: "German" })
          .check({ force: true });
        await page.getByRole("dialog").getByRole("button", { name: labels.de.close }).click();
      }
      const check = async (screen: string) =>
        problems.push(...(await audit(page, `${language} ${screen}`)));
      const press = (name: string) =>
        page.getByRole("button", { name, exact: true }).first().click();

      await press(t.open);
      await press(t.startGame);
      // Nobody scores in the six turns of a short game, so the game ends in a tie.
      for (let turn = 0; turn < 6; turn += 1) {
        await press(t.startRound);
        await page.clock.fastForward(60_000);
      }
      // A tie: the button leads to the tiebreak and says so.
      await press(t.startTiebreak);
      await check("tiebreak overview");
      await press(t.startTiebreak);
      await check("tiebreak attempt");
      await press(t.pause);
      await check("paused tiebreak attempt");
      await press(t.resume);
      for (let card = 0; card < 3; card += 1) await press(t.correct);
      await check("tiebreak overview with a result");
      await press(t.startTiebreak);
      await press(t.pause);
      await press(t.endAttempt);
      // A second tap confirms; it counts only after a short moment.
      await page.clock.fastForward(500);
      await press(t.endAttemptConfirm);
      await check("summary after the tiebreak");
      await press(t.show);
      await check("final result after the tiebreak");
    }
    expect(problems, problems.join("\n")).toEqual([]);
  });

const raceLabels = {
  en: { mode: "Game mode", race: "Race", startRun: "Start run" },
  de: { mode: "Spielmodus", race: "Auf Zeit", startRun: "Lauf starten" },
} as const;

for (const size of smallPhones)
  test(`the race screens fit a small phone in both languages (${size.name})`, async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-chromium", "The layout audit runs on mobile only.");
    const problems: string[] = [];
    for (const language of ["en", "de"] as const) {
      const t = labels[language];
      const race = raceLabels[language];
      await page.setViewportSize({ width: size.width, height: size.height });
      await page.clock.install();
      await page.addInitScript(() => {
        Math.random = () => 0.99;
      });
      await page.goto("/");
      if (language === "de") {
        await page.getByRole("button", { name: labels.en.settings }).click();
        await page
          .getByRole("group", { name: labels.en.interfaceLanguage })
          .getByRole("radio", { name: "German" })
          .check({ force: true });
        await page.getByRole("dialog").getByRole("button", { name: labels.de.close }).click();
      }
      const check = async (screen: string) =>
        problems.push(...(await audit(page, `${language} ${screen}`)));
      const press = (name: string) =>
        page.getByRole("button", { name, exact: true }).first().click();

      await press(t.open);
      await press(t.settingsTab);
      const mode = page.getByRole("group", { name: race.mode });
      // Bring the group to the middle so the start bar at the bottom does not cover it.
      await mode.evaluate((element) => element.scrollIntoView({ block: "center" }));
      await mode
        .getByRole("radio", { name: race.race })
        .evaluate((element) => (element as HTMLInputElement).click());
      await check("race setup");
      await press(t.done);
      await check("race line-up");
      await press(t.startGame);
      await check("race overview before the first run");

      await press(race.startRun);
      await check("running race");
      await press(t.pause);
      await check("paused race");
      await press(t.resume);
      // A run has three cards (the default of the race).
      for (let card = 0; card < 3; card += 1) await press(t.correct);
      await check("race overview with a time");

      await press(race.startRun);
      // A run has three cards (the default of the race).
      for (let card = 0; card < 3; card += 1) await press(t.correct);
      await check("race result");
    }
    expect(problems, problems.join("\n")).toEqual([]);
  });

for (const size of smallPhones)
  test(`the card editor is one page with two tabs on a small phone in both languages (${size.name})`, async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-chromium", "The layout audit runs on mobile only.");
    const problems: string[] = [];
    const addTab = { en: "Add card", de: "Karte hinzufügen" } as const;
    for (const language of ["en", "de"] as const) {
      const t = labels[language];
      await page.setViewportSize({ width: size.width, height: size.height });
      await page.goto("/");
      if (language === "de") {
        await page.getByRole("button", { name: labels.en.settings }).click();
        await page
          .getByRole("group", { name: labels.en.interfaceLanguage })
          .getByRole("radio", { name: "German" })
          .check({ force: true });
        await page.getByRole("dialog").getByRole("button", { name: labels.de.close }).click();
      }
      await page.getByRole("button", { name: t.open, exact: true }).first().click();
      await page.getByRole("button", { name: t.settingsTab, exact: true }).click();
      await page.getByRole("tab", { name: t.categories, exact: true }).click();
      await page
        .locator('.kit-tabpanel[data-active="true"]')
        .getByRole("button", { name: t.manage, exact: true })
        .click();
      // The cards are the left tab, the form to add a card the right one.
      const tabs = page.locator(".kit-manage").getByRole("tab");
      await expect(tabs).toHaveText([t.cards, addTab[language]]);
      problems.push(...(await audit(page, `${language} card editor: cards`)));
      // An opened category shows its cards; the way back stays in the header.
      await page.locator(".kit-nav-row").first().click();
      problems.push(...(await audit(page, `${language} card editor: category`)));
      await tabs.nth(1).click();
      problems.push(...(await audit(page, `${language} card editor: add`)));
    }
    expect(problems, problems.join("\n")).toEqual([]);
  });

const countdownLabels = {
  en: { mode: "Game mode", countdown: "Against the clock", start: "Start turn" },
  de: { mode: "Spielmodus", countdown: "Gegen die Zeit", start: "Zug starten" },
} as const;

for (const size of smallPhones)
  test(`the countdown screens fit a small phone in both languages (${size.name})`, async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-chromium", "The layout audit runs on mobile only.");
    const problems: string[] = [];
    for (const language of ["en", "de"] as const) {
      const t = labels[language];
      const countdown = countdownLabels[language];
      await page.setViewportSize({ width: size.width, height: size.height });
      await page.clock.install();
      await page.addInitScript(() => {
        Math.random = () => 0.99;
      });
      await page.goto("/");
      if (language === "de") {
        await page.getByRole("button", { name: labels.en.settings }).click();
        await page
          .getByRole("group", { name: labels.en.interfaceLanguage })
          .getByRole("radio", { name: "German" })
          .check({ force: true });
        await page.getByRole("dialog").getByRole("button", { name: labels.de.close }).click();
      }
      const check = async (screen: string) =>
        problems.push(...(await audit(page, `${language} ${screen}`)));
      const press = (name: string) =>
        page.getByRole("button", { name, exact: true }).first().click();

      await press(t.open);
      await press(t.settingsTab);
      const mode = page.getByRole("group", { name: countdown.mode });
      await mode.evaluate((element) => element.scrollIntoView({ block: "center" }));
      await mode
        .getByRole("radio", { name: countdown.countdown })
        .evaluate((element) => (element as HTMLInputElement).click());
      await page
        .getByRole("group", { name: switchLabels[language].change })
        .getByRole("radio", { name: switchLabels[language].manual })
        .evaluate((element) => (element as HTMLInputElement).click());
      await check("countdown setup");
      await press(t.done);
      await press(t.startGame);
      await check("countdown overview before the first turn");

      await press(countdown.start);
      await check("running countdown");
      await press(t.pause);
      await check("paused countdown");
      await press(t.resume);
      await press(t.correct);
      await check("countdown overview with a time");

      // The second team lets its whole account run out, so the first team wins.
      await press(countdown.start);
      await page.clock.fastForward(400_000);
      await page.getByRole("status").first().waitFor();
      await check("countdown result");
    }
    expect(problems, problems.join("\n")).toEqual([]);
  });

const switchLabels = {
  en: { change: "Team change", auto: "Automatic", manual: "Manual" },
  de: { change: "Teamwechsel", auto: "Automatisch", manual: "Manuell" },
} as const;

for (const size of smallPhones)
  test(`the countdown with the automatic team change fits a small phone (${size.name})`, async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-chromium", "The layout audit runs on mobile only.");
    const problems: string[] = [];
    for (const language of ["en", "de"] as const) {
      const t = labels[language];
      const countdown = countdownLabels[language];
      const change = switchLabels[language];
      await page.setViewportSize({ width: size.width, height: size.height });
      await page.clock.install();
      await page.addInitScript(() => {
        Math.random = () => 0.99;
      });
      await page.goto("/");
      if (language === "de") {
        await page.getByRole("button", { name: labels.en.settings }).click();
        await page
          .getByRole("group", { name: labels.en.interfaceLanguage })
          .getByRole("radio", { name: "German" })
          .check({ force: true });
        await page.getByRole("dialog").getByRole("button", { name: labels.de.close }).click();
      }
      const check = async (screen: string) =>
        problems.push(...(await audit(page, `${language} ${screen}`)));
      const press = (name: string) =>
        page.getByRole("button", { name, exact: true }).first().click();

      await press(t.open);
      await press(t.settingsTab);
      const mode = page.getByRole("group", { name: countdown.mode });
      await mode.evaluate((element) => element.scrollIntoView({ block: "center" }));
      await mode
        .getByRole("radio", { name: countdown.countdown })
        .evaluate((element) => (element as HTMLInputElement).click());
      await page
        .getByRole("group", { name: change.change })
        .getByRole("radio", { name: change.auto })
        .evaluate((element) => (element as HTMLInputElement).click());
      await check("countdown setup with the team change");
      await press(t.done);
      await press(t.startGame);
      await press(countdown.start);
      await check("running countdown with all accounts");
      await press(t.pause);
      await check("paused countdown with all accounts");
      await press(t.resume);
      await press(t.correct);
      await check("countdown after the automatic change");
    }
    expect(problems, problems.join("\n")).toEqual([]);
  });
