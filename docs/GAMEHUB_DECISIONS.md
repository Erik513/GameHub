# GameHub Architekturentscheidungen

Statuswerte sind `accepted`, `proposed`, `superseded` oder `rejected`. Änderungen an akzeptierten grundlegenden Entscheidungen benötigen die Zustimmung des Auftraggebers.

## ADR-001: React, TypeScript und Vite

- **Status:** accepted
- **Datum:** 2026-11-09
- **Entscheidung:** Die Web-App wird mit React, TypeScript und Vite umgesetzt.
- **Begründung:** Der Stack unterstützt eine komponentenbasierte mobile UI, strikte Typisierung, schnelle Entwicklungszyklen, statische Builds und GitHub Pages.
- **Konsequenzen:** Browserkompatibilität, Basis-Pfad und Asset-Auflösung müssen im Produktions-Build für GitHub Pages geprüft werden.

## ADR-002: Schichten und Abhängigkeitsrichtung

- **Status:** accepted
- **Datum:** 2026-11-09
- **Entscheidung:** Der Quellcode wird in Presentation, Business, Data und Infrastructure gegliedert. Abhängigkeiten zeigen zur Business-Schicht. Business definiert fachliche Typen, Regeln und Ports. Data implementiert persistente Repositories. Infrastructure kapselt Browser-APIs und externe Provider. Presentation verwendet Business-Anwendungsfälle.
- **Begründung:** Spiellogik bleibt unabhängig von React, Speicherung und Anbietern und kann isoliert getestet werden.
- **Konsequenzen:** Konkrete Adapter werden an einem Composition Root verdrahtet. Direkte Imports aus Business nach außen sind unzulässig.

## ADR-003: Gemeinsame Plattform, getrennte Spiele

- **Status:** accepted
- **Datum:** 2026-11-09
- **Entscheidung:** Navigation, Einstellungen, Internationalisierung, Persistenzabstraktionen und Designsystem sind gemeinsam. Jedes Spiel erhält ein eigenes Modul mit Business-Logik, Anwendungsfällen und UI.
- **Begründung:** Weitere Spiele können ergänzt werden, ohne bestehende Spiellogik zu vermischen.
- **Konsequenzen:** Spielmodule verwenden nur definierte gemeinsame Verträge.

## ADR-004: Explizite Tabu-Zustandsmaschine

- **Status:** accepted
- **Datum:** 2026-11-09
- **Entscheidung:** Tabu verwendet eine reine, explizite Zustandsmaschine mit den Zuständen `setup`, `roundRunning`, `roundEnded` und `gameEnded`. Ereignisse erzeugen deterministische Zustandsübergänge.
- **Begründung:** Zeitablauf, Wertung und Rundenwechsel werden überprüfbar und unabhängig von der UI.
- **Konsequenzen:** Timer-Effekte senden Ereignisse an die Business-Logik. Sie verändern den fachlichen Zustand nicht direkt.

## ADR-005: Internationalisierung und getrennte Sprachen

- **Status:** accepted
- **Datum:** 2026-11-09
- **Entscheidung:** i18next und react-i18next verwalten UI-Übersetzungen. UI-Sprache und Kartensprache werden als unabhängige Einstellungen gespeichert. Deutsch und Englisch sind vom ersten UI-Inkrement an vollständig unterstützt.
- **Begründung:** Nutzer können die Oberfläche in einer anderen Sprache als die Spielkarten verwenden.
- **Konsequenzen:** Übersetzungsschlüssel müssen automatisiert auf Parität geprüft werden. Domänenobjekte tragen explizite Sprachmetadaten.

## ADR-006: IndexedDB hinter Repository-Ports

- **Status:** accepted
- **Datum:** 2026-11-09
- **Entscheidung:** Lokale Daten werden in IndexedDB gespeichert. Business greift ausschließlich über Repository-Interfaces darauf zu. Schemaänderungen werden versioniert migriert.
- **Begründung:** IndexedDB unterstützt strukturierte Offline-Daten und größere Kartensätze im Browser.
- **Konsequenzen:** Repository-Adapter benötigen Integrations- und Migrationstests. Daten aus älteren Versionen müssen unterstützt werden.

## ADR-007: Offline-first PWA

- **Status:** accepted
- **Datum:** 2026-11-09
- **Entscheidung:** Die App wird als installierbare PWA ausgeliefert. App-Shell und lokale Kartensätze werden durch einen Service Worker verfügbar gemacht.
- **Begründung:** Kernfunktionalität soll ohne Netzverbindung nutzbar bleiben.
- **Konsequenzen:** Update-Verhalten, Cache-Versionen und echte Offline-Szenarien werden in E2E-Tests geprüft.

## ADR-008: Providerunabhängige Kartengenerierung

