import { useEffect, useRef, type RefObject } from "react";

/**
 * Whether the keyboard focus is nowhere: on the page itself, on something that left the page, or on
 * something in a part of the page that is hidden now (a browser drops the focus there, too).
 */
export function focusIsLost(): boolean {
  const active = document.activeElement;
  return (
    !active ||
    active === document.body ||
    !document.body.contains(active) ||
    active.closest("[hidden]") !== null
  );
}

/**
 * Moves the keyboard focus to a view when it appears, so people who use the keyboard or a screen
 * reader start in the new view and hear its name. Without it the focus is lost when the button that
 * was pressed goes away with the old view, and the next key press starts at the top of the page.
 *
 * Put the returned ref and `tabIndex={-1}` on the element of the view. The focus is only moved when
 * it was lost; somebody who is typing in a field keeps their place. `shown` is for a view that stays
 * in the page and is only hidden: the focus moves when it becomes true.
 */
export function useFocusOnShow<T extends HTMLElement>(shown = true): RefObject<T | null> {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!shown) return;
    if (focusIsLost()) ref.current?.focus({ preventScroll: true });
  }, [shown]);
  return ref;
}
