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
    infoGeneral: "Allgemein",
    infoTasks: "Aufgaben",
    infoOptions: "Optionen",
    infoNotes: "Besonderheiten",
    availableFrom: "Ab {{count}} Spielern",
    hammerFrom: "Hammer ab {{count}} Spielern",
    lockNoSeat:
      "Kein Platz frei: Die Werwölfe, die Seherin und die gewählten Rollen füllen alle Plätze.",
    lockCombination: "In der aktuellen Rollenauswahl zu stark.",
    lockCombinationWith: "In der aktuellen Rollenauswahl zu stark mit {{role}}.",
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
        general:
          "Ein Zusatz: Der Träger wird zu Beginn zufällig unter den Spielern, die keine Werwölfe sind, ausgelost.\nEs fängt direkte Angriffe und eine Abstimmung ab.",
        tasks:
          "Der Träger wird jede Nacht als Letzter geweckt und gefragt: Amulett behalten oder weitergeben.\nHat es einen Angriff abgefangen, muss er es weitergeben.",
        notes:
          "Das Amulett geht verloren, wenn der Träger:\naus Liebeskummer stirbt\nals Bürgermeister an einem Hammer-Fehlschuss stirbt\nals Harter Bursche seiner Wunde erliegt",
      },
      apprenticeSeer: {
        general: "Eine Dorfrolle. Er hat keine Aktion, solange die Seherin lebt.",
        tasks:
          "Ist die Seherin tot, ruft der Erzähler ihn jede Nacht offen auf: Er sieht sich eine Person an und erfährt, ob sie ein Werwolf ist.",
      },
      cupid: {
        general: "Eine Dorfrolle.",
        tasks:
          "Er wählt in der ersten Nacht zwei Verliebte, auch sich selbst. Stirbt einer von ihnen, stirbt der andere mit.\nVerliebte töten sich nie gegenseitig und versuchen, als Paar zu gewinnen.",
      },
      drunk: {
        general:
          "Ein Zusatz: Eine Person startet als Trunkenbold und kann sich nicht an ihre wahre Rolle erinnern.\nDie wahre Rolle wird unter allen Rollen außer Amor ausgelost.",
        tasks:
          "Zu Beginn der dritten Nacht nüchtert er aus und erinnert sich an seine wahre Rolle.\nBis dahin ruht seine Fähigkeit.",
        notes:
          "Seherin und Ermittler können die wahre Rolle schon vorher herausfinden.\nIst er in Wahrheit der Jäger und kurz vor dem Tod, nüchtert er vor Adrenalin aus und darf oder muss noch schießen, je nach Option des Jägers.",
      },
      guard: {
        general: "Eine Dorfrolle. Höchstens eine der beiden ist im Spiel, oder keine.",
        tasks:
          "Jede Nacht wählt die Rolle eine Person, bei der sie die Nacht verbringt.\nDieselbe Person zweimal hintereinander wählen ist verboten.",
        options:
          "Leibwächter: Übernachtet bei der gewählten Person und schützt sie vor direkten Angriffen, nur nicht vor dem Hammer. Er selbst ist nicht geschützt.\nDorfmatratze: Übernachtet bei der gewählten Person und schützt sie vor dem Wolfsangriff, stirbt aber an ihrer Stelle. Ein direkter Angriff auf sie geht ins Leere, denn sie schläft woanders.",
      },
      hunter: {
        general: "Eine Dorfrolle.",
        tasks:
          "Scheidet er aus, darf oder muss er (je nach Option) auf eine lebende Person schießen.",
        options:
          "Schusspflicht: Er muss ein Ziel wählen.\nKeine Schusspflicht: Er darf schießen, wenn er will.",
      },
      idiot: {
        general: "Eine Dorfrolle.",
        tasks:
          "Bei der Abstimmung nach einer Nominierung (Ja oder Nein) muss der Dorftrottel mit Ja stimmen.",
        notes: "Ein stummgeschalteter Dorftrottel darf nicht abstimmen.",
      },
      magician: {
        general: "Eine Dorfrolle.",
        tasks:
          "Er hat zwei Zauber und bestimmt selbst, was er für jeden einsetzt: Heilung des Wolfsopfers oder Tötung einer beliebigen Person.\nEr darf beide Zauber in einer Nacht einsetzen, auch zweimal dasselbe.",
      },
      mayor: {
        general: "Eine Dorfrolle. Er darf seine Rolle nicht preisgeben.",
        options:
          "Doppelte Stimme: Der Erzähler zählt seine Stimme bei Abstimmungen doppelt.\nHammer: Hat er einen Werwolf im Verdacht, darf er ab der zweiten Nacht einmal pro Partie eine lebende Person damit töten wollen. Ist sie ein Werwolf, stirbt sie; hat er eine Dorfrolle gewählt, stirbt er selbst.",
        notes:
          "Todesfälle durch den Hammer können Hexe und Magier nicht heilen.\nNichts schützt vor dem Hammer, auch das Amulett nicht.",
      },
      paranormalInvestigator: {
        general: "Eine Dorfrolle. Seine Fähigkeit hat er einmal pro Partie.",
        tasks:
          "Nachts wählt er eine Person. Dann erfährt er, ob diese Person oder einer ihrer zwei nächsten lebenden Sitznachbarn ein Werwolf ist.",
      },
      seer: {
        general: "Eine Dorfrolle. Es gibt immer genau eine Seherin.",
        tasks: "Jede Nacht sieht sie sich eine Person an und erfährt, ob sie ein Werwolf ist.",
      },
      spellcaster: {
        general: "Eine Dorfrolle.",
        tasks:
          "Jede Nacht schaltet sie eine Person für den nächsten Tag stumm.\nDieselbe Person zweimal hintereinander wählen ist verboten.",
        options:
          "Selbstwahl erlaubt: Sie darf auch sich selbst stummschalten.\nSelbstwahl verboten: Sie muss eine andere Person wählen.",
        notes:
          "Eine stumme Person darf weder sprechen noch nominieren oder abstimmen, kann aber nominiert werden.",
      },
      tanner: {
        general: "Eine Dorfrolle.",
        tasks: "Zu sterben ist sein eigenes Ziel: Dann gewinnt er für sich.",
        options:
          "Sieg bei jedem Ausscheiden: Jeder Tod zählt.\nSieg nur bei Abstimmung: Er muss rausgewählt werden.",
      },
      toughGuy: {
        general: "Eine Dorfrolle. Nach einem Wolfsangriff nimmt er am nächsten Tag normal teil.",
        tasks:
          "Ein Wolfsangriff tötet ihn nicht sofort: In der Angriffsnacht kann er noch gerettet werden, in der Nacht darauf erliegt er seiner Wunde.",
        notes: "Jede andere Todesursache tötet ihn sofort.",
      },
      villagers: {
        general:
          "Gewöhnliche Dorfbewohner haben keine besondere Fähigkeit. Sie spielen mit dem Dorf.",
        tasks: "Sie reden, suchen gemeinsam die Werwölfe und stimmen ab.",
        notes: "Die Anzahl wird automatisch aus deiner Auswahl bestimmt.",
      },
      witch: {
        general: "Eine Dorfrolle.",
        tasks:
          "Für die ganze Partie hat sie einen Heiltrank für das Wolfsopfer und einen Gifttrank für eine beliebige Person.",
        notes:
          "Beide Tränke können in derselben Nacht eingesetzt werden.\nGift auf eine geschützte Person ist trotzdem verbraucht.",
      },
      wolves: {
        general: "Die Werwölfe sind die Gegner des Dorfs.",
        tasks: "Jede Nacht wählen die Werwölfe ein Opfer.",
        notes:
          "In der ersten Nacht lernen sie sich nur kennen, außer der Angriff ab Nacht 1 ist eingeschaltet.\nWähle, wie viele mitspielen; gibt es nur eine mögliche Zahl, ist sie fest.\nDie Empfehlung passt zu den gewählten Rollen; sie ändert deine Wahl nie von selbst.",
      },
    },
  },
};
