// Puts a batch of cards written by hand (or by any other tool) through the same strict checks as
// the generated cards and adds the accepted ones to the working pack in `work/`.
// Developer tool, not part of the app and not part of the build.
//
// The batch file looks like:
//   { "cards": [ { "categoryId": "food", "difficulty": "easy", "term": "Pizza",
//                  "forbiddenWords": ["Käse", "Teig", "Italien", "Ofen"] } ] }
//
// Example:
//   node scripts/import-card-batch.mjs --language de --file work/batch-de-food.json --score 5
//
// With --score every accepted card also gets a verdict, so the review sheet treats it as judged
// and only shows a sample of it. Without it the cards stay unjudged and are all shown.

import { appendFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { readJson, writeAtomic } from "./lib/pool-tools.mjs";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const difficulties = ["easy", "medium", "hard"];

function parseArguments(argv) {
  const options = { work: "work", dryRun: false };
  const names = {
    "--language": ["language", String],
    "--file": ["file", String],
    "--work": ["work", String],
    "--score": ["score", Number],
    "--note": ["note", String],
  };
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    if (flag === "--dry-run") options.dryRun = true;
    else if (names[flag]) {
      const [key, convert] = names[flag];
      const value = argv[index + 1];
      if (value === undefined) throw new Error(`Missing value for ${flag}`);
      options[key] = convert(value);
      index += 1;
    } else throw new Error(`Unknown option ${flag}`);
  }
  if (options.language !== "de" && options.language !== "en") {
    throw new Error("--language must be de or en");
  }
  if (!options.file) throw new Error("--file is required");
  if (
    options.score !== undefined &&
    !(Number.isInteger(options.score) && options.score >= 1 && options.score <= 5)
  ) {
    throw new Error("--score must be an integer from 1 to 5");
  }
  return options;
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
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

    const { language } = options;
    const base = packModule.parseTabooCardPack(
      await readJson(join(projectRoot, "src", "data", "pool", `${language}.json`)),
    );
    const workDirectory = join(projectRoot, options.work);
    const workPath = join(workDirectory, `pool-${language}.json`);
    const rejectedPath = join(workDirectory, `pool-${language}.rejected.jsonl`);
    const verdictsPath = join(workDirectory, `pool-${language}.verdicts.json`);
    await mkdir(workDirectory, { recursive: true });

    const readOr = async (path, fallback) => {
      try {
        return await readJson(path);
      } catch (error) {
        if (error?.code === "ENOENT") return fallback;
        throw error;
      }
    };
    let pack = packModule.parseTabooCardPack(
      await readOr(workPath, { ...workFile({ ...base, cards: [] }) }),
    );
    pack = { ...pack, categories: base.categories };
    const verdicts = await readOr(verdictsPath, {});

    const batch = await readJson(join(projectRoot, options.file));
    if (!Array.isArray(batch.cards)) throw new Error("The batch file needs a cards list");

    // Group by category and difficulty, because the acceptance rules work on one such group.
    const groups = new Map();
    for (const item of batch.cards) {
      const key = `${item?.categoryId}/${item?.difficulty}`;
      groups.set(key, [...(groups.get(key) ?? []), item]);
    }
    const everything = () => [
      ...standard.tabooStandardCards.filter((card) => card.language === language),
      ...base.cards,
      ...pack.cards,
    ];
    let added = 0;
    const rejectedLines = [];
    for (const [key, items] of groups) {
      const [categoryId, difficulty] = key.split("/");
      const category = base.categories.find((entry) => entry.id === categoryId);
      if (!category || !difficulties.includes(difficulty)) {
        throw new Error(`Unknown category or difficulty: ${key}`);
      }
      const review = generation.reviewPoolCards(
        { category, difficulty, language },
        items,
        everything(),
      );
      pack = { ...pack, cards: [...pack.cards, ...review.accepted] };
      for (const card of review.accepted) {
        if (options.score)
          verdicts[card.id] = { score: options.score, problem: options.note ?? "" };
      }
      for (const item of review.rejected)
        rejectedLines.push(JSON.stringify({ category: categoryId, difficulty, ...item }));
      added += review.accepted.length;
      console.log(`${key}: +${review.accepted.length}, rejected ${review.rejected.length}`);
      for (const item of review.rejected)
        console.log(`    rejected "${item.term}": ${item.reason}`);
    }
    console.log(`Accepted ${added} of ${batch.cards.length} cards.`);
    if (options.dryRun) {
      console.log("Dry run: nothing written.");
      return;
    }
    await writeAtomic(workPath, JSON.stringify(workFile(pack), null, 2) + "\n");
    if (options.score) await writeAtomic(verdictsPath, JSON.stringify(verdicts, null, 2) + "\n");
    if (rejectedLines.length > 0)
      await appendFile(rejectedPath, rejectedLines.join("\n") + "\n", "utf8");
    console.log(`Working pack: ${workPath}`);
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
