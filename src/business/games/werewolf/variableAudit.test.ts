/**
 * An audit of the variable configuration: random walks through the boxes with only the moves the screen offers.
 * After every move the game must still be startable, every draw must keep to the boxes, the range and the wolf
 * counts, and the locks must tell the truth (what is open works, what is locked as "must" does not).
 */
import { expect, it } from "vitest";
import {
  availableWerewolfCounts,
  availableWerewolfRoles,
  standardWerewolfCount,
  validWerewolfRoles,
} from "./configuration";
import {
  describeVariableConfiguration,
  emptyVariableDraft,
  setVariableEntryState,
  setVariableItemState,
  setVariableRoleRange,
  toggleVariableWolfCount,
  variableEntries,
  variableItems,
  variableSelectionOf,
  type VariableDraft,
  type VariableState,
} from "./variableConfiguration";
import { drawVariableWerewolfLineup } from "./variableSetup";

/** A small seeded random generator, so a failure can be repeated. */
function rng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

const problems: string[] = [];
const note = (message: string) => {
  if (problems.length < 60) problems.push(message);
};
const stats = { blockedChecks: 0, draws: 0, moves: 0, states: 0 };

interface Id {
  readonly kind: "entry" | "item";
  readonly id: string;
}
const apply = (draft: VariableDraft, target: Id, state: VariableState) =>
  target.kind === "entry"
    ? setVariableEntryState(draft, target.id, state)
    : setVariableItemState(draft, target.id as "amulet" | "drunk", state);

function check(players: number, draft: VariableDraft, random: () => number, where: string) {
  stats.states += 1;
  const view = describeVariableConfiguration(players, draft);
  if (!view.supported) return;
  if (!view.canStart) {
    note(
      `${where}: ${players}p not startable although every move was allowed ${JSON.stringify({ s: draft.states, i: draft.items, w: draft.wolfCounts, r: draft.roleRange, p: view.problem })}`,
    );
    return;
  }
  const selection = variableSelectionOf(players, draft);
  const wolfCounts = selection.wolfCounts;
  const mustRoles = new Set(selection.requiredRoles ?? []);
  const poolRoles = new Set(selection.rolePool);
  for (let draw = 0; draw < 25; draw += 1) {
    stats.draws += 1;
    const result = drawVariableWerewolfLineup(players, selection, random, { ...draft.rules });
    if (!result.ok) {
      note(`${where}: ${players}p draw failed: ${result.reason}`);
      continue;
    }
    const { roles, settings } = result.lineup;
    for (const role of mustRoles) {
      if (!roles.includes(role)) note(`${where}: ${players}p must role ${role} missing`);
    }
    const optional = roles.filter((role) => !mustRoles.has(role));
    const families = new Set(optional.map((role) => (role === "nightGuest" ? "bodyguard" : role)));
    if (optional.some((role) => !poolRoles.has(role))) {
      note(`${where}: ${players}p a role outside of must and may was drawn: ${roles.join(",")}`);
    }
    if (
      families.size < selection.roleRange.minimum ||
      families.size > selection.roleRange.maximum
    ) {
      note(
        `${where}: ${players}p ${families.size} may roles outside of ${selection.roleRange.minimum}-${selection.roleRange.maximum}`,
      );
    }
    if (!wolfCounts.includes(settings.wolfCount))
      note(`${where}: ${players}p wolf count ${settings.wolfCount}`);
    if (!validWerewolfRoles(players, roles, settings.wolfCount)) {
      note(`${where}: ${players}p invalid lineup ${roles.join(",")} wolves ${settings.wolfCount}`);
    }
    if (roles.length + settings.wolfCount + 1 > players)
      note(`${where}: ${players}p too many seats`);
    // The options: a must entry fixes its option, may entries allow only their options.
    for (const entry of variableEntries) {
      if (!entry.option || !roles.includes(entry.role)) continue;
      const states = variableEntries
        .filter((other) => other.role === entry.role)
        .map((other) => [other, draft.states[other.id] ?? "not"] as const);
      const allowed = states.some(([, state]) => state === "must")
        ? states.filter(([, state]) => state === "must").map(([other]) => other.option?.value)
        : states.filter(([, state]) => state === "may").map(([other]) => other.option?.value);
      const used = (settings as Record<string, unknown>)[entry.option.key];
      if (!allowed.includes(used as string | boolean)) {
        note(`${where}: ${players}p option ${entry.option.key}=${String(used)} not allowed`);
      }
    }
    for (const item of variableItems) {
      const state = draft.items[item];
      const present = result.items.includes(item);
      if (state === "must" && !present) note(`${where}: ${players}p must item ${item} missing`);
      if (state === "not" && present) note(`${where}: ${players}p not item ${item} drawn`);
    }
  }
}

