import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";

// Fit existing simulations. This command never starts new games.
const archives = [
  "werewolf-nine-player-combinations.jsonl.gz",
  "werewolf-ten-player-combinations.jsonl.gz",
  "werewolf-eleven-player-magician.jsonl.gz",
  "werewolf-twelve-player.jsonl",
  "werewolf-twelve-player-two-wolves.jsonl",
  "werewolf-thirteen-player-combinations.jsonl.gz",
  "werewolf-fourteen-player-options.jsonl.gz",
];
const roles = [
  "bodyguard",
  "nightGuest",
  "witch",
  "hunter",
  "cupid",
  "idiot",
  "spellcaster",
  "mayor",
  "toughGuy",
  "apprenticeSeer",
  "paranormalInvestigator",
  "magician",
  "tanner",
];
const modifiers = ["hammer", "selfSilence", "drunk", "amulet", "earlyAttack"];
const pairs = [
  ["witch", "bodyguard"],
  ["magician", "bodyguard"],
  ["witch", "nightGuest"],
  ["magician", "nightGuest"],
  ["witch", "magician"],
  ["apprenticeSeer", "paranormalInvestigator"],
  ["idiot", "mayor"],
];
const features = [
  ...Array.from({ length: 6 }, (_, index) => "players" + (index + 9)),
  "wolf",
  ...roles,
  ...modifiers,
  ...pairs.map((pair) => pair.join("+")),
  "combinedInvestigation",
  "combinedInvestigation+paranormalInvestigator",
];
const matrix = features.map(() => features.map(() => 0));
const targets = features.map(() => 0);
let observations = 0;
let games = 0;
const sources = {};

function sample(record, lineup, defaultWolves) {
  const settings = lineup.settings ?? {};
  const selected = lineup.roles;
  const values = new Map(selected.map((role) => [role, 1]));
  values.set("players" + record.players, 1);
  values.set("wolf", settings.wolfCount ?? defaultWolves);
  values.set("hammer", Number(selected.includes("mayor") && settings.mayor === "hammer"));
  values.set(
    "selfSilence",
    Number(selected.includes("spellcaster") && settings.allowSelfSilence === true),
  );
  values.set("drunk", Number(settings.drunk === true));
  values.set("amulet", Number(settings.amulet === true));
  values.set("earlyAttack", Number(record.model === "earlyAttackQuietSecondDay"));
  for (const pair of pairs)
    values.set(pair.join("+"), Number(pair.every((role) => selected.includes(role))));
  const combined = record.model === "combinedInvestigation";
  values.set("combinedInvestigation", Number(combined));
  values.set(
    "combinedInvestigation+paranormalInvestigator",
    Number(combined && selected.includes("paranormalInvestigator")),
  );
  return features.map((name) => values.get(name) ?? 0);
}

for (const name of archives) {
  const bytes = readFileSync(new URL("../docs/simulations/" + name, import.meta.url));
  sources[name] = createHash("sha256").update(bytes).digest("hex");
  const text = name.endsWith(".gz") ? gunzipSync(bytes).toString("utf8") : bytes.toString("utf8");
  const records = text
    .trim()
    .split(/\r?\n/)
    .map((line) => JSON.parse(line));
  const metadata = records[0];
  for (const record of records.slice(1)) {
    if (
      !["sharedKnowledgeAndIdiot", "earlyAttackQuietSecondDay", "combinedInvestigation"].includes(
        record.model,
      )
    )
      continue;
    for (const lineup of record.stats) {
      // Older records with an independent couple victory use a different ruleset.
      if ((lineup.lovers ?? 0) !== 0) continue;
      if (lineup.wolves + lineup.village !== record.gamesPerLineup) continue;
      const wolves = metadata.wolfCount ?? (record.players < 12 ? 2 : 3);
      const x = sample(record, lineup, wolves);
      const probability = (lineup.wolves + 0.5) / (record.gamesPerLineup + 1);
      const logOdds = Math.log(probability / (1 - probability));
      const weight = record.gamesPerLineup / 2_000;
      const active = x.flatMap((value, index) => (value ? [index] : []));
      for (const i of active) {
        targets[i] += weight * x[i] * logOdds;
        for (const j of active) matrix[i][j] += weight * x[i] * x[j];
      }
      observations++;
      games += record.gamesPerLineup;
    }
  }
}

