import { useMemo, useState } from "react";
import {
  emptyFixedDraft,
  normalizeFixedDraft,
  parseSavedFixedDraft,
} from "../../business/games/werewolf/fixedConfiguration";
import {
  chooseNarrator,
  emptyWerewolfLineup,
  parseSavedLineup,
  setParticipants,
} from "../../business/games/werewolf/lineup";
import {
  emptyVariableDraft,
  normalizeVariableDraft,
  parseSavedVariableDraft,
} from "../../business/games/werewolf/variableConfiguration";
import { useGameExit, useGameRulesButton } from "../GameChrome";
import { usePersistentState } from "../game-kit";
import { WerewolfConfiguration, type RolesMode } from "./WerewolfConfiguration";
import { NarratorView } from "./NarratorView";
import { useWerewolfSession } from "./useWerewolfSession";
import { WerewolfLineup } from "./WerewolfLineup";
import { WerewolfRulesDialog } from "./WerewolfRules";

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
  // Both are remembered between games, so a new game starts with the last line-up and configuration.
  const [lineup, setLineup] = usePersistentState(
    "werewolf.lineup",
    initialLineup,
    parseSavedLineup,
  );
  const [savedDraft, setDraft] = usePersistentState(
    "werewolf.configuration",
    () => emptyFixedDraft,
    parseSavedFixedDraft,
  );
  // What was saved may not fit the players of today: the roles that no longer fit are taken back.
  const draft = useMemo(
    () => normalizeFixedDraft(lineup.seats.length, savedDraft),
    [lineup.seats.length, savedDraft],
  );
  // The draft of the variable roles is kept apart from the fixed one and saved apart; so is the kind of roles.
  const [variableDraft, setVariableDraft] = usePersistentState(
    "werewolf.variableConfiguration",
    () => emptyVariableDraft,
    parseSavedVariableDraft,
  );
  const [mode, setMode] = usePersistentState<RolesMode>(
    "werewolf.rolesMode",
    () => "fixed",
    (raw) => (raw === "fixed" || raw === "variable" ? raw : undefined),
  );
  const normalizedVariable = useMemo(
    () => normalizeVariableDraft(lineup.seats.length, variableDraft),
    [lineup.seats.length, variableDraft],
  );
  const game = useWerewolfSession();
  const [configuring, setConfiguring] = useState(false);
  // The rules stay reachable from the header in both views.
  const [rulesOpen, setRulesOpen] = useState(false);
  useGameRulesButton(true, () => setRulesOpen(true));
  // The Back key of the system asks before it leaves a running game, as in the other games.
  useGameExit(game.session !== null, game.end);

  const view = game.session ? (
    <NarratorView
      onEnd={game.end}
      onRules={() => setRulesOpen(true)}
      onSession={game.replace}
      session={game.session}
    />
  ) : configuring ? (
    <WerewolfConfiguration
      draft={draft}
      onChange={setDraft}
      mode={mode}
      onDone={() => setConfiguring(false)}
      onModeChange={setMode}
      onVariableChange={setVariableDraft}
      players={lineup.seats.length}
      variableDraft={normalizedVariable}
    />
  ) : (
    <WerewolfLineup
      lineup={lineup}
      onChange={(next) => {
        setLineup(next);
        // Fewer players take back the roles that no longer fit, so the configuration stays playable.
        setDraft((current) => normalizeFixedDraft(next.seats.length, current));
      }}
      onOpenConfiguration={() => setConfiguring(true)}
      onStart={() =>
        game.start({
          fixedDraft: draft,
          lineup,
          mode,
          random: Math.random,
          variableDraft: normalizedVariable,
        })
      }
    />
  );
  return (
    <>
      {view}
      <WerewolfRulesDialog onClose={() => setRulesOpen(false)} open={rulesOpen} />
    </>
  );
}
