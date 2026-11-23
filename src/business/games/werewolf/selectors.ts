import {
  transitionWerewolf,
  werewolfAnnouncement,
  type WerewolfEvent,
  type WerewolfState,
} from "./stateMachine";

export type WerewolfTargetAction =
  | "attack"
  | "protect"
  | "stayWith"
  | "hammer"
  | "inspect"
  | "investigate"
  | "poison"
  | "kill"
  | "silence"
  | "shot"
  | "passAmulet"
  | "bond"
  | "nominate";
export interface TargetSelection {
  readonly selected?: readonly string[];
  readonly heal?: boolean;
}
const phaseAction: Partial<Record<WerewolfState["status"], WerewolfTargetAction>> = {
  wolves: "attack",
  bodyguard: "protect",
  nightGuest: "stayWith",
  mayor: "hammer",
  seer: "inspect",
  investigator: "investigate",
  witch: "poison",
  magician: "kill",
  spellcaster: "silence",
  hunter: "shot",
  amuletPass: "passAmulet",
  cupid: "bond",
  day: "nominate",
};

/** Uses the reducer as the single authority; probes never mutate state or consume randomness. */
export function validTargets(
  state: WerewolfState,
  action = phaseAction[state.status],
  selection: TargetSelection = {},
): readonly string[] {
  if (!action || phaseAction[state.status] !== action) return [];
  return state.alive
    .filter((player) => {
      const target = player.name;
      const night = state.night;
      let event: WerewolfEvent;
      if (action === "poison")
        event = { type: "potions", night, heal: selection.heal ?? false, poison: target };
      else if (action === "kill") {
        if (selection.selected?.includes(target)) return false;
        event = {
          type: "castSpells",
          night,
          heal: selection.heal ?? false,
          kill: [...(selection.selected ?? []), target],
        };
      } else if (action === "bond") {
        const partner = selection.selected?.[0] ?? state.alive.find((p) => p.name !== target)?.name;
        if (!partner) return false;
        event = { type: "bond", night, players: [partner, target] };
      } else if (action === "nominate") {
        event = { type: "nominate", night, nominees: [...(selection.selected ?? []), target] };
      } else event = { type: action, night, target };
      return transitionWerewolf(state, event) !== state;
    })
    .map((p) => p.name);
}

/** Private, unlocalized facts. Color/slot priorities belong to the agreed presentation design. */
export function describePlayers(state: WerewolfState) {
  // Whoever is announced as dead in the morning or when leaving the village is shown as dead at once, in the view of the
  // announcement already (the game itself removes them from the living only when the announcement is confirmed).
  const announced = new Set(
    state.status === "morning" || state.status === "exile"
      ? werewolfAnnouncement(state).map((entry) => entry.name)
      : [],
  );
  return state.players.map((player, seat) => {
    const death = [...state.history]
      .reverse()
      .find((e) => e.kind === "death" && e.player === player.name);
    const isDrunk = state.drunk?.player === player.name && !state.drunk.revealed;
    const alive = state.alive.some((p) => p.name === player.name) && !announced.has(player.name);
    return {
      name: player.name,
      seat,
      role: player.role,
      visibleRole: isDrunk ? ("drunk" as const) : player.role,
      alive,
      // The hunter who has died but has not decided about his last shot yet: out of the game, but not finished.
      lastShot:
        ((state.status === "hunter" || state.status === "drunkHunter") &&
          state.hunter.name === player.name) ||
        (announced.has(player.name) && player.role === "hunter"),
      death: death?.kind === "death" ? death : null,
      amulet: state.amulet?.holder === player.name,
      drunk: isDrunk || (death?.kind === "death" && death.diedMasked),
      partner: state.lovers?.includes(player.name)
        ? (state.lovers.find((n) => n !== player.name) ?? null)
        : null,
      silenced: alive && state.silencedPlayer === player.name,
      lastProtectionTarget: state.protectedPlayer === player.name,
      lastHostTarget: state.hostPlayer === player.name,
      delayedDeathNight: alive && player.role === "toughGuy" ? state.toughGuyDiesOn : null,
      wound: player.role === "toughGuy" ? state.toughGuyWound : null,
      resources:
        player.role === "witch"
          ? { ...state.potions }
          : player.role === "magician"
            ? { spells: state.spellsRemaining }
            : player.role === "mayor"
              ? { hammer: state.settings.mayor === "hammer" && !state.hammerUsed }
              : player.role === "paranormalInvestigator"
                ? { investigation: !state.investigationUsed }
                : {},
    };
  });
}

/**
 * The people who vote now, with what the narrator needs for each: who can be voted for (never himself), the weight of
 * the vote (the mayor with the double vote counts twice) and whether the narrator sets the vote himself (the village
 * idiot does not decide, as in the original). A person who cannot vote for anybody else has no choices and no ballot.
 */
export function votingPlayers(state: WerewolfState) {
  if (state.status !== "vote") return [];
  const { candidates } = state;
  return state.alive
    .filter((p) => p.name !== state.silencedPlayer)
    .map((p) => {
      const masked = state.drunk?.player === p.name && !state.drunk.revealed;
      return {
        name: p.name,
        choices: candidates.filter((name) => name !== p.name),
        setByNarrator: p.role === "idiot" && !masked,
        weight: p.role === "mayor" && !masked && state.settings.mayor === "doubleVote" ? 2 : 1,
      };
    });
}
