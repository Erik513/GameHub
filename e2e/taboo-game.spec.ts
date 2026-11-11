import { expect, test } from "@playwright/test";

const cases = [
  {
    language: "en",
    open: "View progress",
    rounds: "Rounds per team",
    prepare: "Prepare game",
    start: "Start round",
    active: "Active round",
    correct: "Correct",
    skip: "Skip",
    forbidden: "Forbidden word",
    next: "Next team: Team 2",
    show: "Show final results",
    winner: "Winner: Team 1",
    restart: "Play again with the same setup",
    score: "Score: 0",
  },
  {
    language: "de",
    open: "Fortschritt ansehen",
    rounds: "Runden pro Team",
    prepare: "Partie vorbereiten",
    start: "Runde starten",
    active: "Laufende Runde",
    correct: "Richtig",
    skip: "Überspringen",
    forbidden: "Verbotenes Wort",
    next: "Nächstes Team: Team 2",
    show: "Endergebnis anzeigen",
    winner: "Gemeinsam gewonnen haben Team 1, Team 2.",
    restart: "Mit gleicher Konfiguration neu spielen",
    score: "Punkte: 0",
  },
] as const;

for (const labels of cases) {
  test(`completes a Taboo game and restarts in ${labels.language}`, async ({ page }) => {
    await page.clock.install();
    await page.goto("/");
    if (labels.language === "de") {
      await page.getByRole("button", { name: "Settings" }).click();
      await page.getByRole("combobox", { name: "Interface language" }).selectOption("de");
      await page.getByRole("dialog").getByRole("button", { name: "Schließen" }).click();
    }
    await page.getByRole("button", { name: labels.open }).click();
    await page
      .getByRole("group", { name: labels.rounds })
      .getByRole("radio", { name: "1", exact: true })
      .check();
    await page.getByRole("button", { name: labels.prepare }).click();
    await page.getByRole("button", { name: labels.start }).click();
    const round = page.getByRole("region", { name: labels.active });
    await round.getByRole("button", { name: labels.correct }).click();
    if (labels.language === "en") {
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await expect(round.getByRole("button", { name: "Undo last point" })).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(round.getByText("Score: 0")).toBeVisible();
      await round.getByRole("button", { name: "Correct" }).click();
      await round.getByRole("button", { name: "Correct" }).click();
    }
    await round.getByRole("button", { name: labels.skip }).click();
    await round.getByRole("button", { name: labels.forbidden }).click();
    await page.clock.fastForward(60_000);
    if (labels.language === "en") {
      const undo = page.getByRole("button", { name: "Undo last point" });
      await undo.focus();
      await page.keyboard.press("Enter");
      await expect(page.getByText("Round points: 1")).toBeVisible();
    }
    await expect(page.getByText(labels.next)).toBeVisible();
    await expect(page.getByText("Team 1: 1", { exact: true })).toBeVisible();
    await expect(round).toHaveCount(0);
    await page.getByRole("button", { name: labels.start }).click();
    await expect(round.getByText("Team 2", { exact: true })).toBeVisible();
    if (labels.language === "de") await round.getByRole("button", { name: labels.correct }).click();
    await page.clock.fastForward(60_000);
    await page.getByRole("button", { name: labels.show }).click();
    await expect(page.getByText(labels.winner)).toBeVisible();
    await expect(
      page.getByText(`Team 2: ${labels.language === "de" ? 1 : 0}`, { exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: labels.restart }).click();
    await page.getByRole("button", { name: labels.start }).click();
    await expect(round.getByText(labels.score)).toBeVisible();
    await page.reload();
    await expect(round).toHaveCount(0);
    await expect(page.getByRole("button", { name: labels.prepare })).toBeVisible();
    await expect(
      page
        .getByRole("group", { name: labels.rounds })
        .getByRole("radio", { name: "3", exact: true }),
    ).toBeChecked();
  });
}
