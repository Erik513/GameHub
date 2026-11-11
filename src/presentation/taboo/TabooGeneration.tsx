import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import type {
  TabooCardGenerator,
  TabooGenerationErrorCode,
} from "../../business/games/taboo/cardGenerator";
import type { TabooCardRepository } from "../../business/games/taboo/cardRepository";
import type { TabooCard, ValidationIssue } from "../../business/games/taboo/model";
import {
  reviewGeneratedCards,
  saveGeneratedCards,
} from "../../business/games/taboo/validateGeneratedCards";
import { Button, StatusMessage } from "../components";

export interface TabooGenerators {
  readonly local: TabooCardGenerator;
  readonly discover?: (signal: AbortSignal) => Promise<TabooCardGenerator | undefined>;
}

interface Props {
  standardCards: readonly TabooCard[];
  repository: TabooCardRepository;
  generators: TabooGenerators | undefined;
  onSaved: (cards: readonly TabooCard[]) => void;
}

type Notice =
  | { type: "error"; code: TabooGenerationErrorCode | "storage" }
  | { type: "saved"; count: number }
  | { type: "preview"; local: boolean };

export function TabooGeneration({ standardCards, repository, generators, onSaved }: Props) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState<"generate" | "save">();
  const [review, setReview] = useState<ReturnType<typeof reviewGeneratedCards>>();
  const [selected, setSelected] = useState<readonly string[]>([]);
  const [notice, setNotice] = useState<Notice>();
  const active = useRef<AbortController | undefined>(undefined);
  useEffect(() => () => active.current?.abort(), []);

  async function generate(event: MouseEvent<HTMLButtonElement>) {
    const form = event.currentTarget.form;
    if (busy || !generators || !form) return;
    const data = new FormData(form);
    const categories = data
      .getAll("category")
      .filter((value): value is string => typeof value === "string");
    if (categories.length === 0) {
      setNotice({ type: "error", code: "unsupported_request" });
      return;
    }
    const language = data.get("language") === "de" ? "de" : "en";
    const chosenDifficulty = data.get("difficulty");
    const difficulty =
      chosenDifficulty === "medium" || chosenDifficulty === "hard" ? chosenDifficulty : "easy";
    const controller = new AbortController();
    active.current = controller;
    setBusy("generate");
    setReview(undefined);
    setSelected([]);
    setNotice(undefined);
    try {
      const discovered = await generators.discover?.(controller.signal);
      const generator = discovered ?? generators.local;
      const saved = await repository.list();
      const accepted: TabooCard[] = [];
      const rejected: ReturnType<typeof reviewGeneratedCards>["rejected"][number][] = [];
      let offset = 0;
      for (const categoryId of categories) {
        if (controller.signal.aborted) break;
        const request = { language, difficulty, categoryId, count: 2 } as const;
        const result = await generator.generate(request, {
          get aborted() {
            return controller.signal.aborted;
          },
          subscribe(onAbort) {
            controller.signal.addEventListener("abort", onAbort, { once: true });
            return () => controller.signal.removeEventListener("abort", onAbort);
          },
        });
        if (result.status === "failed") {
          setNotice({ type: "error", code: result.code });
          return;
        }
        const preview = reviewGeneratedCards(
          request,
          result.candidates,
          [...standardCards, ...saved, ...accepted],
          () => crypto.randomUUID(),
        );
        accepted.push(...preview.accepted);
        rejected.push(...preview.rejected.map((item) => ({ ...item, index: item.index + offset })));
        offset += result.candidates.length;
      }
      if (controller.signal.aborted) {
        setNotice({ type: "error", code: "cancelled" });
        return;
      }
      setReview({ accepted, rejected });
      setSelected(accepted.map((card) => card.id));
      setNotice({ type: "preview", local: !discovered });
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
    <div className="taboo-generation">
      <Button
        type="button"
        variant="secondary"
        disabled={Boolean(busy) || !generators}
        onClick={(event) => void generate(event)}
      >
        {t("tabooGeneration.generate")}
      </Button>
      {!generators && <p>{t("tabooGeneration.noProvider")}</p>}
      {busy === "generate" && (
        <StatusMessage title={t("tabooGeneration.working")}>
          <Button type="button" variant="secondary" onClick={() => active.current?.abort()}>
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
          {notice?.type === "preview" && notice.local && (
            <p>{t("tabooGeneration.localFallback")}</p>
          )}
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
          <Button type="button" disabled={selected.length === 0} onClick={() => void save()}>
            {t("tabooGeneration.save")}
          </Button>
        </fieldset>
      )}
    </div>
  );
}
