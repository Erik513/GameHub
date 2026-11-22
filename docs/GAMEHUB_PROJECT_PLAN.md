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

Der geplante Einstieg über **Spieler und Teams** sowie die mögliche Rollen- und Kartenverteilung bei Online-Tabu stehen in [Tabu – Einstieg und mögliche Online-Lobby](GAMEHUB_TABOO_LOBBY.md).

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

Branch-Grenzen werden in `Al-02-04` anhand der Messmöglichkeiten pro Verzeichnis verbindlich konfiguriert. Sie dürfen die Line-Ziele nicht ersetzen.

### 4.3 Definition of Done

Eine Aufgabe ist nur `done`, wenn ihr Umfang vollständig umgesetzt ist, alle Akzeptanzkriterien erfüllt sind, die geforderten Tests erfolgreich liefen und Status sowie Changelog aktualisiert wurden. Fehlende Werkzeuge oder fehlschlagende Pflichtprüfungen führen zu `blocked` oder lassen die Aufgabe `in_progress`.

## 5. Phasen und Aufgaben

**ID-Schema (seit 2026-11-13):** `Kürzel-Phase-Aufgabe`, zum Beispiel `Ta-06-07`. Die Kürzel trennen allgemeine Aufgaben von denen der einzelnen Spiele: **Al** = allgemein (alle Spiele), **Ta** = Tabu, **Wb** = Wortbombe, **Im** = Imposter. Jedes neue Spiel bekommt ein eigenes Kürzel. Die Phasennummer zählt je Kürzel ab 01; Teilaufgaben haben einen Buchstaben (`Ta-06-07-B`). Die früheren IDs `PH-…` gibt es nicht mehr.

### Phase Al-01: Projektvorbereitung

#### Al-01-01 – Umgebung prüfen

- **Ziel:** Ausgangslage reproduzierbar erfassen.
- **Umfang:** Workspace, Git-Status sowie Versionen von Node.js, Paketmanager und Git prüfen.
- **Akzeptanzkriterien:** Befunde sind in README, Status und Changelog dokumentiert. Fehlende Voraussetzungen sind als Problem erfasst.
- **Tests:** Manuelle Konsistenzprüfung der dokumentierten Befunde.
- **Status:** done

#### Al-01-02 – Dokumentationsstruktur anlegen

- **Ziel:** Geforderte Projektdokumente bereitstellen.
- **Umfang:** `docs` mit Plan, Dashboard, Status, Changelog und Entscheidungen sowie README und AGENTS anlegen.
- **Akzeptanzkriterien:** Alle geforderten Dateien existieren und sind miteinander verlinkt.
- **Tests:** Dateiexistenz- und Linkzielprüfung.
- **Status:** done

#### Al-01-03 – Projektplan erstellen

- **Ziel:** Umsetzung in unabhängig prüfbare Aufgaben zerlegen.
- **Umfang:** Anforderungen, Architektur, Phasen, Aufgaben, Tests, Akzeptanzkriterien und Risiken dokumentieren.
- **Akzeptanzkriterien:** Alle neun geforderten Phasen sind abgedeckt. Jede Aufgabe hat ID, Ziel, Umfang, Akzeptanzkriterien, Tests und Status.
- **Tests:** Automatischer ID-Abgleich mit Statusdatei und manuelle Anforderungsmatrix.
- **Status:** done

#### Al-01-04 – Statusverwaltung erstellen

- **Ziel:** Maschinenlesbaren, faktenbasierten Fortschritt bereitstellen.
- **Umfang:** JSON-Schema inhaltlich umsetzen, stabile IDs, Statuswerte, Prüfergebnisse, Probleme und Empfehlungen pflegen.
- **Akzeptanzkriterien:** JSON ist valide. Fortschritt entspricht `done / alle Aufgaben` und wird nicht geschätzt.
- **Tests:** JSON-Parsing und rechnerischer Fortschrittsabgleich.
- **Status:** done

#### Al-01-05 – Entwicklungs-Dashboard erstellen

- **Ziel:** Projektstatus im Browser verständlich darstellen.
- **Umfang:** Responsive statische HTML-Seite mit Phasen, Aufgaben, Tests, Änderungen, Problemen und nächsten Schritten.
- **Akzeptanzkriterien:** Dashboard lädt Status-JSON, berechnet Fortschritt aus Aufgaben und aktualisiert alle 20 Sekunden. Fehler werden sichtbar dargestellt.
- **Tests:** Statische Prüfung sowie manueller Browser-Smoke-Test nach Verfügbarkeit eines lokalen HTTP-Servers.
- **Status:** done

#### Al-01-06 – Arbeitsregeln und Entscheidungen dokumentieren

- **Ziel:** Verbindliche Leitplanken für Agenten und Architektur schaffen.
- **Umfang:** AGENTS-Regeln und ADRs für Stack, Schichten, Spiele, Zustand, i18n, Persistenz, PWA, Provider und Tests.
- **Akzeptanzkriterien:** Alle verbindlichen Regeln des Auftrags sind enthalten. Grundentscheidungen besitzen Status und Begründung.
- **Tests:** Manuelle Vollständigkeitsprüfung gegen den Auftrag.
- **Status:** done

#### Al-01-07 – Dokumente auf Konsistenz prüfen

- **Ziel:** Widersprüche und ungültige Referenzen vermeiden.
- **Umfang:** JSON, IDs, Status, Fortschritt, Dateireferenzen und Abgrenzung zum Implementierungsumfang prüfen.
- **Akzeptanzkriterien:** Automatische Prüfungen laufen erfolgreich. Keine Spielfunktion, KI-Anbindung oder Multiplayer-Implementierung wurde angelegt.
- **Tests:** PowerShell-basierter Konsistenzcheck und Quellbaumprüfung.
- **Status:** done

### Phase Al-02: Projektfundament, Entwicklungswerkzeuge und Testinfrastruktur

#### Al-02-01 – Vite-Grundprojekt und Schichtenstruktur

- **Ziel:** Startfähiges React-TypeScript-Projekt schaffen.
- **Umfang:** Vite initialisieren, Verzeichnisstruktur gemäß Zielarchitektur anlegen, strikte TypeScript-Konfiguration und Composition Root bereitstellen.
- **Akzeptanzkriterien:** Entwicklungsserver und Produktions-Build funktionieren. Business enthält keine äußeren Imports. Eine neutrale Startansicht wird gerendert.
- **Tests:** Build, Typecheck und Architektur-Importtest.
- **Status:** done

#### Al-02-02 – Linting und Formatierung

- **Ziel:** Einheitliche statische Qualität sicherstellen.
- **Umfang:** ESLint, React-/TypeScript-Regeln, Formatprüfung und npm-Skripte konfigurieren.
- **Akzeptanzkriterien:** Neue Beispielquellen bestehen Lint und Formatprüfung. Verstöße liefern einen Fehlercode.
- **Tests:** Positive Ausführung und gezielter Regel-Smoke-Test.
- **Status:** done

#### Al-02-03 – Vitest und Testing Library

- **Ziel:** Unit- und Komponentenprüfungen ausführbar machen.
- **Umfang:** Vitest, DOM-Testumgebung, Testing Library, Setup-Datei und erstes neutrales Beispiel konfigurieren.
- **Akzeptanzkriterien:** Tests laufen lokal deterministisch und im Watch-/CI-Modus. DOM-Cleanup ist aktiv.
- **Tests:** Beispiel-Unit- und Komponenten-Test.
- **Status:** done

#### Al-02-04 – Coverage und Bereichsgrenzen

- **Ziel:** Vereinbarte Coverage messbar und erzwingbar machen.
- **Umfang:** Coverage-Provider, Include-/Exclude-Regeln, Reports und verzeichnisbezogene Line-/Branch-Grenzen konfigurieren.
- **Akzeptanzkriterien:** Bericht weist Business, kritische Logik, Data/Infrastructure und UI getrennt aus. Unterschreitung lässt den Befehl fehlschlagen.
- **Tests:** Kontrollierter Grenzwert-Smoke-Test und erfolgreicher Baseline-Lauf.
- **Status:** done

#### Al-02-05 – Playwright-Grundkonfiguration

- **Ziel:** Browserübergreifende E2E-Tests vorbereiten.
- **Umfang:** Playwright, Webserver-Start, Geräteprofile für Mobil und Desktop sowie Artefakte bei Fehlern konfigurieren.
- **Akzeptanzkriterien:** Ein Smoke-Test läuft mindestens in Chromium für Mobil und Desktop. Screenshots/Traces entstehen bei Fehlern.
- **Tests:** Playwright-Smoke-Test.
- **Status:** done

#### Al-02-06 – GitHub-Actions-Qualitätsworkflow

- **Ziel:** Automatisierte Prüfung jedes Changes ermöglichen.
- **Umfang:** Workflow für Installation, Typecheck, Lint, Tests, Coverage, Build und E2E vorbereiten.
- **Akzeptanzkriterien:** Workflow verwendet festgelegte Runtime und Dependency-Cache. Jeder Pflichtschritt blockiert bei Fehlern.
- **Tests:** Workflow-Syntaxprüfung und erster erfolgreicher Lauf nach Repository-Verknüpfung.
- **Status:** done

### Phase Al-03: Internationalisierung Deutsch/Englisch

#### Al-03-01 – i18n-Grundkonfiguration

- **Ziel:** Deutsch und Englisch zentral bereitstellen.
- **Umfang:** i18next, react-i18next, Namespaces, Fallback und getypte Ressourcenkonvention einrichten.
- **Akzeptanzkriterien:** Startansicht rendert beide Sprachen ohne fest codierte UI-Texte. Fallback ist definiert.
- **Tests:** Initialisierung und Rendering in Deutsch und Englisch.
- **Status:** done

#### Al-03-02 – Erkennung, Auswahl und Persistenz der UI-Sprache

- **Ziel:** Sprache automatisch erkennen und manuell dauerhaft ändern.
- **Umfang:** Browsererkennung, Sprachwahlelement und Speicher-Port mit lokalem Adapter.
- **Akzeptanzkriterien:** Erststart nutzt unterstützte Browsersprache. Auswahl überlebt Reload. Unbekannte Sprache fällt kontrolliert zurück.
- **Tests:** Unit-, Komponenten- und Integrationsfälle für beide Sprachen.
- **Status:** done

#### Al-03-03 – Unabhängige Kartensprache

- **Ziel:** UI- und Spielkartensprache getrennt verwalten.
- **Umfang:** Einstellungsmodell, Auswahl und Persistenz für Kartensprache.
- **Akzeptanzkriterien:** Änderung einer Sprache beeinflusst die andere nicht. Beide Werte überleben Reload.
- **Tests:** Business- und UI-Tests aller Kombinationen Deutsch/Englisch.
- **Status:** done

#### Al-03-04 – Übersetzungsparität prüfen

- **Ziel:** Fehlende Übersetzungen automatisch erkennen.
- **Umfang:** Test oder Skript für identische Schlüsselstrukturen und nichtleere Werte.
- **Akzeptanzkriterien:** Fehlender, zusätzlicher oder leerer Schlüssel lässt die Prüfung fehlschlagen.
- **Tests:** Positive Ressourcenprüfung und negative Fixture-Fälle.
- **Status:** done

### Phase Al-04: Gemeinsame App-Oberfläche und Designsystem

#### Al-04-01 – Design-Tokens und Basiskomponenten

- **Ziel:** Konsistente mobile-first Oberfläche schaffen.
- **Umfang:** Farben, Typografie, Abstände, Fokuszustände, Buttons, Eingaben, Karten und Dialoggrundlage.
- **Akzeptanzkriterien:** Komponenten skalieren von 320 Pixel bis Desktop, unterstützen Tastaturbedienung und ausreichende Kontraste.
- **Tests:** Komponentenverhalten, Fokus, deaktivierte Zustände und visuelle Smoke-Tests.
- **Status:** done

#### Al-04-02 – App-Shell, Spielkatalog und Navigation

- **Ziel:** Gemeinsamen, von einzelnen Spielen unabhängigen Rahmen für Spielauswahl und Einstellungen bereitstellen.
- **Umfang:** Header, Hauptnavigation, responsive Startseite mit verpflichtender Spielauswahl, zentraler Spielkatalog und minimaler Spielmodulvertrag für Kennung, Übersetzungsschlüssel, Route und Verfügbarkeitsstatus.
- **Akzeptanzkriterien:** App-Start zeigt immer die Spielauswahl. Spiele werden ausschließlich über den Katalog eingebunden. Navigation funktioniert per Tastatur und Touch. Unfertige Spiele sind verständlich gekennzeichnet. Shell und Navigation importieren keine Tabu-spezifische Spiellogik.
- **Tests:** Katalog-Vertrag sowie Routing-, Auswahl- und Navigationsintegration in Deutsch und Englisch.
- **Status:** done

#### Al-04-03 – Einstellungen und Statusmeldungen

- **Ziel:** Globale Einstellungen und verständliche Rückmeldungen bereitstellen.
- **Umfang:** Einstellungsseite, Sprachfelder, Fehlermeldungen, Lade- und Leerzustände.
- **Akzeptanzkriterien:** Beschriftungen sind lokalisiert und zugänglich. Fehler werden ohne Datenverlust angezeigt.
- **Tests:** Komponenten- und Accessibility-Tests in beiden Sprachen.
- **Status:** done

### Phase Ta-01: Tabu-Kernlogik

#### Ta-01-01 – Tabu-Domänenmodell und Validierung

- **Ziel:** Gültige Teams, Konfigurationen und Karten fachlich modellieren.
- **Umfang:** Typen/Entitäten für Team, Karte, Kategorie, Schwierigkeit und Spielkonfiguration sowie Validatoren.
- **Akzeptanzkriterien:** Mindestens zwei Teams, positive Dauer/Runden und exakt drei unterschiedliche verbotene Wörter werden erzwungen.
- **Tests:** Grenzwerte, ungültige Eingaben, Normalisierung und sprachbezogene Kartenfälle.
- **Status:** done

