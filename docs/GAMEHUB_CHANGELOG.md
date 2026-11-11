# GameHub Changelog

Alle wichtigen Projektänderungen werden in dieser Datei dokumentiert.

## 2026-11-11

### PH-12-06 – Karteneditor für eigene Karten

- Neue Liste „Meine Karten“ (`TabooCardList`) auf der Kartenseite: Suche nach Begriff oder Kategorie, Bearbeiten (Begriff, vier verbotene Wörter, Kategorie oder neue Kategorie, Schwierigkeit) und Löschen mit Zweit-Tipp-Bestätigung. Eingaben werden mit denselben Regeln wie beim Hinzufügen geprüft (vier verschiedene Wörter, kein doppelter Begriff).
- `TabooCardRepository` und die IndexedDB-Umsetzung haben `update` und `remove`; die Auswahl der Kategorie ist als `TabooCategoryField` gemeinsam mit dem Hinzufügen-Formular genutzt.
- Tests: Datenschicht, Liste und Durchlauf über die Kartenseite in Deutsch und Englisch. Prüfungen: 281 Unit-Tests, 25 e2e, tsc, eslint.

### Nachbesserung zu PH-12-04 und PH-12-05

- Reihenfolge der Spieleinstellungen: Runden, Rundendauer, Überspringen, Stechen, Kartenquelle, Kategorien, Schwierigkeit. Die Kartenquelle steht direkt über den Kategorien, die beiden Filter am Ende.
- „Überspringen pro Runde“ steht direkt unter „Rundendauer (Sekunden)“. Die Abstände im Setup sind vereinheitlicht: zwischen allen Einstellungen 16 px, zwischen den Abschnitten 32 px; der Info-Knopf vergrößert die Zeile der Beschriftung nicht mehr.
- Der einklappbare Bereich „Weitere Optionen“ entfällt: Stechen, Überspringen, Schwierigkeit und Kategorien stehen direkt untereinander im Abschnitt „Spieleinstellungen". Der Übersetzungsschlüssel `tabooSetup.moreOptions` und die zugehörigen Testschritte sind entfernt.
- „Mittel“ ist gelb statt blau (Ampel: grün, gelb, rot) (Auswahl und Anzeige in der Runde), damit es nicht wie ein gewöhnliches ausgewähltes Element aussieht.
- Schwierigkeit ist mehrfach wählbar (z. B. leicht und schwer). „Alle“ schließt die anderen aus; wählt man nichts oder alle drei, gilt wieder „Alle“. Umgesetzt als Option `multiple` im Baustein `ChoiceGroup`; die KI-Erzeugung und das Nachladen verwenden nur die gewählten Schwierigkeiten. Tests für die Auswahlregeln.
- Eigene Karten (Hinzufügen, Import, Export) liegen auf einer eigenen Seite innerhalb von Tabu, erreichbar über „Eigene Karten verwalten“ im Setup; „Zurück“ führt ins Setup, das ausgefüllt erhalten bleibt.
- Das Setup ist in zwei Abschnitte gegliedert: „Teams und Spieler“ (Teamanzahl, Namen, Reihenfolge, Spielerliste) und „Spieleinstellungen“ (Runden, Dauer, Kartenquelle, weitere Optionen). Die Spielerliste hat eine eigene Überschrift „Spieler (optional)“ und ist weiter einklappbar („Namen eintragen und verteilen“), ihr Hinweistext ist verständlicher formuliert (Namen durch Komma oder Zeilenumbruch trennen), und sie hat Innenabstand zum Rand.
- Mehrzeilige Eingabefelder (Spieler, Karten) wachsen mit dem Inhalt (`useAutoGrow` in `game-kit`).

### PH-12-05 – Mehrere Karten und Kategorien hinzufügen

- Neues Formular „Karten hinzufügen“ (`TabooCardEntry`): mehrere Karten als Textzeilen, gemeinsame Kategorie und Schwierigkeit, neue Kategorie per Namen. Ungültige Zeilen werden mit Nummer gemeldet, dann wird nichts gespeichert; vorhandene Begriffe werden übersprungen.
- Reine Logik `parseCardEntries` und `customCategoryIds` in `src/business/games/taboo/` mit Tests. Eigene Kategorien erscheinen im Setup als Filter (`tabooSetup`-Auswahl ist nun dynamisch).
- Prüfungen: 270 Unit-Tests, 25 e2e, tsc, eslint, Architekturprüfung.

### PH-12-04 – Spieler hinzufügen und auf Teams verteilen

- Neuer Bereich „Spieler und Teams (optional)“ im Tabu-Setup: Namen eintragen (Zeilen, Kommas oder Semikolon), zufällig auf die Teams verteilen oder je Spieler das Team auswählen. Übersicht der Teams mit ihren Spielern, Deutsch und Englisch.
- Gemeinsame reine Logik `parsePlayers` und `splitIntoTeams` in `src/business/shared/players.ts` mit Tests.
- Prüfungen: 263 Unit-Tests, 25 e2e, tsc, eslint, Architekturprüfung.

### PH-12-03 – Teamreihenfolge manuell oder zufällig

- Neue Auswahl „Teamreihenfolge“ im Setup (ab zwei Teams): „Zufällig“ (Standard, wie bisher) oder „Wie eingegeben“. Mit Info-Button, in Deutsch und Englisch.
- Beim Neuspielen mit gleicher Konfiguration bleibt eine eingegebene Reihenfolge erhalten, eine zufällige wird neu gelost.
- Test in beiden Sprachen. Prüfungen: 256 Unit-Tests, 25 e2e, tsc, eslint.

### PH-12-02 – Spielregeln erklären

- Neue Komponente `TabooRules`: Knopf „Spielregeln“ über dem Setup-Formular öffnet ein Fenster mit Ziel, Ablauf, Wertung, Überspringen und Spielende, in Deutsch und Englisch.
- Test für Öffnen und Schließen in beiden Sprachen. Prüfungen: 254 Unit-Tests, e2e, tsc, eslint.

### PH-11-06 – Tabu-Stile je Spiel und Nachlade-Hook

- Tabu-Stile aus `global.css` nach `src/presentation/styles/games/taboo.css` verschoben; berechnete Stile vor und nach der Trennung verglichen, keine Abweichung.
- Nachladen der KI-Karten als Hook `useTabooRefill` aus `TabooSetup.tsx` herausgelöst (815 auf 450 Zeilen insgesamt). Pause, Neustart und Stechen bleiben bewusst im Container.
- Prüfungen: 252 Unit-Tests, 25 e2e (5 mobile-only übersprungen auf Desktop), tsc, eslint und Architekturprüfung sauber.

