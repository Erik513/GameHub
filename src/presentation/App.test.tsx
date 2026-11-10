import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("App", () => {
  it("renders the neutral GameHub foundation screen", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "GameHub" })).toBeVisible();

    const architectureLayers = within(screen.getByRole("list", { name: "Architecture layers" }));

    for (const layer of ["Presentation", "Business", "Data", "Infrastructure"]) {
      expect(architectureLayers.getByText(layer)).toBeVisible();
    }
  });
});
