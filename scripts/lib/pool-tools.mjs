// Shared helpers of the card pool tools (scripts/generate-card-pool.mjs and review-card-pool.mjs):
// reading and writing working files and talking to a local AI (Ollama or LM Studio).

import { readFile, rename, writeFile } from "node:fs/promises";

/** Command line flags that select and configure the AI; both tools accept them. */
export const providerFlags = {
  "--provider": ["provider", String],
  "--model": ["model", String],
  "--temperature": ["temperature", Number],
  "--ollama-url": ["ollamaUrl", String],
  "--lmstudio-url": ["lmstudioUrl", String],
};

export const providerDefaults = {
  provider: "auto",
  temperature: 0.8,
  ollamaUrl: "http://127.0.0.1:11434",
  lmstudioUrl: "http://127.0.0.1:1234",
};

export function validateProviderOptions(options) {
  if (!["auto", "ollama", "lmstudio"].includes(options.provider)) {
    throw new Error("--provider must be auto, ollama or lmstudio");
  }
  if (!Number.isFinite(options.temperature)) throw new Error("--temperature must be a number");
}

export async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

export async function fetchJson(url, init) {
  const response = await fetch(url, { redirect: "error", ...init });
  if (!response.ok) throw new Error(`${url} answered ${response.status}`);
  return response.json();
}

function ollamaProvider(options, schema) {
  return {
    name: "ollama",
    async chooseModel() {
      const tags = await fetchJson(`${options.ollamaUrl}/api/tags`, {
        signal: AbortSignal.timeout(3000),
      });
      const names = (tags.models ?? [])
        .map((item) => item?.name)
        .filter((name) => typeof name === "string" && !/embed|[-:]cloud(?:$|:)/iu.test(name));
      const model = options.model ?? names[0];
      if (!model) throw new Error("Ollama has no text model. Run `ollama pull <model>` first.");
      return model;
    },
    async chat(model, prompt) {
      const reply = await fetchJson(`${options.ollamaUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(600_000),
        body: JSON.stringify({
          model,
          stream: false,
          format: schema,
          options: { temperature: options.temperature },
          messages: [
            { role: "system", content: prompt.system },
            { role: "user", content: prompt.user },
          ],
        }),
      });
      return String(reply?.message?.content ?? "");
    },
  };
}

function lmStudioProvider(options, schema) {
  return {
    name: "lmstudio",
    async chooseModel() {
      const listed = await fetchJson(`${options.lmstudioUrl}/api/v0/models`, {
        signal: AbortSignal.timeout(3000),
      });
      const chat = (listed.data ?? []).filter(
        (item) =>
          typeof item?.id === "string" &&
          (item.type === "llm" || item.type === "vlm") &&
          !/coder|embed/iu.test(item.id),
      );
      if (options.model) return options.model;
      // A model that is not loaded would be loaded on demand, which can take minutes and a lot of
      // memory. So without --model only an already loaded model is used.
      const loaded = chat.find((item) => item.state === "loaded");
      if (loaded) return loaded.id;
      throw new Error(
        `LM Studio has no loaded chat model. Load one there or pass --model. Available: ${
          chat.map((item) => item.id).join(", ") || "none"
        }`,
      );
    },
    async chat(model, prompt) {
      const reply = await fetchJson(`${options.lmstudioUrl}/v1/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(600_000),
        body: JSON.stringify({
          model,
          temperature: options.temperature,
          // Thinking models spend many tokens on reasoning before the answer.
          max_tokens: 8000,
          response_format: {
            type: "json_schema",
            json_schema: { name: "cards", strict: true, schema },
          },
          messages: [
            { role: "system", content: prompt.system },
            { role: "user", content: prompt.user },
          ],
        }),
      });
      return String(reply?.choices?.[0]?.message?.content ?? "");
    },
  };
}

export async function chooseProvider(options, schema) {
  const candidates = options.provider === "auto" ? ["ollama", "lmstudio"] : [options.provider];
  const problems = [];
  for (const name of candidates) {
    const provider = (name === "ollama" ? ollamaProvider : lmStudioProvider)(options, schema);
    try {
      return { provider, model: await provider.chooseModel() };
    } catch (error) {
      problems.push(`${name}: ${error.message}`);
    }
  }
  throw new Error(`No AI available.\n  ${problems.join("\n  ")}`);
}

export async function writeAtomic(path, text) {
  const temporary = `${path}.tmp`;
  await writeFile(temporary, text, "utf8");
  await rename(temporary, path);
}
