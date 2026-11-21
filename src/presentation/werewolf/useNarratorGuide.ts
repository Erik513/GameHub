import { useCallback, useState } from "react";
import {
  backGuide,
  chooseAbility,
  chooseNobody,
  choosePlayer,
  continueGuide,
  createGuide,
  describeGuide,
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
  onSession: (next: WerewolfSession) => void,
) {
  const [guide, setGuide] = useState(() => createGuide(session));
  const [confirmBack, setConfirmBack] = useState(false);

  const update = useCallback(
    (change: (current: Guide) => Guide) => {
      const next = change(guide);
      if (next === guide) return;
      setGuide(next);
      if (next.session !== guide.session) onSession(next.session);
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
      if (result.guide.session !== guide.session) onSession(result.guide.session);
    },
    [guide, onSession],
  );
  return {
    ability: (id: CardAbilityId) => update((g) => chooseAbility(g, id)),
    cancelBack: () => setConfirmBack(false),
    choose: (name: string) => update((g) => choosePlayer(g, name)),
    confirmBack,
    continueGuide: () => update(continueGuide),
    goBack,
    nobody: () => update(chooseNobody),
    undo: () => update(undoSelection),
    unchoose: (name: string) => update((g) => unchoosePlayer(g, name)),
    view: describeGuide(guide),
  };
}