### PH-12-01 – Info-Buttons mit Erklärfenster

- Neuer Baustein `InfoButton` in `game-kit` und optionales `info` an `ChoiceGroup`: ein „i“-Knopf rechts neben der Überschrift öffnet ein Fenster mit der Erklärung.
- Erklärungen für Runden pro Team, Kartenquelle, Stechen bei Gleichstand, Überspringen pro Runde und Schwierigkeit, in Deutsch und Englisch.
- `Button` ist standardmäßig `type="button"`, damit ein Knopf in einem Formular es nie versehentlich absendet.
- Tests für das Fenster (öffnen, schließen, Escape, kein Absenden), alle fünf Erklärungen und den Durchlauf in beiden Sprachen; die mobile Layout-Prüfung bestätigt 44-Pixel-Ziele.

### PH-11-05 – Struktur für wiederverwendbare Spielbausteine umgesetzt

- Spielmodul-Vertrag (`GameModule`: Kennung und Hauptfenster): `App` und `AppRoot` kennen kein Tabu mehr und bekommen `modules`; Tabu wird in `main.tsx` über `createTabooModule` angeschlossen. Ein Beispielmodul im Test belegt den Vertrag.
- Texte je Spiel in eigener Datei (`resources/<sprache>/taboo.ts`), eingebunden in `common.ts`.
- Leitfaden `docs/GAMEHUB_NEW_GAME_GUIDE.md` und `ADR-017`. Offen als `PH-11-06`: Hooks für die Tabu-Zustandslogik und CSS je Spiel.

### PH-11-05 – Strukturvorschlag für wiederverwendbare Spielbausteine (in Arbeit)

- Neues Dokument `docs/GAMEHUB_GAME_MODULES.md`: Ist-Zustand (815 Zeilen in `TabooSetup.tsx`, Tabu-Wissen in `App.tsx`, gemischtes CSS und gemeinsamer Namensraum für Texte), Zielbild mit `game-kit`, `business/shared` und einem Spielmodul-Vertrag, drei Optionen mit Empfehlung (moderater Umbau) und die Entscheidungen, die der Auftraggeber treffen muss.
- Freigabe erteilt (Option B, moderater Umbau; Spielmodi erst danach). Umgesetzt: Schritt 1 (`shuffle` und `teamOrder` nach `src/business/shared/`) und Schritt 2 (Bausteine `ChoiceGroup`, `Scoreboard`, `StartBar` und `TurnStrip` in `src/presentation/game-kit/`, CSS-Klassen mit Präfix `kit-`). Das Verhalten ist unverändert, alle Tests bestehen. Schritt 3: `useCountdown`, `useStopwatch` und `TimerHud` (Rundenkopf mit Zeitbalken und Farbwechsel) in `game-kit`, von der Tabu-Runde und dem Stechen gemeinsam genutzt. Schritt 4 (teilweise): `TabooSetup.tsx` von 815 auf 499 Zeilen verkleinert. Ansichten (`TabooSetupForm`, `TabooTurnOverview`, `TabooResultView`, `TabooTiebreakOverview`) und Hilfsfunktionen (`tabooSetupModel.ts`) sind ausgelagert, das Verhalten ist unverändert. Noch offen in Schritt 4: Zustandslogik (Nachladen, Pause, Neustart, Stechen) als Hooks. Offen außerdem: Schritte 5 und 6 (Spielmodul-Vertrag mit eigenem Namensraum, Leitfaden).

### PH-11-04 – Oberflächentests auf Handybreite

- Neue Browserprüfung `e2e/mobile-layout.spec.ts`: Alle Tabu-Ansichten (Menü, Einstellungen, Setup, Übersicht, Runde, Pause, Auswertung, Stechen, Ergebnis) werden auf 360 und 412 Pixel Breite in Deutsch und Englisch geprüft: kein horizontales Scrollen, Touch-Ziele mindestens 44 Pixel, nichts außerhalb des Bildschirms oder abgeschnitten, Aktionsleiste ohne Scrollen erreichbar, Bedienelemente haben einen Namen.
- Gefundene Probleme behoben: Das Markenlogo in der Kopfzeile (21 Pixel hoch), der Schließen-Knopf der Dialoge (40 Pixel) und die Überschrift „Eigene Tabu-Karten“ (21 Pixel) waren zu klein für Touch.

### PH-11-03 – Sprach- und Oberflächenabdeckung geprüft

- Fehler behoben: Das `lang`-Attribut der Seite blieb auf Deutsch, auch bei englischer Oberfläche (falsche Aussprache bei Screenreadern). Seitensprache und Meta-Beschreibung folgen jetzt der Oberflächensprache (`useDocumentLanguage`).
- Veraltete Hinweise korrigiert („Partie erneut vorbereiten“ existiert nicht mehr) und ungenutzte Texte (Architekturschichten, Beispielmeldungen, Team hinzufügen/entfernen, Kartenoptionen) entfernt.
- Neue automatische Prüfungen: gleiche Platzhalter in beiden Sprachen, keine versehentlich identischen Texte (bewusste Ausnahmen sind aufgelistet), keine ungenutzten Übersetzungsschlüssel.
- Neuer Durchlauf aller zwölf Tabu-Ansichten (Auswahl, Einstellungen, Setup, Übersicht, Runde, Pause, Auswertung, Stechen, Ergebnis) in Deutsch und Englisch: Es erscheinen keine Rohschlüssel und keine Texte der jeweils anderen Sprache.
- Zeitformat (Dezimaltrenner) je Sprache getestet. Im E2E-Test wird Seitensprache und Beschreibung nach dem Sprachwechsel geprüft.
- Der feste Markenname „GameHub“ in der Kopfzeile ist der einzige Text im Code außerhalb der Übersetzungsressourcen.

### PH-11-02 – Testabdeckung erhöht

- Neue Tests: Fehlerfälle der lokalen Kartenspeicherung (Öffnen, Blockade, abgebrochenes Lesen, ungültige Karte), Kartengenerierung (gefundener oder lokaler Generator, Fehlschläge, Abbruch), Kartenverwaltung bei Speicherfehlern, Doppelstart und Abbruch während der Vorbereitung, Seiten und App-Rahmen, Stechen ohne Ersatzkarte, Parität der Übersetzungsressourcen.
- Abdeckung: Zeilen 99,15 %, Verzweigungen 94,05 %, Funktionen 98,51 %. Übrig sind vor allem defensive Rückfallwerte.
- Fehler behoben: Der Hinweis „Keine neuen Zusatzkarten verfügbar.“ war nach dem Spielstart nie sichtbar, weil das Setup sofort ausgeblendet wird. Er steht jetzt in der ersten Rundenübersicht.

