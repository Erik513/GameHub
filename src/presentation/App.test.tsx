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
          <App />
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
        <App onLanguageChange={onLanguageChange} />
      </I18nextProvider>,
    );

    await user.selectOptions(screen.getByRole("combobox", { name: "Language" }), "de");

    expect(await screen.findByRole("combobox", { name: "Sprache" })).toHaveValue("de");
    expect(onLanguageChange).toHaveBeenCalledWith("de");
  });
});
