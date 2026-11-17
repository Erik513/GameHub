# Leitfaden: Ein neues Spiel anlegen

Dieser Leitfaden beschreibt, was ein neues Spiel mitbringen muss und was es von GameHub geschenkt bekommt. Er gehört zu `Ta-05-05` und stützt sich auf `docs/GAMEHUB_GAME_MODULES.md`.

## Was ein Spiel liefert

| Teil | Ort | Inhalt |
|---|---|---|
| Regeln | `src/business/games/<spiel>/` | Modelle und Zustandsmaschine. Keine UI, keine Browser-APIs, keine KI-Anbieter. Zufall wird als Parameter übergeben. |
| Gemeinsame Logik | `src/business/shared/` | `shuffle`, Teamreihenfolge. Hier ergänzen, was mindestens zwei Spiele brauchen. |
| Inhalte | `src/data/` | Karten, Fragen oder Begriffe. Offline vollständig spielbar. |
| Adapter | `src/data/`, `src/infrastructure/` | Speicherung (IndexedDB) und externe Dienste. Der Business-Code kennt nur Schnittstellen. |
| Ansichten | `src/presentation/<spiel>/` | Setup-Formular, Rundenübersicht, Spielansicht, Ergebnis. |
| Spielmodul | `src/presentation/<spiel>/<spiel>Module.tsx` | Fabrik `create<Spiel>Module(...)`, die ein `GameModule` zurückgibt. |
| Texte | `src/i18n/resources/<sprache>/<spiel>.ts` | Alle sichtbaren Texte in Deutsch und Englisch. |
| Katalogeintrag | `src/app/gameCatalog.ts` | Kennung, Route, Übersetzungsschlüssel, Status, Akzentfarbe. |

## Was GameHub bereitstellt

Bausteine in `src/presentation/game-kit/`, die ein neues Spiel einfach benutzt:

