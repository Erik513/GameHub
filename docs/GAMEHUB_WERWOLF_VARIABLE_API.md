# Werwolf – API für variable Rollen

Stand: 21.11.2026, We-03-68. Wünsche 1–7 aus GAMEHUB_WERWOLF_UI.md sind in der Business-Logik umgesetzt. Diese Schnittstelle ersetzt die frühere variable Auswahl mit itemRange und nachträglicher automatischer Wolfsberechnung. UI und getrennte Speicherung der Entwürfe bleiben bei Claude Code. Quellordner: src/business/games/werewolf/, Branch game/werwolf.

## Geänderte Funktionen

| Funktion in variableSetup.ts | Aufgabe |
| --- | --- |
| analyzeVariableWerewolfSelection(players, selection, settings?) | Reine Machbarkeit ohne Zufall oder Bewertung; liefert verfügbare Anzahlen, Eintrags-/Optionssperren und Startfreigabe. |
| drawVariableWerewolfLineup(players, selection, random, settings?) | Private Ziehung der ausgewählten Wolfszahl, Darf-Rollen, Varianten und Zusätze. |
| createVariableWerewolf(playersText, narrator, random, selection, settings?) | Einmalige private Ziehung und geprüfte Rollenverteilung. Die gezogene Wolfszahl bleibt unverändert. |
| recommendVariableWerewolfCount(players, selection, settings?) | Neue reine Empfehlung nur anhand der Muss-Rollen, Muss-Zusätze und ihrer festen Varianten. |

Alle Ergebnisse haben entweder ok:true oder ok:false mit reason. Die Signaturreihenfolge bleibt wie oben; insbesondere unterscheiden sich die Positionen von random beim Ziehen und beim Erstellen.

## Eingabe und Beispiel

```ts
const selection: VariableWerewolfSelection = {
  requiredRoles: ["idiot"],
  rolePool: ["hunter", "bodyguard", "nightGuest"],
  roleOptions: { hunterShot: ["optional", "required"] },
  roleRange: { minimum: 0, maximum: 2 },
  requiredItems: ["amulet"],
  itemPool: ["drunk"],
  wolfCounts: [3, 4],
};
const summary = analyzeVariableWerewolfSelection(14, selection);
const recommendation = recommendVariableWerewolfCount(14, selection);
// Only on the explicit private start action:
const result = createVariableWerewolf(playersText, narrator, random, selection);
```

requiredRoles und requiredItems dürfen fehlen und bedeuten dann leer. rolePool/itemPool enthalten ausschließlich Darf-Einträge, ohne Überschneidung mit Muss. Nein-Einträge fehlen in beiden Pools. Die feste Seherin, Wölfe und aufgefüllte Dorfbewohner gehören nicht in die Sonderrollenpools. Der Erzähler zählt nicht zur Spielerzahl.

roleRange zählt nur Darf-Rollenfamilien: Leibwächter und Dorfmatratze bilden eine Familie und werden höchstens einmal gezogen. Beide dürfen auf Darf stehen; ein Muss-Leibwächter sperrt die Darf-Dorfmatratze und umgekehrt. Dorftrottel bleibt separat. Zwei feste Schutzalternativen sind unmöglich. Für die UI sollte die gesperrte Alternative auf Nein gesetzt werden; ein veralteter Darf-Eintrag wird beim Ziehen nicht zusätzlich berücksichtigt. Einstellungsoptionen wie zwei Jägerschussvarianten erhöhen weder Rollenanzahl noch Ziehungsgewicht. Echte alternative Rollenkarten wie Leibwächter/Dorfmatratze werden dagegen für die Auswahl ihrer Gruppe gewichtet (siehe unten).

roleOptions enthält optional je Rolle eine nichtleere, duplikatfreie Menge:

| Rolle | Schlüssel | Werte |
| --- | --- | --- |
| Jäger | hunterShot | optional, required |
| Bürgermeister | mayor | doubleVote, hammer |
| Alte Vettel | allowSelfSilence | false, true |
| Gerber | tanner | anyDeath, voteOnly |
| Harter Bursche | toughGuy | wolfOnly, anyAttack |

