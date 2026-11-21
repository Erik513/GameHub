import { useTranslation } from "react-i18next";
import { ChoiceGroup } from "../game-kit";

/** The general rules that both kinds of roles share. */
export interface GeneralRules {
  readonly attackOnFirstNight: boolean;
  readonly revealRoles: boolean;
}

interface GeneralSettingsProps {
  readonly onChange: (key: keyof GeneralRules, value: boolean) => void;
  readonly rules: GeneralRules;
}

/** The tab "Settings": when the werewolves attack first, and whether the role of a person who is out is revealed. */
export function GeneralSettings({ onChange, rules }: GeneralSettingsProps) {
  const { t } = useTranslation();
  const setRule = onChange;

  // The explanation of a general setting, in the window of its "i" button next to the heading.
  const settingInfo = (which: "attack" | "reveal", legend: string) => ({
    closeLabel: t("werewolfConfig.infoClose"),
    label: t("werewolfConfig.infoLabel", { name: legend }),
    text: t(which === "attack" ? "werewolfConfig.attackInfo" : "werewolfConfig.revealInfo"),
    title: legend,
  });

  return (
    <>
      <>
        <ChoiceGroup
          info={settingInfo("attack", t("werewolfConfig.attackLabel"))}
          initial={rules.attackOnFirstNight ? "night1" : "night2"}
          legend={t("werewolfConfig.attackLabel")}
          name="attack"
          onChange={(value) => setRule("attackOnFirstNight", value === "night1")}
          options={[
            { label: t("werewolfConfig.attackNight1"), value: "night1" },
            { label: t("werewolfConfig.attackNight2"), value: "night2" },
          ]}
          value={rules.attackOnFirstNight ? "night1" : "night2"}
        />
        <ChoiceGroup
          info={settingInfo("reveal", t("werewolfConfig.revealLabel"))}
          initial={rules.revealRoles ? "open" : "secret"}
          legend={t("werewolfConfig.revealLabel")}
          name="reveal"
          onChange={(value) => setRule("revealRoles", value === "open")}
          options={[
            { label: t("werewolfConfig.revealOpen"), value: "open" },
            { label: t("werewolfConfig.revealSecret"), value: "secret" },
          ]}
          value={rules.revealRoles ? "open" : "secret"}
        />
      </>
    </>
  );
}
