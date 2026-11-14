import { useTranslation } from "react-i18next";
import {
  addPlayersToText,
  removePlayerFromText,
  smallestTeamIndex,
} from "../../business/shared/playerList";
import { parsePlayers, splitIntoTeams } from "../../business/shared/players";
import { sameTeamSetup } from "../../business/shared/savedTeamSetup";
import {
  clampTeamCount,
  defaultTeamRules,
  type TeamOrderMode,
  type TeamRules,
  type TeamSetupValue,
} from "../../business/shared/teamSetup";
import { Button } from "../components";
import { ChoiceGroup } from "./ChoiceGroup";
import { PlayerAdder, PlayerChip, PlayerChips } from "./PlayerChips";
import { RosterPicker } from "./RosterPicker";
import { useTeamSetupMemory } from "./TeamSetupMemoryContext";
import { dropAttribute, usePlayerDrag, type DropTarget } from "./usePlayerDrag";

interface TeamsSetupProps {
  readonly onChange: (value: TeamSetupValue) => void;
  /** Off shows only the teams; otherwise the players are added and moved into the teams. */
  readonly players?: "off" | "optional" | "required";
  readonly rules?: TeamRules;
  readonly value: TeamSetupValue;
}

/**
 * Teams of a game: how many, one card per team with its name and a field for its players, the
 * players who have no team yet, and the order of the teams. Players are dragged into a team (mouse
 * or finger); a tap on a player in a team takes him out again, a tap on a player without a team puts
 * him into the smallest team. The value is controlled, the game reads the result with `buildTeams`.
 */
export function TeamsSetup({
  onChange,
  players = "optional",
  rules = defaultTeamRules,
  value,
}: TeamsSetupProps) {
  const { t } = useTranslation();
  const count = clampTeamCount(value.count, rules);
  const counts = Array.from(
    { length: rules.maxTeams - rules.minTeams + 1 },
    (_, index) => rules.minTeams + index,
  );
  const update = (patch: Partial<TeamSetupValue>) => onChange({ ...value, ...patch });
  // The last group of any game can be taken over; the button only shows when it would change something.
  const remembered = useTeamSetupMemory()?.read();
  // The remembered group is fitted to the limits of this game before it is compared or taken over.
  const saved = remembered && { ...remembered, count: clampTeamCount(remembered.count, rules) };
  const showLoad = saved !== undefined && !sameTeamSetup(saved, value);

  const everyone = parsePlayers(value.playersText);
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

  function changeText(text: string) {
    // Assignments of names that are no longer in the list are dropped.
    const names = new Set(parsePlayers(text));
    const assignment = Object.fromEntries(
      Object.entries(value.assignment).filter(([player]) => names.has(player)),
    );
    update({ assignment, playersText: text });
  }

  function place(player: string, target: DropTarget | undefined) {
    const assignment = { ...value.assignment };
    if (target === undefined || target === "none") delete assignment[player];
    else assignment[player] = target;
    update({ assignment });
  }

  const dragging = usePlayerDrag({
    onDrop: place,
    onTap: (player) =>
      place(
        player,
        teamOf(player) === undefined ? smallestTeamIndex(value.assignment, count) : "none",
      ),
  });

  function draw() {
    const assignment: Record<string, number> = {};
    splitIntoTeams(everyone, count).forEach((team, index) => {
      for (const player of team) assignment[player] = index;
    });
    update({ assignment });
  }

  const chip = (player: string) => {
    const team = teamOf(player);
    return (
      <PlayerChip
        key={player}
        name={player}
        onPointerDown={dragging.startDrag(player)}
        onRemove={() => changeText(removePlayerFromText(value.playersText, player))}
        onTap={dragging.tap(player)}
        tapLabel={t("kitPlayers.chipLabel", {
          player,
          team: team === undefined ? t("kitPlayers.noTeam") : teamName(team),
        })}
      />
    );
  };
  const withoutTeam = everyone.filter((player) => teamOf(player) === undefined);
  const showNoTeam = withoutTeam.length > 0 || dragging.drag !== undefined;

  return (
    <>
      {showLoad && (
        <Button onClick={() => onChange(saved)} variant="secondary">
          {t("kitTeams.loadLast")}
        </Button>
      )}
      <ChoiceGroup
        initial={String(count)}
        legend={t("kitTeams.legend")}
        name="teamCount"
        onChange={(next) => update({ count: Number(next) })}
        options={counts.map((number) => ({ value: String(number), label: String(number) }))}
        value={String(count)}
      />
      <div className="kit-teams">
        {Array.from({ length: count }, (_, index) => {
          const members = everyone.filter((player) => teamOf(player) === index);
          return (
            <section className="kit-team" key={index}>
              <input
                aria-label={t("kitTeams.nameLabel", { number: index + 1 })}
                autoComplete="off"
                className="field__input"
                maxLength={rules.maxNameLength}
                onChange={(event) => {
                  const names = Array.from({ length: count }, (_, at) => value.names[at] ?? "");
                  names[index] = event.target.value;
                  update({ names });
                }}
                placeholder={t("kitTeams.defaultName", { number: index + 1 })}
                value={value.names[index] ?? ""}
              />
              {players !== "off" && (
                <div
                  {...{ [dropAttribute]: String(index) }}
                  className="kit-drop"
                  data-over={dragging.over === index || undefined}
                >
                  {members.length > 0 ? (
                    <PlayerChips label={teamName(index)}>{members.map(chip)}</PlayerChips>
                  ) : (
                    <span className="kit-drop__hint">{t("kitPlayers.dropHint")}</span>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>
      {players !== "off" && (
        <>
          {showNoTeam && (
            <section className="kit-team kit-team--none">
              <h3>{t("kitPlayers.noTeam")}</h3>
              <div
                {...{ [dropAttribute]: "none" }}
                className="kit-drop kit-drop--none"
                data-over={dragging.over === "none" || undefined}
              >
                <PlayerChips label={t("kitPlayers.noTeam")}>{withoutTeam.map(chip)}</PlayerChips>
              </div>
            </section>
          )}
          <PlayerAdder onAdd={(input) => changeText(addPlayersToText(value.playersText, input))} />
          <div className="kit-players__actions">
            <RosterPicker onChange={changeText} value={value.playersText} />
            <Button disabled={everyone.length < 2} onClick={draw} variant="secondary">
              {t("kitPlayers.draw")}
            </Button>
          </div>
        </>
      )}
      <ChoiceGroup
        info={{
          closeLabel: t("settings.close"),
          label: t("kitSetup.infoLabel", { setting: t("kitTeams.orderLegend") }),
          text: t("kitTeams.orderInfo"),
          title: t("kitTeams.orderLegend"),
        }}
        initial={value.order}
        legend={t("kitTeams.orderLegend")}
        name="teamOrder"
        onChange={(next) => update({ order: next === "entered" ? "entered" : "random" })}
        options={(["random", "entered"] as const satisfies readonly TeamOrderMode[]).map(
          (mode) => ({
            value: mode,
            label: t(mode === "random" ? "kitTeams.orderRandom" : "kitTeams.orderEntered"),
          }),
        )}
        value={value.order}
      />
      {dragging.drag && (
        <div
          aria-hidden="true"
          className="kit-chip kit-chip--ghost"
          style={{ left: dragging.drag.x, top: dragging.drag.y }}
        >
          <span className="kit-chip__name">{dragging.drag.player}</span>
        </div>
      )}
    </>
  );
}