Bei Muss muss die Optionsmenge genau einen Wert enthalten. Bei Darf werden mehrere Werte gleich gewichtet. Ohne explizite Menge gilt die einzelne Variante aus settings beziehungsweise der bestehende Standard. Hammer ist erst ab zehn Spielern zulässig. Leibwächter/Dorfmatratze bleiben zwei Rollenkennungen innerhalb einer Familie; sie benötigen keinen neuen Settings-Schlüssel.

wolfCounts ist verpflichtend und enthält mindestens einen duplikatfreien Wert aus availableWerewolfCounts(players). Ein Wert ist fest, mehrere werden gleichverteilt gezogen. Die Oberfläche initialisiert die Auswahl mit standardWerewolfCount(players). settings.wolfCount überschreibt diese Auswahl nicht; auch settings.amulet/drunk werden durch die tatsächlichen Zusatzpools ersetzt. Andere validierte Partieeinstellungen bleiben erhalten.

itemRange entfällt vollständig. Ein alter Aufrufer erhält obsoleteItemRange und muss migriert werden. Jeder Muss-Zusatz ist sicher dabei; jeder Darf-Zusatz wird unabhängig mit 50 % aufgenommen. Zusätze verbrauchen keine Rollenplätze. Trunkenbold setzt mindestens neun Spieler und zwei Wölfe voraus, Amulett mindestens zehn Spieler; Rollenfreigaben und Heiler-Ausnahmen gelten unverändert.

## Ziehung und Wahrscheinlichkeiten

1. Unter den ausgewählten Wolfszahlen gleichverteilt ziehen.
2. Unter den für genau diese Wolfszahl machbaren Darf-Anzahlen innerhalb von roleRange gleichverteilt ziehen.
3. Genau A Rollenfamilien gewichtet ziehen: Jede einzelne alternative Rollenkarte soll dieselbe Teilnahmechance bekommen. Eine Gruppe mit zwei Rollenkarten erhält daher das doppelte Gewicht einer Gruppe mit nur einer Karte. Gruppen sind höchstens sicher dabei (100 %); verbleibende Chance wird auf andere Gruppen verteilt. Die konkreten Teilmengen sind damit nicht gleich wahrscheinlich.
4. Je gezogener Familie die erlaubte Rollenkarte gleichverteilt wählen (Leibwächter/Dorfmatratze beziehungsweise gegebenenfalls Hexe/Magier), anschließend je gezogener Rolle ihre erlaubte Einstellungsvariante gleichverteilt wählen.
5. Je Darf-Zusatz eine unabhängige faire Münze; Muss-Zusätze hinzufügen.
6. Erst beim Spielstart die fertigen Karten privat auf Spieler verteilen. Es gibt keine erneute Bewertung oder Korrektur der Wolfszahl.

Eine einzige Auswahlmöglichkeit benötigt keinen Zufallswert. Die kanonische Sortierung macht die Ziehung unabhängig von der Eingabereihenfolge. random muss für jeden tatsächlich benötigten Wert eine endliche Zahl ab 0 und kleiner 1 liefern. Ungültige Werte führen zu invalidRandom; Fehler, die der Zufallsanbieter selbst wirft, werden weitergereicht.

Die frühere Gleichgewichtung von Rollen-/Zusatz-Zahlenpaaren ist durch Wunsch 6 ersetzt: Zwei optionale Zusätze erzeugen vier gleich wahrscheinliche Kombinationen; null/ein/zwei Zusätze haben damit 25/50/25 %. Einstellungsvarianten erhöhen nicht die Teilnahmechance einer Rolle. Mehrere alternative Rollenkarten erhöhen dagegen das Gewicht ihrer gemeinsamen Familie.

### Beispiele und Grenzen der Gewichtung

Darf-Pool: Leibwächter, Dorfmatratze, Amor und Hexe. Leibwächter/Dorfmatratze bilden zusammen eine Gruppe mit Gewicht zwei, Amor und Hexe jeweils eine mit Gewicht eins. Gezählt werden höchstens drei Gruppen:

