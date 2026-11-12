import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { TabooCard } from "../../business/games/taboo/model";
import {
  reviewForbiddenWords,
  type TabooWordSuggester,
} from "../../business/games/taboo/wordSuggester";
import { Button, Icon } from "../components";

interface TabooWordSuggestionProps {
  categoryId?: string | undefined;
  language: TabooCard["language"];
  /** Receives the four words as one comma separated text. */
  onWords: (words: string) => void;
  suggester: TabooWordSuggester | undefined;
  /** Reads the current term at click time. */
  term: () => string;
}

/** Icon button that asks the local AI for forbidden words; disabled when no AI was found. */
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

  const label = t("tabooEntry.suggest");

  return (
    <>
      <Button
        aria-label={label}
        className="icon-button--small"
        disabled={busy || !suggester}
        onClick={() => suggester && void suggest(suggester)}
        title={suggester ? label : t("tabooEntry.suggestUnavailable")}
        variant="secondary"
      >
        <Icon name="sparkle" />
      </Button>
      {busy && (
        <small className="taboo-words__note" role="status">
          {t("tabooEntry.suggesting")}
        </small>
      )}
      {!suggester && (
        <small className="taboo-words__note">{t("tabooEntry.suggestUnavailable")}</small>
      )}
      {problem && (
        <small className="taboo-words__note taboo-words__note--problem" role="alert">
          {t(`tabooEntry.suggestProblems.${problem}`)}
        </small>
      )}
    </>
  );
}
