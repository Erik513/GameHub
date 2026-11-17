import { useTranslation } from "react-i18next";
import { Button } from "../components";
import { ScoreScreen } from "../game-kit";
import type { FinishedState } from "./tabooSetupModel";
import { TabooTiebreakResults } from "./TabooTiebreakResults";

interface TabooResultViewProps {
  finished: FinishedState;
  onNewSetup: () => void;
  onSameSetup: () => void;
}

/** The final screen: winner, scores, optional tiebreak results and the two follow-up actions. */
export function TabooResultView({ finished, onNewSetup, onSameSetup }: TabooResultViewProps) {
  const { t } = useTranslation();

  return (
    <ScoreScreen
      actions={
        <>
          <Button variant="success" onClick={() => onSameSetup()}>
            {t("tabooResult.sameSetup")}
          </Button>
          <Button variant="secondary" onClick={() => onNewSetup()}>
            {t("tabooResult.newSetup")}
          </Button>
        </>
      }
      ariaLabel={t("tabooResult.title")}
      celebrate
      eyebrow={t("tabooResult.title")}
      {...(finished.tiebreak
        ? {
            extraTab: {
              content: (
                <TabooTiebreakResults
                  rows={finished.tiebreak.map((attempt) => {
                    const team = finished.configuration.teams[attempt.teamIndex];
                    return {
                      id: team?.id ?? String(attempt.teamIndex),
                      name: team?.name ?? "",
                      result: { solved: attempt.solved, timeMs: attempt.timeMs },
                      winner: team ? finished.winnerIds.includes(team.id) : false,
                    };
                  })}
                />
              ),
              label: t("tabooTiebreak.title"),
            },
            // The tiebreak decided the game, so its result is shown first.
            extraTabFirst: true,
          }
        : {})}
      stackedActions
      standings={{
        scores: finished.scores,
        teams: finished.configuration.teams,
        tabLabel: t("tabooRound.standingsTab"),
        title: t("tabooRound.standings"),
        winnerIds: finished.winnerIds,
      }}
      winner={{
        label: t(finished.winnerIds.length === 1 ? "tabooResult.winner" : "tabooResult.tie"),
        names: finished.configuration.teams
          .filter((team) => finished.winnerIds.includes(team.id))
          .map((team) => team.name)
          .join(", "),
      }}
    />
  );
}
