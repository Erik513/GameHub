# Werwolf – UI-Spezifikation und Übergabe

Beschluss des Auftraggebers vom 21.11.2026 (We-01-54): Hexe und Magier sehen immer die angegriffene Person als Wolfsopfer, auch wenn das Amulett oder der Leibwächter den Angriff abgefangen hat. Der Zustand hat dafür das Feld `wolfTarget` (die angegriffene Person) neben `victim` (wer wirklich stirbt); Heilen prüft `wolfTarget`. Ein Angriff auf die abwesende Dorfmatratze geht weiter ins Leere (kein Opfer). Die frühere Aussage, sie sähen nach einem abgefangenen Angriff kein Opfer, ist ersetzt.

Beschluss des Auftraggebers vom 21.11.2026 (We-01-53): Die Einstellung „Rollen nach dem Ausscheiden“ (Aufdecken oder Geheim) entfällt. Das Spiel nennt nie die Rolle einer ausgeschiedenen Person (Ansagen enthalten nur Namen; `werewolfAnnouncement` liefert `{ name }`). Der Erzähler weckt nur Rollen, die noch leben; es gibt keine Tarnaufrufe für Tote mehr. Erhalten bleiben die Aufrufe für lebende Rollen mit verbrauchter Fähigkeit (Hexe ohne Tränke, Magier ohne Zauber, Bürgermeister nach dem Hammer) und für einen noch nicht enthüllten Trunkenbold. Wer am Tag ausscheidet, darf seine Rolle aufdecken, muss es aber nicht; das regeln die Spieler selbst, die App verlangt nichts. Die Gruppe leitet aus den Aufrufen der Nacht ab, wer fehlt. Der Jäger verrät sich durch seinen Schuss; das ist gewollt. Ältere Aussagen zu offener oder geheimer Aufdeckung und zu Tarnaufrufen für Ausgeschiedene sind damit ersetzt. Gespeicherte Entwürfe mit dem alten Feld werden weiter gelesen, das Feld wird ignoriert.

Aktueller Nachtablauf (We-03-68, 21.11.2026): Nicht gezogene Pool-Rollen und Zusätze werden übersprungen. Tarnaufrufe gelten nur für tatsächlich vorhandene verdeckte Rollen beziehungsweise verbrauchte Fähigkeiten. nightRolePool, nightItemPool und nightMayUseHammer sind entfernt. Änderungen sind im Logik-Arbeitsordner und gezielt im Werwolf-UI-Arbeitsstand übernommen. Die gewichtete variable Ziehung und Zahlenbeispiele stehen in [GAMEHUB_WERWOLF_VARIABLE_API.md](GAMEHUB_WERWOLF_VARIABLE_API.md); ältere widersprechende Tarn-/Gewichtungsaussagen sind ersetzt.

Aktueller variabler Modus (We-03-67, 20.11.2026): Die Wünsche 1–7 aus dem Abschnitt „Variable Rollen“ sind logisch implementiert. Muss-/Darf-Pools, Variantenmengen, ausgewählte Wolfszahlen und unabhängige 50-%-Zusätze ersetzen itemRange und die Wolfsberechnung nach Ziehung. Aktuelle Signaturen, Wahrscheinlichkeiten und UI-Metadaten: [GAMEHUB_WERWOLF_VARIABLE_API.md](GAMEHUB_WERWOLF_VARIABLE_API.md). Ältere gegenteilige Abschnitte sind historische Beschlussstände. Die Bedienoberfläche ist umgesetzt (We-01-32, Stand 21.11.2026); die Ziehung beim Spielstart folgt mit We-01-52.

Aktueller Beschlussstand der zweiten Regelrunde (We-03-66, 20.11.2026): Amulett schützt nur gegen nächtlichen Wolfsangriff, Gift und Todeszauber. Kein Schutz bei Hammer, Abstimmung oder Jägerschuss. Liebeskummer allein löst keine Weitergabepflicht aus. Verliebte entscheiden frei; ein verdeckter Trunkenbold-Wolf wird weiterhin erst in Nacht drei enthüllt. Implementiert und geprüft; aktuelle Anbindung in GAMEHUB_WERWOLF_NARRATOR_API.md.

Neue Rollenregeln vom 20.11.2026 sind in We-03-65 implementiert und geprüft. Aktuelle Optionen und Amulett-Zeitfolge siehe GAMEHUB_WERWOLF_NARRATOR_API.md. Oberflächenanbindung erfolgt gesondert in We-01-48; keine UI-Dateien in diesem Logikschritt geändert.

Aktueller Logikstand vom 20.11.2026: Hammer-Neuordnung, Zielkatalog, Tarnskript, Ereignisprotokoll, Spielerprojektion und Rücknahme sind implementiert. Verbindlicher Anschluss für Claude: [Erzähler-API](GAMEHUB_WERWOLF_NARRATOR_API.md). Ältere Planungs-/Prüfabschnitte beschreiben ihren damaligen Stand. Browser-Speicherung, Navigation und UI bleiben gesonderte Integrationsarbeit.

Stand: 19.11.2026. Dieses Dokument wird während der UI-Planung fortlaufend gepflegt. Technischer Einstieg mit Dateipfaden, Ereignissen und Integrationsgrenzen: [GAMEHUB_WERWOLF_HANDOFF.md](GAMEHUB_WERWOLF_HANDOFF.md).

## Verbindlichkeit und Übergabe

- **Bestätigt** ist eine ausdrücklich abgestimmte Entscheidung. Diese wird umgesetzt.
- **Vorschlag** ist eine Diskussionsgrundlage und darf noch nicht als bestätigte Anforderung behandelt werden.
- **Offen** benennt eine noch ausstehende Produktentscheidung. Sie wird vor der Umsetzung der betroffenen Ansicht geklärt.
- Die bisherige Rollenlogik und die festen/variablen Spieleinstiege sind implementiert und geprüft. Rückwärtsbedienung, einheitliche Tarnaufrufe und historische Detaildaten sind noch nicht vollständig umgesetzt; siehe technische Übergabe.
- Nach jeder weiteren Entscheidung werden dieses Dokument, der Aufgabenstatus und die tatsächlich verwendeten Entwicklungs-HTML-Dateien aktualisiert. Eine vollständige Übergabe ist erst erreicht, wenn die offenen Punkte der zu implementierenden Ansicht geklärt sind.

Vor der Umsetzung lesen: `AGENTS.md`, dieses Dokument, `GAMEHUB_WERWOLF.md`, `GAMEHUB_UI_RULES.md` und die Aufgaben-/Abnahmekriterien in `GAMEHUB_PROJECT_PLAN.md`. Im Spiel-Branch `game/werwolf` arbeiten. Spielregeln und Berechnungen aus der Business-Schicht verwenden.

## Bestätigte Struktur

Es gibt drei übergeordnete Ansichten:

| Bereich | Aufgabe | Planungsstand |
| --- | --- | --- |
| **Hauptansicht** | Einstieg nach Auswahl von Werwolf; Vorbereitung und Ausgangspunkt der Partie. | Wird zuerst geplant. |
| **Rollenkonfiguration** | Rollen, Items und die zugehörigen Partieeinstellungen festlegen. | Grundaufbau der festen Ansicht abgestimmt; variable Details ausdrücklich später. |
| **Spielablauf** | Rollenverteilung und eigentliche Partie; Spiel-/Erzählerablauf in einer zentralen Ansicht mit wechselnden Phaseninhalten. | Grundlayout der Erzähleransicht und erster Entwurf der erweiterten Live-Kreisübersicht festgehalten; Detailfragen offen. |

Die Rollenkonfiguration wird im Dokument als **Konfiguration** bezeichnet. Die geheime Anzeige einer bereits zugeteilten Rollenkarte gehört zur **Rollenverteilung im Spielablauf**. Ob die drei Bereiche technisch eigene Seiten oder andere Ansichtswechsel erhalten, wird bei der Navigation festgelegt; drei dauerhaft sichtbare Tabs sind bisher nicht beschlossen.

### Bestätigter Arbeitsablauf

1. Hauptansicht gemeinsam planen und Entscheidungen festhalten.
2. Konfiguration gemeinsam planen und Entscheidungen festhalten.
3. Spielablauf mit seinen einzelnen Phasen und Sonderfällen planen.
4. Claude Code erhält die bestätigten Anforderungen und die Abnahmekriterien je Ansicht. Die reine Dokumentanlage ist keine Freigabe, bereits Produkt-UI umzusetzen.

## Hauptansicht: bestätigte Grundlage

- Nach Auswahl des Spiels erscheint zuerst die Hauptansicht.
- Konfiguration und Spielablauf sind eigene Bereiche.
- Die Hauptansicht wird vor der Konfiguration detailliert festgelegt.
- Es gibt 6–20 Personen mit Spielrolle und zusätzlich einen echten Erzähler. Der Erzähler zählt nicht zur Spielerzahl und erhält keine Spielrolle.
- Die vorhandene gemeinsame Spielerverwaltung muss berücksichtigt werden. Eine zweite unabhängige Liste gespeicherter Personen wird nicht aufgebaut.
- **Spiel starten**, **Spieleinstellungen** und **Spielanleitung** sind bestätigte Standardaktionen für die Hauptansicht, wie bei den übrigen Spielen. Sie werden nicht als noch unbestätigte neue Werwolf-Funktionen behandelt. Spieleinstellungen öffnen den Konfigurationsbereich; die Darstellungsform der Anleitung bleibt ein Navigationsdetail.

## Hauptansicht: erster Vorschlag zur Abstimmung

Die konkrete Anordnung und die Einrichtungsvorschau bleiben **Vorschläge**. Die Standardaktionen Spiel starten, Spieleinstellungen und Spielanleitung sowie die weiter unten bestätigten Spieler-/Sitzplatzreiter, Kreisübersicht und Namensanzeige sind bereits festgelegt.

### Inhalt und Anordnung

| Bereich | Vorgeschlagener Inhalt | Zweck |
| --- | --- | --- |
| Kopf | Spielname „Werwolf“ und Rückweg zur Spielauswahl. | Orientierung. |
| Mitspieler | Aktuelle Teilnehmer und sichtbare Anzahl; Personen über vorhandene Spielerverwaltung hinzufügen/entfernen. | Runde zusammenstellen. |
| Erzähler | Separater Bereich mit gewähltem Erzähler und Aktion zum Auswählen/Wechseln. | Rolle der Spielleitung und Spielerzahl eindeutig halten. |
| Vorbereitung | Gut erreichbare Aktionen **Konfiguration** und **Regeln**. | Von der Hauptansicht zu den vorbereitenden Informationen gelangen. |
| Kurzübersicht | Wenige verständliche Angaben zur aktuellen Einrichtung; keine vollständige zweite Einstellungsmaske. | Erkennen, womit gestartet wird. |
| Hauptaktion | **Spiel starten**. | Nach gültiger Vorbereitung die Rollenverteilung beginnen. |

Vorgeschlagene mobile Hierarchie: Mitspieler und Erzähler als Hauptinhalt; Konfiguration/Regeln als Nebenaktionen; Spielstart als eindeutige Hauptaktion. Dark Mode, große Schaltflächen, knappe Texte und Auswahl über Buttons passen zu den bestehenden Gestaltungswünschen. Namenserfassung verwendet die vorhandene gemeinsame Bedienung. Layout und genaue Buttonpositionen werden noch abgestimmt.

### Bestätigt: Spielerreiter und Sitzplatzreiter

Innerhalb der Hauptansicht gibt es zwei Reiter:

| Reiter | Aufgabe |
| --- | --- |
| **Spieler** | Teilnehmer der Runde verwalten. Die bestehende gemeinsame Spielerverwaltung bleibt Grundlage. |
| **Sitzplätze** | Die Reihenfolge aller mitspielenden Personen entsprechend ihrer realen Sitzordnung festlegen und anschließend als Kreisübersicht darstellen. |

Diese beiden Reiter gehören zur Hauptansicht. Die übergeordnete Aufteilung in Hauptansicht, Konfiguration und Spielablauf bleibt bestehen. Der Erzählerplatz in der Sitzplatzansicht ist bestätigt: fest unten mittig.

### Bestätigt: Sitzreihenfolge und Kreisübersicht

- Im Sitzplatzreiter wird die Reihenfolge **aller Spieler** festgelegt.
- Die Namen werden **von links ausgehend im Uhrzeigersinn** angeordnet. Die Kreisübersicht bildet genau diese Reihenfolge ab.
- Die Reihenfolge entspricht den tatsächlich nebeneinandersitzenden Personen. Der Paranormale Ermittler verwendet dieselbe Reihenfolge; der letzte und erste Sitz sind Nachbarn.
- Der Erzähler gehört nicht zu den Personen mit Spielrolle. In der Sitzplatzansicht erhält er einen eigenen, festen Platz **unten mittig**; dieser zählt nicht als regulärer Spielersitz.
- Nach der Sortierung gibt es eine Übersicht mit sämtlichen Spielern. Insbesondere müssen auch bei 20 Spielern alle Personen in dieser Übersicht enthalten sein.
- Jeder Spieler erscheint als **rechteckige Kachel** im Kreis.
- **Ein Anfangsbuchstabe** des Spielernamens steht mittig in der Kachel. Vollständige Namen stehen nicht dauerhaft in den Kacheln, damit die Übersicht kompakt bleibt.
- Auch bei gleichen Anfangsbuchstaben müssen die Kacheln intern eindeutig ihrer Person und ihrem Sitz zugeordnet sein. Der Anfangsbuchstabe ersetzt keine Spieleridentität.
- Die genaue Bedienung der Sortierung ist noch offen. Aus dieser Entscheidung folgt weder eine bereits bestätigte Drag-and-drop-Pflicht noch eine konkrete Buttonlösung.

