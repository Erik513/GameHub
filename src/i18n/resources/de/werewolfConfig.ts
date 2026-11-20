/** Die Texte der Werwolf-Konfiguration (feste Rollen); die Texte der Aufstellung stehen in `werewolf.ts`. */
export const werewolfConfigTexts = {
  werewolfConfig: {
    open: "Konfiguration",
    rolesTab: "Rollen",
    rulesTab: "Spielregeln",
    modeLabel: "Art der Rollen",
    modeFixed: "Feste Rollen",
    modeVariable: "Variable Rollen",
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
      anyAttack: "Jeder Angriff",
      anyDeath: "Sieg bei jedem Ausscheiden",
      bodyguard: "Leibwächter",
      doubleVote: "Doppelte Stimme",
      forbidden: "Selbstwahl verboten",
      hammer: "Hammer",
      nightGuest: "Dorfmatratze",
      optional: "Keine Schusspflicht",
      required: "Schusspflicht",
      voteOnly: "Sieg nur bei Abstimmung",
      wolfOnly: "Nur Wolfsangriff",
    },
    variantHint:
      "Tippe eine Rolle an, um sie ins Spiel zu nehmen. Eine Rolle mit Optionen hat für jede Option eine Hälfte; tippe die gewählte Hälfte erneut an, um die Rolle wegzulassen.",
    variable: {
      box: {
        must: "Muss ins Spiel",
        may: "Darf ins Spiel",
        not: "Soll nicht ins Spiel",
      },
      lock: {
        incompatibleRoles: "Sie spielt nicht zusammen mit den Rollen, die im Spiel sind.",
        insufficientSeats: "Es ist kein Platz mehr frei.",
        requiredAlternative: "Die andere Rolle dieses Paars muss ins Spiel.",
        requiredOption: "Eine andere Option dieser Rolle muss ins Spiel.",
      },
      rolesHeading: "Rollen und Zusätze",
      rangeTitle: "Sonderrollen aus Darf",
      minimum: "Mindestens",
      maximum: "Höchstens",
      less: "{{what}}: eine weniger",
      more: "{{what}}: eine mehr",
      rangePossible: "Möglich: {{minimum}} bis {{maximum}}",
      rangeNone: "Noch keine Rolle auf Darf.",
      mayInfo: {
        label: "Was bedeutet \"Darf ins Spiel\"?",
        roles:
          "Die Rollen in diesem Kasten sind nicht sicher: Das Spiel lost unter ihnen aus.\nWie viele davon gezogen werden, legst du unten mit \"Mindestens\" und \"Höchstens\" fest.\nDie gezogenen Rollen spielen mit, die anderen bleiben draußen. Welche, wird beim Start des Spiels gelost.\nIn der Nacht weckt der Erzähler nur die Rollen, die im Spiel sind.",
        items:
          "Auch die Zusätze in diesem Kasten sind nicht sicher: Jeder wird für sich gelost, mit der gleichen Chance, dabei zu sein oder nicht.\nGelost wird beim Start des Spiels.\nDie Anzahl der Zusätze wird nicht von der Spanne unten begrenzt.",
      },
      cannotStart: "Mit {{count}} Spielern ist diese Auswahl nicht spielbar.",
    },
    wake: {
      open: "Aufwachreihenfolge",
      title: "Aufwachreihenfolge",
      hint: "Der Erzähler weckt die Rollen jede Nacht in dieser Reihenfolge. Rollen, die nicht im Spiel sind, sind abgeblendet. Bei geheimer Rollenaufdeckung werden auch ausgeschiedene Rollen zur Tarnung aufgerufen.",
      notInGame: "nicht im Spiel",
      maybe: "Darf ins Spiel: wird nur geweckt, wenn sie gezogen wird",
      hintVariable:
        "Der Erzähler ruft die Rollen jede Nacht in dieser Reihenfolge. Der Erzähler weckt nur die Rollen, die im Spiel sind: eine Rolle, die ins Spiel darf, wird nur geweckt, wenn die Ziehung sie genommen hat. Rollen, die nicht ins Spiel sollen, sind abgeblendet.",
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
          "Der Träger wird zu Beginn zufällig unter den Spielern, die keine Werwölfe sind, ausgelost.\nEs fängt die Angriffe der Nacht ab (Wolfsangriff, Gift, Todeszauber): Wird der Träger nachts angegriffen, überlebt er.",
        tasks:
          "Der Träger wird jede Nacht als Letzter geweckt und gefragt: Amulett behalten oder weitergeben.\nHat es einen Angriff abgefangen, muss er es weitergeben.\nEr darf es jeder lebenden Person geben, auch einem Werwolf.",
        notes:
          "Der Träger kann trotzdem sterben:\ndurch Hammer, Abstimmung oder Jägerschuss (so erfährt niemand, wer das Amulett hat)\nwenn sein Liebespartner stirbt (er stirbt aus Liebeskummer mit, das Amulett geht dann verloren)\nals Harter Bursche, wenn er das Amulett erst nach dem Angriff bekam",
      },
      apprenticeSeer: {
        general: "Er hat keine Aktion, solange die Seherin lebt.",
        tasks:
          "Ist die Seherin tot, wacht er jede Nacht auf, wählt eine Person und erfährt, ob sie ein Werwolf ist.",
      },
      cupid: {
        tasks:
          "In der ersten Nacht wählt er zwei Verliebte; er selbst darf einer davon sein. Sie erkennen einander und behalten ihre Rollen. Stirbt einer von ihnen, stirbt der andere mit.",
        notes:
          "Verliebte versuchen, gemeinsam zu überleben: Als Werwolf greift man den Partner nicht an, als Dorfrolle stimmt man nicht gegen ihn. Zwingend ist das nicht.",
      },
      drunk: {
        general:
          "Eine Person startet als Trunkenbold und kann sich nicht an ihre wahre Rolle erinnern.\nDie wahre Rolle wird unter allen Rollen im Spiel außer Amor ausgelost.",
        tasks:
          "Zu Beginn der dritten Nacht nüchtert er aus und erinnert sich an seine wahre Rolle.\nBis dahin ruht seine Fähigkeit.",
        notes:
          "Seherin und Ermittler erfahren die wahre Rolle schon vorher.\nIst er in Wahrheit ein Werwolf, wacht er erst nach der Enthüllung mit den Wölfen auf.\nIst er in Wahrheit der Jäger und kurz vor dem Tod, nüchtert er vor Adrenalin aus und darf oder muss noch schießen, je nach Option des Jägers.",
      },
      guard: {
        general: "Leibwächter und Dorfmatratze schließen sich aus: Höchstens eine von ihnen ist im Spiel, oder keine.",
        tasks:
          "Jede Nacht wählt die Rolle eine andere Person, bei der sie die Nacht verbringt.\nDieselbe Person zweimal hintereinander wählen ist verboten.",
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
        tasks:
          "Ein Angriff tötet ihn nicht sofort: Er nimmt am nächsten Tag normal teil und erliegt in der Nacht darauf seiner Wunde.",
        options:
          "Nur Wolfsangriff: Nur ein Wolfsangriff wirkt so.\nJeder Angriff: Auch Gift, Todeszauber und Jägerschuss wirken so.",
        notes:
          "In der Angriffsnacht lässt sich nur ein Wolfsangriff noch heilen.\nHammer, Abstimmung und der Tod des Liebespartners töten ihn sofort.",
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
