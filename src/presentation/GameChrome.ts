import { createContext, useContext, useEffect, useRef } from "react";

export interface GamePauseControl {
  readonly paused: boolean;
  readonly toggle: () => void;
}

export interface GameExit {
  readonly run: () => void;
  readonly pause?: GamePauseControl;
}

type RegisterGameExit = (exit: GameExit | undefined) => void;

export const GameChromeContext = createContext<RegisterGameExit>(() => undefined);

interface PauseOptions {
  readonly paused: boolean;
  readonly onToggle: () => void;
}

/**
 * Lets a game tell the app shell that a game is in progress. While active, the shell hides the
 * hub navigation and settings and offers an "end game" action that returns to the game's main
 * window. A game can additionally expose a pause control (for example during a timed round).
 */
export function useGameExit(active: boolean, onExit: () => void, pause?: PauseOptions) {
  const register = useContext(GameChromeContext);
  const latestExit = useRef(onExit);
  const latestToggle = useRef(pause?.onToggle);
  const hasPause = pause !== undefined;
  const paused = pause?.paused ?? false;

  useEffect(() => {
    latestExit.current = onExit;
    latestToggle.current = pause?.onToggle;
  });

  useEffect(() => {
    if (!active) return;
    register({
      run: () => latestExit.current(),
      ...(hasPause ? { pause: { paused, toggle: () => latestToggle.current?.() } } : {}),
    });
    return () => register(undefined);
  }, [active, hasPause, paused, register]);
}
