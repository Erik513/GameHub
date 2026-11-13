import {
  validateCard,
  validateConfiguration,
  type GameConfiguration,
  type TabooCard,
  type ValidationResult,
} from "./model";

interface Turn {
  readonly round: number;
  readonly teamIndex: number;
}

interface GameState {
  readonly configuration: GameConfiguration;
  readonly scores: readonly number[];
  readonly resolvedCardIds: readonly string[];
}

interface Setup extends GameState {
  readonly status: "setup";
}

export type TabooOutcome = "correct" | "skipped" | "forbiddenWord";

export interface TabooResult {
  readonly card: TabooCard;
  readonly outcome: TabooOutcome;
}

interface TurnState extends GameState {
  readonly turn: Turn;
  readonly roundPoints: number;
  readonly results: readonly TabooResult[];
}

export const TIEBREAK_CARD_COUNT = 3;
export const TIEBREAK_LIMIT_SECONDS = 90;
export const TIEBREAK_MAX_TEAMS = 3;

export interface TiebreakAttempt {
  readonly teamIndex: number;
  readonly solved: number;
  /** Elapsed time including penalties, in milliseconds. */
  readonly timeMs: number;
  /** Every card of the attempt with its outcome, so a mistake can be corrected afterwards. */
  readonly results: readonly TabooResult[];
}

export interface TiebreakActive {
  readonly teamIndex: number;
  readonly cards: readonly TabooCard[];
  readonly index: number;
  readonly solved: number;
  readonly skipUsed: boolean;
  /** Cards that were replaced because a forbidden word was said; they only cost time. */
  readonly wrong: number;
  /** The cards that are done so far with their outcome. */
  readonly results: readonly TabooResult[];
}

export type TabooState =
  | Setup
  | (TurnState & {
      readonly status: "roundRunning";
      readonly card: TabooCard;
      readonly remainingCards: readonly TabooCard[];
    })
  | (TurnState & { readonly status: "roundEnded" })
  | (TurnState & {
      readonly status: "tiebreak";
      /** Team indexes of the tied teams in playing order. */
      readonly contenders: readonly number[];
      readonly attempts: readonly TiebreakAttempt[];
      readonly usedCardIds: readonly string[];
      readonly active?: TiebreakActive;
    })
  | (TurnState & {
      readonly status: "gameEnded";
      readonly winnerIds: readonly string[];
      readonly tiebreak?: readonly TiebreakAttempt[];
    });

export type TabooEvent =
  | {
      readonly type: "startRound";
      readonly card: TabooCard;
      readonly remainingCards?: readonly TabooCard[];
    }
  | {
      readonly type: "resolveCard";
      readonly turn: Turn;
      readonly cardId: string;
      readonly outcome: TabooOutcome;
    }
  | {
      readonly type: "addCards";
      readonly turn: Turn;
      readonly cards: readonly TabooCard[];
    }
  | {
      readonly type: "restartRound";
      readonly turn: Turn;
      readonly card: TabooCard;
      readonly remainingCards?: readonly TabooCard[];
    }
  | { readonly type: "endRound"; readonly turn: Turn }
  | {
      readonly type: "reviseResult";
      readonly turn: Turn;
      readonly cardId: string;
      readonly outcome: TabooOutcome;
    }
  | { readonly type: "beginTiebreakAttempt"; readonly cards: readonly TabooCard[] }
  | {
      readonly type: "answerTiebreak";
      readonly outcome: TabooOutcome;
      readonly elapsedMs: number;
      readonly replacement?: TabooCard;
    }
  | { readonly type: "endTiebreakAttempt"; readonly elapsedMs: number }
  /**
   * Corrects the outcome of one card of a finished tiebreak attempt, for example "correct" that
   * had a forbidden word. The ranking and the winners are calculated again.
   */
  | {
      readonly type: "reviseTiebreakResult";
      readonly teamIndex: number;
      readonly cardId: string;
      readonly outcome: TabooOutcome;
    }
  | { readonly type: "finishGame" };

export function createTabooGame(input: GameConfiguration): ValidationResult<Setup> {
  const result = validateConfiguration(input);
  return result.valid
    ? {
        valid: true,
        value: {
          status: "setup",
          configuration: result.value,
          scores: result.value.teams.map(() => 0),
          resolvedCardIds: [],
        },
      }
    : result;
}

