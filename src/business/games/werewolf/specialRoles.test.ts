import { expect, it } from "vitest";
import {
  createWerewolf,
  transitionWerewolf,
  wakingPlayers,
  werewolfAnnouncement,
  type WerewolfEvent,
  type WerewolfSpecialRole,
  type WerewolfState,
} from "./stateMachine";
import { lynchEvents } from "./voteTesting";

const names = ["Ada", "Bea", "Cam", "Dan", "Eva", "Flo"];
const act = (state: WerewolfState, ...events: WerewolfEvent[]) =>
  events.reduce(transitionWerewolf, state);

function deal(...roles: WerewolfSpecialRole[]) {
  const setup = createWerewolf(names.join(","), "Narrator", () => 0.99, roles)!;
  return act(setup, ...names.map((player) => ({ type: "roleSeen", player }) as const));
}

function sight(state: WerewolfState) {
  return act(
    state,
    { type: "inspect", night: state.night, target: "Ada" },
    { type: "closeVision", night: state.night },
  );
}

const morning = (state: WerewolfState) =>
  act(state, { type: "announceMorning", night: state.night });
const endDay = (state: WerewolfState) => act(state, { type: "endDay", night: state.night });

const firstNight = (state: WerewolfState) => sight(act(state, { type: "wolvesReady", night: 1 }));
const attack = (state: WerewolfState, target: string | null) =>
  act(state, { type: "attack", night: state.night, target });

it("keeps the tough guy alive for the day and announces the delayed death once", () => {
  const secondNight = endDay(morning(firstNight(deal("toughGuy"))));
  const wounded = sight(attack(secondNight, "Cam"));
  expect(werewolfAnnouncement(wounded)).toEqual([]);
  const day = morning(wounded);
  expect(day.alive.map((player) => player.name)).toContain("Cam");
  const night = endDay(day);
  const repeatAttack = sight(attack(night, "Cam"));
  expect(werewolfAnnouncement(repeatAttack)).toEqual([{ name: "Cam" }]);
  const otherVictim = sight(attack(night, "Eva"));
  expect(werewolfAnnouncement(otherVictim)).toEqual([{ name: "Cam" }, { name: "Eva" }]);
  expect(morning(otherVictim).alive.map((player) => player.name)).toEqual([
    "Ada",
    "Bea",
    "Dan",
    "Flo",
  ]);
});

it("lets the witch heal the triggering attack and resolves poison immediately", () => {
  const ready = firstNight(deal("toughGuy", "witch"));
  const day = morning(act(ready, { type: "potions", night: 1, heal: false, poison: null }));
  const attacked = sight(attack(endDay(day), "Cam"));
  const healed = morning(act(attacked, { type: "potions", night: 2, heal: true, poison: null }));
  const thirdNight = sight(attack(endDay(healed), null));
  expect(
    werewolfAnnouncement(act(thirdNight, { type: "potions", night: 3, heal: false, poison: null })),
  ).toEqual([]);
  const poisoned = act(attacked, { type: "potions", night: 2, heal: false, poison: "Cam" });
  expect(werewolfAnnouncement(poisoned)).toEqual([{ name: "Cam" }]);
  expect(morning(poisoned).alive).toHaveLength(5);
});

it("resolves the delayed death together with a linked lover, even during a decisive hammer night", () => {
  let state = createWerewolf(
    names.join(","),
    "Narrator",
    () => 0.99,
    ["toughGuy", "cupid", "mayor"],
    {
      mayor: "hammer",
    },
  )!;
  state = act(state, ...names.map((player) => ({ type: "roleSeen", player }) as const));
  state = morning(
    firstNight(
      act(
        state,
        { type: "bond", night: 1, players: ["Cam", "Flo"] },
        { type: "loversReady", night: 1 },
      ),
    ),
  );
  state = act(sight(attack(endDay(state), "Cam")), { type: "hammer", night: 2, target: null });
  state = morning(state);
  state = act(sight(attack(endDay(state), "Bea")), { type: "hammer", night: 3, target: "Ada" });
  expect(werewolfAnnouncement(state)).toEqual([
    { name: "Ada" },
    { name: "Bea" },
    { name: "Cam" },
    { name: "Flo" },
  ]);
  expect(morning(state)).toMatchObject({ status: "finished", winner: "village" });
});

