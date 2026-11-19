import { expect, test } from "@playwright/test";
import { closeSettings, openSettings } from "./setupSteps";

test("plays a Taboo card from the game selection", async ({ page }) => {
  await page.goto("/#/games/taboo");
  const setupWidth = await page
    .getByRole("main")
    .evaluate((main) => main.getBoundingClientRect().width);
  // A phone has one narrow column; at the PC (from 1024 px) the setup is wider, but never wider than 80 rem.
  const wide = (page.viewportSize()?.width ?? 0) >= 1024;
  expect(setupWidth).toBeLessThanOrEqual(wide ? 1280 : 480);
  // The game opens on its line-up; the settings (with the cards) are their own screen.
  await openSettings(page, "Game settings");
  await page.getByRole("tab", { name: "Categories", exact: true }).click();
  await expect(page.getByRole("group", { name: "Difficulty (several possible)" })).toBeVisible();
  const nature = page.getByRole("checkbox", { name: "Nature" });
  const choice = page.locator("label").filter({ has: nature });
  expect((await choice.boundingBox())?.height).toBeGreaterThanOrEqual(48);
  await expect(nature).toBeChecked();
  await nature.click();
  await expect(nature).not.toBeChecked();
  await nature.press("Space");
  await expect(nature).toBeChecked();
  await closeSettings(page, "Done");
  await page.getByRole("button", { name: "Start game", exact: true }).click();
  await page.getByRole("button", { name: "Start round" }).click();
  const round = page.getByRole("region", { name: "Active round" });
  await expect(round.getByRole("timer")).toHaveText(/^\d+$/);
  await expect(page.getByText("Taboo cards", { exact: true })).toBeHidden();
  await expect(round.locator(".taboo-round__card li")).toHaveCount(4);
  await round.getByRole("button", { name: "Correct" }).click();
  await expect(round).not.toContainText("Score");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    await page.evaluate(() => window.innerWidth),
  );
});

