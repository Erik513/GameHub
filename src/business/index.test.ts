import { describe, expect, it } from "vitest";
import type { GameHubFoundation } from "./index";

describe("GameHub foundation contract", () => {
  it("represents GameHub as the application name", () => {
    const foundation = {
      applicationName: "GameHub",
    } satisfies GameHubFoundation;

    expect(foundation.applicationName).toBe("GameHub");
  });
});
