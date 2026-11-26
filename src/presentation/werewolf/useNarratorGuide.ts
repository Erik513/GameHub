import { useCallback, useState } from "react";
import {
  answerQuestion,
  backGuide,
  checkScript,
  chooseNoVote,
  chooseAbility,
  closeAbility,
  chooseNobody,
  choosePlayer,
  continueGuide,
  createGuide,
  describeGuide,
  reopenDecision,
  markRoleShown,
  setVoteBonus,
  setVoteCount,
  undoQuestion,
  undoSelection,
  unchoosePlayer,
  type Guide,
} from "../../business/games/werewolf/narratorGuide";
import type { CardAbilityId } from "../../business/games/werewolf/narratorCard";
import type { WerewolfSession } from "../../business/games/werewolf/session";
import { backToDecision, settleGuide } from "./experiencedFlow";

/**
 * The guide of the narrator on screen. The steps are the logic of `narratorGuide`; this hook only keeps the guide in
 * the component and hands every new state of the game to `onSession` (which saves it). Back never asks: the narrator
 * taps "Back" on purpose. For an experienced narrator the tasks without a decision are done by themselves (see
 * `experiencedFlow`), and "Back" goes back to the decision before.
 */
export function useNarratorGuide(
  session: WerewolfSession,
  onSession: (next: WerewolfSession, trail: unknown) => void,
  savedTrail?: unknown,
  experienced = false,
) {
  const settle = useCallback(
    (next: Guide) => (experienced ? settleGuide(next) : next),
    [experienced],
  );
  const [guide, setGuide] = useState(() => settle(createGuide(session, savedTrail)));

  const update = useCallback(
    (change: (current: Guide) => Guide) => {
      const changed = change(guide);
      if (changed === guide) return;
      const next = settle(changed);
      setGuide(next);
      // Every change is a checkpoint: the game and the choices of the narrator are saved together.
      onSession(next.session, next.trail);
    },
    [guide, onSession, settle],
  );
  const goBack = useCallback(() => {
    if (experienced) {
      const back = backToDecision(guide);
      if (!back) return;
      setGuide(back);
      onSession(back.session, back.trail);
      return;
    }
    // Also a morning or an exile is taken back without a question.
    const result = backGuide(guide, true);
    if (!result.ok) return;
    setGuide(result.guide);
    onSession(result.guide.session, result.guide.trail);
  }, [experienced, guide, onSession]);
  return {
    ability: (id: CardAbilityId) => update((g) => chooseAbility(g, id)),
    closeAbility: () => update(closeAbility),
    choose: (name: string) => update((g) => choosePlayer(g, name)),
    continueGuide: () => {
      update(continueGuide);
    },
    goBack,
    answer: (answer: "skip" | "use") => update((g) => answerQuestion(g, answer)),
    undoQuestion: (question: "heal" | "poison") => update((g) => undoQuestion(g, question)),
    check: () => update(checkScript),
    roleShown: () => update(markRoleShown),
    noVote: () => update(chooseNoVote),
    bonus: (candidate: string | null) => update((g) => setVoteBonus(g, candidate)),
    count: (name: string, count: number) => update((g) => setVoteCount(g, name, count)),
    nobody: () => update(chooseNobody),
    reopen: () => update(reopenDecision),
    undo: () => update(undoSelection),
    unchoose: (name: string) => update((g) => unchoosePlayer(g, name)),
    view: describeGuide(guide),
  };
}
