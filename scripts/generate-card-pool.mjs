// Generates Taboo cards for the card pool on this computer with a local AI (Ollama or LM Studio).
//
// This is a developer tool, not part of the app and not part of the build. It writes a working pack
// to `work/pool-<language>.json` (same format as the shipped packs in `src/data/pool`) and a log of
// rejected cards to `work/pool-<language>.rejected.jsonl`. The run can be stopped and started again;
// it continues where it stopped. The cards are reviewed and merged into `src/data/pool` in a
// separate step (PH-15-04), nothing here changes the app.
//
// Example:
//   node scripts/generate-card-pool.mjs --language de --category food --difficulty easy --target 5
//   node scripts/generate-card-pool.mjs --language en --dry-run

import { appendFile, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const difficulties = ["easy", "medium", "hard"];

const usage = `Usage: node scripts/generate-card-pool.mjs --language de|en [options]

  --language       de or en (required)
  --category       a category id from src/data/pool/<language>.json, or "all" (default)
  --difficulty     easy, medium, hard or "all" (default)
  --target         accepted cards wanted per category and difficulty (default 17)
  --batch          cards asked from the AI per request (default 10)
  --provider       auto (default), ollama or lmstudio
  --model          model name; needed for LM Studio when no chat model is loaded
  --temperature    sampling temperature (default 0.8)
  --max-misses     stop a category and difficulty after this many requests in a row without a new card (default 4)
  --work           folder for the working files (default work)
  --ollama-url     default http://127.0.0.1:11434
  --lmstudio-url   default http://127.0.0.1:1234
  --dry-run        print the prompt of the first request and stop (no AI is contacted)
`;

function parseArguments(argv) {
  const options = {
    category: "all",
    difficulty: "all",
    target: 17,
    batch: 10,
    provider: "auto",
    temperature: 0.8,
    maxMisses: 4,
    work: "work",
    ollamaUrl: "http://127.0.0.1:11434",
    lmstudioUrl: "http://127.0.0.1:1234",
    dryRun: false,
  };
  const names = {
    "--language": ["language", String],
    "--category": ["category", String],
    "--difficulty": ["difficulty", String],
    "--target": ["target", Number],
    "--batch": ["batch", Number],
    "--provider": ["provider", String],
    "--model": ["model", String],
    "--temperature": ["temperature", Number],
    "--max-misses": ["maxMisses", Number],
    "--work": ["work", String],
    "--ollama-url": ["ollamaUrl", String],
    "--lmstudio-url": ["lmstudioUrl", String],
  };
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    if (flag === "--dry-run") {
      options.dryRun = true;
    } else if (flag === "--help" || flag === "-h") {
      options.help = true;
    } else if (names[flag]) {
      const [key, convert] = names[flag];
      const value = argv[index + 1];
      if (value === undefined) throw new Error(`Missing value for ${flag}`);
      options[key] = convert(value);
      index += 1;
    } else {
      throw new Error(`Unknown option ${flag}`);
    }
  }
  return options;
}

