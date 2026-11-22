import { useTranslation } from "react-i18next";
import { WerewolfSymbol } from "./symbols/WerewolfSymbol";
import type { WerewolfSession } from "../../business/games/werewolf/session";
import { Button } from "../components";
import { ActionRow, StartBar } from "../game-kit";
import { isDayStep } from "../../business/games/werewolf/narratorGuide";
import { describeRoleStep } from "../../business/games/werewolf/roleStep";
import { GuideBox } from "./GuideBox";
import { NarratorBar } from "./NarratorBar";
import { NarratorCard } from "./NarratorCard";
import { useNarratorGuide } from "./useNarratorGuide";

interface NarratorViewProps {
  readonly session: WerewolfSession;
  /** Saves the game and the checkpoints of the narrator after every change. */
  readonly onSession: (next: WerewolfSession, trail: unknown) => void;
  /** The checkpoints saved with the game: after a reload the narrator finds every step and choice again. */
  readonly trail?: unknown;
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
export function NarratorView({ session, trail, onSession, onEnd, onRules }: NarratorViewProps) {
  const { t } = useTranslation();
  const guide = useNarratorGuide(session, onSession, trail);
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
              // The witch is asked one question at a time: only the ability of the question stands in the box.
              card={
                view.question && view.phase === "act" && !view.card.cover
                  ? {
                      ...view.card,
                      abilities: view.card.abilities.filter(
                        (ability) => ability.id === view.question,
                      ),
                    }
                  : view.card
              }
              pressed={[
                ...(view.selection.ability ? [view.selection.ability] : []),
                ...(view.selection.heal ? (["heal"] as const) : []),
                // A potion or spell whose people were chosen stays marked after its list was closed.
                ...(view.selection.ability === null && view.selection.picks.length > 0
                  ? view.state.status === "magician"
                    ? (["kill"] as const)
                    : view.state.status === "witch"
                      ? (["poison"] as const)
                      : []
                  : []),
              ]}
              next={
                view.phase === "act" &&
                !view.card.cover &&
                view.state.status !== "vision" &&
                view.selection.ability === null &&
                ((view.selection.picks.length === 0 && !view.selection.heal) ||
                  view.question !== null)
              }
              settled={view.phase === "outro"}
              // The spells of the magician chosen in this step (the healing spell and every person to kill).
              spellsUsed={
                view.state.status === "magician"
                  ? // The healing spell counts when it is switched on; the death spells only when their list is closed (confirmed).
                    Number(view.selection.heal) +
                    (view.selection.ability === null ? view.selection.picks.length : 0)
                  : 0
              }
              // Once the narrator has decided (an ability or skip), everything is switched off; "back" opens it again.
              locked={view.phase === "outro"}
              skip={
                (view.phase === "act" || view.phase === "outro") &&
                describeRoleStep(view.state).skippable
                  ? {
                      // The button stays where it is (the controls do not jump); it is only switched off when it
                      // does not apply: after the step was left, or while a choice is made.
                      disabled:
                        view.phase === "outro" ||
                        view.selection.ability !== null ||
                        (view.question === null &&
                          (view.selection.picks.length > 0 || view.selection.heal)),
                      framed: view.phase === "act" && (view.question !== null || view.canContinue),
                      ...(describeRoleStep(view.state).skip.label === "skip"
                        ? {}
                        : {
                            label: t(
                              describeRoleStep(view.state).skip.label === "keep"
                                ? "werewolfNarrator.guide.keep"
                                : "werewolfNarrator.guide.noVote",
                            ),
                          }),
                      onSkip:
                        view.question !== null ? () => guide.answer("skip") : guide.continueGuide,
                    }
                  : undefined
              }
              onAbility={guide.ability}
            />
          ))}
        <GuideBox
          onChoose={guide.choose}
          onCloseAbility={guide.closeAbility}
          onContinue={guide.continueGuide}
          onBallot={guide.ballot}
          onNobody={guide.nobody}
          onReopen={guide.reopen}
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
            data-next={(view.canNext && view.phase !== "act") || undefined}
            disabled={!view.canNext}
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
