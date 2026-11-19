// Runs the long Werewolf balance and simulation tests, which are not part of the normal test run
// (they take more than ten minutes). Usage: pnpm test:werewolf-simulation
import { spawnSync } from "node:child_process";

const result = spawnSync(
  process.execPath,
  [
    "node_modules/vitest/vitest.mjs",
    "run",
    "src/business/games/werewolf/balance.test.ts",
    "src/business/games/werewolf/simulation.test.ts",
  ],
  { env: { ...process.env, WEREWOLF_SIMULATION: "1" }, stdio: "inherit" },
);
process.exit(result.status ?? 1);
