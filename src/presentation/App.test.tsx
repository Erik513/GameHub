import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createGameHubI18n, type SupportedLanguage } from "../i18n";
import { App } from "./App";

const languageCases = [
  {
    language: "en",
    heading: "Choose a game",
    intro: "Pick what fits the table. New games join the same library as they become ready.",
    navigation: "Games",
  },
  {
    language: "de",
    heading: "Wähle ein Spiel",
    intro:
      "Wähle, was zu eurer Runde passt. Neue Spiele kommen in dieselbe Sammlung, sobald sie bereit sind.",
    navigation: "Spiele",
  },
] satisfies readonly {
  language: SupportedLanguage;
  heading: string;
  intro: string;
  navigation: string;
}[];

beforeEach(() => {
  window.location.hash = "#/";
});

describe("App", () => {
  it.each(languageCases)(
    "renders the $language game selection",
    async ({ language, heading, intro, navigation }) => {
      const i18n = await createGameHubI18n(language);

      render(
        <I18nextProvider i18n={i18n}>
          <App cardLanguage={language} onCardLanguageChange={vi.fn()} />
        </I18nextProvider>,
      );

      expect(screen.getByRole("link", { name: "GameHub" })).toBeVisible();
      expect(screen.getByRole("link", { name: navigation })).toHaveAttribute(
        "aria-current",
        "page",
      );
      expect(screen.getByRole("heading", { name: heading })).toBeVisible();
      expect(screen.getByText(intro)).toBeVisible();
      expect(
        within(screen.getByRole("list", { name: heading })).getAllByRole("listitem"),
      ).toHaveLength(5);
    },
  );

  it("marks unfinished games and opens the Taboo preview", async () => {
    const user = userEvent.setup();
    const i18n = await createGameHubI18n("en");

    render(
      <I18nextProvider i18n={i18n}>
        <App cardLanguage="en" onCardLanguageChange={vi.fn()} />
      </I18nextProvider>,
    );

    expect(screen.getAllByRole("button", { name: "Coming later" })).toHaveLength(4);
    expect(screen.getAllByRole("button", { name: "Coming later" })[0]).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "View progress" }));

    expect(screen.getByRole("heading", { name: "Taboo" })).toBeVisible();
    expect(window.location.hash).toBe("#/games/taboo");

    await user.click(screen.getByRole("button", { name: "Back to all games" }));
    expect(screen.getByRole("heading", { name: "Choose a game" })).toBeVisible();
  });

  it("changes the language and reports the selection", async () => {
    const user = userEvent.setup();
    const i18n = await createGameHubI18n("en");
    const onLanguageChange = vi.fn();

    render(
      <I18nextProvider i18n={i18n}>
        <App cardLanguage="en" onCardLanguageChange={vi.fn()} onLanguageChange={onLanguageChange} />
      </I18nextProvider>,
    );

    await user.selectOptions(screen.getByRole("combobox", { name: "Interface language" }), "de");

    expect(await screen.findByRole("combobox", { name: "Oberflächensprache" })).toHaveValue("de");
    expect(screen.getByRole("heading", { name: "Wähle ein Spiel" })).toBeVisible();
    expect(onLanguageChange).toHaveBeenCalledWith("de");
  });

  it("reports card language changes without changing the UI language", async () => {
    const user = userEvent.setup();
    const i18n = await createGameHubI18n("en");
    const onCardLanguageChange = vi.fn();

    render(
      <I18nextProvider i18n={i18n}>
        <App cardLanguage="de" onCardLanguageChange={onCardLanguageChange} />
      </I18nextProvider>,
    );

    await user.selectOptions(screen.getByRole("combobox", { name: "Card language" }), "en");

    expect(screen.getByRole("combobox", { name: "Interface language" })).toHaveValue("en");
    expect(onCardLanguageChange).toHaveBeenCalledWith("en");
  });
});
