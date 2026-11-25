import type { DeathCause } from "./eventLog";
import { roleVariantOf, type RoleVariantId } from "./roleVariant";
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

/**
 * The state of a person as the overview shows it, strongest first: dead, wounded (the tough guy who will die), attacked
 * (marked to die until he dies), saved (the attack was stopped, only during that night), werewolf, alive.
 */
export type PlayerTone = "dead" | "wounded" | "attacked" | "saved" | "wolf" | "alive";

/** The steps that belong to the day (or to the deal): an attack of the night that was stopped is not shown any more. */
const notNight: readonly WerewolfState["status"][] = [
  "roles",
  "morning",
  "day",
  "vote",
  "exile",
  "hunter",
  "drunkHunter",
  "finished",
];

/** The people who are marked to die at the next morning: the victim of the wolves, of the witch, of the magician and the hammer. */
function markedToDie(state: WerewolfState): ReadonlySet<string> {
  const names = new Set<string>();
  if ("victim" in state && state.victim) names.add(state.victim.name);
  if ("poisoned" in state && state.poisoned) names.add(state.poisoned.name);
  for (const player of state.spellVictims) names.add(player.name);
  if (state.hammerVictim) names.add(state.hammerVictim);
  return names;
}

/** One person as the overview shows him (see `describePlayers`). */
export type PlayerView = ReturnType<typeof describePlayers>[number];

/** The frames of a row: the amulet (gold) and the drunk who does not know his role yet. */
export type PlayerFrame = "amulet" | "drunk";

/** The variants of the roles the given people have, each once (for the legend of the overview). */
export function variantsOf(players: readonly PlayerView[]): RoleVariantId[] {
  return [...new Set(players.flatMap((player) => (player.variant ? [player.variant] : [])))];
}

/** The ways people became victims that the given people show, each once (for the legend of the overview). */
export function causesOf(players: readonly PlayerView[]): DeathCause[] {
  return [...new Set(players.flatMap((player) => player.causes))];
}

