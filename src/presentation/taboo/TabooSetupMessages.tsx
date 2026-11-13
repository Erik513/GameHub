import { useTranslation } from "react-i18next";
import type { Difficulty, ValidationIssue } from "../../business/games/taboo/model";
import { Toast } from "../components";
import { issueMessageKey } from "./tabooSetupModel";

interface TabooSetupMessagesProps {
  /** Counts the start attempts; a message that is still true is shown again at every attempt. */
  attempt?: number;
  deckEmpty: boolean;
  issues: readonly ValidationIssue[];
  /** Too few cards; `difficulty` is set when a difficulty is short for a fair race. */
  shortage: { available: number; required: number; difficulty?: Difficulty } | undefined;
}

/** The errors of the setup: missing cards, an empty deck and invalid input. */
export function TabooSetupMessages({
  attempt = 0,
  deckEmpty,
  issues,
  shortage,
}: TabooSetupMessagesProps) {
  const { t } = useTranslation();

  return (
    <>
      {shortage && (
        <Toast key={`shortage-${attempt}`} title={t("tabooRound.empty")} tone="error">
          {shortage.difficulty
            ? t("tabooSetup.raceCardShortage", {
                ...shortage,
                difficulty: t(`tabooSetup.difficulties.${shortage.difficulty}`),
              })
            : t("tabooSetup.cardShortage", shortage)}
        </Toast>
      )}
      {deckEmpty && (
        <Toast key={`empty-${attempt}`} title={t("tabooRound.empty")} tone="error">
          {t("tabooRound.emptyHint")}
        </Toast>
      )}
      {issues.length > 0 && (
        <Toast key={`invalid-${attempt}`} title={t("tabooSetup.invalidSetup")} tone="error">
          <ul>
            {issues.map((issue) => (
              <li key={issue.field + issue.code}>{t(issueMessageKey(issue))}</li>
            ))}
          </ul>
        </Toast>
      )}
    </>
  );
}
