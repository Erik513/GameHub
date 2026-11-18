import { TabooResultView } from "./TabooResultView";
import { TabooRound } from "./TabooRound";
import { TabooTiebreakOverview } from "./TabooTiebreakOverview";
import { TabooTiebreakRound } from "./TabooTiebreakRound";
import { TabooTiebreakWrapUp } from "./TabooTiebreakWrapUp";
import { TabooTurnOverview } from "./TabooTurnOverview";
import type { TabooClassicGame } from "./useTabooClassicGame";

interface TabooClassicScreensProps {
  readonly game: TabooClassicGame;
  /** Whether the next turn found no cards or the generation brought none (shown on the overview). */
  readonly generationEmpty: boolean;
  /** Gives the running game up and returns to the main menu (from the pause card). */
  readonly onEndGame: () => void;
  /** Back to the main menu with an empty setup. */
  readonly onNewSetup: () => void;
  /** The same setup again: back to the line-up, the cards are reused. */
  readonly onSameSetup: () => void;
}

/**
 * The screens of a game in the mode "Klassisch", one at a time as the game goes: the overview before
 * every turn, the running turn, the tiebreak with its overview and attempts, and the final result.
 * The state and its rules live in `useTabooClassicGame`.
 */
export function TabooClassicScreens({
  game,
  generationEmpty,
  onEndGame,
  onNewSetup,
  onSameSetup,
}: TabooClassicScreensProps) {
  const { dispatch, ended, finished, round, tiebreak, tiebreakState } = game;
  return (
    <>
      {tiebreakState && !tiebreakState.active && (
        <TabooTiebreakOverview
          noCards={tiebreak.noCards}
          onBegin={tiebreak.begin}
          onNewSetup={onNewSetup}
          onRevise={tiebreak.revise}
          state={tiebreakState}
        />
      )}
      {tiebreakState?.active && round?.startedAt !== undefined && (
        <TabooTiebreakRound
          active={tiebreakState.active}
          dispatch={dispatch}
          onEndGame={onEndGame}
          onResume={game.togglePause}
          pausedAt={round.pausedAt}
          pausedMs={round.pausedMs ?? 0}
          pickReplacement={tiebreak.pickReplacement}
          startedAt={round.startedAt}
          teamName={tiebreakState.configuration.teams[tiebreakState.active.teamIndex]?.name ?? ""}
        />
      )}
      {finished?.tiebreak && !game.wrapUpDone && (
        <TabooTiebreakWrapUp
          finished={finished}
          onRevise={tiebreak.revise}
          onShow={game.setWrapUpDone}
        />
      )}
      {finished && (!finished.tiebreak || game.wrapUpDone) && (
        <TabooResultView finished={finished} onNewSetup={onNewSetup} onSameSetup={onSameSetup} />
      )}
      {round?.state.status === "roundRunning" && (
        <TabooRound
          deadline={round.deadline}
          dispatch={dispatch}
          onEndGame={onEndGame}
          onResume={game.togglePause}
          onRestart={game.restartTurn}
          restartUnavailable={game.restartUnavailable}
          paused={round.pausedAt !== undefined}
          state={round.state}
        />
      )}
      {game.overview && (
        <TabooTurnOverview
          canFinishEarly={game.canFinishEarly}
          deckEmpty={game.deckEmpty}
          ended={ended}
          generationEmpty={generationEmpty}
          onFinish={() => dispatch({ type: "finishGame" })}
          onNewSetup={onNewSetup}
          onRevise={(cardId, outcome) =>
            ended && dispatch({ type: "reviseResult", turn: ended.turn, cardId, outcome })
          }
          onStart={() => game.startRound()}
          overview={game.overview}
        />
      )}
    </>
  );
}
