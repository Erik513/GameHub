# Werwolf – fertige Logikschnittstellen für die Erzähleroberfläche

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


Aktueller Nachtablauf (We-03-68, 21.11.2026): Nicht gezogene Pool-Rollen und Zusätze werden übersprungen. Tarnaufrufe gelten nur für tatsächlich vorhandene verdeckte Rollen beziehungsweise verbrauchte Fähigkeiten. nightRolePool, nightItemPool und nightMayUseHammer sind entfernt. Änderungen sind im Logik-Arbeitsordner und gezielt im Werwolf-UI-Arbeitsstand übernommen. Die gewichtete variable Ziehung und Zahlenbeispiele stehen in [GAMEHUB_WERWOLF_VARIABLE_API.md](GAMEHUB_WERWOLF_VARIABLE_API.md); ältere widersprechende Tarn-/Gewichtungsaussagen sind ersetzt.

Aktueller variabler Modus (We-03-67, 20.11.2026): Die Wünsche 1–7 aus dem Abschnitt „Variable Rollen“ sind logisch implementiert. Muss-/Darf-Pools, Variantenmengen, ausgewählte Wolfszahlen und unabhängige 50-%-Zusätze ersetzen itemRange und die Wolfsberechnung nach Ziehung. Aktuelle Signaturen, Wahrscheinlichkeiten und UI-Metadaten: [GAMEHUB_WERWOLF_VARIABLE_API.md](GAMEHUB_WERWOLF_VARIABLE_API.md). Ältere gegenteilige Abschnitte sind historische Beschlussstände. Die UI-Anbindung bleibt separat.

Stand: 20.11.2026. Dieser Stand ersetzt ältere Aussagen „noch nicht implementiert“ zu Hammer, Zielkatalog, Tarnskript, Todesursachen und Spielerprojektion. Umsetzung im Arbeitsordner `C:/Users/Kosta/Documents/Codex/2026-11-09/p/work/gamehub-branches/werwolf`, Branch `game/werwolf`. Noch nicht automatisch in den parallel entwickelten UI-Branch übernommen. Keine UI-Dateien aus dem älteren Logik-Arbeitsordner über neuere Claude-Dateien kopieren.

## Neue beziehungsweise ergänzte Dateien

Alle Quellpfade unter `src/business/games/werewolf/`:

| Datei | Öffentliche Schnittstelle |
| --- | --- |
| `stateMachine.ts` | `transitionWerewolf`, `WerewolfState`, `WerewolfEvent`; neue Felder `history`, `hammerVictim`, nightCall für vorhandene verdeckte Rollen; frühere Pool-Metadaten in We-03-68 entfernt. |
| `selectors.ts` | `validTargets`, `votingPlayers`, `describePlayers`. |
| `nightScript.ts` | `nightScript(state)`, Typen `NightRole`, `NightCall`. |
| `eventLog.ts` | Typen `WerewolfLogEntry`, `DeathSource`, `DeathCause`; Aufzeichnung automatisch im Zustandsübergang. Nicht zusätzlich aus der UI aufrufen. |
| `wounds.ts` | `delaysToughGuyAttack` als gemeinsame Regel für verzögerte Angriffe und Logging; Typ `WoundCause`. |
| `session.ts` | `createWerewolfSession`, `advanceWerewolfSession`, `undoWerewolfSession`. |
| `variableSetup.ts` | Muss-/Darf-Auswahl, Varianten, Analyse, private Ziehung und reine Muss-Empfehlung; vollständige Migration in GAMEHUB_WERWOLF_VARIABLE_API.md. |
| `narrator.test.ts` | Schnittstellentests und 100 reproduzierbare komplette Partien mit allen Rollen, Privatsphärevarianten und Todesursachen. |

## Hammer und gemeinsame Auflösung

Reihenfolge: Amor/Liebespaar nur Nacht eins, Trunkenbold-Enthüllung Nacht drei, Leibwächter/Dorfmatratze, Wölfe, Seherin beziehungsweise Lehrling, Ermittler, Hexe, Magier, Bürgermeister mit Hammer ab Nacht zwei, Spellcaster, Morgenauflösung. Nach dem Spellcaster folgt am Nachtende amuletPass, danach morning und gegebenenfalls der Jägerschuss. Das Amulett-Intro vor der ersten Nacht (`amuletIntro`) entfällt seit dem 22.11.2026: Der Träger erfährt es auf seiner Rollenkarte.

