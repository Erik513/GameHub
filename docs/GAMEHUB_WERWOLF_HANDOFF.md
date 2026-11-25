# Werwolf – technischer Einstieg für Claude Code

## Rollenumbau auf game/werewolf-roles (25.11.2026)

Phasen 0 bis 3 sind umgesetzt. Die zuletzt abgeschlossenen Aufgaben sind We-01-190 (Rollenkarte) und We-01-191 (Erzählschritte).

- Für rollenspezifische Kartenfähigkeiten, Effekte und Schrittbeschreibungen in der jeweiligen Datei unter src/business/games/werewolf/roles/ beginnen. Die Felder heißen cardAbilities, cardEffects und steps.
- describeNarratorCard in narratorCard.ts setzt die Karte zusammen. roles/cardEffects.ts definiert die Reihenfolge und gemeinsame Effekte. describeRoleStep in roleStep.ts ergänzt gemeinsame Schritte wie Tarnaufruf, Amulett und Abstimmung.
- Spielregeln und Nachtreihenfolge laufen weiterhin über die bisherigen Dateien. Die Oberfläche verwendet dieselben Rückgabestrukturen. Bei einem weiteren Umbau sind die Rollentabellen in Business und Presentation sowie narratorCard.test.ts und roleStep.test.ts die ersten Vergleichstests.
- Phase 4 (Mindestspielerzahlen und Rollenoptionen) und Phase 5 (Spielerzustände zentral ableiten) sind zurückgestellt. Der [Umbauplan](GAMEHUB_WERWOLF_ROLLEN_UMBAU_PLAN.md) beschreibt ihren Umfang.

Die vollständige Suite lief mit 1.784 bestandenen Tests durch. Die 28 gezielten Tests bestanden erneut nach den letzten Anpassungen.

## Angleichung an Stimmenzahlen und letzten Jägerschuss (We-03-71, 23.11.2026)

We-03-71 abgeschlossen: Forschungssimulation verwendet voteCount statt erzwungener Verurteilung bei einem Nominierten. Stimmengewichte und Ja/Nein-Mehrheit stimmen mit der Erzähleransicht überein; alte benannte Stimmen werden nach einer Stimmenzahl-Abstimmung nicht als aktuelle Abstimmende protokolliert. lastShot für den betrunkenen Jäger abgesichert. 84 gezielte Tests und 24 kurze Modellpartien bestanden; keine langen Balance-Läufe.

### Was sich geändert hat

- Die bereits von Claude umgesetzte Stimmenzahl-Logik in stateMachine.ts bleibt erhalten. Ein Nominierter: voteCount zählt Ja-Stimmen, Ausscheiden ab voteNeeded, Ablehnung führt zurück zu day. voteTotal ist dabei die maximal mögliche Ja-Stimmenzahl ohne Eigenstimme; der Nenner für voteNeeded umfasst alle berechtigten gewichteten Stimmen, einschließlich des Nominierten. Stummgeschaltete zählen nicht, ein aktiver Bürgermeister mit doppelter Stimme zählt zweifach. Bei zwei oder drei Nominierten gelten vollständige Stimmenzahlen, relative Mehrheit und die vorhandene Stichwahl.
- Neu in simulationVoting.ts: drawSimulationVoteCounts. Bei einem Nominierten werden Ja/Nein-Entscheidungen der übrigen Wähler simuliert und gewichtet aufsummiert. Bei mehreren Nominierten werden gültige Einzelentscheidungen samt Gewicht zu Stimmenzahlen zusammengefasst. balance.test.ts sendet jetzt voteCount. Die kurze Ablaufprüfung in simulation.test.ts prüft den Einzelkandidaten-Fall zusätzlich mit einer unabhängigen Mehrheits-/Grenzwertberechnung.
- eventChoices.ts bietet für einen Nominierten sowohl Ablehnung als auch Zustimmung per voteCount an. Unmögliche Schwellen über der maximalen Ja-Stimmenzahl werden nicht angeboten. Der bisherige vote-Pfad bleibt ausdrücklich als kompatibler benannter Prüfpfad unverändert; bei nur einem Nominierten unterscheidet er sich weiterhin von der neuen Ja/Nein-Regel. Er darf nicht mehr als Ersatz für die aktuelle Einzelkandidaten-Simulation benutzt werden.
- eventLog.ts sucht den letzten tatsächlichen Abstimmungsvorgang, unabhängig davon, ob er vote oder voteCount war. Bei voteCount bleiben die Namen der Abstimmenden unbekannt (actors: []). Zuvor konnte die Suche eine ältere vote-Abstimmung finden und deren Namen fälschlich übernehmen; die Regression mit benannter erster Runde und gezählter Stichwahl ist behoben.
- lastShot war bereits korrekt implementiert; der Selektor wurde nicht verändert. Ein zusätzlicher Test prüft den betrunkenen Jäger durch drunkHunter, Enthüllung, hunter und Abschluss des Schusses. Er bleibt aus alive entfernt, lastShot bleibt bis zur Entscheidung true und wird danach false. Keine Wiederbelebung und keine Änderung der Siegprüfung.