export function transitionTaboo(state: TabooState, event: TabooEvent): TabooState {
  const { configuration, scores, resolvedCardIds } = state;
  if (event.type === "reviseResult") {
    if (
      state.status !== "roundEnded" ||
      event.turn.round !== state.turn.round ||
      event.turn.teamIndex !== state.turn.teamIndex
    )
      return state;
    const previous = state.results.find((result) => result.card.id === event.cardId);
    // Skipped cards are not part of the scoring and cannot be revised.
    if (!previous || previous.outcome === "skipped" || event.outcome === "skipped") return state;
    if (previous.outcome === event.outcome) return state;
    const delta = Number(event.outcome === "correct") - Number(previous.outcome === "correct");
    return {
      ...state,
      roundPoints: state.roundPoints + delta,
      scores: scores.map((score, index) =>
        index === state.turn.teamIndex ? score + delta : score,
      ),
      results: state.results.map((result) =>
        result === previous ? { ...result, outcome: event.outcome } : result,
      ),
    };
  }
  if (event.type === "resolveCard") {
    if (
      state.status !== "roundRunning" ||
      event.turn.round !== state.turn.round ||
      event.turn.teamIndex !== state.turn.teamIndex ||
      event.cardId !== state.card.id
    )
      return state;

    const { skipsPerRound } = configuration;
    if (
      event.outcome === "skipped" &&
      skipsPerRound !== undefined &&
      countSkips(state.results) >= skipsPerRound
    )
      return state;

    const updated = {
      configuration,
      turn: state.turn,
      roundPoints: state.roundPoints + (event.outcome === "correct" ? 1 : 0),
      scores: scores.map((score, index) =>
        event.outcome === "correct" && index === state.turn.teamIndex ? score + 1 : score,
      ),
      resolvedCardIds: resolvedCardIds.includes(event.cardId)
        ? resolvedCardIds
        : [...resolvedCardIds, event.cardId],
      results: [...state.results, { card: state.card, outcome: event.outcome }],
    };
    const [card, ...remainingCards] = state.remainingCards;
    return card
      ? { ...updated, status: "roundRunning", card, remainingCards }
      : { ...updated, status: "roundEnded" };
  }
  if (event.type === "addCards") {
    if (
      state.status !== "roundRunning" ||
      event.turn.round !== state.turn.round ||
      event.turn.teamIndex !== state.turn.teamIndex
    )
      return state;
    // Cards may return in a later turn, but never twice within the same turn.
    const seen = new Set([
      state.card.id,
      ...state.remainingCards.map((c) => c.id),
      ...state.results.map((result) => result.card.id),
    ]);
    const additions: TabooCard[] = [];
    for (const input of event.cards) {
      const result = validateCard(input);
      if (
        !result.valid ||
        result.value.language !== configuration.cardLanguage ||
        seen.has(result.value.id)
      )
        continue;
      seen.add(result.value.id);
      additions.push(result.value);
    }
    return additions.length === 0
      ? state
      : { ...state, remainingCards: [...state.remainingCards, ...additions] };
  }
  if (event.type === "restartRound") {
    if (
      state.status !== "roundRunning" ||
      event.turn.round !== state.turn.round ||
      event.turn.teamIndex !== state.turn.teamIndex
    )
      return state;
    // The turn starts over with new cards: cards already shown in this turn may not return, so
    // the team cannot profit from having seen them.
    const seen = new Set([state.card.id, ...state.results.map((result) => result.card.id)]);
    const cards: TabooCard[] = [];
    for (const input of [event.card, ...(event.remainingCards ?? [])]) {
      const result = validateCard(input);
      if (
        !result.valid ||
        result.value.language !== configuration.cardLanguage ||
        seen.has(result.value.id)
      )
        return state;
      seen.add(result.value.id);
      cards.push(result.value);
    }
    const [card, ...remainingCards] = cards;
    if (!card) return state;
    return {
      ...state,
      card,
      remainingCards,
      roundPoints: 0,
      results: [],
      resolvedCardIds: resolvedCardIds.includes(state.card.id)
        ? resolvedCardIds
        : [...resolvedCardIds, state.card.id],
      scores: scores.map((score, index) =>
        index === state.turn.teamIndex ? score - state.roundPoints : score,
      ),
    };
  }
  if (event.type === "endRound") {
    if (
      state.status !== "roundRunning" ||
      event.turn.round !== state.turn.round ||
      event.turn.teamIndex !== state.turn.teamIndex
    )
      return state;
    return {
      status: "roundEnded",
      configuration,
      turn: state.turn,
      scores,
      resolvedCardIds,
      roundPoints: state.roundPoints,
      results: state.results,
    };
  }

  if (
    event.type === "beginTiebreakAttempt" ||
    event.type === "answerTiebreak" ||
    event.type === "endTiebreakAttempt" ||
    event.type === "reviseTiebreakResult"
  )
    return transitionTiebreak(state, event);

  if (state.status !== "setup" && state.status !== "roundEnded") return state;
  let turn: Turn = { round: 1, teamIndex: 0 };
  if (state.status === "roundEnded") {
    const nextTurn = getNextTabooTurn(state);
    const roundComplete = state.turn.teamIndex === configuration.teams.length - 1;
    const mayFinish = !nextTurn || (configuration.roundsPerTeam === "unlimited" && roundComplete);
    if (event.type === "finishGame" && !mayFinish) return state;
    if (!nextTurn || (event.type === "finishGame" && mayFinish)) {
      if (event.type !== "finishGame") return state;
      const highestScore = scores.reduce((highest, score) => Math.max(highest, score), 0);
      const leaders = configuration.teams
        .map((team, index) => ({ team, index }))
        .filter(({ index }) => scores[index] === highestScore);
      if (
        configuration.tiebreak === true &&
        leaders.length >= 2 &&
        leaders.length <= TIEBREAK_MAX_TEAMS
      ) {
        return {
          ...state,
          status: "tiebreak",
          contenders: leaders.map(({ index }) => index),
          attempts: [],
          usedCardIds: [],
        };
      }
      return { ...state, status: "gameEnded", winnerIds: leaders.map(({ team }) => team.id) };
    }
    turn = nextTurn;
  }

  if (event.type !== "startRound") return state;
  const seen = new Set<string>();
  const cards: TabooCard[] = [];
  for (const input of [event.card, ...(event.remainingCards ?? [])]) {
    const result = validateCard(input);
    if (
      !result.valid ||
      result.value.language !== configuration.cardLanguage ||
      seen.has(result.value.id)
    )
      return state;
    seen.add(result.value.id);
    cards.push(result.value);
  }
  const [card, ...remainingCards] = cards;
  if (!card) return state;
  return {
    status: "roundRunning",
    configuration,
    turn,
    roundPoints: 0,
    results: [],
    card,
    remainingCards,
    scores,
    resolvedCardIds,
  };
}

