# Werwolf – Prüfung der Planung und Umsetzungsplan der Oberfläche

Stand: 19.11.2026, erstellt von Claude Code vor Beginn der Oberflächenarbeit (Branch `game/werewolf-ui`). Grundlage: [UI-Spezifikation](GAMEHUB_WERWOLF_UI.md), [technische Übergabe](GAMEHUB_WERWOLF_HANDOFF.md), [Spielregeln](GAMEHUB_WERWOLF.md) und der Quelltext von `src/business/games/werewolf`. **Dieses Dokument ändert weder Logik noch Oberfläche; es enthält Rückmeldung, Prüfergebnis, einen Schrittplan und offene Entscheidungen.**

## 1. Kurzfassung

- Die **Planung ist für die feste Konfiguration und die Hauptansicht weit genug**, um zu bauen. Für den **Spielablauf (Nachtskript, Zurück, Tarnaufrufe)** fehlen drei Entscheidungen und drei kleine Logikbausteine, ohne die die Erzähleransicht entweder Regeln in der Oberfläche nachbauen oder raten müsste.
- Die **Spiellogik ist robust**: Ein eigener Zufallstest mit 2559 Partien (6–20 Spieler, alle Rollen, Einstellungen und Gegenstände zufällig) endete jedes Mal regulär, ohne festhängenden Zustand und ohne Verletzung der geprüften Bedingungen. Eine **Regelfrage** und mehrere **Lücken der Schnittstelle** habe ich gefunden (Abschnitt 3).
- Der Umfang ist groß (rund 25 Spielzustände, 14 Rollen, 2 Gegenstände, 6 Einstellungen, zwei Sprachen, Handy und PC). Ich schlage **neun Schritte** vor (Abschnitt 4), jeder für sich prüfbar und lieferbar, mit Entscheidungen des Auftraggebers genau dort, wo sie gebraucht werden.
- **Eine praktische Gefahr für die CI:** Die Simulationstests (`balance.test.ts`, `simulation.test.ts`) laufen länger als zehn Minuten und dürfen nicht im normalen Testlauf liegen (Abschnitt 5).

## 2. Rückmeldung zur Planung

### Was gut ist

- **Klare Trennung** von bestätigt, Vorschlag und offen. Das macht die Umsetzung berechenbar.
- **Eine zentrale Erzähleransicht** statt einer Seite pro Rolle ist die richtige Entscheidung: Sie hält die Zahl der Bildschirme klein und passt zu einem Zustandsautomaten.
- **Die Konfiguration folgt der Logik** (Freigaben aus `configuration.ts`, Empfehlung getrennt von der Wahl, keine stillen Änderungen). Das verhindert doppelte Regeln in der Oberfläche.
- Die **Geheimhaltung** (private Rollenanzeige, geheime Übersicht nur für den Erzähler, gedrückt halten statt Dauerumschalter) ist durchgängig mitgedacht.

### Was fehlt oder sich widerspricht

1. **„Zurück“ im Nachtablauf ist ungeklärt**, die Zustandsmaschine hat keinen Rückwärtsbefehl. Wichtig: Die Übergänge sind **rein und ohne Zufall** (nur `createWerewolf` würfelt). Ein „Zurück“ als **Zustandsstapel** (frühere Zustände aufbewahren und wiederherstellen) ist deshalb sicher und würfelt nichts neu. Die Sorge der Spezifikation (Trankverbrauch, geheime Informationen) betrifft nur eine Rücknahme *im Spiel*, nicht die Korrektur einer Fehleingabe des Erzählers. Entscheidung nötig (Abschnitt 6, Nr. 1).
2. **Tarnaufrufe** (verbrauchte oder tote Rollen weiter aufrufen) sind nur als Vorschlag beschrieben und in der Logik nur teilweise umgesetzt (Bürgermeister ja, Ermittler nein, Hexe ja). Ohne feste Regel kann das Nachtskript nicht gebaut werden, denn es entscheidet, welche Schritte der Erzähler überhaupt sieht.
3. **Es gibt keine Todesursache und keine handelnde Person** im Zustand. Die Kreisübersicht (Detailfeld „Todesgrund“), die Gewinneransicht und später der Verlauf brauchen sie. Je früher sie in der Logik geführt wird, desto weniger Nacharbeit.
4. **Es gibt keinen Katalog gültiger Ziele.** Die Übergabe sagt es selbst: Wer wählbar ist (zum Beispiel nicht dieselbe Person zweimal vom Leibwächter, nicht der Wolf als Wolfsopfer), steht nur *verteilt in der Zustandsmaschine*. Ohne einen Baustein `validTargets(state)` würden Regeln in React nachgebaut.
5. **Fortsetzen nach Neuladen** ist nicht entschieden. Ein Erzähler, der am Handy die Seite neu lädt oder den Bildschirm sperrt, verliert die Partie. Das ist bei einer 60–90-minütigen Runde schwerwiegend. Die Übergabe verbietet ungefragte Speicherung (zu Recht); ich schlage sie als Entscheidung vor.
6. **Kleinere Widersprüche und Lücken:** Die UI-Spezifikation nennt den Branch `game/werwolf`; der Codex-Branch heißt so, mein Oberflächen-Branch `game/werewolf-ui` (Namensgleichheit nicht möglich, weil beide gleichzeitig ausgecheckt sind). Die Rollennamen im Code (`idiot`, `spellcaster`, `toughGuy`, `paranormalInvestigator`) und in der Oberfläche (Dorftrottel, Alte Vettel, Harter Bursche, Paranormaler Ermittler) brauchen **eine** feste Zuordnung in den Übersetzungen. Die Infotexte für 14 Rollen und 2 Gegenstände (de/en) fehlen noch; ich entwerfe sie aus den Regeln, der Auftraggeber prüft.
7. **Heller Tageshintergrund:** Die App ist durchgängig dunkel. Ein heller Tag in der Spielansicht braucht eigene, nur dort gültige Farbwerte (Tokens). Das ist machbar, aber eine eigene kleine Aufgabe.

