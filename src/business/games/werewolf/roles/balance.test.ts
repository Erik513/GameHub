import { describe, expect, it } from "vitest";
import calibration from "../balanceCalibration.json";
import { roleDefinitions } from "./index";
import { specialRoleIds } from "./roleIds";

describe("the definitions of the roles", () => {
  it("give every special role points in the balance calibration (a new role needs them too)", () => {
    const rated = Object.keys(calibration.rolePoints).sort();
    expect(rated).toEqual([...specialRoleIds].sort());
  });

  it("give every special role a setup with its own place on the screens", () => {
    const orders = specialRoleIds.map((role) => roleDefinitions[role].setup?.order);
    expect(orders.every((order) => typeof order === "number")).toBe(true);
    expect(new Set(orders).size).toBe(specialRoleIds.length);
  });
});
