/**
 * Where the settings of every game are remembered between games, so a new game starts with what was
 * chosen the last time. A game keeps its parts under its own keys (for example "werewolf.configuration");
 * the game reads what it gets back with a parser of its own, because storage can hold anything.
 * Implementations live outside the business layer (for example in the browser storage).
 */
export interface GameSettingsMemory {
  /** What was saved under the key, or nothing. The caller checks the shape. */
  read(key: string): unknown;
  write(key: string, value: unknown): void;
}