type TiebreakState = Extract<TabooState, { status: "tiebreak" }>;

function validTiebreakCard(
  state: TiebreakState,
  input: TabooCard,
  taken: ReadonlySet<string>,
): TabooCard | undefined {
  const result = validateCard(input);
  if (
    !result.valid ||
    result.value.language !== state.configuration.cardLanguage ||
    taken.has(result.value.id)
  )
    return undefined;
  return result.value;
}

function finishTiebreakAttempt(
  state: TiebreakState,
  active: TiebreakActive,
  elapsedMs: number,
): TabooState {
  const attempts = [
    ...state.attempts,
    {
      teamIndex: active.teamIndex,
      solved: active.solved,
      timeMs: Math.max(0, elapsedMs),
      results: active.results,
    },
  ];
  const base = {
    configuration: state.configuration,
    scores: state.scores,
    resolvedCardIds: state.resolvedCardIds,
    turn: state.turn,
    roundPoints: state.roundPoints,
    results: state.results,
  };
  if (attempts.length < state.contenders.length) {
    return {
      ...base,
      status: "tiebreak",
      contenders: state.contenders,
      attempts,
      usedCardIds: state.usedCardIds,
    };
  }
  return {
    ...base,
    status: "gameEnded",
    winnerIds: tiebreakWinnerIds(state.configuration, attempts),
    tiebreak: attempts,
  };
}

/** Most cards first, then the shortest time; equal results share the win. */
function tiebreakWinnerIds(
  configuration: GameConfiguration,
  attempts: readonly TiebreakAttempt[],
): string[] {
  const ranked = [...attempts].sort((a, b) => b.solved - a.solved || a.timeMs - b.timeMs);
  const best = ranked[0];
  return ranked
    .filter((attempt) => attempt.solved === best?.solved && attempt.timeMs === best.timeMs)
    .flatMap((attempt) => {
      const team = configuration.teams[attempt.teamIndex];
      return team ? [team.id] : [];
    });
}

