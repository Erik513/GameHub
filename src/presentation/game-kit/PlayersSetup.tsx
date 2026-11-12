import { useId } from "react";
import { useTranslation } from "react-i18next";
import { parsePlayers } from "../../business/shared/players";
import { Button } from "../components";
import { PlayerListField } from "./PlayerListField";
import { useTeamSetupMemory } from "./TeamSetupMemoryContext";

interface PlayersSetupProps {
  readonly onChange: (text: string) => void;
  /** The player names as typed (one per line or separated by commas). */
  readonly value: string;
}

/** The player list of a game without teams: type the names, see how many players there are. */
export function PlayersSetup({ onChange, value }: PlayersSetupProps) {
  const { t } = useTranslation();
  const count = parsePlayers(value).length;
  const headingId = useId();
  // The players of the last game of any game can be taken over.
  const savedText = useTeamSetupMemory()?.read()?.playersText;
  const showLoad = savedText !== undefined && savedText.trim() !== "" && savedText !== value;

  return (
    <section aria-labelledby={headingId} className="kit-players">
      <h3 id={headingId}>{t("kitPlayers.titleRequired")}</h3>
      <div className="kit-players__body">
        {showLoad && (
          <Button onClick={() => onChange(savedText)} variant="secondary">
            {t("kitPlayers.loadLast")}
          </Button>
        )}
        <PlayerListField hint={t("kitPlayers.hintOnly")} onChange={onChange} value={value} />
        {count > 0 && (
          <small className="kit-players__count" role="status">
            {t("kitPlayers.count", { count })}
          </small>
        )}
      </div>
    </section>
  );
}
