import type { TabooCard } from "../business/games/taboo/model";

type Words = readonly [string, ...TabooCard["forbiddenWords"]];
const entries: readonly (readonly [string, TabooCard["difficulty"], Words, Words])[] = [
  [
    "everyday",
    "easy",
    ["Löffel", "Suppe", "Besteck", "essen"],
    ["Spoon", "soup", "cutlery", "eat"],
  ],
  ["everyday", "easy", ["Seife", "Hände", "waschen", "Schaum"], ["Soap", "hands", "wash", "foam"]],
  [
    "everyday",
    "medium",
    ["Bügeleisen", "Wäsche", "glatt", "Dampf"],
    ["Iron", "laundry", "smooth", "steam"],
  ],
  [
    "everyday",
    "medium",
    ["Rolltreppe", "Stufen", "Einkaufszentrum", "fahren"],
    ["Escalator", "steps", "mall", "ride"],
  ],
  [
    "everyday",
    "hard",
    ["Untersetzer", "Glas", "Tisch", "Fleck"],
    ["Coaster", "glass", "table", "stain"],
  ],
  [
    "everyday",
    "hard",
    ["Flusensieb", "Trockner", "Fussel", "Filter"],
    ["Lint trap", "dryer", "fluff", "filter"],
  ],
  ["nature", "easy", ["Katze", "miauen", "Pfote", "Haustier"], ["Cat", "meow", "paw", "pet"]],
  ["nature", "easy", ["Banane", "gelb", "Schale", "Obst"], ["Banana", "yellow", "peel", "fruit"]],
  [
    "nature",
    "medium",
    ["Igel", "Stacheln", "Garten", "Winterschlaf"],
    ["Hedgehog", "spines", "garden", "hibernation"],
  ],
  [
    "nature",
    "medium",
    ["Gletscher", "Eis", "Gebirge", "schmelzen"],
    ["Glacier", "ice", "mountains", "melt"],
  ],
  [
    "nature",
    "hard",
    ["Tundra", "baumlos", "arktisch", "Moos"],
    ["Tundra", "treeless", "arctic", "moss"],
  ],
  [
    "nature",
    "hard",
    ["Mimikry", "Nachahmung", "Täuschung", "Tier"],
    ["Mimicry", "imitation", "deception", "animal"],
  ],
  [
    "culture",
    "easy",
    ["Trommel", "Schlagzeug", "Rhythmus", "Stock"],
    ["Drum", "percussion", "rhythm", "stick"],
  ],
  [
    "culture",
    "easy",
    ["Tanz", "Musik", "Schritte", "Bewegung"],
    ["Dance", "music", "steps", "movement"],
  ],
  [
    "culture",
    "medium",
    ["Oper", "Gesang", "Bühne", "Klassik"],
    ["Opera", "singing", "stage", "classical"],
  ],
  [
    "culture",
    "medium",
    ["Gedicht", "Reim", "Vers", "Strophe"],
    ["Poem", "rhyme", "verse", "stanza"],
  ],
  [
    "culture",
    "hard",
    ["Triptychon", "Altar", "drei", "Bild"],
    ["Triptych", "altar", "three", "painting"],
  ],
  [
    "culture",
    "hard",
    ["Leitmotiv", "Thema", "Wiederholung", "Wagner"],
    ["Leitmotif", "theme", "repetition", "Wagner"],
  ],
];

export const tabooLocalCandidates = entries.flatMap(([categoryId, difficulty, german, english]) =>
  (["de", "en"] as const).map((language) => {
    const [term, ...forbiddenWords] = language === "de" ? german : english;
    return { language, categoryId, difficulty, term, forbiddenWords };
  }),
);
