import type { TabooCard } from "../business/games/taboo/model";

type Words = readonly [string, ...TabooCard["forbiddenWords"]];

const entries: readonly (readonly [string, TabooCard["difficulty"], Words, Words])[] = [
  [
    "everyday",
    "easy",
    ["Tasse", "Kaffee", "Henkel", "trinken"],
    ["Cup", "coffee", "handle", "drink"],
  ],
  [
    "everyday",
    "medium",
    ["Kühlschrank", "kalt", "Essen", "Küche"],
    ["Refrigerator", "cold", "food", "kitchen"],
  ],
  [
    "everyday",
    "hard",
    ["Pfandautomat", "Flasche", "Supermarkt", "Bon"],
    ["Bottle return machine", "deposit", "supermarket", "receipt"],
  ],
  ["nature", "easy", ["Hund", "bellen", "Leine", "Haustier"], ["Dog", "bark", "leash", "pet"]],
  [
    "nature",
    "medium",
    ["Wasserfall", "Fluss", "Höhe", "Felsen"],
    ["Waterfall", "river", "height", "rocks"],
  ],
  [
    "nature",
    "hard",
    ["Photosynthese", "Pflanze", "Licht", "Sauerstoff"],
    ["Photosynthesis", "plant", "light", "oxygen"],
  ],
  [
    "culture",
    "easy",
    ["Kino", "Film", "Leinwand", "Popcorn"],
    ["Cinema", "film", "screen", "popcorn"],
  ],
  [
    "culture",
    "medium",
    ["Orchester", "Dirigent", "Instrument", "Musik"],
    ["Orchestra", "conductor", "instrument", "music"],
  ],
  [
    "culture",
    "hard",
    ["Stummfilm", "Ton", "Chaplin", "Kino"],
    ["Silent film", "sound", "Chaplin", "cinema"],
  ],
];

export const tabooDemoCards: readonly TabooCard[] = entries.flatMap(
  ([categoryId, difficulty, german, english], index) =>
    (["de", "en"] as const).map((language) => {
      const [term, ...forbiddenWords] = language === "de" ? german : english;
      return {
        id: `demo-${language}-${index + 1}`,
        language,
        term,
        forbiddenWords,
        categoryId,
        difficulty,
      };
    }),
);
