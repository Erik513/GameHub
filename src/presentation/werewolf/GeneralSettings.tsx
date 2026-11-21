import { useTranslation } from "react-i18next";
import { ChoiceGroup } from "../game-kit";

/** The general rules that both kinds of roles share. */
export interface GeneralRules {
  readonly attackOnFirstNight: boolean;
}

interface GeneralSettingsProps {
  readonly onChange: (key: keyof GeneralRules, value: boolean) => void;
  readonly rules: GeneralRules;
}

/** The general rules, in the box with the werewolves; for now only when the werewolves attack first. */
export function GeneralSettings({ onChange, rules }: GeneralSettingsProps) {
  const { t } = useTranslation();
  const legend = t("werewolfConfig.attackLabel");

  return (
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
  );
}
