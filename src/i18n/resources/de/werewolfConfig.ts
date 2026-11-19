/** Die Texte der Werwolf-Konfiguration (feste Rollen); die Texte der Aufstellung stehen in `werewolf.ts`. */
export const werewolfConfigTexts = {
  werewolfConfig: {
    open: "Konfiguration",
    rolesTab: "Rollen",
    rulesTab: "Spielregeln",
    modeLabel: "Art der Rollen",
    modeFixed: "Feste Rollen",
    modeVariable: "Variable Rollen",
    variableLater: "Die variable Konfiguration folgt später.",
    label: "Konfiguration",
    done: "Fertig",
    coreHeading: "Grundrollen und Zusätze",
    wolves: "Werwölfe",
    recommended: "empfohlen",
    seer: "Seherin",
    villagers: "Dorfbewohner",
    availableHeading: "Verfügbare Rollen",
    unavailableHeading: "Noch nicht verfügbar",
    row: "Ab {{count}} Spielern",
    extrasHeading: "Zusätze",
    attackLabel: "Wolfsangriff",
    attackNight1: "Ab Nacht 1",
    attackNight2: "Ab Nacht 2",
    revealLabel: "Rollen nach dem Ausscheiden",
    revealOpen: "Aufdecken",
    revealSecret: "Geheim halten",
    issuesHeading: "Zu korrigieren",
    useWolves: "Wolfszahl {{count}} nehmen",
    infoLabel: "Info zu {{name}}",
    infoClose: "Schließen",
    lockMinimumPlayers: "Ab {{count}} Spielern aktivierbar.",
    lockNoSeat:
      "Kein Platz frei: Die Werwölfe, die Seherin und die gewählten Rollen füllen alle Plätze.",
    lockCombination:
      "Sie spielt mit den gewählten Rollen bei dieser Spielerzahl und Wolfszahl nicht zusammen. Eine andere Wolfszahl kann sie freigeben.",
    lockWolves: "Der Trunkenbold braucht mindestens zwei Werwölfe.",
    lockedMinimum: "ab {{count}}",
    lockedNoSeat: "kein Platz frei",
    lockedCombination: "nicht zusammen",
    lockedWolves: "ab 2 Wölfen",
    tooFewPlayers: "Füge zuerst mindestens 6 Spieler hinzu (bisher {{count}}).",
    issues: {
      players: "Die Konfiguration braucht 6 bis 20 Spieler neben dem Erzähler (bisher {{count}}).",
      wolfCount: "{{count}} Werwölfe sind bei dieser Spielerzahl nicht erlaubt.",
      roleMinimum: "{{role}} braucht mindestens {{minimum}} Spieler.",
      noSeat:
        "Zu viele Rollen: Die Werwölfe, die Seherin und {{roles}} Rollen brauchen mehr Plätze, als Spieler da sind.",
      combination: "Die gewählten Rollen spielen mit dieser Wolfszahl nicht zusammen.",
      hammerMinimum: "Der Hammer des Bürgermeisters braucht mindestens {{minimum}} Spieler.",
      addonMinimum: "{{addon}} braucht mindestens {{minimum}} Spieler.",
      drunkWolves: "Der Trunkenbold braucht mindestens zwei Werwölfe.",
      invalid: "Diese Aufstellung ist nicht spielbar.",
    },
    roles: {
      apprenticeSeer: "Seher-Lehrling",
      bodyguard: "Leibwächter",
      cupid: "Amor",
      hunter: "Jäger",
      idiot: "Dorftrottel",
      magician: "Magier",
      mayor: "Bürgermeister",
      nightGuest: "Dorfmatratze",
      paranormalInvestigator: "Paranormaler Ermittler",
      spellcaster: "Alte Vettel",
      tanner: "Gerber",
      toughGuy: "Harter Bursche",
      witch: "Hexe",
    },
    items: {
      apprenticeSeer: "Seher-Lehrling",
      cupid: "Amor",
      guard: "Leibwächter / Dorfmatratze",
      hunter: "Jäger",
      idiot: "Dorftrottel",
      magician: "Magier",
      mayor: "Bürgermeister",
      paranormalInvestigator: "Paranormaler Ermittler",
      spellcaster: "Alte Vettel",
      tanner: "Gerber",
      toughGuy: "Harter Bursche",
      witch: "Hexe",
    },
    addons: {
      amulet: "Schutzamulett",
      drunk: "Trunkenbold",
    },
    variants: {
      allowed: "Selbstwahl erlaubt",
      anyDeath: "Sieg bei jedem Ausscheiden",
      bodyguard: "Leibwächter",
      doubleVote: "Doppelte Stimme",
      forbidden: "Selbstwahl verboten",
      hammer: "Hammer",
      nightGuest: "Dorfmatratze",
      optional: "Keine Schusspflicht",
      required: "Schusspflicht",
      voteOnly: "Sieg nur bei Abstimmung",
    },
    variantHint:
      "Tippe eine Auswahl an, um die Rolle ins Spiel zu nehmen; tippe sie erneut an, um die Rolle wegzulassen.",
    info: {
      amulet:
        "Ein Gegenstand, keine Rollenkarte: Er belegt keinen Platz.\nDie App lost den ersten Träger unter den Spielern, die keine Werwölfe sind.\nEr fängt eine tödliche Aktion gegen den Träger ab, zum Beispiel den Wolfsangriff, Gift oder die Abstimmung.\nDer Träger gibt es jeden Tag weiter.\nVerfügbar ab 10 Spielern.",
      apprenticeSeer:
        "Hat keine eigene Aktion, solange die Seherin lebt.\nÜbernimmt die Visionen, wenn die Seherin ausgeschieden ist.\nVerfügbar ab 8 Spielern.",
      cupid:
        "Wählt in der ersten Nacht zwei Verliebte.\nStirbt einer der beiden, stirbt auch der andere.\nVerfügbar ab 7 Spielern.",
      drunk:
        "Ein Zusatz: Eine Person startet als Trunkenbold und sieht nur das.\nZu Beginn der dritten Nacht zeigt der Erzähler ihr die wahre Rolle.\nBis dahin tut die Rolle nichts.\nVerfügbar ab 9 Spielern und mit mindestens zwei Werwölfen.",
      guard:
        "Höchstens eine der beiden Rollen, oder keine.\nDer Leibwächter schützt jede Nacht eine Person, nie dieselbe zweimal hintereinander.\nDie Dorfmatratze übernachtet jede Nacht bei einer Person: Ein Wolfsangriff auf den Gastgeber trifft stattdessen die Dorfmatratze.\nVerfügbar ab 6 Spielern.",
      hunter:
        "Wenn der Jäger ausscheidet, darf er auf eine lebende Person schießen.\nKeine Schusspflicht: Er darf auch darauf verzichten.\nSchusspflicht: Er muss ein Ziel wählen.\nVerfügbar ab 6 Spielern.",
      idiot:
        "Bei der Abstimmung nach einer Nominierung muss der Dorftrottel mit Ja stimmen.\nVerfügbar ab 6 Spielern.",
      magician:
        "Hat zwei Zauber für die ganze Partie: Einer heilt das Wolfsopfer, einer tötet eine Person.\nMeist ersetzt der Magier die Hexe. Beide spielen nur ab 14 Spielern mit vier (oder fünf) Werwölfen zusammen.\nVerfügbar ab 11 Spielern.",
      mayor:
        "Eine geheime Rolle mit einer Fähigkeit: doppelte Stimme (der Erzähler zählt die Stimme zweifach) oder Hammer (eine Nachtaktion, die einen Wolf tötet; bei einem falschen Ziel stirbt der Bürgermeister).\nDer Hammer ist ab 10 Spielern verfügbar.\nVerfügbar ab 9 Spielern.",
      paranormalInvestigator:
        "Einmal pro Partie wählt der Ermittler eine Person. Der Erzähler sagt, ob diese Person oder einer ihrer zwei nächsten Sitznachbarn ein Werwolf ist.\nVerfügbar ab 10 Spielern.",
      seer: "Die Seherin sieht sich jede Nacht eine Person an und erfährt, ob sie ein Werwolf ist.\nEs gibt immer genau eine Seherin.",
      spellcaster:
        "Die Alte Vettel schaltet jede Nacht eine Person für den nächsten Tag stumm: nicht sprechen, nicht abstimmen.\nNie dieselbe Person zweimal hintereinander.\nSelbstwahl erlaubt: Sie darf auch sich selbst stummschalten.\nVerfügbar ab 9 Spielern.",
      tanner:
        "Hat keine Nachtaktion. Er gewinnt persönlich, wenn er ausscheidet; die Partie läuft weiter.\nSieg bei jedem Ausscheiden: Jeder Tod zählt.\nSieg nur bei Abstimmung: Nur ein Tod durch die Abstimmung zählt.\nVerfügbar ab 8 Spielern.",
      toughGuy:
        "Ein Wolfsangriff verwundet ihn nur. Er stirbt am Ende der nächsten Nacht.\nVerfügbar ab 7 Spielern.",
      villagers:
        "Gewöhnliche Dorfbewohner füllen jeden freien Platz.\nDie Zahl ist: Spieler minus Werwölfe, minus die Seherin, minus die gewählten Rollen.\nSie lässt sich nicht von Hand einstellen.",
      witch:
        "Hat einen Heiltrank und einen Gifttrank für die ganze Partie.\nWird nach den Werwölfen und der Seherin aufgerufen, auch in der ersten Nacht.\nVerfügbar ab 6 Spielern.",
      wolves:
        "Die Werwölfe wählen jede Nacht ein Opfer.\nWähle, wie viele mitspielen. Gibt es nur eine mögliche Zahl, ist sie fest.\nDie Empfehlung passt zu den gewählten Rollen; sie ändert deine Wahl nie von selbst.",
    },
  },
};
