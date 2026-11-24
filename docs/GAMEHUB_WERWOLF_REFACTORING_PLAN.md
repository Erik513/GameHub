# Werwolf: Refactoring-Plan (Durchlauf 1 – nur Beobachtungen)

Stand: 2026-11-24 · Aufgabe We-01-150 · Es wurde in Durchlauf 1 **kein Code geändert**.
Durchlauf 2 (Umsetzung) beginnt erst nach Freigabe des Auftraggebers und arbeitet die Schritte unten in der angegebenen Reihenfolge ab.

Kennzeichnung: **[gemessen]** = per Skript/Zählung belegt, **[Annahme]** = noch nicht verifiziert.

## 0. Größenübersicht [gemessen]

| Datei | Zeilen |
| --- | --- |
| business/narratorGuide.ts | 1245 |
| business/stateMachine.ts | 1062 |
| presentation/GuideBox.tsx | 940 |
| presentation/stepText.tsx | 467 |
| presentation/NarratorView.tsx | 398 |
| styles/games/werewolf.css | 3441 (504 Regeln) |

24 Funktionen haben 60 Zeilen oder mehr. Die längsten: `NarratorView` (269), `applyEvent` (258), `FixedRoles` (239), `Summary` in GuideBox (222), `roleBoxes` in stepText (199), `describeFixedConfiguration` (158), `describeGuide` (152), `WerewolfRulesDialog` (149), `recordWerewolfTransition` (145), `PlainBox` (142).

## A. Toter und veralteter Code (geringes Risiko, zuerst)

- A1 **Altes Stimmzettel-Verfahren** (ein Zettel je Wähler): `setBallot`, `ballotRows`/`BallotRow`/`ballotRowsOf`, `selection.ballots`, `ballotsOf` in narratorGuide.ts. Die UI nutzt es nicht mehr (Stimmen werden pro Kandidat gezählt: `voteCount`). `setBallot` wird nur noch von Tests benutzt. Prüfen, ob `eventOf` den Zweig „ballots“ noch braucht; dann samt Tests entfernen.
- A2 **CSS ohne Verwendung** (25 `ww-`-Klassen, nur im CSS gefunden): ww-grid, ww-variant, ww-variant__head, ww-variant__title, ww-symbol, ww-guide--tap, ww-guide--idle, ww-guide__undo, ww-guide__causes, ww-guide__notes, ww-guide__sub, ww-guide__strip, ww-guide__reset, ww-guide__votesum, ww-ballots, ww-ballot, ww-ballot__name, ww-ballot__choices, ww-ballot__choice, ww-nominees__actions, ww-nominees__sum, ww-tally, ww-tally__row, ww-tally__name, ww-tally__count. [Annahme: einige werden dynamisch zusammengesetzt – vor dem Löschen je Klasse im Quelltext nach Teilstrings suchen.]
- A3 **Nur von Tests genutzte Exporte** (68 Exporte ohne Produktionsnutzer, davon die meisten nur Typen): als Funktionen/Werte zu klären: `eventChoices` (nur Test), `createBalancedWerewolf`, `createRandomWerewolf`, `drawWerewolfLineup`, `drawSimulationNominees`, `drawSimulationVoteCounts`, `drawVariableWerewolfLineup`, `lynchEvents`, `voterNames`, `allVoteFor`, `setBallot`. Entweder als Testwerkzeug kennzeichnen (z. B. in `voteTesting.ts` bündeln) oder entfernen. Typen, die nur in der eigenen Datei benutzt werden, nicht mehr exportieren (z. B. `GuidePhase`, `GuideFrame`, `DeathNote`, `GuideBack`, `RoleStepVariant`, `WakeStepId`).
- A4 **Übersetzungsschlüssel**: Der grobe Test (Blattname irgendwo im Code) findet nichts Ungenutztes, ist aber zu ungenau (Namen wie `title` kommen überall vor). Für Durchlauf 2: genauer prüfen, mit vollständigen Pfaden und dynamisch gebauten Schlüsseln (`role.${id}`), und das als kleines Skript in `scripts/` mit Test ablegen. [Annahme: einzelne alte Schlüssel der Stimmzettel und Hinweise sind noch vorhanden.]

