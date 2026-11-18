# Entwurf: PC-Layout für alle Spiele (Al-08)

**Stand 2026-11-18: umgesetzt** (`Al-08-01` bis `Al-08-05`); Abweichungen vom Entwurf stehen im Changelog (Kartenverwaltung als zwei Bereiche nebeneinander statt Master-Detail, der Reiter der Korrektur bleibt ein Reiter). Dieses Dokument gehört zu `Al-08-01`. Es legt fest, wie sich GameHub am PC verhält, welche Bausteine das `game-kit` dafür bekommt und wie die Tabu-Ansichten am PC aussehen. Entscheidungen des Auftraggebers vom 2026-11-18 sind als solche gekennzeichnet; alles andere ist ein Vorschlag oder eine Annahme und wartet auf Bestätigung (Abschnitt 8).

## 1. Ausgangslage

- Alle Ansichten sind **mobil zuerst**: eine Spalte. Am PC erscheint heute dieselbe Spalte, höchstens 30 rem breit (`--phone-width`) und mittig; links und rechts bleibt viel leerer Platz. Die Spielauswahl hat auf Wunsch des Auftraggebers ebenfalls die schmale Spalte.
- Die Aufteilung der Tabu-Einrichtung in **zwei Ansichten** (Aufstellung, Spieleinstellungen mit Reitern) ist für das Handy gebaut. Auf einem großen Bildschirm kostet sie unnötige Klicks.
- Die laufende Runde ist nur mit Maus oder Finger bedienbar; Tastenkürzel gibt es nicht.
- Die Layoutprüfung (`e2e/mobile-layout.spec.ts`) kennt nur Handys (320 × 568, 360 × 640, 412 × 915). Für den PC gibt es nur den Stilvergleich der Breiten 768 und 1280 (`e2e/style-snapshot.spec.ts`), keine Regeln für das, was richtig ist.

## 2. Entscheidungen des Auftraggebers (2026-11-18)

| Frage | Entscheidung |
|---|---|
| Ab welcher Breite gilt das PC-Layout? | **Ab 1024 px** (64 rem). Darunter bleibt die Handy-Spalte, auch auf Tablets. |
| Einrichtung am PC | **Nebeneinander:** links Teams und Spieler, rechts die Spieleinstellungen, darunter ein breiter Startknopf. Keine Reiter und kein Umschalten zwischen Aufstellung und Einstellungen. |
| Bedienung der Runde | **Mit Tastenkürzeln:** Leertaste oder Enter = Richtig, S = Überspringen, V = Verbotenes Wort, P = Pause. Die Kürzel stehen an den Knöpfen. |
| Spielauswahl | **Bleibt die schmale Spalte.** Das PC-Layout betrifft nur die Spiele selbst. |

## 3. Grundsätze

1. **Ein Layout je Breite, keine zwei Apps.** Dieselben Komponenten, dieselbe Logik und dieselben Texte; nur Anordnung und Größen ändern sich. Wo es geht, nur mit CSS (`@media (min-width: 64rem)`), ohne eigenen Zustand.
2. **Das Handy-Layout bleibt unverändert.** Unter 1024 px ändert sich keine Ansicht (belegt mit dem Stilvergleich, siehe `Al-10-08`).
3. **Das `game-kit` kennt kein Spiel.** Die Bausteine für zwei Bereiche und für Tastenkürzel gehören in `src/presentation/game-kit/`, die Zuordnung der Tasten zu Aktionen in das Spiel.
4. **Die Business-Schicht bleibt unberührt.** Tastenkürzel sind Oberfläche; sie lösen dieselben Ereignisse aus wie die Knöpfe.
5. **Jede neue Ansicht wird in beiden Sprachen und in drei PC-Größen geprüft** (Abschnitt 7).

## 4. Breiten

| Name | Breite | Verhalten |
|---|---|---|
| Handy | unter 48 rem (768 px) | Spalte, wie heute. |
| Tablet | 48 bis unter 64 rem | Spalte, wie heute (Tablets sollen nicht das PC-Layout bekommen). |
| **PC** | **ab 64 rem (1024 px)** | PC-Layout. Der Inhalt wird höchstens **80 rem (1280 px)** breit und mittig gehalten; auf noch größeren Bildschirmen wächst nur der Rand. |

