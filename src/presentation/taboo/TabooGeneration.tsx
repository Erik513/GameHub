import type {
  TabooCardGenerator,
  TabooGenerationRequest,
} from "../../business/games/taboo/cardGenerator";
import type { TabooCard } from "../../business/games/taboo/model";
import { reviewGeneratedCards } from "../../business/games/taboo/validateGeneratedCards";

export interface TabooGenerators {
  readonly local: TabooCardGenerator;
  readonly discover?: (signal: AbortSignal) => Promise<TabooCardGenerator | undefined>;
}

export async function generateHiddenCards(
  generators: TabooGenerators,
  requests: readonly TabooGenerationRequest[],
  existing: readonly TabooCard[],
  signal: AbortSignal,
): Promise<readonly TabooCard[]> {
  const generator = (await generators.discover?.(signal)) ?? generators.local;
  const accepted: TabooCard[] = [];
  for (const request of requests) {
    if (signal.aborted) break;
    const result = await generator.generate(request, {
      get aborted() {
        return signal.aborted;
      },
      subscribe(onAbort) {
        signal.addEventListener("abort", onAbort, { once: true });
        return () => signal.removeEventListener("abort", onAbort);
      },
    });
    if (result.status === "failed") continue;
    const review = reviewGeneratedCards(
      request,
      result.candidates,
      [...existing, ...accepted],
      () => crypto.randomUUID(),
    );
    accepted.push(...review.accepted);
  }
  return accepted;
}
