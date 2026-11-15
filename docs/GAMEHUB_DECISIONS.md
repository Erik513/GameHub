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

**Abgrenzung für Tabu:** Mitgelieferte Kartensätze werden als App-Daten verteilt und offline zwischengespeichert. IndexedDB enthält dauerhaft nutzbare eigene Karten in einem Tabu-spezifischen Speicherbereich. Globale Spracheinstellungen behalten ihren vorhandenen lokalen Speicher. Laufende Partien werden vorerst nicht dauerhaft gespeichert. Neue Spiele können eigene Speicherbereiche und Datenmodelle ergänzen.

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
- **Konsequenzen:** `Al-04-02` führt Spielauswahl, Katalog und Minimalvertrag ein. Jedes Spiel kapselt seine Business-Logik und UI. `Al-06-02` überprüft und erweitert den Vertrag später nur bei nachgewiesenem Bedarf.

## ADR-014: Zurückhaltende eigenständige Designsprache

- **Status:** accepted
- **Datum:** 2026-11-10
- **Entscheidung:** GameHub verwendet Dark Mode als primäre Designsprache mit tiefem Anthrazit, warmem hellem Text, gedämpftem Kobaltblau und sparsamem Korallakzent. Gemeinsame Tokens steuern Farben, Typografie, Abstände, Radien und Fokuszustände. Verläufe, großflächige Glaseffekte und rein dekorative Oberflächen werden vermieden.
- **Begründung:** Die Oberfläche soll zeitgemäß und spielerisch wirken, ohne wie ein austauschbares automatisch erzeugtes Landingpage-Design auszusehen.
- **Konsequenzen:** Neue gemeinsame Komponenten verwenden die zentralen Tokens. Einzelne Spiele dürfen eigene Akzente ergänzen, müssen aber Lesbarkeit, Fokusdarstellung und gemeinsame Grundkomponenten bewahren.

## ADR-015: Blaues Akzentfarbschema, Grün und Rot für Aktionen

- **Status:** accepted
- **Datum:** 2026-11-11
- **Entscheidung:** Das Kobaltblau ist die einzige Akzentfarbe. Der Korallakzent aus ADR-014 entfällt. Grün kennzeichnet bestätigende Aktionen (Starten, Richtig), Rot ablehnende oder gefährliche Aktionen (Verbotenes Wort, Bestätigung beim Beenden).
- **Begründung:** Der Auftraggeber wünscht ein einheitliches blaues Erscheinungsbild; Grün und Rot tragen eine feste Bedeutung.
- **Konsequenzen:** Neue Spiele verwenden dieselben Tokens und die gemeinsamen Button-Varianten `success` und `danger`.

## ADR-016: Tabu-Spielregeln für Karten, Reihenfolge, Pause und Stechen

- **Status:** accepted
- **Datum:** 2026-11-11
- **Entscheidung:** Jede Tabu-Karte hat genau vier verbotene Wörter, bei KI-Karten möglichst mit einem Oberbegriff. Karten dürfen in späteren Zügen wiederkehren, aber nie zweimal im selben Zug; ein Zug endet nur durch die Zeit. Die Teamreihenfolge wird je Partie einmal zufällig bestimmt. Überspringen ist pro Runde begrenzt (Standard 1). Eine laufende Runde lässt sich pausieren (Karte verdeckt, Zeit angehalten), neu starten (mit neuen Karten) oder beenden. Bei Gleichstand von zwei bis drei Teams folgt standardmäßig ein Stechen: drei Begriffe auf Zeit, Strafe 5 Sekunden, ein Überspringen, 90 Sekunden Limit. Es gewinnen die meisten Begriffe in der kürzesten Zeit; exakt gleiche Ergebnisse teilen den Sieg.
- **Begründung:** Spielfluss und Fairness am Tisch; Pause und Neustart dürfen kein Vorab-Sehen der Karten ermöglichen.
- **Konsequenzen:** Die Regeln liegen vollständig in der Business-Schicht (Zustandsmaschine und Kartenauswahl) und sind durch Tests abgesichert. Gespeicherte oder importierte Karten mit drei verbotenen Wörtern werden nicht mehr akzeptiert.

## ADR-017: Spielbausteine und Spielmodul-Vertrag

