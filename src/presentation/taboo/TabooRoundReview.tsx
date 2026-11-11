import { useTranslation } from "react-i18next";
import type { TabooOutcome, TabooResult } from "../../business/games/taboo/stateMachine";

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
        </>
      )}
    </section>
  );
}
