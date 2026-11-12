import { kitTexts } from "./kit";
import { tabooTexts } from "./taboo";

export const common = {
  ...kitTexts,
  ...tabooTexts,
  app: {
    eyebrow: "Projektgrundlage",
    title: "GameHub",
    metaDescription: "GameHub – Partyspiele an einem Ort",
    intro: "Ein Ort für Party-, Karten-, Quiz- und Gesellschaftsspiele.",
  },
  language: {
    uiLabel: "Oberflächensprache",
    cardLabel: "Kartensprache",
    options: {
      de: "Deutsch",
      en: "Englisch",
    },
  },
  navigation: {
    home: "Spiele",
    ariaLabel: "Hauptnavigation",
    pause: "Pause",
    resume: "Fortsetzen",
    exitGame: "Spiel beenden",
    exitGameConfirm: "Nochmal tippen zum Beenden",
    back: "Zurück",
    closeGame: "Spiel schließen",
  },
  settings: {
    open: "Einstellungen",
    title: "Einstellungen",
    description: "Wähle die Sprache der Oberfläche.",
    close: "Schließen",
  },
  feedback: {
    emptyGames: {
      title: "Keine Spiele verfügbar",
      description: "Neue Spiele erscheinen hier, sobald sie registriert sind.",
    },
  },
  gameSelection: {
    eyebrow: "Spielesammlung",
    title: "Wähle ein Spiel",
    intro:
      "Wähle, was zu eurer Runde passt. Neue Spiele kommen in dieselbe Sammlung, sobald sie bereit sind.",
    status: {
      available: "Spielbereit",
      preview: "In Entwicklung",
      planned: "Geplant",
    },
    action: {
      available: "Spielen",
      preview: "Fortschritt ansehen",
      planned: "Kommt später",
    },
  },
  games: {
    taboo: {
      title: "Tabu",
      description: "Erkläre den Begriff, ohne die verbotenen Wörter zu verwenden.",
    },
    cards: {
      title: "Kartenspiel",
      description: "Ein flexibler Platz für zukünftige Ablege- und Zuordnungsspiele.",
    },
    charades: {
      title: "Scharade",
      description: "Stelle einen Begriff dar, während dein Team gegen die Zeit spielt.",
    },
    quiz: {
      title: "Quiz",
      description: "Fragen, Teams und flexible Runden für jedes Thema.",
    },
    whoAmI: {
      title: "Wer bin ich?",
      description: "Entdecke die geheime Figur mit klugen Fragen.",
    },
  },
  gamePreview: {
    description:
      "Dieses Spiel ist bereits Teil von GameHub und wird in einem späteren Entwicklungsschritt spielbar.",
  },
} as const;
