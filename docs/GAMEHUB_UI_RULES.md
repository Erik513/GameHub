# Ansichtstypen und feste Oberflächenregeln für alle Spiele

Diese Regeln hat der Auftraggeber am 2026-11-12 vorgegeben (`ADR-021`). Sie gelten für jedes Spiel und nehmen Vorrang vor spielspezifischen Wünschen. Aufgebaut wird auf `ADR-017` (Spielbausteine), `ADR-020` (Setup-Bausteine) und `docs/GAMEHUB_SETUP_KIT.md`.

Kennzeichnung: **[ist]** gilt heute schon in Tabu und im `game-kit`, **[Umbau]** weicht heute ab und wird in `PH-17-05` angepasst.

## 1. Ziel

Jedes Spiel besteht aus denselben wenigen Ansichten. Ein neues Spiel füllt sie mit eigenem Inhalt und erfindet keine eigenen Oberflächenmuster. Alle Bedienelemente sehen in jedem Spiel gleich aus und folgen demselben Theme.

## 2. Die Ansichten

### 2.1 Hauptmenü (jedes Spiel hat eines)

Aufbau von oben nach unten:

1. **Kopfleiste [ist]:** links der Name des Spiels, rechts die zwei Knöpfe **Einstellungen** und **Home**.
2. **Werkzeugleiste [ist]**, eine Reihe unter der Kopfleiste, die Knöpfe teilen sich die Breite:
   - immer ein Knopf **Spieler** (öffnet die Spielerverwaltung, `ADR-022`; das Hauptmenü bekommt ihn automatisch);
   - immer ein Knopf **Spielregeln** (öffnet das Infofenster mit den Regeln);
   - optional ein Knopf zur **Datenansicht oder zum Editor**, wo man eigene Inhalte hinzufügen, ändern, importieren und exportieren kann (bei Tabu „Karten“). Spiele ohne eigene Inhalte haben ihn nicht.
3. **Inhalt [ist]**, immer in genau dieser Reihenfolge (das Feld „Teams und Spieler“ gehört **nicht** mehr ins Hauptmenü, siehe 2.1a):
   - Feld **Spieleinstellungen**: nur Einstellungen, die den Ablauf des Spiels bestimmen (bei mehreren Modi zuerst der Spielmodus, dann die Gruppen des gewählten Modus),
   - bei Bedarf weitere Felder für Einstellungen, die **nicht** vom Spielmodus abhängen, getrennt von den Spieleinstellungen (bei Tabu das Feld **Karten** mit Kartensprache, Kartenquelle, Schwierigkeit und Kategorien).
4. **Starten [ist]:** der Knopf steht ganz unten und ist **immer fest am unteren Rand**, bei kurzem wie bei langem Inhalt.

**Sprachen:** Die Einstellungen des GameHub (Knopf in der Kopfleiste) enthalten **nur die Oberflächensprache**. Die Sprache der Inhalte (bei Tabu die Kartensprache) ist eine Einstellung des Spiels und steht als erste Knopfgruppe im Feld der Inhalte (bei Tabu „Karten“; Englisch links, Deutsch rechts). Ein Spiel bekommt dafür `cardLanguage` und `onCardLanguageChange` vom Spielmodul-Vertrag; die App speichert die Wahl weiterhin zentral.

**Spielmodus:** Hat ein Spiel mehrere Modi, steht die Knopfgruppe **Spielmodus** als erste Gruppe in den „Spieleinstellungen“. Der Modus bestimmt, welche weiteren Gruppen dort sichtbar sind; die Werte aller Modi bleiben beim Wechseln erhalten. Einstellungen, die nicht vom Modus abhängen (bei Tabu Kartensprache, Kartenquelle, Schwierigkeit, Kategorien), stehen in einem eigenen Feld.

Die Felder des Inhalts sind Kapitel (Box mit Überschrift und Pfeil), auf- und zuklappbar, standardmäßig offen **[ist]**. Zugeklappte Eingaben bleiben im Formular und zählen beim Start.

### 2.1a Aufstellung (nach „Starten“, `ADR-023`)

