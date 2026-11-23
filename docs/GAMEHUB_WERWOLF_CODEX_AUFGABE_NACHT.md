# Aufgabe für Codex: Nachtskript und Dokumentation des variablen Modus

## Angleichung an Stimmenzahlen und letzten Jägerschuss (We-03-71, 23.11.2026)

We-03-71 abgeschlossen: Forschungssimulation verwendet voteCount statt erzwungener Verurteilung bei einem Nominierten. Stimmengewichte und Ja/Nein-Mehrheit stimmen mit der Erzähleransicht überein; alte benannte Stimmen werden nach einer Stimmenzahl-Abstimmung nicht als aktuelle Abstimmende protokolliert. lastShot für den betrunkenen Jäger abgesichert. 84 gezielte Tests und 24 kurze Modellpartien bestanden; keine langen Balance-Läufe.

### Was sich geändert hat

- Die bereits von Claude umgesetzte Stimmenzahl-Logik in stateMachine.ts bleibt erhalten. Ein Nominierter: voteCount zählt Ja-Stimmen, Ausscheiden ab voteNeeded, Ablehnung führt zurück zu day. voteTotal ist dabei die maximal mögliche Ja-Stimmenzahl ohne Eigenstimme; der Nenner für voteNeeded umfasst alle berechtigten gewichteten Stimmen, einschließlich des Nominierten. Stummgeschaltete zählen nicht, ein aktiver Bürgermeister mit doppelter Stimme zählt zweifach. Bei zwei oder drei Nominierten gelten vollständige Stimmenzahlen, relative Mehrheit und die vorhandene Stichwahl.
- Neu in simulationVoting.ts: drawSimulationVoteCounts. Bei einem Nominierten werden Ja/Nein-Entscheidungen der übrigen Wähler simuliert und gewichtet aufsummiert. Bei mehreren Nominierten werden gültige Einzelentscheidungen samt Gewicht zu Stimmenzahlen zusammengefasst. balance.test.ts sendet jetzt voteCount. Die kurze Ablaufprüfung in simulation.test.ts prüft den Einzelkandidaten-Fall zusätzlich mit einer unabhängigen Mehrheits-/Grenzwertberechnung.
- eventChoices.ts bietet für einen Nominierten sowohl Ablehnung als auch Zustimmung per voteCount an. Unmögliche Schwellen über der maximalen Ja-Stimmenzahl werden nicht angeboten. Der bisherige vote-Pfad bleibt ausdrücklich als kompatibler benannter Prüfpfad unverändert; bei nur einem Nominierten unterscheidet er sich weiterhin von der neuen Ja/Nein-Regel. Er darf nicht mehr als Ersatz für die aktuelle Einzelkandidaten-Simulation benutzt werden.
- eventLog.ts sucht den letzten tatsächlichen Abstimmungsvorgang, unabhängig davon, ob er vote oder voteCount war. Bei voteCount bleiben die Namen der Abstimmenden unbekannt (actors: []). Zuvor konnte die Suche eine ältere vote-Abstimmung finden und deren Namen fälschlich übernehmen; die Regression mit benannter erster Runde und gezählter Stichwahl ist behoben.
- lastShot war bereits korrekt implementiert; der Selektor wurde nicht verändert. Ein zusätzlicher Test prüft den betrunkenen Jäger durch drunkHunter, Enthüllung, hunter und Abschluss des Schusses. Er bleibt aus alive entfernt, lastShot bleibt bis zur Entscheidung true und wird danach false. Keine Wiederbelebung und keine Änderung der Siegprüfung.

### Modellannahmen und Grenzen

Für einen einzelnen Nominierten verwendet das Zufallsmodell pro zulässigem Wähler eine faire Ja/Nein-Münze. In Hinweismodellen ist die Ja-Wahrscheinlichkeit Gewicht / (Gewicht + 1), mit Gewicht = 1 + nichtnegativem öffentlichem Verdacht. Die Eigenstimme wird nie zu Ja, die verbleibenden Stimmen werden mit dem vorhandenen Wählergewicht aufsummiert. Das ist eine offengelegte Forschungsheuristik, keine neue Spielregel oder gemessene menschliche Wahrscheinlichkeit. Bei mehreren Kandidaten bleiben die öffentlichen Gewichte aus We-03-70 erhalten. Alte Ergebnisarchive und Punktwerte wurden nicht neu kalibriert oder überschrieben.

### Gezielte Abnahme

