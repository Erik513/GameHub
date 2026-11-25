import { expect, it } from "vitest";
import { describeNarratorCard } from "./narratorCard";
import { roleVariantOf } from "./roleVariant";
import { createWerewolf, type WerewolfState } from "./stateMachine";

/**
 * Safety net for the restructuring to one definition per role: the table of what each role shows (buttons, marks,
 * variant) is stored as a snapshot and must not change while the code behind it is moved.
 */

const names = "Anna,Ben,Cleo,Dora,Emil,Finn,Gina,Hans,Ida,Jan,Kim,Lea";

function game(
  roles: Parameters<typeof createWerewolf>[3] = [],
  settings: Parameters<typeof createWerewolf>[4] = {},
) {
  return createWerewolf(names, "Max", () => 0.3, roles, settings)!;
}

function at(state: WerewolfState, step: Record<string, unknown>): WerewolfState {
  return { ...state, ...step };
}

function shown(state: WerewolfState) {
  const card = describeNarratorCard(state);
  return card === null
    ? null
    : {
        abilities: card.abilities,
        covered: card.covered ?? null,
        effects: card.effects,
        role: card.role,
        variant: card.variant ?? null,
      };
}

it("keeps the table of the buttons and marks of every role", () => {
  const base = game([], { mayor: "hammer" });
  const person = base.players[0]!;
  const other = base.players[1]!;
  const fields: Record<string, Record<string, unknown>> = {
    amuletPass: { amulet: { holder: person.name, mustPass: true }, poisoned: null, victim: null },
    hunter: { hunter: person, next: "day" },
    lovers: { lovers: [person.name, other.name] },
  };
  const steps = [
    "wolves",
    "seer",
    "vision",
    "investigator",
    "investigation",
    "bodyguard",
    "nightGuest",
    "cupid",
    "lovers",
    "spellcaster",
    "hunter",
    "amuletPass",
    "mayor",
    "day",
    "morning",
  ];
  const table: Record<string, unknown> = {};
  for (const night of [1, 2])
    for (const status of steps)
      table[`${status} night ${night}`] = shown(
        at(base, { ...fields[status], night, status, victim: null }),
      );
  table["investigator used"] = shown(at(base, { investigationUsed: true, status: "investigator" }));
  table["mayor used"] = shown(at(base, { hammerUsed: true, night: 2, status: "mayor" }));
  const doubleVote = game([], { mayor: "doubleVote" });
  table["mayor double vote"] = shown(at(doubleVote, { night: 2, status: "mayor" }));
  table["wolves first night attacking"] = shown(
    at(game([], { attackOnFirstNight: true }), { status: "wolves" }),
  );
  // The witch and the magician: potions and spells left, with and without an attacked person.
  const witch = game(["witch"]);
  for (const heal of [true, false])
    for (const poison of [true, false])
      for (const attacked of [true, false])
        table[`witch heal ${heal} poison ${poison} attacked ${attacked}`] = shown(
          at(witch, {
            potions: { heal, poison },
            status: "witch",
            victim: null,
            wolfTarget: attacked ? person : null,
          }),
        );
  const magician = game(["magician"]);
  for (const spellsRemaining of [2, 1, 0])
    for (const attacked of [true, false])
      table[`magician spells ${spellsRemaining} attacked ${attacked}`] = shown(
        at(magician, {
          spellsRemaining,
          status: "magician",
          victim: null,
          wolfTarget: attacked ? person : null,
        }),
      );
  // Every mark a person can carry, on the awake person.
  const marked = at(game(["witch", "mayor"], { amulet: true, mayor: "doubleVote" }), {
    status: "witch",
    victim: null,
  });
  const awake = marked.players.find((p) => p.role === "witch")!;
  const mayor = marked.players.find((p) => p.role === "mayor")!;
  table["all marks on the witch"] = shown(
    at(marked, {
      amulet: { holder: awake.name, mustPass: false },
      healedPlayer: awake.name,
      hostPlayer: awake.name,
      inspections: [
        { by: "Anna", kind: "seer", target: awake.name },
        { by: "Anna", kind: "investigator", target: awake.name },
      ],
      lovers: [awake.name, other.name],
      protectedPlayer: awake.name,
      silencedPlayer: awake.name,
      spellHealedPlayer: awake.name,
      spellVictims: [awake],
      hammerVictim: awake.name,
      wolfTarget: awake,
    }),
  );
  table["the mayor with the double vote"] = shown(
    at(game(["mayor"], { mayor: "doubleVote" }), { night: 2, status: "mayor" }),
  );
  table["mayor name"] = mayor.name;
  expect(table).toMatchSnapshot();
});

it("keeps the table of the variants of every role", () => {
  const table: Record<string, unknown> = {};
  const roles = ["toughGuy", "hunter", "tanner", "mayor", "spellcaster", "wolf", "seer", "witch"];
  for (const toughGuy of ["wolfOnly", "anyAttack"] as const)
    for (const hunterShot of ["optional", "required"] as const)
      for (const tanner of ["anyDeath", "voteOnly"] as const)
        for (const mayor of ["doubleVote", "hammer"] as const)
          for (const allowSelfSilence of [true, false])
            table[`${toughGuy} ${hunterShot} ${tanner} ${mayor} ${allowSelfSilence}`] = roles.map(
              (role) =>
                roleVariantOf(role, { allowSelfSilence, hunterShot, mayor, tanner, toughGuy }),
            );
  expect(table).toMatchSnapshot();
});
