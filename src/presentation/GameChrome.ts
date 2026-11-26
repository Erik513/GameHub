import { createContext, useContext, useEffect, useRef } from "react";

export interface GamePauseControl {
  readonly paused: boolean;
  readonly toggle: () => void;
}

export interface GameExit {
  /** A plain back button without confirmation, for a sub page inside a game. */
  readonly back?: boolean;
  /** Only the Back key of the system goes back; the header stays as it is (with the rules of the game, for example). */
  readonly headerUnchanged?: boolean;
  readonly run: () => void;
  readonly pause?: GamePauseControl;
  /** Where the game stands, for the bar of the running game (the round …); without it the name of the game. */
  readonly status?: string;
  /** The game shows its own bar (made of the same block): the app shows no header while it runs. */
  readonly ownBar?: boolean;
}

/**
 * Registers a game action for the header. Several can be active at once (the settings of a game and
 * its card library above them): the last one counts, and when it is removed (`remove`) the one below
 * counts again. Without `remove`, `undefined` clears all.
 */
type RegisterGameExit = (exit: GameExit | undefined, remove?: GameExit) => void;

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
export function useGameExit(
  active: boolean,
  onExit: () => void,
  pause?: PauseOptions,
  options: { readonly status?: string; readonly ownBar?: boolean } = {},
) {
  const register = useContext(GameChromeContext);
  const latestExit = useRef(onExit);
  const latestToggle = useRef(pause?.onToggle);
  const hasPause = pause !== undefined;
  const paused = pause?.paused ?? false;
  const { status, ownBar = false } = options;

  useEffect(() => {
    latestExit.current = onExit;
    latestToggle.current = pause?.onToggle;
  });

  useEffect(() => {
    if (!active) return;
    const entry: GameExit = {
      run: () => latestExit.current(),
      ...(hasPause ? { pause: { paused, toggle: () => latestToggle.current?.() } } : {}),
      ...(status === undefined ? {} : { status }),
      ...(ownBar ? { ownBar: true } : {}),
    };
    register(entry);
    return () => register(undefined, entry);
  }, [active, hasPause, ownBar, paused, register, status]);
}

/**
 * Lets a game show a sub page (for example its card library). While active, the shell hides the
 * hub navigation and settings and shows one back button that calls `onBack` directly.
 */
export function useGameBack(
  active: boolean,
  onBack: () => void,
  options: { readonly headerUnchanged?: boolean } = {},
) {
  const register = useContext(GameChromeContext);
  const latestBack = useRef(onBack);
  const headerUnchanged = options.headerUnchanged === true;

  useEffect(() => {
    latestBack.current = onBack;
  });

  useEffect(() => {
    if (!active) return;
    const entry: GameExit = {
      back: true,
      run: () => latestBack.current(),
      ...(headerUnchanged ? { headerUnchanged: true } : {}),
    };
    register(entry);
    return () => register(undefined, entry);
  }, [active, headerUnchanged, register]);
}

/** What a game offers for the "Rules" button in the header of its main menu. */
export interface GameRulesAction {
  readonly open: () => void;
}

type RegisterGameRules = (action: GameRulesAction | undefined) => void;

export const GameRulesContext = createContext<RegisterGameRules>(() => undefined);

/**
 * Lets a game put a "Rules" button into the header of its main menu, in the place of the button
 * "Players" of the GameHub. While `active`, the button calls `onOpen`; the game shows the rules.
 */
export function useGameRulesButton(active: boolean, onOpen: () => void) {
  const register = useContext(GameRulesContext);
  const latestOpen = useRef(onOpen);

  useEffect(() => {
    latestOpen.current = onOpen;
  });

  useEffect(() => {
    if (!active) return;
    register({ open: () => latestOpen.current() });
    return () => register(undefined);
  }, [active, register]);
}
