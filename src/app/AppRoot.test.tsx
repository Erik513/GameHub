import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { gameHubI18n } from "../i18n";
import type { LanguagePreferenceStore } from "../i18n/languagePreference";
import { AppRoot } from "./AppRoot";

describe("AppRoot", () => {
  beforeEach(async () => {
    await gameHubI18n.changeLanguage("en");
  });

  it("composes the GameHub presentation", () => {
    render(<AppRoot />);

    expect(screen.getByRole("heading", { name: "Choose a game" })).toBeVisible();
  });

  it("persists language changes through the configured store", async () => {
    const user = userEvent.setup();
    const writeLanguage = vi.fn();
    const languagePreferenceStore: LanguagePreferenceStore = {
      read: vi.fn(() => null),
      write: writeLanguage,
    };

    render(<AppRoot languagePreferenceStore={languagePreferenceStore} />);

    await user.selectOptions(screen.getByRole("combobox", { name: "Interface language" }), "de");

    expect(writeLanguage).toHaveBeenCalledWith("de");
  });

  it("persists card language changes independently", async () => {
    const user = userEvent.setup();
    const writeCardLanguage = vi.fn();
    const cardLanguagePreferenceStore: LanguagePreferenceStore = {
      read: vi.fn(() => "de"),
      write: writeCardLanguage,
    };

    render(
      <AppRoot
        cardLanguagePreferenceStore={cardLanguagePreferenceStore}
        initialCardLanguage="de"
      />,
    );

    await user.selectOptions(screen.getByRole("combobox", { name: "Card language" }), "en");

    expect(writeCardLanguage).toHaveBeenCalledWith("en");
    expect(screen.getByRole("combobox", { name: "Interface language" })).toHaveValue("en");
  });
});
