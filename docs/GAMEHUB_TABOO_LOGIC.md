# Tabu: Spiellogik und Randfälle

Dieses Dokument beschreibt die Regeln der Zustandsmaschine (`src/business/games/taboo/stateMachine.ts`) und die geprüften Randfälle. Es entstand in `PH-11-01`.

## Zustände

`setup` → `roundRunning` → `roundEnded` → (`roundRunning` | `gameEnded` | `tiebreak`) → `gameEnded`

- `tiebreak` entsteht nur aus `roundEnded`, wenn `tiebreak` aktiv ist und zwei bis drei Teams gleichauf führen.
- `gameEnded` ist endgültig: Jedes weitere Ereignis liefert denselben Zustand zurück.
- Jedes unzulässige oder ungültige Ereignis liefert exakt dasselbe Zustandsobjekt zurück (keine Teiländerung).

## Regeln

| Bereich | Regel |
|---|---|
| Teamreihenfolge | Wird einmal pro Partie zufällig bestimmt (`shuffleTeams`) und bleibt gleich. |
| Karten im Zug | Eine Karte erscheint nie zweimal im selben Zug. Ein Zug endet nur durch die Zeit oder wenn alle Karten aufgebraucht sind. |
| Karten über Züge | Ungespielte Karten kommen zuerst, danach früher gespielte in neuer Reihenfolge. |
| Wertung | Nur „richtig“ gibt einen Punkt. „Überspringen“ und „Verbotenes Wort“ geben keinen. |
| Überspringen | Pro Zug begrenzt (`skipsPerRound`, Standard 1). Die Zählung kommt aus den Ergebnissen des Zuges. |
| Rundenübersicht | Richtig/falsch lässt sich nachträglich ändern, Übersprungenes nicht. Punkte passen sich an. |
| Neustart eines Zuges | Verwirft Punkte und Ergebnisse. Neue Karten, nichts aus diesem Zug darf zurückkehren. |
| Unbegrenzte Runden | Nach dem letzten Team einer Runde darf das Spiel beendet werden, mitten in einer Runde nicht. |
| Gleichstand | Zwei bis drei führende Teams spielen ein Stechen. Mehr als drei oder deaktiviert: gemeinsamer Sieg. |
| Stechen | Pro Team drei Karten (leicht, mittel, schwer), 90 Sekunden. Verbotenes Wort: falsch, neue Karte gleicher Schwierigkeit. Überspringen einmal. Mehr richtige Karten vor kürzerer Zeit. Gleiches Ergebnis: gemeinsamer Sieg. |

## Geprüfte Randfälle

- Ereignisse für den falschen Zug, die falsche Karte oder den falschen Zustand ändern nichts.
- Karten mit falscher Sprache, ungültigem Inhalt oder doppelter Kennung werden abgelehnt (Start, Nachladen, Neustart, Stechen).
- Zeitwerte im Stechen müssen endlich sein; `NaN` und unendliche Werte werden ignoriert (Fehler, der durch die Zufallsprüfung gefunden wurde). Negative Werte werden auf 0 begrenzt.
- Wertung bleibt nach Korrekturen und Neustarts nie negativ und passt zu den Ergebnissen.
- Zu wenige Karten für das Stechen: Die Oberfläche meldet es und bietet eine neue Partie an.
- Nur Karten der Kartensprache werden im Stechen verwendet.
- Unbegrenzte Spiele brauchen zum Start nur eine Karte pro Team.
- Der Kartensatz kann kleiner sein als die Zahl der Züge, weil Karten in späteren Zügen wiederkehren dürfen.

## Absicherung

- Gezielte Tests je Regel in `stateMachine.test.ts`.
- `stateMachine.invariants.test.ts` spielt 400 zufällige Partien mit gültigen und ungültigen Ereignissen und prüft nach jedem Schritt Invarianten (Punkte, eindeutige Karten, gültige Zustandsübergänge, Stechen-Daten, endgültiges Spielende).

## Bewusst nicht abgedeckt

- Die gerade offene Karte bei Zeitablauf zählt weder richtig noch übersprungen und erscheint nicht in der Übersicht.
- Eine Partie wird nicht gespeichert. Ein Neuladen der Seite beendet sie.
- Die Zeitmessung nutzt die Geräteuhr; Änderungen der Systemzeit während einer Runde sind nicht abgesichert.

## Beobachtungen für PH-11-05

- In `TabooSetup.tsx` ist der Zustand `deckEmpty` mit Meldung praktisch nicht mehr erreichbar, weil der Kartensatz vor dem Start auf mindestens die nötige Kartenzahl geprüft wird und früher gespielte Karten wiederverwendet werden. Er kann bei der Strukturprüfung entfernt oder bewusst als Schutz behalten werden.
- Die Datei `TabooSetup.tsx` bündelt Formular, Kartenaufbereitung, Nachladen, Rundenablauf, Pause, Neustart und Stechen. Eine Aufteilung in Hooks und Bausteine würde Tests und die Wiederverwendung für neue Spiele erleichtern.

