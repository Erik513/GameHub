export type GameAvailability = "available" | "preview" | "planned";
export type GameAccent = "blue" | "coral" | "amber" | "mint" | "violet";
export type GameTranslationKey = "taboo" | "cards" | "charades" | "quiz" | "whoAmI";

export interface GameModuleDescriptor {
  readonly accent: GameAccent;
  readonly availability: GameAvailability;
  readonly id: string;
  readonly route: `/games/${string}`;
  readonly translationKey: GameTranslationKey;
}

export const gameCatalog = [
  {
    id: "taboo",
    route: "/games/taboo",
    translationKey: "taboo",
    availability: "preview",
    accent: "coral",
  },
  {
    id: "cards",
    route: "/games/cards",
    translationKey: "cards",
    availability: "planned",
    accent: "blue",
  },
  {
    id: "charades",
    route: "/games/charades",
    translationKey: "charades",
    availability: "planned",
    accent: "amber",
  },
  {
    id: "quiz",
    route: "/games/quiz",
    translationKey: "quiz",
    availability: "planned",
    accent: "mint",
  },
  {
    id: "who-am-i",
    route: "/games/who-am-i",
    translationKey: "whoAmI",
    availability: "planned",
    accent: "violet",
  },
] as const satisfies readonly GameModuleDescriptor[];

export function findGameByRoute(route: string): GameModuleDescriptor | undefined {
  return gameCatalog.find((game) => game.route === route);
}
