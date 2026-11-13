# Planung: Großer Kartenpool für Tabu

Dieses Dokument gehört zu Phase Ta-09 im Projektplan. Es ist ein **Vorschlag**. Entscheidungen, die den Aufbau betreffen (Abschnitt 6), brauchen die Zustimmung des Auftraggebers, bevor gebaut wird.

## 1. Ziel

Tabu soll am Handy praktisch nie dieselben Karten zeigen. Eine KI am Handy ist dafür nicht möglich (Messung `Ta-08-01`, `ADR-018`). Stattdessen erzeugt der Auftraggeber die Karten **einmal am PC** mit einer guten KI, prüft sie und liefert sie mit der App aus. Am Handy läuft alles offline, ohne Installation und ohne KI.

## 2. Ist-Zustand

- Je Sprache 45 mitgelieferte Karten: 3 Kategorien (Alltag, Natur, Kultur) mal 3 Schwierigkeiten mal 5 Karten (`src/data/tabooStandardCards.ts`, ein Test prüft genau diese Zahlen).
- Die Kategorien sind im Code fest (`builtInCategoryIds`) und ihre Namen stehen in den Übersetzungen (`tabooSetup.category.*`). Eigene Kategorien sind Namen, die an eigenen Karten hängen.
- Der Kartenstapel entsteht in `buildDeck`: filtern, jede Karte prüfen, mischen. Es gibt schon `excludedCardIds`, um Karten auszuschließen.
- Der Dienst-Worker legt **jede** gebaute Datei beim Installieren in den Cache. Wird der Pool als eigener Teil der App gebaut, ist er automatisch offline verfügbar und wird mit jedem Update neu geladen.
- Es gibt einen Prüfpfad für erzeugte Karten (`reviewGeneratedCards`: Aufbau, Sprache, Dubletten) und einen Kartengenerator hinter einem Port (Ollama). Beides lässt sich für den Pool wiederverwenden.

**Stand (2026-11-12):** `Ta-09-02` bis `Ta-09-05` sind erledigt. Die Pakete `src/data/pool/de.json` und `en.json` enthalten die zehn Kategorien und 523 beziehungsweise 521 Karten. Die Karten wurden von Claude geschrieben (siehe Changelog) und liefen durch die Regeln der Skripte `import-card-batch`, `review-card-pool` und `generate-card-pool`. Siehe `ADR-019`.

## 3. Größe und Aufwand (Schätzung, nicht gemessen)

| Karten je Sprache | Rohgröße | gepackt (gzip) | Bemerkung |
|---|---|---|---|
| 500 | ca. 65 KB | ca. 20 KB | sofort unkritisch |
| 1.500 | ca. 200 KB | ca. 60 KB | mein Vorschlag als erstes Ziel |
| 5.000 | ca. 650 KB | ca. 200 KB | weiter unkritisch für Handy und Cache |
| ab 20.000 | über 2,5 MB | über 800 KB | dann lieber nachladbare Pakete je Kategorie |

Die Zahlen gehen von etwa 130 Byte je Karte aus. Die Erzeugungszeit am PC hängt vom Modell ab (bei einem 7-Mrd.-Modell mit mehreren Sekunden je Karte sind 1.500 Karten je Sprache einige Stunden, in Etappen im Hintergrund). Die Prüfarbeit dahinter ist der eigentliche Engpass (Abschnitt 5).

## 4. Aufbau (Vorschlag)

