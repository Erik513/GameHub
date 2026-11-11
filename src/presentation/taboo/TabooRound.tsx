import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { TabooEvent, TabooState } from "../../business/games/taboo/stateMachine";
import { Button } from "../components";

const outcomes = ["correct", "skipped", "forbiddenWord"] as const;
type RunningRound = Extract<TabooState, { status: "roundRunning" }>;

interface TabooRoundProps {
  deadline: number;
  dispatch: (event: TabooEvent) => void;
  state: RunningRound;
}

export function TabooRound({ deadline, dispatch, state }: TabooRoundProps) {
  const { t } = useTranslation();
  const { card, configuration, scores, turn } = state;
  const { round, teamIndex } = turn;
  const [seconds, setSeconds] = useState(() =>
    Math.max(0, Math.ceil((deadline - Date.now()) / 1000)),
  );

  useEffect(() => {
    const clock = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSeconds(remaining);
      if (remaining === 0) {
        clearInterval(clock);
        dispatch({ type: "endRound", turn: { round, teamIndex } });
      }
    }, 100);
    return () => clearInterval(clock);
  }, [deadline, dispatch, round, teamIndex]);

  return (
    <section className="taboo-round" aria-label={t("tabooRound.title")}>
      <div className="taboo-round__hud">
        <div>
          <p className="taboo-round__team">{configuration.teams[teamIndex]?.name}</p>
          <p className="taboo-round__score">
            {t("tabooRound.score", { score: scores[teamIndex] ?? 0 })}
          </p>
        </div>
        <p role="timer" aria-label={t("tabooRound.seconds", { seconds })}>
          {seconds}
        </p>
      </div>
      <div className="taboo-round__card" aria-live="polite" aria-atomic="true" lang={card.language}>
        <h2>{card.term}</h2>
        <ul>
          {card.forbiddenWords.map((word) => (
            <li key={word}>{word}</li>
          ))}
        </ul>
      </div>
      <div className="taboo-round__actions">
        {outcomes.map((outcome) => (
          <Button
            key={outcome}
            disabled={seconds === 0}
            variant={outcome === "correct" ? "primary" : "secondary"}
            onClick={() => {
              dispatch(
                Date.now() >= deadline
                  ? { type: "endRound", turn }
                  : { type: "resolveCard", turn, cardId: card.id, outcome },
              );
            }}
          >
            {t(`tabooRound.${outcome}`)}
          </Button>
        ))}
        <Button
          variant="quiet"
          disabled={state.roundPoints === 0}
          onClick={() => dispatch({ type: "undoPoint", turn })}
        >
          {t("tabooRound.undoPoint")}
        </Button>
      </div>
    </section>
  );
}