84 gezielte Tests in sechs Dateien bestanden; zwei gezielte Modell-Kurzprüfungen mit 24 vollständigen Partien bestanden. Keine langen Simulationsläufe. simulationVoting.ts: 100 % Zeilen / 96,55 % Zweige. Typprüfung, ESLint, Format und Schichtprüfung erfolgreich. Geprüft: Einzelkandidaten-Zustimmung/Ablehnung, gewichtete Stimmen, stummer oder nominierter Bürgermeister, unbekannte Abstimmende nach früherem benanntem Voting und lastShot beim betrunkenen Jäger.

Betroffene Tests: voteCount.test.ts, lastShot.test.ts, simulationVoting.test.ts, advancedRoles.test.ts, narrator.test.ts und narratorGuide.test.ts. Die beiden Tests mit dem Namensanfang smoke-checks in balance.test.ts und simulation.test.ts wurden einzeln ausgewählt; die übrigen langen Tests blieben übersprungen. Vorherige separate Tabu-Formatierung und lokale Visual-Studio-Dateien bleiben unberührt. Umsetzung direkt im aktuellen Branch game/werewolf-ui unter C:/Users/Kosta/source/repos/GameHub.


## Nachprüfung des roten Rollentests (We-03-70, 23.11.2026)

advancedRoles.test.ts enthielt noch die alte Erwartung, dass die Alte Vettel mit silence:null freiwillig verzichten darf. Der gezielte ursprüngliche Prüflauf hatte diese Datei nicht erfasst. Die Erwartung wurde korrigiert: null wird bei vorhandenem Ziel abgewiesen, anschließend wird eine andere erlaubte Person stummgeschaltet. Alle 14 Tests dieser Datei bestehen wieder; Format und ESLint ebenfalls. Keine Produktionslogik geändert. Ergänzend zu den zuvor geprüften 104 Tests sind damit 14 weitere Tests nachgeprüft; die frühere Fehlermeldung ist behoben.


## Umgesetzte Ergänzungen für Codex und Claude (We-03-70, 23.11.2026)

We-03-70 abgeschlossen: Alte Vettel muss bei vorhandenem Ziel stummschalten; null nur noch als Notausgang ohne gültiges Ziel. Forschungsmodell auf 1–3 Nominierte, einzelne gewichtete Stimmzettel und Stichwahlen angepasst; Heilungsmodelle verwenden wolfTarget. 104 gezielte Tests und 24 kurze Modellpartien erfolgreich. Keine langen Balance-Läufe, keine UI- oder Kalibrierungsänderungen.

| Bereich | Aktueller Anschluss |
| --- | --- |
| Alte Vettel | stateMachine.ts weist silence mit target:null zurück, sobald ein gültiges lebendes Ziel existiert. Selbstwahl und Sperre der Vornacht bleiben unverändert. Nur ohne gültiges Ziel bleibt null als technischer Notausgang erlaubt; describeRoleStep kann diesen Fall weiterhin darstellen. Kein neues Einstellungsfeld. |
| Ereignisauswahl | eventChoices.ts bietet silence:null ausschließlich ohne wählbare Person an. Die Erzähleransicht bleibt unverändert. |
| Forschungs-Abstimmung | Neue Datei simulationVoting.ts: drawSimulationNominees und drawSimulationBallots. balance.test.ts nutzt diese Funktionen statt der früheren automatischen Verurteilung eines einzigen Kandidaten. |
| Veraltete Heilungsmodelle | simulation.test.ts und die simulierten Hexen-/Magierentscheidungen in balance.test.ts verwenden wolfTarget. Die im Nachtrag vom 22.11.2026 beschriebenen victim-Prüferwartungen sind damit korrigiert. |
| Schon von Claude umgesetzt | Neue echte Tagesabstimmung, Fragenmodell des Magiers, Rollen-Varianten, Verlauf und Todesreihenfolge wurden erhalten. An diesen produktiven Schnittstellen wurde nichts erneut implementiert. |

### Annahmen des Forschungsmodells