Der Knopf „Starten“ im Hauptmenü führt zur Ansicht **Aufstellung**; erst ihr Knopf „Spiel starten“ startet das Spiel.

- **Inhalt [ist]:** Feld „Teams und Spieler“ (Teamanzahl, Namen, Reihenfolge, Spielerliste, Auswahl aus der gespeicherten Spielerliste, Zuweisung von Hand oder per Knopf „Zufällig auf Teams verteilen“). Die Spielerliste ist offen.
- **Hauptaktion:** „Spiel starten“ steht fest unten. Erst dort werden die Karten vorbereitet (auch das Nachladen durch die lokale KI) und geprüft, ob genug Karten da sind, weil erst hier die Teamzahl feststeht; Meldungen erscheinen in der Aufstellung.
- **Kopfleiste:** nur der Zurückknopf (zurück ins Hauptmenü), wie in jeder Unteransicht.
- **Spielende:** „Mit gleicher Konfiguration neu spielen“ führt in die Aufstellung (Teams vorbelegt, Einstellungen und Karten bleiben). Im Endstand selbst wird nichts gelost oder verteilt.
- **Baustein:** `LineupScreen` im `game-kit`.

### 2.2 Spielansichten (während eines Spiels)

Jedes Spiel hat diese drei Typen:

| Typ | Inhalt |
|---|---|
| **Zwischenstand** (Scoreboard) | Punktestand, wer als Nächstes dran ist; die Hauptaktion unten startet die nächste Runde **[ist]** |
| **Das eigentliche Spiel** | der Zug oder die Runde; die spielentscheidenden Knöpfe stehen unten **[ist]** |
| **Endstand** | Sieger und Endstand; unten die Aktionen „Neues Spiel“ und „Beenden“ **[ist]** |

Spielspezifische Zusatzansichten (bei Tabu Auswertung und Stechen) sind Varianten dieser drei Typen und folgen denselben Regeln.

### 2.3 GameHub (Spielauswahl)

Die Spielauswahl ist auf dem Handy kompakt: Kopfleiste mit „GameHub“ links und rechts dem Textknopf **Spieler** (Symbol und Text, weil das Symbol allein nicht selbsterklärend ist) und dem Symbolknopf **Einstellungen**; darunter sofort die Spiele als Karten. Überschrift und Einleitung sind nur für Screenreader da (ab Tabletbreite sichtbar). Der Spielerknopf der Spielauswahl steht in der Kopfleiste, nicht im Inhalt.

### 2.4 Unteransichten und die Kopfleiste

In allen Ansichten außer dem Hauptmenü, also in Spielansichten und im Editor, zeigt die Kopfleiste **nur interne Navigation oder „Spiel beenden“**. Es gibt dort **keinen Home-Knopf und keinen Knopf für Spracheinstellungen** **[ist]**. Ein Spiel verlässt man nur über das Hauptmenü.

### 2.5 Infofenster

Es gibt **ein** Infofenster für alles (Spielregeln, Erklärungen, Auswahl, Einstellungen, Spielerverwaltung, Auswahl aus der Spielerliste), den Baustein `Dialog` **[ist]**. Es besteht immer aus:

1. Überschrift oben links,
2. Schließen-Knopf oben rechts (mit Rahmen, ohne Bestätigung),
3. darunter der Inhalt (bei Bedarf mit einem Text direkt unter der Überschrift).

Weitere Fenstertypen gibt es nicht. Ein Fenster ist kurz; was länger als ein Bildschirm ist, wird eine Unteransicht.

## 3. Theme und Bedienelemente

1. **Einheitlich [ist]:** Alle Bedienelemente (Knöpfe, Felder, Auswahlgruppen, Boxen) sehen in jedem Spiel gleich aus. Sie kommen aus `components` und `game-kit`, nicht aus Spielstilen. Spielstile (`styles/games/<spiel>.css`) legen nur den **Inhalt** des Spiels aus, nie das Aussehen der Bedienelemente.
2. **Ein Theme [ist]:** Farben, Abstände, Radien und Schrift stehen als Token in `tokens.css`. Kein Spiel setzt eigene Farbwerte.
3. **Später:** Jedes Spiel kann eine eigene **Sekundärfarbe** bekommen. Sie wird als Token (Akzentfarbe des Spiels) gesetzt und von den Bedienelementen gelesen; heute gibt es dafür schon `data-accent` im Katalog. Das ist noch nicht gebaut und wird nicht vorweggenommen.