## B. CSS (mittleres Risiko, nur optisch, ohne Browser-Prüfung nicht beweisbar)

- B1 57 Selektoren sind mehrfach definiert (z. B. `.ww-guide--tap` 6×, `.ww-nominee__count button` 5×, `.ww-nominee` 4×). Zusammenführen, später Regeln gewinnen lassen (Reihenfolge beachten!).
- B2 `werewolf.css` (3441 Zeilen) in Dateien nach Bereich teilen: Konfiguration (fest/variabel), Erzähler-Karte, Führungsbox (GuideBox), Abstimmung, Tote/Morgen, Fenster (Wahre Rolle, Regeln). Gleiche Reihenfolge der Importe beibehalten.
- B3 Rahmen-Stärken (2px/3px), Farben der Zustände (used/blocked/dim/ready) und gelbe Hinweise als gemeinsame CSS-Variablen bzw. Klassen statt Wiederholungen.

## C. Logik und UI müssen übereinstimmen (Kernpunkt des Auftrags)

- C1 **Status-Abfragen in der UI**: In GuideBox, stepText und NarratorView stehen viele Prüfungen wie `state.status === "witch" || "magician"` oder `"cupid"`, `"hunter" || "drunkHunter"` (GuideBox 134/138/230, stepText 189/202/296/309/321/439, NarratorView 246/269/279/303). Das ist Wissen über Regeln in der Darstellungsschicht. Ziel: der Guide liefert ein fertiges Feld (z. B. `view.kind`: `"vote" | "twoPotions" | "pairing" | "lastShot" | …` und `view.showsDoneCheck`), die UI fragt nur noch dieses Feld. Bringt: weniger doppelte Bedingungen, Regeln nur an einer Stelle.
- C2 `GuideBox.tsx:134-138` und `NarratorView.tsx:303` enthalten fast gleiche Bedingungen für „Weiter aktiv“. In den Guide ziehen (`view.canContinue`/`nextKind` gibt es schon, prüfen was fehlt).
- C3 `Summary` (222 Zeilen) in GuideBox: baut die Zusammenfassungszeilen für jede Rolle selbst. Ziel: Guide liefert `summaryRows` (Rolle, Teile, Zustand); die UI zeichnet nur.
- C4 `roleBoxes` (199 Zeilen) und `scriptOf` in stepText: Skriptkästen je Rolle in einer Tabelle je Rolle statt einer langen Funktion mit Sonderfällen (`card.role === "magician"`, `"hunter"`).
- C5 Die Prüfung „Hinweise“ (`notes`) liegt schon im Guide – kontrollieren, dass die UI keine eigenen Hinweistexte mehr berechnet.

## D. Struktur großer Dateien (Aufteilen, ohne Verhalten zu ändern)

- D1 **narratorGuide.ts (1245)** in Module: `guideFrames` (Frames/Phasen), `guideSelection` (Auswahl/Operationen: chooseAbility, choosePlayer, answerQuestion), `guideView` (`describeGuide`, Hinweise, Tote), `guideVote` (Abstimmung: setVoteCount, setVoteBonus, undoDayVote), `guideUndo` (takeBackResult, undoSelection, reopenDecision). Öffentliche Schnittstelle (`narratorGuide.ts` als Sammel-Export) bleibt gleich.
- D2 **stateMachine.ts (1062)**: `applyEvent` (258 Zeilen) als Tabelle `status → Behandler` aufteilen; Ereignis-Behandler je Phase (Nacht, Tag, Abstimmung, Jäger, Ende) in eigene Dateien.
- D3 **GuideBox.tsx (940)**: Teilkomponenten in eigene Dateien: `Summary`, `PlainBox`, `DeadList` (Tote am Morgen), `WinnerBox`, `AbilityRow`.
- D4 **NarratorView.tsx (398, Funktion 269 Zeilen)**: Kopf, Mittelteil, Fußleiste trennen; Fußleisten-Logik (Weiter/Ende/Neustart) in einen Hook.
- D5 **eventLog.ts** `recordWerewolfTransition` (145 Zeilen): je Ereignisart eine kleine Funktion.
- D6 **fixedConfiguration.ts / variableConfiguration.ts / variableSetup.ts** (590/540/706): beobachten; Konfiguration ist nicht Teil des Erzählerlaufs, daher später (nicht in diesem Durchlauf).

