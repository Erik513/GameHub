import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TeamSetupValue } from "../business/shared/teamSetup";
import {
  createLocalStorageTeamSetupMemory,
  teamSetupStorageKey,
} from "./localStorageTeamSetupMemory";

const value: TeamSetupValue = {
  assignment: { Anna: 0 },
  count: 3,
  names: ["Red", "", "Blue"],
  order: [],
  playersText: "Anna",
};

describe("local storage team setup memory", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("remembers and restores the last teams and players", () => {
    const memory = createLocalStorageTeamSetupMemory(localStorage);
    expect(memory.read()).toBeUndefined();
    memory.write(value);
    expect(localStorage.getItem(teamSetupStorageKey)).toContain("Red");
    expect(memory.read()).toEqual(value);
  });

  it("ignores unusable stored data", () => {
    const memory = createLocalStorageTeamSetupMemory(localStorage);
    localStorage.setItem(teamSetupStorageKey, "{not json");
    expect(memory.read()).toBeUndefined();
    localStorage.setItem(teamSetupStorageKey, JSON.stringify({ count: "many" }));
    expect(memory.read()).toBeUndefined();
  });

  it("keeps working when the storage is not available", () => {
    const broken = {
      getItem: vi.fn(() => {
        throw new Error("blocked");
      }),
      setItem: vi.fn(() => {
        throw new Error("full");
      }),
    } as unknown as Storage;
    const memory = createLocalStorageTeamSetupMemory(broken);
    expect(memory.read()).toBeUndefined();
    expect(() => memory.write(value)).not.toThrow();
  });
});
