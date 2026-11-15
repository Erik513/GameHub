import { useState, type FormEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { selectNewTabooCards } from "../../business/games/taboo/cardExchange";
import {
  availableCategories,
  builtInCategories,
  ownCategories,
  type OwnCategory,
  type TabooCategoryInfo,
} from "../../business/games/taboo/categories";
import { capitalizeFirst, validateCard, type TabooCard } from "../../business/games/taboo/model";
import type { SupportedLanguage } from "../../i18n";
import { Button, ConfirmButton, Icon, Toast, useNotice } from "../components";
import { ActionRow, ChoiceGroup, TabPane } from "../game-kit";
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
  /** Controls below the list that never scroll away, for example import and export. */
  footer?: ReactNode;
  onRemove: (id: string) => Promise<void>;
  /** Gives all own cards of an own category another name. */
  onRenameCategory: (from: OwnCategory, to: string) => Promise<void>;
  onUpdate: (card: TabooCard) => Promise<void>;
  /** The player's own cards; they can be edited and deleted. */
  ownCards: readonly TabooCard[];
  /** The cards that ship with the app; they are shown read-only. */
  standardCards: readonly TabooCard[];
}

/** Changes that went through; they are confirmed by a message. */
type Confirmation = "renamed" | "cardSaved" | "cardDeleted" | "categoryDeleted";

type Problem =
  | "invalid"
  | "duplicate"
  | "noCategory"
  | "storage"
  | "categoryExists"
  | "noName"
  | Confirmation
  | CardProblem;

function isConfirmation(value: Problem): value is Confirmation {
  return ["renamed", "cardSaved", "cardDeleted", "categoryDeleted"].includes(value);
}

/**
 * All cards of the card language grouped by category. Every category can be opened to show its
 * cards in compact rows; the player's own cards can be changed in place.
 */
