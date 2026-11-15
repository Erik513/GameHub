import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  parseTabooCardFile,
  selectNewTabooCards,
  serializeTabooCards,
} from "../../business/games/taboo/cardExchange";
import type { TabooCardRepository } from "../../business/games/taboo/cardRepository";
import { mergeStandardCards, type TabooCardPack } from "../../business/games/taboo/cardPack";
import {
  builtInCategories,
  mergeCategoryInfos,
  type OwnCategory,
} from "../../business/games/taboo/categories";
import type { TabooCard } from "../../business/games/taboo/model";
import type { SupportedLanguage } from "../../i18n";
import { Button, Icon, Toast, useNotice } from "../components";
import { ActionRow, ManageScreen, useScreenScroll } from "../game-kit";
import { useGameBack } from "../GameChrome";
import { TabooCardEntry } from "./TabooCardEntry";
import { TabooCardExport } from "./TabooCardExport";
import { TabooCardList } from "./TabooCardList";
import { TabooSetup } from "./TabooSetup";
import type { TabooScreen } from "./tabooSetupModel";
import type { TabooGenerators } from "./TabooGeneration";

interface TabooLibraryProps {
  /** Loads the card pack of a language; resolves to nothing when there is none. */
  loadCardPack?: ((language: SupportedLanguage) => Promise<TabooCardPack | undefined>) | undefined;
  generators?: TabooGenerators | undefined;
  cardLanguage: SupportedLanguage;
  cards: readonly TabooCard[];
  /** Changes the card language from the game settings. */
  onCardLanguageChange?: ((language: SupportedLanguage) => void) | undefined;
  repository: TabooCardRepository | undefined;
}

const rememberedScreens: readonly TabooScreen[] = ["menu"];

type Feedback = { type: "invalid" | "storage" | "exported" } | { type: "imported"; count: number };

