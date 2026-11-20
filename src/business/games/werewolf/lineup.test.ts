import { describe, expect, it } from "vitest";
import {
  addParticipants,
  chooseNarrator,
  emptyWerewolfLineup,
  maxWerewolfParticipants,
  moveSeat,
  parseSavedLineup,
  removeParticipant,
  setParticipants,
  werewolfLineupIssues,
} from "./lineup";

const names = (count: number) => Array.from({ length: count }, (_, i) => `P${i + 1}`);

describe("participants and seats", () => {
  it("gives new players the last seats in the order they were added", () => {
    let lineup = addParticipants(emptyWerewolfLineup, ["Anna", "Ben"]);
    lineup = addParticipants(lineup, ["Cem", "anna", "Dora"]);
    expect(lineup.participants).toEqual(["Anna", "Ben", "Cem", "Dora"]);
    expect(lineup.seats).toEqual(["Anna", "Ben", "Cem", "Dora"]);
    expect(lineup.narrator).toBeNull();
  });

  it("makes the first letter of a name a capital letter", () => {
    const lineup = addParticipants(emptyWerewolfLineup, ["anna", "ben meier", "émile"]);
    expect(lineup.participants).toEqual(["Anna", "Ben meier", "Émile"]);
  });

  it("takes at most the players of a match and the narrator", () => {
    const lineup = addParticipants(emptyWerewolfLineup, names(30));
    expect(lineup.participants).toHaveLength(maxWerewolfParticipants);
    expect(lineup.participants).toHaveLength(21);
    expect(setParticipants(lineup, names(40)).participants).toHaveLength(21);
  });

  it("keeps the seat order when the participants change", () => {
    let lineup = addParticipants(emptyWerewolfLineup, ["Anna", "Ben", "Cem"]);
    lineup = moveSeat(lineup, "Cem", 0);
    lineup = setParticipants(lineup, ["Anna", "Ben", "Cem", "Dora"]);
    expect(lineup.seats).toEqual(["Cem", "Anna", "Ben", "Dora"]);
    lineup = removeParticipant(lineup, "Anna");
    expect(lineup.seats).toEqual(["Cem", "Ben", "Dora"]);
  });
});

describe("narrator", () => {
  it("takes the narrator out of the seats and puts the earlier narrator behind the last player", () => {
    let lineup = addParticipants(emptyWerewolfLineup, ["Anna", "Ben", "Cem", "Dora"]);
    lineup = chooseNarrator(lineup, "Ben");
    expect(lineup.narrator).toBe("Ben");
    expect(lineup.seats).toEqual(["Anna", "Cem", "Dora"]);
    lineup = chooseNarrator(lineup, "Anna");
    expect(lineup.seats).toEqual(["Cem", "Dora", "Ben"]);
    lineup = chooseNarrator(lineup, null);
    expect(lineup.narrator).toBeNull();
    expect(lineup.seats).toEqual(["Cem", "Dora", "Ben", "Anna"]);
  });

  it("ignores someone who does not take part and removes a narrator who is removed", () => {
    let lineup = addParticipants(emptyWerewolfLineup, ["Anna", "Ben"]);
    expect(chooseNarrator(lineup, "Zed")).toBe(lineup);
    lineup = chooseNarrator(lineup, "Anna");
    lineup = removeParticipant(lineup, "Anna");
    expect(lineup.narrator).toBeNull();
    expect(lineup.seats).toEqual(["Ben"]);
  });
});

describe("moveSeat", () => {
  const lineup = addParticipants(emptyWerewolfLineup, ["A", "B", "C", "D"]);

  it("moves a player to the place and shifts the others", () => {
    expect(moveSeat(lineup, "D", 1).seats).toEqual(["A", "D", "B", "C"]);
    expect(moveSeat(lineup, "A", 2).seats).toEqual(["B", "C", "A", "D"]);
  });

  it("keeps the line-up when nothing changes or the player does not sit", () => {
    expect(moveSeat(lineup, "B", 1)).toBe(lineup);
    expect(moveSeat(lineup, "Z", 0)).toBe(lineup);
  });

  it("limits the place to the first and the last seat", () => {
    expect(moveSeat(lineup, "C", -5).seats).toEqual(["C", "A", "B", "D"]);
    expect(moveSeat(lineup, "A", 99).seats).toEqual(["B", "C", "D", "A"]);
  });
});

describe("werewolfLineupIssues", () => {
  it("needs a narrator and six to twenty players besides the narrator", () => {
    expect(werewolfLineupIssues(emptyWerewolfLineup)).toEqual([
      { code: "noNarrator" },
      { code: "tooFew", count: 0, minimum: 6 },
    ]);
    let lineup = addParticipants(emptyWerewolfLineup, names(7));
    lineup = chooseNarrator(lineup, "P1");
    // Seven participants are six players and a narrator.
    expect(werewolfLineupIssues(lineup)).toEqual([]);
    lineup = chooseNarrator(lineup, "P1");
    expect(werewolfLineupIssues(removeParticipant(lineup, "P2"))).toEqual([
      { code: "tooFew", count: 5, minimum: 6 },
    ]);
  });

  it("refuses more than twenty players", () => {
    // Nobody can add more than twenty players and the narrator; without a narrator all of them are players.
    const lineup = addParticipants(emptyWerewolfLineup, names(30));
    expect(werewolfLineupIssues(lineup)).toEqual([
      { code: "noNarrator" },
      { code: "tooMany", count: 21, maximum: 20 },
    ]);
    expect(werewolfLineupIssues(chooseNarrator(lineup, "P1"))).toEqual([]);
  });
});

describe("a saved line-up", () => {
  it("comes back as it was written to the storage", () => {
    let lineup = addParticipants(emptyWerewolfLineup, ["Anna", "Ben", "Cem", "Dora"]);
    lineup = chooseNarrator(lineup, "Cem");
    lineup = moveSeat(lineup, "Dora", 0);
    expect(parseSavedLineup(JSON.parse(JSON.stringify(lineup)))).toEqual(lineup);
  });

  it("is brought into line when the parts do not fit together", () => {
    const lineup = parseSavedLineup({
      narrator: "Nobody",
      participants: ["Anna", "Ben", "Anna"],
      seats: ["Ben", "Zoe"],
    });
    expect(lineup).toEqual({
      narrator: null,
      participants: ["Anna", "Ben"],
      seats: ["Ben", "Anna"],
    });
  });

  it.each([
    ["nothing", undefined],
    ["names that are no list", { narrator: null, participants: "Anna", seats: [] }],
    ["a name that is no text", { narrator: null, participants: ["Anna", 2], seats: [] }],
    ["a narrator that is no text", { narrator: 7, participants: ["Anna"], seats: [] }],
  ])("is refused with %s", (_name, raw) => {
    expect(parseSavedLineup(raw)).toBeUndefined();
  });
});