Der Bürgermeister darf nach dem Magier jede zu Nachtbeginn lebende Person außer sich selbst wählen. Bis zur Morgenauflösung entfernt keine reguläre Nachtaktion eine Person aus `alive`. Auch ein ausstehendes Wolfs-, Gift- oder Magieropfer darf seine Rolle noch ausführen. Treffer gegen Wölfe und Fehlhammer werden gemeinsam mit den übrigen Todesfällen aufgelöst; jeder Name scheidet höchstens einmal aus. Amulett schützt weder ein getroffenes Wolfsziel noch den Bürgermeister vor dem Hammer oder der Fehlentscheidungsstrafe; Liebeskummer bleibt ebenfalls tödlich. Leibwächterschutz wehrt den Hammer nicht ab. Nach dem Hammer bereits ausgeführte Aktionen bleiben bestehen. Siegprüfung erst nach Auflösung einschließlich eines erforderlichen Jägerschritts.

Die Magierheilung wurde **nicht erweitert**: weiterhin nur das aktuelle ungeheilte Wolfsopfer, nicht Hexengift oder Hammerfolgen.

## Gültige Ziele und Stimmen

`validTargets(state, action?, selection?)` liefert Namen in Sitzreihenfolge. Ohne `action` gilt die Hauptaktion des aktuellen Zustands. Andere Aktionsarten im falschen Zustand liefern `[]`. Der Selektor prüft durch reine Probeübergänge gegen dieselbe Zustandsmaschine; kein Zufall, keine Mutation und keine zusätzlichen Einträge im tatsächlichen Log.

Aktionskennungen: `attack`, `protect`, `stayWith`, `hammer`, `inspect`, `investigate`, `poison`, `kill`, `silence`, `shot`, `passAmulet`, `bond`, `nominate`.

`selection` hat optionale Felder `selected:string[]`, `heal:boolean`. Für den zweiten Amorpartner `selected:[ersterName]` übergeben. Für einen weiteren Todeszauber bereits ausgewählte Ziele und eine gegebenenfalls geplante Heilung übergeben; verbliebene Zauberkosten werden mitgeprüft. Heilung/Gift und Zauberkombinationen bleiben durch die Fachereignisse validiert.

Bei Tagesabstimmungen: `validTargets(state, "nominate", { selected })` liefert die noch nominierbaren lebenden Personen (höchstens drei insgesamt). Nach `nominate` mit `nominees` liefert `votingPlayers(state)` während `vote` pro abstimmender Person `{name, choices, setByNarrator, weight}`: `choices` sind die Kandidaten ohne die Person selbst, `setByNarrator` markiert den Dorftrottel (der Erzähler setzt seine Stimme), `weight` ist 2 beim Bürgermeister mit doppelter Stimme. Stumm gemachte sind ausgeschlossen. An den Reducer geht `vote` mit `ballots` (Wähler zu gewählter Person), vollständig für alle mit `choices`.

`[]` bedeutet keine wählbaren Ziele, nicht automatisch „Weiter“. Manche Aktionen erlauben Verzicht `null`, andere benötigen zwingend ein Ziel. Dafür gilt unverändert `WerewolfEvent` und der Fachablauf.

## Nachtskript und Tarnaufrufe

`nightScript(state)` ist eine **private** Übersicht der festen Reihenfolge. Jeder Eintrag liefert `{id,announcementRole,mode,actors}` mit `mode: active | cover | skip`. Aktive Namen nur dem Erzähler zeigen. Tote Rollen bei offener Aufdeckung auslassen, bei geheimer Aufdeckung als Tarnaufruf führen. Verbrauchte Einmalfähigkeiten beziehungsweise vollständig verbrauchte Ressourcen bleiben Tarnaufrufe; bei einer teilweise ausgestatteten Hexe wird die verbleibende Option weiterhin normal angeboten. Amor und Trunkenbold behalten ihre festen Nächte.

Die Zustandsmaschine führt erforderliche Tarnschritte tatsächlich als `status: "nightCall"` aus. `state.call` nennt die Rolle; `wakingPlayers(state)` und `validTargets(state)` liefern dafür keine Personen. **Nur** `{type:"acknowledgeCall",night:state.night}` bestätigt den Tarnschritt. Rollenaktionen und veraltete Nachtkennungen ändern dabei nichts. Die interne Fortsetzung `resume` niemals selbst auswerten oder mutieren; keine eigenen Sprünge bauen.

