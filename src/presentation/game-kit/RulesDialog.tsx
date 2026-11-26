import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Dialog } from "../components";
import { useGameBack } from "../GameChrome";
import { SetupTabs, type SetupTab } from "./SetupTabs";

interface RulesDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title: string;
  /** The rules in tabs (only the content of a tab scrolls, the tabs stay on top). */
  readonly tabs?: readonly SetupTab[];
  /** The name of the row of tabs for screen readers. */
  readonly tabsLabel?: string;
  /** The rules without tabs: a few `RulesSection`s one below the other. */
  readonly children?: ReactNode;
}

/**
 * The window of the rules, the same in every game: a large window with the title and "Close", the rules either as a
 * few sections or in tabs. The Back key of the system closes it and stays in the game. Every game only brings its own
 * sections or tabs.
 */
export function RulesDialog({ open, onClose, title, tabs, tabsLabel, children }: RulesDialogProps) {
  const { t } = useTranslation();
  useGameBack(open, onClose, { headerUnchanged: true });
  return (
    <Dialog
      closeLabel={t("settings.close")}
      onClose={onClose}
      open={open}
      size="large"
      title={title}
    >
      {tabs ? (
        <div className="kit-rules">
          <SetupTabs ariaLabel={tabsLabel ?? title} tabs={tabs} />
        </div>
      ) : (
        children
      )}
    </Dialog>
  );
}