- **Status:** accepted
- **Datum:** 2026-11-11
- **Entscheidung:** Gemeinsame Spielbausteine liegen in `src/presentation/game-kit/`, genreunabhängige Logik in `src/business/shared/`. Jedes Spiel wird über ein `GameModule` (Kennung und Hauptfenster-Komponente) angeschlossen, das zum Katalogeintrag mit derselben Kennung gehört. Die App kennt Spiele nur über diesen Vertrag, spielspezifische Dienste werden im Kompositionspunkt `main.tsx` eingebaut. Die Texte jedes Spiels liegen in einer eigenen Datei je Sprache.
- **Begründung:** Neue Spiele und die Spielmodi aus `Ta-06-07` sollen sich um Kopfzeile, Navigation, Aktionsleiste, Zeitanzeige und Handy-Layout nicht kümmern müssen. Der Auftraggeber hat Option B (moderater Umbau) freigegeben.
- **Konsequenzen:** Erweitert ADR-013. Eine allgemeine Spiel-Engine wird bewusst nicht gebaut, bevor ein zweites Spiel sie braucht. Offen: eigene CSS-Datei je Spiel und Hooks für die Tabu-Zustandslogik (`Ta-05-06`).

## ADR-018: KI nur am Rechner (Ollama), nicht im Browser

- **Status:** accepted
- **Datum:** 2026-11-12
- **Entscheidung:** KI-Funktionen (Kartenerzeugung; der Wortvorschlags-Knopf wurde wieder entfernt) nutzen ausschließlich ein lokal laufendes Programm am selben Rechner, das über `127.0.0.1` angesprochen wird (Ollama). Es wird kein Modell im Browser ausgeführt und kein Online-Dienst (auch nicht Wikipedia) für Vorschläge genutzt.
- **Begründung:** Ein kleines Browser-Modell (Qwen2.5-0.5B) lieferte im Test kaum brauchbare Wörter, besonders auf Deutsch; größere Modelle sind für Handys zu schwer. Online-Dienste scheiden wegen Kosten, Schlüsseln und Datenabfluss aus (AGENTS.md); die Wikipedia-Variante hat der Auftraggeber abgelehnt.
- **Konsequenzen:** Am Handy gibt es keine KI, mitgelieferte und eigene Karten bleiben voll nutzbar. Die Anbieter bleiben austauschbare Adapter hinter den Business-Ports (ADR-008-Linie). LM Studio wurde kurz ergänzt und auf Wunsch des Auftraggebers wieder entfernt, weil er es nicht beauftragt hatte; es kann später gesondert beauftragt werden.

## ADR-019: Kartenpakete je Sprache und Kategorienamen aus den Daten

- **Status:** accepted
- **Datum:** 2026-11-12
- **Entscheidung:** Der große Kartenpool wird als Paket je Sprache (`gamehub-taboo-pack`, Version 1) mit Kategorien und Karten ausgeliefert und als eigener Teil der App per dynamischem Import geladen. Die 45 Karten im Code bleiben als Rückfall. Kategorienamen (Deutsch und Englisch) stehen in den Daten statt in den Übersetzungsressourcen; die drei Kategorien der Rückfallkarten bleiben immer sichtbar, weitere erst mit Karten.
- **Begründung:** Neue Kategorien und Karten sollen ohne Codeänderung dazukommen (`docs/GAMEHUB_CARD_POOL.md`); die KI am Handy ist nicht möglich (`ADR-018`). Der Auftraggeber hat die Planung und `Ta-09-02` freigegeben.
- **Konsequenzen:** Der Offline-Speicher lädt die Pakete beim Installieren mit; bei sehr großen Paketen (ab etwa 20.000 Karten je Sprache) wäre ein Nachladen je Kategorie zu prüfen. Ein beschädigtes Paket wird ganz abgelehnt. Die Kategorienamen sind an die Pakete gebunden, nicht an die Oberflächensprache; Namen eigener Kategorien bleiben die vom Spieler getippten Texte.

## ADR-020: Gemeinsame Bausteine für Teams, Spieler und Einstellungen

- **Status:** accepted
- **Datum:** 2026-11-12
- **Entscheidung:** Teams, Spieler und der Rahmen des Setups (Abschnitte, Werkzeugleiste oben rechts, Startleiste) werden als wiederverwendbare Bausteine im `game-kit` gebaut: `SetupScreen`, `SetupSection`, `TeamsSetup` (gesteuert, liefert Teams mit Spielern) und `PlayersSetup` (nur Spielerliste). Die reine Logik (`buildTeams`, `TeamRules`, Validierung) liegt in `src/business/shared/`, Texte in einer gemeinsamen Datei `kit.ts` je Sprache, Stile im `game-kit`. Spieleinstellungen bleiben Formularfelder des Spiels (`ChoiceGroup`, `InfoButton`), es gibt kein Einstellungs-Schema. Das Merken von Teams und Spielern zwischen Spielen folgt später (`Al-09-03`).
- **Begründung:** Teams, Spieler und Einstellungen werden in jedem Spiel gebraucht; der Auftraggeber will dieselbe Ansicht für alle Spiele. Spielerzuordnungen sollen ins Spiel gelangen können.
- **Konsequenzen:** Erweitert ADR-017. Tabu wird verhaltensgleich umgestellt; die zugänglichen Namen bleiben gleich, damit Tests stabil bleiben. Das PC-Layout (Phase Al-08) wird in `SetupScreen` gebündelt.

