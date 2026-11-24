import { useTranslation } from "react-i18next";
import { describePlayers, type PlayerTone } from "../../business/games/werewolf/selectors";
import type { WerewolfState } from "../../business/games/werewolf/stateMachine";
import { WerewolfSymbol } from "./symbols/WerewolfSymbol";

const tones: readonly PlayerTone[] = ["alive", "wolf", "attacked", "saved", "wounded", "dead"];
const frames = ["amulet", "drunk"] as const;

interface PlayerRowsProps {
  readonly state: WerewolfState;
  /** By name, or the living first and then the dead (each part by name), like at the end of the game. */
  readonly order?: "name" | "aliveFirst";
}

/**
 * All players with their true role (private to the narrator). The background says the state of the person (alive, werewolf,
 * attacked, saved, wounded, dead), a frame says the amulet (gold) or the drunk who does not know his role yet (green).
 * Every state also has its sign, so the color is never the only hint. The legend explains the colors and frames.
 */
export function PlayerRows({ state, order = "name" }: PlayerRowsProps) {
  const { t } = useTranslation();
  const byName = (one: { name: string }, other: { name: string }) =>
    one.name.localeCompare(other.name, undefined, { sensitivity: "base" });
  const players = [...describePlayers(state)].sort((one, other) => {
    if (order === "aliveFirst") {
      const gone = Number(one.tone === "dead") - Number(other.tone === "dead");
      if (gone !== 0) return gone;
    }
    return byName(one, other);
  });
  return (
    <div className="ww-players">
      <ul className="ww-overview">
        {players.map((player) => (
          <li
            className="ww-overview__row"
            data-amulet={player.amulet || undefined}
            data-drunk={player.drunk || undefined}
            data-tone={player.tone}
            key={player.name}
          >
            <WerewolfSymbol id={player.role} size={20} />
            <span className="ww-overview__who">
              <strong>{player.name}</strong>
              <small>{t(`werewolfSymbols.items.${player.role}.name`)}</small>
            </span>
            <span className="ww-overview__marks">
              {player.lastShot && (
                <WerewolfSymbol
                  id="shotDuty"
                  label={t("werewolfNarrator.bar.lastShot")}
                  size={14}
                />
              )}
              {player.tone === "dead" && (
                <WerewolfSymbol id="dead" label={t("werewolfSymbols.items.dead.name")} size={14} />
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
      <ul aria-label={t("werewolfNarrator.bar.legend.title")} className="ww-overview__legend">
        {tones.map((tone) => (
          <li key={tone}>
            <span className="ww-overview__swatch" data-tone={tone} />
            {t(`werewolfNarrator.bar.legend.${tone}`)}
          </li>
        ))}
        {frames.map((frame) => (
          <li key={frame}>
            <span className="ww-overview__swatch" data-frame={frame} />
            {t(`werewolfNarrator.bar.legend.${frame}`)}
          </li>
        ))}
      </ul>
    </div>
  );
}
