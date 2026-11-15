# Ansichtstypen und feste Oberflächenregeln für alle Spiele

Diese Regeln hat der Auftraggeber am 2026-11-12 vorgegeben (`ADR-021`). Sie gelten für jedes Spiel und nehmen Vorrang vor spielspezifischen Wünschen. Aufgebaut wird auf `ADR-017` (Spielbausteine), `ADR-020` (Setup-Bausteine) und `docs/GAMEHUB_SETUP_KIT.md`.

Kennzeichnung: **[ist]** gilt heute schon in Tabu und im `game-kit`, **[Umbau]** weicht heute ab und wird in `Al-09-05` angepasst.

## 1. Ziel

Jedes Spiel besteht aus denselben wenigen Ansichten. Ein neues Spiel füllt sie mit eigenem Inhalt und erfindet keine eigenen Oberflächenmuster. Alle Bedienelemente sehen in jedem Spiel gleich aus und folgen demselben Theme.

## 2. Die Ansichten

### 2.0 Vorbild für alle Ansichten: „Spieler und Teams“ (Entscheidung des Auftraggebers vom 2026-11-14)

Die Aufstellung (2.1a) gilt als **Vorbild**: Jede Ansicht soll so aussehen und sich so verhalten, damit die App einheitlich bleibt. Die Merkmale:

- **Sehr einfach, aber kompakt:** nur das Nötigste auf dem Schirm, keine verschachtelten Modi (kein Ziehen, keine Bearbeitungsmodi, keine versteckten Zustände).
- **Reiter wie im Browser** statt aufklappbarer Kapitel (`ADR-026`, 2026-11-14): oben eine Reihe Reiter („Spieler (4) | Teams (2)“, „Spieleinstellungen | Karten“), darunter der Inhalt des gewählten Reiters in einer Box, die mit dem Reiter verbunden ist. **One-Pager (2026-11-15):** Hauptmenü und Aufstellung sind **eine Seite, die nie scrollt**: Kopfleiste oben, Reiterleiste fest darunter, der Reiterinhalt füllt den Platz bis zum fest unten stehenden Startknopf, alle Reiter sind gleich hoch (nichts springt) und ist ein Inhalt länger, **scrollt nur die Box des Reiters** (auch beim Ziehen von Spielern am Rand der Box). **Grundregel für jede Ansicht:** Jede Ansicht ist ein One-Pager; muss etwas scrollen, dann nur **innerhalb eines Bedienelements** (Reiterbox, Liste), nie die Seite. Das gilt für Hauptmenü, Aufstellung, den **Karteneditor** (zwei Reiter: links **„Karten“** mit zwei Ansichten **„Standard | Eigene“** (eine Liste der Kategorien, ohne Aufklappen; ein Tipp auf eine Kategorie zeigt ihre Karten zum Ansehen und Bearbeiten, mit Zurück-Knopf, Name und Anzahl mittig auf einer Linie und bei eigenen Kategorien Umbenennen und Löschen fest oben; **beim Bearbeiten ist nur die eine Karte zu sehen**) und **Import und Export fest unten**; rechts **„Karte hinzufügen“** mit dem Knopf „Hinzufügen“ fest unten). **Bedienelemente verschwinden nie durch Scrollen:** Reiterköpfe, Umschalter, Zurück-Knöpfe, Fußknöpfe (`TabPane`) und der Titel mit dem Schließen-Knopf eines Fensters bleiben stehen, nur der Inhalt dazwischen scrollt; die Scrollleiste ist überall dünn und unauffällig, und **Listen aus Blöcken rasten beim Scrollen auf ganze Einträge ein** (kein angeschnittener Eintrag oben) und auf dem Handy für die Spielauswahl (die Liste der Spiele scrollt). Die Spielbildschirme (Runde, Übersicht, Ergebnis) passen ohne Scrollen auf das Handy. Der e2e-Test prüft, dass die Seite selbst nicht scrollt. Die PC-Ansicht folgt mit Al-08. Alle Reiter bleiben im Formular, auch die nicht gezeigten; Bereiche, die ein Spiel nicht braucht, fehlen.
- **Bewährte Muster statt neuer Erfindungen:** zum Beispiel einfache Liste mit Hinzufügen-Feld, ein Knopf für die Aktion („Teams auslosen“), Ergebnis als Karten, Auswahl in einem zentrierten Fenster.
- **Knöpfe:** jeder Knopf hat einen Rahmen; zusammengehörige Knöpfe stehen nebeneinander in gleicher Breite; Knöpfe sind **immer sichtbar** und nur gesperrt, wenn sie nichts ändern würden; Zerstörerisches braucht einen zweiten Tipp („Sicher?“).
- **Texte** kurz, in Deutsch und Englisch; Listen alphabetisch; Zustände und Meldungen als kurze Hinweise unten.
- **Konfigurierbar statt pro Spiel neu gebaut:** Ein Spiel beschreibt nur seine Besonderheiten (zum Beispiel `LineupConfig`); der gemeinsame Baustein im `game-kit` zeigt, was es braucht.

