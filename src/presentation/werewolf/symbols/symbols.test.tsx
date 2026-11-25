import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { werewolfRoleMinimums } from "../../../business/games/werewolf/configuration";
import { createGameHubI18n } from "../../../i18n";
import { abilityLegend, symbolGroups, symbols, symbolOf } from "./catalog";
import { lineGlyphs } from "./glyphs";
import { variantGlyphs } from "./variantGlyphs";
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

it("does not draw the witch like the poison: the flask is only the poison", () => {
  const glyphOf = (id: string) => symbols.find((entry) => entry.id === id)?.glyph;
  expect(glyphOf("poisoned")).toBe("flaskMinus");
  expect(glyphOf("witch")).not.toBe(glyphOf("poisoned"));
  expect(glyphOf("kill")).toBe("skull");
});

it("draws the seer as the crystal ball, her ability and its state with the same eye", () => {
  const glyphOf = (id: string) => symbols.find((entry) => entry.id === id)?.glyph;
  expect(glyphOf("seer")).toBe("crystalBall");
  expect(glyphOf("inspected")).toBe("eye");
  expect(abilityLegend.find((entry) => entry.ability === "inspect")?.symbol).toBe("inspected");
});

it("draws the apprentice seer like the seer, as a crystal ball that sleeps (with a Z)", () => {
  const glyphOf = (id: string) => symbols.find((entry) => entry.id === id)?.glyph;
  expect(glyphOf("apprenticeSeer")).toBe("crystalBallZ");
  expect(glyphOf("apprenticeSeer")).not.toBe(glyphOf("seer"));
});

it("draws the villager as an ordinary person", () => {
  expect(symbols.find((entry) => entry.id === "villager")?.glyph).toBe("user");
});

it("draws the witch as a witch with a hat and her two potions as bottles, the healing one with a plus", () => {
  const glyphOf = (id: string) => symbols.find((entry) => entry.id === id)?.glyph;
  expect(glyphOf("witch")).toBe("witchFace");
  expect(glyphOf("healPotion")).toBe("flaskPlus");
  expect(glyphOf("poisoned")).toBe("flaskMinus");
  expect(glyphOf("healed")).toBe("flaskPlus");
  expect(abilityLegend.find((entry) => entry.ability === "heal")?.symbol).toBe("healPotion");
});

it("draws Cupid as a bow with an arrow, and keeps ability and state as the two hearts", () => {
  const glyphOf = (id: string) => symbols.find((entry) => entry.id === id)?.glyph;
  expect(glyphOf("cupid")).toBe("cupidBow");
  expect(glyphOf("lovers")).toBe("hearts");
});

it("draws the hunter as a blunderbuss, a filled drawing of its own", () => {
  expect(symbols.find((entry) => entry.id === "hunter")?.glyph).toBe("blunderbuss");
});

it("draws the bodyguard as a person with a shield, while ability and state stay the plain shield", () => {
  const glyphOf = (id: string) => symbols.find((entry) => entry.id === id)?.glyph;
  expect(glyphOf("bodyguard")).toBe("userShield");
  expect(glyphOf("protected")).toBe("shield");
});

it("draws the night guest as a house with a heart, while ability and state are a person in a bed", () => {
  const glyphOf = (id: string) => symbols.find((entry) => entry.id === id)?.glyph;
  expect(glyphOf("nightGuest")).toBe("homeHeart");
  expect(glyphOf("guest")).toBe("bedFlat");
});

it('draws the old hag as the microphone, the opposite of the silenced state, and "allowed" as a check mark', () => {
  const glyphOf = (id: string) => symbols.find((entry) => entry.id === id)?.glyph;
  expect(glyphOf("spellcaster")).toBe("microphone");
  expect(glyphOf("silenced")).toBe("microphoneOff");
  expect(variantGlyphs.allowed).toBe("check");
  // The thumb is only the idiot's.
  expect(glyphOf("idiot")).toBe("thumbUp");
});

it("keeps the groups complete and uses every drawing at least once", () => {
  for (const group of symbolGroups) {
    expect(symbols.some((entry) => entry.group === group)).toBe(true);
  }
  // The drawings of the variants of the roles count as used, too.
  const used = new Set<string>([
    ...symbols.map((entry) => entry.glyph),
    ...Object.values(variantGlyphs),
    // The closed eye marks the hidden cause of death in the overview (it is no symbol of the catalog).
    "eyeClosed",
  ]);
  for (const glyph of Object.keys(lineGlyphs)) expect(used.has(glyph as never)).toBe(true);
  expect(used.has("wolfHead")).toBe(true);
  expect(used.has("witchFace")).toBe(true);
  expect(used.has("blunderbuss")).toBe(true);
});

it("draws a symbol in the color of its text, with or without a name for screen readers", () => {
  const { container, rerender } = render(<WerewolfSymbol id="bodyguard" />);
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
