import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { selectNewTabooCards } from "../../business/games/taboo/cardExchange";
import {
  availableCategories,
  builtInCategories,
  ownCategories,
  type TabooCategoryInfo,
} from "../../business/games/taboo/categories";
import { validateCard, type TabooCard } from "../../business/games/taboo/model";
import type { SupportedLanguage } from "../../i18n";
import { Button, ConfirmButton, Icon, Toast, useNotice } from "../components";
import { ActionRow, SetupSection } from "../game-kit";
import { useCategoryLabel, useCategorySorter, useInterfaceLanguage } from "./categoryLabel";
import { sortCardsForList } from "../../business/games/taboo/ordering";
import { TabooCategoryField } from "./TabooCategoryField";
import { cardProblem, isCardProblem, splitWords, type CardProblem } from "./cardProblem";
import { ownChoice, resolveCategory, standardChoice } from "./categoryChoice";
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

type Problem = "invalid" | "duplicate" | "noCategory" | "storage" | CardProblem;

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
  const [notice, notify] = useNotice<Problem>();
  const [choice, setChoice] = useState("");
  const [name, setName] = useState("");
  const [newLanguage, setNewLanguage] = useState<SupportedLanguage>(cardLanguage);

  const locale = useInterfaceLanguage();
  const categoryName = useCategoryLabel(categoryInfos);
  const sortCategories = useCategorySorter(categoryInfos);
  const standardIds = categoryInfos.map((info) => info.id);
  // Own categories of both languages, each with its language; the standard categories are shown
  // with the cards of the card language.
  const ownCategoryList = ownCategories(allCards, standardIds, locale);
  const standardCategoryIds = sortCategories(
    availableCategories(categoryInfos, allCards, cardLanguage).map((info) => info.id),
  );
  const groups = [
    {
      key: "standard",
      entries: standardCategoryIds.map((id) => ({ id, language: cardLanguage })),
    },
    { key: "own", entries: ownCategoryList },
  ] as const;

  function startEditing(card: TabooCard) {
    setEditing(card);
    setChoice(
      standardIds.includes(card.categoryId)
        ? standardChoice(card.categoryId)
        : ownChoice({ id: card.categoryId, language: card.language }),
    );
    setName("");
    setNewLanguage(card.language);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const data = new FormData(event.currentTarget);
    const category = resolveCategory(choice, name, editing.language);
    if (!category) {
      notify("noCategory");
      return;
    }
    const { categoryId } = category;
    const difficulty = difficulties.find((value) => value === data.get("difficulty"));
    const result = validateCard({
      ...editing,
      categoryId,
      difficulty: difficulty ?? editing.difficulty,
      forbiddenWords: splitWords(teamNameFrom(data.get("words"))),
      term: teamNameFrom(data.get("term")),
    });
    if (!result.valid) {
      notify(cardProblem(result.issues) ?? "invalid");
      return;
    }
    const others = allCards.filter((card) => card.id !== editing.id);
    if (selectNewTabooCards([result.value], others).length === 0) {
      notify("duplicate");
      return;
    }
    try {
      await onUpdate(result.value);
      setEditing(undefined);
    } catch {
      notify("storage");
    }
  }

  async function removeCategory(cards: readonly TabooCard[]) {
    try {
      for (const card of cards) await onRemove(card.id);
      if (editing && cards.some((card) => card.id === editing.id)) setEditing(undefined);
    } catch {
      notify("storage");
    }
  }

  async function remove(id: string) {
    try {
      await onRemove(id);
      if (editing?.id === id) setEditing(undefined);
    } catch {
      notify("storage");
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
              currentStandard={standardIds.includes(card.categoryId) ? card.categoryId : undefined}
              lockLanguage
              name={name}
              newLanguage={newLanguage}
              onChoice={setChoice}
              onLanguage={setNewLanguage}
              onName={setName}
              own={ownCategoryList.filter((category) => category.language === card.language)}
              standardCategories={categoryInfos}
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
        {notice && (
          <Toast key={notice.id} tone="error">
            {isCardProblem(notice.value)
              ? t(`tabooCardProblems.${notice.value}`)
              : t(`tabooList.problems.${notice.value}`)}
          </Toast>
        )}
        {groups.map((group) =>
          group.entries.length === 0 ? null : (
            <div className="taboo-card-list__group" key={group.key}>
              {(ownCategoryList.length > 0 || group.key === "standard") && (
                <small>
                  {t(
                    `tabooList.groups.${group.key === "own" ? "ownCategories" : "standardCategories"}`,
                  )}
                </small>
              )}
              {group.entries.map(({ id: categoryId, language }) => {
                const own = ownCards.filter(
                  (card) => card.language === language && card.categoryId === categoryId,
                );
                const standard = standardCards.filter(
                  (card) => card.language === language && card.categoryId === categoryId,
                );
                return (
                  <details
                    className="kit-disclosure taboo-card-list__category"
                    key={`${language}:${categoryId}`}
                  >
                    <summary>
                      <span>
                        {categoryName(categoryId)}
                        {group.key === "own" && ` (${language.toUpperCase()})`}
                      </span>
                      <small>{t("tabooList.count", { count: own.length + standard.length })}</small>
                    </summary>
                    {own.length > 0 && (
                      <>
                        {standard.length > 0 && (
                          <small className="taboo-card-list__label">
                            {t("tabooList.groups.ownCards")}
                          </small>
                        )}
                        <ul>
                          {sortCardsForList(own, language).map((card) => (
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
                              onConfirm={() => void removeCategory(own)}
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
                          {sortCardsForList(standard, language).map((card) => (
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
