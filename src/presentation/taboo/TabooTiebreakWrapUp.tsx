import { useTranslation } from "react-i18next";
import type { TabooOutcome } from "../../business/games/taboo/stateMachine";
import { Button } from "../components";
import { ScoreScreen } from "../game-kit";
import { TabooAttemptReviews } from "./TabooAttemptReviews";
import { TabooTiebreakResults } from "./TabooTiebreakResults";
import { tiebreakReviews, type FinishedState } from "./tabooSetupModel";

interface TabooTiebreakWrapUpProps {
  finished: FinishedState;
  onRevise: (teamIndex: number, cardId: string, outcome: TabooOutcome) => void;
  onShow: () => void;
}

/**
 * After the last tiebreak attempt, before the final screen: the results and the cards of the attempts
 * can still be checked here. The final screen only shows the result.
 */
export function TabooTiebreakWrapUp({ finished, onRevise, onShow }: TabooTiebreakWrapUpProps) {
  const { t } = useTranslation();
  const attempts = finished.tiebreak ?? [];
  // Only the attempt that was just played can be corrected.
  const lastReview = tiebreakReviews(attempts, finished.configuration).at(-1);

  return (
    <ScoreScreen
      actions={
        <Button variant="success" onClick={onShow}>
          {t("tabooResult.show")}
        </Button>
      }
      ariaLabel={t("tabooTiebreak.title")}
      eyebrow={t("tabooTiebreak.title")}
      {...(lastReview
        ? {
            extraTab: {
              content: (
                <TabooAttemptReviews
                  attempt={lastReview}
                  onRevise={onRevise}
                  titleKey="tabooReview.attemptTitle"
                />
              ),
              label: t("tabooReview.lastAttempt", { count: lastReview.results.length }),
            },
          }
        : {})}
      tabLabel={t("tabooTiebreak.results")}
    >
      <TabooTiebreakResults
        rows={attempts.map((attempt) => {
          const team = finished.configuration.teams[attempt.teamIndex];
          return {
            id: team?.id ?? String(attempt.teamIndex),
            name: team?.name ?? "",
            result: { solved: attempt.solved, timeMs: attempt.timeMs },
          };
        })}
      />
    </ScoreScreen>
  );
}
