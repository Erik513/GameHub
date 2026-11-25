import { defineRole } from "./define";

export const tanner = defineRole({
  id: "tanner",
  variant: (settings) => settings.tanner,
  // In the configuration: the minimum number of players, the place on the screens, the options.
  setup: {
    minPlayers: 8,
    order: 8,
    options: {
      key: "tanner",
      values: [
        { id: "anyDeath", value: "anyDeath" },
        { id: "voteOnly", value: "voteOnly" },
      ],
    },
  },
});