## 4. Eingaben

1. **So wenige Eingabefelder wie möglich.** Wo eine Auswahl oder ein Tippen genügt, wird kein Textfeld benutzt. Eine Auswahl aus wenigen festen Möglichkeiten (Sprache, Teamanzahl, Schwierigkeit) ist immer eine **Gruppe nebeneinanderstehender Knöpfe** (`ChoiceGroup`), keine Combobox. Die Einstellungen (Oberflächen- und Kartensprache) folgen dem schon. **Noch Comboboxen [Umbau]:** Kategorie und Schwierigkeit beim Karteneintrag und im Karteneditor und die Teamzuordnung je Spieler in `TeamsSetup`; sie bleiben, bis dafür eine passende Knopfform abgestimmt ist (viele Kategorien passen nicht nebeneinander).
2. Mehrzeilige Felder sind nicht in der Größe veränderbar und wachsen mit dem Inhalt **[ist]**.
3. Schriftgröße in Feldern mindestens 16 Pixel, jedes Feld hat eine Beschriftung **[ist]**.

## 5. Knöpfe

1. **Einheitlich:** Alle Knöpfe sehen gleich aus, **außer** begründeten Ausnahmen (Kopfleiste mit Symbolknöpfen, Hauptaktion unten in Vollbreite, Auswahlkarten in `ChoiceGroup`). Eine Ausnahme wird hier eingetragen, bevor sie gebaut wird.
2. **Farben:**
   - **Rot:** löschen, entfernen, abbrechen. Das gilt immer **[Umbau]**: der Knopf „Abbrechen“ im Karteneditor ist heute grau.
   - **Grün:** hinzufügen, starten, speichern, bestätigen **[ist]**.
   - Grau umrandet: Nebenaktionen ohne Wertung (Importieren, Exportieren).
3. **Feste Bestätigung [ist]:** Bestimmte Knöpfe verlangen eine Bestätigung. Das sind alle Aktionen, die Daten oder einen Spielstand unwiderruflich entfernen (Karte löschen, Kategorie löschen, Spiel beenden, Neustart). Sie sind `ConfirmButton`: erstes Tippen schaltet scharf und zeigt „Nochmal tippen“, zweites Tippen führt aus. Kein Bestätigungsfenster.
4. **Spielentscheidende Knöpfe stehen in der Regel unten [ist]**: starten, nächste Runde, Richtig, Überspringen, Auswerten.
5. **Knopfreihen:** gleich breit und gleich hoch (44 Pixel), Reihenfolge von links nach rechts: bestätigen, löschen, abbrechen **[ist]**.
6. **Platzsparend, Symbol allein wenn selbsterklärend:** Knöpfe sind so kompakt wie möglich. Ist ein Symbol ohne Text eindeutig (zum Beispiel bearbeiten, speichern, löschen, schließen, Einstellungen, Home, Info), steht nur das Symbol, mit Beschriftung für Screenreader und Tooltip. Aktionen, die ein Symbol nicht eindeutig sagt (zum Beispiel Abbrechen, Importieren, Exportieren, Starten, Spielregeln), behalten ihren Text. Im Zweifel gilt: Text, bis ein Symbol im Test von Auftraggeber und Nutzern als klar gilt **[ist]**.
7. **Mindestgröße:** 44 mal 44 Pixel **[ist]**.

## 6. Weitere feste Regeln

1. **Meldungen** (Fehler, Rückmeldungen) als `StatusMessage` am Anfang des Inhalts, nie als Fenster **[ist]**.
2. **Leere Zustände** mit `EmptyState` und einer Handlung **[ist]**.
3. **Sortierung:** Standard-Einträge vor eigenen, alphabetisch; Karten nach Schwierigkeit, leicht zuerst; eigene bearbeitbar, mitgelieferte nur lesbar **[ist]**.
4. **Texte:** alle sichtbaren Texte in Deutsch und Englisch in den Übersetzungsressourcen, gemeinsame im Namensraum `kit`; UI-Sprache und Kartensprache getrennt **[ist]**.
5. **Handy [ist]:** eine Spalte, 16 Pixel Seitenrand. **PC [Phase 16]:** dieselben Ansichten, nur das Raster ändert sich und liegt allein in den Kit-Bausteinen.
6. **Layoutprüfung:** Jede Ansicht jedes Spiels wird im e2e-Test auf kleinen und großen Handys geprüft **[ist für Tabu]**.