## 3. Prüfung der Spiellogik

### Methode

Ein Zufallsprüfstand (nur zur Prüfung, nicht Teil des Produkts; Kopie liegt bei mir) hat 2559 gültige Partien gespielt: zufällige Spielerzahl 6–20, zufällige erlaubte Wolfszahl und Rollenauswahl, zufällige Einstellungen (Bürgermeister, Jägerschuss, Selbstwahl, Rollenaufdeckung, Trunkenbold, Gerber, Amulett, Wolfsangriff in Nacht 1). In jedem Zustand wurden alle denkbaren Ereignisse erzeugt (auch unzulässige), davon ein zustandsändernder zufällig gewählt. Geprüft wurden:

- Kein **festhängender Zustand** (es gibt immer ein Ereignis, das weiterführt).
- Jede Partie **endet** (innerhalb von 3000 Schritten).
- Lebende ⊆ Spieler, keine Dubletten; ein **Liebespaar** lebt nie halb nach einer Auflösung.
- `winner` stimmt mit der Siegprüfung überein; ein entschiedenes Spiel läuft nicht weiter.
- Das **Amulett** bleibt nie bei einer toten Person; `werewolfAnnouncement` wirft nie.

**Ergebnis: keine Verletzung.** Alle Zustände kamen vor (auch `drunkHunter`, selten, 8 Mal; Magier, Amor, Hammer, Amulett, Ermittler).

### Von mir gelesene Sonderfälle (alle richtig behandelt)

Hammer gegen Wolf, Fehlhammer mit Liebespartner und Jäger, Jägerschuss beim verdeckten Trunkenbold, Gerber bei Liebeskummer und bei Abstimmung, Hexe mit Harter Bursche, Amulett gegen Hammer und Abstimmung, Dorfmatratze mit Hexe/Magier, Alte Vettel mit Selbstwahl und Sperrfolge, Dorftrottel unter Stummschaltung, Bürgermeister als Trunkenbold, verdeckter Wolf ohne wachende Wölfe, Ermittler-Nachbarschaft über Tote hinweg.

### Regelfragen (beantwortet am 19.11.2026)

- **Beschluss A:** Die Wölfe dürfen jede Person wählen außer sich selbst und andere Werwölfe. **Die Logik bleibt unverändert** (auch ein noch verdeckter Trunkenbold-Wolf ist ein Werwolf und nicht wählbar). **Frage:** (ursprünglich) Verdeckter Wolf als Wolfsopfer:** Die Logik verbietet, dass die Wölfe einen **noch verdeckten Trunkenbold-Wolf** als Opfer wählen. In der Wirklichkeit wissen die anderen Wölfe nicht, wer er ist, und könnten ihn wählen. Soll das erlaubt sein (der Wolf stirbt dann) oder bleibt es ausgeschlossen? Das beeinflusst, wie die Wolfsauswahl am Handy aussieht (sonst müsste der Erzähler einen Namen „ablehnen“, der in der Auswahl nicht ersichtlich ist).
- **Beschluss B:** Der Leibwächter kann sich nicht selbst schützen, er wählt immer eine andere Person und nie zweimal hintereinander dieselbe. **Die Logik bleibt unverändert** (entspricht dem Stand).

### Lücken der Schnittstelle (Wünsche an Codex, Logik)

