import { useRef } from "react";
import { useTranslation } from "react-i18next";
import type { CountdownActive, CountdownEvent } from "../../business/games/taboo/countdown";
import type { TabooCard } from "../../business/games/taboo/model";
import type { TabooOutcome } from "../../business/games/taboo/stateMachine";
import { Button } from "../components";
import { TimerHud, useCountdown } from "../game-kit";
import { formatMinutes } from "./formatTime";

const outcomes = ["correct", "skipped", "forbiddenWord"] as const;
const outcomeVariants = {
  correct: "success",
  skipped: "secondary",
  forbiddenWord: "danger",
} as const;

interface TabooCountdownRunProps {
  active: CountdownActive;
  /** The whole account of every team, for the bar. */
  budgetMs: number;
  dispatch: (event: CountdownEvent) => void;
  onResume: () => void;
  /** When the turn is paused, and how long it was paused before, so pauses do not count. */
  pausedAt: number | undefined;
  pausedMs: number;
  /** Finds a new card for a skipped or wrong one; nothing when no card of that difficulty is left. */
  pickReplacement: (card: TabooCard) => TabooCard | undefined;
  /** What the account of the team was when the turn began, in milliseconds. */
  remainingAtStartMs: number;
  skipUsed: boolean;
  startedAt: number;
  teamName: string;
}

/** One turn of the mode "Gegen die Zeit": the team explains and guesses, its account runs down. */
export function TabooCountdownRun({
  active,
  budgetMs,
  dispatch,
  onResume,
  pausedAt,
  pausedMs,
  pickReplacement,
  remainingAtStartMs,
  skipUsed,
  startedAt,
  teamName,
}: TabooCountdownRunProps) {
  const { t } = useTranslation();
  const paused = pausedAt !== undefined;
  const { card } = active;
  const readClock = useRef(Date.now);
  // A pause moves the end of the account on by the time it lasted.
  const { seconds } = useCountdown({
    deadline: startedAt + remainingAtStartMs + pausedMs,
    durationMs: remainingAtStartMs,
    onElapsed: () => dispatch({ type: "timeUp" }),
    paused,
  });
  const time = formatMinutes(seconds);

  function answer(outcome: TabooOutcome) {
    const elapsedMs = readClock.current() - startedAt - pausedMs;
    if (outcome === "correct") {
      dispatch({ type: "answerCard", outcome, elapsedMs });
      return;
    }
    const replacement = pickReplacement(card);
    if (!replacement) return;
    dispatch({ type: "answerCard", outcome, elapsedMs, replacement });
  }

  const canReplace = pickReplacement(card) !== undefined;

  return (
    <section className="taboo-round taboo-round--running" aria-label={t("tabooCountdown.run")}>
      <TimerHud
        fraction={Math.min(1, (seconds * 1000) / budgetMs)}
        remainingSeconds={seconds}
        time={time}
        timerLabel={t("tabooCountdown.timer", { time })}
        title={teamName}
      />
      {paused ? (
        <div className="taboo-round__card taboo-round__card--paused">
          <h2>{t("tabooRound.paused")}</h2>
          <p>{t("tabooRound.pausedHint")}</p>
          <Button variant="success" onClick={onResume}>
            {t("navigation.resume")}
          </Button>
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
      <div className="taboo-round__actions" data-skip-hidden={skipUsed}>
        {outcomes
          .filter((outcome) => outcome !== "skipped" || !skipUsed)
          .map((outcome) => (
            <Button
              key={outcome}
              data-outcome={outcome}
              disabled={paused || (outcome !== "correct" && !canReplace)}
              variant={outcomeVariants[outcome]}
              onClick={() => answer(outcome)}
            >
              {t(`tabooRound.${outcome}`)}
              {outcome === "skipped" && (
                <small aria-hidden="true">{t("tabooCountdown.skipOnce")}</small>
              )}
            </Button>
          ))}
      </div>
    </section>
  );
}