### Bestätigt: Erzähler festlegen und unten mittig platzieren

- Aus den teilnehmenden Personen wird **genau eine Person als Erzähler festgelegt**.
- Der Erzählerplatz ist in der Sitzplatzansicht **immer fest unten mittig**, entsprechend der realen Position beim Erzählen.
- Der Platz wird beim Umsortieren der Mitspieler nicht verschoben. Eine andere Erzählerperson ändert die Zuordnung, nicht die Position dieses Platzes.
- Die als Erzähler festgelegte Person erhält keine Spielrolle und wird nicht zugleich als regulärer Mitspieler geführt. Die gemeinsame gespeicherte Person bleibt dabei erhalten; es wird kein globaler Spieler gelöscht.
- Die Zahl 6–20 zählt ausschließlich Personen mit Spielrolle. Die Darstellung muss daher bei voller Runde **20 Mitspieler plus einen Erzähler** aufnehmen können.
- Reihenfolge und Nachbarschaften der Spielregeln werden nur aus den regulären Mitspielern gebildet. Der Erzählerplatz wird dabei übersprungen, insbesondere bei der Untersuchung durch den Paranormalen Ermittler; die Sitzfolge der Mitspieler bleibt zyklisch.
- Bei einer Erzählerzuweisung werden Mitspielerzahl, gültige Sitzordnung und Startvoraussetzungen erneut geprüft. Weniger als sechs Mitspieler nach einer Zuweisung sind kein gültiger Spielstart.

Die genaue Aktion zum Zuweisen/Wechseln sowie die Rückkehr des bisherigen Erzählers in die Mitspielerliste und dessen Sitzposition beim Wechsel werden noch festgelegt. Es wird keine ungefragte automatische Tauschregel eingeführt. Die Rolle und feste Position des Erzählers sind bereits bestätigt.

### Bestätigt: vollständigen Namen durch Gedrückthalten anzeigen

Es wird eine neue UI-Funktion für die kompakte Spieleranzeige benötigt:

1. Eine Spielerkachel zeigt zunächst den Anfangsbuchstaben.
2. Der Nutzer hält die Kachel gedrückt.
3. Ein kleines Fenster ähnlich einem Tooltip zeigt den **vollständigen Spielernamen** der betreffenden Person.

Die Funktion ist für die kompakte Kreisübersicht vorgesehen und muss auf dem Handy nutzbar sein. Die Namensanzeige enthält keine geheimen Rollen oder sonstigen Spielinformationen. Eine gemeinsame wiederverwendbare Umsetzung ist ein Vorschlag für die spätere Implementierung, noch keine festgelegte Komponenten-API.

Noch zu detaillieren: Haltezeit, Schließen des Fensters, Positionierung am Bildschirmrand sowie Zusammenspiel mit Scrollen oder einer später gewählten Sortiergeste. Ebenso wird ein zugänglicher gleichwertiger Bedienweg für Tastatur und assistive Technik bei der konkreten UI-Planung festgelegt. Hier werden keine ungefragten Gesten oder Zeitwerte vorgegeben.

**Umsetzungsstatus:** ausdrücklich nur dokumentiert. Weder Reiter noch Kreisübersicht oder Namensfenster wurden als Produkt-UI implementiert.

### Vorgeschlagene Übergänge

- **Konfiguration öffnen:** bisherigen Entwurf erhalten; keine Karten auslosen und keinen Spielzustand erzeugen.
- **Zurück aus Konfiguration:** Mitspieler, Erzähler, Reihenfolge und Einstellungen unverändert übernehmen, abgesehen von bewusst vorgenommenen Änderungen.
- **Regeln öffnen/schließen:** Vorbereitung erhalten; keine Rollenverteilung auslösen. Die genaue Darstellungsform wird noch festgelegt.
- **Spiel starten:** Vorbereitung validieren und genau einmal den passenden Business-Einstieg aufrufen; danach zur Rollenverteilung innerhalb des Spielablaufs wechseln.
- Verhalten beim Zurückkehren während einer laufenden Partie, Fortsetzen und bewusstem Neustart wird gesondert geklärt. Es wird daraus keine zusätzliche dauerhafte Speicherung abgeleitet.

## Fachliche Leitplanken für Hauptansicht und Konfiguration

Diese Punkte stammen aus bestätigten Spielregeln und gelten unabhängig vom endgültigen Layout:

- Eine Seherin ist Pflicht; freie Plätze sind normale Dorfbewohner. Pro besonderer Rollenkarte gibt es höchstens eine.
- **Feste Rollen:** Wolfszahl per verpflichtender Buttonauswahl aus den freigegebenen Werten wählen; das System berechnet eine separate Empfehlung. **Variable Rollen:** Wolfszahl nach der konkreten Ziehung automatisch bestimmen. Bei 9 und 10 ist immer genau zwei vorgegeben. Keine freie Zahleneingabe.
- Im variablen Modus gilt: **konkrete Sonderrollen und Items ziehen → dafür Wolfszahl berechnen → mit Dorfbewohnern auffüllen → Rollen verteilen**.
- Vor dem Start darf nur die Machbarkeit eines variablen Entwurfs geprüft werden. Es darf keine heimliche Vorabziehung mit späterem erneuten Auslosen geben.
- Die zufällig gezogenen Karten, ihre genaue Anzahl und ihre Punkte dürfen Mitspielern vor der Rollenverteilung nicht verraten werden. Eine Kurzübersicht zeigt im variablen Modus den erlaubten Pool/Bereich beziehungsweise „Automatisch“, nicht eine angeblich bereits feststehende Ziehung.
- Änderungen an Teilnehmerzahl oder Konfiguration erfordern eine erneute Machbarkeitsprüfung. Keine Sonderrollen stillschweigend entfernen oder Einstellungen eigenmächtig ersetzen.
- Start benötigt einen von den Mitspielern getrennten Erzähler, eine gültige Spielerzahl, passende Rollenplätze und eine gültige feste/variable Konfiguration.
- Fehlergründe werden verständlich und handlungsbezogen angezeigt. Englische Business-Fehlercodes gehören nicht in die Oberfläche.
- Benutzeroberfläche Deutsch/Englisch über Übersetzungsressourcen; Dokumentation und Chat Deutsch; Code, Bezeichner und Kommentare Englisch.

## Bestehende Bausteine und Integration für Claude Code

| Baustein | Verwendung / wichtige Grenze |
| --- | --- |
| `src/presentation/game-kit/PlayerRosterContext.ts` | Gemeinsame gespeicherte Personen und ihre Aktionen verwenden. |
| `src/presentation/game-kit/PlayersSetup.tsx` | Bestehende Namenseingabe/gespeicherte Auswahl berücksichtigen. Der aktuelle Baustein sortiert die Anzeige alphabetisch; eine echte Sitzreihenfolge muss deshalb ausdrücklich modelliert und erhalten werden. |
| `src/business/shared/players.ts` | Gemeinsame Namensaufbereitung nutzen. Der Erzähler wird getrennt übergeben. |
| `src/business/games/werewolf/configuration.ts` | Spielergrenzen, freigegebene Rollen und Wolfszahlen. |
| `src/business/games/werewolf/automaticSetup.ts` | Automatische Bewertung fester Rollen; Machbarkeitsprüfung ohne Punkteberechnung für Kandidaten. |
| `src/business/games/werewolf/balancedSetup.ts` | Feste Aufstellung bzw. exakte Zufallsanzahl starten; manuelle Wolfswerte werden ignoriert. |
| `src/business/games/werewolf/variableSetup.ts` | Entwurf öffentlich auf Machbarkeit prüfen, danach einmalig private variable Partie erzeugen. |
| `src/business/games/werewolf/stateMachine.ts` | Private Rollenverteilung und Spielablauf. Geheime Zustände ausschließlich an die jeweils berechtigte Ansicht geben. |

Die Dateien im Spiel-Branch können gegenüber anderen Arbeitsordnern neuer sein. Vor UI-Implementierung den verwendeten Branch und dessen Business-Tests prüfen; keine ältere Kopie der Spiellogik nachbauen. Änderungen der gemeinsamen Spielerverwaltung müssen andere Spiele erhalten.

## Noch vor der Hauptansicht-Umsetzung zu klären

1. Wie wird im bestätigten Sitzplatzreiter umsortiert, und wie werden neue/entfernte Teilnehmer in die Sitzordnung übernommen?
2. Genaue Bedienung der bestätigten Erzählerzuweisung und Verhalten beim Wechsel: Was passiert mit der bisherigen Erzählerperson und deren Sitz? Die neue Erzählerperson und der feste Platz unten mittig sind bereits festgelegt.
3. Welche Angaben gehören in die kompakte Einrichtungsvorschau?
4. Darstellungsform der bestätigten Spielanleitung und Rückweg zur Spielauswahl an die gemeinsame App-Navigation anbinden. Die Existenz dieser Standardaktionen ist bereits bestätigt.
5. Was passiert bei einer bereits laufenden Partie, erneutem Öffnen, Zurückgehen und bewusstem Neustart?
6. Details des bestätigten Namensfensters beim Gedrückthalten: Haltezeit, Schließen, Positionierung und Zusammenspiel mit weiteren Gesten.

Die feste Rollenkonfiguration wird im folgenden eigenen Abschnitt konkretisiert. Der variable Modus bleibt für später zurückgestellt. Der eigentliche Spiel-/Erzählerablauf wird nach neuer Vorgabe in einer zentralen Ansicht geplant; Phasenaufgaben sind Inhalts-/Aktionszustände dieser Ansicht, keine Vorgabe für getrennte Hauptseiten. Die bestehenden Implementierungsaufgaben `We-01-26` bis `We-01-32` bleiben dafür bestehen. Die Hauptansicht besitzt den geplanten Umsetzungsschritt `We-01-34`. Seine Umsetzung beginnt erst nach Klärung der offenen Hauptansicht-Entscheidungen. Die Aufgabe `We-01-26` bezeichnet ausdrücklich die Rollenkonfiguration.


### Einordnung: Was für die Hauptansicht noch gebraucht wird

Die Standardaktionen Spiel starten, Spieleinstellungen und Spielanleitung sind bestätigt und gelten als gemeinsame Spielbedienung. Weitere zusätzliche Bereiche sind aktuell nicht beschlossen. Für die Werwolf-Hauptansicht bleiben vor allem die folgenden Details zu klären:

- **Erzählerwahl:** Eine teilnehmende Person wird als Erzähler festgelegt und in der Sitzplatzansicht fest unten mittig gezeigt. Sie zählt nicht zu den 6–20 Mitspielern und erhält keine Spielrolle. Die konkrete Wechselbedienung bleibt zu klären.
- **Spieleranzahl und Startbereitschaft:** Die Zahl zählt ausschließlich Mitspieler. Vor Start müssen Erzähler, Teilnehmer und Sitzordnung zusammenpassen. Ein verständlicher Grund erklärt eine fehlende Startvoraussetzung. Die genaue visuelle Darstellung wird später entschieden.
- **Sitzordnung bearbeiten:** Festlegen, wie umsortiert wird und wo hinzugefügte Personen beziehungsweise frei werdende Plätze eingeordnet werden. Jede aktive Person muss genau einmal vorkommen. Keine neuen Rollen oder zweite Spieleridentitäten daraus ableiten.
- **Entwurf erhalten:** Beim Wechsel zwischen Spieler-/Sitzplatzreiter, Spieleinstellungen und Anleitung darf die Vorbereitung nicht versehentlich verloren gehen.

Das Wiederöffnen einer bereits laufenden Partie sowie Fortsetzen/Neustart bleiben eine separate offene Bedienentscheidung. Diese Liste ist eine Eingrenzung der nächsten Planung, keine Freigabe neuer Produkt-UI oder einer dauerhaften Spielspeicherung.


## Konfiguration: gemeinsamer Aufbau und zuerst feste Rollen

### Bestätigte Grundlage

