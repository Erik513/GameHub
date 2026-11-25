import { defineRole } from "./define";

export const toughGuy = defineRole({
  id: "toughGuy",
  variant: (settings) => settings.toughGuy,
  cardEffects: {
    // Attacked and still alive: he dies at the end of the next night.
    wounded: ({ person }) => person.delayedDeathNight !== null,
  },
  // In the configuration: the minimum number of players, the place on the screens, the options.
  setup: {
    minPlayers: 7,
    order: 7,
    options: {
      key: "toughGuy",
      values: [
        { id: "wolfOnly", value: "wolfOnly" },
        { id: "anyAttack", value: "anyAttack" },
      ],
    },
  },
});