## E. Einheitlichkeit

- E1 Benennung: `Guide`-Operationen einheitlich Verb + Gegenstand (`chooseAbility`, `choosePlayer`, `setVoteCount`, `markRoleShown`, `takeBackResult`, `undoDayVote`, `reopenDecision`). Prüfen, ob `undoSelection`/`reopenDecision`/`takeBackResult` zu einem Namensschema (`undo…`) vereinheitlicht werden können.
- E2 Fähigkeits-Zustände (`used/blocked/dim/ready`) stehen in Logik (`narratorCard.ts` `abilitiesOf`, 76 Zeilen), CSS und GuideBox. Einen gemeinsamen Typ `AbilityState` in der Logik, CSS-Klassen nur daraus ableiten.
- E3 Kommentare: alle Kommentare auf Englisch, gleiche Form (kurz, „warum“ statt „was“). Stichprobe: ältere Dateien enthalten noch deutsche Wörter in Kommentaren [Annahme, per Suche prüfen].
- E4 Tests je Rolle in eigene Dateien (heute: NarratorDay/Witch/Magician/Drunk/DayNotes/Morning/Spent) – einheitliches Muster `Harness`, gemeinsame Hilfsfunktionen in eine `testKit`-Datei.

## F. Rollenspezifische Beobachtungen (einzeln)

Zählung der Rollennamen in den Kerndateien [gemessen]: Hexe 20/16/12/6/6/12/10 und Magier 23/13/9/5/13/10/4 (Guide/Zustandsmaschine/Rollenschritt/Karte/GuideBox/stepText/NarratorView), Trunkenbold 8/29/9/8/4/15/9, Amulett 7/35/14/18/9/7/1, Bürgermeister 14/32/6/5/3/0/4.

