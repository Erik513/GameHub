import { render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { Scoreboard } from "./Scoreboard";

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
  expect(rows.map((row) => row.textContent)).toEqual([
    "Foxes: 3",
    "Owls: 1",
    "Bears: 1",
    "Wolves: 0",
  ]);
  expect(rows[2]).not.toHaveAttribute("aria-current");
  expect(rows[0]).toHaveAttribute("data-winner", "true");
});

it("treats missing scores as zero", () => {
  render(<Scoreboard label="Total scores" scores={[]} teams={teams.slice(0, 1)} />);
  expect(screen.getByRole("listitem")).toHaveTextContent("Owls: 0");
});
