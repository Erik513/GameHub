export type GameAvailability = "available" | "preview" | "planned";
export type GameAccent = "blue" | "coral" | "amber" | "mint" | "violet";
export type GameTranslationKey =
  "taboo" | "wordBomb" | "imposter" | "werewolf" | "liarsBar" | "schwimmen";

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
    availability: "available",
    accent: "blue",
  },
  {
    id: "word-bomb",
    route: "/games/word-bomb",
    translationKey: "wordBomb",
    availability: "planned",
    accent: "coral",
  },
  {
    id: "imposter",
    route: "/games/imposter",
    translationKey: "imposter",
    availability: "planned",
    accent: "coral",
  },
  {
    id: "werewolf",
    route: "/games/werewolf",
    translationKey: "werewolf",
    availability: "preview",
    accent: "coral",
  },
  {
    id: "liars-bar",
    route: "/games/liars-bar",
    translationKey: "liarsBar",
    availability: "planned",
    accent: "coral",
  },
  {
    id: "schwimmen",
    route: "/games/schwimmen",
    translationKey: "schwimmen",
    availability: "planned",
    accent: "coral",
  },
] as const satisfies readonly GameModuleDescriptor[];

/**
 * Whether the game can be opened. A finished game (`available`) can always be opened. A game in
 * development (`preview`) can only be opened while developing (the development server), never in the
 * published app: it becomes playable when it is finished and published as `available`. A planned game
 * cannot be opened.
 */
export function isGameOpenable(
  game: Pick<GameModuleDescriptor, "availability">,
  development: boolean = import.meta.env.DEV,
): boolean {
  return game.availability === "available" || (game.availability === "preview" && development);
}

export function findGameByRoute(route: string): GameModuleDescriptor | undefined {
  return gameCatalog.find((game) => game.route === route);
}
