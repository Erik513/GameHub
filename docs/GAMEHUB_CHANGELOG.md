# GameHub Changelog

Alle wichtigen Projektänderungen werden in dieser Datei dokumentiert.

## 2026-11-16

### Schwimmen geplant

- Schwimmen als Online-Spiel mit zwölf Aufgaben für Regeln, Spiellogik, Mehrspieler, Ansichten und Abnahme aufgenommen.

## 2026-11-15

### Neue Arbeitsregel: ein Branch pro Spiel

- Auf Wunsch des Auftraggebers wird **jedes Spiel in einem eigenen Branch entwickelt** (Annahme für den Namen: `game/<spiel-id>`). Zusammengeführt wird erst nach Freigabe. Die Regel steht in `AGENTS.md`. Bereits auf `main` liegende Tabu-Arbeit bleibt dort.

## 2026-11-14

### One-Pager: Reiter füllen den Bildschirm, nur der Reiterinhalt scrollt

- **Spieler im Reiter „Teams“ entfernen (2026-11-17):** Im Fenster „Team von …“, das ein Tipp auf einen Spieler öffnet, steht jetzt zuunterst ein roter Knopf **„Spieler entfernen“** (Text `kitPlayers.removePlayer`). Er löscht den Spieler aus der Liste und aus seinem Team. Test in `TeamsSetup.test.tsx`.
- **Spieler-Reiter wie der Teams-Reiter (2026-11-17):** Oben stehen nebeneinander je halbe Breite **„Letzte Spieler laden“** und **„Spieler leeren“** (zweiter Tipp nötig, deaktiviert ohne Spieler; löscht auch die Teamzuordnung, Teams und Namen bleiben). Neue Texte `kitPlayers.clear` und `kitPlayers.clearConfirm`, neuer Test in `TeamSetupMemory.test.tsx`.
- **Teamreihenfolge überarbeitet (2026-11-17):** Der Knopf „Standard“ entfällt. „Zufällig“ ist jetzt ein Würfel-Symbolknopf (Name „Zufällige Reihenfolge“ als Tooltip und für Screenreader) rechts in der Überschriftzeile. Der Würfelknopf hat die neue allgemeine Form **`kit-heading-button`** für jeden Knopf neben einer Überschrift: flach (32 px) und breit statt quadratisch, die Tippfläche bleibt durch eine unsichtbare Schicht 44 px hoch (die Layoutprüfung zählt sie mit). Der Info-Knopf steht direkt neben der Überschrift „Teamreihenfolge“, und ein Tipp auf die Überschrift öffnet ebenfalls das Infofenster. Info-Text angepasst, neues Symbol `shuffle`, Test für beide Wege zum Infofenster.
- **Neuer Einstieg bei Tabu (2026-11-17):** Tabu öffnet jetzt direkt auf **„Spieler und Teams“** (Aufstellung mit den Reitern Spieler | Teams). Links neben „Spiel starten“ in der Startleiste steht ein Knopf nur mit dem **Symbol** (Regler; Name „Spieleinstellungen“ als Tooltip und für Screenreader), der die Einstellungen als **eigenen Bildschirm** öffnet (Reiter „Spieleinstellungen | Kategorien“, Pfeil zurück in der Kopfleiste, unten „Fertig“). Der alte Knopf „Starten“ im Hauptmenü entfällt; **„Spiel starten“** gibt es nur noch in der Aufstellung und liest dabei die Einstellungen aus dem (verborgen weiter vorhandenen) Formular, fehlt eine Kategorie, öffnen sich die Einstellungen bei „Kategorien“ mit der Meldung. Der Knopf „Spielregeln“ steht in der Aufstellung in der Kopfleiste. `LineupScreen` hat dafür `sideAction` (die `StartBar` zeigt den Knopf links neben dem Hauptknopf), `SetupScreen` `formRef`; neues Symbol `sliders`. Die Kopfleiste kennt jetzt mehrere gleichzeitig aktive Zurück-Aktionen (Einstellungen und darüber die Kartenverwaltung): wird die oberste entfernt, gilt wieder die darunter (`GameChrome`, vorher ging der Zurückpfeil der Einstellungen nach der Kartenverwaltung verloren). Tests und E2E auf den neuen Ablauf umgestellt, Hilfsfunktionen `openGameSettings`/`closeGameSettings`.
- Auf Wunsch des Auftraggebers („alles muss ein One-Pager sein“): Hauptmenü und Aufstellung scrollen als Seite nie. Die Reiterleiste bleibt fest, die Box des Reiters füllt den Platz bis zum Startknopf (alle Reiter gleich hoch) und scrollt bei langem Inhalt für sich. Code: Klasse `kit-onepage` in `SetupScreen`/`LineupScreen`, Stile in `kit-setup.css`; `usePlayerDrag` scrollt beim Ziehen die Reiterbox statt der Seite. Neue Prüfung in `e2e/mobile-layout.spec.ts` (keine Seitenscrolls auf Ein-Seiten-Bildschirmen). Im Browser bei 375×812 geprüft; auf einem echten Handy noch nicht.
- **Karteneditor** ("Karten verwalten") jetzt mit zwei Reitern: links **Karten** (Liste nach Kategorien), rechts **Karte hinzufügen**; Import und Export fest unten; der Hinweistext unter dem Titel entfällt (Schlüssel `tabooLibrary.hint` ersetzt durch `tabooLibrary.cardsTab`). `ManageScreen` nimmt dafür `tabs` statt Kindern.
- **Überarbeitung nach Rückmeldung (2026-11-15):** (1) dünne, unauffällige Scrollleiste überall; (2) Fenster (zum Beispiel Spielregeln): **Titel und Schließen-Knopf bleiben beim Scrollen stehen**; neuer Baustein `TabPane` (feste Kopf- und Fußzeile, nur die Mitte scrollt); (3) Reiter „Karte hinzufügen“: der Knopf „Hinzufügen“ steht fest unten; (4) Reiter „Karten“: **Import und Export** stehen fest unten in diesem Reiter; (5) Karten in **zwei Ansichten „Standard | Eigene“**: nur noch eine Liste der Kategorien (Name, Anzahl, Pfeil), das Auf- und Zuklappen entfällt, ein Tipp öffnet die Ansicht der Karten der Kategorie (ansehen und bearbeiten, Zurück-Knopf, bei eigenen Kategorien Umbenennen und Löschen). Neue Texte `tabooList.views/back/noOwnCategories`, Schlüssel `tabooList.groups.ownCategories/standardCategories` entfallen. 658 Unit-Tests grün.
- **Karteneditor, Feinschliff:** Zurück-Knopf, Kategoriename und Kartenanzahl stehen auf einer Mittellinie; **beim Bearbeiten einer Karte ist nur diese Karte zu sehen** (die anderen Karten und Umbenennen/Löschen der Kategorie sind ausgeblendet, bis gespeichert, gelöscht oder abgebrochen wird). **Nach dem Umbenennen bleibt die Kategorie geöffnet** (mit dem neuen Namen) statt zur Liste zurückzuspringen. 659 Unit-Tests grün.
- **Rückmeldung per Meldung unten (2026-11-15):** Karte hinzufügen (schon vorhanden), **Karte gespeichert, Karte gelöscht, Kategorie gelöscht, Kategorie umbenannt, Karten importiert und exportiert** werden mit einer kurzen Meldung unten bestätigt (Fehler bleiben rot). Neue Texte `tabooList.cardSaved/cardDeleted/categoryDeleted`, `tabooLibrary.exported`.
- **Scrollleiste am Rand (2026-11-15):** In Reitern und Fenstern sitzt die Scrollleiste jetzt dicht am Rahmen (4 px Abstand) statt neben dem Inhalt; der Inhalt bleibt an seiner Stelle. **Fehler behoben:** In einem Fenster mit mittlerer Höhe ragte der Bereich des Reiters über den Bildschirm und der feste Startknopf verdeckte den unteren Rand des Reiters (der Rahmen `taboo-setup__screen` durfte nicht schrumpfen); die Layout-Prüfung meldet jetzt, wenn ein Bereich zu hoch ist oder der Reiter unter den Startknopf ragt.
- **Keine Auswahllisten mehr beim Hinzufügen und Bearbeiten von Karten (2026-11-15):** Sprache der Kategorie und Schwierigkeit sind jetzt die gemeinsamen Auswahlknöpfe (`ChoiceGroup`, neu mit `columns`; Schwierigkeit in den Farben Einfach/Mittel/Schwer) statt Dropdowns. Die **Kategorie bleibt eine Auswahlliste** (viele, wechselnde Einträge). Der Knopf „Karte hinzufügen“ hat die volle Breite. Regel: auf Auswahllisten (`select`) wird, wo es geht, verzichtet.
- **Eine Auswahlleiste für alles (2026-11-15):** `ChoiceGroup` zeigt Einstellungen jetzt als **zusammenhängende Knopfleiste** ohne Lücken (gewählter Knopf farbig, erster und letzter Knopf mit runden Außenecken); der Umschalter „Standard | Eigene“ bei den Karten nutzt dieselbe `ChoiceGroup` (neu `hideLegend`), der Sonderbaustein `kit-segmented` entfällt. Mehrfachauswahl der Kategorien im Reiter „Karten“ des Hauptmenüs bleibt einzelne Knöpfe (mehrere zugleich wählbar).
- **Fokusrahmen nicht mehr abgeschnitten (2026-11-15):** Der Fokusrahmen (Tastatur) von Knöpfen und Feldern am Rand eines scrollenden Bereichs (Reiterinhalt im Karteneditor, Inhalt der Fenster) wurde vom Bereich abgeschnitten. Die Bereiche haben jetzt Platz um den Inhalt (`--focus-room`) und nehmen ihn mit negativem Rand zurück, damit nichts verrutscht.
- **Überschrift des Karteneditors:** „Eigene Tabu-Karten“ / „Custom Taboo cards“ passte nicht (der Bildschirm zeigt Standard- und eigene Karten) und heißt jetzt **„Tabu-Karten“ / „Taboo cards“**.
- **Einrasten beim Scrollen (2026-11-15):** Listen aus Blöcken (Kategorien, Karten einer Kategorie, Spiele der Spielauswahl) rasten beim Scrollen auf ganze Einträge ein (`scroll-snap`), sodass oben nie ein Eintrag angeschnitten stehen bleibt. Ausnahme: Ganz am Ende der Liste steht der letzte Eintrag vollständig unten, dann kann der oberste angeschnitten sein. Im Browser gemessen (Kategorieliste). Fließtext (Spielregeln) und Formulare rasten nicht.
- **Spielregeln:** zwischen den Kapiteln steht eine dünne Trennlinie.
- **Schwierigkeit im Hauptmenü:** Die Einstellung „Alle“ entfällt. Die Überschrift heißt jetzt **„Schwierigkeit (mehrere möglich)“** / „Difficulty (several possible)“, zu Beginn ist nur **Einfach** gewählt (so sieht man sofort, was aktiv ist; bei drei gewählten Knöpfen erkennt man „alle“ nicht gut), eine bleibt immer gewählt. `ChoiceGroup` kann dafür eine Mehrfachauswahl ohne „Alle“-Option (neu: `initial` als Liste). Der Satz „Du kannst mehrere wählen.“ im Info-Text entfällt (steht jetzt in der Überschrift).
- **Namen und feste Stelle (2026-11-15):** Der Reiter im Hauptmenü heißt **„Kategorien“** (vorher „Karten“), der Knopf zum Editor **„Kategorien und Karten“** (vorher „Karten“). Der Knopf steht **fest oben** im Reiter (feste Kopfzeile, `TabPane`) und scrollt nicht mit. Der linke Reiter im Editor heißt weiter „Karten“.
- **Import und Export nur dort, wo sie passen:** Die Knöpfe stehen nur noch in der Liste der **eigenen** Kategorien („Eigene“). In der Ansicht „Standard“, in einer geöffneten Kategorie und beim Bearbeiten einer Karte waren sie verwirrend (Import und Export betreffen eigene Karten und Kategorien, nicht die geöffnete Karte) und sind dort ausgeblendet.
- **Textprüfung Deutsch und Englisch (2026-11-15):** Alle Texte gelesen und angeglichen. (1) Die Meldung bei leerer Spielerliste verwies auf den Knopf „Spieler“ im Hauptmenü (der dort nicht mehr steht) und nennt jetzt „Spielerliste verwalten“. (2) Das Stechen sprach im Deutschen von „Begriffen“, sonst überall von „Karten“; jetzt einheitlich „Karten“ (auch „Versuch im Stechen“). (3) „noch nicht gespielt“ beim Rennen und „noch offen“ beim Stechen sind jetzt beide „noch offen“; „Nochmal tippen zum Neustarten“ ist bei Runde und Lauf gleich. (4) Karten heißen in der Liste nun „Standardkarten“ / „Standard cards“, passend zur Ansicht „Standard“. (5) Rennen-Info: „dieselbe Mischung der Schwierigkeiten“ statt „gleich schwere Karten“ (Mehrfachauswahl). (6) Regeln: „Kategorien: welche Karten gespielt werden: Sprache, Schwierigkeit, Kategorien“, englisch „which cards are played …“, „it is the next team's turn“, „take turns playing rounds“, „Tap the own category you want to export“. Keine fest eingebauten Texte außerhalb der Übersetzungen gefunden.
- **„Kategorie löschen“:** Nach dem ersten Tipp bleibt der Text des Knopfes gleich, nur der Knopf wird kräftig rot (der lange Text „Nochmal tippen: n Karten löschen“ passte nicht hinein; Screenreader hören weiter die Rückfrage). Schlüssel `tabooList.deleteCategoryAgain` entfällt.
- **Eigene Kategorien näher an den Standardkategorien:** Im Reiter „Kategorien“ des Hauptmenüs bleiben die eigenen Kategorien **unter** den Standardkategorien; der Abstand zwischen den beiden Gruppen und zur Überschrift ist kleiner, damit man bei wenigen eigenen weniger scrollen muss.
- **Überschriften „Standard“ und „Eigene“ immer sichtbar:** Im Reiter „Kategorien“ des Hauptmenüs stehen beide Überschriften auch ohne eigene Kategorien; unter „Eigene“ steht dann „Noch keine. Lege sie unter „Kategorien und Karten“ an.“ (neuer Text `tabooSetup.noOwnCategories`, klein, grau und kursiv wie die Überschrift, damit er nicht auffälliger ist als sie).
- **Leiste nur für eine Auswahl (2026-11-17):** Die zusammenhängende Knopfleiste (`ChoiceGroup`) steht nur noch für „genau eine Auswahl“. Die Mehrfachauswahl (Schwierigkeit im Hauptmenü, `multiple`) zeigt einzelne Knöpfe mit Lücken, wie die Kategorien.
- **Keine unnötige Scrollleiste (2026-11-17):** Der Platz um den Inhalt für den Fokusrahmen (je 8 px oben und unten) ließ bei den Standardkarten eine Scrollleiste für ein paar Pixel entstehen. Der Fokusrahmen wird in scrollenden Bereichen jetzt **innen** gezeichnet (`outline-offset: -3px`), der Zusatzplatz entfällt.
- **Überschrift „Tabu-Karten“ entfällt:** Die Kopfleiste nennt das Spiel schon und die Reiter sagen, was man sieht; die Überschrift des Karteneditors ist nur noch für Screenreader da, der Reiter gewinnt eine Zeile Platz.
- **Abstand im Karteneditor:** Zwischen der Auswahl „Standard | Eigene“ und der Liste (allgemein zwischen fester Kopfzeile und Inhalt eines Reiters) steht jetzt der Abstand von 16 px statt 12 px.
- **Ansicht zwischen den Runden (2026-11-17):** Ein-Seiten-Ansicht wie die übrigen: oben „Runde n/m“, darunter der Inhalt in einer Box, unten fest „Team … / Runde starten“. Nach einer gespielten Runde zwei **Reiter „Punktestand | Letzte Runde (n)“** (die gespielten Karten mit der Wertung zum Ändern; zuerst ist der Punktestand offen), vor der ersten Runde nur der Punktestand ohne Reiter. `ScoreScreen` ist dafür ein One-Pager mit optionalem zweiten Reiter (`extraTab`) und gilt für alle Zwischen- und Endansichten (Ergebnis, Stechen, Rennen), deren Inhalt in der Box scrollt. Neue Texte `tabooRound.standingsTab/reviewTab`.
- **Rundenanzeige mit Fortschrittsbalken:** In der Ansicht zwischen den Runden steht ganz oben ein dünner Fortschrittsbalken (gespielte Züge von allen Zügen, zum Beispiel 1 von 6) und darunter „Runde n/m“. Bei „Unbegrenzt“ gibt es keinen Balken. Neuer Baustein `progress` in `ScoreScreen` (Rolle `progressbar` für Screenreader).
- **Neuer Punktestand (2026-11-17):** Jede Zeile ist größer und hat (1) einen **Balken**, der so lang ist wie die Punkte im Vergleich zum Führenden, (2) einen runden **Platz** (der Führende eine Krone, Platz 2 und 3 silber und bronze; gleiche Punkte teilen den Platz), (3) die große **Punktzahl**. Ohne Punkte gibt es keine Krone. Nach Rückmeldung bewusst **ohne** Abstand zum Führenden und **ohne** Marke für das Team, das als Nächstes dran ist (das steht schon über dem Knopf „Runde starten“; weniger Effekte). Symbol `crown`. Gilt für alle Ansichten mit `Scoreboard` (zwischen den Runden und Endstand). Neue Tests; die Tests lesen die Zeilen jetzt mit `testing/scoreRows.ts`.
- **Feinschliff Rundenansicht (2026-11-17):** (1) Am Spielende steht „Spiel zu Ende.“ / „Game finished.“ statt „Alle vorgesehenen Runden sind gespielt.“. (2) Der Teamname über „Runde starten“ nutzt jetzt die gleiche Schrift wie die übrigen Knöpfe (vorher die schmale Anzeigeschrift). (3) Im Punktestand steht beim Team, das gerade gespielt hat, klein und grün **„+3“**, die Punkte der eben gespielten Runde (eine korrigierte Wertung zählt sofort; „+0“ ist grau).
- **Laufender Zug (2026-11-17):** Fehler behoben: Auf einem kleinen Handy (360×640) verdeckten die Knöpfe unten die letzten verbotenen Wörter der Karte, weil die Seite nicht mehr scrollt. Der Zug füllt jetzt genau den Platz zwischen Kopfleiste und unterem Rand; die Karte bekommt den restlichen Platz und ist auf niedrigen Bildschirmen enger gesetzt (kleinere Abstände und Begriffsgröße), die Pausen-Karte mit ihren drei Knöpfen passt ebenfalls ohne Scrollen. Die Layout-Prüfung meldet jetzt, wenn ein verbotenes Wort von den Knöpfen verdeckt wird oder die Karte scrollen muss.
- **Abstand der Knöpfe im Zug:** Die Knöpfe „Verbotenes Wort“, „Überspringen“ und „Richtig“ haben unten jetzt 12 px Abstand zum Rand (plus den Sicherheitsabstand des Geräts) und kleben nicht mehr am Rand.
- **Zeitbalken oben (2026-11-17):** In allen Zügen (Klassisch, Rennen, Stechen) steht der Zeitbalken jetzt **ganz oben**, dünn wie der Fortschrittsbalken der Rundenansicht, und darunter der Block mit Teamname, Runde, Punkten und Zeit. So sehen beide Ansichten gleich aus.
- **Zug ohne Runde und Punkte:** Im klassischen Zug stehen über der Karte nur noch der Teamname und die Zeit; „Runde 1/3 · Punkte: 0“ entfällt, weil die Rundenansicht (Punktestand, „Runde n/m“) das zeigt. `TimerHud` kann ohne zweite Zeile (`meta`) benutzt werden; Rennen und Stechen zeigen dort weiter die Kartennummer. Text `tabooRound.score` entfällt.
- **„Runde beenden“ mit Bestätigung:** Im Pausenbild braucht „Runde beenden“ jetzt einen zweiten Tipp (der Knopf zeigt „Nochmal tippen zum Beenden“), wie „Runde neu starten“. Neuer Text `tabooRound.endRoundConfirm`.
- **„Versuch beenden“ mit Bestätigung (Stechen):** Im Pausenbild des Stechens braucht „Versuch beenden“ jetzt einen zweiten Tipp („Nochmal tippen zum Beenden“), wie „Runde beenden“ im normalen Zug. Das Stechen ist sonst dieselbe Ansicht wie ein Zug (gleiche Bausteine); die Zeile „Stechen · Karte n/3“ im Kopf bleibt bewusst stehen. Neuer Text `tabooTiebreak.endAttemptConfirm`.
- **Rennen (2026-11-17):** Fehler behoben: Die Zeilen der Zeiten (Rennen) und des Stechens waren seit dem neuen Punktestand zusammengequetscht („Tea / m 1“). Neuer Baustein `ResultList` (gleiche Zeilen wie der Punktestand: Balken, Platz mit Krone für den Besten, Name, Ergebnis groß, „noch offen“ klein und grau), genutzt von `TabooRaceResults` und `TabooTiebreakResults`. Beim Rennen und beim Stechen wird die Korrektur nach gespielten Läufen ein zweiter Reiter **„Zeiten | Karten prüfen“** (`ScoreScreen` mit `extraTab`, jetzt auch ohne Punktestand). Texte `tabooRace.partialCards`, `tabooTiebreak.resultCards`, `tabooReview.tab` neu; `tabooRace.partial` und `tabooTiebreak.result` entfallen.
- **„Auf Zeit“ wie „Klassisch“ (2026-11-17):** Der Lauf sieht aus wie ein klassischer Zug: Kopf nur mit Teamname und Zeit (ohne „Auf Zeit · Karte n/5“), die Karte und die Knöpfe ohne Zusatztext (der Hinweis „kostet Zeit, neue Karte“ am Knopf „Verbotenes Wort“ entfällt; er steht jetzt in den Spielregeln: „Ein verbotenes Wort kostet Zeit.“). Die Übersicht zwischen den Läufen hat wie die Rundenansicht oben einen dünnen **Fortschrittsbalken** (gespielte von allen Läufen) mit **„Lauf n/m“**, darunter Box beziehungsweise Reiter „Zeiten | Karten prüfen“; der Erklärsatz „Jedes Team löst 5 Karten …“ entfällt. Texte `tabooRace.runOf` neu, `title`, `intro`, `cardOf`, `forbiddenHint` (Rennen) entfallen. Der Balken im Lauf zeigt die gelösten Karten (er wächst), im Zug die Restzeit (er schrumpft).
- **Karten prüfen nur während des Spiels (2026-11-17):** Die Korrektur der Karten gibt es nicht mehr in der Endstand-Ansicht. Damit auch der letzte Lauf beziehungsweise der letzte Versuch im Stechen noch geprüft werden kann, folgt auf ihn zuerst eine **Abschlussübersicht** (beim Rennen „Spiel zu Ende.“ mit den Reitern „Zeiten | Karten prüfen“, beim Stechen „Stechen“ mit „Ergebnis Stechen | Karten prüfen“) mit dem Knopf „Endergebnis anzeigen“; der Endstand zeigt nur noch das Ergebnis (wie es bei „Klassisch“ schon die Übersicht „Spiel zu Ende.“ vor dem Endstand gibt). Neu: `TabooTiebreakWrapUp`.
- **Korrektur nur für den eben gespielten Lauf (2026-11-17):** Wie bei „Klassisch“ („Letzte Runde (n)“) gibt es den Reiter **„Letzter Lauf (n)“** (beim Stechen „Letzter Versuch (n)“): Er zeigt nur den zuletzt gespielten Lauf, nur dessen Karten lassen sich korrigieren, nach dem nächsten Lauf nicht mehr. Die Leiste zur Wahl des Teams entfällt. Texte `tabooReview.lastRun/lastAttempt` neu, `tabooReview.tab` entfällt.
- **Reiter „Karten prüfen“ wie bei „Klassisch“:** Beim Rennen und beim Stechen zeigt der Reiter die Karten wie die Rundenansicht des klassischen Modus: Überschrift „Gespielter Lauf: Team 1“ / „Gespielter Versuch: Team 1“, Hinweis und die grünen und roten Zeilen zum Antippen. Bei mehreren Teams wählt eine zusammenhängende Leiste mit den Teamnamen das Team (zuerst das zuletzt gespielte); die aufklappbaren Bereiche je Team entfallen. Texte `tabooReview.runTitle/attemptTitle` neu, `tabooReview.attempt` entfällt.
- **Führendes Team immer oben (2026-11-17):** In den Zeitenlisten (Rennen, Stechen) steht das beste Ergebnis immer oben, Teams ohne Ergebnis folgen am Ende (gleiche Ergebnisse behalten die Spielreihenfolge). Der Punktestand war schon so sortiert.
- **Falsch bleibt falsch (2026-11-17):** Eine Karte, die während des Zuges als „Verbotenes Wort“ markiert wurde, lässt sich bei der Korrektur nicht mehr auf „Richtig“ ändern (Rennen, Stechen und Klassisch). Eine als „Richtig“ gespielte Karte kann man weiter auf „Falsch“ ändern und wieder zurück. Dafür merkt sich `TabooResult` die ursprüngliche Wertung (`original`), die Regel steht in `reviseOutcome` in der Spiellogik. In der Liste sind solche Karten **dunkelrot** (gedämpft, ohne Zeiger) und nicht antippbar, damit man sie von den änderbaren hellen Karten unterscheidet.
- **Endstand und Stechen (2026-11-17):** (1) **Fehler behoben:** Im Endstand des Rennens war bei gleicher Zeit der Balken des einen Teams kürzer (es wurde mit Millisekunden verglichen, angezeigt werden Zehntel); jetzt zählen Zehntelsekunden, gleiche Zeiten haben gleich lange Balken. (2) Im Zug des Stechens steht wie bei allen Zügen nur Teamname und Zeit, ohne „Stechen · Karte n/3“ (Text `tabooTiebreak.cardOf` entfällt). (3) Der Endstand des klassischen Spiels mit Stechen zeigt die Ergebnisse des Stechens als zweiten Reiter **„Punktestand | Stechen“** statt im selben Kasten darunter.
- **Balken im Stechen (2026-11-17):** Im Stechen müssen 3 Karten so schnell wie möglich gelöst werden, deshalb zeigt der Balken oben die **Karten** (1/3, 2/3, 3/3) und füllt sich damit, wie beim Rennen (nicht mehr die Restzeit bis zur 90-Sekunden-Grenze, die zurücklief). Regel: Ein Countdown (Klassisch) lässt den Balken schrumpfen, eine Aufgabe mit Karten (Rennen, Stechen) füllt ihn mit den gelösten Karten.
- **Konfetti zum Sieg (2026-11-17):** Auf der Endansicht (Klassisch, Rennen, Stechen) regnet kurz Konfetti über den ganzen Bildschirm (110 bunte Teilchen in den Farben der App, die über 2,5 Sekunden nacheinander starten und jeweils 3 bis 4,5 Sekunden fallen: insgesamt etwa sieben Sekunden). Neuer Baustein `Confetti` im `game-kit`, ohne neue Abhängigkeit (nur CSS-Animation), über `ScoreScreen` mit `celebrate`. Es ist reine Dekoration: nimmt keine Tipps an, ist für Screenreader ausgeblendet, löst kein Scrollen aus und **entfällt ganz, wenn das Gerät weniger Bewegung wünscht** (`prefers-reduced-motion`). Im Browser gemessen: die Teilchen fallen, kein horizontales Scrollen.
()=>"- **Knöpfe der Endansicht (2026-11-17):** Die zwei Knöpfe unten heißen jetzt **„Erneut spielen“** (englisch „Play again“; vorher „Mit gleicher Konfiguration neu spielen“) und **„Zurück zum Hauptmenü“** (englisch „Back to the main menu“; vorher „Neue Partie konfigurieren“). Der zweite Text gilt auch an den anderen Stellen, an denen es zurück ins Hauptmenü geht (keine Karten mehr). Die Texte `tabooResult.sameSetup/newSetup` sind angepasst.
- **Grüner Rand am Gewinnerblock:** Der Kasten mit dem Gewinnerteam oben hat einen grünen Rand (die Zeilen der Liste darunter bleiben ohne).\n- **Endansicht angeglichen (2026-11-17):**" (1) Der Name im Gewinnerblock nutzt die normale fette Schrift statt der schmalen Anzeigeschrift. (2) Die Überschrift über der Liste im Kasten („Gesamtpunktestand“, „Endzeiten“, „Zeiten“, „Ergebnis Stechen“) ist nur noch für Screenreader da, sie wiederholte nur, was die Ansicht schon sagt. (3) Der grüne Rand um die Zeilen der Gewinner entfällt; der Sieg zeigt sich durch die Krone und den Gewinnerblock oben.
- **Endansicht nach dem Stechen (2026-11-17):** (1) Nach dem Stechen ist im Endstand jetzt der Reiter **„Stechen“** offen (er hat das Spiel entschieden), nicht mehr „Punktestand“. `ScoreScreen` kann dafür den zweiten Reiter zuerst öffnen (`extraTabFirst`). (2) **Fehler in der Spiellogik behoben:** Beim Stechen entschieden Millisekunden, angezeigt werden Zehntel; bei „1,1 s“ gegen „1,1 s“ gab es einen alleinigen Gewinner, obwohl beide Zeilen gleich aussahen und beide die Krone hatten. Jetzt zählt wie beim Rennen die Zehntelsekunde, gleiche Zeiten teilen den Sieg. (3) Bei gleichen Ergebnissen bleibt die Spielreihenfolge in der Liste.
- **„Karte 1/3“ im Stechen:** Im Kopf des Stechen-Zuges steht unter dem Teamnamen wieder „Karte 1/3“ (englisch „Card 1/3“), weil der Balken allein die Kartenzahl nur andeutet. Es ist die einzige zweite Zeile unter einem Teamnamen (bei Klassisch und Rennen gibt es keine). Text `tabooTiebreak.cardOf` wieder da.
- **Unentschieden: Knopf und Text (2026-11-17):** Wenn nach der letzten Runde zwei oder drei Teams gleichauf führen und das Stechen an ist, steht in der Übersicht nicht mehr „Endergebnis anzeigen“ (es folgt ja noch das Stechen), sondern **„Stechen starten“** und der Text **„Unentschieden! Als Nächstes das Stechen.“** statt „Spiel zu Ende.“. Das gilt auch für den Knopf „Endergebnis anzeigen“ bei unbegrenzten Runden. Die Regel, wann ein Stechen folgt, steht als `tiebreakFollows` in der Spiellogik und wird von der Oberfläche benutzt. Text `tabooRound.tieNext` neu.

