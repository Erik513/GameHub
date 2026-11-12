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

/**
 * Explains a failed request. Node reports every network problem as "fetch failed"; the real reason
 * (for example a refused connection or a timeout) sits in `error.cause`.
 */
export function describeError(error) {
  const cause = error?.cause;
  const detail = cause?.code ?? cause?.message;
  return detail ? `${error.message} (${detail})` : String(error?.message ?? error);
}

/**
 * Sends a request and hands every line of the streamed answer to `onLine`. A streamed answer is
 * used because a thinking model can take many minutes before the first word, and a request that
 * waits for the whole answer is cut off by Node after 5 minutes without any data.
 */
async function streamLines(url, init, onLine) {
  const response = await fetch(url, { redirect: "error", ...init });
  if (!response.ok) throw new Error(`${url} answered ${response.status}`);
  const decoder = new TextDecoder();
  let buffer = "";
  let lines = 0;
  for await (const chunk of response.body) {
    buffer += decoder.decode(chunk, { stream: true });
    let end = buffer.indexOf("\n");
    while (end >= 0) {
      const line = buffer.slice(0, end).trim();
      buffer = buffer.slice(end + 1);
      if (line) onLine(line);
      lines += 1;
      // A dot every 200 lines shows that the model is still answering.
      if (lines % 200 === 0) process.stdout.write(".");
      end = buffer.indexOf("\n");
    }
  }
  if (buffer.trim()) onLine(buffer.trim());
  if (lines >= 200) process.stdout.write("\n");
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
      let text = "";
      await streamLines(
        `${options.ollamaUrl}/api/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(1_200_000),
          body: JSON.stringify({
            model,
            stream: true,
            format: schema,
            options: { temperature: options.temperature },
            messages: [
              { role: "system", content: prompt.system },
              { role: "user", content: prompt.user },
            ],
          }),
        },
        (line) => {
          text += JSON.parse(line)?.message?.content ?? "";
        },
      );
      return text;
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
      let text = "";
      await streamLines(
        `${options.lmstudioUrl}/v1/chat/completions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(1_200_000),
          body: JSON.stringify({
            model,
            stream: true,
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
        },
        (line) => {
          if (!line.startsWith("data:")) return;
          const payload = line.slice(5).trim();
          if (payload === "[DONE]") return;
          // The reasoning of a thinking model arrives as `reasoning_content` and is not part of the answer.
          text += JSON.parse(payload)?.choices?.[0]?.delta?.content ?? "";
        },
      );
      return text;
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
      problems.push(`${name}: ${describeError(error)}`);
    }
  }
  throw new Error(`No AI available.\n  ${problems.join("\n  ")}`);
}

export async function writeAtomic(path, text) {
  const temporary = `${path}.tmp`;
  await writeFile(temporary, text, "utf8");
  await rename(temporary, path);
}
