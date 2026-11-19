import { useTranslation } from "react-i18next";
import {
  addParticipants,
  chooseNarrator,
  removeParticipant,
  setParticipants,
  type WerewolfLineup,
} from "../../business/games/werewolf/lineup";
import { parsePlayers } from "../../business/shared/players";
import { Icon } from "../components";
import { PlayerAdder, RosterPicker } from "../game-kit";
import { NarratorPicker } from "./NarratorPicker";

interface PlayersTabProps {
  readonly lineup: WerewolfLineup;
  readonly onChange: (lineup: WerewolfLineup) => void;
}

/**
 * The tab "Players": the narrator, the field to add names, the choice from the saved players and the
 * list of everybody who takes part (in alphabetical order; the seats are set in the other tab).
 */
export function PlayersTab({ lineup, onChange }: PlayersTabProps) {
  const { i18n, t } = useTranslation();
  const sorted = [...lineup.participants].sort(new Intl.Collator(i18n.language).compare);

  return (
    <>
      <NarratorPicker
        narrator={lineup.narrator}
        onChoose={(name) => onChange(chooseNarrator(lineup, name))}
        participants={lineup.participants}
      />
      <PlayerAdder onAdd={(input) => onChange(addParticipants(lineup, parsePlayers(input)))} />
      <div className="kit-players__actions">
        <RosterPicker
          onChange={(text) => onChange(setParticipants(lineup, parsePlayers(text)))}
          value={lineup.participants.join(", ")}
        />
      </div>
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
    </>
  );
}
