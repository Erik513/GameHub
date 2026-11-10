export const common = {
  app: {
    eyebrow: "Project foundation",
    title: "GameHub",
    intro: "One place for party, card, quiz, and social games.",
  },
  architecture: {
    label: "Architecture layers",
    layers: {
      presentation: "Presentation",
      business: "Business",
      data: "Data",
      infrastructure: "Infrastructure",
    },
  },
  language: {
    uiLabel: "Interface language",
    cardLabel: "Card language",
    options: {
      de: "German",
      en: "English",
    },
  },
  navigation: {
    home: "Games",
    ariaLabel: "Main navigation",
  },
  gameSelection: {
    eyebrow: "Game library",
    title: "Choose a game",
    intro: "Pick what fits the table. New games join the same library as they become ready.",
    status: {
      available: "Ready to play",
      preview: "In development",
      planned: "Planned",
    },
    action: {
      available: "Play",
      preview: "View progress",
      planned: "Coming later",
    },
  },
  games: {
    taboo: {
      title: "Taboo",
      description: "Explain the term without using the forbidden words.",
    },
    cards: {
      title: "Card game",
      description: "A flexible home for future shedding and matching card games.",
    },
    charades: {
      title: "Charades",
      description: "Act out a prompt while your team races the clock.",
    },
    quiz: {
      title: "Quiz",
      description: "Questions, teams, and flexible rounds for any topic.",
    },
    whoAmI: {
      title: "Who am I?",
      description: "Discover the hidden character by asking clever questions.",
    },
  },
  gamePreview: {
    eyebrow: "Game preview",
    description:
      "This game is already part of GameHub and will become playable in a later development step.",
    back: "Back to all games",
  },
} as const;
