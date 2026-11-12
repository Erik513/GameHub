import { useTranslation } from "react-i18next";
import { categoryName, type TabooCategoryInfo } from "../../business/games/taboo/categories";

/** Returns a function that shows a category name in the interface language. */
export function useCategoryLabel(infos: readonly TabooCategoryInfo[]) {
  const { i18n } = useTranslation();
  const language = i18n.language.startsWith("de") ? "de" : "en";
  return (id: string) => categoryName(infos, id, language);
}
