import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { WerewolfSession } from "../../business/games/werewolf/session";
import { Button } from "../components";
import { ActionRow, StartBar } from "../game-kit";
import { GuideBox } from "./GuideBox";
import { NarratorCard } from "./NarratorCard";
import { useNarratorGuide } from "./useNarratorGuide";

interface NarratorViewProps {
  readonly session: WerewolfSession;
  readonly onSession: (next: WerewolfSession) => void;
  /** Leaves the game (after the narrator confirmed). */
  readonly onEnd: () => void;
}

/**
 * The narrator view: the upper box shows who is awake (hidden until the narrator taps the lower box), the lower box
 * leads through the night. At the bottom only "Back" and "Next": back is exactly one step, next only where the
 * step is complete.
 */
export function NarratorView({ session, onSession, onEnd }: NarratorViewProps) {
  const { t } = useTranslation();
  const guide = useNarratorGuide(session, onSession);
  const { view } = guide;
  const [confirmEnd, setConfirmEnd] = useState(false);
  return (
    <section aria-label={t("werewolfNarrator.view")} className="ww-night kit-onepage">
      <div className="ww-night__stage">
        {view.card &&
          (view.phase === "intro" ? (
            <div aria-hidden="true" className="ww-role-card ww-role-card--hidden" />
          ) : (
            <NarratorCard
              active={view.selection.ability}
              card={view.card}
              onAbility={guide.ability}
            />
          ))}
        <GuideBox
          onChoose={guide.choose}
          onContinue={guide.continueGuide}
          onNobody={guide.nobody}
          onUndo={guide.undo}
          onUnchoose={guide.unchoose}
          view={view}
        />
        {guide.confirmBack && (
          <div className="ww-guide ww-guide--confirm" role="alertdialog">
            <strong>{t("werewolfNarrator.guide.confirmBack")}</strong>
            <ActionRow>
              <Button onClick={() => guide.goBack(true)} variant="danger">
                {t("werewolfNarrator.guide.confirmYes")}
              </Button>
              <Button onClick={guide.cancelBack} variant="secondary">
                {t("werewolfNarrator.guide.confirmNo")}
              </Button>
            </ActionRow>
          </div>
        )}
        {confirmEnd ? (
          <div className="ww-guide ww-guide--confirm" role="alertdialog">
            <strong>{t("werewolfNarrator.guide.confirmEnd")}</strong>
            <ActionRow>
              <Button onClick={onEnd} variant="danger">
                {t("werewolfNarrator.guide.confirmEndYes")}
              </Button>
              <Button onClick={() => setConfirmEnd(false)} variant="secondary">
                {t("werewolfNarrator.guide.confirmNo")}
              </Button>
            </ActionRow>
          </div>
        ) : (
          <Button className="ww-night__end" onClick={() => setConfirmEnd(true)} variant="quiet">
            {t("werewolfNarrator.guide.end")}
          </Button>
        )}
      </div>
      <StartBar>
        <div className="ww-nav">
          <Button disabled={!view.canGoBack} onClick={() => guide.goBack()} variant="secondary">
            {t("werewolfNarrator.guide.back")}
          </Button>
          <Button disabled={!view.canContinue} onClick={guide.continueGuide} variant="success">
            {t("werewolfNarrator.guide.next")}
          </Button>
        </div>
      </StartBar>
    </section>
  );
}
