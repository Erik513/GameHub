# GameHub Projektplan

## 1. Ziel und Umfang

GameHub wird eine kostenlose, international ausgerichtete, mobile-first Spiele-PWA für Partyspiele, Quiz-, Karten- und weitere Gesellschaftsspiele. Die erste lieferbare Spielfunktion ist Tabu im lokalen Modus. Die Anwendung bleibt ohne Internet und ohne KI-Anbieter vollständig spielbar. Architekturgrenzen bereiten weitere Spielarten und späteren Online-Multiplayer vor, ohne diese Funktionen im ersten Produktumfang zu implementieren.

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
- **Status:** planned

### Phase 5: Tabu-Benutzeroberfläche

#### PH-05-01 – Spielkonfiguration

- **Ziel:** Lokale Partie vollständig einrichten.
- **Umfang:** Teams, Rundenzahl, Rundendauer, Kategorien, Schwierigkeit und Kartensprache erfassen.
- **Akzeptanzkriterien:** Mindestens zwei eindeutige Teamnamen sind erforderlich. Fehler sind lokalisiert. Gültiges Setup startet die Zustandsmaschine.
- **Tests:** Formvalidierung und Start in Deutsch/Englisch.
- **Status:** planned

#### PH-05-02 – Laufende Runde und Timer

- **Ziel:** Aktive Runde touchfreundlich bedienen.
- **Umfang:** Zielbegriff, drei verbotene Wörter, Team, Zeit, Punktestand sowie drei Kartenaktionen anzeigen.
- **Akzeptanzkriterien:** 60 Sekunden sind Standard. Ablauf beendet die Runde genau einmal. Bedienelemente sind auf kleinen Displays nutzbar.
- **Tests:** Fake-Timer, Aktionen, Ablauf und Accessibility.
- **Status:** planned

#### PH-05-03 – Rundenende

- **Ziel:** Ergebnis prüfen und kontrolliert fortsetzen.
- **Umfang:** Rundenzusammenfassung, Punktestand und nächstes Team anzeigen.
- **Akzeptanzkriterien:** Angezeigte Werte entsprechen Business-Zustand. Start der nächsten Runde erfolgt nur durch Nutzeraktion.
- **Tests:** Mehrere Ergebnisvarianten und Teamwechsel.
- **Status:** planned

#### PH-05-04 – Spielende und Neustart

- **Ziel:** Gewinner verständlich darstellen und neue Partie ermöglichen.
- **Umfang:** Endstand, Einzel-/Gleichstandsieger, Neustart mit gleicher oder neuer Konfiguration.
- **Akzeptanzkriterien:** Sieger sind korrekt lokalisiert. Neustart übernimmt nur ausdrücklich vorgesehene Einstellungen und setzt Partie-Daten zurück.
- **Tests:** Sieg, Gleichstand und beide Neustartwege.
- **Status:** planned

### Phase 6: Speicherung, Kartensätze und Offlinebetrieb

#### PH-06-01 – IndexedDB-Schema und Repository-Adapter

- **Ziel:** Einstellungen und Karten robust lokal speichern.
- **Umfang:** Versioniertes Schema, Adapter für Business-Ports, Transaktions- und Fehlerbehandlung.
- **Akzeptanzkriterien:** Lesen/Schreiben funktioniert nach Reload. Partielle Fehler hinterlassen konsistenten Zustand.
- **Tests:** Integrationsfälle mit Test-IndexedDB, Transaktionsfehler und Migration.
- **Status:** planned

#### PH-06-02 – Lokale deutsche und englische Kartensätze

- **Ziel:** Offline spielbare Grundausstattung liefern.
- **Umfang:** Kuratierte Kartendateien mit Sprache, Kategorie, Schwierigkeit, Ziel und exakt drei verbotenen Wörtern.
- **Akzeptanzkriterien:** Beide Sprachen besitzen ausreichende Karten für Standardpartien. Alle Dateien bestehen Schema- und Duplikatprüfung.
- **Tests:** Datensatzvalidierung, Eindeutigkeit und Mindestmengen.
- **Status:** planned

