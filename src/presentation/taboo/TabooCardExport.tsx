import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  builtInCategories,
  customCategoryIds,
  type TabooCategoryInfo,
} from "../../business/games/taboo/categories";
import type { TabooCard } from "../../business/games/taboo/model";
import type { SupportedLanguage } from "../../i18n";
import { Button, Dialog, Icon } from "../components";
import { useCategorySorter } from "./categoryLabel";

interface TabooCardExportProps {
  /** Every known card; the export offers the player's own categories. */
  allCards: readonly TabooCard[];
  cardLanguage: SupportedLanguage;
  categoryInfos?: readonly TabooCategoryInfo[];
  disabled: boolean;
  /** Saves the given cards of one category as a file. */
  onExport: (categoryId: string, cards: readonly TabooCard[]) => void;
}

/**
 * The export button of the card page. It opens a window with an info text and the player's own
 * categories as buttons below each other; a click exports exactly that category.
 */
export function TabooCardExport({
  allCards,
  cardLanguage,
  categoryInfos = builtInCategories,
  disabled,
  onExport,
}: TabooCardExportProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const sortCategories = useCategorySorter(categoryInfos);

  const ids = sortCategories(
    customCategoryIds(
      allCards,
      cardLanguage,
      categoryInfos.map((info) => info.id),
    ),
  );
  const cardsOf = (id: string) =>
    allCards.filter((card) => card.language === cardLanguage && card.categoryId === id);
  const options = ids.filter((id) => cardsOf(id).length > 0);

  return (
    <>
      <Button disabled={disabled} onClick={() => setOpen(true)} variant="secondary">
        <Icon name="download" />
        {t("tabooLibrary.export")}
      </Button>
      <Dialog
        closeLabel={t("settings.close")}
        onClose={() => setOpen(false)}
        open={open}
        title={t("tabooLibrary.export")}
      >
        <div className="taboo-card-export">
          <p>{t(options.length > 0 ? "tabooLibrary.exportInfo" : "tabooLibrary.exportEmpty")}</p>
          {options.map((id) => (
            <Button
              disabled={disabled}
              key={id}
              onClick={() => {
                onExport(id, cardsOf(id));
                setOpen(false);
              }}
              variant="secondary"
            >
              {id} ({cardsOf(id).length})
            </Button>
          ))}
        </div>
      </Dialog>
    </>
  );
}
