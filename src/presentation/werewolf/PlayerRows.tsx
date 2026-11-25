import { useRef, type ReactNode, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import {
  causesOf,
  describePlayers,
  legendOf,
  variantsOf,
  type PlayerFrame,
  type PlayerTone,
  type PlayerView,
} from "../../business/games/werewolf/selectors";
import type { RoleVariantId } from "../../business/games/werewolf/roleVariant";
import type { WerewolfState } from "../../business/games/werewolf/stateMachine";
import type { DeathCause } from "../../business/games/werewolf/eventLog";
import { effectsOfPerson, type CardEffect } from "../../business/games/werewolf/narratorCard";
import { VariantMark } from "./VariantMark";
import type { SymbolId } from "./symbols/catalog";
import { slotStyle } from "./symbols/stateLook";
import { WerewolfSymbol } from "./symbols/WerewolfSymbol";
import { useWholeGridRows } from "./useWholeGridRows";

const allTones: readonly PlayerTone[] = ["alive", "wolf", "attacked", "saved", "wounded", "dead"];
const allFrames: readonly PlayerFrame[] = ["amulet", "drunk"];

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
  listRef,
  listHeight,
}: {
  readonly players: readonly PlayerView[];
  /** The list element, for a window that shows whole rows only. */
  readonly listRef?: RefObject<HTMLUListElement | null>;
  /** The height of the list in whole rows (undefined: its own height). */
  readonly listHeight?: number | undefined;
  /** The states of each person as slots (by name); without it the rows show no slots (the end of the game). */
  readonly effects?: ReadonlyMap<string, readonly CardEffect[]>;
}) {
  const { t } = useTranslation();
  return (
    <ul
      className="ww-overview"
      ref={listRef}
      style={listHeight === undefined ? undefined : { flex: "none", height: listHeight }}
    >
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
            {/* Every state he carries, as the same colored slots as on the card of the role; the line fills from the
                right like the card, so the slots stand at the right and the other signs to the left of them. */}
            {(effects?.get(player.name) ?? []).map((effect) => (
              <span
                className="ww-slot ww-overview__slot"
                data-effect={effect}
                key={effect}
                style={slotStyle(effect)}
              >
                <WerewolfSymbol
                  id={effect}
                  label={t(`werewolfSymbols.items.${effect}.name`)}
                  size={12}
                />
              </span>
            ))}
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

/** The groups of the legend, each with a heading: what the background, the frame, a slot, a sign and a dashed sign say. */
type LegendGroup = "tones" | "frames" | "effects" | "causes" | "variants";

/**
 * The legend, divided into groups with a small heading each: the background of a row, its frame, the states (slots),
 * the causes of death and the variants of the roles. Only the states, causes and variants of this game are listed; a
 * group without entries is left out.
 */
export function PlayerLegend({
  variants = [],
  causes = [],
  effects = [],
  tones = allTones,
  frames = allFrames,
}: {
  readonly variants?: readonly RoleVariantId[];
  readonly causes?: readonly DeathCause[];
  readonly effects?: readonly CardEffect[];
  /** The backgrounds and frames this game has (see `legendOf`); all of them when not given. */
  readonly tones?: readonly PlayerTone[];
  readonly frames?: readonly PlayerFrame[];
}) {
  const { t } = useTranslation();
  const group = (id: LegendGroup, items: readonly ReactNode[]) =>
    items.length === 0 ? null : (
      <div className="ww-overview__legend-group" key={id}>
        <span className="ww-overview__legend-title">
          {t(`werewolfNarrator.bar.legend.groups.${id}`)}
        </span>
        <ul>{items}</ul>
      </div>
    );
  return (
    <div
      aria-label={t("werewolfNarrator.bar.legend.title")}
      className="ww-overview__legend"
      role="group"
    >
      {group(
        "tones",
        tones.map((tone) => (
          <li key={tone}>
            <span className="ww-overview__swatch" data-tone={tone} />
            {t(`werewolfNarrator.bar.legend.${tone}`)}
          </li>
        )),
      )}
      {group(
        "frames",
        frames.map((frame) => (
          <li key={frame}>
            <span className="ww-overview__swatch" data-frame={frame} />
            {t(`werewolfNarrator.bar.legend.${frame}`)}
          </li>
        )),
      )}
      {group(
        "effects",
        effects.map((effect) => (
          <li key={effect}>
            <span
              className="ww-slot ww-overview__slot"
              data-effect={effect}
              style={slotStyle(effect)}
            >
              <WerewolfSymbol id={effect} size={12} />
            </span>
            {t(`werewolfSymbols.items.${effect}.name`)}
          </li>
        )),
      )}
      {group(
        "causes",
        causes.map((cause) => (
          <li key={cause}>
            <WerewolfSymbol id={causeSymbol[cause]} size={14} />
            {t(`werewolfNarrator.cause.${cause}`)}
          </li>
        )),
      )}
      {group(
        "variants",
        variants.map((variant) => (
          <li key={variant}>
            <VariantMark decorative variant={variant} />
            {t(`werewolfNarrator.variant.${variant}`)}
          </li>
        )),
      )}
    </div>
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
  // The list in the window shows whole rows only and scrolls row by row.
  const list = useRef<HTMLUListElement>(null);
  const listHeight = useWholeGridRows(list, players.length);
  return (
    <div className="ww-players">
      <PlayerList effects={effects} listHeight={listHeight} listRef={list} players={players} />
      <PlayerLegend
        causes={causesOf(players)}
        effects={[...new Set([...effects.values()].flat())]}
        variants={variantsOf(players)}
        {...legendOf(state)}
      />
    </div>
  );
}
