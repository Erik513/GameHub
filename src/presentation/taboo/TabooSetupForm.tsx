import { useState, type FormEvent, type ReactNode, type Ref } from "react";
import { useTranslation } from "react-i18next";
import type { TabooCategoryInfo } from "../../business/games/taboo/categories";
import type { Difficulty, ValidationIssue } from "../../business/games/taboo/model";
import {
  countdownBudgetChoices,
  defaultCountdownBudgetMs,
} from "../../business/games/taboo/countdown";
import {
  defaultRaceRounds,
  defaultRaceTarget,
  raceRoundChoices,
  raceTargetChoices,
} from "../../business/games/taboo/race";
import type { SupportedLanguage } from "../../i18n";
import { ChoiceGroup, SetupScreen, SetupTabs, TabPane } from "../game-kit";
import { useCategoryLabel, useCategorySorter } from "./categoryLabel";
import { useGameRulesButton } from "../GameChrome";
import { Button, Dialog } from "../components";
import { TabooRulesDialog } from "./TabooRules";
import { TabooSetupMessages } from "./TabooSetupMessages";
import {
  cardSources,
  difficulties,
  raceRoundOption,
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
  /** The form is the settings screen: it is read by the game when the game starts. */
  formRef: Ref<HTMLFormElement>;
  /** False while another screen covers the form, so its messages are not shown twice. */
  messagesVisible: boolean;
  /** The header button "Rules" is offered (on the line-up and in the settings, not during a game). */
  rulesActive: boolean;
  deckEmpty: boolean;
  hasGenerators: boolean;
  issues: readonly ValidationIssue[];
  /** The game mode; the settings below depend on it. */
  mode: TabooMode;
  onModeChange: (mode: TabooMode) => void;
  /** The tab of the main menu that is shown: the game settings or the cards. */
  menuTab: string;
  onMenuTabChange: (tab: string) => void;
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
  formRef,
  messagesVisible,
  rulesActive,
  deckEmpty,
  hasGenerators,
  issues,
  menuTab,
  mode,
  onCardLanguageChange,
  onMenuTabChange,
  onChange,
  onModeChange,
  onSubmit,
  roundChoices,
  shortage,
}: TabooSetupFormProps) {
  const { t } = useTranslation();
  // All rules are in one window; the tiebreak has its own window that the rules of the classic mode
  // link to. A game mode has a short info window of its own that leads to all rules.
  const [rulesOpen, setRulesOpen] = useState(false);
  const [modeInfo, setModeInfo] = useState<TabooMode>();
  // The button "Rules" of the header opens all the rules.
  useGameRulesButton(rulesActive, () => setRulesOpen(true));
  const [tiebreakOpen, setTiebreakOpen] = useState(false);
  const categoryLabel = useCategoryLabel(categoryInfos);
  const sortCategories = useCategorySorter(categoryInfos);
  const isStandard = (id: string) => categoryInfos.some((info) => info.id === id);
  const info = (key: "raceTarget" | "cardSource" | "skips" | "difficulty", legend: string) => ({
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

  // The race has the same setting; its info button only opens the window the classic mode owns.
  const raceTiebreakInfo = {
    label: tiebreakInfo.label,
    onOpen: () => setTiebreakOpen(true),
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
      formRef={formRef}
      messages={messages}
      onChange={onChange}
      onSubmit={onSubmit}
      startLabel={t("tabooSetup.done")}
    >
      <TabooRulesDialog
        onClose={() => setRulesOpen(false)}
        onOpenTiebreak={() => {
          setRulesOpen(false);
          setTiebreakOpen(true);
        }}
        open={rulesOpen}
      />
      <Dialog
        closeLabel={t("settings.close")}
        onClose={() => setModeInfo(undefined)}
        open={modeInfo !== undefined}
        title={modeInfo ? t(`tabooMode.${modeInfo}`) : ""}
      >
        {modeInfo && <p>{t(`tabooMode.${modeInfo}Info`)}</p>}
        <Button
          onClick={() => {
            setModeInfo(undefined);
            setRulesOpen(true);
          }}
          variant="secondary"
        >
          {t("tabooRules.all")}
        </Button>
      </Dialog>
      <SetupTabs
        ariaLabel={t("kitSetup.menuTabs")}
        onSelect={onMenuTabChange}
        selected={menuTab}
        tabs={[
          {
            id: "settings",
            label: t("kitSetup.tabSettings"),
            content: (
              <>
                <ChoiceGroup
                  initial={mode}
                  legend={t("tabooMode.legend")}
                  name="mode"
                  onChange={(next) =>
                    onModeChange(tabooModes.find((candidate) => candidate === next) ?? "classic")
                  }
                  options={tabooModes.map((value) => ({
                    value,
                    label: t(`tabooMode.${value}`),
                    // The info button only explains this game mode in a sentence and leads to all the rules;
                    // it does not choose the mode.
                    info: {
                      label: t("tabooSetup.infoLabel", { setting: t(`tabooMode.${value}`) }),
                      onOpen: () => setModeInfo(value),
                    },
                  }))}
                  value={mode}
                />
                {/* The settings of both modes stay in the form and are only hidden, so a choice is kept when
            the mode is changed and changed back. */}
                <div className="taboo-mode-settings" hidden={mode !== "race"}>
                  <ChoiceGroup
                    legend={t("tabooSetup.rounds")}
                    name="raceRounds"
                    initial={String(defaultRaceRounds)}
                    options={raceRoundChoices.map((value) => raceRoundOption(value, t))}
                  />
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
                  <ChoiceGroup
                    legend={t("tabooSetup.tiebreak")}
                    name="raceTiebreak"
                    initial="on"
                    options={(["on", "off"] as const).map((value) => ({
                      value,
                      label: t(`tabooSetup.tiebreakOptions.${value}`),
                      ...(value === "on" ? { info: raceTiebreakInfo } : {}),
                    }))}
                  />
                </div>
                <div className="taboo-mode-settings" hidden={mode !== "countdown"}>
                  <ChoiceGroup
                    legend={t("tabooSetup.countdownBudget")}
                    name="countdownBudget"
                    initial={String(defaultCountdownBudgetMs)}
                    options={countdownBudgetChoices.map((value) => ({
                      value: String(value),
                      label: String(value / 60_000),
                      hint: t("tabooSetup.countdownBudgetUnit"),
                    }))}
                  />
                  <ChoiceGroup
                    legend={t("tabooSetup.countdownSwitch")}
                    name="countdownSwitch"
                    initial="manual"
                    options={(["manual", "auto"] as const).map((value) => ({
                      value,
                      label: t(`tabooSetup.countdownSwitchOptions.${value}`),
                    }))}
                  />
                </div>
                <div className="taboo-mode-settings" hidden={mode !== "classic"}>
                  <ChoiceGroup
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
              </>
            ),
          },
          {
            id: "cards",
            label: t("tabooSetup.cardsSection"),
            content: (
              <TabPane header={children}>
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
                  legend={t("tabooSetup.difficultyMultiple")}
                  multiple
                  name="difficulty"
                  initial={["easy"]}
                  options={difficulties.map((value) => ({
                    value,
                    label: t(`tabooSetup.difficulties.${value}`),
                    tone: value,
                  }))}
                />
                <fieldset className="kit-choice-group">
                  <legend>{t("tabooSetup.categories")}</legend>
                  {(["standard", "own"] as const).map((group) => {
                    const ids = sortCategories(
                      categoryIds.filter((id) => isStandard(id) === (group === "standard")),
                    );
                    // Both headings are always there, so the groups are clear even without own categories.
                    return (
                      <div className="taboo-category-group" key={group}>
                        <small>{t(`tabooSetup.categoryGroups.${group}`)}</small>
                        {ids.length === 0 && (
                          <p className="taboo-category-group__empty">
                            {t("tabooSetup.noOwnCategories")}
                          </p>
                        )}
                        <div className="kit-choice-grid kit-choice-grid--categories">
                          {ids.map((category) => (
                            <label className="kit-choice" key={category}>
                              <input
                                type="checkbox"
                                name="category"
                                value={category}
                                defaultChecked
                              />
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
              </TabPane>
            ),
          },
        ]}
      />
    </SetupScreen>
  );
}