function validateOptions(options) {
  if (options.help) return;
  if (options.language !== "de" && options.language !== "en") {
    throw new Error("--language must be de or en");
  }
  if (!["auto", "ollama", "lmstudio"].includes(options.provider)) {
    throw new Error("--provider must be auto, ollama or lmstudio");
  }
  for (const key of ["target", "batch", "maxMisses"]) {
    if (!Number.isSafeInteger(options[key]) || options[key] < 1) {
      throw new Error(`--${key === "maxMisses" ? "max-misses" : key} must be a positive integer`);
    }
  }
  if (!Number.isFinite(options.temperature)) throw new Error("--temperature must be a number");
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function fetchJson(url, init) {
  const response = await fetch(url, { redirect: "error", ...init });
  if (!response.ok) throw new Error(`${url} answered ${response.status}`);
  return response.json();
}

// ---- providers -------------------------------------------------------------------------------

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

async function chooseProvider(options, schema) {
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

// ---- working files ---------------------------------------------------------------------------

async function writeAtomic(path, text) {
  const temporary = `${path}.tmp`;
  await writeFile(temporary, text, "utf8");
  await rename(temporary, path);
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    console.log(usage);
    return;
  }
  validateOptions(options);

  const server = await createServer({
    configFile: false,
    root: projectRoot,
    appType: "custom",
    logLevel: "error",
    server: { middlewareMode: true },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  try {
    const generation = await server.ssrLoadModule("/src/business/games/taboo/poolGeneration.ts");
    const packModule = await server.ssrLoadModule("/src/business/games/taboo/cardPack.ts");
    const standard = await server.ssrLoadModule("/src/data/tabooStandardCards.ts");

    const language = options.language;
    const basePath = join(projectRoot, "src", "data", "pool", `${language}.json`);
    const base = packModule.parseTabooCardPack(await readJson(basePath));
    const workDirectory = join(projectRoot, options.work);
    const workPath = join(workDirectory, `pool-${language}.json`);
    const rejectedPath = join(workDirectory, `pool-${language}.rejected.jsonl`);
    await mkdir(workDirectory, { recursive: true });

    let pack;
    try {
      pack = packModule.parseTabooCardPack(await readJson(workPath));
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
      pack = { ...base, cards: [] };
    }
    // The categories always come from the shipped pack, so a changed category list is picked up.
    pack = { ...pack, categories: base.categories };

    const categories =
      options.category === "all"
        ? base.categories
        : base.categories.filter((category) => category.id === options.category);
    if (categories.length === 0) {
      throw new Error(
        `Unknown category "${options.category}". Known: ${base.categories.map((c) => c.id).join(", ")}`,
      );
    }
    const levels = options.difficulty === "all" ? difficulties : [options.difficulty];
    if (levels.some((level) => !difficulties.includes(level))) {
      throw new Error("--difficulty must be easy, medium, hard or all");
    }

    const everything = () => [
      ...standard.tabooStandardCards.filter((card) => card.language === language),
      ...base.cards,
      ...pack.cards,
    ];
    const countOf = (categoryId, difficulty) =>
      everything().filter(
        (card) => card.categoryId === categoryId && card.difficulty === difficulty,
      ).length;
    const termsOf = (categoryId) =>
      everything()
        .filter((card) => card.categoryId === categoryId)
        .map((card) => card.term);

    if (options.dryRun) {
      const category = categories[0];
      const prompt = generation.buildPoolPrompt({
        category,
        count: options.batch,
        difficulty: levels[0],
        language,
        avoidTerms: termsOf(category.id),
      });
      console.log("--- system ---\n" + prompt.system + "\n--- user ---\n" + prompt.user);
      return;
    }

    const { provider, model } = await chooseProvider(options, generation.poolResponseSchema);
    console.log(`Using ${provider.name}, model ${model}. Working file: ${workPath}`);

    let added = 0;
    let rejectedTotal = 0;
    for (const category of categories) {
      for (const difficulty of levels) {
        let misses = 0;
        while (countOf(category.id, difficulty) < options.target && misses < options.maxMisses) {
          const need = options.target - countOf(category.id, difficulty);
          // Ask for a few more than needed, because some candidates will be rejected.
          const asked = Math.min(options.batch, need + 3);
          const prompt = generation.buildPoolPrompt({
            category,
            count: asked,
            difficulty,
            language,
            avoidTerms: termsOf(category.id),
          });
          let text = "";
          try {
            text = await provider.chat(model, prompt);
          } catch (error) {
            console.log(`  request failed: ${error.message}`);
          }
          const review = generation.reviewPoolCards(
            { category, difficulty, language },
            generation.parsePoolResponse(text),
            everything(),
          );
          const accepted = review.accepted.slice(0, need);
          if (accepted.length > 0) {
            pack = { ...pack, cards: [...pack.cards, ...accepted] };
            await writeAtomic(workPath, JSON.stringify(workFile(pack), null, 2) + "\n");
          }
          if (review.rejected.length > 0) {
            const lines = review.rejected.map((item) =>
              JSON.stringify({ category: category.id, difficulty, ...item }),
            );
            await appendFile(rejectedPath, lines.join("\n") + "\n", "utf8");
          }
          misses = accepted.length > 0 ? 0 : misses + 1;
          added += accepted.length;
          rejectedTotal += review.rejected.length;
          console.log(
            `${category.id}/${difficulty}: +${accepted.length}, rejected ${review.rejected.length}, now ${countOf(category.id, difficulty)}/${options.target}`,
          );
        }
        if (countOf(category.id, difficulty) < options.target) {
          console.log(
            `${category.id}/${difficulty}: stopped below the target after ${misses} empty requests`,
          );
        }
      }
    }
    console.log(`Done. Added ${added} cards, rejected ${rejectedTotal}. File: ${workPath}`);
  } finally {
    await server.close();
  }
}

/** The shipped pack format: cards carry no language, it belongs to the whole pack. */
function workFile(pack) {
  return {
    format: "gamehub-taboo-pack",
    version: 1,
    language: pack.language,
    categories: pack.categories,
    cards: pack.cards.map(({ id, term, forbiddenWords, categoryId, difficulty }) => ({
      id,
      term,
      forbiddenWords,
      categoryId,
      difficulty,
    })),
  };
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exitCode = 1;
});