### PH-11-01 – Spiellogik und Randfälle geprüft

- Neue Zufallsprüfung (`stateMachine.invariants.test.ts`): 400 simulierte Partien mit gültigen und ungültigen Ereignissen, Prüfung von Punkten, eindeutigen Karten, Zustandsübergängen, Stechen-Daten und endgültigem Spielende.
- Gefundener Fehler behoben: Ungültige Zeitwerte (`NaN`, unendlich) im Stechen konnten die Rangfolge verfälschen und werden jetzt ignoriert.
- Zusätzliche Tests: zu wenige Karten für das Stechen, Kartensprache im Stechen.
- Regeln und Randfälle dokumentiert in `docs/GAMEHUB_TABOO_LOGIC.md`.

### PH-10-03 – Feinschliff nach Rückmeldung

- Rundenzahl pro Team: Kurz (3), Mittel (5), Lang (10) und Unbegrenzt (∞). Bei unbegrenzten Spielen lässt sich das Ergebnis nach jeder vollständig gespielten Runde anzeigen (`roundsPerTeam: "unlimited"`).
- Rundendauer: zusätzlich 120 Sekunden wählbar (60, 90, 120).
- Auswahlgruppen im Menü haben gleich breite Buttons; „Unbegrenzt“ beim Überspringen ist ein ∞-Symbol (mit Screenreader-Namen).
- Schwierigkeit im Menü farbig (grün, blau, rot) und auf der Karte links oben als Farbpunkt mit Klartext.
- Zeitanzeige und Zeitbalken wechseln in den letzten 20 Sekunden auf Gelb und in den letzten 10 auf Rot, auch im Stechen.
- Stechen: Ein verbotenes Wort gibt keine Zeitstrafe mehr, sondern zählt als falsch und bringt eine neue Karte gleicher Schwierigkeit.
- Kartenreihenfolge: Das Mischen liegt jetzt gemeinsam in der Business-Schicht (`shuffle`); nachgeladene KI-Karten werden vor dem Einreihen gemischt.
- Neue Aufgaben: Phasen PH-11 (Qualitätsprüfung) und PH-12 (Erweiterungen) sind im Plan erfasst.

### PH-10-01 – Mobile-first Oberfläche

