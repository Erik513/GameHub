/** Die kurzen Rollentexte für die Spieler während des Spiels (ohne Hinweise zur Konfiguration). */
export const werewolfRoleInfoTexts = {
  werewolfRoleInfo: {
    amulet:
      "Du trägst das Schutzamulett: Es fängt nächtliche Angriffe auf dich ab (Wolfsangriff, Gift, Todeszauber).\nHat es einen Angriff abgefangen, musst du es in dieser Nacht weitergeben.",
    roles: {
      wolf: {
        lines:
          "Ihr Werwölfe wollt alle anderen aus dem Dorf loswerden.\nJede Nacht wachen die Werwölfe gemeinsam auf und wählen ein Opfer.\nAm Tag gibst du dich als Dorfbewohner aus.",
      },
      seer: {
        lines:
          "Jede Nacht zeigst du auf eine Person und erfährst, ob sie ein Werwolf ist.\nVerrate dich nicht zu früh: Die Werwölfe wollen dich ausschalten.",
      },
      apprenticeSeer: {
        lines:
          "Solange die Seherin lebt, schläfst du.\nStirbt sie, übernimmst du ihre Aufgabe: Jede Nacht zeigst du auf eine Person und erfährst, ob sie ein Werwolf ist.",
      },
      villager: {
        lines:
          "Du hast keine besondere Fähigkeit.\nSuche gemeinsam mit dem Dorf die Werwölfe und stimme am Tag mit ab.",
      },
      witch: {
        lines:
          "Du hast einen Heiltrank und einen Gifttrank, jeden nur einmal.\nDer Erzähler zeigt dir, wen die Werwölfe angegriffen haben.\nDu entscheidest, ob du heilst, vergiftest, beides oder nichts.",
      },
      hunter: {
        lines: "Wenn du ausscheidest, schießt du auf eine lebende Person.",
      },
      idiot: {
        lines: "Bei jeder Abstimmung musst du mit Ja stimmen.",
      },
      bodyguard: {
        lines:
          "Jede Nacht schützt du eine Person vor dem Wolfsangriff.\nDu darfst dich nicht selbst schützen und nicht zweimal hintereinander dieselbe Person.",
      },
      nightGuest: {
        lines:
          "Jede Nacht schläfst du bei einer anderen Person und schützt sie vor dem Wolfsangriff.\nGreifen die Wölfe sie an, stirbst du an ihrer Stelle.\nDieselbe Person darfst du nicht zweimal hintereinander wählen.",
      },
      cupid: {
        lines:
          "In der ersten Nacht wählst du zwei Verliebte; du darfst selbst dazugehören.\nStirbt eine der beiden Personen, stirbt die andere mit.",
      },
      tanner: {
        lines: "Dein Ziel ist es zu sterben: Dann gewinnst du für dich allein.",
      },
      spellcaster: {
        lines:
          "Jede Nacht machst du eine Person für den nächsten Tag stumm: Sie darf weder sprechen noch nominieren oder abstimmen.\nDieselbe Person darfst du nicht zweimal hintereinander wählen.",
      },
      mayor: {
        lines: "Verrate deine Rolle nicht.",
      },
      paranormalInvestigator: {
        lines:
          "Einmal pro Partie wählst du nachts eine Person und erfährst, ob sie oder einer ihrer beiden Sitznachbarn ein Werwolf ist.",
      },
      magician: {
        lines:
          "Du hast zwei Zauber: das Wolfsopfer heilen oder eine beliebige Person töten.\nDu darfst beide in einer Nacht einsetzen, auch denselben zweimal.\nDer Erzähler zeigt dir, wen die Werwölfe angegriffen haben.",
      },
      drunk: {
        lines:
          "Du erinnerst dich noch nicht an deine Rolle.\nZu Beginn der dritten Nacht erfährst du sie. Bis dahin hast du keine Fähigkeit.",
      },
    },
    variants: {
      required: "Du musst schießen.",
      optional: "Du darfst auch verzichten.",
      wolfOnly:
        "Ein Wolfsangriff tötet dich nicht sofort: Du spielst noch einen Tag mit und stirbst danach in der Nacht.\nGerettet wirst du nur, wenn der Angriff noch in derselben Nacht geheilt wird.\nAlles andere tötet dich sofort: Gift, Todeszauber, Jägerschuss, Hammer, Abstimmung und der Tod deines Liebespartners.",
      anyAttack:
        "Ein Angriff durch Wölfe, Gift, Todeszauber oder Jägerschuss tötet dich nicht sofort: Du spielst noch einen Tag mit und stirbst danach in der Nacht.\nGerettet wirst du nur, wenn ein Wolfsangriff noch in derselben Nacht geheilt wird.\nHammer, Abstimmung und der Tod deines Liebespartners töten dich sofort.",
      anyDeath: "Jeder Tod zählt.",
      voteOnly: "Du musst durch eine Abstimmung ausscheiden.",
      allowed: "Du darfst dich selbst wählen.",
      forbidden: "Du musst eine andere Person wählen.",
      doubleVote:
        "Deine Stimme zählt bei Abstimmungen doppelt.\nDer Erzähler zählt sie für dich mit.",
      hammer:
        "Ab der zweiten Nacht darfst du einmal pro Partie mit dem Hammer jemanden töten wollen: Du wählst eine Person oder verzichtest.\nIst die Person ein Werwolf, stirbt sie. Ist sie keiner, stirbst du selbst.\nNichts schützt vor dem Hammer, auch das Amulett nicht.",
    },
  },
};
