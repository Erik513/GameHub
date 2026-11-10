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
  [
    "everyday",
    "easy",
    ["Brot", "Bäcker", "Scheibe", "Butter"],
    ["Bread", "baker", "slice", "butter"],
  ],
  ["everyday", "easy", ["Schlüssel", "Tür", "Schloss", "öffnen"], ["Key", "door", "lock", "open"]],
  [
    "everyday",
    "easy",
    ["Regenschirm", "Regen", "nass", "aufspannen"],
    ["Umbrella", "rain", "wet", "open"],
  ],
  [
    "everyday",
    "easy",
    ["Bett", "schlafen", "Kissen", "Decke"],
    ["Bed", "sleep", "pillow", "blanket"],
  ],
  [
    "everyday",
    "medium",
    ["Staubsauger", "Teppich", "Schmutz", "saugen"],
    ["Vacuum cleaner", "carpet", "dirt", "suction"],
  ],
  [
    "everyday",
    "medium",
    ["Zahnbürste", "Zahncreme", "Mund", "putzen"],
    ["Toothbrush", "toothpaste", "mouth", "brush"],
  ],
  [
    "everyday",
    "medium",
    ["Wasserkocher", "Tee", "heiß", "Küche"],
    ["Kettle", "tea", "hot", "kitchen"],
  ],
  [
    "everyday",
    "medium",
    ["Briefkasten", "Post", "Schlitz", "Umschlag"],
    ["Mailbox", "post", "slot", "envelope"],
  ],
  [
    "everyday",
    "hard",
    ["Sicherungskasten", "Strom", "Schalter", "Kurzschluss"],
    ["Fuse box", "electricity", "switch", "circuit"],
  ],
  [
    "everyday",
    "hard",
    ["Dosenöffner", "Blech", "Konserve", "Deckel"],
    ["Can opener", "tin", "canned", "lid"],
  ],
  [
    "everyday",
    "hard",
    ["Einkaufswagenchip", "Münze", "Pfand", "Supermarkt"],
    ["Shopping cart token", "coin", "deposit", "supermarket"],
  ],
  [
    "everyday",
    "hard",
    ["Zeitschaltuhr", "Steckdose", "programmieren", "automatisch"],
    ["Timer plug", "socket", "schedule", "automatic"],
  ],
  ["nature", "easy", ["Baum", "Blatt", "Wald", "Stamm"], ["Tree", "leaf", "forest", "trunk"]],
  ["nature", "easy", ["Biene", "Honig", "Stachel", "summen"], ["Bee", "honey", "sting", "buzz"]],
  ["nature", "easy", ["Schnee", "Winter", "weiß", "Flocke"], ["Snow", "winter", "white", "flake"]],
  ["nature", "easy", ["Apfel", "Obst", "Baum", "rot"], ["Apple", "fruit", "tree", "red"]],
  [
    "nature",
    "medium",
    ["Eichhörnchen", "Nuss", "Schwanz", "klettern"],
    ["Squirrel", "nut", "tail", "climb"],
  ],
  [
    "nature",
    "medium",
    ["Vulkan", "Lava", "Krater", "Ausbruch"],
    ["Volcano", "lava", "crater", "eruption"],
  ],
  [
    "nature",
    "medium",
    ["Regenbogen", "Farben", "Sonne", "Regen"],
    ["Rainbow", "colors", "sun", "rain"],
  ],
  ["nature", "medium", ["Koralle", "Riff", "Meer", "Tauchen"], ["Coral", "reef", "sea", "diving"]],
  ["nature", "hard", ["Gezeiten", "Mond", "Ebbe", "Flut"], ["Tides", "moon", "ocean", "ebb"]],
  [
    "nature",
    "hard",
    ["Flechte", "Pilz", "Alge", "Symbiose"],
    ["Lichen", "fungus", "algae", "symbiosis"],
  ],
  [
    "nature",
    "hard",
    ["Stalaktit", "Höhle", "Tropfen", "Decke"],
    ["Stalactite", "cave", "drip", "ceiling"],
  ],
  [
    "nature",
    "hard",
    ["Permafrost", "Boden", "gefroren", "Arktis"],
    ["Permafrost", "soil", "frozen", "Arctic"],
  ],
  ["culture", "easy", ["Buch", "lesen", "Seite", "Autor"], ["Book", "read", "page", "author"]],
  [
    "culture",
    "easy",
    ["Gitarre", "Saiten", "Musik", "spielen"],
    ["Guitar", "strings", "music", "play"],
  ],
  [
    "culture",
    "easy",
    ["Museum", "Ausstellung", "Kunst", "Besuch"],
    ["Museum", "exhibition", "art", "visit"],
  ],
  [
    "culture",
    "easy",
    ["Theater", "Bühne", "Schauspiel", "Vorhang"],
    ["Theater", "stage", "acting", "curtain"],
  ],
  ["culture", "medium", ["Ballett", "Tanz", "Spitze", "Tutu"], ["Ballet", "dance", "toe", "tutu"]],
  [
    "culture",
    "medium",
    ["Mosaik", "Steine", "Muster", "Wand"],
    ["Mosaic", "tiles", "pattern", "wall"],
  ],
  [
    "culture",
    "medium",
    ["Krimi", "Mord", "Detektiv", "Fall"],
    ["Crime novel", "murder", "detective", "case"],
  ],
  [
    "culture",
    "medium",
    ["Karneval", "Kostüm", "Umzug", "Konfetti"],
    ["Carnival", "costume", "parade", "confetti"],
  ],
  [
    "culture",
    "hard",
    ["Kupferstich", "Druck", "Metall", "Gravur"],
    ["Engraving", "print", "metal", "etching"],
  ],
  [
    "culture",
    "hard",
    ["Pantomime", "stumm", "Gestik", "Bühne"],
    ["Pantomime", "silent", "gesture", "stage"],
  ],
  [
    "culture",
    "hard",
    ["Dodekaphonie", "zwölf", "Töne", "Komposition"],
    ["Twelve-tone music", "twelve", "notes", "composition"],
  ],
  [
    "culture",
    "hard",
    ["Fresko", "Wand", "Putz", "Malerei"],
    ["Fresco", "wall", "plaster", "painting"],
  ],
];

export const tabooStandardCards: readonly TabooCard[] = entries.flatMap(
  ([categoryId, difficulty, german, english], index) =>
    (["de", "en"] as const).map((language) => {
      const [term, ...forbiddenWords] = language === "de" ? german : english;
      return {
        id: `standard-${language}-${index + 1}`,
        language,
        term,
        forbiddenWords,
        categoryId,
        difficulty,
      };
    }),
);
