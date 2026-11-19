import { useEffect, type RefObject } from "react";

/**
 * Notifications stand right above the start bar, so they never hide its button. While a bar is on the
 * screen it tells the notification stack how high its top edge is above the bottom of the screen
 * (the custom property `--toast-lift`); without a bar the stack stays at the bottom edge.
 */
export function useToastLift(bar: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = bar.current;
    if (!element) return;
    const root = document.documentElement;
    const update = () => {
      const top = element.getBoundingClientRect().top;
      // Without a layout (for example in a test) there is nothing to measure.
      if (top > 0)
        root.style.setProperty("--toast-lift", `${Math.round(window.innerHeight - top)}px`);
    };
    update();
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(update);
    observer?.observe(element);
    window.addEventListener("resize", update);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", update);
      root.style.removeProperty("--toast-lift");
    };
  }, [bar]);
}