### 2.1 Hauptmenü (jedes Spiel hat eines)

Aufbau von oben nach unten:

1. **Kopfleiste [ist]** (geändert am 2026-11-13): links der Name des Spiels (ohne Farbpunkt davor; bei zu langem Namen mit Auslassungspunkten); rechts die Knöpfe **Spieler** (Symbol und Text), **Einstellungen** und ganz rechts **Home**. **Home steht immer ganz rechts.**
2. **Keine Werkzeugleiste [ist]** (geändert am 2026-11-13, die Regeln seit 2026-11-15 in der Kopfleiste): Der Knopf zum **Editor** steht nicht in einer Leiste unter der Kopfleiste, sondern im Reiter mit den Inhalten; die **Spielregeln** stehen als Knopf **in der Kopfleiste**:
   - **Spielregeln** (jedes Spiel hat diesen Knopf) steht in der **Kopfleiste des Hauptmenüs an der Stelle, wo der GameHub den Knopf „Spieler“ hat** (Symbol Buch und Text; der Knopf „Spieler“ gehört zur Spielauswahl des GameHub) und öffnet das **Regelfenster** des Spiels; so bleiben die Reiter bei „Spieleinstellungen | Karten";
   - der **Editor** (nur bei Spielen mit eigenen Inhalten, bei Tabu „Karten“) steht ganz oben im Feld mit den Inhalten (bei Tabu das Feld **Karten**) und führt zur Datenansicht, wo man eigene Sachen hinzufügen, ändern, importieren und exportieren kann.
   - **Die Spielregeln erklären alles, kurz und mit Bildern** (Hilfekonzept vom 2026-11-15, siehe 2.5a): ein Regelfenster mit kurzen Teilen mit je einer Überschrift und einer dünnen Trennlinie dazwischen (bei Tabu **Ziel, Die Karte, Ein Zug, Spielmodi, Einstellungen**), die Karte mit einer **Beispielkarte** (Begriff und vier verbotene Wörter) und die drei Knöpfe eines Zugs mit ihren Farben und je einem Satz. Beide Spielmodi stehen mit ein bis zwei Sätzen darin, ohne Auswahl. Das **Stechen** bleibt ein eigenes Infofenster, zu dem ein Link in den Regeln führt. Der kleine **i-Knopf** an einem Spielmodus erklärt **nur diesen Modus** in einem Satz und hat einen Knopf **„Alle Regeln“**, der das Regelfenster öffnet; er wählt den Modus nicht aus (ein Info-Knopf ändert nie die Einstellung, in deren Feld er steht). Das Fenster „Aus Spielerliste wählen“ hat einen Knopf **„Spielerliste verwalten“**, der das Verwaltungsfenster der gespeicherten Spieler öffnet.
3. **Inhalt [ist]**, immer in genau dieser Reihenfolge (das Feld „Spieler und Teams“ gehört **nicht** mehr ins Hauptmenü, siehe 2.1a):
   - Feld **Spieleinstellungen**: nur Einstellungen, die den Ablauf des Spiels bestimmen (bei mehreren Modi zuerst der Spielmodus, dann die Gruppen des gewählten Modus),
   - bei Bedarf weitere Felder für Einstellungen, die **nicht** vom Spielmodus abhängen, getrennt von den Spieleinstellungen (bei Tabu das Feld **Karten** mit Kartensprache, Schwierigkeit und Kategorien; die Kartenquelle ist vorerst abgeschaltet, `ADR-024`).
