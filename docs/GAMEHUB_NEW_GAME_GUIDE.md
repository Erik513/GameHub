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
- `StartBar` und `TurnStrip`: untere Aktionsleiste mit dem Namen des nächsten Teams.
- `ChoiceGroup`: Auswahlgruppe aus gleich breiten Buttons (mit Symbol, Farbton, Zusatztext). `InfoButton`: Infoknopf mit eigenem Fenster oder, mit `InfoAction`, nur als Auslöser für ein gemeinsames Fenster.
- `RulesDialog` und `RulesButton`: **ein** Regelfenster für das ganze Spiel: oben die Regeln für alle Spielmodi, darunter die Modi als Reiter (gleiche Größe für alle, Pfeiltasten). Das Spiel liefert nur Texte und Inhalte der Reiter (`TabooRulesDialog` ist das Vorbild); der Infoknopf eines Spielmodus öffnet dasselbe Fenster und wählt den Modus.
- `useScreenScroll`: Jede neue Ansicht beginnt oben, das Hauptmenü steht beim Zurückkommen wieder an der alten Stelle. Das Spiel meldet seine aktuelle Ansicht nach außen (`onScreenChange`), der Aufrufer ruft den Hook einmal auf.
- `Scoreboard`: sortierte Punkteliste mit Gewinnermarkierung.
- `TimerHud`, `useCountdown`, `useStopwatch`: Rundenkopf mit Zeitbalken, Farbwechsel am Ende, Zeitmessung mit Pausen.
- `useGameExit` (`src/presentation/GameChrome.ts`): meldet der Kopfzeile, dass ein Spiel läuft, und optional eine Pause-Steuerung. Die Kopfzeile zeigt dann das X „Spiel beenden“ oder Pause.
- Aus `src/presentation/components/`: `Button` (Varianten `success`, `danger`), `ConfirmButton`, `Dialog` (mittig, auch auf dem Handy) und `Toast` mit `useNotice` (Meldungen als Benachrichtigung unten, die von allein verschwindet; es gibt keine Meldungsboxen in der Seite mehr).
- Die Kopfzeile, Einstellungen, Sprachwahl, Seitensprache und das Layout für das Handy.

## Schritt für Schritt

1. **Regeln zuerst.** Zustandsmaschine mit reiner Funktion `transition(state, event)`, die bei ungültigen Ereignissen exakt denselben Zustand zurückgibt. Zufall und Zeit kommen von außen.
2. **Zufallsprüfung ergänzen.** Nach dem Muster von `stateMachine.invariants.test.ts`: viele zufällige Partien, nach jedem Schritt Invarianten prüfen.
3. **Texte anlegen.** `resources/de/<spiel>.ts` und `resources/en/<spiel>.ts`, in `common.ts` beider Sprachen mit `...<spiel>Texts` einbinden. Die Prüfungen in `translationQuality.test.ts` und `translationParity.test.ts` laufen automatisch.
4. **Aufstellung konfigurieren (`ADR-025`).** Das Spiel beschreibt in einer `LineupConfig` (Beispiel `src/business/games/taboo/lineup.ts`), ob es eine Spielerliste braucht (`players`: `off`, `optional`, `required` mit `minPlayers` und `maxPlayers`) ob es Teams hat (`teams`: `"off"` oder `TeamRules`) und was mit Spielern ohne Team geschieht (`unassignedPlayers`: `ignore`, `assign` als Standard oder `block`). Die Aufstellungsansicht rendert dann `<LineupSetup config={…} />` , prüft vor dem Start mit `validateLineup(config, value)` und bekommt die fertigen Teams mit `resolveLineup(config, value)`. Spiele ohne Teams setzen `teams: "off"` und lesen die Spieler aus `playersText`.
5. **Setup mit den gemeinsamen Bausteinen bauen.** `SetupScreen` mit einem Abschnitt „Teams und Spieler“ (`TeamsSetup` oder `PlayersSetup`) und einem Abschnitt „Spieleinstellungen“ (eigene `ChoiceGroup`s mit `InfoButton`); den Zustand der Teams hält das Spiel als `TeamSetupValue`, die Teams für die Zustandsmaschine liefert `buildTeams`. Tabu (`TabooSetupForm`) ist das Vorbild. `SetupScreen` ist das Hauptmenü; den Knopf für die Spielregeln setzt du ganz oben in das Feld „Spieleinstellungen“, den Knopf zum Editor (nur bei eigenen Inhalten) ganz oben in das Feld der Inhalte. Hat dein Spiel mehrere Modi, bekommt jede Option der Gruppe „Spielmodus“ einen eigenen Infoknopf mit den Regeln (`ChoiceOption.info`). Zwischen- und Endstand baust du mit `ScoreScreen`, den Editor mit `ManageScreen`, Knopfreihen mit `ActionRow`. Teams und Spieler gehören nicht ins Hauptmenü, sondern in die Ansicht Aufstellung nach „Starten“: `LineupScreen` mit `TeamsSetup` oder `PlayersSetup` (`ADR-023`). Alle Regeln stehen in `docs/GAMEHUB_UI_RULES.md`. Die gespeicherte Spielerliste (Knopf „Spieler“, Auswahl „Aus Spielerliste wählen“) kommt automatisch mit `SetupScreen`, `TeamsSetup` und `PlayersSetup`; das Spiel muss dafür nichts tun. Die letzte Gruppe (Teams und Spieler) merkt sich die App für alle Spiele: `TeamsSetup` und `PlayersSetup` bieten sie automatisch an, das Spiel ruft beim Start `useTeamSetupMemory()?.write(teamSetup)` auf (nur wenn `hasTeamSetupContent(teamSetup)`).
5. **Ansichten bauen.** Das Hauptfenster ist eine React-Komponente. Sie nutzt `useGameExit(aktiv, beenden, pause?)` und die Bausteine aus `game-kit`. Kein Text darf im Code stehen.
6. **Modul anlegen.**

   ```tsx
   export function createMeinSpielModule(options): GameModule {
     return { id: "mein-spiel", Screen: ({ cardLanguage }) => <MeinSpiel ... /> };
   }
   ```

