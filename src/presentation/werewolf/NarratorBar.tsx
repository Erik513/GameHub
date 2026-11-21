import { useState } from "react";
import { useTranslation } from "react-i18next";
import { describePlayers } from "../../business/games/werewolf/selectors";
import type { WerewolfState } from "../../business/games/werewolf/stateMachine";
import { Button, Dialog, Icon } from "../components";
import { WerewolfSymbol } from "./symbols/WerewolfSymbol";

interface NarratorBarProps {
  readonly state: WerewolfState;
  /** Day (sun) or night (moon). */
  readonly day: boolean;
  /** Asks to leave the game. */
  readonly onClose: () => void;
}

/**
 * The top bar of the narrator view: sun or moon with the number of the night, the overview of all players with their
 * roles (private to the narrator) and the button that leaves the game.
 */
export function NarratorBar({ state, day, onClose }: NarratorBarProps) {
  const { t } = useTranslation();
  const [overview, setOverview] = useState(false);
  const label = t(day ? "werewolfNarrator.bar.day" : "werewolfNarrator.bar.night", {
    count: state.night,
  });
  return (
    <header className="ww-bar">
      <span className="ww-bar__phase" role="img" aria-label={label}>
        <Icon name={day ? "sun" : "moon"} />
        <strong>{label}</strong>
      </span>
      <Button
        aria-label={t("werewolfNarrator.bar.overview")}
        onClick={() => setOverview(true)}
        title={t("werewolfNarrator.bar.overview")}
        variant="secondary"
      >
        <Icon name="users" />
      </Button>
      <Button
        aria-label={t("werewolfNarrator.bar.close")}
        onClick={onClose}
        title={t("werewolfNarrator.bar.close")}
        variant="secondary"
      >
        <Icon name="close" />
      </Button>
      <Dialog
        closeLabel={t("werewolfConfig.infoClose")}
        onClose={() => setOverview(false)}
        open={overview}
        size="large"
        subtitle={t("werewolfNarrator.bar.overviewHint")}
        title={t("werewolfNarrator.bar.overview")}
      >
        <ul className="ww-overview">
          {describePlayers(state).map((player) => (
            <li className="ww-overview__row" data-dead={!player.alive} key={player.name}>
              <WerewolfSymbol id={player.role} size={22} />
              <span className="ww-overview__who">
                <strong>{player.name}</strong>
                <small>{t(`werewolfSymbols.items.${player.role}.name`)}</small>
              </span>
              <span className="ww-overview__marks">
                {!player.alive && (
                  <WerewolfSymbol
                    id="dead"
                    label={t("werewolfSymbols.items.dead.name")}
                    size={20}
                  />
                )}
                {player.partner !== null && (
                  <WerewolfSymbol
                    id="lovers"
                    label={t("werewolfSymbols.items.lovers.name")}
                    size={20}
                  />
                )}
                {player.amulet && (
                  <WerewolfSymbol
                    id="amulet"
                    label={t("werewolfSymbols.items.amulet.name")}
                    size={20}
                  />
                )}
                {player.drunk && player.alive && (
                  <WerewolfSymbol
                    id="drunk"
                    label={t("werewolfSymbols.items.drunk.name")}
                    size={20}
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
