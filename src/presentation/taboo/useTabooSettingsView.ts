import { useRef, useState } from "react";
import type { ValidationIssue } from "../../business/games/taboo/model";
import { useGameSettingsMemory } from "../game-kit";
import {
  parseSavedTabooSettings,
  readTabooSettings,
  tabooModes,
  type TabooMode,
  type TabooSettings,
} from "./tabooSetupModel";

/** The key of the settings in the memory of the games. */
const settingsKey = "taboo.settings";

interface SettingsViewOptions {
  /** Every category of the card language. */
  readonly categoryIds: readonly string[];
  readonly hasGenerators: boolean;
  readonly setIssues: (issues: readonly ValidationIssue[]) => void;
}

/**
 * The settings of Taboo as their own view above the line-up. The form stays mounted while the view
 * is closed (hidden), so its values are kept and read when the game starts. Here live: whether the
 * view is open, the chosen tab, the game mode, the form itself, and reading the settings from it.
 */
export function useTabooSettingsView({
  categoryIds,
  hasGenerators,
  setIssues,
}: SettingsViewOptions) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [menuTab, setMenuTab] = useState("settings");
  // The settings of the last game: the form starts with them, and every change is saved.
  const memory = useGameSettingsMemory();
  const [saved, setSaved] = useState<TabooSettings | undefined>(() => {
    const raw = memory?.read(settingsKey);
    return raw === undefined ? undefined : parseSavedTabooSettings(raw);
  });
  const [mode, setMode] = useState<TabooMode>(saved?.mode ?? "classic");
  const formRef = useRef<HTMLFormElement>(null);
  // A new version builds the form anew, with the settings it starts with.
  const [formVersion, setFormVersion] = useState(0);

  /**
   * Reads the settings from their form. Without a category the settings are opened at the cards, where
   * the problem is fixed.
   */
  /** Saves the settings of the form for the next game (nothing while a category is missing). */
  function remember() {
    const form = formRef.current;
    // Without a memory there is nothing to remember: the form keeps starting with its usual choices.
    if (!form || !memory) return;
    const data = new FormData(form);
    // The mode radios are part of the form, so the mode that was just picked is read from there.
    const formMode = tabooModes.find((candidate) => candidate === data.get("mode")) ?? mode;
    const read = readTabooSettings(data, { categoryIds, hasGenerators, mode: formMode });
    if (read.categories.length === 0) return;
    memory?.write(settingsKey, read);
    setSaved(read);
  }

  function readSettings(): TabooSettings | undefined {
    const form = formRef.current;
    if (!form) return undefined;
    const read = readTabooSettings(new FormData(form), { categoryIds, hasGenerators, mode });
    if (read.categories.length === 0) {
      setIssues([{ field: "categories", code: "required" }]);
      setMenuTab("cards");
      setSettingsOpen(true);
      return undefined;
    }
    remember();
    return read;
  }

  return {
    formRef,
    formVersion,
    menuTab,
    mode,
    readSettings,
    remember,
    /** The settings of the last game, if there were any. */
    saved,
    /** Closes the view and builds the form anew (a new setup). */
    resetForm: () => {
      setSettingsOpen(false);
      setFormVersion((version) => version + 1);
    },
    setMenuTab,
    setMode,
    setSettingsOpen,
    settingsOpen,
  };
}
