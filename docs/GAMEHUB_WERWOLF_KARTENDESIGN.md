# Werwolf: Vorlage für die Kartenbilder (We-01-236)

Stand: 2026-11-27. Die Bilder erstellt der Auftraggeber mit ChatGPT; Claude bereitet sie auf und baut sie ein.

## 1. Was gebraucht wird

- **18 Bilder:** eine gemeinsame **Rückseite** und **17 Vorderseiten** (16 Rollen und der Trunkenbold).
- Die Karte füllt am Handy die ganze Fläche der Rollenverteilung (Hochformat). Das Bild ist der **Hintergrund der Karte**; Rollenname, Fähigkeiten und Amulett zeichnet weiterhin die App darüber (Deutsch und Englisch, gut lesbar).

## 2. Technische Vorgaben (für jedes Bild gleich)

| Vorgabe | Wert |
|---|---|
| Format | **Hochformat 2:3**, in ChatGPT **1024 × 1536 Pixel** („portrait“) |
| Dateityp beim Herunterladen | PNG (Claude wandelt in WebP um, etwa 600 × 900, je ca. 60–90 kB) |
| Text im Bild | **keiner**: keine Buchstaben, Zahlen, Schilder, Banner, Namen |
| Rahmen, Ecken | **keine**: kein gezeichneter Kartenrand, keine abgerundeten Ecken (macht die App) |
| Hintergrund | **nicht transparent**, Bild füllt die ganze Fläche bis zum Rand |
| Hauptmotiv | **vollständig in den oberen 55 %** des Bildes, mittig |
| Sicherheitszone | Wichtiges nur in den **mittleren 70 % der Breite**: je nach Handy wird links und rechts etwas abgeschnitten |
| Freie Zonen | siehe Abschnitt 2a: dort liegen Symbole und Texte der App, das Bild zeigt dort nichts Wichtiges |
| Helligkeit | eher dunkel (Nacht), damit weiße Schrift darauf lesbar bleibt |
| Personen | eine Figur pro Karte (Ausnahme: Werwölfe dürfen ein Rudel sein), keine echten Personen, nichts Blutiges |

## 2a. Freie Zonen für Symbole und Texte der App

Damit die App nichts Wichtiges verdeckt, hat jedes Bild feste Zonen (Höhe von oben gemessen):

**Vorderseite (Rolle):**

| Bereich | Inhalt der App | Bild dort |
|---|---|---|
| 0–55 % | nichts | **Hauptmotiv** (Figur, Gesicht, Gegenstände) |
| 55–100 % | Rollenname, Symbole der Fähigkeiten, Amulett, Hinweis „Tippen zum Verdecken“ | nur **dunkler, gleichmäßiger Grund** (Nebel, Boden, Schatten), keine Gesichter, Hände oder Gegenstände |

**Rückseite:**

| Bereich | Inhalt der App | Bild dort |
|---|---|---|
| 0–30 % | nichts | Mond, Ornamente |
| 30–70 % | Name des Spielers und Hinweis | **ruhige, dunkle Fläche** ohne Details (gleichmäßiger Himmel oder Nebel) |
| 70–100 % | Hinweis „Tippen zum Aufdecken“ | Waldsilhouette, Dorf, nur dunkle Formen |

Claude legt die Texte und Symbole später genau in diese Bereiche und zeigt den Aufbau vorher als Zeichnung.

## 3. Ablauf in ChatGPT

1. **Einen neuen Chat nur für die Karten** öffnen und zuerst den **Stilblock** (Abschnitt 4) senden.
2. Zuerst **drei Probebilder**: Rückseite, Werwolf, Seherin. Passt der Stil, das **beste Probebild in denselben Chat zurückgeben** mit „Use this image as the style reference for all following cards.“
3. Danach jede Rolle mit **einer Nachricht** aus Abschnitt 6 erzeugen (immer im selben Chat, damit der Stil gleich bleibt).
4. Bei Abweichungen nachschärfen, zum Beispiel: „Same style as the reference, darker lower third, no text.“
5. Bilder mit dem **Dateinamen aus Abschnitt 6** speichern und in den Ordner `C:/Users/Kosta/Desktop/werwolf-karten/` legen (Claude holt sie dort ab).

Nutzungsrechte (Annahme, nicht geprüft): Laut den Nutzungsbedingungen von OpenAI gehören erzeugte Bilder dem Nutzer und dürfen in einer eigenen App verwendet werden. Vor einer Veröffentlichung bitte für den eigenen Tarif kurz prüfen.

## 4. Stilblock (einmal zu Beginn senden)