### Modellannahmen und Grenzen

Für einen einzelnen Nominierten verwendet das Zufallsmodell pro zulässigem Wähler eine faire Ja/Nein-Münze. In Hinweismodellen ist die Ja-Wahrscheinlichkeit Gewicht / (Gewicht + 1), mit Gewicht = 1 + nichtnegativem öffentlichem Verdacht. Die Eigenstimme wird nie zu Ja, die verbleibenden Stimmen werden mit dem vorhandenen Wählergewicht aufsummiert. Das ist eine offengelegte Forschungsheuristik, keine neue Spielregel oder gemessene menschliche Wahrscheinlichkeit. Bei mehreren Kandidaten bleiben die öffentlichen Gewichte aus We-03-70 erhalten. Alte Ergebnisarchive und Punktwerte wurden nicht neu kalibriert oder überschrieben.

### Gezielte Abnahme

84 gezielte Tests in sechs Dateien bestanden; zwei gezielte Modell-Kurzprüfungen mit 24 vollständigen Partien bestanden. Keine langen Simulationsläufe. simulationVoting.ts: 100 % Zeilen / 96,55 % Zweige. Typprüfung, ESLint, Format und Schichtprüfung erfolgreich. Geprüft: Einzelkandidaten-Zustimmung/Ablehnung, gewichtete Stimmen, stummer oder nominierter Bürgermeister, unbekannte Abstimmende nach früherem benanntem Voting und lastShot beim betrunkenen Jäger.

Betroffene Tests: voteCount.test.ts, lastShot.test.ts, simulationVoting.test.ts, advancedRoles.test.ts, narrator.test.ts und narratorGuide.test.ts. Die beiden Tests mit dem Namensanfang smoke-checks in balance.test.ts und simulation.test.ts wurden einzeln ausgewählt; die übrigen langen Tests blieben übersprungen. Vorherige separate Tabu-Formatierung und lokale Visual-Studio-Dateien bleiben unberührt. Umsetzung direkt im aktuellen Branch game/werewolf-ui unter C:/Users/Kosta/source/repos/GameHub.


## Nachprüfung des roten Rollentests (We-03-70, 23.11.2026)

advancedRoles.test.ts enthielt noch die alte Erwartung, dass die Alte Vettel mit silence:null freiwillig verzichten darf. Der gezielte ursprüngliche Prüflauf hatte diese Datei nicht erfasst. Die Erwartung wurde korrigiert: null wird bei vorhandenem Ziel abgewiesen, anschließend wird eine andere erlaubte Person stummgeschaltet. Alle 14 Tests dieser Datei bestehen wieder; Format und ESLint ebenfalls. Keine Produktionslogik geändert. Ergänzend zu den zuvor geprüften 104 Tests sind damit 14 weitere Tests nachgeprüft; die frühere Fehlermeldung ist behoben.


## Umgesetzte Ergänzungen für Codex und Claude (We-03-70, 23.11.2026)

We-03-70 abgeschlossen: Alte Vettel muss bei vorhandenem Ziel stummschalten; null nur noch als Notausgang ohne gültiges Ziel. Forschungsmodell auf 1–3 Nominierte, einzelne gewichtete Stimmzettel und Stichwahlen angepasst; Heilungsmodelle verwenden wolfTarget. 104 gezielte Tests und 24 kurze Modellpartien erfolgreich. Keine langen Balance-Läufe, keine UI- oder Kalibrierungsänderungen.

