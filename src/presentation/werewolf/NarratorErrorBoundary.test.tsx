import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { expect, it, vi } from "vitest";
import { createGameHubI18n } from "../../i18n";
import { NarratorErrorBoundary } from "./NarratorErrorBoundary";

function Broken(): never {
  throw new Error("boom");
}

it.each(["en", "de"] as const)(
  "shows the error instead of an empty screen when the narrator view fails in %s",
  async (language) => {
    const i18n = await createGameHubI18n(language);
    // React logs the caught error; the test keeps the output clean.
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    render(
      <I18nextProvider i18n={i18n}>
        <NarratorErrorBoundary>
          <Broken />
        </NarratorErrorBoundary>
      </I18nextProvider>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("boom");
    expect(screen.getByRole("button")).toBeInTheDocument();
    log.mockRestore();
  },
);
