// Reviews the cards made by scripts/generate-card-pool.mjs and merges the good ones into the pool.
// Developer tool, not part of the app and not part of the build.
//
// Steps (all work on `work/pool-<language>.*`):
//   1. judge  A second AI pass gives every card a score from 1 to 5 and a short problem text.
//   2. sheet  Writes `work/pool-<language>.review.html`: the doubtful cards plus a random sample of
//             the good ones per category and difficulty. Open it in a browser, tick the cards to
//             drop, copy the list into `work/pool-<language>.drops.txt` (one card id per line).
//   3. merge  Puts judged, good, not dropped cards into `src/data/pool/<language>.json`.
//
// Examples:
//   node scripts/review-card-pool.mjs judge --language de
//   node scripts/review-card-pool.mjs sheet --language de --per-cell 3
//   node scripts/review-card-pool.mjs merge --language de --min-score 4 --dry-run

import { mkdir, readFile, writeFile } from "node:fs/promises";
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
const difficultyOrder = ["easy", "medium", "hard"];

const usage = `Usage: node scripts/review-card-pool.mjs <judge|sheet|merge> --language de|en [options]

  judge   second AI pass over the working cards without a verdict
            --limit N        judge at most N cards in this run
            --provider, --model, --temperature, --ollama-url, --lmstudio-url   as in generate-card-pool
  sheet   write the review page
            --per-cell N     good cards to look at per category and difficulty (default 3)
            --below N        cards with a score below N are always shown (default 4)
  merge   put the good cards into src/data/pool/<language>.json
            --min-score N    lowest score that passes (default 4)
            --allow-unjudged let cards without a verdict pass (default: they stay out)
            --dry-run        only show what would be merged
  common: --work <folder> (default work)
`;

