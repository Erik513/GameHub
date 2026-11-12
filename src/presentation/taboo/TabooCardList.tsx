import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { selectNewTabooCards } from "../../business/games/taboo/cardExchange";
import {
  availableCategories,
  builtInCategories,
  customCategoryIds,
  type TabooCategoryInfo,
} from "../../business/games/taboo/categories";
import { validateCard, type TabooCard } from "../../business/games/taboo/model";
import type { SupportedLanguage } from "../../i18n";
import { Button, ConfirmButton, Icon, StatusMessage } from "../components";
import { ActionRow, SetupSection } from "../game-kit";
import { useCategoryLabel, useCategorySorter } from "./categoryLabel";
import { sortCardsForList } from "../../business/games/taboo/ordering";
import { TabooCategoryField } from "./TabooCategoryField";
import { resolveCategory } from "./categoryChoice";
import { difficulties, teamNameFrom } from "./tabooSetupModel";

interface TabooCardListProps {
  /** Every known card, used to find duplicate terms. */
  allCards: readonly TabooCard[];
  cardLanguage: SupportedLanguage;
  /** The standard categories with their names. */
  categoryInfos?: readonly TabooCategoryInfo[];
  disabled: boolean;
  onRemove: (id: string) => Promise<void>;
  onUpdate: (card: TabooCard) => Promise<void>;
  /** The player's own cards; they can be edited and deleted. */
  ownCards: readonly TabooCard[];
  /** The cards that ship with the app; they are shown read-only. */
  standardCards: readonly TabooCard[];
}

type Problem = "invalid" | "duplicate" | "noCategory" | "storage";

/**
 * All cards of the card language grouped by category. Every category can be opened to show its
 * cards in compact rows; the player's own cards can be changed in place.
 */
export function TabooCardList({
  allCards,
  cardLanguage,
  categoryInfos = builtInCategories,
  disabled,
  onRemove,
  onUpdate,
  ownCards,
  standardCards,
}: TabooCardListProps) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState<TabooCard>();
  const [problem, setProblem] = useState<Problem>();
  const [choice, setChoice] = useState("");
  const [name, setName] = useState("");

  const categoryName = useCategoryLabel(categoryInfos);
  const sortCategories = useCategorySorter(categoryInfos);
  const standardIds = categoryInfos.map((info) => info.id);
  // The same order as in the category choice of the menu: standard categories, then the own ones.
  const ownCategoryIds = sortCategories(customCategoryIds(allCards, cardLanguage, standardIds));
  const standardCategoryIds = sortCategories(
    availableCategories(categoryInfos, allCards, cardLanguage).map((info) => info.id),
  );
  const groups = [
    { key: "standard", ids: standardCategoryIds },
    { key: "own", ids: ownCategoryIds },
  ] as const;
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

  async function removeCategory(categoryId: string, cards: readonly TabooCard[]) {
    try {
      for (const card of cards) await onRemove(card.id);
      if (editing?.categoryId === categoryId) setEditing(undefined);
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
        <form className="taboo-card-list__edit" noValidate onSubmit={(event) => void save(event)}>
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
          <div className="taboo-card-entry__pair">
            <TabooCategoryField
              choice={choice}
              custom={customCategoryIds(allCards, card.language, standardIds)}
              standardCategories={categoryInfos}
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
          <ActionRow>
            <Button
              aria-label={t("tabooList.save")}
              className="icon-button--small"
              disabled={disabled}
              title={t("tabooList.save")}
              type="submit"
              variant="success"
            >
              <Icon name="check" />
            </Button>
            <ConfirmButton
              armedContent={<Icon name="trash" />}
              armedLabel={t("tabooList.deleteConfirm", { term: card.term })}
              className="icon-button--small"
              idleLabel={t("tabooList.deleteLabel", { term: card.term })}
              idleVariant="danger"
              onConfirm={() => void remove(card.id)}
            >
              <Icon name="trash" />
            </ConfirmButton>
            <Button onClick={() => setEditing(undefined)} variant="danger">
              {t("tabooList.cancel")}
            </Button>
          </ActionRow>
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
            className="icon-button--small taboo-card-row__edit"
            disabled={disabled}
            onClick={() => startEditing(card)}
            title={t("tabooList.editLabel", { term: card.term })}
            variant="secondary"
          >
            <Icon name="pencil" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <SetupSection title={t("tabooList.title")}>
      <div className="taboo-card-list">
        {problem && !editing && (
          <StatusMessage title={t("tabooList.title")} tone="error">
            {t(`tabooList.problems.${problem}`)}
          </StatusMessage>
        )}
        {groups.map((group) =>
          group.ids.length === 0 ? null : (
            <div className="taboo-card-list__group" key={group.key}>
              {ownCategoryIds.length > 0 && (
                <small>
                  {t(
                    `tabooList.groups.${group.key === "own" ? "ownCategories" : "standardCategories"}`,
                  )}
                </small>
              )}
              {group.ids.map((categoryId) => {
                const own = ownCards.filter(
                  (card) => inLanguage(card) && card.categoryId === categoryId,
                );
                const standard = standardCards.filter(
                  (card) => inLanguage(card) && card.categoryId === categoryId,
                );
                return (
                  <details className="kit-disclosure taboo-card-list__category" key={categoryId}>
                    <summary>
                      <span>{categoryName(categoryId)}</span>
                      <small>
                        {t("tabooList.count", {
                          count: own.length + standard.length,
                          own: own.length,
                        })}
                      </small>
                    </summary>
                    {own.length > 0 && (
                      <>
                        {standard.length > 0 && (
                          <small className="taboo-card-list__label">
                            {t("tabooList.groups.ownCards")}
                          </small>
                        )}
                        <ul>
                          {sortCardsForList(own, cardLanguage).map((card) => (
                            <li key={card.id}>{renderRow(card, true)}</li>
                          ))}
                        </ul>
                        {group.key === "own" && (
                          <div className="taboo-card-list__category-actions">
                            <ConfirmButton
                              armedContent={t("tabooList.deleteCategoryAgain", {
                                count: own.length,
                              })}
                              armedLabel={t("tabooList.deleteCategoryConfirm", {
                                category: categoryName(categoryId),
                                count: own.length,
                              })}
                              idleLabel={t("tabooList.deleteCategoryLabel", {
                                category: categoryName(categoryId),
                                count: own.length,
                              })}
                              idleVariant="danger"
                              onConfirm={() => void removeCategory(categoryId, own)}
                            >
                              <Icon name="trash" />
                              {t("tabooList.deleteCategory")}
                            </ConfirmButton>
                          </div>
                        )}
                      </>
                    )}
                    {standard.length > 0 && (
                      <>
                        {own.length > 0 && (
                          <small className="taboo-card-list__label">
                            {t("tabooList.groups.standardCards")}
                          </small>
                        )}
                        <ul>
                          {sortCardsForList(standard, cardLanguage).map((card) => (
                            <li key={card.id}>{renderRow(card, false)}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </details>
                );
              })}
            </div>
          ),
        )}
      </div>
    </SetupSection>
  );
}
