import { fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { expect, it, vi } from "vitest";
import type { TabooCardGenerator } from "../../business/games/taboo/cardGenerator";
import { tabooLocalCandidates } from "../../data/tabooLocalCandidates";
import { createLocalTabooCardGenerator } from "../../infrastructure/localTabooCardGenerator";
import { createGameHubI18n } from "../../i18n";
import { TabooGeneration } from "./TabooGeneration";

it("previews local suggestions and saves only the confirmed selection", async () => {
  const i18n = await createGameHubI18n("de");
  const repository = {
    list: vi.fn().mockResolvedValue([]),
    addAll: vi.fn().mockResolvedValue(undefined),
  };
  const onSaved = vi.fn();
  render(
    <I18nextProvider i18n={i18n}>
      <TabooGeneration
        cardLanguage="de"
        standardCards={[]}
        repository={repository}
        onSaved={onSaved}
        generators={{ local: createLocalTabooCardGenerator(tabooLocalCandidates, () => 0) }}
      />
    </I18nextProvider>,
  );
  fireEvent.click(screen.getByText("Tabu-Karten vorschlagen", { selector: "summary" }));
  fireEvent.click(screen.getByRole("button", { name: "Karten vorschlagen" }));
  const spoon = await screen.findByRole("checkbox", { name: /Löffel/ });
  expect(spoon).toBeChecked();
  expect(repository.addAll).not.toHaveBeenCalled();
  fireEvent.click(spoon);
  fireEvent.click(screen.getByRole("button", { name: "Ausgewählte Karten speichern" }));
  expect(await screen.findByText("Gespeicherte Karten: 1")).toBeVisible();
  expect(repository.addAll).toHaveBeenCalledOnce();
  expect(repository.addAll.mock.calls[0]?.[0]).toMatchObject([{ term: "Seife" }]);
  expect(onSaved).toHaveBeenCalledOnce();
});

it("lets the user choose Ollama and cancel an outstanding request", async () => {
  const i18n = await createGameHubI18n("en");
  const repository = { list: vi.fn().mockResolvedValue([]), addAll: vi.fn() };
  const generator: TabooCardGenerator = {
    capabilities: { languages: ["en"], maxCardsPerRequest: 10, worksOffline: false },
    generate: (_, cancellation) =>
      new Promise((resolve) => {
        cancellation?.subscribe(() => resolve({ status: "failed", code: "cancelled" }));
      }),
  };
  const ollama = vi.fn(() => generator);
  render(
    <I18nextProvider i18n={i18n}>
      <TabooGeneration
        cardLanguage="en"
        standardCards={[]}
        repository={repository}
        onSaved={vi.fn()}
        generators={{ local: generator, ollama }}
      />
    </I18nextProvider>,
  );
  fireEvent.click(screen.getByText("Suggest Taboo cards", { selector: "summary" }));
  fireEvent.change(screen.getByRole("combobox", { name: "Provider" }), {
    target: { value: "ollama" },
  });
  fireEvent.change(screen.getByRole("textbox", { name: "Installed Ollama model" }), {
    target: { value: "local-model" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Suggest cards" }));
  expect(ollama).toHaveBeenCalledWith("local-model");
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Generation was cancelled.");
  expect(repository.addAll).not.toHaveBeenCalled();
});
