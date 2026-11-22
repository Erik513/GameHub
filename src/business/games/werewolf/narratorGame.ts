import { createFixedWerewolf } from "./fixedSetup";
import { fixedConfigurationSettings, type FixedDraft } from "./fixedConfiguration";
import type { WerewolfLineup } from "./lineup";
import { createWerewolfSession, type WerewolfSession } from "./session";
import { isRemovedAmuletIntro, leaveRemovedAmuletIntro, type WerewolfState } from "./stateMachine";
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
  /** The checkpoints of the narrator (the steps of the guide with their choices); checked by `parseSavedTrail`. */
  readonly trail?: unknown;
}

export function serializeWerewolfSession(session: WerewolfSession, trail?: unknown): SavedSession {
  return trail === undefined
    ? { session, version: savedSessionVersion }
    : { session, trail, version: savedSessionVersion };
}

/** The saved checkpoints of the narrator, or undefined. */
export function savedTrailOf(raw: unknown): unknown {
  return typeof raw === "object" && raw !== null ? (raw as Partial<SavedSession>).trail : undefined;
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
  // The step before the first night that called the holder of the amulet no longer exists: a game saved in it goes on
  // with the first night, and the step is no longer part of the way back.
  return {
    past: past.filter((state) => !isRemovedAmuletIntro(state)).map(migrateOldVote),
    present: migrateOldVote(leaveRemovedAmuletIntro(present)),
  };
}

/**
 * A game saved while a vote was open before the new vote (one nominated person with yes or no): the nominated person
 * becomes the only candidate of the first round.
 */
function migrateOldVote(state: WerewolfState): WerewolfState {
  if (state.status !== "vote" || "candidates" in state) return state;
  const old = state as unknown as { target?: string; nomination: number } & WerewolfState;
  const { target, ...rest } = old;
  return { ...rest, candidates: target ? [target] : [], round: 1 } as unknown as WerewolfState;
}