Zufalls-/variable Einstiege verwenden für Nachtaufrufe ausschließlich tatsächlich verteilte Rollen und Zusätze. Nicht gezogene mögliche Rollen erzeugen skip und keinen nightCall. Ein Trunkenbold oder Seher-Lehrling wird nur berücksichtigt, wenn er tatsächlich im Spiel ist. Tote vorhandene Rollen behalten Tarnaufrufe bei geheimer Aufdeckung; verdeckte Trunkenbold-Rollen und verbrauchte Fähigkeiten ebenfalls. Ein nicht gezogener Bürgermeister und doubleVote wecken keinen Hammer. Die Felder nightRolePool, nightItemPool und nightMayUseHammer entfallen; auch alte gespeicherte Felder haben keinen Einfluss. Die Weitergabe des Amuletts erfolgt nur bei tatsächlichem Träger.

## Strukturiertes Ereignisprotokoll

`state.history` ist das private, rein im Partiezustand geführte Log. Keine Datenbank, externe Übertragung oder zusätzliche dauerhafte Speicherung wird durch das Logging eingeführt. Claude kann diese Fakten für kurze deutsche/englische Texte, Detailfelder und später eine Verlaufsoberfläche verwenden.

Jeder Eintrag hat eine fortlaufende `id`, `night`, die genaue `phase` und `period: setup | night | day`. Es gibt drei Arten:

- `kind: action`: bestätigtes Fachereignis `event`, aufwachende Rollenpersonen `actors` und normalisierte `targets` (einschließlich tatsächlichem Heilziel). Bei Abstimmungen stehen die gewählten Ja-Stimmen im Ereignis. Ein Aktionsziel ist kein bereits bestätigter Todesfall.
- `kind: death`: `player`, tatsächliche `role`, `diedMasked` und `sources[]`. Jede Quelle hat `cause`, `actors[]`, `originNight`. Bei überlappenden wirksamen Angriffen bleiben mehrere Quellen erhalten, während die Person nur einen Todeseintrag erhält.
- `kind: injury`: verzögerte Verwundung des Harten Burschen mit `player` und angreifenden `actors`. Beim späteren Tod bleibt die ursprüngliche Angriffsnacht erhalten.

Todesursachen: `wolves`, `witchPoison`, `magicianKill`, `hammer`, `hammerBackfire`, `vote`, `hunter`, `heartbreak`, `toughGuy`. Liebeskummer verweist unter `actors` auf den verstorbenen Partner. Beim Wolfsangriff sind es die gemeinsam handelnden Wölfe. Bei alten Ereignissen mit bloßer Ja-Anzahl sind nicht alle Abstimmenden namentlich rekonstruierbar; daher neue Oberfläche immer mit `yesVoters` anbinden. Erzwungene Dorftrottel-Zustimmung wird bei bekannten Todesquellen berücksichtigt.

Ungültige, doppelt bestätigte oder veraltete Ereignisse erzeugen keinen zusätzlichen Logeintrag. Abgewendete Angriffe erzeugen eine Aktionsspur, keinen Tod. Rücknahme entfernt auch die zurückgenommenen Logfakten. Das Log enthält geheime Informationen: Öffentliche Morgenansagen weiterhin aus `werewolfAnnouncement`, niemals ungefiltert aus dem Log erzeugen.

## Spielerprojektion und Rücknahme

`describePlayers(state)` liefert pro Person `name`, `seat` (nullbasiert), tatsächliche `role`, `visibleRole`, `alive`, `death`, `amulet`, `drunk`, `partner`, `silenced`, `lastProtectionTarget`, `lastHostTarget`, `delayedDeathNight` und `resources`. Die letzten beiden Zielmarkierungen sind Rohfakten der letzten Auswahl, keine pauschale Immunität oder endgültige Farbvorgabe. Ressourcen enthalten entsprechend der Rolle `heal`/`poison`, `spells`, `hammer` oder `investigation`. Für private Erzählerdetails dürfen tatsächliche Rollen gezeigt werden; bei Weitergabe an Spieler gilt der Sichtschutz der Rollenverteilung.

Bei Tod als Trunkenbold bleibt das historische `diedMasked` erhalten. Wie die schon besprochenen Farben, Symbole und der Sonderfall einer Jäger-Enthüllung präsentiert werden, entscheidet die UI; neue Logikfarben werden nicht erfunden.

