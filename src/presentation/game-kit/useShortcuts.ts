import { useEffect, useRef } from "react";

/** One keyboard shortcut of a screen. */
export interface Shortcut {
  /**
   * The keys that trigger it, as `KeyboardEvent.key` says them: a letter ("s", compared without
   * regard to case), " " for the space bar, "Enter".
   */
  readonly keys: readonly string[];
  readonly run: () => void;
}

/** Letters are compared in lower case, named keys as they are. */
function normalize(key: string): string {
  return key.length === 1 ? key.toLowerCase() : key;
}

/** The keys that are claimed by more than one shortcut; a screen must have none. */
export function duplicateShortcutKeys(shortcuts: readonly Shortcut[]): readonly string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const shortcut of shortcuts) {
    for (const key of shortcut.keys.map(normalize)) {
      if (seen.has(key)) duplicates.add(key);
      seen.add(key);
    }
  }
  return [...duplicates];
}

/** Controls that use the space bar and Enter themselves: pressing the key there presses the control. */
const activating =
  'button, a[href], summary, input, select, textarea, [role="button"], [role="tab"], [role="radio"], [role="checkbox"], [role="switch"], [role="menuitem"]';
/** Places where keys are typed text. */
const typing =
  'input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]), textarea, select, [contenteditable=""], [contenteditable="true"]';

/**
 * Keyboard shortcuts of a screen at the PC. They do the same as the buttons they belong to. A
 * shortcut does nothing:
 * - while somebody types in a field, or while a window is open;
 * - when Ctrl, Alt or Meta is held (the shortcuts of the browser stay theirs) or the key is held down;
 * - for the space bar and Enter while a button, link or similar control has the focus, because the
 *   key presses that control.
 * `enabled` switches all of them off, for example while a turn is paused.
 */
export function useShortcuts(shortcuts: readonly Shortcut[], enabled = true): void {
  // The latest list, so the handler is not set up again when the buttons are drawn again.
  const latest = useRef(shortcuts);
  useEffect(() => {
    latest.current = shortcuts;
  });

  useEffect(() => {
    if (!enabled) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) return;
      if (event.ctrlKey || event.altKey || event.metaKey) return;
      if (document.querySelector('[role="dialog"]')) return;
      const target = event.target instanceof Element ? event.target : document.activeElement;
      if (target?.closest(typing)) return;
      const key = normalize(event.key);
      const shortcut = latest.current.find((candidate) =>
        candidate.keys.map(normalize).includes(key),
      );
      if (!shortcut) return;
      if ((key === " " || key === "Enter") && target?.closest(activating)) return;
      // The space bar would scroll the page otherwise.
      event.preventDefault();
      shortcut.run();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled]);
}
