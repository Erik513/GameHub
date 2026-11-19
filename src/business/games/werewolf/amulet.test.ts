import { expect, it } from "vitest";
import {
  createWerewolf,
  transitionWerewolf,
  wakingPlayers,
  werewolfAnnouncement,
  type WerewolfEvent,
  type WerewolfSettings,
  type WerewolfSpecialRole,
  type WerewolfState,
} from "./stateMachine";

const names = ["Ada", "Bea", "Cam", "Dan", "Eva", "Flo"];
const apply = (state: WerewolfState, ...events: WerewolfEvent[]) =>
  events.reduce(transitionWerewolf, state);

function deal(
  holder: string,
  roles: WerewolfSpecialRole[] = [],
  settings: Partial<WerewolfSettings> = {},
  seats = names,
) {
  let draws = 0;
  const wolves = seats.length < 9 ? 1 : seats.length < 12 ? 2 : 3;
  const holderIndex = seats.indexOf(holder) - wolves;
  const draw = (holderIndex + 0.5) / (seats.length - wolves);
  const setup = createWerewolf(
    seats.join(","),
    "Narrator",
    () => {
      draws++;
      if (draws < seats.length) return 0.99;
      if (settings.drunk && draws === seats.length) return 0;
      return draw;
    },
    roles,
    { ...settings, amulet: true },
  )!;
  return apply(setup, ...seats.map((player) => ({ type: "roleSeen", player }) as const));
}

const open = (state: WerewolfState) => apply(state, { type: "amuletReady", night: 1 });
const vision = (state: WerewolfState) =>
  apply(
    state,
    { type: "inspect", night: state.night, target: "Ada" },
    { type: "closeVision", night: state.night },
  );
const firstNight = (state: WerewolfState) =>
  vision(apply(state, { type: "wolvesReady", night: 1 }));
const dawn = (state: WerewolfState) =>
  apply(state, { type: "announceMorning", night: state.night });
const dusk = (state: WerewolfState) => apply(state, { type: "endDay", night: state.night });
const attack = (state: WerewolfState, target: string | null) =>
  vision(apply(state, { type: "attack", night: state.night, target }));
const pass = (state: WerewolfState, target: string) =>
  apply(state, { type: "passAmulet", night: state.night, target });

it("privately calls an eligible initial holder even when a wolf has the drunk mask", () => {
  const state = deal("Cam", [], { drunk: true }, [...names, "Gia", "Hugo", "Ira"]);
  expect(state.drunk?.player).toBe("Ada");
  expect(state.players.find((player) => player.name === "Ada")?.role).toBe("wolf");
  expect(state.status).toBe("amuletIntro");
  expect(wakingPlayers(state)).toEqual(["Cam"]);
  expect(werewolfAnnouncement(state)).toEqual([]);
  expect(open(state).status).toBe("wolves");
});

it("allows keeping the unused amulet, passing to wolves and returning it to a former holder", () => {
  const firstPass = dawn(firstNight(open(deal("Eva"))));
  expect(wakingPlayers(firstPass)).toEqual(["Eva"]);
  expect(pass(firstPass, "Eva")).toMatchObject({ status: "day", amulet: { holder: "Eva" } });
  const afterPass = pass(firstPass, "Ada");
  expect(afterPass).toMatchObject({ status: "day", amulet: { holder: "Ada" } });
  const secondPass = dawn(attack(dusk(afterPass), null));
  expect(pass(secondPass, "Eva")).toMatchObject({ status: "day", amulet: { holder: "Eva" } });
});

it("ends a successful vote without eliminating the protected tanner and forces a pass", () => {
  const day = pass(dawn(firstNight(open(deal("Cam", ["tanner"], { tanner: "voteOnly" })))), "Cam");
  const exile = apply(
    day,
    { type: "nominate", night: 1, target: "Cam", nominator: "Ada", seconder: "Bea" },
    { type: "vote", night: 1, nomination: 1, yes: 6 },
  );
  expect(werewolfAnnouncement(exile)).toEqual([]);
  const night = apply(exile, { type: "announceExile", night: 1 });
  expect(night).toMatchObject({
    status: "wolves",
    night: 2,
    tannerWinner: null,
    amulet: { mustPass: true },
  });
  const transfer = dawn(attack(night, null));
  expect(pass(transfer, "Cam")).toBe(transfer);
  expect(pass(transfer, "Missing")).toBe(transfer);
  expect(pass(transfer, "Dan")).toMatchObject({
    status: "day",
    amulet: { holder: "Dan", mustPass: false },
  });
});

