import { Trans, useTranslation } from "react-i18next";
import { Dialog } from "../components";
import { RulesSection } from "../game-kit";

interface TabooRulesDialogProps {
  onClose: () => void;
  /** Closes the rules and shows the tiebreak window instead; the rules of the classic mode link to it. */
  onOpenTiebreak: () => void;
  open: boolean;
}

/**
 * The rules of Taboo in one window, short and with pictures where a picture says more: the goal, the
 * card (with an example), one turn with the three buttons, the game modes and what the settings mean.
 * The info buttons of the settings explain only their own setting, in a sentence or two.
 */
export function TabooRulesDialog({ onClose, onOpenTiebreak, open }: TabooRulesDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog
      closeLabel={t("settings.close")}
      onClose={onClose}
      open={open}
      title={t("tabooRules.title")}
    >
      <RulesSection title={t("tabooRules.goalTitle")}>
        <p>{t("tabooRules.goal")}</p>
      </RulesSection>

      <RulesSection title={t("tabooRules.cardTitle")}>
        <p>{t("tabooRules.cardText")}</p>
        <div className="taboo-rules-card">
          <strong>{t("tabooRules.cardTerm")}</strong>
          <ul>
            {t("tabooRules.cardWords")
              .split("\n")
              .map((word) => (
                <li key={word}>{word}</li>
              ))}
          </ul>
        </div>
        <p>{t("tabooRules.cardHint")}</p>
      </RulesSection>

      <RulesSection title={t("tabooRules.turnTitle")}>
        <ol className="kit-rules-steps">
          {t("tabooRules.turnSteps")
            .split("\n")
            .map((step) => (
              <li key={step}>{step}</li>
            ))}
        </ol>
        <ul className="kit-rules-outcomes">
          <li>
            <span className="kit-rules-pill" data-tone="correct">
              {t("tabooRound.correct")}
            </span>
            {t("tabooRules.correctText")}
          </li>
          <li>
            <span className="kit-rules-pill" data-tone="skip">
              {t("tabooRound.skipped")}
            </span>
            {t("tabooRules.skipText")}
          </li>
          <li>
            <span className="kit-rules-pill" data-tone="forbidden">
              {t("tabooRound.forbiddenWord")}
            </span>
            {t("tabooRules.forbiddenText")}
          </li>
        </ul>
        <p>{t("tabooRules.turnEnd")}</p>
      </RulesSection>

      <RulesSection title={t("tabooRules.modesTitle")}>
        <ul className="kit-rules-list">
          <li>
            <strong>{t("tabooMode.classic")}:</strong> {t("tabooRules.classicText")}{" "}
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
          <li>
            <strong>{t("tabooMode.race")}:</strong> {t("tabooRules.raceText")}
          </li>
        </ul>
      </RulesSection>

      <RulesSection title={t("tabooRules.settingsTitle")}>
        <ul className="kit-rules-list">
          {(
            [
              ["tabooSetup.rounds", "tabooRules.settingsRounds"],
              ["tabooSetup.duration", "tabooRules.settingsDuration"],
              ["tabooSetup.skips", "tabooRules.settingsSkips"],
              ["tabooSetup.tiebreak", "tabooRules.settingsTiebreak"],
              ["tabooSetup.cardsSection", "tabooRules.settingsCards"],
            ] as const
          ).map(([name, text]) => (
            <li key={name}>
              <strong>{t(name)}:</strong> {t(text)}
            </li>
          ))}
        </ul>
      </RulesSection>
    </Dialog>
  );
}
