import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { WerewolfState } from "../../business/games/werewolf/stateMachine";
import { Button, Dialog, Icon } from "../components";
import { GameBar } from "../game-kit";
import { PlayerRows } from "./PlayerRows";

interface NarratorBarProps {
  readonly state: WerewolfState;
  /** The game for the overview of all players (with the decision that was just made); the state itself when absent. */
  readonly overviewState?: WerewolfState;
  /** The game is dealt but not begun (the last player has looked): nothing of the game may show yet. */
  readonly dealing?: boolean;
  /** Day (sun) or night (moon). */
  readonly day: boolean;
  /** Leaves the game (after the second tap on the button). */
  readonly onClose: () => void;
  /** Opens the rules of the game. */
  readonly onRules: () => void;
}

/**
 * The top bar of the narrator view: sun or moon with the number of the night, the overview of all players with their
 * roles (private to the narrator) and the button that leaves the game.
 */
export function NarratorBar({
  state,
  overviewState,
  day,
  dealing: forceDealing = false,
  onClose,
  onRules,
}: NarratorBarProps) {
  const { t } = useTranslation();
  const [overview, setOverview] = useState(false);
  // While the players look at their roles nobody may see all the roles or open the rules: the buttons only appear when
  // the real game begins.
  const dealing = forceDealing || state.status === "roles";
  const label = t(day ? "werewolfNarrator.bar.day" : "werewolfNarrator.bar.night", {
    count: state.night,
  });
  return (
    <GameBar
      icon={dealing ? "cards" : day ? "sun" : "moon"}
      onEnd={onClose}
      {...(dealing ? {} : { onRules, statusLabel: label, tone: day ? "day" : "night" })}
      status={dealing ? t("werewolfNarrator.bar.dealing") : label}
    >
      {/* While the players look at their roles nobody may see all the roles: the button only appears afterwards. */}
      {!dealing && (
        <Button
          aria-label={t("werewolfNarrator.bar.overview")}
          onClick={() => setOverview(true)}
          title={t("werewolfNarrator.bar.overview")}
          variant="secondary"
        >
          <Icon name="users" />
        </Button>
      )}
      <Dialog
        closeLabel={t("werewolfConfig.infoClose")}
        onClose={() => setOverview(false)}
        open={overview && !dealing}
        size="large"
        subtitle={t("werewolfNarrator.bar.overviewHint")}
        title={t("werewolfNarrator.bar.overview")}
      >
        <PlayerRows
          announce={overviewState === undefined || overviewState === state}
          state={overviewState ?? state}
        />
      </Dialog>
    </GameBar>
  );
}
