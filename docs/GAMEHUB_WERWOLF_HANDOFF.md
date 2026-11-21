# Werwolf – technischer Einstieg für Claude Code

Aktueller Nachtablauf (We-03-68, 21.11.2026): Nicht gezogene Pool-Rollen und Zusätze werden übersprungen. Tarnaufrufe gelten nur für tatsächlich vorhandene verdeckte Rollen beziehungsweise verbrauchte Fähigkeiten. nightRolePool, nightItemPool und nightMayUseHammer sind entfernt. Änderungen sind im Logik-Arbeitsordner und gezielt im Werwolf-UI-Arbeitsstand übernommen. Die gewichtete variable Ziehung und Zahlenbeispiele stehen in [GAMEHUB_WERWOLF_VARIABLE_API.md](GAMEHUB_WERWOLF_VARIABLE_API.md); ältere widersprechende Tarn-/Gewichtungsaussagen sind ersetzt.

Aktueller variabler Modus (We-03-67, 20.11.2026): Die Wünsche 1–7 aus dem Abschnitt „Variable Rollen“ sind logisch implementiert. Muss-/Darf-Pools, Variantenmengen, ausgewählte Wolfszahlen und unabhängige 50-%-Zusätze ersetzen itemRange und die Wolfsberechnung nach Ziehung. Aktuelle Signaturen, Wahrscheinlichkeiten und UI-Metadaten: [GAMEHUB_WERWOLF_VARIABLE_API.md](GAMEHUB_WERWOLF_VARIABLE_API.md). Ältere gegenteilige Abschnitte sind historische Beschlussstände. Die UI-Anbindung bleibt separat.

Aktueller Beschlussstand der zweiten Regelrunde (We-03-66, 20.11.2026): Amulett schützt nur gegen nächtlichen Wolfsangriff, Gift und Todeszauber. Kein Schutz bei Hammer, Abstimmung oder Jägerschuss. Liebeskummer allein löst keine Weitergabepflicht aus. Verliebte entscheiden frei; ein verdeckter Trunkenbold-Wolf wird weiterhin erst in Nacht drei enthüllt. Implementiert und geprüft; aktuelle Anbindung in GAMEHUB_WERWOLF_NARRATOR_API.md.

Neue Rollenregeln vom 20.11.2026 sind in We-03-65 implementiert und geprüft. Aktuelle Optionen und Amulett-Zeitfolge siehe GAMEHUB_WERWOLF_NARRATOR_API.md. Oberflächenanbindung erfolgt gesondert in We-01-48; keine UI-Dateien in diesem Logikschritt geändert.

Aktueller Logikstand vom 20.11.2026: Hammer-Neuordnung, Zielkatalog, Tarnskript, Ereignisprotokoll, Spielerprojektion und Rücknahme sind implementiert. Verbindlicher Anschluss für Claude: [Erzähler-API](GAMEHUB_WERWOLF_NARRATOR_API.md). Ältere Planungs-/Prüfabschnitte beschreiben ihren damaligen Stand. Browser-Speicherung, Navigation und UI bleiben gesonderte Integrationsarbeit.

Stand: 19.11.2026. Zusammen mit [UI-Spezifikation](GAMEHUB_WERWOLF_UI.md) und [Spielregeln](GAMEHUB_WERWOLF.md) lesen. Bestätigte Vorgaben, Entwürfe und offene Entscheidungen bleiben unterscheidbar. Keine neue UI aus dieser Datei ableiten.

## Richtiger Arbeitsstand

Die geprüfte Werwolf-Logik liegt im Arbeitsordner **`C:/Users/Kosta/Documents/Codex/2026-11-09/p/work/gamehub-branches/werwolf`**, Branch **`game/werwolf`**. Der Werwolf-Arbeitsstand wird lokal auf game/werwolf versioniert. Vor Übertragung git status prüfen; ein lokaler Commit ist nicht automatisch auf GitHub veröffentlicht. Neuere UI-Integrationen dieses Checkouts bleiben erhalten.

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

**Variabel:** VariableWerewolfSelection besitzt requiredRoles, requiredItems, rolePool, roleOptions, roleRange (nur Darf-Familien), itemPool und wolfCounts. itemRange entfällt. analyzeVariableWerewolfSelection liefert Grenzen/Sperren, recommendVariableWerewolfCount bewertet nur Muss-Einträge. createVariableWerewolf zieht die Wolfszahl und Rollen/Varianten ohne Fairness-Korrektur; optionale Zusätze je 50 %. Start ausschließlich privat und einmalig. Vollständige Migration siehe GAMEHUB_WERWOLF_VARIABLE_API.md.

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

Die Union `WerewolfEvent` ist die verbindliche Parameterdefinition. Die Tabelle ersetzt keine Zielvalidierung; manche Schritte erlauben bestimmte Null-/Verzichtsaktionen nur unter Bedingungen. Der Zielkatalog ist nun in selectors.ts implementiert: validTargets, validNominators, validSeconders und votingPlayers. Keine Regeln in React nachbauen.