it("blocks a direct attack on a lover and drops the amulet if the partner dies instead", () => {
  const bonded = apply(
    open(deal("Cam", ["cupid"])),
    { type: "bond", night: 1, players: ["Cam", "Eva"] },
    { type: "loversReady", night: 1 },
  );
  const night = dusk(pass(dawn(firstNight(bonded)), "Cam"));
  const shielded = attack(night, "Cam");
  expect(werewolfAnnouncement(shielded)).toEqual([]);
  expect(dawn(shielded)).toMatchObject({
    status: "amuletPass",
    amulet: { holder: "Cam", mustPass: true },
  });
  const broken = attack(night, "Eva");
  expect(werewolfAnnouncement(broken).map((player) => player.name)).toEqual(["Cam", "Eva"]);
  const day = dawn(broken);
  expect(day).toMatchObject({ status: "day", amulet: null });
  expect(wakingPlayers(day)).toEqual([]);
});

it.each(["Cam", "Eva"])(
  "saves the original or redirected wolf victim when %s carries the amulet",
  (holder) => {
    const guest = open(deal(holder, ["nightGuest"]));
    const first = firstNight(apply(guest, { type: "stayWith", night: 1, target: "Dan" }));
    const second = apply(dusk(pass(dawn(first), holder)), {
      type: "stayWith",
      night: 2,
      target: "Eva",
    });
    const saved = attack(second, "Eva");
    expect(saved).toMatchObject({
      status: "morning",
      victim: null,
      amulet: { holder, mustPass: true },
    });
    expect(werewolfAnnouncement(saved)).toEqual([]);
    expect(attack(second, "Cam").amulet?.mustPass).toBe(false);
  },
);

it("blocks the witch's poison while consuming her potion", () => {
  const witch = firstNight(open(deal("Eva", ["witch"])));
  const saved = apply(witch, { type: "potions", night: 1, heal: false, poison: "Eva" });
  expect(saved).toMatchObject({ amulet: { mustPass: true }, potions: { poison: false } });
  expect(werewolfAnnouncement(saved)).toEqual([]);
});

it("blocks one death spell while another spell can kill the carrier's partner", () => {
  const seats = [...names, "Gia", "Hugo", "Ira", "Jan", "Kim", "Lex"];
  const bonded = apply(
    open(deal("Eva", ["magician", "cupid"], {}, seats)),
    { type: "bond", night: 1, players: ["Eva", "Dan"] },
    { type: "loversReady", night: 1 },
    { type: "wolvesReady", night: 1 },
    { type: "inspect", night: 1, target: "Ada" },
    { type: "closeVision", night: 1 },
  );
  const morning = apply(bonded, {
    type: "castSpells",
    night: 1,
    heal: false,
    kill: ["Eva", "Dan"],
  });
  expect(morning).toMatchObject({
    spellsRemaining: 0,
    spellVictims: [{ name: "Dan" }],
    amulet: { mustPass: true },
  });
  expect(werewolfAnnouncement(morning).map((player) => player.name)).toEqual(["Dan", "Eva"]);
  expect(dawn(morning)).toMatchObject({ status: "day", amulet: null });
});

it.each(["optional", "required"] as const)(
  "resolves a %s hunter shot before transferring the amulet",
  (hunterShot) => {
    const first = firstNight(open(deal("Eva", ["hunter"], { hunterShot })));
    const night = dusk(pass(dawn(first), "Eva"));
    const hunter = dawn(attack(night, "Cam"));
    expect(hunter.status).toBe("hunter");
    const saved = apply(hunter, { type: "shot", night: 2, target: "Eva" });
    expect(saved).toMatchObject({ status: "amuletPass", amulet: { mustPass: true } });
    expect(werewolfAnnouncement(saved)).toEqual([]);
    expect(pass(saved, "Cam")).toBe(saved);
    expect(apply(saved, { type: "shot", night: 2, target: "Ada" })).toBe(saved);
  },
);

it("blocks a correct hammer strike and lets a wrong strike kill the protected mayor", () => {
  const firstPass = dawn(firstNight(open(deal("Cam", ["mayor"], { mayor: "hammer" }))));
  const hit = apply(dusk(pass(firstPass, "Ada")), { type: "hammer", night: 2, target: "Ada" });
  expect(hit).toMatchObject({
    status: "wolves",
    hammerUsed: true,
    amulet: { holder: "Ada", mustPass: true },
  });
  const miss = apply(dusk(pass(firstPass, "Cam")), { type: "hammer", night: 2, target: "Dan" });
  expect(miss).toMatchObject({ hammerUsed: true, amulet: null });
  const morning = attack(miss, null);
  expect(werewolfAnnouncement(morning)).toEqual([{ name: "Cam", role: "mayor" }]);
  expect(dawn(morning).status).toBe("day");
});

it("does not stop a tough guy's injury when he receives the amulet after the attack", () => {
  const first = firstNight(open(deal("Eva", ["toughGuy"])));
  const wounded = dawn(attack(dusk(pass(dawn(first), "Eva")), "Cam"));
  const nowProtected = pass(wounded, "Cam");
  expect(nowProtected.toughGuyDiesOn).toBe(3);
  const morning = attack(dusk(nowProtected), null);
  expect(werewolfAnnouncement(morning)).toEqual([{ name: "Cam", role: "toughGuy" }]);
  expect(dawn(morning)).toMatchObject({ status: "day", amulet: null });
});
