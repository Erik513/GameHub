# Gesamtcheck nach den Tabu-Erweiterungen

## Gesamtanalyse vor dem nächsten Spielmodus (2026-11-17, Aufgabe `Al-10-04`)

Geprüft wurde ganz Tabu, bevor der Modus „Gegen die Zeit“ gebaut wird: Schichten und Abhängigkeiten, Quellcode und Struktur, Bausteine und Wiederverwendung, Spiellogik, Testabdeckung und Randfälle, Optik in beiden Sprachen und Fehlersuche. Es wurde **nichts am Spiel geändert**, außer vier neuen Tests (Lücken aus dieser Analyse). Alle Befunde stehen als Folgeaufgaben `Al-10-05` bis `Al-10-10` im Status, die Entscheidung über die Reihenfolge liegt beim Auftraggeber.

### Gesamturteil

Die Architektur ist **sauber und trägt einen dritten Modus**: keine Schichtverstöße, keine Zyklen, das `game-kit` kennt kein Spiel, die Logik ist stark getestet. Die größten Risiken liegen nicht in der Logik, sondern (1) in der **Bedienung auf dem Handy** (System-Zurücktaste verwirft ein laufendes Spiel) und (2) in der **Wartbarkeit der Oberflächenschicht** (ein Container mit Komplexität 109, Stile über drei Dateien verteilt). Beides sollte vor „Gegen die Zeit“ angegangen werden, weil der dritte Modus beide Stellen weiter belastet.

### 1. Schichten und Abhängigkeiten (gemessen, nicht geschätzt)

Ein Skript hat den Importgraphen aller Produktionsdateien aufgebaut:

- **0 Schichtverstöße.** `business` importiert nichts von außerhalb und kein React, `i18next` oder Browser-API; kein Spiel importiert ein anderes Spiel; `data` und `infrastructure` kennen keine Oberfläche; die Oberfläche importiert nie direkt `data` oder `infrastructure`; `game-kit` und `components` hängen von keinem Spiel ab. `scripts/check-business-boundaries.mjs` ist grün.
- **0 Importzyklen.**
- **Abhängigkeiten schlank:** vier Laufzeitpakete (`react`, `react-dom`, `i18next`, `react-i18next`), keines ungenutzt. Paket `dist`: 750 KB, Hauptdatei 440 KB (etwa 135 KB gepackt), die Kartenpools laden erst bei Bedarf.
- **Kein toter Code von Bedeutung.** Ungenutzte Exporte gibt es nur in der bewusst abgeschalteten KI-Kette (Ollama-Anbieter, lokaler Rückfall, Pool-Erzeugung und -Prüfung, `ADR-024`, `Al-10-03`). Keine `any`, keine `@ts-ignore`, keine `eslint-disable`, kein `TODO`, kein `innerHTML`; ein einziger `console.warn` (Offline-Fehler in `main.tsx`). Zufall wird überall eingespeist (`random`-Parameter), die Logik ist deterministisch testbar.

### 2. Befunde (nach Dringlichkeit)

**Verifiziert (im Browser oder per Messung nachgestellt):**

- **B1, hoch: Die System-Zurücktaste verwirft ein laufendes Spiel.** Drückt man auf dem Handy während einer Runde „Zurück“ (oder im Browser Zurück), wechselt die App zur Spielauswahl, die Runde und der Spielstand sind weg. Im Browser nachgestellt (`history.back()` in einer laufenden Runde führt zu „Wähle ein Spiel“). Ursache: Ansichten im Spiel sind keine Verlaufseinträge (`Al-09-04` ist nur optional geplant). Gegenmittel: Verlassen mit Bestätigung abfangen oder die Ansichten als Adressen führen. → `Al-10-05` (**erledigt am 2026-11-17**, siehe Changelog).
- **B2, mittel: Stechen nur bei zwei oder drei gleichen Teams, nirgends erklärt.** Bei vier oder mehr Teams mit gleicher Höchstpunktzahl (zum Beispiel sechs Teams ohne Punkte) endet das Spiel ohne Stechen als gemeinsamer Sieg (`tiebreakFollows`, `TIEBREAK_MAX_TEAMS = 3`). Die Regeltexte und der Info-Text sagen das nicht („Bei Gleichstand gibt es ein Stechen“). Das ist eine **Regelentscheidung** (Auftraggeber): entweder im Regeltext erklären oder das Stechen für mehr Teams ausbauen. → `Al-10-06`.
- **B3, mittel (Optik): Winzige Telefone (320 × 568).** Die Spielkarte läuft über, zwei verbotene Wörter sind von den Knöpfen verdeckt, die Pausenkarte scrollt; in der Kopfleiste wird „Tabu“ bei langem Regelknopf zu „T…“. Ab **360 × 640** und größer gibt es **keinen einzigen Befund**, auch nicht mit sechs Teams mit 24 Zeichen langen Namen, in Deutsch wie Englisch. Praktisch betrifft es nur sehr alte Geräte. → `Al-10-10`.

