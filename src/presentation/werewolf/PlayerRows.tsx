import { useRef, type ReactNode, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import {
  causesOf,
  describePlayers,
  variantsOf,
  type PlayerFrame,
  type PlayerTone,
  type PlayerView,
} from "../../business/games/werewolf/selectors";
import type { RoleVariantId } from "../../business/games/werewolf/roleVariant";
import type { WerewolfState } from "../../business/games/werewolf/stateMachine";
import type { DeathCause } from "../../business/games/werewolf/eventLog";
import { effectsOfPerson, type CardEffect } from "../../business/games/werewolf/narratorCard";
import { stateIds } from "../../business/games/werewolf/roles/stateIds";
import { VariantMark } from "./VariantMark";
import type { SymbolId } from "./symbols/catalog";
import {
  causeLook,
  causeSlotStyle,
  slotStyle,
  wonSlotStyle,
  type CauseSlot,
} from "./symbols/stateLook";
import { WerewolfSymbol } from "./symbols/WerewolfSymbol";
import { useWholeGridRows } from "./useWholeGridRows";

/** The backgrounds and frames of a row in the order of the legend. */
const allTones: readonly PlayerTone[] = ["alive", "wolf", "attacked", "saved", "wounded", "dead"];
const allFrames: readonly PlayerFrame[] = ["amulet", "drunk"];

/**
 * The state whose slot names a cause of death (in its color): the attack of the wolves, the poison, the death spell, the
 * hammer, the broken heart of the lovers and the wound of the tough guy. The vote and the shot of the hunter have no
 * state; they have a color of their own (see `causeLook`).
 */
const causeEffect: Partial<Record<DeathCause, CardEffect>> = {
  hammer: "hammered",
  hammerBackfire: "hammered",
  heartbreak: "lovers",
  magicianKill: "spellKilled",
  toughGuy: "wounded",
  witchPoison: "poisoned",
  wolves: "attacked",
};

/**
 * The slots that name why a person is out or marked, also when the state of the night is over: each once, in the fixed
 * order of the states (not in the order in which they happened).
 */
function causeSlotsOf(player: PlayerView): readonly CardEffect[] {
  const named = new Set(player.causes.map((cause) => causeEffect[cause]));
  return stateIds.filter((state) => named.has(state));
}

/** The other slots of a person, in the fixed order of the states. */
function otherSlotsOf(player: PlayerView, states: readonly CardEffect[]): readonly CardEffect[] {
  const causes = causeSlotsOf(player);
  return states.filter((state) => !causes.includes(state));
}

/** A cause of death without a state that is shown as a colored slot (the vote, the shot of the hunter). */
const isCauseSlot = (cause: DeathCause): cause is CauseSlot => Object.hasOwn(causeLook, cause);

/** The fixed order of the causes without a state: in the order of their colors (the vote, then the shot). */
const causeRank = (cause: DeathCause): number => {
  const rank = Object.keys(causeLook).indexOf(cause);
  return rank < 0 ? Number.MAX_SAFE_INTEGER : rank;
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
  const slot = (effect: CardEffect) => (
    <span
      className="ww-slot ww-overview__slot"
      data-effect={effect}
      key={effect}
      style={slotStyle(effect)}
    >
      <WerewolfSymbol id={effect} label={t(`werewolfSymbols.items.${effect}.name`)} size={12} />
    </span>
  );
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
            {/* The line fills from the right like the card. A person who is out has the gravestone at the very right and
                the cause of death right next to it (a slot that names the cause, such as the poison, moves there too);
                the other states follow to the left. */}
            {player.tone === "dead" && (
              <WerewolfSymbol id="dead" label={t("werewolfSymbols.items.dead.name")} size={14} />
            )}
            {/* The tanner who has won: his trophy in gold, right next to the gravestone. */}
            {player.wonAsTanner && (
              <span className="ww-slot ww-overview__slot" data-won="tanner" style={wonSlotStyle}>
                <WerewolfSymbol
                  id="tanner"
                  label={t("werewolfNarrator.bar.legend.tannerWon")}
                  size={12}
                />
              </span>
            )}
            {/* Why he is out or marked, as the slot of its state in its color (also when the state of the night is over,
                and at the end of the game); the vote and the shot in their own colors. */}
            {causeSlotsOf(player).map(slot)}
            {player.causes
              .filter((cause) => !causeEffect[cause] && !(cause === "hunter" && player.lastShot))
              .sort((one, other) => causeRank(one) - causeRank(other))
              .map((cause) =>
                isCauseSlot(cause) ? (
                  <span
                    className="ww-slot ww-overview__slot"
                    data-cause={cause}
                    key={cause}
                    style={causeSlotStyle(cause)}
                  >
                    <WerewolfSymbol
                      id={causeSymbol[cause]}
                      label={t(`werewolfNarrator.cause.${cause}`)}
                      size={12}
                    />
                  </span>
                ) : (
                  <WerewolfSymbol
                    id={causeSymbol[cause]}
                    key={cause}
                    label={t(`werewolfNarrator.cause.${cause}`)}
                    size={14}
                  />
                ),
              )}
            {player.lastShot && (
              <WerewolfSymbol id="shotDuty" label={t("werewolfNarrator.bar.lastShot")} size={14} />
            )}
            {/* Every other state he carries, as the same colored slots as on the card of the role. */}
            {otherSlotsOf(player, effects?.get(player.name) ?? []).map(slot)}
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
 * the causes of death and the variants of the roles. It explains only what the rows of these players show; a group
 * without entries is left out.
 */
export function PlayerLegend({
  players,
  effects = [],
}: {
  readonly players: readonly PlayerView[];
  /** The states the rows show as slots (without the slots that name a cause of death). */
  readonly effects?: readonly CardEffect[];
}) {
  const { t } = useTranslation();
  const tones = allTones.filter((tone) => players.some((player) => player.tone === tone));
  const frames = allFrames.filter((frame) => players.some((player) => player[frame]));
  const causes = causesOf(players);
  const variants: readonly RoleVariantId[] = variantsOf(players);
  const tannerWon = players.some((player) => player.wonAsTanner);
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
      {group("effects", [
        ...(tannerWon
          ? [
              <li key="tannerWon">
                <span className="ww-slot ww-overview__slot" data-won="tanner" style={wonSlotStyle}>
                  <WerewolfSymbol id="tanner" size={12} />
                </span>
                {t("werewolfNarrator.bar.legend.tannerWon")}
              </li>,
            ]
          : []),
        ...effects.map((effect) => (
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
      ])}
      {group(
        "causes",
        causes.map((cause) => (
          <li key={cause}>
            {isCauseSlot(cause) ? (
              <span
                className="ww-slot ww-overview__slot"
                data-cause={cause}
                style={causeSlotStyle(cause)}
              >
                <WerewolfSymbol id={causeSymbol[cause]} size={12} />
              </span>
            ) : causeEffect[cause] ? (
              <span
                className="ww-slot ww-overview__slot"
                data-effect={causeEffect[cause]}
                style={slotStyle(causeEffect[cause])}
              >
                <WerewolfSymbol id={causeEffect[cause]} size={12} />
              </span>
            ) : (
              <WerewolfSymbol id={causeSymbol[cause]} size={14} />
            )}
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
        // Each slot once, where the rows show it: a slot that names a cause of death is explained with the causes.
        effects={stateIds.filter((state) =>
          players.some((player) =>
            otherSlotsOf(player, effects.get(player.name) ?? []).includes(state),
          ),
        )}
        players={players}
      />
    </div>
  );
}
