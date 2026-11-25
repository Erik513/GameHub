import { expect, it } from "vitest";
import { abilitiesOfRole, variantOfRole, type DealtRole } from "./roleAbilities";
import { abilityLegend, symbols } from "./symbols/catalog";
import { variantGlyphs } from "./symbols/variantGlyphs";

/**
 * Safety net for the restructuring to one definition per role (the part of the presentation): the abilities of the roles
 * with their drawings, the variants, the catalog of the symbols and the legend of the abilities must not change.
 */

const roles: readonly DealtRole[] = [
  "wolf",
  "seer",
  "apprenticeSeer",
  "villager",
  "witch",
  "hunter",
  "idiot",
  "bodyguard",
  "nightGuest",
  "cupid",
  "toughGuy",
  "tanner",
  "spellcaster",
  "mayor",
  "paranormalInvestigator",
  "magician",
  "drunk",
];

it("keeps the abilities of every role, with the mayor in both ways", () => {
  const table: Record<string, unknown> = {};
  for (const role of roles)
    for (const mayor of ["doubleVote", "hammer"] as const)
      table[`${role} ${mayor}`] = abilitiesOfRole(role, mayor);
  expect(table).toMatchSnapshot();
});

it("keeps the variant of every role in every setting", () => {
  const table: Record<string, unknown> = {};
  for (const hunterShot of ["optional", "required"] as const)
    for (const toughGuy of ["wolfOnly", "anyAttack"] as const)
      for (const tanner of ["anyDeath", "voteOnly"] as const)
        for (const allowSelfSilence of [true, false])
          table[`${hunterShot} ${toughGuy} ${tanner} ${allowSelfSilence}`] = roles.map((role) =>
            variantOfRole(role, { allowSelfSilence, hunterShot, tanner, toughGuy }),
          );
  expect(table).toMatchSnapshot();
});

it("keeps the catalog of the symbols, the legend of the abilities and the drawings of the variants", () => {
  expect({
    abilityLegend,
    symbols: symbols.map((entry) => [entry.id, entry.group, entry.glyph]),
    variantGlyphs,
  }).toMatchSnapshot();
});
