import type { FormEvent, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { TabooCategoryInfo } from "../../business/games/taboo/categories";
import type { Difficulty, ValidationIssue } from "../../business/games/taboo/model";
import { defaultRaceTarget, raceTargetChoices } from "../../business/games/taboo/race";
import type { SupportedLanguage } from "../../i18n";
import { ChoiceGroup, SetupScreen, SetupSection } from "../game-kit";
import { useCategoryLabel, useCategorySorter } from "./categoryLabel";
import { TabooRules } from "./TabooRules";
import { TabooSetupMessages } from "./TabooSetupMessages";
import {
  cardSources,
  difficulties,
  roundOption,
  tabooModes,
  type RoundChoice,
  type TabooMode,
} from "./tabooSetupModel";

interface TabooSetupFormProps {
  cardLanguage: SupportedLanguage;
  categoryIds: readonly string[];
  categoryInfos: readonly TabooCategoryInfo[];
  children?: ReactNode;
  deckEmpty: boolean;
  generating: boolean;
  hasGenerators: boolean;
  issues: readonly ValidationIssue[];
  /** The game mode; the settings below depend on it. */
  mode: TabooMode;
  onModeChange: (mode: TabooMode) => void;
  /** Changes the card language; without it the language is not offered. */
  onCardLanguageChange?: ((language: SupportedLanguage) => void) | undefined;
  onChange: (event: FormEvent<HTMLFormElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  roundChoices: readonly RoundChoice[];
  /** Too few cards; `difficulty` is set when a difficulty is short for a fair race. */
  shortage: { available: number; required: number; difficulty?: Difficulty } | undefined;
}

/** The setup form of a Taboo game with its error messages and the start button. */
export function TabooSetupForm({
  cardLanguage,
  categoryIds,
  categoryInfos,
  children,
  deckEmpty,
  generating,
  hasGenerators,
  issues,
  mode,
  onCardLanguageChange,
  onChange,
  onModeChange,
  onSubmit,
  roundChoices,
  shortage,
}: TabooSetupFormProps) {
  const { t } = useTranslation();
  const categoryLabel = useCategoryLabel(categoryInfos);
  const sortCategories = useCategorySorter(categoryInfos);
  const isStandard = (id: string) => categoryInfos.some((info) => info.id === id);
  const info = (
    key: "mode" | "rounds" | "raceTarget" | "cardSource" | "tiebreak" | "skips" | "difficulty",
    legend: string,
  ) => ({
    closeLabel: t("settings.close"),
    label: t("tabooSetup.infoLabel", { setting: legend }),
    text: t(`tabooSetup.info.${key}`),
    title: legend,
  });

  const messages = <TabooSetupMessages deckEmpty={deckEmpty} issues={issues} shortage={shortage} />;

  return (
    <SetupScreen
      formId="taboo-setup-form"
      messages={messages}
      onChange={onChange}
      onSubmit={onSubmit}
      startDisabled={generating}
      startLabel={t(generating ? "tabooSetup.preparingCards" : "tabooSetup.start")}
      editor={children}
      rules={<TabooRules />}
    >
      <SetupSection title={t("kitSetup.settingsSection")}>
        <ChoiceGroup
          info={info("mode", t("tabooMode.legend"))}
          initial={mode}
          legend={t("tabooMode.legend")}
          name="mode"
          onChange={(next) => onModeChange(next === "race" ? "race" : "classic")}
          options={tabooModes.map((value) => ({ value, label: t(`tabooMode.${value}`) }))}
          value={mode}
        />
        {/* The settings of both modes stay in the form and are only hidden, so a choice is kept when
            the mode is changed and changed back. */}
        <div className="taboo-mode-settings" hidden={mode !== "race"}>
          <ChoiceGroup
            info={info("raceTarget", t("tabooSetup.raceTarget"))}
            legend={t("tabooSetup.raceTarget")}
            name="raceTarget"
            initial={String(defaultRaceTarget)}
            options={raceTargetChoices.map((value) => ({
              value: String(value),
              label: String(value),
            }))}
          />
        </div>
        <div className="taboo-mode-settings" hidden={mode !== "classic"}>
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
        </div>
      </SetupSection>
      <SetupSection title={t("tabooSetup.cardsSection")}>
        {onCardLanguageChange && (
          <ChoiceGroup
            initial={cardLanguage}
            legend={t("language.cardLabel")}
            name="cardLanguage"
            onChange={(language) => onCardLanguageChange(language === "de" ? "de" : "en")}
            options={[
              { value: "en", label: t("language.options.en") },
              { value: "de", label: t("language.options.de") },
            ]}
            value={cardLanguage}
          />
        )}
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