- **F1 Werwölfe**: Angriffsregel (Ziel nie `null`, Angriff auf den verdeckten Trunkenbold-Wolf erlaubt) steht in der Zustandsmaschine; der gelbe Hinweis in der UI wird aus `notes.hiddenWolf` abgeleitet – prüfen, dass die UI nicht selbst nach „Werwolf“ filtert (85 Treffer „werewolf“ in GuideBox, viele davon Rollennamen/CSS, einzeln durchsehen).
- **F2 Seherin / Lehrling**: Ergebnisschritt `vision` und Ermittler-Schritt `investigation` werden jetzt gemeinsam über `isResultStep`/`takeBackResult` zurückgenommen. Zusammenlegen mit `takeBackVision` (nur noch ein Weg). Lehrling erscheint nur in `narratorCard` und `stepText` – prüfen, ob er einen eigenen Guide-Schritt braucht (derzeit nein).
- **F3 Paranormaler Ermittler**: Feld `investigated` (drei Personen, grün/rot) in der Ansicht; die Farblogik (Werwolf ja/nein) liegt im Guide – ok. Zu klären: Einmal-Fähigkeit (`used`) doppelt berechnet in `abilitiesOf` und Zustandsmaschine.
- **F4 Hexe / Magier**: Sehr ähnlich (zwei Tränke bzw. Zauber, Frage `heal`/`poison`, Zusammenfassungszeilen, Zähler „2“ nur wenn beide Zauber da sind). Dieselben Bedingungen `status === "witch" || "magician"` stehen an mind. 8 Stellen. Ziel: ein gemeinsames Konzept „Trank-Rolle“ (`potionRole`) mit Unterschieden als Daten (Magier: Heilen kostet Zauber, Zahl-Regel) statt Verzweigungen.
- **F5 Leibwächter / Nachtgast**: Nur Logik (`stateMachine` 7/8, `roleStep` 4/4, `narratorCard` 4/4); UI ohne Sonderfälle – gut, nichts zu tun außer Test-Abdeckung prüfen.
- **F6 Amor / Liebende**: Sonderfälle in GuideBox 134 (`progress >= 1`) und NarratorView 303; Paar-Auswahl (`pairing`, 2 Personen) im Guide (714). Ziel wie C1: ein Feld `view.pairing`.
- **F7 Jäger / Trunkenbold-Jäger**: `hunter` und `drunkHunter` werden an mind. 4 UI-Stellen getrennt abgefragt; letzter Schuss hat `inDay`. Ziel: Guide liefert `lastShot: { by, inDay }`, UI kennt die zwei Status nicht. Trunkenbold-Jäger-Schritt ist laut Status offen – im Durchlauf 2 nicht anfassen.
- **F8 Bürgermeister**: Doppelte Stimme und Hinweise („Name (Bürgermeister): hat zwei Stimmen“) – Logik 32 Treffer, in der Zustandsmaschine verteilt. Auf eine Hilfsfunktion `voteWeight(player)` bündeln und prüfen, dass `voteBonus`/`voteMax` überall dieselbe nutzt.
- **F9 Zauberin (spellcaster)**: Nur Logik/Karte, keine UI-Sonderfälle – ok.
- **F10 Trunkenbold**: 15 Treffer in stepText, 29 in der Zustandsmaschine; Schritt „Wahre Rolle zeigen“ (`markRoleShown`), Maske, Wolf-Regel. Entscheidung (2026-11-24, Vorschlag des Assistenten, vom Auftraggeber freigegeben): Ein noch nicht aufgedeckter Trunkenbold zeigt bei den Toten beide Rollen („Trunkenbold, wahre Rolle: X“), ein aufgedeckter nur die wahre Rolle. Umsetzung als eigener Schritt nach C (Guide liefert das Klammer-Feld der Toten).
- **F11 Amulett**: 35 Treffer in der Zustandsmaschine, 18 in der Karte: Verlust, Vorrang vor dem Harten Burschen, Platz in der Toten-Box. Bündeln in `amulet.ts` (Regel: wer trägt, was passiert bei Tod) – derzeit über mehrere Dateien verstreut.
- **F12 Gerber (tanner)**: Gewinnregel in der Zustandsmaschine (`tannerWinner`), Hinweis `notes.tanner` im Guide, Gewinngruppe in `winnerGroups`. Sauber getrennt; nur die Zeile `narratorGuide.ts:503` (Namenssuche im Guide) ist doppelt zur Zustandsmaschine – dort `tannerWinner`-artiges Feld nutzen.
- **F13 Tag / Abstimmung / Verbannung**: `voteMaximum`, `voteTieAt`, Mehrheit „mehr als die Hälfte der abgegebenen Stimmen“, Stichwahl einmal, `announceExile`, `undoDayVote`: Logik und Guide stimmen überein (durch Tests belegt: voteCount.test.ts). Aufräumen: Altzweig `ballots` (A1), Funktionen in `guideVote` bündeln (D1).

## G. Reihenfolge für Durchlauf 2 (Vorschlag)

1. A1, A3, A2 (toter Code, mit Tests abgesichert; je Schritt tsc + betroffene Tests)
2. B1 (CSS-Doppelungen), danach B2/B3 (nur wenn B1 sauber)
3. D1, D3 (reine Aufteilung ohne Verhalten; öffentliche Schnittstelle bleibt)
4. C1–C5 + F4/F6/F7 (Guide liefert fertige Felder; UI vereinfacht)
5. D2, D4, D5, F8, F11 (Zustandsmaschine und Eventlog)
6. E1–E4 (Namen, Kommentare, Testhelfer)
7. Abschluss: komplette Tests, tsc, ESLint, Prettier, `pnpm docs:sync`, Dokumentation.

Regeln: Pro Schritt ein eigener, kleiner Commit-Vorschlag; Verhalten bleibt gleich (Tests grün vor und nach jedem Schritt); Änderungen an Spielregeln gehen nicht in dieses Refactoring. Die UI wird von mir nicht im Browser geprüft; der Auftraggeber schaut selbst.

