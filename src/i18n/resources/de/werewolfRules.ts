/** Die Spielanleitung von Werwolf; die Erklärungen der einzelnen Rollen stehen in `werewolfConfig.ts` (info). */
export const werewolfRulesTexts = {
  werewolfRules: {
    title: "Spielanleitung Werwolf",
    label: "Spielanleitung",
    tabGame: "Spiel",
    tabRoles: "Rollen",
    tabExtras: "Optionen",
    game: {
      goalTitle: "Ziel",
      goal: "Werwolf ist ein Spiel aus Verdacht und Täuschung. Eine Person leitet die Partie als Erzähler, alle anderen spielen mit einer geheimen Rolle. Das Dorf will alle Werwölfe finden, die Werwölfe wollen das Dorf auslöschen.",
      teams:
        "Dorf: Dorfbewohner, Seherin und die meisten Sonderrollen. Das Dorf gewinnt, sobald kein Werwolf mehr lebt.\nWerwölfe: Sie kennen sich und töten jede Nacht ein Mitglied des Dorfes. Sie gewinnen, sobald es mindestens so viele Werwölfe wie Mitglieder der Dorfseite gibt.\nEigenes Ziel: Der Gerber gewinnt für sich allein, wenn er stirbt.",
      prepTitle: "Vorbereitung",
      prepSteps:
        "Alle setzen sich im Kreis, der Erzähler gehört dazu. Die Sitzreihenfolge legst du in der App fest: Sitz 1 ist links neben dem Erzähler, dann geht es im Uhrzeigersinn weiter.\nDer Erzähler spielt nicht mit und hat keine Rolle. Er leitet die Partie und sagt der Gruppe, was passiert.\nJede Person erfährt ihre Rolle geheim und zeigt sie niemandem.",
      nightTitle: "Die Nacht",
      nightSteps:
        "Alle schließen die Augen. Der Erzähler ruft die Rollen nacheinander in einer festen Reihenfolge auf. Wer aufgerufen wird, öffnet die Augen und handelt lautlos; danach schließt er sie wieder. Aufgerufen werden nur Rollen, die noch leben.\nZuerst kommen die Werwölfe. Sie einigen sich schweigend auf ein Opfer. In der ersten Nacht lernen sie sich nur kennen, außer der Wolfsangriff ab Nacht 1 ist eingeschaltet. Einigen sie sich nicht in der vom Erzähler gesetzten Zeit, entfällt der Angriff.\nDie Seherin zeigt auf eine Person und erfährt durch ein lautloses Zeichen, ob sie ein Werwolf ist.\nDanach folgen die Sonderrollen, die im Spiel sind. Ihre Aufgaben stehen im Reiter „Rollen“.",
      nightHint: "Die ganze Reihenfolge zeigt der Knopf „{{button}}“ in der Konfiguration.",
      morningTitle: "Der Morgen",
      morning:
        "Der Erzähler weckt das Dorf und sagt, wer in der Nacht gestorben ist, nur den Namen, nie die Rolle.\nWer ausgeschieden ist, schaut schweigend zu und stimmt nicht mehr ab.",
      dayTitle: "Der Tag",
      daySteps:
        "Das Dorf bespricht, wem es misstraut.\nEine lebende Person nominiert jemanden, eine zweite unterstützt die Nominierung.\nDie genannte Person verteidigt sich kurz.\nAlle Lebenden stimmen gleichzeitig ab. Eine strikte Mehrheit lässt die Person ausscheiden, und der Tag endet.\nBei Gleichstand oder weniger Zustimmung geht die Diskussion weiter, und es kann neu nominiert werden. Ist das vom Erzähler gesetzte Zeitlimit erreicht, kann er den Tag ohne Ausscheiden beenden.\nWer am Tag ausscheidet, darf seine Rolle aufdecken, muss es aber nicht. Wer in der Nacht stirbt, dessen Rolle wird nicht genannt; nur der Jäger verrät sich durch seinen Schuss.",
      winTitle: "Wer gewinnt",
      win: "Das Dorf gewinnt, sobald alle Werwölfe ausgeschieden sind.\nDie Werwölfe gewinnen, sobald mindestens so viele Werwölfe wie Mitglieder der Dorfseite leben, auch bei 1 zu 1 oder 2 zu 2. Die Seherin zählt zur Dorfseite.\nVerliebte zählen zu ihrer jeweiligen Seite.\nDer Gerber gewinnt für sich allein, wenn er stirbt: je nach Option bei jedem Ausscheiden oder nur durch Abstimmung.",
    },
    roles: {
      intro:
        "Jede Rolle hat eine Mindestspielerzahl. Welche Rollen mitspielen, legt der Erzähler in der Konfiguration fest. Die Werwölfe und die Seherin gibt es immer; Dorfbewohner füllen die übrigen Plätze auf, falls welche frei bleiben.",
      coreTitle: "Grundrollen",
      specialTitle: "Sonderrollen",
    },
    extras: {
      addonsTitle: "Zusätze",
      addonsIntro:
        "Zusätze sind keine eigenen Rollen, sondern kommen zusätzlich ins Spiel. Auch sie brauchen eine Mindestspielerzahl.",
      settingsTitle: "Einstellungen",
      settings:
        "Wolfsangriff: Die Werwölfe greifen ab Nacht 1 oder erst ab Nacht 2 an. Bis dahin lernen sie sich nur kennen.\nAusgeschiedene Rollen: Das Spiel nennt nie die Rolle einer ausgeschiedenen Person. Die Gruppe schließt aus der Nacht, wer fehlt: Der Erzähler weckt nur Rollen, die noch leben. Wer am Tag ausscheidet, darf seine Rolle aufdecken, muss es aber nicht.\nWerwölfe: Wie viele mitspielen, hängt von der Spielerzahl ab. Gibt es mehrere mögliche Zahlen, wählst du sie; eine Empfehlung passt zu den gewählten Rollen, ändert deine Wahl aber nie von selbst.",
      fixedTitle: "Feste Rollen",
      fixed:
        "Du bestimmst genau, welche Rollen mitspielen. Tippe eine Rolle an, um sie ins Spiel zu nehmen; tippe sie erneut an, um sie wegzulassen.\nRollen mit Optionen wählst du über ihre Varianten.\nRollen, die zu den gewählten nicht passen oder für die kein Platz mehr frei ist, sind gesperrt; der Grund steht im Info-Fenster.\nDie übrigen Plätze füllt die App mit Dorfbewohnern auf.",
      variableTitle: "Variable Rollen",
      variable:
        "Du legst nur Grenzen fest, die App lost die Aufstellung beim Start aus. Jede Rolle und jeder Zusatz steht in einem von drei Kästen: Muss ins Spiel, Darf ins Spiel oder Soll nicht ins Spiel. Zieh sie in einen Kasten oder tippe sie an. Zusätze sind bläulich.\nMuss: Diese Rollen spielen immer mit.\nDarf: Daraus wird gelost. Mit „Mindestens“ und „Höchstens“ legst du fest, wie viele dieser Sonderrollen mitspielen; jede Zahl dazwischen ist gleich wahrscheinlich.\nJede Rolle auf „Darf“ hat dieselbe Chance. Stehen beide Optionen einer Rolle auf „Darf“, wird eine ausgelost; Leibwächter und Dorfmatratze zählen als eine Rolle, ebenso Hexe und Magier, wo sie nicht zusammen spielen dürfen.\nZusätze auf „Darf“ werden einzeln ausgelost, jeder mit der gleichen Chance, dabei zu sein oder nicht.\nSoll nicht: Diese Rollen spielen nie mit.\nStehen mehrere Wolfszahlen zur Wahl, wird auch die Wolfszahl ausgelost.\nDer Erzähler weckt nachts nur die Rollen, die tatsächlich im Spiel sind.",
      toolsTitle: "Hilfen in der App",
      tools:
        "Aufwachreihenfolge: Zeigt, in welcher Reihenfolge der Erzähler die Rollen nachts weckt.\nSitzkreis anzeigen: Zeigt die Sitzreihenfolge als Kreis.\nInfo-Knöpfe: Jede Rolle und jeder Zusatz erklärt sich selbst.",
    },
  },
};
