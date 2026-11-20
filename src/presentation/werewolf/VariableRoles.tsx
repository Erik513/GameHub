import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  describeVariableConfiguration,
  setVariableRoleRange,
  toggleVariableWolfCount,
  type VariableDraft,
  type VariableEntryView,
  type VariableItemView,
  type VariableState,
} from "../../business/games/werewolf/variableConfiguration";
import { Button } from "../components";
import { TabPane } from "../game-kit";
import { ConfigCardHead } from "./ConfigInfo";

interface VariableRolesProps {
  readonly draft: VariableDraft;
  /** The switch between fixed and variable roles; it stays in place above the boxes. */
  readonly modeSwitch: ReactNode;
  readonly onChange: (draft: VariableDraft) => void;
  /** The number of players besides the narrator. */
  readonly players: number;
}

const states: readonly VariableState[] = ["must", "may", "not"];

/**
 * The variable roles: at the top (they stay in place) the switch, the wolves with the counts that can be
 * drawn and the seer, below them the roles in three boxes (must, may, should not be in the game) and the
 * extras in three boxes of another color, at the bottom (it stays in place, too) the number of "may" roles
 * that is drawn. Only the roles that exist for this number of players are shown.
 */
export function VariableRoles({ draft, modeSwitch, onChange, players }: VariableRolesProps) {
  const { t } = useTranslation();
  const view = describeVariableConfiguration(players, draft);

  const roleLabel = (entry: VariableEntryView) => {
    const name = t(`werewolfConfig.roles.${entry.entry.role}`);
    const option = entry.entry.id.split(":")[1];
    return option === undefined
      ? name
      : `${name} · ${t(`werewolfConfig.variants.${option}` as "werewolfConfig.variants.hammer")}`;
  };
  const itemLabel = (item: VariableItemView) => t(`werewolfConfig.addons.${item.item}`);

  const box = (kind: "item" | "role", state: VariableState, chips: readonly ReactNode[]) => (
    <section
      aria-label={`${t(kind === "item" ? "werewolfConfig.extrasHeading" : "werewolfConfig.variable.rolesHeading")}: ${t(`werewolfConfig.variable.box.${state}`)}`}
      className="ww-vbox"
      data-kind={kind}
      data-state={state}
      key={state}
    >
      <h4 className="ww-vbox__title">{t(`werewolfConfig.variable.box.${state}`)}</h4>
      <div className="ww-vbox__chips">
        {chips.length > 0 ? (
          chips
        ) : (
          <span className="ww-vbox__empty">{t("werewolfConfig.variable.empty")}</span>
        )}
      </div>
    </section>
  );

  const header = (
    <div className="ww-players-head">
      {modeSwitch}
      <section className="ww-card ww-card--wolves">
        <ConfigCardHead
          id="wolves"
          name={t("werewolfConfig.wolves")}
          title={t("werewolfConfig.wolves")}
        />
        <div aria-label={t("werewolfConfig.wolves")} className="ww-wolves" role="group">
          {view.wolf.options.map((option) => (
            <div className="ww-wolves__option" key={option.count}>
              <button
                aria-pressed={option.selected}
                className="ww-wolves__button"
                data-fixed={!view.wolf.choice || undefined}
                data-recommended={option.recommended || undefined}
                disabled={!view.wolf.choice}
                onClick={() => onChange(toggleVariableWolfCount(draft, players, option.count))}
                type="button"
              >
                {option.count}
              </button>
              <small>{option.recommended ? t("werewolfConfig.recommended") : " "}</small>
            </div>
          ))}
        </div>
      </section>
      <div className="ww-cards">
        <div aria-label={t("werewolfConfig.seer")} className="ww-card ww-stat" role="group">
          <ConfigCardHead
            id="seer"
            name={t("werewolfConfig.seer")}
            title={t("werewolfConfig.seer")}
          />
          <strong className="ww-stat__value">1</strong>
        </div>
      </div>
    </div>
  );

  const footer = (
    <section aria-label={t("werewolfConfig.variable.rangeTitle")} className="ww-range">
      <h4 className="ww-range__title">{t("werewolfConfig.variable.rangeTitle")}</h4>
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
              const low = which === "minimum" ? possible.minimum : view.range.minimum;
              const high = which === "minimum" ? view.range.maximum : possible.maximum;
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
          <p className="ww-range__hint">
            {t("werewolfConfig.variable.rangePossible", {
              maximum: view.possibleRange.maximum,
              minimum: view.possibleRange.minimum,
            })}
          </p>
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
      <h3 className="ww-vheading">{t("werewolfConfig.variable.rolesHeading")}</h3>
      <div className="ww-vboxes">
        {states.map((state) =>
          box(
            "role",
            state,
            view.entries
              .filter((entry) => entry.state === state)
              .map((entry) => (
                <span className="ww-chip" data-lock={entry.lock ?? undefined} key={entry.entry.id}>
                  {roleLabel(entry)}
                </span>
              )),
          ),
        )}
      </div>
      {view.items.length > 0 && (
        <>
          <h3 className="ww-vheading">{t("werewolfConfig.extrasHeading")}</h3>
          <div className="ww-vboxes">
            {states.map((state) =>
              box(
                "item",
                state,
                view.items
                  .filter((item) => item.state === state)
                  .map((item) => (
                    <span className="ww-chip" data-lock={item.lock ?? undefined} key={item.item}>
                      {itemLabel(item)}
                    </span>
                  )),
              ),
            )}
          </div>
        </>
      )}
    </TabPane>
  );
}
