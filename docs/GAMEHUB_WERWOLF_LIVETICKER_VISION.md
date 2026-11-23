# Werwolf: Livetiker und Multiplayer (Vorhaben, noch nicht begonnen)

Festgehalten am 23.11.2026 nach Angaben des Auftraggebers. **Vorrang hat das fehlerfreie lokale Spiel**; nichts davon wird ohne neue Freigabe begonnen. Architekturentscheidungen (Server, Anbindung, Datenhaltung) brauchen vorab die Zustimmung des Auftraggebers.

## Die Übersicht als Grundlage

Die Ansicht „Alle Spieler und Rollen“ soll sich bei jeder Änderung des Spiels aktualisieren. Sie ist die Grundlage des Livetickers: ein Sitzkreis mit allen Spielern und zu jedem Spieler die Informationen, welche Rolle er hat, welche Fähigkeiten er hat, welche Fähigkeiten er abbekommen hat (zum Beispiel vergiftet, geschützt, stumm, verliebt, verwundet) und welche Zusätze (Amulett, Trunkenbold) dazukommen.

Stand heute (23.11.2026): `describePlayers(state)` liefert diese Angaben pro Person; Tote der Morgen-Ansicht und der Ausscheiden-Ansicht zählen schon in der Ansage als tot, der Jäger mit dem letzten Schuss trägt `lastShot` (siehe `GAMEHUB_WERWOLF_CODEX_AUFGABE_NACHT.md`). Der Sitzkreis als Live-Ansicht fehlt noch.

## Mischung aus lokal und online

- Es soll eine Mischung aus lokal und online spielenden Personen möglich sein.
- Online spielende schauen ihre Rolle selbst an. Solange sie leben, sehen sie in der Oberfläche so gut wie nichts, nur Angaben wie „Nacht 1“.
- Am Tag stimmen sie bei einer Abstimmung online mit ab.
- Wer tot ist, bekommt den Livetiker freigeschaltet und kann das Spiel mitverfolgen: der Sitzkreis und in einer Box die Entscheidungen im Klartext, zum Beispiel „Hexe (Name) hat Name (Rolle) vergiftet“.
- Der Erzähler sieht weiterhin alles; für die Lebenden gilt der Sichtschutz.

## Folgen für die laufende Arbeit

- Jede Anzeige mit Lebenden und Toten muss `lastShot` und die vorab angesagten Toten beachten.
- Der gespeicherte Verlauf der Führung (`trail`) und das Ereignisprotokoll sind die Quellen für die Entscheidungen im Livetiker.
- Entscheidungstexte brauchen eigene, lokalisierte Satzbausteine (Deutsch und Englisch), nicht nur Anzeigetexte der Erzähleransicht.