Die Kandidatenanzahl wird gleichverteilt zwischen eins und höchstens drei verschiedenen Personen aus dem zulässigen Verdachtspool gezogen. Der Pool darf öffentliche Verdachtsgewichte enthalten. Jeder berechtigte Wähler zieht einen zulässigen Kandidaten ohne Selbstwahl; Stummgeschaltete sind ausgeschlossen. Ein Kandidat ohne fremde Wahlmöglichkeit gibt keinen Stimmzettel ab. Im Zufallsmodell sind seine Wahlmöglichkeiten gleich wahrscheinlich, in Hinweismodellen proportional zu 1 + öffentlichem Verdachtswert. Die Bürgermeisterstimme zählt weiterhin allein durch die bestehende Spiellogik zweifach. Die simulierte Dorftrottel-Stimme setzt der Erzähler nach derselben Modellstrategie; die frühere Pflicht-Ja-Regel und eine daraus abgeleitete sichere Rollenidentifikation werden nicht verwendet. Historische Statistikfelder für diese Inferenz bleiben als Kompatibilitätsfelder mit null Treffern erhalten.

Die vorhandene Spiel-Logik entscheidet über Stichwahl und Ausscheiden. Bei erneutem Gleichstand geht der Tag weiter; das Forschungsmodell erlaubt höchstens einen weiteren Nominierungsversuch und beendet danach den Tag. Nacht, Nominierungskennung und Stichwahlrunde fließen in die reproduzierbaren Zufallsentscheidungen ein, damit eine Stichwahl nicht zwangsläufig dieselben Stimmen wiederholt. Diese Heuristiken sind Modellannahmen, keine zusätzlichen Spielregeln und keine vollständige Abbildung menschlicher Strategien oder koordinierter Wolfsabsprachen.

### Gezielte Prüfung und Aussagegrenzen

104 gezielte Tests und zwei gezielte Simulations-Kurzprüfungen mit zusammen 24 vollständigen Modellpartien bestanden. Kein Kombinations- oder Balance-Gesamtlauf. Neues Abstimmungsmodell: 100 % Zeilen, Zweige, Funktionen und Anweisungen abgedeckt. Typprüfung, ESLint, Format- und Schichtprüfung erfolgreich. Bestehende Magierführung, Tagesabstimmung und Todesreihenfolge erhalten und mitgeprüft. Keine neue Kalibrierung oder Änderung von Rollenpunkten/Wolfsgrenzen.

Neue Tests: requiredSilence.test.ts und simulationVoting.test.ts. Mitgeprüft: narrator, roleStep, narratorGuide, magician, combinedHealers, deathOrder und deathOrderGame. Die 22 vorhandenen Heiler-Tests sichern zusätzlich ausdrücklich ab, dass der Magier nach Hexenheilung wolfTarget behält und eine wirkungslose weitere Heilung einen Zauber verbraucht. Der bestehende Hammer-Integrationstest wählt jetzt ein tatsächliches Stummschaltungsziel statt freiwillig zu verzichten. Die lange Ablaufprüfung kontrolliert die Menge der Todesansagen unabhängig von ihrer separat in deathOrder geprüften Reihenfolge.

Für spätere schnelle Modellprüfungen nur die beiden Tests mit dem Namensanfang smoke-checks aus balance.test.ts und simulation.test.ts auswählen und WEREWOLF_SIMULATION=1 setzen. Jede dieser Kurzprüfungen spielt zwölf reproduzierbare Partien. Keine vollständigen Forschungsdateien starten, solange der Auftraggeber keinen breiten Lauf verlangt.

Historische Ja/Nein-Balancewerte und das neue Modell sind nicht direkt vergleichbar. Es wurden keine neuen Gewinnwahrscheinlichkeiten abgeleitet, keine Simulationsarchive überschrieben und keine Wolfsempfehlungen oder Rollenwerte neu kalibriert. Vorleseskript und weitere UI-Arbeiten bleiben wie vereinbart separat. Quelländerungen liegen direkt im aktuellen Branch game/werewolf-ui unter C:/Users/Kosta/source/repos/GameHub; der ältere isolierte Logik-Arbeitsordner wurde nicht über diesen neueren Code kopiert.


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

### Amulett-Schritt vor der ersten Nacht entfällt (We-01-86, 22.11.2026)

Beschluss des Auftraggebers: Der Amulettträger wird **nicht mehr vor der ersten Nacht geweckt**, er erfährt das Amulett auf seiner Rollenkarte in der Rollenverteilung. Von Claude in der Logik umgesetzt (Bereich `src/business/games/werewolf`), bitte bei künftigen Änderungen beachten:

