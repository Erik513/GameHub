import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
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
import { generateHiddenCards, type TabooGenerators } from "./TabooGeneration";

const categories = ["everyday", "nature", "culture"] as const;
const difficulties = ["easy", "medium", "hard"] as const;
type SetupState = Extract<ReturnType<typeof createTabooGame>, { valid: true }>["value"];

export function TabooSetup({
  cardLanguage,
  cards,
  children,
  generators,
}: {
  cardLanguage: SupportedLanguage;
  cards: readonly TabooCard[];
  children?: ReactNode;
  generators?: TabooGenerators | undefined;
}) {
  const { t } = useTranslation();
  const [issues, setIssues] = useState<readonly ValidationIssue[]>([]);
  const [session, setSession] = useState<{ state: SetupState; deck: readonly TabooCard[] }>();
  const [shortage, setShortage] = useState<{ available: number; required: number }>();
  const [round, setRound] = useState<{
    state: TabooState;
    deadline: number;
  }>();
  const [deckEmpty, setDeckEmpty] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generationEmpty, setGenerationEmpty] = useState(false);
  const activeGeneration = useRef<AbortController | undefined>(undefined);
  useEffect(() => () => activeGeneration.current?.abort(), []);
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
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (activeGeneration.current) return;
    setGenerationEmpty(false);
    setDeckEmpty(false);
    setShortage(undefined);
    setSession(undefined);
    const data = new FormData(event.currentTarget);
    const result = createTabooGame({
      teams: Array.from({ length: Number(data.get("teamCount")) }, (_, index) => ({
        id: String(index + 1),
        name: t("tabooSetup.team", { number: index + 1 }),
      })),
      roundsPerTeam: Number(data.get("rounds")),
      roundDurationSeconds: Number(data.get("duration")),
      cardLanguage: data.get("language") === "de" ? "de" : "en",
    });
    if (!result.valid) {
      setIssues(result.issues);
      return;
    }
    const selectedCategories = categories.filter((category) =>
      data.getAll("category").includes(category),
    );
    if (selectedCategories.length === 0) {
      setIssues([{ field: "categories", code: "required" }]);
      return;
    }
    setIssues([]);
    const required =
      result.value.configuration.teams.length * result.value.configuration.roundsPerTeam;
    const filters: DeckCriteria = {
      language: result.value.configuration.cardLanguage,
      minimumCards: 1,
      categoryIds: selectedCategories.length === categories.length ? [] : selectedCategories,
      difficulties: difficulties.filter((difficulty) => data.get("difficulty") === difficulty),
    };
    let additions: readonly TabooCard[] = [];
    if (generators && data.has("extraCards")) {
      const controller = new AbortController();
      activeGeneration.current = controller;
      setGenerating(true);
      try {
        additions = await generateHiddenCards(
          generators,
          selectedCategories.map((categoryId) => ({
            language: filters.language,
            categoryId,
            difficulty: filters.difficulties?.[0] ?? "easy",
            count: 2,
          })),
          cards,
          controller.signal,
        );
      } catch {
        additions = [];
      } finally {
        activeGeneration.current = undefined;
        setGenerating(false);
      }
      if (controller.signal.aborted) return;
      setGenerationEmpty(additions.length === 0);
    }
    const deck = buildDeck([...cards, ...additions], filters, Math.random).cards;
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
      case "categories":
        return t("tabooSetup.selectCategory");
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
                score: ended.roundPoints,
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
          <Button
            variant="secondary"
            disabled={ended.roundPoints === 0}
            onClick={() => dispatch({ type: "undoPoint", turn: ended.turn })}
          >
            {t("tabooRound.undoPoint")}
          </Button>
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
            <Button variant="quiet" onClick={() => setSession(undefined)}>
              {t("tabooSetup.edit")}
            </Button>
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
        <div hidden={Boolean(session)}>
          <form
            noValidate
            onSubmit={(event) => void submit(event)}
            onChange={() => {
              activeGeneration.current?.abort();
              setShortage(undefined);
              setSession(undefined);
              setDeckEmpty(false);
            }}
          >
            <SetupChoices
              legend={t("tabooSetup.teams")}
              name="teamCount"
              initial="2"
              options={["2", "3", "4", "5", "6"].map((value) => ({ value, label: value }))}
            />
            <SetupChoices
              legend={t("tabooSetup.rounds")}
              name="rounds"
              initial="3"
              options={["1", "2", "3", "4", "5"].map((value) => ({ value, label: value }))}
            />
            <SetupChoices
              legend={t("tabooSetup.duration")}
              name="duration"
              initial="60"
              options={["15", "30", "45", "60", "90"].map((value) => ({ value, label: value }))}
            />
            <SetupChoices
              legend={t("language.cardLabel")}
              name="language"
              initial={cardLanguage}
              options={["de", "en"].map((value) => ({
                value,
                label: value === "de" ? t("language.options.de") : t("language.options.en"),
              }))}
            />
            <SetupChoices
              legend={t("tabooSetup.difficulty")}
              name="difficulty"
              initial=""
              options={[
                { value: "", label: t("tabooSetup.anyDifficulty") },
                ...difficulties.map((value) => ({
                  value,
                  label: t(`tabooSetup.difficulties.${value}`),
                })),
              ]}
            />
            <fieldset className="taboo-choice-group">
              <legend>{t("tabooSetup.categories")}</legend>
              <div className="taboo-choice-grid taboo-choice-grid--categories">
                {categories.map((category) => (
                  <label className="taboo-choice" key={category}>
                    <input type="checkbox" name="category" value={category} defaultChecked />
                    <span>{t(`tabooSetup.category.${category}`)}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            {generators && (
              <label className="taboo-choice taboo-choice--toggle">
                <input type="checkbox" name="extraCards" disabled={generating} />
                <span>{t("tabooSetup.extraCards")}</span>
              </label>
            )}
            <Button type="submit" disabled={generating}>
              {t(generating ? "tabooSetup.preparingCards" : "tabooSetup.start")}
            </Button>
          </form>
        </div>
        {generationEmpty && <p role="status">{t("tabooSetup.noExtraCards")}</p>}
        {children && <div className="taboo-tools">{children}</div>}
      </div>
    </div>
  );
}

interface SetupChoicesProps {
  legend: string;
  name: string;
  initial: string;
  options: readonly { value: string; label: string }[];
}

function SetupChoices({ legend, name, initial, options }: SetupChoicesProps) {
  return (
    <fieldset className="taboo-choice-group">
      <legend>{legend}</legend>
      <div className="taboo-choice-grid">
        {options.map(({ value, label }) => (
          <label className="taboo-choice" key={value}>
            <input type="radio" name={name} value={value} defaultChecked={value === initial} />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