export function TabooCardList({
  allCards,
  cardLanguage,
  categoryInfos = builtInCategories,
  disabled,
  footer,
  onRemove,
  onRenameCategory,
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
  const [renaming, setRenaming] = useState<OwnCategory>();

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
  // Two views: the standard categories (shown with the cards of the card language) and the own
  // categories (of both languages). A category is opened to show and change its cards.
  const [view, setView] = useState<"standard" | "own">("standard");
  const [opened, setOpened] = useState<OwnCategory>();
  const entries: readonly OwnCategory[] =
    view === "own"
      ? ownCategoryList
      : standardCategoryIds.map((id) => ({ id, language: cardLanguage }));
  const current = opened
    ? entries.find((entry) => entry.id === opened.id && entry.language === opened.language)
    : undefined;
  const titleOf = (entry: OwnCategory) =>
    view === "own"
      ? `${categoryName(entry.id)} (${entry.language.toUpperCase()})`
      : categoryName(entry.id);
  const cardsOf = (entry: OwnCategory) => ({
    own: ownCards.filter(
      (card) => card.language === entry.language && card.categoryId === entry.id,
    ),
    standard: standardCards.filter(
      (card) => card.language === entry.language && card.categoryId === entry.id,
    ),
  });

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
      forbiddenWords: splitWords(teamNameFrom(data.get("words"))).map((word) =>
        capitalizeFirst(word, editing.language),
      ),
      term: capitalizeFirst(teamNameFrom(data.get("term")), editing.language),
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
      notify("cardSaved");
    } catch {
      notify("storage");
    }
  }

  async function removeCategory(cards: readonly TabooCard[]) {
    try {
      for (const card of cards) await onRemove(card.id);
      if (editing && cards.some((card) => card.id === editing.id)) setEditing(undefined);
      notify("categoryDeleted");
    } catch {
      notify("storage");
    }
  }

  async function renameCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!renaming) return;
    const name = capitalizeFirst(
      teamNameFrom(new FormData(event.currentTarget).get("name")),
      renaming.language,
    );
    if (!name) {
      notify("noName");
      return;
    }
    const lower = name.toLowerCase();
    // A name is taken by a standard category or by another own category of the same language.
    const taken =
      standardIds.some((id) => id.toLowerCase() === lower) ||
      ownCategoryList.some(
        (category) =>
          category.language === renaming.language &&
          category.id !== renaming.id &&
          category.id.toLowerCase() === lower,
      );
    if (taken) {
      notify("categoryExists");
      return;
    }
    try {
      if (name !== renaming.id) await onRenameCategory(renaming, name);
      if (editing?.categoryId === renaming.id && editing.language === renaming.language) {
        setEditing(undefined);
      }
      setRenaming(undefined);
      // The renamed category stays open under its new name.
      setOpened({ id: name, language: renaming.language });
      notify("renamed");
    } catch {
      notify("storage");
    }
  }

  async function remove(id: string) {
    try {
      await onRemove(id);
      if (editing?.id === id) setEditing(undefined);
      notify("cardDeleted");
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
            <ChoiceGroup
              initial={card.difficulty}
              legend={t("tabooEntry.difficulty")}
              name="difficulty"
              options={difficulties.map((value) => ({
                value,
                label: t(`tabooSetup.difficulties.${value}`),
                tone: value,
              }))}
            />
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

  // Every change is confirmed by a short message at the bottom.
  const confirmations = {
    renamed: "tabooList.categoryRenamed",
    cardSaved: "tabooList.cardSaved",
    cardDeleted: "tabooList.cardDeleted",
    categoryDeleted: "tabooList.categoryDeleted",
  } as const;
  const toast =
    notice &&
    (isConfirmation(notice.value) ? (
      <Toast key={notice.id} tone="success">
        {t(confirmations[notice.value])}
      </Toast>
    ) : (
      <Toast key={notice.id} tone="error">
        {isCardProblem(notice.value)
          ? t(`tabooCardProblems.${notice.value}`)
          : t(`tabooList.problems.${notice.value}`)}
      </Toast>
    ));

  // The header stays: the switch between the two views, or the way back with the category.
  let header: ReactNode;
  let body: ReactNode;
  if (!current) {
    header = (
      <div aria-label={t("tabooList.title")} className="kit-segmented" role="group">
        {(["standard", "own"] as const).map((value) => (
          <button
            aria-pressed={view === value}
            key={value}
            onClick={() => setView(value)}
            type="button"
          >
            {t(`tabooList.views.${value}`)}
          </button>
        ))}
      </div>
    );
    body =
      entries.length === 0 ? (
        <p className="kit-pane__empty">{t("tabooList.noOwnCategories")}</p>
      ) : (
        <ul className="taboo-card-list__categories">
          {entries.map((entry) => (
            <li key={`${entry.language}:${entry.id}`}>
              <button className="kit-nav-row" onClick={() => setOpened(entry)} type="button">
                <span>{titleOf(entry)}</span>
                <small>
                  {t("tabooList.count", {
                    count: cardsOf(entry).own.length + cardsOf(entry).standard.length,
                  })}
                </small>
                <Icon name="chevronRight" />
              </button>
            </li>
          ))}
        </ul>
      );
  } else {
    const { own, standard } = cardsOf(current);
    const title = titleOf(current);
    // While a card is edited it is the only thing on the screen.
    const editingHere = editing !== undefined && own.some((card) => card.id === editing.id);
    const renamingThis = renaming?.id === current.id && renaming.language === current.language;
    header = (
      <div className="taboo-card-list__head">
        <div className="taboo-card-list__head-row">
          <Button
            aria-label={t("tabooList.back")}
            className="icon-button"
            onClick={() => {
              setOpened(undefined);
              setEditing(undefined);
              setRenaming(undefined);
            }}
            title={t("tabooList.back")}
            variant="secondary"
          >
            <Icon name="arrowLeft" />
          </Button>
          <h3>{title}</h3>
          <small>{t("tabooList.count", { count: own.length + standard.length })}</small>
        </div>
        {view === "own" &&
          !editingHere &&
          (renamingThis ? (
            <form
              className="taboo-card-list__rename"
              noValidate
              onSubmit={(event) => void renameCategory(event)}
            >
              <input
                aria-label={t("tabooList.renameName")}
                autoComplete="off"
                className="field__input"
                defaultValue={current.id}
                maxLength={24}
                name="name"
              />
              <Button
                aria-label={t("tabooList.save")}
                className="icon-button"
                disabled={disabled}
                title={t("tabooList.save")}
                type="submit"
                variant="success"
              >
                <Icon name="check" />
              </Button>
              <Button onClick={() => setRenaming(undefined)} variant="danger">
                {t("tabooList.cancel")}
              </Button>
            </form>
          ) : (
            <div className="taboo-card-list__category-actions">
              <Button
                aria-label={t("tabooList.renameCategoryLabel", { category: title })}
                disabled={disabled}
                onClick={() => setRenaming({ id: current.id, language: current.language })}
                variant="secondary"
              >
                <Icon name="pencil" />
                {t("tabooList.renameCategory")}
              </Button>
              <ConfirmButton
                armedContent={t("tabooList.deleteCategoryAgain", { count: own.length })}
                armedLabel={t("tabooList.deleteCategoryConfirm", {
                  category: title,
                  count: own.length,
                })}
                idleLabel={t("tabooList.deleteCategoryLabel", {
                  category: title,
                  count: own.length,
                })}
                idleVariant="danger"
                onConfirm={() => {
                  setOpened(undefined);
                  void removeCategory(own);
                }}
              >
                <Icon name="trash" />
                {t("tabooList.deleteCategory")}
              </ConfirmButton>
            </div>
          ))}
      </div>
    );
    body =
      editing && editingHere ? (
        <div className="taboo-card-list__single">{renderRow(editing, true)}</div>
      ) : (
        <>
          {own.length > 0 && (
            <>
              {standard.length > 0 && (
                <small className="taboo-card-list__label">{t("tabooList.groups.ownCards")}</small>
              )}
              <ul className="taboo-card-list__cards">
                {sortCardsForList(own, current.language).map((card) => (
                  <li key={card.id}>{renderRow(card, true)}</li>
                ))}
              </ul>
            </>
          )}
          {standard.length > 0 && (
            <>
              {own.length > 0 && (
                <small className="taboo-card-list__label">
                  {t("tabooList.groups.standardCards")}
                </small>
              )}
              <ul className="taboo-card-list__cards">
                {sortCardsForList(standard, current.language).map((card) => (
                  <li key={card.id}>{renderRow(card, false)}</li>
                ))}
              </ul>
            </>
          )}
        </>
      );
  }

  return (
    <TabPane footer={footer} header={header}>
      {toast}
      {body}
    </TabPane>
  );
}
