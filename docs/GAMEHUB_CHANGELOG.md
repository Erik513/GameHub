# GameHub Changelog

Alle wichtigen Projektänderungen werden in dieser Datei dokumentiert.

## 2026-11-10

### PH-05-02 – Laufende Runde und Timer

- Tabu-Runde mit Countdown, Team, Punkten, Begriff und drei verbotenen Wörtern ergänzt.
- Kartenaktionen werten die aktuelle Karte. Beim Zeitablauf endet die Runde automatisch.
- Kleinen deutschen und englischen Beispielsatz für die laufende Runde ergänzt.
- 99 Tests bestanden. Neue Browserprüfung auf Desktop und Mobil erfolgreich.

### PH-05-01 – Tabu-Spielkonfiguration

- Formular für Teams, Rundenzahl, Rundendauer, Kartensprache, Kategorien und Schwierigkeit ergänzt.
- Fehler in Deutsch und Englisch angezeigt. Gültige Angaben erzeugen den Vorbereitungszustand der Partie.
- 98 Tests bestanden, darunter Formularvalidierung und Vorbereitung in beiden Sprachen.

### PH-04-05 – Kartenfilter und Deckbildung

- Karten nach Sprache, Kategorie und Schwierigkeit filtern und mit austauschbarer Zufallsquelle mischen.
- Doppelte Kartenkennungen und bereits gespielte Karten ausschließen. Leere und zu kleine Decks gesondert melden.
- 96 Tests bestanden. Die Tabu-Kernlogik ist abgeschlossen.

### PH-04-04 – Rundenfolge und Siegerermittlung

- Spielende nach der konfigurierten Zahl von Runden pro Team geprüft.
- Alle Teams mit Höchstpunktzahl werden in der Reihenfolge der Teamliste als Sieger ausgewiesen.
- 88 Tests bestanden, darunter Partien mit zwei und drei Teams, Einzelsieg und Gleichstand.

### PH-04-03 – Kartenaktionen und Punkte

- Richtige Antworten zählen einen Punkt. Überspringen und verbotene Wörter zählen null Punkte.
- Jede gewertete Karte wird für die restliche Partie gesperrt. Nach der letzten Karte endet die Runde.
- 87 Tests bestanden, darunter alle Kartenaktionen und Wiederholungsversuche.

### PH-04-02 – Zustandsmaschine und Übergänge

- Tabu-Zustandsmaschine für Vorbereitung, laufende Runde, Rundenende und Spielende ergänzt.
- Ungültige Übergänge, Karten in der falschen Sprache und verspätete Rundenende-Ereignisse werden abgewiesen.
- Vollständige Partie mit drei Teams und zwei Runden geprüft; insgesamt 86 Tests bestanden.

### PH-04-01 – Tabu-Domänenmodell und Validierung

- Unabhängige fachliche Typen für Teams, Kategorien, Schwierigkeit, Karten und Spielkonfiguration ergänzt.
- Mindestens zwei eindeutig benannte Teams, positive ganzzahlige Rundendauer und Rundenzahl sowie deutsche oder englische Sprachmetadaten geprüft.
- Exakt drei unterschiedliche, nichtleere verbotene Wörter erzwungen; der gesuchte Begriff darf nicht darunter sein.
- Unicode und Leerzeichen normalisiert; strukturierte Fehlercodes für spätere lokalisierte Anzeigen bereitgestellt.
- 83 Tests bestanden, davon 26 neue Domänenfälle; neue Spiellogik mit 100 % Zeilen- und Verzweigungsabdeckung.

### PH-03-03 – Einstellungen und Statusmeldungen

- Lokalisierten Einstellungsdialog für getrennte Oberflächen- und Kartensprachen ergänzt.
- Zugängliche Lade-, Fehler-, Erfolgs- und Leerzustände erstellt.
- 57 Tests und zehn Desktop-/Mobil-Browserprüfungen erfolgreich ausgeführt.

### PH-03-02 – App-Shell, Spielkatalog und Navigation

