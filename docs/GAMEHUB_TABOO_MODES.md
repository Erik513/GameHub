# Entwurf: Tabu-Spielmodi „Auf Zeit“ und „Gegen die Zeit“

Dieses Dokument gehört zu `PH-12-07`. Die **Regeln** sind laut Akzeptanzkriterium vor der Umsetzung mit dem Auftraggeber abzustimmen. Der Auftraggeber hat am 2026-11-12 die Abläufe festgelegt (Abschnitt 1); alles, was er nicht ausdrücklich beantwortet hat, ist als **Annahme** gekennzeichnet und wartet auf Bestätigung (Abschnitt 6). Es wurde noch **nichts gebaut**.

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

**Einstellungen:** Zielzahl gelöster Karten (Annahme: wählbar 5, 10 oder 15, Standard 10).

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

**Pause:** Die Uhr lässt sich anhalten und fortsetzen wie in der klassischen Runde. Ein Lauf lässt sich neu starten; das verwirft Zeit und Karten dieses Laufs (wie der Neustart eines Zuges).

## 3. Modus „Gegen die Zeit“

Kurz: Jedes Team hat ein Zeitkonto, das nur beim eigenen Raten herunterläuft. Wer zuerst keine Zeit mehr hat, verliert.

**Einstellungen:** Zeitkonto 2, 3 oder 5 Minuten.

**Ablauf:**

1. Alle Teams starten mit demselben Konto. Die Teams sind reihum dran.
2. Das aktive Team bekommt **einen Begriff**. Die Uhr **seines** Kontos läuft herunter. Ein Mitglied erklärt, das eigene Team rät; das Gegnerteam achtet auf verbotene Wörter.
3. **Richtig:** Die Uhr stoppt, die Karte zählt (nur als Information), das **nächste Team** ist dran und bekommt seinen Begriff.
4. **Verbotenes Wort:** Die Karte wird durch eine neue ersetzt, die Uhr läuft weiter (Annahme). Das kostet Zeit und ist die Strafe.
5. **Überspringen:** Einmal pro Team (Annahme). Die Karte wird ersetzt, die Uhr läuft weiter. Das Überspringen kostet damit Zeit und kann nicht zum Trödeln benutzt werden.
6. **Ausscheiden:** Erreicht ein Konto 0, ist das Team ausgeschieden und scheidet aus dem Reihum aus.

**Sieg:** Es gewinnt das letzte verbleibende Team; sein Konto zeigt die Restzeit. Bei mehr als zwei Teams entsteht die Platzierung aus der Reihenfolge des Ausscheidens (früher ausgeschieden ist schlechter platziert).

**Pause:** Die Uhr des aktiven Teams lässt sich anhalten.

**Warum das aktive Team selbst erklärt:** Läge das Erklären beim Gegner, könnte er Zeit des ratenden Teams verbrauchen, ohne selbst etwas zu verlieren. Erklärt das eigene Team, verbraucht jedes Team nur seine eigene Zeit.

## 4. Einbindung in die Architektur

**Business-Schicht** (rein, ohne React und Browser, mit Zufall und Uhrzeit als Eingabe, wie die klassische Zustandsmaschine):

- Neue Zustandsmaschinen `race.ts` und `countdown.ts` im Ordner `src/business/games/taboo/`. Sie nutzen dieselben Karten, Filter und denselben Stapel (`buildDeck`) wie der klassische Modus; Ereignisse sind zum Beispiel `startRun`, `correct`, `skip`, `forbiddenWord`, `tick`, `pause`.
- `GameConfiguration` bekommt den Modus (`mode: "classic" | "race" | "countdown"`, Standard `classic`) und die modusbezogenen Werte (`raceTarget`, `countdownSeconds`). Bestehende Partien und Tests bleiben unverändert gültig.
- Prüfung und Zufallsprüfung (Invarianten wie in `stateMachine.invariants.test.ts`): Zeiten nie negativ, Zielzahl nie überschritten, Überspringen höchstens einmal je Team, Konten nur beim aktiven Team verringert, ausgeschiedene Teams nie wieder dran, kein ungültiges Ereignis ändert den Zustand.

