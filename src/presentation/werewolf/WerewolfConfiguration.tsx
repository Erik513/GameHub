import { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  describeFixedConfiguration,
  setFixedSetting,
  setFixedWolfCount,
  type FixedDraft,
} from "../../business/games/werewolf/fixedConfiguration";
import { werewolfPlayerLimits } from "../../business/games/werewolf/configuration";
import {
  describeVariableConfiguration,
  setVariableRule,
  toggleVariableWolfCount,
  type VariableDraft,
} from "../../business/games/werewolf/variableConfiguration";
import { ChoiceGroup, SetupScreen, useFocusOnShow } from "../game-kit";
import { CoreBlock } from "./CoreBlock";
import { FixedRoles } from "./FixedRoles";
import { VariableRoles } from "./VariableRoles";
import { WakeOrderButton } from "./WakeOrderButton";

/** The kind of roles: the narrator picks them (fixed) or the system draws among the allowed ones (variable). */
export type RolesMode = "fixed" | "variable";

interface WerewolfConfigurationProps {
  readonly draft: FixedDraft;
  readonly mode: RolesMode;
  readonly onChange: (draft: FixedDraft) => void;
  readonly onDone: () => void;
  readonly onModeChange: (mode: RolesMode) => void;
  /** The draft of the variable roles; it is kept apart from the fixed one. */
  readonly onVariableChange: (draft: VariableDraft) => void;
  readonly variableDraft: VariableDraft;
  /** The number of players besides the narrator. */
  readonly players: number;
}

/**
 * The configuration in two tabs. "Roles": the fixed roles or the variable roles (a switch at the top chooses), see
 * `FixedRoles` and `VariableRoles`. "Settings": the general rules, see `GeneralSettings`. Nothing is chosen by
 * itself: a choice that no longer fits (for example after a change of the players) is shown as an issue with a
 * button for a fitting wolf count, and the narrator decides.
 */
export function WerewolfConfiguration({
  draft,
  mode,
  onChange,
  onDone,
  onModeChange,
  onVariableChange,
  players,
  variableDraft,
}: WerewolfConfigurationProps) {
  const { t } = useTranslation();
  const focus = useFocusOnShow<HTMLElement>();
  // Only the view of the shown kind of roles is worked out, and only when its draft changes: the analysis is the
  // costly part of a tap.
  const fixedView = useMemo(
    () => (mode === "fixed" ? describeFixedConfiguration(players, draft) : undefined),
    [mode, players, draft],
  );
  const variableView = useMemo(
    () => (mode === "variable" ? describeVariableConfiguration(players, variableDraft) : undefined),
    [mode, players, variableDraft],
  );
  const supported = (fixedView ?? variableView)?.supported ?? false;

  const modeSwitch = (
    <ChoiceGroup
      hideLegend
      initial={mode}
      legend={t("werewolfConfig.modeLabel")}
      name="mode"
      onChange={(value) => onModeChange(value === "variable" ? "variable" : "fixed")}
      options={[
        { label: t("werewolfConfig.modeFixed"), value: "fixed" },
        { label: t("werewolfConfig.modeVariable"), value: "variable" },
      ]}
      value={mode}
    />
  );

  // The general rules belong to the draft of the mode that is shown.
  const rules =
    mode === "variable"
      ? variableDraft.rules
      : { attackOnFirstNight: draft.settings.attackOnFirstNight };
  const setRule = (key: "attackOnFirstNight", value: boolean) =>
    mode === "variable"
      ? onVariableChange(setVariableRule(variableDraft, key, value))
      : onChange(setFixedSetting(draft, key, value));

  // A thin space on both sides keeps the dash apart from the numbers.
  const range = (low: number, high: number) =>
    low === high ? String(low) : `${low}\u2009–\u2009${high}`;

  // The top is the same for both kinds of roles; only what it shows differs.
  const top = (
    <CoreBlock
      fixedWolves={variableView ? !variableView.wolf.choice : (fixedView?.wolf.fixed ?? true)}
      onPickWolves={(count) =>
        variableView
          ? onVariableChange(toggleVariableWolfCount(variableDraft, players, count))
          : onChange(setFixedWolfCount(draft, count))
      }
      onRule={setRule}
      rules={rules}
      villagers={
        variableView
          ? range(variableView.villagers.minimum, variableView.villagers.maximum)
          : String(fixedView?.villagers ?? 0)
      }
      wolves={
        variableView
          ? variableView.wolf.options.map((option) =>
              // Only one wolf count is possible: it is shown as chosen (filled, readable), like in the fixed mode, and
              // without "recommended" (there is nothing to choose).
              variableView.wolf.choice
                ? {
                    count: option.count,
                    disabled: !option.selected && !option.canStart,
                    recommended: option.recommended,
                    selected: option.selected,
                  }
                : {
                    count: option.count,
                    disabled: false,
                    recommended: false,
                    selected: true,
                  },
            )
          : (fixedView?.wolf.options ?? []).map((option) => ({
              count: option.count,
              disabled: !option.selectable && !option.selected,
              // With only one possible count there is nothing to recommend.
              recommended: option.recommended && (fixedView?.wolf.options.length ?? 0) > 1,
              selected: option.selected,
            }))
      }
    />
  );

  const rolesView: ReactNode = variableView ? (
    <VariableRoles
      draft={variableDraft}
      modeSwitch={modeSwitch}
      onChange={onVariableChange}
      players={players}
      top={top}
      view={variableView}
    />
  ) : fixedView ? (
    <FixedRoles
      draft={draft}
      modeSwitch={modeSwitch}
      onChange={onChange}
      top={top}
      view={fixedView}
    />
  ) : null;

  // The settings frame of every game: the roles in the form, "Done" at the bottom, the wake-up order left of it.
  return (
    <SetupScreen
      className="ww-config focus-target"
      formId="werewolf-config-form"
      label={t("werewolfConfig.label")}
      messages={
        supported ? undefined : (
          <p className="ww-hint">
            {players > werewolfPlayerLimits.targetMaximum
              ? t("werewolfConfig.tooManyPlayers", {
                  count: players,
                  maximum: werewolfPlayerLimits.targetMaximum,
                })
              : t("werewolfConfig.tooFewPlayers", { count: players })}
          </p>
        )
      }
      onSubmit={(event) => {
        event.preventDefault();
        onDone();
      }}
      rootRef={focus}
      sideAction={<WakeOrderButton draft={draft} mode={mode} variableDraft={variableDraft} />}
      startLabel={t("werewolfConfig.done")}
    >
      {supported ? rolesView : null}
    </SetupScreen>
  );
}
