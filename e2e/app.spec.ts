import { expect, test } from "@playwright/test";

test("renders the GameHub foundation", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("GameHub");
  await expect(page.getByRole("heading", { name: "GameHub" })).toBeVisible();
  await expect(page.getByRole("list", { name: "Architecture layers" })).toBeVisible();
});