### Hilfekonzept: Spielregeln erklären alles, i-Knöpfe nur Einzelnes

- **Nachtrag:** Der i-Knopf bei „Runden pro Team“ entfällt (selbsterklärend, die Werte stehen in den Auswahlknöpfen; die Regeln erklären Runden im Fenster „Spielregeln“). Text `tabooSetup.info.rounds` entfernt.

- Auf Wunsch des Auftraggebers neu aufgeteilt (Muster: Info-Symbol für kurze Erklärung genau dort, längeres im Hilfe-Bereich; kurz halten; zeigen statt erklären). **Spielregeln:** ein Fenster mit kurzen Teilen mit Überschrift: **Ziel, Die Karte** (mit **Beispielkarte** „Strand“ / „Beach“ und vier verbotenen Wörtern), **Ein Zug** (3 Schritte und die drei Knöpfe **Richtig, Überspringen, Verbotenes Wort** in ihren Farben mit je einem Satz), **Spielmodi** (Klassisch mit Link zum Stechen, Auf Zeit, je ein bis zwei Sätze) und **Einstellungen** (je eine Zeile). Die Auswahl der Modi im Fenster entfällt.
- **i-Knöpfe:** erklären nur noch die eine Einstellung, in höchstens zwei kurzen Zeilen (alle Texte in Deutsch und Englisch gekürzt, ohne Wiederholung der allgemeinen Regeln). Die Infos zu **„Runden pro Team“ und „Überspringen pro Runde“ haben nur einen Satz**, weil die Werte (Kurz 3, Mittel 5, Lang 10, Nie, ∞) in den Auswahlknöpfen direkt darunter sichtbar sind. Der i-Knopf an einem **Spielmodus** erklärt nur diesen Modus in einem Satz und hat einen Knopf **„Alle Regeln“**, der das Regelfenster öffnet.
- Code: `RulesSection` (ersetzt `RulesView`), `TabooRulesDialog` neu aufgebaut, Fenster für die Modus-Info in `TabooSetupForm`, Stile `kit-rules-*` und `taboo-rules-card`; Texte `tabooRules.*`, `tabooMode.classicInfo/raceInfo` neu, `classicRules/raceRules` und die alten Regelzeilen entfallen. Neuer Test `helpTexts.test.ts` hält die Kürze der i-Texte und des Regelfensters ein. Regeln dazu: `docs/GAMEHUB_UI_RULES.md` 2.5a. 660 Unit-Tests, 30 e2e-Tests grün.

### Spielregeln: Knopf in der Kopfleiste statt Knopf „Spieler“

- **Fehler behoben:** Ein Tipp auf den kleinen „i“-Knopf an einem Spielmodus wählte den Modus dahinter automatisch aus, weil der Info-Knopf den Modus mit setzte. Jetzt öffnet er nur das Regelfenster; der gewählte Modus bleibt, wie er war. Der Test prüft das für beide Modi und beide Sprachen.

- **Entscheidung des Auftraggebers (2026-11-15):** Die Spielregeln sind **kein Reiter**, sondern ein **Knopf „Spielregeln“ in der Kopfleiste** des Hauptmenüs, **statt des Knopfs „Spieler“** (der gehört zur Spielauswahl des GameHub). Er öffnet das Regelfenster; so bleiben die Reiter bei „Spieleinstellungen | Karten". Die kleinen **i-Knöpfe** an den Spielmodi öffnen das Fenster bei ihrem Modus (**ohne den Modus auszuwählen**, siehe Fehler unten), das Stechen bleibt ein Infofenster mit Link in den Regeln. Das Regelfenster bleibt für alle Modi gleich groß (alle Regeln übereinander, nur eine sichtbar), die Spielmodi sind Knöpfe in halber Breite.
- Code: neuer Baustein `RulesView` (ersetzt `RulesDialog`/`RulesButton`), `TabooRulesPanel` und `TabooRulesDialog`, `useGameRulesButton` und `GameRulesContext` in `GameChrome` (die `AppShell` zeigt den Knopf an der Stelle von `PlayerRosterButton`), Symbol `book`. Das Fenster „Aus Spielerliste wählen" hat den Knopf **„Spielerliste verwalten"** (`PlayerRosterDialog` ist aus dem Knopf herausgelöst). Texte: `kitSetup.rulesButton`, `kitRoster.manage`, `tabooRules.modes/title`. Tests für die Kopfleiste (GameHub hat „Spieler", das Spiel „Spielregeln"), das Regelfenster, die i-Knöpfe, den Link zum Stechen und die Verwaltung aus dem Auswahlfenster; die Layout-Prüfung prüft das Regelfenster. Links im Satz (`kit-link-button`) sind von der Mindestgröße der Tippfläche ausgenommen. 646 Unit-Tests, 30 e2e-Tests grün.

### Reiter wie im Browser statt aufklappbarer Kapitel (ADR-026)

- **Aufstellung:** Statt zweier aufklappbarer Boxen gibt es oben zwei Reiter **„Spieler (4)“** und **„Teams (2)“** (mit der Anzahl), darunter der Inhalt des gewählten Reiters. Vorausgewählt: „Teams“ bei Tabu, „Spieler“ bei Pflicht-Spielern. **Hauptmenü von Tabu:** die Kapitel „Spieleinstellungen“ und „Karten“ sind ebenso Reiter; die Einstellungen passen damit auf einen Bildschirm. Fehlt beim Start eine Kategorie, öffnet sich der Reiter „Karten“.
- **Look:** Die Reiter sitzen nebeneinander in gleicher Breite (44 Pixel hoch), der gewählte hat die Farbe der Inhaltsbox und verdeckt deren obere Linie, die anderen sind dunkler; die Box ist mit ihm verbunden. **Bedienung:** Tipp, Pfeiltasten links und rechts (mit Umlauf), Pos1 und Ende. Alle Reiter bleiben im Formular und werden beim Start gelesen.
- **Baustein `SetupTabs`** (`game-kit`, mit `selected`/`onSelect` auch von außen steuerbar), neue Texte `kitSetup.playersTab/teamsTab/lineupTabs/menuTabs`; die Kapitel-Texte `playersSection`, `teamsSection` und `kitTeams.summary` entfallen. `SetupSection` bleibt in der Datenansicht (Editor). Tests: `SetupTabs` (4), Aufstellung und Hauptmenü angepasst; e2e wählen den Reiter („Karten“, „Spieler“, „Teams“) und die Layout-Prüfung prüft die Reiter einzeln; 644 Unit-Tests, 30 e2e-Tests, Typen, eslint grün.

### Aufstellung vollständig abgesichert: Verzweigungen und e2e

- **Alle Verzweigungen der Aufstellung sind abgedeckt** (Logik und Oberfläche: `lineup`, `teamOrder`, `teamSetup`, `savedTeamSetup`, `LineupSetup`, `TeamsSetup`, `TeamOrder`, `PlayerAdder`, `usePlayerDrag`): neue Tests für leere Namen, andere Tasten am Griff, ein Ziehen auf demselben Platz, ein Ziel ohne gültiges Team, den Klick nach dem Ziehen, gespeicherte Gruppen mit nur Namen, nur Zuordnung oder nur Teamzahl, ein Spiel ohne Spielerliste und die alten Wörter der Reihenfolge. Nicht erreichbare Rückfallwerte wurden aus dem Code entfernt (`resolveLineup` und `buildTeams` zählen jetzt direkt, `TeamOrder` liest seine Liste sicher).
- **Neu e2e** (`e2e/lineup.spec.ts`, Desktop und Mobil, Deutsch und Englisch): Spieler hinzufügen, drei Teams, Auslosen, Spieler per Tipp in ein Team, ein Spieler per Maus gezogen, Team 3 per Tastatur an den ersten Platz, Spiel starten (Team 3 beginnt). Die **Layout-Prüfung** (`mobile-layout.spec.ts`) prüft die Aufstellung jetzt auch **mit Spielern** und mit **gefüllten Teams samt einem Spieler ohne Team**. Folge: Die Namensknöpfe sind **44 Pixel hoch** (vorher 40), weil die Prüfung die Tippfläche verlangt.
- Stand: 639 Unit-Tests, 30 e2e-Tests (6 mobile Layout-Prüfungen werden auf dem Desktop-Projekt übersprungen), Typen, eslint, Schichtgrenzen grün.

### Spieler per Tipp in ein Team: beide Wege

- Auf Wunsch gibt es **zwei Wege**, einen Spieler in ein Team zu bringen: Drag and Drop wie bisher oder **ein Tipp auf den Namen**, der ein Fenster „Team für …“ mit allen Teams und „Ohne Team“ öffnet (das aktuelle Team ist markiert, die Wahl gilt sofort). Der Tipp ersetzt das bisherige direkte Herausnehmen im Team; „Ohne Team“ im Fenster nimmt den Spieler heraus. Damit ist die Zuordnung auch mit der Tastatur und ohne Ziehen bedienbar (schließt die Lücke bei der Barrierefreiheit). Neuer Test für Tipp, Tastatur und Schließen; 630 Tests, Typen, eslint, e2e (26) grün.

### Teambox, ruhigeres Ablagefeld und Fehler bei „Letzte Teams laden“

- **Ein Team ist jetzt eine Box:** Namensfeld und Spielerfeld stehen zusammen in einer umrandeten Karte; das Spielerfeld ist ein dunkleres Feld ohne gestrichelten Rahmen (auch leer da, sobald es Spieler gibt), die Karte unter dem Zeiger leuchtet beim Ziehen. „Ohne Team“ ist genauso aufgebaut.
- **Kompaktere Teamreihenfolge:** Die Zeilen sind nur noch etwa 36 Pixel hoch (vorher 52); der Griff reicht mit seiner 44 Pixel großen Tippfläche über den Zeilenrand, die Zeile bleibt niedrig.
- **Fehler behoben:** „Letzte Teams laden“ bewirkte nichts, wenn oben keine Spieler hinzugefügt waren, weil die gemerkte Zuordnung auf die (leere) Spielerliste zugeschnitten wurde. Jetzt kommen die Teams mit den Spielern, die in ihnen stehen; fehlende Spieler werden der Liste hinzugefügt. Test dafür (beide Sprachen); 629 Tests, Typen, eslint grün.

### Spieler wieder per Drag and Drop in Teams ziehen; Standard links; Griff ohne Rahmen

- Auf Wunsch des Auftraggebers: **Spieler müssen in ein Team gezogen werden** (Maus oder Finger), damit sie dort stehen; **ein Tipp auf einen Spieler in einem Team nimmt ihn heraus** und legt ihn zu „Ohne Team“. Die Karte „Ohne Team (Spieler in ein Team ziehen)“ ist wieder da (nur wenn es Spieler ohne Team gibt, sowie beim Ziehen), die Karte unter dem Zeiger leuchtet, der Name folgt dem Zeiger, am Rand scrollt die Seite mit. Das Fenster zur Teamwahl und `kitTeams.pickTitle` entfallen; `usePlayerDrag` ist zurück im `game-kit` (Zeigerereignisse, `data-drop`).
- Bei der Teamreihenfolge steht **„Standard“ links** und „Zufällig“ rechts, der **Griff hat keinen Rahmen mehr** (bewusste Ausnahme von „jeder Knopf hat einen Rahmen“). Tests für Ziehen, Abbruch, Randscrollen und die Knopfreihenfolge; 627 Tests, Typen, eslint grün.

### Teamreihenfolge: sichtbar, per Tipp und mit zwei Knöpfen

- Die Auswahl „Zufällig | Wie eingegeben“ ist ersetzt. **Alle Teams stehen untereinander mit festen Plätzen** („1.“, „2.“, „3.“ …), das oberste beginnt, und lassen sich **am Griff per Drag and Drop beliebig umordnen** (Pfeiltasten auf dem Griff gehen auch). Darunter zwei Knöpfe in halber Breite: **„Zufällig“** (mischt alle, das erste beginnt) und **„Standard“** (Team 1, 2, 3 …, gesperrt wenn schon so). Neue Bausteinkomponente `TeamOrder` (Zeigerereignisse wie beim früheren Ziehen, `touch-action: none` am Griff), neues Symbol `grip`; Texte `kitTeams.orderDefault/orderMove`, `orderInfo` neu, `orderEntered` entfällt. Erster Entwurf mit „Tipp auf ein Team lässt es beginnen“ wurde verworfen.
- **Logik:** `TeamSetupValue.order` ist jetzt eine Liste von Teamnummern (leer = Standard) statt `"random"`/`"entered"`; `buildTeams` nimmt genau diese Reihenfolge, die Zufallsauslosung beim Start (`shuffleTeams`) entfällt. Neue reine Funktionen `normalizeOrder`, `moveTeam`, `randomOrder`, `isDefaultOrder` in `teamOrder.ts` (mit Tests); die Reihenfolge passt sich einer geänderten Teamanzahl an. Gemerkte Gruppen aus älteren Versionen (`"random"`/`"entered"`) werden gelesen und als Standard übernommen. Folge: Standard ist jetzt Team 1, 2, 3 …, bei Tabu beginnt also ohne Änderung das erste Team. 624 Tests, Typen, eslint, e2e (26) grün.

### „Spieler und Teams“ ist das Vorbild für alle Ansichten

- Auf Wunsch des Auftraggebers gilt die Aufstellung als Vorbild für jede Ansicht, damit die App einheitlich bleibt. Die Merkmale stehen in `docs/GAMEHUB_UI_RULES.md`, Abschnitt 2.0 (einfach und kompakt, aufklappbare Boxen mit Kurzinfo, bewährte Muster, Knöpfe mit Rahmen, immer sichtbar und bei Bedarf gesperrt, Bestätigung bei Zerstörerischem, konfigurierbare Bausteine).

### Spieler ohne Team beim Start: je Spiel einstellbar

- Neu in der `LineupConfig`: `unassignedPlayers` mit `ignore` (übergehen), `assign` (automatisch auf die kleinsten Teams verteilen, **Standard**) und `block` (Start verhindern). **Tabu nutzt `ignore`**, weil das Spiel keine Namen braucht: Tabu startet jetzt auch mit Spielern ohne Team, die Meldung entfällt. Neue reine Funktion `resolveLineup` (verteilt bei `assign` alphabetisch auf die jeweils kleinsten Teams, bei Gleichstand auf das erste), `validateLineup` meldet fehlende Teams nur noch bei `block`. Tests dafür (Business und Tabu), 615 Tests, Typen, eslint grün.

### Aufstellung nach dem Muster „Auslosen und Ergebnis“