- Responsive App-Shell mit GameHub-Marke, Hauptnavigation und dauerhaft erreichbaren Spracheinstellungen erstellt.
- Verpflichtende Spielauswahl als Startseite umgesetzt; kein Spiel startet automatisch.
- Genreunabhängigen Spielmodulvertrag für ID, Route, Übersetzungsschlüssel, Status und visuellen Akzent eingeführt.
- Zentralen Katalog mit Tabu-Entwicklungsvorschau sowie geplanten Karten-, Scharade-, Quiz- und „Wer bin ich?“-Modulen angelegt.
- Statisches Hash-Routing für GitHub-Pages-kompatible Navigation zwischen Spielauswahl und Vorschau umgesetzt.
- Geplante Spiele klar gekennzeichnet und deaktiviert; Tabu öffnet eine Entwicklungsvorschau ohne Spielfunktion vorzutäuschen.
- 52 Tests und acht Desktop-/Mobil-E2E-Fälle erfolgreich ausgeführt.
- Zusätzliche sichtbare Browserprüfung war wegen ausgeschöpftem Browser-Kontingent nicht verfügbar; responsive Darstellung und Navigation wurden durch Playwright verifiziert.


### PH-03-01 – Design-Tokens und Basiskomponenten

- Zurückhaltende GameHub-Designrichtung mit primärem Dark Mode, tiefem Anthrazit, warmem hellem Text, Kobaltblau und gezieltem Korallakzent umgesetzt.
- Zentrale Tokens für Farben, Typografie, Abstände, Radien, Schatten, Kontrollgrößen und Inhaltsbreiten angelegt.
- Wiederverwendbare Komponenten für Buttons, Eingabefelder, Karten und Dialoge erstellt.
- Tastaturfokus, deaktivierte Zustände, Fehlerbeschreibungen, Dialogfokus und Escape-Schließen zugänglich umgesetzt.
- Startansicht ohne Verläufe und Glaseffekte auf das neue Designsystem umgestellt.
- Desktopansicht und 320-Pixel-Mobilansicht im Browser geprüft; kein horizontales Scrollen festgestellt.
- 43 Tests erfolgreich; Basiskomponenten erreichen 100 % Zeilen- und 96,29 % Verzweigungsabdeckung.
- Primäre Farb-Tokens nach Nutzerpräferenz vollständig auf Dark Mode umgestellt; Formensprache, Kontraste und Komponentenstruktur beibehalten.


### PH-02-04 – Übersetzungsparität prüfen

- Rekursive Prüfung für identische Schlüsselstrukturen in deutschen und englischen Übersetzungsressourcen ergänzt.
- Leere, ausschließlich aus Leerzeichen bestehende und ungültige Nicht-Text-Werte werden abgewiesen.
- Positive Prüfung der echten Ressourcen sowie negative Fälle für fehlende, zusätzliche, leere und ungültige Werte umgesetzt.
- Eigenen Befehl `pnpm check:translations` ergänzt und als verpflichtenden Schritt in GitHub Actions aufgenommen.
- i18n-Dateien in die Coverage-Messung und bereichsspezifische Mindestgrenze aufgenommen.
- 35 Tests erfolgreich; Phase 2 ist damit vollständig abgeschlossen.

### PH-02-03 – Unabhängige Kartensprache

- Reines Business-Modell für unabhängige UI- und Kartensprache ergänzt.
- Alle vier Kombinationen aus Deutsch und Englisch sowie unabhängige Änderungen beider Werte getestet.
- Kartensprache als eigene, lokalisierte Auswahl in die Startansicht aufgenommen.
- UI- und Kartensprache unter getrennten localStorage-Schlüsseln gespeichert.
- Gespeicherte Kartensprache beim App-Start wiederhergestellt; ohne gespeicherten Wert wird einmalig die initiale UI-Sprache übernommen.
- 29 Unit-, Infrastruktur- und Komponententests sowie sechs E2E-Fälle in Desktop- und Mobilprofilen erfolgreich ausgeführt.

### PH-02-02 – Erkennung, Auswahl und Persistenz der UI-Sprache

- Gespeicherte UI-Sprache vor der Browsersprache priorisiert und Englisch als kontrollierten Fallback beibehalten.
- Sprachvarianten wie `de-DE` und `en-US` auf die unterstützten Sprachen normalisiert.
- Zugängliche Sprachwahl für Deutsch und Englisch in die Startansicht integriert.
- Speicher-Port von einem fehlertoleranten localStorage-Adapter getrennt und im Composition Root verdrahtet.
- Sprachwechsel dauerhaft gespeichert und beim Neuladen vor dem ersten Rendern wiederhergestellt.
- 19 Unit-, Infrastruktur- und Komponententests sowie vier E2E-Fälle in Desktop- und Mobilprofilen erfolgreich ausgeführt.