#### PH-06-03 – Import und Aktualisierung lokaler Karten

- **Ziel:** Mitgelieferte Sätze idempotent in lokale Speicherung übernehmen.
- **Umfang:** Versionierung, Seed-Prozess und Update ohne Verlust nutzergenerierter Karten.
- **Akzeptanzkriterien:** Wiederholter Start erzeugt keine Duplikate. Neue Seed-Versionen ergänzen oder migrieren kontrolliert.
- **Tests:** Erstimport, Wiederholung, Upgrade und bestehende Nutzerdaten.
- **Status:** planned

#### PH-06-04 – Manifest und Service Worker

- **Ziel:** Installierbare Offline-PWA bereitstellen.
- **Umfang:** Manifest, Icons, Cache-Strategien, Offline-App-Shell und Update-Fluss.
- **Akzeptanzkriterien:** PWA-Audit erkennt Installierbarkeit. Nach einem Online-Erstaufruf startet eine lokale Partie offline.
- **Tests:** Build-Prüfung, Manifesttest und Playwright-Offline-Szenario.
- **Status:** planned

### Phase 7: KI-Kartengenerierung

#### PH-07-01 – Generierungsport und neutrales Datenmodell

- **Ziel:** Anbieterunabhängigen Vertrag definieren.
- **Umfang:** Anfrage, Ergebnis, Fehler, Abbruch und Provider-Fähigkeiten als Business-Typen modellieren.
- **Akzeptanzkriterien:** Business enthält keine Anbieter- oder Transporttypen. Fake-Provider lässt sich injizieren.
- **Tests:** Contract-Tests mit Fake-Provider und Fehlerfällen.
- **Status:** planned

#### PH-07-02 – Validierungs-, Normalisierungs- und Duplikatpipeline

- **Ziel:** Nur gültige neue Karten übernehmen.
- **Umfang:** Schema, exakt drei Verbotswörter, Sprache, Normalisierung, bestehende und batchinterne Duplikate prüfen.
- **Akzeptanzkriterien:** Ungültige Karten werden mit Gründen abgelehnt. Gültige Karten werden atomar gespeichert.
- **Tests:** Grenzfälle, Unicode, Groß-/Kleinschreibung, partielle Provider-Antworten und Transaktionsfehler.
- **Status:** planned

#### PH-07-03 – Lokaler Generatoradapter

- **Ziel:** Provider-Vertrag ohne externen Dienst nutzbar machen.
- **Umfang:** Adapter auf kuratierte lokale Kandidaten und deterministische Testdaten.
- **Akzeptanzkriterien:** Funktioniert offline und erfüllt denselben Vertrag wie spätere Provider.
- **Tests:** Provider-Contract und Offline-Integration.
- **Status:** planned

#### PH-07-04 – Ollama-Adapter

- **Ziel:** Optionale lokale Modellerzeugung ermöglichen.
- **Umfang:** HTTP-Adapter, Zeitüberschreitung, Abbruch, Antwortmapping und verständliche Verfügbarkeitsfehler.
- **Akzeptanzkriterien:** App bleibt ohne Ollama vollständig nutzbar. Keine Providerdetails gelangen in Business. Fehler blockieren bestehende Karten nicht.
- **Tests:** Gemockte Antworten, Timeout, Abbruch, fehlerhaftes JSON und Validierungspipeline.
- **Status:** planned

#### PH-07-05 – Generierungsoberfläche und lokale Speicherung

- **Ziel:** Nutzer können Karten kontrolliert erzeugen und übernehmen.
- **Umfang:** Providerwahl, Parameter, Vorschau, Validierungsfehler, Auswahl und Speicherung.
- **Akzeptanzkriterien:** Speicherung erfolgt erst nach Bestätigung. UI ist deutsch/englisch und ohne Provider verständlich deaktiviert.
- **Tests:** Komponenten- und Integrationsabläufe in beiden Sprachen.
- **Status:** planned

### Phase 8: Veröffentlichung, E2E-Tests und Qualitätssicherung

