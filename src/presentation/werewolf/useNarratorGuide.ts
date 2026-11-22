import { useCallback, useState } from "react";
import {
  backGuide,
  chooseAbility,
  closeAbility,
  chooseNobody,
  choosePlayer,
  continueGuide,
  createGuide,
  describeGuide,
  reopenDecision,
  setBallot,
  undoSelection,
  unchoosePlayer,
  type Guide,
} from "../../business/games/werewolf/narratorGuide";
import type { CardAbilityId } from "../../business/games/werewolf/narratorCard";
import type { WerewolfSession } from "../../business/games/werewolf/session";

/**
 * The guide of the narrator on screen. The steps are the logic of `narratorGuide`; this hook only keeps the guide in
 * the component and hands every new state of the game to `onSession` (which saves it). A step back that needs a
 * confirmation (a morning or an exile) waits in `confirmBack`.
 */
export function useNarratorGuide(
  session: WerewolfSession,
  onSession: (next: WerewolfSession, trail: unknown) => void,
  savedTrail?: unknown,
) {
  const [guide, setGuide] = useState(() => createGuide(session, savedTrail));
  const [confirmBack, setConfirmBack] = useState(false);

  const update = useCallback(
    (change: (current: Guide) => Guide) => {
      const next = change(guide);
      if (next === guide) return;
      setGuide(next);
      // Every change is a checkpoint: the game and the choices of the narrator are saved together.
      onSession(next.session, next.trail);
    },
    [guide, onSession],
  );
  const goBack = useCallback(
    (confirmed = false) => {
      const result = backGuide(guide, confirmed);
      if (!result.ok) {
        setConfirmBack(result.reason === "confirmationRequired");
        return;
      }
      setConfirmBack(false);
      setGuide(result.guide);
      onSession(result.guide.session, result.guide.trail);
    },
    [guide, onSession],
  );
  return {
    ability: (id: CardAbilityId) => update((g) => chooseAbility(g, id)),
    cancelBack: () => setConfirmBack(false),
    closeAbility: () => update(closeAbility),
    choose: (name: string) => update((g) => choosePlayer(g, name)),
    confirmBack,
    continueGuide: () => {
      setConfirmBack(false);
      update(continueGuide);
    },
    goBack,
    ballot: (voter: string, candidate: string) => update((g) => setBallot(g, voter, candidate)),
    nobody: () => update(chooseNobody),
    reopen: () => update(reopenDecision),
    undo: () => update(undoSelection),
    unchoose: (name: string) => update((g) => unchoosePlayer(g, name)),
    view: describeGuide(guide),
  };
}
