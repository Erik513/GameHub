import { render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { ActionRow } from "./ActionRow";
import { ManageScreen } from "./ManageScreen";
import { ScoreScreen } from "./ScoreScreen";

const teams = [
  { id: "a", name: "Red" },
  { id: "b", name: "Blue" },
];

it("puts the buttons of an action row next to each other in the given order", () => {
  render(
    <ActionRow>
      <button type="button">Save</button>
      <button type="button">Delete</button>
      <button type="button">Cancel</button>
    </ActionRow>,
  );
  const row = document.querySelector(".kit-action-row")!;
  expect(
    within(row as HTMLElement)
      .getAllByRole("button")
      .map((button) => button.textContent),
  ).toEqual(["Save", "Delete", "Cancel"]);
});

it("frames an editor with title, hint, chapters, a row of actions and messages", () => {
  render(
    <ManageScreen
      actions={
        <>
          <button type="button">Import</button>
          <button type="button">Export</button>
        </>
      }
      hint="Import or export cards."
      messages={<p role="status">Imported 3</p>}
      title="Own cards"
    >
      <p>Chapters</p>
    </ManageScreen>,
  );
  const screenRegion = screen.getByRole("region", { name: "Own cards" });
  expect(within(screenRegion).getByRole("heading", { name: "Own cards" })).toBeVisible();
  expect(within(screenRegion).getByText("Import or export cards.")).toBeVisible();
  const row = screenRegion.querySelector(".kit-action-row")!;
  expect(within(row).getAllByRole("button")).toHaveLength(2);
  expect(within(screenRegion).getByRole("status")).toHaveTextContent("Imported 3");
});

it("shows the standings between the turns with an extra text and the main action", () => {
  render(
    <ScoreScreen
      actions={<button type="button">Start round</button>}
      ariaLabel="Overview"
      eyebrow="Round 1 of 3"
      intro={<p>Everyone is ready</p>}
      standings={{ scores: [1, 3], teams, title: "Standings" }}
    >
      <p>Review</p>
    </ScoreScreen>,
  );
  const overview = screen.getByRole("region", { name: "Overview" });
  expect(within(overview).getByText("Round 1 of 3")).toBeVisible();
  expect(within(overview).getByRole("heading", { name: "Standings" })).toBeVisible();
  // The team with more points comes first.
  expect(
    within(screen.getByRole("list", { name: "Standings" }))
      .getAllByRole("listitem")
      .map((row) => row.textContent),
  ).toEqual(["Blue: 3", "Red: 1"]);
  expect(within(overview).getByText("Review")).toBeVisible();
  expect(within(overview).getByRole("button", { name: "Start round" })).toBeVisible();
});

it("shows the winner on the final screen and works without standings", () => {
  const { rerender } = render(
    <ScoreScreen
      actions={<button type="button">New game</button>}
      ariaLabel="Result"
      standings={{ scores: [5, 2], teams, title: "Final", winnerIds: ["a"] }}
      stackedActions
      winner={{ label: "Winner", names: "Red" }}
    />,
  );
  expect(screen.getByRole("status")).toHaveTextContent("Winner: Red");
  expect(document.querySelector(".kit-start-bar--stack")).not.toBeNull();
  rerender(<ScoreScreen actions={<button type="button">Go</button>} ariaLabel="Plain" />);
  expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Go" })).toBeVisible();
});
