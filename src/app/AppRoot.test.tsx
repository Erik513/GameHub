import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { gameHubI18n } from "../i18n";
import type { LanguagePreferenceStore } from "../i18n/languagePreference";
import type { GameModule } from "../presentation/gameModule";
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

    await user.click(screen.getByRole("button", { name: "Settings" }));
    await user.click(
      within(screen.getByRole("group", { name: "Interface language" })).getByRole("radio", {
        name: "German",
      }),
    );

    expect(writeLanguage).toHaveBeenCalledWith("de");
  });

  it("persists card language changes from a game independently of the interface language", async () => {
    const user = userEvent.setup();
    const writeCardLanguage = vi.fn();
    const cardLanguagePreferenceStore: LanguagePreferenceStore = {
      read: vi.fn(() => "de"),
      write: writeCardLanguage,
    };
    const example: GameModule = {
      id: "taboo",
      Screen: ({ cardLanguage, onCardLanguageChange }) => (
        <button onClick={() => onCardLanguageChange("en")} type="button">
          Cards in {cardLanguage}
        </button>
      ),
    };
    window.location.hash = "#/games/taboo";

    render(
      <AppRoot
        cardLanguagePreferenceStore={cardLanguagePreferenceStore}
        initialCardLanguage="de"
        modules={[example]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Cards in de" }));

    expect(writeCardLanguage).toHaveBeenCalledWith("en");
    expect(screen.getByRole("button", { name: "Cards in en" })).toBeVisible();
    window.location.hash = "#/";
  });

  it("keeps the page language and the meta description in sync with the interface language", async () => {
    const user = userEvent.setup();
    document.head.querySelector('meta[name="description"]')?.remove();
    render(<AppRoot />);
    expect(document.documentElement.lang).toBe("en");
    const description = () =>
      document.head.querySelector<HTMLMetaElement>('meta[name="description"]')?.content;
    expect(description()).toBe("GameHub – party games in one place");

    await user.click(screen.getByRole("button", { name: "Settings" }));
    await user.click(
      within(screen.getByRole("group", { name: "Interface language" })).getByRole("radio", {
        name: "German",
      }),
    );
    expect(document.documentElement.lang).toBe("de");
    expect(description()).toBe("GameHub – Partyspiele an einem Ort");
    // Only one description element is kept.
    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1);
  });
});
