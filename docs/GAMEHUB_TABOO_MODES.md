# Entwurf: Tabu-Spielmodi „Auf Zeit“ und „Gegen die Zeit“

Dieses Dokument gehört zu `Ta-06-07`. Die **Regeln** sind laut Akzeptanzkriterium vor der Umsetzung mit dem Auftraggeber abzustimmen. Der Auftraggeber hat am 2026-11-12 die Abläufe festgelegt (Abschnitt 1); alles, was er nicht ausdrücklich beantwortet hat, ist als **Annahme** gekennzeichnet und wartet auf Bestätigung (Abschnitt 6). Stand: Teilaufgaben A (Spiellogik „Auf Zeit“), B (Oberfläche „Auf Zeit“) und C, D und E (Regeln, Leitfaden, Abschlusstest) sind erledigt.

Bezug: `docs/GAMEHUB_TABOO_LOGIC.md` (klassischer Modus), `docs/GAMEHUB_UI_RULES.md` (Ansichten und Knöpfe), `ADR-017` (Spielbausteine).

## 1. Entscheidungen des Auftraggebers

| Frage | Entscheidung |
|---|---|
| Auf Zeit: Ablauf | Jedes Team spielt **am Stück**: ein Lauf bis zur Zielzahl gelöster Karten, danach das nächste Team. |
| Auf Zeit: Überspringen und Gleichstand | **Einmal pro Team**, die übersprungene Karte wird **ersetzt** und zählt nicht. Bei genau gleicher Zeit gewinnen die Teams gemeinsam. |
| Gegen die Zeit: Zeitkonto | **2, 3 oder 5 Minuten wählbar**, für alle Teams gleich. Wer zuerst keine Zeit mehr hat, verliert. |
| Gegen die Zeit: Rollen | Der Vorschlag „Gegnerteam erklärt, aktives Team rät“ wurde **abgelehnt**: Das Gegnerteam könnte absichtlich trödeln und dem ratenden Team Zeit nehmen. Es gilt deshalb: **Das aktive Team erklärt und rät selbst.** Das Gegnerteam sieht nur zu und achtet auf verbotene Wörter. |

## 2. Modus „Auf Zeit“

Kurz: Wer die Zielzahl Karten am schnellsten löst, gewinnt.

**Einstellungen (Stand 2026-11-17):** **Runden pro Team** (1, 3 oder 5 mit den Namen Kurz, Mittel, Lang, Standard Kurz; in jeder Runde spielt jedes Team einen Lauf, es gewinnt die kürzeste **Gesamtzeit**), **Karten pro Team pro Runde** (3, 5 oder 7, Standard 3) und **Stechen bei Gleichstand** (An/Aus, Standard An; bei zwei oder drei gleichen Teams spielt jedes drei Karten so schnell wie möglich wie bei Klassisch). In jedem Lauf kommen die Karten von leicht nach schwer. Die Gruppen stehen in der Reihenfolge von Klassisch. Entscheidungen des Auftraggebers.

**Ablauf:**

1. Die Teams sind in der Reihenfolge des Setups dran (zufällig oder wie eingegeben).
2. Vor jedem Lauf zeigt die Übersicht, wer als Nächstes dran ist (wie die Rundenübersicht, `ScoreScreen`) mit den bisherigen Zeiten.
3. Der Lauf beginnt mit „Lauf starten“. Eine **Stoppuhr** zählt hoch. Ein Mitglied erklärt, die anderen raten.
4. **Richtig:** Die Karte zählt, die nächste erscheint.
5. **Verbotenes Wort:** Die Karte zählt nicht und wird durch eine neue ersetzt (Annahme). Die Uhr läuft weiter, die verlorene Zeit ist die Strafe.
6. **Überspringen:** Einmal pro Team. Die Karte wird ersetzt und zählt nicht. Die Uhr läuft weiter.
7. Der Lauf endet, sobald die Zielzahl gelöster Karten erreicht ist. Die Stoppzeit wird für das Team festgehalten.
8. Nach dem letzten Team folgt der Endstand.

