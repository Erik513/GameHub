/** Texts of the shared game building blocks (setup screen, teams, players). */
export const kitTexts = {
  kitSetup: {
    teamsSection: "Teams und Spieler",
    settingsSection: "Spieleinstellungen",
    infoLabel: "Info zu {{setting}}",
  },
  kitTeams: {
    loadLast: "Letzte Gruppe laden",
    legend: "Teams",
    defaultName: "Team {{number}}",
    nameLabel: "Name von Team {{number}}",
    orderLegend: "Teamreihenfolge",
    orderRandom: "Zufällig",
    orderEntered: "Wie eingegeben",
    orderInfo:
      "Zufällig lost vor dem Start aus, welches Team beginnt und wie es weitergeht. Wie eingegeben nimmt die Reihenfolge der Teamfelder von oben nach unten. Bei „Mit gleicher Konfiguration neu spielen“ bleibt eine eingegebene Reihenfolge erhalten.",
  },
  kitPlayers: {
    loadLast: "Letzte Spieler laden",
    addLabel: "Spieler hinzufügen",
    addPlaceholder: "Name des Spielers",
    addButton: "Hinzufügen",
    removeLabel: "{{player}} entfernen",
    chipLabel: "{{player}}, {{team}}",
    noTeam: "Ohne Team",
    dropHint: "Spieler hierher ziehen",
    count: "Spieler: {{count}}",
    draw: "Zufällig auf Teams verteilen",
  },
  kitRoster: {
    open: "Spieler",
    title: "Spieler",
    description:
      "Diese Spieler bleiben gespeichert. In jedem Spiel kannst du aus der Liste wählen, wer mitspielt.",
    nameLabel: "Name des Spielers",
    namePlaceholder: "Neuer Spieler",
    add: "Hinzufügen",
    listLabel: "Gespeicherte Spieler",
    empty: "Noch keine Spieler gespeichert.",
    remove: "Spieler {{name}} entfernen",
    removeConfirm: "Nochmal tippen, um {{name}} zu entfernen",
    problems: {
      empty: "Gib einen Namen ein.",
      invalid:
        "Der Name darf höchstens 24 Zeichen haben und kein Komma und kein Semikolon enthalten.",
      duplicate: "Diesen Spieler gibt es schon.",
      full: "Die Liste ist voll (höchstens 100 Spieler).",
    },
    pickOpen: "Aus Spielerliste wählen",
    pickTitle: "Spieler wählen",
    pickInfo: "Wähle, wer heute mitspielt.",
    pickEmpty: "Die Spielerliste ist leer. Lege Spieler über den Knopf „Spieler“ im Hauptmenü an.",
    pickAll: "Alle wählen",
    pickNone: "Keinen wählen",
    pickApply: "Übernehmen",
    pickCancel: "Abbrechen",
  },
};
