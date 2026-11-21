import type { WerewolfState } from "./stateMachine";

export type NightRole =
  | "cupid"
  | "lovers"
  | "drunkReveal"
  | "bodyguard"
  | "nightGuest"
  | "wolves"
  | "seer"
  | "investigator"
  | "witch"
  | "magician"
  | "mayor"
  | "spellcaster"
  | "amuletPass";
export interface NightCall {
  readonly id: NightRole;
  readonly announcementRole: NightRole | "apprenticeSeer";
  readonly mode: "active" | "cover" | "skip";
  readonly actors: readonly string[];
}

/** Private narrator script. Cover calls expose no actor and accept no game decision. */
export function nightScript(state: WerewolfState): readonly NightCall[] {
  const masked = (name: string) => state.drunk?.player === name && !state.drunk.revealed;
  const visible = (role: string) =>
    state.alive.filter((p) => p.role === role && !masked(p.name)).map((p) => p.name);
  const calls: NightCall[] = [];
  const add = (
    id: NightRole,
    role: string,
    actors: readonly string[],
    enabled = true,
    spent = false,
  ) => {
    const present = state.players.filter((p) => p.role === role);
    const hidden =
      present.some((p) => masked(p.name)) || (!state.settings.revealRoles && present.length > 0);
    const mode = !enabled
      ? "skip"
      : actors.length && !spent
        ? "active"
        : actors.length || hidden
          ? "cover"
          : "skip";
    calls.push({ id, announcementRole: id, mode, actors: mode === "active" ? actors : [] });
  };
  add("cupid", "cupid", visible("cupid"), state.night === 1);
  add(
    "lovers",
    "cupid",
    state.lovers?.filter((name) => state.alive.some((p) => p.name === name)) ?? [],
    state.night === 1,
  );
  const drunk =
    state.drunk && !state.drunk.revealed && state.alive.some((p) => p.name === state.drunk!.player)
      ? [state.drunk.player]
      : [];
  const drunkCover = !state.settings.revealRoles && state.drunk !== null;
  calls.push({
    id: "drunkReveal",
    announcementRole: "drunkReveal",
    mode: state.night !== 3 ? "skip" : drunk.length ? "active" : drunkCover ? "cover" : "skip",
    actors: state.night === 3 ? drunk : [],
  });
  add("bodyguard", "bodyguard", visible("bodyguard"));
  const guests = visible("nightGuest").filter((name) =>
    state.alive.some((p) => p.name !== name && p.name !== state.hostPlayer),
  );
  add("nightGuest", "nightGuest", guests);
  add("wolves", "wolf", visible("wolf"));
  const seer = state.alive.some((p) => p.role === "seer")
    ? visible("seer")
    : visible("apprenticeSeer");
  add("seer", "seer", seer);
  calls[calls.length - 1] = {
    ...calls[calls.length - 1]!,
    announcementRole:
      state.alive.some((p) => p.role === "seer") ||
      !state.players.some((p) => p.role === "apprenticeSeer")
        ? "seer"
        : "apprenticeSeer",
  };
  const apprentice = state.players.filter((p) => p.role === "apprenticeSeer");
  const possibleApprentice =
    !state.alive.some((p) => p.role === "seer") &&
    (apprentice.some((p) => masked(p.name)) ||
      (apprentice.length > 0 && !state.settings.revealRoles));
  if (possibleApprentice && calls[calls.length - 1]!.mode === "skip")
    calls[calls.length - 1] = {
      id: "seer",
      announcementRole: "apprenticeSeer",
      mode: "cover",
      actors: [],
    };
  add(
    "investigator",
    "paranormalInvestigator",
    visible("paranormalInvestigator"),
    true,
    state.investigationUsed,
  );
  add("witch", "witch", visible("witch"), true, !state.potions.heal && !state.potions.poison);
  add("magician", "magician", visible("magician"), true, state.spellsRemaining === 0);
  add(
    "mayor",
    "mayor",
    visible("mayor"),
    state.night > 1 && state.settings.mayor === "hammer",
    state.hammerUsed,
  );
  add("spellcaster", "spellcaster", visible("spellcaster"));
  calls.push({
    id: "amuletPass",
    announcementRole: "amuletPass",
    mode: state.amulet ? "active" : "skip",
    actors: state.amulet ? [state.amulet.holder] : [],
  });
  return calls;
}
