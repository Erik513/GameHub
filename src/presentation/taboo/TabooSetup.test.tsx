import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { expect, it, vi } from "vitest";
import { createGameHubI18n } from "../../i18n";
import { TabooSetup } from "./TabooSetup";
import { tabooStandardCards } from "../../data/tabooStandardCards";

it("blocks a six-turn setup when the chosen filters match only five cards", async () => {
  const user = userEvent.setup();
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <TabooSetup cardLanguage="en" cards={tabooStandardCards} />
    </I18nextProvider>,
  );
  await user.click(screen.getByRole("checkbox", { name: "Everyday life" }));
  await user.click(screen.getByRole("checkbox", { name: "Culture" }));
  await user.click(screen.getByRole("radio", { name: "Easy" }));
  await user.click(screen.getByRole("button", { name: "Start" }));
  expect(screen.getByRole("alert")).toHaveTextContent("The filters match 5 cards");
  expect(screen.queryByRole("button", { name: "Start round" })).not.toBeInTheDocument();
  await user.click(screen.getByRole("checkbox", { name: "Nature" }));
  await user.click(screen.getByRole("button", { name: "Start" }));
  expect(screen.getByRole("alert")).toHaveTextContent("Select at least one category.");
});

it.each([
  ["en", "Start"],
  ["de", "Starten"],
] as const)("starts the first round directly in %s", async (language, start) => {
  const user = userEvent.setup();
  const i18n = await createGameHubI18n(language);
  render(
    <I18nextProvider i18n={i18n}>
      <TabooSetup cardLanguage={language} cards={tabooStandardCards} />
    </I18nextProvider>,
  );
  await user.click(screen.getByRole("group", { name: "Teams" }).querySelector("input[value='3']")!);
  await user.click(screen.getByRole("button", { name: start }));
  expect(
    screen.getByRole("region", { name: language === "en" ? "Round overview" : "Rundenübersicht" }),
  ).toBeVisible();
  expect(screen.queryByRole("timer")).not.toBeInTheDocument();
});

it("uses custom team names and falls back to defaults for blank fields", async () => {
  const user = userEvent.setup();
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <TabooSetup cardLanguage="en" cards={tabooStandardCards} />
    </I18nextProvider>,
  );
  await user.click(screen.getByRole("group", { name: "Teams" }).querySelector("input[value='3']")!);
  await user.type(screen.getByRole("textbox", { name: "Name of team 1" }), "Foxes");
  await user.type(screen.getByRole("textbox", { name: "Name of team 3" }), "  Owls ");
  await user.click(screen.getByRole("button", { name: "Start" }));
  const standings = within(screen.getByRole("list", { name: "Total scores" })).getAllByRole(
    "listitem",
  );
  expect(standings.map((row) => row.textContent).sort()).toEqual([
    "Foxes: 0",
    "Owls: 0",
    "Team 2: 0",
  ]);
});

it("rejects duplicate custom team names", async () => {
  const user = userEvent.setup();
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <TabooSetup cardLanguage="en" cards={tabooStandardCards} />
    </I18nextProvider>,
  );
  await user.type(screen.getByRole("textbox", { name: "Name of team 1" }), "Same");
  await user.type(screen.getByRole("textbox", { name: "Name of team 2" }), "Same");
  await user.click(screen.getByRole("button", { name: "Start" }));
  expect(screen.getByRole("alert")).toHaveTextContent("Use a different name for each team.");
});

it("randomizes the team order once and keeps it for the whole game", async () => {
  const random = vi.spyOn(Math, "random").mockReturnValue(0);
  const user = userEvent.setup();
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <TabooSetup cardLanguage="en" cards={tabooStandardCards} />
    </I18nextProvider>,
  );
  await user.click(screen.getByRole("group", { name: "Teams" }).querySelector("input[value='3']")!);
  await user.click(screen.getByRole("button", { name: "Start" }));
  expect(screen.getByText("Round 1/3")).toBeVisible();
  expect(document.querySelector(".taboo-overview__turn strong")).toHaveTextContent("Team 2");
  expect(
    within(screen.getByRole("list", { name: "Total scores" }))
      .getAllByRole("listitem")
      .map((row) => row.textContent),
  ).toEqual(["Team 2: 0", "Team 3: 0", "Team 1: 0"]);
  random.mockRestore();
});

it("lets a turn use more than its fair share of cards and reuses cards in later turns", async () => {
  const user = userEvent.setup();
  const i18n = await createGameHubI18n("en");
  const cards = tabooStandardCards.filter((card) => card.language === "en").slice(0, 6);
  render(
    <I18nextProvider i18n={i18n}>
      <TabooSetup cardLanguage="en" cards={cards} />
    </I18nextProvider>,
  );
  await user.click(
    screen.getByRole("group", { name: "Rounds per team" }).querySelector("input[value='1']")!,
  );
  await user.click(screen.getByRole("button", { name: "Start" }));
  await user.click(screen.getByRole("button", { name: "Start round" }));
  for (let played = 0; played < 5; played += 1) {
    await user.click(screen.getByRole("button", { name: "Correct" }));
  }
  expect(screen.getByRole("timer")).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Correct" }));
  expect(screen.queryByRole("timer")).not.toBeInTheDocument();
  // All six cards were used by the first team; the second team still gets a full deck.
  await user.click(screen.getByRole("button", { name: "Start round" }));
  expect(screen.getByRole("timer")).toBeVisible();
});

it.each([
  ["None", false, 0],
  ["Unlimited", true, 3],
])("applies the skip option %s", async (option, canSkipAgain, skips) => {
  const user = userEvent.setup();
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <TabooSetup cardLanguage="en" cards={tabooStandardCards} />
    </I18nextProvider>,
  );
  await user.click(screen.getByRole("radio", { name: option }));
  await user.click(screen.getByRole("button", { name: "Start" }));
  await user.click(screen.getByRole("button", { name: "Start round" }));
  for (let index = 0; index < skips; index += 1) {
    const skip = screen.queryByRole("button", { name: "Skip" });
    if (skip) await user.click(skip);
  }
  expect(Boolean(screen.queryByRole("button", { name: "Skip" }))).toBe(canSkipAgain);
});
