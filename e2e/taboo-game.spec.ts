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
    next: "Next team: Foxes",
    show: "Show final results",
    winner: "Winner: Owls",
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
    next: "Nächstes Team: Foxes",
    show: "Endergebnis anzeigen",
    winner: "Gemeinsam gewonnen haben Owls, Foxes.",
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
    await page.getByRole("textbox", { name: "Team 1" }).fill("Owls");
    await page.getByRole("textbox", { name: "Team 2" }).fill("Foxes");
    await page.getByRole("spinbutton", { name: labels.rounds }).fill("1");
    await page.getByRole("button", { name: labels.prepare }).click();
    await page.getByRole("button", { name: labels.start }).click();
    const round = page.getByRole("region", { name: labels.active });
    await round.getByRole("button", { name: labels.correct }).click();
    await round.getByRole("button", { name: labels.skip }).click();
    await round.getByRole("button", { name: labels.forbidden }).click();
    await page.clock.fastForward(60_000);
    await expect(page.getByText(labels.next)).toBeVisible();
    await expect(page.getByText("Owls: 1", { exact: true })).toBeVisible();
    await expect(round).toHaveCount(0);
    await page.getByRole("button", { name: labels.start }).click();
    await expect(round.getByText("Team: Foxes")).toBeVisible();
    if (labels.language === "de") await round.getByRole("button", { name: labels.correct }).click();
    await page.clock.fastForward(60_000);
    await page.getByRole("button", { name: labels.show }).click();
    await expect(page.getByText(labels.winner)).toBeVisible();
    await expect(
      page.getByText(`Foxes: ${labels.language === "de" ? 1 : 0}`, { exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: labels.restart }).click();
    await page.getByRole("button", { name: labels.start }).click();
    await expect(round.getByText(labels.score)).toBeVisible();
    await page.reload();
    await expect(round).toHaveCount(0);
    await expect(page.getByRole("button", { name: labels.prepare })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Team 1" })).toHaveValue("");
  });
}