- Auf Wunsch des Auftraggebers wurde nach bewährten Mustern anderer Apps gesucht (Quellen: Team-Zufallsgeneratoren, gespeicherte Spielerlisten wie bei Trivia Maker, Apples Richtlinien für Segmented Controls, Hinweise zu eindeutigem „nicht zugewiesen“). Gewählt: **Auslosen und Ergebnis**. Box „Spieler“: nur Feld, Spielerliste aus der Liste und eine einfache Liste (Name, Papierkorb); die Teamauswahl in der Liste entfällt. Box „Teams“: Teamanzahl, **Knopf „Teams auslosen“ / „Neu mischen“**, pro Team eine Karte mit Namensfeld und den Spielern als kleine Namensknöpfe, eine Karte „Ohne Team“ für noch nicht zugeordnete Spieler und die Reihenfolge. **Ein Tipp auf einen Namen** öffnet ein Fenster „Team für …“ mit allen Teams.
- Code: `TeamsSetup` enthält das Auslosen, die Karten und die Teamwahl (`Dialog`), `PlayersSetup` nur Hinzufügen und Liste (ohne `rules`). Texte `kitTeams.draw/redraw/pickTitle` neu, `kitPlayers.draw/moveLabel` entfallen; die Meldung beim Start sagt jetzt „Teams auslosen oder einen Namen antippen“. Die Namensknöpfe sind 40 Pixel hoch (die Tippfläche der übrigen Knöpfe bleibt 44). 612 Tests, Typen, eslint, e2e (26) grün. Hinweis: Eine gruppierte Button-Leiste (1 | 2 | 3) wurde nicht gebaut; Apple rät, Segmented Controls nicht für Aktionen wie „Laden“ oder „Leeren“ zu nutzen.

### Aufstellung radikal vereinfacht: eine Liste mit Teamauswahl

- **Laden und Leeren neu angeordnet:** Der Knopf „Alle Spieler entfernen“ und der Baustein `ClearButton` (Knöpfe in der Überschrift) entfallen. In der Box „Teams“ stehen „Letzte Teams laden“ und „Teams leeren“ nebeneinander je halbe Breite (der Knopf „Teams leeren“ ist der vorhandene `ConfirmButton`, der jetzt auch `disabled` kennt, mit Bestätigung „Sicher?“). Beide sind immer sichtbar und nur nicht bedienbar, wenn sie nichts ändern würden; ebenso „Letzte Spieler laden“ in der Box „Spieler“. 611 Tests, e2e (26) grün.

- **Leeren-Knöpfe:** Die Papierkorb-Knöpfe neben den Überschriften stehen links vom Zähler („Spieler: 4“) und sind kleiner (Rahmen kleiner als die Tippfläche, die bei 44 Pixel bleibt; jeder Knopf hat einen Rahmen) und brauchen eine Bestätigung: Der erste Tipp macht sie rot („Sicher?“), der zweite leert. Neuer Baustein `ClearButton` im `game-kit`, Texte `kitSetup.sure`, `kitPlayers.clearConfirm`, `kitTeams.clearConfirm`; 613 Tests, e2e (26) grün.

- Auf Wunsch des Auftraggebers („sehr einfach, aber kompakt“) entfallen Drag and Drop, das Feld „Ohne Team“, die Namensschilder, die Stift-Bearbeitung und der automatische Mitlauf am Bildschirmrand. Neu: **Box „Spieler“** mit Feld, Spielerliste und Zufallsverteilung und darunter **eine alphabetische Liste mit einer Zeile pro Spieler** (Name, Teamauswahl, Papierkorb); **Box „Teams“** nur noch mit Teamanzahl, einem Namensfeld je Team (darunter die Spieler als Textzeile) und der Reihenfolge. Bei Tabu ohne Namen bleibt nur die Teams-Box mit zwei Feldern.
- Code: `PlayersSetup` (jetzt gesteuert mit `TeamSetupValue` und `rules`) enthält Hinzufügen, Liste und Verteilen, `TeamsSetup` nur Anzahl, Namen und Reihenfolge, `PlayerAdder` ist eine eigene Datei. Entfernt: `usePlayerDrag`, `PlayerChips`, `smallestTeamIndex`, die Stile für Namensschilder, Ziehen, Pool und Bearbeiten sowie die Texte `dragHint`, `editTeam`, `doneEditing`, `chipLabel`. Die Konfiguration je Spiel (`LineupConfig`), die Startregeln, „Letzte Spieler/Teams laden“ und die Leeren-Knöpfe bleiben. Tests angepasst; 610 Tests, Typen, eslint, e2e (26) grün.

### Konfigurierbare Aufstellung: getrennte Boxen „Spieler“ und „Teams“ (Al-09-09, ADR-025)

- Auf Wunsch sind „Spieler“ und „Teams“ jetzt zwei getrennte, aufklappbare Boxen, und die Aufstellung ist je Spiel konfigurierbar: Jedes Spiel beschreibt sie einmal in einer `LineupConfig` (Spielerliste `off`/`optional`/`required` mit Mindest- und Höchstzahl, Teams `"off"` oder `TeamRules`). `LineupSetup` zeigt nur, was das Spiel braucht: Spiele ohne Teams nur „Spieler“ (mit Liste und Papierkorb), Spiele ohne Namen nur „Teams“. Bei Tabu ist „Spieler“ eingeklappt, „Teams“ offen; die Überschriften zeigen eine Kurzinfo („Spieler: 4“, „Teams: 2“).
- Neu: `business/shared/lineup.ts` (`LineupConfig`, `validateLineup` mit Tests), `business/games/taboo/lineup.ts`, `LineupSetup`, `SetupSection` mit `summary`. `TeamsSetup` bekommt `withPlayers` statt `players` und enthält das Verteilen und die Teamboxen; Spieler hinzufügen und die Spielerliste liegen in `PlayersSetup`. „Letzte Gruppe laden“ steht über den Boxen. Texte `kitSetup.playersSection`, `kitTeams.summary`, `kitLineup.*` in Deutsch und Englisch.
- **Fehler behoben:** Das Spiel ließ sich starten, wenn Spieler hinzugefügt, aber keinem Team zugewiesen waren. Jetzt verhindert `validateLineup` den Start und eine Meldung sagt, wie viele Spieler noch ohne Team sind. „Zufällig auf Teams verteilen“ erscheint erst, wenn Spieler da sind.
- **Nachbesserungen am selben Tag:** Der Knopf „Letzte Gruppe laden“ über den Boxen entfällt; jede Box lädt ihren Teil („Letzte Spieler laden“, „Letzte Teams laden“). Neben jeder Überschrift steht ein Papierkorb-Knopf, der die Box leert (Spieler entfernen, Teams zurücksetzen), ohne die Box zu öffnen oder zu schließen (`SetupSection` bekommt `action`). „Ohne Team (Spieler in ein Team ziehen)“ ist immer sichtbar (mindestens eine Reihe hoch, höchstens etwa zwei) und steht wieder fest statt mitzuscrollen, damit es den Startknopf nicht überdeckt. Texte: `kitTeams.loadLastTeams/clear`, `kitPlayers.clear`; `kitTeams.loadLast` entfällt.
- Tests: neue `LineupSetup`-Tests für alle Kombinationen, Startregeln in Tabu, 614 Tests, Typen, eslint, e2e (26) grün.

### Aufstellung: Spieler als Text, Teambox als Ablagefläche, Bearbeiten je Team

- Auf Wunsch deutlich kompakter. In den Teams stehen die Spieler nur noch als Text („Ben, Fritz“), das eigene Ziehfeld entfällt, die **ganze Teambox ist die Ablagefläche**. Gezogen wird aus „Ohne Team“; das Feld steht oben und bleibt beim Scrollen fest (höchstens 30 % der Bildschirmhöhe, innen scrollbar) und trägt den Hinweis „Spieler in ein Team ziehen“. Pro Team eine Zeile mit Namensfeld und Stiftknopf.
- Korrigieren geht über den **Stiftknopf** der Box: er listet die Spieler des Teams mit Teamauswahl (anderes Team oder „Ohne Team“) und Kreuz zum Entfernen, das Häkchen schließt. Das Entfernen ist ein Papierkorb-Symbol (ein Kreuz sah nach „aus dem Team nehmen“ aus, entfernt aber den Spieler ganz); aus dem Team nimmt man ihn über „Ohne Team“. Die Namen haben mehr Abstand zum Rand. Papierkorb und Häkchen haben gleiche Größe, Rahmen und rechte Kante. „Spieler hinzufügen“, „Aus Spielerliste wählen“ und „Zufällig verteilen“ stehen jetzt über den Teams, die Teamreihenfolge bleibt unten. **Alphabetisch:** Die Spieler eines Teams stehen immer alphabetisch sortiert (Teambox und Bearbeitungsliste, `Intl.Collator` der Oberflächensprache). Das ist nur die Anzeige; „Ohne Team“ bleibt in der Eingabereihenfolge. Ein leeres Team lässt sich nicht bearbeiten. **Reihenfolge und Name geändert:** Das Feld heißt jetzt „Spieler und Teams“ („Players and teams“); zuerst werden die Spieler hinzugefügt (Feld, Spielerliste, zufällig verteilen), darunter die Teams konfiguriert (Teamanzahl, „Ohne Team“, Teamboxen, Teamreihenfolge unten).
- Neue Texte `kitPlayers.dragHint/editTeam/doneEditing/moveLabel` in Deutsch und Englisch (`dropHint` entfällt); neue Stile `.kit-team__head/__members/__edit`, `.kit-members`, `.kit-pool__*` (`.kit-drop` entfällt). Tests für Bearbeiten (verschieben, herausnehmen, entfernen), Ziehen auf die Box, Abbruch und Randscrollen; 601 Tests, Typen, eslint und e2e (26 bestanden) grün. Im Browser mit 6 Teams und 12 Spielern auf Handybreite geprüft.

### Entwicklungs-Dashboard einheitlich gegliedert

- Eine Gliederung für alles: **Bereich → Phase → Aufgabe**. Jede Phase hat in `GAMEHUB_STATUS.json` das Feld `area` (`general` oder die ID eines Spiels) und erscheint nur in diesem Bereich. Die getrennte „Roadmap“ der Spiel-Tabs mit eigener Stufennummerierung ist entfernt; die Tabs zeigen dieselben Phasen wie „Allgemein“, nur gefiltert. Die Felder `gameIds` an Phasen und Aufgaben und `games[].roadmap` entfallen.
- Phasen sind nach Bereich und logischem Ablauf geordnet (zum Beispiel `Al-06` ans Ende von „Allgemein“, `Al-07` zu Tabu). Phasen- und Aufgaben-IDs bleiben unverändert und stabil; sie tragen weiter ihr historisches Kürzel.
- Der **Phasenstatus wird berechnet** (alle Aufgaben erledigt: erledigt; mindestens eine erledigt oder in Arbeit: in Arbeit; sonst geplant), ebenso der Projektfortschritt, und die Aufgaben einer Phase werden nach ID sortiert. `pnpm docs:sync` schreibt das in `GAMEHUB_STATUS.json`, `pnpm docs:check` schlägt bei Abweichung fehl. Das Dashboard zeigt den Phasenstatus als Marke.
- Qualitätswerte aktualisiert: 600 Unit-Tests, 26 E2E-Tests, Abdeckung 98,11 % Zeilen / 93,58 % Verzweigungen.
- Folge: Tabu zählt jetzt 57 statt 60 Aufgaben (die Desktop-Aufgaben von `Al-08` und Einzelaufgaben aus gemischten Phasen gehören nun zu „Allgemein“); der Gesamtfortschritt bleibt bei 82 von 148.

## 2026-11-13

### Tabu-Kapitel nach Spielmodus und Funktion geordnet

- Tabu-Aufgaben nach Spielmodus und Funktion geordnet. Die Abschlussaufgabe für die Zeitmodi trägt einen eindeutigen Titel.

### Einzelne Spielansichten geplant

- Wichtige Spielansichten im Entwicklungs-Dashboard als eigene Aufgaben mit Abnahmekriterien geplant.

### Entwicklungsreihenfolge in den Spieltabs

- Alle Spieltabs zeigen zuerst Regeln und Spiellogik, dann die Ansichten in Spielreihenfolge und zuletzt die Abnahme.

### Spielaufgaben nach Funktionen gebündelt

- Zusammengehörige Spielaufgaben zu 32 Funktionspaketen gebündelt. Die Prüffälle stehen bei der jeweiligen Aufgabe im Projektplan.

### Einzelne Regeln und Bedienaktionen als Aufgaben

- Mehrteilige Spielaufgaben in einzelne Regeln, Bedienaktionen und konkrete Prüffälle aufgeteilt.

### Umsetzungsschritte für vier Spiele präzisiert

- Die Umsetzung von Wortbombe, Imposter, Werwolf und Liar’s Bar ist in kleinere Aufgaben mit überprüfbaren Abnahmekriterien aufgeteilt.

### Planung für Werwolf und Liar’s Bar

- Werwolf und Liar’s Bar als eigene Spielbereiche geplant und im Entwicklungs-Dashboard ergänzt.

## 2026-11-13

### Großschreibung und Kategorie umbenennen

- **Erster Buchstabe groß:** Beim Hinzufügen und Bearbeiten einer Karte wird der erste Buchstabe des Begriffs und jedes verbotenen Wortes automatisch groß geschrieben („football“ wird „Football“, „net“ wird „Net“); die Leerzeichen werden dabei auch bereinigt. Neue Funktion `capitalizeFirst` im Business (nach den Regeln der Sprache der Karte). Karten des mitgelieferten Pools und schon gespeicherte eigene Karten bleiben unverändert.
- **Kategorie umbenennen:** Bei jeder eigenen Kategorie in der Kartenansicht gibt es den Knopf „Umbenennen“. Er öffnet ein Feld mit dem Namen (grünes Häkchen zum Speichern, „Abbrechen“); alle eigenen Karten dieser Kategorie in dieser Sprache bekommen den neuen Namen und der Name bleibt gespeichert. Abgelehnt werden ein leerer Name (“Gib einen Namen ein.”) und ein Name, den es schon gibt (eine andere eigene Kategorie derselben Sprache oder eine Standardkategorie; „Eine Kategorie mit diesem Namen gibt es schon.“). Erfolg: „Kategorie umbenannt.“. Die Bedienknöpfe der eigenen Kategorien nennen jetzt auch ihre Sprache, zum Beispiel „Kategorie Sport (EN) umbenennen“, weil derselbe Name in zwei Sprachen zwei Kategorien sind.
- **Großschreibung auch bei Kategorienamen:** Beim Umbenennen und beim Anlegen einer neuen Kategorie wird der erste Buchstabe des Namens groß geschrieben („ball spiele“ wird „Ball spiele“).
- **Umbenennen-Zeile geprüft und angepasst:** Im Browser (375 Pixel Breite) waren die Knöpfe zu nah beieinander und das Feld, das Häkchen und „Abbrechen“ nicht gleich hoch (eine allgemeine Regel gab Knöpfen im Spiel Abstand nach oben). Jetzt haben alle dieselbe Höhe (48 Pixel) auf einer Linie und 12 Pixel Abstand; die Knöpfe „Umbenennen“ und „Kategorie löschen“ teilen sich die **ganze Breite** und sind gleich breit (je 184 Pixel bei 375 Pixel Breite, im Browser gemessen), der Text bricht nicht um.
- **Doppelte Begriffe:** Das wurde schon geprüft: Ein Begriff, den es in der Sprache schon gibt (in jeder Kategorie, auch in den Standardkarten, ohne Beachtung der Groß- und Kleinschreibung), wird nicht hinzugefügt („Diese Karte gibt es schon.“).
- Tests (Deutsch und Englisch): Großschreibung beim Hinzufügen und Bearbeiten, Umbenennen mit leerem, vergebenem und Standardnamen, Speicherung in der Bibliothek.

### Karte hinzufügen: Beispiele in der Kategoriesprache, genaue Fehlermeldungen

- Die **Beispieltexte** in „Begriff“ und „Vier verbotene Wörter“ stehen in der **Sprache der Kategorie**: bei einer eigenen Kategorie ihre Sprache, bei „Neue Kategorie …“ die gewählte „Sprache der Kategorie“ (zuerst Englisch).
- Die Meldung beim Hinzufügen und beim Bearbeiten **sagt jetzt, was nicht stimmt** (vorher bei jedem Fehler derselbe Satz): „Gib einen Begriff ein.“, „Gib genau vier verbotene Wörter ein, mit Komma getrennt.“, „Ein verbotenes Wort steht doppelt. Alle vier müssen verschieden sein.“, „Ein verbotenes Wort ist der Begriff selbst.“, „Ein verbotenes Wort ist Teil des Begriffs. Das ist ohnehin verboten.“ (Deutsch und Englisch; bei mehreren Fehlern der erste in dieser Reihenfolge). Leere Einträge (zum Beispiel ein Komma am Ende) werden ignoriert.
- Die Prüfung auf doppelte Wörter gab es schon (auch bei anderer Groß- und Kleinschreibung oder mit Leerzeichen); nur die Meldung war falsch. Neue Texte in `tabooCardProblems`, Hilfsfunktionen in `cardProblem.ts`, Tests dafür.

### Benachrichtigungen auffälliger

- Die Benachrichtigung (`Toast`) sieht nicht wie ein Knopf aus: dunkler Grund wie die Seite, **dicker Rand** und ein **rundes Symbol** in der Farbe der Meldung (Fehler rot mit „!“, Erfolg grün mit „✓“, Hinweis blau mit „i“), fette Schrift, ohne Schatten. Knöpfe sind gefüllt, Benachrichtigungen nicht. **Längere Meldungen bleiben länger sichtbar**, weil man länger zum Lesen braucht: 3 Sekunden plus etwa 60 Millisekunden je Zeichen, mindestens 5 und höchstens 15 Sekunden (`readingTime`, zum Beispiel 130 Zeichen = 10,8 Sekunden). Der Text steht **in der Höhe mittig** (Symbol und Text auf einer Linie) und die Benachrichtigung **wächst mit mehrzeiligem Text** mit (gleicher Abstand oben und unten, gemessen bei einer und bei vier Zeilen). Regel dazu in `docs/GAMEHUB_UI_RULES.md`.

### Benachrichtigungen statt Meldungsboxen

- Die Meldungsboxen (`StatusMessage`, Feld mit farbigem Rand in der Seite) gibt es im ganzen Projekt nicht mehr. Stattdessen zeigt der neue Baustein `Toast` die Meldung als **Benachrichtigung unten**, die nach 5 Sekunden von allein verschwindet, keinen Platz in der Seite braucht und Eingaben nicht blockiert. Fehler melden sich als `alert`, Erfolg und Hinweise als `status`. `useNotice` zeigt dieselbe Meldung bei jedem Aufruf erneut.
- Umgestellt: Karte hinzufügen (Erfolg, Fehler), Kartenliste (Bearbeiten, Löschen), Import, die Meldungen des Hauptmenüs und der Aufstellung (zu wenige Karten, Eingaben ungültig), „Auf Zeit“ (zu wenige Karten), Stechen und Runde (keine Karten mehr; der Knopf „Neue Partie“ bleibt sichtbar). Das Hauptmenü zeigt seine Meldungen nur, solange es sichtbar ist (nicht doppelt hinter der Aufstellung).
- Kurze Meldungen stehen **ohne Überschrift** in einer Zeile (Karte hinzufügen, Kartenliste, Import: zum Beispiel „Karte hinzugefügt.“). Eine Überschrift bleibt nur bei „Keine Karten mehr“ und „Eingaben ungültig“, wo mehrere Zeilen folgen. Die Benachrichtigungen stehen immer **unten**.
- Tests: `Toast` (verschwindet, Alert und Status, neuer `key`) und `useNotice`; die bestehenden Tests liefen unverändert weiter.

### Englisch als primäre Sprache bei Sprachauswahlen

- Regel: Englisch ist bei jeder Sprachauswahl voreingestellt und das erste Element (dann Deutsch). Die Auswahl „Sprache der Kategorie“ beim Anlegen einer eigenen Kategorie steht auf Englisch und listet English vor German; die Kartensprache der Spieleinstellungen bestimmt sie nicht mehr. Die Regel steht in `docs/GAMEHUB_UI_RULES.md`. Offen: Beim ersten Start wird weiter die Sprache des Browsers gewählt, nicht Englisch.
- Ordner der Kategorieauswahl: Name der neuen Kategorie und ihre Sprache stehen über der Schwierigkeit (alles untereinander).

### Eigene Kategorien mit Sprache, Standardkategorien nicht wählbar

- **Karte hinzufügen:** Die Kategorieauswahl bietet nur noch **eigene Kategorien** (mit „(DE)“ oder „(EN)“) und „Neue Kategorie …“. Standardkategorien sind nicht mehr wählbar. Bei einer neuen Kategorie legt man **Name und Sprache** fest (neue Auswahl „Sprache der Kategorie“); jede Karte einer Kategorie hat deren Sprache. Der Titel heißt nur noch „Karte hinzufügen“ (ohne Sprache). Der Knopf „Karte hinzufügen“ ist grün (`success`) wie die anderen Hauptaktionen.
- **Kartenansicht:** Die Liste zeigt die eigenen Kategorien **beider Sprachen** mit Sprache hinter dem Namen und nur der Kartenanzahl. Beim Bearbeiten einer Karte sind nur eigene Kategorien derselben Sprache wählbar (eine alte eigene Karte in einer Standardkategorie bleibt dort wählbar).
- Neu im Business: `ownCategories` (eigene Kategorien aller Sprachen; gleicher Name in zwei Sprachen sind zwei Kategorien). Tests (Deutsch und Englisch) angepasst und ergänzt. Offen: Der Export bietet weiter nur die eigenen Kategorien der Kartensprache aus den Spieleinstellungen an.

### Kartenansicht: Kategorien, Sprache und leichtere schwere Karten

- Kartenansicht: Bei jeder Kategorie steht nur noch die **Kartenanzahl** (vorher „105 (15 eigene)“). Bei den Standardkategorien steht die Überschrift „Standard-Kategorien (Deutsch und Englisch)“ (nur in der Kartenansicht, nicht im Hauptmenü). **Eigene Kategorien** zeigen ihre Sprache hinter dem Namen, zum Beispiel „Sport (DE)“, in der Kartenansicht, im Hauptmenü (Kapitel Karten) und in der Kategorieauswahl beim Hinzufügen und Bearbeiten.
- Die **schweren Karten** waren teils zu schwer (Wörter, die die meisten nicht kennen, zum Beispiel „Aquifer“, „Fuge“, „Oszilloskop“, „Gregorianik“, „Nacktmull“). 42 Karten je Sprache sind ersetzt durch bekanntere, aber schwerer zu erklärende Begriffe (zum Beispiel „Klimawandel“, „Mona Lisa“, „Walross“, „Bürgermeister“, „Big Ben“). Der Pool hat weiter 900 Karten je Sprache, 30 je Schwierigkeit und Kategorie.
- Tests angepasst (Anzahl ohne „eigene“, „(EN)“ hinter eigenen Kategorien).

### Aufstellung vereinfacht: Teamkarten, Namensschilder, Drag and Drop