| Bereich | Aktueller Anschluss |
| --- | --- |
| Alte Vettel | stateMachine.ts weist silence mit target:null zurück, sobald ein gültiges lebendes Ziel existiert. Selbstwahl und Sperre der Vornacht bleiben unverändert. Nur ohne gültiges Ziel bleibt null als technischer Notausgang erlaubt; describeRoleStep kann diesen Fall weiterhin darstellen. Kein neues Einstellungsfeld. |
| Ereignisauswahl | eventChoices.ts bietet silence:null ausschließlich ohne wählbare Person an. Die Erzähleransicht bleibt unverändert. |
| Forschungs-Abstimmung | Neue Datei simulationVoting.ts: drawSimulationNominees und drawSimulationBallots. balance.test.ts nutzt diese Funktionen statt der früheren automatischen Verurteilung eines einzigen Kandidaten. |
| Veraltete Heilungsmodelle | simulation.test.ts und die simulierten Hexen-/Magierentscheidungen in balance.test.ts verwenden wolfTarget. Die im Nachtrag vom 22.11.2026 beschriebenen victim-Prüferwartungen sind damit korrigiert. |
| Schon von Claude umgesetzt | Neue echte Tagesabstimmung, Fragenmodell des Magiers, Rollen-Varianten, Verlauf und Todesreihenfolge wurden erhalten. An diesen produktiven Schnittstellen wurde nichts erneut implementiert. |

### Annahmen des Forschungsmodells

Die Kandidatenanzahl wird gleichverteilt zwischen eins und höchstens drei verschiedenen Personen aus dem zulässigen Verdachtspool gezogen. Der Pool darf öffentliche Verdachtsgewichte enthalten. Jeder berechtigte Wähler zieht einen zulässigen Kandidaten ohne Selbstwahl; Stummgeschaltete sind ausgeschlossen. Ein Kandidat ohne fremde Wahlmöglichkeit gibt keinen Stimmzettel ab. Im Zufallsmodell sind seine Wahlmöglichkeiten gleich wahrscheinlich, in Hinweismodellen proportional zu 1 + öffentlichem Verdachtswert. Die Bürgermeisterstimme zählt weiterhin allein durch die bestehende Spiellogik zweifach. Die simulierte Dorftrottel-Stimme setzt der Erzähler nach derselben Modellstrategie; die frühere Pflicht-Ja-Regel und eine daraus abgeleitete sichere Rollenidentifikation werden nicht verwendet. Historische Statistikfelder für diese Inferenz bleiben als Kompatibilitätsfelder mit null Treffern erhalten.

Die vorhandene Spiel-Logik entscheidet über Stichwahl und Ausscheiden. Bei erneutem Gleichstand geht der Tag weiter; das Forschungsmodell erlaubt höchstens einen weiteren Nominierungsversuch und beendet danach den Tag. Nacht, Nominierungskennung und Stichwahlrunde fließen in die reproduzierbaren Zufallsentscheidungen ein, damit eine Stichwahl nicht zwangsläufig dieselben Stimmen wiederholt. Diese Heuristiken sind Modellannahmen, keine zusätzlichen Spielregeln und keine vollständige Abbildung menschlicher Strategien oder koordinierter Wolfsabsprachen.

### Gezielte Prüfung und Aussagegrenzen

104 gezielte Tests und zwei gezielte Simulations-Kurzprüfungen mit zusammen 24 vollständigen Modellpartien bestanden. Kein Kombinations- oder Balance-Gesamtlauf. Neues Abstimmungsmodell: 100 % Zeilen, Zweige, Funktionen und Anweisungen abgedeckt. Typprüfung, ESLint, Format- und Schichtprüfung erfolgreich. Bestehende Magierführung, Tagesabstimmung und Todesreihenfolge erhalten und mitgeprüft. Keine neue Kalibrierung oder Änderung von Rollenpunkten/Wolfsgrenzen.

Neue Tests: requiredSilence.test.ts und simulationVoting.test.ts. Mitgeprüft: narrator, roleStep, narratorGuide, magician, combinedHealers, deathOrder und deathOrderGame. Die 22 vorhandenen Heiler-Tests sichern zusätzlich ausdrücklich ab, dass der Magier nach Hexenheilung wolfTarget behält und eine wirkungslose weitere Heilung einen Zauber verbraucht. Der bestehende Hammer-Integrationstest wählt jetzt ein tatsächliches Stummschaltungsziel statt freiwillig zu verzichten. Die lange Ablaufprüfung kontrolliert die Menge der Todesansagen unabhängig von ihrer separat in deathOrder geprüften Reihenfolge.

