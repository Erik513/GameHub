import { render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { ResultList } from "./ResultList";
import { resultText } from "../testing/scoreRows";

it("shows the rank with a crown for the best, the result with a note and a pending row", () => {
  render(
    <ResultList
      label="Times"
      pendingLabel="still to play"
      rows={[
        { bar: 1, id: "a", name: "Owls", rank: 1, value: "4.0 s", winner: true },
        { bar: 0.5, id: "b", name: "Foxes", note: "4/5 cards", rank: 2, value: "8.0 s" },
        { id: "c", name: "Bears" },
      ]}
    />,
  );
  const rows = within(screen.getByRole("list", { name: "Times" })).getAllByRole("listitem");
  expect(rows.map((row) => resultText(row))).toEqual([
    "Owls: 4.0 s",
    "Foxes: 4/5 cards · 8.0 s",
    "Bears: still to play",
  ]);
  // The best has the crown and the green frame, the second a number, the pending one an empty badge.
  expect(rows[0]!.querySelector(".kit-scoreboard__rank svg")).not.toBeNull();
  expect(rows[0]).toHaveAttribute("data-winner", "true");
  expect(rows[1]!.querySelector(".kit-scoreboard__rank")).toHaveTextContent("2");
  expect(rows[2]!.querySelector(".kit-scoreboard__rank")).toHaveAttribute("data-empty", "true");
  // The bars are as long as given; a row without a result has no bar.
  expect(rows[1]!.querySelector<HTMLElement>(".kit-scoreboard__bar")?.style.width).toBe("50%");
  expect(rows[2]!.querySelector(".kit-scoreboard__bar")).toBeNull();
});

it("puts the best result on top and rows without a result at the end", () => {
  render(
    <ResultList
      label="Times"
      pendingLabel="still to play"
      rows={[
        { id: "a", name: "Owls" },
        { id: "b", name: "Foxes", rank: 2, value: "8.0 s" },
        { id: "c", name: "Bears", rank: 1, value: "4.0 s" },
      ]}
    />,
  );
  const rows = within(screen.getByRole("list", { name: "Times" })).getAllByRole("listitem");
  expect(rows.map((row) => resultText(row))).toEqual([
    "Bears: 4.0 s",
    "Foxes: 8.0 s",
    "Owls: still to play",
  ]);
});
