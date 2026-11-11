import { useTranslation } from "react-i18next";
import { newCategoryChoice } from "./categoryChoice";
import { builtInCategoryIds } from "../../business/games/taboo/categories";

interface TabooCategoryFieldProps {
  choice: string;
  /** The player's own category names that can be picked besides the built-in ones. */
  custom: readonly string[];
  name: string;
  onChoice: (choice: string) => void;
  onName: (name: string) => void;
}

/** Category select with built-in and own categories plus the option to type a new name. */
export function TabooCategoryField({
  choice,
  custom,
  name,
  onChoice,
  onName,
}: TabooCategoryFieldProps) {
  const { t } = useTranslation();

  return (
    <>
      <label className="field">
        <span>{t("tabooEntry.category")}</span>
        <select
          className="field__input"
          onChange={(event) => onChoice(event.target.value)}
          value={choice}
        >
          {builtInCategoryIds.map((id) => (
            <option key={id} value={id}>
              {t(`tabooSetup.category.${id}`)}
            </option>
          ))}
          {custom.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
          <option value={newCategoryChoice}>{t("tabooEntry.newCategory")}</option>
        </select>
      </label>
      {choice === newCategoryChoice && (
        <input
          aria-label={t("tabooEntry.newCategoryName")}
          autoComplete="off"
          className="field__input"
          maxLength={24}
          onChange={(event) => onName(event.target.value)}
          placeholder={t("tabooEntry.newCategoryName")}
          value={name}
        />
      )}
    </>
  );
}
