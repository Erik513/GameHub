import { createFixedWerewolf } from "./fixedSetup";
import { fixedConfigurationSettings, type FixedDraft } from "./fixedConfiguration";
import type { WerewolfLineup } from "./lineup";
import { createWerewolfSession, type WerewolfSession } from "./session";
import type { WerewolfState } from "./stateMachine";
import { variableSelectionOf, type VariableDraft } from "./variableConfiguration";
import { createVariableWerewolf } from "./variableSetup";

export type WerewolfRolesMode = "fixed" | "variable";

export interface StartWerewolfGameInput {
  readonly lineup: WerewolfLineup;
  readonly mode: WerewolfRolesMode;
  readonly fixedDraft: FixedDraft;
  readonly variableDraft: VariableDraft;
  readonly random: () => number;
}

/**
 * Starts one private game from the line-up and the configuration of the chosen mode: the roles are dealt once here
 * (fixed roles or the draw of the variable mode) and never again. Returns null when the setup cannot be played.
 */
export function startWerewolfGame(input: StartWerewolfGameInput): WerewolfSession | null {
  const { lineup, mode, fixedDraft, variableDraft, random } = input;
  if (!lineup.narrator) return null;
  const text = lineup.seats.join("\n");
  const count = lineup.seats.length;
  const state =
    mode === "fixed"
      ? createFixedWerewolf(
          text,
          lineup.narrator,
          random,
          fixedDraft.roles,
          fixedConfigurationSettings(fixedDraft, count),
        )
      : (() => {
          const result = createVariableWerewolf(
            text,
            lineup.narrator,
            random,
            variableSelectionOf(count, variableDraft),
            { ...variableDraft.rules },
          );
          return result.ok ? result.game : null;
        })();
  return state ? createWerewolfSession(state) : null;
}

/**
 * Bump this whenever the shape of the game state or the rules of the reducer change: a game saved under another
 * version is dropped instead of being loaded into a reducer that no longer understands it.
 */
export const savedSessionVersion = 1;

interface SavedSession {
  readonly version: number;
  readonly session: WerewolfSession;
}

export function serializeWerewolfSession(session: WerewolfSession): SavedSession {
  return { session, version: savedSessionVersion };
}

const isState = (value: unknown): value is WerewolfState =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as { status?: unknown }).status === "string" &&
  Array.isArray((value as { players?: unknown }).players) &&
  Array.isArray((value as { alive?: unknown }).alive) &&
  Array.isArray((value as { history?: unknown }).history) &&
  typeof (value as { night?: unknown }).night === "number";

/** Reads a saved game; anything of another version or of a wrong shape is rejected (undefined). */
export function parseSavedWerewolfSession(raw: unknown): WerewolfSession | undefined {
  if (typeof raw !== "object" || raw === null) return undefined;
  const { version, session } = raw as Partial<SavedSession>;
  if (version !== savedSessionVersion || typeof session !== "object" || session === null)
    return undefined;
  const { present, past } = session as Partial<WerewolfSession>;
  if (!isState(present) || !Array.isArray(past) || !past.every(isState)) return undefined;
  return { past, present };
}
