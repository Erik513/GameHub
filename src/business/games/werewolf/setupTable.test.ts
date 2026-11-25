import { expect, it } from "vitest";
import { werewolfRoleMinimums } from "./configuration";
import { fixedItems } from "./fixedConfiguration";
import { variableEntries } from "./variableConfiguration";

/**
 * Safety net for phase 6b (the configuration of every role in its definition): the minimum numbers of players, the
 * choices of the fixed configuration and the entries of the variable configuration must not change.
 */
it("keeps the table of the configuration of every role", () => {
  expect({ fixedItems, variableEntries, werewolfRoleMinimums }).toMatchSnapshot();
});
