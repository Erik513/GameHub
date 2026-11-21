# Aufgabe für Codex: Nachtskript und Dokumentation des variablen Modus

Stand: 21.11.2026. Auftraggeber: Claude (UI-Anbindung) für den Auftraggeber. Bereich: Logik (`src/business/games/werewolf`).

## Hintergrund

Die Ziehung des variablen Modus wurde geändert (Commit „Variable roles: …“, Datei `variableSetup.ts`):

- Jede einzelne Rolle auf „Darf“ hat dieselbe Chance, im Pool zu landen. Eine Gruppe mit zwei Varianten (Leibwächter/Dorfmatratze, Hexe/Magier dort, wo beide nicht zusammen spielen dürfen) zählt für die Ziehung doppelt und bekommt danach ihre Variante 50/50 (`familyChances`, `pickFamilies`).
- Hexe und Magier zählen als **zwei** Rollen, wo sie zusammen spielen dürfen (siehe `validWerewolfRoles`; ab 14 Spielern mit 4 Wölfen, ab 17 auch mit 5), und als **eine** Rolle, wo sie das nicht dürfen und beide auf „Darf“ stehen (`familiesForWolves`). Beide auf „Muss“ bleibt dort erlaubt, wo die Regeln es zulassen.
- Es sind nicht mehr alle Kombinationen gleich wahrscheinlich, dafür jede einzelne Rolle (soweit rechnerisch möglich; braucht eine Gruppe mehr als 100 %, bekommt sie 100 %).

## Aufgabe 1: Keine Scheinaufrufe für nicht gezogene Rollen

Der Auftraggeber hat entschieden: **Der Erzähler weckt nur Rollen, die tatsächlich im Spiel sind.** Es gibt keine Aufrufe, die nur verschleiern, dass eine Rolle aus dem Pool nicht gezogen wurde.

Betroffen ist `nightScript.ts`:

- `inPool` (Rolle steht in `nightRolePool`, aber niemand hat sie) darf keinen Modus `cover` mehr erzeugen; die Stufe entfällt (`skip`).
- Der Trunkenbold-Aufruf (`drunkCover` über `nightItemPool`) entfällt ebenso, wenn der Trunkenbold nicht im Spiel ist.
- Der Lehrling der Seherin (`possibleApprentice` aus `nightRolePool`) entfällt, wenn er nicht im Spiel ist.
- `cover` bleibt dort richtig, wo die Rolle im Spiel ist, aber verborgen bleibt (Rollen werden nach dem Tod nicht aufgedeckt, verdeckter Trunkenbold).
- Prüfen, ob `nightRolePool`, `nightItemPool` und `nightMayUseHammer` danach noch gebraucht werden; falls nicht, entfernen oder begründen, warum sie bleiben.
- Die Tests in `nightScript.test.ts` und `variableSetup.test.ts` entsprechend anpassen.

Die Weckreihenfolge in der Oberfläche (Fenster „Weckreihenfolge“) sagt schon: „Eine Rolle, die ins Spiel darf, wird nur geweckt, wenn die Ziehung sie genommen hat.“ Der echte Ablauf muss dazu passen.

## Aufgabe 2: Dokumentation an die neue Ziehung anpassen

`docs/GAMEHUB_WERWOLF_VARIABLE_API.md` beschreibt noch gleich wahrscheinliche Teilmengen. Anpassen:

- Ablauf: 1. Wolfszahl aus den gewählten auslosen. 2. Zahl A der Rollen auf „Darf“ gleichverteilt unter den möglichen Zahlen. 3. Genau A Gruppen ziehen, sodass jede einzelne Rolle dieselbe Chance hat; dann je Gruppe die Variante und je Rolle mit mehreren Optionen die Option auslosen. 4. Zusätze auf „Darf“ einzeln mit 50 %. 5. Rest mit Dorfbewohnern auffüllen.
- Beispiele mit Zahlen: Leibwächter, Dorfmatratze, Amor, Hexe mit A = 2 → je Rolle 50 %; mit A = 1 → je 25 %; mit A = 3 → Amor und Hexe sicher, je Wächter 50 %.
- Hinweis zu Hexe/Magier je Wolfszahl.

## Nicht Teil dieser Aufgabe

- Anbindung von „Spiel starten“ an `createVariableWerewolf` und die Anzeige im Spiel (Claude, UI-Plan Schritt 3 / We-01-49).
- Änderungen an der Oberfläche oder an den Übersetzungen.

## Abnahme

- `nightScript`: Für eine nicht gezogene Rolle aus dem Pool gibt es keinen Aufruf.
- Alle bestehenden Tests laufen, `tsc` und `eslint` sind sauber.
- `GAMEHUB_WERWOLF_VARIABLE_API.md` stimmt mit der Ziehung überein.


## Umsetzung der Nacht-Aufgabe (We-03-68, 21.11.2026)

