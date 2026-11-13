# GameHub – Wortbombe

## Auftrag an Claude Code

Implementiere Wortbombe als eigenständiges, lokal spielbares GameHub-Modul. Verwende den aktuellen Stand des GameHub-Repos als Ausgangspunkt, lies `AGENTS.md` und `docs/GAMEHUB_NEW_GAME_GUIDE.md` und führe die Aufgabe im Projektplan. Registriere das Spiel im Spielmenü. Verwende die gemeinsame Spielerliste und passende Game-Kit-Komponenten. Die Oberfläche ist mobil und unterstützt Deutsch und Englisch. Quellcode, Bezeichner und Codekommentare sind auf Englisch. Tabu bleibt außerhalb des Auftrags.

## Aufgabentypen

| Variante | Beispielkarte | Mögliche Antworten |
| --- | --- | --- |
| Kategorie | Tiere | Elefant, Katze, Igel |
| Beginnt mit | Beginnt mit **BE** | Besen, Berg, Becher |
| Endet mit | Endet mit **EN** | Garten, Regen, Kuchen |
| Enthält | Enthält **CH** | Dach, Milch, Buch |
| Reimt sich auf | Reimt sich auf **Haus** | Maus, Laus, raus |
| Gegenteil von | Gegenteil von **laut** | leise, still, geräuschlos |
| Zwei Anfangsbuchstaben zur Wahl | Beginnt mit **M** oder **S** | Mond, Sonne, Mantel |
| Doppelte Buchstaben | Enthält zwei gleiche Buchstaben direkt hintereinander | Sonne, Mutter, Kaffee |
| Gemeinsamkeit | Etwas, das man **öffnen** kann | Tür, Flasche, Fenster |

Vorgabe für die erste Version: Alle neun Aufgabentypen sind separat auswählbar. Für Reime und Gegenteile eignen sich Karten mit möglichst vielen geläufigen Antworten, da jeder Begriff pro Runde nur einmal vorkommen darf.

## Auswahl und Ziehung

- Die Aufgabentypen lassen sich über farbig markierte Buttons einzeln an- und abwählen. Standardmäßig sind alle aktiv. Mindestens einer bleibt ausgewählt.
- Zum Rundenstart wird zuerst gleichverteilt einer der aktiven Aufgabentypen gezogen und anschließend eine zufällige Karte daraus. Damit beeinflusst die Größe des Kartenstapels die Chance eines Aufgabentyps nicht.
- Die Karte bleibt bei jeder Weitergabe sichtbar. Erst beim Start der nächsten Runde wird erneut gezogen.
- Die Gruppe beurteilt die mündlichen Antworten. Die Beispielantworten in dieser Notiz dienen der Planung.

## Spielablauf und Bedienung

- In der Einrichtung stehen zwei Möglichkeiten zur Wahl: **Handy weiterreichen** oder **Handy in die Mitte legen**. In beiden Fällen zählt der Tipp auf **Weiter** als Übergabe an die nächste aktive Person im Kreis.
- Während der Runde zeigt der Bildschirm die Person, die gerade dran ist, die aktuelle Aufgabe und die Buttons **Weiter** und **Zurück**. **Zurück** nimmt die letzte Übergabe zurück. Die Brenndauer läuft bei jeder Übergabe und Korrektur unverändert weiter und bleibt geheim.
- Die Gruppe achtet selbst auf Fehler und Wiederholungen. Bemerkt sie einen Fehler rechtzeitig, kann sie die letzte Übergabe zurücknehmen. Sobald die nächste Person ihr Wort gesagt und weitergespielt hat, gilt der vorherige Zug. Unbemerkte Fehler bleiben gültig.
- Bei der Explosion zeigt die App zunächst an, wer gerade dran war. Die Gruppe kann vor der Bestätigung das Wort der unmittelbar vorherigen Person beanstanden. Ist es ungültig oder wurde versehentlich weitergegeben, scheidet diese vorherige Person aus. Die Korrektur ist auch im Finale möglich. Nach der Bestätigung erscheint entweder **Nächste Runde starten** oder der Sieg der letzten verbliebenen Person. Die neue Runde beginnt mit der nächsten aktiven Person im Kreis nach der ausgeschiedenen Person.
- Die Brenndauer läuft bei gesperrtem Handy und im Hintergrund weiter. Beim Zurückkehren zeigt die App die Explosion an, wenn der Ablaufzeitpunkt bereits erreicht wurde.