// Ridge regularization stabilizes correlated role combinations.
for (let index = 0; index < matrix.length; index++) matrix[index][index] += 0.5;
const augmented = matrix.map((row, index) => [...row, targets[index]]);
for (let column = 0; column < features.length; column++) {
  let pivot = column;
  for (let row = column + 1; row < features.length; row++) {
    if (Math.abs(augmented[row][column]) > Math.abs(augmented[pivot][column])) pivot = row;
  }
  [augmented[column], augmented[pivot]] = [augmented[pivot], augmented[column]];
  const divisor = augmented[column][column];
  if (Math.abs(divisor) < 1e-10) throw new Error("Singular calibration matrix");
  for (let cell = column; cell <= features.length; cell++) augmented[column][cell] /= divisor;
  for (let row = 0; row < features.length; row++) {
    if (row === column) continue;
    const factor = augmented[row][column];
    for (let cell = column; cell <= features.length; cell++)
      augmented[row][cell] -= factor * augmented[column][cell];
  }
}

const coefficients = Object.fromEntries(
  features.map((name, index) => [name, augmented[index].at(-1)]),
);
const halfPoint = (value) => Math.round(value * 2) / 2;
const rolePoints = Object.fromEntries(
  roles.map((role) => [role, halfPoint(-10 * coefficients[role])]),
);
const modifierPoints = Object.fromEntries(
  modifiers.map((name) => [name, halfPoint(-10 * coefficients[name])]),
);
const combinationPoints = Object.fromEntries(
  pairs.map((pair) => [pair.join("+"), halfPoint(-10 * coefficients[pair.join("+")])]),
);
combinationPoints["seer+paranormalInvestigator"] = halfPoint(
  -10 * coefficients["combinedInvestigation+paranormalInvestigator"],
);
const seerPoints = 5;
const wolfPoints = halfPoint(10 * coefficients.wolf);
const playerTargets = Object.fromEntries(
  Array.from({ length: 6 }, (_, index) => {
    const players = index + 9;
    return [
      players,
      halfPoint(
        seerPoints + 10 * (coefficients["players" + players] + coefficients.combinedInvestigation),
      ),
    ];
  }),
);
// Earlier baseline comparisons used one wolf and a mandatory seer.
for (const [players, rate] of [
  [6, 0.3437],
  [7, 0.3268],
  [8, 0.3125],
]) {
  playerTargets[players] = halfPoint(seerPoints + 10 * Math.log(rate / (1 - rate)) - wolfPoints);
}
playerTargets[15] = halfPoint(2 * playerTargets[14] - playerTargets[13]);
playerTargets[16] = halfPoint(2 * playerTargets[15] - playerTargets[14]);
playerTargets[17] = halfPoint(2 * playerTargets[16] - playerTargets[15]);
playerTargets[18] = halfPoint(2 * playerTargets[17] - playerTargets[16]);
playerTargets[19] = halfPoint(2 * playerTargets[18] - playerTargets[17]);
playerTargets[20] = halfPoint(2 * playerTargets[19] - playerTargets[18]);

const output = {
  version: 1,
  reference: "combinedInvestigation",
  observations,
  games,
  sources,
  seerPoints,
  wolfPoints,
  rolePoints,
  modifierPoints,
  combinationPoints,
  playerTargets,
  coefficients,
};
const target = new URL("../src/business/games/werewolf/balanceCalibration.json", import.meta.url);
const serialized = JSON.stringify(output, null, 2) + "\n";
if (process.argv.includes("--check")) {
  if (readFileSync(target, "utf8") !== serialized)
    throw new Error("Stored calibration differs from its source archives");
} else {
  writeFileSync(target, serialized);
}
console.log(
  JSON.stringify(
    {
      observations,
      games,
      wolfPoints,
      rolePoints,
      modifierPoints,
      combinationPoints,
      playerTargets,
    },
    null,
    2,
  ),
);
