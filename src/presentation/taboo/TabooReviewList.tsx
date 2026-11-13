import { useTranslation } from "react-i18next";
import type { TabooOutcome, TabooResult } from "../../business/games/taboo/stateMachine";

interface TabooReviewListProps {
  /** False when one more correct card would be more than the run allows. */
  canMarkCorrect?: boolean;
  onRevise: (cardId: string, outcome: TabooOutcome) => void;
  results: readonly TabooResult[];
}

/** Every card of a finished turn or run in green (correct) or red (not scored); a tap flips it. */
export function TabooReviewList({
  canMarkCorrect = true,
  onRevise,
  results,
}: TabooReviewListProps) {
  const { t } = useTranslation();

  return (
    <ul className="taboo-review__list">
      {results.map(({ card, outcome }) => {
        const content = (label: string) => (
          <>
            <span className="taboo-review__card">
              <span>{card.term}</span>
              <small>{card.forbiddenWords.join(" · ")}</small>
            </span>
            <span lang={undefined}>{label}</span>
          </>
        );
        if (outcome === "skipped") {
          // Skipped cards stay visible but neutral and cannot be changed.
          return (
            <li key={card.id}>
              <div className="taboo-review__item" data-skipped="true" lang={card.language}>
                {content(t("tabooRound.review.skipped"))}
              </div>
            </li>
          );
        }
        const correct = outcome === "correct";
        return (
          <li key={card.id}>
            <button
              aria-pressed={correct}
              className="taboo-review__item"
              data-correct={correct}
              disabled={!correct && !canMarkCorrect}
              lang={card.language}
              type="button"
              onClick={() => onRevise(card.id, correct ? "forbiddenWord" : "correct")}
            >
              {content(t(correct ? "tabooRound.review.correct" : "tabooRound.review.wrong"))}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