- Die Ansicht „Teams und Spieler“ (`TeamsSetup`, `PlayersSetup`) ist neu gestaltet: pro Team eine Karte mit Namensfeld und den Spielern als **Namensschilder**; darunter „Ohne Team“; ein Feld „Spieler hinzufügen“ mit Plus-Knopf statt des großen Textfelds; „Aus Spielerliste wählen“ und „Zufällig auf Teams verteilen“ nebeneinander; Teamreihenfolge zuletzt. Spieler werden per **Drag and Drop** (Maus und Finger, Zeigerereignisse) in ein Team gezogen; jedes Team hat ein Feld „Spieler hierher ziehen“. Ein Tipp nimmt einen Spieler aus dem Team und legt ihn zu „Ohne Team“, ein Tipp auf einen Spieler ohne Team schickt ihn ins kleinste Team; das Kreuz entfernt ihn. Name und Kreuz im Schild sind in der Höhe zentriert. Beim Ziehen am Bildschirmrand scrollt die Seite mit. Weg sind der aufklappbare Bereich, der lange Erklärtext, das Auswahlfeld je Spieler und die doppelte Teamliste.
- Neue reine Logik `business/shared/playerList.ts` (`addPlayersToText`, `removePlayerFromText`, `smallestTeamIndex`, mit Tests); neue Bausteine `PlayerChip`, `PlayerChips`, `PlayerAdder` und der Hook `usePlayerDrag` im `game-kit`, neues Symbol `close`. Entfernt: `PlayerListField`, `useAutoGrow`, `playersOpen` und die nicht mehr genutzten Texte und Stile. Die Namen werden mit großem Anfangsbuchstaben aufgenommen; doppelte (auch in anderer Schreibweise) und zu lange Namen werden übersprungen; Enter fügt hinzu und startet nicht das Spiel.
- **Fehler gefunden und behoben:** Die kleinen Infoknöpfe an der Überschrift einer Einstellung („Runden pro Team“, „Überspringen pro Runde“, „Teamreihenfolge“ …) lagen versteckt hinter den Auswahlknöpfen (eine allgemeine Regel gab ihnen 24 Pixel Abstand nach oben und die Lage stimmte nicht). Sie stehen jetzt am rechten Ende der Überschriftzeile und sind sichtbar.
- Der e2e-Test „offline“ wählte noch die abgeschaltete Kartenquelle „Beides“; der Schritt ist entfernt. e2e: 26 bestanden, 6 übersprungen wie bisher. Der Zufallstest der Zustandsmaschine bekam 30 s Zeitgrenze (lief unter Last in die 5 s). Neue Tests für Ziehen, Abbrechen und Randscrollen; vitest 600 Tests grün, Coverage-Schwellen erfüllt.
- Offen (nächster Schritt, wie angekündigt): Das Spiel lässt sich starten, wenn Spieler hinzugefügt, aber keinem Team zugewiesen wurden.

### KI-Kartenquelle abgeschaltet (ADR-024)

- Auf Wunsch des Auftraggebers ist die Einstellung „Kartenquelle“ weg: Es gibt keine KI-Auswahl mehr, gespielt werden nur die mitgelieferten Karten und die eigenen. `main.tsx` verdrahtet keinen Kartengenerator mehr. Der Code (Ollama-Adapter, feste Liste, Prüfung, Planung, Nachladen) bleibt ungenutzt im Projekt; `Al-10-03` beschreibt, was beim Wiederanschließen zu entscheiden ist (Anbieter Ollama oder LM Studio). Die App bleibt ohne Internet und ohne KI voll spielbar.

### Gesamtcheck: toter Code, Scrollposition, Wiederverwendung (Al-10-01)

- Neues Dokument `docs/GAMEHUB_QUALITY_CHECK.md` mit dem Ergebnis des Gesamtchecks (Schichten, toter Code, Wiederverwendbarkeit, Bedienung, Kartenquelle KI, offene Punkte). Neue Phase `Al-10` in Plan und Status: `Al-10-01` erledigt, `Al-10-02` (Container weiter aufteilen) und `Al-10-03` (Kartenquelle klären) geplant.
- **Schichten:** sauber (Prüfskript und Suche). Entscheidungen zum Kartenbedarf und zu den Anfragen an die Generatoren sind aus dem Container in die Business-Schicht gewandert (`cardPlan.ts`, mit Tests); das Stechen steckt in `useTabooTiebreak`.
- **Toter Code entfernt:** `GameHubFoundation`, die Funktionen und Typen der Sprachwahl in `languageSettings.ts`, `parseCardEntries`, `Category` und `validateCategory`, `saveGeneratedCards`, die leeren Platzhalter `data/index.ts` und `infrastructure/index.ts`, vier CSS-Klassen (Tests dazu entfernt).
- **Wiederverwendbar im game-kit:** `RulesDialog` und `RulesButton` (das Regelfenster mit Reitern, vorher Tabu-eigen) und `useScreenScroll`.
- **Bedienung:** Eine neue Ansicht (Kartenseite, Aufstellung, Spiel) beginnt oben statt an der Scrollposition der alten; das Hauptmenü steht beim Zurückkommen wieder an der alten Stelle (`useScreenScroll`, Test vorhanden; im Browser mit gesendeten Scroll-Ereignissen geprüft).
- **Prüfungen:** 589 Unit-Tests, Abdeckung 98,0 % Zeilen und 93,6 % Zweige (alle Grenzwerte erfüllt), `tsc`, `eslint`, Prettier ohne Befund; die e2e-Tests laufen (26 bestanden, 6 übersprungen wie bisher; Server von Hand gestartet, weil `pnpm` in der Shell fehlt).

### Ein Regelfenster mit allen Spielmodi als Reiter

- Das Fenster „Spielregeln“ ist **ein** Fenster für alle Spielmodi: oben stehen die beiden Regeln, die für jeden Modus gelten (Karte mit 4 verbotenen Wörtern, wie man erklärt), darunter die Spielmodi nebeneinander als Reiter und darunter die Regeln des gewählten Reiters. Der Reiter „Klassisch“ hat den Link zum Fenster „Stechen“ (schließt das Regelfenster, öffnet das Stechen-Fenster). Bedienung auch mit den Pfeiltasten.
- Der Infoknopf in einem Spielmodus öffnet **dasselbe Fenster** beim Reiter dieses Modus und **wählt den Modus aus**. Das bloße Umschalten der Reiter ändert die Auswahl nicht. Der Knopf „Spielregeln“ öffnet beim gewählten Modus. Dafür gibt es `InfoAction` (Infoknopf ohne eigenes Fenster, `onOpen`) im Baustein `InfoButton` und in `ChoiceOption.info`.
- Alle Fenster (`Dialog`) stehen jetzt auch auf dem Handy **mittig** mit Rand (vorher auf dem Handy ein Blatt von unten, erst ab 48 rem mittig). Das Regelfenster hat für alle Spielmodi **dieselbe Größe**: die Regeln aller Modi liegen übereinander im Layout und nur die des gewählten Reiters ist sichtbar, so verschieben sich die Reiter und Knöpfe nicht.
- Tests: Reiter und allgemeine Regeln, Infoknopf wählt den Modus aus, Link zum Stechen, Pfeiltasten (Deutsch und Englisch). Im Browser auf 375 Pixel Breite geprüft.

### Mehr Karten: alle Kategorien auf 30 je Schwierigkeit (Ta-09-08 abgeschlossen)

- Alle zehn Kategorien haben jetzt je Schwierigkeit 30 Karten: **900 Karten je Sprache** (vorher 523 und 521). Claude hat die Karten geschrieben; ein Vorfilter (nur lokal im Arbeitsordner) entfernte vorhandene Begriffe und begrenzte jede Zelle auf 30, danach liefen `import-card-batch` und `review-card-pool merge` mit den Prüfregeln (zum Beispiel kein verbotenes Wort als Teil des Begriffs).
- Nach dem Einbau stichprobenartig auf Wortstämme geprüft: neun neue Karten mit abgeleiteten Wörtern („aufpumpen“ bei „Fahrradpumpe“, „wenden“ bei „Pfannenwender“, „Zauberstab“ bei „Zauberer“ und weitere) bekamen andere verbotene Wörter; ebenso zwei englische Karten.
- Tests: alle 574 grün, Pool-Tests prüfen jede Karte mit der Kartenprüfung.

### Mehr Karten: Probelauf Essen und Trinken (Ta-09-08)

- Ziel festgelegt: 30 Karten je Schwierigkeit und Kategorie (900 je Sprache). Die Karten schreibt Claude, kein lokales Modell; die Skripte `import-card-batch` und `review-card-pool merge` prüfen sie mit den Prüfregeln und bauen sie ein.
- Probelauf mit der Kategorie Essen und Trinken: je 13 neue Karten je Schwierigkeit, Deutsch und Englisch, jetzt je 30. Der Pool hat 562 deutsche und 560 englische Karten. Die Prüfregeln lehnten 5 Karten ab (zweimal Begriff schon in einer anderen Kategorie, einmal „Topf“ als Teil von „Eintopf“); sie wurden ersetzt.
- Aus den Dokumenten entfernt: die Angabe, dass ein lokales Modell (Ollama, LM Studio) die Karten erzeugt.

### Karten: kein verbotenes Wort als Teil des Begriffs (Ta-09-07)

- Neue Prüfregel in der Kartenprüfung (`validateCard`, Fehlercode `part_of_term`): Ein verbotenes Wort ab 3 Buchstaben darf nicht in dem Begriff stecken. Bei „Fußball“ ist „Ball“ nicht erlaubt, weil Teile des Begriffs ohnehin verboten sind. Die Regel gilt beim Eingeben und Importieren von Karten, bei der Erzeugung und beim Spielstart (eine Karte, die dagegen verstößt, wird nicht gespielt). Die Fehlermeldung beim Hinzufügen nennt die Regel (Deutsch und Englisch).
- Bestand geprüft: Der große Pool (523 deutsche, 521 englische Karten) hat keinen Treffer, weil das Erzeugungsskript die Regel schon prüft. Die von Hand geschriebenen Standardkarten hatten 9 Treffer, zum Beispiel „Regenschirm“ mit „Regen“ oder „Toothbrush“ mit „brush“; sie haben jetzt andere verbotene Wörter. Die lokalen Kandidaten haben keinen Treffer.
- Tests: Regel mit Beispielen (Groß- und Kleinschreibung, mehrere Wörter, kurze Wörter bleiben erlaubt).

### IDs der Aufgaben umbenannt: Al, Ta, Wb, Im

- Alle Phasen- und Aufgaben-IDs tragen jetzt ein Kürzel, damit allgemeine Aufgaben und Aufgaben der einzelnen Spiele leicht zu unterscheiden sind: `Al-01-01` (allgemein), `Ta-01-01` (Tabu), `Wb-01` (Wortbombe), `Im-01` (Imposter). Beispiele: `PH-12-07-B` ist jetzt `Ta-06-07-B`, `PH-17-08` ist `Al-09-08`, `PH-15-07` ist `Ta-09-07`. Die Phasen zählen je Kürzel ab 01, die Aufgabennummern innerhalb einer Phase blieben gleich.
- Zuordnung: Al-01 bis Al-09 = bisher PH-00, 01, 02, 03, 08, 09, 10, 16, 17. Ta-01 bis Ta-09 = bisher PH-04, 05, 06, 07, 11, 12, 13, 14, 15. Wb-01 = PH-18, Im-01 = PH-19. Annahme: PH-06 und PH-14 gehören zu Tabu.
- Geändert in allen Dokumenten (Plan, Status, Changelog, ADRs, Spielbausteine, Tabu-Dokumente), im Erzeugungsskript, in einem Code-Kommentar und in den Gedächtnisnotizen. Auch „Phase 16“ heißt jetzt „Phase Al-08“. Das ID-Schema steht im Projektplan.

### Neue Aufgaben im Plan

- `Ta-09-07`: Karten erneut prüfen, kein verbotenes Wort darf ein Teil des Begriffs sein (bei „Fußball“ nicht „Ball“). `Ta-09-08`: noch mehr Karten erzeugen. Beide geplant, noch nicht begonnen.

### Fenster „Spielregeln“ gekürzt

- Das Fenster „Spielregeln“ enthält nur noch, was für alle Modi gilt (Karte mit Begriff und 4 verbotenen Wörtern, wie man erklärt). Punkte, Spielende und „Auf Zeit“ stehen nur noch bei den Infoknöpfen der Spielmodi, damit nichts doppelt erklärt wird.

### Infofenster ohne Schatten

- Der Schatten um die Infofenster (`.dialog`) ist entfernt; das Fenster steht nur noch vor dem abgedunkelten Hintergrund.

### Ergebnisse korrigieren in allen Spielmodi (Ta-06-07-F)

- Stechen und „Auf Zeit“: Jeder Versuch speichert alle Karten mit Ergebnis. Nach dem Durchgang und auf der Endseite kann man jede Karte zwischen richtig und falsch umschalten (Feld „Ergebnis korrigieren“, ein aufklappbarer Eintrag pro Team). Wertung und Sieger werden neu berechnet (neue Ereignisse `reviseTiebreakResult` und `reviseRunResult`). Übersprungene Karten bleiben unverändert; mehr richtige Karten als erlaubt gehen nicht.
- Entscheidung: Beim Stechen und bei „Auf Zeit“ gibt es **keine Zeitstrafe**. Eine falsch gewertete Karte zählt nicht; weniger Karten stehen hinter mehr Karten, bei gleich vielen entscheidet die Zeit. In „Auf Zeit“ zeigt die Liste dann „x/y Karten · Zeit“.
- Die Klassisch-Runde hatte die Korrektur schon; die Kartenliste ist jetzt ein gemeinsamer Baustein (`TabooReviewList`).
- Tests: Logik (`revise.test.ts`: Rangfolge, Gleichstand, Grenzen, Zwischenstand, Spielende) und Oberfläche (Stechen, „Auf Zeit“ in Deutsch und Englisch).

### Stechen-Ansicht mit Verweis aus den Regeln

- Neuer letzter Stichpunkt in den Regeln „Klassisch“: „Bei Unentschieden gibt es ein **Stechen**.“ Das Wort „Stechen“ ist ein Link: Ein Klick schließt das Fenster des Modus und öffnet das eigene Fenster „Stechen“ (Deutsch und Englisch, Text `tabooSetup.info.tiebreak`, Titel `tabooTiebreakInfo.title`). Derselbe Infoknopf sitzt jetzt in der Option „An“ unter „Stechen bei Gleichstand“ statt an der Überschrift. Kein größerer Abstand mehr beim letzten Punkt.
- `InfoButton` kann von außen gesteuert werden (`open`, `onOpenChange`) und zeigt Inhalte, die kein Text sind, in einem `div`; neue Klasse `kit-link-button` für Links im Text. Regel in `docs/GAMEHUB_UI_RULES.md`.
- Tests: Link aus den Regeln öffnet das Fenster „Stechen“ und schließt das Regelfenster (beide Sprachen), Fenstertitel der Einstellung angepasst.

### Spielregeln und Karten in ihren Kapiteln, Regeln pro Spielmodus

- Die Werkzeugleiste unter der Kopfleiste ist weg. Der Knopf „Spielregeln“ steht ganz oben im Feld „Spieleinstellungen“, der Knopf „Karten“ (Editor) ganz oben im Feld „Karten“ (`ADR-021`, `docs/GAMEHUB_UI_RULES.md`). `SetupScreen` hat dafür keine Plätze `rules` und `editor` mehr.
- Regel ergänzt: Jeder Spielmodus hat einen aufklärenden Infoknopf, der beim Klick die Auswahl nicht ändert und den Modus in einem eigenen Fenster erklärt.
- Jeder Spielmodus hat seine eigenen Regeln hinter einem Infoknopf in seiner Auswahlkarte (neu: `ChoiceOption.info` und `InfoButton` mit `className`). Das Fenster erklärt nur diesen Modus (neue Texte `tabooMode.classicRules` und `tabooMode.raceRules`, Deutsch und Englisch). Der einzelne Infoknopf an der Überschrift der Gruppe ist ersetzt; das allgemeine Fenster „Spielregeln“ bleibt.
- Regeln „Klassisch“ korrigiert: Der Satz „Die Gegner achten auf verbotene Wörter“ ist gestrichen (das kann die App nicht; auch im Fenster „Spielregeln“). Das **Stechen** wird nicht beim Spielmodus erklärt, sondern beim Infoknopf der Einstellung „Stechen bei Gleichstand“ (wer mitspielt, 3 Karten leicht, mittel, schwer, 90 Sekunden, Wertung, gemeinsamer Sieg bei „Aus“).
- Klassisch: Punkte und Sieg in einem Stichpunkt zusammengefasst („Für jeden erratenen Begriff gibt es 1 Punkt. Das Team mit den meisten Punkten gewinnt.“), jetzt 3 Punkte.
- Die Regeln der Modi sagen nur noch kurz, **was man tun muss und wie man gewinnt** (Klassisch 3 Punkte, Auf Zeit 2). Überspringen, verbotene Wörter als Knopf und die Namen der Knöpfe stehen nicht mehr dort, weil Einstellungen und Knöpfe in der Runde selbsterklärend sind. Im Fenster „Spielregeln“ entfällt die Zeile zum Überspringen, die Wertung nennt nur noch den Punkt für jeden erratenen Begriff.
- Alle Erklärungen noch kürzer: zusammengehörige Aussagen stehen in **einem** Stichpunkt statt in mehreren (Klassisch jetzt 5 Punkte, Auf Zeit 3, Stechen 5). Zum Beispiel: „Ein Spieler erklärt den Begriff seinem Team, ohne die 4 verbotenen Wörter, den Begriff selbst oder Teile davon zu sagen.“ und „Jeder erratene Begriff gibt 1 Punkt.“ Regel dazu in `docs/GAMEHUB_UI_RULES.md`.
- Regeln „Klassisch“ von Grund auf verständlich neu geschrieben, für jemanden, der Tabu nicht kennt: Auf jeder Karte steht ein Begriff und 4 verbotene Wörter; man darf sie nicht sagen, auch nicht den Begriff selbst oder Teile davon (Beispiel „Fußball“ und „Ball“); die Knöpfe „Richtig“, „Verbotenes Wort“ und „Überspringen“ sind mit ihren echten Namen erklärt; die Zeit läuft, danach ist das nächste Team dran. Dasselbe im Fenster „Spielregeln“ (Deutsch und Englisch).
- Alle Regeln und Erklärungen (Fenster „Spielregeln“, Infoknöpfe der Einstellungen und der Modi) einfacher und kürzer formuliert und als Stichpunkte geschrieben (Deutsch und Englisch). Regel dafür in `docs/GAMEHUB_UI_RULES.md`.
- Die Erklärungen der Spielmodi und „Karten pro Team“ stehen jetzt in **Stichpunkten** (eine kurze Aussage pro Punkt, Deutsch und Englisch). `InfoButton` zeigt einen Text mit mehreren Zeilen als Liste; die Regel steht in `docs/GAMEHUB_UI_RULES.md`. Das allgemeine Fenster „Spielregeln“ hat für „Auf Zeit“ einen kurzen Satz.
- Infoknopf in der Auswahlkarte: Die Animation beim Klicken ist behoben (die senkrechte Zentrierung per `transform` sprang, weil Knöpfe beim Drücken per `transform` kleiner werden; jetzt ohne `transform` zentriert). Die Regeln „Auf Zeit“ (Infoknopf, Fenster „Spielregeln“) und die Erklärung „Karten pro Team“ sind in einfachen kurzen Sätzen neu formuliert (Deutsch und Englisch).
- Tests: Infoknöpfe pro Modus in beiden Sprachen, Kapitel mit Regeln und Editor im `SetupScreen`-Test. Im Browser auf 375 Pixel Breite geprüft, die Layoutprüfung bleibt grün (Infoknöpfe 44 Pixel).

### Kopfleiste umgebaut

- Neue Regel: Links steht der Spielname (der blaue Punkt davor ist entfernt), rechts die Knöpfe **Spieler**, **Einstellungen** und ganz rechts **Home**. Home steht immer ganz rechts. (Zwischenstände mit Home links und mittigem Namen wurden am selben Tag wieder verworfen.)
- Der Knopf „Spieler“ steht nun im Hauptmenü jedes Spiels ebenfalls in der Kopfleiste (wie in der Spielauswahl) und nicht mehr in der Werkzeugleiste darunter; die Werkzeugleiste hat nur noch Editor (falls vorhanden) und Spielregeln, `SetupScreen` bringt den Spielerknopf nicht mehr mit.
- Unteransichten (Spiel, Editor) behalten ihre Kopfleiste: nur Zurück, Pause oder „Spiel beenden“ oben rechts, kein Home und keine Einstellungen.
- Tests: Reihenfolge der Knöpfe in der Spielauswahl und im Hauptmenü eines Spiels sowie kein Farbpunkt mehr. Im Browser auf 375 Pixel Breite geprüft.

### Spielerverwaltung überarbeitet

- Das Fenster hat immer dieselbe Größe: Die Listenfläche hat eine feste Höhe, bei mehr Spielern erscheint ein Scrollbalken (ebenso in der Auswahl aus der Spielerliste). Die Fehlermeldung hat eine feste Zeile, damit sich nichts verschiebt.
- Namen werden automatisch korrigiert: Der erste Buchstabe wird ein Großbuchstabe (`capitalizePlayerName`, gilt auch für gespeicherte Namen).
- „Hinzufügen“ ist ein Plus-Symbol (Beschriftung und Tooltip bleiben).
- Der Löschknopf steht außerhalb der Namenszeile; der Name hat eine eigene Box.
- Löschknöpfe mit Bestätigung (`ConfirmButton`, rote Variante): vor dem ersten Tippen ein dezentes Rot, danach ein kräftiges deckendes Rot. Knöpfe nur mit Symbol (Spielerliste, Karteneditor) zeigen keinen Text mehr, der nicht hineinpasst; nur der Name für Screenreader ändert sich. Die Regeln dazu stehen in `docs/GAMEHUB_UI_RULES.md`.
- Der Plus-Knopf und die Löschknöpfe sind gleich groß (44 Pixel, quadratisch) und enden am selben Rand. Der Scrollbalken hat eine feste Breite mit reserviertem Platz und liegt rechts neben den Löschknöpfen mit Abstand (im Rand des Fensters), die Knöpfe behalten ihren Platz.
- Das Eingabefeld für neue Spieler sieht aus wie die Namensboxen der Liste (44 Pixel hoch, gleiche Ecken, kein gefüllter Hintergrund). Die Spielerliste zeigt immer genau fünf Spieler vollständig, keiner ist angeschnitten; beim Scrollen rastet die Liste an ganzen Zeilen ein (gilt auch für die Auswahl aus der Spielerliste).
- Fehler behoben: Das Fenster saß in der Kopfleiste (Spielerknopf des GameHub) wegen deren Unschärfe nicht am unteren Rand, sondern wurde nach oben aus dem Bild verschoben. `Dialog` hängt sich jetzt per Portal an die Seite (`document.body`), kein Elternelement kann die Lage mehr verändern. Test dafür ergänzt.
- Notiert für später (`Al-09-08`, geplant): Spielergruppen (zum Beispiel mehrere Freundesgruppen), um Namen schneller zu finden.
- Geprüft: 546 Unit-Tests, 26 e2e-Tests (6 übersprungen), Typen, ESLint, Prettier; im Browser auf 375 Pixel Breite.

### Al-09-07 – Aufstellung nach dem Start