`wakingPlayers(state)` liefert die tatsächlich handelnden Rollenpersonen. nightScript überspringt nicht gezogene Rollen und Zusätze; vorhandene verdeckte/tote Rollen bei geheimer Aufdeckung sowie verbrauchte Fähigkeiten behalten Tarnaufrufe. Pool-Metadaten wurden in We-03-68 entfernt. Anzeige verwendet active/cover/skip; nightCall nur mit acknowledgeCall bestätigen.

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
| Todesursache + handelnde Person | Historische Fakten sind jetzt in state.history mit Aktions-, Verletzungs- und Todesdatensätzen einschließlich Ursachen/handelnden Personen vorhanden. describePlayers liefert den Todeseintrag pro Person. Vollständige Verlaufsoberfläche weiterhin zuletzt. |

**Gewinneransicht ist erforderlich (`We-01-30`). Ihre Gestaltung plant der Auftraggeber erst am Ende mit Claude Code.** Jetzt keine Anordnung, Zusatzbuttons oder Layoutvorgaben erfinden. Der vorhandene Endzustand ist ihr technischer Anschluss; eine Rollenauflösung nach Spielende ist nicht allein durch die private Datenverfügbarkeit freigegeben.

## Schichten, Daten und noch offene Entscheidungen

Es gibt für Werwolf aktuell keine benötigte separate Datenbank für einzelne Züge. Die Business-Funktionen erzeugen und verändern einen privaten In-Memory-Partiezustand. Gemeinsame gespeicherte Spieler über bestehende Schnittstellen verwenden. Keine neue Parallelverwaltung, externe Partiedatenbank oder Multiplayer-Synchronisierung ergänzen. Lokales Fortsetzen auf dem Erzählergerät ist inzwischen beschlossen; seine UI-/Speicheranbindung übernimmt Claude.

Bestätigte Entscheidungen sind im neueren Claude-Plan festgehalten: Rücknahme per Zustandsstapel, Abbruch nach Rückfrage mit erhaltener Vorbereitung, lokale Fortsetzung auf dem Erzählergerät und Tarnaufrufe je Rollenaufdeckung. Die reinen Logikschnittstellen für Rücknahme, Tarnung und Anzeige sind fertig; UI-Bedienung und lokale Speicheranbindung werden von Claude umgesetzt. Offen bleiben insbesondere konkrete Symbol-/Farbprioritäten und variable Bedienungsdetails. Vollständige Verlaufsoberfläche ausdrücklich zuletzt.

## Prüfung und Abnahme

Am 19.11.2026: **253 gezielte Tests bestanden**, geprüfte Business-Module **99,54 % Zeilen / 97,48 % Zweige**; neuer fester Einstieg **100 % Zeilen/Zweige**. TypeScript, ESLint der geänderten Dateien und Business-Schichtprüfung erfolgreich. Forschungs-/Massensimulationsläufe wurden hierfür nicht wiederholt.

```powershell
node node_modules/vitest/vitest.mjs run --configLoader runner --coverage --coverage.include='src/business/games/werewolf/{stateMachine,configuration,lineupBalance,balancedSetup,automaticSetup,variableSetup,fixedSetup}.ts' --coverage.reportsDirectory=coverage/ui-handoff src/business/games/werewolf --exclude '**/balance.test.ts' --exclude '**/simulation.test.ts'
node node_modules/typescript/bin/tsc -b --pretty false
node scripts/check-business-boundaries.mjs
node scripts/sync-dashboard.mjs --check
```

Neue UI in Deutsch/Englisch, auf kleinen und großen Displays, mit Sichtschutz und zustandsbewahrenden Ansichtswechseln prüfen. Massensimulationen nicht bei jedem UI-Schritt neu starten; Archive/Audit unter `docs/simulations` verwenden. Die Entwicklungs-HTML muss die aktuellen Werwolf-Aufgaben einschließlich tatsächlich offener UI-Arbeit zeigen; Hauptprojekt und gemeinsame Dashboard-Kopie gezielt mitpflegen und andere Spiele bewahren.


## Hammer-Änderung vom 20.11.2026 – implementiert

