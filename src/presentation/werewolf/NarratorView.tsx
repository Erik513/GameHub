import type { TFunction } from "i18next";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { WerewolfSymbol } from "./symbols/WerewolfSymbol";
import type { WerewolfSession } from "../../business/games/werewolf/session";
import { Button } from "../components";
import { StartBar } from "../game-kit";
import { isDayStep, type GuideView } from "../../business/games/werewolf/narratorGuide";
import { describeRoleStep } from "../../business/games/werewolf/roleStep";
import { werewolfDrunkReveal } from "../../business/games/werewolf/stateMachine";
import { GuideBox } from "./GuideBox";
import { NarratorBar } from "./NarratorBar";
import { NarratorCard, type VoteProps } from "./NarratorCard";
import { variantOfRole } from "./roleAbilities";
import { TrueRoleWindow } from "./TrueRoleWindow";
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
/** What the box next to the check says while the votes are entered: who has the majority, a tie, or the result about one person. */
function voteLeaderText(view: GuideView, t: TFunction): string {
  const { state } = view;
  if (state.status !== "vote") return "";
  const second = view.voteBonus?.chosen ?? null;
  const votesOf = (name: string) => (view.voteCounts[name] ?? 0) + (second === name ? 1 : 0);
  if (state.candidates.length === 1) {
    const name = state.candidates[0]!;
    // As many yes as no votes: the vote is held once more; a second tie leaves him in the game.
    if (votesOf(name) === view.voteTieAt)
      return t(
        state.round === 2
          ? "werewolfNarrator.guide.vote.tieSingleAgain"
          : "werewolfNarrator.guide.vote.tieSingle",
        { name },
      );
    return t(
      votesOf(name) >= view.voteNeeded
        ? "werewolfNarrator.guide.vote.leaves"
        : "werewolfNarrator.guide.vote.stays",
      { name },
    );
  }
  const most = Math.max(...state.candidates.map(votesOf));
  if (most === 0) return t("werewolfNarrator.guide.vote.noVotes");
  const leaders = state.candidates.filter((name) => votesOf(name) === most);
  if (leaders.length === 1) return t("werewolfNarrator.guide.vote.leader", { name: leaders[0] });
  return t(
    state.round === 2 ? "werewolfNarrator.guide.vote.tieAgain" : "werewolfNarrator.guide.vote.tie",
    { names: leaders.join(", ") },
  );
}

/** The heading of the upper box at the day: it says what the narrator is doing now (and changes with the step). */
function dayHeading(view: GuideView, t: TFunction): string {
  if (view.selection.ability !== null) return t("werewolfNarrator.guide.day.headingNominate");
  if (view.sleeping || view.progress >= 1) return t("werewolfNarrator.guide.day.headingEnd");
  if (view.votedToday) return t("werewolfNarrator.guide.day.headingVoted");
  return t("werewolfNarrator.guide.day.headingStart");
}

/** The vote ends in a tie that is held once more (the first time): the check turns into the sign for "vote again". */
function voteTies(view: GuideView): boolean {
  const { state } = view;
  if (state.status !== "vote" || state.round !== 1 || !view.canContinue) return false;
  const second = view.voteBonus?.chosen ?? null;
  const votesOf = (name: string) => (view.voteCounts[name] ?? 0) + (second === name ? 1 : 0);
  if (state.candidates.length === 1) return votesOf(state.candidates[0]!) === view.voteTieAt;
  const most = Math.max(...state.candidates.map(votesOf));
  return most > 0 && state.candidates.filter((name) => votesOf(name) === most).length > 1;
}

/** One nominated person: what a number of yes votes means, as the rows of a small table (stays, tie, leaves). */
function voteLegend(view: GuideView, t: TFunction): VoteProps["legend"] {
  if (view.state.status !== "vote" || view.state.candidates.length !== 1) return undefined;
  const most = view.voteTotal;
  const needed = view.voteNeeded;
  const tie = view.voteTieAt;
  const range = (from: number, to: number) =>
    from === to
      ? String(from)
      : from === 0
        ? t("werewolfNarrator.guide.vote.legend.upTo", { count: to })
        : to === most
          ? t("werewolfNarrator.guide.vote.legend.from", { count: from })
          : from + "–" + to;
  const stays = tie === null ? needed - 1 : tie - 1;
  const rows: { range: string; result: string; kind: "leaves" | "stays" | "tie" }[] = [];
  if (stays >= 0)
    rows.push({
      kind: "stays",
      range: range(0, stays),
      result: t("werewolfNarrator.guide.vote.legend.stays"),
    });
  if (tie !== null)
    rows.push({
      kind: "tie",
      range: String(tie),
      result: t("werewolfNarrator.guide.vote.legend.tie"),
    });
  if (needed <= most)
    rows.push({
      kind: "leaves",
      range: range(needed, most),
      result: t("werewolfNarrator.guide.vote.legend.leaves"),
    });
  return {
    heading: [
      t("werewolfNarrator.guide.vote.legend.yes"),
      t("werewolfNarrator.guide.vote.legend.result"),
    ],
    rows,
  };
}