**Aus dem Code abgeleitet (nicht im Gerätetest bestätigt):**

- **B4, mittel: Zeitmessung mit der Wanduhr.** `useCountdown`, `useStopwatch`, die Pause im Rennen und im Stechen rechnen mit `Date.now()`. Ein Sprung der Systemuhr während einer Runde (Netzzeit, manuelle Änderung) verfälscht Rundenende oder Rennzeit; die Zeit im Rennen entscheidet den Sieg. Besser: ein gemeinsamer monotoner Zeitgeber (`performance.now()`). → `Al-10-07`.
- **B5, niedrig: Der Tastaturfokus geht beim Ansichtswechsel verloren.** Nach dem Öffnen der Spieleinstellungen steht der Fokus auf `BODY` (im Browser gemessen); Tastatur- und Screenreader-Nutzer beginnen oben. Es gibt keine Fokusführung (`useScreenScroll` setzt nur die Scrollposition). → `Al-10-09`.
- **B6, niedrig: Der Teamname wird bei 24 Zeichen still abgeschnitten**, ohne Zähler oder Hinweis. Die Business-Schicht prüft keine Höchstlängen (Teamname, Begriff, verbotene Wörter); die Grenze liegt nur im Eingabefeld.
- **B7, niedrig: Eine scrollende Liste verrät nicht, dass es weitere Zeilen gibt**, wenn gerade ganze Zeilen sichtbar sind (Endstand mit sechs Teams zeigt drei Zeilen ohne Hinweis auf die anderen). Ein Randverlauf oder ein Hinweis würde das lösen.
- **B8, niedrig: Eine eigene Karte kann ein verbotenes Wort haben, das den Begriff enthält** (Begriff „Ball“, verbotenes Wort „Fußball“). `validateCard` prüft nur die andere Richtung (Wort ist Teil des Begriffs).
- **B9, kosmetisch:** doppelte Kommentarzeile in `TabooRaceGame.tsx` (Zeilen 125 und 126), sechs ungenutzte CSS-Klassen (`taboo-card-list__group`, `taboo-review__attempt`, `kit-disclosure`, `kit-disclosure__body`, `kit-manage__actions`, `kit-tab-section`).

**Geprüft und ohne Befund:** Konsole (keine Fehler und Warnungen in Deutsch und Englisch durch Aufstellung, Regeln, Einstellungen, Runde, Auswertung), doppelte IDs, kaputte ARIA-Verweise, Felder ohne Beschriftung, Dialoge ohne Namen; harte Texte im Code (keine); Pause und Neustart im Rennen (Pausenzeit zählt nicht, jetzt durch einen Test belegt); der neue Einstieg (Einstellungen mit dem Pfeil verlassen, Spiel ohne Kategorie starten öffnet die Einstellungen mit der Meldung, jetzt durch einen Test belegt).

### 3. Quellcode und Struktur

