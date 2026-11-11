import { expect, test } from "@playwright/test";

const cases = [
  {
    language: "en",
    open: "View progress",
    rounds: "Rounds per team",
    prepare: "Start",
    start: "Start round",
    active: "Active round",
    correct: "Correct",
    skip: "Skip",
    forbidden: "Forbidden word",
    next: "Team 2",
    show: "Show final results",
    winner: "Winner: Team 1",
    restart: "Play again with the same setup",
    score: "Score: 0",
  },
  {
    language: "de",
    open: "Fortschritt ansehen",
    rounds: "Runden pro Team",
    prepare: "Starten",
    start: "Runde starten",
    active: "Laufende Runde",
    correct: "Richtig",
    skip: "Überspringen",
    forbidden: "Verbotenes Wort",
    next: "Team 2",
    show: "Endergebnis anzeigen",
    winner: "Gemeinsam gewonnen: Team 1, Team 2",
    restart: "Mit gleicher Konfiguration neu spielen",
    score: "Punkte: 0",
  },
] as const;

for (const labels of cases) {
  test(`completes a Taboo game and restarts in ${labels.language}`, async ({ page }) => {
    await page.clock.install();
    // Keep the shuffled team order stable: Team 1 plays first.
    await page.addInitScript(() => {
      Math.random = () => 0.99;
    });
    await page.goto("/");
    if (labels.language === "de") {
      await page.getByRole("button", { name: "Settings" }).click();
      await page.getByRole("combobox", { name: "Interface language" }).selectOption("de");
      await page.getByRole("dialog").getByRole("button", { name: "Schließen" }).click();
    }
    await page.getByRole("button", { name: labels.open }).click();
    if (labels.language === "de") {
      // The German game ends in a tie; switch the tiebreak off to check the shared win.
      await page.getByText("Weitere Optionen", { exact: true }).click();
      await page
        .getByRole("group", { name: "Stechen bei Gleichstand" })
        .getByRole("radio", { name: "Aus" })
        .check();
    }
    await page.getByRole("button", { name: labels.prepare, exact: true }).click();
    await page.getByRole("button", { name: labels.start, exact: true }).click();
    const round = page.getByRole("region", { name: labels.active });
    await round.getByRole("button", { name: labels.correct }).click();
    if (labels.language === "en") {
      await round.getByRole("button", { name: "Correct" }).click();
      await round.getByRole("button", { name: "Correct" }).click();
    }
    await round.getByRole("button", { name: labels.skip }).click();
    await round.getByRole("button", { name: labels.forbidden }).click();
    await page.clock.fastForward(60_000);
    if (labels.language === "en") {
      // Three cards were scored; fix two of them in the round review.
      const review = page.getByRole("region", { name: "Played round: Team 1" });
      await expect(review.getByRole("button")).toHaveCount(4);
      await review.getByRole("button").nth(1).press("Enter");
      await review.getByRole("button").nth(2).click();
      await expect(review.getByRole("button").nth(1)).toHaveAttribute("aria-pressed", "false");
    }
    await expect(page.locator(".kit-turn-strip")).toContainText(labels.next);
    await expect(page.getByRole("listitem").filter({ hasText: /^Team 1: 1$/ })).toBeVisible();
    await expect(round).toHaveCount(0);
    await page.getByRole("button", { name: labels.start, exact: true }).click();
    await expect(round.getByText("Team 2", { exact: true })).toBeVisible();
    if (labels.language === "de") await round.getByRole("button", { name: labels.correct }).click();
    await page.clock.fastForward(60_000);
    // The short game has three rounds for two teams: play the remaining four turns without points.
    for (let turn = 0; turn < 4; turn += 1) {
      await page.getByRole("button", { name: labels.start, exact: true }).click();
      await page.clock.fastForward(60_000);
    }
    await page.getByRole("button", { name: labels.show }).click();
    await expect(page.getByText(labels.winner)).toBeVisible();
    await expect(
      page.getByRole("listitem").filter({
        hasText: new RegExp(`^Team 2: ${labels.language === "de" ? 1 : 0}$`),
      }),
    ).toBeVisible();
    await page.getByRole("button", { name: labels.restart }).click();
    await page.getByRole("button", { name: labels.start, exact: true }).click();
    await expect(round.getByText(labels.score)).toBeVisible();
    await page.reload();
    await expect(round).toHaveCount(0);
    await expect(page.getByRole("button", { name: labels.prepare, exact: true })).toBeVisible();
    await expect(
      page.getByRole("group", { name: labels.rounds }).getByRole("radio", { name: /3/ }),
    ).toBeChecked();
  });
}
