import { expect, it } from "vitest";
import { stateIds } from "../../../business/games/werewolf/roles/stateIds";
import { createGameHubI18n } from "../../../i18n";
import { symbolOf } from "./catalog";
import { slotStyle, stateLook } from "./stateLook";

/** Every state has its drawing, its color and its text in both languages. */

it("gives every state a drawing and a color", () => {
  for (const id of stateIds) {
    expect(symbolOf(id)).toBeDefined();
    expect(stateLook[id].color.length).toBeGreaterThan(0);
    expect(slotStyle(id)).toHaveProperty("--slot-bg", `var(--slot-${stateLook[id].color})`);
  }
});

it.each(["en", "de"] as const)("names every state in %s", async (language) => {
  const i18n = await createGameHubI18n(language);
  for (const id of stateIds)
    expect(i18n.t(`werewolfSymbols.items.${id}.name`)).not.toMatch(/^werewolfSymbols/);
});

it("draws the yellow slots with a dark sign", () => {
  expect(slotStyle("hammered")).toHaveProperty("--slot-ink");
  expect(slotStyle("lovers")).not.toHaveProperty("--slot-ink");
});
