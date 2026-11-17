import { useRef, useState } from "react";
import type { ValidationIssue } from "../../business/games/taboo/model";
import { readTabooSettings, type TabooMode, type TabooSettings } from "./tabooSetupModel";

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
  const [mode, setMode] = useState<TabooMode>("classic");
  const formRef = useRef<HTMLFormElement>(null);
  // A new version builds the form anew, with the settings it starts with.
  const [formVersion, setFormVersion] = useState(0);

  /**
   * Reads the settings from their form. Without a category the settings are opened at the cards, where
   * the problem is fixed.
   */
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
    return read;
  }

  return {
    formRef,
    formVersion,
    menuTab,
    mode,
    readSettings,
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