## 7. Bausteine

Alle Ansichten bestehen aus diesen Bausteinen im `game-kit` und in `components`; ein Spiel baut keine eigenen Rahmen.

| Ansicht | Baustein |
|---|---|
| Aufstellung | `LineupScreen` (Meldungen, Teams und Spieler als `SetupSection` mit `TeamsSetup` oder `PlayersSetup`, Startknopf unten fest) |
| Hauptmenü | `SetupScreen` (Rahmen mit Meldungen, Knopf `Spieler` (automatisch), Knopf für Spielregeln `rules`, optionaler Knopf für den Editor `editor`, Felder als `SetupSection`, Startleiste), darin `TeamsSetup` oder `PlayersSetup`, `ChoiceGroup`, `InfoButton` |
| Editor | `ManageScreen` (Titel, Hinweis, Kapitel als `SetupSection`, Aktionsreihe, Meldungen) |
| Zwischenstand und Endstand | `ScoreScreen` (Überschrift, optional Sieger, Punktestand, weitere Inhalte, Hauptaktion unten); der Endstand ist derselbe Baustein mit `winner` |
| Das eigentliche Spiel | `TimerHud`, `StartBar` und Inhalt des Spiels |
| Infofenster | `Dialog` |
| Knopfreihe | `ActionRow` (gleich breit, gleich hoch, Reihenfolge wie übergeben) |
| Spielerverwaltung | `PlayerRosterButton` (Knopf und Fenster: hinzufügen, löschen) und `RosterPicker` (Auswahl aus der Liste im Feld „Teams und Spieler“) |
| Weiteres | `ConfirmButton`, `Button`, `StatusMessage`, `EmptyState`, `Scoreboard`, `TurnStrip` |

Entscheidung: Es gibt bewusst **keinen** zusätzlichen `GameMenu`- und keinen `FinalScreen`-Baustein. `SetupScreen` ist das Hauptmenü, `ScoreScreen` deckt Zwischen- und Endstand ab (so wenige Bausteine wie möglich).

## 8. Umbau von Tabu (`PH-17-05`, erledigt)

1. Der Knopf „Abbrechen“ im Karteneditor ist rot.
2. `ActionRow` ersetzt die eigenen Knopfreihen im Karteneditor und die Reihe Importieren/Exportieren.
3. `ManageScreen` rahmt die Kartenseite, `ScoreScreen` die Rundenübersicht, das Stechen und den Endstand, `SetupScreen` hat `rules` und `editor` statt einer freien Werkzeugleiste.
4. Die Stile dafür liegen im Kit (`kit-setup.css`: `kit-action-row`, `kit-manage`, `kit-score-screen`, `kit-winner`), nicht mehr in `taboo.css`.
5. Verhalten und zugängliche Namen sind unverändert, die Tests laufen ohne Änderung der Erwartungen.

**Noch offen:** Die Ansicht „Das eigentliche Spiel“ (`TabooRound`) und die Auswertung (`TabooRoundReview`) sind noch Tabu-eigene Ansichten mit Kit-Bausteinen darin. Ein eigener Rahmen dafür wird erst gebaut, wenn ein zweites Spiel ihn braucht (`ADR-017`).

## 9. Annahmen (bitte bei Bedarf korrigieren)

- „Fenster“ in der Regel zur Kopfleiste (2.3) verstehe ich als **Unteransichten** (Spielansichten, Editor), nicht als das Infofenster, das gar keine Kopfleiste hat.
- „Abbrechen ist rot“ gilt auch für den Textknopf im Karteneditor.
- Der Editor ist nur im Hauptmenü erreichbar, nicht aus einer laufenden Runde.
