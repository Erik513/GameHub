# Gesamtcheck nach den Tabu-Erweiterungen

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
