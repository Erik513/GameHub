# Werwolf – technischer Einstieg für Claude Code

Stand: 19.11.2026. Zusammen mit [UI-Spezifikation](GAMEHUB_WERWOLF_UI.md) und [Spielregeln](GAMEHUB_WERWOLF.md) lesen. Bestätigte Vorgaben, Entwürfe und offene Entscheidungen bleiben unterscheidbar. Keine neue UI aus dieser Datei ableiten.

## Richtiger Arbeitsstand

Die geprüfte Werwolf-Logik liegt im Arbeitsordner **`C:/Users/Kosta/Documents/Codex/2026-11-09/p/work/gamehub-branches/werwolf`**, Branch **`game/werwolf`**. Dort bestehen derzeit auch unversionierte/neue und geänderte Dateien. Ein bloßer Branchwechsel oder GitHub-Checkout übernimmt diese noch nicht vollständig. Vor Übertragung `git status --short` prüfen und sämtliche benötigten Dateien einschließlich Tests und Kalibrierungsdaten berücksichtigen. Kein automatisches Zusammenführen oder Veröffentlichen.

`C:/Users/Kosta/source/repos/GameHub` enthält parallel weiterentwickelte gemeinsame Oberfläche/Tabu. Dort sowie unter `work/dashboard` liegen aktualisierte Entwicklungsübersichten und Übergabedokumente, dadurch ist die neue Werwolf-Logik dort **nicht automatisch integriert**. Neuere gemeinsame Komponenten nicht durch ältere Dateien des Werwolf-Arbeitsordners ersetzen.

Zuerst `AGENTS.md`, `GAMEHUB_UI_RULES.md`, `GAMEHUB_NEW_GAME_GUIDE.md` und die drei Werwolf-Dokumente lesen. Quellcode/Kommentare Englisch, Entwicklung für den Auftraggeber Deutsch, sichtbare App-Texte Deutsch/Englisch über Übersetzungen.

## Wegweiser zu vorhandener Logik

Alle Pfade relativ zum oben genannten Werwolf-Arbeitsordner.

| Datei | Aufgabe / öffentliche Einstiege |
| --- | --- |
| `src/business/games/werewolf/configuration.ts` | `werewolfPlayerLimits`, `werewolfRoleMinimums`, `availableWerewolfRoles`, `availableWerewolfCounts`, `standardWerewolfCount`, `validWerewolfRoles`; Typen `WerewolfSettings`, `WerewolfSpecialRole`. Minima und Kombinationen hieraus lesen. `validWerewolfRoles` allein prüft nicht alle Item-/Variantenfreigaben. |
| `src/business/games/werewolf/fixedSetup.ts` | **Fester UI-Modus:** `resolveFixedWerewolfLineup(players, roles, settings)` für Vorschau/Validierung ohne Zufall; `createFixedWerewolf(playersText, narrator, random, roles, settings)` zum einmaligen Start. Ungültig → `null`. |
| `src/business/games/werewolf/automaticSetup.ts` | `resolveAutomaticWerewolfLineup` für automatische Empfehlung; `hasFeasibleAutomaticWerewolfLineup` prüft reine Machbarkeit über erlaubte Wolfszahlen. Kein Rendering und kein heimlicher Austausch der festen Auswahl. |
| `src/business/games/werewolf/variableSetup.ts` | **Variabler UI-Modus:** `analyzeVariableWerewolfSelection` ohne Zufall; `createVariableWerewolf` zum Start. `drawVariableWerewolfLineup` als niedrigerer Einstieg. Ergebnisse sind `{ok:true,...}` oder `{ok:false,reason}`. |
| `src/business/games/werewolf/balancedSetup.ts` | Ältere automatische Einstiege `createBalancedWerewolf`, `createRandomWerewolf`; übernehmen keine manuelle Wolfszahl. `createResolvedWerewolf` setzt die empfohlene Zahl. `createCheckedWerewolf` ist gemeinsamer interner Startbaustein mit Zufallsprüfung, **kein vollständiger UI-Konfigurationsvalidator**. |
| `src/business/games/werewolf/stateMachine.ts` | `WerewolfState`, `WerewolfEvent`, `transitionWerewolf`, `currentWerewolfRole`, `werewolfDrunkReveal`, `wakingPlayers`, `werewolfAnnouncement`, `getWerewolfWinner`. Reine Spiellogik, keine React-/Datenbank-Abhängigkeit. |
| `src/business/games/werewolf/lineupBalance.ts`, `balanceCalibration.json` | Punkte/Empfehlungsmodell; zusätzlich Forschungsfunktionen mit teilweise weiteren Wolfszahlen. Für den normalen UI-Start die festen/variablen Einstiege verwenden. Modellbewertung ist keine gemessene menschliche Gewinnwahrscheinlichkeit. |
| `src/business/shared/players.ts` | `parsePlayers`: Namen trimmen, Groß-/Kleinschreibung bei Dubletten ignorieren; Trenner Komma/Semikolon/Zeilenumbruch. Reihenfolge bleibt Sitzreihenfolge. |
| `src/presentation/game-kit/PlayerRosterContext.ts`, `PlayersSetup.tsx` | Vorhandene gemeinsame Spielerverwaltung wiederverwenden. Neueren Stand im Hauptprojekt beachten; die alphabetische Anzeige der Spielerauswahl ist keine Sitzordnung. |
| `src/app/gameCatalog.ts`, `src/presentation/taboo/tabooModule.tsx` | Bestehende Katalog-/Integrationsbeispiele; aktuelles Hauptprojekt und Spiele-Leitfaden vor Integration prüfen. Noch keine fertige Werwolf-Oberfläche/Modulregistrierung in diesem Arbeitsstand voraussetzen. |

