import type { CardEffect } from "../narratorCard";
import type { CardEffectContext, CardEffectRules } from "./types";
import { roleDefinitions as roles } from "./index";

/** The states that belong to no role: the lovers, the amulet (and the attack it stopped) and the drunk. */
const commonEffects: CardEffectRules = {
  lovers: ({ person }) => Boolean(person.partner),
  amulet: ({ person }) => Boolean(person.amulet),
  attacked: ({ state, person }) =>
    state.status === "amuletPass" && state.amulet.mustPass && state.amulet.holder === person.name,
  drunk: ({ person }) => Boolean(person.drunk && person.alive),
};

/** Where the rules of the states stand: the common states and the states of every role. */
export const stateRules: readonly CardEffectRules[] = [
  commonEffects,
  ...Object.values(roles).flatMap((role) => (role.cardEffects ? [role.cardEffects] : [])),
];

/** Whether a person carries a state: one of its rules holds (the attack has one of the wolves and one of the amulet). */
export function holdsState(effect: CardEffect, context: CardEffectContext): boolean {
  return stateRules.some((rules) => rules[effect]?.(context) === true);
}