`createWerewolfSession(state)` legt `{present,past}` an. Bestätigte Ereignisse über `advanceWerewolfSession` weitergeben; ungültige Ereignisse legen keinen Snapshot an. `undoWerewolfSession` liefert entweder `{ok:true,session}` oder `{ok:false,reason:emptyHistory|confirmationRequired}`. Das Zurücknehmen einer Morgen- oder Ausschlussbekanntgabe benötigt `confirmed:true`; die Rückfrage baut Claude. Zustände und Log werden gemeinsam wiederhergestellt, kein Zufall wird ausgeführt. Nach Rücknahme und neuer Aktion gibt es keinen alten Zukunftspfad.

Die bestätigte lokale Fortsetzen-Funktion, Abbruchrückfrage und Erhalt der Vorbereitung werden in der UI-/Speicherintegration angeschlossen. Hier sind die reinen Zustandsdaten und Rücknahmefunktionen vorbereitet, keine Browser-Speicherung oder Navigation implementiert. Alte gespeicherte Zustände ohne neue Pflichtfelder nicht ungeprüft mit dem neuen Reducer laden.

## Verifikation

277 Tests bestanden, darunter 100 komplette deterministische Partien; alle neun Todesursachen erreicht, kein festhängender Zustand und kein mehrfaches Ausscheiden. Geprüfte Logik: 99,83 % Zeilen, 98,07 % Zweige; sämtliche kritischen Module über 95 %. TypeScript, ESLint und Schichtprüfung bestanden. Die historischen Gewinnwahrscheinlichkeiten in den Archiven wurden nicht neu berechnet und beziehen sich auf ihren damaligen Regelstand.

Gezielter Prüfaufruf:

```powershell
node node_modules/vitest/vitest.mjs run --configLoader runner --coverage --coverage.include='src/business/games/werewolf/{stateMachine,configuration,lineupBalance,balancedSetup,automaticSetup,variableSetup,fixedSetup,eventLog,nightScript,selectors,session,wounds}.ts' --coverage.reportsDirectory=coverage/narrator src/business/games/werewolf --exclude '**/balance.test.ts' --exclude '**/simulation.test.ts'
```


## Ergänzungen aus den Rolleninfos – implementiert am 20.11.2026

`WerewolfSettings.toughGuy` besitzt `wolfOnly` (Standard) und `anyAttack`. Die festen, automatischen und variablen Einstiege übernehmen die validierte Option. Ohne gewählte Rolle toughGuy wird keine zusätzliche Rollenkarte eingeführt. Im variablen Pool bleibt die Option eine Variante der gegebenenfalls gezogenen Karte.

Bei wolfOnly verzögert nur der Wolfsangriff den Tod. Bei anyAttack gilt dies auch für Gift, Todeszauber und Jägerschuss. Die Person bleibt bis zum Ende der Folgenacht im Spiel. Ein am Morgen getroffener Harter Bursche erlebt den folgenden Tag; bei einem Schuss nach Tagesabstimmung stirbt er am Ende der unmittelbar anschließenden Nacht. Nur ein frischer Wolfsangriff ist in seiner Angriffsnacht heilbar. Weitere Angriffe verschieben eine bestehende Frist nicht. Abstimmung, Hammerfolgen und Liebeskummer werden nicht verzögert. Verdeckte Trunkenbold-Rollen haben weiterhin keine aktive Verteidigungsfähigkeit.

`toughGuyWound` enthält `cause`, `actors`, `night`. Injury-Logeinträge tragen jetzt ebenfalls `cause`; ein späterer Tod erhält `sources[].attackCause` samt ursprünglicher Nacht und handelnden Personen. `describePlayers` gibt zusätzlich `wound` zurück.

`NightCall.announcementRole` ist die Kennung für das öffentliche Erzählerpreset. Der technische Seher-Schritt behält `id: seer`; nach dem Tod der Seherin wird `announcementRole: apprenticeSeer` verwendet. Die öffentliche Benennung darf diesen Tod erkennen lassen. Der eigentliche inspect-/closeVision-Ablauf bleibt bestehen. Das Nachtskript enthält am Ende amuletPass mit aktivem Besitzer oder skip ohne Amulett.

