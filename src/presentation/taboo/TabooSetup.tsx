import { useCallback, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { buildDeck, type DeckCriteria } from "../../business/games/taboo/deck";
import type { TabooCard, ValidationIssue } from "../../business/games/taboo/model";
import {
  createTabooGame,
  getNextTabooTurn,
  transitionTaboo,
  type TabooEvent,
  type TabooState,
} from "../../business/games/taboo/stateMachine";
import type { SupportedLanguage } from "../../i18n";
import { Button, StatusMessage } from "../components";
import { TabooRound } from "./TabooRound";

const categories = ["everyday", "nature", "culture"] as const;
const difficulties = ["easy", "medium", "hard"] as const;
type SetupState = Extract<ReturnType<typeof createTabooGame>, { valid: true }>["value"];

export function TabooSetup({
  cardLanguage,
  cards,
}: {
  cardLanguage: SupportedLanguage;
  cards: readonly TabooCard[];
}) {
  const { t } = useTranslation();
  const [teamCount, setTeamCount] = useState(2);
  const [issues, setIssues] = useState<readonly ValidationIssue[]>([]);
  const [session, setSession] = useState<{ state: SetupState; deck: readonly TabooCard[] }>();
  const [shortage, setShortage] = useState<{ available: number; required: number }>();
  const [round, setRound] = useState<{
    state: TabooState;
    deadline: number;
    startingScore: number;
  }>();
  const [deckEmpty, setDeckEmpty] = useState(false);
  const [formVersion, setFormVersion] = useState(0);
  const ended = round?.state.status === "roundEnded" ? round.state : undefined;
  const finished = round?.state.status === "gameEnded" ? round.state : undefined;
  const nextTurn = ended ? getNextTabooTurn(ended) : null;

  function restart(keepConfiguration: boolean) {
    setRound(undefined);
    setDeckEmpty(false);
    setIssues([]);
    if (!keepConfiguration) {
      setSession(undefined);
      setTeamCount(2);
      setFormVersion((version) => version + 1);
    }
  }

  const dispatch = useCallback((event: TabooEvent) => {
    setRound((current) => {
      if (!current) return current;
      const state = transitionTaboo(current.state, event);
      return state === current.state ? current : { ...current, state };
    });
  }, []);

  function startRound() {
    if (!session) return;
    const current = round?.state ?? session.state;
    const used = new Set(current.resolvedCardIds);
    const available = session.deck.filter((card) => !used.has(card.id));
    const { teams, roundsPerTeam } = current.configuration;
    const completed = ended ? (ended.turn.round - 1) * teams.length + ended.turn.teamIndex + 1 : 0;
    const turnsLeft = teams.length * roundsPerTeam - completed;
    if (turnsLeft <= 0) return;
    const [card, ...remainingCards] = available.slice(0, Math.floor(available.length / turnsLeft));
    if (!card) {
      setDeckEmpty(true);
      return;
    }
    const state = transitionTaboo(current, { type: "startRound", card, remainingCards });
    if (state.status !== "roundRunning" || state === current) return;
    setDeckEmpty(false);
    setRound({
      state,
      deadline: Date.now() + state.configuration.roundDurationSeconds * 1000,
      startingScore: state.scores[state.turn.teamIndex] ?? 0,
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDeckEmpty(false);
    setShortage(undefined);
    setSession(undefined);
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
    const required =
      result.value.configuration.teams.length * result.value.configuration.roundsPerTeam;
    const filters: DeckCriteria = {
      language: result.value.configuration.cardLanguage,
      minimumCards: 1,
      categoryIds: categories.filter((category) => data.getAll("category").includes(category)),
      difficulties: difficulties.filter((difficulty) => data.get("difficulty") === difficulty),
    };
    const deck = buildDeck(cards, filters, Math.random).cards;
    if (deck.length < required) {
      setShortage({ available: deck.length, required });
      return;
    }
    setSession({ state: result.value, deck });
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
      {finished && (
        <section className="taboo-round" aria-label={t("tabooResult.title")}>
          <StatusMessage title={t("tabooResult.title")} tone="success">
            {t(finished.winnerIds.length === 1 ? "tabooResult.winner" : "tabooResult.tie", {
              teams: finished.configuration.teams
                .filter((team) => finished.winnerIds.includes(team.id))
                .map((team) => team.name)
                .join(", "),
            })}
          </StatusMessage>
          <h2>{t("tabooRound.standings")}</h2>
          <ul>
            {finished.configuration.teams.map((team, index) => (
              <li key={team.id}>
                {t("tabooRound.teamTotal", { team: team.name, score: finished.scores[index] ?? 0 })}
              </li>
            ))}
          </ul>
          <div className="taboo-setup__actions">
            <Button onClick={() => restart(true)}>{t("tabooResult.sameSetup")}</Button>
            <Button variant="secondary" onClick={() => restart(false)}>
              {t("tabooResult.newSetup")}
            </Button>
          </div>
        </section>
      )}
      {round?.state.status === "roundRunning" && (
        <TabooRound deadline={round.deadline} dispatch={dispatch} state={round.state} />
      )}
      {ended && round && (
        <section className="taboo-round" aria-label={t("tabooRound.ended")}>
          <StatusMessage title={t("tabooRound.ended")}>
            <p>
              {t("tabooRound.team", {
                team: ended.configuration.teams[ended.turn.teamIndex]?.name ?? "",
              })}
            </p>
            <p>
              {t("tabooRound.earned", {
                score: (ended.scores[ended.turn.teamIndex] ?? 0) - round.startingScore,
              })}
            </p>
          </StatusMessage>
          <h2>{t("tabooRound.standings")}</h2>
          <ul>
            {ended.configuration.teams.map((team, index) => (
              <li key={team.id}>
                {t("tabooRound.teamTotal", { team: team.name, score: ended.scores[index] ?? 0 })}
              </li>
            ))}
          </ul>
          {nextTurn ? (
            <>
              <p>
                {t("tabooRound.nextTeam", {
                  team: ended.configuration.teams[nextTurn.teamIndex]?.name ?? "",
                })}
              </p>
              <Button onClick={startRound} disabled={deckEmpty}>
                {t("tabooRound.start")}
              </Button>
            </>
          ) : (
            <>
              <p>{t("tabooRound.allRoundsPlayed")}</p>
              <Button onClick={() => dispatch({ type: "finishGame" })}>
                {t("tabooResult.show")}
              </Button>
            </>
          )}
          {deckEmpty && (
            <>
              <StatusMessage title={t("tabooRound.empty")} tone="error">
                {t("tabooRound.exhausted")}
              </StatusMessage>
              <Button variant="secondary" onClick={() => restart(false)}>
                {t("tabooResult.newSetup")}
              </Button>
            </>
          )}
        </section>
      )}
      <div hidden={Boolean(round)} key={formVersion}>
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
        {session && (
          <StatusMessage title={t("tabooSetup.ready")} tone="success">
            {t("tabooSetup.readyDetail", {
              teams: session.state.configuration.teams.map((team) => team.name).join(", "),
            })}
            <Button onClick={startRound}>{t("tabooRound.start")}</Button>
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
        <form
          noValidate
          onSubmit={submit}
          onChange={() => {
            setShortage(undefined);
            setSession(undefined);
            setDeckEmpty(false);
          }}
        >
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
    </div>
  );
}
