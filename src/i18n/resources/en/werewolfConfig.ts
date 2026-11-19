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
    availableFrom: "From {{count}} players",
    lockNoSeat: "No place free: the wolves, the seer and the chosen roles fill all places.",
    lockCombination:
      "It does not play together with the chosen roles at this number of players and wolves. Another wolf count may free it.",
    lockWolves: "The drunk needs at least two wolves.",
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
      amulet:
        "An item, not a role card: it takes no place.\nThe game draws the first holder among the players who are not wolves.\nIt stops one deadly action against the holder, for example the wolf attack, poison or the vote.\nThe holder passes it on every day.",
      apprenticeSeer:
        "Has no action of its own while the seer lives.\nTakes over the visions when the seer is out.",
      cupid: "Chooses two lovers in the first night.\nIf one lover dies, the other dies too.",
      drunk:
        "An extra: one player starts as the drunk and sees only that.\nAt the start of the third night the narrator shows the real role.\nUntil then the role does nothing.\nIt needs at least two wolves.",
      guard:
        "At most one of the two, or none.\nThe bodyguard protects one player each night, never the same one twice in a row.\nThe night guest stays with one player each night: a wolf attack on the host hits the night guest instead.",
      hunter:
        "When the hunter dies he may shoot one living player.\nNo duty to shoot: he may also decide not to shoot.\nDuty to shoot: he has to choose a target.",
      idiot: "In the vote after a nomination the village idiot has to vote yes.",
      magician:
        "Has two spells for the whole game: one heals the wolf victim, one kills a player.\nUsually the magician replaces the witch. Both play together only at 14 or more players with four (or five) wolves.",
      mayor:
        "A secret role. The ability is chosen with the role:\nDouble vote: the narrator counts the vote of the mayor twice.\nHammer: one night action that kills a wolf; on a wrong target the mayor dies himself. The hammer is available from 10 players.",
      paranormalInvestigator:
        "Once per game the investigator picks a player. The narrator says whether that player or one of the two nearest neighbours is a wolf.",
      seer: "The seer looks at one player each night and learns whether that player is a wolf.\nThere is always exactly one seer.",
      spellcaster:
        "Each night the old hag silences one player for the next day: no speaking, no voting. Never the same player twice in a row.\nSelf-pick allowed: she may also silence herself.\nSelf-pick forbidden: she must choose another player.",
      tanner:
        "Has no night action. He wins personally when he dies, and the game goes on.\nWin on any death: every death counts.\nWin by vote only: only a death by the vote counts.",
      toughGuy: "A wolf attack only wounds him. He dies at the end of the next night.",
      villagers:
        "Plain villagers fill every free place.\nThe number is: players minus wolves, minus the seer, minus the chosen roles.\nYou cannot set it by hand.",
      witch:
        "Has one healing potion and one poison for the whole game.\nWakes after the wolves and the seer, also in the first night.",
      wolves:
        "The wolves choose a victim every night.\nPick how many play. When there is only one possible number it is fixed.\nThe recommendation fits the roles you chose; it never changes your choice by itself.",
    },
  },
};