## Konfiguration mit der Oberfläche verbinden

**Feste Rollen:** Spielerzahl ohne Erzähler, ausgewählte optionale Rollen und Partieoptionen an `resolveFixedWerewolfLineup` geben. Rückgabe enthält `settings.wolfCount` als tatsächlich gewählte Zahl und davon unabhängig `balance.recommendedWolfCount`. Fehlt die Auswahl, gilt zunächst `standardWerewolfCount`. Ein Wechsel der Empfehlung ersetzt keine gültige Auswahl. Rolle/Item/Platzkonflikt liefert `null`; keine stille Korrektur durchführen. Welche Bedienung einen Konflikt löst, bleibt gemäß UI-Spezifikation offen.

Nur wenn `availableWerewolfCounts(players)` mehrere Werte hat, den empfohlenen Zahlenbutton mit Rand und „empfohlen“ darunter kennzeichnen. Für 6/9/10/13 gibt es nur einen Wert. Freischaltgruppen im Raster aus den Mindestspielerzahlen ableiten. Die Pflichtseherin und automatische Auffüllung mit Dorfbewohnern sind bereits im Spieleinstieg enthalten. Anzahl Dorfbewohner = Spieler − gewählte Wölfe − 1 Seherin − optionale Rollenkarten; Amulett/Trunkenbold belegen keinen weiteren Platz.

**Variabel:** `VariableWerewolfSelection` enthält `rolePool`, `roleRange:{minimum,maximum}`, `itemPool` (`amulet`, `drunk`), `itemRange:{minimum,maximum}`. Analyse liefert Machbarkeit und zulässige Anzahlen, keine bereits gezogenen Rollen. Beim Start zuerst tatsächliche Rollen/Items ziehen, **danach** Wolfszahl bestimmen und verteilen. Den Start weder beim Rendern noch bei jedem Einstellungswechsel ausführen. UI-Details dieser Ansicht sind ausdrücklich noch später festzulegen.

**Namen/Sitzordnung:** Erzähler aus der Teilnehmerauswahl abtrennen und als eigenen String übergeben. Die verbleibenden 6–20 Namen in bestätigter Sitzfolge als `playersText` übergeben. Nie die alphabetische Auswahlansicht als neue Sitzfolge übernehmen. Der Erzähler ist weder Rollenempfänger noch Nachbar für den Ermittler. Namen dienen der gegenwärtigen Logik als Identitäten; während der Partie nicht umbenennen oder sortieren.

