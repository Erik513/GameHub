import { expect, it } from "vitest";
import {
  createWerewolf,
  currentWerewolfRole,
  transitionWerewolf,
  wakingPlayers,
  werewolfAnnouncement,
  werewolfDrunkReveal,
  type WerewolfEvent,
  type WerewolfSpecialRole,
  type WerewolfState,
} from "./stateMachine";

const names = ["Ada", "Bea", "Cam", "Dan", "Eva", "Flo", "Gia", "Hugo", "Ira"];
const play = (state: WerewolfState, ...events: WerewolfEvent[]) =>
  events.reduce(transitionWerewolf, state);

function deal(
  maskDraw: number,
  roles: WerewolfSpecialRole[] = [],
  revealRoles = true,
  hunterShot: "optional" | "required" = "optional",
) {
  let draws = 0;
  return createWerewolf(
    names.join(","),
    "Narrator",
    () => (++draws < names.length ? 0.99 : maskDraw),
    roles,
    { drunk: true, revealRoles, hunterShot },
  )!;
}

const openNight = (state: WerewolfState) =>
  play(state, ...names.map((player) => ({ type: "roleSeen", player }) as const));
const vision = (state: WerewolfState, target = "Ada") =>
  play(
    state,
    { type: "inspect", night: state.night, target },
    { type: "closeVision", night: state.night },
  );
const dawn = (state: WerewolfState) => play(state, { type: "announceMorning", night: state.night });
const dusk = (state: WerewolfState) => play(state, { type: "endDay", night: state.night });
const firstDay = (state: WerewolfState) =>
  dawn(vision(play(openNight(state), { type: "wolvesReady", night: 1 })));

it("requires two wolves and draws the mask only from eligible existing roles", () => {
  expect(
    createWerewolf(names.slice(0, 8).join(","), "Narrator", () => 0, [], { drunk: true }),
  ).toBeNull();
  const maskedWolf = deal(0, ["cupid"]);
  expect(maskedWolf.players.filter((player) => player.role === "wolf")).toHaveLength(2);
  expect(currentWerewolfRole(maskedWolf)).toEqual({ name: "Ada", role: "drunk" });
  expect(werewolfDrunkReveal(maskedWolf)).toBeNull();
  const next = deal(3 / 8, ["cupid"]);
  expect(next.players.find((player) => player.name === next.drunk?.player)).toEqual({
    name: "Eva",
    role: "villager",
  });
  expect(wakingPlayers(openNight(next))).toEqual(["Dan"]);
});

it("keeps a masked wolf detectable, skips a hunt without an active wolf and wakes it on night three", () => {
  const wolves = openNight(deal(0));
  expect(wakingPlayers(wolves)).toEqual(["Bea"]);
  const firstVision = play(
    wolves,
    { type: "wolvesReady", night: 1 },
    { type: "inspect", night: 1, target: "Ada" },
  );
  expect(firstVision).toMatchObject({ status: "vision", isWolf: true });
  const day = dawn(play(firstVision, { type: "closeVision", night: 1 }));
  const secondNight = play(
    day,
    { type: "nominate", night: 1, target: "Bea", nominator: "Cam", seconder: "Dan" },
    { type: "vote", night: 1, nomination: 1, yes: 9 },
    { type: "announceExile", night: 1 },
  );
  expect(secondNight).toMatchObject({ status: "seer", night: 2, victim: null });
  const reveal = dusk(dawn(vision(secondNight)));
  expect(reveal.status).toBe("drunkReveal");
  expect(werewolfDrunkReveal(reveal)).toEqual({ name: "Ada", role: "wolf" });
  expect(play(reveal, { type: "attack", night: 3, target: "Dan" })).toBe(reveal);
  expect(wakingPlayers(play(reveal, { type: "drunkReady", night: 3 }))).toEqual(["Ada"]);
});

it("does not promote the apprentice while the masked seer is alive", () => {
  const wolves = openNight(deal(2 / 9, ["apprenticeSeer"]));
  const noVision = play(wolves, { type: "wolvesReady", night: 1 });
  expect(noVision.status).toBe("morning");
});

it.each([
  { revealRoles: true, hunterShot: "optional" },
  { revealRoles: false, hunterShot: "optional" },
  { revealRoles: true, hunterShot: "required" },
  { revealRoles: false, hunterShot: "required" },
] as const)(
  "reveals a dying masked hunter privately before the shot ($revealRoles, $hunterShot)",
  ({ revealRoles, hunterShot }) => {
    const night = dusk(firstDay(deal(3 / 9, ["hunter"], revealRoles, hunterShot)));
    const morning = vision(play(night, { type: "attack", night: 2, target: "Dan" }));
    expect(werewolfAnnouncement(morning)).toEqual([
      { name: "Dan", role: revealRoles ? "drunk" : null },
    ]);
    const dying = dawn(morning);
    expect(dying.status).toBe("drunkHunter");
    expect(werewolfDrunkReveal(dying)).toEqual({ name: "Dan", role: "hunter" });
    const shot = { type: "shot", night: 2, target: "Ada" } as const;
    expect(play(dying, shot)).toBe(dying);
    const hunter = play(dying, { type: "drunkReady", night: 2 });
    expect(werewolfAnnouncement(play(hunter, shot))).toEqual([
      { name: "Ada", role: revealRoles ? "wolf" : null },
    ]);
    const skipped = play(hunter, { ...shot, target: null });
    if (hunterShot === "required") expect(skipped).toBe(hunter);
    else expect(werewolfAnnouncement(skipped)).toEqual([]);
  },
);

it("does not activate a masked tough guy when the wolves attack before the reveal", () => {
  const night = dusk(firstDay(deal(3 / 9, ["toughGuy"])));
  const morning = vision(play(night, { type: "attack", night: 2, target: "Dan" }));
  expect(werewolfAnnouncement(morning)).toEqual([{ name: "Dan", role: "drunk" }]);
  expect(dusk(dawn(morning)).status).toBe("wolves");
});
