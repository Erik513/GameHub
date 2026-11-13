# GameHub Projektplan

## 1. Ziel und Umfang

GameHub wird eine kostenlose, international ausgerichtete, mobile-first Spiele-PWA für Partyspiele, Kartenspiele und weitere Gesellschaftsspiele. Die erste lieferbare Spielfunktion ist Tabu im lokalen Modus. Die Anwendung bleibt ohne Internet und ohne KI-Anbieter vollständig spielbar. Architekturgrenzen bereiten weitere Spielarten und späteren Online-Multiplayer vor, ohne diese Funktionen im ersten Produktumfang zu implementieren.

## 2. Produktanforderungen

### 2.1 Plattform

- Responsive Nutzung auf Smartphones, Tablets und Desktop-Browsern.
- Installierbare PWA mit Manifest, Icons und Service Worker.
- Statischer Produktions-Build für GitHub Pages.
- Offline-Verfügbarkeit der App-Shell und mitgelieferter Kartensätze.
- Lokaler Spielmodus ohne Benutzerkonto oder Server.

### 2.2 Internationalisierung

- Vollständige UI auf Deutsch und Englisch.
- Automatische Erkennung beim ersten Start.
- Manuelle Auswahl mit dauerhafter Speicherung.
- Unabhängige Auswahl von UI- und Kartensprache.
- Automatisierte Paritätsprüfung der Übersetzungsschlüssel.
- Erweiterbare Ressourcenstruktur für weitere Sprachen.

### 2.3 Spielauswahl und Erweiterbarkeit

- Die Anwendung startet immer mit einer Spielauswahl und öffnet kein Spiel automatisch.
- Ein zentraler Spielkatalog ist die einzige Quelle für verfügbare und geplante Spiele.
- Jedes Spiel liefert genreunabhängige Metadaten, eine Route und einen Verfügbarkeitsstatus über einen gemeinsamen Minimalvertrag.
- Gemeinsame Navigation und Startseite enthalten keine fest eingebauten Abhängigkeiten zu einzelnen Spielen.
- Spiellogik und Spieloberfläche bleiben je Spiel in getrennten Modulen gekapselt.

### 2.4 Tabu

- Mindestens zwei Teams.
- Standarddauer einer Runde 60 Sekunden, konfigurierbar.
- Konfigurierbare Rundenzahl.
- Jede Karte besitzt einen Zielbegriff und exakt drei verbotene Wörter.
- Richtig ergibt einen Punkt. Übersprungen und verbotenes Wort ergeben null Punkte.
- Mitspieler kontrollieren verbotene Wörter manuell.
- Kategorien und Schwierigkeitsgrade filtern Kartensätze.
- Nach der letzten Runde gewinnt die höchste Punktzahl. Gleichstand wird als gemeinsamer Sieg abgebildet.
- Eine explizite Zustandsmaschine kontrolliert Setup, laufende Runde, Rundenende und Spielende.

### 2.5 Kartengenerierung

- Ein providerunabhängiger Business-Port definiert Generierungsanfragen und Ergebnisse.
- Lokale Kartensätze sind immer verfügbar.
- Ollama wird als optionaler lokaler Adapter vorgesehen.
- Cloud-Anbieter dürfen später nur über freigegebene Adapter ohne Frontend-Geheimnisse integriert werden.
- Generierte Karten werden validiert, normalisiert, auf Duplikate geprüft und erst danach gespeichert.

## 3. Zielarchitektur

```text
src/
├── presentation/       React, Seiten, Komponenten, Hooks, Designsystem und spielbezogene UI
├── business/           Entitäten, Regeln, Zustandsmaschinen, Use Cases, Ports
│   ├── shared/
│   └── games/taboo/
├── data/               Repository-Implementierungen, Mapping, Migrationen
├── infrastructure/     IndexedDB-Zugang, PWA, Provider-Adapter, Browser-Dienste
├── i18n/               Konfiguration und Sprachressourcen
└── app/                Composition Root, Routing, App-Start und zentraler Spielkatalog
```

Presentation darf Business verwenden. Data und Infrastructure implementieren von Business definierte Ports. Die Verdrahtung konkreter Implementierungen findet ausschließlich im Composition Root statt. Business importiert keine React-, IndexedDB-, Browser- oder Provider-Bibliotheken.

## 4. Qualitätsstrategie

### 4.1 Prüfarten

- TypeScript mit strikten Compileroptionen.
- ESLint und Formatprüfung für statische Qualität.
- Vitest für Unit- und Integrationstests.
- Testing Library für UI-Verhalten und Barrierefreiheit aus Nutzersicht.
- Playwright für kritische End-to-End-Abläufe, Deutsch und Englisch sowie Offlinebetrieb.
- Produktions-Build als verpflichtende CI-Prüfung.

### 4.2 Coverage-Ziele

| Bereich | Mindest-Line-Coverage | Branch-Prüfung |
|---|---:|---|
| Kritische Spiellogik | 95 % | verpflichtend, Zielwert im Setup festlegen |
| Business insgesamt | 90 % | verpflichtend, Zielwert im Setup festlegen |
| Data und Infrastructure | 80 % | verpflichtend, Zielwert im Setup festlegen |
| UI-Komponenten | 75 % | verpflichtend, Zielwert im Setup festlegen |

Branch-Grenzen werden in `PH-01-04` anhand der Messmöglichkeiten pro Verzeichnis verbindlich konfiguriert. Sie dürfen die Line-Ziele nicht ersetzen.

### 4.3 Definition of Done

Eine Aufgabe ist nur `done`, wenn ihr Umfang vollständig umgesetzt ist, alle Akzeptanzkriterien erfüllt sind, die geforderten Tests erfolgreich liefen und Status sowie Changelog aktualisiert wurden. Fehlende Werkzeuge oder fehlschlagende Pflichtprüfungen führen zu `blocked` oder lassen die Aufgabe `in_progress`.

## 5. Phasen und Aufgaben

### Phase 0: Projektvorbereitung

#### PH-00-01 – Umgebung prüfen

- **Ziel:** Ausgangslage reproduzierbar erfassen.
- **Umfang:** Workspace, Git-Status sowie Versionen von Node.js, Paketmanager und Git prüfen.
- **Akzeptanzkriterien:** Befunde sind in README, Status und Changelog dokumentiert. Fehlende Voraussetzungen sind als Problem erfasst.
- **Tests:** Manuelle Konsistenzprüfung der dokumentierten Befunde.
- **Status:** done

#### PH-00-02 – Dokumentationsstruktur anlegen

- **Ziel:** Geforderte Projektdokumente bereitstellen.
- **Umfang:** `docs` mit Plan, Dashboard, Status, Changelog und Entscheidungen sowie README und AGENTS anlegen.
- **Akzeptanzkriterien:** Alle geforderten Dateien existieren und sind miteinander verlinkt.
- **Tests:** Dateiexistenz- und Linkzielprüfung.
- **Status:** done

#### PH-00-03 – Projektplan erstellen

- **Ziel:** Umsetzung in unabhängig prüfbare Aufgaben zerlegen.
- **Umfang:** Anforderungen, Architektur, Phasen, Aufgaben, Tests, Akzeptanzkriterien und Risiken dokumentieren.
- **Akzeptanzkriterien:** Alle neun geforderten Phasen sind abgedeckt. Jede Aufgabe hat ID, Ziel, Umfang, Akzeptanzkriterien, Tests und Status.
- **Tests:** Automatischer ID-Abgleich mit Statusdatei und manuelle Anforderungsmatrix.
- **Status:** done

#### PH-00-04 – Statusverwaltung erstellen

- **Ziel:** Maschinenlesbaren, faktenbasierten Fortschritt bereitstellen.
- **Umfang:** JSON-Schema inhaltlich umsetzen, stabile IDs, Statuswerte, Prüfergebnisse, Probleme und Empfehlungen pflegen.
- **Akzeptanzkriterien:** JSON ist valide. Fortschritt entspricht `done / alle Aufgaben` und wird nicht geschätzt.
- **Tests:** JSON-Parsing und rechnerischer Fortschrittsabgleich.
- **Status:** done

#### PH-00-05 – Entwicklungs-Dashboard erstellen

- **Ziel:** Projektstatus im Browser verständlich darstellen.
- **Umfang:** Responsive statische HTML-Seite mit Phasen, Aufgaben, Tests, Änderungen, Problemen und nächsten Schritten.
- **Akzeptanzkriterien:** Dashboard lädt Status-JSON, berechnet Fortschritt aus Aufgaben und aktualisiert alle 20 Sekunden. Fehler werden sichtbar dargestellt.
- **Tests:** Statische Prüfung sowie manueller Browser-Smoke-Test nach Verfügbarkeit eines lokalen HTTP-Servers.
- **Status:** done

#### PH-00-06 – Arbeitsregeln und Entscheidungen dokumentieren

- **Ziel:** Verbindliche Leitplanken für Agenten und Architektur schaffen.
- **Umfang:** AGENTS-Regeln und ADRs für Stack, Schichten, Spiele, Zustand, i18n, Persistenz, PWA, Provider und Tests.
- **Akzeptanzkriterien:** Alle verbindlichen Regeln des Auftrags sind enthalten. Grundentscheidungen besitzen Status und Begründung.
- **Tests:** Manuelle Vollständigkeitsprüfung gegen den Auftrag.
- **Status:** done

#### PH-00-07 – Dokumente auf Konsistenz prüfen

