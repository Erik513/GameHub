import { useSyncExternalStore } from "react";

/**
 * The PC layout starts at a window width of 64 rem (1024 px); below that the phone layout stays, also
 * on tablets. The style sheets use the same number in their `@media (min-width: 64rem)` rules.
 */
export const desktopMediaQuery = "(min-width: 64rem)";

function subscribe(onChange: () => void): () => void {
  if (typeof window.matchMedia !== "function") return () => undefined;
  const query = window.matchMedia(desktopMediaQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function readDesktop(): boolean {
  return typeof window.matchMedia === "function" && window.matchMedia(desktopMediaQuery).matches;
}

/**
 * Whether the window is wide enough for the PC layout, kept up to date when the window is resized.
 * Use it where the structure of a screen differs (two areas at once instead of two views one after
 * the other); everything that only changes sizes and places belongs into the style sheet.
 */
export function useIsDesktop(): boolean {
  return useSyncExternalStore(subscribe, readDesktop, () => false);
}