- Das Hauptmenü von Tabu enthält nur noch Spieleinstellungen und Karten. „Starten“ führt zur neuen Ansicht **Aufstellung**: Teams, Namen, Reihenfolge, Spielerliste (offen), Auswahl aus der gespeicherten Spielerliste und Zuweisung von Hand oder per Knopf zufällig. „Spiel starten“ steht fest unten; die Kopfleiste hat den Zurückknopf (`ADR-023`, ändert die Regel aus `ADR-021`).
- Neu im `game-kit`: `LineupScreen` (Rahmen mit Meldungen und Startknopf), `TeamsSetup` kann die Spielerliste offen zeigen (`playersOpen`).
- Tabu: `TabooSetup` liest die Einstellungen beim ersten Start einmal (`readTabooSettings`, neuer reiner Teil in `tabooSetupModel.ts`) und bereitet erst beim Start der Aufstellung die Karten vor, weil dort die Teamzahl feststeht (auch die Prüfung auf genug Karten und die KI-Kartenvorbereitung). `TabooSetupMessages` zeigt die Fehler in beiden Ansichten. Ein Teamwechsel während der Kartenvorbereitung bricht sie ab.
- „Mit gleicher Konfiguration neu spielen“ führt in die Aufstellung (Teams vorbelegt), die Karten des vorigen Spiels werden wiederverwendet, wenn sie für die neue Aufstellung reichen. Im Endstand wird nichts gelost oder verteilt.
- Tests: neue Tests für die Aufstellung und `LineupScreen`, alle Abläufe um den zweiten Schritt ergänzt (Unit, e2e, Sprachdurchlauf, Handy-Layoutprüfung der Aufstellung in beiden Sprachen).
- Geprüft: 544 Unit-Tests, 26 e2e-Tests (6 übersprungen), Typen, ESLint, Prettier, Schichtprüfung; im Browser auf 375 Pixel Breite.

### Fehler behoben: „Neue Partie konfigurieren“ nach „Auf Zeit“

- Nach dem Endstand von „Auf Zeit“ blieb der Endstand stehen und das Setup erschien darunter, die Knöpfe taten nichts mehr. Ursache: Das Rennen und das Setup-Formular benutzten im selben Container beide den Schlüssel `0` (React meldete doppelte Schlüssel), dadurch wurde das Rennen nicht entfernt. Die Schlüssel haben jetzt Vorsilben (`race-…`, `form-…`).
- Der Komponententest prüft jetzt, dass nach „Neue Partie konfigurieren“ der Endstand verschwunden ist (vorher prüfte er nur, dass das Setup sichtbar ist). Im Browser geprüft: Endstand, „Mit gleicher Konfiguration neu spielen“, nochmal Endstand, „Neue Partie konfigurieren“.

### Auf Zeit: faire Karten für alle Teams

- Frage des Auftraggebers: Bekommen alle Teams dieselbe Schwierigkeitsmischung? Die Mischung war je Lauf gleich verteilt, konnte aber still abweichen: Fehlte eine Schwierigkeit, füllte die Kartenwahl aus einer anderen auf, ebenso bei Ersatzkarten.
- Jetzt streng: Die Kartenwahl (`raceCards.ts`) liefert genau die Mischung (bei 5 Karten 2 leichte, 2 mittlere, 1 schwere) und nie Karten einer anderen Schwierigkeit; Ersatzkarten haben dieselbe Schwierigkeit, sonst sind Überspringen und Verbotenes Wort gesperrt. Die Mischung gilt nur für die im Setup gewählten Schwierigkeiten.
- Neu: `raceCardShortage` prüft vor dem Start, ob jede benutzte Schwierigkeit genug Karten hat (Karten aller Läufe plus zwei Ersatzkarten je Team). Sonst meldet das Setup „Zu wenige Karten der Schwierigkeit …“ (Deutsch und Englisch), statt ungleiche Karten zu geben.
- Tests: Mischung bei mehreren Teams nacheinander, Filter, kein Auffüllen, Kartenmangel, ganze Oberflächenläufe (beide Teams haben dieselbe Mischung) und die Meldung in beiden Sprachen.
- Geprüft: 541 Unit-Tests, 26 e2e-Tests (6 übersprungen), Typen, ESLint, Prettier, Schichtprüfung.

### Setup in drei Felder, Standard 5 Karten

- Das Tabu-Setup hat jetzt drei Felder: „Teams und Spieler“, „Spieleinstellungen“ (Spielmodus und die Gruppen des gewählten Modus) und „Karten“ (Kartensprache, Kartenquelle, Schwierigkeit, Kategorien). Einstellungen, die nicht vom Spielmodus abhängen, sind damit von den Spieleinstellungen getrennt. Regel in `docs/GAMEHUB_UI_RULES.md` ergänzt.
- „Karten pro Team“ im Modus „Auf Zeit“ steht standardmäßig auf 5 (Auswahl 5, 10, 15).
- Geprüft: 533 Unit-Tests, 26 e2e-Tests (6 übersprungen), Typen, ESLint, Prettier; im Browser auf 375 Pixel Breite.

### Ta-06-07-B – Oberfläche „Auf Zeit“

- Setup: Neue Knopfgruppe „Spielmodus“ (Klassisch, Auf Zeit) in den Spieleinstellungen. Im Modus „Auf Zeit“ erscheint „Karten pro Team“ (5, 10, 15) statt Runden, Rundendauer, Überspringen und Stechen; Kartenquelle, Schwierigkeit und Kategorien bleiben. Info-Knöpfe erklären beide Gruppen. Das Rennen braucht je Team Zielzahl plus zwei Ersatzkarten, sonst meldet das Setup den Kartenmangel.
- Spiel: `TabooRaceGame` (Übersicht vor jedem Lauf mit den bisherigen Zeiten, Endstand mit Sieger und sortierten Zeiten über `ScoreScreen`), `TabooRaceRun` (Stoppuhr, Karte, Richtig, einmal Überspringen, Verbotenes Wort mit Ersatzkarte, Pause mit „Lauf neu starten“) und `TabooRaceResults`. Die Spiellogik bleibt in `race.ts`; die Oberfläche liefert nur Uhr und Ersatzkarten.
- Das Fenster „Spielregeln“ erklärt den neuen Modus. Alle Texte in Deutsch und Englisch.
- Fehler behoben: Die Auswahlgruppen im Tabu-Setup hatten wieder einen eigenen Rahmen (Rückschritt des letzten Umbaus der Einstellungen); der Stil in `taboo.css` ist bereinigt.
- Beim Wechsel des Spielmodus bleiben alle Einstellungen erhalten: Die Gruppen beider Modi bleiben im Formular und werden nur ausgeblendet (statt neu aufgebaut), auch bei Wechsel hin und zurück.
- Tests: Komponentenläufe in beiden Sprachen (Setup-Gruppen, ganzes Rennen mit zwei Teams und Sieger, Überspringen und verbotenes Wort) und eine neue Handy-Layoutprüfung aller Rennansichten (Setup, Übersicht, Lauf, Pause, Endstand) in beiden Sprachen.
- Geprüft: 533 Unit-Tests, 26 e2e-Tests (6 übersprungen), Typen, ESLint, Prettier, Schichtprüfung; im Browser auf 375 Pixel Breite.

## 2026-11-12

### Ta-06-07-A – Spiellogik „Auf Zeit“

- Neu: `src/business/games/taboo/race.ts`, eine reine Zustandsmaschine mit eigener Konfiguration (`RaceConfiguration`): Zustände `overview`, `running`, `finished`; Ereignisse `beginRun`, `answerCard` (richtig, überspringen einmal, verbotenes Wort, jeweils mit Ersatzkarte), `restartRun`. Zeiten kommen von außen (ungültige Werte werden ignoriert), Sieger nach Zehntelsekunden, gleiche Zeit ist gemeinsamer Sieg. Zielzahlen 5, 10, 15 (Standard 10).
- Neu: `raceCards.ts` mit gleicher Schwierigkeitsmischung für jedes Team, Auswahl ungespielter Karten und Ersatzkarten gleicher Schwierigkeit.
- `validateTeams` aus `model.ts` herausgelöst, damit alle Modi dieselbe Teamprüfung nutzen (klassischer Modus unverändert).
- Tests: Regeltests, Kartentests und eine Zufallsprüfung mit 60 Durchläufen und Invarianten; Abdeckung von `race.ts` 100 % Zeilen, 95 % Zweige.
- Entwurf angepasst: eigene Konfiguration je Modus statt `mode` in `GameConfiguration`; Kartengerechtigkeit (Annahme 6) als gleiche Schwierigkeitsmischung umgesetzt.
- Geprüft: 527 Unit-Tests, Typen, ESLint, Prettier, Schichtprüfung. Die Oberfläche folgt in `Ta-06-07-B`.

### Ta-06-07 – Regelentwurf der Spielmodi

- Der Auftraggeber hat die Abläufe der Modi festgelegt. „Auf Zeit“: jedes Team spielt am Stück bis zur Zielzahl, Überspringen einmal pro Team mit ersetzter Karte, gleiche Zeit ist gemeinsamer Sieg. „Gegen die Zeit“: Zeitkonto 2, 3 oder 5 Minuten; der Vorschlag „Gegnerteam erklärt“ wurde abgelehnt, weil es absichtlich trödeln könnte, deshalb erklärt und rät das aktive Team selbst.
- `docs/GAMEHUB_TABOO_MODES.md` hält die Regeln, die Einbindung in die Architektur (zwei neue reine Zustandsmaschinen, `mode` in der Konfiguration, Knopfgruppe „Spielmodus“ im Setup, bestehende Ansichtstypen), die Teilaufgaben A bis E und sieben offene Annahmen fest. Es wurde noch nichts gebaut; `Ta-06-07` steht auf `in_progress` bis zur Bestätigung.

### Kartensprache ist eine Einstellung von Tabu

- Das Einstellungsfenster des GameHub enthält nur noch die Oberflächensprache. Die Kartensprache steht als erste Knopfgruppe (Englisch links) in den Spieleinstellungen von Tabu.
- Der Spielmodul-Vertrag (`GameScreenProps`) bekommt `onCardLanguageChange`; `App` reicht es durch, `AppShell` und `SettingsDialog` kennen die Kartensprache nicht mehr. Die Speicherung bleibt zentral in `AppRoot` (Annahme: ein eigener Speicher je Spiel ist erst nötig, wenn ein zweites Spiel eine eigene Inhaltssprache braucht).
- Texte der Einstellungen angepasst, Tests (Unit und e2e) auf den neuen Ort umgestellt, neue Tests für die Gruppe in beiden Sprachen.
- Geprüft: 443 Unit-Tests, 25 e2e-Tests (5 übersprungen), Typen, ESLint, Prettier.

### Al-01-08 – Aufgaben nach Spielen

- Das Entwicklungs-Dashboard zeigt allgemeine und spielspezifische Aufgaben in eigenen Tabs.

### Einstellungen: Knopfgruppen statt Comboboxen

- Oberflächensprache und Kartensprache im Einstellungsfenster sind jetzt je eine Gruppe nebeneinanderstehender Knöpfe (`ChoiceGroup`, gesteuert) statt Comboboxen; passt zum übrigen Setup. Die Gruppen haben dieselben Namen wie die Comboboxen (Gruppe „Oberflächensprache“ mit Knöpfen „Deutsch“ und „Englisch“).
- `ChoiceGroup` ist jetzt im Kit grundsätzlich ohne Rahmen und Innenabstand (die Tabu-Sonderregel entfällt); alte Stilregeln für die Comboboxen entfernt.
- Englisch steht links (Standardsprache der App), Deutsch rechts.
- Tests (Unit und e2e) auf die Knöpfe umgestellt. Regel ergänzt: Auswahl aus wenigen festen Möglichkeiten ist eine Knopfgruppe. Noch Comboboxen: Kategorie und Schwierigkeit in den Karten und die Teamzuordnung je Spieler.

### GameHub-Ansicht auf dem Handy kompakt

- Der Knopf „Spieler“ des GameHub steht jetzt in der Kopfleiste (neben den Einstellungen) statt im Inhalt der Spielauswahl, mit Symbol und Text, weil das Symbol allein nicht selbsterklärend ist.
- Die Spielauswahl ist auf dem Handy kompakt: Überschrift und Einleitung sind nur noch für Screenreader sichtbar (ab Tabletbreite wie bisher sichtbar), die Spielkarten beginnen direkt unter der Kopfleiste.
- Geprüft: 440 Unit-Tests, 25 e2e-Tests (5 übersprungen), im Browser auf 375 Pixel Breite.

### Al-09-06 – Spielerverwaltung

- Neu: dauerhaft gespeicherte Spielerliste für alle Spiele (`ADR-022`). Reine Logik in `src/business/shared/playerRoster.ts` mit Tests, Port `PlayerRosterStore`, Adapter im lokalen Browserspeicher (`gamehub.players`; kaputte Daten werden ignoriert, fehlender Speicher bricht nichts).
- Knopf „Spieler“ in der Werkzeugleiste jedes Spiel-Hauptmenüs (kommt automatisch aus `SetupScreen`) und auf der Spielauswahl des GameHub. Er öffnet ein Fenster zum Hinzufügen (Enter oder „Hinzufügen“) und Löschen (zwei Tipps) von Spielern; Meldungen bei leerem, doppeltem oder ungültigem Namen.
- In „Teams und Spieler“ (`TeamsSetup`, `PlayersSetup`) wählt „Aus Spielerliste wählen“, wer heute mitspielt (Häkchen, „Alle wählen“, „Übernehmen“, „Abbrechen“). Ausgewählte kommen ins Spielerfeld, abgewählte Listenspieler gehen, von Hand getippte Namen bleiben. Danach wie bisher verteilen. „Letzte Gruppe laden“ (`Al-09-03`) bleibt.
- Werkzeugleiste unter der Kopfleiste ist jetzt eine Reihe mit gleich breiten Knöpfen (passt mit drei Knöpfen auf ein 375-Pixel-Handy).
- Fehler behoben: `Dialog` setzte den Fokus bei jedem Rendern auf den Schließen-Knopf zurück; Tippen in Eingabefeldern eines Fensters war dadurch nicht möglich.
- Geprüft: 440 Unit-Tests, 25 e2e-Tests (5 übersprungen), Typen, ESLint, Prettier, Schichtprüfung; im Browser auf Spielauswahl und Tabu-Hauptmenü (Desktop und 375-Pixel-Handy).

### Al-09-03 – Teams und Spieler zwischen Spielen merken

- Neu: Port `TeamSetupMemory` und reine Prüfung gespeicherter Daten in `src/business/shared/savedTeamSetup.ts`; Adapter `src/infrastructure/localStorageTeamSetupMemory.ts` (lokaler Browserspeicher, Schlüssel `gamehub.teamSetup`; kaputte oder fehlende Daten werden ignoriert, fehlender Speicher bricht nichts).
- `game-kit`: `TeamSetupMemoryProvider` und `useTeamSetupMemory`; `TeamsSetup` zeigt „Letzte Gruppe laden“, `PlayersSetup` „Letzte Spieler laden“, jeweils nur wenn eine Gruppe gemerkt ist, die sich vom aktuellen Stand unterscheidet. Eine Teamzahl über der Grenze des Spiels wird eingepasst. Texte in Deutsch und Englisch.
- Tabu merkt die Gruppe beim Start (nicht bei einem leeren Setup). Die Gruppe gilt in allen Spielen.
- Abweichung vom Entwurf: `localStorage` statt IndexedDB (kleiner Datensatz, keine Änderung der Kartendatenbank); der Port erlaubt späteren Wechsel.
- Geprüft: 421 Unit-Tests, 25 e2e-Tests (5 übersprungen), Typen, ESLint, Prettier, Schichtprüfung; im Browser: Speichern beim Start, Laden nach Neuladen.

### Al-09-05 – Feste Ansichten im game-kit umgesetzt

- Neue Bausteine: `ActionRow` (Knopfreihe, gleich breit und hoch), `ScoreScreen` (Zwischenstand, Stechen-Übersicht und Endstand mit optionalem Sieger) und `ManageScreen` (Rahmen des Editors mit Titel, Hinweis, Kapiteln, Aktionsreihe, Meldungen). Tests für alle drei.
- `SetupScreen` ist das Hauptmenü: statt einer freien Werkzeugleiste hat es die Plätze `rules` (Pflicht) und `editor` (optional).
- Tabu umgestellt (Kartenseite, Karteneditor, Rundenübersicht, Stechen, Endstand); die Stile wanderten aus `taboo.css` ins Kit (`kit-action-row`, `kit-manage`, `kit-score-screen`, `kit-winner`). Verhalten unverändert; „Abbrechen“ im Karteneditor ist jetzt rot (Regel „Abbrechen ist rot“).
- Geprüft: 394 Unit-Tests, 25 e2e-Tests (5 übersprungen) inklusive Handy-Layout, Typen, ESLint, Prettier; Zwischenstand im Browser angesehen.

### ADR-021 – Feste Ansichten und Oberflächenregeln

- Der Auftraggeber hat die Ansichten und Oberflächenregeln für alle Spiele vorgegeben (Hauptmenü, Spielansichten, Infofenster, einheitliche Bedienelemente, Knopfregeln). Festgehalten in `docs/GAMEHUB_UI_RULES.md` und `ADR-021`; Umsetzung als Aufgabe `Al-09-05` geplant (noch nicht gebaut).

### Al-09-02 – Gemeinsame Team- und Spieleransicht umgesetzt

- Neue reine Logik `src/business/shared/teamSetup.ts`: `buildTeams` (Namen auffüllen, Reihenfolge zufällig oder wie eingegeben, Spieler den Teams zuordnen), `TeamRules`, `validateTeamSetup`, `initialTeamSetup`, `clampTeamCount`. Tests mit festem Zufall.
- Neue Bausteine im `game-kit`: `SetupScreen`, `SetupSection`, `TeamsSetup` (gesteuert), `PlayersSetup` (nur Spielerliste) und intern `PlayerListField`. `ChoiceGroup` kann gesteuert genutzt werden (`value`, `onChange`).
- Texte in `src/i18n/resources/<sprache>/kit.ts`, Stile in `src/presentation/styles/kit-setup.css` (aus `taboo.css`, `taboo-more` heißt jetzt `kit-disclosure`).
- Tabu umgestellt: `TabooSetupForm` baut auf den Bausteinen auf, `TabooSetup` hält einen `TeamSetupValue` und ruft `buildTeams` auf; `TabooPlayers` und die Tabu-Teamtexte sind entfallen. `Team` im Tabu-Modell hat optional `players`; die Spieler kommen im Spielzustand an, die Rundenübersicht zeigt sie noch nicht.
- Verhalten unverändert (alle bisherigen Tests liefen ohne Anpassung der Erwartungen, e2e grün). Kleine Verbesserung: Die Teamliste unter der Spielerverteilung zeigt eingetragene Teamnamen statt „Team N“.
- Im Browser geprüft: Teams ändern, Namen, Spielerverteilung, Start mit den eingetragenen Teamnamen. Leitfaden für neue Spiele ergänzt.
- Jedes Kapitel des Setups („Teams und Spieler“, „Spieleinstellungen“) lässt sich auf- und zuklappen (`SetupSection`, standardmäßig offen, `defaultOpen` einstellbar). Zugeklappte Werte bleiben im Formular und werden beim Start übernommen.

### Al-09-01 – Entwurf der gemeinsamen Team- und Spieleransicht

- Neues Dokument `docs/GAMEHUB_SETUP_KIT.md`: Ist-Zustand im Tabu-Setup, was Spiele brauchen, Entwurf (reine Logik `buildTeams` und `TeamRules` in `business/shared`; `SetupScreen`, `SetupSection`, `TeamsSetup` und optional `PlayersSetup` im `game-kit`; Texte in `kit.ts`; Stile im `game-kit`; Handy- und PC-Layout mitgedacht), Umbau von Tabu in vier verhaltensgleichen Schritten, fünf offene Entscheidungen und Risiken. Noch nichts umgesetzt. Freigabe durch den Auftraggeber: Teams gesteuert mit Spielern, `PlayersSetup` gleich mit, Merken später (`ADR-020`); Rundenübersicht mit Spielern und Grenzen 2 bis 6 Teams als Vorgabe angenommen.

### Eigene Kategorien und Karten in der Kartenliste getrennt

- In „Karten nach Kategorie“ stehen jetzt zwei beschriftete Gruppen: zuerst „Eigene Kategorien“, dann „Standard-Kategorien“ (die Beschriftungen erscheinen nur, wenn es eigene Kategorien gibt). Innerhalb einer Kategorie stehen „Eigene Karten“ und „Mitgelieferte Karten“ als getrennte Blöcke, die eigenen zuerst (Beschriftung nur, wenn beide vorhanden sind). Sortiert wird weiter alphabetisch und von leicht nach schwer, jeweils innerhalb der Gruppe oder des Blocks.
- Im Browser geprüft mit einer eigenen Kategorie („Zauberei“) und einer eigenen Karte in „Technik“. Prüfungen: 361 Unit-Tests, 25 e2e, tsc, eslint.

### Sortierung der Kategorien und Karten

- Kategorien erscheinen alphabetisch nach ihrem angezeigten Namen (in der Oberflächensprache, Umlaute wie ihr Grundbuchstabe, Groß- und Kleinschreibung egal): in „Karten nach Kategorie“, im Auswahlfeld beim Hinzufügen und Bearbeiten und im Setup (dort getrennt in Standard und Eigene, jeweils alphabetisch). Eigene Kategorien sortieren sich automatisch zwischen die anderen ein.
- Karten einer Kategorie stehen von leicht bis schwer, innerhalb einer Schwierigkeit alphabetisch nach Begriff. Eigene und mitgelieferte Karten werden dabei gemischt (vorher standen die eigenen zuerst).
- Neue reine Logik `src/business/games/taboo/ordering.ts` (`sortCardsForList`, `sortByLabel`, `compareText`) mit Tests. Im Browser geprüft (Setup, Auswahl, Liste, Technik von „Batterie“ bis „Wärmebildkamera“). Prüfungen: 361 Unit-Tests, 25 e2e, tsc, eslint.

### Ta-09-05 – Pool übernommen

- Auf Wunsch des Auftraggebers wurden alle geschriebenen Karten übernommen: `src/data/pool/de.json` hat 523 und `en.json` 521 Karten in allen zehn Kategorien (17 bis 19 je Kategorie und Schwierigkeit). Zusammen mit den 45 eingebauten Karten je Sprache sind es rund 570.
- Build: Die Pakete sind eigene Teile (`de-*.js` etwa 74 kB, `en-*.js` etwa 72 kB, gepackt je etwa 15 kB), vom Offline-Speicher mit vorgehalten; der Hauptteil der App ist unverändert groß.
- Neue Tests: Jede Kategorie und Schwierigkeit hat mindestens 15 Karten, und Kennungen und Begriffe sind über Pool und eingebaute Karten hinweg eindeutig. Prüfungen: 355 Unit-Tests, 25 e2e (frischer Build), tsc, eslint.
- Im Browser geprüft: Das Setup zeigt alle zehn Kategorien auf Handy-Breite; eine Partie nur mit „Technik“ spielte eine Karte aus dem Pool („Oszilloskop“, schwer). Die Karten wurden von Claude geschrieben, ohne unabhängigen zweiten Prüfdurchgang und ohne Durchsicht durch den Auftraggeber.