**Oberfläche:**

- **Setup:** Neue Knopfgruppe **Spielmodus** (Klassisch, Auf Zeit, Gegen die Zeit) als erste Gruppe der Spieleinstellungen (nach der Kartensprache), mit Info-Knopf. Je Modus zeigt das Setup nur die passenden Gruppen: Klassisch wie bisher (Runden, Dauer, Überspringen, Stechen); Auf Zeit: Zielzahl; Gegen die Zeit: Zeitkonto. Kartenquelle, Schwierigkeit und Kategorien bleiben für alle Modi.
- **Ansichten:** Wieder die festen Typen aus `docs/GAMEHUB_UI_RULES.md`: Übersicht und Endstand mit `ScoreScreen` (Zeiten beziehungsweise Restzeiten statt Punkten), der Zug mit `TimerHud` (`useStopwatch` für Auf Zeit, `useCountdown` für Gegen die Zeit), die Hauptaktion unten fest. Keine neuen Ansichtstypen.
- **Spielregeln:** Das Fenster „Spielregeln“ bekommt je Modus einen Abschnitt (Deutsch und Englisch).
- **Handy:** Hauptaktionen unten, 44-Pixel-Ziele; die Layoutprüfung (e2e) deckt jede neue Ansicht in beiden Sprachen ab.

**Persistenz:** Die letzte Gruppe (`PH-17-03`) und die Spielerliste (`PH-17-06`) gelten unverändert für alle Modi.

## 5. Vorschlag für die Teilaufgaben

Die Umsetzung ist groß (der Container `TabooSetup.tsx` hat rund 470 Zeilen). Nach Freigabe in kleinen, einzeln prüfbaren Schritten:

1. **PH-12-07-A:** Business „Auf Zeit“ (Zustandsmaschine, Konfiguration, Tests, Zufallsprüfung).
2. **PH-12-07-B:** Oberfläche „Auf Zeit“ (Spielmodus-Auswahl im Setup, Lauf, Übersicht, Endstand, Spielregeln, e2e).
3. **PH-12-07-C:** Business „Gegen die Zeit“.
4. **PH-12-07-D:** Oberfläche „Gegen die Zeit“.
5. **PH-12-07-E:** Dokumentation (Logik, Regeln, Leitfaden), Abschlussprüfung.

Nach jedem Schritt gilt: alle Tests, Typen, ESLint, Prettier, Schichtprüfung und e2e grün, Commit nur auf Zuruf.

## 6. Offene Bestätigungen (Annahmen)

Diese Punkte hat der Auftraggeber nicht ausdrücklich entschieden:

1. **Zielzahl bei Auf Zeit:** Auswahl 5, 10 oder 15, Standard 10?
2. **Verbotenes Wort bei Auf Zeit und Gegen die Zeit:** Karte wird ersetzt und zählt nicht, die Uhr läuft weiter (also keine zusätzliche Zeitstrafe)?
3. **Überspringen bei Gegen die Zeit:** Einmal pro Team, Uhr läuft weiter?
4. **Gleichstand bei Auf Zeit:** Vergleich auf Zehntelsekunden, bei Gleichheit gemeinsamer Sieg?
5. **Mehr als zwei Teams bei Gegen die Zeit:** Ausgeschiedene Teams fallen aus dem Reihum, die Platzierung folgt der Reihenfolge des Ausscheidens?
6. **Kartengerechtigkeit bei Auf Zeit:** Bekommt jedes Team Karten gleicher Schwierigkeit (gleiche Mischung), damit die Zeiten vergleichbar sind, oder werden einfach nacheinander Karten gezogen?
7. **Reihenfolge der Modi in der Auswahl:** Klassisch, Auf Zeit, Gegen die Zeit?
