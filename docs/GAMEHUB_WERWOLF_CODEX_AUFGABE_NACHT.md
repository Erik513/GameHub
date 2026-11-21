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
