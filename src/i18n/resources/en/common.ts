import { kitTexts } from "./kit";
import { tabooTexts } from "./taboo";

export const common = {
  ...kitTexts,
  ...tabooTexts,
  app: {
    eyebrow: "Project foundation",
    title: "GameHub",
    metaDescription: "GameHub – party games in one place",
    intro: "One place for party, card, quiz, and social games.",
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
    pause: "Pause",
    resume: "Resume",
    exitGame: "End game",
    exitGameConfirm: "Tap again to end",
    leaveGameTitle: "End the game?",
    leaveGameText: "The game that is running will be lost.",
    keepPlaying: "Keep playing",
    back: "Back",
    closeGame: "Close game",
  },
  settings: {
    open: "Settings",
    title: "Settings",
    description: "Choose the language of the interface.",
    close: "Close",
  },
  feedback: {
    emptyGames: {
      title: "No games available",
      description: "New games will appear here as soon as they are registered.",
    },
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
      play: "Play",
    },
  },
  games: {
    taboo: {
      title: "Taboo",
      description: "Explain the term without using the forbidden words.",
    },
    wordBomb: {
      title: "Word bomb",
      description: "Name a fitting word fast, before the bomb goes off in your hand.",
    },
    imposter: {
      title: "Imposter",
      description: "Everyone knows the secret word except the imposter. Who gets caught?",
    },
    werewolf: {
      title: "Werewolf",
      description: "The village sleeps while the werewolves hunt. Find them in time.",
    },
    liarsBar: {
      title: "Liar’s Bar",
      description: "Play cards face down, bluff, and call out the liars.",
    },
    schwimmen: {
      title: "Schwimmen",
      description: "Swap cards and reach 31 points without sinking.",
    },
  },
  gamePreview: {
    description:
      "This game is already part of GameHub and will become playable in a later development step.",
  },
} as const;
