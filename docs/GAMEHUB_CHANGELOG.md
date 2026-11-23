# GameHub Changelog

## 2026-11-23

### We-01-139 (Fortsetzung): Erzähleransicht – Spielerauswahl, Morgen, Tag und Abstimmung

Alle Angaben ohne Sichtprüfung im Browser; Tests, Typprüfung und ESLint waren jeweils grün.

- Fähigkeiten: vier Zustände (grün wählbar, grau durchgestrichen verbraucht, gelb gestrichelt rollenbedingt nicht möglich, abgedunkelt wenn die Fähigkeit nicht dran ist); Fähigkeiten stehen im Kreis, Rollen frei; Gifttrank bei der ersten Hexenfrage abgedunkelt; Amors Fähigkeit nach den Verliebten gesperrt.
- Anweisungen statt „Tippe auf eine Fähigkeit“, ohne Rollennamen und mit „wählen“ (zum Beispiel „Person zum Schützen wählen (zeigen)“); Dorfmatratze: „Übernachten“ / „Stay over“; Jäger ohne Aufwachbox und ohne „(zeigen)“, mit Hinweis ob er schießen muss oder darf.
- Spielerauswahl: immer alle Spieler in fester Reihenfolge, Tote grau, rollenbedingt gesperrte gelb gestrichelt, lange Namen zweizeilig; nie bestätigen ohne Auswahl, kein „Niemand“-Eintrag (Werwölfe verzichten mit „Verzichten“); drei gleich große Knöpfe; Zusammenfassung während der Wahl ausgeblendet; Verzichten bei leerer Hexe oder leerem Magier möglich (vorher Sackgasse).
- Morgen: jede gestorbene Person in einer eigenen Box, Kategorien „Gestorben“ und „Letzter Schuss“ (nur der Jäger, mit Rolle), Todesursache erst auf Antippen (geschlossenes und offenes Auge), nach dem Schuss des Jägers keine Ursache; „Zurück“ fragt nie nach.
- Todesreihenfolge (neue Datei deathOrder.ts): verzögerter Tod des Harten Burschen zuerst, dann Werwolfopfer, Gift, Zauber, Hammer; bei Verliebten das Opfer zuerst und die Person aus Liebeskummer direkt danach; das erste Todesurteil zählt. Tests für die Regel und für ganze Nächte.
- Übersicht „Alle Spieler und Rollen“: Tote der Morgen-Ansicht gelten schon in der Ansage als tot, der Jäger mit letztem Schuss (`lastShot`) wird erst nach seiner Entscheidung als tot gezeigt; auch in der Spielerliste für den Schuss.
- Tag: Skript mit der Frage „Jemanden nominieren? (bis zu 3 Personen)“ (die Überschrift „Das Dorf diskutiert“ wurde später wieder entfernt); „Nominierung“ und „Keine Nominierung“ (vorher Abstimmung); der Tag endet nur nach einer gewählten Option; Reset-Knopf; Zusammenfassung nach jeder Entscheidung (Tag, Hexe und Magier nach der ersten Antwort, Werwölfe ohne Angriff, Nominierte); ohne Icon-Plätze am Tag; Stumm-Hinweis mit Zeilenumbruch.
- Abstimmung: der Erzähler trägt die Stimmenzahl je nominierter Person in der oberen Box ein und kann erst bestätigen, wenn alle Stimmen (Bürgermeister doppelt) zusammen eingetragen sind; bei einer nominierten Person Ja/Nein mit Mehrheit aller Stimmen wie in Ultimate Werewolf; neues Ereignis voteCount in der Spiellogik, das alte vote bleibt gültig. Tests voteCount.test.ts, Abdeckungsprüfung angepasst.
- Abstimmung, Aufbau (wie die Spielerauswahl): Die untere Box ist die Eingabe: Frage links oben, Abbrechen rechts oben (die Abstimmung ist jederzeit abbrechbar, „Zurück“ gilt dort nicht als Rollenschritt), Zeilen mit − und + für bis zu drei Nominierte, darunter die zweite Stimme des Bürgermeisters (Chips; bei einer Nominierten Ja/Nein), unten rechts Bestätigen und links daneben eine Box, die live „Person mit Mehrheit“, den Gleichstand oder bei einer Nominierten „scheidet aus / bleibt im Spiel“ zeigt. Die obere Box ist nur Anzeige: Überschrift „Abstimmung“, gelbe Hinweise (Bürgermeister zählt doppelt, Dorftrottel, stumm, verwundet; der Umbruch bei „stumm“ bleibt), unten die blaue Box „Stimmen: x von y“. Jede Zahl steht in einer neutralen Box, die Box der Person mit der zweiten Stimme wird blau und enthält die zweite Stimme. Lange Namen werden mit „…“ gekürzt, der Name des Bürgermeisters ist fett und unterstrichen.
- Abstimmung, Regeln (Spiellogik, Hinweis für Codex steht in GAMEHUB_WERWOLF_CODEX_AUFGABE_NACHT.md): Mit Doppelstimme und mehreren Nominierten lassen sich die Zahlen nur bis „alle Stimmen minus 1“ eintragen, die zweite Stimme muss zugewiesen werden (setVoteBonus), sonst ist Bestätigen gesperrt; jede nominierte Person kann höchstens alle Stimmen minus ihre eigene bekommen (voteMaximum, der nominierte Bürgermeister minus 2); der Bürgermeister kann die zweite Stimme nicht sich selbst geben.
- Nach der Abstimmung: Das Ergebnis wird sofort angesagt (announceExile läuft im Guide mit); der Erzähler kommt zum Tages-Skript zurück, die erste Box ist erledigt, die zweite heißt „Zusammenfassung verkünden und Tag beenden“, unten steht die blaue Box „X scheidet aus“. Der Tag geht nach dem Ausscheiden weiter (Spiellogik: announceExile führt in den Tag; Jäger-Schuss nach dem Ausscheiden gehört zum Tag, Feld inDay).
- Anleitung, Symbole: Neuer Abschnitt „Fähigkeiten“ mit 14 Fähigkeiten im Kreis (wie in der Erzähleransicht) und Erklärung; die alte Gruppe „Eigene Mittel“ und doppelte Einträge entfernt; Einleitung erklärt grün, durchgestrichen, gelb gestrichelt, abgedunkelt, blauer Rahmen, gelbe Kästen und die blaue Zusammenfassung.
- Tag, Knöpfe: Die zweite Skript-Box heißt immer „Zusammenfassung verkünden und Tag beenden“. Der Weiter-Knopf heißt am Tag immer „Tag beenden“ (nie „Abstimmung starten/beenden“) und bleibt gesperrt, solange die Nominierung (Liste offen) oder die Abstimmung läuft. Nach einer Abstimmung (auch ohne Ausscheiden) sind „Nominierung“ und „Keine Nominierung“ gesperrt, der Tag kann beendet werden, und die blaue Box sagt „X scheidet aus“ oder „Niemand scheidet aus“. Neu im Guide: votedToday; die Knopf-Arten startVote und endVote entfallen.
- Abstimmung über eine nominierte Person (Spiellogik, Hinweis für Codex im Codex-Dokument): Es zählen nur die abgegebenen Stimmen (ohne die nominierte Person). Mehr Ja als Nein: die Person scheidet aus; gleich viele (nur bei gerader Zahl): die Abstimmung wird einmal wiederholt, bei erneutem Gleichstand bleibt die Person; sonst bleibt sie. Neu: voteTieAt in der Logik und im Guide; die Box neben dem Haken und die Frage nennen den Gleichstand („Gleichstand: noch einmal abstimmen“). Der Hinweistext nennt „mehr als die Hälfte der abgegebenen Stimmen“.
- Abstimmung, Legende und Wiederholung: Bei einer nominierten Person steht unten in der unteren Box eine Tabelle „Ja-Stimmen | Ergebnis“ (bis x bleibt, bei gerader Zahl y Gleichstand, ab z scheidet aus); die Werte werden aus dem Spielstand berechnet und ändern sich mit der Zahl der abgegebenen Stimmen (bei ungerader Zahl entfällt die Zeile Gleichstand). Die Zusammenfassungsbox oben entfällt bei einer nominierten Person. Bei Gleichstand (erste Runde) zeigt der Bestätigen-Knopf das Wiederholen-Symbol („Neue Abstimmung“), Ja-Stimmen und zweite Stimme beginnen neu; der Gleichstand bleibt als protokolliertes Abstimmungsereignis im Spielverlauf. Neues Symbol „repeat“ in der Icon-Liste.
- Skript, Regeln für alle Rollen (Auftraggeber, 23.11.2026): Das Skript besteht aus Boxen mit zwei Arten. (1) Der Erzähler wartet auf eine Entscheidung einer Rolle: Box mit Zurück-Knopf, der klickbar ist, sobald die Entscheidung bestätigt wurde. (2) Der Erzähler muss etwas tun (vorlesen, zeigen, ansagen): Box mit Haken, der immer ein Haken bleibt und nur klickbar ist, solange diese Box die offene ist. Der Zurück-Knopf führt zu seiner eigenen Box zurück, nicht zum Schritt danach. Die letzte Box („schläft wieder ein“) hat keinen Knopf; erst wenn sie aktiv ist, wird der Weiter-Knopf unten frei. Der Weiter-Knopf wechselt nie zwischen Boxen. Angepasst: „Opfer zeigen“ bei Hexe und Magier und die allgemeinen Aufgaben-Boxen behalten den Haken; bei Seherin und Ermittler steht vor dem Ergebnis eine Box mit der Entscheidung und einem Zurück-Knopf.
- Tag, Skript: drei Boxen — „Jemanden nominieren? (bis zu 3 Personen)“ (Zurück-Knopf), „Zusammenfassung verkünden und Tag beenden“ (Haken) und „Alle Spieler schließen die Augen, das Dorf schläft ein“ (letzte Box); „Tag beenden“ unten ist erst nach dem Haken frei und startet die Nacht. Der Zurück-Knopf der ersten Box setzt auf diese Box zurück und nimmt auch eine Abstimmung zurück (Nominierung, Stimmen, Ausscheiden). Vor der ersten Nacht steht dieselbe Anweisung („Alle Spieler schließen die Augen, das Dorf schläft ein“) in der Ansicht nach „Alle Rollen sind verteilt“.
- Spiellogik/Guide (Hinweis für Codex im Codex-Dokument): neue Guide-Felder sleeping und votedToday; undoSelection nimmt am Tag nach einer Abstimmung mehrere Spiel-Schritte zurück; der Tag endet im Guide erst nach dem Haken (checkScript am Tag). Tests: NarratorDay, NarratorWitch, narratorGuide, voteCount.
- Hinweise am Tag: Bei der Nominierung stehen alle gelben Hinweise („Heute stumm“, „Verwundet“) in der oberen Box (Ausnahme); in den übrigen Ansichten bleiben sie in der unteren Box. Test NarratorDayNotes.test.tsx.
- Tag, obere Box: besteht immer aus Überschrift („Nominierung“ am Tag, „Abstimmung“ bei der Abstimmung), den relevanten Hinweisen (feste Reihenfolge: „Heute stumm“ und „Verwundet“ zuerst, was erst bei der Abstimmung wichtig wird — Bürgermeister, Dorftrottel — wird darunter angehängt) und unten entweder den Knöpfen „Nominierung / Keine Nominierung“ oder der Summenbox der Abstimmung. Gilt nur für die Tagesansicht.
- Tag, Überschrift der oberen Box: wechselt mit dem Schritt („Der Tag beginnt“, bei offener Liste „Nominierung“, nach „Keine Nominierung“ bis zum Schlafengehen „Der Tag endet“, nach einer Abstimmung „Abstimmung beendet“, bei der Abstimmung „Abstimmung“).
- Tag und Abstimmung, feste Position: Überschrift und Hinweisboxen der oberen Box stehen am Tag und bei der Abstimmung an derselben Stelle (gleicher Abstand unter der Überschrift, gleicher Abstand und gleiches Maß der Hinweise, gleicher Zeilenumbruch bei „Heute stumm“); neue Hinweise werden unten angehängt. Hinweis zur Technik: Der Entwicklungsserver lieferte zweimal eine veraltete Fassung einer Datei aus, wenn sie kurz hintereinander zweimal geschrieben wurde; nach größeren Änderungen wird die ausgelieferte Fassung geprüft.
- Werwölfe müssen angreifen (Auftraggeber, 23.11.2026): Ab Nacht 2 (oder in Nacht 1 mit der Einstellung „Angriff in der ersten Nacht“) können die Werwölfe nicht verzichten. Erzähleransicht: kein Knopf „Verzichten“, Bestätigen nur mit gewähltem Opfer. Spiellogik: Ein Angriff „auf niemanden“ wird nie angenommen (das Spiel endet vorher, bevor kein Opfer mehr übrig ist); die erste Nacht ohne Angriff läuft über wolvesReady; eventChoices bietet „niemanden“ nicht mehr an. Rund 20 Tests, die „niemanden angreifen“ als Abkürzung nutzten, greifen jetzt die erste lebende Nicht-Werwolf-Person an (sieben Erwartungen angepasst).
- Verbrauchte Fähigkeiten (alle Rollen, eine gemeinsame Darstellung): grau, ohne Rahmen und mit durchgestrichenem Namen; die Diagonale über dem ganzen Knopf und der blaue Rahmen (nächster Schritt) entfallen. Gesperrte (gelb gestrichelt) und abgedunkelte Fähigkeiten bleiben unverändert. Test in NarratorCard.test.tsx.
- Prüfung: alle 1694 Tests, tsc, ESLint und Prettier grün. Die Oberfläche wurde zuletzt nicht mehr im Browser angesehen (Wunsch des Auftraggebers).
- Notizen: Livetiker und Multiplayer in GAMEHUB_WERWOLF_LIVETICKER_VISION.md festgehalten (noch nicht begonnen); We-01-140 (Anleitung: Skript immer gleich, nur Lebende werden geweckt) geplant.


### We-03-71: Stimmenzahl-Simulation und unbekannte Abstimmende

- We-03-71 abgeschlossen: Forschungssimulation verwendet voteCount statt erzwungener Verurteilung bei einem Nominierten. Stimmengewichte und Ja/Nein-Mehrheit stimmen mit der Erzähleransicht überein; alte benannte Stimmen werden nach einer Stimmenzahl-Abstimmung nicht als aktuelle Abstimmende protokolliert. lastShot für den betrunkenen Jäger abgesichert. 84 gezielte Tests und 24 kurze Modellpartien bestanden; keine langen Balance-Läufe.
- 84 gezielte Tests in sechs Dateien bestanden; zwei gezielte Modell-Kurzprüfungen mit 24 vollständigen Partien bestanden. Keine langen Simulationsläufe. simulationVoting.ts: 100 % Zeilen / 96,55 % Zweige. Typprüfung, ESLint, Format und Schichtprüfung erfolgreich. Geprüft: Einzelkandidaten-Zustimmung/Ablehnung, gewichtete Stimmen, stummer oder nominierter Bürgermeister, unbekannte Abstimmende nach früherem benanntem Voting und lastShot beim betrunkenen Jäger.


### We-03-70: Rollenpflicht und aktuelle Abstimmungsmodelle

- We-03-70 abgeschlossen: Alte Vettel muss bei vorhandenem Ziel stummschalten; null nur noch als Notausgang ohne gültiges Ziel. Forschungsmodell auf 1–3 Nominierte, einzelne gewichtete Stimmzettel und Stichwahlen angepasst; Heilungsmodelle verwenden wolfTarget. 104 gezielte Tests und 24 kurze Modellpartien erfolgreich. Keine langen Balance-Läufe, keine UI- oder Kalibrierungsänderungen.
- 104 gezielte Tests und zwei gezielte Simulations-Kurzprüfungen mit zusammen 24 vollständigen Modellpartien bestanden. Kein Kombinations- oder Balance-Gesamtlauf. Neues Abstimmungsmodell: 100 % Zeilen, Zweige, Funktionen und Anweisungen abgedeckt. Typprüfung, ESLint, Format- und Schichtprüfung erfolgreich. Bestehende Magierführung, Tagesabstimmung und Todesreihenfolge erhalten und mitgeprüft. Keine neue Kalibrierung oder Änderung von Rollenpunkten/Wolfsgrenzen.

## 2026-11-22

### We-01-139: Erwachen als erste Skriptbox

- Tests zur Todesreihenfolge im Spielablauf (Magier mit Verliebten, Hexe mit Verliebten, Harter Bursche in der Folgenacht).
- Todesreihenfolge verfeinert: der verzögerte Tod des Harten Burschen steht ganz vorn, bei Verliebten das Opfer zuerst und direkt danach die Person aus Liebeskummer; das erste Todesurteil zählt (ein späterer Angriff auf den Partner ändert die Todeszeit nicht). Neue Datei deathOrder.ts mit Tests.
- Morgen: jede gestorbene Person in einer eigenen Box, der Jäger mit Rolle gekennzeichnet; die Toten stehen in der Reihenfolge ihres Todes (Werwolfopfer, Gift der Hexe, Zauber des Magiers, Hammer, verzögerter Tod des Harten Burschen; ein Liebespartner direkt nach der geliebten Person), auch im Ereignisprotokoll.
- Amulett-Träger: Skript „Amulett weitergeben (zeigen)?“ mit Fragezeichen.
- Skripte ohne Rollennamen („Person stummschalten (zeigen)“ usw.); Entscheidungsboxen mit Rückgängig-Knopf von Anfang an, Aufgaben mit Haken.
- Skripte kurz: Hexe und Magier gekürzt, „(zeigen)“ am Ende aller Skripte mit Personenwahl, Symbole des Magiers untereinander.
- Magier/Hexe: „Opfer zeigen“ mit Angriffssymbol, erste Magier-Frage mit beiden Fähigkeitssymbolen und Daumen-Symbol, zweite Frage gekürzt.
- Notiert (We-01-140, geplant): Anleitung soll erklären, dass das Erzählerskript immer gleich ist und nur lebende Personen geweckt werden.
- Magier: Fragenskript wie die Hexe (Opfer zeigen, erste Frage Heilen/Töten, zweite Frage Töten, Einschlafen).
- Hexe: Skript in drei Boxen (Opfer zeigen mit Haken, Frage Retten, Frage Vergiften), Name unterstrichen, „kein Opfer“ rot; Knöpfe oben erst nach dem Zeigen des Opfers bedienbar und bis dahin dunkel.
- Ergebnisse (Seherin, Seher-Lehrling, Ermittler, Betrunkener) stehen in der Zusammenfassung statt im Skript; Daumen und Farbe; Amulett-Status als Hinweis.
- Skripttexte enden einheitlich ohne Punkt.
- Werwölfe (Nacht 1 ohne Angriff): Skript „Die Werwölfe schauen sich an.“, „… erst ab Nacht 2“ als gelber Hinweis.
- Personenauswahl: immer alle Spieler in fester Reihenfolge; Tote grau, gesperrte gelb gestrichelt, lange Namen zweizeilig.
- Symbole: Fähigkeiten stehen im Kreis, Rollen frei (Eigenschaft ring, Legende, Test).
- „Tippe auf eine Fähigkeit“ entfernt: rollenspezifische Anweisungen im Skript (Leibwächter: „… wählt eine Person aus, die er schützen will.“).
- Verliebte: kurzer Text „Die Verliebten schauen sich an.“, keine Namen; Hinweis „Drücke Weiter“ bei allen Rollen entfernt.
- Amor: Entscheidung wird mit dem Haken der ersten Skriptbox bestätigt, dann erscheint die blaue Zusammenfassung; Einschlafen und Berühren sind eigene Schritte danach.
- Nachtrag: Aufwach-Box bleibt stehen (gedimmt), jede Skriptbox beginnt mit dem Symbol der Fähigkeit.
- Die Ansicht zum Antippen entfällt; „… wacht auf“ ist die erste Skriptbox mit Haken (zeigt die Rolle). Haken wie Rückgängig-Knopf mit blauem Rahmen, Namen unterstrichen. Tests, tsc, eslint grün (1635); nicht im Browser angesehen.

### We-01-138: Einheitliches Skript (Amor zuerst)

- Skript jeder Rolle als Boxen mit Einschlafbox von Anfang an; Knopf (Rückgängig oder Haken) rechts neben jeder Box außer der letzten; Reset/X neben dem Skript und der Knopf „Erledigt“ unten entfernt; Amor mit drei Boxen (zeigen, einschlafen, Schulter berühren mit Namen). Tests, tsc, eslint grün (1635). Nicht im Browser angesehen.

### We-03-69: Gezielte Amulett-Nachtstartprüfung

- Nachtrag für Claude: Acht erfolgreiche gezielte Tests klar vom abgebrochenen Gesamtlauf getrennt; Heilungserwartung victim/wolfTarget und noch unveränderte Forschungsmodelle dokumentiert. Keine neuen Balance-Schlüsse.

- We-03-69 abgeschlossen: Wegfall von amuletIntro gezielt geprüft, 8 Tests bestanden. Nach der Rollenverteilung beginnt unmittelbar der normale erste Nachtschritt; Besitz und Weitergabe des Amuletts bleiben unverändert. Keine Produktionslogik geändert. Die breite Simulation wurde auf Wunsch des Auftraggebers gestoppt; keine neue Balanceberechnung.
- Gezielte Abnahme nach Einschränkung durch den Auftraggeber: 8 Tests bestanden (sechs direkte Nachtstart-Varianten mit Amulett, bestehende Startvergabe und Weitergabe am Nachtende). Typprüfung, ESLint und Formatprüfung erfolgreich. Keine Produktionslogik geändert. Breiter Lauf auf Wunsch des Auftraggebers abgebrochen, Änderungen an balance.test.ts und simulation.test.ts zurückgenommen; keine vollständige Balance-/Simulationsabnahme behauptet.

## 2026-11-21

### We-01-137: Skript für Amor und die Verliebten

- Amor und die Verliebten haben ihr Skript als Liste in der Skriptbox; weitere Rollen folgen einzeln.

### We-01-135: Hexe mit zwei festen Fragen

- Der Rückgängig-Knopf steht einheitlich rechts neben dem passenden Skript, so hoch wie die Skriptbox; die blaue Zusammenfassung fasst nur zusammen. Bei der Hexe geht es eine Frage pro Tipp zurück.
- Oben bleiben alle Optionen sichtbar, die der offenen Frage sind blau gerahmt; unten stehen die zwei Fragen als Boxen von oben nach unten, Hinweise mit gelbem Rand darunter.

### We-01-134: Magier beide Zauber in einer Nacht

- Haken schließt nur die Auswahl, „Erledigt“ bestätigt; beide Zauber in einer Nacht; die 2 verschwindet erst nach der Bestätigung der Auswahl; derselbe Zauber kann zweimal gewirkt werden.

### We-01-133: Entschiedene Fähigkeiten sehen verbraucht aus

- Nach der Entscheidung sind alle Fähigkeiten neutral grau; Rückgängig macht sie wieder grün mit blauem Rahmen. Beim Magier steht eine 2 auf beiden Zaubern, solange beide da sind; mit einem übrigen Zauber verschwindet sie bei beiden.

### We-01-132: Fragezeichen beim Trunkenbold

- Die Karte des Trunkenbolds zeigt bei den Fähigkeiten ein Fragezeichen („Unbekannt“).

### We-01-131: Angriff statt Opfer

- Fähigkeit der Werwölfe heißt „Angriff“, die Zusammenfassung „Angegriffen“.

### We-01-130: Variabler Modus geprüft

- Zufällige Entwürfe werden gezogen und gespielt; das Spiel folgt dem Entwurf, die Erzähleransicht kommt ans Ende. Keine Abweichung.

### We-01-129: Abdeckungsprüfung Logik gegen Oberfläche

- Vier neue Prüfungen zeigen: Jedes erlaubte Ereignis ist über die Oberfläche erreichbar, Fähigkeiten stimmen mit der Logik überein, Spiele lassen sich nur mit der Oberfläche beenden. Keine Abweichung gefunden.

### We-01-128: Neue Tagesabstimmung

- Bis zu drei Nominierte, ein Stimmzettel je Spieler, Bürgermeister doppelt mit Angabe, Dorftrottel vom Erzähler gesetzt, Gleichstand einmal neu; Logik und Oberfläche, für Codex notiert.

### We-01-127: Bestätigen bei der Tageswahl

- Haken zum Bestätigen bei Nominierung und Abstimmung; Hinweise erscheinen nicht während der Wahl.

### We-01-126: Keine Abstimmung

- Am Tag neben „Abstimmung“ der Knopf „Keine Abstimmung“ in der oberen Box.

### We-01-125: Tag ohne Rollenkopf

- Am Tag keine Rollenkarte mehr; bei der Abstimmung nur die nominierte Person.

### We-01-124: Tag und Nacht als Box

- Der Hintergrund bleibt am Tag dunkel; Sonne oder Mond mit Text stehen in einer Box, die am Tag hell ist.

### We-01-123: Magier nach geheilter Hexe festgehalten

- Der Magier kann auch nach einer Heilung durch die Hexe heilen; Regeltext und Notiz für Codex angepasst.

### We-01-122: Fragen ohne „oder verzichtet“

- Ermittler und Bürgermeister: nur noch der Knopf verzichtet.

### We-01-121: Regelprüfung der Erzähleransicht

- Liste je Rolle in docs/GAMEHUB_WERWOLF_REGELPRUEFUNG.md; fünf offene Punkte.

### We-01-120: Umbau Schritt 5, Tag, Abstimmung, Bestätigungen

- Das Ereignis jedes Schritts kommt aus roleStep.

### We-01-119: Umbau Schritt 4, Hexe, Magier, Amor

- Wahl in mehreren Teilen und die Zahl der Personen je Fähigkeit kommen aus roleStep.

### We-01-118: Umbau Schritt 3, Ergebnis aus der Beschreibung

- Das Ergebnis von Seherin und Ermittler kommt aus roleStep.

### We-01-117: Umbau Schritt 2, Beschriftungen aus der Beschreibung

- Verzichten/Behalten, Zusammenfassung und die Aussage der Wölfe kommen aus roleStep.

### We-01-116: Umbau Schritt 1, Zielpersonen aus der Beschreibung

- Ereignis, „Niemand“, Verzichten/Behalten und Ausnahmen der Liste kommen für alle Rollen mit einer Zielperson aus roleStep.

### We-01-115: Amulettträger mit eigener Rolle

- Die Karte zeigt die Rolle des Trägers statt „Amulettträger“; Hinweis, ob er abgeben muss (Angriff) oder darf.

### We-01-114: Zurück zwischen Rollen, Rücknahme in der Zusammenfassung

- Zurück geht von Rolle zu Rolle; Entscheidungen nimmt ein kleiner neutraler Reset-Knopf in der Zusammenfassung zurück.

### We-01-113: Alte Vettel Pflicht

- Stummschalten ist Pflicht; Verzichten nur, wenn niemand wählbar ist.

### We-01-112: Zurück öffnet die Entscheidung

- Zurück aus dem nächsten Schritt führt direkt in die offene Entscheidung der Rolle.

### We-01-111: Nach der Entscheidung gesperrt

- Nach einer Entscheidung (Fähigkeit oder Verzichten) sind alle Fähigkeiten gesperrt; „Zurück“ macht sie wieder frei.

### We-01-110: Verzichten deaktivieren statt ausblenden

- Der Knopf bleibt stehen und wird nur grau, damit die Oberfläche stabil bleibt.

### We-01-109: Hexe, drei Zustände

- Nur ein Weg zu verzichten; Fähigkeiten grün, neutral (benutzt) oder gestrichelt gelb (nicht möglich).

### We-01-108: Verzichten in der oberen Box

- „Verzichten“ neben den Fähigkeiten in der Rollenkarte; Fähigkeitsknöpfe kleiner.

### We-01-107: GuideBox als gemeinsamer Baustein

- Rollentexte und Zusatzzeilen in eigenen Dateien, gewählt über die Beschreibung des Schritts; GuideBox hat nur noch den gemeinsamen Aufbau.

### We-01-106: Jäger mit zwei Ansichten

- Schuss freiwillig oder Pflicht als eigene Ansichten; die Regel „Niemand“ kommt aus der Rollenbeschreibung. Texte und Zusatzzeilen folgen (We-01-107).

### We-01-105: Rollenbeschreibung je Ansicht

- Neue Beschreibung roleStep: eine Ansicht je Rolle und Fall (zum Beispiel zwei für die Werwölfe); Logik und Oberfläche lesen sie. Stufe 2 (Texte, Zusatzzeilen, Auswahlregeln) ist geplant (We-01-106).

### We-01-104: Verzichten bei freiwilligen Rollen

- Rollen, die nichts tun dürfen: Fähigkeit und der Knopf „Verzichten“ unten haben beide den blauen Rahmen.

### We-01-103: Zusammenfassung nach dem Ergebnis

- Seherin und Ermittler: unten steht die Wahl (Geschaut/Geprüft: Name) statt „Nichts gewählt“.

### We-01-102: Gemeinsame Effekte bei mehreren Wachen

- Bei mehreren wachen Personen zeigt die Karte nur Effekte, die alle betreffen (zum Beispiel nicht das Amulett eines der Verliebten).

### We-01-101: Doppelter Name und freie Rollenverteilung

- Doppelter Spielername: Meldung statt stillem Ignorieren. Rollenverteilung: beliebig oft vor und zurück bis zum Beginn.

### We-01-100: Seherin schaut erneut

- Nach dem Ergebnis kann die Seherin erneut „Schauen“ antippen und eine andere Person wählen.

### We-01-99: Ergebnis der Seherin deutlicher

- Großes Zeichen für das Ergebnis: Daumen hoch in Grün (Werwolf gefunden), Daumen runter in Rot (keiner), vor dem Satz; ebenso beim Paranormalen Ermittler.

### We-01-98: Werwolf-Hinweis Nacht 1

- Im Schritt der Werwölfe steht in der ersten Nacht, dass sie erst ab Nacht 2 angreifen, wenn das so eingestellt ist.

### We-01-97: Symbol auf Textebene

- Das Rollensymbol vor „… schläft wieder ein“ / „… erwacht“ ist mittig zur Zeile ausgerichtet.

### We-01-96: Fähigkeit erneut antippen

- Nach dem Bestätigen kann die Fähigkeit erneut angetippt werden, um die Auswahl zu ändern, ohne zurückzugehen.

### We-01-95: Zurück nur eine Rolle weit

- Zurück führt höchstens in die vorherige Rolle; weiter zurück geht erst, wenn das Spiel wieder vorangekommen ist.

### We-01-94: Zwischenspeicher des Erzählers

- Der Verlauf mit allen Auswahlen wird mit dem Spiel gespeichert und nach einem Neuladen wiederhergestellt; beim Zurückgehen sind frühere Entscheidungen sichtbar und überschreibbar.

### We-01-93: Zusammenfassung mit Ergebnisform

- „Gewählt: Geschützt: Louis“ statt „Schützen: Louis“; für alle Fähigkeiten eine passende Form, deutsch und englisch.

### We-01-92: Amor verliebt

- Statt „Verbinden“ heißt die Fähigkeit von Amor „Verlieben“ (Knopf, Frage, Symbolbedeutung; englisch „Make lovers“).

### We-01-91: Weiter nur für den Rollenwechsel

- „Weiter“ wechselt nur von Rolle zu Rolle und ist innerhalb eines Rollenschritts gesperrt; Haken nur in der Spielerauswahl, sonst die Zeile „Erledigt“; obere Box 40 %, untere 60 %.

### We-01-90: Bedienung durch blaue Rahmen

- Ein blauer Rahmen führt den Erzähler: erst die Box zum Antippen, dann die Fähigkeit, nach der Auswahl der grüne Haken unten rechts zum Bestätigen. In der Auswahl gibt es oben rechts immer Zurücksetzen und X. Die doppelte Zeile in der Box zum Antippen entfällt.

### We-01-89: Rollensymbol vor der Ansage

- Vor der Ansage jeder erwachenden Rolle steht ihr Symbol.

### We-01-88: Ankündigung harmonischer

- Beide Boxen haben denselben Rahmen und dieselbe Fläche; die verdeckte Karte zeigt ein gedämpftes geschlossenes Auge; Überschrift kleiner mit Unterzeile; unten eine Zeile mit Pfeil als Hinweis zum Tippen.

### We-01-87: Alter Spielstand im Amulett-Schritt

- Ein Spielstand, der im entfernten Amulett-Schritt gespeichert war, ging nach „Beginnen“ in eine leere Seite. Er geht jetzt beim Laden mit der ersten Nacht weiter.

### We-01-86: Kein Amulett-Schritt vor der ersten Nacht

- Der Amulettträger wird nicht mehr vor der ersten Nacht geweckt; er erfährt es auf seiner Rollenkarte. Zustand `amuletIntro` und Ereignis `amuletReady` entfallen. Der Schritt am Nachtende bleibt.

### We-01-85: Wartebild mit Symbol, ohne Effekte

- Das Wartebild zeigt das Kartensymbol in einer flachen Fläche (wie das Symbol der Rollenkarte), die Überschrift und unten den Hinweis mit Handsymbol. Schein und Verlauf entfallen, damit es zur übrigen Oberfläche passt.

### We-01-84: Wartebild vor dem Spielbeginn

- Nach der Rollenverteilung kommt ein Wartebild ohne Spielinformationen: „Alle Rollen sind verteilt – Gib das Gerät jetzt an den Erzähler zurück.“ Der untere Knopf heißt dort „Beginnen“ und startet das Spiel, danach wieder „Weiter“. Vorher sah der letzte Spieler schon die Ansage für den Amulett-Träger.

### We-01-83: Info des Harten Burschen

- Der Text erklärt jetzt die Wunde, dass nur in der Angriffsnacht ein Wolfsangriff geheilt werden kann (sonst stirbt er in der nächsten Nacht), was ihn sofort tötet (Hammer, Abstimmung, Tod des Liebespartners) und was die Option jeweils bedeutet.

### We-01-82: Info des Bürgermeisters

- Die Info des Bürgermeisters erklärt jetzt den Hammer (oder die doppelte Stimme); vorher stand dort nur „Verrate deine Rolle nicht“.

### We-01-81: Leiste in der Rollenverteilung

- In der Rollenverteilung zeigt die Leiste „Rollenverteilung“ statt Mond und „Nacht 1“. Die Trennlinie der Rollenkarte ist auf jeder Karte gleich lang.

### We-01-80: Kurze Rollentexte im Spiel

- Der Info-Knopf der Rollenkarte zeigt jetzt kurze Sätze nur für die Spielerin oder den Spieler (Aufgabe, Besonderheiten, Option der Rolle, Amulett), ohne die Hinweise zur Konfiguration. Die ausführlichen Texte bleiben in der Konfiguration und der Anleitung.

### We-01-79: Spielweise der Rolle auf der Karte

- Die Rollenkarte nennt die Option der Rolle, zum Beispiel „Schusspflicht“ oder „Keine Schusspflicht“ beim Jäger (auch Harter Bursche, Gerber, Alte Vettel).

### We-01-78: Spielernummer auf der verdeckten Karte

- Die verdeckte Rollenkarte zeigt oben links „Spieler: 3/20“.

### We-01-77: Rollenverteilung geschützt

- Während die Spieler ihre Rolle ansehen, sind die Übersicht aller Spieler und Rollen und der Spielregeln-Knopf nicht sichtbar; sie erscheinen erst, wenn das eigentliche Spiel beginnt.

### We-01-76: Schließen mit Bestätigung im Knopf

- Der X-Knopf der Leiste bestätigt wie in den anderen Spielen im Knopf selbst (rot, „Beenden?“, zweiter Tipp beendet); die Rückfrage-Box entfällt. Rollenkarte: Trennlinie, Fähigkeiten mittig, größerer Info-Knopf.

### We-01-75: Übersicht aller Spieler auf einer Seite

- „Alle Spieler und Rollen“ ist alphabetisch sortiert und zeigt alle Spieler kompakt in zwei Spalten auf einer Seite. Hintergrund- und Randfarben folgen später mit dem Liveticker.

### We-01-74: Gleich große Boxen, Leitfaden oben, Personenliste alphabetisch

- Obere und untere Box sind immer gleich groß. In der unteren Box steht der Leitfaden oben und die Zusatzinformation unten. Personenknöpfe sind alphabetisch sortiert und gleich groß (vier je Zeile); oben rechts schließt ein X die Auswahl, daneben steht Rückgängig als Symbol.

### We-01-73: Heller Tageshintergrund, Texte unten in den Boxen

- Am Tag ist nur der Hintergrund hell; Boxen und Knöpfe bleiben dunkel. Texte in den Boxen (Ankündigung, Anleitung, Morgen, Ausschluss) stehen unten statt in der Mitte.

### We-01-72: Weitere Partien und Verständlichkeit der Erzählersicht

- Gewählte Fähigkeiten sind erkennbar (Haken, Rahmen, Zusammenfassung beim Einschlafen). Der Erzähler sieht die Gründe jedes Todes (nicht vorlesen), am Tag die Stummen und Verwundeten, bei der Abstimmung ×2 und „muss Ja“, Hinweise zu nicht wählbaren Personen und zum Verzicht. Am Spielende führt „Weiter“ zur Aufstellung. Die Zurück-Taste des Systems fragt vor dem Verlassen.

### We-01-71: Symbole in der Aufwachreihenfolge

- Jeder Schritt der Aufwachreihenfolge zeigt das Symbol seiner Rolle vor dem Namen.

### We-01-70: Symbole neben den Zahlen der Kopfkarten

- Werwölfe, Dorfbewohner und Seherin zeigen ihr Symbol direkt links neben der Zahl, die Werwölfe neben jeder Auswahlzahl.

### We-01-69: Erzählersicht ohne leere Flächen

- Die Boxen teilen sich die ganze Fläche: in der Ankündigung zwei gleich große Boxen (verdeckte Karte mit Fragezeichen), beim Handeln die Rollenkarte mit großen Fähigkeitsknöpfen über der Anleitungsbox, am Tag, am Morgen und beim Ausschluss füllt die Box die Fläche. Personenknöpfe füllen ihre Zeilen, die Gewinnergruppen verteilen sich über die Fläche.

### We-01-30: Gewinneransicht am Spielende

- Nur noch eine Gewinneransicht, ganz am Ende: alle Gewinnergruppen untereinander mit den Namen der Spieler (Werwölfe oder Dorf, die Verliebten, der Gerber). Während der Partie wird der Gerber nicht angesagt.

### We-01-68: Durchspielen mit allen Rollen im Browser

- Zwei vollständige Partien mit 20 Spielern und allen Rollen durchgespielt. Behoben: Ansage derer, die durch den Jägerschuss oder beim Ausschluss mitausscheiden; Wirkungen der Nacht nicht mehr am Tag; Hexe und Magier sehen das Wolfsopfer; Spielende nennt Partei und Gerber; eigener Text für den Seher-Lehrling; Übersicht kennt Verwundet und Stumm; die Rückfrage verschwindet bei Weiter.

### We-01-49: Seher-Lehrling öffentlich aufrufen; Aufgabenstände nachgezogen

- Nach dem Tod der Seherin wird der Seher-Lehrling öffentlich als Seher-Lehrling aufgerufen (Karte mit Augensymbol, Texte Deutsch und Englisch). Amulett-Ansage und Weitergabe sind in der Erzählersicht abgedeckt. Die Aufgaben We-01-04, 10, 27, 28, 29, 49 und 52 sind mit ihrem tatsächlichen Prüfstand auf erledigt gesetzt.

### We-01-67: Rollenenthüllung auf der ganzen Fläche

- Die Karte der Rollenverteilung füllt die ganze Fläche zwischen der oberen Leiste und den Knöpfen unten; Rollensymbol, Fähigkeitssymbole und Texte sind größer.

### We-01-66: Erzählersicht ohne App-Kopfleiste

- Die Kopfleiste der App („Werwolf“, Spielregeln, Einstellungen, Startseite) entfällt in der Erzählersicht. Die Tag-/Nachtleiste ersetzt sie und hat die Spielregeln als Buchsymbol, daneben Übersicht und Schließen; weitere Knöpfe können dort später folgen.

### We-01-65: Erzählersicht, der Tag

- Tageskarte: Knopf „Abstimmung“, Nominierung in drei Wahlen (Person, Nominierende, Unterstützende) nur aus den gültigen Zielen der Logik, Abstimmung mit benannten Ja-Stimmen (Dorftrottel vorgewählt). „Weiter“ heißt Tag beenden, Abstimmung starten oder Abstimmung beenden. Ausschluss und Spielende werden angesagt. Neue Symbole „Tag“ und „Abstimmung“ in der Legende.

### We-01-64: Erzählersicht, obere Leiste und heller Tag

- Obere Leiste: Sonne oder Mond mit „Nacht 1“ oder „Tag 1“, Knopf mit allen Spielern und Rollen (nur für den Erzähler), Schließen mit Rückfrage. Der Tag ist hell, die Nacht dunkel, nur in der Spielansicht. Das alte Textknopf „Spiel beenden“ entfällt.

### We-01-63: Rollenverteilung als Karte, Symbole bei den Rollen

- Rollenverteilung neu: eine Karte je Person. Erste Ansicht: Name und Hinweis, Tippen zeigt die Rolle (Symbol, Name, Fähigkeitssymbole, Info-Knopf, deutlicher Hinweis auf das Schutzamulett), erneutes Tippen verdeckt sie; der Trunkenbold sieht den Trunkenbold. Zurück und Weiter bleiben unten. Symbole stehen jetzt auch vor den festen Rollen, im Titel der Info-Fenster und in der Anleitung.

### We-01-62: Erzählersicht, Schritte 3 und 4 (untere Box, Zurück/Weiter)

- „Spiel starten“ verteilt die Rollen und öffnet die Erzählersicht. Obere Box (Rollenkarte, am Anfang verdeckt) und untere Box (Ansage, Tippen, Spielerauswahl, Rückgängig). Unten nur „Zurück“ und „Weiter“: Zurück geht genau einen Schritt, Weiter nur bei vollständigem Schritt. Auswahl bleibt lokal, das Spiel bewegt sich erst mit Weiter. Tarnaufrufe zeigen je Fähigkeit „fragen, dann nicht möglich zeigen“. Spiel beenden mit Rückfrage; Spielstand bleibt nach Neuladen erhalten. Tag und Abstimmung folgen. 1529 Tests, tsc -b, eslint, Schichtprüfung sauber.

### We-01-61: Erzählersicht, Schritt 2 (obere Box)

- Rollenkarte der Erzählersicht: Rollensymbol und Name der Wachen, drei Plätze für Wirkungen von außen, große Fähigkeitsknöpfe (grün = nutzbar, rot = verbraucht oder nicht möglich), Magier mit Zähler an beiden Zaubern, Tarnaufruf ohne Namen und mit roten Knöpfen. Modell `describeNarratorCard` in der Logik, Komponente `NarratorCard`. Noch nicht im Spiel eingebunden. 1516 Tests, tsc -b, eslint, Schichtprüfung sauber.

### We-01-60: Erzählersicht, Schritt 1 (Spielstart und Spielstand)

- Spielstart aus Aufstellung und Konfiguration (fest oder variabel), Rollen werden einmalig verteilt. Der Spielstand wird nach jedem Schritt mit Versionsnummer lokal gespeichert; ein Stand anderer Version wird verworfen. Hook `useWerewolfSession` (Start, Ereignis, Rückgängig, Beenden). 1504 Tests, tsc -b, eslint sauber. Noch keine sichtbare Oberfläche.

### We-03-68: Nachtaufrufe und variable Gewichtung

- We-03-68: Nachtlogik umgesetzt und gezielt in den Werwolf-UI-Arbeitsstand übernommen. Nicht gezogene Rollen, Lehrling und Trunkenbold werden übersprungen; vorhandene verdeckte Rollen behalten ihre Tarnaufrufe. Überflüssige Pool-Felder entfernt. Variable API beschreibt Claudes gewichtete Rollengruppen samt Beispielen und Heilergrenzen. Keine Produkt-UI oder Übersetzungen geändert.
- 431 Werwolf-Tests inklusive 100 kompletter Partien und Ziehungsprüfungen bestanden. Nachtmodul 100 % Zeilen/Zweige; geprüfte kritische Logik insgesamt 99,73 % Zeilen / 98,15 % Zweige. Typprüfung im Logik-Arbeitsordner, ESLint, Format und Schichtprüfung erfolgreich. Breiter Testlauf dort: 1.091 Tests; aktueller UI-Arbeitsstand: 1.472 Tests erfolgreich. Lange Forschungs-/Balance-Simulationen ausgenommen. Gesamt-Typprüfung im UI-Arbeitsstand meldet fünf nachweislich vorbestehende UI-Fehler (auch mit ursprünglichen Logikdateien reproduziert); Übergabe enthält Fundstellen. Keine UI-Fehler in dieser Aufgabe verändert.

Alle wichtigen Projektänderungen werden in dieser Datei dokumentiert.


### Werwolf Schritt 2: feste Konfiguration (19.11.2026)

- Neue Konfigurationsansicht (Knopf mit Reglersymbol neben "Spiel starten"): oben Werwölfe (Zahlenknöpfe aus den erlaubten Werten, bei nur einem Wert fest angezeigt; Empfehlung nur bei echter Wahl mit Rand und dem Wort "empfohlen"), Seherin (immer 1) und die automatisch berechneten Dorfbewohner; darunter die Rollen als Raster in Zeilen nach Freigabe-Spielerzahl (verfügbare zuerst, gesperrte unten mit Grund), Zusätze (Trunkenbold, Schutzamulett) und Spielregeln (Wolfsangriff ab Nacht 1/2, Rollen aufdecken/geheim). Jäger, Gerber, Bürgermeister und Alte Vettel werden über ihre Varianten gewählt (zweiter Tipp auf dieselbe Variante lässt die Rolle weg), Leibwächter/Dorfmatratze als Alternative. Jede Rolle und jeder Zusatz hat einen i-Knopf mit Erklärung (auch bei gesperrten, mit dem Sperrgrund); Texte auf Deutsch und Englisch.
- Nachbesserung nach Abgleich mit der UI-Spezifikation: Umschalter Feste/Variable Rollen oben (variabel zeigt nur den Hinweis "folgt später"); Zusätze oben direkt unter den Pflichtrollen; einheitliches Raster mit gleich großen Kacheln (auch die Rollen mit Varianten sind eine Zelle); Reihenfolge und Beschriftung der Varianten wie in der Spezifikation (Jäger: Schusspflicht / Keine Schusspflicht; Gerber: Sieg bei jedem Ausscheiden / nur bei Abstimmung; Bürgermeister: Doppelte Stimme / Hammer; Alte Vettel: Selbstwahl erlaubt / verboten).
- Kompakter: Die Konfiguration ist eine Seite mit scrollendem Inhalt und festem Knopf unten; Werwolfzahl-Knöpfe stehen in der Zeile der Werwölfe, Seherin und Dorfbewohner nebeneinander, die Rollenkacheln sind einzeilig und zu zweit nebeneinander (Rollen mit Varianten danach, je eine Zeile mit den zwei Varianten nebeneinander); lange Hinweistexte entfallen (die i-Knöpfe sagen dasselbe).
- Überarbeitung nach Rückmeldung: Die Konfiguration hat die Reiter "Rollen" und "Spielregeln" (schmale Bildlaufleiste wie überall); die festen Rollen stehen in einer Box (Werwölfe mit Überschrift und Auswahl, Seherin als immer gewählte Kachel, Dorfbewohner mit Überschrift und großer Zahl); die Empfehlung hat einen hellen statt blauen Rand; Rollen mit mehreren Optionen sind je ein optionaler Auswahlbutton mit zusammenhängender Optionsleiste (keine Option gewählt = Rolle nicht im Spiel); verfügbare und nicht verfügbare Rollen stehen je in einer Box mit Trennlinien nach Freigabe-Spielerzahl, bei den nicht verfügbaren mit der Angabe "Ab N Spielern".
- Die Konfiguration bleibt immer spielbar: Sind alle Plätze belegt, sind die übrigen Rollen gesperrt ("kein Platz frei") und wieder wählbar, sobald eine Rolle abgewählt wird; eine Rolle, die mit den gewählten Rollen und der gewählten Wolfszahl nicht zusammenspielt, ist gesperrt ("nicht zusammen"); eine Wolfszahl, die für die gewählten Rollen keinen Platz ließe, ist nicht wählbar. Solche Rollen bleiben im oberen Kasten (abgeblendet, mit Grund); nur Rollen, die mehr Spieler brauchen, stehen im unteren. Der Satz "Die Aufstellung ist spielbar." entfällt; das Kästchen "Zu korrigieren" erscheint nur, wenn sich eine frühere Wahl durch geänderte Spieler als unpassend erweist.
- Drei Boxen mit je einer Hauptüberschrift: "Grundrollen und Zusätze" (Werwölfe, Seherin und Dorfbewohner in einer Reihe, darunter in der zweiten Reihe die Zusätze), "Verfügbare Rollen" und "Noch nicht verfügbar". Die empfohlene Wolfszahl hat einen gelben Rahmen, solange sie nicht gewählt ist; gewählt genügt das Wort "empfohlen". Das Info-Fenster einer noch nicht verfügbaren Rolle oder eines Zusatzes nennt zuerst, ab wie vielen Spielern sie aktivierbar ist.
- Die Dorfbewohner stehen in einer kleinen Box in Höhe der Knöpfe daneben, mit der Zahl und der Spielerzahl ("8 von 12"); die Zeile "Spieler neben dem Erzähler" entfällt dadurch.
- Die Konfiguration korrigiert sich selbst, wenn sich die Spielerzahl ändert (`normalizeFixedDraft`): Beim Hinzufügen bleibt alles, die Dorfbewohner füllen auf; beim Entfernen werden von unten nach oben die Rollen und Zusätze zurückgenommen, die mehr Spieler brauchen (zum Beispiel alles ab 8 Spielern bei 7), der Hammer des Bürgermeisters unter 10 Spielern wird zur doppelten Stimme, eine nicht mehr erlaubte Wolfszahl wird zurückgesetzt, und passen die Rollen nicht mehr auf die Plätze, gehen die zuletzt freigeschalteten zuerst. Dadurch erscheint nach dem Entfernen von Spielern kein Fehlertext mehr. Die Dorfbewohner-Box zeigt nur noch die Anzahl (bei keinen "0").
- Die Rollen in "Verfügbare Rollen" und "Noch nicht verfügbar" sind eine Liste: jede Rolle nimmt genau eine Zeile ein, der Knopf über die Breite und rechts außerhalb des Knopfes ein einziger i-Knopf. Eine Rolle mit Optionen (Jäger, Gerber, Bürgermeister, Alte Vettel, Leibwächter/Dorfmatratze) ist ein zusammenhängender, optionaler Auswahlknopf mit einer Hälfte je Option (Rollenname oben, Option darunter); das Info-Fenster erklärt jede Option einzeln. Ein Tipp wählt die Hälfte und nimmt die Rolle ins Spiel, ein Tipp auf die gewählte Hälfte lässt die Rolle weg. Die Karte "Spieler" bei den Grundrollen entfällt. Der untere Kasten heißt "Nicht verfügbar (mehr Spieler benötigt)"; die Knöpfe nennen nicht mehr, ab wie vielen Spielern eine Rolle da ist, sondern das Info-Fenster zeigt neben dem Rollennamen eine Box "Ab N Spielern" (roter Rahmen, solange die Rolle nicht verfügbar ist, grüner, wenn sie es ist). Nur Gründe, die von den gewählten Rollen abhängen ("kein Platz frei", "nicht zusammen"), stehen weiter in Klammern am Rollennamen; die zweite Zeile bleibt für den rollenspezifischen Text (die Option). Auch die Zusätze (Trunkenbold, Schutzamulett) stehen im Stil der Rollen: eine Zeile je Zusatz, Knopf über die Breite, i-Knopf rechts außerhalb.
- Jede Grundrolle ist wie die übrigen Rollen eine eigene Karte: in der ersten Zeile der Name mit i-Knopf, in der zweiten der Wert oder die Auswahl. Werwölfe: Karte über die volle Breite mit der Zahlenleiste; darunter drei Karten nebeneinander nur zur Anzeige (Spieler, Seherin, Dorfbewohner) mit einer schlichten Zahl. Dadurch gehören Spieler, Seherin und Dorfbewohner nicht mehr optisch zur Überschrift der Werwölfe. Vorherige Fassung:
- Grundrollen noch einmal überarbeitet: Nur die Wolfszahl ist eine Auswahl (Leiste aus gleich breiten Knöpfen über die volle Breite, "empfohlen" darunter, gelber Rahmen solange nicht gewählt). Spieleranzahl (ohne Erzähler), Seherin und Dorfbewohner stehen darunter als reine Anzeige in einer Zeile: große weiße Zahl, kleiner Name, dünne Trennlinien, keine Knöpfe (nur die i-Knöpfe bei Seherin und Dorfbewohner). Frühere Fassung:
- Neues Layout der drei Boxen: links die Werwölfe (volle Höhe, die Zahlenknöpfe teilen die Breite gleichmäßig, "empfohlen" steht unter dem Knopf), rechts untereinander Dorfbewohner (oben) und Seherin; alle i-Knöpfe sind grau (wie bei Überschriften im Tabu-Spiel), auf gefüllten Kacheln dunkel. Davor: bei Seherin und Dorfbewohner steht oben nur der Name und darunter ein Anzahl-Knopf mit dem i-Knopf darin, bei den Werwölfen steht er direkt neben der Überschrift; der Seherin-Knopf ist wie eine gewählte Rolle gefüllt. Ursprünglich:
- Werwölfe, Seherin und Dorfbewohner sind drei eigene Boxen (oben Titel und i-Knopf, unten die Auswahl beziehungsweise Anzeige; die Werwolfbox hat Platz für drei Zahlen und das Wort "empfohlen"). Alle Rollen sehen einheitlich aus: eine Kachel mit dem Namen, bei Rollen mit Optionen darunter die Optionsleiste; ist die Rolle dabei, ist der Namensbalken gefüllt. Der Grund einer Sperre ("ab 10", "kein Platz frei", "nicht zusammen") steht in der zweiten Zeile jeder Kachel; dadurch entfallen die Zeilentitel "Ab N Spielern" im Kasten "Noch nicht verfügbar".
- Die Info-Fenster der Rollen, Zusätze und Grundrollen haben vier Teile, jeweils nur wenn es etwas zu sagen gibt: "Allgemein" (Seite, Bedingungen), "Aufgaben" (was die Rolle wann tut), "Optionen" (jede Option kurz mit fett gesetztem Namen) und "Besonderheiten" (Sonderfälle). Alle Texte auf Deutsch und Englisch nach den Spielregeln neu und kurz gefasst; beim Schutzamulett: Träger wird zu Beginn unter den Nicht-Werwölfen ausgelost, fängt einen direkten Angriff ab, wird jeden Morgen behalten oder weitergegeben (nach einem abgefangenen Angriff Pflicht), darunter die Sonderfälle. Beim Magier sind es zwei Zauber, die jeweils heilen oder töten. Der Hinweis "ab 2 Werwölfen" beim Trunkenbold entfällt.
- Überarbeitung der Info-Texte nach Durchsicht: alle Texte deutlich kürzer; Schutzamulett mit Besonderheiten "Das Amulett geht verloren, wenn der Träger:" und drei Punkten (Liebeskummer, Hammer-Fehlschuss als Bürgermeister, Wunde als Harter Bursche); Leibwächter und Dorfmatratze mit Schutz gegen direkte Angriffe beziehungsweise nur gegen den Wolfsangriff und ohne Schutz vor dem Hammer; Harter Bursche erliegt nur nach einem Wolfsangriff in der Folgenacht; Bürgermeister mit zweiter Box "Hammer ab 10 Spielern" und den neuen Hammer-Regeln; roter Hinweistext bei Hexe und Magier nennt die Gegenrolle; Seher-Lehrling wird offen aufgerufen, sobald die Seherin tot ist (Logik noch anzupassen).
- Zweite Durchsicht der Info-Texte: Trunkenbold erinnert sich an seine Rolle (Jäger darf oder muss schießen, je nach Option); Schutzamulett fängt "direkte Angriffe und eine Abstimmung" ab und wird jede Nacht als Letzter geweckt; Jäger darf oder muss je nach Option; Amor wählt zwei Verliebte, auch sich selbst; Bürgermeister-Hammer einmal pro Partie, nichts schützt davor (auch nicht das Amulett); Ermittler und Magier ohne Erzähler-Bezug, der Magier bestimmt für jeden Zauber selbst Heilung oder Tötung. Die Regeländerungen (Amulett-Aufruf, Hammer ohne Schutz, Lehrling) sind in der Logik noch nachzuziehen.
- Dritte Durchsicht: Schutzamulett schützt in der Nacht vor jedem Angriff (Träger überlebt, muss es danach weitergeben) mit den Ausnahmen Hammer, Tod des Liebespartners und Harter Bursche nach dem Angriff; Dorfmatratze und Leibwächter nennen klar, wovor sie schützen (Leibwächter: Wolf, Gift, Todeszauber; Dorfmatratze nur Wolf); Amor und Seher-Lehrling neu formuliert. Offen: zweite Option des Harten Burschen (jeder Angriff statt nur Wolfsangriff verzögert) braucht eine neue Einstellung in der Spiellogik.
- Werwolf, Korrekturen aus der Merkliste: Der Name eines hinzugefügten Spielers beginnt mit einem Großbuchstaben; es lassen sich höchstens 20 Spieler und der Erzähler hinzufügen (ein Hinweis erscheint am Limit); bei zu vielen Spielern sagt die Konfiguration "Zu viele Spieler: höchstens 20" statt "Füge zuerst mindestens 6 Spieler hinzu"; das Info-Fenster nennt direkt unter dem Namen die Seite der Rolle (Dorfrolle, Gegner des Dorfes, Dorfrolle mit eigenem Ziel, Zusatz; Hexe und Magier mit "nicht zusammen mit …"), der Teil "Allgemein" entfällt dort, wo er nur das sagte; Seherin und Dorfbewohner sind nur noch eine niedrige Zeile mit der Zahl rechts.
- Zweite Runde der Merkliste: Das Feld "Spieler hinzufügen" (`PlayerAdder`) und die Auswahl aus der Spielerliste (`RosterPicker`) haben einen optionalen Parameter für die Obergrenze (`room` beziehungsweise `limit`): Das Feld nimmt nur so viele Namen, wie noch Platz ist, und meldet "Nur 2 von 3 Namen hinzugefügt: Die Liste ist voll"; die Auswahl sperrt weitere Haken und sagt "Mehr geht nicht: höchstens 21 Personen" (von Hand getippte Namen zählen mit). "(nicht zusammen mit Magier/Hexe)" steht jetzt als zweite Zeile im Button von Hexe und Magier. Die Seite der Rolle steht als kleine, dezente Zeile unter dem Namen im Titel des Info-Fensters (neuer Parameter `subtitle` in `Dialog` und `InfoButton`). Seherin und Dorfbewohner sind in der Höhe mittig zentriert. Die Überschriften von Werwölfe, Seherin und Dorfbewohner öffnen wie bei den Überschriften im Tabu dasselbe Fenster wie der i-Knopf.
- Fenster "Spieler wählen": Übernehmen, Abbrechen und Spielerliste verwalten sind ein Fuß (`kit-roster__footer`), der immer am unteren Rand des Fensters sitzt; die Liste steht darüber, bei kurzer Liste bleibt der freie Platz dazwischen. Die Zeile für "Mehr geht nicht" ist bei gesetztem Limit immer da (leer, bis die Grenze erreicht ist), damit nichts verrutscht. Geprüft bei 375x812 und 360x640 mit Gruppenliste, kurzer und langer Gruppe.
- Die weiteren beschlossenen Regeländerungen (zwei Optionen des Harten Burschen, Amulett jede Nacht als Letzter und Hammer ohne Schutz, offener Aufruf des Seher-Lehrlings, Amor als Verliebter) stehen für Codex in `docs/GAMEHUB_WERWOLF_UI.md`.
- Die Spielerliste im Kopf gibt es nur noch im GameHub (Spielübersicht), nie in einem Spiel; auch im Werwolf ist der Knopf weg (die Auswahl "Aus Spielerliste wählen" in der Aufstellung bleibt).
- Spieleinstellungen werden gemerkt: neuer gemeinsamer Baustein `GameSettingsMemory` (Port in `business/shared`, Speicher im Browser unter `gamehub.settings.<Schlüssel>`, Kontext und Hook `usePersistentState` im game-kit). Ein Spiel hält seine Teile unter eigenen Schlüsseln und liest sie mit einem eigenen Parser, der kaputte Daten verwirft. Werwolf merkt sich Aufstellung (`werewolf.lineup`) und Konfiguration (`werewolf.configuration`; nicht mehr passende Rollen nimmt `normalizeFixedDraft` zurück), Tabu die Einstellungen des Hauptmenüs (`taboo.settings`: Modus, Runden, Dauer, Pässe, Gleichstand, Schwierigkeit, Kategorien, Kartenquelle und so weiter). Jede Änderung wird gespeichert, ein neues Spiel startet damit; ohne Speicher (Tests) gelten die üblichen Voreinstellungen. Jedes neue Spiel nutzt denselben Baustein.
- Neu in der Werwolf-Konfiguration: Ein Mond-Knopf links neben "Fertig" öffnet ein Fenster mit der Aufwachreihenfolge der Nacht (Amor, Trunkenbold, Leibwächter/Dorfmatratze, Werwölfe, Seherin, Paranormaler Ermittler, Hexe, Magier, Bürgermeister mit Hammer, Alte Vettel, Amulettträger zuletzt). Die Rollen im Spiel sind der Reihe nach nummeriert, die übrigen abgeblendet ("nicht im Spiel"); Hinweise nennen, wann ein Schritt stattfindet (nur Nacht 1, Beginn von Nacht 3, ab Nacht 2) und dass die Wölfe sich in Nacht 1 nur kennenlernen. Die Reihenfolge steht als reine Daten in `wakeOrder.ts` (Business) und folgt `docs/GAMEHUB_WERWOLF_NARRATOR_API.md` plus den beschlossenen Änderungen (Amulett zuletzt); sie muss mit dem Nachtskript von Codex übereinstimmen.
- Der Hinweis "(nicht zusammen mit Hexe/Magier)" unter dem Namen im Button steht nur noch, wenn er stimmt: Die andere Rolle ist gewählt und hält diese tatsächlich aus der Auswahl (neues Feld `blockedBy` in `FixedItemView`; bei 14 Spielern mit vier Wölfen, wo beide erlaubt sind, steht nichts).
- Spieler-Reiter: Ein Hinweis sagt, dass Werwolf für 6 bis 20 Spieler und einen Erzähler ausgelegt ist.
- Die Logikänderungen von Codex sind übernommen (Dateien aus `game/werwolf`, dort noch nicht committet): `WerewolfSettings.toughGuy` (`wolfOnly`/`anyAttack`), Hammer umgeht das Amulett, Amulett-Übergabe als letzter Nachtschritt, offener Seher-Lehrling-Aufruf, Nachtskript, Ereignislog und Auswahlhilfen (`nightScript`, `selectors`, `session`, `eventLog`, `wounds`). Die Konfiguration bietet den Harten Burschen jetzt mit zwei Optionen an ("Nur Wolfsangriff", "Jeder Angriff", Standard Wolfsangriff); der Info-Text erklärt beide, ältere gespeicherte Konfigurationen ohne die Option bekommen den Standard.
- Notiert für später (in `docs/GAMEHUB_WERWOLF_UI_PLAN.md`): Spielanleitung-Knopf oben in der Leiste der Hauptansicht.
- Fenster "Spieler wählen" neu geordnet: In der Gruppenliste steht oben "Spielerliste verwalten" (der Knopf "Alle wählen" gibt es dort nicht mehr), unten nur Übernehmen und Abbrechen. In einer Gruppe stehen oben Zurück und Alle/Keinen wählen, "Spielerliste verwalten" entfällt dort. Der Harte Bursche sagt in den Besonderheiten kürzer "In der Angriffsnacht lässt sich nur ein Wolfsangriff noch heilen".
- Fenster "Spielerliste" (verwalten): Der Knopf "Neue Gruppe" ist wie die Knöpfe Übernehmen und Abbrechen im Fenster "Spieler wählen" ein Fuß am unteren Rand und genauso hoch (44 px, gleiche Position, bei 375x812 gemessen: 713 bis 757).
- Die Liste in den Fenstern "Spieler wählen" und "Spielerliste" nutzt den Platz bis zum Fuß: `useWholeRows` misst den Inhalt kurz als einfachen Block, damit der Fuß mit seinem automatischen Außenabstand nicht als freier Raum zählt. In einer Gruppe passen damit bei 375x812 acht statt sieben ganze Namen ins Fenster (Rest über dem Fuß unter einer Zeile).
- Sitzkreis: Man muss nicht mehr loslassen, um einen anderen Namen zu sehen. Wer eine Kachel hält (250 ms), sieht den Namen; bleibt Finger oder Maustaste unten und gleitet über andere Kacheln (der Erzähler zählt mit), wechselt der Name sofort mit. Zwischen zwei Kacheln bleibt der letzte Name stehen, beim Loslassen, Verlassen des Kreises oder Abbruch verschwindet er. Die Behandlung liegt jetzt am Kreis statt an jeder Kachel (`document.elementFromPoint`), die Kreisfläche hat `touch-action: none`, damit das Gleiten nicht die Seite scrollt.
- Abgleich des Rollen-Reiters mit Spiellogik und Regeln (`docs/GAMEHUB_WERWOLF.md`, Zustandsmaschine, Nachtskript): Mindestzahlen, Sperren, Wolfszahlen, Hammer ab 10, Trunkenbold ab 9 mit zwei Wölfen, Amulett ab 10, Hexe/Magier-Ausnahmen und die Aufwachreihenfolge stimmen mit der Logik überein. Korrigiert beziehungsweise ergänzt: Amor (Verliebte erkennen einander und behalten ihre Rollen; ein gemischtes Paar als letzte zwei lässt die Werwölfe gewinnen, statt "töten sich nie" und "gewinnen als Paar", was die Logik nicht kennt), Amulett (Weitergabe ist Pflicht nach jedem abgefangenen Angriff, auch am Tag; Weitergabe an jede lebende Person, auch einen Werwolf), Trunkenbold (Pool "Rollen im Spiel außer Amor"; ein Wolf wacht erst nach der Enthüllung mit den Wölfen auf), Leibwächter und Dorfmatratze (wählen eine andere Person, nicht sich selbst), Aufwachreihenfolge (Tarnaufrufe bei geheimer Rollenaufdeckung).
- Nach Rückmeldung: Amor-Text sagt, dass Verliebte versuchen, gemeinsam zu überleben (Werwolf greift den Partner nicht an, Dorfrolle stimmt nicht gegen ihn; nicht erzwungen). Das Schutzamulett schützt laut Beschluss nur noch vor den Angriffen der Nacht (Wolf, Gift, Todeszauber), nicht mehr vor Hammer, Abstimmung und Jägerschuss, damit niemand erfährt, wer es hat; Info-Text angepasst, Regel für Codex in `docs/GAMEHUB_WERWOLF_UI.md` notiert (Logik noch nicht umgestellt). Der Fall "Trunkenbold ist ein Werwolf, der sichtbare Wolf scheidet vor der Enthüllung aus" ist dort als Ist-Zustand (Tarnaufruf, kein Angriff) festgehalten und so beschlossen (keine frühere Aufdeckung). Beim Amulett löst der Tod des Liebespartners keine Weitergabepflicht mehr aus (auch nicht nachts; es geht mit dem Träger verloren, wenn er es behält), so beschlossen und für Codex notiert. Der Satz zum gemischten Paar ist aus dem Amor-Text wieder entfernt (klar aus den Regeln: die Wölfe gewinnen in der Überzahl).
- Aufgabe We-01-48 geteilt: Die Harter-Bursche-Option in der Konfiguration ist umgesetzt (`done`); der Amulett-Endschritt und der öffentliche Lehrlingsaufruf gehören in die Erzähleransicht und stehen als neue Aufgabe We-01-49 (`planned`).
- Spieler-Reiter: Rechts neben "Aus Spielerliste wählen" steht ein Feld mit der Anzahl der Personen, zum Beispiel "8/21" (der Erzähler zählt mit, 21 = 20 Spieler und der Erzähler). Die Schrift ist rot bei 0 bis 6 Personen und grün ab 7 (sechs Spieler und der Erzähler sind das Minimum, `minWerewolfParticipants` in `lineup.ts`); für Screenreader beschreibt das Feld "8 von 21 Personen (mit Erzähler)".
- Der Reiter heißt jetzt "Spieler (6-20)" (statt mit der aktuellen Zahl, die steht im Zählfeld); die Grenzen kommen aus `werewolfPlayerLimits`.
- Die Hinweise "Werwolf ist für 6 bis 20 Spieler und einen Erzähler ausgelegt" und "Mehr geht nicht: höchstens 20 Spieler und der Erzähler" sind aus dem Spieler-Reiter entfernt; der Reiter (6-20) und das Zählfeld (z. B. 8/21) sagen es. Beim Hinzufügen zu vieler Namen meldet das Feld weiter "Nur 2 von 3 Namen hinzugefügt: Die Liste ist voll".
- Feste Regel für die Reiter Spieler und Teams: Sie nennen, was zur Wahl steht, nicht was eingestellt ist. Die gemeinsame Aufstellung (`LineupSetup`) zeigt bei Tabu "Spieler" (die Spielerliste ist optional, daher ohne Klammern) und "Teams (2-6)" statt "Spieler (0)" und "Teams (2)"; ein Spiel, das seine Spieler braucht, zeigt "Spieler (min-max)" aus seiner Aufstellung, der Werwolf "Spieler (6-20)". Die Regel steht auch in der Merknotiz des Projekts.
- Der Knopf "Erzähler wählen" beziehungsweise "Erzähler wechseln" im Spieler-Reiter ist blau (Variante `primary`, die Akzentfarbe).
- Variabler Modus (We-01-32) geplant, noch nicht umgesetzt: Beschlossen sind drei Kästen "Muss / Darf / Soll nicht ins Spiel" (Drag and Drop wie bei den Teams in Tabu oder Antippen mit drei Möglichkeiten), alle verfügbaren Rollen zu Beginn im Kasten "Soll nicht", nicht verfügbare Rollen und Zusätze werden nicht angezeigt, jede Option einer Rolle als eigener Eintrag (nie mehr als eine Option derselben Rolle), unten fest das Feld "Sonderrollen aus Darf" (Mindest- und Höchstzahl), oben Werwölfe (Zahlenknöpfe wie im festen Modus, Standard gewählt, empfohlene Zahl markiert; eine Zahl heißt fest, mehrere heißen losen; nur wo die Spielerzahl eine Auswahl erlaubt) und die feste Seherin. Zusätze haben eigene Kästen in anderer Farbe und werden unabhängig voneinander gelost (keine gemeinsame Zahl), das Feld "Sonderrollen aus Darf" zählt nur die Darf-Rollen mit gleich gewichteten Anzahlen, fest und variabel werden getrennt gespeichert. Die Wünsche an die Logik (feste Rollen, Optionen als Teil der Ziehung, Wolfszahl als erlaubte Menge, mögliche Anzahl) stehen für Codex in `docs/GAMEHUB_WERWOLF_UI.md`.
- Die überarbeitete Logik des variablen Modus von Codex ist übernommen (`variableSetup.ts`, `stateMachine.ts`, `nightScript.ts`, neue Doku `docs/GAMEHUB_WERWOLF_VARIABLE_API.md`, We-03-67): feste Rollen und Zusätze, Optionen als Teil der Ziehung, Wolfszahl als erlaubte Menge, unabhängige Zusätze, mögliche Anzahl und Sperrgründe in der Analyse, Empfehlung der Wolfszahl. Dazu neu in meiner Schicht: `variableConfiguration.ts` mit dem Entwurf (Muss/Darf/Nein je Eintrag, Zusätze, Bereich, Wolfszahlen, Regeln), der Umrechnung in die Auswahl der Logik, der Beschreibung für die Oberfläche (sichtbare Einträge nach Spielerzahl, Sperren, Wolfsknöpfe mit Empfehlung, möglicher Bereich), der Korrektur bei geänderter Spielerzahl und dem Parser für gespeicherte Entwürfe; 28 Tests, darunter das Beispiel mit 8 Spielern (Hexe, Jäger in zwei Optionen und Amor auf Darf, Harter Bursche auf Muss: 0 bis 3). Die Oberfläche folgt.
- Variabler Modus, Schritt 1 (Gerüst): "Variable Rollen" zeigt jetzt die Ansicht statt "folgt später". Fest oben bleiben der Umschalter, die Werwölfe (Zahlenknöpfe, bei mehreren gewählten Zahlen wird gelost, Standard gewählt, Empfehlung markiert, fest wo es keine Auswahl gibt) und die Seherin; darunter scrollen drei Kästen für die Rollen (Muss, Darf, Soll nicht, zu Beginn alle verfügbaren Rollen im letzten) und drei Kästen in anderer Farbe für die Zusätze, jede Option einer Rolle als eigener Eintrag; nicht verfügbare Rollen und Zusätze fehlen; fest unten das Feld "Sonderrollen aus Darf" (Mindest- und Höchstzahl mit Knöpfen, möglicher Bereich, Hinweis wenn die Auswahl nicht spielbar ist). Der Reiter "Spielregeln" gehört zum Entwurf des gezeigten Modus. Die Einträge lassen sich noch nicht verschieben (Schritt 2), gespeichert wird noch nicht (Schritt 3).
- Variabler Modus, Schritt 2 (Einordnen): Die Rollen und Zusätze sind Knöpfe. Ein Tipp öffnet ein Fenster mit "Muss ins Spiel", "Darf ins Spiel" und "Soll nicht ins Spiel" (der aktuelle Stand ist markiert; ist ein Eintrag gesperrt, sind Muss und Darf aus und der Grund steht dort: anderes Paarmitglied oder andere Option muss ins Spiel, kein Platz, passt nicht zu den Rollen im Spiel). Man kann sie auch zwischen den Kästen ziehen (derselbe Baustein `usePlayerDrag` wie bei den Teams in Tabu, der jetzt auch den Inhalt eines `TabPane` scrollt): Rollen nur in die Rollenkästen, Zusätze nur in die Zusatzkästen, Ziehen außerhalb der Kästen oder gesperrt nach Muss/Darf tut nichts, Muss bei einer Option setzt die anderen Optionen derselben Rolle auf Soll nicht. Das Feld "Sonderrollen aus Darf" ist kompakter (Mindestens und Höchstens nebeneinander).
- Variabler Modus, Schritt 3 (Speichern und Info): Fester und variabler Entwurf werden getrennt gespeichert (`werewolf.configuration` und `werewolf.variableConfiguration` im gemeinsamen Speicher der Spieleinstellungen), ebenso die Art der Rollen (`werewolf.rolesMode`); beim nächsten Spiel steht die Konfiguration so da, wie sie war, und es gibt keine Übernahme von einem Entwurf in den anderen. Der Entwurf wird beim Anzeigen an die Spielerzahl angepasst (nicht mehr existierende Einträge fliegen raus, zwei "Muss" derselben Rolle bleiben nicht nebeneinander). Im Fenster der Wahl hat jede Rolle und jeder Zusatz den Info-Knopf mit der Erklärung der Rolle (alle Optionen einer Rolle teilen sie). Bei einer Auswahl, die nicht spielbar ist, steht im Fuß der Hinweis "Mit N Spielern ist diese Auswahl nicht spielbar".
- Variabler Modus, Schritt 4 (Aufwachreihenfolge): Das Fenster der Aufwachreihenfolge zeigt im variablen Modus den Entwurf des variablen Modus (`wakeOrderVariable`): Rollen auf "Muss" sind nummeriert, Rollen auf "Darf" ebenfalls, mit gestrichelter Nummer und dem Hinweis "Darf ins Spiel: wird so oder so gerufen", weil der Erzähler sie auch ruft, wenn die Ziehung sie nicht genommen hat (Tarnaufruf, damit niemand die Ziehung erfährt); Rollen auf "Soll nicht" sind abgeblendet. Der Bürgermeister wird nur mit Hammer gerufen (als "Darf", wenn die Option Hammer auf "Darf" steht), Leibwächter und Dorfmatratze sind ein Schritt mit dem stärkeren Zustand. Mit den festen Rollen bleibt alles wie vorher. Damit ist die Oberfläche des variablen Modus (We-01-32) in vier Schritten gebaut; noch offen bleibt der Start mit `createVariableWerewolf` (Schritt 3 des UI-Plans).
- Variabler Modus, Ziehen: Der Kasten unter dem Zeiger bekommt jetzt einen eigenen blauen Rahmen und eine leichte Tönung statt eines Umrisses. Der Umriss lag außen und wurde vom scrollenden Inhalt links abgeschnitten, und er lag als blauer Streifen über dem gelben oder grünen Rahmen; jetzt ersetzt das Blau den Rahmen des Kastens und nichts wird außerhalb gemalt.
- Variabler Modus, kompakter und mit Farben: Oben stehen die Werwölfe mit drei Vierteln der Breite und die Seherin rechts daneben (ein Viertel) mit der Zahl unter dem Namen; das Feld "Sonderrollen aus Darf" hat Titel und "Möglich: a bis b" in einer Zeile. Jede Rolle und jeder Zusatz behält seinen Info-Knopf (im Eintrag selbst). Die Kästen haben die Farbe ihres Ziels: grün "Muss ins Spiel", gelb "Darf ins Spiel", rot "Soll nicht ins Spiel" (die Zusatzkästen behalten den blauen Grund); beim Ziehen füllt sich der Kasten unter dem Zeiger mit seiner Farbe. Eine Option, die gesperrt ist, weil eine andere Option derselben Rolle auf "Muss" steht (oder das andere Paarmitglied, oder weil sie nicht zu den Rollen im Spiel passt), ist rot und lässt sich nicht ziehen; ein Tipp zeigt weiter den Grund.
- Variabler Modus, noch kompakter: Die Rollen-Einträge sind kleiner (kleinere Schrift, niedrigere Höhe; die Mindesthöhe des allgemeinen Knopfs gilt dort nicht mehr), der mitgezogene Name hat dieselbe Größe wie der Eintrag, der Hinweis "Tippe eine Rolle an …" entfällt, und "Sonderrollen aus Darf" ist eine schlanke Leiste mit "Mindestens" und "Höchstens" nebeneinander.
- Variabler Modus, Info zu "Darf ins Spiel" und Korrektur: Neben dem Titel "Darf ins Spiel" (bei den Rollen und bei den Zusätzen) steht ein Info-Knopf, der die Ziehung erklärt. Korrektur: Der Erzähler weckt nur die Rollen, die tatsächlich im Spiel sind; die frühere Aussage, er rufe jede Rolle aus dem Kasten "Darf" auf, war falsch und ist in der Info und im Fenster der Weckreihenfolge ersetzt (eine Rolle auf "Darf" steht dort als mögliche Stufe und wird nur geweckt, wenn die Ziehung sie genommen hat). Dazu: Beim Ziehen bleibt das i sichtbar (grau), der Text im gezogenen Namen ist zentriert, "Nichts hier" entfällt.
- Variabler Modus, volle Plätze: Der Kasten "Muss ins Spiel" nimmt keine weitere Rolle und keinen weiteren Zusatz mehr auf, wenn für die Spielerzahl kein Platz mehr frei ist (die höchste Rollenzahl ist erreicht). Das gilt für Ziehen und Antippen: beim Ziehen färbt sich der Kasten nicht, beim Tippen ist "Muss ins Spiel" gesperrt und der Grund steht im Fenster; eine Rolle auf "Darf" bleibt dort oder kann das Spiel verlassen. Die Logik dazu steht in der Beschreibung der Konfiguration (neues Feld `mustBlocked` je Rolle und Zusatz, geprüft durch die Analyse der Logik).
- Variabler Modus, Spanne der Darf-Rollen: "Mindestens" bleibt unter der Zahl der Rollen auf "Darf" (bei einer Rolle also 0), weil alle zu ziehen dasselbe wäre wie "Muss"; die Obergrenze des Knopfs und die Auswahl für die Logik folgen dieser Regel (neues Feld `minimumCeiling`). Außerdem: Die Plus- und Minus-Knöpfe der Leiste "Sonderrollen aus Darf" saßen durch einen allgemeinen Außenabstand zu tief; die Leiste ist jetzt bündig und niedriger (58 statt 82 px).
- Variabler Modus, Zusätze in denselben Kästen: Die Zusätze (Trunkenbold, Schutzamulett) haben keine eigenen drei Kästen mehr, sondern stehen als Einträge mit bläulicher Farbe in denselben drei Kästen wie die Rollen (Muss, Darf, Soll nicht); die Überschrift heißt "Rollen und Zusätze", ein Info-Knopf bei "Darf ins Spiel" erklärt Rollen und Zusätze zusammen. Der mitgezogene Name trägt dieselbe Farbe. Außerdem: Bei den festen Rollen steht die Umschaltung Feste/Variable Rollen im festen Kopf und wird von der Scrollleiste nicht mehr mitgenommen.
- Variabler Modus, Prüfung der Logik: Ein neuer Test (`variableAudit.test.ts`) geht für alle Spielerzahlen von 7 bis 20 zufällig durch die Kästen, nur mit den Zügen, die die Oberfläche anbietet, und prüft nach jedem Zug, dass das Spiel startbar bleibt, dass 25 Ziehungen je Stand zu Kästen, Spanne, Wolfszahlen und Optionen passen und dass die Sperren stimmen; dazu die angezeigten Rollen, Zusätze und Wolfszahlen je Spielerzahl. Dabei gefundene und behobene Fehler: (1) Leibwächter und Dorfmatratze zählen zusammen als eine Rolle der Spanne (beide auf "Darf" machte das Spiel unstartbar); (2) "Muss" und die Wolfszahlen prüfen jetzt, dass jede gewählte Wolfszahl noch aufgeht (nicht nur eine); eine Wolfszahl, mit der kein Spiel möglich ist, lässt sich nicht dazuwählen; (3) die Spanne der Darf-Rollen wird auf das gekürzt, was die Plätze für alle gewählten Wolfszahlen erlauben (neue Felder `maximumFloor`/`minimumCeiling`), sonst blieb ein zu hohes "Mindestens" unbemerkt im Entwurf und blockierte den Start.
- Variable Rollen, Hexe und Magier: Wo beide zusammen spielen dürfen (ab 14 Spielern mit der passenden Wolfszahl), zählen sie als zwei Rollen der Ziehung, und beide lassen sich auf "Muss" setzen. Wo sie nicht zusammen spielen dürfen und beide auf "Darf" stehen, zählen sie als eine Rolle: es wird eine von beiden gelost, nie beide, mit gleicher Chance. Das hängt von der gelosten Wolfszahl ab und ist deshalb in der Logik je Wolfszahl umgesetzt (`familiesForWolves` in `variableSetup.ts`, auf Wunsch des Auftraggebers; die Logik ist sonst Codex' Bereich). Zwei Tests prüfen die Verteilung (14 Spielern, 3 und 4 Wölfe).
- Variable Rollen, gleiche Chance je Rolle: Die Rollen auf "Darf" werden nicht mehr als gleich wahrscheinliche Teilmengen gezogen, sondern so, dass jede einzelne Rolle dieselbe Chance hat (`pickFamilies`/`familyChances` in `variableSetup.ts`). Eine Gruppe mit zwei Varianten (Leibwächter/Dorfmatratze, Hexe/Magier ohne Erlaubnis) zählt dafür doppelt und bekommt danach ihre Variante 50/50; es werden genau A Gruppen gezogen (Zufallsreihenfolge, ein Startpunkt). Beispiel: Leibwächter, Dorfmatratze, Amor, Hexe mit A = 2 ergibt für jede Rolle 50 %, mit A = 1 je 25 %. Grenze: Braucht eine Gruppe mehr als 100 % (A = 3 im Beispiel), bekommt sie 100 % und die übrigen teilen den Rest. Dafür sind nicht mehr alle Kombinationen gleich wahrscheinlich. Die Tests zur Verteilung sind angepasst, ein neuer prüft 50 %, 25 % und den Grenzfall.
- Werwolf, Spielanleitung (We-01-50): Der Knopf "Spielregeln" steht in der Kopfleiste und bleibt in beiden Ansichten (Aufstellung und Konfiguration) sichtbar. Das Fenster "Spielanleitung Werwolf" hat drei Reiter: **Spiel** (Ziel, Vorbereitung, Nacht, Morgen, Tag, Wer gewinnt), **Rollen** (Grundrollen und alle Sonderrollen nach Mindestspielerzahl mit Seite und derselben Erklärung wie im Info-Fenster) und **Optionen** (Zusätze, Einstellungen, feste und variable Rollen, Hilfen in der App). Die Erklärungen der Rollen werden aus den Info-Texten übernommen (`ConfigInfoParts`), damit nichts doppelt gepflegt wird. Texte auf Deutsch und Englisch, Tests für beide Sprachen und beide Ansichten.
- Werwolf, Aufräumen der beiden Ansichten (We-01-51): Der Reiter "Spielregeln" der Konfiguration heißt jetzt "Einstellungen" (er wurde mit dem Knopf der Anleitung verwechselt); beide Einstellungen (Wolfsangriff, Rollen nach dem Ausscheiden) haben einen Info-Knopf; die Optionen des Wolfsangriffs stehen in der Reihenfolge Nacht 1, Nacht 2 (Standard bleibt Nacht 2).
- Ziehen mit Halten (gemeinsamer Baustein `usePlayerDrag`, gilt für Tabu und Werwolf): Wer einen Namen oder eine Rolle etwa 300 Millisekunden gedrückt hält, beginnt das Ziehen auch ohne Bewegung; ein kurzes Antippen bleibt ein Tipp. Zwei Tests prüfen beides, im Browser mit echten Zeigerereignissen nachgemessen.
- Aufgeräumt vor dem Spielstart: Die Konfiguration ist in drei Dateien geteilt (`FixedRoles.tsx` für die festen Rollen, `GeneralSettings.tsx` für die Einstellungen, `WerewolfConfiguration.tsx` nur noch Rahmen, Umschalter und Reiter, von 465 auf 124 Zeilen), ohne geändertes Verhalten. Status und Dokumente nachgezogen: We-01-32 ist erledigt, der Spielstart steht als We-01-52 geplant, die Übergabedokumente nennen die Bedienoberfläche als umgesetzt und enthalten einen Abschnitt Umsetzungsstand.
- Spielanleitung, Korrekturen nach dem Durchlesen: Das Fenster scrollt nicht mehr als Ganzes, sondern nur der Inhalt eines Reiters; die Reiter bleiben oben und auch am Ende eines langen Textes erreichbar. Der Daumen bei der Abstimmung entfällt. Die Aussage "Dorfbewohner gibt es immer" ist korrigiert: Werwölfe und Seherin gibt es immer, Dorfbewohner füllen nur freie Plätze auf. Die Seite einer Rolle steht in Klammern direkt neben dem Namen (auch bei den Zusätzen), darunter nur noch die Mindestspielerzahl. Die Amulett-Erklärung sagt klar, dass das Amulett bei jedem Tod des Trägers verschwindet (Abstimmung, Jägerschuss, Hammer, Liebeskummer), außer er hat es im letzten Nachtschritt vorher weitergegeben.
- Werwolf, Rollen nach dem Ausscheiden vereinfacht (We-01-53, Beschluss des Auftraggebers): Die Einstellung "Aufdecken / Geheim halten" entfällt ganz. Das Spiel nennt nie die Rolle einer ausgeschiedenen Person, Ansagen enthalten nur Namen. Der Erzähler weckt nur Rollen, die noch leben; die Tarnaufrufe für Ausgeschiedene und für nicht gezogene Rollen sind weg. Bleiben: Aufrufe für lebende Rollen mit verbrauchter Fähigkeit und für einen noch nicht enthüllten Trunkenbold. Wer am Tag ausscheidet, darf seine Rolle aufdecken, muss aber nicht. Die Einstellung ist aus Logik (`revealRoles`), Entwürfen und Oberfläche entfernt, alte gespeicherte Entwürfe bleiben lesbar. Der Reiter Einstellungen enthält nur noch den Wolfsangriff. Anleitung, Aufwachreihenfolge und Tests angepasst. Offen: Sollen Hexe und Magier ein vom Amulett abgefangenes Wolfsopfer sehen (heute: nein)?
- Werwolf, Wolfsopfer für Hexe und Magier (We-01-54, Beschluss des Auftraggebers): Hexe und Magier sehen die angegriffene Person immer als Wolfsopfer, auch wenn das Amulett oder der Leibwächter den Angriff abgefangen hat, damit niemand am Opfer ablesen kann, ob ein Schutz gewirkt hat. Heilen ist dann möglich und verbraucht den Trank oder Zauber, ohne dass sich für die Person etwas ändert. Dafür hat der Spielzustand das neue Feld `wolfTarget` (angegriffen) neben `victim` (stirbt). Zwei neue Tests (Amulett, Leibwächter).
- Werwolf, neues Layout der Konfiguration (We-01-55, Wunsch des Auftraggebers): Die Reiter Rollen/Einstellungen entfallen. Oben steht in beiden Modi dasselbe Kopfstück in zwei Spalten (links zwei Drittel): in **einer Box** die Werwölfe und der Wolfsangriff ("Wolfsangriff ab Nacht 1 / Nacht 2"), rechts übereinander die Dorfbewohner (Zahl unter dem Namen) und die Seherin im gleichen Aussehen. Im variablen Modus zeigt das Feld Dorfbewohner die Spanne, die die Ziehung übrig lässt (neues Feld `villagers` der Beschreibung). Der Rest scrollt darunter; im festen Modus gibt es einen eigenen Kasten "Zusätze". Neue Datei `CoreBlock.tsx`; die Beschriftungen des Wolfsangriffs sind kürzer ("Nacht 1", "Nacht 2").
- Werwolf, Feinschliff der variablen Konfiguration (We-01-56): Die Spanne der Dorfbewohner hat dünne Leerzeichen um den Strich ("3 – 4"). "Höchstens" kann bei vorhandenen Rollen auf "Darf" nicht mehr auf 0 gestellt werden (dann wären alle Darf-Rollen nutzlos); die Logik hebt auch einen gespeicherten Wert 0 auf 1 an. Schnelleres Antippen der Spanne: Die Aufzählung der möglichen Rollenmengen (der teure Teil jeder Analyse) wird zwischengespeichert, weil sie nicht von der Spanne abhängt, die Ansicht wird nur für den gezeigten Modus und nur bei geänderter Auswahl berechnet, und die bereinigten Entwürfe werden nicht bei jedem Zeichnen neu gebildet. Im Browser gemessen: etwa 25 Millisekunden je Antippen nach dem Warmlaufen (vorher bis zu 200).
- Werwolf, Wolfsempfehlung im variablen Modus (We-01-57, Hinweis und Rechenweg des Auftraggebers): Die Empfehlung berücksichtigt jetzt die Rollen, die gezogen werden, nicht nur die Muss-Rollen. Weil die Stärke des Dorfes in der Bewertung die Summe der Rollenwerte ist, wird sie ohne Ziehung gerechnet (neue Datei `variableRecommendation.ts`): Muss-Rollen voll, dazu der Durchschnittswert aller Rollen auf "Darf" mal die mittlere Zahl der gezogenen Rollen (zwischen Mindestens und Höchstens), dazu jeder Zusatz auf "Darf" mit dem halben Wert. Empfohlen wird die Wolfszahl, deren Ziel diese Stärke am nächsten kommt (Gleichstand wie in der Logik). Das ist sofort berechnet, immer dasselbe für dieselbe Auswahl und steigt mit der Spanne nur an. Beispiel 20 Spieler: ohne Rolle 3 Wölfe (Abstand +3 zu 3 und -4 zu 4 Wölfen, also fast ein Gleichstand), schon eine durchschnittliche Rolle (etwa 1,5 Punkte) oder das Amulett kippt es auf 4; mit elf gezogenen Rollen 5. Nicht enthalten: Bonuspunkte für Rollenpaare unter den gezogenen Rollen. Ein erster Wurf mit Stichproben schwankte (Höchstens 10, 9, 8 empfahl 5, 4, 5) und ist ersetzt. `recommendVariableWerewolfCount` in der Logik von Codex bewertet weiter nur Muss-Rollen und dient als Rückfall.
- Werwolf, Anleitung und Rollentexte geprüft (We-01-58): Jede Aussage wurde mit dem Code und den Regeldokumenten abgeglichen und in Deutsch und Englisch nachgezogen. Neu oder korrigiert: Die Nacht nennt die ganze Reihenfolge (vorher stand "zuerst die Werwölfe", was nicht stimmte), die Todesfälle treten erst bei der Morgenauflösung ein, Hexe und Magier sehen das Wolfsopfer auch bei abgefangenem Angriff, das Amulett (wer es bekommen darf, kein Schutz für den neuen Träger, Verlust beim Tod), die Hammer-Strafe ist auch beim geheilten Bürgermeister nicht heilbar, die Alte Vettel darf auch ein Nachtopfer wählen, der Gerber gewinnt auch als Trunkenbold vor der Enthüllung, die Sitznachbarn des Ermittlers (links und rechts), die Wolfsempfehlung berücksichtigt gezogene Rollen und die Spanne (Höchstens mindestens 1).
- Hauptmenü Tabu und Werwolf: Der Einstellungs- beziehungsweise Konfigurationsknopf links neben "Spiel starten" ist jetzt blau (Variante `primary`) statt grau. Auch der Knopf für die Aufwachreihenfolge (Mond) links neben "Fertig" in der Werwolf-Konfiguration ist blau. Als Projektregel in `AGENTS.md` festgehalten, damit jedes weitere Spiel es gleich macht.
- Werwolf, Symbolsatz (We-01-59, Wunsch des Auftraggebers: vor dem eigentlichen Spiel alle Symbole festlegen, die die Fähigkeiten selbsterklärend zeigen): 34 Symbole in vier Gruppen. **Rollen** (Wolfskopf, Auge, geschlossenes Auge, Haus, Trankflasche, Zielscheibe, Daumen hoch, Schild, Bett, Herz mit Handschlag, Hantel, Pokal, Mikrofon aus, Krone, Geist, Zauberstab), **eigene Mittel** (Herz mit Plus, Totenkopf, Richterhammer, Zwei, Lupe, Zielscheibe mit Pfeil), **Zusätze** (Edelstein, Flasche) und **Zustände** (zwei Herzen, Pfote, Schild, Bett, Flasche, Herz mit Plus, Pflaster, Mikrofon aus, Pfeile, Grabstein); gleiche Bedeutung heißt gleiches Zeichen. Der Gerber hat den Pokal, damit der Totenkopf nur für Gift und Todeszauber steht. Der Wolfskopf ist "Wolf head" von Lorc (game-icons.net, CC BY 3.0), die übrigen Zeichnungen stammen aus Tabler Icons (MIT); beides in `THIRD_PARTY_NOTICES.md` und in der Legende genannt. Neue Dateien unter `src/presentation/werewolf/symbols/` (Zeichnungen, Katalog, Bauteil `WerewolfSymbol`); die Legende ist der vierte Reiter der Spielanleitung (Reiter etwas kleiner, damit vier nebeneinander passen). Dabei musste ein Typ in `tabooSetupModel.ts` vereinfacht werden (`TFunction`), weil die vielen Übersetzungsschlüssel eine Typprüfung dort überlasteten.
- Spieler-Reiter: Die Scrollleiste gilt nur noch für die Liste der Spieler. Erzähler, Eingabefeld, "Aus Spielerliste wählen" und das Zählfeld stehen fest oben (Baustein `TabPane` mit Kopf und scrollendem Inhalt, wie im Sitzplatz-Reiter und bei Tabu); die Seite scrollt dort nicht mehr als Ganzes.
- Feste Regel für Listen: Wo es mehrere gleiche Elemente gibt, scrollt nur die Liste, immer in ganzen Zeilen, sodass keine Zeile abgehackt angezeigt wird. Der Baustein `TabPane` hat dafür die Eigenschaft `wholeRows` (Höhe in ganzen Zeilen, Rest bleibt leer unter der Liste, Scrollen rastet an Zeilen ein, beim Ziehen einer Zeile ohne Einrasten); sie ist im Spieler- und im Sitzplatz-Reiter des Werwolfs eingeschaltet (bei 375x812 sechs beziehungsweise neun ganze Zeilen, keine abgeschnitten). In den Fenstern der Spielerliste macht das schon `useWholeRows`. Die Regel steht in der Merknotiz; weitere Listen in Tabu (Kartenliste, Kategorien) sind noch zu prüfen.
- Tabu, Spieler-Reiter: Auch hier scrollt nur noch die Liste der Spieler (in ganzen Zeilen, bei 375x812 sechs ganze Zeilen, keine abgeschnitten); "Letzte Spieler laden", "Spieler leeren", das Eingabefeld und "Aus Spielerliste wählen" stehen fest oben. Umgesetzt im gemeinsamen Baustein `PlayersSetup` (nutzt `TabPane` mit `wholeRows`), gilt also für alle Spiele mit der gemeinsamen Aufstellung.
- Sitzplatz-Reiter: Der eigene Info-Knopf neben "Sitzkreis anzeigen" ist weg; das "i" steht jetzt im Knopf "Sitzkreis anzeigen" am rechten Ende (wie bei den Optionen anderer Auswahlknöpfe) und öffnet die Erklärung der Sitzreihenfolge, der Knopf selbst den Sitzkreis. Der Knopf nutzt die ganze Breite.
- Die fertigen Logikänderungen von Codex sind übernommen (`stateMachine.ts` und die Tests `amulet`, `drunk`, `ruleAdditions`, `automaticSetup`): Das Amulett wird nur noch für Angriffe der Nacht (Wolf, Gift, Todeszauber) geprüft, Hammer, Abstimmung und Jägerschuss umgehen es, Liebeskummer löst keine Weitergabepflicht aus. Der Test `automaticSetup.test.ts` liest gespeicherte Prüfdaten; die fünf kleinen Dateien dazu (gesamt rund 0,5 MB) liegen jetzt unter `docs/simulations/`, die großen Simulationsdaten bleiben im Branch `game/werwolf`.
- Reine Logik in `business/games/werewolf/fixedConfiguration.ts` (Entwurf, Ansichtsmodell mit Sperrgründen "zu wenige Spieler / kein Platz / Kombination", Konfliktliste und Wolfsvorschlag; nichts wird still geändert). Ein Konflikt zeigt eine Meldung und einen Knopf "Wolfszahl N nehmen". Die Konfiguration braucht 6 bis 20 Spieler neben dem Erzähler.
- Noch nicht enthalten: der Umschalter fest/variabel (variable Konfiguration kommt später, We-01-32).
- Geprüft: 27 Logiktests, Oberflächentests (de/en), voller Testlauf (1233 Tests), tsc, eslint, Schichtenprüfung, Browserprüfung bei 375 px.

### Werwolf Schritt 1: Hauptansicht (19.11.2026)

- Neue Werwolf-Hauptansicht mit den Reitern Spieler und Sitzplätze: Spieler hinzufügen oder aus Gruppen wählen, Erzähler in einem Fenster wählen (der bisherige Erzähler setzt sich ans Ende der Sitzreihenfolge), Sitzreihenfolge per Ziehen am Griff oder mit den Pfeiltasten, Kreisübersicht mit festem Erzählerplatz unten mittig und Namensanzeige durch Gedrückthalten. Kurze Zusammenfassung mit Startbereitschaft (Erzähler, 6 bis 20 Spieler). Reine Logik in `business/games/werewolf/lineup.ts`, Texte auf Deutsch und Englisch. Der Startknopf zeigt vorerst nur einen Hinweis auf den nächsten Schritt.
- Korrekturen nach der ersten Prüfung: Zusammenfassungskasten entfernt, "Spiel starten" ist ohne Erzähler gesperrt; Erzählerfeld und -knopf gleich groß (Knopftext zweizeilig); der Sitzplatzreiter zeigt nur die Namensliste mit einem Knopf, der den Sitzkreis in einem eigenen Fenster öffnet; neuer gemeinsamer Baustein `OrderList` (Aussehen wie die Teamreihenfolge in Tabu, `TeamOrder` nutzt ihn jetzt ebenfalls); gedrückt gehaltene Kachel zeigt den ganzen Namen in einer hervorgehobenen Box; Sitz 1 liegt direkt links neben dem Erzähler, der nun Teil des Kreises ist.
- Zweite Korrekturrunde: Erzählerfeld und -knopf sind jetzt auch gleich hoch (ein Außenabstand der Reiterfläche verschob den Knopf); "Sitzkreis anzeigen" bleibt oben fest (nur die Namensliste scrollt, über den Baustein `TabPane`); der Hinweistext steht in einem Info-Fenster hinter einem i-Knopf rechts neben "Sitzkreis anzeigen".
- Dritte Korrekturrunde: Die großen Fenster "Spielerliste" und "Spieler wählen" haben jetzt dieselbe feste Größe (die Liste füllt sie mit ganzen Zeilen); der Sitzplatzreiter zeigt seinen Inhalt erst mit Spielern und Erzähler, sonst den Hinweis "Füge zuerst Spieler hinzu und lege einen Erzähler fest.". Geprüft: Unit-Tests, tsc, eslint, 68 e2e-Tests.
- Meldungen (Toasts) stehen in allen Spielen direkt über der Startleiste statt am Bildschirmrand, damit sie den Startknopf nicht verdecken (Startleiste meldet ihre Höhe über `--toast-lift`). Werwolf: "Spiel starten" ist immer drückbar; fehlen Spieler oder Erzähler, weist eine Meldung darauf hin.
- Das Info-Fenster der Sitzplätze zeigt zusätzlich ein Beispiel mit Zahlen (sechs Plätze und der Erzähler), damit sofort klar ist, wo Sitz 1 liegt und wohin die Zahlen laufen.
- Kopfzeile auf dem Handy: Knöpfe ohne Symbol und etwas kleinere Titelschrift, damit längere Spieltitel wie "Werwolf" nicht abgeschnitten werden.
- Geprüft: neue Tests für Logik und Oberfläche (de/en), Typen, Lint, Übersetzungsparität.

### Werwolf-Übergabe und Aufgabenabgleich (19.11.2026)

- Sämtliche Werwolf-Phasen/Aufgaben aus dem geprüften Spiel-Arbeitsordner übernommen; andere Spiele bewahrt. Fester manueller Einstieg We-03-62 abgeschlossen, 253 Tests bestanden. Gewinneransicht mit späterer Gestaltung festgehalten; aktuelle UI- und technische Übergabedokumente übernommen. Logikdateien sind dadurch nicht automatisch in diesen Checkout integriert.



### Hammer-Neuordnung dokumentiert (20.11.2026)

- Neue Vorgabe als We-03-63 geplant und technische Übergabe/Regeln/HTML aktualisiert. Umsetzung bleibt offen. Lokalen Werwolf-Logikstand für Commit vorbereitet; parallele UI-Arbeiten bewahrt.

## 2026-11-16

### Schwimmen geplant

- Schwimmen als Online-Spiel mit zwölf Aufgaben für Regeln, Spiellogik, Mehrspieler, Ansichten und Abnahme aufgenommen.

## 2026-11-15

### Neue Arbeitsregel: ein Branch pro Spiel

- Auf Wunsch des Auftraggebers wird **jedes Spiel in einem eigenen Branch entwickelt** (Annahme für den Namen: `game/<spiel-id>`). Zusammengeführt wird erst nach Freigabe. Die Regel steht in `AGENTS.md`. Bereits auf `main` liegende Tabu-Arbeit bleibt dort.

## 2026-11-14

### One-Pager: Reiter füllen den Bildschirm, nur der Reiterinhalt scrollt

- **Werwolf: Prüfung der Planung, Umsetzungsplan und Grundlage der Oberfläche (2026-11-19, `We-01-46`, `We-01-47`, Branch `game/werewolf-ui`):** Vor dem Bau der Oberfläche wurden Planung (`GAMEHUB_WERWOLF_UI.md`, Übergabe, Regeln) und Spiellogik geprüft; Ergebnis und ein Plan in neun Schritten stehen in `docs/GAMEHUB_WERWOLF_UI_PLAN.md`. **Logikprüfung:** ein Zufallsprüfstand mit 2559 Partien (6–20 Spieler, alle Rollen, Einstellungen und Gegenstände zufällig, in jedem Zustand auch unzulässige Ereignisse) endete jedes Mal regulär, ohne festhängenden Zustand und ohne Verletzung der geprüften Bedingungen; keine Fehler gefunden. **Beschlüsse des Auftraggebers:** „Zurück“ nimmt den zuletzt bestätigten Schritt zurück (Zustandsstapel, nichts wird neu gewürfelt); Tarnaufrufe nach dem Vorschlag der Spezifikation; ungültig gewordene Wolfswahl wird erklärt und mit einem Antippen korrigierbar, nie still geändert; Abbruch mit Rückfrage und zurück in die Hauptansicht; laufende Partie lokal speichern und fortsetzen; Werwölfe wählen jede Person außer sich selbst und anderen Werwölfen (Logik unverändert); der Leibwächter schützt sich nie selbst und nie zweimal dieselbe Person (Logik unverändert); Simulationstests aus dem Standardlauf; heller Tag und dunkle Nacht nur in der Spielansicht; Infotexte entwirft Claude, der Auftraggeber prüft. **Grundlage (Schritt 0):** Die geprüfte Logik von Codex (`src/business/games/werewolf`, Kalibrierskript) ist in den Branch `game/werewolf-ui` übernommen (kopiert, nichts zusammengeführt). Die langen Simulationstests (`balance.test.ts`, `simulation.test.ts`, über zehn Minuten) sind aus dem Standardlauf genommen und laufen mit `pnpm test:werewolf-simulation`; der Test mit dem 83-MB-Archiv wird übersprungen, wenn das Archiv fehlt (es liegt nicht im Repository). **Prüfung:** 1148 Tests bestanden (1 übersprungen) in etwa einer Minute, Coverage-Schwellen erfüllt, `tsc`, `eslint`, Format, Schichtprüfung und Übersetzungsprüfung sauber. Noch keine Oberfläche; „Spielen“ bei Werwolf bleibt in der veröffentlichten Version gesperrt.
- **Anleitung zur Installation als App im GameHub (2026-11-19, `Al-11-01`, Branch `gamehub/install-guide`):** Nach dem Vorbild des Reiseplaners (`trip-planner`) gibt es in den **Einstellungen** (Zahnrad in der Kopfzeile, erreichbar überall in der App) den Knopf **„App installieren“**. Er öffnet ein Fenster mit den Reitern **Android, iPhone / iPad und Computer**; der Reiter des Geräts in Benutzung ist vorgewählt (Erkennung über `userAgent`, auch ein iPad, das sich als Mac ausgibt). Android: Seite in Chrome öffnen, Menü (drei Punkte) antippen, „App installieren“. iPhone und iPad: in Safari „Teilen“, „Zum Home-Bildschirm“, dazu der Hinweis, dass die Daten nur bei einer App auf dem Home-Bildschirm dauerhaft bleiben. Computer: Installieren-Symbol in der Adressleiste von Chrome oder Edge. Wo der Browser die Installation anbietet (`beforeinstallprompt`), gibt es zusätzlich **„Automatisch installieren“**; sonst erklärt eine Meldung, dass der Browser sie gerade nicht anbietet. Ein Tipp zu WhatsApp („Im Browser öffnen“) steht darunter. Der Knopf **verschwindet**, wenn die App schon installiert läuft (Anzeigemodus `standalone`) oder während des Besuchs installiert wurde. **Technik:** Infrastruktur `installPrompt.ts` (Browser-Ereignisse werden schon beim Seitenstart gefangen, weil der Browser das Angebot nur einmal und früh meldet), `InstallProvider` und `useInstall` in der Präsentation, `InstallGuide` im Fenster der Einstellungen. Texte in Deutsch und Englisch. **Annahme:** Der Knopf steht in den Einstellungen und nicht in der Kopfzeile wie im Reiseplaner, weil die Kopfzeile am Handy schon voll ist und die Einleitung der Spielauswahl am Handy ausgeblendet wird. **Prüfung:** 416 Unit-Tests der betroffenen Teile (neu: Erkennung, Angebot und Installation, Fenster mit Reitern in beiden Sprachen, Verschwinden nach der Installation), 68 Browserprüfungen (die Prüfung der gleichen Größen umfasst jetzt auch die Einstellungen und das Installationsfenster), `tsc` und `eslint` sauber. Das automatische Installieren wurde nicht auf einem echten Gerät ausprobiert.
- **Browserprüfung der gleichen Größen auf GitHub korrigiert (2026-11-19):** Die Prüfung `language-parity.spec.ts` scheiterte auf dem Linux-Rechner von GitHub, weil dort eine breitere Ersatzschrift gilt (Kopfzeilenknopf Deutsch 142 gegenüber Englisch 128 bis 131 Pixel; Spielmodus-Knöpfe Englisch zweizeilig 66 Pixel gegenüber Deutsch einzeilig 56 Pixel). Nachgestellt mit der Ersatzschrift Verdana (gleiche Zahlen). **Behoben:** Kopfzeilenknöpfe mit Namen haben eine Mindestbreite von 9 rem (die längste Beschriftung passt auch in den breitesten Schriften, die ein Gerät benutzt, zum Beispiel auf Android), und die Knöpfe mit Info-Knopf (Spielmodus) sind wie die Kategorien für zwei Zeilen hoch. **Prüfung:** 68 Browserprüfungen bestanden, mit der normalen Schrift und mit Verdana.
- **README erneuert (2026-11-19):** Die README beschrieb noch ein „geplantes“ Projekt, den Stand der ersten Umgebungsprüfung und den ersten CI-Lauf vom 10. November. **Jetzt:** Link auf die veröffentlichte Seite (`https://erik513.github.io/GameHub/`, geprüft: erreichbar), Spieleübersicht mit Stand (Tabu spielbar mit drei Modi, Werwolf in Entwicklung, übrige geplant), Funktionen (Spielerliste mit Gruppen, zwei Sprachen, Handy- und PC-Layout, Offlinebetrieb), tatsächlicher Technikstand, Dokumentationsliste mit den vorhandenen Dokumenten, Befehle und der Ablauf der CI mit Veröffentlichung. **Nachgefragt:** Falls ein bestimmter Teil des Links gemeint war, bitte nennen; die Adresse selbst stimmt.
- **Alle Bedienelemente in Deutsch und Englisch gleich groß (2026-11-19, `gamehub/language-parity`):** Verglichen wurde die Größe jedes Bedienelements an derselben Stelle in beiden Sprachen auf den Handy-Bildschirmen. **Gefunden und behoben:** (1) Textknöpfe in der Kopfzeile („Player list“ 116 px und „Spielerliste“ 124 px, „Rules“ 87 px und „Spielregeln“ 126 px) haben jetzt dieselbe Mindestbreite von 8 rem. (2) Die Reiter („Teams“, „Spieler“, Einstellungen und Karten) sind gleich breit statt nach der Länge ihres Namens. (3) Die Kategorienknöpfe sind in beiden Sprachen für zwei Zeilen hoch (einzeilige englische Namen waren 56 px, zweizeilige deutsche 66 px). Beschriftungen, die selbst nur Text sind (Titel mit Info-Knopf), bleiben so lang wie ihr Text. **Neue Browserprüfung** `language-parity.spec.ts`: Besucht Spielauswahl, Spielerliste (Gruppen und Gruppe), Aufstellung, Einstellungen und Kategorien in beiden Sprachen und prüft, dass jedes Bedienelement dieselbe Breite und Höhe hat (geprüft, dass sie die alten Unterschiede findet). **Nicht abgedeckt:** weitere Bildschirme (Runde, Übersichten, Kartenverwaltung am PC) haben die Handy-Layoutprüfungen mit Vergleich bestanden; neue Bildschirme müssten in die Prüfung aufgenommen werden. **Prüfung:** 68 Browserprüfungen bestanden, `tsc` und `eslint` sauber.
- **Tabu am Handy getestet: vier Korrekturen (2026-11-19, Branch `game/taboo`):** **(1) Team-Anzeige und „Runde starten“ sind ein Bedienelement:** Beim Gedrückthalten schrumpfte nur der Knopf, nicht die Anzeige des Teams darüber. Jetzt schrumpft die ganze Leiste zusammen (`:has(... :active)` auf der Startleiste), der Knopf schrumpft nicht noch einmal, und ein Tipp auf die Team-Anzeige löst den Knopf aus (die Anzeige nimmt selbst keine Tipps, der Knopf reicht per Fläche darüber). Browserprüfung: Gedrückthalten auf der Anzeige, die Leiste ist auf 0,97, der Knopf ohne eigene Verkleinerung, Loslassen startet die Runde. **(2) Zu viele schwere Karten:** Der Kartenpool ist ausgewogen (je 300 leichte, mittlere und schwere Karten pro Sprache); die Verzerrung kam vom Merken gespielter Karten: waren die leichten schon gespielt, blieben vor allem schwere übrig. Neu: `interleaveByDifficulty` (Business) füllt eine Schwierigkeit mit zuvor gespielten Karten auf, bis sie so groß ist wie die größte, lässt die Schwierigkeiten reihum abwechseln (Reihenfolge je Runde zufällig) und spielt je Schwierigkeit zuerst die ungespielten Karten; bei nur einer Schwierigkeit ändert sich nichts. **(3) „Spiel beenden“ ist rot:** auf der Pausenkarte (`TabooEndGameButton`) und in der Kopfzeile (`AppShell`) vor dem Tippen schon rot, nicht nur nach dem ersten Tippen. **(4) Konfetti ruckelt:** weniger Teilchen (110 auf 70), nur die Lage wird animiert (kein Ausblenden jedes Teilchens, sie verlassen den Bildschirm), jedes Teilchen hat von Anfang an eine eigene Ebene (`will-change`), die Schicht ist vom Rest der Seite abgetrennt (`contain: strict`). **Annahme:** ob das Ruckeln am Handy damit weg ist, muss der Auftraggeber prüfen. **Prüfung:** 896 Unit-Tests und 66 Browserprüfungen bestanden, `tsc` und `eslint` sauber.
- **Spielerliste: neue Spieler stehen alphabetisch (2026-11-19, nicht Tabu-spezifisch, Branch `gamehub/player-sorting`):** Beim Hinzufügen eines Spielers zu einer Gruppe wurde der Name hinten angehängt; die Namen einer Gruppe bleiben jetzt immer alphabetisch (Groß-/Kleinschreibung egal), auch beim Übernehmen alter Spieler (`playerGroups.ts`). Test ergänzt.
- **Neues Logo (2026-11-19):** Der Auftraggeber hat Vorschlag **E „Fliesenraster“** gewählt: vier abgerundete Kacheln in zwei Blautönen (Blau wie Tabu, `#5873d6` und `#86a1ff`) auf dunklem Grund, eine Kachel mit dunklem Abspielzeichen; flach und schlicht, als Bild für die vielen Minispiele von GameHub. **Eingesetzt** als App-Symbol und Tab-Symbol (`public/gamehub-icon.svg`, auch im Manifest) und **links neben dem Namen „GameHub“** in der Kopfzeile der Spielauswahl (`BrandMark`, für Screenreader verborgen; in einem Spiel steht weiter nur dessen Name). Das alte Logo (gelbes Quadrat mit G) ist ersetzt. **Prüfung:** 320 Tests der Oberfläche, `tsc` und `eslint` sauber.
- **Spielerliste: Papierkörbe auf einer Linie, Feld „Neuer Spieler“ oben (2026-11-19):** Gemeldet vom Auftraggeber am Handy. **(1) Ausrichtung:** Die Papierkörbe der Spieler in einer Gruppe endeten einige Pixel weiter rechts als der Papierkorb der Gruppe oben, weil die Liste den Platz der Scrollleiste annahm (am Handy 0, am PC je nach System 10 bis 15 Pixel). **Jetzt** misst das Fenster die tatsächliche Breite der Scrollleiste (`useScrollbarWidth`) und verschiebt die Liste genau darum; auf einem Handy mit überlagerter Leiste ist es 0. Eine breite Leiste ragt nicht mehr aus dem Fenster (die Lücke zwischen Zeilen und Leiste schrumpft, `scrollbar-width: thin`). Gemessen: am Handy und am PC enden alle Papierkörbe auf derselben Linie. **(2) „Neuer Spieler“ oben:** In einer Gruppe stehen jetzt **Zurück und Papierkorb der Gruppe, darunter das Feld „Neuer Spieler“ mit dem grünen Knopf**, dann die Meldungszeile (unter dem Feld) und die Namen. Die Liste der Gruppen behält „Neue Gruppe“ unten. Das Fenster bleibt in beiden Ansichten gleich groß. **Prüfung:** 370 Unit-Tests und 64 Browserprüfungen (Produktionsbau) bestanden, `tsc` und `eslint` sauber.
- **Handy: Seitenhöhe, Scrollleiste und gesperrte Spiele (2026-11-19):** Gemeldet vom Auftraggeber am echten Handy. **(1) Seitenhöhe:** Die Seiten mit Reitern (und die Spielauswahl) waren mit `100dvh` auf die Höhe gesetzt; auf manchen Handys ist das nicht die sichtbare Höhe (Browserleisten, Browser ohne `dvh`), die Seite ließ sich scrollen, und die obere Leiste verschwand. **Jetzt** ist die Hülle der App an den sichtbaren Bildschirm geheftet (`position: fixed; inset: 0`), die Seite selbst kann nicht scrollen (`overflow: hidden` auf `html`, kein `min-height` auf `body`), und nur der Reiterinhalt scrollt; Kopfzeile und unterer Knopf bleiben immer sichtbar. Die Layoutprüfung versucht jetzt auf diesen Seiten zu scrollen und meldet es. **Annahme:** Die Ursache konnte ich am Computer nicht nachstellen (dort stimmen die Höhen); die Korrektur beruht auf der Erklärung mit der Bildschirmhöhe und muss am echten Handy bestätigt werden. **(2) Scrollleiste:** Die Leiste der Spielliste liegt jetzt im Rand am Bildschirmrand statt auf den Karten. **(3) Gesperrte Spiele:** Spiele, die nicht geöffnet werden können (geplant, oder in Entwicklung in der veröffentlichten Version), sind dunkler, mit gestricheltem Rand und blassem Text (`data-locked`). **(4) Neues Logo:** Vorschläge sind gemacht, die Auswahl steht aus. **Prüfung:** 320 Tests der Oberfläche, 64 Browserprüfungen gegen den Produktionsbau, `tsc` und `eslint` sauber.
- **Startseite: Spielstatus und Knopf „Spielen“ (2026-11-19):** Ein **spielbares Spiel trägt keine Marke mehr** (nichts statt „Spielbereit“); die Box von **Tabu ist leicht blau** getönt (Spielfarbe `blue`, `data-playable`). **Spiele in Entwicklung** („In Entwicklung“, derzeit Werwolf) und **geplante Spiele** haben weiter ihre Marke. **Der Knopf „Spielen“ ist in der veröffentlichten Version nur bei fertigen Spielen aktiv** (`availability: available`); ein Spiel in Entwicklung ist dort gesperrt wie ein geplantes und wird erst klickbar, wenn es fertig ist und als `available` veröffentlicht wurde. Auf dem Entwicklungsserver (`DEV`) bleibt ein Spiel in Entwicklung klickbar, damit man daran arbeiten kann (`isGameOpenable` in `gameCatalog.ts`); auch der Direktaufruf `#/games/<spiel>` öffnet in der veröffentlichten Version keines. **Prüfung:** 370 Tests (neu: Marke, Tönung und gesperrter Knopf in der veröffentlichten Version), 64 Browserprüfungen gegen den Produktionsbau, `tsc` und `eslint` sauber.
- **Browserprüfung auf GitHub (2026-11-19):** Der Lauf „Playwright E2E“ auf `main` scheiterte an vier Handyprüfungen, die auf Windows bestehen. **Ursache der Layoutprüfungen „Gegen die Zeit“ (kleinstes Handy):** Auf dem Linux-Rechner von GitHub fehlen die Schriften „Aptos“ und „Arial Narrow“; die Ersatzschrift ist deutlich breiter. Nachgestellt mit einer breiten Ersatzschrift (Verdana): In der deutschen Endplatzierung wurde die Zeile „Team 2: ausgeschieden · 0:00“ abgeschnitten, und die Karte des laufenden Zuges mit allen Zeitkonten scrollte um 5 Pixel. **Behoben:** Die letzte Spalte der Ergebniszeilen darf schrumpfen und umbrechen (`kit-result.css`), und bei kurzen Bildschirmen mit der Zeile der Zeitkonten sind die verbotenen Wörter etwas niedriger (`taboo.css`). Handy unverändert, wenn der Text passt. **Zurück-Taste (Wettlauf im Test):** Die beiden Tests „Zurück-Taste fragt vor dem Verlassen eines laufenden Tabu-Spiels“ scheiterten auf GitHub nur im Handyprojekt. Der Hinweis des CI-Laufs (`github`-Reporter) zeigte: Nach „Spiel beenden“ nimmt die App den Schutzeintrag im Verlauf (`useSystemBack`) erst einen Moment später per Zeitgeber weg; das nächste „Zurück“ des Tests lief auf dem langsameren Linux-Rechner in diesen Eintrag hinein und verließ das Spiel. **Behoben im Test:** Er wartet nun, bis der Schutzeintrag oben liegt, bevor er „Zurück“ drückt, und bis er weg ist, bevor er im Verlauf weitergeht (an der App ändert sich nichts). Lokal 24 von 24 Läufen bestanden (je zwei Sprachen und Projekte, 6 Wiederholungen); die Bestätigung auf GitHub steht aus.
- **Spielstatus auf der Startseite (2026-11-19):** Tabu trägt nicht mehr „In Entwicklung“, sondern „Spielbereit“ (`availability: available`); **Werwolf** ist jetzt „In Entwicklung“ (`availability: preview`, der Knopf „Spielen“ ist aktiv und öffnet die Entwicklungsvorschau, bis das Spielmodul registriert ist). Die Sortierung bleibt: spielbereit, in Entwicklung, geplant, je Gruppe alphabetisch (Tabu, Werwolf, dann Imposter, Liar’s Bar, Schwimmen, Wortbombe). Angepasst: `gameCatalog.ts`, Unit-Tests (`pages.test.tsx`, `App.test.tsx`) und die Browserprüfung der Spielauswahl. **Prüfung:** 330 Tests der Oberfläche, 18 Browserprüfungen der App, `tsc` und `eslint` sauber.
- **Spielergruppen (2026-11-18/19, `Al-09-08`):** Die Spielerliste besteht jetzt **nur noch aus Gruppen** (höchstens 8, zum Beispiel Freundeskreise); **es gibt keine lose Spielerliste mehr**. Entscheidungen des Auftraggebers: **Jeder Spieler ist in mindestens einer Gruppe**, **ein Spieler darf in mehreren Gruppen sein**, und **Spieler werden nur innerhalb einer Gruppe hinzugefügt** (wer Spieler anlegen will, legt zuerst eine Gruppe an). Die Bedienung ist bewusst schlicht: **eine Auflistung aller Gruppen, ein Klick auf eine Gruppe zeigt die Spieler dieser Gruppe.** **Verwalten** (Fenster „Spielerliste“, keine Reiter mehr): Die Ansicht „Gruppen“ listet alle Gruppen mit der Zahl ihrer Spieler, „Neue Gruppe“ legt eine an. In einer Gruppe stehen oben „Zurück“ (mit Pfeil und Gruppenname) und ein Papierkorb zum Löschen der Gruppe (zweites Tippen nötig), darunter das Feld „Neuer Spieler“ und die Namen der Gruppe, jeder mit Entfernen-Knopf (zweites Tippen nötig). Ein Name, der schon in einer anderen Gruppe steht, ist dieselbe Person und wird nur zusätzlich in die Gruppe aufgenommen. Wer die letzte Gruppe verlässt oder dessen einzige Gruppe gelöscht wird, verschwindet aus der Liste. **Auswählen** („Aus Spielerliste wählen“): zuerst nur die Gruppen (mit „gewählt/alle“), ein Klick zeigt die Spieler der Gruppe zum Abhaken; „Alle wählen“ und „Keinen wählen“ gelten für die gezeigten Spieler; die Wahl bleibt beim Zurückgehen erhalten und gilt in jeder Gruppe, in der der Spieler steht. **Fenstergröße:** Das Fenster ist in allen Ansichten gleich groß (jede Ansicht hat denselben Aufbau, die Liste zeigt immer gleich viele ganze Zeilen, `useWholeRows` mit fester Zeilenzahl); die Bedingung prüft die Browserprüfung. **Bestehende Daten:** Spieler, die vor den Gruppen gespeichert wurden, kommen beim Start in eine Gruppe „Spieler“ („Players“), damit niemand verloren geht. **Technik:** Business `playerGroups.ts` (`PlayerBook`, Spieler zu Gruppen hinzufügen und entfernen, Gruppen löschen, Übernahme alter Spieler, Prüfung gespeicherter Daten) mit Port `PlayerGroupStore`, Ablage im Browserspeicher unter `gamehub.playerGroups` (`localStoragePlayerGroupStore.ts`), UI-Bausteine `GroupButtons` und `PlayerChecklist`. **Prüfung:** 889 Unit-Tests bestanden (neu: Gruppenlogik, Speicher, Oberfläche in Deutsch und Englisch), 64 Browserprüfungen bestanden (mit frisch gebautem Stand; ein veralteter Vorschau-Server auf Port 4173 hatte frühere Läufe verfälscht und wurde beendet), tsc, eslint und Schichtprüfung sauber. Nicht umgesetzt: Gruppen umbenennen (löschen und neu anlegen).
- **PC-Layout fertig: Übersichten, Ergebnis und Kartenverwaltung (2026-11-18, `Al-08-02-02`, `Al-08-02-03`, damit `Al-08-02` und `Al-08-01` erledigt):** **Übersichten und Endstand** (`ScoreScreen`) behalten ab 1024 px die Reihenfolge des Handys: oben die Liste der Stände (mit dem Reiter „Letzte Karten“ wie bisher), **unten die Spielnavigation** (Knopf „Runde starten“ mit der Person, die dran ist); die Ansichtsnavigation (Reiter) bleibt oben. Die Seite ist höchstens 64 rem breit und mittig (zuerst waren zwei Spalten mit den Aktionen rechts gebaut, am 2026-11-18 auf Wunsch zurückgenommen). Dafür umschließt `ScoreScreen` seine Teile mit einem Block (`kit-score-screen__main`), der am Handy nur gruppiert (`display: contents`), damit sich dort nichts ändert. Die **Kartenverwaltung** zeigt ab 1024 px **beide Teile nebeneinander** (links Kategorien und Karten, rechts das Formular „Karte hinzufügen“) statt in zwei Reitern; die Reiterknöpfe entfallen dort, ihre Namen beschriften die Bereiche weiter. **Nicht gebaut** gegenüber dem Entwurf (`docs/GAMEHUB_PC_LAYOUT.md` 6.3 und 6.4): der Reiter der Korrektur steht weiter als Reiter neben der Liste, und die Kategorien sind weiter eine Liste, die man aufklappt (kein Master-Detail mit Suche und Pfeiltasten in der Liste); das wäre eine Erweiterung. **Prüfung:** Die PC-Layoutprüfung (18 Prüfungen) prüft nun auch die beiden Spalten, und der Test „Reiter vom Startknopf verdeckt“ gilt nur bei Überlappung. **Handy unverändert:** Die Handy-Layoutprüfungen bestehen, und der Stilvergleich zeigt für die Übersichten, Ergebnisse und Einstellungen gleiche Stile; nur die laufenden Züge haben zusätzliche, am Handy versteckte Elemente (Seitenfeld, Tastenzeile), und das Regelfenster den neuen Abschnitt „Stechen“. **Stand von `Al-08`:** `Al-08-01` bis `Al-08-05` sind erledigt; offen bleiben nur die PC-Layouts der übrigen Spiele (eigene Aufgaben je Spiel).
- **Laufende Runde am PC mit Tastenkürzeln (2026-11-18, `Al-08-02-01` und `Al-08-03`):** **Ansicht (ab 1024 px):** Die Karte steht groß in der Mitte (Bereich höchstens 64 rem breit und mittig), darüber die Uhr, darunter die **drei Antwortknöpfe nebeneinander** (Verbotenes Wort, Überspringen, das breitere Richtig), rechts ein **Seitenfeld mit dem Stand aller Teams**, das Team am Zug ist markiert: bei Klassisch die **Punkte**, bei „Auf Zeit“ die **bisherigen Gesamtzeiten**, bei „Gegen die Zeit“ die **Zeitkonten** (das Konto des Teams am Zug läuft live herunter, ausgeschiedene sind durchgestrichen; die Leiste über der Karte entfällt am PC). Karte, Uhr und Knöpfe liegen gemeinsam auf dem Bildschirm, nichts scrollt (PC-Layoutprüfung bei 1024 × 768, 1280 × 800 und 1920 × 1080). Am Handy bleibt die Runde unverändert (kein Seitenfeld, keine Tasten). **Tastenkürzel:** Leertaste oder Enter = **Richtig**, **S** = Überspringen, **V** = Verbotenes Wort, **P** = Pause und Weiter; die Tasten stehen an den Knöpfen (nur am PC) und sind für Screenreader mit `aria-keyshortcuts` genannt. Ein Kürzel tut genau, was der Knopf tut, und nichts bei gesperrtem Knopf (zum Beispiel ohne Ersatzkarte), ohne Überspringen, wenn es aufgebraucht ist, und in der Pause (dort gilt nur P). Es wirkt nicht in Eingabefeldern, bei offenem Fenster, mit gehaltener Strg-, Alt- oder Meta-Taste und bei gehaltener Taste; Leertaste und Enter überlassen sie einem Knopf mit Fokus. **Technik:** Neuer gemeinsamer Baustein `TabooTurnActions` (die drei Knöpfe samt Kürzeln) ersetzt die vier eigenen Knopfblöcke von Klassisch, Auf Zeit, Gegen die Zeit und Stechen; `TabooTurnSidebar` ist das Seitenfeld; Texte `tabooShortcuts` und `tabooSidebar` in Deutsch und Englisch. **Tests:** Komponententests für den Baustein (Tasten, gesperrte Knöpfe, Pause, Hinweise in beiden Sprachen) und ein Durchlauf mit der Tastatur durch einen Zug bei „Gegen die Zeit“; die Browsertests am PC prüfen die Karte jetzt innerhalb der Karte (das Seitenfeld nennt die Teams ebenfalls).
- **Tabu-Einrichtung am PC (2026-11-18, `Al-08-02`):** Ab **1024 px** Fensterbreite stehen **die Aufstellung links und die Spieleinstellungen rechts nebeneinander**, darunter ein **breiter Startknopf** über die ganze Breite (Inhalt höchstens 80 rem breit und mittig, `--desktop-width`). Der Knopf „Spieleinstellungen“, „Fertig“ und der Wechsel zwischen den beiden Ansichten entfallen am PC; die Reiter „Spieleinstellungen“ und „Kategorien“ bleiben im rechten Bereich. Unter 1024 px bleibt alles wie am Handy (zwei Ansichten, Knopf, „Fertig“). **Technik:** `TabooSetup` fragt `useIsDesktop` und zeigt Aufstellung und Einstellungen gleichzeitig (`data-split`); die Anordnung macht allein das CSS (`.taboo-setup[data-split="true"]` als Raster, die Ansicht der Aufstellung gibt ihre Teile mit `display: contents` an das Raster); der Zustand der Einstellungen bleibt beim Wechsel der Fensterbreite erhalten, weil das Formular immer eingebunden bleibt; die Rückpfeil-Taste der Kopfleiste, der Fokus auf den Reiter und die Meldungen der Einstellungen gelten nur noch, wenn die Einstellungen eine eigene Ansicht sind. **Tests:** Die bestehenden Browsertests (`app`, `taboo-game`) gehen mit `e2e/setupSteps.ts` in beiden Layouts den Weg eines Spielers (Einstellungen öffnen und schließen nur, wenn es den Knopf gibt); die PC-Layoutprüfung prüft die Einrichtung nebeneinander bei 1024, 1280 und 1920 px in beiden Sprachen (bei der Prüfung „Reiter vom Startknopf verdeckt“ zählen nur sichtbare Leisten); die Handy-Prüfungen und alle Unit-Tests bestehen unverändert. Die Handy-Stile ändern sich nicht: alle neuen Regeln stehen in `@media (min-width: 64rem)`.
- **Bausteine für das PC-Layout (2026-11-18, `Al-08-04`):** Neue Bausteine im `game-kit` (`src/presentation/game-kit/`): **`useIsDesktop`** (Breite ab 64 rem = 1024 px laut `desktopMediaQuery`, folgt der Fensterbreite; ohne `matchMedia` falsch), **`SplitScreen`** (zwei Bereiche nebeneinander mit der Hauptaktion über die ganze Breite darunter, eine Seite ohne Seitenscrollen, jeder Bereich scrollt selbst; darunter stapeln sich die Bereiche), **`ShortcutHint`** (zeigt die Taste am Knopf, nur ab 64 rem sichtbar, für Screenreader versteckt) und **`useShortcuts`** mit `duplicateShortcutKeys` (Tastenkürzel einer Ansicht: ruhen bei Eingabefeldern, offenem Fenster, gehaltener Strg-, Alt- oder Meta-Taste und gehaltener Taste; Leertaste und Enter überlassen sie einem Knopf oder Link mit Fokus; Buchstaben ohne Beachtung der Groß- und Kleinschreibung; `enabled` schaltet alle aus; verhindert das Scrollen durch die Leertaste). Stile in `kit-desktop.css` (nach `kit-setup.css` importiert). Noch **verwendet kein Spiel** die Bausteine; unter 1024 px ändert sich nichts. Tests: 13 Komponententests (Breite folgt dem Fenster, beide Bereiche und Fußleiste, Hinweis, doppelte Tasten, alle Regeln der Kürzel).
- **PC-Layoutprüfung (2026-11-18, `Al-08-05`):** Neue Prüfung `e2e/desktop-layout.spec.ts` neben der Handy-Prüfung: Sie läuft nur im Desktop-Projekt bei **1024 × 768, 1280 × 800 und 1920 × 1080**, in **Deutsch und Englisch** (18 Prüfungen) und geht dieselben Abläufe durch wie die Handy-Prüfung: Spielauswahl, Einstellungen, Aufstellung, Regeln, Einrichtung, Karteneinstellungen, Übersicht, laufende Runde, Pause, Rückblick, Endstand; „Auf Zeit“; „Gegen die Zeit“ mit automatischem und manuellem Teamwechsel; Kartenverwaltung. **Geprüft wird (PC-Regeln):** keine waagerechte Scrollleiste; keine Seite, die als Ganzes scrollt, obwohl sie eine Seite ist; Inhalt höchstens 80 rem (1280 px) breit und mittig; in der Runde liegen **Karte, Uhr und Antwortknöpfe gemeinsam auf dem Bildschirm** und nichts scrollt; Startknopf erreichbar und nichts verdeckt; Fenster passen auf den Bildschirm; Knöpfe haben einen Namen und liegen auf dem Bildschirm; kein abgeschnittener Text. Die Texte der Handy-Prüfung liegen jetzt gemeinsam in `e2e/layoutLabels.ts`; die Stilvergleichsdateien (`STYLE_SNAPSHOT_DIR`) enthalten auch die PC-Ansichten. **Befund und Behebung:** Die Prüfung fand gleich einen echten Fehler: Bei 1024 × 768 lief die Karte bei „Gegen die Zeit“ mit der Teamleiste über (368 statt 342 px). Vorläufig ist die Leiste nur bei niedrigen PC-Fenstern (`min-width: 64rem` und `max-height: 50rem`) kompakter; die Handy-Größen bleiben unberührt. Die Seitenleiste des PC-Layouts (`Al-08-02-01`) ersetzt diese Leiste später.
- **PC-Layout: Entwurf (2026-11-18, `Al-08-01` in Arbeit, Branch `gamehub/pc-layout`):** Der Entwurf steht in `docs/GAMEHUB_PC_LAYOUT.md`. **Entscheidungen des Auftraggebers:** PC-Layout **ab 1024 px**, darunter bleibt die Handy-Spalte (auch auf Tablets); Einrichtung am PC **nebeneinander** (links Aufstellung, rechts Einstellungen, darunter ein breiter Startknopf); die laufende Runde ist am PC mit **Tastenkürzeln** bedienbar (Leertaste oder Enter = Richtig, S = Überspringen, V = Verbotenes Wort, P = Pause, mit Anzeige an den Knöpfen); die **Spielauswahl bleibt die schmale Spalte**. Der Entwurf legt außerdem Bausteine im `game-kit` (zwei Bereiche, Kürzel-Hinweis, `useShortcuts`), die Tabu-Ansichten am PC (Einrichtung, Runde mit Seitenleiste, Übersicht und Ergebnis, Kartenverwaltung als zwei Spalten) und die Prüfung (neue PC-Layoutprüfung in drei Größen und beiden Sprachen, Stilvergleich der Handy-Größen) fest. **Neue Aufgaben:** `Al-08-03` (Tastenkürzel), `Al-08-04` (Bausteine), `Al-08-05` (PC-Layoutprüfung). Es wurde noch nichts an der Oberfläche geändert. **Außerdem:** `scripts/sync-dashboard.mjs` kommt jetzt auch mit Windows-Zeilenenden im Dashboard zurecht (ein Checkout hatte sie geändert und das Skript brach ab).
- **Stechen im Regelfenster erklärt (2026-11-18, `Ta-10-11`):** Auf Wunsch des Auftraggebers wird das Stechen im Regelfenster von Tabu **nicht mehr in einem eigenen Fenster** erklärt, sondern **in der Ansicht selbst**: Es gibt einen neuen Abschnitt **„Stechen“** (zwischen „Spielmodi“ und „Einstellungen“) mit allen Regeln: wann es gespielt wird, drei Karten in höchstens 90 Sekunden, verbotenes Wort zählt als falsch und bringt eine neue Karte, einmal überspringen, die meisten Karten gewinnen und dann die kürzeste Zeit, und dass sich das Stechen in den Einstellungen ausschalten lässt. Der Verweis „Stechen“ im Absatz zu Klassisch (der das Fenster öffnete) und sein Stil `.kit-link-button` sind entfernt, ebenso der Text `tabooMode.tiebreakRule`. Der Info-Knopf an der Einstellung „Stechen bei Gleichstand“ bleibt und erklärt nur diese Einstellung. Tests: Das Regelfenster hat sechs Abschnitte, ein Test prüft in beiden Sprachen, dass das Stechen darin steht und kein Verweis weg führt.
- **Layout für Telefone mit 320 Pixel Breite (2026-11-18, `Al-10-10`):** Alle Ansichten von Tabu passen jetzt auch auf einem winzigen Telefon (**320 × 568**), das bisher nicht geprüft wurde. **Prüfung:** Die Layoutprüfungen (Aufstellung, Einstellungen, Zug, Pause, Übersicht, Endstand, Stechen, Auf Zeit, Gegen die Zeit mit und ohne automatischen Teamwechsel, Kartenverwaltung, jeweils in Deutsch und Englisch) laufen jetzt auf **drei Größen**: 320 × 568, 360 × 640 und 412 × 915 (16 statt 8 Prüfungen). **Befunde bei 320 × 568 und Behebung:** (1) Die **pausierte Karte** war mit vier Knöpfen zu hoch (Klassisch 310 statt 244 px; Stechen und Auf Zeit je 2 px): Auf sehr niedrigen Bildschirmen (`max-height: 36rem`) liegen jetzt „Weiter“ und „Spiel beenden“ über die ganze Breite und die Knöpfe dazwischen teilen sich eine Zeile. (2) Die **Karte mit der Teamleiste** (Gegen die Zeit, automatischer Wechsel) lief über (244 statt 186 px): Auf sehr niedrigen Bildschirmen sind die Zeitanzeige (2,5 statt 3,5 rem), die Leiste, die Abstände der Zeilen und die Knöpfe der Antworten (3 rem) etwas kompakter. Die Kopfleiste, die Spielkarte der normalen Runde und alle übrigen Ansichten hatten bei 320 px keinen Befund mehr (der alte Befund B3 war durch spätere Änderungen schon behoben). Bei 360 × 640 und größer ändert sich nichts (Stilvergleich der 135 Ansichten, nur der Zustand „Maus über dem Knopf“ der Prüfung weicht ab). **Prüfwerkzeug:** Die Prüfung wählt Spielmodus und Teamwechsel jetzt direkt am Eingabefeld, weil auf 320 px der Info-Knopf genau in der Mitte der schmalen Auswahl liegt und ein Klick in die Mitte das Info-Fenster öffnen würde.
- **Fokusführung beim Ansichtswechsel (2026-11-18, `Al-10-09`):** Beim Wechsel der Ansicht geht der Fokus nicht mehr verloren. Vorher blieb er nach dem Druck auf einen Knopf auf der Seite selbst (`BODY`), weil der Knopf mit der alten Ansicht verschwand; Tastatur- und Screenreader-Nutzer begannen bei jedem Wechsel oben. **Jetzt** bekommt die neue Ansicht den Fokus (`useFocusOnShow` im `game-kit`: Ansicht mit `ref` und `tabIndex={-1}`): Spielauswahl, Aufstellung, Übersicht und Endstand (`ScoreScreen`), Verwaltung (`ManageScreen`) und die laufenden Züge (Klassisch, Auf Zeit, Gegen die Zeit, Stechen); beim Öffnen der Spieleinstellungen bekommt der **gewählte Reiter** den Fokus (dort funktionieren die Pfeiltasten). Ein Screenreader sagt so den Namen der neuen Ansicht an („Rundenübersicht“, „Laufende Runde“, „Aufstellung“). **Der Fokus wird nur bewegt, wenn er verloren war** (auf der Seite, auf etwas, das weg ist, oder in einem versteckten Teil); wer gerade in ein Feld tippt, behält seinen Platz. Die Ansicht selbst zeigt keinen Rahmen (`.focus-target:focus`). Im echten Browser gemessen: Spielauswahl, Aufstellung, Einstellungen (Reiter), zurück zur Aufstellung, Übersicht und Runde bekommen jeweils den Fokus. Tests: Komponententests für den Baustein (Fokus verloren, Tippen bleibt, versteckter Teil, zeigen einer versteckten Ansicht) und ein Durchlauf durch die ganze App von der Spielauswahl bis in die Runde.
- **Stile ordnen (2026-11-18, `Al-10-08`):** Die Stile sind aufgeräumt, **ohne dass sich eine Ansicht optisch ändert**; das ist belegt (siehe Prüfwerkzeug unten). **(1) Tote Klassen entfernt:** acht ungenutzte Klassen (`kit-disclosure`, `kit-disclosure__body`, `kit-manage__actions`, `kit-tab-section`, `taboo-card-list`, `taboo-card-list__category`, `taboo-card-list__group`, `taboo-review__attempt`) mit 25 Selektoren und 129 Zeilen. **(2) Bausteine in eigene Dateien:** Die Stile der `game-kit`-Bausteine standen verstreut in `global.css`; 71 Regeln sind jetzt in fünf Bausteindateien in derselben Reihenfolge: `kit-hud.css` (Uhr des Zuges), `kit-choice.css` (Auswahlgruppen), `kit-result.css` (Punktetafel und Ergebnisliste), `kit-screen.css` (Spielansicht mit Startleiste und Teamstreifen), `kit-info.css` (Info-Knöpfe und Verweise). `global.css` schrumpft von 1300 auf 821 Zeilen; `main.tsx` importiert die Dateien nach `global.css` und vor `kit-setup.css`. **(3) Doppelte Selektoren:** Von 50 doppelt definierten Selektoren wurden die **4 zusammengeführt, bei denen es nachweislich nichts ändert** (keine Regel dazwischen setzt eine betroffene Eigenschaft). Die übrigen 45 stehen bewusst weiter doppelt: Es sind echte Überschreibungen (Grundregel und kompakte Variante, Regel und Zustand), die man nicht zusammenlegen kann, ohne die Reihenfolge der Wirkung zu ändern. **Prüfwerkzeug:** `e2e/styleSnapshot.ts` schreibt die berechneten Stile und Boxen **aller Elemente** jeder geprüften Ansicht (135 Ansichten: alle Layoutprüfungen auf dem großen und kleinen Handy in beiden Sprachen sowie Bildschirmbreiten 375, 768 und 1280) in Dateien, wenn `STYLE_SNAPSHOT_DIR` gesetzt ist; `scripts/compare-style-snapshots.mjs <vorher> <nachher>` listet jeden Unterschied. Das Werkzeug wurde an zwei Läufen derselben Stile geprüft (gleich) und dann nach jedem Schritt eingesetzt (gleich). **Grenze:** Zustände wie Berührung und Fokus sowie Ansichten außerhalb dieser Abläufe sind nicht abgedeckt.
- **Monotone Zeitmessung (2026-11-18, `Al-10-07`):** Alle Zeitmessungen im Spiel (Runde, Lauf, Zug, Stechen, Pause und der Schutz gegen doppeltes Tippen beim Bestätigen) laufen jetzt auf einer **monotonen Uhr** (`monotonicNow` in `src/presentation/monotonicClock.ts`, gemessen mit `performance.now`) statt auf der Wanduhr `Date.now`. Die Wanduhr springt, wenn die Systemzeit umgestellt wird (Sommerzeit, Nutzer, Netzwerk), und hätte mitten in einem Zug Zeit hinzugefügt oder weggenommen; die monotone Uhr geht nie rückwärts und ignoriert solche Sprünge. Geändert in `useCountdown`, `useStopwatch`, `ConfirmButton`, `useTabooClassicGame`, `useTabooTiebreak`, `TabooRound`, `TabooTiebreakRound`, `TabooRaceGame`, `TabooRaceRun`, `TabooCountdownGame` und `TabooCountdownRun`; die Spiellogik bekam die Zeit schon immer von außen und bleibt unverändert. **Tests:** Die Testumgebung lässt die monotone Uhr der gefälschten Zeit folgen (`src/test/setup.ts`), deshalb laufen alle bisherigen Tests unverändert; ein eigener Test prüft mit der echten Uhr, dass ein Rücksprung um eine Stunde und ein Sprung um einen Tag nichts ändern. Die Browserprüfungen (Playwright-Uhr) bestehen unverändert.
- **Aufgabe `Al-10-03` entfernt (2026-11-18):** Auf Wunsch des Auftraggebers ist die Aufgabe „KI-Kartenquelle später wieder anschließen“ aus Plan, Status und Qualitätsbericht gestrichen; es gibt keinen Plan mehr, die KI-Kartenquelle (Ollama oder LM Studio) anzuschließen. Die Entscheidung `ADR-024` (KI-Einstellung abgeschaltet) bleibt bestehen. Der ungenutzte Code der KI-Kette (Ports, Adapter, Pool-Erzeugung) steht weiter im Repository; er kann bei einer Aufräumrunde entfernt werden, das ist hier **nicht** geschehen. Ältere Einträge nennen `Al-10-03` noch, weil sie den damaligen Stand beschreiben.
- **Gespielte Karten merken (2026-11-18, `Ta-09-06`):** Auf Wunsch des Auftraggebers. Das Spiel merkt sich je Kartensprache, welche Karten schon gezeigt wurden, und **neue Spiele nehmen bevorzugt Karten, die noch nicht gespielt wurden**. Reichen die ungespielten Karten nicht (bei „Auf Zeit“ und „Gegen die Zeit“ zählt die Kartenzahl je Schwierigkeit), beginnt ein neuer Durchgang: die Karten gelten wieder als ungespielt, ein Spiel scheitert nie am Gedächtnis. **Einstellung** im Reiter „Kategorien“ (nur wenn die App ein Gedächtnis hat): **„Gespielte Karten merken“ An/Aus (Standard An)** und der Knopf **„Gespielte Karten vergessen (n)“** mit zweitem Tipp zur Bestätigung. **Technik:** Port `PlayedCardsStore` und reine Funktionen (`rememberCards`, `forgetCards`, `freshDeck`) in `src/business/games/taboo/playedCards.ts`; Adapter `localStoragePlayedCardsStore` (Schlüssel `gamehub.taboo.playedCards`, höchstens 5000 Kennungen je Sprache); `PlayedCardsProvider` und `usePlayedCards` in der Oberfläche, vom Taboo-Modul (`createTabooModule({ playedCards })`) und `main.tsx` verdrahtet; aufgezeichnet wird in Klassisch, Auf Zeit und Gegen die Zeit (nicht im Stechen). Es werden nur Kennungen gespeichert. Tests: Logik, Speicher und sechs Komponententests (merken, ohne Gedächtnis keine Einstellung, Aus, nur Ungespielte, neuer Durchgang, Vergessen). **Außerdem bestätigt (2026-11-18):** alle offenen Punkte zu „Gegen die Zeit“ (Annahmen zum verbotenen Wort, Überspringen und Platzierung, keine Ergebniskorrektur, gleiche Schwierigkeit im n-ten Zug).
- **Stechen bei jedem Gleichstand (2026-11-18, `Al-10-06`):** Entscheidung des Auftraggebers. Das Stechen gilt jetzt **bei zwei oder mehr gleichen Teams, ohne Obergrenze** (vorher nur bei zwei oder drei, ab vier gewann man gemeinsam). Es gilt für Klassisch und „Auf Zeit“; die Einstellung „Stechen bei Gleichstand“ bleibt: **Aus** heißt weiter gemeinsamer Sieg. Technik: `TIEBREAK_MAX_TEAMS` entfällt, `isTiebreakTie` prüft nur noch mindestens zwei Teams. Tests angepasst (vier gleiche Teams spielen das Stechen in Klassisch und „Auf Zeit“, ohne Stechen teilen sie den Sieg; die Zufallsprüfung erlaubt bis zu alle Teams). Im Browser mit vier gleichen Teams bei „Auf Zeit“ geprüft: Übersicht, vier Versuche und Ergebnis laufen durch.
- **Zeit pro Team: 2, 3 und 4 Minuten (2026-11-18, `Ta-06-12`):** Auf Wunsch des Auftraggebers bietet „Gegen die Zeit“ jetzt **2, 3 und 4 Minuten** (statt 2, 3 und 5); Standard bleibt 2. Alte Einträge im Changelog nennen noch 5 Minuten, weil sie den damaligen Stand beschreiben.
- **Reihenfolge der Modi und Standard des Teamwechsels (2026-11-18, `Ta-06-11`):** Auf Wunsch des Auftraggebers steht **„Gegen die Zeit“ in der Mitte** der Modusauswahl (**Klassisch, Gegen die Zeit, Auf Zeit**), und der **Teamwechsel ist standardmäßig „Automatisch“** und steht **links** (Automatisch, Manuell); das ersetzt den Standard „Manuell“ von `Ta-06-10`. Fehlt der Wert, gilt automatisch. Tests und Layoutprüfung angepasst (wer den manuellen Ablauf prüft, wählt ihn ausdrücklich).
- **„Gegen die Zeit“: automatischer Teamwechsel (2026-11-18, `Ta-06-10`):** Auf Wunsch des Auftraggebers. Neue Einstellung **„Teamwechsel“ (Manuell oder Automatisch, Standard Manuell)** in den Einstellungen von „Gegen die Zeit“. **Manuell** ist wie bisher (Übersicht zwischen den Zügen). **Automatisch:** Nach „Richtig“ (oder wenn ein Konto abläuft) erscheint **sofort die nächste Karte für das nächste Team**, ohne Übersicht und ohne Pause; über der Karte steht eine **Leiste mit den Restzeiten aller Teams** (das Team am Zug ist markiert und tickt live, ausgeschiedene sind durchgestrichen). Scheidet ein Team aus, während das Spiel weitergeht, erscheint kurz ein Hinweis „Team X ist ausgeschieden“. Pause und „Spiel beenden“ aus der Pause bleiben. **Logik:** `CountdownConfiguration.autoSwitch`; die Ereignisse `answerCard` (richtig) und `timeUp` nehmen die Karte des nächsten Teams als `nextCard` mit und starten dessen Zug sofort (`continueAutomatically`); ohne gültige Karte wartet das Spiel in der Übersicht; `countdownTeamAfter` nennt das nächste Team, damit die Oberfläche die Karte vorher wählt. Die Oberfläche startet die Uhr des neuen Teams im selben Moment. Tests: sieben Logikfälle und eine Zufallsprüfung mit 40 Spielen, ein Komponententest in beiden Sprachen und eine Layoutprüfung bei 360 × 640 (Einstellung, Zug, Pause, nach dem Wechsel). **Nachbesserung nach der ersten Ansicht:** Die Teamleiste lag als zusätzliches Element im dreizeiligen Raster der Runde und dehnte sich zu hohen Feldern; die Runde mit Leiste hat jetzt eine eigene Zeile (`taboo-round--with-row`), die Leiste ist flach und die Zeiten sind größer. Die Pause-Karte behält ihre Größe und scrollt nicht mehr (die Überschrift hatte eine zu große Mindesthöhe, die Knöpfe doppelten Abstand). Die Regel „jedes Team darf pro Spiel einmal eine Karte überspringen“ steht jetzt im Info-Fenster des Modus und im Regelfenster. **Farben:** Die Zeit jedes Teams in der Leiste wird wie die große Uhr **bei 20 Sekunden gelb und bei 10 Sekunden rot** (ausgeschiedene Teams bleiben ohne Farbe).
- **Spiel aus der Pause beenden (2026-11-18, `Ta-10-10`):** Auf Wunsch des Auftraggebers. Auf der **Pause-Karte** jedes laufenden Zuges (Klassisch, Auf Zeit, Gegen die Zeit und im Stechen) steht jetzt der Knopf **„Spiel beenden“** (Bestätigung durch zweites Tippen, wie bei „Runde beenden“). Er führt zurück ins Hauptmenü mit der ausgefüllten Einrichtung; eine Wertung des abgebrochenen Spiels gibt es nicht. Vorher war das Beenden nur zwischen den Zügen möglich, weil die Kopfleiste im laufenden Zug nur die Pause zeigt. Gemeinsamer Baustein `TabooEndGameButton`, kein neuer Text. Auf Handys mit wenig Höhe (360 × 640) fällt der Hinweistext der Pause-Karte weg und die Knöpfe stehen enger, damit alle vier ohne Scrollen passen. Tests: ein Komponententest je Modus über die ganze App und die bestehende Layoutprüfung der pausierten Karten.
- **„Gegen die Zeit“: Regeln und Abschluss (2026-11-18, `Ta-06-07-E`, damit `Ta-06-07` erledigt):** Das **Regelfenster** nennt die Einstellung „Zeit pro Team“ (Deutsch und Englisch). `GAMEHUB_TABOO_LOGIC.md` hat einen neuen Abschnitt „Modus Gegen die Zeit“ mit allen Regeln der Zustandsmaschine; `GAMEHUB_TABOO_MODES.md` ist auf den Bauzustand gebracht (Standard 2 Minuten, Pause ohne Neustart, Karten, Korrektur). **Ausnahme zur Korrekturregel:** Bei „Gegen die Zeit“ gibt es keine Ergebniskorrektur, weil die Uhr nicht zurückgedreht werden kann und die gelösten Karten weder Rang noch Sieger bestimmen (steht in `GAMEHUB_UI_RULES.md`; Frage 8 im Entwurf, vom Auftraggeber zu bestätigen). **Abschlusstest beider Zeitmodi:** alle Unit-Tests, Zufallsprüfungen, Komponentenläufe und Layoutprüfungen von „Auf Zeit“ und „Gegen die Zeit“ bestehen; Abdeckung insgesamt 97,1 % Zeilen, 92,8 % Zweige, `countdown.ts` 97,3 % Zeilen und 92 % Zweige (Ziel für Spiellogik 95 %, bei den Zweigen noch nicht erreicht: es fehlen Absicherungen für unmögliche Zustände).
- **„Gegen die Zeit“: Oberfläche (2026-11-18, `Ta-06-07-D`):** Der dritte Spielmodus ist spielbar. **Einstellungen:** Die Auswahl „Spielmodus“ hat jetzt **Klassisch, Auf Zeit, Gegen die Zeit** (jeweils mit Info-Knopf); für „Gegen die Zeit“ gibt es die Gruppe **„Zeit pro Team“ (2, 3 oder 5 Minuten, Standard 2)**. **Ansichten** (feste Typen aus `GAMEHUB_UI_RULES.md`): Übersicht der Zeitkonten mit Rangliste (Restzeit, Zahl gelöster Karten, „ausgeschieden“; gleiche Restzeit teilt den Rang), der Zug mit `TimerHud` und `useCountdown` (Anzeige als m:ss, Farbwechsel bei 20 und 10 Sekunden, Pause hält das Konto an, Knöpfe Richtig, Überspringen „nur 1× pro Spiel“, Verbotenes Wort) und der Endstand mit Siegerteam und Platzierung. Komponenten: `TabooCountdownGame`, `TabooCountdownRun`, `TabooCountdownResults`. **Logik angepasst:** Karten dürfen in einem langen Spiel wiederkommen (nur nicht direkt nach sich selbst), neue Karten werden bevorzugt; `requiredCards` kennt den dritten Modus (vier Karten je Team). Texte in Deutsch und Englisch, kurzer Abschnitt im Regelfenster. Tests: Komponententests in beiden Sprachen (Einstellungen, ein Spiel bis zum Ausscheiden, Überspringen und Pause), Planungstests und eine Handy-Layoutprüfung aller Ansichten in beiden Sprachen bei 360 × 640.
- **„Gegen die Zeit“: Spiellogik (2026-11-18, `Ta-06-07-C`):** Neue Zustandsmaschine `src/business/games/taboo/countdown.ts` und Kartenhelfer `countdownCards.ts` (rein, ohne React und Browser). Jedes Team hat dasselbe **Zeitkonto (2, 3 oder 5 Minuten)**, das nur im eigenen Zug herunterläuft; **richtig** beendet den Zug, **verbotenes Wort** und **Überspringen** (einmal pro Team im ganzen Spiel) ersetzen die Karte durch eine gleicher Schwierigkeit, die Uhr läuft weiter; ein leeres Konto (`timeUp` oder ein Knopfdruck nach Ablauf) scheidet das Team aus dem Reihum aus; das letzte Team gewinnt, die **Platzierung folgt der Reihenfolge des Ausscheidens**. Fairness: Im n-ten Zug hat jedes Team dieselbe Schwierigkeit (leicht, mittel, schwer, leicht …). Annahmen laut `GAMEHUB_TABOO_MODES.md` Abschnitt 6 (Punkte 2, 3, 5) sind umgesetzt, aber noch nicht bestätigt. Tests: 14 Fälle plus Zufallsprüfung mit 60 Spielen; Schichtprüfung grün. Die Oberfläche (`Ta-06-07-D`) folgt.
- **Startseite: automatische Sortierung und Handy-Ansicht am PC (2026-11-18, `Al-04-04`):** Die Spiele werden immer automatisch sortiert: **spielbereite und „In Entwicklung“ oben, geplante unten, in jeder Gruppe alphabetisch** nach dem Titel in der UI-Sprache. Die Startseite zeigt auch am PC die **Handy-Spalte** (eine Spalte, keine zwei Karten nebeneinander).
- **Startseite des GameHub (2026-11-18, `Al-04-04`, Branch `gamehub/startseite`):** Auf Wunsch des Auftraggebers. (1) Der Knopf heißt bei allen Karten **„Spielen“** (englisch „Play“) statt „Fortschritt ansehen“ / „Kommt später“; bei geplanten Spielen bleibt er gesperrt. (2) Die alten Platzhalter (Kartenspiel, Scharade, Quiz, Wer bin ich?) sind ersetzt durch die **wirklich geplanten Spiele: Wortbombe, Imposter, Werwolf, Liar’s Bar, Schwimmen**, alle im Farbstil von Tabu (Coral, nicht mehr abgeblasst), mit der Marke „Geplant“. (3) Die **Zahl auf jeder Karte entfällt**. (4) Der **Knopf „Spiele“ in der Kopfleiste entfällt** (er war nur am PC sichtbar und passte dort nicht ins Format); die Kopfleiste hat am PC zwei Spalten. Tests und Browserprüfungen angepasst (725 Unit-Tests, 37 Browserprüfungen bestanden).
- **Spielerliste im GameHub (2026-11-17, `Al-09-12`):** (1) Knopf in der Kopfleiste und Fenster heißen jetzt **„Spielerliste“** (englisch „Player list“) statt „Spieler“. (2) Das Fenster der Spielerliste und die **Spielerauswahl** („Aus Spielerliste wählen“) sind **größer**: breiter (bis 44 rem) und so hoch, wie der Bildschirm es erlaubt (höchstens 46 rem); die Liste ist immer so hoch, dass **nur ganze Spieler** zu sehen sind (auch am Ende der Liste): Der neue Hook `useWholeRows` rechnet beim Öffnen und bei jeder Größenänderung aus, wie viele ganze Zeilen in das Fenster passen (höchstens so viele, wie es Spieler gibt), und das Fenster ist so hoch wie sein Inhalt, höchstens so hoch wie der Bildschirm erlaubt. Auf einem niedrigen Bildschirm (375×640) sind es sieben ganze Spieler, vorher war der achte angeschnitten. Dafür hat `Dialog` die neue Eigenschaft `size="large"`. (3) **Die waagerechte Scrollleiste ist entfernt:** Die Namensliste reichte mit einem negativen Rand über den Inhalt hinaus (325 statt 321 px); jetzt reicht der Inhalt des großen Fensters selbst in den rechten Fensterrand und hat denselben Rand als Polster, die senkrechte Leiste sitzt dort. Die Kopfleiste passt auch bei 320 px Breite. Browsertest für beide Fenster (Größe und keine seitliche Scrollleiste), Texte und Tests angepasst.
- **„Auf Zeit“: Stechen, Längenbezeichnungen, kleinere Auswahlen (2026-11-17, `Ta-06-09`):** Auf Wunsch des Auftraggebers. **(1) Runden pro Team:** nur noch **1, 3 und 5** mit den Bezeichnungen **Kurz, Mittel, Lang** (mit der Zahl darunter, wie bei Klassisch), **Standard Kurz (1)**; die Auswahl 1 bis 5 von vorhin entfällt. **(2) Karten pro Team pro Runde:** **3, 5 und 7** (vorher 5, 10, 15), **Standard 3** (zuerst 5, auf Wunsch des Auftraggebers 3). **(3) Stechen bei Gleichstand, einstellbar wie bei Klassisch:** Neue Gruppe **„Stechen bei Gleichstand“ (An/Aus, Standard An)** als letzte Gruppe der Einstellungen von „Auf Zeit“ (Reihenfolge wie bei Klassisch: Spielmodus, Runden, Kartenzahl, Stechen); ihr i-Knopf öffnet dasselbe Infofenster wie bei Klassisch. Haben nach allen Läufen **zwei oder drei Teams** die beste Gesamtzeit (gleiche Zehntelsekunde, gleich viele gelöste Karten), sagt die Übersicht „Unentschieden! Als Nächstes das Stechen.“ und der Knopf heißt „Stechen starten“ (nicht „Endergebnis anzeigen“). Das Stechen ist **dasselbe wie bei Klassisch**: jedes gleichstehende Team erklärt **drei Karten so schnell wie möglich** (höchstens 90 Sekunden, einmal überspringen, ein verbotenes Wort ersetzt die Karte); die meisten Karten in der kürzesten Zeit gewinnen, gleiche Zehntel teilen den Sieg. Nach dem letzten Versuch kann dessen Wertung korrigiert werden, im Endstand ist der Reiter „Stechen“ zuerst offen. Bei **vier oder mehr** gleichen Teams endet das Spiel wie bisher als gemeinsamer Sieg (offene Regelfrage `Al-10-06`). Nach einer Korrektur eines Laufs kann der Gleichstand entfallen, dann folgt das Endergebnis. Ab dem Beginn des Stechens sind die Läufe endgültig. **Technik:** Die Regeln des Stechens liegen jetzt **einmal** in `src/business/games/taboo/tiebreak.ts` (Ereignisse, Versuche, Gewinner, Korrektur, Schritt `stepTiebreak`), `outcome.ts` enthält `TabooOutcome`, `TabooResult` und `reviseOutcome`; `stateMachine.ts` (589 auf 414 Zeilen) und `race.ts` nutzen beides, **das Verhalten von Klassisch ist unverändert** (alle bisherigen Tests bestehen). `race.ts` hat die neuen Status `tiebreak` und das Ereignis `startTiebreak`, `raceTiebreakFollows` sagt, ob ein Stechen folgt. Oberfläche: die Stechen-Ansichten von Klassisch (`TabooTiebreakOverview`, `TabooTiebreakRound`, `TabooTiebreakWrapUp`) sind jetzt für beide Modi gebaut (gemeinsame Datentypen `TiebreakData` und `TiebreakFinished`), neue Komponente `TabooRaceTiebreak`. Tests: zehn neue Fälle in `race.test.ts`, die Zufallsprüfung spielt jetzt auch das Stechen (mit Kontrolle, dass es wirklich erreicht und entschieden wird), drei neue Komponententests (Gleichstand mit Stechen in beiden Sprachen, Gleichstand ohne Stechen, Einstellungen).
- **„Auf Zeit“ mit Runden (2026-11-17, `Ta-06-08`):** Auf Wunsch des Auftraggebers vor dem Modus „Gegen die Zeit“. **(1) Runden:** Neue Einstellung **„Runden pro Team“ mit den Knöpfen 1 bis 5** (Standard 3, wie die kurze Partie bei Klassisch). In jeder Runde spielt jedes Team einen Lauf. **Wertung nach Gesamtzeit** (Entscheidung des Auftraggebers): Die Zeiten aller Läufe eines Teams werden addiert (jeder Lauf so, wie er angezeigt wird, in Zehnteln, damit die Summe genau stimmt), die kürzeste Gesamtzeit gewinnt, gleiche Gesamtzeit teilt den Sieg; zuerst zählen weiterhin die gelösten Karten (eine nachträgliche Korrektur kostet also vor der Zeit). **(2) Karten von leicht nach schwer:** In jedem Lauf kommen die Karten nach Schwierigkeit geordnet (leicht, mittel, schwer), schwere also immer am Ende; innerhalb einer Schwierigkeit zufällig; alle Teams und alle Läufe haben dieselbe Mischung (`raceDifficultyMix`). Die Auswahl der Schwierigkeit bleibt im Reiter „Kategorien“. Überspringen (einmal je Lauf) und „falsches Wort“ ersetzen die Karte an derselben Stelle durch eine der gleichen Schwierigkeit, die Reihenfolge bleibt. **(3) Karten zwischen den Runden:** In einer Runde kommt keine Karte zweimal vor (auch nicht aus einem verworfenen Lauf); zu Beginn der nächsten Runde dürfen sie wiederkehren, ungespielte Karten kommen zuerst (`racePlayedCardIds`). Der Kartenvorrat muss nur für eine Runde reichen. **(4) Beschriftung und Reihenfolge:** „Karten pro Team“ heißt jetzt **„Karten pro Team pro Runde“**; die Gruppen stehen wie bei Klassisch (Spielmodus, Runden pro Team, dann die Kartenzahl). **(5) Ansichten:** Die Übersicht zeigt „Runde n/m“, den Fortschritt aller Läufe und die **Gesamtzeiten**; ab dem zweiten Lauf steht dabei „Letzter Lauf x s“. Mitten in einer Runde werden nur Teams mit gleich vielen Läufen verglichen, ein Team mit einem Lauf weniger zeigt seine Zeit ohne Rang. Der Endstand heißt bei mehreren Runden „Gesamtzeiten am Ende“. Das Korrigieren gilt nur für den zuletzt gespielten Lauf (Ereignis `reviseRunResult` mit der Runde). **Technik:** neue Funktionen `getRaceTurn`, `raceTotals`, `rankRaceTotals`, `comparableRaceTotals`, `racePlayedCardIds`, `raceRounds` in `race.ts`; `rankRaceAttempts` entfällt. Tests: acht neue Fälle für Runden in `race.test.ts`, die Zufallsprüfung spielt jetzt 1 bis 3 Runden mit Reihenfolge-, Rundenwechsel- und Gewinnerprüfung, zwei neue Komponententests (zwei Runden mit Gesamtzeit in beiden Sprachen, Karten leicht nach schwer).
- **`TabooSetup` aufgeteilt (2026-11-17, `Al-10-02`):** Der Container war mit 642 Zeilen und Komplexität 109 die größte Schwachstelle (siehe Gesamtanalyse). Er ist jetzt 255 Zeilen groß (Hauptfunktion 209 Zeilen, Komplexität 24) und fügt nur noch Teile zusammen. **Das Verhalten ist unverändert** (alle bisherigen Tests und Browsertests bestehen ohne Anpassung). Neue Teile in `src/presentation/taboo/`: `useTabooClassicGame` (das Spiel „Klassisch“: Zug, Uhr, Pause, Neustart des Zuges, nächster Zug, Stechen, Nachladen), `TabooClassicScreens` (seine Bildschirme), `useTabooStart` (Start aus der Aufstellung: Prüfung, Karten holen und prüfen, Meldungen), `tabooStartPlan.ts` (reine Funktionen `planTabooStart` und `cardShortageFor`: aus Einstellungen und Teams das Spiel, die nötige Kartenzahl und die Filter, ohne React), `useTabooSettingsView` (Einstellungsansicht und Formular), `TabooLineup` (die Aufstellung mit Meldungen und dem Knopf zu den Einstellungen). Der dritte Modus „Gegen die Zeit“ kann nun als eigener Hook mit eigenen Bildschirmen dazukommen, ohne den Container zu vergrößern. Zehn neue Tests für die Planungsfunktionen. **Außerdem:** Das Zeitlimit der Testläufe ist von 5 auf 20 Sekunden erhöht (`vitest.config.ts`): zwei Tests der Kartenformulare brauchen allein etwa zwei Sekunden und schlugen unter paralleler Last auch mit dem alten Code gelegentlich fehl.
- **Systemzurück-Taste in einem laufenden Spiel (2026-11-17, `Al-10-05`):** Die Zurück-Taste des Handys (und des Browsers) wirft ein laufendes Spiel nicht mehr weg. Neuer Hook `useSystemBack` (`src/presentation/useSystemBack.ts`): Solange ein Spiel in der Kopfleiste angemeldet ist (`useGameExit` oder `useGameBack`), liegt ein zusätzlicher Verlaufseintrag oben, den Zurück entfernt und der sofort wieder gesetzt wird. In einer Unteransicht (zum Beispiel die Spieleinstellungen oder die Kartenverwaltung) geht Zurück einen Schritt zurück wie der Pfeil in der Kopfleiste. In einem laufenden Spiel fragt die App „Spiel beenden?“ („Weiterspielen“ / „Spiel beenden“); eine laufende Runde wird dafür pausiert und mit „Weiterspielen“ fortgesetzt. Auf der Aufstellung verlässt ein einziges Zurück das Spiel wie bisher; der Schutz-Eintrag wird beim Ausschalten wieder entfernt, sodass kein zweites Zurück nötig ist. Ein verspätetes `popstate` einer früheren Navigation (zum Beispiel vom Öffnen des Spiels) wird erkannt, weil der Schutz-Eintrag dann noch oben liegt. Neue Texte `navigation.leaveGameTitle`, `leaveGameText`, `keepPlaying`. Tests: drei in `App.test.tsx` (laufendes Spiel, Einstellungen, Aufstellung) und je Sprache ein Browsertest mit der echten Historie.
- **Gesamtanalyse von Tabu (2026-11-17, `Al-10-04`):** Schichten, Importe, Struktur, Bausteine, Logik, Testabdeckung, Randfälle und Optik in beiden Sprachen geprüft. Bericht in `docs/GAMEHUB_QUALITY_CHECK.md`. Ergebnis: keine Schichtverstöße und keine Zyklen; wichtigste Befunde sind die Systemzurück-Taste (verwirft ein laufendes Spiel), die Größe von `TabooSetup`, die Zeitmessung mit der Wanduhr und das nicht erklärte Stechen bei vier oder mehr gleichen Teams. Vier neue Tests; sechs Folgeaufgaben `Al-10-05` bis `Al-10-10`.
- **Aufgaben und Leitfäden nachgetragen (2026-11-17):** Die Oberflächenarbeit an Tabu steht jetzt als Phase **Ta-10** (neun Aufgaben, acht erledigt, `Ta-10-09` geplant: Spieler-Reiter aus Tabu entfernen) im Status und im Projektplan, die neuen Bausteine als `Al-09-10`, die Leitfäden als `Al-09-11`. `docs/GAMEHUB_NEW_GAME_GUIDE.md` beschreibt die neuen Bausteine (`TabPane`, `ResultList`, `Confetti`, `ScoreScreen` mit Reiter und Fortschritt, `Scoreboard` mit Rang, Krone, Balken und Zuwachs, `HeadingLegend`, `ActionRow`, `LineupScreen` mit `sideAction`), den neuen Einstieg (Aufstellung zuerst, Spieleinstellungen als eigener Bildschirm), die Regel „eine Auswahl = zusammenhängende Leiste, mehrere = getrennte Knöpfe“, die Ein-Seiten-Regel und die Testhilfen. `docs/GAMEHUB_SETUP_KIT.md` verweist oben auf den aktuellen Stand. Qualitätswerte im Status aktualisiert (680 Unit-Tests, 31 Browserprüfungen, Coverage erfüllt).
- **Kein Info-Knopf bei der Teamreihenfolge (2026-11-17):** Der Info-Knopf samt Text entfällt, weil Pfeil und Würfel selbsterklärend sind. Der Baustein heißt jetzt `HeadingLegend` (vorher `InfoLegend`): Überschriftzeile einer Gruppe, mit `info` mit Info-Knopf neben dem Text, ohne `info` einfach die Überschrift mit Knöpfen am rechten Ende. Nicht mehr genutzter Text `kitSetup.infoLabel` entfernt.
- **Standardreihenfolge wieder da, als Symbol (2026-11-17):** In der Überschriftzeile der Teamreihenfolge steht links neben dem Würfel ein Pfeil-Symbolknopf (Zurücksetzen, Name „Standardreihenfolge“ als Tooltip und für Screenreader), der Team 1, 2, 3 … wiederherstellt; gesperrt, wenn die Reihenfolge schon so ist. Neues Symbol `reset`, Info-Text und Test angepasst.
- **Platznummer außerhalb der Box (2026-11-17):** In der Teamreihenfolge steht die Nummer („1.“, „2.“ …) links **neben** der verschiebbaren Box. Die Box enthält nur noch den Teamnamen und den Griff, so wirkt die Nummer nicht mehr wie ein Teil des Teams.
- **Info-Knopf an der Überschrift überall (2026-11-17):** Die Regel „Info-Knopf direkt neben dem Text der Überschrift, Tipp auf die Überschrift öffnet das Infofenster“ gilt jetzt für **alle** Überschriften mit Info, auch in den Spieleinstellungen („Überspringen pro Runde“ und alle anderen Gruppen mit `info`). Neuer Baustein `HeadingLegend` (statt der Sonderlösung nur in der Teamreihenfolge, `ChoiceGroup` und `TeamOrder` nutzen ihn); der alte rechtsbündige Info-Knopf samt Positionsrechnung im CSS entfällt. Die Zeilenhöhe der Überschrift bleibt eine Textzeile, die Tippflächen (44 px) ragen darüber hinaus. Die i-Knöpfe **in** einer Option (Spielmodus, Stechen „An“) bleiben dort, sie erklären diese eine Option.
- **Spieler im Reiter „Teams“ entfernen (2026-11-17):** Im Fenster „Team von …“, das ein Tipp auf einen Spieler öffnet, steht jetzt zuunterst ein roter Knopf **„Spieler entfernen“** (Text `kitPlayers.removePlayer`). Er löscht den Spieler aus der Liste und aus seinem Team. Test in `TeamsSetup.test.tsx`.
- **Spieler-Reiter wie der Teams-Reiter (2026-11-17):** Oben stehen nebeneinander je halbe Breite **„Letzte Spieler laden“** und **„Spieler leeren“** (zweiter Tipp nötig, deaktiviert ohne Spieler; löscht auch die Teamzuordnung, Teams und Namen bleiben). Neue Texte `kitPlayers.clear` und `kitPlayers.clearConfirm`, neuer Test in `TeamSetupMemory.test.tsx`.
- **Teamreihenfolge überarbeitet (2026-11-17):** Der Knopf „Standard“ entfällt. „Zufällig“ ist jetzt ein Würfel-Symbolknopf (Name „Zufällige Reihenfolge“ als Tooltip und für Screenreader) rechts in der Überschriftzeile. Der Würfelknopf hat die neue allgemeine Form **`kit-heading-button`** für jeden Knopf neben einer Überschrift: flach (32 px) und breit statt quadratisch, die Tippfläche bleibt durch eine unsichtbare Schicht 44 px hoch (die Layoutprüfung zählt sie mit). Der Info-Knopf steht direkt neben der Überschrift „Teamreihenfolge“, und ein Tipp auf die Überschrift öffnet ebenfalls das Infofenster. Info-Text angepasst, neues Symbol `shuffle`, Test für beide Wege zum Infofenster.
- **Neuer Einstieg bei Tabu (2026-11-17):** Tabu öffnet jetzt direkt auf **„Spieler und Teams“** (Aufstellung mit den Reitern Spieler | Teams). Links neben „Spiel starten“ in der Startleiste steht ein Knopf nur mit dem **Symbol** (Regler; Name „Spieleinstellungen“ als Tooltip und für Screenreader), der die Einstellungen als **eigenen Bildschirm** öffnet (Reiter „Spieleinstellungen | Kategorien“, Pfeil zurück in der Kopfleiste, unten „Fertig“). Der alte Knopf „Starten“ im Hauptmenü entfällt; **„Spiel starten“** gibt es nur noch in der Aufstellung und liest dabei die Einstellungen aus dem (verborgen weiter vorhandenen) Formular, fehlt eine Kategorie, öffnen sich die Einstellungen bei „Kategorien“ mit der Meldung. Der Knopf „Spielregeln“ steht in der Aufstellung in der Kopfleiste. `LineupScreen` hat dafür `sideAction` (die `StartBar` zeigt den Knopf links neben dem Hauptknopf), `SetupScreen` `formRef`; neues Symbol `sliders`. Die Kopfleiste kennt jetzt mehrere gleichzeitig aktive Zurück-Aktionen (Einstellungen und darüber die Kartenverwaltung): wird die oberste entfernt, gilt wieder die darunter (`GameChrome`, vorher ging der Zurückpfeil der Einstellungen nach der Kartenverwaltung verloren). Tests und E2E auf den neuen Ablauf umgestellt, Hilfsfunktionen `openGameSettings`/`closeGameSettings`.
- Auf Wunsch des Auftraggebers („alles muss ein One-Pager sein“): Hauptmenü und Aufstellung scrollen als Seite nie. Die Reiterleiste bleibt fest, die Box des Reiters füllt den Platz bis zum Startknopf (alle Reiter gleich hoch) und scrollt bei langem Inhalt für sich. Code: Klasse `kit-onepage` in `SetupScreen`/`LineupScreen`, Stile in `kit-setup.css`; `usePlayerDrag` scrollt beim Ziehen die Reiterbox statt der Seite. Neue Prüfung in `e2e/mobile-layout.spec.ts` (keine Seitenscrolls auf Ein-Seiten-Bildschirmen). Im Browser bei 375×812 geprüft; auf einem echten Handy noch nicht.
- **Karteneditor** ("Karten verwalten") jetzt mit zwei Reitern: links **Karten** (Liste nach Kategorien), rechts **Karte hinzufügen**; Import und Export fest unten; der Hinweistext unter dem Titel entfällt (Schlüssel `tabooLibrary.hint` ersetzt durch `tabooLibrary.cardsTab`). `ManageScreen` nimmt dafür `tabs` statt Kindern.
- **Überarbeitung nach Rückmeldung (2026-11-15):** (1) dünne, unauffällige Scrollleiste überall; (2) Fenster (zum Beispiel Spielregeln): **Titel und Schließen-Knopf bleiben beim Scrollen stehen**; neuer Baustein `TabPane` (feste Kopf- und Fußzeile, nur die Mitte scrollt); (3) Reiter „Karte hinzufügen“: der Knopf „Hinzufügen“ steht fest unten; (4) Reiter „Karten“: **Import und Export** stehen fest unten in diesem Reiter; (5) Karten in **zwei Ansichten „Standard | Eigene“**: nur noch eine Liste der Kategorien (Name, Anzahl, Pfeil), das Auf- und Zuklappen entfällt, ein Tipp öffnet die Ansicht der Karten der Kategorie (ansehen und bearbeiten, Zurück-Knopf, bei eigenen Kategorien Umbenennen und Löschen). Neue Texte `tabooList.views/back/noOwnCategories`, Schlüssel `tabooList.groups.ownCategories/standardCategories` entfallen. 658 Unit-Tests grün.
- **Karteneditor, Feinschliff:** Zurück-Knopf, Kategoriename und Kartenanzahl stehen auf einer Mittellinie; **beim Bearbeiten einer Karte ist nur diese Karte zu sehen** (die anderen Karten und Umbenennen/Löschen der Kategorie sind ausgeblendet, bis gespeichert, gelöscht oder abgebrochen wird). **Nach dem Umbenennen bleibt die Kategorie geöffnet** (mit dem neuen Namen) statt zur Liste zurückzuspringen. 659 Unit-Tests grün.
- **Rückmeldung per Meldung unten (2026-11-15):** Karte hinzufügen (schon vorhanden), **Karte gespeichert, Karte gelöscht, Kategorie gelöscht, Kategorie umbenannt, Karten importiert und exportiert** werden mit einer kurzen Meldung unten bestätigt (Fehler bleiben rot). Neue Texte `tabooList.cardSaved/cardDeleted/categoryDeleted`, `tabooLibrary.exported`.
- **Scrollleiste am Rand (2026-11-15):** In Reitern und Fenstern sitzt die Scrollleiste jetzt dicht am Rahmen (4 px Abstand) statt neben dem Inhalt; der Inhalt bleibt an seiner Stelle. **Fehler behoben:** In einem Fenster mit mittlerer Höhe ragte der Bereich des Reiters über den Bildschirm und der feste Startknopf verdeckte den unteren Rand des Reiters (der Rahmen `taboo-setup__screen` durfte nicht schrumpfen); die Layout-Prüfung meldet jetzt, wenn ein Bereich zu hoch ist oder der Reiter unter den Startknopf ragt.
- **Keine Auswahllisten mehr beim Hinzufügen und Bearbeiten von Karten (2026-11-15):** Sprache der Kategorie und Schwierigkeit sind jetzt die gemeinsamen Auswahlknöpfe (`ChoiceGroup`, neu mit `columns`; Schwierigkeit in den Farben Einfach/Mittel/Schwer) statt Dropdowns. Die **Kategorie bleibt eine Auswahlliste** (viele, wechselnde Einträge). Der Knopf „Karte hinzufügen“ hat die volle Breite. Regel: auf Auswahllisten (`select`) wird, wo es geht, verzichtet.
- **Eine Auswahlleiste für alles (2026-11-15):** `ChoiceGroup` zeigt Einstellungen jetzt als **zusammenhängende Knopfleiste** ohne Lücken (gewählter Knopf farbig, erster und letzter Knopf mit runden Außenecken); der Umschalter „Standard | Eigene“ bei den Karten nutzt dieselbe `ChoiceGroup` (neu `hideLegend`), der Sonderbaustein `kit-segmented` entfällt. Mehrfachauswahl der Kategorien im Reiter „Karten“ des Hauptmenüs bleibt einzelne Knöpfe (mehrere zugleich wählbar).
- **Fokusrahmen nicht mehr abgeschnitten (2026-11-15):** Der Fokusrahmen (Tastatur) von Knöpfen und Feldern am Rand eines scrollenden Bereichs (Reiterinhalt im Karteneditor, Inhalt der Fenster) wurde vom Bereich abgeschnitten. Die Bereiche haben jetzt Platz um den Inhalt (`--focus-room`) und nehmen ihn mit negativem Rand zurück, damit nichts verrutscht.
- **Überschrift des Karteneditors:** „Eigene Tabu-Karten“ / „Custom Taboo cards“ passte nicht (der Bildschirm zeigt Standard- und eigene Karten) und heißt jetzt **„Tabu-Karten“ / „Taboo cards“**.
- **Einrasten beim Scrollen (2026-11-15):** Listen aus Blöcken (Kategorien, Karten einer Kategorie, Spiele der Spielauswahl) rasten beim Scrollen auf ganze Einträge ein (`scroll-snap`), sodass oben nie ein Eintrag angeschnitten stehen bleibt. Ausnahme: Ganz am Ende der Liste steht der letzte Eintrag vollständig unten, dann kann der oberste angeschnitten sein. Im Browser gemessen (Kategorieliste). Fließtext (Spielregeln) und Formulare rasten nicht.
- **Spielregeln:** zwischen den Kapiteln steht eine dünne Trennlinie.
- **Schwierigkeit im Hauptmenü:** Die Einstellung „Alle“ entfällt. Die Überschrift heißt jetzt **„Schwierigkeit (mehrere möglich)“** / „Difficulty (several possible)“, zu Beginn ist nur **Einfach** gewählt (so sieht man sofort, was aktiv ist; bei drei gewählten Knöpfen erkennt man „alle“ nicht gut), eine bleibt immer gewählt. `ChoiceGroup` kann dafür eine Mehrfachauswahl ohne „Alle“-Option (neu: `initial` als Liste). Der Satz „Du kannst mehrere wählen.“ im Info-Text entfällt (steht jetzt in der Überschrift).
- **Namen und feste Stelle (2026-11-15):** Der Reiter im Hauptmenü heißt **„Kategorien“** (vorher „Karten“), der Knopf zum Editor **„Kategorien und Karten“** (vorher „Karten“). Der Knopf steht **fest oben** im Reiter (feste Kopfzeile, `TabPane`) und scrollt nicht mit. Der linke Reiter im Editor heißt weiter „Karten“.
- **Import und Export nur dort, wo sie passen:** Die Knöpfe stehen nur noch in der Liste der **eigenen** Kategorien („Eigene“). In der Ansicht „Standard“, in einer geöffneten Kategorie und beim Bearbeiten einer Karte waren sie verwirrend (Import und Export betreffen eigene Karten und Kategorien, nicht die geöffnete Karte) und sind dort ausgeblendet.
- **Textprüfung Deutsch und Englisch (2026-11-15):** Alle Texte gelesen und angeglichen. (1) Die Meldung bei leerer Spielerliste verwies auf den Knopf „Spieler“ im Hauptmenü (der dort nicht mehr steht) und nennt jetzt „Spielerliste verwalten“. (2) Das Stechen sprach im Deutschen von „Begriffen“, sonst überall von „Karten“; jetzt einheitlich „Karten“ (auch „Versuch im Stechen“). (3) „noch nicht gespielt“ beim Rennen und „noch offen“ beim Stechen sind jetzt beide „noch offen“; „Nochmal tippen zum Neustarten“ ist bei Runde und Lauf gleich. (4) Karten heißen in der Liste nun „Standardkarten“ / „Standard cards“, passend zur Ansicht „Standard“. (5) Rennen-Info: „dieselbe Mischung der Schwierigkeiten“ statt „gleich schwere Karten“ (Mehrfachauswahl). (6) Regeln: „Kategorien: welche Karten gespielt werden: Sprache, Schwierigkeit, Kategorien“, englisch „which cards are played …“, „it is the next team's turn“, „take turns playing rounds“, „Tap the own category you want to export“. Keine fest eingebauten Texte außerhalb der Übersetzungen gefunden.
- **„Kategorie löschen“:** Nach dem ersten Tipp bleibt der Text des Knopfes gleich, nur der Knopf wird kräftig rot (der lange Text „Nochmal tippen: n Karten löschen“ passte nicht hinein; Screenreader hören weiter die Rückfrage). Schlüssel `tabooList.deleteCategoryAgain` entfällt.
- **Eigene Kategorien näher an den Standardkategorien:** Im Reiter „Kategorien“ des Hauptmenüs bleiben die eigenen Kategorien **unter** den Standardkategorien; der Abstand zwischen den beiden Gruppen und zur Überschrift ist kleiner, damit man bei wenigen eigenen weniger scrollen muss.
- **Überschriften „Standard“ und „Eigene“ immer sichtbar:** Im Reiter „Kategorien“ des Hauptmenüs stehen beide Überschriften auch ohne eigene Kategorien; unter „Eigene“ steht dann „Noch keine. Lege sie unter „Kategorien und Karten“ an.“ (neuer Text `tabooSetup.noOwnCategories`, klein, grau und kursiv wie die Überschrift, damit er nicht auffälliger ist als sie).
- **Leiste nur für eine Auswahl (2026-11-17):** Die zusammenhängende Knopfleiste (`ChoiceGroup`) steht nur noch für „genau eine Auswahl“. Die Mehrfachauswahl (Schwierigkeit im Hauptmenü, `multiple`) zeigt einzelne Knöpfe mit Lücken, wie die Kategorien.
- **Keine unnötige Scrollleiste (2026-11-17):** Der Platz um den Inhalt für den Fokusrahmen (je 8 px oben und unten) ließ bei den Standardkarten eine Scrollleiste für ein paar Pixel entstehen. Der Fokusrahmen wird in scrollenden Bereichen jetzt **innen** gezeichnet (`outline-offset: -3px`), der Zusatzplatz entfällt.
- **Überschrift „Tabu-Karten“ entfällt:** Die Kopfleiste nennt das Spiel schon und die Reiter sagen, was man sieht; die Überschrift des Karteneditors ist nur noch für Screenreader da, der Reiter gewinnt eine Zeile Platz.
- **Abstand im Karteneditor:** Zwischen der Auswahl „Standard | Eigene“ und der Liste (allgemein zwischen fester Kopfzeile und Inhalt eines Reiters) steht jetzt der Abstand von 16 px statt 12 px.
- **Ansicht zwischen den Runden (2026-11-17):** Ein-Seiten-Ansicht wie die übrigen: oben „Runde n/m“, darunter der Inhalt in einer Box, unten fest „Team … / Runde starten“. Nach einer gespielten Runde zwei **Reiter „Punktestand | Letzte Runde (n)“** (die gespielten Karten mit der Wertung zum Ändern; zuerst ist der Punktestand offen), vor der ersten Runde nur der Punktestand ohne Reiter. `ScoreScreen` ist dafür ein One-Pager mit optionalem zweiten Reiter (`extraTab`) und gilt für alle Zwischen- und Endansichten (Ergebnis, Stechen, Rennen), deren Inhalt in der Box scrollt. Neue Texte `tabooRound.standingsTab/reviewTab`.
- **Rundenanzeige mit Fortschrittsbalken:** In der Ansicht zwischen den Runden steht ganz oben ein dünner Fortschrittsbalken (gespielte Züge von allen Zügen, zum Beispiel 1 von 6) und darunter „Runde n/m“. Bei „Unbegrenzt“ gibt es keinen Balken. Neuer Baustein `progress` in `ScoreScreen` (Rolle `progressbar` für Screenreader).
- **Neuer Punktestand (2026-11-17):** Jede Zeile ist größer und hat (1) einen **Balken**, der so lang ist wie die Punkte im Vergleich zum Führenden, (2) einen runden **Platz** (der Führende eine Krone, Platz 2 und 3 silber und bronze; gleiche Punkte teilen den Platz), (3) die große **Punktzahl**. Ohne Punkte gibt es keine Krone. Nach Rückmeldung bewusst **ohne** Abstand zum Führenden und **ohne** Marke für das Team, das als Nächstes dran ist (das steht schon über dem Knopf „Runde starten“; weniger Effekte). Symbol `crown`. Gilt für alle Ansichten mit `Scoreboard` (zwischen den Runden und Endstand). Neue Tests; die Tests lesen die Zeilen jetzt mit `testing/scoreRows.ts`.
- **Feinschliff Rundenansicht (2026-11-17):** (1) Am Spielende steht „Spiel zu Ende.“ / „Game finished.“ statt „Alle vorgesehenen Runden sind gespielt.“. (2) Der Teamname über „Runde starten“ nutzt jetzt die gleiche Schrift wie die übrigen Knöpfe (vorher die schmale Anzeigeschrift). (3) Im Punktestand steht beim Team, das gerade gespielt hat, klein und grün **„+3“**, die Punkte der eben gespielten Runde (eine korrigierte Wertung zählt sofort; „+0“ ist grau).
- **Laufender Zug (2026-11-17):** Fehler behoben: Auf einem kleinen Handy (360×640) verdeckten die Knöpfe unten die letzten verbotenen Wörter der Karte, weil die Seite nicht mehr scrollt. Der Zug füllt jetzt genau den Platz zwischen Kopfleiste und unterem Rand; die Karte bekommt den restlichen Platz und ist auf niedrigen Bildschirmen enger gesetzt (kleinere Abstände und Begriffsgröße), die Pausen-Karte mit ihren drei Knöpfen passt ebenfalls ohne Scrollen. Die Layout-Prüfung meldet jetzt, wenn ein verbotenes Wort von den Knöpfen verdeckt wird oder die Karte scrollen muss.
- **Abstand der Knöpfe im Zug:** Die Knöpfe „Verbotenes Wort“, „Überspringen“ und „Richtig“ haben unten jetzt 12 px Abstand zum Rand (plus den Sicherheitsabstand des Geräts) und kleben nicht mehr am Rand.
- **Zeitbalken oben (2026-11-17):** In allen Zügen (Klassisch, Rennen, Stechen) steht der Zeitbalken jetzt **ganz oben**, dünn wie der Fortschrittsbalken der Rundenansicht, und darunter der Block mit Teamname, Runde, Punkten und Zeit. So sehen beide Ansichten gleich aus.
- **Zug ohne Runde und Punkte:** Im klassischen Zug stehen über der Karte nur noch der Teamname und die Zeit; „Runde 1/3 · Punkte: 0“ entfällt, weil die Rundenansicht (Punktestand, „Runde n/m“) das zeigt. `TimerHud` kann ohne zweite Zeile (`meta`) benutzt werden; Rennen und Stechen zeigen dort weiter die Kartennummer. Text `tabooRound.score` entfällt.
- **„Runde beenden“ mit Bestätigung:** Im Pausenbild braucht „Runde beenden“ jetzt einen zweiten Tipp (der Knopf zeigt „Nochmal tippen zum Beenden“), wie „Runde neu starten“. Neuer Text `tabooRound.endRoundConfirm`.
- **„Versuch beenden“ mit Bestätigung (Stechen):** Im Pausenbild des Stechens braucht „Versuch beenden“ jetzt einen zweiten Tipp („Nochmal tippen zum Beenden“), wie „Runde beenden“ im normalen Zug. Das Stechen ist sonst dieselbe Ansicht wie ein Zug (gleiche Bausteine); die Zeile „Stechen · Karte n/3“ im Kopf bleibt bewusst stehen. Neuer Text `tabooTiebreak.endAttemptConfirm`.
- **Rennen (2026-11-17):** Fehler behoben: Die Zeilen der Zeiten (Rennen) und des Stechens waren seit dem neuen Punktestand zusammengequetscht („Tea / m 1“). Neuer Baustein `ResultList` (gleiche Zeilen wie der Punktestand: Balken, Platz mit Krone für den Besten, Name, Ergebnis groß, „noch offen“ klein und grau), genutzt von `TabooRaceResults` und `TabooTiebreakResults`. Beim Rennen und beim Stechen wird die Korrektur nach gespielten Läufen ein zweiter Reiter **„Zeiten | Karten prüfen“** (`ScoreScreen` mit `extraTab`, jetzt auch ohne Punktestand). Texte `tabooRace.partialCards`, `tabooTiebreak.resultCards`, `tabooReview.tab` neu; `tabooRace.partial` und `tabooTiebreak.result` entfallen.
- **„Auf Zeit“ wie „Klassisch“ (2026-11-17):** Der Lauf sieht aus wie ein klassischer Zug: Kopf nur mit Teamname und Zeit (ohne „Auf Zeit · Karte n/5“), die Karte und die Knöpfe ohne Zusatztext (der Hinweis „kostet Zeit, neue Karte“ am Knopf „Verbotenes Wort“ entfällt; er steht jetzt in den Spielregeln: „Ein verbotenes Wort kostet Zeit.“). Die Übersicht zwischen den Läufen hat wie die Rundenansicht oben einen dünnen **Fortschrittsbalken** (gespielte von allen Läufen) mit **„Lauf n/m“**, darunter Box beziehungsweise Reiter „Zeiten | Karten prüfen“; der Erklärsatz „Jedes Team löst 5 Karten …“ entfällt. Texte `tabooRace.runOf` neu, `title`, `intro`, `cardOf`, `forbiddenHint` (Rennen) entfallen. Der Balken im Lauf zeigt die gelösten Karten (er wächst), im Zug die Restzeit (er schrumpft).
- **Karten prüfen nur während des Spiels (2026-11-17):** Die Korrektur der Karten gibt es nicht mehr in der Endstand-Ansicht. Damit auch der letzte Lauf beziehungsweise der letzte Versuch im Stechen noch geprüft werden kann, folgt auf ihn zuerst eine **Abschlussübersicht** (beim Rennen „Spiel zu Ende.“ mit den Reitern „Zeiten | Karten prüfen“, beim Stechen „Stechen“ mit „Ergebnis Stechen | Karten prüfen“) mit dem Knopf „Endergebnis anzeigen“; der Endstand zeigt nur noch das Ergebnis (wie es bei „Klassisch“ schon die Übersicht „Spiel zu Ende.“ vor dem Endstand gibt). Neu: `TabooTiebreakWrapUp`.
- **Korrektur nur für den eben gespielten Lauf (2026-11-17):** Wie bei „Klassisch“ („Letzte Runde (n)“) gibt es den Reiter **„Letzter Lauf (n)“** (beim Stechen „Letzter Versuch (n)“): Er zeigt nur den zuletzt gespielten Lauf, nur dessen Karten lassen sich korrigieren, nach dem nächsten Lauf nicht mehr. Die Leiste zur Wahl des Teams entfällt. Texte `tabooReview.lastRun/lastAttempt` neu, `tabooReview.tab` entfällt.
- **Reiter „Karten prüfen“ wie bei „Klassisch“:** Beim Rennen und beim Stechen zeigt der Reiter die Karten wie die Rundenansicht des klassischen Modus: Überschrift „Gespielter Lauf: Team 1“ / „Gespielter Versuch: Team 1“, Hinweis und die grünen und roten Zeilen zum Antippen. Bei mehreren Teams wählt eine zusammenhängende Leiste mit den Teamnamen das Team (zuerst das zuletzt gespielte); die aufklappbaren Bereiche je Team entfallen. Texte `tabooReview.runTitle/attemptTitle` neu, `tabooReview.attempt` entfällt.
- **Führendes Team immer oben (2026-11-17):** In den Zeitenlisten (Rennen, Stechen) steht das beste Ergebnis immer oben, Teams ohne Ergebnis folgen am Ende (gleiche Ergebnisse behalten die Spielreihenfolge). Der Punktestand war schon so sortiert.
- **Falsch bleibt falsch (2026-11-17):** Eine Karte, die während des Zuges als „Verbotenes Wort“ markiert wurde, lässt sich bei der Korrektur nicht mehr auf „Richtig“ ändern (Rennen, Stechen und Klassisch). Eine als „Richtig“ gespielte Karte kann man weiter auf „Falsch“ ändern und wieder zurück. Dafür merkt sich `TabooResult` die ursprüngliche Wertung (`original`), die Regel steht in `reviseOutcome` in der Spiellogik. In der Liste sind solche Karten **dunkelrot** (gedämpft, ohne Zeiger) und nicht antippbar, damit man sie von den änderbaren hellen Karten unterscheidet.
- **Endstand und Stechen (2026-11-17):** (1) **Fehler behoben:** Im Endstand des Rennens war bei gleicher Zeit der Balken des einen Teams kürzer (es wurde mit Millisekunden verglichen, angezeigt werden Zehntel); jetzt zählen Zehntelsekunden, gleiche Zeiten haben gleich lange Balken. (2) Im Zug des Stechens steht wie bei allen Zügen nur Teamname und Zeit, ohne „Stechen · Karte n/3“ (Text `tabooTiebreak.cardOf` entfällt). (3) Der Endstand des klassischen Spiels mit Stechen zeigt die Ergebnisse des Stechens als zweiten Reiter **„Punktestand | Stechen“** statt im selben Kasten darunter.
- **Balken im Stechen (2026-11-17):** Im Stechen müssen 3 Karten so schnell wie möglich gelöst werden, deshalb zeigt der Balken oben die **Karten** (1/3, 2/3, 3/3) und füllt sich damit, wie beim Rennen (nicht mehr die Restzeit bis zur 90-Sekunden-Grenze, die zurücklief). Regel: Ein Countdown (Klassisch) lässt den Balken schrumpfen, eine Aufgabe mit Karten (Rennen, Stechen) füllt ihn mit den gelösten Karten.
- **Konfetti zum Sieg (2026-11-17):** Auf der Endansicht (Klassisch, Rennen, Stechen) regnet kurz Konfetti über den ganzen Bildschirm (110 bunte Teilchen in den Farben der App, die über 2,5 Sekunden nacheinander starten und jeweils 3 bis 4,5 Sekunden fallen: insgesamt etwa sieben Sekunden). Neuer Baustein `Confetti` im `game-kit`, ohne neue Abhängigkeit (nur CSS-Animation), über `ScoreScreen` mit `celebrate`. Es ist reine Dekoration: nimmt keine Tipps an, ist für Screenreader ausgeblendet, löst kein Scrollen aus und **entfällt ganz, wenn das Gerät weniger Bewegung wünscht** (`prefers-reduced-motion`). Im Browser gemessen: die Teilchen fallen, kein horizontales Scrollen.
()=>"- **Knöpfe der Endansicht (2026-11-17):** Die zwei Knöpfe unten heißen jetzt **„Erneut spielen“** (englisch „Play again“; vorher „Mit gleicher Konfiguration neu spielen“) und **„Zurück zum Hauptmenü“** (englisch „Back to the main menu“; vorher „Neue Partie konfigurieren“). Der zweite Text gilt auch an den anderen Stellen, an denen es zurück ins Hauptmenü geht (keine Karten mehr). Die Texte `tabooResult.sameSetup/newSetup` sind angepasst.
- **Grüner Rand am Gewinnerblock:** Der Kasten mit dem Gewinnerteam oben hat einen grünen Rand (die Zeilen der Liste darunter bleiben ohne).\n- **Endansicht angeglichen (2026-11-17):**" (1) Der Name im Gewinnerblock nutzt die normale fette Schrift statt der schmalen Anzeigeschrift. (2) Die Überschrift über der Liste im Kasten („Gesamtpunktestand“, „Endzeiten“, „Zeiten“, „Ergebnis Stechen“) ist nur noch für Screenreader da, sie wiederholte nur, was die Ansicht schon sagt. (3) Der grüne Rand um die Zeilen der Gewinner entfällt; der Sieg zeigt sich durch die Krone und den Gewinnerblock oben.
- **Endansicht nach dem Stechen (2026-11-17):** (1) Nach dem Stechen ist im Endstand jetzt der Reiter **„Stechen“** offen (er hat das Spiel entschieden), nicht mehr „Punktestand“. `ScoreScreen` kann dafür den zweiten Reiter zuerst öffnen (`extraTabFirst`). (2) **Fehler in der Spiellogik behoben:** Beim Stechen entschieden Millisekunden, angezeigt werden Zehntel; bei „1,1 s“ gegen „1,1 s“ gab es einen alleinigen Gewinner, obwohl beide Zeilen gleich aussahen und beide die Krone hatten. Jetzt zählt wie beim Rennen die Zehntelsekunde, gleiche Zeiten teilen den Sieg. (3) Bei gleichen Ergebnissen bleibt die Spielreihenfolge in der Liste.
- **„Karte 1/3“ im Stechen:** Im Kopf des Stechen-Zuges steht unter dem Teamnamen wieder „Karte 1/3“ (englisch „Card 1/3“), weil der Balken allein die Kartenzahl nur andeutet. Es ist die einzige zweite Zeile unter einem Teamnamen (bei Klassisch und Rennen gibt es keine). Text `tabooTiebreak.cardOf` wieder da.
- **Unentschieden: Knopf und Text (2026-11-17):** Wenn nach der letzten Runde zwei oder drei Teams gleichauf führen und das Stechen an ist, steht in der Übersicht nicht mehr „Endergebnis anzeigen“ (es folgt ja noch das Stechen), sondern **„Stechen starten“** und der Text **„Unentschieden! Als Nächstes das Stechen.“** statt „Spiel zu Ende.“. Das gilt auch für den Knopf „Endergebnis anzeigen“ bei unbegrenzten Runden. Die Regel, wann ein Stechen folgt, steht als `tiebreakFollows` in der Spiellogik und wird von der Oberfläche benutzt. Text `tabooRound.tieNext` neu.

### Hilfekonzept: Spielregeln erklären alles, i-Knöpfe nur Einzelnes

- **Nachtrag:** Der i-Knopf bei „Runden pro Team“ entfällt (selbsterklärend, die Werte stehen in den Auswahlknöpfen; die Regeln erklären Runden im Fenster „Spielregeln“). Text `tabooSetup.info.rounds` entfernt.

- Auf Wunsch des Auftraggebers neu aufgeteilt (Muster: Info-Symbol für kurze Erklärung genau dort, längeres im Hilfe-Bereich; kurz halten; zeigen statt erklären). **Spielregeln:** ein Fenster mit kurzen Teilen mit Überschrift: **Ziel, Die Karte** (mit **Beispielkarte** „Strand“ / „Beach“ und vier verbotenen Wörtern), **Ein Zug** (3 Schritte und die drei Knöpfe **Richtig, Überspringen, Verbotenes Wort** in ihren Farben mit je einem Satz), **Spielmodi** (Klassisch mit Link zum Stechen, Auf Zeit, je ein bis zwei Sätze) und **Einstellungen** (je eine Zeile). Die Auswahl der Modi im Fenster entfällt.
- **i-Knöpfe:** erklären nur noch die eine Einstellung, in höchstens zwei kurzen Zeilen (alle Texte in Deutsch und Englisch gekürzt, ohne Wiederholung der allgemeinen Regeln). Die Infos zu **„Runden pro Team“ und „Überspringen pro Runde“ haben nur einen Satz**, weil die Werte (Kurz 3, Mittel 5, Lang 10, Nie, ∞) in den Auswahlknöpfen direkt darunter sichtbar sind. Der i-Knopf an einem **Spielmodus** erklärt nur diesen Modus in einem Satz und hat einen Knopf **„Alle Regeln“**, der das Regelfenster öffnet.
- Code: `RulesSection` (ersetzt `RulesView`), `TabooRulesDialog` neu aufgebaut, Fenster für die Modus-Info in `TabooSetupForm`, Stile `kit-rules-*` und `taboo-rules-card`; Texte `tabooRules.*`, `tabooMode.classicInfo/raceInfo` neu, `classicRules/raceRules` und die alten Regelzeilen entfallen. Neuer Test `helpTexts.test.ts` hält die Kürze der i-Texte und des Regelfensters ein. Regeln dazu: `docs/GAMEHUB_UI_RULES.md` 2.5a. 660 Unit-Tests, 30 e2e-Tests grün.

### Spielregeln: Knopf in der Kopfleiste statt Knopf „Spieler“

- **Fehler behoben:** Ein Tipp auf den kleinen „i“-Knopf an einem Spielmodus wählte den Modus dahinter automatisch aus, weil der Info-Knopf den Modus mit setzte. Jetzt öffnet er nur das Regelfenster; der gewählte Modus bleibt, wie er war. Der Test prüft das für beide Modi und beide Sprachen.

- **Entscheidung des Auftraggebers (2026-11-15):** Die Spielregeln sind **kein Reiter**, sondern ein **Knopf „Spielregeln“ in der Kopfleiste** des Hauptmenüs, **statt des Knopfs „Spieler“** (der gehört zur Spielauswahl des GameHub). Er öffnet das Regelfenster; so bleiben die Reiter bei „Spieleinstellungen | Karten". Die kleinen **i-Knöpfe** an den Spielmodi öffnen das Fenster bei ihrem Modus (**ohne den Modus auszuwählen**, siehe Fehler unten), das Stechen bleibt ein Infofenster mit Link in den Regeln. Das Regelfenster bleibt für alle Modi gleich groß (alle Regeln übereinander, nur eine sichtbar), die Spielmodi sind Knöpfe in halber Breite.
- Code: neuer Baustein `RulesView` (ersetzt `RulesDialog`/`RulesButton`), `TabooRulesPanel` und `TabooRulesDialog`, `useGameRulesButton` und `GameRulesContext` in `GameChrome` (die `AppShell` zeigt den Knopf an der Stelle von `PlayerRosterButton`), Symbol `book`. Das Fenster „Aus Spielerliste wählen" hat den Knopf **„Spielerliste verwalten"** (`PlayerRosterDialog` ist aus dem Knopf herausgelöst). Texte: `kitSetup.rulesButton`, `kitRoster.manage`, `tabooRules.modes/title`. Tests für die Kopfleiste (GameHub hat „Spieler", das Spiel „Spielregeln"), das Regelfenster, die i-Knöpfe, den Link zum Stechen und die Verwaltung aus dem Auswahlfenster; die Layout-Prüfung prüft das Regelfenster. Links im Satz (`kit-link-button`) sind von der Mindestgröße der Tippfläche ausgenommen. 646 Unit-Tests, 30 e2e-Tests grün.

### Reiter wie im Browser statt aufklappbarer Kapitel (ADR-026)

- **Aufstellung:** Statt zweier aufklappbarer Boxen gibt es oben zwei Reiter **„Spieler (4)“** und **„Teams (2)“** (mit der Anzahl), darunter der Inhalt des gewählten Reiters. Vorausgewählt: „Teams“ bei Tabu, „Spieler“ bei Pflicht-Spielern. **Hauptmenü von Tabu:** die Kapitel „Spieleinstellungen“ und „Karten“ sind ebenso Reiter; die Einstellungen passen damit auf einen Bildschirm. Fehlt beim Start eine Kategorie, öffnet sich der Reiter „Karten“.
- **Look:** Die Reiter sitzen nebeneinander in gleicher Breite (44 Pixel hoch), der gewählte hat die Farbe der Inhaltsbox und verdeckt deren obere Linie, die anderen sind dunkler; die Box ist mit ihm verbunden. **Bedienung:** Tipp, Pfeiltasten links und rechts (mit Umlauf), Pos1 und Ende. Alle Reiter bleiben im Formular und werden beim Start gelesen.
- **Baustein `SetupTabs`** (`game-kit`, mit `selected`/`onSelect` auch von außen steuerbar), neue Texte `kitSetup.playersTab/teamsTab/lineupTabs/menuTabs`; die Kapitel-Texte `playersSection`, `teamsSection` und `kitTeams.summary` entfallen. `SetupSection` bleibt in der Datenansicht (Editor). Tests: `SetupTabs` (4), Aufstellung und Hauptmenü angepasst; e2e wählen den Reiter („Karten“, „Spieler“, „Teams“) und die Layout-Prüfung prüft die Reiter einzeln; 644 Unit-Tests, 30 e2e-Tests, Typen, eslint grün.

### Aufstellung vollständig abgesichert: Verzweigungen und e2e

- **Alle Verzweigungen der Aufstellung sind abgedeckt** (Logik und Oberfläche: `lineup`, `teamOrder`, `teamSetup`, `savedTeamSetup`, `LineupSetup`, `TeamsSetup`, `TeamOrder`, `PlayerAdder`, `usePlayerDrag`): neue Tests für leere Namen, andere Tasten am Griff, ein Ziehen auf demselben Platz, ein Ziel ohne gültiges Team, den Klick nach dem Ziehen, gespeicherte Gruppen mit nur Namen, nur Zuordnung oder nur Teamzahl, ein Spiel ohne Spielerliste und die alten Wörter der Reihenfolge. Nicht erreichbare Rückfallwerte wurden aus dem Code entfernt (`resolveLineup` und `buildTeams` zählen jetzt direkt, `TeamOrder` liest seine Liste sicher).
- **Neu e2e** (`e2e/lineup.spec.ts`, Desktop und Mobil, Deutsch und Englisch): Spieler hinzufügen, drei Teams, Auslosen, Spieler per Tipp in ein Team, ein Spieler per Maus gezogen, Team 3 per Tastatur an den ersten Platz, Spiel starten (Team 3 beginnt). Die **Layout-Prüfung** (`mobile-layout.spec.ts`) prüft die Aufstellung jetzt auch **mit Spielern** und mit **gefüllten Teams samt einem Spieler ohne Team**. Folge: Die Namensknöpfe sind **44 Pixel hoch** (vorher 40), weil die Prüfung die Tippfläche verlangt.
- Stand: 639 Unit-Tests, 30 e2e-Tests (6 mobile Layout-Prüfungen werden auf dem Desktop-Projekt übersprungen), Typen, eslint, Schichtgrenzen grün.

### Spieler per Tipp in ein Team: beide Wege

- Auf Wunsch gibt es **zwei Wege**, einen Spieler in ein Team zu bringen: Drag and Drop wie bisher oder **ein Tipp auf den Namen**, der ein Fenster „Team für …“ mit allen Teams und „Ohne Team“ öffnet (das aktuelle Team ist markiert, die Wahl gilt sofort). Der Tipp ersetzt das bisherige direkte Herausnehmen im Team; „Ohne Team“ im Fenster nimmt den Spieler heraus. Damit ist die Zuordnung auch mit der Tastatur und ohne Ziehen bedienbar (schließt die Lücke bei der Barrierefreiheit). Neuer Test für Tipp, Tastatur und Schließen; 630 Tests, Typen, eslint, e2e (26) grün.

### Teambox, ruhigeres Ablagefeld und Fehler bei „Letzte Teams laden“

- **Ein Team ist jetzt eine Box:** Namensfeld und Spielerfeld stehen zusammen in einer umrandeten Karte; das Spielerfeld ist ein dunkleres Feld ohne gestrichelten Rahmen (auch leer da, sobald es Spieler gibt), die Karte unter dem Zeiger leuchtet beim Ziehen. „Ohne Team“ ist genauso aufgebaut.
- **Kompaktere Teamreihenfolge:** Die Zeilen sind nur noch etwa 36 Pixel hoch (vorher 52); der Griff reicht mit seiner 44 Pixel großen Tippfläche über den Zeilenrand, die Zeile bleibt niedrig.
- **Fehler behoben:** „Letzte Teams laden“ bewirkte nichts, wenn oben keine Spieler hinzugefügt waren, weil die gemerkte Zuordnung auf die (leere) Spielerliste zugeschnitten wurde. Jetzt kommen die Teams mit den Spielern, die in ihnen stehen; fehlende Spieler werden der Liste hinzugefügt. Test dafür (beide Sprachen); 629 Tests, Typen, eslint grün.

### Spieler wieder per Drag and Drop in Teams ziehen; Standard links; Griff ohne Rahmen

- Auf Wunsch des Auftraggebers: **Spieler müssen in ein Team gezogen werden** (Maus oder Finger), damit sie dort stehen; **ein Tipp auf einen Spieler in einem Team nimmt ihn heraus** und legt ihn zu „Ohne Team“. Die Karte „Ohne Team (Spieler in ein Team ziehen)“ ist wieder da (nur wenn es Spieler ohne Team gibt, sowie beim Ziehen), die Karte unter dem Zeiger leuchtet, der Name folgt dem Zeiger, am Rand scrollt die Seite mit. Das Fenster zur Teamwahl und `kitTeams.pickTitle` entfallen; `usePlayerDrag` ist zurück im `game-kit` (Zeigerereignisse, `data-drop`).
- Bei der Teamreihenfolge steht **„Standard“ links** und „Zufällig“ rechts, der **Griff hat keinen Rahmen mehr** (bewusste Ausnahme von „jeder Knopf hat einen Rahmen“). Tests für Ziehen, Abbruch, Randscrollen und die Knopfreihenfolge; 627 Tests, Typen, eslint grün.

### Teamreihenfolge: sichtbar, per Tipp und mit zwei Knöpfen

- Die Auswahl „Zufällig | Wie eingegeben“ ist ersetzt. **Alle Teams stehen untereinander mit festen Plätzen** („1.“, „2.“, „3.“ …), das oberste beginnt, und lassen sich **am Griff per Drag and Drop beliebig umordnen** (Pfeiltasten auf dem Griff gehen auch). Darunter zwei Knöpfe in halber Breite: **„Zufällig“** (mischt alle, das erste beginnt) und **„Standard“** (Team 1, 2, 3 …, gesperrt wenn schon so). Neue Bausteinkomponente `TeamOrder` (Zeigerereignisse wie beim früheren Ziehen, `touch-action: none` am Griff), neues Symbol `grip`; Texte `kitTeams.orderDefault/orderMove`, `orderInfo` neu, `orderEntered` entfällt. Erster Entwurf mit „Tipp auf ein Team lässt es beginnen“ wurde verworfen.
- **Logik:** `TeamSetupValue.order` ist jetzt eine Liste von Teamnummern (leer = Standard) statt `"random"`/`"entered"`; `buildTeams` nimmt genau diese Reihenfolge, die Zufallsauslosung beim Start (`shuffleTeams`) entfällt. Neue reine Funktionen `normalizeOrder`, `moveTeam`, `randomOrder`, `isDefaultOrder` in `teamOrder.ts` (mit Tests); die Reihenfolge passt sich einer geänderten Teamanzahl an. Gemerkte Gruppen aus älteren Versionen (`"random"`/`"entered"`) werden gelesen und als Standard übernommen. Folge: Standard ist jetzt Team 1, 2, 3 …, bei Tabu beginnt also ohne Änderung das erste Team. 624 Tests, Typen, eslint, e2e (26) grün.

### „Spieler und Teams“ ist das Vorbild für alle Ansichten

- Auf Wunsch des Auftraggebers gilt die Aufstellung als Vorbild für jede Ansicht, damit die App einheitlich bleibt. Die Merkmale stehen in `docs/GAMEHUB_UI_RULES.md`, Abschnitt 2.0 (einfach und kompakt, aufklappbare Boxen mit Kurzinfo, bewährte Muster, Knöpfe mit Rahmen, immer sichtbar und bei Bedarf gesperrt, Bestätigung bei Zerstörerischem, konfigurierbare Bausteine).

### Spieler ohne Team beim Start: je Spiel einstellbar

- Neu in der `LineupConfig`: `unassignedPlayers` mit `ignore` (übergehen), `assign` (automatisch auf die kleinsten Teams verteilen, **Standard**) und `block` (Start verhindern). **Tabu nutzt `ignore`**, weil das Spiel keine Namen braucht: Tabu startet jetzt auch mit Spielern ohne Team, die Meldung entfällt. Neue reine Funktion `resolveLineup` (verteilt bei `assign` alphabetisch auf die jeweils kleinsten Teams, bei Gleichstand auf das erste), `validateLineup` meldet fehlende Teams nur noch bei `block`. Tests dafür (Business und Tabu), 615 Tests, Typen, eslint grün.

### Aufstellung nach dem Muster „Auslosen und Ergebnis“

- Auf Wunsch des Auftraggebers wurde nach bewährten Mustern anderer Apps gesucht (Quellen: Team-Zufallsgeneratoren, gespeicherte Spielerlisten wie bei Trivia Maker, Apples Richtlinien für Segmented Controls, Hinweise zu eindeutigem „nicht zugewiesen“). Gewählt: **Auslosen und Ergebnis**. Box „Spieler“: nur Feld, Spielerliste aus der Liste und eine einfache Liste (Name, Papierkorb); die Teamauswahl in der Liste entfällt. Box „Teams“: Teamanzahl, **Knopf „Teams auslosen“ / „Neu mischen“**, pro Team eine Karte mit Namensfeld und den Spielern als kleine Namensknöpfe, eine Karte „Ohne Team“ für noch nicht zugeordnete Spieler und die Reihenfolge. **Ein Tipp auf einen Namen** öffnet ein Fenster „Team für …“ mit allen Teams.
- Code: `TeamsSetup` enthält das Auslosen, die Karten und die Teamwahl (`Dialog`), `PlayersSetup` nur Hinzufügen und Liste (ohne `rules`). Texte `kitTeams.draw/redraw/pickTitle` neu, `kitPlayers.draw/moveLabel` entfallen; die Meldung beim Start sagt jetzt „Teams auslosen oder einen Namen antippen“. Die Namensknöpfe sind 40 Pixel hoch (die Tippfläche der übrigen Knöpfe bleibt 44). 612 Tests, Typen, eslint, e2e (26) grün. Hinweis: Eine gruppierte Button-Leiste (1 | 2 | 3) wurde nicht gebaut; Apple rät, Segmented Controls nicht für Aktionen wie „Laden“ oder „Leeren“ zu nutzen.

### Aufstellung radikal vereinfacht: eine Liste mit Teamauswahl

- **Laden und Leeren neu angeordnet:** Der Knopf „Alle Spieler entfernen“ und der Baustein `ClearButton` (Knöpfe in der Überschrift) entfallen. In der Box „Teams“ stehen „Letzte Teams laden“ und „Teams leeren“ nebeneinander je halbe Breite (der Knopf „Teams leeren“ ist der vorhandene `ConfirmButton`, der jetzt auch `disabled` kennt, mit Bestätigung „Sicher?“). Beide sind immer sichtbar und nur nicht bedienbar, wenn sie nichts ändern würden; ebenso „Letzte Spieler laden“ in der Box „Spieler“. 611 Tests, e2e (26) grün.

- **Leeren-Knöpfe:** Die Papierkorb-Knöpfe neben den Überschriften stehen links vom Zähler („Spieler: 4“) und sind kleiner (Rahmen kleiner als die Tippfläche, die bei 44 Pixel bleibt; jeder Knopf hat einen Rahmen) und brauchen eine Bestätigung: Der erste Tipp macht sie rot („Sicher?“), der zweite leert. Neuer Baustein `ClearButton` im `game-kit`, Texte `kitSetup.sure`, `kitPlayers.clearConfirm`, `kitTeams.clearConfirm`; 613 Tests, e2e (26) grün.

- Auf Wunsch des Auftraggebers („sehr einfach, aber kompakt“) entfallen Drag and Drop, das Feld „Ohne Team“, die Namensschilder, die Stift-Bearbeitung und der automatische Mitlauf am Bildschirmrand. Neu: **Box „Spieler“** mit Feld, Spielerliste und Zufallsverteilung und darunter **eine alphabetische Liste mit einer Zeile pro Spieler** (Name, Teamauswahl, Papierkorb); **Box „Teams“** nur noch mit Teamanzahl, einem Namensfeld je Team (darunter die Spieler als Textzeile) und der Reihenfolge. Bei Tabu ohne Namen bleibt nur die Teams-Box mit zwei Feldern.
- Code: `PlayersSetup` (jetzt gesteuert mit `TeamSetupValue` und `rules`) enthält Hinzufügen, Liste und Verteilen, `TeamsSetup` nur Anzahl, Namen und Reihenfolge, `PlayerAdder` ist eine eigene Datei. Entfernt: `usePlayerDrag`, `PlayerChips`, `smallestTeamIndex`, die Stile für Namensschilder, Ziehen, Pool und Bearbeiten sowie die Texte `dragHint`, `editTeam`, `doneEditing`, `chipLabel`. Die Konfiguration je Spiel (`LineupConfig`), die Startregeln, „Letzte Spieler/Teams laden“ und die Leeren-Knöpfe bleiben. Tests angepasst; 610 Tests, Typen, eslint, e2e (26) grün.

### Konfigurierbare Aufstellung: getrennte Boxen „Spieler“ und „Teams“ (Al-09-09, ADR-025)

- Auf Wunsch sind „Spieler“ und „Teams“ jetzt zwei getrennte, aufklappbare Boxen, und die Aufstellung ist je Spiel konfigurierbar: Jedes Spiel beschreibt sie einmal in einer `LineupConfig` (Spielerliste `off`/`optional`/`required` mit Mindest- und Höchstzahl, Teams `"off"` oder `TeamRules`). `LineupSetup` zeigt nur, was das Spiel braucht: Spiele ohne Teams nur „Spieler“ (mit Liste und Papierkorb), Spiele ohne Namen nur „Teams“. Bei Tabu ist „Spieler“ eingeklappt, „Teams“ offen; die Überschriften zeigen eine Kurzinfo („Spieler: 4“, „Teams: 2“).
- Neu: `business/shared/lineup.ts` (`LineupConfig`, `validateLineup` mit Tests), `business/games/taboo/lineup.ts`, `LineupSetup`, `SetupSection` mit `summary`. `TeamsSetup` bekommt `withPlayers` statt `players` und enthält das Verteilen und die Teamboxen; Spieler hinzufügen und die Spielerliste liegen in `PlayersSetup`. „Letzte Gruppe laden“ steht über den Boxen. Texte `kitSetup.playersSection`, `kitTeams.summary`, `kitLineup.*` in Deutsch und Englisch.
- **Fehler behoben:** Das Spiel ließ sich starten, wenn Spieler hinzugefügt, aber keinem Team zugewiesen waren. Jetzt verhindert `validateLineup` den Start und eine Meldung sagt, wie viele Spieler noch ohne Team sind. „Zufällig auf Teams verteilen“ erscheint erst, wenn Spieler da sind.
- **Nachbesserungen am selben Tag:** Der Knopf „Letzte Gruppe laden“ über den Boxen entfällt; jede Box lädt ihren Teil („Letzte Spieler laden“, „Letzte Teams laden“). Neben jeder Überschrift steht ein Papierkorb-Knopf, der die Box leert (Spieler entfernen, Teams zurücksetzen), ohne die Box zu öffnen oder zu schließen (`SetupSection` bekommt `action`). „Ohne Team (Spieler in ein Team ziehen)“ ist immer sichtbar (mindestens eine Reihe hoch, höchstens etwa zwei) und steht wieder fest statt mitzuscrollen, damit es den Startknopf nicht überdeckt. Texte: `kitTeams.loadLastTeams/clear`, `kitPlayers.clear`; `kitTeams.loadLast` entfällt.
- Tests: neue `LineupSetup`-Tests für alle Kombinationen, Startregeln in Tabu, 614 Tests, Typen, eslint, e2e (26) grün.

### Aufstellung: Spieler als Text, Teambox als Ablagefläche, Bearbeiten je Team

- Auf Wunsch deutlich kompakter. In den Teams stehen die Spieler nur noch als Text („Ben, Fritz“), das eigene Ziehfeld entfällt, die **ganze Teambox ist die Ablagefläche**. Gezogen wird aus „Ohne Team“; das Feld steht oben und bleibt beim Scrollen fest (höchstens 30 % der Bildschirmhöhe, innen scrollbar) und trägt den Hinweis „Spieler in ein Team ziehen“. Pro Team eine Zeile mit Namensfeld und Stiftknopf.
- Korrigieren geht über den **Stiftknopf** der Box: er listet die Spieler des Teams mit Teamauswahl (anderes Team oder „Ohne Team“) und Kreuz zum Entfernen, das Häkchen schließt. Das Entfernen ist ein Papierkorb-Symbol (ein Kreuz sah nach „aus dem Team nehmen“ aus, entfernt aber den Spieler ganz); aus dem Team nimmt man ihn über „Ohne Team“. Die Namen haben mehr Abstand zum Rand. Papierkorb und Häkchen haben gleiche Größe, Rahmen und rechte Kante. „Spieler hinzufügen“, „Aus Spielerliste wählen“ und „Zufällig verteilen“ stehen jetzt über den Teams, die Teamreihenfolge bleibt unten. **Alphabetisch:** Die Spieler eines Teams stehen immer alphabetisch sortiert (Teambox und Bearbeitungsliste, `Intl.Collator` der Oberflächensprache). Das ist nur die Anzeige; „Ohne Team“ bleibt in der Eingabereihenfolge. Ein leeres Team lässt sich nicht bearbeiten. **Reihenfolge und Name geändert:** Das Feld heißt jetzt „Spieler und Teams“ („Players and teams“); zuerst werden die Spieler hinzugefügt (Feld, Spielerliste, zufällig verteilen), darunter die Teams konfiguriert (Teamanzahl, „Ohne Team“, Teamboxen, Teamreihenfolge unten).
- Neue Texte `kitPlayers.dragHint/editTeam/doneEditing/moveLabel` in Deutsch und Englisch (`dropHint` entfällt); neue Stile `.kit-team__head/__members/__edit`, `.kit-members`, `.kit-pool__*` (`.kit-drop` entfällt). Tests für Bearbeiten (verschieben, herausnehmen, entfernen), Ziehen auf die Box, Abbruch und Randscrollen; 601 Tests, Typen, eslint und e2e (26 bestanden) grün. Im Browser mit 6 Teams und 12 Spielern auf Handybreite geprüft.

### Entwicklungs-Dashboard einheitlich gegliedert

- Eine Gliederung für alles: **Bereich → Phase → Aufgabe**. Jede Phase hat in `GAMEHUB_STATUS.json` das Feld `area` (`general` oder die ID eines Spiels) und erscheint nur in diesem Bereich. Die getrennte „Roadmap“ der Spiel-Tabs mit eigener Stufennummerierung ist entfernt; die Tabs zeigen dieselben Phasen wie „Allgemein“, nur gefiltert. Die Felder `gameIds` an Phasen und Aufgaben und `games[].roadmap` entfallen.
- Phasen sind nach Bereich und logischem Ablauf geordnet (zum Beispiel `Al-06` ans Ende von „Allgemein“, `Al-07` zu Tabu). Phasen- und Aufgaben-IDs bleiben unverändert und stabil; sie tragen weiter ihr historisches Kürzel.
- Der **Phasenstatus wird berechnet** (alle Aufgaben erledigt: erledigt; mindestens eine erledigt oder in Arbeit: in Arbeit; sonst geplant), ebenso der Projektfortschritt, und die Aufgaben einer Phase werden nach ID sortiert. `pnpm docs:sync` schreibt das in `GAMEHUB_STATUS.json`, `pnpm docs:check` schlägt bei Abweichung fehl. Das Dashboard zeigt den Phasenstatus als Marke.
- Qualitätswerte aktualisiert: 600 Unit-Tests, 26 E2E-Tests, Abdeckung 98,11 % Zeilen / 93,58 % Verzweigungen.
- Folge: Tabu zählt jetzt 57 statt 60 Aufgaben (die Desktop-Aufgaben von `Al-08` und Einzelaufgaben aus gemischten Phasen gehören nun zu „Allgemein“); der Gesamtfortschritt bleibt bei 82 von 148.

## 2026-11-13

### Tabu-Kapitel nach Spielmodus und Funktion geordnet

- Tabu-Aufgaben nach Spielmodus und Funktion geordnet. Die Abschlussaufgabe für die Zeitmodi trägt einen eindeutigen Titel.

### Einzelne Spielansichten geplant

- Wichtige Spielansichten im Entwicklungs-Dashboard als eigene Aufgaben mit Abnahmekriterien geplant.

### Entwicklungsreihenfolge in den Spieltabs

- Alle Spieltabs zeigen zuerst Regeln und Spiellogik, dann die Ansichten in Spielreihenfolge und zuletzt die Abnahme.

### Spielaufgaben nach Funktionen gebündelt

- Zusammengehörige Spielaufgaben zu 32 Funktionspaketen gebündelt. Die Prüffälle stehen bei der jeweiligen Aufgabe im Projektplan.

### Einzelne Regeln und Bedienaktionen als Aufgaben

- Mehrteilige Spielaufgaben in einzelne Regeln, Bedienaktionen und konkrete Prüffälle aufgeteilt.

### Umsetzungsschritte für vier Spiele präzisiert

- Die Umsetzung von Wortbombe, Imposter, Werwolf und Liar’s Bar ist in kleinere Aufgaben mit überprüfbaren Abnahmekriterien aufgeteilt.

### Planung für Werwolf und Liar’s Bar

- Werwolf und Liar’s Bar als eigene Spielbereiche geplant und im Entwicklungs-Dashboard ergänzt.

## 2026-11-13

### Großschreibung und Kategorie umbenennen

- **Erster Buchstabe groß:** Beim Hinzufügen und Bearbeiten einer Karte wird der erste Buchstabe des Begriffs und jedes verbotenen Wortes automatisch groß geschrieben („football“ wird „Football“, „net“ wird „Net“); die Leerzeichen werden dabei auch bereinigt. Neue Funktion `capitalizeFirst` im Business (nach den Regeln der Sprache der Karte). Karten des mitgelieferten Pools und schon gespeicherte eigene Karten bleiben unverändert.
- **Kategorie umbenennen:** Bei jeder eigenen Kategorie in der Kartenansicht gibt es den Knopf „Umbenennen“. Er öffnet ein Feld mit dem Namen (grünes Häkchen zum Speichern, „Abbrechen“); alle eigenen Karten dieser Kategorie in dieser Sprache bekommen den neuen Namen und der Name bleibt gespeichert. Abgelehnt werden ein leerer Name (“Gib einen Namen ein.”) und ein Name, den es schon gibt (eine andere eigene Kategorie derselben Sprache oder eine Standardkategorie; „Eine Kategorie mit diesem Namen gibt es schon.“). Erfolg: „Kategorie umbenannt.“. Die Bedienknöpfe der eigenen Kategorien nennen jetzt auch ihre Sprache, zum Beispiel „Kategorie Sport (EN) umbenennen“, weil derselbe Name in zwei Sprachen zwei Kategorien sind.
- **Großschreibung auch bei Kategorienamen:** Beim Umbenennen und beim Anlegen einer neuen Kategorie wird der erste Buchstabe des Namens groß geschrieben („ball spiele“ wird „Ball spiele“).
- **Umbenennen-Zeile geprüft und angepasst:** Im Browser (375 Pixel Breite) waren die Knöpfe zu nah beieinander und das Feld, das Häkchen und „Abbrechen“ nicht gleich hoch (eine allgemeine Regel gab Knöpfen im Spiel Abstand nach oben). Jetzt haben alle dieselbe Höhe (48 Pixel) auf einer Linie und 12 Pixel Abstand; die Knöpfe „Umbenennen“ und „Kategorie löschen“ teilen sich die **ganze Breite** und sind gleich breit (je 184 Pixel bei 375 Pixel Breite, im Browser gemessen), der Text bricht nicht um.
- **Doppelte Begriffe:** Das wurde schon geprüft: Ein Begriff, den es in der Sprache schon gibt (in jeder Kategorie, auch in den Standardkarten, ohne Beachtung der Groß- und Kleinschreibung), wird nicht hinzugefügt („Diese Karte gibt es schon.“).
- Tests (Deutsch und Englisch): Großschreibung beim Hinzufügen und Bearbeiten, Umbenennen mit leerem, vergebenem und Standardnamen, Speicherung in der Bibliothek.

### Karte hinzufügen: Beispiele in der Kategoriesprache, genaue Fehlermeldungen

- Die **Beispieltexte** in „Begriff“ und „Vier verbotene Wörter“ stehen in der **Sprache der Kategorie**: bei einer eigenen Kategorie ihre Sprache, bei „Neue Kategorie …“ die gewählte „Sprache der Kategorie“ (zuerst Englisch).
- Die Meldung beim Hinzufügen und beim Bearbeiten **sagt jetzt, was nicht stimmt** (vorher bei jedem Fehler derselbe Satz): „Gib einen Begriff ein.“, „Gib genau vier verbotene Wörter ein, mit Komma getrennt.“, „Ein verbotenes Wort steht doppelt. Alle vier müssen verschieden sein.“, „Ein verbotenes Wort ist der Begriff selbst.“, „Ein verbotenes Wort ist Teil des Begriffs. Das ist ohnehin verboten.“ (Deutsch und Englisch; bei mehreren Fehlern der erste in dieser Reihenfolge). Leere Einträge (zum Beispiel ein Komma am Ende) werden ignoriert.
- Die Prüfung auf doppelte Wörter gab es schon (auch bei anderer Groß- und Kleinschreibung oder mit Leerzeichen); nur die Meldung war falsch. Neue Texte in `tabooCardProblems`, Hilfsfunktionen in `cardProblem.ts`, Tests dafür.

### Benachrichtigungen auffälliger

- Die Benachrichtigung (`Toast`) sieht nicht wie ein Knopf aus: dunkler Grund wie die Seite, **dicker Rand** und ein **rundes Symbol** in der Farbe der Meldung (Fehler rot mit „!“, Erfolg grün mit „✓“, Hinweis blau mit „i“), fette Schrift, ohne Schatten. Knöpfe sind gefüllt, Benachrichtigungen nicht. **Längere Meldungen bleiben länger sichtbar**, weil man länger zum Lesen braucht: 3 Sekunden plus etwa 60 Millisekunden je Zeichen, mindestens 5 und höchstens 15 Sekunden (`readingTime`, zum Beispiel 130 Zeichen = 10,8 Sekunden). Der Text steht **in der Höhe mittig** (Symbol und Text auf einer Linie) und die Benachrichtigung **wächst mit mehrzeiligem Text** mit (gleicher Abstand oben und unten, gemessen bei einer und bei vier Zeilen). Regel dazu in `docs/GAMEHUB_UI_RULES.md`.

### Benachrichtigungen statt Meldungsboxen

- Die Meldungsboxen (`StatusMessage`, Feld mit farbigem Rand in der Seite) gibt es im ganzen Projekt nicht mehr. Stattdessen zeigt der neue Baustein `Toast` die Meldung als **Benachrichtigung unten**, die nach 5 Sekunden von allein verschwindet, keinen Platz in der Seite braucht und Eingaben nicht blockiert. Fehler melden sich als `alert`, Erfolg und Hinweise als `status`. `useNotice` zeigt dieselbe Meldung bei jedem Aufruf erneut.
- Umgestellt: Karte hinzufügen (Erfolg, Fehler), Kartenliste (Bearbeiten, Löschen), Import, die Meldungen des Hauptmenüs und der Aufstellung (zu wenige Karten, Eingaben ungültig), „Auf Zeit“ (zu wenige Karten), Stechen und Runde (keine Karten mehr; der Knopf „Neue Partie“ bleibt sichtbar). Das Hauptmenü zeigt seine Meldungen nur, solange es sichtbar ist (nicht doppelt hinter der Aufstellung).
- Kurze Meldungen stehen **ohne Überschrift** in einer Zeile (Karte hinzufügen, Kartenliste, Import: zum Beispiel „Karte hinzugefügt.“). Eine Überschrift bleibt nur bei „Keine Karten mehr“ und „Eingaben ungültig“, wo mehrere Zeilen folgen. Die Benachrichtigungen stehen immer **unten**.
- Tests: `Toast` (verschwindet, Alert und Status, neuer `key`) und `useNotice`; die bestehenden Tests liefen unverändert weiter.

### Englisch als primäre Sprache bei Sprachauswahlen

- Regel: Englisch ist bei jeder Sprachauswahl voreingestellt und das erste Element (dann Deutsch). Die Auswahl „Sprache der Kategorie“ beim Anlegen einer eigenen Kategorie steht auf Englisch und listet English vor German; die Kartensprache der Spieleinstellungen bestimmt sie nicht mehr. Die Regel steht in `docs/GAMEHUB_UI_RULES.md`. Offen: Beim ersten Start wird weiter die Sprache des Browsers gewählt, nicht Englisch.
- Ordner der Kategorieauswahl: Name der neuen Kategorie und ihre Sprache stehen über der Schwierigkeit (alles untereinander).

### Eigene Kategorien mit Sprache, Standardkategorien nicht wählbar

- **Karte hinzufügen:** Die Kategorieauswahl bietet nur noch **eigene Kategorien** (mit „(DE)“ oder „(EN)“) und „Neue Kategorie …“. Standardkategorien sind nicht mehr wählbar. Bei einer neuen Kategorie legt man **Name und Sprache** fest (neue Auswahl „Sprache der Kategorie“); jede Karte einer Kategorie hat deren Sprache. Der Titel heißt nur noch „Karte hinzufügen“ (ohne Sprache). Der Knopf „Karte hinzufügen“ ist grün (`success`) wie die anderen Hauptaktionen.
- **Kartenansicht:** Die Liste zeigt die eigenen Kategorien **beider Sprachen** mit Sprache hinter dem Namen und nur der Kartenanzahl. Beim Bearbeiten einer Karte sind nur eigene Kategorien derselben Sprache wählbar (eine alte eigene Karte in einer Standardkategorie bleibt dort wählbar).
- Neu im Business: `ownCategories` (eigene Kategorien aller Sprachen; gleicher Name in zwei Sprachen sind zwei Kategorien). Tests (Deutsch und Englisch) angepasst und ergänzt. Offen: Der Export bietet weiter nur die eigenen Kategorien der Kartensprache aus den Spieleinstellungen an.

### Kartenansicht: Kategorien, Sprache und leichtere schwere Karten

- Kartenansicht: Bei jeder Kategorie steht nur noch die **Kartenanzahl** (vorher „105 (15 eigene)“). Bei den Standardkategorien steht die Überschrift „Standard-Kategorien (Deutsch und Englisch)“ (nur in der Kartenansicht, nicht im Hauptmenü). **Eigene Kategorien** zeigen ihre Sprache hinter dem Namen, zum Beispiel „Sport (DE)“, in der Kartenansicht, im Hauptmenü (Kapitel Karten) und in der Kategorieauswahl beim Hinzufügen und Bearbeiten.
- Die **schweren Karten** waren teils zu schwer (Wörter, die die meisten nicht kennen, zum Beispiel „Aquifer“, „Fuge“, „Oszilloskop“, „Gregorianik“, „Nacktmull“). 42 Karten je Sprache sind ersetzt durch bekanntere, aber schwerer zu erklärende Begriffe (zum Beispiel „Klimawandel“, „Mona Lisa“, „Walross“, „Bürgermeister“, „Big Ben“). Der Pool hat weiter 900 Karten je Sprache, 30 je Schwierigkeit und Kategorie.
- Tests angepasst (Anzahl ohne „eigene“, „(EN)“ hinter eigenen Kategorien).

### Aufstellung vereinfacht: Teamkarten, Namensschilder, Drag and Drop

- Die Ansicht „Teams und Spieler“ (`TeamsSetup`, `PlayersSetup`) ist neu gestaltet: pro Team eine Karte mit Namensfeld und den Spielern als **Namensschilder**; darunter „Ohne Team“; ein Feld „Spieler hinzufügen“ mit Plus-Knopf statt des großen Textfelds; „Aus Spielerliste wählen“ und „Zufällig auf Teams verteilen“ nebeneinander; Teamreihenfolge zuletzt. Spieler werden per **Drag and Drop** (Maus und Finger, Zeigerereignisse) in ein Team gezogen; jedes Team hat ein Feld „Spieler hierher ziehen“. Ein Tipp nimmt einen Spieler aus dem Team und legt ihn zu „Ohne Team“, ein Tipp auf einen Spieler ohne Team schickt ihn ins kleinste Team; das Kreuz entfernt ihn. Name und Kreuz im Schild sind in der Höhe zentriert. Beim Ziehen am Bildschirmrand scrollt die Seite mit. Weg sind der aufklappbare Bereich, der lange Erklärtext, das Auswahlfeld je Spieler und die doppelte Teamliste.
- Neue reine Logik `business/shared/playerList.ts` (`addPlayersToText`, `removePlayerFromText`, `smallestTeamIndex`, mit Tests); neue Bausteine `PlayerChip`, `PlayerChips`, `PlayerAdder` und der Hook `usePlayerDrag` im `game-kit`, neues Symbol `close`. Entfernt: `PlayerListField`, `useAutoGrow`, `playersOpen` und die nicht mehr genutzten Texte und Stile. Die Namen werden mit großem Anfangsbuchstaben aufgenommen; doppelte (auch in anderer Schreibweise) und zu lange Namen werden übersprungen; Enter fügt hinzu und startet nicht das Spiel.
- **Fehler gefunden und behoben:** Die kleinen Infoknöpfe an der Überschrift einer Einstellung („Runden pro Team“, „Überspringen pro Runde“, „Teamreihenfolge“ …) lagen versteckt hinter den Auswahlknöpfen (eine allgemeine Regel gab ihnen 24 Pixel Abstand nach oben und die Lage stimmte nicht). Sie stehen jetzt am rechten Ende der Überschriftzeile und sind sichtbar.
- Der e2e-Test „offline“ wählte noch die abgeschaltete Kartenquelle „Beides“; der Schritt ist entfernt. e2e: 26 bestanden, 6 übersprungen wie bisher. Der Zufallstest der Zustandsmaschine bekam 30 s Zeitgrenze (lief unter Last in die 5 s). Neue Tests für Ziehen, Abbrechen und Randscrollen; vitest 600 Tests grün, Coverage-Schwellen erfüllt.
- Offen (nächster Schritt, wie angekündigt): Das Spiel lässt sich starten, wenn Spieler hinzugefügt, aber keinem Team zugewiesen wurden.

### KI-Kartenquelle abgeschaltet (ADR-024)

- Auf Wunsch des Auftraggebers ist die Einstellung „Kartenquelle“ weg: Es gibt keine KI-Auswahl mehr, gespielt werden nur die mitgelieferten Karten und die eigenen. `main.tsx` verdrahtet keinen Kartengenerator mehr. Der Code (Ollama-Adapter, feste Liste, Prüfung, Planung, Nachladen) bleibt ungenutzt im Projekt; `Al-10-03` beschreibt, was beim Wiederanschließen zu entscheiden ist (Anbieter Ollama oder LM Studio). Die App bleibt ohne Internet und ohne KI voll spielbar.

### Gesamtcheck: toter Code, Scrollposition, Wiederverwendung (Al-10-01)

- Neues Dokument `docs/GAMEHUB_QUALITY_CHECK.md` mit dem Ergebnis des Gesamtchecks (Schichten, toter Code, Wiederverwendbarkeit, Bedienung, Kartenquelle KI, offene Punkte). Neue Phase `Al-10` in Plan und Status: `Al-10-01` erledigt, `Al-10-02` (Container weiter aufteilen) und `Al-10-03` (Kartenquelle klären) geplant.
- **Schichten:** sauber (Prüfskript und Suche). Entscheidungen zum Kartenbedarf und zu den Anfragen an die Generatoren sind aus dem Container in die Business-Schicht gewandert (`cardPlan.ts`, mit Tests); das Stechen steckt in `useTabooTiebreak`.
- **Toter Code entfernt:** `GameHubFoundation`, die Funktionen und Typen der Sprachwahl in `languageSettings.ts`, `parseCardEntries`, `Category` und `validateCategory`, `saveGeneratedCards`, die leeren Platzhalter `data/index.ts` und `infrastructure/index.ts`, vier CSS-Klassen (Tests dazu entfernt).
- **Wiederverwendbar im game-kit:** `RulesDialog` und `RulesButton` (das Regelfenster mit Reitern, vorher Tabu-eigen) und `useScreenScroll`.
- **Bedienung:** Eine neue Ansicht (Kartenseite, Aufstellung, Spiel) beginnt oben statt an der Scrollposition der alten; das Hauptmenü steht beim Zurückkommen wieder an der alten Stelle (`useScreenScroll`, Test vorhanden; im Browser mit gesendeten Scroll-Ereignissen geprüft).
- **Prüfungen:** 589 Unit-Tests, Abdeckung 98,0 % Zeilen und 93,6 % Zweige (alle Grenzwerte erfüllt), `tsc`, `eslint`, Prettier ohne Befund; die e2e-Tests laufen (26 bestanden, 6 übersprungen wie bisher; Server von Hand gestartet, weil `pnpm` in der Shell fehlt).

### Ein Regelfenster mit allen Spielmodi als Reiter

- Das Fenster „Spielregeln“ ist **ein** Fenster für alle Spielmodi: oben stehen die beiden Regeln, die für jeden Modus gelten (Karte mit 4 verbotenen Wörtern, wie man erklärt), darunter die Spielmodi nebeneinander als Reiter und darunter die Regeln des gewählten Reiters. Der Reiter „Klassisch“ hat den Link zum Fenster „Stechen“ (schließt das Regelfenster, öffnet das Stechen-Fenster). Bedienung auch mit den Pfeiltasten.
- Der Infoknopf in einem Spielmodus öffnet **dasselbe Fenster** beim Reiter dieses Modus und **wählt den Modus aus**. Das bloße Umschalten der Reiter ändert die Auswahl nicht. Der Knopf „Spielregeln“ öffnet beim gewählten Modus. Dafür gibt es `InfoAction` (Infoknopf ohne eigenes Fenster, `onOpen`) im Baustein `InfoButton` und in `ChoiceOption.info`.
- Alle Fenster (`Dialog`) stehen jetzt auch auf dem Handy **mittig** mit Rand (vorher auf dem Handy ein Blatt von unten, erst ab 48 rem mittig). Das Regelfenster hat für alle Spielmodi **dieselbe Größe**: die Regeln aller Modi liegen übereinander im Layout und nur die des gewählten Reiters ist sichtbar, so verschieben sich die Reiter und Knöpfe nicht.
- Tests: Reiter und allgemeine Regeln, Infoknopf wählt den Modus aus, Link zum Stechen, Pfeiltasten (Deutsch und Englisch). Im Browser auf 375 Pixel Breite geprüft.

### Mehr Karten: alle Kategorien auf 30 je Schwierigkeit (Ta-09-08 abgeschlossen)

- Alle zehn Kategorien haben jetzt je Schwierigkeit 30 Karten: **900 Karten je Sprache** (vorher 523 und 521). Claude hat die Karten geschrieben; ein Vorfilter (nur lokal im Arbeitsordner) entfernte vorhandene Begriffe und begrenzte jede Zelle auf 30, danach liefen `import-card-batch` und `review-card-pool merge` mit den Prüfregeln (zum Beispiel kein verbotenes Wort als Teil des Begriffs).
- Nach dem Einbau stichprobenartig auf Wortstämme geprüft: neun neue Karten mit abgeleiteten Wörtern („aufpumpen“ bei „Fahrradpumpe“, „wenden“ bei „Pfannenwender“, „Zauberstab“ bei „Zauberer“ und weitere) bekamen andere verbotene Wörter; ebenso zwei englische Karten.
- Tests: alle 574 grün, Pool-Tests prüfen jede Karte mit der Kartenprüfung.

### Mehr Karten: Probelauf Essen und Trinken (Ta-09-08)

- Ziel festgelegt: 30 Karten je Schwierigkeit und Kategorie (900 je Sprache). Die Karten schreibt Claude, kein lokales Modell; die Skripte `import-card-batch` und `review-card-pool merge` prüfen sie mit den Prüfregeln und bauen sie ein.
- Probelauf mit der Kategorie Essen und Trinken: je 13 neue Karten je Schwierigkeit, Deutsch und Englisch, jetzt je 30. Der Pool hat 562 deutsche und 560 englische Karten. Die Prüfregeln lehnten 5 Karten ab (zweimal Begriff schon in einer anderen Kategorie, einmal „Topf“ als Teil von „Eintopf“); sie wurden ersetzt.
- Aus den Dokumenten entfernt: die Angabe, dass ein lokales Modell (Ollama, LM Studio) die Karten erzeugt.

### Karten: kein verbotenes Wort als Teil des Begriffs (Ta-09-07)

- Neue Prüfregel in der Kartenprüfung (`validateCard`, Fehlercode `part_of_term`): Ein verbotenes Wort ab 3 Buchstaben darf nicht in dem Begriff stecken. Bei „Fußball“ ist „Ball“ nicht erlaubt, weil Teile des Begriffs ohnehin verboten sind. Die Regel gilt beim Eingeben und Importieren von Karten, bei der Erzeugung und beim Spielstart (eine Karte, die dagegen verstößt, wird nicht gespielt). Die Fehlermeldung beim Hinzufügen nennt die Regel (Deutsch und Englisch).
- Bestand geprüft: Der große Pool (523 deutsche, 521 englische Karten) hat keinen Treffer, weil das Erzeugungsskript die Regel schon prüft. Die von Hand geschriebenen Standardkarten hatten 9 Treffer, zum Beispiel „Regenschirm“ mit „Regen“ oder „Toothbrush“ mit „brush“; sie haben jetzt andere verbotene Wörter. Die lokalen Kandidaten haben keinen Treffer.
- Tests: Regel mit Beispielen (Groß- und Kleinschreibung, mehrere Wörter, kurze Wörter bleiben erlaubt).

### IDs der Aufgaben umbenannt: Al, Ta, Wb, Im

- Alle Phasen- und Aufgaben-IDs tragen jetzt ein Kürzel, damit allgemeine Aufgaben und Aufgaben der einzelnen Spiele leicht zu unterscheiden sind: `Al-01-01` (allgemein), `Ta-01-01` (Tabu), `Wb-01` (Wortbombe), `Im-01` (Imposter). Beispiele: `PH-12-07-B` ist jetzt `Ta-06-07-B`, `PH-17-08` ist `Al-09-08`, `PH-15-07` ist `Ta-09-07`. Die Phasen zählen je Kürzel ab 01, die Aufgabennummern innerhalb einer Phase blieben gleich.
- Zuordnung: Al-01 bis Al-09 = bisher PH-00, 01, 02, 03, 08, 09, 10, 16, 17. Ta-01 bis Ta-09 = bisher PH-04, 05, 06, 07, 11, 12, 13, 14, 15. Wb-01 = PH-18, Im-01 = PH-19. Annahme: PH-06 und PH-14 gehören zu Tabu.
- Geändert in allen Dokumenten (Plan, Status, Changelog, ADRs, Spielbausteine, Tabu-Dokumente), im Erzeugungsskript, in einem Code-Kommentar und in den Gedächtnisnotizen. Auch „Phase 16“ heißt jetzt „Phase Al-08“. Das ID-Schema steht im Projektplan.

### Neue Aufgaben im Plan

- `Ta-09-07`: Karten erneut prüfen, kein verbotenes Wort darf ein Teil des Begriffs sein (bei „Fußball“ nicht „Ball“). `Ta-09-08`: noch mehr Karten erzeugen. Beide geplant, noch nicht begonnen.

### Fenster „Spielregeln“ gekürzt

- Das Fenster „Spielregeln“ enthält nur noch, was für alle Modi gilt (Karte mit Begriff und 4 verbotenen Wörtern, wie man erklärt). Punkte, Spielende und „Auf Zeit“ stehen nur noch bei den Infoknöpfen der Spielmodi, damit nichts doppelt erklärt wird.

### Infofenster ohne Schatten

- Der Schatten um die Infofenster (`.dialog`) ist entfernt; das Fenster steht nur noch vor dem abgedunkelten Hintergrund.

### Ergebnisse korrigieren in allen Spielmodi (Ta-06-07-F)

- Stechen und „Auf Zeit“: Jeder Versuch speichert alle Karten mit Ergebnis. Nach dem Durchgang und auf der Endseite kann man jede Karte zwischen richtig und falsch umschalten (Feld „Ergebnis korrigieren“, ein aufklappbarer Eintrag pro Team). Wertung und Sieger werden neu berechnet (neue Ereignisse `reviseTiebreakResult` und `reviseRunResult`). Übersprungene Karten bleiben unverändert; mehr richtige Karten als erlaubt gehen nicht.
- Entscheidung: Beim Stechen und bei „Auf Zeit“ gibt es **keine Zeitstrafe**. Eine falsch gewertete Karte zählt nicht; weniger Karten stehen hinter mehr Karten, bei gleich vielen entscheidet die Zeit. In „Auf Zeit“ zeigt die Liste dann „x/y Karten · Zeit“.
- Die Klassisch-Runde hatte die Korrektur schon; die Kartenliste ist jetzt ein gemeinsamer Baustein (`TabooReviewList`).
- Tests: Logik (`revise.test.ts`: Rangfolge, Gleichstand, Grenzen, Zwischenstand, Spielende) und Oberfläche (Stechen, „Auf Zeit“ in Deutsch und Englisch).

### Stechen-Ansicht mit Verweis aus den Regeln

- Neuer letzter Stichpunkt in den Regeln „Klassisch“: „Bei Unentschieden gibt es ein **Stechen**.“ Das Wort „Stechen“ ist ein Link: Ein Klick schließt das Fenster des Modus und öffnet das eigene Fenster „Stechen“ (Deutsch und Englisch, Text `tabooSetup.info.tiebreak`, Titel `tabooTiebreakInfo.title`). Derselbe Infoknopf sitzt jetzt in der Option „An“ unter „Stechen bei Gleichstand“ statt an der Überschrift. Kein größerer Abstand mehr beim letzten Punkt.
- `InfoButton` kann von außen gesteuert werden (`open`, `onOpenChange`) und zeigt Inhalte, die kein Text sind, in einem `div`; neue Klasse `kit-link-button` für Links im Text. Regel in `docs/GAMEHUB_UI_RULES.md`.
- Tests: Link aus den Regeln öffnet das Fenster „Stechen“ und schließt das Regelfenster (beide Sprachen), Fenstertitel der Einstellung angepasst.

### Spielregeln und Karten in ihren Kapiteln, Regeln pro Spielmodus

- Die Werkzeugleiste unter der Kopfleiste ist weg. Der Knopf „Spielregeln“ steht ganz oben im Feld „Spieleinstellungen“, der Knopf „Karten“ (Editor) ganz oben im Feld „Karten“ (`ADR-021`, `docs/GAMEHUB_UI_RULES.md`). `SetupScreen` hat dafür keine Plätze `rules` und `editor` mehr.
- Regel ergänzt: Jeder Spielmodus hat einen aufklärenden Infoknopf, der beim Klick die Auswahl nicht ändert und den Modus in einem eigenen Fenster erklärt.
- Jeder Spielmodus hat seine eigenen Regeln hinter einem Infoknopf in seiner Auswahlkarte (neu: `ChoiceOption.info` und `InfoButton` mit `className`). Das Fenster erklärt nur diesen Modus (neue Texte `tabooMode.classicRules` und `tabooMode.raceRules`, Deutsch und Englisch). Der einzelne Infoknopf an der Überschrift der Gruppe ist ersetzt; das allgemeine Fenster „Spielregeln“ bleibt.
- Regeln „Klassisch“ korrigiert: Der Satz „Die Gegner achten auf verbotene Wörter“ ist gestrichen (das kann die App nicht; auch im Fenster „Spielregeln“). Das **Stechen** wird nicht beim Spielmodus erklärt, sondern beim Infoknopf der Einstellung „Stechen bei Gleichstand“ (wer mitspielt, 3 Karten leicht, mittel, schwer, 90 Sekunden, Wertung, gemeinsamer Sieg bei „Aus“).
- Klassisch: Punkte und Sieg in einem Stichpunkt zusammengefasst („Für jeden erratenen Begriff gibt es 1 Punkt. Das Team mit den meisten Punkten gewinnt.“), jetzt 3 Punkte.
- Die Regeln der Modi sagen nur noch kurz, **was man tun muss und wie man gewinnt** (Klassisch 3 Punkte, Auf Zeit 2). Überspringen, verbotene Wörter als Knopf und die Namen der Knöpfe stehen nicht mehr dort, weil Einstellungen und Knöpfe in der Runde selbsterklärend sind. Im Fenster „Spielregeln“ entfällt die Zeile zum Überspringen, die Wertung nennt nur noch den Punkt für jeden erratenen Begriff.
- Alle Erklärungen noch kürzer: zusammengehörige Aussagen stehen in **einem** Stichpunkt statt in mehreren (Klassisch jetzt 5 Punkte, Auf Zeit 3, Stechen 5). Zum Beispiel: „Ein Spieler erklärt den Begriff seinem Team, ohne die 4 verbotenen Wörter, den Begriff selbst oder Teile davon zu sagen.“ und „Jeder erratene Begriff gibt 1 Punkt.“ Regel dazu in `docs/GAMEHUB_UI_RULES.md`.
- Regeln „Klassisch“ von Grund auf verständlich neu geschrieben, für jemanden, der Tabu nicht kennt: Auf jeder Karte steht ein Begriff und 4 verbotene Wörter; man darf sie nicht sagen, auch nicht den Begriff selbst oder Teile davon (Beispiel „Fußball“ und „Ball“); die Knöpfe „Richtig“, „Verbotenes Wort“ und „Überspringen“ sind mit ihren echten Namen erklärt; die Zeit läuft, danach ist das nächste Team dran. Dasselbe im Fenster „Spielregeln“ (Deutsch und Englisch).
- Alle Regeln und Erklärungen (Fenster „Spielregeln“, Infoknöpfe der Einstellungen und der Modi) einfacher und kürzer formuliert und als Stichpunkte geschrieben (Deutsch und Englisch). Regel dafür in `docs/GAMEHUB_UI_RULES.md`.
- Die Erklärungen der Spielmodi und „Karten pro Team“ stehen jetzt in **Stichpunkten** (eine kurze Aussage pro Punkt, Deutsch und Englisch). `InfoButton` zeigt einen Text mit mehreren Zeilen als Liste; die Regel steht in `docs/GAMEHUB_UI_RULES.md`. Das allgemeine Fenster „Spielregeln“ hat für „Auf Zeit“ einen kurzen Satz.
- Infoknopf in der Auswahlkarte: Die Animation beim Klicken ist behoben (die senkrechte Zentrierung per `transform` sprang, weil Knöpfe beim Drücken per `transform` kleiner werden; jetzt ohne `transform` zentriert). Die Regeln „Auf Zeit“ (Infoknopf, Fenster „Spielregeln“) und die Erklärung „Karten pro Team“ sind in einfachen kurzen Sätzen neu formuliert (Deutsch und Englisch).
- Tests: Infoknöpfe pro Modus in beiden Sprachen, Kapitel mit Regeln und Editor im `SetupScreen`-Test. Im Browser auf 375 Pixel Breite geprüft, die Layoutprüfung bleibt grün (Infoknöpfe 44 Pixel).

### Kopfleiste umgebaut

- Neue Regel: Links steht der Spielname (der blaue Punkt davor ist entfernt), rechts die Knöpfe **Spieler**, **Einstellungen** und ganz rechts **Home**. Home steht immer ganz rechts. (Zwischenstände mit Home links und mittigem Namen wurden am selben Tag wieder verworfen.)
- Der Knopf „Spieler“ steht nun im Hauptmenü jedes Spiels ebenfalls in der Kopfleiste (wie in der Spielauswahl) und nicht mehr in der Werkzeugleiste darunter; die Werkzeugleiste hat nur noch Editor (falls vorhanden) und Spielregeln, `SetupScreen` bringt den Spielerknopf nicht mehr mit.
- Unteransichten (Spiel, Editor) behalten ihre Kopfleiste: nur Zurück, Pause oder „Spiel beenden“ oben rechts, kein Home und keine Einstellungen.
- Tests: Reihenfolge der Knöpfe in der Spielauswahl und im Hauptmenü eines Spiels sowie kein Farbpunkt mehr. Im Browser auf 375 Pixel Breite geprüft.

### Spielerverwaltung überarbeitet

- Das Fenster hat immer dieselbe Größe: Die Listenfläche hat eine feste Höhe, bei mehr Spielern erscheint ein Scrollbalken (ebenso in der Auswahl aus der Spielerliste). Die Fehlermeldung hat eine feste Zeile, damit sich nichts verschiebt.
- Namen werden automatisch korrigiert: Der erste Buchstabe wird ein Großbuchstabe (`capitalizePlayerName`, gilt auch für gespeicherte Namen).
- „Hinzufügen“ ist ein Plus-Symbol (Beschriftung und Tooltip bleiben).
- Der Löschknopf steht außerhalb der Namenszeile; der Name hat eine eigene Box.
- Löschknöpfe mit Bestätigung (`ConfirmButton`, rote Variante): vor dem ersten Tippen ein dezentes Rot, danach ein kräftiges deckendes Rot. Knöpfe nur mit Symbol (Spielerliste, Karteneditor) zeigen keinen Text mehr, der nicht hineinpasst; nur der Name für Screenreader ändert sich. Die Regeln dazu stehen in `docs/GAMEHUB_UI_RULES.md`.
- Der Plus-Knopf und die Löschknöpfe sind gleich groß (44 Pixel, quadratisch) und enden am selben Rand. Der Scrollbalken hat eine feste Breite mit reserviertem Platz und liegt rechts neben den Löschknöpfen mit Abstand (im Rand des Fensters), die Knöpfe behalten ihren Platz.
- Das Eingabefeld für neue Spieler sieht aus wie die Namensboxen der Liste (44 Pixel hoch, gleiche Ecken, kein gefüllter Hintergrund). Die Spielerliste zeigt immer genau fünf Spieler vollständig, keiner ist angeschnitten; beim Scrollen rastet die Liste an ganzen Zeilen ein (gilt auch für die Auswahl aus der Spielerliste).
- Fehler behoben: Das Fenster saß in der Kopfleiste (Spielerknopf des GameHub) wegen deren Unschärfe nicht am unteren Rand, sondern wurde nach oben aus dem Bild verschoben. `Dialog` hängt sich jetzt per Portal an die Seite (`document.body`), kein Elternelement kann die Lage mehr verändern. Test dafür ergänzt.
- Notiert für später (`Al-09-08`, geplant): Spielergruppen (zum Beispiel mehrere Freundesgruppen), um Namen schneller zu finden.
- Geprüft: 546 Unit-Tests, 26 e2e-Tests (6 übersprungen), Typen, ESLint, Prettier; im Browser auf 375 Pixel Breite.

### Al-09-07 – Aufstellung nach dem Start

- Das Hauptmenü von Tabu enthält nur noch Spieleinstellungen und Karten. „Starten“ führt zur neuen Ansicht **Aufstellung**: Teams, Namen, Reihenfolge, Spielerliste (offen), Auswahl aus der gespeicherten Spielerliste und Zuweisung von Hand oder per Knopf zufällig. „Spiel starten“ steht fest unten; die Kopfleiste hat den Zurückknopf (`ADR-023`, ändert die Regel aus `ADR-021`).
- Neu im `game-kit`: `LineupScreen` (Rahmen mit Meldungen und Startknopf), `TeamsSetup` kann die Spielerliste offen zeigen (`playersOpen`).
- Tabu: `TabooSetup` liest die Einstellungen beim ersten Start einmal (`readTabooSettings`, neuer reiner Teil in `tabooSetupModel.ts`) und bereitet erst beim Start der Aufstellung die Karten vor, weil dort die Teamzahl feststeht (auch die Prüfung auf genug Karten und die KI-Kartenvorbereitung). `TabooSetupMessages` zeigt die Fehler in beiden Ansichten. Ein Teamwechsel während der Kartenvorbereitung bricht sie ab.
- „Mit gleicher Konfiguration neu spielen“ führt in die Aufstellung (Teams vorbelegt), die Karten des vorigen Spiels werden wiederverwendet, wenn sie für die neue Aufstellung reichen. Im Endstand wird nichts gelost oder verteilt.
- Tests: neue Tests für die Aufstellung und `LineupScreen`, alle Abläufe um den zweiten Schritt ergänzt (Unit, e2e, Sprachdurchlauf, Handy-Layoutprüfung der Aufstellung in beiden Sprachen).
- Geprüft: 544 Unit-Tests, 26 e2e-Tests (6 übersprungen), Typen, ESLint, Prettier, Schichtprüfung; im Browser auf 375 Pixel Breite.

### Fehler behoben: „Neue Partie konfigurieren“ nach „Auf Zeit“

- Nach dem Endstand von „Auf Zeit“ blieb der Endstand stehen und das Setup erschien darunter, die Knöpfe taten nichts mehr. Ursache: Das Rennen und das Setup-Formular benutzten im selben Container beide den Schlüssel `0` (React meldete doppelte Schlüssel), dadurch wurde das Rennen nicht entfernt. Die Schlüssel haben jetzt Vorsilben (`race-…`, `form-…`).
- Der Komponententest prüft jetzt, dass nach „Neue Partie konfigurieren“ der Endstand verschwunden ist (vorher prüfte er nur, dass das Setup sichtbar ist). Im Browser geprüft: Endstand, „Mit gleicher Konfiguration neu spielen“, nochmal Endstand, „Neue Partie konfigurieren“.

### Auf Zeit: faire Karten für alle Teams

- Frage des Auftraggebers: Bekommen alle Teams dieselbe Schwierigkeitsmischung? Die Mischung war je Lauf gleich verteilt, konnte aber still abweichen: Fehlte eine Schwierigkeit, füllte die Kartenwahl aus einer anderen auf, ebenso bei Ersatzkarten.
- Jetzt streng: Die Kartenwahl (`raceCards.ts`) liefert genau die Mischung (bei 5 Karten 2 leichte, 2 mittlere, 1 schwere) und nie Karten einer anderen Schwierigkeit; Ersatzkarten haben dieselbe Schwierigkeit, sonst sind Überspringen und Verbotenes Wort gesperrt. Die Mischung gilt nur für die im Setup gewählten Schwierigkeiten.
- Neu: `raceCardShortage` prüft vor dem Start, ob jede benutzte Schwierigkeit genug Karten hat (Karten aller Läufe plus zwei Ersatzkarten je Team). Sonst meldet das Setup „Zu wenige Karten der Schwierigkeit …“ (Deutsch und Englisch), statt ungleiche Karten zu geben.
- Tests: Mischung bei mehreren Teams nacheinander, Filter, kein Auffüllen, Kartenmangel, ganze Oberflächenläufe (beide Teams haben dieselbe Mischung) und die Meldung in beiden Sprachen.
- Geprüft: 541 Unit-Tests, 26 e2e-Tests (6 übersprungen), Typen, ESLint, Prettier, Schichtprüfung.

### Setup in drei Felder, Standard 5 Karten

- Das Tabu-Setup hat jetzt drei Felder: „Teams und Spieler“, „Spieleinstellungen“ (Spielmodus und die Gruppen des gewählten Modus) und „Karten“ (Kartensprache, Kartenquelle, Schwierigkeit, Kategorien). Einstellungen, die nicht vom Spielmodus abhängen, sind damit von den Spieleinstellungen getrennt. Regel in `docs/GAMEHUB_UI_RULES.md` ergänzt.
- „Karten pro Team“ im Modus „Auf Zeit“ steht standardmäßig auf 5 (Auswahl 5, 10, 15).
- Geprüft: 533 Unit-Tests, 26 e2e-Tests (6 übersprungen), Typen, ESLint, Prettier; im Browser auf 375 Pixel Breite.

### Ta-06-07-B – Oberfläche „Auf Zeit“

- Setup: Neue Knopfgruppe „Spielmodus“ (Klassisch, Auf Zeit) in den Spieleinstellungen. Im Modus „Auf Zeit“ erscheint „Karten pro Team“ (5, 10, 15) statt Runden, Rundendauer, Überspringen und Stechen; Kartenquelle, Schwierigkeit und Kategorien bleiben. Info-Knöpfe erklären beide Gruppen. Das Rennen braucht je Team Zielzahl plus zwei Ersatzkarten, sonst meldet das Setup den Kartenmangel.
- Spiel: `TabooRaceGame` (Übersicht vor jedem Lauf mit den bisherigen Zeiten, Endstand mit Sieger und sortierten Zeiten über `ScoreScreen`), `TabooRaceRun` (Stoppuhr, Karte, Richtig, einmal Überspringen, Verbotenes Wort mit Ersatzkarte, Pause mit „Lauf neu starten“) und `TabooRaceResults`. Die Spiellogik bleibt in `race.ts`; die Oberfläche liefert nur Uhr und Ersatzkarten.
- Das Fenster „Spielregeln“ erklärt den neuen Modus. Alle Texte in Deutsch und Englisch.
- Fehler behoben: Die Auswahlgruppen im Tabu-Setup hatten wieder einen eigenen Rahmen (Rückschritt des letzten Umbaus der Einstellungen); der Stil in `taboo.css` ist bereinigt.
- Beim Wechsel des Spielmodus bleiben alle Einstellungen erhalten: Die Gruppen beider Modi bleiben im Formular und werden nur ausgeblendet (statt neu aufgebaut), auch bei Wechsel hin und zurück.
- Tests: Komponentenläufe in beiden Sprachen (Setup-Gruppen, ganzes Rennen mit zwei Teams und Sieger, Überspringen und verbotenes Wort) und eine neue Handy-Layoutprüfung aller Rennansichten (Setup, Übersicht, Lauf, Pause, Endstand) in beiden Sprachen.
- Geprüft: 533 Unit-Tests, 26 e2e-Tests (6 übersprungen), Typen, ESLint, Prettier, Schichtprüfung; im Browser auf 375 Pixel Breite.

## 2026-11-12

### Ta-06-07-A – Spiellogik „Auf Zeit“

- Neu: `src/business/games/taboo/race.ts`, eine reine Zustandsmaschine mit eigener Konfiguration (`RaceConfiguration`): Zustände `overview`, `running`, `finished`; Ereignisse `beginRun`, `answerCard` (richtig, überspringen einmal, verbotenes Wort, jeweils mit Ersatzkarte), `restartRun`. Zeiten kommen von außen (ungültige Werte werden ignoriert), Sieger nach Zehntelsekunden, gleiche Zeit ist gemeinsamer Sieg. Zielzahlen 5, 10, 15 (Standard 10).
- Neu: `raceCards.ts` mit gleicher Schwierigkeitsmischung für jedes Team, Auswahl ungespielter Karten und Ersatzkarten gleicher Schwierigkeit.
- `validateTeams` aus `model.ts` herausgelöst, damit alle Modi dieselbe Teamprüfung nutzen (klassischer Modus unverändert).
- Tests: Regeltests, Kartentests und eine Zufallsprüfung mit 60 Durchläufen und Invarianten; Abdeckung von `race.ts` 100 % Zeilen, 95 % Zweige.
- Entwurf angepasst: eigene Konfiguration je Modus statt `mode` in `GameConfiguration`; Kartengerechtigkeit (Annahme 6) als gleiche Schwierigkeitsmischung umgesetzt.
- Geprüft: 527 Unit-Tests, Typen, ESLint, Prettier, Schichtprüfung. Die Oberfläche folgt in `Ta-06-07-B`.

### Ta-06-07 – Regelentwurf der Spielmodi

- Der Auftraggeber hat die Abläufe der Modi festgelegt. „Auf Zeit“: jedes Team spielt am Stück bis zur Zielzahl, Überspringen einmal pro Team mit ersetzter Karte, gleiche Zeit ist gemeinsamer Sieg. „Gegen die Zeit“: Zeitkonto 2, 3 oder 5 Minuten; der Vorschlag „Gegnerteam erklärt“ wurde abgelehnt, weil es absichtlich trödeln könnte, deshalb erklärt und rät das aktive Team selbst.
- `docs/GAMEHUB_TABOO_MODES.md` hält die Regeln, die Einbindung in die Architektur (zwei neue reine Zustandsmaschinen, `mode` in der Konfiguration, Knopfgruppe „Spielmodus“ im Setup, bestehende Ansichtstypen), die Teilaufgaben A bis E und sieben offene Annahmen fest. Es wurde noch nichts gebaut; `Ta-06-07` steht auf `in_progress` bis zur Bestätigung.

### Kartensprache ist eine Einstellung von Tabu

- Das Einstellungsfenster des GameHub enthält nur noch die Oberflächensprache. Die Kartensprache steht als erste Knopfgruppe (Englisch links) in den Spieleinstellungen von Tabu.
- Der Spielmodul-Vertrag (`GameScreenProps`) bekommt `onCardLanguageChange`; `App` reicht es durch, `AppShell` und `SettingsDialog` kennen die Kartensprache nicht mehr. Die Speicherung bleibt zentral in `AppRoot` (Annahme: ein eigener Speicher je Spiel ist erst nötig, wenn ein zweites Spiel eine eigene Inhaltssprache braucht).
- Texte der Einstellungen angepasst, Tests (Unit und e2e) auf den neuen Ort umgestellt, neue Tests für die Gruppe in beiden Sprachen.
- Geprüft: 443 Unit-Tests, 25 e2e-Tests (5 übersprungen), Typen, ESLint, Prettier.

### Al-01-08 – Aufgaben nach Spielen

- Das Entwicklungs-Dashboard zeigt allgemeine und spielspezifische Aufgaben in eigenen Tabs.

### Einstellungen: Knopfgruppen statt Comboboxen

- Oberflächensprache und Kartensprache im Einstellungsfenster sind jetzt je eine Gruppe nebeneinanderstehender Knöpfe (`ChoiceGroup`, gesteuert) statt Comboboxen; passt zum übrigen Setup. Die Gruppen haben dieselben Namen wie die Comboboxen (Gruppe „Oberflächensprache“ mit Knöpfen „Deutsch“ und „Englisch“).
- `ChoiceGroup` ist jetzt im Kit grundsätzlich ohne Rahmen und Innenabstand (die Tabu-Sonderregel entfällt); alte Stilregeln für die Comboboxen entfernt.
- Englisch steht links (Standardsprache der App), Deutsch rechts.
- Tests (Unit und e2e) auf die Knöpfe umgestellt. Regel ergänzt: Auswahl aus wenigen festen Möglichkeiten ist eine Knopfgruppe. Noch Comboboxen: Kategorie und Schwierigkeit in den Karten und die Teamzuordnung je Spieler.

### GameHub-Ansicht auf dem Handy kompakt

- Der Knopf „Spieler“ des GameHub steht jetzt in der Kopfleiste (neben den Einstellungen) statt im Inhalt der Spielauswahl, mit Symbol und Text, weil das Symbol allein nicht selbsterklärend ist.
- Die Spielauswahl ist auf dem Handy kompakt: Überschrift und Einleitung sind nur noch für Screenreader sichtbar (ab Tabletbreite wie bisher sichtbar), die Spielkarten beginnen direkt unter der Kopfleiste.
- Geprüft: 440 Unit-Tests, 25 e2e-Tests (5 übersprungen), im Browser auf 375 Pixel Breite.

### Al-09-06 – Spielerverwaltung

- Neu: dauerhaft gespeicherte Spielerliste für alle Spiele (`ADR-022`). Reine Logik in `src/business/shared/playerRoster.ts` mit Tests, Port `PlayerRosterStore`, Adapter im lokalen Browserspeicher (`gamehub.players`; kaputte Daten werden ignoriert, fehlender Speicher bricht nichts).
- Knopf „Spieler“ in der Werkzeugleiste jedes Spiel-Hauptmenüs (kommt automatisch aus `SetupScreen`) und auf der Spielauswahl des GameHub. Er öffnet ein Fenster zum Hinzufügen (Enter oder „Hinzufügen“) und Löschen (zwei Tipps) von Spielern; Meldungen bei leerem, doppeltem oder ungültigem Namen.
- In „Teams und Spieler“ (`TeamsSetup`, `PlayersSetup`) wählt „Aus Spielerliste wählen“, wer heute mitspielt (Häkchen, „Alle wählen“, „Übernehmen“, „Abbrechen“). Ausgewählte kommen ins Spielerfeld, abgewählte Listenspieler gehen, von Hand getippte Namen bleiben. Danach wie bisher verteilen. „Letzte Gruppe laden“ (`Al-09-03`) bleibt.
- Werkzeugleiste unter der Kopfleiste ist jetzt eine Reihe mit gleich breiten Knöpfen (passt mit drei Knöpfen auf ein 375-Pixel-Handy).
- Fehler behoben: `Dialog` setzte den Fokus bei jedem Rendern auf den Schließen-Knopf zurück; Tippen in Eingabefeldern eines Fensters war dadurch nicht möglich.
- Geprüft: 440 Unit-Tests, 25 e2e-Tests (5 übersprungen), Typen, ESLint, Prettier, Schichtprüfung; im Browser auf Spielauswahl und Tabu-Hauptmenü (Desktop und 375-Pixel-Handy).

### Al-09-03 – Teams und Spieler zwischen Spielen merken

- Neu: Port `TeamSetupMemory` und reine Prüfung gespeicherter Daten in `src/business/shared/savedTeamSetup.ts`; Adapter `src/infrastructure/localStorageTeamSetupMemory.ts` (lokaler Browserspeicher, Schlüssel `gamehub.teamSetup`; kaputte oder fehlende Daten werden ignoriert, fehlender Speicher bricht nichts).
- `game-kit`: `TeamSetupMemoryProvider` und `useTeamSetupMemory`; `TeamsSetup` zeigt „Letzte Gruppe laden“, `PlayersSetup` „Letzte Spieler laden“, jeweils nur wenn eine Gruppe gemerkt ist, die sich vom aktuellen Stand unterscheidet. Eine Teamzahl über der Grenze des Spiels wird eingepasst. Texte in Deutsch und Englisch.
- Tabu merkt die Gruppe beim Start (nicht bei einem leeren Setup). Die Gruppe gilt in allen Spielen.
- Abweichung vom Entwurf: `localStorage` statt IndexedDB (kleiner Datensatz, keine Änderung der Kartendatenbank); der Port erlaubt späteren Wechsel.
- Geprüft: 421 Unit-Tests, 25 e2e-Tests (5 übersprungen), Typen, ESLint, Prettier, Schichtprüfung; im Browser: Speichern beim Start, Laden nach Neuladen.

### Al-09-05 – Feste Ansichten im game-kit umgesetzt

- Neue Bausteine: `ActionRow` (Knopfreihe, gleich breit und hoch), `ScoreScreen` (Zwischenstand, Stechen-Übersicht und Endstand mit optionalem Sieger) und `ManageScreen` (Rahmen des Editors mit Titel, Hinweis, Kapiteln, Aktionsreihe, Meldungen). Tests für alle drei.
- `SetupScreen` ist das Hauptmenü: statt einer freien Werkzeugleiste hat es die Plätze `rules` (Pflicht) und `editor` (optional).
- Tabu umgestellt (Kartenseite, Karteneditor, Rundenübersicht, Stechen, Endstand); die Stile wanderten aus `taboo.css` ins Kit (`kit-action-row`, `kit-manage`, `kit-score-screen`, `kit-winner`). Verhalten unverändert; „Abbrechen“ im Karteneditor ist jetzt rot (Regel „Abbrechen ist rot“).
- Geprüft: 394 Unit-Tests, 25 e2e-Tests (5 übersprungen) inklusive Handy-Layout, Typen, ESLint, Prettier; Zwischenstand im Browser angesehen.

### ADR-021 – Feste Ansichten und Oberflächenregeln

- Der Auftraggeber hat die Ansichten und Oberflächenregeln für alle Spiele vorgegeben (Hauptmenü, Spielansichten, Infofenster, einheitliche Bedienelemente, Knopfregeln). Festgehalten in `docs/GAMEHUB_UI_RULES.md` und `ADR-021`; Umsetzung als Aufgabe `Al-09-05` geplant (noch nicht gebaut).

### Al-09-02 – Gemeinsame Team- und Spieleransicht umgesetzt

- Neue reine Logik `src/business/shared/teamSetup.ts`: `buildTeams` (Namen auffüllen, Reihenfolge zufällig oder wie eingegeben, Spieler den Teams zuordnen), `TeamRules`, `validateTeamSetup`, `initialTeamSetup`, `clampTeamCount`. Tests mit festem Zufall.
- Neue Bausteine im `game-kit`: `SetupScreen`, `SetupSection`, `TeamsSetup` (gesteuert), `PlayersSetup` (nur Spielerliste) und intern `PlayerListField`. `ChoiceGroup` kann gesteuert genutzt werden (`value`, `onChange`).
- Texte in `src/i18n/resources/<sprache>/kit.ts`, Stile in `src/presentation/styles/kit-setup.css` (aus `taboo.css`, `taboo-more` heißt jetzt `kit-disclosure`).
- Tabu umgestellt: `TabooSetupForm` baut auf den Bausteinen auf, `TabooSetup` hält einen `TeamSetupValue` und ruft `buildTeams` auf; `TabooPlayers` und die Tabu-Teamtexte sind entfallen. `Team` im Tabu-Modell hat optional `players`; die Spieler kommen im Spielzustand an, die Rundenübersicht zeigt sie noch nicht.
- Verhalten unverändert (alle bisherigen Tests liefen ohne Anpassung der Erwartungen, e2e grün). Kleine Verbesserung: Die Teamliste unter der Spielerverteilung zeigt eingetragene Teamnamen statt „Team N“.
- Im Browser geprüft: Teams ändern, Namen, Spielerverteilung, Start mit den eingetragenen Teamnamen. Leitfaden für neue Spiele ergänzt.
- Jedes Kapitel des Setups („Teams und Spieler“, „Spieleinstellungen“) lässt sich auf- und zuklappen (`SetupSection`, standardmäßig offen, `defaultOpen` einstellbar). Zugeklappte Werte bleiben im Formular und werden beim Start übernommen.

### Al-09-01 – Entwurf der gemeinsamen Team- und Spieleransicht

- Neues Dokument `docs/GAMEHUB_SETUP_KIT.md`: Ist-Zustand im Tabu-Setup, was Spiele brauchen, Entwurf (reine Logik `buildTeams` und `TeamRules` in `business/shared`; `SetupScreen`, `SetupSection`, `TeamsSetup` und optional `PlayersSetup` im `game-kit`; Texte in `kit.ts`; Stile im `game-kit`; Handy- und PC-Layout mitgedacht), Umbau von Tabu in vier verhaltensgleichen Schritten, fünf offene Entscheidungen und Risiken. Noch nichts umgesetzt. Freigabe durch den Auftraggeber: Teams gesteuert mit Spielern, `PlayersSetup` gleich mit, Merken später (`ADR-020`); Rundenübersicht mit Spielern und Grenzen 2 bis 6 Teams als Vorgabe angenommen.

### Eigene Kategorien und Karten in der Kartenliste getrennt

- In „Karten nach Kategorie“ stehen jetzt zwei beschriftete Gruppen: zuerst „Eigene Kategorien“, dann „Standard-Kategorien“ (die Beschriftungen erscheinen nur, wenn es eigene Kategorien gibt). Innerhalb einer Kategorie stehen „Eigene Karten“ und „Mitgelieferte Karten“ als getrennte Blöcke, die eigenen zuerst (Beschriftung nur, wenn beide vorhanden sind). Sortiert wird weiter alphabetisch und von leicht nach schwer, jeweils innerhalb der Gruppe oder des Blocks.
- Im Browser geprüft mit einer eigenen Kategorie („Zauberei“) und einer eigenen Karte in „Technik“. Prüfungen: 361 Unit-Tests, 25 e2e, tsc, eslint.

### Sortierung der Kategorien und Karten

- Kategorien erscheinen alphabetisch nach ihrem angezeigten Namen (in der Oberflächensprache, Umlaute wie ihr Grundbuchstabe, Groß- und Kleinschreibung egal): in „Karten nach Kategorie“, im Auswahlfeld beim Hinzufügen und Bearbeiten und im Setup (dort getrennt in Standard und Eigene, jeweils alphabetisch). Eigene Kategorien sortieren sich automatisch zwischen die anderen ein.
- Karten einer Kategorie stehen von leicht bis schwer, innerhalb einer Schwierigkeit alphabetisch nach Begriff. Eigene und mitgelieferte Karten werden dabei gemischt (vorher standen die eigenen zuerst).
- Neue reine Logik `src/business/games/taboo/ordering.ts` (`sortCardsForList`, `sortByLabel`, `compareText`) mit Tests. Im Browser geprüft (Setup, Auswahl, Liste, Technik von „Batterie“ bis „Wärmebildkamera“). Prüfungen: 361 Unit-Tests, 25 e2e, tsc, eslint.

### Ta-09-05 – Pool übernommen

- Auf Wunsch des Auftraggebers wurden alle geschriebenen Karten übernommen: `src/data/pool/de.json` hat 523 und `en.json` 521 Karten in allen zehn Kategorien (17 bis 19 je Kategorie und Schwierigkeit). Zusammen mit den 45 eingebauten Karten je Sprache sind es rund 570.
- Build: Die Pakete sind eigene Teile (`de-*.js` etwa 74 kB, `en-*.js` etwa 72 kB, gepackt je etwa 15 kB), vom Offline-Speicher mit vorgehalten; der Hauptteil der App ist unverändert groß.
- Neue Tests: Jede Kategorie und Schwierigkeit hat mindestens 15 Karten, und Kennungen und Begriffe sind über Pool und eingebaute Karten hinweg eindeutig. Prüfungen: 355 Unit-Tests, 25 e2e (frischer Build), tsc, eslint.
- Im Browser geprüft: Das Setup zeigt alle zehn Kategorien auf Handy-Breite; eine Partie nur mit „Technik“ spielte eine Karte aus dem Pool („Oszilloskop“, schwer). Die Karten wurden von Claude geschrieben, ohne unabhängigen zweiten Prüfdurchgang und ohne Durchsicht durch den Auftraggeber.

### Ta-09-05 – Etappen: alle zehn Kategorien geschrieben (in Arbeit)

- Neues Werkzeug `scripts/import-card-batch.mjs`: schickt eine Stapeldatei mit Karten durch dieselben Regeln wie die erzeugten Karten und legt die angenommenen im Arbeitspaket in `work/` ab (Ablehnungen mit Grund in der Liste, mit `--score` zusätzlich ein Urteil, `--dry-run` zur Vorschau).
- Erste Etappe: je Sprache 51 Karten der Kategorie „Essen und Trinken“ (je 17 leicht, mittel, schwer), von Claude geschrieben. Das lokale 27-Mrd.-Modell wurde nach dem Zeitlimit-Fehler nicht weiter benutzt. Die Regeln lehnten je Sprache zwei Karten ab, deren Begriffe es schon gab („Apfel“, „Brot“), sie wurden ersetzt. Die Karten liegen nur in `work/` (nicht versioniert) und sind noch nicht in den Pool übernommen. Wichtig: Es gab keinen unabhängigen zweiten Prüfdurchgang, die Urteile (5) setzte der Import; die Stichprobe per Prüfseite ist die Kontrolle.
- Zweite Etappe: je Sprache 52 Karten der Kategorie „Tiere“ (17 leicht, 17 mittel, 18 schwer). Auch sie liegen nur in `work/`; die Regeln lehnten je Sprache drei schon vorhandene Begriffe ab (Hund, Eichhörnchen, Biene beziehungsweise Dog, Squirrel, Bee).
- Dritte und vierte Etappe: je Sprache etwa 53 Karten der Kategorien „Sport und Freizeit“ und „Berufe“ (18 leicht, 17 mittel, 18 schwer, bei Berufen 19/17/17). Die Regeln lehnten englisch zwei Karten ab, weil ein verbotenes Wort Teil des Begriffs war („Snowboarding“ mit „snow“, „Lawyer“ mit „law“); sie wurden mit anderen Wörtern ersetzt. Arbeitspaket jetzt je Sprache etwa 210 Karten in vier Kategorien, alles nur in `work/`, nichts übernommen.
- Fünfte bis siebte Etappe: „Orte und Reisen“, „Film, Musik und Medien“ und „Technik“, je Sprache zwischen 52 und 53 Karten. Die Regeln lehnten viele Karten ab: Begriffe, die es schon gab („Museum“, „Kino“, „Buch“, „Gitarre“, „Theater“ und andere), und verbotene Wörter, die den Begriff enthielten („Bagpipes“ mit „pipes“, „Farm“ mit „farmer“, „Speedometer“ mit „speed“). Sie wurden durch andere Karten ersetzt. Arbeitspaket jetzt Deutsch 367 und Englisch 366 Karten in sieben Kategorien, alles nur in `work/`, nichts in den Pool übernommen. Die drei Kategorien der eingebauten Karten (Alltag, Natur, Kultur) sind noch nicht ergänzt.
- Letzte Etappe: Alltag, Natur und Kultur ergänzt (je Sprache 51 bis 53 neue Karten je Kategorie zusätzlich zu den 15 eingebauten). Die Regeln lehnten fünf Karten ab, weil ein verbotenes Wort den Begriff enthielt („Decke“ mit „zudecken“, „Erdbeben“ mit „Beben“, „Watering can“ mit „Water“, „Thunderstorm“ mit „thunder“, „Heath“ mit „heather“); sie wurden ersetzt. Arbeitspaket jetzt **Deutsch 523 und Englisch 521 Karten in allen zehn Kategorien**, nur in `work/`, noch nicht in `src/data/pool` übernommen. Die ersten Etappen sind damit komplett; offen sind die Durchsicht durch den Auftraggeber und die Übernahme.

### Korrektur an den Kartenwerkzeugen: Antworten als Datenstrom

- Der erste echte Probelauf mit `qwen/qwen3.6-27b` (LM Studio) brach nach etwa fünf Minuten mit „fetch failed“ ab. Ursache: Node bricht eine Anfrage ab, wenn fünf Minuten lang gar keine Daten kommen (Kopfzeilen-Zeitlimit), und ein Modell, das vor der Antwort lange nachdenkt, sendet bei nicht gestreamten Antworten erst nach dem Ende etwas.
- Beide Anbieter (Ollama, LM Studio) werden jetzt im Datenstrom abgefragt (`scripts/lib/pool-tools.mjs`); die Nachdenk-Anteile von LM Studio (`reasoning_content`) werden verworfen, ein Punkt je 200 Zeilen zeigt, dass das Modell antwortet. Das Zeitlimit gilt nun für die ganze Anfrage (20 Minuten). Fehlermeldungen nennen die eigentliche Ursache (zum Beispiel `ECONNREFUSED`).
- Geprüft mit einer nachgebildeten Schnittstelle, die beide Datenstromformate liefert (erzeugen und prüfen), und mit einer nicht erreichbaren Adresse (Ursache sichtbar). Ein erneuter Lauf mit dem echten Modell läuft.

### Ta-09-04 – Prüfwerkzeug für den Kartenpool

- Neues Werkzeug `scripts/review-card-pool.mjs` (Entwicklerwerkzeug, nicht Teil von App und Build) mit `judge`, `sheet` und `merge`. `judge`: zweiter KI-Durchgang (1 bis 5 mit Problemtext, fortsetzbar). `sheet`: HTML-Prüfseite mit allen zweifelhaften und ungeprüften Karten und einer Stichprobe der guten je Kategorie und Schwierigkeit, Abwählen per Kästchen, Liste kopieren. `merge`: übernimmt gute, nicht abgewählte Karten in `src/data/pool/<Sprache>.json` (nur als gültiges Paket, Vorschau mit `--dry-run`, wiederholbar ohne Doppelungen).
- Neue getestete Regeln in `src/business/games/taboo/poolReview.ts` (Auftrag an den Prüfer, Lesen der Antwort, Stichprobe, Abwahlliste, Übernahmeauswahl). Gemeinsame Skriptteile in `scripts/lib/pool-tools.mjs`; `generate-card-pool.mjs` nutzt sie jetzt auch.
- Texte der KI in der Prüfseite werden als Text ausgegeben, nicht als HTML (geprüft mit `<b>` im Problemtext).
- Geprüft mit nachgebildeter Ollama-Schnittstelle, nicht mit einer echten KI. Prüfungen: 351 Unit-Tests, tsc, eslint.

### Ta-09-03 – Erzeugungsskript für den Kartenpool

- Neues Werkzeug `pnpm pool:generate` (`scripts/generate-card-pool.mjs`): erzeugt Karten am PC mit Ollama oder LM Studio, je Kategorie und Schwierigkeit in Portionen, bis zum Ziel je Zelle (Standard 17, also etwa 500 je Sprache bei zehn Kategorien). Optionen für Sprache, Kategorie, Schwierigkeit, Ziel, Portionsgröße, Anbieter, Modell, Temperatur und Arbeitsordner; `--dry-run` zeigt nur den Auftrag an die KI.
- Ausgabe nur in `work/` (nicht versioniert): Arbeitspaket im Paketformat und Ablehnungsliste mit Grund. Fortsetzbar; bereits vorhandene Begriffe (eingebaute Karten, Paket, Arbeitspaket) werden gemieden und abgelehnt. Die App bleibt unverändert; Übernahme in den Pool folgt mit `Ta-09-04`.
- Neue getestete Regeln in `src/business/games/taboo/poolGeneration.ts`: Auftrag an die KI (Sprache, Kategorie mit Beschreibung, Schwierigkeit, Familienfreundlichkeit, Oberbegriff), Lesen der Antwort auch mit Text um das JSON, stabile Kennung aus Sprache, Kategorie und Begriff, strengere Annahme (kein verbotenes Wort enthält den Begriff oder ist Teil davon, keine Ziffern in Wörtern, Längen, keine Dubletten).
- Bei LM Studio wird nur ein bereits geladenes Chat-Modell genutzt, außer `--model` ist angegeben.
- Geprüft mit einer nachgebildeten Ollama-Schnittstelle (Lauf, Fortsetzen, Ablehnungen), nicht mit einer echten KI. Prüfungen: 333 Unit-Tests, tsc, eslint.

### Anforderung: Handy- und PC-Layout für alle Spiele

- Neue Phase Al-08 im Plan (`Al-08-01`, `Al-08-02`, beide geplant): Jedes Spiel soll ein Handy- und ein PC-Layout haben, damit man auch am PC spielen kann. Nur festgehalten, noch nicht umgesetzt.

### Ta-09-02 – Kartenpaket und Kategorien aus den Daten

- Neues Paketformat `gamehub-taboo-pack` (Version 1) je Sprache: Kategorien mit deutschem und englischem Namen und Karten ohne eigene Sprachangabe. `src/data/pool/de.json` und `en.json` enthalten die zehn Kategorien und noch keine Karten.
- `parseTabooCardPack` (Business) prüft alles und verwirft das ganze Paket bei einem Fehler (falsches Format, doppelte Kennungen oder Begriffe, Karte in unbekannter Kategorie, ungültige Wörter). `loadTabooCardPack` (Daten) lädt es als eigenen Teil der App; fehlt oder fehlschlägt es, bleiben die 45 eingebauten Karten. Der Build enthält `de-*.js` und `en-*.js`, beide stehen in der Dateiliste des Offline-Speichers.
- Kategorienamen kommen aus den Daten (`TabooCategoryInfo`, `builtInCategories`, `categoryName`); die Schlüssel `tabooSetup.category.*` sind entfallen. Setup, Karten-Formular, Kartenliste und Auswahlfeld nehmen die Kategorien als Parameter. Die Kategorien der eingebauten Karten erscheinen immer, Paket-Kategorien erst mit Karten.
- Tests: Paketprüfung (18 Fehlerfälle), Zusammenführen, Laden der echten Dateien, Bibliothek mit Paket in beiden Sprachen und mit fehlendem, fehlerhaftem und fremdsprachigem Paket. Prüfungen: 314 Unit-Tests, 25 e2e, tsc, eslint, Architekturprüfung.

### Ta-09 – Planung eines großen Kartenpools

- Neues Dokument `docs/GAMEHUB_CARD_POOL.md`: Ziel, Ist-Zustand, Größen- und Aufwandsschätzung, Aufbau (Pakete je Sprache als eigener Teil mit Rückfall, Kategorien aus den Daten, Erzeugungsskript am PC, Prüfung), offene Entscheidungen und Risiken. Phase Ta-09 mit Aufgaben `Ta-09-01` bis `Ta-09-06` im Plan und Status. Noch keine Umsetzung. Entschieden: 500 Karten je Sprache zuerst (später bis 1.500), zweiter KI-Durchgang plus Stichproben, Deutsch und Englisch unabhängig erzeugen. Kategorien: zehn (Tabelle im Dokument), gespielte Karten merken später. `Ta-09-01` damit erledigt, als Nächstes `Ta-09-02`.

### KI-Knopf für Wortvorschläge entfernt

- Auf Wunsch des Auftraggebers ist der KI-Knopf („Wörter mit KI vorschlagen“) im Formular „Karte hinzufügen“ und im Bearbeiten-Formular wieder entfernt: Er braucht installiertes Ollama, und Fremde sollen nichts extra installieren müssen. Gelöscht: Komponente `TabooWordSuggestion`, Port `TabooWordSuggester` mit Prüfung, Ollama-Adapter für Wortvorschläge, die zugehörigen Texte, Stile und Tests. Die Kartenerzeugung im Setup (Ollama) und `findOllamaModel` bleiben. Geplant statt dessen: Kartenpakete am PC erzeugen und mitliefern.
- Prüfungen: 284 Unit-Tests, e2e, tsc, eslint.

### Ta-08 – Lokale KI am Rechner (Test und Entscheidung)

- Wegwerf-Seite `prototypes/ai-word-test.html`: lädt ein kleines Modell per WebLLM im Browser und erzeugt verbotene Wörter für deutsche und englische Beispielbegriffe; zeigt Geräteprüfung, Zeiten und Beanstandungen. Nicht Teil von App und Build, keine neue Abhängigkeit in `package.json`.
- Erster Befund: Im Browser dieses Rechners ist WebGPU samt f16 verfügbar; das kleinste Qwen-Modell (0,5 Mrd.) braucht laut WebLLM etwa 945 MB Grafikspeicher, SmolLM2-360M etwa 376 MB. - Messung 1 (dieser Rechner, WebGPU, Qwen2.5-0.5B-Instruct q4f16): Laden 29 s (erstmals, ca. 280 MB), danach 0,2 bis 0,4 s pro Karte. Qualität **nicht brauchbar**: Von 20 Begriffen (10 Deutsch, 10 Englisch) hatten 14 vier Wörter, aber nur etwa 2 bis 3 waren sinnvoll. Typische Fehler: erfundene Wörter („Gäcker“, „Zubler“), Buchstaben statt Wörter („Pizza“ → s, p, i, z), Wörter, die den Begriff enthalten („Regenbogen“ → Bogen), unpassende Wörter („Bibliothek“ → Leiche). Deutsch ist deutlich schlechter als Englisch. Die Prüfzahl „6 von 20 ohne Beanstandung“ der Seite überschätzt die Qualität, weil sie nur Form prüft und nicht den Sinn.
- Entscheidung (Auftraggeber): größeres Modell nicht testen, Aufgabe „anders lösen“. Erkundung: Kandidatenwörter aus der Einleitung des Wikipedia-Artikels (kostenlos, ohne Schlüssel, vom Browser aus per `origin=*` abrufbar). Messung an denselben 20 Begriffen mit einfachem Filter (Stoppwörter, Wörter mit dem Begriff darin, auf Deutsch nur großgeschriebene Wörter, Häufigkeit): meist sinnvolle Nachbarwörter (Regenbogen → Regentropfen, Sonnenlicht, Strahlen, Licht, Sonne, Farben; Gewitter → Blitz, Donner, Entladungen), aber auch Rauschen („Vorlage“, „Infobox“, Ländernamen, englisch „known“, „used“). Als Auswahlliste zum Antippen brauchbar, als fertige Karte nicht. Links aus dem Artikel waren deutlich schlechter.
- Entscheidung (Auftraggeber, `ADR-018`): Wikipedia abgelehnt, KI nur am Rechner (Ollama), am Handy ohne KI.
- Ein kurz ergänzter Adapter für LM Studio wurde auf Wunsch des Auftraggebers wieder entfernt (nicht beauftragt). Die KI-Anbindung bleibt bei Ollama. Gemessen vor dem Rückbau: Der LM-Studio-Server dieses Rechners sendet keinen CORS-Header; für eine spätere Anbindung müsste dort „CORS aktivieren“ eingeschaltet werden.

### Ta-07 – Karten und Kategorien neu gestalten

- **Ta-07-01:** Neues schlankes Formular „Karte hinzufügen“ oben auf der Kartenseite (Kategorie, Schwierigkeit, Begriff, vier verbotene Wörter in einem Feld mit Komma). Die Mehrzeilen-Eingabe ist entfallen.
- **Ta-07-02:** „Karten nach Kategorie“ ersetzt die flache Liste: jede Kategorie ausklappbar, Karten als kompakte Zeilen, eigene Karten bearbeitbar und löschbar, Standardkarten nur lesbar.
- **Ta-07-03:** Im Setup sind die Kategorien in „Standard“ und „Eigene“ getrennt.
- **Ta-07-04:** KI-Vorschlag für verbotene Wörter: Knopf „Wörter mit KI vorschlagen“ beim Hinzufügen und Bearbeiten, sichtbar nur mit erreichbarer lokaler Ollama-KI. Der Vorschlag wird geprüft und nur ins Feld eingetragen. Neuer Port `TabooWordSuggester`, Adapter `ollamaTabooWordSuggester`; die Modellsuche ist als `findOllamaModel` mit dem Kartengenerator geteilt. Ohne KI bleibt alles unverändert.
- **Ta-07-05:** Kartenseite verfeinert: Bearbeiten als Stift-Knopf, Export nur je Kategorie, Import als gestalteter Knopf, Zurück und KI-Vorschlag als Knöpfe mit Symbol (neuer Baustein `Icon`). Der globale Export entfällt. Nachbesserung: kompakte Symbolknöpfe neben den Namen (Stift bei der Karte direkt unter der Schwierigkeit rechts; alle Symbolknöpfe (Stift, Export, KI) haben die normale Knopfform (keine runden Knöpfe) und 2,5 rem Größe; der KI-Knopf neben dem Wörterfeld ist genauso hoch wie das Feld (3 rem), Kartenzeilen niedriger (ein zu großer oberer Außenabstand der Knöpfe im Spielbereich ist für diese Symbolknöpfe aufgehoben), Download bei der Kategorie), Leiste „Karten“ und „Spielregeln“ oben rechts im Setup, Zurück-Pfeil in der Kopfzeile der App (oben rechts) auf der Kartenseite, wo Einstellungen und Home ausgeblendet sind (neuer Hook `useGameBack`, Texte `navigation.back`). Das Export-Symbol in der Kategoriezeile sitzt jetzt auf einer Höhe mit Namen und Zähler (ein fremder oberer Außenabstand der Knöpfe ist aufgehoben), KI-Knopf neben dem Wörterfeld (ohne KI deaktiviert mit Hinweis).
- Annahmen: Eine Kategorie entsteht durch ihre Karten (keine leeren Kategorien); die Ansicht zeigt nur Karten der gewählten Kartensprache.
- Prüfungen: 297 Unit-Tests, 25 e2e (frischer Build), tsc, eslint, Prettier, Architekturprüfung.

## 2026-11-11

### Ta-06-06 – Karteneditor für eigene Karten

- Neue Liste „Meine Karten“ (`TabooCardList`) auf der Kartenseite: Suche nach Begriff oder Kategorie, Bearbeiten (Begriff, vier verbotene Wörter, Kategorie oder neue Kategorie, Schwierigkeit) und Löschen mit Zweit-Tipp-Bestätigung. Eingaben werden mit denselben Regeln wie beim Hinzufügen geprüft (vier verschiedene Wörter, kein doppelter Begriff).
- `TabooCardRepository` und die IndexedDB-Umsetzung haben `update` und `remove`; die Auswahl der Kategorie ist als `TabooCategoryField` gemeinsam mit dem Hinzufügen-Formular genutzt.
- Tests: Datenschicht, Liste und Durchlauf über die Kartenseite in Deutsch und Englisch. Prüfungen: 281 Unit-Tests, 25 e2e, tsc, eslint.

### Nachbesserung zu Ta-06-04 und Ta-06-05

- Reihenfolge der Spieleinstellungen: Runden, Rundendauer, Überspringen, Stechen, Kartenquelle, Schwierigkeit, Kategorien. Die Kategorien stehen zuletzt; die Trennlinie zwischen Standard- und eigenen Kategorien ist entfallen, nur die kleinen Beschriftungen bleiben.
- „Überspringen pro Runde“ steht direkt unter „Rundendauer (Sekunden)“. Die Abstände im Setup sind vereinheitlicht: zwischen allen Einstellungen 16 px, zwischen den Abschnitten 32 px; der Info-Knopf vergrößert die Zeile der Beschriftung nicht mehr.
- Der einklappbare Bereich „Weitere Optionen“ entfällt: Stechen, Überspringen, Schwierigkeit und Kategorien stehen direkt untereinander im Abschnitt „Spieleinstellungen". Der Übersetzungsschlüssel `tabooSetup.moreOptions` und die zugehörigen Testschritte sind entfernt.
- „Mittel“ ist gelb statt blau (Ampel: grün, gelb, rot) (Auswahl und Anzeige in der Runde), damit es nicht wie ein gewöhnliches ausgewähltes Element aussieht.
- Schwierigkeit ist mehrfach wählbar (z. B. leicht und schwer). „Alle“ schließt die anderen aus; wählt man nichts oder alle drei, gilt wieder „Alle“. Umgesetzt als Option `multiple` im Baustein `ChoiceGroup`; die KI-Erzeugung und das Nachladen verwenden nur die gewählten Schwierigkeiten. Tests für die Auswahlregeln.
- Eigene Karten (Hinzufügen, Import, Export) liegen auf einer eigenen Seite innerhalb von Tabu, erreichbar über „Eigene Karten verwalten“ im Setup; „Zurück“ führt ins Setup, das ausgefüllt erhalten bleibt.
- Das Setup ist in zwei Abschnitte gegliedert: „Teams und Spieler“ (Teamanzahl, Namen, Reihenfolge, Spielerliste) und „Spieleinstellungen“ (Runden, Dauer, Kartenquelle, weitere Optionen). Die Spielerliste hat eine eigene Überschrift „Spieler (optional)“ und ist weiter einklappbar („Namen eintragen und verteilen“), ihr Hinweistext ist verständlicher formuliert (Namen durch Komma oder Zeilenumbruch trennen), und sie hat Innenabstand zum Rand.
- Mehrzeilige Eingabefelder (Spieler, Karten) wachsen mit dem Inhalt (`useAutoGrow` in `game-kit`).

### Ta-06-05 – Mehrere Karten und Kategorien hinzufügen

- Neues Formular „Karten hinzufügen“ (`TabooCardEntry`): mehrere Karten als Textzeilen, gemeinsame Kategorie und Schwierigkeit, neue Kategorie per Namen. Ungültige Zeilen werden mit Nummer gemeldet, dann wird nichts gespeichert; vorhandene Begriffe werden übersprungen.
- Reine Logik `parseCardEntries` und `customCategoryIds` in `src/business/games/taboo/` mit Tests. Eigene Kategorien erscheinen im Setup als Filter (`tabooSetup`-Auswahl ist nun dynamisch).
- Prüfungen: 270 Unit-Tests, 25 e2e, tsc, eslint, Architekturprüfung.

### Ta-06-04 – Spieler hinzufügen und auf Teams verteilen

- Neuer Bereich „Spieler und Teams (optional)“ im Tabu-Setup: Namen eintragen (Zeilen, Kommas oder Semikolon), zufällig auf die Teams verteilen oder je Spieler das Team auswählen. Übersicht der Teams mit ihren Spielern, Deutsch und Englisch.
- Gemeinsame reine Logik `parsePlayers` und `splitIntoTeams` in `src/business/shared/players.ts` mit Tests.
- Prüfungen: 263 Unit-Tests, 25 e2e, tsc, eslint, Architekturprüfung.

### Ta-06-03 – Teamreihenfolge manuell oder zufällig

- Neue Auswahl „Teamreihenfolge“ im Setup (ab zwei Teams): „Zufällig“ (Standard, wie bisher) oder „Wie eingegeben“. Mit Info-Button, in Deutsch und Englisch.
- Beim Neuspielen mit gleicher Konfiguration bleibt eine eingegebene Reihenfolge erhalten, eine zufällige wird neu gelost.
- Test in beiden Sprachen. Prüfungen: 256 Unit-Tests, 25 e2e, tsc, eslint.

### Ta-06-02 – Spielregeln erklären

- Neue Komponente `TabooRules`: Knopf „Spielregeln“ über dem Setup-Formular öffnet ein Fenster mit Ziel, Ablauf, Wertung, Überspringen und Spielende, in Deutsch und Englisch.
- Test für Öffnen und Schließen in beiden Sprachen. Prüfungen: 254 Unit-Tests, e2e, tsc, eslint.

### Ta-05-06 – Tabu-Stile je Spiel und Nachlade-Hook

- Tabu-Stile aus `global.css` nach `src/presentation/styles/games/taboo.css` verschoben; berechnete Stile vor und nach der Trennung verglichen, keine Abweichung.
- Nachladen der KI-Karten als Hook `useTabooRefill` aus `TabooSetup.tsx` herausgelöst (815 auf 450 Zeilen insgesamt). Pause, Neustart und Stechen bleiben bewusst im Container.
- Prüfungen: 252 Unit-Tests, 25 e2e (5 mobile-only übersprungen auf Desktop), tsc, eslint und Architekturprüfung sauber.

### Ta-06-01 – Info-Buttons mit Erklärfenster

- Neuer Baustein `InfoButton` in `game-kit` und optionales `info` an `ChoiceGroup`: ein „i“-Knopf rechts neben der Überschrift öffnet ein Fenster mit der Erklärung.
- Erklärungen für Runden pro Team, Kartenquelle, Stechen bei Gleichstand, Überspringen pro Runde und Schwierigkeit, in Deutsch und Englisch.
- `Button` ist standardmäßig `type="button"`, damit ein Knopf in einem Formular es nie versehentlich absendet.
- Tests für das Fenster (öffnen, schließen, Escape, kein Absenden), alle fünf Erklärungen und den Durchlauf in beiden Sprachen; die mobile Layout-Prüfung bestätigt 44-Pixel-Ziele.

### Ta-05-05 – Struktur für wiederverwendbare Spielbausteine umgesetzt

- Spielmodul-Vertrag (`GameModule`: Kennung und Hauptfenster): `App` und `AppRoot` kennen kein Tabu mehr und bekommen `modules`; Tabu wird in `main.tsx` über `createTabooModule` angeschlossen. Ein Beispielmodul im Test belegt den Vertrag.
- Texte je Spiel in eigener Datei (`resources/<sprache>/taboo.ts`), eingebunden in `common.ts`.
- Leitfaden `docs/GAMEHUB_NEW_GAME_GUIDE.md` und `ADR-017`. Offen als `Ta-05-06`: Hooks für die Tabu-Zustandslogik und CSS je Spiel.

### Ta-05-05 – Strukturvorschlag für wiederverwendbare Spielbausteine (in Arbeit)

- Neues Dokument `docs/GAMEHUB_GAME_MODULES.md`: Ist-Zustand (815 Zeilen in `TabooSetup.tsx`, Tabu-Wissen in `App.tsx`, gemischtes CSS und gemeinsamer Namensraum für Texte), Zielbild mit `game-kit`, `business/shared` und einem Spielmodul-Vertrag, drei Optionen mit Empfehlung (moderater Umbau) und die Entscheidungen, die der Auftraggeber treffen muss.
- Freigabe erteilt (Option B, moderater Umbau; Spielmodi erst danach). Umgesetzt: Schritt 1 (`shuffle` und `teamOrder` nach `src/business/shared/`) und Schritt 2 (Bausteine `ChoiceGroup`, `Scoreboard`, `StartBar` und `TurnStrip` in `src/presentation/game-kit/`, CSS-Klassen mit Präfix `kit-`). Das Verhalten ist unverändert, alle Tests bestehen. Schritt 3: `useCountdown`, `useStopwatch` und `TimerHud` (Rundenkopf mit Zeitbalken und Farbwechsel) in `game-kit`, von der Tabu-Runde und dem Stechen gemeinsam genutzt. Schritt 4 (teilweise): `TabooSetup.tsx` von 815 auf 499 Zeilen verkleinert. Ansichten (`TabooSetupForm`, `TabooTurnOverview`, `TabooResultView`, `TabooTiebreakOverview`) und Hilfsfunktionen (`tabooSetupModel.ts`) sind ausgelagert, das Verhalten ist unverändert. Noch offen in Schritt 4: Zustandslogik (Nachladen, Pause, Neustart, Stechen) als Hooks. Offen außerdem: Schritte 5 und 6 (Spielmodul-Vertrag mit eigenem Namensraum, Leitfaden).

### Ta-05-04 – Oberflächentests auf Handybreite

- Neue Browserprüfung `e2e/mobile-layout.spec.ts`: Alle Tabu-Ansichten (Menü, Einstellungen, Setup, Übersicht, Runde, Pause, Auswertung, Stechen, Ergebnis) werden auf 360 und 412 Pixel Breite in Deutsch und Englisch geprüft: kein horizontales Scrollen, Touch-Ziele mindestens 44 Pixel, nichts außerhalb des Bildschirms oder abgeschnitten, Aktionsleiste ohne Scrollen erreichbar, Bedienelemente haben einen Namen.
- Gefundene Probleme behoben: Das Markenlogo in der Kopfzeile (21 Pixel hoch), der Schließen-Knopf der Dialoge (40 Pixel) und die Überschrift „Eigene Tabu-Karten“ (21 Pixel) waren zu klein für Touch.

### Ta-05-03 – Sprach- und Oberflächenabdeckung geprüft

- Fehler behoben: Das `lang`-Attribut der Seite blieb auf Deutsch, auch bei englischer Oberfläche (falsche Aussprache bei Screenreadern). Seitensprache und Meta-Beschreibung folgen jetzt der Oberflächensprache (`useDocumentLanguage`).
- Veraltete Hinweise korrigiert („Partie erneut vorbereiten“ existiert nicht mehr) und ungenutzte Texte (Architekturschichten, Beispielmeldungen, Team hinzufügen/entfernen, Kartenoptionen) entfernt.
- Neue automatische Prüfungen: gleiche Platzhalter in beiden Sprachen, keine versehentlich identischen Texte (bewusste Ausnahmen sind aufgelistet), keine ungenutzten Übersetzungsschlüssel.
- Neuer Durchlauf aller zwölf Tabu-Ansichten (Auswahl, Einstellungen, Setup, Übersicht, Runde, Pause, Auswertung, Stechen, Ergebnis) in Deutsch und Englisch: Es erscheinen keine Rohschlüssel und keine Texte der jeweils anderen Sprache.
- Zeitformat (Dezimaltrenner) je Sprache getestet. Im E2E-Test wird Seitensprache und Beschreibung nach dem Sprachwechsel geprüft.
- Der feste Markenname „GameHub“ in der Kopfzeile ist der einzige Text im Code außerhalb der Übersetzungsressourcen.

### Ta-05-02 – Testabdeckung erhöht

- Neue Tests: Fehlerfälle der lokalen Kartenspeicherung (Öffnen, Blockade, abgebrochenes Lesen, ungültige Karte), Kartengenerierung (gefundener oder lokaler Generator, Fehlschläge, Abbruch), Kartenverwaltung bei Speicherfehlern, Doppelstart und Abbruch während der Vorbereitung, Seiten und App-Rahmen, Stechen ohne Ersatzkarte, Parität der Übersetzungsressourcen.
- Abdeckung: Zeilen 99,15 %, Verzweigungen 94,05 %, Funktionen 98,51 %. Übrig sind vor allem defensive Rückfallwerte.
- Fehler behoben: Der Hinweis „Keine neuen Zusatzkarten verfügbar.“ war nach dem Spielstart nie sichtbar, weil das Setup sofort ausgeblendet wird. Er steht jetzt in der ersten Rundenübersicht.

### Ta-05-01 – Spiellogik und Randfälle geprüft

- Neue Zufallsprüfung (`stateMachine.invariants.test.ts`): 400 simulierte Partien mit gültigen und ungültigen Ereignissen, Prüfung von Punkten, eindeutigen Karten, Zustandsübergängen, Stechen-Daten und endgültigem Spielende.
- Gefundener Fehler behoben: Ungültige Zeitwerte (`NaN`, unendlich) im Stechen konnten die Rangfolge verfälschen und werden jetzt ignoriert.
- Zusätzliche Tests: zu wenige Karten für das Stechen, Kartensprache im Stechen.
- Regeln und Randfälle dokumentiert in `docs/GAMEHUB_TABOO_LOGIC.md`.

### Al-07-03 – Feinschliff nach Rückmeldung

- Rundenzahl pro Team: Kurz (3), Mittel (5), Lang (10) und Unbegrenzt (∞). Bei unbegrenzten Spielen lässt sich das Ergebnis nach jeder vollständig gespielten Runde anzeigen (`roundsPerTeam: "unlimited"`).
- Rundendauer: zusätzlich 120 Sekunden wählbar (60, 90, 120).
- Auswahlgruppen im Menü haben gleich breite Buttons; „Unbegrenzt“ beim Überspringen ist ein ∞-Symbol (mit Screenreader-Namen).
- Schwierigkeit im Menü farbig (grün, blau, rot) und auf der Karte links oben als Farbpunkt mit Klartext.
- Zeitanzeige und Zeitbalken wechseln in den letzten 20 Sekunden auf Gelb und in den letzten 10 auf Rot, auch im Stechen.
- Stechen: Ein verbotenes Wort gibt keine Zeitstrafe mehr, sondern zählt als falsch und bringt eine neue Karte gleicher Schwierigkeit.
- Kartenreihenfolge: Das Mischen liegt jetzt gemeinsam in der Business-Schicht (`shuffle`); nachgeladene KI-Karten werden vor dem Einreihen gemischt.
- Neue Aufgaben: Phasen Ta-05 (Qualitätsprüfung) und Ta-06 (Erweiterungen) sind im Plan erfasst.

### Al-07-01 – Mobile-first Oberfläche

- Kopfzeile auf einer Zeile verdichtet, Safe-Area-Abstände und `100dvh` ergänzt, Navigation erst ab Tablet-Breite sichtbar.
- Spielauswahl mit kompakten Karten; geplante Spiele treten visuell zurück.
- Laufende Tabu-Runde: Begriff füllt die Ansicht, Aktionsbuttons liegen angeheftet in der Daumenzone, Countdown färbt sich in den letzten 10 Sekunden.
- Einstellungen als Bottom-Sheet, Touch-Ziele mindestens 48 px, Eingabefelder gegen iOS-Zoom abgesichert, Theme-Farbe angepasst.
- Rundenende und Ergebnis mit Standings-Karten und vollbreiten Buttons.
- Kartensprache aus dem Tabu-Setup entfernt; es gilt die Kartensprache aus den Einstellungen.
- Kartenquelle wählbar: nur lokal, nur KI oder beides kombiniert. Schwierigkeit und Kategorien liegen unter „Weitere Optionen“.
- Start-, Richtig- und Weiter-Aktionen grün, „Verbotenes Wort“ rot.
- „Zurück zu allen Spielen“ durch ein Haus-Symbol („Spiel schließen“) ganz rechts in der Kopfzeile ersetzt.
- Einstellungen als Zahnrad-Symbol dargestellt. In der Kopfzeile steht im Spiel der Spieltitel statt „GameHub“; „GameHub“ erscheint nur im Hauptmenü.
- „Nur KI“ erzeugt vorab rund 8 Karten pro Runde und lädt während der Runde automatisch Karten nach (neues Ereignis `addCards` in der Zustandsmaschine), sobald weniger als 9 Karten übrig sind. Bei „Alle“ wechselt die Schwierigkeit zwischen den Anfragen.
- Spielkopf größer; gemeinsamer Aufbau für Spiele: Titel und Aktionen oben, Einstellungen in der Mitte, „Starten“ immer ganz unten.
- Schritt „Partie vorbereiten“ entfällt: „Starten“ bereitet die Partie vor und beginnt sofort die erste Runde. „Gleiche Einstellungen“ startet direkt neu mit gemischten Karten.
- Kartenquelle: „Beides“ steht links und ist Standard.
- Tabu-Karten haben jetzt immer vier verbotene Wörter (Modell, Standardkarten, lokale Kandidaten, KI-Vorgabe mit Oberbegriff). Die Runde zeigt sie in einem 2×2-Raster. Gespeicherte oder importierte Karten mit drei Wörtern werden nicht mehr akzeptiert.
- „Starten“ öffnet jetzt eine Rundenübersicht statt sofort die Runde zu starten: „Runde X/Y“, das Team, das als Nächstes dran ist, und eine Punkteübersicht aller Teams (meiste Punkte oben). „Runde starten“ liegt unten. Dieselbe Übersicht erscheint nach jeder Runde.
- Die Teamreihenfolge wird zu Beginn jeder Partie zufällig bestimmt und bleibt bis zum Ende gleich (neu: `shuffleTeams`). In der laufenden Runde stehen Team, „Runde X/Y“ und Punkte im Kopf.
- Punkteübersicht auch im Endergebnis, mit hervorgehobenen Gewinnerteams.
- Alle 20 Browserprüfungen lokal bestanden (Chrome, Desktop und Mobil).
- Nach einer Runde entfällt die Meldung „Runde beendet“. Stattdessen zeigt die Übersicht „Als Nächstes dran“, den Gesamtpunktestand und die gespielte Runde mit allen Kartenbegriffen in Grün (richtig) oder Rot (nicht gewertet). Ein Tipp auf einen Begriff ändert die Wertung und passt die Punkte an (neues Ereignis `reviseResult`).
- „Letzten Punkt zurücknehmen“ entfällt in Runde und Übersicht; Korrekturen erfolgen nur in der Rundenübersicht.
- Die Rundenübersicht zeigt unter jedem Begriff auch die vier verbotenen Wörter.
- Eine Runde endet nicht mehr nach wenigen Karten: Sie bekommt alle ungespielten Karten, danach früher gespielte Karten in neuer Reihenfolge (nie zweimal in derselben Runde). Die Zustandsmaschine erlaubt dafür das Wiederverwenden von Karten in späteren Runden.
- Einheitliche Navigation: Hauptmenü und Spiel-Hauptfenster zeigen Einstellungen (Zahnrad), das Spiel-Hauptfenster zusätzlich das Haus zurück zum GameHub. Während einer laufenden Partie (Übersicht, Runde, Ergebnis) gibt es oben nur noch ein X „Spiel beenden“. Die Bestätigung erfolgt ohne Dialog: Das erste Tippen färbt den Button für 3 Sekunden rot und erweitert ihn um den Hinweis „Nochmal tippen zum Beenden“ (auf dem Handy gibt es keine Tooltips), erst ein zweites Tippen beendet (neue Komponente `ConfirmButton`, ein schnelles Doppeltippen zählt nicht). Es führt zurück ins Hauptfenster des Spiels mit der bisherigen Einrichtung. Neue Spiele binden sich über `useGameExit` ein.
- Einstellungsfenster kompakter; Schließen-Button als kleines X.
- Rundenübersicht kompakter: Die Karte „Als Nächstes dran“ entfällt. Der Teamname sitzt (klein, ohne Rahmen) als Erweiterung direkt über dem Button „Runde starten“.
- Überspringen pro Runde begrenzt: Auswahl „Nie / 1 / 2 / 3 / Unbegrenzt“ unter „Weitere Optionen“, Standard 1 (neue Konfiguration `skipsPerRound`, von der Zustandsmaschine durchgesetzt). Ist das Limit aufgebraucht, verschwindet „Überspringen“ und „Verbotenes Wort“ füllt die linke Spalte.
- Laufende Runde ist pausier- und unterbrechbar: Oben steht in der Runde nur noch Pause/Fortsetzen (Play-Symbol). Während der Pause läuft der Timer nicht weiter, die Karte ist verdeckt („Pausiert“) und die Wertungsbuttons sind gesperrt. In der Pause gibt es „Fortsetzen“, „Runde neu starten“ (rote Zweifach-Bestätigung; verwirft die Punkte und Ergebnisse dieses Zuges und startet mit neuen Karten; bereits gezeigte Karten dieses Zuges kehren nicht zurück, damit niemand schummeln kann; Ereignis `restartRound`) und „Runde beenden“ (zeigt die Rundenübersicht). Das ganze Spiel beendet nur das X in Übersicht und Ergebnis.
- Das Entwicklungs-Dashboard erhält seinen eingebetteten Status per `pnpm docs:sync` aus `docs/GAMEHUB_STATUS.json`; `pnpm docs:check` läuft in der CI und schlägt bei veraltetem Stand fehl.
- Stechen bei Gleichstand (Option „Stechen bei Gleichstand“ unter „Weitere Optionen“, Standard an): Liegen 2–3 Teams nach der letzten Runde gleichauf, erklärt jedes Team nacheinander drei Begriffe (je einen einfachen, mittleren und schweren, für jedes Team andere Karten) auf Zeit. Verbotenes Wort gibt +5 Sekunden Strafe, einmal überspringen ist erlaubt (Ersatzkarte gleicher Schwierigkeit), nach 90 Sekunden endet der Versuch. Es gewinnt, wer die meisten Begriffe in der kürzesten Zeit schafft; bei exakt gleichem Ergebnis oder mehr als drei gleichauf liegenden Teams gewinnen alle gemeinsam. Pause zählt nicht zur Zeit. Die Ergebnisansicht zeigt Begriffe und Zeiten. Neue Zustände/Ereignisse in der Zustandsmaschine (`tiebreak`, `beginTiebreakAttempt`, `answerTiebreak`, `endTiebreakAttempt`) und `pickTiebreakCards`.
- Die Schwierigkeit (Einfach/Mittel/Schwer) steht während der Runden als kleines Etikett auf der Karte.
- Endergebnis im Stil der übrigen Ansichten: Beschriftung „Spiel beendet“, ein Gewinnerblock mit großem Teamnamen (bei Gleichstand „Gemeinsam gewonnen“), die Punkteliste und die beiden Aktionen („Gleiche Konfiguration“, „Neue Partie“) unten angeheftet. Die generische Statusbox entfällt.
- Zweifach-Bestätigungen (`ConfirmButton`) zeigen im ersten Schritt sichtbar, was ein erneutes Tippen auslöst. „Runde neu starten“ meldet „Keine neuen Karten verfügbar.“, wenn der Kartensatz keine ungesehene Karte mehr hat.
- Rundenkopf als ein Block mit Team, „Runde X/Y“, Punkten und Sekunden, darunter ein Zeitbalken (wird rot in den letzten 10 Sekunden). Auf der Karte stehen die verbotenen Wörter unter der Beschriftung „Verbotene Wörter“ in rötlich umrandeten Kacheln, durch eine Trennlinie klar vom Begriff abgesetzt (Begriff oben, Wörter unten).
- Der Überspringen-Button zeigt klein darunter den Hinweis „nur 1× pro Runde“ (bei anderen Limits „noch X von Y“).
- Aktionsbuttons in der Runde neu angeordnet: „Richtig“ groß rechts (zwei Zeilen hoch), links oben „Verbotenes Wort“, darunter „Überspringen“.
- Punkteübersicht ohne Hervorhebung des nächsten Teams; das Team steht über „Runde starten“.
- Übersprungene Karten erscheinen in der Rundenübersicht neutral (grau, „Übersprungen“) und sind nicht änderbar; die Zustandsmaschine lehnt Änderungen an ihnen ab. Änderbar bleiben nur richtige und falsche Karten.
- Orange Akzente (Markierungen, Kartenrand, verbotene Wörter, Spielkarte) durch das blaue Akzentblau ersetzt; Rot bleibt für „Verbotenes Wort“.
- Teamnamen im Tabu-Setup frei wählbar; leere Felder fallen auf „Team N“ zurück, doppelte Namen werden abgelehnt.

### Kompakte Tabu-Oberfläche

- Tabu auf Desktop und Mobil in einer schmalen, zentrierten Ansicht dargestellt.
- Teams, Runden und Zeit stehen vor aufklappbaren Kartenoptionen. Kartenverwaltung ist während der Partie ausgeblendet.
- Laufende Runde mit großem Begriff, rein numerischem Countdown und klarer Reihenfolge der Kartenaktionen gestaltet.

### Al-05-04 – Release-Abnahme und Punktekorrektur

- Versehentlich vergebene Tabu-Punkte lassen sich in der laufenden Runde und in der Zusammenfassung zurücknehmen.
- Tastaturbedienung und zentrale Kontraste geprüft. 148 automatisierte Tests und 20 Browserprüfungen bestanden.
- Ersten lokalen Tabu-Release abgenommen und auf GitHub Pages veröffentlicht.

### Al-05-03 – Veröffentlichung über GitHub Pages

- Produktionsartefakt wird erst nach erfolgreichen Pflichtprüfungen von `main` veröffentlicht.
- Browserprüfungen verwenden das vorinstallierte Chrome des GitHub-Runners. Fehler liefern Screenshots und Traces.
- Öffentliche App unter https://erik513.github.io/GameHub/ geprüft. Assets, direkter Tabu-Link und Offline-Neuladen waren erfolgreich.

### Al-05-02 – Offline- und Update-Prüfungen

- Fehlgeschlagene Cache-Installation räumt ihren eigenen Cache auf. Die bisherige Version bleibt offline verfügbar.
- Versionswechsel, Aufräumen des alten Caches und erneuter Offline-Start im Browser geprüft.
- 20 Browserprüfungen auf Desktop und Mobil bestanden.

### Al-05-01 – Kritische Tabu-Spielabläufe

- Vollständige Partien mit Einzelsieg und Gleichstand auf Deutsch und Englisch im Browser geprüft.
- Kartenaktionen, Teamwechsel, Neustart und Neuladen abgedeckt. 18 Desktop- und Mobilprüfungen bestanden.
- Race und Countdown-Duell als spätere Tabu-Spielmodi im Projektplan festgehalten.

### Ta-04-05 – Tabu-Kartenvorschläge und lokale Speicherung

- Lokalen Kartenvorrat und optionales Ollama-Modell in der Tabu-Ansicht auswählbar gemacht.
- Gültige Vorschläge und Ablehnungsgründe angezeigt. Nur ausgewählte und bestätigte Karten werden gespeichert.
- 147 automatisierte Tests und 14 Browserprüfungen bestanden. Lokale Vorschläge sind offline nutzbar.

### Ta-04-04 – Optionaler Ollama-Adapter

- Lokale Ollama-API mit strukturierten JSON-Antworten an den Generierungsvertrag angebunden.
- Fehlerhafte Antworten, fehlende Verbindung, Zeitüberschreitung und Abbruch behandelt.
- 145 Tests bestanden. Der Adapter wurde mit simulierten HTTP-Antworten geprüft.

### Ta-04-03 – Lokaler Anbieter für Tabu-Karten

- Separaten Vorrat mit 18 deutschen und 18 englischen Kartenkandidaten ergänzt.
- Auswahl nach Sprache, Kategorie und Schwierigkeit. Zu kleine Vorräte werden als Teilergebnis gemeldet.
- 135 Tests bestanden. Alle lokalen Kandidaten wurden ohne Netzwerk geprüft.

### Ta-04-02 – Generierte Tabu-Karten prüfen

- Kartenfelder, angefragte Sprache, Kategorie, Schwierigkeit und Verbotswörter geprüft.
- Unicode und Leerzeichen normalisiert. Ablehnungen enthalten Kartenposition und Fehlergrund.
- Vor dem gemeinsamen Speichern ausgewählter Karten wird der aktuelle Bestand erneut auf Duplikate geprüft. 132 Tests bestanden.

### Ta-04-01 – Anbieterunabhängiger Vertrag für Kartengenerierung

- Anfrage, Kartenkandidaten, vollständige und teilweise Ergebnisse, Fehler und Abbruch definiert.
- Anbieter geben unterstützte Sprachen, maximale Anfragemenge und Offlinefähigkeit an.
- 129 Tests bestanden, darunter Vertragsfälle mit Testanbieter.

### Ta-03-04 – Installierbare Web-App und Offlinebetrieb

- Manifest und App-Symbol für GameHub ergänzt.
- Produktionsdateien mit einem Service Worker zwischengespeichert. Neue Versionen übernehmen nach dem Schließen der bisherigen App-Fenster.
- 14 Browserprüfungen bestanden, einschließlich Tabu-Spielstart nach Offline-Neuladen auf Desktop und Mobil.

### Ta-03-03 – Eigene Tabu-Karten importieren und sichern

- Versioniertes JSON-Format und Prüfung der Karten vor dem Import ergänzt.
- Doppelte IDs und Begriffe in derselben Sprache werden übersprungen. Eigene Karten bleiben bei Änderungen der Standardsätze erhalten.
- Import und Export in der Tabu-Ansicht ergänzt. 126 Tests bestanden.

## 2026-11-10

### Ta-03-02 – Deutsche und englische Tabu-Standardkarten

- Je 45 geprüfte Standardkarten in drei Kategorien und Schwierigkeitsstufen ergänzt.
- Karten werden am Anwendungseinstieg bereitgestellt. Die Oberfläche greift über typisierte Eingabedaten darauf zu.
- Vor Spielbeginn wird mindestens eine passende Karte je Teamrunde verlangt. Der Vorrat wird auf die verbleibenden Teamrunden aufgeteilt.
- 109 Tests bestanden, darunter Bestandsprüfung und Datensatzvalidierung.

### Ta-03-01 – Lokaler Kartenspeicher

- Versionierten IndexedDB-Speicher mit eigener Tabu-Schnittstelle für benutzerdefinierte Karten ergänzt.
- Fünf Integrationstests prüfen Schema, erneutes Öffnen, Eingabevalidierung und Rücknahme fehlerhafter Schreibvorgänge.
- Speicherumfang und späteren Tabu-Feinschliff zur Korrektur versehentlicher Wertungen im Projektplan festgehalten.

### Ta-02-04 – Spielende und Neustart

- Endstand und Sieger nach der letzten Runde angezeigt, einschließlich gemeinsamer Sieger bei Gleichstand.
- Neue Partie mit gleicher oder neuer Konfiguration ermöglicht. Punkte und gespielte Karten werden zurückgesetzt.
- 101 Tests bestanden, darunter Einzelsieg, Gleichstand und beide Neustartwege.

### Ta-02-03 – Rundenende

- Rundenpunkte, Gesamtpunktestand aller Teams und nächstes Team angezeigt.
- Nächste Runde startet per Klick mit neuem Countdown und ungespielten Karten. Ein erschöpfter Beispielsatz wird gemeldet.
- 99 Tests bestanden, darunter Runden mit und ohne Punkte sowie der Teamwechsel.

### Ta-02-02 – Laufende Runde und Timer

- Tabu-Runde mit Countdown, Team, Punkten, Begriff und drei verbotenen Wörtern ergänzt.
- Kartenaktionen werten die aktuelle Karte. Beim Zeitablauf endet die Runde automatisch.
- Kleinen deutschen und englischen Beispielsatz für die laufende Runde ergänzt.
- 99 Tests bestanden. Neue Browserprüfung auf Desktop und Mobil erfolgreich.

### Ta-02-01 – Tabu-Spielkonfiguration

- Formular für Teams, Rundenzahl, Rundendauer, Kartensprache, Kategorien und Schwierigkeit ergänzt.
- Fehler in Deutsch und Englisch angezeigt. Gültige Angaben erzeugen den Vorbereitungszustand der Partie.
- 98 Tests bestanden, darunter Formularvalidierung und Vorbereitung in beiden Sprachen.

### Ta-01-05 – Kartenfilter und Deckbildung

- Karten nach Sprache, Kategorie und Schwierigkeit filtern und mit austauschbarer Zufallsquelle mischen.
- Doppelte Kartenkennungen und bereits gespielte Karten ausschließen. Leere und zu kleine Decks gesondert melden.
- 96 Tests bestanden. Die Tabu-Kernlogik ist abgeschlossen.

### Ta-01-04 – Rundenfolge und Siegerermittlung

- Spielende nach der konfigurierten Zahl von Runden pro Team geprüft.
- Alle Teams mit Höchstpunktzahl werden in der Reihenfolge der Teamliste als Sieger ausgewiesen.
- 88 Tests bestanden, darunter Partien mit zwei und drei Teams, Einzelsieg und Gleichstand.

### Ta-01-03 – Kartenaktionen und Punkte

- Richtige Antworten zählen einen Punkt. Überspringen und verbotene Wörter zählen null Punkte.
- Jede gewertete Karte wird für die restliche Partie gesperrt. Nach der letzten Karte endet die Runde.
- 87 Tests bestanden, darunter alle Kartenaktionen und Wiederholungsversuche.

### Ta-01-02 – Zustandsmaschine und Übergänge

- Tabu-Zustandsmaschine für Vorbereitung, laufende Runde, Rundenende und Spielende ergänzt.
- Ungültige Übergänge, Karten in der falschen Sprache und verspätete Rundenende-Ereignisse werden abgewiesen.
- Vollständige Partie mit drei Teams und zwei Runden geprüft; insgesamt 86 Tests bestanden.

### Ta-01-01 – Tabu-Domänenmodell und Validierung

- Unabhängige fachliche Typen für Teams, Kategorien, Schwierigkeit, Karten und Spielkonfiguration ergänzt.
- Mindestens zwei eindeutig benannte Teams, positive ganzzahlige Rundendauer und Rundenzahl sowie deutsche oder englische Sprachmetadaten geprüft.
- Exakt drei unterschiedliche, nichtleere verbotene Wörter erzwungen; der gesuchte Begriff darf nicht darunter sein.
- Unicode und Leerzeichen normalisiert; strukturierte Fehlercodes für spätere lokalisierte Anzeigen bereitgestellt.
- 83 Tests bestanden, davon 26 neue Domänenfälle; neue Spiellogik mit 100 % Zeilen- und Verzweigungsabdeckung.

### Al-04-03 – Einstellungen und Statusmeldungen

- Lokalisierten Einstellungsdialog für getrennte Oberflächen- und Kartensprachen ergänzt.
- Zugängliche Lade-, Fehler-, Erfolgs- und Leerzustände erstellt.
- 57 Tests und zehn Desktop-/Mobil-Browserprüfungen erfolgreich ausgeführt.

### Al-04-02 – App-Shell, Spielkatalog und Navigation

- Responsive App-Shell mit GameHub-Marke, Hauptnavigation und dauerhaft erreichbaren Spracheinstellungen erstellt.
- Verpflichtende Spielauswahl als Startseite umgesetzt; kein Spiel startet automatisch.
- Genreunabhängigen Spielmodulvertrag für ID, Route, Übersetzungsschlüssel, Status und visuellen Akzent eingeführt.
- Zentralen Katalog mit Tabu-Entwicklungsvorschau sowie geplanten Karten-, Scharade-, Quiz- und „Wer bin ich?“-Modulen angelegt.
- Statisches Hash-Routing für GitHub-Pages-kompatible Navigation zwischen Spielauswahl und Vorschau umgesetzt.
- Geplante Spiele klar gekennzeichnet und deaktiviert; Tabu öffnet eine Entwicklungsvorschau ohne Spielfunktion vorzutäuschen.
- 52 Tests und acht Desktop-/Mobil-E2E-Fälle erfolgreich ausgeführt.
- Zusätzliche sichtbare Browserprüfung war wegen ausgeschöpftem Browser-Kontingent nicht verfügbar; responsive Darstellung und Navigation wurden durch Playwright verifiziert.


### Al-04-01 – Design-Tokens und Basiskomponenten

- Zurückhaltende GameHub-Designrichtung mit primärem Dark Mode, tiefem Anthrazit, warmem hellem Text, Kobaltblau und gezieltem Korallakzent umgesetzt.
- Zentrale Tokens für Farben, Typografie, Abstände, Radien, Schatten, Kontrollgrößen und Inhaltsbreiten angelegt.
- Wiederverwendbare Komponenten für Buttons, Eingabefelder, Karten und Dialoge erstellt.
- Tastaturfokus, deaktivierte Zustände, Fehlerbeschreibungen, Dialogfokus und Escape-Schließen zugänglich umgesetzt.
- Startansicht ohne Verläufe und Glaseffekte auf das neue Designsystem umgestellt.
- Desktopansicht und 320-Pixel-Mobilansicht im Browser geprüft; kein horizontales Scrollen festgestellt.
- 43 Tests erfolgreich; Basiskomponenten erreichen 100 % Zeilen- und 96,29 % Verzweigungsabdeckung.
- Primäre Farb-Tokens nach Nutzerpräferenz vollständig auf Dark Mode umgestellt; Formensprache, Kontraste und Komponentenstruktur beibehalten.


### Al-03-04 – Übersetzungsparität prüfen

- Rekursive Prüfung für identische Schlüsselstrukturen in deutschen und englischen Übersetzungsressourcen ergänzt.
- Leere, ausschließlich aus Leerzeichen bestehende und ungültige Nicht-Text-Werte werden abgewiesen.
- Positive Prüfung der echten Ressourcen sowie negative Fälle für fehlende, zusätzliche, leere und ungültige Werte umgesetzt.
- Eigenen Befehl `pnpm check:translations` ergänzt und als verpflichtenden Schritt in GitHub Actions aufgenommen.
- i18n-Dateien in die Coverage-Messung und bereichsspezifische Mindestgrenze aufgenommen.
- 35 Tests erfolgreich; Phase Al-03 ist damit vollständig abgeschlossen.

### Al-03-03 – Unabhängige Kartensprache

- Reines Business-Modell für unabhängige UI- und Kartensprache ergänzt.
- Alle vier Kombinationen aus Deutsch und Englisch sowie unabhängige Änderungen beider Werte getestet.
- Kartensprache als eigene, lokalisierte Auswahl in die Startansicht aufgenommen.
- UI- und Kartensprache unter getrennten localStorage-Schlüsseln gespeichert.
- Gespeicherte Kartensprache beim App-Start wiederhergestellt; ohne gespeicherten Wert wird einmalig die initiale UI-Sprache übernommen.
- 29 Unit-, Infrastruktur- und Komponententests sowie sechs E2E-Fälle in Desktop- und Mobilprofilen erfolgreich ausgeführt.

### Al-03-02 – Erkennung, Auswahl und Persistenz der UI-Sprache

- Gespeicherte UI-Sprache vor der Browsersprache priorisiert und Englisch als kontrollierten Fallback beibehalten.
- Sprachvarianten wie `de-DE` und `en-US` auf die unterstützten Sprachen normalisiert.
- Zugängliche Sprachwahl für Deutsch und Englisch in die Startansicht integriert.
- Speicher-Port von einem fehlertoleranten localStorage-Adapter getrennt und im Composition Root verdrahtet.
- Sprachwechsel dauerhaft gespeichert und beim Neuladen vor dem ersten Rendern wiederhergestellt.
- 19 Unit-, Infrastruktur- und Komponententests sowie vier E2E-Fälle in Desktop- und Mobilprofilen erfolgreich ausgeführt.

### Erweiterbare Spielauswahl verbindlich geplant

- App-Start mit verpflichtender Spielauswahl als dauerhafte Produktanforderung festgelegt.
- Zentralen, genreunabhängigen Spielkatalog als einzige Quelle für verfügbare und geplante Spiele beschlossen.
- Minimalen Spielmodulvertrag für Kennung, Übersetzungsschlüssel, Route und Verfügbarkeitsstatus nach `Al-04-02` vorgezogen.
- `Al-06-02` auf eine spätere, bedarfsgesteuerte Überprüfung und Erweiterung des frühen Vertrags ausgerichtet.
- ADR-013 und verbindliche Arbeitsregeln ergänzt, damit Shell und Navigation keine einzelnen Spiele fest einbauen.

### Al-03-01 – i18n-Grundkonfiguration

- `i18next` und `react-i18next` als Laufzeitabhängigkeiten eingerichtet.
- Gemeinsamen Übersetzungsnamensraum mit deutschen und englischen Ressourcen angelegt.
- Englisch als kontrollierte Fallback-Sprache und Deutsch sowie Englisch als unterstützte Sprachen definiert.
- i18next-Typen um die GameHub-Ressourcenstruktur erweitert, sodass Übersetzungsschlüssel statisch geprüft werden.
- Sämtliche sichtbaren Texte der Startansicht aus den React-Komponenten in Übersetzungsressourcen verschoben.
- Initialisierung und Darstellung der Startansicht in beiden Sprachen mit sieben erfolgreichen Tests geprüft.
- Sprachregeln für deutsches Entwicklungs-Dashboard sowie englischen Quellcode und englische Code-Kommentare verbindlich dokumentiert.

### Al-02-06 – GitHub-Actions-Qualitätsworkflow abgeschlossen

- Lokales Repository mit `https://github.com/Erik513/GameHub` verbunden und vollständigen Projektstand auf `main` veröffentlicht.
- Vorhandenen GitHub-Initialisierungscommit ohne Überschreiben in die gemeinsame Historie aufgenommen.
- Ersten gehosteten Workflowlauf `42850423012` erfolgreich abgeschlossen.
- Quality-Job mit Format, Lint, Typecheck, Architekturprüfung, Coverage und Build erfolgreich ausgeführt.
- Playwright-E2E-Job mit Desktop- und Mobilprofil erfolgreich ausgeführt.
- `Al-02-06` abgeschlossen; Phase Al-02 ist damit vollständig erledigt.

### Umbenennung in GameHub

- Projektordner von `PartyHub` in `GameHub` umbenannt.
- Paketname, React-Komponenten, Business-Typen, Tests, E2E-Prüfungen, Dashboard und sämtliche Dokumentation auf `GameHub` umgestellt.
- Dokumentationsdateien von `PARTYHUB_*` in `GAMEHUB_*` umbenannt.
- Produktbeschreibung für Party-, Quiz-, Karten- und weitere Gesellschaftsspiele geöffnet.
- pnpm-Abhängigkeiten am neuen Repository-Pfad vollständig neu verknüpft.

## 2026-11-09

### Al-02-06 – GitHub-Actions-Qualitätsworkflow

- GitHub-Actions-Workflow für Pushes, Pull Requests und manuelle Ausführung erstellt.
- Offizielle Actions `actions/checkout@v7`, `pnpm/setup@v1` und `actions/upload-artifact@v7` verwendet.
- Node.js 24, pnpm 11.25.0, Dependency-Cache und Installation mit eingefrorenem Lockfile konfiguriert.
- Quality-Job für Format, Lint, Typecheck, Architekturprüfung, Vitest-Coverage und Produktions-Build eingerichtet.
- Separaten Playwright-Job mit gebündeltem Chromium sowie Diagnoseartefakten bei Fehlern eingerichtet.
- Playwright verwendet lokal installiertes Chrome und in CI das gebündelte Chromium.
- YAML-Format, alle Workflow-Befehle, beide lokalen E2E-Profile und die CI-Projektauflösung erfolgreich geprüft.
- Aufgabe bleibt blockiert, bis ein GitHub-Remote verbunden und der erste gehostete Workflow erfolgreich ausgeführt wurde.

### Al-02-05 – Playwright-Grundkonfiguration

- Playwright Test 1.65.0 eingerichtet.
- Desktop-Chromium- und Mobile-Chromium-Profil auf Basis des lokal installierten Chrome konfiguriert.
- Automatischen Vite-Webserver für E2E-Läufe eingebunden.
- Screenshots nur bei Fehlern sowie Video und Trace zur Fehlerdiagnose konfiguriert.
- Smoke-Test für Titel, Hauptüberschrift und Architekturliste ergänzt.
- Zwei reguläre Smoke-Tests in Desktop- und Mobilprofil erfolgreich ausgeführt.
- Kontrollierter Fehltest erzeugte Screenshot, Video und Trace wie vorgesehen. Temporärer Test und seine Artefakte wurden anschließend entfernt.
- Installation des gebündelten Chromium-Browsers wegen zu wenig freiem Speicher abgebrochen. Das bereits installierte Chrome wird erfolgreich verwendet.
- Vitest-Coverage, Lint, Formatprüfung, Typecheck, Architekturtest, Produktions-Build und Peer-Prüfung erneut erfolgreich ausgeführt.

### Al-02-04 – Coverage und Bereichsgrenzen

- V8-Coverage-Provider passend zu Vitest 5.1.0 eingerichtet.
- Text-, JSON-, JSON-Summary-, HTML- und LCOV-Berichte konfiguriert.
- Line-, Branch-, Function- und Statement-Grenzen festgelegt. Kritische Spiellogik 95 %, Business 90 %, Data/Infrastructure 80 % und Presentation/App 75 %.
- Dritten Komponententest für den Composition Root ergänzt.
- Positiver Coverage-Lauf mit drei bestandenen Tests und 100 % auf allen aktuell ausführbaren Dateien erfolgreich.
- Kontrollierter Negativtest unterschritt die globale und UI-spezifische Grenze und ließ den Coverage-Befehl erwartungsgemäß fehlschlagen.
- Lint, Formatprüfung, Typecheck, Architekturtest, Produktions-Build und Peer-Prüfung erneut erfolgreich ausgeführt.

### Al-02-03 – Vitest und Testing Library

- Dashboard-Zustandsspeicherung von flüchtigem Session Storage auf dauerhaftes Local Storage umgestellt. Klappzustände werden bei jeder Änderung und die Scrollposition beim Scrollen beziehungsweise Verlassen gespeichert.
- Vitest 5.1.0 mit jsdom-Testumgebung und zentralem Setup eingerichtet.
- Testing Library für React, DOM, jest-dom-Matcher und user-event installiert.
- Explizites DOM-Cleanup nach jedem Test eingerichtet.
- Neutralen Business-Unit-Test und Komponententest der Startansicht ergänzt.
- CI-Testlauf und Watch-Einstieg erfolgreich geprüft. Zwei von zwei Tests bestehen.
- Dashboard-Anzeige „Stand“ auf die tatsächliche 20-Sekunden-Prüfzeit umgestellt und den Projekt-Datenstand separat ausgewiesen.
- Lint, Formatprüfung, Typecheck, Architekturtest, Produktions-Build und Peer-Prüfung erneut erfolgreich ausgeführt.

### Al-02-02 – Linting und Formatierung

- ESLint 10 mit type-aware TypeScript-Regeln sowie React-Hooks- und React-Refresh-Regeln eingerichtet.
- Prettier mit einheitlicher Projektkonfiguration und gezieltem Prüfbereich eingerichtet.
- Skripte `lint`, `lint:fix`, `format` und `format:check` ergänzt.
- TypeScript auf die von typescript-eslint unterstützte Version 6.0.3 festgelegt.
- Positive Lint- und Formatläufe sowie negativer Regel-Smoke-Test erfolgreich geprüft.
- Typecheck, Architekturprüfung, Produktions-Build und Peer-Abhängigkeitsprüfung erneut erfolgreich ausgeführt.

### Projektumzug

- GameHub nach `C:\Users\Kosta\source\repos\GameHub` verschoben.
- Git-Repository mit Hauptbranch `main` initialisiert.
- TypeScript-Buildinformationen über `.gitignore` von der Versionierung ausgeschlossen.

### Al-02-01 – Vite-Grundprojekt und Schichtenstruktur

- React 19.3.1, React DOM 19.3.1, TypeScript 7.0.2 und Vite 8.3.6 mit pnpm eingerichtet.
- Strikte TypeScript-Projektkonfiguration und Vite-Composition-Root angelegt.
- Verzeichnisse für Presentation, Business, Data, Infrastructure, i18n und App-Verdrahtung erstellt.
- Neutralen, responsiven GameHub-Startbildschirm umgesetzt.
- Automatische Prüfung der Business-Schicht gegen äußere Abhängigkeiten ergänzt.
- Typecheck, Architekturprüfung, Produktions-Build und Entwicklungsserver-Smoke-Test erfolgreich ausgeführt.

### Projektvorbereitung

- `Al-02-01` gestartet und Projektstatus auf `in_progress` gesetzt.
- pnpm 11.25.0 als verfügbaren Paketmanager erkannt. Die frühere npm-Blockade ist damit aufgelöst.
- Dashboard lädt im direkten Dateimodus alle 20 Sekunden neu und stellt Scrollposition, Klappzustände und Fokus aus dem Session-Speicher wieder her.
- Falsch gesetzten zukünftigen Statuszeitpunkt von 20:00 Uhr auf den tatsächlichen Stand 19:43 Uhr korrigiert.
- Hinweisbanner beim direkten Öffnen des Dashboards entfernt. Der eingebettete Status wird in diesem Modus ohne Warnmeldung dargestellt.
- Dashboard-Aktualisierung zustandserhaltend gemacht. Unveränderte Statusdaten erzeugen keinen DOM-Neuaufbau. Bei echten Änderungen bleiben Scrollposition, geöffnete Phasen und Tastaturfokus erhalten.
- Dashboard um einen eingebetteten Status-Fallback für das direkte Öffnen per `file://` ergänzt. Der Live-Modus über HTTP lädt weiterhin alle 20 Sekunden die Statusdatei.
- Verbindliche Arbeitsregeln in `AGENTS.md` angelegt.
- Vollständigen Projektplan mit neun Phasen, Aufgaben, Akzeptanzkriterien und Testanforderungen erstellt.
- Maschinenlesbare Statusverwaltung mit stabilen Aufgaben-IDs eingerichtet.
- Entwicklungs-Dashboard mit automatischer Aktualisierung im 20-Sekunden-Takt erstellt.
- Architekturentscheidungen für Schichten, Zustandsmaschine, Internationalisierung, Speicherung, PWA, Provider-Abstraktion und Tests dokumentiert.
- README mit Ziel, Stack, Status und nächstem Schritt erstellt.
- Umgebung geprüft. Node.js 24.22.1 und Git 2.55.0 sind verfügbar. `npm` ist nicht im PATH verfügbar. Noch kein Git-Repository vorhanden.

Es wurden keine Spiele, keine KI-Anbindung und kein Multiplayer implementiert.

## 2026-11-20

### Variable Rollen: Muss/Darf, Varianten und unabhängige Zusätze

- We-03-67 abgeschlossen: Wünsche 1–7 für variable Werwolf-Rollen umgesetzt. Muss-/Darf-Pools, gezählte Rollenfamilien, Optionsmengen und gleichverteilte Wolfswahl; jeder optionale Zusatz unabhängig mit 50 %. Machbarkeit mit Grenzen und Sperrgründen; separate Empfehlung nur anhand der Muss-Einträge. Frühere Itembereiche und Wolfsberechnung nach Ziehung ersetzt. 313 Tests erfolgreich; neue API und Migrationshinweise dokumentiert. UI-Anbindung bleibt separat.
- 313 gezielte Tests einschließlich 100 kompletter Partien bestanden. Exakte Ziehungsverteilung, unabhängige 50-%-Zusätze, Muss-Varianten, alle Spielerzahlen 6–20, Machbarkeitsgrenzen, Fehlerfälle und Hammer-Tarnaufrufe geprüft. variableSetup.ts: 100 % Zeilen / 99,52 % Zweige; geprüfte kritische Module insgesamt 99,86 % Zeilen / 98,23 % Zweige. Typprüfung, Lint, Format und Schichtprüfung bestanden. Keine Balance-Simulationen erneut gestartet.


### Zweite Regelrunde: nächtlicher Amulettschutz

- Werwolf We-03-66 abgeschlossen: Amulett nur noch gegen Nachtangriffe; Abstimmung und Jägerschuss werden trotz Amulett aufgelöst. Keine künstliche Weitergabepflicht bei Liebeskummer. Freie Paarentscheidungen, Wolfsparität und unveränderte Trunkenbold-Enthüllung in Nacht drei geprüft. 277 gezielte Tests, 100 komplette Partien und zwei Sechser-Kombinationsprüfungen bestanden; 99,83 % Zeilen / 98,07 % Zweige. Historische Balancewerte nicht neu simuliert; UI-Anbindung bleibt We-01-48.


### Neue Rollenregeln und Amulett-Zeitfolge umgesetzt

- Werwolf: Harter Bursche mit wolfOnly/anyAttack, öffentlicher Lehrlingsaufruf und Amors Selbstwahl geprüft; Amulett umgeht keinen Hammer mehr und wird als letzter Nachtschritt vor der Morgenauflösung weitergegeben. Schutz gilt beim jeweiligen Besitzer im Angriffszeitpunkt, nicht rückwirkend. Früherer Träger ist beim späteren Jägerschuss ungeschützt. 273 Tests, beide Sechser-Kombinationsprüfungen, Typ-/Lint-/Schichtprüfung erfolgreich; UI-Anbindung als We-01-48 vorgemerkt.
- Log und Spielerprojektion erhalten toughGuyWound mit Ursache, handelnden Personen und ursprünglicher Nacht. Historische Balancewerte wurden nicht neu simuliert.


### Erzähler-Logikschnittstellen abgeschlossen

- Werwolf: neue Hammer-Reihenfolge, gültige Ziele, Nachtskript mit Tarnaufrufen, strukturierte Aktions-/Todesprotokolle, Spielerprojektion und reine Rücknahme umgesetzt. 262 Tests plus gezielte Sechser-Kombinationsprüfung bestanden; geprüfte Logik 99,83 % Zeilen / 98,04 % Zweige. Neue Erzähler-API für Claude dokumentiert; UI-Integration bleibt gesondert.
- Zusätzliche Sechser-Kombinationsprüfung fand veraltete Opfer-/Jägermeldungen in Tarnfortsetzungen; korrigiert und eigener Regressionstest ergänzt. Historische Balancearchive nicht neu berechnet.


Nachprüfung advancedRoles.test.ts: 14 weitere Tests zu We-03-70 bestanden. Veraltete Verzichtserwartung an die Pflichtregel der Alten Vettel angepasst; keine Produktionslogik geändert.
