import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  addParticipants,
  chooseNarrator,
  maxWerewolfParticipants,
  minWerewolfParticipants,
  removeParticipant,
  setParticipants,
  type WerewolfLineup,
} from "../../business/games/werewolf/lineup";
import { duplicatePlayerNames } from "../../business/shared/playerList";
import { parsePlayers } from "../../business/shared/players";
import { Icon, Toast } from "../components";
import { PlayerAdder, RosterRow, TabPane } from "../game-kit";
import { NarratorPicker } from "./NarratorPicker";

interface PlayersTabProps {
  readonly lineup: WerewolfLineup;
  readonly onChange: (lineup: WerewolfLineup) => void;
}

/**
 * The tab "Players": the choice from the saved players with the number of people, the narrator, the field to add names and the
 * list of everybody who takes part (in alphabetical order; the seats are set in the other tab).
 */
export function PlayersTab({ lineup, onChange }: PlayersTabProps) {
  const { i18n, t } = useTranslation();
  const [duplicate, setDuplicate] = useState<{ id: number; names: string } | null>(null);
  const sorted = [...lineup.participants].sort(new Intl.Collator(i18n.language).compare);

  return (
    <TabPane
      wholeRows
      header={
        <div className="ww-players-head">
          {/* At the top: the players from the saved list and how many take part; then the narrator and single names. */}
          <RosterRow
            count={lineup.participants.length}
            countLabel={t("werewolfLineup.countLabel", {
              count: lineup.participants.length,
              maximum: maxWerewolfParticipants,
            })}
            limit={maxWerewolfParticipants}
            minimum={minWerewolfParticipants}
            onChange={(text) => onChange(setParticipants(lineup, parsePlayers(text)))}
            value={lineup.participants.join(", ")}
          />
          <NarratorPicker
            narrator={lineup.narrator}
            onChoose={(name) => onChange(chooseNarrator(lineup, name))}
            participants={lineup.participants}
          />
          <PlayerAdder
            onAdd={(input) => {
              // A name that takes part already is not added twice; the narrator is told.
              const names = duplicatePlayerNames(lineup.participants.join(", "), input);
              if (names.length > 0)
                setDuplicate((current) => ({
                  id: (current?.id ?? 0) + 1,
                  names: names.join(", "),
                }));
              onChange(addParticipants(lineup, parsePlayers(input)));
            }}
            room={maxWerewolfParticipants - lineup.participants.length}
          />
          {duplicate && (
            <Toast key={duplicate.id} tone="error">
              {t("kitPlayers.duplicate", { names: duplicate.names })}
            </Toast>
          )}
        </div>
      }
    >
      {sorted.length > 0 && (
        <ul
          aria-label={t("werewolfLineup.listLabel", { count: sorted.length })}
          className="kit-members"
        >
          {sorted.map((name) => (
            <li className="kit-member" key={name}>
              <span className="kit-member__name">{name}</span>
              {name === lineup.narrator && (
                <span className="ww-badge">{t("werewolfLineup.narratorBadge")}</span>
              )}
              <button
                aria-label={t("kitPlayers.removeLabel", { player: name })}
                className="kit-member__remove"
                onClick={() => onChange(removeParticipant(lineup, name))}
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