### Erweiterbare Spielauswahl verbindlich geplant

- App-Start mit verpflichtender Spielauswahl als dauerhafte Produktanforderung festgelegt.
- Zentralen, genreunabhängigen Spielkatalog als einzige Quelle für verfügbare und geplante Spiele beschlossen.
- Minimalen Spielmodulvertrag für Kennung, Übersetzungsschlüssel, Route und Verfügbarkeitsstatus nach `PH-03-02` vorgezogen.
- `PH-09-02` auf eine spätere, bedarfsgesteuerte Überprüfung und Erweiterung des frühen Vertrags ausgerichtet.
- ADR-013 und verbindliche Arbeitsregeln ergänzt, damit Shell und Navigation keine einzelnen Spiele fest einbauen.

### PH-02-01 – i18n-Grundkonfiguration

- `i18next` und `react-i18next` als Laufzeitabhängigkeiten eingerichtet.
- Gemeinsamen Übersetzungsnamensraum mit deutschen und englischen Ressourcen angelegt.
- Englisch als kontrollierte Fallback-Sprache und Deutsch sowie Englisch als unterstützte Sprachen definiert.
- i18next-Typen um die GameHub-Ressourcenstruktur erweitert, sodass Übersetzungsschlüssel statisch geprüft werden.
- Sämtliche sichtbaren Texte der Startansicht aus den React-Komponenten in Übersetzungsressourcen verschoben.
- Initialisierung und Darstellung der Startansicht in beiden Sprachen mit sieben erfolgreichen Tests geprüft.
- Sprachregeln für deutsches Entwicklungs-Dashboard sowie englischen Quellcode und englische Code-Kommentare verbindlich dokumentiert.

### PH-01-06 – GitHub-Actions-Qualitätsworkflow abgeschlossen

- Lokales Repository mit `https://github.com/Erik513/GameHub` verbunden und vollständigen Projektstand auf `main` veröffentlicht.
- Vorhandenen GitHub-Initialisierungscommit ohne Überschreiben in die gemeinsame Historie aufgenommen.
- Ersten gehosteten Workflowlauf `42850423012` erfolgreich abgeschlossen.
- Quality-Job mit Format, Lint, Typecheck, Architekturprüfung, Coverage und Build erfolgreich ausgeführt.
- Playwright-E2E-Job mit Desktop- und Mobilprofil erfolgreich ausgeführt.
- `PH-01-06` abgeschlossen; Phase 1 ist damit vollständig erledigt.

### Umbenennung in GameHub

- Projektordner von `PartyHub` in `GameHub` umbenannt.
- Paketname, React-Komponenten, Business-Typen, Tests, E2E-Prüfungen, Dashboard und sämtliche Dokumentation auf `GameHub` umgestellt.
- Dokumentationsdateien von `PARTYHUB_*` in `GAMEHUB_*` umbenannt.
- Produktbeschreibung für Party-, Quiz-, Karten- und weitere Gesellschaftsspiele geöffnet.
- pnpm-Abhängigkeiten am neuen Repository-Pfad vollständig neu verknüpft.

## 2026-11-09

### PH-01-06 – GitHub-Actions-Qualitätsworkflow

- GitHub-Actions-Workflow für Pushes, Pull Requests und manuelle Ausführung erstellt.
- Offizielle Actions `actions/checkout@v7`, `pnpm/setup@v1` und `actions/upload-artifact@v7` verwendet.
- Node.js 24, pnpm 11.25.0, Dependency-Cache und Installation mit eingefrorenem Lockfile konfiguriert.
- Quality-Job für Format, Lint, Typecheck, Architekturprüfung, Vitest-Coverage und Produktions-Build eingerichtet.
- Separaten Playwright-Job mit gebündeltem Chromium sowie Diagnoseartefakten bei Fehlern eingerichtet.
- Playwright verwendet lokal installiertes Chrome und in CI das gebündelte Chromium.
- YAML-Format, alle Workflow-Befehle, beide lokalen E2E-Profile und die CI-Projektauflösung erfolgreich geprüft.
- Aufgabe bleibt blockiert, bis ein GitHub-Remote verbunden und der erste gehostete Workflow erfolgreich ausgeführt wurde.

