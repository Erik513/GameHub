// Compares two folders with style snapshots (see e2e/styleSnapshot.ts) and lists every difference.
// Usage: node scripts/compare-style-snapshots.mjs <before-folder> <after-folder>
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const [before, after] = process.argv.slice(2);
if (!before || !after) {
  console.error("Usage: node scripts/compare-style-snapshots.mjs <before> <after>");
  process.exit(2);
}

// The names of the properties in the order of the snapshot.
const source = readFileSync(new URL("../e2e/styleSnapshot.ts", import.meta.url), "utf8");
const block = /const properties = \[([\s\S]*?)\] as const/.exec(source)?.[1] ?? "";
const properties = [...block.matchAll(/"([^"]+)"/g)].map((match) => match[1]);

/** Splits a row into its path, classes, box and values. */
function parse(row) {
  const first = row.indexOf(" ");
  const second = row.indexOf(" ", first + 1);
  const third = row.indexOf(" ", second + 1);
  return {
    path: row.slice(0, first),
    classes: row.slice(first + 1, second),
    box: row.slice(second + 1, third),
    values: row.slice(third + 1).split("|"),
  };
}

function describe(rowA, rowB) {
  const a = parse(rowA);
  const b = parse(rowB);
  const changes = [];
  if (a.path !== b.path) changes.push(`element ${a.path} -> ${b.path}`);
  if (a.box !== b.box) changes.push(`box ${a.box} -> ${b.box}`);
  a.values.forEach((value, index) => {
    if (value !== b.values[index]) changes.push(`${properties[index]}: ${value} -> ${b.values[index]}`);
  });
  return `${a.classes} ${a.path.slice(-40)}\n    ${changes.join("\n    ")}`;
}

const names = new Set([...readdirSync(before), ...readdirSync(after)]);
let differences = 0;
for (const name of [...names].sort()) {
  let a;
  let b;
  try {
    a = JSON.parse(readFileSync(join(before, name), "utf8"));
    b = JSON.parse(readFileSync(join(after, name), "utf8"));
  } catch {
    console.log(`${name}: only in one of the folders`);
    differences += 1;
    continue;
  }
  if (a.length !== b.length) console.log(`${name}: ${a.length} elements before, ${b.length} after`);
  const count = Math.min(a.length, b.length);
  let shown = 0;
  for (let index = 0; index < count; index += 1) {
    if (a[index] === b[index]) continue;
    differences += 1;
    if (shown < 3) console.log(`${name} #${index}: ${describe(a[index], b[index])}`);
    shown += 1;
  }
  if (shown > 3) console.log(`${name}: ${shown - 3} more differences`);
}
console.log(differences === 0 ? `Equal: ${names.size} screens.` : `${differences} differences in ${names.size} screens.`);
process.exit(differences === 0 ? 0 : 1);
