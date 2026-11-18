import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { expect, it } from "vitest";
import { createGameHubI18n } from "../../i18n";
import { TabooCountdownStrip } from "./TabooCountdownStrip";

it("colors the time of a team amber at 20 seconds and red at 10, and marks a team that is out", async () => {
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <TabooCountdownStrip
        active={0}
        teams={[
          { eliminated: false, id: "a", name: "Red", remainingMs: 60_000 },
          { eliminated: false, id: "b", name: "Blue", remainingMs: 20_000 },
          { eliminated: false, id: "c", name: "Green", remainingMs: 9_100 },
          { eliminated: false, id: "d", name: "Gold", remainingMs: 15_000 },
          { eliminated: true, id: "e", name: "Gray", remainingMs: 0 },
        ]}
      />
    </I18nextProvider>,
  );
  const time = (text: string) => screen.getByText(text);
  expect(time("1:00")).toHaveAttribute("data-warn", "false");
  expect(time("1:00")).toHaveAttribute("data-low", "false");
  expect(time("0:20")).toHaveAttribute("data-warn", "true");
  expect(time("0:10")).toHaveAttribute("data-low", "true");
  expect(time("0:10")).toHaveAttribute("data-warn", "false");
  expect(time("0:15")).toHaveAttribute("data-warn", "true");
  // 9.1 seconds count as 10 (the clock rounds up), so it is red, too.
  // A team that is out shows "out" without a color.
  expect(time("out")).toHaveAttribute("data-low", "false");
  expect(screen.getByText("Red").closest("li")).toHaveAttribute("data-active", "true");
});