1. **Datenformat:** Je Sprache ein Paket als JSON-Datei mit Kategorien (Kennung, deutscher und englischer Name) und Karten. Der bestehende Austauschformat-Aufbau (`gamehub-taboo-cards`, Version 1) kann um Kategoriennamen erweitert werden, damit Pool und Import dieselbe Sprache sprechen.
2. **Laden:** Die App lädt das Paket der Kartensprache beim Öffnen von Tabu als eigenen Teil (dynamischer Import). Ist es noch nicht da oder fehlerhaft, bleiben die 45 eingebauten Karten als Rückfall.
3. **Kategorien aus den Daten:** Die Kategorienamen kommen aus dem Paket statt aus festen Übersetzungsschlüsseln. Das ist die einzige größere Änderung am Bestand (`builtInCategoryIds`, Setup, Kartenliste, Tests). Eigene Kategorien bleiben wie bisher Namen an eigenen Karten.
4. **Erzeugung am PC:** Ein Skript `scripts/generate-card-pool.mjs` (nicht Teil der App und des Builds) fragt Ollama oder LM Studio über deren lokale Schnittstelle, kategorieweise und schwierigkeitsweise in kleinen Portionen, schreibt Zwischenstände in eine Datei (abbrechbar und fortsetzbar), prüft jede Karte (Aufbau, vier verschiedene Wörter, keines gleich oder enthalten im Begriff, keine Dubletten über alle Pakete) und legt Ablehnungen mit Grund ab. Für die Prüfregeln importiert es entweder die vorhandene Prüfung aus dem Business-Code (dafür braucht es einen Weg, TypeScript aus dem Skript zu laden) oder hält eine kleine, getestete Kopie. Das ist bei der Umsetzung zu klären.
5. **Prüfung:** siehe Abschnitt 5.
6. **Test:** Ein Test je Sprache prüft Anzahl, Gültigkeit, Eindeutigkeit von Kennung und Begriff, Mindestzahl je Kategorie und Schwierigkeit (damit jede Auswahl im Setup genug Karten hat).
7. **Merken, was gespielt wurde (optional):** Eine neue Ablage in IndexedDB (Schemaversion 2, mit Migration) merkt gespielte Karten, damit neue Partien zuerst ungespielte Karten ziehen (`excludedCardIds` gibt es schon). Ohne das wiederholen sich bei 1.500 Karten Karten erst nach sehr vielen Partien, nur nicht garantiert nie.

## 5. Qualität und Prüfung

Die größte Gefahr ist nicht die Menge, sondern schlechte Karten (siehe Test mit dem kleinen Modell: erfundene Wörter, Wörter, die den Begriff enthalten). Gegenmaßnahmen:

- **Automatisch:** harte Regeln (oben), außerdem Warnung bei Wörtern, die den Begriff enthalten oder darin enthalten sind, und bei sehr kurzen oder sehr langen Wörtern.
- **Zweiter KI-Durchgang:** dasselbe oder ein anderes Modell bewertet jede Karte („passen die vier Wörter, ist der Begriff bekannt, ist die Schwierigkeit plausibel“). Das spart Handarbeit, ersetzt sie aber nicht.
- **Durchsicht durch den Auftraggeber:** Stichproben je Kategorie, oder bei kleinen Mengen alles. Ein einfaches Prüfformat (zum Beispiel eine Tabelle zum Streichen) macht das schnell. Das Werkzeug dafür ist Teil von Aufgabe Ta-09-04.
- **Altersgrenze und Inhalt:** familienfreundlich, keine Politik, Religion nur sachlich, keine Marken, die nur Werbung sind. Eine kurze Regelliste für die KI und die Prüfung gehört in die Aufgabe.
- **Schwierigkeit:** einfach = fast jeder kennt den Begriff und kann ihn beschreiben, mittel = bekannt, aber schwerer zu erklären, schwer = Fachwort oder abstrakt. Diese Beschreibung geht in den Auftrag an die KI.

## 6. Entscheidungen

**Entschieden (Auftraggeber, 2026-11-12):**

1. **Zielgröße je Sprache:** zuerst 500, danach Ausbau bis 1.500.
2. **Prüfung:** zweiter KI-Durchgang plus Stichproben je Kategorie, nicht jede Karte von Hand.
3. **Sprachen:** Deutsch und Englisch werden unabhängig erzeugt (eigene Begriffe und verbotene Wörter je Sprache), nicht übersetzt. Die vorhandenen 45 Kartenpaare bleiben als Rückfall.

