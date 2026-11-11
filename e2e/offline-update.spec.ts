import { readFile, readdir } from "node:fs/promises";
import { createServer } from "node:http";
import { join } from "node:path";
import { expect, test } from "@playwright/test";

const mime: Record<string, string> = {
  html: "text/html",
  js: "text/javascript",
  css: "text/css",
  svg: "image/svg+xml",
  webmanifest: "application/manifest+json",
};
const prefix = "/gamehub/";

async function serveUpdateFixture() {
  const dist = join(process.cwd(), "dist");
  const paths = [
    "index.html",
    "gamehub-sw.js",
    "manifest.webmanifest",
    "gamehub-icon.svg",
    ...(await readdir(join(dist, "assets"))).map((name) => `assets/${name}`),
  ];
  const files = new Map(
    await Promise.all(paths.map(async (path) => [path, await readFile(join(dist, path))] as const)),
  );
  let revision: "initial" | "broken" | "updated" = "initial";
  let workerRequests = 0;
  const server = createServer((request, response) => {
    const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
    if (pathname === "/probe") {
      response.writeHead(200, { "Content-Type": "text/html" }).end("<title>Update probe</title>");
      return;
    }
    const path = pathname.startsWith(prefix) ? pathname.slice(prefix.length) || "index.html" : "";
    const file = files.get(path);
    if (!file) {
      response.writeHead(404).end();
      return;
    }
    let body: Buffer | string = file;
    if (path === "gamehub-sw.js") {
      workerRequests += 1;
      const build = { version: revision, files: paths.filter((name) => name !== "gamehub-sw.js") };
      if (revision === "broken") build.files.push("missing-update-asset.js");
      body = file
        .toString()
        .replace(/^const build = [^\r\n]+/, `const build = ${JSON.stringify(build)};`);
    }
    response
      .writeHead(200, {
        "Content-Type": mime[path.split(".").at(-1) ?? ""] ?? "application/octet-stream",
        "Cache-Control": "no-store",
      })
      .end(body);
  });
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Missing update fixture port");
  return {
    origin: `http://127.0.0.1:${address.port}`,
    update(next: typeof revision) {
      revision = next;
    },
    requests: () => workerRequests,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
        server.closeAllConnections();
      }),
  };
}

test("keeps the offline app after a failed update and activates the next complete build", async ({
  context,
  page,
}) => {
  const server = await serveUpdateFixture();
  try {
    const url = server.origin + prefix;
    await page.goto(url);
    await expect
      .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)))
      .toBe(true);
    const cacheKeys = () => page.evaluate(() => caches.keys());
    await expect.poll(cacheKeys).toEqual(["gamehub:/gamehub/:initial"]);

    server.update("broken");
    const requests = server.requests();
    const failedState = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;
      const failed = new Promise<string>((resolve) => {
        registration.addEventListener(
          "updatefound",
          () => {
            const worker = registration.installing;
            worker?.addEventListener("statechange", () => {
              if (worker.state === "redundant") resolve(worker.state);
            });
          },
          { once: true },
        );
      });
      await registration.update();
      return failed;
    });
    expect(failedState).toBe("redundant");
    expect(server.requests()).toBeGreaterThan(requests);
    await expect.poll(cacheKeys).toEqual(["gamehub:/gamehub/:initial"]);
    await context.setOffline(true);
    await page.reload();
    await expect(page.getByRole("heading", { name: "Choose a game" })).toBeVisible();
    await context.setOffline(false);

    server.update("updated");
    await page.evaluate(async () => {
      await (await navigator.serviceWorker.ready).update();
    });
    await expect
      .poll(() => page.evaluate(async () => Boolean((await navigator.serviceWorker.ready).waiting)))
      .toBe(true);
    await expect
      .poll(cacheKeys)
      .toEqual(["gamehub:/gamehub/:initial", "gamehub:/gamehub/:updated"]);

    const probe = await context.newPage();
    await probe.goto(server.origin + "/probe");
    await page.close();
    await expect
      .poll(() => probe.evaluate(() => caches.keys()))
      .toEqual(["gamehub:/gamehub/:updated"]);
    await context.setOffline(true);
    await probe.goto(url);
    await expect(probe.getByRole("heading", { name: "Choose a game" })).toBeVisible();
  } finally {
    await context.setOffline(false);
    await server.close();
  }
});
