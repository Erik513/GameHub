import type { FormEvent, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { ValidationIssue } from "../../business/games/taboo/model";
import { Button, StatusMessage } from "../components";
import { ChoiceGroup, StartBar } from "../game-kit";
import { TabooPlayers } from "./TabooPlayers";
import { TabooRules } from "./TabooRules";
import {
  cardSources,
  categories,
  difficulties,
  issueMessageKey,
  roundOption,
  type RoundChoice,
} from "./tabooSetupModel";

interface TabooSetupFormProps {
  categoryIds: readonly string[];
  children?: ReactNode;
  deckEmpty: boolean;
  generating: boolean;
  hasGenerators: boolean;
  issues: readonly ValidationIssue[];
  onChange: (event: FormEvent<HTMLFormElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  roundChoices: readonly RoundChoice[];
  shortage: { available: number; required: number } | undefined;
  teamCount: number;
}

const isBuiltIn = (id: string): id is (typeof categories)[number] =>
  (categories as readonly string[]).includes(id);

/** The setup form of a Taboo game with its error messages and the start button. */
export function TabooSetupForm({
  categoryIds,
  children,
  deckEmpty,
  generating,
  hasGenerators,
  issues,
  onChange,
  onSubmit,
  roundChoices,
  shortage,
  teamCount,
}: TabooSetupFormProps) {
  const { t } = useTranslation();
  const info = (
    key: "rounds" | "cardSource" | "teamOrder" | "tiebreak" | "skips" | "difficulty",
    legend: string,
  ) => ({
    closeLabel: t("settings.close"),
    label: t("tabooSetup.infoLabel", { setting: legend }),
    text: t(`tabooSetup.info.${key}`),
    title: legend,
  });

  return (
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
      <div className="taboo-toolbar">
        {children}
        <TabooRules />
      </div>
      <form id="taboo-setup-form" noValidate onSubmit={onSubmit} onChange={onChange}>
        <section aria-labelledby="taboo-teams-heading" className="taboo-section">
          <h2 id="taboo-teams-heading">{t("tabooSetup.teamsSection")}</h2>
          <ChoiceGroup
            legend={t("tabooSetup.teams")}
            name="teamCount"
            initial="2"
            options={["2", "3", "4", "5", "6"].map((value) => ({ value, label: value }))}
          />
          <div className="taboo-team-names">
            {Array.from({ length: teamCount }, (_, index) => (
              <input
                aria-label={t("tabooSetup.teamNameLabel", { number: index + 1 })}
                autoComplete="off"
                className="field__input"
                key={index}
                maxLength={24}
                name={`teamName${index + 1}`}
                placeholder={t("tabooSetup.team", { number: index + 1 })}
              />
            ))}
          </div>
          {teamCount > 1 && (
            <ChoiceGroup
              info={info("teamOrder", t("tabooSetup.teamOrder"))}
              legend={t("tabooSetup.teamOrder")}
              name="teamOrder"
              initial="random"
              options={(["random", "entered"] as const).map((value) => ({
                value,
                label: t(`tabooSetup.teamOrderOptions.${value}`),
              }))}
            />
          )}
          <TabooPlayers teamCount={teamCount} />
        </section>
        <section aria-labelledby="taboo-settings-heading" className="taboo-section">
          <h2 id="taboo-settings-heading">{t("tabooSetup.settingsSection")}</h2>
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
              const ids = categoryIds.filter((id) => isBuiltIn(id) === (group === "standard"));
              if (ids.length === 0) return null;
              return (
                <div className="taboo-category-group" key={group}>
                  {categoryIds.some((id) => !isBuiltIn(id)) && (
                    <small>{t(`tabooSetup.categoryGroups.${group}`)}</small>
                  )}
                  <div className="kit-choice-grid kit-choice-grid--categories">
                    {ids.map((category) => (
                      <label className="kit-choice" key={category}>
                        <input type="checkbox" name="category" value={category} defaultChecked />
                        <span>
                          {isBuiltIn(category) ? t(`tabooSetup.category.${category}`) : category}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </fieldset>
        </section>
      </form>
      <StartBar>
        <Button form="taboo-setup-form" type="submit" variant="success" disabled={generating}>
          {t(generating ? "tabooSetup.preparingCards" : "tabooSetup.start")}
        </Button>
      </StartBar>
    </>
  );
}
