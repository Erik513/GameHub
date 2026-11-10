import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppRoot } from "./AppRoot";

describe("AppRoot", () => {
  it("composes the GameHub presentation", () => {
    render(<AppRoot />);

    expect(screen.getByRole("heading", { name: "GameHub" })).toBeVisible();
  });
});
