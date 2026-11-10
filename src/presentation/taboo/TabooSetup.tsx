import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import type { DeckCriteria } from "../../business/games/taboo/deck";
import type { ValidationIssue } from "../../business/games/taboo/model";
import { createTabooGame } from "../../business/games/taboo/stateMachine";
import type { SupportedLanguage } from "../../i18n";
import { Button, StatusMessage } from "../components";

const categories = ["everyday", "nature", "culture"] as const;
const difficulties = ["easy", "medium", "hard"] as const;
type SetupState = Extract<ReturnType<typeof createTabooGame>, { valid: true }>["value"];

export function TabooSetup({ cardLanguage }: { cardLanguage: SupportedLanguage }) {
  const { t } = useTranslation();
  const [teamCount, setTeamCount] = useState(2);
  const [issues, setIssues] = useState<readonly ValidationIssue[]>([]);
  const [session, setSession] = useState<{ state: SetupState; filters: DeckCriteria }>();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const result = createTabooGame({
      teams: data.getAll("team").map((name, index) => ({
        id: String(index + 1),
        name: typeof name === "string" ? name : "",
      })),
      roundsPerTeam: Number(data.get("rounds")),
      roundDurationSeconds: Number(data.get("duration")),
      cardLanguage: data.get("language") === "de" ? "de" : "en",
    });
    if (!result.valid) {
      setIssues(result.issues);
      return;
    }
    setIssues([]);
    setSession({
      state: result.value,
      filters: {
        language: result.value.configuration.cardLanguage,
        minimumCards: 1,
        categoryIds: categories.filter((category) => data.getAll("category").includes(category)),
        difficulties: difficulties.filter((difficulty) => data.get("difficulty") === difficulty),
      },
    });
  }

  function errorMessage(issue: ValidationIssue) {
    switch (issue.field) {
      case "teams.name":
        return issue.code === "duplicate"
          ? t("tabooSetup.duplicateTeam")
          : t("tabooSetup.emptyTeam");
      case "roundDurationSeconds":
        return t("tabooSetup.invalidDuration");
      case "roundsPerTeam":
        return t("tabooSetup.invalidRounds");
      default:
        return t("tabooSetup.invalidSetup");
    }
  }

  return (
    <div className="taboo-setup">
      {session && (
        <StatusMessage title={t("tabooSetup.ready")} tone="success">
          {t("tabooSetup.readyDetail", {
            teams: session.state.configuration.teams.map((team) => team.name).join(", "),
          })}
        </StatusMessage>
      )}
      {issues.length > 0 && (
        <StatusMessage title={t("tabooSetup.invalidSetup")} tone="error">
          <ul>
            {issues.map((issue) => (
              <li key={issue.field + issue.code}>{errorMessage(issue)}</li>
            ))}
          </ul>
        </StatusMessage>
      )}
      <form noValidate onSubmit={submit} onChange={() => setSession(undefined)}>
        <fieldset>
          <legend>{t("tabooSetup.teams")}</legend>
          {Array.from({ length: teamCount }, (_, index) => (
            <label className="language-control" key={index}>
              {t("tabooSetup.team", { number: index + 1 })}
              <input
                className="field__input"
                name="team"
                required
                aria-invalid={issues.some((issue) => issue.field === "teams.name")}
              />
            </label>
          ))}
          <div className="taboo-setup__actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setTeamCount(teamCount + 1);
                setSession(undefined);
              }}
            >
              {t("tabooSetup.addTeam")}
            </Button>
            {teamCount > 2 && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setTeamCount(teamCount - 1);
                  setSession(undefined);
                }}
              >
                {t("tabooSetup.removeTeam")}
              </Button>
            )}
          </div>
        </fieldset>
        <div className="taboo-setup__fields">
          <label className="language-control">
            {t("tabooSetup.rounds")}
            <input
              className="field__input"
              name="rounds"
              type="number"
              min="1"
              defaultValue="3"
              required
              aria-invalid={issues.some((issue) => issue.field === "roundsPerTeam")}
            />
          </label>
          <label className="language-control">
            {t("tabooSetup.duration")}
            <input
              className="field__input"
              name="duration"
              type="number"
              min="1"
              defaultValue="60"
              required
              aria-invalid={issues.some((issue) => issue.field === "roundDurationSeconds")}
            />
          </label>
          <label className="language-control">
            {t("language.cardLabel")}
            <select name="language" defaultValue={cardLanguage}>
              <option value="de">{t("language.options.de")}</option>
              <option value="en">{t("language.options.en")}</option>
            </select>
          </label>
          <label className="language-control">
            {t("tabooSetup.difficulty")}
            <select name="difficulty">
              <option value="">{t("tabooSetup.anyDifficulty")}</option>
              {difficulties.map((difficulty) => (
                <option key={difficulty} value={difficulty}>
                  {t(`tabooSetup.difficulties.${difficulty}`)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <fieldset>
          <legend>{t("tabooSetup.categories")}</legend>
          <p>{t("tabooSetup.categoryHint")}</p>
          <div className="taboo-setup__actions">
            {categories.map((category) => (
              <label key={category}>
                <input type="checkbox" name="category" value={category} />{" "}
                {t(`tabooSetup.category.${category}`)}
              </label>
            ))}
          </div>
        </fieldset>
        <Button type="submit">{t("tabooSetup.start")}</Button>
      </form>
    </div>
  );
}
