import { useTranslation } from "react-i18next";
import type { WerewolfState } from "../../business/games/werewolf/stateMachine";
import { Button } from "../components";
import { ActionRow, ScoreScreen } from "../game-kit";
import { WinnerList } from "./GuidePlainBox";

interface WerewolfEndScreenProps {
  readonly state: WerewolfState;
  /** Takes the last step back (the game ended by a mistake). */
  readonly onBack: () => void;
  readonly canGoBack: boolean;
  /** Leaves the game for the main menu of Werewolf. */
  readonly onNewGame: () => void;
}

/**
 * The end of a game of Werewolf on the result page of every game: "End of the game", confetti, the winners (with their
 * side in the heading and a green frame) and the losers with the legend, and at the bottom "Back" (to take the last step back)
 * and "New game".
 */
export function WerewolfEndScreen({ state, onBack, canGoBack, onNewGame }: WerewolfEndScreenProps) {
  const { t } = useTranslation();
  return (
    <ScoreScreen
      actions={
        // Side by side, like "back" and "next" while the game runs.
        <ActionRow>
          <Button disabled={!canGoBack} onClick={onBack} variant="secondary">
            {t("werewolfNarrator.guide.back")}
          </Button>
          <Button onClick={onNewGame} variant="success">
            {t("werewolfNarrator.guide.nextKind.finish")}
          </Button>
        </ActionRow>
      }
      ariaLabel={t("werewolfNarrator.bar.finished")}
      celebrate
      eyebrow={t("werewolfNarrator.bar.finished")}
    >
      <WinnerList state={state} />
    </ScoreScreen>
  );
}