## ADR-021: Feste Ansichten und Oberflächenregeln für alle Spiele

- **Status:** accepted
- **Datum:** 2026-11-12
- **Entscheidung:** Jedes Spiel besteht aus einem Hauptmenü (Kopfleiste mit dem Spielnamen links (ohne Farbpunkt) und rechts den Knöpfen Spieler, Einstellungen und ganz rechts Home (geändert am 2026-11-13); Spielregeln als Knopf im Feld Spieleinstellungen und optional der Editor als Knopf im Feld der Inhalte (geändert am 2026-11-13, keine Werkzeugleiste mehr), jeder Spielmodus mit eigenen Regeln hinter einem Infoknopf; Felder „Teams und Spieler“ und „Spieleinstellungen“; Starten fest unten), den Spielansichten Zwischenstand, eigentliches Spiel und Endstand sowie einem einzigen Infofenster (Überschrift links, Schließen rechts, Inhalt darunter). In Unteransichten zeigt die Kopfleiste nur interne Navigation oder „Spiel beenden“, nie Home oder Spracheinstellungen. Alle Bedienelemente sehen in jedem Spiel gleich aus und folgen einem Theme; eine spielbezogene Sekundärfarbe ist später möglich. Wenige Eingabefelder. Knöpfe: einheitlich bis auf eingetragene Ausnahmen; Löschen, Entfernen und Abbrechen rot; Hinzufügen und Starten grün; unwiderrufliche Aktionen mit fester Bestätigung (`ConfirmButton`); spielentscheidende Knöpfe unten; Knöpfe sind platzsparend und zeigen nur ein Symbol, wenn es selbsterklärend ist. Details in `docs/GAMEHUB_UI_RULES.md`.
- **Begründung:** Der Auftraggeber will, dass alle Spiele gleich aussehen und gleich bedient werden und dass neue Spiele keine eigenen Oberflächenmuster erfinden.
- **Konsequenzen:** Erweitert ADR-017 und ADR-020. Neue Bausteine `ActionRow`, `ScoreScreen` (Zwischen- und Endstand) und `ManageScreen` im `game-kit`; `SetupScreen` ist das Hauptmenü und hat die Plätze `rules` und `editor` (Aufgabe `Al-09-05`, erledigt); Tabu wurde verhaltensgleich umgestellt, nur „Abbrechen“ ist jetzt rot. Weitere Ansichtstypen oder Ausnahmen brauchen die Zustimmung des Auftraggebers und einen Eintrag in den Regeln.

## ADR-022: Spielerverwaltung für alle Spiele

- **Status:** accepted
- **Datum:** 2026-11-12
- **Entscheidung:** Es gibt eine gemeinsame, dauerhaft gespeicherte Spielerliste. Sie wird in einem Fenster „Spieler“ gepflegt (hinzufügen, löschen), das aus der Kopfleiste des GameHub (Knopf mit Symbol und Text) und aus dem Hauptmenü jedes Spiels geöffnet wird. Der Knopf „Spieler“ steht in der Werkzeugleiste des Hauptmenüs neben Spielregeln und Editor; die Kopfleiste bleibt bei Einstellungen und Home. In einem Spiel wählt der Spieler im Feld „Teams und Spieler“ über „Aus Spielerliste wählen“, wer mitspielt; danach folgt die Verteilung auf Teams wie bisher. „Letzte Gruppe laden“ (`Al-09-03`) bleibt. Speicherung: lokaler Browserspeicher hinter dem Port `PlayerRosterStore`.
- **Begründung:** Spieler sollen nicht in jedem Spiel neu getippt werden müssen; die Pflege soll an einem Ort für alle Spiele geschehen.
- **Konsequenzen:** Erweitert ADR-020 und ADR-021: Die Werkzeugleiste des Hauptmenüs bekommt einen festen Platz „Spieler“ (jedes Spiel hat ihn automatisch); `docs/GAMEHUB_UI_RULES.md` wird ergänzt. Neue Bausteine im `game-kit`: Fenster und Knopf der Spielerverwaltung und die Auswahl aus der Liste.

