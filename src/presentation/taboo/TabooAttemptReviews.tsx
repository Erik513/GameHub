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
  /** The attempt that was played last; only it can be corrected, like the last round of the classic mode. */
  attempt: AttemptReview;
  onRevise: (teamIndex: number, cardId: string, outcome: TabooOutcome) => void;
  /** The heading above the cards, for example "Played run: {{team}}". */
  titleKey: "tabooReview.runTitle" | "tabooReview.attemptTitle";
}

/**
 * Lets the players fix a wrong result of the tiebreak attempt or race run that was just played. It
 * looks like the review of a round of the classic mode: the cards in green and red. After the next
 * attempt the cards can no longer be changed.
 */
export function TabooAttemptReviews({ attempt, onRevise, titleKey }: TabooAttemptReviewsProps) {
  const { t } = useTranslation();
  const correct = attempt.results.filter((result) => result.outcome === "correct").length;

  return (
    <section className="taboo-review" aria-label={t("tabooReview.title")}>
      <h2>{t(titleKey, { team: attempt.teamName })}</h2>
      {attempt.results.length === 0 ? (
        <p>{t("tabooRound.review.empty")}</p>
      ) : (
        <>
          <p className="taboo-review__hint">{t("tabooRound.review.hint")}</p>
          <TabooReviewList
            canMarkCorrect={correct < attempt.maxCorrect}
            onRevise={(cardId, outcome) => onRevise(attempt.teamIndex, cardId, outcome)}
            results={attempt.results}
          />
        </>
      )}
    </section>
  );
}