### Ta-09-05 – Etappen: alle zehn Kategorien geschrieben (in Arbeit)

- Neues Werkzeug `scripts/import-card-batch.mjs`: schickt eine Stapeldatei mit Karten durch dieselben Regeln wie die erzeugten Karten und legt die angenommenen im Arbeitspaket in `work/` ab (Ablehnungen mit Grund in der Liste, mit `--score` zusätzlich ein Urteil, `--dry-run` zur Vorschau).
- Erste Etappe: je Sprache 51 Karten der Kategorie „Essen und Trinken“ (je 17 leicht, mittel, schwer), von Claude geschrieben. Das lokale 27-Mrd.-Modell wurde nach dem Zeitlimit-Fehler nicht weiter benutzt. Die Regeln lehnten je Sprache zwei Karten ab, deren Begriffe es schon gab („Apfel“, „Brot“), sie wurden ersetzt. Die Karten liegen nur in `work/` (nicht versioniert) und sind noch nicht in den Pool übernommen. Wichtig: Es gab keinen unabhängigen zweiten Prüfdurchgang, die Urteile (5) setzte der Import; die Stichprobe per Prüfseite ist die Kontrolle.
- Zweite Etappe: je Sprache 52 Karten der Kategorie „Tiere“ (17 leicht, 17 mittel, 18 schwer). Auch sie liegen nur in `work/`; die Regeln lehnten je Sprache drei schon vorhandene Begriffe ab (Hund, Eichhörnchen, Biene beziehungsweise Dog, Squirrel, Bee).
- Dritte und vierte Etappe: je Sprache etwa 53 Karten der Kategorien „Sport und Freizeit“ und „Berufe“ (18 leicht, 17 mittel, 18 schwer, bei Berufen 19/17/17). Die Regeln lehnten englisch zwei Karten ab, weil ein verbotenes Wort Teil des Begriffs war („Snowboarding“ mit „snow“, „Lawyer“ mit „law“); sie wurden mit anderen Wörtern ersetzt. Arbeitspaket jetzt je Sprache etwa 210 Karten in vier Kategorien, alles nur in `work/`, nichts übernommen.
- Fünfte bis siebte Etappe: „Orte und Reisen“, „Film, Musik und Medien“ und „Technik“, je Sprache zwischen 52 und 53 Karten. Die Regeln lehnten viele Karten ab: Begriffe, die es schon gab („Museum“, „Kino“, „Buch“, „Gitarre“, „Theater“ und andere), und verbotene Wörter, die den Begriff enthielten („Bagpipes“ mit „pipes“, „Farm“ mit „farmer“, „Speedometer“ mit „speed“). Sie wurden durch andere Karten ersetzt. Arbeitspaket jetzt Deutsch 367 und Englisch 366 Karten in sieben Kategorien, alles nur in `work/`, nichts in den Pool übernommen. Die drei Kategorien der eingebauten Karten (Alltag, Natur, Kultur) sind noch nicht ergänzt.
- Letzte Etappe: Alltag, Natur und Kultur ergänzt (je Sprache 51 bis 53 neue Karten je Kategorie zusätzlich zu den 15 eingebauten). Die Regeln lehnten fünf Karten ab, weil ein verbotenes Wort den Begriff enthielt („Decke“ mit „zudecken“, „Erdbeben“ mit „Beben“, „Watering can“ mit „Water“, „Thunderstorm“ mit „thunder“, „Heath“ mit „heather“); sie wurden ersetzt. Arbeitspaket jetzt **Deutsch 523 und Englisch 521 Karten in allen zehn Kategorien**, nur in `work/`, noch nicht in `src/data/pool` übernommen. Die ersten Etappen sind damit komplett; offen sind die Durchsicht durch den Auftraggeber und die Übernahme.

### Korrektur an den Kartenwerkzeugen: Antworten als Datenstrom

- Der erste echte Probelauf mit `qwen/qwen3.6-27b` (LM Studio) brach nach etwa fünf Minuten mit „fetch failed“ ab. Ursache: Node bricht eine Anfrage ab, wenn fünf Minuten lang gar keine Daten kommen (Kopfzeilen-Zeitlimit), und ein Modell, das vor der Antwort lange nachdenkt, sendet bei nicht gestreamten Antworten erst nach dem Ende etwas.
- Beide Anbieter (Ollama, LM Studio) werden jetzt im Datenstrom abgefragt (`scripts/lib/pool-tools.mjs`); die Nachdenk-Anteile von LM Studio (`reasoning_content`) werden verworfen, ein Punkt je 200 Zeilen zeigt, dass das Modell antwortet. Das Zeitlimit gilt nun für die ganze Anfrage (20 Minuten). Fehlermeldungen nennen die eigentliche Ursache (zum Beispiel `ECONNREFUSED`).
- Geprüft mit einer nachgebildeten Schnittstelle, die beide Datenstromformate liefert (erzeugen und prüfen), und mit einer nicht erreichbaren Adresse (Ursache sichtbar). Ein erneuter Lauf mit dem echten Modell läuft.

### Ta-09-04 – Prüfwerkzeug für den Kartenpool

- Neues Werkzeug `scripts/review-card-pool.mjs` (Entwicklerwerkzeug, nicht Teil von App und Build) mit `judge`, `sheet` und `merge`. `judge`: zweiter KI-Durchgang (1 bis 5 mit Problemtext, fortsetzbar). `sheet`: HTML-Prüfseite mit allen zweifelhaften und ungeprüften Karten und einer Stichprobe der guten je Kategorie und Schwierigkeit, Abwählen per Kästchen, Liste kopieren. `merge`: übernimmt gute, nicht abgewählte Karten in `src/data/pool/<Sprache>.json` (nur als gültiges Paket, Vorschau mit `--dry-run`, wiederholbar ohne Doppelungen).
- Neue getestete Regeln in `src/business/games/taboo/poolReview.ts` (Auftrag an den Prüfer, Lesen der Antwort, Stichprobe, Abwahlliste, Übernahmeauswahl). Gemeinsame Skriptteile in `scripts/lib/pool-tools.mjs`; `generate-card-pool.mjs` nutzt sie jetzt auch.
- Texte der KI in der Prüfseite werden als Text ausgegeben, nicht als HTML (geprüft mit `<b>` im Problemtext).
- Geprüft mit nachgebildeter Ollama-Schnittstelle, nicht mit einer echten KI. Prüfungen: 351 Unit-Tests, tsc, eslint.

### Ta-09-03 – Erzeugungsskript für den Kartenpool

- Neues Werkzeug `pnpm pool:generate` (`scripts/generate-card-pool.mjs`): erzeugt Karten am PC mit Ollama oder LM Studio, je Kategorie und Schwierigkeit in Portionen, bis zum Ziel je Zelle (Standard 17, also etwa 500 je Sprache bei zehn Kategorien). Optionen für Sprache, Kategorie, Schwierigkeit, Ziel, Portionsgröße, Anbieter, Modell, Temperatur und Arbeitsordner; `--dry-run` zeigt nur den Auftrag an die KI.
- Ausgabe nur in `work/` (nicht versioniert): Arbeitspaket im Paketformat und Ablehnungsliste mit Grund. Fortsetzbar; bereits vorhandene Begriffe (eingebaute Karten, Paket, Arbeitspaket) werden gemieden und abgelehnt. Die App bleibt unverändert; Übernahme in den Pool folgt mit `Ta-09-04`.
- Neue getestete Regeln in `src/business/games/taboo/poolGeneration.ts`: Auftrag an die KI (Sprache, Kategorie mit Beschreibung, Schwierigkeit, Familienfreundlichkeit, Oberbegriff), Lesen der Antwort auch mit Text um das JSON, stabile Kennung aus Sprache, Kategorie und Begriff, strengere Annahme (kein verbotenes Wort enthält den Begriff oder ist Teil davon, keine Ziffern in Wörtern, Längen, keine Dubletten).
- Bei LM Studio wird nur ein bereits geladenes Chat-Modell genutzt, außer `--model` ist angegeben.
- Geprüft mit einer nachgebildeten Ollama-Schnittstelle (Lauf, Fortsetzen, Ablehnungen), nicht mit einer echten KI. Prüfungen: 333 Unit-Tests, tsc, eslint.

### Anforderung: Handy- und PC-Layout für alle Spiele

- Neue Phase Al-08 im Plan (`Al-08-01`, `Al-08-02`, beide geplant): Jedes Spiel soll ein Handy- und ein PC-Layout haben, damit man auch am PC spielen kann. Nur festgehalten, noch nicht umgesetzt.

### Ta-09-02 – Kartenpaket und Kategorien aus den Daten

- Neues Paketformat `gamehub-taboo-pack` (Version 1) je Sprache: Kategorien mit deutschem und englischem Namen und Karten ohne eigene Sprachangabe. `src/data/pool/de.json` und `en.json` enthalten die zehn Kategorien und noch keine Karten.
- `parseTabooCardPack` (Business) prüft alles und verwirft das ganze Paket bei einem Fehler (falsches Format, doppelte Kennungen oder Begriffe, Karte in unbekannter Kategorie, ungültige Wörter). `loadTabooCardPack` (Daten) lädt es als eigenen Teil der App; fehlt oder fehlschlägt es, bleiben die 45 eingebauten Karten. Der Build enthält `de-*.js` und `en-*.js`, beide stehen in der Dateiliste des Offline-Speichers.
- Kategorienamen kommen aus den Daten (`TabooCategoryInfo`, `builtInCategories`, `categoryName`); die Schlüssel `tabooSetup.category.*` sind entfallen. Setup, Karten-Formular, Kartenliste und Auswahlfeld nehmen die Kategorien als Parameter. Die Kategorien der eingebauten Karten erscheinen immer, Paket-Kategorien erst mit Karten.
- Tests: Paketprüfung (18 Fehlerfälle), Zusammenführen, Laden der echten Dateien, Bibliothek mit Paket in beiden Sprachen und mit fehlendem, fehlerhaftem und fremdsprachigem Paket. Prüfungen: 314 Unit-Tests, 25 e2e, tsc, eslint, Architekturprüfung.

### Ta-09 – Planung eines großen Kartenpools

- Neues Dokument `docs/GAMEHUB_CARD_POOL.md`: Ziel, Ist-Zustand, Größen- und Aufwandsschätzung, Aufbau (Pakete je Sprache als eigener Teil mit Rückfall, Kategorien aus den Daten, Erzeugungsskript am PC, Prüfung), offene Entscheidungen und Risiken. Phase Ta-09 mit Aufgaben `Ta-09-01` bis `Ta-09-06` im Plan und Status. Noch keine Umsetzung. Entschieden: 500 Karten je Sprache zuerst (später bis 1.500), zweiter KI-Durchgang plus Stichproben, Deutsch und Englisch unabhängig erzeugen. Kategorien: zehn (Tabelle im Dokument), gespielte Karten merken später. `Ta-09-01` damit erledigt, als Nächstes `Ta-09-02`.

### KI-Knopf für Wortvorschläge entfernt

- Auf Wunsch des Auftraggebers ist der KI-Knopf („Wörter mit KI vorschlagen“) im Formular „Karte hinzufügen“ und im Bearbeiten-Formular wieder entfernt: Er braucht installiertes Ollama, und Fremde sollen nichts extra installieren müssen. Gelöscht: Komponente `TabooWordSuggestion`, Port `TabooWordSuggester` mit Prüfung, Ollama-Adapter für Wortvorschläge, die zugehörigen Texte, Stile und Tests. Die Kartenerzeugung im Setup (Ollama) und `findOllamaModel` bleiben. Geplant statt dessen: Kartenpakete am PC erzeugen und mitliefern.
- Prüfungen: 284 Unit-Tests, e2e, tsc, eslint.

### Ta-08 – Lokale KI am Rechner (Test und Entscheidung)

- Wegwerf-Seite `prototypes/ai-word-test.html`: lädt ein kleines Modell per WebLLM im Browser und erzeugt verbotene Wörter für deutsche und englische Beispielbegriffe; zeigt Geräteprüfung, Zeiten und Beanstandungen. Nicht Teil von App und Build, keine neue Abhängigkeit in `package.json`.
- Erster Befund: Im Browser dieses Rechners ist WebGPU samt f16 verfügbar; das kleinste Qwen-Modell (0,5 Mrd.) braucht laut WebLLM etwa 945 MB Grafikspeicher, SmolLM2-360M etwa 376 MB. - Messung 1 (dieser Rechner, WebGPU, Qwen2.5-0.5B-Instruct q4f16): Laden 29 s (erstmals, ca. 280 MB), danach 0,2 bis 0,4 s pro Karte. Qualität **nicht brauchbar**: Von 20 Begriffen (10 Deutsch, 10 Englisch) hatten 14 vier Wörter, aber nur etwa 2 bis 3 waren sinnvoll. Typische Fehler: erfundene Wörter („Gäcker“, „Zubler“), Buchstaben statt Wörter („Pizza“ → s, p, i, z), Wörter, die den Begriff enthalten („Regenbogen“ → Bogen), unpassende Wörter („Bibliothek“ → Leiche). Deutsch ist deutlich schlechter als Englisch. Die Prüfzahl „6 von 20 ohne Beanstandung“ der Seite überschätzt die Qualität, weil sie nur Form prüft und nicht den Sinn.
- Entscheidung (Auftraggeber): größeres Modell nicht testen, Aufgabe „anders lösen“. Erkundung: Kandidatenwörter aus der Einleitung des Wikipedia-Artikels (kostenlos, ohne Schlüssel, vom Browser aus per `origin=*` abrufbar). Messung an denselben 20 Begriffen mit einfachem Filter (Stoppwörter, Wörter mit dem Begriff darin, auf Deutsch nur großgeschriebene Wörter, Häufigkeit): meist sinnvolle Nachbarwörter (Regenbogen → Regentropfen, Sonnenlicht, Strahlen, Licht, Sonne, Farben; Gewitter → Blitz, Donner, Entladungen), aber auch Rauschen („Vorlage“, „Infobox“, Ländernamen, englisch „known“, „used“). Als Auswahlliste zum Antippen brauchbar, als fertige Karte nicht. Links aus dem Artikel waren deutlich schlechter.
- Entscheidung (Auftraggeber, `ADR-018`): Wikipedia abgelehnt, KI nur am Rechner (Ollama), am Handy ohne KI.
- Ein kurz ergänzter Adapter für LM Studio wurde auf Wunsch des Auftraggebers wieder entfernt (nicht beauftragt). Die KI-Anbindung bleibt bei Ollama. Gemessen vor dem Rückbau: Der LM-Studio-Server dieses Rechners sendet keinen CORS-Header; für eine spätere Anbindung müsste dort „CORS aktivieren“ eingeschaltet werden.

### Ta-07 – Karten und Kategorien neu gestalten

- **Ta-07-01:** Neues schlankes Formular „Karte hinzufügen“ oben auf der Kartenseite (Kategorie, Schwierigkeit, Begriff, vier verbotene Wörter in einem Feld mit Komma). Die Mehrzeilen-Eingabe ist entfallen.
- **Ta-07-02:** „Karten nach Kategorie“ ersetzt die flache Liste: jede Kategorie ausklappbar, Karten als kompakte Zeilen, eigene Karten bearbeitbar und löschbar, Standardkarten nur lesbar.
- **Ta-07-03:** Im Setup sind die Kategorien in „Standard“ und „Eigene“ getrennt.
- **Ta-07-04:** KI-Vorschlag für verbotene Wörter: Knopf „Wörter mit KI vorschlagen“ beim Hinzufügen und Bearbeiten, sichtbar nur mit erreichbarer lokaler Ollama-KI. Der Vorschlag wird geprüft und nur ins Feld eingetragen. Neuer Port `TabooWordSuggester`, Adapter `ollamaTabooWordSuggester`; die Modellsuche ist als `findOllamaModel` mit dem Kartengenerator geteilt. Ohne KI bleibt alles unverändert.
- **Ta-07-05:** Kartenseite verfeinert: Bearbeiten als Stift-Knopf, Export nur je Kategorie, Import als gestalteter Knopf, Zurück und KI-Vorschlag als Knöpfe mit Symbol (neuer Baustein `Icon`). Der globale Export entfällt. Nachbesserung: kompakte Symbolknöpfe neben den Namen (Stift bei der Karte direkt unter der Schwierigkeit rechts; alle Symbolknöpfe (Stift, Export, KI) haben die normale Knopfform (keine runden Knöpfe) und 2,5 rem Größe; der KI-Knopf neben dem Wörterfeld ist genauso hoch wie das Feld (3 rem), Kartenzeilen niedriger (ein zu großer oberer Außenabstand der Knöpfe im Spielbereich ist für diese Symbolknöpfe aufgehoben), Download bei der Kategorie), Leiste „Karten“ und „Spielregeln“ oben rechts im Setup, Zurück-Pfeil in der Kopfzeile der App (oben rechts) auf der Kartenseite, wo Einstellungen und Home ausgeblendet sind (neuer Hook `useGameBack`, Texte `navigation.back`). Das Export-Symbol in der Kategoriezeile sitzt jetzt auf einer Höhe mit Namen und Zähler (ein fremder oberer Außenabstand der Knöpfe ist aufgehoben), KI-Knopf neben dem Wörterfeld (ohne KI deaktiviert mit Hinweis).
- Annahmen: Eine Kategorie entsteht durch ihre Karten (keine leeren Kategorien); die Ansicht zeigt nur Karten der gewählten Kartensprache.
- Prüfungen: 297 Unit-Tests, 25 e2e (frischer Build), tsc, eslint, Prettier, Architekturprüfung.

## 2026-11-11

### Ta-06-06 – Karteneditor für eigene Karten

- Neue Liste „Meine Karten“ (`TabooCardList`) auf der Kartenseite: Suche nach Begriff oder Kategorie, Bearbeiten (Begriff, vier verbotene Wörter, Kategorie oder neue Kategorie, Schwierigkeit) und Löschen mit Zweit-Tipp-Bestätigung. Eingaben werden mit denselben Regeln wie beim Hinzufügen geprüft (vier verschiedene Wörter, kein doppelter Begriff).
- `TabooCardRepository` und die IndexedDB-Umsetzung haben `update` und `remove`; die Auswahl der Kategorie ist als `TabooCategoryField` gemeinsam mit dem Hinzufügen-Formular genutzt.
- Tests: Datenschicht, Liste und Durchlauf über die Kartenseite in Deutsch und Englisch. Prüfungen: 281 Unit-Tests, 25 e2e, tsc, eslint.

### Nachbesserung zu Ta-06-04 und Ta-06-05

- Reihenfolge der Spieleinstellungen: Runden, Rundendauer, Überspringen, Stechen, Kartenquelle, Schwierigkeit, Kategorien. Die Kategorien stehen zuletzt; die Trennlinie zwischen Standard- und eigenen Kategorien ist entfallen, nur die kleinen Beschriftungen bleiben.
- „Überspringen pro Runde“ steht direkt unter „Rundendauer (Sekunden)“. Die Abstände im Setup sind vereinheitlicht: zwischen allen Einstellungen 16 px, zwischen den Abschnitten 32 px; der Info-Knopf vergrößert die Zeile der Beschriftung nicht mehr.
- Der einklappbare Bereich „Weitere Optionen“ entfällt: Stechen, Überspringen, Schwierigkeit und Kategorien stehen direkt untereinander im Abschnitt „Spieleinstellungen". Der Übersetzungsschlüssel `tabooSetup.moreOptions` und die zugehörigen Testschritte sind entfernt.
- „Mittel“ ist gelb statt blau (Ampel: grün, gelb, rot) (Auswahl und Anzeige in der Runde), damit es nicht wie ein gewöhnliches ausgewähltes Element aussieht.
- Schwierigkeit ist mehrfach wählbar (z. B. leicht und schwer). „Alle“ schließt die anderen aus; wählt man nichts oder alle drei, gilt wieder „Alle“. Umgesetzt als Option `multiple` im Baustein `ChoiceGroup`; die KI-Erzeugung und das Nachladen verwenden nur die gewählten Schwierigkeiten. Tests für die Auswahlregeln.
- Eigene Karten (Hinzufügen, Import, Export) liegen auf einer eigenen Seite innerhalb von Tabu, erreichbar über „Eigene Karten verwalten“ im Setup; „Zurück“ führt ins Setup, das ausgefüllt erhalten bleibt.
- Das Setup ist in zwei Abschnitte gegliedert: „Teams und Spieler“ (Teamanzahl, Namen, Reihenfolge, Spielerliste) und „Spieleinstellungen“ (Runden, Dauer, Kartenquelle, weitere Optionen). Die Spielerliste hat eine eigene Überschrift „Spieler (optional)“ und ist weiter einklappbar („Namen eintragen und verteilen“), ihr Hinweistext ist verständlicher formuliert (Namen durch Komma oder Zeilenumbruch trennen), und sie hat Innenabstand zum Rand.
- Mehrzeilige Eingabefelder (Spieler, Karten) wachsen mit dem Inhalt (`useAutoGrow` in `game-kit`).

### Ta-06-05 – Mehrere Karten und Kategorien hinzufügen

- Neues Formular „Karten hinzufügen“ (`TabooCardEntry`): mehrere Karten als Textzeilen, gemeinsame Kategorie und Schwierigkeit, neue Kategorie per Namen. Ungültige Zeilen werden mit Nummer gemeldet, dann wird nichts gespeichert; vorhandene Begriffe werden übersprungen.
- Reine Logik `parseCardEntries` und `customCategoryIds` in `src/business/games/taboo/` mit Tests. Eigene Kategorien erscheinen im Setup als Filter (`tabooSetup`-Auswahl ist nun dynamisch).
- Prüfungen: 270 Unit-Tests, 25 e2e, tsc, eslint, Architekturprüfung.

### Ta-06-04 – Spieler hinzufügen und auf Teams verteilen

- Neuer Bereich „Spieler und Teams (optional)“ im Tabu-Setup: Namen eintragen (Zeilen, Kommas oder Semikolon), zufällig auf die Teams verteilen oder je Spieler das Team auswählen. Übersicht der Teams mit ihren Spielern, Deutsch und Englisch.
- Gemeinsame reine Logik `parsePlayers` und `splitIntoTeams` in `src/business/shared/players.ts` mit Tests.
- Prüfungen: 263 Unit-Tests, 25 e2e, tsc, eslint, Architekturprüfung.

### Ta-06-03 – Teamreihenfolge manuell oder zufällig

- Neue Auswahl „Teamreihenfolge“ im Setup (ab zwei Teams): „Zufällig“ (Standard, wie bisher) oder „Wie eingegeben“. Mit Info-Button, in Deutsch und Englisch.
- Beim Neuspielen mit gleicher Konfiguration bleibt eine eingegebene Reihenfolge erhalten, eine zufällige wird neu gelost.
- Test in beiden Sprachen. Prüfungen: 256 Unit-Tests, 25 e2e, tsc, eslint.