- Kopfzeile auf einer Zeile verdichtet, Safe-Area-Abstände und `100dvh` ergänzt, Navigation erst ab Tablet-Breite sichtbar.
- Spielauswahl mit kompakten Karten; geplante Spiele treten visuell zurück.
- Laufende Tabu-Runde: Begriff füllt die Ansicht, Aktionsbuttons liegen angeheftet in der Daumenzone, Countdown färbt sich in den letzten 10 Sekunden.
- Einstellungen als Bottom-Sheet, Touch-Ziele mindestens 48 px, Eingabefelder gegen iOS-Zoom abgesichert, Theme-Farbe angepasst.
- Rundenende und Ergebnis mit Standings-Karten und vollbreiten Buttons.
- Kartensprache aus dem Tabu-Setup entfernt; es gilt die Kartensprache aus den Einstellungen.
- Kartenquelle wählbar: nur lokal, nur KI oder beides kombiniert. Schwierigkeit und Kategorien liegen unter „Weitere Optionen“.
- Start-, Richtig- und Weiter-Aktionen grün, „Verbotenes Wort“ rot.
- „Zurück zu allen Spielen“ durch ein Haus-Symbol („Spiel schließen“) ganz rechts in der Kopfzeile ersetzt.
- Einstellungen als Zahnrad-Symbol dargestellt. In der Kopfzeile steht im Spiel der Spieltitel statt „GameHub“; „GameHub“ erscheint nur im Hauptmenü.
- „Nur KI“ erzeugt vorab rund 8 Karten pro Runde und lädt während der Runde automatisch Karten nach (neues Ereignis `addCards` in der Zustandsmaschine), sobald weniger als 9 Karten übrig sind. Bei „Alle“ wechselt die Schwierigkeit zwischen den Anfragen.
- Spielkopf größer; gemeinsamer Aufbau für Spiele: Titel und Aktionen oben, Einstellungen in der Mitte, „Starten“ immer ganz unten.
- Schritt „Partie vorbereiten“ entfällt: „Starten“ bereitet die Partie vor und beginnt sofort die erste Runde. „Gleiche Einstellungen“ startet direkt neu mit gemischten Karten.
- Kartenquelle: „Beides“ steht links und ist Standard.
- Tabu-Karten haben jetzt immer vier verbotene Wörter (Modell, Standardkarten, lokale Kandidaten, KI-Vorgabe mit Oberbegriff). Die Runde zeigt sie in einem 2×2-Raster. Gespeicherte oder importierte Karten mit drei Wörtern werden nicht mehr akzeptiert.
- „Starten“ öffnet jetzt eine Rundenübersicht statt sofort die Runde zu starten: „Runde X/Y“, das Team, das als Nächstes dran ist, und eine Punkteübersicht aller Teams (meiste Punkte oben). „Runde starten“ liegt unten. Dieselbe Übersicht erscheint nach jeder Runde.
- Die Teamreihenfolge wird zu Beginn jeder Partie zufällig bestimmt und bleibt bis zum Ende gleich (neu: `shuffleTeams`). In der laufenden Runde stehen Team, „Runde X/Y“ und Punkte im Kopf.
- Punkteübersicht auch im Endergebnis, mit hervorgehobenen Gewinnerteams.
- Alle 20 Browserprüfungen lokal bestanden (Chrome, Desktop und Mobil).
- Nach einer Runde entfällt die Meldung „Runde beendet“. Stattdessen zeigt die Übersicht „Als Nächstes dran“, den Gesamtpunktestand und die gespielte Runde mit allen Kartenbegriffen in Grün (richtig) oder Rot (nicht gewertet). Ein Tipp auf einen Begriff ändert die Wertung und passt die Punkte an (neues Ereignis `reviseResult`).
- „Letzten Punkt zurücknehmen“ entfällt in Runde und Übersicht; Korrekturen erfolgen nur in der Rundenübersicht.
- Die Rundenübersicht zeigt unter jedem Begriff auch die vier verbotenen Wörter.
- Eine Runde endet nicht mehr nach wenigen Karten: Sie bekommt alle ungespielten Karten, danach früher gespielte Karten in neuer Reihenfolge (nie zweimal in derselben Runde). Die Zustandsmaschine erlaubt dafür das Wiederverwenden von Karten in späteren Runden.
- Einheitliche Navigation: Hauptmenü und Spiel-Hauptfenster zeigen Einstellungen (Zahnrad), das Spiel-Hauptfenster zusätzlich das Haus zurück zum GameHub. Während einer laufenden Partie (Übersicht, Runde, Ergebnis) gibt es oben nur noch ein X „Spiel beenden“. Die Bestätigung erfolgt ohne Dialog: Das erste Tippen färbt den Button für 3 Sekunden rot und erweitert ihn um den Hinweis „Nochmal tippen zum Beenden“ (auf dem Handy gibt es keine Tooltips), erst ein zweites Tippen beendet (neue Komponente `ConfirmButton`, ein schnelles Doppeltippen zählt nicht). Es führt zurück ins Hauptfenster des Spiels mit der bisherigen Einrichtung. Neue Spiele binden sich über `useGameExit` ein.
- Einstellungsfenster kompakter; Schließen-Button als kleines X.
- Rundenübersicht kompakter: Die Karte „Als Nächstes dran“ entfällt. Der Teamname sitzt (klein, ohne Rahmen) als Erweiterung direkt über dem Button „Runde starten“.
- Überspringen pro Runde begrenzt: Auswahl „Nie / 1 / 2 / 3 / Unbegrenzt“ unter „Weitere Optionen“, Standard 1 (neue Konfiguration `skipsPerRound`, von der Zustandsmaschine durchgesetzt). Ist das Limit aufgebraucht, verschwindet „Überspringen“ und „Verbotenes Wort“ füllt die linke Spalte.
- Laufende Runde ist pausier- und unterbrechbar: Oben steht in der Runde nur noch Pause/Fortsetzen (Play-Symbol). Während der Pause läuft der Timer nicht weiter, die Karte ist verdeckt („Pausiert“) und die Wertungsbuttons sind gesperrt. In der Pause gibt es „Fortsetzen“, „Runde neu starten“ (rote Zweifach-Bestätigung; verwirft die Punkte und Ergebnisse dieses Zuges und startet mit neuen Karten; bereits gezeigte Karten dieses Zuges kehren nicht zurück, damit niemand schummeln kann; Ereignis `restartRound`) und „Runde beenden“ (zeigt die Rundenübersicht). Das ganze Spiel beendet nur das X in Übersicht und Ergebnis.
- Das Entwicklungs-Dashboard erhält seinen eingebetteten Status per `pnpm docs:sync` aus `docs/GAMEHUB_STATUS.json`; `pnpm docs:check` läuft in der CI und schlägt bei veraltetem Stand fehl.
- Stechen bei Gleichstand (Option „Stechen bei Gleichstand“ unter „Weitere Optionen“, Standard an): Liegen 2–3 Teams nach der letzten Runde gleichauf, erklärt jedes Team nacheinander drei Begriffe (je einen einfachen, mittleren und schweren, für jedes Team andere Karten) auf Zeit. Verbotenes Wort gibt +5 Sekunden Strafe, einmal überspringen ist erlaubt (Ersatzkarte gleicher Schwierigkeit), nach 90 Sekunden endet der Versuch. Es gewinnt, wer die meisten Begriffe in der kürzesten Zeit schafft; bei exakt gleichem Ergebnis oder mehr als drei gleichauf liegenden Teams gewinnen alle gemeinsam. Pause zählt nicht zur Zeit. Die Ergebnisansicht zeigt Begriffe und Zeiten. Neue Zustände/Ereignisse in der Zustandsmaschine (`tiebreak`, `beginTiebreakAttempt`, `answerTiebreak`, `endTiebreakAttempt`) und `pickTiebreakCards`.
- Die Schwierigkeit (Einfach/Mittel/Schwer) steht während der Runden als kleines Etikett auf der Karte.
- Endergebnis im Stil der übrigen Ansichten: Beschriftung „Spiel beendet“, ein Gewinnerblock mit großem Teamnamen (bei Gleichstand „Gemeinsam gewonnen“), die Punkteliste und die beiden Aktionen („Gleiche Konfiguration“, „Neue Partie“) unten angeheftet. Die generische Statusbox entfällt.
- Zweifach-Bestätigungen (`ConfirmButton`) zeigen im ersten Schritt sichtbar, was ein erneutes Tippen auslöst. „Runde neu starten“ meldet „Keine neuen Karten verfügbar.“, wenn der Kartensatz keine ungesehene Karte mehr hat.
- Rundenkopf als ein Block mit Team, „Runde X/Y“, Punkten und Sekunden, darunter ein Zeitbalken (wird rot in den letzten 10 Sekunden). Auf der Karte stehen die verbotenen Wörter unter der Beschriftung „Verbotene Wörter“ in rötlich umrandeten Kacheln, durch eine Trennlinie klar vom Begriff abgesetzt (Begriff oben, Wörter unten).
- Der Überspringen-Button zeigt klein darunter den Hinweis „nur 1× pro Runde“ (bei anderen Limits „noch X von Y“).
- Aktionsbuttons in der Runde neu angeordnet: „Richtig“ groß rechts (zwei Zeilen hoch), links oben „Verbotenes Wort“, darunter „Überspringen“.
- Punkteübersicht ohne Hervorhebung des nächsten Teams; das Team steht über „Runde starten“.
- Übersprungene Karten erscheinen in der Rundenübersicht neutral (grau, „Übersprungen“) und sind nicht änderbar; die Zustandsmaschine lehnt Änderungen an ihnen ab. Änderbar bleiben nur richtige und falsche Karten.
- Orange Akzente (Markierungen, Kartenrand, verbotene Wörter, Spielkarte) durch das blaue Akzentblau ersetzt; Rot bleibt für „Verbotenes Wort“.
- Teamnamen im Tabu-Setup frei wählbar; leere Felder fallen auf „Team N“ zurück, doppelte Namen werden abgelehnt.

### Kompakte Tabu-Oberfläche

- Tabu auf Desktop und Mobil in einer schmalen, zentrierten Ansicht dargestellt.
- Teams, Runden und Zeit stehen vor aufklappbaren Kartenoptionen. Kartenverwaltung ist während der Partie ausgeblendet.
- Laufende Runde mit großem Begriff, rein numerischem Countdown und klarer Reihenfolge der Kartenaktionen gestaltet.

### PH-08-04 – Release-Abnahme und Punktekorrektur

