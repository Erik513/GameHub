# Werwolf – Rollenwerte und Wolfszahl-Empfehlung

Stand der Bewertung ist Version 1 vom 17.11.2026. Positive Punkte stärken im verwendeten Modell das Dorf. Negative Punkte begünstigen die Wölfe. Ein Punkt ist eine Recheneinheit für den Vergleich von Aufstellungen. Die Zahl entspricht keiner festen Änderung der Gewinnwahrscheinlichkeit.

## Wertetabelle

| Rolle oder Gegenstand | Punkte | Einordnung |
| --- | ---: | --- |
| Gewöhnlicher Dorfbewohner | 0 | Füllt einen Rollenplatz. |
| Seherin | +5 | Fester Bezugswert, da die Seherin in allen verglichenen Besetzungen Pflicht ist. |
| Leibwächter | +1 | Wehrt Angriffe auf sein wechselndes Schutzziel ab. |
| Dorfmatratze | +2 | Ist beim Besuch vor einem direkten Wolfsangriff geschützt und kann zum Wolfsopfer statt des Gastgebers werden. |
| Hexe | +3,5 | Ein Heiltrank und ein Gifttrank. |
| Magier | +7,5 | Zwei frei verwendbare Zauber. Die Simulation heilt häufig und nutzt Todeszauber zurückhaltend. |
| Jäger | +0,5 | Der Wert stammt aus Simulationen mit zufällig gewähltem Schussziel. |
| Amor | −0,5 | Gemeinsames Ausscheiden verändert das Zahlenverhältnis. Es gilt die aktuelle Siegprüfung mit Wolfssieg bei Gleichstand. |
| Dorftrottel | +0,5 | Seine Pflichtstimme kann im Modell zusätzliche Rückschlüsse ermöglichen. |
| Alte Vettel | −0,5 | Die Stummschaltung kann auch Dorfhinweise und Dorfstimmen schwächen. |
| Bürgermeister mit doppelter Stimme | +0,5 | Geheimer doppelter Stimmwert. |
| Bürgermeister mit Hammer | 0 | Der Hammer ersetzt die doppelte Stimme. Die Modelle verwenden überwiegend zufällige Ziele. |
| Harter Bursche | +0,5 | Überlebt den ursprünglichen Wolfsangriff bis zur nächsten Nacht. |
| Seher-Lehrling | +3 | Übernimmt die Seherfunktion nach deren Ausscheiden. |
| Paranormaler Ermittler | +0,5 | Dazu kommen die unten aufgeführten Kombinationspunkte. |
| Gerber | 0 | Das persönliche Siegziel beeinflusst die Dorfwertung im verwendeten Modell kaum. Beide Siegbedingungen haben dieselben Punkte. |
| Trunkenbold | −0,5 | Fähigkeiten stehen zunächst nicht zur Verfügung. Der Wert kann je nach verdeckter Rolle unterschiedlich wirken. |
| Schutzamulett | +1,5 | Kann einen zusätzlichen Tag ermöglichen. Seine späteren Träger können Werwölfe sein. |
| Werwolf | −7 je Wolf | Gegenwert für die Empfehlung der Wolfszahl. |

Seherin und gewöhnlicher Dorfbewohner sind feste Bezugspunkte der Skala. Die übrigen Werte werden anhand der gespeicherten Simulationen geschätzt und auf halbe Punkte gerundet. Die Tabelle beschreibt die angenommenen Spielweisen. Beispielsweise kann ein gezielt schießender Jäger mehr bewirken als sein hier verwendeter Zufallsschuss.

## Zusätzliche Einflüsse

| Kombination oder Einstellung | Zusatzpunkte |
| --- | ---: |
| Seherin und Paranormaler Ermittler mit kombinierten Hinweisen | +1,5 |
| Seher-Lehrling und Paranormaler Ermittler | +0,5 zusätzlich |
| Magier und Dorfmatratze | −0,5 |
| Alte Vettel darf sich selbst wählen | −0,5 |
| Werwölfe greifen bereits in der ersten Nacht an | −3,5 |