| Stelle | Messung | Urteil |
|---|---|---|
| `TabooSetup.tsx` | 642 Zeilen, Hauptfunktion 590 Zeilen, Komplexität 109; `startGame` 126 Zeilen, Komplexität 32 | **Erledigt am 2026-11-17 (`Al-10-02`):** vorher ein Container für alles; jetzt 255 Zeilen, Komplexität 24, aufgeteilt in Hooks und Komponenten (siehe Changelog). Der ursprüngliche Befund: ein Container für Aufstellung, Einstellungen, Klassisch, Rennen, Stechen, KI-Nachladen, Pause und Neustart. Ein dritter Modus würde ihn weiter aufblähen. `Al-10-02` (schon geplant) wird dringender. |
| `stateMachine.ts`, `transitionTaboo` | 209 Zeilen, Komplexität 73 | Eine Funktion für alle Ereignisse. Gut getestet (99,3 % Zeilen, 98,2 % Zweige, Zufallsprüfung), aber schwer zu lesen; je Ereignis aufteilen, sobald „Gegen die Zeit“ dazukommt. |
| `TabooCardList.tsx` | 518 Zeilen, Komplexität 54 | Größte Komponente der Kartenverwaltung; Zeilen und Umbenennen könnten in eigene Komponenten. |
| Stile | `global.css` 1369, `kit-setup.css` 1181, `games/taboo.css` 782 Zeilen; **43 Selektoren mehrfach definiert** (zum Beispiel die Rundenkarte bis zu viermal) | Bausteine des `game-kit` (Zeitleiste, Auswahl, Punktetafel) stehen in `global.css`, andere in `kit-setup.css`. Die Wirkung hängt an der Reihenfolge der Überschreibungen. → `Al-10-08`. |
| Bausteine | `game-kit`: 45 Dateien, jede klein; `HeadingLegend`, `TabPane`, `ScoreScreen`, `Scoreboard`, `ResultList` gut wiederverwendbar | **Gut.** Tabu-spezifisch bleiben bewusst die Korrekturlisten, die Kartenverwaltung und die drei Ergebnisansichten der Modi (`TabooTurnOverview`, `TabooTiebreakWrapUp`, `TabooRaceResults`). Diese drei ähneln sich; wenn „Gegen die Zeit“ eine vierte braucht, lohnt ein gemeinsamer Baustein. |

### 4. Testabdeckung und Randfälle

684 Tests in 76 Dateien (vorher 680), alle bestanden. Abdeckung gesamt **98,3 % Zeilen, 93,4 % Zweige, 97,7 % Funktionen**; alle Grenzwerte aus `vitest.config.ts` erfüllt (Spiellogik `business/games/taboo` 99,3 % Zeilen / 98,2 % Zweige, die übrigen Business-Dateien vollständig abgedeckt, Oberfläche mindestens 94 % Zeilen je Ordner). Dazu die Zufallsprüfungen der Zustandsmaschinen (`*.invariants.test.ts`) und 31 Browserprüfungen.

- **Neu aus dieser Analyse:** Pause im Rennen zählt nicht zur Zeit (`App.test.tsx`), Start ohne Kategorie nach Verlassen der Einstellungen (`App.test.tsx`), Info neben der Überschrift und Tipp auf die Überschrift sowie die einfache Überschrift (`ChoiceGroup.test.tsx`).
- **Schwächste Stellen (Zweige):** `TabooTiebreakWrapUp` 50 %, `SetupSection` 67 %, `tabooSetupModel` 69 % (Fehlerzuordnung), `TabooRaceResults` 68 %, `TabooRaceGame` 76 %, `tabooCardPool` (Ladefehler des Kartenpools) 75 % der Zeilen. Keine davon betrifft die Spielregeln.
- **Randfälle der Logik** sind durch Tests und Zufallsprüfungen belegt: ungültige Einstellungen (0, negativ, Bruchzahl, NaN), doppelte oder leere Teamnamen (Groß-/Kleinschreibung, Leerzeichen), zu wenige Karten, ungültige Ereignisse (gleicher Zustand zurück), Korrekturen nur für den letzten Zug, Gleichstand in Zehntelsekunden. **Nicht abgedeckt:** Uhrsprünge (B4), mehr als drei Teams im Gleichstand als Spielerlebnis (B2), Systemzurück (B1).
- **Nicht gemessen:** Tests auf echten Geräten, Mutationstests, Tablet- und PC-Layout (`Al-08`).

### 5. Optik in beiden Sprachen

Alle Ansichten (Spielauswahl, Einstellungen des GameHub, Aufstellung, Regeln, Spieleinstellungen, Karten, Spieler, Teams mit sechs langen Namen, Übersicht, laufende Runde, Pause, Auswertung, Endstand) wurden in Deutsch und Englisch bei **360 × 640** und **320 × 568** durch die automatische Layoutprüfung (Seitenscroll, Überlappung, Tippflächen mindestens 44 px, abgeschnittener Text, verdeckte Wörter) gefahren, mit Screenshots durchgesehen: **keine Befunde ab 360 × 640**, Befunde bei 320 × 568 siehe B3. Lange deutsche Namen brechen mitten im Wort um („Überraschungsgäst/e Süd“), das ist bei Wörtern über Zeilenbreite hinnehmbar.

