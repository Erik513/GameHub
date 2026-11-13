import { useRef, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { parseCardEntries } from "../../business/games/taboo/cardEntry";
import {
  builtInCategories,
  ownCategories,
  type TabooCategoryInfo,
} from "../../business/games/taboo/categories";
import type { TabooCard } from "../../business/games/taboo/model";
import type { SupportedLanguage } from "../../i18n";
import { Button, Toast, useNotice } from "../components";
import { SetupSection } from "../game-kit";
import { TabooCategoryField } from "./TabooCategoryField";
import { newCategoryChoice, ownChoice, resolveCategory } from "./categoryChoice";
import { useInterfaceLanguage } from "./categoryLabel";
import { difficulties } from "./tabooSetupModel";

interface TabooCardEntryProps {
  /** All cards that are known, used to offer the player's own categories. */
  cards: readonly TabooCard[];
  /** The standard categories; their ids are not own categories. */
  categoryInfos?: readonly TabooCategoryInfo[];
  disabled: boolean;
  /** Saves the cards and resolves with the number of cards that were really new. */
  onAdd: (cards: readonly TabooCard[]) => Promise<number>;
}

type Feedback = "added" | "exists" | "invalid" | "noCategory" | "storage";

/**
 * Short form for one card: category, difficulty, term and the four forbidden words. A card goes
 * into one of the player's own categories; a new category gets a name and a language, and the
 * cards of a category always have its language.
 */
export function TabooCardEntry({
  cards,
  categoryInfos = builtInCategories,
  disabled,
  onAdd,
}: TabooCardEntryProps) {
  const { t } = useTranslation();
  const locale = useInterfaceLanguage();
  const [term, setTerm] = useState("");
  const [words, setWords] = useState("");
  const [notice, notify] = useNotice<Feedback>();
  const [picked, setPicked] = useState<string>();
  const [name, setName] = useState("");
  const [newLanguage, setNewLanguage] = useState<SupportedLanguage>("en");
  const [difficulty, setDifficulty] = useState<(typeof difficulties)[number]>("easy");
  const termInput = useRef<HTMLInputElement>(null);
  const title = t("tabooEntry.title");

  const own = ownCategories(
    cards,
    categoryInfos.map((info) => info.id),
    locale,
  );
  // Without a choice of the player the first own category is used, or a new one if there is none.
  const firstChoice = own[0] ? ownChoice(own[0]) : newCategoryChoice;
  const choice =
    picked === newCategoryChoice || own.some((category) => ownChoice(category) === picked)
      ? picked!
      : firstChoice;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const category = resolveCategory(choice, name, newLanguage);
    if (!category) {
      notify("noCategory");
      return;
    }
    // The line format uses a colon after the term, so a colon inside the term is not allowed.
    const { cards: entered } = parseCardEntries(
      `${term.replace(/[:\r\n]/gu, " ")}: ${words.replace(/[\r\n]/gu, " ")}`,
      { categoryId: category.categoryId, difficulty, language: category.language },
      () => `own-${crypto.randomUUID()}`,
    );
    if (entered.length !== 1) {
      notify("invalid");
      return;
    }
    try {
      const added = await onAdd(entered);
      notify(added > 0 ? "added" : "exists");
      if (added > 0) {
        setTerm("");
        setWords("");
        if (choice === newCategoryChoice) {
          setPicked(ownChoice({ id: category.categoryId, language: category.language }));
          setName("");
        }
        termInput.current?.focus();
      }
    } catch {
      notify("storage");
    }
  }

  return (
    <SetupSection title={title}>
      <form className="taboo-card-entry" noValidate onSubmit={(event) => void submit(event)}>
        <div className="taboo-card-entry__pair">
          <TabooCategoryField
            choice={choice}
            name={name}
            newLanguage={newLanguage}
            onChoice={setPicked}
            onLanguage={setNewLanguage}
            onName={setName}
            own={own}
            standardCategories={categoryInfos}
          />
          <label className="field">
            <span>{t("tabooEntry.difficulty")}</span>
            <select
              className="field__input"
              onChange={(event) =>
                setDifficulty(difficulties.find((value) => value === event.target.value) ?? "easy")
              }
              value={difficulty}
            >
              {difficulties.map((value) => (
                <option key={value} value={value}>
                  {t(`tabooSetup.difficulties.${value}`)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="field">
          <span>{t("tabooEntry.term")}</span>
          <input
            autoComplete="off"
            className="field__input"
            onChange={(event) => setTerm(event.target.value)}
            placeholder={t("tabooEntry.termPlaceholder")}
            ref={termInput}
            value={term}
          />
        </label>
        <label className="field">
          <span>{t("tabooEntry.words")}</span>
          <input
            autoComplete="off"
            className="field__input"
            onChange={(event) => setWords(event.target.value)}
            placeholder={t("tabooEntry.wordsPlaceholder")}
            value={words}
          />
        </label>
        <Button disabled={disabled} type="submit" variant="success">
          {t("tabooEntry.add")}
        </Button>
      </form>
      {notice && (
        <Toast key={notice.id} tone={notice.value === "added" ? "success" : "error"}>
          {t(`tabooEntry.${notice.value}`)}
        </Toast>
      )}
    </SetupSection>
  );
}