Für spätere schnelle Modellprüfungen nur die beiden Tests mit dem Namensanfang smoke-checks aus balance.test.ts und simulation.test.ts auswählen und WEREWOLF_SIMULATION=1 setzen. Jede dieser Kurzprüfungen spielt zwölf reproduzierbare Partien. Keine vollständigen Forschungsdateien starten, solange der Auftraggeber keinen breiten Lauf verlangt.

Historische Ja/Nein-Balancewerte und das neue Modell sind nicht direkt vergleichbar. Es wurden keine neuen Gewinnwahrscheinlichkeiten abgeleitet, keine Simulationsarchive überschrieben und keine Wolfsempfehlungen oder Rollenwerte neu kalibriert. Vorleseskript und weitere UI-Arbeiten bleiben wie vereinbart separat. Quelländerungen liegen direkt im aktuellen Branch game/werewolf-ui unter C:/Users/Kosta/source/repos/GameHub; der ältere isolierte Logik-Arbeitsordner wurde nicht über diesen neueren Code kopiert.


## Entscheidende Ergebnisunterschiede für Claude (Nachtrag zu We-03-69, 22.11.2026)

| Punkt | Ergebnis und Konsequenz |
| --- | --- |
| Entferntes Amulett-Intro | Nach dem letzten roleSeen folgt unmittelbar der reguläre erste Nachtschritt. Es wird weder amuletIntro noch amuletReady benötigt. Geprüft mit Wölfen, Amor, Leibwächter und Dorfmatratze als Einstieg. |
| Amulettbesitz und Nachtende | Startbesitz bleibt bestehen; amuletPass ist weiterhin der reguläre letzte Nachtschritt. Der weggefallene Benachrichtigungsschritt ändert keine Schutz- oder Weitergaberegel. |
| Gezielte Prüfung | Acht Tests bestanden: sechs Nachtstart-Varianten und die bestehenden Prüfungen für Startvergabe und Weitergabe am Nachtende. Typprüfung, ESLint und Formatprüfung bestanden. Neue Regressionen stehen ausschließlich in src/business/games/werewolf/amulet.test.ts. |
| Anfängliche Simulationsfehler | Reproduziert bei Sechser-Aufstellungen mit Leibwächter beziehungsweise Amulett: simulation.test.ts erwartete fälschlich eine Ablehnung von Heilung, wenn victim null war. Bei abgewehrtem Angriff ist wolfTarget aber gesetzt; Heilung ist nach bestätigter Regel gültig und verbraucht die Ressource. Das war eine veraltete Prüferwartung, kein durch den Intro-Wegfall nachgewiesener Fehler der Produktionslogik. |
| Abgebrochener Gesamtlauf | Auf ausdrücklichen Wunsch des Auftraggebers gestoppt. Kein erfolgreich abgeschlossener Gesamtlauf und keine neue Balance-Abnahme. Teilweise ausgegebene Modellquoten sind kein belastbarer Vorher-/Nachher-Vergleich. Daraus keine Wolfszahlen, Rollenpunkte oder Gewinnwahrscheinlichkeiten ändern. |

**Bei späteren Arbeiten an den langen Simulationen beachten:** Die kurzzeitig korrigierten Testdateien wurden vollständig auf den Ausgangsstand zurückgesetzt. In simulation.test.ts verwenden die Heilungs-Erwartungen für Hexe und Magier weiterhin victim statt wolfTarget. Auch die simulierten Heilerentscheidungen in balance.test.ts greifen noch auf victim zu und kennen damit den tatsächlichen Schutzstatus, den diese Rollen nach aktueller Regel nicht erfahren sollen. Erst diese Prüferwartungen/Modelle anpassen, bevor ein späterer breiter Lauf interpretiert wird. Das ist unabhängig vom entfallenen Amulett-Intro und wurde in der gezielten Aufgabe nicht umgesetzt.

**Produktionscode:** Durch We-03-69 unverändert. Historische Simulationsarchive und Balance-Kalibrierung ebenfalls unverändert. Die acht erfolgreichen Tests belegen den eingegrenzten Übergang und die geprüfte Amulettweitergabe; sie sind kein Beweis für sämtliche möglichen Spielverläufe.


