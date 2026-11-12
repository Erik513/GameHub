import { useRef } from "react";
import { useTranslation } from "react-i18next";
import type { TabooCard } from "../../business/games/taboo/model";
import type { RaceActive, RaceEvent } from "../../business/games/taboo/race";
import type { TabooOutcome } from "../../business/games/taboo/stateMachine";
import { Button, ConfirmButton } from "../components";
import { TimerHud, useStopwatch } from "../game-kit";
import { formatSeconds } from "./formatTime";

const outcomes = ["correct", "skipped", "forbiddenWord"] as const;
const outcomeVariants = {
  correct: "success",
  skipped: "secondary",
  forbiddenWord: "danger",
} as const;

interface TabooRaceRunProps {
  active: RaceActive;
  dispatch: (event: RaceEvent) => void;
  onResume: () => void;
  /** When the run is paused, and how long it was paused before, so pauses do not count. */
  pausedAt: number | undefined;
  pausedMs: number;
  /** Finds a new card for a skipped or wrong one; nothing when the cards are used up. */
  pickReplacement: (card: TabooCard) => TabooCard | undefined;
  startedAt: number;
  target: number;
  teamName: string;
}

/** One run of the mode "Auf Zeit": explain the cards one after another, the clock counts up. */
export function TabooRaceRun({
  active,
  dispatch,
  onResume,
  pausedAt,
  pausedMs,
  pickReplacement,
  startedAt,
  target,
  teamName,
}: TabooRaceRunProps) {
  const { t, i18n } = useTranslation();
  const paused = pausedAt !== undefined;
  const card = active.cards[active.solved];
  const readClock = useRef(Date.now);
  const totalMs = useStopwatch({ pausedAt, pausedMs, startedAt });

  if (!card) return null;

  function answer(outcome: TabooOutcome) {
    const elapsedMs = readClock.current() - startedAt - pausedMs;
    if (outcome === "correct") {
      dispatch({ type: "answerCard", outcome, elapsedMs });
      return;
    }
    const replacement = card ? pickReplacement(card) : undefined;
    if (!replacement) return;
    dispatch({ type: "answerCard", outcome, elapsedMs, replacement });
  }

  const time = formatSeconds(totalMs, i18n.language);

  return (
    <section className="taboo-round taboo-round--running" aria-label={t("tabooRace.run")}>
      <TimerHud
        fraction={active.solved / target}
        meta={
          <>
            {t("tabooRace.title")}
            {" · "}
            {t("tabooRace.cardOf", { current: active.solved + 1, total: target })}
          </>
        }
        remainingSeconds={Number.POSITIVE_INFINITY}
        time={time}
        timerLabel={t("tabooRace.timer", { time })}
        title={teamName}
      />
      {paused ? (
        <div className="taboo-round__card taboo-round__card--paused">
          <h2>{t("tabooRound.paused")}</h2>
          <p>{t("tabooRound.pausedHint")}</p>
          <Button variant="success" onClick={onResume}>
            {t("navigation.resume")}
          </Button>
          <ConfirmButton
            armedLabel={t("tabooRace.restartRunConfirm")}
            idleLabel={t("tabooRace.restartRun")}
            onConfirm={() => dispatch({ type: "restartRun" })}
          >
            {t("tabooRace.restartRun")}
          </ConfirmButton>
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
      <div className="taboo-round__actions" data-skip-hidden={active.skipUsed}>
        {outcomes
          .filter((outcome) => outcome !== "skipped" || !active.skipUsed)
          .map((outcome) => (
            <Button
              key={outcome}
              data-outcome={outcome}
              disabled={paused}
              variant={outcomeVariants[outcome]}
              onClick={() => answer(outcome)}
            >
              {t(`tabooRound.${outcome}`)}
              {outcome === "forbiddenWord" && (
                <small aria-hidden="true">{t("tabooRace.forbiddenHint")}</small>
              )}
              {outcome === "skipped" && (
                <small aria-hidden="true">{t("tabooRound.skipOnce")}</small>
              )}
            </Button>
          ))}
      </div>
    </section>
  );
}
