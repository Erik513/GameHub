import { parsePlayers } from "./players";
import type { TeamSetupValue } from "./teamSetup";

/**
 * Where the last teams and players are remembered between games. The same memory serves every game.
 * Implementations live outside the business layer (for example in the browser storage).
 */
export interface TeamSetupMemory {
  /** The remembered teams and players, or nothing if none were saved or the data is unusable. */
  read(): TeamSetupValue | undefined;
  write(value: TeamSetupValue): void;
}

/** Whether there is anything worth remembering: a team name or at least one player. */
export function hasTeamSetupContent(value: TeamSetupValue): boolean {
  return (
    value.names.some((name) => name.trim() !== "") || parsePlayers(value.playersText).length > 0
  );
}

export function sameTeamSetup(a: TeamSetupValue, b: TeamSetupValue): boolean {
  return (
    a.count === b.count &&
    a.order === b.order &&
    a.playersText === b.playersText &&
    a.names.length === b.names.length &&
    a.names.every((name, index) => name === b.names[index]) &&
    JSON.stringify(Object.entries(a.assignment).sort()) ===
      JSON.stringify(Object.entries(b.assignment).sort())
  );
}

/**
 * Reads remembered data that came from outside (storage can hold anything). Returns nothing unless
 * every field has the expected shape, so broken data never reaches the setup screen.
 */
export function parseSavedTeamSetup(raw: unknown): TeamSetupValue | undefined {
  if (typeof raw !== "object" || raw === null) return undefined;
  const { assignment, count, names, order, playersText } = raw as Record<string, unknown>;
  if (
    typeof count !== "number" ||
    !Number.isInteger(count) ||
    count < 1 ||
    count > 100 ||
    !Array.isArray(names) ||
    !names.every((name): name is string => typeof name === "string") ||
    (order !== "random" && order !== "entered") ||
    typeof playersText !== "string" ||
    typeof assignment !== "object" ||
    assignment === null ||
    Array.isArray(assignment)
  ) {
    return undefined;
  }
  const entries = Object.entries(assignment);
  if (
    !entries.every(([, team]) => typeof team === "number" && Number.isInteger(team) && team >= 0)
  ) {
    return undefined;
  }
  return {
    assignment: Object.fromEntries(entries),
    count,
    names,
    order,
    playersText,
  };
}
