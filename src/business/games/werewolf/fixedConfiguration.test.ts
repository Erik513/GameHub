import { describe, expect, it } from "vitest";
import {
  chooseFixedAlternative,
  chooseFixedVariant,
  defaultFixedSettings,
  describeFixedConfiguration,
  emptyFixedDraft,
  fixedConfigurationSettings,
  fixedItems,
  isConfigurablePlayerCount,
  normalizeFixedDraft,
  parseSavedFixedDraft,
  selectedWolfCount,
  setFixedSetting,
  setFixedWolfCount,
  toggleFixedRole,
  type FixedDraft,
} from "./fixedConfiguration";

const view = (players: number, draft: FixedDraft = emptyFixedDraft) =>
  describeFixedConfiguration(players, draft);
const itemOf = (players: number, id: string, draft: FixedDraft = emptyFixedDraft) =>
  view(players, draft).items.find((entry) => entry.id === id)!;

describe("the number of players", () => {
  it("is configurable from 6 to 20", () => {
    expect([5, 6, 20, 21, 7.5].map(isConfigurablePlayerCount)).toEqual([
      false,
      true,
      true,
      false,
      false,
    ]);
    const outside = view(4);
    expect(outside.supported).toBe(false);
    expect(outside.ready).toBe(false);
    expect(outside.issues).toEqual([{ code: "players", count: 4 }]);
    expect(outside.villagers).toBeNull();
  });
});

describe("the wolf count", () => {
  it("starts with the standard count and shows it fixed when there is no choice", () => {
    for (const players of [6, 9, 10, 13]) {
      const { wolf } = view(players);
      expect(wolf.fixed).toBe(true);
      expect(wolf.options.some((option) => option.recommended)).toBe(false);
    }
    expect(view(9).wolf.selected).toBe(2);
  });

  it("offers several counts with the standard selected and keeps a pick", () => {
    const seven = view(7);
    expect(seven.wolf.fixed).toBe(false);
    expect(seven.wolf.options.map((option) => option.count)).toEqual([1, 2]);
    expect(seven.wolf.selected).toBe(1);
    const picked = setFixedWolfCount(emptyFixedDraft, 2);
    expect(selectedWolfCount(picked, 7)).toBe(2);
    expect(view(7, picked).wolf.options.find((option) => option.selected)?.count).toBe(2);
  });

  it("marks one recommendation next to the selection, never a second one", () => {
    const strong = [..."witch,hunter,cupid".split(",")] as never[];
    const draft: FixedDraft = { ...emptyFixedDraft, roles: strong };
    const options = view(7, draft).wolf.options;
    expect(options.filter((option) => option.recommended)).toHaveLength(1);
    // The recommendation does not replace the pick.
    expect(options.find((option) => option.selected)?.count).toBe(1);
  });

  it("shows no recommendation when the draft cannot be played", () => {
    const draft: FixedDraft = {
      ...emptyFixedDraft,
      roles: ["witch", "hunter", "idiot", "bodyguard", "cupid", "toughGuy"],
    };
    expect(view(7, draft).wolf.options.every((option) => !option.recommended)).toBe(true);
  });
});

describe("the villagers", () => {
  it("fill the free places: players minus wolves, the seer and the roles", () => {
    expect(view(9).villagers).toBe(6);
    expect(view(9, { ...emptyFixedDraft, roles: ["witch", "hunter"] }).villagers).toBe(4);
  });

  it("show no number while the roles do not fit", () => {
    const draft: FixedDraft = {
      ...emptyFixedDraft,
      roles: ["witch", "hunter", "idiot", "bodyguard", "cupid", "toughGuy"],
    };
    const result = view(7, draft);
    expect(result.villagers).toBeNull();
    expect(result.ready).toBe(false);
    expect(result.issues).toContainEqual({ code: "noSeat", roles: 6 });
  });
});

