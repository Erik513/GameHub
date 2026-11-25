import { useEffect, useLayoutEffect, useState, type RefObject } from "react";

/**
 * The height of a scrolling grid that shows whole rows only: as many rows (with the gaps between them and the
 * padding of the list) as fit into the room the list has. At least one row.
 */
export function wholeRowsHeight({
  room,
  row,
  gap,
  padding,
}: {
  readonly room: number;
  readonly row: number;
  readonly gap: number;
  readonly padding: number;
}): number {
  const pitch = row + gap;
  const fitting = Math.max(1, Math.floor((room - padding + gap) / pitch));
  return padding + fitting * pitch - gap;
}

/**
 * A list in columns (a grid of equally high rows) that scrolls in a window shows whole rows only: when it does not
 * fit, its height is cut down to the whole rows that fit into its room, so no row is cut off at the bottom edge. The
 * style lets the scrolling stop at whole rows. `list` is the element that scrolls and `rows` the number of its entries;
 * the list sets the returned height as its style (undefined: its own height). The height is calculated again when the
 * number of entries changes and when the screen is resized. Without a layout (tests) there is no height.
 */
export function useWholeGridRows(
  list: RefObject<HTMLElement | null>,
  rows: number,
): number | undefined {
  // The height that was calculated, with the number of entries and the resize it belongs to (null: the list fits).
  const [fit, setFit] = useState<{ readonly key: string; readonly height: number | null }>();
  const [resized, setResized] = useState(0);
  const key = `${rows}:${resized}`;
  const current = fit?.key === key ? fit.height : undefined;

  useEffect(() => {
    const onResize = () => setResized((count) => count + 1);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useLayoutEffect(() => {
    if (fit?.key === key) return;
    function measure() {
      // The list has no height of its own now: its height is the room the layout gives it.
      const element = list.current;
      const row = element?.firstElementChild?.getBoundingClientRect().height ?? 0;
      if (!element || row <= 0) return setFit({ key, height: null });
      if (element.scrollHeight <= element.clientHeight) return setFit({ key, height: null });
      const style = getComputedStyle(element);
      setFit({
        key,
        height: wholeRowsHeight({
          room: element.clientHeight,
          row,
          gap: Number.parseFloat(style.rowGap) || 0,
          padding:
            (Number.parseFloat(style.paddingTop) || 0) +
            (Number.parseFloat(style.paddingBottom) || 0),
        }),
      });
    }
    measure();
  }, [fit, key, list]);

  return current ?? undefined;
}
