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
    teamVillage: "Dorfrolle",
    teamWolves: "Gegner des Dorfes",
    teamOwnGoal: "Dorfrolle mit eigenem Ziel",
    teamExtra: "Zusatz",
    notTogether: "nicht zusammen mit {{role}}",
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
    tooManyPlayers:
      "Zu viele Spieler: höchstens {{maximum}} (bisher {{count}}). Entferne zuerst Spieler.",
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
    wake: {
      open: "Aufwachreihenfolge",
      title: "Aufwachreihenfolge",
      hint: "Der Erzähler weckt die Rollen jede Nacht in dieser Reihenfolge. Rollen, die nicht im Spiel sind, sind abgeblendet.",
      notInGame: "nicht im Spiel",
      wolvesFirstNight: "In der ersten Nacht lernen sie sich nur kennen",
      apprentice: "Der Seher-Lehrling übernimmt, wenn die Seherin tot ist",
      amulet: "Zuletzt: Amulett behalten oder weitergeben",
      timing: {
        firstNight: "Nur in der ersten Nacht",
        thirdNight: "Zu Beginn der dritten Nacht",
        fromSecondNight: "Ab der zweiten Nacht, einmal pro Partie",
      },
      steps: {
        amulet: "Amulettträger",
        cupid: "Amor",
        drunk: "Trunkenbold",
        magician: "Magier",
        mayor: "Bürgermeister mit Hammer",
        paranormalInvestigator: "Paranormaler Ermittler",
        seer: "Seherin",
        spellcaster: "Alte Vettel",
        witch: "Hexe",
        wolves: "Werwölfe",
      },
    },
    info: {
      amulet: {
        general:
          "Der Träger wird zu Beginn zufällig unter den Spielern, die keine Werwölfe sind, ausgelost.\nEs fängt direkte Angriffe und eine Abstimmung ab: Wird der Träger in der Nacht angegriffen, überlebt er, egal von wem.",
        tasks:
          "Der Träger wird jede Nacht als Letzter geweckt und gefragt: Amulett behalten oder weitergeben.\nWurde er in der Nacht angegriffen, muss er es weitergeben.",
        notes:
          "Der Träger kann trotzdem sterben:\ndurch den Hammer\nwenn sein Liebespartner stirbt (nachts gibt er das Amulett vorher weiter, am Tag geht es verloren)\nals Harter Bursche, wenn er das Amulett erst nach dem Angriff bekam",
      },
      apprenticeSeer: {
        general: "Er hat keine Aktion, solange die Seherin lebt.",
        tasks:
          "Ist die Seherin tot, wacht er jede Nacht auf, wählt eine Person und erfährt, ob sie ein Werwolf ist.",
      },
      cupid: {
        tasks:
          "In der ersten Nacht wählt er zwei Verliebte; er selbst darf einer davon sein. Stirbt einer von ihnen, stirbt der andere mit.\nVerliebte töten sich nie gegenseitig und versuchen, als Paar zu gewinnen.",
      },
      drunk: {
        general:
          "Eine Person startet als Trunkenbold und kann sich nicht an ihre wahre Rolle erinnern.\nDie wahre Rolle wird unter allen Rollen außer Amor ausgelost.",
        tasks:
          "Zu Beginn der dritten Nacht nüchtert er aus und erinnert sich an seine wahre Rolle.\nBis dahin ruht seine Fähigkeit.",
        notes:
          "Seherin und Ermittler können die wahre Rolle schon vorher herausfinden.\nIst er in Wahrheit der Jäger und kurz vor dem Tod, nüchtert er vor Adrenalin aus und darf oder muss noch schießen, je nach Option des Jägers.",
      },
      guard: {
        general: "Höchstens eine der beiden ist im Spiel, oder keine.",
        tasks:
          "Jede Nacht wählt die Rolle eine Person, bei der sie die Nacht verbringt.\nDieselbe Person zweimal hintereinander wählen ist verboten.",
        options:
          "Leibwächter: Übernachtet bei der gewählten Person und schützt sie vor Wolfsangriff, Gift und Todeszauber, nicht vor dem Hammer. Er selbst ist nicht geschützt.\nDorfmatratze: Übernachtet bei der gewählten Person und schützt sie nur vor dem Wolfsangriff, nicht vor Gift und Zauber. Sie stirbt an der Stelle der Person; ein direkter Angriff auf sie geht ins Leere, denn sie schläft woanders.",
      },
      hunter: {
        tasks:
          "Scheidet er aus, darf oder muss er (je nach Option) auf eine lebende Person schießen.",
        options:
          "Schusspflicht: Er muss ein Ziel wählen.\nKeine Schusspflicht: Er darf schießen, wenn er will.",
      },
      idiot: {
        tasks:
          "Bei der Abstimmung nach einer Nominierung (Ja oder Nein) muss der Dorftrottel mit Ja stimmen.",
        notes: "Ein stummgeschalteter Dorftrottel darf nicht abstimmen.",
      },
      magician: {
        tasks:
          "Er hat zwei Zauber und bestimmt selbst, was er für jeden einsetzt: Heilung des Wolfsopfers oder Tötung einer beliebigen Person.\nEr darf beide Zauber in einer Nacht einsetzen, auch zweimal dasselbe.",
      },
      mayor: {
        general: "Er darf seine Rolle nicht preisgeben.",
        options:
          "Doppelte Stimme: Der Erzähler zählt seine Stimme bei Abstimmungen doppelt.\nHammer: Hat er einen Werwolf im Verdacht, darf er ab der zweiten Nacht einmal pro Partie eine lebende Person damit töten wollen. Ist sie ein Werwolf, stirbt sie; hat er eine Dorfrolle gewählt, stirbt er selbst.",
        notes:
          "Todesfälle durch den Hammer können Hexe und Magier nicht heilen.\nNichts schützt vor dem Hammer, auch das Amulett nicht.",
      },
      paranormalInvestigator: {
        general: "Seine Fähigkeit hat er einmal pro Partie.",
        tasks:
          "Nachts wählt er eine Person. Dann erfährt er, ob diese Person oder einer ihrer zwei nächsten lebenden Sitznachbarn ein Werwolf ist.",
      },
      seer: {
        general: "Es gibt immer genau eine Seherin.",
        tasks: "Jede Nacht sieht sie sich eine Person an und erfährt, ob sie ein Werwolf ist.",
      },
      spellcaster: {
        tasks:
          "Jede Nacht schaltet sie eine Person für den nächsten Tag stumm.\nDieselbe Person zweimal hintereinander wählen ist verboten.",
        options:
          "Selbstwahl erlaubt: Sie darf auch sich selbst stummschalten.\nSelbstwahl verboten: Sie muss eine andere Person wählen.",
        notes:
          "Eine stumme Person darf weder sprechen noch nominieren oder abstimmen, kann aber nominiert werden.",
      },
      tanner: {
        tasks: "Zu sterben ist sein eigenes Ziel: Dann gewinnt er für sich.",
        options:
          "Sieg bei jedem Ausscheiden: Jeder Tod zählt.\nSieg nur bei Abstimmung: Er muss rausgewählt werden.",
      },
      toughGuy: {
        general: "Nach einem Wolfsangriff nimmt er am nächsten Tag normal teil.",
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
        tasks:
          "Für die ganze Partie hat sie einen Heiltrank für das Wolfsopfer und einen Gifttrank für eine beliebige Person.",
        notes:
          "Beide Tränke können in derselben Nacht eingesetzt werden.\nGift auf eine geschützte Person ist trotzdem verbraucht.",
      },
      wolves: {
        tasks: "Jede Nacht wählen die Werwölfe ein Opfer.",
        notes:
          "In der ersten Nacht lernen sie sich nur kennen, außer der Angriff ab Nacht 1 ist eingeschaltet.\nWähle, wie viele mitspielen; gibt es nur eine mögliche Zahl, ist sie fest.\nDie Empfehlung passt zu den gewählten Rollen; sie ändert deine Wahl nie von selbst.",
      },
    },
  },
};