- **Ziel:** Widersprüche und ungültige Referenzen vermeiden.
- **Umfang:** JSON, IDs, Status, Fortschritt, Dateireferenzen und Abgrenzung zum Implementierungsumfang prüfen.
- **Akzeptanzkriterien:** Automatische Prüfungen laufen erfolgreich. Keine Spielfunktion, KI-Anbindung oder Multiplayer-Implementierung wurde angelegt.
- **Tests:** PowerShell-basierter Konsistenzcheck und Quellbaumprüfung.
- **Status:** done

### Phase 1: Projektfundament, Entwicklungswerkzeuge und Testinfrastruktur

#### PH-01-01 – Vite-Grundprojekt und Schichtenstruktur

- **Ziel:** Startfähiges React-TypeScript-Projekt schaffen.
- **Umfang:** Vite initialisieren, Verzeichnisstruktur gemäß Zielarchitektur anlegen, strikte TypeScript-Konfiguration und Composition Root bereitstellen.
- **Akzeptanzkriterien:** Entwicklungsserver und Produktions-Build funktionieren. Business enthält keine äußeren Imports. Eine neutrale Startansicht wird gerendert.
- **Tests:** Build, Typecheck und Architektur-Importtest.
- **Status:** done

#### PH-01-02 – Linting und Formatierung

- **Ziel:** Einheitliche statische Qualität sicherstellen.
- **Umfang:** ESLint, React-/TypeScript-Regeln, Formatprüfung und npm-Skripte konfigurieren.
- **Akzeptanzkriterien:** Neue Beispielquellen bestehen Lint und Formatprüfung. Verstöße liefern einen Fehlercode.
- **Tests:** Positive Ausführung und gezielter Regel-Smoke-Test.
- **Status:** done

#### PH-01-03 – Vitest und Testing Library

- **Ziel:** Unit- und Komponentenprüfungen ausführbar machen.
- **Umfang:** Vitest, DOM-Testumgebung, Testing Library, Setup-Datei und erstes neutrales Beispiel konfigurieren.
- **Akzeptanzkriterien:** Tests laufen lokal deterministisch und im Watch-/CI-Modus. DOM-Cleanup ist aktiv.
- **Tests:** Beispiel-Unit- und Komponenten-Test.
- **Status:** done

#### PH-01-04 – Coverage und Bereichsgrenzen

- **Ziel:** Vereinbarte Coverage messbar und erzwingbar machen.
- **Umfang:** Coverage-Provider, Include-/Exclude-Regeln, Reports und verzeichnisbezogene Line-/Branch-Grenzen konfigurieren.
- **Akzeptanzkriterien:** Bericht weist Business, kritische Logik, Data/Infrastructure und UI getrennt aus. Unterschreitung lässt den Befehl fehlschlagen.
- **Tests:** Kontrollierter Grenzwert-Smoke-Test und erfolgreicher Baseline-Lauf.
- **Status:** done

#### PH-01-05 – Playwright-Grundkonfiguration

- **Ziel:** Browserübergreifende E2E-Tests vorbereiten.
- **Umfang:** Playwright, Webserver-Start, Geräteprofile für Mobil und Desktop sowie Artefakte bei Fehlern konfigurieren.
- **Akzeptanzkriterien:** Ein Smoke-Test läuft mindestens in Chromium für Mobil und Desktop. Screenshots/Traces entstehen bei Fehlern.
- **Tests:** Playwright-Smoke-Test.
- **Status:** done

#### PH-01-06 – GitHub-Actions-Qualitätsworkflow

- **Ziel:** Automatisierte Prüfung jedes Changes ermöglichen.
- **Umfang:** Workflow für Installation, Typecheck, Lint, Tests, Coverage, Build und E2E vorbereiten.
- **Akzeptanzkriterien:** Workflow verwendet festgelegte Runtime und Dependency-Cache. Jeder Pflichtschritt blockiert bei Fehlern.
- **Tests:** Workflow-Syntaxprüfung und erster erfolgreicher Lauf nach Repository-Verknüpfung.
- **Status:** done

### Phase 2: Internationalisierung Deutsch/Englisch

#### PH-02-01 – i18n-Grundkonfiguration

- **Ziel:** Deutsch und Englisch zentral bereitstellen.
- **Umfang:** i18next, react-i18next, Namespaces, Fallback und getypte Ressourcenkonvention einrichten.
- **Akzeptanzkriterien:** Startansicht rendert beide Sprachen ohne fest codierte UI-Texte. Fallback ist definiert.
- **Tests:** Initialisierung und Rendering in Deutsch und Englisch.
- **Status:** done

#### PH-02-02 – Erkennung, Auswahl und Persistenz der UI-Sprache

- **Ziel:** Sprache automatisch erkennen und manuell dauerhaft ändern.
- **Umfang:** Browsererkennung, Sprachwahlelement und Speicher-Port mit lokalem Adapter.
- **Akzeptanzkriterien:** Erststart nutzt unterstützte Browsersprache. Auswahl überlebt Reload. Unbekannte Sprache fällt kontrolliert zurück.
- **Tests:** Unit-, Komponenten- und Integrationsfälle für beide Sprachen.
- **Status:** done

#### PH-02-03 – Unabhängige Kartensprache

- **Ziel:** UI- und Spielkartensprache getrennt verwalten.
- **Umfang:** Einstellungsmodell, Auswahl und Persistenz für Kartensprache.
- **Akzeptanzkriterien:** Änderung einer Sprache beeinflusst die andere nicht. Beide Werte überleben Reload.
- **Tests:** Business- und UI-Tests aller Kombinationen Deutsch/Englisch.
- **Status:** done

#### PH-02-04 – Übersetzungsparität prüfen

- **Ziel:** Fehlende Übersetzungen automatisch erkennen.
- **Umfang:** Test oder Skript für identische Schlüsselstrukturen und nichtleere Werte.
- **Akzeptanzkriterien:** Fehlender, zusätzlicher oder leerer Schlüssel lässt die Prüfung fehlschlagen.
- **Tests:** Positive Ressourcenprüfung und negative Fixture-Fälle.
- **Status:** done

### Phase 3: Gemeinsame App-Oberfläche und Designsystem

#### PH-03-01 – Design-Tokens und Basiskomponenten

- **Ziel:** Konsistente mobile-first Oberfläche schaffen.
- **Umfang:** Farben, Typografie, Abstände, Fokuszustände, Buttons, Eingaben, Karten und Dialoggrundlage.
- **Akzeptanzkriterien:** Komponenten skalieren von 320 Pixel bis Desktop, unterstützen Tastaturbedienung und ausreichende Kontraste.
- **Tests:** Komponentenverhalten, Fokus, deaktivierte Zustände und visuelle Smoke-Tests.
- **Status:** done

#### PH-03-02 – App-Shell, Spielkatalog und Navigation

- **Ziel:** Gemeinsamen, von einzelnen Spielen unabhängigen Rahmen für Spielauswahl und Einstellungen bereitstellen.
- **Umfang:** Header, Hauptnavigation, responsive Startseite mit verpflichtender Spielauswahl, zentraler Spielkatalog und minimaler Spielmodulvertrag für Kennung, Übersetzungsschlüssel, Route und Verfügbarkeitsstatus.
- **Akzeptanzkriterien:** App-Start zeigt immer die Spielauswahl. Spiele werden ausschließlich über den Katalog eingebunden. Navigation funktioniert per Tastatur und Touch. Unfertige Spiele sind verständlich gekennzeichnet. Shell und Navigation importieren keine Tabu-spezifische Spiellogik.
- **Tests:** Katalog-Vertrag sowie Routing-, Auswahl- und Navigationsintegration in Deutsch und Englisch.
- **Status:** done

#### PH-03-03 – Einstellungen und Statusmeldungen

- **Ziel:** Globale Einstellungen und verständliche Rückmeldungen bereitstellen.
- **Umfang:** Einstellungsseite, Sprachfelder, Fehlermeldungen, Lade- und Leerzustände.
- **Akzeptanzkriterien:** Beschriftungen sind lokalisiert und zugänglich. Fehler werden ohne Datenverlust angezeigt.
- **Tests:** Komponenten- und Accessibility-Tests in beiden Sprachen.
- **Status:** done

### Phase 4: Tabu-Kernlogik

#### PH-04-01 – Tabu-Domänenmodell und Validierung

- **Ziel:** Gültige Teams, Konfigurationen und Karten fachlich modellieren.
- **Umfang:** Typen/Entitäten für Team, Karte, Kategorie, Schwierigkeit und Spielkonfiguration sowie Validatoren.
- **Akzeptanzkriterien:** Mindestens zwei Teams, positive Dauer/Runden und exakt drei unterschiedliche verbotene Wörter werden erzwungen.
- **Tests:** Grenzwerte, ungültige Eingaben, Normalisierung und sprachbezogene Kartenfälle.
- **Status:** done

#### PH-04-02 – Zustandsmaschine und Übergänge

- **Ziel:** Spielablauf deterministisch steuern.
- **Umfang:** Zustände `setup`, `roundRunning`, `roundEnded`, `gameEnded` und zulässige Ereignisse implementieren.
- **Akzeptanzkriterien:** Nur gültige Übergänge sind möglich. Aktives Team, Runde und Karte bleiben konsistent.
- **Tests:** Übergangsmatrix, ungültige Ereignisse und vollständige Mehrteam-Partie.
- **Status:** done

#### PH-04-03 – Kartenaktionen und Punkte