test("renders the GameHub game selection", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("GameHub");
  await expect(page.getByRole("link", { name: "GameHub" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Choose a game" })).toBeVisible();
  await expect(page.getByRole("list", { name: "Choose a game" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Play", exact: true }).first()).toBeEnabled();
  // Taboo is finished. Werewolf is in development and the other games are planned: the published app
  // does not open them.
  await expect(page.getByRole("button", { name: "Play", exact: true }).nth(1)).toBeDisabled();
  await expect(page.getByRole("button", { name: "Play", exact: true }).nth(2)).toBeDisabled();
});

test("persists the selected UI language", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Settings" }).click();
  await page
    .getByRole("group", { name: "Interface language" })
    .getByRole("radio", { name: "German" })
    .check({ force: true });
  await expect(page.getByRole("heading", { name: "Wähle ein Spiel" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "de");

  await page.reload();

  await page.getByRole("button", { name: "Einstellungen" }).click();
  await expect(
    page.getByRole("group", { name: "Oberflächensprache" }).getByRole("radio", { name: "Deutsch" }),
  ).toBeChecked();
  await expect(page.getByRole("heading", { name: "Wähle ein Spiel" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "GameHub – Partyspiele an einem Ort",
  );
});

test("navigates between the game library and preview", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Play", exact: true }).first().click();
  await expect(page).toHaveURL(/#\/games\/taboo$/);
  await expect(page.getByRole("heading", { name: "Taboo" })).toBeVisible();

  await page.getByRole("button", { name: "Close game" }).click();
  await expect(page).toHaveURL(/#\/$/);
  await expect(page.getByRole("heading", { name: "Choose a game" })).toBeVisible();
});

test("persists the UI language and the card language of Taboo independently", async ({ page }) => {
  await page.goto("/");

  // The settings only hold the interface language.
  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByRole("group", { name: "Card language" })).toHaveCount(0);
  await page
    .getByRole("group", { name: "Interface language" })
    .getByRole("radio", { name: "German" })
    .check({ force: true });
  await page.getByRole("button", { name: "Schließen" }).click();

  // The card language is a setting of Taboo.
  await page.getByRole("button", { name: "Spielen", exact: true }).first().click();
  await openSettings(page, "Spieleinstellungen");
  await page.getByRole("tab", { name: "Kategorien", exact: true }).click();
  const cardLanguage = page.getByRole("group", { name: "Kartensprache" });
  await expect(cardLanguage.getByRole("radio", { name: "Englisch" })).toBeChecked();
  // Bring the group to the middle so the start bar at the bottom does not cover it.
  await cardLanguage.evaluate((element) => element.scrollIntoView({ block: "center" }));
  await cardLanguage.getByRole("radio", { name: "Deutsch" }).check({ force: true });
  await expect(cardLanguage.getByRole("radio", { name: "Deutsch" })).toBeChecked();

  await page.reload();

  await openSettings(page, "Spieleinstellungen");
  await page.getByRole("tab", { name: "Kategorien", exact: true }).click();
  await expect(
    page.getByRole("group", { name: "Kartensprache" }).getByRole("radio", { name: "Deutsch" }),
  ).toBeChecked();
  // On a phone the settings are a view of their own: the header offers the way back to the line-up
  // first. At the PC they stand beside the line-up and there is no way back to take.
  const backToLineup = page.getByRole("button", { name: "Zurück" });
  if (await backToLineup.isVisible()) await backToLineup.click();
  await page.getByRole("button", { name: "Spiel schließen" }).click();
  await page.getByRole("button", { name: "Einstellungen" }).click();
  await expect(
    page.getByRole("group", { name: "Oberflächensprache" }).getByRole("radio", { name: "Deutsch" }),
  ).toBeChecked();
});

test("opens and closes the settings dialog", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByRole("dialog", { name: "Settings" })).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

for (const language of ["en", "de"] as const) {
  test(`asks before the Back key leaves a running Taboo game in ${language}`, async ({ page }) => {
    // The Back key of the system: the history moves back one entry (page.goBack waits for a navigation).
    const back = () => page.evaluate(() => window.history.back());
    // The app puts a guard entry on top of the history while a game or a view is open and takes it away a
    // moment after the view is left. A Back pressed in between would hit that entry, so the test waits.
    const guardOnTop = () =>
      page.waitForFunction(() =>
        Boolean((window.history.state as { gamehubGuard?: true } | null)?.gamehubGuard),
      );
    const guardGone = () =>
      page.waitForFunction(
        () => !(window.history.state as { gamehubGuard?: true } | null)?.gamehubGuard,
      );
    const t =
      language === "en"
        ? {
            open: "Play",
            start: "Start game",
            round: "Start round",
            title: "End the game?",
            keep: "Keep playing",
            end: "End game",
            settings: "Game settings",
          }
        : {
            open: "Spielen",
            start: "Spiel starten",
            round: "Runde starten",
            title: "Spiel beenden?",
            keep: "Weiterspielen",
            end: "Spiel beenden",
            settings: "Spieleinstellungen",
          };
    await page.goto("/");
    if (language === "de") {
      await page.getByRole("button", { name: "Settings" }).click();
      await page
        .getByRole("group", { name: "Interface language" })
        .getByRole("radio", { name: "German" })
        .check({ force: true });
      await page.getByRole("button", { name: "Schließen" }).click();
    }
    await page.getByRole("button", { name: t.open, exact: true }).first().click();
    await page.getByRole("button", { name: t.start, exact: true }).click();
    await page.getByRole("button", { name: t.round, exact: true }).click();

    // The Back key does not leave the game: it asks, and the round waits.
    await guardOnTop();
    await back();
    const question = page.getByRole("dialog", { name: t.title });
    await expect(question).toBeVisible();
    expect(new URL(page.url()).hash).toBe("#/games/taboo");
    await question.getByRole("button", { name: t.keep }).click();
    await expect(question).toBeHidden();

    // Asked again, the game can be ended: it returns to the line-up of the game.
    await guardOnTop();
    await back();
    await question.getByRole("button", { name: t.end, exact: true }).click();
    await expect(page.getByRole("button", { name: t.start, exact: true })).toBeVisible();
    await guardGone();
    // The Back key in the settings only goes back to the line-up (on a phone; at the PC there is no
    // view for the settings).
    const settingsButton = page.getByRole("button", { name: t.settings, exact: true });
    if (await settingsButton.isVisible()) {
      await settingsButton.click();
      await guardOnTop();
      await back();
      await expect(page.getByRole("button", { name: t.start, exact: true })).toBeVisible();
      expect(new URL(page.url()).hash).toBe("#/games/taboo");
      await guardGone();
    }

    // On the line-up one Back leaves the game for the game selection.
    await back();
    await expect(page.getByRole("button", { name: t.open, exact: true }).first()).toBeVisible();
    // The game selection is the first page of the app (no address part).
    expect(["", "#/"]).toContain(new URL(page.url()).hash);
  });
}

test("the player list and the player choice are large windows that show whole players only", async ({
  page,
}) => {
  // Many players, so the list has to scroll on every screen.
  const names = Array.from(
    { length: 30 },
    (_, index) => `Player ${String(index + 1).padStart(2, "0")}`,
  );
  // All players are in one group; a second, small group shows that the window keeps its size.
  await page.addInitScript((saved) => {
    window.localStorage.setItem("gamehub.players", JSON.stringify(saved));
    window.localStorage.setItem(
      "gamehub.playerGroups",
      JSON.stringify([
        { name: "Everyone", members: saved },
        { name: "Few", members: saved.slice(0, 2) },
      ]),
    );
  }, names);
  await page.goto("/");

  /** The open window: its size, whether its content scrolls sideways and how many rows are cut off. */
  const measure = async () =>
    page.evaluate(() => {
      const dialog = document.querySelector(".dialog")!.getBoundingClientRect();
      const content = document.querySelector(".dialog__content")!;
      const scroll = document.querySelector<HTMLElement>(".kit-roster__scroll")!;
      const cutOff = () => {
        const box = scroll.getBoundingClientRect();
        return [...scroll.querySelectorAll("li")].filter((row) => {
          const rect = row.getBoundingClientRect();
          const atTop = rect.top < box.top - 0.5 && rect.bottom > box.top + 0.5;
          const atBottom = rect.top < box.bottom - 0.5 && rect.bottom > box.bottom + 0.5;
          return atTop || atBottom;
        }).length;
      };
      const cutAtTop = cutOff();
      // At the end of the list the last rows must be whole, too (the list stops at whole rows).
      scroll.scrollTop = scroll.scrollHeight;
      return {
        cutAtEnd: cutOff(),
        cutAtTop,
        height: Math.round(dialog.height),
        heightShare: dialog.height / window.innerHeight,
        scrolls: scroll.scrollHeight > scroll.clientHeight,
        sideways: content.scrollWidth > content.clientWidth,
        title: document.querySelector(".dialog h2")?.textContent ?? "",
      };
    });

  // The button and the window are called "Player list".
  await page.getByRole("button", { name: "Player list", exact: true }).click();
  const groupList = await measure();
  // Every view of the window is equally big: the list of groups and each group.
  await page.getByRole("button", { name: /^Few/ }).click();
  expect((await measure()).height).toBe(groupList.height);
  await page.getByRole("button", { name: /^Back to the groups/ }).click();
  await page.getByRole("button", { name: /^Everyone/ }).click();
  let window_ = await measure();
  expect(window_.height).toBe(groupList.height);
  expect(window_.title).toBe("Player list");
  expect(window_.sideways).toBe(false);
  expect(window_.scrolls).toBe(true);
  expect(window_.cutAtTop).toBe(0);
  expect(window_.cutAtEnd).toBe(0);
  expect(window_.heightShare).toBeGreaterThan(0.6);
  await page.getByRole("button", { name: "Close", exact: true }).click();

  // The player choice of a game is as large and shows whole players only, too.
  await page.getByRole("button", { name: "Play", exact: true }).first().click();
  await page.getByRole("tab", { name: /^Players/ }).click();
  await page.getByRole("button", { name: "Choose from player list" }).click();
  const pickList = await measure();
  await page.getByRole("button", { name: /^Few/ }).click();
  expect((await measure()).height).toBe(pickList.height);
  await page.getByRole("button", { name: /^Back to the groups/ }).click();
  await page.getByRole("button", { name: /^Everyone/ }).click();
  window_ = await measure();
  expect(window_.height).toBe(pickList.height);
  expect(window_.title).toBe("Choose players");
  expect(window_.sideways).toBe(false);
  expect(window_.scrolls).toBe(true);
  expect(window_.cutAtTop).toBe(0);
  expect(window_.cutAtEnd).toBe(0);
  expect(window_.heightShare).toBeGreaterThan(0.6);
});
