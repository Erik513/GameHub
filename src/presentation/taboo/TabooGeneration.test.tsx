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
      <form>
        <input name="language" defaultValue="de" />
        <input name="category" defaultValue="everyday" />
        <TabooGeneration
          standardCards={[]}
          repository={repository}
          onSaved={onSaved}
          generators={{ local: createLocalTabooCardGenerator(tabooLocalCandidates, () => 0) }}
        />
      </form>
    </I18nextProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Karten mit KI ergänzen" }));
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

it("uses the automatically discovered generator and can cancel it", async () => {
  const i18n = await createGameHubI18n("en");
  const repository = { list: vi.fn().mockResolvedValue([]), addAll: vi.fn() };
  const generator: TabooCardGenerator = {
    capabilities: { languages: ["en"], maxCardsPerRequest: 10, worksOffline: false },
    generate: (_, cancellation) =>
      new Promise((resolve) => {
        cancellation?.subscribe(() => resolve({ status: "failed", code: "cancelled" }));
      }),
  };
  const discover = vi.fn().mockResolvedValue(generator);
  render(
    <I18nextProvider i18n={i18n}>
      <form>
        <input name="category" defaultValue="nature" />
        <TabooGeneration
          standardCards={[]}
          repository={repository}
          onSaved={vi.fn()}
          generators={{ local: generator, discover }}
        />
      </form>
    </I18nextProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Add cards with AI" }));
  expect(discover).toHaveBeenCalledOnce();
  await Promise.resolve();
  await Promise.resolve();
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Generation was cancelled.");
  expect(repository.addAll).not.toHaveBeenCalled();
});