#### Ta-01-02 – Zustandsmaschine und Übergänge

- **Ziel:** Spielablauf deterministisch steuern.
- **Umfang:** Zustände `setup`, `roundRunning`, `roundEnded`, `gameEnded` und zulässige Ereignisse implementieren.
- **Akzeptanzkriterien:** Nur gültige Übergänge sind möglich. Aktives Team, Runde und Karte bleiben konsistent.
- **Tests:** Übergangsmatrix, ungültige Ereignisse und vollständige Mehrteam-Partie.
- **Status:** done

#### Ta-01-03 – Kartenaktionen und Punkte

- **Ziel:** Richtig, Überspringen und verbotenes Wort korrekt werten.
- **Umfang:** Fachliche Ereignisse, Kartenvorschub und Punktberechnung.
- **Akzeptanzkriterien:** Nur richtig erhöht genau um eins. Andere Aktionen ergeben null und jede Karte wird höchstens einmal gewertet.
- **Tests:** Alle Aktionen, Wiederholungsversuche und Kartenende.
- **Status:** done

#### Ta-01-04 – Rundenfolge und Siegerermittlung

- **Ziel:** Konfigurierbare Partie korrekt abschließen.
- **Umfang:** Teamrotation, Rundenzählung, Endbedingung, Einzel- und Gleichstandsieger.
- **Akzeptanzkriterien:** Jedes Team erhält die vorgesehenen Runden. Siegerliste ist deterministisch und enthält alle punktgleichen Teams.
- **Tests:** Zwei und mehrere Teams, verschiedene Rundenzahlen, Gleichstände.
- **Status:** done

#### Ta-01-05 – Kartenfilter und Deckbildung

- **Ziel:** Karten nach Sprache, Kategorie und Schwierigkeit auswählen.
- **Umfang:** Reine Filter- und Decklogik einschließlich Verhalten bei zu kleinem Bestand.
- **Akzeptanzkriterien:** Nur passende Karten erscheinen. Reihenfolge kann über injizierbaren Zufall deterministisch getestet werden. Leere Ergebnisse sind explizit.
- **Tests:** Filterkombinationen, deterministisches Mischen, Duplikate und leere Decks.
- **Status:** done

### Phase Ta-02: Tabu-Benutzeroberfläche

#### Ta-02-01 – Spielkonfiguration

- **Ziel:** Lokale Partie vollständig einrichten.
- **Umfang:** Teams, Rundenzahl, Rundendauer, Kategorien, Schwierigkeit und Kartensprache erfassen.
- **Akzeptanzkriterien:** Mindestens zwei eindeutige Teamnamen sind erforderlich. Fehler sind lokalisiert. Gültiges Setup startet die Zustandsmaschine.
- **Tests:** Formvalidierung und Start in Deutsch/Englisch.
- **Status:** done

#### Ta-02-02 – Laufende Runde und Timer

- **Ziel:** Aktive Runde touchfreundlich bedienen.
- **Umfang:** Zielbegriff, drei verbotene Wörter, Team, Zeit, Punktestand sowie drei Kartenaktionen anzeigen.
- **Akzeptanzkriterien:** 60 Sekunden sind Standard. Ablauf beendet die Runde genau einmal. Bedienelemente sind auf kleinen Displays nutzbar.
- **Tests:** Fake-Timer, Aktionen, Ablauf und Accessibility.
- **Status:** done

#### Ta-02-03 – Rundenende

- **Ziel:** Ergebnis prüfen und kontrolliert fortsetzen.
- **Umfang:** Rundenzusammenfassung, Punktestand und nächstes Team anzeigen.
- **Akzeptanzkriterien:** Angezeigte Werte entsprechen Business-Zustand. Start der nächsten Runde erfolgt nur durch Nutzeraktion.
- **Tests:** Mehrere Ergebnisvarianten und Teamwechsel.
- **Status:** done

#### Ta-02-04 – Spielende und Neustart

- **Ziel:** Gewinner verständlich darstellen und neue Partie ermöglichen.
- **Umfang:** Endstand, Einzel-/Gleichstandsieger, Neustart mit gleicher oder neuer Konfiguration.
- **Akzeptanzkriterien:** Sieger sind korrekt lokalisiert. Neustart übernimmt nur ausdrücklich vorgesehene Einstellungen und setzt Partie-Daten zurück.
- **Tests:** Sieg, Gleichstand und beide Neustartwege.
- **Status:** done

### Phase Ta-03: Speicherung, Kartensätze und Offlinebetrieb

Laufende Tabu-Partien und deren Ergebnisse bleiben im Arbeitsspeicher. Spracheinstellungen verbleiben im vorhandenen lokalen Einstellungsspeicher. Eigene, importierte oder generierte Karten werden pro Spiel gespeichert. Mitgelieferte Karten bleiben versionierte App-Daten und stehen über den Offline-Cache bereit. Lokale Wiederherstellung und Online-Wiedereinstieg sind spätere, getrennte Erweiterungen.

#### Ta-03-01 – IndexedDB-Schema und Repository-Adapter

- **Ziel:** Dauerhaft nutzbare eigene Karten robust lokal speichern.
- **Umfang:** Versioniertes Schema, Adapter für Business-Ports, Transaktions- und Fehlerbehandlung.
- **Akzeptanzkriterien:** Lesen/Schreiben funktioniert nach Reload. Partielle Fehler hinterlassen konsistenten Zustand.
- **Tests:** Integrationsfälle mit Test-IndexedDB, Transaktionsfehler und erstmaliges Schema-Upgrade.
- **Status:** done

#### Ta-03-02 – Lokale deutsche und englische Kartensätze

- **Ziel:** Offline spielbare Grundausstattung liefern.
- **Umfang:** Kuratierte Kartendateien mit Sprache, Kategorie, Schwierigkeit, Ziel und exakt drei verbotenen Wörtern.
- **Akzeptanzkriterien:** Beide Sprachen besitzen ausreichende Karten für Standardpartien. Enge Filter werden vor Spielbeginn auf Kartenmangel geprüft. Alle Dateien bestehen Schema- und Duplikatprüfung.
- **Tests:** Datensatzvalidierung, Eindeutigkeit und Mindestmengen.
- **Status:** done

#### Ta-03-03 – Import und Aktualisierung lokaler Karten

- **Ziel:** Eigene Kartensätze importieren und für Sicherung und Rückimport exportieren.
- **Umfang:** Versioniertes Austauschformat, Validierung, Duplikatbehandlung und Updates mitgelieferter App-Daten.
- **Akzeptanzkriterien:** Wiederholter Import erzeugt keine Duplikate. Updates mitgelieferter Karten erhalten eigene Inhalte.
- **Tests:** Erstimport, Wiederholung, Export mit Rückimport und Update mit vorhandenen eigenen Karten.
- **Status:** done

#### Ta-03-04 – Manifest und Service Worker

- **Ziel:** Installierbare Offline-PWA bereitstellen.
- **Umfang:** Manifest, Icons, Cache-Strategien, Offline-App-Shell und Update-Fluss.
- **Akzeptanzkriterien:** PWA-Audit erkennt Installierbarkeit. Nach einem Online-Erstaufruf startet eine lokale Partie offline.
- **Tests:** Build-Prüfung, Manifesttest und Playwright-Offline-Szenario.
- **Status:** done

### Phase Ta-04: KI-Kartengenerierung

#### Ta-04-01 – Generierungsport und neutrales Datenmodell

- **Ziel:** Anbieterunabhängigen Vertrag definieren.
- **Umfang:** Anfrage, Ergebnis, Fehler, Abbruch und Provider-Fähigkeiten als Business-Typen modellieren.
- **Akzeptanzkriterien:** Business enthält keine Anbieter- oder Transporttypen. Fake-Provider lässt sich injizieren.
- **Tests:** Contract-Tests mit Fake-Provider und Fehlerfällen.
- **Status:** done

#### Ta-04-02 – Validierungs-, Normalisierungs- und Duplikatpipeline

- **Ziel:** Nur gültige neue Karten übernehmen.
- **Umfang:** Schema, exakt drei Verbotswörter, Sprache, Normalisierung, bestehende und batchinterne Duplikate prüfen.
- **Akzeptanzkriterien:** Ungültige Karten werden mit Gründen abgelehnt. Gültige Karten werden atomar gespeichert.
- **Tests:** Grenzfälle, Unicode, Groß-/Kleinschreibung, partielle Provider-Antworten und Transaktionsfehler.
- **Status:** done

#### Ta-04-03 – Lokaler Generatoradapter

- **Ziel:** Provider-Vertrag ohne externen Dienst nutzbar machen.
- **Umfang:** Adapter auf kuratierte lokale Kandidaten und deterministische Testdaten.
- **Akzeptanzkriterien:** Funktioniert offline und erfüllt denselben Vertrag wie spätere Provider.
- **Tests:** Provider-Contract und Offline-Integration.
- **Status:** done

#### Ta-04-04 – Ollama-Adapter

- **Ziel:** Optionale lokale Modellerzeugung ermöglichen.
- **Umfang:** HTTP-Adapter, Zeitüberschreitung, Abbruch, Antwortmapping und verständliche Verfügbarkeitsfehler.
- **Akzeptanzkriterien:** App bleibt ohne Ollama vollständig nutzbar. Keine Providerdetails gelangen in Business. Fehler blockieren bestehende Karten nicht.
- **Tests:** Gemockte Antworten, Timeout, Abbruch, fehlerhaftes JSON und Validierungspipeline.
- **Status:** done

#### Ta-04-05 – Generierungsoberfläche und lokale Speicherung

- **Ziel:** Auf Wunsch neue Karten verdeckt in die laufende Partie mischen.
- **Umfang:** Zusatzkarten im Setup aktivieren. Anbieter automatisch auswählen und die bestehenden Spielfilter verwenden.
- **Akzeptanzkriterien:** Neue Karten werden geprüft, gemischt und erst im Spiel sichtbar. Sie gelten für die vorbereitete Partie und werden nicht automatisch gespeichert.
- **Tests:** Spielablauf ohne vorzeitige Anzeige, Anbietererkennung und Offlinebetrieb.
- **Status:** done

### Phase Al-05: Veröffentlichung, E2E-Tests und Qualitätssicherung

#### Al-05-01 – Kritische E2E-Spielabläufe

- **Ziel:** Tabu end-to-end absichern.
- **Umfang:** Setup, komplette Partie, Wertung, Gleichstand, Sprachwechsel, Reload und mobile Ansicht.
- **Akzeptanzkriterien:** Kritische Abläufe laufen deterministisch in unterstützten Zielprofilen und beiden Sprachen.
- **Tests:** Playwright-Suite.
- **Status:** done

#### Al-05-02 – Offline- und PWA-E2E

- **Ziel:** Offlineversprechen real prüfen.
- **Umfang:** Installation/Audit, Cache-Aufbau, Netztrennung, App-Neustart und lokale Partie.
- **Akzeptanzkriterien:** Mitgelieferte Karten und Kernspiel funktionieren nach Netztrennung. Updatefehler zerstören keinen spielbaren Cache.
- **Tests:** Playwright mit Offline-Kontext und Produktions-Build.
- **Status:** done

#### Al-05-03 – GitHub-Pages-Build und Deployment

- **Ziel:** Reproduzierbare kostenlose Veröffentlichung schaffen.
- **Umfang:** Base-Pfad, statisches Routing, Pages-Workflow, Umgebungs- und Berechtigungsgrenzen.
- **Akzeptanzkriterien:** Deployment-URL lädt Assets und direkte unterstützte Routen korrekt. Workflow veröffentlicht nur nach erfolgreichen Pflichtprüfungen.
- **Tests:** Produktions-Build, Link-/Asset-Smoke-Test und Deployment-Workflow.
- **Status:** done

#### Al-05-04 – Qualitäts- und Barrierefreiheitsabnahme

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

### Phase Al-07 – Mobile Bedienung und Spielablauf

#### Al-07-01 – Mobile-first Oberfläche mit Daumenzone

- **Ziel:** Hauptmenü und Tabu für die Bedienung mit einer Hand am Handy gestalten.
- **Umfang:** Kompakte Kopfzeile, angeheftete Hauptaktionen, Bottom-Sheet-Dialog, große Touch-Ziele, blaues Akzentfarbschema, Grün und Rot für Aktionen.
- **Akzeptanzkriterien:** Alle Ansichten sind bei 390 px Breite ohne horizontales Scrollen bedienbar; Hauptaktionen liegen unten.
- **Tests:** Komponenten- und E2E-Tests auf Desktop und Mobil.
- **Status:** done

#### Al-07-02 – Spielablauf: Rundenübersicht, Pause, Überspringlimit und Stechen

- **Ziel:** Den Tabu-Ablauf an die Anforderungen des Auftraggebers anpassen.
- **Umfang:** Zufällige feste Teamreihenfolge, Rundenübersicht mit Punkteliste und Rundenauswertung (Wertung änderbar), vier verbotene Wörter je Karte, Überspringlimit pro Runde, Pause, Neustart mit neuen Karten, Runde beenden, einheitliche Navigation mit Zweifach-Bestätigung, Nachladen von KI-Karten und Stechen bei Gleichstand auf Zeit.
- **Akzeptanzkriterien:** Die Regeln werden von der Zustandsmaschine durchgesetzt; Pause verdeckt die Karte und zählt nicht zur Zeit; Stechen gilt für zwei bis drei gleichauf liegende Teams.
- **Tests:** Unit-Tests der Zustandsmaschine und Kartenauswahl, Komponenten- und E2E-Tests.
- **Status:** done

#### Al-07-03 – Feinschliff nach Rückmeldung

