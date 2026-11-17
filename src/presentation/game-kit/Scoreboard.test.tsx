import { render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { Scoreboard } from "./Scoreboard";
import { rowText } from "../testing/scoreRows";

const teams = [
  { id: "a", name: "Owls" },
  { id: "b", name: "Foxes" },
  { id: "c", name: "Bears" },
  { id: "d", name: "Wolves" },
];

it("sorts teams by points, keeps playing order for ties and marks winners", () => {
  render(
    <Scoreboard label="Gesamtpunktestand" scores={[1, 3, 1, 0]} teams={teams} winnerIds={["b"]} />,
  );
  const rows = within(screen.getByRole("list", { name: "Gesamtpunktestand" })).getAllByRole(
    "listitem",
  );
  expect(rows.map((row) => rowText(row))).toEqual(["Foxes: 3", "Owls: 1", "Bears: 1", "Wolves: 0"]);
  expect(rows[2]).not.toHaveAttribute("aria-current");
  expect(rows[0]).toHaveAttribute("data-winner", "true");
});

it("treats missing scores as zero", () => {
  render(<Scoreboard label="Total scores" scores={[]} teams={teams.slice(0, 1)} />);
  expect(screen.getByRole("listitem")).toHaveTextContent("Owls: 0");
});

it("shows bars and ranks with a crown for the leader", () => {
  render(<Scoreboard label="Scores" scores={[1, 3, 3, 0]} teams={teams} />);
  const rows = within(screen.getByRole("list", { name: "Scores" })).getAllByRole("listitem");
  // Two teams share the first place (crown), the team with 1 point is third, the last one fourth.
  expect(rows.map((row) => row.getAttribute("data-rank"))).toEqual(["1", "1", "3", "4"]);
  expect(rows[0]!.querySelector(".kit-scoreboard__rank svg")).not.toBeNull();
  expect(rows[2]!.querySelector(".kit-scoreboard__rank")).toHaveTextContent("3");
  // The bars are as long as the points compared to the leader.
  const widths = rows.map(
    (row) => row.querySelector<HTMLElement>(".kit-scoreboard__bar")?.style.width,
  );
  expect(widths).toEqual(["100%", "100%", "33.3333%", "0%"]);
  // Only the points are shown next to the name: no gap to the leader, no mark for the next team.
  expect(rows.map((row) => rowText(row))).toEqual(["Foxes: 3", "Bears: 3", "Owls: 1", "Wolves: 0"]);
  expect(document.querySelector(".kit-scoreboard__gap, .kit-scoreboard__next")).toBeNull();
});

it("shows no crown while nobody has points", () => {
  render(<Scoreboard label="Scores" scores={[0, 0]} teams={teams.slice(0, 2)} />);
  const rows = screen.getAllByRole("listitem");
  expect(rows.every((row) => row.querySelector(".kit-scoreboard__rank svg") === null)).toBe(true);
});