describe("the locks of the roles", () => {
  it("locks a role with too few players and unlocks it at its minimum", () => {
    expect(itemOf(6, "cupid").lock).toBe("minimumPlayers");
    expect(itemOf(7, "cupid").lock).toBeNull();
    expect(itemOf(10, "magician").lock).toBe("minimumPlayers");
    expect(itemOf(11, "magician").lock).toBeNull();
  });

  it("gives every role the minimum of its row", () => {
    expect(fixedItems.map((entry) => [entry.id, entry.minimum])).toEqual([
      ["witch", 6],
      ["hunter", 6],
      ["idiot", 6],
      ["guard", 6],
      ["cupid", 7],
      ["toughGuy", 7],
      ["tanner", 8],
      ["apprenticeSeer", 8],
      ["spellcaster", 9],
      ["mayor", 9],
      ["paranormalInvestigator", 10],
      ["magician", 11],
    ]);
  });

  it("locks the magician with the witch unless the chosen wolf count lets them play together", () => {
    const withWitch: FixedDraft = { ...emptyFixedDraft, roles: ["witch"] };
    // Where they never play together.
    expect(itemOf(12, "magician", withWitch).lock).toBe("combination");
    // At 14 players only with four wolves: with the standard three the magician is locked,
    // with four it can be added.
    expect(itemOf(14, "magician", withWitch).lock).toBe("combination");
    expect(itemOf(14, "magician", setFixedWolfCount(withWitch, 4)).lock).toBeNull();
  });

  it("names the witch or the magician as the reason only while it really keeps the other out", () => {
    const withWitch: FixedDraft = { ...emptyFixedDraft, roles: ["witch"] };
    const withMagician: FixedDraft = { ...emptyFixedDraft, roles: ["magician"] };
    // Where they never play together, the chosen one is the reason.
    expect(itemOf(12, "magician", withWitch).blockedBy).toBe("witch");
    expect(itemOf(12, "witch", withMagician).blockedBy).toBe("magician");
    // With nothing chosen, or with another role chosen, nothing keeps them out.
    expect(itemOf(12, "magician").blockedBy).toBeNull();
    expect(itemOf(12, "magician", { ...emptyFixedDraft, roles: ["hunter"] }).blockedBy).toBeNull();
    // Where they are allowed together (14 players, four wolves) there is no reason to name.
    expect(itemOf(14, "magician", setFixedWolfCount(withWitch, 4)).blockedBy).toBeNull();
    // The chosen role itself is never blocked, and no other role has a rival.
    expect(itemOf(12, "witch", withWitch).blockedBy).toBeNull();
    expect(itemOf(12, "hunter", withWitch).blockedBy).toBeNull();
  });

  it("locks a role when no place is free", () => {
    const full: FixedDraft = {
      ...emptyFixedDraft,
      roles: ["witch", "hunter", "idiot", "bodyguard", "cupid"],
    };
    // Six players: one wolf, the seer and five roles are six, so one more has no place.
    expect(itemOf(7, "toughGuy", full).lock).toBe("noSeat");
  });

  it("never shows a chosen role as locked", () => {
    const draft: FixedDraft = { ...emptyFixedDraft, roles: ["magician"] };
    const entry = itemOf(8, "magician", draft);
    expect(entry.selected).toBe(true);
    expect(entry.lock).toBeNull();
  });
});