4. **Starten [ist]:** der Knopf steht ganz unten und ist **immer fest am unteren Rand**, bei kurzem wie bei langem Inhalt.

**Sprachen:** Die Einstellungen des GameHub (Knopf in der Kopfleiste) enthalten **nur die Oberflächensprache**. Die Sprache der Inhalte (bei Tabu die Kartensprache) ist eine Einstellung des Spiels und steht als erste Knopfgruppe im Feld der Inhalte (bei Tabu „Karten“; Englisch links, Deutsch rechts). Ein Spiel bekommt dafür `cardLanguage` und `onCardLanguageChange` vom Spielmodul-Vertrag; die App speichert die Wahl weiterhin zentral.

**Spielmodus:** Hat ein Spiel mehrere Modi, steht die Knopfgruppe **Spielmodus** als erste Gruppe in den „Spieleinstellungen“. Der Modus bestimmt, welche weiteren Gruppen dort sichtbar sind; die Werte aller Modi bleiben beim Wechseln erhalten. Einstellungen, die nicht vom Modus abhängen (bei Tabu Kartensprache, Kartenquelle, Schwierigkeit, Kategorien), stehen in einem eigenen Feld.

Die Felder des Inhalts sind **Reiter** (`SetupTabs`, geändert am 2026-11-14, `ADR-026`): bei Tabu **„Spieleinstellungen“** (zuerst gewählt) und **„Karten“**, die Reiter stehen nebeneinander in gleicher Breite oben, der gewählte ist mit der Inhaltsbox darunter verbunden (gleiche Farbe, die Linie darüber fehlt), die anderen sind dunkler. Tipp oder Pfeiltasten (links, rechts, Pos1, Ende) wechseln den Reiter. **Alle Reiter bleiben im Formular**, die nicht gezeigten sind nur ausgeblendet; ihre Eingaben zählen beim Start. Fehlt beim Start eine Kategorie, öffnet sich der Reiter „Karten“ mit der Meldung. Der Kapitel-Baustein `SetupSection` (aufklappbar) bleibt nur noch in der Datenansicht (Editor).

### 2.1a Aufstellung (nach „Starten“, `ADR-023`)

Der Knopf „Starten“ im Hauptmenü führt zur Ansicht **Aufstellung**; erst ihr Knopf „Spiel starten“ startet das Spiel.

