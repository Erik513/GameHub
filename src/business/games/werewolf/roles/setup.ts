import { roleDefinitions } from "./index";
import { specialRoleIds, type SpecialRoleId } from "./roleIds";
import type { RoleOptionKey, RoleSetup } from "./types";

/*
 * The tables of the configuration, read from the definitions of the roles. They are read when they are first needed,
 * not when this file is loaded: the definitions of the roles import the game logic, which imports the configuration.
 */

let setups: readonly { readonly role: SpecialRoleId; readonly setup: RoleSetup }[] | undefined;

/** The special roles with their setup, in the order of the screens of the configuration. */
export function specialRoleSetups(): readonly {
  readonly role: SpecialRoleId;
  readonly setup: RoleSetup;
}[] {
  setups ??= specialRoleIds
    .map((role) => ({ role, setup: setupOf(role) }))
    .sort((one, other) => one.setup.order - other.setup.order);
  return setups;
}

/** The setup of a special role (every special role has one; the test of the definitions checks it). */
export function setupOf(role: SpecialRoleId): RoleSetup {
  const setup = roleDefinitions[role].setup;
  if (!setup) throw new Error(`The special role ${role} has no setup.`);
  return setup;
}

/** The family of a role: the bodyguard and the night guest are one role of the draw. */
export function familyOf(role: SpecialRoleId): SpecialRoleId {
  return roleDefinitions[role].setup?.family ?? role;
}

/** The setting the options of a role change, or undefined for a role without options. */
export function optionKeyOf(role: SpecialRoleId): RoleOptionKey | undefined {
  return roleDefinitions[role].setup?.options?.key;
}
