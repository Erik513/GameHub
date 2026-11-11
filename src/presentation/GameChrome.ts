import { createContext, useContext, useEffect, useRef } from "react";

export interface GameExit {
  readonly run: () => void;
}

type RegisterGameExit = (exit: GameExit | undefined) => void;

export const GameChromeContext = createContext<RegisterGameExit>(() => undefined);

/**
 * Lets a game tell the app shell that a game is in progress. While active, the shell hides the
 * hub navigation and settings and offers a single "end game" action that returns to the game's
 * main window (after confirmation).
 */
export function useGameExit(active: boolean, onExit: () => void) {
  const register = useContext(GameChromeContext);
  const latest = useRef(onExit);

  useEffect(() => {
    latest.current = onExit;
  });

  useEffect(() => {
    if (!active) return;
    register({ run: () => latest.current() });
    return () => register(undefined);
  }, [active, register]);
}
