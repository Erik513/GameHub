import { Trans, useTranslation } from "react-i18next";
import { Dialog } from "../components";
import { RulesView } from "../game-kit";
import { tabooModes, type TabooMode } from "./tabooSetupModel";

interface TabooRulesPanelProps {
  /** Shows the tiebreak window; the rules of the classic mode link to it. */
  onOpenTiebreak: () => void;
  /** Shows the rules of another game mode; this does not change the chosen game mode. */
  onModeChange: (mode: TabooMode) => void;
  /** The game mode whose rules are shown. */
  mode: TabooMode;
}

/** The rules of Taboo for the tab "Rules": the card and the forbidden words, then the rules of a game mode. */
export function TabooRulesPanel({ mode, onModeChange, onOpenTiebreak }: TabooRulesPanelProps) {
  const { t } = useTranslation();
  // The first rules are the same in every game mode and stand on top; they are not repeated below.
  const intro: readonly string[] = [t("tabooRules.goal"), t("tabooRules.turn")];

  return (
    <RulesView
      intro={intro}
      items={tabooModes.map((value) => ({
        id: value,
        label: t(`tabooMode.${value}`),
        content: (
          <ul className="kit-rules-list">
            {t(`tabooMode.${value}Rules`)
              .split("\n")
              .filter((line) => !intro.includes(line))
              .map((line) => (
                <li key={line}>{line}</li>
              ))}
            {value === "classic" && (
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
      label={t("tabooRules.modes")}
      onSelect={(id) => {
        const next = tabooModes.find((value) => value === id);
        if (next) onModeChange(next);
      }}
      selected={mode}
    />
  );
}

interface TabooRulesDialogProps extends TabooRulesPanelProps {
  onClose: () => void;
  open: boolean;
}

/** The window with the rules of Taboo; the button "Rules" in the header and the info buttons of the game modes open it. */
export function TabooRulesDialog({ onClose, open, ...panel }: TabooRulesDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog
      closeLabel={t("settings.close")}
      onClose={onClose}
      open={open}
      title={t("tabooRules.title")}
    >
      <TabooRulesPanel {...panel} />
    </Dialog>
  );
}
