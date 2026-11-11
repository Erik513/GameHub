import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { selectNewTabooCards } from "../../business/games/taboo/cardExchange";
import { builtInCategoryIds, customCategoryIds } from "../../business/games/taboo/categories";
import { validateCard, type TabooCard } from "../../business/games/taboo/model";
import { Button, ConfirmButton, StatusMessage } from "../components";
import { TabooCategoryField } from "./TabooCategoryField";
import { resolveCategory } from "./categoryChoice";
import { difficulties, teamNameFrom } from "./tabooSetupModel";

interface TabooCardListProps {
  /** Every known card, used to find duplicate terms and the available categories. */
  allCards: readonly TabooCard[];
  disabled: boolean;
  onRemove: (id: string) => Promise<void>;
  onUpdate: (card: TabooCard) => Promise<void>;
  /** The player's own cards; standard cards cannot be changed. */
  ownCards: readonly TabooCard[];
}

type Problem = "invalid" | "duplicate" | "noCategory" | "storage";

const isBuiltIn = (id: string): id is (typeof builtInCategoryIds)[number] =>
  (builtInCategoryIds as readonly string[]).includes(id);

/** The player's own cards with a small editor: change a card or delete it. */
export function TabooCardList({
  allCards,
  disabled,
  onRemove,
  onUpdate,
  ownCards,
}: TabooCardListProps) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState<TabooCard>();
  const [problem, setProblem] = useState<Problem>();
  const [choice, setChoice] = useState("");
  const [name, setName] = useState("");

  const categoryName = (id: string) => (isBuiltIn(id) ? t(`tabooSetup.category.${id}`) : id);
  const needle = filter.trim().toLowerCase();
  const visible = ownCards.filter(
    (card) =>
      needle === "" ||
      card.term.toLowerCase().includes(needle) ||
      card.categoryId.toLowerCase().includes(needle),
  );

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
      forbiddenWords: [1, 2, 3, 4].map((number) => teamNameFrom(data.get(`word${number}`))),
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

  if (ownCards.length === 0) {
    return (
      <section className="taboo-card-list">
        <h3>{t("tabooList.title", { count: 0 })}</h3>
        <p>{t("tabooList.empty")}</p>
      </section>
    );
  }

  return (
    <section className="taboo-card-list">
      <h3>{t("tabooList.title", { count: ownCards.length })}</h3>
      <input
        aria-label={t("tabooList.search")}
        autoComplete="off"
        className="field__input"
        onChange={(event) => setFilter(event.target.value)}
        placeholder={t("tabooList.search")}
        type="search"
        value={filter}
      />
      {problem && !editing && (
        <StatusMessage title={t("tabooList.title", { count: ownCards.length })} tone="error">
          {t(`tabooList.problems.${problem}`)}
        </StatusMessage>
      )}
      <ul aria-label={t("tabooList.title", { count: ownCards.length })}>
        {visible.map((card) => (
          <li key={card.id}>
            {editing?.id === card.id ? (
              <form
                className="taboo-card-list__edit"
                noValidate
                onSubmit={(event) => void save(event)}
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
                {card.forbiddenWords.map((word, index) => (
                  <label className="field" key={index}>
                    <span>{t("tabooList.word", { number: index + 1 })}</span>
                    <input
                      autoComplete="off"
                      className="field__input"
                      defaultValue={word}
                      name={`word${index + 1}`}
                    />
                  </label>
                ))}
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
                </div>
              </form>
            ) : (
              <div className="taboo-card-list__row">
                <div>
                  <strong>{card.term}</strong>
                  <small>
                    {categoryName(card.categoryId)} ·{" "}
                    {t(`tabooSetup.difficulties.${card.difficulty}`)} ·{" "}
                    {card.language.toUpperCase()}
                  </small>
                </div>
                <div className="taboo-card-list__actions">
                  <Button
                    aria-label={t("tabooList.editLabel", { term: card.term })}
                    disabled={disabled}
                    onClick={() => startEditing(card)}
                    variant="secondary"
                  >
                    {t("tabooList.edit")}
                  </Button>
                  <ConfirmButton
                    armedLabel={t("tabooList.deleteConfirm", { term: card.term })}
                    armedContent={t("tabooList.deleteAgain")}
                    idleLabel={t("tabooList.deleteLabel", { term: card.term })}
                    onConfirm={() => void remove(card.id)}
                  >
                    {t("tabooList.delete")}
                  </ConfirmButton>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      {visible.length === 0 && <p>{t("tabooList.noMatch")}</p>}
    </section>
  );
}
