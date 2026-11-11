import type { TabooCard } from "../business/games/taboo/model";

type Words = readonly [string, ...TabooCard["forbiddenWords"]];

const entries: readonly (readonly [string, TabooCard["difficulty"], Words, Words])[] = [
  [
    "everyday",
    "easy",
    ["Tasse", "Kaffee", "Henkel", "trinken", "Geschirr"],
    ["Cup", "coffee", "handle", "drink", "dishes"],
  ],
  [
    "everyday",
    "medium",
    ["Kühlschrank", "kalt", "Essen", "Küche", "Haushaltsgerät"],
    ["Refrigerator", "cold", "food", "kitchen", "appliance"],
  ],
  [
    "everyday",
    "hard",
    ["Pfandautomat", "Flasche", "Supermarkt", "Bon", "Automat"],
    ["Bottle return machine", "deposit", "supermarket", "receipt", "machine"],
  ],
  [
    "nature",
    "easy",
    ["Hund", "bellen", "Leine", "Haustier", "Tier"],
    ["Dog", "bark", "leash", "pet", "animal"],
  ],
  [
    "nature",
    "medium",
    ["Wasserfall", "Fluss", "Höhe", "Felsen", "Natur"],
    ["Waterfall", "river", "height", "rocks", "nature"],
  ],
  [
    "nature",
    "hard",
    ["Photosynthese", "Pflanze", "Licht", "Sauerstoff", "Biologie"],
    ["Photosynthesis", "plant", "light", "oxygen", "biology"],
  ],
  [
    "culture",
    "easy",
    ["Kino", "Film", "Leinwand", "Popcorn", "Unterhaltung"],
    ["Cinema", "film", "screen", "popcorn", "entertainment"],
  ],
  [
    "culture",
    "medium",
    ["Orchester", "Dirigent", "Instrument", "Musik", "Ensemble"],
    ["Orchestra", "conductor", "instrument", "music", "ensemble"],
  ],
  [
    "culture",
    "hard",
    ["Stummfilm", "Ton", "Chaplin", "Kino", "Schwarzweiß"],
    ["Silent film", "sound", "Chaplin", "cinema", "black-and-white"],
  ],
  [
    "everyday",
    "easy",
    ["Brot", "Bäcker", "Scheibe", "Butter", "Lebensmittel"],
    ["Bread", "baker", "slice", "butter", "food"],
  ],
  [
    "everyday",
    "easy",
    ["Schlüssel", "Tür", "Schloss", "öffnen", "Werkzeug"],
    ["Key", "door", "lock", "open", "tool"],
  ],
  [
    "everyday",
    "easy",
    ["Regenschirm", "Regen", "nass", "aufspannen", "Zubehör"],
    ["Umbrella", "rain", "wet", "open", "accessory"],
  ],
  [
    "everyday",
    "easy",
    ["Bett", "schlafen", "Kissen", "Decke", "Möbel"],
    ["Bed", "sleep", "pillow", "blanket", "furniture"],
  ],
  [
    "everyday",
    "medium",
    ["Staubsauger", "Teppich", "Schmutz", "saugen", "Haushaltsgerät"],
    ["Vacuum cleaner", "carpet", "dirt", "suction", "appliance"],
  ],
  [
    "everyday",
    "medium",
    ["Zahnbürste", "Zahncreme", "Mund", "putzen", "Hygiene"],
    ["Toothbrush", "toothpaste", "mouth", "brush", "hygiene"],
  ],
  [
    "everyday",
    "medium",
    ["Wasserkocher", "Tee", "heiß", "Küche", "Küchengerät"],
    ["Kettle", "tea", "hot", "kitchen", "appliance"],
  ],
  [
    "everyday",
    "medium",
    ["Briefkasten", "Post", "Schlitz", "Umschlag", "Behälter"],
    ["Mailbox", "post", "slot", "envelope", "container"],
  ],
  [
    "everyday",
    "hard",
    ["Sicherungskasten", "Strom", "Schalter", "Kurzschluss", "Elektrik"],
    ["Fuse box", "electricity", "switch", "circuit", "wiring"],
  ],
  [
    "everyday",
    "hard",
    ["Dosenöffner", "Blech", "Konserve", "Deckel", "Küchenwerkzeug"],
    ["Can opener", "tin", "canned", "lid", "utensil"],
  ],
  [
    "everyday",
    "hard",
    ["Einkaufswagenchip", "Münze", "Pfand", "Supermarkt", "Einkaufen"],
    ["Shopping cart token", "coin", "deposit", "supermarket", "shopping"],
  ],
  [
    "everyday",
    "hard",
    ["Zeitschaltuhr", "Steckdose", "programmieren", "automatisch", "Gerät"],
    ["Timer plug", "socket", "schedule", "automatic", "device"],
  ],
  [
    "nature",
    "easy",
    ["Baum", "Blatt", "Wald", "Stamm", "Pflanze"],
    ["Tree", "leaf", "forest", "trunk", "plant"],
  ],
  [
    "nature",
    "easy",
    ["Biene", "Honig", "Stachel", "summen", "Insekt"],
    ["Bee", "honey", "sting", "buzz", "insect"],
  ],
  [
    "nature",
    "easy",
    ["Schnee", "Winter", "weiß", "Flocke", "Niederschlag"],
    ["Snow", "winter", "white", "flake", "precipitation"],
  ],
  [
    "nature",
    "easy",
    ["Apfel", "Obst", "Baum", "rot", "Saft"],
    ["Apple", "fruit", "tree", "red", "juice"],
  ],
  [
    "nature",
    "medium",
    ["Eichhörnchen", "Nuss", "Schwanz", "klettern", "Nagetier"],
    ["Squirrel", "nut", "tail", "climb", "rodent"],
  ],
  [
    "nature",
    "medium",
    ["Vulkan", "Lava", "Krater", "Ausbruch", "Berg"],
    ["Volcano", "lava", "crater", "eruption", "mountain"],
  ],
  [
    "nature",
    "medium",
    ["Regenbogen", "Farben", "Sonne", "Regen", "Himmel"],
    ["Rainbow", "colors", "sun", "rain", "sky"],
  ],
  [
    "nature",
    "medium",
    ["Koralle", "Riff", "Meer", "Tauchen", "Tier"],
    ["Coral", "reef", "sea", "diving", "animal"],
  ],
  [
    "nature",
    "hard",
    ["Gezeiten", "Mond", "Ebbe", "Flut", "Wasser"],
    ["Tides", "moon", "ocean", "ebb", "water"],
  ],
  [
    "nature",
    "hard",
    ["Flechte", "Pilz", "Alge", "Symbiose", "Lebewesen"],
    ["Lichen", "fungus", "algae", "symbiosis", "organism"],
  ],
  [
    "nature",
    "hard",
    ["Stalaktit", "Höhle", "Tropfen", "Decke", "Gestein"],
    ["Stalactite", "cave", "drip", "ceiling", "rock"],
  ],
  [
    "nature",
    "hard",
    ["Permafrost", "Boden", "gefroren", "Arktis", "Klima"],
    ["Permafrost", "soil", "frozen", "Arctic", "climate"],
  ],
  [
    "culture",
    "easy",
    ["Buch", "lesen", "Seite", "Autor", "Medium"],
    ["Book", "read", "page", "author", "medium"],
  ],
  [
    "culture",
    "easy",
    ["Gitarre", "Saiten", "Musik", "spielen", "Instrument"],
    ["Guitar", "strings", "music", "play", "instrument"],
  ],
  [
    "culture",
    "easy",
    ["Museum", "Ausstellung", "Kunst", "Besuch", "Gebäude"],
    ["Museum", "exhibition", "art", "visit", "building"],
  ],
  [
    "culture",
    "easy",
    ["Theater", "Bühne", "Schauspiel", "Vorhang", "Kultur"],
    ["Theater", "stage", "acting", "curtain", "culture"],
  ],
  [
    "culture",
    "medium",
    ["Ballett", "Tanz", "Spitze", "Tutu", "Kunst"],
    ["Ballet", "dance", "toe", "tutu", "art"],
  ],
  [
    "culture",
    "medium",
    ["Mosaik", "Steine", "Muster", "Wand", "Kunstwerk"],
    ["Mosaic", "tiles", "pattern", "wall", "artwork"],
  ],
  [
    "culture",
    "medium",
    ["Krimi", "Mord", "Detektiv", "Fall", "Literatur"],
    ["Crime novel", "murder", "detective", "case", "literature"],
  ],
  [
    "culture",
    "medium",
    ["Karneval", "Kostüm", "Umzug", "Konfetti", "Fest"],
    ["Carnival", "costume", "parade", "confetti", "festival"],
  ],
  [
    "culture",
    "hard",
    ["Kupferstich", "Druck", "Metall", "Gravur", "Kunst"],
    ["Engraving", "print", "metal", "etching", "art"],
  ],
  [
    "culture",
    "hard",
    ["Pantomime", "stumm", "Gestik", "Bühne", "Kunst"],
    ["Pantomime", "silent", "gesture", "stage", "art"],
  ],
  [
    "culture",
    "hard",
    ["Dodekaphonie", "zwölf", "Töne", "Komposition", "Musik"],
    ["Twelve-tone music", "twelve", "notes", "composition", "music"],
  ],
  [
    "culture",
    "hard",
    ["Fresko", "Wand", "Putz", "Malerei", "Kunst"],
    ["Fresco", "wall", "plaster", "painting", "art"],
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
