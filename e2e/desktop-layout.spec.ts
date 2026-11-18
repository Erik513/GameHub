import { expect, test, type Page } from "@playwright/test";
import { countdownLabels, labels, raceLabels, switchLabels } from "./layoutLabels";
import { snapshotStyles } from "./styleSnapshot";

/** The sizes of the windows at the PC: a small laptop, a monitor and a full HD screen. */
const sizes = [
  { name: "laptop", width: 1024, height: 768 },
  { name: "monitor", width: 1280, height: 800 },
  { name: "full HD", width: 1920, height: 1080 },
] as const;

/** The widest the content gets at the PC in pixels (80 rem); on a wider screen only the margin grows. */
const maxContentWidth = 1280;

interface Violation {
  readonly kind: string;
  readonly detail: string;
}

/**
 * Looks for layout problems at the PC: a scrollbar to the side, a page that scrolls although it is one
 * page, content that is wider than allowed or not centered, a turn whose card, clock and buttons do not
 * fit on the screen together, a main button that is covered or below the screen, and cut off text.
 */
async function audit(page: Page, screen: string): Promise<string[]> {
  await snapshotStyles(page, screen);
  const violations = await page.evaluate<Violation[], number>((maximum) => {
    const found: Violation[] = [];
    const describe = (element: Element) =>
      `${element.tagName.toLowerCase()}${element.className ? `.${String(element.className).split(" ")[0]}` : ""} "${(element.textContent ?? "").trim().slice(0, 30)}"`;
    const visible = (element: Element) => {
      const rect = element.getBoundingClientRect();
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

    // One page: the screens of a game never scroll as a page, only the box of the chosen tab does.
    if (
      document.querySelector(".kit-onepage") &&
      document.documentElement.scrollHeight > window.innerHeight
    ) {
      found.push({
        kind: "page scroll on a one-page screen",
        detail: `${document.documentElement.scrollHeight} > ${window.innerHeight}`,
      });
    }

    // The content is not wider than allowed and sits in the middle.
    const content = document.querySelector(".main-content");
    if (content) {
      const rect = content.getBoundingClientRect();
      if (rect.width > maximum + 1) {
        found.push({ kind: "content too wide", detail: `${Math.round(rect.width)} > ${maximum}` });
      }
      const left = rect.left;
      const right = window.innerWidth - rect.right;
      if (Math.abs(left - right) > 2) {
        found.push({
          kind: "content not centered",
          detail: `${Math.round(left)} / ${Math.round(right)}`,
        });
      }
    }

    // The turn: the card, the clock and the buttons are on the screen together, nothing scrolls.
    const turnCard = document.querySelector(".taboo-round__card");
    if (turnCard && visible(turnCard)) {
      if (turnCard.scrollHeight > turnCard.clientHeight + 1) {
        found.push({
          kind: "card of the turn scrolls",
          detail: `${turnCard.scrollHeight} > ${turnCard.clientHeight}`,
        });
      }
      for (const selector of [".kit-hud-wrap", ".taboo-round__card", ".taboo-round__actions"]) {
        const element = document.querySelector(selector);
        if (!element || !visible(element)) continue;
        const rect = element.getBoundingClientRect();
        if (rect.top < -0.5 || rect.bottom > window.innerHeight + 0.5) {
          found.push({ kind: "part of the turn outside the screen", detail: selector });
        }
      }
    }

    // The main button is reachable and covers nothing.
    for (const page of document.querySelectorAll(".kit-onepage")) {
      if (!visible(page)) continue;
      if (page.getBoundingClientRect().bottom > window.innerHeight + 1) {
        found.push({ kind: "one-page area taller than the screen", detail: describe(page) });
      }
      const panel = page.querySelector(".kit-tabpanel[data-active=true]");
      const bar = page.querySelector(".kit-start-bar");
      if (
        panel &&
        bar &&
        visible(bar) &&
        // Beside each other (the actions in a column of their own) nothing is covered.
        panel.getBoundingClientRect().left < bar.getBoundingClientRect().right - 1 &&
        panel.getBoundingClientRect().right > bar.getBoundingClientRect().left + 1 &&
        panel.getBoundingClientRect().bottom > bar.getBoundingClientRect().top + 1
      ) {
        found.push({ kind: "tab covered by the start button", detail: describe(panel) });
      }
    }
    const bar = document.querySelector(".kit-start-bar");
    if (bar && visible(bar) && bar.getBoundingClientRect().bottom > window.innerHeight + 1) {
      found.push({ kind: "action bar below the screen", detail: describe(bar) });
    }

    // A window fits on the screen.
    for (const dialog of document.querySelectorAll(".dialog")) {
      if (!visible(dialog)) continue;
      const rect = dialog.getBoundingClientRect();
      if (rect.top < -0.5 || rect.bottom > window.innerHeight + 0.5) {
        found.push({ kind: "window taller than the screen", detail: describe(dialog) });
      }
    }

    // Controls have a name and lie on the screen; text is not cut off.
    for (const element of document.querySelectorAll(
      "button, a[href], summary, select, input[type=text]",
    )) {
      if (!visible(element)) continue;
      const rect = element.getBoundingClientRect();
      const name = element.getAttribute("aria-label") ?? (element.textContent ?? "").trim();
      if (!name && element.matches("button, a[href], summary")) {
        found.push({ kind: "control without a name", detail: describe(element) });
      }
      if (rect.left < -0.5 || rect.right > window.innerWidth + 0.5) {
        found.push({ kind: "outside the screen", detail: describe(element) });
      }
    }
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
    }
    return found;
  }, maxContentWidth);
  return violations.map((item) => `${screen}: ${item.kind} - ${item.detail}`);
}

