# Regelprüfung der Erzähleransicht (Claude, 22.11.2026)

Verglichen wurden die Regeln in `GAMEHUB_WERWOLF.md` mit dem, was die Erzähleransicht je Rolle zeigt (Beschreibung in `roleStep.ts`, Rollenkarte in `narratorCard.ts`). Die Prüfung stützt sich auf das Lesen der Regeln und des Codes sowie auf einen Probelauf der Logik für Hexe und Magier. **Nicht im Browser angesehen.** Nichts wurde geändert; die offenen Punkte brauchen eine Entscheidung des Auftraggebers.

## Stimmt mit den Regeln überein

| Rolle | Regel | Ansicht |
| --- | --- | --- |
| Werwölfe | Ab Nacht 2 Angriff, in Nacht 1 nur kennenlernen (Einstellung) | zwei Ansichten: „Angriff“, „Kein Angriff in dieser Nacht“ |
| Seherin, Lehrling | Pflicht; nach dem Tod der Seherin ruft der Lehrling | Auswahl und Ergebnis getrennt, Daumen; Lehrling-Text |
| Leibwächter, Dorfmatratze | jede Nacht eine andere Person, Vortag gesperrt | Pflicht, Hinweis auf die gesperrte Person |
| Hexe | zwei Tränke, einmal pro Partie, beide in einer Nacht möglich; Heiltrank nur bei Wolfsopfer | Heilen/Gift als Knöpfe, „Verzichten“, Heilen ohne Opfer gelb gesperrt, verbrauchte Tränke grau |
| Amor | Nacht 1, genau zwei Personen | Pflicht, 2 Personen, Verliebte-Schritt danach |
| Jäger | schießen oder auslassen (Einstellung: Pflicht möglich) | zwei Ansichten: freiwillig mit „Verzichten“, Pflicht ohne |
| Paranormaler Ermittler | einmal pro Partie, Aufschieben verbraucht nichts | „Verzichten“ in der Karte, nach Benutzung grau |
| Bürgermeister (Hammer) | ab Nacht 2, einsetzen oder aufheben | „Verzichten“, vor Nacht 2 gelb gesperrt, danach Tarnaufruf |
| Alte Vettel | Pflicht; Vorperson gesperrt; Selbstwahl einstellbar | Pflicht (Entscheidung 22.11.), kein „Niemand“ |
| Schutzamulett | Weitergabe nur nach Angriff Pflicht | Rolle des Trägers auf der Karte, „Behalten“ ohne Angriff |

## Offene Punkte (Entscheidung nötig)

1. **Magier nach geheilter Hexe.** Entschieden am 22.11.2026: Der Magier sieht das Wolfsopfer auch nach einer Heilung durch die Hexe, der Heilzauber bleibt wählbar (verbraucht ohne Wirkung). Grund: Niemand soll aus der Anzeige ablesen können, ob eine Heilung oder ein Schutz gewirkt hat (Beschluss 21.11.2026). Die Logik verhält sich schon so; geändert wurde nur der Satz im Magier-Abschnitt von `GAMEHUB_WERWOLF.md`.
2. **Texte „oder verzichtet“.** Erledigt (We-01-122): Der Zusatz ist aus den Fragen für Ermittler und Bürgermeister gestrichen, „Verzichten“ ist nur noch der Knopf in der Karte.
3. **Trunkenbold.** Regel: Fähigkeiten ruhen bis zur Enthüllung in Nacht 3. In der Ansicht nicht geprüft (nur in der Logik getestet).
4. **Harter Bursche und Verwundete.** Der Verwundete erscheint als Notiz am Tag, aber nicht als Effekt in der Rollenkarte. Vorschlag: nur ergänzen, wenn gewünscht.
5. **Dorftrottel und Stumme bei der Abstimmung.** Beides steht als Hinweis an der Wählerliste; Zusammenspiel (stumm und Pflichtstimme) nicht in der Ansicht geprüft.

## Nicht geprüft

Variabler Modus von Hand, Gerber (keine Nachtaktion), Siegansicht für alle Gruppen, Zusammenspiel Liebespaar und Amulett in der Ansicht.
