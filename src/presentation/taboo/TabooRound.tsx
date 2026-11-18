import { useTranslation } from "react-i18next";
import { TabooEndGameButton } from "./TabooEndGameButton";
import {
  countSkips,
  type TabooEvent,
  type TabooState,
} from "../../business/games/taboo/stateMachine";
import { Button, ConfirmButton } from "../components";
import { TimerHud, useCountdown } from "../game-kit";
import { monotonicNow } from "../monotonicClock";
import { useFocusOnShow } from "../game-kit/useFocusOnShow";

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
  /** Gives the game up and returns to the main menu. */
  onEndGame: () => void;
  onResume: () => void;
  onRestart: () => void;
  paused: boolean;
  restartUnavailable?: boolean;
  state: RunningRound;
}

export function TabooRound({
  deadline,
  dispatch,
  onEndGame,
  onResume,
  onRestart,
  paused,
  restartUnavailable = false,
  state,
}: TabooRoundProps) {
  const { t } = useTranslation();
  const focus = useFocusOnShow<HTMLElement>();
  const { card, configuration, turn } = state;
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
    <section
      className="taboo-round taboo-round--running focus-target"
      aria-label={t("tabooRound.title")}
      ref={focus}
      tabIndex={-1}
    >
      <TimerHud
        fraction={fraction}
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
          {/* Ending the round cannot be undone, so it needs a second tap like the restart. */}
          <ConfirmButton
            armedLabel={t("tabooRound.endRoundConfirm")}
            idleLabel={t("tabooRound.endRound")}
            onConfirm={() => dispatch({ type: "endRound", turn })}
          >
            {t("tabooRound.endRound")}
          </ConfirmButton>
          <TabooEndGameButton onConfirm={onEndGame} />
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
                  monotonicNow() >= deadline
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
