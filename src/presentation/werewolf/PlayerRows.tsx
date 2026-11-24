import { useTranslation } from "react-i18next";
import {
  describePlayers,
  variantsOf,
  type PlayerTone,
  type PlayerView,
} from "../../business/games/werewolf/selectors";
import type { RoleVariantId } from "../../business/games/werewolf/roleVariant";
import type { WerewolfState } from "../../business/games/werewolf/stateMachine";
import { VariantMark } from "./VariantMark";
import { WerewolfSymbol } from "./symbols/WerewolfSymbol";

const tones: readonly PlayerTone[] = ["alive", "wolf", "attacked", "saved", "wounded", "dead"];
const frames = ["amulet", "drunk"] as const;

/**
 * Players with their true role (private to the narrator), in the order they are given. The background says the state of
 * the person (alive, werewolf, attacked, saved, wounded, dead), a frame says the amulet (gold) or the drunk who does not
 * know his role yet (green). Every state also has its sign, so the color is never the only hint.
 */
export function PlayerList({ players }: { readonly players: readonly PlayerView[] }) {
  const { t } = useTranslation();
  return (
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
            <small>
              {t(`werewolfSymbols.items.${player.role}.name`)}
              {player.variant && <VariantMark variant={player.variant} />}
            </small>
          </span>
          <span className="ww-overview__marks">
            {player.lastShot && (
              <WerewolfSymbol id="shotDuty" label={t("werewolfNarrator.bar.lastShot")} size={14} />
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
              <WerewolfSymbol id="drunk" label={t("werewolfSymbols.items.drunk.name")} size={14} />
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** The legend: what the colors and the frames of the rows say. */
export function PlayerLegend({ variants = [] }: { readonly variants?: readonly RoleVariantId[] }) {
  const { t } = useTranslation();
  return (
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
      {/* The variants of the roles that are in this game, each with its sign. */}
      {variants.map((variant) => (
        <li key={variant}>
          <VariantMark decorative variant={variant} />
          {t(`werewolfNarrator.variant.${variant}`)}
        </li>
      ))}
    </ul>
  );
}

/** All players by name with the legend below (the overview of the narrator). */
export function PlayerRows({ state }: { readonly state: WerewolfState }) {
  const players = [...describePlayers(state)].sort((one, other) =>
    one.name.localeCompare(other.name, undefined, { sensitivity: "base" }),
  );
  return (
    <div className="ww-players">
      <PlayerList players={players} />
      <PlayerLegend variants={variantsOf(players)} />
    </div>
  );
}
