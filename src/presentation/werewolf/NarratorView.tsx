import { useTranslation } from "react-i18next";
import { WerewolfSymbol } from "./symbols/WerewolfSymbol";
import type { WerewolfSession } from "../../business/games/werewolf/session";
import { Button } from "../components";
import { StartBar } from "../game-kit";
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
  // The witch is asked only when the script has got there: first the victim is shown (the check of her first box).
  const witchWaiting =
    view.phase === "act" && view.question === "heal" && view.progress < 1 && !view.card?.cover;
  // The day: once "no vote" is chosen the day can end (and the options are used).
  const dayDecided = view.state.status === "day" && view.progress >= 1;
  const nextFree = view.canNext && view.state.status !== "vote";
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
              card={view.card}
              pressed={[
                ...(view.selection.ability ? [view.selection.ability] : []),
                ...(view.selection.heal ? (["heal"] as const) : []),
                // A potion or spell whose people were chosen stays marked after its list was closed.
                ...(view.selection.ability === null && view.selection.picks.length > 0
                  ? view.state.status === "magician"
                    ? (["kill"] as const)
                    : []
                  : []),
              ]}
              next={
                view.phase === "act" &&
                !view.card.cover &&
                view.state.status !== "vision" &&
                view.selection.ability === null &&
                view.selection.picks.length === 0 &&
                !view.selection.heal &&
                // The day: nothing to frame once "no vote" is chosen (the next button is the next step).
                !dayDecided
              }
              // The witch is asked one question at a time: all options stay in the box, only the ones of the question
              // are framed and can be used.
              asked={
                view.question === null || view.phase !== "act"
                  ? null
                  : view.state.status === "magician"
                    ? // First question: the healing spell or a death spell; second question: a death spell.
                      view.question === "heal"
                      ? ["heal", "kill"]
                      : ["kill"]
                    : [view.question]
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
              // Cupid: once the lovers are chosen (confirmed) the ability is done; "undo" frees it again.
              // The day while nobody is nominated: the heading of the box is what the village does.
              {...(view.state.status === "vote"
                ? {
                    votes: {
                      counts: view.voteCounts,
                      names: view.state.candidates,
                      onCount: guide.count,
                      ...(view.state.candidates.length === 1
                        ? { yesLabel: t("werewolfNarrator.guide.vote.yesLabel") }
                        : {}),
                      sum: view.voteSum,
                      total: view.voteTotal,
                    },
                  }
                : {})}
              {...(view.state.status === "day"
                ? { heading: t("werewolfNarrator.guide.day.discuss") }
                : {})}
              locked={
                view.phase === "outro" ||
                (view.state.status === "cupid" && view.progress >= 1) ||
                // The day: "no vote" is chosen, the vote cannot be used until the reset takes it back.
                dayDecided
              }
              // The witch: the abilities wait until the narrator has shown the victim (the check of the first box).
              waiting={witchWaiting}
              skip={
                (view.phase === "act" || view.phase === "outro") &&
                describeRoleStep(view.state).skippable
                  ? {
                      // The button stays where it is (the controls do not jump); it is only switched off when it
                      // does not apply: after the step was left, or while a choice is made.
                      disabled:
                        witchWaiting ||
                        dayDecided ||
                        view.phase === "outro" ||
                        view.selection.ability !== null ||
                        (view.question === null &&
                          (view.selection.picks.length > 0 || view.selection.heal)),
                      framed:
                        view.state.status === "day"
                          ? // "No vote" is an option to choose: framed until it is chosen (or a list is open).
                            view.phase === "act" && !dayDecided && view.selection.ability === null
                          : !witchWaiting &&
                            view.phase === "act" &&
                            (view.question !== null
                              ? view.selection.ability === null
                              : view.canContinue),
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
                        view.question !== null
                          ? () => guide.answer("skip")
                          : view.state.status === "day"
                            ? guide.noVote
                            : guide.continueGuide,
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
          onCheck={guide.check}
          onReopen={guide.reopen}
          onUndoQuestion={guide.undoQuestion}
          onUndo={guide.undo}
          onUnchoose={guide.unchoose}
          view={view}
        />
      </div>
      <StartBar>
        <div className="ww-nav">
          <Button disabled={!view.canGoBack} onClick={guide.goBack} variant="secondary">
            {t("werewolfNarrator.guide.back")}
          </Button>
          <Button
            // The vote is confirmed with the check mark (like every list of people): the button "next" waits.
            data-next={(nextFree && (view.phase !== "act" || dayDecided)) || undefined}
            disabled={!nextFree}
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