- **Inhalt [ist]:** Zwei **Reiter** „Spieler (4)“ und „Teams (2)“ (mit der Anzahl), je nach `LineupConfig` des Spiels (bei einem Spiel nur mit einem der beiden Bereiche steht nur dieser Reiter; vorausgewählt ist „Spieler“ bei Pflicht-Spielern, sonst „Teams“, `ADR-026`) (`ADR-025`, am 2026-11-14 nach dem bewährten Muster „Auslosen und Ergebnis“ vereinfacht: **sehr einfach, aber kompakt**, kein Ziehen, keine Teamauswahl in der Spielerliste, kein Bearbeitungsmodus): **„Spieler“** und **„Teams“**; die Reihenfolge ist erst Spieler, dann Teams. Die Überschrift zeigt rechts eine Kurzinfo („Spieler: 4“, „Teams: 2“). **Jedes Spiel merkt Spieler und Teams** beim Start und bietet sie wieder an: oben in der Box „Spieler“ der Knopf „Letzte Spieler laden“, oben in der Box „Teams“ **nebeneinander je halbe Breite „Letzte Teams laden“ (die Teams kommen mit den Spielern, die in ihnen stehen: fehlen sie in der Liste, werden sie ergänzt) und „Teams leeren“** (Namen und Zuordnungen löschen, die Spieler bleiben; ein erster Tipp macht den Knopf rot („Sicher?“), der zweite leert). Diese Knöpfe sind **immer sichtbar** und nur **nicht bedienbar, wenn sie nichts ändern würden** (nichts gemerkt, nichts zu leeren). Es gibt keinen Knopf „alle Spieler entfernen“ (Spieler löscht man einzeln mit dem Papierkorb). **Box „Spieler“:** Feld „Spieler hinzufügen“ mit Plus-Knopf (mehrere Namen mit Komma gehen auch), „Aus Spielerliste wählen“ und darunter **eine einfache Liste, eine Zeile pro Spieler, alphabetisch**: Name und Papierkorb zum Entfernen. **Box „Teams“ (Muster „Auslosen und Ergebnis“, mit Drag and Drop, geändert am 2026-11-14):** Teamanzahl; **ein Knopf „Teams auslosen“** (nach dem Auslosen „Neu mischen“; erst ab zwei Spielern bedienbar, ohne Spieler nicht da); **pro Team eine Box (Karte)**, die Namensfeld und das Feld mit den Spielern zusammenfasst: oben der Name, darunter ein dunkleres Feld mit den Spielern als **kleine Namensknöpfe (alphabetisch, 44 Pixel hoch wie jeder Knopf)**, das beim Ziehen aufleuchtet (sobald es Spieler gibt, ist das Feld auch leer da, damit man hineinziehen kann); Spieler ohne Team warten in einer gleich aufgebauten Box **„Ohne Team (Spieler in ein Team ziehen)“** (nur da, wenn es solche gibt, und beim Ziehen). **Ein Spieler kommt auf zwei Wegen in ein Team: per Drag and Drop (Maus oder Finger) oder per Tipp** (auch mit der Tastatur); die Karte unter dem Zeiger leuchtet, der Name folgt dem Zeiger, am Bildschirmrand scrollt die Seite mit. Ein Name lässt sich auch von Team zu Team ziehen. **Ein Tipp auf einen Spieler** (im Team oder in „Ohne Team“) öffnet ein Fenster „Team für …“ mit allen Teams und „Ohne Team“ (das aktuelle ist markiert); die Wahl gilt sofort, „Ohne Team“ nimmt ihn aus dem Team. So ist die Zuordnung auch ohne Ziehen bedienbar (Barrierefreiheit). Zuletzt die **Teamreihenfolge** (geändert am 2026-11-14): alle Teams stehen **untereinander mit festen Plätzen** („1.“, „2.“, „3.“ …), das oberste Team beginnt (Platz 1 ist farbig). **Jedes Team lässt sich am Griff (sechs Punkte) per Drag and Drop** mit Maus oder Finger an einen anderen Platz ziehen, die übrigen rücken nach; mit der Tastatur verschieben die Pfeiltasten auf dem Griff um einen Platz. Zwei Knöpfe in halber Breite: **„Standard“ links** (Team 1, 2, 3 …, gesperrt, wenn es schon so ist) und **„Zufällig“ rechts** (mischt alle Teams, das oberste beginnt). Der Griff hat **keinen Rahmen** (Ausnahme der Regel „jeder Knopf hat einen Rahmen“, auf Wunsch des Auftraggebers), die Tippfläche bleibt 44 Pixel. Die Zeilen sind **kompakt** (etwa 36 Pixel hoch, der Griff reicht über den Zeilenrand). Die Reihenfolge ist immer konkret gespeichert; das Spiel nimmt genau sie, Standard ist Team 1, 2, 3 …. Spiele ohne Namen (Tabu) lassen „Spieler“ eingeklappt, Spiele ohne Teams zeigen nur „Spieler“. **Startregeln:** Das Spiel legt in seiner `LineupConfig` fest, was mit **Spielern ohne Team** beim Start geschieht (`unassignedPlayers`): `ignore` (sie werden übergangen, **Tabu**, weil das Spiel keine Namen braucht), `assign` (sie kommen automatisch in die kleinsten Teams, **Standard für neue Spiele**, niemand wird vergessen) oder `block` (der Start wird mit einer Meldung verhindert). Zu wenige oder zu viele Spieler verhindern den Start immer mit einer Meldung (`validateLineup`; `resolveLineup` verteilt bei `assign`). Enter im Feld fügt hinzu und startet nicht das Spiel.
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

