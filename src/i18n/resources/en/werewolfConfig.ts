/** The texts of the Werewolf configuration (fixed roles); the line-up texts live in `werewolf.ts`. */
export const werewolfConfigTexts = {
  werewolfConfig: {
    open: "Configuration",
    rolesTab: "Roles",
    rulesTab: "Game rules",
    modeLabel: "Kind of roles",
    modeFixed: "Fixed roles",
    modeVariable: "Variable roles",
    label: "Configuration",
    done: "Done",
    coreHeading: "Basic roles and extras",
    wolves: "Werewolves",
    recommended: "recommended",
    seer: "Seer",
    villagers: "Villagers",
    villagersTitle: "Villagers",
    availableHeading: "Available roles",
    unavailableHeading: "Not available (more players needed)",
    row: "From {{count}} players",
    extrasHeading: "Extras",
    attackLabel: "Wolf attack",
    attackNight1: "From night 1",
    attackNight2: "From night 2",
    revealLabel: "Roles after death",
    revealOpen: "Reveal",
    revealSecret: "Keep secret",
    issuesHeading: "To correct",
    useWolves: "Use wolf count {{count}}",
    infoLabel: "Info about {{name}}",
    infoClose: "Close",
    teamVillage: "Village role",
    teamWolves: "Enemy of the village",
    teamOwnGoal: "Village role with a goal of its own",
    teamExtra: "Extra",
    notTogether: "not together with {{role}}",
    infoGeneral: "General",
    infoTasks: "Tasks",
    infoOptions: "Options",
    infoNotes: "Special notes",
    availableFrom: "From {{count}} players",
    hammerFrom: "Hammer from {{count}} players",
    lockNoSeat: "No place free: the wolves, the seer and the chosen roles fill all places.",
    lockCombination: "Too strong in the current selection.",
    lockCombinationWith: "Too strong together with {{role}} in the current selection.",
    lockedNoSeat: "no place free",
    lockedCombination: "not together",
    lockedWolves: "2+ wolves",
    tooFewPlayers: "Add at least 6 players first (now {{count}}).",
    tooManyPlayers: "Too many players: at most {{maximum}} (now {{count}}). Remove players first.",
    issues: {
      players: "The configuration needs 6 to 20 players besides the narrator (now {{count}}).",
      wolfCount: "{{count}} wolves are not allowed for this number of players.",
      roleMinimum: "{{role}} needs at least {{minimum}} players.",
      noSeat:
        "Too many roles: the wolves, the seer and {{roles}} roles need more places than there are players.",
      combination: "The chosen roles do not play together with this number of wolves.",
      hammerMinimum: "The hammer of the mayor needs at least {{minimum}} players.",
      addonMinimum: "{{addon}} needs at least {{minimum}} players.",
      drunkWolves: "The drunk needs at least two wolves.",
      invalid: "This line-up cannot be played.",
    },
    roles: {
      apprenticeSeer: "Apprentice seer",
      bodyguard: "Bodyguard",
      cupid: "Cupid",
      hunter: "Hunter",
      idiot: "Village idiot",
      magician: "Magician",
      mayor: "Mayor",
      nightGuest: "Night guest",
      paranormalInvestigator: "Paranormal investigator",
      spellcaster: "Old hag",
      tanner: "Tanner",
      toughGuy: "Tough guy",
      witch: "Witch",
    },
    items: {
      apprenticeSeer: "Apprentice seer",
      cupid: "Cupid",
      guard: "Bodyguard / night guest",
      hunter: "Hunter",
      idiot: "Village idiot",
      magician: "Magician",
      mayor: "Mayor",
      paranormalInvestigator: "Paranormal investigator",
      spellcaster: "Old hag",
      tanner: "Tanner",
      toughGuy: "Tough guy",
      witch: "Witch",
    },
    addons: {
      amulet: "Protective amulet",
      drunk: "Drunk",
    },
    variants: {
      allowed: "Self-pick allowed",
      anyAttack: "Every attack",
      anyDeath: "Win on any death",
      bodyguard: "Bodyguard",
      doubleVote: "Double vote",
      forbidden: "Self-pick forbidden",
      hammer: "Hammer",
      nightGuest: "Night guest",
      optional: "No duty to shoot",
      required: "Duty to shoot",
      voteOnly: "Win by vote only",
      wolfOnly: "Wolf attack only",
    },
    variantHint:
      "Tap a role to take it. A role with options has a half for every option; tap the chosen half again to leave the role out.",
    variable: {
      box: {
        must: "Must be in the game",
        may: "May be in the game",
        not: "Should not be in the game",
      },
      lock: {
        incompatibleRoles: "It does not play together with the roles that are in the game.",
        insufficientSeats: "No place is free for it.",
        requiredAlternative: "The other role of this pair must be in the game.",
        requiredOption: "Another option of this role must be in the game.",
      },
      rolesHeading: "Roles",
      rangeTitle: "Special roles from May",
      minimum: "At least",
      maximum: "At most",
      less: "{{what}}: one less",
      more: "{{what}}: one more",
      rangePossible: "Possible: {{minimum}} to {{maximum}}",
      rangeNone: "No role on May yet.",
      mayInfo: {
        label: "What does \"May be in the game\" mean?",
        roles:
          "The roles in this box are not certain: the game draws among them.\nHow many of them are drawn is set below with \"At least\" and \"At most\".\nThe roles that are drawn play, the others stay out. Which ones is decided when the game starts.\nAt night the narrator wakes only the roles that are in the game.",
        items:
          "The extras in this box are not certain either: each one is drawn on its own, with the same chance to be in the game as not.\nThe draw happens when the game starts.\nThe number of extras is not limited by the range below.",
      },
      cannotStart: "This selection cannot be played with {{count}} players.",
    },
    wake: {
      open: "Wake-up order",
      title: "Wake-up order",
      hint: "Every night the narrator wakes the roles in this order. Roles that are not in the game are dimmed. With secret roles, roles that are out are still called to keep them hidden.",
      notInGame: "not in the game",
      maybe: "May be in the game: only woken if it is drawn",
      hintVariable:
        "Every night the narrator calls the roles in this order. The narrator wakes only the roles that are in the game: a role that may be in the game is woken only if the draw took it. Roles that are not in the game are dimmed.",
      wolvesFirstNight: "In the first night they only get to know each other",
      apprentice: "The apprentice seer takes over when the seer is dead",
      amulet: "Last: keep the amulet or pass it on",
      timing: {
        firstNight: "Only in the first night",
        thirdNight: "At the start of the third night",
        fromSecondNight: "From the second night, once per game",
      },
      steps: {
        amulet: "Amulet holder",
        cupid: "Cupid",
        drunk: "Drunk",
        magician: "Magician",
        mayor: "Mayor with the hammer",
        paranormalInvestigator: "Paranormal investigator",
        seer: "Seer",
        spellcaster: "Old hag",
        witch: "Witch",
        wolves: "Werewolves",
      },
    },
    info: {
      amulet: {
        general:
          "The holder is drawn randomly at the start among the players who are not wolves.\nIt stops the attacks of the night (wolf attack, poison, death spell): if the holder is attacked at night, he survives.",
        tasks:
          "The holder is woken last every night and asked: keep the amulet or pass it on.\nIf it has stopped an attack, he has to pass it on.\nHe may give it to any living player, also to a wolf.",
        notes:
          "The holder can still die:\nby the hammer, the vote or the hunter shot (so nobody learns who has the amulet)\nwhen his lover dies (he dies of heartbreak, too, and the amulet is lost)\nas the tough guy, if he got the amulet only after the attack",
      },
      apprenticeSeer: {
        general: "He has no action while the seer lives.",
        tasks:
          "When the seer is dead, he wakes up every night, chooses a player and learns whether that player is a wolf.",
      },
      cupid: {
        tasks:
          "In the first night he chooses two lovers; he may be one of them himself. They get to know each other and keep their roles. If one of them dies, the other dies too.",
        notes:
          "Lovers try to survive together: as a wolf you do not attack your partner, as a villager you do not vote against him. This is not forced.",
      },
      drunk: {
        general:
          "One player starts as the drunk and cannot remember his real role.\nThe real role is drawn among all roles in the game except Cupid.",
        tasks:
          "At the start of the third night he sobers up and remembers his real role.\nUntil then his ability rests.",
        notes:
          "The seer and the investigator learn the real role before.\nIf he is really a wolf, he wakes up with the wolves only after the reveal.\nIf he is really the hunter and about to die, the adrenaline sobers him up and he may or must still shoot, depending on the option of the hunter.",
      },
      guard: {
        general: "At most one of the two is in the game, or none.",
        tasks:
          "Each night the role chooses another player to spend the night with.\nChoosing the same player twice in a row is forbidden.",
        options:
          "Bodyguard: Stays with the chosen player and protects him from the wolf attack, poison and death spells, but not from the hammer. He himself is not protected.\nNight guest: Stays with the chosen player and protects him only from the wolf attack, not from poison and spells. He dies in the player's place; a direct attack on him misses, since he sleeps elsewhere.",
      },
      hunter: {
        tasks: "When he dies, he may or must (depending on the option) shoot one living player.",
        options:
          "Duty to shoot: He has to pick a target.\nNo duty to shoot: He may shoot if he wants.",
      },
      idiot: {
        tasks: "In the vote after a nomination (yes or no) the village idiot has to vote yes.",
        notes: "A silenced village idiot may not vote.",
      },
      magician: {
        tasks:
          "He has two spells and decides for each one: heal the wolf victim or kill any player.\nHe may use both in one night, also the same twice.",
      },
      mayor: {
        general: "He must not reveal his role.",
        options:
          "Double vote: The narrator counts his vote twice in votes.\nHammer: If he suspects a wolf, he may try once per game, from the second night on, to kill one living player. A wolf dies; if he picked a village role, he dies himself.",
        notes:
          "The witch and the magician cannot heal deaths by the hammer.\nNothing protects from the hammer, not even the amulet.",
      },
      paranormalInvestigator: {
        general: "He can use his ability once per game.",
        tasks:
          "At night he picks a player. Then he learns whether that player or one of the two nearest living neighbours is a wolf.",
      },
      seer: {
        general: "There is always exactly one seer.",
        tasks: "Each night she looks at one player and learns whether that player is a wolf.",
      },
      spellcaster: {
        tasks:
          "Each night she silences one player for the next day.\nChoosing the same player twice in a row is forbidden.",
        options:
          "Self-pick allowed: She may also silence herself.\nSelf-pick forbidden: She must choose another player.",
        notes:
          "A silenced player may neither speak nor nominate nor vote, but can still be nominated.",
      },
      tanner: {
        tasks: "To die is his own goal: then he wins for himself.",
        options: "Win on any death: Every death counts.\nWin by vote only: He has to be voted out.",
      },
      toughGuy: {
        tasks:
          "An attack does not kill him at once: he takes part normally the next day and dies of his wound in the night after.",
        options:
          "Wolf attack only: Only a wolf attack works like this.\nEvery attack: Poison, a death spell and the hunter shot work like this, too.",
        notes:
          "In the night of the attack, only a wolf attack can still be healed.\nThe hammer, the vote and the death of his lover kill him at once.",
      },
      villagers: {
        general: "Plain villagers have no special ability. They play with the village.",
        tasks: "They talk, look for the wolves together and vote.",
        notes: "The number is set automatically from your choice.",
      },
      witch: {
        tasks:
          "For the whole game she has one healing potion for the wolf victim and one poison for any player.",
        notes:
          "Both potions can be used in the same night.\nPoison on a protected player is used up anyway.",
      },
      wolves: {
        tasks: "Each night the wolves choose a victim.",
        notes:
          "In the first night they only get to know each other, unless the attack from night 1 is switched on.\nPick how many play; with only one possible number it is fixed.\nThe recommendation fits the roles you chose; it never changes your choice by itself.",
      },
    },
  },
};
