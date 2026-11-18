import { useLayoutEffect, useState, type RefObject } from "react";

/**
 * The height for a scrolling list in a window so that no row is ever cut off at the bottom edge: the
 * height of all its rows, and when the window would then be taller than the screen allows, of as many
 * whole rows as fit. The list sets it as its style `height`. Scrolling stops at whole rows (the style
 * snaps), so the last rows are whole at the end of the list, too.
 *
 * `scroll` is the element that scrolls and holds the list (`ul`) with the rows (`li`). The height is
 * calculated when the window opens, when the number of rows changes (`rows`) and when the screen is
 * resized. Without a layout (tests) there is no height and the style keeps its own.
 */
export function useWholeRows(
  scroll: RefObject<HTMLElement | null>,
  rows: number,
  open: boolean,
  /**
   * Shows always this many rows (as far as the screen allows), also with fewer or more players, so a
   * window with several views keeps its size. 0 shows as many rows as there are.
   */
  fixedRows = 0,
  /** Another value that changes what is shown (for example the chosen tab); the height is calculated again. */
  refreshKey = "",
): number | undefined {
  const [height, setHeight] = useState<number>();

  useLayoutEffect(() => {
    const element = scroll.current;
    if (!open || !element) return;

    function fit() {
      const dialog = element?.closest<HTMLElement>(".dialog");
      const list = element?.querySelector("ul");
      const first = list?.querySelector("li");
      if (!element || !dialog || !list || !first) return setHeight(undefined);
      const row = first.getBoundingClientRect().height;
      // No layout (for example in a test): nothing to calculate.
      if (row <= 0) return setHeight(undefined);
      const gap = Number.parseFloat(getComputedStyle(list).rowGap) || 0;
      const pitch = row + gap;
      const count = fixedRows > 0 ? fixedRows : list.children.length;
      // What the window needs besides the list (its content may already be cut off by the limit of the
      // window, so the height of the content is what it wants, not what it got), and what the screen
      // allows for the list.
      const content = dialog.querySelector<HTMLElement>(".dialog__content");
      const chrome = dialog.getBoundingClientRect().height - (content?.clientHeight ?? 0);
      const wanted = chrome + (content?.scrollHeight ?? 0);
      const others = wanted - element.getBoundingClientRect().height;
      const limit = Number.parseFloat(getComputedStyle(dialog).maxHeight);
      const room = Number.isFinite(limit) ? limit - others : Number.POSITIVE_INFINITY;
      const fitting = Math.max(1, Math.min(count, Math.floor((room + gap) / pitch)));
      setHeight(fitting * pitch - gap);
    }

    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [fixedRows, open, refreshKey, rows, scroll]);

  return height;
}
