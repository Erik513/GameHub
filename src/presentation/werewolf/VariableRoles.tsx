import { symbolOfInfo } from "./infoSymbol";
import { WerewolfSymbol } from "./symbols/WerewolfSymbol";
import type { RoleVariantId } from "../../business/games/werewolf/roleVariant";
import { VariantMark } from "./VariantMark";
import { variantGlyphs } from "./symbols/variantGlyphs";
import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  setVariableEntryState,
  setVariableItemState,
  setVariableRoleRange,
  type VariableConfigurationView,
  type VariableDraft,
  type VariableEntryView,
  type VariableItemView,
  type VariableState,
} from "../../business/games/werewolf/variableConfiguration";
import { Button, Dialog } from "../components";
import { InfoButton, TabPane, dropAttribute, usePlayerDrag } from "../game-kit";
import { ConfigInfo, type ConfigInfoId } from "./ConfigInfo";

interface VariableRolesProps {
  readonly draft: VariableDraft;
  /** The switch between fixed and variable roles; it stays in place above the boxes. */
  readonly modeSwitch: ReactNode;
  /** The top of the configuration (wolves, villagers, seer, the first attack): the same in both kinds of roles. */
  readonly top: ReactNode;
  /** What the screen shows for this draft (the frame holds it, as the top needs it, too). */
  readonly view: VariableConfigurationView;
  readonly onChange: (draft: VariableDraft) => void;
  /** The number of players besides the narrator. */
  readonly players: number;
}

const states: readonly VariableState[] = ["must", "may", "not"];

/** The fields to drop on: the three boxes (must, may, should not) take roles and extras alike. */
const dropOf = (state: VariableState) => states.indexOf(state);

/** The reasons an entry cannot be moved to "must" or "may" now. */
const lockText = {
  incompatibleRoles: "werewolfConfig.variable.lock.incompatibleRoles",
  insufficientSeats: "werewolfConfig.variable.lock.insufficientSeats",
  minimumPlayers: "werewolfConfig.variable.lock.incompatibleRoles",
  requiredAlternative: "werewolfConfig.variable.lock.requiredAlternative",
  requiredOption: "werewolfConfig.variable.lock.requiredOption",
} as const;

/**
 * The variable roles: at the top (they stay in place) the switch, the wolves with the counts that can be
 * drawn and the seer, below them the roles in three boxes (must, may, should not be in the game) and the
 * extras in three boxes of another color, at the bottom (it stays in place, too) the number of "may" roles
 * that is drawn. Only the roles that exist for this number of players are shown.
 */
