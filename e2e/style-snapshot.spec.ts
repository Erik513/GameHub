import { test, type Page } from "@playwright/test";
import { closeSettings, openSettings } from "./setupSteps";
import { snapshotStyles } from "./styleSnapshot";

/**
 * Snapshots of the computed styles at wide screens (the layout audit only looks at phones), to compare
 * before and after a change of the style sheets. Runs only when `STYLE_SNAPSHOT_DIR` is set.
 */
test.skip(!process.env.STYLE_SNAPSHOT_DIR, "Only for the comparison of style sheets.");

async function open(page: Page, width: number, height: number) {
  await page.setViewportSize({ width, height });
  await page.clock.install();
  await page.addInitScript(() => {
    Math.random = () => 0.99;
  });
  await page.goto("/");
}

for (const [width, height] of [
  [1280, 800],
  [768, 1024],
  [375, 812],
] as const) {
  test(`style snapshot at ${width}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-chromium", "One project is enough.");
    const press = (name: string) => page.getByRole("button", { name, exact: true }).first().click();
    await open(page, width, height);
    await snapshotStyles(page, `wide ${width} library`);
    await press("Play");
    await snapshotStyles(page, `wide ${width} lineup`);
    await openSettings(page, "Game settings");
    for (const mode of ["Classic", "Against the clock", "Race"]) {
      await page.getByRole("radio", { name: mode }).check({ force: true });
      await snapshotStyles(page, `wide ${width} settings ${mode}`);
    }
    await page.getByRole("tab", { name: "Categories" }).click();
    await snapshotStyles(page, `wide ${width} cards tab`);
    await page.getByRole("tab", { name: "Game settings" }).click();
    await page.getByRole("radio", { name: "Classic" }).check({ force: true });
    await closeSettings(page, "Done");
    await press("Start game");
    await snapshotStyles(page, `wide ${width} round overview`);
    await press("Start round");
    await snapshotStyles(page, `wide ${width} running round`);
    await press("Pause");
    await snapshotStyles(page, `wide ${width} paused round`);
  });
}
