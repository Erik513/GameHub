import { expect, test } from "@playwright/test";

const cases = [
  {
    language: "en",
    open: "View progress",
    start: "Start",
    startGame: "Start game",
    players: "Players",
    teams: "Teams",
    addPlayer: "Add player",
    addButton: "Add",
    draw: "Draw teams",
    noTeam: "No team",
    teamCount: "Teams",
    defaultTeam: (number: number) => `Team ${number}`,
    move: (place: number, team: string) => `Move ${team}, place ${place}`,
    pick: (player: string) => `Team of ${player}`,
  },
  {
    language: "de",
    open: "Fortschritt ansehen",
    start: "Starten",
    startGame: "Spiel starten",
    players: "Spieler",
    teams: "Teams",
    addPlayer: "Spieler hinzufügen",
    addButton: "Hinzufügen",
    draw: "Teams auslosen",
    noTeam: "Ohne Team",
    teamCount: "Teams",
    defaultTeam: (number: number) => `Team ${number}`,
    move: (place: number, team: string) => `${team} verschieben, Platz ${place}`,
    pick: (player: string) => `Team für ${player}`,
  },
] as const;

for (const labels of cases) {
  test(`sets up players, teams and the team order in the line-up in ${labels.language}`, async ({
    page,
  }) => {
    await page.goto("/");
    if (labels.language === "de") {
      await page.getByRole("button", { name: "Settings" }).click();
      await page
        .getByRole("group", { name: "Interface language" })
        .getByRole("radio", { name: "German" })
        .check({ force: true });
      await page.getByRole("dialog").getByRole("button", { name: "Schließen" }).click();
    }
    await page.getByRole("button", { name: labels.open }).click();
    await page.getByRole("button", { name: labels.start, exact: true }).click();

    // The box of the players is collapsed (Taboo does not need names); open it and add players.
    const playersBox = page.getByRole("region", { name: labels.players });
    await playersBox.locator("summary").click();
    await playersBox.getByRole("textbox", { name: labels.addPlayer }).fill("anna, ben, cara, dora");
    await playersBox.getByRole("button", { name: labels.addButton, exact: true }).click();
    await expect(playersBox.getByRole("list").getByRole("listitem")).toHaveCount(4);

    // Three teams, everybody is drawn into a team.
    const teamsBox = page.getByRole("region", { name: labels.teams });
    await teamsBox
      .getByRole("group", { name: labels.teamCount, exact: true })
      .locator("label", { hasText: "3" })
      .click();
    await teamsBox.getByRole("button", { name: labels.draw }).click();
    await expect(teamsBox.getByRole("heading", { name: labels.noTeam })).toHaveCount(0);

    // A tap on a name opens the choice of the team; Dora goes to team 3.
    await teamsBox.getByRole("button", { name: "Dora", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: labels.pick("Dora") });
    await dialog.getByRole("button", { name: labels.defaultTeam(3) }).click();
    await expect(dialog).toHaveCount(0);
    const thirdTeam = teamsBox.locator(".kit-team").nth(2);
    await expect(thirdTeam.getByRole("button", { name: "Dora", exact: true })).toBeVisible();

    // Anna is dragged into team 3 with the mouse (the team under the pointer is the drop field).
    await teamsBox
      .getByRole("button", { name: "Anna", exact: true })
      .dragTo(thirdTeam, { targetPosition: { x: 40, y: 20 } });
    await expect(thirdTeam.getByRole("button", { name: "Anna", exact: true })).toBeVisible();

    // Team 3 starts: it is moved to the top place with the keyboard.
    await page.getByRole("button", { name: labels.move(3, labels.defaultTeam(3)) }).focus();
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowUp");

    await page.getByRole("button", { name: labels.startGame, exact: true }).click();
    await expect(page.locator(".kit-turn-strip")).toContainText(labels.defaultTeam(3));
  });
}