### Ta-06-02 – Spielregeln erklären

- Neue Komponente `TabooRules`: Knopf „Spielregeln“ über dem Setup-Formular öffnet ein Fenster mit Ziel, Ablauf, Wertung, Überspringen und Spielende, in Deutsch und Englisch.
- Test für Öffnen und Schließen in beiden Sprachen. Prüfungen: 254 Unit-Tests, e2e, tsc, eslint.

### Ta-05-06 – Tabu-Stile je Spiel und Nachlade-Hook

- Tabu-Stile aus `global.css` nach `src/presentation/styles/games/taboo.css` verschoben; berechnete Stile vor und nach der Trennung verglichen, keine Abweichung.
- Nachladen der KI-Karten als Hook `useTabooRefill` aus `TabooSetup.tsx` herausgelöst (815 auf 450 Zeilen insgesamt). Pause, Neustart und Stechen bleiben bewusst im Container.
- Prüfungen: 252 Unit-Tests, 25 e2e (5 mobile-only übersprungen auf Desktop), tsc, eslint und Architekturprüfung sauber.

### Ta-06-01 – Info-Buttons mit Erklärfenster

- Neuer Baustein `InfoButton` in `game-kit` und optionales `info` an `ChoiceGroup`: ein „i“-Knopf rechts neben der Überschrift öffnet ein Fenster mit der Erklärung.
- Erklärungen für Runden pro Team, Kartenquelle, Stechen bei Gleichstand, Überspringen pro Runde und Schwierigkeit, in Deutsch und Englisch.
- `Button` ist standardmäßig `type="button"`, damit ein Knopf in einem Formular es nie versehentlich absendet.
- Tests für das Fenster (öffnen, schließen, Escape, kein Absenden), alle fünf Erklärungen und den Durchlauf in beiden Sprachen; die mobile Layout-Prüfung bestätigt 44-Pixel-Ziele.

### Ta-05-05 – Struktur für wiederverwendbare Spielbausteine umgesetzt

- Spielmodul-Vertrag (`GameModule`: Kennung und Hauptfenster): `App` und `AppRoot` kennen kein Tabu mehr und bekommen `modules`; Tabu wird in `main.tsx` über `createTabooModule` angeschlossen. Ein Beispielmodul im Test belegt den Vertrag.
- Texte je Spiel in eigener Datei (`resources/<sprache>/taboo.ts`), eingebunden in `common.ts`.
- Leitfaden `docs/GAMEHUB_NEW_GAME_GUIDE.md` und `ADR-017`. Offen als `Ta-05-06`: Hooks für die Tabu-Zustandslogik und CSS je Spiel.

### Ta-05-05 – Strukturvorschlag für wiederverwendbare Spielbausteine (in Arbeit)

- Neues Dokument `docs/GAMEHUB_GAME_MODULES.md`: Ist-Zustand (815 Zeilen in `TabooSetup.tsx`, Tabu-Wissen in `App.tsx`, gemischtes CSS und gemeinsamer Namensraum für Texte), Zielbild mit `game-kit`, `business/shared` und einem Spielmodul-Vertrag, drei Optionen mit Empfehlung (moderater Umbau) und die Entscheidungen, die der Auftraggeber treffen muss.
- Freigabe erteilt (Option B, moderater Umbau; Spielmodi erst danach). Umgesetzt: Schritt 1 (`shuffle` und `teamOrder` nach `src/business/shared/`) und Schritt 2 (Bausteine `ChoiceGroup`, `Scoreboard`, `StartBar` und `TurnStrip` in `src/presentation/game-kit/`, CSS-Klassen mit Präfix `kit-`). Das Verhalten ist unverändert, alle Tests bestehen. Schritt 3: `useCountdown`, `useStopwatch` und `TimerHud` (Rundenkopf mit Zeitbalken und Farbwechsel) in `game-kit`, von der Tabu-Runde und dem Stechen gemeinsam genutzt. Schritt 4 (teilweise): `TabooSetup.tsx` von 815 auf 499 Zeilen verkleinert. Ansichten (`TabooSetupForm`, `TabooTurnOverview`, `TabooResultView`, `TabooTiebreakOverview`) und Hilfsfunktionen (`tabooSetupModel.ts`) sind ausgelagert, das Verhalten ist unverändert. Noch offen in Schritt 4: Zustandslogik (Nachladen, Pause, Neustart, Stechen) als Hooks. Offen außerdem: Schritte 5 und 6 (Spielmodul-Vertrag mit eigenem Namensraum, Leitfaden).

### Ta-05-04 – Oberflächentests auf Handybreite

- Neue Browserprüfung `e2e/mobile-layout.spec.ts`: Alle Tabu-Ansichten (Menü, Einstellungen, Setup, Übersicht, Runde, Pause, Auswertung, Stechen, Ergebnis) werden auf 360 und 412 Pixel Breite in Deutsch und Englisch geprüft: kein horizontales Scrollen, Touch-Ziele mindestens 44 Pixel, nichts außerhalb des Bildschirms oder abgeschnitten, Aktionsleiste ohne Scrollen erreichbar, Bedienelemente haben einen Namen.
- Gefundene Probleme behoben: Das Markenlogo in der Kopfzeile (21 Pixel hoch), der Schließen-Knopf der Dialoge (40 Pixel) und die Überschrift „Eigene Tabu-Karten“ (21 Pixel) waren zu klein für Touch.

### Ta-05-03 – Sprach- und Oberflächenabdeckung geprüft

- Fehler behoben: Das `lang`-Attribut der Seite blieb auf Deutsch, auch bei englischer Oberfläche (falsche Aussprache bei Screenreadern). Seitensprache und Meta-Beschreibung folgen jetzt der Oberflächensprache (`useDocumentLanguage`).
- Veraltete Hinweise korrigiert („Partie erneut vorbereiten“ existiert nicht mehr) und ungenutzte Texte (Architekturschichten, Beispielmeldungen, Team hinzufügen/entfernen, Kartenoptionen) entfernt.
- Neue automatische Prüfungen: gleiche Platzhalter in beiden Sprachen, keine versehentlich identischen Texte (bewusste Ausnahmen sind aufgelistet), keine ungenutzten Übersetzungsschlüssel.
- Neuer Durchlauf aller zwölf Tabu-Ansichten (Auswahl, Einstellungen, Setup, Übersicht, Runde, Pause, Auswertung, Stechen, Ergebnis) in Deutsch und Englisch: Es erscheinen keine Rohschlüssel und keine Texte der jeweils anderen Sprache.
- Zeitformat (Dezimaltrenner) je Sprache getestet. Im E2E-Test wird Seitensprache und Beschreibung nach dem Sprachwechsel geprüft.
- Der feste Markenname „GameHub“ in der Kopfzeile ist der einzige Text im Code außerhalb der Übersetzungsressourcen.

### Ta-05-02 – Testabdeckung erhöht

- Neue Tests: Fehlerfälle der lokalen Kartenspeicherung (Öffnen, Blockade, abgebrochenes Lesen, ungültige Karte), Kartengenerierung (gefundener oder lokaler Generator, Fehlschläge, Abbruch), Kartenverwaltung bei Speicherfehlern, Doppelstart und Abbruch während der Vorbereitung, Seiten und App-Rahmen, Stechen ohne Ersatzkarte, Parität der Übersetzungsressourcen.
- Abdeckung: Zeilen 99,15 %, Verzweigungen 94,05 %, Funktionen 98,51 %. Übrig sind vor allem defensive Rückfallwerte.
- Fehler behoben: Der Hinweis „Keine neuen Zusatzkarten verfügbar.“ war nach dem Spielstart nie sichtbar, weil das Setup sofort ausgeblendet wird. Er steht jetzt in der ersten Rundenübersicht.

### Ta-05-01 – Spiellogik und Randfälle geprüft

- Neue Zufallsprüfung (`stateMachine.invariants.test.ts`): 400 simulierte Partien mit gültigen und ungültigen Ereignissen, Prüfung von Punkten, eindeutigen Karten, Zustandsübergängen, Stechen-Daten und endgültigem Spielende.
- Gefundener Fehler behoben: Ungültige Zeitwerte (`NaN`, unendlich) im Stechen konnten die Rangfolge verfälschen und werden jetzt ignoriert.
- Zusätzliche Tests: zu wenige Karten für das Stechen, Kartensprache im Stechen.
- Regeln und Randfälle dokumentiert in `docs/GAMEHUB_TABOO_LOGIC.md`.

### Al-07-03 – Feinschliff nach Rückmeldung

- Rundenzahl pro Team: Kurz (3), Mittel (5), Lang (10) und Unbegrenzt (∞). Bei unbegrenzten Spielen lässt sich das Ergebnis nach jeder vollständig gespielten Runde anzeigen (`roundsPerTeam: "unlimited"`).
- Rundendauer: zusätzlich 120 Sekunden wählbar (60, 90, 120).
- Auswahlgruppen im Menü haben gleich breite Buttons; „Unbegrenzt“ beim Überspringen ist ein ∞-Symbol (mit Screenreader-Namen).
- Schwierigkeit im Menü farbig (grün, blau, rot) und auf der Karte links oben als Farbpunkt mit Klartext.
- Zeitanzeige und Zeitbalken wechseln in den letzten 20 Sekunden auf Gelb und in den letzten 10 auf Rot, auch im Stechen.
- Stechen: Ein verbotenes Wort gibt keine Zeitstrafe mehr, sondern zählt als falsch und bringt eine neue Karte gleicher Schwierigkeit.
- Kartenreihenfolge: Das Mischen liegt jetzt gemeinsam in der Business-Schicht (`shuffle`); nachgeladene KI-Karten werden vor dem Einreihen gemischt.
- Neue Aufgaben: Phasen Ta-05 (Qualitätsprüfung) und Ta-06 (Erweiterungen) sind im Plan erfasst.

### Al-07-01 – Mobile-first Oberfläche

- Kopfzeile auf einer Zeile verdichtet, Safe-Area-Abstände und `100dvh` ergänzt, Navigation erst ab Tablet-Breite sichtbar.
- Spielauswahl mit kompakten Karten; geplante Spiele treten visuell zurück.
- Laufende Tabu-Runde: Begriff füllt die Ansicht, Aktionsbuttons liegen angeheftet in der Daumenzone, Countdown färbt sich in den letzten 10 Sekunden.
- Einstellungen als Bottom-Sheet, Touch-Ziele mindestens 48 px, Eingabefelder gegen iOS-Zoom abgesichert, Theme-Farbe angepasst.
- Rundenende und Ergebnis mit Standings-Karten und vollbreiten Buttons.
- Kartensprache aus dem Tabu-Setup entfernt; es gilt die Kartensprache aus den Einstellungen.
- Kartenquelle wählbar: nur lokal, nur KI oder beides kombiniert. Schwierigkeit und Kategorien liegen unter „Weitere Optionen“.
- Start-, Richtig- und Weiter-Aktionen grün, „Verbotenes Wort“ rot.
- „Zurück zu allen Spielen“ durch ein Haus-Symbol („Spiel schließen“) ganz rechts in der Kopfzeile ersetzt.
- Einstellungen als Zahnrad-Symbol dargestellt. In der Kopfzeile steht im Spiel der Spieltitel statt „GameHub“; „GameHub“ erscheint nur im Hauptmenü.
- „Nur KI“ erzeugt vorab rund 8 Karten pro Runde und lädt während der Runde automatisch Karten nach (neues Ereignis `addCards` in der Zustandsmaschine), sobald weniger als 9 Karten übrig sind. Bei „Alle“ wechselt die Schwierigkeit zwischen den Anfragen.
- Spielkopf größer; gemeinsamer Aufbau für Spiele: Titel und Aktionen oben, Einstellungen in der Mitte, „Starten“ immer ganz unten.
- Schritt „Partie vorbereiten“ entfällt: „Starten“ bereitet die Partie vor und beginnt sofort die erste Runde. „Gleiche Einstellungen“ startet direkt neu mit gemischten Karten.
- Kartenquelle: „Beides“ steht links und ist Standard.
- Tabu-Karten haben jetzt immer vier verbotene Wörter (Modell, Standardkarten, lokale Kandidaten, KI-Vorgabe mit Oberbegriff). Die Runde zeigt sie in einem 2×2-Raster. Gespeicherte oder importierte Karten mit drei Wörtern werden nicht mehr akzeptiert.
- „Starten“ öffnet jetzt eine Rundenübersicht statt sofort die Runde zu starten: „Runde X/Y“, das Team, das als Nächstes dran ist, und eine Punkteübersicht aller Teams (meiste Punkte oben). „Runde starten“ liegt unten. Dieselbe Übersicht erscheint nach jeder Runde.
- Die Teamreihenfolge wird zu Beginn jeder Partie zufällig bestimmt und bleibt bis zum Ende gleich (neu: `shuffleTeams`). In der laufenden Runde stehen Team, „Runde X/Y“ und Punkte im Kopf.
- Punkteübersicht auch im Endergebnis, mit hervorgehobenen Gewinnerteams.
- Alle 20 Browserprüfungen lokal bestanden (Chrome, Desktop und Mobil).
- Nach einer Runde entfällt die Meldung „Runde beendet“. Stattdessen zeigt die Übersicht „Als Nächstes dran“, den Gesamtpunktestand und die gespielte Runde mit allen Kartenbegriffen in Grün (richtig) oder Rot (nicht gewertet). Ein Tipp auf einen Begriff ändert die Wertung und passt die Punkte an (neues Ereignis `reviseResult`).
- „Letzten Punkt zurücknehmen“ entfällt in Runde und Übersicht; Korrekturen erfolgen nur in der Rundenübersicht.
- Die Rundenübersicht zeigt unter jedem Begriff auch die vier verbotenen Wörter.
- Eine Runde endet nicht mehr nach wenigen Karten: Sie bekommt alle ungespielten Karten, danach früher gespielte Karten in neuer Reihenfolge (nie zweimal in derselben Runde). Die Zustandsmaschine erlaubt dafür das Wiederverwenden von Karten in späteren Runden.
- Einheitliche Navigation: Hauptmenü und Spiel-Hauptfenster zeigen Einstellungen (Zahnrad), das Spiel-Hauptfenster zusätzlich das Haus zurück zum GameHub. Während einer laufenden Partie (Übersicht, Runde, Ergebnis) gibt es oben nur noch ein X „Spiel beenden“. Die Bestätigung erfolgt ohne Dialog: Das erste Tippen färbt den Button für 3 Sekunden rot und erweitert ihn um den Hinweis „Nochmal tippen zum Beenden“ (auf dem Handy gibt es keine Tooltips), erst ein zweites Tippen beendet (neue Komponente `ConfirmButton`, ein schnelles Doppeltippen zählt nicht). Es führt zurück ins Hauptfenster des Spiels mit der bisherigen Einrichtung. Neue Spiele binden sich über `useGameExit` ein.
- Einstellungsfenster kompakter; Schließen-Button als kleines X.
- Rundenübersicht kompakter: Die Karte „Als Nächstes dran“ entfällt. Der Teamname sitzt (klein, ohne Rahmen) als Erweiterung direkt über dem Button „Runde starten“.
- Überspringen pro Runde begrenzt: Auswahl „Nie / 1 / 2 / 3 / Unbegrenzt“ unter „Weitere Optionen“, Standard 1 (neue Konfiguration `skipsPerRound`, von der Zustandsmaschine durchgesetzt). Ist das Limit aufgebraucht, verschwindet „Überspringen“ und „Verbotenes Wort“ füllt die linke Spalte.
- Laufende Runde ist pausier- und unterbrechbar: Oben steht in der Runde nur noch Pause/Fortsetzen (Play-Symbol). Während der Pause läuft der Timer nicht weiter, die Karte ist verdeckt („Pausiert“) und die Wertungsbuttons sind gesperrt. In der Pause gibt es „Fortsetzen“, „Runde neu starten“ (rote Zweifach-Bestätigung; verwirft die Punkte und Ergebnisse dieses Zuges und startet mit neuen Karten; bereits gezeigte Karten dieses Zuges kehren nicht zurück, damit niemand schummeln kann; Ereignis `restartRound`) und „Runde beenden“ (zeigt die Rundenübersicht). Das ganze Spiel beendet nur das X in Übersicht und Ergebnis.
- Das Entwicklungs-Dashboard erhält seinen eingebetteten Status per `pnpm docs:sync` aus `docs/GAMEHUB_STATUS.json`; `pnpm docs:check` läuft in der CI und schlägt bei veraltetem Stand fehl.
- Stechen bei Gleichstand (Option „Stechen bei Gleichstand“ unter „Weitere Optionen“, Standard an): Liegen 2–3 Teams nach der letzten Runde gleichauf, erklärt jedes Team nacheinander drei Begriffe (je einen einfachen, mittleren und schweren, für jedes Team andere Karten) auf Zeit. Verbotenes Wort gibt +5 Sekunden Strafe, einmal überspringen ist erlaubt (Ersatzkarte gleicher Schwierigkeit), nach 90 Sekunden endet der Versuch. Es gewinnt, wer die meisten Begriffe in der kürzesten Zeit schafft; bei exakt gleichem Ergebnis oder mehr als drei gleichauf liegenden Teams gewinnen alle gemeinsam. Pause zählt nicht zur Zeit. Die Ergebnisansicht zeigt Begriffe und Zeiten. Neue Zustände/Ereignisse in der Zustandsmaschine (`tiebreak`, `beginTiebreakAttempt`, `answerTiebreak`, `endTiebreakAttempt`) und `pickTiebreakCards`.
- Die Schwierigkeit (Einfach/Mittel/Schwer) steht während der Runden als kleines Etikett auf der Karte.
- Endergebnis im Stil der übrigen Ansichten: Beschriftung „Spiel beendet“, ein Gewinnerblock mit großem Teamnamen (bei Gleichstand „Gemeinsam gewonnen“), die Punkteliste und die beiden Aktionen („Gleiche Konfiguration“, „Neue Partie“) unten angeheftet. Die generische Statusbox entfällt.
- Zweifach-Bestätigungen (`ConfirmButton`) zeigen im ersten Schritt sichtbar, was ein erneutes Tippen auslöst. „Runde neu starten“ meldet „Keine neuen Karten verfügbar.“, wenn der Kartensatz keine ungesehene Karte mehr hat.
- Rundenkopf als ein Block mit Team, „Runde X/Y“, Punkten und Sekunden, darunter ein Zeitbalken (wird rot in den letzten 10 Sekunden). Auf der Karte stehen die verbotenen Wörter unter der Beschriftung „Verbotene Wörter“ in rötlich umrandeten Kacheln, durch eine Trennlinie klar vom Begriff abgesetzt (Begriff oben, Wörter unten).
- Der Überspringen-Button zeigt klein darunter den Hinweis „nur 1× pro Runde“ (bei anderen Limits „noch X von Y“).
- Aktionsbuttons in der Runde neu angeordnet: „Richtig“ groß rechts (zwei Zeilen hoch), links oben „Verbotenes Wort“, darunter „Überspringen“.
- Punkteübersicht ohne Hervorhebung des nächsten Teams; das Team steht über „Runde starten“.
- Übersprungene Karten erscheinen in der Rundenübersicht neutral (grau, „Übersprungen“) und sind nicht änderbar; die Zustandsmaschine lehnt Änderungen an ihnen ab. Änderbar bleiben nur richtige und falsche Karten.
- Orange Akzente (Markierungen, Kartenrand, verbotene Wörter, Spielkarte) durch das blaue Akzentblau ersetzt; Rot bleibt für „Verbotenes Wort“.
- Teamnamen im Tabu-Setup frei wählbar; leere Felder fallen auf „Team N“ zurück, doppelte Namen werden abgelehnt.

### Kompakte Tabu-Oberfläche

- Tabu auf Desktop und Mobil in einer schmalen, zentrierten Ansicht dargestellt.
- Teams, Runden und Zeit stehen vor aufklappbaren Kartenoptionen. Kartenverwaltung ist während der Partie ausgeblendet.
- Laufende Runde mit großem Begriff, rein numerischem Countdown und klarer Reihenfolge der Kartenaktionen gestaltet.

### Al-05-04 – Release-Abnahme und Punktekorrektur

- Versehentlich vergebene Tabu-Punkte lassen sich in der laufenden Runde und in der Zusammenfassung zurücknehmen.
- Tastaturbedienung und zentrale Kontraste geprüft. 148 automatisierte Tests und 20 Browserprüfungen bestanden.
- Ersten lokalen Tabu-Release abgenommen und auf GitHub Pages veröffentlicht.

### Al-05-03 – Veröffentlichung über GitHub Pages

- Produktionsartefakt wird erst nach erfolgreichen Pflichtprüfungen von `main` veröffentlicht.
- Browserprüfungen verwenden das vorinstallierte Chrome des GitHub-Runners. Fehler liefern Screenshots und Traces.
- Öffentliche App unter https://erik513.github.io/GameHub/ geprüft. Assets, direkter Tabu-Link und Offline-Neuladen waren erfolgreich.

### Al-05-02 – Offline- und Update-Prüfungen

- Fehlgeschlagene Cache-Installation räumt ihren eigenen Cache auf. Die bisherige Version bleibt offline verfügbar.
- Versionswechsel, Aufräumen des alten Caches und erneuter Offline-Start im Browser geprüft.
- 20 Browserprüfungen auf Desktop und Mobil bestanden.

### Al-05-01 – Kritische Tabu-Spielabläufe

- Vollständige Partien mit Einzelsieg und Gleichstand auf Deutsch und Englisch im Browser geprüft.
- Kartenaktionen, Teamwechsel, Neustart und Neuladen abgedeckt. 18 Desktop- und Mobilprüfungen bestanden.
- Race und Countdown-Duell als spätere Tabu-Spielmodi im Projektplan festgehalten.

### Ta-04-05 – Tabu-Kartenvorschläge und lokale Speicherung

- Lokalen Kartenvorrat und optionales Ollama-Modell in der Tabu-Ansicht auswählbar gemacht.
- Gültige Vorschläge und Ablehnungsgründe angezeigt. Nur ausgewählte und bestätigte Karten werden gespeichert.
- 147 automatisierte Tests und 14 Browserprüfungen bestanden. Lokale Vorschläge sind offline nutzbar.

### Ta-04-04 – Optionaler Ollama-Adapter

- Lokale Ollama-API mit strukturierten JSON-Antworten an den Generierungsvertrag angebunden.
- Fehlerhafte Antworten, fehlende Verbindung, Zeitüberschreitung und Abbruch behandelt.
- 145 Tests bestanden. Der Adapter wurde mit simulierten HTTP-Antworten geprüft.

### Ta-04-03 – Lokaler Anbieter für Tabu-Karten

- Separaten Vorrat mit 18 deutschen und 18 englischen Kartenkandidaten ergänzt.
- Auswahl nach Sprache, Kategorie und Schwierigkeit. Zu kleine Vorräte werden als Teilergebnis gemeldet.
- 135 Tests bestanden. Alle lokalen Kandidaten wurden ohne Netzwerk geprüft.