/** The locks must say the truth: what is open can be done, what is locked cannot. */
function checkLocks(players: number, draft: VariableDraft, where: string) {
  const view = describeVariableConfiguration(players, draft);
  if (!view.supported || !view.canStart) return;
  const targets: readonly (readonly [
    Id,
    { lock: string | null; mustBlocked: boolean; state: VariableState },
  ])[] = [
    ...view.entries.map(
      (entry) => [{ id: entry.entry.id, kind: "entry" as const }, entry] as const,
    ),
    ...view.items.map((item) => [{ id: item.item, kind: "item" as const }, item] as const),
  ];
  for (const [target, current] of targets) {
    for (const state of ["must", "may"] as const) {
      if (current.state === state) continue;
      const open = current.lock === null && !(state === "must" && current.mustBlocked);
      const after = describeVariableConfiguration(players, apply(draft, target, state));
      stats.blockedChecks += 1;
      if (open && !after.canStart) {
        note(
          `${where}: ${players}p ${target.id}->${state} is open but leaves a game that cannot start ${JSON.stringify({ s: draft.states, i: draft.items, w: draft.wolfCounts, r: draft.roleRange })}`,
        );
      }
      if (
        !open &&
        after.canStart &&
        current.lock !== null &&
        state === "must" &&
        current.lock !== "requiredOption" &&
        current.lock !== "requiredAlternative"
      ) {
        note(
          `${where}: ${players}p ${target.id}->${state} is locked (${String(current.lock)}) but would work`,
        );
      }
    }
  }
}

it("audit: random walks through the boxes keep the logic and the draw consistent", () => {
  const random = rng(20261120);
  for (let players = 7; players <= 20; players += 1) {
    for (let walk = 0; walk < 8; walk += 1) {
      let draft = emptyVariableDraft;
      check(players, draft, random, "start");
      for (let step = 0; step < 22; step += 1) {
        const view = describeVariableConfiguration(players, draft);
        if (!view.supported) break;
        const roll = random();
        if (roll < 0.08 && view.wolf.choice) {
          const option = view.wolf.options[Math.floor(random() * view.wolf.options.length)]!;
          // The screen offers a wolf count that is not chosen only when a game is possible with it.
          if (!option.selected && !option.canStart) continue;
          draft = toggleVariableWolfCount(draft, players, option.count);
        } else if (roll < 0.16) {
          // The steppers stay inside what the screen allows.
          const possible = view.possibleRange;
          if (!possible) continue;
          const lowest = possible.minimum;
          const highest = Math.min(view.range.maximum, view.minimumCeiling);
          const least = lowest + Math.floor(random() * Math.max(0, highest - lowest + 1));
          const lowestMost = Math.max(least, view.maximumFloor);
          const most =
            lowestMost + Math.floor(random() * Math.max(0, possible.maximum - lowestMost + 1));
          draft = setVariableRoleRange(draft, least, random() < 0.3 ? null : most);
        } else {
          const shown = [
            ...view.entries.map((entry) => ({
              id: { id: entry.entry.id, kind: "entry" as const },
              v: entry,
            })),
            ...view.items.map((item) => ({
              id: { id: item.item, kind: "item" as const },
              v: item,
            })),
          ];
          const picked = shown[Math.floor(random() * shown.length)];
          if (!picked) continue;
          const state = (["must", "may", "not"] as const)[Math.floor(random() * 3)]!;
          const allowed =
            state === "not" ||
            (picked.v.lock === null && !(state === "must" && picked.v.mustBlocked));
          if (!allowed) continue;
          draft = apply(draft, picked.id, state);
          stats.moves += 1;
        }
        check(players, draft, random, `p${players} walk${walk} step${step}`);
        if (step % 4 === 0) checkLocks(players, draft, `p${players} walk${walk} step${step}`);
      }
    }
  }
  expect(problems).toEqual([]);
}, 120_000);

it("audit: what is shown for every number of players", () => {
  const shownProblems: string[] = [];
  for (let players = 7; players <= 20; players += 1) {
    const view = describeVariableConfiguration(players, emptyVariableDraft);
    const shownRoles = [...new Set(view.entries.map((entry) => entry.entry.role))].sort();
    const expected = [...availableWerewolfRoles(players)].sort();
    if (JSON.stringify(shownRoles) !== JSON.stringify(expected)) {
      shownProblems.push(
        `${players}p roles shown ${shownRoles.join(",")} expected ${expected.join(",")}`,
      );
    }
    const hammer = view.entries.some((entry) => entry.entry.id === "mayor:hammer");
    if (hammer !== players >= 10) shownProblems.push(`${players}p hammer shown=${String(hammer)}`);
    const counts = view.wolf.options.map((option) => option.count);
    if (JSON.stringify(counts) !== JSON.stringify(availableWerewolfCounts(players))) {
      shownProblems.push(`${players}p wolf counts ${counts.join(",")}`);
    }
    const chosen = view.wolf.options
      .filter((option) => option.selected)
      .map((option) => option.count);
    if (JSON.stringify(chosen) !== JSON.stringify([standardWerewolfCount(players)])) {
      shownProblems.push(`${players}p default wolf count ${chosen.join(",")}`);
    }
    const items = view.items.map((item) => item.item).sort();
    const expectedItems = [players >= 10 ? "amulet" : "", players >= 9 ? "drunk" : ""].filter(
      Boolean,
    );
    if (JSON.stringify(items) !== JSON.stringify(expectedItems.sort())) {
      shownProblems.push(`${players}p items ${items.join(",")}`);
    }
    if (!view.canStart && players >= 7) shownProblems.push(`${players}p empty draft cannot start`);
  }
  expect(shownProblems).toEqual([]);
});