Die Spielauswahl ist auf dem Handy kompakt: Kopfleiste mit „GameHub“ links (ohne Farbpunkt; die Spielauswahl ist das Zuhause, dort gibt es keinen Home-Knopf) und rechts dem Textknopf **Spieler** (Symbol und Text, weil das Symbol allein nicht selbsterklärend ist) und dem Symbolknopf **Einstellungen**; darunter sofort die Spiele als Karten. Überschrift und Einleitung sind nur für Screenreader da (ab Tabletbreite sichtbar). Der Spielerknopf der Spielauswahl steht in der Kopfleiste, nicht im Inhalt.

### 2.4 Unteransichten und die Kopfleiste

In allen Ansichten außer dem Hauptmenü, also in Spielansichten und im Editor, zeigt die Kopfleiste **nur interne Navigation oder „Spiel beenden“**. Es gibt dort **keinen Home-Knopf und keinen Knopf für Spracheinstellungen** **[ist]**. Ein Spiel verlässt man nur über das Hauptmenü.

### 2.4a Ergebnisse korrigieren

In **allen Spielmodi** lässt sich ein Ergebnis nachträglich korrigieren, weil ein Fehler beim Drücken passieren kann (zum Beispiel „Richtig“, obwohl ein verbotenes Wort fiel). Die Karten stehen in einer Liste (grün = richtig, rot = falsch, grau = übersprungen und nicht änderbar); ein Tipp schaltet zwischen richtig und falsch um, Wertung und Sieger werden neu berechnet. Klassisch: Liste der Runde in der Rundenübersicht. Stechen und Auf Zeit: Feld „Ergebnis korrigieren“ mit einem aufklappbaren Eintrag pro Team in der Übersicht zwischen den Durchgängen und auf der Endseite. Neue Spielmodi bieten dasselbe an (Baustein `TabooReviewList` beziehungsweise `TabooAttemptReviews`).

### 2.4b Kategorien in der Kartenansicht

Bei jeder Kategorie steht nur die **Kartenanzahl**. Die **Standardkategorien** gibt es in Deutsch und Englisch; das steht als Hinweis in der Kartenansicht (Überschrift der Gruppe), nicht im Hauptmenü. **Eigene Kategorien** gehören zu einer Sprache; sie zeigen sie hinter dem Namen, zum Beispiel „(DE)“, überall, wo sie vorkommen.

**Eigene Karten und Kategorien:** Der erste Buchstabe von Begriff und verbotenen Wörtern wird automatisch groß geschrieben. Eigene Kategorien lassen sich umbenennen (Name nicht leer, nicht schon vergeben, erster Buchstabe groß). **Zwei Knöpfe in einer Zeile teilen sich die ganze Breite und sind gleich breit.** **Knöpfe und Felder in einer Zeile haben dieselbe Höhe, stehen auf einer Linie und haben deutlichen Abstand** (nicht nur im Test, sondern im Browser angesehen). Beim Hinzufügen und Bearbeiten sind nur **eigene Kategorien** wählbar, nicht die Standardkategorien. Eine eigene Kategorie hat **Name und Sprache**, die Sprache wird beim Anlegen festgelegt und gilt für alle Karten darin. Hauptaktionen wie „Karte hinzufügen“ sind grün.

**Englisch ist die primäre Sprache (Auftraggeber, 2026-11-13):** Bei jeder Auswahl einer Sprache ist Englisch die Voreinstellung und steht als **erstes Element** in der Liste, danach Deutsch. Bei der Sprache einer neuen eigenen Kategorie ist Englisch voreingestellt, nicht die Kartensprache der Spieleinstellungen.

### 2.5a Hilfekonzept: Spielregeln erklären alles, die i-Knöpfe nur Einzelnes (2026-11-15)

Auf Wunsch des Auftraggebers und nach üblichen Mustern (Info-Symbol für kurze Erklärung genau dort, längeres im Hilfe-Bereich; kurz halten, Beispiele zeigen) gilt:

- **Spielregeln** (Knopf in der Kopfleiste, 2.1): erklären **alles** in kurzen Teilen mit Überschrift, möglichst **mit Bild** (Beispielkarte, Knöpfe in ihren echten Farben) und in der Reihenfolge eines Spiels. Pro Zeile höchstens etwa 100 Zeichen.
- **i-Knöpfe**: erklären **nur diese eine Einstellung**, in **einem bis zwei kurzen Sätzen** (höchstens 2 Zeilen, etwa 190 Zeichen), ohne die allgemeinen Regeln zu wiederholen, und **ohne Werte zu wiederholen, die in den Auswahlknöpfen darunter schon sichtbar sind** (bei „Überspringen pro Runde“ genügt ein Satz; „Runden pro Team“ ist selbsterklärend und hat **keinen** i-Knopf). Einen i-Knopf gibt es nur dort, wo eine Einstellung nicht selbsterklärend ist.
- Beides ist in Deutsch und Englisch kurz und einfach geschrieben; ein Test (`helpTexts.test.ts`) hält die Längen ein.
- Ein neues Spiel liefert für beides nur Texte: ein Regelfenster aus `RulesSection`en und die kurzen i-Texte.

### 2.5 Infofenster

**Lage und Größe:** Jedes Fenster steht **mittig** mit Rand, auf dem Handy wie am PC (höchstens 34 rem breit). Ein Fenster mit Reitern behält für alle Reiter **dieselbe Größe**, damit sich Reiter und Knöpfe beim Wechseln nicht verschieben.

Es gibt **ein** Infofenster für alles (Spielregeln, Erklärungen, Auswahl, Einstellungen, Spielerverwaltung, Auswahl aus der Spielerliste), den Baustein `Dialog` **[ist]**. Es besteht immer aus:

1. Überschrift oben links,
2. Schließen-Knopf oben rechts (mit Rahmen, ohne Bestätigung),
3. darunter der Inhalt (bei Bedarf mit einem Text direkt unter der Überschrift).

Weitere Fenstertypen gibt es nicht. Das Fenster hängt an der Seite selbst (nicht an dem Element, das es auslöst), damit weder Kopfleiste noch andere Elternelemente seine Lage verändern.

**Fenster mit Listen (Spielerverwaltung, Auswahl aus der Spielerliste) [ist]:** Die Listenfläche hat immer dieselbe Höhe, das Fenster ändert seine Größe nicht mit der Zahl der Einträge; sind es mehr Einträge als Platz, erscheint ein Scrollbalken. Fehlermeldungen haben eine feste Zeile, damit sich nichts verschiebt. Löschknöpfe stehen **neben** der Zeile, nicht in ihrem Rahmen; der Name steht in einer eigenen Box. Ein Fenster ist kurz; was länger als ein Bildschirm ist, wird eine Unteransicht.

## 3. Theme und Bedienelemente

1. **Einheitlich [ist]:** Alle Bedienelemente (Knöpfe, Felder, Auswahlgruppen, Boxen) sehen in jedem Spiel gleich aus. Sie kommen aus `components` und `game-kit`, nicht aus Spielstilen. Spielstile (`styles/games/<spiel>.css`) legen nur den **Inhalt** des Spiels aus, nie das Aussehen der Bedienelemente.
2. **Ein Theme [ist]:** Farben, Abstände, Radien und Schrift stehen als Token in `tokens.css`. Kein Spiel setzt eigene Farbwerte.
3. **Später:** Jedes Spiel kann eine eigene **Sekundärfarbe** bekommen. Sie wird als Token (Akzentfarbe des Spiels) gesetzt und von den Bedienelementen gelesen; heute gibt es dafür schon `data-accent` im Katalog. Das ist noch nicht gebaut und wird nicht vorweggenommen.

## 4. Eingaben

1. **So wenige Eingabefelder wie möglich.** Wo eine Auswahl oder ein Tippen genügt, wird kein Textfeld benutzt. Eine Auswahl aus wenigen festen Möglichkeiten (Sprache, Teamanzahl, Schwierigkeit) ist immer **eine zusammenhängende Knopfleiste** (`ChoiceGroup`: gleich breite Knöpfe ohne Lücken, der gewählte farbig, wie ein Segmented Control „1 | 2 | 3“), keine Combobox. **Dieselbe Leiste** ist auch der Umschalter zwischen zwei Ansichten (zum Beispiel „Standard | Eigene“ bei den Karten, Legende nur für Screenreader); jede neue feste Einstellung wird so gebaut. Die Einstellungen (Oberflächen- und Kartensprache) folgen dem schon. **Comboboxen entfallen (2026-11-15):** Auch Sprache der Kategorie und Schwierigkeit beim Karteneintrag und im Karteneditor sind `ChoiceGroup`en. **Feste Einstellungen mit wenigen Werten sind nie eine Auswahlliste;** nur eine lange, wechselnde Liste (die **Kategorie** beim Karteneintrag) bleibt eine Auswahlliste (`select`).
2. Mehrzeilige Felder sind nicht in der Größe veränderbar und wachsen mit dem Inhalt **[ist]**.
3. Schriftgröße in Feldern mindestens 16 Pixel, jedes Feld hat eine Beschriftung **[ist]**.

