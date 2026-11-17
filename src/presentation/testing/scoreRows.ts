/** Reads a row of the scoreboard as "Name: points", without the rank, the gap and the "up next" label. */
export function rowText(row: Element): string {
  const name = row.querySelector(".kit-scoreboard__name")?.firstChild?.textContent ?? "";
  const points = row.querySelector(".kit-scoreboard__score")?.lastChild?.textContent ?? "";
  return `${name}: ${points}`;
}

/** Reads a row of a result list as "Name: note · value" (for example "Team 1: 3/3 cards · 10.0 s"). */
export function resultText(row: Element): string {
  const name = row.querySelector(".kit-scoreboard__name")?.textContent ?? "";
  const result = row.querySelector(".kit-scoreboard__score")?.textContent ?? "";
  return `${name}: ${result}`;
}
