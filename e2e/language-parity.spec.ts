import { expect, test, type Page } from "@playwright/test";
import { labels } from "./layoutLabels";
import { closeSettings, openSettings } from "./setupSteps";

/**
 * Every control looks the same and is equally big in English and in German: the same width and height,
 * although the names differ in length. The test visits the same screens in both languages and compares
 * the size of every control, by its place in the page.
 */

type Sizes = Record<string, string>;

/** The size of every visible control, by its place in the page (the names of the controls differ). */
async function controlSizes(page: Page): Promise<Sizes> {
  return page.evaluate(() => {
    const sizes: Record<string, string> = {};
    const pathOf = (element: Element): string => {
      const parts: string[] = [];
      for (let node: Element | null = element; node && node !== document.body;) {
        const parent: Element | null = node.parentElement;
        const index = parent ? Array.prototype.indexOf.call(parent.children, node) : 0;
        parts.unshift(`${node.tagName.toLowerCase()}[${index}]`);
        node = parent;
      }
      return parts.join(">");
    };
    const selector =
      "button, select, input:not([type=checkbox]):not([type=radio]), label.kit-choice, [role=tab]";
    for (const element of document.querySelectorAll(selector)) {
      // A title that opens an explanation is text, not a box (its length is the length of its words).
      if (element.matches(".kit-heading-legend__title")) continue;
      const rect = element.getBoundingClientRect();
      if (rect.width <= 2 || rect.height <= 2) continue;
      const style = getComputedStyle(element);
      if (style.visibility === "hidden" || style.display === "none") continue;
      sizes[`${pathOf(element)} ${element.className}`] =
        `${Math.round(rect.width)}x${Math.round(rect.height)}`;
    }
    return sizes;
  });
}

const names = {
  en: {
    back: /^Back to the groups/,
    close: "Close",
    group: /^Family/,
    playerList: "Player list",
  },
  de: {
    back: /^Zurück zu den Gruppen/,
    close: "Schließen",
    group: /^Family/,
    playerList: "Spielerliste",
  },
} as const;

/** Visits the screens in one language and returns the control sizes of each. */
async function visit(page: Page, language: "en" | "de"): Promise<Map<string, Sizes>> {
  const t = labels[language];
  const n = names[language];
  const screens = new Map<string, Sizes>();
  const take = async (screen: string) => {
    screens.set(screen, await controlSizes(page));
  };
  await page.addInitScript(() => {
    window.localStorage.setItem("gamehub.players", JSON.stringify(["Anna", "Ben", "Cara"]));
    window.localStorage.setItem(
      "gamehub.playerGroups",
      JSON.stringify([{ name: "Family", members: ["Anna", "Ben", "Cara"] }]),
    );
  });
  await page.goto("/");
  if (language === "de") {
    await page.getByRole("button", { name: labels.en.settings, exact: true }).click();
    await page
      .getByRole("group", { name: labels.en.interfaceLanguage })
      .getByRole("radio", { name: "German" })
      .check({ force: true });
    await page.getByRole("dialog").getByRole("button", { name: labels.de.close }).click();
  }
  await take("game selection");

  // The player list: the groups, a group, and the settings window.
  await page.getByRole("button", { name: n.playerList, exact: true }).click();
  await take("player list: groups");
  await page.getByRole("button", { name: n.group }).click();
  await take("player list: a group");
  await page.getByRole("button", { name: n.back }).click();
  await page.getByRole("button", { name: n.close, exact: true }).click();

  await page.getByRole("button", { name: t.open, exact: true }).first().click();
  await take("line-up");
  await openSettings(page, t.settingsTab);
  await take("settings");
  await page.getByRole("tab", { name: t.categories, exact: true }).click();
  await take("categories");
  await closeSettings(page, t.done);
  return screens;
}

test("every control is equally big in English and in German", async ({ page }) => {
  const english = await visit(page, "en");
  // A new page for the second language: nothing of the first is left (storage, language).
  await page.context().clearCookies();
  await page.evaluate(() => window.localStorage.clear());
  await page.goto("about:blank");
  const german = await visit(page, "de");

  const differences: string[] = [];
  for (const [screen, sizes] of english) {
    const other = german.get(screen) ?? {};
    for (const [place, size] of Object.entries(sizes)) {
      const match = other[place];
      if (match === undefined) continue;
      const [w1, h1] = size.split("x").map(Number) as [number, number];
      const [w2, h2] = match.split("x").map(Number) as [number, number];
      if (Math.abs(w1 - w2) > 1 || Math.abs(h1 - h2) > 1) {
        differences.push(`${screen}: ${place.slice(-60)} en ${size} de ${match}`);
      }
    }
  }
  expect(differences, differences.join("\n")).toEqual([]);
});
