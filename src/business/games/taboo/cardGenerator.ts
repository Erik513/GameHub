import type { Difficulty, TabooCard } from "./model";

export interface TabooGenerationRequest {
  readonly language: TabooCard["language"];
  readonly categoryId: TabooCard["categoryId"];
  readonly difficulty: Difficulty;
  readonly count: number;
}

export interface TabooGenerationCapabilities {
  readonly languages: readonly TabooCard["language"][];
  readonly maxCardsPerRequest: number;
  readonly worksOffline: boolean;
}

/** Subscription returns an unsubscribe function. An already cancelled request must not start. */
export interface GenerationCancellation {
  readonly aborted: boolean;
  subscribe(onAbort: () => void): () => void;
}

/** Providers map into this shape. The validation pipeline checks the untrusted field values. */
export interface TabooCardCandidate {
  readonly language?: unknown;
  readonly categoryId?: unknown;
  readonly difficulty?: unknown;
  readonly term?: unknown;
  readonly forbiddenWords?: unknown;
}

export type TabooGenerationErrorCode =
  | "cancelled"
  | "unsupported_request"
  | "unavailable"
  | "timeout"
  | "invalid_response"
  | "generation_failed";

export type TabooGenerationResult =
  | { readonly status: "complete" | "partial"; readonly candidates: readonly TabooCardCandidate[] }
  | { readonly status: "failed"; readonly code: TabooGenerationErrorCode };

export interface TabooCardGenerator {
  readonly capabilities: TabooGenerationCapabilities;

  /** Expected provider failures and cancellation resolve as typed results. */
  generate(
    request: TabooGenerationRequest,
    cancellation?: GenerationCancellation,
  ): Promise<TabooGenerationResult>;
}
