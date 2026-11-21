import { describe, expect, it } from "vitest";
import { availableWerewolfCounts } from "./configuration";
import {
  describeVariableConfiguration,
  emptyVariableDraft,
  normalizeVariableDraft,
  parseSavedVariableDraft,
  setVariableEntryState,
  setVariableItemState,
  setVariableRoleRange,
  toggleVariableWolfCount,
  variableSelectionOf,
  type VariableDraft,
} from "./variableConfiguration";

const put = (draft: VariableDraft, entries: Record<string, "may" | "must" | "not">) =>
  Object.entries(entries).reduce(
    (current, [id, state]) => setVariableEntryState(current, id, state),
    draft,
  );
const shown = (players: number, draft: VariableDraft = emptyVariableDraft) =>
  describeVariableConfiguration(players, draft).entries.map((view) => view.entry.id);

/** The example of the narrator: eight players, witch, hunter (both options) and Cupid may, the tough guy must. */
const example = put(emptyVariableDraft, {
  cupid: "may",
  "hunter:optional": "may",
  "hunter:required": "may",
  "toughGuy:wolfOnly": "must",
  witch: "may",
});

describe("the entries of the boxes", () => {
  it("shows no role that needs more players than there are, and no option that is not possible yet", () => {
    expect(shown(6)).not.toContain("toughGuy:wolfOnly");
    expect(shown(6)).not.toContain("magician");
    expect(shown(10)).toContain("paranormalInvestigator");
    expect(shown(10)).not.toContain("magician");
    expect(shown(11)).toContain("magician");
    // The hammer needs ten players; the double vote of the mayor is there from nine.
    expect(shown(9)).toContain("mayor:doubleVote");
    expect(shown(9)).not.toContain("mayor:hammer");
    expect(shown(10)).toContain("mayor:hammer");
  });

  it("gives every option of a role its own entry", () => {
    const ids = shown(12);
    expect(ids).toEqual(
      expect.arrayContaining([
        "hunter:required",
        "hunter:optional",
        "spellcaster:allowed",
        "spellcaster:forbidden",
      ]),
    );
  });

  it("starts with every entry in the box for roles that should not be in the game", () => {
    const view = describeVariableConfiguration(12, emptyVariableDraft);
    expect(view.entries.every((entry) => entry.state === "not")).toBe(true);
    expect(view.canStart).toBe(true);
  });

  it("offers the extras only for the players they need", () => {
    const items = (players: number) =>
      describeVariableConfiguration(players, emptyVariableDraft).items.map((view) => view.item);
    expect(items(8)).toEqual([]);
    expect(items(9)).toEqual(["drunk"]);
    expect(items(10)).toEqual(["drunk", "amulet"]);
  });
});

describe("moving an entry", () => {
  it("puts the other options of the role to 'not' when one is a must", () => {
    const draft = put(emptyVariableDraft, { "hunter:optional": "may", "hunter:required": "may" });
    const must = setVariableEntryState(draft, "hunter:required", "must");
    expect(must.states).toEqual({ "hunter:required": "must" });
  });

  it("lets both options be 'may', and a role of several options never counts twice", () => {
    const selection = variableSelectionOf(8, example);
    expect(selection.rolePool).toEqual(expect.arrayContaining(["hunter", "witch", "cupid"]));
    expect(selection.rolePool.filter((role) => role === "hunter")).toHaveLength(1);
    expect(selection.roleOptions?.hunterShot).toEqual(["required", "optional"]);
    expect(selection.requiredRoles).toEqual(["toughGuy"]);
    expect(selection.roleOptions?.toughGuy).toEqual(["wolfOnly"]);
  });

  it("puts the other guard to 'not' when one is a must, and locks it", () => {
    const draft = put(emptyVariableDraft, { nightGuest: "may" });
    const must = setVariableEntryState(draft, "bodyguard", "must");
    expect(must.states).toEqual({ bodyguard: "must" });
    const lock = describeVariableConfiguration(12, must).entries.find(
      (view) => view.entry.id === "nightGuest",
    );
    expect(lock?.lock).toBe("requiredAlternative");
  });

  it("locks the options of a role whose option is a must", () => {
    const view = describeVariableConfiguration(
      12,
      put(emptyVariableDraft, { "hunter:required": "must" }),
    );
    expect(view.entries.find((entry) => entry.entry.id === "hunter:optional")?.lock).toBe(
      "requiredOption",
    );
  });

  it("keeps the extras apart from each other", () => {
    const draft = setVariableItemState(
      setVariableItemState(emptyVariableDraft, "drunk", "must"),
      "amulet",
      "may",
    );
    const selection = variableSelectionOf(12, draft);
    expect(selection.requiredItems).toEqual(["drunk"]);
    expect(selection.itemPool).toEqual(["amulet"]);
  });
});

