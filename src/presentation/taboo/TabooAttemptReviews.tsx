import { useTranslation } from "react-i18next";
import type { TabooOutcome, TabooResult } from "../../business/games/taboo/stateMachine";
import { TabooReviewList } from "./TabooReviewList";

export interface AttemptReview {
  readonly id: string;
  /** The most cards that may count as correct. */
  readonly maxCorrect: number;
  readonly results: readonly TabooResult[];
  readonly teamName: string;
  readonly teamIndex: number;
}

interface TabooAttemptReviewsProps {
  attempts: readonly AttemptReview[];
  onRevise: (teamIndex: number, cardId: string, outcome: TabooOutcome) => void;
}

/** Lets the players fix a wrong result of a finished tiebreak attempt or race run, per team. */
export function TabooAttemptReviews({ attempts, onRevise }: TabooAttemptReviewsProps) {
  const { t } = useTranslation();
  if (attempts.length === 0) return null;

  return (
    <section className="taboo-review" aria-label={t("tabooReview.title")}>
      <h2>{t("tabooReview.title")}</h2>
      {attempts.map(({ id, maxCorrect, results, teamIndex, teamName }) => {
        const correct = results.filter((result) => result.outcome === "correct").length;
        return (
          <details className="taboo-review__attempt" key={id}>
            <summary>{t("tabooReview.attempt", { team: teamName })}</summary>
            <p className="taboo-review__hint">{t("tabooRound.review.hint")}</p>
            <TabooReviewList
              canMarkCorrect={correct < maxCorrect}
              onRevise={(cardId, outcome) => onRevise(teamIndex, cardId, outcome)}
              results={results}
            />
          </details>
        );
      })}
    </section>
  );
}
