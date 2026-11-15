import { expect, test, type Page } from "@playwright/test";

const labels = {
  en: {
    open: "View progress",
    settings: "Settings",
    close: "Close",
    start: "Start",
    startGame: "Start game",
    startRound: "Start round",
    forbidden: "Forbidden word",
    skip: "Skip",
    correct: "Correct",
    pause: "Pause",
    resume: "Resume",
    endRound: "End round",
    show: "Show final results",
    startTiebreak: "Start tiebreak",
    endAttempt: "End attempt",
    interfaceLanguage: "Interface language",
    players: "Players",
    addPlayer: "Add player",
    addButton: "Add",
    draw: "Draw teams",
    noTeam: "No team",
    cards: "Cards",
    rules: "Rules",
    settingsTab: "Game settings",
  },
  de: {
    open: "Fortschritt ansehen",
    settings: "Einstellungen",
    close: "Schließen",
    start: "Starten",
    startGame: "Spiel starten",
    startRound: "Runde starten",
    forbidden: "Verbotenes Wort",
    skip: "Überspringen",
    correct: "Richtig",
    pause: "Pause",
    resume: "Fortsetzen",
    endRound: "Runde beenden",
    show: "Endergebnis anzeigen",
    startTiebreak: "Stechen starten",
    endAttempt: "Versuch beenden",
    interfaceLanguage: "Oberflächensprache",
    players: "Spieler",
    addPlayer: "Spieler hinzufügen",
    addButton: "Hinzufügen",
    draw: "Teams auslosen",
    noTeam: "Ohne Team",
    cards: "Karten",
    rules: "Spielregeln",
    settingsTab: "Spieleinstellungen",
  },
} as const;

const viewports = [
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

    const targets = document.querySelectorAll(
      "button, a[href], summary, select, input[type=text], label.kit-choice, .taboo-review__item",
    );
    for (const element of targets) {
      if (!visible(element)) continue;
      // A link inside a sentence may be as small as its text (an inline link is exempt from the target size).
      if (element.matches(".kit-link-button")) continue;
      const rect = element.getBoundingClientRect();
      if (rect.height < minimum - 0.5 || rect.width < minimum - 0.5) {
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
      await check("setup");
      await page.getByRole("tab", { name: t.cards, exact: true }).click();
      await check("setup cards");
      await press(t.rules);
      await check("rules dialog");
      await page.getByRole("dialog").getByRole("button", { name: t.close }).click();
      await page.getByRole("tab", { name: t.settingsTab, exact: true }).click();
      await press(t.start);
      await check("line-up");
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

test("the tiebreak screens fit a small phone in both languages", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "The layout audit runs on mobile only.");
  const problems: string[] = [];
  for (const language of ["en", "de"] as const) {
    const t = labels[language];
    await page.setViewportSize({ width: 360, height: 640 });
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
    const press = (name: string) => page.getByRole("button", { name, exact: true }).first().click();

    await press(t.open);
    await press(t.start);
    await press(t.startGame);
    // Nobody scores in the six turns of a short game, so the game ends in a tie.
    for (let turn = 0; turn < 6; turn += 1) {
      await press(t.startRound);
      await page.clock.fastForward(60_000);
    }
    await press(t.show);
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
    await check("final result after the tiebreak");
  }
  expect(problems, problems.join("\n")).toEqual([]);
});

const raceLabels = {
  en: { mode: "Game mode", race: "Race", startRun: "Start run" },
  de: { mode: "Spielmodus", race: "Auf Zeit", startRun: "Lauf starten" },
} as const;

test("the race screens fit a small phone in both languages", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "The layout audit runs on mobile only.");
  const problems: string[] = [];
  for (const language of ["en", "de"] as const) {
    const t = labels[language];
    const race = raceLabels[language];
    await page.setViewportSize({ width: 360, height: 640 });
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
    const press = (name: string) => page.getByRole("button", { name, exact: true }).first().click();

    await press(t.open);
    const mode = page.getByRole("group", { name: race.mode });
    // Bring the group to the middle so the start bar at the bottom does not cover it.
    await mode.evaluate((element) => element.scrollIntoView({ block: "center" }));
    await mode.getByRole("radio", { name: race.race }).check({ force: true });
    await check("race setup");
    await press(t.start);
    await check("race line-up");
    await press(t.startGame);
    await check("race overview before the first run");

    await press(race.startRun);
    await check("running race");
    await press(t.pause);
    await check("paused race");
    await press(t.resume);
    for (let card = 0; card < 5; card += 1) await press(t.correct);
    await check("race overview with a time");

    await press(race.startRun);
    for (let card = 0; card < 5; card += 1) await press(t.correct);
    await check("race result");
  }
  expect(problems, problems.join("\n")).toEqual([]);
});

test("the card editor is one page with two tabs on a small phone in both languages", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "The layout audit runs on mobile only.");
  const problems: string[] = [];
  const addTab = { en: "Add card", de: "Karte hinzufügen" } as const;
  for (const language of ["en", "de"] as const) {
    const t = labels[language];
    await page.setViewportSize({ width: 360, height: 640 });
    await page.goto("/");
    if (language === "de") {
      await page.getByRole("button", { name: labels.en.settings }).click();
      await page
        .getByRole("group", { name: labels.en.interfaceLanguage })
        .getByRole("radio", { name: "German" })
        .check({ force: true });
      await page.getByRole("dialog").getByRole("button", { name: labels.de.close }).click();
    }
    await page.getByRole("button", { name: t.open }).click();
    await page.getByRole("tab", { name: t.cards, exact: true }).click();
    await page
      .locator('.kit-tabpanel[data-active="true"]')
      .getByRole("button", { name: t.cards, exact: true })
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
