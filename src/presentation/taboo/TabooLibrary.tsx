import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  parseTabooCardFile,
  selectNewTabooCards,
  serializeTabooCards,
} from "../../business/games/taboo/cardExchange";
import type { TabooCardRepository } from "../../business/games/taboo/cardRepository";
import type { TabooCard } from "../../business/games/taboo/model";
import type { SupportedLanguage } from "../../i18n";
import { Button, StatusMessage } from "../components";
import { TabooSetup } from "./TabooSetup";

interface TabooLibraryProps {
  cardLanguage: SupportedLanguage;
  cards: readonly TabooCard[];
  repository: TabooCardRepository | undefined;
}

type Feedback = { type: "invalid" | "storage" } | { type: "imported"; count: number };

export function TabooLibrary({ cardLanguage, cards, repository }: TabooLibraryProps) {
  const { t } = useTranslation();
  const [ownCards, setOwnCards] = useState<readonly TabooCard[]>();
  const [feedback, setFeedback] = useState<Feedback>();
  const [busy, setBusy] = useState(false);

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
      const saved = await repository.list();
      const additions = selectNewTabooCards(incoming, [...cards, ...saved]);
      if (additions.length > 0) await repository.addAll(additions);
      setOwnCards([...saved, ...additions]);
      setFeedback({ type: "imported", count: additions.length });
    } catch {
      setFeedback({ type: "storage" });
    } finally {
      setBusy(false);
    }
  }

  function exportCards() {
    if (!ownCards?.length) return;
    const urlApi = URL;
    const url = urlApi.createObjectURL(
      new Blob([serializeTabooCards(ownCards)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "gamehub-taboo-cards.json";
    link.click();
    setTimeout(() => urlApi.revokeObjectURL(url), 1000);
  }

  return (
    <>
      {repository && (
        <details>
          <summary>{t("tabooLibrary.title")}</summary>
          <p>{t("tabooLibrary.hint")}</p>
          <div className="taboo-setup__actions">
            <label>
              {t("tabooLibrary.import")}
              <input
                type="file"
                accept=".json,application/json"
                disabled={busy}
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0];
                  event.currentTarget.value = "";
                  if (file) void importCards(file);
                }}
              />
            </label>
            <Button variant="secondary" disabled={busy || !ownCards?.length} onClick={exportCards}>
              {t("tabooLibrary.export")}
            </Button>
          </div>
          {feedback && (
            <StatusMessage
              title={t("tabooLibrary.title")}
              tone={feedback.type === "imported" ? "success" : "error"}
            >
              {feedback.type === "imported"
                ? t("tabooLibrary.imported", { count: feedback.count })
                : t(`tabooLibrary.${feedback.type}`)}
            </StatusMessage>
          )}
        </details>
      )}
      <TabooSetup cardLanguage={cardLanguage} cards={[...(ownCards ?? []), ...cards]} />
    </>
  );
}