Die Kombinationswerte werden einmal zusätzlich zu den Rollenwerten angerechnet. Der Ermittler kommt mit der verpflichtenden Seherin damit auf insgesamt +2 zusätzliche Dorfpunkte. Mit Seher-Lehrling kommen weitere +0,5 Kombinationspunkte hinzu. Für die übrigen untersuchten Kombinationen ergab die gerundete Anpassung keinen zusätzlichen Wert über die Summe ihrer Einzelwerte hinaus.

Hexe und Magier sind beim Spielstart alternative Rollen. Ausnahmen: Bei vierzehn bis sechzehn Spielern mit vier Wölfen sowie bei siebzehn bis zwanzig Spielern mit vier oder fünf Wölfen dürfen beide gemeinsam gewählt werden. Die Wolfszahl-Empfehlung berücksichtigt diese Bedingung ebenso wie die gegenseitige Ausschließung von Leibwächter und Dorfmatratze.

## Punktbewertung als Grundlage der automatischen Festlegung

Nach der aktuellen UI-Entscheidung dient diese Bewertung bei festen Rollen als separate Empfehlung neben einer manuellen Wahl innerhalb erlaubter Werte. Bei variablen Rollen bestimmt sie die Wolfszahl verbindlich erst nach Ziehung der konkreten Rollen und Items. Der allgemeine Standard wird im festen Modus initial gewählt. Die Empfehlung erhält nur bei mehreren auswählbaren Zahlen einen Rand am Button und darunter „empfohlen“; lange Standardhinweise entfallen. Die neue feste Startpfadanpassung ist in `We-03-62` geplant. Der dafür geeignete normale Spieleinstieg ist in `We-03-50` validiert und umgesetzt.

Die Logik addiert Rollen-, Gegenstands- und Kombinationspunkte. Anschließend vergleicht sie die Summe mit einem Zielwert für die jeweilige Spielerzahl und Wolfszahl. Sie empfiehlt die passende Wolfszahl mit der kleinsten Abweichung. Dafür prüft sie anfängliche Wolfszahlen unter Berücksichtigung der Regeln der jeweiligen Spielerzahl und der freien Rollenplätze. Bis 16 bleiben die bisherigen Grenzen erhalten. Für 17 werden eins bis acht Wölfe verglichen. Sind zwei Vorschläge gleich weit entfernt, erhält die bisherige Standardzahl Vorrang.

Der Zielwert lautet Spielerzahl-Grundwert plus 7 Punkte je Wolf. Der Grundwert berücksichtigt, wie sich die Größe der Gruppe im Referenzmodell auswirkt. Die Seherin wird genau einmal mitgerechnet. Weitere gewöhnliche Dorfbewohner erhöhen die Rollensumme um jeweils 0.

| Spieler ohne Erzähler | Bisheriger Standard | Geprüfte Werte für den normalen Autopfad | Spielerzahl-Grundwert | Datenstand |
| ---: | ---: | --- | ---: | --- |
| 6 | 1 | 1 | −8,5 | Grundbesetzung aus bisherigen Vergleichen |
| 7 | 1 | 1 oder 2 | −9 | Grundbesetzung aus bisherigen Vergleichen |
| 8 | 2 | 1 oder 2 | −10 | Neuer allgemeiner Standard bestätigt; Punktziel bleibt aus bisherigen Vergleichen und ist vorläufig |
| 9 | 2 | 2 | −4,5 | Aus archivierten Vergleichen geschätzt |
| 10 | 2 | 2 | −4 | Aus archivierten Vergleichen geschätzt |
| 11 | 2 | 2 oder 3 | −9,5 | Aus archivierten Vergleichen geschätzt |
| 12 | 3 | 2 oder 3 | −8,5 | Beide Wolfszahlen verglichen |
| 13 | 3 | 3 | −8,5 | Aus archivierten Vergleichen geschätzt |
| 14 | 3 | 3 oder 4 | −10 | Beide Wolfszahlen verglichen |
| 15 | 3 | 3 oder 4 | −11,5 | Punktziel vorläufig aus 13 und 14 Spielern fortgeschrieben |
| 16 | 4 | 3 oder 4 | −13 | Punktziel vorläufig aus 14 und 15 Spielern fortgeschrieben |
| 17 | 4 | 3, 4 oder 5 | −14,5 | Punktziel vorläufig aus 15 und 16 Spielern fortgeschrieben |
| 18 | 4 | 3, 4 oder 5 | −16 | Punktziel vorläufig aus 16 und 17 Spielern fortgeschrieben |
| 19 | 4 | 3, 4 oder 5 | −17,5 | Punktziel vorläufig aus 17 und 18 Spielern fortgeschrieben |
| 20 | 4 | 3, 4 oder 5 | −19 | Punktziel vorläufig aus 18 und 19 Spielern fortgeschrieben |