- Der Zustand `amuletIntro` und das Ereignis `amuletReady` sind entfernt (`stateMachine.ts`). Nach dem letzten `roleSeen` beginnt die Nacht sofort (`startNight`), auch mit Amulett.
- `wakingPlayers` liefert den Träger nur noch im Zustand `amuletPass`. Der Schritt am Nachtende (`amuletPass`, in jeder Nacht, solange ein Träger lebt) bleibt unverändert.
- Angepasst: `amulet.test.ts` (der Träger wird vor der ersten Nacht nicht geweckt), `narrator.test.ts`, `narratorCard.test.ts`; in den langen Simulationen `simulation.test.ts` und `balance.test.ts` wurden die Hilfsfunktionen angepasst (sie kompilieren, sind aber nicht gelaufen, weil sie über zehn Minuten brauchen). **Durch den Auftraggeber am 22.11.2026 eingegrenzt und gezielt geprüft (We-03-69):** Kein voller Balance-/Simulationslauf nötig. Nur den direkten Nachtstart nach der Rollenverteilung und die unveränderte Amulettweitergabe prüfen; acht Tests bestanden (Ergebnis unten).
- Dokumentation angepasst: `GAMEHUB_WERWOLF.md` (Abschnitt Schutzamulett), `GAMEHUB_WERWOLF_HANDOFF.md`, `GAMEHUB_WERWOLF_NARRATOR_API.md`. Gespeicherte Spielstände mit dem Zustand `amuletIntro` können nicht mehr geladen werden (Versionsnummer des gespeicherten Spiels in `narratorGame.ts` bei Bedarf erhöhen).


## Gezielte Abnahme des entfallenen Amulett-Intros (We-03-69, 22.11.2026)

Gezielte Abnahme nach Einschränkung durch den Auftraggeber: 8 Tests bestanden (sechs direkte Nachtstart-Varianten mit Amulett, bestehende Startvergabe und Weitergabe am Nachtende). Typprüfung, ESLint und Formatprüfung erfolgreich. Keine Produktionslogik geändert. Breiter Lauf auf Wunsch des Auftraggebers abgebrochen, Änderungen an balance.test.ts und simulation.test.ts zurückgenommen; keine vollständige Balance-/Simulationsabnahme behauptet.

Der Auftraggeber hat die frühere Aufforderung zum vollständigen Simulationslauf eingeschränkt: Nur die durch den entfernten Benachrichtigungsschritt betroffenen Abläufe prüfen. Der weggefallene Schritt verändert weder Rollenregeln noch Schutzwirkung. Dauerhafte Regressionstests stehen in src/business/games/werewolf/amulet.test.ts: direkter Start mit Wölfen, Amor, Leibwächter oder Dorfmatratze, auch in Kombination mit weiteren Rollen, bestehender Amulettbesitz sowie Übergabe am Nachtende. Die acht gezielten Tests liefen erfolgreich in rund einer Sekunde.

Im anfänglichen breiten Lauf wurden zudem veraltete Heilungs-Prüferwartungen (victim statt wolfTarget) entdeckt. Dieser breite Lauf wurde nicht abgeschlossen und wird ausdrücklich nicht als bestanden ausgegeben. Seine Testdateien sind unverändert wiederhergestellt; diese ältere Forschungshilfe ist kein Bestandteil der vorliegenden gezielten Abnahme. Historische Archive und Rollenbewertungen bleiben unverändert.


## Entscheidende Ergebnisunterschiede für Claude (Nachtrag zu We-03-69, 22.11.2026)

| Punkt | Ergebnis und Konsequenz |
| --- | --- |
| Entferntes Amulett-Intro | Nach dem letzten roleSeen folgt unmittelbar der reguläre erste Nachtschritt. Es wird weder amuletIntro noch amuletReady benötigt. Geprüft mit Wölfen, Amor, Leibwächter und Dorfmatratze als Einstieg. |
| Amulettbesitz und Nachtende | Startbesitz bleibt bestehen; amuletPass ist weiterhin der reguläre letzte Nachtschritt. Der weggefallene Benachrichtigungsschritt ändert keine Schutz- oder Weitergaberegel. |
| Gezielte Prüfung | Acht Tests bestanden: sechs Nachtstart-Varianten und die bestehenden Prüfungen für Startvergabe und Weitergabe am Nachtende. Typprüfung, ESLint und Formatprüfung bestanden. Neue Regressionen stehen ausschließlich in src/business/games/werewolf/amulet.test.ts. |
| Anfängliche Simulationsfehler | Reproduziert bei Sechser-Aufstellungen mit Leibwächter beziehungsweise Amulett: simulation.test.ts erwartete fälschlich eine Ablehnung von Heilung, wenn victim null war. Bei abgewehrtem Angriff ist wolfTarget aber gesetzt; Heilung ist nach bestätigter Regel gültig und verbraucht die Ressource. Das war eine veraltete Prüferwartung, kein durch den Intro-Wegfall nachgewiesener Fehler der Produktionslogik. |
| Abgebrochener Gesamtlauf | Auf ausdrücklichen Wunsch des Auftraggebers gestoppt. Kein erfolgreich abgeschlossener Gesamtlauf und keine neue Balance-Abnahme. Teilweise ausgegebene Modellquoten sind kein belastbarer Vorher-/Nachher-Vergleich. Daraus keine Wolfszahlen, Rollenpunkte oder Gewinnwahrscheinlichkeiten ändern. |

