import { useRef, useState, type FormEvent, useId } from "react";
import { useTranslation } from "react-i18next";
import {
  builtInCategories,
  ownCategories,
  type TabooCategoryInfo,
} from "../../business/games/taboo/categories";
import { capitalizeFirst, validateCard, type TabooCard } from "../../business/games/taboo/model";
import type { SupportedLanguage } from "../../i18n";
import { Button, Toast, useNotice } from "../components";
import { ChoiceGroup, TabPane } from "../game-kit";
import { TabooCategoryField } from "./TabooCategoryField";
import { newCategoryChoice, ownChoice, resolveCategory } from "./categoryChoice";
import { useInterfaceLanguage } from "./categoryLabel";
import { cardProblem, isCardProblem, splitWords, type CardProblem } from "./cardProblem";
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

type Feedback = "added" | "exists" | "invalid" | "noCategory" | "storage" | CardProblem;

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
  const { i18n, t } = useTranslation();
  const locale = useInterfaceLanguage();
  const [term, setTerm] = useState("");
  const [words, setWords] = useState("");
  const [notice, notify] = useNotice<Feedback>();
  const [picked, setPicked] = useState<string>();
  const [name, setName] = useState("");
  const [newLanguage, setNewLanguage] = useState<SupportedLanguage>("en");
  const [difficulty, setDifficulty] = useState<(typeof difficulties)[number]>("easy");
  const termInput = useRef<HTMLInputElement>(null);
  const formId = useId();
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

  // The examples in the fields are in the language of the category: the language of the chosen
  // own category, or the language chosen for the new one.
  const exampleLanguage = resolveCategory(choice, "-", newLanguage)?.language ?? newLanguage;
  const example = i18n.getFixedT(exampleLanguage);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const category = resolveCategory(choice, name, newLanguage);
    if (!category) {
      notify("noCategory");
      return;
    }
    // A colon or a line break inside the term is not allowed.
    const checked = validateCard({
      id: `own-${crypto.randomUUID()}`,
      language: category.language,
      term: capitalizeFirst(term.replace(/[:\r\n]/gu, " "), category.language),
      forbiddenWords: splitWords(words.replace(/[\r\n]/gu, " ")).map((word) =>
        capitalizeFirst(word, category.language),
      ),
      categoryId: category.categoryId,
      difficulty,
    });
    if (!checked.valid) {
      notify(cardProblem(checked.issues) ?? "invalid");
      return;
    }
    const entered = [checked.value];
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
    <TabPane
      footer={
        <Button disabled={disabled} form={formId} type="submit" variant="success">
          {t("tabooEntry.add")}
        </Button>
      }
    >
      <form
        aria-label={title}
        className="taboo-card-entry"
        id={formId}
        noValidate
        onSubmit={(event) => void submit(event)}
      >
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
          <ChoiceGroup
            initial={difficulty}
            legend={t("tabooEntry.difficulty")}
            name="difficulty"
            onChange={(value) =>
              setDifficulty(difficulties.find((item) => item === value) ?? "easy")
            }
            value={difficulty}
            options={difficulties.map((value) => ({
              value,
              label: t(`tabooSetup.difficulties.${value}`),
              tone: value,
            }))}
          />
        </div>
        <label className="field">
          <span>{t("tabooEntry.term")}</span>
          <input
            autoComplete="off"
            className="field__input"
            onChange={(event) => setTerm(event.target.value)}
            placeholder={example("tabooEntry.termPlaceholder")}
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
            placeholder={example("tabooEntry.wordsPlaceholder")}
            value={words}
          />
        </label>
      </form>
      {notice && (
        <Toast key={notice.id} tone={notice.value === "added" ? "success" : "error"}>
          {isCardProblem(notice.value)
            ? t(`tabooCardProblems.${notice.value}`)
            : t(`tabooEntry.${notice.value}`)}
        </Toast>
      )}
    </TabPane>
  );
}
