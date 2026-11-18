// The texts of the buttons and groups that the layout checks press, in both languages.

export const labels = {
  en: {
    open: "Play",
    settings: "Settings",
    close: "Close",
    done: "Done",
    startGame: "Start game",
    startRound: "Start round",
    forbidden: "Forbidden word",
    skip: "Skip",
    correct: "Correct",
    pause: "Pause",
    resume: "Resume",
    endRound: "End round",
    endRoundConfirm: "Tap again to end",
    show: "Show final results",
    startTiebreak: "Start tiebreak",
    endAttempt: "End attempt",
    endAttemptConfirm: "Tap again to end",
    interfaceLanguage: "Interface language",
    players: "Players",
    addPlayer: "Add player",
    addButton: "Add",
    draw: "Draw teams",
    noTeam: "No team",
    cards: "Cards",
    categories: "Categories",
    manage: "Categories and cards",
    rules: "Rules",
    settingsTab: "Game settings",
  },
  de: {
    open: "Spielen",
    settings: "Einstellungen",
    close: "Schließen",
    done: "Fertig",
    startGame: "Spiel starten",
    startRound: "Runde starten",
    forbidden: "Verbotenes Wort",
    skip: "Überspringen",
    correct: "Richtig",
    pause: "Pause",
    resume: "Fortsetzen",
    endRound: "Runde beenden",
    endRoundConfirm: "Nochmal tippen zum Beenden",
    show: "Endergebnis anzeigen",
    startTiebreak: "Stechen starten",
    endAttempt: "Versuch beenden",
    endAttemptConfirm: "Nochmal tippen zum Beenden",
    interfaceLanguage: "Oberflächensprache",
    players: "Spieler",
    addPlayer: "Spieler hinzufügen",
    addButton: "Hinzufügen",
    draw: "Teams auslosen",
    noTeam: "Ohne Team",
    cards: "Karten",
    categories: "Kategorien",
    manage: "Kategorien und Karten",
    rules: "Spielregeln",
    settingsTab: "Spieleinstellungen",
  },
} as const;

export const raceLabels = {
  en: { mode: "Game mode", race: "Race", startRun: "Start run" },
  de: { mode: "Spielmodus", race: "Auf Zeit", startRun: "Lauf starten" },
} as const;

export const countdownLabels = {
  en: { mode: "Game mode", countdown: "Against the clock", start: "Start turn" },
  de: { mode: "Spielmodus", countdown: "Gegen die Zeit", start: "Zug starten" },
} as const;

export const switchLabels = {
  en: { change: "Team change", auto: "Automatic", manual: "Manual" },
  de: { change: "Teamwechsel", auto: "Automatisch", manual: "Manuell" },
} as const;
