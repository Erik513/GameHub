/**
 * All states a person can carry, in the order of their slots on the card of the role and in the overview of all players.
 * Both fill from the right: the first state of the list stands at the right. The states that stay until the person is
 * out come first (the drunk at the very right, then the amulet), so they never change their place; the states of one
 * night follow to the left of them, in the order in which they happen in the night.
 * A new state needs its place here, its rule in the file of its role (or with the common states in `cardEffects.ts`),
 * its look (drawing and color) and its text in the presentation; the compiler and the tests report a missing part.
 */
export const stateIds = [
  // Until the person is out.
  "drunk",
  "amulet",
  "lovers",
  "twoVotes",
  "inspected",
  "investigated",
  // One night, in the order of the night.
  "protected",
  "protectedSaved",
  "guest",
  "guestSaved",
  "attacked",
  "healed",
  "poisoned",
  "spellHealed",
  "spellKilled",
  "hammered",
  "silenced",
] as const;