Die Tabelle beschreibt die freigegebenen Werte für die spätere verbindliche automatische Festlegung. Die bestehende Forschungs-/Punktbewertung untersucht teilweise weitere Kandidaten, etwa eins bis acht bei 17. Das ist keine Freigabe dieser Werte für die normale Partie. Der Autopfad muss vor Verwendung auf die freigegebenen Kandidaten beschränkt und gegen die gespeicherten Balancefälle geprüft werden. Die Beispiele und Archive dokumentieren teilweise diese frühere explorative Bewertung; sie sind kein Nachweis, dass der aktuelle Punktescore bereits jede Pflichtentscheidung richtig trifft.

### Beispiele

| Aufstellung | Dorfpunkte | Vergleich der Zielwerte | Empfehlung |
| --- | ---: | --- | --- |
| 12 Spieler, Seherin und gewöhnliche Dorfbewohner | 5 | 2 Wölfe benötigen 5,5 Punkte, 3 Wölfe 12,5 Punkte | 2 Wölfe |
| 12 Spieler, Seherin und Magier | 12,5 | Ziel für 3 Wölfe beträgt 12,5 Punkte | 3 Wölfe |
| 14 Spieler, Seherin und gewöhnliche Dorfbewohner | 5 | Ziel für 2 Wölfe beträgt 4 Punkte, für 3 Wölfe 11 Punkte | 2 Wölfe, vorläufig |
| 14 Spieler, Seherin, Magier, Jäger, Leibwächter, Seher-Lehrling und Ermittler | 19,5 | Ziel für 3 Wölfe beträgt 11 Punkte, für 4 Wölfe 18 Punkte | 4 Wölfe |

### Prüfung mit 15 Spielern und Hexe

Die Aufstellung mit verpflichtender Seherin und Hexe erreicht 8,5 Dorfpunkte. Die aktuelle Bewertung vergleicht zulässige anfängliche Wolfs-Minderheiten von 1 bis 4 und empfiehlt **drei Wölfe**. Das archivierte Experiment enthält zusätzlich die inzwischen ausgeschlossenen höheren Wolfszahlen.

| Wölfe | Zielwert | Abstand zu 8,5 Dorfpunkten | Wolfssiege im Vergleich mit geteilten Hinweisen |
| ---: | ---: | ---: | ---: |
| 1 | −4,5 | 13 | 18,20 % |
| 2 | 2,5 | 6 | 34,43 % |
| 3 | 9,5 | 1 | 53,47 % |
| 4 | 16,5 | 8 | 69,87 % |
| 5 | 23,5 | 15 | 84,53 % |
| 6 | 30,5 | 22 | 95,67 % |
| 7 | 37,5 | 29 | 99,73 % |

Je Wolfszahl wurden 3.000 Zufallsstarts in fünf Modellen ausgeführt, insgesamt 105.000 Partien. Das Modell mit vorsichtiger Abstimmung ergab bei drei Wölfen 88,80 Prozent Wolfssiege. Das Ergebnis ist daher eine Prüfung unter den jeweiligen Modellannahmen. Die weitere Kalibrierung für andere Fünfzehner-Aufstellungen bleibt offen. [Archivierte Einzelwerte](simulations/werewolf-fifteen-player-witch.jsonl)

### Prüfung mit 15 Spielern ohne gewöhnliche Dorfbewohner

Vor der Freigabe gemeinsamer Heilrollen wurden mit den Standardeinstellungen ohne Amulett und Trunkenbold alle damals 1.590 zulässigen Rollenauswahlen ohne Füllrollen bewertet und über den regulären Spieleinstieg initialisiert. Seherin und Rollenplätze wurden mitgerechnet. Bei der Alten Vettel ist die Selbstwahl aus, beim Bürgermeister gilt die doppelte Stimme. Die folgende Tabelle dokumentiert diesen früheren Datenstand ohne gemeinsame Heilrollen; sie ist keine aktuelle Aufzählung aller zulässigen Konfigurationen.

