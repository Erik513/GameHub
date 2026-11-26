import { useEffect, useRef } from "react";
import { EndGameButton } from "../game-kit";
import { useTranslation } from "react-i18next";
import type { TabooCard } from "../../business/games/taboo/model";
import {
  TIEBREAK_CARD_COUNT,
  TIEBREAK_LIMIT_SECONDS,
  type TabooOutcome,
  type TiebreakActive,
  type TiebreakEvent,
} from "../../business/games/taboo/stateMachine";
import { Button, ConfirmButton } from "../components";
import { TimerHud, useStopwatch } from "../game-kit";
import { formatSeconds } from "./formatTime";
import { monotonicNow } from "../monotonicClock";
import { useFocusOnShow } from "../game-kit/useFocusOnShow";
import { TabooTurnActions } from "./TabooTurnActions";

const limitMs = TIEBREAK_LIMIT_SECONDS * 1000;

interface TabooTiebreakRoundProps {
  active: TiebreakActive;
  dispatch: (event: TiebreakEvent) => void;
  /** Gives the game up and returns to the main menu. */
  onEndGame: () => void;
  onResume: () => void;
  /** Start of the attempt and the time spent paused, so pauses do not count. */
  pausedAt: number | undefined;
  pausedMs: number;
  pickReplacement: (card: TabooCard) => TabooCard | undefined;
  startedAt: number;
  teamName: string;
}

/** One timed tiebreak attempt: explain three cards as fast as possible. */
export function TabooTiebreakRound({
  active,
  dispatch,
  onEndGame,
  onResume,
  pausedAt,
  pausedMs,
  pickReplacement,
  startedAt,
  teamName,
}: TabooTiebreakRoundProps) {
  const { t, i18n } = useTranslation();
  const focus = useFocusOnShow<HTMLElement>();
  const paused = pausedAt !== undefined;
  const card = active.cards[active.index];
  const readClock = useRef(monotonicNow);
  const totalMs = useStopwatch({ pausedAt, pausedMs, startedAt });
  const timeUp = totalMs >= limitMs;

  useEffect(() => {
    if (timeUp && !paused) {
      dispatch({ type: "endTiebreakAttempt", elapsedMs: limitMs });
    }
  }, [dispatch, paused, timeUp]);

  if (!card) return null;

  function answer(outcome: TabooOutcome) {
    const event: TiebreakEvent = {
      type: "answerTiebreak",
      outcome,
      elapsedMs: readClock.current() - startedAt - pausedMs,
    };
    if (outcome === "skipped" || outcome === "forbiddenWord") {
      const replacement = card ? pickReplacement(card) : undefined;
      if (!replacement) return;
      dispatch({ ...event, replacement });
      return;
    }
    dispatch(event);
  }

  return (
    <section
      className="taboo-round taboo-round--running focus-target"
      aria-label={t("tabooTiebreak.round")}
      ref={focus}
      tabIndex={-1}
    >
      <TimerHud
        // The task is to solve three cards as fast as possible: the bar shows the cards, like in the race.
        fraction={active.index / TIEBREAK_CARD_COUNT}
        meta={t("tabooTiebreak.cardOf", { current: active.index + 1, total: TIEBREAK_CARD_COUNT })}
        remainingSeconds={(limitMs - totalMs) / 1000}
        time={formatSeconds(totalMs, i18n.language)}
        timerLabel={t("tabooTiebreak.timer", { time: formatSeconds(totalMs, i18n.language) })}
        title={teamName}
      />
      {paused ? (
        <div className="taboo-round__card taboo-round__card--paused">
          <h2>{t("tabooRound.paused")}</h2>
          <p>{t("tabooRound.pausedHint")}</p>
          <Button variant="success" onClick={onResume}>
            {t("navigation.resume")}
          </Button>
          {/* Ending the attempt cannot be undone, so it needs a second tap like ending a round. */}
          <ConfirmButton
            armedLabel={t("tabooTiebreak.endAttemptConfirm")}
            idleLabel={t("tabooTiebreak.endAttempt")}
            onConfirm={() =>
              dispatch({
                type: "endTiebreakAttempt",
                elapsedMs: totalMs,
              })
            }
          >
            {t("tabooTiebreak.endAttempt")}
          </ConfirmButton>
          <EndGameButton onConfirm={onEndGame} />
        </div>
      ) : (
        <div
          className="taboo-round__card"
          aria-live="polite"
          aria-atomic="true"
          lang={card.language}
        >
          <p className="taboo-round__difficulty" data-difficulty={card.difficulty}>
            {t(`tabooSetup.difficulties.${card.difficulty}`)}
          </p>
          <h2>{card.term}</h2>
          <p className="taboo-round__forbidden-label">{t("tabooRound.forbiddenLabel")}</p>
          <ul>
            {card.forbiddenWords.map((word) => (
              <li key={word}>{word}</li>
            ))}
          </ul>
        </div>
      )}
      <TabooTurnActions
        disabled={() => false}
        hints={{
          forbiddenWord: t("tabooTiebreak.forbiddenHint"),
          skipped: t("tabooRound.skipOnce"),
        }}
        onPress={answer}
        onTogglePause={onResume}
        paused={paused}
        skipHidden={active.skipUsed}
      />
    </section>
  );
}
