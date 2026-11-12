import { useTranslation } from "react-i18next";
import { categoryName, type TabooCategoryInfo } from "../../business/games/taboo/categories";
import { sortByLabel } from "../../business/games/taboo/ordering";

/** The interface language, reduced to the two languages the game has names for. */
export function useInterfaceLanguage() {
  const { i18n } = useTranslation();
  return i18n.language.startsWith("de") ? "de" : "en";
}

/** Returns a function that shows a category name in the interface language. */
export function useCategoryLabel(infos: readonly TabooCategoryInfo[]) {
  const language = useInterfaceLanguage();
  return (id: string) => categoryName(infos, id, language);
}

/** Returns a function that sorts category ids alphabetically by their shown name. */
export function useCategorySorter(infos: readonly TabooCategoryInfo[]) {
  const language = useInterfaceLanguage();
  return (ids: readonly string[]) =>
    sortByLabel(ids, (id) => categoryName(infos, id, language), language);
}
