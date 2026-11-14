import { useTranslation } from "react-i18next";
import { parsePlayers, splitIntoTeams } from "../../business/shared/players";
import {
  clampTeamCount,
  defaultTeamRules,
  type TeamRules,
  type TeamSetupValue,
} from "../../business/shared/teamSetup";
import { Button } from "../components";
import { ChoiceGroup } from "./ChoiceGroup";
import { TeamOrder } from "./TeamOrder";
import { dropAttribute, usePlayerDrag, type DropTarget } from "./usePlayerDrag";

interface TeamsSetupProps {
  readonly onChange: (value: TeamSetupValue) => void;
  readonly rules?: TeamRules;
  readonly value: TeamSetupValue;
  /** Whether the game has a player list; the players are then drawn into the teams here. */
  readonly withPlayers?: boolean;
}

/**
 * Teams of a game: how many, a button that draws the players into the teams, one card per team with
 * its name and its players, and the playing order of the teams. A player who has no team yet waits
 * in a card "No team". A player is dragged into a team (mouse or finger) and moved the same way; a
 * tap on a player in a team takes him out again, back to "No team". The value is controlled, the
 * game reads the result with `buildTeams`.
 */
export function TeamsSetup({
  onChange,
  rules = defaultTeamRules,
  value,
  withPlayers = true,
}: TeamsSetupProps) {
  const { i18n, t } = useTranslation();
  const count = clampTeamCount(value.count, rules);
  const counts = Array.from(
    { length: rules.maxTeams - rules.minTeams + 1 },
    (_, index) => rules.minTeams + index,
  );
  const update = (patch: Partial<TeamSetupValue>) => onChange({ ...value, ...patch });

  // The players of a team are always shown in alphabetical order of the interface language.
  const alphabetical = new Intl.Collator(i18n.language).compare;
  const everyone = parsePlayers(value.playersText).sort(alphabetical);
  const teamOf = (player: string) => {
    const index = value.assignment[player];
    return index !== undefined && index < count ? index : undefined;
  };
  const teamName = (index: number) => {
    const typed = value.names[index]?.trim();
    return typed !== undefined && typed !== ""
      ? typed
      : t("kitTeams.defaultName", { number: index + 1 });
  };
  const withoutTeam = withPlayers ? everyone.filter((player) => teamOf(player) === undefined) : [];
  const drawn = everyone.length > 0 && withoutTeam.length === 0;

  function draw() {
    const assignment: Record<string, number> = {};
    splitIntoTeams(everyone, count).forEach((team, index) => {
      for (const player of team) assignment[player] = index;
    });
    update({ assignment });
  }

  function place(player: string, target: DropTarget) {
    const assignment = { ...value.assignment };
    if (target === "none") delete assignment[player];
    else assignment[player] = target;
    update({ assignment });
  }

  const dragging = usePlayerDrag({
    onDrop: place,
    // A tap on a player in a team takes him out of it; a player without a team stays where he is.
    onTap: (player) => {
      if (teamOf(player) !== undefined) place(player, "none");
    },
  });

  const names = (players: readonly string[]) => (
    <div className="kit-team__names">
      {players.map((player) => (
        <button
          className="kit-name"
          key={player}
          onClick={dragging.tap(player)}
          onPointerDown={dragging.startDrag(player)}
          type="button"
        >
          {player}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <ChoiceGroup
        initial={String(count)}
        legend={t("kitTeams.legend")}
        name="teamCount"
        onChange={(next) => update({ count: Number(next) })}
        options={counts.map((number) => ({ value: String(number), label: String(number) }))}
        value={String(count)}
      />
      {withPlayers && everyone.length > 0 && (
        <Button disabled={everyone.length < 2} onClick={draw} variant="secondary">
          {t(drawn ? "kitTeams.redraw" : "kitTeams.draw")}
        </Button>
      )}
      <div className="kit-teams">
        {Array.from({ length: count }, (_, index) => {
          const members = withPlayers ? everyone.filter((player) => teamOf(player) === index) : [];
          return (
            <div
              {...(withPlayers ? { [dropAttribute]: String(index) } : {})}
              className="kit-team"
              data-over={dragging.over === index || undefined}
              key={index}
            >
              <input
                aria-label={t("kitTeams.nameLabel", { number: index + 1 })}
                autoComplete="off"
                className="field__input"
                maxLength={rules.maxNameLength}
                onChange={(event) => {
                  const next = Array.from({ length: count }, (_, at) => value.names[at] ?? "");
                  next[index] = event.target.value;
                  update({ names: next });
                }}
                placeholder={t("kitTeams.defaultName", { number: index + 1 })}
                value={value.names[index] ?? ""}
              />
              {withPlayers && everyone.length > 0 && names(members)}
            </div>
          );
        })}
        {withPlayers && (withoutTeam.length > 0 || dragging.drag !== undefined) && (
          <div
            {...{ [dropAttribute]: "none" }}
            className="kit-team kit-team--none"
            data-over={dragging.over === "none" || undefined}
          >
            <h3>
              {t("kitPlayers.noTeam")} <span>({t("kitTeams.dragHint")})</span>
            </h3>
            {names(withoutTeam)}
          </div>
        )}
      </div>
      <TeamOrder
        count={count}
        onChange={(order) => update({ order })}
        order={value.order}
        teamName={teamName}
      />
      {dragging.drag && (
        <div
          aria-hidden="true"
          className="kit-name kit-name--ghost"
          style={{ left: dragging.drag.x, top: dragging.drag.y }}
        >
          {dragging.drag.player}
        </div>
      )}
    </>
  );
}