- **Ziel:** Rückmeldungen aus dem Praxistest umsetzen.
- **Umfang:** Rundenzahl Kurz (3), Mittel (5), Lang (10) und Unbegrenzt; gleich große Auswahlbuttons mit Unendlichsymbol; Schwierigkeit farbig im Menü und links oben auf der Karte; Zeitanzeige wechselt in den letzten Sekunden die Farbe; im Stechen zählt ein verbotenes Wort als falsch und bringt eine neue Karte gleicher Schwierigkeit; Kartenreihenfolge durchgehend zufällig.
- **Akzeptanzkriterien:** Unbegrenzte Spiele lassen sich nach jeder vollständigen Runde beenden; alle Gruppen sind gleich breit bedienbar.
- **Tests:** Unit-, Komponenten- und E2E-Tests.
- **Status:** done

### Phase Ta-05 – Tabu-Qualitätsprüfung

#### Ta-05-01 – Spiellogik prüfen, auch Randfälle

- **Ziel:** Alle Regeln der Zustandsmaschine systematisch auf Randfälle prüfen (leere oder zu kleine Kartensätze, Abbruch in Pause, unbegrenzte Runden, Stechen mit Gleichstand, Wiederverwendung von Karten).
- **Akzeptanzkriterien:** Randfälle sind dokumentiert, getestet und bei Fehlern behoben.
- **Ergebnis:** Dokumentiert in `docs/GAMEHUB_TABOO_LOGIC.md`. Eine Zufallsprüfung mit 400 Partien sichert die Invarianten ab.
- **Status:** done

#### Ta-05-02 – Testabdeckung prüfen und erhöhen

- **Ziel:** Abdeckung gemäß Arbeitsregeln erreichen (kritische Logik 95 %, Business 90 %, Data/Infrastructure 80 %, UI 75 %), besonders Verzweigungen der Tabu-Oberfläche.
- **Ergebnis:** Zeilenabdeckung 99,15 %, Verzweigungen 94,05 %. Alle Zielwerte sind erfüllt.
- **Status:** done

#### Ta-05-03 – Sprachabdeckung Deutsch/Englisch inklusive Oberfläche prüfen

- **Ziel:** Alle sichtbaren Texte, auch Hinweise, Fehlermeldungen und Screenreader-Namen, in beiden Sprachen prüfen; Oberflächentests für beide Sprachen.
- **Ergebnis:** Automatische Prüfungen in `src/i18n/translationQuality.test.ts` und `src/presentation/languageFlows.test.tsx`. Die Seitensprache folgt der Oberflächensprache.
- **Status:** done

#### Ta-05-04 – Oberflächentests ergänzen

- **Ziel:** Komponenten- und E2E-Tests für alle Ansichten (Menü, Rundenübersicht, Runde, Pause, Stechen, Ergebnis) auf Handybreite.
- **Ergebnis:** `e2e/mobile-layout.spec.ts` prüft alle Ansichten auf 360 und 412 Pixel in beiden Sprachen; Komponenten-Durchlauf in `src/presentation/languageFlows.test.tsx`.
- **Status:** done

#### Ta-05-05 – Struktur prüfen und wiederverwendbare Spielbausteine dokumentieren

- **Ziel:** Gemeinsame Bausteine (Spielrahmen mit Kopfzeile, angeheftete Aktionsleiste, Auswahlgruppen, Punkteliste, Zweifach-Bestätigung, Pause/Beenden über `useGameExit`) so ordnen und dokumentieren, dass neue Spiele nur noch ihre Spiellogik und ihre Inhalte liefern.
- **Akzeptanzkriterien:** Ein Leitfaden beschreibt den Aufbau eines neuen Spiels; Architekturentscheidungen werden vorab mit dem Auftraggeber abgestimmt.
- **Ergebnis:** Option B freigegeben und umgesetzt. Vorschlag in `docs/GAMEHUB_GAME_MODULES.md`, Leitfaden in `docs/GAMEHUB_NEW_GAME_GUIDE.md`.
- **Status:** done

#### Ta-05-06 – Tabu-Zustandslogik als Hooks und CSS je Spiel

- **Ziel:** Die Zustandslogik aus `TabooSetup.tsx` (Nachladen, Pause, Neustart, Stechen) als Hooks herauslösen und die Tabu-Stile in eine eigene Datei je Spiel verschieben.
- **Akzeptanzkriterien:** Verhalten und Tests unverändert; Layout-Prüfung besteht.
- **Ergebnis:** Tabu-Stile in `styles/games/taboo.css`, Nachladen der KI-Karten als Hook `useTabooRefill`. Pause, Neustart und Stechen bleiben im Container, bis ein zweites Spiel sie braucht.
- **Status:** done

### Phase Ta-06 – Tabu-Erweiterungen

#### Ta-06-01 – Info-Buttons mit Erklärfenster für Einstellungen

- **Ziel:** Zu jeder erklärungsbedürftigen Einstellung gibt es einen Info-Button, der ein Fenster mit der Erklärung öffnet.
- **Ergebnis:** Baustein `InfoButton` in `game-kit`; Erklärungen für Runden, Kartenquelle, Stechen, Überspringen und Schwierigkeit in Deutsch und Englisch.
- **Status:** done

#### Ta-06-02 – Spielregeln erklären

- **Ziel:** Die Regeln von Tabu und der Spielvarianten sind in der App verständlich erklärt.
- **Ergebnis:** Knopf „Spielregeln“ im Setup öffnet ein Fenster mit Ziel, Ablauf, Wertung, Überspringen und Spielende (Deutsch und Englisch). Die Regeln der Spielmodi folgen mit Ta-06-07.
- **Status:** done

#### Ta-06-03 – Teamreihenfolge manuell oder zufällig festlegen

- **Ziel:** Die Reihenfolge der Teams kann selbst bestimmt oder zufällig ausgelost werden.
- **Ergebnis:** Auswahl „Teamreihenfolge“ (Zufällig oder Wie eingegeben) im Setup mit Info-Button. „Wie eingegeben“ nimmt die Reihenfolge der Teamfelder; sie bleibt auch beim Neuspielen mit gleicher Konfiguration erhalten. Eine freie Umsortierung per Ziehen ist bewusst nicht enthalten.
- **Status:** done

#### Ta-06-04 – Spieler hinzufügen und auf Teams verteilen

- **Ziel:** Spieler lassen sich anlegen und manuell oder zufällig auf Teams verteilen.
- **Ergebnis:** Einklappbarer Bereich „Spieler und Teams“ im Setup: Namen eintragen, zufällig verteilen (Teamgrößen unterscheiden sich um höchstens eins) oder je Spieler das Team wählen. Reine Funktionen `parsePlayers` und `splitIntoTeams` in `src/business/shared/players.ts`, damit andere Spiele sie nutzen können. Die Verteilung ist eine Übersicht; Tabu zählt weiterhin Teams, nicht einzelne Spieler.
- **Status:** done

#### Ta-06-05 – Mehrere Karten und Kategorien hinzufügen

- **Ziel:** Eigene Karten und Kategorien lassen sich in größerer Zahl anlegen.
- **Ergebnis:** Formular „Karten hinzufügen“ in „Eigene Tabu-Karten“: eine Karte pro Zeile („Begriff: Wort1, Wort2, Wort3, Wort4“), gemeinsame Kategorie und Schwierigkeit, ungültige Zeilen werden genannt und verhindern das Speichern. Eigene Kategorien sind Namen, die direkt im Formular angelegt werden; die Kategorie-Kennung einer Karte ist dieser Name (keine neue Speicherstruktur, Import/Export bleiben kompatibel). Eigene Kategorien erscheinen im Setup als Filter, auch für die KI-Erzeugung. Bearbeiten und Löschen folgt mit Ta-06-06.
- **Status:** done

#### Ta-06-06 – Kartenimport und -export mit einfachem Editor

- **Ziel:** Karten lassen sich importieren, exportieren und in einem einfachen Editor bearbeiten.
- **Ergebnis:** Import und Export gab es bereits. Neu: Liste „Meine Karten“ auf der Kartenseite mit Suche, Bearbeiten (Begriff, vier verbotene Wörter, Kategorie inklusive neuer Kategorie, Schwierigkeit) und Löschen mit Bestätigung. Das Speicher-Interface `TabooCardRepository` hat dafür `update` und `remove`. Standardkarten bleiben unveränderbar.
- **Status:** done

#### Ta-06-07 – Spielmodi: Klassisch, Auf Zeit, Gegen die Zeit

- **Ziel:** Neben dem klassischen Modus gibt es „Auf Zeit“ (feste Kartenzahl, das Team mit der kürzesten Zeit gewinnt) und „Gegen die Zeit“ (jedes Team hat ein Zeitkonto, das beim Raten herunterläuft und bei richtiger Antwort stoppt; es gewinnt das Team mit Restzeit).
- **Akzeptanzkriterien:** Regeln werden vor Umsetzung mit dem Auftraggeber abgestimmt; neue Modi sind ein Teil der Business-Schicht und nutzen die gemeinsamen Oberflächenbausteine.
- **Stand 2026-11-12:** Abläufe vom Auftraggeber festgelegt (Auf Zeit: jedes Team am Stück, Überspringen einmal und ersetzt, Gleichstand gemeinsamer Sieg; Gegen die Zeit: Zeitkonto 2, 3 oder 5 Minuten, das aktive Team erklärt und rät selbst, damit niemand Zeit durch Trödeln stehlen kann). Regelentwurf mit Annahmen und Teilaufgaben A bis E: `docs/GAMEHUB_TABOO_MODES.md`. Umsetzung nach Bestätigung der offenen Punkte.
- **Teilaufgaben (Dashboard):** `Ta-06-07-A` Spiellogik „Auf Zeit“ (**done**: `race.ts`, `raceCards.ts`, 100 % Zeilen- und 95 % Zweigabdeckung), `Ta-06-07-B` Oberfläche „Auf Zeit“ (**done**: Spielmodus im Setup, `TabooRaceGame`, `TabooRaceRun`, `TabooRaceResults`), `Ta-06-07-C` Spiellogik „Gegen die Zeit“, `Ta-06-07-D` Oberfläche „Gegen die Zeit“, `Ta-06-07-E` Regeln und Leitfaden aktualisieren, beide Zeitmodi abschließend testen (je planned).
- **Ta-06-08:** „Auf Zeit“ mit Runden (vor „Gegen die Zeit“, Wunsch des Auftraggebers vom 2026-11-17). Entscheidungen: Runden pro Team 1 bis 5, **Wertung nach Gesamtzeit**, Karten in jedem Lauf von leicht nach schwer, die Schwierigkeit wird weiter im Reiter „Kategorien“ gewählt, „Karten pro Team pro Runde“, Reihenfolge der Gruppen wie bei Klassisch. Teilaufgaben: `Ta-06-08-A` Spiellogik, `Ta-06-08-B` Einstellungen, `Ta-06-08-C` Ansichten. Status: done
- **Ta-06-09:** „Auf Zeit“ mit Stechen (Wunsch des Auftraggebers vom 2026-11-17): Runden pro Team **1, 3, 5 (Kurz, Mittel, Lang), Standard 1**, Karten pro Team pro Runde **3, 5, 7 (Standard 3)**, **Stechen bei Gleichstand einstellbar wie bei Klassisch** (drei Karten so schnell wie möglich, bei zwei oder mehr gleichen Teams). Teilaufgaben: `Ta-06-09-A` Stechen als gemeinsame Logik, `Ta-06-09-B` Stechen in „Auf Zeit“, `Ta-06-09-C` Einstellungen und Ansichten. Status: done
- **Status:** in_progress

### Phase Ta-07 – Karten und Kategorien neu gestalten

Auftrag des Auftraggebers: Logik und Ansicht von Karten und Kategorien werden vereinfacht und bleiben kompakt und für das Handy ausgelegt. Annahmen (noch nicht bestätigt): Das einfache Formular ersetzt die Mehrzeilen-Eingabe; die Kategorien-Ansicht zeigt auch die mitgelieferten Karten, aber nur zum Lesen; eine Kategorie entsteht durch ihre Karten (keine leeren Kategorien).

#### Ta-07-01 – Karten einfach hinzufügen

- **Ziel:** Oben auf der Kartenseite steht ein schlankes Formular: Kategorie, Schwierigkeit, Begriff und die vier verbotenen Wörter in einem Feld, durch Komma getrennt.
- **Akzeptanzkriterien:** Eine Karte wird mit denselben Regeln wie bisher geprüft; Fehler und doppelte Begriffe werden verständlich gemeldet; Deutsch und Englisch; mobil kompakt.
- **Ergebnis:** Das Formular „Karte hinzufügen“ steht oben auf der Kartenseite: Kategorie und Schwierigkeit nebeneinander, darunter Begriff und die vier verbotenen Wörter in einem Feld. Nach dem Speichern bleiben Kategorie und Schwierigkeit erhalten, der Fokus springt zurück auf den Begriff. Die Mehrzeilen-Eingabe entfällt.
- **Status:** done

#### Ta-07-02 – Kategorien-Ansicht mit Kartentabelle

- **Ziel:** Jede Kategorie lässt sich ausklappen und zeigt ihre Karten kompakt untereinander (Begriff, verbotene Wörter, Schwierigkeit); eigene Karten lassen sich dort bearbeiten und löschen.
- **Akzeptanzkriterien:** Standardkarten sind nur lesbar; die Ansicht bleibt auf einem kleinen Handy ohne seitliches Scrollen bedienbar.
- **Ergebnis:** „Karten nach Kategorie“: jede Kategorie ist ein ausklappbarer Block mit Zähler („15 (2 eigene)“). Die Karten stehen als kompakte Zeilen untereinander (Begriff und Schwierigkeit in Ampelfarbe, darunter die verbotenen Wörter), eigene Karten zuerst und mit Bearbeiten-Knopf; Standardkarten sind nur lesbar. Beim Bearbeiten stehen Begriff, Wörter, Kategorie und Schwierigkeit in einem kleinen Formular, Löschen mit Zweit-Tipp. Es werden nur Karten der gewählten Kartensprache gezeigt.
- **Status:** done

#### Ta-07-03 – Hauptmenü: Kategorien getrennt

