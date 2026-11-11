import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { TabooCard } from "../../business/games/taboo/model";
import {
  reviewForbiddenWords,
  type TabooWordSuggester,
} from "../../business/games/taboo/wordSuggester";
import { Button } from "../components";

interface TabooWordSuggestionProps {
  categoryId?: string | undefined;
  language: TabooCard["language"];
  /** Receives the four words as one comma separated text. */
  onWords: (words: string) => void;
  suggester: TabooWordSuggester | undefined;
  /** Reads the current term at click time. */
  term: () => string;
}

/** Button that asks the local AI for forbidden words; hidden when no AI is available. */
export function TabooWordSuggestion({
  categoryId,
  language,
  onWords,
  suggester,
  term,
}: TabooWordSuggestionProps) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<"needTerm" | "failed">();
  if (!suggester) return null;

  async function suggest(provider: TabooWordSuggester) {
    const text = term().trim();
    if (!text) {
      setProblem("needTerm");
      return;
    }
    setBusy(true);
    setProblem(undefined);
    const result = await provider.suggest({
      language,
      term: text,
      ...(categoryId ? { categoryId } : {}),
    });
    setBusy(false);
    const words =
      result.status === "complete" ? reviewForbiddenWords(text, result.words) : undefined;
    if (words) onWords(words.join(", "));
    else setProblem("failed");
  }

  return (
    <div className="taboo-suggestion">
      <Button disabled={busy} onClick={() => void suggest(suggester)} variant="quiet">
        {t(busy ? "tabooEntry.suggesting" : "tabooEntry.suggest")}
      </Button>
      {problem && (
        <small className="taboo-suggestion__problem" role="alert">
          {t(`tabooEntry.suggestProblems.${problem}`)}
        </small>
      )}
    </div>
  );
}
