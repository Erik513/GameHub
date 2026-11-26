import { useTranslation } from "react-i18next";
import { ChoiceGroup } from "../game-kit";
import type { NarratorLevel } from "./experiencedFlow";

/** The general rules that both kinds of roles share. */
export interface GeneralRules {
  readonly attackOnFirstNight: boolean;
}

interface GeneralSettingsProps {
  readonly onChange: (key: keyof GeneralRules, value: boolean) => void;
  readonly rules: GeneralRules;
  /** How much the narrator taps (not a rule of the game, so it is kept apart from the drafts of the roles). */
  readonly narrator?: {
    readonly level: NarratorLevel;
    readonly onChange: (level: NarratorLevel) => void;
  };
}

/** The general rules, in the box with the werewolves: when the werewolves attack first, and the level of the narrator. */
export function GeneralSettings({ narrator, onChange, rules }: GeneralSettingsProps) {
  const { t } = useTranslation();
  const legend = t("werewolfConfig.attackLabel");
  const narratorLegend = t("werewolfConfig.narratorLabel");

  return (
    <>
      <ChoiceGroup
        info={{
          closeLabel: t("werewolfConfig.infoClose"),
          label: t("werewolfConfig.infoLabel", { name: legend }),
          text: t("werewolfConfig.attackInfo"),
          title: legend,
        }}
        initial={rules.attackOnFirstNight ? "night1" : "night2"}
        legend={legend}
        name="attack"
        onChange={(value) => onChange("attackOnFirstNight", value === "night1")}
        options={[
          { label: t("werewolfConfig.attackNight1"), value: "night1" },
          { label: t("werewolfConfig.attackNight2"), value: "night2" },
        ]}
        value={rules.attackOnFirstNight ? "night1" : "night2"}
      />
      {narrator && (
        <ChoiceGroup
          info={{
            closeLabel: t("werewolfConfig.infoClose"),
            label: t("werewolfConfig.infoLabel", { name: narratorLegend }),
            text: t("werewolfConfig.narratorInfo"),
            title: narratorLegend,
          }}
          initial={narrator.level}
          legend={narratorLegend}
          name="narrator"
          onChange={(value) =>
            narrator.onChange(value === "experienced" ? "experienced" : "beginner")
          }
          options={[
            { label: t("werewolfConfig.narratorBeginner"), value: "beginner" },
            { label: t("werewolfConfig.narratorExperienced"), value: "experienced" },
          ]}
          value={narrator.level}
        />
      )}
    </>
  );
}
