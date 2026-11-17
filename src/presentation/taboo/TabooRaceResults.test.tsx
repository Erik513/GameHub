import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { expect, it } from "vitest";
import { createGameHubI18n } from "../../i18n";
import { TabooRaceResults } from "./TabooRaceResults";

it("gives equal times (to the tenth of a second) the same rank and the same bar", async () => {
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <TabooRaceResults
        label="Times"
        rows={[
          { id: "a", name: "Owls", solved: 5, timeMs: 2170, total: 5 },
          { id: "b", name: "Foxes", solved: 5, timeMs: 2200, total: 5 },
          { id: "c", name: "Bears", solved: 5, timeMs: 4400, total: 5 },
        ]}
      />
    </I18nextProvider>,
  );
  const rows = screen.getAllByRole("listitem");
  const width = (row: HTMLElement) =>
    row.querySelector<HTMLElement>(".kit-scoreboard__bar")?.style.width;
  // 2.2 s and 2.2 s are the same time: both have the full bar and share the first rank.
  expect(rows.map((row) => row.getAttribute("data-rank"))).toEqual(["1", "1", "3"]);
  expect(width(rows[0]!)).toBe("100%");
  expect(width(rows[1]!)).toBe("100%");
  expect(width(rows[2]!)).toBe("50%");
});