- Oben gibt es einen **Umschalter zwischen festen und variablen Rollen**. Dieser wechselt zwischen zwei Konfigurationsansichten.
- Beide Ansichten sollen möglichst gleich aufgebaut bleiben. Vertraute Positionen und dieselbe visuelle Sprache für Rollen, Freigaben und Infos erhalten.
- **Zuerst wird ausschließlich die feste Rollenvergabe geplant.** Die Bedienung des variablen Pools und seiner Bereiche wird später konkretisiert. Der vorhandene Business-Modus wird dadurch nicht geändert.
- Rollen erscheinen als **Buttons**. Eine aktivierte Rolle ist am ausgewählten Button erkennbar. Die bestehende Präferenz für farbig gefüllte Auswahlbuttons und mobile Bedienbarkeit gilt weiter.
- Sämtliche Rollen bleiben sichtbar, auch wenn die aktuelle Spielerzahl noch nicht für sie ausreicht. Gesperrte Rollen werden optisch eindeutig als noch nicht verfügbar dargestellt.
- Rollenbuttons werden in einem **gleichmäßigen Raster** angeordnet. Es gibt oben einen gemeinsamen Block **verfügbare Rollen** und darunter **noch nicht verfügbare Rollen**. Im unteren Block bleiben die Rollen nach Freigabe-Spielerzahl in Zeilen mit Trennstrichen gegliedert. Auch im oberen Block bleiben die Freigabe-Spielerzahlgruppen getrennt und aufsteigend angeordnet. Der Erzähler zählt nicht mit.
- Jede Rolle und jeder Zusatz besitzt einen **i-Button mit einfacher Erklärung**. Auch die Freigabe eines aktuell gesperrten Trunkenbolds/Amuletts soll verständlich erklärt werden.
- Dies ist weiterhin ausschließlich Planung. Keine Produkt-UI im aktuellen Schritt implementieren.

### Bestätigt: Pflichtrollen und automatische Dorfbewohner

Oben werden die Pflicht-/Füllrollen dargestellt:

| Anzeige | Verhalten |
| --- | --- |
| **Werwölfe** | Bei festen Rollen verpflichtende Auswahl aus erlaubten Zahlenbuttons. Allgemeinen Standard initial vorauswählen; Empfehlung getrennt kennzeichnen und Auswahl nicht automatisch ersetzen. Bei nur einem freigegebenen Wert feste Anzeige, etwa zwei bei 9/10. Keine Deaktivierung und keine freie Zahleneingabe. |
| **Seherin** | Genau eine, nicht deaktivierbar. |
| **Dorfbewohner** | Sichtbare Anzahl der automatisch aufgefüllten normalen Dorfbewohner; verständlicher kurzer Hinweis, dass freie Spielerplätze automatisch belegt werden. Keine manuelle Mengeneingabe. |

Die Berechnung lautet: Mitspielerzahl minus Werwölfe minus eine Seherin minus Anzahl ausgewählter optionaler Rollenkarten. Zusätze belegen keinen Rollenplatz. Nicht startfähige Entwürfe brauchen einen verständlichen Fehlerzustand anstelle einer scheinbar gültigen oder negativen Dorfbewohnerzahl.

### Bestätigt: Zusätze gesondert führen

**Schutzamulett** und **Trunkenbold** gehören nicht zwischen die regulären Rollenkarten. Sie werden separat als Zusatz-Auswahl geführt, jeweils mit i-Button. Beide bleiben auch vor ihrer Freigabe erkennbar.

Der Nutzer schlägt vor, diese kompakte Gruppe ebenfalls **oben** anzuordnen. Die gesonderte Gruppe ist bestätigt; die genaue obere Position ist noch ein Layoutvorschlag. Trunkenbold bleibt als Zusatz zu einer vorhandenen Rolle ab neun Mitspielern verfügbar, Schutzamulett ab zehn. Die jeweiligen Bedingungen aus der Business-Schicht bleiben maßgeblich.

### Freigabezuordnung der optionalen Rollen

Die folgende Zuordnung bildet die aktuelle Logik ab; die spätere Implementierung liest die Freigaben aus der Business-Schicht, statt sie separat neu zu definieren. Sie bestimmt die Zeilen im unteren Block der noch nicht freigegebenen Rollen. Auch im oberen Block verfügbarer Rollen bleiben diese Freigabegruppen jeweils zusammen; spätere Freigaben stehen unter früheren.

| Zeile | Sichtbare Rollen |
| --- | --- |
| **Ab 6 Spielern** | Hexe, Jäger, Dorftrottel und die Alternative Leibwächter/Dorfmatratze. |
| **Ab 7 Spielern** | Amor und Harter Bursche. |
| **Ab 8 Spielern** | Gerber und Seher-Lehrling. |
| **Ab 9 Spielern** | Alte Vettel (Spellcaster) und Bürgermeister mit doppelter Stimme. |
| **Ab 10 Spielern** | Paranormaler Ermittler; zusätzlich wird die Hammer-Variante des Bürgermeisters freigegeben. |
| **Ab 11 Spielern** | Magier. |

Bedingte Zusatzfreigaben wie der Hammer oder die gemeinsame Heilrollenwahl erzeugen keine zweite Kopie derselben Rolle. Sie werden am jeweiligen Rollen-/Variantencontrol erklärt und angepasst. Der Magier bleibt in der Zeile ab elf sichtbar; die spätere Möglichkeit, ihn gemeinsam mit der Hexe zu spielen, ist eine Bedingung derselben Karte.

### Bestätigt: Alternativen und dynamische Auswahlcontrols

Die missverständliche Nennung Dorftrottel/Bodyguard wurde ausdrücklich geklärt:

- **Leibwächter und Dorfmatratze sind die Alternative mit gemeinsamem Auswahlcontrol.** Höchstens eine der beiden Rollen darf aktiv sein. Es muss weiterhin möglich sein, keine der beiden Rollen auszuwählen; die genaue Buttonmechanik ist noch zu detaillieren.
- **Dorftrottel bleibt ein eigener, unabhängiger Rollenbutton.** Er darf gemeinsam mit Leibwächter oder Dorfmatratze spielen.
- **Hexe und Magier:** Solange nur eine der beiden Rollen zulässig ist, müssen die Controls die Alternative verständlich darstellen. Ist gemeinsames Spielen erlaubt, müssen beide unabhängig aktivierbar sein. Es werden dann keine gegenseitig ausschließenden Controls beibehalten.
- Die Controls passen sich an Spielerzahl und gültige konkrete Aufstellung an. Keine zusätzliche Rollenregel allein in der UI erfinden.

Aktuelle gemeinsame Heilerfreigabe: Bei 11–13 bleiben Hexe und Magier Alternativen; bei 14–16 sind beide mit vier Wölfen zulässig; bei 17–20 mit vier oder fünf. Unter elf ist der Magier gesperrt. Bei festen Rollen bleibt die Wolfszahl manuell aus den erlaubten Werten gewählt; bei variablen Rollen wird sie automatisch ermittelt.

### Für die Umsetzung wichtige Validierungsbedingungen

Diese Punkte folgen aus den vorhandenen Regeln und der bestätigten Automatik:

1. **Mögliche neue Auswahl prüfen:** Eine noch nicht aktive Rolle wird anhand der hypothetischen Aufstellung mit dieser Rolle auf Machbarkeit geprüft. Nicht ausschließlich auf die aktuell angezeigte Wolfszahl schauen.
2. **Andere erlaubte Wolfszahlen berücksichtigen:** Beispiel bei 14 Spielern mit drei manuell gewählten Wölfen: Hexe und Magier gemeinsam sind erst mit vier möglich. Die Oberfläche muss diese Bedingung verständlich machen. Die manuelle Wolfswahl darf durch eine Rollenaktion nicht stillschweigend auf vier geändert werden. Ob die zusätzliche Rollenwahl zunächst gesperrt ist oder als zu korrigierender Entwurf zugelassen wird, bleibt zur konkreten Bedienung abzustimmen.
3. **Platzgrenzen respektieren:** Wenn keine erlaubte Wolfszahl genügend Rollenplätze lässt oder eine andere Kombination die Auswahl verhindert, ist die Rolle aus diesem Grund nicht auswählbar. Das ist ein anderer Zustand als eine noch nicht erreichte Mindestspielerzahl.
4. **Entwurf nicht heimlich verändern:** Bei Änderungen der Spielerzahl oder anderer Einstellungen keine bereits ausgewählten Rollen stillschweigend löschen oder automatisch austauschen. Konflikte erkennbar anzeigen und eine bewusste Korrektur ermöglichen.
5. **Kein Zufall in fester Konfiguration:** Die Vorschau darf feste Rollen bewerten, erzeugt aber noch keine zufällige Rollenverteilung. Erst Spiel starten erzeugt die Partie.

### Info-Buttons: Inhalt und Bedienung

Bestätigt ist eine kurze, einfache Erklärung jeder Rolle und jedes Zusatzes. Beispielhafte Struktur: Was kann die Rolle? Wann handelt sie? Warum ist sie gegebenenfalls noch gesperrt? Keine ausführlichen Regeltexte auf jeder Kachel.

Für die spätere Umsetzung beachten:

- Der i-Button bleibt **auch bei gesperrten Rollen/Items erreichbar**, sonst kann der Nutzer den Freigabegrund nicht lesen.
- Info öffnen aktiviert/deaktiviert die Rolle nicht. Rollenwahl und Info sind getrennte Aktionen mit getrennten bedienbaren Flächen.
- Unterschiedliche Sperrgründe unterscheiden: zu wenige Mitspieler, unzulässige Kombination oder kein freier Rollenplatz. Nicht jeden Grund als fehlende Spielerzahl ausgeben.
- Die Erklärung darf Spielregeln erläutern, enthält aber keine ausgelosten privaten Spielerrollen.
- Konkrete Darstellung des Infofensters (zum Beispiel mobiles Kurzfenster) und Schließverhalten werden noch festgelegt.

### Rollenoptionen: bestätigtes Auswahlprinzip und weitere Details

Die Grundauswahl deckt die Karten ab. Vorhandene Partieoptionen müssen zusätzlich erreichbar bleiben:

| Option | Bestehende Auswahl |
| --- | --- |
| Jäger | Schuss freiwillig (Standard) oder verpflichtende Zielwahl. |
| Gerber | Sieg durch jedes Ausscheiden (Standard) oder nur durch Abstimmung. |
| Bürgermeister | Doppelte Stimme oder Hammer; pro Partie genau eine Variante, Freigaben beachten. |
| Alte Vettel | Selbstwahl erlauben oder verbieten. |
| Allgemeine Partie | Rollen nach dem Ausscheiden aufdecken oder geheim halten; Wolfsangriff bereits in der ersten Nacht ein-/ausschalten. |

Für den Jäger ist die Bedienung bestätigt: Ein optionaler Varianten-Auswahlbutton aktiviert die Rolle durch die Auswahl der Schussregel. Keine Auswahl bedeutet kein Jäger. Dasselbe optionale Variantenprinzip ist nun auch für Gerber, Bürgermeister und Alte Vettel bestätigt. Der i-Button dient der Erklärung und ist nicht zugleich ein versteckter Einstellungsbutton. Für die allgemeinen Partieoptionen ist ihre kompakte Position noch festzulegen. Defaults und Regeln aus der Business-Schicht übernehmen, nicht aus diesem UI-Entwurf neu erfinden.

### Noch zu klärende Konfigurationsdetails

- Konkrete Leer-/Wechselbedienung optionaler Auswahlbuttons und weitere Variantencontrols detaillieren. Die Jägeraktivierung selbst ist geklärt.
- Exakte Mechanik des gemeinsamen Leibwächter-/Dorfmatratzen-Controls und weiterer Alternativen, einschließlich Abwählen.
- Darstellung des Infofensters und der unterschiedlichen Sperr-/Konfliktzustände.
- Platz der allgemeinen Partieoptionen und des separaten Zusatzblocks.
- Verhalten beim Wechsel fest/variabel: Welche getrennten Entwürfe bleiben erhalten? Keine Auswahl ungefragt löschen oder eine Zufallsziehung auslösen.

Der Nutzer betrachtet den bisherigen grundlegenden Aufbau der festen Konfiguration als ausreichend abgestimmt. Die bestätigten Inhalte bilden die Grundlage für deren spätere Umsetzung; verbleibende Bedienfeindetails und Konfliktfälle bleiben als offene Einzelpunkte sichtbar. Die Details der variablen Konfiguration werden ausdrücklich erst später definiert.


### Bestätigt: Jäger über optionalen Varianten-Auswahlbutton

| Auswahl | Bedeutung | Vorhandene Business-Zuordnung |
| --- | --- | --- |
| Keine Auswahl | Kein Jäger im Spiel. | `hunter` nicht in der ausgewählten Rollenliste. |
| Schusspflicht | Jäger mit verpflichtender Zielwahl. | `hunter` auswählen, `hunterShot: "required"`. |
| Keine Schusspflicht | Jäger mit freiwilligem Schuss. | `hunter` auswählen, `hunterShot: "optional"`. |

Die Kurztexte sind naheliegende Beschriftungen; die endgültige Gestaltung wird später präzisiert. Bestätigt sind die drei Zustände und die direkte Aktivierung durch Auswahl einer Variante.

- Der Auswahlbutton ist **optional**: keine Variante oder genau eine Variante. Ein leerer Zustand muss auswählbar und erneut erreichbar sein; die konkrete Geste zum Leeren bleibt zu detaillieren.
- Es gibt keinen zusätzlichen Jäger-Ein-/Aus-Schalter und keinen davon getrennten versteckten Variantenbereich.
- **Keine Schusspflicht bedeutet aktiver Jäger**, nicht deaktivierte Rolle. Nur keine Auswahl bedeutet kein Jäger.
- Jede aktive Variante belegt genau einen optionalen Rollenplatz. Beim Leeren wird der Platz frei und die feste Aufstellung erneut berechnet.
- Der Business-Standard freiwilliger Schuss darf einen Jäger nicht ungefragt aktivieren. Er beschreibt die Schussregel einer bereits ausgewählten Rolle.
- Der i-Button erklärt ausschließlich und verändert die Auswahl nicht.
- Pflichtrollen unterscheiden sich davon: Wolfszahl automatisch und verpflichtend, ohne leeren Zustand; Seherin ebenfalls verpflichtend.

