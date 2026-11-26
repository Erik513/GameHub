import { useRef } from "react";
import { EndGameButton } from "../game-kit";
import { useTranslation } from "react-i18next";
import type { CountdownActive, CountdownEvent } from "../../business/games/taboo/countdown";
import type { TabooCard } from "../../business/games/taboo/model";
import type { TabooOutcome } from "../../business/games/taboo/stateMachine";
import { Button } from "../components";
import { TimerHud, useCountdown } from "../game-kit";
import { TabooCountdownStrip, type CountdownStripTeam } from "./TabooCountdownStrip";
import { formatMinutes } from "./formatTime";
import { monotonicNow } from "../monotonicClock";
import { useFocusOnShow } from "../game-kit/useFocusOnShow";
import { TabooTurnActions } from "./TabooTurnActions";
import { TabooTurnSidebar } from "./TabooTurnSidebar";

interface TabooCountdownRunProps {
  active: CountdownActive;
  /** The whole account of every team, for the bar. */
  budgetMs: number;
  dispatch: (event: CountdownEvent) => void;
  /** Gives the game up and returns to the main menu. */
  onEndGame: () => void;
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
  /** All accounts, for the side panel at the PC and for the row above the card. */
  teams: readonly CountdownStripTeam[];
  /** Whether the row above the card is shown on a phone (the automatic change of teams). */
  showRow: boolean;
}

/** One turn of the mode "Gegen die Zeit": the team explains and guesses, its account runs down. */
export function TabooCountdownRun({
  active,
  budgetMs,
  dispatch,
  onEndGame,
  onResume,
  pausedAt,
  pausedMs,
  pickReplacement,
  remainingAtStartMs,
  skipUsed,
  startedAt,
  showRow,
  teamName,
  teams,
}: TabooCountdownRunProps) {
  const { t } = useTranslation();
  const focus = useFocusOnShow<HTMLElement>();
  const paused = pausedAt !== undefined;
  const { card } = active;
  const readClock = useRef(monotonicNow);
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
    <section
      className={
        showRow
          ? "taboo-round taboo-round--running taboo-round--with-row taboo-round--with-sidebar focus-target"
          : "taboo-round taboo-round--running taboo-round--with-sidebar focus-target"
      }
      aria-label={t("tabooCountdown.run")}
      ref={focus}
      tabIndex={-1}
    >
      <TimerHud
        fraction={Math.min(1, (seconds * 1000) / budgetMs)}
        remainingSeconds={seconds}
        time={time}
        timerLabel={t("tabooCountdown.timer", { time })}
        title={teamName}
      />
      {showRow && (
        <TabooCountdownStrip
          active={active.teamIndex}
          // The team on the move shows what is left right now.
          teams={teams.map((team, index) =>
            index === active.teamIndex ? { ...team, remainingMs: seconds * 1000 } : team,
          )}
        />
      )}
      {paused ? (
        <div className="taboo-round__card taboo-round__card--paused">
          <h2>{t("tabooRound.paused")}</h2>
          <p>{t("tabooRound.pausedHint")}</p>
          <Button variant="success" onClick={onResume}>
            {t("navigation.resume")}
          </Button>
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
      <TabooTurnSidebar
        rows={teams.map((team, index) => ({
          active: index === active.teamIndex,
          id: team.id,
          name: team.name,
          out: team.eliminated,
          value: team.eliminated
            ? t("tabooCountdown.outShort")
            : formatMinutes(
                (index === active.teamIndex ? seconds * 1000 : team.remainingMs) / 1000,
              ),
        }))}
        title={t("tabooCountdown.accounts")}
      />
      <TabooTurnActions
        disabled={(outcome) => outcome !== "correct" && !canReplace}
        hints={{ skipped: t("tabooCountdown.skipOnce") }}
        onPress={answer}
        onTogglePause={onResume}
        paused={paused}
        skipHidden={skipUsed}
      />
    </section>
  );
}
