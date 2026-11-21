import { useCallback } from "react";
import {
  parseSavedWerewolfSession,
  serializeWerewolfSession,
  startWerewolfGame,
  type StartWerewolfGameInput,
} from "../../business/games/werewolf/narratorGame";
import {
  advanceWerewolfSession,
  undoWerewolfSession,
  type WerewolfSession,
} from "../../business/games/werewolf/session";
import type { WerewolfEvent } from "../../business/games/werewolf/stateMachine";
import { usePersistentState } from "../game-kit";

/**
 * The running game of the narrator. It is saved after every step, so the game continues after a reload; a game saved
 * by another version of the app is dropped (see `savedSessionVersion`). The UI only sends events and asks for an undo;
 * every rule lives in the game logic.
 */
export function useWerewolfSession() {
  const [saved, setSaved] = usePersistentState<ReturnType<typeof serializeWerewolfSession> | null>(
    "werewolf.game",
    () => null,
    (raw) => {
      const session = parseSavedWerewolfSession(raw);
      return session ? serializeWerewolfSession(session) : undefined;
    },
  );
  const session: WerewolfSession | null = saved ? saved.session : null;

  /** Deals the roles and starts the game; false when the setup cannot be played. */
  const start = useCallback(
    (input: StartWerewolfGameInput) => {
      const next = startWerewolfGame(input);
      if (!next) return false;
      setSaved(serializeWerewolfSession(next));
      return true;
    },
    [setSaved],
  );
  const advance = useCallback(
    (event: WerewolfEvent) =>
      setSaved((current) =>
        current
          ? serializeWerewolfSession(advanceWerewolfSession(current.session, event))
          : current,
      ),
    [setSaved],
  );
  /** One step back; some steps (the morning, an exile) need `confirmed`. Returns the reason when it did not work. */
  const undo = useCallback(
    (confirmed = false) => {
      if (!saved) return "emptyHistory" as const;
      const result = undoWerewolfSession(saved.session, confirmed);
      if (!result.ok) return result.reason;
      setSaved(serializeWerewolfSession(result.session));
      return null;
    },
    [saved, setSaved],
  );
  const end = useCallback(() => setSaved(null), [setSaved]);
  return { advance, end, session, start, undo };
}
