import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Page } from "@playwright/test";

/** The properties that decide what an element looks like; a change in any of them is a visible change. */
const properties = [
  "display",
  "position",
  "visibility",
  "opacity",
  "overflow-x",
  "overflow-y",
  "z-index",
  "box-sizing",
  "flex-direction",
  "flex-wrap",
  "flex-grow",
  "flex-shrink",
  "flex-basis",
  "align-items",
  "align-self",
  "align-content",
  "justify-content",
  "justify-items",
  "justify-self",
  "grid-template-columns",
  "grid-template-rows",
  "grid-area",
  "grid-column-start",
  "grid-column-end",
  "grid-row-start",
  "grid-row-end",
  "row-gap",
  "column-gap",
  "order",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "border-top-width",
  "border-right-width",
  "border-bottom-width",
  "border-left-width",
  "border-top-style",
  "border-right-style",
  "border-bottom-style",
  "border-left-style",
  "border-top-color",
  "border-right-color",
  "border-bottom-color",
  "border-left-color",
  "border-top-left-radius",
  "border-top-right-radius",
  "border-bottom-left-radius",
  "border-bottom-right-radius",
  "background-color",
  "background-image",
  "box-shadow",
  "color",
  "font-family",
  "font-size",
  "font-weight",
  "font-variant-numeric",
  "line-height",
  "letter-spacing",
  "text-align",
  "text-transform",
  "text-decoration-line",
  "text-overflow",
  "white-space",
  "overflow-wrap",
  "cursor",
  "transform",
  "transition-duration",
  "animation-name",
  "scroll-snap-align",
  "scroll-snap-type",
  "pointer-events",
  "user-select",
  "content",
  "min-height",
  "max-height",
  "min-width",
  "max-width",
] as const;

/**
 * Writes the computed style and the box of every element of the page to a file, when the environment
 * variable `STYLE_SNAPSHOT_DIR` is set. Two runs (before and after a change of the style sheets) are
 * compared with `scripts/compare-style-snapshots.mjs`; any difference is a visible change.
 */
export async function snapshotStyles(page: Page, screen: string): Promise<void> {
  const { STYLE_SNAPSHOT_DIR: directory } = process.env;
  if (!directory) return;
  // The clock of the page stands still while it is read, so timers do not change the page.
  let paused = false;
  try {
    const now = await page.evaluate(() => Date.now());
    await page.clock.pauseAt(now + 20);
    paused = true;
  } catch {
    // The page has no fake clock; it is read as it is.
  }
  const read = () =>
    page.evaluate((names) => {
      const result: string[] = [];
      const pathOf = (element: Element): string => {
        const parts: string[] = [];
        for (let node: Element | null = element; node && node !== document.documentElement;) {
          const parent: Element | null = node.parentElement;
          const index = parent ? Array.prototype.indexOf.call(parent.children, node) : 0;
          parts.unshift(`${node.tagName.toLowerCase()}[${index}]`);
          node = parent;
        }
        return parts.join(">");
      };
      for (const element of document.body.querySelectorAll("*")) {
        if (["SCRIPT", "STYLE"].includes(element.tagName)) continue;
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        const round = (text: string) =>
          text.replace(/-?\d+\.\d+/g, (number) => String(Number(Number(number).toFixed(2))));
        // The bar of the time moves a little with every reading; two decimals are enough.
        const values = names
          .map((name) =>
            name === "transform"
              ? round(style.getPropertyValue(name))
              : style.getPropertyValue(name),
          )
          .join("|");
        // The bars (of the time and of the results) grow while they are read; their width is not a style.
        const box = element.matches(".kit-hud__bar > span, .kit-scoreboard__bar")
          ? "bar"
          : [rect.x, rect.y, rect.width, rect.height].map((n) => n.toFixed(1)).join(",");
        const classes = typeof element.className === "string" ? element.className : "";
        result.push(`${pathOf(element)} .${classes.replace(/\s+/g, ".")} ${box} ${values}`);
      }
      return result;
    }, properties);
  // Animations and late layout change the page for a moment: take the reading when two in a row agree.
  let rows = await read();
  for (let attempt = 0; attempt < 12; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const next = await read();
    const same = next.length === rows.length && next.every((row, index) => row === rows[index]);
    rows = next;
    if (same) break;
  }
  if (paused) await page.clock.resume();
  mkdirSync(directory, { recursive: true });
  // The same screen is checked at several sizes and in both languages, each gets its own file.
  const size = page.viewportSize();
  const language = await page.evaluate(() => document.documentElement.lang);
  const name = `${size?.width ?? 0}x${size?.height ?? 0}_${language}_${screen}`.replace(
    /[^a-zA-Z0-9]+/g,
    "_",
  );
  writeFileSync(join(directory, `${name}.json`), JSON.stringify(rows));
}
