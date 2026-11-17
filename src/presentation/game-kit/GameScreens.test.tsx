import { render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { ActionRow } from "./ActionRow";
import { LineupScreen } from "./LineupScreen";
import { ManageScreen } from "./ManageScreen";
import { TabPane } from "./TabPane";
import { ScoreScreen } from "./ScoreScreen";
import { rowText } from "../testing/scoreRows";

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

it("frames an editor with title, tabs, a row of actions pinned to the bottom and messages", () => {
  render(
    <ManageScreen
      messages={<p role="status">Imported 3</p>}
      tabs={[
        {
          content: (
            <TabPane
              footer={
                <ActionRow>
                  <button type="button">Import</button>
                  <button type="button">Export</button>
                </ActionRow>
              }
            >
              <p>All cards</p>
            </TabPane>
          ),
          id: "cards",
          label: "Cards",
        },
        { content: <p>Form</p>, id: "add", label: "Add card" },
      ]}
      tabsLabel="Editor"
      title="Own cards"
    />,
  );
  const screenRegion = screen.getByRole("region", { name: "Own cards" });
  expect(screenRegion).toHaveClass("kit-onepage");
  expect(within(screenRegion).getByRole("heading", { name: "Own cards" })).toBeVisible();
  // The cards are on the left, the form to add one on the right; the first tab is open.
  const tabs = within(screenRegion).getAllByRole("tab");
  expect(tabs.map((tab) => tab.textContent)).toEqual(["Cards", "Add card"]);
  expect(tabs[0]).toHaveAttribute("aria-selected", "true");
  const row = screenRegion.querySelector<HTMLElement>(".kit-action-row")!;
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
      .map((row) => rowText(row)),
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

it("frames the line-up with messages and a start button that submits the form", async () => {
  const onSubmit = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
  const { rerender } = render(
    <LineupScreen
      ariaLabel="Line-up"
      formId="lineup"
      messages={<p role="alert">Not enough players</p>}
      onSubmit={onSubmit}
      startLabel="Start game"
    >
      <input aria-label="Team name" />
    </LineupScreen>,
  );
  const lineup = screen.getByRole("region", { name: "Line-up" });
  expect(within(lineup).getByRole("alert")).toHaveTextContent("Not enough players");
  expect(within(lineup).getByRole("textbox", { name: "Team name" })).toBeVisible();
  await userEvent.click(screen.getByRole("button", { name: "Start game" }));
  expect(onSubmit).toHaveBeenCalledOnce();

  rerender(
    <LineupScreen
      ariaLabel="Line-up"
      formId="lineup"
      onSubmit={onSubmit}
      startDisabled
      startLabel="Preparing"
    >
      <p>Body</p>
    </LineupScreen>,
  );
  expect(screen.getByRole("button", { name: "Preparing" })).toBeDisabled();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

it("is one page: standings and review are tabs when there is a review, otherwise one box", () => {
  const { rerender } = render(
    <ScoreScreen
      actions={<button type="button">Start round</button>}
      ariaLabel="Overview"
      standings={{ scores: [1, 3], tabLabel: "Scores", teams, title: "Standings" }}
    />,
  );
  const overview = screen.getByRole("region", { name: "Overview" });
  expect(overview).toHaveClass("kit-onepage");
  // Without a review there are no tabs: the standings are in one box.
  expect(within(overview).queryByRole("tab")).not.toBeInTheDocument();
  expect(overview.querySelector(".kit-score-box")).not.toBeNull();

  rerender(
    <ScoreScreen
      actions={<button type="button">Start round</button>}
      ariaLabel="Overview"
      extraTab={{ content: <p>Cards of the turn</p>, label: "Last round (4)" }}
      standings={{ scores: [1, 3], tabLabel: "Scores", teams, title: "Standings" }}
    />,
  );
  const tabs = within(overview).getAllByRole("tab");
  expect(tabs.map((tab) => tab.textContent)).toEqual(["Scores", "Last round (4)"]);
  // The standings are open first; the main action stays at the bottom.
  expect(tabs[0]).toHaveAttribute("aria-selected", "true");
  expect(within(overview).getByRole("button", { name: "Start round" })).toBeVisible();
});

it("shows a progress bar above the heading of the overview when there is a progress", () => {
  render(
    <ScoreScreen
      actions={<button type="button">Start round</button>}
      ariaLabel="Overview"
      eyebrow="Round 2 of 3"
      progress={{ max: 6, value: 3 }}
    />,
  );
  const bar = screen.getByRole("progressbar", { name: "Round 2 of 3" });
  expect(bar).toHaveAttribute("aria-valuenow", "3");
  expect(bar).toHaveAttribute("aria-valuemax", "6");
  expect(bar.firstElementChild).toHaveStyle({ width: "50%" });
  // The bar comes first, the round text right below it.
  expect(bar.nextElementSibling).toHaveTextContent("Round 2 of 3");
});