`amuletPass` enthält wie morning die ausstehenden `victim`-/`poisoned`-Daten und liegt jetzt vor jeder Morgenauflösung. passAmulet führt zu morning, nicht mehr zum Tag. Es gibt keine zweite Übergabe nach dem morgendlichen Jägerschuss. Ein Jägerschuss wird nicht vom Amulett abgewehrt und löst keine Weitergabepflicht aus. Der Schutz wird im Zeitpunkt jeder Angriffsaktion geprüft: Frühere Abwehr bleibt auch nach Abgabe erhalten, neue Besitzer werden nicht rückwirkend gerettet, ehemalige Besitzer sind gegen spätere Angriffe ungeschützt. Unabhängig vom Besitzer blockiert das Amulett nur nächtlichen Wolfsangriff, Gift und Todeszauber, niemals Abstimmung oder Jägerschuss. Hammer umgeht das Amulett immer. Liebeskummer löst weder nachts noch tagsüber eine Weitergabepflicht aus. Der Träger darf das Amulett behalten; stirbt er mit seinem Partner, geht es verloren. Nur ein tatsächlich abgewehrter nächtlicher Angriff erzwingt die Weitergabe. Alte Verwundungen werden auch bei späterem Erwerb nicht geheilt.

Amors Selbstwahl war bereits zulässig und ist jetzt explizit getestet. Dieselbe Person zweimal als Paar bleibt ungültig. Leibwächter-/Dorfmatratzenregeln bleiben unverändert.

Für Claude: We-01-48 verbindet die neue optionale Rollenvariante, announcementRole und die geänderte Amulett-Zeitfolge mit der UI. Die Logik liegt weiter im Spiel-Arbeitsordner; diese Dokumentkopie integriert noch keine Code-Dateien in den UI-Branch. Das bisherige provisorische Punktesystem und historische Gewinnquoten wurden für die stärkere neue Variante nicht neu kalibriert.


## Zweite Regelrunde – implementiert in We-03-66

Die Schutzprüfung heißt intern nun absorbNightAttackWithAmulet und wird ausschließlich für Wölfe, Hexengift und Magiertodeszauber aufgerufen. exile wird immer normal aufgelöst: werewolfAnnouncement zeigt die ausgeschiedene Person unabhängig vom Amulett, announceExile entfernt sie aus alive, protokolliert den Tod und prüft unter anderem den Gerber-Sieg. Kein verborgenes abgefangenes Abstimmungsziel mehr.

Jägerschüsse prüfen das Amulett nicht. Sie töten normale Träger wie andere gültige Ziele; ein amulettragender Harter Bursche mit anyAttack wird wegen seiner Rolle verwundet, ohne dass mustPass gesetzt wird. Seine Frist und Logursache bleiben hunter.

endNight erzeugt keine künstliche Weitergabepflicht bei bevorstehendem Liebeskummer. Ohne eigenen abgewehrten Nachtangriff bleibt mustPass unverändert false. Bei Tod geht ein noch gehaltenes Amulett verloren; eine freiwillige Übergabe vor der Morgenauflösung bleibt möglich. Eine schon aus einem tatsächlich abgewehrten Nachtangriff bestehende Pflicht bleibt bestehen.

Verliebte dürfen sich gegenseitig als Wolfsziel wählen, nominieren und gegen den Partner stimmen, soweit die allgemeinen Rollenregeln dies erlauben. Gemeinsames Überleben ist ein freiwilliges Spielerziel und keine zusätzliche Zielvalidierung. Beide behalten ihre Rollen/Seiten; Wolfsparität einschließlich eines gemischten letzten Paars bedeutet Wolfssieg.

Ein noch verdeckter Trunkenbold-Wolf bleibt bis Anfang der dritten Nacht verdeckt. Ohne andere aufwachende Wölfe erscheint nightCall für wolves mit actors: [] und ohne erlaubtes attack-Ereignis; keine vorzeitige Enthüllung oder vorzeitiger Dorf-Sieg, solange ein tatsächlicher Wolf lebt. Diese bestehende Regel wurde ausdrücklich regressionsgeprüft.

UI-Anbindung weiterhin We-01-48: etwaige Optionen oder Rollentexte zum Amulettschutz bei Abstimmung, Schuss oder erzwungener Liebeskummer-Weitergabe entfernen. Die letzten verbindlichen Beschlüsse ersetzen die frühere weitergehende Schutzwirkung. Die historischen Balancewerte und das provisorische Punktesystem wurden nicht neu kalibriert.


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