**Bei späteren Arbeiten an den langen Simulationen beachten:** Die kurzzeitig korrigierten Testdateien wurden vollständig auf den Ausgangsstand zurückgesetzt. In simulation.test.ts verwenden die Heilungs-Erwartungen für Hexe und Magier weiterhin victim statt wolfTarget. Auch die simulierten Heilerentscheidungen in balance.test.ts greifen noch auf victim zu und kennen damit den tatsächlichen Schutzstatus, den diese Rollen nach aktueller Regel nicht erfahren sollen. Erst diese Prüferwartungen/Modelle anpassen, bevor ein späterer breiter Lauf interpretiert wird. Das ist unabhängig vom entfallenen Amulett-Intro und wurde in der gezielten Aufgabe nicht umgesetzt.

**Produktionscode:** Durch We-03-69 unverändert. Historische Simulationsarchive und Balance-Kalibrierung ebenfalls unverändert. Die acht erfolgreichen Tests belegen den eingegrenzten Übergang und die geprüfte Amulettweitergabe; sie sind kein Beweis für sämtliche möglichen Spielverläufe.


## Entscheidung zur Alten Vettel und Aufbau der Erzähleransicht (Claude, 22.11.2026)

Für Codex festgehalten, damit die Logik dazu passt. Die Oberfläche liest das aus `src/business/games/werewolf/roleStep.ts`.

- **Alte Vettel: Stummschalten ist Pflicht.** In We-03-70 auch in der Logik abgesichert: target:null wird bei vorhandenem Ziel abgewiesen. Ohne gültiges Ziel bleibt der technische Notausgang erhalten; Selbstwahl und Vornachtsperre gelten unverändert.
- **Die Einstellung der Alten Vettel betrifft nur die Selbstwahl** (`allowSelfSilence`, Varianten `spellcaster:allowed` und `spellcaster:forbidden`), nicht Pflicht oder freiwillig.
- **Freiwillige Rollen** (die Oberfläche zeigt „Verzichten“): Paranormaler Ermittler (solange er nicht benutzt wurde), Bürgermeister mit Hammer (verfügbar), Hexe und Magier (solange etwas einsetzbar ist) und der Jäger, wenn `hunterShot` auf „optional“ steht. Pflicht (kein Verzichten): Seherin, Leibwächter, Dorfmatratze, Amor, Wölfe ab Nacht 2, Amulettträger, Alte Vettel, Jäger bei `hunterShot: "required"`.
- **Ansichten je Rolle:** `describeRoleStep` unterscheidet Fälle derselben Rolle, zum Beispiel Wölfe mit Angriff und Wölfe ohne Angriff in Nacht 1, Seherin (Auswahl und Ergebnis), Ermittler (Auswahl, bereits benutzt, Ergebnis), Hexe und Magier mit und ohne einsetzbare Möglichkeiten, Jäger optional oder Pflicht, Bürgermeister mit und ohne Hammer.
- **Drei Zustände je Fähigkeit** in der Rollenkarte (`unavailable`): nutzbar, `used` (dauerhaft verbraucht) und `blocked` (gerade nicht möglich, zum Beispiel Heilen ohne Opfer der Wölfe). Wer neue Fähigkeiten oder Rollen ergänzt, setzt dort den passenden Grund.
- **Zurück in der Erzähleransicht** geht höchstens eine Rolle weit; in der Rollenverteilung ist es unbegrenzt. Der Erzählerverlauf (jeder Schritt mit seiner Auswahl) wird mit dem Spielstand gespeichert (Feld `trail`); er ist als Grundlage für späteres Log und Ereignisanzeige gedacht.
- **Offen für später:** das Vorleseskript des Erzählers fehlt noch (zweite Runde).