- Versehentlich vergebene Tabu-Punkte lassen sich in der laufenden Runde und in der Zusammenfassung zurücknehmen.
- Tastaturbedienung und zentrale Kontraste geprüft. 148 automatisierte Tests und 20 Browserprüfungen bestanden.
- Ersten lokalen Tabu-Release abgenommen und auf GitHub Pages veröffentlicht.

### PH-08-03 – Veröffentlichung über GitHub Pages

- Produktionsartefakt wird erst nach erfolgreichen Pflichtprüfungen von `main` veröffentlicht.
- Browserprüfungen verwenden das vorinstallierte Chrome des GitHub-Runners. Fehler liefern Screenshots und Traces.
- Öffentliche App unter https://erik513.github.io/GameHub/ geprüft. Assets, direkter Tabu-Link und Offline-Neuladen waren erfolgreich.

### PH-08-02 – Offline- und Update-Prüfungen

- Fehlgeschlagene Cache-Installation räumt ihren eigenen Cache auf. Die bisherige Version bleibt offline verfügbar.
- Versionswechsel, Aufräumen des alten Caches und erneuter Offline-Start im Browser geprüft.
- 20 Browserprüfungen auf Desktop und Mobil bestanden.

### PH-08-01 – Kritische Tabu-Spielabläufe

- Vollständige Partien mit Einzelsieg und Gleichstand auf Deutsch und Englisch im Browser geprüft.
- Kartenaktionen, Teamwechsel, Neustart und Neuladen abgedeckt. 18 Desktop- und Mobilprüfungen bestanden.
- Race und Countdown-Duell als spätere Tabu-Spielmodi im Projektplan festgehalten.

### PH-07-05 – Tabu-Kartenvorschläge und lokale Speicherung

- Lokalen Kartenvorrat und optionales Ollama-Modell in der Tabu-Ansicht auswählbar gemacht.
- Gültige Vorschläge und Ablehnungsgründe angezeigt. Nur ausgewählte und bestätigte Karten werden gespeichert.
- 147 automatisierte Tests und 14 Browserprüfungen bestanden. Lokale Vorschläge sind offline nutzbar.

### PH-07-04 – Optionaler Ollama-Adapter

- Lokale Ollama-API mit strukturierten JSON-Antworten an den Generierungsvertrag angebunden.
- Fehlerhafte Antworten, fehlende Verbindung, Zeitüberschreitung und Abbruch behandelt.
- 145 Tests bestanden. Der Adapter wurde mit simulierten HTTP-Antworten geprüft.

### PH-07-03 – Lokaler Anbieter für Tabu-Karten

- Separaten Vorrat mit 18 deutschen und 18 englischen Kartenkandidaten ergänzt.
- Auswahl nach Sprache, Kategorie und Schwierigkeit. Zu kleine Vorräte werden als Teilergebnis gemeldet.
- 135 Tests bestanden. Alle lokalen Kandidaten wurden ohne Netzwerk geprüft.

### PH-07-02 – Generierte Tabu-Karten prüfen

- Kartenfelder, angefragte Sprache, Kategorie, Schwierigkeit und Verbotswörter geprüft.
- Unicode und Leerzeichen normalisiert. Ablehnungen enthalten Kartenposition und Fehlergrund.
- Vor dem gemeinsamen Speichern ausgewählter Karten wird der aktuelle Bestand erneut auf Duplikate geprüft. 132 Tests bestanden.

### PH-07-01 – Anbieterunabhängiger Vertrag für Kartengenerierung

- Anfrage, Kartenkandidaten, vollständige und teilweise Ergebnisse, Fehler und Abbruch definiert.
- Anbieter geben unterstützte Sprachen, maximale Anfragemenge und Offlinefähigkeit an.
- 129 Tests bestanden, darunter Vertragsfälle mit Testanbieter.

### PH-06-04 – Installierbare Web-App und Offlinebetrieb

- Manifest und App-Symbol für GameHub ergänzt.
- Produktionsdateien mit einem Service Worker zwischengespeichert. Neue Versionen übernehmen nach dem Schließen der bisherigen App-Fenster.
- 14 Browserprüfungen bestanden, einschließlich Tabu-Spielstart nach Offline-Neuladen auf Desktop und Mobil.

### PH-06-03 – Eigene Tabu-Karten importieren und sichern

- Versioniertes JSON-Format und Prüfung der Karten vor dem Import ergänzt.
- Doppelte IDs und Begriffe in derselben Sprache werden übersprungen. Eigene Karten bleiben bei Änderungen der Standardsätze erhalten.
- Import und Export in der Tabu-Ansicht ergänzt. 126 Tests bestanden.

## 2026-11-10

### PH-06-02 – Deutsche und englische Tabu-Standardkarten

- Je 45 geprüfte Standardkarten in drei Kategorien und Schwierigkeitsstufen ergänzt.
- Karten werden am Anwendungseinstieg bereitgestellt. Die Oberfläche greift über typisierte Eingabedaten darauf zu.
- Vor Spielbeginn wird mindestens eine passende Karte je Teamrunde verlangt. Der Vorrat wird auf die verbleibenden Teamrunden aufgeteilt.
- 109 Tests bestanden, darunter Bestandsprüfung und Datensatzvalidierung.

### PH-06-01 – Lokaler Kartenspeicher

- Versionierten IndexedDB-Speicher mit eigener Tabu-Schnittstelle für benutzerdefinierte Karten ergänzt.
- Fünf Integrationstests prüfen Schema, erneutes Öffnen, Eingabevalidierung und Rücknahme fehlerhafter Schreibvorgänge.
- Speicherumfang und späteren Tabu-Feinschliff zur Korrektur versehentlicher Wertungen im Projektplan festgehalten.

### PH-05-04 – Spielende und Neustart

- Endstand und Sieger nach der letzten Runde angezeigt, einschließlich gemeinsamer Sieger bei Gleichstand.
- Neue Partie mit gleicher oder neuer Konfiguration ermöglicht. Punkte und gespielte Karten werden zurückgesetzt.
- 101 Tests bestanden, darunter Einzelsieg, Gleichstand und beide Neustartwege.

### PH-05-03 – Rundenende

- Rundenpunkte, Gesamtpunktestand aller Teams und nächstes Team angezeigt.
- Nächste Runde startet per Klick mit neuem Countdown und ungespielten Karten. Ein erschöpfter Beispielsatz wird gemeldet.
- 99 Tests bestanden, darunter Runden mit und ohne Punkte sowie der Teamwechsel.

### PH-05-02 – Laufende Runde und Timer

