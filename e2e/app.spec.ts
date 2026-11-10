import { expect, test } from "@playwright/test";

test("renders the GameHub foundation", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("GameHub");
  await expect(page.getByRole("heading", { name: "GameHub" })).toBeVisible();
  await expect(page.getByRole("list", { name: "Architecture layers" })).toBeVisible();
});

test("persists the selected UI language", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("combobox", { name: "Interface language" }).selectOption("de");
  await expect(page.getByRole("list", { name: "Architekturschichten" })).toBeVisible();

  await page.reload();

  await expect(page.getByRole("combobox", { name: "Oberflächensprache" })).toHaveValue("de");
  await expect(page.getByText("Projektgrundlage")).toBeVisible();
});

test("persists UI and card languages independently", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("combobox", { name: "Card language" }).selectOption("de");
  await page.getByRole("combobox", { name: "Interface language" }).selectOption("de");
  await page.getByRole("combobox", { name: "Oberflächensprache" }).selectOption("en");

  await expect(page.getByRole("combobox", { name: "Interface language" })).toHaveValue("en");
  await expect(page.getByRole("combobox", { name: "Card language" })).toHaveValue("de");

  await page.reload();

  await expect(page.getByRole("combobox", { name: "Interface language" })).toHaveValue("en");
  await expect(page.getByRole("combobox", { name: "Card language" })).toHaveValue("de");
});
