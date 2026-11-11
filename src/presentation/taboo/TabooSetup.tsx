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
import { shuffleTeams } from "../../business/games/taboo/teamOrder";
import { useGameExit } from "../GameChrome";
import { TabooRound } from "./TabooRound";
import { TabooRoundReview } from "./TabooRoundReview";
import { TabooScoreboard } from "./TabooScoreboard";
import { generateHiddenCards, type TabooGenerators } from "./TabooGeneration";

const categories = ["everyday", "nature", "culture"] as const;
const difficulties = ["easy", "medium", "hard"] as const;
const cardSources = ["both", "local", "ai"] as const;
const maxCardsPerRequest = 10;
const aiCardsPerTurn = 8;
const refillThreshold = 8;
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
  // AI-only games refill a running round in the background so the deck cannot run dry mid-turn.
  const aiRefill = useRef<{ language: SupportedLanguage; categories: readonly string[] }>(
    undefined,
  );
  const refillState = useRef({
    busy: false,
    counter: 0,
    attempts: new Map<string, number>(),
    added: [] as TabooCard[],
  });
  const refillController = useRef<AbortController | undefined>(undefined);
  useEffect(() => () => refillController.current?.abort(), []);
  const [formVersion, setFormVersion] = useState(0);
  const [teamCount, setTeamCount] = useState(2);
  const [refillTick, setRefillTick] = useState(0);
  const ended = round?.state.status === "roundEnded" ? round.state : undefined;
  const finished = round?.state.status === "gameEnded" ? round.state : undefined;
  const nextTurn = ended ? getNextTabooTurn(ended) : null;
  const overview =
    ended && round
      ? { ...ended, turn: nextTurn }
      : session && !round
        ? { ...session.state, turn: { round: 1, teamIndex: 0 } }
        : undefined;

  function restart(keepConfiguration: boolean) {
    refillController.current?.abort();
    refillState.current = { busy: false, counter: 0, attempts: new Map(), added: [] };
    setRound(undefined);
    setDeckEmpty(false);
    setIssues([]);
    if (!keepConfiguration) {
      setSession(undefined);
      setFormVersion((version) => version + 1);
      setTeamCount(2);
    } else if (session) {
      // Same setup: replay with the same cards in a fresh order.
      const reordered = createTabooGame({
        ...session.state.configuration,
        teams: shuffleTeams(session.state.configuration.teams),
      });
      if (reordered.valid) setSession({ state: reordered.value, deck: shuffle(session.deck) });
    }
  }

  // Leaving a game returns to the main window with the previous setup still filled in.
  useGameExit(Boolean(round) || Boolean(session), () => {
    refillController.current?.abort();
    refillState.current = { busy: false, counter: 0, attempts: new Map(), added: [] };
    setRound(undefined);
    setSession(undefined);
    setDeckEmpty(false);
    setIssues([]);
  });

  const dispatch = useCallback((event: TabooEvent) => {
    setRound((current) => {
      if (!current) return current;
      const state = transitionTaboo(current.state, event);
      return state === current.state ? current : { ...current, state };
    });
  }, []);

  const runningRound = round?.state.status === "roundRunning" ? round.state : undefined;
  useEffect(() => {
    const plan = aiRefill.current;
    const control = refillState.current;
    if (!generators || !plan || !runningRound || control.busy) return;
    if (runningRound.remainingCards.length > refillThreshold) return;
    const { turn } = runningRound;
    const turnKey = `${turn.round}:${turn.teamIndex}`;
    if ((control.attempts.get(turnKey) ?? 0) >= plan.categories.length) return;
    const index = control.counter++;
    const request = {
      language: plan.language,
      categoryId: plan.categories[index % plan.categories.length] ?? "everyday",
      difficulty: difficulties[index % difficulties.length] ?? "easy",
      count: maxCardsPerRequest,
    };
    const controller = new AbortController();
    refillController.current = controller;
    control.busy = true;
    void generateHiddenCards(
      generators,
      [request],
      [...cards, ...(session?.deck ?? []), ...control.added],
      controller.signal,
    )
      .catch(() => [] as readonly TabooCard[])
      .then((additions) => {
        control.busy = false;
        if (controller.signal.aborted) return;
        control.added.push(...additions);
        control.attempts.set(
          turnKey,
          additions.length > 0 ? 0 : (control.attempts.get(turnKey) ?? 0) + 1,
        );
        // Re-render so the effect can request further batches if the deck is still short.
        dispatch({ type: "addCards", turn, cards: additions });
        setRefillTick((tick) => tick + 1);
      });
  }, [cards, dispatch, generators, refillTick, runningRound, session]);

  function startRound(
    active: { state: SetupState; deck: readonly TabooCard[] } | undefined = session,
    base: TabooState | undefined = round?.state,
  ) {
    if (!active) return;
    const current = base ?? active.state;
    const { teams, roundsPerTeam } = current.configuration;
    const completed =
      current.status === "roundEnded"
        ? (current.turn.round - 1) * teams.length + current.turn.teamIndex + 1
        : 0;
    if (teams.length * roundsPerTeam - completed <= 0) return;
    // A turn never ends because of cards: unplayed cards come first, then earlier cards in new order.
    const used = new Set(current.resolvedCardIds);
    const [card, ...remainingCards] = [
      ...active.deck.filter((candidate) => !used.has(candidate.id)),
      ...shuffle(active.deck.filter((candidate) => used.has(candidate.id))),
    ];
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
      teams: shuffleTeams(
        Array.from({ length: Number(data.get("teamCount")) }, (_, index) => ({
          id: String(index + 1),
          name:
            teamNameFrom(data.get(`teamName${index + 1}`)) ||
            t("tabooSetup.team", { number: index + 1 }),
        })),
      ),
      roundsPerTeam: Number(data.get("rounds")),
      roundDurationSeconds: Number(data.get("duration")),
      ...(data.get("skips") === "unlimited" || !data.has("skips")
        ? {}
        : { skipsPerRound: Number(data.get("skips")) }),
      cardLanguage,
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
    const cardSource = generators ? data.get("cardSource") : "local";
    aiRefill.current =
      cardSource === "ai"
        ? { language: filters.language, categories: selectedCategories }
        : undefined;
    refillState.current = { busy: false, counter: 0, attempts: new Map(), added: [] };
    let additions: readonly TabooCard[] = [];
    if (generators && (cardSource === "ai" || cardSource === "both")) {
      const controller = new AbortController();
      activeGeneration.current = controller;
      setGenerating(true);
      // Mixed decks only add a few extras. AI-only decks must last a full timed round per turn,
      // so they are generated generously instead of one card per turn.
      const perCategory =
        cardSource === "ai"
          ? Math.max(2, Math.ceil((required * aiCardsPerTurn) / selectedCategories.length))
          : 2;
      const requests = selectedCategories.flatMap((categoryId) =>
        Array.from({ length: Math.ceil(perCategory / maxCardsPerRequest) }, (_, index) => ({
          language: filters.language,
          categoryId,
          difficulty:
            filters.difficulties?.[0] ?? difficulties[index % difficulties.length] ?? "easy",
          count: Math.min(maxCardsPerRequest, perCategory - index * maxCardsPerRequest),
        })),
      );
      try {
        additions = await generateHiddenCards(generators, requests, cards, controller.signal);
      } catch {
        additions = [];
      } finally {
        activeGeneration.current = undefined;
        setGenerating(false);
      }
      if (controller.signal.aborted) return;
      setGenerationEmpty(additions.length === 0);
    }
    const pool = cardSource === "ai" ? additions : [...cards, ...additions];
    const deck = buildDeck(pool, filters, Math.random).cards;
    if (deck.length < required) {
      setShortage({ available: deck.length, required });
      return;
    }
    const active = { state: result.value, deck };
    setSession(active);
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
          <TabooScoreboard
            scores={finished.scores}
            teams={finished.configuration.teams}
            winnerIds={finished.winnerIds}
          />
          <div className="taboo-setup__actions">
            <Button variant="success" onClick={() => restart(true)}>
              {t("tabooResult.sameSetup")}
            </Button>
            <Button variant="secondary" onClick={() => restart(false)}>
              {t("tabooResult.newSetup")}
            </Button>
          </div>
        </section>
      )}
      {round?.state.status === "roundRunning" && (
        <TabooRound deadline={round.deadline} dispatch={dispatch} state={round.state} />
      )}
      {overview && (
        <section className="taboo-round taboo-overview" aria-label={t("tabooRound.overview")}>
          {overview.turn && (
            <p className="taboo-overview__round">
              {t("tabooRound.roundOf", {
                round: overview.turn.round,
                total: overview.configuration.roundsPerTeam,
              })}
            </p>
          )}
          {!overview.turn && <p>{t("tabooRound.allRoundsPlayed")}</p>}
          <h2>{t("tabooRound.standings")}</h2>
          <TabooScoreboard scores={overview.scores} teams={overview.configuration.teams} />
          {ended && (
            <TabooRoundReview
              results={ended.results}
              teamName={ended.configuration.teams[ended.turn.teamIndex]?.name ?? ""}
              onRevise={(cardId, outcome) =>
                dispatch({ type: "reviseResult", turn: ended.turn, cardId, outcome })
              }
            />
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
          <div className="game-start-bar">
            {overview.turn ? (
              <>
                <div className="taboo-overview__turn">
                  <span className="visually-hidden">{t("tabooRound.upNext")}: </span>
                  <strong>{overview.configuration.teams[overview.turn.teamIndex]?.name}</strong>
                </div>
                <Button variant="success" onClick={() => startRound()} disabled={deckEmpty}>
                  {t("tabooRound.start")}
                </Button>
              </>
            ) : (
              <Button variant="success" onClick={() => dispatch({ type: "finishGame" })}>
                {t("tabooResult.show")}
              </Button>
            )}
          </div>
        </section>
      )}
      <div
        className="taboo-setup__screen"
        hidden={Boolean(round) || Boolean(session)}
        key={formVersion}
      >
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
                <li key={issue.field + issue.code}>{errorMessage(issue)}</li>
              ))}
            </ul>
          </StatusMessage>
        )}
        <form
          id="taboo-setup-form"
          noValidate
          onSubmit={(event) => void submit(event)}
          onChange={(event) => {
            if (event.target instanceof HTMLInputElement && event.target.name === "teamCount") {
              setTeamCount(Number(event.target.value));
            }
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
            options={["60", "90"].map((value) => ({ value, label: value }))}
          />
          {generators && (
            <SetupChoices
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
            <SetupChoices
              legend={t("tabooSetup.skips")}
              name="skips"
              initial="1"
              options={(["0", "1", "2", "3", "unlimited"] as const).map((value) => ({
                value,
                label: t(`tabooSetup.skipOptions.${value}`),
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
          </details>
        </form>
        {generationEmpty && <p role="status">{t("tabooSetup.noExtraCards")}</p>}
        {children && <div className="taboo-tools">{children}</div>}
        <div className="game-start-bar">
          <Button form="taboo-setup-form" type="submit" variant="success" disabled={generating}>
            {t(generating ? "tabooSetup.preparingCards" : "tabooSetup.start")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [result[index], result[other]] = [result[other] as T, result[index] as T];
  }
  return result;
}

function teamNameFrom(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
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