describe("the choices", () => {
  it("toggles a role on and off", () => {
    const on = toggleFixedRole(emptyFixedDraft, "witch");
    expect(on.roles).toEqual(["witch"]);
    expect(itemOf(8, "witch", on).selected).toBe(true);
    expect(toggleFixedRole(on, "witch").roles).toEqual([]);
  });

  it("holds at most one of the bodyguard and the night guest", () => {
    const first = chooseFixedAlternative(emptyFixedDraft, ["bodyguard", "nightGuest"], "bodyguard");
    expect(itemOf(8, "guard", first).chosenRole).toBe("bodyguard");
    const second = chooseFixedAlternative(first, ["bodyguard", "nightGuest"], "nightGuest");
    expect(second.roles).toEqual(["nightGuest"]);
    expect(chooseFixedAlternative(second, ["bodyguard", "nightGuest"], null).roles).toEqual([]);
  });

  it("chooses a role by picking its variant, and no variant means no role", () => {
    const hunter = chooseFixedVariant(emptyFixedDraft, "hunter", "required");
    expect(hunter.roles).toEqual(["hunter"]);
    expect(hunter.settings.hunterShot).toBe("required");
    expect(itemOf(8, "hunter", hunter).variant).toBe("required");
    // Picking the free shot keeps a hunter in the game.
    const free = chooseFixedVariant(hunter, "hunter", "optional");
    expect(free.roles).toEqual(["hunter"]);
    expect(free.settings.hunterShot).toBe("optional");
    const none = chooseFixedVariant(free, "hunter", null);
    expect(none.roles).toEqual([]);
    expect(itemOf(8, "hunter", none).variant).toBeNull();
  });

  it("sets the other variants of the tanner, the mayor and the old hag", () => {
    const draft = chooseFixedVariant(
      chooseFixedVariant(
        chooseFixedVariant(emptyFixedDraft, "tanner", "voteOnly"),
        "mayor",
        "hammer",
      ),
      "spellcaster",
      "allowed",
    );
    expect(draft.settings).toMatchObject({
      allowSelfSilence: true,
      mayor: "hammer",
      tanner: "voteOnly",
    });
    expect(itemOf(10, "spellcaster", draft).variant).toBe("allowed");
    expect(chooseFixedVariant(draft, "spellcaster", "forbidden").settings.allowSelfSilence).toBe(
      false,
    );
    expect(chooseFixedVariant(draft, "mayor", "doubleVote").settings.mayor).toBe("doubleVote");
    expect(chooseFixedVariant(draft, "tanner", "anyDeath").settings.tanner).toBe("anyDeath");
  });

  it("locks the hammer of the mayor below ten players", () => {
    expect(itemOf(9, "mayor").lockedVariants).toEqual(["hammer"]);
    expect(itemOf(10, "mayor").lockedVariants).toEqual([]);
    expect(view(9).hammerAvailable).toBe(false);
    expect(view(10).hammerAvailable).toBe(true);
  });

  it("passes the party options to the logic with the wolf count", () => {
    const draft = setFixedSetting(
      setFixedSetting(emptyFixedDraft, "revealRoles", false),
      "attackOnFirstNight",
      true,
    );
    expect(fixedConfigurationSettings(draft, 9)).toMatchObject({
      attackOnFirstNight: true,
      revealRoles: false,
      wolfCount: 2,
    });
  });
});

describe("the extras", () => {
  it("lock the drunk below nine players and the amulet below ten", () => {
    const addon = (players: number, id: string) => view(players).addons.find((a) => a.id === id)!;
    expect(addon(8, "drunk").lock).toBe("minimumPlayers");
    expect(addon(9, "drunk").lock).toBeNull();
    expect(addon(9, "amulet").lock).toBe("minimumPlayers");
    expect(addon(10, "amulet").lock).toBeNull();
  });

  it("need two wolves for the drunk", () => {
    expect(view(9).addons.find((a) => a.id === "drunk")?.lock).toBeNull();
    const oneWolf = setFixedWolfCount(emptyFixedDraft, 1);
    expect(view(9, oneWolf).wolf.options[0]?.selected).toBe(false);
    const drunk = setFixedSetting(setFixedWolfCount(emptyFixedDraft, 2), "drunk", true);
    expect(view(9, drunk).ready).toBe(true);
  });

  it("report a chosen extra that the number of players no longer allows", () => {
    const draft = setFixedSetting(setFixedSetting(emptyFixedDraft, "drunk", true), "amulet", true);
    const result = view(8, draft);
    expect(result.issues).toContainEqual({ addon: "drunk", code: "addonMinimum", minimum: 9 });
    expect(result.issues).toContainEqual({ addon: "amulet", code: "addonMinimum", minimum: 10 });
    expect(result.ready).toBe(false);
  });
});

describe("the conflicts", () => {
  it("never changes the draft by itself when the players change", () => {
    const draft: FixedDraft = { ...emptyFixedDraft, roles: ["magician", "cupid"], wolfCount: 2 };
    const small = view(8, draft);
    expect(small.issues).toContainEqual({ code: "roleMinimum", minimum: 11, role: "magician" });
    // The chosen wolf count stays 2, though 8 players allow 1 and 2: still valid, so no wolf issue.
    expect(small.wolf.selected).toBe(2);
    expect(small.issues.some((issue) => issue.code === "wolfCount")).toBe(false);
  });

  it("reports a wolf count that the players do not allow and suggests one that fits", () => {
    const draft: FixedDraft = { ...emptyFixedDraft, wolfCount: 4 };
    const result = view(9, draft);
    expect(result.issues).toContainEqual({ code: "wolfCount", count: 4 });
    expect(result.suggestedWolfCount).toBe(2);
    expect(result.ready).toBe(false);
    expect(view(9, { ...draft, wolfCount: 2 }).ready).toBe(true);
  });

  it("asks for four wolves when witch and magician play together with 14 players", () => {
    const draft: FixedDraft = { ...emptyFixedDraft, roles: ["witch", "magician"], wolfCount: 3 };
    const result = view(14, draft);
    expect(result.ready).toBe(false);
    expect(result.issues).toContainEqual({ code: "combination", roles: ["witch", "magician"] });
    expect(result.suggestedWolfCount).toBe(4);
    expect(view(14, setFixedWolfCount(draft, 4)).ready).toBe(true);
  });

  it("reports a hammer below ten players", () => {
    const draft = chooseFixedVariant(emptyFixedDraft, "mayor", "hammer");
    const result = view(9, draft);
    expect(result.issues).toContainEqual({ code: "hammerMinimum", minimum: 10 });
    expect(view(10, draft).ready).toBe(true);
  });

  it("is ready for a plain draft with every number of players", () => {
    for (let players = 6; players <= 20; players++) {
      expect(view(players).ready).toBe(true);
    }
  });

  it("suggests nothing when no wolf count can help", () => {
    const draft: FixedDraft = { ...emptyFixedDraft, roles: ["magician"] };
    const result = view(8, draft);
    expect(result.suggestedWolfCount).toBeNull();
  });
});

