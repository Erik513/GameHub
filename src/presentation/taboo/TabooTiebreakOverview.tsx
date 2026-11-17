import { useTranslation } from "react-i18next";
import type { TabooOutcome } from "../../business/games/taboo/stateMachine";
import { Button, Toast } from "../components";
import { ScoreScreen, TurnStrip } from "../game-kit";
import { TabooAttemptReviews, type AttemptReview } from "./TabooAttemptReviews";
import { TabooTiebreakResults } from "./TabooTiebreakResults";
import {
  tiebreakRows,
  tiebreakTeamName,
  tiebreakReviews,
  type TiebreakData,
} from "./tabooSetupModel";

interface TabooTiebreakOverviewProps {
  noCards: boolean;
  onBegin: () => void;
  onNewSetup: () => void;
  onRevise: (teamIndex: number, cardId: string, outcome: TabooOutcome) => void;
  state: TiebreakData;
}

/** Between two tiebreak attempts: rules, results so far and who plays next. */
export function TabooTiebreakOverview({
  noCards,
  onBegin,
  onNewSetup,
  onRevise,
  state,
}: TabooTiebreakOverviewProps) {
  const { t } = useTranslation();
  // Only the attempt that was just played can be corrected.
  const lastReview: AttemptReview | undefined = tiebreakReviews(
    state.attempts,
    state.configuration,
  ).at(-1);

  return (
    <ScoreScreen
      actions={
        <>
          <TurnStrip hiddenLabel={t("tabooRound.upNext")} name={tiebreakTeamName(state) ?? ""} />
          <Button variant="success" onClick={onBegin} disabled={noCards}>
            {t("tabooTiebreak.start")}
          </Button>
        </>
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
            tabLabel: t("tabooTiebreak.results"),
          }
        : {})}
      intro={<p className="taboo-tiebreak__rules">{t("tabooTiebreak.rules")}</p>}
    >
      {!lastReview && <h2>{t("tabooTiebreak.results")}</h2>}
      <TabooTiebreakResults rows={tiebreakRows(state)} />
      {noCards && (
        <>
          <Toast title={t("tabooRound.empty")} tone="error">
            {t("tabooTiebreak.noCards")}
          </Toast>
          <Button variant="secondary" onClick={() => onNewSetup()}>
            {t("tabooResult.newSetup")}
          </Button>
        </>
      )}
    </ScoreScreen>
  );
}