| Feste Darf-Anzahl A | Leibwächter | Dorfmatratze | Amor | Hexe |
| --- | --- | --- | --- | --- |
| 1 | 25 % | 25 % | 25 % | 25 % |
| 2 | 50 % | 50 % | 50 % | 50 % |
| 3 | 50 % | 50 % | 100 % | 100 % |

Bei A = 3 ist Gleichheit unmöglich: Die Wächtergruppe kann nicht häufiger als immer gezogen werden und daraus kommt nur eine Karte. Andere Rollen sind dann sicher dabei. Die Gewichtung heißt nicht, dass sämtliche zulässigen vollständigen Kombinationen gleich häufig auftreten.

Hexe und Magier werden je gezogener Wolfszahl gruppiert (familiesForWolves): Wo beide gemeinsam erlaubt sind, zählen sie als zwei eigenständige Darf-Rollen; wo beide nicht gemeinsam erlaubt sind und beide auf Darf stehen, zählen sie als eine Familie mit Gewicht zwei und anschließender 50/50-Kartenwahl. Gemeinsame Teilnahme ist ab 14 Spielern mit vier Wölfen und ab 17 auch mit fünf Wölfen erlaubt. Zwei Muss-Heiler sind ausschließlich mit einer dafür freigegebenen Spieler-/Wolfszahl zulässig. Eine Muss-Hexe plus Darf-Magier bleibt eine feste und eine optionale Karte; unzulässige Kombinationen werden ausgeschlossen.

Technisch nutzt pickFamilies die marginalen Familienchancen aus familyChances, eine zufällige Reihenfolge und einen zufälligen Startpunkt. Es zieht genau A Familien. Bei unzulässigen Teilmengen wiederholt es bis zu 200 Versuche und verwendet danach eine gleichverteilte zulässige Teilmenge als Rückfall. Die Gleichheit einzelner Rollen ist deshalb ein Ziel unter den Kombinationsgrenzen; bei zusätzlichen Ausschlüssen und im Rückfall wird keine exakte Gleichheit versprochen. An dieser bestehenden Ziehung wurde in We-03-68 nichts geändert.

Die Rollenanzahl ist bedingt auf die Wolfszahl gleichverteilt. Beispiel: 14 Spieler, Muss-Hexe, Darf-Magier, wolfCounts [3,4], roleRange 0–1. Drei Wölfe erlauben nur null Darf-Rollen; vier Wölfe erlauben null oder eine mit je 50 %. Die Wolfszahlen bleiben je 50 % wahrscheinlich; die Magierchance insgesamt beträgt 25 %. Ist für auch nur eine ausgewählte Wolfszahl innerhalb des gewünschten Bereichs nichts machbar, wird der Start gesperrt, statt diese Wolfszahl heimlich auszulassen oder anders zu gewichten.

## Öffentliche Analyse für die Oberfläche

analyzeVariableWerewolfSelection liefert keine Ziehung, keine Rollenzuteilung und keine geheimen Ergebnisse. Ein gültiger, aber unmöglicher Entwurf darf ok:true und canStart:false liefern.

- possibleRoleCounts und possibleRoleRange liefern die grundsätzlich machbaren Darf-Anzahlen über die ausgewählten Wolfszahlen hinweg. Sie ignorieren den aktuell eingegebenen Bereich, damit die UI ihn korrigieren kann; null bedeutet keine machbare Anzahl. Für die Startfreigabe immer zusätzlich canStart prüfen.
- wolfCounts liefert für alle freigegebenen Wolfszahlen selected, possibleRoleCounts und canStart. Damit erkennt die UI auch Unterschiede zwischen ausgewählten Zahlen; der globale Bereich allein garantiert nicht jede Zahl.
- groups enthält wolfCount, roleCount und choices für den aktuellen Bereich. choices zählt Rollenfamilien-Kombinationen, keine Kombinationen von Optionen oder Zusätzen und keine gleich gewichteten vollständigen Ergebnisse.
- roles liefert für alle Sonderrollen role, family, available, possible, required, optional, reason und options. Optionen liefern value, possible, selected, reason. Unterhalb ihrer Freigabe darf die variable UI Einträge ausblenden. Andere Sperren sind minimumPlayers, requiredAlternative, requiredOption, insufficientSeats oder incompatibleRoles.
- items liefert item, available, possible, required, optional und reason.

