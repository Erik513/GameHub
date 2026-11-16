import { act, fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { tabooStandardCards } from "../data/tabooStandardCards";
import { createGameHubI18n, type SupportedLanguage } from "../i18n";
import { common as germanCommon } from "../i18n/resources/de/common";
import { common as englishCommon } from "../i18n/resources/en/common";
import { App } from "./App";
import { createTabooModule } from "./taboo/tabooModule";

type Leaf = Record<string, unknown>;

function leaves(resource: Leaf, prefix = ""): Map<string, string> {
  const result = new Map<string, string>();
  for (const [key, value] of Object.entries(resource)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") result.set(path, value);
    else if (value && typeof value === "object") {
      for (const [nested, text] of leaves(value as Leaf, path)) result.set(nested, text);
    }
  }
  return result;
}

const german = leaves(germanCommon);
const english = leaves(englishCommon);

/** Texts that exist in only one language: they must never show up in the other one. */
function foreignTexts(language: SupportedLanguage): Set<string> {
  const own = language === "de" ? german : english;
  const other = language === "de" ? english : german;
  const foreign = new Set<string>();
  for (const [key, text] of other) {
    // Strings with placeholders appear with filled-in values, so only plain texts are compared.
    if (text.includes("{{") || text.length < 4) continue;
    // A word that both languages use (like "Standard") is not foreign, even under another key.
    if (own.get(key) !== text && ![...own.values()].includes(text)) foreign.add(text);
  }
  return foreign;
}

/** Every visible text and accessible label currently in the document. */
function visibleStrings(): string[] {
  const strings: string[] = [];
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
  );
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) strings.push(text);
    } else {
      const element = node as Element;
      for (const attribute of ["aria-label", "title", "placeholder"]) {
        const value = element.getAttribute(attribute);
        if (value) strings.push(value);
      }
    }
  }
  return strings;
}

const keyLike = /^[a-z][A-Za-z]*(\.[A-Za-z0-9]+)+$/;

beforeEach(() => {
  window.location.hash = "";
  vi.useFakeTimers();
  vi.spyOn(Math, "random").mockReturnValue(0.99);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe.each(["de", "en"] as const)("every Taboo screen in %s", (language) => {
  it("uses only texts of the selected interface language and never shows a raw key", async () => {
    const i18n = await createGameHubI18n(language);
    const missing: string[] = [];
    i18n.options.saveMissing = true;
    i18n.options.missingKeyHandler = (_languages, _namespace, key) => {
      missing.push(key);
    };
    const translate = i18n.t.bind(i18n) as unknown as (key: string) => string;
    const t = (key: string): string => translate(key);
    const foreign = foreignTexts(language);
    const checked: string[] = [];

    function checkScreen(label: string) {
      checked.push(label);
      for (const text of visibleStrings()) {
        expect(keyLike.test(text), `${language} ${label}: raw key "${text}"`).toBe(false);
        expect(foreign.has(text), `${language} ${label}: foreign text "${text}"`).toBe(false);
      }
    }

    const press = (key: string) => fireEvent.click(screen.getByRole("button", { name: t(key) }));
    const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));

    render(
      <I18nextProvider i18n={i18n}>
        <App
          cardLanguage={language}
          onCardLanguageChange={vi.fn()}
          modules={[createTabooModule({ cards: tabooStandardCards })]}
        />
      </I18nextProvider>,
    );
    checkScreen("game selection");
    fireEvent.click(screen.getByRole("button", { name: t("gameSelection.action.preview") }));

    // Settings are reachable from the main window of the game.
    press("settings.open");
    checkScreen("settings");
    press("settings.close");

    // Open the folded options so the whole setup is checked.
    checkScreen("setup");
    // An info dialog explains a setting and uses the selected language too.
    fireEvent.click(
      screen.getByRole("button", {
        name: new RegExp(`^(Info zu|Info about) ${t("tabooSetup.skips")}`),
      }),
    );
    checkScreen("info dialog");
    press("settings.close");
    press("tabooSetup.start");
    checkScreen("line-up");
    press("tabooLineup.start");
    checkScreen("round overview before the first turn");

    // First turn: a wrong and a skipped card (no points), pause and end the round early.
    press("tabooRound.start");
    checkScreen("running round");
    fireEvent.click(screen.getByRole("button", { name: t("tabooRound.forbiddenWord") }));
    fireEvent.click(screen.getByRole("button", { name: t("tabooRound.skipped") }));
    press("navigation.pause");
    checkScreen("paused round");
    fireEvent.click(screen.getAllByRole("button", { name: t("navigation.resume") })[0]!);
    press("navigation.pause");
    press("tabooRound.endRound");
    checkScreen("round review");

    // The other five turns of a short game run out of time without points.
    for (let turn = 0; turn < 5; turn += 1) {
      press("tabooRound.start");
      advance(60000);
    }
    press("tabooResult.show");
    checkScreen("tiebreak overview");
    press("tabooTiebreak.start");
    checkScreen("tiebreak attempt");
    press("navigation.pause");
    checkScreen("paused tiebreak attempt");
    fireEvent.click(screen.getAllByRole("button", { name: t("navigation.resume") })[0]!);
    for (let card = 0; card < 3; card += 1) {
      advance(1000);
      press("tabooRound.correct");
    }
    checkScreen("tiebreak overview with a result");
    press("tabooTiebreak.start");
    press("navigation.pause");
    press("tabooTiebreak.endAttempt");
    checkScreen("final result");

    expect(missing).toEqual([]);
    expect(checked).toHaveLength(14);
  });
});