4. **Kategorien (Vorschlag angenommen):** zu Alltag, Natur und Kultur kommen Essen und Trinken, Tiere, Sport und Freizeit, Berufe, Orte und Reisen, Film, Musik und Medien sowie Technik, also zusammen zehn Kategorien (Tabelle unten). Das hängt mit der Änderung „Kategorien aus den Daten“ (Punkt 3 im Aufbau) zusammen.

| Kennung | Deutsch | Englisch | Abgrenzung |
|---|---|---|---|
| `everyday` | Alltag | Everyday life | Gegenstände und Abläufe im Haushalt und im Alltag |
| `nature` | Natur | Nature | Landschaft, Wetter, Pflanzen, Naturphänomene |
| `culture` | Kultur | Culture | Kunst, Feste, Bräuche, Bildung |
| `food` | Essen und Trinken | Food and drink | Speisen, Getränke, Zutaten, Küche |
| `animals` | Tiere | Animals | Tierarten und Tierverhalten |
| `sport` | Sport und Freizeit | Sports and leisure | Sportarten, Geräte, Hobbys, Spiele |
| `jobs` | Berufe | Jobs | Berufe und ihre Werkzeuge |
| `places` | Orte und Reisen | Places and travel | Orte, Gebäude, Verkehr, Urlaub |
| `media` | Film, Musik und Medien | Film, music and media | Filme, Musik, Bücher, Fernsehen, Spiele am Bildschirm |
| `tech` | Technik | Technology | Geräte, Computer, Internet, Erfindungen |

   Die vorhandenen 45 Kartenpaare behalten ihre Kategorien. Weil Tiere vorher teils unter Natur liefen (zum Beispiel „Hund“), gilt im neuen Pool: `animals` für Tierarten, `nature` für Landschaft, Wetter und Pflanzen.

**Noch offen (nicht blockierend):**

5. **Gespielte Karten merken** (Punkt 7 im Aufbau): später entscheiden. `Ta-09-06` bleibt eine optionale Aufgabe.

## 7. Aufgaben (Vorschlag)

| ID | Inhalt |
|---|---|
| Ta-09-01 | Entscheidungen aus Abschnitt 6 klären und die Anforderungen für Kategorien, Schwierigkeit und Inhaltsregeln festlegen. |
| Ta-09-02 | Paketformat, Laden als eigener Teil mit Rückfall, Kategorien aus den Daten, Tests. |
| Ta-09-03 | Skripte am PC zum Prüfen und Einbauen (fortsetzbar, Prüfregeln, Ablehnungsliste). |
| Ta-09-04 | Prüfwerkzeug (zweiter KI-Durchgang und Durchsicht), Regelliste. |
| Ta-09-05 | Pool in Etappen erzeugen, prüfen und einbauen (zuerst eine Kategorie als Probelauf). |
| Ta-09-06 | Optional: gespielte Karten merken. |

Reihenfolge: 01, dann 02 und 03 unabhängig, dann 04, 05 zum Schluss, 06 nur auf Wunsch.

## 8. Risiken

- **Qualität schwankt je Modell:** darum Probelauf mit einer Kategorie und Prüfung, bevor alles erzeugt wird.
- **Die Wörter in beiden Sprachen:** bei unabhängiger Erzeugung unterscheiden sich die Begriffe, was für die Prüfung mehr Arbeit ist.
- **Lizenz und Herkunft der Modelle:** Die Nutzungsbedingungen des gewählten Modells müssen die Weitergabe der erzeugten Texte erlauben. Das ist vor der Veröffentlichung zu prüfen (nicht geprüft).
- **Größe wächst:** bei sehr großen Paketen auf nachladbare Pakete je Kategorie umstellen.
- **Eine Änderung der Kategorien berührt Tests und Übersetzungen:** darum als eigene, kleine Aufgabe zuerst (Ta-09-02).