### 6. Empfohlene Reihenfolge

1. **`Al-10-05`** Systemzurück bei laufendem Spiel abfangen (B1), klein und wirkungsvoll.
2. ~~**`Al-10-02`** `TabooSetup` aufteilen~~ (**erledigt am 2026-11-17**).
3. **`Al-10-06`** Regelentscheidung zum Stechen bei vier oder mehr Teams (B2), eine Entscheidung des Auftraggebers.
4. **`Al-10-07`** Monotone Zeitmessung (B4).
5. **`Al-10-08`** Stile ordnen (Kit-Stile in Bausteindateien, Duplikate, tote Klassen).
6. **`Al-10-09`**, **`Al-10-10`** Fokusführung und 320-Pixel-Layout, wenn Zeit bleibt.

---

# Frühere Prüfung: Gesamtcheck nach den Tabu-Erweiterungen (2026-11-13)

Stand: 2026-11-13, Aufgabe `Al-10-01`. Geprüft wurde vor dem Bau der Ansicht für Teams und Spieler und vor dem nächsten Spielmodus: Dokumentation, Wiederverwendbarkeit, Bedienung (Verschieben, Scrollen), Schichten, toter Code. Die Ergebnisse stehen hier, damit man sie später nachlesen kann.

## 1. Schichten

**Ergebnis: sauber.** Die Prüfung `scripts/check-business-boundaries.mjs` ist grün; zusätzlich per Suche geprüft:

- `src/business/` importiert nichts aus `presentation`, `data`, `infrastructure`, `app` oder `i18n`.
- `src/data/` und `src/infrastructure/` importieren nichts aus `presentation` oder `app`.
- `src/presentation/` importiert nichts direkt aus `data` oder `infrastructure`; alles läuft über Schnittstellen (`TabooCardRepository`, `TabooCardGenerator`) und die Verdrahtung in `main.tsx`.

**Verbessert:** Entscheidungen, die in die Business-Schicht gehören, standen im Container `TabooSetup.tsx`. Neu in `src/business/games/taboo/cardPlan.ts`: wie viele Karten ein Spiel braucht (`requiredCards`) und welche Anfragen an einen Kartengenerator gehen (`planGenerationRequests`), mit Tests. Die zugehörigen Zahlen (`maxCardsPerRequest`, `aiCardsPerTurn`, `refillThreshold`) liegen jetzt dort statt im Präsentationsmodell.

## 2. Toter Code

Gesucht wurde mit einem Skript (Exporte, die kein anderes Produktivmodul nutzt; CSS-Klassen, die kein Code nutzt; Übersetzungsschlüssel ohne Verwendung). **Entfernt:**

- `GameHubFoundation` (`business/index.ts`) und sein Test, ein Überbleibsel vom Projektstart.
- `createLanguageSettings`, `changeUiLanguage`, `changeCardLanguage`, `LanguageSettings` (der Zustand liegt in `AppRoot`); geblieben ist der Typ `GameHubLanguage`.
- `parseCardEntries` (`cardEntry.ts`, Karten aus Text einlesen), seit das Formular `validateCard` direkt nutzt.
- `Category` und `validateCategory` im Tabu-Modell.
- `saveGeneratedCards` (Speichern der erzeugten Karten läuft über die Bibliothek).
- Zwei leere Platzhalter-Dateien `src/data/index.ts` und `src/infrastructure/index.ts` (veraltete Kommentare, nirgends importiert).
- Vier CSS-Klassen: `.taboo-setup__actions`, `.taboo-tools` (mit Regeln), `.taboo-card-entry__input`, `.layer-list`.

**Bewusst behalten:** `validateTeamSetup` (geprüfte Regeln für Teams, gehört zur geplanten Ansicht für Teams und Spieler), die Prüfhilfen in `src/i18n/translationParity.ts` (nur Tests nutzen sie), `createGameHubI18n` (Tests und Verdrahtung).

## 3. Wiederverwendbarkeit

Neu im `game-kit` (für jedes Spiel): `RulesDialog` und `RulesButton` (ein Regelfenster mit allen Spielmodi als Reiter, gleiche Größe für alle Reiter, Pfeiltasten), `useScreenScroll` (Scrollposition je Ansicht, siehe Punkt 4). Neu in `components`: `Toast` und `useNotice` (Benachrichtigungen statt Meldungsboxen), `InfoAction` im `InfoButton`.

