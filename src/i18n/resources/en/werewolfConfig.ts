/** The texts of the Werewolf configuration (fixed roles); the line-up texts live in `werewolf.ts`. */
export const werewolfConfigTexts = {
  werewolfConfig: {
    open: "Configuration",
    rolesTab: "Roles",
    rulesTab: "Game rules",
    modeLabel: "Kind of roles",
    modeFixed: "Fixed roles",
    modeVariable: "Variable roles",
    variableLater: "The variable configuration follows later.",
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
      anyDeath: "Win on any death",
      bodyguard: "Bodyguard",
      doubleVote: "Double vote",
      forbidden: "Self-pick forbidden",
      hammer: "Hammer",
      nightGuest: "Night guest",
      optional: "No duty to shoot",
      required: "Duty to shoot",
      voteOnly: "Win by vote only",
    },
    variantHint:
      "Tap a role to take it. A role with options has a half for every option; tap the chosen half again to leave the role out.",
    info: {
      amulet: {
        general:
          "An extra. The holder is drawn randomly at the start among the players who are not wolves.\nIt stops a direct attack on the holder: wolf attack, poison, death spell, hunter shot, hammer on a wolf or the vote.",
        tasks:
          "Every morning the holder decides: keep the amulet or pass it on.\nAfter it has stopped an attack, he has to pass it on.",
        notes:
          "The amulet is lost if the holder:\ndies of heartbreak\ndies as the mayor from a wrong hammer shot\ndies of his wound as the tough guy",
      },
      apprenticeSeer: {
        general: "A village role. He has no action while the seer lives.",
        tasks:
          "When the seer is dead, the narrator calls him openly every night: he looks at one player and learns whether that player is a wolf.\nSo everyone learns that there is no seer any more.",
      },
      cupid: {
        general: "A village role. He acts only in the first night.",
        tasks:
          "He chooses two lovers. If one of them dies, the other dies too.\nLovers never kill each other and try to win as a pair.",
      },
      drunk: {
        general:
          "An extra. One player starts as the drunk and cannot remember his real role.\nThe real role is drawn among all roles except Cupid.",
        tasks:
          "At the start of the third night he sobers up: the narrator secretly shows him his real role.\nUntil then his ability rests.",
        notes:
          "The seer and the investigator can find out the real role before.\nIf he is really the hunter and about to die, the adrenaline sobers him up and he may still shoot.",
      },
      guard: {
        general: "A village role. At most one of the two is in the game, or none.",
        tasks:
          "Each night the role chooses one player to spend the night with.\nThe same player twice in a row is forbidden.",
        options:
          "Bodyguard: Stays with the chosen player and protects him from direct attacks, but not from the hammer. He himself is not protected.\nNight guest: Stays with the chosen player and protects him from the wolf attack, but dies in his place. A direct attack on the night guest misses, since he sleeps elsewhere.",
      },
      hunter: {
        general: "A village role.",
        tasks: "When he dies, he may shoot one living player.",
        options:
          "Duty to shoot: He has to pick a target.\nNo duty to shoot: He may shoot if he wants.",
      },
      idiot: {
        general: "A village role.",
        tasks: "In the vote after a nomination (yes or no) the village idiot has to vote yes.",
        notes: "A silenced village idiot may not vote.",
      },
      magician: {
        general: "A village role.",
        tasks:
          "After the wolf attack the narrator secretly shows him the wolf victim.\nHe has two spells, each heals the wolf victim or kills any player. He may use both in one night, also on two players.",
      },
      mayor: {
        general: "A village role. He must not reveal his role.",
        options:
          "Double vote: The narrator counts his vote twice in votes.\nHammer: If he suspects a wolf, he may try to kill one living player from the second night on. A wolf dies; if he picked a village role, he dies himself.",
        notes:
          "He does not learn who the wolves attacked and may pick any other living player, even if he is the victim himself.\nThe witch and the magician cannot heal deaths by the hammer.\nThe amulet protects a wolf hit by the hammer, but not the mayor from a wrong shot.",
      },
      paranormalInvestigator: {
        general: "A village role. He can use his ability once per game.",
        tasks:
          "At night he picks a player. The narrator says whether that player or one of the two nearest living neighbours is a wolf.",
      },
      seer: {
        general: "A village role. There is always exactly one seer.",
        tasks: "Each night she looks at one player and learns whether that player is a wolf.",
      },
      spellcaster: {
        general: "A village role.",
        tasks:
          "Each night she silences one player for the next day.\nThe same player twice in a row is forbidden.",
        options:
          "Self-pick allowed: She may also silence herself.\nSelf-pick forbidden: She must choose another player.",
        notes:
          "A silenced player may neither speak nor nominate nor vote, but can still be nominated.",
      },
      tanner: {
        general: "A village role.",
        tasks: "To die is his own goal: then he wins for himself.",
        options: "Win on any death: Every death counts.\nWin by vote only: He has to be voted out.",
      },
      toughGuy: {
        general: "A village role. After a wolf attack he takes part normally the next day.",
        tasks:
          "A wolf attack does not kill him at once: that night he can still be saved, in the night after he dies of his wound.",
        notes: "Any other cause of death kills him at once.",
      },
      villagers: {
        general: "Plain villagers have no special ability. They play with the village.",
        tasks: "They talk, look for the wolves together and vote.",
        notes: "The number is set automatically from your choice.",
      },
      witch: {
        general: "A village role.",
        tasks:
          "For the whole game she has one healing potion for the wolf victim and one poison for any player.",
        notes:
          "Both potions can be used in the same night.\nPoison on a protected player is used up anyway.",
      },
      wolves: {
        general: "The wolves are the enemies of the village.",
        tasks: "Each night the wolves choose a victim.",
        notes:
          "In the first night they only get to know each other, unless the attack from night 1 is switched on.\nPick how many play; with only one possible number it is fixed.\nThe recommendation fits the roles you chose; it never changes your choice by itself.",
      },
    },
  },
};
