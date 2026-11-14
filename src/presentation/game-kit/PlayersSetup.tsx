import { useTranslation } from "react-i18next";
import { addPlayersToText, removePlayerFromText } from "../../business/shared/playerList";
import { parsePlayers } from "../../business/shared/players";
import { Button } from "../components";
import { PlayerAdder, PlayerChip, PlayerChips } from "./PlayerChips";
import { RosterPicker } from "./RosterPicker";
import { useTeamSetupMemory } from "./TeamSetupMemoryContext";

interface PlayersSetupProps {
  readonly onChange: (text: string) => void;
  /** The player names as typed (one per line or separated by commas). */
  readonly value: string;
}

/** The player list of a game without teams: add players, remove them, see how many there are. */
export function PlayersSetup({ onChange, value }: PlayersSetupProps) {
  const { t } = useTranslation();
  const players = parsePlayers(value);
  // The players of the last game of any game can be taken over.
  const savedText = useTeamSetupMemory()?.read()?.playersText;
  const showLoad = savedText !== undefined && savedText.trim() !== "" && savedText !== value;

  return (
    <>
      {showLoad && (
        <Button onClick={() => onChange(savedText)} variant="secondary">
          {t("kitPlayers.loadLast")}
        </Button>
      )}
      {players.length > 0 && (
        <PlayerChips label={t("kitPlayers.count", { count: players.length })}>
          {players.map((player) => (
            <PlayerChip
              key={player}
              name={player}
              onRemove={() => onChange(removePlayerFromText(value, player))}
            />
          ))}
        </PlayerChips>
      )}
      <PlayerAdder onAdd={(input) => onChange(addPlayersToText(value, input))} />
      <div className="kit-players__actions">
        <RosterPicker onChange={onChange} value={value} />
      </div>
      {players.length > 0 && (
        <small className="kit-players__count" role="status">
          {t("kitPlayers.count", { count: players.length })}
        </small>
      )}
    </>
  );
}
