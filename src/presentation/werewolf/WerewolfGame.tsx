import { useState } from "react";
import { emptyWerewolfLineup } from "../../business/games/werewolf/lineup";
import { WerewolfLineup } from "./WerewolfLineup";

/**
 * The main window of Werewolf. For now it holds the line-up (participants, narrator, seats); the
 * configuration, the role assignment and the narrator view follow in the next development steps.
 */
export function WerewolfGame() {
  const [lineup, setLineup] = useState(emptyWerewolfLineup);
  return <WerewolfLineup lineup={lineup} onChange={setLineup} />;
}