- **Ziel:** Richtig, Überspringen und verbotenes Wort korrekt werten.
- **Umfang:** Fachliche Ereignisse, Kartenvorschub und Punktberechnung.
- **Akzeptanzkriterien:** Nur richtig erhöht genau um eins. Andere Aktionen ergeben null und jede Karte wird höchstens einmal gewertet.
- **Tests:** Alle Aktionen, Wiederholungsversuche und Kartenende.
- **Status:** done

#### PH-04-04 – Rundenfolge und Siegerermittlung

- **Ziel:** Konfigurierbare Partie korrekt abschließen.
- **Umfang:** Teamrotation, Rundenzählung, Endbedingung, Einzel- und Gleichstandsieger.
- **Akzeptanzkriterien:** Jedes Team erhält die vorgesehenen Runden. Siegerliste ist deterministisch und enthält alle punktgleichen Teams.
- **Tests:** Zwei und mehrere Teams, verschiedene Rundenzahlen, Gleichstände.
- **Status:** done

#### PH-04-05 – Kartenfilter und Deckbildung

- **Ziel:** Karten nach Sprache, Kategorie und Schwierigkeit auswählen.
- **Umfang:** Reine Filter- und Decklogik einschließlich Verhalten bei zu kleinem Bestand.
- **Akzeptanzkriterien:** Nur passende Karten erscheinen. Reihenfolge kann über injizierbaren Zufall deterministisch getestet werden. Leere Ergebnisse sind explizit.
- **Tests:** Filterkombinationen, deterministisches Mischen, Duplikate und leere Decks.
- **Status:** done

### Phase 5: Tabu-Benutzeroberfläche

#### PH-05-01 – Spielkonfiguration

- **Ziel:** Lokale Partie vollständig einrichten.
- **Umfang:** Teams, Rundenzahl, Rundendauer, Kategorien, Schwierigkeit und Kartensprache erfassen.
- **Akzeptanzkriterien:** Mindestens zwei eindeutige Teamnamen sind erforderlich. Fehler sind lokalisiert. Gültiges Setup startet die Zustandsmaschine.
- **Tests:** Formvalidierung und Start in Deutsch/Englisch.
- **Status:** done

#### PH-05-02 – Laufende Runde und Timer

- **Ziel:** Aktive Runde touchfreundlich bedienen.
- **Umfang:** Zielbegriff, drei verbotene Wörter, Team, Zeit, Punktestand sowie drei Kartenaktionen anzeigen.
- **Akzeptanzkriterien:** 60 Sekunden sind Standard. Ablauf beendet die Runde genau einmal. Bedienelemente sind auf kleinen Displays nutzbar.
- **Tests:** Fake-Timer, Aktionen, Ablauf und Accessibility.
- **Status:** done

#### PH-05-03 – Rundenende

- **Ziel:** Ergebnis prüfen und kontrolliert fortsetzen.
- **Umfang:** Rundenzusammenfassung, Punktestand und nächstes Team anzeigen.
- **Akzeptanzkriterien:** Angezeigte Werte entsprechen Business-Zustand. Start der nächsten Runde erfolgt nur durch Nutzeraktion.
- **Tests:** Mehrere Ergebnisvarianten und Teamwechsel.
- **Status:** done

#### PH-05-04 – Spielende und Neustart

- **Ziel:** Gewinner verständlich darstellen und neue Partie ermöglichen.
- **Umfang:** Endstand, Einzel-/Gleichstandsieger, Neustart mit gleicher oder neuer Konfiguration.
- **Akzeptanzkriterien:** Sieger sind korrekt lokalisiert. Neustart übernimmt nur ausdrücklich vorgesehene Einstellungen und setzt Partie-Daten zurück.
- **Tests:** Sieg, Gleichstand und beide Neustartwege.
- **Status:** done

### Phase 6: Speicherung, Kartensätze und Offlinebetrieb

Laufende Tabu-Partien und deren Ergebnisse bleiben im Arbeitsspeicher. Spracheinstellungen verbleiben im vorhandenen lokalen Einstellungsspeicher. Eigene, importierte oder generierte Karten werden pro Spiel gespeichert. Mitgelieferte Karten bleiben versionierte App-Daten und stehen über den Offline-Cache bereit. Lokale Wiederherstellung und Online-Wiedereinstieg sind spätere, getrennte Erweiterungen.

#### PH-06-01 – IndexedDB-Schema und Repository-Adapter

- **Ziel:** Dauerhaft nutzbare eigene Karten robust lokal speichern.
- **Umfang:** Versioniertes Schema, Adapter für Business-Ports, Transaktions- und Fehlerbehandlung.
- **Akzeptanzkriterien:** Lesen/Schreiben funktioniert nach Reload. Partielle Fehler hinterlassen konsistenten Zustand.
- **Tests:** Integrationsfälle mit Test-IndexedDB, Transaktionsfehler und erstmaliges Schema-Upgrade.
- **Status:** done

#### PH-06-02 – Lokale deutsche und englische Kartensätze

- **Ziel:** Offline spielbare Grundausstattung liefern.
- **Umfang:** Kuratierte Kartendateien mit Sprache, Kategorie, Schwierigkeit, Ziel und exakt drei verbotenen Wörtern.
- **Akzeptanzkriterien:** Beide Sprachen besitzen ausreichende Karten für Standardpartien. Enge Filter werden vor Spielbeginn auf Kartenmangel geprüft. Alle Dateien bestehen Schema- und Duplikatprüfung.
- **Tests:** Datensatzvalidierung, Eindeutigkeit und Mindestmengen.
- **Status:** done

#### PH-06-03 – Import und Aktualisierung lokaler Karten

- **Ziel:** Eigene Kartensätze importieren und für Sicherung und Rückimport exportieren.
- **Umfang:** Versioniertes Austauschformat, Validierung, Duplikatbehandlung und Updates mitgelieferter App-Daten.
- **Akzeptanzkriterien:** Wiederholter Import erzeugt keine Duplikate. Updates mitgelieferter Karten erhalten eigene Inhalte.
- **Tests:** Erstimport, Wiederholung, Export mit Rückimport und Update mit vorhandenen eigenen Karten.
- **Status:** done

#### PH-06-04 – Manifest und Service Worker

- **Ziel:** Installierbare Offline-PWA bereitstellen.
- **Umfang:** Manifest, Icons, Cache-Strategien, Offline-App-Shell und Update-Fluss.
- **Akzeptanzkriterien:** PWA-Audit erkennt Installierbarkeit. Nach einem Online-Erstaufruf startet eine lokale Partie offline.
- **Tests:** Build-Prüfung, Manifesttest und Playwright-Offline-Szenario.
- **Status:** done

### Phase 7: KI-Kartengenerierung

#### PH-07-01 – Generierungsport und neutrales Datenmodell

- **Ziel:** Anbieterunabhängigen Vertrag definieren.
- **Umfang:** Anfrage, Ergebnis, Fehler, Abbruch und Provider-Fähigkeiten als Business-Typen modellieren.
- **Akzeptanzkriterien:** Business enthält keine Anbieter- oder Transporttypen. Fake-Provider lässt sich injizieren.
- **Tests:** Contract-Tests mit Fake-Provider und Fehlerfällen.
- **Status:** done

#### PH-07-02 – Validierungs-, Normalisierungs- und Duplikatpipeline

- **Ziel:** Nur gültige neue Karten übernehmen.
- **Umfang:** Schema, exakt drei Verbotswörter, Sprache, Normalisierung, bestehende und batchinterne Duplikate prüfen.
- **Akzeptanzkriterien:** Ungültige Karten werden mit Gründen abgelehnt. Gültige Karten werden atomar gespeichert.
- **Tests:** Grenzfälle, Unicode, Groß-/Kleinschreibung, partielle Provider-Antworten und Transaktionsfehler.
- **Status:** done

#### PH-07-03 – Lokaler Generatoradapter

- **Ziel:** Provider-Vertrag ohne externen Dienst nutzbar machen.
- **Umfang:** Adapter auf kuratierte lokale Kandidaten und deterministische Testdaten.
- **Akzeptanzkriterien:** Funktioniert offline und erfüllt denselben Vertrag wie spätere Provider.
- **Tests:** Provider-Contract und Offline-Integration.
- **Status:** done

#### PH-07-04 – Ollama-Adapter

- **Ziel:** Optionale lokale Modellerzeugung ermöglichen.
- **Umfang:** HTTP-Adapter, Zeitüberschreitung, Abbruch, Antwortmapping und verständliche Verfügbarkeitsfehler.
- **Akzeptanzkriterien:** App bleibt ohne Ollama vollständig nutzbar. Keine Providerdetails gelangen in Business. Fehler blockieren bestehende Karten nicht.
- **Tests:** Gemockte Antworten, Timeout, Abbruch, fehlerhaftes JSON und Validierungspipeline.
- **Status:** done

#### PH-07-05 – Generierungsoberfläche und lokale Speicherung

- **Ziel:** Auf Wunsch neue Karten verdeckt in die laufende Partie mischen.
- **Umfang:** Zusatzkarten im Setup aktivieren. Anbieter automatisch auswählen und die bestehenden Spielfilter verwenden.
- **Akzeptanzkriterien:** Neue Karten werden geprüft, gemischt und erst im Spiel sichtbar. Sie gelten für die vorbereitete Partie und werden nicht automatisch gespeichert.
- **Tests:** Spielablauf ohne vorzeitige Anzeige, Anbietererkennung und Offlinebetrieb.
- **Status:** done

### Phase 8: Veröffentlichung, E2E-Tests und Qualitätssicherung

#### PH-08-01 – Kritische E2E-Spielabläufe

