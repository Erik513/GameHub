import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  TabooCardGenerator,
  TabooGenerationResult,
} from "../../business/games/taboo/cardGenerator";
import { tabooStandardCards } from "../../data/tabooStandardCards";
import { createGameHubI18n } from "../../i18n";
import { TabooSetup } from "./TabooSetup";
import { openGameSettings } from "../testing/gameSettings";

function pendingGenerator() {
  const releases: ((result: TabooGenerationResult) => void)[] = [];
  const generate = vi.fn<TabooCardGenerator["generate"]>().mockImplementation(
    () =>
      new Promise<TabooGenerationResult>((resolve) => {
        releases.push(resolve);
      }),
  );
  const generator: TabooCardGenerator = {
    capabilities: { languages: ["en"], maxCardsPerRequest: 10, worksOffline: false },
    generate,
  };
  return { generate, generator, releases };
}

async function renderSetup(generator: TabooCardGenerator) {
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <TabooSetup
        cardLanguage="en"
        cards={tabooStandardCards}
        generators={{ local: generator }}
        roundChoices={[1, 3]}
      />
    </I18nextProvider>,
  );
  openGameSettings();
}

beforeEach(() => {
  vi.spyOn(Math, "random").mockReturnValue(0.99);
});

afterEach(() => {
  vi.restoreAllMocks();
});

/** The menu opens the line-up; the cards are prepared when the game is started from there. */
function openLineup() {
  fireEvent.submit(document.querySelector("#taboo-setup-form")!);
  return document.querySelector("#taboo-lineup-form")!;
}

describe("Taboo setup while extra cards are generated", () => {
  it("ignores a second submit while the first one is still generating", async () => {
    const { generate, generator } = pendingGenerator();
    await renderSetup(generator);
    const form = openLineup();
    fireEvent.submit(form);
    await vi.waitFor(() => expect(generate).toHaveBeenCalledTimes(1));
    expect(screen.getByRole("button", { name: "Preparing cards…" })).toBeDisabled();
    fireEvent.submit(form);
    fireEvent.submit(form);
    await act(async () => {
      await Promise.resolve();
    });
    // Only the first request of the first submit is pending.
    expect(generate).toHaveBeenCalledTimes(1);
  });

  it("drops the result when the setup is changed during the generation", async () => {
    const { generate, generator, releases } = pendingGenerator();
    await renderSetup(generator);
    fireEvent.submit(openLineup());
    await vi.waitFor(() => expect(generate).toHaveBeenCalledTimes(1));
    // Changing the teams cancels the preparation.
    fireEvent.click(
      within(screen.getByRole("group", { name: "Teams" })).getByRole("radio", { name: "3" }),
    );
    await act(async () => {
      releases[0]?.({ status: "failed", code: "cancelled" });
      await Promise.resolve();
    });
    expect(screen.queryByRole("region", { name: "Round overview" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start game" })).toBeEnabled();
  });

  it("starts with the local cards and says so when no extra card could be generated", async () => {
    const failing: TabooCardGenerator = {
      capabilities: { languages: ["en"], maxCardsPerRequest: 10, worksOffline: false },
      generate: vi.fn().mockRejectedValue(new Error("offline")),
    };
    await renderSetup(failing);
    const lineup = openLineup();
    await act(async () => {
      fireEvent.submit(lineup);
      await Promise.resolve();
    });
    expect(await screen.findByRole("region", { name: "Round overview" })).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent("No new extra cards are available.");
    // The game stays playable with the local deck.
    fireEvent.click(screen.getByRole("button", { name: "Start round" }));
    expect(screen.getByRole("timer")).toBeVisible();
  });
});
