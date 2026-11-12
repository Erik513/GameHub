import { useTranslation } from "react-i18next";
import type { Difficulty, ValidationIssue } from "../../business/games/taboo/model";
import { StatusMessage } from "../components";
import { issueMessageKey } from "./tabooSetupModel";

interface TabooSetupMessagesProps {
  deckEmpty: boolean;
  issues: readonly ValidationIssue[];
  /** Too few cards; `difficulty` is set when a difficulty is short for a fair race. */
  shortage: { available: number; required: number; difficulty?: Difficulty } | undefined;
}

/** The errors of the setup: missing cards, an empty deck and invalid input. */
export function TabooSetupMessages({ deckEmpty, issues, shortage }: TabooSetupMessagesProps) {
  const { t } = useTranslation();

  return (
    <>
      {shortage && (
        <StatusMessage title={t("tabooRound.empty")} tone="error">
          {shortage.difficulty
            ? t("tabooSetup.raceCardShortage", {
                ...shortage,
                difficulty: t(`tabooSetup.difficulties.${shortage.difficulty}`),
              })
            : t("tabooSetup.cardShortage", shortage)}
        </StatusMessage>
      )}
      {deckEmpty && (
        <StatusMessage title={t("tabooRound.empty")} tone="error">
          {t("tabooRound.emptyHint")}
        </StatusMessage>
      )}
      {issues.length > 0 && (
        <StatusMessage title={t("tabooSetup.invalidSetup")} tone="error">
          <ul>
            {issues.map((issue) => (
              <li key={issue.field + issue.code}>{t(issueMessageKey(issue))}</li>
            ))}
          </ul>
        </StatusMessage>
      )}
    </>
  );
}