it("wakes the apprentice only after the seer has completed her last vision and died", () => {
  const firstVision = act(deal("apprenticeSeer"), { type: "wolvesReady", night: 1 });
  expect(wakingPlayers(firstVision)).toEqual(["Bea"]);
  const lastVision = attack(endDay(morning(sight(firstVision))), "Bea");
  expect(wakingPlayers(lastVision)).toEqual(["Bea"]);
  const successor = attack(endDay(morning(sight(lastVision))), null);
  expect(wakingPlayers(successor)).toEqual(["Cam"]);
  expect(act(successor, { type: "inspect", night: 3, target: "Cam" })).toBe(successor);
  const vision = act(successor, { type: "inspect", night: 3, target: "Ada" });
  expect(vision).toMatchObject({ status: "vision", isWolf: true });
  expect(wakingPlayers(vision)).toEqual(["Cam"]);
});

it("lets the investigator wait, skips dead neighbors, wraps the circle and spends the ability once", () => {
  let state = firstNight(deal("paranormalInvestigator"));
  expect(wakingPlayers(state)).toEqual(["Cam"]);
  expect(act(state, { type: "investigate", night: 1, target: "Dan" })).toMatchObject({
    status: "investigation",
    isWolfNearby: false,
  });
  state = morning(act(state, { type: "investigate", night: 1, target: null }));
  state = sight(attack(endDay(state), "Flo"));
  state = morning(act(state, { type: "investigate", night: 2, target: null }));
  state = sight(attack(endDay(state), null));
  expect(act(state, { type: "investigate", night: 3, target: "Flo" })).toBe(state);
  state = act(state, { type: "investigate", night: 3, target: "Eva" });
  expect(state).toMatchObject({ status: "investigation", target: "Eva", isWolfNearby: true });
  expect(wakingPlayers(state)).toEqual(["Cam"]);
  expect(werewolfAnnouncement(state)).toEqual([]);
  state = morning(act(state, { type: "closeInvestigation", night: 3 }));
  const cover = sight(attack(endDay(state), null));
  expect(cover.status).toBe("nightCall");
  expect(act(cover, { type: "acknowledgeCall", night: 4 }).status).toBe("morning");
});

it("fills optional roles once and rejects duplicate selections", () => {
  const state = deal("bodyguard", "witch", "hunter");
  expect(state.players.map((player) => player.role)).toEqual([
    "wolf",
    "seer",
    "bodyguard",
    "witch",
    "hunter",
    "villager",
  ]);
  expect(createWerewolf(names.join(","), "Narrator", () => 0.99, ["witch", "witch"])).toBeNull();
});

it("prevents self-protection, repeated targets and wolf attacks on the protected player", () => {
  let state = deal("bodyguard");
  expect(wakingPlayers(state)).toEqual(["Cam"]);
  expect(act(state, { type: "attack", night: 1, target: "Dan" })).toBe(state);
  expect(act(state, { type: "protect", night: 1, target: "Cam" })).toBe(state);
  expect(act(state, { type: "protect", night: 1, target: "Unknown" })).toBe(state);
  state = act(
    state,
    { type: "protect", night: 1, target: "Dan" },
    { type: "wolvesReady", night: 1 },
  );
  state = endDay(morning(sight(state)));
  expect(act(state, { type: "protect", night: 2, target: "Dan" })).toBe(state);
  state = act(
    state,
    { type: "protect", night: 2, target: "Eva" },
    { type: "attack", night: 2, target: "Eva" },
  );
  expect(morning(sight(state)).alive).toHaveLength(6);
});

it("deals one nighttime protection role per lineup", () => {
  expect(
    createWerewolf(names.join(","), "Narrator", () => 0.99, ["bodyguard", "nightGuest"]),
  ).toBeNull();
});

it("lets the witch heal a direct attack on the bodyguard", () => {
  const first = act(deal("bodyguard", "witch"), { type: "protect", night: 1, target: "Eva" });
  const day = morning(
    act(firstNight(first), { type: "potions", night: 1, heal: false, poison: null }),
  );
  const wolves = act(endDay(day), { type: "protect", night: 2, target: "Flo" });
  const attacked = sight(attack(wolves, "Cam"));
  expect(attacked).toMatchObject({ status: "witch", victim: { name: "Cam" } });
  expect(
    morning(act(attacked, { type: "potions", night: 2, heal: true, poison: null })).alive,
  ).toHaveLength(6);
});

