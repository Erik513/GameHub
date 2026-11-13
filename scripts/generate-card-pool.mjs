// Generates Taboo cards for the card pool on this computer with a local AI (Ollama or LM Studio).
//
// This is a developer tool, not part of the app and not part of the build. It writes a working pack
// to `work/pool-<language>.json` (same format as the shipped packs in `src/data/pool`) and a log of
// rejected cards to `work/pool-<language>.rejected.jsonl`. The run can be stopped and started again;
// it continues where it stopped. The cards are reviewed and merged into `src/data/pool` in a
// separate step (Ta-09-04), nothing here changes the app.
//
// Example:
//   node scripts/generate-card-pool.mjs --language de --category food --difficulty easy --target 5
//   node scripts/generate-card-pool.mjs --language en --dry-run

import { appendFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import {
  chooseProvider,
  describeError,
  providerDefaults,
  providerFlags,
  readJson,
  validateProviderOptions,
  writeAtomic,
} from "./lib/pool-tools.mjs";

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
    maxMisses: 4,
    work: "work",
    dryRun: false,
    ...providerDefaults,
  };
  const names = {
    "--language": ["language", String],
    "--category": ["category", String],
    "--difficulty": ["difficulty", String],
    "--target": ["target", Number],
    "--batch": ["batch", Number],
    "--max-misses": ["maxMisses", Number],
    "--work": ["work", String],
    ...providerFlags,
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
  validateProviderOptions(options);
  for (const key of ["target", "batch", "maxMisses"]) {
    if (!Number.isSafeInteger(options[key]) || options[key] < 1) {
      throw new Error(`--${key === "maxMisses" ? "max-misses" : key} must be a positive integer`);
    }
  }
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
            console.log(`  request failed: ${describeError(error)}`);
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
