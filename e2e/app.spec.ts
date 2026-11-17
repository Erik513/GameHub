import { expect, test } from "@playwright/test";

test("plays a Taboo card from the game selection", async ({ page }) => {
  await page.goto("/#/games/taboo");
  const setupWidth = await page
    .getByRole("main")
    .evaluate((main) => main.getBoundingClientRect().width);
  expect(setupWidth).toBeLessThanOrEqual(480);
  // The game opens on its line-up; the settings (with the cards) are their own screen.
  await page.getByRole("button", { name: "Game settings", exact: true }).click();
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
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await page.getByRole("button", { name: "Start game", exact: true }).click();
  await page.getByRole("button", { name: "Start round" }).click();
  const round = page.getByRole("region", { name: "Active round" });
  await expect(round.getByRole("timer")).toHaveText(/^\d+$/);
  await expect(page.getByText("Taboo cards", { exact: true })).toBeHidden();
  await expect(round.getByRole("listitem")).toHaveCount(4);
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
  await expect(page.getByRole("button", { name: "View progress" })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Coming later" }).first()).toBeDisabled();
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

  await page.getByRole("button", { name: "View progress" }).click();
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
  await page.getByRole("button", { name: "Fortschritt ansehen" }).click();
  await page.getByRole("button", { name: "Spieleinstellungen", exact: true }).click();
  await page.getByRole("tab", { name: "Kategorien", exact: true }).click();
  const cardLanguage = page.getByRole("group", { name: "Kartensprache" });
  await expect(cardLanguage.getByRole("radio", { name: "Englisch" })).toBeChecked();
  // Bring the group to the middle so the start bar at the bottom does not cover it.
  await cardLanguage.evaluate((element) => element.scrollIntoView({ block: "center" }));
  await cardLanguage.getByRole("radio", { name: "Deutsch" }).check({ force: true });
  await expect(cardLanguage.getByRole("radio", { name: "Deutsch" })).toBeChecked();

  await page.reload();

  await page.getByRole("button", { name: "Spieleinstellungen", exact: true }).click();
  await page.getByRole("tab", { name: "Kategorien", exact: true }).click();
  await expect(
    page.getByRole("group", { name: "Kartensprache" }).getByRole("radio", { name: "Deutsch" }),
  ).toBeChecked();
  // In the game's settings the header offers the way back to the line-up first.
  await page.getByRole("button", { name: "Zurück" }).click();
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
    const t =
      language === "en"
        ? {
            open: "View progress",
            start: "Start game",
            round: "Start round",
            title: "End the game?",
            keep: "Keep playing",
            end: "End game",
            settings: "Game settings",
          }
        : {
            open: "Fortschritt ansehen",
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
    await page.getByRole("button", { name: t.open }).click();
    await page.getByRole("button", { name: t.start, exact: true }).click();
    await page.getByRole("button", { name: t.round, exact: true }).click();

    // The Back key does not leave the game: it asks, and the round waits.
    await back();
    const question = page.getByRole("dialog", { name: t.title });
    await expect(question).toBeVisible();
    expect(new URL(page.url()).hash).toBe("#/games/taboo");
    await question.getByRole("button", { name: t.keep }).click();
    await expect(question).toBeHidden();

    // Asked again, the game can be ended: it returns to the line-up of the game.
    await back();
    await question.getByRole("button", { name: t.end, exact: true }).click();
    await expect(page.getByRole("button", { name: t.start, exact: true })).toBeVisible();
    // The Back key in the settings only goes back to the line-up.
    await page.getByRole("button", { name: t.settings, exact: true }).click();
    await back();
    await expect(page.getByRole("button", { name: t.start, exact: true })).toBeVisible();
    expect(new URL(page.url()).hash).toBe("#/games/taboo");

    // On the line-up one Back leaves the game for the game selection.
    await back();
    await expect(page.getByRole("button", { name: t.open })).toBeVisible();
    // The game selection is the first page of the app (no address part).
    expect(["", "#/"]).toContain(new URL(page.url()).hash);
  });
}