it("redirects wolves to the visiting guest, who can be healed or poisoned", () => {
  const guest = deal("nightGuest", "witch");
  expect(wakingPlayers(guest)).toEqual(["Cam"]);
  expect(act(guest, { type: "stayWith", night: 1, target: "Cam" })).toBe(guest);
  expect(act(guest, { type: "stayWith", night: 1, target: "Unknown" })).toBe(guest);
  const first = act(guest, { type: "stayWith", night: 1, target: "Eva" });
  const day = morning(
    act(firstNight(first), { type: "potions", night: 1, heal: false, poison: null }),
  );
  const second = endDay(day);
  expect(act(second, { type: "stayWith", night: 2, target: "Eva" })).toBe(second);
  const wolves = act(second, { type: "stayWith", night: 2, target: "Flo" });
  const redirected = sight(attack(wolves, "Flo"));
  expect(redirected).toMatchObject({ status: "witch", victim: { name: "Cam" } });
  expect(
    werewolfAnnouncement(act(redirected, { type: "potions", night: 2, heal: false, poison: null })),
  ).toEqual([{ name: "Cam" }]);
  const healed = act(redirected, { type: "potions", night: 2, heal: true, poison: null });
  expect(morning(healed).alive).toHaveLength(6);

  const missed = sight(attack(wolves, "Cam"));
  expect(missed).toMatchObject({ status: "witch", victim: null });
  for (const target of ["Cam", "Flo"]) {
    const poisoned = act(missed, { type: "potions", night: 2, heal: false, poison: target });
    expect(werewolfAnnouncement(poisoned).map(({ name }) => name)).toEqual([target]);
  }
});

it("lets the witch heal and poison in one night and consumes both potions exactly once", () => {
  let state = sight(act(deal("witch"), { type: "wolvesReady", night: 1 }));
  expect(wakingPlayers(state)).toEqual(["Cam"]);
  expect(act(state, { type: "potions", night: 1, heal: true, poison: null })).toBe(state);
  expect(act(state, { type: "potions", night: 1, heal: false, poison: "Unknown" })).toBe(state);
  state = endDay(morning(act(state, { type: "potions", night: 1, heal: false, poison: null })));
  state = sight(act(state, { type: "attack", night: 2, target: "Cam" }));
  state = act(state, { type: "potions", night: 2, heal: true, poison: "Flo" });
  expect(state).toMatchObject({
    status: "morning",
    victim: null,
    poisoned: { name: "Flo" },
    potions: { heal: false, poison: false },
  });
  state = endDay(morning(state));
  state = sight(act(state, { type: "attack", night: 3, target: "Eva" }));
  expect(act(state, { type: "potions", night: 3, heal: true, poison: null })).toBe(state);
  expect(act(state, { type: "potions", night: 3, heal: false, poison: "Dan" })).toBe(state);
  expect(state.status).toBe("nightCall");
  state = act(state, { type: "acknowledgeCall", night: 3 });
  expect(state).toMatchObject({ status: "morning", poisoned: null });
  expect(morning(state).alive.map((player) => player.name)).toEqual(["Ada", "Bea", "Cam", "Dan"]);
});

it("blocks poison with protection but spends the potion", () => {
  let state = act(
    deal("witch", "bodyguard"),
    { type: "protect", night: 1, target: "Flo" },
    { type: "wolvesReady", night: 1 },
  );
  state = act(sight(state), { type: "potions", night: 1, heal: false, poison: "Flo" });
  expect(state).toMatchObject({
    status: "morning",
    poisoned: null,
    potions: { heal: true, poison: false },
  });
  expect(morning(state).alive).toHaveLength(6);
});

it("announces simultaneous victims once and lets the hunter answer before checking wolf parity", () => {
  let state = sight(act(deal("hunter", "witch"), { type: "wolvesReady", night: 1 }));
  state = endDay(morning(act(state, { type: "potions", night: 1, heal: false, poison: null })));
  state = sight(act(state, { type: "attack", night: 2, target: "Eva" }));
  state = endDay(morning(act(state, { type: "potions", night: 2, heal: false, poison: "Flo" })));
  expect(state.alive.map((player) => player.name)).toEqual(["Ada", "Bea", "Cam", "Dan"]);
  state = sight(act(state, { type: "attack", night: 3, target: "Cam" }));
  state = morning(act(state, { type: "potions", night: 3, heal: false, poison: null }));
  expect(wakingPlayers(state)).toEqual(["Cam"]);
  state = endDay(act(state, { type: "shot", night: 3, target: null }));
  state = sight(act(state, { type: "attack", night: 4, target: "Dan" }));
  state = morning(act(state, { type: "potions", night: 4, heal: false, poison: null }));
  expect(state).toMatchObject({ status: "finished", winner: "wolves" });
});