Die Nachtlogik ist umgesetzt und im Werwolf-UI-Arbeitsstand unter C:/Users/Kosta/source/repos/GameHub übernommen. Keine UI-Datei oder Übersetzung wurde geändert. Geänderte Logik: nightScript.ts, stateMachine.ts (nur entfernte Match-Felder), balancedSetup.ts und createVariableWerewolf in variableSetup.ts (keine Pool-Metadaten mehr). Tests: nightScript.test.ts neu, narrator.test.ts und variableSetup.test.ts angepasst. Claudes familiesForWolves/familyChances/pickFamilies bleiben unverändert.

Die neuen Prüfungen decken nicht gezogene Rollen, veraltete gespeicherte Pool-Felder, vorhandene verdeckte Rollen, Trunkenbold, Lehrling, Hammer-Varianten und den echten Phasenablauf ab. Ein Seher-Lehrling wird nicht mehr angekündigt, wenn keiner mitspielt. Vorhandene nightCall-/acknowledgeCall-Schritte bleiben für legitime Tarnaufrufe erhalten.

431 Werwolf-Tests inklusive 100 kompletter Partien und Ziehungsprüfungen bestanden. Nachtmodul 100 % Zeilen/Zweige; geprüfte kritische Logik insgesamt 99,73 % Zeilen / 98,15 % Zweige. Typprüfung im Logik-Arbeitsordner, ESLint, Format und Schichtprüfung erfolgreich. Breiter Testlauf dort: 1.091 Tests; aktueller UI-Arbeitsstand: 1.472 Tests erfolgreich. Lange Forschungs-/Balance-Simulationen ausgenommen. Gesamt-Typprüfung im UI-Arbeitsstand meldet fünf nachweislich vorbestehende UI-Fehler (auch mit ursprünglichen Logikdateien reproduziert); Übergabe enthält Fundstellen. Keine UI-Fehler in dieser Aufgabe verändert.

### Unabhängige Typfehler im aktuellen UI-Arbeitsstand für Claude

Mit einem Compiler-Dateiüberlagerungstest gegen die ursprünglichen Business-Dateien reproduziert; die tatsächlichen UI-Dateien wurden dafür nicht geändert:

- src/presentation/werewolf/VariableRoles.test.tsx:78 – it.each-Zeile mit vier Werten, Callback nur drei Parametern (TS2345).
- src/presentation/werewolf/VariableRoles.tsx:138 – dragging.drag möglicherweise undefined (TS18048).
- src/presentation/werewolf/WerewolfGame.test.tsx:15, :252 und :299 – erforderliche GameScreenProps cardLanguage und onCardLanguageChange fehlen (TS2769).

Die Gesamt-Typprüfung der UI ist deshalb noch nicht grün. Die Logik-Typprüfung und alle 1.472 normalen Tests im UI-Arbeitsstand bestehen. Lange historische Forschungs-/Balance-Läufe wurden nicht erneut gestartet. Es wurde weder committed noch gepusht.

## Bestätigte Regelklarstellungen vom 21.11.2026 (für Codex, Stand der Logik im Branch game/werewolf-ui)

Diese Punkte hat der Auftraggeber im Gespräch geprüft und bestätigt. Sie entsprechen dem aktuellen Code; sie sind hier festgehalten, damit sie bei Änderungen erhalten bleiben (jeweils mit Test, wo vorhanden).

### Reihenfolge der Nacht

Amor, Liebespaar (beide nur Nacht 1), Trunkenbold-Enthüllung (Beginn Nacht 3), Leibwächter oder Dorfmatratze, Werwölfe, Seherin (nach ihrem Tod der Seher-Lehrling), Paranormaler Ermittler, Hexe, Magier, **Bürgermeister mit Hammer (ab Nacht 2)**, Alte Vettel, **Amulett (Behalten oder Weitergeben, letzter Nachtschritt)**, dann die Morgenauflösung. Der Bürgermeister kommt also **nach** Hexe und Magier, nicht davor. Begründung der Reihenfolge der letzten drei: Alle Tötungen (Wölfe, Hexe, Magier, Hammer) stehen beisammen; der Hammer ist nicht heilbar und soll Hexe und Magier nicht bekannt sein; das Amulett steht zuletzt, weil erst nach dem Magier feststeht, ob es einen Angriff abgefangen hat. Die Alte Vettel wirkt nur auf den Tag und beeinflusst keinen Todesfall.

### Zeitpunkt des Todes

