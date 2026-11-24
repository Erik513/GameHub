import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { WerewolfState } from "../../business/games/werewolf/stateMachine";
import { Button, ConfirmButton, Dialog, Icon } from "../components";
import { PlayerRows } from "./PlayerRows";

interface NarratorBarProps {
  readonly state: WerewolfState;
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
    <header className="ww-bar">
      {dealing ? (
        // The night has not begun yet: no moon and no number of a night while the players look at their roles.
        <span className="ww-bar__phase">
          <Icon name="cards" />
          <strong>{t("werewolfNarrator.bar.dealing")}</strong>
        </span>
      ) : (
        <span
          aria-label={label}
          className="ww-bar__phase"
          data-time={day ? "day" : "night"}
          role="img"
        >
          <Icon name={day ? "sun" : "moon"} />
          <strong>{label}</strong>
        </span>
      )}
      {!dealing && (
        <>
          <Button
            aria-label={t("werewolfNarrator.bar.rules")}
            onClick={onRules}
            title={t("werewolfNarrator.bar.rules")}
            variant="secondary"
          >
            <Icon name="book" />
          </Button>
          <Button
            aria-label={t("werewolfNarrator.bar.overview")}
            onClick={() => setOverview(true)}
            title={t("werewolfNarrator.bar.overview")}
            variant="secondary"
          >
            <Icon name="users" />
          </Button>
        </>
      )}
      {/* Two taps without a window: the first turns the button red and asks, the second leaves the game. */}
      <ConfirmButton
        armedContent={
          <>
            <Icon name="close" />
            <span>{t("werewolfNarrator.bar.closeConfirm")}</span>
          </>
        }
        armedLabel={t("navigation.exitGameConfirm")}
        idleLabel={t("werewolfNarrator.bar.close")}
        idleVariant="danger"
        onConfirm={onClose}
      >
        <Icon name="close" />
      </ConfirmButton>
      <Dialog
        closeLabel={t("werewolfConfig.infoClose")}
        onClose={() => setOverview(false)}
        open={overview && !dealing}
        size="large"
        subtitle={t("werewolfNarrator.bar.overviewHint")}
        title={t("werewolfNarrator.bar.overview")}
      >
        <PlayerRows state={state} />
      </Dialog>
    </header>
  );
}