## ADR-023: Aufstellung der Teams nach dem Start

- **Status:** accepted
- **Datum:** 2026-11-13
- **Entscheidung:** Das Hauptmenü eines Spiels enthält kein Feld „Teams und Spieler“ mehr (ändert ADR-021). Nach „Starten“ folgt die Ansicht **Aufstellung**: Teams, Spieler und Zuweisung festlegen (Teamanzahl, Namen, Reihenfolge, Spielerliste mit Auswahl aus der gespeicherten Spielerliste, Zuweisung von Hand oder per Knopf zufällig). Erst ihr Knopf „Spiel starten“ (fest unten) bereitet die Karten vor und startet das Spiel. Am Spielende führt „Mit gleicher Konfiguration neu spielen“ in die Aufstellung (die Teams sind vorbelegt, Einstellungen und Karten bleiben); im Endstand selbst wird nichts gelost oder verteilt. Die Aufstellung ist ein Baustein im `game-kit` (`LineupScreen`) für alle Spiele.
- **Begründung:** Einstellungen ändern sich selten, die Aufstellung bei jeder Runde. Wer mit denselben Einstellungen noch einmal spielt, kann die Teams neu mischen, ohne das Hauptmenü zu verändern; die Spielerliste passt natürlich in die Aufstellung.
- **Konsequenzen:** Die Kartenvorbereitung (auch das Nachladen durch die lokale KI) und die Prüfung auf genügend Karten wandern vom Hauptmenü in den Start der Aufstellung, weil erst dort die Teamzahl feststeht. Der Start besteht aus zwei Schritten; die Aufstellung ist wie der Rest des Setups ein Teil der Unteransichten (Kopfleiste mit Zurück). `buildTeams` und die Spiellogik bleiben unverändert.

## ADR-024: Kartenquelle KI vorerst abgeschaltet

- **Status:** accepted
- **Datum:** 2026-11-13
- **Entscheidung:** Die Auswahl „Kartenquelle“ (nur lokal, nur KI, beides) erscheint vorerst nicht mehr. Es werden nur die mitgelieferten Karten (Pool und Standardkarten) und die eigenen Karten des Spielers gespielt. Die App verdrahtet keinen Kartengenerator mehr.
- **Begründung:** Die KI-Quelle wirkte beim Auftraggeber nicht: Sie kennt nur Ollama (ADR-018), er nutzt LM Studio, und ohne Ollama bot sie nur eine kleine feste Liste von 18 Karten, also keine echte KI. Eine Auswahl, die nichts bewirkt, verwirrt.
- **Konsequenzen:** Die Bausteine bleiben im Code, aber ungenutzt: Ports und Prüfung (`cardGenerator`, `validateGeneratedCards`, `cardPlan`), die Adapter (`ollamaTabooCardGenerator`, `localTabooCardGenerator`, `tabooLocalCandidates`), `TabooGeneration` und `useTabooRefill`. Sie werden wieder angeschlossen (Aufgabe `Al-10-03`), wenn der Auftraggeber eine KI-Quelle will; dann ist zu entscheiden, welcher Anbieter dafür gilt (Ollama oder LM Studio). Das Spiel selbst bleibt ohne Internet und ohne KI voll spielbar (AGENTS.md).

## ADR-025: Konfigurierbare Aufstellung mit getrennten Boxen „Spieler“ und „Teams“

