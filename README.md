# GameHub

[GameHub im Browser öffnen](https://erik513.github.io/GameHub/)

GameHub ist eine geplante kostenlose, international ausgerichtete, mobile-first Spielesammlung. Die Progressive Web App soll Partyspiele, Quiz-, Karten- und weitere Gesellschaftsspiele auf Smartphones, Tablets und PCs bündeln, offline spielbar sein und über GitHub Pages veröffentlicht werden können. Der Einstieg erfolgt immer über eine Spielauswahl; neue Spiele werden als eigenständige Module in einem zentralen Spielkatalog registriert.

Tabu ist lokal spielbar. GameHub enthält deutsche und englische Standardkarten und kann eigene Tabu-Karten lokal speichern. Ein Produktionsbuild unterstützt nach dem ersten Online-Aufruf den Offlinebetrieb.

## Geplanter Technologie-Stack

- React, TypeScript und Vite
- Drei-Schichten-Architektur aus Presentation, Business und Data
- Separate Infrastructure-Schicht für externe Dienste
- IndexedDB für lokale Speicherung
- i18next und react-i18next
- Vitest, Testing Library und Playwright
- PWA mit Manifest und Service Worker
- GitHub Actions für automatisierte Qualitätsprüfungen

## Projektdokumentation

- [Projektplan](docs/GAMEHUB_PROJECT_PLAN.md)
- [Entwicklungs-Dashboard](docs/GAMEHUB_DEVELOPMENT.html)
- [Maschinenlesbarer Status](docs/GAMEHUB_STATUS.json)
- [Änderungsprotokoll](docs/GAMEHUB_CHANGELOG.md)
- [Architekturentscheidungen](docs/GAMEHUB_DECISIONS.md)
- [Arbeitsregeln](AGENTS.md)

## Entwicklungsstatus

Der tatsächliche Fortschritt wird aus den Aufgabenstatus in `docs/GAMEHUB_STATUS.json` berechnet. Das Dashboard lädt diese Datei alle 20 Sekunden neu.

## Lokale Voraussetzungen

Für die Implementierung werden Node.js und ein kompatibler Paketmanager benötigt. Bei der ersten Umgebungsprüfung war Node.js 24.22.1 vorhanden, `npm` jedoch nicht über den aktuellen PATH erreichbar. Git 2.55.0 war vorhanden. Ein Git-Repository war noch nicht initialisiert.

## Lokale Entwicklung

```powershell
pnpm install
pnpm dev
```

Verfügbare Prüfungen:

```powershell
pnpm typecheck
pnpm test:architecture
pnpm lint
pnpm format:check
pnpm test
pnpm test:watch
pnpm test:coverage
pnpm test:e2e
pnpm build
```

Der Workflow `.github/workflows/quality.yml` führt dieselben Prüfungen auf GitHub Actions aus. Der erste gehostete Lauf wurde am 10. November 2026 erfolgreich abgeschlossen.

## Offlinebetrieb lokal prüfen

```powershell
pnpm build
pnpm preview
```

Öffne die angezeigte Adresse einmal online. Sobald der Service Worker aktiv ist, kannst du die Seite offline neu laden und Tabu starten. Unterstützte Browser bieten die Installation über ihr Menü an. Der Entwicklungsserver registriert keinen Service Worker.