### Entscheidung: Magier nach geheilter Hexe (22.11.2026)

Der Auftraggeber hat entschieden: Der Magier sieht das Wolfsopfer auch dann, wenn die Hexe es in derselben Nacht geheilt hat, und sein Heilzauber bleibt wählbar. Er ist dann verbraucht, ohne dass sich für die Person etwas ändert (wie bei Amulett und Leibwächter). Grund: Niemand soll aus der Anzeige ablesen können, ob eine Heilung oder ein Schutz gewirkt hat (Beschluss vom 21.11.2026, `wolfTarget`). Die Logik verhält sich schon so (`castSpells` prüft nur `wolfTarget`, nicht `victim`); der frühere Satz im Magier-Abschnitt von `GAMEHUB_WERWOLF.md` („eine bereits durch die Hexe geheilte Person steht nicht erneut als Heilziel zur Verfügung“) ist angepasst. Bitte bei künftigen Änderungen an Hexe und Magier beachten und keinen Test schreiben, der das Gegenteil verlangt.


## Neue Tagesabstimmung (von Claude umgesetzt, 22.11.2026) – für Codex festgehalten

Der Auftraggeber hat entschieden, dass **Claude** die Logik der neuen Tagesabstimmung selbst umsetzt (Ausnahme von der Rollenteilung) und alles für Codex notiert wird. Grundlage ist das Originalregelheft (Ultimate Werewolf: Ultimate Edition, Varianten „Secret Ballot“ und „1, 2, 3, Point!“, Mayor, Idiot, Old Hag).

**Regeln (Entscheidungen des Auftraggebers):**

1. Der Erzähler wählt **eins bis drei** verschiedene nominierte lebende Personen und bestätigt. Nominierender und Unterstützer entfallen. Eine stumm gemachte Person kann nominiert werden.
2. **Jeder abstimmende Spieler** (alle Lebenden außer der stumm gemachten Person) gibt **genau eine Stimme** für eine nominierte Person ab, **nie für sich selbst**. Wer nur sich selbst wählen könnte (einzige nominierte Person), hat keinen Stimmzettel. Die Nominierten stimmen mit.
3. **Bürgermeister mit doppelter Stimme:** zählt zweifach; der Erzähler gibt an, **wen er gewählt hat** (normale Zeile mit Gewicht 2, in der Oberfläche als „zählt doppelt“ gekennzeichnet).
4. **Dorftrottel:** entscheidet nicht selbst; der Erzähler trägt seine Stimme ein (Variante a, wie im Original, wo seine Stimme immer als „zum Tod“ gewertet wird). In der Logik ist das ein normaler Stimmzettel; die Oberfläche kennzeichnet ihn („Stimme vom Erzähler gesetzt“). Die frühere Pflichtstimme „Ja“ entfällt.
5. Die meisten Stimmen scheiden aus. **Gleichstand:** einmal neu abstimmen unter den Gleichauf liegenden (`round: 2`), bei erneutem Gleichstand scheidet niemand aus und der Tag geht weiter (der Zustand wird wieder `day`).
6. „Keine Abstimmung“ (`endDay`), der Hammer des Bürgermeisters, Folgen des Ausscheidens (Liebende, Amulett wirkt nicht, Jäger) sind unverändert.

**Geänderte Dateien und Schnittstellen (für Codex):**

