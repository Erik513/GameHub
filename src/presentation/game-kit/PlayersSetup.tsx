import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  addPlayersToText,
  duplicatePlayerNames,
  removePlayerFromText,
} from "../../business/shared/playerList";
import { parsePlayers } from "../../business/shared/players";
import type { TeamSetupValue } from "../../business/shared/teamSetup";
import { Icon, Toast } from "../components";
import { PlayerAdder } from "./PlayerAdder";
import { RosterRow } from "./RosterRow";
import { TabPane } from "./TabPane";

interface PlayersSetupProps {
  /** Controls above the field to add players, for example to load the last players. They stay in place, too. */
  readonly above?: ReactNode;
  readonly onChange: (value: TeamSetupValue) => void;
  readonly value: TeamSetupValue;
}

/**
 * The player list of a game: at the top the button to choose players from the saved players with their number, then
 * a field to add players by name and one row per player with a button to remove him. The teams are set up in the box
 * "Teams". The value is controlled. The controls stay in place and only the list of the players scrolls,
 * in whole rows (so no player is cut off).
 */
export function PlayersSetup({ above, onChange, value }: PlayersSetupProps) {
  const { i18n, t } = useTranslation();
  const [duplicate, setDuplicate] = useState<{ id: number; names: string } | null>(null);
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
          {/* At the top: the players from the saved list and how many there are. */}
          <RosterRow count={players.length} onChange={setText} value={value.playersText} />
          {above}
          <PlayerAdder
            onAdd={(input) => {
              // A name that is in the game already is not added twice; the narrator is told.
              const names = duplicatePlayerNames(value.playersText, input);
              if (names.length > 0)
                setDuplicate((current) => ({
                  id: (current?.id ?? 0) + 1,
                  names: names.join(", "),
                }));
              setText(addPlayersToText(value.playersText, input));
            }}
          />
          {duplicate && (
            <Toast key={duplicate.id} tone="error">
              {t("kitPlayers.duplicate", { names: duplicate.names })}
            </Toast>
          )}
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
