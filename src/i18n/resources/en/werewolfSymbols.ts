/** The names and meanings of the symbols of Werewolf (legend); the drawings are in `presentation/werewolf/symbols`. */
export const werewolfSymbolsTexts = {
  werewolfSymbols: {
    tab: "Symbols",
    intro:
      "The narrator shows you these symbols when a role wakes up or a person is affected. The same meaning always has the same sign. A role is drawn as it is; its ability stands in a circle. A green ability can be used now; one that is struck through is used up for good; one with a dashed amber frame is not possible right now; a dimmed one is not its turn yet. A blue frame marks the next step, yellow boxes are notes for you (for example who is silenced today), and the blue box below sums a decision up once more. The closed and open eye shows the cause of death of the dead only on a tap. On the role card and in “All players and roles” the states stand as colored boxes in a fixed order from the right: first the lasting ones (the drunk at the very right, then the amulet), the ones of the night to the left of them. A person who is out has the gravestone at the very right and the cause of death in its color next to it (the vote yellow, the shot of the hunter brown); a tanner who has won has a gold trophy between them.",
    credits:
      'Wolf head: "Wolf head" by Lorc, witch: "Witch face" by Cathelineau, hunter: "Blunderbuss" by Lorc, all game-icons.net, license CC BY 3.0. Other drawings: Tabler Icons, MIT license.',
    abilities: {
      title: "Abilities",
      items: {
        attack: "The werewolves choose their victim",
        inspect: "The seer looks at one person",
        investigate: "The investigator checks a group of people (once)",
        heal: "Saves the victim of the werewolves",
        poison: "Kills one person (once)",
        kill: "A death spell of the magician",
        protect: "The bodyguard protects one person",
        stayWith: "The night guest sleeps at another person",
        bond: "Cupid makes two people fall in love",
        hammer: "The mayor strikes with the hammer",
        silence: "The old hag silences one person for the day",
        shot: "The hunter shoots one person",
        passAmulet: "The holder passes the amulet on",
        vote: "Nominate up to 3 people, then the village votes",
      },
    },
    groups: {
      extra: "Extras",
      resource: "Own means",
      role: "Roles",
      state: "States",
    },
    items: {
      amulet: {
        name: "Protective amulet",
        meaning: "Gem: stops the attacks of the night",
      },
      amuletPass: {
        name: "Pass the amulet",
        meaning: "Arrows: the holder has to pass it on",
      },
      apprenticeSeer: {
        name: "Apprentice seer",
        meaning: "Crystal ball with a Z: sleeps until the seer is dead",
      },
      attacked: {
        name: "Attacked",
        meaning: "Paw: target of the wolf attack",
      },
      bodyguard: {
        name: "Bodyguard",
        meaning: "Person with a shield: protects one player",
      },
      cupid: {
        name: "Cupid",
        meaning: "Bow with an arrow: makes 2 players fall in love",
      },
      day: {
        name: "Day",
        meaning: "Sun: the village talks, nominates and votes",
      },
      dead: {
        name: "Dead",
        meaning: "Gravestone: out of the game",
      },
      doubleVote: {
        name: "Double vote",
        meaning: "Two: the vote counts twice (the second vote is assigned to a nominated person)",
      },
      drunk: {
        name: "Drunk",
        meaning: "Bottle: does not know his real role yet",
      },
      guest: {
        name: "Guest",
        meaning: "Person in a bed: the night guest sleeps here",
      },
      hammer: {
        name: "Hammer",
        meaning: "Gavel: once per game, from night 2",
      },
      healPotion: {
        name: "Healing potion",
        meaning: "Potion bottle with a plus: the witch saves the wolf victim",
      },
      heal: {
        name: "Healing spell",
        meaning: "Heart with a plus: the magician saves the wolf victim",
      },
      spellHealed: {
        name: "Saved by the healing spell",
        meaning: "Heart with a plus: the magician saved this player",
      },
      healed: {
        name: "Healed",
        meaning: "Bottle with a plus: the witch healed this player",
      },
      hunter: {
        name: "Hunter",
        meaning: "Blunderbuss: shoots when he leaves the game",
      },
      idiot: {
        name: "Village idiot",
        meaning: "Thumb up: has to vote yes",
      },
      investigation: {
        name: "Investigation",
        meaning: "Magnifier: the one-time ability of the investigator",
      },
      kill: {
        name: "Death spell",
        meaning: "Skull: the magician kills one player",
      },
      lovers: {
        name: "In love",
        meaning: "Two hearts: if one dies, the other dies too",
      },
      magician: {
        name: "Magician",
        meaning: "Wand: two spells to heal or to kill",
      },
      mayor: {
        name: "Mayor",
        meaning: "Crown: double vote or hammer",
      },
      nightGuest: {
        name: "Night guest",
        meaning:
          "House with a heart: sleeps at a player's place and protects them from the wolf attack",
      },
      paranormalInvestigator: {
        name: "Paranormal investigator",
        meaning: "Ghost: checks one player and their seat neighbours, once",
      },
      poisoned: {
        name: "Poisoned",
        meaning: "Bottle with a minus: the poison potion of the witch",
      },
      protectedSaved: {
        name: "Saved by the bodyguard",
        meaning: "Shield: attacked, the protection of the bodyguard saved this player",
      },
      guestSaved: {
        name: "Saved by the night guest",
        meaning: "Person in a bed: attacked, the night guest saved this player",
      },
      protected: {
        name: "Protected",
        meaning: "Shield: protected this night",
      },
      seer: {
        name: "Seer",
        meaning: "Crystal ball: looks at one player",
      },
      twoVotes: {
        name: "Double vote",
        meaning: "Number 2: the vote of the mayor counts twice",
      },
      hammered: {
        name: "Struck by the hammer",
        meaning: "Gavel: the mayor struck this player",
      },
      spellKilled: {
        name: "Struck by a death spell",
        meaning: "Skull: the magician struck this player",
      },
      investigated: {
        name: "Examined",
        meaning: "Magnifying glass: the paranormal investigator examined this player",
      },
      inspected: {
        name: "Looked at",
        meaning: "Eye: the seer looked at this player",
      },
      shotDuty: {
        name: "Duty to shoot",
        meaning: "Target with an arrow: the hunter has to shoot",
      },
      silenced: {
        name: "Silenced",
        meaning: "Microphone off: no speech, nomination or vote today",
      },
      spellcaster: {
        name: "Old hag",
        meaning: "Microphone: silences one player for the day",
      },
      tanner: {
        name: "Tanner",
        meaning: "Trophy: wins if he dies (with the option, only by the vote)",
      },
      toughGuy: {
        name: "Tough guy",
        meaning: "Dumbbell: survives an attack for a day",
      },
      villager: {
        name: "Villager",
        meaning: "Person: no special ability",
      },
      witch: {
        name: "Witch",
        meaning: "Witch with a hat: healing and poison potion",
      },
      wolf: {
        name: "Werewolf",
        meaning: "Wolf head: hunts at night",
      },
      vote: {
        name: "Nomination and vote",
        meaning: "Slip into a ballot box: nominate up to 3 people, then the village votes",
      },
      wounded: {
        name: "Wounded",
        meaning: "Plaster: the tough guy dies the next night",
      },
    },
  },
};