- **Ziel:** Tabu end-to-end absichern.
- **Umfang:** Setup, komplette Partie, Wertung, Gleichstand, Sprachwechsel, Reload und mobile Ansicht.
- **Akzeptanzkriterien:** Kritische Abläufe laufen deterministisch in unterstützten Zielprofilen und beiden Sprachen.
- **Tests:** Playwright-Suite.
- **Status:** done

#### PH-08-02 – Offline- und PWA-E2E

- **Ziel:** Offlineversprechen real prüfen.
- **Umfang:** Installation/Audit, Cache-Aufbau, Netztrennung, App-Neustart und lokale Partie.
- **Akzeptanzkriterien:** Mitgelieferte Karten und Kernspiel funktionieren nach Netztrennung. Updatefehler zerstören keinen spielbaren Cache.
- **Tests:** Playwright mit Offline-Kontext und Produktions-Build.
- **Status:** done

#### PH-08-03 – GitHub-Pages-Build und Deployment

- **Ziel:** Reproduzierbare kostenlose Veröffentlichung schaffen.
- **Umfang:** Base-Pfad, statisches Routing, Pages-Workflow, Umgebungs- und Berechtigungsgrenzen.
- **Akzeptanzkriterien:** Deployment-URL lädt Assets und direkte unterstützte Routen korrekt. Workflow veröffentlicht nur nach erfolgreichen Pflichtprüfungen.
- **Tests:** Produktions-Build, Link-/Asset-Smoke-Test und Deployment-Workflow.
- **Status:** done

#### PH-08-04 – Qualitäts- und Barrierefreiheitsabnahme

Tabu-Feinschliff: Versehentlich vergebene Punkte lassen sich während der Runde und in der Rundenzusammenfassung zurücknehmen. Die Korrektur betrifft das gerade gespielte Team. Gespielte Karten und Zeit bleiben unverändert.

- **Ziel:** Release-Kriterien vollständig prüfen.
- **Umfang:** Coverage, Lint, Typen, Tests, Browserprofile, Tastatur, Kontraste, lokalisierte Inhalte und dokumentierte Restrisiken.
- **Akzeptanzkriterien:** Alle Grenzwerte und Pflichtprüfungen bestehen. Offene Probleme sind priorisiert und Release-Entscheidung dokumentiert.
- **Tests:** Vollständige CI-Pipeline und manuelle Abnahmecheckliste.
- **Status:** done

**Abnahmecheckliste**

- Deutsch und Englisch: vollständige Partien, Wertungen, Einzelsieg und Gleichstand in Desktop- und Mobilprofil geprüft.
- Tastatur: Punktekorrektur per Tab und Enter geprüft. Einstellungen und Dialoge sind durch Komponenten- und Browserprüfungen abgedeckt.
- Kontrast: sechs zentrale Farbkombinationen anhand der CSS-Farbwerte geprüft. Text mindestens 6,75:1, Fokusrahmen auf der Kartenfläche 8,39:1.
- Offline: Start nach Netztrennung, eigene Karten und Cache-Wechsel bei Updates durch Browserprüfungen abgedeckt.
- Nach dem ersten Release priorisieren: Screenreader-Prüfung auf realen Geräten und Praxistest mit einer laufenden Ollama-Instanz. Die Abnahme umfasst keine vollständige WCAG-Konformitätsprüfung.