Ausschließlich dokumentiert. Vorhandene Spiellogik und Produkt-UI wurden nicht geändert.


### Bestätigt: Wolfswahl und kompakte Empfehlung je Modus

Diese Entscheidung ersetzt die frühere Vorgabe einer verbindlichen automatischen Wolfszahl in beiden Modi.

| Modus | Verbindliches Verhalten |
| --- | --- |
| **Feste Rollen** | Manuelle Auswahl der Wolfszahl ausschließlich innerhalb der bestätigten Grenzen. Initial ist der allgemeine Standard der Spielerzahl ausgewählt. Das System berechnet für die konkrete Besetzung eine separate Empfehlung. |
| **Variable Rollen** | Erst konkrete Sonderrollen und Items auslosen, danach die Wolfszahl automatisch bestimmen. Keine manuelle Wolfswahl. |

Bei festen Rollen bleibt eine gültige gewählte Zahl erhalten, wenn Rollen, Items oder Einstellungen die Empfehlung verändern. Die Empfehlung ersetzt diese Auswahl nicht automatisch. Ein abweichender Wert ist nicht allein deshalb ungültig, weil ein anderer empfohlen wird. Echte Regel-/Platzkonflikte müssen dagegen vor dem Start geklärt werden. Bei Spielerzahländerungen muss geprüft werden, ob die bisherige Zahl noch erlaubt ist; die konkrete Behandlung einer dann ungültigen Auswahl ist noch abzustimmen.

#### Bestätigte Darstellung der Empfehlung

- **Nur wenn tatsächlich mehrere Wolfszahlen zur Auswahl stehen**, gibt es eine Empfehlungsmarkierung.
- Der Button der empfohlenen Zahl wird durch einen **Rand** hervorgehoben.
- **Direkt darunter** steht ausschließlich das kurze Wort **„empfohlen“**. Keine längere Standardbegründung oder zusätzliche Textzeile wie „Für deine Rollenauswahl …“.
- Die aktuelle Auswahl bleibt unabhängig davon erkennbar, etwa durch den bereits vereinbarten gefüllten Auswahlzustand. Rand und Wort markieren die Empfehlung, die Auswahlmarkierung den tatsächlich gewählten Wert.
- Ist die empfohlene Zahl zugleich ausgewählt, können beide Merkmale zusammen erscheinen. Ein Tippen auf einen Zahlenbutton wählt diesen Wert; ein separater Übernahmebutton ist dafür nicht erforderlich.
- Gibt es nur eine erlaubte Wolfszahl, wird diese fest angezeigt. **Kein Empfehlungsrand und kein „empfohlen“**, insbesondere bei 6, 9, 10 und 13 Spielern.
- Im variablen Modus besteht keine manuelle Zahlenwahl; die automatische Anzahl erhält keine solche Empfehlungsmarkierung.
- Ist die aktuelle Aufstellung insgesamt ungültig und keine gültige Empfehlung verfügbar, darf keine erfundene Empfehlung markiert werden. Der Fehlerzustand wird gesondert behandelt.

Beispiel: Sieben Spieler, ein Wolf ausgewählt, starke Sonderrollen. Der Button **1** bleibt als Auswahl markiert, **2** erhält den Empfehlungsrand und darunter **„empfohlen“**. Erst wenn der Nutzer **2** auswählt, ändert sich die feste Wolfszahl und die Dorfbewohnerzahl wird neu berechnet.

#### Auswirkungen auf die spätere Umsetzung

**We-03-62 ist seit 19.11.2026 umgesetzt und geprüft:** `fixedSetup.ts` bietet `resolveFixedWerewolfLineup` für die Vorschau und `createFixedWerewolf` für den Start. Die erlaubte manuelle Wolfszahl bleibt in `settings.wolfCount`, die getrennte Empfehlung in `balance.recommendedWolfCount`. Rollen-/Itemfreigaben, Kombinationen, Plätze, Erzähler und Zufallswerte werden geprüft. Der alte automatische Einstieg ignoriert weiterhin manuelle Werte und ist daher nicht für diesen UI-Modus zu verwenden. Variabler Pfad und Ziehungsreihenfolge bleiben erhalten.

Die konkrete Konfliktbedienung, falls eine Rolle eine andere erlaubte Wolfszahl benötigt oder die Spielerzahl eine bestehende Wahl ungültig macht, bleibt offen. Keine automatische Rollenlöschung oder unbemerkte Wolfszahländerung einführen. Ausschließlich dokumentiert, keine Produkt-UI oder Spiellogik in diesem Planungsschritt geändert.


### Vollständiger Bestand der bereits implementierten Partie-/Rollenoptionen

Die Einstellung zum Wolfsangriff ab Nacht eins ist für die Rollenkonfiguration relevant und wurde ausdrücklich aufgenommen. Folgende Optionen existieren bereits in der Spiellogik; UI-Position und kurze Beschriftungen sind teilweise noch zu konkretisieren. Es werden daraus keine zusätzlichen Spielregeln erfunden.

| Zuordnung | Einstellung | Werte | Bisheriger Business-Standard |
| --- | --- | --- | --- |
| Allgemeine Partie | Wolfsangriff in der ersten Nacht | Angriff ab Nacht 1 / ab Nacht 2 | Ab Nacht 2; Wölfe lernen sich in Nacht 1 kennen. |
| Allgemeine Partie | Rollen nach dem Ausscheiden aufdecken | Aufdecken / geheim halten | Aufdecken. |
| Jäger | Letzter Schuss | Freiwillig / Zielwahl verpflichtend | Freiwillig, falls Jäger aktiviert ist. Leere UI-Auswahl bedeutet kein Jäger. |
| Gerber | Eigene Siegbedingung | Jedes Ausscheiden / nur Ausscheiden durch Abstimmung | Jedes Ausscheiden. |
| Bürgermeister | Fähigkeit | Doppelte Stimme / Hammer | Doppelte Stimme; Hammer erst ab zehn Spielern. |
| Alte Vettel | Sich selbst stummschalten dürfen | Verboten / erlaubt | Verboten. |

Die Trennung ist bestätigt: **Erster Wolfsangriff** und **Rollen nach dem Ausscheiden** sind allgemeine Einstellungen. Ein kompakter Bereich innerhalb der Konfiguration ist dafür ein Layoutvorschlag; umgesetzt als Reiter **„Einstellungen“** (nicht „Spielregeln“, damit er nicht mit dem Knopf der Spielanleitung verwechselt wird). Auswahl über Buttons passt zur bisherigen Gestaltungsrichtung; zum Beispiel „Nacht 1 / Nacht 2“ für den ersten Wolfsangriff und „Aufdecken / Geheim“ für Rollen nach dem Ausscheiden. Diese Beschriftungen und die genaue Position sind noch nicht endgültig bestätigt. Jäger, Gerber, Bürgermeister und Alte Vettel erhalten jeweils einen optionalen Varianten-Auswahlbutton nach dem bestätigten Jäger-Prinzip.

Bereits separat geplant sind Modus Fest/Variabel, optionale Rollenkarten, Amulett/Trunkenbold als Zusätze und die Wolfswahl beziehungsweise automatische Wolfszahl. Beim später zu planenden variablen Modus kommen Rollen-/Itempools und deren inklusive Mindest-/Höchstzahlen hinzu. Ein Bereichsminimum aktiviert keine unsichtbare neue Rolle außerhalb des erlaubten Pools.

**Keine zusätzlichen Einstellfelder** werden aus festen Rollenregeln abgeleitet: etwa für die Enthüllung des Trunkenbolds in Nacht drei, die einmalige Ermittlerfähigkeit oder die Übergaberegel des Amuletts. Solche Regeln werden im i-Fenster erläutert. Das interne Forschungsfeld `wolfCountMode` ist ebenfalls kein zusätzlicher UI-Spielmodus und darf nicht als frei erfundene Einstellung angeboten werden.

Die Defaults stammen aus der bestehenden Business-Schicht. Sie aktivieren keine optionale Rollenkarte und ersetzen nicht die noch zu planende Bedienung. Ausschließlich dokumentiert; keine Produkt-UI oder Spiellogik geändert.


### Bestätigte Trennung: allgemeine Regeln und optionale Rollenvarianten

Die beiden allgemeinen Einstellungen sind:

- **Erster Wolfsangriff:** ab Nacht 1 oder ab Nacht 2.
- **Rollen nach dem Ausscheiden:** aufdecken oder geheim halten.

Diese Einstellungen sind unabhängig von der Aktivierung einer bestimmten optionalen Rolle und haben jeweils einen gültigen gewählten Wert. Sie sind keine optionalen Rollen-Auswahlbuttons. Die genaue Position und Darstellung des allgemeinen Einstellungsblocks wird noch gestaltet.

Die anderen genannten Einstellungen werden jeweils **direkt durch einen optionalen Varianten-Auswahlbutton der Rolle** dargestellt:

| Rolle | Erste Variante | Zweite Variante | Keine Auswahl |
| --- | --- | --- | --- |
| Jäger | Schusspflicht | Keine Schusspflicht | Kein Jäger. |
| Gerber | Sieg bei jedem Ausscheiden | Sieg nur bei Abstimmung | Kein Gerber. |
| Bürgermeister | Doppelte Stimme | Hammer | Kein Bürgermeister. |
| Alte Vettel | Selbstwahl erlaubt | Selbstwahl verboten | Keine Alte Vettel. |

Die Variantenbezeichnungen sind verständliche Arbeitsbeschriftungen; die Auswahlsemantik ist bestätigt:

- Genau eine Variante oder leere Auswahl. Beide Varianten gleichzeitig sind ausgeschlossen.
- Eine gewählte Variante aktiviert genau eine Rollenkarte und belegt einen Rollenplatz. Kein zusätzlicher Ein-/Aus-Schalter.
- Keine Auswahl deaktiviert die Rolle. Insbesondere „keine Schusspflicht“ und „Selbstwahl verboten“ sind aktive Varianten, keine leeren Zustände.
- Abwählen gibt den Rollenplatz frei; Auswahl und Empfehlung für die feste Aufstellung werden konsistent erneut geprüft. Eine gültige manuelle Wolfswahl wird nicht ungefragt ersetzt.
- Verfügbarkeit der Rolle und der einzelnen Varianten weiter aus der bestehenden Logik ableiten. Beispiel: Bürgermeister mit doppelter Stimme ab neun Spielern, Hammer ab zehn. Vor Freigabe einer Variante darf sie nicht aktiviert werden.
- Der i-Button erklärt und aktiviert keine Variante. Fachliche Defaults allein aktivieren keine optionale Rollenkarte.
- Die konkrete Öffnungs-, Wechsel- und Leerbedienung der Auswahlbuttons bleibt ein Gestaltungsdetail.

Die Unterscheidung ersetzt die zuvor noch offene Frage, ob diese Varianten gesammelt in einem zusätzlichen Spielregeln-Bereich bearbeitet werden sollen. Nur die beiden allgemeinen Regeln sind davon getrennt. Die Bedienung des variablen Rollenmodus wird weiterhin in einem eigenen Planungsschritt konkretisiert. Ausschließlich dokumentiert, keine Produkt-UI oder Spiellogik geändert.


### Aktueller Planungsabschluss der Rollenansicht

Der grundlegende Aufbau der **festen Rollenkonfiguration ist abgestimmt**. Für diesen Aufbau werden aktuell keine weiteren Funktionsbereiche ergänzt. Die bestätigten Vorgaben aus den vorstehenden Abschnitten bleiben maßgeblich.

Die **variable Konfiguration soll möglichst ähnlich aussehen**. Ihre konkreten Controls, Bereiche und Bedienabläufe werden vom Nutzer später festgelegt. Sie sind derzeit **bewusst zurückgestellt** und dürfen bei einer Übergabe an Claude Code nicht als bereits fertige UI-Spezifikation behandelt oder aus der festen Ansicht eigenmächtig vervollständigt werden. Die vorhandene variable Business-Logik bleibt bestehen.

Verbleibende Bedienfeindetails (etwa Leeren/Wechseln eines Auswahlbuttons oder genaue Infofensterdarstellung) sind von diesem abgestimmten Grundaufbau zu unterscheiden. Noch offene Produktentscheidungen wie die Behandlung einer ungültig gewordenen manuellen Wolfswahl bleiben ausdrücklich markiert. Der feste Spieleinstieg **We-03-62** ist inzwischen umgesetzt; siehe `fixedSetup.ts` und technische Übergabe.

Keine Produkt-UI umgesetzt. Die Details der variablen Rollenansicht folgen in einer späteren gemeinsamen Planung.


### Bestätigte Ergänzung: Rollenraster mit zwei Verfügbarkeitsbereichen

