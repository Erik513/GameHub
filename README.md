# GameHub

GameHub ist eine geplante kostenlose, international ausgerichtete, mobile-first Spielesammlung. Die Progressive Web App soll Partyspiele, Quiz-, Karten- und weitere Gesellschaftsspiele auf Smartphones, Tablets und PCs bündeln, offline spielbar sein und über GitHub Pages veröffentlicht werden können.

Das React-TypeScript-Vite-Grundprojekt und die vereinbarte Schichtenstruktur sind eingerichtet. Spiellogik, Persistenz und externe Kartengeneratoren sind noch nicht implementiert.

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

## Nächster Schritt

Als Nächstes folgt `PH-02-01`: die i18n-Grundkonfiguration für Deutsch und Englisch.
