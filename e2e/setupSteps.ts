import type { Page } from "@playwright/test";

/**
 * The settings of a game are a view of their own on a phone, with a button to open them and "Done" to
 * come back. At the PC (from 1024 px) they stand beside the line-up all the time and have neither
 * button. These steps do what a player does in either layout.
 */
export async function openSettings(page: Page, name: string): Promise<void> {
  const button = page.getByRole("button", { name, exact: true });
  if (await button.isVisible()) await button.click();
}

/** Comes back from the settings to the line-up when they are a view of their own. */
export async function closeSettings(page: Page, name: string): Promise<void> {
  const button = page.getByRole("button", { name, exact: true });
  if (await button.isVisible()) await button.click();
}