Die Rollenbuttons sollen **gleichmäßig in einem Raster** stehen, damit die Anordnung einheitlich aussieht. Dies betrifft die Struktur der optionalen Rollenauswahl; die bereits geplanten Pflicht-/Füllrollen und gesonderten Zusätze bleiben erhalten.

| Bereich | Bestätigte Anordnung |
| --- | --- |
| **Verfügbare Rollen** | Oben als gemeinsamer Bereich mit getrennten Zeilen beziehungsweise zusammenhängenden Gruppen je ursprünglicher Freigabe-Spielerzahl. Rollen ab sechs werden nicht mit Rollen ab neun vermischt. Gruppen aufsteigend anordnen. |
| **Noch nicht verfügbare Rollen** | Darunter. Nach Freigabe-Spielerzahl in Zeilen gruppieren und diese **durch Trennstriche** voneinander absetzen. Erkennbar lassen, ab welcher Spielerzahl die jeweilige Gruppe freigeschaltet wird. |

- Beide Bereiche verwenden ein einheitliches Raster und eine gleichmäßige Gestaltung der Rollenbuttons. Unterschiedlich lange Rollennamen dürfen nicht zu einer beliebig unruhigen Anordnung führen. Exakte Maße und Spaltenzahlen sind noch nicht festgelegt.
- Alle Rollen bleiben weiterhin sichtbar. Sobald die Spielerzahl die Mindestfreigabe erreicht, gehört die Rolle in den oberen Bereich; die Auswahl wird dadurch nicht automatisch aktiviert. Die Darstellung folgt den Freigaben der Business-Schicht.
- Eine wegen Kombination oder belegter Rollenplätze aktuell nicht auswählbare Rolle ist nicht mit einer aufgrund der Mindestspielerzahl noch gesperrten Rolle gleichzusetzen. Solche Konflikte weiterhin am zutreffenden Grund erklären.
- Gesperrte Rollen bleiben optisch unterscheidbar und ihre i-Erklärungen bedienbar.
- Der untere Bereich enthält die noch nicht erreichten Spielerzahlgruppen; keine doppelten Rollenkarten in beiden Bereichen darstellen.
- Der Erzähler zählt für die Freigabe weiterhin nicht mit.

**Präzisierung bestätigt:** Auch oben bleiben Rollen mit derselben Freigabe-Spielerzahl zusammen. Beide Bereiche sind aufsteigend nach Mindestspielerzahl geordnet. Es entsteht kein gemischtes Raster über mehrere Freigabegruppen. Eine einzige horizontal scrollbare Gesamtreihe ist damit nicht gemeint. Konkreter Umbruch innerhalb einer Gruppe und Spaltenzahl bleiben Layoutdetails. Keine Produkt-UI umgesetzt.


### Bestätigte Präzisierung: Freigabegruppen auch bei verfügbaren Rollen erhalten

- Rollen derselben ursprünglichen Freigabe-Spielerzahl bleiben **in beiden Bereichen zusammen**. Eine Freigabe verschiebt die ganze betreffende Gruppe in den verfügbaren Bereich; sie löst die Gruppe nicht auf.
- Im oberen Bereich folgen beispielsweise **Ab 6**, **Ab 7**, **Ab 8**, **Ab 9** aufeinander, soweit diese Gruppen bereits verfügbar sind. Der untere Bereich setzt die noch nicht erreichten Freigaben ebenfalls aufsteigend fort.
- Rollen einer früheren Gruppe werden nicht neben Rollen einer späteren Gruppe in dieselbe gemischte Rasterzeile einsortiert. Ein erforderlicher Umbruch innerhalb einer Gruppe bewahrt ihre erkennbare Zusammengehörigkeit; genaue Spaltenzahl und Umbruchgestaltung bleiben Layoutdetails.
- Ein einheitliches Raster und gleichmäßige Rollenbuttons gelten weiterhin. Untere Gruppen bleiben durch die bereits bestätigten Trennstriche gegliedert.
- Die erhaltene Reihenfolge soll die Orientierung erleichtern: Weiter unten stehen später freigeschaltete Rollen, die nach Einschätzung des Nutzers stärker spielentscheidend sein können. Diese Freigabestufe ist **kein verbindliches Stärke-Ranking**. Es wird keine zusätzliche Sortierung nach Punktwerten und keine Regel „später ist immer stärker“ eingeführt.
- Ausgewählte Varianten ändern nicht die Freigabegruppe einer Rollenkarte. Zusatzbedingungen wie Bürgermeister-Hammer ab zehn oder spätere gemeinsame Hexe-/Magierwahl bleiben am bestehenden Control erklärt; keine doppelte Karte in einer weiteren Zeile.

Damit ist die frühere Rückfrage zur Bedeutung „in einer Reihe“ geklärt. Keine Produkt-UI oder Spiellogik geändert.


## Spielablauf: offener Vorschlag für Tarnaufrufe im Nachtskript

Der Nutzer kennt den Ablauf so, dass die Hexe jede Nacht nach Heil- und Gifttrank gefragt wird, auch wenn Tränke bereits verbraucht sind. Bei offenen Rollen nach dem Ausscheiden stellt sich die Frage anders als bei geheimer Rollenaufdeckung. Diese Unterscheidung ist aktuell Gegenstand der Planung; die nachstehende Lösung ist ein **Vorschlag und noch nicht bestätigt**.

Wichtig: Ausgeschiedene Spielernamen bleiben bekannt. Die Einstellung zur Rollenaufdeckung bestimmt, ob zusätzlich ihre Rolle bekannt wird; sie versteckt nicht die Identität der ausgeschiedenen Person.

### Vorgeschlagene einheitliche Regel

| Situation | Vorgeschlagenes Nachtskript |
| --- | --- |
| Rolle lebt, Fähigkeit/Tränke noch verfügbar | Regulär aufrufen und handeln lassen. |
| Rolle lebt, Fähigkeit/Tränke verbraucht | Den regulär vorgesehenen Aufruf und die allgemeinen Fragen beibehalten. Verbrauch nicht durch eine öffentliche Auslassung verraten. |
| Rolle ausgeschieden, Rolle öffentlich aufgedeckt | Deren regulären Nachtaufruf überspringen; die Gruppe kennt das Ausscheiden dieser Rolle bereits. |
| Rolle ausgeschieden, Rolle geheim | Den vorgesehenen Aufruf als Tarnaufruf beibehalten. Niemand handelt; der Erzähler darf Tod der Rolle oder Verbrauch nicht öffentlich verraten. |

Die Spielleitung müsste intern erkennen können, ob eine echte Handlung oder nur ein Tarnaufruf ansteht. Ungültige Aktionen bleiben in der Logik verboten; ein unveränderter gesprochener Satz gibt keinen verbrauchten Trank zurück.

Einmalige zeitgebundene Schritte wie Amor in Nacht eins oder Trunkenbold-Enthüllung in Nacht drei behalten ihre festen vorgesehenen Nächte. Sie werden nicht allein wegen Tarnaufrufen zu täglichen Aktionen. Beschluss vom 21.11.2026: Nachtaufrufe richten sich ausschließlich nach tatsächlich verteilten Rollen und Zusätzen; nicht gezogene Pool-Einträge werden übersprungen (We-03-68).

Diese vorgeschlagene einheitliche Behandlung würde unter anderem die bisherige Bürgermeister-Sonderregel verändern: Sein Tarnaufruf bleibt aktuell auch nach öffentlich aufgedecktem Tod bestehen. Andere verbrauchte Fähigkeiten, etwa die Ermittleruntersuchung, werden aktuell teilweise übersprungen. Deshalb nicht behaupten, die allgemeine vorgeschlagene Tarnregel sei bereits vollständig implementiert. Vor einer Umsetzung ist die Produktentscheidung abzuschließen. Keine Spiellogik oder Produkt-UI geändert.


### Originalabgleich zu Hexe und Tarnaufrufen

