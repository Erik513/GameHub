import { normalizeText } from "../../business/games/taboo/model";

/** Select value that reveals the input for a new category name. */
export const newCategoryChoice = "__new__";

/** The category a choice stands for, or an empty string while a new name is still missing. */
export function resolveCategory(choice: string, name: string): string {
  return choice === newCategoryChoice ? normalizeText(name) : choice;
}
