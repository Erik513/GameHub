# GameHub – Werwolf

Aktueller Nachtablauf (We-03-68, 21.11.2026): Nicht gezogene Pool-Rollen und Zusätze werden übersprungen. Tarnaufrufe gelten nur für tatsächlich vorhandene verdeckte Rollen beziehungsweise verbrauchte Fähigkeiten. nightRolePool, nightItemPool und nightMayUseHammer sind entfernt. Änderungen sind im Logik-Arbeitsordner und gezielt im Werwolf-UI-Arbeitsstand übernommen. Die gewichtete variable Ziehung und Zahlenbeispiele stehen in [GAMEHUB_WERWOLF_VARIABLE_API.md](GAMEHUB_WERWOLF_VARIABLE_API.md); ältere widersprechende Tarn-/Gewichtungsaussagen sind ersetzt.

Aktueller variabler Modus (We-03-67, 20.11.2026): Die Wünsche 1–7 aus dem Abschnitt „Variable Rollen“ sind logisch implementiert. Muss-/Darf-Pools, Variantenmengen, ausgewählte Wolfszahlen und unabhängige 50-%-Zusätze ersetzen itemRange und die Wolfsberechnung nach Ziehung. Aktuelle Signaturen, Wahrscheinlichkeiten und UI-Metadaten: [GAMEHUB_WERWOLF_VARIABLE_API.md](GAMEHUB_WERWOLF_VARIABLE_API.md). Ältere gegenteilige Abschnitte sind historische Beschlussstände. Die UI-Anbindung bleibt separat.

Aktueller Beschlussstand der zweiten Regelrunde (We-03-66, 20.11.2026): Amulett schützt nur gegen nächtlichen Wolfsangriff, Gift und Todeszauber. Kein Schutz bei Hammer, Abstimmung oder Jägerschuss. Liebeskummer allein löst keine Weitergabepflicht aus. Verliebte entscheiden frei; ein verdeckter Trunkenbold-Wolf wird weiterhin erst in Nacht drei enthüllt. Implementiert und geprüft; aktuelle Anbindung in GAMEHUB_WERWOLF_NARRATOR_API.md.

Neue Rollenregeln vom 20.11.2026 sind in We-03-65 implementiert und geprüft. Aktuelle Optionen und Amulett-Zeitfolge siehe GAMEHUB_WERWOLF_NARRATOR_API.md. Oberflächenanbindung erfolgt gesondert in We-01-48; keine UI-Dateien in diesem Logikschritt geändert.

Aktueller Logikstand vom 20.11.2026: Hammer-Neuordnung, Zielkatalog, Tarnskript, Ereignisprotokoll, Spielerprojektion und Rücknahme sind implementiert. Verbindlicher Anschluss für Claude: [Erzähler-API](GAMEHUB_WERWOLF_NARRATOR_API.md). Ältere Planungs-/Prüfabschnitte beschreiben ihren damaligen Stand. Browser-Speicherung, Navigation und UI bleiben gesonderte Integrationsarbeit.

Aktuelle UI-Anbindung und Stand der festen/variablen Einstiege: [Technische Übergabe](GAMEHUB_WERWOLF_HANDOFF.md). Ältere Simulationsabschnitte dokumentieren ihren jeweiligen Prüfstand; für aktuelle Freigaben gelten `configuration.ts`, die normalen Spieleinstiege und die aktuelle Rollenübersicht der Entwicklungs-HTML.

**Aktuelle Bedienentscheidung (UI-Planung):** Bei festen Rollen wird die Wolfszahl innerhalb der freigegebenen Grenzen manuell gewählt und separat empfohlen; bei variablen Rollen bestimmt das System sie nach der Ziehung. Bei nur einem erlaubten Wert bleibt dieser fest. Der empfohlene Zahlenbutton erhält nur bei vorhandener Auswahl einen Rand und darunter „empfohlen“. Frühere Berichtspassagen zur verbindlichen Automatik in beiden Modi beschreiben den bisherigen Stand. Die Anpassung des festen Startpfads ist in `We-03-62` geplant; siehe [aktuelle UI-Spezifikation](GAMEHUB_WERWOLF_UI.md). In diesem Planungsschritt wurde keine Produktlogik geändert.

## Regelgrundlage