/** Opens the app at the size, with a fixed clock and a fixed shuffle, in the language. */
async function openApp(page: Page, language: "en" | "de", size: { width: number; height: number }) {
  await page.setViewportSize({ width: size.width, height: size.height });
  await page.clock.install();
  // Keep the shuffled order stable: Team 1 plays first.
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
}

const pressIn = (page: Page) => (name: string) =>
  page.getByRole("button", { name, exact: true }).first().click();

for (const size of sizes) {
  for (const language of ["en", "de"] as const) {
    test(`every Taboo screen fits at the PC, ${size.name}, ${language}`, async ({
      page,
    }, testInfo) => {
      test.skip(testInfo.project.name !== "desktop-chromium", "The PC check runs on desktop only.");
      const t = labels[language];
      const problems: string[] = [];
      const check = async (screen: string) =>
        problems.push(...(await audit(page, `${size.width}x${size.height} ${screen}`)));
      const press = pressIn(page);
      await openApp(page, language, size);

      await check("game selection");
      await press(t.settings);
      await check("settings dialog");
      await page.getByRole("dialog").getByRole("button", { name: t.close }).click();

      await press(t.open);
      await check("line-up");
      await press(t.rules);
      await check("rules dialog");
      await page.getByRole("dialog").getByRole("button", { name: t.close }).click();
      // The settings stand beside the line-up, without a button to open them and without "Done".
      await check("setup beside the line-up");
      await page.getByRole("tab", { name: t.categories, exact: true }).click();
      await check("setup cards beside the line-up");
      await page.getByRole("tab", { name: t.settingsTab, exact: true }).click();
      await press(t.startGame);
      await check("overview before the first turn");

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
      await page.clock.fastForward(500);
      await press(t.endRoundConfirm);
      await check("round review");

      for (let turn = 0; turn < 5; turn += 1) {
        await press(t.startRound);
        await page.clock.fastForward(60_000);
      }
      await press(t.show);
      await check("final result");
      expect(problems, problems.join("\n")).toEqual([]);
    });

    test(`the race and countdown screens fit at the PC, ${size.name}, ${language}`, async ({
      page,
    }, testInfo) => {
      test.skip(testInfo.project.name !== "desktop-chromium", "The PC check runs on desktop only.");
      const t = labels[language];
      const race = raceLabels[language];
      const countdown = countdownLabels[language];
      const problems: string[] = [];
      const check = async (screen: string) =>
        problems.push(...(await audit(page, `${size.width}x${size.height} ${screen}`)));
      const press = pressIn(page);
      const chooseMode = async (name: string) => {
        const mode = page.getByRole("group", { name: race.mode });
        await mode
          .getByRole("radio", { name })
          .evaluate((element) => (element as HTMLInputElement).click());
      };
      await openApp(page, language, size);

      // The race.
      await press(t.open);
      await chooseMode(race.race);
      await check("race setup");
      await press(t.startGame);
      await check("race overview");
      await press(race.startRun);
      await check("running race");
      await press(t.pause);
      await check("paused race");
      await press(t.resume);
      for (let card = 0; card < 3; card += 1) await press(t.correct);
      await check("race overview with a time");
      await press(race.startRun);
      for (let card = 0; card < 3; card += 1) await press(t.correct);
      await check("race result");

      // The countdown with the automatic change of teams and the row of the accounts.
      await page.goto("/");
      await press(t.open);
      await chooseMode(countdown.countdown);
      await check("countdown setup");
      await press(t.startGame);
      await press(countdown.start);
      await check("running countdown with all accounts");
      await press(t.pause);
      await check("paused countdown");
      await press(t.resume);
      await press(t.correct);
      await check("countdown after the automatic change");

      // The countdown with the manual change shows the overview between the turns.
      await page.goto("/");
      await press(t.open);
      await chooseMode(countdown.countdown);
      await page
        .getByRole("group", { name: switchLabels[language].change })
        .getByRole("radio", { name: switchLabels[language].manual })
        .evaluate((element) => (element as HTMLInputElement).click());
      await press(t.startGame);
      await check("countdown overview");
      await press(countdown.start);
      await press(t.correct);
      await check("countdown overview with a time");
      expect(problems, problems.join("\n")).toEqual([]);
    });

    test(`the card editor fits at the PC, ${size.name}, ${language}`, async ({
      page,
    }, testInfo) => {
      test.skip(testInfo.project.name !== "desktop-chromium", "The PC check runs on desktop only.");
      const t = labels[language];
      const problems: string[] = [];
      const check = async (screen: string) =>
        problems.push(...(await audit(page, `${size.width}x${size.height} ${screen}`)));
      await openApp(page, language, size);
      const press = pressIn(page);
      await press(t.open);
      await page.getByRole("tab", { name: t.categories, exact: true }).click();
      await page
        .locator('.kit-tabpanel[data-active="true"]')
        .getByRole("button", { name: t.manage, exact: true })
        .click();
      await check("card editor: cards");
      await page.locator(".kit-nav-row").first().click();
      await check("card editor: category");
      // The form to add a card stands beside the cards; there are no tabs at the PC.
      await expect(page.locator(".kit-manage .kit-tabpanel:visible")).toHaveCount(2);
      await expect(page.locator(".kit-manage .kit-tabs__list")).toBeHidden();
      await check("card editor: add beside the cards");
      expect(problems, problems.join("\n")).toEqual([]);
    });
  }
}
