# Spielbausteine und Struktur für neue Spiele (Vorschlag)

**Status:** Freigegeben (Option B) und umgesetzt, bis auf die in `Ta-05-06` geplanten Punkte (Hooks für die Tabu-Zustandslogik, CSS je Spiel). Der Leitfaden steht in `docs/GAMEHUB_NEW_GAME_GUIDE.md`.

Ziel: Ein neues Spiel soll möglichst nur seine **Regeln** (Business), seine **Inhalte** (Texte, Karten, Fragen) und seinen **spielspezifischen Ablauf** mitbringen. Kopfzeile, Navigation, Auswahlgruppen, Aktionsleiste, Zeitanzeige, Pause, Bestätigungen, Punkteliste und Layout auf dem Handy kommen aus gemeinsamen Bausteinen.

## 1. Ist-Zustand

| Beobachtung | Zahl |
|---|---|
| `TabooSetup.tsx` bündelt Formular, Deckaufbau, KI-Nachladen, Rundenablauf, Pause, Neustart, Stechen und Ergebnis | 815 Zeilen, 17 Importe, 28 Hook-Aufrufe |
| `global.css` mischt allgemeine und Tabu-Stile | 1619 Zeilen, rund 130 Tabu-Bezüge |
| `App.tsx` kennt Tabu-Besonderheiten (`tabooCards`, `tabooRepository`, `tabooGenerators`, Abbildung `gameScreens`) | wächst mit jedem Spiel |
| Alle Texte liegen in einem Namensraum `common` | Tabu und App-Rahmen vermischt |
| Allgemeine Logik liegt im Tabu-Ordner (`shuffle`, `teamOrder`) | genreunabhängig, aber nicht auffindbar |

**Schon gut wiederverwendbar:** `Button`, `Dialog`, `ConfirmButton`, `Toast`, `useGameExit` (Spiel beenden und Pause in der Kopfzeile), `formatSeconds`, die angeheftete Aktionsleiste (CSS), die Punkteliste `TabooScoreboard` und die Auswahlgruppe `SetupChoices` (liegen aber noch in Tabu-Dateien).

**Zu eng an Tabu gebunden:** Der Ablauf Setup → Rundenübersicht → Runde → Auswertung → Ergebnis ist in `TabooSetup.tsx` verdrahtet. Ein zweites rundenbasiertes Teamspiel müsste ihn kopieren.

## 2. Zielbild

```
src/
  business/
    shared/                 genreunabhängig: shuffle, Teamreihenfolge, Rangliste, Zeitrechnung (Stoppuhr/Countdown mit Pausen)
    games/<spiel>/          Regeln, Zustandsmaschine, Modelle (keine UI, keine Browser-APIs)
  presentation/
    game-kit/               gemeinsame Spielbausteine (siehe unten)
    games/<spiel>/          spielspezifische Ansichten und Hooks
  data/, infrastructure/    wie bisher, je Spiel eigene Adapter
  i18n/resources/<sprache>/ common.ts (Rahmen) + games/<spiel>.ts (eigener Namensraum je Spiel)
  presentation/styles/      tokens.css, base.css, kit.css, games/<spiel>.css
```

### Bausteine in `game-kit`

| Baustein | Aufgabe | Herkunft |
|---|---|---|
| `GameFrame` | Hauptfenster des Spiels, meldet „Spiel läuft“ an die Kopfzeile (`useGameExit`) | `GameChrome` |
| `StartBar` | Untere angeheftete Aktionsleiste, optional mit Teamstreifen | CSS `.kit-start-bar` |
| `ChoiceGroup` | Auswahlgruppe aus gleich breiten Buttons, mit Symbol, Farbton und Zusatztext | `SetupChoices` |
| `Scoreboard` | Punkte- oder Zeitliste, sortiert, mit Gewinnermarkierung | `TabooScoreboard` |
| `TimerHud` | Block mit Team, Runde, Punkten, Zeit und Balken, Farbwechsel am Ende | Teil von `TabooRound` |
| `PausePanel` | Pausenansicht mit „Fortsetzen“ und weiteren Aktionen, Karte bleibt verdeckt | Teil von `TabooRound` |
| `OutcomeButtons` | Daumenfreundliche Anordnung (groß rechts, zwei kleine links) | CSS und `TabooRound` |
| `ReviewList` | Liste gespielter Elemente, tippbar, neutral oder farbig | `TabooRoundReview` |
| `ConfirmButton` | Zweifach-Bestätigung | bereits allgemein |
| `InfoButton` | Info-Symbol mit Erklärfenster (kommt mit `Ta-06-01`) | neu |
| Hooks | `usePause`, `useCountdown`, `useStopwatch` | Teil von `TabooSetup` |