- `SetupScreen` und `SetupTabs` (Reiter wie im Browser, `ADR-026`; `SetupSection` nur noch für die Datenansicht): der Rahmen jedes Setups (Meldungen oben, Leiste oben rechts, Reiter, Startleiste unten). `TeamsSetup` (Teamanzahl, Namen, Reihenfolge, optional Spieler mit Verteilung, gesteuert über `value` und `onChange`) und `PlayersSetup` (nur Spielerliste für Spiele ohne Teams). Die Teams für das Spiel entstehen mit `buildTeams` aus `src/business/shared/teamSetup.ts`; die Grenzen setzt das Spiel über `TeamRules`. Texte dafür liegen in `kit.ts`, Stile in `styles/kit-setup.css`.
- `StartBar` und `TurnStrip`: untere Aktionsleiste mit dem Namen des nächsten Teams; mit `sideAction` steht ein kleiner Symbolknopf links neben dem Hauptknopf (bei der Aufstellung der Knopf zu den Spieleinstellungen).
- `LineupScreen` und `LineupSetup`: die Aufstellung, die **erste Ansicht** eines Spiels (Reiter „Spieler“ und „Teams“ je nach `LineupConfig`; jede Box mit „Letzte … laden“ und „… leeren“ nebeneinander; in „Teams“ die Reihenfolge mit Platznummer außerhalb der verschiebbaren Box, einem Pfeil für die Standardreihenfolge und einem Würfel für die zufällige; ein Tipp auf einen Spieler öffnet die Teamwahl mit dem roten „Spieler entfernen“ zuunterst).
- `ChoiceGroup`: Auswahlgruppe aus gleich breiten Buttons (mit Symbol, Farbton, Zusatztext). **Regel:** Eine Auswahl von **genau einem** Wert ist eine zusammenhängende Knopfleiste; bei **mehreren** Werten gleichzeitig (`multiple`) stehen getrennte Knöpfe nebeneinander. `InfoButton`: Infoknopf mit eigenem Fenster oder, mit `InfoAction`, nur als Auslöser für ein gemeinsames Fenster.
- `RulesSection` und `useGameRulesButton`: **ein** Regelfenster für das ganze Spiel (`ADR-026`, Hilfekonzept in `docs/GAMEHUB_UI_RULES.md` 2.5a): kurze Teile mit Überschrift (Ziel, Karte oder Material, Ein Zug, Spielmodi, Einstellungen), möglichst mit Bild. Das Spiel baut sie in einem `Dialog` aus `RulesSection`en und meldet mit `useGameRulesButton(aktiv, öffnen)` den Knopf „Spielregeln" der Kopfleiste an. **Die i-Knöpfe der Einstellungen erklären nur das Einzelne**, in ein bis zwei kurzen Sätzen.
- `useScreenScroll`: Jede neue Ansicht beginnt oben, das Hauptmenü steht beim Zurückkommen wieder an der alten Stelle. Das Spiel meldet seine aktuelle Ansicht nach außen (`onScreenChange`), der Aufrufer ruft den Hook einmal auf.
- `Scoreboard`: sortierte Punkteliste, jede Zeile mit Balken (so lang wie die Punkte im Vergleich zum Führenden), Rang (der Führende bekommt eine Krone), großer Punktzahl und, wenn das Team gerade gespielt hat, dem Zuwachs („+3“, Eigenschaft `gains`). Bei gleichen Punkten bleibt die Spielreihenfolge.
- `ResultList`: dieselben Zeilen für Ergebnisse, die keine Punkte sind (zum Beispiel Zeiten): Ergebnistext statt Zahl, das beste Ergebnis steht oben, eine Zeile ohne Wert zeigt „steht noch aus“.
- `ScoreScreen`: die Ansichten zwischen den Zügen und am Spielende. Eine Seite ohne Seitenscroll: oben ein Fortschrittsbalken (`progress`) und eine kleine Überschrift (`eyebrow`), dann der Gewinnerblock (`winner`), dann die Wertung. Ein zweiter Reiter (`extraTab`, mit `extraTabFirst` zuerst geöffnet) zeigt zum Beispiel die Karten des letzten Zuges oder das Stechen. `celebrate` lässt `Confetti` regnen (nur beim Endstand mit Sieger).
- `Confetti`: kurzer Konfettiregen über der ganzen Ansicht (etwa sieben Sekunden), nur Zierde: nimmt keine Eingaben, ist für Screenreader unsichtbar und entfällt bei „weniger Bewegung“.
- `TabPane`: der Inhalt eines Reiters mit festen Bedienelementen: `header` und `footer` bleiben stehen, nur der Inhalt dazwischen scrollt. Ein Bedienelement scrollt nie weg.
- `ManageScreen`: der Rahmen des Editors für eigene Inhalte (Karten, Fragen, Wörter) mit Titel und den Teilen als Reiter; jeder Reiter kann seine Bedienelemente mit `TabPane` festhalten.
- `HeadingLegend`: die Überschriftzeile einer Gruppe. Mit `info` steht der Info-Knopf **direkt neben dem Text der Überschrift** und ein Tipp auf den Text öffnet dasselbe Infofenster (Regel für jede Überschrift mit Info; `ChoiceGroup` mit `info` nutzt sie schon). Ohne `info` ist es eine einfache Überschrift; Knöpfe am rechten Ende haben die flache Form `kit-heading-button` (flach, breit, nicht quadratisch, Tippfläche trotzdem 44 Pixel).
- `ActionRow`: eine Reihe gleich breiter Knöpfe in fester Reihenfolge (bestätigen grün, entfernen rot, abbrechen rot).
- `TimerHud`, `useCountdown`, `useStopwatch`: Rundenkopf mit Zeitbalken, Farbwechsel am Ende, Zeitmessung mit Pausen.
- **Systemzurück-Taste:** Die App fängt sie für jedes Spiel selbst ab (`useSystemBack` in `AppShell`), ein Spiel muss nichts tun, solange es `useGameExit` (laufendes Spiel) und `useGameBack` (Unteransicht) benutzt: In einer Unteransicht geht Zurück einen Schritt zurück, in einem laufenden Spiel fragt die App „Spiel beenden?“ und pausiert eine Runde, die eine Pause-Steuerung gemeldet hat. Auf der ersten Ansicht (Aufstellung) verlässt Zurück das Spiel.
- `useGameExit` (`src/presentation/GameChrome.ts`): meldet der Kopfzeile, dass ein Spiel läuft, und optional eine Pause-Steuerung. Die Kopfzeile zeigt dann das X „Spiel beenden“ oder Pause.
- Aus `src/presentation/components/`: `Button` (Varianten `success`, `danger`), `ConfirmButton`, `Dialog` (mittig, auch auf dem Handy) und `Toast` mit `useNotice` (Meldungen als Benachrichtigung unten, die von allein verschwindet; es gibt keine Meldungsboxen in der Seite mehr).
- Die Kopfzeile, Einstellungen, Sprachwahl, Seitensprache und das Layout für das Handy.

## Schritt für Schritt