## Laufende Partie verdrahten

Genau einen privaten `WerewolfState` als laufende Partie halten. Ereignisse an `transitionWerewolf(state,event)` übergeben und den zurückgegebenen Zustand verwenden. Ungültige/veraltete Aktionen lassen den ursprünglichen Zustand unverändert. Aktionsereignisse benötigen die **aktuelle `night`**, Abstimmungen zusätzlich die aktuelle `nomination`. Keine eigenen Opfer-/Siegberechnungen in React, keine direkten Zustandsmutationen und kein manuelles Hochzählen von Nächten.

Die zentrale Erzähleransicht rendert den aktuellen `status`; die folgenden Einträge sind Inhalte derselben Ansicht, keine Pflicht zu einzelnen Seiten. „Weiter“ muss die jeweils erlaubte Fachaktion auslösen, es existiert kein generischer `next`-Befehl.

| Zustand | Anzeige / einzureichendes Ereignis |
| --- | --- |
| `roles` | `currentWerewolfRole(state)` nur der angezeigten Person zeigen; nach tatsächlicher Betrachtung `roleSeen` mit `player`. Gehaltene Hochziehkarte gemäß UI-Vorgabe separat gestalten. |
| `amuletIntro` / `amuletPass` | Erste Mitteilung `amuletReady`; spätere Übergabe `passAmulet` mit `target`. `mustPass` beachten. |
| `cupid` / `lovers` | Zwei gültige Namen durch `bond` mit `players:[a,b]`; Kennenlernen durch `loversReady` abschließen. |
| `drunkReveal` / `drunkHunter` | `werewolfDrunkReveal(state)` privat anzeigen; Bestätigung `drunkReady`. Bei `drunkHunter` anschließend den echten Jägerschritt abwarten. |
| `mayor` | `hammer` mit `target` oder `null` für Nichtgebrauch. Kein zusätzliches doppeltes Stimmrecht in Hammer-Variante. |
| `bodyguard` / `nightGuest` | `protect` beziehungsweise `stayWith` mit `target`. Frühere Schutzperson und Selbstwahlregeln nicht umgehen. |
| `wolves` | Angriff `attack` mit `target`; eine Kennenlernphase ohne Angriff per `wolvesReady` fortsetzen. `null` nur dort einsetzen, wo der Fachablauf dies zulässt. |
| `seer` / `vision` | `inspect` mit `target`; Ergebnis `isWolf` privat zeigen, dann `closeVision`. |
| `investigator` / `investigation` | `investigate` mit `target` oder Verzicht `null`; Ergebnis `isWolfNearby` privat zeigen, dann `closeInvestigation`. Einmalfähigkeit, keine nächtlich unbegrenzte Untersuchung. |
| `witch` | Aktuelles `victim` und vorhandene `potions` beachten; `potions` mit `heal:boolean`, `poison:string|null`. |
| `magician` | `castSpells` mit `heal:boolean`, `kill:string[]`; begrenzte `spellsRemaining`. Nicht selbst aus `victim` einen zweiten heilbaren Fall erfinden. |
| `spellcaster` | `silence` mit `target` oder `null`; Selbstwahloption und nicht zweimal direkt dieselbe Person beachten. |
| `morning` | `werewolfAnnouncement(state)` für Namen/zulässige öffentliche Rollen nutzen; per `announceMorning` auflösen. Es können Jäger-/Trunkenbold-Zwischenschritte folgen. |
| `day` | `nominate` mit `target`, `nominator`, `seconder`; oder `endDay` ohne Abstimmung. |
| `vote` | `vote` mit aktueller `nomination` und vorzugsweise `yesVoters:string[]`. So sind Dorftrottel-Pflichtstimme und doppelte Bürgermeisterstimme prüfbar; bloße Ja-Anzahl reicht nicht in allen Varianten. |
| `exile` | `werewolfAnnouncement(state)` beachten; `announceExile` führt die Auflösung durch. Amulett kann den Tod verhindern. |
| `hunter` | `shot` mit `target`; `null` nur bei freiwilligem Schuss. Folgeopfer und anschließenden Zustand von der Logik übernehmen. |
| `finished` | Gewinneransicht öffnen. `winner` ist `village` oder `wolves`; `tannerWinner` gegebenenfalls zusätzlich berücksichtigen. |

