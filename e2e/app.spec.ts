import { expect, test } from "@playwright/test";

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
  await page.getByRole("combobox", { name: "Interface language" }).selectOption("de");
  await expect(page.getByRole("heading", { name: "Wähle ein Spiel" })).toBeVisible();

  await page.reload();

  await page.getByRole("button", { name: "Einstellungen" }).click();
  await expect(page.getByRole("combobox", { name: "Oberflächensprache" })).toHaveValue("de");
  await expect(page.getByRole("heading", { name: "Wähle ein Spiel" })).toBeVisible();
});

test("navigates between the game library and preview", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "View progress" }).click();
  await expect(page).toHaveURL(/#\/games\/taboo$/);
  await expect(page.getByRole("heading", { name: "Taboo" })).toBeVisible();

  await page.getByRole("button", { name: "Back to all games" }).click();
  await expect(page).toHaveURL(/#\/$/);
  await expect(page.getByRole("heading", { name: "Choose a game" })).toBeVisible();
});

test("persists UI and card languages independently", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Settings" }).click();
  await page.getByRole("combobox", { name: "Card language" }).selectOption("de");
  await page.getByRole("combobox", { name: "Interface language" }).selectOption("de");
  await page.getByRole("combobox", { name: "Oberflächensprache" }).selectOption("en");

  await expect(page.getByRole("combobox", { name: "Interface language" })).toHaveValue("en");
  await expect(page.getByRole("combobox", { name: "Card language" })).toHaveValue("de");

  await page.reload();

  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByRole("combobox", { name: "Interface language" })).toHaveValue("en");
  await expect(page.getByRole("combobox", { name: "Card language" })).toHaveValue("de");
});

test("opens and closes the settings dialog", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByRole("dialog", { name: "Settings" })).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
});
