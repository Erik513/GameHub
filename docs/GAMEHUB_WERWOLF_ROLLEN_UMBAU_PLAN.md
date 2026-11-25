# Werwolf: eine Definition pro Rolle (Umbauplan)

Stand: 2026-11-25. **Freigegeben**: Architektur wie beschrieben, Phasen 0 bis 3, eigener Branch `game/werewolf-roles`. **Umgesetzt: Phasen 0 bis 3.** Phase 2 und 3 wurden in Abstimmung mit Codex umgesetzt. Phase 4 und 5 sind zurückgestellt. Annahmen und nicht geprüfte Aussagen sind gekennzeichnet.

## Ziel

Alles, was zu **einer** Rolle gehört, steht an **einer** Stelle: Rollenzeichen, Fähigkeiten mit ihren Zeichen, die Zustände, die sie auslöst, ihre Variante, ihr Ablauf. Gemeinsames für alle Spieler steht einmal in einer allgemeinen Definition. Eine neue Rolle oder ein neues Zeichen soll eine Datei ändern, nicht fünf. Die Regel „Zeichen der Fähigkeit = Zeichen des Zustands, nur ohne Kreis“ ist dann von der Struktur garantiert und nicht mehr eine Sache von Tabellenabgleich.

## Ausgangslage (geprüft)

Rollenspezifisches steht heute verteilt, jeweils als `switch` oder Tabelle über die Rolle:

| Datei | Zeilen | Zweige pro Rolle | Was dort rollenspezifisch ist |
|---|---|---|---|
| `src/business/games/werewolf/narratorCard.ts` | 374 | 20 | Fähigkeiten und Knöpfe der Rollenkarte, Effekte (Slots) |
| `src/business/games/werewolf/stateMachine.ts` | 789 | 19 | Übergänge je Spielphase (Regeln) |
| `src/business/games/werewolf/roleStep.ts` | 320 | 18 | Art des Schritts (wählen, Ergebnis, Info), Verzichten |
| `src/presentation/werewolf/roleAbilities.ts` | 124 | 16 | Fähigkeiten mit Zeichen, Variante, Erklärung |
| `src/business/games/werewolf/eventChoices.ts` | 132 | 9 | **Testhelfer** je Phase (nicht Teil der Spiellogik) |
| `src/business/games/werewolf/roleVariant.ts` | 41 | 5 | Variante der Rolle aus den Einstellungen |
| `src/business/games/werewolf/fixedConfiguration.ts` | 590 | 5 | Einstellungen und Mindestspielerzahl je Rolle |
| `src/presentation/werewolf/symbols/catalog.ts` | 96 | Tabelle | Zeichen der Rollen, Zustände, Legende der Fähigkeiten |
| `src/business/games/werewolf/selectors.ts` | 253 | – | Zustände je Person (`describePlayers`) |
| i18n-Ressourcen (de/en) | – | – | Namen und Bedeutungen je Zeichen und Rolle |

Annahme (nicht vollständig geprüft): `nightScript.ts` und `wakeOrder.ts` enthalten die Reihenfolge der Rollen in der Nacht und bleiben von dem Umbau unberührt.

## Zielstruktur

```
src/business/games/werewolf/roles/
  types.ts        // RoleDefinition, AbilityDefinition, StateDefinition (nur Zeichen-IDs, keine Zeichnungen)
  common.ts       // was alle betrifft: tot, verliebt, Amulett, Trunkenbold, stumm
  wolf.ts, seer.ts, witch.ts, ...   // je eine Datei pro Rolle
  index.ts        // das zentrale Verzeichnis aller Rollen
```

Eine `RoleDefinition` ist ein **einfaches Datenobjekt mit reinen Funktionen**, keine Klasse. Das passt zum Stil des Projekts (Zustand als Objekt, reine Funktionen, Business ohne React). Sie enthält:

- `id`, `symbol` (Zeichen-ID der Rolle)
- `abilities`: je Fähigkeit `id`, `symbol`, ob verbrauchbar, eine Funktion `(state) => Verfügbarkeit` (frei, verbraucht, gesperrt, Anzahl)
- `states`: die Zustände, die die Rolle bei anderen Personen auslöst, je `id`, `symbol` (= Zeichen der Fähigkeit, ohne Kreis) und Slotfarbe als Name (die Farbwerte bleiben in `tokens.css`)
- `variant`: aus welcher Einstellung die Variante kommt und welche Werte es gibt
- `step`: die Beschreibung des Schritts (heute `describeRoleStep`)
- `minPlayers` und der Verweis auf die Erklärung

Die **Zeichnungen** bleiben in der Präsentationsschicht (`symbols/glyphs.ts`). Die Business-Schicht kennt nur Zeichen-IDs (heute schon so: `CardAbilitySymbol`). Die Schichtprüfung `scripts/check-business-boundaries.mjs` bleibt gültig.

Die **Übergänge der Zustandsmaschine** (`stateMachine.ts`) bleiben dort. Sie sind Regeln je Spielphase und kein Rollendatum. Der Umbau berührt die Regeln nicht.

## Phasen

Jede Phase ist für sich lauffähig. Nach jeder Phase müssen alle bestehenden Tests, `tsc`, ESLint, Prettier und der Build grün sein. Das Verhalten ändert sich nirgends.

