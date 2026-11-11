import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { expect, it } from "vitest";
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
  await user.click(screen.getByRole("button", { name: "Prepare game" }));
  expect(screen.getByRole("alert")).toHaveTextContent("The filters match 5 cards");
  expect(screen.queryByRole("button", { name: "Start round" })).not.toBeInTheDocument();
  await user.click(screen.getByRole("checkbox", { name: "Nature" }));
  await user.click(screen.getByRole("button", { name: "Prepare game" }));
  expect(screen.getByRole("alert")).toHaveTextContent("Select at least one category.");
});

it.each([
  ["en", "Prepare game", "Game ready"],
  ["de", "Partie vorbereiten", "Partie vorbereitet"],
] as const)("prepares three named teams in %s", async (language, start, ready) => {
  const user = userEvent.setup();
  const i18n = await createGameHubI18n(language);
  render(
    <I18nextProvider i18n={i18n}>
      <TabooSetup cardLanguage={language} cards={tabooStandardCards} />
    </I18nextProvider>,
  );
  await user.click(screen.getByRole("group", { name: "Teams" }).querySelector("input[value='3']")!);
  await user.click(screen.getByRole("button", { name: start }));
  expect(screen.getByRole("status")).toHaveTextContent(ready);
  expect(screen.getByRole("status")).toHaveTextContent("Team 1, Team 2, Team 3");
});