1. **Regeln zuerst.** Zustandsmaschine mit reiner Funktion `transition(state, event)`, die bei ungültigen Ereignissen exakt denselben Zustand zurückgibt. Zufall und Zeit kommen von außen.
2. **Zufallsprüfung ergänzen.** Nach dem Muster von `stateMachine.invariants.test.ts`: viele zufällige Partien, nach jedem Schritt Invarianten prüfen.
3. **Texte anlegen.** `resources/de/<spiel>.ts` und `resources/en/<spiel>.ts`, in `common.ts` beider Sprachen mit `...<spiel>Texts` einbinden. Die Prüfungen in `translationQuality.test.ts` und `translationParity.test.ts` laufen automatisch.
4. **Aufstellung konfigurieren (`ADR-025`).** Das Spiel beschreibt in einer `LineupConfig` (Beispiel `src/business/games/taboo/lineup.ts`), ob es eine Spielerliste braucht (`players`: `off`, `optional`, `required` mit `minPlayers` und `maxPlayers`) ob es Teams hat (`teams`: `"off"` oder `TeamRules`) und was mit Spielern ohne Team geschieht (`unassignedPlayers`: `ignore`, `assign` als Standard oder `block`). Die Aufstellungsansicht rendert dann `<LineupSetup config={…} />` , prüft vor dem Start mit `validateLineup(config, value)` und bekommt die fertigen Teams mit `resolveLineup(config, value)`. Spiele ohne Teams setzen `teams: "off"` und lesen die Spieler aus `playersText`.
5. **Setup mit den gemeinsamen Bausteinen bauen.** `SetupScreen` mit einem Abschnitt „Teams und Spieler“ (`TeamsSetup` oder `PlayersSetup`) und einem Abschnitt „Spieleinstellungen“ (eigene `ChoiceGroup`s mit `InfoButton`); den Zustand der Teams hält das Spiel als `TeamSetupValue`, die Teams für die Zustandsmaschine liefert `buildTeams`. Tabu (`TabooSetupForm`) ist das Vorbild. `SetupScreen` ist das Hauptmenü; den Knopf für die Spielregeln setzt du ganz oben in das Feld „Spieleinstellungen“, den Knopf zum Editor (nur bei eigenen Inhalten) ganz oben in das Feld der Inhalte. Hat dein Spiel mehrere Modi, bekommt jede Option der Gruppe „Spielmodus“ einen eigenen Infoknopf mit den Regeln (`ChoiceOption.info`). Zwischen- und Endstand baust du mit `ScoreScreen`, den Editor mit `ManageScreen`, Knopfreihen mit `ActionRow`. Teams und Spieler gehören nicht ins Hauptmenü, sondern in die Ansicht Aufstellung nach „Starten“: `LineupScreen` mit `TeamsSetup` oder `PlayersSetup` (`ADR-023`). Alle Regeln stehen in `docs/GAMEHUB_UI_RULES.md`. Die gespeicherte Spielerliste (Knopf „Spieler“, Auswahl „Aus Spielerliste wählen“) kommt automatisch mit `SetupScreen`, `TeamsSetup` und `PlayersSetup`; das Spiel muss dafür nichts tun. Die letzte Gruppe (Teams und Spieler) merkt sich die App für alle Spiele: `TeamsSetup` und `PlayersSetup` bieten sie automatisch an, das Spiel ruft beim Start `useTeamSetupMemory()?.write(teamSetup)` auf (nur wenn `hasTeamSetupContent(teamSetup)`).
6. **Einstieg und Spieleinstellungen (Entscheidung vom 2026-11-17).** Ein Spiel öffnet **auf seiner Aufstellung** (`LineupScreen`), nie auf einem Hauptmenü. Die Spieleinstellungen sind ein **eigener Bildschirm** (`SetupScreen` mit Reitern, unten „Fertig“), den ein Symbolknopf (`sliders`, Name „Spieleinstellungen“) in der `StartBar` der Aufstellung öffnet (`sideAction`). Das Formular der Einstellungen bleibt eingehängt (nur verborgen), das Spiel liest es beim Start über `formRef`; fehlt etwas, öffnet es die Einstellungen an der richtigen Stelle mit der Meldung. In den Einstellungen zeigt die Kopfleiste den Zurückpfeil (`useGameBack`), auf der Aufstellung „Spielregeln“ (`useGameRulesButton`). Mehrere `useGameBack` können gleichzeitig aktiv sein (Einstellungen, darüber eine Unteransicht): die zuletzt angemeldete zählt, nach ihrem Ende wieder die darunter. Vorbild: `TabooSetup`.
7. **Ansichten bauen.** Das Hauptfenster ist eine React-Komponente. Sie nutzt `useGameExit(aktiv, beenden, pause?)` und die Bausteine aus `game-kit`. Kein Text darf im Code stehen.
8. **Modul anlegen.**

   ```tsx
   export function createMeinSpielModule(options): GameModule {
     return { id: "mein-spiel", Screen: ({ cardLanguage }) => <MeinSpiel ... /> };
   }
   ```

