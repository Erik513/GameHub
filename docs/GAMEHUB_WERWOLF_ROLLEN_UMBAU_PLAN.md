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

## Phase 5: Zustände an einer Stelle (Plan vom 25.11.2026)

**Umgesetzt am 25.11.2026 auf `game/werewolf-roles` (We-01-193, We-01-200, We-01-201).** Abweichungen vom Plan: Die Reihenfolge steht nicht als Zahl am Zustand, sondern als Liste `roles/stateIds.ts` (Name und Platz an einer Stelle, daraus `CardEffect`); die Farbe steht nicht in der Rollendatei, sondern nur in der Präsentation (`symbols/stateLook.ts`), damit die Business-Schicht nichts über Farben weiß. Ein neuer Zustand braucht damit: Platz in `stateIds.ts`, Regel in der Rollendatei, Farbe in `stateLook.ts` (Compiler), Zeichen im Katalog (Compiler), Text de/en (Test). Grundlage: Seit Phase 3 sind viele Zustände dazugekommen (Angesehen, Untersucht, Geheilt, Durch Heilzauber gerettet, Vom Hammer / Todeszauber getroffen, Doppelte Stimme, die beiden gerettet-Zustände). Für jeden neuen Zustand waren heute sechs Stellen nötig:

| Stelle | Datei | Prüft der Compiler, ob es fehlt? |
|---|---|---|
| Regel (wann trägt eine Person den Zustand) | `roles/<rolle>.ts` (`cardEffects`) | nein |
| Name im Typ | `narratorCard.ts` (`CardEffect`) | teilweise |
| Reihenfolge der Slots | `roles/cardEffects.ts` (`cardEffectsInOrder`) | nein |
| Zeichen | `presentation/werewolf/symbols/catalog.ts` | nein |
| Farbe | `styles/tokens.css` und eine Regel in `werewolf-narrator.css` | nein |
| Text de/en | `i18n/resources/*/werewolfSymbols.ts` | ja (Test „jedes Zeichen hat einen Text“) |

### Ziel von Phase 5

Ein neuer Zustand braucht **drei** Einträge statt sechs, und bei den zwei, die außerhalb der Rollendatei stehen, meldet der Compiler eine Lücke:

1. **Rollendatei (Business):** Der Zustand wird dort vollständig beschrieben: Regel, Platz in der Reihenfolge, Name der Slotfarbe. Ein zentrales Verzeichnis `roles/states.ts` sammelt die Zustände aller Rollen und der allgemeinen Zustände (verliebt, Amulett, Trunkenbold, Angegriffen beim Amulett). `CardEffect` wird aus diesem Verzeichnis abgeleitet und nicht mehr von Hand gepflegt. Die Reihenfolge kommt aus einer Zahl am Zustand, die Liste in `cardEffects.ts` entfällt.
2. **Zeichen und Farbe (Präsentation):** Eine Tabelle `stateLook: Record<CardEffect, { glyph, color, darkInk? }>` ersetzt die Zustands-Einträge im Katalog und die Farbregeln je Zustand in `werewolf-narrator.css`. Weil es ein `Record` über alle Zustände ist, meldet `tsc` jeden fehlenden Zustand. Die Farbwerte bleiben als Tokens in `tokens.css`; der Slot bekommt seine Farbe über die Tabelle (eine gemeinsame Regel statt einer je Zustand).
3. **Text de/en:** bleibt in den Übersetzungsressourcen, wie die Regeln verlangen.

Zusätzlich (aus den Befunden zu Phase 2 und 3): **eine Fähigkeitsliste pro Rolle.** Heute führt jede Rolle `abilities` (Karte beim Austeilen) und `cardAbilities` (Knöpfe mit Verfügbarkeit) getrennt, mit denselben Zeichen. Künftig gibt es eine Liste der Fähigkeiten mit Zeichen; `cardAbilities` ergänzt nur noch die Verfügbarkeit, `abilities` wird daraus abgeleitet. Die doppelte Stimme des Bürgermeisters (keine Schaltfläche) bleibt als Sonderfall erhalten.

### Schritte

- **5a, Verzeichnis der Zustände (Business):** `roles/states.ts`, Zustände in den Rollendateien mit Reihenfolge und Farbname, `CardEffect` abgeleitet, `cardEffects.ts` aufgelöst. Berührt `narratorCard.ts` und `roles/*`.
- **5b, Aussehen der Zustände (Präsentation):** `stateLook` mit Zeichen und Farbe; Katalog und CSS lesen daraus; die Regeln je Zustand in `werewolf-narrator.css` entfallen. Berührt nur die Präsentation.
- **5c, eine Fähigkeitsliste pro Rolle:** `abilities` aus derselben Liste wie `cardAbilities`. Berührt `roles/*` und `roleAbilities.ts`.

Nach jedem Schritt: Die Absicherungs-Snapshots aus Phase 0 müssen **unverändert** bleiben (kein Zeichen, keine Reihenfolge, keine Fähigkeit ändert sich), dazu alle Tests, `tsc`, ESLint, Prettier, Build und Schichtprüfung. Zusätzlich ein Test, der für jeden Zustand prüft, dass Zeichen, Farbe und Text vorhanden sind.

### Nicht Teil von Phase 5