describe("the draft stays playable", () => {
  const full: FixedDraft = {
    ...emptyFixedDraft,
    roles: ["witch", "hunter", "idiot", "cupid", "toughGuy"],
  };

  it("locks every other role when all places are taken, and frees them when a role is dropped", () => {
    // Seven players with one wolf and the seer: five places for roles, all used.
    const locked = view(7, full).items.filter((entry) => !entry.selected);
    expect(locked.every((entry) => entry.lock !== null)).toBe(true);
    expect(itemOf(7, "guard", full).lock).toBe("noSeat");
    const dropped = toggleFixedRole(full, "witch");
    expect(itemOf(7, "guard", dropped).lock).toBeNull();
    expect(view(7, full).ready).toBe(true);
  });

  it("does not offer a wolf count that would leave too few places for the chosen roles", () => {
    const options = view(7, full).wolf.options;
    expect(options.find((option) => option.count === 1)?.selectable).toBe(true);
    expect(options.find((option) => option.count === 2)?.selectable).toBe(false);
    // With fewer roles the second wolf can be picked.
    const fewer = toggleFixedRole(full, "witch");
    expect(view(7, fewer).wolf.options.find((option) => option.count === 2)?.selectable).toBe(true);
  });

  it("does not offer one wolf with the drunk, and does not offer the drunk with one wolf", () => {
    const drunk = setFixedSetting(emptyFixedDraft, "drunk", true);
    expect(view(9, drunk).ready).toBe(true);
    // At 12 players the wolves 2 and 3 are possible; the drunk needs two.
    const options = view(12, drunk).wolf.options;
    expect(options.every((option) => option.selectable)).toBe(true);
    const oneWolf = setFixedWolfCount(emptyFixedDraft, 1);
    expect(view(7, oneWolf).addons.find((entry) => entry.id === "drunk")?.lock).toBe(
      "minimumPlayers",
    );
  });

  it("keeps every choice of a long sequence of clicks playable", () => {
    // Choose roles one after the other wherever they are not locked: the draft never becomes invalid.
    for (const players of [6, 7, 9, 11, 14, 17, 20]) {
      let draft = emptyFixedDraft;
      for (let round = 0; round < 3; round++) {
        for (const entry of fixedItems) {
          const current = view(players, draft);
          const item = current.items.find((candidate) => candidate.id === entry.id)!;
          if (item.lock !== null) continue;
          draft =
            entry.kind === "alternative"
              ? chooseFixedAlternative(draft, entry.roles, entry.roles[0]!)
              : entry.kind === "variant"
                ? chooseFixedVariant(draft, entry.id as "hunter", "required")
                : toggleFixedRole(draft, entry.roles[0]!);
          expect(view(players, draft).ready).toBe(true);
        }
      }
    }
  });
});

