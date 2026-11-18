import { useTranslation } from "react-i18next";
import type { TabooOutcome } from "../../business/games/taboo/stateMachine";
import { Button } from "../components";
import { ShortcutHint, useShortcuts, type Shortcut } from "../game-kit";

const outcomes = ["correct", "skipped", "forbiddenWord"] as const;
const outcomeVariants = {
  correct: "success",
  skipped: "secondary",
  forbiddenWord: "danger",
} as const;

/** The keys of the answers as `KeyboardEvent.key` says them. */
const answerKeys = {
  correct: [" ", "Enter"],
  skipped: ["s"],
  forbiddenWord: ["v"],
} as const;
/** The same keys as the buttons name them for screen readers (`aria-keyshortcuts`). */
const ariaKeys = { correct: "Space Enter", skipped: "S", forbiddenWord: "V" } as const;

interface TabooTurnActionsProps {
  /** Whether an answer cannot be given now (for example no new card left); the pause is handled here. */
  disabled: (outcome: TabooOutcome) => boolean;
  /** A small text below the name of a button, for example "once per game". */
  hints?: Partial<Record<TabooOutcome, string>>;
  onPress: (outcome: TabooOutcome) => void;
  /** Pauses the turn, or resumes it when it is paused. */
  onTogglePause: () => void;
  paused: boolean;
  /** The button to skip is gone when no skip is left. */
  skipHidden: boolean;
}

/**
 * The three buttons of a turn (correct, skipped, forbidden word) with their keyboard shortcuts at the
 * PC: the space bar or Enter for "correct", S, V, and P for the pause. The keys stand at the buttons
 * (not on a phone). A key does exactly what the button does and nothing while the button is disabled
 * or the turn is paused; P pauses and resumes. The rules of the keys are in `useShortcuts`.
 */
export function TabooTurnActions({
  disabled,
  hints = {},
  onPress,
  onTogglePause,
  paused,
  skipHidden,
}: TabooTurnActionsProps) {
  const { t } = useTranslation();
  const isDisabled = (outcome: TabooOutcome) => paused || disabled(outcome);
  const pause: Shortcut = { keys: ["p"], run: onTogglePause };
  const answers: Shortcut[] = outcomes
    .filter((outcome) => outcome !== "skipped" || !skipHidden)
    .map((outcome) => ({
      keys: answerKeys[outcome],
      run: () => {
        if (!isDisabled(outcome)) onPress(outcome);
      },
    }));
  useShortcuts(paused ? [pause] : [...answers, pause]);

  return (
    <div className="taboo-round__actions" data-skip-hidden={skipHidden}>
      {outcomes
        .filter((outcome) => outcome !== "skipped" || !skipHidden)
        .map((outcome) => (
          <Button
            aria-keyshortcuts={ariaKeys[outcome]}
            key={outcome}
            data-outcome={outcome}
            disabled={isDisabled(outcome)}
            title={outcome === "skipped" ? hints[outcome] : undefined}
            variant={outcomeVariants[outcome]}
            onClick={() => onPress(outcome)}
          >
            <span>
              {t(`tabooRound.${outcome}`)}
              <ShortcutHint label={t(`tabooShortcuts.${outcome}`)} />
            </span>
            {hints[outcome] && <small aria-hidden="true">{hints[outcome]}</small>}
          </Button>
        ))}
      <p className="taboo-round__keys">
        <ShortcutHint label={t("tabooShortcuts.pause")} />
        {t(paused ? "tabooShortcuts.pauseResume" : "tabooShortcuts.pauseHint")}
      </p>
    </div>
  );
}