Geprüft werden die Größen **1024 × 768, 1280 × 800 und 1920 × 1080**. Die Höhe darf bis etwa 600 px schrumpfen (Browserfenster mit Leisten), ohne dass etwas Wichtiges verschwindet.

## 5. Bausteine im `game-kit`

| Baustein | Aufgabe | Art |
|---|---|---|
| `SplitScreen` (Arbeitsname) | Zwei Bereiche nebeneinander ab 64 rem (zum Beispiel Aufstellung und Einstellungen), darunter die Startleiste über die ganze Breite; unter 64 rem das heutige Verhalten. | Komponente und CSS |
| `useShortcuts` | Meldet Tastenkürzel eines Spiels an und ab. Ignoriert Tasten in Eingabefeldern, bei offenen Fenstern und bei gehaltener Strg-, Alt- oder Meta-Taste; kein Kürzel doppelt. | Hook |
| `ShortcutHint` | Zeigt die Taste am Knopf (zum Beispiel „Leertaste“). Nur am PC sichtbar, am Handy ausgeblendet (dort gibt es keine Tastatur). | Komponente |
| Seitenleiste der Runde | Bereich neben der Karte für Teamstände oder Zeitkonten. | CSS-Muster |

Ob `SplitScreen` ein eigener Baustein oder eine Erweiterung von `SetupScreen` wird, entscheidet die Umsetzung von `Al-08-04`; die Regeln aus `docs/GAMEHUB_UI_RULES.md` (feste Ansichtstypen) bleiben bindend.

## 6. Die Tabu-Ansichten am PC

### 6.1 Einrichtung (Al-08-02)

- **Links** die Aufstellung (Teams, Spieler, Teamreihenfolge), **rechts** die Spieleinstellungen (Spielmodus und die Gruppen des Modus, Kartenfeld), beide mit eigenem Scrollbereich; die Seite scrollt nicht.
- Die Reiter „Spieleinstellungen“ und „Kategorien und Karten“ (heute zwei Reiter) bleiben **innerhalb des rechten Bereichs** erhalten, weil sie viel Inhalt tragen; der Knopf „Spieleinstellungen“ und das Umschalten der Ansicht entfallen.
- Unten über die ganze Breite die Startleiste („Spiel starten“, Spielregeln, Spielerliste bleiben in der Kopfleiste).
- Die Meldungen (zu wenige Karten, Fehler der Aufstellung) stehen wie heute über den Bereichen.

### 6.2 Laufende Runde (Al-08-02-01)

- **Mitte:** die Karte, groß (Begriff und verbotene Wörter in einer lesbaren Größe, höchstens 40 rem breit), darüber die Uhr.
- **Rechts (neu):** die Teamstände beziehungsweise die Zeitkonten aller Teams (bei „Gegen die Zeit“ die heutige Leiste, hier senkrecht), das Team am Zug ist markiert. Am Handy bleibt die Runde so karg wie heute (ohne Stände, damit niemand spickt und der Platz reicht).
- **Unten unter der Karte:** die drei Antwortknöpfe nebeneinander mit den Kürzeln („Richtig“ mit Leertaste, „Überspringen“ mit S, „Verbotenes Wort“ mit V); die Pause mit P.
- **Alles ohne Scrollen** bei 1024 × 768 und höher: Karte, Zeit und Spielaktionen bleiben gemeinsam sichtbar (Akzeptanzkriterium).
- **Regel für die Kürzel:** Sie wirken nur in der laufenden Runde und nur, wenn kein Fenster offen und die Runde nicht pausiert ist; in der Pause gilt P (Weiter) und Escape wie in einem Fenster. Eine Taste, die gehalten wird, löst nur einmal aus.

### 6.3 Übersichten und Ergebnis (Al-08-02-02)

- Die Rangliste mit Balken (`ScoreScreen`) steht links, die **Aktionen** („Runde starten“, „Endergebnis“, „Erneut spielen“, „Zurück zum Hauptmenü“) rechts daneben oder darunter in einer Spalte, in einer Breite, die zum Lesen reicht (höchstens 48 rem für die Liste).
- Der Reiter „Letzte Karten“ (Korrektur) steht neben der Liste statt als Reiter.
- Bei „Stechen“ gilt dasselbe für die Übersicht der Versuche.

### 6.4 Kartenverwaltung (Al-08-02-03)