| Baustein | Zweck |
| --- | --- |
| `validTargets(state)` | Wählbare Namen je Schritt (Wolfsopfer, Schutz, Gast, Hammer, Vision, Untersuchung, Gift, Zauber, Stummschaltung, Jäger, Amulett). Die Oberfläche zeigt nur diese. |
| `nightScript(state)` | Ordnet Schritte und **Tarnaufrufe** nach der noch zu bestätigenden Regel und sagt, ob ein Schritt „echt“ oder „Tarnung“ ist. |
| Todesursache und handelnde Person | Eintrag je Ausscheiden (Ursache, Nacht/Tag, Auslöser). Grundlage für Detailfeld, Gewinneransicht und späteren Verlauf. |
| (optional) Zustandsstapel | Falls „Zurück“ als Stapel entschieden wird, kann er in der Oberfläche liegen; ein kleiner reiner Helfer in Business wäre sauberer und testbar. |
| `describePlayers(state)` | Anzeigewerte je Spieler für die Kreisübersicht (lebend/tot, sichtbare Rolle, Gegenstände, Liebespaar, Verwundung, Rahmen). Entlastet die Oberfläche. |

## 4. Vorgeschlagene Schritte

Jeder Schritt wird einzeln geprüft (Unit-Tests, Browserprüfung Deutsch/Englisch, Handy-Layoutprüfung), dokumentiert und im Branch `game/werewolf-ui` committet. **Gemergt und veröffentlicht wird erst, wenn das Spiel fertig ist und du es freigibst.** Bis dahin ist der Knopf „Spielen“ in der veröffentlichten Version gesperrt.

| Schritt | Inhalt | Aufgaben | Braucht Entscheidung / Logik |
| --- | --- | --- | --- |
| **0. Grundlage** | Branch auf `main` aufsetzen, Logik von Codex übernehmen; schwere Tests aus dem Standardlauf nehmen; Spielmodul registrieren, Übersetzungen (`werewolf` de/en) anlegen | – | Entscheidung 8 (CI) |
| **1. Hauptansicht** | Reiter „Spieler“ und „Sitzplätze“, Erzähler wählen, Sitzordnung ziehen, Kreisübersicht, Namen beim Gedrückthalten, kurze Einrichtungsübersicht, Starten/Regeln/Einstellungen | We-01-34, 35, 37 | Antworten vom 19.11. liegen vor (Ziehen, Erzähler aus Liste, Übersicht) |
| **2. Feste Konfiguration** | Rollenraster mit Freigabegruppen, Pflichtrollen und Dorfbewohner, Wolfswahl mit Empfehlung, Zusätze, Variantenknöpfe, allgemeine Regeln, Info-Fenster; reines Ansichtsmodell mit Konfliktanzeige | We-01-26, 31, 38–43 | Entscheidung 3 (Konflikte) |
| **3. Start und Rollenverteilung** | `createFixedWerewolf` genau einmal, gehaltene Hochziehkarte je Person, Weitergabe am Handy, Schutz beim Wechsel in den Hintergrund, Amulett-Mitteilung | We-01-27 | – |
| **4. Erzählerkern** | Zentrale Ansicht: Sonne/Mond, Hell/Dunkel, Skript-Presets je Zustand (de/en), Ziel-Auswahl aus `validTargets`, „Weiter“ löst die richtige Aktion aus, „Zurück“, Abbruch, Fortsetzen | We-01-04, 10 | Entscheidungen 1, 2, 4, 5, 9 (1–4 und 6–7 entschieden); Logik: `validTargets`, `nightScript` |
| **5. Tag und Abstimmung** | Nominieren (Nominierende, Unterstützende, Ziel), Abstimmung mit **benannten** Ja-Stimmen (Dorftrottel und Bürgermeister rechnet die Logik), Stummschaltung sichtbar, Tag beenden | We-01-28, 29 | – |
| **6. Sonderabläufe** | Amor/Liebespaar, Trunkenbold-Enthüllung, Jäger, Magier mit Hexe, Bürgermeister-Hammer, Amulett-Weitergabe, Seher-Lehrling, Ermittler: je mit eigenem Test der Oberfläche | (in 4, aufgeteilt) | – |
| **7. Live-Kreisübersicht** | Kreis mit Symbolslots, Hintergrundfarben, Rahmen, Detailfeld (gedrückt halten), Legende | We-01-44 | Symbole und Prioritäten; Logik: Todesursache, `describePlayers` |
| **8. Gewinneransicht** | Gemeinsam mit dem Auftraggeber gestaltet | We-01-30 | Gestaltung |
| **9. Politur und Abnahme** | PC-Layout, Tastatur, Offline, Handy-Prüfung, Dokumentation, danach variable Konfiguration (We-01-32) und Verlauf (We-01-45) | We-01-32, 45 | Variable Bedienung (später) |