### PH-01-05 – Playwright-Grundkonfiguration

- Playwright Test 1.65.0 eingerichtet.
- Desktop-Chromium- und Mobile-Chromium-Profil auf Basis des lokal installierten Chrome konfiguriert.
- Automatischen Vite-Webserver für E2E-Läufe eingebunden.
- Screenshots nur bei Fehlern sowie Video und Trace zur Fehlerdiagnose konfiguriert.
- Smoke-Test für Titel, Hauptüberschrift und Architekturliste ergänzt.
- Zwei reguläre Smoke-Tests in Desktop- und Mobilprofil erfolgreich ausgeführt.
- Kontrollierter Fehltest erzeugte Screenshot, Video und Trace wie vorgesehen. Temporärer Test und seine Artefakte wurden anschließend entfernt.
- Installation des gebündelten Chromium-Browsers wegen zu wenig freiem Speicher abgebrochen. Das bereits installierte Chrome wird erfolgreich verwendet.
- Vitest-Coverage, Lint, Formatprüfung, Typecheck, Architekturtest, Produktions-Build und Peer-Prüfung erneut erfolgreich ausgeführt.

### PH-01-04 – Coverage und Bereichsgrenzen

- V8-Coverage-Provider passend zu Vitest 5.1.0 eingerichtet.
- Text-, JSON-, JSON-Summary-, HTML- und LCOV-Berichte konfiguriert.
- Line-, Branch-, Function- und Statement-Grenzen festgelegt. Kritische Spiellogik 95 %, Business 90 %, Data/Infrastructure 80 % und Presentation/App 75 %.
- Dritten Komponententest für den Composition Root ergänzt.
- Positiver Coverage-Lauf mit drei bestandenen Tests und 100 % auf allen aktuell ausführbaren Dateien erfolgreich.
- Kontrollierter Negativtest unterschritt die globale und UI-spezifische Grenze und ließ den Coverage-Befehl erwartungsgemäß fehlschlagen.
- Lint, Formatprüfung, Typecheck, Architekturtest, Produktions-Build und Peer-Prüfung erneut erfolgreich ausgeführt.

### PH-01-03 – Vitest und Testing Library

- Dashboard-Zustandsspeicherung von flüchtigem Session Storage auf dauerhaftes Local Storage umgestellt. Klappzustände werden bei jeder Änderung und die Scrollposition beim Scrollen beziehungsweise Verlassen gespeichert.
- Vitest 5.1.0 mit jsdom-Testumgebung und zentralem Setup eingerichtet.
- Testing Library für React, DOM, jest-dom-Matcher und user-event installiert.
- Explizites DOM-Cleanup nach jedem Test eingerichtet.
- Neutralen Business-Unit-Test und Komponententest der Startansicht ergänzt.
- CI-Testlauf und Watch-Einstieg erfolgreich geprüft. Zwei von zwei Tests bestehen.
- Dashboard-Anzeige „Stand“ auf die tatsächliche 20-Sekunden-Prüfzeit umgestellt und den Projekt-Datenstand separat ausgewiesen.
- Lint, Formatprüfung, Typecheck, Architekturtest, Produktions-Build und Peer-Prüfung erneut erfolgreich ausgeführt.

### PH-01-02 – Linting und Formatierung

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

### PH-01-01 – Vite-Grundprojekt und Schichtenstruktur

- React 19.3.1, React DOM 19.3.1, TypeScript 7.0.2 und Vite 8.3.6 mit pnpm eingerichtet.
- Strikte TypeScript-Projektkonfiguration und Vite-Composition-Root angelegt.
- Verzeichnisse für Presentation, Business, Data, Infrastructure, i18n und App-Verdrahtung erstellt.
- Neutralen, responsiven GameHub-Startbildschirm umgesetzt.
- Automatische Prüfung der Business-Schicht gegen äußere Abhängigkeiten ergänzt.
- Typecheck, Architekturprüfung, Produktions-Build und Entwicklungsserver-Smoke-Test erfolgreich ausgeführt.

### Projektvorbereitung

- `PH-01-01` gestartet und Projektstatus auf `in_progress` gesetzt.
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