- **Zwei Spalten:** links Kategorien (mit Anzahl), rechts die Karten der gewählten Kategorie mit Suche; die Eingabe einer neuen Karte als Bereich rechts daneben oder als Fenster, nicht mehr als zweiter Reiter. Löschen, Umbenennen, Export und Import wie heute.
- Tastatur: Pfeile in der Liste, Enter öffnet, Entf löscht (mit Bestätigung).

## 7. Prüfung

- **Neue Layoutprüfung `e2e/desktop-layout.spec.ts`** neben der Handy-Prüfung: dieselben Abläufe (Aufstellung, Einstellungen jedes Modus, Zug, Pause, Übersicht, Ergebnis, Stechen, Kartenverwaltung) bei 1024 × 768, 1280 × 800 und 1920 × 1080, in Deutsch und Englisch. Geprüft wird: keine waagerechte Scrollleiste, kein Seitenscrollen auf den Einzelseiten, Karte + Uhr + Antwortknöpfe gleichzeitig sichtbar, Aktionen erreichbar, nichts vom Startknopf verdeckt, der Inhalt höchstens 80 rem breit und mittig.
- **Tastenkürzel:** Komponententests (jedes Kürzel löst genau ein Ereignis aus; nicht in Eingabefeldern, nicht bei offenem Fenster, nicht in der Pause; nie doppelt) und ein Browsertest mit der Tastatur durch eine ganze Runde.
- **Stilvergleich** (`e2e/styleSnapshot.ts`): Alle Handy-Größen müssen vor und nach jedem Schritt **gleich** bleiben.
- Die Abdeckung bleibt mindestens bei den Zielen aus `AGENTS.md` (Oberfläche 75 %).

## 8. Offene Punkte (Annahmen)

1. Der **Inhalt** ist am PC höchstens 80 rem (1280 px) breit und mittig; auf 1920 px bleiben Ränder.
2. Die **Seitenleiste mit den Ständen** gibt es nur am PC, nicht am Handy.
3. Das Kürzel **Leertaste** für „Richtig“ könnte versehentlich auslösen, wenn ein Knopf den Fokus hat und gedrückt wird; deshalb wirkt es nur, wenn kein Knopf und kein Feld den Fokus hat (sonst gilt der Knopf normal). Der Fokus liegt in der Runde auf der Ansicht selbst (`Al-10-09`), also passt das.
4. Die **Spielregeln** und die **Spielerliste** bleiben Fenster (nicht fest eingeblendet).
5. Weitere Spiele (Wortbombe, Imposter, Werwolf, Liar’s Bar, Schwimmen) bekommen ihr PC-Layout mit demselben Baukasten; hier wird nur Tabu festgelegt.

## 9. Aufgaben

| ID | Inhalt |
|---|---|
| `Al-08-01` | Dieser Entwurf. Fertig, sobald der Auftraggeber Abschnitt 8 bestätigt hat. |
| `Al-08-04` (neu) | Bausteine im `game-kit`: Breiten (Tokens), `SplitScreen`, `ShortcutHint`, `useShortcuts` mit Tests. |
| `Al-08-02` | Tabu-Einrichtung am PC (Abschnitt 6.1). |
| `Al-08-02-01` | Laufende Runde am PC mit Seitenleiste (6.2). |
| `Al-08-03` (neu) | Tastenkürzel der laufenden Runde in allen drei Modi und im Stechen (6.2) mit Tests. |
| `Al-08-02-02` | Übersichten und Ergebnis am PC (6.3). |
| `Al-08-02-03` | Kartenverwaltung am PC (6.4). |
| `Al-08-05` (neu) | Layoutprüfung für den PC (`e2e/desktop-layout.spec.ts`), zuerst mit den vorhandenen Ansichten, damit jede Aufgabe oben sie schon vorfindet. |

Reihenfolge: `Al-08-05` (Prüfung zuerst, sie zeigt den Ist-Stand), `Al-08-04`, dann `Al-08-02`, `Al-08-02-01` mit `Al-08-03`, `Al-08-02-02`, `Al-08-02-03`. Nach jedem Schritt: alle Tests, Typen, ESLint, Prettier, Schichtprüfung, Browserprüfungen und der Stilvergleich der Handy-Größen grün; Commit nur auf Zuruf.
