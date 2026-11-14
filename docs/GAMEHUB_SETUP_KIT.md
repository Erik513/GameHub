# Entwurf: Gemeinsame Ansicht für Teams, Spieler und Spieleinstellungen

> **Stand 2026-11-14 (`ADR-025`):** Die Aufstellung ist konfigurierbar: `LineupSetup` zeigt je nach `LineupConfig` des Spiels die aufklappbaren Boxen „Spieler“ (`PlayersSetup`) und „Teams“ (`TeamsSetup` mit `withPlayers`). `TeamsSetup` hat die Prop `players` nicht mehr; das Hinzufügen von Spielern gehört zu `PlayersSetup`. Startregeln liefert `validateLineup`. Jede Box lädt ihren Teil der gemerkten Gruppe; die Box „Teams“ hat zusätzlich „Teams leeren“ (nebeneinander mit „Letzte Teams laden“, beide immer sichtbar, bei Bedarf gesperrt). `PlayersSetup` ist die einfache Spielerliste (Hinzufügen, Entfernen), `TeamsSetup` enthält Anzahl, Auslosen, Teamkarten mit Namensknöpfen (Tipp öffnet die Teamwahl) und Reihenfolge.
>
> **Stand 2026-11-13 (`ADR-023`):** Teams und Spieler stehen nicht mehr im Hauptmenü, sondern in der Ansicht **Aufstellung** nach „Starten“ (`LineupScreen`). Dieses Dokument beschreibt die ursprüngliche Aufteilung; die Bausteine `TeamsSetup` und `PlayersSetup` sind unverändert, nur ihr Ort ist ein anderer.

Dieses Dokument gehört zu Phase Al-09 (`Al-09-01`). Die Entscheidungen in Abschnitt 6 sind getroffen (siehe `ADR-020`); gebaut wird in `Al-09-02`. Es baut auf `ADR-017` (Spielbausteine und Spielmodul-Vertrag) und `docs/GAMEHUB_NEW_GAME_GUIDE.md` auf.

## 1. Ziel

Teams, Spieler und Spieleinstellungen kommen in jedem Spiel vor. Sie sollen einmal gebaut werden und für alle Spiele gleich aussehen und sich gleich verhalten. Ein neues Spiel soll nur noch angeben, **welche** Einstellungen es hat, nicht **wie** Teams, Namen, Reihenfolge und Spieler dargestellt und gelesen werden.

## 2. Ist-Zustand (Tabu)

| Teil | Ort | Bemerkung |
|---|---|---|
| Abschnitte „Teams und Spieler“ und „Spieleinstellungen“, Werkzeugleiste, Startleiste | `TabooSetupForm.tsx` | Aufbau gehört zu keinem Spiel, steckt aber im Tabu-Formular. |
| Teamanzahl (2 bis 6), Teamnamen, Reihenfolge (zufällig oder wie eingegeben) | `TabooSetupForm.tsx`, gelesen in `TabooSetup.tsx` (`submit`) per `FormData` | Die Regeln „Name leer gibt Team N“, „Reihenfolge zufällig mischen“ stehen im Container. |
| Spielerliste und Verteilung auf Teams | `TabooPlayers.tsx` | Eigener Zustand, **fließt nicht ins Spiel**: die Verteilung ist nur eine Übersicht. |
| Reine Logik | `business/shared/players.ts` (`parsePlayers`, `splitIntoTeams`), `teamOrder.ts` (`shuffleTeams`) | Schon spielunabhängig und getestet. |
| Texte | `tabooSetup.teams*`, `tabooSetup.team*`, `tabooPlayers.*` in `taboo.ts` je Sprache | Gehören zum Tabu-Namensraum. |
| Stile | `taboo.css` (`taboo-section`, `taboo-team-names`, `taboo-players`, `taboo-toolbar`) | Ebenfalls Tabu. |
| Spieleinstellungen | `ChoiceGroup`, `InfoButton` im `game-kit` | Bausteine sind schon gemeinsam, die Zusammenstellung nicht. |