describe("the number of 'may' roles", () => {
  it("is 0 to 3 in the example, because the two options of the hunter count once", () => {
    const view = describeVariableConfiguration(8, example);
    expect(view.possibleRange).toEqual({ maximum: 3, minimum: 0 });
    expect(view.mayRoleCount).toBe(3);
    expect(view.range).toEqual({ maximum: 3, minimum: 0 });
  });

  it("follows the range the narrator sets, inside what is possible", () => {
    const set = setVariableRoleRange(example, 1, 2);
    expect(describeVariableConfiguration(8, set).range).toEqual({ maximum: 2, minimum: 1 });
    const tooBig = setVariableRoleRange(example, 0, 9);
    expect(describeVariableConfiguration(8, tooBig).range).toEqual({ maximum: 3, minimum: 0 });
    const tooHigh = setVariableRoleRange(example, 5, 9);
    expect(describeVariableConfiguration(8, tooHigh).range.minimum).toBeLessThanOrEqual(3);
  });

  it("never lets the maximum fall below the minimum", () => {
    expect(setVariableRoleRange(emptyVariableDraft, 3, 1).roleRange).toEqual({
      maximum: 3,
      minimum: 3,
    });
  });
});

describe("the wolves", () => {
  it("offers a choice only where the number of players allows one, with the standard chosen", () => {
    const counts7 = availableWerewolfCounts(7);
    const view = describeVariableConfiguration(7, emptyVariableDraft);
    expect(view.wolf.choice).toBe(counts7.length > 1);
    expect(view.wolf.options.map((option) => option.count)).toEqual([...counts7]);
    expect(view.wolf.options.filter((option) => option.selected)).toHaveLength(1);
    expect(view.wolf.options.filter((option) => option.recommended)).toHaveLength(1);
    expect(describeVariableConfiguration(6, emptyVariableDraft).wolf.choice).toBe(false);
  });

  it("draws among several chosen counts, and keeps at least one chosen", () => {
    const both = toggleVariableWolfCount(emptyVariableDraft, 7, 2);
    expect(both.wolfCounts).toEqual([1, 2]);
    expect(variableSelectionOf(7, both).wolfCounts).toEqual([1, 2]);
    const one = toggleVariableWolfCount(both, 7, 1);
    expect(one.wolfCounts).toEqual([2]);
    // The last chosen count cannot be taken out.
    expect(toggleVariableWolfCount(one, 7, 2)).toBe(one);
    // A count the players do not allow is ignored.
    expect(toggleVariableWolfCount(emptyVariableDraft, 7, 5)).toBe(emptyVariableDraft);
  });
});

describe("a change of the number of players", () => {
  it("takes the entries back that do not exist any more", () => {
    const draft = put(emptyVariableDraft, { magician: "may", witch: "must", cupid: "may" });
    const normalized = normalizeVariableDraft(8, draft);
    expect(normalized.states).toEqual({ cupid: "may", witch: "must" });
  });

  it("takes the extras back that need more players", () => {
    const draft = setVariableItemState(emptyVariableDraft, "amulet", "must");
    expect(normalizeVariableDraft(8, draft).items.amulet).toBe("not");
    expect(normalizeVariableDraft(12, draft).items.amulet).toBe("must");
  });

  it("drops the wolf counts that are not allowed and falls back to the standard", () => {
    const draft: VariableDraft = { ...emptyVariableDraft, wolfCounts: [4, 5] };
    expect(normalizeVariableDraft(8, draft).wolfCounts).toBeNull();
  });

  it("keeps the first of two musts that cannot stand together", () => {
    const draft: VariableDraft = {
      ...emptyVariableDraft,
      states: { bodyguard: "must", nightGuest: "must" },
    };
    expect(normalizeVariableDraft(12, draft).states).toEqual({ bodyguard: "must" });
  });
});

