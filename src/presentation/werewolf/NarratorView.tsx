import { useTranslation } from "react-i18next";
import { WerewolfSymbol } from "./symbols/WerewolfSymbol";
import type { WerewolfSession } from "../../business/games/werewolf/session";
import { Button } from "../components";
import { ActionRow, StartBar } from "../game-kit";
import { isDayStep } from "../../business/games/werewolf/narratorGuide";
import { GuideBox } from "./GuideBox";
import { NarratorBar } from "./NarratorBar";
import { NarratorCard } from "./NarratorCard";
import { useNarratorGuide } from "./useNarratorGuide";

interface NarratorViewProps {
  readonly session: WerewolfSession;
  readonly onSession: (next: WerewolfSession) => void;
  /** Leaves the game (after the narrator confirmed). */
  readonly onEnd: () => void;
  /** Opens the rules of the game. */
  readonly onRules: () => void;
}

/**
 * The narrator view: the upper box shows who is awake (hidden until the narrator taps the lower box), the lower box
 * leads through the night. At the bottom only "Back" and "Next": back is exactly one step, next only where the
 * step is complete.
 */
export function NarratorView({ session, onSession, onEnd, onRules }: NarratorViewProps) {
  const { t } = useTranslation();
  const guide = useNarratorGuide(session, onSession);
  const { view } = guide;
  return (
    <section
      aria-label={t("werewolfNarrator.view")}
      className="ww-night kit-onepage"
      data-time={isDayStep(view.state) ? "day" : "night"}
    >
      <NarratorBar
        day={isDayStep(view.state)}
        dealing={view.phase === "ready"}
        onClose={onEnd}
        onRules={onRules}
        state={view.state}
      />
      <div
        className="ww-night__stage"
        data-layout={view.card ? (view.phase === "intro" ? "intro" : "act") : "plain"}
      >
        {view.card &&
          (view.phase === "intro" ? (
            <div aria-hidden="true" className="ww-role-card ww-role-card--hidden">
              <WerewolfSymbol id="apprenticeSeer" size={56} />
            </div>
          ) : (
            <NarratorCard
              pressed={[
                ...(view.selection.ability ? [view.selection.ability] : []),
                ...(view.selection.heal ? (["heal"] as const) : []),
              ]}
              settled={view.phase === "outro"}
              card={view.card}
              onAbility={guide.ability}
            />
          ))}
        <GuideBox
          onChoose={guide.choose}
          onCloseAbility={guide.closeAbility}
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
      </div>
      <StartBar>
        <div className="ww-nav">
          <Button disabled={!view.canGoBack} onClick={() => guide.goBack()} variant="secondary">
            {t("werewolfNarrator.guide.back")}
          </Button>
          <Button
            disabled={!view.canContinue}
            onClick={view.nextKind === "finish" ? onEnd : guide.continueGuide}
            variant="success"
          >
            {view.nextKind === "next"
              ? t("werewolfNarrator.guide.next")
              : t(`werewolfNarrator.guide.nextKind.${view.nextKind}`)}
          </Button>
        </div>
      </StartBar>
    </section>
  );
}
