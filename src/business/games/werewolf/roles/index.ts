import { wolf } from "./wolf";
import { seer } from "./seer";
import { apprenticeSeer } from "./apprenticeSeer";
import { villager } from "./villager";
import { witch } from "./witch";
import { hunter } from "./hunter";
import { idiot } from "./idiot";
import { bodyguard } from "./bodyguard";
import { nightGuest } from "./nightGuest";
import { cupid } from "./cupid";
import { toughGuy } from "./toughGuy";
import { tanner } from "./tanner";
import { spellcaster } from "./spellcaster";
import { mayor } from "./mayor";
import { paranormalInvestigator } from "./paranormalInvestigator";
import { magician } from "./magician";
import { drunk } from "./drunk";
import type { RoleDefinition, RoleId } from "./types";

export { defineRole } from "./define";
export type { AbilitySymbol, RoleAbility, RoleDefinition, RoleId, RoleSettings } from "./types";

/** All roles with everything that belongs to each of them. */
export const roleDefinitions: Readonly<Record<RoleId, RoleDefinition>> = {
  wolf,
  seer,
  apprenticeSeer,
  villager,
  witch,
  hunter,
  idiot,
  bodyguard,
  nightGuest,
  cupid,
  toughGuy,
  tanner,
  spellcaster,
  mayor,
  paranormalInvestigator,
  magician,
  drunk,
};

/** The definition of the role with this name, or undefined for a name that is no role of the game. */
export function roleDefinition(role: string): RoleDefinition | undefined {
  return (roleDefinitions as Readonly<Record<string, RoleDefinition | undefined>>)[role];
}
