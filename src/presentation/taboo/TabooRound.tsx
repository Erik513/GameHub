import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  countSkips,
  type TabooEvent,
  type TabooState,
} from "../../business/games/taboo/stateMachine";
import { Button } from "../components";

const outcomes = ["correct", "skipped", "forbiddenWord"] as const;
const outcomeVariants = {
  correct: "success",
  skipped: "secondary",
  forbiddenWord: "danger",
} as const;
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
  const { skipsPerRound } = configuration;
  const skipsLeft =
    skipsPerRound === undefined
      ? undefined
      : Math.max(0, skipsPerRound - countSkips(state.results));
  const skipHint =
    skipsPerRound === undefined || skipsLeft === undefined
      ? undefined
      : skipsPerRound === 1
        ? t("tabooRound.skipOnce")
        : t("tabooRound.skipsLeft", { left: skipsLeft, total: skipsPerRound });
  const skipsUsedUp = skipsPerRound !== undefined && countSkips(state.results) >= skipsPerRound;
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
    <section className="taboo-round taboo-round--running" aria-label={t("tabooRound.title")}>
      <div className="taboo-round__hud">
        <div>
          <p className="taboo-round__team">{configuration.teams[teamIndex]?.name}</p>
          <p className="taboo-round__score">
            {t("tabooRound.roundOf", { round, total: configuration.roundsPerTeam })}
            {" · "}
            {t("tabooRound.score", { score: scores[teamIndex] ?? 0 })}
          </p>
        </div>
        <p role="timer" data-low={seconds <= 10} aria-label={t("tabooRound.seconds", { seconds })}>
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
      <div className="taboo-round__actions" data-skip-hidden={skipsUsedUp}>
        {outcomes
          .filter((outcome) => outcome !== "skipped" || !skipsUsedUp)
          .map((outcome) => (
            <Button
              key={outcome}
              data-outcome={outcome}
              title={outcome === "skipped" ? skipHint : undefined}
              disabled={seconds === 0 || (outcome === "skipped" && skipsUsedUp)}
              variant={outcomeVariants[outcome]}
              onClick={() => {
                dispatch(
                  Date.now() >= deadline
                    ? { type: "endRound", turn }
                    : { type: "resolveCard", turn, cardId: card.id, outcome },
                );
              }}
            >
              {t(`tabooRound.${outcome}`)}
              {outcome === "skipped" && skipHint && <small aria-hidden="true">{skipHint}</small>}
            </Button>
          ))}
      </div>
    </section>
  );
}
