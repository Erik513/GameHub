import { useRef, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { selectNewTabooCards } from "../../business/games/taboo/cardExchange";
import { builtInCategoryIds, customCategoryIds } from "../../business/games/taboo/categories";
import { validateCard, type TabooCard } from "../../business/games/taboo/model";
import type { SupportedLanguage } from "../../i18n";
import type { TabooWordSuggester } from "../../business/games/taboo/wordSuggester";
import { Button, ConfirmButton, StatusMessage } from "../components";
import { TabooWordSuggestion } from "./TabooWordSuggestion";
import { TabooCategoryField } from "./TabooCategoryField";
import { resolveCategory } from "./categoryChoice";
import { difficulties, teamNameFrom } from "./tabooSetupModel";

interface TabooCardListProps {
  /** Every known card, used to find duplicate terms. */
  allCards: readonly TabooCard[];
  cardLanguage: SupportedLanguage;
  disabled: boolean;
  onRemove: (id: string) => Promise<void>;
  onUpdate: (card: TabooCard) => Promise<void>;
  /** The player's own cards; they can be edited and deleted. */
  ownCards: readonly TabooCard[];
  /** The cards that ship with the app; they are shown read-only. */
  standardCards: readonly TabooCard[];
  /** Offers AI suggestions for the forbidden words when a local AI is available. */
  suggester?: TabooWordSuggester | undefined;
}

type Problem = "invalid" | "duplicate" | "noCategory" | "storage";

const isBuiltIn = (id: string): id is (typeof builtInCategoryIds)[number] =>
  (builtInCategoryIds as readonly string[]).includes(id);

/**
 * All cards of the card language grouped by category. Every category can be opened to show its
 * cards in compact rows; the player's own cards can be changed in place.
 */
export function TabooCardList({
  allCards,
  cardLanguage,
  disabled,
  onRemove,
  onUpdate,
  ownCards,
  standardCards,
  suggester,
}: TabooCardListProps) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState<TabooCard>();
  const [problem, setProblem] = useState<Problem>();
  const [choice, setChoice] = useState("");
  const [name, setName] = useState("");
  const editForm = useRef<HTMLFormElement>(null);

  const categoryName = (id: string) => (isBuiltIn(id) ? t(`tabooSetup.category.${id}`) : id);
  const categoryIds = [...builtInCategoryIds, ...customCategoryIds(allCards, cardLanguage)];
  const inLanguage = (card: TabooCard) => card.language === cardLanguage;

  function startEditing(card: TabooCard) {
    setEditing(card);
    setChoice(card.categoryId);
    setName("");
    setProblem(undefined);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const data = new FormData(event.currentTarget);
    const categoryId = resolveCategory(choice, name);
    if (!categoryId) {
      setProblem("noCategory");
      return;
    }
    const difficulty = difficulties.find((value) => value === data.get("difficulty"));
    const result = validateCard({
      ...editing,
      categoryId,
      difficulty: difficulty ?? editing.difficulty,
      forbiddenWords: teamNameFrom(data.get("words")).split(/[,;]/u),
      term: teamNameFrom(data.get("term")),
    });
    if (!result.valid) {
      setProblem("invalid");
      return;
    }
    const others = allCards.filter((card) => card.id !== editing.id);
    if (selectNewTabooCards([result.value], others).length === 0) {
      setProblem("duplicate");
      return;
    }
    try {
      await onUpdate(result.value);
      setEditing(undefined);
      setProblem(undefined);
    } catch {
      setProblem("storage");
    }
  }

  async function remove(id: string) {
    try {
      await onRemove(id);
      if (editing?.id === id) setEditing(undefined);
      setProblem(undefined);
    } catch {
      setProblem("storage");
    }
  }

  function renderRow(card: TabooCard, own: boolean) {
    if (own && editing?.id === card.id) {
      return (
        <form
          className="taboo-card-list__edit"
          noValidate
          onSubmit={(event) => void save(event)}
          ref={editForm}
        >
          <label className="field">
            <span>{t("tabooList.term")}</span>
            <input
              autoComplete="off"
              className="field__input"
              defaultValue={card.term}
              name="term"
            />
          </label>
          <label className="field">
            <span>{t("tabooList.words")}</span>
            <input
              autoComplete="off"
              className="field__input"
              defaultValue={card.forbiddenWords.join(", ")}
              name="words"
            />
          </label>
          <TabooWordSuggestion
            categoryId={resolveCategory(choice, name) || undefined}
            language={card.language}
            onWords={(words) => {
              const field = editForm.current?.elements.namedItem("words");
              if (field instanceof HTMLInputElement) field.value = words;
            }}
            suggester={suggester}
            term={() => {
              const field = editForm.current?.elements.namedItem("term");
              return field instanceof HTMLInputElement ? field.value : "";
            }}
          />
          <div className="taboo-card-entry__pair">
            <TabooCategoryField
              choice={choice}
              custom={customCategoryIds(allCards, card.language)}
              name={name}
              onChoice={setChoice}
              onName={setName}
            />
            <label className="field">
              <span>{t("tabooEntry.difficulty")}</span>
              <select className="field__input" defaultValue={card.difficulty} name="difficulty">
                {difficulties.map((value) => (
                  <option key={value} value={value}>
                    {t(`tabooSetup.difficulties.${value}`)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {problem && (
            <StatusMessage title={t("tabooList.edit")} tone="error">
              {t(`tabooList.problems.${problem}`)}
            </StatusMessage>
          )}
          <div className="taboo-card-list__actions">
            <Button disabled={disabled} type="submit" variant="success">
              {t("tabooList.save")}
            </Button>
            <Button onClick={() => setEditing(undefined)} variant="secondary">
              {t("tabooList.cancel")}
            </Button>
            <ConfirmButton
              armedContent={t("tabooList.deleteAgain")}
              armedLabel={t("tabooList.deleteConfirm", { term: card.term })}
              idleLabel={t("tabooList.deleteLabel", { term: card.term })}
              onConfirm={() => void remove(card.id)}
            >
              {t("tabooList.delete")}
            </ConfirmButton>
          </div>
        </form>
      );
    }
    return (
      <div className="taboo-card-row">
        <strong className="taboo-card-row__term">{card.term}</strong>
        <span className="taboo-card-row__level" data-difficulty={card.difficulty}>
          {t(`tabooSetup.difficulties.${card.difficulty}`)}
        </span>
        <span className="taboo-card-row__words">{card.forbiddenWords.join(" · ")}</span>
        {own && (
          <Button
            aria-label={t("tabooList.editLabel", { term: card.term })}
            className="taboo-card-row__edit"
            disabled={disabled}
            onClick={() => startEditing(card)}
            variant="quiet"
          >
            {t("tabooList.edit")}
          </Button>
        )}
      </div>
    );
  }

  return (
    <section className="taboo-card-list">
      <h3>{t("tabooList.title")}</h3>
      {problem && !editing && (
        <StatusMessage title={t("tabooList.title")} tone="error">
          {t(`tabooList.problems.${problem}`)}
        </StatusMessage>
      )}
      {categoryIds.map((categoryId) => {
        const own = ownCards.filter((card) => inLanguage(card) && card.categoryId === categoryId);
        const standard = standardCards.filter(
          (card) => inLanguage(card) && card.categoryId === categoryId,
        );
        return (
          <details className="taboo-more taboo-card-list__category" key={categoryId}>
            <summary>
              <span>{categoryName(categoryId)}</span>
              <small>
                {t("tabooList.count", { count: own.length + standard.length, own: own.length })}
              </small>
            </summary>
            <ul>
              {own.map((card) => (
                <li key={card.id}>{renderRow(card, true)}</li>
              ))}
              {standard.map((card) => (
                <li key={card.id}>{renderRow(card, false)}</li>
              ))}
            </ul>
          </details>
        );
      })}
    </section>
  );
}
