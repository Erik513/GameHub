/**
 * All states a person can carry, in the order of their slots on the card of the role and in the overview of all players.
 * A new state needs its place here, its rule in the file of its role (or with the common states in `cardEffects.ts`),
 * its look (drawing and color) and its text in the presentation; the compiler and the tests report a missing part.
 */
export const stateIds = [
  "lovers",
  "amulet",
  "attacked",
  "protected",
  "protectedSaved",
  "guest",
  "guestSaved",
  "inspected",
  "investigated",
  "healed",
  "spellHealed",
  "poisoned",
  "hammered",
  "spellKilled",
  "silenced",
  "drunk",
  "twoVotes",
] as const;
