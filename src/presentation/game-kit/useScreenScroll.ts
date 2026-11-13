import { useEffect, useLayoutEffect, useRef } from "react";

/**
 * Keeps the scroll position sensible when a game switches between its screens: a screen that is
 * opened starts at the top, and a screen from the `remember` list (usually the setup) is shown at
 * the position where the player left it when they come back to it.
 *
 * Give it a name for the screen that is shown now. The positions are collected while the player
 * scrolls, so they are exact even when the page gets shorter at the moment of the switch.
 */
export function useScreenScroll(screen: string, remember: readonly string[] = []) {
  const positions = useRef(new Map<string, number>());
  const current = useRef(screen);
  const remembered = useRef(remember);

  useEffect(() => {
    remembered.current = remember;
  }, [remember]);

  useEffect(() => {
    const onScroll = () => positions.current.set(current.current, window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useLayoutEffect(() => {
    if (current.current === screen) return;
    current.current = screen;
    const saved = remembered.current.includes(screen) ? positions.current.get(screen) : undefined;
    window.scrollTo(0, saved ?? 0);
  }, [screen]);
}