7. **Katalogeintrag auf „preview“ oder „available“ setzen.** Der Eintrag existiert bereits als „planned“ für geplante Spiele.
8. **Anschließen.** In `src/main.tsx` das Modul in `modules={[...]}` der `AppRoot` aufnehmen. Die App kennt das Spiel nur über diesen Vertrag.
9. **Tests.** Unit-Tests für Regeln, Komponententests für die Ansichten, ein Durchlauf in Deutsch und Englisch (`languageFlows.test.tsx` als Vorbild) und die mobile Layout-Prüfung (`e2e/mobile-layout.spec.ts`) für die neuen Ansichten.
10. **Dokumentation.** `docs/GAMEHUB_STATUS.json`, Changelog und Plan pflegen und `pnpm docs:sync` ausführen.

## Regeln für die Oberfläche auf dem Handy

- Hauptaktion unten in der `StartBar`, mindestens 44 Pixel hohe Touch-Ziele.
- Zerstörerische Aktionen über `ConfirmButton` (erst rot, zweites Tippen bestätigt).
- Grün für bestätigen und starten, Rot für ablehnen oder beenden, Blau als einzige Akzentfarbe.
- Mitten in einem Spiel führt das X nur ins Hauptfenster des Spiels, nie direkt in den GameHub.

## Nachweis

`src/presentation/App.test.tsx` registriert ein Beispielmodul mit nur zwei Zeilen Inhalt und zeigt, dass die App ein Spiel allein über den Vertrag rendert.

## Noch nicht umgesetzt

- Pause, Neustart und die Aufbereitung der Karten beim Start liegen noch im Container `TabooSetup.tsx` (`Al-10-02`); Hooks dafür folgen, wenn das zweite Spiel sie braucht. Schon ausgelagert: das Stechen (`useTabooTiebreak`), das Nachladen der KI-Karten (`useTabooRefill`) und die Rechenregeln für Kartenbedarf und Erzeugung (`business/games/taboo/cardPlan.ts`).
- Ergebnisse nachträglich korrigieren (`TabooReviewList`, `TabooAttemptReviews`) und die Kartenverwaltung sind Tabu-spezifisch, bis ein zweites Spiel sie braucht.

Den Zustand der Schichten, entfernten toten Code und offene Punkte beschreibt `docs/GAMEHUB_QUALITY_CHECK.md`.

Stile je Spiel: `src/presentation/styles/games/<spiel>.css`, in `main.tsx` nach `global.css` importiert.
