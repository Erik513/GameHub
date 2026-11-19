import { describe, expect, it } from "vitest";
import {
  addGroup,
  addPlayerToGroup,
  adoptUngroupedPlayers,
  groupPlayers,
  maxPlayerGroups,
  parseSavedGroups,
  removeGroup,
  removePlayerFromGroup,
  type PlayerBook,
  type PlayerGroup,
} from "./playerGroups";
import { maxRosterPlayers } from "./playerRoster";

const roster = ["Anna", "Ben", "Cem"];

function groupsOf(...names: string[]): readonly PlayerGroup[] {
  let groups: readonly PlayerGroup[] = [];
  for (const name of names) {
    const result = addGroup(groups, name);
    if (!result.ok) throw new Error(result.reason);
    groups = result.groups;
  }
  return groups;
}

function bookWith(...names: string[]): PlayerBook {
  return { groups: groupsOf(...names), players: [] };
}

function add(book: PlayerBook, group: string, name: string): PlayerBook {
  const result = addPlayerToGroup(book, group, name);
  if (!result.ok) throw new Error(result.reason);
  return result.book;
}

describe("addGroup", () => {
  it("adds an empty group with a capital letter and keeps the groups sorted", () => {
    expect(groupsOf("work", "family")).toEqual([
      { name: "Family", members: [] },
      { name: "Work", members: [] },
    ]);
  });

  it("refuses an empty name, a bad name, a duplicate and too many groups", () => {
    expect(addGroup([], "  ")).toEqual({ ok: false, reason: "empty" });
    expect(addGroup([], "a,b")).toEqual({ ok: false, reason: "invalid" });
    expect(addGroup([], "x".repeat(25))).toEqual({ ok: false, reason: "invalid" });
    expect(addGroup(groupsOf("Family"), " FAMILY ")).toEqual({ ok: false, reason: "duplicate" });
    const full = groupsOf(...Array.from({ length: maxPlayerGroups }, (_, i) => `G${i}`));
    expect(addGroup(full, "More")).toEqual({ ok: false, reason: "full" });
  });
});

describe("addPlayerToGroup", () => {
  it("adds a new player to the list and to the group", () => {
    const book = add(bookWith("Family"), "Family", "anna");
    expect(book.players).toEqual(["Anna"]);
    expect(book.groups).toEqual([{ name: "Family", members: ["Anna"] }]);
  });

  it("keeps the names of a group in alphabetical order, whatever the order of adding", () => {
    let book = add(bookWith("Family"), "Family", "zoe");
    book = add(book, "Family", "Anna");
    book = add(book, "Family", "ben");
    expect(book.groups[0]?.members).toEqual(["Anna", "Ben", "Zoe"]);
    expect(book.players).toEqual(["Anna", "Ben", "Zoe"]);
  });

  it("treats an existing name as the same person, also with other capital letters", () => {
    let book = add(bookWith("Family", "Work"), "Family", "Anna");
    book = add(book, "Work", "ANNA");
    expect(book.players).toEqual(["Anna"]);
    expect(book.groups.map((group) => group.members)).toEqual([["Anna"], ["Anna"]]);
  });

  it("refuses a player who is in the group already, a bad name and an unknown group", () => {
    const book = add(bookWith("Family"), "Family", "Anna");
    expect(addPlayerToGroup(book, "Family", " anna ")).toEqual({ ok: false, reason: "duplicate" });
    expect(addPlayerToGroup(book, "Family", "")).toEqual({ ok: false, reason: "empty" });
    expect(addPlayerToGroup(book, "Family", "a;b")).toEqual({ ok: false, reason: "invalid" });
    expect(addPlayerToGroup(book, "Nothing", "Ben")).toEqual({ ok: false, reason: "invalid" });
  });

  it("refuses a new player when the list is full", () => {
    const players = Array.from({ length: maxRosterPlayers }, (_, i) => `P${i}`);
    const book: PlayerBook = {
      groups: [{ name: "Family", members: players }],
      players,
    };
    expect(addPlayerToGroup(book, "Family", "Extra")).toEqual({ ok: false, reason: "full" });
  });
});

describe("removing", () => {
  it("keeps a player who is still in another group", () => {
    let book = add(bookWith("Family", "Work"), "Family", "Anna");
    book = add(book, "Work", "Anna");
    book = removePlayerFromGroup(book, "Family", "Anna");
    expect(book.players).toEqual(["Anna"]);
    expect(book.groups.map((group) => group.members)).toEqual([[], ["Anna"]]);
  });

  it("removes a player from the list when the last group is left", () => {
    let book = add(bookWith("Family"), "Family", "Anna");
    book = removePlayerFromGroup(book, "Family", "Anna");
    expect(book.players).toEqual([]);
  });

  it("deletes a group and the players who were only in it", () => {
    let book = add(bookWith("Family", "Work"), "Family", "Anna");
    book = add(book, "Family", "Ben");
    book = add(book, "Work", "Ben");
    book = removeGroup(book, "Family");
    expect(book.groups.map((group) => group.name)).toEqual(["Work"]);
    expect(book.players).toEqual(["Ben"]);
  });
});

describe("adoptUngroupedPlayers", () => {
  it("changes nothing when everybody is in a group", () => {
    const book = add(bookWith("Family"), "Family", "Anna");
    expect(adoptUngroupedPlayers(book, "Players")).toBe(book);
  });

  it("puts loose players into a group of their own", () => {
    const book = adoptUngroupedPlayers({ groups: [], players: ["Anna", "Ben"] }, "players");
    expect(book.groups).toEqual([{ name: "Players", members: ["Anna", "Ben"] }]);
  });

  it("puts loose players into the first group when there is no room for another", () => {
    const groups = groupsOf(...Array.from({ length: maxPlayerGroups }, (_, i) => `G${i}`));
    const book = adoptUngroupedPlayers({ groups, players: ["Anna"] }, "Players");
    expect(book.groups).toHaveLength(maxPlayerGroups);
    expect(book.groups[0]?.members).toEqual(["Anna"]);
  });

  it("changes nothing for loose players when there is no group at all and none can be made", () => {
    const book = { groups: [], players: ["Anna"] };
    expect(adoptUngroupedPlayers(book, "a,b")).toBe(book);
  });
});

describe("groupPlayers", () => {
  it("lists the players of a group in the order of the player list", () => {
    const groups: readonly PlayerGroup[] = [{ name: "Family", members: ["Cem", "Anna"] }];
    expect(groupPlayers(groups, "Family", roster)).toEqual(["Anna", "Cem"]);
    expect(groupPlayers(groups, "Nothing", roster)).toEqual([]);
  });
});

describe("parseSavedGroups", () => {
  it("keeps valid groups and only members that are in the player list", () => {
    const saved = [
      { name: "friends", members: ["Anna", "Zed", 5] },
      { name: "Friends", members: ["Ben"] },
      { name: "", members: [] },
      { name: 7 },
      null,
      "text",
      { name: "Work" },
    ];
    expect(parseSavedGroups(saved, roster)).toEqual([
      { name: "Friends", members: ["Anna"] },
      { name: "Work", members: [] },
    ]);
  });

  it("returns no groups for data that is not a list", () => {
    expect(parseSavedGroups({}, roster)).toEqual([]);
    expect(parseSavedGroups(undefined, roster)).toEqual([]);
  });
});