Die Union `WerewolfEvent` ist die verbindliche Parameterdefinition. Die Tabelle ersetzt keine Zielvalidierung; manche Schritte erlauben bestimmte Null-/Verzichtsaktionen nur unter Bedingungen. Aktuell gibt es keinen vollständigen öffentlichen Katalog aller gültigen UI-Ziele. Falls ein gemeinsamer Ziel-Selektor nötig ist, ihn gezielt in Business ergänzen und mit denselben Regeln testen, statt Regeln unterschiedlich in mehreren UI-Komponenten nachzubauen.

`wakingPlayers(state)` liefert die relevanten Rollenpersonen für Hinweise. Der Ablauf überspringt derzeit viele nicht vorhandene/tote Rollen; verbrauchte Hexentränke verhindern den Aufruf nicht, der Hammer besitzt eine gesonderte Tarnbehandlung. **Eine einheitliche Tarnaufrufregel für alle Rollen und geheime variable Pools ist noch nicht fertig entschieden/implementiert.** Kein neues öffentliches Rollenwissen aus dem Ablauf erzeugen.

## Zustandsdaten für Kreis, Übersichten und Ergebnis

| Anzeige | Vorhandene Grundlage / Grenze |
| --- | --- |
| Spieler, Rolle, lebend/tot | `players`, `alive`; tote Person gehört weiterhin zu `players`. Tatsächliche Rolle ist geheim, `currentWerewolfRole` berücksichtigt Trunkenbold bei privater Rollenverteilung. |
| Liebespaar | `lovers`; keine eigene vorgezogene Spielendeprüfung ergänzen. Sieg richtet sich weiterhin nach den tatsächlichen Seiten. |
| Ressourcen / Effekte | `potions`, `spellsRemaining`, `hammerUsed`, `investigationUsed`, `silencedPlayer`, `protectedPlayer`, `hostPlayer`. Nicht jeder Wert ist während jeder Phase gleichbedeutend mit einem aktiven Effekt. |
| Amulett / Trunkenbold | `amulet:{holder,mustPass}|null`, `drunk:{player,revealed}|null`. Grünrahmen bei Tod als Trunkenbold und der Sonderfall Jäger benötigen noch eine abgestimmte historische Darstellung. |
| Verzögerter Tod | `toughGuyDiesOn` plus tatsächlicher Harter-Bursche-Spieler. Todeszeitpunkt von der Zustandsmaschine bestimmen lassen. |
| Angriff / Opfer | Phasenabhängig `victim`, `poisoned`, `spellVictims`, `nightDeaths`; daraus lässt sich nicht ohne zusätzliche Festlegung jede gewünschte rote Markierung vor/nach Rettung rekonstruieren. |
| Öffentliche Bekanntgabe | `werewolfAnnouncement` respektiert `settings.revealRoles`. Die vollständige private Rollenliste niemals als öffentliche Bekanntgabe verwenden. `shotDeaths` ist kein dauerhafter Ereignisverlauf und nicht bei jedem Rendern erneut als neue Meldung behandeln. |
| Gewinner | Nur bei `status === "finished"` auf `winner` zugreifen. Wolfsgleichstand beendet die Partie zugunsten der Wölfe. Ein siegreicher Gerber ist zusätzlich in `tannerWinner` festgehalten; sein Ausscheiden beendet nicht selbst die gesamte Partie. |
| Todesursache + handelnde Person | Vollständige historische Zuordnung liegt noch nicht für alle Quellen als fertiger Datenvertrag vor. Nicht aus der aktuellen Nacht oder Rolle raten. Erweiterung erst gezielt für benötigte Detailanzeige planen; vollständige Verlaufsoberfläche ganz zuletzt. |