- **Ziel:** Im Setup sind die Kategorien leicht getrennt in Standard und Eigene.
- **Ergebnis:** Im Setup stehen die Kategorien in zwei leicht getrennten Gruppen „Standard“ und „Eigene“ (Beschriftung nur, wenn es eigene Kategorien gibt).
- **Status:** done

#### Ta-07-04 – KI-Vorschlag für verbotene Wörter (später wieder entfernt)

- **Hinweis:** Der Knopf wurde umgesetzt und später auf Wunsch des Auftraggebers wieder entfernt, weil die KI nur mit installiertem Ollama am Rechner läuft und Fremde nichts extra installieren sollen. Port, Adapter und Texte sind gelöscht (im Verlauf der Versionsverwaltung ab Commit `5a02b09` auffindbar). Die Kartenerzeugung im Setup über Ollama bleibt.

- **Ziel:** Beim Anlegen oder Bearbeiten einer Karte kann die lokale KI (Ollama, falls erreichbar) anhand des Begriffs vier verbotene Wörter vorschlagen.
- **Akzeptanzkriterien:** Der Knopf erscheint nur, wenn eine lokale KI gefunden wurde; der Vorschlag wird geprüft (vier verschiedene Wörter, keines gleich dem Begriff) und nur in das Feld eingetragen, nicht automatisch gespeichert; die Kartenerfassung funktioniert ohne KI unverändert. Keine Daten verlassen den Rechner (nur `127.0.0.1`).
- **Ergebnis:** Neuer Knopf „Wörter mit KI vorschlagen“ im Formular „Karte hinzufügen“ und im Bearbeiten-Formular. Er erscheint nur, wenn beim Öffnen der Kartenseite eine lokale Ollama-KI gefunden wurde. Der Vorschlag (vier verschiedene Wörter, keines gleich dem Begriff, geprüft in `reviewForbiddenWords`) wird ins Feld geschrieben und nicht automatisch gespeichert. Port `TabooWordSuggester` in der Business-Schicht, Adapter `ollamaTabooWordSuggester` in der Infrastruktur (nur `127.0.0.1`). Nicht an einer echten KI ausprobiert (auf diesem Rechner lief keine), nur mit Testdoubles.
- **Status:** done

#### Ta-07-05 – Kartenseite verfeinern

- **Ziel:** Die Kartenseite wirkt aufgeräumt: Aktionen sind echte Knöpfe (Bearbeiten als Stiftsymbol), der Export gilt für genau eine Kategorie und der Import ist ein gestalteter Knopf statt des rohen Dateifelds.
- **Ergebnis:** Bearbeiten ist ein Knopf mit Stiftsymbol (kein blauer Text mehr), über zwei Zeilen der Kartenzeile. Der Export steht je Kategorie in der geöffneten Kategorie und enthält nur deren eigene Karten; der globale Export entfällt (ein Gesamt-Backup aller eigenen Karten ist damit nicht mehr möglich, bei Bedarf als eigene Aufgabe). Der Import ist ein Knopf mit Symbol, das rohe Dateifeld ist versteckt. Zurück und KI-Vorschlag sind ebenfalls Knöpfe mit Symbol. Gemeinsamer Baustein `Icon`. Nachbesserung: kleine Symbolknöpfe (2,25 rem) direkt neben dem Kartennamen und dem Kategorienamen; Knopf „Karten“ (vorher „Eigene Karten verwalten“) steht mit „Spielregeln“ in einer Leiste oben rechts im Setup; Die Kartenseite zeigt in der Kopfzeile der App nur einen Zurück-Pfeil oben rechts (Einstellungen und Home sind dort ausgeblendet und nur im Hauptformular sichtbar), umgesetzt über `useGameBack` in `GameChrome`; der KI-Knopf (Funkel-Symbol) sitzt neben dem Wörterfeld und ist ohne gefundene KI sichtbar, aber deaktiviert mit Hinweis.
- **Status:** done

### Phase Ta-08 – Lokale KI am Rechner

Auftrag des Auftraggebers: Die KI sollte ohne Zusatzprogramm und auch am Handy laufen. Ergebnis der Prüfung: Ein kleines Modell im Browser ist dafür zu schlecht (Messung `Ta-08-01`); die Wikipedia-Alternative hat der Auftraggeber abgelehnt. **Entscheidung (ADR-018): Die KI gibt es nur am Rechner über ein lokal installiertes Programm (Ollama). Am Handy gibt es keine KI, alle Karten bleiben ohne KI nutzbar. Der KI-Knopf für Wortvorschläge wurde danach wieder entfernt.**

#### Ta-08-01 – Qualitätstest

- **Ergebnis:** Qwen2.5-0.5B im Browser (WebLLM): schnell (0,2 bis 0,4 s je Karte), aber nur etwa 2 bis 3 von 20 Karten sinnvoll, Deutsch deutlich schlechter. Größere Modelle (1,5 Mrd. und mehr) brauchen mindestens 1,6 GB Grafikspeicher und sind für Handys unrealistisch; sie wurden nicht getestet. Die Testseite `prototypes/ai-word-test.html` bleibt als Werkzeug erhalten.
- **Status:** done

### Phase Ta-09 – Großer Kartenpool für Tabu

Ausgangspunkt: Eine KI am Handy ist nicht möglich (`Ta-08-01`, `ADR-018`). Der Auftraggeber erzeugt die Karten stattdessen am PC mit einer guten KI, prüft sie und liefert sie mit der App aus. Die vollständige Planung steht in `docs/GAMEHUB_CARD_POOL.md`. Sie ist ein Vorschlag; die Entscheidungen in Abschnitt 6 dieses Dokuments brauchen die Zustimmung des Auftraggebers.

- **Ta-09-01:** Entscheidungen klären. Entschieden: 500 Karten je Sprache zuerst, später bis 1.500; zweiter KI-Durchgang plus Stichproben; Deutsch und Englisch unabhängig erzeugen. Kategorien: zehn (Alltag, Natur, Kultur, Essen und Trinken, Tiere, Sport und Freizeit, Berufe, Orte und Reisen, Film/Musik/Medien, Technik), Tabelle in `docs/GAMEHUB_CARD_POOL.md`. Gespielte Karten merken: später (`Ta-09-06` bleibt optional). Status: done
- **Ta-09-02:** Paketformat, Laden als eigener Teil mit Rückfall auf die 45 eingebauten Karten, Kategorien aus den Daten statt aus festen Schlüsseln. **Ergebnis:** Format `gamehub-taboo-pack` (Version 1) je Sprache in `src/data/pool/de.json` und `en.json` mit den zehn Kategorien (Kennung, deutscher und englischer Name) und einer leeren Kartenliste; `parseTabooCardPack` prüft streng und lehnt ein beschädigtes Paket ganz ab; `loadTabooCardPack` lädt es per dynamischem Import als eigenen Teil der App (im Build `de-*.js` und `en-*.js`, vom Offline-Speicher mit vorgehalten). Die Kategorienamen stehen in den Daten (`builtInCategories` für die Rückfallkarten, Paketdateien für den Rest), die Übersetzungsschlüssel `tabooSetup.category.*` sind entfallen. Im Setup erscheinen die drei Kategorien der Rückfallkarten immer, die übrigen Kategorien des Pakets erst, wenn sie Karten haben; im Formular „Karte hinzufügen“ sind alle zehn wählbar. Status: done
- **Ta-09-03:** Erzeugungsskript am PC, fortsetzbar, mit Prüfregeln und Ablehnungsliste. **Ergebnis:** `pnpm pool:generate` (`scripts/generate-card-pool.mjs`, Entwicklerwerkzeug, nicht Teil von App und Build) fragt Ollama oder LM Studio je Kategorie und Schwierigkeit in Portionen, prüft jede Karte streng und schreibt ein Arbeitspaket `work/pool-<Sprache>.json` im Format der ausgelieferten Pakete plus eine Ablehnungsliste `work/pool-<Sprache>.rejected.jsonl`. Es lässt sich abbrechen und fortsetzen, vermeidet schon vorhandene Begriffe und bricht Zellen ohne Fortschritt nach einigen leeren Anfragen ab. Die Regeln liegen getestet im Business-Code (`poolGeneration.ts`). Bei LM Studio wird nur ein bereits geladenes Chat-Modell genommen (sonst `--model` angeben), um kein großes Modell ungewollt zu laden. Geprüft mit einer nachgebildeten Ollama-Schnittstelle, nicht mit einer echten KI. Status: done
- **Ta-09-04:** Prüfwerkzeug und Regelliste. **Ergebnis:** `scripts/review-card-pool.mjs` mit drei Schritten auf den Arbeitsdateien in `work/`: (1) `judge`: zweiter KI-Durchgang, Punkte 1 bis 5 und ein kurzer Problemtext je Karte (`pool-<Sprache>.verdicts.json`, fortsetzbar, nicht auswertbare Antworten bleiben ungeprüft); (2) `sheet`: Prüfseite `pool-<Sprache>.review.html` mit allen zweifelhaften und ungeprüften Karten plus einer Stichprobe der guten je Kategorie und Schwierigkeit, Kästchen zum Abwählen, Kategorienfilter und Kopieren der Kennungen in `pool-<Sprache>.drops.txt`; (3) `merge`: übernimmt geprüfte, ausreichend bewertete (Standard ab 4) und nicht abgewählte Karten in `src/data/pool/<Sprache>.json`, sortiert, nur wenn das Ergebnis ein gültiges Paket ist; mit `--dry-run` nur Vorschau. Die gemeinsamen Teile (Anbieter, Dateien) liegen in `scripts/lib/pool-tools.mjs`, die Regeln getestet in `poolReview.ts`. Die Regelliste für die KI steht im Auftrag (`poolGeneration.ts`, `poolReview.ts`). Geprüft mit einer nachgebildeten Ollama-Schnittstelle (Lauf, Wiederaufnahme, Prüfseite im Browser, Übernahme, wiederholte Übernahme), nicht mit einer echten KI. Status: done
- **Ta-09-05:** Pool in Etappen erzeugen und einbauen, zuerst eine Kategorie als Probelauf. **Stand:** Der Probelauf mit dem lokalen Modell `qwen/qwen3.6-27b` (LM Studio) scheiterte zuerst am Zeitlimit von Node (behoben, siehe Changelog) und wurde dann abgebrochen, weil der Auftraggeber die Karten lieber direkt von Claude schreiben lässt (bessere Qualität, kein Warten). Dafür gibt es `scripts/import-card-batch.mjs`: Eine Stapeldatei durchläuft dieselben strengen Regeln (kein Wort enthält den Begriff, keine Dubletten gegen die eingebauten Karten und den Pool) und geht ins Arbeitspaket `work/pool-<Sprache>.json`; mit `--score` bekommen die Karten ein Urteil, damit die Prüfseite nur eine Stichprobe zeigt. Bisher geschrieben (je Sprache etwa 52 Karten je Kategorie): Essen und Trinken, Tiere, Sport und Freizeit, Berufe, Orte und Reisen, Film/Musik/Medien, Technik; zuletzt auch Alltag, Natur und Kultur; Stand Deutsch 523, Englisch 521 Karten im Arbeitspaket (alle zehn Kategorien). **Übernommen (Auftraggeber: „alles übernehmen“, 2026-11-12):** Mit `review-card-pool merge` stehen jetzt Deutsch 523 und Englisch 521 Karten in `src/data/pool/de.json` und `en.json` (17 bis 19 je Kategorie und Schwierigkeit, zusätzlich zu den 45 eingebauten Karten). Der Build enthält sie als `de-*.js` (74 kB, gepackt 15 kB) und `en-*.js` (72 kB, gepackt 15 kB); der Hauptteil blieb gleich groß. Im Setup erscheinen alle zehn Kategorien, eine Partie nur mit „Technik“ zeigte eine Karte aus dem Pool. Hinweis: Die Karten stammen von Claude ohne unabhängigen Prüfdurchgang und ohne Durchsicht durch den Auftraggeber; ein Streichen einzelner Karten geht über die Abwahlliste und einen weiteren Lauf von `merge` oder direkt in den Paketdateien. Status: done
- **Ta-09-06:** Gespielte Karten merken (Wunsch des Auftraggebers vom 2026-11-18, bisher optional). **Ergebnis:** Je Kartensprache werden die Kennungen der gezeigten Karten im Browser gemerkt, neue Spiele bevorzugen ungespielte Karten und beginnen einen neuen Durchgang, wenn sie nicht reichen; Einstellung „Gespielte Karten merken“ und Knopf zum Vergessen (Beschreibung in `docs/GAMEHUB_CARD_POOL.md`). Status: done
- **Ta-09-07:** Karten erneut prüfen: Kein verbotenes Wort darf ein Teil des Begriffs sein. Beispiel: Bei „Fußball“ darf „Ball“ nicht unter den verbotenen Wörtern stehen, weil Teile des Begriffs ohnehin verboten sind. Prüfregel im Erzeugungs- und Prüfwerkzeug ergänzen und alle Bestandskarten (Deutsch und Englisch) damit prüfen. Ergebnis: Der Pool (1.044 Karten) war schon sauber, weil das Erzeugungsskript die Regel prüft; die allgemeine Kartenprüfung (eigene Karten, Import) und 9 Standardkarten hatten sie nicht und sind korrigiert. Status: done
- **Ta-09-08:** Noch mehr Karten erzeugen. Entschieden (2026-11-13): **30 Karten je Schwierigkeit und Kategorie** reichen vorerst (10 Kategorien mal 3 Schwierigkeiten mal 30 = 900 Karten je Sprache; bisher 17 bis 19 je Gruppe, es fehlen etwa 380 je Sprache). Die Karten schreibt Claude (wie bei Ta-09-05), kein lokales Modell. Ablauf: Karten in Stapeln schreiben, mit `import-card-batch` durch die Prüfregeln, Durchsicht, einbauen; Ergebnis (2026-11-13): Alle zehn Kategorien haben je Schwierigkeit 30 Karten, also 900 Karten je Sprache. Die Prüfregeln lehnten etliche Karten ab (Begriff schon vorhanden, verbotenes Wort als Teil des Begriffs); sie wurden ersetzt. Status: done

