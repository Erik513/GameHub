import { expect, it } from "vitest";
import {
  createWerewolf,
  transitionWerewolf,
  type WerewolfEvent,
  type WerewolfSettings,
  type WerewolfSpecialRole,
  type WerewolfState,
} from "./stateMachine";
import { automaticWerewolfSettings } from "./automaticSetup";
import { createFixedWerewolf } from "./fixedSetup";
import { nightScript } from "./nightScript";
import { validTargets, describePlayers } from "./selectors";

const act = (s: WerewolfState, ...events: WerewolfEvent[]) => events.reduce(transitionWerewolf, s);
const names = Array.from({ length: 18 }, (_, i) => "P" + i);
function setup(roles: readonly WerewolfSpecialRole[], settings: Partial<WerewolfSettings> = {}) {
  const s = createWerewolf(names.join(","), "Narrator", () => 0.99, roles, {
    wolfCount: 4,
    attackOnFirstNight: true,
    ...settings,
  })!;
  return act(s, ...s.players.map((p) => ({ type: "roleSeen", player: p.name }) as const));
}
const who = (s: WerewolfState, role: string) => s.players.find((p) => p.role === role)!.name;
const vision = (s: WerewolfState) =>
  act(
    s,
    { type: "inspect", night: s.night, target: who(s, "wolf") },
    { type: "closeVision", night: s.night },
  );
const attack = (s: WerewolfState, target: string | null) =>
  vision(act(s, { type: "attack", night: s.night, target }));
function passRoles(s: WerewolfState): WerewolfState {
  const night = s.night;
  if (s.status === "witch")
    return passRoles(act(s, { type: "potions", night, heal: false, poison: null }));
  if (s.status === "magician")
    return passRoles(act(s, { type: "castSpells", night, heal: false, kill: [] }));
  if (s.status === "nightCall") return passRoles(act(s, { type: "acknowledgeCall", night }));
  return s;
}
const dawn = (s: WerewolfState) => act(s, { type: "announceMorning", night: s.night });
const dusk = (s: WerewolfState) => act(s, { type: "endDay", night: s.night });

it("normalizes and preserves both tough-guy variants through fixed setup", () => {
  expect(automaticWerewolfSettings({})?.toughGuy).toBe("wolfOnly");
  expect(automaticWerewolfSettings({ toughGuy: "bad" as "anyAttack" })).toBeNull();
  expect(
    createFixedWerewolf(names.join(","), "Narrator", () => 0.99, ["toughGuy"], {
      toughGuy: "anyAttack",
    })?.settings.toughGuy,
  ).toBe("anyAttack");
});

it.each(["witchPoison", "magicianKill"] as const)(
  "delays %s only in the all-attacks variant and preserves its origin",
  (cause) => {
    for (const toughGuy of ["wolfOnly", "anyAttack"] as const) {
      const role = cause === "witchPoison" ? "witch" : "magician";
      let s = setup(["toughGuy", role], { toughGuy });
      const target = who(s, "toughGuy");
      const actor = who(s, role);
      s = attack(s, null);
      s = act(
        s,
        cause === "witchPoison"
          ? { type: "potions", night: 1, heal: false, poison: target }
          : { type: "castSpells", night: 1, heal: false, kill: [target] },
      );
      s = dawn(s);
      expect(s.alive.some((p) => p.name === target)).toBe(toughGuy === "anyAttack");
      if (toughGuy === "anyAttack") {
        expect(s).toMatchObject({
          toughGuyDiesOn: 2,
          toughGuyWound: { cause, actors: [actor], night: 1 },
        });
        expect(describePlayers(s).find((p) => p.name === target)?.wound?.cause).toBe(cause);
        s = dawn(passRoles(attack(dusk(s), null)));
        const death = s.history.find((e) => e.kind === "death" && e.player === target);
        expect(death).toMatchObject({
          kind: "death",
          sources: [{ cause: "toughGuy", actors: [actor], originNight: 1, attackCause: cause }],
        });
      }
    }
  },
);

it.each(["day", "morning"] as const)(
  "delays a %s hunter shot until the following night",
  (period) => {
    let s = setup(["toughGuy", "hunter"], { toughGuy: "anyAttack" });
    const hunter = who(s, "hunter");
    const tough = who(s, "toughGuy");
    if (period === "morning") s = dawn(attack(s, hunter));
    else {
      s = dawn(attack(s, null));
      const supporters = s.alive.filter((p) => p.name !== hunter);
      s = act(
        s,
        {
          type: "nominate",
          night: 1,
          target: hunter,
          nominator: supporters[0]!.name,
          seconder: supporters[1]!.name,
        },
        { type: "vote", night: 1, nomination: 1, yesVoters: s.alive.map((p) => p.name) },
        { type: "announceExile", night: 1 },
      );
    }
    expect(s.status).toBe("hunter");
    s = act(s, { type: "shot", night: 1, target: tough });
    expect(s.alive.some((p) => p.name === tough)).toBe(true);
    expect(s.toughGuyDiesOn).toBe(2);
    expect(s.history.find((e) => e.kind === "injury")).toMatchObject({
      kind: "injury",
      cause: "hunter",
      actors: [hunter],
      period: period === "day" ? "day" : "night",
    });
    if (period === "morning") s = dusk(s);
    s = dawn(attack(s, null));
    expect(s.alive.some((p) => p.name === tough)).toBe(false);
  },
);

it("does not postpone an existing wound and cannot heal it in the following night", () => {
  let s = setup(["toughGuy", "witch", "magician"], { toughGuy: "anyAttack" });
  const tough = who(s, "toughGuy");
  s = attack(s, tough);
  s = act(
    s,
    { type: "potions", night: 1, heal: false, poison: tough },
    { type: "castSpells", night: 1, heal: false, kill: [tough] },
  );
  s = dawn(s);
  expect(s.history.filter((e) => e.kind === "injury")).toHaveLength(1);
  s = attack(dusk(s), tough);
  s = act(
    s,
    { type: "potions", night: 2, heal: true, poison: null },
    { type: "castSpells", night: 2, heal: false, kill: [] },
  );
  s = dawn(s);
  expect(s.alive.some((p) => p.name === tough)).toBe(false);
  expect(s.history.filter((e) => e.kind === "injury")).toHaveLength(1);
});

it("allows Cupid to select himself and keeps heartbreak immediately lethal", () => {
  let s = setup(["cupid", "toughGuy"], { toughGuy: "anyAttack" });
  const cupid = who(s, "cupid");
  const tough = who(s, "toughGuy");
  expect(validTargets(s, "bond", { selected: [cupid] })).toContain(tough);
  expect(act(s, { type: "bond", night: 1, players: [cupid, cupid] })).toBe(s);
  s = act(
    s,
    { type: "bond", night: 1, players: [cupid, tough] },
    { type: "loversReady", night: 1 },
  );
  s = dawn(attack(s, cupid));
  expect(s.alive.some((p) => p.name === tough)).toBe(false);
  expect(s.toughGuyDiesOn).toBeNull();
});

it.each([false, true])(
  "announces the apprentice openly after the seer dies (reveal=%s)",
  (revealRoles) => {
    let s = setup(["apprenticeSeer"], { revealRoles });
    const seer = who(s, "seer");
    expect(nightScript(s).find((c) => c.id === "seer")?.announcementRole).toBe("seer");
    s = dusk(dawn(attack(s, seer)));
    expect(nightScript(s).find((c) => c.id === "seer")).toMatchObject({
      announcementRole: "apprenticeSeer",
      mode: "active",
      actors: [who(s, "apprenticeSeer")],
    });
  },
);
