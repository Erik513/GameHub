import { expect, it } from "vitest";
import { deathTimeOfCause, inOrderOfDeath } from "./deathOrder";

const own = (entries: Record<string, number>) => new Map(Object.entries(entries));

it("names the people in the order of the night: tough guy, wolves, witch, magician, hammer", () => {
  expect(
    inOrderOfDeath(
      ["Ada", "Bea", "Cam", "Dan", "Eva"],
      own({
        Ada: deathTimeOfCause.hammer,
        Bea: deathTimeOfCause.magicianKill,
        Cam: deathTimeOfCause.toughGuy,
        Dan: deathTimeOfCause.witchPoison,
        Eva: deathTimeOfCause.wolves,
      }),
      null,
    ),
  ).toEqual(["Cam", "Eva", "Dan", "Bea", "Ada"]);
});

it("puts the one who dies of heartbreak right after the lover who died first", () => {
  expect(
    inOrderOfDeath(
      ["Ada", "Bea", "Cam"],
      own({ Cam: deathTimeOfCause.wolves, Bea: deathTimeOfCause.magicianKill }),
      ["Ada", "Cam"],
    ),
  ).toEqual(["Cam", "Ada", "Bea"]);
});

it("keeps the first death: a later attack on the partner does not move him", () => {
  // Cam dies of the wolves, Ada follows of heartbreak; later the witch kills Bea and the magician kills Ada.
  expect(
    inOrderOfDeath(
      ["Ada", "Bea", "Cam"],
      own({
        Ada: deathTimeOfCause.magicianKill,
        Bea: deathTimeOfCause.witchPoison,
        Cam: deathTimeOfCause.wolves,
      }),
      ["Ada", "Cam"],
    ),
  ).toEqual(["Cam", "Ada", "Bea"]);
});

it("lets an attack that comes earlier than the heartbreak count (a lover attacked by the wolves and by the hammer)", () => {
  expect(
    inOrderOfDeath(
      ["Ada", "Bea"],
      own({ Ada: deathTimeOfCause.wolves, Bea: deathTimeOfCause.hammer }),
      ["Ada", "Bea"],
    ),
  ).toEqual(["Ada", "Bea"]);
});

it("puts the lover of the tough guy right after the delayed death, before the wolves", () => {
  expect(
    inOrderOfDeath(
      ["Ada", "Bea", "Cam"],
      own({ Ada: deathTimeOfCause.toughGuy, Cam: deathTimeOfCause.wolves }),
      ["Ada", "Bea"],
    ),
  ).toEqual(["Ada", "Bea", "Cam"]);
});
