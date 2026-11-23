/** Die Namen und Bedeutungen der Symbole von Werwolf (Legende); die Zeichnungen stehen in `presentation/werewolf/symbols`. */
export const werewolfSymbolsTexts = {
  werewolfSymbols: {
    tab: "Symbole",
    intro:
      "Diese Symbole zeigt dir der Erzähler, wenn eine Rolle aufwacht oder eine Person betroffen ist. Gleiche Bedeutung heißt gleiches Zeichen. Eine Rolle steht frei, ihre Fähigkeit im Kreis. Eine grüne Fähigkeit kannst du jetzt nutzen; eine durchgestrichene ist verbraucht; eine mit gelb gestricheltem Rahmen geht gerade nicht; eine abgedunkelte ist noch nicht dran. Ein blauer Rahmen zeigt den nächsten Schritt, gelbe Kästen sind Hinweise für dich (zum Beispiel wer heute stumm ist), die blaue Box unten fasst eine Entscheidung noch einmal zusammen. Das geschlossene und offene Auge zeigt bei den Toten die Todesursache nur auf Antippen.",
    credits:
      "Wolfskopf: „Wolf head“ von Lorc, game-icons.net, Lizenz CC BY 3.0. Übrige Zeichnungen: Tabler Icons, Lizenz MIT.",
    abilities: {
      title: "Fähigkeiten",
      items: {
        attack: "Die Werwölfe wählen ihr Opfer",
        inspect: "Die Seherin schaut eine Person an",
        investigate: "Der Ermittler prüft eine Gruppe von Personen (einmal)",
        heal: "Rettet das Opfer der Werwölfe",
        poison: "Tötet eine Person (einmal)",
        kill: "Ein Todeszauber des Magiers",
        protect: "Der Leibwächter schützt eine Person",
        stayWith: "Der Nachtgast schläft bei einer anderen Person",
        bond: "Amor verliebt zwei Personen",
        hammer: "Der Bürgermeister schlägt mit dem Hammer zu",
        silence: "Die Alte Vettel macht eine Person für den Tag stumm",
        shot: "Der Jäger schießt auf eine Person",
        passAmulet: "Der Besitzer gibt das Amulett weiter",
        vote: "Bis zu 3 Personen nominieren, danach stimmt das Dorf ab",
      },
    },
    groups: {
      extra: "Zusätze",
      resource: "Eigene Mittel",
      role: "Rollen",
      state: "Zustände",
    },
    items: {
      amulet: {
        name: "Schutzamulett",
        meaning: "Edelstein: fängt Angriffe der Nacht ab",
      },
      amuletPass: {
        name: "Amulett abgeben",
        meaning: "Pfeile: der Träger muss es weitergeben",
      },
      apprenticeSeer: {
        name: "Seher-Lehrling",
        meaning: "Geschlossenes Auge: schläft, bis die Seherin tot ist",
      },
      attacked: {
        name: "Angegriffen",
        meaning: "Pfote: Ziel des Wolfsangriffs",
      },
      bodyguard: {
        name: "Leibwächter",
        meaning: "Schild: schützt eine Person",
      },
      cupid: {
        name: "Amor",
        meaning: "Herz mit Handschlag: verliebt 2 Personen",
      },
      day: {
        name: "Tag",
        meaning: "Sonne: das Dorf spricht, nominiert und stimmt ab",
      },
      dead: {
        name: "Tot",
        meaning: "Grabstein: ausgeschieden",
      },
      doubleVote: {
        name: "Doppelte Stimme",
        meaning:
          "Zwei: die Stimme zählt doppelt (die zweite Stimme wird einer nominierten Person zugewiesen)",
      },
      drunk: {
        name: "Trunkenbold",
        meaning: "Flasche: kennt seine wahre Rolle noch nicht",
      },
      guest: {
        name: "Übernachtungsgast",
        meaning: "Bett: die Dorfmatratze schläft hier",
      },
      hammer: {
        name: "Hammer",
        meaning: "Richterhammer: einmal pro Partie, ab Nacht 2",
      },
      heal: {
        name: "Heiltrank oder Heilzauber",
        meaning: "Herz mit Plus: rettet das Wolfsopfer",
      },
      healed: {
        name: "Geheilt",
        meaning: "Herz mit Plus: Heilung gewählt",
      },
      hunter: {
        name: "Jäger",
        meaning: "Zielscheibe: schießt, wenn er ausscheidet",
      },
      idiot: {
        name: "Dorftrottel",
        meaning: "Daumen hoch: muss bei der Abstimmung mit Ja stimmen",
      },
      investigation: {
        name: "Untersuchung",
        meaning: "Lupe: einmalige Fähigkeit des Ermittlers",
      },
      kill: {
        name: "Gifttrank oder Todeszauber",
        meaning: "Totenkopf: tötet eine Person",
      },
      lovers: {
        name: "Verliebt",
        meaning: "Zwei Herzen: stirbt der eine, stirbt der andere mit",
      },
      magician: {
        name: "Magier",
        meaning: "Zauberstab: zwei Zauber zum Heilen oder Töten",
      },
      mayor: {
        name: "Bürgermeister",
        meaning: "Krone: doppelte Stimme oder Hammer",
      },
      nightGuest: {
        name: "Dorfmatratze",
        meaning: "Bett: übernachtet bei einer Person und schützt sie vor dem Wolfsangriff",
      },
      paranormalInvestigator: {
        name: "Paranormaler Ermittler",
        meaning: "Geist: prüft eine Person und ihre Sitznachbarn, einmalig",
      },
      poisoned: {
        name: "Vergiftet",
        meaning: "Flasche: Gifttrank gewählt",
      },
      protected: {
        name: "Geschützt",
        meaning: "Schild: in dieser Nacht beschützt",
      },
      seer: {
        name: "Seherin",
        meaning: "Auge: schaut sich eine Person an",
      },
      shotDuty: {
        name: "Schusspflicht",
        meaning: "Zielscheibe mit Pfeil: der Jäger muss schießen",
      },
      silenced: {
        name: "Stumm",
        meaning: "Mikrofon aus: heute ohne Rede, Nominierung und Stimme",
      },
      spellcaster: {
        name: "Alte Vettel",
        meaning: "Mikrofon aus: macht eine Person für den Tag stumm",
      },
      tanner: {
        name: "Gerber",
        meaning: "Pokal: gewinnt, wenn er stirbt",
      },
      toughGuy: {
        name: "Harter Bursche",
        meaning: "Hantel: hält einen Angriff einen Tag aus",
      },
      villager: {
        name: "Dorfbewohner",
        meaning: "Haus: keine besondere Fähigkeit",
      },
      witch: {
        name: "Hexe",
        meaning: "Trankflasche: Heil- und Gifttrank",
      },
      wolf: {
        name: "Werwolf",
        meaning: "Wolfskopf: jagt nachts",
      },
      vote: {
        name: "Nominierung und Abstimmung",
        meaning: "Zettel in einer Urne: bis zu 3 Personen nominieren, danach stimmt das Dorf ab",
      },
      wounded: {
        name: "Verwundet",
        meaning: "Pflaster: der Harte Bursche stirbt in der nächsten Nacht",
      },
    },
  },
};