- `stateMachine.ts`: Zustand `vote` hat jetzt `candidates` und `round` statt `target`. Ereignis `nominate` = `{ night, nominees }` (statt `target`, `nominator`, `seconder`). Ereignis `vote` = `{ night, nomination, ballots }` (statt `yes` oder `yesVoters`). Neue Funktionen `dayVoters` und `countBallots` ersetzen `dayVotes` (Mehrheit entfällt).
- `selectors.ts`: `validNominators` und `validSeconders` entfernt; `validTargets(state, "nominate", { selected })` prüft bis zu drei Nominierte; `votingPlayers` liefert `{ name, choices, setByNarrator, weight }` (statt `requiredYes`).
- `eventLog.ts`: Die Ursache `vote` führt als Beteiligte die Personen, die für die ausgeschiedene Person gestimmt haben (aus `ballots`).
- `narratorGame.ts`: Gespeicherte Spiele mit einer offenen Abstimmung der alten Art werden übernommen (ein Kandidat, Runde 1); `savedSessionVersion` bleibt 1.
- Neu: `voteTesting.ts` (Hilfen für Tests: `allVoteFor`, `lynchEvents`).
- Angepasste Tests: `advancedRoles`, `amulet`, `drunk`, `specialRoles`, `tanner`, `ruleAdditions`, `stateMachine`, `narrator` (Zufallsspiele über 100 Seeds laufen mit der neuen Abstimmung), `narratorGuide`, `roleStep`, `narratorCard`. Neue Tests für Gleichstand (einmal neu, dann niemand), doppelte Bürgermeisterstimme, stumm gemachte Person, Stimmzettel.
- **Forschungssimulationen:** In We-03-70 auf das neue Abstimmungsmodell umgestellt (simulationVoting.ts): ein bis drei Nominierte, individuelle gültige Stimmzettel, bestehende Stichwahlregel. wolfTarget-Heilungsmodelle korrigiert. Zwei gezielte Kurzprüfungen mit 24 Modellpartien bestanden; lange Sweeps nicht ausgeführt. Alte Ja/Nein-Balancewerte bleiben historische Daten und sind nicht direkt vergleichbar.
- Oberfläche (Claude): Nominierung mit Haken (höchstens drei), danach eine Liste aller abstimmenden Spieler mit einer Taste je nominierter Person, Kennzeichnung „zählt doppelt“ und „Stimme vom Erzähler gesetzt“; Bestätigen erst, wenn alle abgestimmt haben.



## Hinweis für Codex (22.11.2026): Magier im Fragenmodell

Die Führung des Erzählers (`narratorGuide.ts`) fragt den Magier wie die Hexe in zwei Runden: Frage 1 (Heilzauber oder ein Todeszauber), Frage 2 (ein weiterer Todeszauber). Die Spielregeln (`castSpells`, `spellsRemaining`) sind unverändert. Neu in der Auswahl der Führung: `spellPicks` (Personen des ersten Zaubers). Heilen ist nur in der ersten Frage wählbar, weil es pro Nacht nur ein Opfer gibt.


## Hinweis für Codex (23.11.2026): Reihenfolge der Toten

`werewolfAnnouncement` und die Todeseinträge im Ereignisprotokoll nennen mehrere Tote in der Reihenfolge ihres Todes (neue Datei `deathOrder.ts`, genutzt von `stateMachine.ts` und `eventLog.ts`): erst der verzögerte Tod des nicht gerettete Harten Burschen (er stirbt zu Beginn der Nacht, vor jedem möglichen Angriff), dann das Werwolfopfer, das Gift der Hexe, die Zauber des Magiers, der Hammer des Bürgermeisters. Bei zwei Verliebten steht immer die zuerst gestorbene Person vorn und direkt danach die Person, die aus Liebeskummer stirbt. Das erste Todesurteil zählt: Wird der Partner später noch einmal angegriffen (Hexe, Magier), ändert das seine Todeszeit nicht. Gleiche Zeiten behalten die Sitzreihenfolge. Die Spielregeln sind unverändert, nur die Reihenfolge der Ausgabe; fünf bestehende Tests und fünf neue Tests (`deathOrder.test.ts`) sichern es ab.

## Hinweis für Codex (23.11.2026): Jäger mit letztem Schuss (`lastShot`)

Regel (vom Auftraggeber): Der Jäger, der gestorben ist, aber noch über seinen Schuss entscheiden muss, darf in der Oberfläche nicht als tot gelten. Die Spiellogik bleibt unverändert: Der Jäger ist beim Ansagen des Todes schon aus `state.alive` entfernt, der Schuss folgt danach (`status: "hunter"` oder `"drunkHunter"`). Neu in `selectors.ts`: `describePlayers(state)` liefert pro Person das zusätzliche Feld `lastShot` (true nur für den Jäger im Schritt des Schusses, auch beim betrunkenen Jäger); `alive` bleibt false. Die Übersicht „Alle Spieler und Rollen“ zeigt ihn mit dem Schuss-Symbol statt als tot, die Morgen-Ansicht hat die Kategorie „Letzter Schuss“. Wer später eine Anzeige mit Lebenden und Toten baut (zum Beispiel einen Kreis oder ein Protokoll), muss `lastShot` beachten. Test: `lastShot.test.ts`. Falls die Siegprüfung oder die Simulation den Jäger vor seiner Entscheidung als tot zählt, ist das so gewollt und unverändert.

