import { useTranslation } from "react-i18next";
import type { OwnCategory, TabooCategoryInfo } from "../../business/games/taboo/categories";
import type { TabooCard } from "../../business/games/taboo/model";
import { newCategoryChoice, ownChoice, standardChoice } from "./categoryChoice";
import { useCategoryLabel } from "./categoryLabel";

const languages = ["en", "de"] as const;

interface TabooCategoryFieldProps {
  choice: string;
  /** The standard categories with their names; only needed to show `currentStandard`. */
  standardCategories: readonly TabooCategoryInfo[];
  /**
   * A standard category the edited card already sits in. Standard categories are otherwise not
   * offered: the player's own cards go into their own categories.
   */
  currentStandard?: string | undefined;
  /** The player's own categories; every one belongs to a language. */
  own: readonly OwnCategory[];
  name: string;
  /** The language of a new category. */
  newLanguage: TabooCard["language"];
  /** Keeps the language of a new category fixed, so there is no choice of it. */
  lockLanguage?: boolean;
  onChoice: (choice: string) => void;
  onName: (name: string) => void;
  onLanguage: (language: TabooCard["language"]) => void;
}

/**
 * Category select with the player's own categories (each with its language, for example
 * "Sport (DE)") and the option to make a new one with a name and a language.
 */
export function TabooCategoryField({
  choice,
  standardCategories,
  currentStandard,
  own,
  name,
  newLanguage,
  lockLanguage = false,
  onChoice,
  onName,
  onLanguage,
}: TabooCategoryFieldProps) {
  const { t } = useTranslation();
  const categoryLabel = useCategoryLabel(standardCategories);

  return (
    <>
      <label className="field">
        <span>{t("tabooEntry.category")}</span>
        <select
          className="field__input"
          onChange={(event) => onChoice(event.target.value)}
          value={choice}
        >
          {currentStandard && (
            <option value={standardChoice(currentStandard)}>
              {categoryLabel(currentStandard)}
            </option>
          )}
          {own.map((category) => (
            <option key={ownChoice(category)} value={ownChoice(category)}>
              {`${category.id} (${category.language.toUpperCase()})`}
            </option>
          ))}
          <option value={newCategoryChoice}>{t("tabooEntry.newCategory")}</option>
        </select>
      </label>
      {choice === newCategoryChoice && (
        <>
          <input
            aria-label={t("tabooEntry.newCategoryName")}
            autoComplete="off"
            className="field__input"
            maxLength={24}
            onChange={(event) => onName(event.target.value)}
            placeholder={t("tabooEntry.newCategoryName")}
            value={name}
          />
          {!lockLanguage && (
            <label className="field">
              <span>{t("tabooEntry.categoryLanguage")}</span>
              <select
                className="field__input"
                onChange={(event) => onLanguage(event.target.value === "de" ? "de" : "en")}
                value={newLanguage}
              >
                {languages.map((language) => (
                  <option key={language} value={language}>
                    {t(`language.options.${language}`)}
                  </option>
                ))}
              </select>
            </label>
          )}
        </>
      )}
    </>
  );
}
