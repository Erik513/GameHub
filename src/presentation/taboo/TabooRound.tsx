import { useTranslation } from "react-i18next";
import {
  countSkips,
  type TabooEvent,
  type TabooState,
} from "../../business/games/taboo/stateMachine";
import { Button, ConfirmButton } from "../components";
import { TimerHud, useCountdown } from "../game-kit";

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
  onResume: () => void;
  onRestart: () => void;
  paused: boolean;
  restartUnavailable?: boolean;
  state: RunningRound;
}

export function TabooRound({
  deadline,
  dispatch,
  onResume,
  onRestart,
  paused,
  restartUnavailable = false,
  state,
}: TabooRoundProps) {
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
  const { fraction, seconds } = useCountdown({
    deadline,
    durationMs: configuration.roundDurationSeconds * 1000,
    onElapsed: () => dispatch({ type: "endRound", turn: { round, teamIndex } }),
    paused,
  });

  return (
    <section className="taboo-round taboo-round--running" aria-label={t("tabooRound.title")}>
      <TimerHud
        fraction={fraction}
        meta={
          <>
            {configuration.roundsPerTeam === "unlimited"
              ? t("tabooRound.roundOfUnlimited", { round })
              : t("tabooRound.roundOf", { round, total: configuration.roundsPerTeam })}
            {" · "}
            {t("tabooRound.score", { score: scores[teamIndex] ?? 0 })}
          </>
        }
        remainingSeconds={seconds}
        time={String(seconds)}
        timerLabel={t("tabooRound.seconds", { seconds })}
        title={configuration.teams[teamIndex]?.name ?? ""}
      />
      {paused ? (
        <div className="taboo-round__card taboo-round__card--paused">
          <h2>{t("tabooRound.paused")}</h2>
          <p>{t("tabooRound.pausedHint")}</p>
          <Button variant="success" onClick={onResume}>
            {t("navigation.resume")}
          </Button>
          {restartUnavailable && <p role="alert">{t("tabooRound.noNewCards")}</p>}
          <ConfirmButton
            armedLabel={t("tabooRound.restartRoundConfirm")}
            idleLabel={t("tabooRound.restartRound")}
            onConfirm={onRestart}
          >
            {t("tabooRound.restartRound")}
          </ConfirmButton>
          <Button variant="secondary" onClick={() => dispatch({ type: "endRound", turn })}>
            {t("tabooRound.endRound")}
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
      <div className="taboo-round__actions" data-skip-hidden={skipsUsedUp}>
        {outcomes
          .filter((outcome) => outcome !== "skipped" || !skipsUsedUp)
          .map((outcome) => (
            <Button
              key={outcome}
              data-outcome={outcome}
              title={outcome === "skipped" ? skipHint : undefined}
              disabled={paused || seconds === 0 || (outcome === "skipped" && skipsUsedUp)}
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
