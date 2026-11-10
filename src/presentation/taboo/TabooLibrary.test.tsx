import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { IDBFactory } from "fake-indexeddb";
import { I18nextProvider } from "react-i18next";
import { expect, it, vi } from "vitest";
import { parseTabooCardFile, serializeTabooCards } from "../../business/games/taboo/cardExchange";
import type { TabooCard } from "../../business/games/taboo/model";
import { IndexedDbTabooCardRepository } from "../../data/indexedDbTabooCardRepository";
import { createGameHubI18n } from "../../i18n";
import { TabooLibrary } from "./TabooLibrary";

const card: TabooCard = {
  id: "own-moon",
  language: "en",
  term: "Moon",
  forbiddenWords: ["night", "sky", "orbit"],
  categoryId: "nature",
  difficulty: "easy",
};

function upload(text: string) {
  const file = Object.assign(new File([], "cards.json"), { text: () => Promise.resolve(text) });
  fireEvent.change(screen.getByLabelText("Import cards"), { target: { files: [file] } });
}

it("imports once, keeps own cards after a standard deck update and exports a restorable backup", async () => {
  const i18n = await createGameHubI18n("en");
  const factory = new IDBFactory();
  const repository = new IndexedDbTabooCardRepository(factory);
  const view = (repo: IndexedDbTabooCardRepository, cards: readonly TabooCard[]) => (
    <I18nextProvider i18n={i18n}>
      <TabooLibrary repository={repo} cardLanguage="en" cards={cards} />
    </I18nextProvider>
  );
  const { unmount } = render(view(repository, []));
  fireEvent.click(screen.getByText("Custom Taboo cards", { selector: "summary" }));
  upload("invalid");
  expect(await screen.findByRole("alert")).toHaveTextContent("not a valid");
  upload(serializeTabooCards([card]));
  expect(await screen.findByText(/Imported cards: 1/)).toBeVisible();
  upload(serializeTabooCards([card]));
  expect(await screen.findByText(/Imported cards: 0/)).toBeVisible();
  unmount();
  const reopened = new IndexedDbTabooCardRepository(factory);
  render(view(reopened, [{ ...card, id: "standard-sun", term: "Sun" }]));
  fireEvent.click(screen.getByText("Custom Taboo cards", { selector: "summary" }));
  const exportButton = screen.getByRole("button", { name: "Export own cards" });
  await waitFor(() => expect(exportButton).toBeEnabled());
  const createUrl = vi.fn<(blob: Blob) => string>().mockReturnValue("blob:test");
  vi.stubGlobal(
    "URL",
    Object.assign(class extends URL {}, {
      createObjectURL: createUrl,
      revokeObjectURL: vi.fn(),
    }),
  );
  const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
  try {
    fireEvent.click(exportButton);
    expect(click).toHaveBeenCalledOnce();
    const blob = createUrl.mock.calls[0]![0];
    const text = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
      reader.readAsText(blob);
    });
    expect(parseTabooCardFile(text)).toEqual([card]);
    expect(await reopened.list()).toEqual([card]);
  } finally {
    vi.unstubAllGlobals();
  }
});
