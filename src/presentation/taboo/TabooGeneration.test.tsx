import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { expect, it, vi } from "vitest";
import type { TabooCardGenerator } from "../../business/games/taboo/cardGenerator";
import { createGameHubI18n } from "../../i18n";
import { TabooSetup } from "./TabooSetup";

it("adds new cards to the active deck without revealing them during setup", async () => {
  const i18n = await createGameHubI18n("en");
  const user = userEvent.setup();
  const generate = vi.fn<TabooCardGenerator["generate"]>().mockResolvedValue({
    status: "complete",
    candidates: [
      {
        language: "en",
        categoryId: "nature",
        difficulty: "easy",
        term: "Otter",
        forbiddenWords: ["river", "fur", "swim"],
      },
      {
        language: "en",
        categoryId: "nature",
        difficulty: "easy",
        term: "Orca",
        forbiddenWords: ["ocean", "whale", "black"],
      },
    ],
  });
  const generator: TabooCardGenerator = {
    capabilities: { languages: ["en"], maxCardsPerRequest: 10, worksOffline: false },
    generate,
  };
  render(
    <I18nextProvider i18n={i18n}>
      <TabooSetup cardLanguage="en" cards={[]} generators={{ local: generator }} />
    </I18nextProvider>,
  );
  await user.type(screen.getByRole("textbox", { name: "Team 1" }), "Owls");
  await user.type(screen.getByRole("textbox", { name: "Team 2" }), "Foxes");
  await user.clear(screen.getByRole("spinbutton", { name: "Rounds per team" }));
  await user.type(screen.getByRole("spinbutton", { name: "Rounds per team" }), "1");
  await user.click(screen.getByRole("checkbox", { name: "Everyday life" }));
  await user.click(screen.getByRole("checkbox", { name: "Culture" }));
  await user.click(screen.getByRole("checkbox", { name: "Add extra cards" }));
  await user.click(screen.getByRole("button", { name: "Prepare game" }));
  expect(generate.mock.calls[0]?.[0]).toEqual({
    language: "en",
    categoryId: "nature",
    difficulty: "easy",
    count: 2,
  });
  expect(screen.queryByText(/Otter|Orca|river|whale/)).not.toBeInTheDocument();
  await user.click(await screen.findByRole("button", { name: "Start round" }));
  expect(screen.getByRole("heading", { name: /Otter|Orca/ })).toBeVisible();
});