Beschluss des Auftraggebers vom 21.11.2026 (We-01-54): Hexe und Magier sehen immer die angegriffene Person als Wolfsopfer, auch wenn das Amulett oder der Leibwächter den Angriff abgefangen hat. Der Zustand hat dafür das Feld `wolfTarget` (die angegriffene Person) neben `victim` (wer wirklich stirbt); Heilen prüft `wolfTarget`. Ein Angriff auf die abwesende Dorfmatratze geht weiter ins Leere (kein Opfer). Die frühere Aussage, sie sähen nach einem abgefangenen Angriff kein Opfer, ist ersetzt.

Beschluss des Auftraggebers vom 21.11.2026 (We-01-53): Die Einstellung „Rollen nach dem Ausscheiden“ (Aufdecken oder Geheim) entfällt. Das Spiel nennt nie die Rolle einer ausgeschiedenen Person (Ansagen enthalten nur Namen; `werewolfAnnouncement` liefert `{ name }`). Der Erzähler weckt nur Rollen, die noch leben; es gibt keine Tarnaufrufe für Tote mehr. Erhalten bleiben die Aufrufe für lebende Rollen mit verbrauchter Fähigkeit (Hexe ohne Tränke, Magier ohne Zauber, Bürgermeister nach dem Hammer) und für einen noch nicht enthüllten Trunkenbold. Wer am Tag ausscheidet, darf seine Rolle aufdecken, muss es aber nicht; das regeln die Spieler selbst, die App verlangt nichts. Die Gruppe leitet aus den Aufrufen der Nacht ab, wer fehlt. Der Jäger verrät sich durch seinen Schuss; das ist gewollt. Ältere Aussagen zu offener oder geheimer Aufdeckung und zu Tarnaufrufen für Ausgeschiedene sind damit ersetzt. Gespeicherte Entwürfe mit dem alten Feld werden weiter gelesen, das Feld wird ignoriert.

Aktueller Nachtablauf (We-03-68, 21.11.2026): Nicht gezogene Pool-Rollen und Zusätze werden übersprungen. Tarnaufrufe gelten nur für tatsächlich vorhandene verdeckte Rollen beziehungsweise verbrauchte Fähigkeiten. nightRolePool, nightItemPool und nightMayUseHammer sind entfernt. Änderungen sind im Logik-Arbeitsordner und gezielt im Werwolf-UI-Arbeitsstand übernommen. Die gewichtete variable Ziehung und Zahlenbeispiele stehen in [GAMEHUB_WERWOLF_VARIABLE_API.md](GAMEHUB_WERWOLF_VARIABLE_API.md); ältere widersprechende Tarn-/Gewichtungsaussagen sind ersetzt.

Aktueller variabler Modus (We-03-67, 20.11.2026): Die Wünsche 1–7 aus dem Abschnitt „Variable Rollen“ sind logisch implementiert. Muss-/Darf-Pools, Variantenmengen, ausgewählte Wolfszahlen und unabhängige 50-%-Zusätze ersetzen itemRange und die Wolfsberechnung nach Ziehung. Aktuelle Signaturen, Wahrscheinlichkeiten und UI-Metadaten: [GAMEHUB_WERWOLF_VARIABLE_API.md](GAMEHUB_WERWOLF_VARIABLE_API.md). Ältere gegenteilige Abschnitte sind historische Beschlussstände. Die Bedienoberfläche ist umgesetzt (We-01-32); die Ziehung beim Spielstart folgt mit We-01-52.

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
| `amuletPass` | Übergabe `passAmulet` mit `target`. `mustPass` beachten. Eine Mitteilung zu Beginn (`amuletIntro`, `amuletReady`) gibt es seit dem 22.11.2026 nicht mehr; der Träger sieht das Amulett auf seiner Rollenkarte. |
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
| `day` | `nominate` mit `nominees` (eins bis drei Personen); oder `endDay` ohne Abstimmung. |
| `vote` | `vote` mit aktueller `nomination` und `ballots` (Wähler zu gewählter Person, vollständig, nie für sich selbst). Bürgermeister mit doppelter Stimme zählt zweifach, der Dorftrottel wird vom Erzähler gesetzt; Gleichstand: einmal `round: 2`. |
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

Die fünf Typfehler sind am 21.11.2026 behoben; die Gesamt-Typprüfung (`tsc -b`) ist wieder grün. Die Logik-Typprüfung und alle 1.472 normalen Tests im UI-Arbeitsstand bestehen. Lange historische Forschungs-/Balance-Läufe wurden nicht erneut gestartet. Es wurde weder committed noch gepusht.
