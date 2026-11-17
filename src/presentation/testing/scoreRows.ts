/** Reads a row of the scoreboard as "Name: points", without the rank, the gap and the "up next" label. */
export function rowText(row: Element): string {
  const name = row.querySelector(".kit-scoreboard__name")?.firstChild?.textContent ?? "";
  const points = row.querySelector(".kit-scoreboard__score")?.lastChild?.textContent ?? "";
  return `${name}: ${points}`;
}
