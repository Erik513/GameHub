import { useEffect, useRef } from "react";

/** The marker of the history entry that catches the Back key. */
interface GuardState {
  readonly gamehubGuard: true;
}

const guardState: GuardState = { gamehubGuard: true };

/** How many guards are switched on right now. */
let guards = 0;

function guardOnTop(): boolean {
  const state: unknown = window.history.state;
  return typeof state === "object" && state !== null && "gamehubGuard" in state;
}

/**
 * Catches the Back key of the system (the Android Back key, the browser's Back button) while a game
 * is going on, so a tap on it does not throw the game away. While `active`, an extra history entry
 * stands on top. Back only removes this entry, which is put back at once, and `onBack` is called
 * instead of leaving the page.
 *
 * When the guard is switched off the entry is removed again, so a single Back leaves the game. That
 * happens one moment later and only if the entry is still on top and no new guard has started: a
 * guard that is switched off and on again at once (React runs effects twice in development) keeps its
 * entry, and a page that has already moved on is left alone.
 */
export function useSystemBack(active: boolean, onBack: () => void) {
  const latest = useRef(onBack);

  useEffect(() => {
    latest.current = onBack;
  });

  useEffect(() => {
    if (!active) return;
    if (!guardOnTop()) window.history.pushState(guardState, "");
    guards += 1;
    function caught() {
      // A late event of an earlier navigation (for example the one that opened the game) finds the
      // guard entry still in place: that is no Back.
      if (guardOnTop()) return;
      // Back took the guard entry away: put it back, then do what Back means in the game.
      window.history.pushState(guardState, "");
      latest.current();
    }
    window.addEventListener("popstate", caught);
    return () => {
      window.removeEventListener("popstate", caught);
      guards -= 1;
      setTimeout(() => {
        if (guards !== 0 || !guardOnTop()) return;
        // The Back of our own removal arrives a moment later; no guard may take it for a real Back.
        window.addEventListener("popstate", (event) => event.stopImmediatePropagation(), {
          once: true,
        });
        window.history.back();
      }, 0);
    };
  }, [active]);
}