GameHub orientiert sich an der einfachen Partie aus dem [Regelheft von Ultimate Werewolf: Ultimate Edition](https://board-game-rules.com/wp-content/uploads/2025/01/ultimate-werewolf-ultimate-edition_Official-Rules.pdf). Die dort beschriebene Grundbesetzung gilt für 6 bis 15 Spieler plus Erzähler. GameHub wird für bis zu 20 Mitspielende plus Erzähler ausgelegt. Die Gruppengrößen werden nacheinander geprüft; die zusätzlichen Aufstellungen stehen weiter unten. Bei 6 bis 8 Spielern gibt es einen Werwolf, bei 9 bis 11 zwei und bei 12 bis 15 drei. Dazu kommen eine Seherin und für alle übrigen Spieler die Rolle Dorfbewohner.

## Ablauf

1. **Vorbereitung.** Die App lost die Rollen aus. Jede Person sieht ihre eigene Rolle verdeckt am Handy. Danach übernimmt der Erzähler.
2. **Erste Nacht.** Die Werwölfe erwachen zuerst und erkennen einander. Es gibt noch kein Opfer. Danach zeigt die Seherin auf einen Mitspieler und erfährt durch ein lautloses Zeichen, ob er ein Werwolf ist.
3. **Weitere Nächte.** Die lebenden Werwölfe müssen sich schweigend auf ein Opfer aus der Dorfseite einigen. Gibt es innerhalb der vom Erzähler gesetzten Zeit keine Einigung, entfällt der Angriff. Anschließend prüft die Seherin einen Mitspieler, sofern sie noch lebt.
4. **Morgen.** Der Erzähler weckt das Dorf und gibt bei einem Ausscheiden den Namen und die genaue Rolle bekannt. Ausgeschiedene beobachten die Partie schweigend und stimmen nicht mehr ab.
5. **Tag.** Ein lebender Spieler nominiert einen Mitspieler, ein weiterer unterstützt die Nominierung. Nach einer kurzen Verteidigung stimmen die Lebenden gleichzeitig per Daumenzeichen ab. Eine strikte Mehrheit für das Ausscheiden beendet den Tag. Bei Gleichstand oder geringerer Zustimmung geht die Diskussion weiter und weitere Nominierungen sind möglich. Der Erzähler kann den Tag ohne Ausscheiden beenden, wenn das gesetzte Zeitlimit erreicht ist.
6. **Sieg.** Das Dorf gewinnt, sobald alle Werwölfe ausgeschieden sind. Die Werwölfe gewinnen, sobald mindestens so viele Werwölfe wie Mitglieder der Dorfseite leben. Die Seherin zählt zur Dorfseite. Die App prüft die Siegbedingung nach jedem Ausscheiden. Auch bei 2:2 und 1:1 endet die Partie mit einem Wolfssieg. Die Rollen der lebenden Verliebten zählen zu ihrer jeweiligen Seite.

## Erzähleransicht

- Ein Erzähler ohne eigene Spielrolle bedient das Handy und leitet die Partie am Tisch. Die App zeigt ihm kurze Regiehinweise wie **Werwölfe aufwecken**, **Seherin aufwecken** und **Dorf aufwecken**. Was er der Gruppe sagt, formuliert er selbst.
- Bei jedem Aufweckschritt hält der Erzähler das verdeckte Panel gedrückt und schiebt es nach oben, wie bei der Rollenanzeige in Imposter. Darunter erscheinen die Namen der lebenden Spieler mit der gerade aufgerufenen Rolle. Bei **Werwölfe aufwecken** sieht er die lebenden Werwölfe.
- Beim Loslassen fährt das Panel wieder nach unten und verdeckt die Namen. Bei einer abgebrochenen Geste oder beim Wechsel in den Hintergrund werden die Namen ebenfalls verdeckt. Der aktuelle Nachtschritt und eine bereits getroffene Auswahl bleiben erhalten.

## Spiellogik und Übergabe an Claude Code

Der Einstieg ist `createWerewolf` mit Sitzreihenfolge, separatem Erzähler und Zufallsquelle. `currentWerewolfRole` liefert die aktuelle Rolle für die private Übergabe. `wakingPlayers` liefert Namen für den Erzähler. Nominierende Person, unterstützende Person und Ziel müssen verschieden und am Leben sein. Die Spielleitung erfasst die Zahl der Ja-Stimmen. Bei Angriff auf die Seherin wird sie erst am Morgen entfernt und kann in dieser Nacht noch prüfen. Die Partie liegt im Arbeitsspeicher.

## Optionale Sonderrollen

Der Erzähler kann vor dem Austeilen Leibwächter, Dorfmatratze, Hexe und Jäger hinzunehmen. Leibwächter und Dorfmatratze stehen als Alternativen zur Wahl. Jede ausgewählte Rolle ersetzt einen gewöhnlichen Dorfbewohner und gehört zur Dorfseite. Ohne Auswahl gilt die Grundbesetzung. Leibwächter, Hexe und Jäger orientieren sich an den Abschnitten Bodyguard, Witch und Hunter des oben verlinkten Regelhefts. Die Dorfmatratze folgt der vereinbarten Hausregel.

| Rolle | Ablauf |
| --- | --- |
| **Leibwächter** | Schützt jede Nacht eine andere lebende Person. Dieselbe Person ist in zwei aufeinanderfolgenden Nächten gesperrt. Der Schutz wehrt Wolfsangriff, Gift und Todeszauber auf das gewählte Ziel ab. Ein direkter Wolfsangriff auf den Leibwächter trifft ihn. |
| **Dorfmatratze** | Übernachtet jede Nacht bei einer anderen lebenden Person. Derselbe Gastgeber ist in zwei aufeinanderfolgenden Nächten gesperrt. Ein Wolfsangriff auf den Gastgeber trifft stattdessen die Dorfmatratze. Ein Wolfsangriff direkt auf sie geht während des Besuchs ins Leere. Gift und Todeszauber treffen weiterhin ihr gewähltes Ziel. Die Hexe und der Magier können die Dorfmatratze nach einem umgeleiteten Angriff heilen. |
| **Hexe** | Wird nach den Werwölfen und der Seherin aufgerufen, auch in der ersten Nacht. Der Heiltrank rettet einmal pro Partie das erst noch ausscheidende Wolfsopfer. Der Gifttrank trifft einmal pro Partie eine lebende Person. Beide Tränke sind in derselben Nacht möglich. Trifft das Gift auf den Leibwächter-Schutz, verbraucht es sich trotzdem. Die Hexe kann in ihrer letzten Nacht handeln, solange das Ausscheiden erst am Morgen verkündet wird. |
| **Jäger** | Wenn er am Morgen oder nach einer Abstimmung ausscheidet, darf er einmal auf eine noch lebende Person schießen oder den Schuss auslassen. Die Siegprüfung folgt erst danach. |

GameHub löst die Nacht in dieser Reihenfolge auf: **Leibwächter oder Dorfmatratze → Werwölfe → Seherin → Hexe → Morgen → gegebenenfalls Jäger**. Nicht besetzte oder bereits ausgeschiedene Nachtrollen werden übersprungen. In der ersten Nacht bleibt der Wolfsaufruf beim gegenseitigen Erkennen. Legt die Hexe bereits Gift fest, kann es am Morgen trotzdem ein Opfer geben. Findet derselbe Spieler durch Angriff und Gift den Tod, scheidet er einmal aus.

### Anbindung der Sonderrollen

- `createWerewolf` nimmt die gewählten Rollen als optionales viertes Argument entgegen. Die Werte heißen `bodyguard`, `nightGuest`, `witch` und `hunter`.
- Beim Schritt `bodyguard` erfasst `protect` das Schutzziel. Beim Schritt `nightGuest` erfasst `stayWith` den Gastgeber. `wakingPlayers` gibt der Spielleitung die jeweils aktive Rolle aus. Ein umgeleiteter Angriff liefert der Hexe und dem Magier die Dorfmatratze als `victim`. Die bisherige Modus-Einstellung im fünften Argument entfällt.
- `wakingPlayers` liefert im jeweiligen Erzählschritt die Namen, beim Jäger auch nach dessen Ausscheiden. `protect`, `potions` und `shot` übergeben die Auswahl an die Zustandsmaschine.
- In `morning` enthält `victim` das verbliebene Wolfsopfer und `poisoned` das Giftopfer. Beim Verkünden behandelt die Spiellogik doppelte Opfer als ein Ausscheiden.

## Prüfstand

Die Grundregeln und Sonderrollen sind durch gezielte Tests abgesichert. Die Prüfungen decken unter anderem den Schutz vor Gift, verbrauchte Tränke und den Jägerschuss vor der Siegprüfung ab.

## Zweite Gruppe der Sonderrollen

| Rolle | Regel |
| --- | --- |
| **Amor** | Wählt in der ersten Nacht zwei Liebende. Sie erkennen einander, behalten ihre Rollen und scheiden gemeinsam aus, wenn einer von ihnen stirbt. Für den Spielausgang zählen ihre ursprünglichen Seiten. Auch ein gemischtes Paar aus den letzten zwei Überlebenden führt bei 1:1 zum Wolfssieg. |
| **Dorftrottel (Idiot)** | Sobald über eine angeklagte Person abgestimmt wird, muss der Dorftrottel mit **Ja** stimmen. Gemeint ist die Ja/Nein-Abstimmung nach der Nominierung. |
| **Bürgermeister** | Geheime Rolle. Vor Spielbeginn wird für die Partie genau eine Variante gewählt, **Doppelte Stimme** oder **Hammer**. Bei der doppelten Stimme zählt der Erzähler seinen Stimmzettel verdeckt zweifach. Beim Hammer zählt nur ein Werwolf als Treffer und scheidet aus. Bei jedem anderen Ziel scheidet der Bürgermeister selbst aus; die angegriffene Person wird durch diesen Fehlhammer nicht getötet. Bestehende Liebespaar-Folgen bleiben wirksam. |
| **Alte Vettel (Spellcaster)** | Wählt nachts eine Person, die am folgenden Tag weder sprechen noch abstimmen darf. Dieselbe Person ist in zwei aufeinanderfolgenden Nächten gesperrt. Die Spielleitung kann **Selbstwahl erlauben**. Standardmäßig ist sie ausgeschaltet. |

In der Variante **Hammer** wird der Bürgermeister nachts verdeckt aufgerufen, auch wenn es tagsüber keine Abstimmung oder kein Ausscheiden gab. Solange er lebt und seinen Hammer besitzt, kann er ihn einsetzen oder für später aufheben. Nur der Erzähler erfährt, ob der Hammer eingesetzt wurde und wen der Bürgermeister gewählt hat. Am Morgen werden alle Ausgeschiedenen gemeinsam angekündigt. Die Todesursache und der Hammereinsatz bleiben bei beiden Einstellungen zur Rollenaufdeckung geheim. Rollen werden nach den allgemeinen Einstellungen aufgedeckt. Bei der Auflösung der Partie kann der Erzähler den Hammereinsatz bekannt geben.

Der Hammer ist ab Nacht zwei verfügbar und wird nach dem Magier, vor dem Spellcaster eingesetzt. Seine Todesfälle werden erst gemeinsam am Morgen aufgelöst. Leibwächterschutz fängt ihn nicht ab. Bei verbrauchtem Hammer bleibt ein Tarnaufruf, bei totem Bürgermeister nur mit geheimer Rollenaufdeckung. Der Erzähler bestätigt Tarnung ohne Aktion.

Amor handelt in der ersten Nacht vor den anderen Rollen. Die Alte Vettel handelt am Ende der Nacht. Eine stummgeschaltete Person kann weiterhin nominiert werden, übernimmt aber weder Nominierung noch Unterstützung und gibt keine Stimme ab. Das gilt auch für die Pflichtstimme des Dorftrottels und die doppelte Stimme des Bürgermeisters.

Die Tagesabstimmung ist freiwillig. Findet sie statt, braucht eine Nominierung eine unterstützende Person. Bei fehlender Mehrheit kann das Dorf weiterdiskutieren und erneut nominieren. Der Erzähler kann den Tag auch ohne Ausscheiden beenden.

### Anbindung für Claude Code

- Die zusätzlichen Rollen heißen `cupid`, `idiot`, `spellcaster` und `mayor`. Die optionale Konfiguration als fünftes Argument von `createWerewolf` setzt `mayor: "doubleVote" | "hammer"`, `allowSelfSilence` und `revealRoles`. Standardmäßig gelten doppelte Stimme, keine Selbstwahl und offene Rollen beim Ausscheiden.
- In `cupid` übermittelt `bond` genau zwei lebende Namen. Danach zeigt `wakingPlayers` die Liebenden, und `loversReady` beendet ihre Begegnung. Für die Siegprüfung zählt weiterhin die Rolle jeder lebenden Person.
- In `mayor` und `spellcaster` geben `hammer` beziehungsweise `silence` ein Ziel an. `target: null` überspringt die Aktion. Der Hammer steht anschließend weiterhin zur Verfügung.
- Beim Ereignis `vote` übermittelt die Spielleitung `yesVoters`, die Namen der Ja-Stimmenden. Die Logik ergänzt die Pflichtstimme des Dorftrottels und berechnet den doppelten Stimmwert des Bürgermeisters. Die einfache Ja-Anzahl bleibt verfügbar, wenn keine dieser beiden Sonderstimmen aktiv ist. Für eine Mehrheit zählt das gesamte zulässige Stimmgewicht.
- Für öffentliche Ansagen am Morgen und nach der Abstimmung `werewolfAnnouncement` verwenden. Die Funktion liefert Namen und bei offener Aufdeckung die Rollen. Der vollständige Zustand bleibt bei der Spielleitung und enthält private Daten.
- Nach einem Jägerschuss liefert `werewolfAnnouncement` auf dem zurückgegebenen Zustand auch dessen Opfer einschließlich eines mitsterbenden Liebespartners. Die Ansage bleibt bis zum nächsten gültigen Spielschritt verfügbar, auch wenn der Schuss die Partie beendet.

### Rollen beim Ausscheiden

Die Spielleitung wählt vor dem Start zwischen **Rollen aufdecken** und **Rollen geheim halten**. Die Gruppe erfährt in beiden Fällen, wer ausgeschieden ist. Bei offenem Spiel nennt der Erzähler die Rolle. Bei geheimem Spiel bleibt sie der Spielleitung vorbehalten und Ausgeschiedene verraten sie nicht. Rollenfähigkeiten wie der letzte Schuss des Jägers gelten in beiden Modi.

## Maximale Todesfolge einer Nacht einschließlich Morgenauflösung

Mit den aktuellen Rollen sind höchstens **acht verschiedene Personen** in einer Nacht samt morgendlicher Auflösung einschließlich Jägerschuss möglich:

| Ursache | Höchstens weitere Tote |
| --- | ---: |
| Aktueller Wolfsangriff, etwa auf den Jäger | 1 |
| Letzter Schuss dieses Jägers | 1 |
| Gifttrank der Hexe | 1 |
| Beide Todeszauber des Magiers | 2 |
| Fehlhammer: Bürgermeister und sein Liebespartner | 2 |
| Harter Bursche aus dem Wolfsangriff der vorherigen Nacht | 1 |
| **Gesamt** | **8** |

Voraussetzungen sind unterschiedliche Opfer, noch verfügbare Tränke/Zauber und keine wirksame Heilung oder Abwehr. Bürgermeister und Partner dürfen nicht zugleich als andere Opfer doppelt gezählt werden. Es gibt nur ein Liebespaar; dessen zusätzlicher Tod kann deshalb nicht bei jeder Todesquelle erneut hinzukommen. Der Hammer wird nach den übrigen Angriffen eingesetzt; die gemeinsame Nachtauflösung erhält alle bereits ausgeführten Aktionen und zählt jedes Opfer nur einmal.

Die Obergrenze folgt aus höchstens sechs direkten Tötungen (Wölfe, Jäger, Hexe, zweimal Magier, Hammer), einem zusätzlichen Liebespartner und einem verzögerten Tod des Harten Burschen. Leibwächter und Dorfmatratze erzeugen in unseren Varianten keinen weiteren unabhängigen Todesfall. Amulett, Trunkenbold, Seherin, Lehrling, Ermittler, Dorftrottel, Alte Vettel und Gerber fügen keine zusätzliche Tötung hinzu. Schutz kann die Zahl senken.

Ein gezielter Test in `advancedRoles.test.ts` spielt die Folge mit 18 Personen und vier Wölfen über drei Nächte vollständig durch: Nacht eins ohne Tote; Nacht zwei verwundet den Harten Burschen; Nacht drei enthält Fehlhammer samt Liebespartner, Wolfsangriff auf den Jäger, Gift und zwei Todeszauber. Am Morgen werden sieben Opfer gezählt, der Jäger erschießt ein achtes. Zehn Personen bleiben am Leben; das falsch gewählte Hammerziel lebt weiterhin. Der Test bestätigt auch, dass Hexe und Magier nur den Jäger als aktuelles Wolfsopfer erhalten.

Die acht enthalten den Jägerschuss nach der Morgenansage. Eine spätere Tagesabstimmung gehört nicht mehr zu dieser Nacht. Werden künftig neue Tötungsrollen oder Mehrfachbesetzungen eingeführt, muss die Obergrenze neu geprüft werden.

## Weitere optionale Rollen

| Rolle | Regel |
| --- | --- |
| **Harter Bursche** | Standard wolfOnly: Nur Wolfsangriffe verzögern den Tod bis zum Ende der Folgenacht; Heilung nur in der Angriffsnacht. Option anyAttack: Auch Hexengift, Todeszauber und Jägerschuss verzögern den Tod, mit normalem folgenden Tag. Bereits bestehende Verwundungen sind nicht heilbar und werden durch weitere Angriffe nicht verschoben. Hammer, Abstimmung und Liebeskummer bleiben sofort tödlich. |
| **Seher-Lehrling** | Solange die Seherin lebt, führt sie die Vision aus. Nach ihrem Ausscheiden übernimmt der lebende Lehrling beim nächsten Seheraufruf. Bei einem gewöhnlichen nächtlichen Angriff scheidet die Seherin erst morgens aus und bekommt vorher noch ihre Vision. Nach dem Tod der Seherin wird in den folgenden Nächten ausdrücklich Seher-Lehrling aufgerufen; ihr Tod darf daran erkennbar werden. |
| **Paranormaler Ermittler** | Kann einmal pro Partie nachts eine lebende Person wählen. Der Erzähler antwortet mit Ja oder Nein, ob die Person selbst oder einer ihrer zwei nächsten lebenden Sitznachbarn ein Wolf ist. Die App benutzt die Sitzreihenfolge als Kreis und überspringt ausgeschiedene Spieler. Aufschieben verbraucht die Fähigkeit nicht. |

### Anbindung für Claude Code

- Die Rollen für `createWerewolf` heißen `toughGuy`, `apprenticeSeer` und `paranormalInvestigator`. Jede ersetzt einen gewöhnlichen Dorfbewohner.
- Der Lehrling verwendet die bestehenden Schritte `seer` und `vision` sowie die bestehenden Ereignisse `inspect` und `closeVision`. `wakingPlayers` liefert jeweils die Person, die aktuell die Vision erhält. Ihre ursprüngliche Rollenkarte bleibt für die Aufdeckung erhalten.
- Der Ermittler wird nach der Vision der Seherin beziehungsweise ihres Lehrlings und vor der Hexe aufgerufen. Mit `investigate` und einem Spielernamen wechselt die Logik zu `investigation`. Das private Feld `isWolfNearby` enthält das Ergebnis, `closeInvestigation` bestätigt es. Mit `target: null` wartet der Ermittler auf eine spätere Nacht.
- Die öffentliche Morgenansage läuft über `werewolfAnnouncement`. Eine bloße Verwundung des Harten Burschen erscheint dort erst in der Folgenacht als Ausscheiden.

## Magier

- Der Magier ist ab elf Spielern plus Erzähler auswählbar. Pro Partie spielt entweder die Hexe oder der Magier. Ausnahme: Bei vierzehn bis sechzehn Spielern mit vier Werwölfen sowie bei siebzehn bis zwanzig Spielern mit vier oder fünf Werwölfen dürfen beide Rollen gemeinsam spielen. Der Magier gewinnt mit dem Dorf.
- Bei gemeinsamer Besetzung handelt zuerst die Hexe. Der Magier sieht anschließend das verbleibende Wolfsopfer. Eine bereits durch die Hexe geheilte Person steht nicht erneut als Heilziel zur Verfügung. Hexengift bleibt erhalten und wird am Morgen zusammen mit den Todeszaubern aufgelöst.
- Er hat zwei Zauber für die gesamte Partie. Er kann sie auf mehrere Nächte verteilen, beide in derselben Nacht einsetzen oder sie aufheben. Zwei Todeszauber in derselben Nacht brauchen zwei unterschiedliche Ziele.
- Der Erzähler zeigt ihm nach dem Wolfsangriff heimlich das tatsächliche Wolfsopfer, sofern es eines gibt. Bei einem umgeleiteten Angriff ist das die Dorfmatratze. Bei einem abgewehrten Angriff entfällt das Wolfsopfer. Der Heilzauber rettet das aktuelle Wolfsopfer, auch den Magier selbst oder einen frisch angegriffenen Harten Burschen.
- Der Todeszauber kann jede lebende Person treffen. Dazu gehören der Magier selbst und das Wolfsopfer. Heilung und Todeszauber auf dieselbe Person heben den Wolfsangriff auf, und die Person scheidet durch den Zauber aus. Mehrere Todesursachen führen nur zu einer Ansage. Der Leibwächter blockiert den Todeszauber gegen seine geschützte Person. Der eingesetzte Zauber ist trotzdem verbraucht.
- Ein Magier, der als Trunkenbold startet, setzt seine Zauber erst nach der Enthüllung ein.

### Anbindung für Claude Code

- Die Rolle heißt `magician`. Im Nachtschritt `magician` sind `victim` und `spellsRemaining` für die Spielleitung verfügbar. `wakingPlayers` liefert den Namen des Magiers.
- `castSpells` nimmt `heal: boolean` und `kill: readonly string[]` für die gesamte Auswahl der Nacht entgegen. `heal: false` und `kill: []` heben die Zauber für später auf. `werewolfAnnouncement` liefert die öffentliche Morgenansage.

## Gerber

Der Gerber hat keine Nachtaktion. Sein persönlicher Sieg wird zusätzlich zum Ergebnis der Partie erfasst. Die Spielleitung wählt vor dem Austeilen eine von zwei Siegbedingungen.

| Einstellung | Persönliche Siegbedingung |
| --- | --- |
| **Jedes Ausscheiden zählt** (Standard) | Der Gerber gewinnt, sobald er ausscheidet. Dazu zählen auch ein Wolfsangriff, ein Jägerschuss und der Tod aus Liebeskummer. |
| **Nur rausgewählt** | Der Gerber gewinnt, wenn er selbst durch die Tagesabstimmung ausscheidet. Wird sein Liebespartner rausgewählt und scheidet der Gerber deshalb ebenfalls aus, gewinnt er persönlich nicht. |

Nach dem persönlichen Sieg läuft die Partie bis zum Sieg des Dorfs oder der Werwölfe weiter. Startet der Gerber als Trunkenbold, beeinflusst das seine sichtbare Rollenansage. Die persönliche Siegbedingung gilt bereits vor der Enthüllung.

### Anbindung für Claude Code

- Die Rollenkarte heißt `tanner`. Die Einstellung in `createWerewolf` heißt `tanner: "anyDeath" | "voteOnly"` und verwendet standardmäßig `"anyDeath"`.
- Im Ergebnis enthält `winner` weiterhin die siegreiche Partei. `tannerWinner` enthält zusätzlich den Namen des Gerbers, sofern seine persönliche Siegbedingung erfüllt ist. Während der Partie zeigt `werewolfAnnouncement` den Namen und die sichtbare Rolle nach den allgemeinen Aufdeckungsregeln.

## Trunkenbold

- Die Spielleitung kann **Trunkenbold** ab zwei Werwölfen aktivieren, also ab neun Spielern. Nach dem Austeilen lost die App aus, wer als Trunkenbold startet. Alle besetzten Rollen außer Amor kommen dafür infrage. Die Anzahl der Rollenplätze und Werwölfe bleibt gleich.
- Beim Austeilen sieht die Person **Trunkenbold**. Zu Beginn der dritten Nacht zeigt der Erzähler ihr heimlich die wahre Rolle, bevor die Nachtaktionen beginnen. Rollenfähigkeiten ruhen bis dahin. Für die Siegprüfung und die Ergebnisse von Seherin und Ermittler gilt von Anfang an die wahre Rolle.
- Ein verdeckter Wolf wacht erst ab der Enthüllung mit den übrigen Wölfen auf. Kann vor der Enthüllung kein lebender Wolf aufwachen, fällt der Wolfsangriff aus. Die übrigen Nachtschritte laufen weiter.
- Scheidet die Person vor der Enthüllung aus, lautet die öffentliche Ansage bei offener Rollenaufdeckung **Trunkenbold**. Bei verdeckter Rollenaufdeckung wird der Name genannt. Ein verdeckter Jäger erfährt vor seinem letzten Schuss heimlich seine wahre Rolle und darf wie gewohnt schießen oder darauf verzichten. Das Ziel eines Schusses wird sofort angesagt. Die Siegprüfung folgt danach.

### Anbindung für Claude Code

- `createWerewolf` erhält `drunk: true` als Einstellung. `currentWerewolfRole` und `werewolfAnnouncement` liefern vor der Enthüllung den sichtbaren Rollenwert `drunk`.
- Die Spielleitung erhält die privaten Enthüllungsschritte `drunkReveal` zu Beginn der dritten Nacht und `drunkHunter` beim vorzeitigen Ausscheiden eines verdeckten Jägers. `werewolfDrunkReveal` liefert in beiden Schritten den Namen und die wahre Rolle. Mit `drunkReady` geht es zu den Nachtaktionen oder zum bestehenden Jägerschritt weiter.

## Schutzamulett

- Das Amulett ist ein zusätzlicher Gegenstand und belegt keinen Rollenplatz. Wenn die Spielleitung es aktiviert, lost die App den ersten Träger unter allen Spielern aus, deren tatsächliche Rolle kein Werwolf ist. Der Erzähler informiert ihn zu Beginn der ersten Nacht heimlich.
- Das Amulett fängt ausschließlich nächtlichen Wolfsangriff, Hexengift und Magiertodeszauber ab. Es verhindert weder Hammer noch Tagesabstimmung noch Jägerschuss. Abgewehrte Tränke und Zauber gelten als verbraucht. Ein Gerber gewinnt nur durch tatsächliches Ausscheiden.
- Das Amulett wird vor der Abwehr des Leibwächters und vor der Umleitung durch die Dorfmatratze geprüft. Das Amulett kann den Gastgeber oder die Dorfmatratze vor einem umgeleiteten Angriff schützen. Ein direkter Angriff auf die abwesende Dorfmatratze geht ins Leere und löst ihr Amulett nicht aus. Hexe und Magier sehen nach einem abgefangenen Wolfsangriff kein Wolfsopfer.
- Stirbt der Liebespartner, stirbt der Träger durch Liebeskummer mit. Liebeskummer erzeugt keine Weitergabepflicht, auch nicht nachts. Der Träger darf das Amulett behalten oder freiwillig weitergeben. Stirbt er mit dem Amulett, verschwindet es. Hammer, Abstimmung, Jägerschuss und bereits ausgelöste Verwundungen werden ebenfalls nicht durch das Amulett verhindert.
- Als letzter Nachtschritt vor der Morgenauflösung entscheidet der Träger über Behalten oder Weitergabe. Nur ein tatsächlich abgewehrter nächtlicher Wolfsangriff, Gift oder Todeszauber verpflichtet ihn zur Abgabe an eine andere lebende Person. Liebeskummer und Jägerschuss lösen keine Pflicht aus. Der Schutz gilt im Angriffszeitpunkt und niemals rückwirkend.

### Anbindung für Claude Code

- Das fünfte Argument von `createWerewolf` aktiviert den Gegenstand mit `amulet: true`. `amuletIntro` ist die private Startbenachrichtigung, die mit `amuletReady` bestätigt wird. `amuletPass` ist der letzte Nachtschritt vor der Morgenauflösung, solange ein Träger vorhanden ist. `wakingPlayers` liefert in beiden Schritten den aktuellen Träger.
- `passAmulet` nimmt einen Namen aus den lebenden Spielern entgegen. `amulet.mustPass` zeigt der Spielleitung, ob die Selbstwahl gesperrt ist. Beide Felder sind privat. Eine erfolgreiche Abstimmung wird trotz Amulett normal aufgelöst und mit werewolfAnnouncement bekannt gegeben. exile ist keine verdeckte Amulett-Abwehr mehr.

## Geplante Konfiguration der Startaufstellung

**Verbindlicher Umfang:** Ziel sind 6 bis 20 Mitspielende ohne Erzähler. Zusätzliche Plätze werden mit gewöhnlichen Dorfbewohnern gefüllt; es werden dafür keine neuen Rollen eingeführt. Leibwächter und Dorfmatratze bleiben für jede Gruppengröße gegenseitig ausgeschlossen. Der gesamte Zielbereich von 6 bis 20 Spielern ist freigegeben; 19 und 20 wurden per genehmigter Stichprobe geprüft. Die technische Freigabe wird nur nach Abschluss der jeweiligen Prüfung erweitert.

Die folgenden Grenzen gelten für die geplante frei wählbare Startaufstellung. Der Spielerzähler umfasst die Personen mit Rolle. Der Erzähler kommt zusätzlich dazu. Die ursprüngliche Grundbesetzung für 6 bis 15 orientiert sich an [Ultimate Werewolf, S. 1](https://board-game-rules.com/wp-content/uploads/2025/01/ultimate-werewolf-ultimate-edition_Official-Rules.pdf#page=1). Die Freigabegrenzen für optionale Rollen sind GameHub-Vorgaben für die erste Umsetzung. Das Original bietet anpassbare Beispielaufstellungen. Es nennt etwa den Jäger bei zehn und die Hexe bei elf Spielern. [Ultimate Werewolf, S. 11–12](https://board-game-rules.com/wp-content/uploads/2025/01/ultimate-werewolf-ultimate-edition_Official-Rules.pdf#page=11)

### Feste Rollen und Füllrolle

| Spieler | Werwölfe | Prüfung der Startaufstellung |
| --- | ---: | --- |
| 6 | 1 | Festgelegt |
| 7 | 1 oder 2, Standard 1 | Zusatzoption bestätigt |
| 8 | 2, mindestens 1, höchstens 2 | Nachprüfung übernommen |
| 9 | Alte Vettel (Spellcaster), Bürgermeister: doppelte Stimme, Trunkenbold | Verbindlich genau zwei Wölfe, unabhängig von Sonderrollen und Zusätzen. Keine rollenabhängige Änderung. Trunkenbold kommt als Zusatz ohne weiteren Rollenplatz hinzu. | 2 | **2** |
| 10 | Paranormaler Ermittler, Schutzamulett | Verbindlich genau zwei Wölfe, unabhängig von Sonderrollen und Zusätzen. Keine rollenabhängige Änderung. Bürgermeister mit doppelter Stimme oder Hammer, niemals beides. | 2 | **2** |
| 11 | 2 oder 3, Standard 2 | Zusatzoption bestätigt; Hexe und Magier bleiben Alternativen |
| 12 | 3 | Gezielte Vergleiche abgeschlossen |
| 13 | 3 | Festgelegt |
| 14 | 3, optional 4 | Festgelegt |
| 15 | 3, optional 4 | Festgelegt |
| 16 | 4, optional 3 | Festgelegt |
| 17 | 4, optional 3 oder 5 | Festgelegt |
| 18 | 4, mindestens 3, höchstens 5 | Festgelegt |
| 19 | 4, mindestens 3, höchstens 5 | Stichproben geprüft |
| 20 | 4, mindestens 3, höchstens 5 | Stichproben geprüft |

- **Werwölfe** sind Pflicht. Die App legt ihre Zahl anhand der Gruppengröße fest.
- **Seherin** ist Pflicht. Jede Partie enthält genau eine Seherin.
- **Gewöhnliche Dorfbewohner** füllen alle verbleibenden Plätze. Die Aufstellung darf null gewöhnliche Dorfbewohner enthalten. Das Regelheft empfiehlt gewöhnliche Dorfbewohner für die Balance, besonders bei offener Rollenaufdeckung. [Ultimate Werewolf, S. 13–14](https://board-game-rules.com/wp-content/uploads/2025/01/ultimate-werewolf-ultimate-edition_Official-Rules.pdf#page=13)

Die Anzahl der Füllrollen lautet Spielerzahl minus Wolfszahl minus eins für die Seherin minus Anzahl gewählter Sonderrollen. Eine Aufstellung ist startbereit, sobald dieser Wert mindestens null ist und alle Rollenbedingungen erfüllt sind.

### Kompaktübersicht für 6–20 Spieler

Eine Seherin ist immer Pflicht. Die Zeilen bauen aufeinander auf: Bereits freigegebene Rollen und Zusätze bleiben verfügbar. Alle weiteren Rollen sind optional; gewöhnliche Dorfbewohner füllen freie Plätze. Nachprüfungen übernommen: 7 Spieler mit 1–2 Wölfen (Standard 1), 8 mit 1–2 (Standard 2), 9 und 10 immer mit genau 2, 11 mit 2–3 (Standard 2).

| Spieler | Neue Rollen / Zusätze | Umstellung gegenüber der vorherigen Zeile | Erlaubte Wölfe | Allgemeine Empfehlung |
| ---: | --- | --- | --- | ---: |
| 6 | Hexe, Jäger, Dorftrottel, Leibwächter, Dorfmatratze | Grundauswahl. Leibwächter oder Dorfmatratze; eine Seherin und ein Wolf sind fest. | 1 | **1** |
| 7 | Amor, Harter Bursche | Ein oder zwei Wölfe erlaubt; allgemeiner Standard bleibt einer. Zwei sind für starke Dorfbesetzungen vorgesehen. Höchstens fünf optionale Rollen mit einem Wolf, vier mit zwei Wölfen. Trunkenbold weiterhin erst ab neun Spielern. | 1 / 2 | **1** |
| 8 | Gerber, Seher-Lehrling | Ein oder zwei Wölfe bleiben erlaubt. Zwei werden allgemeiner Standard; einer bleibt für schwächere Dorfbesetzungen. Höchstens fünf optionale Rollen mit zwei Wölfen. Trunkenbold bleibt erst ab neun Spielern verfügbar. | 1 / 2 | **2** |
| 9 | Alte Vettel (Spellcaster), Bürgermeister: doppelte Stimme, Trunkenbold | Verbindlich genau zwei Wölfe, unabhängig von Sonderrollen und Zusätzen. Keine rollenabhängige Änderung. Trunkenbold kommt als Zusatz ohne weiteren Rollenplatz hinzu. | 2 | **2** |
| 10 | Paranormaler Ermittler, Schutzamulett | Verbindlich genau zwei Wölfe, unabhängig von Sonderrollen und Zusätzen. Keine rollenabhängige Änderung. Bürgermeister mit doppelter Stimme oder Hammer, niemals beides. | 2 | **2** |
| 11 | Magier | Zwei oder drei Wölfe erlaubt; allgemeiner Standard bleibt zwei. Drei sind für starke Dorfbesetzungen, insbesondere mit Magier, vorgesehen. Hexe und Magier bleiben Alternativen. Höchstens acht optionale Rollen mit zwei Wölfen, sieben mit drei. | 2 / 3 | **2** |
| 12 | — | Zwei oder drei Wölfe bleiben erlaubt; drei werden allgemeiner Standard. Hexe und Magier bleiben Alternativen. | 2 / 3 | **3** |
| 13 | — | Nur drei Wölfe erlaubt; zwei entfallen. Hexe und Magier bleiben Alternativen. | 3 | **3** |
| 14 | — | Vier Wölfe kommen hinzu. Bei vier Wölfen dürfen Hexe und Magier gemeinsam spielen; bei drei bleiben sie Alternativen. | 3 / 4 | **3** |
| 15 | — | Keine Umstellung: gemeinsame Heiler nur bei vier Wölfen. | 3 / 4 | **3** |
| 16 | — | Vier Wölfe werden allgemeiner Standard. Gemeinsame Heiler weiterhin nur bei vier Wölfen. | 3 / 4 | **4** |
| 17 | — | Fünf Wölfe kommen hinzu. Hexe und Magier gemeinsam bei vier oder fünf; bei drei bleiben sie Alternativen. | 3 / 4 / 5 | **4** |
| 18 | — | Keine Umstellung. Gemeinsame Heiler bei vier oder fünf Wölfen; sechs Wölfe ausgeschlossen. | 3 / 4 / 5 | **4** |
| 19 | — | Keine Umstellung; durch Stichproben bestätigt. | 3 / 4 / 5 | **4** |
| 20 | — | Keine Umstellung; durch Stichproben bestätigt. Obergrenze: 20 Spieler plus Erzähler. | 3 / 4 / 5 | **4** |

Leibwächter und Dorfmatratze sind immer Alternativen. Beim Bürgermeister gilt entweder doppelte Stimme oder Hammer. Trunkenbold und Schutzamulett belegen keinen zusätzlichen Rollenplatz; beide sind standardmäßig aus. Alle Auswahlen müssen in die freien Spielerplätze passen.

Die erlaubten Wolfszahlen sind die Grenzen für die spätere automatische Festlegung durch das System. Die allgemeine Empfehlung ist der Ausgangswert; die konkrete Rollenbesetzung kann einen anderen erlaubten Wert erfordern. Die Validierung dieser Automatik ist noch offen.

### Festgelegte Aufstellung für sechs Spieler

- Fest besetzt sind **ein Werwolf und eine Seherin**.
- Optional sind **Dorftrottel**, **Hexe**, **Jäger** und entweder **Leibwächter** oder **Dorfmatratze**. Jede Sonderrolle belegt einen Platz. Mit allen vier Sonderrollen sind alle sechs Plätze besetzt.
- Für sechs Spieler sind keine Gegenstände oder Masken vorgesehen. In der Einzelsimulation mit Hinweisen erreichte die Partie mit Schutzamulett im Mittel Nacht 3,94 gegenüber Nacht 3,22 in der Grundbesetzung. Die Wolfsquote lag bei 66,27 gegenüber 65,62 Prozent.

### Festgelegte Aufstellung für sieben Spieler

- Erlaubt sind **ein oder zwei Werwölfe**. **Ein Wolf bleibt der allgemeine Standard**; zwei sind für stärkere Dorfbesetzungen verfügbar. Eine Seherin bleibt Pflicht.
- Aus **Dorftrottel, Hexe, Jäger, Leibwächter oder Dorfmatratze, Amor und Hartem Burschen** dürfen bis zu fünf Sonderrollen gewählt werden. Leibwächter und Dorfmatratze schließen sich aus.
- Mit einem Wolf stehen fünf optionale Rollenplätze zur Verfügung, mit zwei Wölfen vier. Fünf gewählte Sonderrollen belegen mit einem Wolf alle freien Plätze. Gewöhnliche Dorfbewohner füllen die übrigen Plätze bei einer kleineren Auswahl. Für sieben Spieler sind keine Gegenstände oder Masken vorgesehen.

### Festgelegte Aufstellung für acht Spieler

- Erlaubt sind **ein oder zwei Werwölfe**; **zwei sind der allgemeine Standard**. Eine Seherin bleibt Pflicht. Ein Wolf bleibt für schwächere Dorfbesetzungen verfügbar.
- Mit einem Wolf sind bis zu sechs, mit zwei Wölfen bis zu fünf Sonderrollen möglich. Zur Auswahl stehen **Hexe, Jäger, Dorftrottel, Leibwächter oder Dorfmatratze, Amor, Harter Bursche, Gerber und Seher-Lehrling**.
- Pro Partie ist höchstens eine der beiden Rollen Leibwächter und Dorfmatratze wählbar. Beim Gerber stehen beide Siegbedingungen zur Wahl. Gewöhnliche Dorfbewohner füllen freie Plätze.

### Festgelegte Aufstellung für neun Spieler

**Verbindlich: immer genau zwei Werwölfe**, unabhängig von Sonderrollen, Zusätzen und sonstigen Einstellungen. Die automatische Festlegung darf diese Zahl nicht verändern. Ein oder drei Wölfe sind keine freigegebenen Varianten; die Forschungsdurchläufe begründen keine Ausnahme.

- Fest besetzt sind **zwei Werwölfe und eine Seherin**.
- Bis zu sechs Sonderrollen sind möglich. Zur Auswahl stehen **Hexe, Jäger, Dorftrottel, Leibwächter oder Dorfmatratze, Amor, Harter Bursche, Gerber, Seher-Lehrling, Alte Vettel und Bürgermeister mit doppelter Stimme**.
- Beim Gerber stehen beide Siegbedingungen zur Wahl. Bei der Alten Vettel ist Selbstwahl einstellbar und standardmäßig aus. Gewöhnliche Dorfbewohner füllen freie Plätze. **Trunkenbold** kann zusätzlich aktiviert werden.
- Der Magier wurde als mögliche Alternative zur Hexe separat erprobt. Seine Freigabe ab neun Spielern bleibt offen.

### Festgelegte Aufstellung für zehn Spieler

**Verbindlich: immer genau zwei Werwölfe**, unabhängig von Sonderrollen, Zusätzen und sonstigen Einstellungen. Die automatische Festlegung darf diese Zahl nicht verändern. Ein oder drei Wölfe sind keine freigegebenen Varianten; die Forschungsdurchläufe begründen keine Ausnahme.

- Fest besetzt sind **zwei Werwölfe und eine Seherin**. Bis zu sieben Sonderrollen können gewählt werden.
- Zusätzlich zur Neuner-Auswahl steht der **Paranormale Ermittler** zur Wahl. Er belegt einen freien Rollenplatz.
- Der **Bürgermeister** kann mit **doppelter Stimme** oder **Hammer** spielen. Pro Partie wird genau eine Variante gewählt.
- **Schutzamulett** und **Trunkenbold** lassen sich zusätzlich aktivieren. Beide belegen keinen Rollenplatz.

Die vollständige Kombinationsprüfung für zehn Spieler ist abgeschlossen. Die weiteren Gruppengrößen werden in aufsteigender Reihenfolge geprüft. Für jede Größe vergleichen wir zuerst die Grundbesetzung, dann einzelne Sonderrollen und Gegenstände und anschließend die naheliegenden Kombinationen. Die Freigabegrenzen für zehn bis fünfzehn Spieler sind Vorschläge, bis die jeweilige Auswahl der Sonderrollen festgelegt ist.

### Bestätigte Option für elf Spieler

- Erlaubt sind **zwei oder drei Werwölfe**. **Zwei bleiben der allgemeine Standard**; drei sind für starke Dorfbesetzungen, insbesondere mit Magier, verfügbar. Eine Seherin bleibt Pflicht. Mit zwei Wölfen passen höchstens acht optionale Rollen, mit drei höchstens sieben.
- Der **Magier** kommt als Alternative zur **Hexe** hinzu. Pro Partie kann höchstens eine der beiden Rollen gewählt werden.

### Festgelegte Aufstellung für dreizehn Spieler

- Fest besetzt sind **drei Werwölfe und eine Seherin**. Bis zu neun Sonderrollen können gewählt werden.
- Zur Auswahl stehen **Hexe oder Magier, Jäger, Dorftrottel, Leibwächter oder Dorfmatratze, Amor, Harter Bursche, Gerber, Seher-Lehrling, Alte Vettel, Bürgermeister und Paranormaler Ermittler**.
- Hexe und Magier schließen sich aus, ebenso Leibwächter und Dorfmatratze. Für den Bürgermeister gilt pro Partie genau eine Variante. Die gewählten Einstellungen von Gerber und Alter Vettel werden berücksichtigt.
- Schutzamulett und Trunkenbold sind zusätzlich wählbar und belegen keinen Rollenplatz. Gewöhnliche Dorfbewohner füllen freie Rollenplätze.

### Festgelegte Aufstellung für vierzehn Spieler

- Standard sind **drei Werwölfe und eine Seherin**. Optional können **vier Werwölfe** gewählt werden.
- Zur Auswahl stehen dieselben Sonderrollen wie bei dreizehn Spielern. Bei drei Wölfen sind bis zu zehn Sonderrollen möglich; bei vier Wölfen bis zu neun.
- Bei drei Wölfen bleiben **Hexe und Magier Alternativen**. Bei vier Wölfen dürfen beide gemeinsam gewählt werden. Leibwächter und Dorfmatratze schließen sich weiterhin aus.
- Für Bürgermeister, Gerber und Alte Vettel gelten die bestehenden Varianten. Schutzamulett und Trunkenbold sind zusätzlich wählbar. Gewöhnliche Dorfbewohner füllen freie Plätze.
- Die vollständige Kombinationsprüfung ist abgeschlossen. Einzelheiten und Grenzen der Simulation stehen im Vierzehner-Prüfbericht weiter unten.

### Festgelegte Aufstellung für fünfzehn Spieler

- Standard sind **drei Werwölfe und eine Seherin**. Optional können **vier Werwölfe** gewählt werden. Mehr als vier Wölfe sind ausgeschlossen, auch bei automatischer Empfehlung oder zufälliger Rollenwahl.
- Alle bisher freigegebenen Sonderrollen stehen zur Verfügung. Drei Wölfe lassen bis zu elf Sonderrollen zu, vier Wölfe bis zu zehn. Freie Plätze werden mit gewöhnlichen Dorfbewohnern gefüllt.
- Bei drei Wölfen bleiben **Hexe und Magier Alternativen**. Bei vier Wölfen dürfen beide gemeinsam gewählt werden. Leibwächter und Dorfmatratze schließen sich weiterhin aus.
- Bürgermeister mit doppelter Stimme oder Hammer, beide Gerber-Ziele, die Selbstwahl-Einstellung der Alten Vettel sowie Schutzamulett und Trunkenbold bleiben verfügbar.
- Die spätere Oberfläche passt Verfügbarkeit und Rollenplätze sofort an die gewählte Wolfszahl an. Die Punkteempfehlung bezieht die tatsächliche Rollenauswahl ein; ihre Fünfzehner-Kalibrierung bleibt ausdrücklich vorläufig.

### Festgelegte Aufstellung für sechzehn Spieler

- Die Business-Schicht unterstützt **16 Mitspielende plus einen Erzähler**. Vier Wölfe sind der allgemeine Standard; drei stehen als Alternative zur Wahl. Die Obergrenze von vier gilt auch für Empfehlungen und Zufallsaufstellungen.
- Eine Seherin bleibt Pflicht. Alle bisher freigegebenen optionalen Rollen und Gegenstände stehen zur Verfügung.
- Bei drei Wölfen bleiben Hexe und Magier Alternativen. Es gibt zwölf freie Rollenplätze, von denen wegen der gegenseitigen Ausschlüsse höchstens elf mit verschiedenen Sonderrollen besetzt werden können. Mindestens ein gewöhnlicher Dorfbewohner bleibt daher als Füllrolle.
- Bei vier Wölfen dürfen Hexe und Magier gemeinsam spielen. Elf Sonderrollenplätze sind verfügbar; eine Besetzung ohne gewöhnliche Dorfbewohner ist möglich. Leibwächter und Dorfmatratze bleiben Alternativen.
- Bürgermeister, Gerber, Alte Vettel, Trunkenbold und Schutzamulett behalten ihre bestehenden Varianten. Die spätere UI aktualisiert verfügbare Rollen und freie Plätze beim Wechsel der Wolfszahl automatisch.
- Das Regelheft nennt das Szenario „Classic Werewolf Village (16)“ mit drei Wölfen und einer weiteren Helferrolle. Die hier geprüften frei wählbaren Besetzungen sind GameHub-Konfigurationen, keine unveränderte Übernahme dieses Szenarios. [Originalszenario, Seite 12](https://board-game-rules.com/wp-content/uploads/2025/01/ultimate-werewolf-ultimate-edition_Official-Rules.pdf#page=12)

### Festgelegte Aufstellung für siebzehn Spieler

- Die Business-Schicht unterstützt 17 Mitspielende plus Erzähler. Die Wolfszahl wird für diese Gruppengröße unabhängig von den bisherigen Grenzen geprüft. Vier Wölfe sind der Standard; drei und fünf bleiben vollständig geprüfte Zusatzoptionen.
- Die Seherin bleibt Pflicht. Alle bisherigen optionalen Rollen und Gegenstände bleiben verfügbar. Bei drei Wölfen sind Hexe und Magier Alternativen; bei vier und fünf dürfen beide gemeinsam gewählt werden. Leibwächter und Dorfmatratze schließen sich weiterhin aus.
- Drei Wölfe lassen dreizehn Rollenplätze frei, von denen wegen der gegenseitigen Ausschlüsse höchstens elf mit verschiedenen Sonderrollen besetzt werden können. Mindestens zwei gewöhnliche Dorfbewohner bleiben.
- Bei vier Wölfen stehen zwölf Sonderrollenplätze zur Verfügung, bei fünf elf. In beiden Fällen sind Aufstellungen ohne gewöhnliche Dorfbewohner möglich.
- Die Ablehnung von fünf Wölfen für 15 Spieler wird nicht als allgemeine Grenze übernommen. Die Sechzehner-Prüfung enthielt wegen der damaligen Auslegung nur drei und vier Wölfe; diese Aufstellung bleibt in diesem Schritt unverändert. Für jede weitere Gruppengröße wird die Wolfszahl erneut geprüft.
- In der späteren UI passen sich Wolfszahlen, Rollenplätze und zulässige Kombinationen an die Spielerzahl an. Für die automatische Festlegung bei 17 sind drei, vier und fünf Wölfe geprüft. Der bisherige Forschungsmodus kann zusätzliche Kandidaten betrachten; daraus entsteht keine Freigabe für den normalen automatischen Spieleinstieg.

### Festgelegte Aufstellung für achtzehn Spieler

- Alle bisherigen Sonderrollen bleiben verfügbar. Leibwächter und Dorfmatratze sind weiterhin Alternativen; ihre gemeinsame Nutzung wird nicht umgesetzt.
- Eine Seherin ist Pflicht. Die Vorauswahl eins bis acht und der ausführliche Vergleich mit drei bis sechs Wölfen sind abgeschlossen. **Vier sind Standard, drei das Minimum und fünf das Maximum.** Sechs Wölfe werden bei 18 nicht freigegeben.
- Gewöhnliche Dorfbewohner füllen alle übrigen Plätze. Mit vier Wölfen, Seherin und sämtlichen zwölf miteinander vereinbaren Sonderrollen bleibt mindestens ein gewöhnlicher Dorfbewohner. Mit fünf Wölfen sind bei maximaler Sonderrollenbesetzung null gewöhnliche Dorfbewohner möglich.
- Die Grenzen drei bis fünf gelten verbindlich für die automatische Festlegung, Zufallsaufstellung und alle normalen Spieleinstiege. Hexe und Magier sind bei drei Wölfen Alternativen und bei vier oder fünf gemeinsam wählbar. Die spätere UI zeigt nur die verbindlich automatisch festgelegte Wolfszahl an.
- 19 und 20 sind nach den unten dokumentierten Stichprobenprüfungen freigegeben. Über 20 Personen mit Rolle werden abgewiesen.

### Optionale Rollenkarten

Jede dieser Karten kann einmal gewählt werden und belegt genau einen Platz. In der Grundbesetzung sind sie ausgeschaltet.

| Rollenkarte | Ab Spielern | Weitere Bedingung oder Einstellung |
| --- | ---: | --- |
| **Dorftrottel** | 6 | Pflichtstimme bei einer Tagesabstimmung. |
| **Hexe** | 6 | Alternative zum Magier. Gemeinsam bei 14 bis 16 Spielern und 4 Wölfen sowie bei 17 bis 20 Spielern mit 4 oder 5 Wölfen. |
| **Jäger** | 6 | Letzter Schuss nach dem eigenen Ausscheiden. |
| **Leibwächter** | 6 | Nächtliche Abwehr. Besetzt denselben Platz wie die Dorfmatratze. |
| **Dorfmatratze** | 6 | Nächtlicher Besuch. Besetzt denselben Platz wie der Leibwächter. |
| **Gerber** | 8 | Jedes Ausscheiden zählt oder nur rausgewählt. Jedes Ausscheiden ist Standard. |
| **Amor** | 7 | Eine Paarung in der ersten Nacht. |
| **Harter Bursche** | 7 | Eine frische Wunde durch Wölfe löst den verzögerten Tod aus. |
| **Alte Vettel** | 9 | Selbstwahl einstellbar. Standardmäßig ausgeschaltet. |
| **Bürgermeister** | 9 | Doppelte Stimme ab 9 Spielern. Hammer ab 10 Spielern. Pro Partie gilt genau eine Variante. Doppelte Stimme ist Standard. |
| **Paranormaler Ermittler** | 10 | Einmalige Untersuchung anhand der Sitzreihenfolge. Die Seherin gehört weiterhin zur Pflichtbesetzung. |
| **Seher-Lehrling** | 8 | Setzt die Seherin voraus, die bereits zur Pflichtbesetzung gehört. |
| **Magier** | 11 | Alternative zur Hexe. Gemeinsam bei 14 bis 16 Spielern und 4 Wölfen sowie bei 17 bis 20 Spielern mit 4 oder 5 Wölfen. |

Zwei Werwölfe, eine Seherin, eine Hexe, Amor, ein Jäger und vier gewöhnliche Dorfbewohner bilden beispielsweise eine vollständige Aufstellung für zehn Spieler. Die übrigen freigegebenen Karten können ebenfalls kombiniert werden, solange genügend Rollenplätze frei sind.

### Trunkenbold und Schutzamulett

| Auswahl | Verfügbar wenn | Vergabe |
| --- | --- | --- |
| **Trunkenbold** | Mindestens neun Spieler teilnehmen und mindestens zwei Werwölfe mitspielen. | Genau eine Person wird Trunkenbold. Alle tatsächlich besetzten Rollen außer Amor sind für die Auslosung zugelassen. |
| **Schutzamulett** | Mindestens zehn Spieler teilnehmen. | Genau ein Amulett. Die Startvergabe schließt tatsächliche Werwölfe aus. Bei der späteren Weitergabe darf jede lebende Person gewählt werden. |

Trunkenbold und Schutzamulett sind standardmäßig ausgeschaltet und belegen keine Rollenplätze. Wer als Trunkenbold startet, kann zugleich das Schutzamulett erhalten, sofern es seine tatsächliche Rolle zulässt. **Rollen aufdecken** bleibt die Standardoption und gilt unabhängig von der Besetzung.

Ändert sich die Spielerzahl, wird die gesamte Auswahl erneut geprüft. Unzulässige Rollen, Varianten und überzählige Karten werden als Grund angezeigt, warum die Partie noch nicht starten kann. Die bestehenden Empfehlungen für Folgepartien sind mit diesen Grenzen vereinbar.

## Punktebewertung der Startaufstellung

### Verbindliche automatische Festlegung in der späteren UI

**Aktuelle Entscheidung:** Das System bestimmt die Wolfszahl verbindlich. Die spätere UI zeigt sie nur an; es gibt weder eine manuelle Wolfszahlauswahl noch eine Schaltfläche zum Übernehmen einer Empfehlung. Diese Vorgabe ersetzt die frühere Planung eines unverbindlichen Hinweises.

- Eingaben sind Spielerzahl, gewählte Rollen und relevante Einstellungen, etwa Bürgermeister-Variante, Amulett und Trunkenbold. Der insgesamt beste Standard je Spielerzahl bleibt ein Referenz- und Ausgangswert; die konkrete Wolfszahl wird für die tatsächliche Aufstellung bestimmt.
- Die Entscheidung verwendet ausschließlich die für diese Spielerzahl geprüften zulässigen Wolfszahlen. Die explorativen Kandidaten eines Forschungs- oder Punktvergleichs sind keine zusätzliche Freigabe für die normale Partie. Bei 18 bleiben beispielsweise nur drei, vier oder fünf zulässig.
- Nach Änderungen in der Einrichtung werden Wolfszahl, Rollenplätze und zulässige Kombinationen neu ermittelt. Gewählte Rollen werden nicht stillschweigend entfernt. Gibt es keine zulässige Aufstellung, wird der Grund erklärt und der Start bis zur Korrektur gesperrt.
- Die Rollenverfügbarkeit wird auch für die hypothetische Auswahl geprüft: Ein zusätzlicher Magier neben der Hexe darf nicht allein deshalb gesperrt bleiben, weil bisher drei Wölfe berechnet wurden, wenn eine geprüfte Aufstellung mit vier oder fünf möglich ist.
- Beim Zufallsmodus werden eine kompatible Rollenziehung und die dazu passende Wolfszahl gemeinsam bestimmt. Geheime Rollen und genaue Punktaufschlüsselungen werden den Mitspielern nicht als Begründung offengelegt. Nach Beginn der Rollenverteilung bleibt die Startaufstellung fest.
- Der normale Spieleinstieg ermittelt den Wert selbst und übernimmt keinen manuell vorgegebenen Wolfswert aus der UI. Explizite Wolfszahlen dürfen für interne Vergleichstests und gespeicherte Ergebnisse erhalten bleiben. Die automatische Zuteilung wurde in der Business-Schicht gegen archivierte Balancefälle geprüft (`We-03-50`, abgeschlossen).
- Die bisherigen Punkte für 15 bis 18 sind vorläufig. Sie werden nicht allein durch Umbenennung einer Empfehlung zu einer nachgewiesen ausgewogenen Pflichtentscheidung. Die Validierung prüft insbesondere die Einhaltung der freigegebenen Grenzen und Unterschiede zwischen einfachen sowie schutz-/informationsreichen Dorfbesetzungen.

Die bestehende Business-Schicht kann die gewählte Aufstellung bewerten; der verpflichtende normale Autopfad wird in `We-03-50` vor dem UI-Einbau abgesichert. Bei 18 wird die Empfehlung auf die empirisch freigegebene Spanne von drei bis fünf Wölfen begrenzt. Die Wolfszahl wird für jede Spielerzahl neu geprüft. Die Ablehnung von fünf Wölfen bei 15 Spielern ist keine allgemeine Obergrenze für größere Gruppen. Die bestehenden Aufstellungen bis 16 bleiben unverändert auf höchstens vier begrenzt. Bei 17 Spielern vergleicht der Bewertungsmodus anfängliche Wolfszahlen von eins bis acht, sofern genügend Rollenplätze verbleiben. Der normale Spielstart ohne Bewertungsmodus verwendet weiterhin die Standardzahl. Rollenwerte, Kombinationen, Gegenstände und Spielerzahl gehen in die Bewertung ein. Die Werte stammen aus gespeicherten Modellläufen. [Wertetabelle und Erklärung](GAMEHUB_WERWOLF_ROLE_VALUES.md)

Die Einrichtungsoberfläche zeigt die automatisch ermittelte Wolfszahl an. Beim Zufallsmodus bleiben gezogene Rollen und deren genaue Punktaufschlüsselung bei der Spielleitung, damit die Rollenliste verdeckt bleibt.

## Rollenübersicht und Zufallsaufstellung

### Rollenübersicht nach Spielerzahl

Die Spieleinrichtung erhält eine tabellarische oder vergleichbar aufgebaute Übersicht. Links steht zeilenweise die Spielerzahl von 6 bis 20 ohne Erzähler, mit Kennzeichnung noch ungeprüfter Gruppengrößen. Jede Zeile zeigt die Pflichtbesetzung, die insgesamt verfügbaren Sonderrollen und welche Optionen bei dieser Spielerzahl neu dazukommen. Die Zahl der freien Rollenplätze sowie verfügbare Zusatzoptionen wie Trunkenbold und Schutzamulett sind ebenfalls sichtbar.

### Dynamische Rollenverfügbarkeit in der Einrichtung

Nach jeder Änderung von Spielerzahl, Rollenauswahl oder relevanten Optionen prüft die Business-Schicht mögliche Aufstellungen über alle freigegebenen Wolfszahlen. Die UI aktualisiert die automatisch festgelegte Zahl, freie Plätze und verfügbare Rollen.

- Bei 14 bis 16 Spielern können beide Heilrollen gewählt werden, wenn das System eine zulässige Aufstellung mit vier Wölfen findet. Bei 17 und 18 kommen dafür vier oder fünf infrage. Die Entscheidung muss die eigentliche Balance berücksichtigen.
- Eine Rolle wird nur gesperrt, wenn die hypothetische Auswahl bei keiner freigegebenen Wolfszahl zulässig ist. Leibwächter und Dorfmatratze bleiben unabhängig davon gegenseitig ausgeschlossen.
- Ist keine kompatible Aufstellung möglich, erklärt die UI den Konflikt und sperrt den Start. Es gibt keinen manuellen Wolfszahlregler zur Umgehung der Bedingungen.
- Die UI-Aufgaben `We-01-26`, `We-01-31` und `We-01-32` setzen diese Vorgabe nach Validierung von `We-03-50` um.

### Feste Rollen oder variable Rollen

Fest erlaubt eine manuelle Wolfswahl innerhalb der freigegebenen Werte und zeigt eine separate Empfehlung. Variabel unterscheidet Muss, Darf und Nein: Muss-Rollen/-Zusätze sind sicher dabei, Darf-Rollen werden innerhalb eines inklusiven Bereichs gezogen. Der Bereich zählt nur Darf-Rollenfamilien, nicht feste Rollen oder Varianten. Leibwächter/Dorfmatratze bilden eine Alternative; Dorftrottel bleibt separat. Jeder Darf-Zusatz wird unabhängig mit 50 % aufgenommen, ohne gemeinsamen Itembereich.

### Zufallsmodus

Zuerst wird aus den ausgewählten erlaubten Wolfszahlen gleichverteilt gezogen. Danach folgt eine für diese Zahl machbare Darf-Anzahl gleichverteilt. Genau so viele Rollengruppen werden anhand der Anzahl alternativer Rollenkarten gewichtet gewählt; je Gruppe wird die Rollenkarte und danach ihre Einstellungsvariante gleichverteilt gezogen. Die Teilmengen sind nicht alle gleich wahrscheinlich. Muss-Einträge bleiben erhalten. Zusätze werden unabhängig gezogen; freie Sitze werden mit Dorfbewohnern gefüllt. Eine ausgewählte Wolfszahl ohne machbare Aufstellung im Bereich sperrt den Start, statt still entfernt zu werden. Die Seherin ist fest, der Erzähler zählt nicht mit.

Das Amulett startet bei einer erlaubten Nichtwolf-Person; Trunkenbold und Amulett verbrauchen keine Rollenplätze. Die Ziehung bleibt bis zur privaten Rollenverteilung verborgen und wird nicht bei jeder Anzeige wiederholt. analyzeVariableWerewolfSelection liefert nur öffentliche Entwurfsmetadaten, recommendVariableWerewolfCount bewertet ausschließlich Muss-Einträge; die Ziehung selbst verwendet keine Punktebewertung. Vollständige API und Migrationshinweise: [GAMEHUB_WERWOLF_VARIABLE_API.md](GAMEHUB_WERWOLF_VARIABLE_API.md).

## Rollenbesetzung nach Spielerzahl

Die Zahl in der Tabelle zählt nur Personen mit Spielrolle. Der Erzähler kommt dazu. Die Grundbesetzung folgt Ultimate Werewolf und enthält immer eine Seherin. Für die erste Partie einer Gruppe ist sie die Empfehlung. Die letzte Spalte enthält Vorschläge für Folgepartien. Jede dort genannte Sonderrolle ersetzt genau einen gewöhnlichen Dorfbewohner.

| Spieler | Werwölfe | Seherin | Dorfbewohner in der Grundbesetzung | Vorschlag für eine Folgepartie |
| --- | --- | --- | --- | --- |
| 6 | 1 | 1 | 4 | Hexe und Dorftrottel. Für eine zusätzliche Nachtaktion kann ein Leibwächter oder eine Dorfmatratze dazukommen. |
| 7 | 1 | 1 | 5 | Dorftrottel |
| 8 | 1 | 1 | 6 | Leibwächter |
| 9 | 2 | 1 | 6 | Leibwächter |
| 10 | 2 | 1 | 7 | Jäger |
| 11 | 2 | 1 | 8 | Bürgermeister mit doppelter Stimme |
| 12 | 3 | 1 | 8 | Leibwächter und Jäger |
| 13 | 3 | 1 | 9 | Hexe |
| 14 | 3 | 1 | 10 | Amor und Jäger |
| 15 | 3 | 1 | 11 | Leibwächter und Alte Vettel. Für eine separate Partie Bürgermeister mit Hammer und Dorftrottel. |

**6 bis 8 Spieler.** Bei sechs Spielern können zwei falsche Tagesabstimmungen und zwei erfolgreiche Wolfsangriffe genügen, damit der letzte Wolf bei 1:1 gewinnt. In der ersten Nacht fällt der Wolfsangriff regulär aus. Der Dorftrottel bringt eine zusätzliche Stimmregel ins Spiel. Die Abwehr des Leibwächters und ein verfehlter Angriff auf die Dorfmatratze können Zeit für einen weiteren Tag gewinnen. Beim Angriff auf einen Gastgeber entscheidet die Übernachtung, wen die Wölfe treffen. Für sechs Spieler wurden die Sonderrollen sowohl einzeln als auch in den Kombinationen mit Hexe, Dorftrottel und Leibwächter geprüft.

**9 bis 11 Spieler.** Bei neun Spielern beginnt die Partie mit zwei Wölfen gegen sieben Personen aus dem Dorf. Bei acht Spielern sind es ein Wolf gegen sieben. Das Dorf kann an der Neunergrenze daher einen Ausfall weniger verkraften, bevor die Wölfe Gleichstand erreichen. Dort zuerst die Grundbesetzung spielen und die nächste Partie bei Bedarf mit Leibwächter ausprobieren. Ab elf Spielern lässt sich die Alte Vettel einzeln als Alternative zur doppelten Stimme testen. Pflicht-Ja, doppelte Stimme und Stummschaltung zunächst in getrennten Partien ausprobieren, weil sie alle dieselbe Mehrheitsentscheidung beeinflussen.

**12 bis 15 Spieler.** Bei zwölf Spielern steigt die Wolfszahl erneut. Zwei einfache Sonderrollen sind hier ein Versuch für Gruppen, die den Grundablauf kennen. Hexe, Hammer und Amor jeweils in eigenen Aufstellungen einführen. Gift ist schon in der ersten Nacht möglich. Ein Liebespaar kann zwei Ausscheidende zugleich verursachen. Durch das gemeinsame Ausscheiden eines gemischten Paars kann sich das Zahlenverhältnis sofort ändern. Den Hammer zunächst ohne weitere Rollen mit direkter Ausschlussfähigkeit ausprobieren.

**Spieltests.** Die Sonderbesetzungen sind Startpunkte für Spieltests. Pro Gruppengröße zuerst die Grundbesetzung und danach rollengleiche Vergleiche mit jeweils einer gezielten Änderung spielen. Dabei Rollenaufdeckung und Tagesregeln beibehalten. Pro Partie Siegpartei, erreichte Tage, erstes Ausscheiden eines Wolfs und den Einfluss der Sonderrolle festhalten. Danach gezielt prüfen, wie sich dieselbe Aufstellung mit geheimen Rollen spielt. Für kombinierte Sonderrollen sind der Wolfssieg bei Gleichstand trotz gemischtem Liebespaar, der Treffer oder Fehlschlag des Hammers und eine entscheidende Abstimmung mit Stummschaltung die wichtigsten Fälle.

## Automatisierter Schnelldurchlauf

`pnpm test src/business/games/werewolf/simulation.test.ts` spielte vor der Freigabe des Magiers ab elf Spielern 127.381 vollständige Partien durch. Die ersten 70.280 Partien prüfen die Rollenbesetzungen ohne Magier und Gerber für jede Gruppengröße und mit allen Kombinationen aus Bürgermeister-Modus, Selbstwahl der Alten Vettel und Rollenaufdeckung. In weiteren 6.913 Partien ist Trunkenbold aktiv. Für jede der 4.155 Aufstellungen mit Leibwächter ohne Magier und Gerber laufen zusätzlich zwei Partien mit demselben Zufallsstart und denselben übrigen Einstellungen. Eine Partie verwendet den Leibwächter, die andere die Dorfmatratze. Weitere 2.037 Partien prüfen den Magier mit den kompatiblen Rollenbesetzungen ohne Gerber. Die 9.673 zulässigen Aufstellungen mit Gerber laufen jeweils mit beiden Siegbedingungen und gleichem Zufallsstart durch. In 20.495 Partien ist das Amulett aktiv, jeweils mit einer zulässigen Rollenbesetzung und wechselnden Einstellungen.

Der Test prüft in jedem erreichten Zustand alternative Ziele und regelwidrige Aktionen. Er prüft sämtliche 32.768 namentlichen Stimmzettel-Kombinationen an einem Tisch mit 15 Spielern sowie repräsentative Kombinationen mit gleichem Stimmgewicht in den laufenden Partien. Für den weiteren Verlauf wählt er jeweils einen Zug per reproduzierbarem Zufallswert. Fehlschläge enthalten die Startbesetzung, den Startwert, die bisherigen Züge und die betroffene Entscheidung. Geprüft werden unter anderem Siegbedingungen, verbrauchte Fähigkeiten, Ausscheiden der Liebenden und öffentliche Ansagen.

Die Simulation prüft die Regeln. Für die Balance bleiben Spieltests mit echten Gruppen vorgesehen, weil die Simulation keine Diskussion und kein Bluffen abbildet.

## Bisherige Simulationen wiederverwenden

| Spieler | Dokumentierte Ergebnisse |
| --- | --- |
| 6 | [Rollenvergleiche](#simulierte-wolfssiege-bei-sechs-spielern) und [aktueller Vergleich mit Dorfmatratze](#leibwächter-und-dorfmatratze-bei-sechs-spielern) |
| 7 | [Einzelvergleiche](#prüfung-der-aufstellungen-für-sieben-spieler) und [Kombinationsprüfung](#vollständiger-vergleich-der-sechs-vorgeschlagenen-sonderrollen). Die dokumentierten Quoten zur früheren Selbstopfer-Regel gehören zur damaligen Spiellogik. |
| 8 | [Gerber und Seher-Lehrling](#gerber-und-seher-lehrling-bei-acht-spielern) und [Kombinationsprüfung mit 544 Varianten](#vollständige-kombinationsprüfung-für-acht-spieler). Für den vollständigen Lauf sind die Bandbreiten je Anzahl gewählter Sonderrollen dokumentiert. |
| 9 | [Vergleich der möglichen Zusatzrollen](#prüfung-der-aufstellungen-für-neun-spieler) mit [Einzelwerten](simulations/werewolf-nine-player.jsonl) sowie [Hammer-Vergleich](#bürgermeister-mit-hammer-bei-neun-spielern) und [Magier-Vergleich](#magier-als-alternative-zur-hexe-bei-neun-spielern) sowie die [vollständige Kombinationsprüfung](#vollständige-kombinationsprüfung-für-neun-spieler) |
| 10 | [Aktueller Vergleich von Hammer, Ermittler und Schutzamulett](#prüfung-der-aufstellungen-für-zehn-spieler) und [früherer Vergleich zweier Aufstellungen mit Amor](#simulierte-wolfssiege-in-zwei-zehnerbesetzungen). Die Quoten verwenden die damalige Siegprüfung. |
| 11 | [Magier mit und ohne Hexe](#magier-mit-und-ohne-hexe-bei-elf-spielern) mit [Einzelwerten](simulations/werewolf-eleven-player-magician.jsonl.gz) |
| 12 | [Vergleich von Hexe, Magier und weiteren Optionen](#prüfung-der-aufstellungen-für-zwölf-spieler) mit [Einzelwerten](simulations/werewolf-twelve-player.jsonl) |
| 13 | [Vergleich von Hexe und Magier](#prüfung-der-aufstellungen-für-dreizehn-spieler) mit [Einzelwerten](simulations/werewolf-thirteen-player-healers.jsonl.gz) |
| 14 | [Drei oder vier Wölfe und beide Heilrollen](#prüfung-der-aufstellungen-für-vierzehn-spieler) mit [Einzelwerten](simulations/werewolf-fourteen-player-options.jsonl.gz) |

Bei gleicher Besetzung, Spiellogik und gleichen Modellannahmen gelten die dokumentierten Ergebnisse weiter. Frühere Quoten mit Amor und eigenem Paarsieg sind historische Vergleiche. Das vollständige Neuner-Archiv verwendet die aktuelle Siegprüfung. Für neue Spielerzahlen, geänderte Regeln oder fehlende Einzelwerte genügt ein Lauf für die betroffenen Fälle. Bei künftigen Läufen die JSON-Ausgabe je Aufstellung zusammen mit Regelstand, Modellen und Stichprobengröße sichern, damit sich auch Einzelfragen später auswerten lassen.

## Simulierte Wolfssiege in zwei Zehnerbesetzungen

Dieser Vergleich mit Amor lief vor der Änderung der Siegprüfung bei echter Werwolf-Überzahl.

`pnpm test src/business/games/werewolf/balance.test.ts` spielt 10.000 Partien je Besetzung und Entscheidungsmodell, insgesamt 40.000 Partien. Die Besetzung enthält zwei Werwölfe, Seherin, Hexe, Amor, Jäger, Leibwächter, Dorftrottel und Gerber. Der letzte Platz geht entweder an einen gewöhnlichen Dorfbewohner oder an den Paranormalen Ermittler. Für jede Paarung bleiben die Plätze aller übrigen Rollen und die Zufallsstarts gleich.

| Modell | Wolfssiege mit Dorfbewohner | Wolfssiege mit Ermittler | Veränderung |
| --- | ---: | ---: | ---: |
| Zufällige Abstimmung | 5.623 von 10.000 | 5.623 von 10.000 | 0 Prozentpunkte |
| Abstimmung mit Hinweisen | 6.170 von 10.000 | 6.054 von 10.000 | −1,16 Prozentpunkte |

Beide Modelle simulieren höchstens eine Nominierung pro Tag. Im Zufallsmodell beeinflussen Hinweise die Wahl nicht. Jede abgegebene Stimme hat vor der Pflichtstimme des Dorftrottels eine Ja-Wahrscheinlichkeit von 65 Prozent. Im zweiten Modell bringen lebende Seherin und Ermittler ihre Hinweise jeweils mit 45 Prozent Wahrscheinlichkeit in die Nominierung ein. Die Seherin und der Ermittler berücksichtigen eigenes Wissen bei der Abstimmung. Wölfe stimmen seltener für den Ausschluss anderer Wölfe und Liebende schonen einander häufiger. Die übrigen Nachtaktionen verwenden in beiden Modellen dieselben einfachen Entscheidungsregeln.

Mit Hinweisen gewinnen die Wölfe in 294 Paarungen nur gegen den gewöhnlichen Dorfbewohner und in 178 nur gegen den Ermittler. Der Vergleich zählt den Sieg der Hauptpartei. Der persönliche Gerber-Sieg wird unabhängig davon gewertet. Die Zahlen gelten für diese Entscheidungsmodelle und diese Aufstellung.

## Simulierte Wolfssiege bei sechs Spielern

Die folgenden früheren Vergleiche mit „Leibwächter mit Selbstopfer“ verwenden die damalige Rolle, die ein direkter Angriff treffen konnte. Der neue Vergleich zur Dorfmatratze steht am Ende dieses Dokuments.

Dieselbe Simulation vergleicht 16 Aufstellungen mit jeweils einem Werwolf und einer Seherin. Jede Variante fügt dem Grundspiel genau eine Sonderrolle oder das Schutzamulett hinzu. Eine Sonderrolle ersetzt einen gewöhnlichen Dorfbewohner. Pro Aufstellung und Modell laufen 10.000 Partien mit identischen Zufallsstarts, insgesamt 320.000 Partien. Die Besetzung von Werwolf und Seherin bleibt in jedem Vergleich an denselben Sitzplätzen.

| Aufstellung | Wolfssiege bei zufälligen Abstimmungen | Wolfssiege mit Hinweisen | Mittlere erreichte Nacht im Modell mit Hinweisen |
| --- | ---: | ---: | ---: |
| Vier gewöhnliche Dorfbewohner | 63,59 % | 65,62 % | 3,22 |
| Dorftrottel und drei gewöhnliche Dorfbewohner | 62,33 % | 63,30 % | 2,95 |
| Leibwächter mit Abwehr und drei gewöhnliche Dorfbewohner | 61,61 % | 62,75 % | 3,39 |
| Leibwächter mit Selbstopfer und drei gewöhnliche Dorfbewohner | 63,35 % | 65,09 % | 3,22 |
| Hexe | 50,85 % | 53,01 % | 3,17 |
| Jäger | 50,17 % | 53,02 % | 2,85 |
| Amor | 45,56 % | 48,29 % | 2,93 |
| Alte Vettel | 64,59 % | 65,35 % | 3,11 |
| Bürgermeister mit doppelter Stimme | 64,30 % | 64,17 % | 3,10 |
| Bürgermeister mit Hammer | 57,50 % | 58,56 % | 2,91 |
| Harter Bursche | 61,87 % | 64,41 % | 3,36 |
| Seher-Lehrling | 63,59 % | 64,77 % | 3,22 |
| Paranormaler Ermittler | 63,59 % | 63,73 % | 3,22 |
| Gerber mit beliebigem Ausscheiden | 63,59 % | 66,59 % | 3,14 |
| Gerber mit Tagesabstimmung | 63,59 % | 66,59 % | 3,14 |
| Schutzamulett | 64,08 % | 66,27 % | 3,94 |

Der Dorftrottel senkt die Wolfsquote in beiden Modellen leicht und die Partien erreichen im Schnitt eine frühere letzte Nacht. Der Leibwächter mit Abwehr senkt die Wolfsquote etwas stärker und verlängert die Partien im Schnitt. Das Selbstopfer ändert die Wolfsquote gegenüber der Grundbesetzung um weniger als einen Prozentpunkt. Es ändert, wer durch den Angriff ausscheidet. Die Vergleiche verwenden die Entscheidungen und die Begrenzung auf eine Nominierung pro Tag aus dem Zehnervergleich. Die Zahlen beschreiben dieses Modell. Die Sonderbesetzungen für sechs Spieler sind Vorschläge für Spieltests.

**Weitere Empfehlungen für sechs Spieler.** Hexe und Jäger sind einzeln die ersten Kandidaten für eine Freigabe. Der Harte Bursche, der Ermittler und die doppelte Bürgermeisterstimme sind ebenfalls mögliche Einzeloptionen mit kleinerem Einfluss. Amor lohnt sich als bewusst gewählte Variante mit Liebespaar. Im Modell mit Hinweisen gewinnt das gemischte Liebespaar in 7,21 Prozent der Partien. Der Gerber verändert die Wolfsquote kaum, gewinnt persönlich aber in 68,99 Prozent der Partien bei jedem Ausscheiden und in 30,85 Prozent bei der Tagesabstimmung. Alte Vettel, Seher-Lehrling und Hammer würde ich für größere Runden lassen, ebenso das Amulett. Mit dem Amulett steigt die mittlere erreichte Nacht im Modell mit Hinweisen von 3,22 auf 3,94.

Für den Hammer wählt die Simulation pro möglicher Nacht mit 40 Prozent Wahrscheinlichkeit ein zufälliges Ziel. Die Alte Vettel wählt ein zufälliges zulässiges Ziel, mit ausgeschalteter Selbstwahl. Der Amulett-Träger gibt es bei freier Wahl mit 50 Prozent Wahrscheinlichkeit an eine zufällige andere lebende Person. Eine verpflichtende Weitergabe findet immer statt. Der Gerber erhält in beiden Varianten dieselbe simulierte Spielweise. Seine persönliche Siegquote zeigt die Auswirkung der Wertung bei gleichem Verhalten. Magier und Trunkenbold wurden bei sechs Spielern bewusst als unzulässige Konfiguration geprüft. Die bestätigte Auswahl steht im [Konfigurationsplan für sechs Spieler](#festgelegte-aufstellung-für-sechs-spieler).

### Hexe mit Dorftrottel und Leibwächter

Der Paarvergleich verwendet die gleichen 10.000 Zufallsstarts pro Besetzung und Entscheidungsmodell. Insgesamt wurden 120.000 Partien gespielt. In allen Varianten ist die Hexe dabei. Freie Plätze werden mit gewöhnlichen Dorfbewohnern gefüllt.

| Zusätzliche Rollen neben der Hexe | Wolfssiege bei zufälligen Abstimmungen | Wolfssiege mit Hinweisen | Mittlere erreichte Nacht mit Hinweisen |
| --- | ---: | ---: | ---: |
| Keine | 50,85 % | 53,01 % | 3,17 |
| Dorftrottel | 49,25 % | 50,94 % | 2,91 |
| Leibwächter mit Abwehr | 50,66 % | 52,23 % | 3,39 |
| Leibwächter mit Selbstopfer | 51,71 % | 53,67 % | 3,25 |
| Dorftrottel und Leibwächter mit Abwehr | 49,42 % | 50,64 % | 3,08 |
| Dorftrottel und Leibwächter mit Selbstopfer | 50,47 % | 51,92 % | 2,96 |

Die Wolfsquote liegt mit Hexe in allen sechs Besetzungen nahe an der Hälfte. Als erste Besetzung für echte Spieltests bietet sich Hexe mit Dorftrottel an. Mit zusätzlicher Abwehr sinkt die Wolfsquote im Modell mit Hinweisen um weitere 0,30 Prozentpunkte. Bei zufälligen Abstimmungen steigt sie im selben Vergleich um 0,17 Prozentpunkte. Der Leibwächter ist damit vor allem eine zusätzliche Spielentscheidung. Die Empfehlung gilt für den Vergleich mit jeweils höchstens einer Nominierung pro Tag. In beiden Modellen heilt die Hexe ein vorhandenes Wolfsopfer mit 70 Prozent Wahrscheinlichkeit, solange sie Heilung hat. Ab Nacht zwei vergiftet sie mit 40 Prozent Wahrscheinlichkeit eine zufällig gewählte lebende Person, die weder sie selbst noch das aktuelle Wolfsopfer ist, sofern der Trank verfügbar ist.

### Vorsichtige Abstimmungen mit Hexe

Im dritten Modell kann das Dorf einen Tag ohne Abstimmung beenden. Es zählt die öffentlich bekannten Werwölfe und prüft, ob ein falscher Ausschluss sofort oder nach einem erfolgreichen Wolfsangriff zum Wolfssieg führen würde. In dieser Lage stimmt es nur über einen von der Seherin öffentlich benannten Wolf ab, sofern es durch Abwarten noch Zeit gewinnen könnte. Bei einem Wolf unter vier Lebenden schafft Aussetzen einen weiteren Tag, auch wenn der nächste Wolfsangriff erfolgreich ist. Bei einem Wolf unter drei Lebenden setzt das Dorf nur noch aus, wenn es einen Schutz für möglich hält. Ein lebender Leibwächter mit Abwehr oder eine lebende Hexe gilt dafür als möglicher Schutz. Das Modell lässt den geheimen Vorrat an Heiltränken bei der öffentlichen Entscheidung außen vor.

| Sonderrollen neben der Hexe | Wolfssiege mit Hinweisen | Wolfssiege mit vorsichtiger Abstimmung | Ausgelassene Nominierungen pro 10.000 Partien |
| --- | ---: | ---: | ---: |
| Keine | 53,01 % | 54,74 % | 6.946 |
| Dorftrottel | 50,94 % | 51,52 % | 6.705 |
| Leibwächter mit Abwehr | 52,23 % | 55,42 % | 9.379 |
| Leibwächter mit Selbstopfer | 53,67 % | 55,21 % | 7.222 |
| Dorftrottel und Leibwächter mit Abwehr | 50,64 % | 53,30 % | 9.157 |
| Dorftrottel und Leibwächter mit Selbstopfer | 51,92 % | 52,66 % | 7.058 |

Die sechs Besetzungen liefen mit weiteren 60.000 vollständigen Partien und denselben Zufallsstarts. Die niedrigste Wolfsquote im vorsichtigen Modell ergibt sich mit Hexe und Dorftrottel. Bei einer vorsichtigen Gruppe hängt der Wert eines ausgelassenen Tages davon ab, ob der Schutz in der folgenden Nacht tatsächlich greift oder ein besserer Hinweis verfügbar wird. Die beiden früheren Modelle bleiben zum Vergleich verfügbar.

### Erster Tag ohne Opfer

Das vierte Modell lässt das Dorf am ersten Tag mit 80 Prozent Wahrscheinlichkeit auf die Nominierung verzichten, wenn die öffentliche Morgenansage kein Opfer nennt. Die Wahrscheinlichkeit ist eine Testannahme. In den sechs Hexenaufstellungen fällt der Wolfsangriff in Nacht eins aus und die simulierte Hexe hebt ihr Gift mindestens bis Nacht zwei auf. Deshalb beginnt der erste Tag in allen 60.000 Vergleichspartien ohne Opfer. Mit denselben Zufallsstarts wurde in 8.069 von 10.000 Partien je Aufstellung am ersten Tag ausgesetzt. Ab Tag zwei gelten die bisherigen vorsichtigen Entscheidungsregeln.

| Sonderrollen neben der Hexe | Wolfssiege im vorsichtigen Modell | Wolfssiege mit häufigem Aussetzen an Tag eins |
| --- | ---: | ---: |
| Keine | 54,74 % | 56,25 % |
| Dorftrottel | 51,52 % | 53,66 % |
| Leibwächter mit Abwehr | 55,42 % | 56,98 % |
| Leibwächter mit Selbstopfer | 55,21 % | 56,65 % |
| Dorftrottel und Leibwächter mit Abwehr | 53,30 % | 54,32 % |
| Dorftrottel und Leibwächter mit Selbstopfer | 52,66 % | 53,97 % |

In diesem Modell steigt die Wolfsquote in allen sechs Aufstellungen. Hexe mit Dorftrottel erreicht weiterhin die niedrigste Wolfsquote. Die Simulation bildet hier das Aussetzen an Tag eins ab. Spätere Morgen ohne Opfer, etwa nach einer erfolgreichen Rettung, lösen diese Entscheidung nicht automatisch aus.

### Hexe mit zurückhaltendem Trankeinsatz

Ein fünftes Modell behält die vorsichtigen Abstimmungen und das häufige Aussetzen an Tag eins bei. Die Hexe heilt sich selbst, wenn sie Wolfsopfer wird und noch einen Heiltrank hat. Andere Wolfsopfer heilt sie in dieser Situation mit 90 Prozent Wahrscheinlichkeit. Sie vergiftet ab Nacht zwei nur jemanden, den die Seherin öffentlich als Wolf benannt hat oder der bereits zweimal nominiert wurde. Hat sie ein solches Ziel, setzt sie den Gifttrank mit 20 Prozent Wahrscheinlichkeit ein. Beide Tränke können ungenutzt bleiben. Die Prozentsätze sind Annahmen für den Vergleich.

| Sonderrollen neben der Hexe | Wolfssiege mit bisherigem Trankeinsatz | Wolfssiege mit zurückhaltender Hexe | Heiltrank eingesetzt | Gifttrank eingesetzt |
| --- | ---: | ---: | ---: | ---: |
| Keine | 56,25 % | 59,32 % | 95,22 % | 7,70 % |
| Dorftrottel | 53,66 % | 56,67 % | 93,93 % | 6,61 % |
| Leibwächter mit Abwehr | 56,98 % | 57,31 % | 92,10 % | 9,64 % |
| Leibwächter mit Selbstopfer | 56,65 % | 58,39 % | 95,07 % | 8,42 % |
| Dorftrottel und Leibwächter mit Abwehr | 54,32 % | 55,02 % | 90,02 % | 7,99 % |
| Dorftrottel und Leibwächter mit Selbstopfer | 53,97 % | 55,73 % | 93,70 % | 7,18 % |

In den 60.000 zusätzlichen Partien mit zurückhaltender Hexe verbraucht sie ihren Gifttrank je nach Aufstellung in 6,61 bis 9,64 Prozent der Partien. Im vorherigen Modell lag der Verbrauch bei 64,09 bis 68,76 Prozent. In diesem Vergleich erreicht Hexe mit Dorftrottel und Leibwächter mit Abwehr die niedrigste Wolfsquote. Da Heil- und Giftverhalten gleichzeitig verändert wurden, misst dieser Lauf ihre gemeinsame Auswirkung.

### Öffentliche Hinweise und Abstimmungsverhalten

Drei weitere Modelle mit je 60.000 Partien untersuchen öffentliches Wissen. Die Seherin teilt ihre bisherigen Ergebnisse im ersten Modell pro Tag mit 85 Prozent Wahrscheinlichkeit, solange sie lebt. Ein öffentlich benannter Wolf hat bei der Nominierung Vorrang, auch an Tag eins. Andere Nicht-Werwölfe stimmen in dieser Situation mit 85 Prozent Wahrscheinlichkeit für den Ausschluss. Die unveränderten Regeln für die Stimme des Nominierten und Liebespaare werden vorher angewendet. Öffentlich als Nicht-Werwolf benannte Personen werden bei der Nominierung nach Möglichkeit ausgelassen.

Im zweiten Modell berücksichtigt auch die Hexe, wen sie vor den Werwölfen gerettet hat. Sie kann diese Information an einem Tag mit 50 Prozent Wahrscheinlichkeit öffentlich machen. Im dritten Modell grenzt das Dorf zusätzlich die möglichen Dorftrottel anhand der offenen Abstimmungen ein. Wer Nein stimmt, kommt als Dorftrottel nur dann nicht mehr infrage, wenn er stimmberechtigt war. Bleibt genau ein lebender Kandidat übrig, behandelt ihn das Dorf als Nicht-Werwolf. Die Ja-Pflicht wird bei der beobachteten Stimme berücksichtigt.

| Sonderrollen neben der Hexe | Wolfssiege mit zurückhaltender Hexe | Seherin mit glaubwürdigen Hinweisen | Zusätzlich Wissen der Hexe | Zusätzlich Dorftrottel per Ausschlussverfahren |
| --- | ---: | ---: | ---: | ---: |
| Keine | 59,32 % | 26,56 % | 25,12 % | 25,12 % |
| Dorftrottel | 56,67 % | 25,08 % | 23,72 % | 23,54 % |
| Leibwächter mit Abwehr | 57,31 % | 24,57 % | 23,32 % | 23,32 % |
| Leibwächter mit Selbstopfer | 58,39 % | 25,85 % | 24,57 % | 24,57 % |
| Dorftrottel und Leibwächter mit Abwehr | 55,02 % | 24,20 % | 22,92 % | 22,81 % |
| Dorftrottel und Leibwächter mit Selbstopfer | 55,73 % | 24,76 % | 23,51 % | 23,31 % |

Das Dorf identifiziert den lebenden Dorftrottel in 5,29 bis 6,21 Prozent der Partien, in denen er mitspielt. Der zusätzliche Effekt beträgt je nach Besetzung 0,11 bis 0,20 Prozentpunkte weniger Wolfssiege. Der starke Effekt der Seherin hängt an den Annahmen über die Häufigkeit und Glaubwürdigkeit ihrer Hinweise. Falsche Seher-Behauptungen und Gegenbehauptungen der Wölfe sind in diesen Modellen ausgeklammert.

### Wolfsangriff in Nacht eins und zweiter Tag ohne Opfer

Für den Vergleich kann `createWerewolf` mit `attackOnFirstNight: true` starten. Dann wählt das Rudel bereits in seinem ersten Aufruf ein Ziel. Leibwächter und Heiltrank können den Angriff regulär abfangen. Standardmäßig beginnt die Jagd in Nacht zwei.

Beide Versuchsläufe übernehmen die Regeln für vorsichtige Abstimmungen, zurückhaltenden Trankeinsatz, glaubwürdige Seherhinweise, Informationen der Hexe und die Erkennung des Dorftrottels. Im zweiten Lauf verzichtet das Dorf an Tag zwei mit 80 Prozent Wahrscheinlichkeit auf eine Nominierung, wenn die Morgenansage kein Opfer nennt. Ein öffentlich als Wolf benannter Spieler kann trotzdem nominiert werden. Die 80 Prozent sind eine Modellannahme.

| Sonderrollen neben der Hexe | Wolfssiege mit Jagd ab Nacht zwei | Jagd ab Nacht eins | Zusätzlich seltene Wahl nach Nacht zwei ohne Opfer |
| --- | ---: | ---: | ---: |
| Keine | 25,12 % | 36,96 % | 37,01 % |
| Dorftrottel | 23,54 % | 34,00 % | 34,07 % |
| Leibwächter mit Abwehr | 23,32 % | 33,33 % | 32,92 % |
| Leibwächter mit Selbstopfer | 24,57 % | 35,44 % | 35,48 % |
| Dorftrottel und Leibwächter mit Abwehr | 22,81 % | 32,39 % | 31,71 % |
| Dorftrottel und Leibwächter mit Selbstopfer | 23,31 % | 33,34 % | 33,36 % |

Die zwei zusätzlichen Modelle umfassen 120.000 Partien mit denselben Zufallsstarts. In jedem Modell gab es unter den 60.000 Partien 7.248 zweite Tage ohne Nachtopfer. Der Anteil dieser Tage mit einem tatsächlichen Rauswurf sank von 55,50 auf 26,67 Prozent. Die Wolfsquote ändert sich durch die frühere Jagd um 9,58 bis 11,84 Prozentpunkte. Die zweite Änderung hat je nach Aufstellung einen Effekt von höchstens 0,68 Prozentpunkten.

### Jäger mit den bestätigten Sonderrollen

Der Jäger spielt in allen zwölf Aufstellungen mit. Hexe und Dorftrottel können jeweils hinzukommen. Beim Leibwächter gibt es Abwehr, Selbstopfer und die Aufstellung ohne ihn. Pro Aufstellung und Modell wurden 10.000 Partien mit denselben Zufallsstarts gespielt, insgesamt 480.000. Die folgenden Quoten zählen Wolfssiege.

| Zusätzlich zum Jäger | Zufällige Abstimmung | Vorsichtige Runde | Glaubwürdige Hinweise | Hinweise und Jagd ab Nacht eins |
| --- | ---: | ---: | ---: | ---: |
| Keine Sonderrolle | 50,17 % | 55,14 % | 33,59 % | 45,78 % |
| Dorftrottel | 48,38 % | 52,61 % | 31,86 % | 44,18 % |
| Leibwächter mit Abwehr | 49,35 % | 55,46 % | 32,10 % | 43,93 % |
| Leibwächter mit Selbstopfer | 50,26 % | 54,76 % | 32,24 % | 44,77 % |
| Dorftrottel und Leibwächter mit Abwehr | 48,08 % | 53,34 % | 30,78 % | 42,22 % |
| Dorftrottel und Leibwächter mit Selbstopfer | 49,17 % | 52,21 % | 30,58 % | 42,72 % |
| Hexe | 41,11 % | 48,77 % | 23,97 % | 34,43 % |
| Hexe und Dorftrottel | 40,31 % | 47,37 % | 22,76 % | 33,11 % |
| Hexe und Leibwächter mit Abwehr | 40,93 % | 47,89 % | 21,18 % | 30,59 % |
| Hexe und Leibwächter mit Selbstopfer | 41,89 % | 49,03 % | 22,94 % | 33,34 % |
| Hexe, Dorftrottel und Leibwächter mit Abwehr | 40,11 % | 46,44 % | 20,65 % | 29,40 % |
| Hexe, Dorftrottel und Leibwächter mit Selbstopfer | 40,94 % | 47,40 % | 21,80 % | 31,86 % |

Die vorsichtige Runde verwendet das Modell mit zurückhaltender Hexe, vorsichtigen Abstimmungen und häufigem Aussetzen an Tag eins. Bei glaubwürdigen Hinweisen nutzt die Gruppe zusätzlich das Wissen von Seherin und Hexe sowie das Ausschlussverfahren für den Dorftrottel. Das letzte Modell erlaubt Wolfsangriffe ab Nacht eins und stimmt an einem zweiten Tag ohne Nachtopfer seltener ab. Der simulierte Jäger schießt bei seinem Ausscheiden auf eine zufällig ausgewählte lebende Person, solange ein Ziel verfügbar ist. Ein Spieler kann beim Ausscheiden auf den Schuss verzichten oder das Ziel anhand von Hinweisen wählen. Falsche Rollenbehauptungen sind ausgeklammert.

Der Jäger ist ab sechs Spielern als Sonderrolle freigegeben. Jäger und Dorftrottel bieten einen Einstieg mit wenigen Sonderaktionen. Mit Hexe profitieren die Dorfbewohner in allen vier Modellen. Wer alle vier Sonderrollen wählt, spielt ohne gewöhnliche Dorfbewohner. Die Kombination ist weiterhin mit Leibwächter oder Dorfmatratze zulässig.

## Prüfung der Aufstellungen für sieben Spieler

Der Vergleich umfasst 1.080.000 Partien. Für jede Aufstellung und jedes der vier Entscheidungsmodelle wurden 10.000 Partien mit denselben Zufallsstarts gespielt. Die reguläre Grundbesetzung enthält einen Werwolf und eine Seherin. Freie Plätze füllen gewöhnliche Dorfbewohner. Die Quoten zählen Wolfssiege. Die vier Modelle entsprechen dem Jägervergleich für sechs Spieler. Sie verwenden verschiedene Annahmen über Abstimmungen, Trankeinsatz, öffentliches Wissen und den ersten Wolfsangriff.

### Grundbesetzung und einzelne Sonderrollen

| Einzelwahl | Zufällige Abstimmung | Vorsichtige Runde | Glaubwürdige Hinweise | Hinweise und Jagd ab Nacht eins |
| --- | ---: | ---: | ---: | ---: |
| Grundbesetzung | 57,38 % | 63,93 % | 32,68 % | 45,10 % |
| Dorftrottel | 55,15 % | 60,63 % | 30,55 % | 42,63 % |
| Leibwächter mit Abwehr | 56,24 % | 63,80 % | 31,81 % | 42,93 % |
| Leibwächter mit Selbstopfer | 57,47 % | 63,27 % | 31,27 % | 43,11 % |
| Hexe | 48,46 % | 56,12 % | 24,05 % | 34,67 % |
| Jäger | 49,23 % | 53,53 % | 31,04 % | 41,65 % |
| Amor | 47,53 % | 50,26 % | 30,01 % | 39,75 % |
| Alte Vettel | 60,12 % | 62,88 % | 35,44 % | 46,82 % |
| Bürgermeister mit doppelter Stimme | 59,24 % | 63,15 % | 32,51 % | 45,06 % |
| Bürgermeister mit Hammer | 53,76 % | 56,99 % | 30,97 % | 42,50 % |
| Harter Bursche | 56,54 % | 63,99 % | 31,85 % | 43,95 % |
| Seher-Lehrling | 57,38 % | 62,30 % | 27,58 % | 38,63 % |
| Paranormaler Ermittler | 57,38 % | 61,72 % | 31,11 % | 43,81 % |
| Gerber bei jedem Ausscheiden | 57,38 % | 64,40 % | 32,73 % | 45,51 % |
| Gerber nur bei Rauswahl | 57,38 % | 64,40 % | 32,73 % | 45,51 % |
| Schutzamulett | 59,46 % | 65,49 % | 30,94 % | 41,19 % |

### Fünfte Sonderrolle oder Amulett mit der vollen Sechser-Aufstellung

Hexe, Jäger, Dorftrottel und Leibwächter mit Abwehr belegen vier Plätze. Der letzte Platz geht bei einer zusätzlichen Sonderrolle an die gewählte Rolle. Das Schutzamulett belegt keinen Platz. Der Leibwächter mit Selbstopfer wurde im Einzelvergleich geprüft. In diesem Paketvergleich bleibt seine Variante auf Abwehr.

| Zusätzlich auf dem siebten Platz | Zufällige Abstimmung | Vorsichtige Runde | Glaubwürdige Hinweise | Hinweise und Jagd ab Nacht eins |
| --- | ---: | ---: | ---: | ---: |
| Keine zusätzliche Rolle | 39,29 % | 45,50 % | 20,39 % | 27,22 % |
| Amor | 30,54 % | 35,04 % | 19,47 % | 24,67 % |
| Alte Vettel | 39,84 % | 44,65 % | 21,48 % | 28,58 % |
| Bürgermeister mit doppelter Stimme | 39,76 % | 45,25 % | 20,16 % | 27,40 % |
| Bürgermeister mit Hammer | 35,81 % | 40,88 % | 19,36 % | 26,73 % |
| Harter Bursche | 38,48 % | 44,28 % | 19,45 % | 25,84 % |
| Seher-Lehrling | 39,29 % | 43,63 % | 16,53 % | 23,38 % |
| Paranormaler Ermittler | 39,29 % | 43,46 % | 18,92 % | 26,13 % |
| Gerber bei jedem Ausscheiden | 39,29 % | 45,91 % | 20,59 % | 27,39 % |
| Gerber nur bei Rauswahl | 39,29 % | 45,91 % | 20,59 % | 27,39 % |
| Schutzamulett | 43,54 % | 48,39 % | 20,52 % | 25,29 % |

### Empfehlung für die Freigabe

- **Amor** eröffnete im damaligen Modell eine Partie mit möglichem eigenem Sieg des Liebespaars. Neben der vollen Sechser-Aufstellung sinkt die Wolfsquote in allen vier Modellen. Das Liebespaar gewinnt dort in 1,30 bis 2,54 Prozent der Partien.
- **Harter Bursche** ergänzt die Auswahl um eine passive Sonderrolle. Seine zusätzliche Nacht lässt sich gut abwickeln. Im Paketvergleich liegt die Wolfsquote in allen vier Modellen leicht unter der Aufstellung mit gewöhnlichem Dorfbewohner.
- **Gerber** ist eine weitere mögliche Wahl für Gruppen, die ein persönliches Ziel möchten. Er verändert die Wolfsquote kaum. In der vollen Aufstellung gewinnt er persönlich in 36,20 bis 60,47 Prozent der Partien bei beliebigem Ausscheiden und in 10,93 bis 25,38 Prozent bei Rauswahl. Sein simuliertes Abstimmungsverhalten bleibt in beiden Varianten gleich.
- **Ermittler** und **Seher-Lehrling** bringen in den Modellen mit verwerteten Hinweisen zusätzliche Informationen. Bei glaubwürdigen Hinweisen sinkt die Wolfsquote im vollständigen Paket mit dem Lehrling von 20,39 auf 16,53 Prozent. Für die erste Freigabe bei sieben Spielern bietet Amor oder der Harte Bursche mehr Auswahl mit weniger zusätzlicher Information.
- **Alte Vettel**, **Bürgermeister** und **Schutzamulett** würde ich zunächst größeren Runden vorbehalten. Das Amulett verlängert das vollständige Paket im vorsichtigen Modell von durchschnittlich Nacht 4,10 auf 4,99. Der Effekt auf die Wolfsquote wechselt mit dem Modell. Beide Bürgermeister-Varianten und die Alte Vettel wurden geprüft.
- **Trunkenbold** und **Magier** bleiben wegen ihrer Voraussetzungen ausgeschlossen. Mit sieben Spielern ist ein Werwolf vorgesehen und der Magier ist ab elf Spielern zulässig.

Die beiden Einzeltabellen beziehen sich auf jeweils eine Ergänzung. Falsche Rollenbehauptungen sind in den Modellen ausgeklammert. Die vollständigen Kombinationen der vorgeschlagenen Auswahl wurden im folgenden Vergleich geprüft.

### Vollständiger Vergleich der sechs vorgeschlagenen Sonderrollen

Die Auswahl umfasst **Hexe, Jäger, Dorftrottel, Leibwächter, Amor und Harter Bursche**. Alle 63 zulässigen Teilmengen mit null bis fünf Sonderrollen wurden geprüft. In 31 dieser Teilmengen ist der Leibwächter dabei. Mit Abwehr und Selbstopfer getrennt ergibt das 94 Fälle. Jede Variante lief mit denselben 10.000 Zufallsstarts in jedem der vier Modelle, insgesamt **3.760.000 Partien**. Alle Partien sind vollständig durchgelaufen. Der Test prüft außerdem, dass die gleichzeitige Auswahl aller sechs Sonderrollen wegen des fehlenden Platzes abgewiesen wird.

| Optionale Rollen in der Partie | Fälle | Zufällige Abstimmung | Vorsichtige Runde | Glaubwürdige Hinweise | Hinweise und Jagd ab Nacht eins |
| --- | ---: | ---: | ---: | ---: | ---: |
| 0 | 1 | 57,38 % | 63,93 % | 32,68 % | 45,10 % |
| 1 | 7 | 47,53 % bis 57,47 % | 50,26 % bis 63,99 % | 24,05 % bis 31,85 % | 34,67 % bis 43,95 % |
| 2 | 20 | 36,37 % bis 56,58 % | 40,16 % bis 62,93 % | 22,42 % bis 31,10 % | 30,94 % bis 42,19 % |
| 3 | 30 | 31,27 % bis 54,91 % | 36,22 % bis 59,66 % | 20,71 % bis 29,42 % | 27,63 % bis 40,36 % |
| 4 | 25 | 30,52 % bis 46,44 % | 35,23 % bis 52,75 % | 19,34 % bis 28,15 % | 25,42 % bis 37,17 % |
| 5 | 11 | 29,85 % bis 39,05 % | 34,34 % bis 44,70 % | 18,14 % bis 24,45 % | 24,19 % bis 31,32 % |

Die Bandbreiten zeigen den niedrigsten und höchsten Anteil an Wolfssiegen pro Modell und Anzahl gewählter Sonderrollen. Die elf Fälle ohne gewöhnliche Dorfbewohner umfassen sechs mögliche Kartenauswahlen und die beiden Leibwächter-Varianten, wo die Rolle dabei ist. In der vorsichtigen Runde liegen die Wolfsquoten für diese Fälle bei 34,34 bis 44,70 Prozent. Die geprüfte Auswahl ist im Konfigurationsplan für sieben Spieler festgelegt.

## Prüfung der Aufstellungen für acht Spieler

Der ursprüngliche Vergleich umfasste **57 Aufstellungen und 2.280.000 simulierte Partien** mit einem oder zwei Werwölfen. Pro Aufstellung liefen vier Entscheidungsmodelle mit je 10.000 Zufallsstarts. Spielbar ist die Achterrunde mit genau einem Werwolf und einer Seherin. Sechs Plätze bleiben für optionale Rollen oder gewöhnliche Dorfbewohner. Die Tabellen enthalten weiterhin die damaligen Vergleichswerte für zwei Wölfe. Der aktuelle Test prüft Aufstellungen mit einem Wolf in allen vier Modellen.

### Grundbesetzung und einzelne Sonderrollen

| Auswahl | Vorsichtige Runde, 1 Wolf | Vorsichtige Runde, 2 Wölfe | Glaubwürdige Hinweise, 1 Wolf | Glaubwürdige Hinweise, 2 Wölfe |
| --- | ---: | ---: | ---: | ---: |
| Grundbesetzung | 60,72 % | 90,52 % | 29,87 % | 62,15 % |
| Dorftrottel | 57,48 % | 87,66 % | 27,47 % | 57,98 % |
| Leibwächter mit Abwehr | 60,34 % | 90,30 % | 29,05 % | 59,92 % |
| Leibwächter mit Selbstopfer | 59,97 % | 90,14 % | 28,42 % | 60,10 % |
| Hexe | 53,27 % | 85,62 % | 22,30 % | 50,45 % |
| Jäger | 52,18 % | 84,56 % | 29,04 % | 60,40 % |
| Amor | 50,17 % | 83,35 % | 29,34 % | 60,09 % |
| Alte Vettel | 60,50 % | 91,61 % | 30,99 % | 66,29 % |
| Bürgermeister mit doppelter Stimme | 60,75 % | 90,98 % | 29,74 % | 62,26 % |
| Bürgermeister mit Hammer | 55,89 % | 86,92 % | 28,47 % | 60,35 % |
| Harter Bursche | 60,20 % | 90,32 % | 29,40 % | 61,03 % |
| Seher-Lehrling | 58,63 % | 89,81 % | 23,74 % | 57,22 % |
| Paranormaler Ermittler | 58,42 % | 89,61 % | 28,67 % | 61,39 % |
| Gerber bei jedem Ausscheiden | 61,01 % | 90,63 % | 29,94 % | 62,30 % |
| Gerber nur bei Rauswahl | 61,01 % | 90,63 % | 29,94 % | 62,30 % |
| Schutzamulett | 62,35 % | 91,29 % | 28,80 % | 60,00 % |
| Trunkenbold | – | 90,28 % | – | 64,07 % |

### Ergänzungen zu Hexe, Jäger, Dorftrottel und Leibwächter mit Abwehr

| Auswahl | Vorsichtige Runde, 1 Wolf | Vorsichtige Runde, 2 Wölfe | Glaubwürdige Hinweise, 1 Wolf | Glaubwürdige Hinweise, 2 Wölfe |
| --- | ---: | ---: | ---: | ---: |
| Keine Ergänzung | 43,96 % | 77,11 % | 19,44 % | 44,81 % |
| Amor | 35,32 % | 66,71 % | 19,14 % | 42,18 % |
| Alte Vettel | 43,63 % | 77,00 % | 20,75 % | 46,64 % |
| Bürgermeister mit doppelter Stimme | 43,54 % | 76,18 % | 20,01 % | 44,01 % |
| Bürgermeister mit Hammer | 39,79 % | 70,97 % | 18,87 % | 42,48 % |
| Harter Bursche | 42,90 % | 75,95 % | 18,75 % | 43,71 % |
| Seher-Lehrling | 42,11 % | 74,97 % | 15,24 % | 39,85 % |
| Paranormaler Ermittler | 42,38 % | 75,72 % | 18,08 % | 43,86 % |
| Gerber bei jedem Ausscheiden | 44,28 % | 77,34 % | 19,50 % | 45,04 % |
| Gerber nur bei Rauswahl | 44,28 % | 77,34 % | 19,50 % | 45,04 % |
| Schutzamulett | 47,41 % | 78,36 % | 19,73 % | 42,47 % |
| Amor und Harter Bursche | 34,82 % | – | 17,93 % | – |
| Trunkenbold | – | 77,74 % | – | 48,34 % |

### Empfehlung für acht Spieler

- **Ein Werwolf** ist für acht Spieler festgelegt. Zwei Wölfe erreichten in der Grundbesetzung 90,52 Prozent im vorsichtigen Modell und 62,15 Prozent im Modell mit glaubwürdigen Hinweisen. Mit Hexe, Jäger, Dorftrottel und Leibwächter mit Abwehr lagen sie bei 77,11 beziehungsweise 44,81 Prozent. Diese Werte stammen aus dem früheren Vergleich.
- **Gerber** lässt sich als Option für ein persönliches Ziel anbieten. Seine Anwesenheit verändert die Wolfssiegquote in den Einzel- und Paketvergleichen kaum.
- **Seher-Lehrling** ist nach dem gezielten Vergleich mit einem Wolf ebenfalls eine Empfehlung für die optionale Auswahl.
- **Trunkenbold** ist ab neun Spielern verfügbar. In der früheren Achter-Simulation mit zwei Wölfen stieg die Wolfsquote mit Trunkenbold in der vollen Vergleichsbesetzung mit glaubwürdigen Hinweisen von 44,81 auf 48,34 Prozent. Mit Trunkenbold lässt das Modell das Ausschlussverfahren für den Dorftrottel aus, weil seine Pflichtstimme vor der Enthüllung aussetzen kann. Falsche Rollenbehauptungen und Nachtgeräusche werden nicht simuliert.
- **Schutzamulett** würde ich größeren Runden überlassen. Im vorsichtigen Modell verlängerte es die Vergleichsbesetzung von durchschnittlich Nacht 4,57 auf 5,45 bei einem Wolf und von 5,00 auf 5,91 bei zwei Wölfen. **Alte Vettel**, **Bürgermeister** und **Paranormaler Ermittler** bleiben weitere Kandidaten für die nächste Gruppengröße. Der **Magier** setzt elf Spieler voraus.

Die anschließende Kombinationsprüfung deckt die acht festgelegten Optionen vollständig ab.

### Gerber und Seher-Lehrling bei acht Spielern

Vier Besetzungen mit je einem Werwolf und einer Seherin liefen jeweils ohne die beiden Rollen, mit je einer davon und mit beiden zusammen. Beim Gerber wurden beide persönlichen Siegbedingungen geprüft. Das ergibt 24 Aufstellungen mit vier Modellen und jeweils 10.000 Zufallsstarts, insgesamt **960.000 Partien**.

Die Tabelle zeigt die Wolfssiegquote im Modell mit glaubwürdigen Hinweisen.

| Weitere Sonderrollen | Ohne beide | Seher-Lehrling | Gerber | Beide |
| --- | ---: | ---: | ---: | ---: |
| Keine | 29,87 % | 23,74 % | 29,94 % | 23,94 % |
| Hexe, Jäger, Dorftrottel und Leibwächter | 19,44 % | 15,24 % | 19,50 % | 15,62 % |
| Hexe, Jäger, Dorftrottel und Dorfmatratze | 19,14 % | 15,32 % | 19,11 % | 15,46 % |
| Hexe, Jäger, Amor und Harter Bursche | 18,61 % | 16,59 % | 18,75 % | 16,74 % |

Der Seher-Lehrling senkt die Wolfsquote in diesem Modell um 2,02 bis 6,13 Prozentpunkte. Bei zufälliger Abstimmung waren die Ergebnisse mit und ohne Lehrling in allen vier Besetzungen gleich. Der Gerber beeinflusst die Wolfsquote in allen Modellen um höchstens 0,45 Prozentpunkte. Je nach Besetzung und Modell gewinnt er persönlich in 36,56 bis 72,09 Prozent der Partien bei jedem Ausscheiden und in 9,80 bis 27,64 Prozent bei Rauswahl. Beide Gerber-Varianten verwenden dieselben simulierten Entscheidungen.

Beide Rollen können als Optionen angeboten werden, auch gemeinsam, wenn zwei Rollenplätze frei sind. Die Kombinationsprüfung umfasst beide Rollen.

### Vollständige Kombinationsprüfung für acht Spieler

Von den acht Sonderrollen-Optionen lassen sich 247 Teilmengen mit null bis sechs Optionen auswählen. Mit Leibwächter und Dorfmatratze getrennt und beiden Gerber-Siegbedingungen ergibt das 544 Aufstellungen. Pro Aufstellung liefen 2.000 Zufallsstarts in vier Modellen, insgesamt **4.352.000 vollständige Partien**. Weitere 145 Rollenauswahlen wurden abgewiesen, weil sie mehr als sechs Sonderrollen oder gleichzeitig Leibwächter und Dorfmatratze enthielten.

| Sonderrollen | Aufstellungen | Zufällige Abstimmung | Vorsichtige Runde | Glaubwürdige Hinweise | Hinweise und Jagd ab Nacht eins |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 0 | 1 | 56,35 % | 59,20 % | 31,25 % | 40,60 % |
| 1 | 10 | 45,50–56,35 % | 49,25–59,05 % | 23,35–31,10 % | 32,20–41,20 % |
| 2 | 43 | 37,40–56,35 % | 40,60–59,20 % | 17,95–31,15 % | 25,15–39,75 % |
| 3 | 104 | 33,00–55,20 % | 36,25–58,35 % | 15,30–30,55 % | 20,75–38,65 % |
| 4 | 155 | 31,80–53,50 % | 34,10–56,20 % | 14,75–29,20 % | 20,00–37,30 % |
| 5 | 146 | 30,75–50,65 % | 32,75–53,40 % | 14,25–29,40 % | 19,70–35,65 % |
| 6 | 85 | 30,25–42,80 % | 32,90–48,15 % | 14,75–25,15 % | 18,80–31,10 % |

Die Bandbreiten zeigen die niedrigste und höchste Wolfssiegquote je Anzahl gewählter Sonderrollen im jeweiligen Modell. Alle 85 Aufstellungen mit sechs Sonderrollen kamen ohne gewöhnliche Dorfbewohner aus. In allen vier Modellen lag ihre Wolfssiegquote unter der Grundaufstellung mit sechs gewöhnlichen Dorfbewohnern. Die Quoten gelten für die simulierten Entscheidungen.

## Prüfung der Aufstellungen für neun Spieler

Zwei Werwölfe und eine Seherin belegen drei Plätze. Es bleiben bis zu sechs Plätze für Sonderrollen. Der erste Vergleich prüft die bisherigen Rollen einzeln sowie verschiedene Kombinationen aus Bürgermeister mit doppelter Stimme, Paranormalem Ermittler, Alter Vettel mit und ohne Selbstwahl und Trunkenbold. Das Schutzamulett lief zum Vergleich in vier Grundbesetzungen. Pro Aufstellung und Modell liefen 3.000 Zufallsstarts. Der damalige Einzelvergleich mit Amor verwendet noch die frühere Siegprüfung. 15 Einzelvergleiche und je 25 Varianten der vier Grundbesetzungen ergeben in vier Modellen insgesamt **1.380.000 Partien**. [Ergebnisse je Aufstellung](simulations/werewolf-nine-player.jsonl)

Die Tabelle zeigt die Wolfssiegquote im Modell mit glaubwürdigen Hinweisen. Jede Zusatzspalte ergänzt die jeweilige Grundbesetzung um genau eine Option.

| Weitere Sonderrollen | Ohne Zusatz | Bürgermeister | Ermittler | Alte Vettel ohne Selbstwahl | Trunkenbold | Schutzamulett |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Keine | 56,03 % | 55,93 % | 54,47 % | 58,97 % | 57,57 % | 53,97 % |
| Hexe, Jäger, Dorftrottel | 43,23 % | 43,30 % | 41,20 % | 46,50 % | 46,97 % | 42,03 % |
| Hexe, Leibwächter, Seher-Lehrling | 36,03 % | 36,40 % | 34,63 % | 39,53 % | 40,00 % | 31,90 % |
| Hexe, Dorfmatratze, Seher-Lehrling | 34,60 % | 34,50 % | 33,33 % | 37,07 % | 37,17 % | 29,03 % |

- **Bürgermeister mit doppelter Stimme** ist für neun Spieler als Option bestätigt. Im Einzelvergleich verändert er die Wolfsquote um −1,40 bis +1,77 Prozentpunkte.
- **Paranormaler Ermittler** bleibt bei neun Spielern außerhalb der optionalen Auswahl. Ab zehn Spielern ist er nach dem Zehnervergleich als Option bestätigt. In allen geprüften Varianten spielt die Seherin mit. Vergleicht man archivierte Besetzungen paarweise mit und ohne Ermittler, verändert sich die Wolfsquote ohne Lehrling um −2,63 bis +1,33 Prozentpunkte und mit Lehrling um −2,57 bis +0,90 Prozentpunkte. Der mögliche Vorteil koordinierter Hinweise im echten Spiel bleibt offen.
- **Alte Vettel** ist für neun Spieler als Option bestätigt. Mit erlaubter Selbstwahl steigt die Wolfsquote in den geprüften Einzelergänzungen um 0,37 bis 4,60 Prozentpunkte. Die Standardeinstellung bleibt Selbstwahl aus. Die Simulation wählt das Stummziel zufällig unter den erlaubten Personen.
- **Trunkenbold** ist mit zwei Wölfen verfügbar. Die gepaarten Vergleiche liegen bei −0,53 bis +4,60 Prozentpunkten. Das Modell setzt mit Trunkenbold die Erkennung des Dorftrottels anhand der Pflichtstimme aus.
- **Schutzamulett** erreicht in den vier Besetzungen je nach Modell durchschnittlich 0,54 bis 1,30 Nächte mehr. Für neun Spieler bleibt es zunächst bei der vorgesehenen Freigabe ab zehn.

Die vollständige Kombinationsprüfung steht weiter unten. Die Einzelwerte aus dem ersten Vergleich bleiben für spätere Vergleiche verfügbar.

### Bürgermeister mit Hammer bei neun Spielern

Der Hammer lief in denselben vier Besetzungen und vier Modellen, jeweils mit und ohne Trunkenbold. Damit kamen 96.000 Partien hinzu. Die doppelte Stimme wurde anhand der archivierten Ergebnisse mit denselben 3.000 Zufallsstarts verglichen. [Einzelwerte zum Hammer](simulations/werewolf-nine-player-hammer.jsonl)

Gegenüber der doppelten Stimme änderte der Hammer die Wolfssiegquote je nach Modell und Besetzung um −5,67 bis +0,23 Prozentpunkte. In der Grundbesetzung mit Bürgermeister und ohne Trunkenbold lag sie im Modell mit glaubwürdigen Hinweisen bei 54,57 Prozent mit Hammer und bei 55,93 Prozent mit doppelter Stimme. Die Simulation setzt den verfügbaren Hammer pro Nacht mit 40 Prozent Wahrscheinlichkeit auf ein zufälliges gültiges Ziel ein. Wer aus der Diskussion Verdacht schöpft und auf einen späteren Einsatz wartet, kann andere Ergebnisse erzielen.

Für neun Spieler bleibt die doppelte Stimme die Empfehlung. Der Hammer kann bei neun Spielern bereits durchgespielt werden. Ab zehn Spielern wurde der Hammer nach dem Zehnervergleich als Option bestätigt.

### Magier als Alternative zur Hexe bei neun Spielern

In einer separaten Testkopie wurde die Mindestgröße für den Magier auf neun gesenkt. Zwei Werwölfe und eine Seherin blieben gesetzt. Die gemeinsame Auswahl von Hexe und Magier wurde auch in der Testkopie abgewiesen. Die 168.000 zusätzlichen Partien vergleichen den Magier mit den archivierten Hexenwerten aus denselben Besetzungen und Zufallsstarts. [Einzelwerte zum Magier](simulations/werewolf-nine-player-magician.jsonl)

| Weitere Sonderrollen | Hexe | Magier mit flexiblen Zaubern | Magier mit Heilung als Strategie |
| --- | ---: | ---: | ---: |
| Keine | 45,77 % | 41,03 % | 40,90 % |
| Jäger und Dorftrottel | 43,23 % | 38,40 % | 38,37 % |
| Leibwächter und Seher-Lehrling | 36,03 % | 30,20 % | 30,10 % |
| Dorfmatratze und Seher-Lehrling | 34,60 % | 28,43 % | 28,37 % |

Die Tabelle zeigt Wolfssiege im Modell mit glaubwürdigen Hinweisen ohne Trunkenbold. Mit Trunkenbold wurden die drei Besetzungen mit weiteren Sonderrollen ebenfalls geprüft. Über alle vier Modelle veränderte der flexible Magier die Wolfsquote um −9,33 bis +1,83 Prozentpunkte. Der ausschließlich heilende Magier veränderte sie um −9,37 bis +4,87 Prozentpunkte. Der flexible Magier darf in der Simulation höchstens einen Todeszauber in einer Nacht einsetzen. Die reguläre Spiellogik erlaubt auch zwei Todeszauber mit verschiedenen Zielen.

Die Ergebnisse sprechen dafür, den Magier ab neun als Alternative zur Hexe anzubieten. In einer Besetzung mit Seher-Lehrling und Schutzrolle kann diese Wahl die Wölfe stärker unter Druck setzen. Die bestätigte Freigabe beginnt bei elf Spielern.

### Vollständige Kombinationsprüfung für neun Spieler

Aus den zehn bestätigten Sonderrollen-Optionen wurden alle Besetzungen mit null bis sechs Sonderrollen geprüft. Leibwächter und Dorfmatratze, beide Gerber-Siegbedingungen, beide Einstellungen zur Selbstwahl der Alten Vettel sowie Partien mit und ohne Trunkenbold wurden getrennt erfasst. Das ergibt **5.094 Varianten**. Mit 250 Zufallsstarts in vier Modellen liefen **5.094.000 vollständige Partien**. 818 überfüllte oder widersprüchliche Auswahlen wurden abgewiesen. [Archiv mit Einzelwerten](simulations/werewolf-nine-player-combinations.jsonl.gz)

| Sonderrollen | Varianten | Zufällige Abstimmung | Vorsichtige Runde | Glaubwürdige Hinweise | Hinweise und Jagd ab Nacht eins |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 0 | 2 | 83,6–84,8 % | 90,0–90,8 % | 61,6–63,6 % | 74,8–76,4 % |
| 1 | 26 | 72,4–88,0 % | 82,0–91,2 % | 50,4–68,0 % | 61,6–76,0 % |
| 2 | 150 | 66,0–87,6 % | 77,6–92,0 % | 43,2–68,4 % | 54,4–78,8 % |
| 3 | 506 | 61,2–90,8 % | 73,2–92,8 % | 38,8–68,0 % | 48,4–77,6 % |
| 4 | 1.106 | 57,6–88,0 % | 70,4–92,0 % | 34,8–67,2 % | 44,0–76,4 % |
| 5 | 1.638 | 57,6–86,0 % | 67,6–90,8 % | 34,8–67,6 % | 40,8–76,0 % |
| 6 | 1.666 | 55,6–84,0 % | 66,0–90,8 % | 30,8–65,2 % | 40,4–72,4 % |

Die Bandbreiten zeigen die niedrigste und höchste Wolfssiegquote je Anzahl an Sonderrollen im jeweiligen Modell. Für kleine Unterschiede zwischen zwei Aufstellungen sind die gezielten Vergleiche mit 3.000 Zufallsstarts je Modell aussagekräftiger.

Gleichstand und Überzahl führen zum Wolfssieg, auch bei zwei verliebten Überlebenden. Für das Archiv wurden die 2.170.000 Neunerpartien mit Amor nach dieser Änderung erneut simuliert. Die Aufstellungen ohne Amor behalten ihre gespeicherten Ergebnisse.

## Prüfung der Aufstellungen für zehn Spieler

Zwei Werwölfe und eine Seherin sind fest. Es bleiben sieben Plätze für Sonderrollen. Vier Ausgangsbesetzungen wurden mit den drei Bürgermeister-Einstellungen (aus, doppelte Stimme, Hammer) und allen Kombinationen aus Ermittler, Schutzamulett und Trunkenbold verglichen. 96 Varianten mit je 3.000 Zufallsstarts in fünf Modellen ergeben **1.440.000 Partien**. Es gilt die aktuelle Siegprüfung mit Wolfssieg bei Gleichstand. [Einzelwerte je Aufstellung](simulations/werewolf-ten-player.jsonl)

Die Tabelle zeigt Wolfssiege im Modell, das Ermittler- und Seherhinweise kombiniert. Jede Zusatzspalte ändert gegenüber der Ausgangsbesetzung nur die genannte Option.

| Weitere Sonderrollen | Ohne Zusatz | Doppelte Stimme | Hammer | Ermittler | Schutzamulett |
| --- | ---: | ---: | ---: | ---: | ---: |
| Keine | 54,40 % | 55,07 % | 52,20 % | 49,27 % | 52,67 % |
| Hexe, Jäger und Dorftrottel | 41,13 % | 41,13 % | 39,80 % | 36,30 % | 40,57 % |
| Hexe, Leibwächter und Seher-Lehrling | 34,23 % | 34,17 % | 32,37 % | 28,67 % | 30,10 % |
| Hexe, Dorfmatratze, Seher-Lehrling, Amor und Harter Bursche | 34,20 % | 34,07 % | 34,87 % | 30,60 % | 30,90 % |

- **Bürgermeister mit Hammer** ist ab zehn Spielern als Option bestätigt. Über alle gepaarten Vergleiche ändert sich die Wolfsquote gegenüber der doppelten Stimme um −5,30 bis +1,50 Prozentpunkte. Die durchschnittlich erreichte Nacht sinkt um 0,27 bis 0,63. Pro Partie bleibt genau eine Bürgermeister-Variante wählbar.
- **Paranormaler Ermittler** ist ab zehn Spielern als optionale Rolle bestätigt. Im Modell mit kombinierten Hinweisen sinkt die Wolfsquote je nach Aufstellung um 2,73 bis 5,73 Prozentpunkte. Mit Seher-Lehrling liegt der Rückgang bei 3,03 bis 5,57 Punkten. Das Modell wertet einen positiven Hinweis bei zwei bereits entlasteten Personen als Bestätigung der dritten Person, sofern alle drei noch leben. Der lebende Ermittler teilt seinen Hinweis mit 45 Prozent Wahrscheinlichkeit pro Tag. Der Bürgermeister bevorzugt in diesem Modell beim Hammereinsatz einen öffentlich bestätigten Wolf, wenn einer als Ziel verfügbar ist.
- **Schutzamulett** bleibt als zusätzliche Option vorgesehen. Mit ihm liegt die durchschnittlich erreichte Nacht um 0,42 bis 1,04 höher. Die Wolfssiegquote verändert sich je nach Aufstellung und Modell um −6,03 bis +6,43 Prozentpunkte.

Der Vergleich prüft die Kombinationen dieser Einstellungen auf vier Ausgangsbesetzungen. Die vollständige Prüfung folgt im nächsten Abschnitt.

### Vollständige Kombinationsprüfung für zehn Spieler

Zwei Werwölfe und eine Seherin sind gesetzt. Von den elf Sonderrollen-Optionen können bis zu sieben gewählt werden. Leibwächter und Dorfmatratze schließen sich aus. Für den Bürgermeister werden doppelte Stimme und Hammer getrennt geprüft. Beim Gerber sind beide Siegbedingungen, bei der Alten Vettel beide Einstellungen zur Selbstwahl abgedeckt. Schutzamulett und Trunkenbold wurden jeweils einzeln und gemeinsam aktiviert. Die Rollenaufdeckung entspricht der Standardeinstellung.

Es gibt 2.664 zulässige Rollenauswahlen. Zusammen mit den Einstellungen ergeben sich **32.864 Varianten**. Alle Varianten liefen mit 40 gleichen Zufallsstarts in fünf Entscheidungsmodellen bis zum Spielende. Das sind **6.572.800 Partien**. Weitere 1.432 Auswahlen wies die Spiellogik wegen Überbelegung oder gleichzeitiger Auswahl von Leibwächter und Dorfmatratze ab. [Komprimiertes Archiv mit Einzelwerten](simulations/werewolf-ten-player-combinations.jsonl.gz)

| Gewählte Sonderrollen | Varianten einschließlich Einstellungen |
| ---: | ---: |
| 0 | 4 |
| 1 | 60 |
| 2 | 404 |
| 3 | 1.612 |
| 4 | 4.236 |
| 5 | 7.700 |
| 6 | 9.884 |
| 7 | 8.964 |

Der Volltest deckt jede erlaubte Aufstellung ab. Die gezielten Zehner-Vergleiche mit 3.000 Zufallsstarts je Aufstellung und Modell liefern genauere Anhaltspunkte für kleine Unterschiede in den Siegquoten.

## Magier mit und ohne Hexe bei elf Spielern

In einer separaten Testkopie wurden **zwei Werwölfe, eine Seherin und bis zu acht Sonderrollen** gespielt. Bei gemeinsamer Besetzung handelt die Hexe zuerst. Der Magier erfährt anschließend, ob das Wolfsopfer noch geheilt werden kann. Gift und Todeszauber werden gemeinsam am Morgen abgewickelt. Zwei gezielte Tests prüfen die Weitergabe des Wolfsopfers und die gemeinsame Auflösung der Todesursachen.

Der Volltest deckt **18.336 Varianten mit Magier ohne Hexe** und **14.528 Varianten mit beiden Rollen** ab. Dazu kommen 18.336 passende Besetzungen mit Hexe allein und eine Kontrollbesetzung ohne beide. Die bereits freigegebenen Rollen und ihre Varianten sowie Schutzamulett und Trunkenbold sind in der Kombination enthalten. 24 gemeinsame Zufallsstarts in fünf Modellen ergeben **6.144.120 Partien**. Dazu kommen 360.000 gezielte Vergleichspartien mit 3.000 Starts je Besetzung und Modell. [Archiv mit Einzelwerten](simulations/werewolf-eleven-player-magician.jsonl.gz)

Die Tabelle zeigt die mittlere Änderung der Wolfssiegquote in Prozentpunkten gegenüber den passenden Aufstellungen mit Hexe allein. Jede getestete Variante zählt gleich viel.

| Entscheidungsmodell | Magier statt Hexe | Magier zusätzlich zur Hexe |
| --- | ---: | ---: |
| Zufällige Abstimmung | +1,38 | −12,58 |
| Vorsichtige Runde | +0,83 | −8,43 |
| Glaubwürdige Hinweise | −9,16 | −13,74 |
| Hinweise und Jagd ab Nacht eins | −9,21 | −18,13 |
| Kombinierte Seher- und Ermittlerhinweise | −9,18 | −15,61 |

In den 20 gezielten Paarvergleichen war die Wolfssiegquote mit beiden Rollen **3,43 bis 20,50 Prozentpunkte** niedriger als mit der Hexe allein. Mit ausschließlich heilendem Magier lag der Rückgang bei 2,20 bis 20,57 Punkten. In der flexiblen Strategie heilt der Magier nach demselben Entscheidungsmuster wie die Hexe und nutzt bei ausreichendem Vorrat höchstens einen Todeszauber pro Nacht. Gleichzeitige zwei Todeszauber wurden im Entscheidungsmodell nicht simuliert.

**Bestätigte Regel für elf Spieler.** Magier und Hexe teilen sich eine Option. Der Magier stärkt das Dorf in den Modellen mit geteilten Hinweisen, während die Kombination beider Rollen die Wölfe in allen fünf Modellen deutlich stärker unter Druck setzt. Die reguläre Spiellogik erlaubt den Magier ab elf Spielern. Die gemeinsame Besetzung wurde für diesen Vergleich in der Testkopie erprobt.

## Prüfung der Aufstellungen für zwölf Spieler

Drei Werwölfe und eine Seherin sind gesetzt. Damit bleiben acht Rollenplätze. Vier Ausgangsbesetzungen wurden mit drei Optionen für Hexe und Magier (keiner, Hexe, Magier), drei Bürgermeister-Einstellungen (aus, doppelte Stimme, Hammer) und allen Kombinationen aus Schutzamulett und Trunkenbold geprüft. Zusammen ergeben sich 144 Varianten. Fünf Modelle mit je 2.000 Zufallsstarts pro Variante ergeben **1.440.000 vollständige Partien**. [Archiv mit Einzelwerten](simulations/werewolf-twelve-player.jsonl)

Die Tabelle zeigt die Wolfssiegquote im Modell mit kombinierten Seher- und Ermittlerhinweisen, sofern die jeweiligen Rollen besetzt sind. Bürgermeister, Schutzamulett und Trunkenbold sind in diesen Vergleichsspalten ausgeschaltet.

| Weitere Sonderrollen | Ohne Hexe und Magier | Hexe | Magier |
| --- | ---: | ---: | ---: |
| Keine | 69,05 % | 62,20 % | 50,95 % |
| Jäger, Leibwächter, Seher-Lehrling und Ermittler | 57,20 % | 48,25 % | 36,55 % |
| Jäger, Leibwächter, Gerber, Alte Vettel und Ermittler | 66,95 % | 58,60 % | 47,20 % |
| Jäger, Dorftrottel, Dorfmatratze, Amor, Harter Bursche und Alte Vettel | 66,90 % | 56,75 % | 48,90 % |

- **Magier statt Hexe** verändert die Wolfssiegquote im Mittel um +0,28 Punkte bei zufälliger Abstimmung und +0,37 Punkte im vorsichtigen Modell. In den drei Modellen mit geteilten Hinweisen sinkt sie im Mittel um 9,88 bis 10,49 Punkte. Der simulierte Magier nutzt höchstens einen Todeszauber pro Nacht.
- **Hammer statt doppelter Stimme** verändert die Wolfssiegquote je nach Aufstellung und Modell um −5,90 bis +3,20 Prozentpunkte. Mit dem Hammer ist die durchschnittlich erreichte Nacht um 0,25 bis 0,74 niedriger.
- **Schutzamulett** erhöht die durchschnittlich erreichte Nacht um 0,58 bis 1,09. Die Wolfssiegquote verändert sich je nach Aufstellung und Modell um −5,95 bis +4,75 Prozentpunkte. **Trunkenbold** verändert sie um −1,85 bis +3,80 Punkte.

Die bisherigen Optionen passen auch für die Zwölferrunde. Hexe und Magier teilen sich weiterhin einen Rollenplatz. Dieser Vergleich umfasst vier Ausgangsbesetzungen. Die vollständige Prüfung aller erlaubten Rollenauswahlen steht noch aus.

### Vergleich mit zwei Werwölfen bei zwölf Spielern

Dieselben 144 Aufstellungen liefen in einer separaten Testkopie mit zwei Wölfen und einer Seherin. Pro Variante und Modell wurden dieselben 2.000 Zufallsstarts wie im Vergleich mit drei Wölfen verwendet. Die zusätzliche Person erhält eine Dorfrolle. Zusammen sind das **1.440.000 weitere Partien**. Die feste Wolfszahl in der regulären Spiellogik bleibt drei. [Einzelwerte für zwei Wölfe](simulations/werewolf-twelve-player-two-wolves.jsonl)

Die Tabelle zeigt Wolfssiege im Modell mit kombinierten Seher- und Ermittlerhinweisen.

| Weitere Sonderrollen | Keine Heilrolle, 2 / 3 Wölfe | Hexe, 2 / 3 Wölfe | Magier, 2 / 3 Wölfe |
| --- | ---: | ---: | ---: |
| Keine | 46,70 / 69,05 % | 39,70 / 62,20 % | 33,25 / 50,95 % |
| Jäger, Leibwächter, Seher-Lehrling und Ermittler | 34,10 / 57,20 % | 25,15 / 48,25 % | 19,15 / 36,55 % |
| Jäger, Leibwächter, Gerber, Alte Vettel und Ermittler | 43,90 / 66,95 % | 36,45 / 58,60 % | 27,25 / 47,20 % |
| Jäger, Dorftrottel, Dorfmatratze, Amor, Harter Bursche und Alte Vettel | 43,65 / 66,90 % | 37,60 / 56,75 % | 29,35 / 48,90 % |

In allen 720 Modell- und Aufstellungsvergleichen sinkt die Wolfssiegquote mit zwei Wölfen um 10,55 bis 26,90 Prozentpunkte. Die Ergebnisse hängen stark vom Abstimmungsverhalten ab. Im vorsichtigen Modell gewinnt die Grundbesetzung mit zwei Wölfen weiterhin 83,45 Prozent gegenüber 95,60 Prozent mit drei.

Bei wenigen Sonderrollen und verwerteten Hinweisen sind zwei Wölfe eine mögliche Spielvariante. Für die frei kombinierbare Rollenauswahl bleibt die Empfehlung drei, weil starke Dorfbesetzungen mit zwei Wölfen deutlich niedrigere Wolfsquoten erreichen.

### Hexe und Magier gemeinsam bei zwölf Spielern

In einer separaten Testkopie wurden dieselben vier Ausgangsbesetzungen mit Hexe, mit Magier und mit beiden Rollen geprüft. Für den Magier gibt es eine flexible Strategie sowie eine Strategie, die beide Zauber für Heilungen aufspart. Die Hexe handelt zuerst. Hat sie das Wolfsopfer geheilt, ist es für den Magier anschließend als Heilziel ausgeschlossen. Ihr Gift wirkt weiterhin am Morgen. Die flexible Strategie verwendet höchstens einen Todeszauber pro Nacht.

Jede Besetzung läuft mit und ohne Schutzamulett und Trunkenbold sowie mit beiden Bürgermeister-Varianten und ohne Bürgermeister. Bei drei Wölfen wurden überfüllte Aufstellungen übersprungen. Die Vergleiche umfassen **4.720.000 Partien** mit jeweils 2.000 Starts pro Variante und Entscheidungsmodell. [Archiv mit Einzelwerten](simulations/werewolf-twelve-player-healers.jsonl.gz)

Die Tabelle zeigt Wolfssiege im Modell mit kombinierten Seher- und Ermittlerhinweisen. Bürgermeister, Amulett und Trunkenbold sind in diesen Tabellenwerten ausgeschaltet.

| Weitere Sonderrollen | Wölfe | Hexe | Magier | Beide |
| --- | ---: | ---: | ---: | ---: |
| Keine | 2 | 39,70 % | 33,25 % | 24,65 % |
| Keine | 3 | 62,20 % | 50,95 % | 43,10 % |
| Jäger, Leibwächter, Seher-Lehrling und Ermittler | 2 | 25,15 % | 19,15 % | 12,55 % |
| Jäger, Leibwächter, Seher-Lehrling und Ermittler | 3 | 48,25 % | 36,55 % | 27,50 % |
| Jäger, Leibwächter, Gerber, Alte Vettel und Ermittler | 2 | 36,45 % | 27,25 % | 21,15 % |
| Jäger, Leibwächter, Gerber, Alte Vettel und Ermittler | 3 | 58,60 % | 47,20 % | 35,85 % |
| Jäger, Dorftrottel, Dorfmatratze, Amor, Harter Bursche und Alte Vettel | 2 | 37,60 % | 29,35 % | 24,45 % |
| Jäger, Dorftrottel, Dorfmatratze, Amor, Harter Bursche und Alte Vettel | 3 | 56,75 % | 48,90 % | 41,40 % |

**Bestätigte Regel für zwölf Spieler.** Pro Partie ist höchstens eine der beiden Rollen Hexe und Magier wählbar. Bei drei Wölfen und kombinierten Hinweisen senkt ihr gemeinsamer Einsatz die Wolfssiegquote über die geprüften Besetzungen im Mittel um etwa 20 Prozentpunkte gegenüber der Hexe allein. Bei zwei Wölfen sind es etwa 14 Punkte. Die Strategie mit ausschließlich heilendem Magier führt in den Tabellenbesetzungen zu ähnlichen Ergebnissen.

Alle 40 Ergebnisdatensätze wurden vollständig erzeugt. Der Testläufer meldete danach für beide langen Läufe eine überschrittene Zeitgrenze. Unabhängige Prüfungen bestätigten für jede Variante die Zahl vollständig beendeter Partien, die gültige Besetzung und die Ergebnissummen. Zusammen mit den gezielten Tests zur Interaktion von Hexe und Magier bestanden vier nachgelagerte Prüfungen. Für künftige Läufe wurde die Testzeitgrenze erhöht.

## Prüfung der Aufstellungen für dreizehn Spieler

Drei Werwölfe und eine Seherin sind gesetzt. Damit bleiben neun Rollenplätze. Vier Ausgangsbesetzungen wurden mit Hexe allein, Magier allein und beiden gemeinsam geprüft. Für den Magier gab es eine flexible Strategie sowie eine Strategie mit ausschließlich heilenden Zaubern. Hinzu kommen alle Kombinationen aus Bürgermeister (aus, doppelte Stimme oder Hammer), Amulett und Trunkenbold. 244 Varianten mit je 2.000 Zufallsstarts in fünf Modellen ergeben **2.440.000 vollständige Partien**. [Archiv mit Einzelwerten](simulations/werewolf-thirteen-player-healers.jsonl.gz)

Der gemeinsame Einsatz wurde in einer separaten Testkopie erprobt. Dort handelt zuerst die Hexe. Der Magier erhält das verbleibende Wolfsopfer als mögliches Heilziel. Hexengift und Todeszauber werden am Morgen gemeinsam aufgelöst. Die flexible Magierstrategie verwendet höchstens einen Todeszauber in derselben Nacht. Zwei gezielte Tests prüfen das gemeinsame Handeln und die Weitergabe des Wolfsopfers.

Die Tabelle zeigt Wolfssiege im Modell mit kombinierten Seher- und Ermittlerhinweisen. Bürgermeister, Schutzamulett und Trunkenbold sind in den Tabellenwerten ausgeschaltet.

| Weitere Sonderrollen | Hexe | Magier | Beide |
| --- | ---: | ---: | ---: |
| Keine | 57,85 % | 50,05 % | 39,05 % |
| Jäger, Leibwächter, Seher-Lehrling und Ermittler | 44,35 % | 34,55 % | 25,50 % |
| Jäger, Leibwächter, Gerber, Alte Vettel und Ermittler | 54,45 % | 44,70 % | 33,55 % |
| Jäger, Dorftrottel, Dorfmatratze, Amor, Harter Bursche und Alte Vettel | 54,70 % | 44,30 % | 36,90 % |

Gegenüber Hexe allein senkt der gemeinsame Einsatz die Wolfssiegquote über die getesteten Besetzungen und Magierstrategien im Mittel um 3,39 Prozentpunkte bei zufälliger Abstimmung, 5,62 Punkte in der vorsichtigen Runde und 17,58 bis 19,86 Punkte in den Modellen mit geteilten Hinweisen.

**Empfehlung für dreizehn Spieler.** Hexe und Magier bleiben alternative Rollen. Der gemeinsame Einsatz würde vor allem die Dorfbesetzungen mit Schutz- und Informationsrollen weiter verstärken. Die Auswahl mit alternativen Heilrollen wurde anschließend vollständig geprüft.

### Vollständige Kombinationsprüfung für dreizehn Spieler

Die Prüfung umfasst alle 4.564 zulässigen Rollenauswahlen mit null bis neun Sonderrollen. Für jede Auswahl werden beide Gerber-Siegbedingungen, die Einstellungen zur Selbstwahl der Alten Vettel, beide Bürgermeister-Varianten sowie Partien mit und ohne Amulett und Trunkenbold erfasst. Damit ergeben sich **60.992 Varianten**. Die Rollenaufdeckung folgt der Standardeinstellung.

Jede Variante lief mit 24 gemeinsamen Zufallsstarts in fünf Modellen bis zum Spielende. Insgesamt wurden **7.319.040 Partien** simuliert. Die Spiellogik wies zusätzlich alle 3.628 überfüllten oder widersprüchlichen Auswahlen zurück. [Komprimiertes Archiv mit allen Einzelwerten](simulations/werewolf-thirteen-player-combinations.jsonl.gz)

| Gewählte Sonderrollen | Varianten einschließlich Einstellungen |
| ---: | ---: |
| 0 | 4 |
| 1 | 64 |
| 2 | 460 |
| 3 | 1.960 |
| 4 | 5.500 |
| 5 | 10.672 |
| 6 | 14.612 |
| 7 | 14.120 |
| 8 | 9.440 |
| 9 | 4.160 |

Auch die 4.160 Varianten ohne gewöhnliche Dorfbewohner wurden vollständig durchgespielt. Die Archivprüfung bestätigt identische Varianten über alle Modelle und vollständige Ergebnissummen. Die 24 Starts je Variante dienen zur breiten Prüfung der Spielabläufe. Für feinere Balancevergleiche werden die gezielten Vergleichsläufe mit 2.000 Starts je Variante verwendet.

## Prüfung der Aufstellungen für vierzehn Spieler

Drei oder vier Werwölfe und eine Seherin wurden in fünf Ausgangsbesetzungen geprüft. Jede Besetzung lief mit Hexe, mit Magier und mit beiden gemeinsam. Hinzu kommen die Bürgermeister-Einstellungen aus, doppelte Stimme und Hammer sowie alle Kombinationen aus Amulett und Trunkenbold. Der Magier verwendet eine flexible Strategie oder spart beide Zauber für Heilungen auf. Bei gemeinsamem Einsatz handelt die Hexe zuerst. Der Magier sieht anschließend das verbleibende Wolfsopfer. Gift und Todeszauber werden am Morgen aufgelöst. Die flexible Magierstrategie setzt höchstens einen Todeszauber pro Nacht ein.

Die Vergleiche umfassen **5.940.000 vollständige Partien** mit 2.000 Zufallsstarts je Variante in fünf Modellen. Die zusätzlichen Wölfe und der gemeinsame Einsatz beider Heilrollen wurden in einer separaten Testkopie erprobt. Zehn Simulationstests und zwei Tests zur Weitergabe des Wolfsopfers und zum Erhalt von Hexengift bestanden. [Archiv mit Einzelwerten](simulations/werewolf-fourteen-player-options.jsonl.gz)

Die Tabelle zeigt Wolfssiege im Modell mit kombinierten Seher- und Ermittlerhinweisen. Bürgermeister, Schutzamulett und Trunkenbold sind in diesen Tabellenwerten ausgeschaltet.

| Weitere Sonderrollen | Wölfe | Hexe | Magier | Beide |
| --- | ---: | ---: | ---: | ---: |
| Keine | 3 | 56,80 % | 48,45 % | 38,45 % |
| Keine | 4 | 72,90 % | 64,15 % | 55,40 % |
| Jäger, Leibwächter, Seher-Lehrling und Ermittler | 3 | 39,50 % | 31,75 % | 22,35 % |
| Jäger, Leibwächter, Seher-Lehrling und Ermittler | 4 | 60,65 % | 51,75 % | 39,90 % |
| Jäger, Leibwächter, Gerber, Alte Vettel und Ermittler | 3 | 51,25 % | 41,25 % | 33,60 % |
| Jäger, Leibwächter, Gerber, Alte Vettel und Ermittler | 4 | 68,05 % | 60,50 % | 48,45 % |
| Jäger, Dorftrottel, Dorfmatratze, Amor, Harter Bursche und Alte Vettel | 3 | 52,00 % | 42,45 % | 36,15 % |
| Jäger, Dorftrottel, Dorfmatratze, Amor, Harter Bursche und Alte Vettel | 4 | 69,00 % | 61,60 % | 51,45 % |
| Jäger, Dorftrottel, Leibwächter, Amor, Harter Bursche, Seher-Lehrling und Ermittler | 3 | 39,10 % | 31,75 % | 25,45 % |
| Jäger, Dorftrottel, Leibwächter, Amor, Harter Bursche, Seher-Lehrling und Ermittler | 4 | 57,35 % | 49,60 % | 39,20 % |

Bei vier Wölfen und der letzten Besetzung passen beide Heilrollen zusammen mit einem zusätzlichen Bürgermeister nicht in die neun freien Rollenplätze. Diese überfüllten Varianten wurden beim Aufbau des Vergleichs ausgelassen.

**Bestätigte Einrichtung nach der Kombinationsprüfung.** Drei Wölfe bleiben der Standard. Dafür bleiben Hexe und Magier Alternativen. Vier Wölfe sind eine Zusatzvariante für Gruppen mit starken Dorfrollen. In dieser Variante dürfen Hexe und Magier gemeinsam spielen. In den tabellierten Besetzungen liegen die Wolfsquoten mit vier Wölfen und beiden Heilrollen zwischen 39 und 55 Prozent.

### Vollständige Kombinationsprüfung für vierzehn Spieler

Die reguläre Spiellogik wurde mit **141.408 Konfigurationen** geprüft. Jede Konfiguration lief mit acht gemeinsamen Zufallsstarts in fünf Entscheidungsmodellen durch: zufällige Entscheidungen, vorsichtiger Trankeinsatz, geteilte Hinweise mit Dorftrottel-Erkennung, frühe Wolfsangriffe mit zurückhaltender Abstimmung nach einer ruhigen zweiten Nacht sowie kombinierte Ermittlungen. Insgesamt wurden **5.656.320 Partien** vollständig beendet. [Archiv mit Einzelwerten und Prüfsummen der verwendeten Quelldateien](simulations/werewolf-fourteen-player-combinations.jsonl.gz)

| Wolfszahl | Gültige Rollenauswahlen | Konfigurationen einschließlich Einstellungen | Davon Hexe und Magier gemeinsam |
| --- | ---: | ---: | ---: |
| 3 | 4.604 | 62.080 | 0 |
| 4 | 5.998 | 79.328 | 18.336 |

Alle zulässigen Teilmengen der dreizehn optionalen Rollenkarten wurden berücksichtigt. Dazu kommen beide Gerber-Ziele, beide Bürgermeister-Varianten, Selbstwahl der Alten Vettel ein/aus sowie alle Kombinationen aus Schutzamulett und Trunkenbold. Freie Plätze werden mit gewöhnlichen Dorfbewohnern gefüllt. Die Ablehnung ungültiger Rollenauswahlen wurde für **3.588 Auswahlen bei drei Wölfen** und **2.194 bei vier Wölfen** geprüft.

Alle zehn Simulationsläufe und beide Prüfungen ungültiger Aufstellungen bestanden. Zusätzlich bestanden 113 gezielte Tests, einschließlich der gemeinsamen Heilrollen-Abwicklung. Die Entscheidungszweige der Zustandsmaschine sind zu 95,78 % abgedeckt; Typprüfung, Lint und Architekturprüfung bestanden. Archivprüfungen bestätigten identische Konfigurationslisten über alle Modelle, eindeutige Kennungen und vollständige Ergebnissummen je Konfiguration.

**Aussagegrenze:** Vollständig sind die Rollenauswahlen und die oben genannten Einstellungen. Acht Starts je Modell und Konfiguration prüfen den Ablauf breit, liefern aber keine präzise Gewinnwahrscheinlichkeit je einzelner Auswahl. Die Balance-Empfehlung stützt sich ergänzend auf den vorherigen gezielten Vergleich mit jeweils 2.000 Starts. Die Modelle verwenden die normale Rollenaufdeckung; sie bilden nicht jede menschliche Entscheidung oder jede mögliche Zugfolge ab. Der flexible Magier verwendet im Modell höchstens einen Todeszauber pro Nacht; die Spiellogik erlaubt weiterhin zwei.

## Vergleich der Wolfszahlen und Heilrollen bei fünfzehn Spielern

In einer separaten Testkopie wurden fünf Ausgangsbesetzungen mit drei, vier und fünf Wölfen verglichen. Die Testkopie erlaubt zum Vergleich auch beide Heilrollen bei drei Wölfen. Hexe, Magier und beide gemeinsam wurden mit Bürgermeister aus/doppelte Stimme/Hammer sowie allen Kombinationen aus Amulett und Trunkenbold kombiniert. Für den Magier gibt es eine flexible Strategie und eine Strategie mit ausschließlich heilenden Zaubern. Zu große Aufstellungen werden ausgelassen. Die Hexe handelt vor dem Magier; ihr Gift bleibt bis zum Morgen erhalten.

Die 899 Vergleichsvarianten einschließlich der Kontrollbesetzungen liefen mit je 2.000 gemeinsamen Zufallsstarts in fünf Modellen: **8.990.000 vollständig beendete Partien**. Alle fünfzehn Vergleichstests bestanden. Das [Archiv mit Einzelwerten](simulations/werewolf-fifteen-player-options.jsonl.gz) enthält auch die verwendete experimentelle Spiellogik und den Testläufer als Quelltext.

Die folgende Tabelle zeigt Wolfssiege im Modell mit geteilten Hinweisen und Dorftrottel-Erkennung, ohne Bürgermeister, Amulett und Trunkenbold und mit flexibler Magierstrategie. Die übrigen Varianten stehen im Archiv.

| Weitere Sonderrollen | Wölfe | Hexe | Magier | Beide |
| --- | ---: | ---: | ---: | ---: |
| Keine weiteren | 3 | 52,55 % | 45,20 % | 35,05 % |
| Schutz und Ermittlungen | 3 | 41,50 % | 32,45 % | 24,30 % |
| Gerber und Ermittlungen | 3 | 51,15 % | 44,00 % | 34,95 % |
| Dorfmatratze und Amor | 3 | 50,70 % | 41,70 % | 34,40 % |
| Viele Sonderrollen | 3 | 40,40 % | 31,90 % | 24,65 % |
| Keine weiteren | 4 | 69,70 % | 61,25 % | 53,00 % |
| Schutz und Ermittlungen | 4 | 59,40 % | 50,40 % | 41,10 % |
| Gerber und Ermittlungen | 4 | 68,75 % | 61,05 % | 50,90 % |
| Dorfmatratze und Amor | 4 | 66,75 % | 58,30 % | 48,90 % |
| Viele Sonderrollen | 4 | 57,65 % | 48,50 % | 40,75 % |
| Keine weiteren | 5 | 84,05 % | 76,30 % | 68,50 % |
| Schutz und Ermittlungen | 5 | 78,25 % | 67,45 % | 57,10 % |
| Gerber und Ermittlungen | 5 | 83,60 % | 75,50 % | 67,10 % |
| Dorfmatratze und Amor | 5 | 79,50 % | 73,50 % | 64,00 % |
| Viele Sonderrollen | 5 | 73,50 % | 64,45 % | 56,50 % |

Die Ausgangsbesetzungen enthalten zusätzlich zur Seherin und den tabellierten Heilrollen:

- **Schutz und Ermittlungen:** Jäger, Leibwächter, Seher-Lehrling und Paranormaler Ermittler.
- **Gerber und Ermittlungen:** Jäger, Leibwächter, Gerber, Alte Vettel und Paranormaler Ermittler.
- **Dorfmatratze und Amor:** Jäger, Dorftrottel, Dorfmatratze, Amor, Harter Bursche und Alte Vettel.
- **Viele Sonderrollen:** Jäger, Dorftrottel, Leibwächter, Amor, Harter Bursche, Seher-Lehrling und Paranormaler Ermittler.

**Aktuelle Festlegung des Auftraggebers:** Drei Wölfe bleiben der Standard, vier sind optional. Fünf oder mehr Wölfe sind ausgeschlossen, auch im Bewertungs- und Zufallsmodus. Bei drei Wölfen sind Hexe und Magier Alternativen; bei vier dürfen beide gewählt werden. Die Fünfer-Ergebnisse bleiben als historischer Vergleich erhalten und sind keine angebotene Spielvariante.

Die Quoten gelten für die jeweiligen Entscheidungsmodelle. Menschen können anders spielen. Die Zahlen sind keine Zusage einer tatsächlichen Gewinnwahrscheinlichkeit und die gemeinsamen Zufallsstarts sind keine unabhängigen Wiederholungen. Der flexible Magier verwendet höchstens einen Todeszauber pro Nacht.

## Vollständige Kombinationsprüfung für fünfzehn Spieler

Die reguläre Spiellogik wurde mit **223.776 Konfigurationen** geprüft. Acht gemeinsame Zufallsstarts je Konfiguration in fünf Entscheidungsmodellen ergeben **8.951.040 vollständig beendete Partien**. Verwendet wurden dieselben fünf Modelle wie bei vierzehn Spielern. [Archiv mit Einzelwerten und Quellenprüfsummen](simulations/werewolf-fifteen-player-combinations.jsonl.gz)

| Wölfe | Gültige Rollenauswahlen | Konfigurationen einschließlich Einstellungen | Davon beide Heilrollen | Abgewiesene Rollenauswahlen |
| ---: | ---: | ---: | ---: | ---: |
| 3 | 4.608 | 62.208 | 0 | 3.584 |
| 4 | 6.119 | 82.240 | 20.160 | 2.073 |
| 5 | 5.998 | 79.328 | 18.336 | 2.194 |

Berücksichtigt sind alle zulässigen Teilmengen der dreizehn optionalen Rollen, beide Gerber-Ziele, beide Bürgermeister-Varianten, die Selbstwahl der Alten Vettel ein/aus sowie alle Kombinationen aus Schutzamulett und Trunkenbold. Gewöhnliche Dorfbewohner füllen freie Plätze. Im damaligen Prüfstand waren die Heilrollen bei drei Wölfen Alternativen und bei vier und fünf gemeinsam zulässig. Aktuell ist die gemeinsame Besetzung nur noch mit vier Wölfen erlaubt. Leibwächter und Dorfmatratze bleiben Alternativen.

Alle fünfzehn Simulationsläufe sowie drei Prüfungen ungültiger Aufstellungen bestanden. Die Archivprüfung bestätigt vollständige Ergebnissummen, eindeutige Kennungen und identische Konfigurationen über die Modelle hinweg. Zusätzlich bestanden **118 gezielte Tests**, darunter die Interaktion beider Heilrollen bei vier und fünf Wölfen. Die Zustandsmaschine erreicht 99,18 % Zeilen- und 95,78 % Zweigabdeckung. Typprüfung, Lint und Architekturprüfung bestanden.

Die Prüfung ist vollständig bezüglich der aufgeführten Rollenauswahlen und Einstellungen. Acht Starts je Modell und Konfiguration prüfen Abläufe breit; daraus folgt keine genaue Gewinnwahrscheinlichkeit für jede Auswahl. Rollenaufdeckung ist eingeschaltet. Die flexible Magierstrategie setzt höchstens einen Todeszauber pro Nacht ein, obwohl die Spiellogik zwei erlaubt. Nicht jede mögliche menschliche Entscheidung oder Zugfolge wird untersucht.

## Vergleich der Wolfszahlen und Heilrollen bei sechzehn Spielern

Drei Ausgangsbesetzungen wurden mit drei und vier Wölfen verglichen. Jeweils zur Wahl standen Hexe, Magier und beide gemeinsam, Bürgermeister aus/doppelte Stimme/Hammer sowie alle Kombinationen aus Schutzamulett und Trunkenbold. Für den Magier wurden eine flexible Strategie und eine Strategie mit ausschließlich heilenden Zaubern verwendet. Bei gemeinsamer Besetzung handelt zuerst die Hexe; der Magier erfährt anschließend das verbleibende Wolfsopfer.

Die 366 Vergleichsvarianten einschließlich Kontrollbesetzungen liefen mit je 2.000 gemeinsamen Zufallsstarts in fünf Entscheidungsmodellen durch: **3.660.000 vollständig beendete Partien**. Alle sechs Vergleichstests bestanden. Die [archivierten Einzelwerte](simulations/werewolf-sixteen-player-options.jsonl.gz) enthalten den experimentellen Testläufer und die verwendete Spiellogik als Quelltext. Beide Heilrollen mit drei Wölfen wurden ausschließlich in dieser Testkopie zugelassen und bleiben im regulären Spiel ausgeschlossen.

Die Tabelle zeigt Wolfssiege im Modell mit geteilten Hinweisen und Dorftrottel-Erkennung, ohne Bürgermeister, Amulett und Trunkenbold und mit flexibler Magierstrategie.

| Weitere Sonderrollen | Wölfe | Hexe | Magier | Beide, bei 3 Wölfen nur Versuch |
| --- | ---: | ---: | ---: | ---: |
| Keine weiteren | 3 | 49,80 % | 42,45 % | 35,45 % |
| Schutz und Ermittlungen | 3 | 38,05 % | 28,05 % | 25,05 % |
| Viele Sonderrollen | 3 | 37,65 % | 29,70 % | 25,30 % |
| Keine weiteren | 4 | 66,50 % | 58,45 % | 49,95 % |
| Schutz und Ermittlungen | 4 | 54,75 % | 46,45 % | 36,30 % |
| Viele Sonderrollen | 4 | 54,05 % | 45,20 % | 35,90 % |

Die Seherin ist immer gesetzt. „Schutz und Ermittlungen“ umfasst Jäger, Leibwächter, Seher-Lehrling und Paranormalen Ermittler. „Viele Sonderrollen“ ergänzt Dorftrottel, Amor und Harten Burschen. Die übrigen Plätze werden mit gewöhnlichen Dorfbewohnern gefüllt.

**Aktuelle Festlegung nach der Gesamtbewertung:** Vier Wölfe sind Standard, drei bleiben optional. Sämtliche bisherigen Sonderrollen und Gegenstände bleiben verfügbar. Hexe und Magier sind bei drei Wölfen Alternativen und bei vier gemeinsam wählbar. Fünf oder mehr Wölfe sind ausgeschlossen. Die spätere Oberfläche berücksichtigt diese Bedingungen automatisch. Mit vielen Schutz- und Informationsrollen bleibt die Aufgabe der Wölfe in den Modellen anspruchsvoll.

Die Quoten gelten unter den jeweiligen Modellannahmen und sind keine verlässliche Vorhersage menschlicher Spielrunden. Gepaarte Zufallsstarts sind keine unabhängigen Wiederholungen. Der flexible Magier setzt im Modell höchstens einen Todeszauber pro Nacht ein. Das Punktziel für 16 Spieler bleibt eine ausdrücklich vorläufige Fortschreibung.

### Nachprüfung des allgemeinen Standards am 18.11.2026

Die gespeicherten Vergleiche wurden nach demselben Maßstab wie für 17 Spieler ausgewertet: die drei Modelle mit geteilten Hinweisen, ruhiger zweiter Nacht nach frühem Angriff sowie kombinierten Ermittlungen. Vier Wölfe werden als allgemeiner Standard festgelegt; drei bleiben optional. Die neue Bedienvorgabe ersetzt den zusätzlichen Hinweis durch eine verbindliche automatische Festlegung.

| Referenzmodell | Detailvergleich: 3 Wölfe | Detailvergleich: 4 Wölfe, gleiche Rollen | Breite Prüfung: 3 Wölfe | Breite Prüfung: 4 Wölfe, gleiche Rollen |
| --- | ---: | ---: | ---: | ---: |
| Geteilte Hinweise und Dorftrottel-Erkennung | 37,28 % | 53,02 % | 45,14 % | 47,56 % |
| Frühe Angriffe und ruhige zweite Nacht | 42,30 % | 58,94 % | 50,72 % | 50,48 % |
| Kombinierte Ermittlungen | 35,08 % | 51,22 % | 40,63 % | 48,57 % |

Für die gleichen Rollenbesetzungen werden beide Heilrollen gemeinsam auf beiden Seiten ausgelassen. Der Detailvergleich umfasst je 72 Varianten und 2.000 Starts je Modell und Variante. Die breite Prüfung umfasst je 62.208 Konfigurationen mit acht gemeinsamen Starts. Bei gleicher Modellgewichtung liegen die mittleren Wolfsquoten im Detailvergleich bei 38,22 % mit drei und 54,39 % mit vier; in der breiten Prüfung bei 45,50 % und 48,87 %. Vier liegen in beiden Auswertungen insgesamt näher an einer ausgeglichenen Verteilung.

Auch die angebotenen Varianten mit beiden Heilrollen bei vier Wölfen wurden getrennt ausgewertet. Dort liegen die Quoten im Detailvergleich über die drei Referenzmodelle bei 46,74–54,26 %. Die breite Prüfung ergibt bei ungleichen Rollenangeboten jedoch ein anderes Bild: 43,04–45,73 % mit vier gegenüber 40,63–50,72 % mit drei. Das zeigt die Abhängigkeit von Varianten- und Modellgewichtung; vier sind kein nachgewiesenes Optimum für jede Besetzung. Die vereinfachten Modelle ohne geteilte Hinweise werden separat ausgewiesen und ergeben deutlich höhere Wolfsquoten.

Die [vollständige Auswertung mit Gewichtung](simulations/werewolf-sixteen-player-default-comparison.json) ist archiviert. Diese Modellwerte sind keine menschlichen Gesamtwahrscheinlichkeiten. Insbesondere acht gemeinsame Starts pro Konfiguration ergeben keine präzise unabhängige Schätzung. Die archivierten Spiele verwenden ausdrückliche Wolfszahlen; ihre Ergebnisse bleiben gültig und wurden für den Defaultwechsel nicht neu simuliert. 129 gezielte Tests einschließlich der neuen Voreinstellung bestanden.

## Vollständige Kombinationsprüfung für sechzehn Spieler

Die Business-Schicht wurde auf 16 Mitspielende ohne Erzähler erweitert. Die Prüfung umfasst **145.088 Konfigurationen** mit drei oder vier Wölfen. Acht gemeinsame Zufallsstarts in fünf Entscheidungsmodellen ergeben **5.803.520 vollständig beendete Partien**. [Archiv mit Einzelwerten und Quellenprüfsummen](simulations/werewolf-sixteen-player-combinations.jsonl.gz)

| Wölfe | Gültige Rollenauswahlen | Konfigurationen einschließlich Einstellungen | Davon beide Heilrollen | Abgewiesene Rollenauswahlen |
| ---: | ---: | ---: | ---: | ---: |
| 3 | 4.608 | 62.208 | 0 | 3.584 |
| 4 | 6.142 | 82.880 | 20.672 | 2.050 |

Alle zulässigen Teilmengen der dreizehn optionalen Rollen sowie beide Gerber-Ziele, beide Bürgermeister-Varianten, Selbstwahl der Alten Vettel ein/aus und sämtliche Kombinationen aus Schutzamulett und Trunkenbold sind enthalten. Leibwächter und Dorfmatratze bleiben Alternativen. Gemeinsame Heilrollen setzen vier Wölfe voraus. Fünf oder mehr Wölfe sind auch über Punkteempfehlung und Zufallsauswahl ausgeschlossen.

Alle zehn Simulationsläufe und beide Prüfungen ungültiger Aufstellungen bestanden. Zusätzlich bestanden 123 gezielte Tests sowie sieben zusätzliche Szenarioprüfungen für 16 Spieler. Diese prüfen unter anderem verbotene und veraltete Aktionen, beide Schutzrollen, Magier, Gerber, Trunkenbold und Amulett. Für die größte Tischbesetzung wurden alle **65.536 möglichen benannten Ja/Nein-Stimmverteilungen** einschließlich Pflichtstimme und doppelter Bürgermeister-Stimme geprüft.

Ein zusätzlicher Szenariotest überschritt im ersten Lauf unter paralleler Last seine bisherige Grenze von 30 Sekunden. Nach Erhöhung auf 120 Sekunden bestand er in rund 35 Sekunden einschließlich Vorbereitung; die sechs übrigen Szenariotests bestanden bereits im ersten Lauf. Ein Fehler der Spiellogik wurde dabei nicht festgestellt.

Die Zustandsmaschine erreicht weiterhin 99,18 % Zeilen- und 95,78 % Zweigabdeckung. Typprüfung, Lint, Format, Architekturprüfung sowie der Abgleich des fortgeschriebenen Punktziels mit dem Kalibrierungsskript bestanden.

Die vollständige Abdeckung bezieht sich auf die genannten Konfigurationen. Die breiten Durchläufe verwenden eingeschaltete Rollenaufdeckung und acht Starts pro Modell und Konfiguration. Zusätzliche Szenariotests prüfen auch ausgeschaltete Rollenaufdeckung. Die Entscheidungsmodelle bilden keine vollständige Aufzählung aller Zugfolgen oder menschlichen Entscheidungen ab. Der flexible Magier verwendet im Balance-Modell höchstens einen Todeszauber pro Nacht; die Spiellogik und die zusätzlichen Szenariotests erlauben zwei.

## Wolfszahlen für siebzehn Spieler vergleichen

**Vorgehen für jede weitere Spielerzahl:** Vor den Simulationen wird immer das Originalregelheft auf konkrete Tabellen, passende Szenarien, Rollenwerte und Balancehinweise geprüft. Direkte Vorgaben, abgeleitete Empfehlungen und eigene GameHub-Entscheidungen werden getrennt ausgewiesen und mit Seitenangaben belegt. Sonderrollen auf Wolfsseite und Helfer werden getrennt von gewöhnlichen Wölfen berücksichtigt; Szenarien werden nicht nur anhand einer einzelnen Wolfszahl übertragen. Fehlt eine konkrete Vorgabe für die Spielerzahl, wird das ausdrücklich dokumentiert. Danach werden die anfänglichen Wolfszahlen von eins bis zur größten noch in Unterzahl befindlichen Besetzung gesichtet. Dabei werden einfache und starke Dorfbesetzungen sowie Heil- und Schutzoptionen betrachtet. Anschließend folgen ausführlichere Vergleiche und die vollständige Kombinationsprüfung der ausgewählten Wolfszahlen. Eine Ablehnung bei einer kleineren Gruppe ist keine allgemeine Obergrenze. Vorhandene Ergebnisse werden archiviert und wiederverwendet.

Für 17 wurden eins bis acht Wölfe mit drei Ausgangsbesetzungen, ohne Heilrolle, mit Hexe, mit Magier oder mit beiden und mit/ohne Amulett gesichtet. Zu große Besetzungen wurden ausgelassen. 1.000 gemeinsame Zufallsstarts in fünf Entscheidungsmodellen ergeben **950.000 vollständig beendete Partien**. Alle acht Sichtungstests bestanden. [Archiv der Wolfszahl-Sichtung](simulations/werewolf-seventeen-player-wolf-counts.jsonl.gz)

Die Tabelle zeigt Wolfssiege im Modell mit geteilten Hinweisen und Dorftrottel-Erkennung, jeweils ohne Amulett. Beide Heilrollen bei ein bis drei und sechs bis acht Wölfen waren ausschließlich in der Testkopie zugelassen und werden regulär nicht angeboten.

| Wölfe | Seherin und Hexe, sonst Füllrollen | Viele Sonderrollen und beide Heilrollen, nur Versuch außerhalb 4/5 |
| ---: | ---: | ---: |
| 1 | 16,70 % | 5,20 % |
| 2 | 31,90 % | 12,30 % |
| 3 | 47,30 % | 23,10 % |
| 4 | 62,50 % | 33,50 % |
| 5 | 78,00 % | 49,20 % |
| 6 | 90,10 % | 63,40 % |
| 7 | 97,90 % | 80,30 % |
| 8 | 99,90 % | Kein Platz für diese Besetzung |

Ein und zwei Wölfe liegen in diesen geprüften Besetzungen deutlich unter den Erfolgsquoten von drei Wölfen. Sechs bis acht haben gegenüber fünf einen zunehmenden Vorteil, auch mit starken Dorfrollen. Deshalb wurden drei, vier und fünf ausführlicher untersucht. Das ist eine modellbasierte Auswahl; die Sichtung ersetzt keine vollständige Kombinationsprüfung der übrigen Wolfszahlen.

### Allgemeiner Standard für 17 Spieler

Vier Wölfe sind der allgemeine Ausgangswert. Die frühere Voreinstellung mit drei bezog sich zu stark auf die einfache Besetzung mit Seherin und Hexe. Bei gleichmäßiger Gewichtung der jeweils angebotenen Vergleichsvarianten liegen drei Wölfe in den drei Hinweismodellen bei 33,66–39,90 % Wolfssiegen, vier bei 44,01–51,01 % und fünf bei 59,80–67,31 %. Vier sind damit der ausgewogenere Kompromiss für die Einrichtung. Nach der aktuellen Bedienvorgabe legt das System die konkrete Wolfszahl anhand der Aufstellung automatisch fest.

Diese Mittelwerte sind keine allgemeine Gewinnwahrscheinlichkeit: Die Variantenanzahl unterscheidet sich wegen der erlaubten Heilrollen, und die beiden vereinfachten Modelle ohne geteilte Hinweise ergeben deutlich höhere Wolfsquoten. Die für die Punktebewertung verwendeten Referenzmodelle berücksichtigen geteilte Informationen. Eine gleichmäßige Mittelung aller fünf Modelle wäre eine andere Gewichtung und wird nicht als menschliche Gesamtquote ausgegeben. [Aggregierte Einzelwerte und Gewichtung](simulations/werewolf-seventeen-player-default-comparison.json)

Die archivierten Simulationen geben die Wolfszahl ausdrücklich vor. Ihre Ergebnisse bleiben nach Änderung der Voreinstellung unverändert gültig und werden dafür nicht erneut berechnet.

### Ausführlicher Vergleich mit drei, vier und fünf Wölfen

Drei Ausgangsbesetzungen wurden mit Hexe, Magier und beiden gemeinsam, Bürgermeister aus/doppelte Stimme/Hammer sowie allen Kombinationen aus Amulett und Trunkenbold geprüft. Für den Magier gibt es eine flexible Strategie und eine Strategie mit ausschließlich heilenden Zaubern. Die Hexe handelt zuerst; der Magier sieht anschließend das verbleibende Wolfsopfer. Die Testkopie erlaubt beide Heilrollen auch bei drei Wölfen, damit der Vergleich die Einschränkung prüfen kann. Im regulären Spiel bleibt diese Kombination ausgeschlossen.

549 Vergleichsvarianten einschließlich Kontrollbesetzungen liefen mit je 2.000 gemeinsamen Starts in fünf Modellen: **5.490.000 vollständig beendete Partien**. Alle neun Vergleichstests bestanden. Das [Archiv mit Einzelwerten](simulations/werewolf-seventeen-player-options.jsonl.gz) enthält auch die experimentelle Spiellogik und den Testläufer als Quelltext.

Die folgende Tabelle zeigt Wolfssiege im Modell mit geteilten Hinweisen und Dorftrottel-Erkennung, ohne Bürgermeister, Amulett und Trunkenbold und mit flexibler Magierstrategie.

| Weitere Sonderrollen | Wölfe | Hexe | Magier | Beide, bei 3 nur Versuch |
| --- | ---: | ---: | ---: | ---: |
| Keine weiteren | 3 | 48,30 % | 41,95 % | 34,85 % |
| Schutz und Ermittlungen | 3 | 36,55 % | 29,50 % | 22,40 % |
| Viele Sonderrollen | 3 | 33,35 % | 28,55 % | 22,55 % |
| Keine weiteren | 4 | 63,35 % | 55,30 % | 47,15 % |
| Schutz und Ermittlungen | 4 | 51,95 % | 43,90 % | 34,55 % |
| Viele Sonderrollen | 4 | 52,05 % | 42,65 % | 33,20 % |
| Keine weiteren | 5 | 78,50 % | 71,40 % | 62,65 % |
| Schutz und Ermittlungen | 5 | 68,45 % | 61,85 % | 51,00 % |
| Viele Sonderrollen | 5 | 66,40 % | 58,80 % | 50,60 % |

Die Seherin ist immer gesetzt. „Schutz und Ermittlungen“ enthält Jäger, Leibwächter, Seher-Lehrling und Paranormalen Ermittler. „Viele Sonderrollen“ ergänzt Dorftrottel, Amor und Harten Burschen. Die übrigen Plätze werden mit gewöhnlichen Dorfbewohnern gefüllt.

**Festlegung für 17:** Vier Wölfe sind der Standard; drei und fünf bleiben Zusatzoptionen. Fünf passen besonders zu starken Dorfbesetzungen mit beiden Heilrollen und Informationsrollen. Bei einer einfachen Besetzung liegen sie deutlich im Vorteil und sind keine allgemeine Empfehlung. Hexe und Magier bleiben bei drei Wölfen Alternativen und sind bei vier und fünf gemeinsam wählbar. Die spätere UI und die Punkteempfehlung berücksichtigen Spielerzahl, Wolfszahl und gewählte Rollen.

Die Quoten gelten unter den jeweiligen Modellannahmen und sagen keine tatsächlichen menschlichen Gewinnwahrscheinlichkeiten voraus. Die gemeinsamen Zufallsstarts sind absichtlich gepaart, keine unabhängigen Wiederholungen. Die 15.561.280 Partien aus Sichtung, Detailvergleich und Kombinationsprüfung bezeichnen Durchläufe mit teilweise denselben Starts. Das Punktziel für 17 wurde dabei nicht neu angepasst und bleibt vorläufig.

## Vollständige Kombinationsprüfung für siebzehn Spieler

Die Business-Schicht unterstützt 17 Mitspielende ohne Erzähler. Für drei, vier und fünf Wölfe wurden **228.032 Konfigurationen** geprüft. Acht gemeinsame Zufallsstarts je Konfiguration in fünf Entscheidungsmodellen ergeben **9.121.280 vollständig beendete Partien**. [Archiv mit Einzelwerten und Quellenprüfsummen](simulations/werewolf-seventeen-player-combinations.jsonl.gz)

| Wölfe | Gültige Rollenauswahlen | Konfigurationen einschließlich Einstellungen | Davon beide Heilrollen | Abgewiesene Rollenauswahlen |
| ---: | ---: | ---: | ---: | ---: |
| 3 | 4.608 | 62.208 | 0 | 3.584 |
| 4 | 6.144 | 82.944 | 20.736 | 2.048 |
| 5 | 6.142 | 82.880 | 20.672 | 2.050 |

Die Prüfung enthält alle zulässigen Teilmengen der dreizehn optionalen Rollen, beide Gerber-Ziele, beide Bürgermeister-Varianten, die Selbstwahl der Alten Vettel ein/aus und sämtliche Kombinationen aus Amulett und Trunkenbold. Bei drei Wölfen bleiben Hexe und Magier Alternativen; bei vier und fünf dürfen beide gemeinsam spielen. Leibwächter und Dorfmatratze bleiben Alternativen. Freie Plätze werden mit gewöhnlichen Dorfbewohnern gefüllt.

Alle fünfzehn Kombinationsläufe und drei Prüfungen ungültiger Aufstellungen bestanden. Zusätzlich bestanden **129 gezielte Tests** und sieben ergänzende Szenarioprüfungen für 17 Spieler, einschließlich aller **131.072 benannten Ja/Nein-Stimmverteilungen** an der größten Tischbesetzung. Der Amulett-Szenariotest überschritt zunächst unter paralleler Last die bisherige Grenze von 30 Sekunden. Nach einheitlicher Anpassung der Zeitgrenzen für umfangreiche Szenariotests auf 120 Sekunden bestand auch dieser Lauf. Die sechs übrigen Szenariotests bestanden bereits im ersten Lauf.

Die Zustandsmaschine erreicht weiterhin 99,18 % Zeilen- und 95,78 % Zweigabdeckung. Typprüfung, Lint, Format, Architekturprüfung und Kalibrierungsabgleich bestanden. Für jede empfohlene Rollenauswahl bei 17 Spielern wurde der reguläre Spieleinstieg geprüft. Unter den dabei geprüften Standardeinstellungen empfiehlt die Berechnung höchstens fünf Wölfe, obwohl die Vorauswahl alle anfänglichen Wolfszahlen von eins bis acht betrachtet.

Die vollständige Abdeckung bezieht sich auf die aufgeführten Konfigurationen. Die breiten Durchläufe verwenden eingeschaltete Rollenaufdeckung und acht Starts je Modell und Konfiguration; die ergänzenden Szenariotests prüfen auch verdeckte Rollen. Die flexible Magierstrategie verwendet im Balance-Modell höchstens einen Todeszauber pro Nacht; die Spiellogik und Szenariotests erlauben zwei. Es wurden nicht alle menschlichen Entscheidungen oder vollständigen Zugfolgen aufgezählt. Die Gewinnquoten und das fortgeschriebene Punktziel bleiben modellabhängig.

## Wolfszahlen und Grenzen für achtzehn Spieler

**Ergebnis:** Minimum **drei**, allgemeiner Standard **vier**, Maximum **fünf** Wölfe. Die Spielerzahl zählt nur Mitspielende mit Rolle; der Erzähler kommt zusätzlich dazu. Sechs wurden ausdrücklich geprüft und für diese Gruppengröße nicht freigegeben. Diese Entscheidung ist keine pauschale Grenze für 19 oder 20; beide werden separat geprüft. Leibwächter und Dorfmatratze bleiben immer Alternativen.

### Originalabgleich und Einordnung der Mindestzahl für 18

Das verwendete [Originalregelheft](https://board-game-rules.com/wp-content/uploads/2025/01/ultimate-werewolf-ultimate-edition_Official-Rules.pdf#page=1) nennt in seiner Grundtabelle nur 6 bis 15 Spieler, keine feste Zahl für 18. Für eigene Besetzungen verweist es auf Rollenwerte; normale Dorfbewohner werden besonders bei offener Rollenaufdeckung empfohlen. [Balancehinweise, S. 8 und 13–14](https://board-game-rules.com/wp-content/uploads/2025/01/ultimate-werewolf-ultimate-edition_Official-Rules.pdf#page=13)

Das 16er-Beispiel enthält drei Wölfe, acht gewöhnliche Dorfbewohner und einen zusätzlichen Wolfshelfer. Es ist keine Vorlage für drei Wölfe gegen sämtliche GameHub-Sonderrollen. [Szenario, S. 12](https://board-game-rules.com/wp-content/uploads/2025/01/ultimate-werewolf-ultimate-edition_Official-Rules.pdf#page=12)

**Drei als Minimum bei 18 ist eine GameHub-Option für schwache Dorfbesetzungen, keine Originalvorgabe und keine Balanceempfehlung für viele Schutz- und Informationsrollen.** Die Rollen stehen zur Auswahl und sind nicht automatisch alle gleichzeitig im Spiel. Als allgemeiner Standard bleiben vier gesetzt; bei starken Besetzungen kann die spätere UI fünf empfehlen. Nach der aktuellen Bedienvorgabe wird die dazu passende Zahl automatisch festgelegt.

Die bestehenden Modellwerte zeigen den Unterschied: Drei Wölfe gegen Seherin, Hexe und sonst gewöhnliche Dorfbewohner erreichten im Hinweismodell 48 %. Die starke Beispielgruppe mit Seherin, Hexe und sieben weiteren Sonderrollen erreichte 31,20 %, mit Magier anstelle der Hexe 24,60 %. Das sind Modellwerte für konkrete Beispiele, keine menschlichen Gewinnwahrscheinlichkeiten und keine Werte für alle denkbaren Vollbesetzungen. „Unmöglich zu gewinnen“ ist damit nicht belegt; der Nachteil einer starken Dorfbesetzung ist jedoch klar.

Die erlaubte Mindestzahl bleibt drei; sie wird nicht stillschweigend auf vier erhöht. Die spätere automatische Festlegung muss die Stärke der Dorfbesetzung berücksichtigen. Die vom Auftraggeber erlaubte freie Sonderrollenauswahl bleibt bestehen und wird als eigene Variante von den Originalempfehlungen unterschieden.

### Sichtung der Wolfszahlen eins bis acht

Drei Ausgangsbesetzungen wurden ohne Heilrolle, mit Hexe, mit Magier oder mit beiden sowie mit/ohne Amulett untersucht. 1.000 gemeinsame Zufallsstarts je Variante in fünf Modellen ergeben **960.000 vollständig beendete Partien**. Alle acht Sichtungstests bestanden. Das [Sichtungsarchiv](simulations/werewolf-eighteen-player-wolf-counts.jsonl.gz) enthält auch die niedrigen und hohen Wolfszahlen, die außerhalb der später freigegebenen Grenzen liegen. Beide Heilrollen mit weniger als vier oder mehr als fünf Wölfen waren ausschließlich in der Testkopie erlaubt.

| Wölfe | Seherin und Hexe, sonst Füllrollen | Viele Sonderrollen und beide Heilrollen, nur Versuch außerhalb 4/5 |
| ---: | ---: | ---: |
| 1 | 14,50 % | 4,50 % |
| 2 | 28,60 % | 12,10 % |
| 3 | 48,90 % | 20,20 % |
| 4 | 61,80 % | 34,60 % |
| 5 | 77,70 % | 44,40 % |
| 6 | 86,20 % | 60,80 % |
| 7 | 96,20 % | 76,10 % |
| 8 | 99,60 % | 90,00 % |

Die Tabelle zeigt Wolfssiege im Modell mit geteilten Hinweisen und Dorftrottel-Erkennung, jeweils ohne Amulett. Ein und zwei Wölfe waren schon in der einfachen Besetzung deutlich im Nachteil; drei bieten dafür eine sinnvolle untere Option. Sechs bis acht lagen auch gegen starke Dorfrollen häufig im Vorteil. Deshalb wurden drei bis sechs ausführlicher verglichen und anschließend drei bis fünf freigegeben. Die Sichtung ist keine vollständige Kombinationsprüfung aller acht Wolfszahlen.

Ein erster Sichtungslauf enthielt irrtümlich noch den Spielerzahlparameter 17. Er wurde abgebrochen und verworfen. Ausschließlich die korrigierten Datensätze mit nachgewiesenen 18 Spielern sind archiviert und in den genannten Ergebnissen enthalten.

### Ausführlicher Vergleich einschließlich sechs Wölfen

Jeweils drei Ausgangsbesetzungen wurden mit drei, vier, fünf und sechs Wölfen verglichen. Je Besetzung wurden Hexe, Magier und beide gemeinsam, Bürgermeister aus/doppelte Stimme/Hammer sowie sämtliche Kombinationen aus Amulett und Trunkenbold untersucht. Der Magier verwendet entweder eine flexible Strategie oder spart beide Zauber für Heilungen. Bei gemeinsamer Besetzung handelt zuerst die Hexe; der Magier sieht anschließend das verbleibende Wolfsopfer.

Die 732 Vergleichsvarianten einschließlich Kontrollbesetzungen liefen mit je 2.000 gemeinsamen Starts in fünf Modellen durch: **7.320.000 vollständig beendete Partien**. Alle zwölf Vergleichstests bestanden. Das [Vergleichsarchiv](simulations/werewolf-eighteen-player-options.jsonl.gz) enthält Einzelwerte und die experimentelle Spiellogik samt Testläufer.

Die folgende Tabelle zeigt Wolfssiege im Hinweismodell, ohne Bürgermeister, Amulett und Trunkenbold und mit flexibler Magierstrategie. Beide Heilrollen mit drei oder sechs Wölfen sind hier Versuchsvarianten, keine reguläre Auswahl.

| Weitere Sonderrollen | Wölfe | Hexe | Magier | Beide |
| --- | ---: | ---: | ---: | ---: |
| Keine weiteren | 3 | 48,00 % | 42,00 % | 33,20 % |
| Schutz und Ermittlungen | 3 | 32,75 % | 27,30 % | 20,80 % |
| Viele Sonderrollen | 3 | 31,20 % | 24,60 % | 19,20 % |
| Keine weiteren | 4 | 61,75 % | 54,20 % | 45,20 % |
| Schutz und Ermittlungen | 4 | 49,45 % | 40,50 % | 31,25 % |
| Viele Sonderrollen | 4 | 48,60 % | 40,65 % | 32,30 % |
| Keine weiteren | 5 | 76,85 % | 67,35 % | 61,10 % |
| Schutz und Ermittlungen | 5 | 65,30 % | 55,90 % | 47,05 % |
| Viele Sonderrollen | 5 | 63,25 % | 53,60 % | 45,40 % |
| Keine weiteren | 6 | 86,90 % | 80,35 % | 74,65 % |
| Schutz und Ermittlungen | 6 | 79,05 % | 73,50 % | 62,85 % |
| Viele Sonderrollen | 6 | 76,55 % | 70,55 % | 61,35 % |

Die Seherin ist immer gesetzt. „Schutz und Ermittlungen“ enthält Jäger, Leibwächter, Seher-Lehrling und Paranormalen Ermittler; „Viele Sonderrollen“ ergänzt Dorftrottel, Amor und Harten Burschen. Gewöhnliche Dorfbewohner füllen die übrigen Plätze. Auch Bürgermeister, Amulett, Trunkenbold und die heilende Magierstrategie sind im Archiv enthalten.

### Allgemeiner Standard und zulässige Grenzen

Vier werden nach demselben Maßstab wie bei 16 und 17 als allgemeiner Standard verwendet: gleiche Gewichtung der untersuchten Varianten je Modell, Orientierung an den drei informationsbasierten Referenzmodellen und Betrachtung verschiedener Dorfbesetzungen. Kontrollen und doppelte Magierstrategien werden in dieser Zusammenfassung nicht mehrfach gewichtet; gemeinsame Heilrollen mit drei Wölfen bleiben ausgeschlossen.

| Wölfe | Detailvergleich: Spanne der drei Referenzmodelle | Breite Kombinationsprüfung: Spanne der drei Referenzmodelle |
| ---: | ---: | ---: |
| 3 | 31,80 % bis 38,19 % | 33,57 % bis 34,48 % |
| 4 | 41,81 % bis 48,91 % | 47,50 % bis 50,15 % |
| 5 | 56,69 % bis 63,94 % | 58,84 % bis 66,38 % |
| 6 | 71,06 % bis 77,74 % | Nicht freigegeben und nicht vollständig kombiniert |

Vier liegen insgesamt am nächsten an einem ausgewogenen Ergebnis. Drei sind für einfache Dorfbesetzungen sinnvoll; fünf bleiben eine Zusatzoption bei starken Schutz- und Informationsrollen. Sechs sind keine notwendige Erweiterung: Selbst in der starken Tabellenbesetzung mit beiden Heilrollen erreichen sie 61,35 % Wolfssiege, während fünf dort 45,40 % erreichen. Sie werden deshalb für 18 ausgeschlossen; das ist eine konservative Konfigurationsentscheidung, kein Beweis gegen jede denkbare menschliche Sechser-Aufstellung.

Die [vollständige Auswertung mit Gewichtung](simulations/werewolf-eighteen-player-default-comparison.json) weist auch die vereinfachten Modelle ohne geteilte Hinweise getrennt aus. Diese liefern andere, deutlich höhere Wolfsquoten. Die Zahlen sind keine menschlichen Gesamtwahrscheinlichkeiten. Acht gemeinsame Starts pro Konfiguration dienen vor allem der breiten Ablaufprüfung; sie liefern keine präzisen unabhängigen Gewinnschätzungen. Die durchschnittlichen Rollenangebote unterscheiden sich bei drei gegenüber vier/fünf Wölfen wegen der kombinierten Heilrollen.

Die festgelegten Grenzen werden in jeder technischen Einrichtung für 18 eingehalten, auch bei gesetztem Bewertungsmodus oder Zufallsaufstellung. Vier bleiben der allgemeine Referenzwert; die spätere UI zeigt die verbindlich automatisch bestimmte Zahl für die konkrete Aufstellung an. Das Punktziel −16 bleibt eine vorläufige Fortschreibung und wurde durch diese Simulationen nicht neu kalibriert.

### Vollständige Kombinationsprüfung der freigegebenen Auswahl

**228.096 Konfigurationen** mit drei, vier und fünf Wölfen liefen mit acht gemeinsamen Starts in fünf Modellen durch: **9.123.840 beendete Partien**. Alle fünfzehn Simulationsläufe und drei Prüfungen ungültiger Rollenauswahlen bestanden. Das [Kombinationsarchiv](simulations/werewolf-eighteen-player-combinations.jsonl.gz) enthält Einzelwerte, Quellenprüfsummen und den verwendeten Testläufer als Quelltext.

| Wölfe | Zulässige Rollenauswahlen | Konfigurationen einschließlich Einstellungen | Davon beide Heilrollen | Abgewiesene Rollenauswahlen |
| ---: | ---: | ---: | ---: | ---: |
| 3 | 4.608 | 62.208 | 0 | 3.584 |
| 4 | 6.144 | 82.944 | 20.736 | 2.048 |
| 5 | 6.144 | 82.944 | 20.736 | 2.048 |

Enthalten sind sämtliche zulässigen Teilmengen der dreizehn optionalen Rollen, beide Gerber-Ziele, beide Bürgermeister-Varianten, Selbstwahl der Alten Vettel ein/aus sowie alle Kombinationen aus Amulett und Trunkenbold. Die voneinander unabhängigen Archive wurden auf 18 Spieler, vollständige Ergebnissummen, eindeutige Konfigurationen und gleiche Varianten über die Modelle hinweg geprüft. Alle gültigen Durchläufe aus Sichtung, Detailvergleich und Kombinationsprüfung ergeben **17.403.840 Partien** mit teilweise denselben Zufallsstarts.

Zusätzlich bestanden **136 gezielte Tests** und **sieben Szenarioprüfungen für 18 Spieler**, darunter sämtliche **262.144 benannten Ja/Nein-Stimmverteilungen** am größten Tisch. Die Zustandsmaschine erreicht weiterhin 99,18 % Zeilen- und 95,78 % Zweigabdeckung. Typprüfung, Lint, Format, Architekturprüfung und Kalibrierungsabgleich bestanden. Die Szenarioprüfungen berücksichtigen auch verdeckte Rollen und unzulässige/veraltete Aktionen.

Die breiten Balance-Durchläufe verwenden eingeschaltete Rollenaufdeckung. Die flexible Magierstrategie setzt dort höchstens einen Todeszauber pro Nacht ein; die Spiellogik und ergänzende Szenarioprüfungen erlauben zwei. Es wurden nicht alle menschlichen Entscheidungen oder vollständigen Zugfolgen aufgezählt. Die späteren Stichprobenprüfungen für 19 und 20 sind weiter unten dokumentiert.

## Leibwächter und Dorfmatratze bei sechs Spielern

Neben einem Werwolf und einer Seherin wurden alle acht Kombinationen aus Hexe, Jäger und Dorftrottel geprüft, jeweils mit Leibwächter, mit Dorfmatratze und mit einem gewöhnlichen Dorfbewohner auf dem freien Platz. Die 24 Aufstellungen liefen in vier Entscheidungsmodellen mit jeweils 10.000 gleichen Zufallsstarts pro Modell und Aufstellung. Das ergibt **960.000 simulierte Partien**.

Die Tabelle zeigt den Anteil der Wolfssiege im Modell mit glaubwürdigen Hinweisen. Die Wölfe greifen dort ab Nacht zwei an. Die simulierte Dorfmatratze wählt zufällig unter den zulässigen Gastgebern.

| Weitere Sonderrollen | Mit gewöhnlichem Dorfbewohner | Mit Leibwächter | Mit Dorfmatratze |
| --- | ---: | ---: | ---: |
| Keine | 34,37 % | 32,85 % | 32,61 % |
| Hexe | 25,12 % | 23,32 % | 22,70 % |
| Jäger | 33,59 % | 32,10 % | 30,94 % |
| Dorftrottel | 31,27 % | 31,20 % | 31,10 % |
| Hexe und Jäger | 24,26 % | 21,99 % | 20,46 % |
| Hexe und Dorftrottel | 23,54 % | 22,73 % | 22,05 % |
| Jäger und Dorftrottel | 31,86 % | 30,31 % | 29,50 % |
| Hexe, Jäger und Dorftrottel | 23,38 % | 21,33 % | 20,50 % |

Beide Rollen bleiben für sechs Spieler wählbar. In diesem Modell liegen sie bei jeder Aufstellung höchstens 1,53 Prozentpunkte auseinander. Die Zahlen gelten für die simulierten Entscheidungen.


## Jägerschuss: freiwillig oder verpflichtend

Vor Spielbeginn wird eine der beiden Varianten festgelegt (`hunterShot`):

- **Freiwillig (Standard):** Der ausgeschiedene Jäger darf ein lebendes Ziel wählen oder ohne Schuss fortfahren.
- **Verpflichtend:** Der ausgeschiedene Jäger muss ein lebendes Ziel wählen. Überspringen wird von der Spiellogik abgewiesen, solange es noch lebende Ziele gibt. Sind alle anderen bereits tot, darf die Auflösung ohne Schuss abgeschlossen werden.

Dies gilt sowohl nach einer Tagesabstimmung als auch bei der Morgenauflösung und für einen sterbenden Trunkenbold mit tatsächlicher Jägerrolle, nachdem er diese erfahren hat. Die Jägeraktion wird vor der abschließenden Siegprüfung abgewickelt. Tote, unbekannte Ziele und veraltete Aktionen werden abgewiesen.

Eine verpflichtende Zielwahl garantiert keinen Tod: Das Schutzamulett schützt auch vor diesem Schuss. Die Aktion ist damit verbraucht; es gibt keinen zweiten Versuch. Leibwächter und Dorfmatratze schützen nicht vor dem Jägerschuss. Die maximale Todesfolge von acht Personen steigt dadurch nicht.

Die Einstellung gilt für feste und variable Rollenauswahl gleichermaßen. Die spätere Oberfläche muss beide Optionen anbieten; dieser Schritt ergänzt ausschließlich die Logik. Bestehende Simulationsarchive verwenden den freiwilligen Standard. Für Besetzungen mit verpflichtendem Jägerschuss gelten Balanceaussagen bis zur eigenen Kalibrierung als vorläufig; Punktwerte werden nicht erfunden.


## Stichprobenprüfung für neunzehn Spieler

**Festgelegt: mindestens drei Wölfe, allgemeiner Standard vier, höchstens fünf.** Eine Seherin bleibt Pflicht. Spielerzahlen zählen ohne Erzähler. Alle bisher freigegebenen Sonderrollen und Items stehen zur Verfügung. Hexe und Magier sind bei vier oder fünf Wölfen gemeinsam erlaubt; bei drei bleiben sie Alternativen. Leibwächter und Dorfmatratze sind weiterhin immer gegenseitig ausgeschlossen. Bei maximal zwölf optionalen Rollenkarten bleiben mit vier Wölfen zwei und mit fünf Wölfen ein normaler Dorfbewohner; Amulett und Trunkenbold belegen keine zusätzlichen Plätze.

### Originalregeln und Methodik

Das erneut geprüfte [Ultimate-Regelheft, Szenarien und eigene Besetzungen, S. 11–14](https://board-game-rules.com/wp-content/uploads/2025/01/ultimate-werewolf-ultimate-edition_Official-Rules.pdf#page=11) nennt keine feste 19er-Besetzung. Die Grundtabelle endet bei 15. Das 16er-Beispiel hat drei Wölfe plus einen Wolfshelfer; das 21er-Beispiel vier Wölfe plus zwei Wolfshelfer und weitere Sieggruppen. Beides lässt sich nicht als pauschale Wolfszahl für unsere Rollen übernehmen. Das Original empfiehlt Rollenwerte, gewöhnliche Dorfbewohner und Anpassung an die Spielerfahrung. Die hier festgelegten Grenzen sind GameHub-Entscheidungen.

Auf ausdrücklichen Wunsch wurden **Stichproben statt sämtlicher Kombinationen** ausgewertet:

- 64 mit festem Zufallsstart gezogene zulässige Konfigurationen ohne gemeinsame Heiler, jeweils dieselben Besetzungen für drei, vier, fünf und sechs Wölfe; dazu Grundbesetzung als Kontrolle.
- 16 weitere Konfigurationen mit Hexe und Magier gemeinsam, separat für vier, fünf und sechs Wölfe; dazu je eine Grundkontrolle.
- Acht feste Randbesetzungen von Grundbesetzung über nur Hexe bis zu fast ausschließlich Sonderrollen.
- 128 gemeinsame Zufallsstarts je gezogener Konfiguration, 1.000 je fester Randbesetzung, jeweils in fünf Verhaltensmodellen. Zwei Wölfe zusätzlich in vier schwach bis mäßig ausgestatteten Besetzungen mit jeweils 1.000 Starts und fünf Modellen geprüft.

Insgesamt **379.040 vollständig abgeschlossene Modellpartien**. Die Daten enthalten 60 Modell-/Vergleichsdatensätze; Spielerzahl, eindeutige Kennungen, Ergebnissummen und gleiche Besetzungen über die Wolfszahlen wurden geprüft. [Komprimierte Rohdaten](simulations/werewolf-nineteen-player-samples.jsonl.gz), [Zusammenfassung mit Prüfsumme und Grenzen](simulations/werewolf-nineteen-player-summary.json). Keine neuen Partien erforderlich, um diese Ergebnisse erneut auszuwerten.

### Ergebnisse der gemeinsamen Stichprobe

Nur die 64 gezogenen Konfigurationen, ohne zusätzliche Grundkontrolle und ohne gemeinsam eingesetzte Heiler. Jede Konfiguration zählt gleich viel. Die drei Modelle mit Informationsaustausch werden einzeln dargestellt:

| Wölfe | Geteilte Hinweise | Wolfsjagd ab erster Nacht | Zusätzliche Ermittlerhinweise |
| ---: | ---: | ---: | ---: |
| 3 | 36,35 % | 39,55 % | 35,42 % |
| 4 | 48,25 % | 53,15 % | 48,46 % |
| 5 | 65,54 % | 72,27 % | 64,79 % |
| 6 | 76,93 % | 80,20 % | 76,34 % |

**Vier sind der beste allgemeine Standard dieser Stichprobe:** In allen drei Referenzmodellen am nächsten an einer ausgeglichenen Verteilung. Drei bleiben für schwache Dorfbesetzungen sinnvoll. Mit nur Seherin und gewöhnlichen Dorfbewohnern gewinnen drei Wölfe in den Informationsmodellen etwa 52–58 %, zwei nur 34–39 %. Sechs Wölfe dominieren die gemeinsame Stichprobe mit rund 76–80 % und werden nicht freigegeben. Fünf sind für stärkere Dorfbesetzungen vorgesehen, keine pauschale Empfehlung für wenige Sonderrollen.

Bei Hexe und Magier gemeinsam liegen vier Wölfe in den drei Referenzmodellen bei 36,52 % / 41,36 % / 34,67 %, fünf bei 51,46 % / 54,25 % / 50,54 %. Daher bleiben beide Rollen gemeinsam ab vier Wölfen erlaubt; bei ausgeprägtem Dorfschutz sind fünf eher passend.

### Aussagegrenzen und technische Freigabe

Das sind **keine gemessenen Gewinnwahrscheinlichkeiten menschlicher Gruppen** und kein Beweis für jede Kombination. Zufälliges Raten und vorsichtige Hexe ohne geteilte Informationen dienen als getrennte Kontrollmodelle; sie ergeben deutlich andere Werte. Die Aussage hängt von Diskussion, Verdacht und Informationsweitergabe ab. Pro einzelner gezogener Konfiguration sind 128 Partien grob: maximal etwa ±8,7 Prozentpunkte nominaler binomialer 95%-Fehler, bei 1.000 etwa ±3,1. Gemeinsame Zufallsstarts und wiederverwendete Konfigurationen machen die Gesamtheit abhängig; daraus wird kein scheinpräzises Gesamt-Konfidenzintervall abgeleitet.

Die Jägerstrategie wählt in beiden Einstellungen stets ein lebendes Ziel. Deshalb werden freiwilliger Verzicht und seine Balancewirkung nicht mit diesen Daten bewertet. Die Balancepartien verwenden offene Rollenaufdeckung; verdeckte Rollen werden separat auf korrekte Abläufe geprüft.

Zwei und sechs Wölfe waren nur für die Forschungsdurchläufe vorübergehend zugelassen; normale Spieleinstiege, Zufall und Punktebewertung weisen beide Grenzen jetzt zurück. Der gespeicherte Datensatz bleibt zur Auswertung erhalten. Die im Repository verbleibenden Stichprobentests laufen nur mit den freigegebenen drei bis fünf Wölfen. 20 wurde anschließend auf ausdrücklichen Auftrag separat geprüft, siehe folgenden Bericht.

Das bisherige Punktmodell wird nicht auf diese Stichprobe neu angepasst. Für 19 wird nur das vorläufige Spielerziel −17,5 aus den Vorgängern fortgeschrieben; die API markiert Empfehlungen ausdrücklich als vorläufig. Die verbindliche automatische Wolfszuteilung bleibt die separat geplante Validierungsaufgabe We-03-50.

149 gezielte Werwolf-Tests bestanden. Zusätzlich laufen für jede der drei freigegebenen Wolfszahlen 32 vollständige zufällige Entscheidungsszenarien (zusammen 96) mit Prüfungen erlaubter und unerlaubter Aktionen, veralteter Ereignisse, offener/verdeckter Rollen, Pflicht-/Wahlschuss, Amulett, Trunkenbold und Nachtangriff ab erster Nacht. Zustandsmaschine: 99,18 % Zeilen- und 95,84 % Zweigabdeckung.


## Stichprobenprüfung für zwanzig Spieler

**Festgelegt: mindestens drei Wölfe, allgemeiner Standard vier, höchstens fünf.** Eine Seherin bleibt Pflicht. Der Erzähler wird nicht mitgezählt. Alle bisherigen optionalen Rollen und Items sind verfügbar, ohne neue Rollen einzuführen. Hexe und Magier dürfen bei vier oder fünf Wölfen gemeinsam spielen; bei drei sind sie Alternativen. Leibwächter und Dorfmatratze bleiben unabhängig von der Spielerzahl gegenseitig ausgeschlossen. Bei zwölf optionalen Rollenkarten plus Seherin bleiben mit vier Wölfen drei normale Dorfbewohner und mit fünf Wölfen zwei. Items belegen keine zusätzlichen Spielerplätze.

### Originalabgleich

Das [Originalregelheft, Szenario „Village of Voices“, S. 12](https://board-game-rules.com/wp-content/uploads/2025/01/ultimate-werewolf-ultimate-edition_Official-Rules.pdf#page=12) enthält ausdrücklich ein Beispiel für 20 Spieler: zwei normale Werwölfe, ein Wolfsjunges, ein einsamer Wolf und ein Wolfshelfer sowie sechs gewöhnliche Dorfbewohner und weitere Rollen. Das sind vier Wolfsrollen mit zusätzlichen Besonderheiten, keine Empfehlung für lediglich zwei GameHub-Wölfe. GameHub hat weder Wolfsjunges noch Wolfshelfer; daher dient dieses Szenario nur zur Einordnung. Rollenwerte und eigene Gruppenerfahrung bleiben laut [Hinweisen für eigene Besetzungen, S. 13–14](https://board-game-rules.com/wp-content/uploads/2025/01/ultimate-werewolf-ultimate-edition_Official-Rules.pdf#page=13) entscheidend.

### Methode und archivierte Ergebnisse

Wie für 19 ausdrücklich **Stichproben statt vollständiger Kombinationsprüfung**: 64 neu gezogene gemeinsame Konfigurationen plus Grundkontrolle für drei bis sechs Wölfe, 16 neu gezogene gemeinsame Heilerkonfigurationen plus Grundkontrolle für vier bis sechs Wölfe, acht feste schwache/starke Randbesetzungen. Die Ziehung verwendet feste Startwerte 20001 und 20002. Es wurden 128 gleiche Spielstarts pro gezogener Konfiguration und 1.000 pro Randbesetzung in fünf getrennten Modellen verwendet. Zwei Wölfe wurden zusätzlich in vier schwächeren Besetzungen mit je 1.000 Starts und fünf Modellen geprüft.

**379.040 vollständig abgeschlossene Modellpartien** in 60 Ergebnisdatensätzen. Spielerzahl 20, vollständige Ergebnissummen, eindeutige Kennungen und dieselben Konfigurationen über die Wolfszahlen wurden geprüft. [Rohdaten](simulations/werewolf-twenty-player-samples.jsonl.gz) und [Zusammenfassung mit Prüfsumme](simulations/werewolf-twenty-player-summary.json) sind gespeichert; spätere Auswertungen benötigen keine erneuten Partien.

Die gemeinsame Stichprobe ohne gleichzeitige Heiler und ohne Grundkontrolle ergibt:

| Wölfe | Geteilte Hinweise | Wolfsjagd ab erster Nacht | Zusätzliche Ermittlerhinweise |
| ---: | ---: | ---: | ---: |
| 3 | 36,49 % | 41,82 % | 34,50 % |
| 4 | 50,40 % | 54,69 % | 48,65 % |
| 5 | 61,96 % | 64,84 % | 59,86 % |
| 6 | 73,68 % | 78,45 % | 73,33 % |

Vier liegen in jedem der drei Informationsmodelle am nächsten an 50 % und bleiben damit der allgemeine Standard. In der Grundbesetzung ohne optionale Rollen erreichen drei Wölfe rund 50–55 %, zwei nur 35–37 %. Drei bleiben die Untergrenze für ein schwächeres Dorf; bei starken Dorfrollen sind sie keine pauschale Empfehlung. Sechs dominieren die gemeinsame Stichprobe mit rund 73–78 % und werden nicht freigegeben.

Mit Hexe und Magier gemeinsam erreichen vier Wölfe 36,52 % / 40,28 % / 35,50 %, fünf 45,31 % / 52,49 % / 45,51 %. Fünf sind damit besonders für stärkere Dorfbesetzungen geeignet. Die bereits freigegebene gemeinsame Heilerwahl bei vier bleibt verfügbar; eine rollenabhängige Festlegung ist später Aufgabe des Systems.

### Grenzen und Abschluss der Spielerzahlprüfung

Die Quoten sind **Modellwerte, keine gemessenen menschlichen Gewinnwahrscheinlichkeiten**. Keine Vollständigkeit sämtlicher Kombinationen oder Entscheidungen wird behauptet. Die drei Informationsmodelle und die Zufalls-/Hexen-Kontrollmodelle werden getrennt ausgewertet. Gemeinsame Spielstarts erzeugen abhängige Daten. Pro einzelner Konfiguration liegt der nominelle maximale binomiale 95%-Fehler bei etwa ±8,7 Prozentpunkten für 128 beziehungsweise ±3,1 für 1.000 Partien; dies ist kein Gesamt-Konfidenzintervall über alle abhängigen Daten.

Die Jägerstrategie schießt immer auf ein lebendes Ziel und untersucht daher nicht den Nutzen freiwilligen Verzichts. Balancepartien verwenden offene Rollen. Separate Ablaufprüfungen enthalten verdeckte Rollen, beide Jägereinstellungen und unerlaubte/veraltete Ereignisse. Zwei und sechs Wölfe waren nur für die Forschungsdurchläufe vorübergehend verfügbar; normale und bewertete Spieleinstiege sowie Zufallsaufstellung weisen sie jetzt zurück. Die verbleibenden Stichprobentests verwenden drei bis fünf.

154 gezielte Tests bestanden. Dazu 96 vollständige Entscheidungsszenarien für 20 Spieler (32 je freigegebener Wolfszahl), Prüfungen beider Heiler zusammen und 76 gezielt ausgewählte benannte Stimmverteilungen am 20er-Tisch einschließlich Mehrheitsschwellen mit Bürgermeister und Dorftrottel sowie ungültiger Stimmabgaben. Zustandsmaschine: 99,18 % Zeilen- und 95,84 % Zweigabdeckung.

Damit ist die **Prüfung der Spielerzahlen 6–20 abgeschlossen**. Die Obergrenze der Spiellogik ist nun fest 20 Mitspielende plus Erzähler; 21 und mehr werden abgewiesen. Keine UI ergänzt. Die Werteempfehlung bleibt für 20 ausdrücklich vorläufig: Spielerziel −19 aus den beiden Vorgängern fortgeschrieben, keine neue Kalibrierung anhand der Stichprobe. Die Validierung der verbindlichen automatischen Wolfszuteilung (We-03-50) und der variablen Rollen-/Itembereiche (We-03-52) bleiben eigenständige offene Aufgaben.


## Erneuter Vergleich: ein oder zwei Wölfe bei acht Spielern

**Prüfergebnis vom 18.11.2026:** Die bisherige pauschale Ablehnung von zwei Wölfen ist für starke Dorfbesetzungen zu streng. Vorschlag: **ein bis zwei erlauben, zwei als allgemeine Empfehlung für Runden mit Sonderrollen und Informationsaustausch**, einen für schwache Dorfbesetzungen. Die Empfehlung wurde anschließend bestätigt und übernommen: Normale und bewertete Spieleinstiege erlauben einen oder zwei Wölfe; allgemeiner Standard ist zwei. Mit zwei Wölfen bleiben höchstens fünf optionale Rollenplätze. Trunkenbold bleibt unabhängig davon erst ab neun Spielern verfügbar.

Das [Originalregelheft, Grundbesetzung S. 1](https://board-game-rules.com/wp-content/uploads/2025/01/ultimate-werewolf-ultimate-edition_Official-Rules.pdf#page=1) nennt einen Wolf für sechs bis acht Spieler, ausdrücklich mit Seherin und ansonsten normalen Dorfbewohnern. Das ist kein belastbarer Grund, auch jede Sonderrollenbesetzung auf einen Wolf zu begrenzen.

Verglichen wurden alle **318** Rollen-Teilmengen der freigegebenen Achter-Auswahl, die mit beiden Wolfszahlen auf acht Plätze passen, mit beiden Gerber-Zielen **459 Konfigurationen**. Jede lief in vier Modellen mit denselben 128 Spielstarts je Wolfszahl. Zehn feste Randbesetzungen liefen zusätzlich mit je 4.000 Starts pro Modell und Wolfszahl. Insgesamt **790.016 vollständig abgeschlossene Modellpartien**. Sechser-Sonderrollenbesetzungen mit einem Wolf sind vom direkten Vergleich ausgeschlossen: Neben zwei Wölfen und Seherin passen höchstens fünf optionale Rollenkarten. Trunkenbold und Amulett wurden nicht hinzugenommen.

### Anteil der Wolfssiege in den gezielten Aufstellungen

In jeder Zeile ist eine Seherin zusätzlich fest enthalten. Beide Referenzmodelle haben Informationsweitergabe; das zweite erlaubt Wolfsangriffe ab Nacht eins und seltene Abstimmungen nach einer ruhigen zweiten Nacht.

| Optionale Rollen | 1 Wolf, geteilte Hinweise | 2 Wölfe, geteilte Hinweise | 1 Wolf, Angriff ab Nacht 1 | 2 Wölfe, Angriff ab Nacht 1 |
| --- | ---: | ---: | ---: | ---: |
| Keine | 30,18 % | 63,00 % | 39,70 % | 74,65 % |
| Hexe | 22,23 % | 50,55 % | 30,83 % | 64,68 % |
| Hexe und Jäger | 20,95 % | 49,63 % | 29,63 % | 62,72 % |
| Hexe, Jäger, Dorftrottel und Leibwächter | 19,45 % | 46,60 % | 26,38 % | 56,57 % |
| Hexe, Jäger, Dorftrottel und Dorfmatratze | 19,23 % | 44,10 % | 25,55 % | 53,57 % |
| Hexe, Jäger, Dorftrottel, Leibwächter und Seher-Lehrling | 15,28 % | 41,35 % | 21,18 % | 51,50 % |

Über die 459 gemeinsamen Konfigurationen erreichen ein Wolf in den beiden Informationsmodellen rund 26–31 %, zwei rund 52,29 % / 64,51 %. Das spricht im Vergleich für zwei als allgemeinen Ausgangswert in sonderrollenreichen Runden. Ohne optionale Rollen sind zwei jedoch mit rund 63–75 % deutlich im Vorteil. Die Zufalls- und vorsichtige-Hexe-Kontrollmodelle werden separat ausgewiesen; ohne wirksamen Informationsaustausch liegt ein Wolf näher an einer ausgeglichenen Quote. Deshalb lässt sich keine universelle menschliche Gewinnwahrscheinlichkeit daraus ableiten.

[Gespeicherte Rohdaten](simulations/werewolf-eight-player-wolf-recheck.jsonl.gz), [Zusammenfassung mit Prüfsumme und Aussagegrenzen](simulations/werewolf-eight-player-wolf-recheck-summary.json). Sämtliche Ergebnissummen, Spielerzahl acht, eindeutige Konfigurationen und gleiche Besetzungen über beide Wolfszahlen geprüft. Der nominelle maximale binomiale 95%-Fehler einer einzelnen 4.000-Partien-Zeile beträgt etwa ±1,6 Prozentpunkte; bei 128 Partien ±8,7. Abhängige Spielstarts und Modellannahmen begrenzen die Aussage stärker als diese Stichprobenfehler.


## Nachprüfung der festen Wolfszahlen für 7, 9, 10 und 11 Spieler

### Ergebnis und Freigabestatus

| Spieler | Bisher regulär | Ergebnis der Nachprüfung | Vorschlag |
| ---: | --- | --- | --- |
| 7 | Früher genau ein Wolf | Stark von Sonderrollen und Verhalten abhängig; Referenzmodelle sind bei der allgemeinen Empfehlung uneinig. | Einen als konservativen Standard behalten; zwei für starke Dorfbesetzungen erwägen. |
| 9 | Genau zwei Wölfe | Zwei deutlich passender als eins oder drei. | Zwei beibehalten. |
| 10 | Genau zwei Wölfe | Zwei bleiben der klare allgemeine Ausgangswert. | Zwei beibehalten; drei nicht pauschal freigeben. |
| 11 | Früher genau zwei Wölfe | Zwei insgesamt passender; drei können bei starken Magier-Aufstellungen besser sein. | Zwei als Standard behalten, drei für gezielte starke Dorfbesetzungen erwägen. |

Die Vorschläge für 7 und 11 wurden anschließend bestätigt und sind nun als normale Auswahl freigegeben: 7 mit einem oder zwei Wölfen (Standard eins), 11 mit zwei oder drei (Standard zwei). Dagegen ist die gesondert bestätigte Achter-Regel **bereits übernommen**: ein bis zwei Wölfe, zwei als allgemeiner Standard, höchstens fünf optionale Rollenkarten bei zwei Wölfen. Eine größere Anzahl gewählter Sonderrollen verlangt gegebenenfalls einen Wolf. Trunkenbold bleibt erst ab neun Spielern möglich.

### Gleiche Modelle, gepaarte Vergleiche

Wie beim Achter-Vergleich werden Zufallsentscheidungen, vorsichtige Hexe, geteilte Hinweise und Wolfsangriff ab erster Nacht mit vorsichtiger Abstimmung nach ruhiger zweiter Nacht geprüft. Die beiden Informationsmodelle bilden den Bezug; die anderen bleiben getrennte Kontrollen. Das Original nennt [einen Wolf bei 6–8 und zwei bei 9–11 in der Grundbesetzung, S. 1](https://board-game-rules.com/wp-content/uploads/2025/01/ultimate-werewolf-ultimate-edition_Official-Rules.pdf#page=1). GameHub-Sonderrollen erfordern eine eigene Bewertung.

- Bei 7 wurden ein und zwei Wölfe geprüft; bei 9–11 jeweils ein, zwei und drei.
- Die zulässigen Rollen-Teilmengen wurden erzeugt, beide Gerber-Bedingungen getrennt berücksichtigt und mit Startwert 58000 plus Spielerzahl gemischt. Höchstens 256 Konfigurationen plus Grundkontrolle wurden übernommen; bei 7 sind alle 83 Konfigurationen einschließlich Grundkontrolle enthalten. Jede läuft mit denselben 128 Spielstarts bei jeder Wolfszahl.
- Gezielte schwache und starke Aufstellungen laufen zusätzlich mit je 4.000 gemeinsamen Starts. Ergänzende Varianten von Trunkenbold, Amulett, Bürgermeister und Selbstwahl der Alten Vettel laufen mit 2.000 Starts. Es kommen nur die für die jeweilige Spielerzahl verfügbaren Rollen und Zusätze hinzu. Hexe und Magier bleiben bei 11 stets Alternativen.
- Gemeinsame Aufstellungen müssen auch mit der höchsten verglichenen Wolfszahl passen: maximal vier Sonderrollen bei 7, fünf bei 9, sechs bei 10 und sieben bei 11. Größere Aufstellungen, die nur mit weniger Wölfen passen, sind von diesem direkten Vergleich ausgeschlossen. Trunkenbold ist mit einem Wolf nicht erlaubt; entsprechende Optionsgruppen sind daher bewusst nicht über alle Wolfszahlen identisch und werden nicht in den gemeinsamen Vergleich gemischt.

Insgesamt **3.949.248 vollständig beendete Modellpartien**, 124 Ergebnisdatensätze und elf bestandene Vergleichstests. Aufteilung: 7 Spieler: 244.992; 9 Spieler: 1.074.752; 10 Spieler: 1.266.752; 11 Spieler: 1.362.752. Alle Ergebnissummen, Spielerzahlen, eindeutigen Kennungen und gepaarten gemeinsamen Besetzungen geprüft. [Archiv](simulations/werewolf-small-fixed-count-rechecks.jsonl.gz), [Zusammenfassung mit Prüfsumme und Grenzen](simulations/werewolf-small-fixed-count-rechecks-summary.json). Zur erneuten Auswertung sind keine neuen Simulationen nötig.

### Wolfssiege in der gemeinsamen Stichprobe

Je Feld werden geteilte Hinweise und Angriff ab erster Nacht getrennt durch einen Schrägstrich angegeben. Jede gewählte Konfiguration zählt gleich viel.

| Spieler | Ein Wolf | Zwei Wölfe | Drei Wölfe |
| ---: | ---: | ---: | ---: |
| 7 | 27,92 % / 36,56 % | 58,74 % / 70,71 % | Nicht geprüft |
| 9 | 23,14 % / 31,22 % | 52,79 % / 62,72 % | 74,19 % / 84,99 % |
| 10 | 21,33 % / 26,56 % | 46,26 % / 55,50 % | 70,04 % / 79,20 % |
| 11 | 17,07 % / 20,21 % | 37,89 % / 45,37 % | 64,36 % / 71,45 % |

### Wichtige konkrete Fälle

Bei sieben Spielern gewinnen zwei Wölfe ohne optionale Rollen rund **68–82 %**, ein Wolf **33–45 %**. Mit Hexe, Jäger, Dorftrottel und Leibwächter sind es bei zwei Wölfen **47–60 %**, bei einem **21–27 %**. Zwei sind für diese starke Aufstellung plausibel, aber keine pauschale Verbesserung für jede Siebener-Runde.

Bei elf Spielern mit **Magier, Jäger, Dorftrottel und Leibwächter** gewinnen zwei Wölfe nur **30–34 %**, drei dagegen **49–56 %**. Mit lediglich Seherin und gewöhnlichen Dorfbewohnern liegen zwei bei **51–61 %**, drei bei **74–83 %**. Eine rollenabhängige Ausnahme ist hier sinnvoller als ein pauschaler Wechsel auf drei.

### Grenzen und Umsetzung der bestätigten Achter-Regel

Es handelt sich um **Modellwerte**, keine gemessenen Gewinnwahrscheinlichkeiten menschlicher Gruppen. Je nach glaubwürdiger Seherin, Informationsaustausch, Hexenverhalten und Abstimmung unterscheiden sich die Ergebnisse. Modelle mit wenig Informationsaustausch können einen Wolf günstiger bewerten. Offene Rollenaufdeckung ist für diese Balance-Läufe eingestellt. Der Jäger schießt immer, wenn ein lebendes Ziel vorhanden ist; die Wirkung freiwilligen Verzichts ist nicht geschätzt. Die 128 Starts pro gemeinsamer Konfiguration sind eine grobe Stichprobe; die 4.000 Starts pro gezielter Aufstellung haben nominell maximal etwa ±1,6 Prozentpunkte binomialen 95%-Fehler, die 2.000 etwa ±2,2. Abhängige Spielstarts begrenzen die Aussage darüber hinaus; kein naives Gesamt-Konfidenzintervall.

Die neue Achter-Freigabe ist in Konfiguration und normalen/bewerteten Spieleinstiegen sowie Zufallsaufstellung berücksichtigt. Standard zwei; ein Wolf bleibt erlaubt; drei werden abgewiesen. Sechs optionale Rollen passen nur mit einem Wolf. Der Trunkenbold bleibt unabhängig von den zwei Wölfen bis neun gesperrt. Historische Achter-Testaufstellungen verwenden ihren bisherigen einen Wolf ausdrücklich, damit alte Archive reproduzierbar bleiben. Die Punkte wurden nicht neu kalibriert. 155 gezielte Tests bestanden, Zustandsmaschine 99,18 % Zeilen- und 95,85 % Zweigabdeckung; zusätzliche Achter-Szenarien prüfen beide Wolfszahlen und unerlaubte/veraltete Aktionen.


### Bestätigte Zusatzoptionen für 7 und 11 Spieler

Die Zusatzoptionen sind verbindlich bestätigt und in der Logik sowie den tatsächlich verwendeten HTML-Tabellen übernommen:

| Spieler | Erlaubte Wölfe | Allgemeiner Standard | Freie optionale Rollenplätze |
| ---: | --- | ---: | --- |
| 7 | 1 oder 2 | 1 | 5 bei einem Wolf, 4 bei zwei |
| 11 | 2 oder 3 | 2 | 8 bei zwei Wölfen, 7 bei drei |

Die normalen und bewerteten Spieleinstiege sowie der Zufallsmodus halten diese Grenzen ein. Es entstehen keine zusätzlichen Rollen- oder Itemfreigaben: Trunkenbold bleibt erst ab neun verfügbar; bei elf bleiben Hexe und Magier immer Alternativen. Leibwächter und Dorfmatratze bleiben gegenseitig ausgeschlossen. Bei neun und zehn gilt weiter immer genau zwei. Keine erneuten Simulationen erforderlich; zugrunde liegen die gespeicherten gepaarten Nachprüfungen. Die Punktwerte werden nicht neu kalibriert, die vollständige Validierung der späteren verpflichtenden Automatik bleibt eine eigene Aufgabe.


## Abgeschlossener automatischer Spieleinstieg (We-03-50)

`createBalancedWerewolf` und `createRandomWerewolf` verwenden den normalen automatischen Resolver. Er prüft ausschließlich `availableWerewolfCounts`, ignoriert übergebene `wolfCount`/`wolfCountMode` und übernimmt die erste gültige Besetzung mit kleinstem Punkteabstand. Bei Gleichstand gewinnt der allgemeine Standard, danach die kleinere Wolfszahl. Gleiche Rollen werden vor der Auswahl stabil sortiert. Unverfügbare Rollen/Items, ungültige Optionen, Platzkonflikte und ungültige Zufallswerte werden abgewiesen; sämtliche Zufallswerte werden auch während Rollen-, Trunkenbold- und Amulettvergabe geprüft. Direkte Zustandsmaschinen-/Bewertungsfunktionen bleiben für Forschung und Regressionstests mit expliziten Werten erhalten.

Die ursprünglichen Rollenpunktwerte werden nicht als neue Kalibrierung ausgegeben. Für die normale Auswahl wurden die Spieler-Grundwerte für 7/8 auf −4 und für 11 auf −7 korrigiert: Eine einfache Dorfbesetzung soll weniger Wölfe erhalten als die gespeicherten starken Hexen-/Magierfälle. Die Zielwerte der Kandidaten lauten Grundwert plus sieben je Wolf. Für übrige Spielerzahlen gelten die bisherigen Zielwerte, begrenzt auf freigegebene Kandidaten. Die automatische Bewertung bleibt ausdrücklich vorläufig und garantiert keine ausgeglichenen menschlichen Gewinnchancen.

[Offline-Prüfbericht](simulations/werewolf-automatic-policy-audit.json): 3.146 archivierte Konfigurations-/Modellgruppen aus den Achter-, kleinen Spielerzahl-, Neunzehner- und Zwanziger-Vergleichen geprüft, 3.142 mit einem beobachteten Ergebnis für den gewählten Kandidaten. Beschreibende mittlere Zusatzabweichung vom besten im jeweiligen Modell beobachteten erlaubten Kandidaten liegt je Archiv bei rund 0,4–2,6 Prozentpunkten. Gemeinsame Zufallsstarts, Modellauswahl und Stichproben begrenzen die Aussage; dies ist weder eine unabhängige Validierung menschlichen Spielverhaltens noch eine neue Gewinnprognose. Keine Simulationen erneut gestartet. Gezielte Tests prüfen zusätzliche schwache/starke Besetzungen und Grenzen von 6–20.


## Historischer variabler Rollen- und Itemmodus (We-03-52; ersetzt durch We-03-67)

Die Einrichtung verwendet dieselbe Spieleraufbereitung und denselben privaten `WerewolfState` wie feste Aufstellungen. Es gibt keine zweite Zustandsmaschine und keine zusätzliche dauerhafte Speicherung. Der neue Modus liefert die fertige Aufstellung genau einmal vor der Rollenverteilung. Rollen bleiben danach fest. Die Oberfläche darf nur das öffentliche Machbarkeitsergebnis und die erlaubten Bereiche anzeigen; die gezogene Aufstellung und vollständige Spielzustände gehören ausschließlich zur Spielleitung.

### Eingaben und Grenzen

- Rollenpool: beliebige verfügbare Sonderrollen, höchstens einmal je Karte. Alternativen dürfen gemeinsam im Pool stehen, aber nie unzulässig gemeinsam gezogen werden. Wolfsrollen und Seherin sind Pflichtbestandteile und gehören nicht in diesen Pool.
- Rollenbereich: inklusive Mindest- und Höchstzahl verschiedener optionaler Karten. Beide Werte müssen ganze, nichtnegative Zahlen sein, Mindestwert höchstens Höchstwert und Höchstwert höchstens Poolgröße.
- Itempool: Trunkenbold ab neun und Schutzamulett ab zehn. Beide dürfen höchstens einmal enthalten sein. Der getrennte Itembereich funktioniert genauso und zählt keine Spielerplätze. Trunkenbold wird als optionaler Zusatz und nicht als weitere Rollenkarte behandelt.
- Übrige Partieeinstellungen gelten weiter. Die Wolfszahl bestimmt ausschließlich der automatische Resolver. Übergebene manuelle Wolfswerte sowie feste Amulett-/Trunkenbold-Schalter können den variablen Pool nicht übersteuern.

### Festgelegte Ziehungsverteilung

Zuerst werden sämtliche gültigen Rollen-/Item-Teilmengen innerhalb der Bereiche ermittelt. Vor der Ziehung wird nur geprüft, ob mindestens eine erlaubte Wolfszahl genügend Rollenplätze lässt und die Kombination grundsätzlich zulässig ist. Es werden dabei weder Rollenpunkte berechnet noch Wolfszahlen ausgewählt. Anschließend gilt:

1. Alle **machbaren Paare aus optionaler Rollenanzahl und Itemanzahl** werden gleich gewichtet gezogen.
2. Innerhalb des gezogenen Zahlenpaars sind sämtliche gültigen Kombinationen aus konkreten Rollenkarten und Items gleich wahrscheinlich.
3. Erst nach der Auswahl der konkreten Rollen und Items berechnet das System für diese Ziehung die Wolfszahl anhand der Rollenwerte und Partieeinstellungen. Anschließend werden freie Plätze mit Dorfbewohnern gefüllt und die fertigen Rollen an die Spieler verteilt.
4. Sind manche Zahlenpaare unmöglich, werden nur diese ausgeschlossen. Gibt es überhaupt kein gültiges Paar, bleibt der Start mit einem Fehlergrund gesperrt. Die Eingabebereiche werden nicht stillschweigend verändert.

Damit erhält eine Anzahl nicht allein deshalb mehr Gewicht, weil es dafür mehr Kartenkombinationen gibt. Bei frei wählbaren null bis zwei Rollen und null bis zwei verfügbaren Items sind beispielsweise neun Zahlenpaare gleich gewichtet, sofern sie alle machbar sind. Innerhalb eines Paars mit genau einem Item sind Amulett und Trunkenbold gleich wahrscheinlich. Unter diesen symmetrischen Bedingungen ist jedes Item insgesamt mit 50 % vertreten; eingeschränkte Bereiche oder Machbarkeit können diese Wahrscheinlichkeit verändern. Ein Mindestwert von eins bei einem Itempool nur aus Amulett erzwingt dagegen dessen Teilnahme.

Das ausgewählte Amulett startet weiterhin bei einer zufälligen erlaubten Nichtwolf-Person; der Trunkenbold darf weiterhin nicht über Amor liegen. Beide Funktionen verwenden die vorhandene Zustandsmaschine und denselben injizierten Zufallsgenerator. Alle Werte des Generators werden auch während Austeilen und Zusatzvergabe geprüft.

### Machbarkeit, Fehler und Integration

`analyzeVariableWerewolfSelection` verbraucht keinen Zufall und gibt nur verfügbare Zahlenpaare und die jeweilige Anzahl gültiger Kombinationen zurück, keine gezogenen Karten. `drawVariableWerewolfLineup` liefert die private Ziehung, `createVariableWerewolf` den fertigen privaten Spielzustand. Fehler sind stabile englische Codes für ungültige Spieler, Rollenpool, Itempool, Rollenbereich, Itembereich, Einstellungen, unmögliche Aufstellungen oder ungültige Zufallswerte. Die spätere UI übersetzt diese Codes. Bereits vor einer unmöglichen Aufstellung wird kein Zufall verbraucht.

Die Umsetzung begrenzt die Suche auf höchstens 8.192 Rollen-Teilmengen und vier Item-Teilmengen; vollständige lange Spielsimulationen sind dafür nicht erforderlich. Gleiche Pools werden vor der Auswahl kanonisch sortiert, damit eine andere Anklickreihenfolge bei gleichen Spielstarts keine andere Verteilung erzeugt.

**Prüfung:** 237 gezielte Tests bestehen. Neue Module für automatische/variable Einrichtung und ihre Spielzustandserzeugung erreichen 100 % Zeilen- und Zweigabdeckung; Zustandsmaschine 99,18 % Zeilen- und 95,85 % Zweigabdeckung. Tests prüfen die exakte Ziehungsverteilung über alle Zweige eines kleinen vollständigen Beispiels, alle Spielerzahlen 6–20, Pflichtrollen, erlaubte Wolfszahlen, Alternativen, Füllrollen, erzwungene/freiwillige Itemteilnahme, Startvergaben, Rollenverteilung ohne erneute Ziehung, ungültige Bereiche und Zufallswerte sowie öffentliche/private Daten. Typprüfung, Lint, Format und Architekturprüfung bestanden.

Damit sind die beiden Einrichtungsschritte abgeschlossen. Die UI-Planung ist als nächster eigener Arbeitsschritt möglich; Oberfläche, Übersetzungen der Fehlercodes und mobile Bedienung werden erst dort umgesetzt.


## Historische Reihenfolge: Ziehung vor Wolfsberechnung (ersetzt durch We-03-67)

Im variablen Modus gilt: **konkrete Sonderrollen und Items auslosen → Wolfszahl für diese Ziehung berechnen → mit Dorfbewohnern auffüllen → Rollen an Spieler verteilen**. Vor der Ziehung prüft eine reine Machbarkeitsfunktion ausschließlich Freigaben, Kombinationen und freie Plätze. Sie wählt keine Wolfszahl und verwendet keine Punktebewertung. Auch die öffentliche Machbarkeitsanalyse berechnet keine Rollenwerte.

Der exakte Zufallsmodus verwendet dieselbe Reihenfolge: erst die konkrete Teilmenge auswählen, dann bewerten. So beeinflusst die Punktzahl weder die Wahrscheinlichkeit einer Rollen-/Itemziehung noch die Auswahl aus dem markierten Pool. Ungültige Zufallswerte lösen überhaupt keine Wolfsbewertung aus. Nach der Auswahl werden ausschließlich die tatsächlich gezogenen Rollen und Items bewertet.

Die bestehenden Ziehungswahrscheinlichkeiten und Freigaben ändern sich nicht. Zusätzliche Tests überwachen den Bewertungsaufruf: kein Aufruf bei Machbarkeitsanalyse oder vor den Zufallsentscheidungen, danach ausschließlich mit den gezogenen Karten und Itemflags. 249 Tests sowie Typprüfung, Lint, Format und Architekturprüfung bestanden; neue Einrichtungslogik mit 100 % Zeilen-/Zweigabdeckung.


## Fortlaufende UI-Planung und Übergabe

Die bestätigte UI-Struktur und sämtliche weiteren Bedienentscheidungen werden in [GAMEHUB_WERWOLF_UI.md](GAMEHUB_WERWOLF_UI.md) festgehalten. Zuerst wird die Hauptansicht geplant, danach die Rollenkonfiguration und anschließend der Spielablauf. Bestätigte Anforderungen, Vorschläge und offene Punkte werden getrennt; die aktuelle Dokumentanlage ist noch keine abgeschlossene Hauptansicht-Spezifikation. Die tatsächlichen Entwicklungs-HTML-Dateien zeigen den Planungsstand und verlinken das Dokument.


## Hammer-Änderung vom 20.11.2026 – implementiert

Der Bürgermeister mit Hammer erwacht nach dem Magier und vor dem Spellcaster. Er kennt keine laufenden Nachtopfer und darf jede Person wählen, die zu Beginn der Nacht lebte, außer sich selbst. Auch ein bereits als Nachtopfer bestimmter Bürgermeister darf handeln. Ein Werwolf wird vom Hammer getroffen, selbst wenn bereits andere tödliche Angriffe gegen ihn vorliegen; jede Person stirbt nur einmal. Das Amulett schützt nicht vor dem Hammer, auch keinen getroffenen Werwolf. Bei Wahl eines Nichtwerwolfs stirbt der Bürgermeister durch die Fehlentscheidung, die Zielperson bleibt vom Hammer unberührt. Die Fehlentscheidungsstrafe wird nicht vom Amulett abgewehrt; ein verbundener Liebespartner stirbt mit. Todesfälle durch Hammer, Fehlentscheidung und dadurch ausgelöste Partnertode sind nicht heilbar. Bereits ausgeführte Nachtaktionen bleiben wirksam; gemeinsame Auflösung und Bekanntgabe am Morgen.

We-03-63 ist seit 20.11.2026 implementiert: Hammer nach Magier, Zielmenge vom Nachtbeginn, gemeinsame Todesauflösung und Überschneidungen geprüft. Magierheilung wurde nicht erweitert. Ziele, Tarnskript, Protokoll und Rücknahme siehe GAMEHUB_WERWOLF_NARRATOR_API.md.


### Bestätigter Zeitpunkt des Amulettschutzes

Präzisierung des Auftraggebers zum Amulett (aktuelle zweite Regelrunde): Entscheidend ist der Besitzer im Moment eines nächtlichen Wolfsangriffs, Gifts oder Todeszaubers. Eine frühere Abwehr bleibt nach der Weitergabe wirksam; neue Besitzer werden nicht rückwirkend gerettet. Hammer, Tagesabstimmung und jeder Jägerschuss umgehen das Amulett unabhängig vom Besitzer. Liebeskummer und bereits ausgelöste Verwundungen werden ebenfalls nicht abgewehrt. Nur ein tatsächlich abgewehrter Nachtangriff erzwingt die Weitergabe; bei Liebeskummer bleibt Behalten oder Weitergeben freiwillig.