it.each(["optional", "required"] as const)(
  "resolves an exiled hunter before parity with %s shooting",
  (hunterShot) => {
    let state = endDay(morning(sight(act(deal("hunter"), { type: "wolvesReady", night: 1 }))));
    for (const target of ["Flo", "Eva", "Dan"]) {
      state = morning(sight(act(state, { type: "attack", night: state.night, target })));
      if (target !== "Dan") state = endDay(state);
    }
    state = { ...state, settings: { ...state.settings, hunterShot } };
    const night = state.night;
    state = act(state, ...lynchEvents(state, "Cam"), { type: "announceExile", night });
    expect(state.status).toBe("hunter");
    expect(act(state, { type: "endDay", night })).toBe(state);
    expect(act(state, { type: "shot", night, target: "Cam" })).toBe(state);
    const skipped = act(state, { type: "shot", night, target: null });
    if (hunterShot === "required") expect(skipped).toBe(state);
    else expect(skipped).toMatchObject({ winner: "wolves" });
    expect(act(state, { type: "shot", night, target: "Ada" })).toMatchObject({ winner: "village" });
  },
);

it("lets a hunter targeted by both wolves and poison respond just once", () => {
  let state = sight(act(deal("hunter", "witch"), { type: "wolvesReady", night: 1 }));
  state = endDay(morning(act(state, { type: "potions", night: 1, heal: false, poison: null })));
  state = sight(act(state, { type: "attack", night: 2, target: "Cam" }));
  state = morning(act(state, { type: "potions", night: 2, heal: false, poison: "Cam" }));
  expect(state).toMatchObject({ status: "hunter", hunter: { name: "Cam" } });
  expect(state.alive).toHaveLength(5);
  state = act(state, { type: "shot", night: 2, target: "Flo" });
  expect(state).toMatchObject({ status: "day" });
  expect(act(state, { type: "shot", night: 2, target: "Eva" })).toBe(state);
});

it.each([undefined, "optional", "required"] as const)(
  "configures %s hunter shooting and enforces it after a night death",
  (hunterShot) => {
    const setup = createWerewolf(
      names.join(","),
      "Narrator",
      () => 0.99,
      ["hunter"],
      hunterShot ? { hunterShot } : {},
    )!;
    expect(setup.settings.hunterShot).toBe(hunterShot ?? "optional");
    const ready = act(setup, ...names.map((player) => ({ type: "roleSeen", player }) as const));
    const night = endDay(morning(firstNight(ready)));
    const hunter = morning(sight(attack(night, "Cam")));
    expect(hunter.status).toBe("hunter");
    const skipped = act(hunter, { type: "shot", night: 2, target: null });
    if (hunterShot === "required") expect(skipped).toBe(hunter);
    else expect(skipped.status).toBe("day");
    for (const target of ["Cam", "Unknown"])
      expect(act(hunter, { type: "shot", night: 2, target })).toBe(hunter);
    expect(act(hunter, { type: "shot", night: 1, target: "Ada" })).toBe(hunter);
    expect(act(hunter, { type: "shot", night: 2, target: "Ada" })).toMatchObject({
      status: "finished",
      winner: "village",
    });
  },
);

it("shows the witch the attacked person although the bodyguard protects them, and lets her heal", () => {
  let state = deal("bodyguard", "witch");
  state = act(
    state,
    { type: "protect", night: 1, target: "Dan" },
    { type: "wolvesReady", night: 1 },
  );
  state = endDay(
    morning(act(sight(state), { type: "potions", night: 1, heal: false, poison: null })),
  );
  state = act(
    state,
    { type: "protect", night: 2, target: "Eva" },
    { type: "attack", night: 2, target: "Eva" },
  );
  // The protection stops the attack, but the witch sees the attacked person like in any other night.
  const witch = sight(state);
  expect(witch).toMatchObject({ status: "witch", victim: null, wolfTarget: { name: "Eva" } });
  // She may heal: the potion is spent and nothing changes for the person.
  const healed = morning(act(witch, { type: "potions", night: 2, heal: true, poison: null }));
  expect(healed.potions.heal).toBe(false);
  expect(healed.alive).toHaveLength(6);
});