### Spielmodul-Vertrag (Erweiterung von ADR-013)

Heute beschreibt der Katalog nur Kennung, Route, Name, Status und Farbe. Vorschlag:

```ts
interface GameModule {
  descriptor: GameModuleDescriptor;                 // wie bisher
  Screen: ComponentType<GameScreenProps>;           // Hauptfenster des Spiels
  resources: Record<SupportedLanguage, Resource>;   // eigene Texte (Namensraum)
}
```

`GameScreenProps` enthält die Kartensprache und die Anbindung an die Kopfzeile. Spielspezifische Dienste (Kartenspeicher, KI-Generator) werden in `main.tsx` in das Modul eingebaut. `App.tsx` kennt dann keine Spiele mehr und reicht nichts Tabu-Spezifisches durch.

## 3. Optionen

| Option | Inhalt | Aufwand | Empfehlung |
|---|---|---|---|
| **A – Nur dokumentieren** | Ordnerkonvention und Leitfaden „Neues Spiel anlegen“, kein Umbau | klein | Nur, wenn bald kein zweites Spiel kommt |
| **B – Moderater Umbau** | Bausteine nach `game-kit` und `business/shared` verschieben, `TabooSetup` in Hooks und Ansichten zerlegen, Modul-Vertrag mit eigenem Namensraum und CSS je Spiel, `App` ohne Tabu-Wissen | mittel, in sechs kleinen Schritten mit grünen Tests | **Empfohlen** |
| **C – Allgemeine Spiel-Engine** | Generische Zustandsmaschine für rundenbasierte Teamspiele | groß | Nicht empfohlen: zu früh, ohne zweites Spiel als Beleg |

Begründung für B: Die Spielmodi aus `Ta-06-07` (Klassisch, Auf Zeit, Gegen die Zeit) brauchen dieselben Bausteine (Zeitanzeige, Pause, Aktionsleiste, Punkteliste). Sie wären der erste Praxistest. Eine Verallgemeinerung wie in C wird erst gebaut, wenn zwei Spiele sie wirklich brauchen („Regel der zwei“).

## 4. Schritte für Option B

Jeder Schritt hält das Verhalten gleich und ist durch die bestehenden Tests abgesichert (235 Unit-Tests, 25 Browserprüfungen, mobile Layout-Prüfung).

1. `shuffle` und `teamOrder` nach `business/shared` verschieben.
2. `game-kit` anlegen: `ChoiceGroup`, `Scoreboard`, `ConfirmButton`, `StartBar` verschieben und die zugehörigen CSS-Regeln in `kit.css` auslagern.
3. Zeit-Hooks (`usePause`, `useCountdown`, `useStopwatch`) und `TimerHud` herauslösen.
4. `TabooSetup` in Hooks (`useTabooSetupForm`, `useTabooGame`) und Ansichten (Setup, Übersicht, Runde, Ergebnis, Stechen) zerlegen. Nicht erreichbaren Zustand `deckEmpty` entfernen oder bewusst behalten.
5. Spielmodul-Vertrag einführen: eigener Namensraum für Tabu-Texte, `games/taboo.css`, `App` rendert `module.Screen`.
6. Leitfaden `docs/GAMEHUB_NEW_GAME_GUIDE.md` („Neues Spiel anlegen“) schreiben und mit einem kleinen Beispielmodul im Test belegen.

## 5. Risiken

- Verschieben ändert viele Importe, daher in kleinen Schritten mit grünen Tests.
- Ein Namensraum je Spiel erfordert Anpassungen der Übersetzungsprüfungen (Parität, Platzhalter, identische Texte, ungenutzte Schlüssel).
- CSS-Aufteilung kann Reihenfolgeeffekte haben; die mobile Layout-Prüfung fängt sichtbare Folgen ab.

## 6. Entscheidungen, die der Auftraggeber treffen muss

1. Option A, B oder C?
2. Vertrag mit `Screen`-Komponente und eigenem Namensraum je Spiel einführen (bei B)?
3. Ordnername `game-kit` und Spielordner unter `presentation/games/<spiel>` in Ordnung?
4. Soll `Ta-06-07` (Spielmodi) erst nach dem Umbau beginnen?