- In der Nacht entfernt keine Aktion eine Person aus `alive`; Wolfsopfer, Gift, Todeszauber und Hammer sind nur vorgemerkt. Auch ein vorgemerktes Opfer wacht auf und darf handeln.
- Heilen (Hexe, Magier) ist bis zum Ende des Magier-Schritts möglich. Hammer und Hammer-Strafe sind nie heilbar.
- Alle vorgemerkten Todesfälle (auch Liebeskummer, getroffener Werwolf, Bürgermeister mit Strafe) treten gleichzeitig bei der Morgenauflösung ein; dabei verschwindet das Amulett, wenn sein Träger dabei ist. Der Sieg wird erst nach der vollständigen Auflösung geprüft.
- Ausnahmen: Harter Bursche stirbt erst in der Nacht nach einem wirksamen Angriff (Hammer und Liebeskummer sofort); der Jäger stirbt am Morgen und schießt danach, sein Ziel stirbt sofort; Tagesabstimmungen wirken, wenn der Erzähler das Ergebnis ansagt.

### Alte Vettel

Wählbar ist jede Person, die zu Beginn der Nacht lebte, auch ein vorgemerktes Opfer (sonst ließe sich ablesen, wer stirbt). Sie selbst nur bei „Selbstwahl erlaubt“; nie dieselbe Person wie in der Vornacht; Verzicht ist erlaubt. Stirbt die gewählte Person am Morgen, gibt es am Tag niemanden, der stumm ist; das fällt nicht auf. Die Stummschaltung gilt nur für den einen folgenden Tag.

### Amulett

- Weitergabe an jede Person, die zu Beginn der Nacht lebte (auch vorgemerkte Opfer, auch Werwölfe). Der Träger darf es sich selbst nur lassen, wenn es keinen Angriff abgefangen hat (`mustPass` false).
- Kein rückwirkender Schutz: Alle Angriffe der Nacht sind vor der Weitergabe entschieden. Wird der neue Besitzer am Morgen getötet, weil er vorher getroffen wurde, verschwindet das Amulett mit ihm (Test „does not transfer retroactive protection to an already attacked player“).
- Stirbt der Träger, egal wodurch (Abstimmung, Jägerschuss, Hammer, Liebeskummer), ist das Amulett weg; nur wenn er es im letzten Nachtschritt vorher weitergegeben hat, behält es der neue Träger.

### Wolfsopfer für Hexe und Magier (We-01-54)

Neues Feld `wolfTarget` im Spielzustand: die angegriffene Person, auch wenn das Amulett oder der Leibwächter den Angriff abgefangen hat. Hexe und Magier sehen immer `wolfTarget` und dürfen es heilen (Trank oder Zauber verbraucht, sonst keine Wirkung); `victim` bleibt, wer wirklich stirbt. Ein Angriff auf die abwesende Dorfmatratze geht ins Leere (kein Opfer). Tests: amulet.test.ts und specialRoles.test.ts.

### Bürgermeister mit Hammer und Heilung

Ist der Bürgermeister Wolfsopfer und wird geheilt (Trank verbraucht), handelt er danach normal. Setzt er den Hammer falsch ein, stirbt er trotzdem bei der Morgenauflösung; die Strafe ist nicht heilbar, das Ziel bleibt unberührt. Test: advancedRoles.test.ts („lets the witch heal a mayor who is the wolf victim …“).

### Trunkenbold als Gerber

Die persönliche Siegbedingung des Gerbers gilt schon vor der Enthüllung des Trunkenbolds; stirbt er unenthüllt, gewinnt er für sich (es zählt die wahre Rolle).

### Rollen nach dem Ausscheiden (We-01-53)

Es gibt keine Aufdeck-Einstellung mehr. Ansagen enthalten nur Namen; es werden nur lebende Rollen geweckt (siehe oben und die Umsetzung We-03-68).

### Wolfsempfehlung im variablen Modus (We-01-57)

`recommendVariableWerewolfCount` bewertet weiter nur die Muss-Rollen (so dokumentiert). Die Oberfläche braucht aber eine Empfehlung, die auch die gezogenen Darf-Rollen berücksichtigt (Hinweis des Auftraggebers: bei 20 Spielern und genau elf gezogenen Rollen empfahl sie nur 3 Wölfe). Dafür steht jetzt `recommendWolfCountForSelection` in `variableRecommendation.ts`, nach dem Rechenweg des Auftraggebers: Stärke des Dorfes = Wert der Muss-Rollen (und Muss-Zusätze) + Durchschnittswert aller Rollen auf Darf × mittlere Zahl der gezogenen Rollen (Mittelwert von Mindestens und Höchstens) + halber Wert jedes Zusatzes auf Darf. Die Bewertung der Logik ist additiv (`scoreWerewolfVillage`), deshalb braucht es keine Ziehung. Empfohlen wird die Wolfszahl, bei der `difference` der Muss-Aufstellung plus diese Veränderung dem Betrag nach am kleinsten ist (Gleichstand wie in der Logik: näher an der Standardzahl, dann die kleinere). Nicht berücksichtigt sind Bonuspunkte für Rollenpaare unter den gezogenen Rollen. Wenn Codex die Bewertung in der Logik selbst auf gezogene Rollen ausdehnen will, kann die Funktion durch einen Aufruf ersetzt werden.
