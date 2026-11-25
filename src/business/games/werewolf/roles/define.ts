import type { RoleDefinition } from "./types";

/** A role that has neither abilities nor options unless the given parts say otherwise. */
export function defineRole(
  definition: Pick<RoleDefinition, "id"> & Partial<RoleDefinition>,
): RoleDefinition {
  return { abilities: () => [], variant: () => null, ...definition };
}
