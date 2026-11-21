/** The rules of Werewolf; the explanations of the single roles are in `werewolfConfig.ts` (info). */
export const werewolfRulesTexts = {
  werewolfRules: {
    title: "Werewolf rules",
    label: "Rules",
    tabGame: "Game",
    tabRoles: "Roles",
    tabExtras: "Options",
    game: {
      goalTitle: "Goal",
      goal: "Werewolf is a game of suspicion and deception. One person leads the game as the narrator, everyone else plays with a secret role. The village wants to find all werewolves, the werewolves want to wipe out the village.",
      teams:
        "Village: Villagers, the seer and most special roles. The village wins as soon as no werewolf is alive.\nWerewolves: They know each other and kill a member of the village every night. They win as soon as there are at least as many werewolves as members of the village side.\nOwn goal: The tanner wins alone if he dies.",
      prepTitle: "Preparation",
      prepSteps:
        "Everyone sits in a circle, the narrator included. You set the seating order in the app: seat 1 is to the left of the narrator, then it goes clockwise.\nThe narrator does not play and has no role. He leads the game and tells the group what happens.\nEach person learns their role in secret and shows it to nobody.",
      nightTitle: "The night",
      nightSteps:
        'Everyone closes their eyes. The narrator calls the roles one after another in a fixed order. Whoever is called opens their eyes and acts silently; then they close them again.\nThe werewolves come first. They agree silently on a victim. In the first night they only get to know each other, unless the wolf attack from night 1 is switched on. If they do not agree in the time the narrator has set, the attack is dropped.\nThe seer points at a person and learns by a silent sign whether they are a werewolf.\nThen come the special roles that are in the game. Their tasks are in the tab "Roles".',
      nightHint: 'The button "{{button}}" in the configuration shows the whole order.',
      morningTitle: "The morning",
      morning:
        "The narrator wakes the village and says who died in the night. Depending on the setting he also names the role.\nWhoever is out watches in silence and no longer votes.",
      dayTitle: "The day",
      daySteps:
        "The village discusses whom it distrusts.\nA living person nominates someone, a second person supports the nomination.\nThe named person defends themselves briefly.\nAll the living vote at the same time with their thumbs. A strict majority sends the person out, and the day ends.\nWith a tie or less support the discussion goes on and a new nomination is possible. When the time limit the narrator has set is reached, he can end the day without anyone leaving.",
      winTitle: "Who wins",
      win: "The village wins as soon as all werewolves are out.\nThe werewolves win as soon as at least as many werewolves as members of the village side are alive, also at 1 to 1 or 2 to 2. The seer belongs to the village side.\nLovers count for their own side.\nThe tanner wins alone if he dies: depending on the option at every elimination or only by a vote.",
    },
    roles: {
      intro:
        "Every role has a minimum number of players. The narrator sets in the configuration which roles play; the werewolves, the seer and the villagers are always there.",
      coreTitle: "Basic roles",
      specialTitle: "Special roles",
    },
    extras: {
      addonsTitle: "Extras",
      addonsIntro:
        "Extras are no roles of their own, they come into the game in addition. They also need a minimum number of players.",
      settingsTitle: "Settings",
      settings:
        "Wolf attack: The werewolves attack from night 1 or only from night 2. Until then they only get to know each other.\nRoles after leaving: The role of a person who is out is revealed or kept secret. With secret roles the narrator also calls roles that are out, as a cover.\nWerewolves: How many play depends on the number of players. If several numbers are possible you choose; a recommendation fits the chosen roles but never changes your choice by itself.",
      fixedTitle: "Fixed roles",
      fixed:
        "You decide exactly which roles play. Tap a role to take it into the game; tap it again to leave it out.\nRoles with options are chosen through their variants.\nRoles that do not fit the chosen ones, or for which no place is left, are locked; the reason is in the info window.\nThe app fills the remaining places with villagers.",
      variableTitle: "Variable roles",
      variable:
        'You only set limits, the app draws the line-up at the start. Every role and every extra stands in one of three boxes: Must be in the game, May be in the game or Should not be in the game. Drag them into a box or tap them. Extras are bluish.\nMust: These roles always play.\nMay: The draw takes from these. With "At least" and "At most" you set how many of these special roles play; every number in between is equally likely.\nEvery role on "May" has the same chance. If both options of a role are on "May", one is drawn; the bodyguard and the night guest count as one role, and so do the witch and the magician where they may not play together.\nExtras on "May" are drawn one by one, each with the same chance to be in the game or not.\nShould not: These roles never play.\nIf several wolf counts are chosen, the wolf count is drawn, too.\nAt night the narrator wakes only the roles that are really in the game.',
      toolsTitle: "Helps in the app",
      tools:
        "Wake-up order: Shows in which order the narrator wakes the roles at night.\nShow seat circle: Shows the seating order as a circle.\nInfo buttons: Every role and every extra explains itself.",
    },
  },
};
