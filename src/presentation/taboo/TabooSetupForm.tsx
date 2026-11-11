import type { FormEvent, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { ValidationIssue } from "../../business/games/taboo/model";
import { Button, StatusMessage } from "../components";
import { ChoiceGroup, StartBar } from "../game-kit";
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

/** The setup form of a Taboo game with its error messages and the start button. */
export function TabooSetupForm({
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
    key: "rounds" | "cardSource" | "tiebreak" | "skips" | "difficulty",
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
      <TabooRules />
      <form id="taboo-setup-form" noValidate onSubmit={onSubmit} onChange={onChange}>
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
        <details className="taboo-more">
          <summary>{t("tabooSetup.moreOptions")}</summary>
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
            info={info("difficulty", t("tabooSetup.difficulty"))}
            legend={t("tabooSetup.difficulty")}
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
            <div className="kit-choice-grid kit-choice-grid--categories">
              {categories.map((category) => (
                <label className="kit-choice" key={category}>
                  <input type="checkbox" name="category" value={category} defaultChecked />
                  <span>{t(`tabooSetup.category.${category}`)}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </details>
      </form>
      {children && <div className="taboo-tools">{children}</div>}
      <StartBar>
        <Button form="taboo-setup-form" type="submit" variant="success" disabled={generating}>
          {t(generating ? "tabooSetup.preparingCards" : "tabooSetup.start")}
        </Button>
      </StartBar>
    </>
  );
}