- Die Zustandsfelder von `describePlayers` (zum Beispiel `inspected`, `healed`, `twoVotes`) bleiben; sie werden auch außerhalb der Slots gebraucht. Die Rollendateien lesen sie weiter.
- Regeln und Zustandsmaschine bleiben unverändert. Phase 4 (Konfiguration) bleibt zurückgestellt.

### Aufgaben (Vorschlag, erst nach Freigabe in den Status)

- We-01-193: Phase 5a, Verzeichnis der Zustände
- We-01-200: Phase 5b, Aussehen der Zustände
- We-01-201: Phase 5c, eine Fähigkeitsliste pro Rolle

### Risiken

- **Codex:** 5a und 5c ändern `narratorCard.ts` und `roles/*`, an denen Codex arbeitet. Vorher abstimmen, wie bei Phase 2 und 3.
- **Farben im CSS:** Die gelben Slots (Hammer, Doppelte Stimme) haben ein dunkles Zeichen. Die Tabelle braucht dafür ein Feld (`darkInk`), sonst ändert sich das Aussehen.
- **Ältere Spielstände:** keine Änderung an gespeicherten Feldern, daher kein Risiko für laufende Spiele (Annahme, beim Umsetzen zu prüfen).

### Entscheidungen des Auftraggebers

1. Freigabe von Phase 5 mit den Schritten 5a, 5b und 5c.
2. Branch: wieder `game/werewolf-roles` (Vorschlag), danach Zusammenführung in `game/werewolf-ui`.
3. Wer setzt um: 5b (nur Präsentation) Claude; 5a und 5c entweder Claude nach Abstimmung oder Codex (Logikdateien).

## Phase 6: Eine neue Rolle mit möglichst wenigen Stellen (Plan vom 25.11.2026, freigegeben)

**Umgesetzt am 25.11.2026 (We-01-203 bis We-01-206).** Die Konfiguration steht in `setup`, die Nacht in `night` jeder Rollendatei; `roles/setup.ts` und `roles/night.ts` lesen beides erst beim ersten Gebrauch, weil die Rollendateien die Spiellogik importieren (Ladekreis). Für 6c gab es keinen zusätzlichen Snapshot: Die bestehenden Tests von `wakeOrder` und `nightScript` nennen die Reihenfolge ausdrücklich. Auftrag: vor dem ersten Push. Heute kommt eine Rolle wie die Alte Vettel in 19 Code-Dateien und 8 Übersetzungsdateien vor. Ziel: Eine neue Rolle braucht die Rollendatei, ihre eigene Regel in der Zustandsmaschine, Zeichnung und Texte; alles andere wird aus dem Verzeichnis `roles/` abgeleitet, und Compiler oder Tests melden Lücken.

### Schritte

- **6a, Rollen-Liste und Typen ableiten:** Eine Liste `roles/roleIds.ts` (wie `stateIds.ts`) nennt alle Rollen; `RoleId`, `WerewolfSpecialRole`, `Role`, `CardRoleSymbol` und `DealtRole` werden daraus abgeleitet statt von Hand gepflegt.
- **6b, Konfiguration in die Rollendatei (bisherige Phase 4):** Mindestspielerzahl, Art in der Konfiguration (an/aus oder mit Variante), Familie (Leibwächter/Dorfmatratze, Hexe/Magier) und die Einträge für variable Rollen stehen in der Rollendatei. `werewolfRoleMinimums`, die Einträge in `fixedConfiguration.ts`, `variableConfiguration.ts` und `variableRecommendation.ts` werden daraus abgeleitet. Verhalten der Konfiguration unverändert.
- **6c, Platz in der Nacht in die Rollendatei:** Jede Rolle mit einem Nachtschritt nennt Platz, Zeitpunkt (nur Nacht 1, ab Nacht 2, Nacht 3) und wer geweckt wird. `nightScript.ts` und `wakeOrder.ts` setzen die Nacht daraus zusammen. Sonderfälle mit mehreren Rollen (Seherin/Seher-Lehrling, Amor und Verliebte, Trunkenbold, Amulett) bleiben als gemeinsame Schritte, aber ebenfalls als Einträge mit Platz statt als feste Liste.
- **6d, Spielstärke:** Die Punkte für die Empfehlung kommen aus Codex' Messdaten (`balanceCalibration.json`) und bleiben dort, weil sie aus Simulationen erzeugt werden. Neu: ein Test, der für jede Rolle aus dem Verzeichnis einen Punktwert verlangt.

### Absicherung

Vor 6b und 6c je ein zusätzlicher Absicherungs-Snapshot (Konfiguration: Mindestzahlen, Einträge, Sperren, Empfehlung; Nacht: Reihenfolge der Aufrufe in typischen Aufstellungen und Nächten). Nach jedem Schritt: alle Snapshots unverändert, alle Tests, `tsc`, ESLint, Prettier, Build, Schichtprüfung.

### Was danach für eine neue Rolle bleibt

Rollendatei (mit Konfiguration, Nacht, Fähigkeiten, Zuständen, Schritten), eigene Regel in `stateMachine.ts` (Status und Ereignis), Platz in `roleIds.ts`, Zeichnung im Katalog, Texte de/en, Punktwert in der Kalibrierung, Tests. Der Compiler oder ein Test meldet jede fehlende Stelle.

### Abstimmung

Berührt fast alle Logikdateien des Werwolfs außer der Zustandsmaschine. Codex arbeitet währenddessen nicht an `src/business/games/werewolf/`. Branch: `game/werewolf-roles`, danach Zusammenführung in `game/werewolf-ui`.
