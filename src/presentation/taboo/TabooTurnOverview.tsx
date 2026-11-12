import { useTranslation } from "react-i18next";
import type { TabooOutcome } from "../../business/games/taboo/stateMachine";
import { Button, StatusMessage } from "../components";
import { ScoreScreen, TurnStrip } from "../game-kit";
import { TabooRoundReview } from "./TabooRoundReview";
import type { EndedState, OverviewData } from "./tabooSetupModel";

interface TabooTurnOverviewProps {
  canFinishEarly: boolean;
  deckEmpty: boolean;
  /** The finished turn whose results are reviewed; undefined before the first turn. */
  ended: EndedState | undefined;
  generationEmpty: boolean;
  onFinish: () => void;
  onNewSetup: () => void;
  onRevise: (cardId: string, outcome: TabooOutcome) => void;
  onStart: () => void;
  overview: OverviewData;
}

/** Between two turns: who is next, the scores and the review of the turn that just ended. */
export function TabooTurnOverview({
  canFinishEarly,
  deckEmpty,
  ended,
  generationEmpty,
  onFinish,
  onNewSetup,
  onRevise,
  onStart,
  overview,
}: TabooTurnOverviewProps) {
  const { t } = useTranslation();

  const roundText =
    overview.turn &&
    (overview.configuration.roundsPerTeam === "unlimited"
      ? t("tabooRound.roundOfUnlimited", { round: overview.turn.round })
      : t("tabooRound.roundOf", {
          round: overview.turn.round,
          total: overview.configuration.roundsPerTeam,
        }));

  return (
    <ScoreScreen
      actions={
        <>
          {canFinishEarly && (
            <Button variant="secondary" onClick={() => onFinish()}>
              {t("tabooResult.show")}
            </Button>
          )}
          {overview.turn ? (
            <>
              <TurnStrip
                hiddenLabel={t("tabooRound.upNext")}
                name={overview.configuration.teams[overview.turn.teamIndex]?.name ?? ""}
              />
              <Button variant="success" onClick={() => onStart()} disabled={deckEmpty}>
                {t("tabooRound.start")}
              </Button>
            </>
          ) : (
            <Button variant="success" onClick={() => onFinish()}>
              {t("tabooResult.show")}
            </Button>
          )}
        </>
      }
      ariaLabel={t("tabooRound.overview")}
      intro={
        <>
          {generationEmpty && !ended && (
            <p className="taboo-tiebreak__rules" role="status">
              {t("tabooSetup.noExtraCards")}
            </p>
          )}
          {!overview.turn && <p>{t("tabooRound.allRoundsPlayed")}</p>}
        </>
      }
      stackedActions={canFinishEarly}
      standings={{
        scores: overview.scores,
        teams: overview.configuration.teams,
        title: t("tabooRound.standings"),
      }}
      {...(roundText ? { eyebrow: roundText } : {})}
    >
      {ended && (
        <TabooRoundReview
          results={ended.results}
          teamName={ended.configuration.teams[ended.turn.teamIndex]?.name ?? ""}
          onRevise={(cardId, outcome) => onRevise(cardId, outcome)}
        />
      )}
      {deckEmpty && (
        <>
          <StatusMessage title={t("tabooRound.empty")} tone="error">
            {t("tabooRound.exhausted")}
          </StatusMessage>
          <Button variant="secondary" onClick={() => onNewSetup()}>
            {t("tabooResult.newSetup")}
          </Button>
        </>
      )}
    </ScoreScreen>
  );
}
