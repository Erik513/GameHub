# Verbindliche Arbeitsregeln für GameHub

Diese Regeln gelten für Codex, Claude Code und andere automatisierte Entwicklungsagenten im gesamten Repository.

## Sprache und Kommunikation

- Kommuniziere mit dem Auftraggeber ausschließlich auf Deutsch.
- Melde Fehler, fehlgeschlagene Prüfungen und Blockaden ausdrücklich.
- Kennzeichne Annahmen und noch nicht verifizierte Aussagen.
- Hole vor Änderungen grundlegender Architekturentscheidungen die Zustimmung des Auftraggebers ein.

## Aufgabensteuerung

- Arbeite immer nur an einer klar abgegrenzten Aufgabe mit eindeutiger ID aus `docs/GAMEHUB_STATUS.json`.
- Setze eine Aufgabe vor Arbeitsbeginn auf `in_progress` und aktualisiere `updatedAt`.
- Untersuche nur Dateien, die für die aktive Aufgabe relevant sind.
- Vermeide unnötige Änderungen, Refactorings und neue Abhängigkeiten.
- Bewahre funktionierendes Verhalten und bestehende öffentliche Schnittstellen, sofern die Aufgabe keine Änderung verlangt.
- Beginne keine Folgeaufgabe ohne Freigabe, wenn der Auftraggeber ausdrücklich eine Freigabegrenze gesetzt hat.

## Architektur

- Halte Presentation, Business und Data getrennt.
- Behandle Infrastructure als eigene Schicht für Browser-APIs, externe Dienste und Provider-Adapter.
- Die Business-Schicht darf React, IndexedDB, Browser-APIs oder konkrete KI-Anbieter weder importieren noch voraussetzen.
- Verwende Ports beziehungsweise Interfaces an Schichtgrenzen und implementiere technische Adapter außerhalb der Business-Schicht.
- Halte gemeinsame App-Infrastruktur unabhängig von der Spiellogik einzelner Spiele.
- Jedes Spiel besitzt eigene Business-Logik und eigene UI-Komponenten.
- Speichere keine geheimen API-Schlüssel im Frontend.
- Vermeide kostenpflichtige Dienste.

## Internationalisierung

- Lege sämtliche sichtbaren UI-Texte in Übersetzungsressourcen ab.
- Unterstütze Deutsch und Englisch für jede neue Benutzerfunktion.
- Behandle UI-Sprache und Spielkartensprache als getrennte Einstellungen.
- Ergänze Tests für beide Sprachen, soweit die aktive Aufgabe lokalisierte Funktionalität berührt.
- Führe die automatisierte Prüfung auf fehlende oder abweichende Übersetzungsschlüssel aus.

## Tests und Qualität

- Implementiere neue Funktionen zusammen mit den in der Aufgabe geforderten Tests.
- Führe mindestens die betroffenen Tests sowie passende statische Prüfungen aus.
- Markiere eine Aufgabe nur dann als `done`, wenn alle Akzeptanzkriterien erfüllt und die erforderlichen Tests erfolgreich sind.
- Dokumentiere ausgeführte Prüfungen und Resultate im Statusdatensatz.
- Prüfe Line- und Branch-Coverage. Zielwerte sind 95 % für kritische Spiellogik, 90 % für Business insgesamt, 80 % für Data und Infrastructure sowie 75 % für UI-Komponenten.
- Behandle fehlschlagende erforderliche Tests als Blockade der Fertigstellung.

## Dokumentationspflicht

- Aktualisiere nach jeder abgeschlossenen Aufgabe `docs/GAMEHUB_STATUS.json` und `docs/GAMEHUB_CHANGELOG.md`.
- Aktualisiere Projektplan und Entscheidungsdokument, wenn sich Anforderungen oder genehmigte Architekturentscheidungen ändern.
- Berechne Fortschritt ausschließlich aus tatsächlichen Aufgabenstatus. `done` zählt vollständig, `in_progress` zählt nicht als abgeschlossen.
- Halte Aufgaben-IDs über alle Dokumente hinweg stabil und eindeutig.
- Verwende ISO-8601-Datumswerte.

## Sicherheit und Umfang

- Implementiere nur den vereinbarten Aufgabenbereich.
- Veröffentliche keine Zugangsdaten, Tokens oder personenbezogenen Daten.
- Prüfe generierte Karten vor Speicherung auf Schema, Sprache, Duplikate und unzulässige Inhalte.
- Die App muss ohne Internetzugang und ohne KI-Anbieter vollständig mit lokalen Kartensätzen spielbar bleiben.
