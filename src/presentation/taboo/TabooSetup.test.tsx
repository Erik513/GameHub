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
  await user.type(screen.getByRole("textbox", { name: "Team 1" }), "Owls");
  await user.type(screen.getByRole("textbox", { name: "Team 2" }), "Foxes");
  await user.click(screen.getByRole("checkbox", { name: "Everyday life" }));
  await user.click(screen.getByRole("checkbox", { name: "Culture" }));
  await user.selectOptions(screen.getByRole("combobox", { name: "Difficulty" }), "easy");
  await user.click(screen.getByRole("button", { name: "Prepare game" }));
  expect(screen.getByRole("alert")).toHaveTextContent("The filters match 5 cards");
  expect(screen.queryByRole("button", { name: "Start round" })).not.toBeInTheDocument();
  await user.click(screen.getByRole("checkbox", { name: "Nature" }));
  await user.click(screen.getByRole("button", { name: "Prepare game" }));
  expect(screen.getByRole("alert")).toHaveTextContent("Select at least one category.");
});

it.each([
  [
    "en",
    "Prepare game",
    "Use a different name for each team.",
    "Game ready",
    "Add team",
    "Remove last team",
  ],
  [
    "de",
    "Partie vorbereiten",
    "Verwende für jedes Team einen eigenen Namen.",
    "Partie vorbereitet",
    "Team hinzufügen",
    "Letztes Team entfernen",
  ],
] as const)(
  "validates and prepares Taboo in %s",
  async (language, start, duplicate, ready, add, remove) => {
    const user = userEvent.setup();
    const i18n = await createGameHubI18n(language);
    render(
      <I18nextProvider i18n={i18n}>
        <TabooSetup cardLanguage={language} cards={tabooStandardCards} />
      </I18nextProvider>,
    );
    await user.click(screen.getByRole("button", { name: add }));
    expect(screen.getByRole("textbox", { name: "Team 3" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: remove }));
    const first = screen.getByRole("textbox", { name: "Team 1" });
    const second = screen.getByRole("textbox", { name: "Team 2" });
    const submit = screen.getByRole("button", { name: start });
    await user.type(first, "Owls");
    await user.type(second, " owls ");
    await user.click(submit);
    expect(screen.getByRole("alert")).toHaveTextContent(duplicate);
    expect(first).toHaveValue("Owls");
    await user.clear(second);
    await user.type(second, "Foxes");
    await user.click(submit);
    expect(screen.getByRole("status")).toHaveTextContent(ready);
    expect(screen.getByRole("status")).toHaveTextContent("Owls, Foxes");
  },
);
