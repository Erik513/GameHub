/** Texts of the shared game building blocks (setup screen, teams, players). */
export const kitTexts = {
  kitSetup: {
    teamsSection: "Teams and players",
    settingsSection: "Game settings",
    infoLabel: "Info about {{setting}}",
  },
  kitTeams: {
    legend: "Teams",
    defaultName: "Team {{number}}",
    nameLabel: "Name of team {{number}}",
    orderLegend: "Team order",
    orderRandom: "Random",
    orderEntered: "As entered",
    orderInfo:
      "Random draws which team starts and how the turns follow. As entered uses the order of the team fields from top to bottom. When replaying with the same setup, an entered order is kept.",
  },
  kitPlayers: {
    title: "Players (optional)",
    titleRequired: "Players",
    summary: "Enter names and split",
    hint: "Enter the names of all players, separated by commas or line breaks. Then split them across the teams at random or by hand. The split is only an overview for you.",
    hintRequired:
      "Enter the names of all players, separated by commas or line breaks. Then split them across the teams at random or by hand. Every team needs at least one player.",
    hintOnly: "Enter the names of all players, separated by commas or line breaks.",
    label: "Player names",
    placeholder: "Anna, Ben, Cara",
    count: "Players: {{count}}",
    draw: "Split randomly into teams",
    assignment: "Players",
    teamOf: "Team of {{player}}",
    unassigned: "Not assigned",
    teams: "Teams",
    nobody: "nobody yet",
  },
};