**Phase 0: Absicherung vor dem Umbau.** Ein Test, der für jede Rolle und jede Einstellung die heutigen Werte ausgibt (Zeichen, Fähigkeiten mit Verfügbarkeit in typischen Zuständen, Effekte, Variante) und mit einer gespeicherten Fassung vergleicht. Er beweist nach jeder Phase, dass sich nichts geändert hat.

**Phase 1: Gerüst und Verzeichnis, Zeichen und Fähigkeiten.** `roles/` mit Typen, `common.ts`, einer Datei pro Rolle und dem Verzeichnis. `roleAbilities.ts` und `roleVariant.ts` lesen aus dem Verzeichnis. Das Rollenzeichen im `catalog.ts` wird aus dem Verzeichnis abgeleitet. Betrifft vor allem Präsentation und `roleVariant.ts`.

**Phase 2: Rollenkarte.** `narratorCard.ts` baut Fähigkeiten und Effekte aus den Definitionen statt aus `switch`-Zweigen. Betrifft Logikdateien, die auch Codex bearbeitet.

**Phase 3: Schritte.** `roleStep.ts` liest die Beschreibung des Schritts aus der Definition.

**Phase 4: Konfiguration.** Mindestspielerzahl und Einstellungen je Rolle (`fixedConfiguration.ts`, `configuration.ts`) aus dem Verzeichnis. Das ist die größte Datei und die riskanteste Phase. **Vorschlag: zurückstellen und erst nach den Phasen 1 bis 3 entscheiden.**

**Phase 5 (optional): Zustände zentral.** Die Liste der Effekte (`CardEffect`) und die Zustände je Person (`describePlayers`) werden aus den `states` der Definitionen erzeugt. So gäbe es für einen neuen Zustand nur noch einen Eintrag.

## Aufgaben (Vorschlag für `docs/GAMEHUB_STATUS.json`, erst nach Freigabe)

- We-01-188: Absicherungstest (Phase 0)
- We-01-189: Gerüst, Verzeichnis, Zeichen und Fähigkeiten (Phase 1)
- We-01-190: Rollenkarte aus Definitionen (Phase 2)
- We-01-191: Schritte aus Definitionen (Phase 3)
- We-01-192: Konfiguration aus Definitionen (Phase 4, zurückgestellt)
- We-01-193: Zustände zentral (Phase 5, optional)

Abnahmekriterien je Aufgabe: Verhalten unverändert (Absicherungstest und alle 1779 Tests grün), keine neue Abhängigkeit, kein Regelcode verschoben, Doku, Status und Changelog aktuell, Hinweis für Codex bei jeder berührten Logikdatei.

## Risiken

- **Parallele Arbeit von Codex** an `stateMachine.ts`, `selectors.ts`, `narratorCard.ts`: Die Phasen 2 und 3 ändern diese Dateien. Gefahr von Zusammenführungskonflikten. Abhilfe: kleine Phasen, vorher abstimmen, ob Codex in dieser Zeit an diesen Dateien arbeitet.
- **Umfang**: Phase 4 ist groß (590 Zeilen in `fixedConfiguration.ts`) und wird zurückgestellt.
- **Zirkuläre Importe**: Die Definitionen dürfen `stateMachine.ts` nur über Typen kennen. Annahme: lösbar, wird in Phase 1 geprüft.
- **Übersetzungen**: Die Schlüssel der Texte bleiben, nur ihre Herkunft ändert sich.

## Entscheidungen des Auftraggebers

1. Freigabe der Architektur (eine Definition pro Rolle als Datenobjekt, ein Verzeichnis, Zeichnungen bleiben in der Präsentation, Übergänge bleiben in der Zustandsmaschine).
2. Umfang jetzt: Phasen 0 bis 3 (Vorschlag), Phase 4 und 5 später.
3. Branch: weiter auf `game/werewolf-ui` oder ein eigener Branch (Vorschlag: `game/werewolf-roles`).
4. Abstimmung mit Codex: Sollen die Logikdateien während der Phasen 2 und 3 für Codex gesperrt sein?

## Rollenumbau Phase 2 und 3 (2026-11-25, Codex)

Werwolf-Rollenumbau Phase 2 und 3 abgeschlossen. Fähigkeiten und rollenspezifische Effekte der Erzählerkarte sowie die Beschreibungen der Nacht- und Jägerschritte stehen in den Rollendefinitionen. Die bestehenden Abläufe und gespeicherten Rollentabellen sind unverändert. 1.784 Tests im vollständigen Lauf bestanden. Nach der typisierten Zusammenführung der Schritte wurden die 28 betroffenen Tests erneut ausgeführt. Typ-, Lint-, Format- und Schichtprüfung sowie Produktionsbuild erfolgreich.

- We-01-190: narratorCard.ts liest Fähigkeiten und Effekte aus roles/. Gemeinsame Effekte und Anzeigereihenfolge stehen in roles/cardEffects.ts.
- We-01-191: roleStep.ts liest rollenspezifische Schrittbeschreibungen aus roles/. Gemeinsame Schritte für Tarnaufruf, Tagesabstimmung und Amulett werden dort weiterhin zusammengesetzt.
- Die Zustandsmaschine, die Abfolge der Nacht und die zurückgestellten Phasen 4 und 5 sind unverändert.
