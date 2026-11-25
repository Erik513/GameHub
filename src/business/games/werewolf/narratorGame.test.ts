import { describe, expect, it } from "vitest";
import { emptyFixedDraft, toggleFixedRole } from "./fixedConfiguration";
import { chooseNarrator, emptyWerewolfLineup, setParticipants } from "./lineup";
import {
  parseSavedWerewolfSession,
  savedSessionVersion,
  savedTrailOf,
  serializeWerewolfSession,
  startWerewolfGame,
} from "./narratorGame";
import { createGuide, describeGuide } from "./narratorGuide";
import { advanceWerewolfSession, createWerewolfSession, undoWerewolfSession } from "./session";
import { emptyVariableDraft } from "./variableConfiguration";

const names = "Anna Ben Cleo Dora Emil Finn Gina Hans Ida Jan Kim Lea Max".split(" ");
const lineup = chooseNarrator(setParticipants(emptyWerewolfLineup, names), "Max");
const random = () => 0.3;
const input = {
  fixedDraft: emptyFixedDraft,
  lineup,
  mode: "fixed" as const,
  random,
  variableDraft: emptyVariableDraft,
};

describe("startWerewolfGame", () => {
  it("starts a fixed game with all players and the narrator", () => {
    const session = startWerewolfGame(input);
    expect(session?.present.status).toBe("roles");
    expect(session?.present.players).toHaveLength(12);
    expect(session?.present.narrator).toBe("Max");
    expect(session?.past).toEqual([]);
  });

  it("uses the chosen roles of the fixed configuration", () => {
    const fixedDraft = toggleFixedRole(emptyFixedDraft, "witch");
    const session = startWerewolfGame({ ...input, fixedDraft });
    expect(session?.present.players.some((p) => p.role === "witch")).toBe(true);
  });

  it("starts a variable game", () => {
    const session = startWerewolfGame({ ...input, mode: "variable" });
    expect(session?.present.players).toHaveLength(12);
  });

  it("does not start without a narrator", () => {
    expect(startWerewolfGame({ ...input, lineup: { ...lineup, narrator: null } })).toBeNull();
  });

  it("does not start with an invalid random source", () => {
    expect(startWerewolfGame({ ...input, random: () => 2 })).toBeNull();
  });
});

