/** The short role texts for the players during the game (without notes on the configuration). */
export const werewolfRoleInfoTexts = {
  werewolfRoleInfo: {
    amulet:
      "You hold the protective amulet: it stops the attacks of the night on you (wolf attack, poison, death spell).\nIf it stopped an attack, you have to pass it on that night.",
    roles: {
      wolf: {
        lines:
          "You werewolves want to get rid of everybody else in the village.\nEvery night the werewolves wake up together and choose a victim.\nDuring the day you pretend to be a villager.",
      },
      seer: {
        lines:
          "Every night you point at a person and learn whether they are a werewolf.\nDo not give yourself away too early: the werewolves want you out.",
      },
      apprenticeSeer: {
        lines:
          "You sleep as long as the seer lives.\nIf the seer dies you take over: every night you point at a person and learn whether they are a werewolf.",
      },
      villager: {
        lines:
          "You have no special ability.\nLook for the werewolves together with the village and vote during the day.",
      },
      witch: {
        lines:
          "You have a healing potion and a poison potion, each only once.\nThe narrator shows you whom the werewolves attacked.\nYou decide whether to heal, poison, both or nothing.",
      },
      hunter: {
        lines: "When you leave the game, you shoot at a living person.",
      },
      idiot: {
        lines: "In every vote you have to vote yes.",
      },
      bodyguard: {
        lines:
          "Every night you protect a person from the wolf attack.\nYou may not protect yourself and not the same person twice in a row.",
      },
      nightGuest: {
        lines:
          "Every night you sleep at the place of another person and protect them from the wolf attack.\nIf the wolves attack them, you die in their place.\nYou may not choose the same person twice in a row.",
      },
      cupid: {
        lines:
          "In the first night you choose two lovers; you may be one of them.\nIf one of the two dies, the other dies too.",
      },
      tanner: {
        lines: "Your goal is to die: then you win on your own.",
      },
      spellcaster: {
        lines:
          "Every night you silence a person for the next day: they may not speak, nominate or vote.\nYou may not choose the same person twice in a row.",
      },
      mayor: {
        lines: "Do not give away your role.",
      },
      paranormalInvestigator: {
        lines:
          "Once per game you choose a person at night and learn whether they or one of their two seat neighbours is a werewolf.",
      },
      magician: {
        lines:
          "You have two spells: heal the wolf victim or kill any person.\nYou may use both in one night, also the same one twice.\nThe narrator shows you whom the werewolves attacked.",
      },
      drunk: {
        lines:
          "You do not remember your role yet.\nAt the start of the third night you learn it. Until then you have no ability.",
      },
    },
    variants: {
      required: "You have to shoot.",
      optional: "You may also pass.",
      wolfOnly:
        "A wolf attack does not kill you at once: you play on for one day and die in the night after.\nYou are only saved if the attack is healed in the same night.\nEverything else kills you at once: poison, death spell, the hunter's shot, the hammer, a vote and the death of your lover.",
      anyAttack:
        "An attack by wolves, poison, death spell or the hunter's shot does not kill you at once: you play on for one day and die in the night after.\nYou are only saved if a wolf attack is healed in the same night.\nThe hammer, a vote and the death of your lover kill you at once.",
      anyDeath: "Every death counts.",
      voteOnly: "You have to be voted out.",
      allowed: "You may choose yourself.",
      forbidden: "You have to choose somebody else.",
      doubleVote: "Your vote counts twice in votes.\nThe narrator counts it for you.",
      hammer:
        "From the second night on you may once per game try to kill somebody with the hammer: you choose a person or pass.\nIf the person is a werewolf, they die. If they are not, you die yourself.\nNothing protects from the hammer, not even the amulet.",
    },
  },
};