**Gewinneransicht ist erforderlich (`We-01-30`). Ihre Gestaltung plant der Auftraggeber erst am Ende mit Claude Code.** Jetzt keine Anordnung, Zusatzbuttons oder Layoutvorgaben erfinden. Der vorhandene Endzustand ist ihr technischer Anschluss; eine Rollenauflösung nach Spielende ist nicht allein durch die private Datenverfügbarkeit freigegeben.

## Schichten, Daten und noch offene Entscheidungen

Es gibt für Werwolf aktuell keine benötigte separate Datenbank für einzelne Züge. Die Business-Funktionen erzeugen und verändern einen privaten In-Memory-Partiezustand. Gemeinsame gespeicherte Spieler über bestehende Schnittstellen verwenden. Keine neue Parallelverwaltung, dauerhafte Partiedatenbank, Multiplayer-Synchronisierung oder Wiederaufnahme behaupten/ungefragt ergänzen.

Vor den jeweils betroffenen UI-Schritten noch klären:

- **Zurück:** nur vorherigen Hinweis ansehen oder Fachaktion zurücknehmen? Es existiert kein allgemeines Undo-Ereignis; verbrauchte Tränke und geheime Informationen dürfen nicht still zurückgesetzt werden.
- **Abbrechen:** Bestätigung/Rückweg und Bereinigung der laufenden Sitzung sind noch zu definieren; kein `abort` in der Fachereignisunion.
- **Nachtskript:** Tarnaufrufe toter/verbraucht handelnder Rollen je Aufdeckung und geheimem Rollenpool, einschließlich vorhandener Hammer-Ausnahme.
- **Hauptansicht und Konfiguration:** genaue Sitzsortierung, Erzählerwechsel, Konfliktbehandlung und variable Bedienung. Grundaufbau ist dokumentiert, diese Details sind keine fertige Entscheidung.
- **Live-Kreis:** Symbolik, überlagerte Farbprioritäten, Rettungsmarkierungen und benötigte historische Felder; `We-01-44`. Vollständige Verlaufsansicht `We-01-45` ausdrücklich zuletzt.

Diese Grenzen verhindern nicht die Übergabe. Sie verhindern lediglich die Behauptung, jede Ansicht könne bereits ohne jede weitere Produktentscheidung vollständig implementiert werden. Zunächst bestätigte Hauptansicht und feste Konfiguration konkretisieren/umsetzen, dann phasenweise Erzählerbedienung, Übersichten und Ergebnis; Verlauf zuletzt.

## Prüfung und Abnahme

Am 19.11.2026: **253 gezielte Tests bestanden**, geprüfte Business-Module **99,54 % Zeilen / 97,48 % Zweige**; neuer fester Einstieg **100 % Zeilen/Zweige**. TypeScript, ESLint der geänderten Dateien und Business-Schichtprüfung erfolgreich. Forschungs-/Massensimulationsläufe wurden hierfür nicht wiederholt.

```powershell
node node_modules/vitest/vitest.mjs run --configLoader runner --coverage --coverage.include='src/business/games/werewolf/{stateMachine,configuration,lineupBalance,balancedSetup,automaticSetup,variableSetup,fixedSetup}.ts' --coverage.reportsDirectory=coverage/ui-handoff src/business/games/werewolf --exclude '**/balance.test.ts' --exclude '**/simulation.test.ts'
node node_modules/typescript/bin/tsc -b --pretty false
node scripts/check-business-boundaries.mjs
node scripts/sync-dashboard.mjs --check
```

Neue UI in Deutsch/Englisch, auf kleinen und großen Displays, mit Sichtschutz und zustandsbewahrenden Ansichtswechseln prüfen. Massensimulationen nicht bei jedem UI-Schritt neu starten; Archive/Audit unter `docs/simulations` verwenden. Die Entwicklungs-HTML muss die aktuellen Werwolf-Aufgaben einschließlich tatsächlich offener UI-Arbeit zeigen; Hauptprojekt und gemeinsame Dashboard-Kopie gezielt mitpflegen und andere Spiele bewahren.
