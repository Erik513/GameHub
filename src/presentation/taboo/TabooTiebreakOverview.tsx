import { useTranslation } from "react-i18next";
import { Button, StatusMessage } from "../components";
import { ScoreScreen, TurnStrip } from "../game-kit";
import { TabooTiebreakResults } from "./TabooTiebreakResults";
import { tiebreakRows, tiebreakTeamName, type TiebreakView } from "./tabooSetupModel";

interface TabooTiebreakOverviewProps {
  noCards: boolean;
  onBegin: () => void;
  onNewSetup: () => void;
  state: TiebreakView;
}

/** Between two tiebreak attempts: rules, results so far and who plays next. */
export function TabooTiebreakOverview({
  noCards,
  onBegin,
  onNewSetup,
  state,
}: TabooTiebreakOverviewProps) {
  const { t } = useTranslation();

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
      intro={<p className="taboo-tiebreak__rules">{t("tabooTiebreak.rules")}</p>}
    >
      <h2>{t("tabooTiebreak.results")}</h2>
      <TabooTiebreakResults rows={tiebreakRows(state)} />
      {noCards && (
        <>
          <StatusMessage title={t("tabooRound.empty")} tone="error">
            {t("tabooTiebreak.noCards")}
          </StatusMessage>
          <Button variant="secondary" onClick={() => onNewSetup()}>
            {t("tabooResult.newSetup")}
          </Button>
        </>
      )}
    </ScoreScreen>
  );
}