/** Applies a correction to the attempts; nothing changes for a card that cannot be corrected. */
function reviseAttempts(
  attempts: readonly TiebreakAttempt[],
  event: Extract<TabooEvent, { type: "reviseTiebreakResult" }>,
): readonly TiebreakAttempt[] | undefined {
  const attempt = attempts.find((candidate) => candidate.teamIndex === event.teamIndex);
  const previous = attempt?.results.find((result) => result.card.id === event.cardId);
  // Skipped cards are not part of the scoring and cannot be revised.
  if (!attempt || !previous || previous.outcome === "skipped" || event.outcome === "skipped")
    return undefined;
  if (previous.outcome === event.outcome) return undefined;
  const results = attempt.results.map((result) =>
    result === previous ? { ...result, outcome: event.outcome } : result,
  );
  const solved = results.filter((result) => result.outcome === "correct").length;
  // A forbidden card was replaced, so it can only count when the attempt has room for it.
  if (solved > TIEBREAK_CARD_COUNT) return undefined;
  return attempts.map((candidate) =>
    candidate === attempt ? { ...candidate, results, solved } : candidate,
  );
}

function transitionTiebreak(
  state: TabooState,
  event: Extract<
    TabooEvent,
    {
      type:
        "beginTiebreakAttempt" | "answerTiebreak" | "endTiebreakAttempt" | "reviseTiebreakResult";
    }
  >,
): TabooState {
  if (event.type === "reviseTiebreakResult") {
    if (state.status === "tiebreak" && !state.active) {
      const attempts = reviseAttempts(state.attempts, event);
      return attempts ? { ...state, attempts } : state;
    }
    if (state.status === "gameEnded" && state.tiebreak) {
      const attempts = reviseAttempts(state.tiebreak, event);
      return attempts
        ? {
            ...state,
            tiebreak: attempts,
            winnerIds: tiebreakWinnerIds(state.configuration, attempts),
          }
        : state;
    }
    return state;
  }
  if (state.status !== "tiebreak") return state;
  const { active } = state;
  if (event.type === "beginTiebreakAttempt") {
    const teamIndex = state.contenders[state.attempts.length];
    if (active || teamIndex === undefined || event.cards.length !== TIEBREAK_CARD_COUNT)
      return state;
    const taken = new Set(state.usedCardIds);
    const cards: TabooCard[] = [];
    for (const input of event.cards) {
      const card = validTiebreakCard(state, input, taken);
      if (!card) return state;
      taken.add(card.id);
      cards.push(card);
    }
    return {
      ...state,
      usedCardIds: [...state.usedCardIds, ...cards.map((card) => card.id)],
      resolvedCardIds: [
        ...state.resolvedCardIds,
        ...cards.map((card) => card.id).filter((id) => !state.resolvedCardIds.includes(id)),
      ],
      active: { teamIndex, cards, index: 0, solved: 0, skipUsed: false, wrong: 0, results: [] },
    };
  }
  if (!active) return state;
  // A broken clock value must never reach the ranking.
  if (!Number.isFinite(event.elapsedMs)) return state;
  if (event.type === "endTiebreakAttempt") {
    return finishTiebreakAttempt(state, active, event.elapsedMs);
  }
  if (event.outcome === "forbiddenWord" || event.outcome === "skipped") {
    const skipping = event.outcome === "skipped";
    // A skip is limited to once; a forbidden word is simply wrong and always gets a new card.
    if ((skipping && active.skipUsed) || !event.replacement) return state;
    const replacement = validTiebreakCard(state, event.replacement, new Set(state.usedCardIds));
    if (!replacement) return state;
    const shown = active.cards[active.index];
    return {
      ...state,
      usedCardIds: [...state.usedCardIds, replacement.id],
      active: {
        ...active,
        results: shown
          ? [...active.results, { card: shown, outcome: event.outcome }]
          : active.results,
        skipUsed: active.skipUsed || skipping,
        wrong: active.wrong + (skipping ? 0 : 1),
        cards: active.cards.map((card, index) => (index === active.index ? replacement : card)),
      },
    };
  }
  const solved = active.solved + 1;
  const shown = active.cards[active.index];
  const results = shown
    ? [...active.results, { card: shown, outcome: "correct" as const }]
    : active.results;
  if (solved >= TIEBREAK_CARD_COUNT) {
    return finishTiebreakAttempt(state, { ...active, solved, results }, event.elapsedMs);
  }
  return { ...state, active: { ...active, solved, results, index: active.index + 1 } };
}

export function countSkips(results: readonly TabooResult[]): number {
  return results.filter((result) => result.outcome === "skipped").length;
}

export function getNextTabooTurn(
  state: Extract<TabooState, { status: "roundEnded" }>,
): Turn | null {
  const { configuration, turn } = state;
  const nextTeam = turn.teamIndex + 1;
  if (nextTeam < configuration.teams.length) return { round: turn.round, teamIndex: nextTeam };
  if (configuration.roundsPerTeam !== "unlimited" && turn.round >= configuration.roundsPerTeam)
    return null;
  return { round: turn.round + 1, teamIndex: 0 };
}
