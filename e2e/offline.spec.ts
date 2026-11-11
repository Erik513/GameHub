import { expect, test } from "@playwright/test";

test("is installable and starts a Taboo round after an offline reload", async ({
  context,
  page,
}) => {
  await page.goto("/");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise<void>((resolve) =>
        navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), {
          once: true,
        }),
      );
    }
  });

  const session = await context.newCDPSession(page);
  try {
    const { installabilityErrors } = await session.send("Page.getInstallabilityErrors");
    // Playwright runs each test in an isolated private browser context.
    expect(installabilityErrors.filter(({ errorId }) => errorId !== "in-incognito")).toEqual([]);
  } finally {
    await session.detach();
  }
  const manifest = await page.request.get("/manifest.webmanifest");
  expect(manifest.ok()).toBe(true);
  expect(await manifest.json()).toMatchObject({
    name: "GameHub",
    start_url: "./",
    display: "standalone",
    icons: [{ src: "gamehub-icon.svg", sizes: "any" }],
  });
  expect((await page.request.get("/gamehub-icon.svg")).ok()).toBe(true);

  await context.setOffline(true);
  await page.reload();
  await page.getByRole("button", { name: "View progress" }).click();
  await page.getByRole("checkbox", { name: "Add extra cards" }).check();
  await page.getByRole("textbox", { name: "Team 1" }).fill("Owls");
  await page.getByRole("textbox", { name: "Team 2" }).fill("Foxes");
  await page.getByRole("button", { name: "Prepare game" }).click();
  await expect(page.getByText("No new extra cards are available.")).toHaveCount(0);
  await page.getByRole("button", { name: "Start round" }).click();
  await expect(
    page.getByRole("region", { name: "Active round" }).getByRole("listitem"),
  ).toHaveCount(3);
});
