import { render, screen, within } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { expect, it } from "vitest";
import { createGameHubI18n } from "../../i18n";
import { TabooScoreboard } from "./TabooScoreboard";

const teams = [
  { id: "a", name: "Owls" },
  { id: "b", name: "Foxes" },
  { id: "c", name: "Bears" },
  { id: "d", name: "Wolves" },
];

it("sorts teams by points, keeps playing order for ties and marks the active team", async () => {
  const i18n = await createGameHubI18n("de");
  render(
    <I18nextProvider i18n={i18n}>
      <TabooScoreboard activeTeamId="c" scores={[1, 3, 1, 0]} teams={teams} winnerIds={["b"]} />
    </I18nextProvider>,
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
  expect(rows[2]).toHaveAttribute("aria-current", "true");
  expect(rows[0]).toHaveAttribute("data-winner", "true");
});

it("treats missing scores as zero", async () => {
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <TabooScoreboard scores={[]} teams={teams.slice(0, 1)} />
    </I18nextProvider>,
  );
  expect(screen.getByRole("listitem")).toHaveTextContent("Owls: 0");
});