### Phase Ta-10 – Tabu-Oberfläche nach Rückmeldung überarbeitet

Ziel: Die Rückmeldungen des Auftraggebers zur Oberfläche von Tabu (eine Seite je Ansicht, ruhige Aufstellung, neuer Einstieg) umsetzen. Rollen: Logik beim Auftraggeber und Codex, Verkabelung und Oberfläche bei Claude.

- **Ta-10-01:** Ein-Seiten-Ansichten: feste Bedienelemente, nur Reiterinhalt und Listen scrollen. Status: done
- **Ta-10-02:** Karteneditor mit zwei Reitern (Karten, Karte hinzufügen). Status: done
- **Ta-10-03:** Punktestand, Rundenübersicht und Ergebnislisten mit Rang, Krone und Zuwachs. Status: done
- **Ta-10-04:** Auf Zeit und Stechen angeglichen (Fortschritt, Kartenzähler, Zehntelsekunden); dabei Logikfehler behoben: Beim Stechen entschieden Millisekunden, angezeigt werden Zehntel. Status: done
- **Ta-10-05:** Korrekturregeln: falsch Markiertes bleibt falsch, nur der letzte Zug ist korrigierbar. Status: done
- **Ta-10-06:** Endansicht mit Gewinnerblock, Reitern, Konfetti und neuen Knopftexten („Erneut spielen“, „Zurück zum Hauptmenü“). Status: done
- **Ta-10-07:** Neuer Einstieg: Aufstellung zuerst, Spieleinstellungen als eigener Bildschirm (Symbolknopf links neben „Spiel starten“, „Fertig“). Status: done
- **Ta-10-08:** Aufstellung überarbeitet: Teamreihenfolge (Platznummer außerhalb der Box, Symbolknöpfe für Standard und Zufall), „Spieler leeren“, „Spieler entfernen“, Info-Knopf an jeder Überschrift neben dem Text (`HeadingLegend`). Status: done
- **Ta-10-09:** Spieler-Reiter aus Tabu entfernen: lokal sind Spieler nicht relevant, online reicht der Teams-Reiter mit den Namen aller, die der Lobby beigetreten sind (fest, nicht eingetippt). Bleibt im Kit für andere Spiele. Hängt vom Online-Tabu ab. **Entscheidung des Auftraggebers (2026-11-19): Der Spieler-Reiter bleibt vorerst in Tabu; die Aufgabe ist nur noch optional und wird nicht ohne neue Freigabe begonnen.** Status: planned

### Phase Al-08 – PC-Layout für alle Spiele

Anforderung des Auftraggebers (2026-11-12): **Jedes Spiel bekommt ein Handy-Layout und ein PC-Layout**, damit man auch am PC spielen kann. Bisher gibt es nur das Handy-Layout (eine schmale Spalte, Bedienung unten, Prüfung über `e2e/mobile-layout.spec.ts`). Der Leitfaden für neue Spiele (`docs/GAMEHUB_NEW_GAME_GUIDE.md`) und die Bausteine im `game-kit` sollen beide Größen berücksichtigen. Noch nicht begonnen; Reihenfolge und Zeitpunkt gegenüber den anderen Aufgaben legt der Auftraggeber fest.

- **Al-08-01:** Anforderungen und Entwurf: Breakpoints, Aufteilung (zum Beispiel Einstellungen neben dem Spielbereich), was am PC anders ist (Tastatur, Maus), Bausteine im `game-kit`. **Entwurf:** `docs/GAMEHUB_PC_LAYOUT.md` (2026-11-18). **Entscheidungen des Auftraggebers:** PC-Layout **ab 1024 px**, darunter die Handy-Spalte (auch auf Tablets); Einrichtung am PC **nebeneinander** (links Aufstellung, rechts Einstellungen, unten breiter Startknopf, keine Reiter zum Umschalten); die Runde ist am PC mit **Tastenkürzeln** bedienbar (Leertaste oder Enter = Richtig, S = Überspringen, V = Verbotenes Wort, P = Pause); die **Spielauswahl bleibt die schmale Spalte**. Die Annahmen aus Abschnitt 8 des Entwurfs wurden mit dem Start der Umsetzung bestätigt. Status: done
- **Al-08-02:** PC-Layout für Tabu mit Layoutprüfung im Desktop-Format neben der Handy-Prüfung. Status: done
- **Al-08-03:** Tastenkürzel der laufenden Runde in allen drei Modi und im Stechen (Entwurf Abschnitt 6.2) mit Tests. Status: done
- **Al-08-04:** Bausteine im `game-kit` für das PC-Layout: Breiten (Tokens), Baustein für zwei Bereiche nebeneinander, `ShortcutHint`, `useShortcuts`, mit Tests. Status: done
- **Al-08-05:** Layoutprüfung für den PC (`e2e/desktop-layout.spec.ts`) bei 1024 × 768, 1280 × 800 und 1920 × 1080 in beiden Sprachen, zuerst für die vorhandenen Ansichten. Status: done

### Phase Al-09 – Gemeinsame Bausteine für Teams, Spieler und Spieleinstellungen

Anregung des Auftraggebers (2026-11-12): Teams, Spieler und Spieleinstellungen werden in jedem Spiel gebraucht und sollen daher einmal gebaut und von allen Spielen verwendet werden, als wiederverwendbare Ansicht. Bisher liegen Teamanzahl, Teamnamen, Reihenfolge, Spielerliste und die Aufteilung auf Teams in `TabooSetupForm` und `TabooPlayers`; die reine Logik (`shuffleTeams`, `parsePlayers`, `splitIntoTeams`) ist schon in `src/business/shared/`. **Der Entwurf ist vom Auftraggeber freigegeben (`ADR-020`).**

Vorschlag für den Aufbau:

- **Eine Setup-Hülle im `game-kit`** mit den festen Abschnitten „Teams und Spieler“ und „Spieleinstellungen“, der Leiste oben rechts (Regeln und weitere Knöpfe des Spiels) und der Startleiste unten. Das Spiel liefert nur seine Einstellungen (mit `ChoiceGroup`, `InfoButton`) und seine Regeln.
- **Ein Baustein „Teams und Spieler“** (Teamanzahl mit spielabhängigem Bereich, Namen, Reihenfolge zufällig oder wie eingegeben, optional Spielerliste mit Verteilung). Er liefert eine einheitliche Beschreibung der Teams (Kennung, Name, Spieler) an das Spiel; die Zufallsverteilung bleibt reine Logik in `business/shared`.
- **Texte** in einer gemeinsamen Übersetzungsdatei statt je Spiel; Stile im `game-kit` statt in `taboo.css`.
- **Handy- und PC-Layout** von Anfang an mitdenken (Phase Al-08), weil dieser Baustein in jedem Spiel erscheint.
- **Merken zwischen Spielen (optional):** zuletzt benutzte Teams und Spieler lokal speichern, damit man sie in jedem Spiel wiederfindet (eigene Ablage in IndexedDB).

- **Al-09-01:** Entwurf mit dem Auftraggeber abstimmen (Umfang, Spielerzahl-Grenzen, was ein Spiel einstellen darf). **Stand:** Entwurf liegt in `docs/GAMEHUB_SETUP_KIT.md` (Bausteine `SetupScreen`, `SetupSection`, `TeamsSetup`, optional `PlayersSetup`, reine Logik `buildTeams` und `TeamRules`, Texte in `kit.ts`, Stile im `game-kit`, verhaltensgleicher Umbau von Tabu in vier Schritten); drei Entscheidungen getroffen (gesteuerte Teams mit Spielern, `PlayersSetup` gleich mit, Merken später), zwei als Vorgabe angenommen. Status: done
- **Al-09-02:** Umsetzung im `game-kit`, Tabu zieht um, Tests in beiden Sprachen, Leitfaden für neue Spiele ergänzen. **Ergebnis:** Reine Logik `src/business/shared/teamSetup.ts` (`buildTeams`, `TeamRules`, `validateTeamSetup`, `initialTeamSetup`, `clampTeamCount`); Bausteine `SetupScreen`, `SetupSection`, `TeamsSetup` und `PlayersSetup` im `game-kit` (`ChoiceGroup` hat dafür einen gesteuerten Modus mit `value` und `onChange`); gemeinsame Texte `kit.ts`, gemeinsame Stile `kit-setup.css` (aus `taboo.css`, die Klassen heißen jetzt `kit-*`). Tabu nutzt sie: `TabooSetupForm` besteht aus `SetupScreen` mit den Abschnitten; `TabooSetup` hält einen `TeamSetupValue` und baut die Teams mit `buildTeams`; `TabooPlayers` und die Tabu-Texte und -Stile für Teams sind entfallen. Die Spieler eines Teams kommen jetzt im Spielzustand an (`Team.players`, bleibt weg, wenn leer), die Übersicht zeigt sie noch nicht. Verhalten und zugängliche Namen sind unverändert; eine kleine Verbesserung: Die Teamliste der Spieler zeigt die eingetragenen Teamnamen statt „Team N“. Status: done
- **Al-09-03:** Spieler und Teams merken. **Ergebnis:** Port `TeamSetupMemory` mit reiner Prüfung gespeicherter Daten (`savedTeamSetup.ts`: `parseSavedTeamSetup`, `hasTeamSetupContent`, `sameTeamSetup`), Adapter im lokalen Browserspeicher (`localStorageTeamSetupMemory.ts`), Kontext `TeamSetupMemoryProvider` und `useTeamSetupMemory` im `game-kit`, in `AppRoot` und `main.tsx` verdrahtet. `TeamsSetup` und `PlayersSetup` bieten „Letzte Gruppe laden“ beziehungsweise „Letzte Spieler laden“ an, wenn eine Gruppe gemerkt ist und sich vom aktuellen Stand unterscheidet; Tabu merkt die Gruppe beim Start (nur wenn mindestens ein Teamname oder Spieler eingetragen ist). Die Gruppe gilt für alle Spiele. Speicher bewusst `localStorage` statt IndexedDB (siehe `docs/GAMEHUB_SETUP_KIT.md`, 4.5). Status: done
- **Al-09-04:** Optional: eigene Adressen für Unterseiten (zum Beispiel `#/games/taboo/cards`), damit die Zurück-Taste des Browsers und das Neuladen dort wirken. Bisher hat jedes Spiel genau eine Adresse (`#/games/taboo`); alle Ansichten darin sind Zustand der Seite, keine Adressen. Das ist bewusst so (statisches Hosting mit Adresse nach dem `#`, keine Serverrouten nötig), ist aber nicht auf `localhost` beschränkt. Status: planned
- **Al-09-05:** Feste Ansichten und Oberflächenregeln aus `ADR-021` umsetzen. **Ergebnis:** `ActionRow`, `ScoreScreen` (Zwischen- und Endstand) und `ManageScreen` im `game-kit`; `SetupScreen` ist das Hauptmenü mit den Plätzen `rules` und `editor`; die Stile liegen in `kit-setup.css`; Tabu ist verhaltensgleich umgestellt, „Abbrechen“ ist rot. Regeln: `docs/GAMEHUB_UI_RULES.md`. Das eigentliche Spiel und die Auswertung bleiben bis zum zweiten Spiel Tabu-eigen. Status: done
- **Al-09-08:** Spielergruppen (Wunsch des Auftraggebers vom 2026-11-13, noch nicht geplant im Detail): In der Spielerverwaltung lassen sich **Gruppen** anlegen (zum Beispiel mehrere Freundesgruppen), damit man Namen schneller findet und eine Gruppe als Ganzes in die Aufstellung übernehmen kann. **Entschieden und umgesetzt (2026-11-18):** Ein Spieler darf in mehreren Gruppen sein; in der Aufstellung wählt man die Gruppe und hakt dann ab; es gibt nur noch Gruppen, jeder Spieler ist in mindestens einer Gruppe und wird nur innerhalb einer Gruppe hinzugefügt; die Gruppen werden einfach aufgelistet, ein Klick zeigt die Spieler der Gruppe; das Fenster ist in allen Ansichten gleich groß. Beschreibung im Changelog. Status: done
- **Al-09-09:** Konfigurierbare Aufstellung (Entscheidung des Auftraggebers vom 2026-11-14, `ADR-025`): getrennte aufklappbare Boxen „Spieler“ und „Teams“, je Spiel über eine `LineupConfig` ein- oder ausgeblendet. **Ergebnis:** `business/shared/lineup.ts` (`LineupConfig`, `validateLineup`), `tabooLineup`, `LineupSetup` im `game-kit`, `SetupSection` mit Kurzinfo in der Überschrift; „Spieler ohne Team“ verhindert den Start; später am selben Tag auf eine einfache Liste mit Teamauswahl je Spieler vereinfacht (kein Ziehen). Status: done
- **Al-09-07:** Aufstellung nach dem Start (Entscheidung des Auftraggebers vom 2026-11-13, `ADR-023`). **Ergebnis:** Das Hauptmenü hat kein Feld „Teams und Spieler“ mehr. „Starten“ liest die Einstellungen einmal (`readTabooSettings`) und öffnet die neue Ansicht **Aufstellung** (`LineupScreen` im `game-kit`, mit `TeamsSetup` und offener Spielerliste, Auswahl aus der Spielerliste, Zuweisung von Hand oder zufällig). „Spiel starten“ (fest unten) bereitet die Karten vor, prüft die Kartenmenge mit der nun bekannten Teamzahl und startet das Spiel; Meldungen erscheinen in der Aufstellung, ein Teamwechsel während der Kartenvorbereitung bricht sie ab. Kopfleiste: Zurück ins Hauptmenü. „Mit gleicher Konfiguration neu spielen“ führt zurück in die Aufstellung (Teams vorbelegt, die Karten des vorigen Spiels werden wiederverwendet, wenn sie reichen); im Endstand wird nichts gelost. Status: done
- **Al-09-06:** Spielerverwaltung (Entscheidung des Auftraggebers vom 2026-11-12, `ADR-022`): ein Fenster „Spieler“, aufrufbar aus dem GameHub (Spielauswahl) und aus dem Hauptmenü jedes Spiels (Knopf neben Spielregeln und Editor). Dort lassen sich Spieler hinzufügen und löschen; sie bleiben dauerhaft gespeichert (lokaler Browserspeicher). In jedem Spiel wählt ein Knopf „Aus Spielerliste wählen“ in „Teams und Spieler“, wer heute mitspielt; danach wird wie bisher zufällig oder von Hand auf Teams verteilt. „Letzte Gruppe laden“ aus `Al-09-03` bleibt zusätzlich. **Ergebnis:** Reine Logik `src/business/shared/playerRoster.ts` (`addPlayer`, `removePlayer`, `parseSavedRoster`, `applyRosterSelection`, `rosterPlayersIn`; Namen bis 24 Zeichen, höchstens 100 Spieler, keine doppelten Namen, ohne Komma und Semikolon), Port `PlayerRosterStore` mit Adapter `localStoragePlayerRosterStore.ts` (Schlüssel `gamehub.players`), `PlayerRosterProvider` und `usePlayerRoster` im `game-kit`, `PlayerRosterButton` (Knopf „Spieler“ mit Fenster) in der Werkzeugleiste jedes Hauptmenüs (automatisch über `SetupScreen`) und auf der Spielauswahl, `RosterPicker` („Aus Spielerliste wählen“) in `TeamsSetup` und `PlayersSetup`. Die Werkzeugleiste ist jetzt eine Reihe mit gleich breiten Knöpfen. Zusätzlich behoben: `Dialog` setzte den Fokus bei jedem Rendern zurück auf den Schließen-Knopf, Tippen in einem Fenster war dadurch unmöglich. Status: done
- **Al-09-10:** Neue gemeinsame Bausteine im `game-kit`: `TabPane`, `ResultList`, `Confetti`, `HeadingLegend`, Symbolknopf neben der Startleiste (`StartBar` mit `sideAction`). Status: done
- **Al-09-11:** Leitfäden für neue Spiele (`docs/GAMEHUB_NEW_GAME_GUIDE.md`, `docs/GAMEHUB_SETUP_KIT.md`) mit den neuen Bausteinen und Oberflächenregeln aktualisiert. Status: done