describe("saved game", () => {
  it("survives a JSON round trip including the undo history", () => {
    const first = startWerewolfGame(input)!;
    const player = first.present.status === "roles" ? first.present.players[0]!.name : "";
    const next = advanceWerewolfSession(first, { player, type: "roleSeen" });
    expect(next.past).toHaveLength(1);
    const loaded = parseSavedWerewolfSession(
      JSON.parse(JSON.stringify(serializeWerewolfSession(next))),
    );
    expect(loaded).toEqual(next);
  });

  it("drops a game of another version or shape", () => {
    const session = startWerewolfGame(input)!;
    expect(
      parseSavedWerewolfSession({
        ...serializeWerewolfSession(session),
        version: savedSessionVersion + 1,
      }),
    ).toBeUndefined();
    expect(
      parseSavedWerewolfSession({
        session: { past: [], present: {} },
        version: savedSessionVersion,
      }),
    ).toBeUndefined();
    expect(parseSavedWerewolfSession(null)).toBeUndefined();
    expect(parseSavedWerewolfSession("x")).toBeUndefined();
    expect(
      parseSavedWerewolfSession({
        session: { past: 1, present: session.present },
        version: savedSessionVersion,
      }),
    ).toBeUndefined();
  });

  it("lets a game saved in the removed amulet step go on with the first night", () => {
    // The role reveal of a game with the amulet, once with the old step in between.
    const first = startWerewolfGame({
      ...input,
      fixedDraft: { ...emptyFixedDraft, settings: { ...emptyFixedDraft.settings, amulet: true } },
    })!;
    let session = first;
    while (session.present.status === "roles") {
      const player = session.present.players[session.present.index]!.name;
      session = advanceWerewolfSession(session, { player, type: "roleSeen" });
    }
    const roleReveal = session.past[session.past.length - 1]!;
    const legacy = {
      past: [...session.past, roleReveal],
      present: { ...session.present, status: "amuletIntro" },
    };
    const loaded = parseSavedWerewolfSession(
      JSON.parse(JSON.stringify({ session: legacy, version: savedSessionVersion })),
    );
    expect(loaded?.present.status).not.toBe("amuletIntro");
    expect(loaded?.present.status).toBe(session.present.status);
    expect(loaded?.present.night).toBe(1);
    // The old step is no longer in the way back.
    expect(loaded?.past.some((state) => (state.status as string) === "amuletIntro")).toBe(false);
  });
});
it("resumes a version 1 cover call through night, morning, day and Back", () => {
  const fixedDraft = toggleFixedRole(emptyFixedDraft, "bodyguard");
  const start = startWerewolfGame({
    ...input,
    fixedDraft: {
      ...fixedDraft,
      settings: { ...fixedDraft.settings, attackOnFirstNight: true },
    },
  })!;
  const bodyguard = start.present.players.find((player) => player.role === "bodyguard")!;
  const target = start.present.players.find((player) => player.role === "villager")!;
  const other = start.present.players.find(
    (player) => player.role === "villager" && player !== target,
  )!;
  let original = createWerewolfSession({
    ...start.present,
    drunk: { player: bodyguard.name, revealed: false },
  });
  for (const player of start.present.players)
    original = advanceWerewolfSession(original, { type: "roleSeen", player: player.name });
  expect(original.present.status).toBe("nightCall");

  const newKeys = new Set([
    "inspections",
    "healedPlayer",
    "spellHealedPlayer",
    "protectedNight",
    "hostNight",
    "silencedNight",
  ]);
  const raw: unknown = JSON.parse(
    JSON.stringify(
      {
        version: 1,
        session: { ...original, present: { ...original.present, inspectedPlayer: target.name } },
      },
      (key, value: unknown) => (newKeys.has(key) ? undefined : value),
    ),
  );
  let loaded = parseSavedWerewolfSession(raw)!;
  expect(loaded.present.status).toBe("nightCall");
  expect(loaded.present).not.toHaveProperty("inspectedPlayer");
  expect(loaded.present).toMatchObject({
    inspections: [],
    healedPlayer: null,
    spellHealedPlayer: null,
    protectedNight: null,
    hostNight: null,
    silencedNight: null,
  });
  expect(() => describeGuide(createGuide(loaded))).not.toThrow();

  const beforeCover = undoWerewolfSession(loaded);
  expect(beforeCover.ok).toBe(true);
  if (!beforeCover.ok) throw new Error("Expected the deal checkpoint");
  expect(beforeCover.session.present.status).toBe("roles");
  expect(beforeCover.session.present.inspections).toEqual([]);

  loaded = advanceWerewolfSession(loaded, { type: "acknowledgeCall", night: 1 });
  expect(loaded.present.status).toBe("wolves");
  expect(loaded.present.inspections).toEqual([]);
  loaded = advanceWerewolfSession(loaded, { type: "attack", night: 1, target: target.name });
  loaded = advanceWerewolfSession(loaded, { type: "inspect", night: 1, target: other.name });
  expect(loaded.present.status).toBe("vision");
  expect(loaded.present.inspections[0]?.target).toBe(other.name);
  loaded = advanceWerewolfSession(loaded, { type: "closeVision", night: 1 });
  expect(loaded.present.status).toBe("morning");
  const morning = loaded.present;
  loaded = advanceWerewolfSession(loaded, { type: "announceMorning", night: 1 });
  expect(loaded.present.status).toBe("day");
  expect(loaded.present.alive.some((player) => player.name === target.name)).toBe(false);
  expect(undoWerewolfSession(loaded)).toEqual({ ok: false, reason: "confirmationRequired" });
  const back = undoWerewolfSession(loaded, true);
  expect(back.ok && back.session.present).toBe(morning);
  const trail = createGuide(loaded).trail;
  const saved = serializeWerewolfSession(loaded, trail);
  expect(saved.version).toBe(2);
  expect(createGuide(parseSavedWerewolfSession(saved)!, savedTrailOf(saved)).trail).toEqual(trail);
});

