import react from "@vitejs/plugin-react";
import { configDefaults, defineConfig } from "vitest/config";

const werewolfSimulationTests = [
  "src/business/games/werewolf/balance.test.ts",
  "src/business/games/werewolf/simulation.test.ts",
];

export default defineConfig({
  plugins: [react()],
  test: {
    clearMocks: true,
    coverage: {
      exclude: ["src/**/*.test.{ts,tsx}", "src/main.tsx", "src/test/**", "src/**/*.d.ts"],
      include: [
        "src/app/**/*.{ts,tsx}",
        "src/business/**/*.{ts,tsx}",
        "src/data/**/*.{ts,tsx}",
        "src/infrastructure/**/*.{ts,tsx}",
        "src/i18n/**/*.{ts,tsx}",
        "src/presentation/**/*.{ts,tsx}",
      ],
      provider: "v8",
      reporter: ["text", "json", "json-summary", "html", "lcov"],
      reportsDirectory: "./coverage",
      thresholds: {
        branches: 75,
        functions: 75,
        lines: 75,
        statements: 75,
        "src/business/games/**/*.{ts,tsx}": {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
        },
        "src/business/**/*.{ts,tsx}": {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        "src/{data,infrastructure}/**/*.{ts,tsx}": {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        "src/{presentation,app}/**/*.{ts,tsx}": {
          branches: 75,
          functions: 75,
          lines: 75,
          statements: 75,
        },
        "src/i18n/**/*.{ts,tsx}": {
          branches: 75,
          functions: 75,
          lines: 75,
          statements: 75,
        },
      },
    },
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    // The Werewolf simulations run for more than ten minutes. They are not part of the normal run (and
    // not of the CI); `pnpm test:werewolf-simulation` runs them on demand.
    exclude: [
      ...configDefaults.exclude,
      ...(process.env.WEREWOLF_SIMULATION ? [] : werewolfSimulationTests),
    ],
    restoreMocks: true,
    // Typing tests of the card forms take about two seconds alone and need more under parallel load.
    testTimeout: 20000,
    setupFiles: ["./src/test/setup.ts"],
  },
});