describe("what the logic says about the draft", () => {
  it("blocks the start for a combination that is not possible", () => {
    // Witch and magician as musts do not play together with 12 players.
    const draft = put(emptyVariableDraft, { magician: "must", witch: "must" });
    const view = describeVariableConfiguration(12, draft);
    expect(view.canStart).toBe(false);
    expect(view.problem).toBe("noLineup");
  });

  it("reports an unsupported number of players", () => {
    expect(describeVariableConfiguration(4, emptyVariableDraft).supported).toBe(false);
    expect(describeVariableConfiguration(21, emptyVariableDraft).entries).toEqual([]);
  });
});

describe("a saved draft", () => {
  it("comes back as it was written", () => {
    const draft = setVariableRoleRange(
      setVariableItemState(toggleVariableWolfCount(example, 7, 2), "drunk", "may"),
      1,
      2,
    );
    expect(parseSavedVariableDraft(JSON.parse(JSON.stringify(draft)))).toEqual(draft);
    expect(parseSavedVariableDraft(JSON.parse(JSON.stringify(emptyVariableDraft)))).toEqual(
      emptyVariableDraft,
    );
  });

  it.each([
    ["nothing", undefined],
    ["an unknown entry", { ...emptyVariableDraft, states: { dragon: "must" } }],
    ["a wrong state", { ...emptyVariableDraft, states: { witch: "maybe" } }],
    ["no items", { ...emptyVariableDraft, items: null }],
    ["a wrong range", { ...emptyVariableDraft, roleRange: { maximum: -1, minimum: 0 } }],
    ["wolf counts of the wrong kind", { ...emptyVariableDraft, wolfCounts: ["3"] }],
    ["an empty choice of wolf counts", { ...emptyVariableDraft, wolfCounts: [] }],
  ])("is refused with %s", (_name, raw) => {
    expect(parseSavedVariableDraft(raw)).toBeUndefined();
  });
});

describe("the seats of the must roles", () => {
  it("take no further role once the most roles for the players are set", () => {
    // Two roles wait on "may"; every other entry moves to "must" one after the other as long as the view takes it.
    let draft = put(emptyVariableDraft, { cupid: "may", witch: "may" });
    for (let step = 0; step < 30; step += 1) {
      const next = describeVariableConfiguration(8, draft).entries.find(
        (view) =>
          view.state === "not" &&
          view.lock === null &&
          !view.mustBlocked &&
          !["cupid", "witch"].includes(view.entry.id),
      );
      if (!next) break;
      draft = setVariableEntryState(draft, next.entry.id, "must");
    }
    const view = describeVariableConfiguration(8, draft);
    expect(view.canStart).toBe(true);
    // The roles on "may" cannot move to "must" any more (no seat), but they stay on "may" and can leave the game.
    const waiting = view.entries.filter((entry) => entry.state === "may");
    expect(waiting.length).toBeGreaterThan(0);
    expect(waiting.every((entry) => entry.mustBlocked)).toBe(true);
    const musts = view.entries.filter((entry) => entry.state === "must");
    expect(musts.every((entry) => !entry.mustBlocked)).toBe(true);
  });

  it("do not block anything while seats are free", () => {
    const draft = put(emptyVariableDraft, { witch: "may" });
    const view = describeVariableConfiguration(8, draft);
    expect(view.entries.some((entry) => entry.mustBlocked)).toBe(false);
    expect(view.items.some((item) => item.mustBlocked)).toBe(false);
  });
});

describe("the least number of may roles", () => {
  it("stays below the number of may roles, as drawing all of them equals must", () => {
    const one = setVariableRoleRange(put(emptyVariableDraft, { witch: "may" }), 1, 1);
    const view = describeVariableConfiguration(8, one);
    expect(view.range).toEqual({ maximum: 1, minimum: 0 });
    expect(view.minimumCeiling).toBe(0);
    expect(variableSelectionOf(8, one).roleRange.minimum).toBe(0);
    const two = setVariableRoleRange(put(emptyVariableDraft, { cupid: "may", witch: "may" }), 2, 2);
    const viewTwo = describeVariableConfiguration(8, two);
    expect(viewTwo.range.minimum).toBe(1);
    expect(viewTwo.minimumCeiling).toBe(1);
  });
});

