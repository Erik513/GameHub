import { useTranslation } from "react-i18next";
import {
  causesOf,
  describePlayers,
  variantsOf,
  type PlayerTone,
  type PlayerView,
} from "../../business/games/werewolf/selectors";
import type { RoleVariantId } from "../../business/games/werewolf/roleVariant";
import type { WerewolfState } from "../../business/games/werewolf/stateMachine";
import type { DeathCause } from "../../business/games/werewolf/eventLog";
import { effectsOfPerson, type CardEffect } from "../../business/games/werewolf/narratorCard";
import { VariantMark } from "./VariantMark";
import type { SymbolId } from "./symbols/catalog";
import { WerewolfSymbol } from "./symbols/WerewolfSymbol";

const tones: readonly PlayerTone[] = ["alive", "wolf", "attacked", "saved", "wounded", "dead"];
const frames = ["amulet", "drunk"] as const;

/** The slot that already shows the ability that hit a person, so the sign of the cause is not repeated. */
const causeEffect: Partial<Record<DeathCause, CardEffect>> = {
  hammer: "hammered",
  magicianKill: "spellKilled",
  witchPoison: "poisoned",
  wolves: "attacked",
};

/** The symbol of the ability that hit a person (the legend of the symbols has them all). */
const causeSymbol: Record<DeathCause, SymbolId> = {
  heartbreak: "lovers",
  hammer: "hammer",
  hammerBackfire: "hammer",
  hunter: "shotDuty",
  magicianKill: "kill",
  toughGuy: "wounded",
  vote: "vote",
  witchPoison: "poisoned",
  wolves: "attacked",
};

/**
 * Players with their true role (private to the narrator), in the order they are given. The background says the state of
 * the person (alive, werewolf, attacked, saved, wounded, dead), a frame says the amulet (gold) or the drunk who does not
 * know his role yet (green). Every state also has its sign, so the color is never the only hint.
 */
export function PlayerList({
  players,
  effects,
}: {
  readonly players: readonly PlayerView[];
  /** The states of each person as slots (by name); without it the rows show no slots (the end of the game). */
  readonly effects?: ReadonlyMap<string, readonly CardEffect[]>;
}) {
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
            {player.alive && player.delayedDeathNight !== null && (
              <WerewolfSymbol
                id="wounded"
                label={t("werewolfSymbols.items.wounded.name")}
                size={14}
              />
            )}
            {/* Every state he carries, as the same colored slots as on the card of the role. */}
            {(effects?.get(player.name) ?? []).map((effect) => (
              <span className="ww-slot ww-overview__slot" data-effect={effect} key={effect}>
                <WerewolfSymbol
                  id={effect}
                  label={t(`werewolfSymbols.items.${effect}.name`)}
                  size={12}
                />
              </span>
            ))}
            {/* How he became a victim: the ability that hit him (the signs of the lovers, the wound, the last shot and a
                slot of the same ability already stand here and are not repeated). */}
            {player.causes
              .filter(
                (cause) =>
                  !(cause === "heartbreak" && player.partner !== null) &&
                  !(cause === "toughGuy" && player.delayedDeathNight !== null) &&
                  !(cause === "hunter" && player.lastShot) &&
                  !(causeEffect[cause] && effects?.get(player.name)?.includes(causeEffect[cause])),
              )
              .map((cause) => (
                <WerewolfSymbol
                  id={causeSymbol[cause]}
                  key={cause}
                  label={t(`werewolfNarrator.cause.${cause}`)}
                  size={14}
                />
              ))}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** The legend: what the colors and the frames of the rows say. */
export function PlayerLegend({
  variants = [],
  causes = [],
  effects = [],
}: {
  readonly variants?: readonly RoleVariantId[];
  readonly causes?: readonly DeathCause[];
  readonly effects?: readonly CardEffect[];
}) {
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
      {/* The states people carry now, each with its slot. */}
      {effects.map((effect) => (
        <li key={effect}>
          <span className="ww-slot ww-overview__slot" data-effect={effect}>
            <WerewolfSymbol id={effect} size={12} />
          </span>
          {t(`werewolfSymbols.items.${effect}.name`)}
        </li>
      ))}
      {/* How people became victims in this game, each ability with its sign. */}
      {causes.map((cause) => (
        <li key={cause}>
          <WerewolfSymbol id={causeSymbol[cause]} size={14} />
          {t(`werewolfNarrator.cause.${cause}`)}
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
export function PlayerRows({
  state,
  announce = true,
}: {
  readonly state: WerewolfState;
  /** False for the overview with a decision that was just made: the victims of the night are not announced yet. */
  readonly announce?: boolean;
}) {
  const players = [...describePlayers(state, announce)].sort((one, other) =>
    one.name.localeCompare(other.name, undefined, { sensitivity: "base" }),
  );
  const effects = new Map(players.map((player) => [player.name, effectsOfPerson(state, player)]));
  return (
    <div className="ww-players">
      <PlayerList effects={effects} players={players} />
      <PlayerLegend
        causes={causesOf(players)}
        effects={[...new Set([...effects.values()].flat())]}
        variants={variantsOf(players)}
      />
    </div>
  );
}