## Kartensprache und Erstellung

- Die Kartensprache ist separat von der Oberflächensprache wählbar. Deutsch und Englisch erhalten eigene Kartenstapel. Die Aufgaben werden je Sprache nach passenden Kategorien, Buchstabenfolgen und Reimen zusammengestellt. Die Häufigkeit von Kombinationen wie **CH** kann sich je Sprache unterscheiden.
- Karten werden immer außerhalb der App erstellt. Die App zieht aus den fertigen Kartenstapeln.
- Innerhalb einer Partie wiederholt sich eine Karte erst, wenn der Stapel ihres Aufgabentyps aufgebraucht ist.

## Umsetzungsdetails für die erste Version

Die folgenden Festlegungen sind Startwerte für die Umsetzung und können im Spieltest angepasst werden.

- Mindestens zwei Personen spielen an einem Gerät. Die Reihenfolge in der Spielerauswahl entspricht der Sitzreihenfolge. Die erste Person der Liste beginnt. Beide Handy-Optionen verwenden dieselben Regeln und zeigen zu Beginn den passenden kurzen Hinweis.
- Die Zustände sind Einrichtung, bereit zum Rundenstart, laufende Runde, Explosion mit Bestätigung und Spielende. Erst der explizite Rundenstart zieht die Karte und startet die Bombe. Die Brenndauer wird einmal pro Runde zufällig aus **15 bis 45 Sekunden** gezogen. Zeige keine Restzeit und keinen zeitabhängigen Fortschritt.
- Prüfe **Weiter** und **Zurück** gegen einen absoluten Ablaufzeitpunkt. Ab diesem Zeitpunkt hat die Explosion Vorrang. Verwende eindeutige Runden- und Zugkennungen, damit alte Timer-Ereignisse und doppelt verarbeitete Übergaben keinen neuen Zug verändern.
- **Zurück** ist pro gültiger Übergabe einmal verfügbar. Bei A → B → C springt es von C auf B, danach ist es bis zur nächsten Übergabe deaktiviert. Die vorherige Übergabe A → B bleibt abgeschlossen. Bei einer Explosion direkt nach dem Zurückspringen gibt es daher keinen offenen Einspruch gegen A. Auch vor der ersten Übergabe ist die Einspruchsoption deaktiviert.
- Halte Spiellogik und Zeitmessung getrennt. Lege die Regeln in `src/business/games/` ab. Übergib Zeit und Zufall so, dass die Spiellogik deterministisch testbar ist. Karten werden als statische Daten mitgeliefert. Die laufende Partie bleibt im Arbeitsspeicher.

## Abnahme

- Der Einstieg funktioniert über das Spielmenü. Beide Handy-Optionen und beide Kartensprachen sind nutzbar. Alle neun Aufgabentypen haben spielbare Karten in beiden Sprachen.
- Mindestens ein Aufgabentyp bleibt ausgewählt. Kartenziehung verwendet ausschließlich die Auswahl und die gewählte Sprache. Im selben Typ kommt eine Karte erst nach Erschöpfung des Stapels erneut vor.
- Prüfe per Tests Übergabe, einmaliges Zurück, Ablauf exakt zum Zeitlimit, verspätete Timer-Ereignisse, Explosion vor der ersten Übergabe und nach dem Zurückspringen, Einspruch im Finale und Rundenstart nach dem Ausscheiden. Prüfe das Zurückkehren aus dem Hintergrund und den Spielfluss im mobilen Layout.
