import { useState } from "react";
import { emptyFixedDraft } from "../../business/games/werewolf/fixedConfiguration";
import {
  chooseNarrator,
  emptyWerewolfLineup,
  setParticipants,
} from "../../business/games/werewolf/lineup";
import { WerewolfConfiguration } from "./WerewolfConfiguration";
import { WerewolfLineup } from "./WerewolfLineup";

/**
 * While the game is developed (the dev server, not the tests and not a build) the line-up starts with
 * twelve players and the narrator Max, so a screen can be looked at without setting this up by hand first.
 */
function initialLineup() {
  if (!import.meta.env.DEV || import.meta.env.MODE === "test") return emptyWerewolfLineup;
  const names = "Anna Ben Cleo Dora Emil Finn Gina Hans Ida Jan Kim Lea Max".split(" ");
  return chooseNarrator(setParticipants(emptyWerewolfLineup, names), "Max");
}

/**
 * The main window of Werewolf. For now it holds the line-up (participants, narrator, seats) and the
 * configuration of the fixed roles; the role assignment and the narrator view follow in the next
 * development steps. Both are kept while the narrator goes back and forth.
 */
export function WerewolfGame() {
  const [lineup, setLineup] = useState(initialLineup);
  const [draft, setDraft] = useState(emptyFixedDraft);
  const [configuring, setConfiguring] = useState(false);

  if (configuring) {
    return (
      <WerewolfConfiguration
        draft={draft}
        onChange={setDraft}
        onDone={() => setConfiguring(false)}
        players={lineup.seats.length}
      />
    );
  }
  return (
    <WerewolfLineup
      lineup={lineup}
      onChange={setLineup}
      onOpenConfiguration={() => setConfiguring(true)}
    />
  );
}