export function VariableRoles({
  draft,
  modeSwitch,
  onChange,
  players,
  top,
  view,
}: VariableRolesProps) {
  const { t } = useTranslation();
  // The entry whose box is being chosen after a tap (an extra is "item:" and its name).
  const [picking, setPicking] = useState<string>();

  /**
   * Whether a box takes an entry or an extra: one that is locked can only leave the game, and "must" takes
   * nothing more once the seats are full (the most roles for this number of players).
   */
  function accepts(id: string, state: VariableState): boolean {
    const current = id.startsWith("item:")
      ? view.items.find((candidate) => `item:${candidate.item}` === id)
      : view.entries.find((candidate) => candidate.entry.id === id);
    if (!current) return false;
    if (current.lock !== null && state !== "not") return false;
    return !(state === "must" && current.mustBlocked);
  }

  /** Moves an entry or an extra to a box, when the box takes it. */
  function place(id: string, state: VariableState) {
    if (!accepts(id, state)) return;
    if (id.startsWith("item:")) {
      const item = view.items.find((candidate) => `item:${candidate.item}` === id);
      if (item) onChange(setVariableItemState(draft, item.item, state));
      return;
    }
    onChange(setVariableEntryState(draft, id, state));
  }

  const dragging = usePlayerDrag({
    onDrop: (id, target) => {
      if (target === "none") return;
      const state = states.find((candidate) => dropOf(candidate) === target);
      if (state) place(id, state);
    },
    onTap: setPicking,
  });

  const roleLabel = (entry: VariableEntryView) => {
    const name = t(`werewolfConfig.roles.${entry.entry.role}`);
    const option = entry.entry.id.split(":")[1];
    return option === undefined
      ? name
      : `${name} · ${t(`werewolfConfig.variants.${option}` as "werewolfConfig.variants.hammer")}`;
  };
  const itemLabel = (item: VariableItemView) => t(`werewolfConfig.addons.${item.item}`);
  // What a chip shows: the name of the role and, for an option of a role, its dashed sign instead of the words (the
  // words stay in the name for screen readers, in the window of the chip and in its "i").
  const chipFace = (id: string, label: string): ReactNode => {
    const [role, option] = id.split(":");
    if (id.startsWith("item:") || option === undefined || !(option in variantGlyphs)) return label;
    return (
      <>
        {t(`werewolfConfig.roles.${role}` as "werewolfConfig.roles.hunter")}
        <VariantMark decorative size={20} variant={option as RoleVariantId} />
      </>
    );
  };
  const labelOf = (id: string): string => {
    if (id.startsWith("item:")) {
      const item = view.items.find((candidate) => `item:${candidate.item}` === id);
      return item ? itemLabel(item) : "";
    }
    const entry = view.entries.find((candidate) => candidate.entry.id === id);
    return entry ? roleLabel(entry) : "";
  };
  // The explanation that belongs to an entry (the options of a role share the explanation of the role).
  const infoIdOf = (id: string): ConfigInfoId => {
    if (id.startsWith("item:")) return id.slice(5) as ConfigInfoId;
    const role = view.entries.find((candidate) => candidate.entry.id === id)?.entry.role;
    return role === "bodyguard" || role === "nightGuest" ? "guard" : (role ?? "seer");
  };
  // A chip is the name (to tap and to drag) with the "i" of the role beside it. An entry that is locked cannot be
  // moved: a tap shows why, it cannot be dragged.
  const chip = (id: string, label: string, lock: VariableEntryView["lock"]) => (
    <span
      className="ww-chip"
      data-dragged={dragging.drag?.player === id || undefined}
      data-kind={id.startsWith("item:") ? "item" : "role"}
      data-lock={lock ?? undefined}
      key={id}
    >
      <button
        aria-label={label}
        className="ww-chip__main"
        onClick={dragging.tap(id)}
        {...(lock === null ? { onPointerDown: dragging.startDrag(id) } : {})}
        type="button"
      >
        {chipFace(id, label)}
      </button>
      <ConfigInfo className="ww-chip__info" id={infoIdOf(id)} name={label} />
    </span>
  );

  const box = (state: VariableState, chips: readonly ReactNode[]) => (
    <section
      aria-label={`${t("werewolfConfig.variable.rolesHeading")}: ${t(`werewolfConfig.variable.box.${state}`)}`}
      className="ww-vbox"
      {...{ [dropAttribute]: String(dropOf(state)) }}
      data-over={
        (dragging.over === dropOf(state) &&
          dragging.drag !== undefined &&
          accepts(dragging.drag.player, state)) ||
        undefined
      }
      data-state={state}
      key={state}
    >
      <div className="ww-vbox__head">
        <h4 className="ww-vbox__title">{t(`werewolfConfig.variable.box.${state}`)}</h4>
        {state === "may" && (
          <InfoButton
            className="ww-vbox__info"
            closeLabel={t("werewolfConfig.infoClose")}
            label={t("werewolfConfig.variable.mayInfo.label")}
            text={`${t("werewolfConfig.variable.mayInfo.roles")}\n${t("werewolfConfig.variable.mayInfo.items")}`}
            title={t("werewolfConfig.variable.box.may")}
          />
        )}
      </div>
      <div className="ww-vbox__chips">{chips}</div>
    </section>
  );

  const header = (
    <div className="ww-players-head">
      {modeSwitch}
      {top}
      {/* The heading of the boxes stays in place: only the boxes below it scroll. */}
      <h3 className="ww-vheading">{t("werewolfConfig.variable.rolesHeading")}</h3>
    </div>
  );

  const footer = (
    <section aria-label={t("werewolfConfig.variable.rangeTitle")} className="ww-range">
      <div className="ww-range__head">
        <h4 className="ww-range__title">{t("werewolfConfig.variable.rangeTitle")}</h4>
        {view.possibleRange !== null && view.mayRoleCount > 0 && (
          <span className="ww-range__hint">
            {t("werewolfConfig.variable.rangePossible", {
              maximum: view.possibleRange.maximum,
              minimum: view.possibleRange.minimum,
            })}
          </span>
        )}
      </div>
      {view.mayRoleCount === 0 || view.possibleRange === null ? (
        <p className="ww-range__hint">{t("werewolfConfig.variable.rangeNone")}</p>
      ) : (
        <>
          <div className="ww-range__row">
            {(["minimum", "maximum"] as const).map((which) => {
              const value = view.range[which];
              const possible = view.possibleRange!;
              const label = t(`werewolfConfig.variable.${which}`);
              const set = (next: number) =>
                onChange(
                  setVariableRoleRange(
                    draft,
                    which === "minimum" ? next : view.range.minimum,
                    which === "maximum" ? next : view.range.maximum,
                  ),
                );
              const low =
                which === "minimum"
                  ? possible.minimum
                  : Math.max(view.range.minimum, view.maximumFloor);
              const high =
                which === "minimum"
                  ? Math.min(view.range.maximum, view.minimumCeiling)
                  : possible.maximum;
              return (
                <div className="ww-range__field" key={which}>
                  <span className="ww-range__label">{label}</span>
                  <div className="ww-range__stepper">
                    <Button
                      aria-label={t("werewolfConfig.variable.less", { what: label })}
                      disabled={value <= low}
                      onClick={() => set(value - 1)}
                      variant="secondary"
                    >
                      −
                    </Button>
                    <output aria-label={label}>{value}</output>
                    <Button
                      aria-label={t("werewolfConfig.variable.more", { what: label })}
                      disabled={value >= high}
                      onClick={() => set(value + 1)}
                      variant="secondary"
                    >
                      +
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      {!view.canStart && (
        <p className="ww-range__problem" role="alert">
          {t("werewolfConfig.variable.cannotStart", { count: players })}
        </p>
      )}
    </section>
  );

  return (
    <TabPane footer={footer} header={header}>
      <div className="ww-vboxes">
        {states.map((state) =>
          box(state, [
            ...view.entries
              .filter((entry) => entry.state === state)
              .map((entry) => chip(entry.entry.id, roleLabel(entry), entry.lock)),
            ...view.items
              .filter((item) => item.state === state)
              .map((item) => chip(`item:${item.item}`, itemLabel(item), item.lock)),
          ]),
        )}
      </div>
      <Dialog
        closeLabel={t("werewolfConfig.infoClose")}
        onClose={() => setPicking(undefined)}
        open={picking !== undefined}
        title={picking === undefined ? "" : labelOf(picking)}
        // The symbol of the role stands before its name, like in every info of a role.
        {...(picking === undefined
          ? {}
          : { titleIcon: <WerewolfSymbol id={symbolOfInfo(infoIdOf(picking))} size={28} /> })}
      >
        {picking !== undefined && (
          <div className="kit-pick">
            <div className="ww-pick-info">
              <ConfigInfo id={infoIdOf(picking)} name={labelOf(picking)} />
            </div>
            {(() => {
              const isItem = picking.startsWith("item:");
              const current = isItem
                ? view.items.find((item) => `item:${item.item}` === picking)
                : view.entries.find((entry) => entry.entry.id === picking);
              const lock = current?.lock ?? null;
              return (
                <>
                  {lock !== null && <p className="ww-range__hint">{t(lockText[lock])}</p>}
                  {lock === null && current?.mustBlocked === true && (
                    <p className="ww-range__hint">{t(lockText.insufficientSeats)}</p>
                  )}
                  {states.map((state) => (
                    <Button
                      aria-pressed={current?.state === state}
                      disabled={!accepts(picking, state)}
                      key={state}
                      onClick={() => {
                        place(picking, state);
                        setPicking(undefined);
                      }}
                      variant={current?.state === state ? "primary" : "secondary"}
                    >
                      {t(`werewolfConfig.variable.box.${state}`)}
                    </Button>
                  ))}
                </>
              );
            })()}
          </div>
        )}
      </Dialog>
      {dragging.drag && (
        <div
          aria-hidden="true"
          className="ww-chip ww-chip--ghost"
          data-kind={dragging.drag.player.startsWith("item:") ? "item" : "role"}
          style={{ left: dragging.drag.x, top: dragging.drag.y }}
        >
          <span className="ww-chip__main">
            {chipFace(dragging.drag.player, labelOf(dragging.drag.player))}
          </span>
          {/* A look-alike of the "i" of the chip, so it stays visible while the name is dragged. */}
          <span className="ww-chip__info-room">
            <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
              <path
                d="M12 11v5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2.2"
              />
              <circle cx="12" cy="7.8" r="1.3" fill="currentColor" />
            </svg>
          </span>
        </div>
      )}
    </TabPane>
  );
}