- **Status:** accepted
- **Datum:** 2026-11-09
- **Entscheidung:** Ein Business-Port beschreibt die Kartengenerierung. Lokale Datensätze, Ollama und mögliche Cloud-Anbieter werden als austauschbare Adapter implementiert. Generierte Karten passieren vor Speicherung eine gemeinsame Validierungs- und Duplikatprüfung.
- **Begründung:** Der Kern bleibt unabhängig von Anbietern und ohne KI vollständig nutzbar.
- **Konsequenzen:** Provider-spezifische Datenmodelle dürfen die Infrastructure-Schicht nicht verlassen. Geheimnisse werden nicht im Frontend gespeichert.

## ADR-009: Testpyramide und Coverage-Grenzen

- **Status:** accepted
- **Datum:** 2026-11-09
- **Entscheidung:** Vitest prüft reine Logik und Integrationen, Testing Library prüft Komponenten aus Nutzersicht, Playwright prüft kritische Abläufe. CI erzwingt Line- und Branch-Coverage mit bereichsspezifischen Zielwerten.
- **Begründung:** Kritische Regeln erhalten schnelle, deterministische Tests. Wenige E2E-Tests sichern das Zusammenspiel.
- **Konsequenzen:** Kritische Spiellogik benötigt mindestens 95 % Line- und Branch-Coverage, Business insgesamt 90 %, Data und Infrastructure 80 %, UI 75 %. Functions und Statements verwenden dieselben bereichsspezifischen Grenzen. Bereiche ohne ausführbare Dateien werden als nicht anwendbar ausgewiesen, bis passende Dateien hinzukommen.

## ADR-010: Statische Bereitstellung über GitHub Pages

- **Status:** accepted
- **Datum:** 2026-11-09
- **Entscheidung:** Der Produktions-Build besteht aus statischen Assets und wird per GitHub Actions auf GitHub Pages veröffentlicht.
- **Begründung:** Die Bereitstellung ist für eine kostenlose clientseitige App geeignet.
- **Konsequenzen:** Routing und Vite-Base-Pfad müssen ohne Server-Fallback funktionieren. Dynamische Backend-Funktionen gehören nicht zum ersten lokalen Modus.

## ADR-011: Vorbereitung auf Online-Multiplayer

- **Status:** proposed
- **Datum:** 2026-11-09
- **Entscheidung:** Fachliche Aktionen sollen als klar definierte Ereignisse modelliert werden, ohne jetzt Netzwerktransport, Lobby oder Synchronisierung zu implementieren.
- **Begründung:** Ein späterer Online-Modus soll ergänzt werden können, ohne lokale Regeln neu zu schreiben.
- **Konsequenzen:** Transportprotokoll, Autorität, Konfliktlösung und Backend bleiben bewusst offen und werden erst nach gesonderter Freigabe entschieden.

## ADR-012: Projektname und erweiterter Spielumfang

- **Status:** accepted
- **Datum:** 2026-11-10
- **Entscheidung:** Das Projekt heißt GameHub. Der langfristige Produktumfang umfasst Partyspiele, Quiz-, Karten- und weitere Gesellschaftsspiele.
- **Begründung:** Der frühere Name PartyHub beschränkte die Wahrnehmung auf Partyspiele und passte nicht zu geplanten Karten- oder Brettspielvarianten.
- **Konsequenzen:** Gemeinsame Infrastruktur und Spielmodulverträge bleiben genreunabhängig. Tabu bleibt das erste Spiel, begrenzt aber weder Navigation noch Datenmodell oder spätere Erweiterungen.

## ADR-013: Spielauswahl als Einstieg und früher Modulvertrag

- **Status:** accepted
- **Datum:** 2026-11-10
- **Entscheidung:** GameHub startet immer mit einer Spielauswahl. Ein zentraler Spielkatalog registriert jedes Spiel über einen minimalen, genreunabhängigen Vertrag für Kennung, Übersetzungsschlüssel, Route und Verfügbarkeitsstatus. App-Shell, Startseite und Navigation beziehen Spiele ausschließlich aus diesem Katalog und enthalten keine fest eingebauten Verweise auf einzelne Spiele.
- **Begründung:** Weitere Spiele wie Karten-, Quiz- oder Brettspielvarianten sollen ohne Umbau der gemeinsamen Oberfläche ergänzt werden können. Die Erweiterbarkeit muss deshalb vor der ersten Tabu-Oberfläche feststehen.
- **Konsequenzen:** `PH-03-02` führt Spielauswahl, Katalog und Minimalvertrag ein. Jedes Spiel kapselt seine Business-Logik und UI. `PH-09-02` überprüft und erweitert den Vertrag später nur bei nachgewiesenem Bedarf.
