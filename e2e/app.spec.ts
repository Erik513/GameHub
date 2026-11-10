import { expect, test } from "@playwright/test";

test("renders the GameHub foundation", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("GameHub");
  await expect(page.getByRole("heading", { name: "GameHub" })).toBeVisible();
  await expect(page.getByRole("list", { name: "Architecture layers" })).toBeVisible();
});

test("persists the selected UI language", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("combobox", { name: "Language" }).selectOption("de");
  await expect(page.getByRole("list", { name: "Architekturschichten" })).toBeVisible();

  await page.reload();

  await expect(page.getByRole("combobox", { name: "Sprache" })).toHaveValue("de");
  await expect(page.getByText("Projektgrundlage")).toBeVisible();
});
