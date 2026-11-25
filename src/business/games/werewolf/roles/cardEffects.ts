import type { CardEffect } from "../narratorCard";
import type { CardEffectRules } from "./types";
import { roleDefinitions as roles } from "./index";

const commonEffects: CardEffectRules = {
  lovers: ({ person }) => Boolean(person.partner),
  amulet: ({ person }) => Boolean(person.amulet),
  attacked: ({ state, person }) =>
    state.status === "amuletPass" && state.amulet.mustPass && state.amulet.holder === person.name,
  drunk: ({ person }) => Boolean(person.drunk && person.alive),
};

// Shared effects keep the existing display priority across role definitions.
export function cardEffectsInOrder() {
  return [
    ["lovers", commonEffects],
    ["amulet", commonEffects],
    ["attacked", roles.wolf.cardEffects],
    ["attacked", commonEffects],
    ["protected", roles.bodyguard.cardEffects],
    ["protectedSaved", roles.bodyguard.cardEffects],
    ["guest", roles.nightGuest.cardEffects],
    ["guestSaved", roles.nightGuest.cardEffects],
    ["inspected", roles.seer.cardEffects],
    ["investigated", roles.paranormalInvestigator.cardEffects],
    ["healed", roles.witch.cardEffects],
    ["spellHealed", roles.magician.cardEffects],
    ["poisoned", roles.witch.cardEffects],
    ["hammered", roles.mayor.cardEffects],
    ["spellKilled", roles.magician.cardEffects],
    ["silenced", roles.spellcaster.cardEffects],
    ["drunk", commonEffects],
    ["twoVotes", roles.mayor.cardEffects],
  ] as const satisfies readonly (readonly [CardEffect, CardEffectRules | undefined])[];
}