Eintragsverfügbarkeit prüft, ob eine Rolle zusätzlich zu den Muss-Rollen mit einer ausgewählten Wolfszahl grundsätzlich möglich ist. Sie ignoriert dafür die aktuelle Darf-Mindestzahl und andere lediglich optionale Karten. So bleibt eine bislang auf Nein stehende Rolle auswählbar; unzulässige gemeinsame Darf-Kombinationen werden bei der eigentlichen Machbarkeitsanalyse ausgeschlossen. Die UI muss nach jeder Änderung neu analysieren und canStart als verbindliche Freigabe verwenden.

Strukturell ungültige Eingaben liefern ok:false: invalidSelection, invalidPlayers, invalidRolePool, invalidItemPool, invalidRoleRange, invalidRoleOptions, invalidWolfCounts, obsoleteItemRange oder invalidSettings. Ziehung/Start liefern bei einer unmöglichen Aufstellung noFeasibleLineup; fehlende Sitze, alternative Rollen und Heilerbeschränkungen werden nicht übergangen.

## Ergebnis, Empfehlung und Geheimhaltung

drawVariableWerewolfLineup liefert lineup.roles, lineup.settings mit der konkreten wolfCount und den gezogenen Optionen/Itemflags sowie items. Das frühere lineup.balance entfällt: Eine Bewertung ist keine Eigenschaft der Zufallsziehung mehr. createVariableWerewolf liefert game. Analyse und Empfehlung dürfen während der Konfiguration laufen; Ziehung und Spielstart ausschließlich auf die ausdrückliche Startaktion, niemals beim Rendern oder wiederholtem Anzeigen der Rollen.

recommendVariableWerewolfCount benötigt nur requiredRoles, requiredItems und roleOptions. Ein kompletter Entwurf darf übergeben werden; Darf-Pools, Bereich, optionale Zusätze und gewählte Wolfszahlen haben keinen Einfluss. Die Ausgabe hat recommendedWolfCount und balance. Sie nutzt die bestehende Bewertung und den freigegebenen automatischen Resolver, einschließlich der kalibrierten Korrekturen und Grenzen; eine neue Bewertung ist für diese Empfehlung nicht erforderlich. Sie bleibt eine Modellschätzung, keine gemessene menschliche Gewinnwahrscheinlichkeit. Eine Empfehlung kann außerhalb der momentan markierten, aber innerhalb der grundsätzlich freigegebenen Wolfszahlen liegen und wählt keinen Button selbst aus.

Für Muss-Rollen gelten nur feste Varianten. Unmögliche Muss-Konfigurationen liefern noFeasibleLineup; optionale Varianten ohne Muss-Rolle werden in der Empfehlung ignoriert.

Das Nachtskript verwendet ausschließlich tatsächlich verteilte Rollen und Zusätze. Nicht gezogene Pool-Einträge sind skip und erzeugen keinen Zustand nightCall. Tarnaufrufe bleiben für tatsächlich vorhandene verdeckte Rollen erhalten: etwa tote Rollen ohne öffentliche Aufdeckung, noch verdeckte Trunkenbold-Rollen und verbrauchte Fähigkeiten. Ein nicht gezogener Bürgermeister oder die Variante doubleVote erzeugt keinen Hammer-Aufruf. Ein nicht gezogener Trunkenbold oder Lehrling erzeugt keinen eigenen Aufruf.

Die ehemaligen Felder nightRolePool, nightItemPool und nightMayUseHammer sind entfernt. Sie werden weder in Match benötigt noch durch createVariableWerewolf oder createRandomWerewolf gesetzt. Alte gespeicherte Zusatzfelder beeinflussen das Skript nicht. nightCall und acknowledgeCall bleiben für die legitimen Tarnaufrufe erhalten. Keine UI- oder Übersetzungsänderung in We-03-68. Übrige Erzähler-API siehe GAMEHUB_WERWOLF_NARRATOR_API.md.