Reihenfolge-Begründung: 1 und 2 sind unabhängig vom Spielablauf und bringen die Entscheidungen früh auf den Tisch. 3 braucht nur den Start. 4 ist der Kern und die größte Abhängigkeit (Entscheidungen und Logikbausteine); deshalb sollten beides **bis zum Ende von Schritt 3 vorliegen**. 7 kommt nach dem Ablauf, weil sie dessen Zustandsdaten braucht.

## 5. Risiken

- **CI-Zeit:** `balance.test.ts` (2035 Zeilen) und `simulation.test.ts` (715 Zeilen) liefen bei mir über zehn Minuten. Die Aktion in Schritt 0: aus dem Standardlauf nehmen (`exclude` in der Testkonfiguration) und über einen eigenen Befehl (`pnpm test:werewolf-simulation`) bereitstellen; der Test mit dem 83-MB-Archiv ist bereits übersprungen, wenn das Archiv fehlt.
- **Umfang der Texte:** rund 60 Skript-Presets und 16 Infotexte in zwei Sprachen; entworfen von mir, geprüft von dir.
- **Heller Tag:** eigene Farbwerte nur in der Spielansicht (Schritt 4).
- **Spieleranzahl 20:** Kreis mit 20 Kacheln und sechs Symbolslots am Handy ist eng; in Schritt 7 früh am echten Gerät prüfen.
- **Geheimhaltung am Gerät:** Sichtschutz bei Bildschirmsperre, Zurück-Taste und App-Wechsel (wie bei Tabu `useSystemBack`); nichts Geheimes in der Adresse oder im Protokoll.

## 6. Entscheidungen des Auftraggebers

**Alle zehn Entscheidungen sind am 19.11.2026 getroffen, jeweils nach der Empfehlung (Nr. 1–5 und 8–10), Nr. 6 und 7 als Beschluss A und B (Logik bleibt unverändert).** Schritt in Klammern: ab dem sie gebraucht wird.

1. **„Zurück“ (4):** Empfehlung: **Zustandsstapel innerhalb der laufenden Partie**, „Zurück“ nimmt den zuletzt bestätigten Schritt zurück (kein neuer Zufall). Ab dem Morgen (Bekanntgabe der Toten) nur nach Rückfrage. Alternative: nur Hinweis zurückblättern.
2. **Tarnaufrufe (4):** Empfehlung: die vorgeschlagene Regel annehmen (lebende Rolle immer aufrufen, auch wenn verbraucht; tote Rolle bei offener Aufdeckung auslassen, bei geheimer als Tarnaufruf; Amor und Trunkenbold an ihren festen Nächten); dazu Kennzeichnung für den Erzähler („Tarnung, niemand handelt“).
3. **Ungültig gewordene Wahl (2):** Empfehlung: **nie still ändern**; Konflikt am Knopf erklären und mit einem Antippen die empfohlene gültige Wolfszahl vorschlagen.
4. **Abbruch (4):** Empfehlung: Rückfrage, dann zurück in die Hauptansicht mit Spielern, Erzähler, Sitzordnung und Konfiguration erhalten (wie bei Tabu).
5. **Fortsetzen (4):** Empfehlung: **ja**, die laufende Partie lokal auf dem Gerät speichern (nur auf dem Gerät des Erzählers) und beim Öffnen „Partie fortsetzen / Neue Partie“ anbieten.
6. **Verdeckter Wolf als Opfer:** entschieden (Beschluss A): Wölfe wählen niemanden aus ihrem Rudel, auch keinen verdeckten Wolf; Logik unverändert.
7. **Selbstschutz des Leibwächters:** entschieden (Beschluss B): kein Selbstschutz, nie zweimal dieselbe Person; Logik unverändert.
8. **Standardtests (0):** Empfehlung: Simulation aus dem Standardlauf nehmen.
9. **Heller Tag (4):** Empfehlung: hell nur in der Spielansicht, eigene Farbwerte.
10. **Infotexte (2):** Empfehlung: ich entwerfe, du prüfst in einem Durchgang.

## 7. Nächste Schritte nach deiner Rückmeldung

1. Entscheidungen 1–10 (die Mehrheit ist mit „ja, Empfehlung“ erledigt).
2. Ich lege `game/werewolf-ui` auf `main` neu an, übernehme die Logik und führe Schritt 0 aus.
3. Wünsche an Codex (Abschnitt 3) gebe ich dir als Auftragsliste, damit sie bis Schritt 4 vorliegen.