## 5. Knöpfe

1. **Einheitlich:** Alle Knöpfe sehen gleich aus, **außer** begründeten Ausnahmen (Kopfleiste mit Symbolknöpfen, Hauptaktion unten in Vollbreite, Auswahlkarten in `ChoiceGroup`). Eine Ausnahme wird hier eingetragen, bevor sie gebaut wird.
2. **Farben:**
   - **Rot:** löschen, entfernen, abbrechen. Das gilt immer **[Umbau]**: der Knopf „Abbrechen“ im Karteneditor ist heute grau.
   - **Grün:** hinzufügen, starten, speichern, bestätigen **[ist]**.
   - Grau umrandet: Nebenaktionen ohne Wertung (Importieren, Exportieren).
3. **Feste Bestätigung [ist]:** Bestimmte Knöpfe verlangen eine Bestätigung. **Aussehen:** Vor dem ersten Tippen ist der Knopf ein **dezentes Rot** (getönter Hintergrund, rote Linie), nach dem ersten Tippen ein **kräftiges, deckendes Rot**; das ist das Signal für den zweiten Tipp. **Knöpfe nur mit Symbol (Papierkorb) zeigen dabei keinen Text**, weder davor noch danach: Der Text passt nicht in den Knopf und ist überflüssig, die Farbe sagt es; für Screenreader ändert sich der Name („Nochmal tippen, um … zu entfernen“). Breite Knöpfe mit Text (zum Beispiel „Kategorie löschen“) dürfen ihren Text behalten. Das sind alle Aktionen, die Daten oder einen Spielstand unwiderruflich entfernen (Karte löschen, Kategorie löschen, Spiel beenden, Neustart). Sie sind `ConfirmButton`: erstes Tippen schaltet scharf und zeigt „Nochmal tippen“, zweites Tippen führt aus. Kein Bestätigungsfenster.
4. **Spielentscheidende Knöpfe stehen in der Regel unten [ist]**: starten, nächste Runde, Richtig, Überspringen, Auswerten.
5. **Knopfreihen:** gleich breit und gleich hoch (44 Pixel), Reihenfolge von links nach rechts: bestätigen, löschen, abbrechen **[ist]**.
6. **Hinzufügen-Knopf:** In kompakten Zeilen mit einem Eingabefeld (Spieler hinzufügen) genügt ein **Plus-Symbol** statt des Texts „Hinzufügen“ (Beschriftung für Screenreader und Tooltip bleiben). Namen von Spielern werden automatisch korrigiert: der erste Buchstabe ist ein Großbuchstabe.
7. **Platzsparend, Symbol allein wenn selbsterklärend:** Knöpfe sind so kompakt wie möglich. Ist ein Symbol ohne Text eindeutig (zum Beispiel bearbeiten, speichern, löschen, schließen, Einstellungen, Home, Info), steht nur das Symbol, mit Beschriftung für Screenreader und Tooltip. Aktionen, die ein Symbol nicht eindeutig sagt (zum Beispiel Abbrechen, Importieren, Exportieren, Starten, Spielregeln), behalten ihren Text. Im Zweifel gilt: Text, bis ein Symbol im Test von Auftraggeber und Nutzern als klar gilt **[ist]**.
8. **Mindestgröße:** 44 mal 44 Pixel **[ist]**.

## 6. Weitere feste Regeln