- **Status:** accepted
- **Datum:** 2026-11-14
- **Entscheidung:** Die Aufstellung (ADR-023) besteht aus zwei getrennten, aufklappbaren Boxen: **Spieler** (Namen hinzufügen, aus der Spielerliste wählen) und **Teams** (Teamanzahl, Namen, „Ohne Team“, Teamboxen, zufällig verteilen, Teamreihenfolge). Jedes Spiel beschreibt seine Aufstellung einmal in einer `LineupConfig`: `players: "off" | "optional" | "required"` mit `minPlayers` und `maxPlayers`, und `teams: "off"` oder die `TeamRules` des Spiels. Der Baustein `LineupSetup` zeigt nur, was das Spiel braucht: Spiele ohne Teams (jeder gegen jeden) zeigen nur „Spieler“, Spiele ohne Namen nur „Teams“, Tabu beides, wobei „Spieler“ eingeklappt ist, weil Tabu die Namen nicht braucht. Die Startregeln stehen als reine Prüfung `validateLineup` in `business/shared/lineup.ts` (zu wenige oder zu viele Spieler; Spieler ohne Team je nach `unassignedPlayers`: `ignore`, `assign` (Standard) oder `block`) und `resolveLineup` (verteilt bei `assign` auf die kleinsten Teams); Tabu nutzt `ignore`. Spieler kommen per Drag and Drop in ein Team oder per Tipp, der die Teamwahl öffnet (2026-11-14). Die Teamreihenfolge ist seit 2026-11-14 eine konkrete Liste (`TeamSetupValue.order`, leer = Team 1, 2, 3 …), die in der Aufstellung per Drag and Drop am Griff (feste Plätze untereinander), „Zufällig“ und „Standard“ gesetzt wird; die Zufallsauslosung beim Start entfällt.
- **Begründung:** Spielernamen sind in Tabu nur Anzeige, andere Spiele brauchen keine Teams. Die Ansicht wird in jedem Spiel gebraucht und soll deshalb ohne eigenen Aufbau pro Spiel konfigurierbar sein (Wunsch des Auftraggebers vom 2026-11-14).
- **Konsequenzen:** Erweitert ADR-023. Neu: `LineupConfig`, `validateLineup`, `LineupSetup`, `SetupSection` mit `summary`; `TeamsSetup` und `PlayersSetup` sind die Inhalte der beiden Boxen (`TeamsSetup` hat `withPlayers` statt `players`, das Hinzufügen von Spielern liegt in `PlayersSetup`); Tabu hat `tabooLineup`. „Spieler ohne Team“ verhindert jetzt den Start (Meldung als Hinweis unten). Der Wert (`TeamSetupValue`) bleibt unverändert, ein Spiel ohne Teams liest die Spieler aus `playersText`. Jede Box lädt ihren Teil der gemerkten Gruppe ; die Box „Teams“ hat einen Knopf zum Leeren neben „Letzte Teams laden“ (immer sichtbar, bei Bedarf gesperrt). Am 2026-11-14 nach dem Muster „Auslosen und Ergebnis“ vereinfacht: Die Spielerliste ist nur eine Liste; die Box „Teams“ losst die Spieler aus und zeigt Teamkarten, ein Tipp auf einen Namen öffnet die Teamwahl (kein Ziehen).

## ADR-026: Reiter wie im Browser statt aufklappbarer Kapitel

- **Status:** accepted
- **Datum:** 2026-11-14
- **Entscheidung:** Die Bereiche einer Ansicht (Aufstellung: „Spieler“ und „Teams“; Hauptmenü von Tabu: „Spieleinstellungen“ und „Karten“) sind **Reiter** (`SetupTabs` im `game-kit`) statt zweier aufklappbarer Kapitel: oben eine Reihe gleich breiter Reiter, darunter der Inhalt des gewählten Reiters in einer mit ihm verbundenen Box. Die Reiter haben die Rollen `tablist`, `tab` und `tabpanel`; Tipp, Pfeiltasten, Pos1 und Ende wechseln. **Alle Reiter bleiben im Formular** (die nicht gezeigten sind nur per Stil ausgeblendet), damit das Formular sie weiter liest. Ein Reiter kann von außen gewählt werden (`selected`, `onSelect`), zum Beispiel öffnet ein fehlender Kategorie-Eintrag den Reiter „Karten“. Die **Spielregeln sind ein eigener Reiter „Regeln“** (Nachtrag 2026-11-15, `RulesView`): bei Tabu „Einstellungen | Karten | Regeln"; das Regelfenster (`RulesDialog`, `RulesButton`) entfällt. Die Aufstellung zeigt die Anzahl im Reiter („Spieler (4)“); vorausgewählt ist „Spieler“ bei Pflicht-Spielern, sonst „Teams“.
- **Begründung:** Wunsch des Auftraggebers (2026-11-14): Meist ist dann alles auf einer Seite und man muss nicht scrollen; es soll sich wie ein Reiter-System im Browser anfühlen. Nach Apples Richtlinien ist ein Umschalter für eng verwandte Ansichten der Zweck eines Segmented Controls bzw. von Reitern, nicht für Aktionen.
- **Konsequenzen:** Ersetzt in `LineupSetup` und `TabooSetupForm` die `SetupSection`s; `SetupSection` bleibt für die Datenansicht (Editor, `ManageScreen`). Erweitert ADR-021 und ADR-025. Tests und e2e wählen den Reiter vor dem Zugriff (`getByRole("tab")`); in den Unit-Tests sind nicht gezeigte Reiter wegen fehlender Stile sichtbar, deshalb prüfen dort `data-active` und `aria-selected` die Auswahl, die e2e-Tests prüfen die echte Sichtbarkeit.