9. **Katalogeintrag auf „preview“ oder „available“ setzen.** Der Eintrag existiert bereits als „planned“ für geplante Spiele.
10. **Anschließen.** In `src/main.tsx` das Modul in `modules={[...]}` der `AppRoot` aufnehmen. Die App kennt das Spiel nur über diesen Vertrag.
11. **Tests.** Unit-Tests für Regeln, Komponententests für die Ansichten, ein Durchlauf in Deutsch und Englisch (`languageFlows.test.tsx` als Vorbild) und die mobile Layout-Prüfung (`e2e/mobile-layout.spec.ts`) für die neuen Ansichten. Hilfsfunktionen: `src/presentation/testing/scoreRows.ts` (`rowText`, `resultText`: Text einer Zeile von `Scoreboard` und `ResultList`) und `src/presentation/testing/gameSettings.ts` (`openGameSettings`, `closeGameSettings`: Einstellungen von der Aufstellung öffnen und mit „Fertig“ schließen). Die Layoutprüfung kennt die Regeln „eine Seite, kein Seitenscroll“, „Reiter und Startleiste überlappen nicht“ und „Tippflächen mindestens 44 Pixel“.
12. **Dokumentation.** `docs/GAMEHUB_STATUS.json`, Changelog und Plan pflegen und `pnpm docs:sync` ausführen.

## Regeln für die Oberfläche auf dem Handy

- **Jede Ansicht ist eine Seite (One-Pager):** kein Scrollen der Seite; Reiterinhalte und Listen scrollen **in** ihrem Kasten (Klasse `kit-onepage`), die Bedienelemente scrollen nie weg (`TabPane`). Mit Rastpunkten (`scroll-snap`) bei Listen aus Blöcken, dünne Scrollleiste nahe am Rahmen. Die Regeln stehen in `docs/GAMEHUB_UI_RULES.md`.
- Jeder Knopf hat einen sichtbaren Rahmen; Knöpfe neben einer Überschrift sind flach und breit (`kit-heading-button`).

- Hauptaktion unten in der `StartBar`, mindestens 44 Pixel hohe Touch-Ziele.
- Zerstörerische Aktionen über `ConfirmButton` (erst rot, zweites Tippen bestätigt).
- Grün für bestätigen und starten, Rot für ablehnen oder beenden, Blau als einzige Akzentfarbe.
- Mitten in einem Spiel führt das X nur ins Hauptfenster des Spiels, nie direkt in den GameHub.

## Nachweis

`src/presentation/App.test.tsx` registriert ein Beispielmodul mit nur zwei Zeilen Inhalt und zeigt, dass die App ein Spiel allein über den Vertrag rendert.

## Noch nicht umgesetzt

- **Aufbau eines Spielcontainers (Vorbild `TabooSetup`, `Al-10-02`):** Ein Spiel mit mehreren Modi hält seinen Container klein und verteilt die Aufgaben: die Einstellungsansicht in einen Hook (`useTabooSettingsView`), den Start aus der Aufstellung in einen Hook (`useTabooStart`) mit **reinen Planungsfunktionen ohne React** (`tabooStartPlan.ts`), je Modus einen Hook für den Spielzustand (`useTabooClassicGame`) und eine Komponente für seine Bildschirme (`TabooClassicScreens`), die Aufstellung als eigene Komponente (`TabooLineup`). Der Container verbindet sie nur und hält, was sie teilen (Aufstellung, Meldungen). Ein neuer Modus bekommt so seinen eigenen Hook und seine eigenen Bildschirme.
- Ergebnisse nachträglich korrigieren (`TabooReviewList`, `TabooAttemptReviews`) und die Kartenverwaltung sind Tabu-spezifisch, bis ein zweites Spiel sie braucht. Die Regeln dafür (`reviseOutcome` in `business/games/taboo`): falsch Markiertes bleibt falsch, korrigiert werden kann nur der zuletzt gespielte Zug.
- Der Spieler-Reiter der Aufstellung bleibt im Kit für Spiele mit Namen; **Tabu verzichtet darauf** (lokal sind Spieler nicht wichtig, online reicht der Teams-Reiter mit den Namen aus der Lobby, `Ta-10-09`).

Den Zustand der Schichten, entfernten toten Code und offene Punkte beschreibt `docs/GAMEHUB_QUALITY_CHECK.md`.

Stile je Spiel: `src/presentation/styles/games/<spiel>.css`, in `main.tsx` nach `global.css` importiert.
