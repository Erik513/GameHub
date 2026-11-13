import { useState, type FormEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { TabooCategoryInfo } from "../../business/games/taboo/categories";
import type { Difficulty, ValidationIssue } from "../../business/games/taboo/model";
import { defaultRaceTarget, raceTargetChoices } from "../../business/games/taboo/race";
import type { SupportedLanguage } from "../../i18n";
import { ChoiceGroup, SetupScreen, SetupSection } from "../game-kit";
import { useCategoryLabel, useCategorySorter } from "./categoryLabel";
import { TabooRulesButton, TabooRulesDialog } from "./TabooRules";
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
  /** Counts the start attempts; see `TabooSetupMessages`. */
  attempt: number;
  /** False while another screen covers the form, so its messages are not shown twice. */
  messagesVisible: boolean;
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
  attempt,
  messagesVisible,
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
  // The rules window shows the game modes as tabs; the tiebreak has its own window that the rules
  // of the classic mode link to.
  const [rules, setRules] = useState<{ open: boolean; tab: TabooMode }>({ open: false, tab: mode });
  const [tiebreakOpen, setTiebreakOpen] = useState(false);
  const categoryLabel = useCategoryLabel(categoryInfos);
  const sortCategories = useCategorySorter(categoryInfos);
  const isStandard = (id: string) => categoryInfos.some((info) => info.id === id);
  const info = (
    key: "rounds" | "raceTarget" | "cardSource" | "skips" | "difficulty",
    legend: string,
  ) => ({
    closeLabel: t("settings.close"),
    label: t("tabooSetup.infoLabel", { setting: legend }),
    text: t(`tabooSetup.info.${key}`),
    title: legend,
  });

  // The tiebreak has its own window. It opens from the info button inside the option "on" of its
  // setting and from a link in the rules of the classic mode, which closes the rules window.
  const tiebreakInfo = {
    closeLabel: t("settings.close"),
    label: t("tabooSetup.infoLabel", { setting: t("tabooSetup.tiebreak") }),
    onOpenChange: setTiebreakOpen,
    open: tiebreakOpen,
    text: t("tabooSetup.info.tiebreak"),
    title: t("tabooTiebreakInfo.title"),
  };

  const messages = messagesVisible && (
    <TabooSetupMessages
      attempt={attempt}
      deckEmpty={deckEmpty}
      issues={issues}
      shortage={shortage}
    />
  );

  return (
    <SetupScreen
      formId="taboo-setup-form"
      messages={messages}
      onChange={onChange}
      onSubmit={onSubmit}
      startDisabled={generating}
      startLabel={t(generating ? "tabooSetup.preparingCards" : "tabooSetup.start")}
    >
      <SetupSection title={t("kitSetup.settingsSection")}>
        <TabooRulesButton onClick={() => setRules({ open: true, tab: mode })} />
        <TabooRulesDialog
          open={rules.open}
          tab={rules.tab}
          onClose={() => setRules((current) => ({ ...current, open: false }))}
          onOpenTiebreak={() => {
            setRules((current) => ({ ...current, open: false }));
            setTiebreakOpen(true);
          }}
          onTabChange={(tab) => setRules({ open: true, tab })}
        />
        <ChoiceGroup
          initial={mode}
          legend={t("tabooMode.legend")}
          name="mode"
          onChange={(next) => onModeChange(next === "race" ? "race" : "classic")}
          options={tabooModes.map((value) => ({
            value,
            label: t(`tabooMode.${value}`),
            // The info button opens the shared rules window at the tab of this game mode and
            // chooses the game mode.
            info: {
              label: t("tabooSetup.infoLabel", { setting: t(`tabooMode.${value}`) }),
              onOpen: () => {
                onModeChange(value);
                setRules({ open: true, tab: value });
              },
            },
          }))}
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
            legend={t("tabooSetup.tiebreak")}
            name="tiebreak"
            initial="on"
            options={(["on", "off"] as const).map((value) => ({
              value,
              label: t(`tabooSetup.tiebreakOptions.${value}`),
              ...(value === "on" ? { info: tiebreakInfo } : {}),
            }))}
          />
        </div>
      </SetupSection>
      <SetupSection title={t("tabooSetup.cardsSection")}>
        {children}
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
                      <span>
                        {categoryLabel(category)}
                        {!isStandard(category) && ` (${cardLanguage.toUpperCase()})`}
                      </span>
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
