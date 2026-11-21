import { describe, expect, it } from "vitest";
import { emptyFixedDraft, toggleFixedRole } from "./fixedConfiguration";
import { chooseNarrator, emptyWerewolfLineup, setParticipants } from "./lineup";
import {
  parseSavedWerewolfSession,
  savedSessionVersion,
  serializeWerewolfSession,
  startWerewolfGame,
} from "./narratorGame";
import { advanceWerewolfSession } from "./session";
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
});