| Wölfe | Seherin | Weitere Sonderrollen | Zulässige Auswahlen | Beste Punktabweichung vom Ziel |
| ---: | ---: | ---: | ---: | ---: |
| 3 | 1 | 11 | 4 | +6,5 |
| 4 | 1 | 10 | 40 | 0 |
| 5 | 1 | 9 | 181 | −2 |
| 6 | 1 | 8 | 489 | −9 |
| 7 | 1 | 7 | 876 | −16,5 |

Eine Besetzung mit vier Wölfen, Seherin, Dorfmatratze, Hexe, Jäger, Amor, Dorftrottel, Alter Vettel, Bürgermeister, Seher-Lehrling, Ermittler und Gerber erreicht 16,5 Dorfpunkte. Das entspricht dem Zielwert für vier Wölfe. Die frühere unbeschränkte Berechnung legte bei manchen starken Magier-Auswahlen fünf Wölfe nahe. Für diese Fünfzehner-Aufstellung ist die Wolfszahl ausgeschlossen; die Empfehlung für 15 berücksichtigt höchstens vier.

Wer alle elf gleichzeitig möglichen weiteren Sonderrollen besetzen will, hat nur Platz für drei Wölfe. Diese Besetzungen überschreiten das Punktziel um 6,5 bis 11 Punkte zugunsten des Dorfs. Eine Anpassung der Rollenanzahl ist daher für die Punktempfehlung relevant.

Das ist eine Bewertung des Punktesystems mit erfolgreicher Initialisierung der Aufstellungen. Neue Siegquoten wurden dafür nicht simuliert. Die Berechnung für 15 Spieler ist weiterhin vorläufig. [Archiv der Punkteberechnungen](simulations/werewolf-fifteen-player-special-role-points.json)

## Feste und variable Einrichtung

Das neue Zielverhalten bietet feste Sonderrollen/Items oder variable erlaubte Pools mit Mindest-/Höchstzahlen. Im variablen Modus werden eine passende Sonderrollenanzahl im Bereich, die kompatiblen Rollen, Items und Wolfszahl gemeinsam bestimmt. Nicht vergebene Spielerplätze sind normale Dorfbewohner. Pflichtrollen und Items zählen nicht zu optionalen Rollenplätzen. Amulett und Trunkenbold belegen keine zusätzlichen Plätze. Das Amulett ist im variablen Pool nicht garantiert enthalten, sondern wird innerhalb der erlaubten Grenzen mitgezogen oder ausgelassen.

Die bisher implementierte Ziehfunktion verwendet genau eine Rollenanzahl und zieht gleichverteilt aus kompatiblen Teilmengen. Sie ist damit ein Baustein, erfüllt aber das neue Bereichs- und Itemverhalten noch nicht vollständig. `We-03-52` ergänzt die Ziehung, legt die Verteilung über zulässige Ergebnisse fest und prüft sie vor dem UI-Einbau.

Die tatsächliche Ziehung, Anzahl und genaue Punktaufschlüsselung bleiben privat bei der Spielleitung. Mitspieler sehen bei der Ausgabe nur ihre eigene Rolle; vorab sehen sie den erlaubten Pool und Bereich, nicht das gezogene Ergebnis.

### Ergänzender Fünfzehner-Vergleich

