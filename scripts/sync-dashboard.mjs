import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

// Keeps the embedded status snapshot in the development dashboard in sync with the status file.
// The dashboard shows the snapshot when it is opened directly from disk (file://).
const statusPath = fileURLToPath(new URL("../docs/GAMEHUB_STATUS.json", import.meta.url));
const dashboardPath = fileURLToPath(new URL("../docs/GAMEHUB_DEVELOPMENT.html", import.meta.url));
const marker = "const EMBEDDED_STATUS =\n";
const checkOnly = process.argv.includes("--check");

const statusSource = await readFile(statusPath, "utf8");
const status = JSON.parse(statusSource);
normalizeStatus(status);
const lineBreak = statusSource.includes("\r\n") ? "\r\n" : "\n";
const normalizedSource = (JSON.stringify(status, null, 2) + "\n").replace(/\n/g, lineBreak);
// The dashboard may have Windows line breaks (a checkout can change them); the marker and the end are searched in a text with plain ones.
const dashboardSource = await readFile(dashboardPath, "utf8");
const dashboardLineBreak = dashboardSource.includes("\r\n") ? "\r\n" : "\n";
const html = dashboardSource.replace(/\r\n/g, "\n");
const start = html.indexOf(marker);
if (start === -1) throw new Error("EMBEDDED_STATUS marker not found in the dashboard.");
const bodyStart = start + marker.length;
const bodyEnd = html.indexOf("\n};", bodyStart) + 2;
if (bodyEnd < bodyStart) throw new Error("End of the embedded status not found in the dashboard.");

const next = html.slice(0, bodyStart) + JSON.stringify(status, null, 2) + html.slice(bodyEnd);

if (next === html && normalizedSource === statusSource) {
  console.log("Dashboard snapshot is up to date.");
} else if (checkOnly) {
  console.error("Status file or dashboard snapshot is outdated. Run `pnpm docs:sync`.");
  process.exitCode = 1;
} else {
  await writeFile(statusPath, normalizedSource, "utf8");
  await writeFile(dashboardPath, next.replace(/\n/g, dashboardLineBreak), "utf8");
  console.log("Status file and dashboard snapshot updated.");
}

/**
 * Derives what must never be edited by hand: the status of a phase follows its tasks (all done is
 * done, some done or in progress is in progress, otherwise planned) and the project progress is the
 * share of done tasks. Tasks are sorted by their ID. Every phase must belong to the area "general" or to one game of `games`.
 */
function normalizeStatus(data) {
  const areas = new Set(["general", ...(data.games ?? []).map((game) => game.id)]);
  for (const phase of data.phases) {
    if (!areas.has(phase.area))
      throw new Error(`Phase ${phase.id} has no valid area: ${phase.area}`);
    phase.tasks.sort((first, second) => first.id.localeCompare(second.id, "en", { numeric: true }));
    const done = phase.tasks.filter((task) => task.status === "done").length;
    const started = phase.tasks.some(
      (task) => task.status === "in_progress" || task.status === "blocked",
    );
    phase.status =
      done === phase.tasks.length ? "done" : done > 0 || started ? "in_progress" : "planned";
  }
  const tasks = data.phases.flatMap((phase) => phase.tasks);
  const completedTasks = tasks.filter((task) => task.status === "done").length;
  data.project.progress = {
    completedTasks,
    totalTasks: tasks.length,
    percent: Math.round((completedTasks / tasks.length) * 1000) / 10,
  };
}
