import { nightSteps, type WakeStepId } from "./roles/night";
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
    // Only a role that is alive is called: a drunk who does not know the role yet is called as a cover, the dead
    // are not called (the players find out who is gone by who is no longer woken).
    const hidden = state.alive.some((p) => p.role === role && masked(p.name));
    // A living role is always called with its whole script, also when its ability is used up (the narrator then asks
    // the same questions and skips them): only a drunk who does not know his role yet is a cover call.
    void spent;
    const mode = !enabled ? "skip" : actors.length ? "active" : hidden ? "cover" : "skip";
    calls.push({ id, announcementRole: id, mode, actors: mode === "active" ? actors : [] });
  };
  // The calls of every step of the night; the order of the steps comes from the definitions of the roles.
  const callsOf: Record<WakeStepId, () => void> = {
    cupid: () => {
      add("cupid", "cupid", visible("cupid"), state.night === 1);
      add(
        "lovers",
        "cupid",
        state.lovers?.filter((name) => state.alive.some((p) => p.name === name)) ?? [],
        state.night === 1,
      );
    },
    drunk: () => {
      const drunk =
        state.drunk &&
        !state.drunk.revealed &&
        state.alive.some((p) => p.name === state.drunk!.player)
          ? [state.drunk.player]
          : [];
      calls.push({
        id: "drunkReveal",
        announcementRole: "drunkReveal",
        mode: state.night === 3 && drunk.length ? "active" : "skip",
        actors: state.night === 3 ? drunk : [],
      });
    },
    guard: () => {
      add("bodyguard", "bodyguard", visible("bodyguard"));
      const guests = visible("nightGuest").filter((name) =>
        state.alive.some((p) => p.name !== name && p.name !== state.hostPlayer),
      );
      add("nightGuest", "nightGuest", guests);
    },
    wolves: () => add("wolves", "wolf", visible("wolf")),
    seer: () => {
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
        apprentice.some((p) => masked(p.name) && state.alive.includes(p));
      if (possibleApprentice && calls[calls.length - 1]!.mode === "skip")
        calls[calls.length - 1] = {
          id: "seer",
          announcementRole: "apprenticeSeer",
          mode: "cover",
          actors: [],
        };
    },
    paranormalInvestigator: () =>
      add(
        "investigator",
        "paranormalInvestigator",
        visible("paranormalInvestigator"),
        true,
        state.investigationUsed,
      ),
    witch: () =>
      add("witch", "witch", visible("witch"), true, !state.potions.heal && !state.potions.poison),
    magician: () =>
      add("magician", "magician", visible("magician"), true, state.spellsRemaining === 0),
    mayor: () =>
      add(
        "mayor",
        "mayor",
        visible("mayor"),
        state.night > 1 && state.settings.mayor === "hammer",
        state.hammerUsed,
      ),
    spellcaster: () => add("spellcaster", "spellcaster", visible("spellcaster")),
    amulet: () =>
      calls.push({
        id: "amuletPass",
        announcementRole: "amuletPass",
        mode: state.amulet ? "active" : "skip",
        actors: state.amulet ? [state.amulet.holder] : [],
      }),
  };
  for (const step of nightSteps()) callsOf[step.id]();
  return calls;
}