## Hinweis für Codex (23.11.2026): Abstimmung mit Stimmenzahlen (`voteCount`)

Die Erzähleransicht zählt die Abstimmung jetzt pro nominierter Person: Der Erzähler trägt in der oberen Box rechts neben jeder nominierten Person die Stimmenzahl ein und kann erst bestätigen, wenn alle abstimmenden Stimmen zusammengerechnet eingetragen sind (der Bürgermeister mit doppelter Stimme zählt zweifach; die stumme Person stimmt nicht mit). Neu in der Spiellogik (`stateMachine.ts`): das zusätzliche Ereignis `voteCount { night, nomination, counts }` und `voteTotal(state)`. Das alte Ereignis `vote { ballots }` mit einer Stimme je abstimmender Person bleibt unverändert und gültig (Simulation, Tests und Abdeckungsprüfung nutzen es weiter). Prüfung von `voteCount`: jede nominierte Person hat eine nichtnegative ganze Zahl, die Summe ist genau `voteTotal`, niemand stimmt für sich selbst (eine nominierte Person, die abstimmt, kann nicht alle Stimmen haben); Gleichstand und zweite Runde wie bei `vote`. Offen/bewusst: Bei `voteCount` ist nicht bekannt, wer für wen gestimmt hat; im Ereignisprotokoll hat die Ursache „Abstimmung“ dann keine Namen der Abstimmenden. Test: `voteCount.test.ts`.

### Ergänzung (23.11.2026): Eine nominierte Person = Ja/Nein mit Mehrheit (wie in Ultimate Werewolf)

Bei `voteCount` mit **einer** nominierten Person trägt der Erzähler nur die **Ja-Stimmen** ein. Die Person scheidet aus, wenn die Ja-Stimmen **mehr als die Hälfte aller Stimmen** sind (alle Abstimmenden einschließlich der nominierten Person, die stumme Person nicht, der Bürgermeister mit doppelter Stimme zählt zweifach; Schwelle `voteNeeded(state)` = ⌊Gesamt/2⌋ + 1). Die nominierte Person stimmt nicht für ihre eigene Hinrichtung: höchstens `voteTotal(state)` Ja-Stimmen sind möglich. Reichen die Ja-Stimmen nicht (auch 0 Ja-Stimmen ist gültig), bleibt sie im Spiel und der Tag geht weiter (Status `day`, neue Nominierung möglich). Bei zwei oder drei Nominierten bleibt es bei „alle Stimmen eintragen, die meisten gewinnen“, Gleichstand mit Stichwahl, nach zweitem Gleichstand bleiben alle. Das alte Ereignis `vote { ballots }` mit nur einer nominierten Person erzwingt weiter, dass alle für sie stimmen (unverändert, nur noch von Simulation und Tests genutzt). Quelle der Regel: Ultimate Werewolf, Ultimate Edition, Abschnitt „The First Day“ („more than half the players vote to execute“); die Schwelle bezieht sich nach dem Wortlaut auf alle Spieler, das ist eine Annahme. Der Dorftrottel und die doppelte Stimme des Bürgermeisters sind nur Hinweise für den Erzähler.

## Nach dem Ausscheiden geht der Tag weiter (2026-11-23, Claude)

- `announceExile` führt nicht mehr direkt in die Nacht, sondern zurück in den Tag (`next: "day"`); der Erzähler beendet den Tag danach mit `endDay` (oder nominiert erneut). Der Jäger-Schuss nach dem Ausscheiden gehört weiter zum Tag (`inDay` im Zustand `hunter`, Protokoll-Zeitraum `day`).
- Angepasste Tests: drunk, ruleAdditions, stateMachine, tanner. Wenn die Simulation/Forschungsmodelle `announceExile` und danach direkt die Nacht erwarten, muss dazwischen `endDay` stehen.

## Obergrenze pro nominierter Person (2026-11-23, Claude)

- Neu `voteMaximum(state, name)` in `stateMachine.ts`: höchstens alle Stimmen minus die eigene (der nominierte Bürgermeister mit Doppelstimme: minus 2; bei einer nominierten Person die Ja-Stimmen `maxYes`). Der Guide (`setVoteCount`, `setVoteBonus`, Feld `voteMax`) begrenzt die Eingabe damit; `countVotes` prüfte dieselbe Grenze schon vorher. Die zweite Stimme des Bürgermeisters zählt zur Person dazu.
