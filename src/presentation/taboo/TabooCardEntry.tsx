import { useRef, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { parseCardEntries } from "../../business/games/taboo/cardEntry";
import { builtInCategoryIds, customCategoryIds } from "../../business/games/taboo/categories";
import type { TabooCard } from "../../business/games/taboo/model";
import type { SupportedLanguage } from "../../i18n";
import { Button, StatusMessage } from "../components";
import { useAutoGrow } from "../game-kit";
import { TabooCategoryField } from "./TabooCategoryField";
import { newCategoryChoice, resolveCategory } from "./categoryChoice";
import { difficulties } from "./tabooSetupModel";

interface TabooCardEntryProps {
  cardLanguage: SupportedLanguage;
  /** All cards that are known, used to offer the player's own category names. */
  cards: readonly TabooCard[];
  disabled: boolean;
  /** Saves the cards and resolves with the number of cards that were really new. */
  onAdd: (cards: readonly TabooCard[]) => Promise<number>;
}

type Feedback =
  | { type: "added"; added: number; skipped: number }
  | { type: "invalid"; lines: string }
  | { type: "noCategory" | "noCards" | "storage" };

/** Form to add many cards at once: one card per line, all with the same category and difficulty. */
export function TabooCardEntry({ cardLanguage, cards, disabled, onAdd }: TabooCardEntryProps) {
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const [feedback, setFeedback] = useState<Feedback>();
  const [choice, setChoice] = useState<string>(builtInCategoryIds[0]);
  const [name, setName] = useState("");
  const input = useRef<HTMLTextAreaElement>(null);
  useAutoGrow(input, text);
  const custom = customCategoryIds(cards, cardLanguage);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const categoryId = resolveCategory(choice, name);
    if (!categoryId) {
      setFeedback({ type: "noCategory" });
      return;
    }
    const difficulty = difficulties.find((value) => value === data.get("difficulty")) ?? "easy";
    const { cards: entered, invalidLines } = parseCardEntries(
      text,
      { categoryId, difficulty, language: cardLanguage },
      () => `own-${crypto.randomUUID()}`,
    );
    if (invalidLines.length > 0) {
      setFeedback({ type: "invalid", lines: invalidLines.join(", ") });
      return;
    }
    if (entered.length === 0) {
      setFeedback({ type: "noCards" });
      return;
    }
    try {
      const added = await onAdd(entered);
      setFeedback({ type: "added", added, skipped: entered.length - added });
      setText("");
      if (choice === newCategoryChoice) {
        setChoice(categoryId);
        setName("");
      }
    } catch {
      setFeedback({ type: "storage" });
    }
  }

  return (
    <form className="taboo-card-entry" noValidate onSubmit={(event) => void submit(event)}>
      <h3>{t("tabooEntry.title")}</h3>
      <p>{t("tabooEntry.hint", { language: t(`tabooEntry.languages.${cardLanguage}`) })}</p>
      <TabooCategoryField
        choice={choice}
        custom={custom}
        name={name}
        onChoice={setChoice}
        onName={setName}
      />
      <label className="field">
        <span>{t("tabooEntry.difficulty")}</span>
        <select className="field__input" defaultValue="easy" name="difficulty">
          {difficulties.map((value) => (
            <option key={value} value={value}>
              {t(`tabooSetup.difficulties.${value}`)}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>{t("tabooEntry.cards")}</span>
        <textarea
          className="field__input taboo-card-entry__input"
          onChange={(event) => setText(event.target.value)}
          placeholder={t("tabooEntry.placeholder")}
          ref={input}
          rows={3}
          value={text}
        />
      </label>
      <Button disabled={disabled} type="submit" variant="secondary">
        {t("tabooEntry.add")}
      </Button>
      {feedback && (
        <StatusMessage
          title={t("tabooEntry.title")}
          tone={feedback.type === "added" ? "success" : "error"}
        >
          {feedback.type === "added"
            ? t("tabooEntry.added", { count: feedback.added, skipped: feedback.skipped })
            : feedback.type === "invalid"
              ? t("tabooEntry.invalid", { lines: feedback.lines })
              : t(`tabooEntry.${feedback.type}`)}
        </StatusMessage>
      )}
    </form>
  );
}