#### PH-08-01 – Kritische E2E-Spielabläufe

- **Ziel:** Tabu end-to-end absichern.
- **Umfang:** Setup, komplette Partie, Wertung, Gleichstand, Sprachwechsel, Reload und mobile Ansicht.
- **Akzeptanzkriterien:** Kritische Abläufe laufen deterministisch in unterstützten Zielprofilen und beiden Sprachen.
- **Tests:** Playwright-Suite.
- **Status:** planned

#### PH-08-02 – Offline- und PWA-E2E

- **Ziel:** Offlineversprechen real prüfen.
- **Umfang:** Installation/Audit, Cache-Aufbau, Netztrennung, App-Neustart und lokale Partie.
- **Akzeptanzkriterien:** Mitgelieferte Karten und Kernspiel funktionieren nach Netztrennung. Updatefehler zerstören keinen spielbaren Cache.
- **Tests:** Playwright mit Offline-Kontext und Produktions-Build.
- **Status:** planned

#### PH-08-03 – GitHub-Pages-Build und Deployment

- **Ziel:** Reproduzierbare kostenlose Veröffentlichung schaffen.
- **Umfang:** Base-Pfad, statisches Routing, Pages-Workflow, Umgebungs- und Berechtigungsgrenzen.
- **Akzeptanzkriterien:** Deployment-URL lädt Assets und direkte unterstützte Routen korrekt. Workflow veröffentlicht nur nach erfolgreichen Pflichtprüfungen.
- **Tests:** Produktions-Build, Link-/Asset-Smoke-Test und Deployment-Workflow.
- **Status:** planned

#### PH-08-04 – Qualitäts- und Barrierefreiheitsabnahme

- **Ziel:** Release-Kriterien vollständig prüfen.
- **Umfang:** Coverage, Lint, Typen, Tests, Browserprofile, Tastatur, Kontraste, lokalisierte Inhalte und dokumentierte Restrisiken.
- **Akzeptanzkriterien:** Alle Grenzwerte und Pflichtprüfungen bestehen. Offene Probleme sind priorisiert und Release-Entscheidung dokumentiert.
- **Tests:** Vollständige CI-Pipeline und manuelle Abnahmecheckliste.
- **Status:** planned

### Phase 9: Spätere Erweiterungen

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

#### PH-09-03 – Scharade

- **Ziel:** Zweites Spiel nach eigener Spezifikation ergänzen.
- **Umfang:** Anforderungen, Business-Logik, UI, Karten und Tests als separates Modul.
- **Akzeptanzkriterien:** Werden vor Implementierungsstart mit dem Auftraggeber konkretisiert.
- **Tests:** Unit-, Komponenten- und E2E-Tests gemäß genehmigter Spezifikation.
- **Status:** planned

#### PH-09-04 – Wer bin ich und Quiz

- **Ziel:** Weitere geplante Spiele schrittweise ergänzen.
- **Umfang:** Je Spiel separate Spezifikation, Logik, UI, Daten und Qualitätssicherung.
- **Akzeptanzkriterien:** Jeweils vor Implementierungsstart zu genehmigen.
- **Tests:** Je Spiel anhand der genehmigten Regeln.
- **Status:** planned

## 6. Abhängigkeiten und Reihenfolge

- Phase 1 ist Voraussetzung für alle Implementierungsphasen.
- Phase 2 beginnt vor sichtbaren Benutzerfunktionen, damit keine fest codierten Texte entstehen.
- Phase 4 kann nach Phase 1 parallel zur gemeinsamen UI entwickelt werden, bleibt aber vollständig UI-unabhängig.
- Phase 5 benötigt die Kernlogik aus Phase 4 und das Designsystem aus Phase 3.
- Phase 6 macht den lokalen Modus dauerhaft und offline nutzbar.
- Phase 7 beginnt erst nach stabiler lokaler Kartenverwaltung. Sie ist für die Spielbarkeit nicht erforderlich.
- Phase 8 schließt den ersten Release ab.
- Phase 9 bleibt bis zu separaten Freigaben außerhalb des ersten Produktumfangs.

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