## H. Offene Punkte / Risiken

- Nach CSS-Änderungen ist ohne Sichtprüfung keine Garantie für das Aussehen möglich [nicht verifizierbar durch Tests].
- Teilstring-Klassen (dynamische `className`) können bei A2 fälschlich als ungenutzt erscheinen.
- Grundlegende Architekturänderungen (z. B. neue Schicht-Aufteilung) bräuchten Ihre Zustimmung; der Plan bleibt innerhalb der bestehenden Schichten.

## I. Stand Durchlauf 2 (2026-11-24, We-01-151)

Erledigt (Verhalten unverändert, alle Tests grün): A1 (Stimmzettel-Altcode), A2 (ungenutztes CSS, 3441 auf 3130 Zeilen), D1 teilweise (`narratorGuide.ts` 1245 auf 1003 Zeilen: Typen, Verlauf, Gewinner ausgelagert), D3 (`GuideBox.tsx` 940 auf 480 Zeilen: `GuidePlainBox`, `GuideSummary`), C1 teilweise (Felder `potionRole`, `shooter`), F10 (Trunkenbold bei den Toten mit beiden Rollen).

Bewusst nicht gemacht: A3 (nur von Tests genutzte Exporte: sie sind Testwerkzeuge der Simulation und bleiben), B1/B2/B3 (CSS zusammenführen und aufteilen: die Reihenfolge der Regeln entscheidet über das Aussehen, ohne Sichtprüfung nicht sicher; erst mit dem Auftraggeber).

Offen: C2–C5 (weitere Felder im Guide, Zusammenfassungszeilen, Skriptkästen als Tabelle), D1 Rest (Auswahl-/Abstimmungs-/Rückgängig-Funktionen), D2, D4, D5, F4 (gemeinsames Konzept Hexe/Magier), F6, F8, F11, E1–E4, A4.

Zweiter Teil (2026-11-24): D1 weitgehend erledigt (guideFrames, guideVote, guideBack ausgelagert; `narratorGuide.ts` 800 Zeilen). Rest von D1: Auswahl- und Rückgängig-Funktionen (chooseAbility, undoSelection, takeBackResult), die eng mit `describeGuide` verflochten sind.

Dritter Teil (2026-11-24): D2 erledigt (`stateMachine.ts` 722 Zeilen; `stateTypes`, `stateVoting`, `stateQueries` ausgelagert, `applyEvent` in Nacht und Tag geteilt). Die Hilfsfunktionen der Nacht und des Tages bleiben in `stateMachine.ts`, weil sie sich gegenseitig aufrufen (eine weitere Aufteilung brächte Importzyklen).

Vierter Teil (2026-11-24): D5 erledigt (`recordWerewolfTransition` in vier kleine Funktionen geteilt, gleiche Datei, kein Verhaltenswechsel).

Fünfter Teil (2026-11-24): F4 erledigt (Hexe/Magier über `potionRoleOf` und `view.potionRole`; Unterschiede bleiben als Daten an den Stellen, an denen sie gelten).

Sechster Teil (2026-11-24): E1 und E3 erledigt (Kommentare waren schon englisch; Namensschema im Kopf von `narratorGuide.ts` festgehalten, keine Umbenennung der öffentlichen Funktionen, weil das Schema schon einheitlich ist). E2 und E4 (gemeinsamer Fähigkeits-Zustandstyp, gemeinsame Testhelfer) bleiben offen.

Siebter Teil (2026-11-24): E2 (`abilityLookOf`), E4 (`NarratorHarness`) und das Feld `bondDone` (C2/F6) erledigt. Aufgabe We-01-151 ist abgeschlossen; bewusst aufgeschoben bleiben B1 bis B3 (CSS), C3 (Zusammenfassungszeilen) und C4 (Skriptkästen als Tabelle), weil sie das Aussehen berühren und eine Sichtprüfung des Auftraggebers brauchen.