- Tabu-Runde mit Countdown, Team, Punkten, Begriff und drei verbotenen Wörtern ergänzt.
- Kartenaktionen werten die aktuelle Karte. Beim Zeitablauf endet die Runde automatisch.
- Kleinen deutschen und englischen Beispielsatz für die laufende Runde ergänzt.
- 99 Tests bestanden. Neue Browserprüfung auf Desktop und Mobil erfolgreich.

### PH-05-01 – Tabu-Spielkonfiguration

- Formular für Teams, Rundenzahl, Rundendauer, Kartensprache, Kategorien und Schwierigkeit ergänzt.
- Fehler in Deutsch und Englisch angezeigt. Gültige Angaben erzeugen den Vorbereitungszustand der Partie.
- 98 Tests bestanden, darunter Formularvalidierung und Vorbereitung in beiden Sprachen.

### PH-04-05 – Kartenfilter und Deckbildung

- Karten nach Sprache, Kategorie und Schwierigkeit filtern und mit austauschbarer Zufallsquelle mischen.
- Doppelte Kartenkennungen und bereits gespielte Karten ausschließen. Leere und zu kleine Decks gesondert melden.
- 96 Tests bestanden. Die Tabu-Kernlogik ist abgeschlossen.

### PH-04-04 – Rundenfolge und Siegerermittlung

- Spielende nach der konfigurierten Zahl von Runden pro Team geprüft.
- Alle Teams mit Höchstpunktzahl werden in der Reihenfolge der Teamliste als Sieger ausgewiesen.
- 88 Tests bestanden, darunter Partien mit zwei und drei Teams, Einzelsieg und Gleichstand.

### PH-04-03 – Kartenaktionen und Punkte

- Richtige Antworten zählen einen Punkt. Überspringen und verbotene Wörter zählen null Punkte.
- Jede gewertete Karte wird für die restliche Partie gesperrt. Nach der letzten Karte endet die Runde.
- 87 Tests bestanden, darunter alle Kartenaktionen und Wiederholungsversuche.

### PH-04-02 – Zustandsmaschine und Übergänge

- Tabu-Zustandsmaschine für Vorbereitung, laufende Runde, Rundenende und Spielende ergänzt.
- Ungültige Übergänge, Karten in der falschen Sprache und verspätete Rundenende-Ereignisse werden abgewiesen.
- Vollständige Partie mit drei Teams und zwei Runden geprüft; insgesamt 86 Tests bestanden.

### PH-04-01 – Tabu-Domänenmodell und Validierung

- Unabhängige fachliche Typen für Teams, Kategorien, Schwierigkeit, Karten und Spielkonfiguration ergänzt.
- Mindestens zwei eindeutig benannte Teams, positive ganzzahlige Rundendauer und Rundenzahl sowie deutsche oder englische Sprachmetadaten geprüft.
- Exakt drei unterschiedliche, nichtleere verbotene Wörter erzwungen; der gesuchte Begriff darf nicht darunter sein.
- Unicode und Leerzeichen normalisiert; strukturierte Fehlercodes für spätere lokalisierte Anzeigen bereitgestellt.
- 83 Tests bestanden, davon 26 neue Domänenfälle; neue Spiellogik mit 100 % Zeilen- und Verzweigungsabdeckung.

### PH-03-03 – Einstellungen und Statusmeldungen

- Lokalisierten Einstellungsdialog für getrennte Oberflächen- und Kartensprachen ergänzt.
- Zugängliche Lade-, Fehler-, Erfolgs- und Leerzustände erstellt.
- 57 Tests und zehn Desktop-/Mobil-Browserprüfungen erfolgreich ausgeführt.

### PH-03-02 – App-Shell, Spielkatalog und Navigation

- Responsive App-Shell mit GameHub-Marke, Hauptnavigation und dauerhaft erreichbaren Spracheinstellungen erstellt.
- Verpflichtende Spielauswahl als Startseite umgesetzt; kein Spiel startet automatisch.
- Genreunabhängigen Spielmodulvertrag für ID, Route, Übersetzungsschlüssel, Status und visuellen Akzent eingeführt.
- Zentralen Katalog mit Tabu-Entwicklungsvorschau sowie geplanten Karten-, Scharade-, Quiz- und „Wer bin ich?“-Modulen angelegt.
- Statisches Hash-Routing für GitHub-Pages-kompatible Navigation zwischen Spielauswahl und Vorschau umgesetzt.
- Geplante Spiele klar gekennzeichnet und deaktiviert; Tabu öffnet eine Entwicklungsvorschau ohne Spielfunktion vorzutäuschen.
- 52 Tests und acht Desktop-/Mobil-E2E-Fälle erfolgreich ausgeführt.
- Zusätzliche sichtbare Browserprüfung war wegen ausgeschöpftem Browser-Kontingent nicht verfügbar; responsive Darstellung und Navigation wurden durch Playwright verifiziert.


### PH-03-01 – Design-Tokens und Basiskomponenten

- Zurückhaltende GameHub-Designrichtung mit primärem Dark Mode, tiefem Anthrazit, warmem hellem Text, Kobaltblau und gezieltem Korallakzent umgesetzt.
- Zentrale Tokens für Farben, Typografie, Abstände, Radien, Schatten, Kontrollgrößen und Inhaltsbreiten angelegt.
- Wiederverwendbare Komponenten für Buttons, Eingabefelder, Karten und Dialoge erstellt.
- Tastaturfokus, deaktivierte Zustände, Fehlerbeschreibungen, Dialogfokus und Escape-Schließen zugänglich umgesetzt.
- Startansicht ohne Verläufe und Glaseffekte auf das neue Designsystem umgestellt.
- Desktopansicht und 320-Pixel-Mobilansicht im Browser geprüft; kein horizontales Scrollen festgestellt.
- 43 Tests erfolgreich; Basiskomponenten erreichen 100 % Zeilen- und 96,29 % Verzweigungsabdeckung.
- Primäre Farb-Tokens nach Nutzerpräferenz vollständig auf Dark Mode umgestellt; Formensprache, Kontraste und Komponentenstruktur beibehalten.


### PH-02-04 – Übersetzungsparität prüfen

- Rekursive Prüfung für identische Schlüsselstrukturen in deutschen und englischen Übersetzungsressourcen ergänzt.
- Leere, ausschließlich aus Leerzeichen bestehende und ungültige Nicht-Text-Werte werden abgewiesen.
- Positive Prüfung der echten Ressourcen sowie negative Fälle für fehlende, zusätzliche, leere und ungültige Werte umgesetzt.
- Eigenen Befehl `pnpm check:translations` ergänzt und als verpflichtenden Schritt in GitHub Actions aufgenommen.
- i18n-Dateien in die Coverage-Messung und bereichsspezifische Mindestgrenze aufgenommen.
- 35 Tests erfolgreich; Phase 2 ist damit vollständig abgeschlossen.

