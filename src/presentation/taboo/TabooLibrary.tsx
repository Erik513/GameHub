import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  parseTabooCardFile,
  selectNewTabooCards,
  serializeTabooCards,
} from "../../business/games/taboo/cardExchange";
import type { TabooCardRepository } from "../../business/games/taboo/cardRepository";
import { mergeStandardCards, type TabooCardPack } from "../../business/games/taboo/cardPack";
import { builtInCategories, mergeCategoryInfos } from "../../business/games/taboo/categories";
import type { TabooCard } from "../../business/games/taboo/model";
import type { SupportedLanguage } from "../../i18n";
import { Button, Icon, StatusMessage } from "../components";
import { ManageScreen } from "../game-kit";
import { useGameBack } from "../GameChrome";
import { TabooCardEntry } from "./TabooCardEntry";
import { TabooCardExport } from "./TabooCardExport";
import { TabooCardList } from "./TabooCardList";
import { TabooSetup } from "./TabooSetup";
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

type Feedback = { type: "invalid" | "storage" } | { type: "imported"; count: number };

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
  const [feedback, setFeedback] = useState<Feedback>();
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState<"setup" | "cards">("setup");
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
        if (active) setFeedback({ type: "storage" });
      },
    );
    return () => {
      active = false;
    };
  }, [repository]);

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

  async function removeCard(id: string) {
    if (!repository) return;
    await repository.remove(id);
    setOwnCards((current) => current?.filter((item) => item.id !== id));
  }

  async function importCards(file: File) {
    if (!repository) return;
    setBusy(true);
    setFeedback(undefined);
    try {
      let incoming: readonly TabooCard[];
      try {
        incoming = parseTabooCardFile(await file.text());
      } catch {
        setFeedback({ type: "invalid" });
        return;
      }
      setFeedback({ type: "imported", count: await saveCards(incoming) });
    } catch {
      setFeedback({ type: "storage" });
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
          actions={
            <>
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
            </>
          }
          hint={t("tabooLibrary.hint")}
          messages={
            feedback && (
              <StatusMessage
                title={t("tabooLibrary.title")}
                tone={feedback.type === "imported" ? "success" : "error"}
              >
                {feedback.type === "imported"
                  ? t("tabooLibrary.imported", { count: feedback.count })
                  : t(`tabooLibrary.${feedback.type}`)}
              </StatusMessage>
            )
          }
          title={t("tabooLibrary.title")}
        >
          <TabooCardEntry
            cardLanguage={cardLanguage}
            cards={allCards}
            categoryInfos={categoryInfos}
            disabled={busy}
            onAdd={saveCards}
          />
          <TabooCardList
            allCards={allCards}
            cardLanguage={cardLanguage}
            disabled={busy}
            onRemove={removeCard}
            onUpdate={updateCard}
            ownCards={ownCards ?? []}
            categoryInfos={categoryInfos}
            standardCards={standardCards}
          />
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
        </ManageScreen>
      )}
    </>
  );
}