### Phase Al-10 – Gesamtprüfung nach den Tabu-Erweiterungen

Ziel: Vor der Ansicht für Teams und Spieler und vor dem nächsten Spielmodus prüfen, ob die Schichten sauber getrennt sind, ob Logik und Oberfläche für andere Spiele wiederverwendbar liegen, ob die Bedienung ruhig bleibt (nichts springt, die Scrollposition wird gemerkt) und ob toter Code übrig ist. Ergebnis: `docs/GAMEHUB_QUALITY_CHECK.md`.

- **Al-10-01:** Gesamtcheck. **Ergebnis:** Schichten sauber; toter Code entfernt; Kartenbedarf und Generator-Anfragen in der Business-Schicht (`cardPlan.ts`); `RulesDialog`, `RulesButton` und `useScreenScroll` im `game-kit`; Stechen in `useTabooTiebreak`; Leitfaden für neue Spiele aktualisiert. Status: done
- **Al-10-02:** Den Container `TabooSetup.tsx` weiter aufteilen: Hooks für das klassische Spiel, den Start und die Einstellungsansicht, reine Planungsfunktionen, eigene Komponenten für Aufstellung und Bildschirme (642 auf 255 Zeilen, Komplexität 109 auf 24, Verhalten unverändert). Status: done
- **Al-10-04:** Gesamtanalyse von Tabu vor dem nächsten Spielmodus (Bericht in `docs/GAMEHUB_QUALITY_CHECK.md`). Status: done
- **Al-10-05:** Systemzurück-Taste bei laufendem Spiel abfangen (`useSystemBack`, Dialog „Spiel beenden?“). Status: done
- **Al-10-06:** Stechen bei vier oder mehr gleichen Teams. **Entscheidung des Auftraggebers vom 2026-11-18: Immer Stechen**, bei jedem Gleichstand ab zwei Teams (auch bei vier bis sechs); wer das nicht will, schaltet das Stechen in den Einstellungen aus, dann gewinnen die gleichen Teams gemeinsam. Status: done
- **Al-10-07:** Monotone Zeitmessung statt Wanduhr. Status: done
- **Al-10-08:** Stile ordnen (Kit-Stile, Duplikate, ungenutzte Klassen). Status: done
- **Al-10-09:** Fokusführung beim Ansichtswechsel. Status: done
- **Al-10-10:** Layout für Telefone mit 320 Pixel Breite. Status: done

### Phase Al-11 – Installation als App erklären

Ziel: Im GameHub steht eine kurze Anleitung, wie man die Webseite als App installiert (Wunsch des Auftraggebers vom 2026-11-19). Vorlage ist die Umsetzung im Projekt `trip-planner`.

- **Al-11-01:** Anleitung zur Installation im GameHub. **Ergebnis:** Knopf „App installieren“ in den Einstellungen; Fenster mit den Reitern Android, iPhone / iPad und Computer (der Reiter des Geräts ist vorgewählt) und kurzen Schritten; wo der Browser es anbietet, zusätzlich „Automatisch installieren“; der Knopf verschwindet, wenn die App installiert läuft. Texte in Deutsch und Englisch. Beschreibung im Änderungsprotokoll. Status: done

### Phase Al-06: Spätere Erweiterungen

#### Tabu-Spielmodi für später

- **Race:** Pro Team wird eine Zielzahl gelöster Karten festgelegt, zum Beispiel zehn. Jedes Team darf höchstens einmal überspringen. Es gewinnt das Team, das die Zielzahl in der kürzesten eigenen Spielzeit erreicht. Zwei Abläufe sind vorgesehen: Jedes Team spielt seinen Lauf am Stück, oder die Teams wechseln sich nach jeder Karte ab. Beim Wechsel zählt für jedes Team nur seine aktive Zeit.
- **Countdown-Duell:** Jedes Team hat ein eigenes Zeitkonto. Es läuft jeweils nur die Uhr des aktiven Teams, während geraten wird. Sobald der Begriff erraten wurde, pausiert diese Uhr und die des nächsten Teams läuft weiter. Wer zuerst keine Zeit mehr hat, verliert.
- **Vor der Umsetzung klären:** Wer erklärt und wer rät im Countdown-Duell? Zählt Überspringen dort ebenfalls als erlaubter Wechsel und ist es auf einmal pro Team begrenzt? Im Race ist zu klären, ob eine übersprungene Karte ersetzt oder später erneut gespielt wird und wie Gleichstände behandelt werden.

#### Al-06-01 – Multiplayer-Discovery und ADR

- **Ziel:** Online-Multiplayer fachlich und technisch entscheiden.
- **Umfang:** Autoritätsmodell, Lobby, Synchronisierung, Datenschutz, Hosting und Konfliktbehandlung analysieren.
- **Akzeptanzkriterien:** Genehmigtes ADR und abgegrenzter Folgeplan liegen vor. Keine Implementierung ohne Freigabe.
- **Tests:** Review der Ereignismodelle und Prototyp nur nach gesonderter Beauftragung.
- **Status:** planned

#### Al-06-02 – Spielmodulvertrag überprüfen und erweitern

- **Ziel:** Den frühen Spielmodulvertrag anhand weiterer Spielanforderungen kontrolliert weiterentwickeln.
- **Umfang:** Erfahrungen aus Tabu und den Spezifikationen weiterer Spiele auswerten und den bestehenden Vertrag nur bei nachgewiesenem Bedarf um Start- oder Persistenzschnittstellen ergänzen.
- **Akzeptanzkriterien:** Der erweiterte Vertrag bleibt genreunabhängig, rückwärtskompatibel und ist durch Tabu sowie ein zweites Testmodul belegt.
- **Tests:** Contract-Tests und Architekturprüfung.
- **Status:** planned

### Phase Wb-01 – Wortbombe

[Spielregeln](GAMEHUB_WORTBOMBE.md)

| Aufgabe | Prüffälle zur Abnahme |
| --- | --- |
| `Wb-01-01` – Weitergabe und Rücknahme im Spielerkreis | Nach A folgt B.<br>Ist B ausgeschieden, folgt auf A die Person C.<br>Nach C folgt A.<br>Zurück nimmt genau eine Übergabe zurück. Die Ablaufzeit bleibt gleich. |
| `Wb-01-04` – Bombentimer und Explosion | Die injizierte Zufallsquelle liefert einmal je Runde einen Wert im geplanten Bereich.<br>Bei exakt erreichter Frist explodiert die Bombe bei der bisherigen Person.<br>Ein Ereignis aus der vorherigen Runde verändert die aktuelle Runde nicht.<br>Bei Rückkehr nach Fristablauf wird genau eine Explosion angezeigt. |
| `Wb-01-06` – Einspruch, Ausscheiden und Rundenende | Ohne Einspruch scheidet die Person aus, die bei Ablauf dran war.<br>Nach A → B scheidet bei bestätigtem Einspruch A aus.<br>Bei Explosion vor dem ersten Weiter ist kein Einspruch möglich.<br>Nach Ausscheiden von B beginnt die nächste aktive Person nach B.<br>Bei zwei verbliebenen Personen führt bestätigtes Ausscheiden direkt zum Sieg der anderen. |
| `Wb-01-02` – Zweisprachige Aufgaben und Kartenziehung | Alle neun Aufgabentypen haben deutsche Karten.<br>Alle neun Aufgabentypen haben eigenständig formulierte englische Karten.<br>Bei ausschließlich aktivem Reimtyp wird eine Reimkarte gezogen.<br>Mit englischer Kartensprache werden nur englische Karten gezogen.<br>Bei zwei Karten desselben Typs werden beide vor einer Wiederholung gezogen. |
| `Wb-01-09` – Spielmenü und mobile Abnahme | Das Spiel lässt sich aus der Spielauswahl öffnen und verlassen.<br>Eine mobile Partie endet mit dem Namen der letzten aktiven Person.<br>Ein bestätigter Einspruch kann den Gewinner wechseln. |

### Phase Im-01 – Imposter

[Spielregeln](GAMEHUB_IMPOSTER.md)

| Aufgabe | Prüffälle zur Abnahme |
| --- | --- |
| `Im-01-01` – Rollen und Geheimwort zuteilen | Bei vorgegebener Zufallsquelle gibt es genau einen Imposter.<br>Alle übrigen Rollen erhalten denselben Begriff. |
| `Im-01-04` – Zweisprachige Begriffe und optionales Hilfswort | Jeder deutsche Begriff hat ein separates Hilfswort.<br>Jeder englische Begriff hat ein separates Hilfswort.<br>Bei deaktiviertem Hilfswort erhält der Imposter nur seine Rollenbezeichnung. |
| `Im-01-06` – Ablauf der Hinweisrunden | Die Gruppe kann früh abstimmen oder direkt weiterspielen.<br>Die Gruppe kann final abstimmen oder Runde drei wählen.<br>Nach Runde drei ist keine weitere Hinweisrunde möglich. |
| `Im-01-08` – Abstimmung, Stichwahl und Rateversuch auswerten | Bei gleich vielen Höchststimmen beginnt die zweite Hinweisrunde.<br>Alle und nur die Gleichplatzierten mit Höchststimmen stehen zur Wahl.<br>Bei Gleichstand in der Stichwahl gewinnt der Imposter.<br>Ein falsch Verdächtigter führt zum Imposter-Sieg, ein enttarnter Imposter zum Rateversuch.<br>Bei Enttarnung gibt es genau einen mündlichen Tipp. Der Begriff erscheint erst nach der Bewertung. |
| `Im-01-11` – Spielmenü und mobile Abnahme | Das Spiel lässt sich aus der Spielauswahl öffnen und verlassen.<br>Eine offene Abstimmung nach Runde eins kann direkt zur Auflösung führen.<br>Nach gewählter dritter Runde folgt die geheime finale Abstimmung.<br>Die Ergebnisansicht zeigt den Imposter als Sieger. |

### Phase We-01 – Werwolf

[Spielregeln](GAMEHUB_WERWOLF.md)

| Aufgabe | Prüffälle zur Abnahme |
| --- | --- |
| `We-01-01` – Grundregeln und Rollenverteilung für 6 bis 15 Spieler festhalten | Die Spielnotiz beschreibt Besetzung, Nacht, Tag und Siegbedingungen. |
| `We-01-06` – Rollen auslosen und verdeckt zuteilen | Für 6–8, 9–11 und 12–15 Spieler entstehen jeweils 1, 2 oder 3 Wölfe und genau eine Seherin. Der Erzähler erhält keine Rolle.<br>Jede Person kann vor Spielbeginn nur ihre eigene Rolle aufdecken. |
| `We-01-02` – Nachtlogik für Seherin und Werwölfe | Nach dem Erkennen der Wölfe gibt es in Nacht eins keine Opferauswahl.<br>Ein Wolfsziel liefert Werwolf, ein Dorfziel Kein Werwolf.<br>In einer späteren Nacht gibt es ohne lebende Seherin keine Prüfung.<br>Nur lebende Personen der Dorfseite sind wählbar.<br>Ohne bestätigtes Opfer bleibt die Zahl der Lebenden gleich.<br>Die bestätigte Person scheidet beim Morgenwechsel genau einmal aus. |
| `We-01-08` – Nominierung und Tagesabstimmung | Ohne Unterstützung startet keine Abstimmung.<br>Drei von sechs reichen nicht, vier von sechs führen zum Ausscheiden.<br>Nach Ablauf der Diskussion kann der Erzähler die nächste Nacht starten. |
| `We-01-09` – Siegbedingungen für Dorf und Werwölfe | Nach Ausscheiden des letzten Wolfs gewinnt das Dorf.<br>Zwei Wölfe gegen einen Dorfbewohner und eine Seherin gewinnen. |
| `We-01-05` – Spielmenü, Übersetzungen und mobile Abnahme | Werwolf lässt sich über die Spielauswahl öffnen und verlassen.<br>Jeder Regiehinweis ist in beiden Sprachen vorhanden.<br>Am Morgen sind alle Spieler weiterhin aktiv.<br>Nach Tagesende beginnt ohne Ausscheiden die nächste Nacht.<br>Beim erreichten Gleichstand erscheint das Spielergebnis. |