it("keeps the vote-only tanner's win when confirming an exile after a reload", () => {
  const fixedDraft = toggleFixedRole(emptyFixedDraft, "tanner");
  const start = startWerewolfGame({
    ...input,
    fixedDraft: { ...fixedDraft, settings: { ...fixedDraft.settings, tanner: "voteOnly" } },
  })!;
  const tanner = start.present.players.find((player) => player.role === "tanner")!;
  const exile = advanceWerewolfSession(
    createWerewolfSession({ ...start.present, nomination: 0, status: "day" }),
    { type: "nominate", night: 1, nominees: [tanner.name] },
  );
  const voted = advanceWerewolfSession(exile, {
    type: "voteCount",
    night: 1,
    nomination: 1,
    counts: { [tanner.name]: 11 },
  });
  expect(voted.present.status).toBe("exile");
  const raw: unknown = JSON.parse(JSON.stringify({ session: voted, version: 1 }));
  const loaded = parseSavedWerewolfSession(raw)!;
  const announced = advanceWerewolfSession(loaded, { type: "announceExile", night: 1 });
  expect(announced.present.tannerWinner).toBe(tanner.name);
});
it("preserves night fields already stored in version 1", () => {
  const session = startWerewolfGame(input)!;
  const [actor, target] = session.present.players;
  const nightFields = {
    healedPlayer: target!.name,
    hostNight: 1,
    inspections: [{ by: actor!.name, kind: "seer" as const, target: target!.name }],
    protectedNight: 1,
    silencedNight: 1,
    spellHealedPlayer: target!.name,
  };
  const present = { ...session.present, ...nightFields };
  const loaded = parseSavedWerewolfSession({
    session: { past: [present], present },
    version: 1,
  });
  expect(loaded?.present).toMatchObject(nightFields);
  expect(loaded?.past[0]).toMatchObject(nightFields);
});
it("restores the original wolf choice from an old night even when the guest took the attack", () => {
  const fixedDraft = toggleFixedRole(emptyFixedDraft, "nightGuest");
  let session = startWerewolfGame({
    ...input,
    fixedDraft: {
      ...fixedDraft,
      settings: { ...fixedDraft.settings, attackOnFirstNight: true },
    },
  })!;
  const guest = session.present.players.find((player) => player.role === "nightGuest")!;
  const host = session.present.players.find((player) => player.role === "villager")!;
  for (const player of session.present.players)
    session = advanceWerewolfSession(session, { type: "roleSeen", player: player.name });
  session = advanceWerewolfSession(session, { type: "stayWith", night: 1, target: host.name });
  session = advanceWerewolfSession(session, { type: "attack", night: 1, target: host.name });
  session = advanceWerewolfSession(session, { type: "inspect", night: 1, target: host.name });
  session = advanceWerewolfSession(session, { type: "closeVision", night: 1 });
  expect(session.present).toMatchObject({
    status: "morning",
    wolfChoice: host.name,
    wolfTarget: guest,
  });

  const raw: unknown = JSON.parse(
    JSON.stringify({ session, version: 1 }, (key, value: unknown) =>
      key === "wolfChoice" ? undefined : value,
    ),
  );
  const restored = parseSavedWerewolfSession(raw)!;
  expect(restored.present).toMatchObject({ wolfChoice: host.name, wolfTarget: guest });
  expect(restored.past.find((state) => state.status === "wolves")?.wolfChoice).toBeNull();
  const back = undoWerewolfSession(restored);
  expect(back.ok && back.session.present.wolfChoice).toBe(host.name);
  const day = advanceWerewolfSession(restored, { type: "announceMorning", night: 1 });
  const night = advanceWerewolfSession(day, { type: "endDay", night: 1 });
  expect(night.present.wolfChoice).toBeNull();

  const explicit = { ...restored, present: { ...restored.present, wolfChoice: null } };
  expect(
    parseSavedWerewolfSession(serializeWerewolfSession(explicit))?.present.wolfChoice,
  ).toBeNull();
});
