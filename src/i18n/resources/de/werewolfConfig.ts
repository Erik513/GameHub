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
    villagersTitle: "Dorf\u00ADbewohner",
    availableHeading: "Verfügbare Rollen",
    unavailableHeading: "Nicht verfügbar (mehr Spieler benötigt)",
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
    infoOptions: "Optionen",
    infoNotes: "Besonderheiten",
    availableFrom: "Ab {{count}} Spielern",
    lockNoSeat:
      "Kein Platz frei: Die Werwölfe, die Seherin und die gewählten Rollen füllen alle Plätze.",
    lockCombination:
      "Sie spielt mit den gewählten Rollen bei dieser Spielerzahl und Wolfszahl nicht zusammen. Eine andere Wolfszahl kann sie freigeben.",
    lockWolves: "Der Trunkenbold braucht mindestens zwei Werwölfe.",
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
      "Tippe eine Rolle an, um sie ins Spiel zu nehmen. Eine Rolle mit Optionen hat für jede Option eine Hälfte; tippe die gewählte Hälfte erneut an, um die Rolle wegzulassen.",
    info: {
      amulet: {
        what: "Ein Gegenstand, keine Rollenkarte, er belegt also keinen Platz. Er fängt eine tödliche Aktion gegen den Träger ab.",
        notes:
          "Den ersten Träger lost die App unter den Spielern, die keine Werwölfe sind.\nEr fängt zum Beispiel den Wolfsangriff, Gift, einen Todeszauber, einen Jägerschuss und die Abstimmung ab.\nDer Träger gibt ihn jeden Tag weiter; hat er eine Aktion abgefangen, an eine andere Person.",
      },
      apprenticeSeer: {
        what: "Hat keine Aktion, solange die Seherin lebt. Ist die Seherin ausgeschieden, übernimmt der Lehrling ihre Visionen.",
        notes:
          "Der Erzähler sagt es ihm heimlich, sobald er erstmals für die Seherin aufgerufen wird.\nEine Seherin, die nachts angegriffen wird, hat ihre Vision noch, bevor sie am Morgen ausscheidet.",
      },
      cupid: {
        what: "Wählt in der ersten Nacht zwei Verliebte. Sie erkennen einander, behalten ihre Rollen und sterben gemeinsam.",
        notes:
          "Ein gemischtes Paar als letzte zwei Überlebende lässt die Werwölfe bei eins gegen eins gewinnen.",
      },
      drunk: {
        what: "Ein Zusatz: Eine Person startet als Trunkenbold und sieht nur das. Zu Beginn der dritten Nacht zeigt der Erzähler ihr die wahre Rolle.",
        notes:
          "Bis dahin tut die Rolle nichts.\nEr braucht mindestens zwei Werwölfe.\nEin Jäger, der vorher stirbt, erfährt seine wahre Rolle vor dem letzten Schuss.",
      },
      guard: {
        what: "Höchstens eine der beiden Rollen ist im Spiel, oder keine.",
        options:
          "Leibwächter: schützt jede Nacht eine Person vor dem Wolfsangriff, vor Gift und vor Todeszaubern.\nDorfmatratze: übernachtet jede Nacht bei einer Person; ein Wolfsangriff auf den Gastgeber trifft stattdessen die Dorfmatratze.",
        notes:
          "Beide dürfen nie dieselbe Person zweimal hintereinander wählen.\nEin direkter Angriff auf den Leibwächter trifft ihn trotzdem; ein direkter Angriff auf die besuchende Dorfmatratze geht ins Leere.",
      },
      hunter: {
        what: "Wenn der Jäger ausscheidet, nachts oder durch die Abstimmung, darf er auf eine lebende Person schießen, bevor das Spiel weitergeht.",
        options:
          "Schusspflicht: Er muss ein Ziel wählen.\nKeine Schusspflicht: Er darf auch darauf verzichten.",
        notes: "Die Siegprüfung folgt erst nach dem Schuss.",
      },
      idiot: {
        what: "Bei der Abstimmung nach einer Nominierung muss der Dorftrottel mit Ja stimmen.",
        notes: "Ein stummgeschalteter Dorftrottel gibt gar keine Stimme ab.",
      },
      magician: {
        what: "Hat zwei Zauber für die ganze Partie: einen Heilzauber für das Wolfsopfer und einen Todeszauber für eine beliebige Person.",
        notes:
          "Meist ersetzt der Magier die Hexe; beide spielen nur ab 14 Spielern mit vier (oder fünf) Werwölfen zusammen.\nBeide Zauber lassen sich in einer Nacht einsetzen (zwei verschiedene Ziele) oder aufheben.\nEin Leibwächter blockiert einen Todeszauber auf seine geschützte Person; der Zauber ist trotzdem verbraucht.",
      },
      mayor: {
        what: "Eine geheime Rolle mit einer Fähigkeit, die mit der Rolle gewählt wird.",
        options:
          "Doppelte Stimme: Der Erzähler zählt die Stimme des Bürgermeisters zweifach.\nHammer: eine Nachtaktion, die einen Wolf tötet.",
        notes:
          "Bei einem falschen Ziel tötet der Hammer den Bürgermeister selbst, das Ziel überlebt.\nDer Hammer ist ab 10 Spielern verfügbar.",
      },
      paranormalInvestigator: {
        what: "Einmal pro Partie wählt er eine Person; der Erzähler sagt, ob diese Person oder einer ihrer zwei nächsten lebenden Sitznachbarn ein Werwolf ist.",
        notes:
          "Er darf auf eine spätere Nacht warten; Warten verbraucht die Fähigkeit nicht.\nDie Sitzreihenfolge zählt als Kreis.",
      },
      seer: {
        what: "Sieht sich jede Nacht eine Person an und erfährt, ob sie ein Werwolf ist.",
        notes: "Es gibt immer genau eine Seherin.",
      },
      spellcaster: {
        what: "Schaltet jede Nacht eine Person für den nächsten Tag stumm: nicht sprechen, nicht nominieren, nicht abstimmen.",
        options:
          "Selbstwahl erlaubt: Sie darf auch sich selbst stummschalten.\nSelbstwahl verboten: Sie muss eine andere Person wählen.",
        notes:
          "Nie dieselbe Person zweimal hintereinander.\nEine stummgeschaltete Person kann trotzdem nominiert werden.",
      },
      tanner: {
        what: "Hat keine Nachtaktion. Er gewinnt persönlich, wenn er ausscheidet; die Partie läuft weiter, bis das Dorf oder die Werwölfe gewinnen.",
        options:
          "Sieg bei jedem Ausscheiden: Jeder Tod zählt, auch durch die Wölfe, einen Schuss oder Liebeskummer.\nSieg nur bei Abstimmung: Nur ein Tod durch die Abstimmung des Tages zählt.",
        notes:
          "Nur bei Abstimmung: Scheidet er aus, weil sein Liebespartner rausgewählt wurde, gewinnt er nicht.",
      },
      toughGuy: {
        what: "Ein ungeschützter Wolfsangriff verwundet ihn nur. Er nimmt am nächsten Tag normal teil und stirbt am Ende der nächsten Nacht.",
        notes:
          "Gift, die Abstimmung, ein Jägerschuss oder der Tod eines Liebespartners können ihn früher töten.\nDie Hexe kann den ursprünglichen Angriff in der Angriffsnacht heilen.",
      },
      villagers: {
        what: "Gewöhnliche Dorfbewohner haben keine besondere Fähigkeit. Sie spielen mit dem Dorf und suchen gemeinsam die Werwölfe.",
        notes: "Die Anzahl wird automatisch aus deiner Auswahl bestimmt.",
      },
      witch: {
        what: "Wird nach den Werwölfen und der Seherin aufgerufen, auch in der ersten Nacht. Hat einen Heiltrank und einen Gifttrank für die ganze Partie.",
        notes:
          "Beide Tränke können in derselben Nacht eingesetzt werden.\nGift auf eine geschützte Person ist trotzdem verbraucht.",
      },
      wolves: {
        what: "Die Werwölfe wählen jede Nacht ein Opfer.",
        notes:
          "Wähle, wie viele mitspielen; gibt es nur eine mögliche Zahl, ist sie fest.\nDie Empfehlung passt zu den gewählten Rollen; sie ändert deine Wahl nie von selbst.",
      },
    },
  },
};
