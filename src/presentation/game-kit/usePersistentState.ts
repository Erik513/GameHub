import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { useGameSettingsMemory } from "./GameSettingsMemoryContext";

/**
 * State that is remembered between games: like `useState`, but it starts with what the shared memory
 * holds under `key` and saves every change. `parse` checks what comes back (storage can hold anything)
 * and returns nothing for data it cannot use; then the game starts with `initial`. Without a memory
 * (tests, an app without storage) it is plain state. Every game keeps its settings with this.
 */
export function usePersistentState<T>(
  key: string,
  initial: () => T,
  parse: (raw: unknown) => T | undefined,
): [T, Dispatch<SetStateAction<T>>] {
  const memory = useGameSettingsMemory();
  const [value, setValue] = useState<T>(() => {
    const raw = memory?.read(key);
    const saved = raw === undefined ? undefined : parse(raw);
    return saved ?? initial();
  });
  // The first value is what was just read (or the start value): only changes are saved.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    memory?.write(key, value);
  }, [key, memory, value]);
  return [value, setValue];
}