Drei, vier und fünf Wölfe wurden anschließend in 8.990.000 gezielten Vergleichspartien und 8.951.040 Partien über alle freigegebenen Konfigurationen geprüft. Nach der anschließenden Entscheidung des Auftraggebers bleiben drei Standard und vier die einzige manuelle Zusatzoption. Fünf oder mehr Wölfe sind auch im Bewertungs- und Zufallsmodus ausgeschlossen. Hexe und Magier dürfen bei vier Wölfen gemeinsam spielen. Die neue Evidenz ist im [Fünfzehner-Prüfbericht](GAMEHUB_WERWOLF.md#vergleich-der-wolfszahlen-und-heilrollen-bei-fünfzehn-spielern) dokumentiert. Die Rollenpunkte und das aus 13/14 Spielern abgeleitete Fünfzehner-Punktziel wurden dabei nicht neu angepasst. Die API kennzeichnet Fünfzehner-Empfehlungen deshalb weiterhin als vorläufig.

### Erweiterung auf 16 Spieler

Der Bewertungsmodus unterstützt 16 Mitspielende ohne Erzähler. Der Spielerzahl-Grundwert −13 folgt vorläufig der bisherigen Fortschreibung: zweimal der Fünfzehner-Wert minus Vierzehner-Wert. Er ist kein aus den Sechzehner-Simulationen neu geschätzter Wert. Empfehlungen für diese Gruppengröße sind ausdrücklich vorläufig. Alle Kandidaten bleiben auf höchstens vier Wölfe begrenzt; vier sind nach der Nachprüfung der allgemeine Standard, drei bleiben optional. Gemeinsame Heilrollen setzen vier Wölfe voraus. 5.803.520 Partien über alle freigegebenen Konfigurationen und 3.660.000 gezielte Vergleichspartien bestätigen den geprüften Ablauf. Die Punkte wurden daraus nicht neu geschätzt. [Prüfbericht für 16 Spieler](GAMEHUB_WERWOLF.md#vergleich-der-wolfszahlen-und-heilrollen-bei-sechzehn-spielern)

### Erweiterung auf 17 Spieler

Die Wolfszahlen werden für 17 neu geprüft, ohne die frühere Vierergrenze zu übernehmen. Der Bewertungsmodus vergleicht eins bis acht anfänglich in Unterzahl befindliche Wölfe, soweit Rollenplätze und Kombinationen passen. Drei, vier und fünf Wölfe wurden ausführlich verglichen und vollständig auf ihre zulässigen Konfigurationen geprüft. Das Punktziel −14,5 ist weiterhin eine lineare Fortschreibung und keine neue Anpassung an diese Simulationen; die API kennzeichnet die Empfehlung als vorläufig. Gemeinsame Heilrollen sind bei vier und fünf Wölfen möglich. Die Sichtung umfasst 950.000, der Detailvergleich 5.490.000 und die Kombinationsprüfung 9.121.280 beendete Partien. Fünf Wölfe werden für starke Dorfbesetzungen als Zusatzoption angeboten. Die Punkte wurden daraus nicht neu geschätzt. [Prüfbericht für 17 Spieler](GAMEHUB_WERWOLF.md#wolfszahlen-für-siebzehn-spieler-vergleichen)

### Erweiterung auf 18 Spieler und Zielgrenze 20

Für 18 sind drei Wölfe das Minimum, vier der allgemeine Standard und fünf das Maximum. Die Punkteempfehlung und alle Spieleinstiege halten diese Grenzen ein. Sechs wurden ausdrücklich verglichen und wegen des überwiegenden Wolfsvorteils in den untersuchten Besetzungen nicht freigegeben. Beide Heilrollen sind bei vier oder fünf Wölfen gemeinsam zulässig. Die spätere UI zeigt die für die konkrete Aufstellung automatisch festgelegte Wolfszahl an; sie bietet keine manuelle Änderung.

Das Punktziel −16 ist weiterhin vorläufig: zweimal der Siebzehner-Wert minus Sechzehner-Wert. Die neuen Simulationen wurden nicht zum erneuten Schätzen der Punkte verwendet. 19 ist nach Stichprobenprüfung mit denselben Grenzen freigegeben. Für 19 gilt das fortgeschriebene Ziel −17,5; keine erneute Kalibrierung. 20 ist ebenfalls per Stichprobe mit drei bis fünf Wölfen (Standard vier) freigegeben; vorläufiges Punktziel −19, keine erneute Kalibrierung. Die endgültige Höchstzahl beträgt 20 Mitspielende plus Erzähler. [Prüfbericht und Grenzen für 18](GAMEHUB_WERWOLF.md#wolfszahlen-und-grenzen-für-achtzehn-spieler)

## Kalibrierung und Grenzen

Für Version 1 wurden 448.077 aggregierte Ergebniszeilen mit zusammen 20.076.576 modellierten Partien aus den gespeicherten Neuner-, Zehner-, Elfer-, Zwölfer-, Dreizehner- und Vierzehnervergleichen verwendet. Die gepaarten Läufe teilen sich absichtlich Zufallsstarts. Die Zahlen stehen für das ausgewertete Archivvolumen.

Die Anpassung verwendet die Modelle mit geteilten Hinweisen und hält deren unterschiedliche Regeln getrennt. Als Bezug dient die Spielweise mit kombinierten Seher- und Ermittlerhinweisen. Eine regularisierte Anpassung der logarithmischen Wolfschancen liefert die Punkte für Rollen und die untersuchten Kombinationen. Die Seherin ist in allen Daten gesetzt. Ihr eigenständiger Wert kann deshalb daraus nicht geschätzt werden und beträgt auf dieser Skala fest +5.

Für 6 bis 8 Spieler sind nur die bisherigen Grundbesetzungen als Bezug berücksichtigt. Die Übertragung der übrigen Rollenwerte auf diese Gruppengrößen ist vorläufig. Für 15 bis 20 Spieler und bei ausgeschalteter Rollenaufdeckung kennzeichnet die API das Ergebnis ausdrücklich als vorläufig. Die Einstufung `calibrated` kennzeichnet eine Anpassung an gespeicherte Modellläufe und stellt keinen unabhängigen Nachweis ausgeglichener echter Spielrunden dar.

Das System gibt eine Aufschlüsselung und eine Empfehlung aus. Ein bestimmter Punkteabstand wird nicht als konkrete Gewinnwahrscheinlichkeit angezeigt. Neue Spielregeln, veränderte Entscheidungsmodelle und zusätzliche Rollen erfordern eine erneute Prüfung der betreffenden Werte.

## Anbindung für die spätere Oberfläche

- `scoreWerewolfVillage` liefert die einzelnen Rollen- und Kombinationsbeiträge.
- `evaluateWerewolfLineup` liefert die Gesamtsumme, mögliche Wolfszahlen, Zielwerte, Abweichungen und die Empfehlung.
- `drawWerewolfLineup` zieht eine zulässige Aufstellung aus dem Auswahlpool und bewertet sie.
- `createBalancedWerewolf` startet eine manuell ausgewählte Aufstellung mit empfohlener Wolfszahl.
- `createRandomWerewolf` lost Sonderrollen und Wolfszahl aus und startet die reguläre Spiellogik.

Die Funktionen liegen in der Business-Schicht und halten die Partie im Arbeitsspeicher. Der Erzähler gehört nicht zur Spielerzahl.

Die Quelldaten und deren Prüfsummen stehen in [balanceCalibration.json](../src/business/games/werewolf/balanceCalibration.json). `node scripts/calibrate-werewolf-balance.mjs` berechnet die Zahlen aus den vorhandenen Archiven erneut. Mit `--check` prüft der Befehl, ob die gespeicherte Kalibrierung zu den Archiven passt. Dabei werden keine neuen Partien simuliert.


## Validierter normaler Autopfad

Die normale Einrichtung verwendet ausschließlich die freigegebenen Kandidaten aus der Tabelle. Manuelle Wolfszahlen und Forschungsmodus-Vorgaben werden ignoriert. Die bisherigen Rollenpunktwerte bleiben erhalten; die normale Kandidatenbewertung verwendet für 7/8 den korrigierten Spieler-Grundwert −4 und für 11 −7. Alle anderen Grundwerte bleiben wie oben. Die Korrekturen trennen gespeicherte einfache Dörfer von stärkeren Hexen-/Magierbesetzungen; sie sind keine neue statistische Kalibrierung und keine menschliche Gewinnprognose. Bei Gleichstand entscheidet der allgemeine Standard, danach die kleinere Wolfszahl.

Die historische Forschungsbewertung in `evaluateWerewolfLineup` kann weiter andere Kandidaten betrachten und weiterhin explizite Vergleichswerte annehmen. Sie wird nicht direkt als normaler Startpfad verwendet. `resolveAutomaticWerewolfLineup` prüft die freigegebenen Grenzen und alle Kombinationen; `createBalancedWerewolf` und `createRandomWerewolf` nutzen diesen Pfad. Die Bereichsziehung verwendet ihn erst nach der Zufallsauswahl für die tatsächlich gezogene Rollen-/Itemkombination. Vorher erfolgt nur eine Machbarkeitsprüfung ohne Punkteberechnung. [Offline-Prüfbericht](simulations/werewolf-automatic-policy-audit.json). Die resultierende Bewertung bleibt vorsorglich als vorläufig markiert.
