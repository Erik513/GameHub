# Ansichtstypen und feste Oberflächenregeln für alle Spiele

Diese Regeln hat der Auftraggeber am 2026-11-12 vorgegeben (`ADR-021`). Sie gelten für jedes Spiel und nehmen Vorrang vor spielspezifischen Wünschen. Aufgebaut wird auf `ADR-017` (Spielbausteine), `ADR-020` (Setup-Bausteine) und `docs/GAMEHUB_SETUP_KIT.md`.

Kennzeichnung: **[ist]** gilt heute schon in Tabu und im `game-kit`, **[Umbau]** weicht heute ab und wird in `PH-17-05` angepasst.

## 1. Ziel

Jedes Spiel besteht aus denselben wenigen Ansichten. Ein neues Spiel füllt sie mit eigenem Inhalt und erfindet keine eigenen Oberflächenmuster. Alle Bedienelemente sehen in jedem Spiel gleich aus und folgen demselben Theme.

## 2. Die Ansichten

### 2.1 Hauptmenü (jedes Spiel hat eines)

Aufbau von oben nach unten:

1. **Kopfleiste [ist]:** links der Name des Spiels, rechts die zwei Knöpfe **Einstellungen** und **Home**.
2. **Werkzeugleiste [ist]**, rechts oben unter der Kopfleiste:
   - immer ein Knopf **Spielregeln** (öffnet das Infofenster mit den Regeln);
   - optional ein Knopf zur **Datenansicht oder zum Editor**, wo man eigene Inhalte hinzufügen, ändern, importieren und exportieren kann (bei Tabu „Karten“). Spiele ohne eigene Inhalte haben ihn nicht.
3. **Inhalt [ist]**, immer in genau dieser Reihenfolge:
   - Feld **Teams und Spieler**,
   - Feld **Spieleinstellungen**.
4. **Starten [ist]:** der Knopf steht ganz unten und ist **immer fest am unteren Rand**, bei kurzem wie bei langem Inhalt.

Die Felder des Inhalts sind Kapitel (Box mit Überschrift und Pfeil), auf- und zuklappbar, standardmäßig offen **[ist]**. Zugeklappte Eingaben bleiben im Formular und zählen beim Start.

### 2.2 Spielansichten (während eines Spiels)

Jedes Spiel hat diese drei Typen:

| Typ | Inhalt |
|---|---|
| **Zwischenstand** (Scoreboard) | Punktestand, wer als Nächstes dran ist; die Hauptaktion unten startet die nächste Runde **[ist]** |
| **Das eigentliche Spiel** | der Zug oder die Runde; die spielentscheidenden Knöpfe stehen unten **[ist]** |
| **Endstand** | Sieger und Endstand; unten die Aktionen „Neues Spiel“ und „Beenden“ **[ist]** |

Spielspezifische Zusatzansichten (bei Tabu Auswertung und Stechen) sind Varianten dieser drei Typen und folgen denselben Regeln.

### 2.3 Unteransichten und die Kopfleiste

In allen Ansichten außer dem Hauptmenü, also in Spielansichten und im Editor, zeigt die Kopfleiste **nur interne Navigation oder „Spiel beenden“**. Es gibt dort **keinen Home-Knopf und keinen Knopf für Spracheinstellungen** **[ist]**. Ein Spiel verlässt man nur über das Hauptmenü.

### 2.4 Infofenster

Es gibt **ein** Infofenster für alles (Spielregeln, Erklärungen, Auswahl, Einstellungen), den Baustein `Dialog` **[ist]**. Es besteht immer aus:

1. Überschrift oben links,
2. Schließen-Knopf oben rechts (mit Rahmen, ohne Bestätigung),
3. darunter der Inhalt (bei Bedarf mit einem Text direkt unter der Überschrift).

Weitere Fenstertypen gibt es nicht. Ein Fenster ist kurz; was länger als ein Bildschirm ist, wird eine Unteransicht.

## 3. Theme und Bedienelemente

1. **Einheitlich [ist]:** Alle Bedienelemente (Knöpfe, Felder, Auswahlgruppen, Boxen) sehen in jedem Spiel gleich aus. Sie kommen aus `components` und `game-kit`, nicht aus Spielstilen. Spielstile (`styles/games/<spiel>.css`) legen nur den **Inhalt** des Spiels aus, nie das Aussehen der Bedienelemente.
2. **Ein Theme [ist]:** Farben, Abstände, Radien und Schrift stehen als Token in `tokens.css`. Kein Spiel setzt eigene Farbwerte.
3. **Später:** Jedes Spiel kann eine eigene **Sekundärfarbe** bekommen. Sie wird als Token (Akzentfarbe des Spiels) gesetzt und von den Bedienelementen gelesen; heute gibt es dafür schon `data-accent` im Katalog. Das ist noch nicht gebaut und wird nicht vorweggenommen.

## 4. Eingaben

1. **So wenige Eingabefelder wie möglich.** Wo eine Auswahl (Gruppe von Knöpfen, Auswahlliste) oder ein Tippen genügt, wird kein Textfeld benutzt.
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

Vorhanden: `SetupScreen`, `SetupSection`, `TeamsSetup`, `PlayersSetup`, `ChoiceGroup`, `InfoButton`, `StartBar`, `TurnStrip`, `Scoreboard`, `TimerHud`, `Dialog`, `ConfirmButton`, `Button`, `StatusMessage`, `EmptyState`.

Fehlt (wird in `PH-17-05` gebaut, soweit ein Spiel sie sonst selbst bauen müsste):

| Baustein | Zweck |
|---|---|
| `GameMenu` | Hauptmenü aus Werkzeugleiste (Regeln, optional Editor), Feldern und Startleiste; Spiele geben nur Inhalt und Knopftexte an |
| `ActionRow` | Knopfreihe gleich breit, feste Reihenfolge und Farben (ersetzt CSS aus `taboo.css`) |
| `ScoreScreen` und `FinalScreen` | Zwischenstand und Endstand mit Scoreboard und Hauptaktion |
| `ManageScreen` | Rahmen des Editors: Kapitel, Liste, Aktionsleiste unten (Importieren, Exportieren je halb) |

## 8. Umbau von Tabu in `PH-17-05`

1. Knopf „Abbrechen“ wird rot, damit die Farbregel (5.2) überall gilt.
2. `ActionRow` bauen und Karteneditor, Kategorieaktionen und Exportfenster darauf umstellen.
3. `GameMenu`, `ScoreScreen`, `FinalScreen`, `ManageScreen` aus den vorhandenen Tabu-Ansichten herauslösen, Verhalten und zugängliche Namen unverändert.
4. Spielstile enthalten danach nur noch Spielinhalt; Bedienelemente stehen im Kit.
5. Leitfaden `docs/GAMEHUB_NEW_GAME_GUIDE.md` verweist auf diese Regeln. Wo möglich prüfen Tests die Regeln (zum Beispiel jeder Fensterkopf gleich, kein Home-Knopf in Unteransichten, rote Löschknöpfe).

## 9. Annahmen (bitte bei Bedarf korrigieren)

- „Fenster“ in der Regel zur Kopfleiste (2.3) verstehe ich als **Unteransichten** (Spielansichten, Editor), nicht als das Infofenster, das gar keine Kopfleiste hat.
- „Abbrechen ist rot“ gilt auch für den Textknopf im Karteneditor.
- Der Editor ist nur im Hauptmenü erreichbar, nicht aus einer laufenden Runde.