### PH-02-03 – Unabhängige Kartensprache

- Reines Business-Modell für unabhängige UI- und Kartensprache ergänzt.
- Alle vier Kombinationen aus Deutsch und Englisch sowie unabhängige Änderungen beider Werte getestet.
- Kartensprache als eigene, lokalisierte Auswahl in die Startansicht aufgenommen.
- UI- und Kartensprache unter getrennten localStorage-Schlüsseln gespeichert.
- Gespeicherte Kartensprache beim App-Start wiederhergestellt; ohne gespeicherten Wert wird einmalig die initiale UI-Sprache übernommen.
- 29 Unit-, Infrastruktur- und Komponententests sowie sechs E2E-Fälle in Desktop- und Mobilprofilen erfolgreich ausgeführt.

### PH-02-02 – Erkennung, Auswahl und Persistenz der UI-Sprache

- Gespeicherte UI-Sprache vor der Browsersprache priorisiert und Englisch als kontrollierten Fallback beibehalten.
- Sprachvarianten wie `de-DE` und `en-US` auf die unterstützten Sprachen normalisiert.
- Zugängliche Sprachwahl für Deutsch und Englisch in die Startansicht integriert.
- Speicher-Port von einem fehlertoleranten localStorage-Adapter getrennt und im Composition Root verdrahtet.
- Sprachwechsel dauerhaft gespeichert und beim Neuladen vor dem ersten Rendern wiederhergestellt.
- 19 Unit-, Infrastruktur- und Komponententests sowie vier E2E-Fälle in Desktop- und Mobilprofilen erfolgreich ausgeführt.

### Erweiterbare Spielauswahl verbindlich geplant

- App-Start mit verpflichtender Spielauswahl als dauerhafte Produktanforderung festgelegt.
- Zentralen, genreunabhängigen Spielkatalog als einzige Quelle für verfügbare und geplante Spiele beschlossen.
- Minimalen Spielmodulvertrag für Kennung, Übersetzungsschlüssel, Route und Verfügbarkeitsstatus nach `PH-03-02` vorgezogen.
- `PH-09-02` auf eine spätere, bedarfsgesteuerte Überprüfung und Erweiterung des frühen Vertrags ausgerichtet.
- ADR-013 und verbindliche Arbeitsregeln ergänzt, damit Shell und Navigation keine einzelnen Spiele fest einbauen.

### PH-02-01 – i18n-Grundkonfiguration

- `i18next` und `react-i18next` als Laufzeitabhängigkeiten eingerichtet.
- Gemeinsamen Übersetzungsnamensraum mit deutschen und englischen Ressourcen angelegt.
- Englisch als kontrollierte Fallback-Sprache und Deutsch sowie Englisch als unterstützte Sprachen definiert.
- i18next-Typen um die GameHub-Ressourcenstruktur erweitert, sodass Übersetzungsschlüssel statisch geprüft werden.
- Sämtliche sichtbaren Texte der Startansicht aus den React-Komponenten in Übersetzungsressourcen verschoben.
- Initialisierung und Darstellung der Startansicht in beiden Sprachen mit sieben erfolgreichen Tests geprüft.
- Sprachregeln für deutsches Entwicklungs-Dashboard sowie englischen Quellcode und englische Code-Kommentare verbindlich dokumentiert.

### PH-01-06 – GitHub-Actions-Qualitätsworkflow abgeschlossen

- Lokales Repository mit `https://github.com/Erik513/GameHub` verbunden und vollständigen Projektstand auf `main` veröffentlicht.
- Vorhandenen GitHub-Initialisierungscommit ohne Überschreiben in die gemeinsame Historie aufgenommen.
- Ersten gehosteten Workflowlauf `42850423012` erfolgreich abgeschlossen.
- Quality-Job mit Format, Lint, Typecheck, Architekturprüfung, Coverage und Build erfolgreich ausgeführt.
- Playwright-E2E-Job mit Desktop- und Mobilprofil erfolgreich ausgeführt.
- `PH-01-06` abgeschlossen; Phase 1 ist damit vollständig erledigt.

### Umbenennung in GameHub

- Projektordner von `PartyHub` in `GameHub` umbenannt.
- Paketname, React-Komponenten, Business-Typen, Tests, E2E-Prüfungen, Dashboard und sämtliche Dokumentation auf `GameHub` umgestellt.
- Dokumentationsdateien von `PARTYHUB_*` in `GAMEHUB_*` umbenannt.
- Produktbeschreibung für Party-, Quiz-, Karten- und weitere Gesellschaftsspiele geöffnet.
- pnpm-Abhängigkeiten am neuen Repository-Pfad vollständig neu verknüpft.

## 2026-11-09

### PH-01-06 – GitHub-Actions-Qualitätsworkflow

- GitHub-Actions-Workflow für Pushes, Pull Requests und manuelle Ausführung erstellt.
- Offizielle Actions `actions/checkout@v7`, `pnpm/setup@v1` und `actions/upload-artifact@v7` verwendet.
- Node.js 24, pnpm 11.25.0, Dependency-Cache und Installation mit eingefrorenem Lockfile konfiguriert.
- Quality-Job für Format, Lint, Typecheck, Architekturprüfung, Vitest-Coverage und Produktions-Build eingerichtet.
- Separaten Playwright-Job mit gebündeltem Chromium sowie Diagnoseartefakten bei Fehlern eingerichtet.
- Playwright verwendet lokal installiertes Chrome und in CI das gebündelte Chromium.
- YAML-Format, alle Workflow-Befehle, beide lokalen E2E-Profile und die CI-Projektauflösung erfolgreich geprüft.
- Aufgabe bleibt blockiert, bis ein GitHub-Remote verbunden und der erste gehostete Workflow erfolgreich ausgeführt wurde.

### PH-01-05 – Playwright-Grundkonfiguration