1. **Meldungen** (Fehler, Rückmeldungen, Bestätigungen) sind **Benachrichtigungen** (`Toast`): ein kleines Feld **immer unten**, das **nach einigen Sekunden von allein verschwindet**, keinen Platz in der Seite braucht und keine Eingaben abfängt. Es gibt **keine Meldungsboxen mehr in der Seite** und keine Fenster für Meldungen. Sie sind **auffällig, sehen aber nicht wie Knöpfe aus** (Knöpfe sind gefüllt): dunkler Grund, dicker Rand und ein rundes Symbol in der Farbe der Meldung (Fehler rot mit „!“, Erfolg grün mit „✓“, Hinweis blau mit „i“), fette Schrift, ohne Schatten. Der Text steht in der Höhe mittig, und bei mehreren Zeilen wächst die Benachrichtigung mit. **Längere Meldungen bleiben länger sichtbar** (3 Sekunden plus etwa 60 Millisekunden je Zeichen, mindestens 5, höchstens 15 Sekunden). Kurze Meldungen haben **keine Überschrift** (nur den Satz, zum Beispiel „Karte hinzugefügt.“). Fehler melden sich als `alert`, alles andere als `status`. Eine Meldung, die noch gilt, erscheint bei jedem neuen Versuch erneut (neuer `key`, Hilfsmittel `useNotice`) **[ist]**.
2. **Leere Zustände** mit `EmptyState` und einer Handlung **[ist]**.
3. **Sortierung:** Standard-Einträge vor eigenen, alphabetisch; Karten nach Schwierigkeit, leicht zuerst; eigene bearbeitbar, mitgelieferte nur lesbar **[ist]**.
4. **Texte:** alle sichtbaren Texte in Deutsch und Englisch in den Übersetzungsressourcen, gemeinsame im Namensraum `kit`; UI-Sprache und Kartensprache getrennt **[ist]**.
5. **Handy [ist]:** eine Spalte, 16 Pixel Seitenrand. **PC [Phase Al-08]:** dieselben Ansichten, nur das Raster ändert sich und liegt allein in den Kit-Bausteinen.
6. **Layoutprüfung:** Jede Ansicht jedes Spiels wird im e2e-Test auf kleinen und großen Handys geprüft **[ist für Tabu]**.

## 7. Bausteine

Alle Ansichten bestehen aus diesen Bausteinen im `game-kit` und in `components`; ein Spiel baut keine eigenen Rahmen.

| Ansicht | Baustein |
|---|---|
| Aufstellung | `LineupScreen` (Meldungen, Teams und Spieler als Reiter mit `TeamsSetup` und `PlayersSetup` (`LineupSetup`), Startknopf unten fest) |
| Hauptmenü | `SetupScreen` (Rahmen mit Meldungen, Felder als Reiter `SetupTabs`, Startleiste; die Regeln öffnen aus der Kopfleiste im Regelfenster mit `RulesView`, der Editor ein Knopf im Reiter der Inhalte), darin `ChoiceGroup` (Optionen können einen eigenen Infoknopf haben, zum Beispiel die Regeln eines Spielmodus), darin `TeamsSetup` oder `PlayersSetup`, `ChoiceGroup`, `InfoButton` |
| Editor | `ManageScreen` (Titel, Hinweis, Kapitel als `SetupSection`, Aktionsreihe, Meldungen) |
| Zwischenstand und Endstand | `ScoreScreen` (Überschrift, optional Sieger, Punktestand, weitere Inhalte, Hauptaktion unten); der Endstand ist derselbe Baustein mit `winner` |
| Das eigentliche Spiel | `TimerHud`, `StartBar` und Inhalt des Spiels |
| Infofenster | `Dialog` |
| Knopfreihe | `ActionRow` (gleich breit, gleich hoch, Reihenfolge wie übergeben) |
| Spielerverwaltung | `PlayerRosterButton` (Knopf und Fenster: hinzufügen, löschen) und `RosterPicker` (Auswahl aus der Liste im Feld „Teams und Spieler“) |
| Weiteres | `ConfirmButton`, `Button`, `Toast`, `EmptyState`, `Scoreboard`, `TurnStrip` |

Entscheidung: Es gibt bewusst **keinen** zusätzlichen `GameMenu`- und keinen `FinalScreen`-Baustein. `SetupScreen` ist das Hauptmenü, `ScoreScreen` deckt Zwischen- und Endstand ab (so wenige Bausteine wie möglich).

## 8. Umbau von Tabu (`Al-09-05`, erledigt)

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