describe("the draft follows the number of players", () => {
  it("keeps the draft when players are added or nothing has to change", () => {
    const draft: FixedDraft = { ...emptyFixedDraft, roles: ["witch", "tanner"] };
    expect(normalizeFixedDraft(8, draft)).toBe(draft);
    expect(normalizeFixedDraft(12, draft)).toBe(draft);
    // Below six players there is nothing to correct against.
    expect(normalizeFixedDraft(5, draft)).toBe(draft);
  });

  it("takes back the roles that unlock at the number of players that left", () => {
    const draft: FixedDraft = {
      ...emptyFixedDraft,
      roles: ["witch", "cupid", "tanner", "apprenticeSeer"],
    };
    // Eight players become seven: the roles from eight players go, the others stay.
    expect(normalizeFixedDraft(7, draft).roles).toEqual(["witch", "cupid"]);
    expect(normalizeFixedDraft(6, draft).roles).toEqual(["witch"]);
  });

  it("takes back the extras and the hammer below their minimum", () => {
    const draft = setFixedSetting(
      setFixedSetting(chooseFixedVariant(emptyFixedDraft, "mayor", "hammer"), "drunk", true),
      "amulet",
      true,
    );
    const ten = normalizeFixedDraft(10, draft);
    expect(ten).toBe(draft);
    const nine = normalizeFixedDraft(9, draft);
    expect(nine.settings).toMatchObject({ amulet: false, drunk: true, mayor: "doubleVote" });
    expect(nine.roles).toEqual(["mayor"]);
    const eight = normalizeFixedDraft(8, draft);
    expect(eight.roles).toEqual([]);
    expect(eight.settings.drunk).toBe(false);
  });

  it("resets a wolf count that is not allowed any more", () => {
    const draft = setFixedWolfCount(emptyFixedDraft, 4);
    expect(normalizeFixedDraft(14, draft).wolfCount).toBe(4);
    expect(normalizeFixedDraft(9, draft).wolfCount).toBeNull();
  });

  it("takes back roles from the bottom up while the places run out", () => {
    // Seven players with one wolf and five roles use every place; the narrator with six players
    // leaves four places, so the last roles go first.
    const full: FixedDraft = {
      ...emptyFixedDraft,
      roles: ["witch", "hunter", "idiot", "bodyguard"],
    };
    expect(normalizeFixedDraft(6, full).roles).toEqual(["witch", "hunter", "idiot", "bodyguard"]);
    const two = setFixedWolfCount({ ...full, roles: ["witch", "hunter", "idiot"] }, 2);
    // Six players allow one wolf only: the wolf count is reset, the roles stay.
    const six = normalizeFixedDraft(6, two);
    expect(six.wolfCount).toBeNull();
    expect(six.roles).toEqual(["witch", "hunter", "idiot"]);
  });

  it("always leaves a playable draft, whatever is taken away", () => {
    const everything: FixedDraft = {
      roles: [
        "witch",
        "hunter",
        "idiot",
        "bodyguard",
        "cupid",
        "toughGuy",
        "tanner",
        "apprenticeSeer",
        "spellcaster",
        "mayor",
        "paranormalInvestigator",
        "magician",
      ],
      settings: { ...defaultFixedSettings, amulet: true, drunk: true, mayor: "hammer" },
      wolfCount: 4,
    };
    for (let players = 20; players >= 6; players--) {
      const fixed = normalizeFixedDraft(players, everything);
      expect(view(players, fixed).issues).toEqual([]);
      // Taking players away step by step gives a playable draft every time.
      let draft = everything;
      for (let count = 20; count >= players; count--) draft = normalizeFixedDraft(count, draft);
      expect(view(players, draft).ready).toBe(true);
    }
  });
});

describe("a saved draft", () => {
  const draft: FixedDraft = {
    roles: ["witch", "hunter"],
    settings: { ...defaultFixedSettings, hunterShot: "required", amulet: true },
    wolfCount: 3,
  };

  it("comes back as it was written to the storage", () => {
    expect(parseSavedFixedDraft(JSON.parse(JSON.stringify(draft)))).toEqual(draft);
    expect(parseSavedFixedDraft(JSON.parse(JSON.stringify(emptyFixedDraft)))).toEqual(
      emptyFixedDraft,
    );
  });

  it.each([
    ["nothing", undefined],
    ["a text", "witch"],
    ["an unknown role", { ...draft, roles: ["witch", "dragon"] }],
    ["a role twice", { ...draft, roles: ["witch", "witch"] }],
    ["a setting of the wrong kind", { ...draft, settings: { ...draft.settings, mayor: "king" } }],
    ["a missing setting", { ...draft, settings: { amulet: true } }],
    ["a wolf count that is no number", { ...draft, wolfCount: "3" }],
  ])("is refused with %s", (_name, raw) => {
    expect(parseSavedFixedDraft(raw)).toBeUndefined();
  });
});
