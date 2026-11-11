import { useTranslation } from "react-i18next";
import { Button } from "../components";
import { Scoreboard, StartBar } from "../game-kit";
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
    <section className="taboo-round taboo-overview" aria-label={t("tabooResult.title")}>
      <p className="taboo-overview__round">{t("tabooResult.title")}</p>
      <div className="taboo-result" role="status">
        <span>{t(finished.winnerIds.length === 1 ? "tabooResult.winner" : "tabooResult.tie")}</span>
        <span className="visually-hidden">: </span>
        <strong>
          {finished.configuration.teams
            .filter((team) => finished.winnerIds.includes(team.id))
            .map((team) => team.name)
            .join(", ")}
        </strong>
      </div>
      <h2>{t("tabooRound.standings")}</h2>
      <Scoreboard
        label={t("tabooRound.standings")}
        scores={finished.scores}
        teams={finished.configuration.teams}
        winnerIds={finished.winnerIds}
      />
      {finished.tiebreak && (
        <>
          <h2>{t("tabooTiebreak.results")}</h2>
          <TabooTiebreakResults
            rows={[...finished.tiebreak]
              .sort((a, b) => b.solved - a.solved || a.timeMs - b.timeMs)
              .map((attempt) => {
                const team = finished.configuration.teams[attempt.teamIndex];
                return {
                  id: team?.id ?? String(attempt.teamIndex),
                  name: team?.name ?? "",
                  result: { solved: attempt.solved, timeMs: attempt.timeMs },
                  winner: team ? finished.winnerIds.includes(team.id) : false,
                };
              })}
          />
        </>
      )}
      <StartBar stacked>
        <Button variant="success" onClick={() => onSameSetup()}>
          {t("tabooResult.sameSetup")}
        </Button>
        <Button variant="secondary" onClick={() => onNewSetup()}>
          {t("tabooResult.newSetup")}
        </Button>
      </StartBar>
    </section>
  );
}
