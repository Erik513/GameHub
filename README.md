# GameHub

[GameHub im Browser öffnen](https://erik513.github.io/GameHub/)

GameHub ist eine kostenlose, zweisprachige (Deutsch und Englisch) Spielesammlung für Partyspiele, die auf dem Smartphone und am PC läuft. Die Progressive Web App ist offline spielbar und wird über GitHub Pages veröffentlicht. Der Einstieg ist immer die Spielauswahl; jedes Spiel ist ein eigenes Modul in einem zentralen Spielkatalog.

## Spiele

| Spiel | Stand |
| --- | --- |
| **Tabu** | Spielbar. Drei Spielmodi (klassisch, „Auf Zeit“, „Gegen die Zeit“), Standardkarten auf Deutsch und Englisch, eigene Karten, Stechen bei Gleichstand, Merken gespielter Karten. Handy- und PC-Layout. |
| **Werwolf** | In Entwicklung (Spiellogik vorhanden, Oberfläche im Aufbau). Der Knopf „Spielen“ ist in der veröffentlichten Version gesperrt. |
| Imposter, Liar’s Bar, Schwimmen, Wortbombe | Geplant. |

Ein Spiel wird erst spielbar, wenn es fertig ist und veröffentlicht wurde. Jedes Spiel wird in einem eigenen Git-Branch (`game/<spiel>`) entwickelt und erst nach Freigabe in `main` übernommen.

## Funktionen

- Spielerliste mit Gruppen (zum Beispiel Freundeskreise), von allen Spielen gemeinsam genutzt
- Oberflächensprache und Kartensprache sind getrennte Einstellungen; Deutsch und Englisch gleichwertig
- Phone-first-Oberfläche, ab 1024 px ein eigenes PC-Layout mit Tastenkürzeln
- Offline spielbar nach dem ersten Online-Aufruf, installierbar als App
- Keine Konten, keine Werbung, keine kostenpflichtigen Dienste; Karten und Einstellungen bleiben lokal im Browser

## Technik

- React, TypeScript und Vite
- Drei Schichten: Presentation, Business und Data, dazu Infrastructure für Browser-Schnittstellen; die Business-Schicht ist frei von React und Browser-APIs (wird geprüft)
- Lokale Speicherung in IndexedDB und Local Storage
- i18next und react-i18next
- Vitest, Testing Library und Playwright
- PWA mit Manifest und Service Worker
- GitHub Actions für Prüfungen und Veröffentlichung auf GitHub Pages

## Projektdokumentation

- [Projektplan](docs/GAMEHUB_PROJECT_PLAN.md)
- [Entwicklungs-Dashboard](docs/GAMEHUB_DEVELOPMENT.html) und [maschinenlesbarer Status](docs/GAMEHUB_STATUS.json)
- [Änderungsprotokoll](docs/GAMEHUB_CHANGELOG.md)
- [Architekturentscheidungen](docs/GAMEHUB_DECISIONS.md)
- [Oberflächenregeln](docs/GAMEHUB_UI_RULES.md) und [PC-Layout](docs/GAMEHUB_PC_LAYOUT.md)
- [Anleitung für neue Spiele](docs/GAMEHUB_NEW_GAME_GUIDE.md) und [Spielmodule](docs/GAMEHUB_GAME_MODULES.md)
- Tabu: [Modi](docs/GAMEHUB_TABOO_MODES.md), [Logik](docs/GAMEHUB_TABOO_LOGIC.md), [Kartenpool](docs/GAMEHUB_CARD_POOL.md)
- [Arbeitsregeln](AGENTS.md)

Der Fortschritt wird ausschließlich aus den Aufgabenstatus in `docs/GAMEHUB_STATUS.json` berechnet. Nach Änderungen daran gleicht `pnpm docs:sync` das Dashboard ab; `pnpm docs:check` prüft das in der CI.

## Lokale Entwicklung

Voraussetzungen: Node.js 24 oder neuer und pnpm 11.

```powershell
pnpm install
pnpm dev
```

Prüfungen:

```powershell
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test:architecture
pnpm check:translations
pnpm docs:check
pnpm test
pnpm test:coverage
pnpm test:e2e
pnpm build
```

Der Workflow `.github/workflows/quality.yml` führt diese Prüfungen bei jedem Push auf `main` und bei Pull Requests aus (Prüfungen, Browserprüfungen mit Playwright und Chrome). Sind alle grün, wird `main` auf GitHub Pages veröffentlicht.

## Offlinebetrieb lokal prüfen

```powershell
pnpm build
pnpm preview
```

Öffne die angezeigte Adresse einmal online. Sobald der Service Worker aktiv ist, kannst du die Seite offline neu laden und Tabu spielen. Unterstützte Browser bieten die Installation über ihr Menü an. Der Entwicklungsserver registriert keinen Service Worker.