- Playwright Test 1.65.0 eingerichtet.
- Desktop-Chromium- und Mobile-Chromium-Profil auf Basis des lokal installierten Chrome konfiguriert.
- Automatischen Vite-Webserver für E2E-Läufe eingebunden.
- Screenshots nur bei Fehlern sowie Video und Trace zur Fehlerdiagnose konfiguriert.
- Smoke-Test für Titel, Hauptüberschrift und Architekturliste ergänzt.
- Zwei reguläre Smoke-Tests in Desktop- und Mobilprofil erfolgreich ausgeführt.
- Kontrollierter Fehltest erzeugte Screenshot, Video und Trace wie vorgesehen. Temporärer Test und seine Artefakte wurden anschließend entfernt.
- Installation des gebündelten Chromium-Browsers wegen zu wenig freiem Speicher abgebrochen. Das bereits installierte Chrome wird erfolgreich verwendet.
- Vitest-Coverage, Lint, Formatprüfung, Typecheck, Architekturtest, Produktions-Build und Peer-Prüfung erneut erfolgreich ausgeführt.

### PH-01-04 – Coverage und Bereichsgrenzen

- V8-Coverage-Provider passend zu Vitest 5.1.0 eingerichtet.
- Text-, JSON-, JSON-Summary-, HTML- und LCOV-Berichte konfiguriert.
- Line-, Branch-, Function- und Statement-Grenzen festgelegt. Kritische Spiellogik 95 %, Business 90 %, Data/Infrastructure 80 % und Presentation/App 75 %.
- Dritten Komponententest für den Composition Root ergänzt.
- Positiver Coverage-Lauf mit drei bestandenen Tests und 100 % auf allen aktuell ausführbaren Dateien erfolgreich.
- Kontrollierter Negativtest unterschritt die globale und UI-spezifische Grenze und ließ den Coverage-Befehl erwartungsgemäß fehlschlagen.
- Lint, Formatprüfung, Typecheck, Architekturtest, Produktions-Build und Peer-Prüfung erneut erfolgreich ausgeführt.

### PH-01-03 – Vitest und Testing Library

- Dashboard-Zustandsspeicherung von flüchtigem Session Storage auf dauerhaftes Local Storage umgestellt. Klappzustände werden bei jeder Änderung und die Scrollposition beim Scrollen beziehungsweise Verlassen gespeichert.
- Vitest 5.1.0 mit jsdom-Testumgebung und zentralem Setup eingerichtet.
- Testing Library für React, DOM, jest-dom-Matcher und user-event installiert.
- Explizites DOM-Cleanup nach jedem Test eingerichtet.
- Neutralen Business-Unit-Test und Komponententest der Startansicht ergänzt.
- CI-Testlauf und Watch-Einstieg erfolgreich geprüft. Zwei von zwei Tests bestehen.
- Dashboard-Anzeige „Stand“ auf die tatsächliche 20-Sekunden-Prüfzeit umgestellt und den Projekt-Datenstand separat ausgewiesen.
- Lint, Formatprüfung, Typecheck, Architekturtest, Produktions-Build und Peer-Prüfung erneut erfolgreich ausgeführt.

### PH-01-02 – Linting und Formatierung

- ESLint 10 mit type-aware TypeScript-Regeln sowie React-Hooks- und React-Refresh-Regeln eingerichtet.
- Prettier mit einheitlicher Projektkonfiguration und gezieltem Prüfbereich eingerichtet.
- Skripte `lint`, `lint:fix`, `format` und `format:check` ergänzt.
- TypeScript auf die von typescript-eslint unterstützte Version 6.0.3 festgelegt.
- Positive Lint- und Formatläufe sowie negativer Regel-Smoke-Test erfolgreich geprüft.
- Typecheck, Architekturprüfung, Produktions-Build und Peer-Abhängigkeitsprüfung erneut erfolgreich ausgeführt.

### Projektumzug

- GameHub nach `C:\Users\Kosta\source\repos\GameHub` verschoben.
- Git-Repository mit Hauptbranch `main` initialisiert.
- TypeScript-Buildinformationen über `.gitignore` von der Versionierung ausgeschlossen.

### PH-01-01 – Vite-Grundprojekt und Schichtenstruktur

- React 19.3.1, React DOM 19.3.1, TypeScript 7.0.2 und Vite 8.3.6 mit pnpm eingerichtet.
- Strikte TypeScript-Projektkonfiguration und Vite-Composition-Root angelegt.
- Verzeichnisse für Presentation, Business, Data, Infrastructure, i18n und App-Verdrahtung erstellt.
- Neutralen, responsiven GameHub-Startbildschirm umgesetzt.
- Automatische Prüfung der Business-Schicht gegen äußere Abhängigkeiten ergänzt.
- Typecheck, Architekturprüfung, Produktions-Build und Entwicklungsserver-Smoke-Test erfolgreich ausgeführt.

### Projektvorbereitung

- `PH-01-01` gestartet und Projektstatus auf `in_progress` gesetzt.
- pnpm 11.25.0 als verfügbaren Paketmanager erkannt. Die frühere npm-Blockade ist damit aufgelöst.
- Dashboard lädt im direkten Dateimodus alle 20 Sekunden neu und stellt Scrollposition, Klappzustände und Fokus aus dem Session-Speicher wieder her.
- Falsch gesetzten zukünftigen Statuszeitpunkt von 20:00 Uhr auf den tatsächlichen Stand 19:43 Uhr korrigiert.
- Hinweisbanner beim direkten Öffnen des Dashboards entfernt. Der eingebettete Status wird in diesem Modus ohne Warnmeldung dargestellt.
- Dashboard-Aktualisierung zustandserhaltend gemacht. Unveränderte Statusdaten erzeugen keinen DOM-Neuaufbau. Bei echten Änderungen bleiben Scrollposition, geöffnete Phasen und Tastaturfokus erhalten.
- Dashboard um einen eingebetteten Status-Fallback für das direkte Öffnen per `file://` ergänzt. Der Live-Modus über HTTP lädt weiterhin alle 20 Sekunden die Statusdatei.
- Verbindliche Arbeitsregeln in `AGENTS.md` angelegt.
- Vollständigen Projektplan mit neun Phasen, Aufgaben, Akzeptanzkriterien und Testanforderungen erstellt.
- Maschinenlesbare Statusverwaltung mit stabilen Aufgaben-IDs eingerichtet.
- Entwicklungs-Dashboard mit automatischer Aktualisierung im 20-Sekunden-Takt erstellt.
- Architekturentscheidungen für Schichten, Zustandsmaschine, Internationalisierung, Speicherung, PWA, Provider-Abstraktion und Tests dokumentiert.
- README mit Ziel, Stack, Status und nächstem Schritt erstellt.
- Umgebung geprüft. Node.js 24.22.1 und Git 2.55.0 sind verfügbar. `npm` ist nicht im PATH verfügbar. Noch kein Git-Repository vorhanden.

Es wurden keine Spiele, keine KI-Anbindung und kein Multiplayer implementiert.
