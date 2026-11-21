import { useState } from "react";
import { useTranslation } from "react-i18next";
import { describePlayers } from "../../business/games/werewolf/selectors";
import type { WerewolfState } from "../../business/games/werewolf/stateMachine";
import { Button, ConfirmButton, Dialog, Icon } from "../components";
import { WerewolfSymbol } from "./symbols/WerewolfSymbol";

interface NarratorBarProps {
  readonly state: WerewolfState;
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
export function NarratorBar({ state, day, onClose, onRules }: NarratorBarProps) {
  const { t } = useTranslation();
  const [overview, setOverview] = useState(false);
  // While the players look at their roles nobody may see all the roles or open the rules: the buttons only appear when
  // the real game begins.
  const dealing = state.status === "roles";
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
        <span className="ww-bar__phase" role="img" aria-label={label}>
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
        <ul className="ww-overview">
          {[...describePlayers(state)]
            .sort((one, other) =>
              one.name.localeCompare(other.name, undefined, { sensitivity: "base" }),
            )
            .map((player) => (
              <li className="ww-overview__row" data-dead={!player.alive} key={player.name}>
                <WerewolfSymbol id={player.role} size={20} />
                <span className="ww-overview__who">
                  <strong>{player.name}</strong>
                  <small>{t(`werewolfSymbols.items.${player.role}.name`)}</small>
                </span>
                <span className="ww-overview__marks">
                  {!player.alive && (
                    <WerewolfSymbol
                      id="dead"
                      label={t("werewolfSymbols.items.dead.name")}
                      size={14}
                    />
                  )}
                  {player.partner !== null && (
                    <WerewolfSymbol
                      id="lovers"
                      label={t("werewolfSymbols.items.lovers.name")}
                      size={14}
                    />
                  )}
                  {player.amulet && (
                    <WerewolfSymbol
                      id="amulet"
                      label={t("werewolfSymbols.items.amulet.name")}
                      size={14}
                    />
                  )}
                  {player.alive && player.delayedDeathNight !== null && (
                    <WerewolfSymbol
                      id="wounded"
                      label={t("werewolfSymbols.items.wounded.name")}
                      size={14}
                    />
                  )}
                  {player.silenced && (
                    <WerewolfSymbol
                      id="silenced"
                      label={t("werewolfSymbols.items.silenced.name")}
                      size={14}
                    />
                  )}
                  {player.drunk && player.alive && (
                    <WerewolfSymbol
                      id="drunk"
                      label={t("werewolfSymbols.items.drunk.name")}
                      size={14}
                    />
                  )}
                </span>
              </li>
            ))}
        </ul>
      </Dialog>
    </header>
  );
}
