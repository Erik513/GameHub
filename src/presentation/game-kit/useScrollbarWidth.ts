import { useLayoutEffect, useState, type RefObject } from "react";

/**
 * The width the scrollbar of a scrolling list takes (the place `scrollbar-gutter: stable` keeps for
 * it): 0 where scrollbars lie over the content (a touch screen), the width of the system bar elsewhere.
 * The lists of the windows shift their content by exactly this width, so their rows end at the same edge
 * as the buttons above them on every system. Measured when the window opens and when `refreshKey` changes.
 */
export function useScrollbarWidth(
  scroll: RefObject<HTMLElement | null>,
  open: boolean,
  refreshKey = "",
): number | undefined {
  const [width, setWidth] = useState<number>();

  useLayoutEffect(() => {
    const element = scroll.current;
    if (!open || !element) return;
    function measure() {
      if (element) setWidth(Math.max(0, element.offsetWidth - element.clientWidth));
    }
    measure();
  }, [open, refreshKey, scroll]);

  return width;
}
