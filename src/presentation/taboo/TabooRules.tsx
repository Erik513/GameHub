import { Trans, useTranslation } from "react-i18next";
import { RulesButton, RulesDialog } from "../game-kit";
import { tabooModes, type TabooMode } from "./tabooSetupModel";

/** The button that opens the rules window of Taboo. */
export function TabooRulesButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation();
  return <RulesButton label={t("tabooRules.open")} onClick={onClick} />;
}

interface TabooRulesDialogProps {
  onClose: () => void;
  /** Closes the window and shows the tiebreak window instead. */
  onOpenTiebreak: () => void;
  /** Shows the rules of another game mode; this does not change the chosen game mode. */
  onTabChange: (mode: TabooMode) => void;
  open: boolean;
  /** The game mode whose rules are shown. */
  tab: TabooMode;
}

/** The rules of Taboo: the card and the forbidden words, then one tab per game mode. */
export function TabooRulesDialog({
  onClose,
  onOpenTiebreak,
  onTabChange,
  open,
  tab,
}: TabooRulesDialogProps) {
  const { t } = useTranslation();

  return (
    <RulesDialog
      closeLabel={t("settings.close")}
      intro={[t("tabooRules.goal"), t("tabooRules.turn")]}
      onClose={onClose}
      onTabChange={(id) => {
        const mode = tabooModes.find((value) => value === id);
        if (mode) onTabChange(mode);
      }}
      open={open}
      tab={tab}
      tabs={tabooModes.map((mode) => ({
        id: mode,
        label: t(`tabooMode.${mode}`),
        content: (
          <ul className="kit-rules-list">
            {t(`tabooMode.${mode}Rules`)
              .split("\n")
              .map((line) => (
                <li key={line}>{line}</li>
              ))}
            {mode === "classic" && (
              <li>
                <Trans
                  components={{
                    ref: (
                      <button className="kit-link-button" type="button" onClick={onOpenTiebreak}>
                        {t("tabooTiebreakInfo.title")}
                      </button>
                    ),
                  }}
                  i18nKey="tabooMode.tiebreakRule"
                />
              </li>
            )}
          </ul>
        ),
      }))}
      tabsLabel={t("tabooMode.legend")}
      title={t("tabooRules.title")}
    />
  );
}
