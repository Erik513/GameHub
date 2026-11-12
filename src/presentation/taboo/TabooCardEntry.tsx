import { useRef, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { parseCardEntries } from "../../business/games/taboo/cardEntry";
import {
  builtInCategories,
  customCategoryIds,
  type TabooCategoryInfo,
} from "../../business/games/taboo/categories";
import type { TabooCard } from "../../business/games/taboo/model";
import type { SupportedLanguage } from "../../i18n";
import { Button, StatusMessage } from "../components";
import { TabooCategoryField } from "./TabooCategoryField";
import { newCategoryChoice, resolveCategory } from "./categoryChoice";
import { difficulties } from "./tabooSetupModel";

interface TabooCardEntryProps {
  cardLanguage: SupportedLanguage;
  /** All cards that are known, used to offer the player's own category names. */
  cards: readonly TabooCard[];
  /** The standard categories a card can be added to. */
  categoryInfos?: readonly TabooCategoryInfo[];
  disabled: boolean;
  /** Saves the cards and resolves with the number of cards that were really new. */
  onAdd: (cards: readonly TabooCard[]) => Promise<number>;
}

type Feedback = "added" | "exists" | "invalid" | "noCategory" | "storage";

/** Short form for one card: category, difficulty, term and the four forbidden words. */
export function TabooCardEntry({
  cardLanguage,
  cards,
  categoryInfos = builtInCategories,
  disabled,
  onAdd,
}: TabooCardEntryProps) {
  const { t } = useTranslation();
  const [term, setTerm] = useState("");
  const [words, setWords] = useState("");
  const [feedback, setFeedback] = useState<Feedback>();
  const [choice, setChoice] = useState<string>(categoryInfos[0]?.id ?? "everyday");
  const [name, setName] = useState("");
  const [difficulty, setDifficulty] = useState<(typeof difficulties)[number]>("easy");
  const termInput = useRef<HTMLInputElement>(null);
  const title = t("tabooEntry.title", { language: t(`tabooEntry.languages.${cardLanguage}`) });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const categoryId = resolveCategory(choice, name);
    if (!categoryId) {
      setFeedback("noCategory");
      return;
    }
    // The line format uses a colon after the term, so a colon inside the term is not allowed.
    const { cards: entered } = parseCardEntries(
      `${term.replace(/[:\r\n]/gu, " ")}: ${words.replace(/[\r\n]/gu, " ")}`,
      { categoryId, difficulty, language: cardLanguage },
      () => `own-${crypto.randomUUID()}`,
    );
    if (entered.length !== 1) {
      setFeedback("invalid");
      return;
    }
    try {
      const added = await onAdd(entered);
      setFeedback(added > 0 ? "added" : "exists");
      if (added > 0) {
        setTerm("");
        setWords("");
        if (choice === newCategoryChoice) {
          setChoice(categoryId);
          setName("");
        }
        termInput.current?.focus();
      }
    } catch {
      setFeedback("storage");
    }
  }

  return (
    <form className="taboo-card-entry" noValidate onSubmit={(event) => void submit(event)}>
      <h3>{title}</h3>
      <div className="taboo-card-entry__pair">
        <TabooCategoryField
          choice={choice}
          custom={customCategoryIds(
            cards,
            cardLanguage,
            categoryInfos.map((info) => info.id),
          )}
          standardCategories={categoryInfos}
          name={name}
          onChoice={setChoice}
          onName={setName}
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
      <Button disabled={disabled} type="submit" variant="secondary">
        {t("tabooEntry.add")}
      </Button>
      {feedback && (
        <StatusMessage title={title} tone={feedback === "added" ? "success" : "error"}>
          {t(`tabooEntry.${feedback}`)}
        </StatusMessage>
      )}
    </form>
  );
}
