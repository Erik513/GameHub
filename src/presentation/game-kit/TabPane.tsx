import { useLayoutEffect, useRef, type ReactNode } from "react";

interface TabPaneProps {
  /** The content that scrolls. */
  readonly children: ReactNode;
  /** Controls below the content that never scroll away, for example the main action of the tab. */
  readonly footer?: ReactNode;
  /** Controls above the content that never scroll away, for example a switch or a back button. */
  readonly header?: ReactNode;
  /**
   * The content is a list of equal rows (`li`): the scrolling part is as high as a whole number of rows, so
   * no row is ever cut off at the bottom edge, and scrolling stops at whole rows. The room that is left
   * stays empty below the list.
   */
  readonly wholeRows?: boolean;
}

/**
 * The content of a tab with fixed controls: the header and the footer stay in place, only the
 * content between them scrolls. Scrolling never hides a control.
 */
export function TabPane({ children, footer, header, wholeRows = false }: TabPaneProps) {
  const { body, pane } = useWholeRowsBody(wholeRows);
  useNoScrollbarForRounding(body);

  return (
    <div className="kit-pane" ref={pane}>
      {header && <div className="kit-pane__header">{header}</div>}
      <div className="kit-pane__body" data-whole-rows={wholeRows || undefined} ref={body}>
        {children}
      </div>
      {footer && <div className="kit-pane__footer">{footer}</div>}
    </div>
  );
}

/** At most this much (in pixels) the content may stand over the body without a scrollbar. */
const roundingTolerance = 2;

/**
 * No scrollbar for a content that only stands over by a rounding (a screen scaled to 125 %, a zoom): the body is marked
 * as snug and does not scroll; a content that really does not fit still scrolls.
 */
function useNoScrollbarForRounding(body: { readonly current: HTMLElement | null }) {
  useLayoutEffect(() => {
    const element = body.current;
    if (!element) return;
    function check() {
      if (!element) return;
      element.removeAttribute("data-snug");
      const over = element.scrollHeight - element.clientHeight;
      if (over > 0 && over <= roundingTolerance) element.setAttribute("data-snug", "true");
    }
    check();
    if (typeof ResizeObserver === "undefined") return;
    // The room changes with the window, the content with what it shows.
    const observer = new ResizeObserver(check);
    observer.observe(element);
    for (const child of element.children) observer.observe(child);
    return () => observer.disconnect();
  });
}

/**
 * Makes the body as high as a whole number of rows of its list: it is measured without a limit (what the
 * pane leaves it), then limited to the rows that fit. It is calculated again when the pane is resized
 * and when the number of rows changes. Without a layout (tests) nothing is limited.
 */
function useWholeRowsBody(enabled: boolean) {
  const pane = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const element = body.current;
    const outer = pane.current;
    if (!enabled || !element || !outer) return;

    function fit() {
      if (!element) return;
      element.style.maxHeight = "";
      const list = element.querySelector("ul, ol");
      const first = list?.querySelector("li");
      const room = element.clientHeight;
      const row = first?.getBoundingClientRect().height ?? 0;
      // No layout, no list or no room: nothing to calculate.
      if (!list || row <= 0 || room <= 0) return;
      const gap = Number.parseFloat(getComputedStyle(list).rowGap) || 0;
      const pitch = row + gap;
      const rows = Math.max(1, Math.floor((room + gap) / pitch));
      // A short list needs no limit; a long one is cut at whole rows.
      if (list.children.length > rows) element.style.maxHeight = `${rows * pitch - gap}px`;
    }

    fit();
    // Without a ResizeObserver (tests) the height is calculated once.
    if (typeof ResizeObserver === "undefined") return;
    // The room changes with the window; the number of rows changes with the list (the list is observed, too).
    const observer = new ResizeObserver(fit);
    observer.observe(outer);
    const list = element.querySelector("ul, ol");
    if (list) observer.observe(list);
    return () => observer.disconnect();
  });
  return { body, pane };
}