### Phase Lb-01 – Liar’s Bar

[Spielregeln](GAMEHUB_LIARS_BAR.md)

| Aufgabe | Prüffälle zur Abnahme |
| --- | --- |
| `Lb-01-01` – Kartenmodus und Grenzfälle am Tisch erproben | Der Ablauf mit leeren Händen ist erprobt und festgehalten.<br>Die Startregel nach einer verlorenen Herausforderung ist festgehalten.<br>Die Ausscheidensregel und die beobachtete Partielänge sind festgehalten. |
| `Lb-01-02` – Kartenstapel, Austeilen und Tischwert | Der Stapel enthält sechs Karten je Rang und zwei Joker.<br>Vier aktive Personen erhalten zusammen zwanzig eindeutige Karten.<br>Joker kommen als Tischwert nicht vor. |
| `Lb-01-06` – Verdecktes Ablegen und Zugfolge | Eine bis drei eigene Karten sind zulässig. Vier Karten werden abgelehnt.<br>Die bestätigte Regel bestimmt den nächsten gültigen Zug oder das erzwungene Anzweifeln. |
| `Lb-01-03` – Anzweifeln und letzte Ablage auswerten | Frühere Ablagen bleiben verdeckt.<br>Ein Joker zählt auch an einem Ass-Tisch als korrekt.<br>Bei falscher Ablage verliert der Ablegende, bei korrekter Ablage die anzweifelnde Person. |
| `Lb-01-07` – Risikoauflösung, Folgerunde und Sieg | Doppelte Verarbeitung erhöht den Zähler nur einmal.<br>Die betroffene Person scheidet genau beim Erreichen der Schwelle aus.<br>Die nächste Runde erhält neue Hände und einen Tischwert.<br>Mit nur einer aktiven Person startet keine Folgerunde. |
| `Lb-01-05` – Spielmenü, Übersetzungen und mobile Abnahme | Das Spiel ist aus der Spielauswahl erreichbar.<br>Alle Ansichten sind in beiden Sprachen bedienbar.<br>In beiden Fällen wird die richtige Person belastet.<br>Eine Runde kann bei leeren Händen nicht hängen bleiben.<br>Die letzte aktive Person wird als Gewinner angezeigt. |

### Schwimmen (Sw)

[Spielregeln und Hausregeln](GAMEHUB_SCHWIMMEN.md)

Grundmodus ist eine Online-Runde ohne Leben. Die reine Spiellogik kann vor dem Onlinedienst umgesetzt und getestet werden. Die Online-Einbindung baut auf der Multiplayer-Entscheidung Al-06-01 auf. Die Entwicklung ist für den Branch `game/schwimmen` vorgesehen. Der optionale Modus mit Leben folgt nach Abnahme des Grundmodus.

#### Sw-01 – Regeln und offene Entscheidungen

| Aufgabe | Abnahme |
| --- | --- |
| `Sw-01-01` – Rundenregeln und Grenzfälle festlegen | Spielerzahl, Austeilen, Gleichstand bei gleicher Farbsumme, Ende bei 31 auf der Hand, Vorrang von Blitz bei gleichzeitigem Sonderfall und Ersatz bei erschöpftem Stapel sind entschieden. |

#### Sw-02 – Karten, Züge und Wertung

| Aufgabe | Abnahme |
| --- | --- |
| `Sw-02-01` – Deck, Austeilen und Handwertung umsetzen | 36 eindeutige Karten, je drei Handkarten und drei offene Tischkarten. Tests decken Farbsummen und die Rangfolge aller Drillinge ab. |
| `Sw-02-02` – Kartentausch und Schieben umsetzen | Einzel- und Dreiertausch sind möglich. Ein kompletter Umlauf ohne Tausch ersetzt die Tischkarten nach der vereinbarten Stapelregel. |
| `Sw-02-03` – Blitz und die drei Fälle für 31 umsetzen | Tests prüfen Blitz, gültig angelegte 31, automatische Niederlage bei 31 nach einem Tausch und Neuausteilen bei 31 in der Starthand. |
| `Sw-02-04` – Klopfen und beide Wertungsarten umsetzen | Klopfen ist ein eigener Zug ab dem zweiten Umlauf. Die letzte Zugfolge wird korrekt abgewickelt. Im strengen Modus reicht geteilte Führung, bei Fehlklopfen verliert nur die klopfende Person. |

#### Sw-03 – Online-Raum und private Kartenhände

| Aufgabe | Abnahme |
| --- | --- |
| `Sw-03-01` – Raum, Beitritt und Spielerzuordnung anbinden | Nach Al-06-01 können mehrere Geräte demselben Raum beitreten und eine Partie mit gemeinsamer Zugreihenfolge starten. |
| `Sw-03-02` – Züge prüfen und Karten pro Spieler übertragen | Die Serverinstanz mischt und entscheidet über Züge und Ergebnisse. Jedes Gerät erhält nur eigene Handkarten und öffentliche Informationen. Fremde, verspätete und doppelte Züge verändern die Partie nicht. |
| `Sw-03-03` – Wiederbeitritt und Verbindungsverlust behandeln | Nach einer kurzen Unterbrechung erhält dieselbe Person ihren zulässigen aktuellen Stand. Das Verhalten bei längerem Verbindungsverlust ist festgelegt und getestet. |

#### Sw-04 – Lobby, Spieltisch und Rundenergebnis

| Aufgabe | Abnahme |
| --- | --- |
| `Sw-04-01` – Lobby für Raumbeitritt und Wertungswahl bauen | Die Gruppe kann Räume erstellen oder betreten. Vor dem Start ist die gewählte Wertungsart für alle sichtbar. |
| `Sw-04-02` – Spieltisch mit Hand, Tischkarten und Zugaktionen bauen | Die Ansicht zeigt eigene und offene Karten, die Person am Zug und nur die erlaubten Aktionen für Tauschen, Schieben, Klopfen und 31. |
| `Sw-04-03` – Rundenergebnis und neue Runde anzeigen | Das Ergebnis zeigt die entscheidende Regel und wer verloren hat. Die Gruppe kann im selben Raum neu starten. |

#### Sw-05 – Spielmenü und Mehrgeräte-Abnahme

| Aufgabe | Abnahme |
| --- | --- |
| `Sw-05-01` – Schwimmen ins Spielmenü einbinden und online abnehmen | Navigation und Bedienung auf Deutsch und Englisch sowie vollständige Partien auf mehreren Geräten werden geprüft. Dazu gehören Sichtschutz, Wiederbeitritt und beide Wertungsarten. |

## 6. Abhängigkeiten und Reihenfolge

### Reihenfolge innerhalb eines Spiels

Die Spieltabs zeigen zuerst die Regeln und danach die Spiellogik mit ihren Prüffällen. Die Ansichten folgen in Spielreihenfolge. Menüeinbindung und mobile Abnahme schließen den Ablauf ab.

### Abnahme der einzelnen Spielansichten

#### Tabu

| Aufgabe | Abnahme |
| --- | --- |
| `Ta-06-07-D` – Einrichtung für Gegen die Zeit | Der Modus lässt sich auswählen und mit seinen gültigen Einstellungen starten. |
| `Ta-06-07-D-01` – Laufende Runde für Gegen die Zeit | Aktives Team und verbleibende Zeit sind sichtbar. Die erlaubten Aktionen funktionieren. |
| `Ta-06-07-D-02` – Rundenübersicht für Gegen die Zeit | Nach der Runde zeigt die Übersicht den Zwischenstand und ermöglicht den nächsten Lauf. |
| `Ta-06-07-D-03` – Ergebnis für Gegen die Zeit | Nach dem letzten Lauf zeigt die Ansicht das Ergebnis des Modus. |
| `Al-08-03` – Tastenkürzel der laufenden Runde | Jedes Kürzel löst genau ein Ereignis aus; nicht in Eingabefeldern, bei offenem Fenster oder in der Pause; die Kürzel stehen an den Knöpfen. |
| `Al-08-04` – Bausteine im `game-kit` für das PC-Layout | Unter 1024 px ändert sich keine Ansicht (Stilvergleich); ab 1024 px ordnen die Bausteine zwei Bereiche nebeneinander an. |
| `Al-08-05` – Layoutprüfung für den PC | Die Prüfung läuft in drei Größen und beiden Sprachen und findet keine waagerechte Scrollleiste, keine verdeckten Knöpfe und keine Seite, die als Ganzes scrollt. |
| `Al-08-02` – Tabu-Einrichtung im Desktop-Layout | Die Spieleinstellungen bleiben bei typischer Desktopbreite erreichbar. |
| `Al-08-02-01` – Laufende Tabu-Runde im Desktop-Layout | Karte, Zeit und Spielaktionen bleiben gemeinsam sichtbar. |
| `Al-08-02-02` – Tabu-Ergebnis im Desktop-Layout | Teamstände und Abschlussaktionen sind am Desktop lesbar und erreichbar. |
| `Al-08-02-03` – Tabu-Kartenverwaltung im Desktop-Layout | Kategorien und Karten lassen sich am Desktop ansehen und bearbeiten. |

#### Wortbombe

| Aufgabe | Abnahme |
| --- | --- |
| `Wb-01-08` – Einrichtung für Wortbombe | Spieler, Handymodus, Kartensprache und Varianten sind wählbar. Der letzte aktive Aufgabentyp bleibt ausgewählt. |
| `Wb-01-03` – Laufende Wortbombe-Runde | Aufgabe und aktive Person bleiben sichtbar. Weiter und Zurück sind entsprechend dem Spielzustand bedienbar. |
| `Wb-01-31` – Explosionsansicht mit Einspruch | Die Gruppe kann den vorgeschlagenen Ausschluss bestätigen oder bei gültiger Übergabe Einspruch erheben. |
| `Wb-01-32` – Ergebnisansicht für Wortbombe | Nach dem finalen Ausschluss wird der Gewinner angezeigt, auch wenn ein Einspruch das Ergebnis geändert hat. |

#### Imposter

| Aufgabe | Abnahme |
| --- | --- |
| `Im-01-05` – Einrichtung für Imposter | Ab drei Personen kann die Gruppe mit gewählter Abstimmungsart und Hilfswort-Einstellung starten. |
| `Im-01-02` – Verdeckte Rollenanzeige | Halten und Hochziehen zeigt die Rolle. Loslassen, Abbruch und Hintergrund verdecken sie wieder. Weiter öffnet die nächste Rolle verdeckt. |
| `Im-01-10` – Ansicht für Hinweisrunden | Die Ansicht zeigt die Hinweisrunde und bietet an ihrem Ende die passenden Optionen bis zur finalen Abstimmung. |
| `Im-01-07` – Offene Abstimmungsansicht | Nach dem Zeigen am Tisch trägt die Gruppe die Person mit den meisten Stimmen oder die Gleichplatzierten ein. |
| `Im-01-28` – Geheime Abstimmungsansicht | Jede berechtigte Person gibt ihre Stimme am Handy ab. Das Ergebnis erscheint erst nach der letzten Stimme. |
| `Im-01-29` – Stichwahlansicht | Bei finalem Gleichstand stehen nur die Personen mit der höchsten Stimmenzahl zur Wahl. Die gewählte Abstimmungsart bleibt aktiv. |
| `Im-01-30` – Ansicht für den letzten Rateversuch | Der enttarnte Imposter kann einmal mündlich raten. Die Gruppe bewertet den Tipp, bevor das Geheimwort öffentlich erscheint. |
| `Im-01-31` – Ergebnisansicht für Imposter | Die Ansicht nennt die siegreiche Seite und löst Imposter und Geheimwort auf. |

#### Werwolf

| Aufgabe | Abnahme |
| --- | --- |
| `We-01-26` – Einrichtung für Werwolf | Der Erzähler und 6 bis 15 Mitspielende sind auswählbar. Die Rollenverteilung entspricht der Gruppengröße. |
| `We-01-27` – Verdeckte Rollenanzeige für Werwolf | Jede Person sieht beim Aufdecken nur ihre eigene Rolle. Beim Weiterreichen ist sie wieder verdeckt. |
| `We-01-04` – Nachtansicht für den Erzähler | Regiehinweise führen durch Werwölfe und Seherin. Das Aufdeckpanel zeigt die Namen zur aktiven Rolle. In der ersten Nacht ist kein Wolfsopfer auswählbar. |
| `We-01-10` – Morgenansicht für Werwolf | Der Erzähler sieht das bestätigte Opfer samt Rolle oder den Hinweis, dass niemand ausgeschieden ist. |
| `We-01-28` – Tagesansicht für Diskussion und Nominierung | Der Erzähler kann eine unterstützte Nominierung erfassen oder den Tag ohne Ausscheiden beenden. |
| `We-01-29` – Abstimmungsansicht für Werwolf | Der Erzähler erfasst die Zustimmung. Nur eine strikte Mehrheit lässt die nominierte Person ausscheiden. |
| `We-01-30` – Ergebnisansicht für Werwolf | Die Ansicht nennt die siegreiche Seite, einschließlich eines Wolfssiegs bei Gleichstand mit dem Dorf. |

#### Liar’s Bar