**Tabu-spezifisch, bis ein zweites Spiel es braucht:** die Korrekturlisten der Ergebnisse (`TabooReviewList`, `TabooAttemptReviews`), die Kartenverwaltung (Bibliothek, Eingabe, Liste, Kategoriefeld) und `TabooSetupMessages`. Sie hängen an Tabu-Typen (`TabooCard`, `TabooResult`).

## 4. Bedienung

**Behoben:**

- Eine neue Ansicht (Kartenseite, Aufstellung, Spiel) begann an der Scrollposition der alten Ansicht (mitten auf der Seite). Jetzt beginnt sie oben; beim Zurück ins Hauptmenü steht es wieder an der alten Stelle (`useScreenScroll`, im Browser mit gesendeten Scroll-Ereignissen geprüft, Test vorhanden).
- Umbenennen-Zeile: gleiche Höhe, Abstand, gleich breite Knöpfe; Benachrichtigungen liegen über der Seite und verschieben nichts; das Regelfenster behält für alle Reiter dieselbe Größe.

**Bekannt und gewollt:** Beim Bearbeiten einer Karte ersetzt das Formular die Zeile, und bei „Neue Kategorie“ erscheinen Felder, deshalb rutscht der Inhalt darunter. Das lässt sich nicht ganz vermeiden; die Felder stehen stabil an ihrem Platz und es gibt keine Sprünge nach oben.

**Hinweis zur Prüfung:** Das Browser-Fenster in der Entwicklungsumgebung ist verdeckt und sendet dort keine Scroll-Ereignisse und keine Animationen; ein sichtbarer Browser tut das. Die Ereignisse wurden deshalb von Hand gesendet.

## 5. Kartenquelle „KI“ (abgeschaltet, `ADR-024`)

**Entscheidung des Auftraggebers (2026-11-13):** Die KI-Einstellung wird vorerst ignoriert und ist nicht mehr auswählbar. Gespielt werden nur die mitgelieferten und die eigenen Karten. `main.tsx` verdrahtet keinen Generator mehr; der Code (Adapter, Prüfung, Planung, Nachladen) bleibt ungenutzt im Projekt, bis `Al-10-03` entschieden ist.

Stand der Prüfung davor:

- Die Option „Kartenquelle“ erscheint nur, wenn die App Kartengeneratoren hat (`hasGenerators`); sie sind in `main.tsx` verdrahtet.
- **Ollama am selben Rechner** (`127.0.0.1:11434`): die App nimmt das erste Textmodell, das Ollama meldet (kein festes Modell; Modelle mit „embed“ und „cloud“ im Namen werden übergangen). Das geht nur am Rechner, nie am Handy (`ADR-018`). Von einer veröffentlichten Seite aus braucht Ollama die Einstellung `OLLAMA_ORIGINS`.
- **Ohne erreichbares Ollama** greift ein lokaler Rückfall: ein Generator, der nur eine kleine feste Liste von Karten (`tabooLocalCandidates.ts`, 18 Einträge) anbietet. Das ist keine KI.
- **LM Studio wird nicht unterstützt** (wurde auf Wunsch wieder entfernt, `ADR-018`). Auf dem Rechner des Auftraggebers läuft LM Studio, kein Ollama: dort ist die KI-Quelle also derzeit ohne Wirkung.

## 6. Offen (Folgeaufgaben)

- `Al-10-02`: Den Container `TabooSetup.tsx` (597 Zeilen) weiter aufteilen: `startGame` (Kartenaufbereitung, Erzeugung, Prüfung) und Pause/Neustart als Hooks.
- `Al-10-03`: Die KI-Kartenquelle später wieder anschließen (Anbieter wählen: Ollama oder LM Studio); bis dahin ungenutzter Code, den man bei einer Aufräumrunde auch entfernen kann.
- Die mobile Layout-Prüfung im Browser (`e2e`) lief in dieser Sitzung nicht (`pnpm` fehlt in der Shell); sie ist vor dem nächsten Commit-Block auszuführen.

## Zahlen

589 Tests, Abdeckung gesamt 98,0 % Zeilen / 93,6 % Zweige; alle Grenzwerte aus `vitest.config.ts` erfüllt. `tsc`, `eslint` und Prettier ohne Befund.