Der Bürgermeister mit Hammer erwacht nach dem Magier und vor dem Spellcaster. Er kennt keine laufenden Nachtopfer und darf jede Person wählen, die zu Beginn der Nacht lebte, außer sich selbst. Auch ein bereits als Nachtopfer bestimmter Bürgermeister darf handeln. Ein Werwolf wird vom Hammer getroffen, selbst wenn bereits andere tödliche Angriffe gegen ihn vorliegen; jede Person stirbt nur einmal. Das Amulett schützt nicht vor dem Hammer, auch keinen getroffenen Werwolf. Bei Wahl eines Nichtwerwolfs stirbt der Bürgermeister durch die Fehlentscheidung, die Zielperson bleibt vom Hammer unberührt. Die Fehlentscheidungsstrafe wird nicht vom Amulett abgewehrt; ein verbundener Liebespartner stirbt mit. Todesfälle durch Hammer, Fehlentscheidung und dadurch ausgelöste Partnertode sind nicht heilbar. Bereits ausgeführte Nachtaktionen bleiben wirksam; gemeinsame Auflösung und Bekanntgabe am Morgen.

We-03-63 ist seit 20.11.2026 implementiert: Hammer nach Magier, Zielmenge vom Nachtbeginn, gemeinsame Todesauflösung und Überschneidungen geprüft. Magierheilung wurde nicht erweitert. Ziele, Tarnskript, Protokoll und Rücknahme siehe GAMEHUB_WERWOLF_NARRATOR_API.md.


### Bestätigter Zeitpunkt des Amulettschutzes

Präzisierung des Auftraggebers zum Amulett (aktuelle zweite Regelrunde): Entscheidend ist der Besitzer im Moment eines nächtlichen Wolfsangriffs, Gifts oder Todeszaubers. Eine frühere Abwehr bleibt nach der Weitergabe wirksam; neue Besitzer werden nicht rückwirkend gerettet. Hammer, Tagesabstimmung und jeder Jägerschuss umgehen das Amulett unabhängig vom Besitzer. Liebeskummer und bereits ausgelöste Verwundungen werden ebenfalls nicht abgewehrt. Nur ein tatsächlich abgewehrter Nachtangriff erzwingt die Weitergabe; bei Liebeskummer bleibt Behalten oder Weitergeben freiwillig.


## Umsetzung der Nacht-Aufgabe (We-03-68, 21.11.2026)

Die Nachtlogik ist umgesetzt und im Werwolf-UI-Arbeitsstand unter C:/Users/Kosta/source/repos/GameHub übernommen. Keine UI-Datei oder Übersetzung wurde geändert. Geänderte Logik: nightScript.ts, stateMachine.ts (nur entfernte Match-Felder), balancedSetup.ts und createVariableWerewolf in variableSetup.ts (keine Pool-Metadaten mehr). Tests: nightScript.test.ts neu, narrator.test.ts und variableSetup.test.ts angepasst. Claudes familiesForWolves/familyChances/pickFamilies bleiben unverändert.

Die neuen Prüfungen decken nicht gezogene Rollen, veraltete gespeicherte Pool-Felder, vorhandene verdeckte Rollen, Trunkenbold, Lehrling, Hammer-Varianten und den echten Phasenablauf ab. Ein Seher-Lehrling wird nicht mehr angekündigt, wenn keiner mitspielt. Vorhandene nightCall-/acknowledgeCall-Schritte bleiben für legitime Tarnaufrufe erhalten.

431 Werwolf-Tests inklusive 100 kompletter Partien und Ziehungsprüfungen bestanden. Nachtmodul 100 % Zeilen/Zweige; geprüfte kritische Logik insgesamt 99,73 % Zeilen / 98,15 % Zweige. Typprüfung im Logik-Arbeitsordner, ESLint, Format und Schichtprüfung erfolgreich. Breiter Testlauf dort: 1.091 Tests; aktueller UI-Arbeitsstand: 1.472 Tests erfolgreich. Lange Forschungs-/Balance-Simulationen ausgenommen. Gesamt-Typprüfung im UI-Arbeitsstand meldet fünf nachweislich vorbestehende UI-Fehler (auch mit ursprünglichen Logikdateien reproduziert); Übergabe enthält Fundstellen. Keine UI-Fehler in dieser Aufgabe verändert.

### Unabhängige Typfehler im aktuellen UI-Arbeitsstand für Claude

Mit einem Compiler-Dateiüberlagerungstest gegen die ursprünglichen Business-Dateien reproduziert; die tatsächlichen UI-Dateien wurden dafür nicht geändert:

- src/presentation/werewolf/VariableRoles.test.tsx:78 – it.each-Zeile mit vier Werten, Callback nur drei Parametern (TS2345).
- src/presentation/werewolf/VariableRoles.tsx:138 – dragging.drag möglicherweise undefined (TS18048).
- src/presentation/werewolf/WerewolfGame.test.tsx:15, :252 und :299 – erforderliche GameScreenProps cardLanguage und onCardLanguageChange fehlen (TS2769).

Die Gesamt-Typprüfung der UI ist deshalb noch nicht grün. Die Logik-Typprüfung und alle 1.472 normalen Tests im UI-Arbeitsstand bestehen. Lange historische Forschungs-/Balance-Läufe wurden nicht erneut gestartet. Es wurde weder committed noch gepusht.
