import { expect, it } from "vitest";
import type { CardAbility } from "../../business/games/werewolf/narratorCard";
import { abilityLookOf } from "./abilityLook";

const base: CardAbility = { available: true, id: "heal", symbol: "heal" };

it("looks ready while the ability can be used, and dim when it is not its turn", () => {
  expect(abilityLookOf(base, false, false)).toBe("ready");
  expect(abilityLookOf(base, false, true)).toBe("dim");
});

it("looks used up at once when an ability that is used up by using it was used, but only dim when it is there every night", () => {
  const potion: CardAbility = { ...base, consumable: true };
  expect(abilityLookOf(potion, false, true, true)).toBe("used");
  expect(abilityLookOf(base, false, true, true)).toBe("dim");
  expect(abilityLookOf(potion, false, true, false)).toBe("dim");
});

it("looks used up for good before anything else, and blocked when it is not possible now", () => {
  const used: CardAbility = { ...base, available: false, unavailable: "used" };
  expect(abilityLookOf(used, false, true)).toBe("used");
  const blocked: CardAbility = { ...base, available: false, unavailable: "blocked" };
  expect(abilityLookOf(blocked, false, true)).toBe("blocked");
  expect(abilityLookOf(base, true, true)).toBe("blocked");
  expect(abilityLookOf({ ...base, available: false }, false, false)).toBe("blocked");
});
