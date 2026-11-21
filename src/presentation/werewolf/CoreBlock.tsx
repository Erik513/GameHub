import { useTranslation } from "react-i18next";
import { ConfigCardHead } from "./ConfigInfo";
import { WerewolfSymbol } from "./symbols/WerewolfSymbol";
import { GeneralSettings, type GeneralRules } from "./GeneralSettings";

/** One wolf count the narrator can pick. */
export interface WolfOption {
  readonly count: number;
  /** Not pickable now (no game is possible with it, or there is nothing to choose). */
  readonly disabled: boolean;
  readonly recommended: boolean;
  readonly selected: boolean;
}

interface CoreBlockProps {
  /** True when there is nothing to choose (only one wolf count is possible). */
  readonly fixedWolves: boolean;
  readonly onPickWolves: (count: number) => void;
  readonly onRule: (key: keyof GeneralRules, value: boolean) => void;
  readonly rules: GeneralRules;
  /** The number of villagers, or the range the draw can leave. */
  readonly villagers: string;
  readonly wolves: readonly WolfOption[];
}

/**
 * The top of the configuration, the same for fixed and variable roles, in two columns: the left, two thirds wide,
 * is one box with the werewolves and the rule when they attack first; the right has the villagers (the number the
 * line-up leaves) and the seer (always one) as two cards to read.
 */
export function CoreBlock({
  fixedWolves,
  onPickWolves,
  onRule,
  rules,
  villagers,
  wolves,
}: CoreBlockProps) {
  const { t } = useTranslation();
  return (
    <div className="ww-core">
      <section className="ww-core__wolves">
        <section className="ww-card ww-card--wolves">
          <ConfigCardHead
            id="wolves"
            name={t("werewolfConfig.wolves")}
            title={t("werewolfConfig.wolves")}
          />
          <div aria-label={t("werewolfConfig.wolves")} className="ww-wolves" role="group">
            {wolves.map((option) => (
              <div className="ww-wolves__option" key={option.count}>
                <button
                  aria-pressed={option.selected}
                  className="ww-wolves__button"
                  data-fixed={fixedWolves || undefined}
                  data-recommended={option.recommended || undefined}
                  disabled={option.disabled}
                  onClick={() => {
                    if (!fixedWolves) onPickWolves(option.count);
                  }}
                  type="button"
                >
                  <WerewolfSymbol id="wolf" size={22} />
                  {option.count}
                </button>
                <small>{option.recommended ? t("werewolfConfig.recommended") : " "}</small>
              </div>
            ))}
          </div>
        </section>
        <GeneralSettings onChange={onRule} rules={rules} />
      </section>
      <div aria-label={t("werewolfConfig.villagers")} className="ww-card ww-stat" role="group">
        <ConfigCardHead
          id="villagers"
          name={t("werewolfConfig.villagers")}
          title={t("werewolfConfig.villagersTitle")}
        />
        <strong className="ww-stat__value ww-villagers__number">
          <WerewolfSymbol id="villager" size={24} />
          {villagers}
        </strong>
      </div>
      <div aria-label={t("werewolfConfig.seer")} className="ww-card ww-stat" role="group">
        <ConfigCardHead
          id="seer"
          name={t("werewolfConfig.seer")}
          title={t("werewolfConfig.seer")}
        />
        <strong className="ww-stat__value">
          <WerewolfSymbol id="seer" size={24} />1
        </strong>
      </div>
    </div>
  );
}