describe("a draft saved before the choice 'reveal roles' was dropped", () => {
  it("is still read, and the old field is ignored", () => {
    const old = {
      ...(JSON.parse(JSON.stringify(emptyVariableDraft)) as Record<string, unknown>),
      rules: { attackOnFirstNight: true, revealRoles: false },
    };
    const parsed = parseSavedVariableDraft(old);
    expect(parsed?.rules).toEqual({ attackOnFirstNight: true });
  });
});

describe("the most may roles", () => {
  it("is never 0 while there are may roles and one can be drawn", () => {
    const one = put(emptyVariableDraft, { witch: "may" });
    // Even a saved "0 to 0" is raised to one, and the screen does not offer to go below one.
    const view = describeVariableConfiguration(8, setVariableRoleRange(one, 0, 0));
    expect(view.range).toEqual({ maximum: 1, minimum: 0 });
    expect(view.maximumFloor).toBe(1);
    expect(variableSelectionOf(8, setVariableRoleRange(one, 0, 0)).roleRange.maximum).toBe(1);
  });

  it("may be 0 where there is no may role at all", () => {
    const view = describeVariableConfiguration(8, emptyVariableDraft);
    expect(view.range.maximum).toBe(0);
    expect(view.maximumFloor).toBe(0);
  });
});

describe("the villagers the draw can leave", () => {
  it("is one number when nothing is drawn, and a range with wolf counts and may roles", () => {
    // 12 players, 3 wolves, the seer: 8 seats; the witch is a must role: 7 villagers.
    const fixed = describeVariableConfiguration(12, put(emptyVariableDraft, { witch: "must" }));
    expect(fixed.villagers).toEqual({ maximum: 7, minimum: 7 });
    // 14 players allow three or four wolves: two wolf counts and up to two may roles: the range grows on both sides.
    const wide = setVariableRoleRange(
      toggleVariableWolfCount(put(emptyVariableDraft, { cupid: "may", witch: "may" }), 14, 4),
      0,
      2,
    );
    const view = describeVariableConfiguration(14, wide);
    expect(view.villagers.maximum).toBeGreaterThan(view.villagers.minimum);
    expect(view.villagers.minimum).toBe(14 - 4 - 1 - 2);
    expect(view.villagers.maximum).toBe(14 - 3 - 1 - 0);
  });
});

describe("the recommended wolf count", () => {
  const everything = (players: number, minimum: number, maximum: number) => {
    let draft = emptyVariableDraft;
    for (const entry of describeVariableConfiguration(players, draft).entries) {
      draft = setVariableEntryState(draft, entry.entry.id, "may");
    }
    draft = setVariableItemState(setVariableItemState(draft, "amulet", "may"), "drunk", "may");
    return setVariableRoleRange(draft, minimum, maximum);
  };
  const recommended = (players: number, draft: VariableDraft) =>
    describeVariableConfiguration(players, draft).wolf.options.find((option) => option.recommended)
      ?.count;

  it("counts the roles that are drawn, not only the must roles", () => {
    // Twenty players: a draw that surely brings eleven special roles recommends more wolves than no special role.
    const none = recommended(20, emptyVariableDraft);
    const many = recommended(20, everything(20, 11, 11));
    expect(none).toBeDefined();
    expect(many).toBeDefined();
    expect(many!).toBeGreaterThan(none!);
  });

  it.each([12, 16, 20])(
    "does not jump when the most roles change one by one, but only rises (%s players)",
    (players) => {
      const base = everything(players, 0, 0);
      const counts: number[] = [];
      for (let maximum = 1; maximum <= 12; maximum += 1) {
        counts.push(recommended(players, setVariableRoleRange(base, 0, maximum))!);
      }
      // Never a step down, and never a step of more than one wolf.
      for (let index = 1; index < counts.length; index += 1) {
        expect(counts[index]!).toBeGreaterThanOrEqual(counts[index - 1]!);
        expect(counts[index]! - counts[index - 1]!).toBeLessThanOrEqual(1);
      }
    },
  );

  it("is the same every time for the same selection, and does not need long", () => {
    const draft = everything(20, 6, 11);
    const start = performance.now();
    const first = recommended(20, draft);
    expect(recommended(20, draft)).toBe(first);
    expect(performance.now() - start).toBeLessThan(3000);
  });
});