Das Spiel bekommt heute nur `teams: { id, name }[]` (`GameConfiguration` in `business/games/taboo/model.ts`).

## 3. Was Spiele brauchen (angenommen, noch nicht abgestimmt)

- **Mit Teams** (Tabu, Kartenspiel in Teams): Teamanzahl in Grenzen, Namen, Reihenfolge, optional Spieler je Team.
- **Nur Spieler** (Wortbombe): eine Liste von Namen ohne Teams.
- **Einstellungen:** je Spiel eigene Gruppen (Runden, Dauer, Kartenquelle, Schwierigkeit …) mit Info-Knöpfen.
- **Regeln und weitere Knöpfe** oben rechts (bei Tabu „Spielregeln“ und „Karten“).
- **Start** unten, mit Fehlermeldungen oben.

## 4. Entwurf

### 4.1 Reine Logik in `src/business/shared/` (ohne React)

- Typen `TeamSetup { id, name, players: readonly string[] }` und `TeamSetupInput { count, names, orderMode, players, assignment }`.
- `buildTeams(input, { defaultName, random })`: gibt die Teams **in Spielreihenfolge** zurück (leere Namen werden zu „Team N“, Reihenfolge zufällig oder wie eingegeben, Spieler den Teams zugeordnet). Ersetzt den Code in `TabooSetup.submit`.
- `TeamRules { minTeams, maxTeams, defaultTeams }` und `validateTeamSetup` (Grenzen, doppelte Namen, bei Bedarf Mindestzahl Spieler je Team).
- `parsePlayers` und `splitIntoTeams` bleiben, wo sie sind.
- Alles mit Tests, Zufall wird eingespeist, wie bei `shuffle`.

### 4.2 Oberfläche in `src/presentation/game-kit/`

- **`SetupScreen`** (Hülle): Fehlermeldungen oben, Werkzeugleiste oben rechts (`toolbar`), Abschnitte als Kinder, Startleiste unten (`StartBar`). Das Spiel gibt `formId`, `onSubmit`, Startknopf-Text und ob der Start gesperrt ist.
- **`SetupSection`**: Überschrift plus Inhalt mit einheitlichem Abstand (der heutige `taboo-section`).
- **`TeamsSetup`**: Teamanzahl, Namensfelder, Reihenfolge, Spielerliste mit Verteilung; Props `rules: TeamRules`, `players: "off" | "optional" | "required"`, `value` und `onChange` (Abschnitt 6, Frage 1).
- **`PlayersSetup`** (nur Spieler, ohne Teams): dieselbe Spielerliste, nur ohne Verteilung (Abschnitt 6, Frage 2).
- **Spieleinstellungen** brauchen keinen neuen Baustein: Das Spiel setzt `ChoiceGroup` und `InfoButton` in eine `SetupSection`. Eine „Einstellungs-Beschreibung“ als Daten (Schema) bauen wir nicht, solange es nur Tabu gibt (YAGNI, siehe ADR-017).

### 4.3 Texte und Stile

- Neue Textdatei je Sprache `src/i18n/resources/<sprache>/kit.ts` (wie `taboo.ts`, in `common.ts` eingebunden): Abschnittsüberschriften, Team- und Spielertexte, Hinweise. Die Tabu-Schlüssel dafür entfallen. Die Tests zu Übersetzungsqualität und -parität laufen weiter automatisch.
- Stile wandern aus `taboo.css` in eine Kit-Datei (`styles/game-kit.css`) mit Präfix `kit-`. Tabu behält nur Tabu-Stile.
- Zugängliche Namen bleiben gleich (Gruppe „Teams“, „Name von Team 1“ …), damit Tests und e2e stabil bleiben.

### 4.4 Handy- und PC-Layout (Phase Al-08)

Der Baustein erscheint in jedem Spiel, deshalb wird das PC-Layout hier **mitgedacht, aber nicht in `Al-09-02` gebaut**:

- Handy: eine Spalte wie heute (Teams und Spieler, darunter Einstellungen, Startleiste unten).
- PC: zwei Spalten (links Teams und Spieler, rechts Einstellungen), Startknopf rechts unten statt Leiste über die ganze Breite.
- `SetupScreen` ist der einzige Ort, der das Raster festlegt; Spiele ändern nichts.

### 4.5 Merken zwischen Spielen (`Al-09-03`, umgesetzt)

**Umgesetzt anders als zuerst entworfen:** Die Gruppe ist ein kleiner Datensatz (Teamnamen, Reihenfolge, Spielerliste, Verteilung) und liegt im lokalen Speicher des Browsers (`localStorage`, Schlüssel `gamehub.teamSetup`), nicht in IndexedDB. Das vermeidet eine Schemaänderung der Kartendatenbank und passt zu den Spracheinstellungen. Der Port `TeamSetupMemory` (`src/business/shared/savedTeamSetup.ts`) kapselt den Speicher; ein Wechsel auf IndexedDB ändert nur den Adapter `src/infrastructure/localStorageTeamSetupMemory.ts`.

Ursprünglicher Entwurf:

Ein Port `PlayerRosterRepository` in `business/shared` und eine IndexedDB-Ablage (Schemaversion 2 mit Migration) für die zuletzt benutzten Teams und Spieler. `TeamsSetup` bietet dann „Letzte Gruppe laden“ an, in jedem Spiel. Nicht Teil von `Al-09-02`.

## 5. Umbau von Tabu (verhaltensgleich)

1. Reine Logik `buildTeams` und `TeamRules` mit Tests; Tabu ruft sie in `submit` auf, statt die Teams selbst zu bauen.
2. `SetupSection`, `SetupScreen` einführen; `TabooSetupForm` benutzt sie. Stile und Texte ziehen um.
3. `TeamsSetup` einführen (mit den Spielerdaten), `TabooPlayers` und der Teamabschnitt im Formular entfallen.
4. Leitfaden für neue Spiele ergänzen (`docs/GAMEHUB_NEW_GAME_GUIDE.md`), Tests anpassen, e2e unverändert grün.

Nach jedem Schritt laufen alle Tests, Prettier, tsc und eslint.

## 6. Entscheidungen

**Entschieden (Auftraggeber, 2026-11-12):**

1. **Teams und Spieler gesteuert:** `TeamsSetup` ist gesteuert (`value` und `onChange`) und liefert dem Spiel Teams **mit ihren Spielern**. Die übrigen Einstellungen bleiben normale Formularfelder.
2. **Spiele ohne Teams jetzt vorsehen:** Der zweite Baustein `PlayersSetup` (nur Spielerliste, ohne Verteilung) wird gleich mit gebaut.
3. **Merken zwischen Spielen später:** `Al-09-03` bleibt eine eigene Aufgabe nach `Al-09-02`.

**Vorläufig angenommen (nicht ausdrücklich beantwortet, jederzeit änderbar):**

4. **Spielerzuordnung bei Tabu:** Sie geht ins Spiel (Teams mit Spielern), die Rundenübersicht zeigt sie zunächst **nicht**. Das Anzeigen ist eine kleine Folgeänderung, sobald der Auftraggeber es möchte.
5. **Grenzen:** Standard 2 bis 6 Teams, Teamname und Spielername bis 24 Zeichen; je Spiel über `TeamRules` einstellbar.

## 7. Risiken

- **Regressionen im Tabu-Setup:** gemildert durch die vorhandenen Tests (Komponenten, Sprachdurchläufe, e2e mit Layoutprüfung) und kleine Schritte.
- **Typisierte Übersetzungsschlüssel:** die Umstellung ändert viele Schlüsselnamen; die Typprüfung meldet jede vergessene Stelle.
- **Zu allgemein gebaut:** darum bewusst kein Einstellungs-Schema und keine Spiel-Engine (ADR-017).
- **Gesteuerter Zustand:** mehr Code als `FormData`, dafür klare Schnittstelle. Das Formular der Spieleinstellungen bleibt unverändert.
