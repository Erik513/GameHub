import { useTranslation } from "react-i18next";
import type { TabooOutcome, TabooResult } from "../../business/games/taboo/stateMachine";
import { TabooReviewList } from "./TabooReviewList";

interface TabooRoundReviewProps {
  onRevise: (cardId: string, outcome: TabooOutcome) => void;
  results: readonly TabooResult[];
  teamName: string;
}

/** Shows every card of the finished turn in green (correct) or red (not scored) and allows fixing mistakes. */
export function TabooRoundReview({ onRevise, results, teamName }: TabooRoundReviewProps) {
  const { t } = useTranslation();

  return (
    <section className="taboo-review" aria-labelledby="taboo-review-title">
      <h2 id="taboo-review-title">{t("tabooRound.review.title", { team: teamName })}</h2>
      {results.length === 0 ? (
        <p>{t("tabooRound.review.empty")}</p>
      ) : (
        <>
          <p className="taboo-review__hint">{t("tabooRound.review.hint")}</p>
          <TabooReviewList onRevise={onRevise} results={results} />
        </>
      )}
    </section>
  );
}
