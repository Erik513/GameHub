import type { TabooCard } from "../business/games/taboo/model";

type Words = readonly [string, ...TabooCard["forbiddenWords"]];
const entries: readonly (readonly [string, TabooCard["difficulty"], Words, Words])[] = [
  [
    "everyday",
    "easy",
    ["Löffel", "Suppe", "Besteck", "essen", "Küche"],
    ["Spoon", "soup", "cutlery", "eat", "kitchen"],
  ],
  [
    "everyday",
    "easy",
    ["Seife", "Hände", "waschen", "Schaum", "Hygiene"],
    ["Soap", "hands", "wash", "foam", "hygiene"],
  ],
  [
    "everyday",
    "medium",
    ["Bügeleisen", "Wäsche", "glatt", "Dampf", "Haushaltsgerät"],
    ["Iron", "laundry", "smooth", "steam", "appliance"],
  ],
  [
    "everyday",
    "medium",
    ["Rolltreppe", "Stufen", "Einkaufszentrum", "fahren", "Transport"],
    ["Escalator", "steps", "mall", "ride", "transport"],
  ],
  [
    "everyday",
    "hard",
    ["Untersetzer", "Glas", "Tisch", "Fleck", "Zubehör"],
    ["Coaster", "glass", "table", "stain", "accessory"],
  ],
  [
    "everyday",
    "hard",
    ["Flusensieb", "Trockner", "Fussel", "Filter", "Haushaltsgerät"],
    ["Lint trap", "dryer", "fluff", "filter", "appliance"],
  ],
  [
    "nature",
    "easy",
    ["Katze", "miauen", "Pfote", "Haustier", "Tier"],
    ["Cat", "meow", "paw", "pet", "animal"],
  ],
  [
    "nature",
    "easy",
    ["Banane", "gelb", "Schale", "Obst", "Affe"],
    ["Banana", "yellow", "peel", "fruit", "monkey"],
  ],
  [
    "nature",
    "medium",
    ["Igel", "Stacheln", "Garten", "Winterschlaf", "Tier"],
    ["Hedgehog", "spines", "garden", "hibernation", "animal"],
  ],
  [
    "nature",
    "medium",
    ["Gletscher", "Eis", "Gebirge", "schmelzen", "Klima"],
    ["Glacier", "ice", "mountains", "melt", "climate"],
  ],
  [
    "nature",
    "hard",
    ["Tundra", "baumlos", "arktisch", "Moos", "Landschaft"],
    ["Tundra", "treeless", "arctic", "moss", "landscape"],
  ],
  [
    "nature",
    "hard",
    ["Mimikry", "Nachahmung", "Täuschung", "Tier", "Biologie"],
    ["Mimicry", "imitation", "deception", "animal", "biology"],
  ],
  [
    "culture",
    "easy",
    ["Trommel", "Schlagzeug", "Rhythmus", "Stock", "Instrument"],
    ["Drum", "percussion", "rhythm", "stick", "instrument"],
  ],
  [
    "culture",
    "easy",
    ["Tanz", "Musik", "Schritte", "Bewegung", "Kunst"],
    ["Dance", "music", "steps", "movement", "art"],
  ],
  [
    "culture",
    "medium",
    ["Oper", "Gesang", "Bühne", "Klassik", "Kultur"],
    ["Opera", "singing", "stage", "classical", "culture"],
  ],
  [
    "culture",
    "medium",
    ["Gedicht", "Reim", "Vers", "Strophe", "Literatur"],
    ["Poem", "rhyme", "verse", "stanza", "literature"],
  ],
  [
    "culture",
    "hard",
    ["Triptychon", "Altar", "drei", "Bild", "Kunst"],
    ["Triptych", "altar", "three", "painting", "art"],
  ],
  [
    "culture",
    "hard",
    ["Leitmotiv", "Thema", "Wiederholung", "Wagner", "Musik"],
    ["Leitmotif", "theme", "repetition", "Wagner", "music"],
  ],
];

export const tabooLocalCandidates = entries.flatMap(([categoryId, difficulty, german, english]) =>
  (["de", "en"] as const).map((language) => {
    const [term, ...forbiddenWords] = language === "de" ? german : english;
    return { language, categoryId, difficulty, term, forbiddenWords };
  }),
);
