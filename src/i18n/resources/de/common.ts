import { kitTexts } from "./kit";
import { tabooTexts } from "./taboo";
import { werewolfTexts } from "./werewolf";
import { werewolfConfigTexts } from "./werewolfConfig";
import { werewolfRulesTexts } from "./werewolfRules";
import { werewolfNarratorTexts } from "./werewolfNarrator";
import { werewolfSymbolsTexts } from "./werewolfSymbols";

export const common = {
  ...kitTexts,
  ...tabooTexts,
  ...werewolfTexts,
  ...werewolfConfigTexts,
  ...werewolfRulesTexts,
  ...werewolfNarratorTexts,
  ...werewolfSymbolsTexts,
  app: {
    eyebrow: "Projektgrundlage",
    title: "GameHub",
    metaDescription: "GameHub – Partyspiele an einem Ort",
    intro: "Ein Ort für Party-, Karten-, Quiz- und Gesellschaftsspiele.",
  },
  language: {
    uiLabel: "Oberflächensprache",
    cardLabel: "Kartensprache",
    options: {
      de: "Deutsch",
      en: "Englisch",
    },
  },
  navigation: {
    pause: "Pause",
    resume: "Fortsetzen",
    exitGame: "Spiel beenden",
    exitGameConfirm: "Nochmal tippen zum Beenden",
    leaveGameTitle: "Spiel beenden?",
    leaveGameText: "Das laufende Spiel geht verloren.",
    keepPlaying: "Weiterspielen",
    back: "Zurück",
    closeGame: "Spiel schließen",
  },
  settings: {
    open: "Einstellungen",
    title: "Einstellungen",
    description: "Wähle die Sprache der Oberfläche.",
    close: "Schließen",
  },
  install: {
    open: "App installieren",
    title: "App installieren",
    intro:
      "Mit der App startest du GameHub direkt vom Startbildschirm, auch offline. Wähle dein Gerät:",
    tabAndroid: "Android",
    tabIos: "iPhone / iPad",
    tabDesktop: "Computer",
    androidOpen: "Öffne die Seite in Chrome.",
    androidMenu: "Tippe oben rechts auf das Menü",
    androidMenuEnd: "(drei Punkte).",
    androidInstall: "Tippe auf „App installieren“.",
    or: "oder",
    auto: "Automatisch installieren",
    unavailable:
      "Dein Browser bietet die Installation gerade nicht an. Nutze die Schritte oben oder öffne die Seite in Chrome.",
    iosOpen: "Öffne die Seite in Safari.",
    iosShare: "Tippe auf „Teilen“",
    iosAdd: "Tippe auf „Zum Home-Bildschirm“.",
    iosTip: "Nur als App auf dem Home-Bildschirm bleiben deine Daten dauerhaft gespeichert.",
    desktopInstall: "Klicke in Chrome oder Edge in der Adressleiste auf das Installieren-Symbol.",
    tip: "Tipp: Aus WhatsApp zuerst „Im Browser öffnen“ wählen.",
  },
  feedback: {
    emptyGames: {
      title: "Keine Spiele verfügbar",
      description: "Neue Spiele erscheinen hier, sobald sie registriert sind.",
    },
  },
  gameSelection: {
    eyebrow: "Spielesammlung",
    title: "Wähle ein Spiel",
    intro:
      "Wähle, was zu eurer Runde passt. Neue Spiele kommen in dieselbe Sammlung, sobald sie bereit sind.",
    status: {
      preview: "In Entwicklung",
      planned: "Geplant",
    },
    action: {
      play: "Spielen",
    },
  },
  games: {
    taboo: {
      title: "Tabu",
      description: "Erkläre den Begriff, ohne die verbotenen Wörter zu verwenden.",
    },
    wordBomb: {
      title: "Wortbombe",
      description: "Nenne schnell ein passendes Wort, bevor die Bombe in deiner Hand platzt.",
    },
    imposter: {
      title: "Imposter",
      description: "Alle kennen den geheimen Begriff – außer dem Imposter. Wer fliegt auf?",
    },
    werewolf: {
      title: "Werwolf",
      description: "Das Dorf schläft, die Werwölfe jagen. Findet sie, bevor es zu spät ist.",
    },
    liarsBar: {
      title: "Liar’s Bar",
      description: "Lege Karten verdeckt ab, bluffe und zweifle die Lügner an.",
    },
    schwimmen: {
      title: "Schwimmen",
      description: "Tausche Karten und bilde 31 Punkte, ohne unterzugehen.",
    },
  },
  gamePreview: {
    description:
      "Dieses Spiel ist bereits Teil von GameHub und wird in einem späteren Entwicklungsschritt spielbar.",
  },
} as const;