export function NarratorView({ session, trail, onSession, onEnd, onRules }: NarratorViewProps) {
  const { t } = useTranslation();
  const guide = useNarratorGuide(session, onSession, trail);
  const { view } = guide;
  // The drunk: the window with the card of his true role (the narrator shows it to him).
  const [revealOpen, setRevealOpen] = useState(false);
  const drunk = view.state.status === "drunkReveal" ? werewolfDrunkReveal(view.state) : null;
  // The witch is asked only when the script has got there: first the victim is shown (the check of her first box).
  const witchWaiting =
    view.phase === "act" && view.question === "heal" && view.progress < 1 && !view.card?.cover;
  // The day: once "no vote" is chosen the day can end (and the options are used).
  const dayDecided = view.state.status === "day" && (view.progress >= 1 || view.votedToday);
  // The button ends the day: it stays off during the nomination (a list is open) and the vote.
  const nextFree =
    view.canNext &&
    view.state.status !== "vote" &&
    !(view.state.status === "day" && view.selection.ability !== null);
  // The yellow notes of the vote (also shown at the result): what the narrator has to keep in mind.
  // The notes that are always there come first (they never move); what only matters at the vote (the village idiot, the
  // mayor) is added below them.
  const voteHints: string[] = [
    ...(view.notes.silenced
      ? [t("werewolfNarrator.guide.silenced", { name: view.notes.silenced })]
      : []),
    ...(view.notes.wounded.length > 0
      ? [t("werewolfNarrator.guide.wounded", { names: view.notes.wounded.join(", ") })]
      : []),
    ...Object.entries(view.voterNotes).map(([name, note]) =>
      t(`werewolfNarrator.guide.vote.hint.${note}`, { name }),
    ),
  ];
  // The vote: the upper box shows the votes, the lower box is where they are entered.
  const votes: VoteProps | undefined =
    view.state.status === "vote"
      ? {
          canConfirm: view.canContinue,
          leader: voteLeaderText(view, t),
          tie: voteTies(view),
          ...(voteLegend(view, t) ? { legend: voteLegend(view, t)! } : {}),
          max: view.voteMax,
          complete:
            view.voteNeeded > 0 ? view.voteSum >= view.voteNeeded : view.voteSum === view.voteTotal,
          counts: view.voteCounts,
          summary:
            view.voteNeeded > 0
              ? t("werewolfNarrator.guide.vote.yes", {
                  needed: view.voteNeeded,
                  sum: view.voteSum,
                })
              : t("werewolfNarrator.guide.vote.sum", {
                  sum: view.voteSum,
                  total: view.voteTotal,
                }),
          ...(view.voteBonus
            ? {
                bonus: {
                  chosen: view.voteBonus.chosen,
                  choices: view.voteBonus.choices,
                  label: t("werewolfNarrator.guide.vote.bonus", {
                    name: view.voteBonus.mayor,
                  }),
                  mayor: view.voteBonus.mayor,
                  noLabel: t("werewolfNarrator.guide.vote.no"),
                  prefix: t("werewolfNarrator.guide.vote.bonusPrefix"),
                  onChoose: guide.bonus,
                  yesLabel: t("werewolfNarrator.guide.vote.yesLabel"),
                  yesNo: view.state.candidates.length === 1,
                },
              }
            : {}),
          heading: t("werewolfNarrator.guide.vote.heading"),
          hints: voteHints,
          onCancel: guide.goBack,
          onConfirm: guide.continueGuide,
          names: view.state.candidates,
          onCount: guide.count,
          ...(view.state.candidates.length === 1
            ? { yesLabel: t("werewolfNarrator.guide.vote.yesLabel") }
            : {}),
          sum: view.voteSum,
          total: view.voteTotal,
        }
      : undefined;
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
              {...(votes ? { votes } : {})}
              {...(drunk
                ? {
                    reveal: {
                      checkEnabled: view.phase === "act" && view.progress >= 1,
                      checkLabel: t("werewolfNarrator.guide.taskDone"),
                      label: t("werewolfNarrator.guide.trueRole.show"),
                      onCheck: guide.continueGuide,
                      onOpen: () => setRevealOpen(true),
                      settled: view.phase === "outro",
                    },
                  }
                : {})}
              {...(view.state.status === "day"
                ? { heading: dayHeading(view, t), notes: voteHints }
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
          votes={votes}
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
      {revealOpen && drunk && (
        <TrueRoleWindow
          amulet={view.state.amulet?.holder === drunk.name}
          mayor={view.state.settings.mayor}
          name={drunk.name}
          onClose={() => {
            guide.roleShown();
            setRevealOpen(false);
          }}
          role={drunk.role}
          variant={variantOfRole(drunk.role, view.state.settings)}
        />
      )}
      <StartBar>
        <div className="ww-nav">
          <Button disabled={!view.canGoBack} onClick={guide.goBack} variant="secondary">
            {t("werewolfNarrator.guide.back")}
          </Button>
          <Button
            // The vote is confirmed with the check mark (like every list of people): the button "next" waits.
            data-next={(nextFree && (view.phase !== "act" || view.sleeping)) || undefined}
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