**Release-Entscheidung:** Der lokale Tabu-Erstrelease ist freigegeben. Die Pflichtprüfungen und die Veröffentlichung liefen erfolgreich im [GitHub-Lauf 43047050259](https://github.com/Erik513/GameHub/actions/runs/43047050259).

### Phase 10 – Mobile Bedienung und Spielablauf

#### PH-10-01 – Mobile-first Oberfläche mit Daumenzone

- **Ziel:** Hauptmenü und Tabu für die Bedienung mit einer Hand am Handy gestalten.
- **Umfang:** Kompakte Kopfzeile, angeheftete Hauptaktionen, Bottom-Sheet-Dialog, große Touch-Ziele, blaues Akzentfarbschema, Grün und Rot für Aktionen.
- **Akzeptanzkriterien:** Alle Ansichten sind bei 390 px Breite ohne horizontales Scrollen bedienbar; Hauptaktionen liegen unten.
- **Tests:** Komponenten- und E2E-Tests auf Desktop und Mobil.
- **Status:** done

#### PH-10-02 – Spielablauf: Rundenübersicht, Pause, Überspringlimit und Stechen

- **Ziel:** Den Tabu-Ablauf an die Anforderungen des Auftraggebers anpassen.
- **Umfang:** Zufällige feste Teamreihenfolge, Rundenübersicht mit Punkteliste und Rundenauswertung (Wertung änderbar), vier verbotene Wörter je Karte, Überspringlimit pro Runde, Pause, Neustart mit neuen Karten, Runde beenden, einheitliche Navigation mit Zweifach-Bestätigung, Nachladen von KI-Karten und Stechen bei Gleichstand auf Zeit.
- **Akzeptanzkriterien:** Die Regeln werden von der Zustandsmaschine durchgesetzt; Pause verdeckt die Karte und zählt nicht zur Zeit; Stechen gilt für zwei bis drei gleichauf liegende Teams.
- **Tests:** Unit-Tests der Zustandsmaschine und Kartenauswahl, Komponenten- und E2E-Tests.
- **Status:** done

#### PH-10-03 – Feinschliff nach Rückmeldung

- **Ziel:** Rückmeldungen aus dem Praxistest umsetzen.
- **Umfang:** Rundenzahl Kurz (3), Mittel (5), Lang (10) und Unbegrenzt; gleich große Auswahlbuttons mit Unendlichsymbol; Schwierigkeit farbig im Menü und links oben auf der Karte; Zeitanzeige wechselt in den letzten Sekunden die Farbe; im Stechen zählt ein verbotenes Wort als falsch und bringt eine neue Karte gleicher Schwierigkeit; Kartenreihenfolge durchgehend zufällig.
- **Akzeptanzkriterien:** Unbegrenzte Spiele lassen sich nach jeder vollständigen Runde beenden; alle Gruppen sind gleich breit bedienbar.
- **Tests:** Unit-, Komponenten- und E2E-Tests.
- **Status:** done

### Phase 11 – Tabu-Qualitätsprüfung

#### PH-11-01 – Spiellogik prüfen, auch Randfälle

- **Ziel:** Alle Regeln der Zustandsmaschine systematisch auf Randfälle prüfen (leere oder zu kleine Kartensätze, Abbruch in Pause, unbegrenzte Runden, Stechen mit Gleichstand, Wiederverwendung von Karten).
- **Akzeptanzkriterien:** Randfälle sind dokumentiert, getestet und bei Fehlern behoben.
- **Ergebnis:** Dokumentiert in `docs/GAMEHUB_TABOO_LOGIC.md`. Eine Zufallsprüfung mit 400 Partien sichert die Invarianten ab.
- **Status:** done

#### PH-11-02 – Testabdeckung prüfen und erhöhen

- **Ziel:** Abdeckung gemäß Arbeitsregeln erreichen (kritische Logik 95 %, Business 90 %, Data/Infrastructure 80 %, UI 75 %), besonders Verzweigungen der Tabu-Oberfläche.
- **Ergebnis:** Zeilenabdeckung 99,15 %, Verzweigungen 94,05 %. Alle Zielwerte sind erfüllt.
- **Status:** done

#### PH-11-03 – Sprachabdeckung Deutsch/Englisch inklusive Oberfläche prüfen

- **Ziel:** Alle sichtbaren Texte, auch Hinweise, Fehlermeldungen und Screenreader-Namen, in beiden Sprachen prüfen; Oberflächentests für beide Sprachen.
- **Ergebnis:** Automatische Prüfungen in `src/i18n/translationQuality.test.ts` und `src/presentation/languageFlows.test.tsx`. Die Seitensprache folgt der Oberflächensprache.
- **Status:** done

#### PH-11-04 – Oberflächentests ergänzen

- **Ziel:** Komponenten- und E2E-Tests für alle Ansichten (Menü, Rundenübersicht, Runde, Pause, Stechen, Ergebnis) auf Handybreite.
- **Ergebnis:** `e2e/mobile-layout.spec.ts` prüft alle Ansichten auf 360 und 412 Pixel in beiden Sprachen; Komponenten-Durchlauf in `src/presentation/languageFlows.test.tsx`.
- **Status:** done

#### PH-11-05 – Struktur prüfen und wiederverwendbare Spielbausteine dokumentieren

- **Ziel:** Gemeinsame Bausteine (Spielrahmen mit Kopfzeile, angeheftete Aktionsleiste, Auswahlgruppen, Punkteliste, Zweifach-Bestätigung, Pause/Beenden über `useGameExit`) so ordnen und dokumentieren, dass neue Spiele nur noch ihre Spiellogik und ihre Inhalte liefern.
- **Akzeptanzkriterien:** Ein Leitfaden beschreibt den Aufbau eines neuen Spiels; Architekturentscheidungen werden vorab mit dem Auftraggeber abgestimmt.
- **Ergebnis:** Option B freigegeben und umgesetzt. Vorschlag in `docs/GAMEHUB_GAME_MODULES.md`, Leitfaden in `docs/GAMEHUB_NEW_GAME_GUIDE.md`.
- **Status:** done

#### PH-11-06 – Tabu-Zustandslogik als Hooks und CSS je Spiel

- **Ziel:** Die Zustandslogik aus `TabooSetup.tsx` (Nachladen, Pause, Neustart, Stechen) als Hooks herauslösen und die Tabu-Stile in eine eigene Datei je Spiel verschieben.
- **Akzeptanzkriterien:** Verhalten und Tests unverändert; Layout-Prüfung besteht.
- **Ergebnis:** Tabu-Stile in `styles/games/taboo.css`, Nachladen der KI-Karten als Hook `useTabooRefill`. Pause, Neustart und Stechen bleiben im Container, bis ein zweites Spiel sie braucht.
- **Status:** done

### Phase 12 – Tabu-Erweiterungen

#### PH-12-01 – Info-Buttons mit Erklärfenster für Einstellungen

- **Ziel:** Zu jeder erklärungsbedürftigen Einstellung gibt es einen Info-Button, der ein Fenster mit der Erklärung öffnet.
- **Ergebnis:** Baustein `InfoButton` in `game-kit`; Erklärungen für Runden, Kartenquelle, Stechen, Überspringen und Schwierigkeit in Deutsch und Englisch.
- **Status:** done

#### PH-12-02 – Spielregeln erklären

- **Ziel:** Die Regeln von Tabu und der Spielvarianten sind in der App verständlich erklärt.
- **Ergebnis:** Knopf „Spielregeln“ im Setup öffnet ein Fenster mit Ziel, Ablauf, Wertung, Überspringen und Spielende (Deutsch und Englisch). Die Regeln der Spielmodi folgen mit PH-12-07.
- **Status:** done

#### PH-12-03 – Teamreihenfolge manuell oder zufällig festlegen

- **Ziel:** Die Reihenfolge der Teams kann selbst bestimmt oder zufällig ausgelost werden.
- **Ergebnis:** Auswahl „Teamreihenfolge“ (Zufällig oder Wie eingegeben) im Setup mit Info-Button. „Wie eingegeben“ nimmt die Reihenfolge der Teamfelder; sie bleibt auch beim Neuspielen mit gleicher Konfiguration erhalten. Eine freie Umsortierung per Ziehen ist bewusst nicht enthalten.
- **Status:** done

#### PH-12-04 – Spieler hinzufügen und auf Teams verteilen

- **Ziel:** Spieler lassen sich anlegen und manuell oder zufällig auf Teams verteilen.
- **Ergebnis:** Einklappbarer Bereich „Spieler und Teams“ im Setup: Namen eintragen, zufällig verteilen (Teamgrößen unterscheiden sich um höchstens eins) oder je Spieler das Team wählen. Reine Funktionen `parsePlayers` und `splitIntoTeams` in `src/business/shared/players.ts`, damit andere Spiele sie nutzen können. Die Verteilung ist eine Übersicht; Tabu zählt weiterhin Teams, nicht einzelne Spieler.
- **Status:** done

#### PH-12-05 – Mehrere Karten und Kategorien hinzufügen

- **Ziel:** Eigene Karten und Kategorien lassen sich in größerer Zahl anlegen.
- **Ergebnis:** Formular „Karten hinzufügen“ in „Eigene Tabu-Karten“: eine Karte pro Zeile („Begriff: Wort1, Wort2, Wort3, Wort4“), gemeinsame Kategorie und Schwierigkeit, ungültige Zeilen werden genannt und verhindern das Speichern. Eigene Kategorien sind Namen, die direkt im Formular angelegt werden; die Kategorie-Kennung einer Karte ist dieser Name (keine neue Speicherstruktur, Import/Export bleiben kompatibel). Eigene Kategorien erscheinen im Setup als Filter, auch für die KI-Erzeugung. Bearbeiten und Löschen folgt mit PH-12-06.
- **Status:** done

#### PH-12-06 – Kartenimport und -export mit einfachem Editor

- **Ziel:** Karten lassen sich importieren, exportieren und in einem einfachen Editor bearbeiten.
- **Ergebnis:** Import und Export gab es bereits. Neu: Liste „Meine Karten“ auf der Kartenseite mit Suche, Bearbeiten (Begriff, vier verbotene Wörter, Kategorie inklusive neuer Kategorie, Schwierigkeit) und Löschen mit Bestätigung. Das Speicher-Interface `TabooCardRepository` hat dafür `update` und `remove`. Standardkarten bleiben unveränderbar.
- **Status:** done

#### PH-12-07 – Spielmodi: Klassisch, Auf Zeit, Gegen die Zeit

- **Ziel:** Neben dem klassischen Modus gibt es „Auf Zeit“ (feste Kartenzahl, das Team mit der kürzesten Zeit gewinnt) und „Gegen die Zeit“ (jedes Team hat ein Zeitkonto, das beim Raten herunterläuft und bei richtiger Antwort stoppt; es gewinnt das Team mit Restzeit).
- **Akzeptanzkriterien:** Regeln werden vor Umsetzung mit dem Auftraggeber abgestimmt; neue Modi sind ein Teil der Business-Schicht und nutzen die gemeinsamen Oberflächenbausteine.
- **Stand 2026-11-12:** Abläufe vom Auftraggeber festgelegt (Auf Zeit: jedes Team am Stück, Überspringen einmal und ersetzt, Gleichstand gemeinsamer Sieg; Gegen die Zeit: Zeitkonto 2, 3 oder 5 Minuten, das aktive Team erklärt und rät selbst, damit niemand Zeit durch Trödeln stehlen kann). Regelentwurf mit Annahmen und Teilaufgaben A bis E: `docs/GAMEHUB_TABOO_MODES.md`. Umsetzung nach Bestätigung der offenen Punkte.
- **Teilaufgaben (Dashboard):** `PH-12-07-A` Spiellogik „Auf Zeit“ (**done**: `race.ts`, `raceCards.ts`, 100 % Zeilen- und 95 % Zweigabdeckung), `PH-12-07-B` Oberfläche „Auf Zeit“ (**done**: Spielmodus im Setup, `TabooRaceGame`, `TabooRaceRun`, `TabooRaceResults`), `PH-12-07-C` Spiellogik „Gegen die Zeit“, `PH-12-07-D` Oberfläche „Gegen die Zeit“, `PH-12-07-E` Dokumentation und Abschlussprüfung (je planned).
- **Status:** in_progress

### Phase 13 – Karten und Kategorien neu gestalten

Auftrag des Auftraggebers: Logik und Ansicht von Karten und Kategorien werden vereinfacht und bleiben kompakt und für das Handy ausgelegt. Annahmen (noch nicht bestätigt): Das einfache Formular ersetzt die Mehrzeilen-Eingabe; die Kategorien-Ansicht zeigt auch die mitgelieferten Karten, aber nur zum Lesen; eine Kategorie entsteht durch ihre Karten (keine leeren Kategorien).

#### PH-13-01 – Karten einfach hinzufügen

- **Ziel:** Oben auf der Kartenseite steht ein schlankes Formular: Kategorie, Schwierigkeit, Begriff und die vier verbotenen Wörter in einem Feld, durch Komma getrennt.
- **Akzeptanzkriterien:** Eine Karte wird mit denselben Regeln wie bisher geprüft; Fehler und doppelte Begriffe werden verständlich gemeldet; Deutsch und Englisch; mobil kompakt.
- **Ergebnis:** Das Formular „Karte hinzufügen“ steht oben auf der Kartenseite: Kategorie und Schwierigkeit nebeneinander, darunter Begriff und die vier verbotenen Wörter in einem Feld. Nach dem Speichern bleiben Kategorie und Schwierigkeit erhalten, der Fokus springt zurück auf den Begriff. Die Mehrzeilen-Eingabe entfällt.
- **Status:** done

#### PH-13-02 – Kategorien-Ansicht mit Kartentabelle

- **Ziel:** Jede Kategorie lässt sich ausklappen und zeigt ihre Karten kompakt untereinander (Begriff, verbotene Wörter, Schwierigkeit); eigene Karten lassen sich dort bearbeiten und löschen.
- **Akzeptanzkriterien:** Standardkarten sind nur lesbar; die Ansicht bleibt auf einem kleinen Handy ohne seitliches Scrollen bedienbar.
- **Ergebnis:** „Karten nach Kategorie“: jede Kategorie ist ein ausklappbarer Block mit Zähler („15 (2 eigene)“). Die Karten stehen als kompakte Zeilen untereinander (Begriff und Schwierigkeit in Ampelfarbe, darunter die verbotenen Wörter), eigene Karten zuerst und mit Bearbeiten-Knopf; Standardkarten sind nur lesbar. Beim Bearbeiten stehen Begriff, Wörter, Kategorie und Schwierigkeit in einem kleinen Formular, Löschen mit Zweit-Tipp. Es werden nur Karten der gewählten Kartensprache gezeigt.
- **Status:** done

#### PH-13-03 – Hauptmenü: Kategorien getrennt

- **Ziel:** Im Setup sind die Kategorien leicht getrennt in Standard und Eigene.
- **Ergebnis:** Im Setup stehen die Kategorien in zwei leicht getrennten Gruppen „Standard“ und „Eigene“ (Beschriftung nur, wenn es eigene Kategorien gibt).
- **Status:** done

#### PH-13-04 – KI-Vorschlag für verbotene Wörter (später wieder entfernt)

- **Hinweis:** Der Knopf wurde umgesetzt und später auf Wunsch des Auftraggebers wieder entfernt, weil die KI nur mit installiertem Ollama am Rechner läuft und Fremde nichts extra installieren sollen. Port, Adapter und Texte sind gelöscht (im Verlauf der Versionsverwaltung ab Commit `5a02b09` auffindbar). Die Kartenerzeugung im Setup über Ollama bleibt.

- **Ziel:** Beim Anlegen oder Bearbeiten einer Karte kann die lokale KI (Ollama, falls erreichbar) anhand des Begriffs vier verbotene Wörter vorschlagen.
- **Akzeptanzkriterien:** Der Knopf erscheint nur, wenn eine lokale KI gefunden wurde; der Vorschlag wird geprüft (vier verschiedene Wörter, keines gleich dem Begriff) und nur in das Feld eingetragen, nicht automatisch gespeichert; die Kartenerfassung funktioniert ohne KI unverändert. Keine Daten verlassen den Rechner (nur `127.0.0.1`).
- **Ergebnis:** Neuer Knopf „Wörter mit KI vorschlagen“ im Formular „Karte hinzufügen“ und im Bearbeiten-Formular. Er erscheint nur, wenn beim Öffnen der Kartenseite eine lokale Ollama-KI gefunden wurde. Der Vorschlag (vier verschiedene Wörter, keines gleich dem Begriff, geprüft in `reviewForbiddenWords`) wird ins Feld geschrieben und nicht automatisch gespeichert. Port `TabooWordSuggester` in der Business-Schicht, Adapter `ollamaTabooWordSuggester` in der Infrastruktur (nur `127.0.0.1`). Nicht an einer echten KI ausprobiert (auf diesem Rechner lief keine), nur mit Testdoubles.
- **Status:** done

#### PH-13-05 – Kartenseite verfeinern

- **Ziel:** Die Kartenseite wirkt aufgeräumt: Aktionen sind echte Knöpfe (Bearbeiten als Stiftsymbol), der Export gilt für genau eine Kategorie und der Import ist ein gestalteter Knopf statt des rohen Dateifelds.
- **Ergebnis:** Bearbeiten ist ein Knopf mit Stiftsymbol (kein blauer Text mehr), über zwei Zeilen der Kartenzeile. Der Export steht je Kategorie in der geöffneten Kategorie und enthält nur deren eigene Karten; der globale Export entfällt (ein Gesamt-Backup aller eigenen Karten ist damit nicht mehr möglich, bei Bedarf als eigene Aufgabe). Der Import ist ein Knopf mit Symbol, das rohe Dateifeld ist versteckt. Zurück und KI-Vorschlag sind ebenfalls Knöpfe mit Symbol. Gemeinsamer Baustein `Icon`. Nachbesserung: kleine Symbolknöpfe (2,25 rem) direkt neben dem Kartennamen und dem Kategorienamen; Knopf „Karten“ (vorher „Eigene Karten verwalten“) steht mit „Spielregeln“ in einer Leiste oben rechts im Setup; Die Kartenseite zeigt in der Kopfzeile der App nur einen Zurück-Pfeil oben rechts (Einstellungen und Home sind dort ausgeblendet und nur im Hauptformular sichtbar), umgesetzt über `useGameBack` in `GameChrome`; der KI-Knopf (Funkel-Symbol) sitzt neben dem Wörterfeld und ist ohne gefundene KI sichtbar, aber deaktiviert mit Hinweis.
- **Status:** done

### Phase 14 – Lokale KI am Rechner

Auftrag des Auftraggebers: Die KI sollte ohne Zusatzprogramm und auch am Handy laufen. Ergebnis der Prüfung: Ein kleines Modell im Browser ist dafür zu schlecht (Messung `PH-14-01`); die Wikipedia-Alternative hat der Auftraggeber abgelehnt. **Entscheidung (ADR-018): Die KI gibt es nur am Rechner über ein lokal installiertes Programm (Ollama). Am Handy gibt es keine KI, alle Karten bleiben ohne KI nutzbar. Der KI-Knopf für Wortvorschläge wurde danach wieder entfernt.**

#### PH-14-01 – Qualitätstest

- **Ergebnis:** Qwen2.5-0.5B im Browser (WebLLM): schnell (0,2 bis 0,4 s je Karte), aber nur etwa 2 bis 3 von 20 Karten sinnvoll, Deutsch deutlich schlechter. Größere Modelle (1,5 Mrd. und mehr) brauchen mindestens 1,6 GB Grafikspeicher und sind für Handys unrealistisch; sie wurden nicht getestet. Die Testseite `prototypes/ai-word-test.html` bleibt als Werkzeug erhalten.
- **Status:** done

### Phase 15 – Großer Kartenpool für Tabu

Ausgangspunkt: Eine KI am Handy ist nicht möglich (`PH-14-01`, `ADR-018`). Der Auftraggeber erzeugt die Karten stattdessen am PC mit einer guten KI, prüft sie und liefert sie mit der App aus. Die vollständige Planung steht in `docs/GAMEHUB_CARD_POOL.md`. Sie ist ein Vorschlag; die Entscheidungen in Abschnitt 6 dieses Dokuments brauchen die Zustimmung des Auftraggebers.

- **PH-15-01:** Entscheidungen klären. Entschieden: 500 Karten je Sprache zuerst, später bis 1.500; zweiter KI-Durchgang plus Stichproben; Deutsch und Englisch unabhängig erzeugen. Kategorien: zehn (Alltag, Natur, Kultur, Essen und Trinken, Tiere, Sport und Freizeit, Berufe, Orte und Reisen, Film/Musik/Medien, Technik), Tabelle in `docs/GAMEHUB_CARD_POOL.md`. Gespielte Karten merken: später (`PH-15-06` bleibt optional). Status: done
- **PH-15-02:** Paketformat, Laden als eigener Teil mit Rückfall auf die 45 eingebauten Karten, Kategorien aus den Daten statt aus festen Schlüsseln. **Ergebnis:** Format `gamehub-taboo-pack` (Version 1) je Sprache in `src/data/pool/de.json` und `en.json` mit den zehn Kategorien (Kennung, deutscher und englischer Name) und einer leeren Kartenliste; `parseTabooCardPack` prüft streng und lehnt ein beschädigtes Paket ganz ab; `loadTabooCardPack` lädt es per dynamischem Import als eigenen Teil der App (im Build `de-*.js` und `en-*.js`, vom Offline-Speicher mit vorgehalten). Die Kategorienamen stehen in den Daten (`builtInCategories` für die Rückfallkarten, Paketdateien für den Rest), die Übersetzungsschlüssel `tabooSetup.category.*` sind entfallen. Im Setup erscheinen die drei Kategorien der Rückfallkarten immer, die übrigen Kategorien des Pakets erst, wenn sie Karten haben; im Formular „Karte hinzufügen“ sind alle zehn wählbar. Status: done
- **PH-15-03:** Erzeugungsskript am PC, fortsetzbar, mit Prüfregeln und Ablehnungsliste. **Ergebnis:** `pnpm pool:generate` (`scripts/generate-card-pool.mjs`, Entwicklerwerkzeug, nicht Teil von App und Build) fragt Ollama oder LM Studio je Kategorie und Schwierigkeit in Portionen, prüft jede Karte streng und schreibt ein Arbeitspaket `work/pool-<Sprache>.json` im Format der ausgelieferten Pakete plus eine Ablehnungsliste `work/pool-<Sprache>.rejected.jsonl`. Es lässt sich abbrechen und fortsetzen, vermeidet schon vorhandene Begriffe und bricht Zellen ohne Fortschritt nach einigen leeren Anfragen ab. Die Regeln liegen getestet im Business-Code (`poolGeneration.ts`). Bei LM Studio wird nur ein bereits geladenes Chat-Modell genommen (sonst `--model` angeben), um kein großes Modell ungewollt zu laden. Geprüft mit einer nachgebildeten Ollama-Schnittstelle, nicht mit einer echten KI. Status: done
- **PH-15-04:** Prüfwerkzeug und Regelliste. **Ergebnis:** `scripts/review-card-pool.mjs` mit drei Schritten auf den Arbeitsdateien in `work/`: (1) `judge`: zweiter KI-Durchgang, Punkte 1 bis 5 und ein kurzer Problemtext je Karte (`pool-<Sprache>.verdicts.json`, fortsetzbar, nicht auswertbare Antworten bleiben ungeprüft); (2) `sheet`: Prüfseite `pool-<Sprache>.review.html` mit allen zweifelhaften und ungeprüften Karten plus einer Stichprobe der guten je Kategorie und Schwierigkeit, Kästchen zum Abwählen, Kategorienfilter und Kopieren der Kennungen in `pool-<Sprache>.drops.txt`; (3) `merge`: übernimmt geprüfte, ausreichend bewertete (Standard ab 4) und nicht abgewählte Karten in `src/data/pool/<Sprache>.json`, sortiert, nur wenn das Ergebnis ein gültiges Paket ist; mit `--dry-run` nur Vorschau. Die gemeinsamen Teile (Anbieter, Dateien) liegen in `scripts/lib/pool-tools.mjs`, die Regeln getestet in `poolReview.ts`. Die Regelliste für die KI steht im Auftrag (`poolGeneration.ts`, `poolReview.ts`). Geprüft mit einer nachgebildeten Ollama-Schnittstelle (Lauf, Wiederaufnahme, Prüfseite im Browser, Übernahme, wiederholte Übernahme), nicht mit einer echten KI. Status: done
- **PH-15-05:** Pool in Etappen erzeugen und einbauen, zuerst eine Kategorie als Probelauf. **Stand:** Der Probelauf mit dem lokalen Modell `qwen/qwen3.6-27b` (LM Studio) scheiterte zuerst am Zeitlimit von Node (behoben, siehe Changelog) und wurde dann abgebrochen, weil der Auftraggeber die Karten lieber direkt von Claude schreiben lässt (bessere Qualität, kein Warten). Dafür gibt es `scripts/import-card-batch.mjs`: Eine Stapeldatei durchläuft dieselben strengen Regeln (kein Wort enthält den Begriff, keine Dubletten gegen die eingebauten Karten und den Pool) und geht ins Arbeitspaket `work/pool-<Sprache>.json`; mit `--score` bekommen die Karten ein Urteil, damit die Prüfseite nur eine Stichprobe zeigt. Bisher geschrieben (je Sprache etwa 52 Karten je Kategorie): Essen und Trinken, Tiere, Sport und Freizeit, Berufe, Orte und Reisen, Film/Musik/Medien, Technik; zuletzt auch Alltag, Natur und Kultur; Stand Deutsch 523, Englisch 521 Karten im Arbeitspaket (alle zehn Kategorien). **Übernommen (Auftraggeber: „alles übernehmen“, 2026-11-12):** Mit `review-card-pool merge` stehen jetzt Deutsch 523 und Englisch 521 Karten in `src/data/pool/de.json` und `en.json` (17 bis 19 je Kategorie und Schwierigkeit, zusätzlich zu den 45 eingebauten Karten). Der Build enthält sie als `de-*.js` (74 kB, gepackt 15 kB) und `en-*.js` (72 kB, gepackt 15 kB); der Hauptteil blieb gleich groß. Im Setup erscheinen alle zehn Kategorien, eine Partie nur mit „Technik“ zeigte eine Karte aus dem Pool. Hinweis: Die Karten stammen von Claude ohne unabhängigen Prüfdurchgang und ohne Durchsicht durch den Auftraggeber; ein Streichen einzelner Karten geht über die Abwahlliste und einen weiteren Lauf von `merge` oder direkt in den Paketdateien. Status: done
- **PH-15-06:** Optional: gespielte Karten merken. Status: planned

### Phase 16 – PC-Layout für alle Spiele

Anforderung des Auftraggebers (2026-11-12): **Jedes Spiel bekommt ein Handy-Layout und ein PC-Layout**, damit man auch am PC spielen kann. Bisher gibt es nur das Handy-Layout (eine schmale Spalte, Bedienung unten, Prüfung über `e2e/mobile-layout.spec.ts`). Der Leitfaden für neue Spiele (`docs/GAMEHUB_NEW_GAME_GUIDE.md`) und die Bausteine im `game-kit` sollen beide Größen berücksichtigen. Noch nicht begonnen; Reihenfolge und Zeitpunkt gegenüber den anderen Aufgaben legt der Auftraggeber fest.

- **PH-16-01:** Anforderungen und Entwurf: Breakpoints, Aufteilung (zum Beispiel Einstellungen neben dem Spielbereich), was am PC anders ist (Tastatur, Maus), Bausteine im `game-kit`. Status: planned
- **PH-16-02:** PC-Layout für Tabu mit Layoutprüfung im Desktop-Format neben der Handy-Prüfung. Status: planned

### Phase 17 – Gemeinsame Bausteine für Teams, Spieler und Spieleinstellungen

Anregung des Auftraggebers (2026-11-12): Teams, Spieler und Spieleinstellungen werden in jedem Spiel gebraucht und sollen daher einmal gebaut und von allen Spielen verwendet werden, als wiederverwendbare Ansicht. Bisher liegen Teamanzahl, Teamnamen, Reihenfolge, Spielerliste und die Aufteilung auf Teams in `TabooSetupForm` und `TabooPlayers`; die reine Logik (`shuffleTeams`, `parsePlayers`, `splitIntoTeams`) ist schon in `src/business/shared/`. **Der Entwurf ist vom Auftraggeber freigegeben (`ADR-020`).**

Vorschlag für den Aufbau:

- **Eine Setup-Hülle im `game-kit`** mit den festen Abschnitten „Teams und Spieler“ und „Spieleinstellungen“, der Leiste oben rechts (Regeln und weitere Knöpfe des Spiels) und der Startleiste unten. Das Spiel liefert nur seine Einstellungen (mit `ChoiceGroup`, `InfoButton`) und seine Regeln.
- **Ein Baustein „Teams und Spieler“** (Teamanzahl mit spielabhängigem Bereich, Namen, Reihenfolge zufällig oder wie eingegeben, optional Spielerliste mit Verteilung). Er liefert eine einheitliche Beschreibung der Teams (Kennung, Name, Spieler) an das Spiel; die Zufallsverteilung bleibt reine Logik in `business/shared`.
- **Texte** in einer gemeinsamen Übersetzungsdatei statt je Spiel; Stile im `game-kit` statt in `taboo.css`.
- **Handy- und PC-Layout** von Anfang an mitdenken (Phase 16), weil dieser Baustein in jedem Spiel erscheint.
- **Merken zwischen Spielen (optional):** zuletzt benutzte Teams und Spieler lokal speichern, damit man sie in jedem Spiel wiederfindet (eigene Ablage in IndexedDB).

- **PH-17-01:** Entwurf mit dem Auftraggeber abstimmen (Umfang, Spielerzahl-Grenzen, was ein Spiel einstellen darf). **Stand:** Entwurf liegt in `docs/GAMEHUB_SETUP_KIT.md` (Bausteine `SetupScreen`, `SetupSection`, `TeamsSetup`, optional `PlayersSetup`, reine Logik `buildTeams` und `TeamRules`, Texte in `kit.ts`, Stile im `game-kit`, verhaltensgleicher Umbau von Tabu in vier Schritten); drei Entscheidungen getroffen (gesteuerte Teams mit Spielern, `PlayersSetup` gleich mit, Merken später), zwei als Vorgabe angenommen. Status: done
- **PH-17-02:** Umsetzung im `game-kit`, Tabu zieht um, Tests in beiden Sprachen, Leitfaden für neue Spiele ergänzen. **Ergebnis:** Reine Logik `src/business/shared/teamSetup.ts` (`buildTeams`, `TeamRules`, `validateTeamSetup`, `initialTeamSetup`, `clampTeamCount`); Bausteine `SetupScreen`, `SetupSection`, `TeamsSetup` und `PlayersSetup` im `game-kit` (`ChoiceGroup` hat dafür einen gesteuerten Modus mit `value` und `onChange`); gemeinsame Texte `kit.ts`, gemeinsame Stile `kit-setup.css` (aus `taboo.css`, die Klassen heißen jetzt `kit-*`). Tabu nutzt sie: `TabooSetupForm` besteht aus `SetupScreen` mit den Abschnitten; `TabooSetup` hält einen `TeamSetupValue` und baut die Teams mit `buildTeams`; `TabooPlayers` und die Tabu-Texte und -Stile für Teams sind entfallen. Die Spieler eines Teams kommen jetzt im Spielzustand an (`Team.players`, bleibt weg, wenn leer), die Übersicht zeigt sie noch nicht. Verhalten und zugängliche Namen sind unverändert; eine kleine Verbesserung: Die Teamliste der Spieler zeigt die eingetragenen Teamnamen statt „Team N“. Status: done
- **PH-17-03:** Spieler und Teams merken. **Ergebnis:** Port `TeamSetupMemory` mit reiner Prüfung gespeicherter Daten (`savedTeamSetup.ts`: `parseSavedTeamSetup`, `hasTeamSetupContent`, `sameTeamSetup`), Adapter im lokalen Browserspeicher (`localStorageTeamSetupMemory.ts`), Kontext `TeamSetupMemoryProvider` und `useTeamSetupMemory` im `game-kit`, in `AppRoot` und `main.tsx` verdrahtet. `TeamsSetup` und `PlayersSetup` bieten „Letzte Gruppe laden“ beziehungsweise „Letzte Spieler laden“ an, wenn eine Gruppe gemerkt ist und sich vom aktuellen Stand unterscheidet; Tabu merkt die Gruppe beim Start (nur wenn mindestens ein Teamname oder Spieler eingetragen ist). Die Gruppe gilt für alle Spiele. Speicher bewusst `localStorage` statt IndexedDB (siehe `docs/GAMEHUB_SETUP_KIT.md`, 4.5). Status: done
- **PH-17-04:** Optional: eigene Adressen für Unterseiten (zum Beispiel `#/games/taboo/cards`), damit die Zurück-Taste des Browsers und das Neuladen dort wirken. Bisher hat jedes Spiel genau eine Adresse (`#/games/taboo`); alle Ansichten darin sind Zustand der Seite, keine Adressen. Das ist bewusst so (statisches Hosting mit Adresse nach dem `#`, keine Serverrouten nötig), ist aber nicht auf `localhost` beschränkt. Status: planned
- **PH-17-05:** Feste Ansichten und Oberflächenregeln aus `ADR-021` umsetzen. **Ergebnis:** `ActionRow`, `ScoreScreen` (Zwischen- und Endstand) und `ManageScreen` im `game-kit`; `SetupScreen` ist das Hauptmenü mit den Plätzen `rules` und `editor`; die Stile liegen in `kit-setup.css`; Tabu ist verhaltensgleich umgestellt, „Abbrechen“ ist rot. Regeln: `docs/GAMEHUB_UI_RULES.md`. Das eigentliche Spiel und die Auswertung bleiben bis zum zweiten Spiel Tabu-eigen. Status: done
- **PH-17-08:** Spielergruppen (Wunsch des Auftraggebers vom 2026-11-13, noch nicht geplant im Detail): In der Spielerverwaltung lassen sich **Gruppen** anlegen (zum Beispiel mehrere Freundesgruppen), damit man Namen schneller findet und eine Gruppe als Ganzes in die Aufstellung übernehmen kann. Offene Fragen vor dem Bau: Darf ein Spieler in mehreren Gruppen sein? Wie wählt man in der Aufstellung (Gruppe wählen, dann Anwesende abhaken)? Wie sieht die Gruppenauswahl im Fenster aus (Knopfgruppe oder Liste)? Status: planned
- **PH-17-07:** Aufstellung nach dem Start (Entscheidung des Auftraggebers vom 2026-11-13, `ADR-023`). **Ergebnis:** Das Hauptmenü hat kein Feld „Teams und Spieler“ mehr. „Starten“ liest die Einstellungen einmal (`readTabooSettings`) und öffnet die neue Ansicht **Aufstellung** (`LineupScreen` im `game-kit`, mit `TeamsSetup` und offener Spielerliste, Auswahl aus der Spielerliste, Zuweisung von Hand oder zufällig). „Spiel starten“ (fest unten) bereitet die Karten vor, prüft die Kartenmenge mit der nun bekannten Teamzahl und startet das Spiel; Meldungen erscheinen in der Aufstellung, ein Teamwechsel während der Kartenvorbereitung bricht sie ab. Kopfleiste: Zurück ins Hauptmenü. „Mit gleicher Konfiguration neu spielen“ führt zurück in die Aufstellung (Teams vorbelegt, die Karten des vorigen Spiels werden wiederverwendet, wenn sie reichen); im Endstand wird nichts gelost. Status: done
- **PH-17-06:** Spielerverwaltung (Entscheidung des Auftraggebers vom 2026-11-12, `ADR-022`): ein Fenster „Spieler“, aufrufbar aus dem GameHub (Spielauswahl) und aus dem Hauptmenü jedes Spiels (Knopf neben Spielregeln und Editor). Dort lassen sich Spieler hinzufügen und löschen; sie bleiben dauerhaft gespeichert (lokaler Browserspeicher). In jedem Spiel wählt ein Knopf „Aus Spielerliste wählen“ in „Teams und Spieler“, wer heute mitspielt; danach wird wie bisher zufällig oder von Hand auf Teams verteilt. „Letzte Gruppe laden“ aus `PH-17-03` bleibt zusätzlich. **Ergebnis:** Reine Logik `src/business/shared/playerRoster.ts` (`addPlayer`, `removePlayer`, `parseSavedRoster`, `applyRosterSelection`, `rosterPlayersIn`; Namen bis 24 Zeichen, höchstens 100 Spieler, keine doppelten Namen, ohne Komma und Semikolon), Port `PlayerRosterStore` mit Adapter `localStoragePlayerRosterStore.ts` (Schlüssel `gamehub.players`), `PlayerRosterProvider` und `usePlayerRoster` im `game-kit`, `PlayerRosterButton` (Knopf „Spieler“ mit Fenster) in der Werkzeugleiste jedes Hauptmenüs (automatisch über `SetupScreen`) und auf der Spielauswahl, `RosterPicker` („Aus Spielerliste wählen“) in `TeamsSetup` und `PlayersSetup`. Die Werkzeugleiste ist jetzt eine Reihe mit gleich breiten Knöpfen. Zusätzlich behoben: `Dialog` setzte den Fokus bei jedem Rendern zurück auf den Schließen-Knopf, Tippen in einem Fenster war dadurch unmöglich. Status: done

### Phase 9: Spätere Erweiterungen

#### Tabu-Spielmodi für später

- **Race:** Pro Team wird eine Zielzahl gelöster Karten festgelegt, zum Beispiel zehn. Jedes Team darf höchstens einmal überspringen. Es gewinnt das Team, das die Zielzahl in der kürzesten eigenen Spielzeit erreicht. Zwei Abläufe sind vorgesehen: Jedes Team spielt seinen Lauf am Stück, oder die Teams wechseln sich nach jeder Karte ab. Beim Wechsel zählt für jedes Team nur seine aktive Zeit.
- **Countdown-Duell:** Jedes Team hat ein eigenes Zeitkonto. Es läuft jeweils nur die Uhr des aktiven Teams, während geraten wird. Sobald der Begriff erraten wurde, pausiert diese Uhr und die des nächsten Teams läuft weiter. Wer zuerst keine Zeit mehr hat, verliert.
- **Vor der Umsetzung klären:** Wer erklärt und wer rät im Countdown-Duell? Zählt Überspringen dort ebenfalls als erlaubter Wechsel und ist es auf einmal pro Team begrenzt? Im Race ist zu klären, ob eine übersprungene Karte ersetzt oder später erneut gespielt wird und wie Gleichstände behandelt werden.

#### PH-09-01 – Multiplayer-Discovery und ADR

- **Ziel:** Online-Multiplayer fachlich und technisch entscheiden.
- **Umfang:** Autoritätsmodell, Lobby, Synchronisierung, Datenschutz, Hosting und Konfliktbehandlung analysieren.
- **Akzeptanzkriterien:** Genehmigtes ADR und abgegrenzter Folgeplan liegen vor. Keine Implementierung ohne Freigabe.
- **Tests:** Review der Ereignismodelle und Prototyp nur nach gesonderter Beauftragung.
- **Status:** planned

#### PH-09-02 – Spielmodulvertrag überprüfen und erweitern

- **Ziel:** Den frühen Spielmodulvertrag anhand weiterer Spielanforderungen kontrolliert weiterentwickeln.
- **Umfang:** Erfahrungen aus Tabu und den Spezifikationen weiterer Spiele auswerten und den bestehenden Vertrag nur bei nachgewiesenem Bedarf um Start- oder Persistenzschnittstellen ergänzen.
- **Akzeptanzkriterien:** Der erweiterte Vertrag bleibt genreunabhängig, rückwärtskompatibel und ist durch Tabu sowie ein zweites Testmodul belegt.
- **Tests:** Contract-Tests und Architekturprüfung.
- **Status:** planned

### Phase 19 – Imposter

Eigenständiges lokales Spiel für mindestens drei Personen. Die vereinbarten Regeln stehen in [GAMEHUB_IMPOSTER.md](GAMEHUB_IMPOSTER.md).

- `PH-19-01` – Spielzustände, zufällige Rollen und Hinweisrunden mit optionaler dritter Runde (geplant)
- `PH-19-02` – Verdeckte Rollenanzeige mit Hochziehen, Loslassen und Weiterreichen (geplant)
- `PH-19-03` – Offene und geheime Abstimmung, Stichwahl und Auflösung (geplant)
- `PH-19-04` – Begriffe mit optionalem Hilfswort für Deutsch und Englisch (geplant)
- `PH-19-05` – Mobile Einrichtung, Spielmenü und Prüfung der vollständigen Spielabläufe (geplant)

## 6. Abhängigkeiten und Reihenfolge

- Phase 1 ist Voraussetzung für alle Implementierungsphasen.
- Phase 2 beginnt vor sichtbaren Benutzerfunktionen, damit keine fest codierten Texte entstehen.
- Phase 4 kann nach Phase 1 parallel zur gemeinsamen UI entwickelt werden, bleibt aber vollständig UI-unabhängig.
- Phase 5 benötigt die Kernlogik aus Phase 4 und das Designsystem aus Phase 3.
- Phase 6 macht den lokalen Modus dauerhaft und offline nutzbar.
- Phase 7 beginnt erst nach stabiler lokaler Kartenverwaltung. Sie ist für die Spielbarkeit nicht erforderlich.
- Phase 8 schließt den ersten Release ab.
- Phase 10 verfeinert Bedienung und Spielablauf des abgenommenen Tabu-Releases.
- Phase 11 prüft Qualität und Struktur von Tabu; `PH-11-05` (wiederverwendbare Spielbausteine) bereitet `PH-09-02` vor.
- Phase 12 erweitert Tabu um Regeln, Spieler, Karten und Spielmodi.
- Phase 9 (Multiplayer und weitere Spiele) folgt nach Phase 12 und bleibt bis zu separaten Freigaben außerhalb des bisherigen Produktumfangs. Die Phasennummer bleibt aus Gründen stabiler IDs bestehen.

## 7. Risiken und Gegenmaßnahmen

| Risiko | Auswirkung | Gegenmaßnahme |
|---|---|---|
| Paketmanager fehlt | Projektinitialisierung blockiert | Vor `PH-01-01` npm/Corepack-Verfügbarkeit herstellen und Version fixieren |
| Service-Worker-Updates | Veraltete oder inkonsistente Assets | Versionierte Caches, atomarer Aktivierungsfluss, Produktions-E2E |
| IndexedDB-Migration | Verlust lokaler Karten/Einstellungen | Versionierte Migrationen, Transaktionen, Altbestand-Fixtures |
| Zufällige Deckreihenfolge | Flaky Tests | Zufallsquelle injizieren und in Tests deterministisch ersetzen |
| Übersetzungsdrift | Unvollständige UI | Schlüsselparität als Pflichtprüfung in CI |
| KI-Antworten unzuverlässig | Ungültige oder doppelte Karten | Providerunabhängige Validierung vor atomarer Speicherung |
| GitHub-Pages-Pfade | Produktionsseite lädt nicht | Base-Pfad und direkte Navigation im Produktions-Build prüfen |

## 8. Aktueller Freigabepunkt

Die Projektvorbereitung ist abgeschlossen. Die eigentliche Implementierung beginnt erst nach ausdrücklicher Freigabe mit `PH-01-01`.