Einen der drei Stile wählen und den Block auf Englisch senden (englische Prompts liefern einheitlichere Ergebnisse):

**Stil A – gemalte Märchen-Illustration (Empfehlung):**

```
We are making a set of 18 playing card illustrations for a Werewolf party game (a medieval village at night).
Style for every image: painted storybook illustration, rich textures, moonlit night, deep blue and teal shadows with warm
amber lantern light, slightly mysterious but not gory, consistent character design across the set.
Rules for every image: portrait format 1024x1536, no text, no letters, no numbers, no signs, no card border, no rounded
corners, no frame, full-bleed background. The whole main subject (figure, face, hands, objects) stays inside the top 55%
of the image and inside the central 70% of the width. The bottom 45% is only an even, dark, calm ground (mist, earth,
shadow) with no faces, hands or objects, because the app places the role name and icons there in white. Only one
character per card unless I say otherwise. Reply with the image only.
```

**Stil B – Holzschnitt/Linolschnitt:** im Block „painted storybook illustration, rich textures“ ersetzen durch „woodcut / linocut print, bold black lines, limited palette of midnight blue, bone white and one accent color per role“.

**Stil C – flache Grafik passend zu den Symbolen der App:** ersetzen durch „flat vector illustration, simple shapes, soft gradients, dark navy background, one bright accent color per role, no fine detail“.

## 5. Rückseite

```
Card back for all cards (file back.png): symmetrical design. Top 30%: a full moon with a subtle wolf head shape hidden in
it, light ornaments. Middle 30% to 70%: an even, dark, calm night sky or mist with no details, because the app writes the
player name there. Bottom 30%: a dark forest silhouette and a small sleeping village, only dark shapes. No text. The
whole card back must look good when shown full screen on a phone.
```

## 6. Vorderseiten: Dateiname und Prompt je Rolle

Jede Nachricht beginnt mit „Next card, same style:“ und dann dem Motiv:

| Datei | Rolle (de) | Motiv (Prompt) |
|---|---|---|
| `wolf.png` | Werwolf | a pack of two or three werewolves with glowing eyes on a hill under the full moon, menacing but not gory |
| `villager.png` | Dorfbewohner | a simple villager with a lantern in front of a half-timbered house, friendly and a little worried |
| `seer.png` | Seherin | a woman looking into a glowing crystal ball, her face lit from below, stars in the dark around her |
| `apprenticeSeer.png` | Seher-Lehrling | a young apprentice holding a small cracked crystal, looking up to an empty chair with a shawl |
| `witch.png` | Hexe | a witch at a table with two potion bottles, one glowing green (healing), one dark purple (poison) |
| `hunter.png` | Jäger | a hunter with a crossbow and a hat, standing alert at the edge of the forest |
| `idiot.png` | Dorftrottel | a cheerful village fool with a patched jester-like hat, harmless and smiling |
| `bodyguard.png` | Leibwächter | a broad guard with a shield standing protectively in front of a closed door |
| `nightGuest.png` | Dorfmatratze | a traveller with a pillow under the arm knocking at a lit cottage door at night (tasteful, no romance) |
| `cupid.png` | Amor | a small winged cupid with a bow, a glowing red thread between two distant houses |
| `toughGuy.png` | Harter Bursche | a scarred, very sturdy blacksmith with crossed arms, unimpressed |
| `tanner.png` | Gerber | a gloomy tanner among hanging leather hides, longing for the end, slightly sinister grin |
| `spellcaster.png` | Alte Vettel | an old crone raising a bony finger to her lips (silence), a raven on her shoulder |
| `mayor.png` | Bürgermeister | a mayor with a chain of office and a judge's hammer at a wooden lectern |
| `paranormalInvestigator.png` | Paranormaler Ermittler | an investigator with a lantern and a magnifying glass, faint ghostly mist around him |
| `magician.png` | Magier | a magician with a staff, one hand glowing with a healing light, the other with a dark spell |
| `drunk.png` | Trunkenbold | a drunk villager asleep against a barrel with a tankard, a hidden role card peeking from his pocket |

## 7. Was Claude danach macht

1. Bilder prüfen: Format, kein Text, Motiv in der Sicherheitszone, unteres Drittel ruhig.
2. In WebP umwandeln (etwa 600 × 900, Ziel unter 90 kB je Bild, zusammen unter 1,6 MB) und offline mitliefern.
3. Einbau in die Rollenverteilung (Rückseite vor dem Aufdecken, Vorderseite mit Name und Fähigkeiten darüber), vorher als Zeichnung abgestimmt; ohne Bild bleibt das heutige Symbol als Ersatz.
