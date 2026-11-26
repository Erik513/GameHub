import { useRef } from "react";
import { EndGameButton } from "../game-kit";
import { useTranslation } from "react-i18next";
import type { TabooCard } from "../../business/games/taboo/model";
import type { RaceActive, RaceEvent } from "../../business/games/taboo/race";
import type { TabooOutcome } from "../../business/games/taboo/stateMachine";
import { Button, ConfirmButton } from "../components";
import { TimerHud, useStopwatch } from "../game-kit";
import { formatSeconds } from "./formatTime";
import { monotonicNow } from "../monotonicClock";
import { useFocusOnShow } from "../game-kit/useFocusOnShow";
import { TabooTurnActions } from "./TabooTurnActions";
import { TabooTurnSidebar, type SidebarRow } from "./TabooTurnSidebar";

interface TabooRaceRunProps {
  active: RaceActive;
  /** False when no card of the same difficulty is left; skipping and wrong cards are blocked then. */
  canReplace: boolean;
  dispatch: (event: RaceEvent) => void;
  /** Gives the game up and returns to the main menu. */
  onEndGame: () => void;
  onResume: () => void;
  /** When the run is paused, and how long it was paused before, so pauses do not count. */
  pausedAt: number | undefined;
  pausedMs: number;
  /** Finds a new card for a skipped or wrong one; nothing when the cards are used up. */
  pickReplacement: (card: TabooCard) => TabooCard | undefined;
  /** The total times of all teams so far, for the side panel at the PC. */
  standings: readonly SidebarRow[];
  startedAt: number;
  target: number;
  teamName: string;
}

/** One run of the mode "Auf Zeit": explain the cards one after another, the clock counts up. */
export function TabooRaceRun({
  active,
  canReplace,
  dispatch,
  onEndGame,
  onResume,
  pausedAt,
  pausedMs,
  pickReplacement,
  standings,
  startedAt,
  target,
  teamName,
}: TabooRaceRunProps) {
  const { t, i18n } = useTranslation();
  const focus = useFocusOnShow<HTMLElement>();
  const paused = pausedAt !== undefined;
  const card = active.cards[active.solved];
  const readClock = useRef(monotonicNow);
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
    <section
      className="taboo-round taboo-round--running taboo-round--with-sidebar focus-target"
      aria-label={t("tabooRace.run")}
      ref={focus}
      tabIndex={-1}
    >
      <TimerHud
        fraction={active.solved / target}
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
      <TabooTurnSidebar rows={standings} title={t("tabooSidebar.times")} />
      <TabooTurnActions
        disabled={(outcome) => outcome !== "correct" && !canReplace}
        hints={{ skipped: t("tabooRound.skipOnce") }}
        onPress={answer}
        onTogglePause={onResume}
        paused={paused}
        skipHidden={active.skipUsed}
      />
    </section>
  );
}
