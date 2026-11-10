export const common = {
  tabooSetup: {
    teams: "Teams",
    team: "Team {{number}}",
    addTeam: "Team hinzufügen",
    removeTeam: "Letztes Team entfernen",
    rounds: "Runden pro Team",
    duration: "Rundendauer (Sekunden)",
    difficulty: "Schwierigkeit",
    anyDifficulty: "Alle Stufen",
    categories: "Kategorien",
    categoryHint: "Ohne Auswahl sind alle Kategorien dabei.",
    start: "Partie vorbereiten",
    ready: "Partie vorbereitet",
    readyDetail: "Die Partie für {{teams}} ist eingerichtet.",
    invalidSetup: "Prüfe die Spielkonfiguration",
    emptyTeam: "Gib jedem Team einen Namen.",
    duplicateTeam: "Verwende für jedes Team einen eigenen Namen.",
    invalidDuration: "Gib eine positive ganze Sekundenzahl ein.",
    invalidRounds: "Gib eine positive ganze Rundenzahl ein.",
    difficulties: { easy: "Einfach", medium: "Mittel", hard: "Schwer" },
    category: { everyday: "Alltag", nature: "Natur", culture: "Kultur" },
  },
  app: {
    eyebrow: "Projektgrundlage",
    title: "GameHub",
    intro: "Ein Ort für Party-, Karten-, Quiz- und Gesellschaftsspiele.",
  },
  architecture: {
    label: "Architekturschichten",
    layers: {
      presentation: "Darstellung",
      business: "Geschäftslogik",
      data: "Daten",
      infrastructure: "Infrastruktur",
    },
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
  },
  settings: {
    open: "Einstellungen",
    title: "Einstellungen",
    description: "Wähle Oberflächen- und Kartensprache unabhängig voneinander.",
    close: "Schließen",
  },
  feedback: {
    emptyGames: {
      title: "Keine Spiele verfügbar",
      description: "Neue Spiele erscheinen hier, sobald sie registriert sind.",
    },
    examples: {
      loadingTitle: "Wird geladen",
      loadingDescription: "GameHub bereitet die Inhalte vor.",
      errorTitle: "Etwas ist schiefgelaufen",
      errorDescription: "Deine Einstellungen bleiben unverändert. Bitte versuche es erneut.",
      successTitle: "Gespeichert",
      successDescription: "Deine Änderungen sind jetzt verfügbar.",
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
    eyebrow: "Spielvorschau",
    description:
      "Dieses Spiel ist bereits Teil von GameHub und wird in einem späteren Entwicklungsschritt spielbar.",
    back: "Zurück zu allen Spielen",
  },
} as const;
