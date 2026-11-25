import { createFixedWerewolf } from "./fixedSetup";
import { fixedConfigurationSettings, type FixedDraft } from "./fixedConfiguration";
import type { WerewolfLineup } from "./lineup";
import { createWerewolfSession, type WerewolfSession } from "./session";
import { isRemovedAmuletIntro, leaveRemovedAmuletIntro, type WerewolfState } from "./stateMachine";
import type { Player } from "./stateTypes";
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

/** Writes the current format. Version 1 is still accepted and upgraded on load. */
export const savedSessionVersion = 2;
const legacySessionVersion = 1;

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
  (value as WerewolfState).players.every(isPlayer) &&
  (value as WerewolfState).alive.every(isPlayer) &&
  Array.isArray((value as { history?: unknown }).history) &&
  typeof (value as { night?: unknown }).night === "number";

function isPlayer(value: unknown): value is Player {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Partial<Player>).name === "string" &&
    typeof (value as Partial<Player>).role === "string"
  );
}

/** Reads the current format or version 1, including earlier snapshots used by Back. */
export function parseSavedWerewolfSession(raw: unknown): WerewolfSession | undefined {
  if (typeof raw !== "object" || raw === null) return undefined;
  const { version, session } = raw as Partial<SavedSession>;
  if (
    (version !== savedSessionVersion && version !== legacySessionVersion) ||
    typeof session !== "object" ||
    session === null
  )
    return undefined;
  const { present, past } = session as Partial<WerewolfSession>;
  if (!Array.isArray(past)) return undefined;

  const restored = restoreState(present);
  if (!restored) return undefined;
  const previous: WerewolfState[] = [];
  for (const snapshot of past) {
    const state = restoreState(snapshot);
    if (!state) return undefined;
    // The old step before the first night is no longer a checkpoint.
    if (!isRemovedAmuletIntro(state)) previous.push(state);
  }
  return { past: previous, present: leaveRemovedAmuletIntro(restored) };
}

function restoreState(value: unknown): WerewolfState | undefined {
  if (!isState(value)) return undefined;
  const state = { ...value } as WerewolfState & {
    inspectedPlayer?: string | null;
  };
  delete state.inspectedPlayer;

  // JSON stores a separate copy at each reference. Restore seat identity for the rules that compare players.
  const players = new Map(state.players.map((player) => [player.name, player]));
  const seat = (player: Player) => players.get(player.name) ?? player;
  const restored = migrateOldVote({
    ...state,
    alive: state.alive.map(seat),
    ...(state.wolfTarget ? { wolfTarget: seat(state.wolfTarget) } : {}),
    ...("victim" in state && state.victim ? { victim: seat(state.victim) } : {}),
    ...("poisoned" in state && state.poisoned ? { poisoned: seat(state.poisoned) } : {}),
    ...(state.spellVictims ? { spellVictims: state.spellVictims.map(seat) } : {}),
    ...(state.nightDeaths ? { nightDeaths: state.nightDeaths.map(seat) } : {}),
    ...(state.shotDeaths ? { shotDeaths: state.shotDeaths.map(seat) } : {}),
    ...("hunter" in state ? { hunter: seat(state.hunter) } : {}),
    wolfChoice: state.wolfChoice === undefined ? restoreWolfChoice(state) : state.wolfChoice,
    inspections: state.inspections ?? [],
    healedPlayer: state.healedPlayer ?? null,
    spellHealedPlayer: state.spellHealedPlayer ?? null,
    protectedNight: state.protectedNight ?? null,
    hostNight: state.hostNight ?? null,
    silencedNight: state.silencedNight ?? null,
  });
  if (restored.status !== "nightCall") return restored;
  const resume = restoreState(restored.resume);
  return resume ? { ...restored, resume } : undefined;
}

function restoreWolfChoice(state: WerewolfState): string | null {
  // wolfTarget may be the night guest who took the attack. Only the recorded choice identifies the host.
  for (let index = state.history.length - 1; index >= 0; index -= 1) {
    const entry = state.history[index];
    if (entry?.night === state.night && entry.kind === "action" && entry.event?.type === "attack")
      return entry.event.target;
  }
  return null;
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