/** Private, unlocalized facts. The colors and frames are decided by the presentation (see GAMEHUB_WERWOLF_UI.md). */
export function describePlayers(state: WerewolfState, announce = true) {
  const variantOf = (role: string) => roleVariantOf(role, state.settings);
  // Whoever is announced as dead in the morning or when leaving the village is shown as dead at once, in the view of the
  // announcement already (the game itself removes them from the living only when the announcement is confirmed).
  // (Not for the preview of a decision: the night is not over yet, the victims are only marked, not announced.)
  const announced = new Set(
    announce && (state.status === "morning" || state.status === "exile")
      ? werewolfAnnouncement(state).map((entry) => entry.name)
      : [],
  );
  // Why the announced people die (the lovers who die of heartbreak, too): from the announcement as the game will record it.
  const announcedCauses = new Map<string, DeathCause[]>();
  // The tanner who reached his goal and the wound of the tough guy who survives the attack: already with the
  // announcement (the game records both when it is confirmed), also when nobody dies.
  let tannerWinner = state.tannerWinner;
  let toughGuyDiesOn = state.toughGuyDiesOn;
  let toughGuyWound = state.toughGuyWound;
  if (announce && (state.status === "morning" || state.status === "exile")) {
    const next = transitionWerewolf(state, {
      night: state.night,
      type: state.status === "exile" ? "announceExile" : "announceMorning",
    });
    tannerWinner = next.tannerWinner;
    toughGuyDiesOn = next.toughGuyDiesOn;
    toughGuyWound = next.toughGuyWound;
    for (const entry of next.history.slice(state.history.length))
      if (entry.kind === "death")
        announcedCauses.set(entry.player, [
          ...new Set(entry.sources.map((source) => source.cause)),
        ]);
  }
  const marked = markedToDie(state);
  // How a person who is marked (not dead yet) or announced came to be a victim: the ability that hit him.
  const causesNow = (name: string): DeathCause[] => {
    const causes: DeathCause[] = [];
    if ("victim" in state && state.victim?.name === name)
      causes.push(state.status === "exile" ? "vote" : "wolves");
    if ("poisoned" in state && state.poisoned?.name === name) causes.push("witchPoison");
    if (state.spellVictims.some((victim) => victim.name === name)) causes.push("magicianKill");
    if (state.hammerVictim === name) causes.push("hammer");
    return causes;
  };
  // Whether somebody carries a mark of the seer or of the investigator who is still in the game.
  const carriesMark = (name: string, kind: "investigator" | "seer") =>
    state.inspections.some(
      (entry) =>
        entry.kind === kind &&
        entry.target === name &&
        state.alive.some((person) => person.name === entry.by),
    );
  const night = !notNight.includes(state.status) || (!announce && state.status === "morning");
  return state.players.map((player, seat) => {
    const death = [...state.history]
      .reverse()
      .find((e) => e.kind === "death" && e.player === player.name);
    const isDrunk = state.drunk?.player === player.name && !state.drunk.revealed;
    const alive = state.alive.some((p) => p.name === player.name) && !announced.has(player.name);
    const lastShot =
      ((state.status === "hunter" || state.status === "drunkHunter") &&
        state.hunter.name === player.name) ||
      (announced.has(player.name) && player.role === "hunter");
    const delayedDeathNight = alive && player.role === "toughGuy" ? toughGuyDiesOn : null;
    // Why he is out or marked: the causes of his death in the history, or the ability that hit him now (the wound of the
    // tough guy who will die names the ability, too).
    const causes: DeathCause[] =
      death?.kind === "death"
        ? [...new Set(death.sources.map((source) => source.cause))]
        : (announcedCauses.get(player.name) ?? [
            ...causesNow(player.name),
            ...(delayedDeathNight !== null && toughGuyWound ? [toughGuyWound.cause] : []),
          ]);
    const attacked = alive && marked.has(player.name);
    // The wolves attacked him tonight and he is not marked any more: healed, protected or kept by the amulet.
    const saved =
      alive && night && state.wolfTarget?.name === player.name && !marked.has(player.name);
    const tone: PlayerTone =
      !alive && !lastShot
        ? "dead"
        : delayedDeathNight !== null
          ? "wounded"
          : attacked || lastShot
            ? "attacked"
            : saved
              ? "saved"
              : player.role === "wolf"
                ? "wolf"
                : "alive";
    return {
      tone,
      causes,
      name: player.name,
      seat,
      role: player.role,
      visibleRole: isDrunk ? ("drunk" as const) : player.role,
      variant: variantOf(player.role),
      alive,
      // The hunter who has died but has not decided about his last shot yet: out of the game, but not finished.
      lastShot,
      death: death?.kind === "death" ? death : null,
      // The frames stay with a person who is out, too: the amulet he carried when he died, the drunk who died without
      // knowing his role.
      amulet:
        state.amulet?.holder === player.name ||
        (death?.kind === "death" && death.diedWithAmulet === true),
      drunk: isDrunk || (death?.kind === "death" && death.diedMasked),
      partner: state.lovers?.includes(player.name)
        ? (state.lovers.find((n) => n !== player.name) ?? null)
        : null,
      // Silenced for the day after the choice; when the next night begins the silence is over.
      silenced:
        alive && state.silencedPlayer === player.name && state.silencedNight === state.night,
      // The seer looked at him / the investigator examined him: the mark stays until the one who did it leaves the game.
      inspected: alive && carriesMark(player.name, "seer"),
      investigated: alive && carriesMark(player.name, "investigator"),
      // The mayor of a game with the double vote: his vote counts twice.
      twoVotes:
        alive && player.role === "mayor" && state.settings.mayor === "doubleVote" && !isDrunk,
      // The witch (or the magician) healed him: the mark stays through the day and goes when the next night starts.
      healed: alive && state.healedPlayer === player.name,
      // The magician saved him with the healing spell.
      spellHealed: alive && state.spellHealedPlayer === player.name,
      lastProtectionTarget: state.protectedPlayer === player.name,
      lastHostTarget: state.hostPlayer === player.name,
      delayedDeathNight,
      // The tanner who has won (he keeps his role secret until the end of the game).
      wonAsTanner: tannerWinner === player.name,
      wound: player.role === "toughGuy" ? toughGuyWound : null,
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