### Ta-04-02 – Generierte Tabu-Karten prüfen

- Kartenfelder, angefragte Sprache, Kategorie, Schwierigkeit und Verbotswörter geprüft.
- Unicode und Leerzeichen normalisiert. Ablehnungen enthalten Kartenposition und Fehlergrund.
- Vor dem gemeinsamen Speichern ausgewählter Karten wird der aktuelle Bestand erneut auf Duplikate geprüft. 132 Tests bestanden.

### Ta-04-01 – Anbieterunabhängiger Vertrag für Kartengenerierung

- Anfrage, Kartenkandidaten, vollständige und teilweise Ergebnisse, Fehler und Abbruch definiert.
- Anbieter geben unterstützte Sprachen, maximale Anfragemenge und Offlinefähigkeit an.
- 129 Tests bestanden, darunter Vertragsfälle mit Testanbieter.

### Ta-03-04 – Installierbare Web-App und Offlinebetrieb

- Manifest und App-Symbol für GameHub ergänzt.
- Produktionsdateien mit einem Service Worker zwischengespeichert. Neue Versionen übernehmen nach dem Schließen der bisherigen App-Fenster.
- 14 Browserprüfungen bestanden, einschließlich Tabu-Spielstart nach Offline-Neuladen auf Desktop und Mobil.

### Ta-03-03 – Eigene Tabu-Karten importieren und sichern

- Versioniertes JSON-Format und Prüfung der Karten vor dem Import ergänzt.
- Doppelte IDs und Begriffe in derselben Sprache werden übersprungen. Eigene Karten bleiben bei Änderungen der Standardsätze erhalten.
- Import und Export in der Tabu-Ansicht ergänzt. 126 Tests bestanden.

## 2026-11-10

### Ta-03-02 – Deutsche und englische Tabu-Standardkarten

- Je 45 geprüfte Standardkarten in drei Kategorien und Schwierigkeitsstufen ergänzt.
- Karten werden am Anwendungseinstieg bereitgestellt. Die Oberfläche greift über typisierte Eingabedaten darauf zu.
- Vor Spielbeginn wird mindestens eine passende Karte je Teamrunde verlangt. Der Vorrat wird auf die verbleibenden Teamrunden aufgeteilt.
- 109 Tests bestanden, darunter Bestandsprüfung und Datensatzvalidierung.

### Ta-03-01 – Lokaler Kartenspeicher

- Versionierten IndexedDB-Speicher mit eigener Tabu-Schnittstelle für benutzerdefinierte Karten ergänzt.
- Fünf Integrationstests prüfen Schema, erneutes Öffnen, Eingabevalidierung und Rücknahme fehlerhafter Schreibvorgänge.
- Speicherumfang und späteren Tabu-Feinschliff zur Korrektur versehentlicher Wertungen im Projektplan festgehalten.

### Ta-02-04 – Spielende und Neustart

- Endstand und Sieger nach der letzten Runde angezeigt, einschließlich gemeinsamer Sieger bei Gleichstand.
- Neue Partie mit gleicher oder neuer Konfiguration ermöglicht. Punkte und gespielte Karten werden zurückgesetzt.
- 101 Tests bestanden, darunter Einzelsieg, Gleichstand und beide Neustartwege.

### Ta-02-03 – Rundenende

- Rundenpunkte, Gesamtpunktestand aller Teams und nächstes Team angezeigt.
- Nächste Runde startet per Klick mit neuem Countdown und ungespielten Karten. Ein erschöpfter Beispielsatz wird gemeldet.
- 99 Tests bestanden, darunter Runden mit und ohne Punkte sowie der Teamwechsel.

### Ta-02-02 – Laufende Runde und Timer

- Tabu-Runde mit Countdown, Team, Punkten, Begriff und drei verbotenen Wörtern ergänzt.
- Kartenaktionen werten die aktuelle Karte. Beim Zeitablauf endet die Runde automatisch.
- Kleinen deutschen und englischen Beispielsatz für die laufende Runde ergänzt.
- 99 Tests bestanden. Neue Browserprüfung auf Desktop und Mobil erfolgreich.

### Ta-02-01 – Tabu-Spielkonfiguration

- Formular für Teams, Rundenzahl, Rundendauer, Kartensprache, Kategorien und Schwierigkeit ergänzt.
- Fehler in Deutsch und Englisch angezeigt. Gültige Angaben erzeugen den Vorbereitungszustand der Partie.
- 98 Tests bestanden, darunter Formularvalidierung und Vorbereitung in beiden Sprachen.

### Ta-01-05 – Kartenfilter und Deckbildung

- Karten nach Sprache, Kategorie und Schwierigkeit filtern und mit austauschbarer Zufallsquelle mischen.
- Doppelte Kartenkennungen und bereits gespielte Karten ausschließen. Leere und zu kleine Decks gesondert melden.
- 96 Tests bestanden. Die Tabu-Kernlogik ist abgeschlossen.

### Ta-01-04 – Rundenfolge und Siegerermittlung

- Spielende nach der konfigurierten Zahl von Runden pro Team geprüft.
- Alle Teams mit Höchstpunktzahl werden in der Reihenfolge der Teamliste als Sieger ausgewiesen.
- 88 Tests bestanden, darunter Partien mit zwei und drei Teams, Einzelsieg und Gleichstand.

### Ta-01-03 – Kartenaktionen und Punkte

- Richtige Antworten zählen einen Punkt. Überspringen und verbotene Wörter zählen null Punkte.
- Jede gewertete Karte wird für die restliche Partie gesperrt. Nach der letzten Karte endet die Runde.
- 87 Tests bestanden, darunter alle Kartenaktionen und Wiederholungsversuche.

### Ta-01-02 – Zustandsmaschine und Übergänge

- Tabu-Zustandsmaschine für Vorbereitung, laufende Runde, Rundenende und Spielende ergänzt.
- Ungültige Übergänge, Karten in der falschen Sprache und verspätete Rundenende-Ereignisse werden abgewiesen.
- Vollständige Partie mit drei Teams und zwei Runden geprüft; insgesamt 86 Tests bestanden.

### Ta-01-01 – Tabu-Domänenmodell und Validierung

- Unabhängige fachliche Typen für Teams, Kategorien, Schwierigkeit, Karten und Spielkonfiguration ergänzt.
- Mindestens zwei eindeutig benannte Teams, positive ganzzahlige Rundendauer und Rundenzahl sowie deutsche oder englische Sprachmetadaten geprüft.
- Exakt drei unterschiedliche, nichtleere verbotene Wörter erzwungen; der gesuchte Begriff darf nicht darunter sein.
- Unicode und Leerzeichen normalisiert; strukturierte Fehlercodes für spätere lokalisierte Anzeigen bereitgestellt.
- 83 Tests bestanden, davon 26 neue Domänenfälle; neue Spiellogik mit 100 % Zeilen- und Verzweigungsabdeckung.

### Al-04-03 – Einstellungen und Statusmeldungen

- Lokalisierten Einstellungsdialog für getrennte Oberflächen- und Kartensprachen ergänzt.
- Zugängliche Lade-, Fehler-, Erfolgs- und Leerzustände erstellt.
- 57 Tests und zehn Desktop-/Mobil-Browserprüfungen erfolgreich ausgeführt.

### Al-04-02 – App-Shell, Spielkatalog und Navigation

- Responsive App-Shell mit GameHub-Marke, Hauptnavigation und dauerhaft erreichbaren Spracheinstellungen erstellt.
- Verpflichtende Spielauswahl als Startseite umgesetzt; kein Spiel startet automatisch.
- Genreunabhängigen Spielmodulvertrag für ID, Route, Übersetzungsschlüssel, Status und visuellen Akzent eingeführt.
- Zentralen Katalog mit Tabu-Entwicklungsvorschau sowie geplanten Karten-, Scharade-, Quiz- und „Wer bin ich?“-Modulen angelegt.
- Statisches Hash-Routing für GitHub-Pages-kompatible Navigation zwischen Spielauswahl und Vorschau umgesetzt.
- Geplante Spiele klar gekennzeichnet und deaktiviert; Tabu öffnet eine Entwicklungsvorschau ohne Spielfunktion vorzutäuschen.
- 52 Tests und acht Desktop-/Mobil-E2E-Fälle erfolgreich ausgeführt.
- Zusätzliche sichtbare Browserprüfung war wegen ausgeschöpftem Browser-Kontingent nicht verfügbar; responsive Darstellung und Navigation wurden durch Playwright verifiziert.


### Al-04-01 – Design-Tokens und Basiskomponenten

- Zurückhaltende GameHub-Designrichtung mit primärem Dark Mode, tiefem Anthrazit, warmem hellem Text, Kobaltblau und gezieltem Korallakzent umgesetzt.
- Zentrale Tokens für Farben, Typografie, Abstände, Radien, Schatten, Kontrollgrößen und Inhaltsbreiten angelegt.
- Wiederverwendbare Komponenten für Buttons, Eingabefelder, Karten und Dialoge erstellt.
- Tastaturfokus, deaktivierte Zustände, Fehlerbeschreibungen, Dialogfokus und Escape-Schließen zugänglich umgesetzt.
- Startansicht ohne Verläufe und Glaseffekte auf das neue Designsystem umgestellt.
- Desktopansicht und 320-Pixel-Mobilansicht im Browser geprüft; kein horizontales Scrollen festgestellt.
- 43 Tests erfolgreich; Basiskomponenten erreichen 100 % Zeilen- und 96,29 % Verzweigungsabdeckung.
- Primäre Farb-Tokens nach Nutzerpräferenz vollständig auf Dark Mode umgestellt; Formensprache, Kontraste und Komponentenstruktur beibehalten.


### Al-03-04 – Übersetzungsparität prüfen

- Rekursive Prüfung für identische Schlüsselstrukturen in deutschen und englischen Übersetzungsressourcen ergänzt.
- Leere, ausschließlich aus Leerzeichen bestehende und ungültige Nicht-Text-Werte werden abgewiesen.
- Positive Prüfung der echten Ressourcen sowie negative Fälle für fehlende, zusätzliche, leere und ungültige Werte umgesetzt.
- Eigenen Befehl `pnpm check:translations` ergänzt und als verpflichtenden Schritt in GitHub Actions aufgenommen.
- i18n-Dateien in die Coverage-Messung und bereichsspezifische Mindestgrenze aufgenommen.
- 35 Tests erfolgreich; Phase Al-03 ist damit vollständig abgeschlossen.

### Al-03-03 – Unabhängige Kartensprache

- Reines Business-Modell für unabhängige UI- und Kartensprache ergänzt.
- Alle vier Kombinationen aus Deutsch und Englisch sowie unabhängige Änderungen beider Werte getestet.
- Kartensprache als eigene, lokalisierte Auswahl in die Startansicht aufgenommen.
- UI- und Kartensprache unter getrennten localStorage-Schlüsseln gespeichert.
- Gespeicherte Kartensprache beim App-Start wiederhergestellt; ohne gespeicherten Wert wird einmalig die initiale UI-Sprache übernommen.
- 29 Unit-, Infrastruktur- und Komponententests sowie sechs E2E-Fälle in Desktop- und Mobilprofilen erfolgreich ausgeführt.

### Al-03-02 – Erkennung, Auswahl und Persistenz der UI-Sprache

- Gespeicherte UI-Sprache vor der Browsersprache priorisiert und Englisch als kontrollierten Fallback beibehalten.
- Sprachvarianten wie `de-DE` und `en-US` auf die unterstützten Sprachen normalisiert.
- Zugängliche Sprachwahl für Deutsch und Englisch in die Startansicht integriert.
- Speicher-Port von einem fehlertoleranten localStorage-Adapter getrennt und im Composition Root verdrahtet.
- Sprachwechsel dauerhaft gespeichert und beim Neuladen vor dem ersten Rendern wiederhergestellt.
- 19 Unit-, Infrastruktur- und Komponententests sowie vier E2E-Fälle in Desktop- und Mobilprofilen erfolgreich ausgeführt.

### Erweiterbare Spielauswahl verbindlich geplant

- App-Start mit verpflichtender Spielauswahl als dauerhafte Produktanforderung festgelegt.
- Zentralen, genreunabhängigen Spielkatalog als einzige Quelle für verfügbare und geplante Spiele beschlossen.
- Minimalen Spielmodulvertrag für Kennung, Übersetzungsschlüssel, Route und Verfügbarkeitsstatus nach `Al-04-02` vorgezogen.
- `Al-06-02` auf eine spätere, bedarfsgesteuerte Überprüfung und Erweiterung des frühen Vertrags ausgerichtet.
- ADR-013 und verbindliche Arbeitsregeln ergänzt, damit Shell und Navigation keine einzelnen Spiele fest einbauen.

### Al-03-01 – i18n-Grundkonfiguration

- `i18next` und `react-i18next` als Laufzeitabhängigkeiten eingerichtet.
- Gemeinsamen Übersetzungsnamensraum mit deutschen und englischen Ressourcen angelegt.
- Englisch als kontrollierte Fallback-Sprache und Deutsch sowie Englisch als unterstützte Sprachen definiert.
- i18next-Typen um die GameHub-Ressourcenstruktur erweitert, sodass Übersetzungsschlüssel statisch geprüft werden.
- Sämtliche sichtbaren Texte der Startansicht aus den React-Komponenten in Übersetzungsressourcen verschoben.
- Initialisierung und Darstellung der Startansicht in beiden Sprachen mit sieben erfolgreichen Tests geprüft.
- Sprachregeln für deutsches Entwicklungs-Dashboard sowie englischen Quellcode und englische Code-Kommentare verbindlich dokumentiert.

### Al-02-06 – GitHub-Actions-Qualitätsworkflow abgeschlossen

- Lokales Repository mit `https://github.com/Erik513/GameHub` verbunden und vollständigen Projektstand auf `main` veröffentlicht.
- Vorhandenen GitHub-Initialisierungscommit ohne Überschreiben in die gemeinsame Historie aufgenommen.
- Ersten gehosteten Workflowlauf `42850423012` erfolgreich abgeschlossen.
- Quality-Job mit Format, Lint, Typecheck, Architekturprüfung, Coverage und Build erfolgreich ausgeführt.
- Playwright-E2E-Job mit Desktop- und Mobilprofil erfolgreich ausgeführt.
- `Al-02-06` abgeschlossen; Phase Al-02 ist damit vollständig erledigt.

### Umbenennung in GameHub

- Projektordner von `PartyHub` in `GameHub` umbenannt.
- Paketname, React-Komponenten, Business-Typen, Tests, E2E-Prüfungen, Dashboard und sämtliche Dokumentation auf `GameHub` umgestellt.
- Dokumentationsdateien von `PARTYHUB_*` in `GAMEHUB_*` umbenannt.
- Produktbeschreibung für Party-, Quiz-, Karten- und weitere Gesellschaftsspiele geöffnet.
- pnpm-Abhängigkeiten am neuen Repository-Pfad vollständig neu verknüpft.

## 2026-11-09

### Al-02-06 – GitHub-Actions-Qualitätsworkflow

- GitHub-Actions-Workflow für Pushes, Pull Requests und manuelle Ausführung erstellt.
- Offizielle Actions `actions/checkout@v7`, `pnpm/setup@v1` und `actions/upload-artifact@v7` verwendet.
- Node.js 24, pnpm 11.25.0, Dependency-Cache und Installation mit eingefrorenem Lockfile konfiguriert.
- Quality-Job für Format, Lint, Typecheck, Architekturprüfung, Vitest-Coverage und Produktions-Build eingerichtet.
- Separaten Playwright-Job mit gebündeltem Chromium sowie Diagnoseartefakten bei Fehlern eingerichtet.
- Playwright verwendet lokal installiertes Chrome und in CI das gebündelte Chromium.
- YAML-Format, alle Workflow-Befehle, beide lokalen E2E-Profile und die CI-Projektauflösung erfolgreich geprüft.
- Aufgabe bleibt blockiert, bis ein GitHub-Remote verbunden und der erste gehostete Workflow erfolgreich ausgeführt wurde.

### Al-02-05 – Playwright-Grundkonfiguration

- Playwright Test 1.65.0 eingerichtet.
- Desktop-Chromium- und Mobile-Chromium-Profil auf Basis des lokal installierten Chrome konfiguriert.
- Automatischen Vite-Webserver für E2E-Läufe eingebunden.
- Screenshots nur bei Fehlern sowie Video und Trace zur Fehlerdiagnose konfiguriert.
- Smoke-Test für Titel, Hauptüberschrift und Architekturliste ergänzt.
- Zwei reguläre Smoke-Tests in Desktop- und Mobilprofil erfolgreich ausgeführt.
- Kontrollierter Fehltest erzeugte Screenshot, Video und Trace wie vorgesehen. Temporärer Test und seine Artefakte wurden anschließend entfernt.
- Installation des gebündelten Chromium-Browsers wegen zu wenig freiem Speicher abgebrochen. Das bereits installierte Chrome wird erfolgreich verwendet.
- Vitest-Coverage, Lint, Formatprüfung, Typecheck, Architekturtest, Produktions-Build und Peer-Prüfung erneut erfolgreich ausgeführt.

### Al-02-04 – Coverage und Bereichsgrenzen

- V8-Coverage-Provider passend zu Vitest 5.1.0 eingerichtet.
- Text-, JSON-, JSON-Summary-, HTML- und LCOV-Berichte konfiguriert.
- Line-, Branch-, Function- und Statement-Grenzen festgelegt. Kritische Spiellogik 95 %, Business 90 %, Data/Infrastructure 80 % und Presentation/App 75 %.
- Dritten Komponententest für den Composition Root ergänzt.
- Positiver Coverage-Lauf mit drei bestandenen Tests und 100 % auf allen aktuell ausführbaren Dateien erfolgreich.
- Kontrollierter Negativtest unterschritt die globale und UI-spezifische Grenze und ließ den Coverage-Befehl erwartungsgemäß fehlschlagen.
- Lint, Formatprüfung, Typecheck, Architekturtest, Produktions-Build und Peer-Prüfung erneut erfolgreich ausgeführt.

### Al-02-03 – Vitest und Testing Library

- Dashboard-Zustandsspeicherung von flüchtigem Session Storage auf dauerhaftes Local Storage umgestellt. Klappzustände werden bei jeder Änderung und die Scrollposition beim Scrollen beziehungsweise Verlassen gespeichert.
- Vitest 5.1.0 mit jsdom-Testumgebung und zentralem Setup eingerichtet.
- Testing Library für React, DOM, jest-dom-Matcher und user-event installiert.
- Explizites DOM-Cleanup nach jedem Test eingerichtet.
- Neutralen Business-Unit-Test und Komponententest der Startansicht ergänzt.
- CI-Testlauf und Watch-Einstieg erfolgreich geprüft. Zwei von zwei Tests bestehen.
- Dashboard-Anzeige „Stand“ auf die tatsächliche 20-Sekunden-Prüfzeit umgestellt und den Projekt-Datenstand separat ausgewiesen.
- Lint, Formatprüfung, Typecheck, Architekturtest, Produktions-Build und Peer-Prüfung erneut erfolgreich ausgeführt.

### Al-02-02 – Linting und Formatierung

- ESLint 10 mit type-aware TypeScript-Regeln sowie React-Hooks- und React-Refresh-Regeln eingerichtet.
- Prettier mit einheitlicher Projektkonfiguration und gezieltem Prüfbereich eingerichtet.
- Skripte `lint`, `lint:fix`, `format` und `format:check` ergänzt.
- TypeScript auf die von typescript-eslint unterstützte Version 6.0.3 festgelegt.
- Positive Lint- und Formatläufe sowie negativer Regel-Smoke-Test erfolgreich geprüft.
- Typecheck, Architekturprüfung, Produktions-Build und Peer-Abhängigkeitsprüfung erneut erfolgreich ausgeführt.

### Projektumzug

- GameHub nach `C:\Users\Kosta\source\repos\GameHub` verschoben.
- Git-Repository mit Hauptbranch `main` initialisiert.
- TypeScript-Buildinformationen über `.gitignore` von der Versionierung ausgeschlossen.

### Al-02-01 – Vite-Grundprojekt und Schichtenstruktur

- React 19.3.1, React DOM 19.3.1, TypeScript 7.0.2 und Vite 8.3.6 mit pnpm eingerichtet.
- Strikte TypeScript-Projektkonfiguration und Vite-Composition-Root angelegt.
- Verzeichnisse für Presentation, Business, Data, Infrastructure, i18n und App-Verdrahtung erstellt.
- Neutralen, responsiven GameHub-Startbildschirm umgesetzt.
- Automatische Prüfung der Business-Schicht gegen äußere Abhängigkeiten ergänzt.
- Typecheck, Architekturprüfung, Produktions-Build und Entwicklungsserver-Smoke-Test erfolgreich ausgeführt.

### Projektvorbereitung

- `Al-02-01` gestartet und Projektstatus auf `in_progress` gesetzt.
- pnpm 11.25.0 als verfügbaren Paketmanager erkannt. Die frühere npm-Blockade ist damit aufgelöst.
- Dashboard lädt im direkten Dateimodus alle 20 Sekunden neu und stellt Scrollposition, Klappzustände und Fokus aus dem Session-Speicher wieder her.
- Falsch gesetzten zukünftigen Statuszeitpunkt von 20:00 Uhr auf den tatsächlichen Stand 19:43 Uhr korrigiert.
- Hinweisbanner beim direkten Öffnen des Dashboards entfernt. Der eingebettete Status wird in diesem Modus ohne Warnmeldung dargestellt.
- Dashboard-Aktualisierung zustandserhaltend gemacht. Unveränderte Statusdaten erzeugen keinen DOM-Neuaufbau. Bei echten Änderungen bleiben Scrollposition, geöffnete Phasen und Tastaturfokus erhalten.
- Dashboard um einen eingebetteten Status-Fallback für das direkte Öffnen per `file://` ergänzt. Der Live-Modus über HTTP lädt weiterhin alle 20 Sekunden die Statusdatei.
- Verbindliche Arbeitsregeln in `AGENTS.md` angelegt.
- Vollständigen Projektplan mit neun Phasen, Aufgaben, Akzeptanzkriterien und Testanforderungen erstellt.
- Maschinenlesbare Statusverwaltung mit stabilen Aufgaben-IDs eingerichtet.
- Entwicklungs-Dashboard mit automatischer Aktualisierung im 20-Sekunden-Takt erstellt.
- Architekturentscheidungen für Schichten, Zustandsmaschine, Internationalisierung, Speicherung, PWA, Provider-Abstraktion und Tests dokumentiert.
- README mit Ziel, Stack, Status und nächstem Schritt erstellt.
- Umgebung geprüft. Node.js 24.22.1 und Git 2.55.0 sind verfügbar. `npm` ist nicht im PATH verfügbar. Noch kein Git-Repository vorhanden.

Es wurden keine Spiele, keine KI-Anbindung und kein Multiplayer implementiert.