export function TabooLibrary({
  cardLanguage,
  cards,
  onCardLanguageChange,
  repository,
  generators,
  loadCardPack,
}: TabooLibraryProps) {
  const { t } = useTranslation();
  const [ownCards, setOwnCards] = useState<readonly TabooCard[]>();
  const [notice, notify] = useNotice<Feedback>();
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState<"setup" | "cards">("setup");
  const [setupScreen, setSetupScreen] = useState<TabooScreen>("menu");
  // Opening the card page or a game screen starts at the top; coming back to the menu returns to
  // the place where the player left it.
  useScreenScroll(page === "cards" ? "cards" : setupScreen, rememberedScreens);
  const [loadedPack, setLoadedPack] = useState<TabooCardPack>();
  // A pack of another language than the current card language is not used.
  const pack = loadedPack?.language === cardLanguage ? loadedPack : undefined;

  // The pack of the card language is loaded as its own part of the app; without it the cards that
  // are built into the code are used.
  useEffect(() => {
    if (!loadCardPack) return;
    let active = true;
    void loadCardPack(cardLanguage).then(
      (loaded) => {
        if (active) setLoadedPack(loaded);
      },
      () => undefined,
    );
    return () => {
      active = false;
    };
  }, [cardLanguage, loadCardPack]);
  const fileInput = useRef<HTMLInputElement>(null);
  // The shell shows one back button at the top right while the card page is open.
  useGameBack(page === "cards", () => setPage("setup"));

  useEffect(() => {
    if (!repository) return;
    let active = true;
    void repository.list().then(
      (saved) => {
        if (active) setOwnCards(saved);
      },
      () => {
        if (active) notify({ type: "storage" });
      },
    );
    return () => {
      active = false;
    };
  }, [notify, repository]);

  /** Saves cards that are new (by id and term) and returns how many were added. */
  async function saveCards(incoming: readonly TabooCard[]): Promise<number> {
    if (!repository) return 0;
    const saved = await repository.list();
    const additions = selectNewTabooCards(incoming, [...cards, ...saved]);
    if (additions.length > 0) await repository.addAll(additions);
    setOwnCards([...saved, ...additions]);
    return additions.length;
  }

  async function updateCard(card: TabooCard) {
    if (!repository) return;
    await repository.update(card);
    setOwnCards((current) => current?.map((item) => (item.id === card.id ? card : item)));
  }

  async function renameCategory(from: OwnCategory, to: string) {
    if (!repository) return;
    const saved = await repository.list();
    const renamed = saved
      .filter((card) => card.language === from.language && card.categoryId === from.id)
      .map((card) => ({ ...card, categoryId: to }));
    for (const card of renamed) await repository.update(card);
    setOwnCards((current) =>
      current?.map((item) => renamed.find((card) => card.id === item.id) ?? item),
    );
  }

  async function removeCard(id: string) {
    if (!repository) return;
    await repository.remove(id);
    setOwnCards((current) => current?.filter((item) => item.id !== id));
  }

  async function importCards(file: File) {
    if (!repository) return;
    setBusy(true);
    try {
      let incoming: readonly TabooCard[];
      try {
        incoming = parseTabooCardFile(await file.text());
      } catch {
        notify({ type: "invalid" });
        return;
      }
      notify({ type: "imported", count: await saveCards(incoming) });
    } catch {
      notify({ type: "storage" });
    } finally {
      setBusy(false);
    }
  }

  function exportCategory(categoryId: string, categoryCards: readonly TabooCard[]) {
    const urlApi = URL;
    const url = urlApi.createObjectURL(
      new Blob([serializeTabooCards(categoryCards)], { type: "application/json" }),
    );
    const slug = categoryId
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-|-$/gu, "");
    const link = document.createElement("a");
    link.href = url;
    link.download = `gamehub-taboo-${slug || "cards"}.json`;
    link.click();
    setTimeout(() => urlApi.revokeObjectURL(url), 1000);
    notify({ type: "exported" });
  }

  const standardCards = mergeStandardCards(cards, pack?.cards ?? []);
  const categoryInfos = mergeCategoryInfos(builtInCategories, pack?.categories ?? []);
  const allCards = [...(ownCards ?? []), ...standardCards];

  return (
    <>
      {/* The setup stays mounted so a half-filled form survives a visit to the card page. */}
      <div hidden={page === "cards"}>
        <TabooSetup
          cardLanguage={cardLanguage}
          cards={allCards}
          categoryInfos={categoryInfos}
          generators={generators}
          onCardLanguageChange={onCardLanguageChange}
          onScreenChange={setSetupScreen}
        >
          {repository && (
            <Button variant="secondary" onClick={() => setPage("cards")}>
              <Icon name="cards" />
              {t("tabooLibrary.manage")}
            </Button>
          )}
        </TabooSetup>
      </div>
      {repository && page === "cards" && (
        <ManageScreen
          messages={
            <>
              {notice && (
                <Toast
                  key={notice.id}
                  tone={
                    notice.value.type === "imported" || notice.value.type === "exported"
                      ? "success"
                      : "error"
                  }
                >
                  {notice.value.type === "imported"
                    ? t("tabooLibrary.imported", { count: notice.value.count })
                    : t(`tabooLibrary.${notice.value.type}`)}
                </Toast>
              )}
              <input
                accept=".json,application/json"
                aria-label={t("tabooLibrary.import")}
                className="visually-hidden"
                disabled={busy}
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0];
                  event.currentTarget.value = "";
                  if (file) void importCards(file);
                }}
                ref={fileInput}
                tabIndex={-1}
                type="file"
              />
            </>
          }
          tabs={[
            {
              content: (
                <TabooCardList
                  allCards={allCards}
                  cardLanguage={cardLanguage}
                  categoryInfos={categoryInfos}
                  disabled={busy}
                  footer={
                    <ActionRow>
                      <Button
                        disabled={busy}
                        onClick={() => fileInput.current?.click()}
                        variant="secondary"
                      >
                        <Icon name="upload" />
                        {t("tabooLibrary.import")}
                      </Button>
                      <TabooCardExport
                        allCards={allCards}
                        cardLanguage={cardLanguage}
                        categoryInfos={categoryInfos}
                        disabled={busy}
                        onExport={exportCategory}
                      />
                    </ActionRow>
                  }
                  onRemove={removeCard}
                  onRenameCategory={renameCategory}
                  onUpdate={updateCard}
                  ownCards={ownCards ?? []}
                  standardCards={standardCards}
                />
              ),
              id: "cards",
              label: t("tabooLibrary.cardsTab"),
            },
            {
              content: (
                <TabooCardEntry
                  cards={allCards}
                  categoryInfos={categoryInfos}
                  disabled={busy}
                  onAdd={saveCards}
                />
              ),
              id: "add",
              label: t("tabooEntry.title"),
            },
          ]}
          tabsLabel={t("tabooLibrary.title")}
          title={t("tabooLibrary.title")}
        />
      )}
    </>
  );
}
