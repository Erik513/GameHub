import type { FormEvent, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { TabooCategoryInfo } from "../../business/games/taboo/categories";
import type { ValidationIssue } from "../../business/games/taboo/model";
import type { TeamSetupValue } from "../../business/shared/teamSetup";
import { StatusMessage } from "../components";
import { ChoiceGroup, SetupScreen, SetupSection, TeamsSetup } from "../game-kit";
import { useCategoryLabel, useCategorySorter } from "./categoryLabel";
import { TabooRules } from "./TabooRules";
import {
  cardSources,
  difficulties,
  issueMessageKey,
  roundOption,
  type RoundChoice,
} from "./tabooSetupModel";

interface TabooSetupFormProps {
  categoryIds: readonly string[];
  categoryInfos: readonly TabooCategoryInfo[];
  children?: ReactNode;
  deckEmpty: boolean;
  generating: boolean;
  hasGenerators: boolean;
  issues: readonly ValidationIssue[];
  onChange: (event: FormEvent<HTMLFormElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  roundChoices: readonly RoundChoice[];
  shortage: { available: number; required: number } | undefined;
  /** What the player entered about teams and players. */
  teamSetup: TeamSetupValue;
  onTeamSetupChange: (value: TeamSetupValue) => void;
}

/** The setup form of a Taboo game with its error messages and the start button. */
export function TabooSetupForm({
  categoryIds,
  categoryInfos,
  children,
  deckEmpty,
  generating,
  hasGenerators,
  issues,
  onChange,
  onSubmit,
  onTeamSetupChange,
  roundChoices,
  shortage,
  teamSetup,
}: TabooSetupFormProps) {
  const { t } = useTranslation();
  const categoryLabel = useCategoryLabel(categoryInfos);
  const sortCategories = useCategorySorter(categoryInfos);
  const isStandard = (id: string) => categoryInfos.some((info) => info.id === id);
  const info = (
    key: "rounds" | "cardSource" | "tiebreak" | "skips" | "difficulty",
    legend: string,
  ) => ({
    closeLabel: t("settings.close"),
    label: t("tabooSetup.infoLabel", { setting: legend }),
    text: t(`tabooSetup.info.${key}`),
    title: legend,
  });

  const messages = (
    <>
      {shortage && (
        <StatusMessage title={t("tabooRound.empty")} tone="error">
          {t("tabooSetup.cardShortage", shortage)}
        </StatusMessage>
      )}
      {deckEmpty && (
        <StatusMessage title={t("tabooRound.empty")} tone="error">
          {t("tabooRound.emptyHint")}
        </StatusMessage>
      )}
      {issues.length > 0 && (
        <StatusMessage title={t("tabooSetup.invalidSetup")} tone="error">
          <ul>
            {issues.map((issue) => (
              <li key={issue.field + issue.code}>{t(issueMessageKey(issue))}</li>
            ))}
          </ul>
        </StatusMessage>
      )}
    </>
  );

  return (
    <SetupScreen
      formId="taboo-setup-form"
      messages={messages}
      onChange={onChange}
      onSubmit={onSubmit}
      startDisabled={generating}
      startLabel={t(generating ? "tabooSetup.preparingCards" : "tabooSetup.start")}
      toolbar={
        <>
          {children}
          <TabooRules />
        </>
      }
    >
      <SetupSection title={t("kitSetup.teamsSection")}>
        <TeamsSetup onChange={onTeamSetupChange} value={teamSetup} />
      </SetupSection>
      <SetupSection title={t("kitSetup.settingsSection")}>
        <ChoiceGroup
          info={info("rounds", t("tabooSetup.rounds"))}
          legend={t("tabooSetup.rounds")}
          name="rounds"
          initial={String(roundChoices.includes(3) ? 3 : roundChoices[0])}
          options={roundChoices.map((value) => roundOption(value, t))}
        />
        <ChoiceGroup
          legend={t("tabooSetup.duration")}
          name="duration"
          initial="60"
          options={["60", "90", "120"].map((value) => ({ value, label: value }))}
        />
        <ChoiceGroup
          info={info("skips", t("tabooSetup.skips"))}
          legend={t("tabooSetup.skips")}
          name="skips"
          initial="1"
          options={(["0", "1", "2", "3", "unlimited"] as const).map((value) => ({
            value,
            label: t(`tabooSetup.skipOptions.${value}`),
            ...(value === "unlimited" ? { ariaLabel: t("tabooSetup.unlimited") } : {}),
          }))}
        />
        <ChoiceGroup
          info={info("tiebreak", t("tabooSetup.tiebreak"))}
          legend={t("tabooSetup.tiebreak")}
          name="tiebreak"
          initial="on"
          options={(["on", "off"] as const).map((value) => ({
            value,
            label: t(`tabooSetup.tiebreakOptions.${value}`),
          }))}
        />
        {hasGenerators && (
          <ChoiceGroup
            info={info("cardSource", t("tabooSetup.cardSource"))}
            legend={t("tabooSetup.cardSource")}
            name="cardSource"
            initial="both"
            options={cardSources.map((value) => ({
              value,
              label: t(`tabooSetup.cardSources.${value}`),
            }))}
          />
        )}
        <ChoiceGroup
          info={info("difficulty", t("tabooSetup.difficulty"))}
          legend={t("tabooSetup.difficulty")}
          multiple
          name="difficulty"
          initial=""
          options={[
            { value: "", label: t("tabooSetup.anyDifficulty") },
            ...difficulties.map((value) => ({
              value,
              label: t(`tabooSetup.difficulties.${value}`),
              tone: value,
            })),
          ]}
        />
        <fieldset className="kit-choice-group">
          <legend>{t("tabooSetup.categories")}</legend>
          {(["standard", "own"] as const).map((group) => {
            const ids = sortCategories(
              categoryIds.filter((id) => isStandard(id) === (group === "standard")),
            );
            if (ids.length === 0) return null;
            return (
              <div className="taboo-category-group" key={group}>
                {categoryIds.some((id) => !isStandard(id)) && (
                  <small>{t(`tabooSetup.categoryGroups.${group}`)}</small>
                )}
                <div className="kit-choice-grid kit-choice-grid--categories">
                  {ids.map((category) => (
                    <label className="kit-choice" key={category}>
                      <input type="checkbox" name="category" value={category} defaultChecked />
                      <span>{categoryLabel(category)}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </fieldset>
      </SetupSection>
    </SetupScreen>
  );
}
