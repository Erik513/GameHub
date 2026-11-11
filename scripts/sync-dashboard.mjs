import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

// Keeps the embedded status snapshot in the development dashboard in sync with the status file.
// The dashboard shows the snapshot when it is opened directly from disk (file://).
const statusPath = fileURLToPath(new URL("../docs/GAMEHUB_STATUS.json", import.meta.url));
const dashboardPath = fileURLToPath(new URL("../docs/GAMEHUB_DEVELOPMENT.html", import.meta.url));
const marker = "const EMBEDDED_STATUS =\n";
const checkOnly = process.argv.includes("--check");

const status = JSON.parse(await readFile(statusPath, "utf8"));
const html = await readFile(dashboardPath, "utf8");
const start = html.indexOf(marker);
if (start === -1) throw new Error("EMBEDDED_STATUS marker not found in the dashboard.");
const bodyStart = start + marker.length;
const bodyEnd = html.indexOf("\n};", bodyStart) + 2;
if (bodyEnd < bodyStart) throw new Error("End of the embedded status not found in the dashboard.");

const next = html.slice(0, bodyStart) + JSON.stringify(status, null, 2) + html.slice(bodyEnd);

if (next === html) {
  console.log("Dashboard snapshot is up to date.");
} else if (checkOnly) {
  console.error("Dashboard snapshot is outdated. Run `pnpm docs:sync`.");
  process.exitCode = 1;
} else {
  await writeFile(dashboardPath, next, "utf8");
  console.log("Dashboard snapshot updated.");
}
