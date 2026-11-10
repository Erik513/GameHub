import { useEffect, useRef, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import type {
  TabooCardGenerator,
  TabooGenerationErrorCode,
} from "../../business/games/taboo/cardGenerator";
import type { TabooCardRepository } from "../../business/games/taboo/cardRepository";
import type { Difficulty, TabooCard, ValidationIssue } from "../../business/games/taboo/model";
import {
  reviewGeneratedCards,
  saveGeneratedCards,
} from "../../business/games/taboo/validateGeneratedCards";
import { Button, StatusMessage } from "../components";

export interface TabooGenerators {
  readonly local: TabooCardGenerator;
  readonly ollama?: (model: string) => TabooCardGenerator;
}

interface Props {
  cardLanguage: TabooCard["language"];
  standardCards: readonly TabooCard[];
  repository: TabooCardRepository;
  generators: TabooGenerators | undefined;
  onSaved: (cards: readonly TabooCard[]) => void;
}

type Notice =
  | { type: "error"; code: TabooGenerationErrorCode | "storage" }
  | { type: "saved"; count: number }
  | { type: "preview" };
const categories = ["everyday", "nature", "culture"] as const;
const difficulties = ["easy", "medium", "hard"] as const;

export function TabooGeneration({
  cardLanguage,
  standardCards,
  repository,
  generators,
  onSaved,
}: Props) {
  const { t } = useTranslation();
  const [provider, setProvider] = useState("local");
  const [busy, setBusy] = useState<"generate" | "save">();
  const [review, setReview] = useState<ReturnType<typeof reviewGeneratedCards>>();
  const [selected, setSelected] = useState<readonly string[]>([]);
  const [notice, setNotice] = useState<Notice>();
  const active = useRef<AbortController | undefined>(undefined);
  useEffect(() => () => active.current?.abort(), []);

  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !generators) return;
    const data = new FormData(event.currentTarget);
    const model = data.get("model");
    const generator =
      provider === "ollama"
        ? generators.ollama?.(typeof model === "string" ? model : "")
        : generators.local;
    if (!generator) return;
    const request = {
      language: data.get("language") === "de" ? ("de" as const) : ("en" as const),
      categoryId: data.get("category") as string,
      difficulty: data.get("difficulty") as Difficulty,
      count: Number(data.get("count")),
    };
    const controller = new AbortController();
    active.current = controller;
    setBusy("generate");
    setReview(undefined);
    setSelected([]);
    setNotice(undefined);
    try {
      const result = await generator.generate(request, {
        get aborted() {
          return controller.signal.aborted;
        },
        subscribe(onAbort) {
          controller.signal.addEventListener("abort", onAbort, { once: true });
          return () => controller.signal.removeEventListener("abort", onAbort);
        },
      });
      if (controller.signal.aborted || result.status === "failed") {
        setNotice({
          type: "error",
          code: controller.signal.aborted
            ? "cancelled"
            : result.status === "failed"
              ? result.code
              : "cancelled",
        });
        return;
      }
      const saved = await repository.list();
      if (controller.signal.aborted) {
        setNotice({ type: "error", code: "cancelled" });
        return;
      }
      const preview = reviewGeneratedCards(
        request,
        result.candidates,
        [...standardCards, ...saved],
        () => crypto.randomUUID(),
      );
      setReview(preview);
      setSelected(preview.accepted.map((card) => card.id));
      setNotice({ type: "preview" });
    } catch {
      setNotice({ type: "error", code: controller.signal.aborted ? "cancelled" : "storage" });
    } finally {
      active.current = undefined;
      setBusy(undefined);
    }
  }

  async function save() {
    if (!review || busy || selected.length === 0) return;
    setBusy("save");
    try {
      const additions = await saveGeneratedCards(
        repository,
        review.accepted.filter((card) => selected.includes(card.id)),
        standardCards,
      );
      onSaved(additions);
      setNotice({ type: "saved", count: additions.length });
      setReview(undefined);
      setSelected([]);
    } catch {
      setNotice({ type: "error", code: "storage" });
    } finally {
      setBusy(undefined);
    }
  }

  function reason(issue: ValidationIssue) {
    if (issue.field === "card" && issue.code === "duplicate") return t("tabooGeneration.duplicate");
    if (issue.code === "request_mismatch") return t("tabooGeneration.mismatch");
    return t("tabooGeneration.invalidCard");
  }

  return (
    <details className="taboo-setup">
      <summary>{t("tabooGeneration.title")}</summary>
      <form onSubmit={(event) => void generate(event)}>
        <fieldset disabled={Boolean(busy) || !generators}>
          <legend>{t("tabooGeneration.title")}</legend>
          <div className="taboo-setup__fields">
            <label className="language-control">
              {t("tabooGeneration.provider")}
              <select value={provider} onChange={(event) => setProvider(event.currentTarget.value)}>
                <option value="local">{t("tabooGeneration.local")}</option>
                {generators?.ollama && <option value="ollama">Ollama</option>}
              </select>
            </label>
            {provider === "ollama" && (
              <label className="language-control">
                {t("tabooGeneration.model")}
                <input className="field__input" name="model" required />
              </label>
            )}
            <label className="language-control">
              {t("language.cardLabel")}
              <select name="language" defaultValue={cardLanguage}>
                <option value="de">{t("language.options.de")}</option>
                <option value="en">{t("language.options.en")}</option>
              </select>
            </label>
            <label className="language-control">
              {t("tabooGeneration.category")}
              <select name="category">
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {t(`tabooSetup.category.${category}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="language-control">
              {t("tabooSetup.difficulty")}
              <select name="difficulty">
                {difficulties.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {t(`tabooSetup.difficulties.${difficulty}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="language-control">
              {t("tabooGeneration.count")}
              <input
                className="field__input"
                name="count"
                type="number"
                min="1"
                max={generators?.local.capabilities.maxCardsPerRequest ?? 10}
                defaultValue="2"
                required
              />
            </label>
          </div>
          <Button type="submit">{t("tabooGeneration.generate")}</Button>
        </fieldset>
      </form>
      {!generators && <p>{t("tabooGeneration.noProvider")}</p>}
      {busy === "generate" && (
        <StatusMessage title={t("tabooGeneration.working")}>
          <Button variant="secondary" onClick={() => active.current?.abort()}>
            {t("tabooGeneration.cancel")}
          </Button>
        </StatusMessage>
      )}
      {notice?.type === "error" && (
        <StatusMessage title={t("tabooGeneration.title")} tone="error">
          {t(`tabooGeneration.errors.${notice.code}`)}
        </StatusMessage>
      )}
      {notice?.type === "saved" && (
        <p role="status">{t("tabooGeneration.saved", { count: notice.count })}</p>
      )}
      {review && (
        <fieldset disabled={Boolean(busy)}>
          <legend>{t("tabooGeneration.preview")}</legend>
          {notice?.type === "preview" && (
            <p role="status">
              {t("tabooGeneration.review", {
                accepted: review.accepted.length,
                rejected: review.rejected.length,
              })}
            </p>
          )}
          {review.accepted.map((card) => (
            <label key={card.id}>
              <input
                type="checkbox"
                checked={selected.includes(card.id)}
                onChange={(event) => {
                  setSelected(
                    event.currentTarget.checked
                      ? [...selected, card.id]
                      : selected.filter((id) => id !== card.id),
                  );
                }}
              />
              <span lang={card.language}>
                {" "}
                {card.term} · {card.forbiddenWords.join(", ")}
              </span>
            </label>
          ))}
          {review.rejected.length > 0 && (
            <ul>
              {review.rejected.map(({ index, issues }) => (
                <li key={index}>
                  {t("tabooGeneration.rejected", {
                    number: index + 1,
                    reason: [...new Set(issues.map(reason))].join(" "),
                  })}
                </li>
              ))}
            </ul>
          )}
          <Button disabled={selected.length === 0} onClick={() => void save()}>
            {t("tabooGeneration.save")}
          </Button>
        </fieldset>
      )}
    </details>
  );
}