function parseArguments(argv) {
  const [command, ...rest] = argv;
  const options = {
    command,
    work: "work",
    limit: Infinity,
    perCell: 3,
    below: 4,
    minScore: 4,
    allowUnjudged: false,
    dryRun: false,
    ...providerDefaults,
  };
  const names = {
    "--language": ["language", String],
    "--work": ["work", String],
    "--limit": ["limit", Number],
    "--per-cell": ["perCell", Number],
    "--below": ["below", Number],
    "--min-score": ["minScore", Number],
    ...providerFlags,
  };
  for (let index = 0; index < rest.length; index += 1) {
    const flag = rest[index];
    if (flag === "--dry-run") options.dryRun = true;
    else if (flag === "--allow-unjudged") options.allowUnjudged = true;
    else if (names[flag]) {
      const [key, convert] = names[flag];
      const value = rest[index + 1];
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
  if (!["judge", "sheet", "merge"].includes(options.command)) {
    throw new Error("The first argument must be judge, sheet or merge");
  }
  if (options.language !== "de" && options.language !== "en") {
    throw new Error("--language must be de or en");
  }
  for (const key of ["perCell", "below", "minScore"]) {
    if (!Number.isFinite(options[key]) || options[key] < 0) {
      throw new Error(
        `--${key.replace(/[A-Z]/gu, (letter) => `-${letter.toLowerCase()}`)} must be a number`,
      );
    }
  }
  if (options.limit !== Infinity && (!Number.isSafeInteger(options.limit) || options.limit < 1)) {
    throw new Error("--limit must be a positive integer");
  }
  if (options.command === "judge") validateProviderOptions(options);
}

async function readJsonOr(path, fallback) {
  try {
    return await readJson(path);
  } catch (error) {
    if (error?.code === "ENOENT") return fallback;
    throw error;
  }
}

async function readTextOr(path, fallback) {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return fallback;
    throw error;
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** A deterministic random source so a sheet can be recreated with the same sample. */
function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function reviewPage({ language, cards, verdicts, categories, total, judged, average, dropsFile }) {
  const names = new Map(categories.map((category) => [category.id, category.names.en]));
  const rows = cards
    .map((card) => {
      const verdict = verdicts[card.id];
      const score = verdict ? String(verdict.score) : "–";
      const level = verdict
        ? verdict.score >= 4
          ? "ok"
          : verdict.score === 3
            ? "warn"
            : "bad"
        : "none";
      return `<tr data-category="${escapeHtml(card.categoryId)}">
  <td><input type="checkbox" value="${escapeHtml(card.id)}" aria-label="drop ${escapeHtml(card.term)}"></td>
  <td><strong>${escapeHtml(card.term)}</strong><br><small>${escapeHtml(names.get(card.categoryId) ?? card.categoryId)} · ${escapeHtml(card.difficulty)}</small></td>
  <td>${card.forbiddenWords.map(escapeHtml).join(" · ")}</td>
  <td class="${level}">${escapeHtml(score)}${verdict?.problem ? `<br><small>${escapeHtml(verdict.problem)}</small>` : ""}</td>
</tr>`;
    })
    .join("\n");
  const options = categories
    .map(
      (category) =>
        `<option value="${escapeHtml(category.id)}">${escapeHtml(category.names.en)}</option>`,
    )
    .join("");
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Card pool review (${escapeHtml(language)})</title>
<style>
body{font:16px/1.45 system-ui,sans-serif;margin:16px;max-width:60rem}
table{border-collapse:collapse;width:100%}td,th{border-top:1px solid #8884;padding:6px 8px;text-align:left;vertical-align:top}
.ok{color:#1b8a4a}.warn{color:#946b00}.bad{color:#c93b2e}small{opacity:.7}
button,select{font:inherit;padding:8px 12px;margin:4px 8px 4px 0}textarea{width:100%;min-height:6rem}
</style></head><body>
<h1>Card pool review (${escapeHtml(language)})</h1>
<p>${judged} of ${total} cards judged${average ? `, average score ${average}` : ""}. Showing ${cards.length} cards: the doubtful and unjudged ones and a sample of the good ones.
Tick the cards that should <strong>not</strong> go into the pool, then copy the list and save it as <code>${escapeHtml(dropsFile)}</code>.</p>
<p><select id="filter"><option value="">All categories</option>${options}</select>
<button id="copy" type="button">Copy ids of ticked cards</button> <span id="count">0 ticked</span></p>
<table><thead><tr><th>Drop</th><th>Term</th><th>Forbidden words</th><th>Score</th></tr></thead><tbody>
${rows}
</tbody></table>
<p><textarea id="out" readonly placeholder="The ticked ids appear here"></textarea></p>
<script>
const boxes=[...document.querySelectorAll('tbody input')];
const out=document.getElementById('out');
function update(){const ids=boxes.filter(b=>b.checked).map(b=>b.value);out.value=ids.join('\\n');document.getElementById('count').textContent=ids.length+' ticked';}
boxes.forEach(b=>b.addEventListener('change',update));
document.getElementById('filter').addEventListener('change',e=>{document.querySelectorAll('tbody tr').forEach(r=>{r.hidden=e.target.value!==''&&r.dataset.category!==e.target.value;});});
document.getElementById('copy').addEventListener('click',async()=>{update();try{await navigator.clipboard.writeText(out.value);}catch{out.select();}});
</script></body></html>
`;
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  if (!options.command || options.command === "--help" || options.command === "-h") {
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
    const review = await server.ssrLoadModule("/src/business/games/taboo/poolReview.ts");
    const packModule = await server.ssrLoadModule("/src/business/games/taboo/cardPack.ts");

    const { language } = options;
    const workDirectory = join(projectRoot, options.work);
    const workPath = join(workDirectory, `pool-${language}.json`);
    const verdictsPath = join(workDirectory, `pool-${language}.verdicts.json`);
    const sheetPath = join(workDirectory, `pool-${language}.review.html`);
    const dropsPath = join(workDirectory, `pool-${language}.drops.txt`);
    const shippedPath = join(projectRoot, "src", "data", "pool", `${language}.json`);
    await mkdir(workDirectory, { recursive: true });

    const shipped = packModule.parseTabooCardPack(await readJson(shippedPath));
    const work = packModule.parseTabooCardPack(
      await readJson(workPath).catch(() => {
        throw new Error(`No working pack at ${workPath}. Run generate-card-pool first.`);
      }),
    );
    const verdicts = await readJsonOr(verdictsPath, {});
    const categoryName = (id) =>
      work.categories.find((category) => category.id === id)?.names.en ?? id;

    if (options.command === "judge") {
      const open = review.cardsToJudge(work.cards, verdicts).slice(0, options.limit);
      if (open.length === 0) {
        console.log("Every card has a verdict already.");
        return;
      }
      const { provider, model } = await chooseProvider(options, review.poolJudgeSchema);
      console.log(`Using ${provider.name}, model ${model}. Judging ${open.length} cards.`);
      let done = 0;
      let failed = 0;
      for (const card of open) {
        let verdict;
        try {
          const text = await provider.chat(
            model,
            review.buildJudgePrompt(card, categoryName(card.categoryId)),
          );
          verdict = review.parseJudgeResponse(text);
        } catch (error) {
          console.log(`  request failed: ${describeError(error)}`);
        }
        done += 1;
        if (!verdict) {
          failed += 1;
          console.log(`${done}/${open.length} ${card.term}: no usable answer, stays unjudged`);
          continue;
        }
        verdicts[card.id] = verdict;
        await writeAtomic(verdictsPath, JSON.stringify(verdicts, null, 2) + "\n");
        console.log(
          `${done}/${open.length} ${card.term}: ${verdict.score}${verdict.problem ? ` (${verdict.problem})` : ""}`,
        );
      }
      console.log(
        `Done. ${done - failed} judged, ${failed} without a usable answer. File: ${verdictsPath}`,
      );
      return;
    }

    if (options.command === "sheet") {
      const sample = review.selectReviewSample(work.cards, verdicts, {
        belowScore: options.below,
        perCell: options.perCell,
        random: seededRandom(work.cards.length),
      });
      const scores = work.cards
        .map((card) => verdicts[card.id]?.score)
        .filter((score) => score !== undefined);
      const average = scores.length
        ? (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(2)
        : "";
      await writeFile(
        sheetPath,
        reviewPage({
          language,
          cards: sample,
          verdicts,
          categories: work.categories,
          total: work.cards.length,
          judged: scores.length,
          average,
          dropsFile: `work/pool-${language}.drops.txt`,
        }),
        "utf8",
      );
      console.log(
        `Wrote ${sheetPath} with ${sample.length} of ${work.cards.length} cards. Open it in a browser.`,
      );
      return;
    }

    // merge
    const drops = review.parseDropList(await readTextOr(dropsPath, ""));
    const selection = review.selectCardsToMerge(work.cards, verdicts, drops, {
      allowUnjudged: options.allowUnjudged,
      minScore: options.minScore,
      poolIds: new Set(shipped.cards.map((card) => card.id)),
    });
    const reasons = new Map();
    for (const item of selection.skipped) {
      const key = item.reason.replace(/^score \d+ below/u, "score below");
      reasons.set(key, (reasons.get(key) ?? 0) + 1);
    }
    console.log(`Merge ${selection.merge.length} cards; skipped ${selection.skipped.length}.`);
    for (const [reason, count] of reasons) console.log(`  skipped ${count}: ${reason}`);
    const unknown = [...drops].filter((id) => !work.cards.some((card) => card.id === id));
    if (unknown.length > 0)
      console.log(`  note: ${unknown.length} ids on the drop list are not in the working pack`);

    const order = new Map(shipped.categories.map((category, index) => [category.id, index]));
    const merged = [...shipped.cards, ...selection.merge].sort(
      (left, right) =>
        (order.get(left.categoryId) ?? 99) - (order.get(right.categoryId) ?? 99) ||
        difficultyOrder.indexOf(left.difficulty) - difficultyOrder.indexOf(right.difficulty) ||
        left.term.localeCompare(right.term, language),
    );
    // The whole result must be a valid pack, otherwise nothing is written.
    const file = {
      format: "gamehub-taboo-pack",
      version: 1,
      language,
      categories: shipped.categories,
      cards: merged.map(({ id, term, forbiddenWords, categoryId, difficulty }) => ({
        id,
        term,
        forbiddenWords,
        categoryId,
        difficulty,
      })),
    };
    packModule.parseTabooCardPack(file);
    if (options.dryRun) {
      console.log("Dry run: nothing written.");
      return;
    }
    await writeAtomic(shippedPath, JSON.stringify(file, null, 2) + "\n");
    console.log(`Wrote ${shippedPath} with ${merged.length} cards.`);
  } finally {
    await server.close();
  }
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exitCode = 1;
});