| Aufgabe | Abnahme |
| --- | --- |
| `Lb-01-26` – Einrichtung für Liar’s Bar | Zwei bis vier Personen können eine lokale Kartenpartie starten. |
| `Lb-01-27` – Geräteübergabe für Liar’s Bar | Die Übergabe nennt die nächste Person und verdeckt alle Kartenhände bis zur Bestätigung. |
| `Lb-01-04` – Private Kartenhand für Liar’s Bar | Nur die aktive Person sieht ihre Hand und kann ein bis drei eigene Karten markieren. |
| `Lb-01-08` – Öffentliche Tischansicht | Tischwert und Anzahl der zuletzt abgelegten Karten sind sichtbar. Anzweifeln ist gemäß Zugregeln verfügbar. |
| `Lb-01-28` – Ansicht für die aufgedeckte Herausforderung | Nur die letzte Ablage und die Person, die die Herausforderung verloren hat, werden aufgedeckt. |
| `Lb-01-29` – Ansicht für die Risikoauflösung | Das Ergebnis zeigt, ob die betroffene Person ausscheidet oder im Spiel bleibt. |
| `Lb-01-30` – Ergebnisansicht für Liar’s Bar | Die letzte aktive Person wird als Gewinner angezeigt. |

### Empfohlene Reihenfolge für weitere Spiele

1. **Wortbombe** – zuerst die reine Spiellogik mit Zeitgrenzen testen, danach die Kartenstapel und mobilen Ansichten integrieren. [Spielregeln](GAMEHUB_WORTBOMBE.md)
2. **Imposter** – zuerst Hinweisrunden und Abstimmungen modellieren. Das verdeckte Aufdecken als wiederverwendbaren Oberflächenbaustein umsetzen und bei Geräteübergabe testen.
3. **Werwolf** – die Spielregeln getrennt modellieren und den Aufdeckbaustein aus Imposter in der Erzähleransicht verwenden. Danach vollständige Partien mit Rollenwechseln zwischen Tag und Nacht testen.
4. **Liar’s Bar** – Kartenmodus zuerst am Tisch ausprobieren. Anschließend Kartenlogik und private Handansicht getrennt umsetzen und Geräteübergaben testen.


- Phase Al-02 ist Voraussetzung für alle Implementierungsphasen.
- Phase Al-03 beginnt vor sichtbaren Benutzerfunktionen, damit keine fest codierten Texte entstehen.
- Phase Ta-01 kann nach Phase Al-02 parallel zur gemeinsamen UI entwickelt werden, bleibt aber vollständig UI-unabhängig.
- Phase Ta-02 benötigt die Kernlogik aus Phase Ta-01 und das Designsystem aus Phase Al-04.
- Phase Ta-03 macht den lokalen Modus dauerhaft und offline nutzbar.
- Phase Ta-04 beginnt erst nach stabiler lokaler Kartenverwaltung. Sie ist für die Spielbarkeit nicht erforderlich.
- Phase Al-05 schließt den ersten Release ab.
- Phase Al-07 verfeinert Bedienung und Spielablauf des abgenommenen Tabu-Releases.
- Phase Ta-05 prüft Qualität und Struktur von Tabu; `Ta-05-05` (wiederverwendbare Spielbausteine) bereitet `Al-06-02` vor.
- Phase Ta-06 erweitert Tabu um Regeln, Spieler, Karten und Spielmodi.
- Phase Al-06 (Multiplayer und weitere Spiele) folgt nach Phase Ta-06 und bleibt bis zu separaten Freigaben außerhalb des bisherigen Produktumfangs. Die Phasennummer bleibt aus Gründen stabiler IDs bestehen.

## 7. Risiken und Gegenmaßnahmen

| Risiko | Auswirkung | Gegenmaßnahme |
|---|---|---|
| Paketmanager fehlt | Projektinitialisierung blockiert | Vor `Al-02-01` npm/Corepack-Verfügbarkeit herstellen und Version fixieren |
| Service-Worker-Updates | Veraltete oder inkonsistente Assets | Versionierte Caches, atomarer Aktivierungsfluss, Produktions-E2E |
| IndexedDB-Migration | Verlust lokaler Karten/Einstellungen | Versionierte Migrationen, Transaktionen, Altbestand-Fixtures |
| Zufällige Deckreihenfolge | Flaky Tests | Zufallsquelle injizieren und in Tests deterministisch ersetzen |
| Übersetzungsdrift | Unvollständige UI | Schlüsselparität als Pflichtprüfung in CI |
| KI-Antworten unzuverlässig | Ungültige oder doppelte Karten | Providerunabhängige Validierung vor atomarer Speicherung |
| GitHub-Pages-Pfade | Produktionsseite lädt nicht | Base-Pfad und direkte Navigation im Produktions-Build prüfen |

## 8. Aktueller Freigabepunkt

Die Projektvorbereitung ist abgeschlossen. Die eigentliche Implementierung beginnt erst nach ausdrücklicher Freigabe mit `Al-02-01`.

## Aktuelle Werwolf-Übergabe (19.11.2026)

Für Werwolf sind GAMEHUB_WERWOLF_HANDOFF.md und GAMEHUB_WERWOLF_UI.md der aktuelle Einstieg; ihre bestätigten Anforderungen ersetzen ältere Darstellungsannahmen. Technische Übergabe enthält Arbeitsordner/Branch, unversionierten Stand, APIs, Fachereignisse und offene Grenzen. We-03-62 (manuelle erlaubte Wolfszahl mit separater Empfehlung) ist geprüft abgeschlossen. Nacht/Morgen/Tag/Abstimmung sind Inhalte einer zentralen Erzähleransicht. Gewinneransicht We-01-30 bleibt umzusetzen; Gestaltung ausdrücklich erst am Ende mit Claude Code. Aktuelle Aufgaben in GAMEHUB_STATUS.json und GAMEHUB_DEVELOPMENT.html beachten. Keine Produkt-UI in diesem Übergabeschritt umgesetzt.


### We-03-63 – beschlossene Hammer-Neuordnung (erledigt)

We-03-63 ist seit 20.11.2026 implementiert: Hammer nach Magier, Zielmenge vom Nachtbeginn, gemeinsame Todesauflösung und Überschneidungen geprüft. Magierheilung wurde nicht erweitert. Ziele, Tarnskript, Protokoll und Rücknahme siehe GAMEHUB_WERWOLF_NARRATOR_API.md.


### We-03-64 – Erzähler-Logikschnittstellen (erledigt)

Aktueller Logikstand vom 20.11.2026: Hammer-Neuordnung, Zielkatalog, Tarnskript, Ereignisprotokoll, Spielerprojektion und Rücknahme sind implementiert. Verbindlicher Anschluss für Claude: [Erzähler-API](GAMEHUB_WERWOLF_NARRATOR_API.md). Ältere Planungs-/Prüfabschnitte beschreiben ihren damaligen Stand. Browser-Speicherung, Navigation und UI bleiben gesonderte Integrationsarbeit.

Werwolf: neue Hammer-Reihenfolge, gültige Ziele, Nachtskript mit Tarnaufrufen, strukturierte Aktions-/Todesprotokolle, Spielerprojektion und reine Rücknahme umgesetzt. 262 Tests plus gezielte Sechser-Kombinationsprüfung bestanden; geprüfte Logik 99,83 % Zeilen / 98,04 % Zweige. Neue Erzähler-API für Claude dokumentiert; UI-Integration bleibt gesondert.


### We-03-65 – neue Rollenregeln umgesetzt

Werwolf: Harter Bursche mit wolfOnly/anyAttack, öffentlicher Lehrlingsaufruf und Amors Selbstwahl geprüft; Amulett umgeht keinen Hammer mehr und wird als letzter Nachtschritt vor der Morgenauflösung weitergegeben. Schutz gilt beim jeweiligen Besitzer im Angriffszeitpunkt, nicht rückwirkend. Früherer Träger ist beim späteren Jägerschuss ungeschützt. 273 Tests, beide Sechser-Kombinationsprüfungen, Typ-/Lint-/Schichtprüfung erfolgreich; UI-Anbindung als We-01-48 vorgemerkt.

Präzisierung des Auftraggebers zum Amulett: Es schützt ausschließlich den jeweiligen Besitzer im Moment des Angriffs. Eine frühere Abwehr bleibt nach der Weitergabe wirksam; der neue Besitzer wird nicht rückwirkend vor bereits erfolgten Angriffen geschützt. Nach der Übergabe schützt es ihn vor späteren Angriffen, etwa dem Jägerschuss am Morgen. Der frühere Träger ist dann ungeschützt. Hammer, Liebeskummer und bereits ausgelöste Verwundungen werden nicht geheilt oder abgewehrt.

We-01-48 (geteilter Harter-Bursche-Button mit leerer Auswahl für keine Rolle) ist in der Konfiguration umgesetzt; die öffentliche Aufrufkennung und die neue Amulett-Phase werden mit der Erzähleransicht als We-01-49 verdrahtet.


### We-03-66 – zweite Regelrunde umgesetzt

Werwolf We-03-66 abgeschlossen: Amulett nur noch gegen Nachtangriffe; Abstimmung und Jägerschuss werden trotz Amulett aufgelöst. Keine künstliche Weitergabepflicht bei Liebeskummer. Freie Paarentscheidungen, Wolfsparität und unveränderte Trunkenbold-Enthüllung in Nacht drei geprüft. 277 gezielte Tests, 100 komplette Partien und zwei Sechser-Kombinationsprüfungen bestanden; 99,83 % Zeilen / 98,07 % Zweige. Historische Balancewerte nicht neu simuliert; UI-Anbindung bleibt We-01-48.

Präzisierung des Auftraggebers zum Amulett (aktuelle zweite Regelrunde): Entscheidend ist der Besitzer im Moment eines nächtlichen Wolfsangriffs, Gifts oder Todeszaubers. Eine frühere Abwehr bleibt nach der Weitergabe wirksam; neue Besitzer werden nicht rückwirkend gerettet. Hammer, Tagesabstimmung und jeder Jägerschuss umgehen das Amulett unabhängig vom Besitzer. Liebeskummer und bereits ausgelöste Verwundungen werden ebenfalls nicht abgewehrt. Nur ein tatsächlich abgewehrter Nachtangriff erzwingt die Weitergabe; bei Liebeskummer bleibt Behalten oder Weitergeben freiwillig.


### We-03-67 – variable Rollen nach Muss/Darf

We-03-67 abgeschlossen: Wünsche 1–7 für variable Werwolf-Rollen umgesetzt. Muss-/Darf-Pools, gezählte Rollenfamilien, Optionsmengen und gleichverteilte Wolfswahl; jeder optionale Zusatz unabhängig mit 50 %. Machbarkeit mit Grenzen und Sperrgründen; separate Empfehlung nur anhand der Muss-Einträge. Frühere Itembereiche und Wolfsberechnung nach Ziehung ersetzt. 313 Tests erfolgreich; neue API und Migrationshinweise dokumentiert. UI-Anbindung bleibt separat.

Technischer Vertrag: [GAMEHUB_WERWOLF_VARIABLE_API.md](GAMEHUB_WERWOLF_VARIABLE_API.md). 313 gezielte Tests einschließlich 100 kompletter Partien bestanden. Exakte Ziehungsverteilung, unabhängige 50-%-Zusätze, Muss-Varianten, alle Spielerzahlen 6–20, Machbarkeitsgrenzen, Fehlerfälle und Hammer-Tarnaufrufe geprüft. variableSetup.ts: 100 % Zeilen / 99,52 % Zweige; geprüfte kritische Module insgesamt 99,86 % Zeilen / 98,23 % Zweige. Typprüfung, Lint, Format und Schichtprüfung bestanden. Keine Balance-Simulationen erneut gestartet.


### We-03-68 – Nachtaufrufe nur für tatsächliche Rollen

We-03-68: Nachtlogik umgesetzt und gezielt in den Werwolf-UI-Arbeitsstand übernommen. Nicht gezogene Rollen, Lehrling und Trunkenbold werden übersprungen; vorhandene verdeckte Rollen behalten ihre Tarnaufrufe. Überflüssige Pool-Felder entfernt. Variable API beschreibt Claudes gewichtete Rollengruppen samt Beispielen und Heilergrenzen. Keine Produkt-UI oder Übersetzungen geändert.

431 Werwolf-Tests inklusive 100 kompletter Partien und Ziehungsprüfungen bestanden. Nachtmodul 100 % Zeilen/Zweige; geprüfte kritische Logik insgesamt 99,73 % Zeilen / 98,15 % Zweige. Typprüfung im Logik-Arbeitsordner, ESLint, Format und Schichtprüfung erfolgreich. Breiter Testlauf dort: 1.091 Tests; aktueller UI-Arbeitsstand: 1.472 Tests erfolgreich. Lange Forschungs-/Balance-Simulationen ausgenommen. Gesamt-Typprüfung im UI-Arbeitsstand meldet fünf nachweislich vorbestehende UI-Fehler (auch mit ursprünglichen Logikdateien reproduziert); Übergabe enthält Fundstellen. Keine UI-Fehler in dieser Aufgabe verändert.


### We-03-69 – gezielte Prüfung des direkten Nachtstarts

We-03-69 abgeschlossen: Wegfall von amuletIntro gezielt geprüft, 8 Tests bestanden. Nach der Rollenverteilung beginnt unmittelbar der normale erste Nachtschritt; Besitz und Weitergabe des Amuletts bleiben unverändert. Keine Produktionslogik geändert. Die breite Simulation wurde auf Wunsch des Auftraggebers gestoppt; keine neue Balanceberechnung.

Gezielte Abnahme nach Einschränkung durch den Auftraggeber: 8 Tests bestanden (sechs direkte Nachtstart-Varianten mit Amulett, bestehende Startvergabe und Weitergabe am Nachtende). Typprüfung, ESLint und Formatprüfung erfolgreich. Keine Produktionslogik geändert. Breiter Lauf auf Wunsch des Auftraggebers abgebrochen, Änderungen an balance.test.ts und simulation.test.ts zurückgenommen; keine vollständige Balance-/Simulationsabnahme behauptet.


Nachtrag zu We-03-69: Entscheidende Ergebnisunterschiede, Aussagegrenzen des abgebrochenen Gesamtlaufs und die weiterhin veralteten Heilungs-Testmodelle sind oben in GAMEHUB_WERWOLF_HANDOFF.md und in GAMEHUB_WERWOLF_CODEX_AUFGABE_NACHT.md gegenübergestellt.
