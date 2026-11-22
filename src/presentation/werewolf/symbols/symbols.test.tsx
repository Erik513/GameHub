import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { werewolfRoleMinimums } from "../../../business/games/werewolf/configuration";
import { createGameHubI18n } from "../../../i18n";
import { symbolGroups, symbols, symbolOf } from "./catalog";
import { lineGlyphs } from "./glyphs";
import { WerewolfSymbol } from "./WerewolfSymbol";

const ids = symbols.map((entry) => entry.id);

it("has one symbol for every role of the logic and the three basic roles, in the group of the roles", () => {
  const roles = [...Object.keys(werewolfRoleMinimums), "wolf", "seer", "villager"].sort();
  const symbolsOfRoles = symbols
    .filter((entry) => entry.group === "role")
    .map((entry) => entry.id as string)
    .sort();
  expect(symbolsOfRoles).toEqual(roles);
});

it("gives every symbol a name once, and every role its own drawing", () => {
  expect(new Set(ids).size).toBe(ids.length);
  const roleDrawings = symbols
    .filter((entry) => entry.group === "role")
    .map((entry) => entry.glyph);
  expect(new Set(roleDrawings).size).toBe(roleDrawings.length);
});

it("keeps the groups complete and uses every drawing at least once", () => {
  for (const group of symbolGroups) {
    expect(symbols.some((entry) => entry.group === group)).toBe(true);
  }
  const used = new Set(symbols.map((entry) => entry.glyph));
  for (const glyph of Object.keys(lineGlyphs)) expect(used.has(glyph as never)).toBe(true);
  expect(used.has("wolfHead")).toBe(true);
});

it("draws a symbol in the color of its text, with or without a name for screen readers", () => {
  const { container, rerender } = render(<WerewolfSymbol id="witch" />);
  const decoration = container.querySelector("svg")!;
  expect(decoration).toHaveAttribute("aria-hidden", "true");
  expect(decoration.getAttribute("stroke")).toBe("currentColor");
  expect(decoration.querySelectorAll("path").length).toBeGreaterThan(0);
  rerender(<WerewolfSymbol id="wolf" label="Werewolf" size={40} />);
  const wolf = screen.getByRole("img", { name: "Werewolf" });
  expect(wolf.getAttribute("width")).toBe("40");
  expect(wolf.querySelector("path")?.getAttribute("fill")).toBe("currentColor");
});

it.each(["en", "de"] as const)("names and explains every symbol in %s", async (language) => {
  const i18n = await createGameHubI18n(language);
  for (const id of ids) {
    const name = i18n.t(`werewolfSymbols.items.${id}.name`);
    const meaning = i18n.t(`werewolfSymbols.items.${id}.meaning`);
    expect(name).not.toMatch(/^werewolfSymbols/);
    expect(meaning).not.toMatch(/^werewolfSymbols/);
    // The meaning starts with the thing that is drawn and says what it stands for.
    expect(meaning).toContain(":");
  }
  expect(symbolOf("wolf").glyph).toBe("wolfHead");
});

it("draws an ability in a circle, so it never looks like its role", () => {
  const { container } = render(
    <>
      <WerewolfSymbol id="protected" ring />
      <WerewolfSymbol id="bodyguard" />
      <WerewolfSymbol id="wolf" ring />
    </>,
  );
  const [ability, role, wolf] = [...container.querySelectorAll("svg")];
  expect(ability!.querySelector("circle")).not.toBeNull();
  expect(role!.querySelector("circle")).toBeNull();
  expect(wolf!.querySelector("circle")).not.toBeNull();
});
