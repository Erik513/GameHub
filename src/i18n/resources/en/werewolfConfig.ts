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
    infoOptions: "Options",
    infoNotes: "Special notes",
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
      amulet: {
        what: "An item, not a role card, so it takes no place. It stops one deadly action against the holder.",
        notes:
          "The first holder is drawn among the players who are not wolves.\nIt stops, for example, the wolf attack, poison, a death spell, a hunter shot and the vote.\nThe holder passes it on every day; after it caught an action, to another player.",
      },
      apprenticeSeer: {
        what: "Has no action while the seer lives. When the seer is out, the apprentice takes over her visions.",
        notes:
          "The narrator tells him secretly when he is first called for the seer.\nA seer who is attacked at night still has her vision before she leaves in the morning.",
      },
      cupid: {
        what: "Chooses two lovers in the first night. They know each other, keep their roles and die together.",
        notes: "A mixed couple as the last two survivors lets the wolves win at one against one.",
      },
      drunk: {
        what: "An extra: one player starts as the drunk and sees only that. At the start of the third night the narrator shows the real role.",
        notes:
          "Until then the role does nothing.\nIt needs at least two wolves.\nA hunter who dies before learns the real role before the last shot.",
      },
      guard: {
        what: "At most one of the two roles is in the game, or none.",
        options:
          "Bodyguard: protects one player each night against the wolf attack, poison and death spells.\nNight guest: stays with one player each night; a wolf attack on the host hits the night guest instead.",
        notes:
          "Neither may choose the same player twice in a row.\nA direct attack on the bodyguard still hits him; a direct attack on the visiting night guest misses.",
      },
      hunter: {
        what: "When the hunter dies, in the night or by the vote, he may shoot one living player before the game goes on.",
        options:
          "Duty to shoot: he has to choose a target.\nNo duty to shoot: he may also decide not to shoot.",
        notes: "The win check comes after the shot.",
      },
      idiot: {
        what: "In the vote after a nomination the village idiot has to vote yes.",
        notes: "A silenced village idiot gives no vote at all.",
      },
      magician: {
        what: "Has two spells for the whole game: a healing spell for the wolf victim and a death spell for any player.",
        notes:
          "Usually the magician replaces the witch; both play together only from 14 players with four (or five) wolves.\nBoth spells can be used in one night (two different targets) or be kept for later.\nA bodyguard blocks a death spell on his protected player; the spell is used up anyway.",
      },
      mayor: {
        what: "A secret role with one ability that is chosen with the role.",
        options:
          "Double vote: the narrator counts the vote of the mayor twice.\nHammer: one night action that kills a wolf.",
        notes:
          "On a wrong target the hammer kills the mayor himself, and the target survives.\nThe hammer is available from 10 players.",
      },
      paranormalInvestigator: {
        what: "Once per game he picks a player; the narrator says whether that player or one of the two nearest living neighbours is a wolf.",
        notes:
          "He may wait for a later night; waiting does not use the ability.\nThe seating order counts as a circle.",
      },
      seer: {
        what: "Looks at one player each night and learns whether that player is a wolf.",
        notes: "There is always exactly one seer.",
      },
      spellcaster: {
        what: "Each night she silences one player for the next day: no speaking, no nominating, no voting.",
        options:
          "Self-pick allowed: she may also silence herself.\nSelf-pick forbidden: she must choose another player.",
        notes: "Never the same player twice in a row.\nA silenced player can still be nominated.",
      },
      tanner: {
        what: "Has no night action. He wins personally when he dies, and the game goes on until the village or the wolves win.",
        options:
          "Win on any death: every death counts, also the wolves, a shot or heartbreak.\nWin by vote only: only a death by the vote of the day counts.",
        notes: "With the vote only: if he leaves because his lover was voted out, he does not win.",
      },
      toughGuy: {
        what: "An unprotected wolf attack only wounds him. He takes part normally the next day and dies at the end of the next night.",
        notes:
          "Poison, the vote, a hunter shot or the death of a lover can kill him earlier.\nThe witch can heal the original attack in the night of the attack.",
      },
      villagers: {
        what: "Plain villagers have no special ability. They play with the village and look for the wolves together.",
        notes: "The number is set automatically from your choice.",
      },
      witch: {
        what: "Wakes after the wolves and the seer, also in the first night. Has one healing potion and one poison for the whole game.",
        notes:
          "Both potions can be used in the same night.\nPoison on a protected player is used up anyway.",
      },
      wolves: {
        what: "The wolves choose a victim every night.",
        notes:
          "Pick how many play; with only one possible number it is fixed.\nThe recommendation fits the roles you chose; it never changes your choice by itself.",
      },
    },
  },
};
