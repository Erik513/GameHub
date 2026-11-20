import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { addPlayersToText, removePlayerFromText } from "../../business/shared/playerList";
import { parsePlayers } from "../../business/shared/players";
import type { TeamSetupValue } from "../../business/shared/teamSetup";
import { Icon } from "../components";
import { PlayerAdder } from "./PlayerAdder";
import { RosterPicker } from "./RosterPicker";
import { TabPane } from "./TabPane";

interface PlayersSetupProps {
  /** Controls above the field to add players, for example to load the last players. They stay in place, too. */
  readonly above?: ReactNode;
  readonly onChange: (value: TeamSetupValue) => void;
  readonly value: TeamSetupValue;
}

/**
 * The player list of a game: one row per player with a button to remove him, a field to add players
 * by name and a button to choose them from the saved players. The teams are set up in the box
 * "Teams". The value is controlled. The controls stay in place and only the list of the players scrolls,
 * in whole rows (so no player is cut off).
 */
export function PlayersSetup({ above, onChange, value }: PlayersSetupProps) {
  const { i18n, t } = useTranslation();
  // The list is always in alphabetical order of the interface language.
  const players = parsePlayers(value.playersText).sort(new Intl.Collator(i18n.language).compare);

  function setText(playersText: string) {
    // Assignments of names that are no longer in the list are dropped.
    const names = new Set(parsePlayers(playersText));
    const assignment = Object.fromEntries(
      Object.entries(value.assignment).filter(([player]) => names.has(player)),
    );
    onChange({ ...value, assignment, playersText });
  }

  return (
    <TabPane
      header={
        <div className="kit-pane__stack">
          {above}
          <PlayerAdder onAdd={(input) => setText(addPlayersToText(value.playersText, input))} />
          <div className="kit-players__actions">
            <RosterPicker onChange={setText} value={value.playersText} />
          </div>
        </div>
      }
      wholeRows
    >
      {players.length > 0 && (
        <ul aria-label={t("kitPlayers.count", { count: players.length })} className="kit-members">
          {players.map((player) => (
            <li className="kit-member" key={player}>
              <span className="kit-member__name">{player}</span>
              <button
                aria-label={t("kitPlayers.removeLabel", { player })}
                className="kit-member__remove"
                onClick={() => setText(removePlayerFromText(value.playersText, player))}
                type="button"
              >
                <Icon name="trash" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </TabPane>
  );
}
