import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { describe, expect, it, vi } from "vitest";
import { createGameHubI18n, type SupportedLanguage } from "../i18n";
import { App } from "./App";

const languageCases = [
  {
    language: "en",
    eyebrow: "Project foundation",
    intro: "One place for party, card, quiz, and social games.",
    listName: "Architecture layers",
    layers: ["Presentation", "Business", "Data", "Infrastructure"],
  },
  {
    language: "de",
    eyebrow: "Projektgrundlage",
    intro: "Ein Ort für Party-, Karten-, Quiz- und Gesellschaftsspiele.",
    listName: "Architekturschichten",
    layers: ["Darstellung", "Geschäftslogik", "Daten", "Infrastruktur"],
  },
] satisfies readonly {
  language: SupportedLanguage;
  eyebrow: string;
  intro: string;
  listName: string;
  layers: readonly string[];
}[];

describe("App", () => {
  it.each(languageCases)(
    "renders the $language GameHub foundation screen",
    async ({ language, eyebrow, intro, listName, layers }) => {
      const i18n = await createGameHubI18n(language);

      render(
        <I18nextProvider i18n={i18n}>
          <App cardLanguage={language} onCardLanguageChange={vi.fn()} />
        </I18nextProvider>,
      );

      expect(screen.getByText(eyebrow)).toBeVisible();
      expect(screen.getByRole("heading", { name: "GameHub" })).toBeVisible();
      expect(screen.getByText(intro)).toBeVisible();

      const architectureLayers = within(screen.getByRole("list", { name: listName }));

      for (const layer of layers) {
        expect(architectureLayers.getByText(layer)).toBeVisible();
      }
    },
  );

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