**Sieg:** Die kürzeste Zeit gewinnt. Zeiten werden auf Zehntelsekunden verglichen (Annahme); gleiche Zeit ergibt einen gemeinsamen Sieg.

**Ergebnis korrigieren (2026-11-13, vom Auftraggeber gewünscht):** Nach jedem Lauf und auf der Endseite kann man jede Karte zwischen richtig und falsch umschalten (zum Beispiel wurde „Richtig“ gedrückt, obwohl ein verbotenes Wort fiel). Eine auf falsch korrigierte Karte zählt nicht: Das Team hat dann weniger Karten geschafft und steht hinter Teams mit mehr Karten; bei gleich vielen entscheidet die Zeit. **Annahme:** Es gibt keine Zeitstrafe (wie beim Stechen, wo die Kartenzahl überwiegt). Übersprungene Karten bleiben unverändert. Dasselbe gilt für das Stechen der klassischen Runde.

**Pause:** Die Uhr lässt sich anhalten und fortsetzen wie in der klassischen Runde. Ein Lauf lässt sich neu starten; das verwirft Zeit und Karten dieses Laufs (wie der Neustart eines Zuges).

## 3. Modus „Gegen die Zeit“

Kurz: Jedes Team hat ein Zeitkonto, das nur beim eigenen Raten herunterläuft. Wer zuerst keine Zeit mehr hat, verliert.

**Einstellungen (Stand 2026-11-18):** Zeit pro Team 2, 3 oder 5 Minuten, **Standard 2**.

**Ablauf:**

1. Alle Teams starten mit demselben Konto. Die Teams sind reihum dran.
2. Das aktive Team bekommt **einen Begriff**. Die Uhr **seines** Kontos läuft herunter. Ein Mitglied erklärt, das eigene Team rät. (Ein Aufpassen der Gegner auf verbotene Wörter gibt es in der App nicht; „Verbotenes Wort“ wird vom Team selbst gedrückt.)
3. **Richtig:** Die Uhr stoppt, die Karte zählt (nur als Information), das **nächste Team** ist dran und bekommt seinen Begriff.
4. **Verbotenes Wort:** Die Karte wird durch eine neue ersetzt, die Uhr läuft weiter (Annahme). Das kostet Zeit und ist die Strafe.
5. **Überspringen:** Einmal pro Team (Annahme). Die Karte wird ersetzt, die Uhr läuft weiter. Das Überspringen kostet damit Zeit und kann nicht zum Trödeln benutzt werden.
6. **Ausscheiden:** Erreicht ein Konto 0, ist das Team ausgeschieden und scheidet aus dem Reihum aus.

**Sieg:** Es gewinnt das letzte verbleibende Team; sein Konto zeigt die Restzeit. Bei mehr als zwei Teams entsteht die Platzierung aus der Reihenfolge des Ausscheidens (früher ausgeschieden ist schlechter platziert).

**Pause:** Die Uhr des aktiven Teams lässt sich anhalten und fortsetzen; einen Neustart des Zuges gibt es nicht (er würde Zeit verschenken).

**Karten (Entscheidung beim Bau, Annahme):** Im n-ten Zug haben alle Teams dieselbe Schwierigkeit (leicht, mittel, schwer, dann wieder leicht; nur aus den gewählten Schwierigkeiten). Neue Karten werden bevorzugt, in einem langen Spiel dürfen Karten wiederkehren.

**Korrektur:** Es gibt keine nachträgliche Korrektur eines Ergebnisses (Ausnahme zur Regel „alle Modi“, siehe `docs/GAMEHUB_UI_RULES.md`): Die Uhr lässt sich nicht zurückdrehen, und die gelösten Karten ändern weder Rang noch Sieger.

**Warum das aktive Team selbst erklärt:** Läge das Erklären beim Gegner, könnte er Zeit des ratenden Teams verbrauchen, ohne selbst etwas zu verlieren. Erklärt das eigene Team, verbraucht jedes Team nur seine eigene Zeit.

## 4. Einbindung in die Architektur

**Business-Schicht** (rein, ohne React und Browser, mit Zufall und Uhrzeit als Eingabe, wie die klassische Zustandsmaschine):