Geprüft: Ultimate Werewolf: Ultimate Edition. Die Hexe wird ausdrücklich auch nach Verbrauch ihrer Kräfte weiter aufgerufen und nach beiden gefragt ([Hexe, PDF-Seite 18](https://board-game-rules.com/wp-content/uploads/2025/01/ultimate-werewolf-ultimate-edition_Official-Rules.pdf#page=18)). Bei verdeckten Rollen nennt das Heft Nachtaufrufe ausgeschiedener Rollen zur Tarnung; auslassen erst bei offenkundig bekannter Rolle ([Rollenaufdeckung, PDF-Seiten 3–4](https://board-game-rules.com/wp-content/uploads/2025/01/ultimate-werewolf-ultimate-edition_Official-Rules.pdf#page=4)).

Das belegt die Hexenregel unmittelbar. Die vorgeschlagene einheitliche Umsetzung für sämtliche GameHub-Rollen bleibt eine gesondert zu bestätigende Planung; Code unverändert.


## Spiel-/Erzähleransicht: bestätigter zentraler Aufbau

Der eigentliche Spielablauf soll **grundsätzlich in einer einzigen zentralen Ansicht** stattfinden. Tag, Nacht, Rollenaktionen und Übergänge tauschen Inhalte und passende Aktionen innerhalb dieser Ansicht aus. Dies ist kein Auftrag, für jede Rollenphase eine zusätzliche Hauptseite zu bauen. Die übergeordnete Aufteilung Hauptansicht / Konfiguration / Spielablauf bleibt bestehen. Details der vorangehenden Rollenverteilung und des späteren Spielabschlusses werden bei Bedarf separat konkretisiert.

### Oben: Phase und globale Spielaktionen

| Element | Bestätigte Aufgabe |
| --- | --- |
| **Tag-/Nachtanzeige** | Sonne für Tag, Mond für Nacht. |
| **Hintergrund** | Zwei unterschiedliche Hintergründe: **Tag hell**, **Nacht dunkel**. Der explizite helle Tageshintergrund gilt für diese Spielansicht; die allgemeine Dark-Mode-Präferenz wird dadurch nicht pauschal für die ganze App aufgehoben. |
| **Spieler-/Rollenübersicht öffnen** | Button öffnet eine Übersicht mit allen Spielern und ihren Rollen. Eine Liste beziehungsweise Tabelle ist als Darstellungsform vorgeschlagen; genaue Form und Öffnungsart noch nicht festgelegt. |
| **Schließen** | Button zum Beenden/Abbrechen der Partie. Ob und wie eine Rückfrage oder ein Rückweg erscheint, ist noch zu konkretisieren. |

Die Übersicht mit sämtlichen Rollen ist eine private Information der Spielleitung. Ihre Öffnung und Rückkehr dürfen den laufenden Schritt nicht neu auslosen oder die bisherige Partie zurücksetzen. Sie ist von einer öffentlichen Anzeige der ausgeschiedenen Rollen zu unterscheiden.

### Darunter: Skript, echte Namen und aktuelle Entscheidung

- Die Ansicht zeigt **Überschriften und Hinweise für den Erzähler** zum aktuellen Schritt, zum Beispiel **„Werwölfe wachen auf“**.
- Zusätzlich erscheinen die **echten Namen der jeweils betreffenden Spieler** sowie weitere Ablaufhinweise, zum Beispiel **„Opfer auswählen“**. Die konkrete Anordnung dieser Namen wird später gestaltet.
- Für jede Rolle sind **feste Texte und Hinweise als Presets** vorgesehen. Je nach Partiephase, Rollenbesetzung und Ablauf werden die passenden Inhalte eingeblendet. Keine ausführliche Geschichte erforderlich; der Erzähler kann seine Formulierungen selbst gestalten.
- Wo eine Entscheidung nötig ist, kann der Erzähler die zugehörige Aktion **erfassen/protokollieren**. Beispiel: Die Wölfe wählen Spieler ABC als Ziel; der Erzähler trägt ABC als Wolfsopfer in den laufenden Spielzustand ein.
- Die konkrete Eingabeform dieser Aktionen ist noch nicht entschieden. Das Beispiel begründet insbesondere noch kein neues Freitextfeld; vorhandene Spieleridentitäten und erlaubte Aktionsziele müssen verwendet werden.
- Die Business-Schicht entscheidet über gültige Ziele und Auswirkungen. Eine UI-Auswahl ist nicht selbst die Todesauflösung.
- Auch für den **Übergang von Nacht zu Tag** und die **Bekanntgabe der Verstorbenen** gibt es feste Presets. Die gewählte Einstellung zur Rollenaufdeckung bleibt dabei maßgeblich.
- Mit „protokollieren“ ist hier zunächst die Erfassung der Spielentscheidung bestätigt. Umfang einer sichtbaren Aktionshistorie, Rücknahmen oder dauerhafter Logs/Exporte ist dadurch noch nicht festgelegt.

Das feste Nachtskript folgt der vorhandenen Business-Reihenfolge. Die zuvor besprochene einheitliche Behandlung von verbrauchten/toten Rollen und Tarnaufrufen ist weiterhin offen; diese Detailentscheidung wird nicht aus dem neuen Layout abgeleitet.

### Unten: phasenabhängige Navigation

| Phase | Bestätigte Buttons |
| --- | --- |
| **Nacht** | **Zurück** und **Weiter**. |
| **Tag** | **Voting starten** und **Tag beenden**. |

Die Navigationsfläche bleibt unten in der Ansicht. Ob sie fest am Bildschirmrand steht oder sich mit einem Inhaltsbereich bewegt, ist ein noch offenes Layoutdetail.

**Wichtig für die spätere Umsetzung:** Die Bedeutung von „Zurück“ ist noch zu klären: nur den vorherigen Hinweis anzeigen oder auch eine bereits bestätigte Aktion rückgängig machen? Auswirkungen auf Trankverbrauch, Opfer, Einmalfähigkeiten und geheime Informationen dürfen nicht eigenmächtig festgelegt werden. Die aktuelle Zustandsmaschine besitzt noch keinen allgemeinen Rückwärtsbefehl; aus dem bestätigten Button folgt daher keine bereits implementierte Undo-Funktion. Gleiches gilt für Bestätigung, Zeitpunkt und Ziel des Abbruchs.

### Restfläche und erweiterte Spielerkreis-Ansicht

Der Nutzer hatte erwogen, die Restfläche über der Navigation für einen **erweiterten Spielerkreis** mit **Items, Status und weiteren Informationen pro Spieler** zu verwenden. Wegen des Platzbedarfs soll diese Darstellung voraussichtlich in einer **zusätzlichen Ansicht** erweitert werden.

Der erste konkrete Entwurf ist im folgenden Abschnitt **Erweiterte Live-Kreisübersicht** festgehalten. Die endgültige Symbolik und einige Zustandsdetails bleiben offen.

- Ein erweiterter Spielerkreis beziehungsweise eine erweiterte Spielerübersicht ist vorgesehen.
- Sie soll Items, Status und weitere noch zu benennende Informationen je Spieler darstellen können.
- Restflächen-Nutzung in der zentralen Ansicht versus konkrete Zusatzansicht, Zugang, Bedienung und Informationsumfang werden noch präzisiert.
- Nicht eigenmächtig zusätzliche Anzeigen, Statussymbole, Menüs oder Rollenaktionen erfinden.
- Die oben bereits bestätigte Spieler-/Rollenliste und der erweiterte Spielerkreis sind zunächst zwei beschriebene Wünsche; ob beide zusammengeführt werden, ist noch nicht entschieden.

### Übergabestatus und nächste Detailklärung

Der beschriebene Aufbau und der erste Entwurf des erweiterten Spielerkreises sind festgehalten. Offen bleiben insbesondere genaue Presettexte/Übergänge, Aktionsbedienung, Rückwärtsverhalten, Abbruchverhalten und die zusätzliche Übersicht. Diese Liste dient der späteren Planung und ist keine Aufforderung, sie bereits jetzt durch eigene UI-Entscheidungen zu schließen.

**Ausschließlich dokumentiert. Keine Produkt-UI oder Spiellogik implementiert.**


## Erweiterte Live-Kreisübersicht: erster Entwurf

### Status und Zweck

Der Nutzer bezeichnet die folgende Gestaltung ausdrücklich als **ersten Ansatz**, noch nicht in allen Details durchdacht. Sie ist als Arbeitsentwurf festzuhalten. Insbesondere die Slotbelegung und vollständige Symbolauswahl werden noch konkretisiert. Keine endgültigen Symbole für nicht beschriebene Rollen oder Effekte erfinden und keine Produkt-UI umsetzen.

Die Übersicht orientiert sich grundsätzlich an der Kreis-/Sitzplatzansicht der Hauptansicht, ist aber deutlich detailreicher. Sie ist ein **Livebild des Spielgeschehens**: Jede erfasste Aktion aktualisiert die betroffenen Darstellungen zur Laufzeit. „Liveticker“ beschreibt hier diese laufende Zustandsaktualisierung; daraus folgt noch kein zusätzlicher Textticker.

Grundsitzordnung und der bestehende Erzählerplatz bleiben die Grundlage. Die Informationen sind **privat für den Erzähler**, denn Rollen, Angriffsziele, Items und Todesgründe können geheim sein. Keine öffentliche Mitspieleransicht automatisch mit sämtlichen Informationen versorgen.

### Platzaufteilung und gehaltenes Detailfeld

- Der Kreis soll ungefähr die **unteren 60–70 %** der Übersicht belegen. Die ursprünglich genannten 60 % sind lediglich ein ungefährer Richtwert; auch 60–70 % sind keine starren Mindest-/Höchstgrenzen oder feste Pixelvorgabe. Die tatsächliche Aufteilung wird passend zu Display und benötigtem Platz für die Spielerinfos gestaltet.
- Darüber bleibt Platz für ein **Detailfeld** zur jeweils gedrückt gehaltenen Person.
- Solange eine Spielerdarstellung gedrückt gehalten wird, erscheint das Feld mit allen Informationen in Kurzform. Beim Loslassen endet diese gehaltene Detailanzeige.
- Genannt sind: **vollständiger Spielername, Rolle, vorhandene Items, Todesgrund** sowie weitere noch zu ergänzende Informationen.
- Die konkreten weiteren Felder, exakte Aufteilung relativ zu Kopf/Navigation, Positionierung und alternative zugängliche Bedienung werden später präzisiert.
- Diese Detailanzeige ist umfangreicher als das zuvor geplante reine Namensfenster der kompakten Hauptansicht. Sie ist nicht ungefragt auf einen Tooltip mit nur dem Namen zu reduzieren.

### Spielerdarstellung und sechs Symbolslots

Jede Person besitzt eine Spielerkachel mit zustandsabhängiger Hintergrundfarbe und **mittig dem ersten Buchstaben ihres Namens**. Dazu kommen **drei Symbolslots links** und **drei rechts** an der Kachel.

| Position | Vorläufig vorgesehener Inhalt |
| --- | --- |
| Links oben | Rollen-Symbol. |
| Links Mitte und unten | Eigene rollenspezifische Ressourcen/Objekte, etwa Heil- und Gifttrank der Hexe oder der Hammer des Bürgermeisters. |
| Rechts oben | Beispiel Liebespaar: beide verbundenen Spieler erhalten ein Herz. |
| Rechts Mitte und unten | Weitere von außen erhaltene Dinge/Effekte; konkrete Belegung noch offen. |

Die linken Slots stehen somit für **eigene Rolle und eigene Ressourcen**, die rechten für **erhaltene Effekte/Zusätze**. „Itemslots“ sind hier Anzeigeplätze für Symbole, kein neu eingeführtes Inventar mit sechs Gegenständen.

Die Bürgermeister-Darstellung muss seine gewählte Variante berücksichtigen: Ein Hammer passt zur Hammer-Variante; das Symbol für doppelte Stimme ist noch nicht festgelegt. Für alle anderen Rollen, verbrauchte Ressourcen und unbenutzte Slots fehlt teilweise noch die Symbolfestlegung. Es werden dafür noch keine eigenen Icons oder Regeln erfunden.

### Vorgeschlagene Hintergründe

| Farbe | Bedeutung laut erstem Entwurf |
| --- | --- |
| **Schwarz** | Tote Spieler; auch tote Werwölfe sind schwarz. |
| **Blau** | Lebende Spieler, außer Werwölfen und anderen ausdrücklich markierten Zuständen. |
| **Werwolfgrau** | Lebende Werwölfe. Der konkrete Grauton ist noch nicht festgelegt. |
| **Rot** | Angegriffene Spieler, zum Beispiel durch Wolfsangriff oder Hexengift. |
| **Dunkelrot** | Harter Bursche, wenn er nach dem Angriff nicht gerettet wurde und sein verzögerter Tod bevorsteht. Er ist damit noch nicht als tot/schwarz dargestellt. |

Schwarz für bereits Tote ist ausdrücklich festgelegt und ersetzt insbesondere den grauen Hintergrund eines toten Wolfs. Weitere Prioritäten überlappender Zustände sind noch zu klären. Ebenso offen: Wann genau eine Angriffsmarkierung erscheint/endet, was nach Rettung oder Schutz angezeigt wird und wie mehrere Angriffe auf dieselbe Person zusammengefasst werden. Eine Auswahl als Angriffsziel ist nicht automatisch gleichbedeutend mit einem endgültigen Tod.

### Vorgeschlagene Rahmen und ihr Fortbestand

| Rahmen | Bedeutung |
| --- | --- |
| **Goldener Rahmen** | Schutzamulett. |
| **Grüner Rahmen** | Trunkenbold. |
| **Beide gemeinsam** | Trunkenbold-Rahmen **außen**, Amulett-Rahmen innen. |

- Der grüne Rahmen verschwindet, sobald die Person ihre echte Rolle erfährt.
- Stirbt die Person **als Trunkenbold vor der Enthüllung**, bleibt der grüne Rahmen laut Nutzer **bis zum Spielende erhalten**.
- Dieser Fortbestand ist eine historische Anzeigeinformation. Sie darf nicht dadurch verloren gehen, dass später nur noch der aktuelle Zustand „tot“ dargestellt wird.
- Der Sonderfall eines vorzeitig enthüllten Trunkenbold-Jägers ist bei der Detailklärung ausdrücklich mit dieser Regel abzugleichen; kein widersprüchliches Rahmenverhalten eigenmächtig festlegen.
- Anzeige der tatsächlichen Rolle gegenüber dem Trunkenbold-Symbol vor Enthüllung ist ebenfalls noch zu klären, insbesondere Rollen-Symbol links oben und Text im privaten Detailfeld.
- Der Amulett-Rahmen muss die tatsächliche Besitz-/Übergabe-/Verlustlogik berücksichtigen. Es wird kein zusätzlicher Schutz oder neuer Weitergabeeffekt allein durch den Rahmen eingeführt.

### Legende

Es ist eine **gesondert öffnende Legende in einem zusätzlichen Fenster** vorgesehen, da im Kreis selbst nicht genügend Platz dafür ist. Sie erklärt die tatsächlich verwendeten Symbole, Farben und Rahmen. Genaue Öffnung, Schließung und Darstellung des Fensters werden noch festgelegt. Die Legende muss bei der späteren Symbolfestlegung mitgepflegt werden.

### Offene Details dieses ersten Entwurfs

- Vollständige verständliche Symbole für sämtliche Rollen, eigenen Ressourcen und erhaltenen Effekte; spätere Varianten nicht ungefragt mit demselben Symbol gleichsetzen.
- Verfügbare, verbrauchte und leere Ressourcenplätze unterscheiden; die konkrete Darstellung ist noch nicht vereinbart.
- Belegung der weiteren rechten Slots, insbesondere weitere Effekte neben dem Liebespaar.
- Priorität und Lebensdauer von Angriffs-/Verwundungsmarkierungen sowie gerettete/geschützte Ziele.
- Verdeckte Rolle des Trunkenbolds, vorzeitige Jäger-Enthüllung und der grüne Rahmen nach frühem Tod.
- Vollständiger Inhalt des gehaltenen Detailfeldes. Als mögliche spätere Ergänzungen prüfen: Sitzplatz, Rollenressourcen, Partnerbezug und genauer aktueller Zustand; noch nicht als neue Pflichtfelder bestätigt.
- Darstellung bis 20 Mitspieler plus Erzähler, lesbare Slots, exakte Größen und zulässige Umbrüche.
- Wie diese Kreisübersicht aus der zentralen Erzähleransicht geöffnet wird und ob die zuvor gewünschte Spieler-/Rollenliste separat bestehen bleibt.
- Welche Anzeigeinformationen die vorhandene Zustandsmaschine bereits liefert und welche historischen Angaben vor einer Umsetzung noch zusätzlich geführt werden müssen. Diese technische Prüfung ist keine Freigabe, jetzt ein vollständiges dauerhaftes Ereignisprotokoll zu bauen.

### Ganz zum Schluss: optionaler Spielverlauf nach Partieende

Der Nutzer möchte als mögliche spätere Erweiterung einen **vollständigen Spielverlauf am Ende der Partie** betrachten können. Ereignisse sollen nach Tagen beziehungsweise Spielphasen geordnet sichtbar sein. Beispiel aus der Planung:

> Tag 2: Dorfbewohner (echter Spielername) – Tod durch Gifttrank der Hexe (echter Spielername).

Damit sind insbesondere Zielperson mit echter Identität, Rolle, Todesursache und handelnde Person gemeint. Der genaue Ereigniskatalog, die Zuordnung Nachtaktion/Morgenverkündung und die Detailbedienung bleiben später zu planen.

Diese Erweiterung hat **ausdrücklich letzte Priorität** und wird **erst ganz zum Schluss** behandelt. Sie ist kein Teil der aktuell zu vervollständigenden Basis-Erzähleransicht. Die Live-Kreisübersicht und ihre zur Laufzeit benötigten Zustandsinformationen werden nicht mit einer bereits freigegebenen vollständigen Verlaufsoberfläche verwechselt. Dauerhafte Speicherung oder Export wurde nicht beschlossen.

### Umsetzungsstatus

Erweiterte Live-Kreisübersicht, Legende, Detailfeld und spätere Verlaufsidee sind ausschließlich dokumentiert. Der aktuelle Schritt enthält weder Produkt-UI noch neue Spiellogik, Icons, Farbwerte oder Ereignisspeicherung.


## Gewinneransicht: benötigter Abschluss

**Bestätigt:** Nach dem Spielende wird eine Gewinner-/Ergebnisansicht benötigt (`We-01-30`). Ihre Gestaltung wird ausdrücklich erst am Ende gemeinsam mit Claude Code festgelegt; jetzt keine weitere Layoutplanung. Sie ist der Abschluss des Spielablaufs und kein neu eingeführter vierter Hauptbereich. Technischer Anschluss sind `status: finished`, `winner` und gegebenenfalls `tannerWinner`; Details und Grenzen stehen in der [technischen Übergabe](GAMEHUB_WERWOLF_HANDOFF.md). Die Implementierungsaufgabe bleibt offen.


## Hammer-Änderung vom 20.11.2026 – implementiert

Der Bürgermeister mit Hammer erwacht nach dem Magier und vor dem Spellcaster. Er kennt keine laufenden Nachtopfer und darf jede Person wählen, die zu Beginn der Nacht lebte, außer sich selbst. Auch ein bereits als Nachtopfer bestimmter Bürgermeister darf handeln. Ein Werwolf wird vom Hammer getroffen, selbst wenn bereits andere tödliche Angriffe gegen ihn vorliegen; jede Person stirbt nur einmal. Das Amulett schützt nicht vor dem Hammer, auch keinen getroffenen Werwolf. Bei Wahl eines Nichtwerwolfs stirbt der Bürgermeister durch die Fehlentscheidung, die Zielperson bleibt vom Hammer unberührt. Die Fehlentscheidungsstrafe wird nicht vom Amulett abgewehrt; ein verbundener Liebespartner stirbt mit. Todesfälle durch Hammer, Fehlentscheidung und dadurch ausgelöste Partnertode sind nicht heilbar. Bereits ausgeführte Nachtaktionen bleiben wirksam; gemeinsame Auflösung und Bekanntgabe am Morgen.

We-03-63 ist seit 20.11.2026 implementiert: Hammer nach Magier, Zielmenge vom Nachtbeginn, gemeinsame Todesauflösung und Überschneidungen geprüft. Magierheilung wurde nicht erweitert. Ziele, Tarnskript, Protokoll und Rücknahme siehe GAMEHUB_WERWOLF_NARRATOR_API.md.

## Beschlossene Regeländerungen vom 20.11.2026 – Logik implementiert, UI-Anbindung offen

Beim Durchgehen der Info-Fenster der Konfiguration hat der Auftraggeber folgende Regeln beschlossen. Die Info-Texte der Oberfläche (`werewolfConfig.info.*`) beschreiben sie bereits, die Spiellogik und Regeln sind inzwischen nachgezogen (We-03-65); die neue Auswahl muss noch mit der UI verbunden werden (We-01-48):

1. **Harter Bursche, zwei Optionen.** Standard ist das Original: Nur ein Wolfsangriff wird verzögert (Angriffsnacht noch rettbar, Tod in der Folgenacht). Die zweite Option (Arbeitsname "jeder Angriff") ist die Logik des Auftraggebers: Auch Gift und Todeszauber (Hexe ohne Magier genauso) sowie der Jägerschuss verzögern den Tod. Der Harte Bursche überlebt dann den Tag, spricht und stimmt normal mit, stirbt aber in der Nacht danach und kann nicht mehr gerettet werden. Der Jägerschuss fällt morgens; deshalb gilt dort derselbe Ablauf (Tag überleben, in der Folgenacht sterben). Der Todeszauber verhält sich nach demselben Prinzip, weil ihn in der Nacht niemand retten kann. Hammer, Abstimmung und Liebespartner-Tod bleiben sofort tödlich. **Implementiert:** `WerewolfSettings.toughGuy: "wolfOnly" | "anyAttack"`, Standard `wolfOnly`, einschließlich Regeltests und Logging der ursprünglichen Verwundungsursache. Die Oberfläche verdrahtet danach die Wahl als geteilten Button (Rolle mit zwei Optionen, wie Jäger und Gerber).
2. **Schutzamulett (aktualisiert durch zweite Regelrunde).** Letzter Nachtschritt bleibt Behalten oder Weitergeben. Pflicht nur nach eigenem abgewehrtem Wolfsangriff, Gift oder Todeszauber. Hammer, Abstimmung und Jägerschuss werden nicht abgewehrt; Liebeskummer löst keine Pflicht aus. Ein noch getragenes Amulett verschwindet beim Tod des Trägers. Die frühere weitergehende Schutzwirkung ist ersetzt.
3. **Seher-Lehrling.** Ist die Seherin tot, ruft der Erzähler in den folgenden Nächten offen "Seher-Lehrling" auf; er übernimmt ihre Rolle (wählt eine Person, erfährt, ob sie ein Werwolf ist). Die bisherige heimliche Information entfällt; dass es keine Seherin mehr gibt, darf allen auffallen.
4. **Amor.** Amor darf sich selbst als einen der beiden Verliebten wählen.
5. **Bestätigt (keine Änderung):** Der Leibwächter schützt vor Wolfsangriff, Gift und Todeszauber, nicht vor dem Hammer, und ist selbst nicht geschützt. Die Dorfmatratze schützt nur vor dem Wolfsangriff und stirbt an der Stelle der Person; ein direkter Wolfsangriff auf sie geht ins Leere. Die Info-Texte sagen das jetzt so.


### Bestätigter Zeitpunkt des Amulettschutzes

Präzisierung des Auftraggebers zum Amulett (aktuelle zweite Regelrunde): Entscheidend ist der Besitzer im Moment eines nächtlichen Wolfsangriffs, Gifts oder Todeszaubers. Eine frühere Abwehr bleibt nach der Weitergabe wirksam; neue Besitzer werden nicht rückwirkend gerettet. Hammer, Tagesabstimmung und jeder Jägerschuss umgehen das Amulett unabhängig vom Besitzer. Liebeskummer und bereits ausgelöste Verwundungen werden ebenfalls nicht abgewehrt. Nur ein tatsächlich abgewehrter Nachtangriff erzwingt die Weitergabe; bei Liebeskummer bleibt Behalten oder Weitergeben freiwillig.

## Weitere beschlossene Regeländerungen vom 20.11.2026 (zweite Runde) – Logik implementiert in We-03-66

1. **Schutzamulett schützt nur vor Angriffen der Nacht.** Es fängt Wolfsangriff, Gift und Todeszauber ab. Hammer, Tagesabstimmung und Jägerschuss töten den Träger trotz Amulett; so erfährt niemand, wer das Amulett hat oder an wen es weitergegeben wurde. Einheitlich gilt damit: Hammer, Abstimmung und Jägerschuss können den Tod des Ziels nicht verhindern. Ausnahme: Beim Harten Burschen mit der Option anyAttack verzögert der Jägerschuss den Tod wie bisher. **Ersetzt** die Aussagen im Abschnitt Schutzamulett von `docs/GAMEHUB_WERWOLF.md`, das Amulett fange eine erfolgreiche Tagesabstimmung und den Jägerschuss ab. Folgen: Die Weitergabepflicht entsteht nur noch nach einem in der Nacht abgefangenen Angriff. Das Amulett behandelt ausschließlich direkte nächtliche Angriffe: Der Tod des Liebespartners hat nichts mit dem Amulett zu tun und löst **keine** Weitergabepflicht aus, auch nicht nachts. Der Träger entscheidet wie sonst auch frei, ob er es behält oder weitergibt; behält er es und der Partner stirbt (nachts oder am Folgetag), stirbt er aus Liebeskummer mit, und das Amulett geht verloren (ersetzt die Aussage, nachts gebe er es vor dem Liebeskummer weiter); die Sonderregel "nach einem abgewehrten Schuss wird die nächste nächtliche Übergabe verpflichtend" entfällt, ebenso ein abgefangenes Abstimmungsziel (`exile` ohne Ausscheiden).
2. **Amor:** Die Verliebten behalten ihre Rollen und Seiten und versuchen aus Spielersicht, gemeinsam zu überleben (als Werwolf den Partner nicht angreifen, als Dorfrolle nicht gegen ihn stimmen). Das ist nicht erzwungen und braucht keine Logik; die Info-Texte der Konfiguration sagen es jetzt so. Ein gemischtes Paar als letzte zwei Überlebende lässt die Werwölfe gewinnen (unverändert).
3. **Trunkenbold als Werwolf (Klarstellung des Ist-Zustands, siehe `drunk.test.ts`):** Scheidet der sichtbare Wolf vor der Enthüllung aus, ruft der Erzähler die Wölfe in den folgenden Nächten als Tarnaufruf (`mode: cover`) auf; niemand wacht auf, es gibt keinen Wolfsangriff, das Spiel läuft weiter. Der Trunkenbold-Wolf erfährt seine Rolle erst zu Beginn der dritten Nacht. Entschieden am 20.11.2026: Es bleibt so, der Trunkenbold wird in diesem Fall nicht früher aufgedeckt.

## Variable Rollen: Bedienung und Wünsche an die Logik (Beschluss vom 20.11.2026, We-01-32)

Der Auftraggeber hat die Bedienung des variablen Modus festgelegt. Die Wünsche 1–7 an die Logik sind in We-03-67 implementiert, die Bedienoberfläche in We-01-32 (siehe Umsetzungsstand unten). Siehe GAMEHUB_WERWOLF_VARIABLE_API.md.

### Bedienung

1. **Oben** stehen die Werwölfe und die feste Seherin (wie im festen Modus), darunter die Sonderrollen und Zusätze.
2. **Drei Kästen:** "Muss ins Spiel" (fest dabei), "Darf ins Spiel" (das System lost, ob die Rolle dabei ist) und "Soll nicht ins Spiel". Zu Beginn liegen **alle verfügbaren** Rollen und Zusätze im Kasten "Soll nicht ins Spiel".
3. **Einordnen** per Drag and Drop zwischen den Kästen (wie bei den Teams in Tabu) oder durch Antippen einer Rolle: Dann erscheinen die drei Möglichkeiten, wohin sie soll. Jede Rolle und jeder Zusatz hat seinen Info-Knopf.
4. **Nicht verfügbare Rollen und Zusätze** (zu wenige Spieler) werden in der variablen Ansicht **gar nicht angezeigt**; es gibt keinen Bereich "Nicht verfügbar". Dasselbe gilt für Optionen, die erst ab einer Spielerzahl möglich sind (Hammer unter 10 Spielern).
5. **Rollen mit mehreren Optionen** (Jäger: Schusspflicht, keine Schusspflicht; Bürgermeister; Gerber; Alte Vettel; Harter Bursche; Leibwächter oder Dorfmatratze) haben jede Option als eigenen Eintrag. Ist eine Option "Muss", sind die anderen derselben Rolle "Soll nicht" und gesperrt. Stehen mehrere Optionen auf "Darf", lost das System; auch dann ist **nie mehr als eine Option derselben Rolle** im Spiel, und es kann sein, dass keine dabei ist. Die Rolle zählt immer einmal.
6. **Unten fest (Fuß des Reiters):** Das Feld "Sonderrollen aus Darf" mit einer Mindest- und einer Höchstzahl. Es zählt **nur** die "Darf"-Rollen ("Muss" ist ohnehin sicher dabei), Optionen derselben Rolle als eine. Die Anzahlen sind gleich gewichtet: Bei Mindestzahl 0 und Höchstzahl 3 ist "keine Darf-Rolle" genauso wahrscheinlich wie "drei Darf-Rollen". Beispiel mit 8 Spielern: Hexe, Jäger (zwei Optionen) und Amor auf "Darf", Harter Bursche auf "Muss": mögliche Zahl 0 bis 3. Das Feld ist die abschließende Einstellung; mindestens N heißt, dass mindestens N der "Darf"-Rollen gelost werden, es können mehr sein.
7. **Werwölfe:** Die Anzahl wird wie im festen Modus mit Zahlenknöpfen gewählt, nur dort, wo die Spielerzahl überhaupt eine Auswahl erlaubt (zum Beispiel 7: 1 oder 2; 11: 2 oder 3; 14 und 15: 3 oder 4; 16: 4 oder 3). Die **Standardzahl der Spielerzahl ist zu Beginn gewählt**, die **empfohlene Zahl ist als "empfohlen" markiert** (gelber Rahmen, solange sie nicht gewählt ist). Wählt man **eine** Zahl, ist sie fest; wählt man **mehrere**, **lost** das System unter ihnen (gleichverteilt); mindestens eine Zahl bleibt gewählt. Bei nur einer erlaubten Zahl ist sie fest. Die Wolfszahl wird nicht nach der Ziehung aus einer Fairness-Rechnung bestimmt. Die Empfehlung kennt die Ziehung nicht und stützt sich deshalb nur auf die **"Muss"-Rollen** und Zusätze (siehe Wunsch 7 an die Logik).
8. Die Seherin ist immer dabei und nicht einstellbar.
8a. **Zusätze (Trunkenbold, Schutzamulett)** haben eigene drei Kästen in einer anderen Farbe als die Rollen. Sie sind **unabhängig voneinander**: Es gibt keine gemeinsame Mindest- und Höchstzahl. Jeder Zusatz auf "Darf" wird für sich gelost, einer auf "Muss" ist sicher dabei.
8b. **Fest und variabel sind unabhängig:** Beide Entwürfe werden getrennt gespeichert (eigener Schlüssel je Modus im gemeinsamen Speicher der Spieleinstellungen), es gibt keine Übernahme von einem in den anderen.
9. Die Kurzübersicht zeigt nur den erlaubten Pool und die Bereiche, niemals eine Ziehung.

### Wünsche an Codex (Logik, `variableSetup.ts`)

1. **Feste Rollen und Zusätze:** Die Eingabe bekommt `requiredRoles` und `requiredItems`. Sie sind immer dabei. Die Mindest- und Höchstzahl gilt nur für die "Darf"-Rollen (Pool ohne die festen). Feste Rollen gehen in die Machbarkeitsprüfung ein (Plätze, Alternativen wie Leibwächter/Dorfmatratze, Hexe/Magier mit den bekannten Ausnahmen).
2. **Optionen als Teil der Ziehung:** Je Rolle eine Menge erlaubter Optionen (Jäger `hunterShot`, Bürgermeister `mayor`, Alte Vettel `allowSelfSilence`, Gerber `tanner`, Harter Bursche `toughGuy`). Ist die Rolle gezogen, wird die Option unter den erlaubten gleichverteilt gewählt und in `settings` der Aufstellung eingetragen. Eine feste Option (Muss) schließt die anderen derselben Rolle aus. Der Hammer ist unter 10 Spielern keine erlaubte Option. Die Rollenanzahl wird nicht durch Optionen erhöht.
3. **Wolfszahl als erlaubte Menge:** Eingabe `wolfCounts` (erlaubte Zahlen innerhalb von `availableWerewolfCounts(players)`, mindestens eine). Eine Zahl heißt fest, mehrere heißen gleichverteilt losen, ohne Fairness-Rechnung. Standardwert der Oberfläche ist die Standardzahl der Spielerzahl (`standardWerewolfCount`).
4. **Machbarkeit mit möglicher Anzahl:** `analyzeVariableWerewolfSelection` liefert zusätzlich die mögliche kleinste und größte Anzahl der "Darf"-Rollen (mit Optionen als eine Rolle und ohne unzulässige Kombinationen) und je Eintrag, ob er überhaupt noch möglich ist (zum Beispiel gesperrt durch eine feste Alternative), damit die Oberfläche Mindest- und Höchstzahl begrenzen und Sperren erklären kann.
5. **Verteilung dokumentieren:** Wie bisher die Zahlenpaare gleich gewichten; zusätzlich die Wolfszahl und die Optionswahl als eigene gleichverteilte Schritte beschreiben.
6. **Zusätze unabhängig:** Der gemeinsame Zusatzbereich (`itemRange`) entfällt. Jeder Zusatz hat Muss, Darf oder Nein; jeder "Darf"-Zusatz wird unabhängig von den anderen gelost (Vorschlag: gleiche Wahrscheinlichkeit für dabei und nicht dabei; bitte so dokumentieren oder Alternative vorschlagen). Die Machbarkeit (Trunkenbold ab 9 Spielern und zwei Wölfen, Amulett ab 10) gilt je Zusatz.
7. **Empfehlung der Wolfszahl für einen Entwurf:** Eine reine Funktion liefert die empfohlene Wolfszahl für die "Muss"-Rollen und "Muss"-Zusätze (die Ziehung ist unbekannt), damit die Oberfläche sie wie im festen Modus markieren kann. Bitte klären, ob die vorhandene Bewertung (`lineupBalance.ts`) dafür genügt.

## Umsetzungsstand der Bedienoberfläche (21.11.2026)

Diese Angaben ersetzen abweichende Einzelheiten der früheren Entwürfe.

### Variable Rollen (We-01-32)

- Oben im festen Kopf: Umschalter Feste/Variable Rollen, darunter die Werwölfe (Dreiviertel der Breite, mit Empfehlung, mehrere Wolfszahlen wählbar) und die Seherin (ein Viertel, Zahl unter dem Namen).
- **Drei Kästen** für Rollen und Zusätze zusammen: Muss ins Spiel (grün), Darf ins Spiel (gelb), Soll nicht ins Spiel (rot). Zusätze sind Einträge mit bläulicher Farbe in denselben Kästen, keine eigenen Kästen. Jede Rolle, jede Option einer Rolle und jeder Zusatz ist ein kleiner Eintrag mit eigenem Info-Knopf.
- **Bedienung:** Ziehen in einen Kasten (der Kasten unter dem Zeiger füllt sich mit seiner Farbe), Antippen öffnet die Wahl der drei Kästen, Gedrückthalten beginnt das Ziehen auch ohne Bewegung (nach 300 Millisekunden). Der mitgezogene Name hat dieselbe Größe und das i-Symbol des Eintrags.
- **Sperren:** Ist eine Option einer Rolle auf „Muss“, sind die anderen Optionen rot und nicht verschiebbar; ebenso das andere Mitglied des Wächterpaars. Der Kasten „Muss“ nimmt nichts mehr auf, wenn für die Spielerzahl kein Platz mehr frei ist (bei allen gewählten Wolfszahlen).
- **Spanne:** Die Leiste „Sonderrollen aus Darf“ am Fuß zeigt „Mindestens“ und „Höchstens“ mit Schaltflächen und „Möglich: a bis b“. „Mindestens“ bleibt unter der Zahl der Rollen auf „Darf“ (alle zu ziehen wäre „Muss“) und unter dem, was die engste gewählte Wolfszahl erlaubt.
- **Zählweise:** Leibwächter und Dorfmatratze zählen als eine Rolle, ebenso mehrere Optionen einer Rolle; Hexe und Magier zählen als eine Rolle, wo sie nicht zusammen spielen dürfen, sonst als zwei und beide dürfen auf „Muss“.
- **Ziehung:** Wolfszahl auslosen, Zahl A gleichverteilt, dann genau A Gruppen so, dass jede einzelne Rolle dieselbe Chance hat, danach Variante und Option, Zusätze einzeln mit 50 %, Rest Dorfbewohner (siehe GAMEHUB_WERWOLF_VARIABLE_API.md).
- Der Erzähler weckt nachts nur die Rollen, die tatsächlich im Spiel sind; die Weckreihenfolge zeigt Rollen auf „Darf“ als mögliche Stufen.

### Weitere Ansichten

- **Spielanleitung (We-01-50):** Knopf „Spielregeln“ in der Kopfleiste, sichtbar in Aufstellung und Konfiguration; Reiter Spiel, Rollen, Optionen. Die Rollentexte sind dieselben wie in den Info-Fenstern.
- **Konfiguration (We-01-51, überarbeitet We-01-55):** Keine Reiter mehr. Oben ein festes Kopfstück in zwei Spalten (links zwei Drittel, rechts ein Drittel): links in **einer Box** die Werwölfe und „Wolfsangriff ab Nacht 1 / Nacht 2“ (mit Info-Knopf), rechts übereinander die Dorfbewohner (Zahl unter dem Namen, im variablen Modus die Spanne, die die Ziehung übrig lässt) und die Seherin im gleichen Aussehen. Darunter scrollt der Rest: im festen Modus die Zusätze und die Rollen, im variablen die Kästen, die Spanne steht fest am Fuß. Der Kopf ist in beiden Modi derselbe (`CoreBlock.tsx`); der feste Modus liegt in `FixedRoles.tsx`, der variable in `VariableRoles.tsx`, der Rahmen in `WerewolfConfiguration.tsx`.
- **Noch offen:** Ansicht für große Bildschirme, Spielstart (We-01-52), Spielablauf.

### Symbolsatz der Erzählersicht (We-01-59, 21.11.2026)

Festgelegt und gebaut ist der Satz der Symbole (`src/presentation/werewolf/symbols`, Legende als Reiter „Symbole“ der Spielanleitung): 16 Rollen, 6 eigene Mittel, 2 Zusätze, 10 Zustände; Rolle, Mittel und Zustand mit derselben Bedeutung teilen das Zeichen. Der Erzähler zeigt beim Aufwecken einer Rolle ihr Symbol und ihre Mittel (verbrauchte durchgestrichen), bei der gewählten Person das Symbol der Wirkung. Die Rahmen und Hintergrundfarben des früheren Entwurfs (golden für das Amulett, grün für den Trunkenbold, Schwarz für Tote, Rot für Angegriffene) bleiben maßgeblich und kommen mit der Erzählersicht dazu. Quellen und Lizenzen: THIRD_PARTY_NOTICES.md.


## Farben der Übersicht „Alle Spieler und Rollen“ und des Spielendes (Beschluss vom 24.11.2026, We-01-157)

Festgehalten nach der Besprechung mit dem Auftraggeber. Grundlage sind die Hintergründe und Rahmen des ersten Entwurfs (siehe oben); die Übersicht bleibt eine Liste (der Sitzkreis des Livetickers kommt später).

**Hintergründe (Zustand der Person):**

| Farbe | Bedeutung |
| --- | --- |
| Schwarz | tot (auch tote Werwölfe) |
| Dunkelrot | Harter Bursche, verwundet: lebt noch, stirbt aber bestimmt (verzögerter Tod) |
| Rot | angegriffen (Wolfsangriff, Gift, Todeszauber, Hammer): **bis zum Tod**, danach schwarz |
| Grün | **gerettet** (Heilung, Schutz des Leibwächters, Amulett): die **ganze Nacht** der Rettung, mit dem Tagesbeginn wieder blau (Beschluss 24.11.2026) |
| Werwolfgrau | lebender Werwolf |
| Blau | lebende Person ohne besonderen Zustand |

Vorrang bei mehreren Zuständen (beschlossen): schwarz, dunkelrot, rot, grün, grau, blau. Ein neuer Angriff auf eine grün angezeigte Person macht sie wieder rot.

**Rahmen:** Gold = Schutzamulett, Grün = Trunkenbold, der seine Rolle noch nicht kennt; beide zusammen: Trunkenbold außen, Amulett innen. Der grüne Rahmen verschwindet mit der Aufdeckung; stirbt die Person vorher, bleibt er bis zum Spielende.

**Trunkenbold:** Es steht immer die **wahre Rolle** da; der grüne Rahmen zeigt, dass die Person Trunkenbold ist und ihre Rolle noch nicht kennt.

**Nicht nur Farbe:** Jeder Zustand behält sein Zeichen (tot, verwundet, Amulett, verliebt, letzter Schuss); die Farbe ersetzt das Zeichen nicht.

**Spielende:** Die Ansicht bleibt wie heute (Gruppen der Gewinner mit Namen). Dazu kommt die Liste aller Spieler mit denselben Farben, **Lebende zuerst, danach die Toten**. Der Spielverlauf bleibt letzte Priorität und ist nicht Teil davon.

**Beschlossen am 24.11.2026:** Grün die ganze Nacht; der verwundete Harte Bursche bleibt auch bei einem Sieg am Tag dunkelrot (er lebt noch und steht bei den Lebenden); Ordnung innerhalb der Lebenden und der Toten alphabetisch; Schutz durch Leibwächter oder Amulett zeigt ebenfalls grün; Farbwerte als Token `--seat-*` in `tokens.css`.

**Spielende, Änderung vom 24.11.2026 (We-01-158):** Die Übersicht „Alle Spieler und Rollen“ bleibt alphabetisch. Am Spielende steht **jede Person nur einmal**: oben die Gewinner nach Gruppe (Seite, Verliebte, Gerber; wer in einer besonderen Gruppe steht, steht nicht noch einmal in der Seite), unten die Verlierer. In jeder Gruppe stehen die Lebenden zuerst (nach Namen), danach die Toten nach Todeszeitpunkt: wer zuletzt starb, steht oben, wer **zuerst** starb, ganz unten. Alle Personen sind farbige Zeilen wie in der Übersicht; die Legende steht unten.

**Umsetzung (We-01-157):** `describePlayers` liefert `tone` (dead, wounded, attacked, saved, wolf, alive); die Komponente `PlayerRows` zeichnet die Zeilen für die Übersicht und das Spielende und eine kleine Legende darunter (statt eines eigenen Fensters). Nicht abgedeckt: ein abgewehrter Gift- oder Zauberangriff (der Zustand merkt sich nur den Wolfsangriff).


## Slots der Zustandszeichen auf der Erzählerkarte (Beschluss vom 24.11.2026, We-01-162)

Die Zustandszeichen oben an der Karte der aufgewachten Rolle gibt es nur noch, wenn die Person sie hat (keine leeren Slots mehr). Sie werden **von rechts nach links** eingefügt, drei in einer Reihe, danach in der **nächsten Reihe darunter** (wieder von rechts nach links). Es gibt keine Obergrenze mehr (acht Zustände sind möglich). Jeder Slot hat einen **Hintergrund je Zustand**:

| Zustand | Farbe |
| --- | --- |
| Verliebt | rosa |
| Schutzamulett | gold |
| Angegriffen | rot |
| Geschützt | blau |
| Übernachtungsgast | blau |
| Vergiftet | rot |
| Stumm | neutral |
| Trunkenbold | grün |

Die Farbwerte stehen als Token `--slot-*` in `tokens.css`; das Zeichen bleibt, die Farbe ersetzt es nicht. Annahme: drei Slots pro Reihe (Breite der heutigen Anzeige).
