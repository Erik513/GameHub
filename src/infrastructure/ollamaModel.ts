function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Finds the first local Ollama text model, or `undefined` when Ollama is not reachable. */
export async function findOllamaModel(
  signal: AbortSignal,
  requestFetch: typeof fetch = fetch,
): Promise<string | undefined> {
  try {
    const response = await requestFetch("http://127.0.0.1:11434/api/tags", {
      redirect: "error",
      signal: AbortSignal.any([signal, AbortSignal.timeout(1500)]),
    });
    if (!response.ok) return;
    const payload: unknown = await response.json();
    if (!isRecord(payload) || !Array.isArray(payload.models)) return;
    for (const item of payload.models as unknown[]) {
      if (
        isRecord(item) &&
        typeof item.name === "string" &&
        item.name.trim() &&
        !/embed|[-:]cloud(?:$|:)/i.test(item.name)
      ) {
        return item.name;
      }
    }
  } catch {
    return;
  }
}