- Neue Zustandsmaschinen `race.ts` und `countdown.ts` im Ordner `src/business/games/taboo/`. Sie nutzen dieselben Karten, Filter und denselben Stapel (`buildDeck`) wie der klassische Modus; Ereignisse sind zum Beispiel `startRun`, `correct`, `skip`, `forbiddenWord`, `tick`, `pause`.
- **Umgesetzt anders als zuerst entworfen:** Jeder Modus hat eine **eigene Konfiguration** (`RaceConfiguration`, später `CountdownConfiguration`) neben der klassischen `GameConfiguration`, statt ein `mode`-Feld in diese zu stecken. Der Modus wird in der Oberfläche gewählt (Teilaufgabe B). So bleibt der klassische Modus unverändert und bekommt keine Felder, die er nicht braucht. Die Prüfung der Teams ist als `validateTeams` gemeinsam.
- Prüfung und Zufallsprüfung (Invarianten wie in `stateMachine.invariants.test.ts`): Zeiten nie negativ, Zielzahl nie überschritten, Überspringen höchstens einmal je Team, Konten nur beim aktiven Team verringert, ausgeschiedene Teams nie wieder dran, kein ungültiges Ereignis ändert den Zustand.

**Oberfläche:**

- **Setup:** Neue Knopfgruppe **Spielmodus** (Klassisch, Auf Zeit, Gegen die Zeit) als erste Gruppe der Spieleinstellungen (nach der Kartensprache), mit Info-Knopf. Je Modus zeigt das Setup nur die passenden Gruppen: Klassisch wie bisher (Runden, Dauer, Überspringen, Stechen); Auf Zeit: Zielzahl; Gegen die Zeit: Zeitkonto. Kartenquelle, Schwierigkeit und Kategorien bleiben für alle Modi.
- **Ansichten:** Wieder die festen Typen aus `docs/GAMEHUB_UI_RULES.md`: Übersicht und Endstand mit `ScoreScreen` (Zeiten beziehungsweise Restzeiten statt Punkten), der Zug mit `TimerHud` (`useStopwatch` für Auf Zeit, `useCountdown` für Gegen die Zeit), die Hauptaktion unten fest. Keine neuen Ansichtstypen.
- **Spielregeln:** Das Regelfenster (Knopf „Spielregeln“ in der Kopfleiste des Hauptmenüs) bekommt je Modus einen Abschnitt (Deutsch und Englisch).
- **Handy:** Hauptaktionen unten, 44-Pixel-Ziele; die Layoutprüfung (e2e) deckt jede neue Ansicht in beiden Sprachen ab.

**Persistenz:** Die letzte Gruppe (`Al-09-03`) und die Spielerliste (`Al-09-06`) gelten unverändert für alle Modi.

## 5. Vorschlag für die Teilaufgaben

Die Umsetzung ist groß (der Container `TabooSetup.tsx` hat rund 470 Zeilen). Nach Freigabe in kleinen, einzeln prüfbaren Schritten:

1. **Ta-06-07-A (erledigt):** Business „Auf Zeit“: `race.ts` (Zustandsmaschine mit `overview`, `running`, `finished`; Ereignisse `beginRun`, `answerCard`, `restartRun`), `raceCards.ts` (Schwierigkeitsmischung, Kartenauswahl, Ersatzkarten), Tests und Zufallsprüfung mit 60 Durchläufen.
2. **Ta-06-07-B (erledigt):** Oberfläche „Auf Zeit“: Knopfgruppe „Spielmodus“ (Klassisch, Auf Zeit) und „Karten pro Team“ im Setup (die Gruppen des klassischen Modus sind im Rennen ausgeblendet, ihre Werte bleiben erhalten); die Einstellungen, die nicht vom Modus abhängen, stehen im eigenen Feld „Karten“, `TabooRaceGame` (Übersicht vor jedem Lauf, Endstand mit `ScoreScreen`), `TabooRaceRun` (Stoppuhr mit `TimerHud`, Richtig, Überspringen einmal, Verbotenes Wort, Pause mit Neustart des Laufs), `TabooRaceResults`, Regeln im Fenster „Spielregeln“, Texte in Deutsch und Englisch. Für das Rennen sind je Team Zielzahl plus zwei Ersatzkarten nötig (die Kartenprüfung im Setup meldet es). Tests: Komponentenläufe in beiden Sprachen und eine Handy-Layoutprüfung aller Ansichten.
3. **Ta-06-07-C (erledigt):** Business „Gegen die Zeit“: `countdown.ts` (Zustände `overview`, `running`, `finished`; Ereignisse `beginTurn`, `answerCard`, `timeUp`), `countdownCards.ts` (Schwierigkeit je Zug für alle Teams gleich, Kartenwahl, Kartenprüfung), Tests und Zufallsprüfung mit 60 Spielen.
4. **Ta-06-07-D (erledigt):** Oberfläche „Gegen die Zeit“: Knopfgruppe „Zeit pro Team“ (2, 3, 5 Minuten, Standard 2), `TabooCountdownGame` (Übersicht der Zeitkonten, Endstand), `TabooCountdownRun` (Zug mit `useCountdown`, Pause ohne Neustart), `TabooCountdownResults`, Texte, Regelabschnitt, Tests und Handy-Layoutprüfung. In einem langen Spiel dürfen Karten wiederkommen (neue werden bevorzugt).
5. **Ta-06-07-E (erledigt):** Regeln und Leitfaden aktualisiert: Regelfenster mit Modus und Einstellung, `GAMEHUB_TABOO_LOGIC.md` mit Abschnitt „Gegen die Zeit“, Ausnahme zur Korrektur in `GAMEHUB_UI_RULES.md`, beide Zeitmodi abschließend getestet.

Nach jedem Schritt gilt: alle Tests, Typen, ESLint, Prettier, Schichtprüfung und e2e grün, Commit nur auf Zuruf.

## 6. Offene Bestätigungen (Annahmen)

Diese Punkte hat der Auftraggeber nicht ausdrücklich entschieden:

1. **Zielzahl bei Auf Zeit:** Auswahl 3, 5 oder 7 pro Team und Runde; Standard 3 (vom Auftraggeber festgelegt, zuerst 5, 10, 15).
2. **Verbotenes Wort bei Auf Zeit und Gegen die Zeit:** Karte wird ersetzt und zählt nicht, die Uhr läuft weiter (also keine zusätzliche Zeitstrafe)?
3. **Überspringen bei Gegen die Zeit:** Einmal pro Team, Uhr läuft weiter?
4. **Gleichstand bei Auf Zeit:** Vergleich auf Zehntelsekunden, bei Gleichheit gemeinsamer Sieg?
5. **Mehr als zwei Teams bei Gegen die Zeit:** Ausgeschiedene Teams fallen aus dem Reihum, die Platzierung folgt der Reihenfolge des Ausscheidens?
6. **Kartengerechtigkeit bei Auf Zeit (vom Auftraggeber bestätigt, gehärtet):** Jedes Team bekommt **genau dieselbe Schwierigkeitsmischung** (Zielzahl möglichst gleichmäßig auf die gewählten Schwierigkeiten verteilt, der Rest zuerst auf leicht, dann mittel; bei 5 Karten also 2 leichte, 2 mittlere, 1 schwere). Es gibt **kein Auffüllen aus einer anderen Schwierigkeit**: Fehlt eine Schwierigkeit, meldet das Setup den Kartenmangel, statt den Teams ungleiche Karten zu geben. Ersatzkarten haben genau dieselbe Schwierigkeit; ist keine mehr da, sind „Überspringen“ und „Verbotenes Wort“ gesperrt. Wählt der Spieler nur bestimmte Schwierigkeiten, wird die Mischung nur darauf verteilt. Pro verwendeter Schwierigkeit braucht das Spiel die Karten aller Läufe plus zwei Ersatzkarten je Team.
7. **Reihenfolge der Modi in der Auswahl:** Klassisch, Auf Zeit, Gegen die Zeit?
8. **Gegen die Zeit ohne Korrektur und mit gleicher Schwierigkeit im n-ten Zug:** Ist es richtig, dass es hier keine Ergebniskorrektur gibt und alle Teams im selben Zug dieselbe Schwierigkeit haben?
